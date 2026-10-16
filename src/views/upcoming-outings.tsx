import { formatDate, formatTime } from '../lib/time.js';

export interface UpcomingOutingView {
  id: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm` */
  sitTime: string;
  goingCount: number;
}

const css = `
.upcoming { list-style: none; margin: 0 0 1rem; padding: 0; }
.upcoming li { margin-bottom: 0.5rem; }
.upcoming a { display: block; min-height: 2.75rem; padding: 0.75rem 1rem; border: 2px solid #7b341e; border-radius: 0.5rem; text-decoration: none; }
`;

export function UpcomingOutings({ outings }: { outings: UpcomingOutingView[] }) {
  return (
    <section>
      <h2>Kèo sắp tới</h2>
      {outings.length === 0 ? (
        <p>Chưa có kèo nào sắp tới.</p>
      ) : (
        <>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <ul class="upcoming">
            {outings.map((o) => (
              <li>
                <a href={`/outings/${o.id}`}>
                  {formatDate(o.date)} · {formatTime(o.sitTime)} · {o.goingCount} người đi
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
