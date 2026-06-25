/**
 * Value streams — demo paths through the modules they touch. The Zoom Map
 * plays one back: highlight + pan the camera step by step. Module ids must
 * exist in modules.ts (they render as z__<id> on the canvas).
 */
import type { StoryDef } from '../../model/types';
export type { StoryStep, StoryDef } from '../../model/types';

export const STORIES: StoryDef[] = [
  {
    id: 'A', title: 'Recording → polished video', tone: '#2563eb',
    steps: [
      { module: 'extension', caption: 'A screen recording is captured and uploaded from the browser.' },
      { module: 'transcription-worker', caption: 'Whisper transcribes the narration with segment timing.' },
      { module: 'enhancement-worker', caption: 'The LLM cleans up filler words and tightens the script.' },
      { module: 'tts-worker', caption: 'A fresh voiceover is generated in the chosen language.' },
      { module: 'video-render-worker', caption: 'FFmpeg renders the final cut — auto-zoom, effects, voiceover.' },
    ],
  },
  {
    id: 'B', title: 'Auto-generated docs', tone: '#db2777',
    steps: [
      { module: 'transcription-worker', caption: 'The same transcript + extracted frames feed the doc pipeline.' },
      { module: 'doc-generator', caption: 'The LLM structures it into ordered steps with screenshots.' },
      { module: 'api-docs', caption: 'The guide is exported to Markdown, PDF or HTML.' },
    ],
  },
  {
    id: 'C', title: 'Watch it render, live', tone: '#7c3aed',
    steps: [
      { module: 'web-uploader', caption: 'The upload kicks off the processing pipeline.' },
      { module: 'arq-queue', caption: 'Jobs run on the Redis-backed worker queue.' },
      { module: 'api-websocket', caption: 'Progress streams back over the WebSocket.' },
      { module: 'web-video-editor', caption: 'The editor updates live as each stage completes.' },
    ],
  },
];
