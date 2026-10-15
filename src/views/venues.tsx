import type { Venue } from '../db/venues.js';
import { Layout } from './layout.js';

/**
 * The Maps link is stored unchecked (#7 AC 4), so only http(s) URLs may become an href:
 * anything else (javascript:, data:, bare text) is shown as plain text.
 */
export const isWebLink = (value: string): boolean => /^https?:\/\//i.test(value);

const css = `
.venue-list { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.venue { background: #fff; border: 1px solid #d9e2ec; border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.75rem; }
.venue h3 { margin: 0 0 0.25rem; font-size: 1.1rem; }
.venue p { margin: 0.25rem 0; }
.venue-form label { display: block; font-weight: 600; margin-top: 0.75rem; }
.venue-form input, .venue-form textarea { width: 100%; padding: 0.5rem; }
.venue-form button { margin-top: 1rem; padding: 0.5rem 1rem; }
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

function VenueItem({ venue }: { venue: Venue }) {
  return (
    <li class="venue">
      <h3>{venue.name}</h3>
      <p class="venue-address">{venue.address}</p>
      {venue.mapsUrl ? <MapsLink url={venue.mapsUrl} /> : null}
      {venue.notes ? <p class="venue-notes">{venue.notes}</p> : null}
    </li>
  );
}

export function VenuesPage({ venues }: { venues: Venue[] }) {
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
      <form class="venue-form" method="post" action="/venues">
        <label for="venue-name">Tên quán</label>
        <input id="venue-name" type="text" name="name" required />
        <label for="venue-address">Địa chỉ</label>
        <input id="venue-address" type="text" name="address" required />
        <label for="venue-maps">Link Google Maps</label>
        <input id="venue-maps" type="text" name="mapsUrl" inputmode="url" />
        <label for="venue-notes">Ghi chú</label>
        <textarea id="venue-notes" name="notes" rows={3}></textarea>
        <button type="submit">Thêm quán</button>
      </form>
    </Layout>
  );
}
