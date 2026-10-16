import { config } from '../config.js';

/** Calendar date (YYYY-MM-DD) in the given time zone. */
export function todayIn(tz: string = config.appTz, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Current time (HH:mm, 24-hour) in the given time zone. */
export function nowTimeIn(tz: string = config.appTz, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('hour')}:${get('minute')}`;
}

/** Whether now is at or after date (YYYY-MM-DD) + time (HH:mm) in the given zone. */
export function isReached(
  date: string,
  time: string,
  { tz = config.appTz, now = new Date() }: { tz?: string; now?: Date } = {},
): boolean {
  const today = todayIn(tz, now);
  if (today !== date) return today > date;
  return nowTimeIn(tz, now) >= time;
}

/** Whether s is a real calendar date written YYYY-MM-DD. */
export function isValidDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** Whether s is a 24-hour time written HH:mm. */
export function isValidTime(s: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

/** YYYY-MM-DD to dd/mm/yyyy (pure string work, no Date). */
export function formatDate(s: string): string {
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

/** HH:mm or HH:mm:ss to HH:mm. */
export function formatTime(s: string): string {
  return s.slice(0, 5);
}
