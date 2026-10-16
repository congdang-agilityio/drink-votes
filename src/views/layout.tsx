import { getContext } from 'hono/context-storage';
import type { Child } from 'hono/jsx';
import type { IdentityEnv } from '../middleware/identity.js';

const PRODUCT_NAME = 'Drink Tonight';

const css = `
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2933;
  background: #f5f7fa;
  overflow-wrap: anywhere;
}
img, input, select, textarea, button { max-width: 100%; font: inherit; }
header.site-header { background: #7b341e; color: #fff; padding: 0.75rem 1rem; }
header.site-header a { color: inherit; text-decoration: none; }
header.site-header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.25rem 1rem; }
header.site-header .who { margin: 0; font-size: 0.9rem; }
header.site-header .who a { text-decoration: underline; margin-left: 0.5rem; }
header.site-header .brand { margin: 0; font-size: 1.25rem; font-weight: 700; }
main { width: 100%; max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1, h2 { line-height: 1.25; }
`;

/** The viewer of the current request, or null outside a request or before a name is set. */
function currentParticipant(): { name: string; path: string } | null {
  try {
    const c = getContext<IdentityEnv>();
    const participant = c.var.participant;
    if (!participant) return null;
    const url = new URL(c.req.url);
    return { name: participant.displayName, path: url.pathname + url.search };
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
