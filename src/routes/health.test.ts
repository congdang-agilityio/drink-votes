import pg from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { closePool } from '../db/pool.js';
import { healthRoute } from './health.js';

afterEach(async () => {
  vi.restoreAllMocks();
  await closePool();
});

describe('GET /healthz', () => {
  it('returns 200 {"status":"ok"} with the real test database', async () => {
    const res = await createApp().request('/healthz');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 {"status":"error"} when the check fails, without leaking details', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = healthRoute(async () => {
      throw new Error('postgres://user:secret@host/db refused');
    });
    const res = await app.request('/healthz');
    expect(res.status).toBe(503);
    const body = await res.text();
    expect(JSON.parse(body)).toEqual({ status: 'error' });
    expect(body).not.toContain('secret');
    expect(log).toHaveBeenCalled();
  });

  it('returns 503 within the timeout when the check hangs', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = healthRoute(() => new Promise<void>(() => {}), 50);
    const started = Date.now();
    const res = await app.request('/healthz');
    expect(res.status).toBe(503);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('returns 503 against a pool pointed at an unused port', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const dead = new pg.Pool({ connectionString: 'postgresql://postgres:x@127.0.0.1:1/none' });
    try {
      const { ping } = await import('../db/pool.js');
      const res = await healthRoute(() => ping(dead)).request('/healthz');
      expect(res.status).toBe(503);
    } finally {
      await dead.end();
    }
  });

  it('is not redirected and needs no cookie', async () => {
    const res = await createApp().request('/healthz', { redirect: 'manual' });
    expect(res.status).toBe(200);
  });
});
