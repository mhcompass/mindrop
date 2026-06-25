/**
 * Database model — Saga's PostgreSQL schema (SQLAlchemy 2.0 async models),
 * grouped by domain. Rendered only in the Zoom Map as a deeper leaf level.
 * From apps/api/app/models/.
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
    id: 'dm_identity', name: 'Identity & Teams', accent: '#0ea5e9',
    tables: [
      t('tbl_users', 'users', 'live', 'JWT auth · roles', 'api-auth'),
      t('tbl_workspaces', 'workspaces', 'live', 'team workspaces', 'api-workspaces'),
      t('tbl_members', 'workspace_members', 'live', 'membership · roles · invites', 'api-workspaces'),
    ],
  },
  {
    id: 'dm_media', name: 'Projects & Media', accent: '#2563eb',
    tables: [
      t('tbl_projects', 'projects', 'live', 'project + sharing', 'api-projects'),
      t('tbl_videos', 'videos', 'live', 'source + rendered · status · settings (MutableDict JSONB)', 'api-videos'),
      t('tbl_frames', 'frames', 'live', 'extracted screenshots · timestamps', 'video-processor'),
    ],
  },
  {
    id: 'dm_gen', name: 'Generation', accent: '#7c3aed',
    tables: [
      t('tbl_jobs', 'jobs', 'live', 'ARQ job state · progress', 'arq-queue'),
      t('tbl_voiceovers', 'voiceovers', 'live', 'TTS audio per language', 'tts-service'),
      t('tbl_documents', 'documents', 'live', 'generated step-by-step guides', 'doc-generator'),
      t('tbl_presets', 'effect_presets', 'live', '12 effect types · user/workspace/built-in', 'api-presets'),
    ],
  },
  {
    id: 'dm_brand', name: 'Branding', accent: '#d946ef',
    tables: [
      t('tbl_brands', 'brand_settings', 'live', 'logo · colours · intros/outros', 'api-brands'),
    ],
  },
];

const DOMAIN_OWNER: Record<string, string> = {
  dm_identity: 'api-auth',
  dm_media: 'api-videos',
  dm_gen: 'arq-queue',
  dm_brand: 'video-effects',
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
