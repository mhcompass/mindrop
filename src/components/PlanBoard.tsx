import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import {
  PLAN_AVAILABLE,
  PLAN_BUFFER,
  PLAN_COMMITTED,
  PLAN_DAYS_PER_ENGINEER,
  PLAN_EFFORT,
  PLAN_GROUPS,
  PLAN_TEAM,
  PLAN_TIMELINE,
  type PlanGroup,
} from '../model/plan3';

export function PlanBoard() {
  const theme = useTheme();

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '26px 28px 60px' }}>
        {/* Title + overview */}
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 8px' }}>
          Delivery plan — 3 engineers, about 2–2.5 weeks
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 22px' }}>
          The system already provides the functionality listed below today. The goal of this work is to make the demo
          run on the live system rather than a scripted front-end story, and to complete the automation that links an
          incident through to a scheduled change.
        </p>

        {/* Available today */}
        <H2 theme={theme}>Available today (can be enabled now)</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 14px' }}>
          These already work and can be switched on or demonstrated immediately, before any of the delivery work
          below. Items marked <TestingPill theme={theme} /> were built in the last few days and need a short final
          test pass before they are demo-ready.
        </p>
        {PLAN_AVAILABLE.map((group) => (
          <div key={group.group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 750, color: theme.app.title, marginBottom: 7 }}>{group.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {group.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.45, color: theme.card.rowText }}>
                  <span aria-hidden style={{ color: theme.card.marks['✓'], flexShrink: 0, fontWeight: 800 }}>✓</span>
                  <span style={{ flex: 1 }}>
                    {it.text}
                    {it.testing && <TestingPill theme={theme} />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ height: 12 }} />

        {/* The plan at a glance */}
        <H2 theme={theme}>The plan at a glance</H2>
        <div style={{ border: `1px solid ${theme.tile.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 22 }}>
          <Row theme={theme} label="Team" value={`${PLAN_TEAM.engineers} engineers`} first />
          <Row
            theme={theme}
            label="Effort"
            value={`${PLAN_EFFORT} person-days (${PLAN_COMMITTED} days of work + ${PLAN_BUFFER} days buffer for integration and a demo run-through)`}
          />
          <Row
            theme={theme}
            label="Timeline"
            value={`${PLAN_TIMELINE} (about ${PLAN_DAYS_PER_ENGINEER} working days per engineer)`}
          />
        </div>

        {/* What we'll deliver */}
        <H2 theme={theme}>What this work adds (can then be enabled)</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 16px' }}>
          Each of these becomes a functionality you can switch on, the same way as the list above. Day estimates are
          shown on the right.
        </p>
        {PLAN_GROUPS.map((g) => (
          <Group key={g.id} group={g} />
        ))}

      </div>
    </div>
  );
}

function Group({ group }: { group: PlanGroup }) {
  const theme = useTheme();
  const total = group.items.reduce((a, it) => a + it.days, 0);
  const planMark = theme.dark ? '#60a5fa' : '#2563eb';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 750, color: theme.app.title }}>{group.title}</div>
        <span style={{ fontSize: 12, fontWeight: 650, color: theme.tile.note, flexShrink: 0 }}>{total} days</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 8px' }}>{group.summary}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {group.items.map((it) => (
          <div key={it.ref} style={{ display: 'flex', alignItems: 'baseline', gap: 9, fontSize: 12.5, lineHeight: 1.45, color: theme.card.rowText }}>
            <span aria-hidden style={{ color: planMark, flexShrink: 0, fontWeight: 800 }}>+</span>
            <span style={{ flex: 1 }}>{it.title}</span>
            <span style={{ fontSize: 11.5, color: theme.tile.note, flexShrink: 0 }}>{it.days}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestingPill({ theme }: { theme: ReturnType<typeof useTheme> }) {
  const c = theme.tile.pill['ui-only'];
  return (
    <span
      style={{
        marginLeft: 7,
        fontSize: 9.5,
        fontWeight: 750,
        padding: '1px 6px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
      }}
    >
      final testing
    </span>
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
