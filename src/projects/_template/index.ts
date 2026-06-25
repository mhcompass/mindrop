/**
 * __NAME__ — scaffolded by `npm run new-project __SLUG__`.
 *
 * A project starts with only `meta` (so it shows in the switcher with an empty
 * tab bar). Author each view by creating a data file in this folder and adding
 * its section below — a view's tab appears only once its section is present.
 * Copy the patterns from src/projects/yc-itsm/ (it fills every section).
 *
 * Sections (all optional): posture · readiness · master · tracker · deployment
 * (ArchFlow canvases) · clusters · zoom · agents · checklist · capabilities ·
 * delivery (roadmap + team board + detail drawer).
 */
import type { ProjectModel } from '../types';
import { validateProject } from '../validate';

export const model: ProjectModel = validateProject({
  meta: {
    id: '__SLUG__',
    name: '__NAME__',
    brandTitle: 'Mindrop · __NAME__',
    stamp: { date: 'TODO', profile: 'TODO', scope: 'Scaffolded — no content yet.' },
  },

  // Example — uncomment and point at a local data file once you author it:
  // posture: { nodes: POSTURE_NODES, edges: POSTURE_EDGES, kinds: ['live', 'planned', 'neutral'] },
});

export default model;
