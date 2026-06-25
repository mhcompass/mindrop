/**
 * Module Readiness & Build Plan — ✓ done · ◐ partial · ✗ not built, per
 * pillar. Reconciled with the live codebase: the ITIL records engine
 * (Incident/Problem/Change/CMDB/Portal) and multi-tenant profiling have
 * shipped, so the pillars are now backend-live; the remaining ✗/◐ rows are
 * the genuinely-open work, aligned with the Roadmap phases.
 */
import type { ArchNodeDef, ArchEdgeDef, ReadinessCardDef, ReadinessRow, Status } from '../../model/types';

function r(m: ReadinessRow['m'], t: string): ReadinessRow {
  return { m, t };
}

export const READINESS_CARDS: ReadinessCardDef[] = [
  /* ── Row 1 — ITSM core pillars (now records-engine live) ── */
  {
    id: 'cInc', title: 'Incident Management', tone: 'live', x: 40, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'Frontend — list, filters, SLA bars, detail drawer'),
      r('✓', 'Backend records engine — routes · schemas · services'),
      r('✓', 'DB models + Alembic migrations (live records)'),
      r('✓', 'CRUD + filters · by-number lookup · stats API'),
      r('✓', 'SLA timers + breach → admin notify + sla_breached event'),
      r('✓', 'Create / transition / assign / worklog · agent tools'),
      r('✗', 'Predictive breach scoring server-side (client-side today)'),
    ],
  },
  {
    id: 'cWar', title: 'Major Incident / War Room', tone: 'seeded', x: 450, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'War-room UI — clock, roster, sites, comms, actions'),
      r('✓', 'MajorIncident type contract'),
      r('◐', 'Comms posting — local state only, not persisted'),
      r('✗', 'Backend module + persistence (comms log) — Plan B2'),
      r('✗', 'Live comms stream (SSE)'),
      r('✗', 'Exec-briefing regenerated live via LLM — Plan B3'),
    ],
  },
  {
    id: 'cProb', title: 'Problem Management', tone: 'live', x: 860, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'UI — list, KPIs, RCA drawer, status lifecycle'),
      r('✓', 'Backend records engine + DB models'),
      r('✓', 'Cross-links INC↔PRB↔CHG↔CI (ticket_links · /links)'),
      r('✓', 'Agent tools — create_problem · link_records'),
      r('◐', 'Auto recurrence → problem promotion (links live; detection scripted) — Plan B5'),
      r('✗', 'Known-error + workaround model (ITIL)'),
    ],
  },
  {
    id: 'cChg', title: 'Change Management + CAB', tone: 'live', x: 1270, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'UI — change list, risk dial + explainer, CAB calendar'),
      r('✓', 'Backend records + DB models'),
      r('✓', 'Change-risk model + CAB approval gate (live on records)'),
      r('✓', 'CAB calendar on real records (cab_window) + conflict flags'),
      r('◐', 'Full auto risk-scoring from history/traffic/deps — Plan B6'),
      r('✗', 'CAB brief auto-generated (LLM) + window auto-pick — Plan B7/B8'),
    ],
  },

  /* ── Row 2 — supporting (now backed) ── */
  {
    id: 'cCmdb', title: 'CMDB / Assets', tone: 'live', x: 40, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'Asset catalog UI + CI site drawer'),
      r('✓', 'assets table · /assets + /sites API'),
      r('◐', 'Device data — sccm module live (mock default; Graph/admin)'),
      r('◐', 'Fleet Operations — bulk SCCM UI + approval gating shipped'),
      r('✗', 'CI ↔ incident impact API'),
      r('✗', 'Discovery / sync pipeline'),
    ],
  },
  {
    id: 'cPortal', title: 'Citizen Portal + Service Catalog', tone: 'live', x: 450, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'Portal + catalog UI (citizen shell)'),
      r('✓', 'catalog_items · /catalog · submit → service_request'),
      r('✓', 'my-requests live — round-trip to records'),
      r('✗', 'Status notifications round-trip (email via exchange)'),
      r('◐', 'SLA + approver data from server'),
    ],
  },
  {
    id: 'cDash', title: 'Dashboards & Metrics', tone: 'seeded', x: 860, y: 330, w: 390, h: 200,
    rows: [
      r('✓', '10 dashboard instances + library + deep links'),
      r('✓', 'Home KPI strip computed from seeds'),
      r('◐', 'Metrics polls (settings) — live API'),
      r('✗', 'Aggregation endpoints — MTTR · SLA · volumes — Plan A1'),
      r('✗', 'Chart series wired to metrics API (inline arrays today)'),
    ],
  },
  {
    id: 'cVoice', title: 'Voice & Phone Channel', tone: 'live', x: 1270, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'TTS service + /tts/synthesize + admin config (live)'),
      r('✓', 'Voice mode — mic → chat (mode=voice) → TTS'),
      r('✓', 'Server-side STT (Spark Whisper) · EN + AR'),
      r('✓', 'Per-agent voices (galaxy voice_id) · EN + AR'),
      r('◐', 'Phone-bridge UI — scripted demo, no live call'),
      r('✗', 'Real telephony ingress (SIP / IVR)'),
    ],
  },

  /* ── Row 3 — live platform + demo ── */
  {
    id: 'cChat', title: 'Compass Chat & Agent Core', tone: 'live', x: 40, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Chat + agent tool orchestration'),
      r('✓', 'Conversations CRUD · trace capture + visualization'),
      r('✓', 'Actions + approvals (dual-admin · bypass · email tokens)'),
      r('✓', 'Multi-tenant profiles — runtime switch · schema-per-tenant'),
    ],
  },
  {
    id: 'cKnow', title: 'Knowledge / RAG', tone: 'live', x: 450, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'RAG ingest + vector search (Qdrant)'),
      r('✓', 'Runbook indexer + document processors'),
      r('✓', 'SharePoint connector'),
      r('✓', 'Incident KB citations wired at intake (records engine live)'),
    ],
  },
  {
    id: 'cLocker', title: 'Locker · Reports · Galaxy · Governance', tone: 'live', x: 860, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Locker folders + templates + EN/AR analysis-language'),
      r('✓', 'Reports + scheduled reports (MinIO)'),
      r('✓', 'Galaxy REST + SSE pulses'),
      r('◐', 'Governance — kill-switch + module-toggle live; policies/replay seeded'),
    ],
  },
  {
    id: 'cDemo', title: 'Demo / Presenter Layer', tone: 'demo', x: 1270, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Story script (6 stories) + beacon stepper'),
      r('✓', 'Workspace map narrated playback (TTS-synced)'),
      r('✓', 'Galaxy per-planet voiceovers'),
      r('✗', 'Story-mode — 2 known bugs · autopilot mode'),
      r('✗', 'Arabic narrations / i18n of demo copy'),
    ],
  },

  /* ── Bottom — what shipped + what's left ── */
  {
    id: 'tgtAnat', title: 'modules/* — the pattern that shipped (replicated across five modules)', tone: 'live', x: 40, y: 800, w: 520, h: 330,
    rows: [
      r('✓', 'module.py — registration + feature flags via profiles/<name>.yaml'),
      r('✓', 'routes.py — /api/v1/incidents · problems · changes · cmdb · catalog'),
      r('✓', 'schemas.py — contracts mirrored 1:1 with the frontend types'),
      r('✓', 'services.py — records engine · SLA math · transitions'),
      r('✓', 'tools.py — agent tools (create / transition / assign / link_records)'),
      r('◐', 'prompts.py — triage live; exec-briefing / CAB-draft still scripted'),
      r('✓', 'Same skeleton live across problems · changes · cmdb · portal'),
    ],
  },
  {
    id: 'tgtShared', title: 'Shared platform work (cross-module)', tone: 'plan', x: 580, y: 800, w: 520, h: 330,
    rows: [
      r('✓', 'ticket_links table — INC ↔ PRB ↔ CHG ↔ CI relations (live)'),
      r('✓', 'Frontend swap — seeded imports → live records API (slices 1–8)'),
      r('◐', 'SLA engine — timers + breach notify live; predictive scoring client-side'),
      r('◐', 'SSE hub — galaxy/stream live; generalise to war-room + dashboards'),
      r('✗', 'Demo seeder CLI — load fixtures into Postgres, reset between runs — Plan A4/A5'),
      r('✗', 'Metrics aggregation — MTTR / SLA / volume endpoints — Plan A1'),
    ],
  },
];

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

/* Current build sequence — mirrors the Roadmap phases (post records-engine). */
export const READINESS_NODES: ArchNodeDef[] = [
  n('rp1', 'P1 — finish Fleet Operations: collection-targeting exec + gating parity', 1140, 810, 550, 48, 'planned'),
  n('rp2', 'P2 — incident→change automation: recurrence · risk · CAB draft · conflict', 1140, 878, 550, 48, 'shared'),
  n('rp3', 'P3 — major-incident war room on live data + live exec summary', 1140, 946, 550, 48, 'shared'),
  n('rp4', 'P4 — metrics & SLA aggregation: MTTR/SLA/volume + live dashboards', 1140, 1014, 550, 48, 'planned', { dashed: true }),
  n('rp5', 'P5 — ingestion channels (email-to-ticket · webhooks) + drop scaffolding', 1140, 1082, 550, 48, 'live', { dashed: true }),
];

export const READINESS_EDGES: ArchEdgeDef[] = [
  { id: 'rq1', source: 'rp1', target: 'rp2', kind: 'neutral' },
  { id: 'rq2', source: 'rp2', target: 'rp3', kind: 'neutral' },
  { id: 'rq3', source: 'rp3', target: 'rp4', kind: 'neutral' },
  { id: 'rq4', source: 'rp4', target: 'rp5', kind: 'neutral' },
];
