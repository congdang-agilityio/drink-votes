import { Hono } from "hono";
import { listUpcomingOutings } from "../db/upcoming-outings.js";
import { todayIn } from "../lib/time.js";
import { Layout } from "../views/layout.js";
import { UpcomingOutings } from "../views/upcoming-outings.js";

export const home = new Hono();

home.get("/", async (c) => {
  const outings = await listUpcomingOutings(todayIn());
  return c.html(
    `<!DOCTYPE html>${(
      <Layout>
        <h1>Chào mừng bạn</h1>
        <p>Rủ nhau đi nhậu: ai đi, quán nào, mấy giờ.</p>
        <p>
          <a href="/venues">Danh sách quán</a>
        </p>
        <p>
          <a href="/outings/new">Tạo kèo</a>
        </p>
        <p>
          <a href="/history">Lịch sử</a>
        </p>
        <UpcomingOutings outings={outings} />
      </Layout>
    )}`,
  );
});
