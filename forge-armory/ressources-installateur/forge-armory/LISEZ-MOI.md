# Identité visuelle « Forge Armory » — EN COURS D'ESSAI dans l'appli

Image d'identité fournie par l'utilisateur le **01/10/2026** (« l'image qui
constituera l'identité visuelle de l'application »), pour le futur nom de l'appli,
**Forge Armory** (« Destiny 2 Build Analyzer » en sous-titre ; voir la section 12 de
`TODO.md`). Elle remplace, pour l'essai, l'ancien logo PARTOUT, alors que le NOM de
l'appli (fenêtre, logiciel, installateur, exports) n'a pas encore changé. Les
versions précédentes sont dans `../ancien-logo/` avec la marche à suivre pour y revenir.

## Fichiers de ce dossier

| Fichier | Contenu |
|---|---|
| `identite-forge-armory-source.png` | **L'image d'origine** (1254 × 1254, fond noir) : emblème, « FORGE ARMORY », ligne de séparation à étoile, « DESTINY 2 BUILD ANALYZER \| par Orynick/Orygamer ». La référence : tout le reste s'en déduit. |
| `forge-armory-emblem.svg` | Emblème VECTORIEL (sans texte), pour le filigrane. **Corrigé** le 01/10/2026 (voir plus bas). |
| `forge-armory-emblem-original.svg` | Le SVG tel que fourni (cristal du bas coupé). |
| `generer-icones.py` | Régénère les fichiers dérivés ci-dessous. Outil de Claude (Python avec Pillow, numpy, scipy). |

## Où l'identité est utilisée

| Usage | Fichier | Contenu |
|---|---|---|
| En-tête de l'appli | `public/logo-forge-armory-embleme.png` et `-texte.png` | Emblème (304 × 342 px) et bloc texte (803 × 158 px), à fond transparent, environ 3 fois leur taille d'affichage ; 223 Ko au total. Composant : `src/components/EnTeteApp.tsx` |
| Installateur, désinstallateur, raccourci, barre des tâches, fenêtre | `ressources-installateur/icon.ico` | **Papillon seul** en 16, 24 et 32 px (le cercle et les losanges y sont illisibles) ; **emblème complet** en 48, 64, 128 et 256 px, sur fond noir (un fond transparent ferait disparaître le logo blanc sur les thèmes clairs de Windows) |
| Onglet du navigateur | `public/favicon-16.png`, `-32.png`, `-48.png` | Papillon seul, fond noir |
| Filigrane des fiches (fenêtre « Voir », exports JPEG, PNG, PDF) | `src/data/emblemeForgeArmory.ts` | Emblème VECTORIEL (le SVG corrigé), 7 % d'opacité, centré par-dessus le contenu |

## En-tête de l'appli (taille « B », choisie par l'utilisateur le 01/10/2026)

L'emblème à gauche, le bloc de texte décalé à DROITE ; **le cercle de l'emblème va du
haut du titre (« F » de « FORGE ») au bas du sous-titre** ; les losanges dépassent
au-dessus et au-dessous. Taille « A » (plus grande) écartée.
- Géométrie : `src/lib/enTete/geometrieIdentite.ts` (fonction pure, mesures de l'image
  d'origine : cercle de centre (626,2 ; 443,6) et de rayon extérieur 290,8 ; emblème
  x 251-999, y 33-878 ; texte x 124-1144, y 911-1101). Échelle 0,37, écart emblème-texte
  0,29 fois le diamètre du cercle.
- **Vérifié sur le vrai composant** : écart du cercle avec le haut du titre 0,42 px et avec
  le bas du sous-titre 0,20 px (taille d'affichage : cercle de 70,7 px).
- Le texte étant dans l'image, **plus aucune dépendance à la police** (la première version
  du 01/10, qui mesurait les lettres à l'affichage, est supprimée).

## Le SVG de l'emblème : une correction (01/10/2026)

Dans le fichier fourni, **le cristal du bas était coupé net au bord du cadre**
(y = 1023), sans sa pointe. Correction : on garde sa partie tracée telle quelle (sa base
n'est volontairement PAS le miroir de celle du haut, comme dans l'image d'identité : les
deux cristaux ont la même longueur mais le bas est décalé), et on complète seulement la
pointe extérieure, en miroir de celle du cristal du haut (symétrie autour de y = 550,
centre du cercle) ; le cadre passe de 1024 × 1024 à 1024 × 1100. Les sept points ajoutés
sont des miroirs exacts de points du cristal du haut (vérifié).
Le SVG est une vectorisation simplifiée : la matière métallique y devient un dégradé, et
la lueur des cristaux n'y est pas. À 7 % d'opacité, la différence est invisible.

## Le papillon seul (petites tailles)

Isolé PAR FORME (composantes connexes du blanc, hors bleu, dans le cercle), et non par un
masque circulaire : un rayon de coupe ne sépare pas proprement les pointes des ailes de
l'anneau. Contrôle : aucun pixel bleu sous 48 px dans l'icône.

## Filigrane des fiches (01/10/2026)

L'emblème centré sur la fiche, **par-dessus** le contenu (les cartes sont opaques : derrière,
il serait caché), à **7 %** d'opacité (`OPACITE_FILIGRANE`), choisi sur un aperçu comparant
4, 7 et 11 % : le texte reste net. Dans l'export : 760 px de large dans la page de 900 px, dans
un cadre rogné aux bords de la page (il ne peut donc jamais allonger une fiche courte), et
vectoriel (net en capture ×2 et dans le PDF, sans ajouter d'image). Dans « Voir » : 420 px,
dans un conteneur qui enveloppe tout le contenu. Source unique : `src/data/emblemeForgeArmory.ts`.
