import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { closePool, getPool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

const sql = (text: string, params: unknown[]) => getPool().query(text, params);

describe('GET /history', () => {
  let venueId: string;
  let organizerId: string;

  beforeEach(async () => {
    await resetDb();
    venueId = (await createVenue({ name: 'Quán A', address: '1 Lê Lợi', mapsUrl: 'https://maps.example/a' })).id;
    organizerId = (await asParticipant('Minh')).participant.id;
  });
  afterAll(async () => {
    await closePool();
  });

  const make = (date: string) =>
    createOuting({ date, sitTime: '18:30', closeTime: '10:00', venueIds: [venueId], organizerId });
  const close = (id: string, extra = '', params: unknown[] = []) =>
    sql(`UPDATE outings SET closed_at = now()${extra} WHERE id = $1`, [id, ...params]);
  const goingN = async (id: string, n: number) => {
    for (let i = 0; i < n; i++) await setAnswer(id, (await asParticipant(`P${i}-${id}`)).participant.id, true);
  };
  const getHistory = async () => {
    const { headers } = await asParticipant('Lan');
    return createApp().request('/history', { headers });
  };

  it('requires an identity', async () => {
    const res = await createApp().request('/history');
    expect(res.status).not.toBe(200);
  });

  it('lists closed outings newest first, without open ones, each linking to the outing', async () => {
    const d10 = await make('2030-10-10');
    const d15 = await make('2030-10-15');
    const d12 = await make('2030-10-12');
    const open = await make('2030-10-20');
    for (const id of [d10, d15, d12]) await close(id);
    const html = await (await getHistory()).text();
    const order = [d15, d12, d10].map((id) => html.indexOf(`href="/outings/${id}"`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((x, y) => x - y));
    expect(html).not.toContain(`/outings/${open}"`);
    const { headers } = await asParticipant('Lan');
    expect((await createApp().request(`/outings/${d12}`, { headers })).status).toBe(200);
  });

  it('shows a won line with each visit mark', async () => {
    const yes = await make('2030-10-15');
    const no = await make('2030-10-14');
    const unknown = await make('2030-10-13');
    await goingN(yes, 4);
    await close(yes, ', winner_venue_id = $2, visited = true', [venueId]);
    await close(no, ', winner_venue_id = $2, visited = false', [venueId]);
    await close(unknown, ', winner_venue_id = $2', [venueId]);
    const html = await (await getHistory()).text();
    expect(html).toContain('15/10/2030 · Quán A · 4 người · Đã đi');
    expect(html).toContain('14/10/2030 · Quán A · 0 người · Không đi');
    expect(html).toContain('13/10/2030 · Quán A · 0 người · Chưa xác nhận');
  });

  it('shows a waiting line', async () => {
    const id = await make('2030-10-15');
    await goingN(id, 3);
    await close(id);
    const html = await (await getHistory()).text();
    expect(html).toContain('15/10/2030 · chưa chọn quán · 3 người · Chưa xác nhận');
  });

  it('shows a cancelled line', async () => {
    const id = await make('2030-10-15');
    await goingN(id, 2);
    await close(id, ', cancelled = true');
    const html = await (await getHistory()).text();
    expect(html).toContain('15/10/2030 · Đã huỷ (không đủ quân) · 2 người');
  });

  it('escapes the venue name', async () => {
    const v = (await createVenue({ name: '<b>X</b>', address: 'a' })).id;
    const id = await createOuting({
      date: '2030-10-15',
      sitTime: '18:30',
      closeTime: '10:00',
      venueIds: [v],
      organizerId,
    });
    await close(id, ', winner_venue_id = $2', [v]);
    const html = await (await getHistory()).text();
    expect(html).not.toContain('<b>X</b>');
    expect(html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });

  it('shows an empty message when nothing is closed', async () => {
    await make('2030-10-15');
    const html = await (await getHistory()).text();
    expect(html).toContain('Chưa có kèo nào trong lịch sử.');
  });

  it('is linked from the home page', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await (await createApp().request('/', { headers })).text();
    expect(html).toContain('href="/history"');
    expect(html).toContain('Lịch sử');
  });
});
