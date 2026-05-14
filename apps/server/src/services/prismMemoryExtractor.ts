/**
 * prismMemoryExtractor.ts — Prism Memory Extractor v2
 *
 * MemPalace-inspired extraction pipeline adapted for UserMap/Prism.
 *
 * Architecture mapping (MemPalace → UserMap):
 *   Wings      → Prism Nodes (top-level knowledge areas)
 *   Halls      → Memory Categories (decision, preference, milestone, problem, emotional)
 *   Rooms      → Topics within a node
 *   Drawers    → Memory Units (stored in prism_memory_units table)
 *   L3 Search  → FTS over prism_memory_units (memory_units_fts)
 *
 * Extraction strategy (ported from MemPalace general_extractor.py):
 *   - No LLM required. Pure keyword/pattern heuristics.
 *   - 5 memory categories with scored regex marker sets.
 *   - Sentence/paragraph segmentation, scoring, disambiguation.
 *   - Confidence scoring (0.0–1.0).
 *   - SHA-256 content hash for exact dedup; Jaccard similarity for near-dedup.
 *
 * Provenance and conflict rules (UserMap constraints):
 *   - Every memory unit records its source (tool, document_id, job_id, connector).
 *   - Conflict detection: if a new preference/decision contradicts an existing one
 *     on the same topic, both are flagged (never silently overwritten).
 *   - Canonical DB is authoritative; no mock data permitted at runtime.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryCategory =
  | 'decision'
  | 'preference'
  | 'milestone'
  | 'problem'
  | 'emotional'
  | 'general';

export interface ExtractedMemory {
  /** Verbatim content of the memory unit (≥ 20 chars). */
  content: string;
  /** Classified category. */
  category: MemoryCategory;
  /** 0.0–1.0 — derived from marker match density. */
  confidence: number;
  /** Index of the originating segment within the source text. */
  chunk_index: number;
  /** SHA-256 of normalised content — used for exact-duplicate detection. */
  dedup_hash: string;
}

export interface ProvenanceInfo {
  source_tool: string;       // e.g. 'import', 'slack', 'connector'
  source_doc_id?: number;    // row id in documents table
  source_ref?: string;       // e.g. 'job:42', 'connector:slack'
  filename?: string;
  job_id?: number;
  connector?: string;
}

export interface DeduplicationResult {
  is_duplicate: boolean;
  duplicate_of?: number;     // id in prism_memory_units
  similarity?: number;       // 0.0–1.0 Jaccard
}

// ---------------------------------------------------------------------------
// Marker sets (ported from MemPalace general_extractor.py)
// ---------------------------------------------------------------------------

const DECISION_MARKERS: RegExp[] = [
  /\blet'?s (use|go with|try|pick|choose|switch to)\b/gi,
  /\bwe (should|decided|chose|went with|picked|settled on)\b/gi,
  /\bi'?m going (to|with)\b/gi,
  /\bbetter (to|than|approach|option|choice)\b/gi,
  /\binstead of\b/gi,
  /\brather than\b/gi,
  /\bthe reason (is|was|being)\b/gi,
  /\bbecause\b/gi,
  /\btrade-?off\b/gi,
  /\bpros and cons\b/gi,
  /\bover\b.*\bbecause\b/gi,
  /\barchitecture\b/gi,
  /\bapproach\b/gi,
  /\bstrategy\b/gi,
  /\bpattern\b/gi,
  /\bstack\b/gi,
  /\bframework\b/gi,
  /\binfrastructure\b/gi,
  /\bset (it |this )?to\b/gi,
  /\bconfigure\b/gi,
  /\bdefault\b/gi,
];

const PREFERENCE_MARKERS: RegExp[] = [
  /\bi prefer\b/gi,
  /\balways use\b/gi,
  /\bnever use\b/gi,
  /\bdon'?t (ever |like to )?(use|do|mock|stub|import)\b/gi,
  /\bi like (to|when|how)\b/gi,
  /\bi hate (when|how|it when)\b/gi,
  /\bplease (always|never|don'?t)\b/gi,
  /\bmy (rule|preference|style|convention) is\b/gi,
  /\bwe (always|never)\b/gi,
  /\bfunctional\b.*\bstyle\b/gi,
  /\bimperative\b/gi,
  /\bsnake_?case\b/gi,
  /\bcamel_?case\b/gi,
  /\btabs\b.*\bspaces\b/gi,
  /\bspaces\b.*\btabs\b/gi,
  /\buse\b.*\binstead of\b/gi,
];

const MILESTONE_MARKERS: RegExp[] = [
  /\bit works\b/gi,
  /\bit worked\b/gi,
  /\bgot it working\b/gi,
  /\bfixed\b/gi,
  /\bsolved\b/gi,
  /\bbreakthrough\b/gi,
  /\bfigured (it )?out\b/gi,
  /\bnailed it\b/gi,
  /\bcracked (it|the)\b/gi,
  /\bfinally\b/gi,
  /\bfirst time\b/gi,
  /\bfirst ever\b/gi,
  /\bnever (done|been|had) before\b/gi,
  /\bdiscovered\b/gi,
  /\brealized\b/gi,
  /\bfound (out|that)\b/gi,
  /\bturns out\b/gi,
  /\bthe key (is|was|insight)\b/gi,
  /\bthe trick (is|was)\b/gi,
  /\bnow i (understand|see|get it)\b/gi,
  /\bbuilt\b/gi,
  /\bcreated\b/gi,
  /\bimplemented\b/gi,
  /\bshipped\b/gi,
  /\blaunched\b/gi,
  /\bdeployed\b/gi,
  /\breleased\b/gi,
  /\bprototype\b/gi,
  /\bproof of concept\b/gi,
  /\bdemo\b/gi,
  /\bversion \d/gi,
  /\bv\d+\.\d+/gi,
  /\d+x (compression|faster|slower|better|improvement|reduction)/gi,
  /\d+% (reduction|improvement|faster|better|smaller)/gi,
];

const PROBLEM_MARKERS: RegExp[] = [
  /\b(bug|error|crash|fail|broke|broken|issue|problem)\b/gi,
  /\bdoesn'?t work\b/gi,
  /\bnot working\b/gi,
  /\bwon'?t\b.*\bwork\b/gi,
  /\bkeeps? (failing|crashing|breaking|erroring)\b/gi,
  /\broot cause\b/gi,
  /\bthe (problem|issue|bug) (is|was)\b/gi,
  /\bturns out\b.*\b(was|because|due to)\b/gi,
  /\bthe fix (is|was)\b/gi,
  /\bworkaround\b/gi,
  /\bthat'?s why\b/gi,
  /\bthe reason it\b/gi,
  /\bfixed (it |the |by )\b/gi,
  /\bsolution (is|was)\b/gi,
  /\bresolved\b/gi,
  /\bpatched\b/gi,
  /\bthe answer (is|was)\b/gi,
  /\b(had|need) to\b.*\binstead\b/gi,
];

const EMOTIONAL_MARKERS: RegExp[] = [
  /\blove\b/gi,
  /\bscared\b/gi,
  /\bafraid\b/gi,
  /\bproud\b/gi,
  /\bhurt\b/gi,
  /\bhappy\b/gi,
  /\bsad\b/gi,
  /\bcry\b/gi,
  /\bcrying\b/gi,
  /\bmiss\b/gi,
  /\bsorry\b/gi,
  /\bgrateful\b/gi,
  /\bangry\b/gi,
  /\bworried\b/gi,
  /\blonely\b/gi,
  /\bbeautiful\b/gi,
  /\bamazing\b/gi,
  /\bwonderful\b/gi,
  /\bi feel\b/gi,
  /\bi'm scared\b/gi,
  /\bi love you\b/gi,
  /\bi'm sorry\b/gi,
  /\bi can't\b/gi,
  /\bi wish\b/gi,
  /\bi miss\b/gi,
  /\bi need\b/gi,
  /\bnever told anyone\b/gi,
  /\bnobody knows\b/gi,
  /\*[^*]+\*/gi,
];

const ALL_MARKERS: Record<Exclude<MemoryCategory, 'general'>, RegExp[]> = {
  decision: DECISION_MARKERS,
  preference: PREFERENCE_MARKERS,
  milestone: MILESTONE_MARKERS,
  problem: PROBLEM_MARKERS,
  emotional: EMOTIONAL_MARKERS,
};

// ---------------------------------------------------------------------------
// Sentiment helpers (from MemPalace disambiguation logic)
// ---------------------------------------------------------------------------

const POSITIVE_WORDS = new Set([
  'pride','proud','joy','happy','love','loving','beautiful','amazing',
  'wonderful','incredible','fantastic','brilliant','perfect','excited',
  'thrilled','grateful','warm','breakthrough','success','works','working',
  'solved','fixed','nailed','heart','hug','precious','adore',
]);

const NEGATIVE_WORDS = new Set([
  'bug','error','crash','crashing','crashed','fail','failed','failing',
  'failure','broken','broke','breaking','breaks','issue','problem','wrong',
  'stuck','blocked','unable','impossible','missing','terrible','horrible',
  'awful','worse','worst','panic','disaster','mess',
]);

function getSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const words = new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []);
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

const RESOLUTION_PATTERNS = [
  /\bfixed\b/i,
  /\bsolved\b/i,
  /\bresolved\b/i,
  /\bpatched\b/i,
  /\bgot it working\b/i,
  /\bit works\b/i,
  /\bnailed it\b/i,
  /\bfigured (it )?out\b/i,
  /\bthe (fix|answer|solution)\b/i,
];

function hasResolution(text: string): boolean {
  return RESOLUTION_PATTERNS.some((p) => p.test(text));
}

// ---------------------------------------------------------------------------
// Code-line filter (skip code when scoring — prose only)
// ---------------------------------------------------------------------------

const CODE_LINE_PATTERNS = [
  /^\s*[\$#]\s/,
  /^\s*(cd|source|echo|export|pip|npm|git|python|bash|curl|wget|mkdir|rm|cp|mv|ls|cat|grep|find|chmod|sudo|brew|docker)\s/,
  /^\s*```/,
  /^\s*(import|from|def|class|function|const|let|var|return)\s/,
  /^\s*[A-Z_]{2,}=/,
  /^\s*\|/,
  /^\s*-{2,}/,
  /^\s*[{}\[\]]\s*$/,
  /^\s*(if|for|while|try|catch|except|elif|else:)\b/,
  /^\s*\w+\.\w+\(/,
  /^\s*\w+ = \w+\.\w+/,
];

function isCodeLine(line: string): boolean {
  const stripped = line.trim();
  if (!stripped) return false;
  for (const p of CODE_LINE_PATTERNS) {
    if (p.test(stripped)) return true;
  }
  // Guard: stripped is non-empty here (checked above), so length > 0
  const alphaCount = (stripped.match(/[a-zA-Z]/g) ?? []).length;
  const alphaRatio = alphaCount / stripped.length;
  if (alphaRatio < 0.4 && stripped.length > 10) return true;
  return false;
}

function extractProse(text: string): string {
  const lines = text.split('\n');
  const prose: string[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (!isCodeLine(line)) prose.push(line);
  }
  const result = prose.join('\n').trim();
  return result || text;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

// ⚡ Bolt Optimization: Pre-compile regexes with 'gi' flags and use text.match()
// This avoids dynamic new RegExp() instantiation and text.toLowerCase() string cloning
// inside this tight scoring loop, reducing memory allocation and CPU overhead.
// String.prototype.match ignores the stateful lastIndex property of global regexes.
function scoreMarkers(text: string, markers: RegExp[]): number {
  let score = 0;
  for (const m of markers) {
    const matches = text.match(m);
    if (matches) score += matches.length;
  }
  return score;
}

// ---------------------------------------------------------------------------
// Disambiguation (ported from MemPalace _disambiguate)
// ---------------------------------------------------------------------------

function disambiguate(
  category: Exclude<MemoryCategory, 'general'>,
  text: string,
  scores: Partial<Record<Exclude<MemoryCategory, 'general'>, number>>
): MemoryCategory {
  const sentiment = getSentiment(text);

  // Resolved problems are milestones
  if (category === 'problem' && hasResolution(text)) {
    if ((scores.emotional ?? 0) > 0 && sentiment === 'positive') return 'emotional';
    return 'milestone';
  }

  // Problem + positive sentiment → milestone or emotional
  if (category === 'problem' && sentiment === 'positive') {
    if ((scores.milestone ?? 0) > 0) return 'milestone';
    if ((scores.emotional ?? 0) > 0) return 'emotional';
  }

  return category;
}

// ---------------------------------------------------------------------------
// Text segmentation
// ---------------------------------------------------------------------------

const SPEAKER_TURN_PATTERNS = [
  /^>\s/,
  /^(Human|User|Q)\s*:/i,
  /^(Assistant|AI|A|Claude|ChatGPT|Prism)\s*:/i,
];

function splitByTurns(lines: string[]): string[] {
  const segments: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    const stripped = line.trim();
    const isTurn = SPEAKER_TURN_PATTERNS.some((p) => p.test(stripped));
    if (isTurn && current.length > 0) {
      segments.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) segments.push(current.join('\n'));
  return segments;
}

function splitIntoSegments(text: string): string[] {
  const lines = text.split('\n');

  // Count speaker-turn markers
  let turnCount = 0;
  for (const line of lines) {
    if (SPEAKER_TURN_PATTERNS.some((p) => p.test(line.trim()))) turnCount++;
  }

  if (turnCount >= 3) return splitByTurns(lines);

  // Paragraph splitting
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 1 && lines.length > 20) {
    const segments: string[] = [];
    for (let i = 0; i < lines.length; i += 25) {
      const group = lines.slice(i, i + 25).join('\n').trim();
      if (group) segments.push(group);
    }
    return segments;
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Content hash (for exact dedup)
// ---------------------------------------------------------------------------

export function contentHash(text: string): string {
  const normalised = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalised).digest('hex');
}

// ---------------------------------------------------------------------------
// Jaccard similarity (for near-dedup without vector DB)
// ---------------------------------------------------------------------------

export function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().match(/\b\w{3,}\b/g) ?? []);
  const setB = new Set(b.toLowerCase().match(/\b\w{3,}\b/g) ?? []);
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;
  let intersect = 0;
  for (const w of setA) {
    if (setB.has(w)) intersect++;
  }
  const union = setA.size + setB.size - intersect;
  return intersect / union;
}

// ---------------------------------------------------------------------------
// Main extraction function
// ---------------------------------------------------------------------------

/**
 * Extract structured memory units from any text content.
 *
 * Inspired by MemPalace general_extractor.py — pure pattern heuristics,
 * no LLM required.
 *
 * @param text           Raw text content to extract from.
 * @param minConfidence  Minimum confidence threshold (default 0.3).
 * @returns List of ExtractedMemory objects ready for DB persistence.
 */
export function extractMemories(text: string, minConfidence = 0.3): ExtractedMemory[] {
  const segments = splitIntoSegments(text);
  const memories: ExtractedMemory[] = [];

  for (const segment of segments) {
    if (segment.trim().length < 20) continue;

    const prose = extractProse(segment);

    // Score against all categories
    const scores: Partial<Record<Exclude<MemoryCategory, 'general'>, number>> = {};
    for (const [cat, markers] of Object.entries(ALL_MARKERS) as [Exclude<MemoryCategory, 'general'>, RegExp[]][]) {
      const score = scoreMarkers(prose, markers);
      if (score > 0) scores[cat] = score;
    }

    if (Object.keys(scores).length === 0) continue;

    // Length bonus (longer chunks carry more signal)
    const lengthBonus = segment.length > 500 ? 2 : segment.length > 200 ? 1 : 0;

    // Pick highest-scoring category (cleaner than chained type assertions)
    let maxCat: Exclude<MemoryCategory, 'general'> = 'decision';
    let maxRawScore = 0;
    for (const [cat, score] of Object.entries(scores) as [Exclude<MemoryCategory, 'general'>, number][]) {
      if (score > maxRawScore) {
        maxRawScore = score;
        maxCat = cat;
      }
    }
    const maxScore = maxRawScore + lengthBonus;

    // Disambiguate
    const finalCat = disambiguate(maxCat, prose, scores);

    // Confidence: normalised 0–1, cap at 1.0
    const confidence = Math.min(1.0, maxScore / 5.0);
    if (confidence < minConfidence) continue;

    const content = segment.trim();
    memories.push({
      content,
      category: finalCat,
      confidence,
      chunk_index: memories.length,
      dedup_hash: contentHash(content),
    });
  }

  return memories;
}

// ---------------------------------------------------------------------------
// Conflict detection (MemPalace-inspired: flag don't overwrite)
//
// Two memories conflict if they share the same category and sufficient keyword
// overlap but appear to express opposing or mutually exclusive facts.
// We use a lightweight heuristic: same category + Jaccard ≥ 0.25 +
// one contains a negation of key terms in the other.
// ---------------------------------------------------------------------------

const NEGATION_PATTERN = /\b(not|never|don'?t|doesn'?t|won'?t|can'?t|isn'?t|aren'?t|no|none)\b/i;

export function detectConflict(
  newContent: string,
  existingContent: string,
  newCategory: MemoryCategory,
  existingCategory: MemoryCategory
): boolean {
  if (newCategory !== existingCategory) return false;
  const sim = jaccardSimilarity(newContent, existingContent);
  if (sim < 0.25) return false;

  const newHasNeg = NEGATION_PATTERN.test(newContent);
  const existHasNeg = NEGATION_PATTERN.test(existingContent);

  // One affirms, the other negates — potential conflict
  if (newHasNeg !== existHasNeg && sim >= 0.3) return true;
  // Both decision/preference with very high overlap → potential conflict
  if ((newCategory === 'decision' || newCategory === 'preference') && sim >= 0.5) return true;

  return false;
}
