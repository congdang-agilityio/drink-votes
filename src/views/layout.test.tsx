import { describe, expect, it } from 'vitest';
import { Layout } from './layout.js';

describe('Layout', () => {
  it('renders a Vietnamese document with title, header and viewport', async () => {
    const html = String(await (<Layout><p>Xin chào</p></Layout>));
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain('<title>Drink Votes</title>');
    expect(html).toMatch(/<header[^>]*>[\s\S]*Drink Votes[\s\S]*<\/header>/);
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"');
    expect(html).toContain('Xin chào');
  });

  it('appends the product name to a page title', async () => {
    const html = String(await (<Layout title="Kèo tối nay"><p>x</p></Layout>));
    expect(html).toContain('<title>Kèo tối nay · Drink Votes</title>');
  });

  it('has phone-friendly CSS', async () => {
    const html = String(await (<Layout><p>x</p></Layout>));
    expect(html).toContain('box-sizing: border-box');
    expect(html).toContain('overflow-wrap: anywhere');
    expect(html).toContain('max-width: 100%');
  });
});
