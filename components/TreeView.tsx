import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { PageNode } from '../types';

const STORAGE_KEY = 'usermap_treeview_collapsed_v1';

function defaultCollapsedIds(node: PageNode, depth = 0, collapsed = new Set<string>()): Set<string> {
  if ((node.children?.length ?? 0) > 0 && depth >= 2) {
    collapsed.add(node.id);
  }
  for (const child of node.children ?? []) {
    defaultCollapsedIds(child, depth + 1, collapsed);
  }
  return collapsed;
}

function loadCollapsed(tree: PageNode): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCollapsedIds(tree);
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return defaultCollapsedIds(tree);
  }
}

function saveCollapsed(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

function hasNode(tree: PageNode, id: string): boolean {
  if (tree.id === id) return true;
  return (tree.children ?? []).some((child) => hasNode(child, id));
}

const importanceTone: Record<string, string> = {
  high: 'text-amber-600 dark:text-amber-300 border-amber-500/30 bg-amber-500/10',
  medium: 'text-violet-600 dark:text-violet-300 border-violet-500/30 bg-violet-500/10',
  low: 'text-slate-500 dark:text-white/45 border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.03]',
};

interface TreeBranchProps {
  node: PageNode;
  depth: number;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
}

const TreeBranch: React.FC<TreeBranchProps> = ({ node, depth, collapsed, onToggle }) => {
  const children = node.children ?? [];
  const expandable = children.length > 0;
  const isCollapsed = expandable && collapsed.has(node.id);

  return (
    <li className="relative">
      <div
        className="group rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] px-3 py-2"
        style={{ marginLeft: depth * 14 }}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-5 w-5 shrink-0">
            {expandable ? (
              <button
                onClick={() => onToggle(node.id)}
                className="h-5 w-5 rounded-md border border-black/10 dark:border-white/10 text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80"
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${node.label}`}
              >
                {isCollapsed ? <ChevronRight size={12} className="mx-auto" /> : <ChevronDown size={12} className="mx-auto" />}
              </button>
            ) : (
              <span className="block h-5 w-5 rounded-full border border-black/10 dark:border-white/10" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{node.label}</h3>
              {node.nodeType && (
                <span className="rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gray-500 dark:text-white/45">
                  {node.nodeType}
                </span>
              )}
              {node.importance && (
                <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${importanceTone[node.importance] || importanceTone.medium}`}>
                  {node.importance}
                </span>
              )}
            </div>

            {node.value && <p className="mt-1 text-[11px] text-gray-600 dark:text-white/55 break-words">{node.value}</p>}

            <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-gray-400 dark:text-white/30">
              {node.source && <span>Source: {node.source}</span>}
              {node.sourceDate && <span>Date: {node.sourceDate}</span>}
              {typeof node.confidence === 'number' && <span>Confidence: {Math.round(node.confidence * 100)}%</span>}
              {node.visibility && <span>Visibility: {node.visibility}</span>}
            </div>
          </div>
        </div>
      </div>

      {expandable && !isCollapsed && (
        <ul className="mt-2 space-y-2" role="group" aria-label={`${node.label} children`}>
          {children.map((child) => (
            <TreeBranch key={child.id} node={child} depth={depth + 1} collapsed={collapsed} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
};

interface TreeViewProps {
  tree: PageNode;
}

export const TreeView: React.FC<TreeViewProps> = ({ tree }) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapsed(tree));

  useEffect(() => {
    setCollapsed((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (hasNode(tree, id)) next.add(id);
      }
      saveCollapsed(next);
      return next;
    });
  }, [tree]);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveCollapsed(next);
      return next;
    });
  };

  const hasData = (tree.children?.length ?? 0) > 0;
  const totalNodes = useMemo(() => {
    let count = 0;
    const visit = (node: PageNode) => {
      count += 1;
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
    return count;
  }, [tree]);

  if (!hasData) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/80">No nodes yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Import data or add nodes in MindMap view to see a hierarchy here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto p-4 custom-scrollbar">
      <div className="mb-3 text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/30">
        {totalNodes} total nodes
      </div>
      <ul className="space-y-2" role="tree" aria-label="UserMap hierarchy tree">
        <TreeBranch node={tree} depth={0} collapsed={collapsed} onToggle={toggleCollapse} />
      </ul>
    </div>
  );
};
