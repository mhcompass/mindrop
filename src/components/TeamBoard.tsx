/**
 * Team board — the same roadmap deliverables, regrouped into the five
 * engineer lanes (by capability squad). Each lane is a column with its
 * cards; click a card's status to advance it, or drag-free reassign from
 * the Roadmap view. Lanes show a to-build / in-progress / done tally.
 */

import { useTheme } from '../theme';
import { useProject } from '../project';
import { useTeamState } from '../state';
import type { Engineer, Deliverable } from '../model/types';
import type { Status } from '../api';

const STATUS_MARK: Record<Status, string> = { done: '✓', wip: '◐', todo: '☐' };
const NEXT_STATUS: Record<Status, Status> = { todo: 'wip', wip: 'done', done: 'todo' };

interface LaneDef {
  id: string;
  lane: string;
  color: string;
}

export function TeamBoard() {
  const theme = useTheme();
  const { delivery } = useProject();
  const { engineers: ENGINEERS, unassigned: UNASSIGNED, roadmap: ROADMAP } = delivery!;
  const { assigneeOf } = useTeamState();

  const LANES: LaneDef[] = [
    ...ENGINEERS.map((e: Engineer) => ({ id: e.id, lane: e.lane, color: e.color })),
    { id: UNASSIGNED, lane: 'Unassigned', color: '#94a3b8' },
  ];

  /** Flat list of every deliverable with its phase title, for lookup. */
  const ALL: { d: Deliverable; phase: string }[] = ROADMAP.flatMap((p) =>
    p.items.map((d) => ({ d, phase: p.title.replace(/^Phase \d+ · /, '') })),
  );

  const byLane: Record<string, { d: Deliverable; phase: string }[]> = {};
  for (const lane of LANES) byLane[lane.id] = [];
  for (const row of ALL) byLane[assigneeOf(row.d)]?.push(row);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ padding: '20px 22px 60px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 4px' }}>
          Team board — deliverables by lane
        </h1>
        <p style={{ fontSize: 12.5, color: theme.tile.note, margin: '0 0 18px' }}>
          The roadmap split across five capability lanes. Click a card's status to advance it; reassign from the Roadmap
          view. Lanes default by capability domain — override per deliverable as you like.
        </p>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 'min-content' }}>
          {LANES.map((lane) => (
            <Lane key={lane.id} lane={lane} rows={byLane[lane.id]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Lane({ lane, rows }: { lane: LaneDef; rows: { d: Deliverable; phase: string }[] }) {
  const theme = useTheme();
  const { statusOf } = useTeamState();
  const tally = { done: 0, wip: 0, todo: 0 };
  for (const r of rows) tally[statusOf(r.d)]++;

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 230,
        maxWidth: 320,
        background: theme.canvas.panelBg,
        border: `1px solid ${theme.canvas.panelBorder}`,
        borderTop: `3px solid ${lane.color}`,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: theme.app.title }}>{lane.lane}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: theme.tile.note, flexShrink: 0 }}>{rows.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 10.5, fontWeight: 700, color: theme.tile.note, marginBottom: 10 }}>
        <span style={{ color: theme.card.marks['✓'] }}>✓ {tally.done}</span>
        <span style={{ color: theme.card.marks['◐'] }}>◐ {tally.wip}</span>
        <span>☐ {tally.todo}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.length === 0 && (
          <div style={{ fontSize: 11.5, color: theme.tile.note, textAlign: 'center', padding: '14px 0' }}>No work in this lane</div>
        )}
        {rows.map((r) => (
          <Card key={r.d.id} d={r.d} phase={r.phase} />
        ))}
      </div>
    </div>
  );
}

function Card({ d, phase }: { d: Deliverable; phase: string }) {
  const theme = useTheme();
  const { statusOf, update, conn, openDetail } = useTeamState();
  const status = statusOf(d);
  const pill = theme.tile.pill[status === 'done' ? 'implemented' : status === 'wip' ? 'partial' : 'planned'];
  const markColor =
    status === 'done' ? theme.card.marks['✓'] : status === 'wip' ? theme.card.marks['◐'] : theme.tile.chipState.none;
  const editable = conn !== 'offline';

  return (
    <div
      onClick={() => openDetail(d.id)}
      title="Open details"
      style={{
        background: theme.tile.bg,
        border: `1px solid ${theme.tile.border}`,
        borderRadius: 9,
        padding: '8px 10px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
        <span aria-hidden style={{ color: markColor, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
          {STATUS_MARK[status]}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.35,
            color: status === 'done' ? theme.tile.note : theme.tile.name,
            textDecoration: status === 'done' ? 'line-through' : 'none',
          }}
        >
          {d.text}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 7 }}>
        <span style={{ fontSize: 10, color: theme.tile.note, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {phase}
          {d.planRef ? ` · Plan ${d.planRef}` : ''}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); if (editable) update(d.id, { status: NEXT_STATUS[status] }); }}
          disabled={!editable}
          title={editable ? 'Click to advance status' : 'Tracker offline — read-only'}
          style={{
            fontSize: 9.5,
            fontWeight: 750,
            padding: '2px 8px',
            borderRadius: 999,
            background: pill.bg,
            color: pill.fg,
            border: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: editable ? 'pointer' : 'not-allowed',
          }}
        >
          {status === 'wip' ? 'in progress' : status === 'done' ? 'done' : 'to build'}
        </button>
      </div>
    </div>
  );
}
