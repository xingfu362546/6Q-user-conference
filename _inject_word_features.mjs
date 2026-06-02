import fs from 'fs';

const data = JSON.parse(fs.readFileSync('d:/Cursor/testProject/_features_parsed.json', 'utf8'));
const docPath = 'd:/Cursor/testProject/_scope_template_unzipped/word/document.xml';
let doc = fs.readFileSync(docPath, 'utf8');

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '；');
}

const rPr = `<w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="宋体"/><w:sz w:val="24"/></w:rPr>`;
const rPrBold = `<w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="宋体"/><w:b/><w:sz w:val="24"/></w:rPr>`;

function pWithText(text, paraId, bold = false) {
  const rp = bold ? rPrBold : rPr;
  return `<w:p w14:paraId="${paraId}" w14:textId="77777777" w:rsidR="00DE44D7" w:rsidRDefault="00DE44D7"><w:pPr><w:ind w:firstLineChars="200" w:firstLine="480"/><w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="宋体"/><w:sz w:val="24"/></w:rPr></w:pPr><w:r>${rp}<w:t>${esc(text)}</w:t></w:r></w:p>`;
}

const intro1 = pWithText(
  `本节功能清单已根据桌面《农行智慧父母功能清单》Excel 同步（表内标题「${data.title}」），共 ${data.rows.length} 条。`,
  '314F74B7'
);
const intro2 = pWithText(
  '腾讯文档协同底稿：https://docs.qq.com/sheet/DQXRuSnlBTkxsam9w?tab=d42e1c',
  '314F74C0'
);

const tcBorders =
  '<w:tcBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/></w:tcBorders>';
const tcMar = '<w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tcMar>';

function cell(width, text, boldHeader = false) {
  const rp = boldHeader ? rPrBold : rPr;
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${tcBorders}${tcMar}</w:tcPr><w:p w14:paraId="FEED0001" w14:textId="77777777" w:rsidR="00DE44D7" w:rsidRDefault="00DE44D7"><w:pPr><w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="宋体"/><w:sz w:val="24"/></w:rPr></w:pPr><w:r>${rp}<w:t>${esc(text)}</w:t></w:r></w:p></w:tc>`;
}

const headerRow = `<w:tr w:rsidR="00DE44D7" w14:paraId="FEED0002" w14:textId="77777777"><w:trPr><w:jc w:val="center"/></w:trPr>${cell(
  900,
  '序号',
  true
)}${cell(2600, '功能模块（一级/二级/三级）', true)}${cell(4200, '功能描述', true)}${cell(2000, '实现端；需求类型', true)}</w:tr>`;

const bodyRows = data.rows
  .map((row, i) => {
    const n = String(i + 1);
    const mod = esc(row.modulePath);
    const d = esc(row.desc);
    const rm = esc(row.remark);
    return `<w:tr w:rsidR="00DE44D7" w14:paraId="FEED${(3000 + i).toString(16)}" w14:textId="77777777"><w:trPr><w:jc w:val="left"/></w:trPr>${cell(900, n)}${cell(2600, mod)}${cell(4200, d)}${cell(2000, rm)}</w:tr>`;
  })
  .join('');

const table = `<w:tbl><w:tblPr><w:tblStyle w:val="a8"/><w:tblW w:w="0" w:type="auto"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid><w:gridCol w:w="900"/><w:gridCol w:w="2600"/><w:gridCol w:w="4200"/><w:gridCol w:w="2000"/></w:tblGrid>${headerRow}${bodyRows}</w:tbl>`;

const newBlock = intro1 + intro2 + table;

const start = doc.indexOf('<w:p w14:paraId="314F74B7"');
const end = doc.indexOf('<w:p w14:paraId="47968128"');
if (start === -1 || end === -1 || end <= start) {
  console.error('markers not found', start, end);
  process.exit(1);
}
doc = doc.slice(0, start) + newBlock + doc.slice(end);
fs.writeFileSync(docPath, doc, 'utf8');
console.log('injected', data.rows.length, 'rows');
