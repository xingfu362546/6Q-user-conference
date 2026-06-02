"""
Markdown 后处理：修复 Word/PDF/PPT 导出导致的换行与分块问题。
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path


# 常见页眉 Slogan（可按需扩展）
_DEFAULT_HEADER_PATTERNS = [
    re.compile(r"^角色亮清[、,，]?6Q\s*三赢[、,，]?精益求精！?$"),
    re.compile(r"^角色亮清，6Q三赢，精益求精！$"),
]

# 中文章节标题：一、二、三、…
_CHAPTER_RE = re.compile(r"^([一二三四五六七八九十百千]+)[、．.](.+)$")
# 封面/元数据行：不与正文合并
_META_LINE_RE = re.compile(
    r"^(修订记录|编制|审核|批准|日期|内部★|广州六马|六马-|V\d|《青少年)"
)
# 数字小节：1、 1. 1)
_NUM_SECTION_RE = re.compile(r"^(\d{1,2})[、．.)]\s*(.+)$")
_SENTENCE_END = re.compile(r"[。！？；：」》）\.\!\?\"']\s*$")
_SLIDE_COMMENT_RE = re.compile(r"<!--\s*Slide number:\s*(\d+)\s*-->", re.I)


@dataclass
class NormalizeResult:
    text: str
    warnings: list[str] = field(default_factory=list)


def _is_page_number_line(line: str) -> bool:
    s = line.strip()
    return bool(re.fullmatch(r"\d{1,3}", s))


def _is_header_slogan(line: str, extra_patterns: list[re.Pattern[str]] | None = None) -> bool:
    s = line.strip()
    if not s:
        return False
    patterns = _DEFAULT_HEADER_PATTERNS + (extra_patterns or [])
    return any(p.match(s) for p in patterns)


def _is_short_numbered_item(line: str) -> bool:
    """仅短编号行视为边界（如「1、以正向激励为主」），长段编号句可与下文合并。"""
    s = line.strip()
    m = _NUM_SECTION_RE.match(s)
    if not m:
        return False
    body = m.group(2).strip()
    return len(body) < 28


def _is_special_line(line: str) -> bool:
    """不应与上一行合并的行。"""
    s = line.strip()
    if not s:
        return True
    if s.startswith("#"):
        return True
    if _SLIDE_COMMENT_RE.match(s):
        return True
    if s.startswith("!["):
        return True
    if s.startswith("|") and "|" in s[1:]:
        return True
    if re.match(r"^[-*+]\s", s):
        return True
    if _CHAPTER_RE.match(s):
        return True
    if _is_short_numbered_item(line):
        return True
    if _is_page_number_line(s):
        return True
    if _is_header_slogan(s):
        return True
    if _META_LINE_RE.match(s):
        return True
    return False


def _should_merge(prev: str, curr: str) -> bool:
    """规则 1：合并被硬拆开的段落行。"""
    p, c = prev.rstrip(), curr.strip()
    if not p or not c:
        return False
    # 元数据/标题行不与后续正文粘在一起
    if _is_special_line(prev):
        return False
    if _CHAPTER_RE.match(c) or c.startswith("#"):
        return False
    if _is_header_slogan(c) or _is_page_number_line(c):
        return False
    # 上一行是 ## 章节标题：不合并下文
    if p.lstrip().startswith("##") and _CHAPTER_RE.match(p.lstrip().lstrip("#").strip()):
        return False
    # 当前为短编号条目开头 → 新段落
    if _is_short_numbered_item(curr):
        return False
    # 上一行已句末结束 → 通常不合并，除非当前是明显续行（如以「营》」接「领袖」）
    if _SENTENCE_END.search(p):
        if _NUM_SECTION_RE.match(c) and len(c) <= 48:
            return False
        return False
    # 上一行未句末结束 → 合并（Word/PDF 软换行）
    return True


def _promote_chapter_headings(lines: list[str]) -> list[str]:
    """规则 9：一、二、三 → ## 标题。"""
    out: list[str] = []
    for line in lines:
        s = line.strip()
        m = _CHAPTER_RE.match(s)
        if m and not s.startswith("#"):
            out.append(f"## {m.group(1)}、{m.group(2).strip()}")
        else:
            out.append(line)
    return out


def _promote_slide_comments(lines: list[str]) -> list[str]:
    out: list[str] = []
    for line in lines:
        m = _SLIDE_COMMENT_RE.match(line.strip())
        if m:
            out.append(f"## 幻灯片 {m.group(1)}")
        else:
            out.append(line)
    return out


def _skip_blank_bridge(lines: list[str], start: int) -> int:
    """跳过可桥接合并的空行，返回下一内容行索引。"""
    j = start
    while j < len(lines) and not lines[j].strip():
        j += 1
    return j


def _merge_paragraph_lines(lines: list[str]) -> list[str]:
    if not lines:
        return []
    buf: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            if buf:
                j = _skip_blank_bridge(lines, i + 1)
                if j < len(lines) and _should_merge(buf[-1], lines[j]):
                    i = j
                    continue
            buf.append(line)
            i += 1
            continue
        if not buf:
            buf.append(line.strip())
            i += 1
            continue
        if _should_merge(buf[-1], line):
            buf[-1] = buf[-1].rstrip() + line.strip()
        else:
            buf.append(line.strip())
        i += 1
    return buf


def _reflow_paragraph_breaks(lines: list[str]) -> list[str]:
    """合并后：在完整句末与 ## 标题前插入段落空行，去掉多余空行。"""
    out: list[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if s.startswith("##") and out and out[-1].strip():
            out.append("")
        out.append(s)
        if _SENTENCE_END.search(s) and not s.startswith("##"):
            out.append("")
    # 去掉尾部多余空行
    while out and not out[-1].strip():
        out.pop()
    return out


def _compress_list_blanks(lines: list[str]) -> list[str]:
    """规则 2：列表块内多余空行。"""
    out: list[str] = []
    prev_blank = False
    for line in lines:
        is_list = bool(re.match(r"^(\s*[-*+]|\s*\d+\.)\s", line))
        blank = not line.strip()
        if blank and is_list:
            continue
        if blank and prev_blank:
            continue
        out.append(line)
        prev_blank = blank
    return out


def _ensure_heading_spacing(lines: list[str]) -> list[str]:
    """规则 6：标题上下各留一空行。"""
    out: list[str] = []
    for i, line in enumerate(lines):
        if line.strip().startswith("#"):
            if out and out[-1].strip():
                out.append("")
            out.append(line)
            nxt = lines[i + 1] if i + 1 < len(lines) else ""
            if nxt.strip():
                out.append("")
        else:
            out.append(line)
    return out


def _strip_soft_breaks(lines: list[str]) -> list[str]:
    """规则 5：去掉无意义行末续行符。"""
    return [re.sub(r"\\\s*$", "", ln.rstrip()) for ln in lines]


def _check_heading_hierarchy(lines: list[str], warnings: list[str]) -> None:
    """规则 7：标题层级跳跃仅告警。"""
    levels: list[int] = []
    for i, line in enumerate(lines, 1):
        m = re.match(r"^(#{1,6})\s", line.strip())
        if not m:
            continue
        lv = len(m.group(1))
        if levels and lv > levels[-1] + 1:
            warnings.append(
                f"第 {i} 行标题层级跳跃: {'#' * levels[-1]} → {'#' * lv}"
            )
        levels.append(lv)


def _try_merge_table_fragments(lines: list[str], warnings: list[str]) -> list[str]:
    """
    规则 3（保守）：连续短行且像表格碎片时，用「 | 」拼成一行并标注。
    不强行还原复杂表格。
    """
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        # 检测竖排表头块：连续 3+ 行，每行 < 40 字，无句号
        if (
            s
            and len(s) < 40
            and "。" not in s
            and not s.startswith("#")
            and not _CHAPTER_RE.match(s)
        ):
            block = [s]
            j = i + 1
            while j < len(lines):
                t = lines[j].strip()
                if not t or len(t) > 60 or "。" in t or t.startswith("#"):
                    break
                if _CHAPTER_RE.match(t) or _NUM_SECTION_RE.match(t):
                    break
                block.append(t)
                j += 1
            if len(block) >= 4:
                warnings.append(
                    f"第 {i + 1} 行起检测到疑似竖排表格（{len(block)} 行），已合并为单行"
                )
                out.append("| " + " | ".join(block) + " |")
                out.append("<!-- table-fix-needed: 请人工核对表格结构 -->")
                i = j
                continue
        out.append(line)
        i += 1
    return out


def normalize_markdown(
    text: str,
    *,
    extra_header_patterns: list[str] | None = None,
) -> NormalizeResult:
    warnings: list[str] = []
    extra_re = (
        [re.compile(p) for p in extra_header_patterns] if extra_header_patterns else None
    )

    # 规则 4：统一换行、去 BOM、去 \f
    text = text.replace("\ufeff", "").replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\f", "\n\n")

    lines = text.split("\n")
    cleaned: list[str] = []
    for line in lines:
        # 规则 4：行尾空白
        line = line.rstrip()
        s = line.strip()
        if _is_page_number_line(s):
            continue
        if _is_header_slogan(s, extra_re):
            continue
        cleaned.append(line)

    cleaned = _promote_slide_comments(cleaned)
    cleaned = _promote_chapter_headings(cleaned)
    cleaned = _merge_paragraph_lines(cleaned)
    cleaned = _strip_soft_breaks(cleaned)
    cleaned = _reflow_paragraph_breaks(cleaned)
    cleaned = _compress_list_blanks(cleaned)
    cleaned = _try_merge_table_fragments(cleaned, warnings)
    cleaned = _ensure_heading_spacing(cleaned)

    result_lines: list[str] = []
    blank_run = 0
    for line in cleaned:
        if not line.strip():
            blank_run += 1
            if blank_run <= 1:
                result_lines.append("")
        else:
            blank_run = 0
            result_lines.append(line)

    _check_heading_hierarchy(result_lines, warnings)
    return NormalizeResult(text="\n".join(result_lines).strip() + "\n", warnings=warnings)


def normalize_file(path: Path, output_path: Path | None = None) -> NormalizeResult:
    raw = path.read_text(encoding="utf-8", errors="replace")
    result = normalize_markdown(raw)
    dest = output_path or path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(result.text, encoding="utf-8", newline="\n")
    if result.warnings:
        meta_path = dest.with_suffix(dest.suffix + ".meta.json")
        meta_path.write_text(
            json.dumps({"warnings": result.warnings}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    return result
