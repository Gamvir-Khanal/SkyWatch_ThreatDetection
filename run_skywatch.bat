@echo off
title SkyWatch Command Center Launcher
echo ===================================================
echo [SkyWatch] Initializing Tactical Systems
echo ===================================================

echo [*] Cleaning up stale ports (3000, 5000, 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo [*] Booting Backend Server (Port 8080)...
start "SkyWatch Backend" cmd /c "cd backend && npm run dev"

echo [*] Booting Edge-AI Detector Node...
start "SkyWatch Edge-AI" cmd /c "cd edge-ai && python detector.py --gui"

echo [*] Booting React Tactical Dashboard (Port 3000)...
start "SkyWatch Frontend" cmd /c "cd frontend && npm run dev"

echo [*] Waiting for services to spin up...
timeout /t 5 /nobreak >nul

echo [*] Launching Tactical Dashboard in browser...
start http://localhost:3000

echo ===================================================
echo [SkyWatch] ALL SYSTEMS ONLINE
echo ===================================================
exit
