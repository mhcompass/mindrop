/**
 * Project registry — every project the app can show. Adding a project is a
 * new folder under src/projects/<id>/ plus one import line and one entry
 * here (the `npm run new-project` scaffold does this for you via the marker
 * comments). Static imports give full type-checking and run each project's
 * import-time validation at build time.
 */
import type { ProjectModel } from './types';
import ycItsm from './yc-itsm';
import saga from './saga';
import fleetMgt from './fleet-mgt';
/* new-project:imports */

export const PROJECTS: Record<string, ProjectModel> = {
  'yc-itsm': ycItsm,
  'saga': saga,
  'fleet-mgt': fleetMgt,
  /* new-project:entries */
};

export const PROJECT_LIST: { id: string; name: string }[] = Object.values(PROJECTS).map((p) => ({
  id: p.meta.id,
  name: p.meta.name,
}));

export const DEFAULT_PROJECT = 'yc-itsm';

export const getProject = (id: string): ProjectModel | undefined => PROJECTS[id];
