# -*- coding: utf-8 -*-
import json
from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

DOC = Path(r"C:\Users\Lenovo\Desktop\6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx")
SHOTS = Path(r"d:\Cursor\testProject\output\lingxiu-v331-shots")
NOTES = Path(r"d:\Cursor\testProject\_prototype_notes_lingxiu_v331.json")

notes = json.loads(NOTES.read_text(encoding="utf-8"))
shots = sorted(SHOTS.glob("*.png"))

doc = Document(str(DOC))

# 若已有第4章标题则跳过重复（简单检测末段）
body_text = "\n".join(p.text for p in doc.paragraphs[-5:])
if "4.页面-功能清单对应" not in body_text:
    doc.add_page_break()
    h = doc.add_heading("4.页面-功能清单对应与注释（v3.3.1）", level=1)
    doc.add_paragraph(
        f"说明：仅收录 v3.3.1 版本线框页，共 {len(shots)} 页；截图与便签原文如下。"
    )

    table = doc.add_table(rows=1, cols=4)
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, t in enumerate(["页面", "模块路径", "页面注释", "截图"]):
        hdr[i].text = t

    for png in shots:
        key = png.stem
        info = notes.get(key, {})
        row = table.add_row().cells
        row[0].text = key
        row[1].text = info.get("trail", "")
        note = info.get("notes", "（无便签）")
        p = row[2].paragraphs[0]
        p.text = note
        for r in p.runs:
            r.font.size = Pt(9)
        try:
            row[3].paragraphs[0].add_run().add_picture(str(png), width=Inches(2.0))
        except Exception as e:
            row[3].text = f"{png.name}（插图失败: {e}）"

    doc.save(str(DOC))
    print(f"DONE saved {DOC} rows={len(shots)}")
else:
    print("SKIP section 4 already present")
