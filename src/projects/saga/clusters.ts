/**
 * Clusters — Saga modules organised as a capability hierarchy. Module ids
 * reference modules.ts (single source for status); only grouping lives here.
 */
import type { ClusterTreeDef, ClusterCounts, ClusterEdgeDef, AgentDef } from '../../model/types';
import { MODULE_BY_ID } from './modules';
import { moduleStatus } from '../../model/types';
export type { ClusterTreeDef, ClusterCounts, ClusterEdgeDef, AgentDef } from '../../model/types';

export const CLUSTER_TREE: ClusterTreeDef[] = [
  {
    id: 'c_web', name: 'Web UI', accent: '#2563eb',
    children: ['web-app', 'web-video-editor', 'web-doc-editor', 'web-uploader', 'web-project-mgmt', 'web-auth'],
  },
  {
    id: 'c_api', name: 'API & Gateway', accent: '#0ea5e9',
    children: ['api-gateway', 'api-auth', 'api-videos', 'api-projects', 'api-workspaces', 'api-docs', 'api-websocket'],
  },
  {
    id: 'c_workers', name: 'Worker Pipeline', accent: '#7c3aed',
    children: ['arq-queue', 'transcription-worker', 'enhancement-worker', 'tts-worker', 'video-render-worker', 'maintenance-worker'],
  },
  {
    id: 'c_ai', name: 'AI Services', accent: '#db2777',
    children: ['whisper', 'ollama-llm', 'tts-service', 'doc-generator'],
  },
  {
    id: 'c_video', name: 'Video Processing', accent: '#e11d48',
    children: ['video-processor', 'auto-zoom', 'action-detector', 'video-effects'],
  },
  {
    id: 'c_data', name: 'Data & Storage', accent: '#475569',
    children: ['postgres', 'redis', 'storage-service', 'minio'],
  },
  {
    id: 'c_platform', name: 'Platform & External', accent: '#d97706',
    children: ['extension', 'kokoro-tts', 'tailscale'],
  },
];

/* ── Helpers (generic) ────────────────────────────────────────── */

export function aggregateCounts(def: ClusterTreeDef): ClusterCounts {
  const counts: ClusterCounts = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string') { const mod = MODULE_BY_ID[child]; if (mod) counts[moduleStatus(mod)]++; }
      else walk(child);
    }
  };
  walk(def);
  return counts;
}

export function allClusterIds(tree: ClusterTreeDef[] = CLUSTER_TREE): string[] {
  const ids: string[] = [];
  const walk = (c: ClusterTreeDef) => { ids.push(c.id); for (const child of c.children) if (typeof child !== 'string') walk(child); };
  tree.forEach(walk);
  return ids;
}

export const CLUSTER_EDGES: ClusterEdgeDef[] = [
  { id: 'se_web_api', source: 'c_web', target: 'c_api', label: 'REST + WebSocket', sh: 'b', th: 't' },
  { id: 'se_api_data', source: 'c_api', target: 'c_data', label: 'SQLAlchemy · storage' },
  { id: 'se_api_workers', source: 'c_api', target: 'c_workers', label: 'enqueue jobs', sh: 'r', th: 'l' },
  { id: 'se_workers_ai', source: 'c_workers', target: 'c_ai', label: 'transcribe · enhance · TTS' },
  { id: 'se_workers_video', source: 'c_workers', target: 'c_video', label: 'FFmpeg render pipeline' },
  { id: 'se_video_data', source: 'c_video', target: 'c_data', label: 'save renders / frames' },
  { id: 'se_workers_data', source: 'c_workers', target: 'c_data', label: 'job status (Redis/PG)' },
  { id: 'se_ai_platform', source: 'c_ai', target: 'c_platform', label: 'remote Kokoro / Ollama', sh: 'r', th: 'l' },
];

export const AGENTS: AgentDef[] = [
  { id: 'ag_transcribe', name: 'Transcription Agent', desc: 'Whisper speech-to-text with language detection + segment timing, feeding the render and doc pipelines.', connects: ['c_workers', 'c_ai'] },
  { id: 'ag_docgen', name: 'Doc Generator', desc: 'LLM that turns transcript + frames into a step-by-step guide and exports MD/PDF/HTML.', connects: ['c_ai', 'c_api'] },
  { id: 'ag_render', name: 'Render Pipeline', desc: 'Assembles the final video — auto-zoom on detected actions, effects, voiceover, title cards.', connects: ['c_workers', 'c_video'] },
];

export const CLUSTER_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const walk = (c: ClusterTreeDef) => { map[c.id] = c.name; for (const child of c.children) if (typeof child !== 'string') walk(child); };
  CLUSTER_TREE.forEach(walk);
  return map;
})();

export const CLUSTER_PARENT: Record<string, string | undefined> = (() => {
  const map: Record<string, string | undefined> = {};
  const walk = (c: ClusterTreeDef, parent?: string) => { map[c.id] = parent; for (const child of c.children) if (typeof child !== 'string') walk(child, c.id); };
  CLUSTER_TREE.forEach((c) => walk(c));
  return map;
})();

export function clusterChain(id: string): string[] {
  const chain: string[] = [];
  let cur: string | undefined = id;
  while (cur) { chain.unshift(cur); cur = CLUSTER_PARENT[cur]; }
  return chain;
}

/* Dev-time sanity */
{
  const walk = (c: ClusterTreeDef) => {
    for (const child of c.children) {
      if (typeof child === 'string' && !MODULE_BY_ID[child]) throw new Error(`saga clusters.ts unknown module id: ${child}`);
      if (typeof child !== 'string') walk(child);
    }
  };
  CLUSTER_TREE.forEach(walk);
  const known = new Set(allClusterIds());
  for (const e of CLUSTER_EDGES) if (!known.has(e.source) || !known.has(e.target)) throw new Error(`saga clusters.ts edge ${e.id} unknown cluster`);
  for (const a of AGENTS) for (const c of a.connects) if (!known.has(c)) throw new Error(`saga clusters.ts agent ${a.id} unknown cluster ${c}`);
}
