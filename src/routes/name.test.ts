import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { closePool, getPool } from '../db/pool.js';
import { resetDb } from '../test/db.js';

const post = (fields: Record<string, string>, url = 'http://localhost/name') =>
  createApp().request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

const count = async () =>
  Number((await getPool().query('SELECT count(*) FROM participants')).rows[0].count);

describe('/name', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('renders the Vietnamese form carrying next', async () => {
    const res = await createApp().request('/name?next=/outings/abc');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Bạn tên gì?');
    expect(html).toContain('Tiếp tục');
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="next"[^>]*value="\/outings\/abc"/);
    expect(html).toMatch(/<header/);
    expect(html).not.toMatch(/password|mật khẩu|đăng nhập|tài khoản/i);
  });

  it.each(['', '   ', ' \t '])('refuses blank name %j with 400 and creates nothing', async (n) => {
    const res = await post({ name: n, next: '/outings/abc' });
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain('Vui lòng nhập tên của bạn.');
    expect(html).toContain('value="/outings/abc"');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(await count()).toBe(0);
  });

  it('creates a participant, sets dv_pid and redirects to next', async () => {
    const res = await post({ name: '  Lan ', next: '/outings/abc' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/outings/abc');
    const rows = (await getPool().query('SELECT id, display_name FROM participants')).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].display_name).toBe('Lan');
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`dv_pid=${rows[0].id}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=31536000/);
    expect(cookie).not.toMatch(/Secure/i);
  });

  it('marks the cookie Secure on HTTPS', async () => {
    const res = await post({ name: 'Lan', next: '/' }, 'https://localhost/name');
    expect(res.headers.get('set-cookie')).toMatch(/Secure/i);
  });

  it('redirects to / when next is not a same-site path', async () => {
    const res = await post({ name: 'Lan', next: '//evil.com' });
    expect(res.headers.get('location')).toBe('/');
  });

  it('gives a second "Lan" without cookie a different participant id', async () => {
    const a = await post({ name: 'Lan', next: '/' });
    const b = await post({ name: 'Lan', next: '/' });
    expect(a.status).toBe(303);
    expect(b.status).toBe(303);
    const id = (r: Response) => /dv_pid=([^;]+)/.exec(r.headers.get('set-cookie') ?? '')?.[1];
    expect(id(a)).toBeTruthy();
    expect(id(a)).not.toBe(id(b));
    expect(await count()).toBe(2);
  });
});
