/**
 * Database model — how the persisted models are organised in Postgres,
 * grouped by domain. Rendered ONLY in the Zoom Map as a deeper leaf
 * level (table cards) so it doesn't pollute the module tracker / counts.
 *
 * status: live = table exists today · partial = exists but demo-grade ·
 *         planned = ships with the ITSM backend modules (incidents, …).
 */
import type { ModuleStatus } from './types';

export type TableStatus = 'live' | 'partial' | 'planned';

export interface DbTableDef {
  id: string;
  name: string;
  status: TableStatus;
  note?: string;
  /** Owning module id (defaults to the domain owner below). */
  owner?: string;
}

export interface DbDomainDef {
  id: string;
  name: string;
  accent: string;
  tables: DbTableDef[];
}

/** Table status → the shared pill palette key. */
export const TABLE_TO_STATUS: Record<TableStatus, ModuleStatus> = {
  live: 'implemented',
  partial: 'partial',
  planned: 'planned',
};

function t(id: string, name: string, status: TableStatus, note?: string): DbTableDef {
  return { id, name, status, note };
}

export const DB_DOMAINS: DbDomainDef[] = [
  {
    id: 'dm_itsm', name: 'ITSM Records', accent: '#e11d48',
    tables: [
      t('tbl_incidents', 'incidents', 'planned'),
      t('tbl_inc_events', 'incident_events', 'planned', 'timeline + Compass steps'),
      t('tbl_major_inc', 'major_incidents', 'planned'),
      t('tbl_warroom', 'war_room_comms', 'planned'),
      t('tbl_problems', 'problems', 'planned'),
      t('tbl_known_errors', 'known_errors', 'planned'),
      t('tbl_changes', 'changes', 'planned'),
      t('tbl_cab', 'cab_windows', 'planned'),
      t('tbl_xlinks', 'cross_links', 'planned', 'INC ↔ PRB ↔ CHG ↔ CI'),
      t('tbl_sla', 'sla_policies', 'planned'),
    ],
  },
  {
    id: 'dm_cmdb', name: 'Configuration (CMDB)', accent: '#f59e0b',
    tables: [
      t('tbl_ci', 'ci_items', 'planned'),
      t('tbl_ci_rel', 'ci_relationships', 'planned'),
      t('tbl_sites', 'sites', 'planned', 'school / district sites'),
      t('tbl_devices', 'device_cache', 'live', 'SCCM / Graph sync'),
    ],
  },
  {
    id: 'dm_desk', name: 'Service Desk', accent: '#10b981',
    tables: [
      t('tbl_requests', 'portal_requests', 'planned'),
      t('tbl_catalog', 'catalog_items', 'planned'),
      t('tbl_approvals', 'approvals', 'live'),
    ],
  },
  {
    id: 'dm_know', name: 'Knowledge & Content', accent: '#d946ef',
    tables: [
      t('tbl_kb_folders', 'kb_folders', 'live'),
      t('tbl_kb_docs', 'kb_documents', 'live'),
      t('tbl_kb_chunks', 'kb_chunks', 'live', 'vectors mirrored in Qdrant'),
      t('tbl_locker_folders', 'locker_folders', 'live'),
      t('tbl_locker_items', 'locker_items', 'live'),
    ],
  },
  {
    id: 'dm_conv', name: 'Conversation & Agent', accent: '#8b5cf6',
    tables: [
      t('tbl_conversations', 'conversations', 'live'),
      t('tbl_messages', 'messages', 'live'),
      t('tbl_tool_calls', 'tool_calls', 'live'),
      t('tbl_traces', 'traces', 'live'),
    ],
  },
  {
    id: 'dm_identity', name: 'Identity & Governance', accent: '#0ea5e9',
    tables: [
      t('tbl_users', 'users', 'live'),
      t('tbl_roles', 'roles', 'live'),
      t('tbl_audit', 'audit_log', 'live'),
      t('tbl_decisions', 'governance_decisions', 'partial', 'replay — seeded today'),
      t('tbl_policies', 'approval_policies', 'partial', 'seeded today'),
    ],
  },
  {
    id: 'dm_ops', name: 'Ops & Integration', accent: '#475569',
    tables: [
      t('tbl_reports', 'reports', 'live'),
      t('tbl_sched', 'scheduled_reports', 'live'),
      t('tbl_connectors', 'connectors', 'live'),
      t('tbl_watchlists', 'watchlists', 'live'),
      t('tbl_polls', 'metric_polls', 'live'),
    ],
  },
];

/** Default owning module per domain (overridable per-table via owner). */
const DOMAIN_OWNER: Record<string, string> = {
  dm_itsm: 't_inc',
  dm_cmdb: 't_cmdb',
  dm_desk: 't_portal',
  dm_know: 't_know',
  dm_conv: 't_conv',
  dm_identity: 't_auth',
  dm_ops: 't_reports',
};

const TABLE_OWNER_OVERRIDE: Record<string, string> = {
  tbl_major_inc: 't_war', tbl_warroom: 't_war',
  tbl_problems: 't_prob', tbl_known_errors: 't_prob',
  tbl_changes: 't_chg', tbl_cab: 't_chg',
  tbl_xlinks: 't_links', tbl_sla: 't_sla',
  tbl_devices: 't_sccm',
  tbl_catalog: 't_catalog', tbl_approvals: 't_appr',
  tbl_locker_folders: 't_locker', tbl_locker_items: 't_locker',
  tbl_traces: 't_trace',
  tbl_audit: 't_gov', tbl_decisions: 't_gov', tbl_policies: 't_gov',
  tbl_connectors: 't_conn', tbl_watchlists: 't_watch', tbl_polls: 't_dash',
};

export const TABLE_BY_ID: Record<string, DbTableDef & { domain: string; owner: string }> = (() => {
  const map: Record<string, DbTableDef & { domain: string; owner: string }> = {};
  for (const dom of DB_DOMAINS) {
    for (const tb of dom.tables) {
      map[tb.id] = { ...tb, domain: dom.name, owner: tb.owner ?? TABLE_OWNER_OVERRIDE[tb.id] ?? DOMAIN_OWNER[dom.id] };
    }
  }
  return map;
})();

export const DB_TABLE_COUNT = DB_DOMAINS.reduce((a, d) => a + d.tables.length, 0);
