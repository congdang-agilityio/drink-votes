import { Hono } from 'hono';
import { createVenue, listVenues } from '../db/venues.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { VenuesPage } from '../views/venues.js';

export const venues = new Hono<IdentityEnv>();

/** A form field as text: missing values and file uploads become an empty string. */
const field = (value: unknown): string => (typeof value === 'string' ? value : '');

venues.get('/venues', async (c) =>
  c.html(`<!DOCTYPE html>${(<VenuesPage venues={await listVenues()} />)}`),
);

// Required-field and duplicate-name checks with their messages come with #7.
venues.post('/venues', async (c) => {
  const body = await c.req.parseBody();
  await createVenue({
    name: field(body['name']),
    address: field(body['address']),
    mapsUrl: field(body['mapsUrl']).trim(),
    notes: field(body['notes']).trim(),
  });
  return c.redirect('/venues', 303);
});
