import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { filterPages } from './axhub-v331-filter.mjs';

const PROTOTYPES = [
  { key: 'portal', base: 'https://axhub.im/ax9/4e2302828a9e4bc3' },
  { key: 'mobile', base: 'https://axhub.im/ax9/9e650a6a1999b4ab' },
  { key: 'tutor', base: 'https://axhub.im/ax9/ba31241cbdc4883d' },
  { key: 'pay', base: 'https://axhub.im/ax9/88b0f37e38b75a4a' },
];

const listDir = process.env.SCOPE_LIST_DIR || 'd:/Cursor/testProject/output';
const outPath = process.env.SCOPE_NOTES_JSON || 'd:/Cursor/testProject/_prototype_notes_lingxiu_v331.json';
const v331Only = process.env.V331_ONLY !== '0';

function decodeEntities(s) {
  return s
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '\r')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function stripInner(html) {
  let t = html.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n');
  t = t.replace(/<\/li>/gi, '\n');
  t = t.replace(/<[^>]+>/g, '');
  t = decodeEntities(t);
  return t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractNotes(html) {
  const parts = [];
  const re = /<div id="(u\d+)_text"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index;
    const ctx = html.slice(Math.max(0, start - 900), start);
    if (!/ax_default sticky|ax_default marker/.test(ctx)) continue;
    const inner = stripInner(m[2]);
    if (inner) parts.push(inner);
  }
  const sep = '\n\n———\n\n';
  const seen = new Set();
  return parts
    .filter((c) => {
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    })
    .join(sep);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrl(res.headers.location).then(resolve, reject);
        }
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(d));
      })
      .on('error', reject);
  });
}

function shotKey(protoKey, pageName, id) {
  return `${protoKey}__${pageName}__${id}`;
}

const emptyMsg =
  '（本页 Axure 导出中未检测到便签 sticky / 标注 marker 内的文字说明；若为纯界面稿或仅含组件结构，请以截图与需求文档为准。）';

const result = {};
let total = 0;

for (const proto of PROTOTYPES) {
  let { pages } = JSON.parse(fs.readFileSync(path.join(listDir, `axhub-${proto.key}-pages.json`), 'utf8'));
  if (v331Only) pages = filterPages(pages);
  for (const p of pages) {
    total++;
    const key = shotKey(proto.key, p.pageName, p.id);
    const url = `${proto.base}/${encodeURI(p.url)}`;
    try {
      const html = await fetchUrl(url);
      const notes = extractNotes(html);
      result[key] = {
        notes: notes || emptyMsg,
        pageName: p.pageName,
        trail: p.trail,
        proto: proto.key,
        url: p.url,
      };
    } catch (e) {
      result[key] = { notes: `（抓取页面 HTML 失败：${e.message}）`, pageName: p.pageName, trail: p.trail, proto: proto.key };
    }
    if (total % 50 === 0) console.log('notes', total);
  }
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log('wrote', Object.keys(result).length, '->', outPath);
