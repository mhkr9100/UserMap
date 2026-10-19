const MARKERS = [
  /\blet'?s (use|go with|try|pick|choose|switch to)\b/i,
  /\bwe (should|decided|chose|went with|picked|settled on)\b/i,
  /\bi'?m going (to|with)\b/i,
  /\bbetter (to|than|approach|option|choice)\b/i,
  /\binstead of\b/i,
  /\brather than\b/i,
  /\bthe reason (is|was|being)\b/i,
  /\bbecause\b/i,
  /\btrade-?off\b/i,
  /\bpros and cons\b/i,
  /\bover\b.*\bbecause\b/i,
  /\barchitecture\b/i,
  /\bapproach\b/i,
  /\bstrategy\b/i,
  /\bpattern\b/i,
  /\bstack\b/i,
  /\bframework\b/i,
  /\binfrastructure\b/i,
  /\bset (it |this )?to\b/i,
  /\bconfigure\b/i,
  /\bdefault\b/i,
];

function scoreMarkersOld(text, markers) {
  let score = 0;
  const textLower = text.toLowerCase();
  for (const m of markers) {
    const matches = textLower.match(new RegExp(m.source, 'gi'));
    if (matches) score += matches.length;
  }
  return score;
}

const PRECOMPILED_MARKERS = MARKERS.map(m => new RegExp(m.source, 'gi'));
function scoreMarkersNew(text, markers) {
  let score = 0;
  for (const m of markers) {
    // Reset lastIndex for stateful global regex
    m.lastIndex = 0;
    const matches = text.match(m);
    if (matches) score += matches.length;
  }
  return score;
}

const text = "We decided to use a different architecture approach because the reason was better trade-offs. I'm going to configure the default stack.";

console.time('old');
for (let i = 0; i < 10000; i++) {
  scoreMarkersOld(text, MARKERS);
}
console.timeEnd('old');

console.time('new');
for (let i = 0; i < 10000; i++) {
  scoreMarkersNew(text, PRECOMPILED_MARKERS);
}
console.timeEnd('new');
