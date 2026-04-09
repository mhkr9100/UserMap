import { runPrismTurn, PrismAgentCallbacks } from './prismAgent';
import { BaseAdapter } from './integrations/base';
import type { ChatMessage, PageNode } from '../types';

export interface IngestedData {
    content: string;
    source: string;
    timestamp: string;
    metadata?: any;
}

class StructurerService {
    private isProcessing = false;
    private queue: IngestedData[] = [];
    private adapter?: BaseAdapter;
    private callbacks?: Partial<PrismAgentCallbacks>;

    /**
     * Initialize the structurer with an adapter (e.g. OpenAI/Anthropic) 
     * and storage callbacks.
     */
    init(adapter: BaseAdapter, callbacks: PrismAgentCallbacks) {
        this.adapter = adapter;
        this.callbacks = callbacks;
    }

    /**
     * Add new data to the background processing queue.
     */
    queueForStructuring(data: IngestedData) {
        console.log(`[Structurer] Queuing data from ${data.source}`);
        this.queue.push(data);
        this.processQueue();
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || !this.adapter || !this.callbacks) {
            return;
        }

        this.isProcessing = true;
        const data = this.queue.shift()!;

        try {
            console.log(`[Structurer] Prism is analyzing data from ${data.source}...`);
            
            const systemPrompt = `You are the Prism Continuous Structurer. 
Incoming data from source "${data.source}" at ${data.timestamp}.
Your task is to analyze this content and update the UserMap knowledge graph.
If you find new facts, contacts, projects, or interests, use "create_fact" or update the graph.
DATA CONTENT:
${data.content}`;

            const messages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Please rearrange my knowledge graph based on this new information.' }
            ];

            // Re-use the existing runPrismTurn logic but for background structuring
            await runPrismTurn(
                this.adapter,
                messages,
                this.callbacks as PrismAgentCallbacks
            );

            console.log(`[Structurer] Finished processing data from ${data.source}.`);
        } catch (err) {
            console.error(`[Structurer] Failed to process data from ${data.source}:`, err);
        } finally {
            this.isProcessing = false;
            // Process next item if any
            this.processQueue();
        }
    }
}

export const structurerService = new StructurerService();
