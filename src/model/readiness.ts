/**
 * Module Readiness & Build Plan — ✓ / ◐ / ✗ per pillar.
 * Transcribed from draw.io page 2 "Module Readiness & Build Plan".
 */
import type { ArchNodeDef, ArchEdgeDef, ReadinessCardDef, ReadinessRow, Status } from './types';

function r(m: ReadinessRow['m'], t: string): ReadinessRow {
  return { m, t };
}

export const READINESS_CARDS: ReadinessCardDef[] = [
  /* ── Row 1 — ITSM core pillars ── */
  {
    id: 'cInc', title: 'Incident Management', tone: 'seeded', x: 40, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'Frontend — list, filters, SLA bars, detail drawer'),
      r('✓', 'Type contracts API-shaped (Incident · Timeline · KbCitation)'),
      r('✓', 'Seeded demo data (7 incidents) + deep links'),
      r('✗', 'Backend module — routes · schemas · services · tools'),
      r('✗', 'DB models + Alembic migration'),
      r('✗', 'CRUD + filter / search / pagination API'),
      r('✗', 'Server-side SLA engine + breach prediction'),
      r('✗', 'Create / edit forms + mutations (React Query)'),
    ],
  },
  {
    id: 'cWar', title: 'Major Incident / War Room', tone: 'seeded', x: 450, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'War-room UI — clock, roster, sites, comms, actions'),
      r('✓', 'MajorIncident type contract'),
      r('◐', 'Comms posting — local state only, not persisted'),
      r('✗', 'Backend module + persistence'),
      r('✗', 'Live comms stream (SSE / WebSocket)'),
      r('✗', 'Exec-briefing regeneration via LLM'),
      r('✗', 'Auto-paging from on-call rotation'),
    ],
  },
  {
    id: 'cProb', title: 'Problem Management', tone: 'seeded', x: 860, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'UI — list, KPIs, RCA drawer, status lifecycle'),
      r('✓', 'Cross-link UI (incidents ↔ problem ↔ change)'),
      r('◐', 'Types — local to ProblemsPage; move to src/types'),
      r('✗', 'Backend module + DB models'),
      r('✗', 'Known-error + workaround model (ITIL)'),
      r('✗', 'Cluster-detection → problem promotion API'),
      r('✗', 'Postmortem linkage (types already in case-vault)'),
    ],
  },
  {
    id: 'cChg', title: 'Change Management + CAB', tone: 'seeded', x: 1270, y: 96, w: 390, h: 214,
    rows: [
      r('✓', 'UI — change list, risk dial + explainer, CAB calendar'),
      r('✓', 'Seeded changes + conflict flags'),
      r('◐', 'Approvals — generic approvals API live, not wired to CAB'),
      r('✗', 'Backend module + DB models'),
      r('✗', 'Risk-scoring service (factors → score)'),
      r('✗', 'Maintenance-window conflict detection'),
      r('✗', 'CAB brief generation (LLM) persisted on record'),
    ],
  },

  /* ── Row 2 — supporting ── */
  {
    id: 'cCmdb', title: 'CMDB / Assets', tone: 'seeded', x: 40, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'Asset catalog UI + CI site drawer'),
      r('✓', 'Seeded sites / CIs linked from incident drawer'),
      r('◐', 'Device data — sccm module live (mock / Graph / admin svc)'),
      r('✗', 'CI model + relationships in Postgres'),
      r('✗', 'CI ↔ incident impact API'),
      r('✗', 'Discovery / sync pipeline'),
    ],
  },
  {
    id: 'cPortal', title: 'Citizen Portal + Service Catalog', tone: 'seeded', x: 450, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'Portal + catalog UI (separate citizen shell)'),
      r('◐', 'Submitted requests — localStorage round-trip only'),
      r('✗', 'Backend module (requests, catalog items)'),
      r('✗', 'Portal ↔ incident round-trip API'),
      r('✗', 'Status notifications (email via exchange module)'),
      r('✗', 'SLA + approver data from server'),
    ],
  },
  {
    id: 'cDash', title: 'Dashboards & Metrics', tone: 'seeded', x: 860, y: 330, w: 390, h: 200,
    rows: [
      r('✓', '10 dashboard instances + library + deep links'),
      r('✓', 'Home KPI strip computed from seeds'),
      r('◐', 'Metrics polls (settings) — live API'),
      r('✗', 'Aggregation endpoints — MTTR · SLA · volumes'),
      r('✗', 'Chart series wired to metrics API (inline arrays today)'),
      r('✗', 'Single source of truth — dashboards can contradict seeds'),
    ],
  },
  {
    id: 'cVoice', title: 'Voice & Phone Channel', tone: 'seeded', x: 1270, y: 330, w: 390, h: 200,
    rows: [
      r('✓', 'TTS service + /tts/synthesize + admin config (live)'),
      r('✓', 'Voice mode — mic → chat (mode=voice) → TTS'),
      r('✓', 'Per-agent voices (galaxy voice_id) · EN + AR'),
      r('◐', 'Phone-bridge UI — scripted demo, no live call'),
      r('✗', 'Real telephony ingress (SIP / IVR)'),
      r('✗', 'Server-side STT (Whisper service)'),
    ],
  },

  /* ── Row 3 — live platform + demo ── */
  {
    id: 'cChat', title: 'Compass Chat & Agent Core', tone: 'live', x: 40, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Chat + agent tool orchestration'),
      r('✓', 'Conversations CRUD'),
      r('✓', 'Trace capture + visualization'),
      r('✓', 'Actions + approval flows'),
      r('✓', 'Profile loader (CUSTOMER_PROFILE)'),
    ],
  },
  {
    id: 'cKnow', title: 'Knowledge / RAG', tone: 'live', x: 450, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'RAG ingest + vector search (Qdrant)'),
      r('✓', 'Runbook indexer + document processors'),
      r('✓', 'SharePoint connector'),
      r('◐', 'Incident KB citations — seeded on incidents today; wire to retrieval at intake when incidents module lands'),
    ],
  },
  {
    id: 'cLocker', title: 'Locker · Reports · Galaxy · Governance', tone: 'live', x: 860, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Locker folders + templates (postmortem panel)'),
      r('✓', 'Reports + scheduled reports (MinIO)'),
      r('✓', 'Galaxy REST + SSE pulses'),
      r('◐', 'Governance — kill-switch UI live; approval policies + replay decisions are seeded client-side'),
    ],
  },
  {
    id: 'cDemo', title: 'Demo / Presenter Layer', tone: 'demo', x: 1270, y: 574, w: 390, h: 170,
    rows: [
      r('✓', 'Story script (6 stories) + beacon stepper'),
      r('✓', 'Workspace map narrated playback (TTS-synced)'),
      r('✗', 'Beacon fixes — off-script check + take-me-back URL'),
      r('✗', 'Beacon voiceover + autopilot mode'),
      r('✗', 'Arabic narrations / i18n of demo copy'),
    ],
  },

  /* ── Bottom — target shape ── */
  {
    id: 'tgtAnat', title: 'modules/incidents — anatomy (one pattern, five new modules)', tone: 'plan', x: 40, y: 800, w: 520, h: 330,
    rows: [
      r('·', 'module.py — registration + feature flags via profiles/<name>.yaml'),
      r('·', 'routes.py — /api/v1/incidents · /api/v1/major-incidents'),
      r('·', 'schemas.py — mirror frontend types 1:1 (contract already frozen in src/data/seededIncidents.ts — keep field names)'),
      r('·', 'services.py — SLA math · cluster merge · breach prediction'),
      r('·', 'tools.py — agent tools: classify_incident · match_pattern · merge_tickets (names already shown in CompassConsoleStrip)'),
      r('·', 'prompts.py — triage + exec-briefing prompts'),
      r('·', 'Same skeleton → modules/problems · modules/changes · modules/cmdb · modules/portal'),
    ],
  },
  {
    id: 'tgtShared', title: 'Shared platform work (cross-module)', tone: 'plan', x: 580, y: 800, w: 520, h: 330,
    rows: [
      r('·', 'cross_links table — INC ↔ PRB ↔ CHG ↔ CI relations (replaces src/data/seededCrossReferences.ts)'),
      r('·', 'SLA engine — windows, business hours, breach-risk scoring'),
      r('·', 'SSE hub — war-room comms + activity ticker + dashboards (galaxy/stream pattern already exists — generalise it)'),
      r('·', 'Demo seeder CLI — load frontend fixtures into Postgres so the demo story (INC-1041, PRB-031, CHG-2047) survives the swap'),
      r('·', 'Frontend swap — seeded imports → React Query fetchers; types unchanged, pages mostly untouched'),
      r('·', 'Metrics aggregation — MTTR / SLA / volume endpoints feeding the 10 dashboards from the same store'),
    ],
  },
];

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const READINESS_NODES: ArchNodeDef[] = [
  n('rp1', 'P1 — incidents module: models + CRUD + SLA + drawer wiring', 1140, 810, 550, 48, 'planned'),
  n('rp2', 'P2 — problems module + cross_links + cluster → problem promotion', 1140, 878, 550, 48, 'shared'),
  n('rp3', 'P3 — changes module: risk scoring + CAB conflict detection + approvals wiring', 1140, 946, 550, 48, 'shared'),
  n('rp4', 'P4 — portal/catalog round-trip + email notifications (exchange module)', 1140, 1014, 550, 48, 'live', { dashed: true }),
  n('rp5', 'P5 — realtime: war-room SSE comms + activity stream + metrics aggregation', 1140, 1082, 550, 48, 'live', { dashed: true }),
];

export const READINESS_EDGES: ArchEdgeDef[] = [
  { id: 'rq1', source: 'rp1', target: 'rp2', kind: 'neutral' },
  { id: 'rq2', source: 'rp2', target: 'rp3', kind: 'neutral' },
  { id: 'rq3', source: 'rp3', target: 'rp4', kind: 'neutral' },
  { id: 'rq4', source: 'rp4', target: 'rp5', kind: 'neutral' },
];
