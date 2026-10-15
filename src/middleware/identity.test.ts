import { Hono } from 'hono';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { closePool } from '../db/pool.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';
import { identity, type IdentityEnv } from './identity.js';

describe('identity middleware', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('redirects GET / without a cookie to /name?next=%2F', async () => {
    const res = await createApp().request('/');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/name?next=%2F');
  });

  it('keeps the path and query in next', async () => {
    const res = await createApp().request('/some/path?x=1');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`/name?next=${encodeURIComponent('/some/path?x=1')}`);
  });

  it.each([
    ['unknown', 'dv_pid=00000000-0000-4000-8000-000000000000'],
    ['malformed', 'dv_pid=not-a-uuid'],
    ['empty', 'dv_pid='],
  ])('redirects a GET with an %s dv_pid', async (_kind, cookie) => {
    const res = await createApp().request('/', { headers: { Cookie: cookie } });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/name?next=%2F');
  });

  it('redirects other methods without a known participant 303 to /name?next=/', async () => {
    const res = await createApp().request('/some/path?x=1', { method: 'POST' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/name?next=/');
  });

  it('lets a known participant through to /', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/', { headers });
    expect(res.status).toBe(200);
  });

  it('sets c.var.participant to the participant from the cookie', async () => {
    const { participant, headers } = await asParticipant('Lan');
    const app = new Hono<IdentityEnv>();
    app.use('*', identity);
    app.get('/me', (c) => c.json(c.var.participant));
    const res = await app.request('/me', { headers });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: participant.id, displayName: 'Lan' });
  });

  it('skips /healthz and /name even when registered before them', async () => {
    const app = new Hono<IdentityEnv>();
    app.use('*', identity);
    app.get('/healthz', (c) => c.text('ok'));
    app.get('/name', (c) => c.text('name'));
    expect((await app.request('/healthz')).status).toBe(200);
    expect((await app.request('/name')).status).toBe(200);
  });

  it('answers /healthz and /name without a cookie', async () => {
    const app = createApp();
    expect((await app.request('/healthz')).status).toBe(200);
    expect((await app.request('/name?next=%2F')).status).toBe(200);
  });

  it('returns to the requested page after naming and does not ask again', async () => {
    const app = createApp();
    const first = await app.request('/');
    expect(first.status).toBe(302);
    const prompt = first.headers.get('location') ?? '';
    const next = new URL(prompt, 'http://localhost').searchParams.get('next') ?? '';
    expect(next).toBe('/');

    const posted = await app.request('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Lan', next }).toString(),
    });
    expect(posted.status).toBe(303);
    expect(posted.headers.get('location')).toBe('/');
    const cookie = (posted.headers.get('set-cookie') ?? '').split(';')[0];
    expect(cookie).toMatch(/^dv_pid=/);

    const again = await app.request('/', { headers: { Cookie: cookie } });
    expect(again.status).toBe(200);
  });
});
