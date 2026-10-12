# Propositions « Solo sans mourir » et « Forge » — à valider

Mises en conformité de tes deux ébauches avec la charte graphique (`charte-graphique.html`). **Rien n'est encore intégré dans l'appli** : ces fichiers attendent ta validation du style, avant la 0.4.0.

## Les fichiers

| Fichier | Ce que c'est | Famille de la charte |
|---|---|---|
| `selecteur/bouton-forge.svg` | bouton de l'onglet **Forge**, état repos | boutons du sélecteur (cadre 4316 × 1024, cristaux) |
| `selecteur/bouton-forge-selectionne.svg` | le même, état **sélectionné** (lueur) | idem |
| `panneaux/titre-solo-sans-mourir.svg` | titre du panneau **Solo sans mourir** | **nouvelle famille « panneaux »** (cadre 4725 × 1024) |
| `icones/icone-forge.svg` | icône seule de Forge (avec cristaux) | icônes seules (1024 × 1024) |
| `icones/icone-solo-sans-mourir.svg` | icône seule de Solo (sans cristaux), pour l'onglet vertical replié | icônes seules |

`CONTROLES-CONFORMITE.txt` : 32 contrôles automatiques sur ces cinq fichiers (tous réussis). `scripts/` : le générateur (pour refaire ou ajuster les fichiers).

## Ce qui a changé par rapport à tes ébauches

- **Matière :** argent dégradé sur fond noir, détails **découpés par masque** (jamais peints en noir), une partie en **cyan** avec la lueur `glowSoft` de la charte. Les ébauches avaient un relief métallique et des textures de fond (cercle gravé) qui n'existent pas dans la charte.
- **Texte :** capitales en **tracés**, composées avec **les lettres de tes propres dessins**. L'espacement vient d'un modèle mesuré dans tes 18 fichiers : il retrouve l'interlettrage de **45** écrit dans la charte et reproduit tes textes existants à 0,02 unité près.
- **« O » orné :** la charte n'en veut **qu'un par titre, le dernier**. « SOLO SANS MOURIR » avait des « O » ornés partout : seul celui de MOURIR garde son losange.
- **Ornements retirés :** les petites étoiles à quatre branches de chaque côté de l'anneau appartiennent à l'emblème de la marque, pas aux boutons.
- **Solo = un titre, pas un bouton :** la charte donne cristaux, lueur et deux états aux boutons seulement ; un titre de panneau n'a ni cristaux, ni lueur, un seul état. La plaque est **compacte** : le titre le plus long d'une famille fixe sa largeur, et ce titre est seul dans sa famille. Résultat : **258 px de large à 56 px de haut**, il tient dans le panneau de 320 px avec sa croix.
- **Forge = un bouton du sélecteur :** plaque strictement identique à celle de « Load-outs », mêmes cristaux, deux états (la lueur de l'état sélectionné est celle des autres boutons).

## L'icône Forge (version 2, d'après ton ébauche)

La première version, trop simplifiée, a été remplacée : l'icône reprend maintenant **les formes de ton ébauche**, mises à l'échelle pour tenir entre les cristaux :

- **la lame** haute, moitié blanche et moitié cyan, à pointe basse ;
- **le halo en deux cornes en croissant**, épaisses aux extrémités et coupées net près de la lame ;
- **les deux fines pointes** de chaque côté de la lame ;
- **le socle en Y**, flanqué de **deux ailes courbes** à la pointe effilée.

**Non repris, parce que la charte les exclut ou qu'ils sont illisibles à cette taille :** les petites étoiles à quatre branches de chaque côté de l'anneau (elles appartiennent à l'emblème de la marque : le bouton Build Analyzer, qui en dérive, n'en a pas non plus), les anneaux décoratifs fins autour du symbole, les deux petits pieds du socle (trop près du cristal du bas : la charte impose 40 unités de marge) et les textures. Le symbole paraît plus petit dans l'anneau que sur l'ébauche : l'anneau de la charte est plus grand et ses cristaux se placent à l'intérieur.

## Deux interprétations à confirmer

1. **Écu de Solo :** je l'ai redessiné en écu à herse, avec **une seule fenêtre allumée en cyan** (un seul joueur). La charte exige une part de cyan ; dans l'ébauche, il n'y avait de cyan que dans les cristaux.
2. **Solo comme bouton ?** Si tu le voulais cliquable (avec cristaux et deux états), je produis cette variante. Sinon, le titre ci-dessus est conforme.

## Quatre boutons sur une même ligne

**Constat mesuré avec la vraie feuille de style :** aujourd'hui la page est limitée à **960 px** (912 utiles) et la ligne du sélecteur passe à la ligne ; or quatre boutons à 56 px demandent **980 px**. À quatre boutons, ils se répartiraient donc sur **deux lignes à toutes les largeurs**, même à 1920 px.

**Solution testée :** page élargie de 960 à **1032 px**, et hauteur commune des logos qui dépend de la largeur disponible. Résultat mesuré : **une seule ligne de 1920 px jusqu'à 820 px**, 56 px de haut dès 1040 px, puis 55 px (1032), 53 (1000), 51 (960), 47 (900), 43 (820). La même variable commande les titres des blocs, qui suivent donc le même changement. Le logiciel s'ouvre à 1280 px de large.
**En dessous de ~790 px**, les boutons atteindraient le minimum de 41,6 px et déborderaient : je recommande une **largeur minimale de fenêtre de 820 px**.
*Alternative :* garder 960 px de large et réduire tous les logos à 52 px.

## Après ta validation

À l'intégration (0.4.0) : fichiers dans `public/assets`, complément du catalogue, quatrième vue « Forge » dans le sélecteur, titre dans l'en-tête du panneau Solo, ajustement de la ligne du sélecteur, tests. Les fichiers livrés avec l'appli sont aujourd'hui retouchés par `scripts/retoucher-visuels.mjs` ; le `glyphes-titres.mjs` de ce dossier contient deux corrections (détection du soulignage dans les boutons, ouverture du soulignage recentrée) à reporter dans le projet.
