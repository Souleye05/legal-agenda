# Rate Limiting et Protection Anti-Brute Force ✅

## Date: 27 janvier 2026

## Statut: IMPLÉMENTÉ

La protection contre les attaques brute force est maintenant **100% opérationnelle**.

---

## 🎯 Fonctionnalités Implémentées

### 1. Rate Limiting Global (@nestjs/throttler)
- ✅ 100 requêtes par minute par IP sur toutes les routes
- ✅ Configuration centralisée dans `app.module.ts`
- ✅ Protection automatique de toutes les API

### 2. Rate Limiting Spécifique Authentification
- ✅ **Login**: 5 tentatives par minute
- ✅ **Register**: 3 inscriptions par minute
- ✅ **Refresh Token**: 10 renouvellements par minute
- ✅ Réponse HTTP 429 (Too Many Requests) automatique

### 3. Blocage IP Intelligent (IpBlockGuard)
- ✅ Blocage après 5 tentatives de connexion échouées
- ✅ Durée de blocage: 15 minutes
- ✅ Fenêtre de détection: 5 minutes
- ✅ Réinitialisation automatique après connexion réussie
- ✅ Nettoyage automatique des IPs expirées

---

## 🔒 Mécanismes de Sécurité

### Protection Multi-Niveaux

```
┌─────────────────────────────────────────┐
│  1. Rate Limiting Global                │
│     100 req/min par IP                  │
│     ↓                                   │
│  2. Rate Limiting Auth                  │
│     5 login/min par IP                  │
│     ↓                                   │
│  3. IP Block Guard                      │
│     Blocage après 5 échecs              │
│     ↓                                   │
│  4. Validation Credentials              │
│     Vérification email/password         │
└─────────────────────────────────────────┘
```

### Scénario d'Attaque Bloqué

```
Attaquant tente brute force:
├─ Tentative 1-5: Autorisées (rate limit)
├─ Tentative 6+: HTTP 429 (rate limit dépassé)
│
Après 1 minute (reset rate limit):
├─ Tentative 1-5: Échecs enregistrés
├─ Tentative 5: IP BLOQUÉE pour 15 minutes
└─ Tentatives suivantes: HTTP 429 avec message de blocage
```

---

## 📋 Configuration

### Rate Limiting Global (app.module.ts)
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,    // 60 secondes
  limit: 100,    // 100 requêtes max
}])
```

### Rate Limiting Auth (auth.controller.ts)
```typescript
@Post('login')
@Throttle({ default: { limit: 5, ttl: 60000 } })
// 5 tentatives par minute

@Post('register')
@Throttle({ default: { limit: 3, ttl: 60000 } })
// 3 inscriptions par minute

@Post('refresh')
@Throttle({ default: { limit: 10, ttl: 60000 } })
// 10 renouvellements par minute
```

### IP Block Guard (ip-block.guard.ts)
```typescript
MAX_ATTEMPTS = 5           // Tentatives max avant blocage
BLOCK_DURATION = 15 min    // Durée du blocage
ATTEMPT_WINDOW = 5 min     // Fenêtre de détection
```

---

## 🛡️ Fonctionnalités du IP Block Guard

### 1. Détection d'IP
- Support des proxies (X-Forwarded-For, X-Real-IP)
- Extraction automatique de l'IP réelle
- Gestion des connexions directes

### 2. Compteur de Tentatives
- Incrémentation à chaque échec de connexion
- Réinitialisation après fenêtre de temps
- Reset automatique après connexion réussie

### 3. Blocage Temporaire
- Activation après MAX_ATTEMPTS échecs
- Message clair avec temps restant
- Logs de sécurité automatiques

### 4. Nettoyage Automatique
- Exécution toutes les 5 minutes
- Suppression des blocages expirés
- Suppression des tentatives anciennes

### 5. Monitoring
- Endpoint `/auth/security/stats` (admin uniquement)
- Statistiques en temps réel:
  - Total IPs suivies
  - IPs actuellement bloquées
  - Total tentatives échouées

---

## 📊 Endpoints de Sécurité

### GET /auth/security/stats (Admin)
```json
{
  "totalBlocked": 15,
  "currentlyBlocked": 3,
  "totalAttempts": 47
}
```

**Accès**: Administrateurs uniquement  
**Utilisation**: Monitoring de sécurité en temps réel

---

## 🔧 Fichiers Modifiés/Créés

### Créés
- ✅ `backend/src/auth/guards/ip-block.guard.ts` - Guard de blocage IP

### Modifiés
- ✅ `backend/src/auth/auth.controller.ts` - Intégration IpBlockGuard
- ✅ `backend/src/auth/auth.module.ts` - Ajout provider IpBlockGuard
- ✅ `backend/src/app.module.ts` - Configuration throttler (déjà présent)

---

## 🎨 Messages d'Erreur

### Rate Limit Dépassé (HTTP 429)
```json
{
  "statusCode": 429,
  "message": "Trop de tentatives, réessayez plus tard",
  "error": "Too Many Requests"
}
```

### IP Bloquée (HTTP 429)
```json
{
  "statusCode": 429,
  "message": "Trop de tentatives de connexion échouées. Votre IP est temporairement bloquée. Réessayez dans 12 minute(s).",
  "error": "Too Many Requests"
}
```

### Identifiants Invalides (HTTP 401)
```json
{
  "statusCode": 401,
  "message": "Email ou mot de passe incorrect",
  "error": "Unauthorized"
}
```

---

## 📝 Logs de Sécurité

### Connexion Réussie
```
[AuthService] Utilisateur connecté avec succès: user@example.com
```

### Tentative Échouée
```
[AuthService] Tentative de mot de passe échouée pour l'utilisateur: uuid
```

### IP Bloquée
```
[SECURITY] IP 192.168.1.100 bloquée jusqu'à 2026-01-27T15:30:00.000Z après 5 tentatives échouées
```

### Nettoyage
```
[SECURITY] 3 IP(s) nettoyée(s) du cache de blocage
```

---

## ✅ Tests de Sécurité

### Test 1: Rate Limiting
```bash
# Envoyer 10 requêtes rapides
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Résultat attendu: 5 premières OK, suivantes HTTP 429
```

### Test 2: Blocage IP
```bash
# Attendre 1 minute (reset rate limit)
# Envoyer 5 tentatives échouées
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  sleep 1
done

# 6ème tentative devrait être bloquée
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# Résultat attendu: HTTP 429 avec message de blocage
```

### Test 3: Statistiques (Admin)
```bash
curl -X GET http://localhost:3001/api/auth/security/stats \
  -H "Authorization: Bearer <admin_token>"

# Résultat attendu: JSON avec statistiques
```

---

## 🚀 Améliorations Futures Possibles

1. **Persistance Redis** - Stocker les blocages en Redis pour scalabilité
2. **Whitelist IP** - Autoriser certaines IPs de confiance
3. **Notifications Admin** - Alertes email après X blocages
4. **Captcha** - Ajouter CAPTCHA après 3 tentatives
5. **Géolocalisation** - Bloquer pays suspects
6. **Dashboard Sécurité** - Interface admin pour gérer les blocages

---

## 📊 Impact Sécurité

### Avant
- ❌ Attaques brute force possibles
- ❌ Pas de limite de tentatives
- ❌ Pas de blocage IP
- ❌ Risque de compromission de comptes

### Après
- ✅ Protection multi-niveaux
- ✅ Blocage automatique après 5 échecs
- ✅ Rate limiting strict
- ✅ Monitoring en temps réel
- ✅ Logs de sécurité complets

---

## 🎯 Conformité OWASP

### OWASP Top 10 2021
- ✅ **A07:2021 – Identification and Authentication Failures**
  - Rate limiting implémenté
  - Blocage IP après échecs multiples
  - Logs d'audit complets

### OWASP ASVS v4.0
- ✅ **V2.2 - General Authenticator Requirements**
  - Protection contre brute force
  - Délais de blocage appropriés
  - Messages d'erreur génériques

---

## 📝 Notes Importantes

- Le blocage est en mémoire (redémarre avec le serveur)
- Pour production, considérer Redis pour persistance
- Les IPs sont nettoyées automatiquement
- Les admins peuvent voir les statistiques
- Compatible avec proxies et load balancers

---

**Implémentation terminée avec succès** ✅  
**Effort réel**: ~2h  
**Impact**: Critique - Protection essentielle contre attaques
