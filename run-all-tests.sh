#!/bin/bash

# Script pour exécuter tous les tests du projet Legal Agenda
# Usage: ./run-all-tests.sh [--coverage]

set -e

COVERAGE=false
if [ "$1" == "--coverage" ]; then
  COVERAGE=true
fi

echo "=========================================="
echo "🧪 Legal Agenda - Test Suite"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend Tests
echo -e "${YELLOW}📦 Backend Tests${NC}"
echo "=========================================="
cd backend

echo "Running unit tests..."
if [ "$COVERAGE" = true ]; then
  npm run test:cov
else
  npm test
fi

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend unit tests passed${NC}"
else
  echo -e "${RED}❌ Backend unit tests failed${NC}"
  exit 1
fi

echo ""
echo "Running E2E tests..."
npm run test:e2e

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend E2E tests passed${NC}"
else
  echo -e "${RED}❌ Backend E2E tests failed${NC}"
  exit 1
fi

cd ..

echo ""
echo "=========================================="
echo -e "${YELLOW}🎨 Frontend Tests${NC}"
echo "=========================================="
cd frontend

if [ "$COVERAGE" = true ]; then
  npm test -- --coverage
else
  npm test
fi

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
  echo -e "${RED}❌ Frontend tests failed${NC}"
  exit 1
fi

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo "=========================================="

if [ "$COVERAGE" = true ]; then
  echo ""
  echo "Coverage reports generated:"
  echo "  Backend:  backend/coverage/lcov-report/index.html"
  echo "  Frontend: frontend/coverage/index.html"
fi
