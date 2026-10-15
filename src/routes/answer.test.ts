import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { getAnswer } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { closePool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

async function seed(organizerId: string, date = '2030-05-17') {
  const v = await createVenue({
    name: 'Quán Ốc Đào',
    address: '1 Lê Lợi',
    mapsUrl: 'https://maps.example/a',
  });
  return createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [v.id],
    organizerId,
  });
}

const post = (path: string, headers: Record<string, string> | undefined, going?: string) =>
  createApp().request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: going === undefined ? '' : new URLSearchParams({ going }).toString(),
  });

describe('POST /outings/:id/answer', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('records yes, no, yes and redirects each time', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    for (const [value, stored] of [
      ['yes', true],
      ['no', false],
      ['yes', true],
    ] as const) {
      const res = await post(`/outings/${id}/answer`, headers, value);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toBe(`/outings/${id}`);
      expect(await getAnswer(id, participant.id)).toBe(stored);
    }
  });

  it('still accepts changes after the close time passed', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id, '2020-01-02');
    expect((await post(`/outings/${id}/answer`, headers, 'yes')).status).toBe(303);
    expect((await post(`/outings/${id}/answer`, headers, 'no')).status).toBe(303);
    expect(await getAnswer(id, participant.id)).toBe(false);
  });

  it('returns 404 for an unknown outing and writes nothing', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const unknown = '00000000-0000-4000-8000-000000000000';
    const res = await post(`/outings/${unknown}/answer`, headers, 'yes');
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('Không tìm thấy kèo này.');
    expect(await getAnswer(unknown, participant.id)).toBeNull();
  });

  it('returns 400 for a bad value and writes nothing', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    for (const bad of ['maybe', 'YES', '']) {
      expect((await post(`/outings/${id}/answer`, headers, bad)).status).toBe(400);
    }
    expect((await post(`/outings/${id}/answer`, headers)).status).toBe(400);
    expect(await getAnswer(id, participant.id)).toBeNull();
  });

  it('sends a browser without a cookie to the name prompt', async () => {
    const { participant } = await asParticipant('Lan');
    const id = await seed(participant.id);
    const res = await post(`/outings/${id}/answer`, undefined, 'yes');
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/name');
    expect(await getAnswer(id, participant.id)).toBeNull();
  });
});
