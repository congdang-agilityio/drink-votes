import type { MiddlewareHandler } from 'hono';
import { closeDueOutings } from '../services/closing.js';

/**
 * Closes every outing past its close time before the request is served, so the page never shows
 * stale open state. A failing outing is logged and skipped inside the sweep; a failure of the
 * sweep itself is logged and rethrown, so the request fails rather than showing stale state.
 */
export const closeDue: MiddlewareHandler = async (c, next) => {
  try {
    await closeDueOutings();
  } catch (err) {
    console.error('closeDue: sweep failed', err);
    throw err;
  }
  return next();
};
