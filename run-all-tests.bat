@echo off
REM Script batch pour exécuter tous les tests du projet Legal Agenda
REM Usage: run-all-tests.bat [coverage]

setlocal enabledelayedexpansion

set COVERAGE=false
if "%1"=="coverage" set COVERAGE=true

echo ==========================================
echo 🧪 Legal Agenda - Test Suite
echo ==========================================
echo.

REM Backend Tests
echo 📦 Backend Tests
echo ==========================================
cd backend

echo Running unit tests...
if "%COVERAGE%"=="true" (
    call npm run test:cov
) else (
    call npm test
)

if errorlevel 1 (
    echo ❌ Backend unit tests failed
    exit /b 1
)
echo ✅ Backend unit tests passed

echo.
echo Running E2E tests...
call npm run test:e2e

if errorlevel 1 (
    echo ❌ Backend E2E tests failed
    exit /b 1
)
echo ✅ Backend E2E tests passed

cd ..

echo.
echo ==========================================
echo 🎨 Frontend Tests
echo ==========================================
cd frontend

if "%COVERAGE%"=="true" (
    call npm test -- --coverage
) else (
    call npm test
)

if errorlevel 1 (
    echo ❌ Frontend tests failed
    exit /b 1
)
echo ✅ Frontend tests passed

cd ..

echo.
echo ==========================================
echo 🎉 All tests passed!
echo ==========================================

if "%COVERAGE%"=="true" (
    echo.
    echo Coverage reports generated:
    echo   Backend:  backend\coverage\lcov-report\index.html
    echo   Frontend: frontend\coverage\index.html
)

endlocal
