#!/bin/bash

# Script de vérification rapide - Legal Agenda
# Ce script vérifie que tous les fichiers sont en place

echo "═══════════════════════════════════════════════════════════════"
echo "  VÉRIFICATION LEGAL AGENDA"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
SUCCESS=0
FAILED=0

# Fonction de vérification
check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗${NC} $1 ${RED}(MANQUANT)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

check_dir() {
    TOTAL=$((TOTAL + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗${NC} $1/ ${RED}(MANQUANT)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo "📂 Vérification de la structure..."
echo ""

# Backend
echo "Backend:"
check_dir "backend"
check_dir "backend/src"
check_dir "backend/prisma"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/nest-cli.json"
check_file "backend/.env.example"
check_file "backend/Dockerfile"
check_file "backend/README.md"
echo ""

# Backend - Prisma
echo "Backend - Prisma:"
check_file "backend/prisma/schema.prisma"
check_file "backend/prisma/seed.ts"
check_file "backend/prisma/migrations/migration_lock.toml"
echo ""

# Backend - Source
echo "Backend - Source:"
check_file "backend/src/main.ts"
check_file "backend/src/app.module.ts"
check_dir "backend/src/auth"
check_dir "backend/src/users"
check_dir "backend/src/cases"
check_dir "backend/src/hearings"
check_dir "backend/src/alerts"
check_dir "backend/src/audit"
check_dir "backend/src/prisma"
echo ""

# Frontend
echo "Frontend:"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/public"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/vite.config.ts"
check_file "frontend/.env.example"
check_file "frontend/Dockerfile"
check_file "frontend/README.md"
check_file "frontend/index.html"
echo ""

# Docker
echo "Docker:"
check_file "docker-compose.yml"
check_file ".dockerignore"
check_file "backend/.dockerignore"
check_file "frontend/.dockerignore"
echo ""

# Documentation
echo "Documentation:"
check_file "README.md"
check_file "START_HERE.md"
check_file "SUMMARY.md"
check_file "GETTING_STARTED.md"
check_file "ARCHITECTURE.md"
check_file "API_ENDPOINTS.md"
check_file "DELIVERABLES.md"
check_file "COMMANDS.md"
check_file "DEPLOY.md"
check_file "CHECK.md"
check_file "NEXT_STEPS.md"
check_file "FILES_CREATED.md"
check_file "RESUME_PROJET.md"
check_file "QUICK_START.txt"
echo ""

# Configuration
echo "Configuration:"
check_file ".gitignore"
check_file ".gitattributes"
check_file "render.yaml"
check_file "railway.json"
echo ""

# Résumé
echo "═══════════════════════════════════════════════════════════════"
echo "  RÉSUMÉ"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "Total vérifié: ${YELLOW}$TOTAL${NC}"
echo -e "Succès: ${GREEN}$SUCCESS${NC}"
echo -e "Manquants: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les fichiers sont en place !${NC}"
    echo ""
    echo "Prochaine étape:"
    echo "  1. cp backend/.env.example backend/.env"
    echo "  2. cp frontend/.env.example frontend/.env"
    echo "  3. docker-compose up -d"
    echo "  4. Ouvrir http://localhost:5173"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Certains fichiers sont manquants${NC}"
    echo ""
    exit 1
fi
