import { describe, expect, it } from 'vitest';
import { formatDate, formatTime, isValidDate, isValidTime, todayIn } from './time.js';

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
