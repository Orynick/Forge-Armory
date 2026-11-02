# Taille des boutons : règle à respecter

(Note autonome, à donner telle quelle à un assistant qui n'a pas l'historique.)

## Principe
Tous les boutons SVG de ce paquet (sélecteur, profils, boutons d'action, blocs repliables, titres) ont :
- un **cadre de 1024 unités de haut** (`viewBox="0 0 <largeur> 1024"`) ;
- le **même cercle** : rayon 436, trait 22 (diamètre extérieur 894), centre à mi-hauteur ;
- la **même plaque** : 524 de haut, biseau de 82 à droite, bordure de 11.

Conséquence : **si on affiche deux boutons à la même hauteur CSS, leur cercle et leur plaque ont exactement la même taille**, quelle que soit la famille. Seule la largeur change (elle suit le texte).

## À faire dans l'appli
- Définir **une seule hauteur** pour la rangée de boutons de la Forge, par exemple `--bouton-forge-h`, et l'appliquer à Collection, Inventaire, Armes, Armures **et aux boutons d'action** (Retour, Mettre dans Mon Build, Lire le Lore, Actualisation, Forge : mods / perks, Modifier, Fermer).
- Fixer **uniquement la hauteur** (`height: var(--bouton-forge-h); width: auto;`). Ne jamais fixer largeur ET hauteur : l'image serait déformée.
- Utiliser le ratio du catalogue (`ratio` dans `manifest.json`) si on a besoin de réserver la largeur à l'avance.
- Le texte des boutons d'action est volontairement un peu plus grand que celui du sélecteur (capitales de 200 contre 180) pour rester lisible ; les cercles et plaques, eux, sont identiques.

## À ne pas faire
- Ne pas redimensionner à la main les boutons d'action pour « qu'ils aient l'air plus petits » : à même hauteur, ils sont déjà à la bonne taille.
- Ne pas utiliser l'ancienne version des boutons d'action (cadre de 1000 de haut, paquets v10 et antérieurs) : elle donnait un cercle et une plaque plus gros que le sélecteur à hauteur égale.
