import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('createApp', () => {
  it('responds 404 for an unknown path', async () => {
    const app = createApp();
    const res = await app.request('/unknown');
    expect(res.status).toBe(404);
  });
});
