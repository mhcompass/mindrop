/**
 * Per-deliverable detail — the "exactly what needs to be done" surfaced in
 * the ticket drawer. Keyed by the deliverable id from roadmap.ts.
 *
 * Each entry: a one-paragraph summary (what & why), the ordered steps to
 * implement it, the definition of done, and the codebase touchpoints. Keep
 * these honest — where a step needs a decision or a spike, say so.
 */

export interface DeliverableDetail {
  /** What this is and why it matters — one short paragraph. */
  summary: string;
  /** Ordered, concrete implementation steps. */
  steps: string[];
  /** Definition of done — what must be true to close the ticket. */
  acceptance: string[];
  /** Files / areas in the codebase to touch. */
  touchpoints?: string[];
  /** Gotchas, dependencies, or decisions to settle first. */
  notes?: string;
}

export const DETAILS: Record<string, DeliverableDetail> = {
  // ── Phase 0 · Stabilize the merge ───────────────────────────────────────
  'alembic-head': {
    summary:
      'After the fleet-ops merge, `development` has two Alembic heads: the dual-admin migration branched off `records_fk_set_null` instead of the current head, so `alembic upgrade head` errors with "Multiple head revisions". One field fixes it.',
    steps: [
      "In `add_approval_dual_admin.py`, change `down_revision` from `'records_fk_set_null'` to `'14e55df52c5b'`.",
      'Update the migration docstring `Revises:` line to match.',
      'Run `alembic heads` — confirm a single head (`add_approval_dual_admin`).',
      'Run `alembic upgrade head` against a scratch DB to confirm it applies cleanly.',
      'Commit + push to `development`.',
    ],
    acceptance: [
      '`alembic heads` reports exactly one head.',
      '`alembic upgrade head` succeeds on a fresh database.',
      'Migration upgrade and downgrade verified on a scratch database',
    ],
    touchpoints: ['backend/alembic/versions/add_approval_dual_admin.py'],
    notes:
      'Change only `down_revision` — never the `revision` id itself, or you orphan any DB that already applied it. The fix was prepared locally earlier; it just needs to land on `development`.',
  },
  'tracker-reconcile': {
    summary:
      'This AIOps model lagged the codebase by a few days — Fleet Operations, dual-admin approvals, and the governance module-toggle landed after the 2026-06-17 stamp. Bring the model files current so every view matches reality.',
    steps: [
      'Reconcile `readiness.ts` cards with live backend state. (Done 2026-06-21.)',
      'Bump `stamp.ts` date + scope. (Done.)',
      'Spot-pass `modules.ts`: confirm `t_sccm` reflects Fleet bulk ops, `t_appr` reflects dual-admin/bypass, `t_gov` reflects the module-toggle.',
      'Spot-check Tracker / Zoom / Clusters for any remaining stale status.',
    ],
    acceptance: [
      'Stamp date is current; no view contradicts `modules.ts`.',
      'ITIL pillars show as backend-live everywhere.',
    ],
    touchpoints: ['src/model/readiness.ts', 'src/model/stamp.ts', 'src/model/modules.ts'],
    notes: 'Readiness + stamp already done this session; remaining work is the modules.ts spot pass.',
  },
  'approval-guardrails': {
    summary:
      'The dual-admin work relaxed/added several approval controls. These are policy decisions to settle before they harden: (1) approval comment is now optional, (2) nothing stops a requester approving their own request, (3) a single SystemAdmin can bypass the dual-admin vote.',
    steps: [
      'Decide whether approve/reject must carry a comment. If yes, restore the validator on `ApprovalActionRequest.comment`.',
      'Decide whether the requester may be one of the approvers. If not, block `current_user.email == requester.email` in `approve_request` (separation of duties).',
      'Confirm the SystemAdmin `bypass` is acceptable as break-glass (mandatory comment + audit already implemented), or gate it further (e.g. require a second SystemAdmin).',
      'Add/adjust tests for each decision.',
    ],
    acceptance: [
      'A written policy for comment-required, self-approval, and bypass.',
      'Tests cover the chosen behaviour for each of the three.',
      'Tests cover each chosen policy: comment requirement, self-approval block, bypass audit',
    ],
    touchpoints: [
      'backend/app/core/approval/routes.py (ApprovalActionRequest, approve_request, bypass_approval)',
      'backend/app/core/approval/service.py',
    ],
    notes: 'Policy first — get sign-off before coding; these are governance decisions, not just code.',
  },

  // ── Phase 1 · Finish Fleet Operations ───────────────────────────────────
  'fleet-collections-exec': {
    summary:
      'The bulk SCCM routes accept `collection_names` (and the UI sends them), but the handlers only pass `device_names` to the SCCM client — so targeting a collection alone executes against zero devices. Wire collection targeting through to execution.',
    steps: [
      'In the bulk endpoints, resolve `collection_names` → member device names via the repository (`get_collection_by_name` → members).',
      'Merge resolved members with explicit `device_names`; dedupe.',
      'Pass the resolved device set to `install_updates` / `deploy_application` / `run_task_sequence` (extend the client/base signature if needed).',
      'Ensure the audit params reflect the resolved set, not the raw request.',
    ],
    acceptance: [
      'A request with only `collection_names` executes against that collection’s members.',
      'A request mixing devices + collections dedupes correctly.',
      'Unit + integration tests cover collection resolution and device dedupe',
    ],
    touchpoints: [
      'backend/app/modules/sccm/routes.py',
      'backend/app/modules/sccm/mock_client.py',
      'backend/app/modules/sccm/base.py',
      'backend/app/modules/sccm/repository.py',
    ],
    notes: 'Do together with `fleet-risk-collections` — share one resolution helper so the risk gate sees the same set.',
  },
  'fleet-risk-collections': {
    summary:
      'Risk classification counts only `device_names`. With collection targeting, a 200-member collection looks like 0 targets, so escalation thresholds never fire and approvals get skipped.',
    steps: [
      'Resolve `collection_names` → member count before classification (reuse the helper from `fleet-collections-exec`).',
      'Pass the full resolved target set / count into `get_risk_classifier().classify()`.',
      'Verify the `target_count` escalation rules in `risk_classification.yaml` fire on the true count.',
    ],
    acceptance: [
      'Targeting a 200-member collection escalates as if 200 devices.',
      'install_updates over the configured threshold routes to approval.',
      'Tests assert escalation fires on the resolved member count',
    ],
    touchpoints: [
      'backend/app/modules/sccm/routes.py (_gate_bulk_action callers)',
      'backend/app/core/risk/classifier.py',
      'backend/config/risk_classification.yaml',
    ],
    notes: 'Sequence after / with `fleet-collections-exec`.',
  },
  'fleet-reboot-gate': {
    summary:
      'The voice/chat path executes `reboot_device` directly, skipping the approval gate the REST bulk routes enforce. A voice "reboot device X" reboots an endpoint with no approval.',
    steps: [
      'Add `reboot_device` to `_GATED_VOICE_TOOLS` and route it through `_gate_voice_action` in `agent.py`, like install/deploy.',
      'Add a `reboot_device` entry to `risk_classification.yaml` if missing (default: requires approval).',
      'Confirm any single-device REST reboot route is gated too.',
    ],
    acceptance: [
      'A chat/voice reboot returns `approval_pending` when policy requires it, with an audit entry.',
      'Reboot risk is configured, not defaulted silently.',
      'Tests assert a reboot returns approval_pending and is audited',
    ],
    touchpoints: ['backend/app/modules/sccm/agent.py', 'backend/config/risk_classification.yaml'],
    notes: 'Reboot is destructive on endpoints — default to requiring approval.',
  },
  'fleet-final-test': {
    summary:
      'End-to-end QA of the bulk install / deploy / task-sequence flows: UI → risk gate → approval (incl. dual-admin on task sequences) → execution → Galaxy pulse → audit timeline.',
    steps: [
      'Run each bulk action from the Fleet Operations page with both device and collection targets.',
      'Verify approval creation, dual-admin where `min_approvals=2` (task sequences), and the execution result.',
      'Verify the Endpoint/Galaxy pulse fires on submit and on the approval decision (`device.action.*`).',
      'Verify audit timeline labels render (e.g. "fleet · install updates · N devices").',
    ],
    acceptance: [
      'All three actions pass with correct gating, execution, pulses, and audit.',
      'No console errors; collection + device targeting both work.',
    ],
    touchpoints: ['frontend/src/pages/FleetOperationsPage.tsx', 'frontend/src/components/fleet/*', 'backend approval + sccm modules'],
    notes: 'Depends on `fleet-collections-exec` + `fleet-risk-collections` landing first.',
  },

  // ── Phase 2 · Incident → change automation ──────────────────────────────
  'auto-recurrence': {
    summary:
      'Linking incidents to a problem is manual today (`link_records` exists; auto-detection is scripted). Detect recurring incidents and group them under one problem automatically.',
    steps: [
      'Define the recurrence signal: similarity on title/CI/category over a window (e.g. N incidents on same CI+symptom within T days).',
      'Implement detection in the problem/records service — on incident create and/or a periodic sweep.',
      'On a match, create or attach to a Problem via the records engine + `link_records`.',
      'Expose a Pattern Agent tool (`match_pattern` / `promote_to_problem`) for chat-initiated grouping.',
    ],
    acceptance: [
      'Seeded recurring incidents auto-create or attach to a problem.',
      'The link is visible in the incident and problem drawers.',
      'Unit tests cover the recurrence signal; integration test asserts the problem link',
    ],
    touchpoints: ['backend problem/records module + services', 'agent tools', 'optional scheduled task'],
    notes: 'Pattern Agent is "partial". Start with deterministic rules; LLM-assisted matching is a later enhancement. Plan ref B5.',
  },
  'change-risk-scoring': {
    summary:
      'The change-risk model + CAB gate are live on records, but full auto-scoring from real factors is partial. Score change risk from history, blast radius, dependencies, and timing.',
    steps: [
      'Define inputs: prior change-failure rate on the CI, count of dependent CIs, business-hours vs off-hours window, recent incidents on the CI.',
      'Implement a scoring service; persist the score + factor breakdown on the change record.',
      'Feed the score into the CAB gate threshold (high → approval).',
      'Surface the factor breakdown in the change drawer risk explainer.',
    ],
    acceptance: [
      'Change risk reflects the factors; high-risk auto-routes to CAB.',
      'The explainer shows why the score landed where it did.',
      'Unit tests cover the scoring factors and the CAB-gate threshold',
    ],
    touchpoints: ['backend change module/services', 'frontend change drawer', 'risk config'],
    notes: 'Change-Risk Agent is "partial"; the CAB gate already exists. Plan ref B6.',
  },
  'cab-draft': {
    summary:
      'The CAB summary/brief is scripted. Auto-draft it via the LLM from the change + its linked incidents/problem + risk factors, and persist it on the record.',
    steps: [
      'Add a prompt that takes change + linked records + risk factors → a CAB brief.',
      'Generate on demand (button) and/or on submit-to-CAB; persist the brief on the change record.',
      'Render it in the CAB calendar entry + change drawer; allow editing before approval.',
    ],
    acceptance: [
      'A change submitted to CAB has an LLM-drafted brief persisted and editable.',
      'The brief cites the linked incidents/problem.',
      'Test asserts a brief is generated, persisted, and cites the linked records',
    ],
    touchpoints: ['backend change module (prompts/services)', 'frontend CAB calendar + change drawer'],
    notes: 'Plan ref B7.',
  },
  'cab-conflict-window': {
    summary:
      'Conflict detection runs live off `cab_window`. Add the missing half: when a proposed window conflicts, automatically suggest the next safe window.',
    steps: [
      'For a proposed window, query overlapping changes / maintenance windows (already live for detection).',
      'Compute the next non-conflicting window honouring blackout periods and business hours.',
      'Return conflicts + a suggested window to the UI with one-click apply.',
    ],
    acceptance: [
      'Scheduling into a conflicting window surfaces the conflicts and a suggested safe window.',
      'Applying the suggestion reschedules the change.',
      'Tests cover conflict detection and the safe-window suggestion',
    ],
    touchpoints: ['backend change/CAB services', 'frontend CAB calendar'],
    notes: 'CAB Scheduler is "partial" — detection done, auto-pick missing. Plan ref B8.',
  },

  // ── Phase 3 · War room on live data ─────────────────────────────────────
  'warroom-live': {
    summary:
      'The major-incident war room is presentational — clock, roster, comms, actions all live in front-end state. Give it a real backend so comms and actions persist and survive reload.',
    steps: [
      'Add DB models: `major_incident` and `war_room_comms` (+ migration).',
      'Add routes: create/get major incident, post/list comms, roster + actions.',
      'Wire the war-room UI from local state to the API (React Query).',
      'Add the declare-from-P1 flow: promote a P1 incident to a major incident.',
    ],
    acceptance: [
      'Comms and actions persist and survive a reload.',
      'A major incident links back to its originating incident.',
      'Integration tests cover comms persistence and the declare-from-incident flow',
    ],
    touchpoints: ['backend new major_incident module + migration', 'frontend war-room page'],
    notes: 'Plan ref B2.',
  },
  'warroom-summary': {
    summary:
      'The exec briefing on the war-room screen is scripted. Have the Briefing Agent regenerate it live from the incident state + comms log.',
    steps: [
      'Add a prompt: major incident + comms log + timeline → executive summary.',
      'Regenerate on an interval and on demand; persist the last summary + timestamp.',
      'Render it in the war-room header with an "updated Xm ago" freshness indicator.',
    ],
    acceptance: [
      'The summary reflects current state and regenerates.',
      'Freshness is visible to the user.',
      'Test asserts the summary regenerates from incident state',
    ],
    touchpoints: ['backend major_incident services/prompts', 'frontend war-room header'],
    notes: 'Depends on `warroom-live`. Plan ref B3.',
  },

  // ── Phase 4 · Metrics & SLA on real data ────────────────────────────────
  'metrics-agg': {
    summary:
      'The dashboards show fixed charts. Add aggregation endpoints (MTTR, SLA attainment, ticket volume) so they can read live numbers from the records store.',
    steps: [
      'Define the metrics + windows; implement SQL aggregations over the records tables.',
      'Expose endpoints (e.g. `/api/v1/metrics/mttr`, `/sla`, `/volume`) with filters (time range, priority).',
      'Shape responses to match the dashboard chart props; add light caching if needed.',
    ],
    acceptance: [
      'Endpoints return correct aggregates that match the database.',
      'Response shapes are documented and dashboard-ready.',
      'Unit tests assert each aggregate matches known fixture data',
    ],
    touchpoints: ['backend metrics module/routes', 'records store'],
    notes: 'Feeds `dashboards-live`. Plan ref A1.',
  },
  'dashboards-live': {
    summary:
      'Dashboard charts use hardcoded inline series and can contradict the seeds. Wire them to the metrics aggregation API so there is one source of truth.',
    steps: [
      'Replace inline arrays in the dashboard components with React Query fetchers to the metrics endpoints.',
      'Keep the existing chart components; map API responses → chart props.',
      'Remove the seed-derived series.',
    ],
    acceptance: [
      'Charts reflect live data; no hardcoded series remain.',
      'Dashboards and the records store agree.',
    ],
    touchpoints: ['frontend dashboard components/pages', 'frontend/src/services/api.ts'],
    notes: 'Depends on `metrics-agg`. Plan ref A1.',
  },
  'sla-predictive': {
    summary:
      'SLA breach → admin notify is live, but predictive breach is computed client-side. Move prediction server-side into the SLA engine so it is consistent and event-driven.',
    steps: [
      'Implement breach-risk computation in the SLA service (time-to-breach vs remaining work / priority).',
      'Expose it on the incident payload or a dedicated endpoint; emit a warning event ahead of breach.',
      'Have the front end consume the server value and drop the client heuristic.',
    ],
    acceptance: [
      'Predicted breach matches the server computation.',
      'Warnings fire before the breach, not after.',
      'Unit tests cover the breach-risk computation and warning emission',
    ],
    touchpoints: ['backend SLA service', 'frontend incident list/drawer'],
  },
  'notif-roundtrip': {
    summary:
      'The notifications table and SLA-breach admin notify exist; the citizen-portal round-trip does not. Push status updates back to the requester in-portal (and by email).',
    steps: [
      'On service_request / incident status change, enqueue a notification + email (exchange/outbox).',
      'Surface status + a notification feed in the portal "my-requests" view.',
      'Optional: an email deep-link back to the request.',
    ],
    acceptance: [
      'A status change notifies the requester in-portal and by email.',
      'The update is visible in my-requests.',
      'Integration test asserts a status change notifies the requester',
    ],
    touchpoints: ['backend notifications + portal/records', 'exchange/outbox', 'frontend portal'],
  },

  // ── Phase 5 · Ingestion channels & realtime ─────────────────────────────
  'sse-generalize': {
    summary:
      'The galaxy/stream SSE pattern works for one feed. Generalize it into a reusable hub (topics/channels) so war-room comms, an activity ticker, and dashboards can all subscribe.',
    steps: [
      'Extract a generic SSE hub (topic-based) from `galaxy/stream`.',
      'Publish domain events (incident updates, comms, metrics) to topics.',
      'Have the front end subscribe per view; replace per-feature polling where it helps.',
    ],
    acceptance: [
      'At least two consumers (e.g. war-room comms + activity ticker) run off the shared hub.',
      'Tests cover topic publish/subscribe with at least two consumers',
    ],
    touchpoints: ['backend core/galaxy or new core/sse', 'frontend SSE hooks'],
  },
  'email-to-ticket': {
    summary:
      'No inbound email channel today. Turn inbound email into an incident, with reply threading back onto the ticket.',
    steps: [
      'Ingress: poll a mailbox (Exchange/Graph) or accept an inbound webhook from the mail system.',
      'Parse sender/subject/body → incident via the records engine; attach the original message.',
      'Thread replies as worklog entries; dedupe by message-id.',
    ],
    acceptance: [
      'An email creates an incident; a reply appends to it; the sender is notified.',
      'Tests cover happy path, malformed mail, and duplicate message-id',
    ],
    touchpoints: ['backend new ingress (reuse exchange module)', 'records engine', 'notifications'],
    notes: 'Reuse the existing exchange client for mailbox access.',
  },
  'inbound-webhooks': {
    summary:
      'Monitoring alerts should open incidents automatically. Add an authenticated webhook endpoint that maps alert payloads to incidents idempotently.',
    steps: [
      'Add `/api/v1/webhooks/alerts` with auth (shared secret / HMAC signature).',
      'Map payloads (generic / Prometheus / Dynatrace shape) → incident fields; idempotency on alert id.',
      'Optional: auto-correlate to a CI or an existing open incident.',
    ],
    acceptance: [
      'A posted alert creates or updates an incident idempotently.',
      'The signature is verified; unsigned posts are rejected.',
      'Tests cover signed happy path, bad-signature rejection, and idempotency',
    ],
    touchpoints: ['backend new webhooks route', 'records engine'],
  },

  // ── Phase 6 · Drop the scaffolding ──────────────────────────────────────
  'incidents-e2e': {
    summary:
      'Incidents already run end-to-end on the live records engine (create / transition / assign / worklog / SLA / KB citations). Kept here for sequence context; this is the proof the records pattern works.',
    steps: [
      'Verification only: confirm every incident flow hits the API with no seeded fallback.',
    ],
    acceptance: ['Incident CRUD + SLA + citations are all live (already true).'],
    touchpoints: ['backend incident module', 'frontend incidents page'],
    notes: 'Marked done. Plan ref B1.',
  },
  'demo-seeder': {
    summary:
      'A one-click CLI that seeds the canonical demo fixtures into Postgres and resets between runs, so the same walkthrough is reproducible without the scripted front-end layer.',
    steps: [
      'Build a CLI/script that loads the canonical fixtures (INC-1041, PRB-031, CHG-2047, …) into the records tables.',
      'Add a reset command that truncates + reseeds deterministically.',
      'Wire it into compose / dev-test for a one-command demo reset.',
    ],
    acceptance: [
      '`seed` populates a clean DB to the demo state; `reset` restores it.',
      'The demo story survives the swap off fixtures.',
      'Test asserts seed then reset produces a deterministic state',
    ],
    touchpoints: ['backend/demo/seed_*.py', 'docker-compose / dev-test'],
    notes: 'A `seed_runbooks_and_reports.py` already exists — extend that pattern. Plan ref A4/A5.',
  },
  'demo-real-records': {
    summary:
      'Retire the remaining front-end seeded fixtures so the demo runs entirely on real records served by the API.',
    steps: [
      'Inventory the remaining `src/data/seeded*` imports still used by pages.',
      'Replace each with React Query fetchers (types unchanged — the contract is already frozen).',
      'Remove the seed fixtures once nothing imports them.',
    ],
    acceptance: [
      'No page imports seeded fixtures.',
      'The demo runs on Postgres via the seeder.',
    ],
    touchpoints: ['frontend/src/data/*', 'pages/components', 'frontend/src/services/api.ts'],
    notes: 'Depends on `demo-seeder` and the per-module APIs (mostly done). Plan ref A5.',
  },
  'weblogic-wiring': {
    summary:
      'The WebLogic runbook target runs in mock (`WEBLOGIC_MOCK=true`). Wire it to a real WebLogic Admin REST endpoint while keeping the mock for offline/air-gapped demos.',
    steps: [
      'Provision a reachable WebLogic admin endpoint; set credentials/config.',
      'Set `WEBLOGIC_MOCK=false`; verify `AdminWebLogicClient` calls (status / start / stop / redeploy) against it.',
      'Confirm approval gating on HIGH-risk weblogic actions.',
    ],
    acceptance: [
      'weblogic_* tools operate on a live domain through the approval flow.',
      'The mock toggle still works for offline demos.',
      'Smoke test passes against the live target; the mock path stays green',
    ],
    touchpoints: ['backend/app/modules/weblogic/admin_client.py', 'config/env'],
  },

  // ── Phase 7 · Presenter polish ──────────────────────────────────────────
  'storymode-bugs': {
    summary:
      'Two known Story Mode stepper bugs: it does not detect when the presenter navigates off-script, and the "take me back" link does not restore the correct step.',
    steps: [
      'Reproduce both bugs in the presenter story stepper.',
      'Off-script check: detect navigation away from the scripted step and offer to return.',
      'Take-me-back: restore the correct URL/state for the current step.',
    ],
    acceptance: [
      'The stepper recovers from off-script navigation.',
      'The back link returns to the right step.',
    ],
    touchpoints: ['frontend story / beacon stepper components'],
  },
  'demo-autopilot': {
    summary:
      'A hands-free autopilot that runs a demo story end-to-end — camera walk + narration + step advance — with the presenter able to take over at any point.',
    steps: [
      'Drive the existing stepper automatically on a timer / voice cue.',
      'Sync the camera walk + TTS narration per step.',
      'Add play / pause / skip controls; stop on user interaction.',
    ],
    acceptance: [
      'A story plays unattended start-to-finish with narration.',
      'The presenter can take over mid-run.',
    ],
    touchpoints: ['frontend presenter layer (stepper, workspace-map playback, TTS)'],
    notes: 'Builds on the workspace-map playback + galaxy voiceovers that already ship.',
  },
  'arabic-narrations': {
    summary:
      'Arabic narration and i18n of the demo copy — stories, captions, voiceovers — so the whole demo can run in Arabic.',
    steps: [
      'Extract demo copy strings into i18n (ar/en).',
      'Provide Arabic translations; switch the narration TTS voice to AR.',
      'Verify RTL captions + AR TTS pronunciation.',
    ],
    acceptance: [
      'The demo runs fully in Arabic (copy + narration) when AR is selected.',
    ],
    touchpoints: ['frontend i18n locales', 'presenter copy', 'TTS voice selection'],
  },
};
