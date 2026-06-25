/**
 * Dev-time invariants for a ProjectModel, run at import time (call it from a
 * project's index.ts). Extends the per-file id checks (modules/clusters/agents/
 * checklist) with the cross-section ones those files can't see on their own.
 *
 * Structural contradictions THROW (they break the build, which is the point —
 * bad data should never ship). Softer "the model looks stale" mismatches WARN
 * so legitimate in-between states don't block a build.
 */
import { moduleStatus } from '../model/types';
import type { ProjectModel } from './types';

export function validateProject(model: ProjectModel): ProjectModel {
  const tag = `[project:${model.meta.id}]`;
  const moduleById = model.clusters?.moduleById ?? model.zoom?.moduleById;

  if (model.delivery) {
    const { roadmap, work } = model.delivery;
    const ids = new Set(roadmap.flatMap((p) => p.items.map((d) => d.id)));

    // Every scheduled WORK entry must be a real deliverable (else the timeline
    // schedules a ghost / a renamed-away id silently drops its estimate).
    for (const id of Object.keys(work)) {
      if (!ids.has(id)) throw new Error(`${tag} schedule WORK references unknown deliverable id: ${id}`);
    }

    for (const phase of roadmap) {
      for (const d of phase.items) {
        // A deliverable's linked module must exist.
        if (d.module && moduleById && !moduleById[d.module]) {
          throw new Error(`${tag} roadmap deliverable ${d.id} references unknown module id: ${d.module}`);
        }
        // Done deliverable whose module isn't fully implemented → likely stale.
        if (d.status === 'done' && d.module && moduleById?.[d.module]) {
          const ms = moduleStatus(moduleById[d.module]);
          if (ms !== 'implemented') {
            console.warn(`${tag} deliverable ${d.id} is 'done' but module ${d.module} is '${ms}' — model may be stale`);
          }
        }
      }
    }
  }

  return model;
}
