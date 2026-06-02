$ErrorActionPreference = 'Stop'
$docPath = 'C:\Users\Lenovo\Desktop\6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx'
$template = 'd:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q宏象系统2026夏令营上半段原型范围说明书.docx'
Copy-Item -LiteralPath $template -Destination $docPath -Force

$shotDir = 'd:\Cursor\testProject\output\lingxiu-v331-shots'
$features = Get-Content 'd:\Cursor\testProject\_features_lingxiu.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$notesRoot = Get-Content 'd:\Cursor\testProject\_prototype_notes_lingxiu_v331.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$today = Get-Date -Format 'yyyy-M-d'
$shots = @(Get-ChildItem -LiteralPath $shotDir -Filter '*.png' | Sort-Object Name)

function R([object]$doc, [string]$f, [string]$t) {
  $h = $doc.Content.Find
  $h.ClearFormatting()
  $h.Replacement.ClearFormatting()
  $h.Text = $f
  $h.Replacement.Text = $t
  $h.Forward = $true
  $h.Wrap = 1
  [void]$h.Execute([ref]2, [ref]$false, [ref]1, [ref]$false, [ref]$false, [ref]$false, [ref]$true, [ref]1, [ref]$false, [ref]$t, [ref]2)
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docPath)

R $doc '宏象系统开发部署项目（领袖营夏令营版本上半）' '宏象系统开发部署项目（领袖营 v2 3.3.1 · 2026年暑假信息化）'
R $doc '2026年4月25日' (Get-Date -Format 'yyyy年M月d日')
R $doc '2026-4-25' $today
R $doc 'https://axhub.im/ax9/88b0f37e38b75a4ahttps://axhub.im/ax9/aec02df773bba5c5' "https://axhub.im/ax9/88b0f37e38b75a4a`r`nhttps://axhub.im/ax9/ba31241cbdc4883d/#g=1`r`nhttps://axhub.im/ax9/9e650a6a1999b4ab`r`nhttps://axhub.im/ax9/4e2302828a9e4bc3/#g=1"
R $doc 'https://axhub.im/ax9/aec02df773bba5c5' ''
R $doc '2026年夏令营薪酬结算信息化功能清单' $features.title

$rng = $doc.Content
$rng.Collapse(0)
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)
$rng.Text = '4.页面-功能清单对应与注释（v3.3.1 页面 · 含截图）'
$rng.Style = '标题 1'
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)
$rng.Text = '说明：仅收录页面名或模块路径带 v3.3.1 的线框页（共 ' + $shots.Count + ' 页）。'
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)

$table = $doc.Tables.Add($rng, $shots.Count + 1, 4)
$table.Borders.Enable = 1
@('页面文件','对应功能清单','页面注释','截图') | ForEach-Object -Begin { $c=1 } -Process { $table.Cell(1,$c).Range.Text = $_; $c++ }
$table.Rows.Item(1).Range.Bold = 1

$row = 2
foreach ($s in $shots) {
  $name = [IO.Path]::GetFileNameWithoutExtension($s.Name)
  $note = $notesRoot.PSObject.Properties[$name]
  $comment = if ($note) { [string]$note.Value.notes } else { '（无便签）' }
  $trail = if ($note) { [string]$note.Value.trail } else { '' }
  $table.Cell($row,1).Range.Text = $name
  $table.Cell($row,2).Range.Text = $trail
  $table.Cell($row,3).Range.Text = ($comment -replace "`n","`r")
  $table.Cell($row,3).Range.Font.Size = 9
  $ir = $table.Cell($row,4).Range
  $ir.Text = ''
  $pic = $ir.InlineShapes.AddPicture($s.FullName)
  $pic.LockAspectRatio = -1
  if ($pic.Width -gt 210) { $pic.Width = 210 }
  $row++
}

$doc.Save()
$doc.Close()
$word.Quit()
Write-Output "OK saved $docPath rows=$($shots.Count)"
