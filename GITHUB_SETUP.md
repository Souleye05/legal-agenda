# 🚀 Guide de mise sur GitHub - Legal Agenda

## 📋 Prérequis

- Compte GitHub créé
- Git installé sur votre machine
- Accès terminal/PowerShell

## 🔧 Installation de Git (si nécessaire)

### Windows
Télécharger depuis : https://git-scm.com/download/win

### Vérifier l'installation
```bash
git --version
```

## 📝 Étape 1 : Créer le dépôt sur GitHub

### Option A : Via l'interface web (Recommandé)

1. **Aller sur GitHub** : https://github.com
2. **Se connecter** à votre compte
3. **Cliquer sur le bouton "+"** en haut à droite
4. **Sélectionner "New repository"**
5. **Remplir les informations** :
   - Repository name : `legal-agenda`
   - Description : `Application d'agenda juridique collaborative`
   - Visibilité : **Private** (recommandé) ou Public
   - ⚠️ **NE PAS** cocher "Initialize with README" (on a déjà un README)
   - ⚠️ **NE PAS** ajouter .gitignore (on en a déjà un)
6. **Cliquer sur "Create repository"**

### Option B : Via GitHub CLI (Avancé)
```bash
gh repo create legal-agenda --private --source=. --remote=origin
```

## 📤 Étape 2 : Initialiser Git localement

Ouvrir PowerShell dans le dossier du projet :

```powershell
# Se placer dans le dossier du projet
cd C:\Users\Souley\OneDrive\Documents\Workspaces\lovable-export-f48e707c

# Initialiser Git (si pas déjà fait)
git init

# Vérifier le statut
git status
```

## 🔗 Étape 3 : Configurer Git (première fois uniquement)

```powershell
# Configurer votre nom
git config --global user.name "Votre Nom"

# Configurer votre email (celui de GitHub)
git config --global user.email "votre-email@example.com"

# Vérifier la configuration
git config --list
```

## 📦 Étape 4 : Ajouter les fichiers

```powershell
# Ajouter tous les fichiers
git add .

# Vérifier ce qui va être commité
git status

# Créer le premier commit
git commit -m "Initial commit - Legal Agenda Application"
```

## 🌐 Étape 5 : Connecter au dépôt GitHub

Remplacer `VOTRE-USERNAME` par votre nom d'utilisateur GitHub :

```powershell
# Ajouter le remote
git remote add origin https://github.com/VOTRE-USERNAME/legal-agenda.git

# Vérifier le remote
git remote -v
```

## 🚀 Étape 6 : Pousser le code

```powershell
# Renommer la branche en main (si nécessaire)
git branch -M main

# Pousser le code
git push -u origin main
```

### Si demande d'authentification

GitHub ne supporte plus les mots de passe. Utilisez un **Personal Access Token** :

1. **Aller sur GitHub** → Settings → Developer settings
2. **Personal access tokens** → Tokens (classic)
3. **Generate new token** (classic)
4. **Sélectionner les permissions** :
   - ✅ repo (tous)
   - ✅ workflow
5. **Copier le token** (vous ne le reverrez plus !)
6. **Utiliser le token** comme mot de passe lors du push

## ✅ Étape 7 : Vérifier

1. **Aller sur GitHub** : https://github.com/VOTRE-USERNAME/legal-agenda
2. **Vérifier que tous les fichiers sont là**
3. **Le README.md devrait s'afficher** automatiquement

## 📁 Structure sur GitHub

Votre dépôt devrait ressembler à :

```
legal-agenda/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
├── START_HERE.md
└── ... (tous les autres fichiers)
```

## 🔒 Sécurité : Fichiers à ne PAS pousser

Le `.gitignore` est déjà configuré pour exclure :
- ✅ `backend/.env` (secrets)
- ✅ `frontend/.env` (config locale)
- ✅ `node_modules/` (dépendances)
- ✅ `dist/` (builds)
- ✅ Fichiers temporaires

**Vérifier avant de pousser** :
```powershell
# Voir ce qui sera poussé
git status

# Vérifier qu'il n'y a pas de .env
git ls-files | findstr .env
# Ne devrait montrer que .env.example
```

## 🔄 Commandes Git courantes

### Après modifications

```powershell
# Voir les modifications
git status

# Ajouter les fichiers modifiés
git add .

# Ou ajouter un fichier spécifique
git add backend/src/main.ts

# Commiter
git commit -m "Description des modifications"

# Pousser
git push
```

### Récupérer les modifications

```powershell
# Récupérer les dernières modifications
git pull
```

### Voir l'historique

```powershell
# Voir les commits
git log

# Voir les commits (format court)
git log --oneline
```

## 🌿 Branches (Optionnel)

Pour travailler sur des fonctionnalités séparées :

```powershell
# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Voir les branches
git branch

# Changer de branche
git checkout main

# Fusionner une branche
git checkout main
git merge feature/nouvelle-fonctionnalite

# Pousser une branche
git push -u origin feature/nouvelle-fonctionnalite
```

## 👥 Collaborer

### Inviter des collaborateurs

1. **Sur GitHub** → Settings → Collaborators
2. **Add people**
3. **Entrer leur username GitHub**

### Cloner le projet (pour les collaborateurs)

```powershell
git clone https://github.com/VOTRE-USERNAME/legal-agenda.git
cd legal-agenda
```

## 📝 Bonnes pratiques

### Messages de commit

Utilisez des messages clairs :
```powershell
# ✅ Bon
git commit -m "feat: ajout export PDF audiences"
git commit -m "fix: correction bug alertes emails"
git commit -m "docs: mise à jour README"

# ❌ Mauvais
git commit -m "update"
git commit -m "fix"
```

### Conventions
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Tâches diverses

## 🔐 Secrets et variables d'environnement

### ⚠️ NE JAMAIS commiter

- ❌ Mots de passe
- ❌ Clés API
- ❌ Tokens JWT
- ❌ Credentials SMTP
- ❌ Fichiers .env

### ✅ À la place

- ✅ Utiliser `.env.example` avec des valeurs factices
- ✅ Documenter les variables nécessaires
- ✅ Utiliser GitHub Secrets pour CI/CD

## 🚨 En cas d'erreur

### Fichier sensible commité par erreur

```powershell
# Supprimer du dernier commit (avant push)
git rm --cached backend/.env
git commit --amend -m "Remove .env file"

# Si déjà poussé, contacter GitHub Support
# Et changer TOUS les secrets immédiatement
```

### Annuler le dernier commit (non poussé)

```powershell
# Garder les modifications
git reset --soft HEAD~1

# Supprimer les modifications
git reset --hard HEAD~1
```

## 📊 GitHub Actions (CI/CD) - Optionnel

Créer `.github/workflows/ci.yml` pour automatiser :
- Tests
- Build
- Déploiement

Exemple basique :
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm install
      - run: cd backend && npm test
```

## 🎯 Checklist finale

Avant de pousser :
- [ ] `.gitignore` est en place
- [ ] Pas de fichiers `.env` (sauf `.env.example`)
- [ ] Pas de `node_modules/`
- [ ] README.md est à jour
- [ ] Code fonctionne localement
- [ ] Commit message est clair

## 📚 Ressources

- **Documentation Git** : https://git-scm.com/doc
- **GitHub Docs** : https://docs.github.com
- **Git Cheat Sheet** : https://education.github.com/git-cheat-sheet-education.pdf

## 🆘 Aide

### Commandes utiles

```powershell
# Aide Git
git help

# Aide sur une commande
git help commit

# Statut détaillé
git status -v

# Voir les différences
git diff
```

## 🎉 C'est fait !

Votre projet est maintenant sur GitHub ! 🚀

Vous pouvez :
- ✅ Partager le lien avec votre équipe
- ✅ Travailler en collaboration
- ✅ Suivre l'historique des modifications
- ✅ Déployer depuis GitHub

---

**Prochaine étape** : Voir `DEPLOY.md` pour déployer en production
