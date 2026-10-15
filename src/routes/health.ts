import { Hono } from 'hono';
import { getPool, ping } from '../db/pool.js';

const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Health check for the hosting platform: 200 when the database answers, 503 otherwise.
 * It needs no cookie or name and must never be redirected: any identity middleware added
 * later has to skip `/healthz`.
 */
export function healthRoute(
  check: () => Promise<void> = () => ping(getPool()),
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Hono {
  const app = new Hono();
  app.get('/healthz', async (c) => {
    let timer: NodeJS.Timeout | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('health check timed out')), timeoutMs);
      });
      await Promise.race([check(), timeout]);
      return c.json({ status: 'ok' });
    } catch (err) {
      console.error('healthz: database check failed:', err instanceof Error ? err.message : err);
      return c.json({ status: 'error' }, 503);
    } finally {
      clearTimeout(timer);
    }
  });
  return app;
}
