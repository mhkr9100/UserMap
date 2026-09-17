import React, { useMemo, useState } from 'react';
import type { PageNode, UserMapImportance } from '../types';

export interface ListRow {
  id: string;
  label: string;
  value: string;
  nodeType: string;
  category: string;
  parent: string;
  importance: UserMapImportance;
  sourceDate: string;
  source: string;
}

export function flattenPageNodeRows(tree: PageNode): ListRow[] {
  const rows: ListRow[] = [];

  const visit = (node: PageNode, category: string, parent: string) => {
    if (node.id !== 'root') {
      const nodeCategory = node.nodeType === 'category' ? node.label : category || 'General Context';
      rows.push({
        id: node.id,
        label: node.label,
        value: node.value ?? '',
        nodeType: node.nodeType ?? 'fact',
        category: nodeCategory,
        parent,
        importance: node.importance === 'high' || node.importance === 'low' ? node.importance : 'medium',
        sourceDate: node.sourceDate ?? '',
        source: node.source ?? '',
      });

      const nextCategory = node.nodeType === 'category' ? node.label : nodeCategory;
      for (const child of node.children ?? []) {
        visit(child, nextCategory, node.label);
      }
      return;
    }

    for (const child of node.children ?? []) {
      visit(child, child.label, node.label);
    }
  };

  visit(tree, 'General Context', '');
  return rows;
}

type SortKey = 'label' | 'value' | 'nodeType' | 'category' | 'parent' | 'importance' | 'sourceDate';

const IMPORTANCE_ORDER: Record<UserMapImportance, number> = { high: 0, medium: 1, low: 2 };

function compareString(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

export function sortListRows(rows: ListRow[], key: SortKey, dir: 'asc' | 'desc'): ListRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (key === 'importance') {
      return IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance] || compareString(a.label, b.label);
    }
    return compareString(a[key], b[key]) || compareString(a.label, b.label);
  });
  return dir === 'asc' ? sorted : sorted.reverse();
}

interface ListViewProps {
  tree: PageNode;
}

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'label', label: 'Label' },
  { key: 'value', label: 'Value' },
  { key: 'nodeType', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'parent', label: 'Parent' },
  { key: 'importance', label: 'Importance' },
  { key: 'sourceDate', label: 'Source Date' },
];

export const ListView: React.FC<ListViewProps> = ({ tree }) => {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('importance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => flattenPageNodeRows(tree), [tree]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.label, row.value, row.nodeType, row.category, row.parent, row.sourceDate, row.source]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, rows]);

  const sortedRows = useMemo(() => sortListRows(filteredRows, sortKey, sortDir), [filteredRows, sortDir, sortKey]);

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/80">No rows to display</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/40">Import data or add nodes in MindMap view to populate List view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto p-4 custom-scrollbar">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="sr-only" htmlFor="list-view-search">Search list view</label>
        <input
          id="list-view-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by label, value, type, category, parent..."
          className="w-full sm:max-w-md rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-2 text-[12px] text-gray-800 dark:text-white/75 outline-none focus:border-violet-400"
        />
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/30">{sortedRows.length} of {rows.length} rows</p>
      </div>

      {sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-6 text-center text-sm text-gray-500 dark:text-white/45">
          No rows match your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <table className="min-w-[980px] w-full text-left" aria-label="UserMap list view table">
            <thead className="bg-gray-50 dark:bg-white/[0.04]">
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.key} scope="col" className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/35">
                    <button
                      onClick={() => {
                        if (sortKey === column.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        else { setSortKey(column.key); setSortDir('asc'); }
                      }}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-white/70"
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      {sortKey === column.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 text-[12px] font-semibold text-gray-900 dark:text-white/85">{row.label}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55 max-w-[340px]">
                    <div className="line-clamp-2">{row.value || '—'}</div>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55 uppercase">{row.nodeType}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55">{row.category}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55">{row.parent || '—'}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55 capitalize">{row.importance}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 dark:text-white/55">{row.sourceDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
