import { Hono } from 'hono';
import { getOuting } from '../db/outings.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { closeOuting } from '../services/closing.js';
import { Layout } from '../views/layout.js';
import { OutingNotFound } from '../views/outing-page.js';

/** Organizer-only actions on an outing; only the browser that created it may use them. */
export const organizer = new Hono<IdentityEnv>();

function NotOrganizer({ outingId }: { outingId: string }) {
  return (
    <Layout title="Không thể chốt kèo">
      <h1>Không thể chốt kèo</h1>
      <p>Chỉ người tạo kèo mới được chốt kèo.</p>
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
    return c.html(`<!DOCTYPE html>${(<NotOrganizer outingId={id} />)}`, 403);
  }
  await closeOuting(id);
  return c.redirect(`/outings/${id}`, 303);
});
