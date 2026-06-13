/**
 * Module Tracker — neutral, flat inventory of every module with its
 * implementation status. This is the file to edit when something
 * ships: flip `ui` / `api` between 'none' → 'partial' → 'done' and
 * the tile, pill and summary counts update everywhere.
 */
import type { ArchNodeDef, ModuleTileDef, ModuleEdgeDef, PlacedTile, ModuleStatus } from './types';
import { moduleStatus } from './types';

function m(id: string, name: string, ui: ModuleTileDef['ui'], api: ModuleTileDef['api'], note?: string, feOnly?: boolean, meta?: Partial<ModuleTileDef>): ModuleTileDef {
  return { id, name, ui, api, note, feOnly, ...meta };
}

interface Section {
  title: string;
  mods: ModuleTileDef[];
}

const SECTIONS: Section[] = [
  {
    title: 'ITSM PILLARS',
    mods: [
      m('t_inc', 'Incident Management', 'done', 'none', 'list · drawer · SLA bars · KB citations', false, { owner: 'ITSM Squad', effort: 'L', critical: true, sensitivity: 'sensitive' }),
      m('t_war', 'Major Incident / War Room', 'done', 'none', 'clock · roster · comms · actions', false, { owner: 'ITSM Squad', effort: 'L', critical: true, sensitivity: 'sensitive' }),
      m('t_prob', 'Problem Management', 'done', 'none', 'RCA drawer · status lifecycle', false, { owner: 'ITSM Squad', effort: 'M', critical: true, sensitivity: 'internal' }),
      m('t_chg', 'Change Management', 'done', 'none', 'risk dial · factors · CAB brief', false, { owner: 'ITSM Squad', effort: 'L', critical: true, sensitivity: 'internal' }),
      m('t_cab', 'CAB Calendar', 'done', 'none', 'windows + conflict flags', false, { owner: 'ITSM Squad', effort: 'M', sensitivity: 'internal' }),
      m('t_cmdb', 'CMDB / Assets', 'done', 'none', 'device data via sccm exists (mock)', false, { owner: 'Integrations Squad', effort: 'L', critical: true, sensitivity: 'internal' }),
      m('t_catalog', 'Service Catalog', 'done', 'none', 'request tiles + submit', false, { owner: 'Experience Squad', effort: 'M', sensitivity: 'internal' }),
      m('t_portal', 'Citizen Portal', 'done', 'none', 'localStorage round-trip only', false, { owner: 'Experience Squad', effort: 'M', channel: true, sensitivity: 'pii' }),
      m('t_oncall', 'On-call Rotation', 'done', 'none', undefined, false, { owner: 'ITSM Squad', effort: 'S', sensitivity: 'pii' }),
      m('t_phone', 'Phone / Telephony', 'done', 'none', 'scripted demo; no SIP · no server STT', false, { owner: 'Experience Squad', effort: 'L', channel: true, sensitivity: 'pii' }),
      m('t_dash', 'Dashboards & Metrics', 'done', 'partial', 'charts hardcoded; metrics polls live', false, { owner: 'Platform Squad', effort: 'M', sensitivity: 'internal' }),
    ],
  },
  {
    title: 'SHARED SERVICES (CROSS-MODULE)',
    mods: [
      m('t_sla', 'SLA Engine', 'partial', 'none', 'client-side math today; server-side to build'),
      m('t_links', 'Cross-links INC↔PRB↔CHG↔CI', 'done', 'none', 'seeded lookups; needs cross_links table'),
      m('t_sse', 'Realtime / SSE Hub', 'partial', 'partial', 'galaxy/stream exists — generalise it'),
      m('t_agg', 'Metrics Aggregation', 'none', 'none', 'MTTR · SLA · volume endpoints'),
      m('t_seeder', 'Demo Seeder CLI', 'none', 'none', 'fixtures → Postgres'),
      m('t_fixtures', 'Seeded Fixtures (src/data)', 'done', 'none', '10 fixture files powering the UI — retire after APIs land'),
      m('t_notif', 'Notifications (round-trip)', 'none', 'partial', 'exchange module live; wiring to build'),
    ],
  },
  {
    title: 'PLATFORM CORE',
    mods: [
      m('t_chat', 'Compass Chat & Agent', 'done', 'done', 'tool orchestration · renderers'),
      m('t_conv', 'Conversations', 'done', 'done'),
      m('t_know', 'Knowledge / RAG', 'done', 'done', 'Qdrant · ingest · runbook indexer'),
      m('t_locker', 'My Locker (Case Vault)', 'done', 'done', 'folders · templates · postmortems'),
      m('t_reports', 'Reports & Scheduled', 'done', 'done', 'MinIO artifacts'),
      m('t_galaxy', 'Galaxy View', 'done', 'done', 'REST + SSE pulses'),
      m('t_briefing', 'Briefing Hero', 'done', 'done', 'spoken on load'),
      m('t_voice', 'Voice / TTS', 'done', 'done', 'Kokoro/Piper · EN + AR · per-agent voices'),
      m('t_trace', 'Trace / Observability', 'done', 'done'),
      m('t_conn', 'Connectors', 'done', 'done'),
      m('t_watch', 'Watchlists & Insights', 'done', 'done'),
      m('t_uc', 'Use-case Hub', 'done', 'done'),
      m('t_auth', 'Auth (Entra / LDAP / JWT)', 'done', 'done'),
      m('t_gov', 'Governance', 'done', 'partial', 'kill switch live; policies + replay seeded'),
      m('t_appr', 'Approvals', 'done', 'done'),
      m('t_profile', 'Profile Loader', 'done', 'done', 'CUSTOMER_PROFILE modules'),
    ],
  },
  {
    title: 'INTEGRATION MODULES',
    mods: [
      m('t_user', 'user_management', 'done', 'done', 'mock / Graph / LDAP clients'),
      m('t_sccm', 'sccm (devices)', 'done', 'done', 'mock client default'),
      m('t_exch', 'exchange (email)', 'done', 'done'),
      m('t_wl', 'weblogic (runbooks)', 'done', 'partial', 'WEBLOGIC_MOCK=true today'),
      m('t_sp', 'SharePoint KB sync', 'done', 'done'),
    ],
  },
  {
    title: 'CHANNELS',
    mods: [
      m('t_console', 'Operator Web Console', 'done', 'done', 'the React SPA — primary surface', false, { channel: true, critical: true }),
      m('t_apipub', 'REST API · /api/v1', 'done', 'done', 'FastAPI contract', false, { channel: true, critical: true, owner: 'Platform Squad' }),
      m('t_emailin', 'Email-to-Ticket', 'none', 'none', 'inbound email → incident (to build)', false, { channel: true, effort: 'M', owner: 'Integrations Squad' }),
      m('t_webhook', 'Inbound Webhooks', 'none', 'none', 'monitoring alerts → incident (to build)', false, { channel: true, effort: 'M', owner: 'Integrations Squad' }),
      m('t_mobile', 'Mobile App', 'none', 'none', 'future', false, { channel: true, effort: 'L' }),
    ],
  },
  {
    title: 'EXTERNAL SYSTEMS',
    mods: [
      m('t_entra', 'Microsoft Entra ID', 'none', 'done', 'user auth · OIDC', false, { external: true, sensitivity: 'pii' }),
      m('t_graph', 'Microsoft Graph', 'none', 'done', 'Intune devices · mail · approvals', false, { external: true, sensitivity: 'pii' }),
      m('t_sp_ext', 'SharePoint', 'none', 'done', 'knowledge-base sync', false, { external: true, sensitivity: 'sensitive' }),
      m('t_smtp', 'SMTP Relay', 'none', 'partial', 'alt email provider', false, { external: true }),
      m('t_wl_ext', 'Oracle WebLogic', 'none', 'partial', 'runbook target · mock today', false, { external: true }),
      m('t_ollama', 'Ollama', 'none', 'partial', 'alternate local LLM provider', false, { external: true, owner: 'AI Squad' }),
      m('t_azure', 'Azure OpenAI', 'none', 'partial', 'opt-in frontier model', false, { external: true, owner: 'AI Squad', sensitivity: 'sensitive' }),
    ],
  },
  {
    title: 'INFRASTRUCTURE',
    mods: [
      { id: 't_pg', name: 'PostgreSQL 15', ui: 'none', api: 'done', infra: true, note: 'primary store (:5493) · Alembic migrations' },
      { id: 't_qdrant', name: 'Qdrant Vector DB', ui: 'none', api: 'done', infra: true, note: 'RAG embeddings (:6333)' },
      { id: 't_minio', name: 'MinIO Object Storage', ui: 'none', api: 'done', infra: true, note: 'report artifacts (:9000 / :9001)' },
      { id: 't_ttsbox', name: 'TTS Container', ui: 'none', api: 'done', infra: true, note: 'Kokoro shim · Piper fallback (:8000) · EN + AR' },
      { id: 't_llm', name: 'LLM — llama.cpp (GB10)', ui: 'none', api: 'done', infra: true, note: 'qwen3-30b-a3b · local-first · Azure opt-in' },
      { id: 't_langfuse', name: 'Langfuse', ui: 'none', api: 'partial', infra: true, note: 'LLM observability — optional, off by default (:13000)' },
      { id: 't_compose', name: 'Docker Compose Stack', ui: 'none', api: 'done', infra: true, note: 'itsm-network · air-gappable boundary' },
    ],
  },
  {
    title: 'DEMO / PRESENTER LAYER',
    mods: [
      m('t_story', 'Story Mode Stepper', 'done', 'none', '6 stories · 2 known bugs to fix', true),
      m('t_wsmap', 'Workspace Map Playback', 'done', 'none', 'TTS-narrated camera walk', true),
      m('t_vo', 'Galaxy Voiceovers', 'done', 'none', 'per-planet · auto-play', true),
      m('t_autopilot', 'Demo Autopilot', 'none', 'none', 'hands-free scripted runs', true),
      m('t_ar', 'Arabic Narrations', 'none', 'none', 'i18n of demo copy', true),
    ],
  },
];

/* Default overlay metadata per section so the overlay modes have full
 * coverage without hand-tagging every module. */
const DEFAULT_OWNER: Record<string, string> = {
  'ITSM PILLARS': 'ITSM Squad',
  'SHARED SERVICES (CROSS-MODULE)': 'Platform Squad',
  'PLATFORM CORE': 'Platform Squad',
  'INTEGRATION MODULES': 'Integrations Squad',
  'CHANNELS': 'Experience Squad',
  'EXTERNAL SYSTEMS': 'Vendor (3rd-party)',
  'INFRASTRUCTURE': 'Platform Squad',
  'DEMO / PRESENTER LAYER': 'Experience Squad',
};
for (const section of SECTIONS) {
  for (const mod of section.mods) {
    if (!mod.owner) mod.owner = DEFAULT_OWNER[section.title] ?? 'Unassigned';
    if (!mod.sensitivity) mod.sensitivity = 'internal';
  }
}

/* ── Grid layout ──────────────────────────────────────────────── */

const TILE_W = 250;
const TILE_H = 96;
const GAP = 18;
const COLS = 6;

const tiles: PlacedTile[] = [];
const headers: ArchNodeDef[] = [];

let y = 70;
for (const section of SECTIONS) {
  headers.push({
    id: `hdr_${section.title}`,
    label: section.title,
    x: 0,
    y,
    w: 800,
    h: 22,
    status: 'note',
    fontSize: 13,
  });
  y += 32;
  section.mods.forEach((mod, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    tiles.push({ ...mod, x: col * (TILE_W + GAP), y: y + row * (TILE_H + GAP), w: TILE_W, h: TILE_H });
  });
  y += Math.ceil(section.mods.length / COLS) * (TILE_H + GAP) + 24;
}

/* ── Summary ──────────────────────────────────────────────────── */

const counts: Record<ModuleStatus, number> = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
for (const s of SECTIONS) for (const mod of s.mods) counts[moduleStatus(mod)]++;

const total = Object.values(counts).reduce((a, b) => a + b, 0);

headers.unshift({
  id: 'tracker_summary',
  label: `${total} modules — ● ${counts.implemented} implemented · ◑ ${counts.partial} partial · ◔ ${counts['ui-only']} UI only · ○ ${counts.planned} not started`,
  x: 0,
  y: 16,
  w: 1200,
  h: 28,
  status: 'note',
  fontSize: 15,
});

export const TRACKER_TILES = tiles;
export const TRACKER_NODES = headers;

/** Flat module list + lookup — shared with the Clusters view so a
 *  status flip in SECTIONS propagates everywhere. */
export const ALL_MODULES: ModuleTileDef[] = SECTIONS.flatMap((s) => s.mods);
export const MODULE_BY_ID: Record<string, ModuleTileDef> = Object.fromEntries(ALL_MODULES.map((mod) => [mod.id, mod]));

/* ── Module-to-module relations ───────────────────────────────── */

function me(id: string, source: string, target: string, label: string): ModuleEdgeDef {
  return { id, source, target, label };
}

/** Which module relates to what. Rendered on the Zoom Map at mid/near
 *  zoom; endpoints are module ids from SECTIONS above. */
export const MODULE_EDGES: ModuleEdgeDef[] = [
  /* ITIL flow */
  me('me_inc_prob', 't_inc', 't_prob', 'recurrence promotes'),
  me('me_prob_chg', 't_prob', 't_chg', 'permanent fix'),
  me('me_chg_cab', 't_chg', 't_cab', 'scheduled at CAB'),
  me('me_cab_appr', 't_cab', 't_appr', 'approval gate'),
  me('me_war_inc', 't_war', 't_inc', 'declared from P1'),
  me('me_oncall_war', 't_oncall', 't_war', 'pages the bridge'),
  me('me_sla_inc', 't_sla', 't_inc', 'breach risk'),
  me('me_links_prob', 't_links', 't_prob', 'INC↔PRB↔CHG links'),
  /* Citizen intake */
  me('me_portal_cat', 't_portal', 't_catalog', 'make a request'),
  me('me_cat_inc', 't_catalog', 't_inc', 'requests become tickets'),
  me('me_phone_inc', 't_phone', 't_inc', 'calls open tickets'),
  me('me_notif_portal', 't_notif', 't_portal', 'status updates'),
  me('me_exch_notif', 't_exch', 't_notif', 'sends email'),
  /* CMDB */
  me('me_cmdb_inc', 't_cmdb', 't_inc', 'CI impact'),
  me('me_sccm_cmdb', 't_sccm', 't_cmdb', 'device sync'),
  /* AI involvement */
  me('me_chat_inc', 't_chat', 't_inc', 'triage tools'),
  me('me_know_inc', 't_know', 't_inc', 'KB citations'),
  me('me_chat_know', 't_chat', 't_know', 'RAG retrieval'),
  me('me_voice_chat', 't_voice', 't_chat', 'voice mode'),
  me('me_phone_voice', 't_phone', 't_voice', 'STT / TTS'),
  me('me_watch_prob', 't_watch', 't_prob', 'pattern candidates'),
  me('me_gov_trace', 't_gov', 't_trace', 'decision replay'),
  me('me_user_auth', 't_auth', 't_user', 'directory'),
  /* Metrics & reports */
  me('me_dash_agg', 't_dash', 't_agg', 'reads aggregates'),
  me('me_reports_locker', 't_reports', 't_locker', 'filed to locker'),
  /* Infrastructure */
  me('me_agg_pg', 't_agg', 't_pg', 'queries'),
  me('me_seeder_pg', 't_seeder', 't_pg', 'loads fixtures'),
  me('me_fixtures_seeder', 't_fixtures', 't_seeder', 'migrates'),
  me('me_know_qdrant', 't_know', 't_qdrant', 'vectors'),
  me('me_reports_minio', 't_reports', 't_minio', 'artifacts'),
  me('me_chat_llm', 't_chat', 't_llm', 'completions'),
  me('me_voice_ttsbox', 't_voice', 't_ttsbox', 'synthesize'),
  me('me_wsmap_ttsbox', 't_wsmap', 't_ttsbox', 'narration'),
  me('me_trace_langfuse', 't_trace', 't_langfuse', 'trace export'),
  /* Channels → work */
  me('me_console_inc', 't_console', 't_inc', 'operate'),
  me('me_api_inc', 't_apipub', 't_inc', 'REST'),
  me('me_emailin_inc', 't_emailin', 't_inc', 'creates'),
  me('me_webhook_inc', 't_webhook', 't_inc', 'alerts → inc'),
  me('me_console_chat', 't_console', 't_chat', 'ask Compass'),
  /* External systems */
  me('me_entra_auth', 't_entra', 't_auth', 'OIDC'),
  me('me_graph_sccm', 't_graph', 't_sccm', 'devices'),
  me('me_graph_exch', 't_graph', 't_exch', 'mail · approvals'),
  me('me_sp_sync', 't_sp_ext', 't_sp', 'document sync'),
  me('me_smtp_exch', 't_smtp', 't_exch', 'relay'),
  me('me_wl_target', 't_wl_ext', 't_wl', 'runbook target'),
  me('me_ollama_chat', 't_ollama', 't_chat', 'alt provider'),
  me('me_azure_chat', 't_azure', 't_chat', 'frontier opt-in'),
];

/* Dev-time sanity: edge endpoints must be real modules. */
for (const e of MODULE_EDGES) {
  if (!MODULE_BY_ID[e.source] || !MODULE_BY_ID[e.target]) {
    throw new Error(`modules.ts edge ${e.id} references unknown module id`);
  }
}
