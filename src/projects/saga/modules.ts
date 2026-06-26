/**
 * Module Tracker — flat inventory of every Saga module with its status.
 * Backend/worker/AI services carry the same value in both columns (no separate
 * FE surface). Source: /Users/mherhakobyan/Projects/your-compass/products/saga
 */
import type { ArchNodeDef, ModuleTileDef, ModuleEdgeDef, PlacedTile, ModuleStatus } from '../../model/types';
import { moduleStatus } from '../../model/types';

function m(id: string, name: string, ui: ModuleTileDef['ui'], api: ModuleTileDef['api'], note?: string, meta?: Partial<ModuleTileDef>): ModuleTileDef {
  return { id, name, ui, api, note, ...meta };
}

interface Section { title: string; mods: ModuleTileDef[] }

const SECTIONS: Section[] = [
  {
    title: 'WEB UI',
    mods: [
      m('web-app', 'Web App (React SPA)', 'done', 'done', 'dashboard · projects · workspaces shell', { owner: 'Web', effort: 'L', critical: true }),
      m('web-video-editor', 'Video Editor', 'done', 'done', 'timeline · transcript · zoom/effect controls · frame explorer', { owner: 'Web', effort: 'L' }),
      m('web-doc-editor', 'Doc Editor', 'done', 'done', 'step list · screenshot viewer · markdown', { owner: 'Web', effort: 'M' }),
      m('web-uploader', 'Video Uploader', 'done', 'done', 'file upload · progress', { owner: 'Web', effort: 'S' }),
      m('web-project-mgmt', 'Projects / Workspaces UI', 'done', 'done', 'lists · detail · sharing · settings', { owner: 'Web', effort: 'M' }),
      m('web-auth', 'Auth UI', 'done', 'done', 'login/register · JWT · session persistence', { owner: 'Web', effort: 'S' }),
    ],
  },
  {
    title: 'API & GATEWAY',
    mods: [
      m('api-gateway', 'FastAPI App Server', 'done', 'done', 'routing · middleware · static /storage', { owner: 'API', effort: 'M', critical: true }),
      m('api-auth', 'Auth & Security', 'done', 'done', 'JWT · login/register/refresh · RBAC', { owner: 'API', sensitivity: 'sensitive' }),
      m('api-users', 'Users Router', 'done', 'done', 'profile · account management (routers/users.py)', { owner: 'API', sensitivity: 'pii' }),
      m('api-videos', 'Videos Router', 'done', 'done', 'upload · CRUD · metadata · enqueue jobs', { owner: 'API', effort: 'M' }),
      m('api-projects', 'Projects Router', 'done', 'done', 'CRUD · videos list · sharing', { owner: 'API' }),
      m('api-workspaces', 'Workspaces Router', 'done', 'done', 'teams · members · invites · roles', { owner: 'API' }),
      m('api-docs', 'Documents Router', 'done', 'done', 'generated docs · export MD/PDF/HTML', { owner: 'API' }),
      m('api-editor', 'Editor Router', 'done', 'done', 'effects · render · chapters · captions · ripples · waveform · silence', { owner: 'API', effort: 'M' }),
      m('api-presets', 'Effect Presets Router', 'done', 'done', 'CRUD effect presets · user/workspace/built-in', { owner: 'API' }),
      m('api-stats', 'Stats Router', 'done', 'done', '/stats/dashboard — counts · recent activity', { owner: 'API' }),
      m('api-brands', 'Brands Router', 'done', 'done', 'logo · colours · intros/outros', { owner: 'API' }),
      m('api-websocket', 'WebSocket Handler', 'done', 'done', 'live job progress · Redis pub/sub', { owner: 'API', effort: 'M' }),
    ],
  },
  {
    title: 'WORKER PIPELINE',
    mods: [
      m('arq-queue', 'ARQ Task Queue', 'done', 'done', 'Redis-backed async job queue', { owner: 'Workers', infra: true }),
      m('transcription-worker', 'Transcription Job', 'done', 'done', '→ Whisper', { owner: 'Workers' }),
      m('enhancement-worker', 'Enhancement Job', 'done', 'done', '→ Ollama (script clean-up)', { owner: 'Workers' }),
      m('tts-worker', 'Voiceover Job', 'done', 'done', '→ TTS engine', { owner: 'Workers' }),
      m('video-render-worker', 'Render Job', 'done', 'done', 'FFmpeg pipeline · effects + voiceover', { owner: 'Workers', effort: 'L', critical: true }),
      m('maintenance-worker', 'Maintenance Cron', 'done', 'done', 'reconcile stuck videos (every minute)', { owner: 'Workers', effort: 'S' }),
    ],
  },
  {
    title: 'AI SERVICES',
    mods: [
      m('whisper', 'Whisper Transcriber', 'done', 'done', 'speech-to-text · faster-whisper · 99+ langs', { owner: 'AI', effort: 'M' }),
      m('ollama-llm', 'LLM (Qwen3-30B)', 'done', 'done', 'qwen3-30b-a3b · script enhancement · doc gen · LLaVA vision · ollama|openai dispatch', { owner: 'AI', effort: 'M' }),
      m('tts-service', 'TTS Service', 'done', 'done', 'Kokoro (default) · Piper fallback · Coqui · edge-tts · transcription-only langs', { owner: 'AI', effort: 'M' }),
      m('doc-generator', 'Doc Generator', 'done', 'done', 'transcript + frames → step-by-step guide', { owner: 'AI', effort: 'M' }),
    ],
  },
  {
    title: 'VIDEO PROCESSING',
    mods: [
      m('video-processor', 'Video Processor (FFmpeg)', 'done', 'done', 'frame/audio extraction · merge · convert (processor.py)', { owner: 'Video', effort: 'L', critical: true }),
      m('auto-zoom', 'Auto-Zoom Effects', 'done', 'done', 'click/cursor inference → zoom keyframes (auto_zoom.py)', { owner: 'Video', effort: 'M' }),
      m('silence-removal', 'Silence Removal', 'done', 'done', 'detect + trim dead air (silence.py)', { owner: 'Video', effort: 'M' }),
      m('title-cards', 'Title Cards', 'done', 'done', 'generated intro / section title frames (title_cards.py)', { owner: 'Video' }),
      m('video-effects', 'Effects & Transitions', 'done', 'done', 'fade · slide · zoom · branding overlays (effects.py)', { owner: 'Video' }),
    ],
  },
  {
    title: 'DATA & STORAGE',
    mods: [
      m('postgres', 'PostgreSQL 16', 'done', 'done', 'users · workspaces · videos · jobs · docs · brands', { owner: 'Platform', infra: true }),
      m('redis', 'Redis 7', 'done', 'done', 'ARQ queue · cache · pub/sub for WebSocket', { owner: 'Platform', infra: true }),
      m('storage-service', 'File Storage', 'done', 'done', 'local FS or MinIO S3 · videos/frames/audio', { owner: 'Platform', effort: 'M' }),
    ],
  },
  {
    title: 'PLATFORM & EXTERNAL',
    mods: [
      m('extension', 'Chrome Extension', 'partial', 'partial', 'screen recording · chunked upload (MV3)', { owner: 'Web', effort: 'M', channel: true }),
      m('minio', 'MinIO S3 (optional)', 'none', 'none', 'S3-compatible object store · prod profile', { owner: 'Platform', infra: true }),
      m('kokoro-tts', 'Kokoro TTS (remote)', 'done', 'done', 'advanced voiceover · separate host (:8000)', { owner: 'AI', external: true }),
      m('tailscale', 'Tailscale Sidecar', 'done', 'done', 'private tailnet HTTPS Serve (saga.<tailnet>.ts.net)', { owner: 'Platform', infra: true }),
    ],
  },
];

/* ── Grid layout ──────────────────────────────────────────────── */

const TILE_W = 250;
const TILE_H = 96;
const GAP = 18;
const COLS = 6;

const tiles: PlacedTile[] = [];
const headers: ArchNodeDef[] = [];

let y = 70;
for (const section of SECTIONS) {
  headers.push({ id: `hdr_${section.title}`, label: section.title, x: 0, y, w: 800, h: 22, status: 'note', fontSize: 13 });
  y += 32;
  section.mods.forEach((mod, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    tiles.push({ ...mod, x: col * (TILE_W + GAP), y: y + row * (TILE_H + GAP), w: TILE_W, h: TILE_H });
  });
  y += Math.ceil(section.mods.length / COLS) * (TILE_H + GAP) + 24;
}

const counts: Record<ModuleStatus, number> = { implemented: 0, partial: 0, 'ui-only': 0, planned: 0 };
for (const s of SECTIONS) for (const mod of s.mods) counts[moduleStatus(mod)]++;
const total = Object.values(counts).reduce((a, b) => a + b, 0);

headers.unshift({
  id: 'tracker_summary',
  label: `${total} modules — ● ${counts.implemented} implemented · ◑ ${counts.partial} partial · ○ ${counts.planned} not started`,
  x: 0, y: 16, w: 1200, h: 28, status: 'note', fontSize: 15,
});

export const TRACKER_TILES = tiles;
export const TRACKER_NODES = headers;

export const ALL_MODULES: ModuleTileDef[] = SECTIONS.flatMap((s) => s.mods);
export const MODULE_BY_ID: Record<string, ModuleTileDef> = Object.fromEntries(ALL_MODULES.map((mod) => [mod.id, mod]));

/* ── Module-to-module relations ───────────────────────────────── */

function me(id: string, source: string, target: string, label: string): ModuleEdgeDef {
  return { id, source, target, label };
}

export const MODULE_EDGES: ModuleEdgeDef[] = [
  me('e_web_api', 'web-app', 'api-gateway', 'REST + WebSocket'),
  me('e_ext_api', 'extension', 'api-gateway', 'upload'),
  me('e_api_pg', 'api-gateway', 'postgres', 'SQLAlchemy'),
  me('e_vid_store', 'api-videos', 'storage-service', 'save/fetch files'),
  me('e_vid_queue', 'api-videos', 'arq-queue', 'enqueue jobs'),
  me('e_queue_redis', 'arq-queue', 'redis', 'tasks'),
  me('e_ws_redis', 'api-websocket', 'redis', 'pub/sub'),
  me('e_trans_whisper', 'transcription-worker', 'whisper', 'transcribe'),
  me('e_enh_ollama', 'enhancement-worker', 'ollama-llm', 'enhance script'),
  me('e_tts_svc', 'tts-worker', 'tts-service', 'voiceover'),
  me('e_render_proc', 'video-render-worker', 'video-processor', 'FFmpeg'),
  me('e_render_zoom', 'video-render-worker', 'auto-zoom', 'keyframes'),
  me('e_doc_ollama', 'doc-generator', 'ollama-llm', 'structure steps'),
  me('e_tts_kokoro', 'tts-service', 'kokoro-tts', 'remote TTS'),
];

for (const e of MODULE_EDGES) {
  if (!MODULE_BY_ID[e.source] || !MODULE_BY_ID[e.target]) {
    throw new Error(`saga modules.ts edge ${e.id} references unknown module id`);
  }
}
