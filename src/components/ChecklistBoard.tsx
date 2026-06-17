import { useState } from 'react';

import { useTheme } from '../theme';
import type { ModuleStatus, PartState } from '../model/types';
import {
  CHECKLIST_GROUPS,
  CHECKLIST_MODULE_COUNT,
  CHECKLIST_OPEN_COUNT,
  CHECKLIST_WITH_WORK,
  type ChecklistEntry,
} from '../model/checklist';

const STATUS_LABEL: Record<ModuleStatus, string> = {
  implemented: 'Implemented',
  partial: 'Partial',
  'ui-only': 'UI only',
  planned: 'Planned',
};

type Filter = 'all' | 'work' | 'done';

export function ChecklistBoard() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const match = (e: ChecklistEntry) =>
    filter === 'all' ? true : filter === 'work' ? e.todo.length > 0 : e.todo.length === 0;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: CHECKLIST_MODULE_COUNT },
    { key: 'work', label: 'Remaining work', count: CHECKLIST_WITH_WORK },
    { key: 'done', label: 'Complete', count: CHECKLIST_MODULE_COUNT - CHECKLIST_WITH_WORK },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: theme.zoomCanvas }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '22px 24px 56px' }}>
        {/* Intro + filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 850, letterSpacing: -0.3, color: theme.app.title }}>
              Core functionality — delivery checklist
            </div>
            <div style={{ fontSize: 12.5, color: theme.app.subtitle, marginTop: 3, maxWidth: 760 }}>
              The non-agent feature modules with what's delivered today versus what still needs to be built or
              modified. <strong style={{ color: theme.app.title }}>{CHECKLIST_OPEN_COUNT}</strong> open items across{' '}
              <strong style={{ color: theme.app.title }}>{CHECKLIST_WITH_WORK}</strong> of {CHECKLIST_MODULE_COUNT}{' '}
              modules.
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

        {/* Groups */}
        {CHECKLIST_GROUPS.map((group) => {
          const entries = group.entries.filter(match);
          if (entries.length === 0) return null;
          const open = group.entries.reduce((a, e) => a + e.todo.length, 0);
          return (
            <div key={group.id} style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 2px 12px' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: group.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: 0.2, color: theme.app.title }}>
                  {group.title}
                </span>
                <span style={{ fontSize: 11, fontWeight: 650, color: theme.app.subtitle }}>
                  {open} open · {group.entries.length} modules
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {entries.map((entry) => (
                  <Card key={entry.id} entry={entry} accent={group.accent} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ entry, accent }: { entry: ChecklistEntry; accent: string }) {
  const theme = useTheme();
  const pill = theme.tile.pill[entry.status];

  return (
    <div
      style={{
        background: theme.tile.bg,
        border: `1px solid ${theme.tile.border}`,
        borderTop: `3px solid ${accent}`,
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
        <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.tile.name, lineHeight: 1.2, minWidth: 0 }}>
          {entry.name}
        </span>
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
          {STATUS_LABEL[entry.status]}
        </span>
      </div>

      {/* Note */}
      {entry.note && <div style={{ fontSize: 12.5, lineHeight: 1.45, color: theme.tile.note }}>{entry.note}</div>}

      {/* FE / BE state */}
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: theme.card.rowText }}>
        <PartDot label="UI" state={entry.ui} />
        {!entry.feOnly && <PartDot label="API" state={entry.api} />}
      </div>

      {/* Delivered vs to-do */}
      {entry.delivered.length > 0 && (
        <Section title="Delivered" mark="✓" color={theme.card.marks['✓']} items={entry.delivered} />
      )}
      {entry.todo.length > 0 && (
        <Section title="To deliver / modify" mark="○" color={theme.card.marks['·']} items={entry.todo} />
      )}
      {entry.todo.length === 0 && (
        <div style={{ fontSize: 11.5, fontWeight: 650, color: theme.card.marks['✓'] }}>✓ Complete</div>
      )}
    </div>
  );
}

function PartDot({ label, state }: { label: string; state: PartState }) {
  const theme = useTheme();
  const color = theme.tile.chipState[state];
  const glyph = state === 'done' ? '●' : state === 'partial' ? '◐' : '○';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 650 }}>
      <span aria-hidden style={{ color }}>{glyph}</span>
      {label}
    </span>
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
