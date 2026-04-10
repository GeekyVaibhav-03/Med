# Setup Admin Account for MedWatch
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedWatch - Admin Account Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to server directory
Set-Location $PSScriptRoot\server

Write-Host "Creating admin account..." -ForegroundColor Yellow
node create-admin.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run start-app.bat to start the application" -ForegroundColor White
Write-Host "2. Go to http://localhost:4002/login" -ForegroundColor White
Write-Host "3. Click 'Admin/Hospital' tab" -ForegroundColor White
Write-Host "4. Login with:" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Yellow
Write-Host "   Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
