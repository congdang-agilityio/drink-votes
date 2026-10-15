import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { createParticipant } from '../db/participants.js';
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from '../lib/display-name.js';
import {
  identityCookieOptions,
  isHttpsRequest,
  PARTICIPANT_COOKIE,
  safeNext,
} from '../lib/identity.js';
import { Layout } from '../views/layout.js';

export const name = new Hono();

function NameForm({ next, error }: { next: string; error?: string }) {
  return (
    <Layout title="Tên của bạn">
      <h1>Bạn tên gì?</h1>
      {error ? <p role="alert">{error}</p> : null}
      <form method="post" action="/name">
        <input type="hidden" name="next" value={next} />
        <p>
          <label for="display-name">Tên hiển thị</label>
          <br />
          <input
            id="display-name"
            type="text"
            name="name"
            maxlength={DISPLAY_NAME_MAX_LENGTH}
            autocomplete="nickname"
            required
          />
        </p>
        <button type="submit">Tiếp tục</button>
      </form>
    </Layout>
  );
}

const page = (next: string, error?: string) =>
  `<!DOCTYPE html>${(<NameForm next={next} error={error} />)}`;

name.get('/name', (c) => c.html(page(safeNext(c.req.query('next')))));

name.post('/name', async (c) => {
  const body = await c.req.parseBody();
  const next = safeNext(body['next']);
  const displayName = normalizeDisplayName(body['name']);
  if (!displayName) {
    return c.html(page(next, 'Vui lòng nhập tên của bạn.'), 400);
  }
  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return c.html(page(next, `Tên tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`), 400);
  }
  const participant = await createParticipant(displayName);
  const secure = isHttpsRequest(c.req.url, c.req.header('x-forwarded-proto'));
  setCookie(c, PARTICIPANT_COOKIE, participant.id, identityCookieOptions(secure));
  return c.redirect(next, 303);
});
