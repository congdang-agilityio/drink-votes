import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/closing.js', () => ({
  closeDueOutings: vi.fn(),
}));

import { closeDueOutings } from '../services/closing.js';
import { closeDue } from './close-due.js';

const sweep = vi.mocked(closeDueOutings);

/** A tiny app with `closeDue` in front of one page route that records whether it ran. */
function appWithPage() {
  const reached = vi.fn();
  const app = new Hono();
  app.use('*', closeDue);
  app.get('/page', (c) => {
    reached();
    return c.text('ok');
  });
  return { app, reached };
}

describe('closeDue middleware', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sweep.mockReset();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('runs the sweep, then serves the page', async () => {
    const order: string[] = [];
    sweep.mockImplementation(async () => {
      order.push('sweep');
    });
    const { app, reached } = appWithPage();
    reached.mockImplementation(() => order.push('page'));

    const res = await app.request('/page');

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
    expect(sweep).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['sweep', 'page']);
  });

  it('logs a sweep failure and fails the request without serving the page', async () => {
    const boom = new Error('db down');
    sweep.mockRejectedValue(boom);
    const { app, reached } = appWithPage();

    const res = await app.request('/page');

    expect(res.status).toBe(500);
    expect(reached).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('closeDue: sweep failed', boom);
  });
});
