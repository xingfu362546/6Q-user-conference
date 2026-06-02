@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   MD 转换工具 - 环境安装
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python。请先安装 Python 3.10+ 并勾选 "Add to PATH"
    echo 下载: https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo.
echo 正在安装依赖（首次约 1-3 分钟）...
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [完成] 安装成功。用法:
echo   1. 把文件放进 input 文件夹，双击 run.bat
echo   2. 或: python convert_to_md.py "文件路径" -o "输出目录"
echo.
pause
