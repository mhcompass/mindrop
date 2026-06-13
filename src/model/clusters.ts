/**
 * Clusters view — the same modules as the tracker, organised as a
 * capability hierarchy: clusters contain sub-clusters contain modules.
 * Module ids reference modules.ts (single source of truth for status);
 * only the grouping lives here.
 */
import type { ModuleStatus } from './types';
import { MODULE_BY_ID } from './modules';
import { moduleStatus } from './types';

export interface ClusterTreeDef {
  id: string;
  name: string;
  /** Accent colour slug for the cluster title strip. */
  accent: string;
  /** Children: nested clusters or module ids (strings → modules.ts). */
  children: Array<ClusterTreeDef | string>;
}

export const CLUSTER_TREE: ClusterTreeDef[] = [
  {
    id: 'c_itsm',
    name: 'ITSM',
    accent: '#e11d48',
    children: [
      {
        id: 'c_ops', name: 'Service Operations', accent: '#e11d48',
        children: ['t_inc', 't_war', 't_oncall', 't_sla', 't_sse'],
      },
      {
        id: 'c_prob', name: 'Problem Management', accent: '#a855f7',
        children: ['t_prob', 't_links'],
      },
      {
        id: 'c_change', name: 'Change Enablement', accent: '#3b82f6',
        children: ['t_chg', 't_cab', 't_appr'],
      },
      {
        id: 'c_citizen', name: 'Citizen Services', accent: '#10b981',
        children: ['t_portal', 't_catalog', 't_phone', 't_notif'],
      },
      {
        id: 'c_config', name: 'Asset & Configuration', accent: '#f59e0b',
        children: ['t_cmdb', 't_sccm'],
      },
      {
        id: 'c_insight', name: 'Insight & Reporting', accent: '#06b6d4',
        children: ['t_dash', 't_agg', 't_reports'],
      },
    ],
  },
  {
    id: 'c_ai',
    name: 'AI Core',
    accent: '#8b5cf6',
    children: [
      {
        id: 'c_conv', name: 'Conversation', accent: '#8b5cf6',
        children: ['t_chat', 't_conv', 't_voice', 't_briefing'],
      },
      {
        id: 'c_knowledge', name: 'Knowledge', accent: '#d946ef',
        children: ['t_know', 't_sp', 't_uc'],
      },
      {
        id: 'c_oversight', name: 'Trust & Oversight', accent: '#64748b',
        children: ['t_gov', 't_trace', 't_watch'],
      },
    ],
  },
  {
    id: 'c_identity',
    name: 'Identity & Access',
    accent: '#0ea5e9',
    children: ['t_auth', 't_user'],
  },
  {
    id: 'c_integrations',
    name: 'Integrations',
    accent: '#475569',
    children: ['t_conn', 't_exch', 't_wl'],
  },
  {
    id: 'c_workspace',
    name: 'Workspace & Content',
    accent: '#14b8a6',
    children: ['t_locker'],
  },
  {
    id: 'c_platform',
    name: 'Platform Foundation',
    accent: '#6b7280',
    children: ['t_profile'],
  },
  {
    id: 'c_seeding',
    name: 'Demo Data & Seeding',
    accent: '#d79b00',
    children: ['t_fixtures', 't_seeder'],
  },
  {
    id: 'c_demo',
    name: 'Experience & Demo',
    accent: '#9673a6',
    children: ['t_galaxy', 't_wsmap', 't_story', 't_vo', 't_autopilot', 't_ar'],
  },
  {
    id: 'c_channels',
    name: 'Channels',
    accent: '#0d9488',
    children: ['t_console', 't_apipub', 't_emailin', 't_webhook', 't_mobile'],
  },
  {
    id: 'c_external',
    name: 'External Systems',
    accent: '#64748b',
    children: ['t_entra', 't_graph', 't_sp_ext', 't_smtp', 't_wl_ext', 't_ollama', 't_azure'],
  },
  {
    id: 'c_infra',
    name: 'Infrastructure',
    accent: '#0891b2',
    children: [
      {
        id: 'c_infra_data', name: 'Data Stores', accent: '#0891b2',
        children: ['t_pg', 't_qdrant', 't_minio'],
      },
      {
        id: 'c_infra_runtime', name: 'Runtime & Models', accent: '#0d9488',
        children: ['t_llm', 't_ttsbox'],
      },
      {
        id: 'c_infra_ops', name: 'Platform & Ops', accent: '#475569',
        children: ['t_compose', 't_langfuse'],
      },
    ],
  },
];

/* ── Helpers ──────────────────────────────────────────────────── */

export type ClusterCounts = Record<ModuleStatus, number>;

export function aggregateCounts(def: ClusterTreeDef): ClusterCounts {
  const counts: ClusterCounts = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string') {
        const mod = MODULE_BY_ID[child];
        if (mod) counts[moduleStatus(mod)]++;
      } else {
        walk(child);
      }
    }
  };
  walk(def);
  return counts;
}

export function allClusterIds(tree: ClusterTreeDef[] = CLUSTER_TREE): string[] {
  const ids: string[] = [];
  const walk = (c: ClusterTreeDef) => {
    ids.push(c.id);
    for (const child of c.children) if (typeof child !== 'string') walk(child);
  };
  tree.forEach(walk);
  return ids;
}

/* ── Inter-cluster connections ────────────────────────────────── */

export interface ClusterEdgeDef {
  id: string;
  source: string;
  target: string;
  label: string;
  /** Handle hints: t(op) b(ottom) l(eft) r(ight). */
  sh?: 't' | 'b' | 'l' | 'r';
  th?: 't' | 'b' | 'l' | 'r';
}

/** Semantic flows between clusters. Endpoints may be sub-clusters —
 *  the view lifts an edge to the nearest visible ancestor when its
 *  endpoint is hidden inside a collapsed cluster. */
export const CLUSTER_EDGES: ClusterEdgeDef[] = [
  /* The ITIL loop */
  { id: 'ce_ops_prob', source: 'c_ops', target: 'c_prob', label: 'recurring patterns promote to problems', sh: 'r', th: 'l' },
  { id: 'ce_prob_chg', source: 'c_prob', target: 'c_change', label: 'permanent fix via change' },
  { id: 'ce_citizen_ops', source: 'c_citizen', target: 'c_ops', label: 'requests & calls become tickets', sh: 't', th: 'b' },
  { id: 'ce_config_ops', source: 'c_config', target: 'c_ops', label: 'CI impact · affected sites', sh: 't', th: 'b' },
  { id: 'ce_ops_insight', source: 'c_ops', target: 'c_insight', label: 'operational metrics' },
  /* AI involvement */
  { id: 'ce_ai_itsm', source: 'c_ai', target: 'c_itsm', label: 'triage · summaries · agent tools', sh: 't', th: 'b' },
  { id: 'ce_know_ops', source: 'c_knowledge', target: 'c_ops', label: 'KB citations during triage', sh: 't', th: 'b' },
  /* Platform */
  { id: 'ce_id_itsm', source: 'c_identity', target: 'c_itsm', label: 'authN/Z', sh: 't', th: 'b' },
  { id: 'ce_id_ai', source: 'c_identity', target: 'c_ai', label: 'authN/Z', sh: 'r', th: 'l' },
  { id: 'ce_int_config', source: 'c_integrations', target: 'c_config', label: 'device & directory data', sh: 't', th: 'b' },
  { id: 'ce_int_citizen', source: 'c_integrations', target: 'c_citizen', label: 'email notifications', sh: 't', th: 'b' },
  { id: 'ce_ops_locker', source: 'c_ops', target: 'c_workspace', label: 'postmortems filed to locker' },
  /* Seeding */
  { id: 'ce_seed_itsm', source: 'c_seeding', target: 'c_itsm', label: 'seeds demo records (INC-1041 story)', sh: 't', th: 'b' },
  { id: 'ce_seed_demo', source: 'c_seeding', target: 'c_demo', label: 'fixtures power the stories', sh: 'r', th: 'l' },
  { id: 'ce_demo_conv', source: 'c_demo', target: 'c_conv', label: 'TTS narration', sh: 't', th: 'b' },
  /* Infrastructure */
  { id: 'ce_ai_infra', source: 'c_ai', target: 'c_infra', label: 'LLM · vectors · traces' },
  { id: 'ce_insight_infra', source: 'c_insight', target: 'c_infra', label: 'queries · artifacts' },
  { id: 'ce_seed_infra', source: 'c_seeding', target: 'c_infra', label: 'fixtures → Postgres' },
  /* Channels (ingress) */
  { id: 'ce_chan_itsm', source: 'c_channels', target: 'c_itsm', label: 'work enters', sh: 't', th: 'b' },
  { id: 'ce_chan_ai', source: 'c_channels', target: 'c_ai', label: 'conversational ingress', sh: 't', th: 'b' },
  /* External systems (boundary) */
  { id: 'ce_ext_identity', source: 'c_external', target: 'c_identity', label: 'authN (Entra)' },
  { id: 'ce_ext_integrations', source: 'c_external', target: 'c_integrations', label: 'devices · mail · docs' },
  { id: 'ce_ext_ai', source: 'c_external', target: 'c_ai', label: 'frontier opt-in' },
];

/* ── Agents working between clusters ──────────────────────────── */

export interface AgentDef {
  id: string;
  name: string;
  desc: string;
  /** Cluster ids this agent works across (≥2). */
  connects: string[];
}

/** The galaxy agents — each floats between the clusters it serves. */
export const AGENTS: AgentDef[] = [
  {
    id: 'ag_compass',
    name: 'Compass Orchestrator',
    desc: 'The core agent loop — classifies incidents, merges clusters, drafts exec briefings and CAB briefs via tool calls.',
    connects: ['c_conv', 'c_ops', 'c_prob'],
  },
  {
    id: 'ag_knowledge',
    name: 'Knowledge Agent',
    desc: 'Surfaces KB clauses as citations during triage — Assessment Runbook §2, Exam Checklist §14.',
    connects: ['c_knowledge', 'c_ops'],
  },
  {
    id: 'ag_device',
    name: 'Device Agent (SCCM)',
    desc: 'Pulls device inventory + compliance from Graph/SCCM into the CMDB picture.',
    connects: ['c_integrations', 'c_config'],
  },
  {
    id: 'ag_user',
    name: 'User Management Agent',
    desc: 'Resets, unlocks and onboarding driven from service-desk conversations (mock / Graph / LDAP).',
    connects: ['c_identity', 'c_citizen'],
  },
  {
    id: 'ag_watchlist',
    name: 'Watchlist Agent',
    desc: 'Watches metric polls and recurring symptoms; raises emerging-pattern candidates for problem records.',
    connects: ['c_oversight', 'c_prob'],
  },
  {
    id: 'ag_reports',
    name: 'Reports Agent',
    desc: 'Compiles scheduled reports and files artifacts into the locker (MinIO).',
    connects: ['c_insight', 'c_workspace'],
  },
  {
    id: 'ag_voice',
    name: 'Voice Agent',
    desc: 'Whisper STT in, Kokoro TTS out — drives the phone bridge and voice-mode conversations (AR + EN).',
    connects: ['c_citizen', 'c_conv'],
  },
];

/** Display name per cluster id. */
export const CLUSTER_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const walk = (c: ClusterTreeDef) => {
    map[c.id] = c.name;
    for (const child of c.children) if (typeof child !== 'string') walk(child);
  };
  CLUSTER_TREE.forEach(walk);
  return map;
})();

/** parent cluster id per cluster id (top-level → undefined). */
export const CLUSTER_PARENT: Record<string, string | undefined> = (() => {
  const map: Record<string, string | undefined> = {};
  const walk = (c: ClusterTreeDef, parent?: string) => {
    map[c.id] = parent;
    for (const child of c.children) if (typeof child !== 'string') walk(child, c.id);
  };
  CLUSTER_TREE.forEach((c) => walk(c));
  return map;
})();

/** Chain of cluster ids from the top-level ancestor down to `id`. */
export function clusterChain(id: string): string[] {
  const chain: string[] = [];
  let cur: string | undefined = id;
  while (cur) {
    chain.unshift(cur);
    cur = CLUSTER_PARENT[cur];
  }
  return chain;
}

/* Dev-time sanity: every referenced module id must exist. */
for (const id of allClusterIds()) void id;
{
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string' && !MODULE_BY_ID[child]) {
        throw new Error(`clusters.ts references unknown module id: ${child}`);
      }
      if (typeof child !== 'string') walk(child);
    }
  };
  CLUSTER_TREE.forEach(walk);
  const known = new Set(allClusterIds());
  for (const e of CLUSTER_EDGES) {
    if (!known.has(e.source) || !known.has(e.target)) {
      throw new Error(`clusters.ts edge ${e.id} references unknown cluster id`);
    }
  }
  for (const a of AGENTS) {
    for (const c of a.connects) {
      if (!known.has(c)) throw new Error(`clusters.ts agent ${a.id} references unknown cluster id: ${c}`);
    }
  }
}
