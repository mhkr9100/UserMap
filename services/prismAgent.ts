import { BaseAdapter } from './integrations/base';
import type { ChatMessage, PageNode, ToolContextItem } from '../types';

export type PrismTool = 'search_map' | 'read_private' | 'create_fact';

export interface PrismAgentCallbacks {
    onSearchMap: (query: string) => Promise<string>;
    onReadPrivate: (nodeId: string, context: string) => Promise<{ allowed: boolean, data?: string }>;
    onCreateFact: (label: string, value: string) => Promise<boolean>;
    onAgentThought: (thought: string) => void;
}

const SYSTEM_PROMPT = `You are Prism, an AI Context Engineer that manages the user's personal knowledge graph (UserMap).
Your job is to arrange personal data, updates, life, career, projects, and protect private memory.

You can interleave thinking, tool calling, and speaking. 
To call a tool, you MUST output a JSON block like this exactly:
\`\`\`json
{
  "tool": "search_map",
  "query": "my career"
}
\`\`\`
Or
\`\`\`json
{
  "tool": "read_private",
  "nodeId": "12345",
  "reasoning": "User asked for their password, which is stored in this private node."
}
\`\`\`
Or
\`\`\`json
{
  "tool": "create_fact",
  "label": "Favorite color",
  "value": "blue"
}
\`\`\`

Wait for the system to inject the TOOL_RESPONSE before you continue speaking. 
If you do not need to use a tool, or after you have received the tool response, simply reply normally to the user.
Always be concise, precise, and highly analytical.`;

/**
 * Runs a single ReAct-style loop iteration for Prism.
 * If the model outputs a tool call, it executes it and appends the result to messages,
 * continuing until the model gives a final text response.
 */
export async function runPrismTurn(
    adapter: BaseAdapter,
    messages: ChatMessage[],
    callbacks: PrismAgentCallbacks
): Promise<ChatMessage[]> {
    const maxLoops = 4;
    const currentMessages = [...messages];

    // Ensure system prompt is set correctly
    if (currentMessages[0]?.role !== 'system') {
        currentMessages.unshift({ role: 'system', content: SYSTEM_PROMPT });
    }

    for (let i = 0; i < maxLoops; i++) {
        // Send to adapter
        callbacks.onAgentThought("Connecting to knowledge graph...");
        const response = await adapter.sendMessage(currentMessages, []);
        
        const text = response.text || '';
        const match = text.match(/\`\`\`json\s*(\{[\s\S]*?\} )\s*\`\`\`/);
        
        currentMessages.push({ role: 'assistant', content: text });

        if (!match) {
            // No tool call detected, we are done
            return currentMessages;
        }

        try {
            const parsed = JSON.parse(match[1]);
            let toolResponse = '';

            callbacks.onAgentThought(`Using tool: ${parsed.tool}`);

            if (parsed.tool === 'search_map') {
                toolResponse = await callbacks.onSearchMap(parsed.query || '');
            } else if (parsed.tool === 'read_private') {
                const req = await callbacks.onReadPrivate(parsed.nodeId, parsed.reasoning || '');
                if (req.allowed) {
                    toolResponse = `ACCESS GRANTED: ${req.data}`;
                } else {
                    toolResponse = `ACCESS DENIED by user. You must inform the user you cannot answer.`;
                }
            } else if (parsed.tool === 'create_fact') {
                const ok = await callbacks.onCreateFact(parsed.label, parsed.value);
                toolResponse = ok ? "Fact created successfully." : "Failed to create fact.";
            } else {
                toolResponse = `ERROR: Unknown tool ${parsed.tool}`;
            }

            // Append tool response as system or user message
            currentMessages.push({ role: 'system', content: `[TOOL_RESPONSE]: ${toolResponse}` });

        } catch (err: any) {
            currentMessages.push({ role: 'system', content: `[TOOL_ERROR]: Found JSON but failed to parse or execute: ${err.message}` });
        }
    }

    return currentMessages;
}
