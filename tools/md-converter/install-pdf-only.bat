@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 仅安装 PDF 转换依赖（体积小，不含 Office）
python -m pip install pymupdf -q
echo 完成。仅支持 .pdf 与 .md 后处理。
pause
