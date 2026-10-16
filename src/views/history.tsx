import { formatDate } from '../lib/time.js';
import type { HistoryEntry } from '../db/history.js';

const css = `
.history { list-style: none; margin: 0 0 1rem; padding: 0; }
.history li { margin-bottom: 0.5rem; }
.history a { display: block; min-height: 2.75rem; padding: 0.75rem 1rem; border: 2px solid #7b341e; border-radius: 0.5rem; text-decoration: none; }
`;

function lineText(e: HistoryEntry): string {
  const date = formatDate(e.date);
  if (e.outcome === 'cancelled') return `${date} · Đã huỷ (không đủ quân) · ${e.goingCount} người`;
  if (e.outcome === 'waiting') return `${date} · chưa chọn quán · ${e.goingCount} người · Chưa xác nhận`;
  const mark = e.visited === true ? 'Đã đi' : e.visited === false ? 'Không đi' : 'Chưa xác nhận';
  return `${date} · ${e.winnerName} · ${e.goingCount} người · ${mark}`;
}

export function History({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section>
      <h1>Lịch sử</h1>
      {entries.length === 0 ? (
        <p>Chưa có kèo nào trong lịch sử.</p>
      ) : (
        <>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <ul class="history">
            {entries.map((e) => (
              <li>
                <a href={`/outings/${e.id}`}>{lineText(e)}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
