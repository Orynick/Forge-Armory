# Boutons du sélecteur — Forge Armory (version finale, cadre avec soulignement)

## Contenu
- `boutons/` : 3 boutons × 2 états (SVG, fond transparent)
  - `bouton-<nom>.svg` : au repos
  - `bouton-<nom>-selectionne.svg` : sélectionné (lueur)
  - noms : `build-analyzer`, `bibliotheque`, `loadouts`
- `png/` : mêmes boutons en PNG transparent, 256 px de haut (secours / tests)
- `icones/` : logos seuls (cercle + icône), sans cadre ni titre
- `apercus/` : planche de contrôle (ne pas intégrer à l'appli)

## Règles d'intégration
- Les 6 SVG ont exactement le même cadre : viewBox `0 0 4316 1024`, même plaque, même taille de cercle et de titre. Afficher les trois à la même hauteur ; la largeur suit.
- Logo + cadre + titre = un seul bouton (ne pas séparer).
- Le halo de l'état sélectionné reste dans le cadre : la taille ne change pas au clic.
- Titre en tracés : aucune police à charger.
- Titre + ligne avec cristal centrés dans la plaque, l'ensemble centré sur le centre du cercle ; la ligne ne dépasse pas la largeur du titre.
- Sélectionné : lettrage et ligne = lueur niveau 3 ; logo et cadre = lueur entre niveaux 2 et 3.
