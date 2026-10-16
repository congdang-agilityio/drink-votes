import type { Outing } from '../db/outings.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';

export type ClosedOutingView = Pick<
  Outing,
  'id' | 'date' | 'sitTime' | 'closeTime' | 'venues' | 'winnerVenueId'
>;

/** Closed outing: label and winner only. It has no forms, so nothing can change or reopen it. */
export function ClosedOutingPage({ outing }: { outing: ClosedOutingView }) {
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
      {winner ? <p class="winner">{`Quán: ${winner.name}`}</p> : null}
    </Layout>
  );
}
