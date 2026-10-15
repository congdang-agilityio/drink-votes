import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
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
    expect(html).toContain('<title>Drink Votes</title>');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Votes[\s\S]*<\/header>/);
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
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Votes[\s\S]*<\/header>/);
  });
});
