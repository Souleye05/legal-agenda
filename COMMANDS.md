# 🛠️ Commandes utiles - Legal Agenda

## 🐳 Docker

### Démarrage
```bash
# Démarrer tous les services
docker-compose up -d

# Démarrer avec logs
docker-compose up

# Reconstruire et démarrer
docker-compose up --build -d
```

### Arrêt
```bash
# Arrêter les services
docker-compose down

# Arrêter et supprimer volumes (⚠️ supprime la base)
docker-compose down -v
```

### Logs
```bash
# Voir tous les logs
docker-compose logs -f

# Logs backend uniquement
docker-compose logs -f backend

# Logs frontend uniquement
docker-compose logs -f frontend

# Logs PostgreSQL
docker-compose logs -f postgres
```

### Gestion
```bash
# Lister les conteneurs
docker-compose ps

# Redémarrer un service
docker-compose restart backend

# Exécuter une commande dans un conteneur
docker-compose exec backend npm run prisma:studio
```

---

## 🔧 Backend (NestJS)

### Installation
```bash
cd backend
npm install
```

### Développement
```bash
# Démarrer en mode dev (hot reload)
npm run start:dev

# Démarrer en mode debug
npm run start:debug
```

### Build & Production
```bash
# Build
npm run build

# Démarrer en production
npm run start:prod
```

### Prisma
```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npx prisma migrate dev --name description_changement

# Appliquer les migrations
npm run prisma:migrate

# Appliquer en production
npx prisma migrate deploy

# Réinitialiser la base
npx prisma migrate reset

# Peupler avec données de test
npm run prisma:seed

# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio
```

### Tests
```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## ⚛️ Frontend (React)

### Installation
```bash
npm install
```

### Développement
```bash
# Démarrer le serveur de dev
npm run dev

# Démarrer sur un port spécifique
npm run dev -- --port 3000
```

### Build & Production
```bash
# Build pour production
npm run build

# Preview du build
npm run preview
```

### Tests
```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch
```

### Linting
```bash
# Linter
npm run lint

# Fix automatique
npm run lint -- --fix
```

---

## 🗄️ PostgreSQL

### Connexion
```bash
# Via psql (local)
psql -U legaluser -d legal_agenda -h localhost

# Via Docker
docker-compose exec postgres psql -U legaluser -d legal_agenda
```

### Commandes SQL utiles
```sql
-- Lister les tables
\dt

-- Décrire une table
\d cases

-- Compter les affaires
SELECT COUNT(*) FROM cases;

-- Affaires actives
SELECT * FROM cases WHERE status = 'ACTIVE';

-- Audiences non renseignées
SELECT * FROM hearings WHERE status = 'NON_RENSEIGNEE';

-- Alertes en attente
SELECT * FROM alerts WHERE status = 'PENDING';

-- Quitter
\q
```

### Backup & Restore
```bash
# Backup
docker-compose exec postgres pg_dump -U legaluser legal_agenda > backup.sql

# Restore
docker-compose exec -T postgres psql -U legaluser legal_agenda < backup.sql
```

---

## 🔐 Authentification

### Créer un utilisateur admin
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cabinet.com",
    "password": "SecurePassword123",
    "fullName": "Maître Dupont",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legalagenda.com",
    "password": "admin123"
  }'
```

---

## 📡 API Testing

### Variables
```bash
# Sauvegarder le token
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export API_URL="http://localhost:3001/api"
```

### Cases
```bash
# Liste des affaires
curl -X GET $API_URL/cases \
  -H "Authorization: Bearer $TOKEN"

# Créer une affaire
curl -X POST $API_URL/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test c/ Test - Litige",
    "parties": [
      {"name": "Demandeur", "role": "DEMANDEUR"},
      {"name": "Défendeur", "role": "DEFENDEUR"}
    ],
    "jurisdiction": "Tribunal Judiciaire",
    "chamber": "Chambre civile"
  }'

# Statistiques
curl -X GET $API_URL/cases/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Hearings
```bash
# Audiences à renseigner
curl -X GET $API_URL/hearings/unreported \
  -H "Authorization: Bearer $TOKEN"

# Audiences de demain
curl -X GET $API_URL/hearings/tomorrow \
  -H "Authorization: Bearer $TOKEN"

# Créer une audience
curl -X POST $API_URL/hearings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "uuid-de-affaire",
    "date": "2026-01-25",
    "time": "10:00",
    "type": "PLAIDOIRIE",
    "preparationNotes": "Préparer dossier complet"
  }'

# Renseigner un résultat (RENVOI)
curl -X POST $API_URL/hearings/uuid-audience/result \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "RENVOI",
    "newDate": "2026-02-15",
    "postponementReason": "Conclusions non échangées"
  }'
```

---

## 🔍 Debugging

### Logs Backend
```bash
# Logs en temps réel
cd backend
npm run start:dev

# Avec debug
DEBUG=* npm run start:dev
```

### Logs Frontend
```bash
# Console du navigateur (F12)
# Ou logs Vite
npm run dev
```

### Prisma Studio
```bash
cd backend
npm run prisma:studio
# Ouvre http://localhost:5555
```

### Vérifier la base
```bash
# Connexion
docker-compose exec postgres psql -U legaluser legal_agenda

# Vérifier les données
SELECT COUNT(*) FROM cases;
SELECT COUNT(*) FROM hearings;
SELECT COUNT(*) FROM alerts WHERE status = 'PENDING';
```

---

## 🧹 Nettoyage

### Réinitialiser tout
```bash
# Arrêter et supprimer
docker-compose down -v

# Supprimer node_modules
rm -rf node_modules backend/node_modules

# Réinstaller
npm install
cd backend && npm install
```

### Réinitialiser la base uniquement
```bash
cd backend
npm run prisma:migrate reset
npm run prisma:seed
```

---

## 🚀 Déploiement

### Render
```bash
# 1. Push sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Connecter Render à GitHub
# 3. Utiliser render.yaml (déjà configuré)
```

### Railway
```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Créer projet
railway init

# 4. Déployer
railway up
```

### Vercel (Frontend uniquement)
```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Déployer
vercel

# 4. Production
vercel --prod
```

---

## 📊 Monitoring

### Vérifier les services
```bash
# Backend
curl http://localhost:3001/api

# Frontend
curl http://localhost:5173

# PostgreSQL
docker-compose exec postgres pg_isready -U legaluser
```

### Vérifier les alertes
```bash
# Logs du scheduler
docker-compose logs -f backend | grep "alert"

# Alertes en base
docker-compose exec postgres psql -U legaluser legal_agenda \
  -c "SELECT * FROM alerts WHERE status = 'PENDING';"
```

---

## 🔧 Configuration

### Changer l'horaire des alertes
```bash
# Éditer backend/.env
ALERT_CRON_SCHEDULE="0 9 * * *"  # 9h00 au lieu de 20h00

# Redémarrer
docker-compose restart backend
```

### Changer le port backend
```bash
# Éditer backend/.env
PORT=4000

# Éditer .env frontend
VITE_API_URL=http://localhost:4000/api

# Redémarrer
docker-compose restart
```

---

## 📝 Git

### Workflow standard
```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Commit
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"

# Push
git push origin feature/nouvelle-fonctionnalite

# Merge dans main
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main
```

### Conventions de commit
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: ajout de tests
chore: tâches diverses
```

---

## 🆘 Dépannage

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
docker-compose ps postgres

# Vérifier les logs
docker-compose logs backend

# Réinitialiser
docker-compose down -v
docker-compose up -d
```

### Frontend ne se connecte pas
```bash
# Vérifier l'URL de l'API
cat .env

# Vérifier le backend
curl http://localhost:3001/api

# Vérifier la console navigateur (F12)
```

### Erreurs Prisma
```bash
cd backend

# Régénérer le client
npm run prisma:generate

# Réappliquer les migrations
npm run prisma:migrate

# En dernier recours
npm run prisma:migrate reset
```

---

## 💡 Astuces

### Développement rapide
```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Prisma Studio
cd backend && npm run prisma:studio

# Terminal 4: Logs PostgreSQL
docker-compose logs -f postgres
```

### Tester rapidement
```bash
# Login et sauvegarder token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalagenda.com","password":"admin123"}' \
  | jq -r '.access_token')

# Utiliser le token
curl -X GET http://localhost:3001/api/cases \
  -H "Authorization: Bearer $TOKEN"
```

### Backup automatique
```bash
# Créer un script backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U legaluser legal_agenda > backup_$DATE.sql
echo "Backup créé: backup_$DATE.sql"

# Rendre exécutable
chmod +x backup.sh

# Exécuter
./backup.sh
```
