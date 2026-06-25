/**
 * Value streams — demo paths through the modules they touch. The Zoom Map
 * plays one back: highlight + pan the camera step by step. Module ids must
 * exist in modules.ts (they render as z__<id> on the canvas).
 */
import type { StoryDef } from '../../model/types';
export type { StoryStep, StoryDef } from '../../model/types';

export const STORIES: StoryDef[] = [
  {
    id: 'A', title: 'Book a vehicle over WhatsApp', tone: '#2563eb',
    steps: [
      { module: 'gateway-wa', caption: 'A staff member messages the fleet number on WhatsApp.' },
      { module: 'agent-orch', caption: 'The agent slot-fills the request in Arabic — date, destination, passengers.' },
      { module: 'license-verify', caption: 'It asks for a licence photo and the VLM confirms it is valid.' },
      { module: 'availability', caption: 'A vehicle free for the whole window is found (GiST no-overlap).' },
      { module: 'booking-engine', caption: 'The booking is confirmed transactionally — no double-booking.' },
    ],
  },
  {
    id: 'B', title: 'Nothing free? Negotiate', tone: '#0d9488',
    steps: [
      { module: 'agent-orch', caption: 'The first choice is taken at that time.' },
      { module: 'negotiation', caption: 'Best-enabler options are offered — a nearby slot or an alternate category.' },
      { module: 'escalation', caption: 'For an official mission, it escalates to an operator with a bump recommendation.' },
    ],
  },
  {
    id: 'C', title: 'Staff override + audit', tone: '#7c3aed',
    steps: [
      { module: 'dashboard', caption: 'A fleet manager reassigns a VIP booking from the dashboard.' },
      { module: 'booking-engine', caption: 'The lower-priority booking is bumped and re-offered.' },
      { module: 'audit-log', caption: 'Every change is written to the immutable audit trail.' },
    ],
  },
];
