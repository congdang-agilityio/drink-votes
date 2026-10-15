import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../test/db.js';
import { createOuting, getOuting } from './outings.js';
import { createParticipant } from './participants.js';
import { closePool, getPool } from './pool.js';
import { createVenue } from './venues.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

const count = async (table: string) =>
  (await getPool().query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;

describe('outings store', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('creates an outing with two venues and reads every field back in chosen order', async () => {
    const organizer = await createParticipant('Lan');
    const a = await createVenue({ name: 'Quán Ốc Đào', address: '212B Nguyễn Trãi' });
    const b = await createVenue({
      name: 'Bia Hơi Hà Nội',
      address: '1 Lê Lợi',
      mapsUrl: 'https://maps.app.goo.gl/x',
      notes: 'bia tươi',
    });

    const id = await createOuting({
      date: '2026-12-31',
      sitTime: '18:30',
      closeTime: '16:00',
      venueIds: [b.id, a.id],
      organizerId: organizer.id,
    });

    expect(id).toMatch(UUID);
    expect(await getOuting(id)).toEqual({
      id,
      date: '2026-12-31',
      sitTime: '18:30',
      closeTime: '16:00',
      organizerId: organizer.id,
      venues: [b, a],
    });
  });

  it('records the creating participant as organizer', async () => {
    const lan = await createParticipant('Lan');
    const minh = await createParticipant('Minh');
    const v1 = await createVenue({ name: 'A', address: 'a' });
    const v2 = await createVenue({ name: 'B', address: 'b' });
    const id = await createOuting({
      date: '2026-11-01',
      sitTime: '19:05',
      closeTime: '17:45',
      venueIds: [v1.id, v2.id],
      organizerId: minh.id,
    });
    const outing = await getOuting(id);
    expect(outing?.organizerId).toBe(minh.id);
    expect(outing?.organizerId).not.toBe(lan.id);
  });

  it('returns date and times in fixed formats regardless of the session time zone', async () => {
    const organizer = await createParticipant('Lan');
    const v1 = await createVenue({ name: 'A', address: 'a' });
    const v2 = await createVenue({ name: 'B', address: 'b' });
    const id = await createOuting({
      date: '2027-01-01',
      sitTime: '00:00',
      closeTime: '23:59',
      venueIds: [v1.id, v2.id],
      organizerId: organizer.id,
    });
    const pool = getPool();
    await pool.query("SET TIME ZONE 'Pacific/Kiritimati'");
    try {
      const outing = await getOuting(id);
      expect([outing?.date, outing?.sitTime, outing?.closeTime]).toEqual([
        '2027-01-01',
        '00:00',
        '23:59',
      ]);
    } finally {
      await closePool();
    }
  });

  it('rolls back the whole outing when a venue id is unknown', async () => {
    const organizer = await createParticipant('Lan');
    const v1 = await createVenue({ name: 'A', address: 'a' });
    await expect(
      createOuting({
        date: '2026-12-31',
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: [v1.id, UNKNOWN],
        organizerId: organizer.id,
      }),
    ).rejects.toThrow();
    expect(await count('outings')).toBe(0);
    expect(await count('outing_venues')).toBe(0);
  });

  it('rejects an unknown organizer at the database level', async () => {
    const v1 = await createVenue({ name: 'A', address: 'a' });
    const v2 = await createVenue({ name: 'B', address: 'b' });
    await expect(
      createOuting({
        date: '2026-12-31',
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: [v1.id, v2.id],
        organizerId: UNKNOWN,
      }),
    ).rejects.toThrow(/foreign key/);
    expect(await count('outings')).toBe(0);
  });

  it('returns null for an unknown id', async () => {
    expect(await getOuting(UNKNOWN)).toBeNull();
  });

  it('returns null for a malformed id instead of throwing', async () => {
    expect(await getOuting('not-a-uuid')).toBeNull();
    expect(await getOuting('')).toBeNull();
    expect(await getOuting("1' OR '1'='1")).toBeNull();
  });

  it('indexes outings by date and sitting time', async () => {
    const { rows } = await getPool().query(
      "SELECT indexdef FROM pg_indexes WHERE tablename = 'outings'",
    );
    expect(rows.map((r) => r.indexdef).join('\n')).toMatch(/\(outing_date, sit_time\)/);
  });
});
