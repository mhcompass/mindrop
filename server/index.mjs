/**
 * AIOps team tracker — small local state service.
 *
 * Stores a flat map of per-deliverable overrides (status / assignee / ticket)
 * in a single JSON file on a Docker volume. Content-agnostic: it does not know
 * the roadmap; the SPA merges these overrides over its own static defaults.
 *
 * Endpoints (all under /api):
 *   GET    /api/health             → { ok, count }
 *   GET    /api/state              → { overrides, updatedAt }
 *   PATCH  /api/deliverable/:id    → merge {status?,assignee?,ticket?,by?}; returns the entry
 *
 * Env: PORT (default 46721), DATA_DIR (default ./data).
 */

import express from 'express';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const PORT = Number(process.env.PORT ?? 46721);
const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data');
const FILE = join(DATA_DIR, 'state.json');

const VALID_STATUS = new Set(['done', 'wip', 'todo']);

/** In-memory mirror of the store; the file is the durable copy. */
let state = { overrides: {}, updatedAt: null };
/** Serialize writes so concurrent PATCHes can't clobber the file. */
let writeChain = Promise.resolve();

async function load() {
  try {
    const raw = await readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.overrides) state = parsed;
    console.log(`[tracker] loaded ${Object.keys(state.overrides).length} overrides from ${FILE}`);
  } catch (e) {
    if (e.code === 'ENOENT') console.log(`[tracker] no state file yet — starting empty (${FILE})`);
    else console.error('[tracker] load failed, starting empty:', e.message);
  }
}

/** Atomic-ish write: temp file + rename, serialized through writeChain. */
function persist() {
  writeChain = writeChain.then(async () => {
    await mkdir(dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
    await rename(tmp, FILE);
  }).catch((e) => console.error('[tracker] persist failed:', e.message));
  return writeChain;
}

const app = express();
app.use(express.json({ limit: '256kb' }));

// Permissive CORS so the SPA can also hit the api directly (LAN / dev) when
// not behind the nginx same-origin proxy. Read-only-safe; no credentials.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, count: Object.keys(state.overrides).length });
});

app.get('/api/state', (_req, res) => {
  res.json(state);
});

app.patch('/api/deliverable/:id', async (req, res) => {
  const id = String(req.params.id);
  const { status, assignee, ticket, by } = req.body ?? {};

  if (status !== undefined && !VALID_STATUS.has(status)) {
    return res.status(422).json({ error: `invalid status '${status}'` });
  }

  const prev = state.overrides[id] ?? {};
  const next = { ...prev };
  if (status !== undefined) next.status = status;
  if (assignee !== undefined) next.assignee = String(assignee);
  if (ticket !== undefined) next.ticket = ticket ? String(ticket) : undefined;
  next.updatedAt = new Date().toISOString();
  if (by !== undefined) next.updatedBy = String(by);

  state.overrides[id] = next;
  state.updatedAt = next.updatedAt;
  await persist();
  res.json(next);
});

await load();
app.listen(PORT, () => console.log(`[tracker] listening on :${PORT} (data: ${FILE})`));
