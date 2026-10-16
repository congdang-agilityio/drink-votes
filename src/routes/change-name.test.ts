import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { getAttendance, setAnswer } from '../db/attendance.js';
import { createOuting } from '../db/outings.js';
import { findParticipant } from '../db/participants.js';
import { closePool } from '../db/pool.js';
import { createVenue } from '../db/venues.js';
import { DISPLAY_NAME_MAX_LENGTH } from '../lib/display-name.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

const post = (headers: Record<string, string>, fields: Record<string, string>) =>
  createApp().request('/me/name', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams(fields).toString(),
  });

async function newOuting(organizerId: string): Promise<string> {
  const a = await createVenue({ name: `A ${Math.random()}`, address: 'a' });
  const b = await createVenue({ name: `B ${Math.random()}`, address: 'b' });
  return createOuting({
    date: '2030-12-31',
    sitTime: '18:30',
    closeTime: '16:00',
    venueIds: [a.id, b.id],
    organizerId,
  });
}

describe('/me/name', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('renders the form prefilled with the current name and next', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/me/name?next=/outings/abc', { headers });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Đổi tên');
    expect(html).toContain('Lưu');
    expect(html).toMatch(/<input[^>]*name="name"[^>]*value="Lan"/);
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="next"[^>]*value="\/outings\/abc"/);
    expect(html).toMatch(/<header/);
  });

  it('defaults next to / when it is not a same-site path', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await (await createApp().request('/me/name?next=//evil.com', { headers })).text();
    expect(html).toMatch(/name="next"[^>]*value="\/"/);
  });

  it('renames, keeps the same id and cookie, and redirects to next', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const res = await post(headers, { name: '  Lan Anh ', next: '/outings/abc' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/outings/abc');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(await findParticipant(participant.id)).toEqual({
      id: participant.id,
      displayName: 'Lan Anh',
    });
    // The same cookie now reads the new name through the identity middleware.
    const page = await (await createApp().request('/me/name', { headers })).text();
    expect(page).toMatch(/name="name"[^>]*value="Lan Anh"/);
  });

  it('redirects to / when next is not a same-site path', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await post(headers, { name: 'Lan Anh', next: '//evil.com' });
    expect(res.headers.get('location')).toBe('/');
  });

  it.each(['', '   ', ' \t '])('refuses blank name %j with 400 and keeps the name', async (n) => {
    const { participant, headers } = await asParticipant('Lan');
    const res = await post(headers, { name: n, next: '/outings/abc' });
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain('Vui lòng nhập tên của bạn.');
    expect(html).toContain('value="/outings/abc"');
    expect((await findParticipant(participant.id))?.displayName).toBe('Lan');
  });

  it('refuses a name longer than the limit with 400 and keeps the name', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const res = await post(headers, { name: 'a'.repeat(DISPLAY_NAME_MAX_LENGTH + 1), next: '/' });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain(`Tên tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`);
    expect((await findParticipant(participant.id))?.displayName).toBe('Lan');
  });

  it('shows the new name on every outing the person answered', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const o1 = await newOuting(participant.id);
    const o2 = await newOuting(participant.id);
    await setAnswer(o1, participant.id, true);
    await setAnswer(o2, participant.id, true);
    await post(headers, { name: 'Lan Anh', next: '/' });
    for (const o of [o1, o2]) {
      const names = (await getAttendance(o)).goingNames;
      expect(names).toContain('Lan Anh');
      expect(names).not.toContain('Lan');
    }
  });

  it('sends a browser without identity to /name', async () => {
    const res = await createApp().request('/me/name');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/name?next=');
  });
});
