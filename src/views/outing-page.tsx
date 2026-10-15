import type { Outing } from '../db/outings.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';

export type OutingView = Pick<Outing, 'date' | 'sitTime' | 'closeTime' | 'venues'>;

const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url);

export function OutingPage({ outing }: { outing: OutingView }) {
  return (
    <Layout title="Kèo nhậu">
      <h1>Kèo nhậu</h1>
      <dl>
        <dt>Ngày</dt>
        <dd>{formatDate(outing.date)}</dd>
        <dt>Giờ ngồi</dt>
        <dd>{formatTime(outing.sitTime)}</dd>
        <dt>Giờ chốt</dt>
        <dd>{formatTime(outing.closeTime)}</dd>
      </dl>
      <h2>Quán</h2>
      <ul>
        {outing.venues.map((v) => (
          <li>
            <strong>{v.name}</strong>
            <br />
            {v.address}
            {v.mapsUrl && isHttpUrl(v.mapsUrl) ? (
              <>
                <br />
                <a href={v.mapsUrl} rel="noopener noreferrer">
                  Xem bản đồ
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export function OutingNotFound() {
  return (
    <Layout title="Không tìm thấy kèo">
      <h1>Không tìm thấy kèo</h1>
      <p>Không tìm thấy kèo này.</p>
      <p>
        <a href="/">Về trang chủ</a>
      </p>
    </Layout>
  );
}
