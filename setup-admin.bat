@echo off
echo ========================================
echo MedWatch - Create Admin Account
echo ========================================
echo.

cd /d %~dp0server

echo Checking MongoDB connection...
node create-admin.js

echo.
echo ========================================
echo Script completed!
echo ========================================
pause
