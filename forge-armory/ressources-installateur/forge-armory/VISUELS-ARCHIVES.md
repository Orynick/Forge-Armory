# Archives de visuels Forge Armory : laquelle fait foi ?

**Référence actuelle : `app-assets/`** (archive « forge-armory-app-assets », reçue le 07/10/2026) : les 60 SVG de l'appli, leur catalogue (`manifest.json`, `forgeAssets.ts`) et la charte graphique (`docs/charte-graphique.html`). C'est elle qui est livrée avec l'appli, sous `public/assets/`.

Les quatre dossiers ci-dessous sont des **livraisons antérieures, conservées pour l'historique**, que `app-assets/` remplace :
- `boutons-selecteur/` : les 6 boutons du sélecteur de vues (07/10/2026) ;
- `boutons-profils/` : les 8 boutons de profil / contexte (07/10/2026) ;
- `titres-categories/` : les 6 premiers titres (blocs), version à un seul état ;
- `titres-complets/` : les 15 titres, version à un seul état.

Vérifié le 07/10/2026 par comparaison de rendu : les 22 boutons et titres fixes d'`app-assets/` sont **identiques au pixel près** à ceux des anciennes livraisons (seuls leurs identifiants internes ont été renommés), et l'emblème (`marque/forge-armory-emblem.svg`) s'affiche exactement comme celui du projet. Les titres des 7 blocs repliables, eux, sont NOUVEAUX : deux états (replié « + », déplié « − ») sur un cadre un peu plus large.

**Retouches** : les fichiers de `app-assets/` ne sont jamais modifiés. Ceux livrés avec l'appli (`public/assets/`) en sont dérivés par `scripts/retoucher-visuels.mjs` (soulignage des titres épaissi, icône de la carte 1, titres fixes de Connexion et Manifest) : voir `documentation/identite-visuelle/RETOUCHES-VISUELS.md`.

**Licence** : la notice de l'archive signale que le logo « Artefact » reprend un SVG de SVG Repo (« shield-artifact ») : à vérifier avant toute diffusion publique de l'appli (TODO, section 16 bis).
