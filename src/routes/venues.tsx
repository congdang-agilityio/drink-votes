import { Hono } from 'hono';
import { createVenue, listVenues } from '../db/venues.js';
import type { IdentityEnv } from '../middleware/identity.js';
import { venueLengthError } from '../services/venue-rules.js';
import { VenuesPage } from '../views/venues.js';

export const venues = new Hono<IdentityEnv>();

/** A form field as text: missing values and file uploads become an empty string. */
const field = (value: unknown): string => (typeof value === 'string' ? value : '');

const page = async (error?: string) =>
  `<!DOCTYPE html>${(<VenuesPage venues={await listVenues()} error={error} />)}`;

venues.get('/venues', async (c) => c.html(await page()));

// Required-field and duplicate-name checks with their messages come with #7.
venues.post('/venues', async (c) => {
  const body = await c.req.parseBody();
  const input = {
    name: field(body['name']).trim(),
    address: field(body['address']).trim(),
    mapsUrl: field(body['mapsUrl']).trim(),
    notes: field(body['notes']).trim(),
  };
  const error = venueLengthError(input);
  if (error) return c.html(await page(error), 400);
  await createVenue(input);
  return c.redirect('/venues', 303);
});
