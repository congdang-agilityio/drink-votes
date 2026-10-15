import { describe, expect, it } from 'vitest';
import { safeNext } from './identity.js';

describe('safeNext', () => {
  it('accepts same-site paths', () => {
    expect(safeNext('/outings/abc')).toBe('/outings/abc');
    expect(safeNext('/')).toBe('/');
    expect(safeNext('/a?b=1#c')).toBe('/a?b=1#c');
  });

  it.each(['//evil.com', 'https://evil.com', 'http://x', '\\evil.com', '/\\evil.com', '/a\\b', 'outings', '', '/\nx'])(
    'falls back to / for %j',
    (value) => {
      expect(safeNext(value)).toBe('/');
    },
  );

  it('falls back to / when missing or not a string', () => {
    expect(safeNext(undefined)).toBe('/');
    expect(safeNext(null)).toBe('/');
    expect(safeNext(['/a'])).toBe('/');
  });
});
