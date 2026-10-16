import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting, getOuting } from '../db/outings.js';
import { closePool, getPool } from '../db/pool.js';
import { recordTies } from '../db/ties.js';
import { createVenue } from '../db/venues.js';
import { castVote } from '../db/votes.js';
import { qrSvg } from '../lib/qr.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

vi.mock('../lib/qr.js', async (orig) => {
  const actual = await orig<typeof import('../lib/qr.js')>();
  return { ...actual, qrSvg: vi.fn(actual.qrSvg) };
});

type Who = Awaited<ReturnType<typeof asParticipant>>;

async function seed(organizerId: string) {
  const a = await createVenue({ name: 'Quán Ốc Đào', address: '1 Lê Lợi' });
  const b = await createVenue({ name: 'Bia Hơi Hà Nội', address: '2 Hai Bà Trưng' });
  const id = await createOuting({
    date: '2030-05-17',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId,
  });
  return { id, a: a.id, b: b.id };
}

const page = (path: string, who: Who) => createApp().request(path, { headers: who.headers });
const html = async (path: string, who: Who) => (await page(path, who)).text();

const expectNoCode = (body: string) => {
  expect(body).not.toContain('<svg');
  expect(body).not.toMatch(/\/(answer|vote)"/);
};

/** Two voters for different venues, then the outing is closed. */
async function withVotes(org: Who, other: Who, id: string, a: string, b: string) {
  await setAnswer(id, org.participant.id, true);
  await setAnswer(id, other.participant.id, true);
  await castVote(id, org.participant.id, a);
  await castVote(id, other.participant.id, b);
}

const closeNow = (id: string, sets = '') =>
  getPool().query(`UPDATE outings SET closed_at = now()${sets} WHERE id = $1`, [id]);

describe('no QR code unless the outing is open', () => {
  beforeEach(async () => {
    await resetDb();
    vi.mocked(qrSvg).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await closePool();
  });

  async function setup() {
    const org = await asParticipant('Lan');
    const other = await asParticipant('Minh');
    const o = await seed(org.participant.id);
    return { org, other, ...o };
  }

  /** The link the code encodes while the outing is open. */
  async function capturedLink(id: string, who: Who): Promise<string> {
    vi.mocked(qrSvg).mockClear();
    expect(await html(`/outings/${id}`, who)).toContain('<svg');
    const link = vi.mocked(qrSvg).mock.calls[0]![0];
    expect(link).toBe(`http://localhost/outings/${id}`);
    vi.mocked(qrSvg).mockClear();
    return link;
  }

  it('AC1: closed with a winner shows no code to the organizer or anyone else', async () => {
    const { org, other, id, a, b } = await setup();
    await withVotes(org, other, id, a, b);
    await closeNow(id, `, winner_venue_id = '${a}'`);
    for (const who of [org, other]) {
      const res = await page(`/outings/${id}`, who);
      expect(res.status).toBe(200);
      expectNoCode(await res.text());
    }
    expect(qrSvg).not.toHaveBeenCalled();
  });

  it('AC2: waiting for the organizer tie choice shows no code, even to the organizer', async () => {
    const { org, other, id, a, b } = await setup();
    await withVotes(org, other, id, a, b);
    await closeNow(id);
    await recordTies(getPool(), id, [a, b]);
    const orgHtml = await html(`/outings/${id}`, org);
    expect(orgHtml).toContain(`/outings/${id}/choose`);
    expectNoCode(orgHtml);
    expectNoCode(await html(`/outings/${id}`, other));
    expect(qrSvg).not.toHaveBeenCalled();
  });

  it('AC3: a cancelled outing shows no code', async () => {
    const { org, other, id } = await setup();
    await closeNow(id, ', cancelled = true');
    for (const who of [org, other]) expectNoCode(await html(`/outings/${id}`, who));
    expect(qrSvg).not.toHaveBeenCalled();
  });

  it('AC4: the code disappears once the close time passes (closeDue middleware)', async () => {
    const { org, id } = await setup();
    // 16:00 in Asia/Ho_Chi_Minh on 17/05/2030 is 09:00Z.
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2030-05-17T08:00:00Z') });
    expect(await html(`/outings/${id}`, org)).toContain('<svg');
    vi.setSystemTime(new Date('2030-05-17T09:30:00Z'));
    vi.mocked(qrSvg).mockClear();
    const after = await html(`/outings/${id}`, org);
    expect((await getOuting(id))!.closedAt).not.toBeNull();
    expectNoCode(after);
    expect(qrSvg).not.toHaveBeenCalled();
  });

  it('AC4: the code disappears once the organizer closes the outing', async () => {
    const { org, other, id } = await setup();
    expect(await html(`/outings/${id}`, org)).toContain('<svg');
    const res = await createApp().request(`/outings/${id}/close`, {
      method: 'POST',
      headers: org.headers,
    });
    expect(res.status).toBe(303);
    vi.mocked(qrSvg).mockClear();
    expect((await getOuting(id))!.closedAt).not.toBeNull();
    for (const who of [org, other]) expectNoCode(await html(`/outings/${id}`, who));
    expect(qrSvg).not.toHaveBeenCalled();
  });

  describe('AC5: the link from an earlier screenshot opens the current state', () => {
    it('after the outing closed with a winner', async () => {
      const { org, other, id, a, b } = await setup();
      const link = await capturedLink(id, org);
      await withVotes(org, other, id, a, b);
      await closeNow(id, `, winner_venue_id = '${a}'`);
      const res = await createApp().request(link, { headers: other.headers });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain('Quán Ốc Đào');
      expectNoCode(body);
      expect(qrSvg).not.toHaveBeenCalled();
    });

    it('while waiting for the organizer tie choice', async () => {
      const { org, other, id, a, b } = await setup();
      const link = await capturedLink(id, org);
      await withVotes(org, other, id, a, b);
      await closeNow(id);
      await recordTies(getPool(), id, [a, b]);
      for (const who of [org, other]) {
        const res = await createApp().request(link, { headers: who.headers });
        expect(res.status).toBe(200);
        expectNoCode(await res.text());
      }
      expect(qrSvg).not.toHaveBeenCalled();
    });

    it('after the outing was cancelled', async () => {
      const { other, org, id } = await setup();
      const link = await capturedLink(id, org);
      await closeNow(id, ', cancelled = true');
      const res = await createApp().request(link, { headers: other.headers });
      expect(res.status).toBe(200);
      expectNoCode(await res.text());
      expect(qrSvg).not.toHaveBeenCalled();
    });
  });
});
