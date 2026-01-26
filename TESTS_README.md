# Tests - Legal Agenda

## 🧪 Vue d'ensemble

Ce projet contient une suite complète de tests unitaires et d'intégration pour le système de rappels de recours.

## 📋 Types de tests

### Backend
- **Tests unitaires** : Service et contrôleur avec mocks
- **Tests E2E** : Tests end-to-end avec base de données réelle

### Frontend
- **Tests unitaires** : Composants React avec mocks
- **Tests d'intégration** : Flux utilisateur complets

## 🚀 Exécution rapide

### Tous les tests

**Windows (PowerShell) :**
```powershell
.\run-all-tests.ps1
```

**Linux/Mac :**
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

### Avec couverture de code

**Windows :**
```powershell
.\run-all-tests.ps1 -Coverage
```

**Linux/Mac :**
```bash
./run-all-tests.sh --coverage
```

## 📦 Tests Backend

### Tests unitaires

```bash
cd backend

# Tous les tests
npm test

# Tests spécifiques
npm test -- appeals.service.spec.ts
npm test -- appeals.controller.spec.ts

# Mode watch
npm test -- --watch

# Couverture
npm run test:cov
```

### Tests E2E

```bash
cd backend

# Tous les tests E2E
npm run test:e2e

# Test spécifique
npm run test:e2e -- appeals.e2e-spec.ts
```

**⚠️ Prérequis pour E2E :**
- PostgreSQL démarré
- Base de données de test configurée
- Variables d'environnement `.env.test`

## 🎨 Tests Frontend

```bash
cd frontend

# Tous les tests
npm test

# Tests spécifiques
npm test -- AppealReminders.test.tsx
npm test -- AppealReminders.dashboard.test.tsx
npm test -- RecordHearingResult.integration.test.tsx

# Mode watch
npm test -- --watch

# Couverture
npm test -- --coverage

# UI de test
npm test -- --ui
```

## 📊 Couverture de code

### Visualiser les rapports

Après avoir exécuté les tests avec couverture :

**Backend :**
```bash
cd backend
open coverage/lcov-report/index.html  # Mac
start coverage/lcov-report/index.html # Windows
```

**Frontend :**
```bash
cd frontend
open coverage/index.html  # Mac
start coverage/index.html # Windows
```

### Objectifs de couverture

| Métrique | Backend | Frontend |
|----------|---------|----------|
| Statements | > 80% | > 70% |
| Branches | > 75% | > 65% |
| Functions | > 80% | > 70% |
| Lines | > 80% | > 70% |

## 🧩 Structure des tests

```
backend/
├── src/
│   └── appeals/
│       ├── appeals.service.spec.ts      # Tests unitaires service
│       └── appeals.controller.spec.ts   # Tests unitaires contrôleur
└── test/
    └── appeals.e2e-spec.ts              # Tests E2E

frontend/
└── src/
    └── test/
        ├── AppealReminders.test.tsx                    # Tests page principale
        ├── AppealReminders.dashboard.test.tsx          # Tests composant dashboard
        └── RecordHearingResult.integration.test.tsx    # Tests intégration
```

## 🔧 Configuration

### Backend (Jest)

Configuration dans `backend/package.json` :
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Frontend (Vitest)

Configuration dans `frontend/vitest.config.ts` :
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## 📝 Écrire de nouveaux tests

### Backend - Test unitaire

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Frontend - Test composant

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 🐛 Dépannage

### Tests backend échouent

1. **Vérifier PostgreSQL**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **Nettoyer la base de données**
   ```bash
   cd backend
   npx prisma migrate reset --force
   ```

3. **Vérifier les variables d'environnement**
   ```bash
   cat .env.test
   ```

### Tests frontend échouent

1. **Nettoyer le cache**
   ```bash
   cd frontend
   npm run test -- --clearCache
   ```

2. **Réinstaller les dépendances**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vérifier les mocks**
   - Vérifier que tous les modules sont mockés correctement
   - Vérifier les imports dans les fichiers de test

## 📚 Documentation complète

Pour plus de détails, consultez [TESTS_DOCUMENTATION.md](./TESTS_DOCUMENTATION.md)

## 🎯 Checklist avant commit

- [ ] Tous les tests passent
- [ ] Couverture de code maintenue ou améliorée
- [ ] Nouveaux tests ajoutés pour nouvelles fonctionnalités
- [ ] Tests E2E passent
- [ ] Pas de tests ignorés (`it.skip`, `describe.skip`)
- [ ] Pas de `console.log` dans les tests

## 🤝 Contribution

Lors de l'ajout de nouvelles fonctionnalités :

1. Écrire les tests **avant** le code (TDD)
2. Viser une couverture de 80%+
3. Inclure tests unitaires ET d'intégration
4. Documenter les cas limites
5. Tester les cas d'erreur

## 📞 Support

En cas de problème avec les tests :
1. Consulter [TESTS_DOCUMENTATION.md](./TESTS_DOCUMENTATION.md)
2. Vérifier les logs d'erreur
3. Consulter la documentation Jest/Vitest
4. Demander de l'aide à l'équipe

---

**Dernière mise à jour :** 26 janvier 2026
