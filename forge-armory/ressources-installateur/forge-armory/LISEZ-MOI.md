# Identité visuelle « Forge Armory » — EN COURS D'ESSAI dans l'appli

Image d'identité fournie par l'utilisateur le **01/10/2026** (**remplacée le 19/10/2026** par une version portant les cristaux cyan dans les DEUX « O » de FORGE ARMORY, avec une planche de déclinaisons : voir « Mise à jour du 19/10/2026 » en bas) (« l'image qui
constituera l'identité visuelle de l'application »), pour le futur nom de l'appli,
**Forge Armory** (« Destiny 2 Build Analyzer » en sous-titre ; voir la section 12 de
`TODO.md`). Elle remplace, pour l'essai, l'ancien logo PARTOUT, alors que le NOM de
l'appli (fenêtre, logiciel, installateur, exports) n'a pas encore changé. Les
versions précédentes sont dans `archives-precedentes/ancien-logo/` avec la marche à suivre pour y revenir.

## Fichiers de ce dossier

| Fichier | Contenu |
|---|---|
| `app-assets/assets/marque/logo-forge-armory.png` | **Le logo d'origine** (**1092 × 1092**, fond noir, fourni le 19/10/2026 ; **présent dans le kit**, avec une copie livrée dans `public/assets/marque/` qui doit rester identique) : emblème, « FORGE ARMORY » (les deux « O » portent un cristal cyan), ligne de séparation à étoile, « DESTINY 2 BUILD ANALYZER \| par Orynick/Orygamer ». **La source de `generer-icones.py` et de `scripts/generer-titre-svg.py`** : aucune copie supplémentaire ; tout le reste s'en déduit. |
| `forge-armory-emblem.svg` | Emblème VECTORIEL (sans texte), pour le filigrane. **Corrigé** le 01/10/2026 (voir plus bas). |
| `forge-armory-emblem-original.svg` | Le SVG tel que fourni (cristal du bas coupé). |
| `generer-icones.py` | Régénère les fichiers dérivés ci-dessous **et** le dossier `declinaisons/`. Outil de Claude (Python avec Pillow, numpy, scipy). |
| `logo-titre/forge-armory-titre.svg` | Le TITRE (« FORGE ARMORY », ligne à étoile, sous-titre) en **SVG**, cristaux des deux « O » compris ; produit par `scripts/generer-titre-svg.py` (vectorisation de l'image d'origine). |
| `declinaisons/` | Les déclinaisons de la planche du 19/10/2026 : logo complet, icône d'application 512, monochromes, emblème en 6 tailles, favicons, papillon seul. Non livré avec l'appli. |
| `app-assets/assets/marque/forge-armory-declinaisons.png` | La planche de déclinaisons de l'utilisateur (référence visuelle, dans le kit). |
| `archives-precedentes/identite-forge-armory-source-2026-10-01.png` | L'ancienne image d'identité (1254 × 1254, du 01/10/2026), utilisée jusqu'au 19/10/2026 ; plus aucun outil ne la lit. |

## Où l'identité est utilisée

| Usage | Fichier | Contenu |
|---|---|---|
| En-tête de l'appli | `public/logo-forge-armory-embleme.png` et `-texte.png` | Emblème (304 × 342 px) et bloc texte (803 × 158 px), à fond transparent, environ 3 fois leur taille d'affichage ; 131 Ko au total. Composant : `src/components/EnTeteApp.tsx` |
| Installateur, désinstallateur, raccourci, barre des tâches, fenêtre | `ressources-installateur/icon.ico` | **L'icône d'application de la planche** (tuile sombre à coins arrondis, emblème complet) en 16, 24, 32, 48, 64, 128 et 256 px, **depuis le 19/10/2026** (avant : papillon seul en petites tailles). Les coins de la tuile sont transparents |
| Onglet du navigateur | `public/favicon-16.png`, `-32.png`, `-48.png` | L'icône d'application réduite (même image que dans `icon.ico`) |
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

## Le papillon seul (variante, plus utilisé par l'icône depuis le 19/10/2026)

Il reste disponible dans `declinaisons/papillon-seul-256.png`. Isolé PAR FORME (composantes connexes du blanc, hors bleu, dans le cercle), et non par un
masque circulaire : un rayon de coupe ne sépare pas proprement les pointes des ailes de
l'anneau. Contrôle : aucun pixel bleu sous 48 px dans l'icône.

## Filigrane des fiches (01/10/2026)

L'emblème centré sur la fiche, **par-dessus** le contenu (les cartes sont opaques : derrière,
il serait caché), à **7 %** d'opacité (`OPACITE_FILIGRANE`), choisi sur un aperçu comparant
4, 7 et 11 % : le texte reste net. Dans l'export : 760 px de large dans la page de 900 px, dans
un cadre rogné aux bords de la page (il ne peut donc jamais allonger une fiche courte), et
vectoriel (net en capture ×2 et dans le PDF, sans ajouter d'image). Dans « Voir » : 420 px,
dans un conteneur qui enveloppe tout le contenu. Source unique : `src/data/emblemeForgeArmory.ts`.

## Mise à jour du 19/10/2026 : nouveau logo et planche de déclinaisons

L'utilisateur a fourni **un logo à jour** (`logo-forge-armory.png`, 1092 × 1092) et **une planche de déclinaisons** (`forge-armory-declinaisons.png`), en demandant de **reprendre simplement ces visuels**. Le logo est le dessin du 01/10/2026 **à l'échelle 0,8712** (mesurée par le diamètre du cercle : l'encre du texte de l'ancienne image, transportée, tombe à moins d'un pixel de la mesure) **avec en plus un cristal cyan dans chacun des deux « O »**.

- **Plus rien n'est dessiné ni copié à la main** : le générateur ne trace plus de cristal (celui de la branche « test », gris et aux bords crénelés, est supprimé) ; les deux cristaux sont ceux de l'image, de même taille (16 × 35 px dans la source).
- **L'en-tête ne change pas de place** : les images gardent EXACTEMENT leurs dimensions (304 × 342 et 803 × 158) et les mêmes proportions internes ; `src/lib/enTete/geometrieIdentite.ts` (mesures exprimées dans le repère de l'ancienne image) n'a donc pas été touché. Le test `tests/ui/identite-visuels.py` le vérifie (cercle et encre du texte aux proportions de `MESURES_IDENTITE`).
- **Déclinaisons de la planche** : l'icône d'application (tuile arrondie sombre, liseré bleu, emblème à 88 % de la hauteur) devient l'**icône Windows** et les **favicons** ; les **monochromes** (blanc sur noir, noir sur blanc) sont faits depuis ton logo (leurs cristaux gardent la forme du logo : ceux de la planche, plus larges, sont une variante de la maquette) ; les tailles courantes (emblème de 1024 à 32), le logo complet (PNG et WEBP) et le favicon `.ico` sont dans `declinaisons/`.
- **SVG du titre** : `scripts/generer-titre-svg.py` vectorise les VRAIS contours du titre (cadre 896 × 176). Les cristaux (des losanges) et l'étoile, trop petits pour qu'un contour mesuré soit net, sont reconstruits à partir de leurs extrémités mesurées.
- **Limites** : la planche est une maquette ; ses formes ne sont pas reprises pixel pour pixel, mais refaites depuis le logo. L'emblème vectoriel du filigrane (`forge-armory-emblem.svg`) n'a PAS été refait : il reste celui du 01/10/2026. Le favicon de 16 px montre l'emblème complet, comme la planche, mais il y est petit (un papillon seul y serait plus lisible : `declinaisons/papillon-seul-256.png`).

