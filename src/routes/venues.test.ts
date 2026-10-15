import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { closePool } from '../db/pool.js';
import { resetDb } from '../test/db.js';
import { asParticipant } from '../test/identity.js';

type Headers = { Cookie: string };

const addVenue = (headers: Headers, fields: Record<string, string>) =>
  createApp().request('/venues', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

const venuesPage = async (headers: Headers) => {
  const res = await createApp().request('/venues', { headers });
  expect(res.status).toBe(200);
  return res.text();
};

/** The HTML of the list item that contains the given venue name. */
const itemFor = (html: string, name: string) => {
  const items = html.match(/<li class="venue">[\s\S]*?<\/li>/g) ?? [];
  const item = items.find((li) => li.includes(name));
  expect(item, `list item for ${name}`).toBeDefined();
  return item as string;
};

describe('/venues', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closePool();
  });

  it('links to /venues from the home page in Vietnamese', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await (await createApp().request('/', { headers })).text();
    expect(html).toMatch(/<a[^>]*href="\/venues"[^>]*>Danh sách quán<\/a>/);
  });

  it('renders the list page in the shared layout with the Vietnamese form', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await venuesPage(headers);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toMatch(/<header class="site-header"/);
    expect(html).toContain('<title>Danh sách quán · Drink Votes</title>');
    expect(html).toMatch(/<form[^>]*method="post"[^>]*action="\/venues"/);
    for (const label of ['Tên quán', 'Địa chỉ', 'Link Google Maps', 'Ghi chú']) {
      expect(html).toContain(`>${label}</label>`);
    }
    expect(html).toMatch(/<input[^>]*name="name"[^>]*required/);
    expect(html).toMatch(/<input[^>]*name="address"[^>]*required/);
    expect(html).toMatch(/<input[^>]*name="mapsUrl"/);
    expect(html).toMatch(/<textarea[^>]*name="notes"/);
    expect(html).toContain('Chưa có quán nào.');
  });

  it('sends a visitor without identity to the name prompt', async () => {
    const res = await createApp().request('/venues');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/name?next=%2Fvenues');
  });

  it('adds a venue with all fields and redirects 303 to the list', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await addVenue(headers, {
      name: 'Quán Ốc Đào',
      address: '212B Nguyễn Trãi, Quận 1',
      mapsUrl: 'https://maps.app.goo.gl/abc123',
      notes: 'có chỗ để xe, bia tươi',
    });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/venues');

    const html = await venuesPage(headers);
    expect(html).not.toContain('Chưa có quán nào.');
    const item = itemFor(html, 'Quán Ốc Đào');
    expect(item).toContain('212B Nguyễn Trãi, Quận 1');
    expect(item).toContain('https://maps.app.goo.gl/abc123');
    expect(item).toContain('có chỗ để xe, bia tươi');
  });

  it('renders the Maps link as an <a> with the entered href opening in a new tab', async () => {
    const { headers } = await asParticipant('Lan');
    await addVenue(headers, {
      name: 'Quán Ốc Đào',
      address: 'Quận 1',
      mapsUrl: 'https://maps.google.com/?q=a&b=c',
    });
    const item = itemFor(await venuesPage(headers), 'Quán Ốc Đào');
    expect(item).toMatch(
      /<a href="https:\/\/maps\.google\.com\/\?q=a&amp;b=c" target="_blank" rel="noopener noreferrer">/,
    );
  });

  it('accepts an http:// Maps link as a link', async () => {
    const { headers } = await asParticipant('Lan');
    await addVenue(headers, { name: 'Quán A', address: 'Quận 3', mapsUrl: 'HTTP://maps.example/x' });
    const item = itemFor(await venuesPage(headers), 'Quán A');
    expect(item).toMatch(/<a href="HTTP:\/\/maps\.example\/x"/);
  });

  it('shows no link or notes for a venue with only name and address', async () => {
    const { headers } = await asParticipant('Lan');
    const res = await addVenue(headers, { name: 'Quán Gió', address: '5 Lê Lợi', mapsUrl: '', notes: '' });
    expect(res.status).toBe(303);
    const item = itemFor(await venuesPage(headers), 'Quán Gió');
    expect(item).toContain('5 Lê Lợi');
    expect(item).not.toMatch(/<a\b/);
    expect(item).not.toContain('venue-maps');
    expect(item).not.toContain('venue-notes');
  });

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,<b>x</b>', 'maps.google.com/x'])(
    'never renders the non-http link %j as an href',
    async (mapsUrl) => {
      const { headers } = await asParticipant('Lan');
      await addVenue(headers, { name: 'Quán Lạ', address: 'Quận 5', mapsUrl });
      const item = itemFor(await venuesPage(headers), 'Quán Lạ');
      expect(item).not.toMatch(/<a\b/);
      expect(item).not.toMatch(/href=/);
      expect(item).toContain('venue-maps');
    },
  );

  it('HTML-escapes every value', async () => {
    const { headers } = await asParticipant('Lan');
    await addVenue(headers, {
      name: '<script>alert(1)</script>',
      address: '<img src=x onerror=alert(1)>',
      mapsUrl: 'https://x/"><script>alert(2)</script>',
      notes: '<b>bold</b>',
    });
    const html = await venuesPage(headers);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>bold');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('href="https://x/&quot;&gt;&lt;script&gt;alert(2)&lt;/script&gt;"');
  });

  it('shares a venue added with cookie A with cookie B', async () => {
    const a = await asParticipant('Lan');
    const b = await asParticipant('Minh');
    await addVenue(a.headers, { name: 'Quán Chung', address: 'Quận 7' });
    const item = itemFor(await venuesPage(b.headers), 'Quán Chung');
    expect(item).toContain('Quận 7');
  });

  it('keeps long addresses and links wrapping on narrow screens', async () => {
    const { headers } = await asParticipant('Lan');
    const html = await venuesPage(headers);
    // The shared layout sets overflow-wrap: anywhere on body; the list must not undo it.
    expect(html).toContain('overflow-wrap: anywhere');
    expect(html).not.toMatch(/white-space:\s*nowrap/);
  });
});
