import fs from 'fs';
import path from 'path';

const htmlDir = process.env.PROTOTYPE_HTML_DIR || 'C:/Users/Lenovo/Desktop/原型HTML';

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
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return t.replace(/\s+$/gm, '').trim();
}

function filterNoiseLines(text) {
  const lines = text.split('\n');
  const out = [];
  for (let line of lines) {
    const s = line.trim();
    if (!s) {
      out.push('');
      continue;
    }
    if (/^\d{1,3}$/.test(s)) continue;
    if (/^\d{1,3}\/\d{1,3}$/.test(s)) continue;
    if (/^累计用时[:：]/.test(s)) continue;
    if (/^￥[\d.]+$/.test(s)) continue;
    if (s === '元素名称' || s === '元素类型') continue;
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractNotes(html) {
  const parts = [];
  const re = /<div id="(u\d+)_text"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index;
    const ctx = html.slice(Math.max(0, start - 900), start);
    if (!/ax_default sticky|ax_default marker/.test(ctx)) continue;
    let inner = stripInner(m[2]);
    inner = filterNoiseLines(inner);
    if (inner) parts.push(inner);
  }

  const sep = '\n\n———\n\n';
  const merged = parts.join(sep);
  const chunks = merged.split(/\n\n———\n\n/).map((c) => c.trim()).filter(Boolean);
  const seen = new Set();
  const uniq = [];
  for (const c of chunks) {
    if (seen.has(c)) continue;
    seen.add(c);
    uniq.push(c);
  }
  return uniq.join(sep);
}

const skip = new Set(['index.html', 'start.html', 'start_c_1.html', 'start_with_pages.html']);
const files = fs.readdirSync(htmlDir).filter((f) => f.endsWith('.html') && !skip.has(f));

const emptyMsg =
  '（本页 Axure 导出中未检测到便签 sticky / 标注 marker 内的文字说明；若为纯界面稿或仅含组件结构，请以截图与需求文档为准。）';

const result = {};
for (const f of files.sort()) {
  const full = path.join(htmlDir, f);
  const html = fs.readFileSync(full, 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const key = path.basename(f, '.html');
  let notes = extractNotes(html);
  if (!notes) notes = emptyMsg;
  result[key] = { file: f, title, notes };
}

fs.writeFileSync('d:/Cursor/testProject/_prototype_notes.json', JSON.stringify(result, null, 2), 'utf8');
console.log('pages', Object.keys(result).length);
