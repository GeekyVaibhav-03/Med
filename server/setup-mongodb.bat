@echo off
echo ========================================
echo MedWatch MongoDB Setup
echo ========================================
echo.

echo [1/4] Checking MongoDB...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB not found! Please install MongoDB first.
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)
echo [OK] MongoDB found

echo.
echo [2/4] Starting MongoDB service...
net start MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB service started
) else (
    echo [INFO] MongoDB service already running or needs manual start
)

echo.
echo [3/4] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo [4/4] Seeding database...
node scripts/seedMongoDB.js
if %errorlevel% neq 0 (
    echo [ERROR] Database seeding failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the server:
echo   node server-mongo.js
echo.
echo Or with nodemon:
echo   nodemon server-mongo.js
echo.
echo Default login credentials:
echo   Username: admin1
echo   Password: admin123
echo.
pause
