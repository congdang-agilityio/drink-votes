import { Hono } from 'hono';
import { getAnswer, getAttendance } from '../db/attendance.js';
import { getOuting } from '../db/outings.js';
import { getTiedVenues } from '../db/ties.js';
import { getVote, getVoteCounts } from '../db/votes.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { answer } from './answer.js';
import { organizer } from './organizer.js';
import { vote } from './vote.js';
import { isReached } from '../lib/time.js';
import { lastVisitDates } from '../db/visits.js';
import { leadingVenues } from '../services/leading.js';
import { CancelledOutingPage } from '../views/cancelled-outing.js';
import { ClosedOutingPage } from '../views/closed-outing.js';
import { WaitingOutingPage } from '../views/waiting-outing.js';
import { outingUrl } from '../lib/outing-url.js';
import { qrSvg } from '../lib/qr.js';
import { OutingNotFound, OutingPage } from '../views/outing-page.js';

export const outing = new Hono<IdentityEnv>();
outing.route('/', answer);
outing.route('/', vote);
outing.route('/', organizer);

outing.get('/outings/:id{[0-9a-f-]{36}}', async (c) => {
  // The QR link is built from the request's Host header: never share this page via a cache.
  c.header('Cache-Control', 'private, no-store');
  const found = await getOuting(c.req.param('id'));
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  if (found.closedAt && found.cancelled) {
    const { goingCount } = await getAttendance(found.id);
    return c.html(
      `<!DOCTYPE html>${(<CancelledOutingPage outing={found} goingCount={goingCount} />)}`,
    );
  }
  if (found.closedAt && !found.winnerVenueId) {
    const [attendance, counts, tiedVenueIds] = await Promise.all([
      getAttendance(found.id),
      getVoteCounts(found.id),
      getTiedVenues(found.id),
    ]);
    if (tiedVenueIds.length > 0) {
      return c.html(
        `<!DOCTYPE html>${(<WaitingOutingPage
            outing={found} attendance={attendance} counts={counts}
            tiedVenueIds={tiedVenueIds}
            isOrganizer={found.organizerId === c.var.participant.id}
          />)}`,
      );
    }
  }
  if (found.closedAt) {
    const [attendance, counts] = await Promise.all([
      getAttendance(found.id),
      getVoteCounts(found.id),
    ]);
    const askVisit =
      found.organizerId === c.var.participant.id &&
      found.winnerVenueId !== null &&
      found.visited === null &&
      isReached(found.date, found.sitTime);
    return c.html(
      `<!DOCTYPE html>${(<ClosedOutingPage outing={found} attendance={attendance} counts={counts} askVisit={askVisit} />)}`,
    );
  }
  const [attendance, myAnswer, counts, myVote] = await Promise.all([
    getAttendance(found.id),
    getAnswer(found.id, c.var.participant.id),
    getVoteCounts(found.id),
    getVote(found.id, c.var.participant.id),
  ]);
  const lastVisits = await lastVisitDates(found.venues.map((v) => v.id));
  return c.html(
    `<!DOCTYPE html>${(<OutingPage
        outing={found} attendance={attendance} myAnswer={myAnswer}
        counts={counts}
        leaders={leadingVenues(counts, lastVisits)}
        myVote={myVote}
        isOrganizer={found.organizerId === c.var.participant.id}
        qrSvg={qrSvg(outingUrl(c.req.url, c.req.header('x-forwarded-proto'), found.id))}
      />)}`,
  );
});
