import type { Attendance } from '../db/attendance.js';
import type { VenueCount } from '../db/votes.js';
import type { Outing } from '../db/outings.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';
import { VisitQuestion } from './visit-question.js';

export type ClosedOutingView = Pick<
  Outing,
  'id' | 'date' | 'sitTime' | 'closeTime' | 'venues' | 'winnerVenueId'
>;

const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url);

/** Closed outing: label, winner, final headcount and vote counts. No forms, so nothing can change or reopen it. */
export function ClosedOutingPage({
  outing,
  attendance,
  counts,
  askVisit = false,
}: {
  outing: ClosedOutingView;
  attendance: Attendance;
  counts: VenueCount[];
  /** Show the organizer's visit question (decided by the route). */
  askVisit?: boolean;
}) {
  const countOf = (venueId: string): number =>
    counts.find((c) => c.venueId === venueId)?.count ?? 0;
  const winner = outing.winnerVenueId
    ? outing.venues.find((v) => v.id === outing.winnerVenueId)
    : undefined;
  return (
    <Layout title="Kèo nhậu">
      <h1>Kèo nhậu</h1>
      <p class="closed-label">
        <strong>Đã chốt</strong>
      </p>
      <dl>
        <dt>Ngày</dt>
        <dd>{formatDate(outing.date)}</dd>
        <dt>Giờ ngồi</dt>
        <dd>{formatTime(outing.sitTime)}</dd>
        <dt>Giờ chốt</dt>
        <dd>{formatTime(outing.closeTime)}</dd>
      </dl>
      {winner ? (
        <div class="winner">
          <p>{`Quán: ${winner.name}`}</p>
          <p>{winner.address}</p>
          {winner.mapsUrl && isHttpUrl(winner.mapsUrl) ? (
            <p>
              <a href={winner.mapsUrl} rel="noopener noreferrer">
                Xem bản đồ
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {askVisit && winner ? <VisitQuestion outingId={outing.id} venueName={winner.name} /> : null}
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
