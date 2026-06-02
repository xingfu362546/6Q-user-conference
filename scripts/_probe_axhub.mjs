import { chromium } from 'playwright';

const url = process.argv[2] || 'https://axhub.im/ax9/4e2302828a9e4bc3/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(5000);

const info = await page.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')].map((f) => ({
    src: f.src?.slice(0, 200),
    id: f.id,
    name: f.name,
  }));
  const links = [...document.querySelectorAll('a,[data-label]')].slice(0, 30).map((el) => ({
    tag: el.tagName,
    text: (el.textContent || '').trim().slice(0, 80),
    href: el.getAttribute?.('href'),
    className: el.className?.toString?.().slice(0, 80),
  }));
  return {
    title: document.title,
    url: location.href,
    iframes,
    bodyText: document.body?.innerText?.slice(0, 500),
    linkCount: document.querySelectorAll('a').length,
  };
});

console.log(JSON.stringify(info, null, 2));

// try click 知道了 if present
const btn = page.getByText('知道了', { exact: false });
if (await btn.count()) {
  await btn.first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

const frames = page.frames();
console.log('frames', frames.length, frames.map((f) => f.url().slice(0, 120)));

for (const fr of frames) {
  if (!fr.url() || fr.url() === 'about:blank') continue;
  try {
    const t = await fr.evaluate(() => ({
      url: location.href,
      hasSitemap: !!document.querySelector('#sitemapTree, .sitemapTree, [class*="sitemap"]'),
      scripts: [...document.scripts].map((s) => s.src).filter(Boolean).slice(0, 5),
      text: document.body?.innerText?.slice(0, 300),
    }));
    console.log('frame eval', JSON.stringify(t));
  } catch (e) {
    console.log('frame err', fr.url().slice(0, 80), e.message);
  }
}

await browser.close();
