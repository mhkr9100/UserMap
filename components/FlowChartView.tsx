/**
 * FlowChartView — SVG-based, pannable flow-chart/graph.
 *
 * Renders parent/child relationships as directed edges.
 * Supports mouse-drag panning and scroll-wheel zoom.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PageNode } from '../types';

interface FlowChartViewProps {
  tree: PageNode;
}

interface GraphNode {
  id: string;
  label: string;
  value?: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeType?: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

const H_GAP = 64;
const V_GAP = 36;
const NODE_HEIGHT = 52;
const MIN_NODE_WIDTH = 128;
const CHAR_PX = 7;

export function buildFlowChartGraph(tree: PageNode): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let yOffset = 0;

  function visit(node: PageNode, depth: number, parentId: string | null) {
    const width = Math.max(MIN_NODE_WIDTH, node.label.length * CHAR_PX + 36);
    const x = depth * (MIN_NODE_WIDTH + H_GAP);
    const y = yOffset;
    yOffset += NODE_HEIGHT + V_GAP;

    nodes.push({
      id: node.id,
      label: node.label,
      value: node.value,
      depth,
      x,
      y,
      width,
      height: NODE_HEIGHT,
      nodeType: node.nodeType,
    });

    if (parentId) edges.push({ from: parentId, to: node.id });

    for (const child of node.children ?? []) {
      visit(child, depth + 1, node.id);
    }
  }

  visit(tree, 0, null);
  return { nodes, edges };
}

function nodeColor(nodeType?: string): { fill: string; stroke: string; text: string } {
  switch (nodeType) {
    case 'root':
      return { fill: '#111827', stroke: '#1f2937', text: '#f9fafb' };
    case 'category':
      return { fill: '#1f2937', stroke: '#374151', text: '#f9fafb' };
    case 'cluster':
      return { fill: '#0f766e', stroke: '#0d9488', text: '#f0fdfa' };
    case 'fact':
      return { fill: '#f1f5f9', stroke: '#cbd5e1', text: '#1e293b' };
    default:
      return { fill: '#6366f1', stroke: '#4f46e5', text: '#fff' };
  }
}

export const FlowChartView: React.FC<FlowChartViewProps> = ({ tree }) => {
  const { nodes, edges } = useMemo(() => buildFlowChartGraph(tree), [tree]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 24, y: 24 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(3, Math.max(0.25, prev - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  if ((tree.children?.length ?? 0) === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-white/30 text-sm px-4 text-center">
        No data to display in Flow Chart view.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8f9fa] dark:bg-[#0d0f11] rounded-2xl border border-black/10 dark:border-white/10">
      <div className="absolute top-3 right-3 z-10 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/25 select-none">
        Drag to pan · Scroll to zoom
      </div>

      <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
          className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/10 text-gray-700 dark:text-white/60"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))}
          className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/10 text-gray-700 dark:text-white/60"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 24, y: 24 });
          }}
          className="px-2 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/10 text-[10px] font-semibold text-gray-700 dark:text-white/60"
          aria-label="Reset flow chart view"
        >
          Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        role="img"
        aria-label="Flow chart of UserMap nodes and directed relationships"
      >
        <defs>
          <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
          </marker>
        </defs>
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x + from.width;
            const y1 = from.y + from.height / 2;
            const x2 = to.x;
            const y2 = to.y + to.height / 2;
            const cx = (x1 + x2) / 2;

            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
                opacity={0.7}
                markerEnd="url(#flow-arrow)"
              />
            );
          })}

          {nodes.map((node) => {
            const { fill, stroke, text } = nodeColor(node.nodeType);
            const displayLabel = node.label.length > 22 ? `${node.label.slice(0, 21)}…` : node.label;
            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <rect width={node.width} height={node.height} rx={10} ry={10} fill={fill} stroke={stroke} strokeWidth={1.5} />
                <text
                  x={node.width / 2}
                  y={node.height / 2}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={text}
                  style={{ userSelect: 'none' }}
                >
                  {displayLabel}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
