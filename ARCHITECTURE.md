# Architecture - Legal Agenda Application

## 📋 Vue d'ensemble

Application web collaborative pour la gestion d'agenda juridique avec suivi des audiences et clôture automatique des affaires.

## 🏗️ Stack Technique

### Frontend
- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **UI Library** : shadcn/ui (Radix UI + Tailwind CSS)
- **Routing** : React Router v6
- **State Management** : React Query (TanStack Query)
- **Forms** : React Hook Form + Zod
- **Date Handling** : date-fns

### Backend
- **Framework** : NestJS (Node.js + TypeScript)
- **ORM** : Prisma
- **Database** : PostgreSQL 16
- **Authentication** : JWT + Passport
- **Scheduler** : @nestjs/schedule (node-cron)
- **Email** : Nodemailer

### DevOps
- **Containerization** : Docker + Docker Compose
- **Deployment** : Ready for Render / Railway / Vercel

## 📊 Modèle de données

### Entités principales

#### User (Utilisateur)
- id, email, password, fullName
- role: ADMIN | COLLABORATOR
- isActive

#### Case (Affaire)
- id, reference (AFF-YYYY-NNNN)
- title, jurisdiction, chamber, city
- status: ACTIVE | CLOTUREE | RADIEE
- observations
- parties[] (relation)
- hearings[] (relation)

#### Party (Partie)
- id, name
- role: DEMANDEUR | DEFENDEUR | CONSEIL_ADVERSE
- caseId (relation)

#### Hearing (Audience)
- id, date, time
- type: MISE_EN_ETAT | PLAIDOIRIE | REFERE | EVOCATION | etc.
- status: A_VENIR | TENUE | NON_RENSEIGNEE
- preparationNotes, isPrepared
- caseId (relation)
- result (relation)

#### HearingResult (Résultat d'audience)
- id, type: RENVOI | RADIATION | DELIBERE
- newDate, postponementReason (pour RENVOI)
- radiationReason (pour RADIATION)
- deliberationText (pour DELIBERE)
- hearingId (relation)

#### Alert (Alerte)
- id, hearingId
- status: PENDING | SENT | RESOLVED
- sentCount, lastSentAt

#### AuditLog (Traçabilité)
- id, entityType, entityId
- action: CREATE | UPDATE | DELETE
- oldValue, newValue
- userId, createdAt

## 🔄 Flux de données

### 1. Création d'une affaire
```
User → Frontend → POST /api/cases
→ Backend → Prisma → PostgreSQL
→ Generate reference (AFF-2026-NNNN)
→ Create parties
→ Log audit
→ Return case
```

### 2. Création d'une audience
```
User → Frontend → POST /api/hearings
→ Backend → Validate case exists
→ Create hearing (status: A_VENIR)
→ Log audit
→ Return hearing
```

### 3. Renseigner un résultat
```
User → Frontend → POST /api/hearings/:id/result
→ Backend → Create HearingResult
→ Update hearing status to TENUE
→ Execute automatic action:
   - RENVOI → Create new hearing
   - RADIATION → Update case status to RADIEE
   - DELIBERE → Update case status to CLOTUREE
→ Resolve alerts
→ Log audit
```

### 4. Système d'alertes (automatique)
```
Cron Job (20h00 daily)
→ Check hearings with date < today AND status = A_VENIR
→ Update status to NON_RENSEIGNEE
→ Create Alert if not exists
→ Send email to case creator
→ Update alert (status: SENT, sentCount++)
```

## 🔐 Authentification

### Flow
1. User login → POST /api/auth/login
2. Backend validates credentials
3. Returns JWT token + user info
4. Frontend stores token in localStorage
5. All subsequent requests include: `Authorization: Bearer <token>`

### Guards
- `JwtAuthGuard` : Protège toutes les routes API (sauf auth)
- `CurrentUser` decorator : Injecte l'utilisateur dans les controllers

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Cases
- `GET /api/cases` - Liste (filtrable par status)
- `GET /api/cases/stats` - Statistiques
- `GET /api/cases/:id` - Détails
- `POST /api/cases` - Créer
- `PATCH /api/cases/:id` - Modifier
- `DELETE /api/cases/:id` - Supprimer

### Hearings
- `GET /api/hearings` - Liste (filtrable)
- `GET /api/hearings/unreported` - Non renseignées
- `GET /api/hearings/tomorrow` - Demain
- `GET /api/hearings/calendar` - Vue calendrier
- `GET /api/hearings/:id` - Détails
- `POST /api/hearings` - Créer
- `PATCH /api/hearings/:id` - Modifier
- `POST /api/hearings/:id/result` - Renseigner résultat
- `DELETE /api/hearings/:id` - Supprimer

### Users
- `GET /api/users` - Liste
- `GET /api/users/:id` - Détails
- `PATCH /api/users/:id` - Modifier

### Audit
- `GET /api/audit` - Logs
- `GET /api/audit/entity` - Logs par entité

## 🎨 Structure Frontend

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (MainLayout, PageHeader)
│   ├── cases/           # Case-specific components
│   ├── hearings/        # Hearing-specific components
│   ├── dashboard/       # Dashboard widgets
│   └── calendar/        # Calendar view
├── pages/
│   ├── Index.tsx        # Dashboard
│   ├── Cases.tsx        # Liste des affaires
│   ├── Agenda.tsx       # Calendrier
│   ├── UnreportedHearings.tsx
│   └── TomorrowHearings.tsx
├── lib/
│   ├── api.ts           # API client
│   ├── utils.ts         # Utilities
│   └── mock-data.ts     # Mock data (dev)
├── types/
│   └── legal.ts         # TypeScript types
└── hooks/
    └── use-toast.ts     # Custom hooks
```

## 🏗️ Structure Backend

```
backend/src/
├── auth/                # Authentication module
│   ├── strategies/      # JWT & Local strategies
│   ├── guards/          # Auth guards
│   └── decorators/      # Custom decorators
├── users/               # Users module
├── cases/               # Cases module
│   └── dto/             # Data Transfer Objects
├── hearings/            # Hearings module
│   └── dto/
├── alerts/              # Alerts module
│   ├── alerts.service.ts
│   └── alerts.scheduler.ts
├── audit/               # Audit module
├── prisma/              # Prisma module
│   └── prisma.service.ts
└── main.ts              # Application entry
```

## 🔔 Système d'alertes

### Déclenchement
- **Cron quotidien** : 20h00 (configurable)
- **Vérification horaire** : Détection des audiences non renseignées

### Processus
1. Identifier les audiences passées non renseignées
2. Mettre à jour le statut → NON_RENSEIGNEE
3. Créer une alerte si inexistante
4. Envoyer email au créateur de l'affaire
5. Répéter quotidiennement jusqu'à résolution

### Résolution
- Automatique dès qu'un résultat est renseigné
- Statut alerte → RESOLVED

## 🚀 Déploiement

### Développement local
```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

### Production
1. **Backend** : Render / Railway
   - Build: `npm run build`
   - Start: `npm run start:prod`
   - Env vars: DATABASE_URL, JWT_SECRET, SMTP_*

2. **Frontend** : Vercel / Netlify
   - Build: `npm run build`
   - Env vars: VITE_API_URL

## 📈 Fonctionnalités clés

### ✅ Implémentées
- Gestion complète des affaires (CRUD)
- Gestion des audiences (CRUD)
- Renseignement des résultats (RENVOI/RADIATION/DELIBERE)
- Clôture automatique des affaires
- Système d'alertes quotidiennes
- Authentification JWT
- Traçabilité complète (audit logs)
- Vue "Audiences à renseigner"
- Vue "Audiences de demain"
- Calendrier des audiences
- Multi-utilisateurs (Admin/Collaborateur)

### 🎯 À implémenter (BONUS)
- [ ] Export PDF des audiences de demain
- [ ] Export Excel des affaires
- [ ] Multi-cabinets (SaaS)
- [ ] Gestion des pièces (upload PDF)
- [ ] Notifications WhatsApp (Twilio)
- [ ] Filtres avancés (juridiction, chambre, collaborateur)
- [ ] Recherche full-text
- [ ] Dashboard analytics (graphiques)

## 🔒 Sécurité

- Mots de passe hashés (bcrypt)
- JWT avec expiration
- Validation des données (class-validator)
- Guards sur toutes les routes sensibles
- CORS configuré
- SQL injection protection (Prisma)

## 📝 Notes importantes

1. **Référence auto-générée** : Format AFF-YYYY-NNNN
2. **Alertes** : Configurables via ALERT_CRON_SCHEDULE
3. **Email** : Nécessite configuration SMTP
4. **Audit** : Toutes les actions sont tracées
5. **Statuts** : Gestion automatique selon résultats
