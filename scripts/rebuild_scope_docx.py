# -*- coding: utf-8 -*-
"""从模板重建可正常用 Word 打开的 docx（避免 PowerShell Compress-Archive 损坏包结构）。"""
import json
import re
import shutil
import zipfile
from pathlib import Path

TEMPLATE = Path(
    r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05"
    r"\6Q宏象系统2026夏令营上半段原型范围说明书.docx"
)
OUT = Path(r"C:\Users\Lenovo\Desktop\6Q宏象系统领袖营v2（3.3.1）2026暑假原型范围说明书.docx")
WORK = Path(r"d:\Cursor\testProject\_scope_rebuild")
FEATURES = Path(r"d:\Cursor\testProject\_features_lingxiu.json")
NOTES = Path(r"d:\Cursor\testProject\_prototype_notes_lingxiu_v331.json")
SHOTS = Path(r"d:\Cursor\testProject\output\lingxiu-v331-shots")

from docx import Document
from docx.shared import Inches, Pt


def esc(s):
    return (
        str(s or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\n+", "；")
    )


def inject_features_xml(doc_xml: str, data: dict) -> str:
    rPr = '<w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="宋体"/><w:sz w:val="24"/></w:rPr>'
    rPrBold = rPr.replace("/>", "/><w:b/>")

    def p_text(text, para_id, bold=False):
        rp = rPrBold if bold else rPr
        return (
            f'<w:p w14:paraId="{para_id}" w14:textId="77777777" w:rsidR="00DE44D7" w:rsidRDefault="00DE44D7">'
            f'<w:pPr><w:ind w:firstLineChars="200" w:firstLine="480"/></w:pPr>'
            f"<w:r>{rp}<w:t>{esc(text)}</w:t></w:r></w:p>"
        )

    def cell(w, text, bold=False):
        rp = rPrBold if bold else rPr
        return (
            f"<w:tc><w:tcPr><w:tcW w:w=\"{w}\" w:type=\"dxa\"/></w:tcPr>"
            f"<w:p><w:r>{rp}<w:t>{esc(text)}</w:t></w:r></w:p></w:tc>"
        )

    intro = p_text(
        f"本节功能清单已根据《{data['title']}》同步，共 {len(data['rows'])} 条；页面对照仅纳入 v3.3.1 线框页。",
        "314F74B7",
    )
    header = (
        "<w:tr>"
        + cell(900, "序号", True)
        + cell(2600, "功能模块（一级/二级/三级）", True)
        + cell(4200, "功能描述", True)
        + cell(2000, "所属团队", True)
        + "</w:tr>"
    )
    body = ""
    for i, row in enumerate(data["rows"]):
        body += (
            "<w:tr>"
            + cell(900, str(row.get("seq") or i + 1))
            + cell(2600, row.get("modulePath", ""))
            + cell(4200, row.get("desc", ""))
            + cell(2000, row.get("remark", ""))
            + "</w:tr>"
        )
    table = (
        "<w:tbl><w:tblPr><w:tblStyle w:val=\"a8\"/></w:tblPr>"
        + header
        + body
        + "</w:tbl>"
    )
    block = intro + table

    start = doc_xml.find('<w:p w14:paraId="314F74B7"')
    if start == -1:
        anchor = doc_xml.find("功能清单</w:t>")
        if anchor < 0:
            anchor = doc_xml.find("薪酬")
        if anchor < 0:
            raise RuntimeError("feature list start not found")
        tbl = doc_xml.find("<w:tbl", anchor)
        start = doc_xml.rfind("<w:p ", 0, tbl if tbl > 0 else anchor)
    end = doc_xml.find('<w:p w14:paraId="47968128"')
    if end == -1:
        raise RuntimeError("feature list end marker 47968128 not found")
    return doc_xml[:start] + block + doc_xml[end:]


def repack_docx(folder: Path, out_path: Path):
    if out_path.exists():
        out_path.unlink()
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fp in sorted(folder.rglob("*")):
            if fp.is_file():
                zf.write(fp, fp.relative_to(folder).as_posix())


def main():
    data = json.loads(FEATURES.read_text(encoding="utf-8"))
    notes = json.loads(NOTES.read_text(encoding="utf-8"))
    shots = sorted(SHOTS.glob("*.png"))

    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)

    with zipfile.ZipFile(TEMPLATE, "r") as z:
        z.extractall(WORK)

    doc_path = WORK / "word" / "document.xml"
    xml = doc_path.read_text(encoding="utf-8")
    xml = xml.replace(
        "宏象系统开发部署项目（领袖营夏令营版本上半）",
        "宏象系统开发部署项目（领袖营 v2 3.3.1 · 2026年暑假信息化）",
    )
    xml = xml.replace("2026年4月25日", "2026年5月25日")
    xml = xml.replace("2026-4-25", "2026-5-25")
    xml = re.sub(
        r"https://axhub\.im/ax9/88b0f37e38b75a4ahttps://axhub\.im/ax9/aec02df773bba5c5",
        "https://axhub.im/ax9/88b0f37e38b75a4a",
        xml,
    )
    xml = inject_features_xml(xml, data)
    doc_path.write_text(xml, encoding="utf-8")

    repack_docx(WORK, OUT)

    doc = Document(str(OUT))
    doc.add_page_break()
    doc.add_heading("4.页面-功能清单对应与注释（v3.3.1）", level=1)
    doc.add_paragraph(f"说明：仅收录 v3.3.1 线框页，共 {len(shots)} 页。")
    table = doc.add_table(rows=1, cols=4)
    table.style = "Table Grid"
    for i, t in enumerate(["页面", "模块路径", "页面注释", "截图"]):
        table.rows[0].cells[i].text = t
    for png in shots:
        key = png.stem
        info = notes.get(key, {})
        row = table.add_row().cells
        row[0].text = key
        row[1].text = info.get("trail", "")
        note = info.get("notes", "（无便签）")
        row[2].paragraphs[0].text = note
        for r in row[2].paragraphs[0].runs:
            r.font.size = Pt(9)
        try:
            row[3].paragraphs[0].add_run().add_picture(str(png), width=Inches(2.0))
        except Exception as ex:
            row[3].text = png.name + f" ({ex})"
    doc.save(str(OUT))
    print("OK", OUT, "size", OUT.stat().st_size)


if __name__ == "__main__":
    main()
