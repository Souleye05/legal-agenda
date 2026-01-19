# 🚀 Comment mettre le projet sur GitHub

## 📋 Méthode rapide (Recommandée)

### Étape 1 : Créer le dépôt sur GitHub

1. **Aller sur** : https://github.com/new
2. **Remplir** :
   - Nom : `legal-agenda`
   - Description : `Application d'agenda juridique collaborative`
   - Visibilité : **Private** (recommandé)
   - ⚠️ **NE PAS** cocher "Add a README file"
3. **Cliquer** sur "Create repository"
4. **Copier l'URL** qui s'affiche (ex: `https://github.com/username/legal-agenda.git`)

### Étape 2 : Utiliser le script automatique

Ouvrir PowerShell dans le dossier du projet et exécuter :

```powershell
.\setup-github.ps1
```

Le script va :
- ✅ Vérifier Git
- ✅ Configurer votre nom et email
- ✅ Vérifier les fichiers sensibles
- ✅ Créer le commit
- ✅ Connecter à GitHub
- ✅ Pousser le code

**C'est tout ! 🎉**

---

## 📝 Méthode manuelle

Si vous préférez faire manuellement :

### 1. Créer le dépôt sur GitHub (comme ci-dessus)

### 2. Ouvrir PowerShell dans le dossier du projet

```powershell
cd C:\Users\Souley\OneDrive\Documents\Workspaces\lovable-export-f48e707c
```

### 3. Initialiser Git (si pas déjà fait)

```powershell
git init
```

### 4. Configurer Git (première fois uniquement)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### 5. Ajouter les fichiers

```powershell
git add .
git commit -m "Initial commit - Legal Agenda Application"
```

### 6. Connecter à GitHub

Remplacer `USERNAME` par votre nom d'utilisateur GitHub :

```powershell
git remote add origin https://github.com/USERNAME/legal-agenda.git
git branch -M main
git push -u origin main
```

### 7. Authentification

Si demande de mot de passe, utilisez un **Personal Access Token** :

1. Aller sur : https://github.com/settings/tokens/new
2. Cocher : `repo` (tous)
3. Générer et copier le token
4. Utiliser le token comme mot de passe

---

## ✅ Vérification

1. Aller sur : `https://github.com/USERNAME/legal-agenda`
2. Vérifier que tous les fichiers sont là
3. Le README.md devrait s'afficher

---

## 🔒 Sécurité

### ⚠️ Fichiers à NE JAMAIS pousser

Le `.gitignore` est déjà configuré pour exclure :
- ❌ `backend/.env` (secrets)
- ❌ `frontend/.env` (config locale)
- ❌ `node_modules/` (dépendances)
- ❌ Fichiers temporaires

### ✅ Vérifier avant de pousser

```powershell
# Voir ce qui sera poussé
git status

# Vérifier qu'il n'y a pas de .env
git ls-files | findstr .env
# Ne devrait montrer que .env.example
```

---

## 🔄 Après modifications

```powershell
# Voir les modifications
git status

# Ajouter les fichiers modifiés
git add .

# Commiter
git commit -m "Description des modifications"

# Pousser
git push
```

---

## 👥 Inviter des collaborateurs

1. Sur GitHub → Settings → Collaborators
2. Add people
3. Entrer leur username GitHub

---

## 📚 Documentation complète

Voir **GITHUB_SETUP.md** pour :
- Guide détaillé
- Commandes Git courantes
- Gestion des branches
- Bonnes pratiques
- Résolution de problèmes

---

## 🆘 Problèmes courants

### "Git n'est pas reconnu"
→ Installer Git : https://git-scm.com/download/win

### "Authentication failed"
→ Utiliser un Personal Access Token au lieu du mot de passe

### "Remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/USERNAME/legal-agenda.git
```

### Fichier .env commité par erreur
```powershell
git rm --cached backend/.env
git commit --amend -m "Remove .env file"
# Et changer TOUS les secrets immédiatement !
```

---

## 🎯 Checklist

Avant de pousser :
- [ ] Dépôt créé sur GitHub
- [ ] Git configuré (nom + email)
- [ ] Pas de fichiers `.env` (sauf `.env.example`)
- [ ] Code fonctionne localement
- [ ] Message de commit clair

---

## 🎉 C'est fait !

Votre projet est maintenant sur GitHub !

**Prochaine étape** : Voir `DEPLOY.md` pour déployer en production

---

## 💡 Astuces

### Cloner le projet ailleurs

```powershell
git clone https://github.com/USERNAME/legal-agenda.git
cd legal-agenda
```

### Voir l'historique

```powershell
git log --oneline
```

### Annuler le dernier commit (non poussé)

```powershell
git reset --soft HEAD~1
```

---

**Besoin d'aide ?** Consultez **GITHUB_SETUP.md** pour le guide complet.
