import { useState } from 'react';

import { useTheme } from '../theme';
import type { AgentStatus, ModuleStatus } from '../model/types';
import {
  AGENT_CARDS,
  AGENT_COUNTS,
  AGENT_STATUS_LABEL,
  AGENT_STATUS_ORDER,
  AGENT_STATUS_PILL,
  type AgentCard,
} from '../model/agents';

const STATUS_DOT: Record<ModuleStatus, string> = {
  implemented: '#82b366',
  partial: '#d6b656',
  'ui-only': '#d79b00',
  planned: '#b85450',
};

type Filter = AgentStatus | 'all';

export function AgentsBoard() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const ordered = [...AGENT_CARDS].sort(
    (a, b) => AGENT_STATUS_ORDER.indexOf(a.status) - AGENT_STATUS_ORDER.indexOf(b.status),
  );
  const shown = filter === 'all' ? ordered : ordered.filter((c) => c.status === filter);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All agents', count: AGENT_CARDS.length },
    { key: 'ready', label: AGENT_STATUS_LABEL.ready, count: AGENT_COUNTS.ready },
    { key: 'partial', label: AGENT_STATUS_LABEL.partial, count: AGENT_COUNTS.partial },
    { key: 'planned', label: AGENT_STATUS_LABEL.planned, count: AGENT_COUNTS.planned },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.zoomCanvas }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '22px 24px 56px' }}>
        {/* Intro + filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 850, letterSpacing: -0.3, color: theme.app.title }}>
              AI Agents — purpose & readiness
            </div>
            <div style={{ fontSize: 12.5, color: theme.app.subtitle, marginTop: 3, maxWidth: 720 }}>
              Every Compass agent on the map, with what it does, the tools it owns, and which parts are wired today
              versus still scripted or to build.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {filters.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? 750 : 600,
                    padding: '6px 13px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    border: isActive ? '1.5px solid transparent' : `1.5px solid ${theme.app.tabBorder}`,
                    background: isActive ? 'linear-gradient(135deg, #2563eb, #6d28d9)' : theme.app.tabBg,
                    color: isActive ? '#ffffff' : theme.app.tabText,
                  }}
                >
                  {f.label} <span style={{ opacity: 0.7 }}>· {f.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {shown.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ card }: { card: AgentCard }) {
  const theme = useTheme();
  const pill = theme.tile.pill[AGENT_STATUS_PILL[card.status]];

  return (
    <div
      style={{
        background: theme.tile.bg,
        border: `1px solid ${theme.tile.border}`,
        borderTop: `3px solid ${pill.fg}`,
        borderRadius: 12,
        padding: '14px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        boxShadow: theme.dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span aria-hidden style={{ fontSize: 15 }}>🤖</span>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.tile.name, lineHeight: 1.2 }}>{card.name}</span>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 10.5,
            fontWeight: 750,
            padding: '3px 9px',
            borderRadius: 999,
            background: pill.bg,
            color: pill.fg,
          }}
        >
          {AGENT_STATUS_LABEL[card.status]}
        </span>
      </div>

      {/* Purpose */}
      {card.purpose && (
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: theme.tile.note }}>{card.purpose}</div>
      )}

      {/* Bridges (which modules it mediates) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: theme.card.rowText, flexWrap: 'wrap' }}>
        <ModuleChip name={card.from.name} status={card.from.status} />
        <span style={{ color: theme.tile.note }}>→</span>
        <ModuleChip name={card.to.name} status={card.to.status} />
      </div>

      {/* Tools */}
      {card.tools.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {card.tools.map((tool) => (
            <span
              key={tool}
              style={{
                fontSize: 10.5,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                padding: '2px 7px',
                borderRadius: 6,
                background: theme.tile.chipBg,
                color: theme.card.rowText,
              }}
            >
              {tool}
            </span>
          ))}
        </div>
      )}

      {/* Implemented vs not */}
      {(card.live.length > 0 || card.pending.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
          {card.live.length > 0 && (
            <Section title="Implemented" mark="✓" color={theme.card.marks['✓']} items={card.live} />
          )}
          {card.pending.length > 0 && (
            <Section title="Not yet" mark="○" color={theme.card.marks['·']} items={card.pending} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, mark, color, items }: { title: string; mark: string; color: string; items: string[] }) {
  const theme = useTheme();
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 750, letterSpacing: 0.3, textTransform: 'uppercase', color, marginBottom: 4 }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 6, fontSize: 12, lineHeight: 1.4, color: theme.card.rowText }}>
            <span aria-hidden style={{ color, flexShrink: 0 }}>{mark}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleChip({ name, status }: { name: string; status: ModuleStatus }) {
  const theme = useTheme();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: theme.card.rowText }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: STATUS_DOT[status], flexShrink: 0 }} />
      {name}
    </span>
  );
}
