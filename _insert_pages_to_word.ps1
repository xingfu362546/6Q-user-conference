if ($env:SCOPE_DOCX_PATH) { $docPath = $env:SCOPE_DOCX_PATH } else {
  $docPath = (Get-ChildItem "$env:USERPROFILE\Desktop\6Q*.docx" | Where-Object { $_.BaseName -notlike '*2026*' } | Select-Object -First 1).FullName
}
if (-not $docPath) { throw 'Set SCOPE_DOCX_PATH or place 6Q*.docx on Desktop' }
$shotDir = if ($env:SCOPE_SHOT_DIR) { $env:SCOPE_SHOT_DIR } else { 'd:\Cursor\testProject\output\prototype-shots' }
$shots = Get-ChildItem $shotDir -Filter '*.png' | Sort-Object Name
$notesJsonPath = if ($env:SCOPE_NOTES_JSON) { $env:SCOPE_NOTES_JSON } else { 'd:\Cursor\testProject\_prototype_notes.json' }
$notesRoot = $null
if (Test-Path -LiteralPath $notesJsonPath) {
  $notesRoot = Get-Content -LiteralPath $notesJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Map-Feature($name) {
  $n = $name
  if ($n -match '授权|登录确认') { return '农行APP / 数据与授权 / 信息授权（含声明与授权链路）' }
  elseif ($n -match '专区|农行首页') { return '农行APP / 智慧父母专区 / 专栏首页、轮播图、专区公告' }
  elseif ($n -match '课程分类|专栏管理|内容管理') { return '农行APP / 智慧父母专区 / 商品分类（集合）页面；后台线上课程管理' }
  elseif ($n -match '课程订单|订阅付费订单|订单详情') { return '6Q超级爸妈 / 订单中心 / 课程订单' }
  elseif ($n -match '视频播放|学习') { return '农行APP / 智慧父母专区 / 课程学习' }
  elseif ($n -match '测评答题|测评结果|我的测评') { return '农行APP / 智慧父母专区 / 测评答题与结果分析' }
  elseif ($n -match '测评商品详情') { return '农行APP / 智慧父母专区 / 测评详情' }
  elseif ($n -match '测评商品管理|测评商品编辑') { return '6Q超级爸妈 / 测评管理 / 测评商品管理' }
  elseif ($n -match '^我的$') { return '农行APP / 智慧父母专区 / 我的' }
  elseif ($n -match '宣传页|h5宣传|基础信息') { return '6Q超级爸妈 / 宣传页 / 宣传详情页' }
  elseif ($n -match '上传视频') { return '6Q超级爸妈 / 宣传页 / 宣传详情页（多媒体素材能力）' }
  elseif ($n -match '广告') { return '6Q超级爸妈 / 运营管理 / 广告管理' }
  elseif ($n -match '公告') { return '6Q超级爸妈 / 运营管理 / 公告管理' }
  elseif ($n -match '线上_专享课程商品详情') { return '农行APP / 智慧父母专区 / 课程详情（专享课程）' }
  else { return '待确认：无法从文件名唯一定位功能清单项' }
}

function Build-Comment($name) {
  $feature = Map-Feature $name
  if ($feature -like '待确认*') { return '页面命名与功能清单项关系不唯一，建议产品确认该页面归属后再锁定。' }
  return "该页面用于承载[$feature]相关原型交互，截图来自本地HTML页面渲染，用于范围评审与验收对照。"
}

function Get-NoteFromJson([psobject]$root, [string]$pageKey) {
  if ($null -eq $root) { return $null }
  $p = $root.PSObject.Properties[$pageKey]
  if ($null -eq $p) { return $null }
  return [string]$p.Value.notes
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docPath)

$range = $doc.Content
$range.Collapse(0)
$range.InsertParagraphAfter() | Out-Null
$range.Collapse(0)
$range.Text = '页面-功能清单对应与注释（含HTML截图）'
$range.Style = '标题 1'
$range.InsertParagraphAfter() | Out-Null
$range.Collapse(0)
$range.Text = '说明：以下截图来自桌面原型HTML页面自动渲染，用于辅助功能范围说明。'
$range.InsertParagraphAfter() | Out-Null
$range.InsertParagraphAfter() | Out-Null
$range.Collapse(0)

$table = $doc.Tables.Add($range, $shots.Count + 1, 4)
$table.Borders.Enable = 1
$table.Cell(1,1).Range.Text = '页面文件'
$table.Cell(1,2).Range.Text = '对应功能清单'
$table.Cell(1,3).Range.Text = '页面注释'
$table.Cell(1,4).Range.Text = '截图'
$table.Rows.Item(1).Range.Bold = 1

$row = 2
foreach ($s in $shots) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($s.Name)
  $feature = Map-Feature $name
  $comment = Get-NoteFromJson $notesRoot $name
  if ([string]::IsNullOrWhiteSpace($comment)) { $comment = Build-Comment $name }
  $comment = ($comment -replace "`r`n", "`n") -replace "`n", "`r"
  $table.Cell($row,1).Range.Text = $name
  $table.Cell($row,2).Range.Text = $feature
  $table.Cell($row,3).Range.Text = $comment
  $table.Cell($row,3).Range.Font.Size = 9
  $imgRange = $table.Cell($row,4).Range
  $imgRange.Text = ''
  $pic = $imgRange.InlineShapes.AddPicture($s.FullName)
  $pic.LockAspectRatio = -1
  if ($pic.Width -gt 210) { $pic.Width = 210 }
  $row++
}

$table.Columns.Item(1).Width = 95
$table.Columns.Item(2).Width = 155
$table.Columns.Item(3).Width = 220
$table.Columns.Item(4).Width = 220

$doc.Save()
$doc.Close()
$word.Quit()

Write-Output "updated: $docPath"
