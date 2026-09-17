import { describe, expect, it } from 'vitest';
import type { PageNode } from '../types';
import { buildFlowChartGraph } from './FlowChartView';
import { flattenPageNodeRows, sortListRows } from './ListView';

const sampleTree: PageNode = {
  id: 'root',
  label: 'My Map',
  nodeType: 'root',
  children: [
    {
      id: 'cat-1',
      label: 'Projects',
      nodeType: 'category',
      importance: 'high',
      children: [
        {
          id: 'cluster-1',
          label: 'UserMap',
          nodeType: 'cluster',
          importance: 'medium',
          source: 'GitHub',
          sourceDate: '2026-09-01',
          children: [
            {
              id: 'fact-1',
              label: 'Tree View',
              value: 'Implemented',
              nodeType: 'fact',
              importance: 'high',
              sourceDate: '2026-09-17',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

describe('buildFlowChartGraph', () => {
  it('builds directed edges for parent-child relationships including root', () => {
    const { nodes, edges } = buildFlowChartGraph(sampleTree);

    expect(nodes.map((n) => n.id)).toEqual(['root', 'cat-1', 'cluster-1', 'fact-1']);
    expect(edges).toEqual([
      { from: 'root', to: 'cat-1' },
      { from: 'cat-1', to: 'cluster-1' },
      { from: 'cluster-1', to: 'fact-1' },
    ]);
  });
});

describe('flattenPageNodeRows', () => {
  it('flattens tree nodes with category and parent metadata', () => {
    const rows = flattenPageNodeRows(sampleTree);
    const factRow = rows.find((row) => row.id === 'fact-1');

    expect(rows).toHaveLength(3);
    expect(factRow).toMatchObject({
      label: 'Tree View',
      value: 'Implemented',
      nodeType: 'fact',
      category: 'Projects',
      parent: 'UserMap',
      importance: 'high',
      sourceDate: '2026-09-17',
    });
  });

  it('sorts by importance and then label', () => {
    const rows = flattenPageNodeRows(sampleTree);
    const sorted = sortListRows(rows, 'importance', 'asc');

    expect(sorted[0].importance).toBe('high');
    expect(sorted[0].label).toBe('Projects');
  });
});
