/**
 * Roadmap — what is left to build, in delivery order. Each phase opens
 * with a one-line statement of intent ("what should be implemented"),
 * then a checklist of the deliverables that make it up. The sequence
 * runs top-to-bottom: Phase 0 is in-flight / blocking, later phases
 * follow once the earlier ones land.
 *
 * Item status drives the checkbox: 'done' ✓ · 'wip' ◐ · 'todo' ☐.
 *
 * Cross-references (so the three planning views stay in lock-step):
 *   · `domain`  → the capability domain on the Capabilities board
 *   · `planRef` → the workstream on the Delivery Plan (A1, B5, …)
 *   · `module`  → the tracked module on the Module Tracker (t_*)
 * Keep this in sync with modules.ts / plan3.ts as work ships, and bump
 * stamp.ts.
 */

import type { RoadmapPhase, DeliverableStatus } from '../../model/types';
export type { Deliverable, RoadmapPhase, DeliverableStatus } from '../../model/types';

export const ROADMAP_INTRO =
  'The product is substantially built — ITIL records, the platform core, ' +
  'multi-tenant profiling, My Locker, and the new bulk Fleet Operations all ' +
  'run on live or seeded backends. What remains is finishing the work that ' +
  'just merged, completing the incident→change automation, and replacing the ' +
  'last scripted/hardcoded surfaces with real backends. The phases below are ' +
  'the current delivery sequence; each deliverable is cross-referenced to its ' +
  'capability domain and, where one exists, its Delivery-Plan workstream.';

export const ROADMAP: RoadmapPhase[] = [
  {
    id: 'p0',
    title: 'Phase 0 · Stabilize the merge',
    intent:
      'Close out the release that just landed on `development` before building on top of it.',
    items: [
      {
        id: 'alembic-head',
        text: 'Single Alembic head on `development`',
        note: 'repoint add_approval_dual_admin onto 14e55df52c5b — two heads break `alembic upgrade head`',
        status: 'wip',
        domain: 'Platform and operations',
      },
      {
        id: 'tracker-reconcile',
        text: 'Reconcile this tracker + bump the build stamp',
        note: 'Fleet Operations, dual-admin approvals, and the governance module-toggle landed after the 2026-06-17 stamp',
        status: 'wip',
        domain: 'Platform and operations',
      },
      {
        id: 'approval-guardrails',
        text: 'Settle the approval guardrails',
        note: 'decide on optional approval comment, requester-self-approval, and the SystemAdmin bypass trust model',
        status: 'todo',
        domain: 'Platform and operations',
        module: 't_appr',
      },
    ],
  },
  {
    id: 'p1',
    title: 'Phase 1 · Finish Fleet Operations',
    intent:
      'Bulk SCCM UI and approval gating shipped — make collection targeting real and close the gating gaps before it is demo-ready.',
    items: [
      {
        id: 'fleet-collections-exec',
        text: 'Execute against `collection_names`',
        note: 'today captured for audit + risk but never sent to the SCCM client — collection-only targeting is a no-op',
        status: 'todo',
        domain: 'Platform and operations',
        module: 't_sccm',
      },
      {
        id: 'fleet-risk-collections',
        text: 'Risk gate counts collection members, not just named devices',
        note: 'otherwise a collection target under-counts and skips escalation',
        status: 'todo',
        domain: 'Platform and operations',
      },
      {
        id: 'fleet-reboot-gate',
        text: 'Gate `reboot_device` on the voice path',
        note: 'parity with the REST bulk routes; voice currently reboots ungated',
        status: 'todo',
        domain: 'Platform and operations',
      },
      {
        id: 'fleet-final-test',
        text: 'Final test pass on bulk install / deploy / task-sequence',
        status: 'wip',
        domain: 'Platform and operations',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Phase 2 · Complete the incident → change automation',
    intent:
      'The records and links exist; the automation that connects them does not. Turn the partial agents into the continuous incident-to-scheduled-change flow.',
    items: [
      {
        id: 'auto-recurrence',
        text: 'Auto-group recurring incidents into one problem',
        note: 'link_records is live; automatic recurrence detection still scripted (Pattern Agent)',
        status: 'wip',
        domain: 'Service management (ITIL)',
        planRef: 'B5',
        module: 't_prob',
      },
      {
        id: 'change-risk-scoring',
        text: 'Change-risk scoring from history, traffic and dependencies',
        note: 'risk model + CAB gate live on records; full auto-scoring still partial (Change-Risk Agent)',
        status: 'wip',
        domain: 'Service management (ITIL)',
        planRef: 'B6',
        module: 't_chg',
      },
      {
        id: 'cab-draft',
        text: 'Auto-drafted change-advisory (CAB) summary',
        note: 'still scripted',
        status: 'todo',
        domain: 'Assistant and knowledge',
        planRef: 'B7',
      },
      {
        id: 'cab-conflict-window',
        text: 'Maintenance-window conflict check + safe-window suggestion',
        note: 'conflict detection live off cab_window; window auto-pick still scripted (CAB Scheduler)',
        status: 'wip',
        domain: 'Service management (ITIL)',
        planRef: 'B8',
        module: 't_cab',
      },
    ],
  },
  {
    id: 'p3',
    title: 'Phase 3 · Major-incident war room on live data',
    intent:
      'The war-room screen is presentational — give it a real backend and a live-regenerated executive summary.',
    items: [
      {
        id: 'warroom-live',
        text: 'War room backed by live data + a real comms log',
        status: 'todo',
        domain: 'Service management (ITIL)',
        planRef: 'B2',
        module: 't_war',
      },
      {
        id: 'warroom-summary',
        text: 'Executive summary regenerated live from incident state',
        note: 'replace the scripted briefing (Briefing Agent)',
        status: 'todo',
        domain: 'Assistant and knowledge',
        planRef: 'B3',
      },
    ],
  },
  {
    id: 'p4',
    title: 'Phase 4 · Metrics & SLA on real data',
    intent:
      'Replace the hardcoded charts and client-side SLA math with backend aggregates.',
    items: [
      {
        id: 'metrics-agg',
        text: 'Metrics Aggregation endpoints',
        note: 'MTTR · SLA attainment · ticket volume',
        status: 'todo',
        domain: 'Platform and operations',
        planRef: 'A1',
        module: 't_agg',
      },
      {
        id: 'dashboards-live',
        text: 'Dashboards read live aggregates',
        note: 'drop the hardcoded series; keep the metric polls',
        status: 'todo',
        domain: 'Platform and operations',
        planRef: 'A1',
        module: 't_dash',
      },
      {
        id: 'sla-predictive',
        text: 'SLA predictive-breach computed server-side',
        note: 'breach → admin notify is live; prediction is still client-side',
        status: 'todo',
        domain: 'Service management (ITIL)',
        module: 't_sla',
      },
      {
        id: 'notif-roundtrip',
        text: 'Notifications round-trip to the citizen portal',
        note: 'notifications table + SLA-breach notify exist; portal round-trip to build',
        status: 'todo',
        domain: 'Platform and operations',
        module: 't_notif',
      },
    ],
  },
  {
    id: 'p5',
    title: 'Phase 5 · Ingestion channels & realtime',
    intent:
      'Let tickets arrive from outside the console and generalize the live event hub.',
    items: [
      {
        id: 'sse-generalize',
        text: 'Generalize the SSE hub beyond Galaxy',
        status: 'todo',
        domain: 'Platform and operations',
        module: 't_sse',
      },
      {
        id: 'email-to-ticket',
        text: 'Email-to-Ticket',
        note: 'inbound mail → incident',
        status: 'todo',
        domain: 'Service management (ITIL)',
        module: 't_emailin',
      },
      {
        id: 'inbound-webhooks',
        text: 'Inbound Webhooks',
        note: 'monitoring alerts → incident',
        status: 'todo',
        domain: 'Service management (ITIL)',
        module: 't_webhook',
      },
    ],
  },
  {
    id: 'p6',
    title: 'Phase 6 · Drop the scaffolding',
    intent:
      'Make the demo run on live data and a real runbook target instead of fixtures and mocks.',
    items: [
      {
        id: 'incidents-e2e',
        text: 'Incidents working end to end on the live system',
        status: 'done',
        domain: 'Service management (ITIL)',
        planRef: 'B1',
        module: 't_inc',
      },
      {
        id: 'demo-seeder',
        text: 'Demo Seeder CLI — one-click seed + reset',
        note: 'fixtures → Postgres',
        status: 'todo',
        domain: 'Platform and operations',
        planRef: 'A4',
        module: 't_seeder',
      },
      {
        id: 'demo-real-records',
        text: 'Whole demo on real database records',
        note: 'retire the seeded fixtures once an API backs every surface',
        status: 'todo',
        domain: 'Service management (ITIL)',
        planRef: 'A5',
        module: 't_fixtures',
      },
      {
        id: 'weblogic-wiring',
        text: 'WebLogic real wiring',
        note: 'turn off WEBLOGIC_MOCK against a live target',
        status: 'todo',
        domain: 'System integrations',
        module: 't_wl',
      },
    ],
  },
  {
    id: 'p7',
    title: 'Phase 7 · Presenter polish',
    intent:
      'Demo-layer finish work — none of it blocks the product.',
    items: [
      {
        id: 'storymode-bugs',
        text: 'Fix the two known Story Mode stepper bugs',
        status: 'todo',
        module: 't_story',
      },
      {
        id: 'demo-autopilot',
        text: 'Demo Autopilot',
        note: 'hands-free scripted runs',
        status: 'todo',
        module: 't_autopilot',
      },
      {
        id: 'arabic-narrations',
        text: 'Arabic narrations for demo copy',
        status: 'todo',
        module: 't_ar',
      },
    ],
  },
];

/* ── Summary counts (derived) ─────────────────────────────────── */

export const ROADMAP_COUNTS = ROADMAP.reduce(
  (acc, phase) => {
    for (const it of phase.items) acc[it.status]++;
    acc.total++;
    return acc;
  },
  { total: 0, done: 0, wip: 0, todo: 0 } as Record<'total' | DeliverableStatus, number>,
);
