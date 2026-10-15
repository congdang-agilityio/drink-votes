import { Hono } from 'hono';
import { home } from './routes/home.js';
import { NotFound } from './views/not-found.js';

export function createApp(): Hono {
  const app = new Hono();
  app.route('/', home);
  app.notFound((c) => c.html(`<!DOCTYPE html>${(<NotFound />)}`, 404));
  return app;
}
