/**
 * Value streams — the demo runbook stories (A–F) expressed as ordered
 * paths through the modules they touch. The Zoom Map plays one back:
 * highlight + pan the camera step by step.
 */
import type { StoryDef } from '../../model/types';
export type { StoryStep, StoryDef } from '../../model/types';

export const STORIES: StoryDef[] = [
  {
    id: 'A', title: 'Compass saw the outage first', tone: '#e11d48',
    steps: [
      { module: 't_inc', caption: 'Eight schools report VPN dropouts — tickets land in the incident queue.' },
      { module: 't_war', caption: 'Compass detects the cluster, declares SEV-1 and opens the war room.' },
      { module: 't_prob', caption: 'It links the outage to Problem 031 — same tunnel, same window.' },
      { module: 't_chg', caption: 'A permanent fix is proposed: pin the district to the standby tunnel.' },
      { module: 't_gov', caption: 'Every step is replayable, auditable and approval-gated.' },
    ],
  },
  {
    id: 'B', title: 'The exam-day save', tone: '#3b82f6',
    steps: [
      { module: 't_inc', caption: 'Exam software will not launch — Compass classifies it P1.' },
      { module: 't_know', caption: 'It cites Exam Procedures §2 with the v3 rollback playbook.' },
      { module: 't_cmdb', caption: 'The CMDB confirms which lab PCs across three labs are affected.' },
      { module: 't_portal', caption: 'The principal sees status on the portal in real time.' },
    ],
  },
  {
    id: 'C', title: 'Pattern → permanent fix', tone: '#a855f7',
    steps: [
      { module: 't_prob', caption: 'A recurring pattern surfaces across this month’s incidents.' },
      { module: 't_chg', caption: 'Engineering proposes a change to address the root cause.' },
      { module: 't_cab', caption: 'CAB schedules it inside the safest maintenance window.' },
    ],
  },
  {
    id: 'D', title: 'The teacher’s day', tone: '#10b981',
    steps: [
      { module: 't_portal', caption: 'A teacher logs into the school portal to request a device.' },
      { module: 't_catalog', caption: 'She picks the laptop service from the catalog.' },
      { module: 't_inc', caption: 'The request is tracked as a ticket through to fulfillment.' },
    ],
  },
  {
    id: 'E', title: 'AI you can trust', tone: '#f59e0b',
    steps: [
      { module: 't_gov', caption: 'Flip the kill switch live — agents pause; flip back.' },
      { module: 't_trace', caption: 'Open a replayable decision: prompt → context → tools → response.' },
      { module: 't_compose', caption: 'It all ran on the on-prem Foundry box — inside the boundary.' },
    ],
  },
  {
    id: 'F', title: 'Phone channel · AR + EN', tone: '#0d9488',
    steps: [
      { module: 't_phone', caption: 'Principal calls in — Whisper transcribes in real time.' },
      { module: 't_voice', caption: 'Compass replies in Arabic via Kokoro, mirrors to English.' },
      { module: 't_chat', caption: 'The agent classifies the issue and drafts the ticket.' },
      { module: 't_inc', caption: 'INC-1037 is opened with KB clauses attached.' },
    ],
  },
];
