# Boutons de profil — Neutre / PvE Roaming / PvE DPS / PVP (Forge Armory)

## Contenu
- `boutons/` : 4 boutons × 2 états (SVG, fond transparent)
  - `bouton-<nom>.svg` : au repos
  - `bouton-<nom>-selectionne.svg` : sélectionné
  - noms : `neutre`, `roaming`, `dps`, `pvp`
- `png/` : mêmes boutons en PNG transparent, 256 px de haut (secours / tests)
- `icones/` : icône seule (cercle + symbole + cristaux), 1024 × 1024, état repos
- `vectorisation/` : les 4 symboles vectorisés depuis le concept (sans cercle ni cristaux), dégradé de la couleur du profil
- `apercus/` : planches de contrôle (ne pas intégrer à l'appli)

## Règles d'intégration
- Les 8 SVG de `boutons/` ont exactement le même cadre : viewBox `0 0 3781 1024`, même plaque, même cercle, même taille de titre. Afficher les quatre à la même hauteur ; la largeur suit.
- Même hauteur et même taille de cercle que les boutons du sélecteur (Build Analyzer, Bibliothèque, Load-outs) ; la plaque est plus courte (adaptée à « PVE ROAMING »).
- Logo + cadre + titre = un seul bouton (ne pas séparer).
- Le halo de l'état sélectionné reste dans le cadre : la taille ne change pas au clic.
- Titre en tracés : aucune police à charger. Titre + ligne centrés dans la plaque, l'ensemble centré sur le centre du cercle.
- Couleurs : Neutre = argent + cristaux cyan ; PvE Roaming = vert ; PvE DPS = or ; PVP = rouge (anneau, cadre, cristaux, symbole, ligne).
- Sélectionné : lettrage et ligne = lueur bleutée niveau 3 (comme le sélecteur de menu) ; logo et cadre = lueur entre niveaux 2 et 3, à la couleur du profil.
- Symboles : vectorisés à partir du concept fourni (anneau extérieur et repères remplacés par l'anneau et les cristaux Forge). Les fichiers `vectorisation/` sont des tracés (fill-rule evenodd) réutilisables seuls.
