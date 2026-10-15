import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { closePool } from '../db/pool.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

describe('GET /', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('serves the Vietnamese home page', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await createApp().request('/', { headers });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Drink Votes</title>');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Votes[\s\S]*<\/header>/);
    expect(html).toContain('Rủ nhau đi nhậu: ai đi, quán nào, mấy giờ.');
    expect(html).toContain('name="viewport"');
    expect(html).not.toMatch(/<form|type="password"|login|đăng nhập/i);
    expect(html).not.toMatch(/English|hreflang|lang-switch/i);
  });
});
