/**
 * Delivery plan for a team of three engineers (about 2-2.5 weeks). Plain-language
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

/** Functionality that already works and can be enabled / demonstrated now.
 *  `testing: true` = built in the last few days; needs a final QA pass. */
export interface AvailableItem {
  text: string;
  testing?: boolean;
}
export interface AvailableGroup {
  group: string;
  items: AvailableItem[];
}
export const PLAN_AVAILABLE: AvailableGroup[] = [
  {
    group: 'Service management (ITIL)',
    items: [
      { text: 'Incident management — create, triage, assign, work-note and transition, with SLA timers and knowledge citations', testing: true },
      { text: 'Problem management — records, root cause and lifecycle, linked to their incidents', testing: true },
      { text: 'Change management — risk classification with a CAB approval gate on high-risk changes', testing: true },
      { text: 'CAB calendar — scheduled changes with conflict flags', testing: true },
      { text: 'Service catalog and citizen portal — submit a request and track it', testing: true },
      { text: 'Asset inventory (CMDB) — assets and sites with filtering', testing: true },
      { text: 'Cross-practice linking — connect incidents, problems and changes', testing: true },
    ],
  },
  {
    group: 'Assistant and knowledge',
    items: [
      { text: 'Compass assistant — chat with tool use across all of the above' },
      { text: 'Knowledge base with citations — folder-scoped question answering with sources' },
      { text: 'MyLocker document workspace — templates, with new English/Arabic document analysis', testing: true },
      { text: 'Reports — natural-language and scheduled reports' },
      { text: 'Voice — speech-to-text and text-to-speech in English and Arabic', testing: true },
      { text: 'Execution trace — step-by-step view of each assistant turn' },
    ],
  },
  {
    group: 'Platform and operations',
    items: [
      { text: 'Multi-tenant profiles and branding — switch between Default, Dubai Police and Ministry of Education, with data kept separate per tenant', testing: true },
      { text: 'Governance — assistant kill-switch and full audit log' },
      { text: 'Approvals — email approve/reject with secure tokens' },
      { text: 'Directory operations — user lookup, group audit and password reset' },
      { text: 'Device and compliance views (SCCM, sample data)' },
      { text: 'Operator web console and REST API' },
    ],
  },
  {
    group: 'System integrations',
    items: [
      { text: 'Microsoft Entra ID — single sign-on (OIDC)' },
      { text: 'Microsoft Graph — devices, mail and approvals' },
      { text: 'Active Directory / LDAP — directory operations' },
      { text: 'Microsoft Exchange — mailboxes and outbound email' },
      { text: 'SharePoint — knowledge-base document sync' },
      { text: 'Microsoft SCCM — device and patch management (sample data today)' },
      { text: 'Oracle WebLogic — application runbook operations (mock today)' },
      { text: 'SMTP — email relay' },
      { text: 'On-premise language model (GB10), with optional Azure OpenAI for frontier models' },
      { text: 'Speech services — Whisper (speech-to-text) and Kokoro / Piper (text-to-speech)' },
    ],
  },
];

export const PLAN_TEAM = { engineers: 3, daysPerWeek: 5 };
export const PLAN_BUFFER = 2; // reserved for integration + a demo run-through
/** Deliberate timeline framing — 3 engineers at ~12 working days each. */
export const PLAN_TIMELINE = 'about 2 to 2.5 weeks';

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
      { ref: 'A4', title: 'One-click seeding and reset of the demo data', days: 3 },
      { ref: 'A5', title: 'The whole demo running on real database records', days: 2 },
      { ref: 'B1', title: 'Incidents working end to end on the live system', days: 3 },
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
      { ref: 'B5', title: 'Automatic grouping of recurring incidents into a single problem', days: 5 },
      { ref: 'B6', title: 'Automatic change risk scoring from history, traffic and dependencies', days: 4 },
      { ref: 'B7', title: 'Auto-drafted change-advisory (CAB) summary', days: 3 },
      { ref: 'B8', title: 'Maintenance-window conflict checking and safe-window suggestion', days: 3 },
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
      { ref: 'B2', title: 'Major-incident war room backed by live data and a real communications log', days: 4 },
      { ref: 'B3', title: 'Executive summary regenerated live from the incident state', days: 3 },
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
      { ref: 'A1', title: 'Dashboards showing live metrics (mean time to resolve, SLA, ticket volume)', days: 4 },
    ],
  },
];

export const PLAN_COMMITTED = PLAN_GROUPS.reduce(
  (a, g) => a + g.items.reduce((b, it) => b + it.days, 0),
  0,
);
/** Total person-days (planned work + buffer) and the per-engineer span. */
export const PLAN_EFFORT = PLAN_COMMITTED + PLAN_BUFFER;
export const PLAN_DAYS_PER_ENGINEER = Math.round(PLAN_EFFORT / PLAN_TEAM.engineers);

