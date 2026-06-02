# -*- coding: utf-8 -*-
"""生成《课程会务 · 学员意向分析》产品方案稿 Word（对齐 CONFIRMATION.md）"""
from pathlib import Path

try:
    from docx import Document
    from docx.shared import Pt, RGBColor, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
except ImportError:
    raise SystemExit("请先安装: pip install python-docx")

OUT = Path(__file__).parent / "course-student-intent-design.docx"


def set_cell_shading(cell, fill="E8EEF7"):
    """表头浅蓝底"""
    from docx.oxml import OxmlElement

    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def add_table(doc, headers, rows, header_fill=True):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        if header_fill:
            set_cell_shading(cell)
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            table.rows[r + 1].cells[c].text = str(val)
    doc.add_paragraph()


def add_flow(doc, title, lines):
    """流程图（文字版，Word 可直接阅读）"""
    if title:
        p = doc.add_paragraph()
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(11)
    box = doc.add_paragraph()
    run = box.add_run("\n".join(lines))
    run.font.name = "Consolas"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    run.font.size = Pt(9)
    doc.add_paragraph()


def add_bullets(doc, items):
    for item in items:
        doc.add_paragraph(item, style="List Bullet")


def add_numbered(doc, items):
    for item in items:
        doc.add_paragraph(item, style="List Number")


def main():
    doc = Document()

    # 封面
    t = doc.add_heading("课程会务 · 学员意向分析", 0)
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub = doc.add_paragraph("产品方案稿（确认版 v1.0）")
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta = doc.add_paragraph(
        "阅读对象：产品 / 业务 / 研发 / 测试\n"
        "关联系统：用户标签平台\n"
        "挂载位置：6Q 后台 → 计划与实施 → 课程会务详情 → 学员意向分析\n"
        "交互原型：6q-conference-prototype/conference-student-intent.html"
    )
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

    # 目录说明
    doc.add_heading("方案稿目录", level=1)
    add_table(
        doc,
        ["章节", "内容"],
        [
            ["§1", "方案整体目录（系统位置、四大模块）"],
            ["§2", "数据采集范围"],
            ["§3", "总体数据流（端到端）"],
            ["§4", "核心规则与实现流程"],
            ["§5", "页面与列表设计"],
            ["§6", "系统边界与分期"],
            ["§7", "方案确认清单"],
        ],
    )

    doc.add_heading("一句话方案", level=1)
    doc.add_paragraph(
        "在课程会务详情增加「学员意向分析」页：基于用户标签平台的全平台标签命中，"
        "只针对本期学员做筛选、打分与分级；结合会务跟进（人工）与 AI 提炼（模型），"
        "在一屏看清谁更值得跟、为什么。"
    )

    # §1
    doc.add_heading("§1 方案整体目录", level=1)

    doc.add_heading("1.1 在 6Q 后台的位置", level=2)
    add_flow(
        doc,
        None,
        [
            "6Q 后台管理系统",
            "└── 计划与实施",
            "    └── 线下课程会务",
            "        └── 课程会务",
            "            └── 课程会务详情（某一期）",
            "                ├── 基础信息、报读记录、学员信息（已有）",
            "                ├── 跟进记录（已有 · 人工录入）",
            "                └── 【新增】学员意向分析（本方案 · 只读分析）",
        ],
    )

    doc.add_heading("1.2 本方案四大模块", level=2)
    add_flow(
        doc,
        "模块关系（自上而下）：",
        [
            "【模块一 标签能力】规则配置 → 全平台批处理 → 命中快照（标签平台）",
            "         ↓",
            "【模块二 本期策略】关注标签筛选 + 意向度统计方式（二选一）→ 保存本期",
            "         ↓",
            "【模块三 意向列表】意向分 / 意向度 / 标签 / 行为摘要 / 跟进 / AI",
            "         ↑",
            "【模块四 跟进与AI】跟进记录录入 → AI异步分析 → AI分+提炼",
        ],
    )
    add_table(
        doc,
        ["模块", "建设方", "说明"],
        [
            ["标签平台", "已有系统", "规则、计算、快照；会务只读消费"],
            ["本期策略", "本方案新增", "每期会务保存筛选与分级规则"],
            ["意向列表", "本方案新增", "分析页主体"],
            ["跟进 + AI", "本方案增强", "录入不变；新增 AI 分与提炼展示"],
        ],
    )

    # §2
    doc.add_heading("§2 数据采集范围", level=1)
    doc.add_paragraph(
        "原则：会务页不新造规则引擎；能做成标签的优先在标签平台配置，会务只选用、展示、计分。"
    )

    doc.add_heading("2.1 采集范围总表", level=2)
    add_table(
        doc,
        ["数据类型", "采集/计算范围", "负责系统", "本页是否配规则", "会务页用途"],
        [
            ["学员身份", "本期会务名单", "6Q 会务", "—", "只看本期学员"],
            ["标签命中", "全平台学员", "用户标签平台", "否", "展示、意向分、意向度(B)"],
            ["标签权重", "全平台统一", "用户标签平台", "否", "意向分加总"],
            ["社区/学习/视频", "全平台行为库", "数仓/标签平台", "优先做标签", "列表摘要+抽屉"],
            ["会务跟进", "本期会务", "跟进记录菜单", "否", "列表「跟进内容」"],
            ["AI 分析", "标签+跟进", "AI 服务", "否", "AI分+「AI提炼分析」列"],
        ],
    )

    doc.add_heading("2.2 标签：全平台算、会务用交集", level=2)
    add_flow(
        doc,
        "数据关系：",
        [
            "[用户标签平台]  全平台学员 → 按规则计算 → tag_member_snapshot",
            "                    │",
            "                    │ member_id 关联",
            "                    ▼",
            "[本期会务]      本期学员名单 → 学员意向分析页（仅展示交集学员）",
        ],
    )
    add_table(
        doc,
        ["要点", "说明"],
        [
            ["计算对象", "标签面向全平台（例：亲子视频>50分钟 →「亲子意向」）"],
            ["会务可见", "仅本期名单内且快照命中的学员"],
            ["版本", "会务不展示版本号；接口取最近成功版本"],
            ["时效", "不设会务默认90天；直至平台重新计算该标签"],
            ["学员ID", "member_id 与标签快照一致，直接关联"],
        ],
    )

    # §3
    doc.add_heading("§3 总体数据流（端到端）", level=1)
    add_numbered(
        doc,
        [
            "【离线】数仓/行为库 → 标签平台：行为与属性数据进入，按规则计算，写入命中快照。",
            "【录入】会务在「跟进记录」填写跟进 → 保存后触发 AI 异步分析（本页可手动重分析）。",
            "【AI产出】AI 服务返回：AI权重分(0~25) + 提炼摘要，写入 biz_followup_ai_insight。",
            "【打开页面】读本期学员名单 + 标签命中 + 行为聚合摘要 → 渲染列表与抽屉。",
            "【配置策略】选择关注标签、意向度方式（权重分/命中标签）→ 保存本期策略 → 刷新列表。",
        ],
    )

    # §4
    doc.add_heading("§4 核心规则与实现流程", level=1)

    doc.add_heading("4.1 规则关系总览", level=2)
    add_flow(
        doc,
        None,
        [
            "本期学员",
            "  → 平台标签命中快照 ─┬→ 计算【意向分】（标签权重+AI分）",
            "                      ├→ 【关注标签】筛选列表",
            "                      └→ 【意向度】统计（二选一）",
            "会务跟进原文 + 命中标签 → AI分析 → 计入意向分 + AI提炼列",
            "社区/学习/视频摘要 ─────────────→ 列表并重展示",
        ],
    )

    doc.add_heading("4.2 规则一：关注标签（筛列表）", level=2)
    add_flow(
        doc,
        "实现流程：",
        [
            "会务在一级/二级标签树多选「关注标签」",
            "  → 选择逻辑：命中任一 / 命中全部",
            "  → 过滤本期学员列表（不改变平台命中事实）",
            "  → 保存至 biz_conference_intent_config.watch_tag_*",
        ],
    )

    doc.add_heading("4.3 规则二：意向分（固定，与意向度方式无关）", level=2)
    doc.add_paragraph("公式：")
    f = doc.add_paragraph()
    run = f.add_run(
        "意向分 = Σ（该学员每个已命中标签的平台权重）+ AI权重分\nAI权重分 ∈ [0, 25]"
    )
    run.bold = True
    add_flow(
        doc,
        "计算流程：",
        [
            "输入①：学员已命中标签列表 + 各标签在平台配置的全局权重",
            "输入②：AI权重分（模型读取「本期跟进内容」+「命中标签」）",
            "  → 累加标签权重",
            "  → 加上 AI 分",
            "  → 输出意向分（列表默认按此降序排序）",
        ],
    )
    add_table(
        doc,
        ["项", "说明"],
        [
            ["标签权重", "标签平台配置（2C），会务只读"],
            ["AI分", "保存跟进后异步分析；可手动重新分析"],
            ["默认口径", "全部已命中标签均参与加总（不限于关注标签）"],
        ],
    )

    doc.add_heading("4.4 规则三-A：意向度「按权重分」", level=2)
    add_flow(
        doc,
        "判定流程（每期配置三个阈值）：",
        [
            "已得【意向分】",
            "  → 总分 ≥ 高意向阈值？ ─是→ 高",
            "  → 否：总分 ≥ 中意向阈值？ ─是→ 中",
            "  → 否：总分 ≥ 低意向阈值？ ─是→ 低",
            "  → 否：未分级",
        ],
    )
    add_table(doc, ["档位", "配置示例"], [["高意向", "≥ 70"], ["中意向", "≥ 45"], ["低意向", "≥ 25"]])

    doc.add_heading("4.5 规则三-B：意向度「按命中标签」", level=2)
    add_flow(
        doc,
        "判定流程（每期配置三组标签组合）：",
        [
            "读学员命中标签集合",
            "  → 满足「高意向」组合（树选标签+任一/全部）？ ─是→ 高",
            "  → 否：满足「中意向」组合？ ─是→ 中",
            "  → 否：满足「低意向」组合？ ─是→ 低",
            "  → 否：未分级",
            "说明：允许同一标签出现在多档；展示按 高>中>低 优先",
        ],
    )
    doc.add_paragraph("每期意向度统计方式只能二选一：按权重分 或 按命中标签。")

    doc.add_heading("4.6 规则四：会务跟进 + AI 提炼", level=2)
    add_flow(
        doc,
        "实现流程：",
        [
            "【跟进记录菜单】会务填写跟进内容、跟进标签、图片",
            "  → 写入 biz_conference_followup",
            "  → 触发 AI（保存后异步 / 本页「重新分析」）",
            "  → AI 输入：跟进正文 + 学员命中标签",
            "  → 输出：AI权重分(0~25)、短摘要、完整分析",
            "  → 列表「跟进内容」列：仅人工原文（过长 tooltip）",
            "  → 列表「AI提炼分析」列：短摘要（过长 tooltip，独立列）",
            "  → 抽屉分 Tab：会务跟进 | AI提炼分析",
        ],
    )

    # §5
    doc.add_heading("§5 页面与列表设计", level=1)

    doc.add_heading("5.1 页面布局", level=2)
    add_flow(
        doc,
        None,
        [
            "┌────────────────────────────────────────────────────┐",
            "│ 会务信息 + KPI（本期人数/关注命中/高意向/列表数）      │",
            "├─────────────────┬──────────────────────────────────┤",
            "│ 左：本期策略     │ 右：学员列表                       │",
            "│ ① 关注标签      │ 意向分|意向度|标签|跟进|AI|行为…  │",
            "│ ② 意向度方式    │ [查看明细] → 抽屉                  │",
            "│ [保存本期策略]  │                                    │",
            "└─────────────────┴──────────────────────────────────┘",
        ],
    )

    doc.add_heading("5.2 列表字段", level=2)
    add_table(
        doc,
        ["列名", "数据来源", "说明"],
        [
            ["学员", "会务名单", "姓名、会员ID、手机脱敏"],
            ["意向分", "标签+AI", "§4.3，固定公式"],
            ["意向度", "策略配置", "§4.4 或 §4.5 二选一"],
            ["命中标签", "标签快照", "Chip展示"],
            ["跟进内容", "跟进记录", "人工录入"],
            ["AI提炼分析", "AI结果", "独立列"],
            ["社区/学习/视频", "行为聚合", "摘要+tooltip"],
            ["操作", "—", "查看明细"],
        ],
    )

    doc.add_heading("5.3 明细抽屉 Tab", level=2)
    add_table(
        doc,
        ["Tab", "内容"],
        [
            ["标签命中", "命中清单、权重贡献"],
            ["会务跟进", "仅人工跟进记录"],
            ["AI提炼分析", "AI分、全文、重新分析"],
            ["社区/学习/视频", "行为明细只读"],
        ],
    )

    # §6
    doc.add_heading("§6 系统边界与分期", level=1)
    doc.add_heading("6.1 本方案不做", level=2)
    add_bullets(
        doc,
        [
            "会务页配置/修改标签规则、数据源、计算任务",
            "会务页展示或切换标签快照版本",
            "秒级实时画像（默认批处理）",
            "替代学员信息/报读记录/跟进记录的维护",
            "一期不做：导出、企微、分组座位联动",
        ],
    )
    doc.add_heading("6.2 分期", level=2)
    add_table(
        doc,
        ["阶段", "交付内容"],
        [
            ["P0", "新菜单+本期策略+列表+抽屉+跟进/AI分列+意向度二选一"],
            ["P1", "导出、跳转跟进记录"],
            ["P2", "企微、分组/会销联动"],
        ],
    )

    # §7
    doc.add_heading("§7 方案确认清单", level=1)
    add_table(
        doc,
        ["序号", "确认点", "结论"],
        [
            ["1", "入口", "课程会务详情 → 学员意向分析"],
            ["2", "标签范围", "全平台计算；会务=本期学员∩命中"],
            ["3", "关注标签", "一级/二级树 + 任一/全部"],
            ["4", "意向分", "标签权重 + AI分(≤25)"],
            ["5", "意向度", "二选一：权重分阈值 或 命中标签组合"],
            ["6", "跟进与AI", "分列展示；过长用tooltip"],
            ["7", "行为摘要", "社区/学习/视频与标签并重"],
            ["8", "版本", "会务不展示标签快照版本"],
            ["9", "操作", "查看明细"],
        ],
    )

    doc.add_heading("待业务拍板（可选）", level=2)
    add_table(
        doc,
        ["议题", "当前默认"],
        [
            ["意向分累加范围", "全部已命中标签均累加"],
            ["无跟进时AI分", "可仅依标签给低分"],
            ["子菜单名称", "学员意向分析"],
        ],
    )

    doc.add_heading("附件", level=1)
    add_table(
        doc,
        ["文档", "路径"],
        [
            ["方案稿 Markdown", "docs/course-student-intent/CONFIRMATION.md"],
            ["技术详设", "docs/course-student-intent/DESIGN.md"],
            ["交互原型", "6q-conference-prototype/conference-student-intent.html"],
        ],
    )

    doc.add_paragraph()
    p = doc.add_paragraph("—— 请审阅后回复「确认」或标注修改章节 ——")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.save(OUT)
    print(f"已生成: {OUT}")


if __name__ == "__main__":
    main()
