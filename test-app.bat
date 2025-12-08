@echo off
echo ========================================
echo MedWatch Application Startup Script
echo ========================================
echo.

REM Kill all node processes
echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start backend
echo [2/4] Starting Backend Server (Port 5000)...
start "MedWatch Backend" cmd /k "cd /d C:\Users\bhara\Desktop\SIH\server && node server.js"
timeout /t 5 /nobreak >nul

REM Start frontend
echo [3/4] Starting Frontend Server (Port 4000)...
start "MedWatch Frontend" cmd /k "cd /d C:\Users\bhara\Desktop\SIH\client && npm run dev"
timeout /t 3 /nobreak >nul

REM Open browser
echo [4/4] Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:4000

echo.
echo ========================================
echo Application Started Successfully!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:4000
echo.
echo Login Credentials:
echo   Admin:  admin1 / admin123
echo   Doctor: doctor1 / doctor123
echo.
echo Press any key to close this window...
pause >nul
