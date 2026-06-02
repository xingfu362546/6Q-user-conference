$ErrorActionPreference = 'Stop'
$jsonPath = if ($env:SCOPE_NOTES_JSON) { $env:SCOPE_NOTES_JSON } else { 'd:\Cursor\testProject\_prototype_notes.json' }
if ($env:SCOPE_DOCX_PATH) {
  $docPath = $env:SCOPE_DOCX_PATH
} else {
  $docPath = (Get-ChildItem "$env:USERPROFILE\Desktop\6Q*.docx" | Where-Object { $_.BaseName -notlike '*2026*' } | Select-Object -First 1).FullName
}
if (-not $docPath) { throw 'Set SCOPE_DOCX_PATH or place 6Q*.docx on Desktop' }

function Clean-CellText([string]$s) {
  if ($null -eq $s) { return '' }
  $s = $s -replace [char]7, ''
  $s = $s.TrimEnd([char]13, [char]10, [char]7, ' ')
  return $s.Trim()
}

function Get-Notes([psobject]$root, [string]$pageKey) {
  $p = $root.PSObject.Properties[$pageKey]
  if ($null -eq $p) { return $null }
  return [string]$p.Value.notes
}

$notesRoot = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docPath)

$table = $null
foreach ($t in $doc.Tables) {
  if ($t.Columns.Count -lt 4) { continue }
  $c1 = Clean-CellText($t.Cell(1, 1).Range.Text)
  $c2 = Clean-CellText($t.Cell(1, 2).Range.Text)
  $c3 = Clean-CellText($t.Cell(1, 3).Range.Text)
  $c4 = Clean-CellText($t.Cell(1, 4).Range.Text)
  if ($c1 -match '页面' -and ($c2 -match '功能' -or $c2 -match '清单') -and $c3 -match '注释' -and $c4 -match '截图') {
    $table = $t
  }
}
if ($null -eq $table) {
  foreach ($t in $doc.Tables) {
    if ($t.Columns.Count -eq 4) { $table = $t }
  }
}
if ($null -eq $table) {
  $doc.Close($false)
  $word.Quit()
  throw 'No suitable 4-column table found'
}

$rows = $table.Rows.Count
for ($r = 2; $r -le $rows; $r++) {
  $pageName = Clean-CellText($table.Cell($r, 1).Range.Text)
  if (-not $pageName) { continue }
  $txt = Get-Notes $notesRoot $pageName
  if ($null -eq $txt) { $txt = '[JSON missing key] ' + $pageName }
  $txt = $txt -replace "`r`n", "`n"
  $txt = $txt -replace "`n", "`r"
  $cr = $table.Cell($r, 3).Range
  $cr.Text = $txt
  $cr.Font.Size = 9
}

try {
  $table.Columns.Item(1).Width = 90
  $table.Columns.Item(2).Width = 140
  $table.Columns.Item(3).Width = 300
  $table.Columns.Item(4).Width = 200
} catch {}

$doc.Save()
$doc.Close()
$word.Quit()
Write-Output "OK: column 3 updated in $docPath"
