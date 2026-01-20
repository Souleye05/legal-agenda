# Correction du problème Docker

## Problème identifié

Conflit de versions de dépendances :
- `@nestjs/swagger@11.2.5` nécessite `@nestjs/common@^11.0.1`
- Le projet utilise `@nestjs/common@10.4.22`

## Corrections appliquées

### 1. Downgrade de @nestjs/swagger

**Fichier**: `backend/package.json`

```json
"@nestjs/swagger": "^7.4.2"  // au lieu de "^11.2.5"
```

Version 7.4.2 est compatible avec NestJS 10.

### 2. Mise à jour du Dockerfile

**Fichier**: `backend/Dockerfile`

Ajout de `--legacy-peer-deps` pour éviter les conflits :

```dockerfile
# Builder stage
RUN npm ci --legacy-peer-deps

# Production stage  
RUN npm ci --only=production --legacy-peer-deps
```

### 3. Régénération du package-lock.json

Le fichier `backend/package-lock.json` a été régénéré avec les bonnes versions.

## Commande pour relancer Docker

```bash
docker-compose up -d --build
```

Le flag `--build` force la reconstruction des images avec les nouvelles dépendances.

## Temps estimé

La construction prendra environ 2-3 minutes.

## Vérification

Une fois Docker démarré, vérifier que tout fonctionne :

```bash
# Voir les logs
docker-compose logs -f backend

# Vérifier que l'API répond
curl http://localhost:3001/api/docs
```

Vous devriez voir :
```
🚀 Legal Agenda API running on http://localhost:3001/api
📚 API Documentation available at http://localhost:3001/api/docs
```

## Alternative : Développement sans Docker

Si Docker pose problème, vous pouvez continuer en mode développement local :

```bash
# Backend
cd backend
npm run start:dev

# Frontend (autre terminal)
cd frontend
npm run dev
```

L'application fonctionnera de la même manière.
