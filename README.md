# ⚖️ Legal Agenda - Application d'Agenda Juridique Collaborative

Application web moderne pour la gestion collaborative d'audiences juridiques et le suivi des affaires pour cabinets d'avocats.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Fonctionnalités

### 🎯 Gestion des affaires
- Création et suivi des affaires avec référence unique auto-générée (AFF-YYYY-NNNN)
- Gestion des parties (demandeurs, défendeurs, conseils adverses)
- Statuts : ACTIVE, CLOTUREE, RADIEE
- Historique complet et traçabilité

### 📅 Gestion des audiences
- Planification des audiences avec date, heure et type
- Vue calendrier mensuelle
- Vue "Audiences de demain" pour préparation
- Notes de préparation par audience
- Statuts : À venir, Tenue, Non renseignée

### 📝 Renseignement des résultats
- **RENVOI** : Nouvelle date + motif → Crée automatiquement une nouvelle audience
- **RADIATION** : Motif → Clôture l'affaire (statut RADIEE)
- **DÉLIBÉRÉ** : Texte du délibéré → Clôture l'affaire (statut CLOTUREE)

### 🔔 Système d'alertes automatique
- Détection quotidienne des audiences passées non renseignées
- Alertes email automatiques à 20h00 (configurable)
- Répétition jusqu'à régularisation
- Résolution automatique dès renseignement

### 👥 Multi-utilisateurs
- Rôles : Administrateur et Collaborateur
- Authentification JWT sécurisée
- Gestion des accès

### 📊 Tableau de bord
- Statistiques en temps réel
- Affaires actives
- Audiences à venir
- Audiences non renseignées (urgent)
- Audiences de demain

### 🔍 Traçabilité complète
- Audit logs de toutes les actions
- Historique des modifications
- Qui a fait quoi et quand

## 🚀 Démarrage rapide

### Avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <repo-url>
cd legal-agenda

# 2. Configurer l'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Lancer l'application
docker-compose up -d

# 4. Accéder à l'application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
```

**Identifiants de test** :
- Admin : `admin@legalagenda.com` / `admin123`
- Collaborateur : `collaborateur@legalagenda.com` / `collab123`

### Installation manuelle

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres

# Initialiser la base de données
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Démarrer
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Vérifier que VITE_API_URL=http://localhost:3001/api

# Démarrer
npm run dev
```

Voir le guide détaillé dans [GETTING_STARTED.md](./GETTING_STARTED.md)

## 📚 Documentation

- **[Guide de démarrage](./GETTING_STARTED.md)** - Installation et utilisation
- **[Architecture](./ARCHITECTURE.md)** - Architecture technique détaillée
- **[Backend README](./backend/README.md)** - Documentation API

## 🏗️ Stack Technique

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui (Radix UI + Tailwind CSS)
- React Router v6
- React Query (TanStack)
- React Hook Form + Zod
- date-fns

### Backend
- NestJS (Node.js + TypeScript)
- Prisma ORM
- PostgreSQL 16
- JWT Authentication
- @nestjs/schedule (cron jobs)
- Nodemailer (emails)

### DevOps
- Docker + Docker Compose
- Ready for Render / Railway / Vercel

## 📁 Structure du projet

```
legal-agenda/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/           # Authentification
│   │   ├── users/          # Gestion utilisateurs
│   │   ├── cases/          # Gestion affaires
│   │   ├── hearings/       # Gestion audiences
│   │   ├── alerts/         # Système d'alertes
│   │   ├── audit/          # Traçabilité
│   │   └── prisma/         # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma   # Schéma base de données
│   │   └── seed.ts         # Données de test
│   └── package.json
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── pages/          # Pages
│   │   ├── lib/            # Utilitaires
│   │   │   ├── api.ts      # Client API
│   │   │   └── utils.ts
│   │   └── types/          # Types TypeScript
│   └── package.json
├── docker-compose.yml      # Configuration Docker
└── README.md
```

## 🔧 Configuration

### Variables d'environnement Backend

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/legal_agenda"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"

# Email (alertes)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Horaire des alertes (cron)
ALERT_CRON_SCHEDULE="0 20 * * *"  # 20h00 tous les jours
```

### Variables d'environnement Frontend

```env
VITE_API_URL=http://localhost:3001/api
```

## 📊 Modèle de données

### Entités principales
- **User** : Utilisateurs (Admin/Collaborateur)
- **Case** : Affaires juridiques
- **Party** : Parties (demandeur/défendeur/conseil)
- **Hearing** : Audiences
- **HearingResult** : Résultats d'audience
- **Alert** : Alertes automatiques
- **AuditLog** : Traçabilité

Voir le schéma complet dans `backend/prisma/schema.prisma`

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Guards sur toutes les routes sensibles
- Validation des données (class-validator)
- Protection SQL injection (Prisma)
- CORS configuré

## 🎯 Fonctionnalités à venir (BONUS)

- [ ] Export PDF des audiences de demain
- [ ] Export Excel des affaires
- [ ] Multi-cabinets (mode SaaS)
- [ ] Gestion des pièces (upload PDF)
- [ ] Notifications WhatsApp (Twilio)
- [ ] Filtres avancés
- [ ] Recherche full-text
- [ ] Dashboard analytics avec graphiques

## 🧪 Tests

```bash
# Frontend
npm run test

# Backend
cd backend
npm run test
```

## 📦 Build Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
npm run start:prod
```

## 🐳 Docker

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire
docker-compose up --build -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé pour les cabinets d'avocats souhaitant moderniser leur gestion d'audiences.

## 🆘 Support

- Consulter [GETTING_STARTED.md](./GETTING_STARTED.md)
- Consulter [ARCHITECTURE.md](./ARCHITECTURE.md)
- Ouvrir une issue sur GitHub

---

**Note** : Cette application est prête pour la production. Pensez à :
- Changer les secrets JWT en production
- Configurer un SMTP fiable
- Sauvegarder régulièrement la base de données
- Activer HTTPS en production
