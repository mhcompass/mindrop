/**
 * Ticket detail drawer — slides in from the right with the full spec for a
 * deliverable: summary, the exact steps, definition of done, touchpoints,
 * notes, plus the same live status/assignee controls as the boards.
 *
 * Driven by `detailId` in the team state; openDetail(id) from any board card.
 */

import { useEffect, useState, type ReactNode } from 'react';

import { useTheme } from '../theme';
import { useTeamState } from '../state';
import { ENGINEERS, ENGINEER_BY_ID, UNASSIGNED } from '../model/team';
import { ROADMAP, type Deliverable } from '../model/roadmap';
import { DETAILS } from '../model/details';
import { WORK } from '../model/schedule';
import type { Status } from '../api';

const STATUS_LABEL: Record<Status, string> = { done: 'done', wip: 'in progress', todo: 'to build' };
const NEXT_STATUS: Record<Status, Status> = { todo: 'wip', wip: 'done', done: 'todo' };

const DOMAIN_SHORT: Record<string, string> = {
  'Service management (ITIL)': 'ITIL',
  'Assistant and knowledge': 'Assistant & knowledge',
  'Platform and operations': 'Platform & ops',
  'System integrations': 'Integrations',
};

/** id → { deliverable, phase title } — built once from the roadmap. */
const INDEX: Record<string, { d: Deliverable; phase: string }> = Object.fromEntries(
  ROADMAP.flatMap((p) => p.items.map((d) => [d.id, { d, phase: p.title }])),
);

/** Reverse dependencies: id → ids that are blocked by it. */
const BLOCKS: Record<string, string[]> = {};
for (const [id, w] of Object.entries(WORK)) for (const dep of w.deps ?? []) (BLOCKS[dep] ||= []).push(id);

export function DetailDrawer() {
  const theme = useTheme();
  const { detailId, closeDetail, openDetail, statusOf, assigneeOf, update, conn } = useTeamState();
  const open = detailId !== null;

  // Keep the last shown id during the slide-out so content doesn't blank.
  const [shownId, setShownId] = useState<string | null>(null);
  useEffect(() => {
    if (detailId) setShownId(detailId);
    else {
      const t = setTimeout(() => setShownId(null), 220);
      return () => clearTimeout(t);
    }
  }, [detailId]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDetail();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeDetail]);

  const entry = shownId ? INDEX[shownId] : null;
  const detail = shownId ? DETAILS[shownId] : null;
  const editable = conn !== 'offline';

  const status = entry ? statusOf(entry.d) : 'todo';
  const assignee = entry ? assigneeOf(entry.d) : UNASSIGNED;
  const lane = ENGINEER_BY_ID[assignee];
  const pill = theme.tile.pill[status === 'done' ? 'implemented' : status === 'wip' ? 'partial' : 'planned'];

  const days = shownId ? WORK[shownId]?.days : undefined;
  const blockedBy = shownId ? WORK[shownId]?.deps ?? [] : [];
  const blocks = shownId ? BLOCKS[shownId] ?? [] : [];

  return (
    <div
      aria-hidden={!open}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: open ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        onClick={closeDetail}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2,6,23,0.45)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Panel */}
      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(560px, 94vw)',
          background: theme.app.bg,
          borderLeft: `1px solid ${theme.app.headerBorder}`,
          boxShadow: '-12px 0 40px rgba(2,6,23,0.28)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {entry && (
          <>
            {/* Header */}
            <div
              style={{
                padding: '16px 20px 14px',
                borderBottom: `1px solid ${theme.app.headerBorder}`,
                borderTop: `3px solid ${lane ? lane.color : theme.tile.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.tile.note, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {entry.phase}
                  <span style={{ textTransform: 'none', fontWeight: 500, opacity: 0.75, marginLeft: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    · {entry.d.id}
                  </span>
                </div>
                <button
                  onClick={closeDetail}
                  aria-label="Close"
                  style={{
                    fontSize: 15,
                    lineHeight: 1,
                    border: 'none',
                    background: 'transparent',
                    color: theme.tile.note,
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  ✕
                </button>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2, color: theme.app.title, margin: '6px 0 12px' }}>
                {entry.d.text}
              </h2>

              {/* Controls + cross-refs */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => editable && update(entry.d.id, { status: NEXT_STATUS[status] })}
                  disabled={!editable}
                  title={editable ? 'Click to advance status' : 'Tracker offline — read-only'}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 750,
                    padding: '4px 11px',
                    borderRadius: 999,
                    background: pill.bg,
                    color: pill.fg,
                    border: 'none',
                    cursor: editable ? 'pointer' : 'not-allowed',
                  }}
                >
                  {STATUS_LABEL[status]}
                </button>
                <select
                  value={assignee}
                  disabled={!editable}
                  onChange={(e) => update(entry.d.id, { assignee: e.target.value })}
                  title="Assign to a lane"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 650,
                    padding: '3px 7px',
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
                {days != null && <Tag theme={theme}>{days} day{days === 1 ? '' : 's'}</Tag>}
                {entry.d.domain && <Tag theme={theme}>{DOMAIN_SHORT[entry.d.domain] ?? entry.d.domain}</Tag>}
                {entry.d.planRef && <Tag theme={theme}>Plan {entry.d.planRef}</Tag>}
                {entry.d.module && <Tag theme={theme}>{entry.d.module}</Tag>}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 40px' }}>
              {detail ? (
                <>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 18px' }}>
                    {detail.summary}
                  </p>

                  {(blockedBy.length > 0 || blocks.length > 0) && (
                    <Section theme={theme} title="Dependencies">
                      {blockedBy.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: blocks.length ? 8 : 0 }}>
                          <span style={{ fontSize: 11.5, color: theme.tile.note, minWidth: 64 }}>Blocked by</span>
                          {blockedBy.map((id) => (
                            <DepChip key={id} theme={theme} id={id} onOpen={openDetail} />
                          ))}
                        </div>
                      )}
                      {blocks.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 11.5, color: theme.tile.note, minWidth: 64 }}>Blocks</span>
                          {blocks.map((id) => (
                            <DepChip key={id} theme={theme} id={id} onOpen={openDetail} />
                          ))}
                        </div>
                      )}
                    </Section>
                  )}

                  <Section theme={theme} title="What needs to be done">
                    <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {detail.steps.map((s, i) => (
                        <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: theme.card.rowText }}>{s}</li>
                      ))}
                    </ol>
                  </Section>

                  <Section theme={theme} title="Definition of done">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {detail.acceptance.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, lineHeight: 1.45, color: theme.card.rowText }}>
                          <span aria-hidden style={{ color: theme.card.marks['✓'], fontWeight: 800, flexShrink: 0 }}>✓</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {detail.touchpoints && detail.touchpoints.length > 0 && (
                    <Section theme={theme} title="Touchpoints">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {detail.touchpoints.map((t, i) => (
                          <code
                            key={i}
                            style={{
                              fontSize: 11.5,
                              color: theme.tile.name,
                              background: theme.tile.chipBg,
                              border: `1px solid ${theme.tile.border}`,
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          >
                            {t}
                          </code>
                        ))}
                      </div>
                    </Section>
                  )}

                  {detail.notes && (
                    <div
                      style={{
                        marginTop: 18,
                        padding: '10px 12px',
                        borderRadius: 9,
                        borderLeft: `3px solid ${theme.card.marks['◐']}`,
                        background: theme.tile.bg,
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: theme.tile.note,
                      }}
                    >
                      <strong style={{ color: theme.tile.name }}>Note — </strong>
                      {detail.notes}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12.5, color: theme.tile.note }}>
                  No detailed spec written yet for this deliverable. Add one in <code>src/model/details.ts</code>.
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Section({ theme, title, children }: { theme: ReturnType<typeof useTheme>; title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: theme.tile.note,
          marginBottom: 9,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function DepChip({ theme, id, onOpen }: { theme: ReturnType<typeof useTheme>; id: string; onOpen: (id: string) => void }) {
  const e = INDEX[id];
  const label = e?.d.text ?? id;
  return (
    <button
      onClick={() => onOpen(id)}
      title={label}
      style={{
        fontSize: 10.5,
        fontWeight: 650,
        padding: '2px 9px',
        borderRadius: 999,
        border: `1px solid ${theme.tile.border}`,
        background: theme.tile.bg,
        color: theme.card.rowText,
        cursor: 'pointer',
        maxWidth: 240,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {label.length > 34 ? label.slice(0, 33) + '…' : label}
    </button>
  );
}

function Tag({ theme, children }: { theme: ReturnType<typeof useTheme>; children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 650,
        padding: '2px 8px',
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
