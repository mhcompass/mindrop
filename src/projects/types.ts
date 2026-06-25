/**
 * ProjectModel — one project's entire content, aggregated into a single
 * typed object. The app renders the active project's model; a project is
 * added as a new folder under src/projects/<id>/ exporting one of these.
 *
 * Every view-section is OPTIONAL: a project provides only the sections it
 * has, and the tab bar renders only those views (see src/App.tsx). Content,
 * derivation, and validation live in each project's folder; the SHAPES come
 * from the shared src/model/types.ts so this generic type never couples to
 * any one project.
 */
import type {
  ArchNodeDef, ArchEdgeDef, EdgeKind, ReadinessCardDef, PlacedTile, ModuleTileDef,
  ModuleEdgeDef, ModuleStatus, AgentStatus,
  RoadmapPhase, Engineer, CapabilityDomain, DeliverableDetail,
  AgentCard, ChecklistGroup, ClusterTreeDef, ClusterEdgeDef, ClusterCounts, AgentDef,
  DbDomainDef, DbTableDef, TableStatus, StoryDef, PlanGroup, AvailableGroup, Schedule,
} from '../model/types';

export interface ProjectMeta {
  /** URL slug — the project id used in the hash and the tracker API. */
  id: string;
  /** Human label shown in the project switcher. */
  name: string;
  /** Header brand title for this project. */
  brandTitle: string;
  /** Reconciliation stamp shown in the header. */
  stamp: { date: string; profile: string; scope: string };
}

/** An architecture canvas rendered by <ArchFlow> — fields match its props. */
export interface ArchView {
  nodes: ArchNodeDef[];
  edges: ArchEdgeDef[];
  kinds: EdgeKind[];
  cards?: ReadinessCardDef[];
  tiles?: PlacedTile[];
}

export interface ClustersData {
  tree: ClusterTreeDef[];
  edges: ClusterEdgeDef[];
  name: Record<string, string>;
  agents: AgentDef[];
  moduleById: Record<string, ModuleTileDef>;
  aggregateCounts: (def: ClusterTreeDef) => ClusterCounts;
  allClusterIds: (tree?: ClusterTreeDef[]) => string[];
  clusterChain: (id: string) => string[];
}

export interface ZoomData {
  tree: ClusterTreeDef[];
  aggregateCounts: (def: ClusterTreeDef) => ClusterCounts;
  moduleById: Record<string, ModuleTileDef>;
  moduleEdges: ModuleEdgeDef[];
  dbDomains: DbDomainDef[];
  dbTableCount: number;
  tableById: Record<string, DbTableDef & { domain: string; owner: string }>;
  tableToStatus: Record<TableStatus, ModuleStatus>;
  stories: StoryDef[];
}

export interface AgentsData {
  cards: AgentCard[];
  counts: Record<AgentStatus, number>;
  label: Record<AgentStatus, string>;
  order: AgentStatus[];
  pill: Record<AgentStatus, ModuleStatus>;
}

export interface ChecklistData {
  groups: ChecklistGroup[];
  moduleCount: number;
  openCount: number;
  withWork: number;
}

export interface CapabilitiesData {
  available: AvailableGroup[];
  groups: PlanGroup[];
  timeline: string;
}

/** Roadmap, Team Board, and the Detail Drawer all read this one bundle. */
export interface DeliveryData {
  roadmap: RoadmapPhase[];
  roadmapIntro: string;
  engineers: Engineer[];
  engineerById: Record<string, Engineer>;
  unassigned: string;
  defaultEngineerForDomain: (domain?: CapabilityDomain) => string;
  details: Record<string, DeliverableDetail>;
  work: Record<string, { days: number; deps?: string[] }>;
  workDaysPerWeek: number;
  computeSchedule: (laneOf: (id: string) => string, isDone: (id: string) => boolean) => Schedule;
}

export interface ProjectModel {
  meta: ProjectMeta;

  // Architecture canvases (ArchFlow-backed).
  posture?: ArchView;
  readiness?: ArchView;
  master?: ArchView;
  tracker?: ArchView;
  deployment?: ArchView;

  // Bespoke component views.
  clusters?: ClustersData;
  zoom?: ZoomData;
  agents?: AgentsData;
  checklist?: ChecklistData;
  capabilities?: CapabilitiesData;

  // Delivery tracking (roadmap + team board + detail drawer).
  delivery?: DeliveryData;
}
