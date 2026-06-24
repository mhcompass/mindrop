/**
 * Build stamp — when this map was last reconciled against the real
 * yc-itsm codebase, and against which active profile. Surfaced in the
 * header so anyone viewing knows how current the picture is. Bump the
 * date + scope whenever the model files here are brought up to date.
 */
export const BUILD_STAMP = {
  /** Date the model was last reconciled with the codebase (ISO). */
  date: '2026-06-21',
  /** Active deployment profile the stamp reflects. */
  profile: 'moe',
  /** One-line summary of what's landed as of this stamp. */
  scope: 'ITIL slices 1–8 · multi-tenant profiling · EN/AR locker · Fleet Operations · dual-admin approvals · governance toggle',
};
