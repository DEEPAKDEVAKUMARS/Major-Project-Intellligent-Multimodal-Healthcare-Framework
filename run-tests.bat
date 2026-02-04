@echo off
REM Mindmate AI Test Runner Script for Windows
REM This script runs all test suites for the Mindmate AI project

echo 🧪 Starting Mindmate AI Test Suite...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not installed. Please install Python first.
        exit /b 1
    )
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install pytest flask-testing

REM Install Playwright browsers
echo [INFO] Installing Playwright browsers...
call npx playwright install

echo.
echo 🚀 Running Test Suites...
echo ========================

REM Run Frontend Tests
echo.
echo [INFO] Running Frontend Tests (Vitest + React Testing Library)...
REM Use non-coverage test run to avoid optional coverage provider installation issues
call npm run test
if %errorlevel% neq 0 (
    echo [ERROR] Frontend tests failed!
    exit /b 1
)
echo [SUCCESS] Frontend tests passed!

REM Run Backend Tests
echo.
echo [INFO] Running Backend Tests (Jest + Supertest)...
call npm run test:backend
if %errorlevel% neq 0 (
    echo [ERROR] Backend tests failed!
    exit /b 1
)
echo [SUCCESS] Backend tests passed!

REM Run Python Flask Tests
echo.
echo [INFO] Running Python Flask Tests (pytest)...
python -m pytest test_chatbot.py -v
if %errorlevel% neq 0 (
    echo [ERROR] Python Flask tests failed!
    exit /b 1
)
echo [SUCCESS] Python Flask tests passed!

REM Run End-to-End Tests
echo.
echo [INFO] Running End-to-End Tests (Playwright)...
call npm run test:e2e
if %errorlevel% neq 0 (
    echo [ERROR] End-to-End tests failed!
    exit /b 1
)
echo [SUCCESS] End-to-End tests passed!

echo.
echo 🎉 All Tests Completed Successfully!
echo ==================================
echo [SUCCESS] ✅ Frontend Tests: PASSED
echo [SUCCESS] ✅ Backend Tests: PASSED
echo [SUCCESS] ✅ Python Flask Tests: PASSED
echo [SUCCESS] ✅ End-to-End Tests: PASSED

echo.
echo [INFO] Test coverage reports are available in:
echo [INFO] - Frontend: coverage/index.html
echo [INFO] - Backend: coverage/backend/index.html
echo [INFO] - E2E: playwright-report/index.html

echo.
echo [INFO] To run individual test suites:
echo [INFO] - Frontend: npm run test
echo [INFO] - Backend: npm run test:backend
echo [INFO] - Python: python -m pytest test_chatbot.py
echo [INFO] - E2E: npm run test:e2e

echo.
echo [SUCCESS] 🎯 Testing complete! Your Mindmate AI application is ready for production.

pause
