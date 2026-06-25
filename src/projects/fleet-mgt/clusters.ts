/**
 * Clusters — the same modules as the tracker, organised as a capability
 * hierarchy. Module ids reference modules.ts (single source for status);
 * only the grouping lives here.
 */
import type { ClusterTreeDef, ClusterCounts, ClusterEdgeDef, AgentDef } from '../../model/types';
import { MODULE_BY_ID } from './modules';
import { moduleStatus } from '../../model/types';
export type { ClusterTreeDef, ClusterCounts, ClusterEdgeDef, AgentDef } from '../../model/types';

export const CLUSTER_TREE: ClusterTreeDef[] = [
  {
    id: 'c_booking', name: 'Booking & Allocation', accent: '#2563eb',
    children: ['booking-engine', 'availability', 'driver-alloc', 'negotiation', 'reminder-sched'],
  },
  {
    id: 'c_convo', name: 'Conversation & WhatsApp', accent: '#0d9488',
    children: ['gateway-wa', 'agent-orch', 'license-verify', 'escalation', 'template-mgmt'],
  },
  {
    id: 'c_ai', name: 'AI / Models', accent: '#db2777',
    children: ['llm-gateway', 'vlm-ocr'],
  },
  {
    id: 'c_ops', name: 'Staff Operations', accent: '#7c3aed',
    children: ['dashboard', 'kpi-report', 'rules-engine', 'auth-rbac', 'audit-log'],
  },
  {
    id: 'c_data', name: 'Data & Persistence', accent: '#475569',
    children: ['pg', 'redis', 'analytics-db'],
  },
  {
    id: 'c_platform', name: 'Platform & Deploy', accent: '#d97706',
    children: ['core-api', 'cred-mgmt', 'i18n', 'observability', 'offline-bundle'],
  },
];

/* ── Helpers (generic) ────────────────────────────────────────── */

export function aggregateCounts(def: ClusterTreeDef): ClusterCounts {
  const counts: ClusterCounts = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string') { const mod = MODULE_BY_ID[child]; if (mod) counts[moduleStatus(mod)]++; }
      else walk(child);
    }
  };
  walk(def);
  return counts;
}

export function allClusterIds(tree: ClusterTreeDef[] = CLUSTER_TREE): string[] {
  const ids: string[] = [];
  const walk = (c: ClusterTreeDef) => { ids.push(c.id); for (const child of c.children) if (typeof child !== 'string') walk(child); };
  tree.forEach(walk);
  return ids;
}

export const CLUSTER_EDGES: ClusterEdgeDef[] = [
  { id: 'fe_convo_book', source: 'c_convo', target: 'c_booking', label: 'slot-filled requests → bookings', sh: 'r', th: 'l' },
  { id: 'fe_convo_ai', source: 'c_convo', target: 'c_ai', label: 'tool-calls · license OCR', sh: 'b', th: 't' },
  { id: 'fe_book_data', source: 'c_booking', target: 'c_data', label: 'transactional writes (no double-book)' },
  { id: 'fe_ops_book', source: 'c_ops', target: 'c_booking', label: 'manual override · assign', sh: 'l', th: 'r' },
  { id: 'fe_ops_data', source: 'c_ops', target: 'c_data', label: 'audit · KPIs' },
  { id: 'fe_ai_data', source: 'c_ai', target: 'c_data', label: 'session state (Redis)' },
  { id: 'fe_plat_convo', source: 'c_platform', target: 'c_convo', label: 'credentials · i18n', sh: 't', th: 'b' },
];

export const AGENTS: AgentDef[] = [
  { id: 'ag_booking', name: 'Booking Agent', desc: 'Claude tool-calling loop — slot-fills the request over WhatsApp (Arabic/Emirati-first) and drives the booking engine.', connects: ['c_convo', 'c_booking'] },
  { id: 'ag_license', name: 'License Agent', desc: 'Gate-keeps each booking — runs the licence photo through the VLM and classifies valid/expired/unclear.', connects: ['c_convo', 'c_ai'] },
  { id: 'ag_negotiator', name: 'Allocation Negotiator', desc: 'When the first choice is unavailable, proposes best-enabler alternatives and priority bumps for staff to approve.', connects: ['c_booking', 'c_ops'] },
];

export const CLUSTER_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const walk = (c: ClusterTreeDef) => { map[c.id] = c.name; for (const child of c.children) if (typeof child !== 'string') walk(child); };
  CLUSTER_TREE.forEach(walk);
  return map;
})();

export const CLUSTER_PARENT: Record<string, string | undefined> = (() => {
  const map: Record<string, string | undefined> = {};
  const walk = (c: ClusterTreeDef, parent?: string) => { map[c.id] = parent; for (const child of c.children) if (typeof child !== 'string') walk(child, c.id); };
  CLUSTER_TREE.forEach((c) => walk(c));
  return map;
})();

export function clusterChain(id: string): string[] {
  const chain: string[] = [];
  let cur: string | undefined = id;
  while (cur) { chain.unshift(cur); cur = CLUSTER_PARENT[cur]; }
  return chain;
}

/* Dev-time sanity */
{
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string' && !MODULE_BY_ID[child]) throw new Error(`fleet-mgt clusters.ts unknown module id: ${child}`);
      if (typeof child !== 'string') walk(child);
    }
  };
  CLUSTER_TREE.forEach(walk);
  const known = new Set(allClusterIds());
  for (const e of CLUSTER_EDGES) if (!known.has(e.source) || !known.has(e.target)) throw new Error(`fleet-mgt clusters.ts edge ${e.id} unknown cluster`);
  for (const a of AGENTS) for (const c of a.connects) if (!known.has(c)) throw new Error(`fleet-mgt clusters.ts agent ${a.id} unknown cluster ${c}`);
}
