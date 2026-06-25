/**
 * System Posture — end-to-end architecture of Saga, laid out by tier:
 * clients → gateway (Tailscale + nginx) → API → queue → workers → AI/video,
 * over Postgres/Redis/storage, with the heavy models on a remote host.
 * Rendered by ArchFlow.
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from '../../model/types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const POSTURE_NODES: ArchNodeDef[] = [
  n('p_user', 'Browser · any tailnet device', 120, 60, 260, 46, 'actor'),
  n('p_ext', 'Chrome Extension · recorder', 420, 60, 260, 46, 'actor'),

  n('p_web', 'web — nginx single-origin gateway', 120, 160, 560, 54, 'live'),
  n('p_api', 'api — FastAPI · routers + WebSocket (:47800)', 120, 250, 560, 54, 'live'),

  n('p_queue', 'ARQ queue (Redis-backed)', 120, 340, 560, 48, 'live'),

  n('p_zone', 'Worker pipeline', 120, 410, 760, 116, 'infra', { zone: true }),
  n('p_w_trans', 'Transcribe', 145, 450, 150, 48, 'live'),
  n('p_w_enh', 'Enhance', 310, 450, 140, 48, 'live'),
  n('p_w_tts', 'Voiceover', 465, 450, 150, 48, 'live'),
  n('p_w_render', 'Render (FFmpeg)', 630, 450, 230, 48, 'live'),

  n('p_pg', 'PostgreSQL 16', 120, 560, 240, 50, 'infra'),
  n('p_redis', 'Redis 7 — queue · pub/sub', 380, 560, 280, 50, 'infra'),
  n('p_store', 'Storage — FS / MinIO', 680, 560, 200, 50, 'infra'),

  n('p_aiZone', 'AI host (remote, GPU)', 960, 250, 280, 180, 'external', { zone: true }),
  n('p_whisper', 'Whisper (in-process)', 985, 300, 230, 48, 'ai'),
  n('p_ollama', 'Ollama — Llama3.1 / LLaVA', 985, 356, 230, 30, 'external'),
  n('p_kokoro', 'Kokoro TTS', 985, 392, 230, 30, 'external'),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const POSTURE_EDGES: ArchEdgeDef[] = [
  e('pe_user_web', 'p_user', 'p_web', 'live', 'HTTPS (tailnet)'),
  e('pe_ext_api', 'p_ext', 'p_api', 'live', 'upload'),
  e('pe_web_api', 'p_web', 'p_api', 'live', 'REST / WS'),
  e('pe_api_queue', 'p_api', 'p_queue', 'live', 'enqueue'),
  e('pe_queue_zone', 'p_queue', 'p_zone', 'live', 'dispatch jobs'),
  e('pe_api_pg', 'p_api', 'p_pg', 'live', 'SQLAlchemy', 'l', 't'),
  e('pe_api_redis', 'p_api', 'p_redis', 'live'),
  e('pe_render_store', 'p_w_render', 'p_store', 'live', 'save render'),
  e('pe_trans_whisper', 'p_w_trans', 'p_whisper', 'live', 'STT', 'r', 'l'),
  e('pe_enh_ollama', 'p_w_enh', 'p_ollama', 'live', 'LLM', 'r', 'l'),
  e('pe_tts_kokoro', 'p_w_tts', 'p_kokoro', 'live', 'TTS', 'r', 'l'),
];
