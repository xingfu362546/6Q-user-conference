# MD 转换小工具（本地）

将 **docx / xlsx / pptx / pdf** 转为知识库友好的 Markdown，并修复 Word/PPT 导出常见的「一行一句」换行问题。

## 在其他电脑上使用（分发）

### 你需要带过去什么

把整个 **`md-converter`** 文件夹复制到其他电脑即可（U 盘、网盘、微信发 zip 都行）。

**建议打包内容：**

| 必带 | 可选（体积大，不必带） |
|------|------------------------|
| `convert_to_md.py` | `output/` 里历史样例 |
| `md_normalize.py` | |
| `requirements.txt` | |
| `install.bat`、`run.bat` | |
| `input/`、`output/` 空目录 | |

若项目已在 Git 仓库，也可让对方执行：

```powershell
git clone <你的仓库地址>
cd testProject\tools\md-converter
```

### 对方电脑一次性准备

1. 安装 **Python 3.10+**（[python.org](https://www.python.org/downloads/)），安装时勾选 **Add python.exe to PATH**
2. 进入 `md-converter` 文件夹，**双击 `install.bat`**（或 PowerShell 执行 `.\install.bat`）
3. 之后把要转的文件放进 `input/`，双击 **`run.bat`**；结果在 `output/`

**只转 PDF、不转 Word/Excel/PPT 时**：可双击 `install-pdf-only.bat`，只装 `pymupdf`，更轻量。

### 环境要求一览

| 功能 | 依赖 | 说明 |
|------|------|------|
| PDF → MD | `pymupdf` | 纯文字 PDF；扫描版需 OCR |
| docx/xlsx/pptx → MD | `markitdown` | `install.bat` 会一并安装 |
| 只修已有 .md | 无额外依赖 | `python convert_to_md.py --fix-md ...` |
| PPT → PDF（另一步） | 本机 **PowerPoint** | 非本工具内置，需 Office |

### 常见问题

- **`python` 不是内部命令**：重装 Python 并勾选 PATH，或重启终端
- **转换很慢 / 首次失败**：先运行一次 `install.bat`
- **Mac / Linux**：同样复制文件夹，用 `pip install -r requirements.txt`，命令把 `run.bat` 换成 `python convert_to_md.py --batch`

---

## 安装（一次性）

```powershell
cd d:\Cursor\testProject\tools\md-converter
pip install -r requirements.txt
```

## 用法

### 1. 丢进 input 批量转换

把文件放进 `input/`（可含子目录），双击或运行：

```powershell
.\run.bat
```

结果在 `output/`，目录结构与 `input/` 镜像；图片等资源在 `*.assets/`。

### 2. 指定任意路径

```powershell
python convert_to_md.py "D:\docs\办法.docx" -o "D:\知识库\kb"
```

### 3. 只修复已有异常 MD（不重新转 Office）

```powershell
python convert_to_md.py --fix-md "D:\path\broken.md" -o "D:\path\fixed"
```

### 4. 在 Cursor 里说

> 用 md-converter 把 `xxx.docx` 转到 `D:\kb\`，并跑后处理

## 后处理规则

| 规则 | 说明 |
|------|------|
| 1 | 合并被硬拆开的段落 |
| 2 | 压缩列表多余空行 |
| 3 | 保守合并竖排表格碎片（标注需人工核对） |
| 4 | UTF-8、统一 `\n`、去行尾空白 |
| 5 | 去掉无意义 `\` 续行 |
| 6 | 标题上下空行 |
| 7 | 标题层级跳跃 → 仅写入 `.md.meta.json` |
| 8 | 去掉页码行、重复页眉、`` 分页符 |
| 9 | `一、二、三` → `##` 标题；PPT 注释 → `## 幻灯片 N` |

## 引擎

- Office：`markitdown`
- PDF 文字层：`pymupdf`（扫描版会提示需 OCR）
