import { afterAll, describe, expect, it } from 'vitest';
import { closePool, getPool } from './pool.js';

describe('pool', () => {
  afterAll(async () => {
    await closePool();
  });

  it('returns one shared pool until it is closed', async () => {
    const p = getPool();
    expect(getPool()).toBe(p);
    await closePool();
    expect(getPool()).not.toBe(p);
  });

  it('returns DATE values as raw YYYY-MM-DD strings', async () => {
    const { rows } = await getPool().query("SELECT '2026-10-16'::date AS d");
    expect(rows[0].d).toBe('2026-10-16');
  });
});
