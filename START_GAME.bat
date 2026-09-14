@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
 py -3 serve_game.py
) else (
 python serve_game.py
)
pause
