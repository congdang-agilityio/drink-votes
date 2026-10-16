import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { getAttendance } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { closePool, getPool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { qrSvg } from '../lib/qr.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

vi.mock('../lib/qr.js', async (orig) => {
  const actual = await orig<typeof import('../lib/qr.js')>();
  return { ...actual, qrSvg: vi.fn(actual.qrSvg) };
});

const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };

async function seed(organizerId: string) {
  const venue = await createVenue({
    name: 'Quán Ốc Đào',
    address: '1 Lê Lợi',
    mapsUrl: 'https://maps.example/a',
  });
  const id = await createOuting({
    date: '2030-05-17',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [venue.id],
    organizerId,
  });
  return { id, venueId: venue.id };
}

/** The link the outing page passes to the QR code, as a path to request. */
async function scanPath(organizerHeaders: { Cookie: string }, id: string): Promise<string> {
  vi.mocked(qrSvg).mockClear();
  const res = await createApp().request(`/outings/${id}`, { headers: organizerHeaders });
  expect(res.status).toBe(200);
  const link = vi.mocked(qrSvg).mock.calls.at(-1)?.[0] as string;
  expect(link).toBeTruthy();
  const url = new URL(link);
  expect(url.hash).toBe('');
  expect(url.search).toBe('');
  return url.pathname;
}

const count = async (table: 'attendance' | 'votes', outingId: string, participantId: string) =>
  (
    await getPool().query(
      `SELECT count(*)::int AS n FROM ${table} WHERE outing_id = $1 AND participant_id = $2`,
      [outingId, participantId],
    )
  ).rows[0].n as number;

describe('scanning an outing QR link', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('answers nothing for a named participant who opens the link', async () => {
    const organizer = await asParticipant('Minh');
    const scanner = await asParticipant('Lan');
    const { id } = await seed(organizer.participant.id);
    const path = await scanPath(organizer.headers, id);

    expect(path).toBe(`/outings/${id}`);
    const res = await createApp().request(path, { headers: scanner.headers });
    expect(res.status).toBe(200);
    expect(await count('attendance', id, scanner.participant.id)).toBe(0);
    expect(await count('votes', id, scanner.participant.id)).toBe(0);
  });

  it('lets the scanner answer Đi and vote as through the chat link', async () => {
    const organizer = await asParticipant('Minh');
    const scanner = await asParticipant('Lan');
    const { id, venueId } = await seed(organizer.participant.id);
    const path = await scanPath(organizer.headers, id);
    const app = createApp();

    expect((await app.request(path, { headers: scanner.headers })).status).toBe(200);
    const answer = await app.request(`${path}/answer`, {
      method: 'POST',
      headers: { ...FORM, ...scanner.headers },
      body: new URLSearchParams({ going: 'yes' }).toString(),
    });
    expect(answer.status).toBeLessThan(400);
    const vote = await app.request(`${path}/vote`, {
      method: 'POST',
      headers: { ...FORM, ...scanner.headers },
      body: new URLSearchParams({ venueId }).toString(),
    });
    expect(vote.status).toBeLessThan(400);

    const attendance = await getAttendance(id);
    expect(attendance.goingNames).toContain('Lan');
    expect(await count('votes', id, scanner.participant.id)).toBe(1);
  });

  it('asks a new phone for a name first, then returns to the outing', async () => {
    const organizer = await asParticipant('Minh');
    const { id } = await seed(organizer.participant.id);
    const path = await scanPath(organizer.headers, id);
    const app = createApp();

    const first = await app.request(path);
    expect(first.status).toBeGreaterThanOrEqual(300);
    expect(first.status).toBeLessThan(400);
    const prompt = new URL(first.headers.get('location') ?? '', 'http://localhost');
    expect(prompt.pathname).toBe('/name');
    expect(prompt.searchParams.get('next')).toBe(`/outings/${id}`);

    const posted = await app.request('/name', {
      method: 'POST',
      headers: FORM,
      body: new URLSearchParams({ name: 'Lan', next: `/outings/${id}` }).toString(),
    });
    expect(posted.status).toBe(303);
    expect(posted.headers.get('location')).toBe(`/outings/${id}`);
    const cookie = (posted.headers.get('set-cookie') ?? '').split(';')[0];

    const page = await app.request(path, { headers: { Cookie: cookie } });
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain('17/05/2030');
    expect(html).toContain('Quán Ốc Đào');
  });
});
