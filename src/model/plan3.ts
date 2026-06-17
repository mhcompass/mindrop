/**
 * Three-week delivery plan for a team of three engineers. Plain-language
 * scope: what gets built, grouped by outcome, with day estimates, a
 * week-by-week breakdown, what is intentionally left out, and the one
 * hard dependency. Estimates come from the development-plan workstreams.
 */

export interface PlanItem {
  /** Development-plan reference (A1, B5, …). */
  ref: string;
  title: string;
  /** Delivery days (build + per-item test). */
  days: number;
}

export interface PlanGroup {
  id: string;
  title: string;
  /** Plain explanation of what this group does and why it matters. */
  summary: string;
  items: PlanItem[];
}

/** Functionality that already works and can be enabled / demonstrated now. */
export interface AvailableGroup {
  group: string;
  items: string[];
}
export const PLAN_AVAILABLE: AvailableGroup[] = [
  {
    group: 'Service management (ITIL)',
    items: [
      'Incident management — create, triage, assign, work-note and transition, with SLA timers and knowledge citations',
      'Problem management — records, root cause and lifecycle, linked to their incidents',
      'Change management — risk classification with a CAB approval gate on high-risk changes',
      'CAB calendar — scheduled changes with conflict flags',
      'Service catalog and citizen portal — submit a request and track it',
      'Asset inventory (CMDB) — assets and sites with filtering',
      'Cross-practice linking — connect incidents, problems and changes',
    ],
  },
  {
    group: 'Assistant and knowledge',
    items: [
      'Compass assistant — chat with tool use across all of the above',
      'Knowledge base with citations — folder-scoped question answering with sources',
      'MyLocker document workspace — templates and English/Arabic document analysis',
      'Reports — natural-language and scheduled reports',
      'Voice — speech-to-text and text-to-speech in English and Arabic',
      'Execution trace — step-by-step view of each assistant turn',
    ],
  },
  {
    group: 'Platform and operations',
    items: [
      'Multi-tenant profiles and branding — switch between Default, Dubai Police and Ministry of Education',
      'Governance — assistant kill-switch and full audit log',
      'Approvals — email approve/reject with secure tokens',
      'Directory operations — user lookup, group audit and password reset (mock or connected directory)',
      'Device and compliance views (SCCM, sample data)',
      'Operator web console and REST API',
    ],
  },
];

export const PLAN_TEAM = { engineers: 3, weeks: 3, daysPerWeek: 5, utilization: 0.8 };
export const PLAN_CAPACITY = Math.round(
  PLAN_TEAM.engineers * PLAN_TEAM.weeks * PLAN_TEAM.daysPerWeek * PLAN_TEAM.utilization,
); // 36
export const PLAN_BUFFER = 2; // reserved for integration + a demo run-through

export const PLAN_GROUPS: PlanGroup[] = [
  {
    id: 'g_live',
    title: 'Run the demo on real data',
    summary:
      'Today the demo is driven by a fixed storyline in the front end. This work moves it onto the live database, ' +
      'so every action — creating, updating and linking tickets — is a real transaction. A small tool seeds the ' +
      'demo data into Postgres and resets it between sessions, so the same walkthrough can be shown without the ' +
      'scripted layer.',
    items: [
      { ref: 'A4', title: 'Data seeding tool (load demo data into Postgres) + reset script', days: 3 },
      { ref: 'A5', title: 'Move the scripted storyline onto real database records', days: 2 },
      { ref: 'B1', title: 'Incidents working end to end in the demo flow', days: 3 },
    ],
  },
  {
    id: 'g_loop',
    title: 'Complete the automated incident-to-change workflow',
    summary:
      'The ticket records and the links between them already exist; the automation that connects them does not. ' +
      'This adds: grouping several incidents that are the same recurring issue into one problem; scoring a ' +
      "change's risk from real factors; drafting the change-advisory (CAB) summary automatically; and checking " +
      'the proposed maintenance window for conflicts. The result is one continuous flow from incident to ' +
      'scheduled change, with no manual routing.',
    items: [
      { ref: 'B5', title: 'Group recurring incidents into a problem (with a known-errors record)', days: 5 },
      { ref: 'B6', title: 'Score a change’s risk from history, traffic and dependencies', days: 4 },
      { ref: 'B7', title: 'Draft the change-advisory (CAB) summary automatically', days: 3 },
      { ref: 'B8', title: 'Suggest a safe maintenance window and flag conflicts', days: 3 },
    ],
  },
  {
    id: 'g_warroom',
    title: 'Make the major-incident screen run on live data',
    summary:
      'The major-incident screen is presentational today. This gives it a real backend — tables for the major ' +
      'incident and its communications log — and replaces the scripted summary with one the assistant ' +
      'regenerates from the actual state of the incident.',
    items: [
      { ref: 'B2', title: 'Major-incident backend: tables + persisted communications log', days: 4 },
      { ref: 'B3', title: 'Live executive summary, regenerated from the incident state', days: 3 },
    ],
  },
  {
    id: 'g_support',
    title: 'Live dashboards and release hardening',
    summary:
      'Adds the aggregation queries (mean time to resolve, SLA, ticket volume) so the dashboards show live ' +
      'numbers instead of fixed charts, and reserves time at the end for integration testing and a full ' +
      'demo run-through.',
    items: [
      { ref: 'A1', title: 'Metrics aggregation queries behind the dashboards', days: 4 },
    ],
  },
];

export const PLAN_COMMITTED = PLAN_GROUPS.reduce(
  (a, g) => a + g.items.reduce((b, it) => b + it.days, 0),
  0,
);

export interface PlanWeek {
  week: number;
  theme: string;
  lanes: { eng: string; items: string[] }[];
}
export const PLAN_WEEKS: PlanWeek[] = [
  {
    week: 1, theme: 'Make it live',
    lanes: [
      { eng: 'Engineer A — Records', items: ['Data seeding tool + reset', 'Move storyline to real records', 'Incidents live'] },
      { eng: 'Engineer B — Workflow', items: ['Recurring-incident grouping (start)'] },
      { eng: 'Engineer C — Screens + data', items: ['Metrics aggregation queries'] },
    ],
  },
  {
    week: 2, theme: 'Connect the workflow',
    lanes: [
      { eng: 'Engineer A — Records', items: ['Maintenance window + conflict checks'] },
      { eng: 'Engineer B — Workflow', items: ['Recurring-incident grouping (finish)', 'Change risk scoring'] },
      { eng: 'Engineer C — Screens + data', items: ['Major-incident backend'] },
    ],
  },
  {
    week: 3, theme: 'Finish and rehearse',
    lanes: [
      { eng: 'Engineer A — Records', items: ['Integration + testing'] },
      { eng: 'Engineer B — Workflow', items: ['Automatic CAB summary'] },
      { eng: 'Engineer C — Screens + data', items: ['Live executive summary', 'Demo run-through'] },
    ],
  },
];

export const PLAN_DEPENDENCY =
  'These features use the on-premise language model (the GB10 appliance). It is not running in the current ' +
  'environment, so confirm it is available before starting — otherwise the automated steps fall back to their ' +
  'scripted versions.';
