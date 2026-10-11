# Titres Forge Armory — ensemble complet (15 titres)

## Contenu
- `blocs-repliables/` : Connexion à Bungie, Recherche dans le Manifest, Mon Build, Artefact, Sauvegarde et Partage du Build, Doctrine et Élément, Mon Inventaire
- `contexte/` : `titre-contexte-0` (0. CONTEXTE DU BUILD) et `titre-contexte-ligne` (ligne « Contexte du build » au-dessus de Mon Build) — même logo
- `cartes-resultat/` : 1. ÉLÉMENT ET DOCTRINE, 2. ARTEFACT, 3. ARMES ET ARMURES, 4. EFFETS DU BUILD, 5. STATISTIQUES, SCORE GLOBAL
- `icones/` : logos seuls (cercle + symbole), 1024 × 1024 (un par logo ; les cartes 1 et 2 réutilisent les icônes doctrine et artefact)
- `apercus/` : planche de contrôle (ne pas intégrer à l'appli)

## Logos retenus
Connexion = maillons · Manifest = loupe · Mon Build = casque · Artefact = SVG fourni · Sauvegarde = disquette + partage · Doctrine/Élément = hexagone aux six ronds bleutés · Inventaire = coffre · Contexte = couches empilées · Armes et Armures = bouclier + épée · Effets = grande étoile + deux petites · Statistiques = histogramme · Score global = jauge

## Règles d'intégration (cahier des charges)
- Les 15 SVG de titres ont exactement le même cadre : viewBox `0 0 7505 1024`, même plaque, même cercle, même taille de titre. Afficher à la même hauteur ; la largeur suit (cadre calé sur « SAUVEGARDE ET PARTAGE DU BUILD »).
- Logo + plaque + titre = un seul élément. Titre à droite, centré sur le centre du cercle, ligne et cristal dessous sans dépasser le titre.
- Sans cristaux bleus autour du cercle ; une partie du dessin reste en bleu. Pas d'état sélectionné (ce ne sont pas des boutons).
- Titres en tracés : aucune police à charger. Le A prend la forme Λ ; un seul O orné par titre.
- « Mon Inventaire » : la précision « (personnages + coffre) » n'est pas dans le titre ; à afficher en sous-texte dans l'appli si besoin.
