import { describe, expect, it } from 'vitest';
import { outingUrl } from './outing-url.js';

describe('outingUrl', () => {
  it.each(['web-staging-9a85.up.railway.app', 'web-production-9c023.up.railway.app'])(
    'uses https behind the proxy for %s',
    (host) => {
      expect(outingUrl(`http://${host}/outings/x`, 'https', 'abc')).toBe(`https://${host}/outings/abc`);
    },
  );

  it('keeps http and the port locally', () => {
    expect(outingUrl('http://localhost:4301/', undefined, 'abc')).toBe('http://localhost:4301/outings/abc');
  });

  it('keeps an https request URL', () => {
    expect(outingUrl('https://example.com/', undefined, 'abc')).toBe('https://example.com/outings/abc');
  });

  it('drops the query string and fragment', () => {
    expect(outingUrl('http://localhost:4301/o?a=1#frag', undefined, 'abc')).toBe('http://localhost:4301/outings/abc');
  });
});
