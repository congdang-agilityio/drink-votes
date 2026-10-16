import { Hono } from 'hono';
import { getOuting } from '../db/outings.js';
import { castVote } from '../db/votes.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { Layout } from '../views/layout.js';
import { OutingClosed, OutingNotFound } from '../views/outing-page.js';

export const vote = new Hono<IdentityEnv>();

function NotGoing({ outingId }: { outingId: string }) {
  return (
    <Layout title="Không thể bình chọn">
      <h1>Không thể bình chọn</h1>
      <p>Chỉ người đi mới được bình chọn.</p>
      <p>
        <a href={`/outings/${outingId}`}>Quay lại kèo</a>
      </p>
    </Layout>
  );
}

vote.post('/outings/:id{[0-9a-f-]{36}}/vote', async (c) => {
  const id = c.req.param('id');
  const found = await getOuting(id);
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  const venueId = (await c.req.parseBody())['venueId'];
  if (typeof venueId !== 'string') return c.text('Quán không hợp lệ.', 400);
  const result = await castVote(id, c.var.participant.id, venueId);
  if (result === 'closed') {
    return c.html(`<!DOCTYPE html>${(<OutingClosed outingId={id} />)}`, 409);
  }
  if (result === 'not_going') {
    return c.html(`<!DOCTYPE html>${(<NotGoing outingId={id} />)}`, 403);
  }
  if (result === 'unknown_venue') return c.text('Quán không hợp lệ.', 400);
  return c.redirect(`/outings/${id}`, 303);
});
