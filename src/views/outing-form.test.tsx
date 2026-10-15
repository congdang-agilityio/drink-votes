import { describe, expect, it } from 'vitest';
import type { Venue } from '../db/venues.js';
import { OutingForm } from './outing-form.js';

const values = { date: '2030-01-02', sitTime: '19:00', closeTime: '17:00', venueIds: ['v1'] };
const venues: Venue[] = [
  { id: 'v1', name: 'Quán A', address: '1 A', mapsUrl: null, notes: null },
  { id: 'v2', name: 'Quán B', address: '2 B', mapsUrl: null, notes: null },
];

describe('OutingForm', () => {
  it('shows no alert without errors and keeps the entered values', async () => {
    const html = String(await (<OutingForm venues={venues} values={values} />));
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('value="2030-01-02"');
    expect(html).toContain('value="19:00"');
    expect(html).toContain('value="17:00"');
    expect((html.match(/checked/g) ?? []).length).toBe(1);
  });

  it('shows the form message and each field message', async () => {
    const html = String(
      await (
        <OutingForm
          venues={venues}
          values={values}
          errors={{ form: 'Lỗi chung', date: 'Lỗi ngày', closeTime: 'Lỗi giờ chốt', venues: 'Lỗi quán' }}
        />
      ),
    );
    for (const message of ['Lỗi chung', 'Lỗi ngày', 'Lỗi giờ chốt', 'Lỗi quán']) {
      expect(html).toContain(`<p role="alert">${message}</p>`);
    }
  });
});
