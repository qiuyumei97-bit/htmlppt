@echo off
chcp 65001 >nul
echo ====================================
echo   课件索引生成器
echo ====================================
echo.
cd /d "%~dp0"
python generate.py
echo.
pause
