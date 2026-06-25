/**
 * System Posture — end-to-end architecture of Flexible Fleet, laid out by tier:
 * channels → app (gateway + dashboard) → core (agent + booking) → engines →
 * data → models, with the WhatsApp Cloud API as the only external dependency.
 * Colours track readiness (live / partial-seeded). Rendered by ArchFlow.
 */
import type { ArchNodeDef, ArchEdgeDef, Status } from '../../model/types';

function n(id: string, label: string, x: number, y: number, w: number, h: number, status: Status, extra?: Partial<ArchNodeDef>): ArchNodeDef {
  return { id, label, x, y, w, h, status, ...extra };
}

export const POSTURE_NODES: ArchNodeDef[] = [
  n('p_wa', 'WhatsApp · staff requester', 120, 60, 260, 46, 'actor'),
  n('p_staff', 'Browser · operator + fleet manager', 560, 60, 320, 46, 'actor'),

  n('p_gw', 'WhatsApp Gateway — FastAPI (DMZ)', 120, 160, 260, 58, 'live'),
  n('p_dash', 'Staff Dashboard — React (override UI in progress)', 560, 160, 320, 58, 'seeded'),
  n('p_meta', 'Meta WhatsApp Cloud API', 960, 160, 260, 58, 'external'),

  n('p_core', 'Core API — agent orchestrator + booking engine (/api/v1)', 120, 270, 760, 58, 'live'),
  n('p_lic', 'License Verification — VLM OCR gate', 960, 270, 260, 58, 'live'),

  n('p_zone', 'Booking domain', 120, 360, 760, 116, 'infra', { zone: true }),
  n('p_book', 'Booking Engine', 145, 400, 175, 48, 'live'),
  n('p_avail', 'Availability', 335, 400, 150, 48, 'live'),
  n('p_neg', 'Negotiation', 500, 400, 150, 48, 'live'),
  n('p_drv', 'Driver Alloc', 665, 400, 190, 48, 'live'),

  n('p_pg', 'PostgreSQL 16 — bookings · GiST no-overlap', 120, 510, 360, 52, 'infra'),
  n('p_redis', 'Redis 7 — sessions', 510, 510, 230, 52, 'infra'),
  n('p_llm', 'Qwen3 LLM (local)', 770, 510, 200, 52, 'ai'),
  n('p_vlm', 'Qwen2.5-VL — OCR', 1000, 360, 220, 52, 'ai'),
];

function e(id: string, source: string, target: string, kind: ArchEdgeDef['kind'], label?: string, sh?: ArchEdgeDef['sh'], th?: ArchEdgeDef['th']): ArchEdgeDef {
  return { id, source, target, kind, label, sh, th };
}

export const POSTURE_EDGES: ArchEdgeDef[] = [
  e('pe_wa_gw', 'p_wa', 'p_gw', 'live', 'WhatsApp'),
  e('pe_staff_dash', 'p_staff', 'p_dash', 'live', 'HTTPS'),
  e('pe_gw_meta', 'p_gw', 'p_meta', 'live', 'Cloud API', 'r', 'l'),
  e('pe_gw_core', 'p_gw', 'p_core', 'live', 'internal'),
  e('pe_dash_core', 'p_dash', 'p_core', 'live', 'REST / SSE'),
  e('pe_core_lic', 'p_core', 'p_lic', 'live', 'verify', 'r', 'l'),
  e('pe_lic_vlm', 'p_lic', 'p_vlm', 'live', 'OCR', 'b', 't'),
  e('pe_core_zone', 'p_core', 'p_zone', 'live', 'tool calls'),
  e('pe_book_pg', 'p_book', 'p_pg', 'live', 'atomic write'),
  e('pe_avail_pg', 'p_avail', 'p_pg', 'live'),
  e('pe_core_redis', 'p_core', 'p_redis', 'live', 'sessions'),
  e('pe_core_llm', 'p_core', 'p_llm', 'live', 'chat + tools'),
];
