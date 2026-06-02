import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const docPath = 'C:/Users/Lenovo/Desktop/6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx';
const shotDir = 'd:/Cursor/testProject/output/lingxiu-v331-shots';
const notes = JSON.parse(fs.readFileSync('d:/Cursor/testProject/_prototype_notes_lingxiu_v331.json', 'utf8'));
const shots = fs.readdirSync(shotDir).filter((f) => f.endsWith('.png')).sort();

const lines = [
  '$ErrorActionPreference = "Stop"',
  `Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue`,
  `Start-Sleep -Seconds 2`,
  `$docPath = '${docPath}'`,
  `$word = New-Object -ComObject Word.Application`,
  `$word.Visible = $false`,
  `$doc = $word.Documents.Open($docPath)`,
  `$rng = $doc.Content`,
  `$rng.Collapse(0)`,
  `$rng.InsertParagraphAfter() | Out-Null`,
  `$rng.Collapse(0)`,
  `$rng.Text = "4.页面-功能清单对应与注释（v3.3.1 · 共${shots.length}页）"`,
  `$rng.Style = "标题 1"`,
  `$rng.InsertParagraphAfter() | Out-Null`,
  `$rng.Collapse(0)`,
  `$table = $doc.Tables.Add($rng, ${shots.length + 1}, 4)`,
  `$table.Borders.Enable = 1`,
  `$table.Cell(1,1).Range.Text = "页面"`,
  `$table.Cell(1,2).Range.Text = "模块路径"`,
  `$table.Cell(1,3).Range.Text = "页面注释"`,
  `$table.Cell(1,4).Range.Text = "截图文件"`,
  `$table.Rows.Item(1).Range.Bold = 1`,
];

let row = 2;
for (const file of shots) {
  const name = path.basename(file, '.png');
  const note = notes[name] || {};
  const trail = (note.trail || '').replace(/'/g, "''");
  const comment = (note.notes || '').replace(/'/g, "''").replace(/\r?\n/g, ' ');
  const nameEsc = name.replace(/'/g, "''");
  lines.push(
    `$table.Cell(${row},1).Range.Text = '${nameEsc}'`,
    `$table.Cell(${row},2).Range.Text = '${trail}'`,
    `$table.Cell(${row},3).Range.Text = '${comment}'`,
    `$table.Cell(${row},3).Range.Font.Size = 9`,
    `$table.Cell(${row},4).Range.Text = '${file.replace(/'/g, "''")}'`,
  );
  row++;
}

lines.push('$doc.Save()', '$doc.Close()', '$word.Quit()', 'Write-Output "DONE"');
const psPath = 'd:/Cursor/testProject/scripts/_build_fast_run.ps1';
fs.writeFileSync(psPath, '\uFEFF' + lines.join('\r\n'), 'utf8');
execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit', timeout: 120000 });
