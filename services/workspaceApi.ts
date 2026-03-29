import type { PageNode } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const IS_DEV = import.meta.env.DEV;

function getAuthToken(): string {
    const token = sessionStorage.getItem('id_token')
        || sessionStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated. Please log in.');
    return token;
}

function getUserId(): string {
    const raw = sessionStorage.getItem('currentUser');
    if (!raw) throw new Error('No user session. Please log in.');
    return JSON.parse(raw).id;
}

async function apiRequest<T>(method: 'GET' | 'POST', path: string, body?: object): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('id_token');
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('id_token');
            localStorage.removeItem('currentUser');
            window.location.reload();
            throw new Error('Authentication expired. Please log in again.');
        }

        const errorData = await response.json().catch(() => ({ error: response.statusText, message: '' }));
        const error = errorData.error || `Request failed: ${response.status}`;
        const detail = errorData.message ? ` — ${errorData.message}` : '';
        throw new Error(`${error}${detail}`);
    }

    return response.json() as Promise<T>;
}

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
        return await apiRequest<UserMapTreeResponse>('GET', '/api/v2/usermap');
    } catch (error: any) {
        console.error('API: getUserMapTree failed:', error.message);
        throw error;
    }
}

export async function saveUserMapTree(tree: PageNode, expectedUpdatedAt?: string | null): Promise<SaveUserMapResponse> {
    const response = await fetch(`${API_BASE}/api/v2/usermap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ tree, expectedUpdatedAt: expectedUpdatedAt || null })
    });

    if (response.status === 409) {
        const conflict = await response.json().catch(() => ({}));
        const err: any = new Error(conflict.message || 'UserMap conflict');
        err.code = 'CONFLICT';
        err.currentTree = conflict.currentTree || null;
        err.currentUpdatedAt = conflict.currentUpdatedAt || null;
        throw err;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText, message: '' }));
        const error = errorData.error || `Request failed: ${response.status}`;
        const detail = errorData.message ? ` — ${errorData.message}` : '';
        throw new Error(`${error}${detail}`);
    }

    return response.json() as Promise<SaveUserMapResponse>;
}

export async function consolidateUserMap(params: ConsolidateUserMapRequest): Promise<PageNode> {
    try {
        return await apiRequest<PageNode>('POST', '/api/v2/usermap/consolidate', {
            userId: getUserId(),
            memories: params.memories,
            existingTree: params.existingTree || null
        });
    } catch (error: any) {
        console.error('API: consolidateUserMap failed:', error.message);
        throw error;
    }
}

export async function listMemories(limit = 300): Promise<{ memories: MemoryRecord[]; count: number }> {
    const response = await fetch(`${API_BASE}/api/memory/list?limit=${encodeURIComponent(String(limit))}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText, message: '' }));
        const error = errorData.error || `Request failed: ${response.status}`;
        const detail = errorData.message ? ` — ${errorData.message}` : '';
        throw new Error(`${error}${detail}`);
    }

    return response.json() as Promise<{ memories: MemoryRecord[]; count: number }>;
}

export async function extractMemory(params: ExtractMemoryRequest): Promise<{ facts: string[] }> {
    try {
        return await apiRequest<{ facts: string[] }>('POST', '/api/v2/memory/extract', {
            userId: getUserId(),
            messages: params.messages
        });
    } catch (error: any) {
        if (IS_DEV) console.error('API: extractMemory failed:', error.message);
        throw error;
    }
}
