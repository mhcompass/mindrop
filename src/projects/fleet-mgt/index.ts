/**
 * Flexible Fleet — agentic WhatsApp vehicle-booking platform (Sharjah Police).
 * Architecture map: Module Tracker, Clusters, and Deployment, derived from
 * /Users/mherhakobyan/Projects/your-compass/products/fleet_mgt.
 *
 * Add more views (posture, roadmap, …) by authoring their data here and adding
 * the matching section — see src/projects/yc-itsm/ for every section's shape.
 */
import type { ProjectModel } from '../types';
import { validateProject } from '../validate';

import { TRACKER_TILES, TRACKER_NODES, MODULE_BY_ID, MODULE_EDGES } from './modules';
import {
  CLUSTER_TREE, CLUSTER_EDGES, CLUSTER_NAME, AGENTS,
  aggregateCounts, allClusterIds, clusterChain,
} from './clusters';
import { DEPLOY_NODES, DEPLOY_EDGES } from './deployment';
import { POSTURE_NODES, POSTURE_EDGES } from './posture';
import { DB_DOMAINS, DB_TABLE_COUNT, TABLE_BY_ID, TABLE_TO_STATUS } from './dbschema';
import { STORIES } from './stories';

export const model: ProjectModel = validateProject({
  meta: {
    id: 'fleet-mgt',
    name: 'Flexible Fleet',
    brandTitle: 'Mindrop · Flexible Fleet',
    stamp: { date: '2026-06-24', profile: 'sharjah-police', scope: 'Agentic WhatsApp vehicle booking · pilot build' },
  },

  posture: { nodes: POSTURE_NODES, edges: POSTURE_EDGES, kinds: ['live', 'seeded', 'planned'] },
  tracker: { nodes: TRACKER_NODES, edges: [], tiles: TRACKER_TILES, kinds: [] },
  clusters: {
    tree: CLUSTER_TREE, edges: CLUSTER_EDGES, name: CLUSTER_NAME, agents: AGENTS,
    moduleById: MODULE_BY_ID, aggregateCounts, allClusterIds, clusterChain,
  },
  zoom: {
    tree: CLUSTER_TREE, aggregateCounts, moduleById: MODULE_BY_ID, moduleEdges: MODULE_EDGES,
    dbDomains: DB_DOMAINS, dbTableCount: DB_TABLE_COUNT, tableById: TABLE_BY_ID,
    tableToStatus: TABLE_TO_STATUS, stories: STORIES,
  },
  deployment: { nodes: DEPLOY_NODES, edges: DEPLOY_EDGES, kinds: ['live', 'planned'] },
});

export default model;
