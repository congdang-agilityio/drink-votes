import { Hono } from 'hono';
import { Layout } from '../views/layout.js';

export const home = new Hono();

home.get('/', (c) =>
  c.html(
    `<!DOCTYPE html>${(
      <Layout>
        <h1>Chào mừng bạn</h1>
        <p>Rủ nhau đi nhậu: ai đi, quán nào, mấy giờ.</p>
        <p>
          <a href="/venues">Danh sách quán</a>
        </p>
      </Layout>
    )}`,
  ),
);
