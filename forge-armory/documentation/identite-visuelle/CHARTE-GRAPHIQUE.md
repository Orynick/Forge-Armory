# Charte graphique Forge Armory

Charte des visuels du **Destiny 2 Build Analyzer** — par Orynick/Orygamer.

> **Provenance.** Les §1 à 12 reprennent la charte du kit de visuels
> (`ressources-installateur/forge-armory/app-assets/docs/charte-graphique.html`, archive v5),
> dessinée par l'utilisateur. Les parties marquées **« Dans l'appli »** décrivent ce qui est
> *réellement appliqué* par le code et vérifié par les tests. Les outils qui fabriquent ces
> visuels sont décrits dans [RETOUCHES-VISUELS.md](RETOUCHES-VISUELS.md).
> Dernière mise à jour : 19/10/2026 (v0.4.13).

## Sommaire

1. [Principes](#1-principes) · 2. [Identité : emblème et titre](#2-identité--emblème-et-titre) ·
3. [Couleurs](#3-couleurs) · 4. [Typographie](#4-typographie) ·
5. [Géométrie des logos](#5-géométrie-des-logos-cadre-1024--1024) ·
6. [Plaque et mise en page](#6-plaque-et-mise-en-page-logo--titre) · 7. [États](#7-états) ·
8. [Familles et dimensions](#8-familles-et-dimensions) ·
9. [Intégration](#9-intégration-dans-lappli) · 10. [Marques d'objets](#10-marques-dobjets-dans-lappli) ·
11. [La barre de la Forge](#11-la-barre-de-la-forge-dans-lappli) · 12. [Catalogue](#12-catalogue) ·
13. [Créer un nouveau logo](#13-créer-un-nouveau-logo--liste-de-contrôle)

## 1. Principes

- **Matière** : argent dégradé sur fond noir, avec des **fentes noires qui découpent les formes**
  (comme le papillon de l'emblème). Les découpes sont **transparentes** (masques), jamais peintes en noir.
- **Accent** : une partie du dessin est **toujours en cyan** (visière, facette, maillon, lignes,
  flamme…). Cyan = énergie, information active.
- **Cercle parfait** pour chaque logo ; les formes restent à l'intérieur ; **jamais de débordement**.
- **Lisibilité d'abord** : un logo doit rester reconnaissable à **24 px de haut** ; pas de détail
  fin sous **6 px** à l'échelle d'affichage.
- **Cohérence** : mêmes dimensions, mêmes traits, mêmes dégradés pour tous les éléments d'une même
  famille.

## 2. Identité : emblème et titre

L'identité vient d'une image unique fournie le 01/10/2026 (`identite-forge-armory-source.png`,
1254 × 1254, fond noir) : **tout le reste s'en déduit**.

| Élément | Description |
|---|---|
| **Emblème** | Papillon aux ailes d'argent, figure centrale en forme de casque, **cercle** d'argent, deux **flèches** latérales, deux **cristaux cyan** (haut et bas) qui traversent le cercle |
| **Titre (mot-symbole)** | **FORGE ARMORY** en capitales argentées à empattements fins ; le A est un **Λ** sans barre ; **les deux « O » portent un cristal** (losange argenté dans la contre-forme) — *ajouté dans « FORGE » le 19/10/2026* |
| **Ligne** | Deux filets argentés pointus, interrompus au centre par une **étoile cyan** à quatre branches |
| **Sous-titre** | « DESTINY 2 BUILD ANALYZER \| *par* Orynick/Orygamer », sans-serif géométrique, capitales très espacées ; « par » en italique |

Fichiers : `public/logo-forge-armory-embleme.png` (304 × 342) et `public/logo-forge-armory-texte.png`
(803 × 158) pour l'en-tête ; **`ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg`**
pour le titre vectoriel (cadre 1029 × 202) ; `forge-armory-emblem.svg` pour l'emblème vectoriel.

**Dans l'appli.**
- **En-tête** (`src/components/EnTeteApp.tsx`, géométrie `src/lib/enTete/geometrieIdentite.ts`) :
  taille « B » choisie le 01/10/2026 ; échelle **0,37** ; écart emblème–texte **0,29 × le diamètre du
  cercle** ; le **cercle va du haut du titre (« F ») au bas du sous-titre**, les losanges dépassent
  au-dessus et au-dessous. Le texte étant dans l'image, aucune police n'est nécessaire.
- **Favicons** (onglet) : le **papillon seul**, 16 / 32 / 48 px, fond noir (le logo complet est
  illisible à 16 px).
- **Icône Windows** (`icon.ico`) : **papillon seul** en 16, 24 et 32 px ; **emblème complet** en 48,
  64, 128 et 256 px, sur **fond noir** (un fond transparent ferait disparaître le logo blanc sur les
  thèmes clairs).
- **Filigrane des fiches exportées** : l'emblème **vectoriel**, **7 %** d'opacité, par-dessus le
  contenu (760 px dans l'export de 900 px ; 420 px dans la fenêtre « Voir »).

## 3. Couleurs

### Charte du kit

| Rôle | Valeur |
|---|---|
| Fond | `#06080d` |
| Plaque, haut → bas | `#131923` → `#080b11` |
| Argent clair | `#ffffff` |
| Argent | `#d9dde2` |
| Argent texte | `#d4d9df` |
| Cyan clair | `#8ff3ff` |
| Cyan | `#1cc6ff` |
| Cyan moyen | `#00aef5` |
| Cyan profond | `#0078d0` |

**Profils** (anneau, cadre, cristaux, symbole, ligne) :

| Profil | Dégradé | Halo |
|---|---|---|
| Roaming (vert) | `#e9ffd2` → `#8fd64f` → `#d4f7b0` | `#86ee3a` |
| DPS (or) | `#fff3c4` → `#e8b53a` → `#ffe9a8` | `#ffc83a` |
| PVP (rouge) | `#ffc4c4` → `#e43030` → `#ff9a9a` | `#ff4545` |
| Neutre | argent + cristaux cyan (style Forge d'origine) | cyan `#3fdcff` |

**Titre vectoriel** : texte en dégradé vertical `#ffffff` → `#d4d9df` → `#f2f4f6` ; ligne
`#d9dde2` (opacité 0,9) ; sous-titre `#e3e3e3` ; étoile cyan `#22b6ff` (centre) → `#0cb3f2` →
`#05d8f4`. **Emblème** : argent `#ffffff` → `#d9dde2` → `#ffffff` (diagonale), cristaux
`#52e7ff` → `#00aef5` → `#0087d9`.

### Dans l'appli (interface)

| Rôle | Valeur |
|---|---|
| Fond de page | `#0d0f14` |
| Surfaces (cartes, fenêtres) | `#12151c`, `#161922` |
| Bordures et traits | `#3a3f4b`, `#2a2e38` |
| Texte | `#e8e6df` |
| Texte secondaire | `#b7b3a8`, `#9a968a`, `#7d7a70` (le plus discret) |
| **Accent bleu** : coche ✓ « roll réel (équipé en jeu) », informations | `#7aa2f7` |
| **« Simulé » et « amélioré »** : badges « Simulation (N …) » et « simulé », légende ▲ « perk amélioré » | `#e8c547` (doré) |
| Réussite | `#7fd88f` |
| Avertissement | `#e0c080` |
| Erreur | `#e08080` |
| Rareté **exotique** / **légendaire** / autre | `#ceae33` / `#7a4fa3` / `#4a4f5c` |
| **Arme façonnée** (icône) | `#e49f87` (saumon corail, mesuré sur le jeu) |
| Fond des marques sur vignette | `rgba(13, 15, 20, 0.55)` |

## 4. Typographie

**Titres** (charte du kit) : capitales à empattements fins, **converties en tracés** (aucune police
à charger) ; **corps** (hauteur de capitale) **180**, **interlettrage 45** (¼ du corps). A → **Λ**
(sans barre, pointe haute, empattements) ; « À » = Λ + accent grave. **Un seul « O » orné par
titre (le dernier)**, avec un losange dans le jambage, comme dans « ARMORY ». Titres **toujours en
majuscules** ; les numéros de carte sont inclus (« 3. ARMES ET ARMURES »).

**Texte courant dans l'appli** : **Inter**, avec `system-ui, sans-serif` en repli. Le texte des
visuels est en tracés ; il est donc **invisible pour un lecteur d'écran** : toujours renseigner
`alt` / `aria-label`.

## 5. Géométrie des logos (cadre 1024 × 1024)

| Élément | Valeur |
|---|---|
| Centre | (512, 512) |
| Anneau | rayon de la ligne médiane **436**, épaisseur **22** (bord extérieur 447, intérieur 425), dégradé argent |
| Cristaux — sélecteur | demi-hauteur **86**, demi-largeur **21**, centres y = **196** et **830** ; verticaux, à l'intérieur du cercle |
| Cristaux — profils | demi-hauteur **64**, demi-largeur **17**, centres y = **174** et **850** |
| Sans cristaux (titres) | symbole dans un rayon ≤ **330** ; étendue visuelle courante ±280 à ±300 |
| Avec cristaux | le symbole reste **entre** les cristaux : verticalement ±230 (±215 conseillé) ; hors de l'axe vertical il peut s'étendre plus |
| Trait des formes | ≈ **34** (maillon, loupe), **20** (hexagone), **8 à 10** pour les fentes de découpe |
| Lueur sur les parties cyan | flou gaussien **4** (filtre `glowSoft`) |

## 6. Plaque et mise en page logo + titre

| Élément | Valeur |
|---|---|
| Cadre | hauteur **1024** ; largeur selon la famille (§8) : le titre le plus long de la famille fixe la largeur, **tous les éléments de la famille ont la même** |
| Plaque | demi-hauteur **262** (524 au total) ; rattachée au cercle (bord gauche épouse l'anneau) ; coin droit **biseauté de 82** |
| Bordure | trait argent **11** + filet intérieur blanc 16 % (épaisseur 2,5, décalé de 15) |
| Fond de plaque | dégradé vertical `#131923` → `#080b11` |
| Lignes flottantes | deux filets de **4** de haut, à ±(262 + 28) du centre, extrémités en fondu |
| Séparateur vertical | x = **1135**, hauteur **157**, largeur **3**, en fondu |
| Zone du titre | marge intérieure **130** de chaque côté ; titre centré dans la plaque, axe horizontal = centre du cercle |
| Losange replié / déplié | séparateur à x = XE_standard + 6, puis losange (demi-diagonale **90**, trait 12, argent) ; signe **+** argent / **−** cyan + `glowSoft` (demi-longueur 40, demi-épaisseur 9), dessinés en rectangles pleins |
| Ligne sous le titre | **même largeur que le titre** (jamais plus), centrée ; à baseline + 0,55 × corps ; **étoile cyan** au milieu (demi-hauteur 43, dégagement de 54 de chaque côté) ; le groupe titre + ligne est centré verticalement sur le cercle |
| **Épaisseur du soulignage** | **20** (retouche validée le 08/10/2026 ; 8 était sous le pixel) |

## 7. États

| Famille | Repos | Sélectionné |
|---|---|---|
| Boutons (sélecteur, profils) | argent, ligne grise | lettrage et ligne : **lueur niveau 3** (halos σ4 / 100 %, σ10 / 95 %, σ20 / 85 %), texte teinté `#f0fdff` → `#c9f6ff` ; logo et cadre : lueur intermédiaire (σ4 / 90 %, σ12 / 85 %, σ17 / 70 %), argent pur ; halo = cyan `#3fdcff` (lettrage) ou couleur du profil |
| Titres de catégories | repos uniquement | **aucune lueur** (ce ne sont pas des boutons) |
| Blocs repliables | losange à droite avec un **+** argent (replié) | losange avec un **−** cyan lumineux (déplié) ; aucune lueur sur le reste du bloc |

> **Le halo reste toujours à l'intérieur du cadre : la taille de l'élément ne change jamais d'un
> état à l'autre.** Changer d'état = changer de fichier (`repos` ↔ `selectionne`,
> `replie` ↔ `deplie`) ; les deux ont exactement le même cadre.

## 8. Familles et dimensions

| Famille | viewBox | Contenu |
|---|---|---|
| Boutons sélecteur | `0 0 4316 1024` | Build Analyzer, Legendarium, Load-outs, Collection · 2 états · avec cristaux |
| Boutons profils | `0 0 3781 1024` | Neutre, PvE Roaming, PvE DPS, PVP · 2 états · cristaux courts |
| Titres de catégories | `0 0 7505 1024` | 15 titres · sans cristaux · repos uniquement |
| Icônes seules | `0 0 1024 1024` | cercle + symbole (± cristaux) |
| Blocs repliables (losange +/−) | `0 0 7805 1024` | 7 blocs × 2 états ; plaque prolongée de 300 à droite pour la zone du losange |
| Titre de l'en-tête | `0 0 1029 202` | « FORGE ARMORY », ligne à étoile, sous-titre |

## 9. Intégration dans l'appli

1. **Même hauteur pour toute une famille** ; la largeur suit le ratio du `viewBox`. Hauteur
   minimale conseillée : **40 px** (titres, boutons), **24 px** (icônes). En dessous, utiliser
   l'icône seule.
2. **Logo + plaque + titre = un seul élément** (un seul bouton ou en-tête) : ne jamais les séparer.
3. **Changement d'état = changement de fichier.** Rien ne bouge à l'écran.
4. **Accessibilité** : `alt` / `aria-label` = libellé du titre (le texte est en tracés),
   `aria-expanded` sur les blocs repliables.
5. Les SVG fonctionnent en `<img>` **comme** en SVG intégré : identifiants uniques
   `fa-<chemin>-…`, aucune collision, **aucune police, aucun script, aucune ressource externe**.
6. Pas d'état « sélectionné » pour les titres de catégories et les cartes. Le survol n'est pas
   fourni (à faire en CSS si besoin).
7. Textes en **français** uniquement pour l'instant.
8. « Artefact » reprend un SVG d'Ory (shield-artifact, SVG Repo) : **vérifier sa licence** avant
   une diffusion publique.

## 10. Marques d'objets (dans l'appli)

Petits signes posés sur les armes et armures ; ils suivent la même logique que les logos (symbole
net, jamais de débordement) et ont chacun **une taille et une place fixes**.

| Marque | Où | Règle |
|---|---|---|
| **Icône « arme façonnée »** (quatre blocs, `#e49f87`) | **En bas à gauche** de la vignette ; **à gauche du nom** dans les fenêtres | Dessin = **32 %** de la vignette, **au moins 9 px** (**10 px** sur une vignette de 31, **14 px** sur 44), dans une pastille de fond `rgba(13,15,20,0.55)` aux coins arrondis de 3 px, de marge **1 px** (**2 px** dès 40 px de vignette), posée à **2 px** du bord gauche et du bas |
| **Filigrane de saison** | **Superposé à la vignette**, taille d'origine, symbole **en haut à gauche** | L'image de Bungie telle quelle (transparente, de la taille de la vignette). *Une pastille agrandie, puis une pastille alignée, ont été essayées puis **rejetées** le 15/10/2026 : ne pas les refaire sans demande* |
| **Icône de saison** | **À côté du nom**, dans les fenêtres Détails, Forge et Collection (dans la Forge : entre le nom et les quatre icônes d'arme) | 18 px ; **cadrage serré** sur le symbole (départ 4 % / 2,5 %, côté 19 % de l'image) pour exclure la **bande sombre** du filigrane ; mélange « écran » ; infobulle = nom de la saison |
| **Quatre icônes d'arme** (type, élément, munitions, antichampion) | **À droite du nom**, même ligne | Type d'arme **35 px**, les autres **16 px** (mêmes valeurs dans les fenêtres Détails et dans la Forge) |
| **Badges de simulation** | Cartes de la Forge (« Simulation (N colonnes / emplacements) »), Mon Build (« simulé ») | Texte **doré** `#e8c547`, petit (0,7 rem) ; dit que le perk ou le mod est simulé, **pas appliqué en jeu** |

## 11. La barre de la Forge (dans l'appli)

Une seule ligne, de gauche à droite : bouton **Collection**, bouton **Inventaire**,
**séparateur**, bouton rond **épée** (Armes), bouton rond **bouclier** (Armures).

- **Séparateur** : vertical, **3 px**, plus haut que 24 px sans dépasser les boutons, argent
  `#d9dde2` **en fondu** aux deux extrémités (reprise du séparateur vertical de la charte).
- **Boutons ronds** : logos `icones.armes` (épée) et `icones.armures` (bouclier) de l'archive v5 ;
  **même hauteur** que les boutons de vue (**2,75 rem**) ; le logo n'occupe que **72 %** du bouton
  (au moins 6 px de marge de chaque côté pour contenir la lueur).
- **États** (la famille « icônes » n'a pas de fichier « sélectionné » : rendu en CSS d'après la
  charte) : repos = **argent**, légèrement tamisé, **sans lueur** ; sélectionné = **lueur cyan à
  trois niveaux** (halos de **1,5 / 3,5 / 6 px**, opacités **100 / 95 / 85 %**, couleurs
  `#8ff3ff`, `#1cc6ff`, `#00aef5`) **contenue dans le cadre**. **Rien ne bouge** au changement
  d'état.
- **Accessibilité** : groupe nommé « Type d'objet » ; boutons **à bascule** (`aria-pressed`),
  pas des onglets ; nom en texte pour les lecteurs d'écran ; infobulle ; activables au **clavier**.
  Chaque vue (Collection, Inventaire) **garde son propre choix**.

## 12. Catalogue

Détail, états et dimensions de chaque fichier : `manifest.json` du kit (`id`, `label`, `fichier`,
`largeur`, `hauteur`, `ratio`, `hauteurMinPx`), et `forgeAssets.ts` (même catalogue typé).
Identifiants : `<famille>.<clé>[.<état>]`, par exemple `selecteur.legendarium.selectionne`,
`profils.pvp.repos`, `blocs-repliables.mon-build.deplie`, `icones.armes`.

| Famille | Fichiers |
|---|---|
| Boutons sélecteur (8) | `bouton-build-analyzer`, `bouton-collection`, `bouton-legendarium`, `bouton-loadouts` (× repos / sélectionné) ; ajoutés depuis : `bouton-forge`, `bouton-inventaire` |
| Boutons profils (8) | `bouton-dps`, `bouton-neutre`, `bouton-pvp`, `bouton-roaming` (× repos / sélectionné) |
| Blocs repliables (14) | `titre-artefact`, `-connexion`, `-doctrine`, `-inventaire`, `-manifest`, `-mon-build`, `-sauvegarde` (× replié / déplié) |
| Contexte et cartes (8) | `titre-1-element-doctrine`, `-2-artefact`, `-3-armes-armures`, `-4-effets-build`, `-5-statistiques`, `-contexte-0`, `-contexte-ligne`, `-score-global` (renumérotés le 08/10/2026 dans l'appli) |
| Icônes (22) | `icone-armes-armures`, `-armes`, `-armures`, `-artefact`, `-build-analyzer`, `-collection`, `-connexion`, `-contexte`, `-doctrine`, `-dps`, `-effets-build`, `-inventaire`, `-legendarium`, `-loadouts`, `-manifest`, `-mon-build`, `-neutre`, `-pvp`, `-roaming`, `-sauvegarde`, `-score-global`, `-statistiques` |
| Symboles vectorisés (4) | `symbole-dps`, `-neutre`, `-pvp`, `-roaming` |
| Marque (1) | `forge-armory-emblem` |

## 13. Créer un nouveau logo — liste de contrôle

1. Dessiner sur un cadre **1024 × 1024**, centré sur (512, 512), dans le **rayon utile** (§5).
2. Remplir en **argent** (`silver`), **découper les détails par masque** (fentes de 8–10), jamais en
   noir plein.
3. Réserver une partie du dessin au **cyan** (`cyanL`) + `glowSoft` ; ne pas dépasser **~⅓ de la
   surface**.
4. Vérifier à **24 et 44 px** de haut ; pas d'élément isolé plus fin que **~6 px** à l'écran.
5. Vérifier qu'il ne touche **ni l'anneau ni les cristaux** ; garder une marge visuelle
   **≥ 40 unités**.
6. Générer le titre avec la **même plaque** ; vérifier la largeur du titre et la ligne.
7. **Renommer les identifiants internes** (préfixe unique) avant livraison.
8. Déclarer le fichier, relancer les outils concernés ([RETOUCHES-VISUELS.md](RETOUCHES-VISUELS.md),
   §1) et les tests.

## Décisions de style notables

| Date | Décision |
|---|---|
| 01/10/2026 | Identité Forge Armory ; en-tête taille « B » ; favicon = papillon seul |
| 08/10/2026 | Soulignage des titres à 20 unités (« c'est bon comme ça ») ; icônes de la carte 1 et du bloc « Classe et Doctrine » identiques ; renumérotation des cartes du Scoring |
| 15/10/2026 | Marques de saison sur les vignettes : filigrane à la taille d'origine ; pastille agrandie ou alignée **rejetée** |
| 19/10/2026 | Cristal ajouté dans le « O » de FORGE ; barre de la Forge (Armes / Armures à droite d'Inventaire, séparateur, logos v5) ; SVG du titre |
