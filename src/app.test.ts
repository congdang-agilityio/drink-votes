import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('createApp', () => {
  it('responds 404 for an unknown path', async () => {
    const app = createApp();
    const res = await app.request('/unknown');
    expect(res.status).toBe(404);
  });

  it('renders the Vietnamese 404 page in the shared layout', async () => {
    const res = await createApp().request('/unknown');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain('site-header');
    expect(html).toContain('Không tìm thấy trang');
    expect(html).toContain('<a href="/">');
  });

  it('renders the 404 page for other methods too', async () => {
    const res = await createApp().request('/unknown', { method: 'POST' });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('Không tìm thấy trang');
  });
});
