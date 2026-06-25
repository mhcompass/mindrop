import { useEffect, useRef, useState } from 'react';

import { ArchFlow } from './components/ArchFlow';
import { ClusterFlow } from './components/ClusterFlow';
import { ZoomFlow } from './components/ZoomFlow';
import { AgentsBoard } from './components/AgentsBoard';
import { ChecklistBoard } from './components/ChecklistBoard';
import { CapabilitiesBoard } from './components/CapabilitiesBoard';
import { RoadmapBoard } from './components/RoadmapBoard';
import { TeamBoard } from './components/TeamBoard';
import { DetailDrawer } from './components/DetailDrawer';
import { TeamStateProvider } from './state';
import { ThemeContext, LIGHT, DARK } from './theme';
import { ProjectProvider } from './project';
import { getProject, DEFAULT_PROJECT, PROJECT_LIST } from './projects/registry';
import type { ProjectModel } from './projects/types';

type View = 'posture' | 'readiness' | 'master' | 'tracker' | 'clusters' | 'zoom' | 'agents' | 'checklist' | 'capabilities' | 'roadmap' | 'board' | 'deployment';

type Group = 'delivery' | 'architecture' | 'ops';

const GROUPS: { id: Group; label: string }[] = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'ops', label: 'Ops' },
];

const VIEWS: { id: View; label: string; hint: string; group: Group }[] = [
  // Delivery — the daily drivers: plan, assign, track.
  { id: 'roadmap', label: 'Roadmap', hint: 'What is left to build, in delivery order — a checklist per phase', group: 'delivery' },
  { id: 'board', label: 'Team Board', hint: 'Roadmap split across the five engineer lanes — live status', group: 'delivery' },
  { id: 'checklist', label: 'Checklist', hint: 'Core functionality — delivered vs to deliver / modify', group: 'delivery' },
  { id: 'capabilities', label: 'Capabilities', hint: 'What we support today and what is possible within ~2 weeks', group: 'delivery' },
  // Architecture — the system maps: understand what exists and how it connects.
  { id: 'readiness', label: 'Module Readiness', hint: '✓ / ◐ / ✗ per pillar + target backend shape + build sequence', group: 'architecture' },
  { id: 'tracker', label: 'Module Tracker', hint: 'Neutral inventory — every module and where it stands', group: 'architecture' },
  { id: 'zoom', label: 'Zoom Map', hint: 'Semantic zoom · overlays · value-stream playback · export', group: 'architecture' },
  { id: 'clusters', label: 'Clusters', hint: 'Capability hierarchy — clusters within clusters, with rollup status', group: 'architecture' },
  { id: 'master', label: 'Master Connected Map', hint: 'Surface → fixture → API → module → store, fully connected', group: 'architecture' },
  { id: 'posture', label: 'System Posture', hint: 'End-system view — building components by readiness', group: 'architecture' },
  { id: 'agents', label: 'Agents', hint: 'Every AI agent — purpose, tools, and what is implemented vs not', group: 'architecture' },
  // Ops — runtime / deployment.
  { id: 'deployment', label: 'Deployment', hint: 'Runtime topology — docker stack + sovereign boundary', group: 'ops' },
];

/** Views that render an ArchFlow canvas and want the colour legend shown. */
const LEGEND_VIEWS = new Set<View>(['posture', 'readiness', 'master', 'deployment']);

/** Which ProjectModel section gates each view — a view's tab renders only when
 *  the active project provides that section. Roadmap + Team Board share the
 *  single `delivery` bundle. */
const SECTION_OF: Record<View, keyof ProjectModel> = {
  posture: 'posture', readiness: 'readiness', master: 'master', tracker: 'tracker', deployment: 'deployment',
  clusters: 'clusters', zoom: 'zoom', agents: 'agents', checklist: 'checklist', capabilities: 'capabilities',
  roadmap: 'delivery', board: 'delivery',
};

const groupOf = (v: View): Group => VIEWS.find((x) => x.id === v)!.group;

/** Views the given project actually provides, in canonical order. */
const viewsFor = (m: ProjectModel) => VIEWS.filter((v) => m[SECTION_OF[v.id]] != null);

/** Parse the hash into { project?, view? }. `#<project>/<view>`; a bare
 *  `#<view>` (no slash) is treated as a view under the default project. */
function parseHash(): { project?: string; view?: string } {
  const h = window.location.hash.replace(/^#/, '');
  if (!h) return {};
  const slash = h.indexOf('/');
  if (slash === -1) return { view: h };
  return { project: h.slice(0, slash), view: h.slice(slash + 1) };
}

const PROJECT_KEY = 'arch-map-project';
const viewKeyFor = (pid: string) => `arch-map-view:${pid}`;

const LEGEND: { label: string; light: { bg: string; border: string }; dark: { bg: string; border: string }; dashed?: boolean }[] = [
  { label: 'Live — API-backed', light: { bg: '#d5e8d4', border: '#82b366' }, dark: { bg: '#1c2f1c', border: '#82b366' } },
  { label: 'UI-only — seeded', light: { bg: '#ffe6cc', border: '#d79b00' }, dark: { bg: '#33270f', border: '#d79b00' } },
  { label: 'Demo / voiceover', light: { bg: '#f3e6f9', border: '#9673a6' }, dark: { bg: '#2b2133', border: '#9673a6' } },
  { label: 'To build', light: { bg: '#f8cecc', border: '#b85450' }, dark: { bg: '#331a19', border: '#c46a66' }, dashed: true },
  { label: 'Shared platform work', light: { bg: '#fff2cc', border: '#d6b656' }, dark: { bg: '#332b10', border: '#d6b656' }, dashed: true },
  { label: 'Infra / external', light: { bg: '#ffffff', border: '#6c8ebf' }, dark: { bg: '#16202e', border: '#6c8ebf' } },
];

const THEME_KEY = 'arch-map-theme';

export default function App() {
  const [projectId, setProjectId] = useState<string>(() => {
    const { project } = parseHash();
    if (project && getProject(project)) return project;
    const saved = localStorage.getItem(PROJECT_KEY);
    if (saved && getProject(saved)) return saved;
    return DEFAULT_PROJECT;
  });

  const model = getProject(projectId) ?? getProject(DEFAULT_PROJECT)!;
  const availableViews = viewsFor(model);

  const [view, setView] = useState<View>(() => {
    const { view: hv } = parseHash();
    if (hv && availableViews.some((v) => v.id === hv)) return hv as View;
    const saved = localStorage.getItem(viewKeyFor(projectId)) as View | null;
    if (saved && availableViews.some((v) => v.id === saved)) return saved;
    return availableViews[0]?.id ?? 'roadmap';
  });

  // Clamp the view if the active project doesn't provide it (e.g. after a switch).
  useEffect(() => {
    if (!availableViews.some((v) => v.id === view)) setView(availableViews[0]?.id ?? 'roadmap');
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist + reflect the active project/view in the hash (#<project>/<view>).
  useEffect(() => {
    localStorage.setItem(PROJECT_KEY, projectId);
    localStorage.setItem(viewKeyFor(projectId), view);
    const target = `#${projectId}/${view}`;
    if (window.location.hash !== target) window.history.replaceState(null, '', target);
  }, [projectId, view]);

  // Back/forward + shared links update project + view.
  useEffect(() => {
    const onHash = () => {
      const { project, view: hv } = parseHash();
      const pid = project && getProject(project) ? project : DEFAULT_PROJECT;
      const m = getProject(pid)!;
      const avail = viewsFor(m);
      setProjectId(pid);
      if (hv && avail.some((v) => v.id === hv)) setView(hv as View);
      else setView(avail[0]?.id ?? 'roadmap');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    document.body.style.background = dark ? DARK.app.bg : LIGHT.app.bg;
  }, [dark]);

  const theme = dark ? DARK : LIGHT;
  // Render the resolved view (clamped above); guard against a stale value
  // during the render before the clamp effect runs.
  const safeView = availableViews.some((v) => v.id === view) ? view : (availableViews[0]?.id ?? view);
  const active = availableViews.find((v) => v.id === safeView) ?? availableViews[0];
  const activeGroup = groupOf(safeView);

  // Groups that have at least one view in this project.
  const groups = GROUPS.filter((g) => availableViews.some((v) => v.group === g.id));
  const firstInGroup = (g: Group): View =>
    availableViews.find((v) => v.group === g)?.id ?? availableViews[0]?.id ?? safeView;

  // Remember the last view visited in each group so switching groups returns
  // you to where you were, not always the group's first view.
  const lastByGroup = useRef<Partial<Record<Group, View>>>({});
  useEffect(() => {
    lastByGroup.current[activeGroup] = safeView;
  }, [safeView, activeGroup]);

  const selectGroup = (g: Group) => {
    if (g === activeGroup) return;
    const last = lastByGroup.current[g];
    setView(last && availableViews.some((v) => v.id === last) ? last : firstInGroup(g));
  };

  const selectProject = (pid: string) => {
    if (pid === projectId || !getProject(pid)) return;
    const m = getProject(pid)!;
    const avail = viewsFor(m);
    const last = localStorage.getItem(viewKeyFor(pid)) as View | null;
    setProjectId(pid);
    setView(last && avail.some((v) => v.id === last) ? last : (avail[0]?.id ?? 'roadmap'));
  };

  return (
    <ProjectProvider model={model}>
    <ThemeContext.Provider value={theme}>
      <TeamStateProvider key={model.meta.id}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.app.bg }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 18px', borderBottom: `1px solid ${theme.app.headerBorder}`, background: theme.app.headerBg }}>
          {/* Tier 1 — brand · group tabs · controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                aria-hidden
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                  boxShadow: '0 2px 8px rgba(79,70,229,0.45)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 850, letterSpacing: -0.3, color: theme.app.title }}>{model.meta.brandTitle}</div>
                <div style={{ fontSize: 11, color: theme.app.subtitle }}>{active?.hint}</div>
              </div>
            </div>

            {/* Group tabs — underline style, distinct from the rounded view pills. */}
            <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
              {groups.map((g) => {
                const isActive = activeGroup === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => selectGroup(g.id)}
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 800 : 650,
                      padding: '6px 14px 7px',
                      borderRadius: 0,
                      cursor: 'pointer',
                      border: 'none',
                      borderBottom: `2.5px solid ${isActive ? '#7c3aed' : 'transparent'}`,
                      background: 'transparent',
                      color: isActive ? theme.app.title : theme.app.subtitle,
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {PROJECT_LIST.length > 1 && (
                <select
                  value={projectId}
                  onChange={(e) => selectProject(e.target.value)}
                  title="Switch project"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    border: `1.5px solid ${theme.app.tabBorder}`,
                    background: theme.app.tabBg,
                    color: theme.app.tabText,
                  }}
                >
                  {PROJECT_LIST.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <span
                title={`Model reconciled with the yc-itsm codebase on ${model.meta.stamp.date} · ${model.meta.stamp.scope}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: `1px solid ${theme.app.tabBorder}`,
                  background: theme.app.tabBg,
                  color: theme.app.subtitle,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: '#82b366', flexShrink: 0 }} />
                as of {model.meta.stamp.date} · {model.meta.stamp.profile}
              </span>
              <button
                onClick={() => setDark((d) => !d)}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                  fontSize: 13,
                  lineHeight: 1,
                  padding: '6px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: `1.5px solid ${theme.app.tabBorder}`,
                  background: theme.app.tabBg,
                  color: theme.app.tabText,
                }}
              >
                {dark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Tier 2 — views in the active group · legend (map views only) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <nav style={{ display: 'flex', gap: 6 }}>
              {availableViews.filter((v) => v.group === activeGroup).map((v) => {
                const isActive = safeView === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 600,
                      padding: '6px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      border: isActive ? '1.5px solid transparent' : `1.5px solid ${theme.app.tabBorder}`,
                      background: isActive ? 'linear-gradient(135deg, #2563eb, #6d28d9)' : theme.app.tabBg,
                      color: isActive ? '#ffffff' : theme.app.tabText,
                      boxShadow: isActive ? '0 2px 10px rgba(79,70,229,0.4)' : 'none',
                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </nav>

            {LEGEND_VIEWS.has(safeView) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
                {LEGEND.map((l) => {
                  const c = dark ? l.dark : l.light;
                  return (
                    <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: theme.app.legendText }}>
                      <span style={{ width: 14, height: 10, background: c.bg, border: `1.5px ${l.dashed ? 'dashed' : 'solid'} ${c.border}`, borderRadius: 2, display: 'inline-block' }} />
                      {l.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {safeView === 'posture' && model.posture && (
          <ArchFlow nodes={model.posture.nodes} edges={model.posture.edges} kinds={model.posture.kinds} />
        )}
        {safeView === 'readiness' && model.readiness && (
          <ArchFlow nodes={model.readiness.nodes} edges={model.readiness.edges} cards={model.readiness.cards} kinds={model.readiness.kinds} />
        )}
        {safeView === 'master' && model.master && (
          <ArchFlow nodes={model.master.nodes} edges={model.master.edges} kinds={model.master.kinds} />
        )}
        {safeView === 'tracker' && model.tracker && (
          <ArchFlow nodes={model.tracker.nodes} edges={model.tracker.edges} tiles={model.tracker.tiles} kinds={model.tracker.kinds} />
        )}
        {safeView === 'clusters' && model.clusters && <ClusterFlow />}
        {safeView === 'zoom' && model.zoom && <ZoomFlow />}
        {safeView === 'agents' && model.agents && <AgentsBoard />}
        {safeView === 'checklist' && model.checklist && <ChecklistBoard />}
        {safeView === 'capabilities' && model.capabilities && <CapabilitiesBoard />}
        {safeView === 'roadmap' && model.delivery && <RoadmapBoard />}
        {safeView === 'board' && model.delivery && <TeamBoard />}
        {safeView === 'deployment' && model.deployment && (
          <ArchFlow nodes={model.deployment.nodes} edges={model.deployment.edges} kinds={model.deployment.kinds} />
        )}
        {availableViews.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: theme.app.subtitle }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.app.title, marginBottom: 6 }}>No views yet</div>
              <div style={{ fontSize: 13, maxWidth: 460, lineHeight: 1.5 }}>
                <strong>{model.meta.name}</strong> has no sections. Add data + a section to
                <code style={{ margin: '0 4px' }}>src/projects/{model.meta.id}/index.ts</code>
                (see <code>yc-itsm</code>) to light up its views.
              </div>
            </div>
          </div>
        )}
      </div>
      {model.delivery && <DetailDrawer />}
      </TeamStateProvider>
    </ThemeContext.Provider>
    </ProjectProvider>
  );
}
