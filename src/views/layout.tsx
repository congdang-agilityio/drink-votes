import type { Child } from 'hono/jsx';

const PRODUCT_NAME = 'Drink Votes';

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
header.site-header .brand { margin: 0; font-size: 1.25rem; font-weight: 700; }
main { width: 100%; max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1, h2 { line-height: 1.25; }
`;

export function Layout({ title, children }: { title?: string; children?: Child }) {
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
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
