import { Hono } from 'hono';
import { identity, type IdentityEnv } from './middleware/identity.js';
import { healthRoute } from './routes/health.js';
import { changeName } from './routes/change-name.js';
import { home } from './routes/home.js';
import { name } from './routes/name.js';
import { outing } from './routes/outing.js';
import { NotFound } from './views/not-found.js';

export function createApp(): Hono<IdentityEnv> {
  const app = new Hono<IdentityEnv>();
  // First, before any page middleware: the health check must never be redirected.
  app.route('/', healthRoute());
  app.route('/', name);
  // Every page below needs a known participant (c.var.participant).
  app.use('*', identity);
  app.route('/', home);
  app.route('/', outing);
  app.route('/', changeName);
  app.notFound((c) => c.html(`<!DOCTYPE html>${(<NotFound />)}`, 404));
  return app;
}
