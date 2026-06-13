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
