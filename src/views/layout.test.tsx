import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import type { IdentityEnv } from '../middleware/identity.js';
import { Layout } from './layout.js';

describe('Layout', () => {
  it('renders a Vietnamese document with title, header and viewport', async () => {
    const html = String(await (<Layout><p>Xin chào</p></Layout>));
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain('<title>Drink Tonight</title>');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Tonight[\s\S]*<\/header>/);
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"');
    expect(html).toContain('Xin chào');
  });

  it('appends the product name to a page title', async () => {
    const html = String(await (<Layout title="Kèo tối nay"><p>x</p></Layout>));
    expect(html).toContain('<title>Kèo tối nay · Drink Tonight</title>');
  });

  it('has phone-friendly CSS', async () => {
    const html = String(await (<Layout><p>x</p></Layout>));
    expect(html).toContain('box-sizing: border-box');
    expect(html).toContain('overflow-wrap: anywhere');
    expect(html).toContain('max-width: 100%');
  });

  it('shows no name when rendered outside a request', async () => {
    const html = String(await (<Layout><p>x</p></Layout>));
    expect(html).not.toContain('/me/name');
  });
});

describe('Layout "Đổi tên" return link', () => {
  async function linkFor(method: string, path: string): Promise<string> {
    const app = new Hono<IdentityEnv>();
    app.use(contextStorage());
    app.use(async (c, next) => {
      c.set('participant', { id: 'p', displayName: 'Lan' } as never);
      await next();
    });
    app.all('*', (c) => c.html(<Layout>x</Layout>));
    const html = await (await app.request(path, { method })).text();
    return /href="(\/me\/name[^"]*)"/.exec(html)?.[1] ?? '';
  }

  it('GET keeps its own path and query', async () => {
    expect(await linkFor('GET', '/outings/abc?x=1')).toBe('/me/name?next=%2Foutings%2Fabc%3Fx%3D1');
  });

  it.each(['close', 'choose', 'visit'])('POST /outings/:id/%s returns to the outing', async (a) => {
    expect(await linkFor('POST', `/outings/abc/${a}`)).toBe('/me/name?next=%2Foutings%2Fabc');
  });

  it('other non-GET paths fall back to /', async () => {
    expect(await linkFor('POST', '/venues')).toBe('/me/name?next=%2F');
  });
});
