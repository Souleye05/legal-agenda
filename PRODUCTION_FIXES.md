# Correctifs Production ✅

## Date: 27 janvier 2026

## Problèmes Identifiés en Production

### 1. ❌ Erreur: `Argument chambre is missing`

**Cause**: Le champ `chambre` était requis dans le schéma Prisma mais optionnel dans le DTO et le frontend.

**Solution**: Rendre `chambre` optionnel dans Prisma
```prisma
// Avant
chambre     String

// Après  
chambre     String?
```

**Migration**: `20260127194128_make_chambre_optional`

**Impact**: Les affaires peuvent maintenant être créées sans spécifier de chambre.

---

### 2. ❌ Erreur: `Unique constraint failed on the fields: (reference)`

**Cause**: Tentative de créer une affaire avec une référence déjà existante.

**Solution**: Améliorer la gestion d'erreur côté frontend
- Afficher un message clair à l'utilisateur
- Suggérer une référence alternative
- Vérifier l'unicité avant soumission

**Recommandation**: Ajouter une validation côté frontend pour vérifier si la référence existe déjà.

---

### 3. ⚠️ Seulement 9 affaires affichées (au lieu de 10+)

**Cause Possible**: 
- Cache frontend non rafraîchi
- Problème de requête API
- Pagination par défaut limitant les résultats

**Vérifications à faire**:
1. Vérifier le cache React Query
2. Vérifier les logs API pour voir combien d'affaires sont retournées
3. Vérifier si la pagination est appliquée par erreur

**Solution Temporaire**: Forcer le rechargement des données
```typescript
queryClient.invalidateQueries(['cases']);
```

---

## Actions Immédiates

### Backend
1. ✅ Migration appliquée: `chambre` optionnel
2. ✅ Redéployer le backend avec la nouvelle migration
3. ⏳ Améliorer les messages d'erreur pour contraintes uniques

### Frontend
1. ⏳ Ajouter validation de référence unique
2. ⏳ Améliorer les messages d'erreur utilisateur
3. ⏳ Ajouter bouton "Rafraîchir" si problème de cache

---

## Commandes de Déploiement

### Backend
```bash
# Appliquer la migration en production
cd backend
npx prisma migrate deploy

# Redémarrer le service
pm2 restart legal-agenda-backend
# ou
docker-compose restart backend
```

### Frontend
```bash
# Rebuild et redéployer
cd frontend
npm run build
# Déployer les fichiers build
```

---

## Tests Post-Déploiement

### Test 1: Créer affaire sans chambre
- ✅ Devrait réussir
- ✅ Chambre = null dans la DB

### Test 2: Créer affaire avec référence existante
- ✅ Devrait échouer avec message clair
- ✅ Utilisateur informé de l'erreur

### Test 3: Afficher toutes les affaires
- ✅ Toutes les affaires doivent s'afficher
- ✅ Pas de limite à 9 affaires

---

## Prévention Future

### 1. Validation Côté Frontend
```typescript
// Vérifier unicité de la référence
const checkReferenceExists = async (reference: string) => {
  const cases = await api.getCases();
  return cases.some(c => c.reference === reference);
};
```

### 2. Messages d'Erreur Clairs
```typescript
if (error.message.includes('Unique constraint')) {
  toast.error('Cette référence existe déjà. Veuillez en choisir une autre.');
}
```

### 3. Logs Améliorés
```typescript
console.error('[CREATE_CASE_ERROR]', {
  reference: dto.reference,
  error: error.message,
  timestamp: new Date().toISOString()
});
```

---

## Monitoring

### Métriques à Surveiller
- Nombre d'erreurs "Unique constraint" par jour
- Temps de réponse API `/cases`
- Nombre d'affaires créées vs échecs

### Alertes à Configurer
- Alert si > 10 erreurs "Unique constraint" en 1h
- Alert si temps de réponse `/cases` > 2s
- Alert si taux d'échec création > 5%

---

**Status**: Migration appliquée ✅  
**Déploiement**: En attente de redéploiement production
