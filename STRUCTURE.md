# 📁 Structure du projet - Legal Agenda

## Vue d'ensemble

Le projet est organisé en **deux dossiers principaux** :
- `backend/` - API NestJS + PostgreSQL
- `frontend/` - Interface React + TypeScript

```
legal-agenda/
├── backend/                    # Backend NestJS
├── frontend/                   # Frontend React
├── docker-compose.yml          # Orchestration Docker
└── Documentation/              # Fichiers .md
```

---

## 📂 Backend (`backend/`)

### Structure complète

```
backend/
├── src/
│   ├── main.ts                 # Point d'entrée
│   ├── app.module.ts           # Module principal
│   │
│   ├── auth/                   # Authentification JWT
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   │
│   ├── users/                  # Gestion utilisateurs
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   │
│   ├── cases/                  # Gestion affaires
│   │   ├── cases.module.ts
│   │   ├── cases.service.ts
│   │   ├── cases.controller.ts
│   │   └── dto/
│   │       └── case.dto.ts
│   │
│   ├── hearings/               # Gestion audiences
│   │   ├── hearings.module.ts
│   │   ├── hearings.service.ts
│   │   ├── hearings.controller.ts
│   │   └── dto/
│   │       └── hearing.dto.ts
│   │
│   ├── alerts/                 # Système d'alertes
│   │   ├── alerts.module.ts
│   │   ├── alerts.service.ts
│   │   └── alerts.scheduler.ts
│   │
│   ├── audit/                  # Traçabilité
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts
│   │   └── audit.controller.ts
│   │
│   └── prisma/                 # Service Prisma
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
├── prisma/
│   ├── schema.prisma           # Schéma base de données
│   ├── seed.ts                 # Données de test
│   └── migrations/
│       └── migration_lock.toml
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example
├── Dockerfile
├── .dockerignore
└── README.md
```

### Fichiers clés

- **`src/main.ts`** : Point d'entrée de l'application
- **`prisma/schema.prisma`** : Schéma complet de la base de données
- **`src/alerts/alerts.scheduler.ts`** : Cron job pour les alertes quotidiennes
- **`.env.example`** : Variables d'environnement à configurer

### Commandes

```bash
cd backend

# Installation
npm install

# Développement
npm run start:dev

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio

# Build
npm run build
npm run start:prod
```

---

## ⚛️ Frontend (`frontend/`)

### Structure complète

```
frontend/
├── src/
│   ├── main.tsx                # Point d'entrée
│   ├── App.tsx                 # Composant racine
│   ├── index.css               # Styles globaux
│   │
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui (50+ composants)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── cases/              # Composants affaires
│   │   │   ├── CaseCard.tsx
│   │   │   └── CaseStatusBadge.tsx
│   │   │
│   │   ├── hearings/           # Composants audiences
│   │   │   ├── HearingCard.tsx
│   │   │   └── HearingStatusBadge.tsx
│   │   │
│   │   ├── dashboard/          # Composants dashboard
│   │   │   ├── StatCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentHearings.tsx
│   │   │   └── UrgentAlerts.tsx
│   │   │
│   │   └── calendar/           # Composants calendrier
│   │       └── CalendarView.tsx
│   │
│   ├── pages/                  # Pages
│   │   ├── Index.tsx           # Dashboard (/)
│   │   ├── Cases.tsx           # Affaires (/affaires)
│   │   ├── Agenda.tsx          # Calendrier (/agenda)
│   │   ├── UnreportedHearings.tsx  # À renseigner (/a-renseigner)
│   │   ├── TomorrowHearings.tsx    # Demain (/demain)
│   │   └── NotFound.tsx        # 404
│   │
│   ├── lib/                    # Utilitaires
│   │   ├── api.ts              # Client API complet
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   └── mock-data.ts        # Données de test
│   │
│   ├── types/                  # Types TypeScript
│   │   └── legal.ts            # Types métier
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   └── use-toast.ts
│   │
│   └── test/                   # Tests
│       ├── setup.ts
│       └── example.test.ts
│
├── public/
│   ├── placeholder.svg
│   └── robots.txt
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json
├── .env.example
├── Dockerfile
├── .dockerignore
└── README.md
```

### Fichiers clés

- **`src/main.tsx`** : Point d'entrée React
- **`src/App.tsx`** : Configuration routing
- **`src/lib/api.ts`** : Client API (300+ lignes)
- **`src/types/legal.ts`** : Types TypeScript synchronisés avec backend
- **`.env.example`** : Variable VITE_API_URL

### Commandes

```bash
cd frontend

# Installation
npm install

# Développement
npm run dev

# Build
npm run build
npm run preview

# Tests
npm run test

# Linting
npm run lint
```

---

## 🐳 Docker

### docker-compose.yml

Orchestre 3 services :
1. **postgres** : Base de données PostgreSQL
2. **backend** : API NestJS (port 3001)
3. **frontend** : Interface React (port 5173)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 📚 Documentation (Racine)

```
./
├── README.md                   # Documentation principale
├── START_HERE.md               # Démarrage rapide
├── SUMMARY.md                  # Résumé technique
├── GETTING_STARTED.md          # Installation détaillée
├── ARCHITECTURE.md             # Architecture complète
├── API_ENDPOINTS.md            # 22 endpoints documentés
├── COMMANDS.md                 # Commandes utiles
├── DEPLOY.md                   # Guide déploiement
├── CHECK.md                    # Checklist
├── NEXT_STEPS.md               # Prochaines étapes
├── FILES_CREATED.md            # Liste fichiers
├── RESUME_PROJET.md            # Résumé français
├── STRUCTURE.md                # Ce fichier
├── QUICK_START.txt             # Démarrage ultra-rapide
├── VERIFY.sh / VERIFY.bat      # Scripts vérification
├── docker-compose.yml
├── render.yaml
├── railway.json
├── .gitignore
└── .gitattributes
```

---

## 🔄 Flux de données

```
Frontend (React)
    ↓ HTTP/REST
Backend (NestJS)
    ↓ Prisma ORM
PostgreSQL
```

### Exemple : Créer une affaire

```
1. Frontend : api.createCase(data)
   ↓
2. Backend : POST /api/cases
   ↓
3. CasesController.create()
   ↓
4. CasesService.create()
   ↓
5. Prisma : prisma.case.create()
   ↓
6. PostgreSQL : INSERT INTO cases
   ↓
7. Retour : Case créée avec référence auto
```

---

## 📦 Dépendances

### Backend
- **NestJS** : Framework
- **Prisma** : ORM
- **PostgreSQL** : Base de données
- **JWT** : Authentification
- **bcrypt** : Hash mots de passe
- **Nodemailer** : Emails
- **node-cron** : Tâches planifiées

### Frontend
- **React** : Framework UI
- **TypeScript** : Typage
- **Vite** : Build tool
- **shadcn/ui** : Composants
- **Tailwind CSS** : Styling
- **React Router** : Routing
- **React Query** : État serveur
- **date-fns** : Dates

---

## 🎯 Points d'entrée

### Développement local

```bash
# Backend
cd backend && npm run start:dev
# → http://localhost:3001/api

# Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

### Docker

```bash
docker-compose up -d
# Backend → http://localhost:3001/api
# Frontend → http://localhost:5173
```

### Production

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build
# Servir le dossier frontend/dist/
```

---

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
SMTP_HOST="smtp.gmail.com"
SMTP_USER="..."
SMTP_PASSWORD="..."
ALERT_CRON_SCHEDULE="0 20 * * *"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001/api"
```

---

## 📊 Statistiques

### Backend
- **35+ fichiers** TypeScript
- **~2500 lignes** de code
- **22 endpoints** API
- **8 tables** base de données

### Frontend
- **80+ fichiers** (composants UI inclus)
- **~4000 lignes** de code
- **7 pages** principales
- **50+ composants** UI

### Total
- **115+ fichiers**
- **~6500 lignes** de code
- **13 fichiers** documentation

---

## 🎉 Résumé

Structure claire et séparée :
- ✅ Backend indépendant dans `backend/`
- ✅ Frontend indépendant dans `frontend/`
- ✅ Docker orchestration à la racine
- ✅ Documentation à la racine
- ✅ Chaque partie peut être développée/déployée séparément

Cette organisation facilite :
- Le développement parallèle
- Le déploiement séparé
- La maintenance
- L'évolution du projet
