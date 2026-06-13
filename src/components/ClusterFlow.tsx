import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NODE_TYPES, ModuleInspector } from './nodes';
import { useTheme } from '../theme';
import type { ModuleTileDef } from '../model/types';
import {
  CLUSTER_TREE,
  CLUSTER_EDGES,
  CLUSTER_NAME,
  AGENTS,
  aggregateCounts,
  allClusterIds,
  clusterChain,
  type AgentDef,
  type ClusterTreeDef,
} from '../model/clusters';
import { MODULE_BY_ID } from '../model/modules';

/* ── Layout constants ─────────────────────────────────────────── */

const TILE_W = 250;
const TILE_H = 96;
const GAP = 14;
const PAD = 14;
const HEADER = 52;
const CHIP_W = 340;
const CHIP_H = 96;
const AGENT_W = 190;
const AGENT_H = 40;
/** Max content width before wrapping: top-level clusters pack wide,
 *  nested clusters wrap at ~4 tiles. */
const maxContentW = (depth: number) => (depth === 0 ? 2400 : 1100);

interface Measured {
  w: number;
  h: number;
  nodes: Node[];
}

function layoutCluster(
  def: ClusterTreeDef,
  depth: number,
  collapsed: Set<string>,
  toggle: (id: string) => void,
): Measured {
  const counts = aggregateCounts(def);
  const isCollapsed = collapsed.has(def.id);

  const clusterNode = (w: number, h: number): Node => ({
    id: def.id,
    type: 'cluster',
    position: { x: 0, y: 0 }, // parent assigns
    data: {
      name: def.name,
      accent: def.accent,
      w,
      h,
      depth,
      collapsed: isCollapsed,
      counts,
      onToggle: () => toggle(def.id),
    },
    draggable: false,
    // NB: must stay selectable — react-flow turns pointer-events off
    // for nodes that are neither draggable nor selectable, which
    // would make the collapse header unclickable.
  });

  if (isCollapsed) {
    return { w: CHIP_W, h: CHIP_H, nodes: [clusterNode(CHIP_W, CHIP_H)] };
  }

  const maxW = maxContentW(depth);
  let x = PAD;
  let y = HEADER;
  let rowH = 0;
  let usedW = 0;
  const childNodes: Node[] = [];

  for (const child of def.children) {
    let item: Measured;
    if (typeof child === 'string') {
      const mod = MODULE_BY_ID[child];
      item = {
        w: TILE_W,
        h: TILE_H,
        nodes: [
          {
            id: `${def.id}__${child}`,
            type: 'tile',
            position: { x: 0, y: 0 },
            data: { ...mod, w: TILE_W, h: TILE_H },
            draggable: false,
          },
        ],
      };
    } else {
      item = layoutCluster(child, depth + 1, collapsed, toggle);
    }

    if (x > PAD && x + item.w > maxW) {
      x = PAD;
      y += rowH + GAP;
      rowH = 0;
    }
    const root = item.nodes[0];
    root.position = { x, y };
    root.parentId = def.id;
    childNodes.push(...item.nodes);
    x += item.w + GAP;
    usedW = Math.max(usedW, x - GAP);
    rowH = Math.max(rowH, item.h);
  }

  const w = Math.max(usedW + PAD, 360);
  const h = y + rowH + PAD;
  return { w, h, nodes: [clusterNode(w, h), ...childNodes] };
}

/** Pack the top-level clusters onto the canvas. When everything is
 *  collapsed, wrap into a compact card grid instead of one long row. */
function layoutRoot(collapsed: Set<string>, toggle: (id: string) => void): Node[] {
  const allTopCollapsed = CLUSTER_TREE.every((c) => collapsed.has(c.id));
  const ROOT_MAX_W = allTopCollapsed ? 1600 : 2700;
  // Collapsed grid breathes more so agent pills + edges have room.
  const gapX = allTopCollapsed ? 60 : GAP * 2;
  const gapY = allTopCollapsed ? 90 : GAP * 2;
  let x = 0;
  let y = 0;
  let rowH = 0;
  const nodes: Node[] = [];
  for (const def of CLUSTER_TREE) {
    const item = layoutCluster(def, 0, collapsed, toggle);
    if (x > 0 && x + item.w > ROOT_MAX_W) {
      x = 0;
      y += rowH + gapY;
      rowH = 0;
    }
    item.nodes[0].position = { x, y };
    nodes.push(...item.nodes);
    x += item.w + gapX;
    rowH = Math.max(rowH, item.h);
  }
  return nodes;
}

/* ── Agents floating between their clusters ───────────────────── */

/** Absolute centre of every node (parent offsets accumulated). */
function absCenters(nodes: Node[]): Map<string, { cx: number; cy: number }> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const centers = new Map<string, { cx: number; cy: number }>();
  for (const n of nodes) {
    let x = n.position.x;
    let y = n.position.y;
    let p = n.parentId;
    while (p) {
      const pn = byId.get(p);
      if (!pn) break;
      x += pn.position.x;
      y += pn.position.y;
      p = pn.parentId;
    }
    const d = n.data as { w?: number; h?: number };
    centers.set(n.id, { cx: x + (d.w ?? 0) / 2, cy: y + (d.h ?? 0) / 2 });
  }
  return centers;
}

function buildAgents(
  layoutNodes: Node[],
  collapsed: Set<string>,
  stroke: string,
): { nodes: Node[]; edges: Edge[] } {
  const centers = absCenters(layoutNodes);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const placed: { x: number; y: number }[] = [];
  for (const agent of AGENTS) {
    const reps = [...new Set(agent.connects.map((c) => representative(c, collapsed)))].filter((r) => centers.has(r));
    if (reps.length < 2) continue; // everything folded into one box — agent lives inside it
    const pts = reps.map((r) => centers.get(r)!);
    const cx = pts.reduce((a, p) => a + p.cx, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.cy, 0) / pts.length;
    // Collision relaxation: agents whose midpoints land in the same
    // gap stack on each other — nudge down until clear of all others.
    let x = cx - AGENT_W / 2;
    let y = cy - AGENT_H / 2;
    const collides = () =>
      placed.some((p) => Math.abs(p.x - x) < AGENT_W + 16 && Math.abs(p.y - y) < AGENT_H + 12);
    let guard = 0;
    while (collides() && guard++ < 20) y += AGENT_H + 16;
    placed.push({ x, y });
    nodes.push({
      id: agent.id,
      type: 'agent',
      position: { x, y },
      data: { name: agent.name, w: AGENT_W, h: AGENT_H },
      draggable: true,
      zIndex: 40,
    });
    for (const rep of reps) {
      edges.push({
        id: `${agent.id}->${rep}`,
        source: agent.id,
        target: rep,
        sourceHandle: 'sb',
        targetHandle: 'tt',
        type: 'straight',
        animated: true,
        style: { stroke, strokeWidth: 1.6, opacity: 0.85 },
        zIndex: 30,
      });
    }
  }
  return { nodes, edges };
}

/* ── Connection edges with collapse lifting ───────────────────── */

const EDGE_HANDLE: Record<string, { s: string; t: string }> = {
  t: { s: 'st', t: 'tt' },
  b: { s: 'sb', t: 'tb' },
  l: { s: '', t: 'tl' },
  r: { s: 'sr', t: '' },
};

/** Nearest rendered representative of a cluster: itself, unless an
 *  ancestor is collapsed — then the outermost collapsed ancestor. */
function representative(id: string, collapsed: Set<string>): string {
  for (const ancestor of clusterChain(id)) {
    if (collapsed.has(ancestor)) return ancestor;
  }
  return id;
}

function buildEdges(collapsed: Set<string>, stroke: string, label: { text: string; bg: string }, hideLabels: boolean): Edge[] {
  // Group by lifted endpoint pair so merged flows render as one edge.
  const grouped = new Map<string, { id: string; source: string; target: string; lifted: boolean; count: number; nativeLabel: string; sh?: string; th?: string }>();
  for (const e of CLUSTER_EDGES) {
    const source = representative(e.source, collapsed);
    const target = representative(e.target, collapsed);
    if (source === target) continue; // both ends inside the same collapsed cluster
    const lifted = source !== e.source || target !== e.target;
    const key = `${source}->${target}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      existing.lifted = existing.lifted || lifted;
    } else {
      grouped.set(key, { id: e.id, source, target, lifted, count: 1, nativeLabel: e.label, sh: e.sh, th: e.th });
    }
  }
  return [...grouped.values()].map((g) => ({
    id: g.id,
    source: g.source,
    target: g.target,
    sourceHandle: EDGE_HANDLE[g.lifted ? 'b' : (g.sh ?? 'b')].s || 'sb',
    targetHandle: EDGE_HANDLE[g.lifted ? 't' : (g.th ?? 't')].t || 'tt',
    type: 'smoothstep' as const,
    // Lifted edges drop their wording — an aggregate arrow with a prose
    // label reads as false precision. Show a count when flows merged.
    // In the fully-collapsed grid all labels go: counts only.
    label: g.lifted || hideLabels ? (g.count > 1 ? `${g.count} flows` : undefined) : g.nativeLabel,
    labelStyle: { fontSize: 10, fontWeight: 600, fill: label.text },
    labelBgStyle: { fill: label.bg, fillOpacity: 0.92 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke, strokeWidth: g.count > 1 ? 2.2 : 1.6 },
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
    zIndex: 1,
  }));
}

/* ── Component ────────────────────────────────────────────────── */

export function ClusterFlow() {
  return (
    <ReactFlowProvider>
      <ClusterFlowInner />
    </ReactFlowProvider>
  );
}

const COLLAPSED_KEY = 'arch-map-collapsed';

function ClusterFlowInner() {
  const theme = useTheme();
  const rf = useReactFlow();
  const [collapsed, setCollapsedRaw] = useState<Set<string>>(() => {
    try {
      const known = new Set(allClusterIds());
      const saved: string[] = JSON.parse(localStorage.getItem(COLLAPSED_KEY) || '[]');
      return new Set(saved.filter((id) => known.has(id)));
    } catch {
      return new Set();
    }
  });
  const setCollapsed = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setCollapsedRaw((prev) => {
      const next = updater(prev);
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);
  const [showConnections, setShowConnections] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [query, setQuery] = useState('');
  const [inspect, setInspect] = useState<ModuleTileDef | null>(null);
  const [inspectAgent, setInspectAgent] = useState<AgentDef | null>(null);

  const toggle = useCallback(
    (id: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [setCollapsed],
  );

  const setAll = useCallback(
    (ids: Set<string>) => {
      setCollapsed(() => ids);
      // Re-fit once the new layout has rendered.
      requestAnimationFrame(() => requestAnimationFrame(() => rf.fitView({ padding: 0.06, duration: 300 })));
    },
    [rf, setCollapsed],
  );

  const allTopCollapsed = useMemo(() => CLUSTER_TREE.every((c) => collapsed.has(c.id)), [collapsed]);
  const agentStroke = theme.dark ? '#b794d4' : '#9673a6';

  const { nodes, edges } = useMemo(() => {
    const base = layoutRoot(collapsed, toggle);
    const agents = showAgents ? buildAgents(base, collapsed, agentStroke) : { nodes: [], edges: [] };
    let allNodes = [...base, ...agents.nodes];
    const q = query.trim().toLowerCase();
    if (q) {
      allNodes = allNodes.map((n) => {
        if (n.type !== 'tile') return n;
        const d = n.data as { name?: string; note?: string };
        const hit =
          (d.name ?? '').toLowerCase().includes(q) || (d.note ?? '').toLowerCase().includes(q);
        return { ...n, data: { ...n.data, dim: !hit } };
      });
    }
    const connEdges = showConnections
      ? buildEdges(collapsed, theme.edge.neutral, theme.edgeLabel, allTopCollapsed)
      : [];
    return { nodes: allNodes, edges: [...connEdges, ...agents.edges] };
  }, [collapsed, toggle, query, showAgents, showConnections, allTopCollapsed, theme, agentStroke]);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        colorMode={theme.dark ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.06 }}
        minZoom={0.08}
        maxZoom={2.2}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_e, node) => {
          if (node.type === 'agent') {
            const agent = AGENTS.find((a) => a.id === node.id);
            if (agent) {
              setInspectAgent(agent);
              setInspect(null);
            }
            return;
          }
          if (node.type !== 'tile') return;
          // Tile ids are namespaced `<clusterId>__<moduleId>`.
          const modId = node.id.split('__')[1];
          const mod = MODULE_BY_ID[modId];
          if (mod) {
            setInspect(mod);
            setInspectAgent(null);
          }
        }}
        onPaneClick={() => {
          setInspect(null);
          setInspectAgent(null);
        }}
        style={{ background: theme.app.bg }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={theme.canvas.dots} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            if (n.type === 'cluster') return theme.dark ? '#334155' : '#cbd5e1';
            const status = (n.data as { ui?: string; api?: string }).api === 'done' ? 'live' : 'seeded';
            return status === 'live' ? '#82b366' : '#d79b00';
          }}
        />
      </ReactFlow>

      {/* Expand / collapse controls */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, alignItems: 'center', background: theme.canvas.panelBg, border: `1px solid ${theme.canvas.panelBorder}`, borderRadius: 10, padding: '6px 8px', boxShadow: theme.dark ? '0 1px 4px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.1)' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules…"
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 999,
            border: `1.5px solid ${query ? theme.app.tabActiveBorder : theme.app.tabBorder}`,
            background: 'transparent',
            color: theme.app.title,
            outline: 'none',
            width: 140,
          }}
        />
        <button
          onClick={() => setShowConnections((s) => !s)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            cursor: 'pointer',
            border: `1.5px solid ${showConnections ? theme.edge.neutral : theme.app.tabBorder}`,
            background: showConnections ? `${theme.edge.neutral}22` : 'transparent',
            color: showConnections ? theme.edge.neutral : theme.app.tabText,
            textDecoration: showConnections ? 'none' : 'line-through',
          }}
        >
          Connections
        </button>
        <button
          onClick={() => setShowAgents((s) => !s)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            cursor: 'pointer',
            border: `1.5px solid ${showAgents ? agentStroke : theme.app.tabBorder}`,
            background: showAgents ? `${agentStroke}22` : 'transparent',
            color: showAgents ? agentStroke : theme.app.tabText,
            textDecoration: showAgents ? 'none' : 'line-through',
          }}
        >
          🤖 Agents
        </button>
        <button
          onClick={() => setAll(new Set())}
          style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${theme.app.tabBorder}`, background: 'transparent', color: theme.app.tabText }}
        >
          Expand all
        </button>
        <button
          onClick={() => setAll(new Set(allClusterIds()))}
          style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${theme.app.tabBorder}`, background: 'transparent', color: theme.app.tabText }}
        >
          Collapse all
        </button>
        <span style={{ fontSize: 10.5, color: theme.app.subtitle, alignSelf: 'center', paddingInline: 4 }}>
          click a cluster header to toggle it
        </span>
      </div>

      {inspect && <ModuleInspector mod={inspect} onClose={() => setInspect(null)} />}

      {inspectAgent && (
        <div style={{ position: 'absolute', bottom: 14, left: 14, width: 340, background: theme.inspector.bg, border: `1px solid ${theme.inspector.border}`, borderRadius: 12, padding: '12px 14px', boxShadow: theme.dark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: `${agentStroke}22`, color: agentStroke }}>
              🤖 agent
            </span>
            <button onClick={() => setInspectAgent(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: theme.app.subtitle, fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.inspector.title, marginBottom: 6 }}>{inspectAgent.name}</div>
          <div style={{ fontSize: 11.5, color: theme.inspector.text, lineHeight: 1.45, marginBottom: 8 }}>{inspectAgent.desc}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {inspectAgent.connects.map((c) => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: theme.inspector.chipBg, color: theme.inspector.chipText }}>
                {CLUSTER_NAME[c] ?? c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
