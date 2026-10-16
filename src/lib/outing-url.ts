import { isHttpsRequest } from './identity.js';

/**
 * The absolute link of an outing in the environment that served the request:
 * `<scheme>://<host>/outings/<id>`, with no query string or fragment.
 * The scheme is `https` behind a TLS-terminating proxy (X-Forwarded-Proto).
 */
export function outingUrl(requestUrl: string, forwardedProto: string | undefined, outingId: string): string {
  const { protocol, host } = new URL(requestUrl);
  const scheme = isHttpsRequest(requestUrl, forwardedProto) ? 'https:' : protocol;
  return `${scheme}//${host}/outings/${encodeURIComponent(outingId)}`;
}
