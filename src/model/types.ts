/**
 * Shared model for all architecture views.
 *
 * Positions are absolute pixels, transcribed 1:1 from the source
 * draw.io file (yc-itsm/docs/architecture/aiops-system-posture.drawio)
 * so the two artifacts stay visually comparable.
 */

/** Readiness / role of a box. Drives fill + border colour. */
export type Status =
  | 'live'      // API-backed today (green)
  | 'seeded'    // UI-only, seeded demo data (amber)
  | 'demo'      // demo / presenter tooling (violet)
  | 'planned'   // to build (red, dashed)
  | 'shared'    // planned shared platform work (amber, dashed)
  | 'infra'     // platform container (blue outline)
  | 'ai'        // AI plane service (violet outline)
  | 'external'  // external system (grey)
  | 'actor'     // person / channel
  | 'note';     // plain text annotation

export type EdgeKind = 'live' | 'seeded' | 'planned' | 'neutral';

export interface ArchNodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  status: Status;
  /** Render as a translucent background zone instead of a box. */
  zone?: boolean;
  /** Dashed border override (e.g. optional externals). */
  dashed?: boolean;
  /** Extra detail shown in the inspector panel on click. */
  detail?: string;
  fontSize?: number;
}

export interface ArchEdgeDef {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
  /** Source handle: t(op) b(ottom) l(eft) r(ight). Default 'b'. */
  sh?: 't' | 'b' | 'l' | 'r';
  /** Target handle. Default 't'. */
  th?: 't' | 'b' | 'l' | 'r';
}

export interface ReadinessRow {
  m: '✓' | '◐' | '✗' | '·';
  t: string;
}

/* ── Module tracker (neutral inventory view) ──────────────────── */

export type PartState = 'done' | 'partial' | 'none';
export type ModuleStatus = 'implemented' | 'partial' | 'ui-only' | 'planned';

export type Effort = 'S' | 'M' | 'L';
export type Sensitivity = 'pii' | 'sensitive' | 'internal' | 'public';

export interface ModuleTileDef {
  id: string;
  name: string;
  /** One-line scope note shown under the name. */
  note?: string;
  /** Frontend implementation state. */
  ui: PartState;
  /** Backend/API implementation state. */
  api: PartState;
  /** Module is frontend-only by design — API column not applicable. */
  feOnly?: boolean;
  /** Infrastructure service — single running/not state carried in `api`;
   *  the UI column is not applicable. */
  infra?: boolean;
  /** External system outside the product boundary (Entra, Graph, …). */
  external?: boolean;
  /** Channel / entry point (portal, phone, email, …). */
  channel?: boolean;

  /* ── Overlay metadata (optional; drives the overlay colour modes) ── */
  /** Owning team / squad. */
  owner?: string;
  /** Build size for to-build work. */
  effort?: Effort;
  /** Load-bearing vs. demo-only / nice-to-have. */
  critical?: boolean;
  /** Data sensitivity of what this module handles/stores. */
  sensitivity?: Sensitivity;
  /** Customer profiles that load this module (omit = all profiles). */
  profiles?: string[];
}

export type AgentStatus = 'ready' | 'partial' | 'planned';

/** An AI agent that mediates a relationship — rides on the edge line. */
export interface EdgeAgentDef {
  name: string;
  status: AgentStatus;
  /** What it does, for the inspector. */
  desc?: string;
  /** Tool names it owns. */
  tools?: string[];
}

/** Directed relation between two modules ("which module relates to what"). */
export interface ModuleEdgeDef {
  id: string;
  source: string;
  target: string;
  label: string;
  /** An AI agent sitting "in between the lines" of this relation. */
  agent?: EdgeAgentDef;
}

export interface PlacedTile extends ModuleTileDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function moduleStatus(m: ModuleTileDef): ModuleStatus {
  if (m.infra || m.external) {
    // Single state carried in `api`: integrated/running vs. not.
    if (m.api === 'done') return 'implemented';
    if (m.api === 'partial') return 'partial';
    return 'planned';
  }
  if (m.feOnly) {
    if (m.ui === 'done') return 'implemented';
    if (m.ui === 'partial') return 'partial';
    return 'planned';
  }
  if (m.ui === 'done' && m.api === 'done') return 'implemented';
  if (m.ui === 'done' && m.api === 'none') return 'ui-only';
  if (m.ui === 'none' && m.api === 'none') return 'planned';
  return 'partial';
}

export interface ReadinessCardDef {
  id: string;
  title: string;
  tone: 'seeded' | 'live' | 'demo' | 'plan';
  x: number;
  y: number;
  w: number;
  h: number;
  rows: ReadinessRow[];
}

/* ════════════════════════════════════════════════════════════════
 * Shared data-shape types
 *
 * These describe the SHAPE of a project's data (not its content), so
 * the generic ProjectModel (src/projects/types.ts) and every concrete
 * project (src/projects/<id>/*) reference one canonical source. Content
 * + derivation + validation live in each project's folder.
 * ════════════════════════════════════════════════════════════════ */

/** Capability domains — the taxonomy shared by the Capabilities board,
 *  the Delivery Plan, and the Roadmap cross-references. A new project that
 *  needs different domains extends this union. */
export const CAPABILITY_DOMAINS = [
  'Service management (ITIL)',
  'Assistant and knowledge',
  'Platform and operations',
  'System integrations',
] as const;
export type CapabilityDomain = (typeof CAPABILITY_DOMAINS)[number];

/* ── Roadmap ──────────────────────────────────────────────────── */

export type DeliverableStatus = 'done' | 'wip' | 'todo';

export interface Deliverable {
  /** Stable id — the key the tracker API persists status/assignee against.
   *  Never reuse or renumber; changing it orphans the saved state. */
  id: string;
  /** The deliverable, phrased as the unit of work that gets checked off. */
  text: string;
  /** Short clarifier — where it stands or why it matters. */
  note?: string;
  status: DeliverableStatus;
  /** Capability domain this advances — cross-ref to the Capabilities board. */
  domain?: CapabilityDomain;
  /** Delivery-plan workstream id (A1, B5, …) — cross-ref to the Delivery Plan. */
  planRef?: string;
  /** Module id in modules.ts — cross-ref to the Module Tracker. */
  module?: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  /** One-line "what should be implemented" for the phase. */
  intent: string;
  items: Deliverable[];
}

/* ── Agents board ─────────────────────────────────────────────── */

export interface AgentCard {
  /** Source edge id. */
  id: string;
  name: string;
  status: AgentStatus;
  /** One-line purpose. */
  purpose: string;
  tools: string[];
  /** Capabilities that are wired today. */
  live: string[];
  /** Capabilities that are still scripted / to build. */
  pending: string[];
  from: { id: string; name: string; status: ModuleStatus };
  to: { id: string; name: string; status: ModuleStatus };
}

/* ── Checklist ────────────────────────────────────────────────── */

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

/* ── Clusters ─────────────────────────────────────────────────── */

export interface ClusterTreeDef {
  id: string;
  name: string;
  /** Accent colour slug for the cluster title strip. */
  accent: string;
  /** Children: nested clusters or module ids (strings → modules.ts). */
  children: Array<ClusterTreeDef | string>;
}

export type ClusterCounts = Record<ModuleStatus, number>;

export interface ClusterEdgeDef {
  id: string;
  source: string;
  target: string;
  label: string;
  /** Handle hints: t(op) b(ottom) l(eft) r(ight). */
  sh?: 't' | 'b' | 'l' | 'r';
  th?: 't' | 'b' | 'l' | 'r';
}

export interface AgentDef {
  id: string;
  name: string;
  desc: string;
  /** Cluster ids this agent works across (≥2). */
  connects: string[];
}

/* ── Database schema (Zoom Map data layer) ────────────────────── */

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

/* ── Deliverable detail (drawer) ──────────────────────────────── */

export interface DeliverableDetail {
  /** What this is and why it matters — one short paragraph. */
  summary: string;
  /** Ordered, concrete implementation steps. */
  steps: string[];
  /** Definition of done — what must be true to close the ticket. */
  acceptance: string[];
  /** Files / areas in the codebase to touch. */
  touchpoints?: string[];
  /** Gotchas, dependencies, or decisions to settle first. */
  notes?: string;
}

/* ── Delivery plan (Capabilities board) ───────────────────────── */

export interface PlanItem {
  /** Development-plan reference (A1, B5, …). */
  ref: string;
  title: string;
  /** Delivery days (build + per-item test). */
  days: number;
  /** Capability domain (matches the Supported-today group names). */
  domain: CapabilityDomain;
}

export interface PlanGroup {
  id: string;
  title: string;
  /** Plain explanation of what this group does and why it matters. */
  summary: string;
  items: PlanItem[];
}

/** Functionality that already works and can be enabled / demonstrated now.
 *  `testing: true` = built in the last few days; needs a final QA pass. */
export interface AvailableItem {
  text: string;
  testing?: boolean;
}
export interface AvailableGroup {
  group: string;
  items: AvailableItem[];
}

/* ── Schedule (roadmap timeline) ──────────────────────────────── */

export interface Bar {
  id: string;
  lane: string;
  start: number; // working-day offset from project start
  end: number;
  days: number;
  phaseIdx: number;
  deps: string[];
}

export interface Schedule {
  bars: Bar[];
  doneIds: string[];
  totalDays: number;
}

/* ── Stories (value-stream playback) ──────────────────────────── */

export interface StoryStep {
  module: string; // module id (z__<id> on the canvas)
  caption: string;
}

export interface StoryDef {
  id: string;
  title: string;
  tone: string; // accent colour
  steps: StoryStep[];
}

/* ── Team ─────────────────────────────────────────────────────── */

export interface Engineer {
  /** Stable id — used as the assignee key in the persisted state. */
  id: string;
  /** Lane label (the capability area). */
  lane: string;
  /** Real engineer name once assigned; falls back to the lane label. */
  person?: string;
  /** Owner squad as recorded in modules.ts. */
  squad: string;
  /** Capability domain this lane owns end-to-end. */
  domain?: CapabilityDomain;
  /** Accent colour for board lanes / chips. */
  color: string;
}
