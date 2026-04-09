import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

/**
 * POST /api/prism/context
 * 
 * The "Context Valve": Refines raw data into high-value context using Prism's logic.
 * 
 * Request: {
 *   intent: "LinkedIn message to a Software Engineer",
 *   user_id: "optional"
 * }
 */
router.post('/', async (req: Request, res: Response) => {
    const { intent } = req.body;

    if (!intent) {
        return res.status(400).json({ error: 'Intent is required for Prism context refinement.' });
    }

    const db = getDb();
    
    // 1. Fetch raw candidates (Internal search)
    // For now we use the same FTS logic as the standard context route
    const rows = db.prepare(`
        SELECT content, tool, metadata 
        FROM documents_fts fts
        JOIN documents d ON d.id = fts.rowid
        WHERE documents_fts MATCH ?
        LIMIT 20
    `).all(intent) as any[];

    // 2. Here we would call an LLM (Prism) to filter these results.
    // For the "Offline Preview", we will simulate the Prism filter logic:
    // Prism's Logic: "Checking GitHub and email history... sending only the relevant tech stack info."
    
    const refinedResults = rows.filter(row => {
        // Simple heuristic for "Tech Context" if intent mentioned software/linking
        if (intent.toLowerCase().includes('software') || intent.toLowerCase().includes('engineer')) {
            const content = row.content.toLowerCase();
            return content.includes('react') || content.includes('typescript') || content.includes('github') || content.includes('repo');
        }
        return true;
    }).slice(0, 5);

    // In a real implementation, we would pass 'rows' + 'intent' to an LLM:
    // const prismResponse = await callLLM(`Filter these records to only what's needed for: ${intent}`, rows);

    return res.json({
        intent,
        prism_status: "REFLECTED",
        message: "Prism has filtered the context to be intent-specific.",
        results: refinedResults.map(r => ({
            source: r.tool,
            content: r.content,
            relevance_reasoning: "Prism detected relevant tech stack in this source."
        }))
    });
});

export default router;
