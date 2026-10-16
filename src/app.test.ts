import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createOuting, getOuting } from './db/outings.js';
import { createParticipant } from './db/participants.js';
import { closePool, getPool } from './db/pool.js';
import { createVenue } from './db/venues.js';
import { resetDb } from './test/db.js';
import { asParticipant } from './test/identity.js';

describe('createApp', () => {
  let headers: { Cookie: string };

  beforeEach(async () => {
    await resetDb();
    ({ headers } = await asParticipant('Lan'));
  });

  afterAll(async () => {
    await closePool();
  });

  it('responds 404 for an unknown path', async () => {
    const app = createApp();
    const res = await app.request('/unknown', { headers });
    expect(res.status).toBe(404);
  });

  it('renders the Vietnamese 404 page in the shared layout', async () => {
    const res = await createApp().request('/unknown', { headers });
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain('site-header');
    expect(html).toContain('Không tìm thấy trang');
    expect(html).toContain('<a href="/">');
  });

  it('renders the 404 page for other methods too', async () => {
    const res = await createApp().request('/unknown', { method: 'POST', headers });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('Không tìm thấy trang');
  });

  describe('closing due outings', () => {
    async function outingOn(date: string): Promise<{ id: string; winner: string }> {
      const organizer = await createParticipant('Minh');
      const win = await createVenue({ name: 'Quán Thắng', address: '1 Lê Lợi' });
      const other = await createVenue({ name: 'Quán Thua', address: '2 Lê Lợi' });
      const id = await createOuting({
        date,
        sitTime: '18:30',
        closeTime: '16:00',
        venueIds: [win.id, other.id],
        organizerId: organizer.id,
      });
      for (const venueId of [win.id, win.id, win.id, other.id]) {
        const p = await createParticipant(`P ${Math.random()}`);
        await getPool().query(
          'INSERT INTO attendance (outing_id, participant_id, going) VALUES ($1, $2, true)',
          [id, p.id],
        );
        await getPool().query(
          'INSERT INTO votes (outing_id, participant_id, venue_id) VALUES ($1, $2, $3)',
          [id, p.id, venueId],
        );
      }
      return { id, winner: win.id };
    }

    it('shows a past-due outing closed with its winner, without an explicit close', async () => {
      const { id, winner } = await outingOn('2020-01-02');
      const res = await createApp().request(`/outings/${id}`, { headers });
      const html = await res.text();
      expect(html).toContain('Đã chốt');
      expect(html).toContain('Quán: Quán Thắng');
      expect((await getOuting(id))?.winnerVenueId).toBe(winner);
    });

    it('keeps an outing open before its close time', async () => {
      const { id } = await outingOn('2999-01-02');
      const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
      expect(html).not.toContain('Đã chốt');
      expect((await getOuting(id))?.closedAt).toBeNull();
    });

    it('does not run the sweep for /healthz', async () => {
      const { id } = await outingOn('2020-01-02');
      const res = await createApp().request('/healthz');
      expect(res.status).toBe(200);
      expect((await getOuting(id))?.closedAt).toBeNull();
    });
  });
});
