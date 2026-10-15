import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createOuting } from '../db/outings.js';
import { closePool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

async function seed(organizerId: string, date = '2030-05-17') {
  const a = await createVenue({
    name: 'Quán Ốc Đào',
    address: '1 Lê Lợi',
    mapsUrl: 'https://maps.example/a',
  });
  const b = await createVenue({
    name: 'Bia Hơi Hà Nội',
    address: '2 Hai Bà Trưng',
    mapsUrl: 'javascript:alert(1)',
  });
  const id = await createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [b.id, a.id],
    organizerId,
  });
  return id;
}

describe('GET /outings/:id', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('renders date, times and venues in the expected formats', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    const res = await createApp().request(`/outings/${id}`, { headers });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>');
    expect(html).toContain('Ngày');
    expect(html).toContain('17/05/2030');
    expect(html).toContain('Giờ ngồi');
    expect(html).toContain('18:30');
    expect(html).toContain('Giờ chốt');
    expect(html).toContain('16:00');
    expect(html).toContain('2 Hai Bà Trưng');
    expect(html).toContain('href="https://maps.example/a"');
    expect(html).not.toContain('javascript:');
  });

  it('lists venues in chosen order', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html.indexOf('Bia Hơi Hà Nội')).toBeGreaterThan(-1);
    expect(html.indexOf('Bia Hơi Hà Nội')).toBeLessThan(html.indexOf('Quán Ốc Đào'));
  });

  it('shows the close time of a past outing and no closed wording', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id, '2020-01-02');
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).toContain('02/01/2020');
    expect(html).toContain('Giờ chốt');
    expect(html).toContain('16:00');
    expect(html).not.toMatch(/đã chốt|đã đóng|closed/i);
  });

  it('returns 404 in the layout for an unknown id', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/outings/00000000-0000-4000-8000-000000000000', {
      headers,
    });
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('Không tìm thấy kèo này.');
    expect(html).toContain('<header');
  });

  it('does not swallow other /outings paths', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/outings/new', { headers });
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain('Không tìm thấy kèo này.');
  });

  it('shows the same outing to another browser', async () => {
    const a = await asParticipant('Lan');
    const b = await asParticipant('Minh');
    const id = await seed(a.participant.id);
    const html = await (
      await createApp().request(`/outings/${id}`, { headers: b.headers })
    ).text();
    expect(html).toContain('17/05/2030');
    expect(html).toContain('Quán Ốc Đào');
  });

  it('sends a browser without a cookie to the name prompt', async () => {
    const { participant } = await asParticipant('Lan');
    const id = await seed(participant.id);
    const res = await createApp().request(`/outings/${id}`);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`/name?next=${encodeURIComponent(`/outings/${id}`)}`);
  });
});
