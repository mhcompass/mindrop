import { useEffect, useState } from 'react';

import { ArchFlow } from './components/ArchFlow';
import { ClusterFlow } from './components/ClusterFlow';
import { ZoomFlow } from './components/ZoomFlow';
import { AgentsBoard } from './components/AgentsBoard';
import { ChecklistBoard } from './components/ChecklistBoard';
import { PlanBoard } from './components/PlanBoard';
import { ThemeContext, LIGHT, DARK } from './theme';
import { POSTURE_NODES, POSTURE_EDGES } from './model/posture';
import { READINESS_CARDS, READINESS_NODES, READINESS_EDGES } from './model/readiness';
import { MASTER_NODES, MASTER_EDGES } from './model/master';
import { TRACKER_TILES, TRACKER_NODES } from './model/modules';
import { DEPLOY_NODES, DEPLOY_EDGES } from './model/deployment';
import { BUILD_STAMP } from './model/stamp';

type View = 'posture' | 'readiness' | 'master' | 'tracker' | 'clusters' | 'zoom' | 'agents' | 'checklist' | 'plan' | 'deployment';

const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: 'posture', label: 'System Posture', hint: 'End-system view — building components by readiness' },
  { id: 'readiness', label: 'Module Readiness', hint: '✓ / ◐ / ✗ per pillar + target backend shape + build sequence' },
  { id: 'master', label: 'Master Connected Map', hint: 'Surface → fixture → API → module → store, fully connected' },
  { id: 'tracker', label: 'Module Tracker', hint: 'Neutral inventory — every module and where it stands' },
  { id: 'clusters', label: 'Clusters', hint: 'Capability hierarchy — clusters within clusters, with rollup status' },
  { id: 'zoom', label: 'Zoom Map', hint: 'Semantic zoom · overlays · value-stream playback · export' },
  { id: 'agents', label: 'Agents', hint: 'Every AI agent — purpose, tools, and what is implemented vs not' },
  { id: 'checklist', label: 'Checklist', hint: 'Core functionality — delivered vs to deliver / modify' },
  { id: 'plan', label: 'Delivery Plan', hint: 'Delivery scope for 3 engineers — about 2–2.5 weeks' },
  { id: 'deployment', label: 'Deployment', hint: 'Runtime topology — docker stack + sovereign boundary' },
];

const LEGEND: { label: string; light: { bg: string; border: string }; dark: { bg: string; border: string }; dashed?: boolean }[] = [
  { label: 'Live — API-backed', light: { bg: '#d5e8d4', border: '#82b366' }, dark: { bg: '#1c2f1c', border: '#82b366' } },
  { label: 'UI-only — seeded', light: { bg: '#ffe6cc', border: '#d79b00' }, dark: { bg: '#33270f', border: '#d79b00' } },
  { label: 'Demo / voiceover', light: { bg: '#f3e6f9', border: '#9673a6' }, dark: { bg: '#2b2133', border: '#9673a6' } },
  { label: 'To build', light: { bg: '#f8cecc', border: '#b85450' }, dark: { bg: '#331a19', border: '#c46a66' }, dashed: true },
  { label: 'Shared platform work', light: { bg: '#fff2cc', border: '#d6b656' }, dark: { bg: '#332b10', border: '#d6b656' }, dashed: true },
  { label: 'Infra / external', light: { bg: '#ffffff', border: '#6c8ebf' }, dark: { bg: '#16202e', border: '#6c8ebf' } },
];

const THEME_KEY = 'arch-map-theme';

const VIEW_KEY = 'arch-map-view';

export default function App() {
  const [view, setView] = useState<View>(() => {
    // Permalink: #<view> wins, then last-used, then default.
    const hash = window.location.hash.replace('#', '');
    if (VIEWS.some((v) => v.id === hash)) return hash as View;
    const saved = localStorage.getItem(VIEW_KEY) as View | null;
    return saved && VIEWS.some((v) => v.id === saved) ? saved : 'master';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
    if (window.location.hash.replace('#', '') !== view) {
      window.history.replaceState(null, '', `#${view}`);
    }
  }, [view]);

  // Back/forward + shared links update the view.
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (VIEWS.some((v) => v.id === h)) setView(h as View);
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
  const active = VIEWS.find((v) => v.id === view)!;

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.app.bg }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px', borderBottom: `1px solid ${theme.app.headerBorder}`, background: theme.app.headerBg, flexWrap: 'wrap' }}>
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
              <div style={{ fontSize: 16, fontWeight: 850, letterSpacing: -0.3, color: theme.app.title }}>AIOps · Architecture Map</div>
              <div style={{ fontSize: 11, color: theme.app.subtitle }}>{active.hint}</div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            {VIEWS.map((v) => {
              const isActive = view === v.id;
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            {view !== 'tracker' && view !== 'clusters' && view !== 'zoom' && view !== 'agents' && view !== 'checklist' && view !== 'plan' && LEGEND.map((l) => {
              const c = dark ? l.dark : l.light;
              return (
                <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: theme.app.legendText }}>
                  <span style={{ width: 14, height: 10, background: c.bg, border: `1.5px ${l.dashed ? 'dashed' : 'solid'} ${c.border}`, borderRadius: 2, display: 'inline-block' }} />
                  {l.label}
                </span>
              );
            })}
            <span
              title={`Model reconciled with the yc-itsm codebase on ${BUILD_STAMP.date} · ${BUILD_STAMP.scope}`}
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
              as of {BUILD_STAMP.date} · {BUILD_STAMP.profile}
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
        </header>

        {view === 'posture' && (
          <ArchFlow nodes={POSTURE_NODES} edges={POSTURE_EDGES} kinds={['live', 'planned', 'neutral']} />
        )}
        {view === 'readiness' && (
          <ArchFlow nodes={READINESS_NODES} edges={READINESS_EDGES} cards={READINESS_CARDS} kinds={[]} />
        )}
        {view === 'master' && (
          <ArchFlow nodes={MASTER_NODES} edges={MASTER_EDGES} kinds={['live', 'seeded', 'planned', 'neutral']} />
        )}
        {view === 'tracker' && (
          <ArchFlow nodes={TRACKER_NODES} edges={[]} tiles={TRACKER_TILES} kinds={[]} />
        )}
        {view === 'clusters' && <ClusterFlow />}
        {view === 'zoom' && <ZoomFlow />}
        {view === 'agents' && <AgentsBoard />}
        {view === 'checklist' && <ChecklistBoard />}
        {view === 'plan' && <PlanBoard />}
        {view === 'deployment' && (
          <ArchFlow nodes={DEPLOY_NODES} edges={DEPLOY_EDGES} kinds={['live', 'planned']} />
        )}
      </div>
    </ThemeContext.Provider>
  );
}
