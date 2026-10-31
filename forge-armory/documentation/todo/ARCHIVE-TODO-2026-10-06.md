# Archive de la TODO — passages retirés ou condensés le 06/10/2026

Nettoyage de la TODO demandé par l'utilisateur le 06/10/2026. Les passages ci-dessous sont recopiés **mot pour mot** (extraits automatiquement du fichier, sans retranscription) avant d'être retirés, condensés ou remplacés dans `TODO.md`. Raisons : un ordre de marche dépassé, des sections marquées « en test » alors que l'utilisateur les a validées (Electron : tests renvoyés le 02/10/2026 ; renommage : tests du logiciel installé le 06/10/2026), un détail terminé qui vit désormais dans `DEVLOG.md`, et un point d'« abandon » devenu faux (icônes des perks d'artefact). Les règles permanentes (identifiants à ne jamais renommer, dossier de données) sont conservées dans `TODO.md`.


---

## En-tête et ordre de marche du 30/09/2026 (début du fichier)

```text
# TODO — D2 Build Analyzer

Priorités :
- 🔴 **Bloquant** — fausse le résultat ou empêche d'avancer
- 🟡 **Important** — limite la valeur de l'appli
- 🔵 **Confort / plus tard**

Ce fichier ne liste que ce qui **reste à faire**. Ce qui est terminé est
décrit dans `DEVLOG.md` (avec les explications de chaque changement) ;
l'état complet de la TODO avant son tri du 30/09/2026 est conservé mot pour
mot dans `documentation/todo/ARCHIVE-TODO-2026-09-30.md`. Conception du
scoring : section « Le scoring » du `README.md`. Tests en cours :
`A-TESTER.pdf`.

---

## 🧭 Prochaines étapes — ordre de marche du 30/09/2026

Fixé par l'utilisateur le 30/09/2026 :

1. ✅ **v0.2.9 testée et validée le 30/09/2026** (reste un test : Aspects
   et Fragments sur trois colonnes dans l'export, voir `A-TESTER.pdf`).
2. **Mettre Electron à niveau** — ✅ fait le 30/09/2026 (v0.3.0), en test
   (correctifs « Équiper » et expiration de session faits ensuite, même
   version).
   Restent ensuite, une par une : Vite, React Router, puis la politique de
   sécurité (CSP) (section 1).
3. **Modifier les perks et les mods**, en reprenant au passage les
   fenêtres de détails des armes et armures (section 2).

⏸️ **En attente d'une décision** : l'agent IA (section 3).

**Menés dans d'autres conversations** (leur état à jour vit là-bas) :
moteur de dégâts ; export DIM (repris le 28/09/2026, voir section 15) ;
fiches de patch notes (section 10) ; Bibliothèque (section 11) ; dépôt
GitHub.

---
```

---

## § 1. Suites de l'audit externe du 26/09/2026 (section entière)

```text
### 1. Suites de l'audit externe du 26/09/2026

- ✅ **Electron mis à niveau le 30/09/2026 (v0.3.0), en test** : de 32 à
  44.5.1, et `electron-builder` de 25 à 26.15.3 (seuls changements de
  cette étape). Changements incompatibles des versions 33 à 44 passés en
  revue un par un contre le code : aucun ne concerne le logiciel (détail
  dans `DEVLOG.md`). Restent, en étapes SÉPARÉES :
  - **Vite / esbuild** (vulnérabilité modérée, serveur de développement
    seulement) : `vite` 5 → une version corrigée (l'audit propose 8.x,
    changement majeur à préparer, avec `@vitejs/plugin-react`) ;
  - **React Router** (vulnérabilité modérée ; redirections ouvertes et
    rendu côté serveur, cas non utilisés par l'appli) : `react-router-dom`
    6 → 7, changement majeur à préparer.
  Résultat de `npm.cmd audit` après la v0.3.0 (30/09/2026) : **4
  vulnérabilités au lieu de 18**, uniquement ces deux-là (le total en
  compte une « élevée », sans préciser laquelle ; les deux blocs du
  rapport affichent « modérée »).
- **Ajouter une politique de sécurité de contenu (CSP)**, à écrire puis
  tester pas à pas : une CSP trop stricte casse silencieusement les appels
  Bungie, le WebAssembly de sql.js ou les images distantes.
- ✅ **`npm.cmd ci` validé le 30/09/2026** (479 paquets installés à
  l'identique depuis `package-lock.json`). Sous PowerShell, utiliser
  `npm.cmd` : la commande `npm` seule est bloquée par la politique
  d'exécution des scripts de Windows. Ce qu'il a révélé, à traiter avec la
  mise à niveau d'Electron :
  - **18 vulnérabilités signalées** (3 modérées, 14 élevées, 1 critique),
    détail obtenu le 30/09/2026 avec `npm.cmd audit` : Electron 32 (dans
    le logiciel), `electron-builder` et `tar`/`extract-zip`/`node-gyp`
    (fabrication seulement, dont la critique), `vite`/`esbuild` (serveur de
    développement), `react-router` (modérée). Electron et electron-builder
    traités dans la v0.3.0 ; Vite et React Router restent (voir plus
    haut). Ne PAS lancer `npm audit fix --force` ;
  - **paquets obsolètes** signalés (`inflight`, `rimraf`, `glob`, `tar`,
    `npmlog`…) : ce sont des dépendances des outils (surtout
    `electron-builder`), pas de l'appli elle-même ; ils disparaîtront pour
    l'essentiel avec la mise à niveau de ces outils ;
  - **avertissement `allow-scripts`** : npm signale que les scripts
    d'installation d'`electron` (téléchargement du moteur) et d'`esbuild`
    ne sont pas encore approuvés. Si le logiciel se lance et se fabrique
    normalement, ils ont bien tourné ; sinon, les approuver avec
    `npm.cmd approve-scripts electron esbuild` (commande proposée par
    npm lui-même), uniquement ces deux paquets officiels.
```

---

## § 2. Modifier les perks et mods : paragraphe d'introduction

```text
🟡 **Indispensable à terme, pas bloquant aujourd'hui.** Demande de
l'utilisateur du 28/09/2026. Prévu APRÈS la mise à niveau d'Electron
(ordre de marche du 30/09/2026).
```

---

## § 12. Renommage « Forge Armory » (section entière)

```text
### 12. Renommage « Forge Armory » : fait le 05/10/2026 (en test)

✅ Décision de l'utilisateur du 05/10/2026 : **Forge Armory** est le nom officiel ; **Destiny 2 Build Analyzer**
devient son sous-titre. Fait, en version 0.3.0 (en test) :
- installateur : `productName`, `shortcutName` (raccourci) et `artifactName` (`Forge-Armory-Setup-<version>.exe`) ;
- titre de la fenêtre (`main.cjs`) et de la page (`index.html`) : « Forge Armory — Destiny 2 Build Analyzer » ;
  pied de page de l'appli ; en-tête et pied de page de l'export des fiches ; dernière ligne de la copie en texte ;
  en-tête du rapport de l'outil de contrôle des exotiques ;
- documentation : `README.md`, les deux `GUIDE-DEMARRAGE`, outil de la liste de tests ; l'en-tête de l'appli (emblème,
  « Forge Armory », sous-titre) était déjà en place depuis le 01/10/2026.

⚠️ **À NE JAMAIS renommer (identifiants internes)** : sinon l'utilisateur croirait avoir perdu ses données.
- clés de stockage `d2-build-analyzer.loadouts.v1` (builds), `d2-build-analyzer.ponderations.v1`, `d2ba.bungie.tokens`
  (session Bungie), base `d2-build-analyzer` du cache du Manifest, identifiant DIM `d2-build-analyzer-…` ;
- `appId` (`com.orynick.d2buildanalyzer`) : Windows y verrait une AUTRE application, installée à côté de l'ancienne au
  lieu de la remplacer ; `name` de `package.json` (`d2-build-analyzer`) ; schéma interne `app://local` et adresse de
  retour Bungie `https://127.0.0.1:5173/auth/callback` (aucune clé OAuth à changer) ;
- (le nom du dossier du projet et du zip n'en fait PAS partie : libre, renommé en `forge-armory` le 05/10/2026 ; une première version de cette section l'avait rangé ici à tort.)

⚠️ **Dossier de données** : Electron range les builds, pondérations, cache du Manifest et session dans un dossier de
`%APPDATA%` dont le nom dépend du nom de l'application. **On ne savait pas lequel** des deux noms possibles
(`d2-build-analyzer` ou `D2 Build Analyzer`) servait sur le poste de l'utilisateur : rien dans le projet ne l'avait
relevé (l'hypothèse de l'ancienne version de cette section, « le `productName` », n'était pas vérifiée). Au démarrage,
`electron/dossierDonnees.cjs` REGARDE lequel existe et contient des données, et `main.cjs` dit à Electron de continuer à
l'utiliser (`userData` et `sessionData`), avant que l'application soit prête. Rien n'est déplacé, copié ni supprimé.
Plusieurs dossiers habités : le plus récemment utilisé ; aucun : `d2-build-analyzer` (installation neuve, nom stable).
**À vérifier sur une installation réelle** avec des builds enregistrés (test en tête de `A-TESTER.pdf`), et toujours avec
un « ⬇ Exporter tout » de sécurité. Si les builds semblaient absents : ne rien supprimer, ils sont dans l'ancien dossier.

À faire / à décider :
- **par l'utilisateur** : renommer l'application sur le portail développeur de Bungie (facultatif ; SANS en créer une
  nouvelle, elle aurait de nouvelles clés) ; futur dépôt GitHub ; noms des zips et des dossiers de version ;
- **numéro de version** de la mise en service du renommage (06/10/2026 : 0.3.1 ; le comptage reprend « comme avant » : une version par livraison) ;
- **mise à jour par-dessus** : Windows réutilise le dossier d'installation de l'ancienne version (cosmétique : il peut
  encore s'appeler « D2 Build Analyzer »), et l'épingle de la barre des tâches est à refaire ;
- **sélecteur « Build Analyzer / Bibliothèque »** : libellés inchangés (la forme « Forge Armory - Build Analyzer »
  envisagée le 29/09 n'a pas été retenue) ;
- **après validation de l'essai de l'identité visuelle** : retirer l'ancien logo de `src/` (composants
  `IconeCryptarque` et `IconeFantome`, inutilisés) ou le garder en archive seulement ; réglage du filigrane si besoin :
  `OPACITE_FILIGRANE` (`src/data/emblemeForgeArmory.ts`), `LARGEUR_FILIGRANE` (`exportFiche.ts`) et la largeur de
  `<Filigrane />` (`FicheBuild.tsx`). Détail : `ressources-installateur/forge-armory/LISEZ-MOI.md`.
```

---

## § 13 ter. Premier point : boutons d'élément de la Doctrine

```text
- ⚠️ **Boutons d'élément de la Doctrine : sur UNE ligne, en cours** (05/10 → 06/10/2026) : même taille pour les six (fait) ; une ligne dans mes mesures dès ~790 px (coche en coin, écart réduit : fait le 05/10), mais
  **l'utilisateur les voit toujours sur deux lignes** (06/10). Réponse du 06/10 : trois niveaux de compacité (texte, marges, icône), le moins compact qui tient étant retenu ; ligne grise `[dev]` qui donne la place disponible
  mesurée. **À faire** : récupérer cette ligne chez l'utilisateur ; si malgré tout deux lignes, c'est la place disponible (conteneur plus étroit que prévu) qu'il faut comprendre.
```

---

## § 19. Premier paragraphe (objets factices)

```text
✅ **Élucidé (06/10/2026)** : la catégorie **3109687656** est celle des objets **factices** (`itemType` 20, « Dummy ») : 35 des 66 « autres définitions » de même nom que des armes de la liste de l'utilisateur ; « Le Lapin de Jade » en a 11, « Lance de Polaris » 7 (la seconde copie possédée en est une), « Dualité » 1, plus des « Colis ». Elles imitent une arme (emplacement, type affiché, exotique, équipable). **Fait** : Recherche : catégorie « factice » masquée par défaut (validé par l'utilisateur pour Lapin de Jade, Dualité et Polaris) ; anti-champion : la liste s'applique à une copie factice en emplacement d'arme ; type d'arme d'une copie possédée : repli par sous-type puis par un exemplaire de même nom ; dédoublonnage : emplacement, puis exotique, puis non factice ; diagnostic : ligne `[dev]` et rapport des exotiques avec les « autres définitions ».
```

---

## § 21. Police personnalisée (section entière)

```text
### 21. Police personnalisée « D2 Build Analyzer Vector » (reçue le 06/10/2026) — ABANDONNÉE pour le moment

**Décision de l'utilisateur (06/10/2026)** : « laisse tomber » : cette police est standard (dérivée de Lato) ; il voulait une police **inspirée par le titre « Forge Armory » du logo**. Ne pas y revenir sans demande. Constats conservés ci-dessous au cas où.

L'utilisateur a envoyé `D2-Build-Analyzer-Vector-Font.zip` (README, `D2-Build-Analyzer-Vector.ttf` de 636 Ko, `OFL-LICENSE.txt`, 95 SVG) et demandé d'afficher tous ses caractères : **spécimen PDF de 38 pages produit** (livré dans la conversation, hors du projet).
**Constats** : « D2 Build Analyzer Vector Medium », dérivée de Lato Medium 2.015 (licence SIL OFL 1.1 ; le nom ne contient pas « Lato », la mention du nom réservé reste dans les métadonnées) ; 3 023 glyphes dont 2 164 caractères (latin, grec, cyrillique, API, flèches, nombres cerclés…), 867 glyphes
sans code Unicode (variantes, ligatures), 19 glyphes vides ; fonctionnalités OpenType : liga, calt, case, frac, lnum/onum, tnum/pnum, ss01 à ss04, sups/subs…, crénage (GPOS `kern`) ; le README décrit seulement l'ASCII (95 caractères) et annonce des avances élargies (« espacement aéré »).
**Manques pour l'appli** : sur les 69 caractères spéciaux de l'interface, 47 n'existent pas dans cette police (✓ ✕ ◆ ▲ ▼ ★ ⚠ ⬇ ⬆ ✅ ❌ ∅ ℹ et tous les emoji) ; ils retomberaient sur la police du système, donc la liste de polices de repli devra les prévoir. Les accents français, « », ’, —, … et € y sont.
**À décider avec l'utilisateur** : où l'employer (titre « DESTINY 2 BUILD ANALYZER » de l'en-tête, exports image et PDF, tout le texte de l'interface ?). Si intégrée : copier le TTF et la licence dans le projet, déclarer `@font-face`, fournir la police aux exports (image/PDF fabriqués par Electron) et ajouter `OFL-LICENSE.txt` à l'installateur.
```

---

## « Pistes abandonnées » : premier point (icônes des 21 perks)

```text
- **Icônes des 21 perks par artefact** — abandonné (26/08) : la table lue
  par l'extraction (`DestinyArtifactDefinition`) ne décrit que l'ancien
  système d'artefact ; pas de piste tant que Bungie ne l'aura pas mise à
  jour.
```
