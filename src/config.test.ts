import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('uses defaults', () => {
    const c = loadConfig({});
    expect(c.port).toBe(3000);
    expect(c.appTz).toBe('Asia/Ho_Chi_Minh');
    expect(c.defaultCloseAt).toBe('16:00');
    expect(c.minPeople).toBe(3);
  });

  it('reads MIN_PEOPLE', () => {
    expect(loadConfig({ MIN_PEOPLE: '5' }).minPeople).toBe(5);
  });

  it.each(['0', '-1', '1.5', 'abc', ''])('rejects MIN_PEOPLE %j', (v) => {
    expect(() => loadConfig({ MIN_PEOPLE: v })).toThrow(/MIN_PEOPLE/);
  });

  it('reads values from the given env', () => {
    const c = loadConfig({
      PORT: '4101',
      APP_TZ: 'UTC',
      DEFAULT_CLOSE_AT: '09:30',
      DATABASE_URL: 'postgresql://x/y',
    });
    expect(c).toMatchObject({ port: 4101, appTz: 'UTC', defaultCloseAt: '09:30' });
    expect(c.databaseUrl).toBe('postgresql://x/y');
  });

  it.each(['25:00', '9:30', '16:60', 'abc', ''])('rejects DEFAULT_CLOSE_AT %j', (v) => {
    expect(() => loadConfig({ DEFAULT_CLOSE_AT: v })).toThrow(/DEFAULT_CLOSE_AT/);
  });

  it.each(['0', '-1', '1.5', 'abc', ''])('rejects PORT %j', (v) => {
    expect(() => loadConfig({ PORT: v })).toThrow(/PORT/);
  });

  it('throws a clear error only when DATABASE_URL is read and missing', () => {
    const c = loadConfig({});
    expect(() => c.databaseUrl).toThrow(/DATABASE_URL/);
  });
});
