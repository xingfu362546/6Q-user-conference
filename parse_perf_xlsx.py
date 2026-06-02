# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.utils import get_column_letter
import os
import json

files = {
    "new_template": r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q-VV部V月度绩效考核表1.2版（VVV）(4)(2).xlsx",
    "old_data": r"d:\wechatFile\xwechat_files\wxid_wrdi6300otls12_0f21\msg\file\2026-05\6Q-信息部5月度绩效考核表1.1版（余炜烽）.xlsx",
}

output = {}

for name, path in files.items():
    info = {"path": path, "exists": os.path.exists(path), "sheets": {}}
    if not os.path.exists(path):
        output[name] = info
        continue

    wb = openpyxl.load_workbook(path, data_only=False)
    info["sheetnames"] = wb.sheetnames

    for sn in wb.sheetnames:
        ws = wb[sn]
        sheet_info = {
            "dimensions": ws.dimensions,
            "max_row": ws.max_row,
            "max_col": ws.max_column,
            "cells": [],
            "merged_ranges": [str(m) for m in ws.merged_cells.ranges],
        }
        for row in ws.iter_rows(
            min_row=1,
            max_row=ws.max_row,
            min_col=1,
            max_col=ws.max_column,
        ):
            for c in row:
                if c.value is not None:
                    entry = {"addr": c.coordinate, "row": c.row, "col": c.column}
                    if isinstance(c.value, str) and c.value.startswith("="):
                        entry["type"] = "formula"
                        entry["value"] = c.value
                    else:
                        entry["type"] = "value"
                        entry["value"] = c.value
                    sheet_info["cells"].append(entry)
        info["sheets"][sn] = sheet_info
    wb.close()
    output[name] = info

out_path = r"d:\Cursor\testProject\perf_parse_result.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2, default=str)

print(f"Saved to {out_path}")
for name, info in output.items():
    print(f"\n{'='*60}\n{name}: exists={info['exists']}")
    if not info["exists"]:
        continue
    print(f"Sheets: {info['sheetnames']}")
    for sn, si in info["sheets"].items():
        print(f"  [{sn}] rows={si['max_row']} cols={si['max_col']} cells={len(si['cells'])} merged={len(si['merged_ranges'])}")
