import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { setAnswer } from '../db/attendance.js';
import { createOuting, getOuting } from '../db/outings.js';
import { closePool } from '../db/pool.js';
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

    it('follows answer changes after the close time passed', async () => {
      const lan = await asParticipant('Lan');
      const id = await seed(lan.participant.id, '2020-01-02');
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

      it('shows all tied leaders and not a venue below', async () => {
        const ps = [] as Awaited<ReturnType<typeof asParticipant>>[];
        for (const n of ['Lan', 'Minh', 'Nam', 'Oanh', 'Phúc']) ps.push(await asParticipant(n));
        const id = await seed(ps[0].participant.id);
        const [b, a] = await venueIds(id);
        const c = await createVenue({ name: 'Quán Chay C', address: '3 Trần Phú', mapsUrl: null });
        const id2 = await createOuting({
          date: '2030-05-18', sitTime: '18:30', closeTime: '16:00',
          venueIds: [a!, b!, c.id], organizerId: ps[0].participant.id,
        });
        for (const p of ps) await setAnswer(id2, p.participant.id, true);
        await castVote(id2, ps[0].participant.id, a!);
        await castVote(id2, ps[1].participant.id, a!);
        await castVote(id2, ps[2].participant.id, b!);
        await castVote(id2, ps[3].participant.id, b!);
        await castVote(id2, ps[4].participant.id, c.id);
        const line = leadLine(await get(id2, ps[0].headers));
        expect(line).toContain('Quán Ốc Đào');
        expect(line).toContain('Bia Hơi Hà Nội');
        expect(line).not.toContain('Quán Chay C');
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
