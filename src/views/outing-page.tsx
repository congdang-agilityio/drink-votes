import type { Attendance } from '../db/attendance.js';
import type { VenueCount } from '../db/votes.js';
import type { Outing } from '../db/outings.js';
import { formatDate, formatTime } from '../lib/time.js';
import { Layout } from './layout.js';

export type OutingView = Pick<Outing, 'id' | 'date' | 'sitTime' | 'closeTime' | 'venues'>;

const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url);

const answerCss = `
.answer-form { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.answer-form button { flex: 1 1 8rem; min-height: 2.75rem; padding: 0.5rem 1rem; border: 2px solid #7b341e; border-radius: 0.5rem; background: #fff; color: #7b341e; cursor: pointer; }
.answer-form button[aria-pressed="true"] { background: #7b341e; color: #fff; font-weight: 700; }
`;

const voteCss = `
.vote-count { display: block; font-weight: 700; }
.vote-form button { min-height: 2.75rem; padding: 0.5rem 1rem; border: 2px solid #7b341e; border-radius: 0.5rem; background: #fff; color: #7b341e; cursor: pointer; }
.venue-list li { margin-bottom: 0.75rem; }
`;

const myAnswerText = (a: boolean | null): string =>
  a === null ? 'Bạn chưa trả lời' : a ? 'Bạn: Đi' : 'Bạn: Không đi';

export function OutingPage({
  outing,
  attendance,
  myAnswer,
  counts,
  leaders,
  myVote,
}: {
  outing: OutingView;
  attendance: Attendance;
  myAnswer: boolean | null;
  counts: VenueCount[];
  leaders: string[];
  myVote: string | null;
}) {
  const countOf = (venueId: string): number =>
    counts.find((c) => c.venueId === venueId)?.count ?? 0;
  const leaderNames = outing.venues.filter((v) => leaders.includes(v.id)).map((v) => v.name);
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
      <p class="leading">
        {leaderNames.length > 0 ? `Đang dẫn đầu: ${leaderNames.join(', ')}` : 'Chưa có phiếu'}
      </p>
      <style dangerouslySetInnerHTML={{ __html: voteCss }} />
      <ul class="venue-list">
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
            <span class="vote-count">{countOf(v.id)} phiếu</span>
            {myAnswer === true ? (
              myVote === v.id ? (
                <strong>Bạn đã chọn</strong>
              ) : (
                <form class="vote-form" method="post" action={`/outings/${outing.id}/vote`}>
                  <input type="hidden" name="venueId" value={v.id} />
                  <button type="submit">Chọn quán này</button>
                </form>
              )
            ) : null}
          </li>
        ))}
      </ul>
      {myAnswer === true ? null : <p>Chọn Đi để bình chọn.</p>}
      <h2>Bạn có đi không?</h2>
      <style dangerouslySetInnerHTML={{ __html: answerCss }} />
      <p>{myAnswerText(myAnswer)}</p>
      <form class="answer-form" method="post" action={`/outings/${outing.id}/answer`}>
        <button type="submit" name="going" value="yes" aria-pressed={myAnswer === true ? 'true' : 'false'}>
          Đi
        </button>
        <button type="submit" name="going" value="no" aria-pressed={myAnswer === false ? 'true' : 'false'}>
          Không đi
        </button>
      </form>
      <h2>Số người đi: {attendance.goingCount}</h2>
      <ul class="going-list">
        {attendance.goingNames.map((name) => (
          <li>{name}</li>
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
