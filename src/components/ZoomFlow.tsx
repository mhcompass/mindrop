/**
 * Zoom Map — same capability hierarchy as the Clusters view, different
 * look & feel: soft blob-shaped modules inside rounded cluster bubbles,
 * presented through SEMANTIC ZOOM instead of collapse/expand.
 *
 *   far  (zoom < 0.55)  — giant cluster names, interiors are faint texture
 *   mid  (0.55 – 1.1)   — sub-cluster names readable, module blobs named
 *   near (zoom ≥ 1.1)   — module status pills + chips materialise
 *
 * Click a bubble to dive into it (camera fitBounds); click a module for
 * the inspector; "Full view" floats you back out.
 */
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  useStore,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';

import { ModuleInspector, PILL_LABEL, Ports } from './nodes';
import { useTheme } from '../theme';
import { CLUSTER_TREE, aggregateCounts, type ClusterTreeDef } from '../model/clusters';
import { MODULE_BY_ID, MODULE_EDGES } from '../model/modules';
import { DB_DOMAINS, DB_TABLE_COUNT, TABLE_BY_ID, TABLE_TO_STATUS, type DbDomainDef, type TableStatus } from '../model/dbschema';
import { STORIES } from '../model/stories';
import { moduleStatus, type ModuleStatus, type ModuleTileDef } from '../model/types';

/* ── Overlay modes (recolour module cards by a chosen dimension) ── */

export type OverlayMode = 'status' | 'owner' | 'effort' | 'sensitivity';

const OWNER_PALETTE = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#64748b', '#d946ef'];
function ownerColor(owner?: string): string {
  if (!owner) return '#94a3b8';
  let h = 0;
  for (const c of owner) h = (h * 31 + c.charCodeAt(0)) | 0;
  return OWNER_PALETTE[Math.abs(h) % OWNER_PALETTE.length];
}
const EFFORT_COLOR: Record<string, string> = { S: '#10b981', M: '#f59e0b', L: '#e11d48' };
const SENS_COLOR: Record<string, string> = { pii: '#e11d48', sensitive: '#f59e0b', internal: '#3b82f6', public: '#10b981' };

function overlayInfo(m: ModuleTileDef, overlay: OverlayMode, statusColor: string): { color: string; label: string } {
  switch (overlay) {
    case 'owner': return { color: ownerColor(m.owner), label: m.owner ?? 'Unassigned' };
    case 'effort': return { color: m.effort ? EFFORT_COLOR[m.effort] : '#94a3b8', label: m.effort ? `${m.effort} effort` : 'sized: —' };
    case 'sensitivity': return { color: m.sensitivity ? SENS_COLOR[m.sensitivity] : '#94a3b8', label: m.sensitivity ?? '—' };
    default: return { color: statusColor, label: PILL_LABEL[moduleStatus(m)] };
  }
}

interface ZoomCtxValue {
  overlay: OverlayMode;
  /** Module ids to dim (filter / story focus); null = none dimmed. */
  dimmed: Set<string> | null;
  /** Module id currently highlighted by story playback. */
  highlight: string | null;
}
const ZoomCtx = createContext<ZoomCtxValue>({ overlay: 'status', dimmed: null, highlight: null });

const MODULE_IDS = Object.keys(MODULE_BY_ID);

/* ── Zoom bands ───────────────────────────────────────────────── */

const FAR = 0.55;
const NEAR = 1.1;

const useZoom = () => useStore((s) => s.transform[2]);

/* ── Node components (semantic-zoom aware) ────────────────────── */

type ZBubbleData = {
  name: string;
  accent: string;
  depth: 0 | 1;
  w: number;
  h: number;
  total: number;
  unit?: 'module' | 'table';
  subtitle?: string;
};

const ZBubble = memo(({ data }: NodeProps) => {
  const d = data as unknown as ZBubbleData;
  const zoom = useZoom();
  const theme = useTheme();
  const far = zoom < FAR;
  const unit = d.unit ?? 'module';

  if (d.depth === 0) {
    return (
      <div
        className="zb zb-cluster"
        style={{
          width: d.w,
          height: d.h,
          borderRadius: 28,
          background: `linear-gradient(155deg, ${d.accent}${theme.dark ? '26' : '1c'} 0%, ${d.accent}${theme.dark ? '0a' : '06'} 45%, ${d.accent}${theme.dark ? '1c' : '12'} 100%)`,
          border: `2px solid ${d.accent}${far ? '7a' : '45'}`,
          boxShadow: `0 36px 110px -48px ${d.accent}${theme.dark ? '99' : '70'}, inset 0 1.5px 0 ${theme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)'}`,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Giant far-view label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: far ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: -2,
              textAlign: 'center',
              lineHeight: 1.02,
              padding: '0 40px',
              backgroundImage: `linear-gradient(180deg, ${d.accent} 25%, ${d.accent}88 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: d.accent,
            }}
          >
            {d.name}
          </span>
          <span style={{ fontSize: 20, fontWeight: 650, letterSpacing: 3, textTransform: 'uppercase', color: theme.cluster.countText }}>
            {d.total} {d.total === 1 ? unit : `${unit}s`}{d.subtitle ? ` · ${d.subtitle}` : ''}
          </span>
        </div>
        {/* Near-view corner chip */}
        <div
          style={{
            position: 'absolute',
            top: 26,
            left: 34,
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            opacity: far ? 0 : 1,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 23, fontWeight: 900, letterSpacing: -0.4, color: d.accent }}>{d.name}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2, color: theme.cluster.countText }}>
            {d.total} {`${unit}s`}{d.subtitle ? ` · ${d.subtitle}` : ''}
          </span>
        </div>
        <Ports />
      </div>
    );
  }

  /* depth 1 — glassy sub-cluster bubble */
  return (
    <div
      className="zb zb-cluster"
      style={{
        width: d.w,
        height: d.h,
        borderRadius: 20,
        background: theme.dark
          ? `linear-gradient(160deg, rgba(15,23,42,0.55), rgba(15,23,42,0.30)), linear-gradient(160deg, ${d.accent}10, transparent)`
          : `linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,255,255,0.40)), linear-gradient(160deg, ${d.accent}10, transparent)`,
        border: `1.5px ${far ? 'dashed' : 'solid'} ${d.accent}4d`,
        boxShadow: `inset 0 1px 0 ${theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}, 0 18px 48px -30px ${d.accent}66`,
        position: 'relative',
        cursor: 'pointer',
        opacity: far ? 0.3 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 17,
          left: 30,
          right: 22,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: d.accent, display: 'inline-block', boxShadow: `0 0 9px ${d.accent}aa`, flexShrink: 0 }} />
        <span style={{ fontSize: 18.5, fontWeight: 800, letterSpacing: -0.3, color: d.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
      </div>
      <Ports />
    </div>
  );
});

type ZModuleData = ModuleTileDef & { w: number; h: number };

const ZModule = memo(({ id, data }: NodeProps) => {
  const d = data as unknown as ZModuleData;
  const zoom = useZoom();
  const theme = useTheme();
  const { overlay, dimmed, highlight } = useContext(ZoomCtx);
  const far = zoom < FAR;
  const near = zoom >= NEAR;
  const status = moduleStatus(d);
  const pill = theme.tile.pill[status];
  const info = overlayInfo(d, overlay, pill.fg);
  const color = info.color;
  const isStatus = overlay === 'status';

  const glyph = (s: 'done' | 'partial' | 'none') => (s === 'done' ? '✓' : s === 'partial' ? '◐' : '—');
  const meta = d.infra ? 'service' : d.feOnly ? 'FE-only' : d.external ? 'external' : `UI ${glyph(d.ui)} · API ${glyph(d.api)}`;

  const modId = id.replace('z__', '');
  const dim = dimmed?.has(modId) ?? false;
  const lit = highlight === modId;

  return (
    <div
      className="zb zb-mod"
      style={{
        width: d.w,
        height: d.h,
        borderRadius: 13,
        background: far
          ? color
          : isStatus
            ? `linear-gradient(150deg, ${pill.bg} 0%, ${pill.bg} 60%, ${color}${theme.dark ? '24' : '16'} 130%)`
            : theme.dark ? '#141c2b' : '#ffffff',
        borderTop: `1.5px solid ${color}${far ? '00' : '85'}`,
        borderRight: `1.5px solid ${color}${far ? '00' : '85'}`,
        borderBottom: `1.5px solid ${color}${far ? '00' : '85'}`,
        borderLeft: `${isStatus ? 1.5 : 4}px solid ${color}${far ? '00' : isStatus ? '85' : 'ff'}`,
        opacity: far ? 0.3 : dim ? 0.16 : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '11px 13px',
        cursor: 'pointer',
        transition: 'opacity 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: lit ? 'scale(1.05)' : 'none',
        boxShadow: far
          ? 'none'
          : lit
            ? `0 0 0 3px ${color}, 0 16px 40px -10px ${color}`
            : `inset 0 1px 0 ${theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.55)'}, 0 10px 24px -15px ${color}${theme.dark ? 'aa' : '70'}`,
      }}
      title={d.name}
    >
      {/* Header — dot + name, left aligned */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, opacity: far ? 0 : 1, transition: 'opacity 0.3s' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, marginTop: 4, background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}99` }} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 750,
            letterSpacing: -0.2,
            lineHeight: 1.22,
            color: theme.dark ? '#f1f3f6' : '#1f2937',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {d.name}
        </span>
      </div>
      {/* Footer — overlay pill (+ UI/API meta in status mode), fades in near */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, opacity: near ? 1 : 0, transition: 'opacity 0.3s' }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.1,
            padding: '2px 8px',
            borderRadius: 999,
            background: theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.85)',
            color,
            boxShadow: `inset 0 0 0 1px ${color}33`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {info.label}
        </span>
        {isStatus && <span style={{ fontSize: 9, fontWeight: 600, color: theme.dark ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap' }}>{meta}</span>}
      </div>
      <Ports />
    </div>
  );
});

type ZTableData = { id: string; name: string; status: TableStatus; note?: string; w: number; h: number };

const ZTable = memo(({ data }: NodeProps) => {
  const d = data as unknown as ZTableData;
  const zoom = useZoom();
  const theme = useTheme();
  const far = zoom < FAR;
  const near = zoom >= NEAR;
  const pill = theme.tile.pill[TABLE_TO_STATUS[d.status]];

  return (
    <div
      className="zb zb-mod"
      style={{
        width: d.w,
        height: d.h,
        borderRadius: 9,
        background: far ? pill.fg : theme.dark ? '#131b29' : '#ffffff',
        border: `1.5px solid ${pill.fg}${far ? '00' : '55'}`,
        borderLeft: `4px solid ${pill.fg}`,
        opacity: far ? 0.3 : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1,
        padding: '6px 11px',
        cursor: 'pointer',
        boxShadow: far ? 'none' : theme.dark ? '0 4px 12px -7px rgba(0,0,0,0.6)' : '0 4px 12px -7px rgba(15,23,42,0.2)',
      }}
      title={d.name}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: far ? 0 : 1, transition: 'opacity 0.3s' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: pill.fg, flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: -0.2,
            color: theme.dark ? '#e5e7eb' : '#1f2937',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {d.name}
        </span>
      </div>
      {d.note && (
        <div
          style={{
            fontSize: 8.5,
            fontWeight: 500,
            color: theme.dark ? '#94a3b8' : '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingLeft: 12,
            opacity: near ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          {d.note}
        </div>
      )}
      <Ports />
    </div>
  );
});

const ZOOM_NODE_TYPES = { zbubble: ZBubble, zmodule: ZModule, ztable: ZTable };

/* ── Legend (status key) ──────────────────────────────────────── */

const LEGEND_ITEMS: { status: 'implemented' | 'partial' | 'ui-only' | 'planned' }[] = [
  { status: 'implemented' },
  { status: 'partial' },
  { status: 'ui-only' },
  { status: 'planned' },
];

function ZoomLegend({
  overlay,
  statusFilter,
  onToggleStatus,
}: {
  overlay: OverlayMode;
  statusFilter: Set<ModuleStatus>;
  onToggleStatus: (s: ModuleStatus) => void;
}) {
  const theme = useTheme();

  let title: string;
  let rows: { color: string; label: string; status?: ModuleStatus }[];
  if (overlay === 'status') {
    title = 'Status · click to filter';
    rows = LEGEND_ITEMS.map(({ status }) => ({ color: theme.tile.pill[status].fg, label: PILL_LABEL[status], status }));
  } else if (overlay === 'owner') {
    title = 'Owner';
    const owners = Array.from(new Set(MODULE_IDS.map((id) => MODULE_BY_ID[id].owner).filter(Boolean))) as string[];
    rows = owners.map((o) => ({ color: ownerColor(o), label: o }));
  } else if (overlay === 'effort') {
    title = 'Build effort';
    rows = [
      { color: EFFORT_COLOR.S, label: 'S — small' },
      { color: EFFORT_COLOR.M, label: 'M — medium' },
      { color: EFFORT_COLOR.L, label: 'L — large' },
      { color: '#94a3b8', label: 'not sized' },
    ];
  } else {
    title = 'Data sensitivity';
    rows = [
      { color: SENS_COLOR.pii, label: 'PII' },
      { color: SENS_COLOR.sensitive, label: 'Sensitive' },
      { color: SENS_COLOR.internal, label: 'Internal' },
      { color: SENS_COLOR.public, label: 'Public' },
    ];
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        minWidth: 210,
        background: theme.canvas.panelBg,
        border: `1px solid ${theme.canvas.panelBorder}`,
        borderRadius: 12,
        padding: '11px 14px',
        boxShadow: theme.dark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(15,23,42,0.1)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.app.subtitle, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16, rowGap: 6 }}>
        {rows.map((r, i) => {
          const clickable = r.status !== undefined;
          const muted = clickable && statusFilter.size > 0 && !statusFilter.has(r.status!);
          return (
            <div
              key={i}
              onClick={clickable ? () => onToggleStatus(r.status!) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: clickable ? 'pointer' : 'default', opacity: muted ? 0.38 : 1, userSelect: 'none' }}
            >
              <span style={{ width: 11, height: 11, borderRadius: 4, background: r.color, boxShadow: `0 0 6px ${r.color}66`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: theme.app.legendText, whiteSpace: 'nowrap' }}>{r.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: theme.canvas.panelBorder, margin: '9px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: theme.app.subtitle }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="22" height="8" aria-hidden>
            <line x1="0" y1="4" x2="16" y2="4" stroke={theme.edge.neutral} strokeWidth="1.6" />
            <path d="M16 4 l-4 -2.5 v5 z" fill={theme.edge.neutral} />
          </svg>
          relation
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: theme.app.legendText }}>tbl</span> DB table
        </span>
      </div>
    </div>
  );
}

/* ── Layout (all expanded — zoom replaces collapse) ───────────── */

const MOD_W = 234;
const MOD_H = 88;
const GAP = 26;
const PAD = 34;
const TOP_HEAD = 104;
const SUB_HEAD = 58;
const SUB_MAX_W = 3 * MOD_W + 2 * GAP + 2 * PAD;
const TOP_MAX_W = 1750;
const ROOT_MAX_W = 3900;

/* Data Model (Postgres schema) — deeper leaf level: domain → table. */
const TBL_W = 188;
const TBL_H = 46;
const TGAP = 12;
const DOM_HEAD = 46;
const DOM_PAD = 16;
const DOM_MAX_W = 2 * TBL_W + TGAP + 2 * DOM_PAD; // 2 tables per row
const DM_MAX_W = 3 * (DOM_MAX_W + GAP) + PAD; // ~3 domains per row
const DATAMODEL_ACCENT = '#6366f1';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Measured {
  w: number;
  h: number;
  nodes: Node[];
}

function layoutZCluster(def: ClusterTreeDef, depth: 0 | 1): Measured {
  const header = depth === 0 ? TOP_HEAD : SUB_HEAD;
  const maxW = depth === 0 ? TOP_MAX_W : SUB_MAX_W;
  let x = PAD;
  let y = header;
  let rowH = 0;
  let usedW = 0;
  const childNodes: Node[] = [];

  for (const child of def.children) {
    let item: Measured;
    if (typeof child === 'string') {
      const mod = MODULE_BY_ID[child];
      item = {
        w: MOD_W,
        h: MOD_H,
        nodes: [
          {
            id: `z__${child}`,
            type: 'zmodule',
            position: { x: 0, y: 0 },
            data: { ...mod, w: MOD_W, h: MOD_H },
            draggable: false,
            zIndex: 4,
          },
        ],
      };
    } else {
      item = layoutZCluster(child, 1);
    }
    if (x > PAD && x + item.w > maxW) {
      x = PAD;
      y += rowH + GAP;
      rowH = 0;
    }
    const root = item.nodes[0];
    root.position = { x, y };
    root.parentId = `z_${def.id}`;
    childNodes.push(...item.nodes);
    x += item.w + GAP;
    usedW = Math.max(usedW, x - GAP);
    rowH = Math.max(rowH, item.h);
  }

  const w = Math.max(usedW + PAD, depth === 0 ? 760 : 520);
  const h = y + rowH + PAD;
  const counts = aggregateCounts(def);
  const total = counts.implemented + counts.partial + counts['ui-only'] + counts.planned;
  const self: Node = {
    id: `z_${def.id}`,
    type: 'zbubble',
    position: { x: 0, y: 0 },
    data: { name: def.name, accent: def.accent, depth, w, h, total },
    draggable: false,
    zIndex: depth === 0 ? 0 : 2,
  };
  return { w, h, nodes: [self, ...childNodes] };
}

/** One domain bubble (depth 1) packed with table leaves. */
function layoutDbDomain(dom: DbDomainDef): Measured {
  let x = DOM_PAD;
  let y = DOM_HEAD;
  let rowH = 0;
  let usedW = 0;
  const childNodes: Node[] = [];
  for (const tb of dom.tables) {
    if (x > DOM_PAD && x + TBL_W > DOM_MAX_W) {
      x = DOM_PAD;
      y += rowH + TGAP;
      rowH = 0;
    }
    childNodes.push({
      id: `z__${tb.id}`,
      type: 'ztable',
      position: { x, y },
      parentId: `z_${dom.id}`,
      data: { id: tb.id, name: tb.name, status: tb.status, note: tb.note, w: TBL_W, h: TBL_H },
      draggable: false,
      zIndex: 4,
    });
    x += TBL_W + TGAP;
    usedW = Math.max(usedW, x - TGAP);
    rowH = Math.max(rowH, TBL_H);
  }
  const w = Math.max(usedW + DOM_PAD, 320);
  const h = y + rowH + DOM_PAD;
  const self: Node = {
    id: `z_${dom.id}`,
    type: 'zbubble',
    position: { x: 0, y: 0 },
    data: { name: dom.name, accent: dom.accent, depth: 1, w, h, total: dom.tables.length, unit: 'table' },
    draggable: false,
    zIndex: 2,
  };
  return { w, h, nodes: [self, ...childNodes] };
}

/** The "Data Model" top-level bubble (depth 0) of domain bubbles. */
function layoutDbModel(): Measured {
  let x = PAD;
  let y = TOP_HEAD;
  let rowH = 0;
  let usedW = 0;
  const childNodes: Node[] = [];
  for (const dom of DB_DOMAINS) {
    const item = layoutDbDomain(dom);
    if (x > PAD && x + item.w > DM_MAX_W) {
      x = PAD;
      y += rowH + GAP;
      rowH = 0;
    }
    item.nodes[0].position = { x, y };
    item.nodes[0].parentId = 'z_c_datamodel';
    childNodes.push(...item.nodes);
    x += item.w + GAP;
    usedW = Math.max(usedW, x - GAP);
    rowH = Math.max(rowH, item.h);
  }
  const w = Math.max(usedW + PAD, 760);
  const h = y + rowH + PAD;
  const self: Node = {
    id: 'z_c_datamodel',
    type: 'zbubble',
    position: { x: 0, y: 0 },
    data: { name: 'Data Model', accent: DATAMODEL_ACCENT, depth: 0, w, h, total: DB_TABLE_COUNT, unit: 'table', subtitle: 'Postgres schema' },
    draggable: false,
    zIndex: 0,
  };
  return { w, h, nodes: [self, ...childNodes] };
}

function layoutZRoot(): { nodes: Node[]; rects: Map<string, Rect> } {
  let x = 0;
  let y = 0;
  let rowH = 0;
  const nodes: Node[] = [];
  for (const def of CLUSTER_TREE) {
    const item = layoutZCluster(def, 0);
    if (x > 0 && x + item.w > ROOT_MAX_W) {
      x = 0;
      y += rowH + 140;
      rowH = 0;
    }
    item.nodes[0].position = { x, y };
    nodes.push(...item.nodes);
    x += item.w + 140;
    rowH = Math.max(rowH, item.h);
  }
  // Data Model sits on its own row beneath the capability clusters.
  const dm = layoutDbModel();
  dm.nodes[0].position = { x: 0, y: y + rowH + 200 };
  nodes.push(...dm.nodes);

  // Absolute rects (accumulate parent offsets) for click-to-zoom.
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rects = new Map<string, Rect>();
  for (const n of nodes) {
    let ax = n.position.x;
    let ay = n.position.y;
    let p = n.parentId;
    while (p) {
      const pn = byId.get(p);
      if (!pn) break;
      ax += pn.position.x;
      ay += pn.position.y;
      p = pn.parentId;
    }
    const d = n.data as { w?: number; h?: number };
    rects.set(n.id, { x: ax, y: ay, width: d.w ?? 0, height: d.h ?? 0 });
  }
  return { nodes, rects };
}

/* ── Component ────────────────────────────────────────────────── */

export function ZoomFlow() {
  return (
    <ReactFlowProvider>
      <ZoomFlowInner />
    </ReactFlowProvider>
  );
}

function ZoomFlowInner() {
  const theme = useTheme();
  const rf = useReactFlow();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inspect, setInspect] = useState<ModuleTileDef | null>(null);
  const [inspectTable, setInspectTable] = useState<(typeof TABLE_BY_ID)[string] | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [overlay, setOverlay] = useState<OverlayMode>('status');
  const [statusFilter, setStatusFilter] = useState<Set<ModuleStatus>>(new Set());
  const [story, setStory] = useState<{ id: string; step: number } | null>(null);
  const [exporting, setExporting] = useState(false);

  const { nodes, rects } = useMemo(() => layoutZRoot(), []);

  // At far zoom the interiors are just texture — make them click-
  // transparent so clicking anywhere on a cluster (even on its giant
  // name overlaying faint blobs) dives into the cluster, not a blob.
  const band = useStore((s) => (s.transform[2] < FAR ? 'far' : 'near'));

  // Module-to-module relations. Hidden at far zoom (pure noise under
  // the giant names); fade in once module cards are readable.
  const edges = useMemo<Edge[]>(() => {
    if (!showConnections || band === 'far') return [];
    return MODULE_EDGES.map((e) => ({
      id: e.id,
      source: `z__${e.source}`,
      target: `z__${e.target}`,
      sourceHandle: 'sb',
      targetHandle: 'tt',
      type: 'default' as const,
      label: e.label,
      labelStyle: { fontSize: 10, fontWeight: 600, fill: theme.edgeLabel.text },
      labelBgStyle: { fill: theme.edgeLabel.bg, fillOpacity: 0.92 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: theme.edge.neutral, strokeWidth: 1.5, opacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: theme.edge.neutral, width: 13, height: 13 },
      zIndex: 3, // above bubbles (0/2), below module cards (4)
    }));
  }, [showConnections, band, theme]);
  const displayNodes = useMemo(
    () =>
      nodes.map((n) => {
        const isInterior =
          n.type === 'zmodule' || n.type === 'ztable' || (n.type === 'zbubble' && (n.data as { depth?: number }).depth === 1);
        if (!isInterior) return n;
        return { ...n, style: { ...n.style, pointerEvents: band === 'far' ? ('none' as const) : ('auto' as const) } };
      }),
    [nodes, band],
  );

  /* ── Filter + story focus → dim set + highlight ── */
  const activeStory = story ? STORIES.find((s) => s.id === story.id) ?? null : null;
  const highlight = activeStory ? activeStory.steps[story!.step]?.module ?? null : null;
  const dimmed = useMemo<Set<string> | null>(() => {
    if (activeStory) {
      const keep = new Set(activeStory.steps.map((s) => s.module));
      return new Set(MODULE_IDS.filter((id) => !keep.has(id)));
    }
    if (statusFilter.size > 0) {
      return new Set(MODULE_IDS.filter((id) => {
        const m = MODULE_BY_ID[id];
        return m && !statusFilter.has(moduleStatus(m));
      }));
    }
    return null;
  }, [activeStory, statusFilter]);

  /* ── Story playback — advance + pan the camera per step ── */
  useEffect(() => {
    if (!activeStory || !story) return;
    const stepDef = activeStory.steps[story.step];
    if (!stepDef) return;
    const rect = rects.get(`z__${stepDef.module}`);
    if (rect) rf.setCenter(rect.x + rect.width / 2, rect.y + rect.height / 2, { zoom: 1.3, duration: 800 });
    const t = window.setTimeout(() => {
      setStory((prev) => (prev && prev.step + 1 < activeStory.steps.length ? { id: prev.id, step: prev.step + 1 } : null));
    }, 3800);
    return () => window.clearTimeout(t);
  }, [activeStory, story, rects, rf]);

  const stopStory = useCallback(() => {
    setStory(null);
    rf.fitView({ padding: 0.05, duration: 600 });
  }, [rf]);

  const exportPng = useCallback(async () => {
    const pane = wrapRef.current?.querySelector('.react-flow') as HTMLElement | null;
    if (!pane) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(pane, {
        backgroundColor: theme.dark ? '#0b1120' : '#f7f8fa',
        pixelRatio: 2,
        filter: (node) => {
          const el = node as HTMLElement;
          return !el?.classList?.contains?.('react-flow__minimap') && !el?.classList?.contains?.('react-flow__controls');
        },
      });
      const a = document.createElement('a');
      a.download = 'aiops-zoom-map.png';
      a.href = dataUrl;
      a.click();
    } finally {
      setExporting(false);
    }
  }, [theme.dark]);

  return (
    <ZoomCtx.Provider value={{ overlay, dimmed, highlight }}>
    <div ref={wrapRef} style={{ flex: 1, position: 'relative', minHeight: 0 }}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={ZOOM_NODE_TYPES}
        colorMode={theme.dark ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.05 }}
        minZoom={0.1}
        maxZoom={2.6}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_e, node) => {
          if (node.type === 'ztable') {
            const tb = TABLE_BY_ID[node.id.replace('z__', '')];
            if (tb) { setInspectTable(tb); setInspect(null); }
            return;
          }
          if (node.type === 'zmodule') {
            const mod = MODULE_BY_ID[node.id.replace('z__', '')];
            if (mod) { setInspect(mod); setInspectTable(null); }
            return;
          }
          const rect = rects.get(node.id);
          if (rect) rf.fitBounds(rect, { padding: 0.12, duration: 700 });
        }}
        onPaneClick={() => { setInspect(null); setInspectTable(null); }}
        style={{ background: theme.zoomCanvas }}
      >
        <Background variant={BackgroundVariant.Dots} gap={34} size={1.1} color={theme.canvas.dots} />
        <Controls showInteractive={false} position="top-left" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            if (n.type === 'zbubble') return ((n.data as { accent?: string }).accent ?? '#94a3b8') + '66';
            const key = n.id.replace('z__', '');
            const mod = MODULE_BY_ID[key];
            if (mod) return theme.tile.pill[moduleStatus(mod)].fg;
            const tb = TABLE_BY_ID[key];
            return tb ? theme.tile.pill[TABLE_TO_STATUS[tb.status]].fg : '#94a3b8';
          }}
        />
      </ReactFlow>

      {/* Top-right — overlay colour mode + tools */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 700, background: theme.canvas.panelBg, border: `1px solid ${theme.canvas.panelBorder}`, borderRadius: 10, padding: '6px 8px', boxShadow: theme.dark ? '0 1px 4px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: theme.app.subtitle }}>Colour</span>
        {(['status', 'owner', 'effort', 'sensitivity'] as OverlayMode[]).map((o) => (
          <button key={o} onClick={() => setOverlay(o)} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', textTransform: 'capitalize', border: `1.5px solid ${overlay === o ? theme.app.tabActiveBorder : theme.app.tabBorder}`, background: overlay === o ? theme.app.tabActiveBg : 'transparent', color: overlay === o ? theme.app.tabActiveText : theme.app.tabText }}>{o}</button>
        ))}
        <span style={{ width: 1, height: 18, background: theme.canvas.panelBorder }} />
        <button onClick={() => setShowConnections((s) => !s)} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${showConnections ? theme.edge.neutral : theme.app.tabBorder}`, background: showConnections ? `${theme.edge.neutral}22` : 'transparent', color: showConnections ? theme.edge.neutral : theme.app.tabText, textDecoration: showConnections ? 'none' : 'line-through' }}>Connections</button>
        <button onClick={exportPng} disabled={exporting} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${theme.app.tabBorder}`, background: 'transparent', color: theme.app.tabText }}>{exporting ? '…' : '⤓ PNG'}</button>
        <button onClick={() => rf.fitView({ padding: 0.05, duration: 700 })} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${theme.app.tabBorder}`, background: 'transparent', color: theme.app.tabText }}>⤺ Full</button>
      </div>

      {/* Top-centre — value-stream story playback */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'center', background: theme.canvas.panelBg, border: `1px solid ${theme.canvas.panelBorder}`, borderRadius: 999, padding: '5px 10px', boxShadow: theme.dark ? '0 1px 4px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: theme.app.subtitle }}>▶ Play story</span>
        {STORIES.map((s) => (
          <button key={s.id} title={s.title} onClick={() => setStory({ id: s.id, step: 0 })} style={{ width: 24, height: 24, borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 800, border: `1.5px solid ${story?.id === s.id ? s.tone : theme.app.tabBorder}`, background: story?.id === s.id ? s.tone : 'transparent', color: story?.id === s.id ? '#fff' : theme.app.tabText }}>{s.id}</button>
        ))}
      </div>

      {/* Story caption banner */}
      {activeStory && story && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 'min(680px, 78vw)', background: theme.inspector.bg, border: `1.5px solid ${activeStory.tone}`, borderRadius: 14, padding: '12px 16px', boxShadow: '0 10px 34px rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', gap: 14, zIndex: 5 }}>
          <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: activeStory.tone, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{activeStory.id}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: activeStory.tone, marginBottom: 2 }}>{activeStory.title} · {story.step + 1}/{activeStory.steps.length}</div>
            <div style={{ fontSize: 12.5, color: theme.inspector.text, lineHeight: 1.4 }}>{activeStory.steps[story.step]?.caption}</div>
          </div>
          <button onClick={stopStory} style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${theme.app.tabBorder}`, background: 'transparent', color: theme.app.tabText }}>■ Stop</button>
        </div>
      )}

      {inspect ? (
        <ModuleInspector mod={inspect} onClose={() => setInspect(null)} />
      ) : inspectTable ? (
        <TableInspector table={inspectTable} onClose={() => setInspectTable(null)} />
      ) : (
        <ZoomLegend
          overlay={overlay}
          statusFilter={statusFilter}
          onToggleStatus={(s) =>
            setStatusFilter((prev) => {
              const n = new Set(prev);
              if (n.has(s)) n.delete(s);
              else n.add(s);
              return n;
            })
          }
        />
      )}
    </div>
    </ZoomCtx.Provider>
  );
}

/* ── Table inspector ──────────────────────────────────────────── */

function TableInspector({ table, onClose }: { table: (typeof TABLE_BY_ID)[string]; onClose: () => void }) {
  const theme = useTheme();
  const pill = theme.tile.pill[TABLE_TO_STATUS[table.status]];
  const label = table.status === 'live' ? 'Live' : table.status === 'partial' ? 'Partial' : 'To build';
  return (
    <div style={{ position: 'absolute', bottom: 14, left: 14, width: 320, background: theme.inspector.bg, border: `1px solid ${theme.inspector.border}`, borderRadius: 12, padding: '12px 14px', boxShadow: theme.dark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: pill.bg, color: pill.fg }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: theme.app.subtitle }}>{table.domain}</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: theme.app.subtitle, fontSize: 14 }}>✕</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: pill.fg, flexShrink: 0 }} />
        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, fontWeight: 700, color: theme.inspector.title }}>{table.name}</span>
      </div>
      {table.note && <div style={{ fontSize: 11.5, color: theme.inspector.text, lineHeight: 1.45, marginBottom: 7 }}>{table.note}</div>}
      <div style={{ fontSize: 10.5, color: theme.app.subtitle }}>
        owned by <span style={{ fontWeight: 700, color: theme.inspector.text }}>{MODULE_BY_ID[table.owner]?.name ?? table.owner}</span>
      </div>
    </div>
  );
}
