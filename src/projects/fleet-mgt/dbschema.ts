/**
 * Database model — the Flexible Fleet PostgreSQL schema, grouped by domain.
 * Rendered only in the Zoom Map as a deeper leaf level (table cards).
 * Transcribed from db/migrations (0001_baseline → 0005_time_windows).
 */
import type { ModuleStatus, TableStatus, DbTableDef, DbDomainDef } from '../../model/types';
export type { TableStatus, DbTableDef, DbDomainDef } from '../../model/types';

export const TABLE_TO_STATUS: Record<TableStatus, ModuleStatus> = {
  live: 'implemented',
  partial: 'partial',
  planned: 'planned',
};

function t(id: string, name: string, status: TableStatus, note?: string, owner?: string): DbTableDef {
  return { id, name, status, note, owner };
}

export const DB_DOMAINS: DbDomainDef[] = [
  {
    id: 'dm_fleet', name: 'Fleet & Drivers', accent: '#2563eb',
    tables: [
      t('tbl_vehicles', 'vehicles', 'live', 'plate · category · class · capacity · maintenance_until', 'availability'),
      t('tbl_drivers', 'drivers', 'live', 'pool · status · unavailability (JSONB)', 'driver-alloc'),
    ],
  },
  {
    id: 'dm_booking', name: 'Bookings', accent: '#0d9488',
    tables: [
      t('tbl_bookings', 'bookings', 'live', 'lifecycle · start_at/end_at (tstzrange, GiST no-overlap) · official_mission', 'booking-engine'),
      t('tbl_reminders', 'reminders', 'live', 'fire_at · pickup/driver · pending/sent', 'reminder-sched'),
      t('tbl_escalations', 'escalations', 'live', 'reason · assigned_to · open/resolved', 'escalation'),
    ],
  },
  {
    id: 'dm_identity', name: 'Identity & Tenancy', accent: '#0ea5e9',
    tables: [
      t('tbl_tenants', 'tenants', 'live', 'multi-tenant config (JSONB · allocation rules)', 'rules-engine'),
      t('tbl_users', 'users', 'live', '5 roles · password_hash · mfa_secret', 'auth-rbac'),
    ],
  },
  {
    id: 'dm_messaging', name: 'Messaging', accent: '#d946ef',
    tables: [
      t('tbl_templates', 'message_templates', 'partial', 'WhatsApp templates · ar/en · approval_status', 'template-mgmt'),
    ],
  },
  {
    id: 'dm_audit', name: 'Audit & Analytics', accent: '#475569',
    tables: [
      t('tbl_audit', 'audit_log', 'live', 'immutable action trail', 'audit-log'),
      t('tbl_kpi', 'kpi_snapshots', 'live', 'committee outcomes archive', 'kpi-report'),
      t('tbl_convo', 'conversation_messages', 'live', 'auditable message history (DB primary)', 'analytics-db'),
    ],
  },
];

const DOMAIN_OWNER: Record<string, string> = {
  dm_fleet: 'availability',
  dm_booking: 'booking-engine',
  dm_identity: 'auth-rbac',
  dm_messaging: 'template-mgmt',
  dm_audit: 'audit-log',
};

export const TABLE_BY_ID: Record<string, DbTableDef & { domain: string; owner: string }> = (() => {
  const map: Record<string, DbTableDef & { domain: string; owner: string }> = {};
  for (const dom of DB_DOMAINS) {
    for (const tb of dom.tables) {
      map[tb.id] = { ...tb, domain: dom.name, owner: tb.owner ?? DOMAIN_OWNER[dom.id] };
    }
  }
  return map;
})();

export const DB_TABLE_COUNT = DB_DOMAINS.reduce((a, d) => a + d.tables.length, 0);
