import { Hono } from 'hono';
import { getOuting } from '../db/outings.js';
import { recordVisit } from '../db/visits.js';
import { isReached } from '../lib/time.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { chooseWinner } from '../db/ties.js';
import { closeOuting } from '../services/closing.js';
import { Layout } from '../views/layout.js';
import { OutingNotFound } from '../views/outing-page.js';

/** Organizer-only actions on an outing; only the browser that created it may use them. */
export const organizer = new Hono<IdentityEnv>();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function NotOrganizer({ outingId, action }: { outingId: string; action: string }) {
  return (
    <Layout title={`Không thể ${action}`}>
      <h1>Không thể {action}</h1>
      <p>Chỉ người tạo kèo mới được {action}.</p>
      <p>
        <a href={`/outings/${outingId}`}>Quay lại kèo</a>
      </p>
    </Layout>
  );
}

function CannotChoose({ outingId }: { outingId: string }) {
  return (
    <Layout title="Không thể chọn quán">
      <h1>Không thể chọn quán</h1>
      <p>Kèo không chờ chọn quán, đã có quán thắng, hoặc quán này không nằm trong các quán hoà.</p>
      <p>
        <a href={`/outings/${outingId}`}>Quay lại kèo</a>
      </p>
    </Layout>
  );
}

/**
 * Closes the outing now with the usual rules (cancelled below MIN_PEOPLE Going, otherwise the
 * most voted venue wins). Closing is final: an already closed outing is left unchanged.
 */
organizer.post('/outings/:id{[0-9a-f-]{36}}/close', async (c) => {
  const id = c.req.param('id');
  const found = await getOuting(id);
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  if (c.var.participant.id !== found.organizerId) {
    return c.html(`<!DOCTYPE html>${(<NotOrganizer outingId={id} action="chốt kèo" />)}`, 403);
  }
  await closeOuting(id);
  return c.redirect(`/outings/${id}`, 303);
});

/**
 * Picks the winner among the venues still tied at close. Final: refused (409) when the outing
 * is not waiting for a choice, already has a winner, or the venue was not tied.
 */
organizer.post('/outings/:id{[0-9a-f-]{36}}/choose', async (c) => {
  const id = c.req.param('id');
  const found = await getOuting(id);
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  if (c.var.participant.id !== found.organizerId) {
    return c.html(`<!DOCTYPE html>${(<NotOrganizer outingId={id} action="chọn quán" />)}`, 403);
  }
  const venueId = (await c.req.parseBody())['venueId'];
  if (typeof venueId !== 'string' || !UUID_RE.test(venueId)) {
    return c.text('Quán không hợp lệ.', 400);
  }
  if (!(await chooseWinner(id, venueId))) {
    return c.html(`<!DOCTYPE html>${(<CannotChoose outingId={id} />)}`, 409);
  }
  return c.redirect(`/outings/${id}`, 303);
});

/** A refused visit answer (409): a Vietnamese reason with a link back. */
function CannotConfirmVisit({ outingId, reason }: { outingId: string; reason: string }) {
  return (
    <Layout title="Chưa thể xác nhận">
      <h1>Chưa thể xác nhận</h1>
      <p>{reason}</p>
      <p>
        <a href={`/outings/${outingId}`}>Quay lại kèo</a>
      </p>
    </Layout>
  );
}

/**
 * Records the organizer's final "Đã đi" (visited=yes) or "Không đi" (visited=no) answer for a
 * closed outing with a winner, from its sitting time on (no deadline). Open, cancelled, waiting
 * or already answered outings are refused; the store refuses a concurrent second answer.
 */
organizer.post('/outings/:id{[0-9a-f-]{36}}/visit', async (c) => {
  const id = c.req.param('id');
  const found = await getOuting(id);
  if (!found) return c.html(`<!DOCTYPE html>${(<OutingNotFound />)}`, 404);
  const visited = (await c.req.parseBody())['visited'];
  if (visited !== 'yes' && visited !== 'no') return c.text('Câu trả lời không hợp lệ.', 400);
  if (c.var.participant.id !== found.organizerId) {
    const page = <NotOrganizer outingId={id} action="xác nhận đã đi hay không" />;
    return c.html(`<!DOCTYPE html>${page}`, 403);
  }
  const conflict = (reason: string) =>
    c.html(`<!DOCTYPE html>${(<CannotConfirmVisit outingId={id} reason={reason} />)}`, 409);
  if (!found.closedAt || found.cancelled || !found.winnerVenueId) {
    return conflict('Kèo chưa có quán thắng nên không thể xác nhận đã đi.');
  }
  if (found.visited !== null) return conflict('Kèo này đã được xác nhận rồi.');
  if (!isReached(found.date, found.sitTime)) {
    return conflict('Chỉ xác nhận được từ giờ ngồi của kèo.');
  }
  if (!(await recordVisit(id, visited === 'yes'))) return conflict('Kèo này đã được xác nhận rồi.');
  return c.redirect(`/outings/${id}`, 303);
});
