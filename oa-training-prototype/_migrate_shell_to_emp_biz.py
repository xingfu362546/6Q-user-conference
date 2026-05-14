# -*- coding: utf-8 -*-
"""One-off: replace EIP admin shell with employee + 课程管理 sidebar (prototype)."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent

ADMIN_BLOCK = re.compile(
    r"<body class=\"oa-admin-body\">\s*<div class=\"oa-adm\">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*",
    re.DOTALL,
)

HEAD_LINKS = """  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/oa-shell-emp.css" />
  <link rel="stylesheet" href="css/oa-shell-emp-biz.css" />
  <link rel="stylesheet" href="css/page-notes.css" />"""


def aside(active: str) -> str:
    def cl(name: str) -> str:
        return ' class="is-active"' if active == name else ""

    return f"""      <aside class="oa-emp-side" aria-label="培训学习">
        <div class="oa-emp-side__group" data-side-group="learn">
          <div class="oa-emp-side__group-head">
            <button type="button" class="oa-emp-side__toggle" aria-expanded="true" aria-controls="oa-emp-side-sub-learn" title="展开或收起「学员学习」"><span class="oa-emp-side__chev" aria-hidden="true">▼</span></button>
            <a href="emp-course-detail.html" class="oa-emp-side__group-title">学员学习</a>
          </div>
          <div id="oa-emp-side-sub-learn" class="oa-emp-side__sublinks">
            <a href="emp-course-detail.html"{cl("course")}>课程学习</a>
            <a href="emp-learning-plan.html"{cl("plan_emp")}>我的学习计划</a>
          </div>
        </div>
        <div class="oa-emp-side__group" data-side-group="mgmt">
          <div class="oa-emp-side__group-head">
            <button type="button" class="oa-emp-side__toggle" aria-expanded="true" aria-controls="oa-emp-side-sub-mgmt" title="展开或收起「课程管理」"><span class="oa-emp-side__chev" aria-hidden="true">▼</span></button>
            <a href="admin-course-library.html" class="oa-emp-side__group-title">课程管理</a>
          </div>
          <div id="oa-emp-side-sub-mgmt" class="oa-emp-side__sublinks">
            <a href="admin-course-library.html"{cl("lib")}>课程库</a>
            <a href="admin-learning-progress.html"{cl("prog")}>学习进度</a>
            <a href="admin-learning-plan-list.html"{cl("plan")}>学习计划</a>
            <a href="admin-quiz-grading.html"{cl("exam")}>考试详情</a>
          </div>
        </div>
      </aside>"""


def shell(crumb: str, active: str) -> str:
    return f"""<body class="oa-emp-body">
  <!-- 原 EIP「管理端」培训菜单已迁至员工端；侧栏「课程管理」与「学员学习」目录隔离（现网按权限显隐）。 -->
  <div class="oa-emp">
    <header class="oa-emp-topbar">
      <div class="oa-emp-topbar__brand">6Q-测试环境</div>
      <div class="oa-emp-modwrap">
        <ul class="oa-emp-modnav" aria-label="顶部模块菜单">
          <li><a href="#">首页</a></li>
          <li><a href="#">人力资源</a></li>
          <li><a href="#">流程中心</a></li>
          <li><a href="emp-course-detail.html" class="is-active">培训学习</a></li>
        </ul>
      </div>
      <div class="oa-emp-topbar__tools">
        <a class="oa-emp-barlink" href="index.html" title="返回原型导航">原型导航</a>
        <button type="button" class="oa-emp-tool" aria-label="通知"><span aria-hidden="true">🔔</span></button>
        <div class="oa-emp-userpill">
          <span class="oa-emp-avatar" aria-hidden="true"></span>
          <span class="oa-emp-username">李明明</span>
        </div>
      </div>
    </header>
    <div class="oa-emp-row">
{aside(active)}
      <div class="oa-emp-main">
        <div class="oa-emp-biz-headwrap">
          <div class="oa-emp-biz-head-inner">
            <div class="oa-emp-biz-crumb">{crumb}</div>
            <div class="oa-emp-biz-user"><span class="oa-emp-avatar" aria-hidden="true" style="width:24px;height:24px"></span><span>李明明</span></div>
          </div>
        </div>
        <div class="oa-emp-biz-workpad">
"""


CONFIG = {
    "admin-course-library.html": (
        "lib",
        '培训学习 <span style="color:#d0d5dd">/</span> <strong>课程库</strong>',
    ),
    "admin-course-edit.html": (
        "lib",
        '培训学习 <span style="color:#d0d5dd">/</span> 课程库 <span style="color:#d0d5dd">/</span> <strong>编辑课程</strong>',
    ),
    "admin-learning-progress.html": (
        "prog",
        '培训学习 <span style="color:#d0d5dd">/</span> <strong>学习进度</strong>',
    ),
    "admin-requirement-detail.html": (
        "prog",
        '培训学习 <span style="color:#d0d5dd">/</span> 学习进度 <span style="color:#d0d5dd">/</span> <strong>过关要求详情</strong>',
    ),
    "admin-quiz-grading.html": (
        "exam",
        '培训学习 <span style="color:#d0d5dd">/</span> <strong>考试详情</strong>',
    ),
    "admin-learning-plan-list.html": (
        "plan",
        '培训学习 <span style="color:#d0d5dd">/</span> <strong>学习计划</strong>',
    ),
    "admin-learning-plan-form.html": (
        "plan",
        '培训学习 <span style="color:#d0d5dd">/</span> 学习计划 <span style="color:#d0d5dd">/</span> <strong><span id="crumb-action">新建</span></strong>',
    ),
    "admin-learning-plan-monitor.html": (
        "plan",
        '培训学习 <span style="color:#d0d5dd">/</span> 学习计划 <span style="color:#d0d5dd">/</span> <strong>参学情况</strong>',
    ),
}


def fix_head(text: str) -> str:
    text = re.sub(
        r"<link rel=\"stylesheet\" href=\"css/oa-shell-admin\.css\" />",
        '<link rel="stylesheet" href="css/oa-shell-emp.css" />\n  <link rel="stylesheet" href="css/oa-shell-emp-biz.css" />',
        text,
        count=1,
    )
    return text


def main():
    for name, (active, crumb) in CONFIG.items():
        path = ROOT / name
        raw = path.read_text(encoding="utf-8")
        if "oa-admin-body" not in raw:
            print("skip (no admin shell):", name)
            continue
        m = ADMIN_BLOCK.search(raw)
        if not m:
            print("FAIL no match:", name)
            continue
        new_body_open = shell(crumb, active)
        raw2 = fix_head(raw[: m.start()]) + new_body_open + raw[m.end() :]
        path.write_text(raw2, encoding="utf-8")
        print("ok:", name)


if __name__ == "__main__":
    main()
