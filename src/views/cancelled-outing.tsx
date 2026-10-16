import type { Outing } from '../db/outings.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';

export type CancelledOutingView = Pick<Outing, 'id' | 'date' | 'sitTime' | 'closeTime'>;

/** Cancelled outing: label and final headcount only. It has no forms, so nothing can change it. */
export function CancelledOutingPage({
  outing,
  goingCount,
}: {
  outing: CancelledOutingView;
  goingCount: number;
}) {
  return (
    <Layout title="Kèo nhậu">
      <h1>Kèo nhậu</h1>
      <p class="cancelled-label">
        <strong>Đã huỷ: không đủ quân</strong>
      </p>
      <dl>
        <dt>Ngày</dt>
        <dd>{formatDate(outing.date)}</dd>
        <dt>Giờ ngồi</dt>
        <dd>{formatTime(outing.sitTime)}</dd>
        <dt>Giờ chốt</dt>
        <dd>{formatTime(outing.closeTime)}</dd>
      </dl>
      <p class="headcount">{`Số người đi: ${goingCount}`}</p>
    </Layout>
  );
}
