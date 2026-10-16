import { getContext } from 'hono/context-storage';
import type { Child } from 'hono/jsx';
import type { IdentityEnv } from '../middleware/identity.js';

const PRODUCT_NAME = 'Drink Tonight';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap&subset=vietnamese';

const css = `
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; }
body {
  margin: 0;
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #3d2b22;
  background: #fbf3e6;
  overflow-wrap: anywhere;
}
img, input, select, textarea, button { max-width: 100%; font: inherit; }
header.site-header { background: #7a3b1e; color: #fff; padding: 0.75rem 1rem; box-shadow: 0 2px 8px rgba(122,59,30,.12); }
header.site-header a { color: inherit; text-decoration: none; }
header.site-header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.25rem 1rem; }
header.site-header .who { margin: 0; font-size: 0.9rem; }
header.site-header .who a { text-decoration: underline; margin-left: 0.5rem; }
header.site-header .brand { margin: 0; font-size: 1.25rem; font-weight: 800; font-family: "Nunito", system-ui, sans-serif; }
main { width: 100%; max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1, h2, h3 { color: #3b1f0e; }
h1, h2 { line-height: 1.25; font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 800; }
main a { color: #b4531a; }
button { font-weight: 700; }
`;

/** A POST-only URL has no page to return to: use the outing page, or the home page. */
function returnPath(method: string, url: URL): string {
  if (method === 'GET' || method === 'HEAD') return url.pathname + url.search;
  const outing = /^\/outings\/([^/]+)\/(?:close|choose|visit)\/?$/.exec(url.pathname);
  return outing ? `/outings/${outing[1]}` : '/';
}

/** The viewer of the current request, or null outside a request or before a name is set. */
function currentParticipant(): { name: string; path: string } | null {
  try {
    const c = getContext<IdentityEnv>();
    const participant = c.var.participant;
    if (!participant) return null;
    const url = new URL(c.req.url);
    return { name: participant.displayName, path: returnPath(c.req.method, url) };
  } catch {
    return null;
  }
}

export function Layout({ title, children }: { title?: string; children?: Child }) {
  const me = currentParticipant();
  const fullTitle = title ? `${title} · ${PRODUCT_NAME}` : PRODUCT_NAME;
  return (
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link rel="stylesheet" href={FONT_HREF} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <header class="site-header">
          <p class="brand">
            <a href="/">{PRODUCT_NAME}</a>
          </p>
          {me ? (
            <p class="who">
              <span>{me.name}</span>
              <a href={`/me/name?next=${encodeURIComponent(me.path)}`}>Đổi tên</a>
            </p>
          ) : null}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
