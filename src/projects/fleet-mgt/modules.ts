/**
 * Module Tracker — flat inventory of every Flexible Fleet module with its
 * implementation status. Flip `ui` / `api` between 'none' → 'partial' → 'done'
 * as work ships; tiles, pills and counts update everywhere. Backend-only
 * services carry the same value in both columns (no separate FE surface).
 *
 * Source: /Users/mherhakobyan/Projects/your-compass/products/fleet_mgt
 */
import type { ArchNodeDef, ModuleTileDef, ModuleEdgeDef, PlacedTile, ModuleStatus } from '../../model/types';
import { moduleStatus } from '../../model/types';

function m(id: string, name: string, ui: ModuleTileDef['ui'], api: ModuleTileDef['api'], note?: string, meta?: Partial<ModuleTileDef>): ModuleTileDef {
  return { id, name, ui, api, note, ...meta };
}

interface Section { title: string; mods: ModuleTileDef[] }

const SECTIONS: Section[] = [
  {
    title: 'BOOKING & ALLOCATION',
    mods: [
      m('booking-engine', 'Booking Engine', 'done', 'done', 'lifecycle state machine · transactional assignment (SELECT FOR UPDATE)', { owner: 'Core', effort: 'L', critical: true }),
      m('availability', 'Availability Engine', 'done', 'done', 'real-time vehicle availability · GiST time-window no-overlap', { owner: 'Core', effort: 'M', critical: true }),
      m('driver-alloc', 'Driver Allocation', 'done', 'done', 'assign drivers from pool · with/without-driver bookings', { owner: 'Core', effort: 'M' }),
      m('negotiation', 'Negotiation / Allocation', 'done', 'done', 'best-enabler options · alt category · date shift · priority + bump', { owner: 'Core', effort: 'L' }),
      m('reminder-sched', 'Reminder Scheduler', 'done', 'done', 'background loop · 1h-before + confirmation sends', { owner: 'Core', effort: 'S' }),
    ],
  },
  {
    title: 'CONVERSATION & WHATSAPP',
    mods: [
      m('gateway-wa', 'WhatsApp Gateway', 'done', 'done', 'Meta webhook in/out · signature verify · media download · templates', { owner: 'Gateway', effort: 'M', channel: true, sensitivity: 'pii' }),
      m('agent-orch', 'Agent Orchestrator', 'done', 'done', 'Claude tool-calling loop · slot-filling · Arabic/Emirati NLU', { owner: 'AI', effort: 'L', critical: true }),
      m('license-verify', 'License Verification', 'done', 'done', 'image → VLM OCR → classify (valid/expired/unclear/review)', { owner: 'AI', effort: 'M', sensitivity: 'pii' }),
      m('escalation', 'Escalation Handler', 'done', 'done', 'route unclear/urgent to staff · notify operator', { owner: 'Core', effort: 'S' }),
      m('template-mgmt', 'Message Templates', 'partial', 'partial', 'WhatsApp template registry (table live; approval UI in progress)', { owner: 'Gateway', effort: 'S' }),
    ],
  },
  {
    title: 'STAFF DASHBOARD',
    mods: [
      m('dashboard', 'Staff Dashboard (React)', 'partial', 'done', 'ops · bookings · fleet · drivers · escalations · audit (override UI in progress)', { owner: 'Experience', effort: 'L' }),
      m('kpi-report', 'KPI & Reporting', 'done', 'done', 'automation rate · utilization · Excel/PDF export', { owner: 'Platform', effort: 'M' }),
      m('rules-engine', 'Tenant Config & Rules', 'done', 'done', 'rank tiers · priority weights · bump policy · mission keywords', { owner: 'Core', effort: 'M' }),
      m('auth-rbac', 'Auth & RBAC', 'done', 'done', '5 roles (admin/fleet_manager/operator/delivery/viewer) · token guards', { owner: 'Platform', effort: 'M', sensitivity: 'sensitive' }),
      m('audit-log', 'Audit Log', 'done', 'done', 'immutable append-only trail of every state change', { owner: 'Platform', effort: 'S', sensitivity: 'sensitive' }),
    ],
  },
  {
    title: 'DATA & STATE',
    mods: [
      m('pg', 'PostgreSQL 16', 'done', 'done', 'transactional bookings · GiST exclusion · JSONB tenant config', { owner: 'Platform', infra: true }),
      m('redis', 'Redis 7 (sessions)', 'done', 'done', 'conversation · license verdict · profile · dedup (TTL)', { owner: 'Platform', infra: true }),
      m('analytics-db', 'Conversation / KPI Events', 'partial', 'partial', 'conversation_messages + kpi_snapshots (export partial)', { owner: 'Platform', effort: 'S' }),
    ],
  },
  {
    title: 'AI / MODELS',
    mods: [
      m('llm-gateway', 'LLM Gateway (Qwen3)', 'done', 'done', 'OpenAI-compatible llama.cpp · tool-calling · retries', { owner: 'AI', external: true }),
      m('vlm-ocr', 'VLM OCR (Qwen2.5-VL)', 'done', 'done', 'license image → structured fields', { owner: 'AI', external: true }),
    ],
  },
  {
    title: 'PLATFORM & GOVERNANCE',
    mods: [
      m('core-api', 'FastAPI Core Service', 'done', 'done', 'agent orchestrator + booking engine + staff API (/api/v1)', { owner: 'Core', effort: 'L', critical: true }),
      m('cred-mgmt', 'Credential Management', 'done', 'done', 'WhatsApp keys · LLM/VLM endpoints (env + DB fallback)', { owner: 'Platform', sensitivity: 'sensitive' }),
      m('i18n', 'Internationalization', 'done', 'done', 'Arabic-first (RTL) · English toggle', { owner: 'Experience' }),
      m('observability', 'Observability', 'none', 'none', 'OTel → Prometheus/Grafana/Loki (planned · P1 gap)', { owner: 'Platform', effort: 'M' }),
      m('offline-bundle', 'Offline Install Bundle', 'none', 'none', 'air-gapped signed images + on-box LLM (planned · P0)', { owner: 'Platform', effort: 'L' }),
    ],
  },
];

/* ── Grid layout ──────────────────────────────────────────────── */

const TILE_W = 250;
const TILE_H = 96;
const GAP = 18;
const COLS = 6;

const tiles: PlacedTile[] = [];
const headers: ArchNodeDef[] = [];

let y = 70;
for (const section of SECTIONS) {
  headers.push({ id: `hdr_${section.title}`, label: section.title, x: 0, y, w: 800, h: 22, status: 'note', fontSize: 13 });
  y += 32;
  section.mods.forEach((mod, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    tiles.push({ ...mod, x: col * (TILE_W + GAP), y: y + row * (TILE_H + GAP), w: TILE_W, h: TILE_H });
  });
  y += Math.ceil(section.mods.length / COLS) * (TILE_H + GAP) + 24;
}

const counts: Record<ModuleStatus, number> = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
for (const s of SECTIONS) for (const mod of s.mods) counts[moduleStatus(mod)]++;
const total = Object.values(counts).reduce((a, b) => a + b, 0);

headers.unshift({
  id: 'tracker_summary',
  label: `${total} modules — ● ${counts.implemented} implemented · ◑ ${counts.partial} partial · ○ ${counts.planned} not started`,
  x: 0, y: 16, w: 1200, h: 28, status: 'note', fontSize: 15,
});

export const TRACKER_TILES = tiles;
export const TRACKER_NODES = headers;

export const ALL_MODULES: ModuleTileDef[] = SECTIONS.flatMap((s) => s.mods);
export const MODULE_BY_ID: Record<string, ModuleTileDef> = Object.fromEntries(ALL_MODULES.map((mod) => [mod.id, mod]));

/* ── Module-to-module relations ───────────────────────────────── */

function me(id: string, source: string, target: string, label: string): ModuleEdgeDef {
  return { id, source, target, label };
}

export const MODULE_EDGES: ModuleEdgeDef[] = [
  me('e_wa_core', 'gateway-wa', 'core-api', 'inbound message'),
  me('e_core_agent', 'core-api', 'agent-orch', 'route to agent'),
  me('e_agent_book', 'agent-orch', 'booking-engine', 'check/create/modify'),
  me('e_agent_neg', 'agent-orch', 'negotiation', 'propose alternatives'),
  me('e_agent_lic', 'agent-orch', 'license-verify', 'verify license'),
  me('e_agent_esc', 'agent-orch', 'escalation', 'escalate'),
  me('e_agent_llm', 'agent-orch', 'llm-gateway', 'chat + tools'),
  me('e_lic_vlm', 'license-verify', 'vlm-ocr', 'OCR'),
  me('e_book_pg', 'booking-engine', 'pg', 'atomic write'),
  me('e_avail_pg', 'availability', 'pg', 'overlap check'),
  me('e_agent_redis', 'agent-orch', 'redis', 'session state'),
  me('e_rem_wa', 'reminder-sched', 'gateway-wa', 'proactive send'),
  me('e_dash_core', 'dashboard', 'core-api', 'REST / SSE'),
  me('e_auth_pg', 'auth-rbac', 'pg', 'users'),
];

for (const e of MODULE_EDGES) {
  if (!MODULE_BY_ID[e.source] || !MODULE_BY_ID[e.target]) {
    throw new Error(`fleet-mgt modules.ts edge ${e.id} references unknown module id`);
  }
}
