# Script PowerShell pour exécuter tous les tests du projet Legal Agenda
# Usage: .\run-all-tests.ps1 [-Coverage]

param(
    [switch]$Coverage
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "🧪 Legal Agenda - Test Suite" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Backend Tests
Write-Host "📦 Backend Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Set-Location backend

Write-Host "Running unit tests..."
if ($Coverage) {
    npm run test:cov
} else {
    npm test
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend unit tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend unit tests failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running E2E tests..."
npm run test:e2e

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend E2E tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend E2E tests failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎨 Frontend Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Set-Location frontend

if ($Coverage) {
    npm test -- --coverage
} else {
    npm test
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend tests failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🎉 All tests passed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

if ($Coverage) {
    Write-Host ""
    Write-Host "Coverage reports generated:"
    Write-Host "  Backend:  backend\coverage\lcov-report\index.html"
    Write-Host "  Frontend: frontend\coverage\index.html"
}
