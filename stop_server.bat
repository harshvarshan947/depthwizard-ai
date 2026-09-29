@echo off
title DepthWizard AI - Process Terminator
echo ====================================================================
echo             DEPTHWIZARD AI - STOPPING ALL PROCESSES
echo ====================================================================
echo.
echo Stopping Cloudflare tunnel...
taskkill /F /IM cloudflared.exe >nul 2>&1

echo Freeing port 8000 (Backend / Frontend Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [DONE] All DepthWizard AI servers have been stopped.
echo You can now run start_public_live.bat whenever you want to restart.
echo ====================================================================
timeout /t 3
