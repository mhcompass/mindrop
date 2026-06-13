/**
 * System Posture — high-level end-system view.
 * Transcribed from draw.io page 1 "System Posture".
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from './types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const POSTURE_NODES: ArchNodeDef[] = [
  /* Actors */
  n('actorOp', 'Operator — ICT service desk', 160, 84, 200, 36, 'actor'),
  n('actorCit', 'Citizen — teacher / principal', 440, 84, 200, 36, 'actor'),
  n('actorPres', 'Presenter — guided demo', 720, 84, 200, 36, 'actor'),

  /* Frontend zone + sub-zones */
  n('fe', 'React Frontend — SPA · Vite (:3847) · i18n EN/AR · MSAL or local JWT', 40, 170, 1620, 372, 'infra', { zone: true }),
  n('feOps', 'ITSM operator surfaces — UI-only (seeded fixtures in src/data)', 60, 206, 780, 152, 'seeded', { zone: true }),
  n('feCitizen', 'Citizen surfaces — UI-only', 60, 374, 400, 148, 'seeded', { zone: true }),
  n('feDemo', 'Demo & presenter layer', 480, 374, 360, 148, 'demo', { zone: true }),
  n('feLive', 'API-backed surfaces — live today', 860, 206, 780, 316, 'live', { zone: true }),

  /* Operator surfaces */
  n('feInc', 'Incidents list + drawer', 74, 236, 180, 36, 'seeded'),
  n('feWar', 'Major-incident war room', 262, 236, 180, 36, 'seeded'),
  n('feProb', 'Problems / RCA', 450, 236, 180, 36, 'seeded'),
  n('feChg', 'Change + risk scoring', 638, 236, 180, 36, 'seeded'),
  n('feCab', 'CAB calendar', 74, 284, 180, 36, 'seeded'),
  n('feOnCall', 'On-call rotation', 262, 284, 180, 36, 'seeded'),
  n('feAssets', 'Assets / CMDB sites', 450, 284, 180, 36, 'seeded'),
  n('feDash', 'Dashboard library (×10)', 638, 284, 180, 36, 'seeded'),

  /* Citizen surfaces */
  n('fePortal', 'School portal', 74, 404, 180, 36, 'seeded'),
  n('feCatalog', 'Service catalog', 266, 404, 180, 36, 'seeded'),
  n('fePhone', 'Phone bridge (AR/EN demo)', 74, 452, 180, 36, 'seeded'),
  n('feTickets', 'Portal tickets (localStorage)', 266, 452, 180, 36, 'seeded'),

  /* Demo layer */
  n('feStory', 'Story Mode stepper — 6 stories A–F (URL-driven beacon)', 496, 402, 328, 32, 'demo'),
  n('feMap', 'Workspace Map — narrated playback (react-flow + TTS)', 496, 440, 328, 32, 'demo'),
  n('feVoiceover', 'Galaxy voiceovers · live tickers · briefing readout', 496, 478, 328, 32, 'demo'),

  /* Live surfaces */
  n('feChat', 'Compass chat + tool calls', 874, 236, 180, 36, 'live'),
  n('feConv', 'Conversations history', 1062, 236, 180, 36, 'live'),
  n('feGalaxy', 'Galaxy view (REST + SSE)', 1250, 236, 180, 36, 'live'),
  n('feLocker', 'My Locker (case vault)', 1438, 236, 180, 36, 'live'),
  n('feKnow', 'Knowledge hub (RAG)', 874, 284, 180, 36, 'live'),
  n('feReports', 'Reports + scheduled', 1062, 284, 180, 36, 'live'),
  n('feUsecases', 'Use-case hub + tests', 1250, 284, 180, 36, 'live'),
  n('feBriefing', 'Briefing hero (spoken)', 1438, 284, 180, 36, 'live'),
  n('feWatch', 'Watchlists + insights', 874, 332, 180, 36, 'live'),
  n('feConn', 'Connectors admin', 1062, 332, 180, 36, 'live'),
  n('feTrace', 'Trace / LLM observability', 1250, 332, 180, 36, 'live'),
  n('feVoiceCfg', 'Voice settings (TTS config)', 1438, 332, 180, 36, 'live'),
  n('feGov', 'Governance · kill switch · replay', 874, 380, 180, 36, 'live'),
  n('feAgents', 'Agents + landscape', 1062, 380, 180, 36, 'live'),
  n('feAudit', 'Audit log', 1250, 380, 180, 36, 'live'),
  n('feApprov', 'Approvals', 1438, 380, 180, 36, 'live'),
  n('feVoiceMode', 'Voice mode — mic → chat (mode=voice) → TTS · per-agent voices', 874, 428, 368, 36, 'live'),
  n('feFeature', 'Feature matrix · profile-aware nav (CUSTOMER_PROFILE)', 1250, 428, 368, 36, 'live'),

  /* Backend */
  n('be', 'FastAPI Backend (:8421) — profile-driven module loader · CUSTOMER_PROFILE=moe', 40, 630, 1060, 330, 'infra', { zone: true }),
  n('beRoutes', 'API routes — /api/v1: auth · chat · conversations · agent · actions · galaxy (REST + SSE) · briefing · tts · insights · metrics · watchlist · usecases · connectors · reports · profile · admin · health', 60, 668, 500, 110, 'infra'),
  n('beCore', 'Core — agent & tool orchestration · auth (Entra OIDC / LDAP / local JWT) · profile loader · trace capture · email + approval flows', 580, 668, 500, 110, 'infra'),
  n('beModules', 'Profile-loaded modules (backend/app/modules)', 60, 796, 1020, 144, 'infra', { zone: true }),
  n('beKnow', 'knowledge — RAG ingest + search', 76, 826, 235, 40, 'live'),
  n('beLocker', 'locker — case vault folders', 327, 826, 235, 40, 'live'),
  n('beReports', 'reports + scheduled_reports', 578, 826, 235, 40, 'live'),
  n('beSccm', 'sccm — device mgmt (mock / Graph)', 829, 826, 235, 40, 'live'),
  n('beUserMgmt', 'user_management (mock/Graph/LDAP)', 76, 880, 235, 40, 'live'),
  n('beExchange', 'exchange — email channel', 327, 880, 235, 40, 'live'),
  n('beWeblogic', 'weblogic — runbooks (mock today)', 578, 880, 235, 40, 'live'),
  n('beItsm', 'TO BUILD: incidents · problems · change · CMDB · portal modules', 829, 880, 235, 40, 'planned'),

  /* Data plane */
  n('dataZone', 'Data & media plane — docker compose · air-gappable', 1140, 630, 520, 330, 'infra', { zone: true }),
  n('pg', 'PostgreSQL 15 (:5493) · Alembic', 1166, 676, 220, 80, 'infra'),
  n('qdrant', 'Qdrant vector DB (:6333 / :6334)', 1414, 676, 220, 80, 'infra'),
  n('minio', 'MinIO object storage (:9000 / :9001) — report artifacts', 1166, 780, 220, 84, 'infra'),
  n('tts', 'TTS (:8000) — Kokoro shim · Piper fallback · EN + AR · per-agent voice_id', 1414, 780, 220, 84, 'ai'),
  n('dataNote', 'All state stays inside the boundary — sovereign / on-prem deployable (Foundry box)', 1166, 884, 470, 40, 'note'),

  /* AI plane */
  n('ai', 'AI plane — local-first, frontier opt-in', 40, 1040, 800, 200, 'ai', { zone: true }),
  n('llm', 'LLM — llama.cpp /v1 · qwen3-30b-a3b on Foundry GB10 (128 GB)', 60, 1080, 240, 50, 'ai'),
  n('ollama', 'Ollama — alternate local provider', 316, 1080, 240, 50, 'ai'),
  n('azureai', 'Azure OpenAI — opt-in frontier model', 572, 1080, 240, 50, 'ai', { dashed: true }),
  n('embed', 'Embeddings — Azure / llama.cpp / mock', 60, 1146, 240, 50, 'ai'),
  n('voicellm', 'Voice-mode LLM override (OPENAI_BASE_URL_VOICE)', 316, 1146, 240, 50, 'ai'),
  n('langfuse', 'Langfuse — LLM observability (host :13000, optional)', 572, 1146, 240, 50, 'ai', { dashed: true }),

  /* External */
  n('ext', 'External integrations — enterprise boundary', 880, 1040, 780, 200, 'external', { zone: true }),
  n('entra', 'Microsoft Entra ID (user auth, OIDC)', 900, 1080, 235, 50, 'external'),
  n('ad', 'Managed AD / Samba DC (LDAP auth + user mgmt)', 1151, 1080, 235, 50, 'external'),
  n('graph', 'Microsoft Graph (Intune · mail · approvals)', 1402, 1080, 235, 50, 'external'),
  n('sharepoint', 'SharePoint (knowledge-base sync)', 900, 1146, 235, 50, 'external'),
  n('smtp', 'SMTP (alt email provider)', 1151, 1146, 235, 50, 'external'),
  n('weblogicExt', 'Oracle WebLogic (WEBLOGIC_MOCK=true today)', 1402, 1146, 235, 50, 'external', { dashed: true }),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const POSTURE_EDGES: ArchEdgeDef[] = [
  e('eOp', 'actorOp', 'fe', 'neutral'),
  e('eCit', 'actorCit', 'fe', 'neutral'),
  e('ePres', 'actorPres', 'fe', 'neutral'),
  e('eLive', 'feLive', 'be', 'live', 'REST /api/v1 · JWT · SSE · TTS audio'),
  e('ePlan1', 'feOps', 'be', 'planned', 'to build — incidents · problems · change · CMDB APIs'),
  e('ePlan2', 'feCitizen', 'be', 'planned', 'to build — portal · catalog · telephony APIs'),
  e('eDb', 'be', 'pg', 'live', 'asyncpg', 'r', 'l'),
  e('eQd', 'be', 'qdrant', 'live', 'RAG search', 'r', 'l'),
  e('eMinio', 'be', 'minio', 'live', 'report artifacts', 'r', 'l'),
  e('eTts', 'be', 'tts', 'live', 'POST /tts/synthesize', 'r', 'l'),
  e('eAi', 'be', 'ai', 'live', 'chat completions · embeddings · traces'),
  e('eExt', 'be', 'ext', 'live', 'OIDC · LDAP · Graph · SMTP · WLST'),
];
