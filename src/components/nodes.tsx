import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTheme } from '../theme';
import type { Status, ReadinessRow, ModuleTileDef, PartState } from '../model/types';
import { moduleStatus } from '../model/types';

/* Six invisible handles so edges can attach on any side. */
export function Ports() {
  const hidden = { opacity: 0, pointerEvents: 'none' as const, width: 1, height: 1, minWidth: 1, minHeight: 1 };
  return (
    <>
      <Handle id="tt" type="target" position={Position.Top} style={hidden} />
      <Handle id="st" type="source" position={Position.Top} style={hidden} />
      <Handle id="tb" type="target" position={Position.Bottom} style={hidden} />
      <Handle id="sb" type="source" position={Position.Bottom} style={hidden} />
      <Handle id="tl" type="target" position={Position.Left} style={hidden} />
      <Handle id="sr" type="source" position={Position.Right} style={hidden} />
    </>
  );
}

/* ── Component box ────────────────────────────────────────────── */

export type BoxData = {
  label: string;
  status: Status;
  w: number;
  h: number;
  dashed?: boolean;
  fontSize?: number;
};

export const BoxNode = memo(({ data }: NodeProps) => {
  const d = data as BoxData;
  const theme = useTheme();
  const p = theme.box[d.status];
  if (d.status === 'note') {
    return (
      <div style={{ width: d.w, height: d.h, fontSize: d.fontSize ?? 11, fontStyle: 'italic', color: p.text, display: 'flex', alignItems: 'center' }}>
        {d.label}
        <Ports />
      </div>
    );
  }
  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        background: p.bg,
        border: `2px ${d.dashed || d.status === 'planned' || d.status === 'shared' ? 'dashed' : 'solid'} ${p.border}`,
        borderRadius: 8,
        color: p.text,
        fontSize: d.fontSize ?? 11,
        lineHeight: 1.25,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: theme.dark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <span>{d.label}</span>
      <Ports />
    </div>
  );
});

/* ── Background zone ──────────────────────────────────────────── */

export type ZoneData = {
  label: string;
  status: Status;
  w: number;
  h: number;
};

export const ZoneNode = memo(({ data }: NodeProps) => {
  const d = data as ZoneData;
  const theme = useTheme();
  const p = theme.zone[d.status] ?? theme.zone.infra;
  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        background: p.bg,
        border: `1.5px ${d.status === 'planned' ? 'dashed' : 'solid'} ${p.border}`,
        borderRadius: 4,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 10,
          right: 10,
          fontSize: 13,
          fontWeight: 700,
          color: p.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {d.label}
      </div>
      <Ports />
    </div>
  );
});

/* ── Readiness card (swimlane-style with ✓ ◐ ✗ rows) ──────────── */

export type CardData = {
  title: string;
  tone: 'seeded' | 'live' | 'demo' | 'plan';
  w: number;
  h: number;
  rows: ReadinessRow[];
};

export const CardNode = memo(({ data }: NodeProps) => {
  const d = data as CardData;
  const theme = useTheme();
  const tone = theme.card.tones[d.tone];
  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        background: theme.card.bg,
        border: `2px solid ${tone.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: theme.dark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ background: tone.bar, padding: '6px 10px', fontSize: 13, fontWeight: 700, color: tone.title, borderBottom: `1px solid ${tone.border}` }}>
        {d.title}
      </div>
      <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
        {d.rows.map((r, i) => (
          <div key={i} style={{ fontSize: 10.5, lineHeight: 1.3, color: theme.card.rowText, display: 'flex', gap: 6 }}>
            <span style={{ color: theme.card.marks[r.m], fontWeight: 700, flexShrink: 0 }}>{r.m}</span>
            <span>{r.t}</span>
          </div>
        ))}
      </div>
      <Ports />
    </div>
  );
});

/* ── Module tracker tile (neutral inventory) ──────────────────── */

export type TileData = ModuleTileDef & { w: number; h: number; dim?: boolean };

const STATE_GLYPH: Record<PartState, string> = { done: '✓', partial: '◐', none: '—' };

export const PILL_LABEL: Record<string, string> = {
  implemented: 'Implemented',
  partial: 'Partial',
  'ui-only': 'UI only',
  planned: 'Not started',
};

export const TileNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as TileData;
  const theme = useTheme();
  const t = theme.tile;
  const status = moduleStatus(d);
  const pill = t.pill[status];

  const chip = (label: string, state: PartState) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: t.chipBg, color: t.chipState[state] }}>
      {label} {STATE_GLYPH[state]}
    </span>
  );

  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        background: t.bg,
        border: `1.5px solid ${t.border}`,
        borderLeft: `4px solid ${pill.fg}`,
        borderRadius: 10,
        padding: '9px 11px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        boxShadow: theme.dark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.05)',
        opacity: d.dim ? 0.22 : 1,
        transition: 'opacity 0.15s',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: t.name, lineHeight: 1.2 }}>{d.name}</div>
      {d.note && (
        <div style={{ fontSize: 9.5, color: t.note, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {d.note}
        </div>
      )}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
        {d.infra ? (
          chip('SVC', d.api)
        ) : (
          <>
            {chip('UI', d.ui)}
            {d.feOnly ? (
              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: t.chipBg, color: t.note }}>FE-only</span>
            ) : (
              chip('API', d.api)
            )}
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: pill.bg, color: pill.fg }}>
          {PILL_LABEL[status]}
        </span>
      </div>
      <Ports />
    </div>
  );
});

/* ── Cluster container (collapsible, rollup counts) ───────────── */

export type ClusterCountsData = { implemented: number; partial: number; 'ui-only': number; planned: number };

export type ClusterData = {
  name: string;
  accent: string;
  w: number;
  h: number;
  depth: number;
  collapsed: boolean;
  counts: ClusterCountsData;
  onToggle: () => void;
};

const COUNT_GLYPH: { key: keyof ClusterCountsData; glyph: string }[] = [
  { key: 'implemented', glyph: '●' },
  { key: 'partial', glyph: '◑' },
  { key: 'ui-only', glyph: '◔' },
  { key: 'planned', glyph: '○' },
];

/** Stacked status-distribution bar — one segment per status. */
function StatusBar({ counts, height = 5 }: { counts: ClusterCountsData; height?: number }) {
  const theme = useTheme();
  const total = COUNT_GLYPH.reduce((a, { key }) => a + counts[key], 0);
  if (total === 0) return null;
  return (
    <div style={{ display: 'flex', height, borderRadius: height, overflow: 'hidden', background: theme.canvas.panelBorder }}>
      {COUNT_GLYPH.filter(({ key }) => counts[key] > 0).map(({ key }) => (
        <div key={key} style={{ width: `${(counts[key] / total) * 100}%`, background: theme.tile.pill[key].fg }} />
      ))}
    </div>
  );
}

export const ClusterNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as ClusterData;
  const theme = useTheme();
  const c = theme.cluster;
  const depthIdx = Math.min(d.depth, c.fill.length - 1);
  const total = COUNT_GLYPH.reduce((a, { key }) => a + d.counts[key], 0);

  /* ── Collapsed: self-contained summary card ── */
  if (d.collapsed) {
    return (
      <div
        onClick={d.onToggle}
        title="Expand cluster"
        style={{
          width: d.w,
          height: d.h,
          background: theme.tile.bg,
          border: `1.5px solid ${c.border[depthIdx]}`,
          borderTop: `4px solid ${d.accent}`,
          borderRadius: 14,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          cursor: 'pointer',
          userSelect: 'none',
          boxShadow: theme.dark ? '0 2px 8px rgba(0,0,0,0.45)' : '0 2px 8px rgba(15,23,42,0.10)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: c.countText }}>▸</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: d.accent, letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.name}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: c.countText, background: theme.tile.chipBg, padding: '2px 8px', borderRadius: 999 }}>
            {total} {total === 1 ? 'module' : 'modules'}
          </span>
        </div>
        <StatusBar counts={d.counts} height={6} />
        <div style={{ display: 'flex', gap: 10 }}>
          {COUNT_GLYPH.filter(({ key }) => d.counts[key] > 0).map(({ key, glyph }) => (
            <span key={key} style={{ fontSize: 10, fontWeight: 700, color: theme.tile.pill[key].fg }}>
              {glyph} {d.counts[key]}
            </span>
          ))}
        </div>
        <Ports />
      </div>
    );
  }

  /* ── Expanded: container with header + thin distribution bar ── */
  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        background: c.fill[depthIdx],
        border: `1.5px solid ${c.border[depthIdx]}`,
        borderTop: `3px solid ${d.accent}`,
        borderRadius: 12,
      }}
    >
      <div
        onClick={d.onToggle}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: d.depth === 0 ? '8px 14px 0' : '7px 12px 0',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        title="Collapse cluster"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: c.countText }}>▾</span>
          <span style={{ fontSize: d.depth === 0 ? 14 : 12.5, fontWeight: 800, color: d.depth === 0 ? d.accent : c.title, letterSpacing: 0.2 }}>
            {d.name}
          </span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
            {COUNT_GLYPH.filter(({ key }) => d.counts[key] > 0).map(({ key, glyph }) => (
              <span key={key} style={{ fontSize: 10.5, fontWeight: 700, color: theme.tile.pill[key].fg }}>
                {glyph} {d.counts[key]}
              </span>
            ))}
          </span>
        </div>
        <StatusBar counts={d.counts} height={4} />
      </div>
      <Ports />
    </div>
  );
});

/* ── Agent node — actor working between clusters ──────────────── */

export type AgentData = {
  name: string;
  w: number;
  h: number;
};

export const AgentNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as AgentData;
  const theme = useTheme();
  return (
    <div
      style={{
        width: d.w,
        height: d.h,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        borderRadius: 999,
        background: theme.dark ? '#251b30' : '#faf5ff',
        border: `2px solid ${theme.dark ? '#9673a6' : '#9673a6'}`,
        boxShadow: theme.dark
          ? '0 0 0 4px rgba(150,115,166,0.18), 0 2px 10px rgba(0,0,0,0.5)'
          : '0 0 0 4px rgba(150,115,166,0.14), 0 2px 10px rgba(15,23,42,0.15)',
        cursor: 'pointer',
      }}
      title={d.name}
    >
      <span style={{ fontSize: 14 }} aria-hidden>🤖</span>
      <span style={{ fontSize: 11, fontWeight: 800, color: theme.dark ? '#e3cdf0' : '#5b3a73', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d.name}
      </span>
      <Ports />
    </div>
  );
});

export const NODE_TYPES = { box: BoxNode, zone: ZoneNode, card: CardNode, tile: TileNode, cluster: ClusterNode, agent: AgentNode };

/* ── Module inspector panel (shared by tracker + clusters) ────── */

export function ModuleInspector({ mod, onClose }: { mod: ModuleTileDef; onClose: () => void }) {
  const theme = useTheme();
  const t = theme.tile;
  const status = moduleStatus(mod);
  const pill = t.pill[status];

  const stateChip = (label: string, state: PartState) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: t.chipBg, color: t.chipState[state] }}>
      {label} {STATE_GLYPH[state]}
    </span>
  );

  return (
    <div style={{ position: 'absolute', bottom: 14, left: 14, width: 320, background: theme.inspector.bg, border: `1px solid ${theme.inspector.border}`, borderRadius: 12, padding: '12px 14px', boxShadow: theme.dark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: pill.bg, color: pill.fg }}>
          {PILL_LABEL[status]}
        </span>
        <button onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: theme.app.subtitle, fontSize: 14 }}>✕</button>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: theme.inspector.title, marginBottom: 6 }}>{mod.name}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: mod.note ? 8 : 0 }}>
        {mod.infra ? (
          stateChip('Service', mod.api)
        ) : (
          <>
            {stateChip('UI', mod.ui)}
            {mod.feOnly ? (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: t.chipBg, color: t.note }}>FE-only</span>
            ) : (
              stateChip('API', mod.api)
            )}
          </>
        )}
      </div>
      {mod.note && <div style={{ fontSize: 11.5, color: theme.inspector.text, lineHeight: 1.45 }}>{mod.note}</div>}
    </div>
  );
}
