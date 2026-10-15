import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { config } from '../config.js';
import { closePool, getPool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { todayIn } from '../lib/time.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

const post = (headers: Record<string, string>, body: URLSearchParams) =>
  createApp().request('/outings', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

describe('create outing', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('home links to the form', async () => {
    const { headers } = await asParticipant();
    const html = await (await createApp().request('/', { headers })).text();
    expect(html).toContain('href="/outings/new"');
    expect(html).toContain('Tạo kèo');
  });

  it('form shows defaults and every venue', async () => {
    const { headers } = await asParticipant();
    await createVenue({ name: 'Quán A', address: '1 A' });
    await createVenue({ name: 'Quán B', address: '2 B' });
    const res = await createApp().request('/outings/new', { headers });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('type="date"');
    expect(html).toContain('value="18:30"');
    expect(html).toContain(`value="${config.defaultCloseAt}"`);
    expect(html).toContain('Quán A');
    expect(html).toContain('Quán B');
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(2);
  });

  it('prefills a non-default close time', async () => {
    const { headers } = await asParticipant();
    const original = config.defaultCloseAt;
    config.defaultCloseAt = '15:45';
    try {
      const html = await (await createApp().request('/outings/new', { headers })).text();
      expect(html).toContain('value="15:45"');
    } finally {
      config.defaultCloseAt = original;
    }
  });

  it('creates the outing, records the organizer and redirects to its page', async () => {
    const { participant, headers } = await asParticipant();
    const a = await createVenue({ name: 'Quán A', address: '1 A' });
    const b = await createVenue({ name: 'Quán B', address: '2 B' });
    const res = await post(
      headers,
      new URLSearchParams([
        ['date', todayIn()],
        ['sitTime', '18:30'],
        ['closeTime', '16:00'],
        ['venueIds', a.id],
        ['venueIds', b.id],
      ]),
    );
    expect(res.status).toBe(303);
    const location = res.headers.get('location') ?? '';
    expect(location).toMatch(/^\/outings\/[0-9a-f-]{36}$/);
    const page = await (await createApp().request(location, { headers })).text();
    const [y, m, d] = todayIn().split('-');
    expect(page).toContain(`${d}/${m}/${y}`);
    expect(page).toContain('18:30');
    expect(page).toContain('16:00');
    expect(page).toContain('Quán A');
    expect(page).toContain('Quán B');
    const { rows } = await getPool().query('SELECT organizer_id FROM outings');
    expect(rows).toHaveLength(1);
    expect(rows[0].organizer_id).toBe(participant.id);
  });

  it('rejects a malformed date with 400 and creates nothing', async () => {
    const { headers } = await asParticipant();
    const a = await createVenue({ name: 'Quán A', address: '1 A' });
    const res = await post(
      headers,
      new URLSearchParams([
        ['date', '31/02/2030'],
        ['sitTime', '18:30'],
        ['closeTime', '16:00'],
        ['venueIds', a.id],
      ]),
    );
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('role="alert"');
    const { rows } = await getPool().query('SELECT id FROM outings');
    expect(rows).toHaveLength(0);
  });
});
