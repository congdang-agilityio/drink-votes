import { Hono } from 'hono';
import { home } from './routes/home.js';

export function createApp(): Hono {
  const app = new Hono();
  app.route('/', home);
  return app;
}
