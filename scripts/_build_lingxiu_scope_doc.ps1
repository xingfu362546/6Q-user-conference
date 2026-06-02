# 领袖营 v2 原型范围说明书 — Word 完整生成
$ErrorActionPreference = 'Stop'
$docPath = 'C:\Users\Lenovo\Desktop\6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx'
$shotDir = if ($env:SCOPE_SHOT_DIR) { $env:SCOPE_SHOT_DIR } else { 'd:\Cursor\testProject\output\lingxiu-v331-shots' }
$featuresPath = 'd:\Cursor\testProject\_features_lingxiu.json'
$notesPath = if ($env:SCOPE_NOTES_JSON) { $env:SCOPE_NOTES_JSON } else { 'd:\Cursor\testProject\_prototype_notes_lingxiu_v331.json' }
$listDir = 'd:\Cursor\testProject\output'
$today = Get-Date -Format 'yyyy-M-d'

$features = Get-Content -LiteralPath $featuresPath -Raw -Encoding UTF8 | ConvertFrom-Json
$notesRoot = Get-Content -LiteralPath $notesPath -Raw -Encoding UTF8 | ConvertFrom-Json
$protoMeta = @(
  @{ key = 'portal'; label = '磨课排课-门户'; url = 'https://axhub.im/ax9/4e2302828a9e4bc3/#g=1' },
  @{ key = 'mobile'; label = '领袖营-移动端'; url = 'https://axhub.im/ax9/9e650a6a1999b4ab' },
  @{ key = 'tutor'; label = '宏象-导师模块'; url = 'https://axhub.im/ax9/ba31241cbdc4883d/#g=1' },
  @{ key = 'pay'; label = '领袖营-薪酬后台'; url = 'https://axhub.im/ax9/88b0f37e38b75a4a' }
)

function Map-Feature([string]$pageKey, [string]$trail, [string]$pageName) {
  $t = "$trail $pageName"
  if ($pageKey -like 'portal*') {
    if ($t -match '物料|上传') { return '功能清单：导师门户端 / 磨课 / 物料提交（序号1-2）' }
    if ($t -match '磨课课程|查看磨课') { return '功能清单：导师门户端 / 磨课 / 磨课课程列表（序号3）' }
    if ($t -match '我的') { return '功能清单：导师门户端 / 磨课 / 我的（序号4）' }
    if ($t -match '磨课任务|评分') { return '功能清单：导师门户端 / 磨课 / 磨课任务（序号5）' }
    if ($t -match '排课|课表') { return '功能清单：后台管理 / 排课管理 / 领袖营课表（序号7）' }
    return '导师门户端原型页面（磨课排课-门户）'
  }
  if ($pageKey -like 'mobile*') {
    if ($t -match '成长印记|印记') { return '功能清单：后台管理 / 助教分组 / 学员成长印记（序号13）' }
    if ($t -match '薪酬|薪资|工资') { return '功能清单：OA员工端 / 领袖营审批 / OA薪酬审批（序号15）' }
    if ($t -match '审批|课表') { return '功能清单：OA员工端 / 领袖营审批 / 课表审批（序号14）' }
    return '领袖营-移动端原型页面'
  }
  if ($pageKey -like 'tutor*') {
    if ($t -match '验收|试讲') { return '功能清单：后台管理 / 导师验收 / 验收分配（序号6）' }
    if ($t -match '人才库|导入|导出') { return '功能清单：后台管理 / 人才库（序号8-11）' }
    if ($t -match '档案') { return '功能清单：后台管理 / 档案管理 / 导师课程档案（序号12）' }
    if ($t -match '助教|分组|印记') { return '功能清单：后台管理 / 助教分组 / 学员成长印记（序号13）' }
    if ($t -match '课表|排课') { return '功能清单：后台管理 / 排课管理 / 领袖营课表（序号7）' }
    return '宏象-导师模块原型页面'
  }
  if ($pageKey -like 'pay*') {
    if ($t -match '薪酬|发放|账单|批次') { return '功能清单：OA员工端 / 领袖营审批 / OA薪酬审批（序号15）' }
    return '领袖营-薪酬后台原型页面'
  }
  return '待确认：请对照功能清单核对页面归属'
}

function Get-NoteFromJson([psobject]$root, [string]$pageKey) {
  if ($null -eq $root) { return $null }
  $p = $root.PSObject.Properties[$pageKey]
  if ($null -eq $p) { return $null }
  return [string]$p.Value.notes
}

function Replace-All([object]$doc, [string]$find, [string]$replace) {
  if ([string]::IsNullOrEmpty($find)) { return }
  $r = $doc.Content
  $f = $r.Find
  $f.ClearFormatting()
  $f.Replacement.ClearFormatting()
  $f.Text = $find
  $f.Replacement.Text = $replace
  $f.Forward = $true
  $f.Wrap = 1
  $f.Format = $false
  $f.MatchCase = $false
  $f.MatchWholeWord = $false
  [void]$f.Execute([ref]2, [ref]$false, [ref]1, [ref]$false, [ref]$false, [ref]$false, [ref]$true, [ref]1, [ref]$false, [ref]$replace, [ref]2)
}

function Find-HeadingStart([object]$doc, [string]$text) {
  $r = $doc.Content
  $f = $r.Find
  $f.ClearFormatting()
  $f.Text = $text
  $f.Forward = $true
  $f.Wrap = 0
  if ($f.Execute()) { return $f.Parent.Paragraphs(1).Range.Start }
  return -1
}

function Remove-Range([object]$doc, [int]$start, [int]$end) {
  if ($start -lt 0 -or $end -le $start) { return }
  $rng = $doc.Range($start, $end)
  $rng.Delete()
}

function Insert-Paragraph([object]$doc, [object]$range, [string]$text, [string]$styleName) {
  $range.Collapse(0)
  $range.Text = $text
  if ($styleName) { $range.Style = $styleName }
  $range.InsertParagraphAfter() | Out-Null
  return $range
}

$shots = @(Get-ChildItem -LiteralPath $shotDir -Filter '*.png' -ErrorAction SilentlyContinue | Sort-Object Name)
if ($shots.Count -lt 50) {
  Write-Warning "截图仅 $($shots.Count) 张，目录 $shotDir — 若仍在抓取可稍后重跑本脚本（RESUME=1）"
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docPath)

# --- 封面与元数据 ---
Replace-All $doc '宏象系统开发部署项目（领袖营夏令营版本上半）' '宏象系统开发部署项目（领袖营 v2 3.3.1 · 2026年暑假信息化）'
Replace-All $doc '宏象系统开发部署项目（领袖营夏令营版本上半段）' '宏象系统开发部署项目（领袖营 v2 3.3.1 · 2026年暑假信息化）'
Replace-All $doc '2026年4月25日' $(Get-Date -Format 'yyyy年M月d日')
Replace-All $doc '2026-4-25' $today
Replace-All $doc '2026-04-25' $today

$linkBlock = @"
原型链接：
磨课排课-门户：$($protoMeta[0].url)
领袖营-移动端：$($protoMeta[1].url)
宏象-导师模块：$($protoMeta[2].url)
领袖营-薪酬后台：$($protoMeta[3].url)
"@
Replace-All $doc 'https://axhub.im/ax9/88b0f37e38b75a4ahttps://axhub.im/ax9/aec02df773bba5c5' ($protoMeta[3].url + "`n" + $protoMeta[2].url)
Replace-All $doc 'https://axhub.im/ax9/88b0f37e38b75a4a' $protoMeta[3].url
Replace-All $doc 'https://axhub.im/ax9/aec02df773bba5c5' ''

Replace-All $doc '2026年夏令营薪酬结算信息化功能清单' $features.title
Replace-All $doc '领袖营夏令营版本上半' '领袖营 v2 3.3.1 · 2026年暑假信息化'

# 业务概述补充
Replace-All $doc '上半段' '2026年暑假信息化'

# --- 2. 功能清单：删除旧表区域并重写 ---
$start2 = Find-HeadingStart $doc '2.功能清单'
$start3 = Find-HeadingStart $doc '3.需求说明'
if ($start2 -ge 0 -and $start3 -gt $start2) {
  $h2 = $doc.Range($start2, $start2)
  $paraEnd = $h2.Paragraphs(1).Range.End
  Remove-Range $doc $paraEnd $start3
  $ins = $doc.Range($paraEnd, $paraEnd)
  $ins.Collapse(0)
  $ins.Text = "本节功能清单已根据《$($features.title)》同步，共 $($features.rows.Count) 条。`r`r"
  $ins.InsertParagraphAfter() | Out-Null
  $ins.Collapse(0)
  $tbl = $doc.Tables.Add($ins, $features.rows.Count + 1, 4)
  $tbl.Borders.Enable = 1
  $tbl.Cell(1, 1).Range.Text = '序号'
  $tbl.Cell(1, 2).Range.Text = '功能模块（一级/二级/三级）'
  $tbl.Cell(1, 3).Range.Text = '功能描述'
  $tbl.Cell(1, 4).Range.Text = '所属团队'
  $tbl.Rows.Item(1).Range.Bold = 1
  $ri = 2
  foreach ($row in $features.rows) {
    $tbl.Cell($ri, 1).Range.Text = [string]$row.seq
    $tbl.Cell($ri, 2).Range.Text = [string]$row.modulePath
    $tbl.Cell($ri, 3).Range.Text = ([string]$row.desc -replace "`n", "`r")
    $tbl.Cell($ri, 4).Range.Text = [string]$row.remark
    $ri++
  }
  $tbl.Columns.Item(1).Width = 45
  $tbl.Columns.Item(2).Width = 155
  $tbl.Columns.Item(3).Width = 220
  $tbl.Columns.Item(4).Width = 90
}

# --- 3. 需求说明：整段替换 ---
$start3 = Find-HeadingStart $doc '3.需求说明'
$endDoc = $doc.Content.End
if ($start3 -ge 0) {
  Remove-Range $doc $start3 $endDoc
  $rng = $doc.Range($start3, $start3)
  $rng.Text = '3.需求说明'
  $rng.Style = '标题 1'
  $rng.InsertParagraphAfter() | Out-Null
  $rng.Collapse(0)

  $overview = @"
本版本覆盖领袖营 v2（3.3.1）2026 年暑假信息化建设范围，原型分为磨课排课门户、领袖营移动端、宏象导师模块与领袖营薪酬后台四套 Axhub 工程；需求说明与页面对照仅纳入页面名称或模块路径带 v3.3.1 标识的线框页。功能需求以第 2 章功能清单为准；各页面交互与便签说明见第 4 章页面对照表。
"@
  $rng.Text = $overview
  $rng.InsertParagraphAfter() | Out-Null
  $rng.Collapse(0)

  $sec = 1
  foreach ($pm in $protoMeta) {
    $listPath = Join-Path $listDir "axhub-$($pm.key)-pages.json"
    $pageCount = 0
    if (Test-Path -LiteralPath $listPath) {
      $allPages = (Get-Content -LiteralPath $listPath -Raw -Encoding UTF8 | ConvertFrom-Json).pages
      $pageCount = @($allPages | Where-Object {
        ($_.pageName -match 'v3\.3\.1|v3_3_1') -or (
          ($_.trail -match 'v3\.3\.1|v3_3_1') -and
          (-not ($_.pageName -match 'v\d+\.\d+|v\d+_\d+') -or ($_.pageName -match 'v3\.3\.1|v3_3_1'))
        )
      }).Count
    }
    $rng.Text = "3.$sec $($pm.label)"
    $rng.Style = '标题 2'
    $rng.InsertParagraphAfter() | Out-Null
    $rng.Collapse(0)
    $rng.Text = "原型链接：$($pm.url)`r本端共 $pageCount 个线框页面，页面级截图、功能清单映射与便签注释见第 4 章对照表。"
    $rng.InsertParagraphAfter() | Out-Null
    $rng.Collapse(0)

    # 功能清单条目摘要
    $related = switch ($pm.key) {
      'portal' { $features.rows | Where-Object { $_.modulePath -like '导师门户端*' } }
      'mobile' { $features.rows | Where-Object { $_.modulePath -like 'OA*' -or $_.modulePath -like '*助教*' } }
      'tutor' { $features.rows | Where-Object { $_.modulePath -like '后台*' } }
      'pay' { $features.rows | Where-Object { $_.modulePath -like '*薪酬*' -or $_.desc -match '薪酬' } }
      default { @() }
    }
    if ($related.Count -gt 0) {
      $rng.Text = '关联功能清单条目：'
      $rng.InsertParagraphAfter() | Out-Null
      $rng.Collapse(0)
      foreach ($r in $related) {
        $rng.Text = "（序号$($r.seq)）$($r.modulePath)：$($r.desc -replace '`n','；')"
        $rng.InsertParagraphAfter() | Out-Null
        $rng.Collapse(0)
      }
    }
    $sec++
  }
}

# --- 4. 页面对照表 ---
$rng = $doc.Content
$rng.Collapse(0)
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)
$rng.Text = '4.页面-功能清单对应与注释（含原型截图）'
$rng.Style = '标题 1'
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)
$rng.Text = '说明：以下仅收录原型页面名称或所属模块带 v3.3.1 版本的线框页；截图由 Axhub 在线原型自动渲染，页面注释来自 Axure 便签/标注原文。'
$rng.InsertParagraphAfter() | Out-Null
$rng.InsertParagraphAfter() | Out-Null
$rng.Collapse(0)

if ($shots.Count -eq 0) {
  $rng.Text = '（截图生成中或目录为空，请重新运行抓取脚本后再次执行本脚本。）'
} else {
  $table = $doc.Tables.Add($rng, $shots.Count + 1, 4)
  $table.Borders.Enable = 1
  $table.Cell(1, 1).Range.Text = '页面文件'
  $table.Cell(1, 2).Range.Text = '对应功能清单'
  $table.Cell(1, 3).Range.Text = '页面注释'
  $table.Cell(1, 4).Range.Text = '截图'
  $table.Rows.Item(1).Range.Bold = 1
  $row = 2
  foreach ($s in $shots) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($s.Name)
    $parts = $name -split '__', 3
    $protoKey = $parts[0]
    $pageName = if ($parts.Length -ge 2) { $parts[1] } else { $name }
    $noteKey = $name
    $noteObj = $notesRoot.PSObject.Properties[$noteKey]
    $trail = if ($noteObj) { [string]$noteObj.Value.trail } else { '' }
    $feature = Map-Feature $noteKey $trail $pageName
    $comment = Get-NoteFromJson $notesRoot $noteKey
    if ([string]::IsNullOrWhiteSpace($comment)) {
      $comment = "该页面用于承载[$feature]相关原型交互，截图来自 Axhub 在线原型。"
    }
    $comment = ($comment -replace "`r`n", "`n") -replace "`n", "`r"
    $table.Cell($row, 1).Range.Text = $name
    $table.Cell($row, 2).Range.Text = $feature
    $table.Cell($row, 3).Range.Text = $comment
    $table.Cell($row, 3).Range.Font.Size = 9
    $imgRange = $table.Cell($row, 4).Range
    $imgRange.Text = ''
    try {
      $pic = $imgRange.InlineShapes.AddPicture($s.FullName)
      $pic.LockAspectRatio = -1
      if ($pic.Width -gt 210) { $pic.Width = 210 }
    } catch {
      $imgRange.Text = '（图片插入失败）'
    }
    $row++
  }
  $table.Columns.Item(1).Width = 95
  $table.Columns.Item(2).Width = 155
  $table.Columns.Item(3).Width = 220
  $table.Columns.Item(4).Width = 220
}

# 修订记录 V1.1
Replace-All $doc 'V1.1已完成' "V1.1`r$today`r余炜烽`r2026暑假领袖营v2范围说明书`r已更新`r已完成"

$doc.Save()
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Output "saved: $docPath shots=$($shots.Count)"
