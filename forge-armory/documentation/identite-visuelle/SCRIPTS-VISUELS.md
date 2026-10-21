# Scripts des visuels Forge Armory

Guide des outils qui **fabriquent, retouchent et vérifient** les visuels de l'appli (logos, titres,
lettres, cristaux, séparateurs, icônes). À lire avec la [charte graphique](CHARTE-GRAPHIQUE.md),
qui dit *à quoi doivent ressembler* les visuels ; ce document dit *comment on les produit*.

> Dernière mise à jour : 19/10/2026 (v0.4.13).

## 1. Principes

1. **Les visuels sont dessinés par l'utilisateur** (kit « forge-armory-app-assets », archive v5,
   conservé **intact** dans `ressources-installateur/forge-armory/app-assets/`). Les outils ne
   redessinent pas la marque : ils *dérivent*, *retouchent*, *recomposent avec des lettres déjà
   dessinées* ou *vectorisent* ce qui existe.
2. **Source → dérivé.** Les fichiers livrés avec l'appli (`public/`) sont des dérivés. On ne les
   modifie **jamais à la main** : on relance l'outil.
3. **Reproductible et idempotent.** Relancer un outil redonne les mêmes octets ; une seconde
   exécution ne change plus rien. Chaque outil a un test qui le prouve.
4. **Aucune police à charger.** Le texte des titres est en **tracés** (voir §4). Un SVG de la
   marque ne contient ni `<text>`, ni script, ni ressource externe.
5. **Identifiants internes préfixés** (`fa-<nom-du-fichier>-…`) pour qu'aucun SVG n'entre en
   collision avec un autre, en `<img>` comme en SVG intégré.

## 2. Vue d'ensemble

| Outil | Rôle | Entrées | Sorties | Commande (depuis la racine) | Dépendances | Test |
|---|---|---|---|---|---|---|
| `ressources-installateur/forge-armory/generer-icones.py` | Régénère l'identité en PNG/ICO : emblème, bloc titre, favicons, icône Windows | `identite-forge-armory-source.png` (1254 × 1254) | `public/logo-forge-armory-embleme.png`, `…-texte.png`, `favicon-16/32/48.png`, `ressources-installateur/icon.ico`, et l'original `logo-titre/…-sans-cristal.png` | `python3 ressources-installateur/forge-armory/generer-icones.py` | Pillow, numpy, scipy | `tests/ui/logo-titre.py` |
| `scripts/ajouter-cristal-logo-titre.py` | Ajoute le **cristal dans le « O » de FORGE** de l'image du titre | `logo-titre/logo-forge-armory-texte-sans-cristal.png` | `public/logo-forge-armory-texte.png` | `python3 scripts/ajouter-cristal-logo-titre.py` | Pillow, numpy, scipy | `tests/ui/logo-titre.py` |
| `scripts/generer-titre-svg.py` | **Vectorise le titre** (FORGE ARMORY, ligne à étoile, sous-titre) en SVG, cristal de FORGE compris | `identite-forge-armory-source.png` | `ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg` | `python3 scripts/generer-titre-svg.py [--sortie <fichier>]` | Pillow, numpy, OpenCV, scikit-image | `tests/ui/titre-svg.py` |
| `scripts/glyphes-titres.mjs` | **Bibliothèque de lettres** : extrait, déplace et recompose les lettres des titres SVG, recalcule le soulignage | un titre SVG (tracés) | (module importé par les autres outils) | — | Node | `tests/logique/visuels.test.ts` |
| `scripts/retoucher-visuels.mjs` | Applique **cinq retouches** aux visuels livrés (soulignage, icône de la carte 1, titres sans losange, renumérotation des cartes, **bouton Carrière élargi**) | `app-assets/` (archive) | `public/assets/` | `node scripts/retoucher-visuels.mjs [--verifier] [--racine <dossier>]` | Node | `tests/logique/reproductibilite-visuels.test.ts` |
| `scripts/generer-propositions-solo-forge.mjs` | Compose de **nouveaux boutons et titres** conformes à la charte (Forge, Inventaire, Solo sans mourir) | ébauches de l'utilisateur + lettres existantes | boutons (repos / sélectionné), titres, icônes | `node scripts/generer-propositions-solo-forge.mjs --sortie <dossier>` | Node | `reproductibilite-visuels.test.ts`, `legendarium.test.ts` |
| `scripts/generer-logos-export.mjs` | Génère le module des **logos intégrés** à l'export infographique | `public/assets/icones/*.svg` | `src/data/forge/logosExport.ts` | `node scripts/generer-logos-export.mjs [--verifier]` | Node | `tests/logique/export-fiche.test.ts` |
| `scripts/tracer-icone-faconnee.py` | Vectorise l'**icône « arme façonnée »** du jeu (un quadrant, puis miroir) | `icone-faconnee/source-icone-du-jeu.jpg` | `src/data/forge/iconeFaconnee.ts`, `icone-faconnee.svg` | `python3 scripts/tracer-icone-faconnee.py` | numpy, OpenCV, scikit-image | `tests/logique/icone-faconnee.test.ts` |

Les scripts Python ne tournent **pas** sur le PC de travail habituel (Windows sans Pillow, numpy,
scipy, OpenCV) : ce sont des outils de l'assistant, dont le **résultat est enregistré dans le
projet**. On ne les relance que si une source change.

## 3. La chaîne du titre de l'en-tête

```
identite-forge-armory-source.png        (le dessin d'origine : emblème, titre, ligne, sous-titre)
   │
   ├─ generer-icones.py ──► logo-titre/logo-forge-armory-texte-sans-cristal.png   (l'ORIGINAL, 803 × 158, « O » de FORGE vide)
   │                                   │
   │                                   └─ ajouter-cristal-logo-titre.py ──► public/logo-forge-armory-texte.png
   │                                                                        (utilisé par src/components/EnTeteApp.tsx)
   │
   └─ generer-titre-svg.py ──► logo-titre/forge-armory-titre.svg          (le même titre, vectoriel)
```

- `generer-icones.py` **n'écrit plus** l'image publique du titre : il écrit l'original *sans*
  cristal puis lance lui-même `ajouter-cristal-logo-titre.py`. Avant ce changement (19/10/2026),
  le relancer **effaçait le cristal en silence**. Le test `logo-titre.py` prouve, dans une copie
  jetable du projet, que le générateur redonne exactement l'image du projet.
- **Ne copiez jamais l'image « sans cristal » dans `public/`.**
- Le dessin d'origine n'a de cristal que dans le « O » d'ARMORY ; celui de FORGE est **ajouté**
  (demande du 19/10/2026).

### 3.1 Le cristal du « O » de FORGE

| | Image PNG (`ajouter-cristal-logo-titre.py`) | SVG (`generer-titre-svg.py`) |
|---|---|---|
| Principe | Le cristal du « O » d'ARMORY (un losange de **12 × 29 px**, composante isolée) est copié **pixel pour pixel** au centre du « O » de FORGE | Le cristal d'ARMORY est défini **une fois** (`#fa-titre-cristal`) et posé deux fois avec `<use>` : en place pour ARMORY, translaté pour FORGE |
| Centrage | Décalage des centres d'anneau **mesuré**, pas supposé (les deux « O » ont la même largeur, 61 px) | Décalage des centres des **contre-formes** mesuré : (−691,94 ; +0,15) unités |
| Garantie | Aucun autre pixel ne change (318 pixels de différence, tous dans le rectangle du cristal) | Les deux cristaux sont **identiques par construction** |

### 3.2 Le SVG du titre : pourquoi une vectorisation

Le « O » du titre de l'en-tête fait 62 px de large (rond), alors que celui des titres du kit v5
n'en ferait que 54 à même hauteur ; le « E » diffère aussi. Le mot-symbole est donc **un dessin à
part** : le recomposer avec les lettres des titres (§4) donnerait une imitation. L'outil trace les
**vrais contours** :

1. Argent neutre = canal *minimal* de (R, G, B) ; cyan = *bleu − rouge*. Cela sépare l'étoile et sa
   lueur de l'argent.
2. Trois bandes (titre, ligne et étoile, sous-titre) repérées par leurs lignes occupées.
3. Chaque bande est agrandie **×8** (bicubique) puis ses contours sont extraits au **niveau de
   demi-luminosité** (marching squares, précision d'un huitième de pixel).
4. Simplification (tolérance 0,12 px) puis courbes de **Bézier lissées**, en gardant les **angles
   vifs** (empattements, pointes ; seuil de virage 38°).
5. Remplissages de la charte : texte en dégradé vertical `#ffffff → #d4d9df → #f2f4f6` ; étoile
   en cyan ; contre-formes par `fill-rule="evenodd"` (jamais peintes en noir).

Fidélité mesurée : recouvrement de la silhouette avec l'image de l'en-tête **96 %** (titre 98 %,
ligne et étoile 96 %, sous-titre 87 %). Le creux des « R » est *ouvert* vers le bas (le pied passe
près de la haste) : il n'y a donc pas de contre-forme fermée, et les **14 contours** du titre sont
les bons (11 lettres, 2 contre-formes de « O », 1 cristal).

Limites connues : la matière métallique de l'image devient un dégradé plat ; le sous-titre
(28 px de haut dans la source) est vectorisé depuis peu de pixels (ses coins sont légèrement
adoucis).

## 4. La « police d'écriture » : des lettres en tracés

**Il n'y a pas de fichier de police.** Les titres illustrés sont dessinés **en tracés** (corps 180,
interlettrage 45, capitales à empattements fins, A → Λ sans barre, un seul « O » orné par titre).
`scripts/glyphes-titres.mjs` ne crée aucune lettre : il **réutilise celles déjà dessinées** dans
les titres de l'utilisateur.

Hypothèses vérifiées (par `diagnostiquer` et par les tests) :

- les chemins sont en coordonnées **absolues** (`M L H V C Z`) ;
- **une lettre = un groupe de sous-chemins qui se recouvrent en abscisse** (le trou d'un « O »,
  l'accent d'un « É ») ;
- deux occurrences d'une même lettre ont **exactement la même forme** dans tous les fichiers ;
- le tracé du texte est le plus long `<path>` portant la classe `silverText`.

Tailles mesurées (unités du cadre de 1024) : F 135 × 181, O 164 × 189, R 163 × 183, G 168 × 189,
E 139 × 181, Y 161 × 181, A (Λ) 172 × 183 (hauteur de capitale ≈ 181).

### API (`import … from "./glyphes-titres.mjs"`)

| Fonction | Usage |
|---|---|
| `trouverTexte(svg)` | Le tracé du texte (`silverText`) et sa position dans le fichier |
| `analyserChemin(d)` / `serialiser(sous)` | Découpe un tracé en sous-chemins (avec boîtes) / le réécrit |
| `lettres(sous)` | Regroupe les sous-chemins en lettres (recouvrement en abscisse) |
| `lettresEtiquetees(svg, texte)` | Les lettres d'un titre, étiquetées par les caractères du texte attendu (erreur si le compte ne tombe pas juste) |
| `formeNormalisee(g)` | Forme d'une lettre indépendante de sa position (pour comparer deux occurrences) |
| `ecart(lettresFichier, iPrec, iCur)` | Espace entre deux lettres consécutives (bord droit → bord gauche) |
| `composer(plan)` / `centrer(texte, centre)` | Compose un texte (`plan = [{ lettre, ecart }]`) puis le centre |
| `trouverSoulignage(svg)` | Le soulignage : deux segments, `opacity="0.9"`, **exactement 20 nombres** |
| `mesurerBords(svg, texte)` | `lsb` / `rsb` : ce qui dépasse à gauche et à droite de la première et de la dernière lettre |
| `souligner(modele, xg, xd)` | Nouveau soulignage de `xg` à `xd`, sur le modèle de l'ancien |
| `remplacerD(svg, index, balise, d)` | Remplace l'attribut `d` d'une balise `<path>` |
| `CENTRE_TITRE = 4264.4` | Centre horizontal commun des soulignages |
| `TEXTES` | Correspondance fichier → texte du titre (15 titres) |

**Espacement** : modèle **additif** mesuré dans les fichiers de l'utilisateur = marge droite de la
lettre précédente + marge gauche de la suivante + interlettrage, plus une espace entre les mots ;
validé en recomposant les textes existants.

La police vectorielle fournie à part (`D2-Build-Analyzer-Vector-Font.zip` : reconstruction d'un
sans-serif géométrique dérivée de Lato, licence SIL OFL, 95 glyphes SVG ASCII) n'est **utilisée
par aucun de ces outils** ; l'interface de l'appli, elle, utilise **Inter**.

## 5. Cristaux

| Cristal | Où | Forme et règles | Comment le gère-t-on |
|---|---|---|---|
| **Cristaux d'anneau** | Logos du sélecteur et des profils | Verticaux, **à l'intérieur du cercle** : sélecteur demi-hauteur 86, demi-largeur 21, centres y = 196 et 830 ; profils 64 / 17, centres y = 174 et 850 | Repris tels quels des fichiers de référence (`generer-propositions-solo-forge.mjs`, étape 3) |
| **Étoile du soulignage** | Sous chaque titre | Étoile cyan, demi-hauteur 43, dégagement 54 de chaque côté | `souligner` **recalcule l'ouverture autour du centre** du nouveau soulignage |
| **Cristal du « O »** | « O » orné d'un titre | Losange argenté dans la contre-forme | §3.1 |
| **Cristaux de l'emblème** | Emblème (haut et bas) | Dégradé cyan `#52e7ff → #00aef5 → #0087d9` | `forge-armory-emblem.svg` (cristal du bas corrigé le 01/10/2026) |

## 6. Séparateurs et lignes

| Élément | Valeurs | Source |
|---|---|---|
| **Soulignage des titres** | Deux segments pointus de part et d'autre de l'étoile ; **épaisseur 20** (8 avant : sous le pixel, à peine visible ; **validée le 08/10/2026 : « c'est bon comme ça »**) ; `opacity="0.9"` ; centré sur 4264,4 | `retoucher-visuels.mjs` (retouche 1) — *seule valeur à ajuster : les nombres `620.0` et `640.0`* |
| **Séparateur vertical des plaques** | x = 1135, hauteur 157, largeur 3, **en fondu** | Charte §3 |
| **Lignes flottantes** | Deux filets de 4 de haut, à ±(262 + 28) du centre, extrémités en fondu | Charte §3 |
| **Séparateur de la barre de la Forge** | Vertical (`role="separator"`), **3 px**, plus haut que 24 px, pas plus haut que les boutons, argent `#d9dde2` qui **s'efface** aux deux extrémités | `src/index.css`, `tests/ui/forge-barre.py` |
| **Ligne du titre de l'en-tête** | Deux segments argentés interrompus par l'étoile cyan | `generer-titre-svg.py` |

## 7. Retouches des visuels (`retoucher-visuels.mjs`)

À **relancer après tout remplacement** de fichiers de `public/assets/` par de nouvelles versions de
l'auteur des visuels. Détail et justification : [RETOUCHES-VISUELS.md](RETOUCHES-VISUELS.md).

1. **Soulignage** des titres porté de 8 à 20 unités (24 titres).
2. **Icône de la carte « 1. Doctrine élémentaire »** et du bloc « Classe et Doctrine » : mêmes
   proportions (agrandissement ×1,4 autour du centre du cercle), six billes agrandies
   (rayon 25 → 30, masque 42 → 47).
3. **Connexion et Manifest** sans losange « + / − » (ce ne sont pas des blocs repliables).
4. **Renumérotation des cartes du Scoring** (le texte est recomposé avec les lettres existantes ;
   soulignage recalculé, titre recentré).
5. **Bouton « Carrière » élargi à la largeur d'« Accomplissements »** (cadre 4897 × 1024 au lieu de 4316 × 1024),
   pour que les deux boutons du bloc Connexion aient exactement la même taille. Fichiers fabriqués :
   `bouton-carriere-large(.svg | -selectionne.svg)`, les originaux restent intacts. Garde-fou : la plaque obtenue doit
   être identique à celle d'Accomplissements.

Options : `--verifier` (ne modifie rien ; code de sortie 1 si une retouche manque),
`--racine <dossier>` (travaille sur une autre copie ; utilisé par les tests). Le test vérifie que
**le projet livré est exactement ce que le script produit depuis l'archive** (octet pour octet).

## 8. Générateur de nouveaux boutons et titres (`generer-propositions-solo-forge.mjs`)

Produit, d'après des ébauches de l'utilisateur :
`selecteur/bouton-forge(.svg | -selectionne.svg)`, `bouton-inventaire(…)`,
`panneaux/titre-solo-sans-mourir.svg`, `icones/icone-forge.svg`, `icone-solo-sans-mourir.svg`.

Méthode : (1) le texte est **composé avec les lettres déjà dessinées** (`glyphes-titres.mjs`,
modèle d'espacement additif) ; (2) les symboles sont **redessinés en vectoriel** selon la charte
(argent, fentes transparentes par **masque**, une partie en cyan avec lueur, dans les zones
permises) ; (3) plaque, anneau, cristaux, soulignage et étoile sont **repris tels quels** des
fichiers de référence ; (4) identifiants **préfixés**.

## 9. Logos de l'export infographique (`generer-logos-export.mjs`)

La page d'export est une page HTML **autonome**, fabriquée de façon synchrone, avec une politique
de sécurité qui n'autorise ni script ni image locale : les logos doivent être des **SVG en ligne**,
disponibles sans chargement. Le module `src/data/forge/logosExport.ts` est **généré** (jamais
modifié à la main) ; `--verifier` contrôle qu'il est à jour (le test de l'export le fait aussi).
Les logos listés dans `LOGOS_A_VENIR` sont repris automatiquement dès que leur fichier existe.

## 10. Recettes

**Changer le texte d'un titre.** Ajouter l'entrée dans `TEXTES` (`glyphes-titres.mjs`), puis
recomposer comme `retoucher-visuels.mjs` (`lettresEtiquetees` → `composer` → `centrer` →
`souligner` → `remplacerD`). Aucune lettre à redessiner si toutes existent déjà ; sinon, il faut
que l'utilisateur la dessine.

**Remplacer des visuels par une nouvelle archive.** Copier l'archive dans
`ressources-installateur/forge-armory/app-assets/` (l'ancienne va dans `archives-precedentes/`),
recopier dans `public/assets/`, puis `node scripts/retoucher-visuels.mjs`, puis
`node scripts/generer-logos-export.mjs`, puis lancer les tests.

**Régénérer l'identité (emblème, titre, favicons, icône).**
`python3 ressources-installateur/forge-armory/generer-icones.py` — il enchaîne seul le cristal du
titre. Contrôle : `python3 tests/ui/logo-titre.py`.

**Mettre à jour le SVG du titre.** `python3 scripts/generer-titre-svg.py` puis
`python3 tests/ui/titre-svg.py`.

**Ajouter un logo.** Suivre la liste de contrôle de la
[charte](CHARTE-GRAPHIQUE.md#13-créer-un-nouveau-logo--liste-de-contrôle), préfixer les
identifiants, déclarer le fichier (catalogue du kit ou `forgeAssetsComplement.ts`), puis relancer
`generer-logos-export.mjs` s'il doit figurer dans l'export.

## 11. Pièges connus (tous déjà rencontrés)

- **Soulignage introuvable** : dans les **boutons**, les reflets des cristaux sont aussi des tracés
  à `opacity="0.9"`. Le soulignage est celui dont le tracé compte **exactement 20 nombres** (deux
  segments de 5 points).
- **Ouverture de l'étoile mal placée** : `souligner` doit recalculer l'ouverture **autour du centre
  du nouveau soulignage** (avant, elle gardait la position du modèle : faux dès que la largeur du
  titre change).
- **Écarts des bords** : le soulignage couvre la « boîte d'avancement » du texte, plus large que les
  lettres, **différemment** selon la première et la dernière lettre (`mesurerBords`).
- **Générateur d'icônes** : ne jamais lui laisser écrire directement le titre public (il effaçait
  le cristal) — corrigé et testé.
- **Modules générés** (`forgeAssets.ts`, `logosExport.ts`) : ne pas modifier à la main ; les
  ajouts vont dans `forgeAssetsComplement.ts`.
- **Image de saison** : le filigrane de Bungie contient une **bande sombre translucide** derrière
  le symbole (bord net à 25,9 % de la largeur, symbole de 5,7 % à 20,3 % × 3,8 % à 19,3 %) ;
  l'afficher à part exige un cadrage serré et un mélange « écran » (`IconeSaison.tsx`).
- **Cadres de boutons différents** : `.bouton-vue` impose le cadre 4316 / 1024. Un fichier plus large (Accomplissements, 4897) y est **réduit** pour tenir (anneau 12 % plus petit) : deux boutons de cadres différents ne peuvent jamais avoir la même taille. Solution retenue : élargir le plus étroit (retouche 5) et utiliser le modificateur `bouton-vue--large` ; ne jamais étirer un SVG (le rond de l'anneau deviendrait une ellipse).
- **Un test qui plante n'est pas un test qui échoue** : écrire les contrôles pour qu'une absence
  soit un échec franc.

## 12. Tests des visuels

| Test | Ce qu'il garantit |
|---|---|
| `tests/logique/visuels.test.ts` | Lettres : extraction, formes identiques d'un fichier à l'autre, recomposition des textes existants, soulignage |
| `tests/logique/reproductibilite-visuels.test.ts` | Le projet livré = ce que produisent `retoucher-visuels.mjs` et le générateur, **octet pour octet** ; seconde exécution sans effet |
| `tests/logique/carriere-large.test.ts` | Bouton Carrière élargi : cadre 4897 × 1024 et catalogue ; originaux intacts ; plaque identique à celle d'Accomplissements ; titre décalé d'exactement 290,5 ; anneau et symbole inchangés ; identifiants préfixés et résolus |
| `tests/ui/connexion-boutons.py` | Bloc Connexion : mêmes taille et cadre pour les deux boutons (mesurés sur les pixels), alignés, entre le titre et « connecté », masqués hors connexion, repli en fenêtre étroite, clics, câblage dans `DashboardPage` |
| `tests/logique/export-fiche.test.ts` | Le module des logos d'export est à jour |
| `tests/logique/icone-faconnee.test.ts` | Fidélité de l'icône façonnée (> 97 %) |
| `tests/ui/logo-titre.py` | Titre PNG : seul le cristal a changé, identique à celui d'ARMORY, centré ; chaîne du générateur |
| `tests/ui/titre-svg.py` | Titre SVG : conformité à la charte, fidélité, deux cristaux identiques et centrés, étoile cyan, reproductibilité |
| `tests/ui/forge-barre.py` | Barre de la Forge : ordre, séparateur, logos v5, états de la charte |
