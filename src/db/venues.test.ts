import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { closePool, getPool } from './pool.js';
import { createVenue, DuplicateVenueNameError, listVenues, venueNameKey } from './venues.js';

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
      `INSERT INTO venues (name, name_key, address, created_at)
       VALUES ('Beta', 'beta', 'b', '2026-10-16T10:00:00Z'),
              ('Alpha', 'alpha', 'a', '2026-10-16T10:00:00Z')`,
    );
    expect((await listVenues()).map((v) => v.name)).toEqual(['Alpha', 'Beta']);
  });

  it('returns an empty list when there are no venues', async () => {
    expect(await listVenues()).toEqual([]);
  });

  describe('unique name ignoring case and surrounding spaces', () => {
    const NAME = 'Quán Ốc Đào';
    const add = (name: string) => createVenue({ name, address: '1 Lê Lợi' });

    it('computes the key in JavaScript, keeping diacritics', () => {
      expect(venueNameKey('  QUÁN ỐC ĐÀO ')).toBe('quán ốc đào');
      expect(venueNameKey(NAME.normalize('NFD'))).toBe(venueNameKey(NAME));
      expect(venueNameKey('Quan Oc Dao')).not.toBe(venueNameKey(NAME));
    });

    it.each(['quán ốc đào', 'QUÁN ỐC ĐÀO', '  Quán Ốc Đào  ', NAME.normalize('NFD')])(
      'refuses %j after "Quán Ốc Đào"',
      async (duplicate) => {
        await add(NAME);
        await expect(add(duplicate)).rejects.toBeInstanceOf(DuplicateVenueNameError);
        expect((await listVenues()).map((v) => v.name)).toEqual([NAME]);
      },
    );

    it('accepts a name that differs only in diacritics', async () => {
      await add(NAME);
      await add('Quan Oc Dao');
      expect((await listVenues()).map((v) => v.name)).toEqual([NAME, 'Quan Oc Dao']);
    });

    it('stores the name trimmed', async () => {
      const created = await add('  Quán Ốc Đào  ');
      expect(created.name).toBe(NAME);
      expect((await listVenues()).map((v) => v.name)).toEqual([NAME]);
    });

    it('re-throws other database errors unchanged', async () => {
      const err = await createVenue({ name: 'X', address: null as unknown as string }).catch(
        (e: unknown) => e,
      );
      expect(err).not.toBeInstanceOf(DuplicateVenueNameError);
      expect((err as { code?: string }).code).toBe('23502');
    });

    it('keeps exactly one row when two adds race', async () => {
      const results = await Promise.allSettled([add(NAME), add(NAME.toUpperCase())]);
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(DuplicateVenueNameError);
      expect(await listVenues()).toHaveLength(1);
    });
  });
});
