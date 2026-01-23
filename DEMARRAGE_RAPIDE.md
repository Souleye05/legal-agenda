# Démarrage rapide - Legal Agenda

## ✅ Le cache a été nettoyé !

Vous pouvez maintenant démarrer le serveur :

```powershell
cd frontend
npm run dev
```

Le serveur devrait démarrer sur http://localhost:8080

## 🔧 Si vous avez encore des erreurs

### 1. Vérifier que le backend tourne
```powershell
cd backend
npm run start:dev
```

Le backend devrait être sur http://localhost:3001

### 2. Vérifier les variables d'environnement

**Frontend (.env) :**
```
VITE_API_URL=http://localhost:3001/api
```

**Backend (.env) :**
```
DATABASE_URL="postgresql://postgres:passer@localhost:5432/legal_agenda?schema=public"
PORT=3001
```

### 3. Si le problème persiste

Nettoyage complet :
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## 📋 Commandes utiles

### Démarrer le projet complet

**Terminal 1 - Backend :**
```powershell
cd backend
npm run start:dev
```

**Terminal 2 - Frontend :**
```powershell
cd frontend
npm run dev
```

### Nettoyer le cache (si nécessaire)

**PowerShell :**
```powershell
.\CLEAR_CACHE.ps1
```

Ou manuellement :
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

## 🎯 Pages disponibles

Une fois le serveur démarré, vous pouvez accéder à :

- **Dashboard** : http://localhost:8080/
- **Affaires** : http://localhost:8080/affaires
- **Nouvelle affaire** : http://localhost:8080/affaires/nouvelle
- **Agenda** : http://localhost:8080/agenda
- **À renseigner** : http://localhost:8080/a-renseigner
- **Demain** : http://localhost:8080/demain
- **Profil** : http://localhost:8080/profil

## 🆕 Nouvelles fonctionnalités

### Détails d'audience
- URL : `/audiences/:id`
- Affiche toutes les informations d'une audience
- Actions : Modifier, Renseigner, Supprimer

### Modifier une audience
- URL : `/audiences/:id/modifier`
- Modifier date, heure, type, notes
- Marquer comme préparée

### Renseigner le résultat
- URL : `/audiences/:id/renseigner`
- 3 types : Renvoi, Radiation, Délibéré
- Champs conditionnels selon le type

### Modifier une affaire
- URL : `/affaires/:id/modifier`
- Modifier titre, juridiction, chambre, ville, observations

## 📚 Documentation

- **Architecture** : `docs/ARCHITECTURE.md`
- **API Endpoints** : `docs/API_ENDPOINTS.md`
- **Corrections appliquées** : `docs/CODE_REVIEW_FIXES.md`
- **Fonctionnalités** : `docs/EDIT_AND_RECORD_FEATURES.md`
- **Fix cache Vite** : `docs/VITE_CACHE_FIX.md`

## ❓ Problèmes courants

### Port déjà utilisé
```powershell
# Trouver le processus sur le port 8080
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Erreur de connexion à la base de données
```powershell
# Vérifier que PostgreSQL tourne
# Vérifier DATABASE_URL dans backend/.env
```

### Erreur "Cannot find module"
```powershell
cd frontend
npm install
```

## 🚀 Prêt à démarrer !

Tout est configuré. Lancez simplement :

```powershell
cd frontend
npm run dev
```

Et ouvrez http://localhost:8080 dans votre navigateur !

---

**Besoin d'aide ?** Consultez la documentation dans le dossier `docs/`
