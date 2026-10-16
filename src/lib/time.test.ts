import { describe, expect, it } from 'vitest';
import { formatDate, formatTime, isReached, isValidDate, isValidTime, nowTimeIn, todayIn } from './time.js';

describe('todayIn', () => {
  it('rolls over to the next day in Vietnam time', () => {
    expect(todayIn('Asia/Ho_Chi_Minh', new Date('2026-10-14T20:00:00Z'))).toBe('2026-10-15');
  });
  it('is still the same day at 16:59Z', () => {
    expect(todayIn('Asia/Ho_Chi_Minh', new Date('2026-10-15T16:59:00Z'))).toBe('2026-10-15');
  });
  it('is the next day at 17:00Z', () => {
    expect(todayIn('Asia/Ho_Chi_Minh', new Date('2026-10-15T17:00:00Z'))).toBe('2026-10-16');
  });
  it('defaults to the configured zone', () => {
    expect(todayIn(undefined, new Date('2026-10-15T17:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatDate / formatTime', () => {
  it('formats a date as dd/mm/yyyy', () => {
    expect(formatDate('2026-10-15')).toBe('15/10/2026');
  });
  it('formats times as HH:mm', () => {
    expect(formatTime('18:30:00')).toBe('18:30');
    expect(formatTime('18:30')).toBe('18:30');
  });
});

describe('isValidDate', () => {
  it('accepts real dates', () => {
    expect(isValidDate('2026-10-15')).toBe(true);
    expect(isValidDate('2028-02-29')).toBe(true);
  });
  it('rejects impossible or malformed dates', () => {
    for (const s of ['2026-02-30', '2026-13-01', '2026-1-1', '15/10/2026', '', '2026-10-15x']) {
      expect(isValidDate(s)).toBe(false);
    }
  });
});

describe('isValidTime', () => {
  it('accepts 24-hour HH:mm', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });
  it('rejects bad times', () => {
    for (const s of ['24:00', '7:5', '12:60', '18:30:00', '', 'ab:cd']) {
      expect(isValidTime(s)).toBe(false);
    }
  });
});

describe('nowTimeIn', () => {
  it('applies the UTC+7 offset', () => {
    expect(nowTimeIn('Asia/Ho_Chi_Minh', new Date('2026-10-20T09:30:00Z'))).toBe('16:30');
  });
  it('wraps past midnight as 00:xx, not 24:xx', () => {
    expect(nowTimeIn('Asia/Ho_Chi_Minh', new Date('2026-10-19T17:05:00Z'))).toBe('00:05');
  });
});

describe('isReached', () => {
  const tz = 'Asia/Ho_Chi_Minh';
  const at = (iso: string) => ({ tz, now: new Date(iso) });
  it('is true at and after the moment, false before', () => {
    expect(isReached('2026-10-20', '16:00', at('2026-10-20T08:59:00Z'))).toBe(false);
    expect(isReached('2026-10-20', '16:00', at('2026-10-20T09:00:00Z'))).toBe(true);
    expect(isReached('2026-10-20', '16:00', at('2026-10-20T09:30:00Z'))).toBe(true);
  });
  it('uses the zone, not UTC, around midnight', () => {
    // 2026-10-19T17:00Z is 00:00 on 20/10 in Vietnam
    expect(isReached('2026-10-20', '00:00', at('2026-10-19T16:59:00Z'))).toBe(false);
    expect(isReached('2026-10-20', '00:00', at('2026-10-19T17:00:00Z'))).toBe(true);
  });
  it('treats earlier dates as reached and later dates as not', () => {
    expect(isReached('2026-10-19', '23:59', at('2026-10-20T09:00:00Z'))).toBe(true);
    expect(isReached('2026-10-21', '00:00', at('2026-10-20T09:00:00Z'))).toBe(false);
  });
});
