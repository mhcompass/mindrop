import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import { PLAN_AVAILABLE, PLAN_GROUPS, PLAN_TIMELINE } from '../model/plan3';

export function CapabilitiesBoard() {
  const theme = useTheme();
  const todayCount = PLAN_AVAILABLE.reduce((a, g) => a + g.items.length, 0);
  const soonCount = PLAN_GROUPS.reduce((a, g) => a + g.items.length, 0);
  const planMark = theme.dark ? '#60a5fa' : '#2563eb';

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '26px 28px 60px' }}>
        {/* Title + intro */}
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 8px' }}>
          Capabilities
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 16px' }}>
          What the platform supports today, and what can be added within {PLAN_TIMELINE} (3 engineers).
        </p>

        {/* Count chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
          <Chip theme={theme} accent={theme.card.marks['✓']} label={`${todayCount} supported today`} />
          <Chip theme={theme} accent={planMark} label={`${soonCount} addable within ~2 weeks`} />
        </div>

        {/* Supported today */}
        <H2 theme={theme}>Supported today</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 14px' }}>
          Already working and can be enabled or demonstrated now. Items marked <TestingPill theme={theme} /> were built
          in the last few days and need a short final test pass.
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

        <div style={{ height: 14 }} />

        {/* Possible within ~2 weeks */}
        <H2 theme={theme}>Possible within about 2 weeks</H2>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 16px' }}>
          With 3 engineers over {PLAN_TIMELINE}, the following capabilities can be added and then enabled the same way
          as the list above.
        </p>
        {PLAN_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 750, color: theme.app.title, marginBottom: 3 }}>{group.title}</div>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: theme.tile.note, margin: '0 0 8px' }}>{group.summary}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {group.items.map((it) => (
                <div key={it.ref} style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.45, color: theme.card.rowText }}>
                  <span aria-hidden style={{ color: planMark, flexShrink: 0, fontWeight: 800 }}>+</span>
                  <span style={{ flex: 1 }}>{it.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ theme, accent, label }: { theme: ReturnType<typeof useTheme>; accent: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 12,
        fontWeight: 700,
        padding: '6px 12px',
        borderRadius: 999,
        background: theme.tile.bg,
        border: `1px solid ${theme.tile.border}`,
        color: theme.card.rowText,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: accent, flexShrink: 0 }} />
      {label}
    </span>
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
