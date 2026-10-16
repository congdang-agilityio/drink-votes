import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { closePool, getPool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { getVote, getVoteCounts } from '../db/votes.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

/** An outing offering venues A and B; `date` in the past means the close time has passed. */
async function seed(organizerId: string, date = '2030-05-17') {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  const id = await createOuting({
    date,
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId,
  });
  return { id, a: a.id, b: b.id };
}

const post = (path: string, headers: Record<string, string> | undefined, venueId?: string) =>
  createApp().request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: venueId === undefined ? '' : new URLSearchParams({ venueId }).toString(),
  });

const counts = async (id: string) => (await getVoteCounts(id)).map((v) => v.count);

const voteRows = async (outingId: string, participantId: string) =>
  (
    await getPool().query(
      'SELECT count(*)::int AS n FROM votes WHERE outing_id = $1 AND participant_id = $2',
      [outingId, participantId],
    )
  ).rows[0].n;

describe('POST /outings/:id/vote', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('a Going person votes A then B: counts follow and one vote remains', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const s = await seed(participant.id);
    await setAnswer(s.id, participant.id, true);

    let res = await post(`/outings/${s.id}/vote`, headers, s.a);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    expect(await counts(s.id)).toEqual([1, 0]);

    res = await post(`/outings/${s.id}/vote`, headers, s.b);
    expect(res.status).toBe(303);
    expect(await counts(s.id)).toEqual([0, 1]);
    expect(await getVote(s.id, participant.id)).toBe(s.b);
    expect(await voteRows(s.id, participant.id)).toBe(1);
  });

  it('refuses Not going and unanswered persons with 403 and counts nothing', async () => {
    const lan = await asParticipant('Lan');
    const hoa = await asParticipant('Hoa');
    const s = await seed(lan.participant.id);
    await setAnswer(s.id, lan.participant.id, false);

    for (const who of [lan, hoa]) {
      const res = await post(`/outings/${s.id}/vote`, who.headers, s.a);
      expect(res.status).toBe(403);
      const html = await res.text();
      expect(html).toContain('Chỉ người đi mới được bình chọn.');
      expect(html).toContain(`href="/outings/${s.id}"`);
      expect(await voteRows(s.id, who.participant.id)).toBe(0);
    }
    expect(await counts(s.id)).toEqual([0, 0]);
  });

  it('returns 400 for a venue of another outing or a missing/malformed venueId', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const s = await seed(participant.id);
    const other = await seed(participant.id);
    await setAnswer(s.id, participant.id, true);

    for (const bad of [other.a, UNKNOWN, 'not-a-uuid', '']) {
      expect((await post(`/outings/${s.id}/vote`, headers, bad)).status).toBe(400);
    }
    expect((await post(`/outings/${s.id}/vote`, headers)).status).toBe(400);
    expect(await voteRows(s.id, participant.id)).toBe(0);
    expect(await counts(s.id)).toEqual([0, 0]);
  });

  it('returns 404 for an unknown outing', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const s = await seed(participant.id);
    const res = await post(`/outings/${UNKNOWN}/vote`, headers, s.a);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('Không tìm thấy kèo này.');
  });

  it('refuses a vote after the close time with a 409 closed page and counts nothing', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const s = await seed(participant.id, '2020-01-02');
    await getPool().query(
      'INSERT INTO attendance (outing_id, participant_id, going) VALUES ($1, $2, true)',
      [s.id, participant.id],
    );
    const res = await post(`/outings/${s.id}/vote`, headers, s.a);
    expect(res.status).toBe(409);
    const html = await res.text();
    expect(html).toContain('Kèo đã chốt, không thể thay đổi.');
    expect(html).toContain(`href="/outings/${s.id}"`);
    expect(await voteRows(s.id, participant.id)).toBe(0);
    expect(await counts(s.id)).toEqual([0, 0]);
  });

  it('refuses a vote change on an outing marked closed and keeps the earlier vote', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const s = await seed(participant.id);
    await setAnswer(s.id, participant.id, true);
    expect((await post(`/outings/${s.id}/vote`, headers, s.a)).status).toBe(303);
    await getPool().query('UPDATE outings SET closed_at = now() WHERE id = $1', [s.id]);
    const res = await post(`/outings/${s.id}/vote`, headers, s.b);
    expect(res.status).toBe(409);
    expect(await res.text()).toContain('Kèo đã chốt, không thể thay đổi.');
    expect(await getVote(s.id, participant.id)).toBe(s.a);
  });
});
