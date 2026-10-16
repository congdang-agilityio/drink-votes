import { Hono } from 'hono';
import { listHistory } from '../db/history.js';
import { History } from '../views/history.js';
import { Layout } from '../views/layout.js';

export const history = new Hono();

history.get('/history', async (c) => {
  const entries = await listHistory();
  return c.html(
    `<!DOCTYPE html>${(
      <Layout>
        <History entries={entries} />
      </Layout>
    )}`,
  );
});
