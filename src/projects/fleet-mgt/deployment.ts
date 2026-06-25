/**
 * Deployment / runtime topology — the on-prem appliance (Postgres + Redis from
 * docker-compose today; gateway/core/dashboard + local models on the pilot box)
 * inside a sovereign, air-gappable boundary. WhatsApp Cloud API is the only
 * external egress. Rendered by the generic ArchFlow.
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from '../../model/types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const DEPLOY_NODES: ArchNodeDef[] = [
  n('waUser', 'WhatsApp · Staff requester', 80, 70, 260, 40, 'actor'),
  n('staffUser', 'Browser · Operator + Fleet manager', 740, 70, 280, 40, 'actor'),

  n('boundary', 'Sovereign boundary — on-prem appliance / k3s · air-gappable · NESA / ISO 27001', 40, 140, 1000, 450, 'infra', { zone: true }),

  n('gateway', 'whatsapp-gateway — FastAPI\n(:8001) · DMZ', 80, 200, 260, 70, 'infra'),
  n('core', 'core-api — FastAPI / uvicorn\n(:8000) · agent + booking', 400, 200, 280, 70, 'infra'),
  n('dash', 'dashboard — React + Vite\n(:5173)', 740, 200, 280, 70, 'infra'),

  n('pg', 'fleet_db — PostgreSQL 16\n(:5433 → 5432)', 80, 320, 260, 70, 'infra'),
  n('redis', 'fleet_redis — Redis 7\n(:6380 → 6379, AOF)', 400, 320, 260, 70, 'infra'),

  n('llm', 'llama.cpp — Qwen3 (/v1, local)', 80, 440, 280, 70, 'ai'),
  n('vlm', 'Qwen2.5-VL — license OCR', 400, 440, 280, 70, 'ai'),
  n('net', 'compose network · volumes: fleet_pgdata · fleet_redisdata', 80, 540, 900, 34, 'note'),

  n('extZone', 'Outside the boundary — egress only', 1080, 140, 300, 200, 'external', { zone: true }),
  n('meta', 'Meta WhatsApp Cloud API', 1110, 200, 240, 48, 'external'),
  n('extNote', 'Pilot uses a Meta test number; production swaps a UAE business number + long-lived token.', 1110, 262, 240, 64, 'note'),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const DEPLOY_EDGES: ArchEdgeDef[] = [
  e('d_wa_gw', 'waUser', 'gateway', 'live', 'WhatsApp', 'b', 't'),
  e('d_gw_meta', 'gateway', 'meta', 'live', 'Cloud API (egress)', 'r', 'l'),
  e('d_gw_core', 'gateway', 'core', 'live', 'internal (mTLS)', 'r', 'l'),
  e('d_staff_dash', 'staffUser', 'dash', 'live', 'HTTPS', 'b', 't'),
  e('d_dash_core', 'dash', 'core', 'live', 'REST / SSE', 'l', 'r'),
  e('d_core_pg', 'core', 'pg', 'live', 'asyncpg', 'b', 't'),
  e('d_core_redis', 'core', 'redis', 'live', 'sessions', 'b', 't'),
  e('d_core_llm', 'core', 'llm', 'live', 'completions', 'l', 't'),
  e('d_core_vlm', 'core', 'vlm', 'live', 'OCR', 'b', 't'),
];
