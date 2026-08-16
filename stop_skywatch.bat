@echo off
title SkyWatch Shutdown Sequence
echo ===================================================
echo [SkyWatch] Shutting down all background services...
echo ===================================================

echo [*] Terminating Node.js processes...
taskkill /F /IM node.exe 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5050" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo [*] Terminating Edge-AI Python processes...
taskkill /F /IM python.exe 2>nul

echo ===================================================
echo [SkyWatch] All systems offline.
echo ===================================================
timeout /t 3 /nobreak >nul
exit
