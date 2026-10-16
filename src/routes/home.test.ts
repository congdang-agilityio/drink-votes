import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { closePool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

describe('GET /', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('serves the Vietnamese home page', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/', { headers });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Drink Tonight</title>');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Tonight[\s\S]*<\/header>/);
    expect(html).toContain('Rủ nhau đi nhậu: ai đi, quán nào, mấy giờ.');
    expect(html).toContain('name="viewport"');
    expect(html).not.toMatch(/<form|type="password"|login|đăng nhập/i);
    expect(html).not.toMatch(/English|hreflang|lang-switch/i);
  });

  it('shows the name and a change-name link in the header', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await (await createApp().request('/', { headers })).text();
    expect(html).toMatch(/<header[^>]*>[\s\S]*Lan[\s\S]*<\/header>/);
    expect(html).toContain('href="/me/name?next=%2F"');
    expect(html).toContain('Đổi tên');
  });

  it('shows the new name after renaming, on / and on an outing page', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/me/name', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Lan Anh', next: '/' }),
    });
    expect(res.status).toBe(303);
    const html = await (await createApp().request('/', { headers })).text();
    expect(html).toMatch(/<header[^>]*>[\s\S]*Lan Anh[\s\S]*<\/header>/);
    const venue = await createVenue({ name: 'Quán A', address: '1 Lê Lợi', mapsUrl: 'https://maps.example/a' });
    const id = await createOuting({
      date: '2030-05-17',
      sitTime: '18:30',
      closeTime: '16:00',
      venueIds: [venue.id],
      organizerId: (await asParticipant('Minh')).participant.id,
    });
    const outing = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(outing).toMatch(/<header[^>]*>[\s\S]*Lan Anh[\s\S]*<\/header>/);
    expect(outing).toContain(`href="/me/name?next=%2Foutings%2F${id}"`);
  });

  it('shows no name on the name prompt without a cookie', async () => {
    const html = await (await createApp().request('/name')).text();
    expect(html).not.toContain('/me/name');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Tonight[\s\S]*<\/header>/);
  });
  describe('upcoming outings', () => {
    let venueId: string;
    let organizerId: string;

    const make = (date: string, sitTime: string) =>
      createOuting({ date, sitTime, closeTime: '10:00', venueIds: [venueId], organizerId });

    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-14T20:00:00Z')); // 15/10/2026 in Vietnam
      venueId = (await createVenue({ name: 'Quán A', address: '1 Lê Lợi', mapsUrl: 'https://maps.example/a' })).id;
      organizerId = (await asParticipant('Minh')).participant.id;
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const getHome = async () => {
      const { headers } = await asParticipant('Lan');
      return (await createApp().request('/', { headers })).text();
    };

    it('lists outings soonest first with date, time and going count, each a link', async () => {
      const a = await make('2026-10-17', '19:00');
      const b = await make('2026-10-15', '18:00');
      const c = await make('2026-10-16', '18:30');
      await setAnswer(c, organizerId, true);
      const html = await getHome();
      const order = [b, c, a].map((id) => html.indexOf(`href="/outings/${id}"`));
      expect(order.every((i) => i >= 0)).toBe(true);
      expect(order).toEqual([...order].sort((x, y) => x - y));
      expect(html).toContain('15/10/2026 · 18:00 · 0 người đi');
      expect(html).toContain('16/10/2026 · 18:30 · 1 người đi');
      expect(html).toContain('17/10/2026 · 19:00 · 0 người đi');
      const res = await createApp().request(`/outings/${c}`, { headers: (await asParticipant('Lan')).headers });
      expect(res.status).toBe(200);
    });

    it('orders outings on the same day by sitting time', async () => {
      const late = await make('2026-10-16', '20:00');
      const early = await make('2026-10-16', '18:30');
      const html = await getHome();
      expect(html.indexOf(`/outings/${early}"`)).toBeGreaterThan(-1);
      expect(html.indexOf(`/outings/${early}"`)).toBeLessThan(html.indexOf(`/outings/${late}"`));
    });

    it('hides older outings but keeps their page reachable', async () => {
      const old = await make('2026-10-14', '18:00');
      const html = await getHome();
      expect(html).not.toContain(`/outings/${old}"`);
      const res = await createApp().request(`/outings/${old}`, { headers: (await asParticipant('Lan')).headers });
      expect(res.status).toBe(200);
    });

    it('shows an empty message and keeps the create link when nothing is upcoming', async () => {
      await make('2026-10-14', '18:00');
      const html = await getHome();
      expect(html).toContain('Chưa có kèo nào sắp tới.');
      expect(html).toContain('href="/outings/new"');
    });
  });
});
