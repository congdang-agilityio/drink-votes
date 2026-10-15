import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { identity, type IdentityEnv } from './middleware/identity.js';
import { healthRoute } from './routes/health.js';
import { changeName } from './routes/change-name.js';
import { home } from './routes/home.js';
import { name } from './routes/name.js';
import { outing } from './routes/outing.js';
import { outings } from './routes/outings.js';
import { venues } from './routes/venues.js';
import { NotFound } from './views/not-found.js';

export function createApp(): Hono<IdentityEnv> {
  const app = new Hono<IdentityEnv>();
  // Lets views read the request (the header shows the viewer's name).
  app.use('*', contextStorage());
  // Before any page middleware: the health check must never be redirected.
  app.route('/', healthRoute());
  app.route('/', name);
  // Every page below needs a known participant (c.var.participant).
  app.use('*', identity);
  app.route('/', home);
  // Before outing: it only matches uuid ids, but keep the literal path first.
  app.route('/', outings);
  app.route('/', outing);
  app.route('/', changeName);
  app.route('/', venues);
  app.notFound((c) => c.html(`<!DOCTYPE html>${(<NotFound />)}`, 404));
  return app;
}
