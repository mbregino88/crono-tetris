@echo off
echo Starting Fresh Kanban Application...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available.
    echo Please make sure Node.js is properly installed.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: Check for environment file
if not exist ".env.local" (
    echo WARNING: .env.local file not found.
    echo Please create .env.local with your Supabase configuration.
    echo See README.md for details.
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

:: Build and start the application
echo Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed. Check the output above for errors.
    pause
    exit /b 1
)

echo Starting production server...
echo Application will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.

call npm start

pause