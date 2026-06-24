/**
 * Roadmap timeline — a Gantt/"plan mode" view of the roadmap. Deliverables are
 * scheduled onto a weekly axis in swimlanes by engineer lane: sequence and
 * parallelism are read off the position, dependencies push items right. Bars
 * open the same detail drawer. Reassigning a deliverable (List view or the
 * drawer) reflows the schedule.
 */

import { useTheme } from '../theme';
import { useTeamState } from '../state';
import { ENGINEER_BY_ID, ENGINEERS, UNASSIGNED } from '../model/team';
import { ROADMAP, type Deliverable } from '../model/roadmap';
import { computeSchedule, WORK_DAYS_PER_WEEK, type Bar } from '../model/schedule';

const LANE_W = 134;
const ROW_H = 46;
const AXIS_H = 26;

const BY_ID: Record<string, Deliverable> = Object.fromEntries(ROADMAP.flatMap((p) => p.items.map((d) => [d.id, d])));
const laneColor = (id: string) => ENGINEER_BY_ID[id]?.color ?? '#94a3b8';
const laneOrder = [...ENGINEERS.map((e) => e.id), UNASSIGNED];

export function RoadmapTimeline() {
  const theme = useTheme();
  const { assigneeOf, statusOf, openDetail } = useTeamState();

  const laneOf = (id: string) => assigneeOf(BY_ID[id]);
  const isDone = (id: string) => statusOf(BY_ID[id]) === 'done';
  const { bars, doneIds, totalDays } = computeSchedule(laneOf, isDone);

  // Lanes that actually carry work, in canonical order.
  const lanesUsed = laneOrder.filter((l) => bars.some((b) => b.lane === l));
  const weeks = Math.max(1, Math.ceil(totalDays / WORK_DAYS_PER_WEEK));
  // Span is rounded up to whole weeks; bars/axis are positioned as a % of it so
  // the Gantt always fills the available width instead of a fixed px/day.
  const spanDays = weeks * WORK_DAYS_PER_WEEK;

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ padding: '18px 22px 50px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: 0 }}>
            Timeline — implementation order
          </h1>
          <span style={{ fontSize: 12, color: theme.tile.note }}>
            ~{totalDays} working days · {weeks} week{weeks === 1 ? '' : 's'} for the current assignment
          </span>
        </div>
        <p style={{ fontSize: 12, color: theme.tile.note, margin: '0 0 14px' }}>
          Each row is an engineer lane working top-to-bottom; lanes run in parallel. Dependencies push a bar to the
          right. Reassign a deliverable (List view or the drawer) and the schedule reflows. Click a bar for the spec.
        </p>

        <Legend theme={theme} />

        {doneIds.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 16px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.tile.note }}>Already done:</span>
            {doneIds.map((id) => (
              <button
                key={id}
                onClick={() => openDetail(id)}
                title={BY_ID[id]?.text}
                style={{
                  fontSize: 10.5,
                  fontWeight: 650,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: `1px solid ${theme.tile.border}`,
                  background: theme.tile.chipBg,
                  color: theme.tile.note,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textDecoration: 'line-through',
                }}
              >
                ✓ {short(BY_ID[id]?.text ?? id)}
              </button>
            ))}
          </div>
        )}

        {/* Gantt */}
        <div style={{ display: 'flex', border: `1px solid ${theme.canvas.panelBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Fixed lane labels */}
          <div style={{ width: LANE_W, flexShrink: 0, background: theme.canvas.panelBg, borderRight: `1px solid ${theme.canvas.panelBorder}` }}>
            <div style={{ height: AXIS_H, borderBottom: `1px solid ${theme.canvas.panelBorder}` }} />
            {lanesUsed.map((l) => (
              <div
                key={l}
                style={{
                  height: ROW_H,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 10px',
                  borderBottom: `1px solid ${theme.canvas.panelBorder}`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: laneColor(l), flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.app.title, lineHeight: 1.15 }}>
                  {l === UNASSIGNED ? 'Unassigned' : ENGINEER_BY_ID[l]?.lane ?? l}
                </span>
              </div>
            ))}
          </div>

          {/* Track fills the remaining width; bars are positioned by % of span */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Week axis */}
            <div style={{ height: AXIS_H, position: 'relative', borderBottom: `1px solid ${theme.canvas.panelBorder}` }}>
              {Array.from({ length: weeks }).map((_, w) => (
                <div
                  key={w}
                  style={{
                    position: 'absolute',
                    left: `${(w / weeks) * 100}%`,
                    top: 0,
                    width: `${100 / weeks}%`,
                    height: '100%',
                    borderLeft: w === 0 ? 'none' : `1px solid ${theme.canvas.panelBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: theme.tile.note,
                    boxSizing: 'border-box',
                  }}
                >
                  Week {w + 1}
                </div>
              ))}
            </div>

            {/* Lane tracks with bars */}
            {lanesUsed.map((l) => (
              <div key={l} style={{ height: ROW_H, position: 'relative', borderBottom: `1px solid ${theme.canvas.panelBorder}` }}>
                {/* week gridlines */}
                {Array.from({ length: weeks }).map((_, w) =>
                  w === 0 ? null : (
                    <div
                      key={w}
                      style={{ position: 'absolute', left: `${(w / weeks) * 100}%`, top: 0, bottom: 0, width: 1, background: theme.canvas.panelBorder, opacity: 0.6 }}
                    />
                  ),
                )}
                {bars.filter((b) => b.lane === l).map((b) => (
                  <BarBlock key={b.id} b={b} theme={theme} spanDays={spanDays} onClick={() => openDetail(b.id)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarBlock({ b, theme, spanDays, onClick }: { b: Bar; theme: ReturnType<typeof useTheme>; spanDays: number; onClick: () => void }) {
  const { statusOf } = useTeamState();
  const d = BY_ID[b.id];
  const status = statusOf(d);
  const color = laneColor(b.lane);
  const wip = status === 'wip';
  const leftPct = (b.start / spanDays) * 100;
  const widthPct = (b.days / spanDays) * 100;
  const depHint = b.deps.length ? ` · after ${b.deps.map((x) => short(BY_ID[x]?.text ?? x, 18)).join(', ')}` : '';

  return (
    <button
      onClick={onClick}
      title={`${d?.text} · ${b.days}d${depHint}`}
      style={{
        position: 'absolute',
        left: `calc(${leftPct}% + 2px)`,
        top: 7,
        width: `calc(${widthPct}% - 4px)`,
        minWidth: 26,
        height: ROW_H - 16,
        borderRadius: 7,
        cursor: 'pointer',
        textAlign: 'left',
        padding: '0 8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: 10.5,
        fontWeight: 700,
        // in progress = solid lane colour; to build = tinted outline.
        background: wip ? color : theme.tile.bg,
        color: wip ? '#ffffff' : color,
        border: wip ? 'none' : `1.5px solid ${color}`,
      }}
    >
      {wip ? '◐ ' : ''}
      {short(d?.text ?? b.id, 40)}
    </button>
  );
}

function Legend({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 10.5, color: theme.tile.note }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 22, height: 12, borderRadius: 4, background: '#7c3aed' }} /> in progress
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 22, height: 12, borderRadius: 4, background: theme.tile.bg, border: '1.5px solid #7c3aed' }} /> to build
      </span>
      <span>· lane colour = engineer lane ({ENGINEERS.map((e) => e.lane).join(' · ')})</span>
    </div>
  );
}

function short(s: string, n = 22): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
