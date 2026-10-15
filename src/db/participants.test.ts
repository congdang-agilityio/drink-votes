import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { createParticipant, findParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';

describe('participants store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('creates a participant and finds it again by id', async () => {
    const created = await createParticipant('Lan');
    expect(created.displayName).toBe('Lan');
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await findParticipant(created.id)).toEqual({ id: created.id, displayName: 'Lan' });
  });

  it('allows two participants with the same name, each with its own id', async () => {
    const a = await createParticipant('Lan');
    const b = await createParticipant('Lan');
    expect(a.id).not.toBe(b.id);
    expect((await findParticipant(a.id))?.displayName).toBe('Lan');
    expect((await findParticipant(b.id))?.displayName).toBe('Lan');
  });

  it('returns null for an unknown id', async () => {
    expect(await findParticipant('00000000-0000-4000-8000-000000000000')).toBeNull();
  });

  it('returns null for a malformed id instead of throwing', async () => {
    expect(await findParticipant('not-a-uuid')).toBeNull();
    expect(await findParticipant('')).toBeNull();
    expect(await findParticipant("1' OR '1'='1")).toBeNull();
  });

  it('rejects a blank display name at the database level', async () => {
    const pool = getPool();
    await expect(
      pool.query('INSERT INTO participants (display_name) VALUES ($1)', ['   ']),
    ).rejects.toThrow(/check constraint/);
    await expect(
      pool.query('INSERT INTO participants (display_name) VALUES ($1)', ['']),
    ).rejects.toThrow(/check constraint/);
    await expect(
      pool.query('INSERT INTO participants (display_name) VALUES (NULL)'),
    ).rejects.toThrow(/null value/);
  });
});
