import { describe, expect, it } from 'vitest';
import { qrSvg } from './qr.js';

const URL1 = 'https://web-production-9c023.up.railway.app/outings/0b8f6c1e-5d2a-4c3b-9a7e-1f2d3c4b5a69';
const URL2 = 'https://web-production-9c023.up.railway.app/outings/7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';

describe('qrSvg', () => {
  it('returns a self-contained svg with viewBox and no pixel size', () => {
    const svg = qrSvg(URL1);
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toMatch(/viewBox="0 0 (\d+) \1"/);
    expect(svg).not.toMatch(/<svg[^>]*\s(width|height)=/);
  });

  it('draws a white background and black modules with a 4-module quiet zone', () => {
    const svg = qrSvg(URL1);
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain('fill="#000"');
    const size = Number(/viewBox="0 0 (\d+)/.exec(svg)![1]);
    const first = /M(\d+) (\d+)/.exec(svg)!;
    expect(Number(first[1])).toBeGreaterThanOrEqual(4);
    expect(Number(first[2])).toBeGreaterThanOrEqual(4);
    expect(size).toBeGreaterThan(8);
  });

  it('uses error correction level M (88-byte URL needs version 6, 41 modules)', () => {
    expect(new TextEncoder().encode(URL1).length).toBe(88);
    // Level M: version 6 (41 modules) + 2 * 4 quiet zone = 49. Level L would fit version 5 (45).
    expect(qrSvg(URL1)).toContain('viewBox="0 0 49 49"');
  });

  it('keeps a 4-module quiet zone on every side', () => {
    const svg = qrSvg(URL1);
    const size = Number(/viewBox="0 0 (\d+)/.exec(svg)![1]);
    const coords = [...svg.matchAll(/M(\d+) (\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(coords.length).toBeGreaterThan(0);
    const xs = coords.map(([x]) => x);
    const ys = coords.map(([, y]) => y);
    // Finder patterns touch the top, left, right and bottom edges of the symbol,
    // so the dark modules span exactly [4, size - 5] on both axes.
    expect(Math.min(...xs)).toBe(4);
    expect(Math.min(...ys)).toBe(4);
    expect(Math.max(...xs)).toBe(size - 5);
    expect(Math.max(...ys)).toBe(size - 5);
  });

  it('is deterministic and differs per input', () => {
    expect(qrSvg(URL1)).toBe(qrSvg(URL1));
    expect(qrSvg(URL1)).not.toBe(qrSvg(URL2));
  });
});
