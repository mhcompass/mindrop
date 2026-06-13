import { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NODE_TYPES, ModuleInspector } from './nodes';
import { useTheme } from '../theme';
import type { ArchNodeDef, ArchEdgeDef, EdgeKind, ReadinessCardDef, PlacedTile, ModuleTileDef } from '../model/types';

/* ── Edge styling per kind (colour comes from the theme) ──────── */

const EDGE_META: Record<EdgeKind, { dash?: string; animated: boolean; label: string }> = {
  live:    { animated: true,  label: 'Live flows' },
  seeded:  { dash: '2 5', animated: false, label: 'Seeded demo data' },
  planned: { dash: '8 6', animated: false, label: 'Planned wiring' },
  neutral: { animated: false, label: 'Actors & sequence' },
};

const HANDLE: Record<string, { s: string; t: string }> = {
  t: { s: 'st', t: 'tt' },
  b: { s: 'sb', t: 'tb' },
  l: { s: '', t: 'tl' },
  r: { s: 'sr', t: '' },
};

interface Props {
  nodes: ArchNodeDef[];
  edges: ArchEdgeDef[];
  cards?: ReadinessCardDef[];
  tiles?: PlacedTile[];
  /** Which edge-kind toggles to offer. */
  kinds?: EdgeKind[];
}

export function ArchFlow({ nodes, edges, cards = [], tiles = [], kinds = [] }: Props) {
  const theme = useTheme();
  const [enabled, setEnabled] = useState<Set<EdgeKind>>(new Set<EdgeKind>(['live', 'seeded', 'planned', 'neutral']));
  const [inspect, setInspect] = useState<ArchNodeDef | null>(null);
  const [inspectTile, setInspectTile] = useState<ModuleTileDef | null>(null);

  const rfNodes = useMemo<Node[]>(() => {
    const zoneNodes: Node[] = nodes
      .filter((n) => n.zone)
      .map((n) => ({
        id: n.id,
        type: 'zone',
        position: { x: n.x, y: n.y },
        data: { label: n.label, status: n.status, w: n.w, h: n.h },
        zIndex: -10,
        selectable: false,
        draggable: false,
      }));
    const boxNodes: Node[] = nodes
      .filter((n) => !n.zone)
      .map((n) => ({
        id: n.id,
        type: 'box',
        position: { x: n.x, y: n.y },
        data: { label: n.label, status: n.status, w: n.w, h: n.h, dashed: n.dashed, fontSize: n.fontSize },
        draggable: false,
      }));
    const cardNodes: Node[] = cards.map((c) => ({
      id: c.id,
      type: 'card',
      position: { x: c.x, y: c.y },
      data: { title: c.title, tone: c.tone, w: c.w, h: c.h, rows: c.rows },
      draggable: false,
    }));
    const tileNodes: Node[] = tiles.map((t) => ({
      id: t.id,
      type: 'tile',
      position: { x: t.x, y: t.y },
      data: { ...t },
      draggable: false,
    }));
    return [...zoneNodes, ...boxNodes, ...cardNodes, ...tileNodes];
  }, [nodes, cards, tiles]);

  const rfEdges = useMemo<Edge[]>(
    () =>
      edges
        .filter((e) => enabled.has(e.kind))
        .map((e) => {
          const meta = EDGE_META[e.kind];
          const stroke = theme.edge[e.kind];
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: HANDLE[e.sh ?? 'b'].s || 'sb',
            targetHandle: HANDLE[e.th ?? 't'].t || 'tt',
            type: 'smoothstep',
            animated: meta.animated,
            label: e.label,
            labelStyle: { fontSize: 10, fontWeight: 600, fill: theme.edgeLabel.text },
            labelBgStyle: { fill: theme.edgeLabel.bg, fillOpacity: 0.9 },
            labelBgPadding: [4, 2] as [number, number],
            labelBgBorderRadius: 4,
            style: { stroke, strokeWidth: 1.8, strokeDasharray: meta.dash },
            markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
          };
        }),
    [edges, enabled, theme],
  );

  const toggle = (k: EdgeKind) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        colorMode={theme.dark ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.06 }}
        minZoom={0.06}
        maxZoom={2.2}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_e, node) => {
          if (node.type === 'tile') {
            const tile = tiles.find((t) => t.id === node.id);
            if (tile) {
              setInspectTile(tile);
              setInspect(null);
            }
            return;
          }
          const def = nodes.find((n) => n.id === node.id);
          if (def && !def.zone) {
            setInspect(def);
            setInspectTile(null);
          }
        }}
        onPaneClick={() => {
          setInspect(null);
          setInspectTile(null);
        }}
        style={{ background: theme.app.bg }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={theme.canvas.dots} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const status = (n.data as { status?: string }).status;
            const swatch: Record<string, string> = {
              live: '#82b366', seeded: '#d79b00', demo: '#9673a6', planned: '#b85450',
              shared: '#d6b656', infra: '#6c8ebf', ai: '#9673a6', external: '#999999',
              actor: '#888888', note: theme.dark ? '#374151' : '#e5e7eb',
            };
            return swatch[status ?? 'note'] ?? (theme.dark ? '#374151' : '#e5e7eb');
          }}
        />
      </ReactFlow>

      {/* Layer toggles */}
      {kinds.length > 0 && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, background: theme.canvas.panelBg, border: `1px solid ${theme.canvas.panelBorder}`, borderRadius: 10, padding: '6px 8px', boxShadow: theme.dark ? '0 1px 4px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.1)' }}>
          {kinds.map((k) => {
            const on = enabled.has(k);
            const stroke = theme.edge[k];
            return (
              <button
                key={k}
                onClick={() => toggle(k)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: `1.5px solid ${on ? stroke : theme.canvas.panelBorder}`,
                  background: on ? `${stroke}22` : 'transparent',
                  color: on ? stroke : theme.app.tabText,
                  textDecoration: on ? 'none' : 'line-through',
                }}
              >
                {EDGE_META[k].label}
              </button>
            );
          })}
        </div>
      )}

      {inspectTile && <ModuleInspector mod={inspectTile} onClose={() => setInspectTile(null)} />}

      {/* Inspector */}
      {inspect && (
        <div style={{ position: 'absolute', bottom: 14, left: 14, width: 320, background: theme.inspector.bg, border: `1px solid ${theme.inspector.border}`, borderRadius: 12, padding: '12px 14px', boxShadow: theme.dark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, padding: '2px 8px', borderRadius: 999, background: theme.inspector.chipBg, color: theme.inspector.chipText }}>
              {inspect.status}
            </span>
            <button onClick={() => setInspect(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: theme.app.subtitle, fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.inspector.title, marginBottom: 4 }}>{inspect.label}</div>
          {inspect.detail && <div style={{ fontSize: 11.5, color: theme.inspector.text, lineHeight: 1.45 }}>{inspect.detail}</div>}
        </div>
      )}
    </div>
  );
}
