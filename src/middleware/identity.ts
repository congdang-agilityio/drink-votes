import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { findParticipant, type Participant } from '../db/participants.js';
import { PARTICIPANT_COOKIE } from '../lib/identity.js';

/** Hono environment of pages behind the identity middleware: `c.var.participant` is set. */
export type IdentityEnv = { Variables: { participant: Participant } };

/** Paths that answer without a known participant: the health check and the name prompt. */
const OPEN_PATHS = new Set(['/healthz', '/name']);

/**
 * Recognises the browser from its `dv_pid` cookie (BR-09) and sets `c.var.participant`.
 * Without a known participant, a GET goes to `/name` with the requested page in `next`;
 * any other method goes to `/name?next=/` (its form data cannot be replayed).
 */
export const identity: MiddlewareHandler<IdentityEnv> = async (c, next) => {
  if (OPEN_PATHS.has(c.req.path)) return next();
  const id = getCookie(c, PARTICIPANT_COOKIE);
  const participant = id ? await findParticipant(id) : null;
  if (participant) {
    c.set('participant', participant);
    return next();
  }
  if (c.req.method === 'GET') {
    const url = new URL(c.req.url);
    return c.redirect(`/name?next=${encodeURIComponent(url.pathname + url.search)}`, 302);
  }
  return c.redirect('/name?next=/', 303);
};
