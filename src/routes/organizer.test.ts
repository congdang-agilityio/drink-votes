import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting, getOuting } from '../db/outings.js';
import { closePool, getPool } from '../db/pool.js';
import { recordTies } from '../db/ties.js';
import { createVenue } from '../db/venues.js';
import { castVote } from '../db/votes.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

/** An open outing (close time in the future) offering venues A and B. */
async function seed(organizerId: string) {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  const id = await createOuting({
    date: '2030-05-17',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId,
  });
  return { id, a: a.id, b: b.id };
}

const close = (id: string, headers?: Record<string, string>) =>
  createApp().request(`/outings/${id}/close`, { method: 'POST', headers });

/** `n` Going participants (besides the organizer). */
async function going(outingId: string, n: number) {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const { participant } = await asParticipant(`P${i}`);
    await setAnswer(outingId, participant.id, true);
    ids.push(participant.id);
  }
  return ids;
}

describe('POST /outings/:id/close', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('organizer with 3 Going and one leader: closed with that winner, 303 to the outing', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    const [p1, p2, p3] = await going(s.id, 3);
    await castVote(s.id, p1, s.b);
    await castVote(s.id, p2, s.b);
    await castVote(s.id, p3, s.a);

    const res = await close(s.id, org.headers);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    const after = await getOuting(s.id);
    expect(after?.closedAt).not.toBeNull();
    expect(after?.cancelled).toBe(false);
    expect(after?.winnerVenueId).toBe(s.b);
  });

  it('organizer with 2 Going: the outing is cancelled', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    await going(s.id, 2);

    const res = await close(s.id, org.headers);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    const after = await getOuting(s.id);
    expect(after?.closedAt).not.toBeNull();
    expect(after?.cancelled).toBe(true);
    expect(after?.winnerVenueId).toBeNull();
  });

  it('another participant gets 403 with a Vietnamese message and the outing stays open', async () => {
    const org = await asParticipant('Minh');
    const other = await asParticipant('Hoa');
    const s = await seed(org.participant.id);
    await going(s.id, 3);

    const res = await close(s.id, other.headers);
    expect(res.status).toBe(403);
    const html = await res.text();
    expect(html).toContain('Chỉ người tạo kèo mới được chốt kèo.');
    expect(html).toContain(`href="/outings/${s.id}"`);
    expect((await getOuting(s.id))?.closedAt).toBeNull();
  });

  it('a new browser (unknown cookie) is redirected by the identity middleware and nothing closes', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    await going(s.id, 3);

    for (const headers of [undefined, { Cookie: `dv_pid=${UNKNOWN}` }]) {
      const res = await close(s.id, headers);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toBe('/name?next=/');
    }
    expect((await getOuting(s.id))?.closedAt).toBeNull();
  });

  it('organizer who answered Not going can close', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    await setAnswer(s.id, org.participant.id, false);
    const [p1] = await going(s.id, 3);
    await castVote(s.id, p1, s.a);

    const res = await close(s.id, org.headers);
    expect(res.status).toBe(303);
    const after = await getOuting(s.id);
    expect(after?.cancelled).toBe(false);
    expect(after?.winnerVenueId).toBe(s.a);
  });

  it('closing an already closed outing changes nothing and redirects to the outing', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    const [p1, p2] = await going(s.id, 3);
    await castVote(s.id, p1, s.a);
    expect((await close(s.id, org.headers)).status).toBe(303);
    const first = await getOuting(s.id);

    await castVote(s.id, p2, s.b); // refused: closed
    const res = await close(s.id, org.headers);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    const second = await getOuting(s.id);
    expect(second?.closedAt?.getTime()).toBe(first?.closedAt?.getTime());
    expect(second?.winnerVenueId).toBe(s.a);
    expect(second?.cancelled).toBe(false);
  });

  it('returns 404 for an unknown outing', async () => {
    const org = await asParticipant('Minh');
    const res = await close(UNKNOWN, org.headers);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('Không tìm thấy kèo này.');
  });
});

const choose = (id: string, venueId: string | undefined, headers?: Record<string, string>) => {
  const body = new URLSearchParams();
  if (venueId !== undefined) body.set('venueId', venueId);
  return createApp().request(`/outings/${id}/choose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body,
  });
};

/** A closed outing with no winner, waiting for the organizer: A and B tied, C not. */
async function seedWaiting(organizerId: string) {
  const [a, b, c] = await Promise.all(
    ['A', 'B', 'C'].map((n) => createVenue({ name: `${n} ${Math.random()}`, address: n })),
  );
  const id = await createOuting({
    date: '2030-05-17',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id, c.id],
    organizerId,
  });
  await getPool().query('UPDATE outings SET closed_at = now() WHERE id = $1', [id]);
  await recordTies(getPool(), id, [a.id, b.id]);
  return { id, a: a.id, b: b.id, c: c.id };
}

describe('POST /outings/:id/choose', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('organizer chooses a tied venue: winner set, 303 to the outing', async () => {
    const org = await asParticipant('Minh');
    const s = await seedWaiting(org.participant.id);

    const res = await choose(s.id, s.b, org.headers);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    expect((await getOuting(s.id))?.winnerVenueId).toBe(s.b);
  });

  it('a second choice is refused with 409 and the winner is unchanged', async () => {
    const org = await asParticipant('Minh');
    const s = await seedWaiting(org.participant.id);
    expect((await choose(s.id, s.b, org.headers)).status).toBe(303);

    const res = await choose(s.id, s.a, org.headers);
    expect(res.status).toBe(409);
    expect(await res.text()).toContain('Không thể chọn quán');
    expect((await getOuting(s.id))?.winnerVenueId).toBe(s.b);
  });

  it('a venue that was not tied is refused with 409 and no winner is set', async () => {
    const org = await asParticipant('Minh');
    const s = await seedWaiting(org.participant.id);

    const res = await choose(s.id, s.c, org.headers);
    expect(res.status).toBe(409);
    expect((await getOuting(s.id))?.winnerVenueId).toBeNull();
  });

  it('another browser gets 403 with a Vietnamese message and no winner is set', async () => {
    const org = await asParticipant('Minh');
    const other = await asParticipant('Hoa');
    const s = await seedWaiting(org.participant.id);

    const res = await choose(s.id, s.a, other.headers);
    expect(res.status).toBe(403);
    const html = await res.text();
    expect(html).toContain('Chỉ người tạo kèo mới được chọn quán.');
    expect(html).toContain(`href="/outings/${s.id}"`);
    expect((await getOuting(s.id))?.winnerVenueId).toBeNull();
  });

  it('an open outing is refused with 409 and stays open without a winner', async () => {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    await recordTies(getPool(), s.id, [s.a, s.b]);

    const res = await choose(s.id, s.a, org.headers);
    expect(res.status).toBe(409);
    const after = await getOuting(s.id);
    expect(after?.closedAt).toBeNull();
    expect(after?.winnerVenueId).toBeNull();
  });

  it('a missing or malformed venueId is refused with 400', async () => {
    const org = await asParticipant('Minh');
    const s = await seedWaiting(org.participant.id);

    for (const venueId of [undefined, '', 'not-a-uuid', `${s.a}x`]) {
      const res = await choose(s.id, venueId, org.headers);
      expect(res.status).toBe(400);
    }
    expect((await getOuting(s.id))?.winnerVenueId).toBeNull();
  });

  it('returns 404 for an unknown outing', async () => {
    const org = await asParticipant('Minh');
    const res = await choose(UNKNOWN, UNKNOWN, org.headers);
    expect(res.status).toBe(404);
  });
});

const visit = (id: string, visited: unknown, headers?: Record<string, string>) => {
  const body = new URLSearchParams();
  if (visited !== undefined) body.set('visited', String(visited));
  return createApp().request(`/outings/${id}/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body,
  });
};

/** 17/05/2030 18:30 in Vietnam (UTC+7) is 11:30 UTC. */
const AT_SIT_TIME = new Date('2030-05-17T11:30:00Z');
const BEFORE_SIT_TIME = new Date('2030-05-17T11:29:00Z');

const setState = (id: string, sets: string, params: unknown[] = []) =>
  getPool().query(`UPDATE outings SET ${sets} WHERE id = $1`, [id, ...params]);

describe('POST /outings/:id/visit', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** A closed outing won by venue A, organized by Minh. */
  async function closedWithWinner() {
    const org = await asParticipant('Minh');
    const s = await seed(org.participant.id);
    await setState(s.id, 'closed_at = now(), winner_venue_id = $2', [s.a]);
    return { org, s };
  }

  const at = (now: Date) => vi.useFakeTimers({ toFake: ['Date'], now });

  it('organizer at the sitting time with "yes": visited = true, 303 to the outing', async () => {
    const { org, s } = await closedWithWinner();
    at(AT_SIT_TIME);
    const res = await visit(s.id, 'yes', org.headers);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`/outings/${s.id}`);
    expect((await getOuting(s.id))?.visited).toBe(true);
  });

  it('organizer after the sitting time with "no": visited = false', async () => {
    const { org, s } = await closedWithWinner();
    at(new Date('2030-05-17T14:00:00Z'));
    const res = await visit(s.id, 'no', org.headers);
    expect(res.status).toBe(303);
    expect((await getOuting(s.id))?.visited).toBe(false);
  });

  it('no deadline: days later an unanswered outing is still accepted', async () => {
    const { org, s } = await closedWithWinner();
    at(new Date('2030-06-30T02:00:00Z'));
    const res = await visit(s.id, 'yes', org.headers);
    expect(res.status).toBe(303);
    expect((await getOuting(s.id))?.visited).toBe(true);
  });

  it('organizer who never answered Going can answer', async () => {
    const { org, s } = await closedWithWinner();
    at(AT_SIT_TIME);
    expect((await visit(s.id, 'yes', org.headers)).status).toBe(303);
    expect((await getOuting(s.id))?.visited).toBe(true);
  });

  it('refuses any other value with 400 and stores nothing', async () => {
    const { org, s } = await closedWithWinner();
    at(AT_SIT_TIME);
    for (const value of [undefined, '', 'true', 'YES', 'maybe']) {
      expect((await visit(s.id, value, org.headers)).status).toBe(400);
    }
    expect((await getOuting(s.id))?.visited).toBeNull();
  });

  it('another browser gets 403 with a Vietnamese message and nothing is stored', async () => {
    const { s } = await closedWithWinner();
    const other = await asParticipant('Hoa');
    at(AT_SIT_TIME);
    const res = await visit(s.id, 'yes', other.headers);
    expect(res.status).toBe(403);
    const html = await res.text();
    expect(html).toContain('Chỉ người tạo kèo mới được xác nhận đã đi hay không.');
    expect(html).toContain(`href="/outings/${s.id}"`);
    expect((await getOuting(s.id))?.visited).toBeNull();
  });

  it('a new browser is redirected by the identity middleware and nothing is stored', async () => {
    const { s } = await closedWithWinner();
    at(AT_SIT_TIME);
    const res = await visit(s.id, 'yes', { Cookie: `dv_pid=${UNKNOWN}` });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/name?next=/');
    expect((await getOuting(s.id))?.visited).toBeNull();
  });

  it('before the sitting time: 409 and nothing stored', async () => {
    const { org, s } = await closedWithWinner();
    at(BEFORE_SIT_TIME);
    const res = await visit(s.id, 'yes', org.headers);
    expect(res.status).toBe(409);
    expect(await res.text()).toContain('Chưa thể xác nhận');
    expect((await getOuting(s.id))?.visited).toBeNull();
  });

  it('a second answer is refused with 409 and the first value stays', async () => {
    const { org, s } = await closedWithWinner();
    at(AT_SIT_TIME);
    expect((await visit(s.id, 'yes', org.headers)).status).toBe(303);
    const res = await visit(s.id, 'no', org.headers);
    expect(res.status).toBe(409);
    expect((await getOuting(s.id))?.visited).toBe(true);
  });

  it('a concurrent second answer is refused by the store: exactly one is recorded', async () => {
    const { org, s } = await closedWithWinner();
    at(AT_SIT_TIME);
    const results = await Promise.all([
      visit(s.id, 'yes', org.headers),
      visit(s.id, 'no', org.headers),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([303, 409]);
    const winner = results.find((r) => r.status === 303) === results[0];
    expect((await getOuting(s.id))?.visited).toBe(winner);
  });

  it('open, cancelled and waiting outings: 409 and nothing stored', async () => {
    const org = await asParticipant('Minh');
    const open = await seed(org.participant.id);
    const cancelled = await seed(org.participant.id);
    await setState(cancelled.id, 'closed_at = now(), cancelled = true');
    const waiting = await seed(org.participant.id);
    await setState(waiting.id, 'closed_at = now()');
    at(AT_SIT_TIME);
    for (const s of [open, cancelled, waiting]) {
      expect((await visit(s.id, 'yes', org.headers)).status).toBe(409);
      expect((await getOuting(s.id))?.visited).toBeNull();
    }
  });

  it('returns 404 for an unknown outing', async () => {
    const org = await asParticipant('Minh');
    const res = await visit(UNKNOWN, 'yes', org.headers);
    expect(res.status).toBe(404);
  });
});
