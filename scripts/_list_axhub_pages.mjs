import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2]?.replace(/\/$/, '') || 'https://axhub.im/ax9/4e2302828a9e4bc3';
const out = process.argv[3] || 'd:/Cursor/testProject/output/axhub-pages-list.json';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(4000);
const know = page.getByText('知道了');
if (await know.count()) await know.first().click().catch(() => {});
await page.waitForTimeout(2000);

const pages = await page.evaluate(async () => {
  function waitDoc(ms = 15000) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        if (window.$axure?.document?.sitemap?.rootNodes) return resolve(window.$axure.document.sitemap);
        if (Date.now() - t0 > ms) return resolve(null);
        setTimeout(tick, 200);
      };
      tick();
    });
  }
  const sm = await waitDoc();
  if (!sm) return { error: 'no sitemap' };
  const out = [];
  function walk(nodes, trail = []) {
    for (const n of nodes || []) {
      const label = (n.pageName || n.label || '').trim();
      const trail2 = label ? [...trail, label] : trail;
      if (n.url) {
        out.push({
          pageName: n.pageName,
          url: n.url,
          id: n.id,
          type: n.type,
          trail: trail2.join(' / '),
        });
      }
      if (n.children?.length) walk(n.children, trail2);
    }
  }
  walk(sm.rootNodes);
  return { title: document.title, count: out.length, pages: out };
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ base, ...pages }, null, 2), 'utf8');
console.log('count', pages.count ?? 0, '->', out);
if (pages.pages?.length) {
  console.log('sample', pages.pages.slice(0, 5));
}
await browser.close();
