# -*- coding: utf-8 -*-
"""将余炜烽5月1.1版绩效迁移至V1.2主管/职员模板"""
import shutil
from datetime import datetime
import os
import tempfile
import openpyxl

TEMPLATE = r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q-VV部V月度绩效考核表1.2版（VVV）(4)(2).xlsx"
_ts = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT = os.path.join(tempfile.gettempdir(), f"6Q_perf_yuwf_{_ts}.xlsx")
DESKTOP_OUTPUT = rf"C:\Users\Lenovo\Desktop\6Q-信息部5月度绩效考核表1.2版（余炜烽）_{_ts}.xlsx"
TARGET_SHEET = "月度绩效V1.2版-（主管 职员）"

# 从旧表提取的数据
HEADER = {
    "title": "2026年5月月度绩效考核表1.2版（信息部-余炜烽）-员工/主管适用",
    "info": "姓名：余炜烽              部门：信息部              岗位：C端产品主管              评价人：陈秋香              考核期： 2026年5月              填写日期：2026.05.28",
}

# 本月核心指标 (原1.1版 R5-R7)
CORE_ROWS = [
    {
        "row": 5,
        "C": "宏象系统规划与建设管理",
        "D": "业务管理系统功能迭代\n①完成《2026夏令营信息化功能开发》；\n②完成《领袖营导师营前磨课安排与排课管理1.0》；\n③完成《6Q官网门户1.0》；\n④完成《平台运营管理与活动开发项目》;",
        "E": 0.17,
        "F": "根据项目进度的匹配情况提分：\n①匹配度=100%，则20分；\n②90%≤匹配度＜100%：15分；\n③80%≤匹配度＜90%：12分；\n③70%≤匹配度＜80%：10分；\n③度匹配＜70%：0分；",
        "G": "KR1：100%完成《2026夏令营信息化功能开发》原型工作；\nKR2：100%完成平台活动的原型工作（砍价活动）；\nKR3：100%完成《领袖营导师营前磨课安排与排课管理1.0》的验收与上线工作；\nKR4：100%完成《6Q门户官网1.0》的验收与上线工作；",
        "H": 20,
    },
    {
        "row": 6,
        "D": "业务管理系统新增业务\n①完成《2026夏令营信息化功能开发》产品工作；\n②完成《领袖营导师营前磨课安排与排课管理1.0》上线；\n③完成《6Q官网门户1.0》上线；\n④完成《导学师1.0》原型工作；\n⑤完成《平台运营管理与活动开发项目》上线;",
        "E": 0.255,
        "F": "按匹配项目进度情况进行评分：\n①匹配度=100%，则30分；\n②90%≤匹配度＜100%：25分；\n③80%≤匹配度＜90%：20分；\n③70%≤匹配度＜80%：15分；\n③度匹配＜70%：0分；",
        "G": "KR1：100%《领袖营导师营前磨课安排与排课管理1.0》导师培训与上线工作；\nKR2：100%完成《平台运营管理与活动开发项目》业务方验收与上线工作；\nKR3：100%完成《领袖营信息化2026年冬令营版本》产品与测试工作。\nKR4：100%完成《6Q官网门户1.0》上线工作\nKR5：100%完成《导学师1.0》原型工作（原型，岗位工作推进图，产品框架图，产品商业规划图，产品功能迭代规划，竞品分析文档）",
        "H": 30,
    },
    {
        "row": 7,
        "D": "内部管理系统功能迭代\n①《6Q经营管理驾驶舱2.0》\n②《内部管理平台调优》",
        "E": 0.2125,
        "F": "根据项目任务完成进度得分：\n①完成率100%，得25分；\n②90%≤完成率＜100%，得22分；\n③80%≤完成率＜90%，得20分；\n④完成率＜80%，则18分；",
        "G": "KR1：完成驾驶舱使用过程中调优需求沟通1次，原型设计工作 5+张；\nKR2：100%完成《内部管理平台调优版本第二版本》需求与原型工作",
        "H": 25,
    },
]

REGULAR_ROWS = [
    {
        "row": 8,
        "C": "其他战略性项目",
        "D": "AI应用开发项目\n①配合完成招标工作；\n②完成《6Q数字人项目1.0》；\n③完成《领袖营AI助手1.0》；\n④完成《总导师AI问答1.0》；\n⑤完成《AI导学师1.0》\n⑥完成《AI机器人购买与分析》",
        "E": 0.2125,
        "F": "根据项目任务完成进度得分：\n①完成率100%，得25分；\n②90%≤完成率＜100%，得20分；\n③80%≤完成率＜90%，得15分；\n④70%≤完成率＜80%，得12分；\n⑤60%≤完成率＜70%，得10分；\n⑥完成率＜60%，则0分。",
        "G": "KR1：完成《6Q数字人项目1.0》验收工作；\nKR2：完成《领袖营AI助手1.0》验收工作；\nKR3：完成《总导师AI问答1.0》开发工作；\nKR4：完成《AI导学师1.0》的需求、原型与UI设计工作。\nKR5：完成《AI机器人购买与分析》的需求调研，采购方案以及协助采购工作",
        "H": 25,
    },
]

# 行为态度自评分（用户确认）
BEHAVIOR_SCORES = {10: 4, 11: 4, 12: 4, 13: 3}
BONUS_ROW = {
    "row": 14,
    "C": "加分项（特殊价值贡献）",
    "F": "AI工程化岗位工作",
    "H": 10,
}
DEDUCT_ROW = {
    "row": 15,
    "C": "减分项（差错与失误）",
    "F": "（事项说明）",
}


def fill_row_data(ws, spec):
    r = spec["row"]
    col_map = {"B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9}
    for col_name, col_idx in col_map.items():
        if col_name in spec:
            ws.cell(row=r, column=col_idx, value=spec[col_name])


def main():
    wb = openpyxl.load_workbook(TEMPLATE)
    ws = wb[TARGET_SHEET]

    # 标题与基本信息
    ws["A1"] = HEADER["title"]
    ws["A2"] = HEADER["info"]

    # 清除核心/常规示例内容 (rows 5-9)
    for r in range(5, 10):
        for col in [3, 4, 5, 6, 7, 8, 9]:
            cell = ws.cell(row=r, column=col)
            if not (isinstance(cell.value, str) and cell.value.startswith("=")):
                cell.value = None
    ws["B5"] = None
    ws["B8"] = None

    # 填充核心指标
    for spec in CORE_ROWS:
        fill_row_data(ws, spec)
    ws["B5"] = "本月核心\n绩效指标\n（68.25%）"
    ws["B8"] = "本月常规\n绩效指标\n（21.25%）\n\n\n\n\n\nV%+X%=85%"

    # 填充常规指标
    for spec in REGULAR_ROWS:
        fill_row_data(ws, spec)

    # 清空第9行常规指标示例（旧表无第5项）
    for col in range(3, 10):
        ws.cell(row=9, column=col, value=None)

    # 加减分
    fill_row_data(ws, BONUS_ROW)
    fill_row_data(ws, DEDUCT_ROW)
    ws["I14"] = None
    ws["H15"] = None
    ws["I15"] = None

    # 行为态度指标自评分
    for r, score in BEHAVIOR_SCORES.items():
        ws.cell(row=r, column=8, value=score)
        ws.cell(row=r, column=9, value=None)  # 上级评分待填
        ws.cell(row=r, column=7, value=None)

    # 清除下月目标示例 (rows 22-24) - 旧表无此部分
    for r in range(22, 25):
        for col in range(3, 12):
            cell = ws.cell(row=r, column=col)
            if cell.value and not (isinstance(cell.value, str) and cell.value.startswith("=")):
                cell.value = None

    wb.save(OUTPUT)
    wb.close()
    try:
        shutil.copy2(OUTPUT, DESKTOP_OUTPUT)
        print(f"已复制到桌面: {DESKTOP_OUTPUT}")
    except PermissionError:
        print(f"桌面写入失败（文件可能已打开），请从以下路径查看: {OUTPUT}")
    print(f"已保存: {OUTPUT}")


if __name__ == "__main__":
    main()
