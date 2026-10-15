import { Hono } from 'hono';
import { getAnswer, getAttendance } from '../db/attendance.js';
import { getOuting } from '../db/outings.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { answer } from './answer.js';
import { vote } from './vote.js';
import { OutingNotFound, OutingPage } from '../views/outing-page.js';

export const outing = new Hono<IdentityEnv>();
outing.route('/', answer);
outing.route('/', vote);

outing.get('/outings/:id{[0-9a-f-]{36}}', async (c) => {
  const found = await getOuting(c.req.param('id'));
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  const [attendance, myAnswer] = await Promise.all([
    getAttendance(found.id),
    getAnswer(found.id, c.var.participant.id),
  ]);
  return c.html(
    `<!DOCTYPE html>${(<OutingPage outing={found} attendance={attendance} myAnswer={myAnswer} />)}`,
  );
});
