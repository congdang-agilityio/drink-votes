import { Hono } from 'hono';
import { config } from '../config.js';
import { createOuting } from '../db/outings.js';
import { listVenues } from '../db/venues.js';
import { isValidDate, isValidTime } from '../lib/time.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { validateNewOuting } from '../services/outing-rules.js';
import { OutingForm, type OutingFormErrors, type OutingFormValues } from '../views/outing-form.js';

export const outings = new Hono<IdentityEnv>();

/** A form field as text: missing values and file uploads become an empty string. */
const field = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const render = async (values: OutingFormValues, errors?: OutingFormErrors) =>
  `<!DOCTYPE html>${(<OutingForm venues={await listVenues()} values={values} errors={errors} />)}`;

outings.get('/outings/new', async (c) =>
  c.html(await render({ date: '', sitTime: '18:30', closeTime: config.defaultCloseAt, venueIds: [] })),
);

outings.post('/outings', async (c) => {
  const body = await c.req.parseBody({ all: true });
  const raw = body['venueIds'];
  const chosen = (Array.isArray(raw) ? raw : [raw]).filter((v) => typeof v === 'string');
  const known = new Set((await listVenues()).map((v) => v.id));
  const values: OutingFormValues = {
    date: field(body['date']),
    sitTime: field(body['sitTime']),
    closeTime: field(body['closeTime']),
    // Dedupe (keeping the chosen order): a repeated id would break outing_venues' primary key.
    venueIds: [...new Set(chosen)].filter((id) => known.has(id)),
  };
  if (!isValidDate(values.date) || !isValidTime(values.sitTime) || !isValidTime(values.closeTime)) {
    return c.html(await render(values, { form: 'Thông tin chưa hợp lệ, bạn kiểm tra lại ngày và giờ nhé.' }), 400);
  }
  const check = validateNewOuting(values);
  if (!check.ok) return c.html(await render(values, check.errors), 400);
  const id = await createOuting({
    date: values.date,
    sitTime: values.sitTime,
    closeTime: values.closeTime,
    venueIds: values.venueIds,
    organizerId: c.var.participant.id,
  });
  return c.redirect(`/outings/${id}`, 303);
});
