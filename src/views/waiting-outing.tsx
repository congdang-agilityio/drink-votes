import type { Attendance } from '../db/attendance.js';
import type { Outing } from '../db/outings.js';
import type { VenueCount } from '../db/votes.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';

export type WaitingOutingView = Pick<
  Outing,
  'id' | 'date' | 'sitTime' | 'closeTime' | 'venues'
>;

/** Closed outing still tied: lists the tied venues; only the organizer gets choose forms. */
export function WaitingOutingPage({
  outing,
  attendance,
  counts,
  tiedVenueIds,
  isOrganizer,
}: {
  outing: WaitingOutingView;
  attendance: Attendance;
  counts: VenueCount[];
  tiedVenueIds: string[];
  isOrganizer: boolean;
}) {
  const countOf = (venueId: string): number =>
    counts.find((c) => c.venueId === venueId)?.count ?? 0;
  const tied = outing.venues.filter((v) => tiedVenueIds.includes(v.id));
  return (
    <Layout title="Kèo nhậu">
      <h1>Kèo nhậu</h1>
      <p class="closed-label">
        <strong>Đã chốt – chờ chủ kèo chọn quán</strong>
      </p>
      <dl>
        <dt>Ngày</dt>
        <dd>{formatDate(outing.date)}</dd>
        <dt>Giờ ngồi</dt>
        <dd>{formatTime(outing.sitTime)}</dd>
        <dt>Giờ chốt</dt>
        <dd>{formatTime(outing.closeTime)}</dd>
      </dl>
      <h2>Các quán đang hòa phiếu</h2>
      <ul class="venue-list">
        {tied.map((v) => (
          <li>
            <strong>{v.name}</strong> <span class="vote-count">{countOf(v.id)} phiếu</span>
            {isOrganizer ? (
              <form class="vote-form" method="post" action={`/outings/${outing.id}/choose`}>
                <input type="hidden" name="venueId" value={v.id} />
                <button type="submit">Chọn quán này</button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      <h2>Số phiếu</h2>
      <ul class="venue-list">
        {outing.venues.map((v) => (
          <li>
            <strong>{v.name}</strong> <span class="vote-count">{countOf(v.id)} phiếu</span>
          </li>
        ))}
      </ul>
      <h2>Số người đi: {attendance.goingCount}</h2>
      <ul class="going-list">
        {attendance.goingNames.map((name) => (
          <li>{name}</li>
        ))}
      </ul>
    </Layout>
  );
}
