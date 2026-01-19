# Legal Agenda Backend API

Backend API pour l'application d'agenda juridique collaborative.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- PostgreSQL 16+
- npm

### Installation

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

3. **Base de données**
```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate

# Peupler avec des données de test
npm run prisma:seed
```

4. **Démarrer le serveur**
```bash
# Mode développement (hot reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera accessible sur `http://localhost:3001/api`

## 📚 API Endpoints (22 endpoints)

### Authentication (2)
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Users (3)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails utilisateur
- `PATCH /api/users/:id` - Modifier utilisateur

### Cases - Affaires (6)
- `GET /api/cases` - Liste des affaires (filtrable par status)
- `GET /api/cases/stats` - Statistiques
- `GET /api/cases/:id` - Détails affaire
- `POST /api/cases` - Créer affaire (référence auto-générée)
- `PATCH /api/cases/:id` - Modifier affaire
- `DELETE /api/cases/:id` - Supprimer affaire

### Hearings - Audiences (9)
- `GET /api/hearings` - Liste des audiences (filtrable)
- `GET /api/hearings/unreported` - Audiences non renseignées ⚠️
- `GET /api/hearings/tomorrow` - Audiences de demain 📅
- `GET /api/hearings/calendar` - Vue calendrier (par mois)
- `GET /api/hearings/:id` - Détails audience
- `POST /api/hearings` - Créer audience
- `PATCH /api/hearings/:id` - Modifier audience
- `POST /api/hearings/:id/result` - Renseigner résultat (RENVOI/RADIATION/DELIBERE)
- `DELETE /api/hearings/:id` - Supprimer audience

### Audit (2)
- `GET /api/audit` - Logs d'audit (traçabilité)
- `GET /api/audit/entity` - Logs par entité

**Documentation complète** : Voir `../API_ENDPOINTS.md`

## 🔐 Authentification

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT :

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalagenda.com","password":"admin123"}'

# 2. Utiliser le token
curl -X GET http://localhost:3001/api/cases \
  -H "Authorization: Bearer <votre-token>"
```

## 🔔 Système d'alertes automatique

### Fonctionnement
1. **Cron quotidien** (20h00 par défaut)
2. Détecte les audiences passées non renseignées
3. Change leur statut en `NON_RENSEIGNEE`
4. Crée une alerte
5. Envoie un email à l'avocat responsable
6. Répète chaque jour jusqu'à régularisation

### Configuration
```env
# Horaire des alertes (format cron)
ALERT_CRON_SCHEDULE="0 20 * * *"  # 20h00 tous les jours

# Exemples :
# "0 9 * * *"     → 9h00 tous les jours
# "0 9 * * 1-5"   → 9h00 du lundi au vendredi
# "0 */2 * * *"   → Toutes les 2 heures
```

### Résolution automatique
Dès qu'un résultat est renseigné, l'alerte est automatiquement résolue.

## 🗄️ Base de données

### Schéma (8 tables)
- **User** : Utilisateurs (Admin/Collaborateur)
- **Case** : Affaires juridiques
- **Party** : Parties (demandeur/défendeur/conseil)
- **Hearing** : Audiences
- **HearingResult** : Résultats d'audience
- **Alert** : Alertes automatiques
- **AuditLog** : Traçabilité
- **SystemConfig** : Configuration système

Schéma complet : `prisma/schema.prisma`

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name description_changement

# Appliquer en production
npx prisma migrate deploy

# Réinitialiser la base (⚠️ supprime les données)
npx prisma migrate reset
```

### Prisma Studio (Interface graphique)
```bash
npm run prisma:studio
# Ouvre http://localhost:5555
```

## 📧 Configuration Email

### Gmail (Recommandé)
1. Activer la validation en 2 étapes
2. Créer un "Mot de passe d'application"
3. Configurer dans `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password-16-caracteres>
SMTP_FROM="Legal Agenda <noreply@legalagenda.com>"
```

### Autres fournisseurs
```env
# Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

## 🐳 Docker

### Avec docker-compose (recommandé)
```bash
# À la racine du projet
docker-compose up -d
```

### Standalone
```bash
# Build
docker build -t legal-agenda-backend .

# Run
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  legal-agenda-backend
```

## 📝 Données de test

Le seed crée automatiquement :
- 2 utilisateurs (admin + collaborateur)
- 2 affaires actives
- 3 audiences (2 à venir, 1 non renseignée)
- 1 alerte en attente

### Identifiants
- **Admin** : `admin@legalagenda.com` / `admin123`
- **Collaborateur** : `collaborateur@legalagenda.com` / `collab123`

### Réinitialiser
```bash
npm run prisma:migrate reset
npm run prisma:seed
```

## 🏗️ Structure du code

```
backend/src/
├── main.ts                 # Point d'entrée
├── app.module.ts           # Module principal
├── auth/                   # Authentification JWT
│   ├── strategies/         # JWT & Local strategies
│   ├── guards/             # Auth guards
│   └── decorators/         # Custom decorators
├── users/                  # Gestion utilisateurs
├── cases/                  # Gestion affaires
│   └── dto/                # Data Transfer Objects
├── hearings/               # Gestion audiences
│   └── dto/
├── alerts/                 # Système d'alertes
│   ├── alerts.service.ts   # Envoi emails
│   └── alerts.scheduler.ts # Cron jobs
├── audit/                  # Traçabilité
└── prisma/                 # Service Prisma
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Monitoring

### Logs
```bash
# Mode développement
npm run start:dev

# Logs Docker
docker-compose logs -f backend
```

### Santé de l'API
```bash
curl http://localhost:3001/api
```

## 🔒 Sécurité

- ✅ Mots de passe hashés (bcrypt)
- ✅ JWT avec expiration
- ✅ Guards sur toutes les routes sensibles
- ✅ Validation des données (class-validator)
- ✅ Protection SQL injection (Prisma)
- ✅ CORS configuré

## 🚀 Déploiement

### Variables d'environnement production
```env
NODE_ENV=production
DATABASE_URL=<url-production>
JWT_SECRET=<secret-fort-64-caracteres>
FRONTEND_URL=<url-frontend-production>
```

### Générer un JWT_SECRET fort
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Plateformes supportées
- Render (recommandé)
- Railway
- Heroku
- VPS (DigitalOcean, Linode)

Voir `../DEPLOY.md` pour les guides détaillés.

## 📚 Documentation complète

- **API_ENDPOINTS.md** : Documentation API complète
- **ARCHITECTURE.md** : Architecture technique
- **COMMANDS.md** : Commandes utiles
- **DEPLOY.md** : Guide de déploiement

## 🆘 Dépannage

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
psql -U legaluser -d legal_agenda

# Vérifier les dépendances
npm install

# Régénérer Prisma
npm run prisma:generate
```

### Erreurs de migration
```bash
# Réinitialiser
npm run prisma:migrate reset

# Réappliquer
npm run prisma:migrate
```

### Emails ne partent pas
```bash
# Vérifier la config SMTP dans .env
# Tester avec Gmail + App Password
# Vérifier les logs
```

## 💡 Astuces

### Développement rapide
```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Prisma Studio
npm run prisma:studio

# Terminal 3: Logs PostgreSQL
docker-compose logs -f postgres
```

### Tester l'API rapidement
```bash
# Sauvegarder le token
export TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalagenda.com","password":"admin123"}' \
  | jq -r '.access_token')

# Utiliser
curl -X GET http://localhost:3001/api/cases \
  -H "Authorization: Bearer $TOKEN"
```

---

**Backend développé avec NestJS + Prisma + PostgreSQL**
