# Archives de visuels Forge Armory : laquelle fait foi ?

**Référence actuelle : `app-assets/`** (archive « forge-armory-app-assets » **v3**, reçue le 12/10/2026) : les 62 SVG de l'appli, leur catalogue (`manifest.json`, `forgeAssets.ts`) et la charte graphique (`docs/charte-graphique.html`). C'est elle dont dérive ce qui est livré avec l'appli, sous `public/assets/`.

**Ce que la v3 change par rapport à la précédente (v2, conservée dans `archives-precedentes/app-assets-v2/`)** : comparaison faite octet pour octet le 12/10/2026 : **58 fichiers identiques** ; **2 nouveaux** : `icones/icone-armes.svg` (l'épée seule) et `icones/icone-armures.svg` (le bouclier seul), pour l'export infographique ; **2 redessinés** : `icones/icone-armes-armures.svg` et `titres/titre-3-armes-armures.svg` (logo « épée plantée dans le bouclier ») ; catalogue : 2 entrées nouvelles et un libellé corrigé (« armes-armures » devient « Armes et Armures »). La notice de la v3 recommande **au moins 32 px** pour ces logos (à 24 px les détails fins se brouillent) : l'export les affiche à 34 px. La v3 garde l'ancienne numérotation des cartes du Scoring (2 = Artefact, 3 = Armes et Armures) : la renumérotation du 08/10/2026 (1. Doctrine élémentaire, 2. Armes et Armures, 3. Artefact) est refaite par `scripts/retoucher-visuels.mjs` à partir de ses fichiers, et le test `tests/logique/reproductibilite-visuels.test.ts` vérifie que cette reconstruction redonne `public/assets/` octet pour octet.

Les quatre dossiers ci-dessous sont des **livraisons antérieures, conservées pour l'historique**, que `app-assets/` remplace :
- `boutons-selecteur/` : les 6 boutons du sélecteur de vues (07/10/2026) ;
- `boutons-profils/` : les 8 boutons de profil / contexte (07/10/2026) ;
- `titres-categories/` : les 6 premiers titres (blocs), version à un seul état ;
- `titres-complets/` : les 15 titres, version à un seul état.

Vérifié le 07/10/2026 par comparaison de rendu : les 22 boutons et titres fixes d'`app-assets/` sont **identiques au pixel près** à ceux des anciennes livraisons (seuls leurs identifiants internes ont été renommés), et l'emblème (`marque/forge-armory-emblem.svg`) s'affiche exactement comme celui du projet. Les titres des 7 blocs repliables, eux, sont NOUVEAUX : deux états (replié « + », déplié « − ») sur un cadre un peu plus large.

**Retouches** : les fichiers de `app-assets/` ne sont jamais modifiés. Ceux livrés avec l'appli (`public/assets/`) en sont dérivés par `scripts/retoucher-visuels.mjs` (soulignage des titres épaissi, icône de la carte 1, titres fixes de Connexion et Manifest) : voir `documentation/identite-visuelle/RETOUCHES-VISUELS.md`.

**Licence** : la notice de l'archive signale que le logo « Artefact » reprend un SVG de SVG Repo (« shield-artifact ») : à vérifier avant toute diffusion publique de l'appli (TODO, section 16 bis).
