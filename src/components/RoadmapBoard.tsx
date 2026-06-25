import { useState, type ReactNode } from 'react';

import { useTheme } from '../theme';
import { useProject } from '../project';
import { useTeamState } from '../state';
import { RoadmapTimeline } from './RoadmapTimeline';
import type { Deliverable, DeliverableStatus, RoadmapPhase } from '../model/types';

const STATUS_LABEL: Record<DeliverableStatus, string> = {
  done: 'done',
  wip: 'in progress',
  todo: 'to build',
};

const NEXT_STATUS: Record<DeliverableStatus, DeliverableStatus> = {
  todo: 'wip',
  wip: 'done',
  done: 'todo',
};

/** Short labels for the capability-domain cross-reference chip. */
const DOMAIN_SHORT: Record<string, string> = {
  'Service management (ITIL)': 'ITIL',
  'Assistant and knowledge': 'Assistant & knowledge',
  'Platform and operations': 'Platform & ops',
  'System integrations': 'Integrations',
};

export function RoadmapBoard() {
  const theme = useTheme();
  const { delivery } = useProject();
  const { roadmap: ROADMAP, roadmapIntro: ROADMAP_INTRO } = delivery!;
  const { statusOf, conn } = useTeamState();
  const [mode, setMode] = useState<'timeline' | 'list'>('timeline');

  // Live counts from effective status (overrides included).
  const counts = { total: 0, done: 0, wip: 0, todo: 0 };
  for (const p of ROADMAP) for (const d of p.items) {
    counts.total++;
    counts[statusOf(d)]++;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: theme.app.bg }}>
      {/* Mode toggle — Timeline (plan order) ⇄ List (checklist) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 22px 0' }}>
        <div style={{ display: 'inline-flex', border: `1px solid ${theme.tile.border}`, borderRadius: 999, overflow: 'hidden' }}>
          {(['timeline', 'list'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '5px 14px',
                border: 'none',
                cursor: 'pointer',
                background: mode === m ? 'linear-gradient(135deg, #2563eb, #6d28d9)' : theme.tile.bg,
                color: mode === m ? '#ffffff' : theme.tile.note,
              }}
            >
              {m === 'timeline' ? 'Timeline' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'timeline' ? (
        <RoadmapTimeline />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ maxWidth: 920, margin: '0 auto', padding: '14px 28px 60px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 8px' }}>
              Roadmap — what is left to build
            </h1>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 16px' }}>
              {ROADMAP_INTRO}
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 8px' }}>
              <Chip theme={theme} mark="Σ" label={`${counts.total} deliverables`} status={null} />
              <Chip theme={theme} mark="✓" label={`${counts.done} done`} status="done" />
              <Chip theme={theme} mark="◐" label={`${counts.wip} in progress`} status="wip" />
              <Chip theme={theme} mark="☐" label={`${counts.todo} to build`} status="todo" />
              <ConnBadge theme={theme} conn={conn} />
            </div>
            <p style={{ fontSize: 11.5, color: theme.tile.note, margin: '0 0 22px' }}>
              Click a status pill to advance it (to build → in progress → done). Reassign with the lane dropdown —
              changes save to the team tracker.
            </p>

            {ROADMAP.map((phase) => (
              <Phase key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Phase({ phase }: { phase: RoadmapPhase }) {
  const theme = useTheme();
  const { statusOf } = useTeamState();
  const open = phase.items.filter((it) => statusOf(it) !== 'done').length;

  return (
    <div style={{ marginBottom: 26 }}>
      <H2 theme={theme}>
        <span>{phase.title}</span>
        <span style={{ fontSize: 12, fontWeight: 650, color: theme.tile.note, flexShrink: 0 }}>
          {open === 0 ? 'complete' : `${open} open`}
        </span>
      </H2>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '-4px 0 12px' }}>
        {phase.intent}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {phase.items.map((it) => (
          <Item key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

function Item({ item }: { item: Deliverable }) {
  const theme = useTheme();
  const { delivery } = useProject();
  const { engineers: ENGINEERS, engineerById: ENGINEER_BY_ID, unassigned: UNASSIGNED } = delivery!;
  const { statusOf, assigneeOf, update, conn, openDetail } = useTeamState();
  const status = statusOf(item);
  const assignee = assigneeOf(item);
  const lane = ENGINEER_BY_ID[assignee];

  const mark = status === 'done' ? '✓' : status === 'wip' ? '◐' : '☐';
  const markColor =
    status === 'done' ? theme.card.marks['✓'] : status === 'wip' ? theme.card.marks['◐'] : theme.tile.chipState.none;
  const pill = theme.tile.pill[status === 'done' ? 'implemented' : status === 'wip' ? 'partial' : 'planned'];
  const editable = conn !== 'offline';

  return (
    <div
      onClick={() => openDetail(item.id)}
      title="Open details"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 9,
        border: `1px solid ${theme.tile.border}`,
        borderLeft: `3px solid ${lane ? lane.color : theme.tile.border}`,
        background: theme.tile.bg,
        cursor: 'pointer',
      }}
    >
      <span aria-hidden style={{ color: markColor, fontWeight: 800, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>
        {mark}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: status === 'done' ? theme.tile.note : theme.tile.name,
            textDecoration: status === 'done' ? 'line-through' : 'none',
          }}
        >
          {item.text}
        </span>
        {item.note && (
          <span style={{ display: 'block', fontSize: 11.5, lineHeight: 1.45, color: theme.tile.note, marginTop: 2 }}>
            {item.note}
          </span>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
          {item.domain && (
            <XRef theme={theme} title={`Capability domain · ${item.domain}`}>
              {DOMAIN_SHORT[item.domain] ?? item.domain}
            </XRef>
          )}
          {item.planRef && (
            <XRef theme={theme} title={`Delivery Plan workstream ${item.planRef}`}>
              Plan {item.planRef}
            </XRef>
          )}
          <select
            value={assignee}
            disabled={!editable}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => update(item.id, { assignee: e.target.value })}
            title="Assign to a lane"
            style={{
              fontSize: 10,
              fontWeight: 650,
              padding: '1px 5px',
              borderRadius: 999,
              border: `1px solid ${lane ? lane.color : theme.tile.border}`,
              background: theme.tile.chipBg,
              color: lane ? lane.color : theme.tile.note,
              cursor: editable ? 'pointer' : 'not-allowed',
            }}
          >
            {ENGINEERS.map((e) => (
              <option key={e.id} value={e.id}>{e.lane}</option>
            ))}
            <option value={UNASSIGNED}>Unassigned</option>
          </select>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); if (editable) update(item.id, { status: NEXT_STATUS[status] }); }}
        disabled={!editable}
        title={editable ? 'Click to advance status' : 'Tracker offline — read-only'}
        style={{
          fontSize: 9.5,
          fontWeight: 750,
          padding: '3px 9px',
          borderRadius: 999,
          background: pill.bg,
          color: pill.fg,
          border: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          marginTop: 1,
          cursor: editable ? 'pointer' : 'not-allowed',
        }}
      >
        {STATUS_LABEL[status]}
      </button>
    </div>
  );
}

function ConnBadge({ theme, conn }: { theme: ReturnType<typeof useTheme>; conn: 'loading' | 'online' | 'offline' }) {
  const map = {
    loading: { c: theme.tile.chipState.none, t: 'connecting…' },
    online: { c: theme.card.marks['✓'], t: 'tracker live' },
    offline: { c: theme.card.marks['✗'], t: 'offline — read-only' },
  } as const;
  const { c, t } = map[conn];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 'auto',
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        border: `1px solid ${theme.tile.border}`,
        background: theme.tile.bg,
        color: theme.tile.note,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 999, background: c, flexShrink: 0 }} />
      {t}
    </span>
  );
}

function XRef({ theme, title, children }: { theme: ReturnType<typeof useTheme>; title: string; children: ReactNode }) {
  return (
    <span
      title={title}
      style={{
        fontSize: 10,
        fontWeight: 650,
        padding: '1px 7px',
        borderRadius: 999,
        border: `1px solid ${theme.tile.border}`,
        background: theme.tile.chipBg,
        color: theme.tile.note,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function Chip({
  theme,
  mark,
  label,
  status,
}: {
  theme: ReturnType<typeof useTheme>;
  mark: string;
  label: string;
  status: DeliverableStatus | null;
}) {
  const color =
    status === 'done'
      ? theme.card.marks['✓']
      : status === 'wip'
        ? theme.card.marks['◐']
        : status === 'todo'
          ? theme.tile.chipState.none
          : theme.app.subtitle;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        padding: '5px 11px',
        borderRadius: 999,
        border: `1px solid ${theme.tile.border}`,
        background: theme.tile.bg,
        color: theme.card.rowText,
      }}
    >
      <span aria-hidden style={{ color, fontWeight: 800 }}>{mark}</span>
      {label}
    </span>
  );
}

function H2({ children, theme }: { children: ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <h2
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 10,
        fontSize: 16,
        fontWeight: 800,
        color: theme.app.title,
        margin: '6px 0 10px',
        paddingBottom: 6,
        borderBottom: `2px solid ${theme.tile.border}`,
      }}
    >
      {children}
    </h2>
  );
}
