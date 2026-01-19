# 🚀 Guide de démarrage - Legal Agenda

## Installation et lancement de l'application

### Option 1 : Docker (Recommandé - Le plus simple)

**Prérequis** : Docker et Docker Compose installés

```bash
# 1. Cloner le projet
git clone <repo-url>
cd legal-agenda

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env si nécessaire (optionnel pour dev)

# 3. Lancer tous les services
docker-compose up -d

# 4. Attendre que les services démarrent (30-60 secondes)
docker-compose logs -f backend

# 5. Accéder à l'application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
# Base de données: localhost:5432
```

**Identifiants de test** :
- Admin : `admin@legalagenda.com` / `admin123`
- Collaborateur : `collaborateur@legalagenda.com` / `collab123`

### Option 2 : Installation manuelle

#### A. Backend

**Prérequis** :
- Node.js 20+
- PostgreSQL 16+
- npm

```bash
# 1. Installer PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql@16
# Linux: sudo apt install postgresql-16

# 2. Créer la base de données
psql -U postgres
CREATE DATABASE legal_agenda;
CREATE USER legaluser WITH PASSWORD 'legalpass123';
GRANT ALL PRIVILEGES ON DATABASE legal_agenda TO legaluser;
\q

# 3. Configurer le backend
cd backend
npm install

# 4. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres :
# DATABASE_URL="postgresql://legaluser:legalpass123@localhost:5432/legal_agenda?schema=public"

# 5. Initialiser la base de données
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 6. Démarrer le serveur
npm run start:dev

# Le backend sera accessible sur http://localhost:3001/api
```

#### B. Frontend

```bash
# Dans un nouveau terminal, à la racine du projet

# 1. Installer les dépendances
npm install

# 2. Configuration
cp .env.example .env
# Vérifier que VITE_API_URL=http://localhost:3001/api

# 3. Démarrer le serveur de développement
npm run dev

# Le frontend sera accessible sur http://localhost:5173
```

## 📱 Utilisation de l'application

### 1. Connexion
- Ouvrir http://localhost:5173
- Se connecter avec les identifiants de test
- Vous arrivez sur le tableau de bord

### 2. Créer une affaire
- Menu "Affaires" → Bouton "Nouvelle affaire"
- Remplir le formulaire :
  - Titre : ex. "Dupont c/ Martin - Expulsion"
  - Parties : Ajouter demandeur(s) et défendeur(s)
  - Juridiction : ex. "Tribunal Judiciaire"
  - Chambre : ex. "Chambre civile"
  - Ville (optionnel)
  - Observations (optionnel)
- Cliquer "Créer"
- Une référence unique est générée automatiquement (AFF-2026-0001)

### 3. Planifier une audience
- Menu "Agenda" → Bouton "Nouvelle audience"
- Ou depuis une affaire → "Ajouter une audience"
- Remplir :
  - Affaire liée
  - Date et heure
  - Type : Mise en état / Plaidoirie / Référé / etc.
  - Notes de préparation
- Cliquer "Créer"

### 4. Préparer l'audience de demain
- Menu "Audience de demain"
- Liste automatique des audiences du lendemain
- Consulter les notes de préparation
- Marquer comme "Préparée" (optionnel)
- Exporter en PDF (à venir)

### 5. Renseigner un résultat d'audience
- Menu "À renseigner" → Liste des audiences passées non renseignées
- Ou depuis l'agenda → Cliquer sur une audience passée
- Bouton "Renseigner le résultat"
- Choisir le type :

**RENVOI** :
- Nouvelle date (obligatoire)
- Motif du renvoi (obligatoire)
- → Crée automatiquement une nouvelle audience

**RADIATION** :
- Motif de radiation (obligatoire)
- → Clôture l'affaire (statut RADIEE)

**DÉLIBÉRÉ** :
- Texte du délibéré (obligatoire)
- → Clôture l'affaire (statut CLOTUREE)

### 6. Système d'alertes
- Les audiences passées non renseignées sont détectées automatiquement
- Statut passe à "NON_RENSEIGNEE"
- Apparaissent dans "À renseigner"
- Email envoyé quotidiennement à 20h00 jusqu'à régularisation
- Alerte s'arrête dès qu'un résultat est renseigné

## 🔧 Configuration avancée

### Alertes par email

Éditer `backend/.env` :

```env
# Gmail (recommandé pour dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password
SMTP_FROM="Legal Agenda <noreply@legalagenda.com>"

# Horaire des alertes (format cron)
ALERT_CRON_SCHEDULE="0 20 * * *"  # 20h00 tous les jours
```

**Pour Gmail** :
1. Activer la validation en 2 étapes
2. Générer un "Mot de passe d'application"
3. Utiliser ce mot de passe dans SMTP_PASSWORD

### Changer l'horaire des alertes

Format cron : `minute heure jour mois jour_semaine`

Exemples :
- `0 20 * * *` → 20h00 tous les jours
- `0 9 * * 1-5` → 9h00 du lundi au vendredi
- `0 */2 * * *` → Toutes les 2 heures

### Créer un utilisateur admin

```bash
# Via l'API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mon-email@cabinet.com",
    "password": "mon-mot-de-passe",
    "fullName": "Maître Dupont",
    "role": "ADMIN"
  }'
```

## 🗄️ Gestion de la base de données

### Prisma Studio (Interface graphique)
```bash
cd backend
npm run prisma:studio
# Ouvre http://localhost:5555
```

### Réinitialiser la base
```bash
cd backend
npm run prisma:migrate reset
npm run prisma:seed
```

### Créer une migration
```bash
cd backend
# Après modification de prisma/schema.prisma
npx prisma migrate dev --name description_changement
```

## 📊 Données de test

Le seed crée automatiquement :
- 2 utilisateurs (admin + collaborateur)
- 2 affaires actives
- 3 audiences (2 à venir, 1 non renseignée)
- 1 alerte en attente

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier PostgreSQL
psql -U legaluser -d legal_agenda -h localhost

# Vérifier les logs
cd backend
npm run start:dev
```

### Erreur de connexion à la base
- Vérifier que PostgreSQL est démarré
- Vérifier DATABASE_URL dans backend/.env
- Vérifier les credentials (user/password)

### Le frontend ne se connecte pas au backend
- Vérifier que le backend tourne sur http://localhost:3001
- Vérifier VITE_API_URL dans .env
- Vérifier la console du navigateur (F12)

### Les emails ne partent pas
- Vérifier la configuration SMTP dans backend/.env
- Tester avec Gmail + App Password
- Vérifier les logs du backend

### Docker : services ne démarrent pas
```bash
# Voir les logs
docker-compose logs -f

# Reconstruire
docker-compose down -v
docker-compose up --build -d
```

## 📚 Ressources

- **Architecture** : Voir `ARCHITECTURE.md`
- **API Documentation** : Voir `backend/README.md`
- **Prisma Schema** : `backend/prisma/schema.prisma`
- **Types TypeScript** : `src/types/legal.ts`

## 🎯 Prochaines étapes

1. ✅ Tester la création d'affaires
2. ✅ Tester la planification d'audiences
3. ✅ Tester le renseignement de résultats
4. ✅ Vérifier les alertes (attendre 20h00 ou modifier le cron)
5. 🚀 Personnaliser selon vos besoins
6. 🚀 Déployer en production

## 💡 Conseils

- Utilisez Prisma Studio pour explorer la base de données
- Consultez les logs du backend pour déboguer
- Les données de test sont réinitialisables à tout moment
- Sauvegardez régulièrement votre base de données en production

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les logs (backend et frontend)
2. Consulter ARCHITECTURE.md
3. Vérifier la configuration (.env)
4. Réinitialiser la base si nécessaire
