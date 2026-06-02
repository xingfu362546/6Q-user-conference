import fs from 'fs';

const sst = fs.readFileSync('d:/Cursor/testProject/_fl_unzip/xl/sharedStrings.xml', 'utf8');
const strings = [];
const siRe = /<si>([\s\S]*?)<\/si>/g;
let m;
function decodeEntities(s) {
  return s
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '\r')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
while ((m = siRe.exec(sst))) {
  const inner = m[1];
  const parts = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeEntities(x[1]));
  strings.push(parts.join(''));
}

function colOf(ref) {
  return ref.match(/^([A-Z]+)/)[1];
}

function parseCells(rowInner) {
  const cells = {};
  const re = /<c r="([A-Z]+)(\d+)"([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g;
  let cm;
  while ((cm = re.exec(rowInner))) {
    const col = cm[1];
    const attrs = cm[3];
    const isString = attrs.includes('t="s"');
    if (cm[4] === '/>') {
      cells[col] = '';
      continue;
    }
    const body = cm[5] ?? '';
    const vm = body.match(/<v>([^<]*)<\/v>/);
    if (!vm) {
      cells[col] = '';
      continue;
    }
    const v = vm[1];
    cells[col] = isString ? strings[parseInt(v, 10)] ?? '' : v;
  }
  return cells;
}

const sheet = fs.readFileSync('d:/Cursor/testProject/_fl_unzip/xl/worksheets/sheet1.xml', 'utf8');
const rows = [];
const rowRe = /<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
while ((m = rowRe.exec(sheet))) {
  const r = parseInt(m[1], 10);
  if (r < 3 || r > 21) continue;
  rows.push({ r, cells: parseCells(m[2]) });
}

let lastB = '';
let lastC = '';
const out = rows.map(({ r, cells }) => {
  if (cells.B) lastB = cells.B;
  else cells.B = lastB;
  if (cells.C) lastC = cells.C;
  else cells.C = lastC;
  let seq = (cells.A ?? '').toString().trim();
  if (!seq) seq = `续-${r}`;
  const l1 = cells.B ?? '';
  const l2 = cells.C ?? '';
  const l3 = cells.D ?? '';
  const desc = cells.E ?? '';
  const platform = cells.F ?? '';
  const reqType = cells.G ?? '';
  const modulePath = [l1, l2, l3].filter((x) => x && String(x).trim()).join(' / ');
  const remark = [platform, reqType].filter(Boolean).join('；');
  return { excelRow: r, seq, modulePath, desc, remark };
});

fs.writeFileSync(
  'd:/Cursor/testProject/_features_parsed.json',
  JSON.stringify({ title: strings[1], rows: out }, null, 2),
  'utf8'
);
console.log(JSON.stringify(out, null, 2));
