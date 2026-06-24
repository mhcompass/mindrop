/**
 * Team — the five engineer lanes, sliced by capability area (the same
 * `owner` squads the Module Tracker already uses). Each lane maps to one
 * capability domain so a deliverable's domain gives it a default owner;
 * assignments are then overridable per deliverable and persisted by the
 * tracker API.
 *
 * Put real names in `person` when the engineers are onboarded — nothing
 * else needs to change.
 */

import type { CapabilityDomain } from './plan3';

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

export const UNASSIGNED = 'unassigned';

export const ENGINEERS: Engineer[] = [
  { id: 'eng_itil', lane: 'ITIL Records', squad: 'ITSM Squad', domain: 'Service management (ITIL)', color: '#2563eb' },
  { id: 'eng_platform', lane: 'Platform & Ops', squad: 'Platform Squad', domain: 'Platform and operations', color: '#7c3aed' },
  { id: 'eng_integrations', lane: 'Integrations', squad: 'Integrations Squad', domain: 'System integrations', color: '#0d9488' },
  { id: 'eng_ai', lane: 'Assistant / AI', squad: 'AI Squad', domain: 'Assistant and knowledge', color: '#db2777' },
  { id: 'eng_experience', lane: 'Experience / FE', squad: 'Experience Squad', color: '#d97706' },
];

export const ENGINEER_BY_ID: Record<string, Engineer> = Object.fromEntries(
  ENGINEERS.map((e) => [e.id, e]),
);

/** Default owner for a deliverable from its capability domain. Items with
 *  no domain (presenter / demo layer) fall to the Experience lane. */
export function defaultEngineerForDomain(domain?: CapabilityDomain): string {
  if (!domain) return 'eng_experience';
  const match = ENGINEERS.find((e) => e.domain === domain);
  return match ? match.id : 'eng_experience';
}

/** Display name for a lane — real person when set, else the lane label. */
export function engineerLabel(id: string): string {
  if (id === UNASSIGNED) return 'Unassigned';
  const e = ENGINEER_BY_ID[id];
  if (!e) return id;
  return e.person ? `${e.person} · ${e.lane}` : e.lane;
}
