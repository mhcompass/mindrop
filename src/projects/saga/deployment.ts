/**
 * Deployment / runtime topology — the Saga Docker Compose stack (web · api ·
 * worker · postgres · redis · storage) behind a Tailscale Serve sidecar
 * (private tailnet HTTPS), with the heavy AI models on a separate host.
 * Rendered by the generic ArchFlow.
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from '../../model/types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const DEPLOY_NODES: ArchNodeDef[] = [
  n('user', 'Browser · any tailnet device', 80, 70, 240, 40, 'actor'),
  n('ext', 'Chrome Extension · recorder', 360, 70, 240, 40, 'actor'),

  n('boundary', 'Saga stack — Docker Compose (spark) · Tailscale Serve (private tailnet)', 40, 140, 940, 430, 'infra', { zone: true }),

  n('ts', 'tailscale — Serve :443 (MagicDNS)\nsaga.<tailnet>.ts.net', 80, 200, 280, 70, 'infra'),
  n('web', 'web — nginx (:47173)\nsingle-origin gateway', 80, 300, 280, 64, 'infra'),
  n('api', 'api — FastAPI / uvicorn\n(:47800) · routers + WS', 420, 250, 280, 70, 'infra'),
  n('worker', 'worker — ARQ\nFFmpeg render pipeline', 420, 360, 280, 64, 'infra'),
  n('pg', 'postgres:16\n(:47432)', 740, 250, 220, 64, 'infra'),
  n('redis', 'redis:7\n(:47379) · ARQ + pub/sub', 740, 340, 220, 64, 'infra'),
  n('storage', 'storage_data / MinIO (opt)\nvideos · frames · audio', 740, 430, 220, 60, 'infra'),
  n('net', 'compose network: saga · volumes: postgres_data · redis_data · storage_data · models_data', 80, 530, 880, 30, 'note'),

  n('aiZone', 'AI host — separate box (GPU)', 1020, 140, 360, 230, 'external', { zone: true }),
  n('ollama', 'LLM — Qwen3-30B / LLaVA\n(ollama|openai · :11434)', 1050, 200, 300, 56, 'external'),
  n('kokoro', 'Kokoro TTS — FastAPI\n(:8000)', 1050, 270, 300, 56, 'external'),
  n('aiNote', 'Whisper runs in-process (faster-whisper); LLM + advanced TTS are remote.', 1050, 332, 300, 30, 'note'),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const DEPLOY_EDGES: ArchEdgeDef[] = [
  e('s_user_ts', 'user', 'ts', 'live', 'HTTPS (tailnet)', 'b', 't'),
  e('s_ts_web', 'ts', 'web', 'live', 'proxy :443 → :80', 'b', 't'),
  e('s_web_api', 'web', 'api', 'live', 'REST / WS', 'r', 'l'),
  e('s_ext_api', 'ext', 'api', 'live', 'upload', 'b', 't'),
  e('s_api_pg', 'api', 'pg', 'live', 'asyncpg', 'r', 'l'),
  e('s_api_redis', 'api', 'redis', 'live', 'ARQ enqueue', 'r', 'l'),
  e('s_worker_redis', 'worker', 'redis', 'live', 'ARQ consume', 'r', 'l'),
  e('s_worker_ollama', 'worker', 'ollama', 'live', 'LLM / vision', 'r', 'l'),
  e('s_worker_kokoro', 'worker', 'kokoro', 'live', 'TTS', 'r', 'l'),
  e('s_api_storage', 'api', 'storage', 'live', 'media files', 'r', 'l'),
];
