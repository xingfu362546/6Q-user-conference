# -*- coding: utf-8 -*-
import openpyxl
import json
import os

files = {
    "new_template": r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q-VV部V月度绩效考核表1.2版（VVV）(4)(2).xlsx",
    "old_data": r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q-信息部5月度绩效考核表1.1版（余炜烽）.xlsx",
}

def dump_sheet(ws, title):
    lines = [f"\n{'='*70}", f"{title}", f"Sheet: {ws.title}", f"Size: {ws.max_row}x{ws.max_column}", ""]
    # Build grid
    grid = {}
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, min_col=1, max_col=ws.max_column):
        for c in row:
            if c.value is not None:
                grid[(c.row, c.column)] = c
    for r in range(1, ws.max_row + 1):
        row_parts = []
        for col in range(1, ws.max_column + 1):
            c = grid.get((r, col))
            if c:
                v = c.value
                if isinstance(v, str) and v.startswith("="):
                    row_parts.append(f"{c.coordinate}[F]={v}")
                else:
                    s = str(v).replace("\n", " | ")
                    row_parts.append(f"{c.coordinate}={s}")
        if row_parts:
            lines.append(f"R{r}: " + " || ".join(row_parts))
    lines.append(f"\nMerged: {[str(m) for m in ws.merged_cells.ranges]}")
    return "\n".join(lines)

out_lines = []
for name, path in files.items():
    wb = openpyxl.load_workbook(path, data_only=False)
    out_lines.append(f"\n\n{'#'*70}\n# {name}\n# {path}\n# Sheets: {wb.sheetnames}\n")
    for sn in wb.sheetnames:
        out_lines.append(dump_sheet(wb[sn], name))
    wb.close()

out = r"d:\Cursor\testProject\perf_structure_dump.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))
print(f"Written: {out}")
