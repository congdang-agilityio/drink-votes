import { Hono } from 'hono';
import { getOuting } from '../db/outings.js';
import { setAnswer } from '../db/attendance.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { OutingNotFound } from '../views/outing-page.js';

export const answer = new Hono<IdentityEnv>();

// No close-time check: outings never close in M1.
answer.post('/outings/:id{[0-9a-f-]{36}}/answer', async (c) => {
  const id = c.req.param('id');
  const found = await getOuting(id);
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  const body = await c.req.parseBody();
  const going = body['going'];
  if (going !== 'yes' && going !== 'no') {
    return c.text('Câu trả lời không hợp lệ.', 400);
  }
  await setAnswer(id, c.var.participant.id, going === 'yes');
  return c.redirect(`/outings/${id}`, 303);
});
