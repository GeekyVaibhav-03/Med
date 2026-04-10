@echo off
echo Starting MedWatch Application...
echo.

REM Kill any existing processes on ports 5000 and 4002
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4002" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend Server
echo Starting Backend Server on port 5000...
start "MedWatch Backend" cmd /k "cd /d %~dp0server && node server.js"
timeout /t 3 /nobreak >nul

REM Start Frontend Dev Server
echo Starting Frontend Dev Server on port 4002...
start "MedWatch Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo MedWatch Application is starting...
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:4002
echo ========================================
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:4002
