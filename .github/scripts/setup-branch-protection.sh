#!/usr/bin/env bash
# 给 main 开分支保护（macOS / Linux）
#
# 前置：gh auth login   # 账号需对该仓库有 admin 权限
# 用法：bash .github/scripts/setup-branch-protection.sh [--verify]
set -euo pipefail

REPO="${REPO:-xingfu362546/6Q-user-conference}"
BRANCH="${BRANCH:-main}"

command -v gh >/dev/null || { echo "未找到 gh，请先安装 GitHub CLI"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh 未登录，请先运行：gh auth login"; exit 1; }

if [[ "${1:-}" == "--verify" ]]; then
  gh api "repos/$REPO/branches/$BRANCH/protection"
  exit $?
fi

# enforce_admins=false：owner 自己的 PR 在必要时可由 admin 破例合并，避免自锁。
gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo
echo "已开启 $REPO 的 $BRANCH 分支保护："
echo "  - 禁止直推，必须走 PR"
echo "  - 需 1 人 review，且必须含 CODEOWNERS 指定人"
echo "  - 新提交会作废旧 review"
echo "  - 禁止 force push / 删分支"
echo "  - 要求线性历史、要求解决所有对话"
