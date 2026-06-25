/**
 * Tracker API client — talks to the small local state service.
 *
 * Same-origin by default: in the container nginx proxies `/api` → the api
 * service; in `npm run dev` Vite proxies `/api` → the api port. Override
 * with VITE_API_BASE if you point the SPA at a remote tracker.
 */

export type Status = 'done' | 'wip' | 'todo';

/** A persisted override for one deliverable. All fields optional — only what
 *  has been changed from the static roadmap default is stored. */
export interface Override {
  status?: Status;
  assignee?: string;
  ticket?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type OverrideMap = Record<string, Override>;

const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

export async function fetchState(project: string, signal?: AbortSignal): Promise<OverrideMap> {
  const res = await fetch(`${BASE}/${encodeURIComponent(project)}/state`, { signal });
  if (!res.ok) throw new Error(`state ${res.status}`);
  const body = await res.json();
  return (body.overrides ?? {}) as OverrideMap;
}

export async function patchDeliverable(project: string, id: string, patch: Override): Promise<Override> {
  const res = await fetch(`${BASE}/${encodeURIComponent(project)}/deliverable/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`patch ${res.status}`);
  return (await res.json()) as Override;
}
