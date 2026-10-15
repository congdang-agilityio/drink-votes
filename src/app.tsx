import { Hono } from 'hono';
import { healthRoute } from './routes/health.js';
import { home } from './routes/home.js';
import { name } from './routes/name.js';
import { NotFound } from './views/not-found.js';

export function createApp(): Hono {
  const app = new Hono();
  // First, before any page middleware: the health check must never be redirected.
  app.route('/', healthRoute());
  app.route('/', home);
  app.route('/', name);
  app.notFound((c) => c.html(`<!DOCTYPE html>${(<NotFound />)}`, 404));
  return app;
}
