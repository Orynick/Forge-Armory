# Canva — boutons charte qu'il reste à fabriquer

Document à donner tel quel à l'auteur des visuels (Claude). Il décrit chaque bouton restant :
**id de catalogue, fichier, texte tracé, cadre, états, logo, fonction et emplacement dans l'appli.**

Contexte : Forge Armory (React + Vite + TS, web Netlify + appli Windows Electron qui embarque le même build).
Les visuels existants vivent dans `public/assets/` (familles `selecteur/`, `actions/`, `icones/`, `profils/`,
`blocs-repliables/`, `titres/`, `symboles/`, `marque/`, `marques/`) et sont référencés par id dans le
catalogue `src/data/forge/forgeAssets.ts` (+ complément `forgeAssetsComplement.ts`), consommé par
`urlVisuel(id)` (`src/lib/visuelsForge.ts`). Un id inconnu ne plante pas l'appli mais affiche une image
vide + erreur console : **ne brancher le code qu'une fois les fichiers livrés** (des repères
« ⚠️ À BRANCHER » sont posés dans le code à chaque emplacement, branche `draft-boutons-manquants`, PR #51).

## Tableau récapitulatif

| # | Id catalogue | Fichier (sous `assets/`) | Texte tracé | Famille | Cadre (viewBox) | États | Emplacement |
|---|---|---|---|---|---|---|---|
| 1 | `actions.connexion-bungie` | `actions/bouton-connexion-bungie.svg` | « Connexion Bungie.net » | actions | `0 0 <L> 1024` | repos | Bloc « Connexion à Bungie », hors connexion (`DashboardPage.tsx`) |
| 2 | `actions.enregistrer-le-build` | `actions/bouton-enregistrer-le-build.svg` | « Enregistrer le build… » | actions | `0 0 <L> 1024` | repos | Bloc « Sauvegarde et partage du Build » (`BlocPartage.tsx`) |
| 3 | `actions.lancer-optimisation` | `actions/bouton-lancer-optimisation.svg` | « Lancer l'optimisation » | actions | `0 0 <L> 1024` | repos | Page Optimiseur v2 (`PageOptimiseur.tsx`, `data-bouton-lancer`) |
| 4 | `actions.calculer-combinaisons` | `actions/bouton-calculer-combinaisons.svg` | « Calculer les meilleures combinaisons » | actions | `0 0 <L> 1024` | repos | Optimiseur d'armures de la Forge (`OptimiseurArmures.tsx`, `data-calculer`) |
| 5 | `selecteur.tiroir-loadouts` | `selecteur/bouton-tiroir-loadouts.svg` | « LOAD-OUTS » | selecteur (vertical) | `0 0 1024 4316` (proposition) | repos (+ selectionne optionnel) | Onglet vertical du tiroir Loadouts, bord droit (`PanneauLoadouts.tsx`) |
| 6 | `selecteur.tiroir-solo` | `selecteur/bouton-tiroir-solo.svg` | « SOLO » | selecteur (vertical) | `0 0 1024 4316` (proposition) | repos (+ selectionne optionnel) | Onglet vertical du tiroir « Solo sans mourir », bord gauche (`PanneauTriomphes.tsx`) |

Déjà prévu sans fichier neuf : le « ← Retour » des pages Optimiseur réutilisera
`actions.retour-build-analyzer` (existe déjà).

---

## 1. Bouton « Connexion Bungie.net »

- **Id** : `actions.connexion-bungie` · **famille** : `actions` · **état** : `repos`
- **Fichier** : `assets/actions/bouton-connexion-bungie.svg`
- **Label (texte tracé dans l'image)** : « Connexion Bungie.net » — casse mixte, capitales de 200 (comme « Mettre dans Mon Build »)
- **Cadre** : `viewBox="0 0 <L> 1024"`, L = largeur du texte + marges (référence : `bouton-fermer.svg` = 2313 pour « Fermer », `bouton-mettre-dans-mon-build.svg` = 4581)
- **Géométrie** (identique à tous les boutons d'action, cf. `TAILLE-DES-BOUTONS.md`) : cercle `cx=512 cy=512 r=436`, trait 22 ; plaque 524 de haut (250→774), biseau de 82 à droite, bordure 11, extrémité gauche en arc de rayon 431 centré sur le cercle ; groupe icône `transform="translate(512 512) scale(1.2006)"` ; filet vertical `fadeV` juste après le cercle (x ≈ 1038, width 3)
- **Logo dans le cercle** : reprendre tel quel `assets/icones/icone-connexion.svg` (1024×1024, id catalogue `icones.connexion`)
- **Fonction** : lance l'autorisation OAuth Bungie.net (redirection navigateur en web ; fenêtre dédiée dans l'appli installée). Bouton principal du bloc Connexion.
- **Emplacement** : bloc « Connexion à Bungie » en haut de page — `src/pages/DashboardPage.tsx` (~ligne 516, repère « ⚠️ À BRANCHER » posé), affiché **uniquement hors connexion** (`!connecte`). Web + installable.
- **Affichage prévu** : hauteur CSS `2.5rem` (40 px), largeur auto (ratio du catalogue) — même hauteur que la barre de la Forge.
- **Intégration** : remplacer le bouton texte par `<BoutonAction id="actions.connexion-bungie" libelle="Connexion Bungie.net" … />` + ajouter l'id au type `IdBoutonAction` (`src/components/BoutonAction.tsx`).

## 2. Bouton « Enregistrer le build… »

- **Id** : `actions.enregistrer-le-build` · **famille** : `actions` · **état** : `repos`
- **Fichier** : `assets/actions/bouton-enregistrer-le-build.svg`
- **Label** : « Enregistrer le build… » (casse mixte ; si le glyphe « … » manque, « Enregistrer le build » suffit)
- **Cadre** : `0 0 <L> 1024` comme ci-dessus.
- **Logo dans le cercle** : reprendre `assets/icones/icone-sauvegarde.svg` (`icones.sauvegarde`).
- **Fonction** : ouvre la fenêtre d'enregistrement du build courant parmi les Load-outs (action primaire du bloc). Le `data-enregistrer-build` du bouton texte actuel doit être conservé.
- **Emplacement** : bloc « Sauvegarde et partage du Build » — `src/components/BlocPartage.tsx` (~ligne 86, repère « ⚠️ À BRANCHER » posé), toujours affiché. Web + installable.
- **Affichage prévu** : `2.5rem` (40 px). Intégration identique au n°1.

## 3. Bouton « Lancer l'optimisation » (page Optimiseur v2)

- **Id** : `actions.lancer-optimisation` · **fichier** : `assets/actions/bouton-lancer-optimisation.svg`
- **Label** : « Lancer l'optimisation » (casse mixte)
- **Cadre** : `0 0 <L> 1024`.
- **Logo dans le cercle** : reprendre `assets/icones/icone-optimisation.svg` (`icones.optimisation` — trois curseurs à losanges cyan).
- **Fonction** : déclenche le calcul de l'optimiseur de build global. État « en cours » géré par l'appli (bouton désactivé + libellé aria « Calcul en cours… »), pas par l'image.
- **Emplacement** : page dédiée Optimiseur (ouverte par « ⚙️ Optimiser le build » de Mon Build) — `src/components/PageOptimiseur.tsx` ligne ~312 (`data-bouton-lancer=""`). Web + installable.
- **Affichage prévu** : `2.5rem`.

## 4. Bouton « Calculer les meilleures combinaisons » (optimiseur d'armures, Forge)

- **Id** : `actions.calculer-combinaisons` · **fichier** : `assets/actions/bouton-calculer-combinaisons.svg`
- **Label** : « Calculer les meilleures combinaisons » (casse mixte ; longue étiquette OK — `bouton-forge-mods-armure.svg` fait déjà 7108 de large)
- **Cadre** : `0 0 <L> 1024`.
- **Logo dans le cercle** : `assets/icones/icone-optimisation.svg` (même logo que le n°3 ; les deux boutons peuvent d'ailleurs partager un seul asset si préféré).
- **Fonction** : lance le calcul des meilleures combinaisons d'armures (coffre + personnages).
- **Emplacement** : Forge → Inventaire → Optimisation — `src/components/OptimiseurArmures.tsx` ligne ~159 (`data-calculer=""`).
- **Affichage prévu** : `2.5rem`.

## 5. Onglet vertical du tiroir « Loadouts » (bord droit)

- **Id** : `selecteur.tiroir-loadouts` · **famille** : `selecteur` · **états** : `repos` obligatoire ; `selectionne` optionnel (l'onglet est masqué quand le tiroir est ouvert, donc le survol CSS suffit)
- **Fichier** : `assets/selecteur/bouton-tiroir-loadouts.svg` (+ `-selectionne.svg` si fourni)
- **Label** : « LOAD-OUTS » en capitales de 180, comme les boutons du sélecteur (« A » sans barre, dernier « O » orné — 3 sous-chemins)
- **Cadre proposé** : `viewBox="0 0 1024 4316"` — le bouton horizontal du sélecteur (4316×1024) **transposé** (plaque verticale, texte pivoté de 90°). À valider par l'auteur ; alternative : garder un cadre horizontal affiché en `writing-mode` (mais le texte serait en police, interdit par la charte).
- **Logo** : coffre de `assets/icones/icone-loadouts.svg` (`icones.loadouts`), pivoté lui aussi.
- **Cristaux** : transposer ceux du sélecteur (haut/bas du cadre horizontal → gauche/droite du cadre vertical).
- **Fonction** : ouvre le tiroir latéral droit des Load-outs. Le compteur dynamique « (N) » **reste en texte HTML à côté de la plaque** (le texte de l'image est en tracés, donc fixe).
- **Emplacement** : `src/components/PanneauLoadouts.tsx` (~ligne 343, repère « ⚠️ À BRANCHER » posé), `position: fixed; right: 0; top: 40%`. Affiché uniquement dans la vue Build Analyzer. Web + installable.
- **Affichage prévu** : largeur 40 px (hauteurMinPx 40), longueur ≈ 169 px (ratio 4316/1024).

## 6. Onglet vertical du tiroir « Solo sans mourir » (bord gauche)

- **Id** : `selecteur.tiroir-solo` · **fichier** : `assets/selecteur/bouton-tiroir-solo.svg` (+ `-selectionne.svg` optionnel)
- **Label** : « SOLO » (capitales 180). Référence de dessin : `ressources-installateur/forge-armory/forge-0.4.0/panneaux/titre-solo-sans-mourir.svg` (écu à herse + fenêtre cyan) et le crâne de `src/components/IconeCrane.tsx`.
- **Cadre proposé** : `viewBox="0 0 1024 4316"` (transposé), cristaux transposés.
- **Fonction** : ouvre le tiroir latéral gauche « Solo sans mourir » (vitrine des 11 donjons solo flawless). Compteur « (x/11) » en texte HTML à côté, comme le n°5.
- **Emplacement** : `src/components/PanneauTriomphes.tsx` (~ligne 48, repère « ⚠️ À BRANCHER » posé), `position: fixed; left: 0; top: 40%`, vue Build Analyzer uniquement.
- **Affichage prévu** : largeur 40 px.

---

## Règles de la charte à respecter pour TOUS les fichiers (rappel)

1. **Cadre de 1024 de haut** pour les familles horizontales (`actions`, `selecteur`, `profils`…) : `viewBox="0 0 <largeur> 1024"` ; le proposed vertical (n°5/6) est l'exception transposée `1024 × 4316`.
2. **Cercle et plaque identiques** à ceux des boutons existants : cercle r=436 trait 22 centré à mi-hauteur ; plaque 524 de haut, biseau 82, bordure 11. À hauteur CSS égale, tous les boutons ont la même taille de cercle/plaque. Ne jamais fixer largeur ET hauteur à l'affichage (`height` seule, `width: auto`).
3. **Texte en tracés uniquement** : aucun élément `<text>`, aucune police (`font-family`), aucun script, aucun lien externe (`href="http…"`, `xlink:href`), aucune image embarquée (`<image>`). Le test `tests/logique/visuels.test.ts` le vérifie.
4. **Identifiants internes uniques et préfixés** : `fa-<dossier>-<nom-fichier>-…` (ex. `fa-actions-bouton-connexion-bungie-…`), uniques d'un fichier à l'autre. Chaque SVG a un `<title id="fa-…-t">` descriptif.
5. **Changement d'état = changement de fichier**, et les deux fichiers d'un même bouton ont **exactement le même cadre** (rien ne bouge à l'écran) ; le halo/lueur de l'état « sélectionné » reste DANS le cadre.
6. **Logo + plaque + titre = un seul élément** (un seul bouton), jamais séparés.
7. Lettrage : boutons du sélecteur en **capitales 180**, boutons d'action en **casse mixte, capitales 200** ; « A » sans barre ; **dernier « O » du titre orné** (losange dans le jambage = 3 sous-chemins au lieu de 2).
8. Hauteur minimale conseillée à l'affichage : **40 px** (boutons et titres), 24 px (icônes seules). En dessous, utiliser l'icône seule.
9. `role="img"` + `aria-labelledby` pointant sur le `<title>` ; le texte étant en tracés, l'appli fournit `alt`/`aria-label` = label.

## Livraison attendue

- Les fichiers SVG dans l'arborescence ci-dessus, **plus** leur entrée dans le catalogue : id, famille, `label`, `etat`, `fichier`, `largeur`, `hauteur`, `ratio`, `hauteurMinPx` (40), `format: "svg"` — soit dans `manifest.json`/`forgeAssets.ts` de l'archive, soit en complément.
- Les livrer dans l'archive de référence `ressources-installateur/forge-armory/app-assets/assets/` (le test `reproductibilite-visuels.test.ts` reconstruit `public/assets/` octet pour octet depuis cette archive : tout fichier de `public/assets/` doit en provenir).
- Optionnel : l'icône seule 1024×1024 (`icones.<nom>`) si le bouton doit aussi exister en version icône seule.

## Intégration côté appli (après livraison — branche `draft-boutons-manquants`)

1. Copier les fichiers dans `public/assets/…` + déclarer les ids (catalogue ou complément).
2. `actions.*` : ajouter l'id au type `IdBoutonAction` (`src/components/BoutonAction.tsx`).
3. Remplacer chaque repère « ⚠️ À BRANCHER » par le `BoutonAction` (libellés aria et `data-*` déjà notés ci-dessus).
4. Vérifier : `npx tsc -b`, `npm run test:logique` (dont `visuels.test.ts` et `reproductibilite-visuels.test.ts`), `npm run build`.
