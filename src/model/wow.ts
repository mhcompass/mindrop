/**
 * 3-Week "Wow" scope — what 3 engineers can realistically deliver in three
 * weeks for maximum demo impact. Curated from the development-plan
 * workstreams (A–B core), grouped by the demo moment each deliverable lands.
 *
 * Thesis: the agentic ITIL loop running LIVE, on real data, that the buyer
 * can drive themselves — credibility + the INC→PRB→CHG differentiation.
 */

export type WowAxis = 'credibility' | 'differentiation' | 'hero' | 'support';

export interface WowDeliverable {
  /** Dev-plan deliverable id (A1, B5, …). */
  ref: string;
  title: string;
  md: number;
}

export interface WowMoment {
  id: string;
  title: string;
  axis: WowAxis;
  /** The demo punchline this moment lands. */
  punchline: string;
  /** Why it lands — the strategic reason. */
  whyWow: string;
  items: WowDeliverable[];
}

export const WOW_TEAM = { engineers: 3, weeks: 3, daysPerWeek: 5, utilization: 0.8 };
export const WOW_CAPACITY = Math.round(
  WOW_TEAM.engineers * WOW_TEAM.weeks * WOW_TEAM.daysPerWeek * WOW_TEAM.utilization,
); // 36

export const WOW_AXIS_LABEL: Record<WowAxis, string> = {
  credibility: 'Credibility',
  differentiation: 'Differentiation',
  hero: 'Hero screen',
  support: 'Supporting',
};

export const WOW_AXIS_ACCENT: Record<WowAxis, string> = {
  credibility: '#2e7d32',
  differentiation: '#8b5cf6',
  hero: '#e11d48',
  support: '#2563eb',
};

export const WOW_MOMENTS: WowMoment[] = [
  {
    id: 'm_live',
    title: "It's real — drive it yourself",
    axis: 'credibility',
    punchline: 'Every click in the demo is a live DB transaction, not a seeded mockup.',
    whyWow:
      'The #1 question gov/enterprise buyers ask is "is this real or slideware?". Moving the demo onto the live ' +
      'records engine makes the answer "yes" — and lets you hand them the keyboard.',
    items: [
      { ref: 'A4', title: 'Demo seeder CLI (fixtures → Postgres) + reset script', md: 3 },
      { ref: 'A5', title: 'Retire the scripted INC-104x storyline onto real records', md: 2 },
      { ref: 'B1', title: 'Incidents live end-to-end in the demo flow', md: 3 },
    ],
  },
  {
    id: 'm_loop',
    title: 'The loop closes itself',
    axis: 'differentiation',
    punchline: 'Incident → Compass spots the cluster → Problem → risk-scored Change → CAB, all linked, no human routing.',
    whyWow:
      'ServiceNow can store a problem record; this is Compass acting on one end to end. The link_records plumbing ' +
      'is already live, so this finishes the agentic loop — the single biggest structural differentiator.',
    items: [
      { ref: 'B5', title: 'Problem: known_errors + automatic recurrence/cluster detection', md: 5 },
      { ref: 'B6', title: 'Change: real risk score from history / traffic / dependencies', md: 4 },
      { ref: 'B7', title: 'Change: auto-generated CAB brief', md: 3 },
      { ref: 'B8', title: 'CAB: auto safest-window suggestion + live conflict flags', md: 3 },
    ],
  },
  {
    id: 'm_warroom',
    title: 'The war room, live',
    axis: 'hero',
    punchline: 'The highest-density screen, backed by real data and a genuinely regenerating exec briefing.',
    whyWow:
      'The war room answers more "what about…" questions per minute than any other surface. Real comms + a live ' +
      'briefing (not the scripted typewriter) makes it bulletproof under scrutiny.',
    items: [
      { ref: 'B2', title: 'War room backend: major_incidents + war_room_comms + persist comms', md: 4 },
      { ref: 'B3', title: 'Live exec-briefing regeneration (Briefing Agent)', md: 3 },
    ],
  },
  {
    id: 'm_support',
    title: 'Live insight + close-out',
    axis: 'support',
    punchline: 'Dashboards read live aggregates; the build ends demoable, not duct-taped.',
    whyWow:
      'A1 unblocks live dashboards so the metrics aren’t hardcoded; the buffer protects a clean demo dry-run.',
    items: [
      { ref: 'A1', title: 'Metrics aggregation endpoints (MTTR · SLA · volume) → live dashboards', md: 4 },
    ],
  },
];

/** Reserved for integration, QA and a demo dry-run (not allocated to features). */
export const WOW_BUFFER = 2;

export const WOW_COMMITTED = WOW_MOMENTS.reduce(
  (a, m) => a + m.items.reduce((b, it) => b + it.md, 0),
  0,
);

/** Explicitly out of the 3-engineer window — with why it's safe to defer. */
export interface WowDeferral {
  title: string;
  why: string;
  /** 'stage' = defer but show it (e.g. pre-recorded). */
  stage?: boolean;
}
export const WOW_DEFERRED: WowDeferral[] = [
  { title: 'Arabic phone channel (call → Whisper → Compass → Kokoro → ticket)', stage: true,
    why: 'Biggest MENA-gov wow, but needs a SIP decision + voice specialist (~11 md). Pre-record a 60s clip for the deck; build in phase 2.' },
  { title: 'Real governance decision replay', stage: true,
    why: 'High auditor wow, but ~6 md. Demo the seeded replay now; make it real with the next 3 engineers.' },
  { title: 'Citizen portal round-trip + channels (email-to-ticket, webhooks)',
    why: 'The operator demo doesn’t depend on it; adds scope without changing the headline wow.' },
  { title: 'Real integration connectors (Graph / SCCM / WebLogic)',
    why: 'Mock/seed data is indistinguishable in the demo; hardening is a post-sale activity.' },
  { title: 'Predictive SLA-breach + on-demand AR translation',
    why: 'Nice-to-have polish; not on the critical path of the live agentic loop.' },
];

/** 3-engineer × 3-week swimlane. */
export interface WowLane {
  eng: string;
  items: string[]; // short labels referencing deliverable refs
}
export interface WowWeek {
  week: number;
  theme: string;
  lanes: WowLane[];
}
export const WOW_WEEKS: WowWeek[] = [
  {
    week: 1, theme: 'Make it live',
    lanes: [
      { eng: 'Eng A · Records', items: ['A4 Seeder + reset', 'A5 Retire fixtures', 'B1 Incidents live'] },
      { eng: 'Eng B · Agentic', items: ['B5 Recurrence detection (start)'] },
      { eng: 'Eng C · Hero + insight', items: ['A1 Metrics aggregation'] },
    ],
  },
  {
    week: 2, theme: 'Close the loop',
    lanes: [
      { eng: 'Eng A · Records', items: ['B8 CAB window + conflicts'] },
      { eng: 'Eng B · Agentic', items: ['B5 Recurrence (finish)', 'B6 Change risk score'] },
      { eng: 'Eng C · Hero + insight', items: ['B2 War room backend'] },
    ],
  },
  {
    week: 3, theme: 'Hero + polish',
    lanes: [
      { eng: 'Eng A · Records', items: ['Integration + QA'] },
      { eng: 'Eng B · Agentic', items: ['B7 Auto CAB brief'] },
      { eng: 'Eng C · Hero + insight', items: ['B3 Live exec briefing', 'Demo dry-run'] },
    ],
  },
];
