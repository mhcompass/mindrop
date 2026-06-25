/**
 * Active-project context. App resolves the project from the URL and provides
 * its ProjectModel here; views read their section via useProject() instead of
 * importing a single project's data statically.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { ProjectModel } from './projects/types';

const Ctx = createContext<ProjectModel | null>(null);

export function ProjectProvider({ model, children }: { model: ProjectModel; children: ReactNode }) {
  return <Ctx.Provider value={model}>{children}</Ctx.Provider>;
}

export function useProject(): ProjectModel {
  const m = useContext(Ctx);
  if (!m) throw new Error('useProject must be used within ProjectProvider');
  return m;
}
