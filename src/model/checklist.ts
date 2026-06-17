/**
 * Delivery checklist — the core (non-agent) functionality with an
 * explicit "delivered" vs "to deliver / modify" breakdown per module.
 * Status / name / note are pulled from modules.ts (single source); only
 * the work breakdown is authored here.
 */
import type { ModuleStatus, PartState } from './types';
import { moduleStatus } from './types';
import { MODULE_BY_ID } from './modules';

export interface ChecklistEntry {
  id: string;
  name: string;
  note?: string;
  status: ModuleStatus;
  ui: PartState;
  api: PartState;
  feOnly?: boolean;
  /** Shipped today. */
  delivered: string[];
  /** Still to build or modify. */
  todo: string[];
}

export interface ChecklistGroup {
  id: string;
  title: string;
  accent: string;
  entries: ChecklistEntry[];
}

interface RawItem {
  id: string;
  delivered: string[];
  todo: string[];
}
interface RawGroup {
  id: string;
  title: string;
  accent: string;
  items: RawItem[];
}

const RAW: RawGroup[] = [
  {
    id: 'g_itsm', title: 'ITSM Pillars', accent: '#e11d48',
    items: [
      {
        id: 't_inc',
        delivered: [
          'Live records engine — list, drawer, transition, assign, worklog',
          'Impact × urgency → priority + per-priority SLA timers',
          'KB citations + agent create/transition/assign tools',
        ],
        todo: [
          'Retire the seeded INC-104x storyline onto real records',
          'Predictive SLA-breach indicators in the list',
          'Declare the war room from a real incident',
        ],
      },
      {
        id: 't_war',
        delivered: ['War-room UI — elapsed clock, bridge roster, comms log, action board'],
        todo: [
          'major_incidents + war_room_comms tables',
          'Live exec-briefing regeneration (scripted typewriter today)',
          'Persist comms posts + auto-page the bridge',
        ],
      },
      {
        id: 't_prob',
        delivered: ['Live records — RCA drawer, status lifecycle', 'Cross-practice links + agent tools'],
        todo: ['known_errors model', 'Automatic recurrence / cluster detection into problems'],
      },
      {
        id: 't_chg',
        delivered: [
          'Live records + change-risk model',
          'CAB approval gate on high-risk changes',
          'Agent create / transition + cross-practice linking',
        ],
        todo: ['Real risk score from history / traffic / dependencies', 'Auto-generated CAB brief'],
      },
      {
        id: 't_cab',
        delivered: ['Reads real change records (cab_window)', 'Conflict flags + risk band off live data'],
        todo: ['Auto safest-window suggestion', 'Drag-to-reschedule persistence'],
      },
      {
        id: 't_cmdb',
        delivered: ['assets table + /assets + /sites', 'Catalog, filters, asset drawer'],
        todo: [
          'Site-level rollup (CmdbSiteDrawer still seeded)',
          'ci_relationships / dependency graph',
          'Real device sync (mock today)',
        ],
      },
      {
        id: 't_catalog',
        delivered: ['catalog_items + /catalog', 'Submit → service_request'],
        todo: ['Catalog admin CRUD', 'Per-item approver routing + SLA config'],
      },
      {
        id: 't_portal',
        delivered: ['Submit → service_request', 'My-requests live'],
        todo: ['Status timeline + notification round-trip', 'Role-scoped views (teacher / principal)'],
      },
      {
        id: 't_oncall',
        delivered: ['On-call schedule UI (presentational)'],
        todo: ['on_call_schedule table + real rotation', 'Paging integration with the war room'],
      },
      {
        id: 't_phone',
        delivered: ['Scripted phone-bridge demo UI'],
        todo: ['Telephony / SIP ingress', 'Server-side STT path', 'Call → ticket persistence'],
      },
      {
        id: 't_dash',
        delivered: ['Dashboard UI', 'Metric polls live'],
        todo: ['Aggregation endpoints (MTTR · SLA · volume)', 'Replace hardcoded charts with live aggregates'],
      },
    ],
  },
  {
    id: 'g_shared', title: 'Shared Services', accent: '#6366f1',
    items: [
      {
        id: 't_sla',
        delivered: ['Per-priority SLA timers', 'Breach → admin notify + sla_breached timeline event'],
        todo: ['Predictive breach (client-side heuristic today)', 'sla_policies table', 'Pause / resume on hold states'],
      },
      {
        id: 't_links',
        delivered: ['ticket_links table + /links + by-number', 'Link buttons in incident / problem / change drawers'],
        todo: ['CI ↔ ticket linking from CMDB', 'Link-type taxonomy in the UI'],
      },
      {
        id: 't_sse',
        delivered: ['Galaxy / stream SSE pulses'],
        todo: ['Generalise SSE for live incident / problem updates'],
      },
      {
        id: 't_agg',
        delivered: [],
        todo: ['MTTR / SLA / volume aggregation endpoints', 'Back the dashboards off these'],
      },
      {
        id: 't_notif',
        delivered: ['notifications table', 'SLA-breach admin notify wired'],
        todo: ['Portal status round-trip', 'In-app notification center', 'Email templates'],
      },
      {
        id: 't_fixtures',
        delivered: ['10 fixture files powering FE surfaces'],
        todo: ['Retire fixtures superseded by live records', 'Keep only the demo-storyline (INC-104x) set'],
      },
      {
        id: 't_seeder',
        delivered: [],
        todo: ['fixtures → Postgres seeder for reset-between-demos'],
      },
    ],
  },
  {
    id: 'g_core', title: 'Platform & Core', accent: '#8b5cf6',
    items: [
      {
        id: 't_know',
        delivered: ['Qdrant ingest + retrieval + citations', 'Runbook indexer', 'EN/AR analysis-language'],
        todo: ['Cross-folder QA polish', 'SharePoint sync hardening'],
      },
      {
        id: 't_locker',
        delivered: ['Folders, templates, postmortems', 'EN/AR analysis-language resolution'],
        todo: ['On-demand translation generation (native fallback today)', 'Arabic folder titles + icons for MOE'],
      },
      {
        id: 't_gov',
        delivered: ['Kill switch (live)', 'Approval gates · PII redaction · audit log'],
        todo: ['governance_decisions + approval_policies tables', 'Real decision replay (seeded today)'],
      },
      {
        id: 't_profile',
        delivered: ['Profiles · modules + domains · branding', 'Runtime switch + schema-per-tenant'],
        todo: ['Profile admin UI polish', 'Per-profile demo seeding'],
      },
      {
        id: 't_appr',
        delivered: ['approvals + approver_tokens', 'Email approve / reject flow'],
        todo: ['Policy-driven gate-config UI'],
      },
      {
        id: 't_voice',
        delivered: ['Whisper STT + Kokoro / Piper TTS', 'EN + AR, per-agent voices'],
        todo: ['Telephony bridge (with Phone channel)'],
      },
    ],
  },
  {
    id: 'g_int', title: 'Integrations', accent: '#475569',
    items: [
      {
        id: 't_user',
        delivered: ['List / search, group audit, onboarding', 'Mock / Graph / LDAP clients'],
        todo: ['Real Graph / LDAP wiring per deployment'],
      },
      {
        id: 't_sccm',
        delivered: ['Mock device + compliance data', 'Agent tools'],
        todo: ['Real SCCM / Graph connector'],
      },
      {
        id: 't_exch',
        delivered: ['Mailbox / outbound-queue diagnostics'],
        todo: ['Real mail-send wiring + templates'],
      },
      {
        id: 't_wl',
        delivered: ['Runbook ops UI + approval-gated write tools'],
        todo: ['Real WebLogic wiring (WEBLOGIC_MOCK=false) + credentials'],
      },
      {
        id: 't_sp',
        delivered: ['Document sync into the knowledge base'],
        todo: ['Incremental / scheduled sync hardening'],
      },
    ],
  },
  {
    id: 'g_chan', title: 'Channels', accent: '#0d9488',
    items: [
      {
        id: 't_console',
        delivered: ['React SPA — primary operator surface'],
        todo: [],
      },
      {
        id: 't_apipub',
        delivered: ['FastAPI contract across domains + modules'],
        todo: ['OpenAPI doc polish + versioning'],
      },
      {
        id: 't_emailin',
        delivered: [],
        todo: ['Inbound email → incident pipeline'],
      },
      {
        id: 't_webhook',
        delivered: [],
        todo: ['Monitoring alerts → incident'],
      },
      {
        id: 't_mobile',
        delivered: [],
        todo: ['Future — native / mobile portal'],
      },
    ],
  },
];

export const CHECKLIST_GROUPS: ChecklistGroup[] = RAW.map((g) => ({
  id: g.id,
  title: g.title,
  accent: g.accent,
  entries: g.items.map((it) => {
    const m = MODULE_BY_ID[it.id];
    if (!m) throw new Error(`checklist.ts references unknown module id: ${it.id}`);
    return {
      id: it.id,
      name: m.name,
      note: m.note,
      status: moduleStatus(m),
      ui: m.ui,
      api: m.api,
      feOnly: m.feOnly,
      delivered: it.delivered,
      todo: it.todo,
    };
  }),
}));

const ALL_ENTRIES = CHECKLIST_GROUPS.flatMap((g) => g.entries);
export const CHECKLIST_OPEN_COUNT = ALL_ENTRIES.reduce((a, e) => a + e.todo.length, 0);
export const CHECKLIST_MODULE_COUNT = ALL_ENTRIES.length;
export const CHECKLIST_WITH_WORK = ALL_ENTRIES.filter((e) => e.todo.length > 0).length;
