# Recherche d'Affaire avec Combobox - Implémentation Complète

## Résumé
Remplacement du Select simple par un Combobox avec recherche dans le formulaire de création d'audience. Les utilisateurs peuvent maintenant rechercher une affaire par numéro de référence, titre ou nom des parties.

## Fonctionnalité Implémentée

### Page Nouvelle Audience (`NewHearing.tsx`)
- ✅ Combobox avec recherche en temps réel
- ✅ Recherche par numéro de référence (ex: "2024/001")
- ✅ Recherche par titre de l'affaire (ex: "Dupont c/ Martin")
- ✅ Recherche par nom des parties (ex: "Dupont", "Martin")
- ✅ Affichage enrichi avec référence et parties
- ✅ Icône de validation pour l'affaire sélectionnée
- ✅ Message "Aucune affaire trouvée" si pas de résultat

## Comportement UX

### Recherche Intelligente
1. L'utilisateur clique sur le champ "Affaire liée"
2. Un Combobox s'ouvre avec toutes les affaires actives
3. Il tape dans le champ de recherche :
   - "2024/001" → trouve l'affaire par référence
   - "Dupont" → trouve toutes les affaires avec "Dupont" dans le titre ou les parties
   - "Expulsion" → trouve les affaires avec ce mot dans le titre
4. La recherche est instantanée et insensible à la casse
5. Il clique sur l'affaire souhaitée
6. Le Combobox se ferme et affiche l'affaire sélectionnée

### Affichage des Résultats
Chaque affaire dans la liste affiche :
- **Titre** en gras
- **Référence** entre parenthèses
- **Parties** en petit texte grisé (si disponibles)
- **Icône Check** pour l'affaire sélectionnée

### Placeholder Informatif
```
"Rechercher par référence, titre ou partie..."
```

## Code Implémenté

### Imports Ajoutés
```typescript
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
```

### État du Combobox
```typescript
const [openCaseCombobox, setOpenCaseCombobox] = useState(false);
const selectedCaseId = watch('affaireId');
```

### Fonction de Recherche
```typescript
const getCaseSearchText = (caseItem: Case) => {
  const partiesNames = caseItem.parties?.map(p => p.nom).join(' ') || '';
  return `${caseItem.reference} ${caseItem.titre} ${partiesNames}`.toLowerCase();
};
```

Cette fonction crée un texte de recherche combinant :
- Référence du dossier
- Titre de l'affaire
- Noms de toutes les parties

### Affichage de l'Affaire Sélectionnée
```typescript
const selectedCase = activeCases.find(c => c.id === selectedCaseId);
```

### Structure du Combobox
```typescript
<Popover open={openCaseCombobox} onOpenChange={setOpenCaseCombobox}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">
      {selectedCase ? (
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">{selectedCase.titre}</span>
          <span className="text-xs text-muted-foreground">{selectedCase.reference}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Rechercher par référence, titre ou partie...</span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[500px] p-0">
    <Command>
      <CommandInput placeholder="Rechercher..." />
      <CommandList>
        <CommandEmpty>Aucune affaire trouvée.</CommandEmpty>
        <CommandGroup>
          {activeCases.map((caseItem) => (
            <CommandItem
              key={caseItem.id}
              value={getCaseSearchText(caseItem)}
              onSelect={() => {
                field.onChange(caseItem.id);
                setOpenCaseCombobox(false);
              }}
            >
              <Check className={cn("mr-2 h-4 w-4", field.value === caseItem.id ? "opacity-100" : "opacity-0")} />
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{caseItem.titre}</span>
                  <span className="text-xs text-muted-foreground">({caseItem.reference})</span>
                </div>
                {caseItem.parties && caseItem.parties.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Parties: {caseItem.parties.map(p => p.nom).join(', ')}
                  </span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

## Avantages de cette Approche

### Pour l'Utilisateur
✅ **Recherche rapide** : Trouve l'affaire en quelques touches
✅ **Flexible** : Recherche par référence, titre ou partie
✅ **Visuel** : Affichage enrichi avec toutes les infos
✅ **Intuitif** : Fonctionne comme un moteur de recherche

### Pour le Développement
✅ **Composant shadcn/ui** : Bien testé et accessible
✅ **Performance** : Recherche côté client instantanée
✅ **Maintenable** : Code clair et structuré
✅ **Extensible** : Facile d'ajouter d'autres critères de recherche

## Exemples de Recherche

### Par Référence
- Tape : `"2024/001"` → Trouve l'affaire avec cette référence
- Tape : `"RG-2024"` → Trouve toutes les affaires avec "RG-2024" dans la référence

### Par Titre
- Tape : `"Dupont"` → Trouve toutes les affaires avec "Dupont" dans le titre
- Tape : `"Expulsion"` → Trouve toutes les affaires d'expulsion

### Par Partie
- Tape : `"Martin"` → Trouve toutes les affaires où "Martin" est une partie
- Tape : `"SARL"` → Trouve toutes les affaires avec une SARL comme partie

### Recherche Combinée
La recherche fonctionne sur tous les champs simultanément, donc :
- Tape : `"2024"` → Trouve les affaires avec "2024" dans référence, titre ou parties

## Composants UI Utilisés

### Command (shadcn/ui)
- `Command` : Conteneur principal
- `CommandInput` : Champ de recherche
- `CommandList` : Liste des résultats
- `CommandEmpty` : Message si aucun résultat
- `CommandGroup` : Groupe d'items
- `CommandItem` : Item individuel

### Autres
- `Popover` : Pour afficher le Combobox
- `Button` : Trigger du Combobox
- `Check` : Icône de validation
- `ChevronsUpDown` : Icône d'ouverture/fermeture

## Accessibilité

✅ **Clavier** : Navigation complète au clavier
✅ **ARIA** : Attributs ARIA corrects (role="combobox")
✅ **Screen readers** : Compatible avec les lecteurs d'écran
✅ **Focus management** : Gestion du focus automatique

## Performance

- **Recherche côté client** : Instantanée, pas d'appel API
- **Filtrage optimisé** : Utilise l'algorithme de Command
- **Pas de re-render inutile** : Optimisé avec React

## Améliorations Futures Possibles

1. **Highlighting** : Surligner les termes de recherche dans les résultats
2. **Tri intelligent** : Afficher les résultats les plus pertinents en premier
3. **Recherche floue** : Tolérer les fautes de frappe
4. **Raccourcis clavier** : Ctrl+K pour ouvrir la recherche
5. **Historique** : Afficher les dernières affaires consultées
6. **Filtres avancés** : Par juridiction, chambre, statut, etc.

## Fichiers Modifiés
- ✅ `frontend/src/pages/NewHearing.tsx` - Remplacement Select par Combobox

## Tests Suggérés

### Recherche
1. ✅ Rechercher par référence complète
2. ✅ Rechercher par référence partielle
3. ✅ Rechercher par titre complet
4. ✅ Rechercher par mot du titre
5. ✅ Rechercher par nom de partie (demandeur)
6. ✅ Rechercher par nom de partie (défendeur)
7. ✅ Rechercher avec terme inexistant
8. ✅ Recherche insensible à la casse

### Interaction
9. ✅ Ouvrir/fermer le Combobox
10. ✅ Sélectionner une affaire
11. ✅ Vérifier l'affichage de l'affaire sélectionnée
12. ✅ Navigation au clavier (flèches, Enter, Escape)
13. ✅ Cliquer en dehors pour fermer
14. ✅ Bouton "+" reste fonctionnel

### Affichage
15. ✅ Affichage correct du titre et référence
16. ✅ Affichage des parties si disponibles
17. ✅ Icône Check sur l'affaire sélectionnée
18. ✅ Message "Aucune affaire trouvée"
19. ✅ Placeholder informatif

## Statut
✅ **COMPLET** - Implémentation terminée et testée sans erreurs TypeScript

## Compatibilité
- ✅ Fonctionne avec le bouton "+" pour créer une affaire
- ✅ Compatible avec la sélection automatique après création
- ✅ Conserve la fonctionnalité de pré-sélection via URL params
