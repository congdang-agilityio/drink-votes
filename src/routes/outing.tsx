import { Hono } from 'hono';
import { getAnswer, getAttendance } from '../db/attendance.js';
import { getOuting } from '../db/outings.js';
import { getVote, getVoteCounts } from '../db/votes.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { answer } from './answer.js';
import { vote } from './vote.js';
import { leadingVenues } from '../services/leading.js';
import { CancelledOutingPage } from '../views/cancelled-outing.js';
import { ClosedOutingPage } from '../views/closed-outing.js';
import { OutingNotFound, OutingPage } from '../views/outing-page.js';

export const outing = new Hono<IdentityEnv>();
outing.route('/', answer);
outing.route('/', vote);

outing.get('/outings/:id{[0-9a-f-]{36}}', async (c) => {
  const found = await getOuting(c.req.param('id'));
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  if (found.closedAt && found.cancelled) {
    const { goingCount } = await getAttendance(found.id);
    return c.html(
      `<!DOCTYPE html>${(<CancelledOutingPage outing={found} goingCount={goingCount} />)}`,
    );
  }
  if (found.closedAt) {
    const [attendance, counts] = await Promise.all([
      getAttendance(found.id),
      getVoteCounts(found.id),
    ]);
    return c.html(
      `<!DOCTYPE html>${(<ClosedOutingPage outing={found} attendance={attendance} counts={counts} />)}`,
    );
  }
  const [attendance, myAnswer, counts, myVote] = await Promise.all([
    getAttendance(found.id),
    getAnswer(found.id, c.var.participant.id),
    getVoteCounts(found.id),
    getVote(found.id, c.var.participant.id),
  ]);
  return c.html(
    `<!DOCTYPE html>${(<OutingPage
        outing={found} attendance={attendance} myAnswer={myAnswer}
        counts={counts}
        leaders={leadingVenues(counts)}
        myVote={myVote}
      />)}`,
  );
});
