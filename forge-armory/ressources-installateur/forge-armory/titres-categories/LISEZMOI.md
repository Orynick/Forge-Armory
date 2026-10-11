# Titres de catégories — version finale v2 (sans cristaux)

## Contenu
- `titres/` : 6 titres (SVG, fond transparent) — logo + plaque + titre + ligne
  `connexion`, `manifest`, `mon-build`, `artefact`, `sauvegarde`, `doctrine`
- `icones/` : cercle + symbole seuls, 1024 × 1024
- `apercus/` : planche de contrôle (ne pas intégrer à l'appli)

## Points d'attention
- `artefact` : SVG fourni par Ory (shield-artifact), recentré et mis à l'échelle ; losange en argent, anneau central en bleu.
- `doctrine` : variante C (hexagone aux six sommets en petits ronds bleutés, étoile au centre).

## Règles d'intégration
- Les 6 SVG de `titres/` ont exactement le même cadre : viewBox `0 0 7505 1024`, même plaque, même cercle, même titre. Afficher à la même hauteur ; la largeur suit.
- Logo + plaque + titre = un seul élément. Titre à droite, centré sur le centre du cercle, ligne et cristal dessous sans dépasser le titre.
- Pas de cristaux bleus autour du cercle ; une partie du dessin reste en bleu.
- Pas d'état sélectionné (ce ne sont pas des boutons).
- Titres en tracés : aucune police à charger.
