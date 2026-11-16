# 给 main 开分支保护（Windows / PowerShell）
#
# 前置：
#   gh auth login          # 账号需对该仓库有 admin 权限
#
# 用法（仓库根目录）：
#   powershell -ExecutionPolicy Bypass -File .github/scripts/setup-branch-protection.ps1
#   powershell -ExecutionPolicy Bypass -File .github/scripts/setup-branch-protection.ps1 -Verify

param(
  [string]$Repo = "xingfu362546/6Q-user-conference",
  [string]$Branch = "main",
  [switch]$Verify
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "未找到 gh，请先安装 GitHub CLI：https://cli.github.com/"
}

# gh auth status 失败时会把信息写到 stderr；在 Stop 模式下会抛错，
# 所以这里临时放宽错误偏好，只靠退出码判断。
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
gh auth status *> $null
$authCode = $LASTEXITCODE
$ErrorActionPreference = $prevEap
if ($authCode -ne 0) {
  throw "gh 未登录，请先运行：gh auth login"
}

if ($Verify) {
  gh api "repos/$Repo/branches/$Branch/protection"
  exit $LASTEXITCODE
}

# enforce_admins = false：owner 自己提的 PR 也能在必要时由 admin 破例合并，
# 否则「Require review from Code Owners + 只有一位 owner」会把 owner 自己锁死。
$body = @{
  required_status_checks          = $null
  enforce_admins                  = $false
  required_pull_request_reviews   = @{
    dismiss_stale_reviews           = $true
    require_code_owner_reviews      = $true
    required_approving_review_count = 1
    require_last_push_approval      = $false
  }
  restrictions                    = $null
  required_linear_history         = $true
  allow_force_pushes              = $false
  allow_deletions                 = $false
  required_conversation_resolution = $true
} | ConvertTo-Json -Depth 6

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "gh-protection.json"
[System.IO.File]::WriteAllText($tmp, $body, (New-Object System.Text.UTF8Encoding($false)))

gh api -X PUT "repos/$Repo/branches/$Branch/protection" --input $tmp
if ($LASTEXITCODE -ne 0) { throw "设置失败，确认账号对 $Repo 有 admin 权限" }

Write-Host "`n已开启 $Repo 的 $Branch 分支保护：" -ForegroundColor Green
Write-Host "  - 禁止直推，必须走 PR"
Write-Host "  - 需 1 人 review，且必须含 CODEOWNERS 指定人"
Write-Host "  - 新提交会作废旧 review"
Write-Host "  - 禁止 force push / 删分支"
Write-Host "  - 要求线性历史、要求解决所有对话"
Write-Host "`n复核：powershell -File .github/scripts/setup-branch-protection.ps1 -Verify"
