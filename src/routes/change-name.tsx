import { Hono } from 'hono';
import { renameParticipant } from '../db/participants.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from '../lib/display-name.js';
import { safeNext } from '../lib/identity.js';
import { Layout } from '../views/layout.js';

export const changeName = new Hono<IdentityEnv>();

function ChangeNameForm(props: { current: string; next: string; error?: string }) {
  return (
    <Layout title="Đổi tên">
      <h1>Đổi tên</h1>
      {props.error ? <p role="alert">{props.error}</p> : null}
      <form method="post" action="/me/name">
        <input type="hidden" name="next" value={props.next} />
        <p>
          <label for="display-name">Tên hiển thị</label>
          <br />
          <input
            id="display-name"
            type="text"
            name="name"
            value={props.current}
            maxlength={DISPLAY_NAME_MAX_LENGTH}
            autocomplete="nickname"
            required
          />
        </p>
        <button type="submit">Lưu</button>
      </form>
    </Layout>
  );
}

const page = (current: string, next: string, error?: string) =>
  `<!DOCTYPE html>${(<ChangeNameForm current={current} next={next} error={error} />)}`;

changeName.get('/me/name', (c) =>
  c.html(page(c.var.participant.displayName, safeNext(c.req.query('next')))),
);

changeName.post('/me/name', async (c) => {
  const { id, displayName: current } = c.var.participant;
  const body = await c.req.parseBody();
  const next = safeNext(body['next']);
  const displayName = normalizeDisplayName(body['name']);
  if (!displayName) {
    return c.html(page(current, next, 'Vui lòng nhập tên của bạn.'), 400);
  }
  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return c.html(page(current, next, `Tên tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`), 400);
  }
  await renameParticipant(id, displayName);
  return c.redirect(next, 303);
});
