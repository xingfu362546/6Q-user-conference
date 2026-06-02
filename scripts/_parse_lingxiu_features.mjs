import { writeFileSync, writeFileSync as wfs, unlinkSync } from 'fs';
import { join as pjoin } from 'path';
import { tmpdir as td } from 'os';
import { execSync } from 'child_process';

const xlsxPath = process.argv[2] || 'c:/Users/Lenovo/Desktop/领袖营2026年暑假信息化功能清单.xlsx';
const outPath = process.argv[3] || 'd:/Cursor/testProject/_features_lingxiu.json';

const pyCode = `import zipfile, xml.etree.ElementTree as ET, re, json, sys
path = sys.argv[1]
with zipfile.ZipFile(path) as z:
    sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
    ns = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    strings = []
    for si in sst.findall('m:si', ns):
        texts = []
        for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
            if t.text: texts.append(t.text)
        strings.append(''.join(texts))
    sh = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = sh.findall('.//m:row', ns)
    def cell_val(c):
        t = c.get('t')
        v = c.find('m:v', ns)
        if v is None or v.text is None: return ''
        if t == 's': return strings[int(v.text)]
        return v.text
    raw = []
    for row in rows:
        cells = {}
        for c in row.findall('m:c', ns):
            ref = c.get('r','')
            col = re.match(r'([A-Z]+)', ref).group(1) if ref else '?'
            cells[col] = cell_val(c)
        raw.append([cells.get(x,'') for x in ['A','B','C','D','E','F','G']])
title = raw[0][0]
rows_out = []
lastB = lastC = lastD = ''
seq = 0
for r in raw[2:]:
    if not any(r[4:7]) and not r[3] and not r[0]:
        continue
    if r[0]:
        try:
            seq = int(r[0])
        except:
            seq = r[0]
    elif r[4] and rows_out:
        rows_out[-1]['desc'] += '；' + r[4]
        continue
    if r[1]: lastB = r[1]
    if r[2]: lastC = r[2]
    if r[3]: lastD = r[3]
    modulePath = ' / '.join([x for x in [lastB, lastC, lastD] if x])
    rows_out.append({
        'seq': str(seq) if seq else '',
        'modulePath': modulePath,
        'desc': r[4] or '',
        'remark': r[5] or '',
    })
print(json.dumps({'title': title, 'rows': rows_out}, ensure_ascii=False))
`;

const tmpPy = pjoin(td(), '_parse_fl.py');
wfs(tmpPy, pyCode, 'utf8');
const jsonStr = execSync(`python "${tmpPy}" "${xlsxPath}"`, { encoding: 'utf8' });
const data = JSON.parse(jsonStr);
writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('rows', data.rows.length, '->', outPath);
