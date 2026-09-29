@echo off
title DEPTHWIZARD AI - Live Public Server Launcher
echo ====================================================================
echo                 DEPTHWIZARD AI - TEAM PARALLAX
echo        Single-View Height Estimation ^& 3D Flythrough
echo ====================================================================
echo.

echo [Cleaning up any previous instances...]
taskkill /F /IM cloudflared.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak > nul

echo.
echo [1/2] Starting Unified Server (Production React App + AI Backend)...
start "DepthWizard-Backend" /min cmd /c "cd /d "%~dp0backend" && uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Public Cloudflare HTTPS Tunnel...
echo.
echo Keep this window open while your laptop is running.
echo Your public link will appear below (look for the https://*.trycloudflare.com URL):
echo ====================================================================
cd /d "%~dp0"
.\cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
