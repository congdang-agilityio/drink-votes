import type { Venue } from '../db/venues.js';
import { Layout } from './layout.js';

export interface OutingFormValues {
  date: string;
  sitTime: string;
  closeTime: string;
  venueIds: string[];
}

/** Messages to show: `form` for the whole form, the others next to their field. */
export interface OutingFormErrors {
  form?: string;
  date?: string;
  closeTime?: string;
  venues?: string;
}

const css = `
.outing-form label { display: block; font-weight: 600; margin-top: 0.75rem; }
.outing-form input[type="date"], .outing-form input[type="time"] { width: 100%; padding: 0.5rem; }
.outing-form fieldset { margin-top: 1rem; border: 1px solid #d9e2ec; border-radius: 0.5rem; }
.outing-form fieldset label { font-weight: 400; margin-top: 0.25rem; }
.outing-form button { margin-top: 1rem; padding: 0.5rem 1rem; }
`;

/** Form to create an outing; `values` and `errors` let a failed post re-render it. */
export function OutingForm({
  venues,
  values,
  errors = {},
}: {
  venues: Venue[];
  values: OutingFormValues;
  errors?: OutingFormErrors;
}) {
  return (
    <Layout title="Tạo kèo">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h1>Tạo kèo</h1>
      {errors.form ? <p role="alert">{errors.form}</p> : null}
      <form class="outing-form" method="post" action="/outings">
        <label for="outing-date">Ngày</label>
        <input id="outing-date" type="date" name="date" value={values.date} required />
        {errors.date ? <p role="alert">{errors.date}</p> : null}
        <label for="outing-sit">Giờ ngồi</label>
        <input id="outing-sit" type="time" name="sitTime" value={values.sitTime} required />
        <label for="outing-close">Giờ chốt</label>
        <input id="outing-close" type="time" name="closeTime" value={values.closeTime} required />
        {errors.closeTime ? <p role="alert">{errors.closeTime}</p> : null}
        <fieldset>
          <legend>Quán</legend>
          {errors.venues ? <p role="alert">{errors.venues}</p> : null}
          {venues.length === 0 ? <p>Chưa có quán nào.</p> : null}
          {venues.map((venue) => (
            <label>
              <input
                type="checkbox"
                name="venueIds"
                value={venue.id}
                checked={values.venueIds.includes(venue.id)}
              />{' '}
              {venue.name}
            </label>
          ))}
        </fieldset>
        <button type="submit">Tạo kèo</button>
      </form>
    </Layout>
  );
}
