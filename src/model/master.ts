/**
 * Master Connected Map — every surface → its data source → its
 * (existing or missing) API → module → store.
 * Transcribed from draw.io page 3 "Master Connected Map".
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from './types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const MASTER_NODES: ArchNodeDef[] = [
  /* ── Zones ── */
  n('zChan', 'Channels & actors', 40, 64, 2780, 100, 'actor', { zone: true }),
  n('zFE', 'FRONTEND — React SPA (:3847) · organised by pillar · colour = readiness', 40, 196, 2780, 580, 'infra', { zone: true }),
  n('zFD', 'FRONTEND DATA LAYER — seeded fixtures & local stores (the demo illusion — all of this must migrate server-side)', 40, 816, 2780, 170, 'seeded', { zone: true }),
  n('zAPI', 'API SURFACE — /api/v1 (FastAPI :8421)', 40, 1026, 2780, 116, 'infra', { zone: true }),
  n('zBE', 'BACKEND — profile-loaded modules · new modules follow modules/_template (module.py · routes.py · schemas.py · services.py · tools.py · prompts.py)', 40, 1182, 2780, 340, 'infra', { zone: true }),
  n('zDP', 'DATA & MEDIA PLANE (docker)', 40, 1562, 920, 210, 'infra', { zone: true }),
  n('zAI', 'AI PLANE — local-first', 980, 1562, 900, 210, 'ai', { zone: true }),
  n('zExt', 'EXTERNAL INTEGRATIONS', 1900, 1562, 920, 210, 'external', { zone: true }),
  n('zSeq', 'BUILD SEQUENCE', 40, 1812, 2780, 100, 'planned', { zone: true }),

  /* ── Actors ── */
  n('aOp', 'Operator — ICT service desk', 200, 96, 240, 44, 'actor'),
  n('aCit', 'Citizen — teacher / principal', 700, 96, 240, 44, 'actor'),
  n('aPres', 'Presenter — guided demo', 1200, 96, 240, 44, 'actor'),
  n('aPhone', 'Phone caller (scripted demo)', 1700, 96, 240, 44, 'actor', { dashed: true }),
  n('aMail', 'Email channel (exchange module)', 2200, 96, 240, 44, 'actor'),

  /* ── Frontend · column headers ── */
  n('h1', 'INCIDENTS', 60, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h2', 'PROBLEMS', 460, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h3', 'CHANGE & CAB', 860, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h4', 'CMDB & CITIZEN', 1260, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h5', 'DASHBOARDS & MAPS', 1660, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h6', 'AI OPS — LIVE', 2060, 228, 380, 20, 'note', { fontSize: 11 }),
  n('h7', 'ADMIN — LIVE', 2460, 228, 340, 20, 'note', { fontSize: 11 }),

  /* ── Frontend · incidents ── */
  n('b_incList', 'IncidentsListPage — list · filters · SLA bars · detail drawer · KB citations', 60, 260, 380, 52, 'seeded', { detail: 'Reads seededIncidents.ts (7 incidents). Deep-link via ?id=INC-1042. One fetch-swap away from a real API.' }),
  n('b_warRoom', 'MajorIncidentPage — war room: clock · roster · sites · comms · action board', 60, 324, 380, 52, 'seeded', { detail: 'Seeded MI-204 (Sharjah cluster). Comms posting is local state; needs SSE/WebSocket + persistence.' }),
  n('b_incWidgets', 'Home widgets — PredictiveSlaCard · EmergingProblemsCard · MoeKpiStrip · LiveStoryTicker · CompassConsoleStrip', 60, 388, 380, 64, 'seeded', { detail: 'All computed from seeds or hardcoded patterns at render time.' }),
  n('b_postmortem', 'IncidentPanel — postmortem timeline (in My Locker · live shape)', 60, 464, 380, 44, 'live', { detail: 'Renders PostmortemTemplateMetadata from locker folders — already API-shaped.' }),

  /* ── Frontend · problems ── */
  n('b_probPage', 'ProblemsPage — list · KPIs · RCA drawer · linked incidents/change', 460, 260, 380, 52, 'seeded', { detail: '8 PROBLEM records inlined in the page file. Status lifecycle: investigating → rca-known → fix-planned → closed.' }),
  n('b_probDash', 'ProblemManagement dashboard instance (RCA throughput · ages)', 460, 324, 380, 44, 'seeded'),

  /* ── Frontend · change ── */
  n('b_chgPage', 'ChangeRiskPage — risk dial + factors + CAB brief', 860, 260, 380, 52, 'seeded'),
  n('b_cab', 'CabCalendarPage — windows + conflict flags', 860, 324, 380, 44, 'seeded'),
  n('b_oncall', 'OnCallPage — rotations', 860, 380, 380, 40, 'seeded'),

  /* ── Frontend · cmdb & citizen ── */
  n('b_assets', 'AssetCatalogPage + CmdbSiteDrawer', 1260, 260, 380, 44, 'seeded'),
  n('b_portal', 'PortalPage — citizen shell · open requests', 1260, 316, 380, 40, 'seeded'),
  n('b_catalog', 'ServiceCatalogPage — request tiles + submit', 1260, 368, 380, 40, 'seeded'),
  n('b_phone', 'PhoneBridgePage — scripted AR/EN call → INC-1037', 1260, 420, 380, 44, 'seeded', { detail: 'Story F demo surface. Whisper/Kokoro shown in UI; no live telephony.' }),

  /* ── Frontend · dashboards & maps ── */
  n('b_dashLib', 'Dashboards library — 10 instances + deep links', 1660, 260, 380, 52, 'seeded', { detail: 'Chart series are inline arrays — can contradict the seeds. Needs metrics aggregation API.' }),
  n('b_wsmap', 'WorkspaceMapPage — react-flow graph · narrated story playback (Kokoro TTS · stories A·B·C·D·F)', 1660, 324, 380, 56, 'demo', { detail: 'The engine this very app imitates. TTS-synced camera walk per story.' }),
  n('b_galaxy', 'GalaxyView — orbital map · planet voiceovers · per-agent voices · SSE pulses', 1660, 392, 380, 56, 'live'),

  /* ── Frontend · AI ops live ── */
  n('b_chat', 'Compass Chat — tool calls · traces · renderers', 2060, 260, 380, 48, 'live'),
  n('b_voice', 'Voice mode — mic → chat (mode=voice) → TTS', 2060, 320, 380, 44, 'live'),
  n('b_know', 'Knowledge Hub — folders · ingest · search', 2060, 376, 380, 44, 'live'),
  n('b_locker', 'My Locker — case vault + templates (postmortem)', 2060, 432, 380, 44, 'live'),

  /* ── Frontend · admin live ── */
  n('b_reports', 'Reports + scheduled reports', 2460, 260, 340, 44, 'live'),
  n('b_settings', 'Settings — trace · connectors · watchlists · voice · governance (◐ policies/replay seeded)', 2460, 316, 340, 56, 'live', { detail: 'Governance kill switch is live UI; SEEDED_POLICIES / SEEDED_DECISIONS are client-side fixtures.' }),
  n('b_usecases', 'Use-case hub + test drawer', 2460, 384, 340, 40, 'live'),
  n('b_briefing', 'Briefing hero (spoken)', 2460, 436, 340, 40, 'live'),

  /* ── Demo stepper ── */
  n('b_beacon', 'StoryModeBeacon — guided demo stepper · 6 stories A–F · URL-driven (?story=A&step=2) · overlays every surface · ⚠ 2 bugs: off-script check + take-me-back URL on query-string steps', 60, 700, 1180, 56, 'demo', { detail: 'StoryModeBeacon.tsx:226 compares pathname to pages that contain query strings; the recovery button double-appends "?".' }),

  /* ── Frontend data layer ── */
  n('d_inc', 'seededIncidents.ts — 7 incidents · API-shaped types', 60, 856, 250, 72, 'seeded'),
  n('d_mi', 'seededMajorIncident.ts — MI-204 war-room state', 335, 856, 250, 72, 'seeded'),
  n('d_xref', 'seededCrossReferences.ts — INC ↔ PRB ↔ CHG lookups', 610, 856, 250, 72, 'seeded'),
  n('d_prob', 'PROBLEMS inline array — 8 records in ProblemsPage.tsx', 885, 856, 250, 72, 'seeded'),
  n('d_chg', 'seededChanges.ts — changes + risk factors', 1160, 856, 250, 72, 'seeded'),
  n('d_assets', 'seededAssets.ts · seededCmdbSites.ts — CIs + school sites', 1435, 856, 250, 72, 'seeded'),
  n('d_portalStore', 'portalTicketsStore.ts — localStorage round-trip', 1710, 856, 250, 72, 'seeded'),
  n('d_dashArr', 'dashboardCatalog.ts + inline chart arrays (can contradict seeds)', 1985, 856, 250, 72, 'seeded'),
  n('d_story', 'storyScript.ts + STORY_PATHS — 6 demo stories · narrations (EN only)', 2260, 856, 250, 72, 'demo'),
  n('d_gov', 'SEEDED_POLICIES · SEEDED_DECISIONS in GovernancePage.tsx', 2535, 856, 250, 72, 'seeded'),

  /* ── API surface ── */
  n('pr_inc', '✗ /api/v1/incidents · /major-incidents', 60, 1062, 380, 56, 'planned'),
  n('pr_prob', '✗ /api/v1/problems · /known-errors', 460, 1062, 380, 56, 'planned'),
  n('pr_chg', '✗ /api/v1/changes · /cab', 860, 1062, 380, 56, 'planned'),
  n('pr_cmdb', '✗ /api/v1/cmdb · /portal · /catalog', 1260, 1062, 380, 56, 'planned'),
  n('liveRoutes', '✓ LIVE — auth · chat · conversations · agent · actions · galaxy (+SSE) · briefing · tts · insights · metrics · watchlist · usecases · connectors · reports · profile · admin · health', 1660, 1062, 1140, 56, 'live'),

  /* ── Backend ── */
  n('m_inc', '✗ modules/incidents — CRUD · SLA · cluster merge · agent tools (classify_incident · merge_tickets)', 60, 1218, 380, 64, 'planned', { detail: 'P1. Mirror frontend types 1:1 in schemas.py — the contract is already frozen in seededIncidents.ts.' }),
  n('m_prob', '✗ modules/problems — known errors · workarounds · promotion from clusters', 460, 1218, 380, 64, 'planned'),
  n('m_chg', '✗ modules/changes — risk scoring · CAB conflicts · approvals wiring', 860, 1218, 380, 64, 'planned'),
  n('m_cmdb', '✗ modules/cmdb — CI model + impact', 1260, 1218, 185, 64, 'planned'),
  n('m_portal', '✗ modules/portal — requests · catalog', 1455, 1218, 185, 64, 'planned'),

  n('s_sla', '✗ SLA engine — windows · breach risk', 60, 1306, 300, 56, 'shared'),
  n('s_links', '✗ cross_links — INC ↔ PRB ↔ CHG ↔ CI', 372, 1306, 300, 56, 'shared'),
  n('s_sse', '✗ SSE hub — war-room comms · activity ticker (generalise galaxy/stream)', 684, 1306, 300, 56, 'shared'),
  n('s_metrics', '✗ Metrics aggregation — MTTR · SLA · volumes (feeds 10 dashboards)', 996, 1306, 300, 56, 'shared'),
  n('s_seeder', '✗ Demo seeder CLI — fixtures → Postgres (INC-1041 story survives the swap)', 1308, 1306, 330, 56, 'shared'),

  n('c_core', '✓ Core — agent & tool orchestration · auth (Entra / LDAP / local JWT) · profile loader · trace capture', 1700, 1218, 540, 64, 'live'),
  n('e_know', '✓ knowledge — RAG', 1700, 1306, 255, 48, 'live'),
  n('e_locker', '✓ locker — case vault', 1965, 1306, 255, 48, 'live'),
  n('e_reports', '✓ reports + scheduled_reports', 2230, 1306, 255, 48, 'live'),
  n('e_sccm', '✓ sccm — devices (mock/Graph)', 2495, 1306, 255, 48, 'live'),
  n('e_user', '✓ user_management (mock/Graph/LDAP)', 1700, 1366, 255, 48, 'live'),
  n('e_exch', '✓ exchange — email channel', 1965, 1366, 255, 48, 'live'),
  n('e_wl', '✓ weblogic — runbooks (mock)', 2230, 1366, 255, 48, 'live'),
  n('e_tmpl', '✓ _template — the pattern to copy', 2495, 1366, 255, 48, 'live', { dashed: true }),

  /* ── Data plane ── */
  n('pg2', 'PostgreSQL 15 (:5493)', 60, 1602, 200, 70, 'infra'),
  n('qd2', 'Qdrant (:6333)', 275, 1602, 200, 70, 'infra'),
  n('minio2', 'MinIO (:9000)', 490, 1602, 200, 70, 'infra'),
  n('tts2', 'TTS — Kokoro / Piper (:8000) EN + AR', 705, 1602, 200, 70, 'ai'),

  /* ── AI plane ── */
  n('ai_llm', 'LLM — llama.cpp qwen3-30b-a3b (Foundry GB10)', 1000, 1600, 270, 56, 'ai'),
  n('ai_ollama', 'Ollama — alternate local provider', 1285, 1600, 270, 56, 'ai'),
  n('ai_azure', 'Azure OpenAI — opt-in frontier', 1570, 1600, 270, 56, 'ai', { dashed: true }),
  n('ai_embed', 'Embeddings — Azure / llama.cpp / mock', 1000, 1672, 270, 56, 'ai'),
  n('ai_voice', 'Voice-mode LLM override', 1285, 1672, 270, 56, 'ai'),
  n('ai_lf', 'Langfuse — LLM observability (optional)', 1570, 1672, 270, 56, 'ai', { dashed: true }),

  /* ── External ── */
  n('x_entra', 'Microsoft Entra ID (OIDC)', 1920, 1600, 280, 56, 'external'),
  n('x_ad', 'Managed AD / Samba (LDAP)', 2215, 1600, 280, 56, 'external'),
  n('x_graph', 'Microsoft Graph (Intune · mail · approvals)', 2510, 1600, 280, 56, 'external'),
  n('x_sp', 'SharePoint (KB sync)', 1920, 1672, 280, 56, 'external'),
  n('x_smtp', 'SMTP (alt email)', 2215, 1672, 280, 56, 'external'),
  n('x_wl', 'Oracle WebLogic (mock today)', 2510, 1672, 280, 56, 'external', { dashed: true }),

  /* ── Build sequence ── */
  n('q1', 'P1 — incidents module (models · CRUD · SLA · drawer wiring)', 60, 1840, 500, 50, 'planned'),
  n('q2', 'P2 — problems + cross_links + cluster promotion', 620, 1840, 500, 50, 'shared'),
  n('q3', 'P3 — changes: risk scoring + CAB conflicts + approvals', 1180, 1840, 500, 50, 'shared'),
  n('q4', 'P4 — portal/catalog round-trip + notifications', 1740, 1840, 500, 50, 'live', { dashed: true }),
  n('q5', 'P5 — realtime: war-room SSE + activity stream + metrics', 2300, 1840, 500, 50, 'live', { dashed: true }),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const MASTER_EDGES: ArchEdgeDef[] = [
  /* Actors */
  e('ea1', 'aOp', 'b_incList', 'neutral'),
  e('ea2', 'aCit', 'b_portal', 'neutral'),
  e('ea3', 'aPres', 'b_beacon', 'neutral', 'drives'),
  e('ea4', 'aPhone', 'b_phone', 'neutral'),
  e('ea5', 'aMail', 'b_chat', 'neutral', 'tickets via mail'),

  /* Seeded data flows (fixtures up into surfaces) */
  e('es1', 'd_inc', 'b_incList', 'seeded', undefined, 't', 'b'),
  e('es2', 'd_inc', 'b_incWidgets', 'seeded', undefined, 't', 'b'),
  e('es3', 'd_inc', 'b_wsmap', 'seeded', 'counts', 't', 'b'),
  e('es4', 'd_mi', 'b_warRoom', 'seeded', undefined, 't', 'b'),
  e('es5', 'd_xref', 'b_incList', 'seeded', 'links drawers', 't', 'b'),
  e('es6', 'd_xref', 'b_probPage', 'seeded', undefined, 't', 'b'),
  e('es7', 'd_prob', 'b_probPage', 'seeded', undefined, 't', 'b'),
  e('es8', 'd_chg', 'b_chgPage', 'seeded', undefined, 't', 'b'),
  e('es9', 'd_chg', 'b_cab', 'seeded', undefined, 't', 'b'),
  e('es10', 'd_assets', 'b_assets', 'seeded', undefined, 't', 'b'),
  e('es11', 'd_portalStore', 'b_portal', 'seeded', undefined, 't', 'b'),
  e('es12', 'd_portalStore', 'b_catalog', 'seeded', undefined, 't', 'b'),
  e('es13', 'd_dashArr', 'b_dashLib', 'seeded', undefined, 't', 'b'),
  e('es14', 'd_story', 'b_beacon', 'seeded', '6 stories', 't', 'b'),
  e('es15', 'd_story', 'b_wsmap', 'seeded', 'narrations', 't', 'b'),
  e('es16', 'd_gov', 'b_settings', 'seeded', undefined, 't', 'b'),
  e('es17', 'zFD', 's_seeder', 'seeded', 'all fixtures migrate via seeder'),

  /* Live flows */
  e('el1', 'b_chat', 'liveRoutes', 'live', 'chat · agent · trace'),
  e('el2', 'b_voice', 'liveRoutes', 'live', 'chat (mode=voice) + tts'),
  e('el3', 'b_know', 'liveRoutes', 'live', 'knowledge APIs'),
  e('el4', 'b_locker', 'liveRoutes', 'live', 'locker APIs'),
  e('el5', 'b_galaxy', 'liveRoutes', 'live', 'galaxy + SSE + tts (voiceovers)'),
  e('el6', 'b_wsmap', 'liveRoutes', 'live', 'tts/synthesize (narration)', 'r', 't'),
  e('el7', 'b_settings', 'liveRoutes', 'live', 'reports · settings · usecases'),
  e('el7b', 'b_reports', 'liveRoutes', 'live'),
  e('el8', 'liveRoutes', 'c_core', 'live', 'dispatch'),
  e('el9', 'liveRoutes', 'tts2', 'live', 'synthesize'),
  e('el10', 'c_core', 'ai_llm', 'live', 'completions'),
  e('el11', 'c_core', 'pg2', 'live', 'state'),
  e('el12', 'e_know', 'qd2', 'live', 'vectors'),
  e('el13', 'e_know', 'ai_embed', 'live', 'embed'),
  e('el14', 'e_reports', 'minio2', 'live', 'artifacts'),
  e('el15', 'c_core', 'ai_lf', 'live', 'traces'),
  e('el16', 'c_core', 'x_entra', 'live', 'OIDC / LDAP', 'r', 't'),
  e('el16b', 'e_user', 'x_ad', 'live', 'LDAP'),
  e('el17', 'e_sccm', 'x_graph', 'live', 'devices · mail'),
  e('el18', 'e_know', 'x_sp', 'live', 'KB sync'),
  e('el19', 'e_wl', 'x_wl', 'live', 'WLST / REST'),

  /* Planned wiring */
  e('ep1', 'b_incList', 'pr_inc', 'planned', 'to build', 'l', 't'),
  e('ep2', 'b_warRoom', 'pr_inc', 'planned', '+ SSE comms', 'l', 't'),
  e('ep3', 'b_probPage', 'pr_prob', 'planned', undefined, 'l', 't'),
  e('ep4', 'b_chgPage', 'pr_chg', 'planned', undefined, 'l', 't'),
  e('ep4b', 'b_cab', 'pr_chg', 'planned', undefined, 'l', 't'),
  e('ep5', 'b_portal', 'pr_cmdb', 'planned', undefined, 'l', 't'),
  e('ep5b', 'b_catalog', 'pr_cmdb', 'planned', undefined, 'l', 't'),
  e('ep5c', 'b_assets', 'pr_cmdb', 'planned', undefined, 'l', 't'),
  e('ep6', 'b_dashLib', 's_metrics', 'planned', 'agg API', 'l', 't'),
  e('ep7', 'pr_inc', 'm_inc', 'planned'),
  e('ep8', 'pr_prob', 'm_prob', 'planned'),
  e('ep9', 'pr_chg', 'm_chg', 'planned'),
  e('ep10', 'pr_cmdb', 'm_cmdb', 'planned'),
  e('ep11', 'pr_cmdb', 'm_portal', 'planned'),
  e('ep12', 'm_inc', 's_sla', 'planned'),
  e('ep13', 'm_inc', 's_links', 'planned'),
  e('ep14', 'm_prob', 's_links', 'planned'),
  e('ep15', 'm_inc', 's_sse', 'planned'),
  e('ep16', 'm_chg', 's_links', 'planned'),
  e('ep17', 'm_inc', 'pg2', 'planned', 'persist (Alembic)'),
  e('ep18', 's_seeder', 'pg2', 'planned', 'load fixtures'),
  e('ep19', 'm_portal', 'e_exch', 'planned', 'notifications', 'r', 'l'),
  e('ep20', 'm_inc', 'c_core', 'planned', 'agent tools', 'r', 'l'),

  /* Build sequence */
  e('eq1', 'q1', 'q2', 'neutral', undefined, 'r', 'l'),
  e('eq2', 'q2', 'q3', 'neutral', undefined, 'r', 'l'),
  e('eq3', 'q3', 'q4', 'neutral', undefined, 'r', 'l'),
  e('eq4', 'q4', 'q5', 'neutral', undefined, 'r', 'l'),
];
