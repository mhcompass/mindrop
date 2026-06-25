/**
 * yc-itsm — the AIOps / yc-itsm architecture & delivery map. Assembles the
 * per-concern data files in this folder into one ProjectModel. The `kinds`
 * arrays carry the edge-legend config each ArchFlow canvas wants (these used
 * to live at the App.tsx call sites).
 */
import type { ProjectModel } from '../types';
import { validateProject } from '../validate';

import { POSTURE_NODES, POSTURE_EDGES } from './posture';
import { READINESS_CARDS, READINESS_NODES, READINESS_EDGES } from './readiness';
import { MASTER_NODES, MASTER_EDGES } from './master';
import { TRACKER_TILES, TRACKER_NODES, MODULE_BY_ID, MODULE_EDGES } from './modules';
import { DEPLOY_NODES, DEPLOY_EDGES } from './deployment';
import {
  CLUSTER_TREE, CLUSTER_EDGES, CLUSTER_NAME, AGENTS,
  aggregateCounts, allClusterIds, clusterChain,
} from './clusters';
import { DB_DOMAINS, DB_TABLE_COUNT, TABLE_BY_ID, TABLE_TO_STATUS } from './dbschema';
import { STORIES } from './stories';
import {
  AGENT_CARDS, AGENT_COUNTS, AGENT_STATUS_LABEL, AGENT_STATUS_ORDER, AGENT_STATUS_PILL,
} from './agents';
import {
  CHECKLIST_GROUPS, CHECKLIST_MODULE_COUNT, CHECKLIST_OPEN_COUNT, CHECKLIST_WITH_WORK,
} from './checklist';
import { PLAN_AVAILABLE, PLAN_GROUPS, PLAN_TIMELINE } from './plan3';
import { ROADMAP, ROADMAP_INTRO } from './roadmap';
import { ENGINEERS, ENGINEER_BY_ID, UNASSIGNED, defaultEngineerForDomain } from './team';
import { DETAILS } from './details';
import { WORK, WORK_DAYS_PER_WEEK, computeSchedule } from './schedule';
import { BUILD_STAMP } from './stamp';

export const model: ProjectModel = validateProject({
  meta: {
    id: 'yc-itsm',
    name: 'YC ITSM',
    brandTitle: 'Mindrop · Architecture Map',
    stamp: BUILD_STAMP,
  },

  posture: { nodes: POSTURE_NODES, edges: POSTURE_EDGES, kinds: ['live', 'planned', 'neutral'] },
  readiness: { nodes: READINESS_NODES, edges: READINESS_EDGES, cards: READINESS_CARDS, kinds: [] },
  master: { nodes: MASTER_NODES, edges: MASTER_EDGES, kinds: ['live', 'seeded', 'planned', 'neutral'] },
  tracker: { nodes: TRACKER_NODES, edges: [], tiles: TRACKER_TILES, kinds: [] },
  deployment: { nodes: DEPLOY_NODES, edges: DEPLOY_EDGES, kinds: ['live', 'planned'] },

  clusters: {
    tree: CLUSTER_TREE, edges: CLUSTER_EDGES, name: CLUSTER_NAME, agents: AGENTS,
    moduleById: MODULE_BY_ID, aggregateCounts, allClusterIds, clusterChain,
  },
  zoom: {
    tree: CLUSTER_TREE, aggregateCounts, moduleById: MODULE_BY_ID, moduleEdges: MODULE_EDGES,
    dbDomains: DB_DOMAINS, dbTableCount: DB_TABLE_COUNT, tableById: TABLE_BY_ID,
    tableToStatus: TABLE_TO_STATUS, stories: STORIES,
  },
  agents: {
    cards: AGENT_CARDS, counts: AGENT_COUNTS, label: AGENT_STATUS_LABEL,
    order: AGENT_STATUS_ORDER, pill: AGENT_STATUS_PILL,
  },
  checklist: {
    groups: CHECKLIST_GROUPS, moduleCount: CHECKLIST_MODULE_COUNT,
    openCount: CHECKLIST_OPEN_COUNT, withWork: CHECKLIST_WITH_WORK,
  },
  capabilities: { available: PLAN_AVAILABLE, groups: PLAN_GROUPS, timeline: PLAN_TIMELINE },

  delivery: {
    roadmap: ROADMAP, roadmapIntro: ROADMAP_INTRO,
    engineers: ENGINEERS, engineerById: ENGINEER_BY_ID, unassigned: UNASSIGNED,
    defaultEngineerForDomain, details: DETAILS, work: WORK,
    workDaysPerWeek: WORK_DAYS_PER_WEEK, computeSchedule,
  },
});

export default model;
