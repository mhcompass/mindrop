/**
 * Timeline scheduling — turns the roadmap into a time series.
 *
 * Each deliverable has a working-day estimate and optional dependencies.
 * `computeSchedule` does resource-aware list scheduling: every lane (engineer)
 * works one item at a time (sequential within a lane), lanes run in parallel,
 * and an item can't start until all its dependencies finish. The result is a
 * start/end day per item — a Gantt the Timeline view renders.
 *
 * Done items don't consume the plan: they're reported separately and treated
 * as already-finished (end day 0) when resolving dependencies.
 */

import { ROADMAP } from './roadmap';
import type { Bar, Schedule } from '../../model/types';
export type { Bar, Schedule } from '../../model/types';

/** Working-day estimate + hard dependencies per deliverable id.
 *  Estimates for A/B items come from the original Delivery Plan; the rest are
 *  first-pass sizings — adjust here and the timeline reflows. */
export const WORK: Record<string, { days: number; deps?: string[] }> = {
  // P0 · Stabilize
  'alembic-head': { days: 1 },
  'tracker-reconcile': { days: 1 },
  'approval-guardrails': { days: 2 },
  // P1 · Fleet
  'fleet-collections-exec': { days: 3 },
  'fleet-risk-collections': { days: 2, deps: ['fleet-collections-exec'] },
  'fleet-reboot-gate': { days: 1 },
  'fleet-final-test': { days: 2, deps: ['fleet-collections-exec', 'fleet-risk-collections', 'fleet-reboot-gate'] },
  // P2 · Automation (B5–B8)
  'auto-recurrence': { days: 5 },
  'change-risk-scoring': { days: 4 },
  'cab-draft': { days: 3, deps: ['change-risk-scoring'] },
  'cab-conflict-window': { days: 3 },
  // P3 · War room (B2/B3)
  'warroom-live': { days: 4 },
  'warroom-summary': { days: 3, deps: ['warroom-live'] },
  // P4 · Metrics & SLA (A1)
  'metrics-agg': { days: 3 },
  'dashboards-live': { days: 2, deps: ['metrics-agg'] },
  'sla-predictive': { days: 2 },
  'notif-roundtrip': { days: 2 },
  // P5 · Channels
  'sse-generalize': { days: 3 },
  'email-to-ticket': { days: 3 },
  'inbound-webhooks': { days: 2 },
  // P6 · Scaffolding (A4/A5/B1)
  'incidents-e2e': { days: 3 },
  'demo-seeder': { days: 3 },
  'demo-real-records': { days: 2, deps: ['demo-seeder'] },
  'weblogic-wiring': { days: 2 },
  // P7 · Presenter
  'storymode-bugs': { days: 1 },
  'demo-autopilot': { days: 3 },
  'arabic-narrations': { days: 2 },
};

const DEFAULT_DAYS = 2;
export const WORK_DAYS_PER_WEEK = 5;

const daysOf = (id: string) => WORK[id]?.days ?? DEFAULT_DAYS;
const depsOf = (id: string) => WORK[id]?.deps ?? [];

/**
 * @param laneOf  effective lane (engineer id) for a deliverable
 * @param isDone  whether a deliverable is already complete
 */
export function computeSchedule(laneOf: (id: string) => string, isDone: (id: string) => boolean): Schedule {
  const items = ROADMAP.flatMap((p, pi) => p.items.map((d) => ({ id: d.id, phaseIdx: pi })));
  const phaseIdx: Record<string, number> = Object.fromEntries(items.map((i) => [i.id, i.phaseIdx]));

  const end: Record<string, number> = {};
  const start: Record<string, number> = {};
  const laneFree: Record<string, number> = {};
  const doneIds: string[] = [];
  const pending = new Set<string>();

  // Completed work is finished at day 0 and doesn't occupy a lane.
  for (const it of items) {
    if (isDone(it.id)) {
      end[it.id] = 0;
      doneIds.push(it.id);
    } else {
      pending.add(it.id);
    }
  }

  // List scheduling: earlier phases first; an item waits for its deps and its
  // lane to be free. Repeat until the pending set drains (deps converge).
  const ordered = [...items].sort((a, b) => a.phaseIdx - b.phaseIdx);
  let guard = 0;
  while (pending.size && guard++ < 5000) {
    let progressed = false;
    for (const it of ordered) {
      if (!pending.has(it.id)) continue;
      const deps = depsOf(it.id);
      if (deps.some((d) => pending.has(d))) continue; // a dep is still unscheduled
      const lane = laneOf(it.id);
      const depEnd = deps.reduce((m, d) => Math.max(m, end[d] ?? 0), 0);
      const s = Math.max(laneFree[lane] ?? 0, depEnd);
      start[it.id] = s;
      end[it.id] = s + daysOf(it.id);
      laneFree[lane] = end[it.id];
      pending.delete(it.id);
      progressed = true;
    }
    if (!progressed) break; // dependency cycle — bail rather than loop forever
  }

  const bars: Bar[] = items
    .filter((i) => !isDone(i.id) && start[i.id] !== undefined)
    .map((i) => ({
      id: i.id,
      lane: laneOf(i.id),
      start: start[i.id],
      end: end[i.id],
      days: daysOf(i.id),
      phaseIdx: phaseIdx[i.id],
      deps: depsOf(i.id),
    }));

  const totalDays = bars.reduce((m, b) => Math.max(m, b.end), 0);
  return { bars, doneIds, totalDays };
}
