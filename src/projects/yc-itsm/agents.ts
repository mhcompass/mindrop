/**
 * Agent registry (for the Agents board) — derived from the agents that
 * ride the connection lines in modules.ts (MODULE_EDGES[].agent), so the
 * status/purpose/tools stay in one source of truth. Here we only add the
 * card-specific breakdown: what part is implemented vs. not yet.
 */
import type { AgentStatus, ModuleStatus, AgentCard } from '../../model/types';
import { moduleStatus } from '../../model/types';
import { MODULE_EDGES, MODULE_BY_ID } from './modules';
export type { AgentCard } from '../../model/types';

/** Implemented-vs-pending breakdown, keyed by the agent's edge id. */
const DETAIL: Record<string, { live: string[]; pending: string[] }> = {
  me_console_chat: {
    live: [
      'Core agent loop: plan → call tool → reflect',
      'Dispatch + router across every domain & module tool',
      'Every step traced and replayable',
    ],
    pending: ['Live model leg unverified in this air-gapped env (LLM endpoint not running locally)'],
  },
  me_chat_inc: {
    live: [
      'Classifies + routes incidents',
      'create / transition / assign persist via the live records engine',
    ],
    pending: ['Auto-categorisation model tuning per tenant'],
  },
  me_know_inc: {
    live: [
      'Folder-scoped RAG retrieval with citations',
      'search_kb + cite_clause during triage',
      'EN/AR analysis-language resolution',
    ],
    pending: [],
  },
  me_phone_voice: {
    live: ['Whisper STT in', 'Kokoro / Piper TTS out (EN + AR)', 'Per-agent voices'],
    pending: ['Phone-bridge / SIP ingress is presentational today'],
  },
  me_reports_locker: {
    live: [
      'Natural-language report generation',
      'Scheduled / recurring reports',
      'Artifacts filed to the locker (MinIO)',
    ],
    pending: [],
  },
  me_user_auth: {
    live: ['reset_password + unlock_account', 'Group audit + onboarding', 'Mock / Graph / LDAP clients'],
    pending: ['Real AD / Graph wiring per deployment (mock client is the default)'],
  },
  me_sccm_cmdb: {
    live: ['sync_devices + check_compliance over the SCCM/Graph mock', 'Feeds the CMDB device picture'],
    pending: ['Real Graph / SCCM connector (mock client default)'],
  },
  me_prob_chg: {
    live: [
      'Change records carry a risk model',
      'CAB approval gate blocks high-risk implementation',
      'create_change + link_records tools',
    ],
    pending: ['Auto-drafted CAB brief (scripted in demo)', 'Risk score from historical / traffic factors'],
  },
  me_chg_cab: {
    live: ['Conflict detection across real change records (cab_window)', 'Risk band computed off live data'],
    pending: ['Automatic safest-window selection (scripted)'],
  },
  me_inc_prob: {
    live: ['link_records connects incident → problem across practices', 'Manual problem creation from an incident'],
    pending: ['Automatic recurrence / cluster detection (scripted in demo)', 'Auto-merge of duplicate incidents'],
  },
  me_sla_inc: {
    live: ['Per-priority SLA timers', 'Breach → admin notify + sla_breached timeline event'],
    pending: ['Predictive breach alerts (client-side heuristic today)'],
  },
  me_watch_prob: {
    live: ['Persistent metric watchers (watchlist_rule)', 'Background poller (tool_metrics_poll)'],
    pending: ['Raising emerging-pattern candidates into problem records (scripted)'],
  },
  me_war_inc: {
    live: ['Exec-briefing block rendered in the war room'],
    pending: ['Live LLM regeneration loop (scripted typewriter today)', 'War room backed by a DB table'],
  },
  me_oncall_war: {
    live: [],
    pending: ['Auto-page on-call from the rotation', 'On-call schedule is presentational today'],
  },
};

export const AGENT_CARDS: AgentCard[] = MODULE_EDGES.filter((e) => e.agent).map((e) => {
  const a = e.agent!;
  const from = MODULE_BY_ID[e.source];
  const to = MODULE_BY_ID[e.target];
  const d = DETAIL[e.id] ?? { live: [], pending: [] };
  return {
    id: e.id,
    name: a.name,
    status: a.status,
    purpose: a.desc ?? '',
    tools: a.tools ?? [],
    live: d.live,
    pending: d.pending,
    from: { id: e.source, name: from.name, status: moduleStatus(from) },
    to: { id: e.target, name: to.name, status: moduleStatus(to) },
  };
});

/** Display order: most-built first. */
export const AGENT_STATUS_ORDER: AgentStatus[] = ['ready', 'partial', 'planned'];

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  ready: 'Implemented',
  partial: 'Partial',
  planned: 'Not built',
};

/** Map an agent status onto the shared module-pill palette key. */
export const AGENT_STATUS_PILL: Record<AgentStatus, ModuleStatus> = {
  ready: 'implemented',
  partial: 'partial',
  planned: 'planned',
};

export const AGENT_COUNTS: Record<AgentStatus, number> = AGENT_CARDS.reduce(
  (acc, c) => {
    acc[c.status]++;
    return acc;
  },
  { ready: 0, partial: 0, planned: 0 } as Record<AgentStatus, number>,
);

/* Dev-time sanity: every DETAIL key must map to a real agent edge. */
{
  const agentEdgeIds = new Set(AGENT_CARDS.map((c) => c.id));
  for (const id of Object.keys(DETAIL)) {
    if (!agentEdgeIds.has(id)) {
      throw new Error(`agents.ts DETAIL references unknown agent edge id: ${id}`);
    }
  }
}
