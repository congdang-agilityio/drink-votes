/** Cookie holding the participant id of this browser (BR-09). */
export const PARTICIPANT_COOKIE = 'dv_pid';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Options for the identity cookie; `Secure` only when the request is HTTPS. */
export function identityCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    secure,
  };
}

/**
 * Whether the user's request is HTTPS: the URL scheme, or the first `X-Forwarded-Proto`
 * value set by a TLS-terminating proxy (Railway forwards plain HTTP to the app).
 */
export function isHttpsRequest(url: string, forwardedProto: string | undefined): boolean {
  if (new URL(url).protocol === 'https:') return true;
  const first = forwardedProto?.split(',')[0]?.trim().toLowerCase();
  return first === 'https';
}

/** A same-site path to redirect to: starts with a single `/`; anything else becomes `/`. */
export function safeNext(next: unknown): string {
  if (typeof next !== 'string') return '/';
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  // Backslashes and control characters are read as `/` or stripped by some browsers.
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return '/';
  return next;
}
