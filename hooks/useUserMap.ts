import { useState, useEffect, useCallback, useRef } from 'react';
import { PageNode, UserProfile } from '../types';

const EMPTY_TREE: PageNode = {
    id: 'root',
    label: 'UserMap',
    nodeType: 'root',
    children: []
};

function normalizeImportance(value?: string): 'high' | 'medium' | 'low' {
    return value === 'high' || value === 'low' ? value : 'medium';
}

function normalizeTree(node: PageNode, depth = 0): PageNode {
    const children = Array.isArray(node.children)
        ? node.children.map((child) => normalizeTree(child, depth + 1))
        : [];

    const nodeType = node.nodeType
        || (depth === 0
            ? 'root'
            : children.length > 0
                ? (depth === 1 ? 'category' : 'cluster')
                : 'fact');

    return {
        ...node,
        nodeType,
        importance: normalizeImportance(node.importance || (depth <= 1 ? 'high' : 'medium')),
        confidence: typeof node.confidence === 'number' ? node.confidence : (depth === 0 ? 0.99 : undefined),
        children
    };
}

export const useUserMap = (currentUser: UserProfile | null) => {
    const [userMapTree, setUserMapTree] = useState<PageNode>(EMPTY_TREE);
    const [isLoading, setIsLoading] = useState(false);
    const [isConsolidating, setIsConsolidating] = useState(false);
    const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);

    const latestTreeRef = useRef<PageNode>(EMPTY_TREE);
    const latestUpdatedAtRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        let mounted = true;
        (async () => {
            setIsLoading(true);
            try {
                const { getUserMapTree } = await import('../services/workspaceApi');
                const remote = await getUserMapTree();
                const tree = remote?.tree && remote.tree.id === 'root' ? normalizeTree(remote.tree) : EMPTY_TREE;
                const updatedAt = remote?.updatedAt || null;

                if (!mounted) return;
                setUserMapTree(tree);
                latestTreeRef.current = tree;
                setServerUpdatedAt(updatedAt);
                latestUpdatedAtRef.current = updatedAt;
            } catch (error) {
                console.warn('[useUserMap] Remote load failed, resetting to empty tree:', error);
                if (!mounted) return;
                setUserMapTree(EMPTY_TREE);
                latestTreeRef.current = EMPTY_TREE;
                setServerUpdatedAt(null);
                latestUpdatedAtRef.current = null;
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [currentUser]);

    const saveTree = useCallback(async (tree: PageNode) => {
        if (!currentUser) return;

        const previousTree = latestTreeRef.current;
        const previousUpdatedAt = latestUpdatedAtRef.current;
        const normalizedTree = normalizeTree(tree);

        setUserMapTree(normalizedTree);
        latestTreeRef.current = normalizedTree;

        try {
            const { saveUserMapTree } = await import('../services/workspaceApi');
            const response = await saveUserMapTree(normalizedTree, previousUpdatedAt);
            const nextUpdatedAt = response.updatedAt || new Date().toISOString();

            setServerUpdatedAt(nextUpdatedAt);
            latestUpdatedAtRef.current = nextUpdatedAt;
        } catch (error: any) {
            if (error?.code === 'CONFLICT' && error.currentTree?.id === 'root') {
                const remoteTree = error.currentTree as PageNode;
                const remoteUpdatedAt = error.currentUpdatedAt || null;
                const normalizedRemoteTree = normalizeTree(remoteTree);
                setUserMapTree(normalizedRemoteTree);
                latestTreeRef.current = normalizedRemoteTree;
                setServerUpdatedAt(remoteUpdatedAt);
                latestUpdatedAtRef.current = remoteUpdatedAt;
                return;
            }

            console.error('[useUserMap] Failed to save tree, rolling back:', error);
            setUserMapTree(previousTree);
            latestTreeRef.current = previousTree;
            setServerUpdatedAt(previousUpdatedAt);
            latestUpdatedAtRef.current = previousUpdatedAt;
            throw error;
        }
    }, [currentUser]);

    const updateNode = useCallback((nodeId: string, updates: Partial<PageNode>) => {
        const updateInTree = (node: PageNode): PageNode => {
            if (node.id === nodeId) {
                return { ...node, ...updates };
            }
            return { ...node, children: node.children.map(updateInTree) };
        };

        const updated = updateInTree(latestTreeRef.current);
        void saveTree(updated);
    }, [saveTree]);

    const deleteNode = useCallback((nodeId: string) => {
        const removeFromTree = (node: PageNode): PageNode => ({
            ...node,
            children: node.children
                .filter((child) => child.id !== nodeId)
                .map(removeFromTree)
        });

        const updated = removeFromTree(latestTreeRef.current);
        void saveTree(updated);
    }, [saveTree]);

    const addNode = useCallback((parentId: string, newNode: PageNode) => {
        const addToTree = (node: PageNode): PageNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, newNode] };
            }
            return { ...node, children: node.children.map(addToTree) };
        };

        const updated = addToTree(latestTreeRef.current);
        void saveTree(updated);
    }, [saveTree]);

    const consolidate = useCallback(async () => {
        if (!currentUser) return;
        setIsConsolidating(true);
        // Offline consolidation: Since there is no backend LLM, we just do nothing 
        // to pretend it grouped memories, or we just leave them as raw nodes.
        setTimeout(() => setIsConsolidating(false), 500); 
    }, [currentUser]);

    const persistFacts = useCallback(async (
        facts: string[],
        agentId?: string,
        source: string = 'chat',
        requireCloudAck: boolean = false
    ) => {
        if (!currentUser || facts.length === 0) return 0;
        
        // Fully offline mode: append the extracted facts straight as nodes
        // onto the root of the user map tree.
        const currentTree = latestTreeRef.current;
        const newNodes: PageNode[] = facts.map((fact) => {
            const clean = fact.trim();
            return {
                id: crypto.randomUUID(),
                label: clean.substring(0, 50) + (clean.length > 50 ? '...' : ''),
                value: clean,
                nodeType: 'fact',
                sourceDate: new Date().toISOString().split('T')[0],
                source: source,
                children: []
            };
        });

        const updatedTree: PageNode = {
            ...currentTree,
            children: [...currentTree.children, ...newNodes]
        };

        await saveTree(updatedTree);
        return newNodes.length;

    }, [currentUser, saveTree]);

    const ingestSession = useCallback(async (messages: Array<{ role: string; content: string }>, agentId?: string) => {
        if (!currentUser || messages.length < 2) return;

        // In an offline app without LLM extraction directly on the client,
        // we can just extract messages that the user marked or we can dump them as memories.
        // For now, we will bypass extraction and just log the text.
        try {
            const facts = messages.filter(m => m.role === 'user').map(m => m.content);
            await persistFacts(facts, agentId, 'chat', false);
        } catch (error) {
            console.error('Memory ingestion failed:', error);
        }
    }, [currentUser, persistFacts]);

    const ingestExternalMemory = useCallback(async (rawText: string) => {
        if (!currentUser) return 0;

        const codeBlockMatch = rawText.match(/```[\w-]*\s*([\s\S]*?)```/);
        const body = (codeBlockMatch ? codeBlockMatch[1] : rawText)
            .replace(/\r/g, '\n')
            .trim();

        const lines = body
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .filter((line) => !line.startsWith('#'))
            .filter((line) => !/^[-*]\s*$/.test(line));

        const normalized = lines
            .map((line) => line.replace(/^\d+\.\s+/, '').trim())
            .filter((line) => line.length >= 8)
            .slice(0, 200);

        return persistFacts(normalized, undefined, 'external-import', true);
    }, [currentUser, persistFacts]);

    return {
        userMapTree,
        setUserMapTree: saveTree,
        isLoading,
        isConsolidating,
        serverUpdatedAt,
        updateNode,
        deleteNode,
        addNode,
        consolidate,
        ingestSession,
        ingestExternalMemory
    };
};
