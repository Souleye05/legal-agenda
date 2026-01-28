# Favicon Legal Agenda

## Fichiers créés

### favicon.svg
Favicon vectoriel moderne avec une balance de justice stylisée sur fond noir.
- Couleur fond: #1a1a1a (noir)
- Couleur icône: #ffffff (blanc)
- Format: SVG (scalable, haute qualité)

## Génération du favicon.ico (optionnel)

Pour générer un fichier favicon.ico à partir du SVG, vous pouvez:

### Option 1: Utiliser un outil en ligne
1. Aller sur https://realfavicongenerator.net/
2. Uploader le fichier `favicon.svg`
3. Télécharger le package généré
4. Placer `favicon.ico` dans `frontend/public/`

### Option 2: Utiliser ImageMagick (ligne de commande)
```bash
# Installer ImageMagick si nécessaire
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Convertir SVG en ICO
convert favicon.svg -define icon:auto-resize=16,32,48,64,256 favicon.ico
```

### Option 3: Utiliser un script Node.js
```bash
npm install -g svg2ico
svg2ico favicon.svg favicon.ico
```

## Notes

- Le SVG est suffisant pour les navigateurs modernes
- Le .ico est un fallback pour les anciens navigateurs (IE, etc.)
- Le navigateur choisira automatiquement le meilleur format disponible
