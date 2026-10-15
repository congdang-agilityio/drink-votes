/** Longest display name accepted, in characters after trimming (shared with the change-name page). */
export const DISPLAY_NAME_MAX_LENGTH = 50;

/** The trimmed display name, or null when it is missing or only spaces. */
export function normalizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim();
  return name === '' ? null : name;
}
