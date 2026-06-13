import { createContext, useContext } from 'react';
import type { Status, EdgeKind, ModuleStatus, PartState } from './model/types';

export interface Theme {
  dark: boolean;
  app: {
    bg: string;
    headerBg: string;
    headerBorder: string;
    title: string;
    subtitle: string;
    tabActiveBg: string;
    tabActiveBorder: string;
    tabActiveText: string;
    tabBg: string;
    tabBorder: string;
    tabText: string;
    legendText: string;
  };
  canvas: {
    dots: string;
    panelBg: string;
    panelBorder: string;
  };
  box: Record<Status, { bg: string; border: string; text: string }>;
  zone: Record<Status, { bg: string; border: string; text: string }>;
  card: {
    bg: string;
    rowText: string;
    tones: Record<'seeded' | 'live' | 'demo' | 'plan', { bar: string; border: string; title: string }>;
    marks: Record<string, string>;
  };
  edge: Record<EdgeKind, string>;
  edgeLabel: { text: string; bg: string };
  inspector: { bg: string; border: string; title: string; text: string; chipBg: string; chipText: string };
  tile: {
    bg: string;
    border: string;
    name: string;
    note: string;
    chipBg: string;
    chipState: Record<PartState, string>;
    pill: Record<ModuleStatus, { bg: string; fg: string }>;
  };
  cluster: {
    /** Fill / border per nesting depth (clamped to last entry). */
    fill: string[];
    border: string[];
    title: string;
    countText: string;
  };
  /** Ambient gradient canvas for the Zoom Map. */
  zoomCanvas: string;
}

export const LIGHT: Theme = {
  dark: false,
  app: {
    bg: '#fafafa',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    title: '#111827',
    subtitle: '#6b7280',
    tabActiveBg: '#eff6ff',
    tabActiveBorder: '#2563eb',
    tabActiveText: '#1d4ed8',
    tabBg: '#ffffff',
    tabBorder: '#d1d5db',
    tabText: '#4b5563',
    legendText: '#374151',
  },
  canvas: {
    dots: '#d4d4d8',
    panelBg: 'rgba(255,255,255,0.92)',
    panelBorder: '#e5e7eb',
  },
  box: {
    live:     { bg: '#d5e8d4', border: '#82b366', text: '#1f3d1f' },
    seeded:   { bg: '#ffe6cc', border: '#d79b00', text: '#4a3208' },
    demo:     { bg: '#f3e6f9', border: '#9673a6', text: '#3d2a47' },
    planned:  { bg: '#f8cecc', border: '#b85450', text: '#4a1715' },
    shared:   { bg: '#fff2cc', border: '#d6b656', text: '#4a3c08' },
    infra:    { bg: '#ffffff', border: '#6c8ebf', text: '#1f3550' },
    ai:       { bg: '#ffffff', border: '#9673a6', text: '#3d2a47' },
    external: { bg: '#ffffff', border: '#666666', text: '#222222' },
    actor:    { bg: '#ffffff', border: '#111111', text: '#111111' },
    note:     { bg: 'transparent', border: 'transparent', text: '#6b7280' },
  },
  zone: {
    infra:    { bg: 'rgba(218,232,252,0.45)', border: '#6c8ebf', text: '#27486e' },
    seeded:   { bg: 'rgba(255,242,204,0.55)', border: '#d6b656', text: '#6b5408' },
    demo:     { bg: 'rgba(225,213,231,0.5)',  border: '#9673a6', text: '#4c3358' },
    ai:       { bg: 'rgba(225,213,231,0.5)',  border: '#9673a6', text: '#4c3358' },
    external: { bg: 'rgba(245,245,245,0.7)',  border: '#666666', text: '#333333' },
    planned:  { bg: 'transparent',             border: '#b85450', text: '#8a2d2a' },
    live:     { bg: 'rgba(213,232,212,0.45)', border: '#82b366', text: '#2c4a2b' },
    actor:    { bg: 'transparent',             border: '#999999', text: '#555555' },
    shared:   { bg: 'rgba(255,242,204,0.4)',  border: '#d6b656', text: '#6b5408' },
    note:     { bg: 'transparent', border: 'transparent', text: '#6b7280' },
  },
  card: {
    bg: '#ffffff',
    rowText: '#374151',
    tones: {
      seeded: { bar: '#fff2cc', border: '#d6b656', title: '#1f2937' },
      live:   { bar: '#d5e8d4', border: '#82b366', title: '#1f2937' },
      demo:   { bar: '#e1d5e7', border: '#9673a6', title: '#1f2937' },
      plan:   { bar: '#dae8fc', border: '#6c8ebf', title: '#1f2937' },
    },
    marks: { '✓': '#2e7d32', '◐': '#b58a00', '✗': '#c62828', '·': '#6b7280' },
  },
  edge: { live: '#2e7d32', seeded: '#d6a93a', planned: '#b85450', neutral: '#64748b' },
  edgeLabel: { text: '#475569', bg: '#f8fafc' },
  inspector: { bg: '#ffffff', border: '#e5e7eb', title: '#111827', text: '#4b5563', chipBg: '#f3f4f6', chipText: '#374151' },
  tile: {
    bg: '#ffffff',
    border: '#e2e4e9',
    name: '#1f2937',
    note: '#6b7280',
    chipBg: '#f3f4f6',
    chipState: { done: '#2e7d32', partial: '#b58a00', none: '#9ca3af' },
    pill: {
      implemented: { bg: '#e7f3e7', fg: '#2e7d32' },
      partial:     { bg: '#fdf3d7', fg: '#946f00' },
      'ui-only':   { bg: '#fdeadc', fg: '#b45309' },
      planned:     { bg: '#f1f2f4', fg: '#6b7280' },
    },
  },
  cluster: {
    fill: ['rgba(100,116,139,0.06)', 'rgba(100,116,139,0.09)', 'rgba(100,116,139,0.12)'],
    border: ['#94a3b8', '#b6c0cf', '#c8d0db'],
    title: '#334155',
    countText: '#64748b',
  },
  zoomCanvas:
    'radial-gradient(1100px 700px at 18% -5%, rgba(99,102,241,0.09), transparent 60%), radial-gradient(1000px 650px at 85% 110%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(900px 500px at 55% 45%, rgba(225,29,72,0.04), transparent 65%), #f7f8fa',
};

export const DARK: Theme = {
  dark: true,
  app: {
    bg: '#0b1120',
    headerBg: '#111827',
    headerBorder: '#1f2937',
    title: '#f9fafb',
    subtitle: '#9ca3af',
    tabActiveBg: '#1e3a8a33',
    tabActiveBorder: '#3b82f6',
    tabActiveText: '#93c5fd',
    tabBg: '#111827',
    tabBorder: '#374151',
    tabText: '#9ca3af',
    legendText: '#d1d5db',
  },
  canvas: {
    dots: '#2c3444',
    panelBg: 'rgba(17,24,39,0.92)',
    panelBorder: '#374151',
  },
  box: {
    live:     { bg: '#1c2f1c', border: '#82b366', text: '#bfe3bd' },
    seeded:   { bg: '#33270f', border: '#d79b00', text: '#ffd9a8' },
    demo:     { bg: '#2b2133', border: '#9673a6', text: '#e3cdf0' },
    planned:  { bg: '#331a19', border: '#c46a66', text: '#f3b8b5' },
    shared:   { bg: '#332b10', border: '#d6b656', text: '#f0e0a0' },
    infra:    { bg: '#16202e', border: '#6c8ebf', text: '#cfe0f5' },
    ai:       { bg: '#221b29', border: '#9673a6', text: '#e3cdf0' },
    external: { bg: '#1d1d1d', border: '#8c8c8c', text: '#d4d4d4' },
    actor:    { bg: '#111827', border: '#d1d5db', text: '#f3f4f6' },
    note:     { bg: 'transparent', border: 'transparent', text: '#9ca3af' },
  },
  zone: {
    infra:    { bg: 'rgba(108,142,191,0.10)', border: '#46618c', text: '#9fc0eb' },
    seeded:   { bg: 'rgba(214,182,86,0.08)',  border: '#9c8638', text: '#e7cd76' },
    demo:     { bg: 'rgba(150,115,166,0.10)', border: '#7d5f8c', text: '#d1b3e0' },
    ai:       { bg: 'rgba(150,115,166,0.10)', border: '#7d5f8c', text: '#d1b3e0' },
    external: { bg: 'rgba(255,255,255,0.04)', border: '#6b7280', text: '#c3c8cf' },
    planned:  { bg: 'transparent',             border: '#c46a66', text: '#eb9e9a' },
    live:     { bg: 'rgba(130,179,102,0.08)', border: '#5d8a45', text: '#a9d694' },
    actor:    { bg: 'transparent',             border: '#4b5563', text: '#9ca3af' },
    shared:   { bg: 'rgba(214,182,86,0.07)',  border: '#9c8638', text: '#e7cd76' },
    note:     { bg: 'transparent', border: 'transparent', text: '#9ca3af' },
  },
  card: {
    bg: '#111827',
    rowText: '#d1d5db',
    tones: {
      seeded: { bar: '#33270f', border: '#9c8638', title: '#f0e0a0' },
      live:   { bar: '#1c2f1c', border: '#5d8a45', title: '#bfe3bd' },
      demo:   { bar: '#2b2133', border: '#7d5f8c', title: '#e3cdf0' },
      plan:   { bar: '#16202e', border: '#46618c', title: '#cfe0f5' },
    },
    marks: { '✓': '#4ade80', '◐': '#fbbf24', '✗': '#f87171', '·': '#9ca3af' },
  },
  edge: { live: '#5cb85c', seeded: '#d6a93a', planned: '#e07b76', neutral: '#8b9bb0' },
  edgeLabel: { text: '#cbd5e1', bg: '#1e293b' },
  inspector: { bg: '#111827', border: '#374151', title: '#f9fafb', text: '#9ca3af', chipBg: '#1f2937', chipText: '#d1d5db' },
  tile: {
    bg: '#141c2b',
    border: '#2b3548',
    name: '#f3f4f6',
    note: '#9ca3af',
    chipBg: '#1f2937',
    chipState: { done: '#4ade80', partial: '#fbbf24', none: '#6b7280' },
    pill: {
      implemented: { bg: '#16321a', fg: '#4ade80' },
      partial:     { bg: '#33270f', fg: '#fbbf24' },
      'ui-only':   { bg: '#33200f', fg: '#fb923c' },
      planned:     { bg: '#1f2430', fg: '#9ca3af' },
    },
  },
  cluster: {
    fill: ['rgba(148,163,184,0.05)', 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.11)'],
    border: ['#475569', '#414d61', '#3b4456'],
    title: '#cbd5e1',
    countText: '#94a3b8',
  },
  zoomCanvas:
    'radial-gradient(1100px 700px at 18% -5%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(1000px 650px at 85% 110%, rgba(168,85,247,0.12), transparent 60%), radial-gradient(900px 500px at 55% 45%, rgba(225,29,72,0.07), transparent 65%), #0b1120',
};

export const ThemeContext = createContext<Theme>(LIGHT);
export const useTheme = () => useContext(ThemeContext);
