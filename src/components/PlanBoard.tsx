import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import {
  PLAN_BUFFER,
  PLAN_CAPACITY,
  PLAN_COMMITTED,
  PLAN_DEFERRED,
  PLAN_DEPENDENCY,
  PLAN_GROUPS,
  PLAN_TEAM,
  PLAN_WEEKS,
  type PlanGroup,
} from '../model/plan3';

export function PlanBoard() {
  const theme = useTheme();

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '26px 28px 60px' }}>
        {/* Title + overview */}
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 8px' }}>
          Three-week delivery plan — 3 engineers
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 16px' }}>
          The goal for these three weeks is to make the demo run on the live system rather than a scripted front-end
          story, and to complete the automation that links an incident through to a scheduled change. Most of the
          screens already exist; this work connects them to real data and the assistant.
        </p>

        {/* At a glance */}
        <div style={{ border: `1px solid ${theme.tile.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 26 }}>
          <Row theme={theme} label="Team" value={`${PLAN_TEAM.engineers} engineers`} first />
          <Row theme={theme} label="Duration" value={`${PLAN_TEAM.weeks} weeks`} />
          <Row
            theme={theme}
            label="Available time"
            value={`about ${PLAN_CAPACITY} working days (3 people × 15 days, allowing for meetings and review)`}
          />
          <Row theme={theme} label="Planned work" value={`${PLAN_COMMITTED} days`} />
          <Row theme={theme} label="Reserved buffer" value={`${PLAN_BUFFER} days (integration + a demo run-through)`} />
        </div>

        {/* What we'll deliver */}
        <H2 theme={theme}>What we will deliver</H2>
        {PLAN_GROUPS.map((g, i) => (
          <Group key={g.id} group={g} index={i + 1} />
        ))}

        {/* Week by week */}
        <H2 theme={theme}>Week by week</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 14px' }}>
          The three engineers work in parallel streams. Each week ends with something that can be shown.
        </p>
        {PLAN_WEEKS.map((wk) => (
          <div key={wk.week} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 750, color: theme.app.title, marginBottom: 7 }}>
              Week {wk.week}: {wk.theme}
            </div>
            <div style={{ border: `1px solid ${theme.tile.border}`, borderRadius: 10, overflow: 'hidden' }}>
              {wk.lanes.map((lane, i) => (
                <div
                  key={lane.eng}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '9px 14px',
                    borderTop: i === 0 ? 'none' : `1px solid ${theme.tile.border}`,
                    background: theme.tile.bg,
                  }}
                >
                  <div style={{ flex: '0 0 190px', fontSize: 12, fontWeight: 700, color: theme.card.rowText }}>
                    {lane.eng}
                  </div>
                  <div style={{ flex: 1, fontSize: 12.5, color: theme.card.rowText }}>{lane.items.join(' · ')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Not included */}
        <H2 theme={theme}>Not included in these three weeks</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 12px' }}>
          These are deliberately left out to keep the scope realistic. None of them block the demo.
        </p>
        {PLAN_DEFERRED.map((d, i) => (
          <div key={i} style={{ marginBottom: 11 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.tile.name, marginBottom: 2 }}>{d.title}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: theme.tile.note }}>{d.why}</div>
          </div>
        ))}

        {/* Dependency */}
        <H2 theme={theme}>One dependency to confirm first</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: theme.card.rowText, margin: 0 }}>{PLAN_DEPENDENCY}</p>
      </div>
    </div>
  );
}

function Group({ group, index }: { group: PlanGroup; index: number }) {
  const theme = useTheme();
  const total = group.items.reduce((a, it) => a + it.days, 0);
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
        <h3 style={{ fontSize: 15, fontWeight: 750, color: theme.app.title, margin: 0 }}>
          {index}. {group.title}
        </h3>
        <span style={{ fontSize: 12, fontWeight: 650, color: theme.tile.note, flexShrink: 0 }}>{total} days</span>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 9px' }}>{group.summary}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 2 }}>
        {group.items.map((it) => (
          <div key={it.ref} style={{ display: 'flex', alignItems: 'baseline', gap: 9, fontSize: 12.5, color: theme.card.rowText }}>
            <span aria-hidden style={{ color: theme.tile.note, flexShrink: 0 }}>•</span>
            <span style={{ flex: 1 }}>{it.title}</span>
            <span style={{ fontSize: 11.5, color: theme.tile.note, flexShrink: 0 }}>{it.days}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ theme, label, value, first }: { theme: ReturnType<typeof useTheme>; label: string; value: string; first?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: '9px 14px',
        borderTop: first ? 'none' : `1px solid ${theme.tile.border}`,
        background: theme.tile.bg,
      }}
    >
      <div style={{ flex: '0 0 130px', fontSize: 12.5, fontWeight: 700, color: theme.app.title }}>{label}</div>
      <div style={{ flex: 1, fontSize: 12.5, color: theme.card.rowText }}>{value}</div>
    </div>
  );
}

function H2({ children, theme }: { children: ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <h2
      style={{
        fontSize: 16,
        fontWeight: 800,
        color: theme.app.title,
        margin: '6px 0 12px',
        paddingBottom: 6,
        borderBottom: `2px solid ${theme.tile.border}`,
      }}
    >
      {children}
    </h2>
  );
}
