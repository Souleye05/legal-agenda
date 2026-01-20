# Test de connexion - Guide de dépannage

## Identifiants de test

```json
{
  "email": "admin@legalagenda.com",
  "password": "admin123"
}
```

## Étapes de test

### 1. Vérifier que le backend est démarré

```bash
cd backend
npm run start:dev
```

Vous devriez voir :
```
🚀 Legal Agenda API running on http://localhost:3001/api
📚 API Documentation available at http://localhost:3001/api/docs
```

### 2. Redémarrer le frontend

**IMPORTANT** : Après avoir modifié `api.ts`, vous DEVEZ redémarrer le frontend.

```bash
# Arrêter le frontend (Ctrl+C dans le terminal)
# Puis relancer :
cd frontend
npm run dev
```

### 3. Ouvrir le navigateur

1. Ouvrir `http://localhost:5173`
2. Ouvrir la console du navigateur (F12)
3. Aller sur l'onglet **Console**

### 4. Tester la connexion

1. Aller sur la page de connexion
2. Entrer les identifiants :
   - Email: `admin@legalagenda.com`
   - Password: `admin123`
3. Cliquer sur "Se connecter"

### 5. Vérifier les logs dans la console

Vous devriez voir dans la console du navigateur :

```
🔗 API URL: http://localhost:3001/api
🔐 Attempting login to: http://localhost:3001/api/auth/login
📧 Email: admin@legalagenda.com
✅ Login successful: { id: "...", email: "...", fullName: "...", role: "ADMIN" }
```

## Problèmes courants

### Erreur "Failed to fetch"

**Causes possibles :**
1. Le backend n'est pas démarré
2. Le backend est sur un port différent
3. Problème de CORS
4. Le frontend n'a pas été redémarré après modification

**Solutions :**
1. Vérifier que le backend tourne sur le port 3001
2. Redémarrer le frontend
3. Vider le cache du navigateur (Ctrl+Shift+Delete)
4. Essayer en navigation privée

### Erreur "Email ou mot de passe incorrect"

**Causes possibles :**
1. L'utilisateur n'existe pas dans la base de données
2. Le mot de passe est incorrect

**Solutions :**
1. Exécuter le seed pour créer les utilisateurs de test :
   ```bash
   cd backend
   npm run prisma:seed
   ```

### Erreur CORS

**Symptôme :** Message dans la console du type "CORS policy"

**Solution :**
1. Vérifier que `FRONTEND_URL` est défini dans `backend/.env`
2. Redémarrer le backend

## Test manuel avec curl

Pour vérifier que le backend fonctionne :

```bash
# Windows PowerShell
$body = @{email='admin@legalagenda.com';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

Vous devriez recevoir un JSON avec `access_token`, `refresh_token` et `user`.

## Vérifier la base de données

```bash
cd backend
npm run prisma:studio
```

Ouvrir `http://localhost:5555` et vérifier que la table `Utilisateur` contient l'utilisateur `admin@legalagenda.com`.

## Logs de debug

Les logs suivants ont été ajoutés dans `frontend/src/lib/api.ts` :
- `🔗 API URL:` - Affiche l'URL de l'API utilisée
- `🔐 Attempting login to:` - Affiche l'URL complète de connexion
- `📧 Email:` - Affiche l'email utilisé
- `✅ Login successful:` - Affiche les données de l'utilisateur connecté

Ces logs vous aideront à identifier où se situe le problème.

## Après le test

Une fois que la connexion fonctionne, vous pouvez retirer les logs de debug dans `api.ts` si vous le souhaitez.
