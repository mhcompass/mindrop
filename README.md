# AIOps · Architecture Map

Standalone React app that renders the AIOps (yc-itsm) architecture
diagrams as zoomable, pannable react-flow canvases. Interactive twin of
`yc-itsm/docs/architecture/aiops-system-posture.drawio` — positions and
colours are transcribed 1:1 from that file.

## Run

```bash
npm install
npm run dev      # → http://localhost:5180
```

## Views

| Tab | Content |
|---|---|
| **System Posture** | End-system view: frontend (by readiness) → backend → data/AI/external planes |
| **Module Readiness** | ✓ / ◐ / ✗ per pillar, target `modules/incidents` anatomy, P1–P5 build sequence |
| **Master Connected Map** | Every surface → seeded fixture → (existing or missing) API → module → store |
| **Module Tracker** | Neutral flat inventory — every module as a tile with UI / API state chips and a status pill (Implemented · Partial · UI only · Not started) + auto-computed summary counts |
| **Clusters** | Capability hierarchy — clusters containing sub-clusters containing modules (ITSM → Service Operations → Incident Mgmt …), collapsible per cluster into summary cards with status-distribution bars, semantic inter-cluster connections (toggleable, "lift" to the collapsed parent when an endpoint is hidden), and 🤖 agent pills floating between the clusters they work across (draggable; click for description) |
| **Zoom Map** | Same hierarchy, different feel — semantic zoom instead of collapse. Far out: giant cluster names over faint card texture. Click a card to dive in; left-aligned sub-cluster headers + module cards (status dot + name on top, status pill + UI/API meta on bottom) sharpen as you zoom; module-to-module relations and a status **legend** (bottom-left, swaps to the inspector on click) round it out. At far zoom, interiors are click-transparent so any click dives into the cluster. Includes an **Infrastructure** cluster (Postgres · Qdrant · MinIO · TTS · LLM · Langfuse · Compose) |

## Interactions

- **Zoom / pan** — wheel, drag, controls (bottom-left), minimap (bottom-right)
- **Layer toggles** (top-right) — show/hide Live / Seeded / Planned / Actor edge sets
- **Dark mode** — 🌙/☀️ toggle in the header; follows OS preference on first load, persisted in localStorage
- **Click a module tile** (Tracker / Clusters) — inspector panel with status pill, UI/API chips, and notes
- **Search** (Clusters) — spotlight filter; non-matching tiles dim
- **Persistence** — active tab and cluster collapse state survive reloads (localStorage)
- **Click any box** — inspector panel with readiness status + notes
- Live flows are animated; seeded imports are dotted amber; planned wiring is dashed red

## Editing the model

All content lives in `src/model/` — `posture.ts`, `readiness.ts`,
`master.ts`, `modules.ts` (plain typed data, no layout engine; positions
are absolute px except the tracker, which auto-grids). Change status
colours / add nodes there; rendering is generic in `src/components/`.

**Tracking progress:** `modules.ts` is the file to touch when something
ships — flip a module's `ui` / `api` field between `'none'` →
`'partial'` → `'done'` and its tile pill plus the summary counts update
automatically. Status is derived: UI done + API done = Implemented; UI
done + API none = UI only; nothing = Not started; anything else =
Partial. Frontend-only modules (demo layer) set `feOnly: true`.

**Clusters** (`clusters.ts`) only define *grouping* — they reference
module ids from `modules.ts`, so cluster rollup counts always agree with
the tracker. The nested layout is computed at render time (recursive
row-packing), so re-parenting a module or adding a sub-cluster is just
an edit to the tree. A dev-time check throws on unknown module ids.

`smoke.mjs` is a Playwright smoke script (`node smoke.mjs` with the dev
server running) that screenshots all three views to `/tmp/arch-*.png`.

## Keeping it honest

When backend modules land, flip the corresponding nodes from
`planned`/`seeded` to `live` in `src/model/` — and update the drawio file
(or retire it) so the two artifacts don't drift.
