/**
 * Deployment / runtime topology — the docker-compose stack and the
 * sovereign (air-gappable) boundary. Rendered by the generic ArchFlow.
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from '../../model/types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const DEPLOY_NODES: ArchNodeDef[] = [
  /* Actors / clients */
  n('dpUser', 'Browser · Operator + Citizen', 360, 70, 300, 40, 'actor'),

  /* Sovereign boundary */
  n('dpBoundary', 'Sovereign boundary — Foundry GB10 (128 GB) · air-gappable · NESA / TDRA / ISO 27001', 60, 150, 1000, 470, 'infra', { zone: true }),

  /* Edge / app tier */
  n('dpFrontend', 'frontend — React + Vite\n(:3847)', 100, 210, 240, 70, 'infra'),
  n('dpBackend', 'backend — FastAPI / uvicorn\n(:8421) · CUSTOMER_PROFILE', 380, 210, 280, 70, 'infra'),
  n('dpTts', 'tts — Kokoro / Piper\n(:8000)', 720, 210, 240, 70, 'ai'),

  /* Data tier */
  n('dpPg', 'db — PostgreSQL 15\n(:5493 → 5432)', 100, 330, 240, 70, 'infra'),
  n('dpQdrant', 'qdrant — vectors\n(:6333 / :6334)', 380, 330, 240, 70, 'infra'),
  n('dpMinio', 'minio — object store\n(:9000 / :9001)', 660, 330, 240, 70, 'infra'),

  /* Model tier */
  n('dpLlm', 'llama.cpp — qwen3-30b-a3b\n(/v1, local)', 100, 450, 280, 70, 'ai'),
  n('dpOllama', 'ollama — alt local provider\n(:11434)', 420, 450, 260, 70, 'ai', { dashed: true }),
  n('dpNet', 'itsm-network (bridge) · volumes: postgres_data · qdrant_data · minio_data', 100, 545, 860, 40, 'note'),

  /* Outside the boundary */
  n('dpExtZone', 'Outside the boundary — opt-in / enterprise', 1100, 150, 520, 470, 'external', { zone: true }),
  n('dpEntra', 'Microsoft Entra ID (OIDC)', 1130, 200, 220, 48, 'external'),
  n('dpGraph', 'Microsoft Graph (Intune · mail)', 1370, 200, 220, 48, 'external'),
  n('dpSp', 'SharePoint (KB sync)', 1130, 268, 220, 48, 'external'),
  n('dpSmtp', 'SMTP relay', 1370, 268, 220, 48, 'external'),
  n('dpAzure', 'Azure OpenAI (frontier opt-in)', 1130, 336, 220, 48, 'external', { dashed: true }),
  n('dpLangfuse', 'Langfuse (host :13000, optional)', 1370, 336, 220, 48, 'external', { dashed: true }),
  n('dpWl', 'Oracle WebLogic (runbook target)', 1130, 404, 460, 48, 'external', { dashed: true }),
  n('dpNote', 'Default LLM_PROVIDER routes to the local box; frontier models are opt-in only.', 1130, 470, 460, 60, 'note'),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const DEPLOY_EDGES: ArchEdgeDef[] = [
  e('de_user_fe', 'dpUser', 'dpFrontend', 'live', 'HTTPS', 'b', 't'),
  e('de_fe_be', 'dpFrontend', 'dpBackend', 'live', 'REST / SSE', 'r', 'l'),
  e('de_be_tts', 'dpBackend', 'dpTts', 'live', '/v1', 'r', 'l'),
  e('de_be_pg', 'dpBackend', 'dpPg', 'live', 'asyncpg', 'b', 't'),
  e('de_be_qdrant', 'dpBackend', 'dpQdrant', 'live', 'gRPC', 'b', 't'),
  e('de_be_minio', 'dpBackend', 'dpMinio', 'live', 'S3', 'b', 't'),
  e('de_be_llm', 'dpBackend', 'dpLlm', 'live', 'completions', 'l', 't'),
  e('de_be_ollama', 'dpBackend', 'dpOllama', 'planned', 'optional', 'b', 't'),
  e('de_be_entra', 'dpBackend', 'dpEntra', 'live', 'OIDC', 'r', 'l'),
  e('de_be_graph', 'dpBackend', 'dpGraph', 'live', 'Graph API', 'r', 'l'),
  e('de_be_sp', 'dpBackend', 'dpSp', 'live', 'sync', 'r', 'l'),
  e('de_be_azure', 'dpBackend', 'dpAzure', 'planned', 'opt-in', 'r', 'l'),
  e('de_be_langfuse', 'dpBackend', 'dpLangfuse', 'planned', 'traces', 'r', 'l'),
];
