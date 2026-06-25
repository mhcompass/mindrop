import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import { useProject } from '../project';

export function CapabilitiesBoard() {
  const theme = useTheme();
  const { capabilities } = useProject();
  const { available: PLAN_AVAILABLE, groups: PLAN_GROUPS, timeline: PLAN_TIMELINE } = capabilities!;
  const planMark = theme.dark ? '#60a5fa' : '#2563eb';
  const okMark = theme.card.marks['✓'];

  const todayCount = PLAN_AVAILABLE.reduce((a, g) => a + g.items.length, 0);
  const soonCount = PLAN_GROUPS.reduce((a, g) => a + g.items.length, 0);

  // One combined list per domain: what's available today (✓) followed by
  // what can be added within ~2 weeks (+), in the Supported-today order.
  const allSoon = PLAN_GROUPS.flatMap((g) => g.items);
  const combined = PLAN_AVAILABLE.map((g) => ({
    domain: g.group,
    available: g.items.map((it) => it.text),
    soon: allSoon.filter((it) => it.domain === g.group).map((it) => it.title),
  }));

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.app.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '26px 28px 60px' }}>
        {/* Title + intro */}
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: theme.app.title, margin: '0 0 8px' }}>
          Capabilities
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.card.rowText, margin: '0 0 16px' }}>
          What the platform supports today, and what can be added within {PLAN_TIMELINE} (3 engineers), by domain.
        </p>

        {/* Key / counts */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
          <Chip theme={theme} mark="✓" color={okMark} label={`${todayCount} available today`} />
          <Chip theme={theme} mark="+" color={planMark} label={`${soonCount} possible within ~2 weeks`} />
        </div>

        {/* Combined per-domain list */}
        {combined.map((d) => (
          <div key={d.domain} style={{ marginBottom: 22 }}>
            <H2 theme={theme}>{d.domain}</H2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {d.available.map((text, i) => (
                <Item key={`a${i}`} mark="✓" color={okMark} text={text} theme={theme} />
              ))}
              {d.soon.map((text, i) => (
                <Item key={`s${i}`} mark="+" color={planMark} text={text} theme={theme} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Item({ mark, color, text, theme }: { mark: string; color: string; text: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.45, color: theme.card.rowText }}>
      <span aria-hidden style={{ color, flexShrink: 0, fontWeight: 800 }}>{mark}</span>
      <span style={{ flex: 1 }}>{text}</span>
    </div>
  );
}

function Chip({ theme, mark, color, label }: { theme: ReturnType<typeof useTheme>; mark: string; color: string; label: string }) {
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
      <span aria-hidden style={{ color, fontWeight: 800 }}>{mark}</span>
      {label}
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
