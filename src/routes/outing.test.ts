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
    const res = await createApp().request('/outings/other', { headers });
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

  describe('answer section', () => {
    const get = async (id: string, headers: Record<string, string>) =>
      (await createApp().request(`/outings/${id}`, { headers })).text();
    const pressed = (html: string, value: 'yes' | 'no') =>
      html.match(new RegExp(`<button[^>]*value="${value}"[^>]*aria-pressed="(true|false)"`))?.[1];
    const goingList = (html: string) =>
      html.match(/<ul class="going-list">([\s\S]*?)<\/ul>/)?.[1];

    it('shows both buttons posting to the answer endpoint, and the organizer unanswered with 0 going', async () => {
      const { participant, headers } = await asParticipant('Lan');
      const id = await seed(participant.id);
      const html = await get(id, headers);
      expect(html).toContain(`action="/outings/${id}/answer"`);
      expect(html).toContain('Đi');
      expect(html).toContain('Không đi');
      expect(pressed(html, 'yes')).toBe('false');
      expect(pressed(html, 'no')).toBe('false');
      expect(html).toContain('Bạn chưa trả lời');
      expect(html).toContain('Số người đi: 0');
      expect(goingList(html)).toBe('');
    });

    it('lists a Going person, counts them and marks the chosen button', async () => {
      const lan = await asParticipant('Lan');
      const minh = await asParticipant('Minh');
      const id = await seed(lan.participant.id);
      await setAnswer(id, lan.participant.id, true);
      await setAnswer(id, minh.participant.id, false);
      const html = await get(id, lan.headers);
      expect(html).toContain('Bạn: Đi');
      expect(pressed(html, 'yes')).toBe('true');
      expect(pressed(html, 'no')).toBe('false');
      expect(html).toContain('Số người đi: 1');
      expect(goingList(html)).toBe('<li>Lan</li>');
      expect(html).not.toContain('Minh');
      const minhHtml = await get(id, minh.headers);
      expect(minhHtml).toContain('Bạn: Không đi');
      expect(pressed(minhHtml, 'yes')).toBe('false');
      expect(pressed(minhHtml, 'no')).toBe('true');
      expect(minhHtml).toContain('Số người đi: 1');
      expect(goingList(minhHtml)).toBe('<li>Lan</li>');
    });

    it('follows answer changes', async () => {
      const lan = await asParticipant('Lan');
      const id = await seed(lan.participant.id);
      await setAnswer(id, lan.participant.id, true);
      expect(await get(id, lan.headers)).toContain('Số người đi: 1');
      await setAnswer(id, lan.participant.id, false);
      const off = await get(id, lan.headers);
      expect(off).toContain('Số người đi: 0');
      expect(off).toContain('Bạn: Không đi');
      expect(goingList(off)).toBe('');
      await setAnswer(id, lan.participant.id, true);
      expect(goingList(await get(id, lan.headers))).toBe('<li>Lan</li>');
    });

    it('lists two different people named Lan twice', async () => {
      const a = await asParticipant('Lan');
      const b = await asParticipant('Lan');
      const id = await seed(a.participant.id);
      await setAnswer(id, a.participant.id, true);
      await setAnswer(id, b.participant.id, true);
      const html = await get(id, a.headers);
      expect(html).toContain('Số người đi: 2');
      expect(goingList(html)).toBe('<li>Lan</li><li>Lan</li>');
    });
  });
  describe('voting section', () => {
    const get = async (id: string, headers: Record<string, string>) =>
      (await createApp().request(`/outings/${id}`, { headers })).text();
    const venueIds = async (id: string) => (await getOuting(id))!.venues.map((v) => v.id);
    const countOf = (html: string, name: string) =>
      html.match(new RegExp(`<strong>${name}[\\s\\S]*?(\\d+) phiếu`))?.[1];
    const voteForms = (html: string) => html.match(/<form[^>]*\/vote"/g) ?? [];

    it('shows counts, vote buttons to a Going person, and marks their choice', async () => {
      const lan = await asParticipant('Lan');
      const id = await seed(lan.participant.id);
      const [b, a] = await venueIds(id); // chosen order: Bia Hơi first, Quán Ốc Đào second
      await setAnswer(id, lan.participant.id, true);
      let html = await get(id, lan.headers);
      expect(voteForms(html)).toHaveLength(2);
      expect(html).toContain(`action="/outings/${id}/vote"`);
      expect(html).toContain(`name="venueId" value="${a}"`);
      expect(html).toContain('Chọn quán này');
      expect(html).not.toContain('Bạn đã chọn');
      expect(countOf(html, 'Quán Ốc Đào')).toBe('0');
      await castVote(id, lan.participant.id, a!);
      html = await get(id, lan.headers);
      expect(countOf(html, 'Quán Ốc Đào')).toBe('1');
      expect(countOf(html, 'Bia Hơi Hà Nội')).toBe('0');
      expect(html.match(/Bạn đã chọn/g)).toHaveLength(1);
      expect(html.indexOf('Bạn đã chọn')).toBeGreaterThan(html.indexOf('Quán Ốc Đào'));
      await castVote(id, lan.participant.id, b!);
      html = await get(id, lan.headers);
      expect(countOf(html, 'Quán Ốc Đào')).toBe('0');
      expect(countOf(html, 'Bia Hơi Hà Nội')).toBe('1');
      expect(html.indexOf('Bạn đã chọn')).toBeLessThan(html.indexOf('Quán Ốc Đào'));
    });

    it('shows counts but no vote forms to Not going and unanswered viewers', async () => {
      const lan = await asParticipant('Lan');
      const minh = await asParticipant('Minh');
      const nam = await asParticipant('Nam');
      const id = await seed(lan.participant.id);
      const [, a] = await venueIds(id);
      await setAnswer(id, lan.participant.id, true);
      await castVote(id, lan.participant.id, a!);
      await setAnswer(id, minh.participant.id, false);
      for (const viewer of [minh, nam]) {
        const html = await get(id, viewer.headers);
        expect(countOf(html, 'Quán Ốc Đào')).toBe('1');
        expect(voteForms(html)).toHaveLength(0);
        expect(html).not.toContain('Chọn quán này');
        expect(html).not.toContain('Bạn đã chọn');
        expect(html).toContain('Chọn Đi để bình chọn.');
      }
    });

    it('never reveals who voted for which venue', async () => {
      const lan = await asParticipant('Lan');
      const minh = await asParticipant('Minh');
      const id = await seed(lan.participant.id);
      const [b, a] = await venueIds(id);
      await setAnswer(id, lan.participant.id, true);
      await setAnswer(id, minh.participant.id, true);
      await castVote(id, lan.participant.id, a!);
      await castVote(id, minh.participant.id, b!);
      const html = await get(id, lan.headers);
      const venues = html.match(/<ul class="venue-list">([\s\S]*?)<\/ul>/)![1]!;
      expect(venues).not.toContain('Lan');
      expect(venues).not.toContain('Minh');
      expect(html.match(/Bạn đã chọn/g)).toHaveLength(1);
    });

    it('drops the vote when the person goes Not going and leaves no choice after Going again', async () => {
      const lan = await asParticipant('Lan');
      const id = await seed(lan.participant.id);
      const [, a] = await venueIds(id);
      await setAnswer(id, lan.participant.id, true);
      await castVote(id, lan.participant.id, a!);
      await setAnswer(id, lan.participant.id, false);
      let html = await get(id, lan.headers);
      expect(countOf(html, 'Quán Ốc Đào')).toBe('0');
      expect(voteForms(html)).toHaveLength(0);
      await setAnswer(id, lan.participant.id, true);
      html = await get(id, lan.headers);
      expect(countOf(html, 'Quán Ốc Đào')).toBe('0');
      expect(html).not.toContain('Bạn đã chọn');
      expect(voteForms(html)).toHaveLength(2);
    });
    describe('leading venues', () => {
      const leadLine = (html: string) => html.match(/Đang dẫn đầu:[^<]*/)?.[0];

      it('shows the single leader', async () => {
        const lan = await asParticipant('Lan');
        const minh = await asParticipant('Minh');
        const nam = await asParticipant('Nam');
        const id = await seed(lan.participant.id);
        const [b, a] = await venueIds(id);
        for (const p of [lan, minh, nam]) await setAnswer(id, p.participant.id, true);
        await castVote(id, lan.participant.id, a!);
        await castVote(id, minh.participant.id, a!);
        await castVote(id, nam.participant.id, b!);
        const html = await get(id, lan.headers);
        expect(leadLine(html)).toContain('Quán Ốc Đào');
        expect(leadLine(html)).not.toContain('Bia Hơi');
        expect(html).not.toContain('Chưa có phiếu');
      });

      async function tiedSetup() {
        const lan = await asParticipant('Lan');
        const minh = await asParticipant('Minh');
        const id = await seed(lan.participant.id);
        const [b, a] = await venueIds(id);
        for (const p of [lan, minh]) await setAnswer(id, p.participant.id, true);
        await castVote(id, lan.participant.id, a!);
        await castVote(id, minh.participant.id, b!);
        return { id, a: a!, b: b!, lan, minh };
      }
      const markVisited = async (venueId: string, date: string, organizerId: string) => {
        const past = await createOuting({
          date, sitTime: '18:30', closeTime: '16:00', venueIds: [venueId], organizerId,
        });
        await getPool().query(
          'UPDATE outings SET closed_at = now(), winner_venue_id = $2, visited = true WHERE id = $1',
          [past, venueId],
        );
      };

      it('shows the tied venues and the organizer note when the tie-break cannot decide', async () => {
        const { id, lan } = await tiedSetup();
        const html = await get(id, lan.headers);
        expect(html).toContain('Hoà: Bia Hơi Hà Nội, Quán Ốc Đào – chủ kèo sẽ chọn');
        expect(html).not.toContain('Chưa có phiếu');
      });

      it('shows only the venue the tie-break picks', async () => {
        const { id, a, lan } = await tiedSetup();
        await markVisited(a, '2030-01-01', lan.participant.id);
        const html = await get(id, lan.headers);
        expect(leadLine(html)).toContain('Bia Hơi Hà Nội');
        expect(leadLine(html)).not.toContain('Quán Ốc Đào');
        expect(html).not.toContain('chủ kèo sẽ chọn');
      });

      it('updates when a vote changes', async () => {
        const { id, a, lan, minh } = await tiedSetup();
        await markVisited(a, '2030-01-01', lan.participant.id);
        expect(leadLine(await get(id, lan.headers))).toContain('Bia Hơi Hà Nội');
        await castVote(id, minh.participant.id, a);
        const html = await get(id, lan.headers);
        expect(leadLine(html)).toContain('Quán Ốc Đào');
        expect(leadLine(html)).not.toContain('Bia Hơi Hà Nội');
      });

      it('shows "Chưa có phiếu" and no leader for a new outing', async () => {
        const lan = await asParticipant('Lan');
        const id = await seed(lan.participant.id);
        const html = await get(id, lan.headers);
        expect(html).toContain('Chưa có phiếu');
        expect(html).not.toContain('Đang dẫn đầu');
      });

      it('follows the votes when the only voter switches to Not going', async () => {
        const lan = await asParticipant('Lan');
        const id = await seed(lan.participant.id);
        const [, a] = await venueIds(id);
        await setAnswer(id, lan.participant.id, true);
        await castVote(id, lan.participant.id, a!);
        let html = await get(id, lan.headers);
        expect(leadLine(html)).toContain('Quán Ốc Đào');
        await setAnswer(id, lan.participant.id, false);
        html = await get(id, lan.headers);
        expect(html).toContain('Chưa có phiếu');
        expect(html).not.toContain('Đang dẫn đầu');
      });
    });
  });
});

describe('GET /outings/:id when closed', () => {
  beforeEach(async () => {
    await resetDb();
  });

  async function close(id: string, winnerName: string | null) {
    const winner = winnerName
      ? (await getOuting(id))!.venues.find((v) => v.name === winnerName)!.id
      : null;
    await getPool().query(
      'UPDATE outings SET closed_at = now(), winner_venue_id = $2 WHERE id = $1',
      [id, winner],
    );
  }

  it('shows the closed label, winner and no answer or vote forms', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await setAnswer(id, participant.id, true);
    await close(id, 'Quán Ốc Đào');
    const res = await createApp().request(`/outings/${id}`, { headers });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('17/05/2030');
    expect(html).toContain('18:30');
    expect(html).toContain('Đã chốt');
    expect(html).toContain('Quán: Quán Ốc Đào');
    expect(html).not.toContain('/answer');
    expect(html).not.toContain('/vote');
    expect(html).not.toContain('<form');
  });

  it('shows the label without a winner line when no winner is set', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await close(id, null);
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).toContain('Đã chốt');
    expect(html).not.toContain('Quán:');
    expect(html).not.toContain('<form');
  });

  it('shows the winner address and a Maps link for an http(s) mapsUrl', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await close(id, 'Quán Ốc Đào');
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).toContain('1 Lê Lợi');
    expect(html).toContain('href="https://maps.example/a"');
  });

  it('renders no Maps link when the winner has no http(s) mapsUrl', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await close(id, 'Bia Hơi Hà Nội');
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).toContain('2 Hai Bà Trưng');
    expect(html).not.toContain('javascript:');
    expect(html.slice(html.indexOf('<main>'))).not.toContain('<a ');
  });

  it('lists only the Going people with the final headcount', async () => {
    const lan = await asParticipant('Lan');
    const id = await seed(lan.participant.id);
    const names = ['Lan', 'Minh', 'Nam', 'Oanh'];
    await setAnswer(id, lan.participant.id, true);
    for (const n of names.slice(1)) await setAnswer(id, (await asParticipant(n)).participant.id, true);
    await setAnswer(id, (await asParticipant('Phong')).participant.id, false);
    await asParticipant('Quang');
    await close(id, 'Quán Ốc Đào');
    const html = await (await createApp().request(`/outings/${id}`, { headers: lan.headers })).text();
    expect(html).toContain('Số người đi: 4');
    for (const n of names) expect(html).toContain(`<li>${n}</li>`);
    expect(html).not.toContain('Phong');
    expect(html).not.toContain('Quang');
  });

  it('shows the vote count of every venue without voter names', async () => {
    const lan = await asParticipant('Lan');
    const minh = await asParticipant('Minh');
    const id = await seed(lan.participant.id);
    const venues = (await getOuting(id))!.venues;
    const a = venues.find((v) => v.name === 'Quán Ốc Đào')!.id;
    await setAnswer(id, lan.participant.id, true);
    await setAnswer(id, minh.participant.id, true);
    await castVote(id, lan.participant.id, a);
    await castVote(id, minh.participant.id, a);
    await close(id, 'Quán Ốc Đào');
    const html = await (await createApp().request(`/outings/${id}`, { headers: lan.headers })).text();
    expect(html).toContain('2 phiếu');
    expect(html).toContain('0 phiếu');
    const votesSection = html.slice(html.indexOf('venue-list'), html.indexOf('Số người đi'));
    expect(votesSection).not.toContain('Minh');
    expect(votesSection).not.toContain('Lan');
  });

  it('keeps the open page with its buttons while not closed', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await setAnswer(id, participant.id, true);
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).not.toContain('Đã chốt');
    expect(html).toContain('/answer');
    expect(html).toContain('/vote');
  });
});

describe('GET /outings/:id when cancelled', () => {
  beforeEach(async () => {
    await resetDb();
  });

  async function cancel(id: string) {
    await getPool().query('UPDATE outings SET closed_at = now(), cancelled = true WHERE id = $1', [
      id,
    ]);
  }

  it('shows the cancelled text, headcount 2 and no forms', async () => {
    const a = await asParticipant('Lan');
    const b = await asParticipant('Minh');
    const id = await seed(a.participant.id);
    await setAnswer(id, a.participant.id, true);
    await setAnswer(id, b.participant.id, true);
    await cancel(id);
    const res = await createApp().request(`/outings/${id}`, { headers: a.headers });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('17/05/2030');
    expect(html).toContain('18:30');
    expect(html).toContain('Đã huỷ: không đủ quân');
    expect(html).toContain('Số người đi: 2');
    expect(html).not.toContain('Đã chốt');
    expect(html).not.toContain('/answer');
    expect(html).not.toContain('/vote');
    expect(html).not.toContain('<form');
  });

  it('shows headcount 0 when nobody is going', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const id = await seed(participant.id);
    await cancel(id);
    const html = await (await createApp().request(`/outings/${id}`, { headers })).text();
    expect(html).toContain('Đã huỷ: không đủ quân');
    expect(html).toContain('Số người đi: 0');
  });

  it('shows the close form only to the organizer of an open outing', async () => {
    const org = await asParticipant('Minh');
    const other = await asParticipant('Lan');
    const id = await seed(org.participant.id);
    const get = async (headers: Record<string, string>) =>
      (await createApp().request(`/outings/${id}`, { headers })).text();
    const orgHtml = await get(org.headers);
    expect(orgHtml).toContain(`action="/outings/${id}/close"`);
    expect(orgHtml).toContain('Chốt ngay');
    const otherHtml = await get(other.headers);
    expect(otherHtml).not.toContain('/close');
    expect(otherHtml).not.toContain('Chốt ngay');
  });
});

describe('GET /outings/:id when waiting for the organizer to choose', () => {
  beforeEach(async () => {
    await resetDb();
  });

  async function setup() {
    const org = await asParticipant('Lan');
    const other = await asParticipant('Minh');
    const a = await createVenue({ name: 'Quán A', address: '1 A', mapsUrl: '' });
    const b = await createVenue({ name: 'Quán B', address: '2 B', mapsUrl: '' });
    const c = await createVenue({ name: 'Quán C', address: '3 C', mapsUrl: '' });
    const id = await createOuting({
      date: '2030-05-17',
      sitTime: '18:30',
      closeTime: '16:00',
      venueIds: [a.id, b.id, c.id],
      organizerId: org.participant.id,
    });
    await setAnswer(id, org.participant.id, true);
    await setAnswer(id, other.participant.id, true);
    await castVote(id, org.participant.id, a.id);
    await castVote(id, other.participant.id, b.id);
    await getPool().query('UPDATE outings SET closed_at = now() WHERE id = $1', [id]);
    await recordTies(getPool(), id, [a.id, b.id]);
    return { org, other, a, b, c, id };
  }

  const get = async (id: string, headers: Record<string, string>) =>
    (await createApp().request(`/outings/${id}`, { headers })).text();

  it('shows the organizer a choose form for each tied venue only', async () => {
    const { org, a, b, c, id } = await setup();
    const html = await get(id, org.headers);
    expect(html).toContain('Đã chốt – chờ chủ kèo chọn quán');
    expect(html).toContain('Số người đi: 2');
    expect(html).toContain('Lan');
    expect(html).toContain('Minh');
    expect(html).toContain('1 phiếu');
    expect(html).toContain('Quán A');
    expect(html).toContain('Quán B');
    expect(html.match(/action="\/outings\/[^"]+\/choose"/g)).toHaveLength(2);
    expect(html).toContain(`value="${a.id}"`);
    expect(html).toContain(`value="${b.id}"`);
    expect(html).not.toContain(`value="${c.id}"`);
    expect(html).toContain('Chọn quán này');
    expect(html).not.toContain('/answer');
    expect(html).not.toContain('/vote');
  });

  it('shows another browser the waiting page without any form', async () => {
    const { other, id } = await setup();
    const html = await get(id, other.headers);
    expect(html).toContain('chờ chủ kèo chọn quán');
    expect(html).toContain('Số người đi: 2');
    expect(html).toContain('Quán A');
    expect(html).not.toContain('<form');
  });

  it('renders the closed result page once a winner is set', async () => {
    const { org, b, id } = await setup();
    await getPool().query('UPDATE outings SET winner_venue_id = $2 WHERE id = $1', [id, b.id]);
    const html = await get(id, org.headers);
    expect(html).toContain('Quán: Quán B');
    expect(html).not.toContain('chờ chủ kèo');
    expect(html).not.toContain('<form');
  });
});

describe('GET /outings/:id visit question', () => {
  // seed(): date 2030-05-17, sit time 18:30 (Asia/Ho_Chi_Minh = UTC+7)
  const AT_SIT_TIME = new Date('2030-05-17T11:30:00Z');
  const BEFORE_SIT_TIME = new Date('2030-05-17T11:29:00Z');
  const QUESTION = 'Đã đi Quán Ốc Đào chưa?';

  beforeEach(async () => {
    await resetDb();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await closePool();
  });

  async function closedWithWinner(set = '') {
    const org = await asParticipant('Minh');
    const id = await seed(org.participant.id);
    const { rows } = await getPool().query('SELECT id FROM venues WHERE name = $1', ['Quán Ốc Đào']);
    await getPool().query(
      `UPDATE outings SET closed_at = now(), winner_venue_id = $2${set} WHERE id = $1`,
      [id, rows[0].id],
    );
    return { org, id };
  }

  const page = async (id: string, headers: Record<string, string>, now: Date) => {
    vi.useFakeTimers({ toFake: ['Date'], now });
    return (await createApp().request(`/outings/${id}`, { headers })).text();
  };

  it('organizer at the sitting time sees the question and both buttons', async () => {
    const { org, id } = await closedWithWinner();
    const html = await page(id, org.headers, AT_SIT_TIME);
    expect(html).toContain(QUESTION);
    expect(html).toContain(`action="/outings/${id}/visit"`);
    expect(html).toContain('name="visited" value="yes"');
    expect(html).toContain('name="visited" value="no"');
    expect(html).toContain('Đã đi</button>');
    expect(html).toContain('Không đi</button>');
  });

  it('organizer one minute before the sitting time does not see it', async () => {
    const { org, id } = await closedWithWinner();
    expect(await page(id, org.headers, BEFORE_SIT_TIME)).not.toContain(QUESTION);
  });

  it('another browser does not see it', async () => {
    const { id } = await closedWithWinner();
    const other = await asParticipant('Hoa');
    const html = await page(id, other.headers, AT_SIT_TIME);
    expect(html).not.toContain(QUESTION);
    expect(html).not.toContain('/visit');
  });

  it('is gone after an answer, yes or no', async () => {
    for (const v of ['true', 'false']) {
      await resetDb();
      const { org, id } = await closedWithWinner(`, visited = ${v}`);
      const html = await page(id, org.headers, AT_SIT_TIME);
      expect(html).not.toContain(QUESTION);
      expect(html).not.toContain('/visit');
    }
  });

  it('a cancelled outing shows no question', async () => {
    const org = await asParticipant('Minh');
    const id = await seed(org.participant.id);
    await getPool().query('UPDATE outings SET closed_at = now(), cancelled = true WHERE id = $1', [id]);
    expect(await page(id, org.headers, AT_SIT_TIME)).not.toContain('/visit');
  });

  it('an unanswered outing days later still shows it', async () => {
    const { org, id } = await closedWithWinner();
    expect(await page(id, org.headers, new Date('2030-06-30T02:00:00Z'))).toContain(QUESTION);
  });
});
