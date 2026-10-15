import { describe, expect, it } from 'vitest';
import { isHttpsRequest, safeNext } from './identity.js';

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

describe('isHttpsRequest', () => {
  it('is true for an https URL', () => {
    expect(isHttpsRequest('https://example.com/name', undefined)).toBe(true);
  });

  it.each(['https', 'HTTPS', ' https ', 'https,http'])(
    'is true for http URL with x-forwarded-proto %j',
    (proto) => {
      expect(isHttpsRequest('http://localhost/name', proto)).toBe(true);
    },
  );

  it.each([undefined, '', 'http', 'http,https'])(
    'is false for http URL with x-forwarded-proto %j',
    (proto) => {
      expect(isHttpsRequest('http://localhost/name', proto)).toBe(false);
    },
  );
});
