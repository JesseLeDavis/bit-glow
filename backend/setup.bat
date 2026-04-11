@echo off
REM BitGlow Backend Setup Script (Windows)
REM This script helps you quickly set up the backend for development

echo ================================================
echo   BitGlow Backend Setup
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo √ Node.js version:
node --version
echo √ npm version:
npm --version
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo √ .env file created
    echo.
    echo WARNING: Edit the .env file and add your email settings!
    echo.
) else (
    echo √ .env file already exists
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo √ Dependencies installed successfully
    echo.
) else (
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Edit .env file with your email settings
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Test the backend:
echo    curl http://localhost:3000/health
echo.
echo For deployment to Hostinger, see:
echo    HOSTINGER_DEPLOYMENT.md
echo.
echo ================================================
pause
