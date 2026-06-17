import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import {
  WOW_AXIS_ACCENT,
  WOW_AXIS_LABEL,
  WOW_BUFFER,
  WOW_CAPACITY,
  WOW_COMMITTED,
  WOW_DEFERRED,
  WOW_MOMENTS,
  WOW_TEAM,
  WOW_WEEKS,
  type WowMoment,
} from '../model/wow';

export function WowBoard() {
  const theme = useTheme();
  const pct = Math.min(100, Math.round((WOW_COMMITTED / WOW_CAPACITY) * 100));

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.zoomCanvas }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '22px 24px 56px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 850, letterSpacing: -0.4, color: theme.app.title }}>
            3-Week Wow — what 3 engineers can realistically deliver
          </div>
          <div style={{ fontSize: 13, color: theme.app.subtitle, marginTop: 5, maxWidth: 820, lineHeight: 1.5 }}>
            The agentic ITIL loop running <strong style={{ color: theme.app.title }}>live, on real data, that the
            buyer can drive themselves</strong> — credibility plus the INC→PRB→CHG differentiation. Most of the
            impressive surface already exists; the wow is converting a polished mockup into a provably live,
            agent-driven system.
          </div>

          {/* Capacity bar */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={`${WOW_TEAM.engineers} engineers`} accent="#2563eb" theme={theme} />
            <Chip label={`${WOW_TEAM.weeks} weeks`} accent="#2563eb" theme={theme} />
            <Chip label={`${WOW_CAPACITY} man-day capacity`} accent="#475569" theme={theme} />
            <Chip label={`${WOW_COMMITTED} committed`} accent="#2e7d32" theme={theme} />
            <Chip label={`${WOW_BUFFER} buffer`} accent="#94a3b8" theme={theme} />
          </div>
          <div style={{ marginTop: 10, maxWidth: 520 }}>
            <div style={{ height: 10, borderRadius: 999, background: theme.tile.chipBg, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2e7d32, #16a34a)' }} />
            </div>
            <div style={{ fontSize: 10.5, color: theme.app.subtitle, marginTop: 4 }}>
              {WOW_COMMITTED} of {WOW_CAPACITY} man-days committed · {WOW_BUFFER}-day buffer for integration + demo dry-run
            </div>
          </div>
        </div>

        {/* Moments */}
        <SectionLabel theme={theme}>The wow moments</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16, marginBottom: 26 }}>
          {WOW_MOMENTS.map((m) => (
            <MomentCard key={m.id} moment={m} />
          ))}
        </div>

        {/* Swimlane */}
        <SectionLabel theme={theme}>Three-week plan · 3 parallel streams</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 26 }}>
          {WOW_WEEKS.map((wk) => (
            <div
              key={wk.week}
              style={{ background: theme.tile.bg, border: `1px solid ${theme.tile.border}`, borderRadius: 12, padding: '12px 14px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.app.title }}>Week {wk.week}</span>
                <span style={{ fontSize: 11, fontWeight: 650, color: theme.app.subtitle }}>{wk.theme}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {wk.lanes.map((lane) => (
                  <div key={lane.eng}>
                    <div style={{ fontSize: 10, fontWeight: 750, letterSpacing: 0.2, textTransform: 'uppercase', color: theme.app.subtitle, marginBottom: 3 }}>
                      {lane.eng}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {lane.items.map((it, i) => (
                        <div key={i} style={{ fontSize: 11.5, color: theme.card.rowText, display: 'flex', gap: 6 }}>
                          <span aria-hidden style={{ color: theme.card.marks['·'] }}>•</span>
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Deferred */}
        <SectionLabel theme={theme}>Deliberately deferred — and why it's safe</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12, marginBottom: 24 }}>
          {WOW_DEFERRED.map((d, i) => (
            <div
              key={i}
              style={{ background: theme.tile.bg, border: `1px solid ${theme.tile.border}`, borderRadius: 10, padding: '11px 13px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 750, color: theme.tile.name }}>{d.title}</span>
                {d.stage && (
                  <span style={{ fontSize: 9.5, fontWeight: 750, padding: '2px 7px', borderRadius: 999, background: theme.tile.pill.partial.bg, color: theme.tile.pill.partial.fg, flexShrink: 0 }}>
                    stage on video
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.45, color: theme.tile.note }}>{d.why}</div>
            </div>
          ))}
        </div>

        {/* Critical dependency */}
        <div
          style={{
            background: theme.dark ? '#33200f' : '#fff7ed',
            border: `1px solid ${theme.tile.pill['ui-only'].fg}`,
            borderRadius: 10,
            padding: '12px 15px',
            display: 'flex',
            gap: 10,
          }}
        >
          <span aria-hidden style={{ fontSize: 15 }}>⚠️</span>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: theme.card.rowText }}>
            <strong style={{ color: theme.tile.name }}>Critical dependency:</strong> the agent-driven moments
            (B3, B5, B6, B7) need the air-gapped GB10 LLM endpoint running — it isn't up in the current env. Confirm
            it before committing, or those moments fall back to scripted and the "it's real" thesis weakens.
          </div>
        </div>
      </div>
    </div>
  );
}

function MomentCard({ moment }: { moment: WowMoment }) {
  const theme = useTheme();
  const accent = WOW_AXIS_ACCENT[moment.axis];
  const total = moment.items.reduce((a, it) => a + it.md, 0);

  return (
    <div
      style={{
        background: theme.tile.bg,
        border: `1px solid ${theme.tile.border}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
        padding: '15px 17px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: theme.dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 15.5, fontWeight: 820, color: theme.tile.name, lineHeight: 1.2 }}>{moment.title}</span>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 10, fontWeight: 750, textTransform: 'uppercase', letterSpacing: 0.3, color: accent }}>
            {WOW_AXIS_LABEL[moment.axis]}
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: theme.tile.chipBg, color: theme.card.rowText }}>
            {total} md
          </span>
        </span>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.45, color: theme.tile.name }}>{moment.punchline}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {moment.items.map((it) => (
          <div key={it.ref} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.card.rowText }}>
            <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'ui-monospace, Menlo, monospace', padding: '1px 6px', borderRadius: 5, background: theme.tile.chipBg, color: accent, flexShrink: 0 }}>
              {it.ref}
            </span>
            <span style={{ flex: 1 }}>{it.title}</span>
            <span style={{ fontSize: 11, color: theme.tile.note, flexShrink: 0 }}>{it.md}d</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: theme.tile.note, fontStyle: 'italic', borderTop: `1px dashed ${theme.tile.border}`, paddingTop: 8 }}>
        {moment.whyWow}
      </div>
    </div>
  );
}

function Chip({ label, accent, theme }: { label: string; accent: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999, background: theme.tile.bg, border: `1px solid ${theme.tile.border}`, color: theme.card.rowText }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: accent, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function SectionLabel({ children, theme }: { children: ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.app.subtitle, margin: '4px 2px 12px' }}>
      {children}
    </div>
  );
}
