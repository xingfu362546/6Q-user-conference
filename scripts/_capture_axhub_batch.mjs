import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { filterPages } from './axhub-v331-filter.mjs';

const PROTOTYPES = [
  { key: 'portal', label: '磨课排课-门户', base: 'https://axhub.im/ax9/4e2302828a9e4bc3' },
  { key: 'mobile', label: '领袖营-移动端', base: 'https://axhub.im/ax9/9e650a6a1999b4ab' },
  { key: 'tutor', label: '宏象-导师模块', base: 'https://axhub.im/ax9/ba31241cbdc4883d' },
  { key: 'pay', label: '领袖营-薪酬后台', base: 'https://axhub.im/ax9/88b0f37e38b75a4a' },
];

const outDir = process.env.SCOPE_SHOT_DIR || 'd:/Cursor/testProject/output/lingxiu-v331-shots';
const listDir = process.env.SCOPE_LIST_DIR || 'd:/Cursor/testProject/output';
const onlyKey = process.env.ONLY_PROTO || '';
const resume = process.env.RESUME === '1';
const v331Only = process.env.V331_ONLY !== '0'; // 默认仅 v3.3.1

function safeName(protoKey, pageName, id) {
  const base = `${protoKey}__${pageName}`.replace(/[<>:"/\\|?*]/g, '_').slice(0, 180);
  return `${base}__${id}.png`;
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const proto of PROTOTYPES) {
  if (onlyKey && proto.key !== onlyKey) continue;
  const listPath = path.join(listDir, `axhub-${proto.key}-pages.json`);
  let { pages } = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  if (v331Only) {
    pages = filterPages(pages);
    console.log(`[${proto.key}] v3.3.1 pages: ${pages.length}`);
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(proto.base + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);
  const know = page.getByText('知道了');
  if (await know.count()) await know.first().click().catch(() => {});
  await page.waitForTimeout(1000);

  let done = 0;
  let skip = 0;
  for (const p of pages) {
    const file = safeName(proto.key, p.pageName, p.id);
    const shotPath = path.join(outDir, file);
    if (resume && fs.existsSync(shotPath) && fs.statSync(shotPath).size > 5000) {
      skip++;
      continue;
    }
    const pageUrl = `${proto.base}/${encodeURI(p.url)}`;
    try {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1200);
      const frame = page.frame({ name: 'mainFrame' }) || page.mainFrame();
      await frame.waitForLoadState('domcontentloaded').catch(() => {});
      await frame.waitForTimeout(800);
      await frame.locator('body').screenshot({ path: shotPath, type: 'png' });
      done++;
      if (done % 10 === 0) console.log(`[${proto.key}] captured ${done}, last ${p.pageName}`);
    } catch (e) {
      console.error(`[${proto.key}] FAIL ${p.pageName}:`, e.message);
    }
  }
  console.log(`[${proto.key}] done=${done} skip=${skip} total=${pages.length}`);
  await page.close();
}

await browser.close();
console.log('shots in', outDir);
