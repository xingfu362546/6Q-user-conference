import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const docPath = 'C:/Users/Lenovo/Desktop/6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx';
const shotDir = 'd:/Cursor/testProject/output/lingxiu-v331-shots';
const notes = JSON.parse(fs.readFileSync('d:/Cursor/testProject/_prototype_notes_lingxiu_v331.json', 'utf8'));

const shots = fs.readdirSync(shotDir).filter((f) => f.endsWith('.png')).sort();

const psLines = [
  '$ErrorActionPreference = "Stop"',
  `$docPath = '${docPath.replace(/'/g, "''")}'`,
  `$shotDir = '${shotDir.replace(/'/g, "''")}'`,
  '$word = New-Object -ComObject Word.Application',
  '$word.Visible = $false',
  '$word.DisplayAlerts = 0',
  '$doc = $word.Documents.Open($docPath)',
  'function DoReplace($f,$t) { $h=$doc.Content.Find; $h.ClearFormatting(); $h.Replacement.ClearFormatting(); $h.Text=$f; $h.Replacement.Text=$t; $h.Forward=$true; $h.Wrap=1; [void]$h.Execute([ref]2,[ref]$false,[ref]1,[ref]$false,[ref]$false,[ref]$false,[ref]$true,[ref]1,[ref]$false,[ref]$t,[ref]2) }',
];

const reps = [
  ['宏象系统开发部署项目（领袖营夏令营版本上半）', '宏象系统开发部署项目（领袖营 v2 3.3.1 · 2026年暑假信息化）'],
  ['2026年4月25日', new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })],
  ['2026-4-25', new Date().toISOString().slice(0, 10)],
];
for (const [f, t] of reps) {
  psLines.push(`DoReplace '${f.replace(/'/g, "''")}' '${t.replace(/'/g, "''")}'`);
}

psLines.push(
  '$rng = $doc.Content',
  '$rng.Collapse(0)',
  '$rng.InsertParagraphAfter() | Out-Null',
  '$rng.Collapse(0)',
  `$rng.Text = '4.页面-功能清单对应与注释（v3.3.1 页面 · 含截图）'`,
  `$rng.Style = '标题 1'`,
  '$rng.InsertParagraphAfter() | Out-Null',
  '$rng.Collapse(0)',
  `$rng.Text = '说明：仅收录 v3.3.1 版本线框页，共 ${shots.length} 页。'`,
  '$rng.InsertParagraphAfter() | Out-Null',
  '$rng.Collapse(0)',
  `$table = $doc.Tables.Add($rng, ${shots.length + 1}, 4)`,
  '$table.Borders.Enable = 1',
  `$table.Cell(1,1).Range.Text = '页面文件'`,
  `$table.Cell(1,2).Range.Text = '模块路径'`,
  `$table.Cell(1,3).Range.Text = '页面注释'`,
  `$table.Cell(1,4).Range.Text = '截图'`,
  '$table.Rows.Item(1).Range.Bold = 1',
);

let row = 2;
for (const file of shots) {
  const name = path.basename(file, '.png');
  const note = notes[name];
  const trail = note?.trail ?? '';
  const comment = (note?.notes ?? '（无便签）').replace(/'/g, "''").replace(/\r?\n/g, "`r");
  const trailEsc = trail.replace(/'/g, "''");
  const nameEsc = name.replace(/'/g, "''");
  const full = path.join(shotDir, file).replace(/\\/g, '\\\\');
  psLines.push(
    `$table.Cell(${row},1).Range.Text = '${nameEsc}'`,
    `$table.Cell(${row},2).Range.Text = '${trailEsc}'`,
    `$table.Cell(${row},3).Range.Text = '${comment}'`,
    `$table.Cell(${row},3).Range.Font.Size = 9`,
    `$ir = $table.Cell(${row},4).Range`,
    '$ir.Text = ""',
    `$pic = $ir.InlineShapes.AddPicture('${full}')`,
    '$pic.LockAspectRatio = -1',
    'if ($pic.Width -gt 210) { $pic.Width = 210 }',
  );
  row++;
}

psLines.push('$doc.Save()', '$doc.Close()', '$word.Quit()', 'Write-Output "OK"');

const psPath = 'd:/Cursor/testProject/scripts/_build_lingxiu_run.ps1';
fs.writeFileSync(psPath, '\uFEFF' + psLines.join('\r\n'), 'utf8');
execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit', timeout: 1200000 });
