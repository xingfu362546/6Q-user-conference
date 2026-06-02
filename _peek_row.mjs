import fs from 'fs';
const s = fs.readFileSync('d:/Cursor/testProject/_fl_unzip/xl/worksheets/sheet1.xml', 'utf8');
for (const r of [6, 7, 8, 16, 17]) {
  const i = s.indexOf(`<row r="${r}"`);
  console.log('--- row', r, s.slice(i, i + 800));
}
