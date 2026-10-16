import { Hono } from 'hono';
import { getOuting } from '../db/outings.js';
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
