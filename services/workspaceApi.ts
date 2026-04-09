import type { PageNode } from '../types';

const LOCAL_STORAGE_KEY = 'usermap_local_tree';

export interface ConsolidateUserMapRequest {
    memories: string[];
    existingTree?: PageNode;
}

export interface UserMapTreeResponse {
    userId: string;
    tree: PageNode | null;
    updatedAt?: string | null;
}

export interface SaveUserMapResponse {
    success: boolean;
    userId: string;
    updatedAt?: string | null;
}

export interface MemoryRecord {
    id: string;
    userId: string;
    agentId?: string | null;
    content: string;
    category?: string;
    createdAt?: string;
}

export interface ExtractMemoryRequest {
    messages: Array<{ role: string; content: string }>;
}

export async function getUserMapTree(): Promise<UserMapTreeResponse> {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        let tree = null;
        if (raw) {
            tree = JSON.parse(raw);
        }
        return {
            userId: 'local',
            tree,
            updatedAt: new Date().toISOString()
        };
    } catch (error: any) {
        console.error('Local Storage: getUserMapTree failed:', error.message);
        throw error;
    }
}

export async function saveUserMapTree(tree: PageNode, expectedUpdatedAt?: string | null): Promise<SaveUserMapResponse> {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
        return {
            success: true,
            userId: 'local',
            updatedAt: new Date().toISOString()
        };
    } catch (error: any) {
        throw new Error('Failed to save to local storage.');
    }
}

// Stubs for offline features that used to rely on the backend.
// In a fully offline app, "consolidation" could be done with a local LLM or just direct mapping.
export async function consolidateUserMap(params: ConsolidateUserMapRequest): Promise<PageNode> {
    throw new Error('Consolidation via LLM is not supported when running completely offline without a backend.');
}

export async function listMemories(limit = 300): Promise<{ memories: MemoryRecord[]; count: number }> {
    return { memories: [], count: 0 };
}

export async function extractMemory(params: ExtractMemoryRequest): Promise<{ facts: string[] }> {
     return { facts: [] };
}
