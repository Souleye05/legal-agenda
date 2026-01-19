@echo off
REM Script de vérification rapide - Legal Agenda (Windows)
REM Ce script vérifie que tous les fichiers sont en place

echo ===============================================================
echo   VERIFICATION LEGAL AGENDA
echo ===============================================================
echo.

setlocal enabledelayedexpansion
set TOTAL=0
set SUCCESS=0
set FAILED=0

REM Fonction de vérification de fichier
:check_file
set /a TOTAL+=1
if exist "%~1" (
    echo [OK] %~1
    set /a SUCCESS+=1
) else (
    echo [MANQUANT] %~1
    set /a FAILED+=1
)
goto :eof

REM Fonction de vérification de dossier
:check_dir
set /a TOTAL+=1
if exist "%~1\" (
    echo [OK] %~1\
    set /a SUCCESS+=1
) else (
    echo [MANQUANT] %~1\
    set /a FAILED+=1
)
goto :eof

echo Verification de la structure...
echo.

echo Backend:
call :check_dir "backend"
call :check_dir "backend\src"
call :check_dir "backend\prisma"
call :check_file "backend\package.json"
call :check_file "backend\tsconfig.json"
call :check_file "backend\nest-cli.json"
call :check_file "backend\.env.example"
call :check_file "backend\Dockerfile"
call :check_file "backend\README.md"
echo.

echo Backend - Prisma:
call :check_file "backend\prisma\schema.prisma"
call :check_file "backend\prisma\seed.ts"
call :check_file "backend\prisma\migrations\migration_lock.toml"
echo.

echo Backend - Source:
call :check_file "backend\src\main.ts"
call :check_file "backend\src\app.module.ts"
call :check_dir "backend\src\auth"
call :check_dir "backend\src\users"
call :check_dir "backend\src\cases"
call :check_dir "backend\src\hearings"
call :check_dir "backend\src\alerts"
call :check_dir "backend\src\audit"
call :check_dir "backend\src\prisma"
echo.

echo Frontend:
call :check_dir "frontend"
call :check_dir "frontend\src"
call :check_dir "frontend\public"
call :check_file "frontend\package.json"
call :check_file "frontend\tsconfig.json"
call :check_file "frontend\vite.config.ts"
call :check_file "frontend\.env.example"
call :check_file "frontend\Dockerfile"
call :check_file "frontend\README.md"
call :check_file "frontend\index.html"
echo.

echo Docker:
call :check_file "docker-compose.yml"
call :check_file ".dockerignore"
call :check_file "backend\.dockerignore"
call :check_file "frontend\.dockerignore"
echo.

echo Documentation:
call :check_file "README.md"
call :check_file "START_HERE.md"
call :check_file "SUMMARY.md"
call :check_file "GETTING_STARTED.md"
call :check_file "ARCHITECTURE.md"
call :check_file "API_ENDPOINTS.md"
call :check_file "DELIVERABLES.md"
call :check_file "COMMANDS.md"
call :check_file "DEPLOY.md"
call :check_file "CHECK.md"
call :check_file "NEXT_STEPS.md"
call :check_file "FILES_CREATED.md"
call :check_file "RESUME_PROJET.md"
call :check_file "QUICK_START.txt"
echo.

echo Configuration:
call :check_file ".gitignore"
call :check_file ".gitattributes"
call :check_file "render.yaml"
call :check_file "railway.json"
echo.

echo ===============================================================
echo   RESUME
echo ===============================================================
echo.
echo Total verifie: %TOTAL%
echo Succes: %SUCCESS%
echo Manquants: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo [OK] Tous les fichiers sont en place !
    echo.
    echo Prochaine etape:
    echo   1. copy backend\.env.example backend\.env
    echo   2. copy frontend\.env.example frontend\.env
    echo   3. docker-compose up -d
    echo   4. Ouvrir http://localhost:5173
    echo.
    exit /b 0
) else (
    echo [ERREUR] Certains fichiers sont manquants
    echo.
    exit /b 1
)
