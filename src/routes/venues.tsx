import { Hono } from 'hono';
import { createVenue, DuplicateVenueNameError, listVenuesWithVisits } from '../db/venues.js';
import type { IdentityEnv } from '../middleware/identity.js';
import {
  DUPLICATE_VENUE_NAME_MESSAGE,
  validateNewVenue,
  venueLengthError,
} from '../services/venue-rules.js';
import { type VenueFormErrors, type VenueFormValues, VenuesPage } from '../views/venues.js';

export const venues = new Hono<IdentityEnv>();

/** A form field as text: missing values and file uploads become an empty string. */
const field = (value: unknown): string => (typeof value === 'string' ? value : '');

const page = async (form: { values?: VenueFormValues; errors?: VenueFormErrors } = {}) =>
  `<!DOCTYPE html>${(<VenuesPage venues={await listVenuesWithVisits()} {...form} />)}`;

venues.get('/venues', async (c) => c.html(await page()));

venues.post('/venues', async (c) => {
  const body = await c.req.parseBody();
  const values = {
    name: field(body['name']).trim(),
    address: field(body['address']).trim(),
    mapsUrl: field(body['mapsUrl']).trim(),
    notes: field(body['notes']).trim(),
  };
  const checked = validateNewVenue(values);
  if (!checked.ok) return c.html(await page({ values, errors: checked.errors }), 400);
  const lengthError = venueLengthError(values);
  if (lengthError) return c.html(await page({ values, errors: { general: lengthError } }), 400);
  try {
    await createVenue(values);
  } catch (err) {
    if (err instanceof DuplicateVenueNameError) {
      return c.html(await page({ values, errors: { name: DUPLICATE_VENUE_NAME_MESSAGE } }), 409);
    }
    throw err;
  }
  return c.redirect('/venues', 303);
});
