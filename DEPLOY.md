# 🚀 Guide de déploiement - Legal Agenda

## Options de déploiement

1. **Render** (Recommandé) - Gratuit pour commencer
2. **Railway** - Simple et rapide
3. **Vercel** (Frontend) + Render/Railway (Backend)
4. **VPS** (DigitalOcean, Linode, etc.)

---

## 🎯 Option 1 : Render (Recommandé)

### Avantages
- ✅ Gratuit pour commencer
- ✅ PostgreSQL inclus
- ✅ Configuration automatique avec render.yaml
- ✅ SSL automatique
- ✅ Déploiement continu depuis GitHub

### Étapes

#### 1. Préparer le code
```bash
# Vérifier que tout fonctionne localement
docker-compose up -d

# Commit et push sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Créer un compte Render
- Aller sur https://render.com
- S'inscrire (gratuit)
- Connecter votre compte GitHub

#### 3. Créer la base de données
- Dashboard → New → PostgreSQL
- Name: `legal-agenda-db`
- Plan: Free
- Créer

**Copier l'URL de connexion** (Internal Database URL)

#### 4. Déployer le Backend
- Dashboard → New → Web Service
- Connecter votre repo GitHub
- Settings:
  - Name: `legal-agenda-backend`
  - Root Directory: `backend`
  - Environment: `Node`
  - Build Command: `npm install && npx prisma generate && npm run build`
  - Start Command: `npx prisma migrate deploy && npm run start:prod`
  - Plan: Free

**Variables d'environnement** :
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<coller l'URL de la base>
JWT_SECRET=<générer un secret fort>
JWT_EXPIRATION=7d
FRONTEND_URL=<URL du frontend une fois déployé>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<votre email>
SMTP_PASSWORD=<votre app password>
SMTP_FROM=Legal Agenda <noreply@legalagenda.com>
ALERT_CRON_SCHEDULE=0 20 * * *
```

**Générer un JWT_SECRET** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Déployer le Frontend
- Dashboard → New → Static Site
- Connecter votre repo GitHub
- Settings:
  - Name: `legal-agenda-frontend`
  - Root Directory: `.` (racine)
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

**Variables d'environnement** :
```
VITE_API_URL=https://legal-agenda-backend.onrender.com/api
```

#### 6. Mettre à jour FRONTEND_URL
- Retourner dans les settings du backend
- Mettre à jour `FRONTEND_URL` avec l'URL du frontend
- Redéployer le backend

#### 7. Tester
- Ouvrir l'URL du frontend
- Se connecter avec admin@legalagenda.com / admin123
- Créer une affaire de test

### Coûts Render
- **Free Plan** : Gratuit
  - 750h/mois
  - Base de données 1GB
  - Suffisant pour démarrer
- **Starter Plan** : $7/mois
  - Toujours actif
  - Plus de ressources

---

## 🚂 Option 2 : Railway

### Avantages
- ✅ Très simple
- ✅ PostgreSQL inclus
- ✅ $5 de crédit gratuit
- ✅ CLI puissant

### Étapes

#### 1. Installer Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login
```bash
railway login
```

#### 3. Créer un projet
```bash
railway init
```

#### 4. Ajouter PostgreSQL
```bash
railway add postgresql
```

#### 5. Déployer le Backend
```bash
cd backend
railway up
```

#### 6. Configurer les variables
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<votre-secret>
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_USER=<votre-email>
railway variables set SMTP_PASSWORD=<votre-password>
# etc.
```

#### 7. Déployer le Frontend
```bash
cd ..
railway up
```

### Coûts Railway
- **Trial** : $5 gratuit
- **Developer** : $5/mois
- **Team** : $20/mois

---

## ☁️ Option 3 : Vercel (Frontend) + Backend séparé

### Frontend sur Vercel

#### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```

#### 3. Déployer
```bash
vercel

# Production
vercel --prod
```

#### 4. Configurer les variables
```bash
vercel env add VITE_API_URL
# Entrer l'URL de votre backend
```

### Backend sur Render ou Railway
Suivre les étapes ci-dessus pour le backend uniquement.

---

## 🖥️ Option 4 : VPS (DigitalOcean, Linode, etc.)

### Prérequis
- VPS avec Ubuntu 22.04
- Nom de domaine (optionnel)

### Étapes

#### 1. Connexion SSH
```bash
ssh root@your-server-ip
```

#### 2. Installer les dépendances
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Docker (optionnel)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### 3. Configurer PostgreSQL
```bash
sudo -u postgres psql

CREATE DATABASE legal_agenda;
CREATE USER legaluser WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE legal_agenda TO legaluser;
\q
```

#### 4. Cloner le projet
```bash
git clone <your-repo-url>
cd legal-agenda
```

#### 5. Configurer Backend
```bash
cd backend
cp .env.example .env
nano .env
# Éditer les variables

npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build
```

#### 6. Installer PM2
```bash
npm install -g pm2

# Démarrer le backend
cd backend
pm2 start dist/main.js --name legal-agenda-backend

# Sauvegarder
pm2 save
pm2 startup
```

#### 7. Configurer Nginx
```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/legal-agenda
```

```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/legal-agenda/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/legal-agenda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Build Frontend
```bash
cd ..
npm install
npm run build

# Copier vers Nginx
sudo mkdir -p /var/www/legal-agenda
sudo cp -r dist/* /var/www/legal-agenda/
```

#### 9. SSL avec Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 📧 Configuration Email (Gmail)

### 1. Activer la validation en 2 étapes
- Aller sur https://myaccount.google.com/security
- Activer la validation en 2 étapes

### 2. Créer un mot de passe d'application
- Aller sur https://myaccount.google.com/apppasswords
- Sélectionner "Autre (nom personnalisé)"
- Entrer "Legal Agenda"
- Copier le mot de passe généré

### 3. Utiliser dans .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<mot-de-passe-application>
```

---

## 🔒 Sécurité en production

### Checklist
- [ ] Changer JWT_SECRET (générer un fort)
- [ ] Utiliser HTTPS (SSL)
- [ ] Configurer CORS correctement
- [ ] Utiliser des mots de passe forts
- [ ] Activer les backups base de données
- [ ] Configurer les logs
- [ ] Limiter les tentatives de login
- [ ] Mettre à jour régulièrement

### Variables sensibles
```env
# ❌ NE JAMAIS commiter
JWT_SECRET=<secret-fort-64-caracteres>
DATABASE_URL=<url-avec-password>
SMTP_PASSWORD=<app-password>

# ✅ Utiliser des secrets managers
# - Render: Environment Variables
# - Railway: Variables
# - Vercel: Environment Variables
```

---

## 📊 Monitoring

### Logs Backend
```bash
# Render
Dashboard → Service → Logs

# Railway
railway logs

# VPS
pm2 logs legal-agenda-backend
```

### Santé de l'API
```bash
curl https://your-api-url.com/api
```

### Base de données
```bash
# Render
Dashboard → Database → Metrics

# Railway
railway run psql

# VPS
sudo -u postgres psql legal_agenda
```

---

## 🔄 Mises à jour

### Render / Railway
```bash
# Commit et push
git add .
git commit -m "Update feature"
git push origin main

# Déploiement automatique
```

### VPS
```bash
ssh root@your-server

cd legal-agenda
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart legal-agenda-backend

# Frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/legal-agenda/
```

---

## 💾 Backups

### Automatiser les backups (VPS)
```bash
# Créer un script backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U legaluser legal_agenda > /backups/backup_$DATE.sql
find /backups -mtime +7 -delete

# Rendre exécutable
chmod +x backup.sh

# Cron quotidien (2h du matin)
crontab -e
0 2 * * * /path/to/backup.sh
```

### Render
- Dashboard → Database → Backups
- Automatique sur plans payants

---

## 🎯 Checklist de déploiement

- [ ] Code testé localement
- [ ] Variables d'environnement configurées
- [ ] Base de données créée
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] CORS configuré
- [ ] SSL activé (HTTPS)
- [ ] Email configuré
- [ ] Alertes testées
- [ ] Backups configurés
- [ ] Monitoring actif
- [ ] Documentation à jour

---

## 🆘 Dépannage

### Backend ne démarre pas
```bash
# Vérifier les logs
# Vérifier DATABASE_URL
# Vérifier les migrations Prisma
npx prisma migrate deploy
```

### Frontend ne se connecte pas
```bash
# Vérifier VITE_API_URL
# Vérifier CORS backend
# Vérifier console navigateur (F12)
```

### Emails ne partent pas
```bash
# Vérifier SMTP_*
# Tester avec Gmail App Password
# Vérifier les logs backend
```

---

## 📞 Support

- **Documentation** : Voir tous les fichiers .md
- **Logs** : Toujours vérifier les logs en premier
- **Tests** : Tester localement avant de déployer

---

**Bon déploiement ! 🚀**
