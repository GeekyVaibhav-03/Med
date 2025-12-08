# ==============================================================================
# LAB REPORT SYSTEM - QUICK SETUP SCRIPT (Windows PowerShell)
# ==============================================================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Lab Report System Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Check Prerequisites
Write-Host "`n[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check MySQL
try {
    $mysqlVersion = mysql --version
    Write-Host "  ✓ MySQL installed" -ForegroundColor Green
} catch {
    Write-Host "  ✗ MySQL not found. Please install MySQL 8.0+" -ForegroundColor Red
    exit 1
}

# Check Redis (optional)
try {
    redis-cli ping | Out-Null
    Write-Host "  ✓ Redis running" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Redis not running (notifications will use mock mode)" -ForegroundColor Yellow
}

# Step 2: Install Dependencies
Write-Host "`n[2/6] Installing Node dependencies..." -ForegroundColor Yellow
npm install express mysql2 express-validator ioredis ws axios
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# Step 3: Setup Database
Write-Host "`n[3/6] Setting up database..." -ForegroundColor Yellow
Write-Host "  Please enter MySQL root password:" -ForegroundColor Cyan
$dbPassword = Read-Host -AsSecureString
$dbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Create database
Write-Host "  Creating database..." -ForegroundColor Yellow
$createDbCommand = "CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo $createDbCommand | mysql -u root -p$dbPasswordPlain

# Import schema
Write-Host "  Importing schema..." -ForegroundColor Yellow
mysql -u root -p$dbPasswordPlain hospital_db < database/lab-reports-schema.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Database setup complete" -ForegroundColor Green
} else {
    Write-Host "  ✗ Database setup failed" -ForegroundColor Red
    exit 1
}

# Step 4: Configure Environment
Write-Host "`n[4/6] Creating .env file..." -ForegroundColor Yellow

$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$dbPasswordPlain
DB_NAME=hospital_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=$(New-Guid)

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/medwatch

# Firebase (optional - for push notifications)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "  ✓ .env file created" -ForegroundColor Green

# Step 5: Verify Installation
Write-Host "`n[5/6] Verifying installation..." -ForegroundColor Yellow

$verifyQuery = "SELECT COUNT(*) as count FROM mdr_list;"
$mdrCount = mysql -u root -p$dbPasswordPlain hospital_db -N -e $verifyQuery

Write-Host "  ✓ MDR organisms in database: $mdrCount" -ForegroundColor Green

# Step 6: Done
Write-Host "`n[6/6] Setup complete!" -ForegroundColor Green
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. Start the API server:" -ForegroundColor White
Write-Host "   node server.js" -ForegroundColor Yellow
Write-Host "`n2. Start the notification worker (separate terminal):" -ForegroundColor White
Write-Host "   node src/workers/notificationWorker.js" -ForegroundColor Yellow
Write-Host "`n3. Run tests:" -ForegroundColor White
Write-Host "   node tests/lab-report-tests.js" -ForegroundColor Yellow
Write-Host "`n4. Read the documentation:" -ForegroundColor White
Write-Host "   LAB-REPORT-SYSTEM-README.md" -ForegroundColor Yellow
Write-Host "`nSystem ready! 🎉" -ForegroundColor Green
