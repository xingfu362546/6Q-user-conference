#!/usr/bin/env python3
"""
本地 Office/PDF → Markdown 转换 + 知识库友好后处理。

用法:
  python convert_to_md.py 源文件或目录 [-o 输出目录]
  python convert_to_md.py --fix-md 已有.md [-o 输出目录]
  python convert_to_md.py --batch input [--output output]
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from md_normalize import normalize_markdown

OFFICE_EXT = {".docx", ".xlsx", ".xls", ".pptx", ".ppt"}
PDF_EXT = {".pdf"}
MD_EXT = {".md", ".markdown"}
ALL_INPUT_EXT = OFFICE_EXT | PDF_EXT | MD_EXT


def _ensure_markitdown() -> None:
    try:
        import markitdown  # noqa: F401
    except ImportError:
        print("Office 转换需要: pip install 'markitdown[all]'", file=sys.stderr)
        sys.exit(1)


def _ensure_pymupdf() -> None:
    try:
        import fitz  # noqa: F401
    except ImportError:
        print("PDF 转换需要: pip install pymupdf", file=sys.stderr)
        sys.exit(1)


def _convert_office(src: Path, out_md: Path) -> str:
    from markitdown import MarkItDown

    converter = MarkItDown()
    result = converter.convert(str(src))
    text = result.text_content or ""
    out_md.parent.mkdir(parents=True, exist_ok=True)
    return text


def _convert_pdf(src: Path, out_md: Path) -> str:
    try:
        import fitz
    except ImportError:
        print("PDF 需要 pymupdf: pip install pymupdf", file=sys.stderr)
        sys.exit(1)

    doc = fitz.open(src)
    parts: list[str] = []
    for i, page in enumerate(doc):
        t = page.get_text("text").strip()
        if t:
            parts.append(f"## 第 {i + 1} 页\n\n{t}")
    doc.close()
    if not parts:
        return (
            f"# {src.stem}\n\n"
            "> 未能从 PDF 提取文本（可能是扫描版）。请 OCR 后再转换。\n"
        )
    return "\n\n".join(parts)


def _mirror_output_path(src: Path, input_root: Path, output_root: Path) -> Path:
    try:
        rel = src.relative_to(input_root)
    except ValueError:
        rel = Path(src.name)
    return output_root / rel.with_suffix(".md")


def _copy_assets_near_source(src: Path, dest_md: Path) -> None:
    """若同目录有图片等资源，复制到 .assets 并尽量修正 md 内引用。"""
    parent = src.parent
    assets_dir = dest_md.with_suffix(".assets")
    copied = False
    for pattern in ("*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.emf"):
        for img in parent.glob(pattern):
            assets_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(img, assets_dir / img.name)
            copied = True
    if copied and dest_md.exists():
        text = dest_md.read_text(encoding="utf-8", errors="replace")
        for img in assets_dir.iterdir():
            text = text.replace(f"]({img.name})", f"]({assets_dir.name}/{img.name})")
            text = text.replace(f"({img.name})", f"({assets_dir.name}/{img.name})")
        dest_md.write_text(text, encoding="utf-8", newline="\n")


def process_one(
    src: Path,
    dest_md: Path,
    *,
    fix_only: bool = False,
) -> dict:
    dest_md.parent.mkdir(parents=True, exist_ok=True)
    meta: dict = {"source": str(src), "output": str(dest_md)}

    if src.suffix.lower() in MD_EXT:
        raw = src.read_text(encoding="utf-8", errors="replace")
        meta["mode"] = "fix-md" if fix_only else "md-normalize"
    elif src.suffix.lower() in OFFICE_EXT:
        raw = _convert_office(src, dest_md)
        meta["mode"] = "markitdown"
        _copy_assets_near_source(src, dest_md)
    elif src.suffix.lower() in PDF_EXT:
        raw = _convert_pdf(src, dest_md)
        meta["mode"] = "pymupdf"
    else:
        raise ValueError(f"不支持的文件类型: {src.suffix}")

    norm = normalize_markdown(raw)
    dest_md.write_text(norm.text, encoding="utf-8", newline="\n")
    if norm.warnings:
        meta_path = dest_md.with_suffix(".md.meta.json")
        meta_path.write_text(
            json.dumps({"warnings": norm.warnings}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        meta["warnings"] = norm.warnings
    return meta


def collect_files(path: Path) -> list[Path]:
    if path.is_file():
        return [path] if path.suffix.lower() in ALL_INPUT_EXT else []
    files: list[Path] = []
    for ext in ALL_INPUT_EXT:
        files.extend(path.rglob(f"*{ext}"))
    return sorted(files)


def main() -> None:
    parser = argparse.ArgumentParser(description="Office/PDF → Markdown（知识库友好）")
    parser.add_argument(
        "input",
        nargs="?",
        type=Path,
        help="源文件或目录；省略时使用 --batch 的 input 目录",
    )
    parser.add_argument("-o", "--output", type=Path, help="输出目录（镜像子目录结构）")
    parser.add_argument(
        "--fix-md",
        action="store_true",
        help="仅对已有 .md 做后处理，不重新转换",
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="批量模式：从 tools/md-converter/input 读到 output",
    )
    args = parser.parse_args()

    tool_dir = Path(__file__).resolve().parent
    default_in = tool_dir / "input"
    default_out = tool_dir / "output"

    if args.batch:
        input_root = args.input or default_in
        output_root = args.output or default_out
    else:
        if not args.input:
            parser.error("请指定 input 文件/目录，或使用 --batch")
        input_root = args.input
        output_root = args.output or (
            default_out if input_root.is_dir() else Path.cwd()
        )

    files_preview = collect_files(input_root)
    need_office = any(p.suffix.lower() in OFFICE_EXT for p in files_preview)
    need_pdf = any(p.suffix.lower() in PDF_EXT for p in files_preview)
    if need_office and not args.fix_md:
        _ensure_markitdown()
    if need_pdf and not args.fix_md:
        _ensure_pymupdf()

    input_root = input_root.resolve()
    output_root = output_root.resolve()

    if input_root.is_file():
        files = [input_root]
        mirror_root = input_root.parent
    else:
        files = collect_files(input_root)
        mirror_root = input_root

    if not files:
        print(f"未找到可处理文件: {input_root}")
        sys.exit(1)

    results: list[dict] = []
    for src in files:
        dest = _mirror_output_path(src, mirror_root, output_root)
        try:
            meta = process_one(src, dest, fix_only=args.fix_md)
            results.append(meta)
            print(f"OK  {src} -> {dest}")
        except Exception as e:
            print(f"ERR {src}: {e}", file=sys.stderr)

    summary_path = output_root / "_convert_summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n完成 {len(results)}/{len(files)} 个文件，摘要: {summary_path}")


if __name__ == "__main__":
    main()
