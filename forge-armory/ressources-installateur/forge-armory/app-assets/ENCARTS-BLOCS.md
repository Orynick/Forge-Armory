# Encarts à équerres des blocs repliables — spécifications

Remplace le cadre « rectangle gris arrondi ». Ce n'est **pas une image** : l'encart est en CSS, car sa taille dépend du contenu. Il se place autour du corps du bloc, sous le titre (`assets/blocs-repliables/titre-<bloc>-<replie|deplie>.svg`).

Code prêt à l'emploi : `composants/BlocRepliable.tsx` + `composants/BlocRepliable.css`.
Références visuelles : `docs/encart-equerres-etats-blocs.png` (les 4 états), `docs/encart-equerres-bloc-connexion.png` (bloc Connexion avec contenu), `docs/encart-rendu-css.png` (rendu réel du CSS fourni).

## Principe
- Trois équerres seulement : **haut droit, bas gauche, bas droit**. Pas d'équerre en haut à gauche (le titre et le logo occupent ce coin).
- Fond sombre, filet fin en bas, équerres argentées. Quand le bloc est **actif**, les équerres deviennent **cyan lumineux**.
- Pas de cristaux cyan sur les côtés (écartés pour rester sobre).

## Toutes les mesures sont proportionnelles au titre
Une « unité » = 1/1024 de la hauteur du titre (les unités des SVG de titre, viewBox 7805 × 1024). Pour un titre affiché à 105 px de haut (≈ 800 px de large) : 1 unité ≈ 0,1025 px. Changer `--titre-h` suffit pour tout redimensionner.

| Élément | Valeur (unités) | À 105 px de titre |
|---|---|---|
| Bord gauche de l'encart | x = 65 → bord extérieur du cercle du logo | |
| Bord haut de l'encart | y = 512 → **axe horizontal du titre + logo** | |
| Bord droit de l'encart | plaque du titre (x = 7740) + 663 → déborde du titre de 598 | ≈ +61 px |
| Bord bas | juste sous le titre (−78) + hauteur du contenu | |
| Longueur d'un bras d'équerre | 624 | 64 px |
| Épaisseur du trait | 35 | 3,6 px |
| Marge intérieure du contenu | 683 de chaque côté, 290 en haut, 600 en bas | ≈ 70 / 30 / 60 px |

Alignements (voulus) : la partie **horizontale** de l'équerre haut droit est sur l'axe horizontal du titre + logo ; l'équerre bas gauche est alignée sur le bord extérieur du cercle du logo.

## Habillage
- **Fond** : dégradé vertical `#131923` → `#080b11`, **88 % d'opacité** (le logo de l'appli en arrière-plan reste à peine visible, sans gêner la lecture).
- **Disque derrière le cercle du logo** : couleur du fond de l'appli (`--fond`), rayon 436 unités, pour ne pas voir l'encart à travers le logo.
- **Équerres argentées** : chaque bras est un dégradé du coin vers l'extrémité : `#fff` au coin → `#d9dde2` à 95 % d'opacité vers 45 % du bras → 30 % d'opacité à l'extrémité.
- **Équerres cyan (actif)** : même principe avec `#8ff3ff` → `#1cc6ff`, plus un halo `drop-shadow(0 0 7px rgb(63 220 255 / .85))`.
- **Filet bas** : 3 px, `#e8ebef`, fondu aux deux extrémités (0 → 85 % à 15 % → 85 % à 85 % → 0), entre les deux équerres du bas.

## Les 4 états
| État | Titre (SVG) | Encart | Équerres |
|---|---|---|---|
| **Replié** | `…-replie.svg` (losange +) | aucun | — |
| **Ouverture** | `…-deplie.svg` (losange −) | la hauteur s'ouvre de 0 à 100 % en 0,35 s | les équerres du bas apparaissent en fin de course |
| **Déplié, inactif** | `…-deplie.svg` | complet | argentées |
| **Déplié, actif** | `…-deplie.svg` | complet | cyan lumineux (fondu 0,25 s) |

Règles :
- **Un seul bloc actif à la fois.** Ouvrir un bloc l'active ; cliquer ou mettre le focus dans le contenu d'un bloc l'active ; fermer le bloc actif ne laisse aucun bloc actif.
- Plusieurs blocs peuvent rester dépliés en même temps.
- L'ouverture **n'étire pas** l'encart : les équerres ne se déforment jamais (animation par hauteur de grille CSS, aucune hauteur à connaître).
- `prefers-reduced-motion` : toutes les transitions sont coupées.

## Accessibilité
- Le titre est un `<button>` avec `aria-expanded` et `aria-controls` ; l'image porte `alt` = libellé du bloc.
- Le corps replié est `inert` (pas de focus clavier dans un contenu masqué).
- L'encart lui-même est décoratif (`aria-hidden`).

## Intégration
1. Copier `composants/` dans le projet (le composant importe `../forgeAssets` ; adapter le chemin si besoin, ainsi que `/${titre.fichier}` selon la façon dont l'appli sert les fichiers statiques).
2. Utiliser `useBlocsRepliables()` pour gérer ouverts / actif (voir l'exemple en bas du fichier `.tsx`).
3. Le bloc occupe la largeur du titre (`7805 × --u`) ; l'encart déborde de ~0,6 × la hauteur du titre sur la droite : prévoir cette marge dans la colonne qui le contient.
4. `--fond` (CSS) = couleur de fond réelle de l'appli ; défaut `#0d0f14`.
5. L'option `inert` demande un navigateur récent (Chrome / Electron ≥ 102) ; c'est le cas de l'appli.

## Limites connues
- Le contenu du bloc (texte, boutons, pastille d'état) n'est pas stylé ici : seules l'enveloppe et les titres le sont.
- Deux blocs consécutifs ne s'empilent proprement qu'avec la marge basse fournie (`margin-bottom: 260 unités`) ; adapter si la mise en page change.
