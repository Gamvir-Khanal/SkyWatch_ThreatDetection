@echo off
title SkyWatch Tactical C2 System — Master Launcher
color 0A

echo.
echo  ===============================================================
echo    SKYWATCH TACTICAL DEFENCE ISR SYSTEM — STARTING ALL MODULES
echo  ===============================================================
echo.

:: ── Check Node.js ────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js not found. Please install from https://nodejs.org
  pause & exit /b 1
)

:: ── Check Python ─────────────────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Python 3 not found. Please install from https://python.org
  pause & exit /b 1
)

echo  [1/3] Starting Backend Gateway ^(Express + Socket.IO^)...
start "SkyWatch BACKEND" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 2 /nobreak >nul

echo  [2/3] Starting Frontend Dashboard ^(React + Vite^)...
start "SkyWatch FRONTEND" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"
timeout /t 2 /nobreak >nul

echo  [3/3] Starting Edge-AI Detector ^(YOLOv8 + OpenCV^)...
start "SkyWatch EDGE-AI" cmd /k "cd /d %~dp0edge-ai && python detector.py"
timeout /t 3 /nobreak >nul

echo.
echo  ===============================================================
echo   ALL SYSTEMS ONLINE — LAUNCHING DASHBOARD IN BROWSER...
echo  ===============================================================
echo.
echo   Backend API  : http://localhost:8080
echo   Dashboard    : http://localhost:3000
echo   Edge-AI Feed : Running locally (drone_feed.mp4)
echo.
echo   Press Ctrl+C in any terminal window to stop a module.
echo  ===============================================================
echo.

:: Open the dashboard in default browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

pause
