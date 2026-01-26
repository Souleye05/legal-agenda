# Feuille de Route des Améliorations - Legal Agenda

## 🎯 Sprint 1 - Sécurité & Performance (Priorité HAUTE)

### Semaine 1-2: Sécurité

#### 1. Rate Limiting (2h)
```bash
npm install @nestjs/throttler
```

**Fichiers à modifier**:
- `backend/src/app.module.ts`
- `backend/src/auth/auth.controller.ts`

**Code à ajouter**:
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

#### 2. Blocage après tentatives échouées (3h)
**Nouveau fichier**: `backend/src/auth/login-attempts.service.ts`

```typescript
@Injectable()
export class LoginAttemptsService {
  private attempts = new Map<string, { count: number; blockedUntil?: Date }>();

  isBlocked(email: string): boolean {
    const attempt = this.attempts.get(email);
    if (!attempt?.blockedUntil) return false;
    
    if (new Date() > attempt.blockedUntil) {
      this.attempts.delete(email);
      return false;
    }
    return true;
  }

  recordFailedAttempt(email: string): void {
    const attempt = this.attempts.get(email) || { count: 0 };
    attempt.count++;
    
    if (attempt.count >= 5) {
      attempt.blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    }
    
    this.attempts.set(email, attempt);
  }

  resetAttempts(email: string): void {
    this.attempts.delete(email);
  }
}
```

### Semaine 3-4: Performance

#### 3. Pagination globale (4h)
**Nouveau fichier**: `backend/src/common/dto/pagination.dto.ts`

```typescript
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Fichiers à modifier**:
- `backend/src/cases/cases.controller.ts`
- `backend/src/cases/cases.service.ts`
- `backend/src/hearings/hearings.controller.ts`
- `backend/src/hearings/hearings.service.ts`

#### 4. Cache Redis (6h)
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

**Nouveau fichier**: `backend/src/cache/cache.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes
    }),
  ],
})
export class CacheConfigModule {}
```

**Utilisation dans les services**:
```typescript
@Injectable()
export class CasesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'cases:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) return cached;
    
    const data = await this.prisma.affaire.findMany();
    await this.cacheManager.set(cacheKey, data, 300);
    
    return data;
  }
}
```

---

## 🧪 Sprint 2 - Tests & Qualité (Priorité HAUTE)

### Semaine 5-6: Tests E2E Frontend

#### 5. Configuration Playwright (2h)
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**Nouveau fichier**: `frontend/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 6. Tests E2E critiques (6h)
**Nouveau dossier**: `frontend/e2e/`

**Fichiers à créer**:
- `e2e/auth.spec.ts` - Tests authentification
- `e2e/cases.spec.ts` - Tests gestion affaires
- `e2e/hearings.spec.ts` - Tests gestion audiences
- `e2e/reminders.spec.ts` - Tests rappels

**Exemple**: `e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Tableau de bord')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Identifiants invalides')).toBeVisible();
  });
});
```

---

## 🎨 Sprint 3 - Optimisations Frontend (Priorité MOYENNE)

### Semaine 7-8: Performance Frontend

#### 7. Lazy Loading des routes (3h)
**Fichier à modifier**: `frontend/src/App.tsx`

```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cases = lazy(() => import('./pages/Cases'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const NewCase = lazy(() => import('./pages/NewCase'));
const EditCase = lazy(() => import('./pages/EditCase'));
// ... autres pages

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/affaires" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
            {/* ... autres routes */}
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
```

#### 8. Optimisation des queries TanStack (2h)
**Fichier à créer**: `frontend/src/lib/query-config.ts`

```typescript
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
};

// Utilisation dans App.tsx
const queryClient = new QueryClient(queryConfig);
```

#### 9. Mémoïsation des composants (3h)
**Fichiers à modifier**:
- `frontend/src/components/hearings/HearingCard.tsx`
- `frontend/src/components/cases/CaseCard.tsx`
- `frontend/src/components/dashboard/*`

```typescript
import { memo } from 'react';

export const HearingCard = memo(({ hearing }: HearingCardProps) => {
  // ... composant
}, (prevProps, nextProps) => {
  return prevProps.hearing.id === nextProps.hearing.id &&
         prevProps.hearing.updatedAt === nextProps.hearing.updatedAt;
});
```

---

## 📚 Sprint 4 - Documentation (Priorité MOYENNE)

### Semaine 9: Documentation

#### 10. README enrichi (2h)
**Fichier à modifier**: `README.md`

Sections à ajouter:
- Architecture détaillée avec diagrammes
- Guide d'installation pas à pas
- Variables d'environnement
- Scripts disponibles
- Déploiement
- Troubleshooting

#### 11. Documentation API (3h)
**Nouveau fichier**: `API_DOCUMENTATION.md`

Documenter:
- Tous les endpoints
- Exemples de requêtes/réponses
- Codes d'erreur
- Rate limits
- Authentification

#### 12. Guide de contribution (2h)
**Nouveau fichier**: `CONTRIBUTING.md`

Inclure:
- Standards de code
- Process de PR
- Convention de commits
- Tests requis
- Code review checklist

---

## 🔧 Sprint 5 - Monitoring & Logging (Priorité BASSE)

### Semaine 10: Observabilité

#### 13. Logger centralisé Winston (4h)
```bash
npm install winston winston-daily-rotate-file
```

**Nouveau fichier**: `backend/src/logger/logger.service.ts`

```typescript
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

#### 14. Monitoring Sentry (2h)
```bash
npm install @sentry/node @sentry/tracing
```

**Fichier à modifier**: `backend/src/main.ts`

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Ajouter middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... routes
app.use(Sentry.Handlers.errorHandler());
```

---

## 📱 Sprint 6 - PWA (Priorité BASSE)

### Semaine 11-12: Progressive Web App

#### 15. Service Worker (8h)
```bash
npm install -D vite-plugin-pwa
```

**Fichier à modifier**: `frontend/vite.config.ts`

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Legal Agenda',
        short_name: 'Legal Agenda',
        description: 'Gestion juridique professionnelle',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
            },
          },
        ],
      },
    }),
  ],
});
```

#### 16. Offline support (4h)
**Nouveau fichier**: `frontend/src/lib/offline-queue.ts`

```typescript
class OfflineQueue {
  private queue: Array<{ url: string; method: string; data: any }> = [];

  add(request: { url: string; method: string; data: any }) {
    this.queue.push(request);
    localStorage.setItem('offline-queue', JSON.stringify(this.queue));
  }

  async processQueue() {
    if (!navigator.onLine) return;

    const queue = [...this.queue];
    this.queue = [];

    for (const request of queue) {
      try {
        await fetch(request.url, {
          method: request.method,
          body: JSON.stringify(request.data),
        });
      } catch (error) {
        this.queue.push(request);
      }
    }

    localStorage.setItem('offline-queue', JSON.stringify(this.queue));
  }
}

export const offlineQueue = new OfflineQueue();
```

---

## 📊 Métriques de Succès

### Sprint 1 (Sécurité & Performance)
- [ ] Rate limiting actif sur tous les endpoints sensibles
- [ ] Temps de réponse API < 200ms (p95)
- [ ] Pagination sur tous les endpoints de liste
- [ ] Cache hit ratio > 70%

### Sprint 2 (Tests)
- [ ] Couverture E2E > 80% des user flows critiques
- [ ] 0 tests flaky
- [ ] CI/CD avec tests automatiques

### Sprint 3 (Frontend)
- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500KB

### Sprint 4 (Documentation)
- [ ] README complet avec exemples
- [ ] API documentation à jour
- [ ] Guide de contribution disponible

### Sprint 5 (Monitoring)
- [ ] Logs structurés en production
- [ ] Alertes configurées sur Sentry
- [ ] Dashboard de monitoring opérationnel

### Sprint 6 (PWA)
- [ ] Lighthouse PWA score > 90
- [ ] Offline support fonctionnel
- [ ] Installation PWA possible

---

## 🎯 Timeline Globale

```
Mois 1: Sprints 1-2 (Sécurité, Performance, Tests)
Mois 2: Sprints 3-4 (Optimisations, Documentation)
Mois 3: Sprints 5-6 (Monitoring, PWA)
```

**Effort total estimé**: ~80 heures  
**Durée totale**: 3 mois (à temps partiel)

---

## ✅ Checklist de Déploiement Production

Avant de déployer en production, vérifier:

### Sécurité
- [ ] Rate limiting activé
- [ ] HTTPS configuré
- [ ] Variables d'environnement sécurisées
- [ ] Secrets rotation configurée
- [ ] Backup automatique DB
- [ ] Logs ne contiennent pas de données sensibles

### Performance
- [ ] Pagination implémentée
- [ ] Cache configuré
- [ ] CDN pour les assets statiques
- [ ] Compression gzip activée
- [ ] Database indexes optimisés

### Monitoring
- [ ] Sentry configuré
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Health checks actifs
- [ ] Uptime monitoring

### Tests
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Tests de charge effectués
- [ ] Smoke tests production

### Documentation
- [ ] README à jour
- [ ] API documentation complète
- [ ] Runbook opérationnel
- [ ] Plan de rollback documenté

---

**Dernière mise à jour**: 26 janvier 2026
