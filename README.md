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
| **3-Week Plan** | Plain-language three-week delivery plan for **3 engineers** — an at-a-glance summary (team · duration · available days · planned · buffer), the work grouped by outcome (run the demo on real data · complete the incident-to-change workflow · live major-incident screen · dashboards + hardening) each with a short explanation and day estimates, a week-by-week parallel-stream breakdown, what's left out and why, and the one hard dependency. Data in `src/model/plan3.ts` |
| **Checklist** | Delivery checklist for the core (non-agent) functionality — one card per feature module grouped by capability (ITSM Pillars · Shared Services · Platform & Core · Integrations · Channels), each with its status, UI/API state, **✓ Delivered** vs **○ To deliver / modify** lists, and an open-item summary. Filter All · Remaining work · Complete. Status/name come from `modules.ts`; the work breakdown lives in `src/model/checklist.ts` |
| **Agents** | Listing board — one card per AI agent (purpose, owned tools, the two modules it bridges with their status, and an explicit **✓ Implemented** / **○ Not yet** breakdown). Filter by readiness (All · Implemented · Partial · Not built). Sourced from the same `MODULE_EDGES[].agent` data the Zoom Map renders; the implemented-vs-pending split lives in `src/model/agents.ts` |
| **Zoom Map** | Same hierarchy, different feel — semantic zoom instead of collapse. Far out: giant cluster names over faint card texture. Click a card to dive in; left-aligned sub-cluster headers + module cards (status dot + name on top, status pill + UI/API meta on bottom) sharpen as you zoom; module-to-module relations and a status **legend** (bottom-left, swaps to the inspector on click) round it out. At far zoom, interiors are click-transparent so any click dives into the cluster. Includes an **Infrastructure** cluster (Postgres · Qdrant · MinIO · TTS · LLM · Langfuse · Compose) and a **Data Model** group — the Postgres schema organised by domain (ITSM Records · CMDB · Service Desk · Knowledge · Conversation · Identity · Ops), where the deepest level is the actual **tables** (monospace cards, live/to-build, defined in `src/model/dbschema.ts`). Also carries **Channels** (ingress) and **External Systems** clusters, **overlay colour modes** (Status / Owner / Effort / Sensitivity), a status **filter**, **value-stream playback** of the 6 demo stories (camera + caption), **AI agents riding the connection lines** (🤖 badges between the modules they mediate, ✓ ready / ◐ partial / ✗ to-build, click for tools + scope), and **PNG export** |
| **Deployment** | Runtime topology from docker-compose — the sovereign (air-gappable) Foundry GB10 boundary holding every container with ports, plus the opt-in enterprise systems outside it |

## Interactions

- **Zoom / pan** — wheel, drag, controls, minimap
- **Layer / overlay toggles** (top-right) — edge sets, or recolour modules by Status / Owner / Effort / Sensitivity
- **Value-stream playback** (Zoom, top-centre) — play a demo story A–F: the camera walks the modules it touches with a caption banner
- **Status filter** (Zoom legend, click a swatch) — dims non-matching modules
- **PNG export** (Zoom) — snapshot the current view
- **Permalinks** — the active view is in the URL hash (`#zoom`, `#deployment`, …); shareable and back/forward-aware
- **Dark mode** — 🌙/☀️ toggle; follows OS preference, persisted
- **Click a module / table / box** — inspector panel (status, chips, notes; tables show their owning module)
- **Search** (Clusters) — spotlight filter; non-matching tiles dim
- **Persistence** — active tab + cluster collapse state survive reloads

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
