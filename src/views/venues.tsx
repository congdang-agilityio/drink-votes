import type { VenueWithVisits } from '../db/venues.js';
import { VENUE_FIELD_MAX_LENGTH as MAX } from '../services/venue-rules.js';
import { Layout } from './layout.js';

/**
 * The Maps link is stored unchecked (#7 AC 4), so only http(s) URLs may become an href:
 * anything else (javascript:, data:, bare text) is shown as plain text.
 */
export const isWebLink = (value: string): boolean => /^https?:\/\//i.test(value);

const css = `
.venue-list { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.venue { background: #fff; border-radius: 1rem; box-shadow: 0 2px 8px rgba(122,59,30,.12); padding: 0.75rem 1rem; margin-bottom: 0.75rem; }
.venue h3 { margin: 0 0 0.25rem; font-size: 1.1rem; }
.venue p { margin: 0.25rem 0; }
.venue-form label { display: block; font-weight: 600; margin-top: 0.75rem; }
.venue-form input, .venue-form textarea { width: 100%; padding: 0.5rem; border: 1px solid #d9b99a; border-radius: 0.5rem; background: #fff; color: inherit; }
.venue-form button { margin-top: 1rem; min-height: 2.75rem; padding: 0.5rem 1rem; border: 0; border-radius: 1rem; background: #e8742a; color: #3b1f0e; cursor: pointer; }
.venue-form button:hover { background: #f0a030; }
`;

function MapsLink({ url }: { url: string }) {
  return (
    <p class="venue-maps">
      {isWebLink(url) ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ) : (
        url
      )}
    </p>
  );
}

function VenueItem({ venue }: { venue: VenueWithVisits }) {
  return (
    <li class="venue">
      <h3>{venue.name}</h3>
      <p class="venue-visits">Đã đi {venue.visitCount} lần</p>
      <p class="venue-address">{venue.address}</p>
      {venue.mapsUrl ? <MapsLink url={venue.mapsUrl} /> : null}
      {venue.notes ? <p class="venue-notes">{venue.notes}</p> : null}
    </li>
  );
}

export interface VenueFormValues {
  name: string;
  address: string;
  mapsUrl: string;
  notes: string;
}

export interface VenueFormErrors {
  name?: string;
  address?: string;
  general?: string;
}

export function VenuesPage({
  venues,
  values,
  errors = {},
}: {
  venues: VenueWithVisits[];
  values?: VenueFormValues;
  errors?: VenueFormErrors;
}) {
  return (
    <Layout title="Danh sách quán">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h1>Danh sách quán</h1>
      {venues.length === 0 ? (
        <p>Chưa có quán nào.</p>
      ) : (
        <ul class="venue-list">
          {venues.map((venue) => (
            <VenueItem venue={venue} />
          ))}
        </ul>
      )}
      <h2>Thêm quán</h2>
      {errors.general ? <p role="alert">{errors.general}</p> : null}
      <form class="venue-form" method="post" action="/venues" novalidate>
        <label for="venue-name">Tên quán</label>
        <input id="venue-name" type="text" name="name" maxlength={MAX.name} value={values?.name ?? ''} />
        {errors.name ? <p class="field-error" role="alert">{errors.name}</p> : null}
        <label for="venue-address">Địa chỉ</label>
        <input id="venue-address" type="text" name="address" maxlength={MAX.address} value={values?.address ?? ''} />
        {errors.address ? <p class="field-error" role="alert">{errors.address}</p> : null}
        <label for="venue-maps">Link Google Maps</label>
        <input id="venue-maps" type="text" name="mapsUrl" inputmode="url" maxlength={MAX.mapsUrl} value={values?.mapsUrl ?? ''} />
        <label for="venue-notes">Ghi chú</label>
        <textarea id="venue-notes" name="notes" rows={3} maxlength={MAX.notes}>{values?.notes ?? ''}</textarea>
        <button type="submit">Thêm quán</button>
      </form>
    </Layout>
  );
}
