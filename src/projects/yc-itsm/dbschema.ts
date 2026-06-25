/**
 * Database model — how the persisted models are organised in Postgres,
 * grouped by domain. Rendered ONLY in the Zoom Map as a deeper leaf
 * level (table cards) so it doesn't pollute the module tracker / counts.
 *
 * status: live = table exists today · partial = exists but demo-grade ·
 *         planned = ships with the ITSM backend modules (incidents, …).
 */
import type { ModuleStatus, TableStatus, DbTableDef, DbDomainDef } from '../../model/types';
export type { TableStatus, DbTableDef, DbDomainDef } from '../../model/types';

/** Table status → the shared pill palette key. */
export const TABLE_TO_STATUS: Record<TableStatus, ModuleStatus> = {
  live: 'implemented',
  partial: 'partial',
  planned: 'planned',
};

function t(id: string, name: string, status: TableStatus, note?: string, owner?: string): DbTableDef {
  return { id, name, status, note, owner };
}

/* Transcribed from the live Postgres schema (public). The ITIL records
 * are ONE polymorphic `tickets` table (type + fields jsonb) — incidents,
 * problems, changes and service requests are rows, not separate tables. */
export const DB_DOMAINS: DbDomainDef[] = [
  {
    id: 'dm_itsm', name: 'ITSM Records', accent: '#e11d48',
    tables: [
      t('tbl_tickets', 'tickets', 'live', 'polymorphic — INC · PRB · CHG · SR (type + fields jsonb)', 't_inc'),
      t('tbl_ticket_events', 'ticket_events', 'live', 'timeline + Compass steps', 't_inc'),
      t('tbl_ticket_worklog', 'ticket_worklog', 'live', undefined, 't_inc'),
      t('tbl_ticket_links', 'ticket_links', 'live', 'INC ↔ PRB ↔ CHG ↔ CI cross-practice', 't_links'),
      t('tbl_ticket_counters', 'ticket_counters', 'live', 'per-type number sequences', 't_inc'),
      t('tbl_major_inc', 'major_incidents', 'planned', 'war room presentational today', 't_war'),
      t('tbl_sla', 'sla_policies', 'planned', 'SLA timers computed in code; policy table to build', 't_sla'),
    ],
  },
  {
    id: 'dm_cmdb', name: 'Configuration (CMDB)', accent: '#f59e0b',
    tables: [
      t('tbl_assets', 'assets', 'live', 'CMDB inventory at asset granularity', 't_cmdb'),
      t('tbl_mock_devices', 'mock_devices', 'live', 'SCCM / Graph mock', 't_sccm'),
      t('tbl_mock_compliance', 'mock_device_compliance', 'live', 'patch / compliance', 't_sccm'),
      t('tbl_sites', 'sites', 'planned', 'derived from assets today (no table)', 't_cmdb'),
    ],
  },
  {
    id: 'dm_desk', name: 'Service Desk', accent: '#10b981',
    tables: [
      t('tbl_catalog', 'catalog_items', 'live', 'service-catalog request templates', 't_catalog'),
      t('tbl_requests', 'requests', 'live', 'agent run / execution requests', 't_chat'),
      t('tbl_approvals', 'approvals', 'live', undefined, 't_appr'),
      t('tbl_approver_tokens', 'approver_tokens', 'live', 'per-approver secure tokens', 't_appr'),
      t('tbl_notifications', 'notifications', 'live', undefined, 't_notif'),
      t('tbl_email_outbox', 'email_outbox', 'live', 'durable email queue · retry / DLQ', 't_exch'),
    ],
  },
  {
    id: 'dm_know', name: 'Knowledge & Content', accent: '#d946ef',
    tables: [
      t('tbl_kb_docs', 'knowledge_documents', 'live', 'chunks/vectors mirrored in Qdrant', 't_know'),
      t('tbl_kb_sources', 'knowledge_sources', 'live', undefined, 't_know'),
      t('tbl_kb_sync', 'knowledge_sync_logs', 'live', 'SharePoint sync', 't_sp'),
      t('tbl_locker_folders', 'locker_folders', 'live', 'analysis_language + analysis_translations (EN/AR)', 't_locker'),
      t('tbl_locker_docs', 'locker_documents', 'live', undefined, 't_locker'),
      t('tbl_locker_chat', 'locker_chat_messages', 'live', undefined, 't_locker'),
    ],
  },
  {
    id: 'dm_conv', name: 'Conversation & Agent', accent: '#8b5cf6',
    tables: [
      t('tbl_conversations', 'conversations', 'live', 'messages + tool-calls embedded; traces → Langfuse', 't_conv'),
    ],
  },
  {
    id: 'dm_identity', name: 'Identity & Governance', accent: '#0ea5e9',
    tables: [
      t('tbl_users', 'users', 'live', 'roles[] array column', 't_auth'),
      t('tbl_perm_cache', 'user_permission_cache', 'live', undefined, 't_auth'),
      t('tbl_audit', 'audit_logs', 'live', undefined, 't_gov'),
      t('tbl_session_epoch', 'session_epoch', 'live', 'global session invalidation', 't_auth'),
      t('tbl_decisions', 'governance_decisions', 'planned', 'replay seeded — no table yet', 't_gov'),
      t('tbl_policies', 'approval_policies', 'planned', 'seeded today', 't_gov'),
    ],
  },
  {
    id: 'dm_ops', name: 'Ops & Integration', accent: '#475569',
    tables: [
      t('tbl_reports', 'generated_reports', 'live', undefined, 't_reports'),
      t('tbl_report_exec', 'report_executions', 'live', undefined, 't_reports'),
      t('tbl_sched', 'scheduled_reports', 'live', undefined, 't_reports'),
      t('tbl_runbooks', 'runbooks', 'live', 'WebLogic / ops runbooks', 't_wl'),
      t('tbl_usecases', 'usecases', 'live', undefined, 't_uc'),
      t('tbl_watchlists', 'watchlist_rule', 'live', 'persistent metric watchers', 't_watch'),
      t('tbl_poll', 'tool_metrics_poll', 'live', 'background poller', 't_watch'),
      t('tbl_samples', 'tool_metrics_sample', 'live', 'time-series tool results', 't_dash'),
      t('tbl_tts', 'tts_config', 'live', 'operator-tunable voice', 't_voice'),
    ],
  },
];

/** Default owning module per domain (overridable per-table via owner). */
const DOMAIN_OWNER: Record<string, string> = {
  dm_itsm: 't_inc',
  dm_cmdb: 't_cmdb',
  dm_desk: 't_catalog',
  dm_know: 't_know',
  dm_conv: 't_conv',
  dm_identity: 't_auth',
  dm_ops: 't_reports',
};

/* Per-table owners are set inline via t(…, owner); this stays as a
 * fallback for any table that omits one. */
const TABLE_OWNER_OVERRIDE: Record<string, string> = {};

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
