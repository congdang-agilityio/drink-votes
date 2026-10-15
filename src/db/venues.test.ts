import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { closePool, getPool } from './pool.js';
import { createVenue, listVenues } from './venues.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('venues store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('round-trips a venue with all four values, including Vietnamese text', async () => {
    const input = {
      name: 'Quán Ốc Đào',
      address: '212B Nguyễn Trãi, Quận 1, TP.HCM',
      mapsUrl: 'https://maps.app.goo.gl/abc123',
      notes: 'có chỗ để xe, bia tươi',
    };
    const created = await createVenue(input);
    expect(created).toEqual({ id: expect.stringMatching(UUID), ...input });

    expect(await listVenues()).toEqual([created]);
  });

  it('stores missing or empty optional values as null', async () => {
    await createVenue({ name: 'Bia Hơi Hà Nội', address: '1 Lê Lợi' });
    await createVenue({ name: 'Quán Nhậu Tự Do', address: '2 Lê Lợi', mapsUrl: '', notes: '' });

    const venues = await listVenues();
    expect(venues.map((v) => [v.name, v.mapsUrl, v.notes])).toEqual([
      ['Bia Hơi Hà Nội', null, null],
      ['Quán Nhậu Tự Do', null, null],
    ]);
    const { rows } = await getPool().query(
      'SELECT count(*)::int AS n FROM venues WHERE maps_url IS NULL AND notes IS NULL',
    );
    expect(rows[0].n).toBe(2);
  });

  it('lists venues in creation order', async () => {
    for (const name of ['Zeta', 'Alpha', 'Mu']) {
      await createVenue({ name, address: 'somewhere' });
    }
    expect((await listVenues()).map((v) => v.name)).toEqual(['Zeta', 'Alpha', 'Mu']);
  });

  it('breaks a created_at tie by name', async () => {
    await getPool().query(
      `INSERT INTO venues (name, address, created_at)
       VALUES ('Beta', 'b', '2026-10-16T10:00:00Z'), ('Alpha', 'a', '2026-10-16T10:00:00Z')`,
    );
    expect((await listVenues()).map((v) => v.name)).toEqual(['Alpha', 'Beta']);
  });

  it('returns an empty list when there are no venues', async () => {
    expect(await listVenues()).toEqual([]);
  });
});
