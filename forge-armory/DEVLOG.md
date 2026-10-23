# DEVLOG — Forge Armory

> **Historique complet du développement.** Depuis la v0.5.1, le `CHANGELOG.md` est réservé aux utilisateurs (changements visibles) ; ce fichier conserve l'historique détaillé de chaque livraison, décision et correctif.

---

## 23/10/2026 — v0.5.2 : LIVRAISON FINALE DU CHANTIER « ACCOMPLISSEMENTS » (TODO n°23, branche `draft-update-triomphes`)

**Validation de l'utilisateur** : « C'est validé pour moi. Chantier complet. » — après test en `npm run dev` de la page Accomplissements en cartes.

**Contenu de cette livraison** (sur `draft-update-triomphes`, resynchronisée sur `main` après le merge de la PR #17) :
- **Présentation en CARTES** (`src/components/VueAccomplissements.tsx`) : grille CSS (`display: grid`, `repeat(auto-fill, minmax(10rem, 1fr))`) — plusieurs sceaux par ligne, hauteur verticale divisée. Chaque carte : icône (32 px) + nom + titre centrés (bouton cliquable), **barre de progression EN-DESSOUS** (pleine largeur), **pourcentage EN-DESSOUS** (ex. « 50 % »). Le clic **déplie les triomphes DANS la carte** (panneau sous la barre, défilable `max-height: 16rem`).
- **Tests** : `tests/ui/vue-accomplissements.py` mis à jour (nouveaux contrôles navigateur : grille `display:grid` + cartes sur la même ligne, barre sous le bouton, « 50 % » sous la barre, panneau des triomphes DANS la carte sous la barre).

**Documentation** : DEVLOG (cette entrée + l'entrée « cartes » précédente), CHANGELOG (v0.5.2), TODO.md (item 23 LIVRÉ VALIDÉ, retiré de la liste), NOTICE.md (section Accomplissements : cartes en grille), README.md (ligne Accomplissements).

**Vérifié** : `npx tsc -b` 0 erreur, `npm run build` ✓, `npm run test:logique` **37/37 suites, 747/747 contrôles** ✓, pages UI construites ✓, `ast.parse` OK. CI verte sur la branche.

**Livraison** : merge `draft-update-triomphes` → `main`, tag `v0.5.2`, propagation aux branches de chantier, suppression de la branche.

**Version : 0.5.1 → 0.5.2.**

---

## 23/10/2026 — PAGE « ACCOMPLISSEMENTS » : les sceaux en CARTES (grille), barre sous la carte, pourcentage en dessous (TODO n°23)

**Demande de l'utilisateur (23/10/2026, après validation du correctif « Aucun sceau trouvé »)** : « Affiche les cartes des Sceaux et met la barre de progression en-dessous, le pourcentage de complétion sous la barre. Objectif : afficher plus de Sceaux sur une ligne, et gagner de la place verticalement. »

**Changement** (`src/components/VueAccomplissements.tsx`) :
- Les sceaux s'affichent désormais en **CARTES dans une GRILLE CSS** (`display: grid`, `repeat(auto-fill, minmax(10rem, 1fr))`) : plusieurs sceaux par ligne, hauteur verticale divisée.
- Chaque carte : **icône (32 px) + nom + titre du sceau centrés** (bouton cliquable, `aria-expanded`), puis **barre de progression EN-DESSOUS de la carte** (pleine largeur), puis **pourcentage EN-DESSOUS de la barre** (ex. « 50 % »).
- Le clic sur une carte **déplie les triomphes DANS la carte** (panneau sous la barre, défilable `max-height: 16rem`) : la carte grandit verticalement au lieu d'empiler des sections pleine largeur.
- Inchangés : compteur global, recherche avancée (`""`, `+`, `-`, casse « Aa »), tri progression/nom, replis (sans profil / sans Manifest / aucun sceau / aucune correspondance), pas de vitrine « Solo sans mourir ».

**Tests** : `tests/ui/vue-accomplissements.py` mis à jour (nouveaux contrôles navigateur : grille `display:grid` + cartes sur la même ligne, barre sous le bouton, « 50 % » sous la barre, panneau des triomphes DANS la carte sous la barre). `npx tsc -b` 0 erreur, `npm run build` ✓, `npm run test:logique` **37/37 suites, 747/747 contrôles** ✓, pages UI construites ✓. **À valider en `npm run dev`.**

**Branche `draft-update-triomphes`** : resynchronisée sur `main` (la PR #17 ayant été mergée entre-temps, la branche ne contenait plus que ce changement par rapport à main ; elle reste ouverte en attendant le retour des tests utilisateur).

**Version inchangée (0.5.1).**

---

## 23/10/2026 — PROPAGATION : PR #17 (TODO n°23, page Accomplissements) répertutée sur les branches de chantier

**Propagation** : la livraison TODO n°23 (PR #17, page « Accomplissements » — Triomphes du compte par sceau) a été répertutée sur les 6 branches de chantier actives : `draft-armure-score`, `draft-legendarium`, `draft-netlify`, `draft-optimiseur`, `draft-sec`, `test`. Merge propre sans conflit sur les 6 branches.

**Branche supprimée** : `draft-update-triomphes` (livrée).

**Version inchangée (0.5.1).**

---

## 23/10/2026 — LIVRAISON TODO n°23 : page « Accomplissements » — Triomphes du compte par sceau (PR #17)

**Demande de l'utilisateur** : la page « Accomplissements » affichait un placeholder « 🚧 Bientôt ». Livraison de l'affichage complet des Triomphes du compte — obtenus et à obtenir — groupés **par sceau** (hiérarchie Collections→Sceaux du jeu).

**Fait** :
- **Nouveau modèle** `src/lib/bungie/sceaux.ts` (358 lignes, lecture seule) :
  - `regrouperParSceau(db, profil)` — croise l'arbre « Triumphs » du Manifest (nœuds avec `completionRecordHash` = sceaux) avec l'état des records du profil (composant 900, `profileRecords`). Portée PROFIL uniquement (scope compte). Triomphes absents = « à obtenir » (jamais masqués, jamais estimés).
  - `compteursGlobaux` — « X / Y triomphes obtenus · score total » (somme des `ScoreValue` des triomphes obtenus).
  - `filtrerSceaux` — **recherche avancée** (réutilise `parserRecherche`/`correspondRecherche` du Legendarium) : guillemets `"phrase exacte"`/`« »`, `+obligatoire`, `-exclu`, case « Respecter la casse » (insensible par défaut). Porte sur nom + description des triomphes + nom du sceau.
  - `trierSceaux` — par **progression** (défaut) ou par **nom**.
- **Page** `VueAccomplissements.tsx` réécrite (+168 lignes) — props `{ profil, db }` câblées dans `DashboardPage` : compteur global en tête, recherche + case « Aa » + sélecteur de tri, **sceaux repliés par défaut** (comme le Legendarium) avec icône, barre de progression « X/Y (N %) » et titre du sceau (« débloqué » à 100 %) ; chaque triomphe : icône, nom, description, progression des objectifs (« 3 / 10 »), badge ✅/⬜, points.
- **Correction** (retour utilisateur « Aucun sceau trouvé ») : dans le Manifest actuel, les nœuds sceaux ne sont PAS sous la racine « Triumphs » (1163735237) mais sous une racine séparée « Sceaux/Titres ». La racine est lue **dans le profil** (`recordSealsRootNodeHash`, champ officiel du composant 900 — comme DIM), secours par constantes (1652422747 « Seals », 616318467 « Titles », 1163735237), puis **scan global** hors Collections/Lore/Metrics/Patterns en dernier recours.
- **Types Manifest complétés** : `completionRecordHash`/`objectiveHash` sur les nœuds ; `scope`/`objectiveHashes`/`completionInfo.ScoreValue`/`titleInfo` sur les records.
- La vitrine « Solo sans mourir » reste **uniquement** dans le tiroir du Build Analyzer (`PanneauTriomphes`).

**Tests** :
- `tests/logique/sceaux.test.ts` (nouveau, **31/31 contrôles**)
- `tests/logique/cablage-forge.test.ts` mis à jour
- `tests/ui/vue-accomplissements.py` (nouveau : compteur global, sceaux repliés, recherche avancée, casse, tri, replis `?sans-profil=1`/`?sans-db=1`)
- `tests/ui/entree-vue-accomplissements.tsx` (nouveau)
- `tests/ui/vue-carriere.py` + `entree-vue-carriere.tsx` mis à jour
- **Batterie CI** : **37/37 suites, 740/740 contrôles** ✓ (local : 36/37, 746/747 — le test `icones.test.tsx` est connu, passe en CI)
- `tsc -b` : 0 erreur ✓ · `npm run build` strict : ✓

**À valider en `npm run dev`** (bac à sable : pas de navigateur ni d'API Bungie) : page Accomplissements — compteur global, sceaux repliés/dépliés, recherche avancée, tri progression/nom, triomphes obtenus (✅) et à obtenir (⬜).

**Branche `draft-update-triomphes` supprimée** après merge. TODO n°23 marqué LIVRÉ.

**Version inchangée (0.5.1).**

---

## 23/10/2026 — PROPAGATION : PR #18 (renommage CHANGELOG → DEVLOG) répertutée sur les branches de chantier

**Propagation** : le renommage `CHANGELOG.md` → `DEVLOG.md` (PR #18) a été répertuté sur les 7 branches de chantier actives : `draft-armure-score`, `draft-legendarium`, `draft-netlify`, `draft-optimiseur`, `draft-sec`, `draft-update-triomphes`, `test`.

**Conflits résolus** : `CHANGELOG.md` en conflit (rename/delete côté main vs modify côté branche) sur 3 branches (`draft-armure-score`, `draft-netlify`, `draft-update-triomphes`) — résolu en supprimant `CHANGELOG.md` et transférant les entrées spécifiques à la branche dans `DEVLOG.md`. Les 4 autres branches : merge propre.

**Version inchangée (0.5.1).**

---

## 23/10/2026 — RENOMMAGE : `CHANGELOG.md` → `DEVLOG.md`

**Demande de l'utilisateur** : le fichier `CHANGELOG.md` devient `DEVLOG.md` pour garder l'historique du développement. Un nouveau `CHANGELOG.md` minimal est créé pour les utilisateurs (changements visibles uniquement).

**Fait** :
- `git mv CHANGELOG.md DEVLOG.md` (historique préservé dans git)
- Nouveau `CHANGELOG.md` créé : changelog orienté utilisateur (v0.5.1, v0.5.0, lien vers DEVLOG)
- **25 fichiers mis à jour** — toutes les mentions de `CHANGELOG` remplacées par `DEVLOG` :
  - Code source (9 fichiers) : `elementVerbs.ts`, `triomphesSoloFlawless.ts`, `diagnosticsArchives.ts`, `pillars.ts`, `doctrine.ts`, `IconeLoadout.tsx`, `IconeSlotArmure.tsx`, `SelecteurArtefact.tsx`, `telecharger-manifest.mjs`
  - Documentation (7 fichiers) : `README.md`, `TODO.md`, `LISEZ-MOI.md`, archives TODO/tests/audit, `GITIGNORE-A-AJOUTER.txt`
  - Knowledge-base (5 fichiers) : `00_INDEX.md` + 4 fichiers artefacts
  - Config : `.gitignore`, `.github/workflows/ci.yml`
- En-tête ajouté en haut de `DEVLOG.md` expliquant la séparation CHANGELOG (utilisateurs) / DEVLOG (développement)

**Règle à suivre** :
- **`CHANGELOG.md`** = changements visibles par les utilisateurs (nouvelles fonctionnalités, correctifs majeurs)
- **`DEVLOG.md`** = historique complet du développement (décisions, détails techniques, propagations, nettoyages)

---

## 23/10/2026 — PROPAGATION : v0.5.1 (PR #16) répertutée sur les branches de chantier

**Propagation** : le passage en v0.5.1 (PR #16) a été répertuté sur les 7 branches de chantier actives pour limiter les conflits futurs : `draft-armure-score`, `draft-legendarium`, `draft-netlify`, `draft-optimiseur`, `draft-sec`, `draft-update-triomphes`, `test`.

**Note** : les branches `draft-deps` et `draft-update-carriere` ont été supprimées après livraison. Tag `v0.5.1` créé. Nouvelle branche `draft-optimiseur` détectée (chantier en cours).

**Version inchangée (0.5.1).**

---

## 23/10/2026 — v0.5.1 : LIVRAISON COMPLÈTE — Legendarium opérationnel + pages Carrière/Accomplissements + stack à jour

**Passage en version 0.5.1** — consolidation de toutes les livraisons depuis la 0.5.0 (Legendarium, 22/10/2026).

**Pourquoi 0.5.1 ?** La 0.5.0 marquait la livraison du Legendarium (chantier majeur). Depuis, trois livraisons significatives ont été mergées sur `main` :
1. **Pages « Carrière » et « Accomplissements »** (PR #14, TODO §25) — deux nouvelles pages dédiées : temps de jeu (total + par classe) et **74 statistiques de compte traduites en français**, Accomplissements en placeholder « Bientôt » (suite sur `draft-update-triomphes`).
2. **Chantier dépendances terminé** (`draft-deps`, PR #7) — Vite 5→7, React 18→19, React Router 6→7, Electron 44→45, TypeScript 5.9. **0 vulnérabilité npm** (contre 4 avant).
3. **Mise à jour documentation** (PR #15) — README + NOTICE à jour (Legendarium livré, Forge fonctionnel).

**État du Legendarium (vérifié sur `main`)** : bibliothèque de Lore complète et opérationnelle —
- 4 sections : Grimoire D1 (6 livres / 834 cartes, hors-ligne), Légendes D2 (108 livres / 1 076 pages), armes et armures, cosmétiques
- Recherche avancée (guillemets, `+`, `-`, case « Aa »)
- Parcours inverse page → objets porteurs, lien profond fiche ↔ Legendarium avec retour
- Export infographique PNG (filigrane centré, crédit Bungie)
- 7 suites de tests : **277/277 contrôles** ✓

**État technique** :
- `tsc -b` : 0 erreur
- `npm run build` strict : ✓
- Batterie logique CI : **36/36 suites, 716/716 contrôles** ✓
- CI GitHub Actions : verte
- `npm audit` : **0 vulnérabilité** ✓

**Stack technique** : Vite 7.3.7 · React 19.2.9 · React Router 7.18.4 · Electron 45.0.0 · TypeScript 5.9.3

**Branches** : `draft-update-carriere` et `draft-deps` supprimées (livrées). Nouvelle branche active : `draft-update-triomphes` (suite Accomplissements, TODO §23).

**Fichiers modifiés** : `package.json`, `package-lock.json` (version 0.5.0 → 0.5.1), `CHANGELOG.md`, `TODO.md` (références version + item 1 audit externe marqué terminé).

---

## 23/10/2026 — DÉPENDANCES : CHANTIER `draft-deps` TERMINÉ (merge sur `main`)

Merge de la branche `draft-deps` (PR #7) sur `main` : mise à jour complète des dépendances majeures en 3 paliers + 1 palier intermédiaire.

**Palier 1 — Mises à jour patchs (sûr)** :
- `electron` 44.9.0 → **44.9.3**, `sql.js` 1.15.0 → **1.15.1**, `typescript` 5.5.4 → **5.9.3**

**Palier 2 — Vite 5 → 7** :
- `vite` 5.4.21 → **7.3.7**, `@vitejs/plugin-react` 4.7.0 → **5.2.0**, `vite-plugin-mkcert` 1.17.12 → **2.1.0**

**Palier 2bis — Electron 44 → 45 (sécurité)** :
- `electron` 44.9.3 → **45.0.0** (montée majeure pour la sécurité, exigée avant diffusion)

**Palier 3 — React 18 → 19 (majeur cassant)** :
- `react` + `react-dom` 18.3.1 → **19.3.1** (montés ensemble)
- `@types/react` + `@types/react-dom` → **19.3.0**
- `react-router-dom` 6.30.6 → **7.18.4** (compatible React >=18)

**Vérifications** : `npx tsc -b` OK, `npx vite build` OK (206 modules), **36/36 suites de tests, 708/708 contrôles réussis**, **0 vulnérabilité npm**.

**Note** : snapshot `icones.json` mis à jour (React 19 ajoute `<link rel="preload" as="image">` avant les `<img>` externes dans `renderToStaticMarkup` — comportement attendu, inchangé visuellement).

**Branche `draft-deps` supprimée** après merge. Le chantier est terminé.

---

## 23/10/2026 — PROPAGATION : PR #14 (TODO §25, pages « Carrière »/« Accomplissements ») répercutée sur les branches de chantier

**Propagation** : la PR #14 (merge sur `main`, livraison TODO §25 : pages « Carrière » et « Accomplissements » dédiées, ouvertes par les boutons du bloc Connexion) a été répercutée sur les 6 branches de chantier actives pour limiter les conflits futurs : `draft-armure-score`, `draft-deps`, `draft-legendarium`, `draft-netlify`, `draft-sec`, `test`.

**Conflits résolus** :
- `draft-deps`, `draft-netlify` : conflit `CHANGELOG.md` (entrées de la branche vs entrées du 23/10 de main) — résolu en gardant les entrées de la branche puis celles de main.
- `draft-armure-score`, `draft-legendarium`, `draft-sec`, `test` : merge direct sans conflit.

**Note** : sur `draft-deps`, le contrôle `icones.test.tsx` « element:officielle » échoue **déjà avant** la propagation (pré-existant sur cette branche, hors périmètre de ce merge) — à traiter sur cette branche.

**Branches** : `draft-update-carriere` est **supprimée** (livrée). La suite fonctionnelle (affichage des Triomphes dans « Accomplissements ») démarre sur la nouvelle branche **`draft-update-triomphes`** (nouvel item TODO n°23).

**Version inchangée (0.5.0).**

---

## 22/10/2026 — LIVRAISON TODO §25 (merge de `draft-update-carriere` sur `main`)

Merge de la branche `draft-update-carriere` (PR #14) sur `main` : pages « Carrière » et « Accomplissements » dédiées, toutes les stats traduites (74 statIds), temps de jeu corrigé, sections « Personnages »/« 10 dernières activités »/« Saison » supprimées — voir les entrées du 22/10/2026 ci-dessous.

---

## 22/10/2026 — PAGE « CARRIÈRE » : tous les libellés de stats traduits en français

**Demande de l'utilisateur (22/10/2026, note avant test)** : « Avant test, tout traduire. » — capture de la grille « Statistiques de carrière » : la plupart des stats avaient un libellé FR, mais **46 statIds s'affichaient en ANGLAIS BRUT** (`weaponKillsAutoRifle`, `efficiency`, `score`, `totalKillDistance`, `allParticipantsTimePlayed`, …).

**Changé** (`src/components/VueCarriere.tsx`) : la table `LIBELLES_STATS_CONNUS` est **complétée depuis la RÉPONSE RÉELLE du compte de l'utilisateur** (capture de la grille) — elle passe de 20 à **74 statIds** : les 46 statIds anglais restants ont leur libellé FR (vocabulaire du jeu en français) :
- **Éliminations par type d'arme** (18) : « Fusil automatique », « Arc », « Glaive », « Fusil à fusion », « Revolver », « Fusil de traçage », « Mitrailleuse », « Fusil à impulsion », « Lance-roquettes », « Fusil éclaireur », « Fusil à pompe », « Fusil de précision », « Pistolet-mitrailleur », « Relique », « Épée », « Grenade », « Lance-grenades » + « **Capacités (armes)** », « **Super (armes)** », « **Mêlée (armes)** » (suffixe « (armes) » pour les distinguer des stats globales « Capacités » / « Super » / « Mêlée »).
- **Distances** (5, unité précisée en mètres dans le libellé) : « Distance totale d'éliminations (m) », « Distance moyenne d'élimination (m) », « Distance d'élimination la plus longue (m) », « Distance totale de mort (m) », « Distance moyenne de mort (m) ».
- **Divers** : « Efficacité totale » (`efficiency` — distincte de « Efficacité » = `killsDeathsAssists` : vérifié sur les valeurs réelles 22,54 vs 20,81), « Score », « Score d'équipe (cumulé) », « Meilleures éliminations (une partie) », « Meilleur score (une partie) », « Meilleures précisions (une partie) », « Série d'éliminations la plus longue », « Score moyen par élimination », « Score moyen par vie », « Adversaires vaincus », « Orbes générés », « Orbes ramassés », « Activités gagnées », « Activités en groupe », « Événements publics terminés », « Événements publics héroïques terminés », « Aventures terminées », « Niveau de personnage le plus élevé », « Puissance la plus élevée », « Participants (total) », « Score cumulé des participants », « Completion la plus rapide (ms) » (millisecondes — volontairement **absente** de `STATS_EN_SECONDES` pour ne pas afficher « non disponible » sur un 0 ms valide), « Type d'arme préférée (code brut) » (`weaponBestType` = code, la correspondance code→nom n'est pas dans la réponse de l'API).
- **Durées** : `STATS_EN_SECONDES` étendu de 2 à **7** statIds (toutes en secondes) : + `totalActivityDurationSeconds` (« Durée totale des activités »), `allParticipantsTimePlayed` (« Temps cumulé des participants »), `longestSingleLife` (« Vie la plus longue »), `remainingTimeAfterQuitSeconds` (« Temps restant après abandon (cumulé) »), `averageLifespan` (« Durée de vie moyenne »).

**Règle inchangée** : une statId **inconnue** continue d'afficher son statId **brut** (jamais renommée à l'aveugle) — la règle du projet « jamais d'estimation » s'applique aussi aux libellés.

**Tests** :
- `tests/ui/entree-vue-carriere.tsx` — la fixture passe à **16 stats** (les 8 d'origine + 8 statIds RÉELS du compte : `weaponKillsHandCannon`, `efficiency`, `score`, `totalKillDistance`, `totalActivityDurationSeconds`, `averageLifespan`, `longestSingleLife`, `allParticipantsTimePlayed`).
- `tests/ui/vue-carriere.py` — le contrôle navigateur « TOUTES LES STATS » attend les **16 stats** avec leurs libellés FR (ex. « Revolver » → « 155 285 », « Efficacité totale » → « 22,54 », « Durée totale des activités » → « 4 031 h 08 », « Durée de vie moyenne » → « 4 min ») et le compte « 16 statistiques » ; le diagnostic attend « statIds retournés : 16 » et la structure « merged (allTime : 16 stats) ».
- Vérification croisée (script) : **les 66 statIds de la capture de l'utilisateur ont TOUS un libellé FR** (aucun manquant, aucun libellé identique au statId brut).
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites** ✓. Tests navigateur Playwright non exécutables dans le bac à sable (`libglib-2.0.so.0` absente) — **à valider en `npm run dev`**.

---

## 23/10/2026 — PROPAGATION : PR #13 (nettoyage TODO) + PR #15 (doc README/NOTICE) répercuteées sur les branches de chantier

**Propagation** : les deux PRs mergées sur `main` (PR #13 : nettoyage de la TODO section Confort ; PR #15 : mise à jour README + NOTICE après livraison Legendarium v0.5.0) ont été répertutées sur les 7 branches de chantier actives pour limiter les conflits futurs : `draft-armure-score`, `draft-deps`, `draft-legendarium`, `draft-netlify`, `draft-sec`, `draft-update-carriere`, `test`.

**Conflits résolus** :
- `draft-armure-score`, `draft-deps`, `draft-legendarium`, `draft-netlify`, `draft-sec` : conflit `README.md` (ligne Legendarium « en construction » vs nouvelle entrée) — résolu en gardant les lignes spécifiques à la branche + la nouvelle entrée Legendarium.
- `draft-update-carriere` : conflits `CHANGELOG.md` (entrée Carrière §25 + entrées main), `TODO.md` (item 23 résolu sur cette branche → retiré), `DashboardPage.tsx` et `cablage-forge.test.ts` (code spécifique Carrière conservé). Tests : **36/36 suites, 710/710 contrôles** ✓.
- `test` : merge direct sans conflit.

---

## 22/10/2026 — PAGE « CARRIÈRE » : suppression de l'affichage de la saison

**Demande de l'utilisateur (22/10/2026)** : « Finalement enlève l'affichage de la saison dans ce menu. »

**Changé** : la section « Saison » (« Saison en cours ») est **supprimée** de la page « Carrière ». La page ne comporte plus que **DEUX sections** : **Temps de jeu** (total + par classe) et **Statistiques de carrière** (toutes les stats de l'API).

**Fait** :
- **`src/components/VueCarriere.tsx`** (⚠️ CHANGÉ) — la section « Saison » est supprimée, ainsi que `saisonEnCours`/`libelleSaisonEnCours` et l'import `SAISONS` de `src/data/saisons.ts` (aucun code mort). La table `SAISONS` reste utilisée ailleurs dans l'appli (recherche Manifest, infobulles de saison).

**Tests** :
- `tests/ui/vue-carriere.py` — le contrôle navigateur des sections attend **DEUX** sections (« Temps de jeu », « Statistiques de carrière ») et l'**absence** de « saison » dans le texte ; le contrôle « Saison en cours » est supprimé ; **+1 contrôle source** : plus de `SAISONS`/`libelleSaisonEnCours`/`titre="Saison"` dans le code ; le contrôle « MÊME EN ÉCHEC » n'attend plus la saison.
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites** ✓. Tests navigateur Playwright non exécutables dans le bac à sable (`libglib-2.0.so.0` absente) — **à valider en `npm run dev`**.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — PAGE « CARRIÈRE » : suppression des sections « Personnages » (niveaux) et « 10 dernières activités »

**Demande de l'utilisateur (22/10/2026)** : « Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités. »

**Changé** : la page « Carrière » ne comporte plus que TROIS sections : **Temps de jeu** (total + par classe), **Saison** (« Saison en cours » — conservée, déplacée dans sa propre section) et **Statistiques de carrière** (toutes les stats de l'API). Les icônes de classes restent sur les lignes du temps de jeu par classe.

**Fait** :
- **`src/components/VueCarriere.tsx`** (⚠️ CHANGÉ) — sections « Personnages » (puissances) et « 10 dernières activités » supprimées ; la prop `personnages` est retirée (la page ne prend plus que `membership` et `profil`) ; « Saison en cours » reste, dans une section « Saison » dédiée.
- **`src/lib/bungie/carriere.ts`** (⚠️ CHANGÉ) — le chargement des historiques d'activités est supprimé avec la section qu'il alimentait : `recupererActivitesPersonnage`, l'interface `ActiviteRecente`, le champ `activites` de `DonneesCarriere` et `erreursActivites` du diagnostic. `chargerCarriere(membership, profil)` ne prend plus `personnages` : la page ne fait plus qu'**UNE SEULE requête réseau** à l'ouverture (`GetHistoricalStatsForAccount`) — les 10 requêtes `GetActivityHistory` par personnage (et leurs erreurs possibles) disparaissent. Le diagnostic n'a plus de ligne « historiques d'activités en échec ».
- **`src/pages/DashboardPage.tsx`** (⚠️ CHANGÉ) — montage `<VueCarriere membership={memberships[0] ?? null} profil={profilComplet} />` (plus de `personnages`).

**Tests** :
- `tests/logique/cablage-forge.test.ts` — le regex de montage attend `profil={profilComplet}` sans `personnages`.
- `tests/logique/diagnostic-carriere.test.ts` — le cas « historiques d'activités en échec » est remplacé par un **contrôle de suppression** : le diagnostic ne contient AUCUNE ligne « historiques d'activités ».
- `tests/ui/entree-vue-carriere.tsx` — plus de prop `personnages`, plus de handler `/Stats/Activities/` (une telle requête retombe en 404) ; `window.__requetes` enregistre les URL demandées.
- `tests/ui/vue-carriere.py` — +1 contrôle source (sections supprimées, prop retirée, `chargerCarriere(membership, profil)`, `recupererActivitesPersonnage` absent de `carriere.ts`) ; le contrôle des sections attend **TROIS** sections (« Temps de jeu », « Saison », « Statistiques de carrière ») ; le contrôle « Saison en cours » lit la section « Saison » ; **+1 contrôle navigateur** : UNE SEULE requête réseau à l'ouverture (les stats agrégées), AUCUNE requête `/Stats/Activities/` ; le contrôle « MÊME EN ÉCHEC » attend le temps de jeu et la saison (plus de personnages/historique).
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites** ✓. Tests navigateur Playwright non exécutables dans le bac à sable (`libglib-2.0.so.0` absente) — **à valider en `npm run dev`**.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — CORRECTIFS (retour de l'utilisateur en test) : page « Carrière » — plus de « non disponible » pour le temps de jeu et la saison en cours

**Retour de l'utilisateur (22/10/2026, en test)** : « Ca fonctionne ! Maintenant il faut comprendre pourquoi ici il y a des stats non-disponibles. Le temps de jeu est récupéré dans les stats plus bas, et l'en-tête de l'app indique la saison et même la version du jeu. » — capture de la page Carrière avec « non disponible » pour Temps de jeu → Total, Temps de jeu → Par classe et Personnages → « Saison en cours ».

**Deux causes, deux correctifs** :

1. **Temps de jeu « non disponible »** — la page recevait le MAUVAIS profil : `DashboardPage` lui passait `profilTriomphes`, qui est `GetProfile` avec le **composant 900 seul** (triomphes) — il ne contient **pas** le composant 200 (`characters.data[*].minutesPlayedTotal`, temps de jeu par personnage). Les données existaient pourtant déjà : `recupererResumeEtPersonnages` télécharge le profil complet (composants 100, 102, **200**, …) mais le jetait après en avoir dérivé le résumé. **Corrigé** : `recupererResumeEtPersonnages` (`src/lib/bungie/api.ts`, ⚠️ CHANGÉ) retourne aussi le profil brut (`profil`), `DashboardPage` le stocke dans un nouvel état `profilComplet` (réinitialisé à la déconnexion et au re-test) et le passe à `VueCarriere` (`profil={profilComplet}`) — **aucun appel réseau en plus** (c'est le même profil, déjà téléchargé). ⚠️ En complément (l'indice de l'utilisateur : « le temps de jeu est récupéré dans les stats plus bas »), le **Total** retombe désormais sur la stat `secondsPlayed` de `GetHistoricalStatsForAccount` (agrégat « Carrière » du jeu) quand le profil ne porte pas le composant 200 ; le **par classe** reste « non disponible » dans ce cas (les stats historiques n'ont pas le temps de jeu par personnage). Jamais d'estimation.
2. **« Saison en cours » « non disponible »** — la ligne était en dur (`valeur={NON_DISPONIBLE}`, jamais implémentée). **Corrigé** : `VueCarriere` (⚠️ CHANGÉ) lit la saison en cours dans la table `SAISONS` (`src/data/saisons.ts`, socle dérivé de d2-additional-info/DIM) : l'entrée dont la date de fin est `null` — actuellement « Season of Lawless (saison 28, Renegades) ». Aucun appel réseau. ⚠️ Le nom affiché est celui de la **saison** (table des saisons), pas celui de la **version** 9.7.0 (« Monument of Triumph ») du badge de l'en-tête : ce ne sont pas les mêmes libellés (la version 9.7.0 est le patch du 9 juin 2026, la saison 28 « Lawless » a débuté le 2 décembre 2025).

**Tests** :
- `tests/logique/cablage-forge.test.ts` — le regex de montage attend `profil={profilComplet}` (+ `setProfilComplet(profil)`).
- `tests/ui/entree-vue-carriere.tsx` — la fixture précise la FORME RÉELLE du profil (`data.Response`, `characters.data` en haut niveau, comme passé par `DashboardPage`) ; nouveau mode `?sans-profil=1` (profil absent → repli sur `secondsPlayed`).
- `tests/ui/vue-carriere.py` — +1 contrôle source (saison depuis `SAISONS`, repli `secondsPlayed`) + 3 contrôles navigateur : temps de jeu Total « 225 h 00 » et par classe (100/75/50 h), « Saison en cours » = « Season of Lawless (saison 28, Renegades) », et repli `?sans-profil=1` (Total « 2500 h 00 » via `secondsPlayed`, « Par classe » « non disponible »).
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites** ✓. Tests navigateur Playwright non exécutables dans le bac à sable (`libglib-2.0.so.0` absente) — **à valider en `npm run dev`**.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — CORRECTIFS (retours de l'utilisateur en test) : page « Accomplissements » sans la vitrine « Solo sans mourir » ; parsing des stats « Carrière » corrigé (structure réelle de l'API)

**Retours de l'utilisateur (22/10/2026, en test)** :
1. « Accomplissement ne doit pas afficher la Vitrine Solo sans mourir : elle affichera plus tard tous les triomphes obtenus et à obtenir. »
2. Le diagnostic de la page Carrière indiquait « statIds retournés : AUCUN » alors que la réponse de l'API contenait `mergedAllCharacters` avec 2 entrées (`clés de la réponse : mergedDeletedCharacters, mergedAllCharacters, characters` / `entrées de « mergedAllCharacters » : 2`).

**Corrigé** :
- **Page « Accomplissements »** (`src/components/VueAccomplissements.tsx`, ⚠️ CHANGÉ) : la vitrine « Solo sans mourir » (`VitrineSoloFlawless`) est **retirée** de la page — elle reste **uniquement** dans le tiroir « Solo sans mourir » du Build Analyzer (`PanneauTriomphes`, inchangé). La page affiche désormais un emplacement réservé : « 🚧 Bientôt : tous vos Triomphes de compte — obtenus et à obtenir. » Le composant ne prend plus de props (`<VueAccomplissements />` dans `DashboardPage`).
- **Parsing des stats « Carrière »** (`src/lib/bungie/carriere.ts`, ⚠️ CORRIGÉ) : la structure **réelle** de `GetHistoricalStatsForAccount` est `mergedAllCharacters: { results: { <mode>: { allTime: { <statId>: {...} } } }, merged: { allTime: { <statId>: {...} } } }` — les stats ne sont PAS directement sous `mergedAllCharacters` (une clé par statId), mais imbriquées. La lecture se fait désormais dans **`merged.allTime`** (l'agrégat « Carrière » du jeu, toutes activités confondues), avec **repli** sur la somme des `results.<mode>.allTime` si `merged` est vide (`extraireStatsCarriere`, exportée pour les tests). C'est ce mauvais niveau de lecture qui produisait « statIds retournés : AUCUN ».
- **Diagnostic enrichi** : il décrit maintenant la **structure réelle** de `mergedAllCharacters` (ex. « merged (allTime : 8 stats) ») et la **source lue** (« merged.allTime (agrégat « Carrière » du jeu) » ou « somme de results.<mode>.allTime »), au lieu du seul « entrées de « mergedAllCharacters » : N ».

**Tests** :
- `tests/logique/diagnostic-carriere.test.ts` — mis à jour (nouveau diagnostic) + **4 nouveaux contrôles** sur `extraireStatsCarriere` : structure réelle (`merged.allTime` prioritaire), repli (somme des modes), bloc vide (structure décrite, jamais un « AUCUN » muet), champ absent.
- `tests/logique/cablage-forge.test.ts` — montage `<VueAccomplissements />` à jour + **1 nouveau contrôle** : la page Accomplissements n'affiche plus `VitrineSoloFlawless` (placeholder « Bientôt » ; la vitrine reste dans `PanneauTriomphes`).
- `tests/ui/entree-vue-carriere.tsx` — la fixture retourne la **structure réelle** de l'API (`mergedAllCharacters: { results: { allPvE, allPvP }, merged: { allTime: <8 stats> } }`, `mergedDeletedCharacters`, `characters`).
- `tests/ui/vue-carriere.py` — +1 contrôle source (Accomplissements sans vitrine) ; le contrôle navigateur Accomplissements attend le placeholder « Bientôt » et l'**absence** de « Solo sans mourir » ; le diagnostic attend les **clés réelles** de la réponse, la structure « merged (allTime : 8 stats) » et la source lue.
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites, 716/716 contrôles** ✓, pages de test UI reconstruites ✓. Tests navigateur Playwright non exécutables dans le bac à sable (`libglib-2.0.so.0` absente) — **à valider en `npm run dev`**.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — PAGE « CARRIÈRE » : TOUTES les stats du compte sont affichées (plus de sélection figée)

**Demande de l'utilisateur (22/10/2026)** : « Maintenant il reste à afficher les stats du compte. **Toutes les stats.** »

**Changé** : la page « Carrière » n'affiche plus une sélection figée de 19 statistiques — elle affiche **TOUTES les stats retournées par l'API** (`GetHistoricalStatsForAccount`, filtre « Carrière », toutes périodes confondues), dans l'ordre de la réponse.

**Fait** :
- **`src/components/VueCarriere.tsx`** (⚠️ CHANGÉ) —
  - La sélection figée `STATS_AFFICHEES` (19 statIds) est **supprimée** ; la section « Statistiques de carrière » rend désormais `donnees.stats.map(...)` (une ligne par stat de la réponse, grille auto-remplie).
  - Les statIds **connus** gardent leur libellé FR (`LIBELLES_STATS_CONNUS`, figé depuis la réponse réelle de l'API pour ce compte, + `activityDurationSeconds` = « Durée d'activité ») ; une stat **inconnue** affiche son **statId brut** (jamais omise, jamais renommée à l'aveugle).
  - Les statIds de **durées** (secondes : `secondsPlayed`, `activityDurationSeconds`) sont affichés en « X h Y min » et non en secondes brutes ; les autres valeurs gardent 2 décimales max (`fr-FR`).
  - Un compte « N statistiques — filtre « Carrière » (toutes périodes confondues) » est affiché au-dessus de la grille (N = nombre de stats de la réponse).
- **Tests** : `tests/ui/entree-vue-carriere.tsx` — la fixture retourne 8 stats (dont une inconnue `statInconnueDeTest` et une durée `activityDurationSeconds`) ; `tests/ui/vue-carriere.py` — +1 contrôle source (`STATS_AFFICHEES` absent, `donnees.stats.map`, `LIBELLES_STATS_CONNUS`, `STATS_EN_SECONDES`, `formaterDuree` présents) et +2 contrôles navigateur (les 8 stats affichées ni plus ni moins, dans l'ordre, libellés FR / statId brut / durée formatée ; le compte « 8 statistiques »), et le diagnostic dev est ajusté (8 statIds).
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites, 711/711 contrôles** ✓, pages de test UI reconstruites ✓. Les tests navigateur Playwright ne tournent pas dans le sandbox (pas de `libglib-2.0-0`) — **à valider en `npm run dev`**.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — CORRECTIF : « Carrière » et « Accomplissements » ne sont PLUS des onglets du sélecteur (doublon)

**Retour de l'utilisateur (22/10/2026, avant test)** : « Les boutons apparaissent en double. Enlève ceux qui sont entourés de rouge » (capture : les doublons sont les onglets « CARRIÈRE » et « ACCOMPLISSEMENTS » dans le sélecteur de vues, en dessous du bloc Connexion).

**Corrigé** : les pages « Carrière » et « Accomplissements » du compte **ne sont plus des onglets du sélecteur de vues**. Le sélecteur revient à ses **QUATRE onglets** de navigation (Build Analyzer, Load-outs, Forge, Legendarium), avec sa mise en page d'origine (une seule ligne, retour à la ligne sous 810 px, hauteur commune inchangée). Les deux pages restent ouvertes **uniquement** par les boutons « Carrière » et « Accomplissements » du bloc Connexion (qui restent affichés, comme les 4 onglets) : un seul exemplaire de chaque bouton dans toute l'appli.

**Fait** :
- **`src/components/SelecteurVues.tsx`** (⚠️ CHANGÉ) — `VUES` revient à 4 entrées ; le champ `large` et le modificateur `bouton-vue--large` du sélecteur sont retirés (les visuels 4897 x 1024 restent utilisés par le bloc Connexion via `BoutonsVuesCompte`). Le type `VueApp` garde `"carriere"` et `"accomplissements"` (les pages existent toujours, `DashboardPage` les monte comme des vues).
- **`src/index.css`** (⚠️ CHANGÉ) — `.selecteur-vues` : retour à `flex-wrap: nowrap` (wrap sous 810 px) et à la hauteur commune d'origine (formule à 4 boutons, bornes 2,6 rem – 3,5 rem).
- **Tests** : `legendarium.test.tsx` restauré (4 boutons) + nouveau contrôle anti-doublon ; `cablage-forge.test.ts` +1 contrôle anti-doublon ; `selecteur.py` restauré (4 onglets) + contrôle anti-doublon ; `entree-vue-carriere.tsx` réécrit (la page s'ouvre depuis le VRAI bouton du bloc Connexion) ; `vue-carriere.py` mis à jour (clic sur le bouton du bloc Connexion, sélecteur à 4 onglets, un seul exemplaire de chaque bouton).
- `tsc` 0 erreur, `npm run build` strict ✓, batterie logique au vert.

**Version inchangée (0.5.0).**

---

## 22/10/2026 — TODO §25 RÉSOLU : « Carrière » et « Accomplissements » deviennent des PAGES dédiées (ouvertes par le bloc Connexion)

**Demande de l'utilisateur (22/10/2026, TODO §25)** : « On va changer d'approche. On garde le tiroir des Solo sans Mourir pour le moment. Les boutons Carrière et Accomplissements devront chacun ouvrir un onglet spécifique (le bloc de Connexion reste affiché, tout comme les 4 onglets qui se trouvent en dessous). Carrière : n'affiche plus une pop-up mais une page dédiée aux statistiques du compte. Accomplissements : n'agit plus sur le tiroir latéral gauche mais ouvre une page dédiée aux Triomphes du compte. »

**Pourquoi** : le bug §25 (la pop-up « Carrière » ne s'ouvrait pas hors Build Analyzer, car les boutons étaient rendus dans le bloc Connexion masqué `display: none` hors vue analyseur) est résolu **par construction** : il n'y a plus de pop-up, plus de tiroir commandé depuis le bloc Connexion — les deux boutons ouvrent des **onglets** du sélecteur de vues, et le bloc Connexion comme les onglets restent affichés.

**Fait** :
- **`src/components/SelecteurVues.tsx`** (⚠️ CHANGÉ) — le type `VueApp` gagne `"carriere"` et `"accomplissements"` (les deux pages du compte), mais le sélecteur garde ses **QUATRE onglets** de navigation : les pages du compte n'y figurent PAS (elles s'ouvrent par les boutons du bloc Connexion — pas de doublon, retour utilisateur).
- **`src/components/VueCarriere.tsx`** (⚠️ AJOUT) — **page « Carrière »** du compte (remplace `ModaleCarriere.tsx`, **supprimé**) : carte pleine largeur (`pilier-carte`, région « Carrière »), contenu repris tel quel de l'ancienne modale (spécification du 14/10/2026 : temps de jeu total et par classe, personnages, 10 dernières activités, statistiques « Carrière » du compte — lecture seule, chargée à l'ouverture de l'onglet, « non disponible » jamais d'estimation, icônes `IconeClasse`, diagnostic statIds dev). Le bouton « Accomplissements » de l'ancienne modale est **retiré** (l'onglet du même nom remplace la navigation croisée).
- **`src/components/VueAccomplissements.tsx`** (⚠️ AJOUT) — **page « Accomplissements »** : la vitrine « Solo sans mourir » en pleine page (page dédiée aux Triomphes du compte), sans tiroir latéral.
- **`src/components/VitrineSoloFlawless.tsx`** (⚠️ AJOUT) — contenu de la vitrine « Solo sans mourir » (liste des 11 donjons, diagnostics dev), extrait pour être partagé par le tiroir et la page Accomplissements.
- **`src/components/IconeCrane.tsx`** (⚠️ AJOUT) — icône « crâne » extraite de `PanneauTriomphes.tsx` (partagée tiroir / page).
- **`src/components/PanneauTriomphes.tsx`** (⚠️ CHANGÉ) — le tiroir « Solo sans mourir » **retrouve son comportement d'origine** (état d'ouverture interne) : les props `ouvertExterieur` / `onOuvertChange` / `onOuvrirCarriere` et le bouton « Carrière » de la v0.4.14 sont supprimés. **Le tiroir est conservé** (demande de l'utilisateur).
- **`src/components/Modale.tsx`** (⚠️ CHANGÉ) — la prop `apresTitre` (21/10/2026, bouton « Accomplissements » à droite du titre de la modale) est retirée ; l'en-tête redevient un simple titre + croix.
- **`src/pages/DashboardPage.tsx`** (⚠️ CHANGÉ) —
  - Les états `carriereOuverte` et `tiroirTriomphesOuvert` sont **supprimés** ; les boutons du bloc Connexion appellent `setVue("carriere")` / `setVue("accomplissements")`.
  - Les deux pages sont montées comme des vues (`vue === "carriere"` / `vue === "accomplissements"`), **hors du bloc Connexion** masqué avec l'analyseur : elles s'affichent dans TOUTES les vues, avec le bloc Connexion et les 4 onglets du sélecteur au-dessus.
  - `PanneauTriomphes` est rendu sans props de navigation croisée.

**Tests** :
- `tests/logique/cablage-forge.test.ts` — 2 nouveaux contrôles (boutons → onglets ; pages montées comme des vues, modale et état de tiroir externe supprimés).
- `tests/ui/selecteur.py` + `entree-selecteur.tsx` — sélecteur à QUATRE boutons (inchangé) + contrôle anti-doublon (« Carrière » et « Accomplissements » n'y figurent pas).
- `tests/ui/vue-carriere.py` + `entree-vue-carriere.tsx` (remplace `modale-carriere.py`) — **page, pas modale** : ouverte depuis le bouton « Carrière » du bloc Connexion (qui reste affiché), aucun `[role=dialog]`, sélecteur à 4 onglets (pas de doublon), plus de partie « Compte », icônes de classes, diagnostic dev (ouverture/fermeture, contenu même en échec 404), navigation par le bouton « Accomplissements » du bloc Connexion vers la page Accomplissements.
- `tests/ui/connexion-boutons.py` — câblage mis à jour (les deux boutons ouvrent les onglets).
- `tsc -b` 0 erreur, `npm run build` strict ✓, `npm run test:logique` batterie complète au vert.

**À valider en `npm run dev`** : le sélecteur à 4 onglets (inchangé), le bouton « Carrière » du bloc Connexion → page Carrière (statistiques chargées à l'ouverture), le bouton « Accomplissements » → page Accomplissements (vitrine « Solo sans mourir » en pleine page), le tiroir « Solo sans mourir » toujours disponible depuis le Build Analyzer.

---

## 23/10/2026 — MISE À JOUR DE LA DOCUMENTATION (README + NOTICE) — Legendarium livré en v0.5.0

**Constat** (point d'avancement demandé par l'utilisateur) : le README et la NOTICE n'avaient pas été mis à jour après la livraison du Legendarium (v0.5.0, 22/10/2026).

**Fait** :
- **`README.md`** : la ligne « Legendarium … et Forge : en construction » remplacée par deux entrées à jour — **Legendarium** (bibliothèque de Lore en lecture passive, Grimoire D1, Légendes D2, armes, armures, cosmétiques, export infographique PNG) et **Forge** (collection et inventaire, simulation locale des perks et mods, score en tient compte).
- **`NOTICE.md`** :
  - Sommaire : ajout de « Le Legendarium (lire le Lore) ».
  - Tableau des fonctionnalités : ajout de la ligne **Legendarium** ✅ Fonctionnel (lecture passive, recherche avancée, parcours inverse, bouton « Lire le Lore », export infographique PNG).
  - Tableau des fonctionnalités : correction « armures à venir » retiré de la Collection Forge (fait depuis v0.4.12).
  - **Nouvelle section** « Le Legendarium : lire le Lore » après les fonctionnalités : les 4 sections, la recherche avancée (guillemets, `+`, `-`, case « Aa »), le parcours inverse, le bouton « 📖 Lire le Lore » dans les fiches, l'export infographique PNG, le fonctionnement hors-ligne du Grimoire D1.

**Vérifié** : `tsc -b` 0 erreur, `npm run test:logique` **36/36 suites, 708/708 contrôles** ✓ (aucun code modifié, documentation seule).

---

## 22/10/2026 — NETTOYAGE DE LA TODO (section « Confort / plus tard »)

**Demande de l'utilisateur** : relire en détail la partie 🟢 Confort / plus tard du TODO — il y a des doublons. Vérifier que les items terminés sont documentés dans le CHANGELOG, puis nettoyer.

**Vérification faite** — tous les items retirés sont bien documentés dans le CHANGELOG :
- ~~12. Renommage « Forge Armory »~~ → ✅ CHANGELOG : « Renommage officiel : « Forge Armory » » (v0.3.0) + validation le 06/10/2026
- ~~16. Onglet « Load-outs »~~ → ✅ CHANGELOG : v0.3.8 (livraison 1), v0.3.9 (livraison 2), v0.3.16 (livraison 3 + validation)
- ~~16 bis. Visuels illustrés~~ → ✅ CHANGELOG : v0.3.13 à v0.3.17
- ~~21. Police personnalisée~~ → ❌ ABANDONNÉE le 06/10/2026
- ~~22. Logo de fond et mode diagnostic~~ → ✅ CHANGELOG : v0.3.2 (logo de fond + mode diagnostic)
- ~~24. Auteur des builds~~ → ✅ CHANGELOG : v0.3.3
- ~~11. Legendarium (ancienne entrée)~~ → doublon de l'item 26 (livraison complète en v0.5.0)

**Nettoyage fait** :
- **Suppression des doublons** : l'ancien item 11 (Legendarium chantier en cours) est supprimé — remplacé par l'item 11 actuel (Legendarium ✅ LIVRÉ en v0.5.0, ex-item 26)
- **Suppression des items terminés** : 12 (renommage), 16 (Load-outs), 16 bis (visuels illustrés), 22 (logo de fond + mode diagnostic), 24 (auteur des builds)
- **Déplacement vers « Pistes abandonnées »** : 21 (police personnalisée « D2 Build Analyzer Vector »)
- **Renumérotation** : les items restants sont renumérotés de 5 à 23 (sans trous)
- **Références mises à jour** : `TODO main §25` → `TODO main §23` dans `DashboardPage.tsx`, `cablage-forge.test.ts` et `TODO.md` (le bug Carrière/Accomplissements)
- **Note ajoutée** en fin de section Confort listant les items retirés avec leur statut et référence CHANGELOG

**Résultat** : la section « Confort / plus tard » passe de 22 items (5-26) à **19 items (5-23)**, sans doublon, sans item terminé, avec une numérotation continue.

**Vérifié** : `tsc -b` 0 erreur, `npm run test:logique` **36/36 suites, 708/708 contrôles** ✓

**Version inchangée (0.5.0).**

---

## 22/10/2026 — CORRECTIF : FILIGRANE CENTRÉ SUR TOUTE LA FICHE (export infographique Legendarium)

**Demande de l'utilisateur** : « le filigrane du logo de Forge Armory qui se trouve dans l'export infographique, je le veux sur l'ensemble de la fiche. À l'image de ce que l'on fait pour l'export infographique des builds. Assure-toi qu'il soit bien centré. »

**Fait** :
- **`src/lib/legendarium/exportImage.ts`** (⚠️ CHANGÉ) —
  - Le filigrane (emblème Forge Armory) est maintenant **centré sur TOUTE la fiche** (horizontalement ET verticalement), dessiné **AVANT le contenu** (derrière), à l'opacité **0.07** — identique aux exports de builds (`OPACITE_FILIGRANE = 0.07` dans `src/data/emblemeForgeArmory.ts`).
  - Largeur du filigrane : **1000 px** sur une image de 1200 px (~5/6, comme les 760 px sur 900 px des exports de builds).
  - Le logo petit (64 px) dans le pied de l'image est **retiré** — le filigrane centré le remplace.
  - Le pied de l'image garde la mention « Mise en image par Forge Armory » + le crédit Bungie / Destiny (inchangé).
  - Constantes mises à jour : `FILIGRANE_OPACITE` 0.22 → 0.07, ajout de `LARGEUR_FILIGRANE = 1000`.
  - Commentaires FR/EN mis à jour (le filigrane est centré, pas dans le pied).
- **Tests** : `legendarium-export` **19/19** (2 nouveaux : le filigrane est centré horizontalement ET verticalement via `(canvas.width - LARGEUR_FILIGRANE) / 2` et `(canvas.height - hauteurFiligrane) / 2` ; le filigrane est dessiné avant le contenu, pas dans le pied). `tsc` 0 erreur, `npm run build` strict ✓, batterie logique **36/36 suites, 708/708 contrôles**.

**À valider en `npm run dev`** : onglet Legendarium → une page de Lore → bouton « ⤳ Exporter en image » → vérifier que le filigrane (emblème Forge Armory) est **centré sur toute la fiche** (pas seulement en bas), à faible opacité, derrière le texte.

**Version inchangée (0.5.0).**

**Propagation** : le correctif (PR #12) a été répercuté sur les branches de chantier actives pour limiter les conflits futurs : `draft-armure-score`, `draft-deps`, `draft-legendarium`, `draft-netlify`, `draft-sec`, `test`.

---

## 22/10/2026 — v0.5.0 : LIVRAISON LEGENDARIUM — NOUVELLE VERSION MAJEURE

**Passage en version 0.5.0** — livraison du chantier Legendarium complet (bibliothèque de Lore en lecture passive) marquant une étape majeure du projet.

**Pourquoi 0.5.0 ?** Le chantier Legendarium est terminé et livré : 6 étapes du plan + 15 suites de retours utilisateur + bonus export infographique. C'est une fonctionnalité complète qui transforme l'application (ex-« Bibliothèque », renommée « Legendarium »). La convention « 0.5 réservé à la clôture de la Forge » est levée : le Legendarium, chantier majeur livré en parallèle, justifie le passage en 0.5.0.

**Contenu de la 0.5.0** :
- **Legendarium complet** : navigation par livres hiérarchique (catégorie → livre → pages, couvertures), 4 sections (Grimoire D1, Légendes D2, Armes et armures, Cosmétiques et utilitaires)
- **Grimoire D1** : repli statique embarqué (6 livres / 834 cartes FR, The Grimoire Archive), chargement dynamique, hors-ligne
- **Lore D2** : armes (cinétiques/énergétiques/lourdes), armures (145 ensembles), cosmétiques (Spectres, Vaisseaux, Passereaux, Autres) depuis le Manifest
- **Recherche avancée** : guillemets (phrase exacte), `+` (obligatoire), `-` (exclu), case « Aa » (respecter la casse)
- **Parcours inverse** : page → objets porteurs du Lore (rééditions comprises)
- **Bouton « Lire le Lore »** dans les fiches (lien profond fiche ↔ Legendarium + retour)
- **Export infographique PNG** : filigrane Forge Armory + crédit Bungie/Destiny, canvas natif
- **9 critères d'acceptation** vérifiés (34/34 contrôles)

**État technique** :
- `tsc -b` : 0 erreur
- `npm run build` strict : ✓
- Batterie logique : **36/36 suites, 706/706 contrôles** ✓
- CI GitHub Actions : opérationnelle

**Validé sur le VRAI Manifest FR** : 4 catégories / 108 livres / 1 076 pages

**Propagation** : le changement de version 0.4.14 → 0.5.0 a été répercuté sur les branches de chantier actives pour limiter les conflits futurs : `draft-armure-score`, `draft-deps`, `draft-legendarium`, `draft-netlify`, `draft-sec`, `test`.

---

## 22/10/2026 — LIVRAISON : branche `draft-legendarium` (Legendarium complet + bonus export infographique) mergée dans `main`

**Livraison du chantier Legendarium** (bibliothèque de Lore en lecture passive, spécification verrouillée `documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md`) :

- **Contenu livré** : étapes 1-6 du plan (fondations, page Legendarium 3 zones, navigation par livres en jeu, bouton « Lire le Lore » + lien profond + retour, suites 7-15 des retours utilisateur) + **bonus export infographique** (PNG d'une page de Lore : canvas natif, filigrane Forge Armory, crédit Bungie / Destiny ou Destiny 2). Spécification complète dans `documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md`.
- **Grimoire D1** : repli statique embarqué (`src/data/grimoire-d1-repli.json`, 6 livres / 834 cartes FR, généré par `scripts/generer-repli-grimoire.mjs` depuis The Grimoire Archive) chargé par `import()` dynamique — Bungie ne sert plus le Grimoire via l'API D1 (diagnostic : clé acceptée, HTTP 200, 0 livre / 0 carte).
- **9 critères d'acceptation vérifiés** : `legendarium-acceptation` **34/34** (dont la lecture passive : aucun impact scoring/build, aucun stockage persistant, état en mémoire uniquement).
- **Vérifié avant livraison** : `tsc -b` zéro erreur, `npm run build` strict ✓, `npm run test:logique` **36/36 suites, 706/706 contrôles** (legendarium : acceptation 34/34, export 17/17, fixtures 19/19, grimoire 23/23, modele 107/107, page 69/69, composant 5/5 ; saisons-sources 20/20).
- **Merge** : `origin/main` (`e6a6816`, push intermédiaire : correctif `saisonDeLObjet` + TODO §25 + `.gitignore`) fusionné dans `draft-legendarium` (`821a785`, 4 conflits résolus : CHANGELOG/TODO/saisons/test — bloc branche conservé, doublons main écartés), puis fast-forward `main` → `821a785`.
- **Reste côté utilisateur** : validation en `npm run dev` avec un vrai Manifest (TODO §26, « Reste à faire »). Le bug des boutons « Carrière » / « Accomplissements » hors Build Analyzer reste ouvert (TODO §25).

## 22/10/2026 (branche `draft-legendarium`, bonus) — EXPORT INFOGRAPHIQUE D'UNE PAGE DE LORE (PNG) : FILIGRANE FORGE ARMORY + CRÉDIT BUNGIE / DESTINY

**Demande de l'utilisateur (note « pour plus tard » du 22/10, suite 12, mise en œuvre)** : « pouvoir générer un **export infographique (JPEG/PNG) de la page de lore sélectionnée** : le bouton sera affiché **en haut à droite de la page**. L'export affichera **tout ce qui se trouve sur la page de Lore** (l'encart bleu ou ambre). Sur l'export, tu pourras mettre **en filigrane le logo de Forge Armory** en précisant **en bas de l'image que c'est une mise en image**, et en **créditant Bungie et Destiny ou Destiny 2** (que tout le monde puisse savoir que c'est eux qui ont créé cet univers). »

**Fait** :
- **`src/lib/legendarium/exportImage.ts`** (⚠️ AJOUT) — rendu **natif sur `<canvas>`** (aucune bibliothèque ajoutée : le projet n'en a pas, et une dépendance pour un seul export serait disproportionnée) :
  - Reprend la **palette verrouillée** (Parchemin D1 / Hologramme D2) : fond, bordure, lueur hologramme, œilleton « catégorie · livre · section » + compteur « page X/Y » justifié à droite, titre, sous-titre, libellé chronologique, **texte du Lore avec retour à la ligne** (mesure réelle `ctx.measureText`), **parcours inverse** (objets portant le Lore).
  - **Couverture du livre** dessinée en haut à gauche (taille naturelle plafonnée, jamais agrandie — pas de pixellisation) ; le texte commence à sa droite puis continue dessous (même logique que le flottant CSS de l'appli). `crossOrigin="anonymous"` (Bungie autorise CORS, sinon le canvas serait « souillé » et `toBlob` échouerait) ; en cas d'indisponibilité : export **sans** image, jamais de blocage.
  - **Pied de l'image** : **filigrane du logo Forge Armory** (emblème `public/logo-forge-armory-embleme.png`, opacité 0.22, centré) + mention **« Mise en image par Forge Armory »** + **« Texte du Lore © Bungie, Inc. — Destiny/Destiny 2 est une marque de Bungie, Inc. Forge Armory est un projet de fan, non affilié à Bungie. »** (le libellé est « Destiny » pour le Grimoire D1, « Destiny 2 » sinon).
  - Fonctions pures exportées pour les tests : `decouperTexte`, `eclaircir`, `nomFichierPropre`. Téléchargement par lien `<a download>` créé à la volée (PNG par défaut, JPEG possible) — **aucun état persistant**.
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) — `ZoneLecture` gagne la prop `avecExport` (défaut `false`) et un **bouton « ⟳ Exporter en image » EN HAUT À DROITE de la page** (ligne flex : bouton retour à gauche quand provenance, export à droite). État « export en cours » (désactive le bouton, affiche « Export… ») + message d'erreur inline. Passé à `true` dans le rendu de la page Legendarium.
- **Tests** : `legendarium-export` **17/17** (nouveau : découpage du texte avec contexte factice, conservation des paragraphes vides, mot trop long jamais tronqué, nom de fichier nettoyé/plafonné, `eclaircir`, **lecture passive vérifiée** : aucun fetch/POST, aucun stockage persistant, crédit Bungie/Destiny présent, filigrane présent, libellé D1/D2) ; `legendarium-page` **69/69** (3 nouveaux : bouton affiché en haut à droite quand `avecExport`, absent par défaut, retour à gauche + export à droite). Batterie logique complète : **36/36 suites, 706/706 contrôles**. `tsc` 0 erreur, `npm run build` strict ✓.

**À valider en `npm run dev`** : onglet Legendarium → une page de Lore → bouton « ⟳ Exporter en image » (haut droite) → télécharger le PNG → vérifier l'encart (parchemin/hologramme), le texte lisible, la couverture, le filigrane + le crédit en bas.


## 22/10/2026 (branche `draft-legendarium`, étape 6) — VÉRIFICATION : LES 9 CRITÈRES D'ACCEPTATION SONT AU VERT (34/34)

**Fait** : nouveau test d'acceptation **`tests/logique/legendarium-acceptation.test.ts`** (34 contrôles) qui vérifie les **9 critères d'acceptation** de la spécification verrouillée (`documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md` §7), chacun par lecture du code (comme `cablage-forge.test.ts`) ou exécution du modèle :

1. **Légendes D2 + Grimoire D1 regroupés par livres** (comme en jeu) — ✅ hiérarchie catégorie → livre → pages (suite 10) ; repli D1 = 6 livres / 834 cartes, ordre officiel, ids `grimoire:<idCarte>` + sous-titre chapitre.
2. **Ordre global respecté** — ✅ Grimoire D1 → Légendes D2 → Armes et Armures → Cosmétiques et utilitaires (`SECTIONS`).
3. **Ensembles d'armures : ordre casque → gants → torse → jambes → objet de classe, par classe** — ✅ `ORDRE_SLOTS_ARMURE` + `ORDRE_CLASSES` (Titan → Chasseur → Arcaniste), vérifié aussi par le modèle sur un livre « Ensembles d'armures ».
4. **Recherche par mots-clés** — ✅ retrouve les pages (insensible à la casse), y compris la recherche avancée suite 15 (guillemets = phrase exacte, `-` = exclu).
5. **Bouton « Lire le Lore » uniquement si Lore présent, haut de fiche, justifié à droite, sous la croix** — ✅ `BoutonLireLore` retourne `null` sans Lore (`aLore`), `justify-content:flex-end`, et dans les **5 fiches** (InventaireArmes/Armures, CollectionArmes/Armures, pop-up Build Analyzer `SelecteurInventaire`) le bouton est DANS LE DOM **après** la croix de fermeture, rendu seulement si `onLireLore` est fourni.
6. **Parcours inverse page → objets porteurs** — ✅ `porteursDeLore` retrouve tous les porteurs (rééditions comprises, objets masqués exclus) ; lien profond `item:<hash>` résolu vers `lore:<hash>`.
7. **Spectres, Vaisseaux, Passereaux listés avec leur Lore** — ✅ livres « Spectres » → « Vaisseaux » → « Passereaux » (dans cet ordre, avant « Autres »), objets sans Lore exclus.
8. **Aucun impact sur le scoring ni le build (lecture passive vérifiée)** — ✅ aucun import scoring/build/simulation dans les modules Legendarium ; les seuls appels réseau sont des **GET** en lecture (Grimoire D1) — **aucun POST/PUT/DELETE** ; **aucun stockage persistant** (pas de localStorage/sessionStorage/indexedDB/cookies) ; le bouton est un composant **pur** (pas de `useState`/`useEffect`) ; la cible Legendarium dans `DashboardPage` est en `useState` (mémoire uniquement) ; le modèle ne fait que **lire** le cache manifeste.
9. **Cache téléchargé/mis à jour sans casser le catalogue** — ✅ le Legendarium **réutilise** le cache existant (`lib/manifest/download.ts`), aucun second mécanisme de téléchargement ; le Grimoire D1 (JSON 930 Ko) est importé **dynamiquement** (`import()`, hors du bundle principal) ; le cache manifeste n'importe **rien** du Legendarium (dépendance à sens unique).

**Vérifié** : `legendarium-acceptation` **34/34** ; batterie logique complète **35/35 suites, 686/686 contrôles** ; `tsc` 0 erreur ; `npm run build` strict ✓.


## 22/10/2026 (branche `draft-legendarium`, suite 15) — RECHERCHE AVANCÉE : GUILLEMETS (PHRASE EXACTE), `+` (OBLIGATOIRE), `-` (EXCLU), CASE « Aa » (RESPECTER LA CASSE)

**Demande de l'utilisateur (avant test de la suite 14)** : « pour la recherche, il faudrait pouvoir utiliser **les guillemets, + et -, ainsi que respecter la casse** ».

**Fait** :
- **`src/lib/legendarium/modele.ts`** (⚠️ CHANGÉ) —
  - Nouveau `RequeteRecherche` (`termes`, `exactes`, `obligatoires`, `exclus`) + **`parserRecherche(requete)`** : analyse caractère par caractère. Les guillemets `"…"` (ou `« … »`) donnent une **phrase exacte** (sous-chaîne contiguë, tous les guillemets fermés requis) ; un guillemet non fermé est toléré (la phrase court jusqu'à la fin) ; `+terme` = **terme obligatoire** (ET) ; `+"phrase"` = **phrase exacte obligatoire** ; `-terme` / `-"phrase"` = **exclu** (la page est rejetée si présente).
  - **`correspondRecherche(haystack, requete, respecterCasse)`** : les exclusions rejettent d'abord ; les obligatoires + exactes sont TOUTES requises ; les termes libres ne forment un OU (au moins un) **que s'il n'y a ni obligatoire ni exacte** (comportement type Google) ; une requête avec UNIQUEMENT des exclusions remonte toutes les pages qui ne les contiennent pas.
  - **`rechercherPages(livresParSection, motCle, options?: { respecterCasse?: boolean })`** : le `respecterCasse: true` rend la recherche **sensible à la casse** (majuscules/minuscules ; les accents restent ignorés — é = e — via la normalisation NFD dans les deux modes). Par défaut (`false`) : comportement historique (insensible à la casse, accents ignorés).
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) — nouvelle **case « Aa »** (`data-respecter-casse`) dans le bandeau, à droite du champ de recherche (title « Respecter la casse »), **décochée par défaut** ; état `respecterCasse` EN MÉMOIRE uniquement (lecture passive), passé à `rechercherPages` via le `useMemo` des résultats.
- **Tests** : `legendarium-modele` **107/107** (11 nouveaux suite 15 : découpage du parser, guillemet non fermé, phrase exacte `"casque raid"` vs OU libre, exclusion `-donjon`, `+casque +raid` = ET, `+casque +a`, casse par défaut vs `respecterCasse: true`, `CASQUE` vs `Casque`, requête uniquement-exclue) ; `legendarium-page` **66/66** (2 nouveaux : case « Aa » présente et décochée par défaut, cochée quand actif) ; `legendarium-fixtures` **19/19** ; `legendarium-grimoire` **23/23** ; `legendarium` **5/5**. `tsc` 0 erreur, `npm run build` strict ✓, batterie logique 34/34 suites au vert (les 16 « interface · » Playwright ne tournent pas dans le bac à sable).


## 22/10/2026 (branche `draft-legendarium`, suite 14) — CORRECTION MALENTENDU : HIÉRARCHIE ARMURES = CLASSE → ENSEMBLE → PIÈCES ; COSMÉTIQUES « AUTRES » CLASSÉS PAR CLASSE (icônes)

**Remarque de l'utilisateur (malentendu sur la suite 13)** : (1) pour les **ensembles d'armures**, la hiérarchie demandée est **Classe (Titan/Chasseur/Arcaniste, icône) → nom de l'ensemble → noms de pièces, clic direct** — la suite 13 faisait Ensemble → Classe → pièces (inversé) ; (2) pour **Cosmétiques et utilitaires → Autres**, les éléments concernent des **doctrines de classes** (Brise-soleil, Grâce survoltée, Lame de l'aube, Voie abyssale…) : les classer **par classe de personnage, avec icône**.

**Fait** :
- **`src/lib/legendarium/types.ts`** (⚠️ CHANGÉ) — nouveau type `GroupeClassePages` : un groupe par classe (Titan/Chasseur/Arcaniste, ordre verrouillé, `icône` Manifest quand disponible, `classe` ABSENTE pour le groupe « Sans classe »), portant SOIT `ensembles` (sous-niveau repliable par nom d'ensemble → pièces, pour les armures), SOIT `pages` (liste directe de noms, pour les cosmétiques « Autres »). `LivreLore.groupesPages` devient `GroupeClassePages[]`.
- **`src/lib/legendarium/modele.ts`** (⚠️ CHANGÉ) —
  - `livresObjets` : les armures forment désormais **UN SEUL livre « Ensembles d'armures »** (id `objets-armures`, compteur = total des pages, `pages` = ordre verrouillé global classe → slots pour la lecture) avec `groupesPages` = **Classe → Ensemble → pièces** (`groupesArmuresParClasse`) : les ensembles d'une classe sont ordonnés par saison de sortie, les pièces dans l'ordre verrouillé des slots. Les armures sans provenance vont dans l'ensemble « Autres armures ».
  - `livreCosmetiques` : le livre **« Autres »** porte `groupesPages` = **Classe → noms d'objets** (`groupesCosmetiquesParClasse`) : Titan (Brise-soleil…), Chasseur (Grâce survoltée…), Arcaniste (Lame de l'aube, Voie abyssale…), puis **« Sans classe »** (artefacts, ornements sans classType) en dernier. Spectres/Vaisseaux/Passereaux restent des repliables de noms (`listePages`).
  - `rechercherPages` : les noms des sous-groupes (classes, ensembles) sont cherchés, ET une requête **multi-mots** (ex: « raid A ») correspond si chaque mot est trouvé dans le livre ou ses pages.
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) — `LivreAvecGroupes` rend un livre `groupesPages` comme un **repliable de classes** (replié par défaut) ; `GroupeClasse` rend le niveau 2 (classe + icône + compteur justifié à droite, replié par défaut) avec SOIT des sous-groupes repliables **par ensemble** (nouveau `SousGroupeEnsemble`, niveau 3 : nom → pièces, clic direct), SOIT la liste directe des noms. Groupe « Sans classe » : pas d'icône, libellé « Sans classe ». `ListeLivresGroupee` gère le nouveau genre `classes` (avant `groupesPages` → `LivreAvecGroupes`).
- **Tests** : `legendarium-modele` **96/96** (hiérarchie Classe → Ensemble → pièces, cosmétiques par classe, recherche multi-mots, repli sans collectibles) ; `legendarium-page` **64/64** (repliable de classes replié par défaut, coexistence listePages + classes, groupe « Sans classe ») ; `legendarium-fixtures` **19/19**. `tsc` 0 erreur, `npm run build` strict ✓, batterie logique 16/16 suites au vert.


## 22/10/2026 (branche `draft-legendarium`, suite 13) — COMPTEUR « page X/Y » DANS L'ŒILleton + ENSEMBLES D'ARMURES : DEUX NIVEAUX REPLIABLES PAR CLASSE (icônes)

**Remarques de l'utilisateur (avant test de la suite 12)** : (1) dans l'espace de lecture, **au même niveau que le titre du livre**, afficher le **compteur de page justifié à droite** (ex: « La Lumière · La Frontière sans foi ni loi » … « page 1/14 ») ; (2) pour les **ensembles d'armures**, ajouter un niveau de **sections repliables indiquant les classes** (Titan, Chasseur, Arcaniste — **avec icônes**) : Ensemble → Classe → sélection de la page à lire ; (3) note cosmétiques : **même logique que les armes** (déjà fait en suite 12 : `listePages`, repliable de noms d'objets, clic direct).

**Fait** :
- **`src/lib/legendarium/types.ts`** (⚠️ AJOUT) — `LivreLore.groupesPages?` : second niveau repliable par classe (`{ classe, icône?, pages[] }[]`), pour les ensembles d'armures.
- **`src/lib/legendarium/modele.ts`** (⚠️ AJOUT) —
  - `iconesClasses(db)` : lit `DestinyClassDefinition.displayProperties.icon` (cache WeakMap). ⚠️ **VALIDÉ VRAI Manifest FR** : `hasIcon: false`, AUCUNE icône pour les 3 classes → `undefined` en pratique, l'UI retombe sur l'icône locale.
  - `groupesParClasse(db, pages)` : découpe les **pages dédupliquées** d'un ensemble en groupes par classe, dans l'ordre verrouillé **Titan → Chasseur → Arcaniste**. ⚠️ **CORRIGÉ (validation VRAI Manifest)** : la classe se lit sur le **Lore** (via n'importe quel porteur de la page), pas sur le hash d'un item — sinon les ensembles avec réédition perdaient des pièces (ex: « Armure de Rull » : 5 pages mais 3 groupes au lieu de 5, car les réditions sans collectible n'étaient pas retrouvées). Après correction : **145/145 ensembles ont leurs groupesPages, 0 perte de pages**.
  - `livresObjets` : chaque livre d'armures (ensembles + « Autres armures ») porte `groupesPages`.
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) —
  - **Compteur « page X/Y »** : l'œilleton (`data-oeilleton`) est une ligne flex — titre du livre à gauche, **`data-compteur-page` « page X/Y » justifié à droite** (`margin-left:auto`). Props `indexPage`/`totalPages` sur `ZoneLecture` (position DANS LE LIVRE, distincte de l'index aplati de la section pour précédent/suivant).
  - **Nouveau `LivreAvecGroupes`** (niveau 1, replié par défaut) + **nouveau `GroupeClasse`** (niveau 2, replié par défaut, icône Manifest `urlIcone` ou repli **icône locale `IconeClasse`** 14px disque coloré + SVG, compteur de pièces justifié à droite) : le contenu du niveau 2 est la **liste des noms de pièces** (`data-page=<id>`, clic direct vers la page de Lore). Chemin : **Ensemble → Classe → sélection de la page à lire**. Les livres sans `groupesPages` restent des `LigneLivre` classiques.
  - Import `IconeClasse` (composant existant, source justrealmilk/destiny-icons CC0).

**Validation sur le VRAI Manifest FR** (22/10/2026, lecture seule, modèle réel) : **145/145 ensembles d'armures** ont `groupesPages` ; ex « Armure de BrayTech » (15 pages) = **Titan 5 pièces → Chasseur 5 → Arcaniste 5**, ordre verrouillé dans chaque classe (casque → gants → torse → jambes → marque), **0 perte de pages** (somme des groupes = livre). `DestinyClassDefinition` : 3 entrées, `hasIcon: false`, aucune icône → repli `IconeClasse` local. Cosmétiques inchangés : Spectres 73p, Vaisseaux 97p, Passereaux 102p, Autres 667p.

**Tests** : `legendarium-modele` **94/94** (5 nouveaux suite 13 : `groupesPages` par classe dans l'ordre verrouillé, icône Manifest, sans icône = undefined, armes sans groupesPages) ; `legendarium-page` **64/64** (8 nouveaux suite 13 : compteur « page 1/14 » / « page 3/14 » justifié à droite dans l'œilleton, pas de compteur sans indexPage, groupe Ensembles d'armures replié par défaut masque les 2 niveaux, pas de fuite du niveau 2) ; `legendarium-fixtures` **18/18** ; `saisons-sources` **20/20** ; `legendarium-grimoire` **23/23** ; `legendarium` **5/5**. Batterie complète : 34/34 séries logiques au vert (les 16 « interface · » Playwright ne tournent pas dans le bac à sable). `tsc` zéro erreur, `npm run build` strict ✓.

---

## 22/10/2026 (branche `draft-legendarium`, suite 12) — COUVERTURE FLOTTANTE LISIBLE + REPLIABLES DE NOMS D'OBJETS + COMPTEUR DE PAGES SUR UNE LIGNE

**Retours de l'utilisateur (validation de la suite 11)** : (1) l'image affichée dans une légende est **pixellisée** — l'afficher **en haut à gauche** de la fenêtre de lecture, le texte commence **à droite** de l'image puis **continue sous** l'image (sans jamais se superposer ni faire une « colonne » réservée à l'image) ; (2) dans **Cinétiques, Énergétiques, Lourdes, Spectres, Vaisseaux, Passereaux et autres**, afficher le **nom de chaque objet** ayant une légende (pour trouver plus facilement) — ces intitulés deviennent des **repliables/dépliables** ; (3) le **nombre de pages** d'un livre/armure doit tenir **sur une ligne**, **justifié à droite** du menu de sélection.

**Note pour plus tard (NON implémenté, à faire quand demandé)** : pouvoir générer un **export infographique (JPEG/PNG) de la page de Lore sélectionnée** — bouton affiché **en haut à droite de la page** ; l'export affiche tout ce qui se trouve sur la page (l'encart bleu ou ambre) ; en **filigrane le logo de Forge Armory**, et en bas de l'image une mention « mise en image » créditant **Bungie** et **Destiny / Destiny 2** (que tout le monde sache que c'est eux qui ont créé cet univers).

**Fait** :
- **`src/lib/legendarium/types.ts`** (⚠️ AJOUT) — `LivreLore.listePages?` : quand VRAI, la colonne latérale affiche ce livre comme un **repliable (replié par défaut) listant le nom de chaque page** (objet porteur) — chaque nom ouvre **directement** la page de Lore de cet objet. Le livre reste un livre pour la lecture (précédent/suivant, ordre aplati, recherche) : seule l'affichage latérale change.
- **`src/lib/legendarium/modele.ts`** (⚠️ CHANGÉ) — **Armes** : plus de groupe « Lore des armes » ; UN livre `listePages` par type (**Cinétiques → Énergétiques → Lourdes**, puis « Autres armes » si besoin). **Cosmétiques** : UN livre `listePages` par type (**Spectres → Vaisseaux → Passereaux → Autres**). **Armures** : INCHANGÉ (groupe repliable « Ensembles d'armures », un livre par ensemble). Pages chronologiques dans chaque livre.
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) —
  - **Nouvelle `LigneLivre`** (partagée) : titre tronqué avec « … » (`nowrap` + `ellipsis`) + **compteur de pages justifié à droite** (`margin-left:auto`) **sur une seule ligne** — appliquée à TOUTES les lignes de livres (Grimoire D1, Légendes D2, ensembles d'armures).
  - **Nouveau `GroupePages`** : repliable (replié par défaut) dont le contenu est la **liste des noms d'objets** (`data-page=<id>`), clic direct vers la page de Lore.
  - **`ListeLivresGroupee`** : 3 cas dans l'ordre du modèle — livre `listePages` → `GroupePages` ; livres avec `groupe` → `GroupeLivres` (replié par défaut) ; livres sans groupe → liste plate (Grimoire D1).
  - **Couverture de la page de lecture** : **flottante en haut à gauche** (`float:left`, `max-width:45%`, `height:auto`, **pas de `width` forcée** → jamais agrandie au-delà de sa taille naturelle, **plus de pixellisation**) ; le parcours inverse et la nav du bas portent **`clear:both`** (rien ne remonte à côté de l'image — pas de superposition, pas de « colonne » réservée).

**Validation sur le VRAI Manifest FR** (22/10/2026, lecture seule, modèle réel) : section **objets** = 3 livres `listePages` (**Cinétiques 161p, Énergétiques 186p, Lourdes 109p**) + 145 livres dans le groupe « Ensembles d'armures » (1 648 pages) ; section **cosmétiques** = 4 livres `listePages` (**Spectres 73p, Vaisseaux 97p, Passereaux 102p, Autres 667p**). Ordres vérifiés : armes Cinétiques → Énergétiques → Lourdes ; cosmétiques Spectres → Vaisseaux → Passereaux → Autres ; aucune trace de « Lore des armes ».

**Tests** : `legendarium-modele` **89/89** (tests suite 11 mis à jour : `listePages: true` + pas de groupe pour armes/cosmétiques) ; `legendarium-page` **56/56** (5 nouveaux suite 12 : repliables de noms repliés par défaut avec `data-page`, compteur justifié à droite `margin-left:auto`, liste plate sur une ligne `nowrap`+`ellipsis`, couverture `float:left`/`max-width:45%`/`height:auto` sans `width:100%` ni `object-fit`, `clear:both` sur parcours inverse + nav du bas) ; `legendarium-fixtures` **18/18** ; `saisons-sources` **20/20** ; `legendarium-grimoire` **23/23** ; `legendarium` **5/5**. Batterie complète : 34/34 séries logiques au vert (les 16 « interface · » Playwright ne tournent pas dans le bac à sable). `tsc` zéro erreur, `npm run build` strict ✓.

---

## 22/10/2026 (branche `draft-legendarium`, suite 11) — GROUPES REPLIABLES + CLASSEMENT (armes par type, armures par provenance, cosmétiques par type) + CORRECTION du classement chronologique (hash signé/non signé)

**Retours de l'utilisateur (validation de l'étape 3)** : (1) les images dans le menu de sélection à gauche sont inutiles ; (2) les catégories Légendes D2 (Avant-Garde, La Lumière, Crépuscule et aube, Les Ténèbres) doivent être des sections **repliables, repliées par défaut** ; (3) même chose pour « Armes et **A**rmures » (majuscule) et « Cosmétiques et utilitaires » ; (4) dans « Lore des armes », ordonner par type : **Cinétiques, Énergétiques, Lourdes** (replié) ; (5) « Ensembles d’armures » (1 041 pages) : identifier la **provenance** pour classer (raid Léviathan ensemble, donjon ensemble…), **ordre chronologique de sortie des saisons** ; (6) « Cosmétiques et utilitaires » : ordonner par type : **Spectres, Vaisseaux, Passereaux** (replié).

**Provenance des armures découverte dans le VRAI Manifest FR** (22/10/2026) : `item.collectibleHash` → `DestinyCollectibleDefinition.parentNodeHashes[0]` = nœud **ensemble** (ex: « Armure de Sekris » = 5 collectibles = 5 pièces, raid Léviathan) → le parent de ce nœud est la catégorie (Haut niveau, Monde, Compétitif, Saisons…). **144 ensembles identifiés** parmi les armures avec Lore ; les armures sans collectible tombent dans « Autres armures ».

**Fait** :
- **`src/types/manifest.ts`** (⚠️ AJOUT) — `DestinyCollectibleDefinition` (hash, displayProperties, `itemHash?`, `parentNodeHashes?`, `sourceString?`, scope, redacted/blacklisted).
- **`src/lib/legendarium/types.ts`** (⚠️ AJOUT) — `LivreLore.groupe?` : nom du groupe repliable parent dans la colonne latérale.
- **`src/lib/legendarium/modele.ts`** (⚠️ CHANGÉ) — **Armes** : 3 livres dans le groupe repliable « Lore des armes » : **Cinétiques** (bucket 1498876634, 277 pages), **Énergétiques** (2465295065, 316), **Lourdes** (953998645, 174), dans cet ordre, pages chronologiques dans chaque livre. **Armures** : groupe repliable « Ensembles d’armures » avec **UN LIVRE PAR ENSEMBLE** (provenance = nom du nœud parent du collectible), ensembles ordonnés par saison de sortie, pièces dans l’ordre verrouillé (casque → gants → torse → jambes → marque) ; armures sans provenance dans « Autres armures ». **Cosmétiques** : un livre par type dans l’ordre **Spectres** (itemType 24, 73 pages), **Vaisseaux** (21, 97), **Passereaux** (22, 102), puis « Autres » (ornements, artefacts). Index provenance en un seul balayage (WeakMap). Label section : « Armes et **A**rmures ».
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) — colonne latérale SANS images (titres + compteurs uniquement) ; **catégories Légendes D2 et groupes objets/cosmétiques en sections repliables, REPLIÉES PAR DÉFAUT** (état en mémoire uniquement) ; la couverture reste affichée EN HAUT de la page de lecture.
- **`src/data/saisons.ts`** (⚠️ CORRIGÉ — BUG RÉEL) — `saisonDeLObjet` teste désormais le hash **signé ET non signé** (`itemHash >>> 0`) : le JSON de DIM stocke les hashes en non signé 32 bits, le Manifest en signé. **Avant : 50 % des objets ne trouvaient JAMAIS leur saison via cette table** (tous les hashes > 0x7FFFFFFF, soit ~29 000 entrées sur 57 439) — dont toutes les armures avec collectible (pas de seasonHash dans le Manifest). Après : **100 %** des 4 418 objets avec lore trouvent leur saison. C’est ce bug qui empêchait l’ordre chronologique des ensembles d’armures. Impacte aussi l’infobulle de saison (IconeSaison) et la recherche Manifest.
- **`indexPorteurs`** (⚠️ CORRIGÉ, validation VRAI Manifest) — classement par **bucket réel** (arme = cinétique/énergie/lourde, armure = casque/gants/torse/jambes/marque), pas seulement `itemType !== 3` : sinon 1 178 ornements d’armure (itemType 0, « Gantelets ») étaient classés « armes ».

**Validation sur le VRAI Manifest FR** (22/10/2026, lecture seule) : 4 135 porteurs avec lore lisible → après dedup : **455 pages armes** (277 cinétiques, 316 énergétiques, 174 lourdes), **1 041 pages armures** (144 ensembles + « Autres armures »), **939 pages cosmétiques** (73 Spectres, 97 Vaisseaux, 102 Passereaux, 667 autres). **100 %** des porteurs trouvent leur saison (DIM corrigé). Les 1 174 armures avec collectible ont toutes une provenance (nœud ensemble) et une saison.

**Tests** : `legendarium-modele` **89/89** (11 nouveaux suite 11 : groupement armes/armures/cosmétiques, ordre chrono des ensembles, repli sans tables collectibles/nœuds) ; `legendarium-page` **51/51** (6 nouveaux : pas d’image dans le menu, groupes repliés par défaut, liste plate sans groupe, label « Armes et Armures ») ; `legendarium-fixtures` **18/18** ; `saisons-sources` **20/20** (3 nouveaux : hash signé/non signé) ; `legendarium-grimoire` **23/23** ; `legendarium` **5/5**. `tsc` zéro erreur, `npm run build` strict ✓.

---

## 21/10/2026 (branche `draft-legendarium`, suite 10) — NAVIGATION PAR LIVRES (hiérarchie en jeu : catégorie → livre → pages, avec couvertures)

**Demande de l'utilisateur** : dans le Legendarium, on ne pouvait naviguer qu’en faisant une recherche ou via « précédent/suivant » / « lire le Lore ». En jeu, chaque page de Lore D2 (sauf armes et armures) est classée dans un **livre** (ex: « Ces terres maudites » ∈ « La Frontière sans foi ni loi », 14 pages, couverture illustrée ∈ catégorie « La Lumière »).

**Structure découverte dans le VRAI Manifest FR** (téléchargé et inspecté hors-ligne, 21/10/2026) : l’arbre `DestinyPresentationNodeDefinition` depuis la racine « Légendes » (hash **4077680549**, scope 0) : **4 catégories** (L’Avant-garde, La Lumière, Crépuscule et aube, Les Ténèbres) → **108 livres** (1 de moins que les 109 nœuds : un livre n’a aucune page lisible) → **1 076 pages**. Chaque livre = un nœud avec `displayProperties.icon` (la **couverture**) et `children.records` (les pages) ; chaque record a un **`loreHash`** vers `DestinyLoreDefinition`. Ordre = ordre des enfants dans le Manifest (ordre de l’onglet Lore en jeu). Les 109 lores aussi portés par des objets (ex: « Europe – 1 ») le sont par des objets **factices** (itemType 20, catégorie 3109687656) : exclus du parcours inverse, donc les pages des livres n’affichent pas de bloc « objets porteurs » (comme en jeu).

**Fait** :
- **`src/types/manifest.ts`** (⚠️ AJOUT) — `DestinyPresentationNodeDefinition` (hash, displayProperties, scope, children.presentationNodes/records/collectibles, parentNodeHashes, redacted/blacklisted) et `DestinyRecordDefinition` (hash, displayProperties, **`loreHash?`**, redacted/blacklisted).
- **`src/lib/legendarium/types.ts`** (⚠️ AJOUT) — `CategorieLore` (hash, titre, icone?, livres[]) ; `LivreLore` gagne **`couvertureUrl?`** (URL complète Bungie) et **`categorie?`** (nom de la catégorie parente, pour l’œilleton et la recherche).
- **`src/lib/legendarium/modele.ts`** (⚠️ AJOUT) — `categoriesDeLegendes(db)` : lit l’arbre en UNE requête sur `DestinyPresentationNodeDefinition`, construit catégorie → livre → pages (titre = nom du Lore, texte = `displayProperties.description`, ordre du Manifest, couvertures, lores masqués exclus, lores sans corps exclus). `livresLegendes` aplatie cette hiérarchie en livres (pour la zone de lecture + l’ordre précédent/suivant). **REPLI** : si l’arbre est absent (Manifest vieilli), retombe sur l’ancien livre plat « Tomes de Légendes » (trié par titre). `ResultatRechercheLore` gagne `categorie?` ; la recherche cherche aussi dans le **titre du livre et le nom de la catégorie**. `HASH_RACINE_LEGENDES = 4077680549` exporté. Les hashes des nœuds viennent de la **colonne `id` SQLite** (toujours présente), pas du champ `hash` du JSON.
- **`src/components/Bibliotheque.tsx`** (⚠️ AJOUT) — nouveau sous-composant **`ArbreCategories`** : la colonne latérale de la section « Légendes D2 » affiche désormais les **catégories** (titre + icône) puis une **grille de tuiles-livres** (couverture 16:9 + titre + « N pages », tuile-titre si pas de couverture — pas d’image cassée). `ColonneSections` reçoit une prop `categories?` : présente → arbre, absente → liste plate (repli). `ZoneLecture` : l’œilleton affiche « catégorie · livre » et la **couverture du livre** s’affiche **en haut de la page** (comme l’écran d’ouverture d’un livre en jeu). `ResultatsRecherche` affiche la catégorie. **Les autres sections (Grimoire D1, armes et armures, cosmétiques) sont INCHANGÉES** (liste plate, pas de couverture) — comme demandé (« sauf armes et armures »).
- **Boutons de diagnostic dev CONSERVÉS** (demande de l’utilisateur) : `data-diagnostic-grimoire` + `data-diagnostic-lore` restent dans l’onglet Legendarium, `import.meta.env.DEV` uniquement (éliminés du build de production par Rollup).
- **Validation sur le VRAI Manifest FR** (hors-ligne, script de validation) : 4 catégories / 108 livres / 1 076 pages ; « Ces terres maudites » retrouvée dans « La Frontière sans foi ni loi » (14 pages) dans « La Lumière », couverture `https://www.bungie.net/common/destiny2_content/icons/bf2d9748f987ea1dd91d59f0d8dfe43c.png`, texte complet (1 341 caractères) ; recherche « ces terres maudites » → 1 résultat avec catégorie + livre ; lien profond OK ; perf ~15 ms par construction.
- **Tests** : `legendarium-modele` **78/78** (17 nouveaux suite 10 : hiérarchie fidèle au vrai Manifest — 2 catégories dans l’ordre, icônes, livre masqué exclu, 2 pages dans l’ordre, id `lore:<hash>` + texte, couverture URL Bungie, livre sans couverture, lore d’objet factice gardé en page, aplatissement en 3 livres, ordre de lecture aplati, lien profond, recherche par catégorie et par livre, **REPLI** sans arbre → liste vide + livre plat « Tomes de Légendes », sans Manifest → vide sans erreur) ; `legendarium-page` **45/45** (12 nouveaux : arbre catégories dans l’ordre, icône catégorie, tuiles-livres avec compteurs, couverture image + carré-titre sans couverture, aria-current sur la tuile active, ColonneSections arbre vs liste plate (repli), œilleton catégorie · livre, couverture en haut de page, inchangé pour les autres sections, recherche avec catégorie) ; `legendarium-fixtures` **18/18** ; `legendarium` **5/5** ; `legendarium-grimoire` **23/23** ; `cablage-forge` **25/25**. `tsc` zéro erreur, `npm run build` strict ✓ (bundle principal 1 892,75 kB, chunk grimoire séparé inchangé).

**Version inchangée (0.4.14).**

**À tester côté utilisateur** : `npm run dev` → Legendarium → section « Légendes D2 » → la colonne de gauche affiche les 4 catégories (L’Avant-garde, La Lumière, Crépuscule et aube, Les Ténèbres) avec une **grille de couvertures de livres** (cliquer ouvre le livre) ; ouvrir « La Frontière sans foi ni loi » (14 pages) → la couverture s’affiche en haut de la page, l’œilleton indique « La Lumière · La Frontière sans foi ni loi », et la première page est « Ces terres maudites ». Les sections Grimoire D1 / armes et armures / cosmétiques gardent leur liste plate. Les boutons de diagnostic dev restent en bas de page.

## 21/10/2026 (branche `draft-legendarium`, suite 9) — CORRECTION suite au diagnostic réel : le vrai Manifest utilise `loreHash` (pas `lore`) et `displayProperties.description` (pas `body`)

**Diagnostic de l'utilisateur (retourné, `data-diagnostic-lore`)** : `{ "tableLoreExiste": true, "nbLores": 3514, "nbLoresAvecCorps": 0, "tableObjetsExiste": true, "nbObjets": 38894, "nbObjetsAvecLore": 0, "nbObjetsAvecLoreLisible": 0 }` — la table `DestinyLoreDefinition` **existe** (3 514 entrées) et la table des objets aussi (38 894), mais **aucun objet ne porte le champ `lore`** et **aucun Lore n'a de champ `body`**. Le modèle lisait les mauvais noms de champs.

**Fait** :
- **`src/types/manifest.ts`** (⚠️ CHANGÉ) — `DestinyItemDefinition.lore?` → **`loreHash?`** (nom réel du champ Bungie) ; `DestinyLoreDefinition.body?` conservé en **secours** (le vrai texte vit dans `displayProperties.description`, structure standard `DestinyDisplayPropertiesDefinition`).
- **`src/lib/legendarium/modele.ts`** (⚠️ CHANGÉ) — deux helpers :
  - `hashLoreDe(def)` : lit **`loreHash`** (secours `lore` pour les anciennes fixtures) ;
  - `corpsLore(lore)` : lit **`displayProperties.description`** (secours `body`).
  Toutes les fonctions du modèle (`estPorteur`, `pageLoreObjet`, `aLore`, `indexPorteurs`, `loresLegendes`, `livresLegendes`, `diagnostiquerLore`) passent par ces helpers. **Aucun changement de comportement** côté interface : les pages gardent le même id (`lore:<hash>`), le même titre (nom de l'objet), le même sous-titre (`subtitle`).
- **Fixtures mises à jour** : `test-fixtures/manifest-mock.json` (12 items `lore` → `loreHash`, 24 Lores `body` → `displayProperties.description`, FR + EN) ; tests `legendarium-modele` et `legendarium-page` (helper `lore()` + items inline).
- **Tests** : `legendarium-modele` **61/61** (6 nouveaux : **régression suite 9** — structure exacte du vrai Manifest `loreHash` + `displayProperties.description` : `aLore` détecte, `pageLoreObjet` construit, livre « Lore des armes » peuplé, section Légendes lit le texte + sous-titre, `diagnostiquerLore` compte correctement, **rétrocompatibilité** `lore`/`body` conservée) ; `legendarium-page` **33/33** ; `legendarium-fixtures` **18/18** ; `legendarium` **5/5** ; `legendarium-grimoire` **23/23** ; `cablage-forge` **25/25**. `tsc` zéro erreur, `npm run build` strict ✓.

**Version inchangée (0.4.14).**

**À tester côté utilisateur** : `npm run dev` → le bouton « 📖 Lire le Lore » doit apparaître dans les fiches Détails (Inventaire, Coffre, Mon Build, Forge — Collection et Inventaire, armes et armures) sur les objets qui ont un Lore (ex. Izanagi's Burden, la plupart des exotiques). Le panneau « 🔍 Diagnostic Lores D2 » (dev) doit maintenant afficher des compteurs **non nuls** (`nbObjetsAvecLoreLisible > 0`). Le Legendarium doit aussi afficher du contenu dans les sections D2 (Légendes, Lore des armes, Ensembles d'armures, Cosmétiques).

## 21/10/2026 (branche `draft-legendarium`, suite 8) — ANNULATION du déplacement Carrière/Accomplissements (régression signalée) + diagnostic dev des Lores D2 (bouton « Lire le Lore » absent)

**⚠️ Annulé (régression signalée par l'utilisateur, suite 7)** :
- **`src/pages/DashboardPage.tsx`** — le déplacement des boutons « Carrière » et « Accomplissements » au-dessus du sélecteur de vue (hors du bloc Connexion) est **ANNULÉ** : l'utilisateur les a signalés comme sortis de la section « Connexion » **sans son accord**, et le fonctionnement dans Load-outs/Forge/Legendarium était toujours faux. Les boutons sont **remis dans le bloc Connexion**, exactement comme avant la suite 7. **Le bug « la pop-up ne s'ouvre pas hors Build Analyzer » reste OUVERT** : il est noté dans le TODO de **main** (§25), à traiter séparément avec l'accord de l'utilisateur.

**Fait** :
- **`src/lib/legendarium/modele.ts`** (⚠️ AJOUT) — `diagnostiquerLore(db)` + interface `DiagnosticLore` : diagnostic **dev uniquement** qui vérifie avec le VRAI Manifest si la table `DestinyLoreDefinition` existe, combien elle contient de Lores (avec/sans corps), et combien d'objets portent un champ `lore` lisible (avec 5 exemples hash+nom). Un seul balayage de la table des objets. Ne modifie rien, ne persiste rien. C'est la seule façon de savoir pourquoi le bouton « 📖 Lire le Lore » n'apparaît pas dans les fiches.
- **`src/components/Bibliotheque.tsx`** (⚠️ AJOUT) — panneau dev `<details data-diagnostic-lore>` dans l'onglet Legendarium (à côté du diagnostic Grimoire D1) : s'exécute une fois quand le Manifest est prêt, en `import.meta.env.DEV` uniquement (éliminé du build de production par Rollup). Résumé en une ligne + JSON complet à copier.
- **Tests** : `legendarium-modele` **55/55** (5 nouveaux : `diagnostiquerLore` — table Lore existe/2 Lores/1 avec corps, 4 objets/3 avec lore/1 lisible, exemple Izanagi, sans Manifest → null, table vide → 0) ; `cablage-forge` **25/25** (test Carrière/Accomplissements corrigé : boutons DANS le bloc Connexion, déplacement annulé). `tsc` zéro erreur, `npm run build` strict ✓.

**Version inchangée (0.4.14).**

**Conservé de la suite 7** (demandes explicites de l'utilisateur, non annulées) : la navigation « ← Précédent / Suivant → » **au-dessus et en-dessous** de la page de Lore (pas dedans) ; le bouton « 📖 Lire le Lore » dans la **pop-up Détails du Build Analyzer** (`SelecteurInventaire.tsx` + `onLireLore` câblé dans `DashboardPage`).

**À faire côté utilisateur** : `npm run dev` → onglet **Legendarium** → avec le Manifest chargé, copier le panneau **« 🔍 Diagnostic Lores D2 (dev, à copier à Claude) »** (`data-diagnostic-lore`) — il dira si la table `DestinyLoreDefinition` existe dans le vrai Manifest et combien d'objets portent un `lore` lisible.

## 21/10/2026 (branche `draft-legendarium`, suite 7) — RETOURS UTILISATEUR : nav Précédent/Suivant au-dessus/en-dessous de la page + bouton « Lire le Lore » dans la pop-up Détails du Build Analyzer + boutons Carrière/Accomplissements globaux

**Fait** :
- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ) — la navigation « ← Précédent / Suivant → » est désormais **AU-DESSUS et EN-DESSOUS** de la page de Lore (deux barres centrées `data-nav-haut` / `data-nav-bas`), **PAS DANS** la page (demande de l'utilisateur). Mêmes boutons, mêmes attributs (`data-nav-precedente`/`data-nav-suivante`), même style (palette de l'ère). La barre du bas est placée après le parcours inverse.
- **`src/components/SelecteurInventaire.tsx`** (⚠️ CHANGÉ) — la pop-up « Détails » du **Build Analyzer** (Mon Inventaire, Coffre, Mon Build) gagne le bouton « 📖 Lire le Lore » : prop `onLireLore?` sur le composant et sur `LigneObjet` (4 usages), composant `BoutonLireLore` rendu en haut de popup, justifié à droite, sous la croix, uniquement si l'objet a un Lore.
- **`src/pages/DashboardPage.tsx`** (⚠️ CHANGÉ) — `onLireLore={ouvrirLoreDepuisObjet}` passé à `SelecteurInventaire` (même action que les fiches de la Forge : lien profond `item:<hashObjet>` + provenance `origine: "analyseur"`).
- **`src/pages/DashboardPage.tsx`** (⚠️ CORRIGÉ, retour utilisateur) — les boutons « Carrière » et « Accomplissements » ne s'ouvraient pas hors Build Analyzer : ils étaient rendus dans le bloc Connexion, **masqué** (`display: none`) quand la vue analyseur n'est pas active. `BoutonsVuesCompte` est déplacé **au-dessus du sélecteur de vue** (`SelecteurVues`), une seule fois, visible et cliquable dans **TOUTES** les vues (Load-outs, Forge, Legendarium). Le bug est aussi noté dans le TODO de **main** (§25).
- **Tests** : `legendarium-page` **33/33** (4 nouveaux : nav `data-nav-haut` avant l'œilleton, `data-nav-bas` après le texte/parcours inverse, 2× les mêmes boutons, barres centrées) ; `cablage-forge` **25/25** (4 nouveaux : `onLireLore` branché sur `SelecteurInventaire` + 4 `LigneObjet`, `BoutonLireLore` rendu dans la popup, `ouvrirLoreDepuisObjet` aiguille vers `bibliotheque`, `BoutonsVuesCompte` global une seule fois avant `SelecteurVues`). `tsc` zéro erreur.

**Version inchangée (0.4.14).**

**⚠️ Reste à investiguer côté utilisateur** : le bouton « Lire le Lore » n'apparaît pas dans la **Forge** (alors que la prop est bien passée par `PageForge` aux 4 fiches) — tester en `npm run dev` avec un objet possédant un Lore (ex. Izanagi's Burden) dans l'Inventaire/Collection de la Forge.

**À tester côté utilisateur** : `npm run dev` → (1) Legendarium : les boutons Précédent/Suivant sont au-dessus et en-dessous de la page, pas dedans ; (2) Build Analyzer → Inventaire/Coffre/Mon Build → Détails d'un objet avec Lore → le bouton « 📖 Lire le Lore » apparaît sous la croix ; (3) dans Load-outs, Forge ou Legendarium, les boutons « Carrière » et « Accomplissements » s'ouvrent bien.

## 21/10/2026 (branche `draft-legendarium`, suite 6) — ÉTAPE 5 FAITE : bouton « Lire le Lore » dans les 4 fiches Détails + lien profond fiche → Legendarium + retour vers l'objet

**Fait** :
- **`src/components/BoutonLireLore.tsx`** (⚠️ AJOUT) — composant PUR (pas d'état, pas d'effet) : rend une ligne justifiée à droite (`data-ligne-lire-lore`) avec le bouton « 📖 Lire le Lore » (`data-bouton-lire-lore`, `data-item-hash`) UNIQUEMENT si l'objet a un Lore lisible. Clic : remonte l'action `onLireLore(itemHash, nomObjet)`.
- **`src/lib/legendarium/modele.ts`** : ⚠️ AJOUT `aLore(db, itemHash)` — lecture LÉGÈRE (2 définitions ciblées : objet + Lore, AUCUN balayage de la table des objets) pour le bouton. Appelée à chaque rendu de fiche ouverte : elle reste bon marché (test de comptage des requêtes : 0 balayage).
- **Les 4 fiches Détails** (`InventaireArmes.tsx`, `InventaireArmures.tsx`, `CollectionArmes.tsx`, `CollectionArmures.tsx`) : prop `onLireLore?` + le bouton placé EN HAUT DE FICHE, JUSTIFIÉ À DROITE, SOUS LA CROIX de fermeture (spécification verrouillée §6).
- **`src/components/PageForge.tsx`** : prop `onLireLore?` remontée, passée aux 4 fiches (Collection + Inventaire, armes + armures).
- **`src/pages/DashboardPage.tsx`** : ⚠️ AJOUT — lien profond fiche → Legendarium (piste (a) de la spécification : bascule de vue interne, état en mémoire, PAS de route React Router, aucune persistance). `ouvrirLoreDepuisObjet(itemHash, nomObjet)` mémorise `cibleLegendarium = { pageId: "item:<hashObjet>", provenance: { itemHash, nomObjet, origine: vue } }` et bascule sur la vue `bibliotheque` ; `retourDepuisLegendarium()` restaure la vue d'origine (les vues restent MONTÉES, rien n'est perdu). `<Bibliotheque db={db} pageCible={...} provenance={...} onRetourObjet={...} />` — les props étaient déjà câblés dans la page (étape 2) : la forme `item:<hashObjet>` est résolue par `trouverPage` vers la page dédoublonnée `lore:<hashLore>` ; le bouton « ← Retour vers <objet> » ramène à la fiche.
- **Tests** : `legendarium-modele` **50/50** (7 nouveaux : `aLore` VRAI/FAUX pour Izanagi, sans lore, masquée, factice, sans Manifest, hash inconnu, lore sans corps + AUCUN balayage de la table) ; `legendarium-page` **29/29** (5 nouveaux : bouton rendu avec lore (ligne flex-end + `data-bouton-lire-lore` + `data-item-hash` + infobulle), RIEN rendu sans lore / lore vide / sans Manifest) ; `cablage-forge` **21/21** (regex assouplie : la prop `onLireLore` est passée aux 2 vues Collection). `legendarium` **5/5**, `legendarium-fixtures` **18/18**, `legendarium-grimoire` **23/23**. `tsc` zéro erreur, `npm run build` strict ✓ (le chunk `grimoire-*.js` 935 Ko reste séparé).

**Version inchangée (0.4.14).**

**À tester côté utilisateur** : `npm run dev` → ouvrir une fiche Détails (Inventaire ou Collection, armes ou armures) sur un objet AVEC du Lore (ex. Izanagi's Burden) → le bouton « 📖 Lire le Lore » apparaît en haut de fiche, justifié à droite, sous la croix → clic → le Legendarium s'ouvre DIRECTEMENT sur la page de Lore de l'objet → le bouton « ← Retour vers <objet> » ramène à la vue d'origine. Les objets SANS Lore n'affichent aucun bouton.

## 21/10/2026 (branche `draft-legendarium`, suite 5) — ÉTAPE 2 FAITE : la page LEGENDARIUM remplace le panneau « en construction » (trois zones, palette Parchemin/Hologramme, navigation, recherche) ; le Grimoire D1 est LISIBLE (repli statique embarqué, 6 livres / 834 cartes FR, hors-ligne) ; index des porteurs en UN SEUL balayage**Fait** :- **`src/components/Bibliotheque.tsx`** (⚠️ CHANGÉ, réécrit) — les TROIS ZONES de la spécification verrouillée §4 : bandeau (titre « Legendarium » + recherche par mots-clés TOUJOURS ACCESSIBLE + indicateur de cache Manifest) ; colonne latérale (les 4 sections DANS L'ORDRE GLOBAL VERROUILLÉ : Grimoire D1 → Légendes D2 → Armes et armures → Cosmétiques et utilitaires, puis les livres de la section active avec leur nombre de pages) ; zone de lecture (œilleton = titre du livre, titre de la page, sous-titre, libellé chronologique quand connu, texte, navigation « ← Précédent / Suivant → » désactivée aux extrémités). **Palette verrouillée §5** appliquée à la zone de lecture : ère `d1` = parchemin (serif, ivoire, fond #2b2116, bordure #8a6d3b) pour le Grimoire D1, ère `d2` = hologramme (sans-serif, cyan, fond #0d1520, bordure #1e3a5f, lueur) pour tout le reste. **Parcours inverse** : la page liste les objets porteurs du Lore (rééditions comprises). **Bouton de retour vers l'objet** quand la page a été atteinte depuis une fiche Détails (provenance transitoire, jamais persistée) — branchement étape 5 préparé (`pageCible` / `provenance` / `onRetourObjet`). **Recherche** : résultats cliquables (section · livre · chapitre), plafond 50 affichés. **LECTURE PASSIVE** : état en mémoire uniquement (section, page, mot-clé) — aucune persistance, aucune écriture, aucun impact sur le scoring.- **Le Grimoire D1 est LISIBLE** : `lireGrimoire()` (import **dynamique**) lit l'API legacy, retombe sur le **repli statique embarqué** (6 livres / 834 cartes FR, `src/data/grimoire-d1-repli.json`) — l'API D1 de Bungie ne sert plus de contenu (diagnostic du 21/10, suite 4). Le chunk `grimoire-*.js` (~935 Ko) est chargé À L'OUVERTURE de la page, hors du bundle principal (1 886 Ko, quasi inchangé) — l'appli démarre aussi vite qu'avant. Hors-ligne OK.- **Sections D2** depuis le Manifest via le cache existant (`livresDeSection`) : Légendes (Tomes de Légendes), Lore des armes + Ensembles d'armures (règle verrouillée classe → casque → gants → torse → jambes → objet de classe), Cosmétiques (Spectres, Vaisseaux, Passereaux).
- ⚠️ **REFACTOR PERF** (`src/lib/legendarium/modele.ts`) : INDEX des porteurs de Lore construit en **UN SEUL balayage** de la table `DestinyInventoryItemDefinition`, mis en cache par base (WeakMap). Avant : `livresObjets`/`livreCosmetiques` appelaient `pageLoreObjet` pour CHAQUE porteur, et chaque appel re-balayait la table via `porteursDeLore` — des milliers de balayages sur le vrai Manifest (~60 000 objets), la page aurait figé. Après : 1 balayage pour toute la bibliothèque (test de comptage des requêtes).
- **Tests** : `legendarium-page` **24/24** (⚠️ NOUVEAU — les 3 zones, l'ordre global verrouillé, la palette d1/d2, prev/next désactivés aux extrémités, le parcours inverse, le bouton de retour, la recherche + plafond 50, aucun résidu « en construction ») ; `legendarium-modele` **43/43** (2 nouveaux : 1 seul balayage + contenu identique) ; `legendarium` **5/5** ; `legendarium-fixtures` **18/18** ; `legendarium-grimoire` **23/23**. `tsc` zéro erreur, `npm run build` strict ✓.**Version inchangée (0.4.14).****À tester côté utilisateur** : `npm run dev` → onglet Legendarium → le Grimoire D1 s'affiche (6 livres, 834 cartes, parchemin) même SANS Manifest ; avec le Manifest chargé, les sections D2 apparaissent ; recherche, navigation précédent/suivant, parcours inverse.

## 21/10/2026 (branche `draft-legendarium`, suite 4) — DIAGNOSTIC RETOURNÉ : l'API D1 répond 200 AVEC la clé mais SANS CONTENU (0 livre, 0 carte) → REPLI STATIQUE ACTIVÉ (6 livres / 834 cartes FR embarqués)**Retour de l'utilisateur (diagnostic copié depuis `npm run dev`, onglet Legendarium)** : `{"clePresente":true,"statutHttp":200,"ok":true,"livres":0,"cartes":0}` — la clé de l'appli est ACCEPTÉE par Bungie, mais l'API legacy D1 ne sert PLUS aucun contenu Grimoire (Bungie a retiré le Grimoire de l'API D1). **Décision actée** : le repli statique prévu par la spécification §2 est ACTIVÉ.**Fait** :- **Source** : The Grimoire Archive (`aureliendossantos/destiny-grimoire`, maintenu) embarque les définitions D1 OFFICIELLES de Bungie (manifest D1, 2018) en 7 langues. Export français retenu : **834 cartes**, structure officielle (6 livres → chapitres → cartes). Cohérence vérifiée : 834 cardBriefs = 834 cartes, 0 manquante, 0 orpheline, 0 sans texte, 0 doublon.- **`scripts/generer-repli-grimoire.mjs`** (⚠️ AJOUT) : génère `src/data/grimoire-d1-repli.json` depuis le dépôt GitHub (`--branche`) ou un clone local (`--depuis`). Nettoie le HTML Bungie (balises → texte, entités décodées), joint cartes ↔ chapitres via les `cardBriefs`, APLATI en `LivreLore[]` (le sous-titre de chaque page = nom du chapitre, comme `convertirGrimoire`). Texte uniquement, AUCUNE image. Sortie minifiée (930 Ko, même ordre que `saisons-objets.json` 928 Ko). Refuse de générer un repli vide ou incohérent (erreur si carte manquante ou cardId en double).- **`src/data/grimoire-d1-repli.json`** (⚠️ AJOUT, versionné) + **`src/data/grimoire-d1.ts`** (⚠️ AJOUT, wrapper typé, pattern identique à `saisons.ts`) : 6 livres DANS L'ORDRE OFFICIEL (Gardiens → Inventaire → Alliés → Ennemis → Lieux → Activités), 834 cartes `grimoire:<idCarte>` uniques, provenance tracée (`source`, `sourceNote`, `langue: "fr"`). AUCUN téléchargement au runtime : l'appli fonctionne hors-ligne.- **`src/lib/legendarium/grimoire.ts`** : ⚠️ CHANGÉ — `REPLI_GRIMOIRE_STATIQUE` alimenté (`[...REPLI_GRIMOIRE]` du wrapper) ; un HTTP 200 SANS contenu (0 livre/0 carte, ou aucune carte avec texte) retombe désormais sur le repli **peuplé** (c'était déjà le cas, le repli était juste vide) ; `DiagnosticGrimoire` gagne `contenuVide` (200 + clé OK + 0 contenu = constat réel) et `repliLivres`/`repliCartes` (ce que l'utilisateur verra).- **`src/components/Bibliotheque.tsx`** : le panneau dev affiche désormais « ⚠️ API vide (HTTP 200, clé OK) → repli statique : 6 livre(s), 834 carte(s) » quand `contenuVide` est vrai.- **Tests** : `legendarium-grimoire` **23/23** (8 nouveaux : 200-avec-themeCollection-vide → repli peuplé, 200-avec-livre-sans-cartes → repli peuplé 6/834, diagnostic `contenuVide` marqué + repli compté, diagnostic clé OK `contenuVide` faux, repli = 6 livres dans l'ordre officiel, 834 cartes toutes avec texte, ids uniques au format `grimoire:<id>`, 0 résidu HTML, sous-titre = chapitre, lecture seule). `legendarium.test.tsx` **5/5**, `legendarium-modele` **41/41**, `legendarium-fixtures` **18/18**. `tsc` zéro erreur, `npm run build` strict ✓.**Version inchangée (0.4.14).****Note bundling** : en production, le bloc diagnostic (`import.meta.env.DEV`) est éliminé par Rollup (dead code) → le JSON de repli n'est PAS dans le bundle tant que l'étape 2 (page Legendarium) n'importe pas `lireGrimoire()`. À l'étape 2, prévoir un `import()` dynamique pour isoler les 930 Ko dans un chunk chargé à l'ouverture du Legendarium.

## 22/10/2026 (push intermédiaire depuis `draft-legendarium`, suites 7-15) — CORRECTIF `saisonDeLObjet` (hash signé/non signé) + TODO §25 (boutons Carrière/Accomplissements) + .gitignore artefacts de tests

**Contexte** : l'utilisateur a demandé un push intermédiaire sur `main` avant de continuer le chantier Legendarium. Audit de `draft-legendarium` vs `main` : le diff ne contient **QUE** du Legendarium (page, modèle, tests, spec, CHANGELOG/TODO §26) **SAUF** trois éléments transversaux, poussés ici isolément :

- **⚠️ CORRECTIF RÉEL — `src/data/saisons.ts` `saisonDeLObjet()`** (découvert et validé sur le VRAI Manifest le 22/10, suite 11 du Legendarium) : le JSON de DIM (`saisons-objets.json`, 57 439 entrées) stocke les hashes d'objets en **NON SIGNÉ 32 bits** (ex: 2147961687), mais les hashes du Manifest (colonne `id` SQLite, champ `hash` des définitions) sont **SIGNÉS** (ex: -2147005609). La fonction ne testait que la forme signée : **~50 % des objets (hash > 0x7FFFFFFF, ~29 000 entrées) ne trouvait JAMAIS sa saison** via cette table. Conséquence visible sur `main` : dans **Recherche dans le Manifest** (Build Analyzer), la ligne « Saison de sortie » manquait pour ces objets (ex: la Mesure corrective) ; dans l'infobulle `IconeSaison`, le nom de saison manquait aussi. **Corrigé** : les DEUX formes sont testées (hash tel quel, puis `itemHash >>> 0`). Aucun changement de comportement pour les hashes positifs. Tests : `saisons-sources` 17/17 → **20/20** (3 nouveaux : hash négatif résout via forme non signée, hash positif direct, hash négatif absent reste `undefined`).
- **`TODO.md` §25** (nouvelle section, après §24) : **boutons « Carrière » / « Accomplissements » — la pop-up ne s'ouvre pas hors Build Analyzer** (retour utilisateur 21/10, branche `draft-legendarium`). Diagnostic : les boutons sont rendus dans le bloc Connexion, **masqué** (`display: none`) hors vue Build Analyzer. Piste de correction (à valider en `npm run dev`) : déplacer `BoutonsVuesCompte` au-dessus du sélecteur de vue. **⚠️ Reporté depuis `draft-legendarium`** (la correction elle-même reste à faire, avec l'accord de l'utilisateur — une première tentative de déplacement a été annulée comme régression).
- **`.gitignore`** : ajout de `tests/logique/_sortie/` et `tests/ui/_sortie/` (artefacts esbuild du lanceur de tests et de la construction des pages UI de test — ne pas versionner).

**Vérifié** : `tsc -b` zéro erreur, `npm run build` strict ✓, `npm run test:logique` **30/30 suites, 433/433 contrôles** (dont `saisons-sources` 20/20). Aucun code Legendarium dans ce push.

## 21/10/2026 (suite 6) — LIVRAISON : PR #9 et PR #10 mergées dans `main`, propagées aux branches de chantier

**Livraison du problème initialement traité sur cette conversation** (les deux échecs de la batterie logique, « préexistants sur main ») :

- **PR #9** « Batterie logique au vert » mergée dans `main` (`d8d7212`) : `icones` 11/11 (snapshot obsolète régénéré) + `reproductibilite-visuels` 7/7 (4 SVG « Optimisation » intégrés, catalogue `forgeAssets.ts` repris depuis l'archive, 77 → 81 actifs).
- **PR #10** « CI GitHub Actions » mergée dans `main` (`743d273`) : workflow `.github/workflows/ci.yml` (npm ci → tsc -b → npm run build → npm run test:logique), lanceur `scripts/test-logique.mjs` + `npm run test:logique`.
- **Vérifié avant merge** : les deux branches en local — `tsc -b` zéro erreur, `npm run build` strict ✓, `npm run test:logique` **30/30 suites, 430/430 contrôles**. Check CI GitHub Actions vert sur la PR #10 (2 runs SUCCESS). Note : la PR #9 n'a pas de check CI (le workflow n'existait pas encore sur sa branche au moment de son push) — sa vérification est le run local ci-dessus + la batterie rejouée sur `main` après merge.
- **Propagation aux branches de chantier** (coutume du dépôt, comme pour le correctif barre Forge) : `test`, `draft-legendarium`, `draft-armure-score`, `draft-deps`, `draft-netlify`, `draft-sec` — merge de `main` dans chacune, poussées. `draft-legendarium` avait un conflit dans `CHANGELOG.md` (deux entrées en tête) : résolu en gardant les deux blocs (entrées de la branche d'abord, puis les entrées `main` suite 5 + suite 4). Les 5 autres branches : merge propre.
- **PR #9 et PR #10** : passées en « ready for review » avant merge. **Branches de travail** `vibe/fix-tests-icones-reproductibilite-97f9fd` et `vibe/ci-batterie-logique-97f9fd` : laissées en place (leur contenu est dans `main` via les merges ; suppression à la main de l'utilisateur, comme pour `vibe/forge-barre-regression-ae0c65`).
- **Protection de branche** : toujours **aucune** sur `main` (vérifié via l'API GraphQL : `branchProtectionRule: null`). Le ruleset créé par l'utilisateur n'est **pas appliqué** (plan gratuit + dépôt privé sur compte perso : GitHub exige Pro/Team). La CI s'affiche sur les PR mais ne bloque aucun merge. Piste gratuite : la **branch protection classique** (Settings → Branches → Branch protection rules, pas « Rulesets ») fonctionne sur ce plan — cocher « Require status checks to pass » avec le check `tsc + build + batterie logique`.
- **État final** : batterie logique **100 % au vert** (30/30 suites, 430/430 contrôles) sur `main` et sur les 6 branches de chantier ; CI opérationnelle pour les prochains push/PR.

## 21/10/2026 (suite 5) — CI GitHub Actions : tsc + build strict + batterie logique automatisées

Le dépôt n'avait **aucun** workflow (vérifié : 0 workflow GitHub Actions, aucun check sur les PR) : toutes les vérifications étaient manuelles. Ajout d'une CI qui rejoue la routine à chaque push et chaque PR :

- **`.github/workflows/ci.yml`** : job `logique` sur `ubuntu-latest`, Node 22, cache npm sur le lockfile :
  1. `npm ci` (installation reproductible)
  2. `npx tsc -b` (compilateur strict)
  3. `npm run build` (build strict complet)
  4. `npm run test:logique` (les 30 suites, 430 contrôles)
- **`scripts/test-logique.mjs`** (nouveau) + **`npm run test:logique`** : lanceur qui rejoue **toutes** les suites de `tests/logique/` une par une via le lanceur existant (`lancer.mjs`, esbuild + Node), affiche un ✅/❌ par suite avec son bilan, nettoie `_sortie/`, et sort en code 1 si UNE suite échoue (les autres continuent). Utilisable en local comme en CI.
- **Non couvert par la CI** : les tests d'interface Playwright (`tests/ui/*.py`) — ils ont besoin d'un navigateur, ils restent à rejouer manuellement (même limite que les sandbox précédentes, documentée dans les entrées du 21/10).

**Vérifié** : `npm run test:logique` en local → 30/30 suites, 430/430 contrôles, exit 0 ; avec une casse volontaire dans `icones.test.tsx` → 29/30, exit 1, la ligne en échec affichée (garde-fou exercé) ; `tsc -b` zéro erreur ; `npm run build` strict ✓ ; YAML du workflow validé. **À noter** : la CI ne démarre qu'au prochain push de cette branche — le premier run confirmera le workflow en conditions réelles. La protection de branche n'a pas pu être vérifiée via l'API (403, droits insuffisants) : si `main` est protégée avec « require status checks », il faudra ajouter le check `logique` dans les checks requis (Settings → Branches).

## 21/10/2026 (suite 4) — batterie logique AU VERT : `icones` 11/11 et `reproductibilite-visuels` 7/7

Les deux derniers échecs de la batterie de logique sont corrigés ; les 30 suites passent (aucun échec).

- **`icones` 10/11 → 11/11 (test obsolète, code inchangé)** : le snapshot `tests/logique/instantanes/icones.json` attendait un `<link rel="preload">` devant l'icône d'élément officielle — un tag qu'aucun commit du dépôt n'a jamais émis (vérifié sur tout l'historique). Le rendu actuel (`<img>` seul, `src/components/icones/IconeElement.tsx`) est correct ; un `<link rel="preload">` émis dans le corps serait de toute façon déplacé (le preload appartient au `<head>`). Le snapshot est régénéré depuis le rendu actuel : seule l'entrée `element:officielle` change (le `<link>` disparaît), les 9 autres entrées sont identiques octet pour octet — le partage des tracés n'avait donc bien rien changé, comme le test l'attendait.
- **`reproductibilite-visuels` 6/7 → 7/7 (intégration des visuels « Optimisation »)** : le commit `406b2cf` (« Ajout icone optimisation ») avait livré les 4 SVG dans l'archive de référence (`ressources-installateur/forge-armory/app-assets/`) et son catalogue, mais pas côté appli. Intégration faite : les 4 fichiers copiés dans `public/assets/` (identiques octet pour octet à l'archive, sha256 vérifiés) et catalogue `src/data/forge/forgeAssets.ts` repris tel quel depuis `forgeAssets.ts` de l'archive (77 → 81 actifs ; les deux fichiers sont désormais identiques octet pour octet, comme à l'intégration v7). Les entrées `selecteur.optimisation.*` (4316 × 1024) et `icones.optimisation[.selectionne]` (1024 × 1024) suivent l'ordre du `manifest.json`. Aucun composant ne consomme encore ces visuels : « Optimisation » sera branché plus tard, les fichiers sont prêts.

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓ ; batterie logique complète **30/30 suites, 100 % des contrôles** (`icones` 11/11, `reproductibilite-visuels` 7/7, `visuels` 20/20, `legendarium` 5/5, `teinte-icones` 14/14, et les 25 autres inchangées). **Non rejoué ici** : les tests d'interface Playwright (pas de navigateur dans cette sandbox — même limite documentée dans les entrées précédentes).

## 21/10/2026 (suite 3) — RÉGRESSION CORRIGÉE : barre de la Forge (boutons Armes/Armures en double, Collection/Inventaire vides)

**Retour de l'utilisateur** (capture du zip de la branche main) : « Les boutons Armes et Armures apparaissent deux fois (ceux que j'ai entourés de rouge ne devraient pas être là). De plus ils sont vides, sans logo. Les boutons Collection et Inventaire sont absents, il n'y a que leur encart. C'est une vraie régression ! »

**Cause** : le commit du 19/10 (« barre de boutons Forge (logos v5) ») AVAIT AJOUTÉ les boutons logo Armes/Armures dans la barre du haut SANS RETIRER les anciens boutons « pills » Armes/Armures présents dans chaque panneau (Collection et Inventaire) : chaque partie apparaissait donc DEUX FOIS. Sur la capture, les deux grands boutons vides à gauche sont les boutons stylisés « Collection » et « Inventaire » (leurs images ne se chargeaient pas dans le zip : le dossier `assets` n'était pas embarqué tel quel), et les pills entourés en rouge sont les doublons.

**Corrigé** dans `src/components/PageForge.tsx` :
- Les groupes de pills « Armes / Armures » sont RETIRÉS des deux panneaux (`data-choix-objet`, `data-choix-objet-collection`, `data-objet`, `data-objet-collection` supprimés). La barre du haut — « Collection », « Inventaire » (boutons stylisés), séparateur vertical, « Armes », « Armures » (logos v5 `icones.armes` / `icones.armures`) — est le SEUL sélecteur de la vue ET de la partie ; elle aiguille les deux (un clic sur « Armures » bascule la partie de la vue active et la monte à la demande). Le comportement par vue est conservé (rien ne se recharge en changeant).
- Les boutons logo portent `data-objet-logo` ; les tests d'interface cliquent désormais ces boutons.

**Tests** : `cablage-forge` mis à jour (21/21 : la barre est le seul sélecteur, les attributs des pills sont absents du code) ; `tests/ui/forge.py`, `forge-armures.py`, `forge-collection-armures.py` mis à jour (clics sur les boutons logo `data-objet-logo`, nouveaux contrôles : AUCUN bouton pill dans les panneaux, logos `icone-armes.svg` / `icone-armures.svg` chargés, séparateur présent).

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓ ; batterie logique 29/30 séries (le seul échec, `icones` 10/11, est PRÉEXISTANT et documenté depuis la 0.4.14) — dont `cablage-forge` 21/21, `visuels` 20/20, `reproductibilite-visuels` 7/7, `armure-forge` 22/22. **Non rejoué ici** : les tests d'interface Playwright (pas de navigateur dans cette sandbox — même limite documentée dans les entrées précédentes) ; ils sont prêts à être rejoués (`python3 tests/ui/forge.py`, `forge-armures.py`, `forge-collection-armures.py`). **À contrôler par l'utilisateur** : rouvrir la Forge dans le zip de main : une seule paire Armes/Armures (avec les logos épée/bouclier), Collection et Inventaire affichés normalement.

**Livraison** : ce correctif a été mergé dans `main` (`73d6f4e`, PR #8) après validation en `npm run dev` par l'utilisateur (RAS : une seule ligne, pas de doublon), puis propagé par merge de `main` dans toutes les branches de chantier (`draft-legendarium`, `draft-armure-score`, `draft-deps`, `draft-netlify`, `draft-sec`, `test`). La branche de travail `vibe/forge-barre-regression-ae0c65` est supprimée (son contenu est dans `main`).

## 21/10/2026 (suite 2) — requête des stats « Carrière » CORRIGÉE sur données réelles : GetHistoricalStatsForAccount

**Retour réel de l'utilisateur** (diagnostic « statIds retournés », `npm run dev`) : « statIds retournés : AUCUN ; requête : GET /Destiny2/Stats/GetHistoricalStats/4611686018433066369/0/?periodType=AllTime&mode=None&groups=General,Medals ; erreur : 404 ». **C'est exactement le soupçon documenté dans l'entrée du 21/10 (suite)** : la route appelée n'existe pas — le 404 renvoyait une page d'erreur XHTML, pas une réponse Bungie. La correction suit la démarche prévue par la spécification : figer la lecture sur des données réelles.

**Corrigé** dans `src/lib/bungie/carriere.ts` :
- **Route** : `GetHistoricalStatsForAccount` — `/Destiny2/{membershipType}/Account/{membershipId}/Stats/` (UNE requête, tous personnages fusionnés, l'équivalent exact du filtre « Carrière » des Emblèmes du jeu ; `periodType`/`groups` ne sont pas des paramètres de cette route).
- **Structure** : la réponse porte les stats dans **`mergedAllCharacters`** (une clé par statId, chaque entrée avec `statId` + `allTime.basic/precision`), pas dans `metrics` — la lecture et le type sont mis à jour.
- **Diagnostic** : la ligne « entrées de metrics » devient « entrées de mergedAllCharacters ».

**Tests alignés sur la vraie route** : `diagnostic-carriere.test.ts` (chemin et libellés), le réseau simulé de `entree-modale-carriere.tsx` (mock de la vraie route et de `mergedAllCharacters`) et les attentes de `modale-carriere.py`.

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓ ; `diagnostic-carriere` 6/6 ; `carriere-large` 19/19. **À contrôler par l'utilisateur** : rouvrir la fenêtre « Carrière » — les statistiques doivent maintenant se remplir ; si un statId affiché reste « non disponible », le diagnostic liste les statIds réellement retournés pour figer la sélection (démarche prévue), et `statIdsCarriere` repassera à `false` une fois la liste validée.

## 21/10/2026 (suite) — fenêtre « Carrière » : bouton à droite du titre, diagnostic qui s'ouvre, partie « Compte » supprimée, icônes de classes

**Demandes de l'utilisateur** : (1) « Dans la pop-up "Carrière", le bouton "Accomplissements" doit être affiché à droite du titre "Carrière" et non en bas de pop-up. » (2) « Le diagnostic statsID retournés ne s'ouvre pas. » (3) « Dans la même pop-up, la partie "Compte" peut disparaître. » (4) « Utilise les assets d'icônes de classes de personnages. » **Version inchangée (0.4.14).**
**Fait** :
- **Bouton à droite du titre** : `Modale` reçoit une propriété FACULTATIVE `apresTitre`, placée immédiatement à droite du titre dans l'en-tête (la croix reste à l'extrême droite). Sans elle, l'en-tête est EXACTEMENT celui d'avant : les trois autres fenêtres ne changent pas. Le bouton est le même composant que dans le bloc Connexion (`BoutonVue`, exporté, avec une hauteur au choix : 2 rem ici, comme avant) ; il n'y a plus de bouton en bas de la fenêtre. **Effet visible** : il utilise le cadre 4897 × 1024 (`bouton-vue--large`) au lieu du cadre 4316 qui le réduisait de 12 % : même hauteur, dessin un peu plus grand.
- **Diagnostic « statIds retournés »** : c'était un bouton qui copiait la liste dans un texte puis l'affichait seulement si ce texte n'était pas vide. Quand la liste était vide (requête de statistiques en échec), le texte était vide : **rien ne s'affichait**, et l'ERREUR de la requête était AVALÉE par un `catch` vide dans `chargerCarriere`. Maintenant : bouton à bascule (`aria-expanded`, ▼ / ▲) qui s'ouvre ET se ferme ; son contenu s'affiche TOUJOURS : nombre de statIds (ou « AUCUN »), la liste, la requête appelée, **l'erreur de la requête** (conservée), les clés de premier niveau de la réponse, le nombre d'entrées de « metrics » (ou « champ absent »), les historiques d'activités en échec. Nouvelle fonction `formaterDiagnosticCarriere` ; nouveau champ `diagnostic` dans `DonneesCarriere`. Toujours réservé au mode développement.
- **Partie « Compte » supprimée** (pseudo Bungie, plateformes liées, date de première connexion) ; les propriétés `memberships` et `nomBungie` de la fenêtre sont retirées, de la fenêtre comme de l'appel dans `DashboardPage` (le pseudo reste affiché dans le bloc Connexion).
- **Icônes de classes** : le composant `IconeClasse` du reste de l'appli (mêmes tracés et couleurs : Titan rouge, Chasseur bleu, Arcaniste jaune) devant chaque classe de « Temps de jeu » et de « Personnages ». Une classe inconnue n'a pas d'icône. Au passage, la clé des lignes de « Temps de jeu » tient compte de l'indice (deux personnages de même classe produisaient deux clés identiques).
**Vérifié** : batterie complète **44 séries sur 46, 816 contrôles sur 819** ; les 2 séries en échec sont **celles d'avant** (`forge` 52/54 et `manifest-demarrage` 17/18). **Rejoué le 21/10 (sandbox Vibe, tests de logique seuls)** : `tsc` zéro erreur ; `npm run build` strict ✓ ; côté logique 29 séries sur 30, 429/430 contrôles — le seul échec est `icones` 10/11, **préexistant et documenté depuis la 0.4.14** (les tests d'interface, dont `modale-carriere.py` et `connexion-boutons.py`, ne tournent pas dans cette sandbox : ils restent à rejouer avec la batterie complète) ; `diagnostic-carriere` 6/6 ; `carriere-large` 19/19 ; `reproductibilite-visuels` 7/7. `modale-carriere.py` **16/16** (dans un vrai navigateur, réseau simulé : bouton dans l'en-tête, à moins de 40 px à droite du titre, avant la croix, sur la même ligne, au-dessus du contenu, un seul bouton ; 32 px de haut au ratio de son image ; ni « Compte » ni pseudo ni plateformes ; icônes de classes d'après les vrais tracés de `IconeClasse` ; clic ; diagnostic absent hors mode développement ; diagnostic qui s'ouvre, se referme, et qui dit POURQUOI quand la requête échoue ; autres fenêtres inchangées) ; `diagnostic-carriere.test.ts` **6/6**. **Neuf casses volontaires toutes détectées** (bouton hors de l'en-tête, « Compte » réintroduit, icônes retirées, diagnostic qui ne se referme plus, ancien texte muet, erreur de nouveau avalée, AUCUN supprimé, fenêtre générique modifiée pour toutes, `nomBungie` repassé).
**Défauts de MON travail, rattrapés** : un commentaire JSX placé avant l'élément racine rendait le fichier invalide (détecté par la vérification de syntaxe) ; mon premier contrôle du code source lisait aussi les commentaires (qui citent « première connexion ») et ne savait pas lire l'appel dans la page (les `=>` interrompaient son expression) ; deux de mes contrôles plantaient au lieu d'échouer quand le bouton manquait (lecture de mesures d'un bouton absent, clic attendant 30 s).
**NON vérifié, À CONTRÔLER avec le diagnostic réel** : je n'ai pas pu interroger Bungie. Les statistiques de la fenêtre affichent peut-être « non disponible » pour une raison précise que le diagnostic va maintenant dire. **Soupçon, non vérifié** : le chemin appelé (`/Destiny2/Stats/GetHistoricalStats/{id}/0/…`) ne ressemble pas, d'après mes souvenirs de l'API Bungie, à la route des statistiques d'un personnage (`/Destiny2/{type}/Account/{id}/Character/0/Stats/`), dont la réponse n'a pas non plus de champ `metrics` : le diagnostic, qui liste l'erreur et les clés de la réponse, le dira. Je n'ai PAS touché à cette requête. Aussi non vérifié : la vraie page `DashboardPage` et le logiciel installé ; `npm run build` strict.

## 21/10/2026 — boutons « Carrière » et « Accomplissements » : même taille, alignés, entre le titre et « connecté », masqués hors connexion

**Demande de l'utilisateur** (capture d'écran annotée d'un rectangle rouge) : « met les deux boutons Carrière et Accomplissement à l'endroit indiqué par ma capture d'écran. Les deux doivent être alignés et à la même taille. Masqués lorsque le joueur n'est pas connecté. » **Version inchangée (0.4.14).** Les deux archives envoyées (`Forge-Armory-main.zip` et `_1`) sont identiques.
**Cause du « pas la même taille »** (mesurée sur la capture : l'anneau d'Accomplissements est environ 12 % plus petit que celui de Carrière) : `.bouton-vue` impose le cadre **4316 / 1024** aux deux boutons, alors que le fichier d'Accomplissements a le cadre **4897 / 1024** : il était réduit pour tenir. **Correction d'une affirmation du journal du 20/10 (soir)** : il disait que « la largeur suit le ratio du cadre de chaque bouton » (207 et 235 px) ; en réalité le style imposait le même ratio aux deux (largeurs égales, dessin d'Accomplissements réduit).
**Interprétation** : les deux boutons restent EMPILÉS, « Carrière » au-dessus (demande précédente), alignés à gauche, à 49 px de haut (3,0625 rem, la valeur existante) ; le rectangle rouge est la place libre entre « Connexion à Bungie » et « ✅ connecté ».
**Fait** :
- **Retouche 5** de `scripts/retoucher-visuels.mjs` : fabrique `bouton-carriere-large.svg` et `bouton-carriere-large-selectionne.svg` (4897 × 1024) à partir des fichiers de Carrière, **originaux intacts** (utilisés par le tiroir « Solo sans mourir »). Plaque et filets allongés (580,9 et 581), titre, soulignage et étoile recentrés (290,5), anneau et symbole inchangés, identifiants préfixés, largeur des deux filtres du fichier « sélectionné » portée à 4897. **GARDE-FOU : la plaque obtenue doit être identique, chiffre pour chiffre, à celle d'Accomplissements, sinon l'outil s'arrête.** Déclarés dans `forgeAssetsComplement.ts` (`selecteur.carriere-large.*`).
- **Composant `BoutonsVuesCompte`** (nouveau) : les deux boutons, même hauteur ET même cadre (modificateur CSS `bouton-vue--large`, 4897 / 1024), colonne alignée à gauche. `DashboardPage` le monte dans `connecte &&` : **les boutons n'existent pas hors connexion**.
- **Mise en page** (`index.css`) : une fois connectée, la carte Connexion passe en grille (`pilier-carte--connexion`) : titre en haut à gauche, compte dessous, statut à droite, colonne de boutons **centrée dans la place libre**, à la hauteur du titre ET du compte. Hors connexion : classe absente, mise en page inchangée. **Sous 1100 px** : retour à l'empilement habituel (la colonne passe sous le compte, alignée à gauche).
- **Inchangé** : les boutons du tiroir « Solo sans mourir » et de la fenêtre « Carrière » (le bouton Accomplissements y reste réduit de 12 %).
**Vérifié** : batterie complète **42 séries sur 44, 794 contrôles sur 797**. Les 2 séries en échec sont **celles d'avant mes changements** (`forge` 52/54 et `manifest-demarrage` 17/18 ; état d'origine : 40 séries sur 42, 759 contrôles sur 762) ; aucune nouvelle. `connexion-boutons.py` **16/16** (mêmes largeur et hauteur à 0,5 px près, **mêmes anneau et bord de plaque mesurés sur les PIXELS**, cadre du bouton au ratio de son image, alignés, entre le titre et le statut et centrés à 3 px près, couvrant les deux lignes, masqués hors connexion, repli à 900 px, clics, câblage) ; `carriere-large.test.ts` **19/19** (plaque identique, étoile à 0,1 unité près, décalage exact, symbole inchangé, identifiants résolus, originaux identiques à l'archive) ; `reproductibilite-visuels` **7/7** (le projet livré = ce que produit l'outil, octet pour octet) ; **neuf casses volontaires toutes détectées** (modificateur de taille supprimé, ancien fichier de Carrière, boutons visibles hors connexion, règle de placement supprimée, repli étroit incomplet, plaque décalée, titre décalé, identifiant à l'ancien préfixe, grille retirée).
**Défauts de MON travail, rattrapés** : mon analyseur de tracés refusait les arcs (la plaque en contient un) : le garde-fou s'est arrêté au lieu de produire un fichier faux ; mon propre contrôle voyait un mot dans un commentaire comme un usage de la fonction et bloquait toute écriture ; en fenêtre étroite la colonne se CENTRAIT (le navigateur applique `justify-self` même hors grille) : neutralisé ; trois attentes de test fausses (le ratio d'un SVG sans dimensions est arrondi par le navigateur, l'étoile d'Accomplissements est arrondie à 0,1 près, le symbole compte 2 tracés et non 3) ; un commentaire collé au milieu d'une expression Python avalait la fin de la ligne.
**NON vérifié** : la vraie page `DashboardPage` n'a pas été lancée (le test utilise une copie fidèle de la carte avec le vrai composant et la vraie feuille de style, et vérifie dans le code source que la page a la même structure) ; le logiciel installé ; `npm run build` strict ; la position exacte par rapport à TON rectangle (placé au centre de la place libre : si tu le voulais plus à droite ou à gauche, c'est un réglage).

## 20/10/2026 (soir) — retour à l'empilement : Carrière AU-DESSUS d'Accomplissements

**Demande de l'utilisateur** : « Carrière doit être au-dessus de Accomplissements » (retour à l'empilement vertical ; l'essai « côte à côte » de la demande précédente est abandonné) « les deux boutons doivent être masqués quand l'utilisateur n'est pas connecté » (déjà le cas : tout le bloc est sous `connecte &&`) « aligne bien les deux boutons ». Les deux boutons forment une colonne alignée à GAUCHE (`align-items: flex-start`, écart 0,35 rem), la hauteur +75 % est conservée (3,0625 rem ≈ 49 px ; largeurs ≈ 207 px et 235 px selon le ratio de chaque cadre).

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓.

## 20/10/2026 (soir) — Carrière et Accomplissements côte à côte, +75 %

**Demande de l'utilisateur** (annotation rouge) : les deux boutons du bloc Connexion passent CÔTE À CÔTE sur une seule ligne — « Carrière » puis « Accomplissements » à sa droite — au lieu d'être empilés ; hauteur agrandie de 75 % : 1,75 rem → 3,0625 rem (28 px → 49 px). Largeurs : Carrière ≈ 207 px, Accomplissements ≈ 235 px (ratio du cadre de chaque bouton). La ligne repasse à la carte si la fenêtre est étroite (`flexWrap`), et les tailles des boutons de la modale Carrière et du tiroir restent inchangées.

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓.

## 20/10/2026 (soir) — bouton « Accomplissements » sous « Carrière », taille réduite

**Demande de l'utilisateur** : « ajout "accomplissement" sous "carrière". Ajuste la taille de ces deux boutons pour qu'ils ne fassent pas trop bouger la taille du bloc connexion sans non plus devenir illisible. » Le bloc Connexion affiche maintenant DEUX boutons superposés — « Carrière » puis « Accomplissements » (ce dernier ouvre le tiroir « Solo sans mourir », même navigation croisée que depuis la vue Carrière) — à hauteur réduite : 1,75 rem (28 px), le format déjà utilisé par le bouton Load-outs de la confirmation d'enregistrement, au-dessus du minimum de lisibilité de la charte ; la largeur suit le ratio du cadre de chaque bouton (Carrière ≈ 118 px, Accomplissements ≈ 134 px), empilés à gauche avec 0,35 rem d'écart. Les boutons de la modale Carrière et du tiroir restent inchangés.

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓.

## 20/10/2026 — vue « Carrière » du compte (spécification du 14/10/2026) + intégration de l'archive d'assets v7

**Bouton « Carrière »** (archive d'assets v7 de l'utilisateur, `selecteur.carriere.*`) : visible uniquement CONNECTÉ, sous la coche verte du bloc « Connexion à Bungie ». Aucun appel réseau au chargement de l'appli — les données se chargent au clic, comme « Charger mon inventaire ». Lecture SEULE (GetHistoricalStats, GetActivityHistory, GetProfile déjà chargé).

**Vue « Carrière »** (modale, même habillage que les fenêtres Détails existantes) : compte (pseudo Bungie, plateformes liées), temps de jeu total et par classe (Titan/Chasseur/Arcaniste, lu du profil déjà chargé — aucune requête supplémentaire), personnages (puissance), 10 dernières activités (type, date, durée si disponible), statistiques « Carrière » du compte (bloc allTime de GetHistoricalStats avec `characterId = 0` : l'agrégation de tous les personnages en UNE requête, l'équivalent exact du filtre « Carrière » des Emblèmes du jeu — les filtres Tout/Semaine/Saison ne sont pas repris). Chaque section s'affiche indépendamment ; une donnée manquante affiche « non disponible », jamais une estimation. Aucune persistance : rafraîchie à chaque ouverture.

**Navigation croisée Carrière ↔ Accomplissements** : bouton « Accomplissements » dans la Carrière qui ouvre le tiroir « Solo sans mourir » ; bouton « Carrière » dans ce tiroir ; les deux vues conservent leur état, retour toujours possible.

**Diagnostic dev** (`statIdsCarriere`, actif) : liste les statIds bruts réellement retournés par GetHistoricalStats pour figer la sélection des stats affichées sur des données réelles (même démarche que le composant 310 et les filigranes de saison). À repasser à `false` après validation.

**Intégration de l'archive v7** : `public/assets` resynchronisé avec `ressources-installateur/forge-armory/app-assets/` (ancien `app-assets` archivé en `app-assets-v6`) ; catalogue généré `forgeAssets.ts` repris TEL QUEL depuis la v7 (77 actifs — il couvre maintenant Carrière, Accomplissements, Armes, Armures et les PNG de marque, le complément n'a plus à les déclarer) ; `retoucher-visuels.mjs` rejoué. Le test `reproductibilite-visuels` repasse 7/7 (les 2 échecs « attendus » de la 0.4.14 sont donc résolus : il ne reste que l'échec préexistant `icones` 10/11, inchangé). Le test `visuels` vérifie le cadre (viewBox) des SVG uniquement — le catalogue v7 déclare des PNG.

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓ ; batterie de logique 29/30 séries au vert (seul échec : `icones` 10/11, préexistant, identique sans ces changements) ; `reproductibilite-visuels` 7/7 ; `visuels` 20/20.

## 19/10/2026 (nuit) — v0.4.14

**Décision de l'utilisateur** : « le chantier Forge n'est pas totalement finalisé, donc on reste en 0.4.x. Fait un simple incrément, vers 0.4.14. On passera en 0.5 quand le chantier Forge sera terminé 🙂 » — CONVENTION ACTÉE : les 0.4.x suivent le chantier Forge ; **0.5.x sera réservé à sa clôture**.

**Contenu de la 0.4.14** (tout validé par les tests de l'utilisateur) : retour de test de la 0.4.12 (cristal du titre — chaîne officielle, barre de la Forge avec logos v5, filtres de l'Inventaire, mods possibles par le modèle + regroupement ×N des prises identiques), nettoyage de l'audit du 16/10 (code mort, exports), `npm run build` strict rétabli (BadgeSaison supprimé), palier (`gearTier`, composant 300), attribution des icônes corrigée (justrealmilk/destiny-icons, CC0), **chantier « saisons et sources » complet** (table de 28 saisons, jointure par hash d'objet, table objet→saison de DIM de 57 439 entrées pour la fiche ET l'infobulle, sources de loot fidèles à DIM, menu déroulant Source avec libellés français corrigés et préfixes Raid ·/Donjon ·, ordre fixé, crédits MIT d2-additional-info en pop-up).

**Vérifié** : batterie complète au vert (hors les 2 échecs préexistants documentés : `icones`, `reproductibilite-visuels`) ; build strict ✓ ; `tsc` zéro erreur.

## 19/10/2026 (fin de soirée) — ordre du menu Source complété : Flèche d'Étoiles et Racine des Cauchemars replacées

**Demande de l'utilisateur** : « J'ai bien oublié ces deux-là : Flèche d'Étoiles à mettre juste après Dévoreur de Mondes, Racine des Cauchemars à mettre juste après Serment du Disciple. Tu pourras push ce changement directement. » — uniquement l'ORDRE du menu ; les noms et le reste sont inchangés. Corrigé dans le RÉGÉNÉRATEUR (la régénération conserve l'ordre voulu) et le JSON régénéré. Push direct sur `main` autorisé.

## 19/10/2026 (validation du chantier « saisons et sources », soir) — CHANTIER VALIDÉ : libellés français des activités corrigés, préfixes « Raid · » / « Donjon · », ordre du menu fixé

**Validation de l'utilisateur** : « Mille » + Raid → le Mille Voix apparaît ; « Mille » + Dernier Vœu → pareil ; « Mesure » + Raid → la Mesure Corrective ; les combinaisons avec Armes uniquement et les autres filtres fonctionnent. **Le chantier saisons/sources est VALIDÉ de bout en bout** (saison : fiche, infobulle, noms ; source : catégorie en clair, menu, filtre). Demandes finales (uniquement des NOMS et l'ORDRE d'affichage) :

- **« Coffre des âges » → « Caveau de Verre »**, **« Crypte de la Pierre-Profonde » → « Crypte de la Pierre Enfouie »**, **« Tranchant du Salut » → « Orée du Salut »**, **« Fosse d'Hérésie » → « Fosse de l'Hérésie »**, **« Poigne d'Avarice » → « Étreinte de l'Avarice »**, **« Flèche de la Guetteuse » → « Flèche de la Vigie »**, **« Ruin du Seigneur de Guerre » → « Ruine de la Guerrière »**, **« Hôte de Vêpres » → « Hôte Vesper »**, **« Doctrine Disjointe » → « Dogme Fragmenté »** ; la catégorie « Nuit difficile / GM » devient **« Nuit Noire / GM »**.
- Le préfixe « Activité · » du menu devient **« Raid · »** ou **« Donjon · »** selon le type de l'activité ; **ordre fixé** par l'utilisateur : les raids (Caveau de Verre, Fin de Crota, Chute du Roi, Léviathan, Dévoreur de Mondes, Fléau du Passé, Dernier Vœu, Couronne du Chagrin, Crypte de la Pierre Enfouie, Jardin du Salut, Serment du Disciple, Orée du Salut) puis les donjons (Trône Brisé, Fosse de l'Hérésie, Prophétie, Étreinte de l'Avarice, Dualité, Flèche de la Vigie, Fantômes des Profondeurs, Ruine de la Guerrière, Hôte Vesper, Dogme Fragmenté, Équilibre) ; Racine des Cauchemars et Flèche d'Étoiles restent en fin de liste (absentes de la liste de l'utilisateur). **« Équilibre » AJOUTÉ** (donjon d'Echoes, sourceHash 3247513834 chez DIM) — il manquait à la table.
- Ces libellés, cet ordre et le genre (raid/donjon) sont FIXÉS DANS LE RÉGÉNÉRATEUR (`data/rebuild-source-filters.ts`) : la régénération depuis d2-additional-info conserve l'ordre et les noms voulus ; le champ `genre` entre dans le JSON (le menu le lit pour son préfixe).

**Vérifié** : `tsc` zéro erreur ; `npm run build` strict ✓ ; régénération : 13 catégories, 25 activités, `--check` repasse ; `saisons-sources` 17/17 ; batterie 42 séries, 403/405 (les 2 échecs préexistants sont inchangés : `icones`, `reproductibilite-visuels` — assets v6 non intégrés, chantier de la conversation visuelle).

**Décision de l'utilisateur** : « une fois que c'est fait, et s'il ne reste rien à tester ici, tu peux push le changement y compris sur la branche main » — le chantier est FUSIONNÉ vers `test` puis `main`.

## 19/10/2026 (troisième retour de test, soir) — jointure de source FIDÈLE À DIM (collectible sourceHash + itemHashes) : le filtre du menu matchait RIEN

**Troisième retour de test de l'utilisateur** : « 1a/1b/1c Fonctionnent ! :) :D :D » (la saison par hash d'objet est VALIDÉE, fiche et infobulle) ; « 2a C'est bon ! 2f Fonctionne » ; MAIS « 2b/2c/2d/2e : ne montre rien — je pense que le filtre est cassé. Sans l'utiliser, en laissant sur "toutes les sources", il trouve ce que je veux ». Le cristal du titre est livré par la conversation visuelle (dans app-assets). **Version inchangée (0.4.13).**

**Cause racine (dans le code de DIM cette fois, pas une supposition)** : lecture du filtre `source` de DIM (`src/app/search/items/search-filters/known-values.ts` + `d2-item-factory.ts`) : DIM ne lit JAMAIS les `itemSourceHashes` du Manifest — champ que Bungie ne peuple pratiquement pas. La jointure de DIM : (1) le **`sourceHash` du COLLECTIBLE de l'objet** (`itemDef.collectibleHash` → `DestinyCollectibleDefinition.sourceHash`) comparé aux `sourceHashes` de la source, OU (2) le **`hash` de l'objet** comparé aux `itemHashes** de la source (liste directe). Ma table n'embarquait que les `itemSourceHashes` : le filtre ne pouvait rien matcher.

**Fait** :

- `src/data/source-filters.json` RÉGÉNÉRÉ : chaque entrée porte désormais les DEUX listes de DIM — `sourceHashes` (ceux du collectible ; ex. raid : 34) et `itemHashes` (objets directs ; ex. raid : 11). Le régénérateur parse les deux sections de chaque bloc amont.
- `src/data/sourceFilter.ts` : `matchesSourceFilter` prend la **jointure DIM exacte** : `collectibleSourceHash ∈ sourceHashes` OU `itemHash ∈ itemHashes` ; les `itemSourceHashes` du Manifest ne sont plus utilisés.
- `src/data/sourceObjet.ts` : `jointureSource(db, itemHash)` lit le `sourceHash` du collectible (la MÊME lecture que `obtenirSource` du projet — chaîne brute déjà affichée) + le hash de l'objet ; `sourceObjetParHash` (catégorie en clair sur la fiche) suit la même jointure, la plus précise l'emporte (activité avant catégorie).
- `RechercheManifest` : le menu déroulant appelle `jointureSource` — plus aucune lecture directe du Manifest dans le composant.

**Vérifié** : `saisons-sources` : **17 contrôles** (remplacés en connaissance de cause : les chemins collectible et direct de DIM testés séparément — le hash d'un objet listé directement dans last-wish matche sans collectible ; exclusion sans jointure ; filtre inconnu) ; `tsc` : zéro erreur ; `npm run build` strict : ✓ ; `--check` du régénérateur : repasse après régénération (13 catégories, 24 activités) ; batterie : **42 séries, 403/405** (`icones` 10/11 et `reproductibilite-visuels` 6/7, tous deux PRÉEXISTANTS — le second signale les assets v6 non intégrés, chantier de la conversation visuelle) ; **deux casses volontaires détectées** (chemin direct retiré → 16/17 ; chemin collectible retiré → 15/17).

**DÉFAUT DE CONCEPTION évité de justesse cette fois** : le premier réflexe (d2-additional-info) m'avait fait embarquer les mauvaises listes ; c'est la LECTURE DU CODE DE DIM (la source de vérité de la jointure) qui a donné la bonne structure. Leçon consignée : pour reprendre le travail d'un autre projet, lire son CODE d'abord, ses données ensuite.

**NON vérifié (à retester par l'utilisateur)** : le menu Source avec les mêmes essais que le retour — « Mille » + Raid / Activité · Dernier Vœu ; « Mesure » + Raid ; les combinaisons avec la catégorie Armes et les autres filtres (2b à 2e du canvas).

## 19/10/2026 (second retour de test, soir) — jointure saison par le HASH D'OBJET (la table de DIM elle-même), filtre de source en MENU DÉROULANT, syntaxe « source: » retirée

**Second retour de test de l'utilisateur** : (1) « Dans le Manifest, pas de filigrane de saison, pas d'indication textuelle. Ailleurs : filigrane présent mais pas de nom de saison au survol » ; (2) « source:raid seul : presque 13k résultats. En ajoutant le filtre Armes, plus aucun » ; **décision** : « il faut rajouter un menu déroulant permettant de filtrer la source : prends exemple sur le filtre de catégorie, celui sur les champions, celui sur les éléments » — et « il va falloir être plus rigoureux pour la suite ». **Version inchangée (0.4.13).**

**Enseignements de l'échec de la première correction** (consignés pour la rigueur demandée) : ma jointure saison reposait sur la table FILIGRANE→numéro de d2-additional-info, lue sur le CHEMIN de l'icône — or les chemins du Manifest de l'utilisateur sont en HEXADÉCIMAL (`50c3ebe4….png`), la table de DIM y matched jamais : **le correctif n'a jamais pu marcher, et je l'ai livré sans vérifier la forme RÉELLE des données**. La bonne jointure existait chez DIM : `data/seasons/seasons_unfiltered.json` — **57 439 objets → numéro de saison, par le hash de l'OBJET** — aucun besoin du filigrane.

**Fait** :

- `src/data/saisons-objets.json` (NOUVEAU, 57 439 entrées, dérivé de `seasons_unfiltered.json`, MIT) + `saisonDeLObjet` dans `saisons.ts` : la jointure par le HASH DE L'OBJET, celle de DIM. Remplace la jointure filigrane (fausse) ; `src/data/watermarks.json` SUPPRIMÉ. Le seasonHash et le balayage interne restent en amont (secours devenu second) ; la table objet est le chemin principal.
- **L'INFOBULLE de l'icône de saison** (`IconeSaison.tsx`) : quand le Manifest ne donne ni nom ni numéro, le numéro vient de la table objet et le nom de la table des saisons — l'infobulle ne dit plus jamais « Saison de l'objet » quand la saison est connue. **Partout** : fenêtres Détails, vignettes, fiche de recherche.
- **Le filtre de source devient un MENU DÉROULANT** (`RechercheManifest`), même style que la catégorie, les champions et les éléments : « Toutes les sources », puis les 13 catégories, puis les activités (« Activité · Dernier Vœu »…). DEMANDE EXPLICITE de l'utilisateur.
- **La syntaxe « source: » dans le champ de texte est RETIRÉE** (extraction, autocomplétion, alias de saisie libre, mode « TOUT » de la recherche) : elle prêtait à confusion (le retour n°2 le montre) ; le menu la remplace. `search.ts` REVIENT À SON ÉTAT D'ORIGINE (le mode « TOUT » est retiré : zéro code mort), `sourceFilter.ts` ne garde que l'index et `matchesSourceFilter`.
- Le point n°2 du retour (13k résultats puis zéro avec « Armes uniquement ») : cause racine dans le mode « tout » (des objets sans catégorie devinée fiable polluaient le compteur ; le changement de catégorie relançait une recherche à vide au comportement confus). Le retrait du mode « tout » et de la syntaxe ÉLIMINE la cause ; le menu filtre les résultats de la recherche normalement, avec la catégorie « Armes uniquement » appliquée par la recherche elle-même.

**Vérifié** : `saisons-sources` : **16 contrôles** (mis à jour en connaissance de cause : jointure par le hash d'objet — le hash 4772275 ancienne clé filigrane résout toujours 12, sur-ensemble confirmé ; les contrôles de la syntaxe retirée sont documentés comme retirés) ; `tsc` : zéro erreur ; `npm run build` strict : ✓ ; batterie : **42 séries, 400/401** (seul échec : `icones` 10/11, préexistant) ; **une casse volontaire détectée** (table objet vidée → 15/16).

**Défauts de MON travail, rattrapés** — leçon de rigueur : le premier correctif saison a été livré SANS vérifier la forme réelle des chemins du Manifest de l'utilisateur (hexa) alors que ses DIAGNOSTICS la montraient ; deux résidus de commentaire et un `const tout` orphelin ont survécu à mes propres nettoyages (trouvés par `tsc`, retirés) ; un bloc de test rédigé trop vite n'utilisait pas le bon fixture (abandonné, réécrit).

**NON vérifié (à retester par l'utilisateur)** : le point 1 — la saison en clair (fiche de recherche ET survol de l'icône) sur la Mesure corrective et d'autres objets ; le point 2 — le menu déroulant Source : choisir « Raid » avec « Armes uniquement » doit lister les armes de raid (le filtre s'applique aux résultats de la recherche : taper au moins 2 caractères, OU chercher puis filtrer).

## 19/10/2026 (retour de test du chantier, soir) — correctifs : saison par le filigrane (table d2-additional-info), filtre source: seul, branchement de l'alias d'activité

**Retour de test de l'utilisateur** (8 points testés sur `draft-saisons-sources`) : **(2, 5, 8) VALIDÉS** — la catégorie de source en clair (« donne l'activité où trouver l'objet »), l'autocomplétion `source:`, la pop-up Crédits. **(1, 3, 4, 6) TROIS DÉFAUTS RÉELS corrigés** — le journal les documente. **(7)** : l'exemple de test « perk de raid » était mal choisi (« il n'y a plus vraiment de perks liés à des raids ») — la liste de test est corrigée. **Version inchangée (0.4.13).**

**Fait (correctifs)** :

- **N°1 — « je trouve l'objet (Mesure Corrective) mais pas d'indication sur la saison »** : cause identifiée par les DIAGNOSTICS de l'utilisateur (son Manifest : « 52 objets ont un seasonHash, **0 filigrane relié à une saison** ») — ni `seasonHash` ni déduction interne possibles chez lui. Correctif prévu par la spécification et manquant à la livraison : la **table filigrane → numéro de saison** (`src/data/watermarks.json`, 4 488 filigranes, dérivée de `output/seasons.json` de d2-additional-info, MIT) + `saisonDuCheminFiligrane` dans `src/data/saisons.ts` : le numéro est résolu depuis le **chemin de l'icône du filigrane** de l'objet, en SECOURS du seasonHash et du balayage interne (jamais en remplacement). Sans filigrane connu : pas de ligne, jamais estimé.
- **N°3/4 — « pas les sources » / « ne semble pas fonctionner »** : un filtre `source:` SEUL repartait immédiatement — le texte restant après extraction est vide et la recherche exige ≥ 2 caractères. Correctif : le mode « TOUT » de `rechercherDansManifest` (mot-clé vide = lister tous les objets des tables demandées ; contrôlé par l'appelant, jamais par défaut) ; un filtre seul liste tout, puis le tri par source se fait côté client.
- **N°6 — « Last Wish » sans préfixe ne trouvait rien** : l'alias (`resoudreAliasActivite`) était écrit dans le module mais **jamais branché** dans le composant. Correctif : un texte libre qui résout une activité bascule automatiquement en `source:<activité>` (et remplace le champ, visible) ; la catégorie choisie (Armes uniquement…) continue de s'appliquer.

**Vérifié** : `saisons-sources` passe à **21 contrôles** (3 nouveaux : saison par le vrai filigrane de la saison 12, chemins vides/inconnus → aucune saison jamais estimée, chemin non numérique du Manifest réel) ; `npm run build` strict : ✓ ; `tsc` : zéro erreur ; batterie : **42 séries, 405/406** (seul échec : `icones` 10/11, préexistant et documenté) ; **deux casses volontaires détectées** (table filigrane vidée → 20/21 ; mode « tout » retiré → `tsc` en échec immédiat).

**Défauts de MON travail, rattrapés** : la liste de test et le test logique n°7 parlaient de « perks de raid » — obsolète (l'utilisateur : « il n'y a plus vraiment de perks liés à des raids ») ; mon premier correctif du filtre seul passait une chaîne vide à `rechercherBilingue`, qui la rejette (< 2 caractères) — d'où le mode « TOUT » explicite dans `search.ts` ; un `if (!champCorrespondant) continue;` resté en double après édition (retiré).

**NON vérifié (à retester par l'utilisateur)** : les points 1, 3, 4, 6 corrigés — la saison de sortie sur la Mesure corrective (et d'autres objets sans seasonHash), `source:raid` seul, la combinaison mot + filtre, la saisie libre « Last Wish » avec la catégorie « Armes uniquement ».

## 19/10/2026 (soir, chantier « saisons et sources ») — tables de correspondance saisons/sources (d2-additional-info), filtre source:, saison de sortie sur la fiche, crédits

**Demandes de l'utilisateur** : « D'autres modifications dont certains éléments utilisés par d'autres sites et app » — tables de correspondance des saisons et des sources de loot, affichage lisible de la saison de sortie, filtre textuel sur la source, et CRÉDITS obligatoires. **Décision de conception actée** : « on a bossé sur notre solution en ignorant que le travail existait déjà sur GitHub : on va reprendre et créditer proprement ». **Version inchangée (0.4.13). Branche `draft-saisons-sources`** (pas de fusion dans `test` sans la validation de la 0.4.13 en cours — pipeline).

**Crédits (licence MIT, obligation)** : les données de SAISONS et de SOURCES sont dérivées de **d2-additional-info** (https://github.com/DestinyItemManager/d2-additional-info — Destiny Item Manager, **licence MIT**). Mention : ici, champ `_licence` en tête des fichiers générés, et section « Crédits » de l'application (pop-up du pied de page). Les noms de saison et descriptions de source sont des données Bungie ; le petit print de Bungie s'applique comme pour le reste du Manifest.

**Fait** :

- `src/data/seasons.json` + `src/data/saisons.ts` : les **28 saisons** (numéro, nom complet, nom court, type saison/épisode, dates de début/fin, extension), dérivées de `SEASONS.md` de d2-additional-info. La saison 28 (Renegades, Lawless) est en cours (`fin: null`). RÔLE : le Manifest reste la source PRINCIPALE des noms (`lib/manifest/saison.ts`, inchangé) ; cette table est le SOCLE du numéro et le SECOURS des noms quand la table des saisons du Manifest est absente, et la seule source des DATES. MAINTENANCE : une ligne par saison, manuelle.
- `src/data/source-filters.json` : **13 catégories** (Raid, Donjon, Trials d'Osiris, Bannière de Fer, Crucible, Gambit, Nuit difficile/GM, Campagne, Quête exotique, Eververse, Événement, Passe de saison, Marchand) et **24 activités** (un raid ou donjon chacune : last-wish, vault-of-glass, prophecy…), chacune avec ses `itemSourceHash` et ses libellés FR/EN. Champ `_licence` obligatoire en tête.
- `data/rebuild-source-filters.ts` (à la racine, hors build) : RÉGÉNÈRE `source-filters.json` depuis `output/source-info-v2.ts` de d2-additional-info (téléchargé via `gh`). Sans option : télécharge et réécrit. Avec `--check` : ne modifie rien, code de sortie 1 si périmé — **une seule passe de vérification couvre Manifest + tables** : au chargement du Manifest, l'appli compare le dernier commit connu de d2-additional-info (GitHub API) et AFFICHE UN AVERTISSEMENT (jamais un blocage, jamais un téléchargement automatique) quand les données amont ont changé.
- `src/data/sourceFilter.ts` (module PUR) : index hash → filtre (Map, O(1)), `matchesSourceFilter(itemSourceHashes, filtre)`, `SOURCE_FILTER_SUGGESTIONS` (autocomplétion), `ACTIVITY_ALIASES` (saisie libre « Last Wish » / « Prophétie », insensible aux accents et à la casse), `extraireFiltreSource(recherche)`. Zéro appel réseau.
- `src/data/sourceObjet.ts` (module PUR) : la source la plus PRÉCISE d'un objet (l'activité « last-wish » avant la catégorie « raid »), par ses `itemSourceHashes` lus via le cache de définitions partagé ; `undefined` sans estimation.
- `RechercheManifest` : **filtre `source:`** dans le champ de recherche — extrait du texte avant la recherche (les autres mots cherchent normalement), appliqué côté client par ET logique avec l'anti-champion et l'élément ; un objet sans hash de source est exclu sans erreur ; la négation `-source:` est exclue de la v1. **AUTOCOMPLÉTION** : la frappe de « source: » propose les 13 catégories puis les activités, libellées en français ; un clic complète. **FICHE** : « Saison de sortie : nom (numéro) — dates » (jointure seasonHash/filigrane existante + table des saisons en secours) et la catégorie de source en clair (« — Raid — Source: "Last Wish" Raid ») ; jamais estimées.
- `DashboardPage` : section **« Crédits »** en pied de page, ouverture en **pop-up** (décision de l'utilisateur) : projet de fan non affilié à Bungie + crédit MIT de d2-additional-info avec liens.

**Vérifié** : `saisons-sources` (NOUVEAU, 18 : 28 saisons numérotées sans trou, **saison 5 = « Season of the Forge »** — le test demandé, saison 28 en cours, épisodes 24+, jointure filigrane→numéro→nom, filigrane inconnu sans invention, source:raid vs source:trials, exclusion sans erreur des objets sans hash, les deux niveaux partagent l'index, extraction du filtre avec texte restant, autocomplétion = exactement 13 catégories valides, alias accent/casse) ; régénération : `--check` échoue sur un fichier périmé, régénère 13 catégories + 24 activités, `--check` repasse ; `npm run build` strict : ✓ ; `tsc` : zéro erreur ; batterie : **42 séries, 402/403** (le seul échec, `icones` 10/11, est PRÉEXISTANT et documenté) ; **trois casses volontaires toutes détectées** (index de jointure vidé → 17/18 ; nom de la saison 5 falsifié → 17/18 ; autocomplétion falsifiée avec une 14e catégorie bidon → 5/18).

**Défauts de MON travail, rattrapés** : mon premier test collait un double-espace dans l'extraction du texte restant (attente normalisée, le module était correct) ; ma première table filigrane→numéro du test contenait des hashs inventés (remplacés par les vrais filigranes de `output/seasons.json` de d2-additional-info) ; `data/*.ts` à la racine n'était pas dans le `include` du `tsconfig` (déplacés dans `src/data/`, le régénérateur reste dans `data/` comme script outillé).

**NON vérifié (à contrôler sur le vrai Manifest et en interface)** : la jointure saison sur de vrais objets (les filigranes de test viennent de la table DIM, pas du Manifest de l'utilisateur) ; la catégorie de source sur de vraies armes (certains `itemSourceHash` récents peuvent manquer dans d2-additional-info entre deux mises à jour amont) ; l'autocomplétion et la pop-up Crédits en interface réelle (tests d'interface à écrire avec la prochaine série) ; l'avertissement de péremption d2-additional-info en conditions réelles (hors ligne : silencieux, voulu).

## 19/10/2026 (branche test) — lecture du PALIER d'un exemplaire (`gearTier`, composant 300), issue de l'analyse de la spec Bungie v2.21.9

**Origine** : analyse croisée du dépôt [Bungie-net/api](https://github.com/Bungie-net/api) (spec OpenAPI v2.21.9, mise à jour Renegades du 02/12/2025) contre les points ouverts du TODO Forge. La spec documente, dans `DestinyItemInstanceComponent`, un champ `gearTier` : « Gear Tier, if applicable, fished up from the unlock value items.gear_tier » — c'est exactement le **système de paliers** du point ouvert n°2 de la Forge (« quelle version s'applique à un exemplaire possédé dépend de son palier » : perks améliorées). **Version inchangée (0.4.13) ; branche test, pas de comportement nouveau tant que le sens des valeurs n'est pas contrôlé sur le compte de l'utilisateur.**

**Fait** :

- **`lib/bungie/plugsDisponibles.ts`** : nouvelle fonction PURE `extraireGearTier` — lecture tolérante du champ `gearTier` du composant 300 (instances) d'un profil, même démarche que `extrairePlugsDisponibles` pour le composant 310 : donnée absente ou mal formée → `undefined` (« on ne sait pas », jamais un palier deviné). La forme est celle de la documentation de l'API (spéc `DestinyItemInstanceComponent`) : elle n'a PAS encore été vérifiée sur le compte de l'utilisateur.
- **`lib/bungie/inventaire.ts`** : le composant 300 était déjà demandé (composants = 102, 200, 201, 205, **300**, 302, 305, 310 depuis la v0.4.7) — sa table `instances.data` est maintenant lue et chaque `GearPiece` possÙe son `gearTier` (à `undefined` si absent). **Aucune requête réseau de plus.**
- **`types/build.ts`** : champ `gearTier?: number` sur `GearPiece`, documenté (décide quelle version d'un perk amélioré s'applique à CET exemplaire).

**NON fait (volontairement)** : le filtre du vote de saison sur `iconWatermarkShelved` avait été tenté puis **REVERTÉ** : le vote via le filigrane « shelved » est un comportement délibéré du 14/10/2026, testé et validé (`saison.test.ts`, 22/22) ; le retirer sur simple hypothâte (« le shelved peut polluer le vote ») contreviendrait à la règle du dépôt : corriger avec les vraies données, pas deviner. La spec Bungie a bien ajouté `iconWatermarkFeatured` (et `DestinyInventoryItemConstantsDefinition` pour les calques d'icônes) : pistes notées pour plus tard, avec un diagnostic réel si le vote se montre faux sur les données de l'utilisateur.

**À CONTRÔLER sur le compte de l'utilisateur** (avant tout usage du palier dans la Forge) : le sens exact des valeurs de `gearTier` sur des exemplaires réels (arme de base, arme améliorée, arme façonnée), par exemple avec un diagnostic en mode dev à ajouter au moment du branchement Forge.

**Vérifié** : `npm run build` strict ✓ built in 1,8 s ; batterie ciblée — `plugs-disponibles` **22/22** (dont 3 nouveaux contrôles PALIER), `saison` 22/22, `simulation` 15/15, `appliquer-simulation` 20/20, `faconnee` 7/7.
## 19/10/2026 (soir) — correctifs : `npm run build` strict rétabli (BadgeSaison supprimé), restes « Bibliothèque » retirés (renommés Legendarium)

**Demandes de l'utilisateur** : (1) supprimer la branche fusionnée `vibe/nettoyage-audit-2bis` ; (2) « Point 2 : ok fais-le dans test » — corriger le défaut TypeScript qui bloque `npm run build` strict ; (3) « "Bibliothèque" n'est plus utilisé, ça a été renommé "Legendarium" » — confirmer et retirer les restes. **Version inchangée (0.4.13).**

**Fait** :

- **`src/components/BadgeSaison.tsx` SUPPRIMÉ — code mort confirmé**. La cause du blocage de `tsc -b` (depuis la v0.4.11, documentée par l'entrée Netlify du 18/10) : le commit « Diag nom de saison » (`1d92c8e`) avait modifié ce fichier pour importer `RETRAIT_BADGE_VIGNETTE` et `tailleBadgeVignette` et lire `CADRAGE_SAISON.partSymbole` — trois symboles qui n'existent dans AUCUN commit du dépôt (l'ancienne version utilisait des valeurs en dur : `left: 2, top: 2, padding…`). L'enquête montre surtout que le composant n'est IMPORTÉ NULLE PART : seul `FiligraneSaison.tsx` le mentionne, dans un COMMENTAIRE du 15/10 (« une pastille alignée et réduite (`BadgeSaison`, supprimée) avaient été essayées… elles ne lui convenaient pas ») : le composant a été ABANDONNÉ en interface au profit du filigrane, mais le correctif du 16/10 lui a été appliqué par erreur sur le fichier mort. Décision : ne pas ressusciter les symboles manquants (ce serait écrire du code pour un composant inutilisé) mais supprimer le fichier mort — cohérent avec l'audit du 16/10 (code mort confirmé). **`npm run build` strict (`tsc -b && vite build`) repasse** : c'était le seul blocage.
- **Restes « Bibliothèque » retirés des DEUX côtés** : `public/assets/` (3 SVG : bouton ×2, icône) ET l'archive de référence `ressources-installateur/forge-armory/app-assets/assets/` (les mêmes 3). L'archive v5 a REMPLACÉ « Bibliothèque » par « Legendarium » (le `manifest.json` ne catalogue QUE `legendarium`), mais les fichiers bibliothèque n'avaient pas été retirés du dossier `assets/` de l'archive : le test de reproductibilité les reconstruisait depuis l'archive. Aucune perte : les trois fichiers sont CONSERVÉS dans `archives-precedentes/app-assets-v4/` (vérifiés identiques octet pour octet avant suppression). « Bibliothèque n'est plus utilisé » confirmé par l'utilisateur.

**Vérifié** : `npm run build` complet AVANT : échoue sur les 3 erreurs `BadgeSaison` uniquement ; APRÈS : ✓ built in 1,8 s (l'avertissement « chunks > 500 kB » de Vite est un conseil, pas une erreur — préexistant). Batterie logique : **41 séries, 384/385** ; `visuels` et `reproductibilite-visuels` repassent à 100 % (ils échouaient AVANT correction, sur `main` et `test`, précisément à cause de ces restes). **Deux casses volontaires détectées** : restaurer `BadgeSaison.tsx` → `tsc -b` échoue de nouveau ; recopier un SVG Bibliothèque dans `public/assets/` → `visuels` (SVG non déclaré) ET `reproductibilite-visuels` (fichier hors archive livrée) échouent.

**Défaut préexistant, NON corrigé ici (hors périmètre)** : `icones` 10/11 — un contrôle du test attend un rendu d'icône d'élément avec `<link rel="preload">` qui n'est plus émis depuis un partage des tracés ; il échoue À l'IDENTIQUE sur `test` sans mes changements. À corriger dans un changement de version, avec le test mis à jour en connaissance de cause.

**NON vérifié** : rien de nouveau côté compte Bungie ou interface ; le build strict passe dans l'environnement de travail, `npm.cmd run electron:build` (installateur) reste à refaire côté utilisateur.

## 19/10/2026 — retour de test de la 0.4.12 (cristal du titre, boutons/logo de la Forge, filtres de l'Inventaire, mods possibles sur les armures)

**Demandes de l'utilisateur** (retour de test de la 0.4.12, avec trois diagnostics d'armures réelles et deux captures) : (1) « sur le logo+titre de l'App, rajoute le cristal dans le O de FORGE » — « uniquement rajouter le cristal, le reste ne doit pas changer » ; (2) « dans Forge, Inventaire, mettre les boutons Armes et Armures à droite du bouton Inventaire ; prévoir un séparateur entre les deux paires ; utiliser les logos de Forge Armory app assets v5 » ; (3) « mets les mêmes filtres pour l'Inventaire que la Collection » ; (4) « dans la Forge, je vois les mods utilisés mais pas les mods possibles » (note : « sur certains slots, il y aura forcément des doublons, il faudra une interface spécifique pour ne pas les afficher 3 fois ») ; (5) travailler sur une branche « Test-modif » pour tester avant main. **Version inchangée (0.4.12).**

**Ce que les trois DIAGNOSTICS réels révèlent** (Cape chatoyante, Masque de chasse ultime, Pantalon de chargeur rapide) : le composant 310 de Bungie liste **zéro plug disponible** sur toutes les prises de mods de ces armures réelles (les « disponibles : 0 » de chaque prise) ; seuls les ajustements (prises 11/14) listent leurs alternatives. La 0.4.12 affichait donc le mod équipé seul, sans alternative : c'est le défaut n° 4, et sa cause n'est PAS un bug de lecture. Deuxième enseignement : le Masque a **trois prises de mods identiques** (même catégorie, même plug équipé vide) — le cas de doublons annoncé par l'utilisateur.

**Fait** :

- `generer-icones.py` + `public/logo-forge-armory-texte.png` : le CRISTAL dans le O de « FORGE ». **⚠️ CHANGÉ (19/10, soir) : la chaîne officielle documentée dans `SCRIPTS-VISUELS.md` (main) prend le relais** — décision de l'utilisateur (« conserve celle de la charte ») : `generer-icones.py` est RÉTABLI dans son rôle d'origine (il produit l'intermédiaire SANS cristal, que la charte nomme `logo-titre/logo-forge-armory-texte-sans-cristal.png`), et le cristal sera posé par l'outil dédié `scripts/ajouter-cristal-logo-titre.py` (poussé par la conversation visuelle, pas encore dans le dépôt au moment de cette entrée). MON extension de `generer-icones.py` (losange dessiné dans le générateur, ratios mesurés sur la capture : 55 % du diamètre intérieur vertical, 28 % de l'horizontal, dégradé 218→197, uniquement le O de FORGE, vérifié pixel par pixel : 256 pixels ajoutés, tous dans le O) est RETIRÉE au profit de cette chaîne ; le PNG livré redevient la version SANS cristal jusqu'à l'arrivée de l'outil dédié.
- `PageForge` : UNE SEULE BARRE de boutons : « Collection », « Inventaire » (boutons stylisés inchangés), un SÉPARATEUR vertical, puis « Armes » / « Armures » avec les logos v5 (`icones.armes` : l'épée, `icones.armures` : le bouclier, déjà livrés dans `public/assets/icones/`). Les boutons logo basculent la vue ET la partie (Armes : la vue active reste celle qu'on regarde, partie armes ; Armures : idem armures) ; l'état reste PAR VUE : rien ne se recharge. Les anciens boutons de partie des panneaux sont retirés ; les attributs `data-objet` / `data-objet-collection` et le comportement de montage paresseux sont inchangés.
- `InventaireArmures` : filtres RARETÉ et ENSEMBLE en plus (comme les menus de la Collection) ; les valeurs proposées viennent des armures chargées.
- `InventaireArmes` : filtres TYPE, EMPLACEMENT, RARETÉ et ÉLÉMENT en plus (comme la Collection) ; l'élément est lu dans le Manifest avec tolérance (Manifest absent ou table illisible : l'arme reste visible). La source et l'obtention de la Collection ne s'appliquent pas à des objets possédés : non ajoutés.
- `lib/forge/armure.ts` : **complément par le MODÈLE** — quand l'exemplaire liste ZÉRO plug disponible sur une prise non fixe non cosmétique (le cas réel ci-dessus), les plugs POSSIBLES viennent de la définition du modèle (mêmes quatre sources que la Collection : liste directe, jeux partagé et aléatoire, plug initial), marqués `theorique : true` : la simulation reste locale, rien ne prouve que CET exemplaire les accepte (l'énergie des mods, à écrire, pourra les filtrer). Les prises FIXES (archétype, amélioration) et COSMÉTIQUES ne sont PAS complétées. **CHANGEMENT DE COMPORTEMENT** : une armure sans composant 310 lu a maintenant ses prises de mods modifiables (avant : rien).
- `lib/forge/armure.ts` : `regrouperColonnesArmure` — l'INTERFACE ANTI-DOUBLONS : les prises dont le modèle est IDENTIQUE (même catégorie de plug équipé, même catégorie de socket, mêmes options) sont affichées en UN bloc « × N » (le cas réel du Masque : trois prises identiques → un bloc × 3) ; chaque prise reste simulée séparément (le magasin de simulations est par prise) : un clic sur le plug d'un groupe simule la première prise non simulée, le bloc dit combien sont simulées.

**Vérifié** : `armure-theorique` (NOUVEAU, 11 : non-régression des prises qui listent leurs plugs, complément marqué theorique, prise fixe non complétée, composant 310 absent même lecture, regroupement × 3 du cas réel, non-regroupement des prises différentes, delta identique pour un plug théorique) ; `armure-forge` (22 : le contrôle « sans disponibilité lue » est MIS À JOUR pour le changement de comportement voulu — avant : rien de modifiable ; maintenant : seuls les fixes et cosmétiques gardent leur plug unique) ; batterie logique : **41 séries, 383/385 contrôles** (les 2 échecs, `visuels` et `icones`, sont PRÉEXISTANTS sur main : trois SVG « Bibliothèque » restés dans `public/assets/` alors que le renommage en « Legendarium » les remplace — non corrigés ici, à corriger séparément) ; **quatre casses volontaires toutes détectées** (marque `theorique` retirée → 8/11 ; regroupement sans comparer les options → test de non-regroupement en échec ; complément étendu aux prises fixes → 5/11 ; complément supprimé → échecs) ; `tsc` : zéro nouvelle erreur (les 3 erreurs `BadgeSaison` sont préexistantes sur main) ; le PNG du titre : 256 pixels ajoutés, TOUS dans le O de FORGE (vérifié par différence d'image), emblème/favicons/icône inchangés par hash.

**Défauts de MON travail, rattrapés** : mon premier scénario de regroupement utilisait deux prises de catégories DIFFÉRENTES (mod et ajustement) et attendait leur regroupement — c'est justement ce qu'il ne faut pas faire ; le fixture a un nouveau casque « à prises répétées » (5304) calqué sur le vrai Masque ; mon premier `tsc` passait `db` possiblement nul au filtre par élément (corrigé avec lecture tolérante).

**NON vérifié (à contrôler sur le compte et l'appli de l'utilisateur)** : l'aspect du cristal à l'écran (mes vérifications sont par analyse de pixels et capture de la zone : à valider visuellement) ; l'ergonomie de la barre unique (logos v5 à 24 px : la notice v3 recommande 32 px minimum pour les logos — à voir en vrai) ; si les plugs théoriques correspondent aux mods réellement plaçables en jeu (l'énergie des mods n'est pas encore gérée : des combinaisons impossibles en jeu restent simulables) ; les tests d'interface (Playwright ne tourne pas dans l'environnement de travail : `forge.py`, `forge-armures.py`, `forge-collection-armures.py`, `selecteur.py` à rejouer — les attributs testés sont conservés, la barre de boutons et les filtres ne sont pas encore couverts par un test d'interface) ; `npm run build` strict.

## 17/10/2026 — v0.4.13 : nettoyage du code mort et des exports inutiles (audit du 16/10/2026)

**Demande** : feuille de route du 17/10/2026, section 2 bis — actions de nettoyage issues de l'audit complet du code de `src/` (109 fichiers, commit 3ae3fbd), sans urgence, regroupées dans une version mineure. **Version 0.4.13.** Aucun changement de comportement : la batterie de tests donne exactement les mêmes résultats avant et après.

**Fait (point 1 de l'audit — code mort confirmé, supprimé)** :
- `lib/bungie/api.ts` : `recupererCoffre`, `recupererInventairePersonnages` (remplacés par l'appel profil unique ; leur suppression retire aussi les deux `@ts-expect-error` restants) et `recupererMembershipsActuels` (remplacé par `recupererComptesBungie`).
- `lib/loadouts/stockage.ts` : `renommerLoadout`, `modifierDescription`, `modifierIcone` (remplacés par `modifierInfosLoadout`, écriture unique).
- `lib/scoring/armorSets.ts` : le groupe `scoreBonusSets` + `calculerBonusSetsActifs` + `regrouperParSet` + `BonusSetActif` + `ArmorSetDefinition` + `DEMO_SETS` (remplacés par `scoreBonusSetsReels` et `obtenirBonusSetsActifs`, sur les vraies données du Manifest). Le fichier passe de 265 à 115 lignes.

**Fait (point 2 de l'audit — exports inutiles, mot-clé `export` retiré, fonctions conservées)** : `destinationsPossibles` (`components/BoutonTransfert.tsx`), `formaterNomBungie` (`lib/bungie/api.ts`), `niveauCorrectifs` et les types `Correctif`, `NiveauCorrectifs` (`data/versionJeu.ts`), `TriompheSoloFlawless` (`data/triomphesSoloFlawless.ts`), `ClePilier` (`data/piliers.ts`). Chaque symbole a été vérifié non importé ailleurs avant suppression ou dé-exportation.

**Pas fait (autres points de l'audit)** : découpages à l'étude de fichiers volumineux (doctrine.ts, SelecteurInventaire.tsx, etc.) ; chantier sécurité (Vite 5 → 8, React Router 6 → 7, CSP). Hors périmètre de cette version.

**Vérifié** : aucune des fonctions supprimées n'était importée ailleurs (recherche croisée des imports sur tout `src/` avant chaque suppression) ; batterie de tests : mêmes résultats que sur la 0.4.12 inchangée (23 séries logiques/interface exécutables dans l'environnement de travail : 21 réussissent, 2 échouent à un contrôle près — `icones` 10/11 et `visuels` 19/20 — à l'identique avant et après, donc préexistants et non liés au nettoyage ; les 13 tests d'interface exigent Playwright, absent de l'environnement de travail).

**Défaut PRÉEXISTANT signalé (hors périmètre, non touché)** : `npm run build` échoue sur la 0.4.12 d'origine avec trois erreurs TypeScript dans `components/BadgeSaison.tsx` (symboles `RETRAIT_BADGE_VIGNETTE`, `tailleBadgeVignette`, `partSymbole` attendus de `lib/forge/tailleVignette` mais absents) — vérifié identique avant et après le nettoyage. À traiter dans une version corrective séparée, avec l'accord de l'utilisateur.

**NON vérifié (à contrôler sur le compte de l'utilisateur)** : rien — le nettoyage ne touche aucune donnée ni aucun parcours utilisateur.

## 19/10/2026 — Documentation : charte graphique et guide des scripts des visuels (v0.4.12, sans changement d'appli)

**Demande** : intégrer la charte des visuels et le guide des outils qui les produisent. **Version inchangée (0.4.12)** — documentation uniquement, fusion directe dans `main` (à la demande de l'utilisateur : pas de PR pour de l'ajout de documentation en solo).

**Fait** :

- `documentation/identite-visuelle/CHARTE-GRAPHIQUE.md` (nouveau) : la charte complète des visuels Forge Armory (§1–13 : principes, identité, couleurs, typographie, géométrie, plaque, états, familles, intégration, marques d'objets, barre de la Forge, catalogue, liste de contrôle), fournie par l'utilisateur et conservée mot pour mot ; datée v0.4.13.
- `documentation/identite-visuelle/SCRIPTS-VISUELS.md` (nouveau) : le guide des outils qui fabriquent, retouchent et vérifient les visuels (§1–12 : vue d'ensemble des 8 outils, chaîne du titre de l'en-tête, cristal du « O » de FORGE, vectorisation du titre, bibliothèque de lettres, cristaux, séparateurs, retouches, générateur de boutons, logos d'export, recettes, pièges, tests), fourni par l'utilisateur et conservé mot pour mot.
- `documentation/identite-visuelle/RETOUCHES-VISUELS.md` : ajout d'un lien vers les deux nouveaux documents.

**Vérifié** : chemins cités dans la charte contrôlés dans le dépôt (logo PNG, `EnTeteApp.tsx`, `geometrieIdentite.ts`, `charte-graphique.html` de l'archive v5, `forgeAssets.ts`, `forge-armory-emblem.svg` : tous présents). `ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg` est cité tel quel : il arrivera avec la v0.4.13 (le dépôt est en v0.4.12). Contenu non modifié ; seuls les liens ont été adaptés au dossier.

**Décisions de l'utilisateur** : branche de travail supprimée après fusion (politique de branches : `main`, `test`, `draft-<chantier>` quand nécessaire) ; pas de PR pour de la documentation en solo.

## 15/10/2026 — v0.4.12 : Forge des armures, étape 1 (liste, fenêtre, simulation locale des mods)

**Demande** : « Go les armures » (après ma question : la spécification du 12/10/2026 ne dit pas ce qu'on sélectionne sur une armure ; point 10 de `NOTES-CONCEPTION.md`). **Version 0.4.12** (installateur `Forge-Armory-Setup-0.4.12.exe`, liste `A-TESTER-0.4.12.pdf`). Les tests encore ouverts de la 0.4.11 restent dans la liste.
**Décision de conception (HYPOTHÈSE, à confirmer par l'utilisateur)** : ce que le joueur peut réellement changer sur une armure, ce sont ses **MODS** (emplacements de mods, mods d'ajustement). L'archétype, l'amélioration (maîtrise), le bonus d'ensemble et le perk exotique sont **FIXES**. Aucune catégorie de socket n'est écrite en dur : une colonne est **modifiable** quand elle n'est ni fixe ni cosmétique ET que l'exemplaire y accepte au moins deux plugs (composant 310 de Bungie) : la donnée décide. Cohérent avec l'appli : les statistiques d'une armure viennent déjà de ses plugs (Armor 3.0), donc changer un mod change les statistiques.
**Fait (comme l'étape 0.4.6 des armes : lecture + simulation locale, SANS lien avec le score)** :
- `lib/forge/armure.ts` (module pur) : `colonnesArmure` (un emplacement équipé = une colonne ; nom de la catégorie lu dans le Manifest ; plug équipé d'abord puis plugs disponibles ; jugement fixe / cosmétique / modifiable ; cosmétiques masqués par défaut), `statsSimulees` (la différence des `investmentStats` du nouveau plug et de l'ancien, sur les seules colonnes modifiables : exacte, car l'archétype et l'amélioration ne sont jamais simulés), `diagnosticArmure` (`npm run dev`).
- `lib/manifest/statsArmure.ts` : la résolution d'une statistique PAR SON NOM, **déplacée** de `lib/bungie/inventaire.ts` (comportement identique) pour être partagée.
- `lib/bungie/inventaire.ts` : la disponibilité des plugs (composant 310) est lue **aussi pour les armures** (elle l'était pour les armes seulement ; elle est retirée des exports par `pieceExportable`).
- `components/InventaireArmures.tsx` : liste (filtres : nom ou ensemble, classe, emplacement, lieu, exotiques, simulées), cartes (miniature avec image de saison, emplacement, classe, ensemble, lieu, badge de simulation), fenêtre (nom, icône de saison, méta, **six statistiques avec avant → après et différence**, colonnes avec plug équipé ✓ et plugs disponibles, « afficher les emplacements cosmétiques », « revenir à l'équipement réel », diagnostic en `npm run dev`).
- `PageForge` : dans la vue Inventaire, choix **Armes / Armures** ; la partie Armures n'est montée qu'à sa première ouverture, puis reste montée (son inventaire chargé est gardé) ; la note grise de la page ne dit plus « armures : à venir ».
**Isolation (prouvée par les tests)** : le magasin de simulations est celui des armes (identifiant d'exemplaire + prise) ; `appliquerSimulations` ne parcourt que `build.armes` : une simulation d'armure ne change NI le score, NI Mon Build, NI le réseau (aucune écriture chez Bungie). « Effacer les simulations d'armures » n'efface que celles des armures.
**Pas fait (étapes suivantes à décider)** : lien avec le score et Mon Build (recalcul des statistiques de l'armure du build avec les mods simulés) ; énergie des mods (coût / capacité : des combinaisons impossibles en jeu sont possibles ici) ; Collection des armures (toutes les armures du jeu) ; ensembles et bonus d'ensemble dans la fenêtre.
**Vérifié** : `armure-forge` (22 : colonnes, fixes, modifiables, cosmétiques, ordre, cas limites, effet de chaque mod sur les statistiques, calcul qui ne modifie pas la pièce, diagnostic) ; `forge-armures` (47, VRAIS composants : choix Armes/Armures, liste, filtres, fenêtre, simulation, statistiques, persistance, rechargement, effacement sans toucher aux armes, plastron exotique, marque de classe, armure sans emplacements, saison, diagnostic absent de la version normale, sans compte, sans Manifest, **espion de score inchangé et zéro écriture réseau**) ; `cablage-forge` (18, dont l'isolation par le code) ; batterie : **38 séries, 665 contrôles** ; **dix casses volontaires toutes détectées** (cosmétiques non reconnus, emplacement fixe devenu modifiable, signe inversé, plugs fixes cliquables, statistiques sans simulation, partie Armes non cachée, diagnostic en version normale, plugs des armures non lus, appel réseau d'écriture, effacement des armes). Contrôle de types strict (`tsc`, variables inutilisées interdites) sur les modules purs : zéro erreur ; sur l'interface, contrôle partiel avec une déclaration minimale de React : aucune variable inutilisée.
**Défauts de MON travail, rattrapés** : mon test cherchait « armes : consultation » dans la note que je venais de modifier (corrigé) ; une attente de saison fausse dans mon test (le casque d'essai avait une saison) ; mon test de diagnostic oubliait que ce bouton n'existe que dans la page en mode développement ; un JSON de test dans un format de stockage inexact (le stockage est compact : `c` et `e`) ; mon contrôle d'isolation lisait mes propres commentaires (il porte maintenant sur le code).
**NON vérifié (à contrôler sur le compte de l'utilisateur)** : la STRUCTURE RÉELLE de ses armures : si le composant 310 liste bien les mods possibles pour un emplacement de mod (les mods peuvent venir des « jeux de plugs » du profil, auquel cas aucun emplacement n'apparaîtra modifiable et le diagnostic le dira) ; le jugement fixe / cosmétique repose sur des mots-clés (identifiants de catégorie de plug, noms de catégorie) non vérifiés sur ses données ; les armures d'avant Armor 3.0 ; `npm run build` strict.

### Ajout du 16/10/2026 sur la 0.4.12 : bouton « Forge » dans les fenêtres Détails des armures (demande : « Continuez »)

**Pourquoi celui-là** : c'est la suite de la liste « pas encore fait » qui ne dépend ni de tes diagnostics ni de ta confirmation, et la spécification du 12/10/2026 le prévoit (§1 : « le bouton Détails des armes et armures… un bouton supplémentaire permet de rejoindre la Forge »). **Version inchangée (0.4.12).**
**Fait** :
- Les fenêtres Détails de **Mon Inventaire**, du **Coffre** et de **Mon Build** proposent « 🔨 Forge : choisir les mods de cette armure » pour toute armure POSSÉDÉE (identifiant d'exemplaire) ; le libellé des armes reste « 🔨 Forge : choisir les perks de cette arme ». Une armure sans identifiant n'a ni « Détails » ni bouton.
- `PageForge` AIGUILLE la pièce arrivée vers SA partie : une armure ouvre la vue Inventaire, partie **Armures** (montée aussitôt) ; la partie Armes ne reçoit JAMAIS une armure (sinon elle se serait ouverte dans la fenêtre des armes) ; une arme se comporte comme avant.
- `InventaireArmures` : la fenêtre de l'armure arrivée s'ouvre **toute seule**, sans attendre le chargement de l'inventaire ; elle porte, VISIBLE sans la fermer, « ← Retour à … » (comme pour les armes, avec le bandeau de retour de la page) ; si la disponibilité des mods n'a pas été lue (inventaire chargé avant la mise à jour), un **avertissement** le dit et demande de recharger l'inventaire.
**Vérifié** : `forge-armures` passe à **53** contrôles (arrivée d'une armure : bonne partie, fenêtre ouverte seule, une seule fenêtre, bouton Retour, simulation immédiate, retour une seule fois ; armure sans disponibilité lue : avertissement ; arrivée d'une arme inchangée) ; `detail-popup` (9) et `resumebuild` (14) : les anciens contrôles « une armure n'a PAS de bouton Forge » sont remplacés (changement voulu) par le bouton des armures avec son libellé, l'envoi de la bonne pièce, et l'absence de bouton pour une armure sans identifiant ; `cablage-forge` (19) ; batterie : **38 séries, 675 contrôles** ; **huit casses volontaires toutes détectées** (la partie Armes reçoit une armure, la partie Armures non montée, mauvais aiguillage, fenêtre qui ne s'ouvre pas seule, bouton Retour absent, avertissement absent, bouton réservé aux armes dans Mon Inventaire, libellé des armes sur une armure dans Mon Build).
**Incident de MON travail, rattrapé** : ma première série de casses a dépassé la limite de temps et a été interrompue en pleine modification : une casse volontaire est RESTÉE dans `ResumeBuild.tsx`. Je l'ai vu en contrôlant l'intégrité des fichiers, vérifié que la sauvegarde était bien l'original (la seule différence était la casse), restauré, et refait les casses par petits lots avec sauvegarde complète avant chaque lot et contrôle d'intégrité à la fin : tous les fichiers sont sains. Auparavant : un repère de test faux dans mon script (rien d'écrit) et une attente fausse (une armure sans identifiant n'a pas de bouton « Détails » du tout).
**NON vérifié** : le parcours réel dans l'application installée (mes tests utilisent de vraies pages et composants, mais un faux inventaire) ; une armure ouverte depuis Mon Build dont le profil n'a pas lu la disponibilité des mods affichera l'avertissement.

### Ajout du 16/10/2026 sur la 0.4.12 : Collection des armures (demande : « on enchaîne sur les armures de la collection. Ça fera une grosse checklist de test, mais au moins c'est fait »)

**Version inchangée (0.4.12).** Spécification du 12/10/2026 : « toutes les armes et armures du jeu avec leurs rolls ». **LECTURE SEULE** : rien n'est simulé, rien n'est écrit, aucun lien avec le score.
**Fait** :
- `lib/manifest/catalogueArmures.ts` : le catalogue des armures du jeu, construit UNE fois par Manifest, par lots avec pauses (l'écran reste réactif) et mis en mémoire, sur le modèle du catalogue des armes. Une armure = objet de type 2 avec un nom, ni masqué ni factice, dont le seau est un emplacement d'armure (casque, gants, torse, jambes, marque de classe) ; classe, rareté, exotique, lot de Collections et NOM DE L'ENSEMBLE (index des ensembles de `obtenirBonusSet`). Repli sur un balayage grossier si la requête ciblée ne trouve rien. Filtres : nom ou ensemble, classe, emplacement, rareté, ensemble, source (Collections du jeu par défaut / hors Collections / tout), obtention.
- `lib/forge/armure.ts` : `colonnesModeleArmure` lit les EMPLACEMENTS D'UN MODÈLE dans sa définition, avec TOUS les plugs possibles de chacun (liste directe, jeux de plugs partagé et aléatoire, plug initial : fusionnés sans doublon), leurs bonus de statistiques et le nom de la catégorie de socket. Les emplacements de MODS (identifiant « enhancements.… » ou catégorie contenant « mod ») et COSMÉTIQUES sont REPLIÉS par défaut ; un emplacement replié n'a que son premier plug lu (pas des centaines de lectures inutiles). `diagnosticArmureManifest` (`npm run dev`) : prise par prise, d'où viennent les plugs (les quatre champs), combien on en lit, et le classement.
- `components/CollectionArmures.tsx` : liste (cartes avec miniature et image de saison, emplacement, classe, ensemble ; les armures jamais obtenues par le compte sont GRISÉES, comme pour les armes ; bandeau d'état des collections du compte), fenêtre (nom, icône de saison, méta, bloc de l'ENSEMBLE et de ses bonus classés par nombre de pièces, emplacements avec plugs possibles et bonus de statistiques, deux cases pour les mods et les cosmétiques, diagnostic en `npm run dev`).
- `PageForge` : dans la vue **Collection**, choix **Armes / Armures** avec ses PROPRES attributs (`data-objet-collection`, distincts de ceux de l'Inventaire) ; la partie Armures n'est montée qu'à sa première ouverture (la lecture du Manifest est longue) puis reste montée (son état et ses filtres sont gardés).
**Vérifié** : `catalogue-armures` (20 : contenu exact du catalogue et objets ignorés (sans nom, masqué, factice, seau inconnu, seau d'ARME, type 20 qui passe le `LIKE`), tri, progression, mémoire, repli, filtres dont l'obtention, emplacements fixes / mods / cosmétiques, plugs fusionnés sans doublon, bonus de statistiques, diagnostic) ; `forge-collection-armures` (34, VRAIS composants : choix Armes/Armures, lecture, grisage, cartes, tous les filtres, ensemble et bonus, emplacements par défaut puis mods puis cosmétiques, lecture seule, diagnostic absent de la version normale, état gardé en changeant de partie, vue Inventaire intacte, saison, sans compte, sans Manifest) ; `cablage-forge` (21, dont la lecture seule par le code) ; batterie : **40 séries, 731 contrôles** ; **seize casses volontaires toutes détectées** (type d'objet non vérifié, masquées, factices, seau d'arme accepté, ensemble non lu, recherche sans l'ensemble, source ignorée, mods non repliés, cosmétiques non repliés, jeu de plugs aléatoire ignoré, grisage supprimé, bloc d'ensemble supprimé, diagnostic en version normale, partie Armes non cachée, attributs du choix confondus avec l'Inventaire, appel réseau d'écriture). Contrôle de types strict (`tsc`) sur les modules purs : zéro erreur ; interface : partiel (déclaration minimale de React), aucune erreur hors artefact.
**Défauts de MON travail, rattrapés** : mon test attendait six armures alors que la base commune de test en contient déjà une septième (le « Casque d'essai ») ; une attente fausse sur un libellé (« Arme », pas « Armes ») ; deux TROUS de mes tests révélés par les casses (le faux objet de type 20 n'avait pas de seau valide donc il aurait été exclu même sans la vérification du type ; aucun objet d'armure rangé dans un seau d'ARME : les deux ajoutés, les casses refaites et détectées). Mon compteur de casses ne sait pas lire un test qui plante (il compte 0) : j'ai vérifié à la main que cette casse est bien détectée (le test plante).
**NON vérifié (à contrôler sur le Manifest de l'utilisateur)** : tout ce qui touche à la STRUCTURE RÉELLE des armures : leur nombre, leur lot de Collections, le nom et les bonus des ensembles, la classe (`classType`), et surtout d'où viennent les plugs possibles de chaque emplacement ; le repérage des emplacements de mods et cosmétiques repose sur des mots-clés non vérifiés sur ses données ; les armures d'avant Armor 3.0 ; la durée de lecture du Manifest et celle des emplacements de mods quand on coche la case (des centaines de plugs) ; `npm run build` strict.

## 14/10/2026 — v0.4.11 : fenêtres des armes (icône façonnée à gauche du nom, perks possibles et équipés d'une arme façonnée, boutons alignés)

**Numéro de version** : 0.4.11 (installateur `Forge-Armory-Setup-0.4.11.exe`, liste `A-TESTER-0.4.11.pdf`).

**VALIDATION de la 0.4.10 : PDF renvoyé, 5 cases sur 5 cochées (« Parfait. »)** : installation, bouton « Retour » dans la fenêtre, identification des armes façonnées (icône partout), fenêtre d'une arme façonnée, diagnostic. Le journal en est la seule trace (archive supprimée à sa demande).

**Demandes de l'utilisateur et lecture retenue** (une capture de la fenêtre de la Mesure corrective, « MESURE_CORRECTIVE - Détails ») :
1. **Forge : « Retour à Build Analyzer » à gauche de « Mettre dans Mon Build », attention à l'alignement** : fait. Une seule ligne, les deux boutons de même hauteur fixe et centrés (style commun `styleAction` : l'émoji ➕ agrandissait la ligne) ; le bloc « Retour » qui était seul au-dessus du titre disparaît.
2. **Icône des armes façonnées à gauche du nom (partout)** : fait, composant partagé `IconeTitreFaconnee`, dans la fenêtre de la Forge et dans les fenêtres Détails de Mon Inventaire, du Coffre et de Mon Build.
3. **« Enlève la légende, même dans la Forge »** : **lecture retenue (à confirmer)** : la « légende » est l'**encadré explicatif des armes façonnées** (l'icône y servait de titre) : supprimé. La légende des QUATRE NIVEAUX (validée en 0.4.7) et celle des perks améliorés (▲) sont conservées ; le mot « façonnée » est retiré de la description de la fenêtre (l'icône le dit). Les fenêtres Détails n'avaient aucune légende.
4. **« Dans Détails, sous Forge : rajoute les icônes de type d'arme, d'élément, de munitions et antichampion »** : **lecture CONFIRMÉE par l'utilisateur** (« veille bien à ce que les quatre icônes dans la Forge apparaissent à droite du nom de l'arme dans la pop-up ») : les fenêtres Détails de Mon Inventaire, du Coffre et de Mon Build AVAIENT DÉJÀ ces quatre icônes, à droite du nom ; c'est la fenêtre de la **Forge** qui n'en avait aucune : elles y sont ajoutées **à droite du nom, sur la ligne du titre**, comme dans les fenêtres Détails (composant `IconesArme`, MÊMES tailles que Détails, mesurées : 35 px pour le type d'arme, 16 px pour les autres). Elles avaient d'abord été posées SOUS le nom : corrigé après sa précision, **version inchangée (0.4.11)**. Les fenêtres Détails n'ont pas été modifiées sur ce point.
5. **Capture de la Mesure corrective : « certaines apparaissent grisées ; on ne voit pas les perks possibles »** : DÉFAUT RÉEL, corrigé pour les armes façonnées. **Cause** : pour chaque prise d'une arme, le code prenait la PREMIÈRE source de perks non vide (liste directe, puis jeu de plugs partagé, puis jeu de plugs aléatoire, puis perk initial). Une arme façonnée a une liste directe d'UN seul perk (le perk « par défaut ») alors qu'un vrai pool existe derrière : la fenêtre n'affichait que ce perk par défaut, grisé et souvent faux (Rainurage polygonal, Chargeur tactique, Décompte meurtrier), et le perk réellement équipé (Frein tête-de-flèche, Chargeur en alliage, Démoralisation) n'apparaissait nulle part ; seul « Munitions déstabilisantes » était juste, par coïncidence. **Deux garanties** dans `obtenirOptionsToutesColonnes` (optionnelles : sans elles, comportement INCHANGÉ pour toutes les armes) : `equipesParColonne` : les perks ÉQUIPÉS de l'exemplaire sont TOUJOURS dans leur colonne, cochés, même absents du Manifest (ajoutés en fin de colonne ; sans doublon ; une prise sans colonne n'en crée pas) ; `toutesSources` : pour une arme façonnée, la colonne reçoit TOUS les perks possibles (liste directe + jeux de plugs + perk initial, sans doublon). Branchées dans les TROIS fenêtres (Forge, Détails de Mon Inventaire et du Coffre, Détails de Mon Build, sur les colonnes RÉELLES).

**Point ouvert, à confirmer avec l'utilisateur** : les diagnostics réels de la **Confiance (autre révision)**, de la **Défense dorée** et de la **Grande Faucheuse** montraient le MÊME motif (liste directe d'un perk + pool derrière, un seul perk affiché par colonne). Ces armes ne sont pas façonnées : leur affichage n'est PAS modifié ici (l'utilisateur avait répondu « Non » à « roll fixe dans le jeu ? » tout en jugeant l'affichage cohérent). Si elles montrent trop peu de perks possibles, le même correctif peut leur être étendu (la garantie des perks équipés, elle, est maintenant active pour TOUTES les armes dans la Forge et les fenêtres Détails).

**Vérifié** : `colonnes-faconnee` (7 : l'état AVANT reproduit exactement la capture (un perk par colonne, le perk équipé absent) ; garantie 1 ; garantie 2 ; les deux ensemble ; aucun doublon ; une arme normale inchangée) ; `forge-inventaire` passe à 69 contrôles (alignement des deux boutons, ordre, icône à gauche du nom, absence de l'encadré, quatre icônes à droite du nom (même ligne, même ordre, deux casses volontaires détectées : sous le nom, disparues), arme façonnée à pool : perks possibles, équipés cochés, perk équipé hors Manifest ajouté) ; `faconnee-listes` passe à 19 (icône à gauche du nom et arme à pool dans les fenêtres Détails de Mon Inventaire et de Mon Build, VRAIS composants) ; `cablage-forge` passe à 15 ; batterie : 34 séries, 548 contrôles ; **quinze casses volontaires toutes détectées** (alignement, ordre des boutons, icône du titre dans la Forge, rangée des quatre icônes, fusion des sources et perk équipé manquant dans la Forge, icône du titre dans les deux fenêtres Détails, réglages des deux fenêtres Détails, les deux garanties en logique, et pour les quatre icônes : sous le nom, disparues, type d'arme à 16 px au lieu de 35).
**Défauts de MON travail, rattrapés en route** : un import devenu inutile oublié (mon remplacement ne correspondait pas à cause d'un commentaire) : retiré (il aurait fait échouer ton build strict) ; plusieurs scripts de modification avec des erreurs de texte à chercher ou de parenthèses (un commentaire en fin de ligne avait avalé une parenthèse fermante dans une page de test) : tout corrigé avant livraison ; un sélecteur de test qui comparait l'icône à elle-même.
**NON vérifié** : le **pool réel de la Mesure corrective** : la fusion des sources suppose que ses perks possibles sont dans la liste directe, un jeu de plugs partagé ou aléatoire ou le perk initial du Manifest ; si elle les range ailleurs, il n'y aura toujours qu'un perk par colonne (le diagnostic de la fenêtre Collection, en `npm run dev`, dira ce que contient son Manifest) ; ma lecture de « légende » (celle de « sous Forge » est confirmée) ; l'aspect sur de vraies armes ; le `npm run build` strict.

### Ajout du 14/10/2026 (soir) sur la 0.4.11 : icône de saison (demande de l'utilisateur : « Envoie la MàJ pour les icônes de saisons » ; il confirme aussi la lecture de « légende » = l'encadré explicatif)

**Demande** : (1) dans les fenêtres Détails (Mon Build, Coffre, Mon Inventaire, Forge, Collection), l'icône de saison « directement à droite du nom de l'arme » ; (2) en dehors de ces fenêtres, sur les miniatures des armes ET des armures. **Version inchangée (0.4.11).**
- **Source** (aucune table à entretenir : les saisons futures s'ajoutent seules) : l'IMAGE est le **filigrane** de l'objet (`iconWatermark` ; repli `iconWatermarkShelved`, hypothèse non vérifiée) ; le NOM vient de `seasonHash` → table `DestinySeasonDefinition` (nom et numéro). `lib/manifest/saison.ts` (`obtenirSaisonObjet`) ne plante jamais (table des saisons absente ou base illisible : l'icône s'affiche sans nom, ou pas du tout), ne devine rien (pas de filigrane = pas d'icône) et garde ses réponses en mémoire par Manifest.
- **Vignettes** (`FiligraneSaison`, via `VignetteArme` et la carte de la Collection) : l'image de Bungie est superposée TELLE QUELLE à la vignette (même taille, symbole dessiné par Bungie en haut à gauche) : Mon Inventaire, Coffre, Mon Build, liste de la Forge, Collection ; **armes ET armures**. L'icône « façonnée » reste en bas à gauche : aucune gêne.
- **Fenêtres Détails** (`IconeSaison`) : l'icône est juste à droite du nom, avant les icônes de type d'arme, d'élément, de munitions et d'antichampion (Forge : après le nom, avant les quatre icônes) ; infobulle et nom accessible : « nom de la saison (saison N) ». **Lecture retenue (à confirmer)** : j'ai mis l'icône aussi dans les fenêtres Détails des ARMURES (Mon Inventaire, Coffre, Mon Build), puisque la demande cite ces fenêtres ; la phrase de l'utilisateur dit « le nom de l'arme ».
- **⚠️ Hypothèse sur le cadrage** : isolé à côté d'un nom, le filigrane entier serait minuscule (c'est une image de vignette). On n'en montre que le COIN en haut à gauche, agrandi (`CADRAGE_SAISON` : départ 3 %, côté 32 % de l'image), d'après la capture de l'utilisateur (le symbole y occupe environ 8 % à 29 % de la largeur). **Aucune vraie image de Bungie n'a été vue** : si un symbole apparaît coupé ou trop petit, il suffit d'ajuster ces deux nombres.
- **Pas ajouté** (non demandé) : les exports (images, textes, PDF), le panneau des Load-outs, les résultats de la recherche dans le Manifest.
- **Diagnostic** (`npm run dev`, bouton de diagnostic de la fenêtre de la Forge) : nouvelle ligne « Saison : seasonHash = … → nom, n° … | filigrane : … » (ou « ABSENT »), pour contrôler ces données sur les objets de l'utilisateur.

**Vérifié** : `saison` (11 : filigrane, nom, numéro, repli, saison orpheline, table des saisons qui lève une erreur, base illisible, mémoire, diagnostic) ; `saisons` (18, VRAIS composants avec un faux Manifest : filigrane sur l'arme et l'armure de Mon Inventaire, du Coffre, de Mon Build, de la Forge et de la Collection, jamais sans filigrane ; il recouvre exactement la vignette de 31 ou 44 px ; l'arme façonnée porte les deux marques sans gêne ; icône à droite du nom (moins de 12 px), même ligne, avant les autres icônes, une seule fois, cadrée, avec nom et numéro en infobulle, dans les cinq fenêtres, armures comprises ; ordre dans la Forge : icône façonnée, nom, saison, quatre icônes ; rien sans filigrane) ; batterie : 36 séries, 577 contrôles ; **dix casses volontaires détectées sur onze** (la onzième, « filigrane en bas à droite », est sans effet : l'image a la taille de la vignette).
**Défaut de MON travail, rattrapé** : mon patch des pages de test avait mis un « retour à la ligne » littéral dans une chaîne brute : le commentaire avalait la ligne suivante (la définition de la base de test) dans les trois pages ; détecté au premier lancement, corrigé.
**NON vérifié** : la présence réelle de `iconWatermark` et de `seasonHash` dans TON Manifest pour tes armes et armures (le diagnostic en `npm run dev` le dira) ; le cadrage de l'icône sur les vraies images ; la lisibilité du filigrane sur des vignettes de 31 px ; mon test utilise une image de 1 pixel : l'apparence réelle des symboles n'est pas contrôlée.

### Ajustements du 14/10/2026 (soir, suite) sur la 0.4.11 : taille de l'icône de saison sur les vignettes, cadre noir des fenêtres Détails (version inchangée)

**Retour de l'utilisateur** : « Très très bien ! » ; PDF de la 0.4.11 renvoyé, **8 cases sur 8 cochées** (le journal en est la trace). Demandes : (1) sur l'image de l'arme, **agrandir l'icône de saison pour qu'elle ait la même taille que l'icône d'arme façonnée, puis uniformiser** pour les armes non façonnées ; (2) dans les fenêtres Détails, « une espèce de **cadre noir** autour de l'icône de saison : possible de l'enlever ? ». Trois diagnostics envoyés (Mesure corrective, As de pique, Eyasluna).

**Ce que les trois diagnostics ont établi** : pour ces trois armes (dont deux exotiques et une façonnée), le Manifest donne bien un **filigrane** (`iconWatermark`) et un filigrane « shelved » : l'icône s'affiche. En revanche **`seasonHash` est ABSENT** : le **NOM** de la saison n'est donc **pas disponible** par ce chemin pour ces objets (l'infobulle dit « Saison de l'objet »). Mon hypothèse de nom par `seasonHash` ne se vérifie pas pour ces objets ; une piste (non faite) serait de relier le filigrane, commun à tous les objets d'une saison, à un nom de saison.

**Cause du cadre noir** (mesurée sur la capture du jeu de l'utilisateur, vignette de 212 px) : l'image de Bungie n'est pas que le symbole : elle contient aussi une **BANDE SOMBRE TRANSLUCIDE** derrière lui, qui s'arrête net à **25,9 %** de la largeur. Le symbole occupe de **5,7 % à 20,3 %** de la largeur et de **3,8 % à 19,3 %** de la hauteur. Mon premier cadrage (de 3 % à 35 %) englobait le bord de la bande : c'était le cadre.
- **Fenêtres Détails (`IconeSaison`)** : cadrage SERRÉ sur le symbole seul (de 4 % à 23 % de l'image, horizontalement ; de 2,5 % à 21,5 % verticalement), qui s'arrête avant le bord de la bande ; et `mix-blend-mode: screen` : en mode « écran », tout ce qui est sombre, même translucide, devient invisible sur le fond sombre de la fenêtre, le symbole blanc reste blanc.
- **Vignettes (`BadgeSaison`, remplace le filigrane entier `FiligraneSaison`, supprimé)** : le symbole y était trop petit (le filigrane entier était superposé tel quel). Il est maintenant rendu **à la même taille visible que le dessin de l'icône façonnée** (`tailleGlypheVignette` : un tiers de la vignette, 10 px sur 31, 14 px sur 44 ; la boîte de saison est un peu plus grande que le symbole qu'elle contient : 13 px et 18 px), **en haut à gauche**, **uniformément pour toutes les armes et armures**, avec le même petit fond translucide et les mêmes marges que l'icône façonnée (**choix de ma part, à confirmer** : le fond peut être retiré).

**Vérifié** : `saisons` réécrit (22 contrôles, VRAIS composants) dont la mesure des **PIXELS** dans le navigateur : avec un filigrane d'essai qui reproduit la bande sombre translucide, l'icône a EXACTEMENT la couleur du fond de la fenêtre autour du symbole (écart de 0 sur 255) et le symbole reste blanc ; **sans** le mode « écran », le même test voit la bande revenir (le test sait voir le cadre) ; tailles : symbole de saison = icône façonnée à un pixel près (10 px et 14 px), boîte identique sur l'arme façonnée, l'arme normale et l'armure ; icône en haut à gauche, jamais sur l'icône façonnée (en bas à gauche) ; cinq vues et cinq fenêtres ; batterie : 36 séries, 581 contrôles ; **huit casses volontaires toutes détectées** (mode « écran » retiré, ancien cadrage large, boîte de taille fixe, icône déplacée en bas, part du symbole faussée, icône façonnée de taille différente, icône absente des vignettes, absente de la Collection).
**Défaut de MON travail, rattrapé** : pour la deuxième fois, un « retour à la ligne » littéral dans une chaîne brute de mon script de modification a laissé un commentaire avaler un import (`tailleGlypheVignette`) : mon contrôle de syntaxe ne détecte pas un nom non défini, c'est le test d'interface qui l'a révélé au premier lancement (réparé).
**NON vérifié** : la forme du symbole des AUTRES saisons (mesures sur UN symbole : le cadrage garde une marge, mais un symbole plus grand pourrait être coupé : à regarder sur plusieurs saisons) ; le filigrane réel de Bungie (le test en fabrique un d'après les mesures) ; le mélange « écran » dans l'application installée (même moteur que le test, mais non essayé).

### Ajout du 14/10/2026 (nuit) sur la 0.4.11 : nom de la saison déduit du filigrane (demande de l'utilisateur : « Veux-tu que je cherche un autre moyen d'afficher le vrai nom ? » — « Oui »)

**Constat de départ** : ses trois diagnostics (Mesure corrective, As de pique, Eyasluna) montraient un filigrane mais **pas de `seasonHash`** : l'infobulle ne pouvait dire que « Saison de l'objet ».
**Recherche** : le dépôt public de DIM (`DestinyItemManager/d2-additional-info`, licence MIT) documente un fichier `watermark-to-season.json` (« filigrane → saison ») ; c'est donc bien l'approche de la communauté, le Manifest ne donnant pas toujours `seasonHash`. Les **données** de ce fichier n'ont pas pu être récupérées (dossier refusé aux accès automatiques, fichier absent des résultats de recherche) et **rien n'a été recopié** : l'appli construit elle-même la correspondance sur le Manifest de l'utilisateur. Seule référence retenue : le tableau des saisons de DIM (1 « Guerre rouge » à 28 « Renegades ») pour comprendre la numérotation.
**Principe** (`lib/manifest/saison.ts`) : tous les objets d'une même saison partagent la MÊME image de filigrane. Un objet SANS `seasonHash` est donc nommé d'après les AUTRES objets du Manifest qui ont la même image ET un `seasonHash`. Au premier besoin, un **balayage en arrière-plan** (une fois par Manifest, par tranches d'environ 12 ms : l'affichage ne se fige pas) lit les objets qui ont un `seasonHash` et retient, pour chaque filigrane (principal et « shelved »), la saison la plus FRÉQUENTE (vote majoritaire). Quand il est fini, les icônes se réaffichent (`useVersionSaisons`) et reçoivent leur nom. Un objet qui a son propre `seasonHash` n'est jamais renommé ; un objet orphelin (aucun autre objet de son filigrane ne connaît sa saison) garde son icône sans nom ; une erreur du balayage est avalée (il se termine à vide).
**Diagnostic** (`npm run dev`, fenêtre de la Forge) : la ligne « Saison : … » dit maintenant la saison déduite du filigrane (ou « AUCUNE ») et l'état du balayage : « fini, N objet(s) du Manifest ont un seasonHash, M filigrane(s) reliés à une saison ».
**Vérifié** : `saison` passe à 22 contrôles (nommage par un voisin de même image, filigrane « shelved », vote majoritaire, objet qui garde son propre nom, orphelin, balayage qui plante, aucun seasonHash dans tout le Manifest, mémoire, une seule exécution du balayage, diagnostic, icône disponible AVANT la fin du balayage) ; `saisons` passe à 26 (VRAIS composants : le nom « Saison de la Sorcière (saison 22) » apparaît tout seul sur les vignettes et dans la fenêtre Détails pour des objets sans seasonHash ; une fenêtre ouverte PENDANT un balayage volontairement ralenti (100 objets de référence à 15 ms) reçoit son nom sans être rouverte) ; batterie : 36 séries, 596 contrôles ; **neuf casses volontaires détectées** (déduction supprimée, vote remplacé par « le premier », filigrane « shelved » ignoré, nom non marqué « déduit », objet à son propre nom renommé, mémoire non invalidée, erreur du balayage non avalée, réaffichage supprimé dans les fenêtres Détails).
**Défauts de MON travail, rattrapés** : (1) le test ne détectait pas la suppression du réaffichage de l'icône des fenêtres Détails (il les ouvrait après la fin du balayage, quasi instantané sur un faux Manifest) : ajout d'un balayage ralenti pour ouvrir la fenêtre PENDANT le balayage ; (2) le crochet de réaffichage du badge des vignettes était redondant (son enfant a le sien) : retiré.
**NON vérifié (à contrôler sur les données de l'utilisateur)** : que SON Manifest contient des objets avec `seasonHash` partageant le filigrane de ses armes (sinon les noms restent « Saison de l'objet » : le diagnostic dira « 0 objet(s) du Manifest ont un seasonHash ») ; la durée réelle du balayage sur un vrai Manifest (il se fait en tranches, mais la requête lit toute la table des objets) ; la justesse des noms sur des saisons rééditées (une arme d'une ancienne saison reprise plus tard avec un autre filigrane) ; la table des saisons dans sa langue.

### Ajustement du 15/10/2026 sur la 0.4.11 : alignement des deux icônes sur la vignette (demande de l'utilisateur : « On peut faire mieux pour l'alignement des icônes sur l'image d'arme ? Sinon on revient en arrière et on diminue un peu la taille. »)

**Capture reçue** (`Alignement_icones.PNG`, trois lignes de Mon Inventaire, environ ×2). **Défaut réel, de MON fait** : les deux pastilles de la vignette n'avaient PAS la même taille. Celle de la saison (haut gauche) enveloppait une boîte de 13 px (15 px avec sa marge), celle de l'arme façonnée (bas gauche) un dessin de 10 px (12 px) : bords gauches alignés, bords droits et tailles différents. J'avais en effet dimensionné chaque pastille par une marge différente pour que les SYMBOLES aient la même taille.
**Correction (version inchangée)** : les DEUX pastilles sont maintenant le **même carré fixe** (`tailleBadgeVignette` : le symbole plus une marge de 2 px, 3 px sur une grande vignette), au **même retrait du bord** (`RETRAIT_BADGE_VIGNETTE`, 2 px à gauche, en haut pour la saison, en bas pour la façonnée), le symbole **centré** dedans. **Seconde option de l'utilisateur, appliquée en partie** : avec 14 px de côté, les deux carrés se CHEVAUCHAIENT d'un pixel sur une vignette de 31 px (test en échec) ; le symbole passe donc de 32 % à **30 % de la vignette** (9 px sur 31, 13 px sur 44 ; avant 10 et 14), ce qui donne des carrés de **13 px** (31) et **19 px** (44) avec un petit espace entre eux. Le symbole de saison garde la même taille visible que celui de l'arme façonnée (boîte de 12 px et 17 px).
**Vérifié** : `saisons` passe à **28 contrôles** : valeurs mises à jour et deux contrôles d'alignement (vignettes de 31 px : même carré de 13 px pour la saison et la façonnée, même retrait de 2 px, symboles centrés, espace d'au moins 1 px entre les deux, même carré sur l'arme normale et l'armure ; Forge, vignette de 44 px : carrés de 19 px) ; **six casses volontaires toutes détectées** (pastille façonnée redevenue « enveloppe du dessin », pastille de saison décalée, symbole non centré, pastille façonnée collée au bord du bas, ancienne taille des symboles, carrés de tailles différentes).
**NON vérifié** : l'aspect sur les vraies vignettes à l'échelle de l'écran de l'utilisateur (l'aperçu utilise un symbole d'essai) ; la lisibilité des symboles à 9 px ; si la taille lui convient (on peut réduire encore d'un cran : un seul nombre dans `tailleVignette.ts`).

### Retour à la taille d'origine sur les miniatures (15/10/2026, demande de l'utilisateur : « Ok, ça va pas. Sur les images miniatures des armes, remets l'icône à la taille qu'on avait au début. Puis la suite. »)

**Constat** : après l'agrandissement (pastille de saison à la taille de l'icône façonnée), puis l'ajustement d'alignement (deux carrés identiques, symboles à 30 %), l'utilisateur rejette le résultat.
**Fait (version inchangée)** : sur les miniatures, retour à l'état de l'« icône à la taille du début » : le **filigrane de Bungie superposé TEL QUEL** (`FiligraneSaison`, image de la taille de la vignette, symbole du jeu en haut à gauche sur sa petite bande sombre, comme en jeu) ; **supprimés** : `BadgeSaison` (pastille agrandie puis alignée), `tailleBadgeVignette`, `RETRAIT_BADGE_VIGNETTE` et `CADRAGE_SAISON.partSymbole` (qui ne servait qu'à la pastille). **Lecture retenue (à confirmer)** : « l'icône » = l'icône de saison des miniatures ; j'ai AUSSI rétabli l'icône des armes façonnées à sa taille d'avant (un tiers de la vignette : 10 px sur 31, 14 px sur 44, dans sa pastille de 12 px et 18 px), que l'essai d'alignement avait réduite à 9 px et 13 px.
**Inchangé** : les fenêtres Détails (icône de saison cadrée serré sans cadre noir, mélange « écran », à droite du nom) et le nom de la saison déduit du filigrane.
**Vérifié** : `saisons` réécrit (23 contrôles, VRAIS composants) : filigrane qui recouvre EXACTEMENT la vignette de 31 px (Mon Inventaire, Coffre, Mon Build) et de 44 px (Forge, Collection), armes et armures, absent sans filigrane ; icône façonnée à sa taille d'origine (10 px dans 12 px ; 14 px dans 18 px) ; les contrôles des fenêtres Détails, du cadre noir (pixels), du nom déduit et du réaffichage sont conservés ; batterie : 36 séries, 593 contrôles ; **cinq casses volontaires toutes détectées** (filigrane absent des vignettes, absent de la Collection, filigrane agrandi, icône façonnée réduite, pastille façonnée à une autre marge).
**NON vérifié** : que « la taille qu'on avait au début » soit bien celle que l'utilisateur visait (l'aperçu utilise un symbole d'essai) ; l'aspect sur ses vraies miniatures. **À ne pas refaire sans demande** : la pastille agrandie ou alignée sur les miniatures (rejetée deux fois).

## 14/10/2026 — v0.4.10 : bouton « Retour » dans la fenêtre de la Forge, armes façonnées

**Numéro de version** : 0.4.10 (installateur `Forge-Armory-Setup-0.4.10.exe`, liste `A-TESTER-0.4.10.pdf`). La 0.4.9 reste telle que testée.

**VALIDATIONS CONFIRMÉES par les trois PDF renvoyés le 14/10/2026** (lus en lecture seule, case par case ; l'archive des tests ayant été supprimée à la demande de l'utilisateur, ce journal en est la trace) :
- **0.4.6 : 9 cases sur 9** (installation, page Forge sans titre, chargement de l'inventaire, roll réel, arme améliorée, simulation, conservation, rien ne bouge en jeu, deux exemplaires) : confirme la validation jusque-là seulement déclarée.
- **0.4.7 : 6 cases sur 6** (installation, quatre niveaux, légende, perks améliorés, simulation inchangée, diagnostic de la donnée de Bungie) : idem.
- **0.4.9 : 11 cases sur 11** (installation, antichampion MIDA (les deux tests repris de la 0.4.8 : **la 0.4.8 est donc validée**), score en temps réel, badge et indication, « Détails » de Mon Build, bouton Forge des trois fenêtres, avertissement à l'équipement, enregistrement et partage sur les perks réels, deux exemplaires, exports sur les seuls perks sélectionnés). **Réserve de l'utilisateur sur le test 007 (bouton Forge)** : le bouton fonctionne dans Mon Inventaire, le Coffre et Mon Build, mais « une fois dans la Forge, je ne vois pas le bouton retourner au Build Analyzer » ; case cochée quand même (« je coche tout de même le test »). **Défaut réel, corrigé ci-dessous.** La case du test 009 (« Dis-moi si cette règle te convient » : enregistrement, partage et export sur les perks réels) est cochée sans objection : règle considérée comme confirmée.

**Fait**
- **Bouton « ← Retour » dans la fenêtre de l'arme** (défaut de la 0.4.9) : à l'arrivée depuis un bouton « Forge », la Forge ouvre seule la fenêtre de l'arme, dont le fond sombre couvre toute la page : le bandeau de retour, placé derrière, était assombri et inutilisable tant que la fenêtre était ouverte. **Mon test précédent fermait d'abord la fenêtre avant de chercher le bouton : il ne couvrait pas l'usage réel.** Le retour est maintenant proposé **tout en haut de la fenêtre** (« ← Retour à Build Analyzer »), visible et cliquable sans la fermer ; il ferme la fenêtre et revient à la vue d'origine ; il n'existe que si l'on vient d'un bouton « Forge ». Le bandeau reste au-dessus des onglets.
- **Armes façonnées (« forgées »)** (`lib/forge/faconnee.ts`) : demande de l'utilisateur (« peut-on identifier les armes qui ont été forgées ? perks fixes, modifiables en jeu sur un outil spécifique »), avec le diagnostic réel de la **Mesure corrective**. **Constat sur ses données** : elle porte, à la **prise 10**, le perk équipé **« Arme façonnée » (4029346515)**, absent de la Confiance et de l'Outil polyvalent MIDA ; et chacune de ses colonnes de perks (prises 1 à 4 et 8) ne liste que le perk **équipé** comme « disponible ». Détection : ce hash, ou, en repli, le nom du perk (« Arme façonnée » ; « Crafted Weapon » en anglais : **supposition non vérifiée**), sans accents ni majuscules, avec mémoire par Manifest. Dans la Forge (vue Inventaire) : l'**icône du jeu** (voir ci-dessous) posée en bas à gauche de la vignette de l'arme, case « Seulement les armes façonnées », mention « façonnée » dans la description, **note** dans la fenêtre (perks fixes en jeu, changés seulement à la forge en jeu ; l'appli montre les perks possibles de ce modèle, les grisés étant ceux qui ne sont pas équipés, et marque les équipés d'une coche ✓) ; la simulation fonctionne comme pour les autres armes ; ligne « Arme façonnée : OUI/non » dans le diagnostic (npm run dev). **NON fait, par DÉCISION de l'utilisateur (14/10/2026)** : lire les perks que l'utilisateur a DÉVERROUILLÉS pour la forge en jeu (« je ne pense pas que ce soit bien utile ; on garde les perks possibles sur l'arme, et les perks actifs dans Détails »). La note de la fenêtre ne promet donc plus cette lecture.
- **Icône des armes façonnées, celle du jeu** (demande de l'utilisateur, avec deux images : l'icône grise du jeu et une capture où elle apparaît « avec une nuance de rouge » en bas à gauche de la vignette d'une arme) : `components/IconeFaconnee.tsx` et `data/forge/iconeFaconnee.ts`, **générés** par l'outil ponctuel `scripts/tracer-icone-faconnee.py` à partir de l'image de l'utilisateur (conservée, avec la capture, dans `ressources-installateur/forge-armory/icone-faconnee/`) : un quadrant tracé au niveau de contour médian puis reflété (symétrie parfaite), recadré sur l'étendue réelle du dessin ; **recouvrement de 98,1 % avec l'image** à la vectorisation et **99,8 %** mesurés dans le navigateur. **Teinte : saumon corail `#e49f87`**, mesurée sur les blocs éclairés de la capture du jeu (trait vert du cercle de l'utilisateur écarté ; les blocs du bas paraissent plus sombres à cause du dégradé de la vignette). **Placement comme dans le jeu** : en bas à gauche de la vignette de l'arme, sur un petit fond sombre translucide pour rester lisible ; nom accessible « Arme façonnée » et infobulle sur l'enveloppe ; elle remplace le texte « 🔧 Façonnée » et l'emoji de la note. Pas encore posée dans Mon Inventaire, le Coffre ni Mon Build (non demandé).
- **Notice** : section « Armes façonnées », icône et bouton de retour.

**Icône des armes façonnées PARTOUT** (demande de l'utilisateur, 14/10/2026 : « oui, il faut la mettre partout ») : composant partagé `components/VignetteArme.tsx` (vignette + icône en bas à gauche, taille d'environ un tiers de la vignette, même teinte, même nom accessible « Arme façonnée », même infobulle), utilisé par **Mon Inventaire** et le **Coffre** (`LigneObjet`, vignette de 31 px), **Mon Build** (`LignePiece`, 31 px, détection sur les perks RÉELS : une arme façonnée aux perks simulés garde son icône) et la **liste de la Forge** (44 px ; la carte est refaite avec le même composant, place de la vignette réservée même sans image). Les **armures** ne reçoivent jamais l'icône (même celles qui portent le perk), ni les armes non façonnées, ni les armes non possédées. **Défaut de MON travail trouvé en écrivant ces tests, corrigé** : `appliquerSimulationPiece` reconstruisait une pièce SANS `perksParColonne` (cas d'un ancien build enregistré) à partir de ses seules colonnes simulées, ce qui faisait **perdre tous ses perks réels au score** ; la simulation ne s'applique maintenant PAS à une telle pièce (rendue telle quelle ; « Mettre dans Mon Build » depuis la Forge la remplace par la pièce de l'inventaire, qui a ses colonnes). **Vérifié** : `faconnee-listes` (13, VRAIS composants `SelecteurInventaire` et `ResumeBuild` : l'icône sur l'arme façonnée du Titan et du Coffre, pas sur l'arme normale à image ni sur l'armure qui porte le même perk, exactement deux icônes dans la page, bon endroit, bonne taille, bonne teinte ; dans Mon Build, arme façonnée, arme façonnée ET simulée, arme simulée non façonnée, aucune) ; `forge-inventaire` (+1 : arme façonnée sans image) ; `appliquer-simulation` (+1 : pièce sans colonnes) ; **sept casses volontaires toutes détectées, dont deux d'abord NON détectées** : l'armure d'essai de Mon Build ne portait pas le perk piège, et aucun test de la Forge n'avait d'arme sans image : trous de mes tests comblés. **NON vérifié** : l'aspect et la lisibilité de l'icône sur de VRAIES vignettes de 31 px (l'icône y fait environ 10 px) ; une arme sans image dans Mon Inventaire ou Mon Build n'affiche rien (comme avant).
**Question de l'utilisateur : « pour les armes façonnées, ça apparaîtra aussi sur les armes exotiques ? »** Réponse : **oui, l'appli ne regarde pas la rareté** : toute arme qui porte le perk équipé « Arme façonnée » reçoit l'icône. Et **quelques exotiques sont bien façonnables dans le jeu** (d'après des guides consultés le 14/10/2026 : les trois glaives exotiques de L'Ombre de la Reine, Dead Messenger, Dead Man's Tale, The Call ; liste à ne pas supposer exhaustive ni à jour). **Jusque-là aucun test ne couvrait une exotique façonnée** : ajouté (page de test : une exotique façonnée `w6`, activée par `?exotique`, et une exotique non façonnée `w3` qui sert de témoin) : 5 contrôles (reconnue, même icône au même endroit et même teinte, contour doré d'exotique conservé, le témoin n'a pas l'icône, filtre, note de la fenêtre) ; **deux casses volontaires détectées** (exotiques exclues ; toute exotique prise pour une façonnée). **NON vérifié** : aucune donnée réelle d'exotique façonnée n'a été vue : je suppose qu'elle porte le même perk « Arme façonnée » (le repli par le nom couvre un autre identifiant, pas un autre nom) ; si l'icône manque sur une exotique façonnée, le diagnostic de sa fenêtre (npm run dev) dira ce qu'elle porte.
**Décision de l'utilisateur confirmée** (14/10/2026) : on ne lit PAS les perks déverrouillés pour la forge en jeu (« pas bien utile : on garde les perks possibles sur l'arme et les perks actifs dans Détails ») ; un commentaire de code encore périmé à ce sujet est corrigé.
**Vérifié** : `faconnee` (7, **sur les données réelles** : la Mesure corrective est reconnue, la Confiance et l'Outil polyvalent MIDA ne le sont pas ; un seul perk disponible par colonne de perks sur l'arme façonnée, donc « reel » pour l'équipé et « possible » pour les autres, jamais « disponible » ; repli par le nom, casse et accents, cas limites) ; `forge-inventaire` passe de 44 à 62 contrôles (**retour dans la fenêtre ouverte** : présent, visible, au-dessus du nom, cliquable sans fermer, prévient la page une fois ; absent sans arrivée depuis « Forge » ; deux armes façonnées reconnues, l'une par le hash l'autre par le nom ; badge, filtre, note, simulation, aucune note sur une arme normale) ; batterie : 33 séries, 526 contrôles ; **six casses volontaires toutes détectées** (retour supprimé de la fenêtre, retour affiché sans arrivée depuis « Forge », hash connu inopérant, repli par le nom supprimé, note affichée partout, filtre inopérant). **Icône** : `icone-faconnee` en logique (5 : quatre sous-tracés fermés, tenue dans le cadre, symétrie à quatre axes, nombre de points, couleur) et en interface (3 : **fidélité à l'image du jeu**, quatre blocs reconnus, **couleur identique à celle mesurée sur la capture**), plus deux contrôles dans `forge-inventaire` (position en bas à gauche de la vignette, teinte réellement affichée) ; **six casses volontaires de plus toutes détectées** (couleur changée, en fidélité et en interface ; point du tracé déplacé ; icône en haut à droite ; note qui reparle des déverrouillages ; icône absente de la note).
**NON vérifié** : le **comportement réel du retour** dans l'application complète (la page principale n'a pas de page de test : seul le composant de la Forge est monté, avec la fenêtre ouverte comme à l'arrivée) ; que **toutes** les armes façonnées de l'utilisateur portent ce même perk (une seule arme façonnée a été vue : le repli par le nom couvre un autre hash, mais pas un autre nom) ; le nom anglais ; la perte éventuelle de la position de défilement au retour.
**Défauts de MON travail** : en préparant ce complément, j'ai **régénéré par erreur** le fichier de données de l'icône (`iconeFaconnee.ts`) et l'outil de tracé avec une autre structure, ce qui cassait le composant existant : détecté en comparant le projet au dernier zip, **rétabli à l'identique** (aucune différence avec le zip livré), et mes copies en double des images retirées ;  le test du retour de la 0.4.9 fermait la fenêtre avant de chercher le bouton (voir ci-dessus) ; deux de mes nouveaux tests de l'icône avaient des seuils faux (entiers numpy que le navigateur ne sait pas lire ; tolérances d'arrondi trop strictes) et mon premier tracé débordait du cadre de 0,1 % (recadré) ; une « casse volontaire » de la série précédente avait montré que ce garde-fou n'était pas exercé : leçon appliquée ici (le test clique le bouton fenêtre ouverte).

## 14/10/2026 — v0.4.9 : le score tient compte des perks simulés (lien Forge → score)

**Numéro de version** : 0.4.9 (installateur `Forge-Armory-Setup-0.4.9.exe`, liste `A-TESTER-0.4.9.pdf`).

**Retour de l'utilisateur** : « Feu vert. » pour la suite de la Forge (lien avec le score, « Équiper vers Mon Build », bouton « Forge » des fenêtres Détails). Aucun retour sur la 0.4.8 : ses 3 tests sont **repris** dans la liste de la 0.4.9 (comme la 0.4.5 l'avait été dans la 0.4.6).

**Fait** (spécification de la Forge du 12/10/2026, §1, §4, §7, §8)
- **Le moteur de score n'est PAS modifié.** Il lit déjà `perkHashes` de chaque pièce (extraction des verbes de « Effets du Build », `extraireTextesEffetsBuild`) : on lui donne des pièces dont `perkHashes` tient compte de la simulation. `lib/forge/appliquerSimulation.ts` (pur) rend, pour chaque ARME POSSÉDÉE ayant une simulation, une COPIE où chaque colonne simulée est remplacée par le perk à COMPTER (« effectif », version améliorée comprise) ; la pièce d'origine n'est jamais modifiée ; le même objet est rendu quand il n'y a rien à appliquer ; l'armure n'est jamais touchée ; la simulation est cherchée par exemplaire (deux exemplaires restent indépendants). `pieceReelle` remet les perks réels (pour renvoyer une arme de Mon Build vers la Forge).
- **Temps réel** : un **magasin partagé** (`lib/forge/storeSimulations.ts`, `useSyncExternalStore`) remplace l'état local de la vue Inventaire : la Forge le modifie, la page principale le lit, donc chaque clic met le score à jour. La page principale calcule `buildEffectif = appliquerSimulations(monBuild, simulations)` et l'utilise pour le **score**, l'**affichage de Mon Build**, le compteur et le diagnostic du pilier 2. **Décision (à confirmer par l'utilisateur)** : l'**enregistrement, le partage, l'export vers DIM et les Load-outs gardent le build RÉEL** (`monBuild`) : on ne sauvegarde ni ne partage jamais des perks simulés ; la simulation reste liée à l'exemplaire, donc elle s'applique à tout build qui contient cet exemplaire tant qu'on ne l'efface pas.
- **« Équiper vers Mon Build »** : bouton « ➕ Mettre dans Mon Build » dans la fenêtre d'une arme de la Forge (même fonction que « + Ajouter »), message de confirmation (« le score tient compte de votre simulation, en temps réel. Rien n'est équipé en jeu »), grisé en « ✓ Déjà dans Mon Build » pour cet exemplaire.
- **Mon Build** : badge « 🔨 simulé » sur l'arme (infobulle : nombre de colonnes, prises en compte dans le score, pas appliquées en jeu) ; la fenêtre Détails marque toujours le roll RÉEL (✓) ; **avertissement dans les deux confirmations d'équipement en jeu** (une arme, ou tout le build) : les perks simulés ne sont pas appliqués, l'arme est équipée avec ses perks réels ; mention « 🔨 Score calculé avec des perks simulés (N arme(s)) » à côté du score global.
- **Bouton « 🔨 Forge » dans les trois fenêtres Détails** (Mon Inventaire, Coffre, Mon Build ; armes possédées seulement, jamais sur une armure) : la page passe sur la Forge, vue Inventaire, et ouvre l'arme (même si l'inventaire de la Forge n'est pas chargé), à partir de son roll réel ; bandeau « ← Retour à Build Analyzer » : le Build Analyzer étant resté monté, le retour retrouve tout tel quel (fenêtre Détails comprise).

**Vérifié** : `appliquer-simulation` (19 : application aux pièces et aux builds, copies, exemplaires indépendants, perk « effectif », colonne ajoutée, même objet si rien à faire, pièce réelle et aller-retour, **magasin partagé**, et la **chaîne jusqu'au VRAI moteur de score** : le verbe du perk simulé (« Blessure solaire », build solaire) fait monter le pilier des verbes et le score global, et supprimer la simulation ramène EXACTEMENT le score réel) ; `cablage-forge` (13, test de **câblage** : il lit le texte du code, car la page principale n'a pas de page de test : le score et Mon Build reçoivent `buildEffectif`, l'enregistrement, le partage, l'export et les Load-outs reçoivent `monBuild`, liste fermée des 6 usages de `buildEffectif`, envoi à la Forge depuis le roll réel, retour) ; `resumebuild` (12, nouvelle page de test du VRAI Mon Build : badge, ✓ réel, bouton Forge, armure et arme non possédée sans bouton, les deux avertissements d'équipement avec les confirmations refusées) ; `forge-inventaire` passe de 33 à 44 contrôles (un espion qui lit le MÊME magasin voit le perk compté changer dès le clic, « Mettre dans Mon Build », arrivée depuis « Forge » avec bandeau et retour) ; `detail-popup` passe de 5 à 8 (bouton Forge de l'Inventaire) ; batterie : 28 séries, 467 contrôles ; **quinze casses volontaires toutes détectées** (perk choisi compté à la place de l'effectif, pièce d'origine modifiée, `pieceReelle` inopérant, magasin muet, score sur le build réel, PARTAGE avec les perks simulés, Forge qui reçoit le roll simulé, ✓ sur un perk simulé, bouton Forge sur une armure dans les deux fenêtres, Forge qui ne passe plus sur Inventaire, bouton « Mettre dans Mon Build » jamais grisé, deux avertissements d'équipement, badge sur toutes les pièces). Compilateur strict (`tsc`, `noUnusedLocals`) lancé ici sans les types React (absents de cet environnement) : **aucune erreur de logique ni variable inutilisée** dans les fichiers modifiés ; les seules erreurs restantes (9, de la forme « `key` non assignable ») sont sur des lignes existantes et du même type que dans les fichiers non touchés.
**Défauts de MON travail, rattrapés en route** : deux scripts de modification arrêtés AVANT d'écrire (guillemets, puis comptage d'appels faux : aucun fichier touché à moitié) ; mon test de bout en bout utilisait un verbe qui n'existe pas dans le catalogue (« Brûlure » : le verbe solaire s'appelle « Blessure solaire ») et un build sans élément ; une section de scénario qui refermait deux fois la même fenêtre ; un comptage d'usages faux (8 au lieu de 6) dans le test de câblage.
**NON vérifié** : la page principale n'a pas été montée (connexion Bungie, Manifest, inventaire) : le câblage est protégé par un test de texte, pas par un clic dans la vraie page ; le **score réel sur ton compte** avec tes armes (le test utilise un faux Manifest et un build solaire d'essai) ; le **retour** depuis la Forge (le Build Analyzer reste monté et caché, donc la fenêtre Détails doit réapparaître telle quelle, mais le défilement de la page n'est pas restauré : la page remonte en haut à l'aller) ; le `npm run build` strict avec les vrais types.

### Ajustements du 14/10/2026 (nuit) sur la 0.4.9, à la demande de l'utilisateur (« garde la version 0.4.9 »)

- **`.gitignore`** : remplacé par le fichier envoyé par l'utilisateur (`ATT09022_gitignore.txt`). Les lignes de motifs sont reprises à l'identique ; le bloc « Remarques : … » qui terminait le fichier n'était **pas commenté** : git l'aurait lu comme des motifs (vérifié : il ignorait alors un fichier nommé littéralement « Remarques : », sinon sans effet). Il est donc mis en **commentaire** (`# `), le texte est conservé. **Vérifié avec git** sur des fichiers du projet : sont ignorés `A-TESTER*` (dont `documentation/sources/A-TESTER.md`), `GUIDE-DEMARRAGE*`, `NOTES-CONCEPTION.md`, `installateur/`, `builds/*.json`, `dist/`, `.env.local`, `*.tsbuildinfo`, `node_modules` ; restent **publiés** `CHANGELOG.md`, `TODO.md`, `README.md`, `NOTICE.md`, `src/`, `documentation/LISEZ-MOI.md`. Rappel (déjà dans ses remarques) : un fichier DÉJÀ envoyé sur GitHub n'est pas retiré par le `.gitignore` : `git rm --cached <fichier>`.
- **Archive des tests supprimée** : `documentation/tests/ARCHIVE-TESTS-2026-09-27.md` (111 sections validées y étaient archivées) est supprimée, ainsi que le dossier `documentation/tests/` devenu vide ; `documentation/LISEZ-MOI.md`, l'en-tête de la liste de tests et `TODO.md` sont corrigés. **Ne pas recréer cette archive sans demande de l'utilisateur** ; l'historique des validations reste dans les entrées de ce journal.
- **Règle d'export** (« l'export infographique reste sur les perks réels, et on affiche sur les images, textes et PDF uniquement les perks sélectionnés ; même règle pour les armures ») : la fiche (image, texte, PDF) ne lisait déjà que `perkHashes`, les perks ÉQUIPÉS ; mais **j'avais introduit une fuite en 0.4.7** : l'enregistrement d'un build fait `structuredClone(build)`, donc il copiait aussi `plugsDisponiblesParColonne` (les perks DISPONIBLES mais NON sélectionnés de chaque arme), et le fichier d'échange JSON et la sauvegarde complète la contenaient. Corrigé par `lib/loadouts/pieceExportable.ts` (`pieceExportable`, `buildExportable`, pures) : elle retire cette liste, et remet les perks RÉELS si une copie « avec simulation » arrivait là. Branchée dans **l'enregistrement** (`construireLoadout`), le **fichier d'échange** (`serialiserUnLoadout`), la **sauvegarde complète** (`exporterLoadouts`, qui nettoie aussi les builds enregistrés AVANT ce correctif, sans toucher à ce qui est stocké) et la **fiche** (`construireFiche`, garde-fou). Le build vivant garde sa liste (la Forge en a besoin). Les armures n'ont ni perks disponibles ni simulation : elles sortent inchangées, avec leurs seuls mods équipés.
- **Vérifié** : `export-perks-selectionnes` (12 : la fonction, l'enregistrement, la fiche, le texte copié, le HTML qui sert d'image et de PDF, le garde-fou avec une copie simulée fabriquée à la main, le fichier d'échange sur un build ancien, la sauvegarde complète, les armures) ; **six casses volontaires toutes détectées** (la première version de mon test ne détectait pas la casse du garde-fou de la fiche : il passait par `construireLoadout`, qui nettoie déjà ; corrigé). Batterie : 29 séries, 479 contrôles.
- **Défauts de MON travail, rattrapés en route** : j'ai inséré un import au premier « import » du fichier, qui était dans un COMMENTAIRE (une ligne coupée en deux : erreur de syntaxe détectée aussitôt) ; rétabli, et comparé au dernier zip : seules mes modifications y figurent ; une commande de vérification utilisait une syntaxe que le shell de l'outil refuse (rien n'avait tourné : refaite).
- **NON vérifié** : le rendu réel des JPEG, PNG et PDF produits à partir de la fiche (seuls le contenu de la fiche, le texte copié et le HTML source sont testés) ; ce que contiennent les builds déjà enregistrés dans TON navigateur (ils sont nettoyés à la sortie, pas dans le stockage) ; une arme ouverte dans la Forge depuis un build chargé d'un Load-out enregistré dira « disponibilité non lue » (la liste n'y est plus : rechargez l'inventaire).

## 14/10/2026 — v0.4.8 : antichampion des armes MIDA (et lecture réelle des perks disponibles confirmée)

**Numéro de version** : 0.4.8 (installateur `Forge-Armory-Setup-0.4.8.exe`, liste `A-TESTER-0.4.8.pdf`).

**Retour de l'utilisateur sur la 0.4.7** : « Tout le reste est validé. » (le PDF n'a pas été renvoyé : validation déclarée, notée comme telle dans l'archive ; **111 sections validées**), avec les deux diagnostics demandés par le dernier test (Confiance et Outil polyvalent MIDA) et un « petit ajout en passant » : l'icône d'antichampion n'apparaît pas pour deux armes MIDA : armature **Synergie MIDA** + arme **Outil polyvalent MIDA** = anti-**Surchargé** ; armature Synergie MIDA + arme **Outil macro MIDA** = anti-**Implacable**.

**Ce que les deux diagnostics ont établi** (jamais vu avant, c'était le point NON vérifié de la 0.4.7) : **la forme réelle du composant 310 de Bungie est celle de la documentation** : 13 prises lues par arme (0 à 12) ; le perk équipé figure dans sa propre liste, sauf à la prise 10 de la Confiance (un ornement : « Foi aveugle » équipé, liste = « Confiance ») ; les colonnes de TRAITS de la Confiance ont de vraies alternatives (3 perks disponibles aux prises 3 et 4) ; les mods d'arme (prise 6) en listent 19 ; l'armature (prise 0) et les compteurs n'en ont aucune. À noter pour la suite : le **palier** de l'exemplaire se lit dans ses prises (prise 7 « Palier Pièce maîtresse : … » équipé, prise 12 « Amélioration de palier d'équipement vide »), sans lecture supplémentaire. Aucun changement de code nécessaire : l'extraction et les quatre niveaux fonctionnent sur ces données (voir « Vérifié »).

**Fait**
- **Règle de l'armature « Synergie MIDA »** (`championSynergieMIDA` dans `lib/manifest/antiChampionExotiques.ts`, branchée dans la déduction d'origine `deduireAntiChampion`) : les deux armes ont le MÊME nom d'armature, c'est donc le NOM DE L'ARME qui décide (« polyvalent » : surcharge ; « macro » : implacable). Rapprochement sans accents ni majuscules et par mot entier ; une arme qui porte l'armature mais dont le nom n'a aucun de ces mots reste SANS icône (on ne devine pas). Pourquoi l'icône manquait : la liste de référence des exotiques ne connaît que l'ancien nom **« Outil multifonction MIDA » (bloqueur)**, que le Manifest appelle maintenant « Outil polyvalent MIDA » ; et la déduction par armature ne connaissait pas « Synergie MIDA ». **La liste de référence n'est PAS modifiée** : son entrée « Outil multifonction MIDA » (bloqueur) est conservée. L'icône apparaît partout où l'antichampion est affiché (Collection, Inventaire de la Forge, Détails, Mon Build), puisqu'ils partagent la même fonction.

**Vérifié** : `antichampion-mida` (10 : la règle pure sur toutes les variantes de casse et d'accent, l'exigence de l'armature, l'absence de devinette, le mot entier ; la fonction publique sur un faux Manifest, y compris « AVANT » (la déduction d'origine ne trouvait rien) et « RIEN NE BOUGE ailleurs » (liste de référence, armature de précision)) ; `plugs-disponibles` passe de 15 à 19 contrôles avec un test sur les **DONNÉES RÉELLES** des deux diagnostics (`fixtures/plugs-diagnostics-reels.json`, 26 prises : équipé toujours « reel », autres perks listés « disponible », perk étranger « possible », cas de la prise 10, colonnes de traits à alternatives, armature « Synergie MIDA » en prise 0) ; batterie : 25 séries, 409 contrôles ; **cinq casses volontaires toutes détectées** (règle non branchée, surcharge et implacable inversés, armature non vérifiée, « macro » non strict ; la quatrième que j'avais écrite ne changeait rien : refaite sur le bon mot).
**Défauts de MON travail, rattrapés en route** : mon test attendait 24 prises au lieu de 26 (mon aperçu des fichiers s'arrêtait à la ligne 14, il y avait une prise 12) ; une « casse volontaire » mal écrite qui ne changeait rien.
**NON vérifié** : le nom EXACT de l'« Outil macro MIDA » dans le Manifest : je n'ai pas son diagnostic ; la règle s'appuie sur le mot « macro » dans son nom et sur l'armature « Synergie MIDA » : si son nom diffère (par exemple « mini-outil »), l'icône n'apparaîtra pas ; l'aspect avec tes vraies armes ; le typage strict (`npm run build`).

## 13/10/2026 — v0.4.7 : Inventaire de la Forge, quatre niveaux de perks (disponibles sur l'exemplaire)

**Numéro de version** : 0.4.7 (installateur `Forge-Armory-Setup-0.4.7.exe`, liste `A-TESTER-0.4.7.pdf`).

**Retour de l'utilisateur sur la 0.4.6** : « Ok, toute la check-list est validée. » (le PDF n'a pas été renvoyé : validation déclarée, notée comme telle dans l'archive ; **109 sections validées**). « J'ai tous les rolls possibles et le roll réel comme prévu. Par contre rien ne m'indique les perks disponibles sur l'arme mais que je n'ai pas sélectionnés. » Il demande **quatre niveaux** : (1) roll réel, avec la petite coche ✔ ; (2) perks disponibles sur l'arme mais non sélectionnés en jeu : **contour gris clair** ; (3) perks possibles sur l'arme : **nom grisé** ; (4) perk choisi pour la simulation. « Le reste me semble très très bien ! »

**Fait**
- **Nouvelle lecture chez Bungie (lecture seule)** : l'inventaire demande aussi le **composant 310** (« plugs réutilisables ») : pour chaque exemplaire et chaque prise, les perks que CET exemplaire peut porter. Lu avec tolérance par `lib/bungie/plugsDisponibles.ts` : donnée absente ou mal formée = « non lue » (jamais « aucune alternative ») ; exemplaire sans alternative = table vide. Stocké dans `GearPiece.plugsDisponiblesParColonne` pour les **armes possédées seulement** (les builds enregistrés ne grossissent pas pour l'armure).
- **Les quatre niveaux** (`niveauDePerk`, fonction pure) : `reel` (coche ✓, contour bleu), `disponible` (contour gris clair, plein), `possible` (nom grisé), `simule` (doré) ; priorité : simulé, réel, disponible, possible ; pour une paire base + amélioré, « disponible » vaut si l'UNE des deux versions l'est ; si la disponibilité n'a pas été lue : niveau `inconnu` : rien n'est grisé et la légende dit « non lue (rechargez votre inventaire) ». Affichage dans le composant partagé `ColonnesPerks` (Inventaire seulement : la Collection est inchangée) ; texte caché pour les lecteurs d'écran.
- **Légende** en haut de la fenêtre d'une arme, et **diagnostic** réservé au mode développement (« 🔍 Diagnostic des perks disponibles de cet exemplaire », `lib/forge/diagnosticPlugs.ts`) pour contrôler sur le compte de l'utilisateur ce que Bungie renvoie.
- **Notice** : section de l'Inventaire mise à jour.

**Vérifié** : `plugs-disponibles` (15 : extraction de toutes les formes de données, quatre niveaux dans tous les cas, dont les paires, la donnée non lue, la table vide et un perk à la fois réel et simulé, diagnostic) ; `forge-inventaire` passe de 25 à 33 contrôles (niveaux affichés, **couleurs réellement calculées par le navigateur**, légende, accessibilité, cas « non lue » et « aucune alternative », retour au niveau « possible » après avoir simulé) ; batterie : 24 séries, 395 contrôles ; **huit casses volontaires toutes détectées** (donnée non lue affichée comme « possible », en logique et en interface ; version améliorée d'une paire ignorée ; priorité réel/simulé inversée, **non détectée au premier essai** : je l'ai épinglée par un cas réaliste ; contour gris clair supprimé ; nom non grisé ; donnée absente lue comme « aucune alternative »).
**Défauts de MON travail, rattrapés en route** : le contrôle du lance-roquettes ne regardait que les boutons alors que cette arme d'essai n'a que des colonnes d'un seul perk ; une fenêtre refermée une fois de trop dans mon scénario ; une casse (priorité réel/simulé) qui ne détectait rien tant que mon test ne couvrait pas le cas « à la fois réel et simulé ».
**NON vérifié (à contrôler sur le compte de l'utilisateur)** : la **forme réelle du composant 310** : je me suis appuyé sur la documentation de l'API (`itemComponents.reusablePlugs.data[instance].plugs[prise] = [{ plugItemHash, … }]`), jamais vue sur ses données ; le diagnostic du mode développement sert à la contrôler. On ne sait pas non plus si, pour les armes à rolls aléatoires, les colonnes de traits ont des alternatives : cela se verra dans le diagnostic. Le typage strict (`npm run build`).

## 13/10/2026 — v0.4.6 : Forge, vue Inventaire (armes possédées, roll réel, simulation locale)

**Numéro de version** : 0.4.6 (installateur `Forge-Armory-Setup-0.4.6.exe`, liste `A-TESTER-0.4.6.pdf`).

**Retour de l'utilisateur** (le PDF de la 0.4.5 n'a pas été renvoyé : son test, sur la page Forge sans titre, est donc **repris** dans la liste de la 0.4.6, qui contient le même changement). Réponses aux trois questions restées ouvertes : (1) aucune paire de perks améliorés fausse constatée, il reste vigilant ; (2) Confiance (autre révision) et Défense dorée : il répond « Non » (pas de roll fixe dans le jeu) mais ce qu'il a vérifié dans l'appli lui semble cohérent : **la règle des colonnes est conservée**, à rouvrir avec un diagnostic si une arme montre moins d'options que dans le jeu ; (3) « Chargeur abandonné » existe bien en version améliorée et c'est pris en compte sur Confiance : la reconnaissance par la position est **confirmée**. Feu vert pour la suite.

**Fait** (spécification de la Forge du 12/10/2026, §4 « Inventaire », Phase 1 : aucune écriture chez Bungie)
- **Vue Inventaire** (`components/InventaireArmes.tsx`, branchée dans `PageForge.tsx`) : bouton « Charger mon inventaire » (même fonction `listerObjetsPossedes` que Mon Inventaire ; le chargement interroge Bungie, donc déclenché par un clic) ; liste des ARMES possédées (les armures sont écartées) avec endroit (Titan, Chasseur, Arcaniste, Coffre ; « équipée »), les quatre icônes de la Collection et le badge « Simulation » ; filtres : recherche par nom ou type, endroit, « seulement les armes simulées » ; pagination par 60. Le panneau reste monté : l'inventaire chargé n'est pas perdu en changeant de vue.
- **Fenêtre d'une arme** : les colonnes de la popup « Détails » et de la Collection (mêmes fonctions, même tri), le **roll réel marqué ✓** (`perksParColonne` / `perkHashes` des pièces, marqués `equipeEnJeu`), une perk par colonne et un mod **simulables** (une seule perk par colonne ; la colonne de l'armature, une colonne d'un seul perk et les colonnes masquées ne le sont jamais) ; cliquer le roll réel, ou de nouveau la perk simulée, revient au roll réel de la colonne ; « ↺ Revenir au roll réel » ; la perk simulée est dorée et dit « simulé ».
- **Règle de version** (`lib/forge/simulation.ts`) : une arme est « améliorée » si au moins un perk de son roll réel est une version améliorée (aucune lecture du palier ni du masterwork) ; pour une arme améliorée, la perk simulée est comptée dans sa VERSION AMÉLIORÉE (mention « ▲ comptée »), sinon elle-même ; un perk sans jumeau reste lui-même.
- **Persistance locale** : `localStorage`, clé `forge-armory.forge.simulations.v1`, format compact et versionné, par exemplaire (`itemInstanceId`) et par index de prise ; lecture tolérante (contenu abîmé écarté entrée par entrée), mémoire de secours sans stockage ; « ✕ Effacer toutes les simulations ».
- **Composant partagé `ColonnesPerks`** : la légende et les colonnes de la fenêtre de la Collection y ont été déplacées TELLES QUELLES ; la Collection garde ses 54 contrôles inchangés. Un seul code pour la Collection et l'Inventaire, comme l'exigeait la spécification (le tri ne doit pas diverger).
- **Notice** : section « La Forge : Inventaire de vos armes » ; tableau mis à jour.

**Vérifié** : `simulation` (15 : choix par colonne, immuabilité, retour au réel, règle de version, persistance, contenu abîmé, stockage interdit) ; `forge-inventaire` (25, navigateur, VRAI composant avec un faux Manifest et de fausses armes possédées : avant chargement, sans compte, liste, filtres, roll réel ✓ y compris quand c'est la version améliorée, colonnes sélectionnables ou non, simulation d'un perk, d'une paire reconnue par la position, d'un perk sans jumeau, d'un mod, « ▲ comptée », enregistrement et RECHARGEMENT après fermeture de la page, retour au réel colonne par colonne, arme sans roll réel connu, colonnes masquées non sélectionnables, effacement ; **aucun appel d'écriture vers Bungie** : le journal réseau ne contient que des lectures) ; `forge` toujours à 54 ; **sept casses volontaires toutes détectées** (colonne de l'armature sélectionnable, colonnes masquées sélectionnables, perk à compter jamais amélioré en logique et en interface, roll réel non rétablissable, simulation non enregistrée, armure non écartée). Batterie : 23 séries, 372 contrôles.
**Défauts de MON travail, rattrapés en route** : ma page de test d'Inventaire n'ajoutait pas l'arme à paliers au faux Manifest (la fenêtre était vide : défaut de test, pas de l'appli) ; deux repères de texte faux dans mes scripts de modification (rien n'avait été écrit à moitié).
**NON vérifié** : la lecture du VRAI inventaire (liste, temps de chargement, nombre d'armes), le roll réel avec TES données (le ✓ est calculé à partir de `perksParColonne` et de `perkHashes`, jamais essayés sur ton compte), la règle de version avec une vraie arme améliorée, la conservation de la simulation dans le logiciel installé (testée dans un navigateur ; le stockage d'Electron doit être confirmé par l'utilisateur), le typage strict (`npm run build`). **Pas encore fait** : lien avec le score (0.4.7), bouton « Forge » dans les popups Détails, « Équiper vers Mon Build », armures, Phase 2.

## 13/10/2026 — v0.4.5 : page Forge sans titre

**Numéro de version** : 0.4.5 (installateur `Forge-Armory-Setup-0.4.5.exe`, liste `A-TESTER-0.4.5.pdf`).

**Retour de l'utilisateur sur la 0.4.4** : PDF renvoyé, **10 cases cochées sur 10** (relecture automatique), archivées (**106 sections validées**). Le build de l'utilisateur sans erreur valide aussi le typage strict de la 0.4.4. **Aucun retour écrit** sur le dessin des boutons « Inventaire » et « Legendarium », ni aux trois questions posées sur ses armes (voir la TODO : elles restent ouvertes).

**Fait** : la seule modification de cette version est le **retrait du titre « Forge »** (icône et mot) de la page Forge, demandé par l'utilisateur pendant ses tests de la 0.4.4 (« inutile ici »), préparée le jour même et **non livrée** à sa demande jusqu'à la fin de sa check-list. La page garde son nom pour les lecteurs d'écran (région `aria-label="Forge"`), sa note grise et ses deux boutons ; le contrôle du sélecteur qui vérifiait « son icône » vérifie maintenant l'**absence** du titre. Détails, tests et casses volontaires : voir le paragraphe « Retrait du titre » de l'entrée 0.4.4.
**Vérifié** : la batterie complète (21 séries, 332 contrôles) ; la liste de tests de l'utilisateur contient un seul test, sur le retrait du titre. **NON vérifié** : l'aspect dans le logiciel installé (aperçu fait avec un faux Manifest).

## 13/10/2026 — v0.4.4 : cartes d'armes à icônes, boutons stylisés de la Forge, perks améliorés

**Numéro de version** : 0.4.4 (installateur `Forge-Armory-Setup-0.4.4.exe`, liste `A-TESTER-0.4.4.pdf`).

**Retour de l'utilisateur sur la 0.4.3** : PDF renvoyé, **14 cases cochées sur 14** (relecture automatique), archivées (**101 sections validées**). Mesure : la mise à jour automatique d'un Manifest périmé prend **15 secondes** entre Ctrl+F5 et la fin (deux langues, simulation du mode développement). Quatre diagnostics de perks envoyés : deux Confiance (deux révisions), Défense dorée (sans perks améliorés), Grande Faucheuse (temps perdu). Demandes : (1) cartes d'armes avec les icônes de type d'arme, d'élément, de munitions et d'antichampion, en gardant l'armature ; (2) retirer la mention « Jamais obtenue », redondante avec le grisé ; (3) « une fois les tests réalisés », brancher les boutons stylisés (Collection de l'archive v4 ; Inventaire au format du sélecteur, option 2). **Non reçus** : les trois nombres du menu « Source » et le temps d'attente de la liste (facultatifs).

**Fait**
- **Cartes d'armes** (`components/IconesArme.tsx`) : quatre icônes dans l'ordre demandé (type, élément, munitions, antichampion absent si l'arme n'en a pas), avec les MÊMES composants et fonctions que l'en-tête de la popup « Détails » (rien de recalculé en plus) ; l'armature reste écrite ; les mots « type · emplacement · élément » sont remplacés par les icônes, **avec un texte caché pour les lecteurs d'écran** (type, emplacement, élément, anti-champion) ; la mention « Jamais obtenue » est retirée (le grisé reste, porté par `data-obtention`).
- **Boutons stylisés** (`BoutonSousMenu` dans `SelecteurVues.tsx`, branché dans `PageForge.tsx`) : « Collection » = bouton de l'archive v4, « Inventaire » = bouton fabriqué (option 2) ; mêmes images à deux états superposés et mêmes règles CSS que le sélecteur principal (survol, anneau de focus clavier, lueur dans le cadre), hauteur 44 px (largeur 185 px), `role="tab"`, `aria-selected` et noms accessibles conservés.
- **Perks améliorés** (`lib/manifest/perksAmeliores.ts`, fenêtre de la Collection) : d'après les diagnostics, une version améliorée est un OBJET DISTINCT, de même nom que sa base, dans la même colonne, typé « … amélioré(e) » ; chaque perk s'affiche UNE fois avec un ▲ jaune et l'icône de sa version améliorée, le survol lit les deux descriptions, une légende compte les perks concernés ; les colonnes masquées ne sont jamais appariées ; un perk amélioré sans base reste une option ordinaire. **Cas ambigu** (« Chargeur abandonné » : même type pour les deux versions) : apparié par la position, marqué « probable » ; règle de repli limitée aux colonnes qui contiennent déjà des perks typés « amélioré ».
- **Analyse des diagnostics** : Confiance (révision à paliers) : 54 paires (53 normales, la version améliorée étant TOUJOURS listée après sa base, plus le cas ambigu) ; Confiance (autre révision), Défense dorée et Grande Faucheuse n'ont qu'UNE option par colonne de perks. Les textes « Amélioration de palier 2 à 5 » et « Palier Pièce maîtresse » montrent que les versions améliorées dépendent du **système de paliers** des armes. Détail dans la TODO.

**Archive de visuels v5 et renommage « Bibliothèque » → « LEGENDARIUM » (13/10/2026, demande de l'utilisateur : « le bouton Bibliothèque devient Legendarium. Reste en 0.4.4 »)**
- **L'archive v5** comparée octet pour octet à la v4 : **62 fichiers identiques, aucun modifié** ; **3 nouveaux** (`icones/icone-legendarium.svg`, `selecteur/bouton-legendarium.svg`, `selecteur/bouton-legendarium-selectionne.svg`) ; **3 retirés** (les trois fichiers « Bibliothèque ») ; catalogue : 3 entrées nouvelles (`icones.legendarium`, `selecteur.legendarium.repos` / `.selectionne`), 3 disparues. Reconstruction de `public/assets/` depuis la v5 : 64 fichiers identiques à l'existant, 3 nouveaux ; les trois anciens fichiers sont retirés de `public/assets/` ; mes cinq fichiers fabriqués (boutons Forge et Inventaire, icône Forge) sont conservés. `app-assets/` devient la v5 (la v4 est dans `archives-precedentes/app-assets-v4/`).
- **Renommage à l'écran** : libellé du bouton « Legendarium » (lu par les lecteurs d'écran, infobulle), images de l'archive v5, **titre de la page** « Legendarium » (c'était « Bibliothèque ») et son message du Manifest (« le Legendarium aura tout ce qu'il lui faut »), README, TODO (mentions actuelles ; les mentions datées de l'historique sont conservées telles qu'elles étaient). **Volontairement inchangés** : l'identifiant interne `bibliotheque` (la vue choisie est mémorisée dans l'appli : le renommer aurait invalidé ce choix chez l'utilisateur) et le nom du fichier `Bibliotheque.tsx`. Texte laissé tel quel parce qu'il ne parle pas de cet onglet : une table d'outils tiers de la base de connaissances (`knowledge-base/26_ARMES_ARMURES.md`) et la notice de l'archive des boutons de profils.
- **Dépendance découverte** : mon générateur de boutons (`scripts/generer-propositions-solo-forge.mjs`) mesure son MODÈLE D'ESPACEMENT dans les lettres de ton ancien bouton « Bibliothèque », qui n'est plus dans l'archive. Sans lui, les boutons Forge et Inventaire fabriqués auraient changé. Une copie est conservée dans `ressources-installateur/forge-armory/sources-lettres/` (avec son LISEZMOI) et le générateur la lit si l'archive ne l'a pas : les cinq fichiers fabriqués restent identiques octet pour octet.
- **Vérifié** : nouveau test `legendarium` (5 : titre de la page avec ou sans Manifest, message, aucune trace de « Bibliothèque » à l'écran, noms accessibles des quatre boutons, images Legendarium avec identifiant interne conservé) ; `selecteur` passe de 21 à 23 contrôles (noms, images) ; `visuels` mis à jour ; `reproductibilite-visuels` passe toujours (7) : le générateur redonne les cinq fichiers fabriqués ; **cinq casses volontaires toutes détectées**. Batterie : 21 séries, 331 contrôles. **Défauts de mon travail, rattrapés en route** : mon premier `grep` ne gérait pas la lettre « è » et avait raté les occurrences accentuées (refait avec Python, qui lit l'UTF-8) ; mon test de rendu ne décodait pas l'apostrophe ; une casse « non détectée » n'était due qu'à une page de test non reconstruite.
- **NON vérifié** : l'aspect du bouton Legendarium dans le logiciel installé (rendu seulement en test) ; le comportement chez un utilisateur qui avait la vue mémorisée sur ce quatrième onglet (l'identifiant interne n'a pas changé, mais la mémorisation n'a pas été testée dans le logiciel).

**Retrait du titre « Forge » de la page (13/10/2026, demande de l'utilisateur en cours de test : « tu peux retirer le titre de section Forge, il est inutile ici »)** : le titre (icône et mot) est retiré de `PageForge.tsx` ; l'onglet « Forge » du sélecteur juste au-dessus porte déjà ce nom. La page **garde son nom pour les lecteurs d'écran** (région `aria-label="Forge"`) et sa note grise (périmètre de la Forge), alignée à droite ; les deux boutons de sous-menu restent. Le contrôle du sélecteur qui vérifiait « son icône » est remplacé par un contrôle de l'**absence** du titre et de l'icône (il aurait pu réussir à tort avec l'image d'un bouton) ; deux casses volontaires détectées (retour du titre, perte du nom de région) ; batterie : 21 séries, 332 contrôles. **Livré en 0.4.5** (voir l'entrée de cette version) : l'utilisateur avait demandé de ne rien générer avant d'avoir sa check-list ; seul un aperçu avant / après avait été fourni.
**Vérifié** : `perks-ameliores` (24 : l'appariement colonne par colonne sur les DONNÉES RÉELLES des quatre diagnostics, fixture `tests/logique/fixtures/perks-diagnostics-reels.json`, puis les cas limites) ; `forge` passe de 35 à 54 contrôles (icônes dans l'ordre, accessibilité, boutons : noms, images, taille, états, clavier ; perks améliorés sur une arme à la structure réelle ; garde contre les homonymes) ; **six casses volontaires toutes détectées**.
**Défauts de MON travail, corrigés en route** : mon premier comptage des perks améliorés donnait zéro parce que je cherchais « oui » alors que le diagnostic écrit « OUI » ; quatre attentes de test mal écrites (lecture des boutons pendant leur fondu de 0,15 s, recherche qui cachait l'arme d'essai).
**NON vérifié** : l'aspect réel des cartes et du bouton « Inventaire » avec les vraies icônes de Bungie (tests faits avec un faux Manifest) ; que le cas ambigu soit bien une version améliorée dans le jeu (question à l'utilisateur) ; le comportement des armes à une option par colonne (question à l'utilisateur) ; le typage strict (`npm run build`).

## 13/10/2026 — v0.4.3 : Forge, vue « Collection » des armes

**Numéro de version** : 0.4.3 (installateur `Forge-Armory-Setup-0.4.3.exe`, liste `A-TESTER-0.4.3.pdf`).

**Demande de l'utilisateur** : spécification de la Forge (12/10/2026), « on va d'abord faire les armes », avec les **douze défauts** proposés acceptés (« OK »). Cette version livre la **première tranche de la Phase 1** : la vue « Collection » des armes, en lecture seule.

**Fait**
- **Catalogue des armes du jeu** (`lib/manifest/catalogueArmes.ts`) : lu dans le Manifest par une requête CIBLÉE (`itemType` 3), construit PAR MORCEAUX (l'écran reste réactif, avec une progression) puis mis en cache par Manifest chargé ; repli sur la lecture de toute la table si la requête ne trouve rien. Libellés résolus EXACTEMENT comme l'inventaire (type affiché, nom de la rareté, emplacement, élément, armature de la prise 0). Écartés : objets sans nom ou masqués, objets factices, tout ce qui n'est pas dans un emplacement d'arme. Filtres purs : recherche (accents, majuscules et ordre des mots ignorés), type, emplacement, rareté, élément, archétype, source, obtention.
- **Collections du compte** (`lib/bungie/collections.ts`) : lecture SEULE (composant 800 du profil) ; une arme est « obtenue » si le compte OU un personnage l'a obtenue (le drapeau « non obtenu » est levé partout sinon) ; absente de toutes les collections ou sans `collectibleHash` : « inconnu », jamais grisée. Session expirée remontée ; toute autre erreur est expliquée et AUCUNE arme n'est alors grisée (pas de faux « jamais obtenue »).
- **Page Forge** (`PageForge`, `CollectionArmes`) : deux onglets, « Collection » et « Inventaire » (annonce la prochaine version) ; les deux panneaux restent montés, changer de vue ne fait perdre ni filtres ni recherche. Collection : liste paginée (60 par page), cartes colorées selon la rareté (bordure dorée pour un exotique, violette pour un légendaire), **couleurs si obtenue, grisée et « Jamais obtenue » sinon**, mention « Hors Collections du jeu », fenêtre d'une arme avec toutes ses colonnes de perks, **interrupteur « Afficher les perks inutiles »** (désactivé par défaut, remis à zéro à chaque arme).
- **Logique des colonnes : UNE SEULE SOURCE**. Relue dans le journal d'août et le code, comme la spécification l'exige. L'ordre (mods connus en bas, tri stable) et l'étiquette (« Colonne N » = prise + 1, ou « Mods utilisables ») étaient écrits deux fois à l'identique dans les popups Détails de l'Inventaire et de Mon Build : extraits dans `lib/manifest/colonnesArme.ts` et utilisés par les deux popups ET par la Forge. `obtenirOptionsToutesColonnes` reçoit un réglage facultatif `inclureMasquees` (colonnes cosmétiques marquées `masquee`) : **comportement par défaut strictement inchangé**, prouvé par un instantané pris AVANT la modification (`tests/logique/instantanes/colonnes-arme.json`).
- **Diagnostic des perks d'une arme** (`npm run dev` seulement, bouton dans la fenêtre) : décrit colonnes et options avec leurs champs bruts et repère les jumeaux « améliorés » possibles, pour préparer la 0.4.4 (le lien perk ↔ jumeau amélioré n'est pas vérifié sur ton Manifest).

**Manifest périmé : mise à jour automatique (point 7 des défauts, DÉCIDÉ par l'utilisateur le 13/10/2026 : « si le Manifest est périmé (et uniquement dans ce cas), téléchargement du nouveau »)**. Constat de départ : l'appli vérifiait DÉJÀ la version à chaque démarrage (depuis la 0.2.2) mais ne téléchargeait jamais sans un clic ; cette règle est remplacée pour le seul cas périmé. Fait : `etatCachesManifests` (`download.ts`) donne l'état de CHAQUE langue (à jour, périmé, absent ; ou inconnu si hors ligne), sans rien écrire ni télécharger ; `lib/manifest/demarrage.ts` décide : une langue EN CACHE mais d'une autre version est **retéléchargée automatiquement**, avec une annonce 🔄 puis ✅ ou ⚠️ ; une langue ABSENTE n'est **jamais** téléchargée seule (l'anglais n'est pas téléchargé en douce) ; sans cache français (premier lancement), rien ne se lance seul : le tout premier téléchargement reste un clic ; FR et EN à jour : chargement depuis le cache, sans annonce (comme avant) ; hors ligne ou état inconnu : rien ; échec : annoncé, **un seul essai**, le bouton manuel reste. `RechercheManifest` charge maintenant une liste de langues (le bouton manuel garde son comportement : français puis anglais). **Outil de test, mode développement seulement** : bouton « 🧪 Manifest périmé (test) » qui marque le cache comme périmé (puis Ctrl+F5) pour essayer le tout de bout en bout sans attendre une vraie nouvelle version de Bungie ; absent du logiciel installé.
**Vérifié (mise à jour automatique)** : `demarrage-manifest` (19 : toutes les combinaisons d'états, enchaînement des appels et des messages, lecture des caches avec une base qui REFUSE toute écriture, hors ligne = inconnu et non périmé, simulation) ; `manifest-demarrage` (18, navigateur, VRAI composant avec des doubles pour le réseau, le disque et l'indexation : vérification en cours, français périmé seul, deux langues périmées, tout à jour, premier lancement, état inconnu, échec puis reprise manuelle, bouton de simulation présent en développement seulement, console propre) ; six casses volontaires toutes détectées. Total de la batterie : 19 séries, 273 contrôles. **Corrigé en route** : quatre attentes de mon test mal écrites, un commentaire en fin de ligne qui masquait du code, et un **vrai défaut** du code (message de simulation « FR ET EN » en majuscules).
**NON vérifié (mise à jour automatique)** : le téléchargement réel d'une nouvelle version publiée par Bungie (les doubles remplacent le réseau, le disque et l'indexation) ; le temps et le poids réels (environ 100 Mo par langue) ; le comportement du cache si le téléchargement échoue en cours de route (relu : l'ancien cache n'est remplacé qu'après décompression complète) ; le typage strict (`npm run build`).
**Archive de visuels v4 intégrée (13/10/2026, sans changement visible à l'écran)** : comparée octet pour octet à la v3 : **62 fichiers identiques, aucun modifié**, **3 nouveaux** : `icones/icone-collection.svg` et les deux états du bouton stylisé `selecteur/bouton-collection(.svg|-selectionne.svg)` (4316 × 1024, même cadre que les quatre autres boutons ; la notice de la v4 les destine au sous-menu « Collection » de l'onglet Forge). Reconstruction de `public/assets/` depuis la v4 : 64 fichiers identiques octet pour octet à l'existant, 3 nouveaux, mes trois fichiers de la Forge conservés ; `app-assets/` devient la v4 (la v3 est dans `archives-precedentes/app-assets-v3/`) ; catalogue `forgeAssets.ts` remplacé par celui de la v4 (3 entrées nouvelles). Les tests existants passent sans modification (dont la reproductibilité depuis l'archive). **Décision de l'utilisateur : ces boutons seront BRANCHÉS « une fois les tests réalisés »** : la page Forge de cette version garde donc ses deux onglets en texte, pour ne pas changer ce que les tests en cours examinent. Plan et question ouverte dans la TODO (« boutons des sous-menus de la Forge »).
**Bouton « Inventaire » créé (OPTION 2 choisie par l'utilisateur le 13/10/2026, sans changement visible à l'écran)** : l'utilisateur voulait pour le sous-menu « Inventaire » de la Forge « celui utilisé dans Build Analyzer » (le titre repliable « Mon Inventaire », `blocs-repliables.inventaire.*`). Comparaison faite à hauteur égale : ce titre est environ 1,8 fois plus large que les boutons (7805 × 1024 contre 4316 × 1024) et ses deux états ne diffèrent que par un petit losange, sans la lueur du bouton sélectionné ; l'utilisateur a choisi **un vrai bouton au format du sélecteur**. Fabriqué par `scripts/generer-propositions-solo-forge.mjs` (nouvelle section « 4 bis »), comme le bouton Forge de la 0.4.0 : bouton « Load-outs » de référence, **coffre repris tel quel de l'icône « Mon Inventaire »** de l'utilisateur (trois tracés et deux masques), mot « INVENTAIRE » composé avec **ses propres lettres** par le modèle d'espacement (écart maximal de 0,02 unité en recomposant ses 18 textes d'origine), identifiants renommés. Deux fichiers `selecteur/bouton-inventaire(.svg|-selectionne.svg)`, 4316 × 1024 (237 px de large à 56 px de haut, comme les quatre autres boutons), déclarés dans `forgeAssetsComplement.ts` (`selecteur.inventaire.repos` / `.selectionne`), sources dans `ressources-installateur/forge-armory/inventaire-0.4.3/`. **Ils ne viennent pas de l'archive de l'utilisateur** : à remplacer par le sien s'il en livre un. **Branchés après les tests de la 0.4.3** (décision de l'utilisateur) : la page Forge garde donc pour l'instant ses deux onglets en texte.
**Vérifié (bouton Inventaire)** : `visuels` passe de 13 à 20 contrôles (deux états en 4316 × 1024 ; plaque strictement identique à celle de « Load-outs », état par état ; cristaux ; texte de 10 lettres ; coffre et masques identiques à ceux de l'icône d'origine ; toutes les références internes résolues ; aucun reste du bouton « Load-outs » ni de l'icône ; titres) ; `reproductibilite-visuels` passe de 6 à 7 contrôles et attend maintenant 5 fichiers fabriqués hors archive, dont le **générateur redonne les cinq octet pour octet** (donc aussi les fichiers Forge, inchangés) ; quatre casses volontaires toutes détectées. **Défaut de mon test, corrigé en route** : `aria-labelledby` cite deux identifiants séparés par une espace, que je prenais pour un seul. **NON vérifié** : l'aspect dans le logiciel installé (il n'est pas branché) ; le jugement esthétique final de l'utilisateur sur ce bouton.
**Ajustement du défaut 5** : un objet sans `collectibleHash` reste en couleurs avec une mention, comme prévu, mais le menu « Source » propose par défaut les seules **Collections du jeu** (« Hors Collections » et « Tout » à un clic), pour ne pas noyer la liste sous des définitions techniques ou dupliquées.

**Vérifié** : 17 séries, 236 contrôles, dont les nouvelles : `colonnes-arme` (10 : non-régression par instantané, interrupteur, règles partagées équivalentes à l'ancien code, arme dont les mods précèdent des colonnes de perks), `catalogue-armes` (23 : catalogue, exclusions, libellés, morceaux, cache, repli, filtres, collections), `diagnostic-perks-arme` (8), et côté navigateur `forge` (35 : liste, grisé, filtres, fenêtre, interrupteur, onglets, collections refusées, non connecté, sans Manifest, pagination, arme à mod précoce) et `detail-popup` (5 : **critère 10 de la spécification, aucune régression de la popup Détails**, avec le vrai composant). Casses volontaires : huit détectées, dont deux qui ne l'étaient PAS au premier essai (mods en bas, fusion des collections) : tests renforcés (arme à mod précoce, cas d'une arme obtenue au niveau du compte mais marquée non obtenue sur un personnage), puis détectées.
**Corrigé en route** : le test du sélecteur d'onglets vérifiait l'ancien texte « en construction » de la page Forge (contenu remplacé) et comptait les onglets « sélectionnés » dans toute la page (la Forge a maintenant les siens) : mis à jour. Test de console : les icônes d'essai pointent vers www.bungie.net (pas d'Internet ici) : le test y répond par une image minimale.
**NON vérifié (à valider avec tes données : voir la liste)** : tout ce qui touche au VRAI Manifest : la requête ciblée suppose le JSON compact de Bungie (le repli existe), le NOMBRE d'armes et la durée de lecture, la classification « dans les Collections du jeu », les doublons éventuels (variantes, adeptes) ; la structure de la réponse des collections (composant 800), écrite de mémoire ; les colonnes de tes vraies armes ; le typage strict (`npm run build`). Limites volontaires : armes seulement (armures à définir), consultation seule (aucune sélection de perk : 0.4.4).

## 13/10/2026 — Spécification de la Forge reçue et analysée (documentation seulement)

**Reçu** : le cahier des charges de la Forge (« Spécifications — Bouton Forge », daté du 12/10/2026). Un premier envoi (`Forge_et_Détails_équipements`) était arrivé **vide** (0 octet) ; le texte a ensuite été collé dans la conversation.

**Fait** : lecture complète ; **relecture, comme la spécification l'exige, de la logique de tri et d'affichage des colonnes de la popup Détails** (journal d'août et code de `obtenirOptionsToutesColonnes`), résumée dans les notes internes pour être réutilisée telle quelle ; vérification dans le code de ce dont la spécification dépend (Détails dans Mon Build : présent ; contrôle de version du Manifest : présent mais déclenché par le bouton ; état masterwork d'une arme : **non lu** ; collections : **non lues**) ; spécification recopiée dans `NOTES-CONCEPTION.md` (interne, sans la signature, car la TODO et le dépôt sont publics), avec **douze points à trancher** que le document ne signalait pas et un défaut proposé pour chacun ; découpage en 0.4.3 (Collection des armes), 0.4.4 (Inventaire), 0.4.5 (Scoring), puis armures, puis Phase 2. TODO mise à jour.

**Aucun changement de code.** Même version (0.4.2). En attente de l'accord de l'utilisateur sur les défauts avant de commencer la 0.4.3.

## 12/10/2026 — Validation de la 0.4.2 (documentation seulement)

**Retour de l'utilisateur** : « Toute la check-list Test 0.4.2 est validée 🥳 ». ⚠️ Le PDF n'a **pas** été renvoyé : les cases n'ont donc pas été relues automatiquement ; la validation est celle déclarée dans la conversation (notée comme telle dans l'archive des tests). Les **9 tests sur 9** sont archivés (**98 sections validées**), y compris les **essais en jeu** du bouton « Transférer vers » (Coffre vers personnage et inverse, personnage vers personnage par le Coffre, annulation, objet équipé, armure, cohérence après rechargement, destination pleine). **Plus aucun test en attente.**

**Aucun changement de code** : archive des tests, liste de tests (vide), TODO et journal seulement. Même version (0.4.2) ; le zip est renvoyé pour conserver la documentation à jour.
**Suite** : contenu de l'onglet Forge. Un **cadrage** (briques existantes, découpage en étapes, points à vérifier) est dans la TODO, point 2 : à valider avec l'utilisateur avant de commencer.

## 12/10/2026 — v0.4.2 : bouton « Transférer vers »

**Numéro de version** : 0.4.2 (installateur `Forge-Armory-Setup-0.4.2.exe`, liste `A-TESTER-0.4.2.pdf`).

**Demande de l'utilisateur** (fichier « Retours et ajouts du 12/10 » ; feu vert donné le 12/10 avec mes trois recommandations) : un bouton « Transférer vers » sur les objets de Mon Inventaire et du Coffre, vers Chasseur, Titan, Arcaniste ou Coffre. Aussi : retirer « A-TESTER-0.3.19 » de la TODO : la mention figurait dans l'ancienne copie de la TODO du dépôt ; elle avait déjà disparu de celle du projet (point 1 remplacé en 0.4.0 puis 0.4.1) ; la TODO du zip la remplace.

**Règles retenues (recommandations acceptées)** : un objet **équipé** n'est jamais déplacé (bouton grisé, explication) ; une **confirmation** avant chaque transfert ; **un seul** transfert à la fois.

**Fait**
- **Module `lib/bungie/deplacer.ts`**, construit sur `transfererObjet` (déjà utilisé en conditions réelles par l'équipement des loadouts) : (1) lit la position **réelle** de l'objet chez Bungie (profil en direct) avant d'agir, jamais l'état affiché (leçon du bug « objet introuvable », 1623, de l'équipement) ; (2) **plan pur** : refuse (objet équipé, dans le courrier, introuvable, profil illisible, déjà à destination, armure vers une autre classe, aucun personnage de cette classe) ou décide les étapes ; (3) exécute. L'API ne transfère qu'entre un personnage et le Coffre : **d'un personnage à un autre, l'objet passe par le Coffre en deux étapes, dans l'ordre (envoyer au Coffre, puis tirer)** ; si la seconde échoue, l'objet est au Coffre et le message le dit. Les erreurs Bungie sont traduites (plus de place, objet introuvable, équipé, non transférable, trop de requêtes, serveurs indisponibles) ; un statut inconnu garde le texte d'origine. Une session expirée remonte à l'interface.
- **`lireProfilEquipement`** lit aussi le composant 200 du profil (personnages et leur classe), en lecture seule : champ facultatif `classes` ; rien d'autre ne change pour l'équipement des loadouts.
- **Interface** (`components/BoutonTransfert.tsx`, branché sur les quatre listes d'objets de l'inventaire) : bouton « Transférer vers », choix de la destination (le Coffre et les trois classes sauf l'endroit actuel ; une armure : son personnage et le Coffre seulement), confirmation qui précise le passage par le Coffre, « ⏳ en cours », boutons des autres lignes grisés pendant un transfert, **bandeau de résultat** en haut de Mon Inventaire (la ligne change de liste, elle ne peut pas porter le message). L'écran est mis à jour d'après le lieu **réel** rendu par l'opération (réussite, ou échec à la seconde étape : Coffre), sans recharger.
- **Notice** : section « Transférer un objet ».

**Vérifié** : `tests/logique/deplacement.test.ts` (22 contrôles : plan, exécution avec une fausse API qui journalise chaque appel dans l'ordre, messages, point d'entrée avec un faux profil) ; `tests/ui/transfert.py` (19 contrôles dans un navigateur, avec le VRAI enchaînement bouton → module → lecture du profil → appel de transfert et une **fausse API Bungie à état** qui applique vraiment les déplacements et refuse comme Bungie : objet équipé grisé, destinations, annulation, réussite directe, passage par le Coffre, armure, échec à la première et à la seconde étape, un seul transfert à la fois, objet devenu équipé en jeu, session expirée, aucune erreur de console). **Six casses volontaires toutes détectées** (plusieurs transferts à la fois, état équipé ignoré, étapes dans le mauvais ordre, écran non mis à jour, armure vers une autre classe, et la même en logique). Toute la batterie passe.
**Défauts de mes tests, corrigés en route** : une liste de destinations lue deux fois (chaque lecture cliquait sur le bouton, qui bascule) ; une section créée par un déplacement, repliée, donc bouton invisible (le test l'ouvre comme un utilisateur).
**NON vérifié (à tester en jeu : voir la liste)** : le comportement réel de Bungie (la fausse API imite les règles connues, pas l'API réelle) ; les NOMS de statut d'erreur de Bungie traduits (`DestinyNoRoomInDestination`, `DestinyItemNotFound`, etc.) : le second est confirmé par l'historique du projet, les autres viennent de ma connaissance de l'API ; un statut différent s'affiche tel quel, sans traduction ; les limites de place réelles (armes par emplacement, Coffre) ; le typage strict (`npm run build` le contrôlera). **Limites volontaires de cette version** : un objet à la fois ; objet équipé non géré (pas de remplaçant automatique) ; une armure ne va que chez sa classe.

## 12/10/2026 — Validation de la 0.4.1 (documentation seulement)

**Retour de l'utilisateur** : PDF `A-TESTER-0.4.1` renvoyé, **10 cases cochées sur 10** (relecture automatique du PDF), archivées dans `documentation/tests/` (**96 sections validées** au total). **Plus aucun test en attente.** Sont donc validés : `npm run build` et l'installateur 0.4.1 ; la **recoloration des icônes du Filobscur** (Chasseur, Titan et Arcaniste, rien d'autre de changé, fiche et export du logiciel installé), cochée **sans demande de réglage de la teinte** (la rotation de −70° est conservée) ; l'**archive de visuels v3** (carte « 2. Armes et Armures » avec son nouveau logo) ; l'**export infographique** dans le logiciel installé (icônes de classe, d'élément et de contexte, quatre titres de section avec leur logo, aucune icône cassée) ; les images du logiciel installé (dernier test en attente de la 0.3.19).

**Aucun changement de code** : seuls l'archive des tests, la liste de tests (désormais vide), la TODO et ce journal ont changé. Même numéro de version (0.4.1) ; le zip est renvoyé pour que la documentation à jour soit conservée.
**Suite** : « Transférer vers » (0.4.2), puis le contenu de l'onglet Forge (0.4.3 et suivantes) ; décisions de cadrage à prendre avec l'utilisateur dans la TODO (point 2).
**Petite correction de documentation** : la ligne « dernier tri : … sections validées » de l'en-tête de la liste de tests affichait toujours « 06/10/2026, 84 sections » (la phrase est coupée sur deux lignes dans le fichier source, mes remplacements précédents ne l'atteignaient pas) ; elle indique maintenant « 12/10/2026, 96 sections ».

## 12/10/2026 — v0.4.1

**Numéro de version** : 0.4.1 (installateur `Forge-Armory-Setup-0.4.1.exe`, liste `A-TESTER-0.4.1.pdf`). Version inchangée après l'ajout de l'archive de visuels v3 (voir plus bas), à la demande de l'utilisateur.

**Retour de l'utilisateur sur la 0.4.0** : PDF renvoyé, **18 cases cochées sur 22**, archivées (91 sections validées). Le premier test (`npm run build` sans erreur) **valide le typage strict**, que je n'avais pas pu contrôler. Restent à tester : les trois contrôles de l'export infographique (logiciel installé) et les images du logiciel installé (reste de la 0.3.19). Décision de l'utilisateur : le contexte choisi est **toujours affiché dans l'en-tête de l'export, Neutre compris** (c'est déjà le comportement de la 0.4.0 ; le texte de la liste de tests a été corrigé en conséquence). Il a aussi envoyé les deux diagnostics des icônes de doctrine (Chasseur, Stase et Filobscur).

**Archive de visuels v3 intégrée (demande de l'utilisateur : « en gardant la 0.4.1, ajoute les modifications contenues dans le ZIP »)**
- **Ce que l'archive change**, comparé octet pour octet à la précédente : 58 fichiers identiques ; **2 nouveaux** : `icones/icone-armes.svg` (l'épée seule) et `icones/icone-armures.svg` (le bouclier seul) ; **2 redessinés** : `icones/icone-armes-armures.svg` et `titres/titre-3-armes-armures.svg` (logo « épée plantée dans le bouclier ») ; catalogue : 2 entrées nouvelles et un libellé corrigé (« armes-armures » devient « Armes et Armures »). La v3 garde l'ancienne numérotation des cartes (3 = Armes et Armures) : ma renumérotation du 08/10 est refaite à partir de ses fichiers.
- **Intégration** : `app-assets/` devient la v3 (l'ancienne est conservée dans `archives-precedentes/app-assets-v2/`) ; catalogue généré `forgeAssets.ts` remplacé par celui de la v3 ; `public/assets/` reconstruit depuis la v3 par `scripts/retoucher-visuels.mjs` : **60 fichiers identiques octet pour octet à ceux déjà livrés**, 2 nouveaux, 2 changés (l'icône redessinée et la carte « 2. Armes et Armures », qui porte maintenant le nouveau logo) ; les trois fichiers de l'onglet Forge, qui ne viennent pas de l'archive, sont conservés.
- **Export infographique** : les logos « Armes » (épée seule) et « Armure » (bouclier seul), attendus depuis la 0.4.0, sont **intégrés** : les quatre titres de section (Doctrine, Armes, Armure, Artefact) ont leur logo, ce qui règle aussi le décalage visuel qu'avait la page tant qu'Armes et Armure n'en avaient pas. Taille portée de 30 à **34 px** : la notice de la v3 recommande au moins 32 px (à 24 px les détails fins se brouillent). Le logo combiné « Armes et Armures » n'est pas utilisé dans l'export (il n'y a pas de section combinée) ; il reste sur la carte du Scoring.
- **Nouveau test** `tests/logique/reproductibilite-visuels.test.ts` (6 contrôles) : reconstruit `public/assets/` depuis l'archive de référence dans un dossier temporaire et le compare octet pour octet à ce qui est livré ; vérifie que le script est idempotent. Il remplace la vérification faite à la main lors de l'arrivée de la v3. Deux mutations détectées (fichier livré altéré, fichier de l'archive oublié).
- Test de l'export mis à jour (18 contrôles) : les huit logos intégrés existent, ARMES et ARMURE portent chacun le leur (et pas le logo combiné).
- **Réponse à une question de l'utilisateur** (« les icônes du Filobscur ne sont pas accessibles ? ») : les vraies images de Bungie ne sont pas accessibles depuis mon environnement (pas d'accès à Internet pour mes outils de calcul) ; c'est pourquoi la recoloration a été calibrée sur une icône synthétique. **La recoloration s'applique déjà aux trois classes** (la règle compare les icônes du Filobscur à celles de la Stase de chaque classe, sans supposer la classe) : il n'y a donc rien à « généraliser » pour le Titan et l'Arcaniste ; si leurs icônes sont déjà vertes, elles ne sont pas touchées. Pour revenir en arrière, une ligne suffit (`src/data/teinteIconesDoctrine.ts`).

**Bug « Filobscur : icônes de saut et de compétence de classe sur fond bleu (Stase) » : cause établie et correction**
- **Cause** (lue dans les deux diagnostics) : ce n'est PAS une erreur de sélection. Les prises de la sous-classe, leurs plug sets (139 à 143 pour le Tisseur contre 85 à 88 pour le Revenant) et les objets sont distincts (`hunter.strand.*` contre `hunter.stasis.*`) : l'appli lit bien les objets du Filobscur. Mais pour le **saut et la compétence de classe**, les cinq objets du Filobscur pointent vers **exactement les mêmes fichiers d'icône** que ceux de la Stase (par exemple `3321f82b…png` pour « Saut élevé » dans les deux cas) : c'est la donnée de Bungie qui réutilise l'icône bleue. La mêlée, les grenades et la super ont des fichiers distincts : non concernées.
- **Correction** : quand la doctrine est le Filobscur, que l'option est un saut ou une compétence de classe ET que son fichier d'icône est celui d'une option de la Stase (comparaison sur les DONNÉES du Manifest, pour les trois classes, ensemble calculé une seule fois puis mis en cache), l'image est affichée avec un filtre de teinte bleu vers vert. Appliquée à trois endroits : grille de doctrine, fiche à l'écran, export infographique. **Si Bungie livre un jour de vraies icônes vertes, la comparaison ne trouve plus rien et la correction s'éteint toute seule.** Réglage unique : `src/data/teinteIconesDoctrine.ts`.
- **Calibrage par mesure** : l'angle nominal d'un filtre de teinte n'est pas le décalage réel de teinte (−60° nominal ne donnait que 166° de teinte au lieu des 157° du vert du Filobscur de l'appli). Mesure dans un navigateur sur trois bleus de Stase : **−70° donne 157°, 156° et 158°** (écart moyen 0,7°), luminosité perçue −9 %.
- **C'est une approximation faite par l'appli, pas une image de Bungie.** Le diagnostic des icônes reste disponible (`npm run dev`) pour les deux autres classes.

**Vérifié** : `tests/logique/teinte-icones.test.tsx` (14 contrôles : la règle et tous les cas où elle ne doit PAS s'appliquer ; lecture des icônes de la Stase dans une fausse base ; mise en cache ; aucune lecture de la base hors Filobscur ; export HTML ; fiche à l'écran) et `tests/ui/teinte.py` (3 contrôles dans un vrai navigateur : fond synthétique bleu de Stase devenu vert à 157°, luminosité conservée à 15 % près, glyphe blanc inchangé). **Quatre mutations volontaires toutes détectées** (compétence de classe non recolorée, Stase recolorée aussi, export sans filtre, réglage faussé).
**NON vérifié** : la couleur sur les VRAIES images de Bungie (inaccessibles ici ; le test utilise une icône synthétique) ; le Filobscur du Titan et de l'Arcaniste (la règle est fondée sur les données et ne touche pas une icône qui n'est pas celle de la Stase, mais je n'ai vu les diagnostics que du Chasseur) ; l'affichage réel dans la grille de doctrine (câblage simple, relu, mais pas testé dans la page complète).
**Défauts de mes tests, corrigés en route** : un critère de luminosité qui comparait le maximum des canaux alors que le filtre conserve la luminance perçue ; un rendu de fiche qui exigeait un objet `window` ; un script de calibration qui cherchait Chromium au mauvais endroit.
**Erreur de manipulation de ma part, rattrapée** : le PDF de tests avait été généré sous le numéro 0.4.0 (version pas encore changée) puis supprimé par erreur ; régénéré après le changement de version.

## 12/10/2026 — v0.4.0

**Numéro de version** : 0.4.0 (installateur `Forge-Armory-Setup-0.4.0.exe`, liste `A-TESTER-0.4.0.pdf`, qui reprend aussi les tests de la 0.3.19, toujours à faire).

**Retours de l'utilisateur** : logo Forge **validé** ; logo « Solo sans mourir » : « on y reviendra » (rien d'intégré) ; fichier « Retours et ajouts du 12/10 » ; dépôt GitHub créé (voir l'entrée du 11/10). Éléments : « Cryo-électrique » est le nom français de l'Arc (à ne pas confondre avec l'arme), « Stase » celui de la Stase : c'est déjà ce que l'appli affiche.

**Fait dans cette version**
1. **Onglet Forge** (entre Load-outs et Bibliothèque) : bouton validé dans ses deux états, page « en construction » (le contenu est prévu en 0.4.2 et suivantes). **Quatre boutons sur une seule ligne** : à quatre, ils passaient sur deux lignes à toutes les largeurs (la page était limitée à 960 px, il en faut 980). La page passe à 1032 px et la hauteur commune des logos dépend maintenant de la largeur disponible : 56 px dès ~1040 px de fenêtre, puis 53 px (1000), 51 (960), 47 (900), 43 (820) ; les titres de blocs et les boutons de profil suivent la même variable. La fenêtre du logiciel a une **largeur minimale de 820 px** (en dessous, retour à la ligne plutôt qu'un défilement horizontal, à ≤ 810 px en navigateur).
2. **Export infographique** : logos « Doctrine élémentaire » et « Artefact » devant leur titre ; **icône de classe** (disque de couleur, mêmes tracés que l'appli), **icône d'élément** (image officielle de Bungie, sinon dessin ; Prismatique : symbole à deux tons) et **icône de contexte** dans l'en-tête. Emplacements « Armes » et « Armure » prêts, **vides** en attendant les logos (repris automatiquement dès que `icone-arme.svg` et `icone-armure.svg` seront dans `public/assets/icones/`). Les logos sont intégrés en SVG dans la page (la politique de sécurité de l'export n'autorise ni script ni image locale ; elle n'a pas changé). **Changement de comportement** : le contexte « Neutre », jusqu'ici absent de l'en-tête, y figure maintenant avec son icône.
3. **Filtre d'élément de dégâts** (Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur) dans la recherche du Manifest, Mon Inventaire et le Coffre (deux filtres jumeaux, chacun son état). Il porte sur les armes (et les sous-classes) ; une armure n'a pas d'élément et n'apparaît sous aucun.
4. **Bouton « Aller à »** (recherche du Manifest, sur les armes et armures) : la page glisse sur Mon Inventaire, qui s'ouvre et se filtre sur cet objet (même `itemHash`) ; bandeau « Filtré sur … — N exemplaire(s) », message clair si l'inventaire n'est pas chargé ou si l'objet n'est pas possédé ; les sections (personnages, Coffre) qui contiennent l'objet s'ouvrent ; « ✕ Retirer ce filtre » ou « Réinitialiser les filtres » le retirent. Un autre exemplaire de la même arme sous un autre hash (réédition, version « adepte ») n'est pas inclus.
5. **Documentation** : le README passe de 815 à 37 lignes. Mode d'emploi → `NOTICE.md` (publié) ; notes de conception, calibration, points de vigilance → `NOTES-CONCEPTION.md` (**interne** : à mettre dans le `.gitignore`, avec `A-TESTER*` et `GUIDE-DEMARRAGE*` : voir `documentation/GITIGNORE-A-AJOUTER.txt`). Aucune ligne perdue (648 sur 649, la dernière étant un titre renommé). Les textes de l'appli qui renvoyaient au README pointent vers la notice. La notice présente les poids de score avec les noms et l'ordre de l'écran.
6. **Dossier `tests/` dans le projet** (il se perdait avec mon environnement de travail) : `node tests/lancer-tout.mjs` rejoue tout ; voir `tests/README.md`.
7. **Bug « Filobscur : icônes de saut et de compétence de classe sur fond bleu (Stase) »** : **NON corrigé**. Sans ton Manifest je ne peux pas le reproduire ; le code ne fusionne rien par nom entre éléments : les icônes viennent telles quelles du Manifest pour la sous-classe choisie. Ajout d'un **diagnostic** (`npm run dev` seulement) : bouton « 🔍 Copier le diagnostic des icônes de cette doctrine » dans le bloc Doctrine ; à lancer en Stase puis en Filobscur et à me copier (il dit si les deux partagent les mêmes listes d'options).

**Vérifié** : `tests/` : visuels, icônes, export, filtre d'élément, diagnostic et deux scénarios d'interface dans un navigateur avec les VRAIS composants (sélecteur à quatre boutons à sept largeurs ; inventaire : « Aller à » et filtres, Coffre compris). **Mutations volontaires toutes détectées** (ancienne mise en page, Coffre qui ignore « Aller à », sections qui ne s'ouvrent plus, cinétique reconnu sur une armure, largeur fausse dans le catalogue). Les icônes de classe et d'élément s'affichent **exactement comme avant** (comparaison à un instantané pris sur le code de la 0.3.19).
**Défauts de mes tests, corrigés en route** : un test qui réécrivait un fichier généré pendant son exécution (contrôle sans valeur) ; du JSX dans un fichier `.ts` ; une maquette trop pauvre pour détecter un Coffre qui ignorerait « Aller à » ; une page de test sans contenu sous l'inventaire (défilement impossible).
**NON vérifié** : le typage strict (pas de types React dans mon environnement : `npm run build` le fera à ta première étape) ; l'intégration réelle de « Aller à » avec la recherche du Manifest (le bouton est du câblage simple, vérifié par relecture et par la logique de l'inventaire, pas par la page complète) ; l'export dans le logiciel installé (aperçu navigateur seulement : icônes officielles de Bungie non chargées sans réseau) ; la connexion Bungie.
**Reporté** : « Transférer vers » (0.4.1 ; faisable : `TransferItem` et `EquipItem` existent et le droit d'écriture est demandé) ; contenu de la Forge (0.4.2 et suivantes) ; logos Arme et Armure (à fournir) ; logo « Solo sans mourir » (l'utilisateur y reviendra).

## 11/10/2026 — Mise en place du dépôt GitHub (pas de changement de version)

**Numéro de version** : inchangé (0.3.19) ; aucune modification du code, de l'interface ni des données.

**Création et mise en place du dépôt GitHub** (`Orynick/Forge-Armory`, public) :
- le dossier `d2-build-analyzer` (ancienne version 0.1.0 du projet, avant le renommage) est **supprimé** du dépôt : la racine ne contient plus que `LICENSE`, `README.md` et le dossier `forge-armory` ;
- **branche `test` créée** (depuis `main`) : les modifications poussées dessus permettront une prévisualisation sur l'hébergeur (Vercel ou Netlify) sans toucher au site principal ; merge vers `main` pour publier ;
- `TODO.md` et `CHANGELOG.md` **sont désormais versionnés dans le dépôt** (ils étaient auparavant seulement dans les fichiers du projet d'assistance) ; le `.gitignore` a été mis à jour en conséquence ;
- dossier de documentation interne `documentation/todo/` (archives de TODO) également versionné.

**Règles adoptées** :
- branche `main` = état publié ; branche `test` = essais et prévisualisation ;
- chaque mise à jour suit le cycle : modifier en local (`npm run dev`), commit, push (sur `test` ou `main`), vérifier le déploiement.

**Non couvert ici** : la connexion du dépôt à un hébergeur (Vercel ou Netlify) n'est pas encore faite ; aucun déploiement n'existe donc pour l'instant.

## 08/10/2026 — v0.3.19

**Numéro de version** : 0.3.19 (installateur `Forge-Armory-Setup-0.3.19.exe`, liste `A-TESTER-0.3.19.pdf`, qui reprend les tests de la 0.3.18, non encore faits, et ajoute la nouveauté).

**Réponses de l'utilisateur à mes trois questions** : (1) **épaisseur du soulignage : « c'est bon comme ça »** : validée, plus de question ; (2) **billes du bloc « Classe et Doctrine » : « Oui »**, on les grossit pour égaler celles de la carte « Doctrine élémentaire » ; (3) **logo « Solo sans mourir »** : largeur du panneau « à voir en fonction du logo » : aucune des trois options (cadre plus étroit, panneau élargi, titre plus petit) n'est retenue pour l'instant, rien à faire côté code.

**Billes de l'icône du bloc « Classe et Doctrine »** : les six billes bleues passent de 25 à 30 sur le cadre de 1024, et le masque qui découpe l'hexagone autour d'elles de 42 à 47 (même écart), dans les **deux états** du bloc (`titre-doctrine-deplie.svg` et `titre-doctrine-replie.svg`), par une nouvelle étape du script de retouche (`agrandirBillesDoctrine`, idempotente, sans toucher au point central de rayon 11). **Les deux icônes (celle du bloc et celle de la carte « 1. Doctrine élémentaire ») sont maintenant strictement identiques**, aux identifiants internes près. L'archive d'origine reste intacte ; la note des retouches (`documentation/identite-visuelle/RETOUCHES-VISUELS.md`) est à jour.

**Vérifié** : test des visuels **32 contrôles** (un de plus et deux modifiés) : les billes valent 30 et le masque 47 sur les trois fichiers (carte, bloc déplié, bloc replié), le point central n'est pas touché ; **les deux icônes sont identiques** (comparaison du dessin complet, identifiants internes normalisés) ; **les retouches ne touchent rien d'autre que ce qui est annoncé** (en remettant l'ancien soulignage, et pour les deux fichiers du bloc les anciennes billes, on retrouve exactement les fichiers d'origine de l'archive) ; reproductibilité depuis l'archive d'origine : **35 retouches** (33 + les deux fichiers du bloc), octet pour octet, puis idempotence. **Mutation volontaire détectée** : une bille du bloc remise à 25 fait échouer 4 contrôles. Toute la batterie passe.
**Défaut de mon test, corrigé** : mon seuil « le dessin de l'icône fait plus de 800 caractères » était arbitraire alors que le dessin en fait exactement 800 (remplacé par un seuil raisonnable ; la vraie condition reste l'égalité stricte des dessins).
**Non testé de bout en bout** : la page réelle (connexion Bungie), le logiciel installé.

## 08/10/2026 — v0.3.18

**Numéro de version** : 0.3.18 (installateur `Forge-Armory-Setup-0.3.18.exe`, liste `A-TESTER-0.3.18.pdf`, qui ne contient que les nouveautés).

**Retour de l'utilisateur sur la 0.3.17** : PDF renvoyé, **10 cases cochées sur 10** (relecture automatique), archivées mot pour mot (**84 sections validées**). Réponses données en discutant : « Classe et Doctrine » = bien le bloc sous « Mon Inventaire » ; épaisseur du soulignage, billes du bloc et icônes : en attente ; titre illustré : **oui pour « Solo sans mourir »** seulement (logo à fournir, contrainte de largeur du panneau posée dans la TODO). Puis **deux demandes** avec le PDF :

1. **Bloc « Classe et Doctrine » : on garde le logo.** Le dessin dit toujours « DOCTRINE ET ÉLÉMENT » ; le nom lu par les lecteurs d'écran est « Classe et Doctrine » (déjà le cas depuis la 0.3.17). **La demande de nouveau logo de la 0.3.17 est annulée** (TODO et note des retouches mises à jour).
2. **Scoring : nouvel ordre et nouveaux numéros des piliers**, « mêmes logos pour chaque titre, seuls le chiffre et la position changent », pour **suivre l'ordre des blocs au-dessus du Scoring** : **1. Doctrine élémentaire** (avant : « Élément et Doctrine »), **2. Armes et Armures** (avant : 3), **3. Artefact** (avant : 2), 4. Effets du Build et 5. Statistiques inchangés.
   - **Source unique** (`data/piliers.ts`) : `ORDRE_PILIERS` = element_doctrine, loot_coherence, perks_artefact, verbes_element, stats_2_0 ; `LIBELLES_PILIER` renumérotés. Le tableau que produit le **moteur** (`lib/scoring/pillars.ts`) est réordonné de la même façon (un garde-fou de développement compare les deux). Aucun code ne dépendait de la position des piliers. **Scores, poids et score global strictement inchangés**, vérifiés contre l'ancien moteur (copie figée) dans les quatre contextes ; le tableau de pondération du bloc « 0. Contexte du Build » suit le nouvel ordre avec les mêmes poids par pilier.
   - **Les titres illustrés** : le texte des titres est **dessiné en tracés**, pas en police : changer « 2. » en « 3. » et écrire « 1. DOCTRINE ÉLÉMENTAIRE » exigeait de redessiner des lettres. Je les ai recomposées **avec les lettres déjà dessinées dans tes propres titres** (nouvel outil `scripts/glyphes-titres.mjs`, étape 4 de `scripts/retoucher-visuels.mjs`) : le « 3 » de l'ancienne carte « Armes et Armures », le « 2 » de l'ancienne carte « Artefact », « DOCTRINE » et « ÉLÉMENT » de ton titre « Doctrine et Élément » (avec le « O » à losange), « AIRE » de « Mon Inventaire ». Les espaces sont ceux de tes dessins (seul l'écart « . → D », absent de tes titres, est déduit de l'écart « . → É » corrigé de la différence de marge entre D et E, mesurée dans « Sauvegarde et partage du Build ») ; le soulignage est recalculé à la nouvelle largeur avec les marges mesurées dans tes titres et le titre est recentré sur 4264,4. **Preuve de fidélité** : recomposer chacun de tes 15 titres d'origine avec cet outil redonne **exactement** le même dessin (écart 0,00000). **Ce sont des modifications de ton dessin par moi, à relire à l'œil** ; question posée, avec la possibilité de fournir tes propres versions.
   - **Fichiers** : les nouveaux portent le bon numéro (`titre-1-doctrine-elementaire.svg`, `titre-2-armes-armures.svg`, `titre-3-artefact.svg`) et sont déclarés dans le **complément** du catalogue (`forgeAssetsComplement.ts`, désormais 5 visuels) ; les trois anciens (`1-element-doctrine`, `2-artefact`, `3-armes-armures`), devenus **trompeurs** (« titre-2-artefact.svg » aurait affiché « 3. »), sont **supprimés** de `public/assets/` (ils restent dans l'archive d'origine) et listés comme remplacés. L'icône de la carte du pilier 1 garde la retouche de la 0.3.17 (proportions de « Doctrine », billes agrandies).
   - **Ce que je n'ai PAS changé, et pourquoi** : les « Pilier N » des commentaires du code, du README, de la base de connaissances et de la TODO suivent l'**ancienne** numérotation d'avant le 06/09/2026 (ancien Pilier 2 = Verbes d'Élément, aujourd'hui « 4. Effets du Build ») : les renommer fausserait ces documents ; une table de correspondance est ajoutée dans `data/piliers.ts`. **Incohérence ancienne, non traitée** : le mode diagnostic affiche « Diagnostic Pilier 2 » (ancien numéro des verbes) ; à corriger si demandé.

**Vérifié** : test de l'**ordre des piliers produit par le moteur** (nouveau, 10 contrôles : ordre égal à la source unique et score, poids et score global identiques à l'ancien moteur dans les quatre contextes ; tableau des poids complet) ; test des visuels **31 contrôles** (complément à 5 visuels, 62 fichiers sans reste, les 3 anciens fichiers absents ; les trois titres recomposés contiennent exactement les lettres attendues, le « 3 » et le « 2 » sont ceux des anciennes cartes, espacements d'origine conservés, soulignage centré à 0,1 près avec les marges mesurées dans tes titres, aucun reste de l'ancien nom dans les balises et les identifiants ; **fidélité de l'outil sur les 15 titres d'origine** ; ordre et libellés du Scoring = numéros des images ; reproductibilité depuis l'archive d'origine : 33 retouches, octet pour octet, puis idempotence) ; test des titres **28 contrôles** (cartes dans le nouvel ordre avec leurs scores) ; test du bloc de contexte **9 contrôles** (tableau des poids dans le nouvel ordre, chacun avec son poids) ; **mutations volontaires toutes détectées** : ancien ordre remis dans le moteur (5 contrôles échouent), et, comme en 0.3.17, soulignage mince et titres à 40 px. Toute la batterie passe.
**Défauts de mes tests, corrigés** : une comparaison de chaînes arrondies à 4 décimales (déplacer une lettre peut changer le 4e chiffre sans changer le dessin : tolérance de 0,01), une comparaison d'objets dont les clés sont dans un autre ordre (c'est précisément le changement voulu : comparaison clé par clé), un script de mise à jour du test des titres qui s'arrêtait avant d'écrire (refait), et une légende d'image sans accents (police de mon outil).
**Non testé de bout en bout** : la page réelle (connexion Bungie), le logiciel installé, un affichage du Scoring avec une vraie base de données (le test utilise le moteur sans base : les piliers dépendant de la base valent 0 pour le build de démonstration, mais l'ordre et les poids sont, eux, exercés).

## 07/10/2026 — v0.3.17

**Numéro de version** : 0.3.17 (installateur `Forge-Armory-Setup-0.3.17.exe`, liste `A-TESTER-0.3.17.pdf`, qui ne contient que les nouveautés).

**Retour de l'utilisateur sur la 0.3.16** : PDF renvoyé, **21 cases cochées sur 21** (relecture automatique), archivées mot pour mot (**82 sections validées**) ; l'onglet Load-outs est validé (les trois livraisons de la TODO § 16). Avec ce PDF, **six demandes** :

1. **Titres de blocs agrandis, à la même taille que les titres des onglets** « Build Analyzer », « Load-outs » et « Bibliothèque » : **56 px** au lieu de 40 px, par la **même variable CSS** que les boutons du sélecteur (`--hauteur-logo-titre: clamp(2.6rem, 7vw, 3.5rem)`, définie une seule fois ; elle sert aussi aux boutons de profil). Sur écran étroit : 41,6 px, comme le sélecteur. Mesuré : titre de « Mon Build » = bouton du sélecteur = 56 px.
2. **Soulignage manquant (« le cristal sans le soulignage »)** : **le soulignage n'était pas absent du dessin**. Dans tous les titres, le trait argenté sous le texte fait **8 unités d'épaisseur sur 1024**, soit **0,3 px à 40 px de haut** : plus fin qu'un pixel, donc à peine visible (**luminosité mesurée : 66 à 70 sur 255**, pour *tous* les titres, pas seulement « Doctrine et Élément » et « Mon Build »), alors que le cristal, plus gros, se voit. Ton impression « peut-être lié à la taille » était juste. **Corrigé dans les 24 titres** : épaisseur portée à 20 unités ; **mesuré : 168 à 215 sur 255 à 56 px, 109 à 159 à 41,6 px, quel que soit le décalage vertical du bloc**. C'est une retouche de ton dessin, faite par un script (`scripts/retoucher-visuels.mjs`, documentée dans `documentation/identite-visuelle/RETOUCHES-VISUELS.md`) : ton archive reste intacte et le script se relance après tout remplacement de fichier. **Question posée** : l'épaisseur te convient-elle ?
3. **La ligne « Contexte du Build » au-dessus de « Mon Build » est retirée** ; ses quatre boutons sont **DANS « Mon Build », en partie haute, sous le titre** (`ResumeBuild`, nouvelles propriétés facultatives `contexte` et `onChangerContexte`), à la même échelle qu'avant (80 %). Conséquence à connaître : replié, « Mon Build » **cache aussi** ces boutons. Le bloc « 0. Contexte du Build » plus bas est inchangé. Le visuel `titre-contexte-ligne` reste livré mais n'est plus utilisé.
4. **« Sous Mon Inventaire, renomme le titre en Classe et Doctrine »** : **j'ai compris qu'il s'agissait du bloc placé sous « Mon Inventaire », « Doctrine et Élément »** (le bloc des cartes Chasseur / Titan / Arcaniste et des sous-classes, dont le nouveau nom colle bien au contenu), **pas de « Mon Inventaire » lui-même**. **À confirmer** : c'est une interprétation. Le nom lu par les lecteurs d'écran est « Classe et Doctrine » ; **l'image dessine encore « DOCTRINE ET ÉLÉMENT »** : logo à fournir, ajouté à la TODO (§ 16 bis) comme demandé.
5. **Connexion à Bungie et Recherche dans le Manifest ne sont PAS repliables** (réponse négative à ma question de la 0.3.16) : les deux blocs redeviennent fixes (`<div>` + `<h3>`, comme avant la 0.3.16), avec la **version du titre sans le losange + / −**, reprise de ta livraison précédente (cadre 7505), identifiants internes préfixés comme ceux de ton archive actuelle. Déclarée dans `src/data/forge/forgeAssetsComplement.ts` : le catalogue généré `forgeAssets.ts` n'est jamais modifié à la main. Les cinq autres blocs (Mon Inventaire, Classe et Doctrine, Mon Build, Artefact, Sauvegarde et partage du Build) gardent le losange + / −.
6. **Logo de « 1. Élément et Doctrine »** : les deux icônes avaient exactement la même géométrie, mais celle du bloc « Doctrine et Élément » est agrandie ×1,4 autour du centre du cercle et celle de la carte ne l'était pas. La carte reprend **le même agrandissement (mêmes tracés)** ; **ses six billes bleues sont agrandies** (rayon 25 → 30, soit 20 % de plus que celles du bloc ; le masque qui découpe l'hexagone autour d'elles passe de 42 à 47 pour garder le même écart). **L'icône du bloc n'est pas touchée** : si les billes de la carte doivent être aussi grosses que celles du bloc, ou l'inverse, **question posée**.

**Vérifié** : test de logique des visuels **23 contrôles** (catalogue de 60 + complément de 2 = 62 fichiers présents et sans reste ; dimensions réelles ; identifiants internes uniques sur les 62 ; soulignage de 20 unités dans les 24 titres ; **pour les 21 autres titres du catalogue, en remettant l'ancien soulignage on retrouve exactement le fichier d'origine : rien d'autre n'est touché** ; carte 1 : mêmes tracés, mêmes ×1,4, billes 30 et masque 47 ; billes du bloc Doctrine intactes ; **reproductibilité : en repartant de l'archive d'origine, le script redonne octet pour octet les 62 fichiers livrés** ; idempotence ; variable de hauteur unique) ; test des titres **28 contrôles** sur les vrais composants (14 titres visibles, 19 images, 56 px, largeurs par famille, Connexion et Manifest non repliables, cinq blocs repliables à deux états, soulignage mesuré à plusieurs décalages et deux largeurs, fenêtre de 420 px) ; test de la page **38 contrôles** (boutons de contexte dans « Mon Build », sous le titre et avant son texte d'aide, plus de ligne de contexte, titre de la même hauteur que les boutons du sélecteur, repli qui cache les boutons) ; test de version 25 contrôles (la 9.7.0.5, voir l'entrée suivante). **Mutations volontaires, toutes détectées** : soulignage mince remis sur « Mon Build » (4 contrôles échouent), titres remis à 40 px (6 échouent), une bille de la carte 1 modifiée à la main (2 échouent).
**Défauts de mon propre travail, corrigés** : ma date « 08/10/2026 » dans des commentaires (il était 23 h 55 le 7) ; mes tests : une regex trop large qui prenait le sous-bloc « Doctrine » pour un titre, un remplacement global qui abîmait l'arc de la jauge du score global (le script, lui, ne touche que le soulignage : c'est ce que le test prouve maintenant), un motif qui ne reconnaissait pas un sélecteur CSS groupé, et un import manquant.
**Non testé de bout en bout** : la page réelle (connexion Bungie), le logiciel installé, et un écran à forte densité de pixels (le soulignage y sera encore plus net).

## 07/10/2026 (soir) — suivi de la mise à jour 9.7.0.5 du jeu · **livré dans la 0.3.17**

**Contexte** : pendant que l'utilisateur teste la 0.3.16, il a collé le texte français de la mise à jour **9.7.0.5 de Destiny 2** (publiée le 7 octobre 2026) sans autre consigne. J'ai appliqué la procédure établie du projet (TODO § 10, `27_PATCHNOTES/LISEZ-MOI.md`) : une fiche rédigée, puis la mise à jour de la liste des correctifs. **Aucun zip à part** : l'utilisateur testait alors la 0.3.16 et je ne lui ai pas fait réinstaller pour cela ; ces changements sont livrés avec la **0.3.17** (voir l'entrée ci-dessus).

**Vérification à la source** : le texte collé a été recoupé par recherche web : la 9.7.0.5 existe bien, publiée le 7 octobre 2026 (consoles 4.02 / « 1.097 » selon un site de suivi, sans doute 1.197), et la version anglaise contient une ligne que l'extrait français collé n'avait pas (les comptes qui ont exploité ces triches de façon malveillante sont sanctionnés). **La page officielle de Bungie n'a pas été retrouvée** : les liens officiels restent à compléter, rien n'a été inventé.

**Ce qui a changé** :
- **Lien officiel reçu** : l'utilisateur a donné la page officielle (`https://www.bungie.net/7/en/News/Article/destiny_2_update_9_7_0_5`) ; **c'est une application JavaScript que mes outils ne savent pas lire** : le texte n'a donc pas pu être relu ligne à ligne ; le lien est enregistré dans la fiche (le lien français reste à compléter), et la fiche dit clairement que sa lecture repose sur le texte collé et sur le site de suivi, qui concordent ;
- **`knowledge-base/27_PATCHNOTES/2026-10-07_9.7.0.5.md`** : la **première fiche** du dossier (celle de la mise à jour la plus récente, comme la mise en route le prévoit), en français et en anglais, avec mes propres mots (les patch notes sont protégés), un en-tête (titres, date, version, sources, statut), « ce qui change », l'**effet sur l'appli : aucun** (pas d'objet, pas de valeur, pas de changement de règle annoncé) et trois points à vérifier. **Format à valider avec l'utilisateur.** `LISEZ-MOI.md` du dossier et `00_INDEX.md` mis à jour ;
- **`src/data/versionJeu.ts`** (source unique de l'affichage en haut à droite du titre) : la **9.7.0.5 ajoutée (7 octobre 2026), marquée intégrée** (fiche faite, aucun effet à reporter) ; la **date de la 9.7.0.1 est retrouvée (16 juin 2026**, site de suivi, source non officielle) ; l'affichage devient « Correctifs : aucun intégré · dernier publié : 9.7.0.5 (7 octobre 2026) » ; le **niveau reste « aucun intégré »**, parce que les correctifs sont cumulatifs et que la 9.7.0.1 à la 9.7.0.4 n'ont pas de fiche ;
- **un défaut latent de l'infobulle, corrigé** : une 9.7.0.5 « intégrée » placée après des correctifs manquants aurait fait écrire à l'infobulle à la fois « 9.7.0.5 (intégré) » et « Pas encore intégrés : … 9.7.0.5 ». Elle distingue maintenant les correctifs manquants de ceux déjà intégrés mais placés après un manquant (« Déjà intégré, mais après un correctif manquant… »), au singulier et au pluriel ; `infobulleVersionJeu` accepte une liste en paramètre (même comportement par défaut) pour pouvoir être testée ;
- **TODO § 10** : état, points à vérifier, suite dans l'ordre anti-chronologique (9.7.0.4 à 9.7.0.1, dès que l'utilisateur colle leurs textes) et **pistes relevées dans des sites de suivi, NON vérifiées** : **⚠️ CORRECTION** (même soirée, après réception du lien officiel) : j'avais écrit que la 9.7.0.2 « ajuste des bonus de sets d'armure » : **c'était FAUX**. Cette affirmation venait de l'introduction d'un site de suivi ; le **texte officiel de la 9.7.0.2** (page bungie.net remontée par la recherche) ne contient que des corrections d'activités (Opérations, Panthéon, raids, donjon Dualité) et une ligne Eververse : **aucun bonus de sets d'armure**. D'après les textes relevés (officiel pour la 9.7.0.2, sites de suivi pour les autres) : les 9.7.0.1, 9.7.0.2 et 9.7.0.3 ne contiennent que des corrections d'activités et d'interface, sans rapport avec le scoring ; seule la 9.7.0.4, sans notes de patch propres, pourrait désactiver en Creuset le bonus 4 pièces du set Europa : **toujours non vérifié**.

**Vérifié** : test de version **25 contrôles** (les trois contrôles sur les vraies données mis à jour : cinq correctifs, dates, libellé affiché ; plus la cohérence de l'infobulle sur les vraies données et sur les cas : aucun intégré, intégrés jusqu'à .2, tout intégré, le « piège » .3 intégré sans .2, deux correctifs hors série au pluriel, liste vide, comportement par défaut inchangé) ; types et importations ; batterie complète (voir ci-dessous).
**Non testé** : l'affichage dans l'appli réelle (le texte du badge n'est testé que par sa fonction).

## 07/10/2026 — v0.3.16

**Numéro de version** : 0.3.16 (installateur `Forge-Armory-Setup-0.3.16.exe`, liste `A-TESTER-0.3.16.pdf`, qui reprend celle de la 0.3.15 non encore testée et remplace sa section des titres).

**Demande de l'utilisateur** : « Intègre ça stp », avec l'archive `forge-armory-app-assets.zip` : 60 SVG (sélecteur 6, profils 8, **blocs repliables 14**, titres fixes 8, icônes 19, symboles 4, emblème 1), un catalogue (`manifest.json`, `forgeAssets.ts`) et une charte graphique HTML.

**Ce que j'ai vérifié AVANT d'intégrer** (comparaison de rendu dans un navigateur, pas de supposition) : les **22 boutons et titres fixes sont IDENTIQUES au pixel près** à ceux déjà intégrés (seuls leurs identifiants internes ont été renommés) ; l'**emblème** du pack s'affiche exactement comme celui du projet (0 pixel de différence) : **rien n'a été changé de ce côté**. Ce qui est NOUVEAU : les titres des **sept blocs repliables** en deux états, sur un cadre un peu plus large (7805 × 1024 au lieu de 7505).

**1. Structure et catalogue.** Les 60 SVG sont sous `public/assets/<famille>/` (structure de l'archive) ; les anciens dossiers `public/boutons`, `public/boutons-profils` et `public/titres` sont **supprimés** (aucun doublon, aucun reste d'ancienne version). `src/data/forge/forgeAssets.ts` est le catalogue de l'auteur des visuels, repris **tel quel** (généré : ne pas le modifier à la main) ; `src/lib/visuelsForge.ts` (`urlVisuel(id)`) résout un identifiant en chemin (préfixé par `BASE_URL`, comme toujours) et ne plante pas sur un identifiant inconnu. `SelecteurVues`, `PastilleContexte` et `TitreCategorie` lisent leurs fichiers par le catalogue au lieu de chemins écrits à la main. L'archive complète, charte graphique comprise, est conservée dans `ressources-installateur/forge-armory/app-assets/` ; une note (`VISUELS-ARCHIVES.md`) dit que c'est elle qui fait foi et que les quatre livraisons antérieures ne sont gardées que pour l'historique.

**2. Titres de blocs à deux états** (`components/TitreRepliable.tsx`). Le dessin porte à droite un losange **« + » (argent) quand le bloc est replié, « − » (cyan) quand il est déplié**. Les deux images sont dans le DOM et **c'est le CSS qui montre la bonne selon l'attribut `open` du `<details>` parent** (`details[open] > summary .titre-repliable__deplie`…) : aucun état React à synchroniser, donc le repli au clic, au clavier ou par programme est toujours juste ; l'image cachée est en `display: none`, donc **lue une seule fois** par les lecteurs d'écran. **Rien ne bouge au changement d'état** (même cadre, vérifié : position et taille identiques, pour les sept blocs). `TitreCategorie` ne garde que les **huit titres fixes** (« 0. Contexte du Build », la ligne « Contexte du Build », les cartes 1 à 5, le Score global).
- **Connexion et Manifest deviennent REPLIABLES** : changement de comportement, que je signale. L'archive ne leur fournit **qu'un titre à deux états** (pas de version fixe), donc leur donner un titre sans les rendre repliables aurait montré un losange « − » qui ne ferait rien. Ils sont convertis en `<details>` ouverts par défaut, comme les cinq autres : le contenu reste monté quand ils sont repliés (rien n'est perdu), le statut reste visible dans l'en-tête replié. **Question posée** ;
- **un défaut de MON intégration, trouvé par mes tests et corrigé avant livraison** : l'appli dessine déjà son propre triangle ▶ / ▼ devant les titres (règle `summary::before`, qui remplace le triangle natif déjà masqué). Mon premier CSS ne masquait que le triangle natif : les blocs auraient affiché **un triangle ET le losange**, avec un décalage de 16 px. Corrigé (`summary:has(.titre-repliable)::before { content: none }` et la ligne d'en-tête reprend toute la largeur) ; les autres sous-blocs repliables de l'appli, comme « Doctrine — aucune sous-classe choisie », **gardent leur triangle** (vérifié) ;
- **`aria-expanded`** (conseillé par la notice) : non ajouté, car `<details>/<summary>` expose déjà nativement l'état replié ou déplié aux lecteurs d'écran ; en ajouter un à la main serait redondant.

**3. Textes lus par les lecteurs d'écran (`alt`).** Je garde la graphie écrite par l'utilisateur dans la conversation, qui diffère du catalogue sur deux points, **uniquement par la casse** (les images sont en capitales) : « Sauvegarde et partage du **B**uild » (le catalogue écrit « Partage » avec un P majuscule) et « Contexte du **B**uild » (le catalogue écrit « build » en minuscule) ; **question posée**. Un test vérifie que mes libellés ne diffèrent du catalogue que par la casse.

**4. Rappels de la charte, et ce que je n'ai PAS utilisé.** (a) La charte conseille **40 px minimum** pour les titres et boutons, « en dessous, utiliser l'icône seule » : les **28 px** demandés et validés par l'utilisateur (bouton « Load-outs » après un enregistrement, boutons du bloc « 0. Contexte du Build ») sont sous ce minimum ; laissés tels quels, question posée. (b) **Non utilisés** : les 19 icônes (« barres latérales réduites, onglets »), les 4 symboles de profil, l'emblème (identique) : expédiés dans `public/assets/`, **question posée sur leur emplacement** ; les tiroirs « Loadouts » et « Solo sans mourir » et les vues Bibliothèque et Load-outs gardent leur titre texte. (c) **Licence** : la notice signale que le logo « Artefact » reprend un SVG de SVG Repo (« shield-artifact ») : **à vérifier avant toute diffusion publique** (TODO).

**Vérifié** : un nouveau test de logique **14 contrôles** qui recoupe le catalogue TypeScript et le `manifest.json` de l'archive (identiques), l'existence des 60 fichiers, l'absence de tout fichier en trop, l'absence des anciens dossiers, la dimension réelle (`viewBox`) de chaque SVG, un cadre unique par famille, les `aspect-ratio` du CSS (4316, 3781, 7505, 7805 sur 1024), l'unicité des identifiants internes des SVG sur les 60 fichiers (aucun doublon : ils pourront être intégrés dans la page sans collision), l'existence de tous les identifiants demandés par l'appli, l'égalité des libellés à la casse près et l'identité du cadre replié et déplié. **Je l'ai fait échouer volontairement** (ratio du CSS faussé : détecté ; fichier supprimé : détecté, après avoir corrigé le test qui plantait au lieu de signaler l'échec). **Test des titres réécrit : 25 contrôles** sur les VRAIS composants (quinze titres visibles ; 22 images dont 7 cachées ; fichiers visibles corrects ; hauteur unique et largeurs par famille ; alt ; sémantique ; un seul nom lu par titre ; triangle de l'appli masqué sur les sept et conservé ailleurs ; titre collé au bord gauche ; ligne d'en-tête pleine largeur ; clic de souris replie et l'image devient « replié », pour les sept ; rien ne bouge ; clavier ; Connexion et Manifest repliables avec statut conservé ; tous repliés d'un coup ; fenêtre de 420 px). Les tests du sélecteur, des profils, du bloc de sauvegarde et du reste passent avec les nouveaux fichiers ; seuls les chemins qu'ils lisaient ont été adaptés.
**Défauts de mes tests, corrigés** : une variable locale nommée `res` écrasait la liste des résultats ; l'attente initiale visait la première image, justement celle qui est cachée ; une expression régulière trop large prenait le sous-bloc « Doctrine — aucune sous-classe » pour un titre ; un test plantait au lieu de signaler un fichier manquant.
**Non testé de bout en bout** : la page réelle (connexion Bungie : le bloc « Connexion », la ligne de contexte et le score global ne sont testés que par leur reproduction) et le logiciel installé.

## 07/10/2026 — v0.3.15

**Numéro de version** : 0.3.15 (installateur `Forge-Armory-Setup-0.3.15.exe`, liste `A-TESTER-0.3.15.pdf`, qui reprend celle de la 0.3.14 non encore testée et remplace sa section des titres).

**Demande de l'utilisateur** : « Pour intégration stp », avec l'archive `forge-armory-titres-complets.zip` (15 titres), à la suite de ma réponse sur les titres restants.

**Les NEUF titres manquants sont intégrés** (`components/TitreCategorie.tsx`, passé de 6 à 15 titres ; SVG dans `public/titres/` ; archive complète conservée dans `ressources-installateur/forge-armory/titres-complets/`, y compris 12 icônes seules non utilisées). **Les six titres déjà intégrés sont identiques à l'octet près** à ceux de la nouvelle archive (SHA-256 comparés) et les quinze partagent le même cadre `0 0 7505 1024` (vérifié dans les fichiers) : rien à reprendre.
- **Mon Inventaire** (`SelecteurInventaire`, bloc repliable) : titre illustré ; la précision « (personnages + coffre) » n'est pas dans l'image (la notice de l'archive le dit : « à afficher en sous-texte si besoin ») : **gardée en petit texte gris à droite du titre**, le statut restant tout à droite ;
- **0. Contexte du Build** (`BlocContexte`) et la **ligne « Contexte du Build »** au-dessus de Mon Build (`DashboardPage`, qui remplace le libellé texte « Contexte du build : », toujours sur sa propre ligne) : même logo, deux titres ;
- **les cinq cartes de résultat** (`PilierCarte`, une table `TITRE_PAR_PILIER` : « 1. Élément et Doctrine » à « 5. Statistiques », avec repli sur le texte si un futur pilier n'a pas de titre illustré) et le **Score global** (`DashboardPage`), dont le titre est placé **au-dessus** du grand score (choix de ma part : l'image est une plaque large, le score reste le centre de la zone) ;
- **« Build » avec une majuscule dans tous les titres qui le contiennent** (nom accessible `alt`) : choix de ma part, déduit de la remarque de l'utilisateur sur « Sauvegarde et partage du Build » ; la notice de l'archive écrit « Contexte du build » en minuscule : **question posée** ;
- **les images restent accessibles et sémantiques** : chaque titre a son `alt`, les cartes de résultat en `<h3>` gardent un nom qui contient aussi leur score, les blocs repliables ont leur titre dans le `<summary>` (repli au clic sur l'image et au clavier, vérifié pour les cinq) ;
- **les deux incohérences de vocabulaire signalées sont conservées telles que l'utilisateur les a dessinées** : la carte 1 s'appelle « Élément et Doctrine » et le bloc « Doctrine et Élément » ;
- **vérifié** : **20 contrôles** dans un navigateur sur les VRAIS composants (RechercheManifest, SelecteurInventaire, GrilleDoctrine, ResumeBuild, SelecteurArtefact, BlocPartage, BlocContexte, cinq PilierCarte) ; seuls le bloc « Connexion », la ligne « Contexte du Build » et le « Score global », internes à `DashboardPage` (qui exige la connexion Bungie), sont reproduits à l'identique : quinze images, `alt` dans l'ordre, quinze SVG sous leurs noms d'origine, taille strictement identique (40 px, rapport 7505 / 1024), anciens textes disparus, titres lisibles par leur nom, scores des cinq cartes toujours à droite, sous-texte de l'inventaire placé entre le titre et le statut, aucun chevauchement, repli et dépli au clic et au clavier, taille inchangée après repli, fenêtre de 420 px (même taille qu'en grand pour les quinze, aucun titre ni en-tête ne déborde). **Un ancien test a dû être adapté** : celui du bloc « 0. Contexte du build » lisait le texte de son titre, qui est devenu une image (il lit maintenant le nom accessible) ; toute la batterie passe.
- **restent en texte simple** (hors de l'archive) : les tiroirs « Loadouts » et « Solo sans mourir », et les vues Bibliothèque et Load-outs ; **question posée**. Les outils de diagnostic et les écrans d'erreur ne sont pas concernés.
- **non testé de bout en bout** : la page réelle (connexion Bungie : le bloc « Connexion », la ligne de contexte et le score global ne sont testés que par leur reproduction) et le logiciel installé.

## 07/10/2026 — v0.3.14

**Numéro de version** : 0.3.14 (installateur `Forge-Armory-Setup-0.3.14.exe`, liste `A-TESTER-0.3.14.pdf`, qui reprend celle de la 0.3.13 non encore testée).

**Demande de l'utilisateur** : (1) « Sauvegarde et partage de Build » doit devenir « Sauvegarde et partage **du Build** » (« Attention à la majuscule »). (2) Question : « Il y a encore des titres de blocs sans logo et titre stylisé ? »

**1. Le « B » majuscule.** J'avais écrit « du build » en minuscule en recopiant la notice de l'archive (`LISEZMOI.md`) ; l'image, elle, est dessinée en CAPITALES, donc la casse ne se voit pas dans le dessin et ne concerne que les TEXTES. Corrigé partout où le nom du bloc est écrit : le nom accessible de l'image (`alt`, `LIBELLES_TITRES_CATEGORIES.sauvegarde`), le message de liste vide du panneau, les commentaires du code, la TODO, la liste de tests et les tests. **Les archives de tests ne sont PAS modifiées** (texte recopié mot pour mot, il garde l'ancien nom d'époque) ni les entrées plus anciennes de ce journal (elles décrivent l'état de leur époque).

**2. Réponse à la question : oui, il en reste.** Inventaire fait dans le code, pas de mémoire. Déjà illustrés (six) : Connexion à Bungie, Recherche dans le Manifest, Mon Build, Artefact, Doctrine et Élément, Sauvegarde et partage du Build. **Encore en texte simple**, dans le Build Analyzer : « Mon Inventaire (personnages + coffre) » (bloc repliable du même type que les six : le plus évident), « 0. Contexte du build » et la ligne « Contexte du build : » au-dessus de Mon Build, les **cinq cartes de résultat** (« 1. Élément et Doctrine », « 2. Artefact », « 3. Armes et Armures », « 4. Effets du Build », « 5. Statistiques ») avec le score global ; ailleurs : les tiroirs « Loadouts » et « Solo sans mourir », et les vues Bibliothèque et Load-outs. Les outils de diagnostic et les écrans d'erreur ne sont pas concernés. **Incohérence de vocabulaire repérée** : la carte du pilier 1 s'appelle « Élément et Doctrine » alors que le bloc illustré correspondant s'appelle « Doctrine et Élément ». Je n'ai créé aucun visuel : ils viennent de l'utilisateur (même cadre 7505 × 1024), il choisit lesquels commander.

**Vérifié** : toute la batterie passe (les tests du titre du bloc de sauvegarde lisent maintenant « du Build »).
**Non testé de bout en bout** : la page réelle et le logiciel installé.

## 07/10/2026 — v0.3.13

**Numéro de version** : 0.3.13 (installateur `Forge-Armory-Setup-0.3.13.exe`, liste `A-TESTER-0.3.13.pdf`, qui reprend celle de la 0.3.12 non encore testée et ajoute les titres illustrés).

**Demande de l'utilisateur** : « Pour intégration 🙂 » avec l'archive `forge-armory-titres-categories-final-v2.zip` (six titres de catégories, SVG).

**Titres de catégories illustrés** (`components/TitreCategorie.tsx`, styles `.titre-categorie` dans `index.css`). Les six SVG fournis sont dans `public/titres/` ; l'archive complète (titres, icônes seules 1024 × 1024, planche de contrôle, notice) est conservée dans `ressources-installateur/forge-armory/titres-categories/`. Ils remplacent le texte du titre de six blocs : `DashboardPage` (Connexion), `RechercheManifest`, `ResumeBuild` (Mon Build), `SelecteurArtefact`, `GrilleDoctrine`, `BlocPartage`. Règles d'intégration de l'archive respectées : six titres de même cadre (7505 × 1024) affichés à la **même hauteur** (la largeur suit, rapport vérifié), logo + plaque + titre = un seul élément, titres en tracés (aucune police), **pas d'état sélectionné** (ce ne sont pas des boutons ; `pointer-events: none`, le clic traverse jusqu'au titre repliable).
- **le texte reste accessible** : le titre étant dans l'image, il est repris en `alt` ; les titres en `<h3>` (Connexion, Manifest) restent des titres lisibles par leur nom ; les blocs repliables gardent leur titre dans le `<summary>` (repli au clic sur l'image ET au clavier, vérifié) ;
- **hauteur retenue : 40 px** (2,5 rem), réduite sur écran étroit sans passer sous 32 px. **C'est mon choix, l'archive n'en impose pas** : un comparatif à 48 px est fourni et la question posée ; un seul réglage à changer (`.titre-categorie`) ;
- **les MOTS changent, parce que l'image porte le texte de l'utilisateur** : « Artefact (Pilier 3) » → « Artefact » ; « Personnage & Doctrine (Pilier 1) » → « Doctrine et Élément » ; « Connexion Bungie.net » → « Connexion à Bungie » (le bouton « Connexion Bungie.net » est inchangé) ; « Sauvegarde et partage de Build » → « Sauvegarde et partage du Build » (l'image dit « du build » : j'ai aligné le message de liste vide du panneau). **Les mentions « (Pilier 1) » et « (Pilier 3) » disparaissent des titres** : je n'ai PAS ajouté de petite mention de remplacement (cela aurait surchargé un visuel livré fini) ; question posée ;
- **mise en page, un défaut trouvé par mes mesures et corrigé** : sur une fenêtre étroite (420 px), les titres étaient rétrécis DIFFÉREMMENT d'un bloc à l'autre (de 190 à 235 px de large), car ils partagent leur ligne avec un statut ; ils ne rétrécissent plus (`flex-shrink: 0`) et le statut passe SOUS le titre (`flex-wrap` ajouté aux deux conteneurs d'en-tête : `.pilier-carte h3` et `.bloc-repliable-ligne`, sans effet quand la place suffit). Mesuré : six titres de taille strictement identique à 420 px comme à 1000 px ;
- **hors périmètre de l'archive, laissés tels quels** : « 0. Contexte du build », l'Inventaire / Personnage, la Bibliothèque, le tiroir et l'onglet Load-outs gardent leur titre texte ; question posée ;
- **un débordement ANTÉRIEUR repéré, non corrigé** : à 420 px de large, le sélecteur de classe du bloc Doctrine (`button.carte-classe`, « ✓ Arcaniste ») dépasse la fenêtre de 31 px. Il n'a aucun rapport avec les titres et existait avant ; l'appli est surtout utilisée en fenêtre large : à traiter seulement si l'utilisateur le demande ;
- **vérifié** : **17 contrôles** dans un navigateur, sur les **VRAIS composants** (RechercheManifest, ResumeBuild, SelecteurArtefact, GrilleDoctrine, BlocPartage) ; seul le bloc « Connexion », interne à `DashboardPage` (qui exige la connexion Bungie), est reproduit à l'identique : six images, `alt` dans l'ordre, six SVG chargés sous leurs noms d'origine, même taille exacte, 40 px et rapport 7505 / 1024, anciens textes disparus, sémantique des titres, titres dans les `<summary>`, titre à gauche et statut à droite sans chevauchement, aucun contenu sous l'image, repli et dépli au clic de souris sur l'image pour les quatre blocs repliables, clavier (Entrée, Espace), taille inchangée après repli, fenêtre de 420 px ; **les 61 contrôles du bloc de sauvegarde ont été adaptés** (le titre se lit maintenant par l'`alt`) et passent ; toute la batterie passe.
- **trois défauts de mes tests, corrigés** : l'appel du bloc Manifest à l'API de Bungie était compté comme une « image en échec » (filtré : ce n'est pas une image) ; Playwright refusait de « cliquer » une image dont `pointer-events` est volontairement désactivé (clic de souris aux coordonnées de l'image, comme une main) ; et mon contrôle de largeur étroite ne distinguait pas un débordement antérieur de celui des titres.
- **non testé de bout en bout** : la page réelle (connexion Bungie : le bloc « Connexion » n'est testé que par sa reproduction) et le logiciel installé.

## 07/10/2026 — v0.3.12

**Numéro de version** : 0.3.12 (installateur `Forge-Armory-Setup-0.3.12.exe`, liste `A-TESTER-0.3.12.pdf`, qui ne contient que les nouveautés).

**Retour de l'utilisateur sur la 0.3.11** : PDF renvoyé, **8 cases cochées sur 8** (relecture automatique), archivées mot pour mot (79 sections validées) ; « 28 px te convient » coché : 28 px conservé. **Choix de conception demandé et obtenu** : pour réordonner, **« les deux »** (boutons ◀ ▶ ET glisser-déposer).

**Phase 3 de l'onglet « Load-outs » : ordre modifiable et case « stocké en jeu »** (TODO § 16, dernière livraison).
- **données** (`lib/loadouts/stockage.ts`) : deux champs FACULTATIFS sur un loadout, donc **aucune migration** : `ordre` (rang d'affichage) et `stockeEnJeu` (mémo). Un build ancien est lu sans être modifié (vérifié octet pour octet) ;
- **tri** : d'abord les loadouts SANS rang (neufs ou jamais déplacés), du plus récent au plus ancien comme avant ; puis ceux qui ont un rang, par rang. **Un build neuf arrive donc toujours en tête**, au-dessus de l'ordre composé par l'utilisateur ; dès qu'un déplacement a lieu, TOUS les builds reçoivent un rang 0, 1, 2… dans l'ordre affiché. Un rang illisible (« abc », infini) est ignoré ;
- **opérations** : `placerLoadout(id, index)` (glisser-déposer : prend la place visée, les autres se décalent en gardant leur ordre ; position hors limites ramenée au bord ; même place = aucune écriture, aucun événement ; position invalide refusée), `deplacerLoadout(id, ±1)` (boutons ; sans effet aux extrémités), `definirStockeEnJeu(id, bool)` (**décocher SUPPRIME le champ** au lieu d'écrire `false`) ; tous émettent l'événement du stockage de la 0.3.5, donc le tiroir (monté mais caché) suit ;
- **interface**, onglet Load-outs seulement (le tiroir est inchangé) : sur chaque carte, une ligne avec une poignée ⠿ (glisser-déposer HTML natif, retour visuel : carte atténuée à 0,45 et carte visée entourée de bleu), ◀ ▶ (grisés en bout de liste), et la case « 🎮 Stocké en jeu » (nom accessible « Stocké en jeu : <nom> »). **La légende décidée le 05/10 est en tête** : « la case est un mémo à cocher à la main : l'appli ne vérifie ni n'enregistre rien dans le jeu », avec une ligne d'aide sur l'ordre ;
- **clavier** : après un déplacement par bouton, le focus est REMIS sur le bouton utilisé (la carte change de place dans le DOM, le focus serait sinon perdu) ; si ce bouton est devenu grisé (la carte est arrivée en bout), le focus passe à l'autre bouton ;
- **recherche et filtres** (interaction annoncée dans la TODO) : **l'ordre ne se modifie que sans recherche ni filtre actif**, parce que réordonner une partie de la liste serait ambigu : les ◀ ▶ et la poignée sont alors grisés avec une infobulle qui dit pourquoi ; la case « stocké en jeu » reste utilisable ;
- **export et import** : le fichier d'échange d'**UN build** ne contient NI le rang NI le mémo (arrangements personnels : le build d'un ami n'arrive pas « stocké dans mon jeu », ni à une place imposée) ; **« Exporter tout » les conserve** ; à l'**import**, les rangs importés passent APRÈS ceux déjà présents en gardant leur ordre relatif (restaurer une sauvegarde retrouve donc l'ordre et les mémos), un rang illisible est ignoré, un rang négatif ramené à 0, et le mémo n'est repris que s'il vaut exactement `true` ;
- **limites assumées** : le glisser-déposer HTML natif **ne fonctionne pas au doigt** (écrans tactiles) : les boutons ◀ ▶ sont l'alternative, d'où le choix « les deux » ; et **je ne peux pas tester le glisser-déposer dans Electron** (installé), seulement dans un navigateur : une case de la liste de tests le demande ;
- **vérifié** : logique **32 contrôles** (tri sans rang, avec rang, mixte, égalités, rang illisible ; ◀ ▶ et leurs bords ; glisser-déposer vers le début, la fin, le milieu, soi-même, hors limites, invalide ; identifiants et contenus intacts ; build neuf en tête ; suppression, renommage et modification qui gardent ordre et mémo ; mémo coché, décoché, champ supprimé ; export d'un seul build et de tous ; import dans un stockage vide, avec ordre existant, sans rang, hostile ; compatibilité avec un build ancien) ; **interface 41 contrôles** dans un navigateur, avec un VRAI glisser-déposer à la souris (présence des contrôles dans l'onglet et leur absence du tiroir, légende, bords, déplacements par boutons, clavier avec focus conservé, glisser-déposer vers le début, la fin et sur soi-même, retour visuel pendant le glissement, tiroir qui suit le même ordre, recherche et filtres qui grisent les contrôles, case et persistance, build neuf en tête, export de tous et d'un seul, import, fenêtre de 420 px) ; **les 57 contrôles de l'onglet, les 61 du bloc et du tiroir et les 51 du tiroir passent toujours**.
- **défauts de mes tests, corrigés** : deux pages d'un même navigateur partagent le même stockage, et ma page « liste vide » effaçait les données de la première (maintenant dans un contexte isolé) ; une fenêtre de test trop basse empêchait la souris de survoler la dernière carte pendant un glissement (fenêtre agrandie) ; et j'avais écrit des données d'import qui ne correspondaient pas à mes propres attentes (trois builds dont un seul avait mes réglages).
- **non testé de bout en bout** : la page réelle (connexion Bungie), le glisser-déposer dans le logiciel installé (Electron), et un écran tactile.

## 07/10/2026 — v0.3.11

**Numéro de version** : 0.3.11 (installateur `Forge-Armory-Setup-0.3.11.exe`, liste `A-TESTER-0.3.11.pdf`, qui ne contient que les nouveautés).

**Retour de l'utilisateur sur la 0.3.10** : **tous les tests bons**, archivés mot pour mot (compteur : 76 sections validées, sans PDF renvoyé), **avec deux corrections** : (1) « il faut enlever la zone d'enregistrement du nouveau Menu Load-outs mais la conserver dans le tiroir [...] j'ai mélangé tiroir et onglet » ; (2) après la confirmation d'enregistrement, remplacer le bouton texte « Ouvrir l'onglet Load-outs » par le bouton stylisé du sélecteur, à 28 px. Aucune objection à l'emplacement du bloc « Sauvegarde et partage de Build », à la taille des boutons de contexte (28 px dans le bloc) ni à la règle du nom obligatoire : conservés.

**1. La zone d'enregistrement est dans le TIROIR, et plus dans l'onglet Load-outs.** C'était une confusion de vocabulaire, pas de code : j'avais pris « l'onglet » pour le nouvel onglet Load-outs, et fait l'inverse de ce que voulait l'utilisateur (retrait du tiroir en 0.3.8, ajout dans l'onglet en 0.3.9). `ZoneEnregistrement` (nom obligatoire, v0.3.10, intacte) s'affiche maintenant en mode « tiroir » (`!enPage && build`) ; l'onglet n'en a plus ; `DashboardPage` passe `build` et `auteur` à l'instance du tiroir et plus à celle de l'onglet ; les messages de liste vide sont échangés en conséquence (le tiroir renvoie à sa zone, l'onglet au bouton du bloc). Le tiroir retrouve donc le comportement qu'il avait « depuis longtemps », avec les corrections apportées entre-temps à la zone : nom obligatoire, et texte conservé si l'enregistrement échoue. **Leçon** : quand un mot désigne deux choses possibles dans le projet (« onglet » = tiroir ou nouvelle vue), je dois demander AVANT de déplacer du code, pas deviner deux fois de suite.

**2. Le bouton stylisé du sélecteur dans la confirmation, à 28 px.** `BoutonVue` (nouveau, exporté par `SelecteurVues.tsx`) : le bouton du sélecteur utilisable SEUL, avec une hauteur au choix ; le sélecteur l'utilise lui-même (un seul code pour les deux). CSS : `height: var(--hauteur-bouton, clamp(2.6rem, 7vw, 3.5rem))` : sans variable, la hauteur du sélecteur comme avant. Dans `BlocPartage`, la confirmation devient une ligne (`« ✅ … est enregistré dans tes Load-outs. »` + bouton `28px`). Il garde un libellé accessible (« Ouvrir l'onglet Load-outs », en `aria-label` et en infobulle, puisque le titre est dans l'image), n'a pas le rôle d'onglet (c'est un bouton d'action), le même éclaircissement au survol et le contour cyan au clavier.

**Vérifié** : bloc, tiroir et bouton **61 contrôles** dans un navigateur (zone présente dans le tiroir avec ses règles : enregistrement complet et pseudo, champs vidés, nom obligatoire avec infobulle et message, accord avec la fenêtre, Doctrine incomplète, stockage plein, non connecté ; zone ABSENTE de l'onglet, qui commence par la recherche ; listes vides ; bouton stylisé : une image à 28 px EXACTEMENT, largeur au rapport 4316 / 1024, deux images chargées, libellé et infobulle, pas de rôle d'onglet, aligné avec le message sans débordement, survol, clavier, clic vers l'onglet, sélecteur du haut intact) ; onglet 57 contrôles ; les 51 contrôles du tiroir passent toujours.
**Un défaut de mon propre travail, corrigé** : mon script de mise à jour des tests s'est arrêté à mi-chemin sur un repère de texte, sans rien écrire : les premiers échecs vus étaient ceux de l'ancienne version des tests ; j'ai refait la mise à jour avec une recherche de repères tolérante et vérifié que tout était bien appliqué avant de conclure.
**Non testé de bout en bout** : la page réelle (connexion Bungie) et le logiciel installé.

**Retour de l'utilisateur (07/10/2026, PDF renvoyé)** : **les 8 tests de la 0.3.11 sont validés** (relecture automatique du PDF : 8 cases cochées sur 8), archivés mot pour mot (compteur : **79 sections validées**). Le logiciel installé a donc bien été testé : l'image du bouton stylisé s'y affiche, et **28 px est conservé**.

## 07/10/2026 — v0.3.10

**Numéro de version** : 0.3.10 (installateur `Forge-Armory-Setup-0.3.10.exe`, liste `A-TESTER-0.3.10.pdf`, qui reprend celle de la 0.3.9 non encore testée). Le « 10 » est bien supérieur à « 9 » pour le programme d'installation (comparaison par nombres, pas par texte) : l'installation par-dessus la 0.3.9 se fait normalement.

**Demande de l'utilisateur** : « Aligne les deux, oui » (à ma question : la zone d'enregistrement de l'onglet acceptait un nom vide, la fenêtre du Build Analyzer non).

**Le NOM d'un build est obligatoire, partout.** J'ai choisi cette règle plutôt que « nom facultatif partout » parce que c'est déjà celle de la fenêtre « Modifier » et de la fenêtre d'enregistrement, et qu'un build baptisé « Sans nom » se retrouve mal dans une liste qu'on peut maintenant chercher et filtrer ; **dis-le si tu préférais l'inverse**.
- **zone d'enregistrement de l'onglet** (`ZoneEnregistrement`) : « + Enregistrer » est GRISÉ tant que le nom est vide (infobulle « Donnez d'abord un nom au build ») ; le message « Le nom ne peut pas être vide. » et le champ en rouge n'apparaissent qu'APRÈS que l'utilisateur a modifié le champ (on n'affiche pas une erreur à quelqu'un qui n'a encore rien tapé) ; un nom fait d'espaces est refusé de même ;
- **garde de fond dans le stockage** : `enregistrerLoadout` REFUSE un nom vide ou d'espaces (`{ ok: false, erreur: "Le nom ne peut pas être vide." }`, constante `ERREUR_NOM_VIDE`, **même texte** que les fenêtres), sans rien écrire et sans émettre d'événement : plus aucun chemin ne peut créer de build « Sans nom ». `construireLoadout` garde son repli « Sans nom » : il sert aussi à fabriquer EN MÉMOIRE le loadout du bloc de partage (qui a son propre nom par défaut « Mon build »), jamais à enregistrer ;
- **la fenêtre du Build Analyzer n'a pas changé** (elle exigeait déjà un nom) ; le message de la zone et celui de la fenêtre sont **identiques**, vérifié dans le navigateur ;
- **vérifié** : stockage 7 contrôles (nom vide, d'espaces et de tabulations refusés même avec description, icône et auteur ; stockage et événements non touchés ; liste existante inchangée octet pour octet ; nom valide enregistré sans espaces autour ; repli en mémoire ; renommage à nom vide toujours sans effet) ; test du bloc et de la zone **53 contrôles** (49 avant + 4 : bouton grisé et infobulle sans erreur affichée au repos ; espaces seuls refusés avec le message et le champ en rouge ; activation et retour du message ; même message dans la fenêtre ; aucun build « Sans nom » créé) ; le reste de la batterie, y compris les 51 contrôles du tiroir, passe toujours ;
- **un défaut de mon test, trouvé tout de suite** : j'avais lancé les tests sur un paquet de test pas reconstruit (l'ancien composant) : trois échecs trompeurs ; reconstruit, tout passe. Je note la leçon : toujours reconstruire le paquet de test après une modification du code.
- **pas fait, volontairement** : la touche Entrée dans le champ du nom de la zone (la fenêtre l'a, la zone ne l'a jamais eue) : c'est un autre alignement possible, non demandé.
- **non testé de bout en bout** : la page réelle (connexion Bungie) et le logiciel installé.

## 07/10/2026 — v0.3.9

**Numéro de version** : 0.3.9 (installateur `Forge-Armory-Setup-0.3.9.exe`, liste `A-TESTER-0.3.9.pdf`, qui reprend celle de la 0.3.8 non encore testée).

**Demande de l'utilisateur** : « Remets la zone d'enregistrement dans l'onglet 😉 » (le lendemain de son retrait demandé pour la 0.3.8).

**La zone d'enregistrement est de retour dans l'ONGLET « Load-outs », pas dans le tiroir.** J'ai lu « l'onglet » au sens de l'onglet Load-outs (c'est de là que je l'avais retirée) ; **le tiroir reste sans zone**, comme la 0.3.8 ; la question est posée à l'utilisateur dans la liste de tests. Le bloc « Sauvegarde et partage de Build » et sa fenêtre du Build Analyzer **restent**, ce qui fait deux chemins d'enregistrement.
- `components/ZoneEnregistrement.tsx` (nouveau) : l'ancienne zone à l'identique (champ « Nom du build actuel » + « + Enregistrer », palette d'icônes, description, mêmes textes, mêmes styles, code de style récupéré tel quel dans l'archive 0.3.3), utilisant la règle « Doctrine incomplète » PARTAGÉE (`lib/loadouts/doctrineIncomplete.ts`) et signant le build du pseudo de l'auteur. `PanneauLoadouts` retrouve ses propriétés `build` et `auteur`, **facultatives** : la zone n'est affichée qu'en mode « page » et seulement si `build` est fourni ; `DashboardPage` les passe à l'instance de l'onglet, pas à celle du tiroir. Le message de liste vide de l'onglet renvoie à la zone ;
- **comportement d'avant conservé** : un nom VIDE est accepté et donne « Sans nom » (la fenêtre du Build Analyzer exige un nom : **les deux chemins diffèrent donc sur ce point**, signalé dans la liste de tests) ;
- **une seule différence, voulue** : les champs ne sont vidés **que si l'enregistrement a réussi** ; avant, ils l'étaient même en cas d'échec, donc le texte tapé était perdu quand le stockage refusait l'écriture ;
- **vérifié** : zone présente dans l'onglet (champ, bouton, icônes, description) et ABSENTE du tiroir, placée au-dessus de la recherche et de la liste ; enregistrement complet (nom, description, icône, classe et élément figés, pseudo, carte « par … », compteur, message, champs vidés) ; nom vide → « Sans nom » ; aucune confirmation avec une Doctrine complète ; synchronisation avec le tiroir caché ; Doctrine incomplète (même texte, « Annuler » garde le texte, « OK » enregistre) ; stockage plein (message rouge, texte conservé, second clic qui enregistre) ; non connecté sans auteur ; liste vide : **49 contrôles dans le test du bloc et de la zone** (33 avant + 16) ; les 57 de l'onglet (une vérification inversée : la zone y est maintenant présente) et les 51 du tiroir passent.
- **deux défauts de mes tests, corrigés** : un nom de build contenant une apostrophe cassait de nouveau mon sélecteur XPath (déjà rencontré, j'aurais dû m'en souvenir) ; et j'ai écrit un contrôle avec un `True` en dur (« aucune erreur JavaScript ») : il est maintenant réel, et j'ai fait de même pour un second contrôle du test de l'onglet qui s'appuyait sur une `assert` isolée.
- **non testé de bout en bout** : la page réelle (connexion Bungie) et le logiciel installé.

## 07/10/2026 — v0.3.8

**Numéro de version** : 0.3.8 (installateur `Forge-Armory-Setup-0.3.8.exe`, liste `A-TESTER-0.3.8.pdf`, qui reprend celle de la 0.3.7, non encore testée, et ajoute les nouveautés ci-dessous ; la question sur la place de la zone d'enregistrement en est retirée, elle est traitée).

**Demande de l'utilisateur** : (1) un aperçu du bloc « 0. Contexte du build » avec des boutons de **48 px** ; (2) « la zone d'enregistrement du build [...] on peut l'enlever de ce tiroir », la mettre dans le Build Analyzer sous la forme d'un bouton « Enregistrer le build » qui ouvre une pop-up, intégré au bloc « Partage » renommé « **Sauvegarde et partage de Build** ».

**1. Aperçu à 48 px** (aucune modification de l'appli : les boutons du bloc restent à 28 px tant que l'utilisateur n'a pas choisi). Généré avec le vrai composant, en forçant l'échelle à 48/56 : hauteur **mesurée 48 px exactement**, largeur 177,2 px (103,4 px à 28 px), les quatre boutons sur une ligne, « PvE DPS » sélectionné pour montrer l'état sélectionné. Fourni : `apercu-bloc-contexte-48px.png`.

**2. La zone d'enregistrement quitte le panneau des Loadouts, et devient une fenêtre.**
- **retiré de `PanneauLoadouts`** (tiroir ET onglet : c'est le même panneau, je n'ai donc pas pu la laisser dans l'un et l'ôter de l'autre ; **à valider** si l'utilisateur ne la voulait retirée que de l'onglet) : le champ du nom, le bouton « + Enregistrer », la palette d'icônes, la description, les trois états de saisie, la fonction d'enregistrement, ainsi que les propriétés `build` et `auteur`, qui ne servaient qu'à elle (TypeScript les a signalées comme inutilisées : un import et une propriété, retirés) ; le message de liste vide indique le nouveau chemin ;
- **la règle « Doctrine incomplète » est déplacée, inchangée,** dans `lib/loadouts/doctrineIncomplete.ts` (même liste dans le même ordre : Super, Mêlée, Grenade, Compétence de classe, Saut ; même texte, comparé mot pour mot à l'ancien) ;
- **`ModifierLoadout` est généralisée** (au lieu de dupliquer une seconde fenêtre) : `loadout` devient facultatif (absent = création), avec `nomInitial`, `titre`, `introduction`, `libelleValider` et `erreur` ; sans ces propriétés, la fenêtre « Modifier » est **strictement la même** (ses contrôles existants passent toujours) ;
- **nouvelle fenêtre `EnregistrerBuild`** : « Modifier le build » en mode création : mêmes champs, mêmes règles (Échap et « Annuler » ne changent rien, un clic à côté ne ferme pas, Entrée enregistre), même confirmation « Doctrine incomplète », build signé du pseudo (v0.3.3). **Si le stockage refuse l'écriture, l'erreur s'affiche dans la fenêtre, qui reste ouverte avec le nom et la description tapés** (avant, un message dans le panneau) ;
- **`BlocPartage` devient « Sauvegarde et partage de Build »** : le bouton « 💾 Enregistrer le build… » en tête, puis la partie « Partage, sans enregistrer » **inchangée** (nom, copie texte, fichier, JPEG, PNG, PDF) ; le champ « Nom du build » du bloc est proposé comme nom dans la fenêtre ; après l'enregistrement, une confirmation avec un bouton « Ouvrir l'onglet Load-outs » (`onVoirLoadouts`, branché sur la vue Load-outs dans `DashboardPage`). Les loadouts arrivent dans le tiroir et l'onglet par l'événement du stockage de la 0.3.5 ;
- **deux différences de comportement par rapport à l'ancienne zone, à connaître** : le **nom est maintenant obligatoire** (l'ancienne zone acceptait un nom vide et enregistrait « Sans nom ») ; et le bloc est **sous l'Artefact**, à la place de l'ancien bloc de partage, pas juste sous « Mon Build » : question posée à l'utilisateur dans la liste de tests ;
- **vérifié** : règle « Doctrine incomplète » 8 contrôles ; **nouveau bloc et sa fenêtre 33 contrôles** dans un navigateur (titre et bouton, partage conservé, repliable, fenêtre et ses validations, annulation, Échap, clic à côté, nom proposé, enregistrement complet avec description, icône, classe et élément figés et pseudo, confirmation, absence de demande de confirmation avec une Doctrine complète, builds existants strictement inchangés, synchronisation avec le tiroir, bouton « Ouvrir l'onglet », Entrée, Doctrine incomplète avec « Annuler » puis « OK », stockage plein avec erreur dans la fenêtre puis réessai sans rien retaper, non connecté, absence de l'ancienne zone dans le tiroir et dans l'onglet, listes vides) ; **les 15 contrôles de l'auteur et les 57 de l'onglet ont été adaptés** pour enregistrer par la nouvelle fenêtre (même nombre, mêmes vérifications ; la synchronisation avec le tiroir se vérifie maintenant dans l'autre sens : une modification faite dans l'onglet est déjà à jour dans le tiroir) ; **les 51 contrôles du tiroir passent toujours** (ils ne dépendaient pas de l'ancienne zone) ;
- **non testé de bout en bout** : la page réelle (connexion Bungie) : le banc d'essai reproduit son agencement avec le vrai bloc, mais n'est pas `DashboardPage` ; le logiciel installé ; et l'ordre des blocs dans la vraie page (je n'ai pas déplacé le bloc).

## 07/10/2026 — v0.3.7

**Numéro de version** : 0.3.7 (installateur `Forge-Armory-Setup-0.3.7.exe`, liste `A-TESTER-0.3.7.pdf`, qui ne contient que les nouveautés).

**Retour de l'utilisateur sur la 0.3.6** : **tous les tests validés (24 sur 24)**, archivés mot pour mot (compteur : 71 sections validées ; sans PDF renvoyé cette fois, d'après son message), y compris la disposition du libellé « Contexte du build : » et le retour automatique au Build Analyzer après « Charger » (« top »), et les deux tests « au fil de l'eau » ouverts depuis longtemps. **Trois demandes** : (1) réduire les boutons de contexte de 50 % dans le bloc « 0. Contexte du build » et de 20 % au-dessus de « Mon Build » ; (2) après « Charger », amener le bloc « Mon Build » à l'écran, « ça évitera de croire à un bug » ; (3) passer à la phase 2 de l'onglet Load-outs.

**1. Boutons de contexte plus petits.** `PastilleContexte` reçoit une propriété `echelle` (1 = taille du sélecteur) ; les deux valeurs sont définies une seule fois (`ECHELLE_CONTEXTE_RANGEE = 0.8`, `ECHELLE_CONTEXTE_BLOC = 0.5`) et lues par l'appli ET par les tests. En CSS : `height: calc(clamp(2.6rem, 7vw, 3.5rem) * var(--echelle-bouton, 1))` ; la largeur suit le rapport 3781 / 1024. Mesuré : 44,8 px (80 % de 56) au-dessus de « Mon Build », 28 px (50 %) dans le bloc, mêmes proportions, taille et position inchangées au clic. À 560 px de large, le bloc tombe à 20,8 px (50 % du minimum de 41,6 px). **Deux questions inscrites dans la liste de tests** : le titre à 50 % est-il assez lisible ? et le libellé « Contexte du build : » peut maintenant tenir devant les boutons de la rangée (80 % : ≈ 800 px au total pour ≈ 910 disponibles) : je l'ai laissé sur sa propre ligne, comme l'utilisateur l'a validé, sans le changer de moi-même.

**2. Après « Charger », « Mon Build » est amené à l'écran** (`lib/defilerVers.ts`, `DashboardPage`). `onApresCharger` ramène au Build Analyzer ET incrémente un compteur qui déclenche, après l'affichage de la vue, un `scrollIntoView` du bloc « Mon Build » (nouvelle enveloppe sans style `#bloc-mon-build` autour de `ResumeBuild`, marge de défilement de 0,5 rem). Défilement doux, immédiat si le système demande de réduire les animations. Le compteur fait défiler même pour un second chargement du même build. **Ne défile PAS** quand on revient au Build Analyzer par le bouton du sélecteur, ni pour « Charger » depuis le tiroir (comportement d'avant, vérifié).

**3. Onglet « Load-outs », livraison 2 sur 3 : recherche et filtres** (`lib/loadouts/recherche.ts`, `components/BarreRechercheLoadouts.tsx`, `PanneauLoadouts`). Dans l'onglet seulement (le tiroir est inchangé) : un champ de recherche et trois listes (classe, élément, contexte), un compteur « n sur N », « ✕ Réinitialiser » dès qu'un critère est actif, un message quand rien ne correspond. **Aucun champ ajouté aux données** : classe, élément et contexte étaient déjà enregistrés.
- **recherche** : texte coupé en mots, TOUS doivent être présents (ET), dans n'importe quel ordre ; insensible à la casse, aux accents, aux apostrophes typographiques, aux espaces insécables et à la ligature « œ » (la même `normaliserRecherche` que la Recherche du Manifest). Champs indexés, séparés par « | » (un mot ne peut donc pas chevaucher deux champs) : nom du loadout, description, auteur, classe, élément (libellé français ET identifiant interne), contexte, noms des armes et des armures, artefact (nom français et anglais) et ses perks choisis, et noms de la Doctrine ;
- **Doctrine** : enregistrée sous forme de NUMÉROS, donc cherchable seulement **Manifest chargé** (résolution par `obtenirNomPerkDoctrine`, chaque numéro résolu une seule fois) ; sans Manifest, une ligne grise le dit et le reste est déjà couvert ;
- **filtres** : valeurs PRÉSENTES seulement, avec leur nombre (« Chasseur (4) »), dans l'ordre du jeu (Titan, Chasseur, Arcaniste ; éléments ; contextes de l'appli), libellés de l'appli (« Cryo-électrique » pour arc) ; une valeur déjà choisie reste proposée même à zéro ; un build sans contexte compte comme « neutre » ; un ancien build sans classe ni élément figés est filtré d'après son build ; l'ordre d'origine (par date) est conservé ;
- **index recalculé quand la liste ou le Manifest change, pas à chaque frappe** (`useMemo`) ; mesuré sur 1 000 loadouts : l'index prend 17 ms, une fois, et chaque filtrage (donc chaque frappe) 0,4 ms ;
- « ⬇ Exporter tout » exporte TOUS les loadouts même avec une recherche active (vérifié en lisant le fichier exporté : 10 sur 10 avec 4 cartes affichées).
- **un défaut de conception trouvé par mon propre test et corrigé** : j'indexais aussi le nom INTERNE du build (`build.nom`), qui n'apparaît nulle part sur la carte : « arcaniste » et « abyssal » renvoyaient les cinq loadouts de test (le build de démonstration porte ces mots dans son nom interne), et une carte aurait pu sortir pour un texte invisible, ce qui ressemble à un bug. Retiré de l'index, avec un test dédié ;
- **vérifié** : logique **38 contrôles** (aucun critère, espaces seuls, chaque champ, casse, accents, auteur avec « # », armes, armures, artefact et perks, classe et élément et contexte par le texte, ET entre mots dans les deux ordres, un mot absent exclut, pas de chevauchement entre champs, apostrophes et ligature, filtres seuls et combinés, valeur inconnue, ordre conservé, ancien build, Doctrine avec et sans Manifest, doublons, mise en cache, valeurs des filtres et leur ordre, valeur choisie conservée à zéro, performance) ; **onglet dans un navigateur, 57 contrôles au total** (les 23 d'avant, 6 sur le défilement vers « Mon Build » et 28 sur la recherche et les filtres sur dix loadouts variés : absence dans le tiroir, compteurs, listes avec leurs nombres exacts, recherches par nom, description, auteur, arme, armure, accents, apostrophe, ligature, deux mots, filtres combinés, réinitialisation, message sans résultat, mise à jour après suppression, export complet) ; boutons de contexte à 80 % et 50 % (34 + 8 contrôles) ; **les 51 contrôles existants du tiroir passent toujours** ;
- **non testé de bout en bout** : la page réelle (connexion Bungie) : le banc d'essai reproduit l'agencement et la logique de défilement, mais n'est pas `DashboardPage` ; la recherche de la Doctrine avec un VRAI Manifest (testée avec un résolveur simulé) ; le logiciel installé.

**4. Quatre défauts de mes tests, corrigés** : un contrôle écrit avec un `True` en dur (« le bouton Réinitialiser apparaît avec un critère ») ne vérifiait rien : il est maintenant réel ; « ami » est une sous-chaîne de « roaming », donc mon test d'un résultat vide était faux (la recherche, elle, avait raison) ; ma mesure de position ne tenait pas compte du défilement, devenu nécessaire dans la page de test allongée ; le test du bloc de contexte devait lire la nouvelle hauteur.

## 07/10/2026 — v0.3.6

**Numéro de version** : 0.3.6 (installateur `Forge-Armory-Setup-0.3.6.exe`, liste `A-TESTER-0.3.6.pdf`, qui reprend celle de la 0.3.5, non encore testée, en remplaçant la section du contexte du build).

**Demande de l'utilisateur** : « Pour les boutons de contexte », avec l'archive `forge-armory-boutons-profils.zip` (les visuels que l'archive du sélecteur ne contenait pas).

**Boutons du contexte du build : les visuels fournis remplacent ma proposition CSS de la 0.3.5.** `components/PastilleContexte.tsx` est réécrit sur le même principe que `SelecteurVues` : un SVG par bouton et par état (huit fichiers dans `public/boutons-profils/` ; l'archive complète, avec les icônes seules, les symboles vectorisés, les PNG et les planches de contrôle, dans `ressources-installateur/forge-armory/boutons-profils/`), logo + cadre + titre en un seul dessin (titre en tracés, aucune police), les deux états superposés avec bascule d'opacité (pas de scintillement), lueur dans le cadre donc **taille inchangée au clic** (vérifié). Couleurs d'après la notice : Neutre argent, PvE Roaming vert, PvE DPS or, PvP rouge. **Même hauteur que les boutons du sélecteur** (même cercle, comme le demande la notice : vérifié, 56 px des deux côtés) ; la plaque est un peu plus courte (rapport 3781 / 1024 contre 4316 / 1024, vérifié). Les fichiers suivent les valeurs de `ContexteBuild` (`neutre`, `roaming`, `dps`, `pvp`). Mêmes classes CSS que le sélecteur (`.bouton-vue`), avec un modificateur `.bouton-vue--profil` pour le rapport largeur/hauteur ; **ma proposition `.pastille-forge` est entièrement retirée** de la feuille de style. Le libellé reste accessible (`aria-label`, infobulle) puisque le titre est dans l'image ; `aria-pressed` conservé. Toujours **partagé** par la rangée sous le nom du build et par `BlocContexte`. `BadgeContexte` (icône PNG) n'est plus utilisé par ces boutons mais reste utilisé par les cartes de loadouts et comme source des libellés.
- **un défaut de disposition trouvé par mes mesures et corrigé** : avec le libellé « Contexte du build : » devant, la rangée sous le nom du build ne pouvait pas tenir (libellé + 4 × 207 px dépassent ~910 px) : le quatrième bouton passait seul à la ligne suivante. Le libellé occupe maintenant sa propre ligne (`flex: 0 0 100%`) ; **choix à valider par l'utilisateur** (inscrit dans la liste de tests) ;
- dans `BlocContexte` (carte de la page, un peu plus étroite à cause de ses marges), les quatre boutons tiennent sur une ligne : mesuré avec le VRAI composant, à 1000 px, sans déborder du cadre de la carte ;
- **vérifié** : quatre boutons dans l'ordre, huit images chargées avec les noms de l'archive, même taille pour les quatre, rapport du cadre, même hauteur que le sélecteur, plaque plus courte, états (image sélectionnée ou au repos), taille et position identiques avant et après un clic, clavier (contour cyan, Entrée, Espace), survol, une seule ligne, fenêtre étroite (420 px) : 34 contrôles au total dans le test commun du sélecteur et du contexte ; 6 contrôles du vrai bloc « 0. Contexte du build » (ordre, une seule ligne dans la carte, changement de contexte et du tableau de pondération, fenêtre étroite) ;
- **non testé de bout en bout** : la page réelle (connexion Bungie) ; le logiciel installé (un test de la liste vérifie que les huit dessins s'y affichent).

**Un défaut de mon test, corrigé** : le test du sélecteur comptait aussi les boutons de contexte, qui partagent la classe `.bouton-vue` : ses mesures sont maintenant restreintes aux boutons du sélecteur.

## 06/10/2026 — v0.3.5

**Numéro de version** : 0.3.5 (installateur `Forge-Armory-Setup-0.3.5.exe`, liste `A-TESTER-0.3.5.pdf`, qui reprend les tests de la 0.3.4 restés à faire, sauf « Tueur de souhaits », clos).

**Demande de l'utilisateur (soir du 06/10/2026)** : « On fait ça [l'onglet Load-out, livraison 1] ; profites-en pour changer les boutons (sélecteur Build Analyzer, Load-outs, Bibliothèque, et le contexte du build) », avec l'archive `forge-armory-boutons-final.zip`.

**1. Nouveaux boutons du sélecteur de vues** (`components/SelecteurVues.tsx`, styles dans `index.css`). Les six SVG fournis (trois boutons × deux états : au repos, sélectionné à lueur ; logo + cadre + titre en un seul dessin, titre en tracés donc sans police) sont dans `public/boutons/` ; l'archive complète (visuels, icônes seules, PNG, planche de contrôle, notice) est conservée dans `ressources-installateur/forge-armory/boutons-selecteur/`. Respect des règles d'intégration de l'archive : même hauteur pour les trois (la largeur suit, rapport 4316/1024 vérifié), logo + cadre + titre jamais séparés, la lueur reste dans le cadre donc **la taille ne change pas au clic** (vérifié : positions et tailles identiques avant et après). Les deux états sont superposés et on bascule leur opacité : pas de scintillement, les deux images sont déjà chargées. Chemins par `import.meta.env.BASE_URL` (un chemin absolu avait déjà cassé les badges de contexte dans le logiciel installé). **Ajouts de ma part, hors de l'archive** : un éclaircissement léger au survol d'un bouton non sélectionné, et un contour cyan de focus pour le clavier (accessibilité) ; rôle `tablist` / `tab` conservé. Ordre demandé : Build Analyzer, Load-outs, Bibliothèque.

**2. Boutons du contexte du build : UNE PROPOSITION DE MA PART, faute de visuel.** L'archive ne contenait aucun visuel pour le contexte (Neutre, PvE Roaming, PvE DPS, PvP). `components/PastilleContexte.tsx` les dessine en CSS dans le même langage visuel : plaque en dégradé sombre, filet clair, coins coupés à droite, titre en capitales espacées en empattement, icône de contexte conservée, lueur cyan (un `drop-shadow` du bouton, car une ombre sur un élément découpé par `clip-path` serait coupée) quand il est sélectionné. Composant **partagé** par les deux endroits où l'on choisit le contexte (rangée sous le nom du build dans `DashboardPage`, et `BlocContexte`) : le style n'est plus dupliqué. À valider par l'utilisateur, ou à remplacer par son visuel.

**3. Onglet « Load-outs », livraison 1 sur 3** (TODO § 16). Un troisième bouton ouvre la vue Load-outs : le **même** `PanneauLoadouts` que le tiroir, en mode `page` (nouvelle propriété `mode`, défaut `tiroir` : comportement d'avant), dans le flux de la page sur toute la largeur, cartes en grille (`repeat(auto-fill, minmax(280px, 1fr))`, une colonne en fenêtre étroite). Aucun code d'action dupliqué : Charger, Voir, Équiper en jeu, Modifier..., Supprimer, Exporter..., « Exporter tout », « Importer », enregistrement du build actuel et fenêtres associées sont ceux du tiroir ; l'auteur s'y affiche. En-tête « 🗂️ Loadouts (N) », sans bouton de fermeture.
- **choix de conception, à valider** : « Charger » ramène au Build Analyzer (`onApresCharger`), pour montrer le build chargé ;
- **piège évité** : la vue Build Analyzer est masquée (pas démontrée) quand une autre vue est affichée, **tiroir compris** : il restait donc monté avec une liste périmée après une modification faite dans l'onglet. Le stockage émet maintenant un événement `d2ba:loadouts-modifies` à chaque écriture RÉUSSIE (jamais en cas d'échec, et son propre échec n'empêche jamais l'enregistrement) ; chaque instance du panneau recharge sa liste. Vérifié dans les deux sens ;
- **vérifié** : notification du stockage 9 contrôles (enregistrer, renommer, décrire, changer l'icône, importer, supprimer ; rien à la lecture ni à l'export ; stockage plein : erreur renvoyée et aucun événement ; événement en échec : enregistrement réussi ; sans `window`) ; **onglet dans un navigateur, avec un banc d'essai qui reproduit l'agencement de la page, 23 contrôles** (pleine page, tiroir caché, grille à 1000 px et une colonne à 420 px, toutes les actions, enregistrement avec ton pseudo, synchronisation avec le tiroir dans les deux sens, « Charger » + retour au Build Analyzer, Voir, Modifier, Exporter, Supprimer, Importer avec auteur conservé) ; sélecteur et boutons de contexte **25 contrôles** (ordre, tailles identiques, rapport du cadre, les 6 images chargées, états, taille inchangée au clic, clavier, survol, fenêtre étroite, capitales, icônes) ; **les 51 contrôles existants du tiroir passent toujours**.
- **non testé de bout en bout** : `DashboardPage` complet (il exige la connexion Bungie) : son agencement est reproduit fidèlement par le banc d'essai, mais ce n'est pas la page réelle ; « Équiper en jeu » depuis l'onglet (même code que le tiroir, déjà validé, mais pas rejoué ici).

**4. Deux défauts de mes tests, corrigés** : `inner_text` renvoyait les libellés déjà passés en capitales par le style (comparaison refaite sur le contenu réel) ; un nom de build avec apostrophe cassait mon sélecteur XPath (noms de test sans apostrophe).

## 06/10/2026 — v0.3.4

**Numéro de version** : 0.3.4 (une version par livraison ; installateur `Forge-Armory-Setup-0.3.4.exe`, liste de tests `A-TESTER-0.3.4.pdf`).

**Retour de l'utilisateur sur la 0.3.3** : **19 tests validés sur 23**, archivés mot pour mot (compteur : 64 sections validées) : installation et `run dev` (tout y apparaît désormais) ; auteur du build (5 tests) ; logo de fond (4) ; mode diagnostic (3) ; Doctrine en `run dev` ; icônes de perks et panneau de départage (3) ; « coeur de flamme ». Restent : « Tueur de souhaits », le menu « Objets factices » et les deux tests « au fil de l'eau ».

**1. Les 19 icônes de perks tranchées par l'utilisateur sont figées : les 147 perks d'artefact ont leur icône.** L'utilisateur a comparé avec le jeu et choisi une icône pour chacun des 19 perks (13 ambigus et 6 à nom différent ; 19 sur 19, aucun « aucune ne correspond », aucun « je ne sais pas ») ; son fichier est conservé dans `knowledge-base/sources-externes/choix-icones-ambigues_2026-10-06.json`. `data/iconesPerksArtefact.ts` : 128 trouvées directement + 19 choisies = 147 ; les noms de nos données ne sont toujours pas modifiés. Lecture de ses choix : le même perk ambigu garde la même icône d'un artefact à l'autre, SAUF « Broyeur de bouclier », dont l'icône est différente entre l'Outillage de Curiosité et le Journal du Chasseur (cohérent avec le groupement des objets d'artefact par blocs de hash consécutifs, hypothèse notée en 0.3.2).
- ⚠️ **DISCORDANCE NON EXPLIQUÉE** : pour les 6 perks à nom différent, les icônes choisies le soir sont **exactement les mêmes** (chemin pour chemin, vérifié par comparaison) que celles enregistrées en 0.3.1, que l'utilisateur avait jugées fausses le matin. Ses choix du soir font foi (comparaison en jeu, icônes de 56 px) ; j'ai consigné la discordance dans l'en-tête du fichier de données, la TODO et la liste de tests, qui lui demande de les recomparer dans l'appli. Ce que je n'ai pas : une explication.
- le contrôle des icônes (`casAmbigus(rapport, enregistrees)`) **ne repropose plus un perk déjà tranché** (son icône enregistrée figure toujours parmi ses candidates) ; il revient si cette icône n'est plus parmi les candidates (après une mise à jour du jeu) ou si le perk n'en a pas. Le panneau affiche « ✅ 19 perks déjà tranchés » ; le texte du bouton explique que le contrôle sert à vérifier après une mise à jour du jeu ;
- vérifié : données 15 contrôles (147 icônes ; chaque perk exactement une fois ; les 128 directes et les 125 du 05/10 inchangées ; les 19 choisies identiques au fichier de l'utilisateur ; la discordance elle-même ; cohérence entre artefacts ; noms de perks inchangés) ; logique du départage 33 (dont 6 sur le filtrage) ; bouton dans un navigateur 11, dans deux scénarios (faux Manifest quelconque ; faux Manifest fidèle à ton cas : 13 ambiguës et 6 introuvables, tout déjà tranché : aucun panneau, mention « 19 perks déjà tranchés »).

**2. « Tueur de souhaits » : une contradiction que je ne sais pas résoudre.** La capture de l'utilisateur (0.3.3, conservée) montre la vraie arme (objet 814876684 : type 3, sous-type 31, seau cinétique, « Arc de combat », exotique) **dans les résultats**, avec son icône d'arc, son anti-champion, sa source et « + Ajouter au build », ainsi que neuf résultats masqués (quête, pack, deux objets factices, deux triomphes, trois ornements). L'utilisateur écrit pourtant qu'elle « n'apparaît toujours pas » (elle est bien dans son inventaire). Je ne peux pas dire ce qui l'a fait apparaître depuis la 0.3.1 (masquage des factices, recherche tolérante ou index `v3`), ni où elle manque pour lui : **question posée**, aucun code modifié sur ce point. Rien n'est supposé résolu.

**Suite, après la livraison (06/10/2026, soir)** : (1) **« Tueur de souhaits » : clos.** L'utilisateur confirme qu'il avait mal lu sa capture : la vraie arme apparaissait bien. Aucun code n'était à corriger ; les ajouts faits pour ce point (liste des masqués, recherche tolérante, index `v3`) ne sont pas démontrés nécessaires, mais restent utiles en eux-mêmes. (2) **Discordance des 6 icônes** : « je ne sais pas, c'était peut-être la fatigue » ; une erreur de comparaison du matin est probable, non prouvée ; le test de la 0.3.4 reste là pour la confirmer. Modifications de documentation seulement (TODO § 17 et § 19) ; la liste `A-TESTER-0.3.4.pdf` n'a PAS été changée, pour que le PDF coché reste lisible : le test « Tueur de souhaits » y figure encore et sera retiré à la prochaine liste.

**3. Un défaut de mon test, corrigé** : le nouveau texte d'introduction du bouton contient « trouvées directement » ; mon test attendait le mot « trouvées » pour détecter la fin de la recherche et se déclenchait donc avant elle. L'attente porte maintenant sur le bilan lui-même.

## 06/10/2026 — v0.3.3

**Nettoyage de la TODO** (demandé par l'utilisateur le 06/10/2026, après un point d'ensemble ; changement de documentation seulement, aucun code touché). Retiré, condensé ou corrigé dans `TODO.md` : l'ordre de marche du 30/09 (dépassé : remplacé par des « Prochaines étapes » à jour, dont l'ordre entre Load-out et modification des perks et mods est dit **non fixé**) ; les sections 1 (Electron) et 12 (renommage), qui disaient « en test » alors que l'utilisateur les a validées (tests du 02/10 pour Electron, tests du logiciel installé le 06/10 pour le renommage) ; l'amorce de la section 2 (« prévu après Electron ») ; le premier point de la section 13 ter et le premier paragraphe de la section 19 (validés dans l'appli installée) ; la section 21 (police abandonnée) réduite à la décision ; le nom du PDF de tests (`A-TESTER-<version>.pdf`) ; et un point d'« abandon » devenu faux dans « Pistes abandonnées » (icônes des perks d'artefact : l'extraction par la table reste abandonnée, mais l'objectif a été repris par les icônes du Manifest, section 17). **Gardés en règles permanentes** : la liste des identifiants à ne JAMAIS renommer et le mécanisme du dossier de données. Les huit passages retirés sont recopiés **mot pour mot** (extraits automatiquement) dans `documentation/todo/ARCHIVE-TODO-2026-10-06.md`. Vérifié : 24 sections sur 34 identiques à l'octet près, 9 modifiées (toutes voulues), aucune section perdue, aucun passage archivé resté dans la TODO. Un défaut de mise en forme de ma première passe corrigé (un séparateur « --- » perdu avant la section Bloquant) ; à vérifier : une « ligne vide en trop » que j'avais crue voir en fin de section 12 n'existait pas, c'était une illusion de mon affichage.

**Numéro de version** : 0.3.3 (une version par livraison ; la 0.3.2 n'avait pas encore été testée par l'utilisateur, la liste de tests `A-TESTER-0.3.3.pdf` reprend donc ses tests encore à faire et ajoute ceux de l'auteur). `package.json` : 0.3.3, installateur `Forge-Armory-Setup-0.3.3.exe`. Aucun test n'a été validé depuis la 0.3.2 : rien de nouveau à archiver.

**Auteur du build** (demande de l'utilisateur : « quand un build est sauvegardé, ajouter le pseudo de l'auteur, celui affiché lors de la connexion à Bungie »).
- **donnée** : champ FACULTATIF `auteur` sur un loadout (`lib/loadouts/stockage.ts`), figé à l'enregistrement comme la classe et l'élément. Valeur : le nom affiché dans le bloc Connexion (`pseudo#1234`, avec repli sur le nom de plateforme comme le bloc lui-même), seulement si l'on est connecté. **Aucune migration, aucun risque pour les builds existants** : un build ancien n'a pas de champ `auteur`, il est lu et réécrit tel quel (vérifié : octet pour octet) ; aucun auteur n'est attribué rétroactivement ;
- **nettoyage** (`nettoyerAuteur`, aussi à l'import) : du texte seulement, caractères de contrôle remplacés, espaces réduits, 64 caractères au plus ; tout autre type (nombre, objet…) devient « pas d'auteur » ;
- **voyage avec le build** : le fichier d'échange et « Exporter tout » contiennent le pseudo ; à l'**import**, le pseudo du fichier est CONSERVÉ (le build d'un ami garde le sien, il n'est jamais remplacé par celui de l'utilisateur) mais nettoyé ; « Modifier... » (renommer, décrire, icône) le conserve ;
- **affichage** : carte du loadout (« par … » en petit sous le nom, avec infobulle), fenêtre « Voir » (dans la ligne grise d'en-tête, entre le contexte et la date), copie texte (ligne « Auteur : … » après le contexte), exports image et PDF (dernier segment du sous-titre de l'en-tête), et bloc « Partage du build » (le build en cours est signé de l'utilisateur) ;
- **exports : deux défauts trouvés par mes propres mesures et corrigés** : (1) le sous-titre de l'export est en MAJUSCULES, ce qui aurait affiché « ORYNICK#1234 » : le pseudo a maintenant sa propre étiquette qui rétablit la casse ; (2) un pseudo très long débordait et repoussait le bloc « FICHE DE BUILD » : le bloc de gauche peut maintenant rétrécir et le pseudo passe à la ligne. Un pseudo normal (« Orynick#1234 ») ne change pas la hauteur de l'en-tête ; un pseudo de 37 caractères, la longueur maximale d'un nom Bungie avec son code, ajoute une ligne ; le PDF mesure la hauteur réelle (garantie « une page » inchangée) ;
- **fiches SANS auteur strictement inchangées** : la page d'export complète d'une fiche sans auteur est **identique au pixel près** à celle d'avant les changements de style (capture de référence prise avant) ; la copie texte sans auteur est identique ; le reste du HTML d'une fiche avec auteur est identique à celui sans auteur (seul l'en-tête change) ;
- **vérifié** : logique 32 contrôles (nettoyage, enregistrement, ancien build lu sans modification, renommage et description et icône, fichier d'échange, import du build d'un ami, import d'un fichier ancien, import hostile : mauvais types, 5 000 caractères, code HTML, fiche, copie texte, HTML échappé) ; panneau des loadouts dans un navigateur 15 contrôles (non connecté : pas d'auteur et champ non écrit ; connecté : « par Orynick#1234 » sur la carte, dans le stockage et dans « Voir » ; le build d'un ami garde « Ami#0042 » ; l'ancien build n'en reçoit pas ; renommer conserve l'auteur ; espaces superflus retirés) ; mesure de l'en-tête de l'export 5 contrôles ; les 51 contrôles existants du panneau des loadouts passent toujours. **Non testé de bout en bout** : l'écran complet connecté à Bungie (le pseudo vient du bloc Connexion, branché par la page), et le bloc « Partage du build » dans un navigateur (sa logique l'est : `construireLoadout`).
- **limite assumée** : un pseudo Bungie peut changer ; l'auteur est celui du MOMENT de l'enregistrement.

## 06/10/2026 — v0.3.2

**Numéro de version** : la 0.3.1 ayant été testée, ces corrections font la **0.3.2** (une version par livraison après un tour de tests) ; le PDF de tests s'appelle `A-TESTER-0.3.2.pdf` (règle de l'utilisateur du 06/10). `package.json` : 0.3.2, installateur `Forge-Armory-Setup-0.3.2.exe`.

**Retour de l'utilisateur sur la 0.3.1** (PDF coché, capture, constats) : **6 tests validés sur 14**, archivés mot pour mot (compteur : 58 sections validées) : build et installateur ; Lapin de Jade / Dualité / Lance de Polaris en Recherche ; la seconde Lance de Polaris ; les six boutons de la Doctrine sur une ligne **dans l'appli installée** ; redimensionnement. Restent : « Tueur de souhaits », le menu « Objets factices », la ligne `[dev]`, les icônes, le panneau de départage, deux tests « au fil de l'eau ».

**1. Pourquoi le `run dev` ne montrait rien de la 0.3.1 : CAUSE NON ÉTABLIE.** En `run dev`, l'utilisateur ne voyait ni la catégorie « Objets factices », ni la ligne `[dev]`, ni le panneau de départage, et la ligne d'éléments de la Doctrine restait sur deux lignes, alors que l'appli installée (même archive 0.3.1) avait la catégorie. ⚠️ **Mon explication de la première réponse était FAUSSE** : j'avais affirmé que son `run dev` exécutait l'ancienne version, en m'appuyant sur un rapport de 00 h 22 portant « v0.3.0 ». Cette preuve ne tenait pas : ce rapport date d'AVANT l'existence de la 0.3.1. L'utilisateur a vérifié (06/10) que son `run dev` était bien en 0.3.1. Hypothèses NON vérifiées : cache du navigateur ou du serveur de développement (dossier `node_modules\.vite`), fichiers partiellement remplacés à l'extraction de l'archive. À reproduire avec la 0.3.2 (voir l'étape « run dev » de la liste de tests, qui indique quoi essayer). Réponse déjà apportée : le **mode diagnostic** ci-dessous rend ces outils disponibles dans l'appli installée, sans dépendre de `run dev`.

**2. Mode diagnostic activable dans l'appli installée** (`lib/modeDiagnostic.ts`, `components/InterrupteurModeDiagnostic.tsx`) : un lien discret en pied de page active, avec mémorisation (`localStorage`, clé `d2ba.modeDiagnostic`), les outils de diagnostic ACTIFS : contrôle des icônes d'artefact, contrôle des exotiques, ligne `[dev]` de la Recherche, mesure de la ligne d'éléments de la Doctrine. En `run dev` il est toujours actif. Les autres outils archivés restent réservés à `run dev`. Vérifié : logique 6 contrôles (inactif par défaut, activer, désactiver efface la valeur, valeur inattendue = inactif, stockage indisponible sans erreur) ; composant dans un navigateur avec une vraie origine http, 14 contrôles avec la liste des masqués (mémorisé après rechargement, un second onglet suit tout seul).

**3. Les 6 icônes « par nom proche » étaient FAUSSES en jeu** (constat de l'utilisateur) : retirées de `data/iconesPerksArtefact.ts` (**128 perks sur 147** ont leur icône), avec la raison consignée dans le fichier. Cause : le Manifest connaît souvent PLUSIEURS versions d'un même perk (saisons et icônes différentes) ; `suggerer` ne gardait que la première version trouvée. Les appariements français ↔ anglais confirment que ces noms proches désignent bien les bons perks (« Pack Tactics » / « Tactique de meute », « Sustained Fire » / « Tirs soutenu », « Hail the Storm » / « Appel tempête »…) : c'est la VERSION qui était mauvaise.
- l'outil garde maintenant **toutes les versions** (`Suggestion.candidats`, `nomsArtefact` en listes) et les liste dans le rapport ;
- `casAmbigus` couvre deux types de cas : « ambigu » (13) et **« nom-different »** (6 : le nom n'existe pas dans le Manifest, mais un nom très proche existe : icônes de TOUTES ses versions, au plus 2 fautes de frappe, égalités toutes proposées) ;
- le panneau (`DepartagerIconesAmbigues`) devient « 🔎 Départager les 19 icônes à vérifier en jeu » : nom du Manifest sous chaque icône des cas « nom différent », **option « Aucune ne correspond »** (distincte de « Je ne sais pas » : dans le JSON `aucune_ne_correspond`), un seul état par perk, compteur ; correction d'un défaut d'affichage (le texte sélectionné de « Aucune ne correspond » était illisible) ;
- vérifié : données 12 contrôles (128 icônes ; les 19 perks sans icône sont EXACTEMENT les 13 ambigus et les 6 retirés ; les 125 de la veille inchangées), outil 34, logique du départage 27 (sur les 19 vrais cas du rapport, avec des versions multiples ajoutées à 3 des 6), panneau dans un navigateur 19, bouton intégré 6. **Les noms de perks de nos données ne sont JAMAIS modifiés** (la clé d'un perk de build enregistré en dépend).

**4. Recherche : « Tueur de souhaits », la vraie arme absente, CAUSE NON ÉTABLIE.** Le code lit correctement : les objets factices sont masqués (validé pour Lapin de Jade, Dualité, Polaris), et la vraie arme (hash 814876684, présente dans le Manifest et dans l'inventaire de l'utilisateur) devrait gagner contre n'importe quel « Colis ». Elle n'arrive donc même pas jusqu'au dédoublonnage. Deux changements pour trouver ou corriger la cause :
- **les résultats masqués sont listés** (`ListeResultatsMasques` ; `rechercherDansManifest` et `rechercherBilingue` reçoivent `avecMasques`, champ `masque` ; les masqués sont dédoublonnés À PART, un doublon masqué ne prend jamais la place d'un résultat affiché) : « 🙈 N résultats masqués par défaut », avec la catégorie et, en mode diagnostic, le numéro de chaque objet. Si la vraie arme est classée à tort dans une catégorie masquée, elle y apparaîtra ;
- **recherche tolérante aux variantes typographiques** (`normaliserRecherche`, dédiée : `normaliser`, dont dépendent des règles validées de la Doctrine, reste inchangée) : espaces insécables, apostrophes typographiques, ligatures « œ » et « æ ». **Hypothèse non prouvée** pour la vraie arme. Index persisté `v2` → `v3` : reconstruit une fois au prochain chargement du Manifest ;
- vérifié avec la vraie fonction de recherche : 34 contrôles (dont : un nom à espace insécable est retrouvé, « l'aube » retrouve « L’aube », « coeur » retrouve « Cœur », une arme classée à tort « quête » apparaît dans les masqués) ; l'interface de la liste des masqués dans un navigateur (singulier / pluriel, fermée par défaut, 30 lignes maximum). **Non testé de bout en bout** : le composant `RechercheManifest` complet (il exige le vrai Manifest).

**5. Logo de l'application en arrière-plan** (demande de l'utilisateur : « le logo de l'application, sans le titre et sous-titre, en arrière-plan ; fixe par rapport au contenu de la fenêtre »). `components/FondLogo.tsx`, monté dans `App.tsx` : l'emblème vectoriel seul (celui du filigrane de la fenêtre « Voir »), `position: fixed`, `z-index: -1`, `pointer-events: none`, centré, 72 % de la plus petite dimension de la fenêtre (plafonné à 820 px), opacité 10 %. `.pilier-carte` devient translucide (`rgba(22, 25, 34, 0.86)`) pour le laisser transparaître ; les tiroirs, menus et fenêtres modales (opaques) ne changent pas. Réservé à l'écran : les exports fabriquent leur propre page. Vérifié dans un navigateur avec la vraie feuille de style : 40 contrôles à 4 tailles de fenêtre (fixe pendant le défilement de 900 px, centré, dans la fenêtre, derrière le contenu et sans capter de clic, un bouton reste cliquable, aucun texte dans le logo, aucune barre de défilement, hauteur de page identique avec et sans logo, visible à travers les cartes, rendu identique à 1 niveau près loin du logo). **L'opacité (10 %) est un réglage à juger par l'utilisateur.**

**6. Mes erreurs, corrigées avant livraison** : (a) une condition de mon test du panneau finissait par `or j['forgeArmory']`, donc toujours vraie : corrigée ; (b) mon premier contrôle du logo exigeait un rendu identique sur une zone qui contenait du texte (l'anti-crénelage varie) : j'ai mesuré au lieu de supposer, puis choisi des zones sans texte ; (c) un script de contrôle du zip lisait le nom de l'installateur au mauvais endroit (déjà arrivé) : refait ; (d) la batterie complète a été relancée APRÈS les dernières modifications de la recherche.

## 06/10/2026 — v0.3.1 (suite 2, même version, avant les tests)

**1. Départager à l'œil les 13 icônes ambiguës** (demande de l'utilisateur : « un bouton de diagnostic affichant les 2 icônes possibles, et je vérifie en jeu quels sont les bons »). Ces 13 perks d'artefact ont un nom qui existe avec deux icônes dans
le Manifest, qui ne dit pas laquelle va avec quel artefact (saison non renseignée) : aucune règle fiable ne tranche, donc on montre les candidats.
- `lib/diagnostic/departagerIcones.ts` (fonctions pures) : `casAmbigus` (un cas par perk et par artefact ; les objets qui partagent la MÊME icône sont regroupés : « Orbes effilochants » a 3 objets mais 2 icônes ; options triées par plus petit hash, donc
  lettres A, B stables), `choixEnJson` (les choix retenus avec lettre, icône et objets ; les non tranchés listés ; une lettre inconnue est ignorée ; rien n'est deviné) ;
- `components/DepartagerIconesAmbigues.tsx` : panneau affiché SOUS le bilan du bouton de diagnostic existant (mode développement) : une carte par perk (nom, artefact, palier ◆), les icônes candidates en images de Bungie (jamais enregistrées),
  un clic choisit, « Je ne sais pas » retire le choix, compteur « N / 13 tranchés », bouton « ⬇ Télécharger mes choix » (`choix-icones-ambigues.json`) ; le texte du bouton annonce maintenant 134 icônes enregistrées et 13 à départager ;
- vérifié avec les **13 vrais cas de ton rapport** : logique 20 contrôles (13 cas, 2 icônes au moins et toutes différentes, ordre stable même si les candidats arrivent dans l'ordre inverse, les trois « Transport de horde » partagent les deux mêmes icônes, chemins
  de Bungie uniquement, cas limites, contenu du fichier) ; panneau dans un navigateur 15 contrôles (images, clic, changer d'avis, « Je ne sais pas », compteur, fichier) ; intégration au bouton existant 6 contrôles. Les images de Bungie ne sont pas accessibles depuis mon
  environnement : j'ai testé avec une image de substitution.
- **Suite** : tu envoies `choix-icones-ambigues.json`, et les icônes retenues sont figées dans `data/iconesPerksArtefact.ts` (TODO 17).

**3. Règles de l'utilisateur (06/10/2026)** : (a) la police « D2 Build Analyzer Vector » est **abandonnée** pour le moment : elle est standard (dérivée de Lato), alors qu'il voulait une police inspirée par le titre « Forge Armory » du logo ; rien n'est intégré, ne pas y revenir sans demande ;
(b) le PDF de la liste de tests porte le **numéro de version de l'appli** dans son nom (`A-TESTER-0.3.1.pdf`) : l'outil `outil-a-tester-pdf.py` le fait désormais et retire tout ancien `A-TESTER*.pdf` de la racine.

**2. Police personnalisée « D2 Build Analyzer Vector »** (ZIP envoyé par l'utilisateur, 06/10/2026) : spécimen complet produit (PDF de 38 pages : chaque glyphe dessiné à partir de son contour, code Unicode et nom). Constats : police dérivée de **Lato Medium** (version 2.015, licence
SIL OFL 1.1), **3 023 glyphes dont 2 164 caractères** (et non les 95 de l'ASCII annoncés par le README et le dossier `SVG_Glyphs`), tous les caractères français (é è ê à ç ù œ « » … € ’ – —) ; **47 des 69 caractères spéciaux de l'interface de l'appli y manquent** (✓ ✕ ◆ ▲ ▼ ★ ⚠ ⬇ ⬆ ✅ ❌ et tous
les emoji). **Non intégrée dans l'appli** : voir TODO 21.

## 06/10/2026 — v0.3.1

**Le comptage des versions reprend « comme avant »** (demande de l'utilisateur) : cette livraison est la **0.3.1** ; `package.json` passe de 0.3.0 à 0.3.1, l'installateur s'appelle `Forge-Armory-Setup-0.3.1.exe`, le pied de page et les exports
indiquent la 0.3.1. Les entrées « v0.3.0 (suite N) » ci-dessous restent l'historique des versions de test de la 0.3.0 ; les commentaires de code « ajouté en v0.3.0 » sont conservés tels quels.

**Retour de l'utilisateur** (PDF coché, deux rapports, une capture) : **26 tests validés sur 30**, dont tous ceux du **logiciel installé** : le build et l'installation ont réussi (l'erreur TS2540 est bien corrigée), les
données sont conservées après le renommage (builds, pondérations, cache du Manifest), le PDF tient sur une page, les exports JPEG et PNG sont inchangés, les deux Lances de Polaris affichent leur icône. Tests archivés
mot pour mot (`documentation/tests/`), compteur : 57 sections validées. Restent : « Tueur de souhaits » (bug d'image, capture), la ligne des éléments de la Doctrine (toujours sur deux lignes) et deux tests « au fil de l'eau ».

**1. Les « mauvaises versions » de la Recherche, ÉLUCIDÉES : des objets factices.** Hier, je soupçonnais un dédoublonnage qui gardait la mauvaise version d'un objet de même nom ; c'était **en partie faux** : ce
dédoublonnage ne fusionne que des objets de même nom ET même description, alors que les objets en cause avaient des descriptions différentes. La capture de l'utilisateur (`[dev] objet 2064394295 ... type 20 ... texte de type
« Colis » ... catégories 268598612, 3109687656`) et son rapport des « autres définitions de même nom » ont tranché : la catégorie **3109687656** est celle des objets **factices** (`itemType` 20, « Dummy »). Sur les 66 autres
définitions de même nom que des armes de sa liste (39 armes), **35 sont de type 20 et portent TOUTES cette catégorie**. Ils imitent une arme (emplacement, type affiché, rareté exotique, équipable) sans en être une :
« Le Lapin de Jade » en a **11 copies** (qui prenaient la place de l'arme en Recherche ; type 20, donc la liste d'anti-champion, réservée au type 3, ne s'appliquait pas : d'où l'absence d'icône), « Lance de Polaris » **7** (la
seconde copie de l'utilisateur en est une : rareté 5, seau d'énergie, aucune autre catégorie), « Dualité » une copie typée « Fusil automatique », et le « Colis » exotique du Tueur de Souhaits réutilise l'image générique des
copies, d'où l'image du Lapin de Jade. Rapport et capture conservés dans `knowledge-base/sources-externes/`.
- **Recherche** (`search.ts`, `devinerCategorie`) : nouvelle catégorie **« factice »** (type 20 OU catégorie 3109687656, testés avant tout autre critère), **masquée par défaut** comme les quêtes, ornements, packs, harmonisation et
  triomphes, mais sélectionnable : « Objets factices : colis, copies d'armes (masqué par défaut) » dans le menu des catégories. Vérifié avec la VRAIE fonction de recherche sur un faux Manifest reproduisant les cas : 14 contrôles
  (Lapin de Jade : 1 résultat au lieu de 12 ; Tueur de souhaits : le Colis disparaît ; Dualité ; Lance de Polaris ; le filtre « factice » retrouve les 11 copies ; les deux critères sont indépendants ; un perk ordinaire et un aspect ne changent
  pas) ;
- **anti-champion** (`doctrine.ts`) : **mon correctif d'hier ne pouvait jamais s'appliquer** : il visait les armes de `itemType` 3 portant la catégorie 3109687656, or une copie factice est de type 20. Corrigé : la liste de l'utilisateur
  s'applique à une copie factice dont le **seau est un emplacement d'arme** (cinétique, énergie, lourde) ; reste exclu : un objet factice hors d'un tel seau (un « Colis »), un objet de type 20 sans la catégorie, une légendaire de même
  nom. 6 nouveaux contrôles (41 sur 41 pour la liste de référence) ;
- la ligne grise `[dev]` de la Recherche, le badge et le rapport des exotiques restent en place.

**2. Icônes des perks d'artefact : 134 sur 147** (125 le 05/10). Second rapport de l'utilisateur (06/10, 00 h 22) : **128 trouvés directement** (3 de plus grâce à la ligature « œ ») ; les **125 enregistrés hier n'ont pas changé** (vérifié) ;
**6 par nom proche** (le nom de NOS données diffère d'une faute de celui du jeu, un seul candidat à chaque fois : « Combo tempêtes de lames » / « Combo Tempête de lames », « Tactique de meute » / « Tactiques de meute », « Surealimentation
élémentaire » / « Suralimentation élémentaire », « Appel tempête » / « Appel de tempête », « Tirs soutenu » / « Tir soutenu », « Rayon de souffle » / « Rayon du souffle »). **Les noms de nos données ne sont pas modifiés** : la clé d'un perk
de build enregistré en dépend, les renommer ferait perdre ces perks. Les **13 ambigus restent sans icône** (même nom, deux icônes ; le Manifest ne renseigne pas la saison de ces objets : la proposition « par la saison » n'a rien donné, 0 sur 13). Test d'intégrité
13 contrôles (134 icônes, aucune clé orpheline, les perks sans icône sont EXACTEMENT les 13 ambigus). « Orbes curatifs » et « Orbes de brisure » : même icône, confirmé légitime par l'utilisateur.

**3. Doctrine : toujours sur deux lignes chez l'utilisateur** (pourtant une ligne dès ~790 px dans mes mesures : sa place disponible est donc plus petite que je ne le supposais, sans que je sache de combien). Réponse :
- `RangeeBoutonsEgaux` : nouveau paramètre `niveaux` : le composant mesure la largeur naturelle des boutons à **chaque niveau de compacité** et retient **le moins compact qui tient sur UNE ligne** (`choisirDisposition`, fonction pure) ; si aucun
  ne tient, le niveau 0 en rangées équilibrées. `GrilleDoctrine` définit trois niveaux (`DENSITES_ELEMENT`) : écart icône-nom 0,3 / 0,25 / 0,2 rem, marges 0,4 / 0,3 / 0,2 rem, texte 0,9 / 0,82 / 0,74 rem, icône 20 / 18 / 16 px ; largeur estimée
  par bouton (police de type Arial) ~124 / ~111 / ~98 px, donc six boutons sur une ligne dans ~784 / ~706 / ~628 px ;
- **diagnostic** : en mode développement, une ligne grise indique la place disponible mesurée, la largeur du bouton, le nombre par rangée et le niveau retenu ; **elle dira la vraie place disponible chez l'utilisateur** ;
- vérifié dans un navigateur : 59 contrôles (une ligne de 900 à 640 px avec un niveau qui ne fait que monter, repli 3 + 3 à 560 px, texte plus petit et rien de coupé aux niveaux compacts, ligne de diagnostic, fonction pure sur huit cas).
  **Limite** : ces seuils sont ceux d'une police de type Arial ; la police réelle de l'utilisateur peut les décaler.

**4. Incidents de mon côté** : un script de mise à jour s'est arrêté sur une lecture de configuration inutile, après avoir changé la version mais avant les corrections de commentaires : état vérifié, reste appliqué. Un de mes contrôles du
choix de niveau contenait une condition toujours vraie (`or True`) : il n'en prouve pas le niveau exact ; la progression, les huit cas de la fonction pure et les comparaisons de niveau le font.

## 05/10/2026 — v0.3.0 (suite 18, même version)

**Retour de l'utilisateur** : PDF coché (22 cases sur 33, **passé en `npm.cmd run dev`**), deux rapports de diagnostic, et un échec d'installation. Les tests du logiciel
installé n'ont donc pas pu être faits. Les quatre sections entièrement validées et les tests validés des autres sont archivés (`documentation/tests/`), la liste est reconstruite
(30 tests, `npm.cmd run build` en tête) ; compteur : 50 sections validées.

**1. Erreur de build `TS2540` (`RangeeBoutonsEgaux.tsx` : `refMesure.current = el`, « read-only property »).** Corrigé : `useRef<HTMLDivElement | null>(null)`. Cette erreur existait
déjà dans les zips précédents (depuis la correction de la coche fantôme) ; elle n'apparaît qu'à `npm run build`, car `npm run dev` (Vite) ne vérifie pas les types, d'où une
découverte tardive. **Cause, ma faute** : ma vérification des types utilise un substitut de React écrit à la main (pas d'Internet pour installer `@types/react`), qui laissait
`RefObject.current` modifiable. Le substitut est maintenant fidèle aux surcharges de `useRef` de `@types/react` 18.3 ; **prouvé** en remettant l'ancienne ligne (erreur TS2540 identique à celle de
l'utilisateur, à la ligne de l'affectation), puis en restaurant le correctif (aucune erreur). **Reste invérifiable ici** : le vrai `npm run build` ; consigné en TODO 20.

**2. Version de Destiny 2 : couleurs des lignes 2 et 3 inversées** (demande de l'utilisateur). Ligne 2 (saison et date du patch) en ambre, ligne 3 (niveau des correctifs) en gris ; la
couleur ne signale donc plus à elle seule des correctifs en attente, le texte le dit. 13 contrôles dans un navigateur (couleurs, trois polices, quatre largeurs).

**3. Icônes des perks d'artefact : le Manifest les contient.** Rapport de l'utilisateur (sur SON Manifest, 38 894 objets lus) : **125 perks sur 147 trouvés**, 13 ambigus, 9 introuvables ; le
Manifest les classe « Attribut d'artéfact » (237 objets), catégorie de plug `artifact_perks`. Rapport conservé dans `knowledge-base/sources-externes/`.
- 125 icônes **figées** dans le nouveau `src/data/iconesPerksArtefact.ts` (chemins d'icônes de Bungie, aucun appel à l'exécution), sans toucher au fichier généré `artefacts.ts` ;
  `iconeDuPerk` les fournit ; affichage ajouté dans la grille de l'artefact (déjà branchée, mais le champ n'avait jamais été rempli), les emplacements équipés et le récapitulatif
  (icône de 14 px DANS la ligne du nom : la hauteur des emplacements ne change pas), la fiche « Voir » et les exports (via la fiche) ;
- vérifié : intégrité des données (7 contrôles : aucune clé orpheline, 125 icônes, les perks sans icône sont EXACTEMENT les 22 du rapport, chemins tous sous `/common/destiny2_content/icons/`) ;
  composants dans un navigateur (12 contrôles : 20 perks avec icône et 1 sans pour le premier artefact, chemin exact de chaque perk, aucune image cassée, hauteur des emplacements,
  récapitulatif, fenêtre « Voir ») ; les icônes de Bungie elles-mêmes n'étaient pas accessibles depuis mon environnement (image de substitution) ;
- une icône est partagée par deux noms différents (« Orbes curatifs », « Orbes de brisure ») : à regarder, probablement légitime ;
- **les 22 restants** : 9 introuvables dont 3 par la ligature « œ » (nos données : « Coeur de flamme » ; Manifest : « Cœur de flamme ») et plusieurs noms probablement fautifs dans NOS
  données (« Tirs soutenu », « Surealimentation »…) ; 13 ambigus (même nom, deux icônes). **Outil de diagnostic renforcé** : la comparaison développe les ligatures ; **suggestions de noms proches**
  (3 au plus, tous les noms à égalité montrés ; jamais départagés au hasard dans le JSON) ; détail des ambigus (hash, saison, description) ; **proposition par la saison** de l'artefact quand une seule
  icône en relève, listée à part et jamais mélangée aux trouvés directs ; trois blocs JSON séparés. Vérifié sur un faux Manifest de 40 000 objets bâti sur les vrais noms : 32 contrôles ; bouton dans un
  navigateur : 6 contrôles. Une attente de mon test supposait que la bonne suggestion serait la première : deux noms étaient à égalité, la fonction a été corrigée (pas seulement le test).

**4. Contrôle des exotiques : aucune arme oubliée.** Rapport de l'utilisateur : 140 des 143 noms de la liste retrouvés ; les 3 restants sont les variantes d'Ergo Sum ; la seule exotique du Manifest absente
de la liste est « Ergo Sum ». Deux désaccords avec la déduction de repli (Centrifuse, Poigne du Salut) : la liste fait foi. Les 115 « non détectés » sont normaux (la déduction de repli ne les voit pas, la liste
les gère).

**5. Recherche : trois anomalies, une hypothèse commune non prouvée.** « Tueur de Souhaits » affichait l'image du Lapin de Jade ; « Le Lapin de Jade » n'avait pas d'icône d'anti-champion ; « Dualité » avait l'icône d'un
fusil automatique alors que c'est un **fusil à pompe** (hash 3460576091, celui du rapport de l'utilisateur). À chaque fois un AUTRE objet de même nom que l'exotique attendu, comme pour la seconde Lance de Polaris
(catégorie 3109687656). Le dédoublonnage de la Recherche gardait, parmi des objets de même nom et même description, le premier lu, au hasard de l'ordre du Manifest.
- `dedoublonnerParTexte` et `prioriteDoublon` (extraits en fonctions pures, `search.ts`) : par priorité, un objet avec emplacement (règle historique), puis exotique, puis sans la catégorie 3109687656 ; à
  égalité, le premier lu ; deux objets de descriptions différentes ne sont jamais fusionnés ; un objet seul n'est jamais écarté ;
- `calculerAntiChampion` (`doctrine.ts`) : la liste de l'utilisateur s'applique aussi à une arme portant la catégorie 3109687656 (ancienne version d'exotique), pas au seul nom (en français, un nom d'exotique
  peut être celui d'une légendaire) ; le test existant « arme légendaire du même nom : la liste ne s'applique pas » est conservé ;
- **diagnostic** : en mode développement, chaque résultat de Recherche affiche une ligne `[dev]` (hash, type, sous-type, seau, texte de type, rareté, catégories, emplacement) ; la description technique du badge
  d'icône de type s'est enrichie de la rareté et des catégories ; le contrôle des exotiques a une nouvelle section « Autres définitions de même nom que des armes de la liste » (`lireDoublonsDeNom`) ;
- vérifié : 22 contrôles (priorités, les trois cas, ordre inverse, descriptions différentes, objet seul, accents et casse, ordre de sortie, lecture des doublons, rapport) ; liste de référence 35 contrôles (dont 5
  nouveaux sur les anciennes versions). **Non vérifié** : la vraie Recherche de bout en bout dans un navigateur, et surtout **l'hypothèse elle-même** : la ligne `[dev]` et le nouveau rapport diront ce qu'il en est ;
- **je n'ai pas identifié « la case permettant le diag »** que l'utilisateur ne voit pas sur Le Lapin de Jade : à lui demander.

**6. Dates et heure.** Tout est du 05/10/2026 (l'horloge de la séance est passée de 20 h à 23 h, heure de Paris).

**7. Incidents de mon côté, sans effet sur l'appli** : deux de mes scripts se sont arrêtés avant d'écrire (reconstruction de la liste de tests, une recherche de titre trop stricte) ; la liste n'avait pas été modifiée et
le PDF généré à ce moment était l'ancien : j'ai corrigé le script et régénéré avant de livrer. Une section de la TODO s'était glissée en fin de fichier (échappement) : remise à sa place.

## 05/10/2026 — v0.3.0 (suite 17, même version)

**Trois demandes de l'utilisateur** : la deuxième Lance de Polaris, le CSV des mods d'artefact, la ligne d'éléments de la Doctrine.

**1. Deuxième « Lance de Polaris » sans icône de type d'arme.** Il en possède deux : l'une s'affiche bien ; l'autre affiche le badge « type
d'arme absent du Manifeste pour cet objet (emplacement : énergie) » avec pour seule catégorie le numéro 3109687656 (ce que désigne ce numéro,
je ne l'ai pas établi). Le badge de la suite 10 a fait son travail : il a montré que la définition de cette seconde copie n'a ni texte de type
ni catégorie d'arme, donc que le repli par catégorie ne pouvait rien. Deux hashes pour un même nom : probablement une ancienne version d'un objet
réédité (**hypothèse non confirmée**, la définition brute n'a pas pu être lue ici). Les rééditions ayant souvent plusieurs hashes, d'autres armes
peuvent être touchées.
- nouveau `src/lib/manifest/typeArmeSecours.ts` : quand ni le texte ni les catégories ne donnent le type, on essaie (1) le **sous-type** d'arme de
  la définition (`itemSubType`, 17 types, valeurs de l'API de Bungie **non revérifiées** sur le Manifest ; consulté en dernier recours donc sans
  risque pour une arme déjà reconnue) ; (2) une **autre définition du même nom** qui est une arme au type reconnu, retenue **seulement si toutes ces
  définitions s'accordent** (deux types différents : aucune icône, jamais une fausse). L'étape 2 lit l'index de recherche déjà construit au chargement
  du Manifest et **ne le construit jamais** (`indexTableDisponible`, nouveau dans `search.ts`) ; tant qu'il n'est pas prêt, elle ne répond rien et
  **ne mémorise pas** ce vide pour réessayer ; résultat mémorisé par objet, donc sans coût aux affichages suivants ;
- `trouverFormeTypeArme` reçoit un 5e paramètre `typeSecours` : ordre texte, puis catégories, puis libellé de secours ; un texte ou une catégorie
  reconnus gardent toujours la priorité ; la règle de la munition pour les lance-grenades s'applique toujours ;
- branché dans les 7 endroits qui affichent une arme réelle (Inventaire ×2, Mon Build ×2, recherche dans le Manifest, fiche « Voir », export) ;
- **le badge de diagnostic indique maintenant aussi le hash, le type, le sous-type, le seau et le texte de type de l'objet** : si l'icône manque
  encore, il suffit de recopier son texte pour trancher ;
- vérifié avec un faux Manifest : 28 contrôles (le cas exact de l'utilisateur : catégorie 3109687656 seule + exemplaire frère → fusil d'éclaireur ;
  sous-type seul, sans index ; aucun frère ; frères en désaccord ; objet qui cite le nom sans le porter ; frère qui n'est pas une arme ; même texte
  à espaces irréguliers ; lance-grenades ; index pas prêt puis prêt ; 50 appels = 0 requête de plus ; index de 40 002 lignes : 16 ms ; description
  technique ; priorités) plus le vrai composant (icône trouvée par le libellé de secours, badge enrichi). **Limite connue** : deux noms qui ne
  diffèrent que par leur espacement ne sont pas rapprochés. **Non vérifié sur ton vrai Manifest** ;
- **incident de banc d'essai, sans effet sur l'appli** : en copiant le vrai `download.ts` (qui importe un fichier WebAssembly) dans mon dossier de test,
  j'ai écrasé la version simplifiée qu'utilisaient mes tests ; détecté à la première erreur, reconstituée, et les 9 batteries précédentes relancées
  (toutes à l'identique).

**2. CSV de l'onglet « Artifact Mods »** (colonne A = icônes selon l'utilisateur). **La colonne A est vide pour les 147 lignes** et le fichier ne
contient aucune adresse d'image : Google n'exporte pas les images de cellules en CSV. Le CSV ne peut pas fournir d'icônes ; consigné avec la piste de
repli (téléchargement .xlsx, non testé) en TODO 17. En revanche, il décrit exactement nos 7 artefacts × 21 perks : **146 perks sur 147 retrouvés avec
le même nom, le même artefact et le même palier** que `03_ARTIFACTS.md` ; seule différence, une orthographe (« Bullet » contre « Bullets »).
Première version de ma comparaison : elle annonçait 17 perks manquants et 2 écarts de palier, qui venaient de mon analyseur de tableau (cellules mal
découpées), pas des données : détecté en relisant les lignes de la fiche, comparaison refaite avec une lecture fiable avant de conclure. Le fichier est
conservé dans `knowledge-base/sources-externes/` ; fiche `23_RESSOURCES_EXTERNES.md` mise à jour. Le bouton de diagnostic des icônes via le Manifest
reste la voie principale (liste de tests).

**3. Ligne de choix de l'élément de la Doctrine sur UNE ligne.** Demande : « fais-les tenir sur une ligne ; réduis l'espace entre l'icône de
l'élément et le nom si besoin ».
- mesuré avec le vrai composant et le vrai style : réduire **seulement** l'écart (0,5 → 0,3 rem) et les marges (0,5 → 0,4 rem) ne suffit pas (141 px par
  bouton, soit 886 px pour six dans ~870 px disponibles). Il faut aussi **sortir la coche ✓ de la ligne** : invisible, elle réservait quand même ~19 px
  par bouton. Elle est maintenant dans le coin supérieur droit du bouton (`position: absolute`), visible seulement sur le bouton sélectionné ;
- **résultat** : bouton de 151 → 124 px (police de type Arial), six boutons dans ~790 px, donc sur une ligne dès 800 px disponibles ; l'espace entre
  l'icône et le nom passe d'environ 27 px à 5 px ; les six boutons gardent exactement la même taille (suite 12 inchangée) ;
- **quand la place manque vraiment** (fenêtre étroite) : retour aux rangées équilibrées 3 + 3, comme avant ;
- avec la police la plus large testée (DejaVu, rare sous Windows), un bouton fait 140 px : six = 880 px > 870, donc 3 + 3 ; ce n'est pas la police
  de Segoe UI ou d'Arial, plus étroites ;
- changement limité aux boutons d'élément (`GrilleDoctrine.tsx`) : les boutons de classe et la rangée `RangeeBoutonsEgaux` ne changent pas ;
- vérifié dans un vrai navigateur : 42 contrôles (une ligne à 870, 840 et 800 px ; coche dans le coin, entièrement dans le bouton ; une seule coche
  visible, aucune coche fantôme ; espace icône-nom ; repli 3 + 3 à 652 px ; et les 30 contrôles précédents de la rangée). Cinq attentes de mon banc
  d'essai ont dû être corrigées (police très large, ancien seuil de largeur, sélecteur qui comptait aussi la rangée de mesure invisible) : aucune ne
  venait du composant.

## 05/10/2026 — v0.3.0 (suite 16, même version)

**Classeur « Destiny 2: Endgame Analysis » et icônes des perks d'artefact** (l'utilisateur transmet un classeur Google Sheets
communautaire : « beaucoup d'informations réputées sûres », à exploiter plus tard ; pour une exploitation immédiate : les
icônes des perks d'artefact après Monument of Triumph).
- **Ce que le lien m'a réellement donné** : le classeur se lit sans compte, mais un seul onglet à la fois, celui du `gid` de
  l'adresse ; or **le lien ouvre l'onglet « Fragments »**, pas « Artifact Mods ». J'ai lu les 98 fragments (rang S à F,
  modificateurs de stats, effets) et la liste des onglets ; le reste du classeur n'est pas lisible sans le lien propre à chaque
  onglet. Ce que je n'ai pas pu faire est dit tel quel, et rien n'a été supposé sur les autres onglets ;
- **Les icônes du classeur sont inutilisables** : miniatures Google de 50 × 49 px, adresses à jeton liées à la session du
  classeur, que je ne peux de toute façon pas télécharger (pas d'accès à Internet dans mon environnement). Le classeur ne peut
  donc pas fournir les icônes ; consigné dans `knowledge-base/23_RESSOURCES_EXTERNES.md` (nouvelle fiche : onglets, réserves,
  usages envisagés) ;
- **Constat sur les données** : les 147 perks d'artefact n'ont **aucune** icône ; l'affichage est déjà branché (il s'active
  dès qu'un perk en a une) ; la voie officielle du Manifest est une impasse confirmée (26/08) ; la recherche par nom du 27/09
  (`trouverIconePerkArtefact`) n'a jamais été vérifiée sur un vrai Manifest et n'est branchée nulle part (elle parcourt toute la
  table au premier appel : la brancher à l'affichage risquait de figer l'écran) ; **126 noms distincts seulement** sur les 147
  perks : 21 perks partagent leur nom avec un autre artefact ;
- **Outil de contrôle, mode développement, lecture seule** (`lib/diagnostic/controleIconesPerksArtefact.ts`,
  `components/ControleIconesPerksArtefact.tsx`, drapeau `controleIconesPerksArtefact`, branché dans `DashboardPage.tsx` comme celui
  des exotiques) : UN passage sur la table des objets, à la demande, qui dit si le Manifest contient ces icônes. Règles
  strictes (mieux vaut aucune icône qu'une fausse) : même nom (accents, majuscules, espaces multiples ignorés) ET objet qui se
  présente comme un perk d'artefact ET une icône ; une icône distincte : trouvé ; plusieurs : ambigu, aucune retenue ; aucune :
  introuvable. Le rapport Markdown décrit aussi comment le Manifest classe les objets d'artefact (types, catégories), liste pour
  chaque introuvable les objets de même nom hors règle, et fournit les icônes trouvées en JSON (clé `artefact|tier|nom`) ;
- **vérifié avec un faux Manifest de 40 172 objets bâti sur les vrais noms des 147 perks** : 26 contrôles, dont chaque perk
  contre le verdict attendu de son groupe (trouvé avec trois objets de même icône, trouvé par la seule catégorie de plug avec un
  nom en majuscules sans accents et espaces doublés, ambigu, même nom hors règle, objet sans icône, absent), une arme de même nom
  qu'un perk qui ne fausse pas son icône, deux perks de même nom dans deux artefacts qui reçoivent la même icône avec des clés
  distinctes, ligne illisible, Manifest vide, table absente, statement libéré même en cas d'erreur, durée 121 ms. Première
  version de mon jeu d'essai : il supposait des noms uniques, ce que les vraies données contredisent (126 noms distincts) ; détecté
  par le test et refait avec des attentes calculées ;
- **limite, à lire** : **jamais lancé sur le vrai Manifest** (pas d'accès réseau ici). Le faux Manifest prouve la logique, pas que
  Bungie range ces perks comme je le suppose : le rapport de l'utilisateur le dira. Rien ne change à l'écran pour l'instant :
  aucune icône n'apparaît encore, c'est normal ;
- TODO 17 : suite du chantier (figer les icônes trouvées dans les données, archiver le drapeau, plan de repli, exploitation
  ultérieure du classeur).

## 05/10/2026 — v0.3.0 (suite 15, même version)

**Niveau des correctifs affiché** (réponse de l'utilisateur à la question de la suite 14 : « niveau des correctifs, s'il te
plaît »). L'affichage en haut à droite du titre compte maintenant trois lignes : version, patch, **niveau des correctifs**.
- **Ce qui s'affiche aujourd'hui** : « DESTINY 2 · VERSION 9.7.0 » / « Monument of Triumph · patch du 9 juin 2026 » / (en
  ambre) « Correctifs : aucun intégré · dernier publié : 9.7.0.4 (28 juillet 2026) ». **Je n'affiche volontairement PAS « version
  9.7.0.4 »** : ce serait faux, aucun correctif n'est intégré (aucune fiche, aucun effet reporté). Le niveau affiché est celui
  que l'appli prend réellement en compte ; l'écart avec le jeu est visible, en ambre, au lieu d'être caché ;
- **vérification de la dernière version publiée** : la page d'état officielle de Bungie liste « Update 9.7.0.4 » le mardi
  28 juillet 2026 ; aucun correctif plus récent trouvé (liste non garantie complète). Bungie y indique que la 9.7.0 était sa
  dernière mise à jour de contenu, les correctifs suivants ne visant que la stabilité ;
- `src/data/versionJeu.ts` restructuré : le champ `correctifsPosterieurs` (liste de numéros, suite 14) est REMPLACÉ par
  `correctifs`, une liste de `{ numero, date?, integre }`. Fonctions pures : `niveauCorrectifs`, `versionEffective`,
  `libelleCorrectifs` (trois cas : aucun intégré, intégrés en partie, tout intégré), `infobulleVersionJeu`. **Règle de
  cumul** : le niveau intégré est le dernier d'une série ininterrompue de correctifs intégrés depuis le début (un correctif
  marqué intégré après un non intégré ne relève pas le niveau, car les correctifs sont cumulatifs). Quand un correctif est
  intégré, le numéro de version affiché monte avec lui ; la ligne passe en gris et dit « Correctifs intégrés jusqu'à 9.7.0.x ».
  Règle de maintenance mise à jour en TODO 10 et dans `27_PATCHNOTES/LISEZ-MOI.md` ;
- **défaut trouvé à l'essai et corrigé** : à 420 px de large, avec les polices les plus larges, la 3e ligne (395 px) dépassait
  la place disponible (372 px) et débordait à gauche. `maxWidth: 100 %` : le texte passe à la ligne au lieu de déborder ;
- vérifié : 16 contrôles de logique, identiques dans quatre fuseaux horaires (dont le piège d'un correctif « sauté », la liste
  vide, un correctif sans date) ; dans un vrai navigateur, 18 contrôles : trois polices, six largeurs de fenêtre (de 1100 à
  360 px), toujours collé au bord droit, sans débordement ni texte coupé, trois lignes à pleine largeur ; ligne 3 en ambre
  (`rgb(214, 169, 90)`) ; la suite de la page n'est pas décalée (175 px avec comme sans badge).
- Le zip du 05/10 contient donc l'affichage à trois lignes ; la suite 14 en décrit la première version (deux lignes).

## 05/10/2026 — v0.3.0 (suite 14, même version)

**Décisions de l'utilisateur pour le futur onglet « Load-out »** (TODO 16, après les tests) : la case « stocké en jeu » est,
pour le moment, un **mémo coché à la main** (rien n'est enregistré dans le jeu) ; **une légende doit le préciser en tête du
bloc quand le sélecteur est sur « Load-out »**. L'enregistrement réel dans un emplacement de loadout du jeu reste une piste
sans engagement (l'API de Bungie le permet : `EquipLoadout`, `SnapshotLoadout`, `UpdateLoadoutIdentifiers`, `ClearLoadout`,
vérifié le 05/10/2026, mais sans la Doctrine ni l'artefact). Constats consignés : classe, élément et contexte sont déjà
enregistrés (filtres sans changement de données) ; l'ordre ne l'est pas (liste triée par date).

**Affichage de la version de Destiny 2 prise en compte et de la date du patch** (demande de l'utilisateur : tout en haut de
l'appli, tout à droite du titre).
- `src/data/versionJeu.ts` (nouveau) : SOURCE UNIQUE (`numero`, `nom`, `datePatch`, `correctifsPosterieurs`), avec la règle de
  maintenance. Valeur actuelle : **9.7.0, Monument of Triumph, 9 juin 2026**, qui est la seule fiche de patch de la
  knowledge-base et celle sur laquelle les règles de l'appli sont fondées (README, index de la knowledge-base) ;
- `BadgeVersionJeu.tsx` (nouveau) : deux petites lignes alignées à droite (« DESTINY 2 · VERSION 9.7.0 », « Monument of
  Triumph · patch du 9 juin 2026 ») et une infobulle ; `DashboardPage.tsx` : le titre et le badge dans une même rangée, le
  badge passant sous le titre, toujours calé à droite, quand la fenêtre est étroite ;
- **ce n'est pas « la dernière version du jeu » mais celle que l'appli prend en compte.** **Découverte en vérifiant** : Bungie a
  publié des correctifs APRÈS la 9.7.0 (9.7.0.1 mi-juin, 9.7.0.2 le 23 juin, 9.7.0.3 le 7 juillet, 9.7.0.4 fin juillet, d'après
  bungie.net et des sites de suivi) ; **aucun n'est intégré au projet** (vérifié : aucune mention de « 9.7.0.x »). L'affichage
  dit donc 9.7.0, et son infobulle signale ces correctifs. Chantier consigné en TODO 10 (fiches à produire, deux points à
  vérifier à la source, dont le bonus 4 pièces du set Europa en Crucible) ;
- vérifié : texte et dates (7 contrôles, identiques dans quatre fuseaux horaires dont Auckland et Kiritimati : la date ne
  glisse pas d'un jour) ; dans un vrai navigateur, 19 contrôles : trois polices, cinq largeurs de fenêtre, badge toujours collé
  au bord droit de la rangée, sans débordement, centré sur le titre, et la suite de la page n'est pas décalée (175 px avec
  comme sans badge). Hors périmètre, déjà ainsi : le titre a une largeur fixe de 491 px, donc une fenêtre de 420 px le rogne ;
- `knowledge-base/27_PATCHNOTES/LISEZ-MOI.md` : règle de maintenance de cette valeur ajoutée.

## 05/10/2026 — v0.3.0 (suite 13, même version)

**Zip et dossier du projet renommés en « forge-armory »** (demande de l'utilisateur). Le zip s'appelle désormais
`forge-armory-ver_0_3_0.zip` (même schéma que `d2-build-analyzer-ver_0_3_0.zip`) et le dossier qu'il contient
`forge-armory` (avec un tiret : un nom sans espace évite les soucis de chemin avec `npm.cmd`).
- **Aucun effet sur les données ni sur le logiciel** : le dossier du projet n'est utilisé que pour développer et fabriquer
  l'installateur ; les données de l'utilisateur dépendent de l'origine `app://local`, des clés de stockage et du dossier
  `%APPDATA%` repéré au démarrage (`dossierDonnees.cjs`), jamais du dossier du projet ;
- **correction d'une erreur de ma part (suite 12)** : j'avais rangé le nom du dossier du projet et du zip parmi les
  identifiants à ne jamais renommer (README, TODO 12), « parce qu'ils protègent les données ». C'était inexact pour le
  dossier et le zip, seuls `name`, `appId`, les clés de stockage et le dossier `%APPDATA%` comptent ; README et TODO corrigés ;
- `GUIDE-DEMARRAGE.md` : `forge-armory.zip` et dossier `forge-armory` (quatre endroits). Rien d'autre ne mentionnait ce nom
  (recherche sur tout le projet) ; `package.json` (`name`), `appId` et clés de stockage INCHANGÉS ;
- mon propre dossier de travail garde son nom : le zip est fabriqué depuis une copie nommée `forge-armory`, ce qui prouve
  aussi que le projet ne dépend pas du nom de son dossier (vérificateur d'imports lancé depuis le nouvel emplacement).

## 05/10/2026 — v0.3.0 (suite 12, même version)

**Renommage officiel : « Forge Armory »** (demande de l'utilisateur : « passer "Destiny 2 Build Analyzer" en
sous-titre et migrer vers "Forge Armory" officiellement »). Chantier de la TODO 12, la partie à risque étant le dossier
de données.
- **Ce qui change (visible)** : `build.productName`, `nsis.shortcutName` et `win.artifactName` de `package.json`
  (installateur `Forge-Armory-Setup-<version>.exe`, raccourci, entrée « Applications » de Windows) ; titre de la
  fenêtre et de la page « Forge Armory — Destiny 2 Build Analyzer » ; pied de page de l'appli ; export des fiches (en-tête
  « FORGE ARMORY » sous « FICHE DE BUILD », pied « FORGE ARMORY · DESTINY 2 BUILD ANALYZER · EXPORT INFOGRAPHIQUE ») ; copie
  en texte (« Fiche générée par Forge Armory (Destiny 2 Build Analyzer) ») ; rapport de l'outil de contrôle des
  exotiques ; README, guides, outil de la liste de tests. Version, `name` et `appId` INCHANGÉS ;
- **Ce qui ne change pas, volontairement** : clés de stockage des builds, des pondérations et de la session Bungie,
  base du Manifest, identifiant DIM, schéma `app://local`, adresse de retour Bungie, nom du dossier du projet et du zip
  (liste complète en TODO 12) : un export JSON ou un build enregistré avant le renommage se relit donc exactement comme avant ;
- **Dossier de données (le risque principal)** : Electron range les données dans un dossier de `%APPDATA%` dont le nom
  dépend du nom de l'application. **Le projet n'avait jamais relevé lequel servait chez l'utilisateur**, et l'hypothèse de la
  TODO (« le productName ») n'était pas vérifiée : le `productName` n'est que dans la configuration d'installation, pas dans
  le `package.json` embarqué, donc Electron utilisait probablement `d2-build-analyzer`. Plutôt que de parier, nouveau module
  `electron/dossierDonnees.cjs` : au démarrage, il REGARDE lequel des dossiers `d2-build-analyzer` et `D2 Build Analyzer`
  existe et contient des données (`Local Storage` ou `IndexedDB`), et `main.cjs` fixe `userData` et `sessionData` sur ce
  dossier AVANT que l'application soit prête ; en cas d'erreur, réglage par défaut d'Electron conservé (le logiciel
  démarre quand même). Règles : un seul dossier habité → celui-là ; plusieurs → le plus récemment utilisé ; aucun →
  `d2-build-analyzer` ; un dossier au nom « Forge Armory » ne passe jamais avant un ancien dossier habité. Rien n'est
  déplacé, copié ni supprimé ;
- **vérifié** : 15 scénarios sur de vrais dossiers temporaires aux dates de modification contrôlées (chaque dossier seul,
  les deux, égalité, installation neuve, dossier vide, dossier « Forge Armory » seul ou avec un ancien, IndexedDB,
  chemins inexistants, et « le choix ne modifie rien ») ; le VRAI `main.cjs` démarré avec un faux Electron : 7 contrôles dont
  « userData et sessionData fixés sur l'ancien dossier, avant `whenReady` et avant l'enregistrement du schéma `app://` »,
  ancien dossier intact, aucun dossier « Forge Armory » créé ; identifiants internes recomptés un à un (inchangés) ;
  plus aucun ancien nom visible dans le code hors commentaires ; export : plus aucun « D2 BUILD ANALYZER », hauteur de
  page IDENTIQUE avant et après (1641 px, mesurée sur la même page avec l'ancien et le nouveau texte), pied de page sur
  une ligne sans débordement ; copie en texte vérifiée sur la fiche complète ;
- **défaut trouvé par un test instable, corrigé dans la fonction (pas seulement dans le test)** : le test du dossier de
  données passait tantôt 15/15, tantôt 14/15. Cause réelle : pour départager deux dossiers habités, `dossierDonnees.cjs`
  retenait aussi la date des DOSSIERS eux-mêmes (leur date de création, à la milliseconde près dans mes tests), au lieu de
  celle des seuls FICHIERS de données. Corrigé : seule la date du fichier le plus récent compte (deux niveaux de
  profondeur). Vérifié : 60 exécutions consécutives à 15/15, et un cas dédié (dossier A : fichiers anciens mais dossiers
  récents ; dossier B : l'inverse) où la date des fichiers l'emporte ;
- **non vérifiable ici (à confirmer sur ton Windows)** : le comportement réel d'Electron et de l'installateur. Le test
  décisif est en tête de la liste : installer par-dessus l'ancienne version et retrouver ses builds ;
- **points à connaître** : Windows réutilise le dossier d'installation de l'ancienne version (il peut garder l'ancien nom,
  sans conséquence) ; l'épingle de la barre des tâches est à refaire ; renommer l'application sur le portail Bungie est
  facultatif et à faire SANS en créer une nouvelle (de nouvelles clés).

## 05/10/2026 — v0.3.0 (suite 11, même version)

**Tests** : l'ancienne liste (50 cases) est revenue cochée, sauf les deux tests « au fil de l'eau » :
les sections lance-grenades, Loadouts (« Modifier... », « Exporter... », équipement selon la classe), anti-champion
des exotiques et identité visuelle sont VALIDÉES et archivées (46 sections validées au total). **Nouvelle liste
établie** : une seule procédure « Avant de commencer » au lieu de la répéter, tests validés retirés (préférence
de l'utilisateur), deux « remarques » devenues du texte ; 18 cases.

**Infobulle d'effet pour les perks d'artefact** (demande de l'utilisateur). La grille de l'artefact n'affichait que
le NOM au survol (seuls les emplacements déjà équipés montraient la description).
- `lib/artefacts/infobulle.ts` (nouveau, fonctions pures) : `infobulleDePerk(nom, description, avertissement)` =
  nom, puis effet, puis éventuel ⚠️ ; mêmes nettoyages que pour les emplacements équipés (jeton `[icone X]` et
  guillemets retirés, doubles espaces recollés, traduction de repli). `texteAffichable`, jusqu'ici locale à
  `SelecteurArtefact.tsx`, y est déplacée telle quelle ;
- grille de l'artefact : utilisée pour les perks (et pour les emplacements équipés, même résultat) ; un perk bloqué
  garde son explication, après l'effet ;
- fenêtre « Voir » : `ElementFiche.infobulle`, renseigné pour les perks d'artefact, affiché par les pastilles. Les
  exports (images, PDF) sont inchangés : un survol n'existe pas dans une image ;
- vérifié : les 147 perks d'artefact de l'appli ont une description ; texte produit pour tous (aucune balise ni
  guillemet parasite) ; **dans les vrais composants** (grille : 21 perks à infobulle nom + effet ; avec 7 perks choisis,
  les 14 autres sont bloqués avec nom + effet + « ⚠️ Budget atteint (7 perks maximum). » ; fenêtre « Voir » : effet
  au survol), 11 contrôles. Première version de mon test : le cas « perk bloqué » ne s'exerçait pas réellement
  (il concluait « aucun blocage atteint ») : détecté et refait pour de bon ;
- **deux fautes certaines corrigées dans les textes de l'artefact** (`data/artefacts.ts`, déjà présentes avant) :
  « fficace contre les Champions implacables » (E manquant, « Rupture cinétique ») et une phrase commençant par une
  minuscule (« …d'arme". les épées obtiennent… »). Variantes « Champions Implacable(s) » laissées (TODO 13 ter).

**Doctrine : boutons de choix de l'élément, tous de la même taille** (demande de l'utilisateur). Ils avaient six
largeurs (92 à 166 px selon le libellé et la police). Une largeur écrite en dur serait fausse avec une autre police :
`RangeeBoutonsEgaux.tsx` (nouveau) MESURE hors écran la largeur naturelle de chaque bouton et donne à tous celle du plus
large ; si la ligne est trop étroite, rangées ÉQUILIBRÉES (3 + 3, pas 5 + 1) ; remesure au chargement des polices et au
redimensionnement. `calculerDisposition` (pure) décide du nombre de colonnes. `GrilleDoctrine.tsx` l'utilise ; le bouton
lui-même est inchangé.
- **défaut trouvé à l'aperçu et corrigé** : la rangée de mesure, cachée par `visibility: hidden`, laissait apparaître une
  coche ✓ fantôme (la règle `.carte-classe.selectionnee .coche` force `visibility: visible` sur l'enfant). Cachée
  maintenant par l'opacité du groupe, et rendue `inert` ;
- vérifié dans un vrai navigateur : 30 contrôles (largeur et hauteur uniques sur 3 polices et 3 largeurs de page, aucun
  débordement ni texte coupé, répartition équilibrée, redimensionnement après coup, clic transmis, parcours au clavier
  sans jamais entrer dans la rangée de mesure, une seule coche visible, dix cas de la fonction de répartition) ;
- **effet visible** : avec la police de ce banc d'essai (proche d'Arial), le plus large mesure 151 px et six boutons ne
  tiennent pas dans 912 px : ils passent en 3 + 3, alors qu'ils tenaient sur une ligne avant. Avec la police réelle de
  Windows (plus étroite), une seule ligne est possible : à confirmer par l'utilisateur. Alternative notée (TODO 13 ter).

**Outil de contrôle des exotiques réactivé** (mode développement) : il liste les exotiques du jeu absentes de la liste
de l'utilisateur, seul moyen fiable de répondre à « tu vois d'autres armes oubliées ? » (je n'ai pas accès à son Manifest).

**Dates** : l'horloge a avancé pendant la séance (2 octobre vers 3 h, puis 5 octobre vers minuit) ; les commentaires de
la seconde partie, d'abord datés du 02/10, sont corrigés en 05/10/2026.

## 02/10/2026 — v0.3.0 (suite 10, même version)

**Anti-champion des exotiques : liste complétée.** Quatre armes jusque-là sans anti-champion reçoivent **Bloqueur**
(Tueur de Souhaits, Trop long à expliquer, Récit d'un homme mort, Obligation collective), dans
`knowledge-base/28_ARMES_EXOTIQUES_ANTI_CHAMPION.md` (mise en forme de l'utilisateur, « Nom - Type », respectée) et dans
`src/data/exotiquesAntiChampion.ts`. **Le Lapin de Jade (Implacable), Symétrie (Surchargé) et Dualité (Implacable), que
l'utilisateur citait aussi, y figuraient déjà avec ces valeurs** : rien à changer. Ergo Sum (3 variantes) reste sans
anti-champion (cas particulier : il peut varier). Comptes du fichier recalculés : 143 armes, 44 surchargé, 51 implacable,
45 bloqueur, 3 sans.

**Icône de type d'arme : la Lance de Polaris** (fusil d'éclaireur) sans icône. **Cause non vérifiable ici** (je n'ai pas
son Manifest) : le mot-clé « eclaireur » existe et ignore déjà accents et apostrophes, donc le texte de type
(`itemTypeDisplayName`) de cette arme doit être vide ou inattendu, comme d'autres armes déjà touchées le 04/08.
- repli par la **catégorie d'objet** du Manifest (`itemCategoryHashes`) quand le texte est vide ou non reconnu :
  `CATEGORIES_TYPE_ARME` (17 catégories, la plus précise d'abord : un fusil à fusion linéaire peut porter aussi la
  catégorie « fusil à fusion »), `obtenirCategoriesObjet` (`doctrine.ts`), propriété `categories` de `IconeTypeArme`,
  `ElementFiche`/`PieceFiche.categories` pour la fiche et l'export. Un texte reconnu garde TOUJOURS la priorité ;
- normalisation du texte plus tolérante : apostrophes typographiques, espaces insécables, césures et caractères de
  largeur nulle, espaces multiples (aucun mot-clé actuel n'en contient : sans effet sur l'existant) ;
- le badge de diagnostic indique maintenant aussi les catégories de l'objet (pour comprendre un cas persistant) ;
- vérifié (31 + 20 contrôles) : 2464 combinaisons type × emplacement × munition × catégories ; aucun type d'arme
  reconnu ne change ; repli pour les 15 catégories ; lance-grenades retrouvé par catégorie ; le vrai composant ; la vraie
  page d'export avec une arme sans texte de type. **Hypothèse non confirmée** : si l'icône manque encore, le badge dira
  pourquoi.

**Export PDF sur une seule page.** Signalé : deux pages sur le Windows de l'utilisateur. **Défaut non reproductible
hors de ce poste** (aucune différence écran/impression, aucun arrondi fautif sur 701 hauteurs testées). L'ancienne
méthode mesurait la page à l'écran puis imprimait à cette hauteur + 1 px : toute impression un peu plus haute (texte
mis en page autrement, échelle d'affichage de Windows) débordait sur une 2e page. Nouvelle méthode, indépendante de la
cause (`electron/pdfFiche.cjs`, nouveau, fonctions pures, branche PDF seulement) : hauteur mesurée AUSSI sous le média
« print », marge de sécurité de 24 px (fond sombre, invisible), style réservé à l'impression qui impose `@page` et la
hauteur de la page web (aucun débordement), et `pageRanges: "1"` en dernier recours.
- **La branche PNG/JPEG de `main.cjs` est strictement inchangée** (comparée ligne à ligne : 7 lignes retirées, toutes de
  l'ancienne impression PDF) ;
- vérifié (22 contrôles) sur les vraies pages d'export, en SIMULANT le défaut (impression plus haute de 70 px) : ancienne
  méthode 2 pages, nouvelle 1 page, texte complet conservé, style injecté malgré la politique de sécurité de la page,
  et 1 page même avec 400 px de contenu inattendu après la mesure. **Limite** : la simulation prouve le mécanisme, pas la
  cause exacte sur Windows ; non testé dans Electron lui-même.

## 01/10/2026 — v0.3.0 (suite 9, même version)

**Les deux lance-grenades départagés par leur type de munitions** (TODO, ex-section 14, demandée
par l'utilisateur). Les deux variantes (spéciales, lourdes) ont le MÊME texte de type : seule la
munition les distingue vraiment. Jusqu'ici, l'appli se servait de l'emplacement de l'arme (lourde =
lourd, tout le reste = spécial).
- `trouverFormeTypeArme(typeArme, slot, munition?)` : pour les lance-grenades, le type de munitions
  (`obtenirTypeMunition`, ajouté en v0.2.9) décide : « lourde » = lance-grenades lourd, toute autre
  valeur connue = spécial ; inconnu = repli sur l'emplacement, comme avant. `IconeTypeArme` reçoit
  la propriété `munition`. Aucun autre type d'arme n'en dépend ;
- branché dans les 7 endroits qui affichent une arme réelle : Inventaire (vignette et fenêtre de
  détails), Mon Build (idem), recherche dans le Manifest, fiche « Voir », export JPEG/PNG/PDF.
  Bénéfice : l'icône de type et l'icône de munitions affichées côte à côte sont désormais cohérentes
  par construction ; plus de dépendance à une règle d'emplacement (déjà prise en défaut une fois,
  « Le Sommet », 04/08) ;
- limite : les filtres par type d'arme (Inventaire, Coffre) listent des NOMS de types : une seule
  entrée « Lance-grenades », icône spéciale. Hors demande, noté en TODO (section 14) ;
- vérifié : 96 combinaisons type × emplacement identiques à l'ancienne version sans munition ;
  336 combinaisons où les autres types d'arme ignorent la munition ; cas des lance-grenades (lourd en
  cinétique ou énergie → lourd ; spécial en emplacement lourde → spécial ; munition principale →
  spécial ; inconnue → repli sur l'emplacement ; type vide → rien) ; le VRAI composant rendu (3 cas) ;
  la VRAIE page d'export avec trois lance-grenades (le lourd rangé en emplacement énergie reçoit
  maintenant l'icône lourde, que l'ancienne règle aurait faite spéciale) ; 7 appelants vérifiés un à
  un. Non vérifiable ici : les vraies valeurs de munitions de ton Manifest (déjà contrôlées par tes
  tests de la v0.2.9 sur deux lance-grenades) ;
- **Liste de tests** : section « suite 9 » en tête.

## 01/10/2026 — v0.3.0 (suite 8, même version)

**Loadouts : boutons regroupés, export au choix, équipement selon la classe** (demandes de
l'utilisateur ; les boutons de la fiche « Voir » ne changent pas).
- **« Modifier... »** remplace « Icône », « Décrire » et « Renommer » : une fenêtre
  (`ModifierLoadout.tsx`) pour le nom, la description et l'icône, enregistrés d'un coup
  (`modifierInfosLoadout`, une seule écriture ; nom vide refusé). Échap annule ; un clic à côté ne
  ferme pas (pour ne pas perdre un texte tapé). La zone de saisie dans la carte, créée le 30/09, est
  supprimée. Le sélecteur d'icône est sorti dans `SelecteurIconeLoadout.tsx` (partagé avec le
  formulaire d'enregistrement) ;
- **« ⬇ Exporter... »** remplace « ⬇ Exporter » : une fenêtre (`ExporterLoadout.tsx`) propose Copie texte,
  Export JPEG, PNG, PDF et JSON sans ouvrir « Voir ». Elle réutilise la barre de partage de « Voir »
  (`BarrePartage.tsx`, nouvelle présentation « liste ») : une seule logique, donc des résultats
  identiques (copie et son repli, images et PDF avec filigrane) ; la rangée de « Voir » est inchangée ;
- **« 🎮 Équiper en jeu » selon la classe** : le menu global « Équiper sur : » est SUPPRIMÉ. La classe
  enregistrée dans le build (`classeFigee`) désigne le personnage (`lib/loadouts/classePersonnage.ts`,
  fonction pure) : un seul personnage de cette classe → équipé directement ; build sans classe,
  plusieurs personnages de la classe, ou aucun → fenêtre explicative
  (`ChoixPersonnageEquipement.tsx`) qui invite à choisir (ou, s'il n'y en a aucun, explique et ne
  touche à rien : l'armure est propre à chaque classe). La confirmation nomme le personnage ;
- **check-list** : elle ne s'ouvre plus qu'après un équipement si le build contient AUTRE CHOSE que
  des armes et des armures (`doctrineAConfigurer` : sous-classe, super, mêlée, grenade, compétence de
  classe, saut, aspects ou fragments), même après un échec partiel. Auparavant elle s'ouvrait
  toujours, y compris avec « aucune configuration de Doctrine ». Sans Manifest, elle le dit au lieu
  d'affirmer que le build n'a pas de Doctrine. L'artefact n'y figure pas (comme avant) ;
- **boutons sur 2 lignes** : mesuré dans la VRAIE page (rangée de 302 px ; 288 px dans une fenêtre
  étroite) avec trois polices : « Modifier... » tient sur 2 lignes partout (marge d'au moins 12 px) ;
  le libellé long « Modifier description... » tient avec Arial mais passe à 3 lignes avec la police
  la plus large essayée, et la police réelle de Windows n'est pas testable ici : libellé court retenu
  par prudence, changeable en un mot. **Correction d'une erreur de ma part** : mes premières mesures
  supposaient une rangée de 277 px (panneau en `border-box`) ; la vraie rangée fait 302 px ;
- **vérifié par un vrai test d'interface** : le vrai panneau chargé dans un navigateur avec quatre
  loadouts et un faux serveur Bungie, 51 contrôles (ordre et nombre de lignes des boutons dans trois
  polices et deux largeurs, fenêtre « Modifier » complète, fenêtre « Exporter » : cinq choix, copie,
  JSON téléchargé et relu, images et PDF avec filigrane, boutons de « Voir » inchangés ; équipement :
  Chasseur direct sur C1 sans toucher au Titan, build sans classe avec choix, Arcaniste absent sans aucun
  appel, deux Chasseurs avec choix restreint, confirmation refusée, personnages non chargés,
  check-list présente ou absente selon le contenu). Non vérifiable ici : la vraie API de Bungie ;
- **défauts trouvés et corrigés en route** : texte d'aide gris presque invisible sur le fond gris des
  boutons (fenêtre d'export et choix de personnage) ; dates « 02/10/2026 » écrites par erreur dans les
  commentaires (nous sommes le 01/10), corrigées ;
- **Liste de tests** : section « suite 8 » en tête.

## 01/10/2026 — v0.3.0 (suite 7, même version)

**Décisions de l'utilisateur** : filigrane à 7 % validé ; tests des armes équipées sur un autre
personnage concluants, point clos (section « suite 4 » archivée, validation donnée par
message) ; anti-champion des armes exotiques : « j'avais mal compris — utilise mon fichier
texte, je l'ai pris du jeu, tout y est et c'est fiable ».

**Anti-champion des armes exotiques : la liste de l'utilisateur devient la référence.**
- `lib/manifest/antiChampionExotiques.ts` (nouveau, fonction pure) : rapprochement par le NOM
  français de l'arme dans le Manifest, normalisé (accents, ligatures, apostrophes,
  ponctuation) ; `championDeReference` renvoie un type, `null` (arme listée SANS
  anti-champion : 7 armes) ou `undefined` (nom absent de la liste). Règle étroite pour les
  variantes : « Ergo Sum solaire / abyssale / cryo-électrique » (3 armes, toutes sans
  anti-champion) donnent aussi un alias « Ergo Sum » au cas où le Manifest les nomme toutes
  ainsi ; une première règle plus générale a été écartée avant livraison (elle aurait créé
  des alias sur « le », « la »…) ;
- `doctrine.ts` : `calculerAntiChampion` consulte d'abord la liste, SEULEMENT pour une arme
  exotique (`itemType` 3, `tierType` 6) ; sinon, ou si le nom n'est pas dans la liste, la
  déduction d'origine, conservée et exportée sous le nom `deduireAntiChampion`. Comme tout
  passe par `obtenirAntiChampion`, la liste s'applique d'un coup à l'Inventaire, Mon Build, la
  fiche « Voir », les exports, la recherche, les filtres par champion et le **scoring** (les
  scores de builds avec une exotique à anti-champion mal déduit peuvent donc changer, à raison) ;
- vérifié (21 cas) : vrais noms de la liste (Belle Affaire, Sturm, Empereur des Rats, Mille
  voix, Tueur de Souhaits…), noms écrits autrement, les 143 armes retrouvées avec leur valeur,
  « la liste passe avant la déduction » (déduction bloqueur / liste surchargé → surchargé ;
  Mille voix, déduction muette → implacable ; arme sans anti-champion selon la liste mais dont
  la déduction en voit un → aucune icône), exotique absente de la liste → déduction, arme
  légendaire ou objet non-arme du même nom → liste ignorée, hash inconnu, cache ;
- l'outil de contrôle (créé plus tôt le même jour) est conservé mais compare désormais la
  déduction de REPLI à la liste ; drapeau `controleAntiChampionExotiques` ARCHIVÉ (`false`) : il
  reste utile pour repérer les noms de la liste sans arme correspondante dans le jeu ; ses deux
  tests (lancer, envoyer le rapport) sont abandonnés, la section « suite 5 » est archivée avec
  cette mention ;
- **limite connue** : un nom écrit différemment dans le jeu et dans la liste (hors accents,
  casse, apostrophes, ligatures) fait retomber l'arme sur la déduction : la liste doit être
  tenue à jour à chaque nouvelle exotique. `knowledge-base/28` et `src/data/exotiquesAntiChampion.ts`
  le disent ; TODO section 13 bis.

**Liste de tests** : section « suite 7 » en tête (exotiques, filtres, bouton de simulation disparu) ;
intensité du filigrane cochée (7 %) ; « suite 4 » archivée ; « suite 5 » archivée sans exécution.
**TODO** : section « 2 ter » supprimée (faite), « 13 bis » ajoutée, remplacement automatique
d'arme noté validé (12 bis).

## 01/10/2026 — v0.3.0 (suite 6, même version)

**Identité visuelle Forge Armory et filigrane des fiches** (demandes de l'utilisateur :
« mise à jour des visuels et icônes de l'application » avec l'image d'identité fournie ;
option « B » pour le titre ; « le logo pour le filigrane de l'export, le SVG peut aider »).
Le NOM du logiciel ne change pas (voir TODO, section 12).
- **En-tête** (taille « B », choisie sur un aperçu comparant deux tailles) : emblème à
  gauche, bloc de texte (« Forge Armory », ligne de séparation à étoile, « Destiny 2 Build
  Analyzer | par Orynick/Orygamer ») décalé à droite, cercle de l'emblème du haut du titre
  au bas du sous-titre. Le texte étant dans l'IMAGE, la géométrie est fixe :
  `lib/enTete/geometrieIdentite.ts` (nouveau, fonction pure) et `EnTeteApp.tsx` réécrit ;
  `lib/enTete/placementLogo.ts` (mesure des lettres à l'affichage, créé le même jour) est
  SUPPRIMÉ. Mesuré sur le vrai composant : écart du cercle de 0,42 px (haut du titre) et
  0,20 px (bas du sous-titre) ;
- **Fichiers d'image** (`generer-icones.py`, réécrit pour la nouvelle image) :
  `public/logo-forge-armory-embleme.png` (304 × 342) et `-texte.png` (803 × 158), à fond
  transparent, réduits à environ 3 fois leur taille d'affichage (223 Ko au total ; les
  images d'origine, plus grandes, pesaient 339 Ko) ; favicons 16/32/48 px (papillon seul) ;
  `icon.ico` : papillon seul en 16, 24, 32 px, emblème complet en 48, 64, 128, 256 px,
  relu : 7 images distinctes, aucune bleue sous 48 px ;
- **Filigrane** : `src/data/emblemeForgeArmory.ts` (nouveau), emblème VECTORIEL, source
  unique pour l'export (inséré dans la page HTML : `exportFiche.ts`, cadre rogné aux bords
  de la page) et pour la fenêtre « Voir » (`Filigrane.tsx`, nouveau, `FicheBuild.tsx`).
  Posé par-dessus le contenu (les cartes sont opaques), 7 % d'opacité choisis sur un aperçu
  de 4, 7 et 11 % : texte resté net. Vérifié avec la vraie fonction d'export : hauteur de
  page inchangée (fiche complète et fiche courte), PDF d'une page avec son texte, aucune
  image ajoutée au PDF (le filigrane reste vectoriel) ;
- **SVG fourni : un défaut corrigé** : le cristal du bas était coupé net au bord du cadre,
  sans sa pointe. Sa partie tracée est gardée (sa base n'est volontairement pas le miroir de
  celle du haut, comme dans l'image d'identité) ; seule la pointe est complétée, en miroir
  de celle du haut (7 points, miroirs exacts vérifiés), et le cadre passe à 1024 × 1100.
  Fichiers corrigé et original conservés dans `ressources-installateur/forge-armory/` ;
- **Archive** : la première version du logo Forge Armory (essai de la veille) est rangée avec
  son script dans `ressources-installateur/ancien-logo/forge-armory-v1/` ; le fichier
  intermédiaire « transparent » de cette version (564 Ko, régénérable) est supprimé ;
- **Incident évité** : un commentaire CSS contenant des apostrophes inversées cassait le
  gabarit de la feuille de style de l'export (erreur de types détectée avant livraison) ;
- **Liste de tests** : section « suite 6 » en tête (en-tête, icônes, favicon, filigrane).

## 01/10/2026 — v0.3.0 (suite 5, même version)

**Contrôle de l'anti-champion des armes exotiques** (TODO 2 ter ; choix de
l'utilisateur : « la déduction d'abord »). Outil de diagnostic, en mode
développement seulement, lecture seule.
- `src/data/exotiquesAntiChampion.ts` : la liste de référence de l'utilisateur
  (143 armes, noms FR inchangés, 7 sans anti-champion), sous forme de données ;
- `src/lib/diagnostic/controleAntiChampionExotiques.ts` : lecture dans le
  Manifest de toutes les armes exotiques équipables (préfiltre sur le JSON
  compact, comme la requête existante de `doctrine.ts`, avec une garde qui
  signale clairement un préfiltre sans résultat) ; rapprochement par nom
  normalisé (accents, ligatures œ/æ, apostrophes, ponctuation) ; appel de la
  VRAIE fonction de l'appli (`obtenirAntiChampion`) sur chaque version d'une
  arme ; verdicts : accord, désaccord, non détecté, versions divergentes,
  détecté en trop, absent du Manifest ; liste des exotiques du jeu absentes de
  la liste (pour repérer un nom écrit différemment) ; rapport Markdown ;
- `ControleAntiChampionExotiques.tsx` : bouton dans le tableau de bord (drapeau
  `controleAntiChampionExotiques`), bilan à l'écran et rapport téléchargeable ;
- vérifié : 20 cas (normalisation des noms, chaque verdict, filtre du
  Manifest, rapport, cohérence de la liste réelle : 143 armes, aucun doublon
  après normalisation). Le résultat réel dépend du Manifest de l'utilisateur :
  en attente de son rapport ;
- drapeau `simulerExpirationSession` archivé (`false`) : le test de la
  bannière d'expiration est validé.

## 01/10/2026 — v0.3.0 (suite 4, même version)

**Tests** : expiration réelle d'une session (appli ouverte plus d'une heure) et
reconnexion validées par l'utilisateur ; la section « suite » est entièrement
validée et archivée, ainsi que le test « Vraie expiration de session » des
tests au fil de l'eau (même vérification).

**Remplacement automatique d'une arme équipée sur un autre personnage**
(TODO 12 bis ; règles validées par l'utilisateur le 01/10/2026). L'API Bungie
refuse de déplacer un objet équipé : l'appli équipe d'abord une AUTRE arme du
même emplacement sur cet autre personnage, ce qui libère la nôtre, puis suit le
chemin habituel (coffre, personnage choisi, équipement).
- `equiper.ts` : lecture du profil extraite (`lireProfilEquipement`,
  `localiserDansProfil`) pour servir aussi au choix du remplaçant (une seule
  lecture) ; nouvelle fonction PURE `choisirRemplacant` : même emplacement,
  inventaire de l'autre personnage d'abord puis coffre, non-exotique de
  préférence (légendaire d'abord), exotique seulement en dernier recours et si
  aucun autre exotique d'arme n'est équipé sur ce personnage ; armes
  seulement. Rareté et emplacement d'origine lus dans le Manifest (le coffre
  range tout dans un seul emplacement). Remplaçant du coffre : d'abord tiré
  vers l'autre personnage, puis équipé ;
- `equiperObjet` reçoit le Manifest (`db`, facultatif : sans lui, message
  d'origine) et **renvoie une note** (« « X » équipée à sa place sur l'autre
  personnage », « (sortie du coffre) ») ; `equiperPlusieursObjets` la
  rassemble (`notes`) ; Mon Build et les Loadouts l'affichent : l'appli dit
  toujours ce qu'elle a fait en plus ;
- échec de l'équipement du remplaçant : arrêt, arme demandée non déplacée,
  message nommant le remplaçant et l'erreur ;
- vérifié : choix du remplaçant sur 10 situations (légendaire, rare,
  exotique en dernier recours, autre exotique équipé, armure, arme demandée
  jamais choisie, courrier ignoré, mauvais emplacement au coffre, rien) ;
  déroulé complet avec un faux serveur sur 5 situations (ordre exact des
  appels vérifié) ; les 10 situations précédentes passent toujours. Non
  vérifiable ici : l'API réelle.

**Knowledge-base** : liste des armes exotiques et de leur anti-champion,
fournie par l'utilisateur, rangée telle quelle dans
`28_ARMES_EXOTIQUES_ANTI_CHAMPION.md` (143 armes, dont 7 sans
anti-champion), avec une entrée d'index. Utilisation dans l'appli notée en
TODO (section 2 ter), à valider avec l'utilisateur.

**Incident corrigé — TODO** : la section 12 bis (« Équiper » : cas non gérés),
créée le 30/09, avait été **effacée par erreur** le 01/10 lors de la mise à jour
de la section 12 (logo) : le bloc remplacé s'étendait jusqu'à la section 13 et
englobait la 12 bis. Constaté en voulant la mettre à jour ; restaurée et mise à
jour. Aucune autre section n'était dans le bloc remplacé.

## 01/10/2026 — v0.3.0 (suite 3, même version)

**Tests : le correctif d'« Équiper » est validé** par l'utilisateur (PDF coché
renvoyé, 5 cases sur 5) : arme sur un autre personnage non équipée (coffre puis
personnage choisi, puis équipement), arme équipée ailleurs (message clair, rien
déplacé), objet démantelé (message clair), et non-régression des cas déjà
validés. Section archivée. Restent ouverts : expiration réelle d'une session
(appli ouverte plus d'une heure), reconnexion après expiration, ouverture d'un
lien externe.

**Tests** (PDF coché renvoyé, 14 cases) : le nouveau logo est validé partout
(en-tête Forge Armory, icône Windows, favicon) ; section archivée. « Équiper »
validé pour un objet déjà sur le personnage choisi, un objet dans le coffre et
un build complet ; simulation d'expiration de session validée.

**« Équiper » un objet porté par un AUTRE personnage : échec, corrigé.**
Symptôme (équipé ou non sur l'autre personnage) : « Équipement échoué (500) :
DestinyItemNotFound » [itemInstanceId=6917530198671221342,
characterId=2305843009260546294].
- **Analyse** : l'erreur venait de l'étape d'ÉQUIPEMENT, et pour un objet équipé
  ailleurs le message clair prévu n'est pas apparu. Le seul chemin possible :
  la lecture de position du 30/09 (`GetItem`, composants 300 + 307) n'avait PAS
  abouti (« position inconnue »), et le « repli prudent » avait alors tenté de
  tirer l'objet du coffre (erreur 1623, avalée à tort), puis de l'équiper. Mon
  correctif du 30/09 contenait donc deux défauts : une source de position qui
  échoue dans ce cas, et un repli qui masque l'échec. La raison exacte de
  l'échec de `GetItem` n'a pas pu être établie sans accès à l'API réelle.
- **Correction** (`equiper.ts`) : `localiserObjet` lit désormais le PROFIL
  (composants 102 = coffre, 201 = inventaires des personnages, 205 =
  équipement), la même source que l'Inventaire de l'appli (qui fonctionne chez
  l'utilisateur) et la méthode des outils comme DIM ; l'objet y est cherché par
  son identifiant. Si les inventaires ne sont pas tous arrivés, la position est
  « inconnue » (et non « introuvable »). Le repli est SUPPRIMÉ : position
  illisible = arrêt avec un message clair et sa raison, rien de déplacé.
  Chaque échec d'équipement indique en outre « position lue avant : … ».
- **Vérifié** avec un faux serveur qui répond comme le profil de Bungie, sur
  10 situations, dont les deux cas de l'utilisateur avec ses vrais
  identifiants : autre personnage non équipé (coffre puis personnage choisi,
  puis équipement) ; équipé sur un autre personnage (message clair, rien de
  tenté) ; coffre ; déjà sur le personnage ; déjà équipé ; courrier ;
  introuvable ; profil refusé (arrêt) ; inventaires incomplets (arrêt, pas
  « introuvable ») ; erreur de transfert remontée. 10/10. **Non vérifiable
  ici** : l'API réelle de Bungie.
- **Liste de tests** : section « suite 3 » en tête ; les trois tests « Équiper »
  restés ouverts y sont repris (marqués « [~] déplacé » dans la section
  « suite »).

## 01/10/2026 — v0.3.0 (suite 2, même version)

**Nouveau logo (Forge Armory) mis en place PARTOUT, pour l'essai** (demande de
l'utilisateur ; le NOM de l'appli n'a pas encore changé, voir TODO section 12).
- **Icône Windows** (`ressources-installateur/icon.ico`, utilisée par
  l'installateur, le désinstallateur, le raccourci, la barre des tâches et la
  fenêtre) : icône COMBINÉE, une image par taille : papillon seul en 16, 24 et
  32 px, logo complet en 48, 64, 128 et 256 px, sur fond noir. Relue comme le
  ferait Windows : 7 images distinctes, aucune bleue en dessous de 48 px, entrées
  PNG 32 bits comme l'ancienne icône (qui passait l'installateur et
  electron-builder) ;
- **Favicon** : `public/favicon-16.png`, `-32.png`, `-48.png` (papillon seul, fond
  noir), déclarés dans `index.html` ; l'ancien `favicon.svg` quitte `public/` ;
- **En-tête de l'appli** (`DashboardPage.tsx`) : le logo (`public/logo-forge-
  armory.png`, 258 × 288 px, 43 Ko) remplace le Cryptarque, à gauche ; le Spectre
  qui suivait le titre est retiré (interprétation de « modifier les logos
  partout » ; il se remet avec l'ancien en-tête archivé). Les composants
  `IconeCryptarque.tsx` et `IconeFantome.tsx` restent dans `src/`, non utilisés.
  **Règle de taille de l'utilisateur** : le cercle du logo va du haut de la
  majuscule au bas des lettres qui descendent. Le titre tenant aujourd'hui sur
  une ligne, elle s'applique du haut du « D » au bas du « y » ; avec le futur
  sous-titre, ce sera du haut du « F » de Forge au bas du sous-titre. Tout est
  en `em` et calé sur la ligne de base du texte. **Mesuré dans Chromium avec le
  vrai CSS de l'appli, sur deux polices** : écart du cercle avec la majuscule et
  le « y » de 0,15 à 1,35 px en haut et de 0,40 à 0,65 px en bas ; hauteur du
  titre inchangée. Un titre en Segoe UI peut différer d'un ou deux pixels :
  à confirmer sur le logiciel installé ;
- **Piège rencontré** : le papillon seul, isolé d'abord par un masque circulaire,
  gardait des restes d'anneau dans les coins (le halo de l'anneau commence à
  336 px du centre, les pointes des ailes arrivent à 340 px). Il est désormais
  isolé par forme (composantes connexes), ce qui règle le problème ;
- **Ancien logo conservé** dans `ressources-installateur/ancien-logo/` : ancienne
  icône Windows, ancien favicon, code exact de l'ancien en-tête, et marche à
  suivre pour revenir en arrière (4 gestes) ;
- **Dossier du logo allégé** (option 1 choisie par l'utilisateur) : ne restent
  que l'image d'origine et la version à fond transparent ; le logo complet
  recadré, le papillon seul et les fichiers d'essai sont retirés, et
  `generer-icones.py` (nouveau, dans le dossier) régénère en une seconde tout ce
  qui en dérive (transparent, logo de l'en-tête, favicons, icône Windows). Il
  demande Python avec Pillow, numpy et scipy, donc c'est un outil de Claude, pas
  de ton PC. ⚠️ Mon estimation annoncée (« environ 1,8 Mo ») était fausse : le
  zip passe de 2,93 Mo à **2,37 Mo** (mesuré ; le nouveau logo de l'en-tête, les favicons, la nouvelle icône et l'archive de l'ancien logo y ajoutent environ 0,2 Mo). Pour descendre à environ 1,8 Mo, il faudrait aussi retirer la version transparente (0,56 Mo), que le script régénère ;
- **En-tête refait d'après la maquette validée le 30/09** (demande de
  l'utilisateur, « garder un logo de bonne qualité et faire ce que nous avions
  fait plus tôt ») : « Forge Armory » en titre, « Destiny 2 Build Analyzer · par
  Orynick/Orygamer » en sous-titre, logo à gauche dont le CERCLE va du haut du
  « F » au bas des lettres du sous-titre. SEUL le texte de l'en-tête change :
  `productName`, titre de la fenêtre, exports et clés de stockage restent
  « D2 Build Analyzer » (précaution de la TODO, section 12).
  - Nouveau composant `EnTeteApp.tsx` et nouvelle fonction pure
    `lib/enTete/placementLogo.ts` : la taille et la position du logo sont
    **mesurées dans l'appli, au moment de l'affichage**, dans la police
    réellement utilisée (encre exacte du « F » et des lettres du sous-titre via
    `measureText`, ligne de base via un repère invisible), puis recalculées
    quand les polices finissent de charger et quand la fenêtre change de taille.
    Plus besoin de recaler à la main pour Segoe UI sous Windows ;
  - vérifié en exécutant la VRAIE fonction (traduite telle quelle) avec le vrai
    CSS de l'appli, sur trois polices de formes différentes, et en mesurant
    ensuite les pixels du rendu : écart de 0,12 à 0,20 px (DejaVu Sans,
    Liberation Serif) et de 0,9 px (Liberation Sans, décalage uniforme en haut
    et en bas, probablement dû au calage des lettres sur les pixels) ;
  - **logo de l'en-tête en haute définition** : `public/logo-forge-armory.png`
    passe de 258 × 288 à 484 × 540 px, soit environ 8 fois la taille
    d'affichage (~67 px) : net même sur un écran très dense ou en zoomant ;
  - l'en-tête d'une ligne mis en place plus tôt dans la journée (logo à côté de
    « D2 Build Analyzer ») est remplacé ; l'ancien en-tête d'origine
    (Cryptarque + Spectre) reste archivé dans `ancien-logo/`.
- **Outil de la liste de tests** : il daterait désormais avec l'heure de Paris et
  non celle du serveur (en retard de deux heures, il datait la liste de la
  veille après minuit) ;
- **Liste de tests** : section « v0.3.0 (suite 2) » en tête, avec une note sur la
  mémoire d'icônes de Windows.

## 30/09/2026 — v0.3.0 (suite, même version)

**Résultats de test de la v0.3.0** (PDF coché renvoyé) : validés — installateur,
données conservées, connexion, Inventaire et Mon Build, exports JPEG/PNG/PDF,
copie en texte, boutons des Loadouts, sélecteur de Bibliothèque. L'échec de
connexion du début (« PSN did not respond before timeout ») venait de Sony :
même erreur sur bungie.net et en mode développeur ; la connexion a ensuite
fonctionné. Deux problèmes restent, tous deux **sans lien avec Electron**
(même comportement avec `npm.cmd run dev`) : « Équiper » échoue sur certains
objets, et la session expirée n'est pas signalée en cours d'usage.

**« Équiper » : `DestinyItemNotFound` (1623) sur `TransferItem`, corrigé.**
Symptôme : « Transfert échoué (500) » sur certaines armes (légendaires et
exotiques), 8 échecs sur 8 en équipant un build depuis les Loadouts.
- Cause : le journal montre que l'erreur 1623 a eu DEUX causes opposées.
  (1) L'objet est DÉJÀ sur le personnage ciblé : `TransferItem` ne tire que
  depuis le coffre, donc rien à tirer (constat du 05/08, « 8 sur 8 »).
  (2) L'objet n'existe plus (cas « Signal perdu », 24/08). Le code du 24/08
  traitait 1623 comme une vraie erreur et n'avalait que 1632 : il réglait (2)
  et **régressait sur (1)**. Hypothèse la plus probable du symptôme actuel,
  non prouvable ici (pas d'accès à l'API réelle de Bungie) ; la correction
  couvre aussi les autres cas.
- Correction (`equiper.ts`) : **lire où est l'objet avant d'agir** au lieu de
  tenter à l'aveugle. Nouvelle `localiserObjet` (`GetItem`, composants 300 et
  307 ; 307 = ItemCommonData, indispensable pour `location` et
  `transferStatus`, confirmé par la documentation de Bungie) : position
  actuelle, personnage porteur, équipé ou non. Puis : introuvable → message
  clair, rien de tenté ; déjà sur la cible → aucun transfert (et rien à faire
  s'il y est déjà équipé) ; dans le coffre → tirer ; sur un autre personnage →
  envoyer au coffre puis tirer ; équipé sur un autre personnage → refusé avec
  un message clair (l'API l'interdit) ; au courrier → message clair ; lecture
  impossible → ancien comportement prudent, en avalant cette fois 1632 ET
  1623 (l'équipement dira alors la vérité).
  `transfererObjet` accepte `versCoffre` (envoyer au coffre depuis le
  personnage porteur). Son ancien commentaire (« depuis le coffre ou un autre
  personnage ») était faux et est corrigé. Signature d'`equiperObjet`
  inchangée : aucun appelant modifié.
- Vérifié avec un faux serveur Bungie sur 10 situations : coffre, déjà sur la
  cible, autre personnage, équipé ailleurs, déjà équipé sur la cible,
  introuvable, courrier, lecture impossible avec 1623 au transfert, lecture
  impossible avec autre erreur, plus de place. **Le test a révélé un défaut
  de mon premier jet** (un objet au courrier du personnage ciblé passait à
  l'équipement) : corrigé, 10/10.
- **Non vérifié** : le comportement réel de l'API de Bungie (aucun accès) ;
  les champs lus sont ceux de la documentation officielle.

**Expiration de session : désormais détectée pendant l'usage.** Jusqu'ici,
l'expiration n'était constatée qu'au démarrage et au clic sur « Tester la
connexion » : appli ouverte plus d'une heure, le bloc de connexion restait
sur « ✅ connecté » jusqu'à la première action en échec.
- `DashboardPage.tsx` : trois déclencheurs — vérification toutes les 15 s,
  retour sur la fenêtre (le minuteur du navigateur peut avoir dormi), et un
  signal émis par toute action qui bute sur l'expiration (`oauth.ts` :
  `signalerSessionExpiree`, `EVENEMENT_SESSION_EXPIREE`, émis avant de lever
  `SessionExpiree`, donc aussi depuis « Équiper »). Même bascule que la
  déconnexion manuelle, plus la bannière ⏳ ;
- le bouton de test « ⏳ Simuler l'expiration (dev) » ne fait plus basculer
  l'interface lui-même : il périme seulement le jeton, et la bannière doit
  apparaître toute seule sous 15 s. Sans ce changement, il masquait
  précisément l'absence de détection ;
- vérifié avec un faux navigateur (7/7) : session valide sans effet, jeton
  expiré détecté par le minuteur, par le retour de fenêtre et par le signal,
  pas de double bascule, jeton rafraîchissable ignoré.
  Interprétation de la demande (« le bloc de connexion n'affiche plus
  l'expiration de la session ») : la bannière d'expiration ; si une autre
  information était attendue (durée restante, par exemple), elle reste à
  ajouter.

**Liste de tests** : section « v0.3.0 (suite) » en tête (ordre
anti-chronologique) avec les scénarios d'équipement et d'expiration ; la
ligne « en attente de PlayStation Network » est retirée (résolu) ; l'ancien
test « Équiper » est remplacé.

## 30/09/2026 — v0.3.0

**Tests** : toute la v0.2.9 est validée par l'utilisateur, y compris les
trois colonnes Aspects/Fragments de l'export ; sections archivées.

**Mise à niveau d'Electron** (étape 2 de l'ordre de marche de
l'utilisateur ; opération isolée, rien d'autre ne change) :
- `electron` `^32.0.0` → `^44.5.1` ; `electron-builder` `^25.0.0` →
  `^26.15.3` (version stable recommandée par `npm audit` ; la v27 n'existe
  qu'en préversion et impose ses propres migrations) ;
- analyse de `npm.cmd audit` (18 vulnérabilités) : Electron 32 = 37 failles
  élevées DANS le logiciel (dont en-têtes injectés dans les protocoles
  personnalisés et `webRequest`, que le logiciel utilise) ;
  `electron-builder`, `tar` (critique), `extract-zip`, `node-gyp` = outils
  de FABRICATION seulement ; `vite`/`esbuild` = serveur de développement
  seulement (modérée) ; `react-router` (modérée, cas non utilisés). Ces deux
  derniers restent, à traiter en étapes séparées ;
- **changements incompatibles d'Electron 33 à 44 passés en revue un par un
  contre le code** (documentation officielle) : aucun ne touche le
  logiciel. Protocole interne déjà en `protocol.handle` (v33) ; filtre
  `webRequest` non vide (v35) ; aucune option de ligne de commande (v36) ;
  fenêtres ouvertes refusées ou envoyées au navigateur (v39) ; presse-papiers
  par l'API standard `navigator.clipboard`, pas le module d'Electron retiré
  (v40, v44) ; boîte d'enregistrement avec dossier explicite (v43) ; pas de
  rendu hors écran (v42), pas de `net.request` (v44). Deux changements
  favorables : depuis la v42, Electron se télécharge au premier lancement
  et non plus à l'installation (l'avertissement `allow-scripts` disparaît) ;
  la v44 abandonne Windows 32 bits (à vérifier chez l'utilisateur) ;
- `electron-builder` 25 → 26 : changements portant sur la signature et les
  dépendances mal rangées ; configuration du projet non concernée
  (installateur NSIS sans signature, Electron en dépendance de
  développement) ;
- `package-lock.json` à régénérer chez l'utilisateur (`npm.cmd install`) :
  impossible ici, sans accès au registre npm ;
- `README.md` : commandes en `npm.cmd`, téléchargement d'Electron au
  premier lancement, Windows 64 bits requis ; `TODO.md` et `A-TESTER.pdf`
  mis à jour (procédure particulière et 11 vérifications de
  non-régression).

**Résultat de `npm.cmd audit` chez l'utilisateur après la mise à niveau** :
4 vulnérabilités au lieu de 18. Plus aucune liée à Electron ni aux outils
de fabrication (la critique, `tar`, comprise). Restent `vite`/`esbuild`
et `react-router`/`react-router-dom`, prévus en étapes séparées (le total
annonce « 3 modérées, 1 élevée » sans préciser laquelle est élevée).

**Logo « Forge Armory »** (candidat pour le futur nom de l'appli, TODO
section 12) : image fournie par l'utilisateur rangée dans
`ressources-installateur/forge-armory/` avec deux déclinaisons (logo
complet recadré ; papillon seul), une icône Windows d'essai combinée et un
favicon d'essai. Rien n'est encore utilisé (l'icône actuelle ne change pas,
le dossier n'est pas embarqué). Tests de lisibilité : logo complet lisible
dès 48 px mais illisible à 16 px ; papillon seul net jusqu'à 16 px ;
d'où l'icône combinée (papillon jusqu'à 32 px, logo complet au-delà). Dans
l'appli : logo **à gauche** du nom, choisi par l'utilisateur, en version à
fond transparent (ajoutée), dimensionné pour que son cercle aille du haut
du « F » de « Forge » au bas des lettres du sous-titre (aperçu : 0,13 px
d'écart en haut et en bas). Détail dans le `LISEZ-MOI.md` du dossier.

**Test de la v0.3.0, premiers résultats** : l'installateur se fabrique, le
logiciel s'installe et s'ouvre avec son icône et « v0.3.0 », les builds,
réglages et cache sont conservés. La connexion Bungie échoue avec le message
« PSN did not respond before timeout » (délai dépassé entre les serveurs de
Bungie et ceux de Sony). Même erreur sur bungie.net dans le navigateur et
avec `npm.cmd run dev` : cause extérieure à l'appli et à Electron. Tests
dépendant de la connexion en attente de son rétablissement.

**Liste de tests** : récapitulatifs « ✅ v0.2.8 / v0.2.9 entièrement
validées » retirés à la demande de l'utilisateur ; règle inscrite en tête
de la source (`documentation/sources/A-TESTER.md`) : ordre
anti-chronologique (version la plus récente en haut), et plus de
récapitulatif laissé une fois une section archivée.

## 30/09/2026 — v0.2.9

Nouvelle version, à la demande de l'utilisateur (« on peut se détacher de
la 0.2.8 »).

**Nouveau : type de munitions des armes** (TODO section 1 ter, avancée à la
demande de l'utilisateur). Icône principales / spéciales / lourdes, juste à
droite de l'icône d'élément, PARTOUT : vignettes de l'Inventaire et de Mon
Build, fenêtres de détails d'une arme, fiche « 👁 Voir », exports JPEG/PNG/PDF
(entre l'élément et l'anti-champion) ; écrit dans la copie en texte.
- `doctrine.ts` : `obtenirTypeMunition`, lecture UNIQUE dans le Manifest
  (`equippingBlock.ammoType` : 1, 2, 3 ; toute autre valeur → rien
  d'affiché). Lu à partir de l'`itemHash` au moment de l'affichage : marche
  aussi pour les builds enregistrés avant et les builds importés. 7 cas
  testés ;
- `IconeMunition.tsx` : table UNIQUE `MUNITIONS` avec les couleurs choisies
  le 28/09 (principales `#e8e8e5`, spéciales `#7fd97f`, lourdes `#9d6bff`) ;
  tracés exportés pour l'export infographique ;
- `RenduTextePerk.tsx` : composant partagé `IconeMunitionArme`, sur le
  modèle d'`IconeElementArme`, même taille que l'élément (16 px) ;
- `fiche.ts` : champ `munition` ; `exportFiche.ts` : emplacement de même
  taille que l'élément. Mesuré dans l'export : ordre type → élément →
  munitions → anti-champion, même centre vertical, même position d'une arme
  à l'autre.

**TODO** : ordre de marche de l'utilisateur (tests de la v0.2.9, puis mise à
niveau d'Electron, puis modification des perks et mods) ; défauts des
fenêtres de détails des armes et armures notés pour ce dernier chantier
(mémentos affichés — en gardant « Memento Mori » —, « résonance de
Souvenance », doublons dans les mods utilisables, peut-être liés à la pièce
maîtresse). **README** : ligne ajoutée à l'état général.

**Codé ensuite le même jour (même version 0.2.9, pas encore testée)**, à la
demande de l'utilisateur, les trois points qu'il avait d'abord notés pour
après Electron :
- **boutons « Renommer », « Décrire » et « Icône » des Loadouts** :
  inopérants dans le logiciel installé, car ils utilisaient
  `window.prompt`, qu'Electron n'affiche pas. Remplacés par une zone de
  modification dans la carte du build (Entrée valide, Échap annule ; la
  description est multiligne). Le sélecteur d'icônes de l'enregistrement
  est extrait (`SelecteurIconeLoadout`) et réutilisé : mêmes choix aux deux
  endroits. « Supprimer » (`window.confirm`, géré par Electron) n'est pas
  concerné ;
- **fiche « 👁 Voir »** : l'élément n'est plus écrit ; sous le nom de chaque
  arme, rangée d'icônes dans le même ordre et avec les mêmes sources que
  l'export (type d'arme, élément, munitions, anti-champion), emplacements
  de taille fixe pour garder les colonnes alignées ;
- **export : Aspects et Fragments sur deux colonnes**, lues de haut en bas
  puis colonne suivante ; les quatre colonnes ont la même largeur (190 px)
  et s'alignent sous les colonnes des compétences. Mesuré : bloc Doctrine
  de 282 à 232 px sur la fiche « Tommy », aucun nom coupé, miniatures
  centrées ; seuls des noms inventés de plus de 28 caractères passent sur
  deux lignes, proprement.

**Tests : la v0.2.9 est validée** par l'utilisateur (PDF coché renvoyé,
21 cases : icônes de munitions partout, boutons des Loadouts, icônes dans la
fiche « 👁 Voir », suite 0.2.8), sauf la disposition des Aspects et
Fragments, remplacée par une nouvelle consigne : **trois colonnes de même
largeur**, une pour les Aspects, deux pour les Fragments (`exportFiche.ts` :
grille de 3 colonnes, les Fragments s'étendent sur deux, même écart de 16 px
partout, donc chaque colonne de fragments a la largeur de celle des
Aspects). Mesuré : 3 colonnes de 259 px, Aspects sur 2 lignes et Fragments
sur 3 (y compris avec 6 fragments), aucun nom coupé même avec des noms très
longs, bloc Doctrine de 232 px. Effet noté : ces colonnes ne sont plus
alignées sur les deux colonnes des compétences au-dessus — **accepté par
l'utilisateur** (30/09/2026) : ne pas le « corriger ». Sections de tests
archivées.

**`npm.cmd ci` validé par l'utilisateur** (reproductibilité : 479 paquets
installés à l'identique). Ce qu'il a signalé (18 vulnérabilités, paquets
obsolètes, avertissement `allow-scripts` pour `electron` et `esbuild`) est
noté dans la TODO, à traiter avec la mise à niveau d'Electron.

**TODO triée** (demande de l'utilisateur : « enlever de la TODO ce qui a été
fait ; le CHANGELOG contient tous les changements »). De 893 à 421 lignes :
ne restent que les chantiers ouverts, reclassés (🟡 Important : audit
externe / Electron, perks et mods avec les fenêtres de détails, agent IA,
tests automatiques du scoring ; 🔵 Confort : sections 5 à 15), l'ordre de
marche du 30/09 en tête, et deux pistes abandonnées citées en une ligne
pour ne pas les reproposer. Numéros 10 (patch notes) et 12 (Forge Armory)
conservés, car cités ailleurs. Nouveaux points tirés des sections
terminées : lancer enfin `scripts/tester-avec-fixtures.mjs` (section 4) ;
distinguer les deux lance-grenades par le type de munitions (section 14).
Copie intégrale de l'ancienne TODO : `documentation/todo/ARCHIVE-TODO-2026-09-30.md`.

**TODO, notes pour après Electron** (section 2 bis) : boutons « Décrire »,
« Icône » et « Renommer » des Loadouts inopérants dans le logiciel installé
— cause identifiée : `window.prompt`, non pris en charge par Electron ;
fiche « 👁 Voir » avec les icônes de type d'arme et d'élément dans l'ordre
de l'export ; fragments sur deux colonnes dans l'export (aperçu : 50 px
gagnés avec 5 fragments). Audit : `npm.cmd ci` plutôt que `npm ci` sous
PowerShell.

## 30/09/2026 — v0.2.8 (suite, même version)

**Mêmes règles pour la fiche « 👁 Voir » et la copie en texte, artefact
justifié** (demandes de l'utilisateur, après validation des exports :
11 tests sur 11, ornements bien écartés ; section archivée).
- `fiche.ts` : UNE liste nettoyée par pièce (`perks`), commune à l'export,
  à la fiche « 👁 Voir » et à la copie en texte : sans armature ni
  particularité d'origine (champs `armature` et `origine` à part), sans
  cosmétiques, « Arme façonnée », archétypes ni « Amélioration d'armure » ;
  doublons regroupés (champ `nombre`, affiché « ×2 ») ; plus de limite à 8.
  Le champ `perksExport` disparaît. Mon Build et l'Inventaire, qui ont leur
  propre tri, ne changent pas ;
- `doctrine.ts` : « Emplacement de souvenance vide » écarté comme
  l'emplacement de mémento vide (nom exact, et mot « souvenance » dans le
  type ou la catégorie du plug) ; 18 cas testés ;
- `FicheBuild.tsx` : lignes « Armature : … » et « Origine : … » sous le
  nom de chaque arme, pastilles nettoyées avec « ×2 » ;
- copie en texte : lignes « Armature » et « Origine », puis « Perks » /
  « Mods » nettoyés avec « ×2 » ;
- `exportFiche.ts` : perks d'artefact en rangées équilibrées, les plus
  courtes en premier (7 → 3 puis 4 ; 8 → 4 puis 4), chaque rangée étirée
  sur toute la largeur comme un texte justifié ; une rangée est ajoutée si
  des noms longs risquent de déborder. Mesuré sur la fiche « Tommy » :
  3 puis 4 puces, chaque rangée à 762 px (toute la largeur), aucun nom
  coupé.

## 29/09/2026 — v0.2.8 (suite, même version)

**Fiches exportées (JPEG/PNG/PDF) : nettoyage, disposition, texte agrandi**
(décisions de l'utilisateur du 28/09/2026, codées le 29/09 ; version
conservée en 0.2.8).
Portée : exports uniquement ; fiche « 👁 Voir », copie en texte, Mon Build
et Inventaire inchangés (ils lisent toujours `perks` /
`obtenirPerksArmeNommes`).
- `doctrine.ts` : `obtenirPlugsDetailles` (tous les plugs d'une pièce,
  avec leur nature) et `obtenirArmatureArme` (armature lue exactement
  comme pour l'anti-champion). Écartés de l'export : cosmétiques
  (ornements et revêtements, aussi reconnus par le TYPE et la CATÉGORIE du
  plug, car certains ornements n'ont aucun mot-clé dans leur nom ;
  emplacement de mémento vide), « Arme façonnée », les 12 archétypes
  d'armure (liste confirmée en jeu), « Amélioration d'armure ». Gardés :
  « Mod de classe », « Mods d'arme », réglages « +Super / -Santé ».
  « Memento Mori » (vrai perk, As de Pique) protégé : le mot « memento »
  n'est cherché que dans le type et la catégorie, jamais dans le nom.
  16 cas testés, dont les noms relevés sur l'export réel de
  l'utilisateur ; types et catégories des ornements NON vérifiés sur de
  vrais objets (pas de Manifest ici) ;
- `fiche.ts` : champs `armature` et `perksExport` (liste nettoyée, sans
  la limite de 8), calculés seulement avec le Manifest ; sans lui,
  l'export retombe sur l'ancien affichage ;
- `exportFiche.ts` : sous la ligne d'icônes de chaque arme, l'armature
  puis la particularité d'origine (bord gauche aligné sur les icônes,
  icône et texte centrés, mesuré) ; « Perks actifs » ne garde que les
  vrais perks ; mods en double regroupés (« Détecteur de munitions
  lourdes ×2 ») ; textes agrandis (étiquettes 7,5 → 9 px, mods 8 → 10 px,
  perks 10 → 12 px, noms d'arme 15 → 16,5 px, etc.), colonne du nom
  d'arme élargie de 336 à 366 px. Mesuré sur une fiche calquée sur
  l'export réel « DPS/heal Tommy Crackshot » : aucun texte ne gagne de
  ligne (les deux cas trouvés en cours de route, un nom d'arme et les mods
  d'un casque, ont été corrigés) ; page de 1591 à 1691 px de haut. Seule
  exception : les 7 perks d'artefact passent sur deux rangées (ils ne
  tiendraient sur une seule qu'en dessous de 9 px).

**Tests** : bloc Connexion et sélecteur Build Analyzer / Bibliothèque
validés par l'utilisateur (10 cases), section archivée.

**TODO** : nouveau chantier « Renommer l'application : Forge Armory »
(section 12, plus tard ; peut-être « Forge Armory - Build Analyzer »).
Inventaire de ce qu'il faut renommer, et surtout de ce qu'il ne faut PAS
renommer : clés de stockage des builds, des pondérations et du cache du
Manifest, `appId` de l'installateur ; piège noté : changer `productName`
change le dossier de données du logiciel installé (appli qui repartirait
vide sans précaution).
Vérifié ensuite à la demande de l'utilisateur : le renommage n'impose
aucun changement de clé OAuth (clé, adresse de retour, origine déclarée et
adresse interne indépendantes du nom de l'appli).

## 28/09/2026 — v0.2.8

**Vérification de cohérence de la version `0_2_8-3`** (demande de
l'utilisateur ; version conservée en 0.2.8). Cette version réunit le
travail de plusieurs conversations : elle contient tout ce qui avait été
livré ici (partage du build, pondération personnalisée, export, TODO et
décisions sur les munitions et les patch notes), plus la Bibliothèque, le
nouveau bloc Connexion (nom Bungie `pseudo#1234`), le rangement de la
knowledge-base (`26_ARMES_ARMURES.md`, `27_PATCHNOTES/`,
`NOTE_RATTACHEMENT.md` fusionnée dans l'index). Vérifié : aucun ajout de la
0.2.8 perdu (bloc de partage, pondération, bannière de session expirée),
imports et fichiers Electron corrects, aucune erreur de types nouvelle ;
la clé API n'apparaît que dans `.env.local`, exclu de Git par
`.gitignore`. Point signalé, non modifié : la TODO (section 9) et le code
ne portent pas encore la reprise du chantier « Export DIM » décidée le
28/09 dans une autre conversation.

- `knowledge-base/27_PATCHNOTES/LISEZ-MOI.md` complété avec le
  récapitulatif du chantier : objectif, qui produit les fiches, format
  envisagé, mise en route, exclusion de l'archive « invité ».
- `TODO.md` : nouvelle section 1 quater « Export infographique :
  nettoyage des listes, disposition, police » (décisions du 28/09 non
  codées : perks et mods à garder ou supprimer, armature et particularité
  d'origine sous la ligne d'icônes, texte agrandi sans casser la mise en
  page, question ouverte sur la fiche « 👁 Voir ») ; ajoutée aux
  prochaines étapes ; section 7 (icônes de munitions) mise à jour.

**Bloc Connexion resserré et sélecteur Build Analyzer / Bibliothèque**
(demande de l'utilisateur, version laissée en 0.2.8 à sa demande).
- « Compte : » passe à gauche des boutons, sur la même ligne, suivi du
  **nom Bungie** au format `pseudo#1234`. Il est lu dans la réponse de
  `GetMembershipsForCurrentUser`, déjà appelée (aucun appel réseau en
  plus) : d'abord sur le compte Bungie.net, sinon sur le premier compte
  Destiny qui le porte. Le code, un nombre côté Bungie, est complété
  avec des zéros (`#0042`). S'il manque, l'affichage retombe sur le nom
  de plateforme, comme avant. Nouvelle fonction `recupererComptesBungie`
  dans `api.ts` ; `recupererMembershipsActuels` s'appuie dessus.
- Supprimés de l'affichage : personnages, niveaux de lumière, nombre
  d'objets du coffre. Les personnages restent chargés (Mon Build et les
  Loadouts en ont besoin).
- Bouton « Tester la connexion (profil + coffre) » renommé « Tester la
  connexion ». La bannière de session expirée sort de la ligne des
  boutons, où elle se glissait au milieu d'eux.
- **Sélecteur** sous le bloc Connexion : « Build Analyzer » (par défaut, à
  chaque lancement, sans mémorisation) ou « Bibliothèque ». Même style de
  pastilles que « Contexte du build ». La vue Build Analyzer est
  **masquée, pas retirée**, quand la Bibliothèque s'affiche : un
  aller-retour ne perd ni l'inventaire chargé, ni la doctrine, ni le
  Manifest. Les panneaux latéraux (Solo sans mourir, Loadouts) sont masqués
  avec elle. Le crédit d'auteur reste visible dans les deux vues.
- **Bibliothèque** (`src/components/Bibliotheque.tsx`) : page provisoire
  « en construction » qui annonce son contenu et indique si le Manifest
  est chargé. Consignes et découpage dans la section 11 de la TODO.
- Guides de démarrage et README mis à jour (étape « Tester la
  connexion »).

**Knowledge-base** : nouvelle fiche `knowledge-base/26_ARMES_ARMURES.md`
(liens transmis par l'utilisateur) — light.gg retenu comme référence de
consultation (fiable, lisible par un agent IA, adresse construite sur le
hash du Manifest) ; SafeMoonD2, lancé le jour même, classé « à
surveiller » (illisible pour un agent, réputation non établie). Les données
ne sont pas recopiées, seule la carte des usages est stockée. Renvois
ajoutés dans `23_RESSOURCES_EXTERNES.md` et `00_INDEX.md`. Aucun changement
de code.

**Knowledge-base : rangement** (niveau 1, demande de l'utilisateur).
Aucune valeur de jeu modifiée, aucun changement de code.
- `00_INDEX.md` réécrit : un seul tableau par famille couvrant toutes les
  fiches (13 à 27 n'y figuraient que dans des notes datées, 24, 25 et le
  récapitulatif de la 9.7.0 n'y figuraient pas du tout), colonne
  « Code » indiquant les fiches dont le code s'inspire ou est généré,
  section « Langue ». Doublons retirés : `02_SUBCLASSES_ALL.md` y était
  listé trois fois ; morceau de tableau orphelin (07, 09) réintégré.
  L'historique des ajouts est conservé en bas, tel qu'écrit.
- Ligne périmée retirée de l'historique de l'index : « ℹ Prochain Iron
  Banner (set Iron Battalion) : **28 juillet 2026** ».
- `NOTE_RATTACHEMENT.md` supprimée après fusion dans l'index. Elle était
  périmée (« 14 fichiers », « rien n'est branché au code ») ; sa seule
  piste encore ouverte (croiser les notes des bonus de set de la fiche 05
  avec les sets réels du Manifest) est reportée dans le tableau de
  l'index.
- Archétypes d'armure : la table des 12 noms français confirmés en jeu
  (25/08) est fusionnée dans la table anglaise de `08_GAME_MECHANICS.md`.
  Cette fusion résout les deux noms anglais restés inconnus dans la
  fiche 23, par la paire de stats : Maître = Powerhouse,
  Escarmoucheur = Skirmisher (à confirmer par le nom anglais en jeu).
  `23_RESSOURCES_EXTERNES.md` garde un renvoi et la leçon retenue ;
  l'avertissement « Grenadier absent » y est marqué résolu. Renvoi de la
  TODO mis à jour.
- Nouveau dossier `knowledge-base/27_PATCHNOTES/` avec son `LISEZ-MOI.md`
  (conventions du chantier patch notes). Numéro 27 et non 26 comme prévu
  dans la TODO, pris par `26_ARMES_ARMURES.md` ; TODO corrigée.
  `monument_of_triumph_recap.md` y est rangé sous le nom
  `2026-06-09_9.7.0_RECAP-AMI.md`.
- Fichiers 14 à 20 laissés volontairement en `.txt` (raison notée dans
  l'index : en `.md`, les lignes de ces sauvegardes brutes seraient
  fusionnées à l'affichage).

**Tests : v0.2.8 entièrement validée** par l'utilisateur (PDF coché
renvoyé, 13 cases sur 13 : export, bloc « Partage du build »,
pondération personnalisée). Section archivée ; restent seulement les 3
tests « au fil de l'eau ».

**TODO** : note ajoutée pour plus tard (demande de l'utilisateur) —
répertoire des transcriptions des patch notes de Bungie dans
`knowledge-base/` (section 10 de la TODO, pistes et questions à trancher).
Décisions de l'utilisateur ajoutées le même jour : fiches produites par
Claude, en français et en anglais, depuis la sortie de La Forme Finale ;
forme retenue : fiches rédigées (pas de copie intégrale des textes de
Bungie, protégés par le droit d'auteur), avec liens vers les sources.
Ordre précisé ensuite : anti-chronologique (les plus récentes d'abord,
en remontant jusqu'à La Forme Finale) ; la fiche d'essai devient donc
celle de la mise à jour la plus récente.

**TODO** : nouveau chantier « Afficher le type de munitions des armes »
(section 1 ter), à faire quand le moteur de dégâts sera prêt à être testé.
Icônes déjà présentes (`IconeMunition.tsx`, identiques aux SVG fournis à
nouveau, vérifié) ; source prévue : `equippingBlock.ammoType` du Manifest,
à confirmer sur de vraies armes ; icône à droite de l'élément.
Portée confirmée ensuite par l'utilisateur : partout où l'icône d'élément
d'une arme apparaît (Mon Build, Inventaire, fiche « 👁 Voir », export).
Couleurs choisies ensuite par l'utilisateur, après un aperçu comparé de
quatre variantes (contrastes mesurés sur les fonds réels) : principales
`#e8e8e5`, spéciales `#7fd97f`, lourdes `#9d6bff` (violet moyen, 4,9 à
5,5:1, au lieu du violet foncé du jeu jugé trop peu lisible).

**Retours de tests** : v0.2.7 confirmée par l'utilisateur (miniatures des
Aspects et Fragments dans l'export). Section archivée.

**Nouveau : bloc « Partage du build »** (demande de l'utilisateur), sous
l'Artefact : exporter le build EN COURS sans l'enregistrer dans les
loadouts. Cinq boutons : fichier JSON réimportable, texte pur, JPEG, PNG,
PDF. Bloc repliable comme les autres blocs principaux, champ « Nom du
build » (vide : « Mon build » ; le nom interne du build en cours n'est pas
fiable, il reste celui du build de démonstration).
- `components/BarrePartage.tsx` (nouveau) : la barre de partage est
  EXTRAITE de la fiche « 👁 Voir » et partagée par la fiche et le nouveau
  bloc, qui se comportent donc à l'identique ;
- `lib/loadouts/stockage.ts` : `construireLoadout` (extrait de
  `enregistrerLoadout`) construit un loadout en mémoire, et
  `serialiserUnLoadout` (extrait de `exporterUnLoadout`) produit le
  fichier d'échange. Le fichier partagé sans enregistrer est donc
  strictement identique à celui d'un build enregistré ;
- `lib/telechargement.ts` (nouveau) : téléchargement d'un fichier,
  extrait de `PanneauLoadouts.tsx`.

**Nouveau : pondération personnalisée des piliers** (demande de
l'utilisateur), dans le bloc « 0. Contexte du build » : réglages nommés
(poids en % entiers, total obligatoirement égal à 100), menu pour choisir
le réglage actif ou revenir en « Automatique (selon le contexte) »,
suppression. Un nom déjà utilisé remplace le réglage existant.
- `lib/scoring/ponderations.ts` (nouveau) : stockage local, validation,
  réglage actif (préférence globale, pas une propriété de chaque build) ;
- `evaluerBuild` : paramètre facultatif `poidsPersonnalises`, qui
  remplace le poids de chaque pilier juste avant la somme du score global,
  et nulle part ailleurs. Scores des piliers inchangés ; le contexte règle
  toujours la pondération des statistiques du pilier Statistiques ;
  `POIDS_PILIERS` inchangée ;
- vérifié : sans réglage, score identique à l'ancien calcul sur les 4
  contextes du build de démonstration ; réglage « 100 % Statistiques » =
  score du pilier Statistiques ; réglage « 20 % partout » = moyenne des 5
  piliers ; saisies invalides refusées avec un message clair.

**Export infographique** (demandes de l'utilisateur) :
- stats du titre ARMURE plus claires : nom en gris clair, valeur en blanc
  et en gras, taille légèrement augmentée ;
- icône anti-champion SANS cadre, comme dans Mon Build (16 px au lieu de
  12), dans un emplacement de même hauteur : alignement avec le type
  d'arme et l'élément vérifié par mesure (même centre vertical).

**TODO** : nouveau chantier « Modifier les perks et les mods des armes et
armures » (sauf ornements, revêtements et compteurs), indispensable à
terme mais pas bloquant ; deux niveaux à trancher (simulation dans
l'appli, application en jeu) et points de conception notés. Lignes
périmées mises à jour (logiciel installable confirmé, partage et
pondération faits).

**Documentation mise à jour** :
- `README.md` : état général (Manifest automatique, fiche, partage,
  pondération, blocs repliables, logiciel installable), nouvelle section
  « Pondération personnalisée », exports réservés au logiciel installé ;
- `GUIDE-DEMARRAGE.md` : étapes périmées corrigées (Manifest rechargé
  automatiquement, bloc « Personnage & Doctrine » et sous-classes
  chargées automatiquement, équipement qui fonctionne) ; nouvelles
  étapes 12 (enregistrer, revoir, partager) et 13 (pondération) ;
  « Ce qui ne fonctionne pas encore » réécrit (le bouton Équiper
  n'échoue plus depuis le 05/08) ;
- `GUIDE-DEMARRAGE-INVITE.md` : mêmes corrections, tour de l'appli
  complété (Artefact, Partage, Loadouts, Contexte), échange d'un build
  avec un ami expliqué.

## 27/09/2026 — v0.2.7

**Retours de tests** : toute la v0.2.6 est confirmée (icônes de type
d'arme, d'élément et anti-champion alignées dans l'export ; export JPEG ;
non-régression des icônes de l'appli). Section archivée dans
`documentation/tests/ARCHIVE-TESTS-2026-09-27.md`.

**Export de la fiche : miniatures des Aspects et Fragments** (demande de
l'utilisateur). Dans le bloc DOCTRINE, chaque aspect et chaque fragment
est affiché sur sa ligne, « miniature + nom », au lieu d'une liste de noms
séparés par des points. Icônes déjà présentes dans les données de la fiche
(résolues via le Manifest, comme celles de la Super et des compétences) :
aucun changement de `fiche.ts`, seule la présentation évolue
(`exportFiche.ts`, fonction `liste`). Mesuré dans Chromium : miniatures
des Aspects alignées sur la colonne Super/Grenade/Saut, celles des
Fragments sur la colonne Mêlée/Compétence de classe ; même centre vertical
pour chaque miniature et son nom ; une miniature introuvable laisse sa
case neutre sans décaler les noms. La page gagne environ 100 px de hauteur
(une ligne par fragment).

## 27/09/2026 — v0.2.6

**Retours de tests** : PDF coché relu automatiquement (11 cases). Toute la
v0.2.5 est confirmée (export PNG et PDF, fidélité à la v7, anti-champion,
statistiques, bonus de set, aucune donnée technique, lisible sur
téléphone), ainsi que la v0.2.4. Les deux sections sont archivées dans
`documentation/tests/ARCHIVE-TESTS-2026-09-27.md`.

**Export de la fiche : icônes de type d'arme et d'élément** (demande de
l'utilisateur, « attention aux alignements »). Sous le nom de chaque arme :
icône du type d'arme, puis icône officielle de l'élément (qui REMPLACE son
nom), puis icône anti-champion.
- Type d'arme : la reconnaissance (mots-clés, cas des deux lance-grenades
  selon l'emplacement) est EXTRAITE du composant `IconeTypeArme.tsx` dans
  une fonction partagée `trouverFormeTypeArme`, utilisée par l'appli et par
  l'export ; `calculerTailleRendu` est exporté. Comportement de l'appli
  inchangé : vérifié sur 21 types et emplacements, résultats identiques à
  l'ancienne logique ; les badges de diagnostic restent propres à l'appli.
- Élément : icône déjà stockée sur l'arme (`elementArmeIcone`), comme dans
  Mon Build. Nom affiché en repli si l'icône est absente ; si elle ne se
  charge pas, le logiciel la remplace par ce nom (`data-repli`) au lieu de
  la retirer : l'information n'est jamais perdue.
- Alignements : emplacements de taille fixe (type 30 × 22 px, élément
  18 × 22 px, champion 18 × 18 px) centrés sur un même axe. Mesuré dans
  Chromium sur six armes aux formes très différentes (pistolet, arc,
  lance-roquettes, revolver, fusil à fusion linéaire, type absent) : même
  centre vertical pour les trois icônes de chaque ligne, mêmes colonnes
  d'une arme à l'autre.
- Modèle de fiche : `elementIcone` et `typeArme` ajoutés à `PieceFiche`.
  La fiche à l'écran et sa copie en texte gardent le nom de l'élément.

**Export JPEG** (demande de l'utilisateur, ajouté dans la même version
0.2.6) : bouton « 🖼 Image JPEG » à gauche de « 🖼 Image PNG ». Même page,
même capture que le PNG (1800 px de large, indépendante du réglage
d'affichage de Windows), seul l'encodage change ; qualité 92. Côté
logiciel, les trois formats sont décrits dans une table unique
(`FORMATS_EXPORT`, extension `.jpg`) et le canal refuse tout format absent
de cette table. Vérifié avec les mêmes commandes de capture que le
logiciel : JPEG aux bonnes dimensions, aucun pixel nettement différent du
PNG. À noter : le JPEG n'est pas forcément plus léger (grands aplats bien
compressés par le PNG ; essai sans icônes : JPEG 368 Ko, PNG 311 Ko).

## 27/09/2026 — v0.2.5

**Nouveau : export infographique de la fiche d'un build, en PNG ou en PDF**
(demande de l'utilisateur, avec cahier des charges
`CAHIER_DES_CHARGES_EXPORT_V7_POUR_CLAUDE.txt` et maquette
`D2-Build-Analyzer-prototype-infographie-v7.png`). Deux boutons dans la
fiche « 👁 Voir » : « 🖼 Image PNG » et « 📄 PDF ».

Architecture (une seule source de rendu, exigence du cahier des charges) :
- `lib/loadouts/fiche.ts` reste l'unique assemblage des données. Modèle
  étendu de façon centralisée : emplacement brut des pièces, anti-champion
  des armes (fonction existante `obtenirAntiChampion`, avec son cache),
  bonus de set ACTIFS (fonction existante `obtenirBonusSetsActifs`, même
  logique que Mon Build, regroupés par set), icône de l'artefact (même
  méthode que le sélecteur d'artefact) et icônes de ses perks quand elles
  sont connues ;
- `lib/loadouts/exportFiche.ts` (nouveau) : `ficheVersHtml`, qui transforme
  la fiche en une page HTML autonome reproduisant la maquette v7. Aucune
  logique métier dedans ;
- `electron/main.cjs` (canal « fiche:exporter ») : la même page est rendue
  dans une fenêtre invisible, puis capturée (PNG, 1800 px de large comme la
  maquette, indépendant du réglage d'affichage de Windows) ou imprimée (PDF,
  une page aux dimensions exactes). Les deux sorties viennent du même rendu ;
- icônes anti-champion : les tracés de `IconeAntiChampion.tsx` sont
  exportés (`CHEMINS_ICONES_CHAMPION`) et partagés avec l'export, source
  unique.

Fidélité à la maquette : mêmes blocs, même ordre, mêmes proportions
(mesures relevées sur la v7 à 1800 px). Écarts volontaires, tous mineurs :
deux défauts du prototype corrigés (la ligne « Saut » chevauchait
« Aspects » ; les perks d'artefact étaient rognés à gauche) ; libellés
d'emplacement de l'appli (« Arme cinétique », « Marque de classe ») ;
petites icônes devant les mods (le cahier des charges demande les icônes
de mods quand elles existent) ; mention « Champion » supprimée (l'icône
suffit, cahier des charges §4.3) ; contexte masqué s'il est « neutre » ;
un emplacement vide affiche « Aucune arme » / « Aucune pièce » pour garder
la grille régulière. Hauteur adaptée au contenu (la maquette avait une
hauteur fixe avec un grand vide en bas).

Sécurité (les noms peuvent venir d'un build importé) : tout texte échappé ;
seules les icônes de www.bungie.net sont admises (filtrées dans la page,
bloquées aussi par sa politique de sécurité et par une session dédiée en
mémoire qui refuse tout autre accès réseau) ; fenêtre de rendu isolée
(sandbox, aucun pont, aucune navigation) ; canal limité à la fenêtre
principale, format et taille validés, nom de fichier nettoyé ; fichier
écrit uniquement à l'endroit choisi par l'utilisateur ; génération
interrompue proprement au-delà de 30 secondes.

Autres changements :
- repli du nom d'une pièce : « Objet <hash> » remplacé par « Nom
  indisponible » (le hash n'apparaît plus nulle part, y compris dans la
  fiche à l'écran et sa copie en texte) ;
- `nomFichierPropre` extrait de `exporterUnLoadout` (`stockage.ts`) pour
  servir aux deux exports ;
- pont `appBureau` : ajout de `exporterFiche` (preload + déclaration dans
  `oauth.ts`).

Vérifications effectuées ici : typecheck avec types de substitution (aucune
erreur nouvelle, aucune variable inutilisée), syntaxe des fichiers
Electron, imports. Page de rendu testée dans Chromium avec le même
procédé que le logiciel (capture à l'échelle 2 et impression PDF) : PNG et
PDF identiques au lissage près. Cas limites testés avec le vrai
`construireFiche` : build importé piégé (code dans les noms, icône d'un
site tiers), noms absents, pièces manquantes, sans Manifest, sans
artefact : rendu propre, aucun hash, aucune rareté, aucun code exécuté.
**Non vérifiable ici** : le rendu dans Electron lui-même (fenêtre
invisible, capture, impression, boîte d'enregistrement) et les vraies
icônes (pas d'accès Internet) ; c'est le premier test de l'utilisateur
qui le confirmera.

## 27/09/2026 — v0.2.4

**Retours de tests de l'utilisateur** (PDF coché renvoyé, relu
automatiquement dans `documentation/sources/A-TESTER.md` : 54 cases
reportées). Confirmés : toute la v0.2.3 (fiche d'un build, copie en
texte, export, blocs repliables, Doctrine réduite dans Mon Build),
`npm.cmd run build` sans erreur depuis l'audit (la stricte
`noUnusedLocals` passe), la passe d'audit sans régression, et l'export
d'un build seul. L'utilisateur a aussi coché d'office des points liés à
d'anciennes versions. Restent ouverts : l'échange réel d'un build avec un
ami, une vraie expiration de session, le test général Filobscur.

**Corrigé : ordre des pièces dans la fiche d'un build** (signalé par
l'utilisateur). Un build garde ses pièces dans l'ordre où elles ont été
ajoutées ; la fiche les affichait tel quel, alors que Mon Build les trie.
La fiche (et donc sa copie en texte, qui lit les mêmes données) suit
désormais l'ordre de Mon Build : cinétique → énergie → lourde, et casque
→ gants → torse → jambes → marque. Nouvel ordre de référence
`ORDRE_EMPLACEMENTS` dans `data/libellesUI.ts`, tri dans
`lib/loadouts/fiche.ts`.

**Tri de la liste de tests** (demande de l'utilisateur, même jour) :
`A-TESTER.pdf` passe de 9 pages et 96 cases à 1 page et 6 cases. Les 27
sections entièrement validées, et la section « En attente » devenue sans
objet, sont archivées mot pour mot (cases comprises) dans
`documentation/tests/ARCHIVE-TESTS-2026-09-27.md` ; contrôle effectué :
aucune ligne perdue. Les 3 tests anciens encore ouverts sont regroupés
dans une section « Encore ouverts — au fil de l'eau ». ⚠️ Un PDF
antérieur à ce tri ne peut plus être relu (l'outil le refuse, comme
prévu) : c'était sans conséquence, toutes ses coches avaient déjà été
reportées.

**Commentaire corrigé** dans `types/build.ts` : il décrivait les clés de
perks d'artefact au format « idArtefact:slot:tier », périmé ; le format
réel (`clePerk`) est « idArtefact:tier:nomPerk », celui qu'utilise la
fiche. Aucun changement de comportement.

## 27/09/2026 — `A-TESTER` au format PDF

Demande de l'utilisateur : `A-TESTER.md` remplacé par `A-TESTER.pdf`
(A4, 8 pages, cases à cocher, pied de page numéroté). Contenu
strictement identique à la dernière version Markdown. Références mises à
jour dans `README.md`, `TODO.md`, `documentation/LISEZ-MOI.md` et un
commentaire de `src/lib/diagnosticsArchives.ts` ; les mentions de
`A-TESTER.md` dans les entrées précédentes de ce journal sont laissées
telles quelles (traces historiques).

Source conservée, à la demande de l'utilisateur :
`documentation/sources/A-TESTER.md` (texte à modifier) et
`documentation/sources/outil-a-tester-pdf.py` (outil de Claude : demande
pandoc, Python et Chromium, absents du PC de travail).

**Cases cliquables** (demande de l'utilisateur, même jour) : les 93 cases
du PDF sont de vrais champs de formulaire, cochables puis enregistrables
dans le lecteur PDF (Ctrl+S). Les tests déjà confirmés sont pré-cochés
(36). L'outil a deux modes :
- `generer` : produit le PDF depuis la source ;
- `relire` : reporte dans la source les cases d'un PDF rempli renvoyé
  par l'utilisateur, et liste ce qui a changé. Refuse si le PDF ne
  correspond pas à la source (nombre de cases, ou texte d'un test
  différent), pour ne jamais cocher le mauvais test.

Corrigé au passage : pandoc coupait certaines lignes longues au milieu
d'une balise de case ; 3 cases (des tests déjà confirmés) apparaissaient
comme des cases natives du navigateur au lieu du style commun. Option
`--wrap=none` ajoutée.

Vérifications : simulation d'un PDF rempli (2 cases cochées, 1 décochée)
correctement relu ; refus confirmés dans les deux cas dangereux ; pdf.js
(moteur PDF de Firefox) reconnaît bien 93 cases à cocher. Non vérifiable
ici : l'enregistrement dans Edge ou Acrobat sur le PC.

## 27/09/2026 — v0.2.3

Base : la version post-audit fournie par l'utilisateur
(`d2-build-analyzer-ver_0_2_2-post-audit.zip`).

**Confirmé par l'utilisateur** : chargement automatique du Manifest au
démarrage (vérification de version, indexation, recherche).

**Nouveau : fiche complète d'un build** (demande de l'utilisateur)
- bouton « 👁 Voir » sur chaque build du menu Loadouts, juste après
  « Charger » ;
- fenêtre en lecture seule (`components/FicheBuild.tsx`) : doctrine,
  armes et perks, armure et mods, stats totales (armure + bonus de
  doctrine, mêmes fonctions que Mon Build), artefact et perks ;
- « 📋 Copier en texte » : version texte simple à coller sur Discord ou
  ailleurs ; si le presse-papiers refuse, le texte s'affiche déjà
  sélectionné pour un Ctrl+C manuel ;
- « ⬇ Exporter le fichier » : même export que le bouton du build ;
- données assemblées une seule fois dans `lib/loadouts/fiche.ts`, lues à
  la fois par l'affichage et par la version texte, pour qu'elles ne
  puissent pas diverger ;
- perks d'armes : le tri existant (cosmétiques écartés, particularité
  d'origine à part) est extrait dans `obtenirPerksArmeNommes`
  (`doctrine.ts`), qui renvoie aussi les noms ; `calculerIconesPerksArme`
  s'appuie désormais dessus, résultat identique.

**Nouveau : blocs repliables** (demande de l'utilisateur, « pareil que le
Coffre »)
- Mon Inventaire, Personnage & Doctrine, Mon Build et Artefact : même
  mécanisme natif que le Coffre (`<details>`), ouverts par défaut. Style
  commun dans `index.css` (`.bloc-repliable`) ;
- non concernés, comme demandé : connexion Bungie.net, recherche dans le
  Manifest, partie scoring ;
- section « Doctrine » de Mon Build : repliable, **réduite par défaut**,
  présentation identique au Coffre (cadre, titre en gras).

**Libellés** : `LIBELLES_STAT` et `ORDRE_STATS` ajoutés à
`data/libellesUI.ts`. Quatre copies identiques des noms de stats existent
ailleurs (SelecteurInventaire, ResumeBuild, StatsBarChart, doctrine.ts) :
non touchées ici, à regrouper lors d'un prochain nettoyage.

**Vérification** : dépendances toujours indisponibles hors ligne.
Typecheck avec types de substitution : aucune variable inutilisée, aucune
erreur nouvelle par rapport à la base (seules restent les alertes dues aux
substitutions elles-mêmes). Version texte de la fiche exécutée sur un
faux build : sortie correcte.

## 27/09/2026 — dossier `documentation/`

Demande de l'utilisateur : un dossier pour ranger les rapports d'audit et
autres documents de référence.

- `AUDIT-2026-09-06.md` et `AUDIT-2026-09-27-POST-AUDIT.md` (racine) →
  `documentation/audits/` ;
- `docs/ARCHITECTURE-AGENT-IA.md` et `docs/ARCHITECTURE-AGENT-IA-NOTES.md`
  → `documentation/agent-ia/` ; le dossier `docs/` disparaît (deux
  dossiers de documentation auraient prêté à confusion) ;
- `documentation/LISEZ-MOI.md` : règles de rangement et de nommage, et ce
  qui reste volontairement à la racine ;
- références mises à jour dans `TODO.md` et `README.md`. Les mentions
  d'anciens chemins dans les entrées précédentes de ce journal sont
  laissées telles quelles : ce sont des traces historiques.

Aucun fichier de code modifié.

## 27/09/2026 — v0.2.2 (passe d'audit externe)

**Audit externe (« Astra ») relu et vérifié** : rapport complet dans
`AUDIT-2026-09-27-POST-AUDIT.md`. Comparaison ligne à ligne avec la 0.2.2
d'origine : aucun fichier touchant à la connexion Bungie, à OAuth, au
Manifest, au stockage des loadouts ou à Electron n'a été modifié.

**Retenu (code)** :
- code mort retiré : `artefactsTraductions.ts` (table vide, procédure
  devenue sans objet depuis la traduction manuelle des 7 artefacts),
  `DefinitionTable`, `ElementVerb`, `trouverExotiqueArmure`,
  `obtenirIconesPerksFiltrees`, `demoMotsClesBuild`, le paramètre
  `motsClesBuild` d'`evaluerBuild`/`scoreLootCoherence` (reçu mais jamais
  lu) et la prop `classeActuelle` de `SelecteurInventaire` (jamais lue) ;
- libellés d'emplacements et de catégories de Doctrine regroupés dans
  `src/data/libellesUI.ts`, textes strictement identiques ;
- encart « Bonus de Set actifs » de Mon Build : calcul délégué à
  `obtenirBonusSetsActifs` et mémorisé (`useMemo`). Résultat vérifié
  identique (mêmes sets, même ordre, même filtrage) ;
- `noUnusedLocals` et `noUnusedParameters` activés dans `tsconfig.json` :
  **conservé par choix de l'utilisateur**. Conséquence à connaître : une
  seule variable ou un seul paramètre inutilisé fait désormais échouer
  `npm run build`, donc aussi `electron:build`.

**Rejeté (documentation)** : l'audit avait remplacé, dans `README.md` et
`GUIDE-DEMARRAGE-INVITE.md`, la description des deux formats d'archive
invité (« avec clé » / « sans clé »), l'astuce « `.env.local` déjà présent :
sautez cette section » et la demande « ne redistribuez pas cette archive »
par un texte sur une « archive source sans `.env.local` », contradictoire
avec les étapes du guide invité. **Les deux fichiers sont rétablis dans
leur version d'origine.**

**Non retenu pour la copie de travail** : le retrait de `.env.local` et de
`builds/loadouts-d2-2026-09-06.json` n'a de sens que pour une archive
partagée ; ils restent dans la copie de travail de l'utilisateur
(`.gitignore` les exclut déjà de toute sauvegarde de code).
`tsconfig.tsbuildinfo` reste retiré (artefact de compilation).

**Repéré, non traité (hors périmètre de la passe)** :
- `scoreBonusSets`, `calculerBonusSetsActifs`, `regrouperParSet` et
  `DEMO_SETS` (`armorSets.ts`) forment une chaîne morte, invisible pour
  `noUnusedLocals` car exportée ;
- une copie identique des libellés de catégories subsiste dans
  `doctrine.ts` (`LIBELLES_CATEGORIE_SOCKET_AFFICHAGE`), et le Pilier 4
  écrit « Arme énergétique » là où l'interface écrit « Arme énergie » ;
- dans `ResumeBuild.tsx`, un ancien commentaire (24/08, sur une fonction
  de transfert retirée depuis) précède désormais `calculerSetsActifsResume`
  et ne la décrit pas ;
- CSP et validation des adresses dans Electron : reportées par l'audit à
  une passe dédiée.

**Non vérifiable ici** : ni l'audit ni cette relecture n'ont pu installer
les dépendances ; `npm run build` reste à lancer sur le PC (voir
`A-TESTER.md`). Typecheck de contrôle avec types de substitution : aucune
variable inutilisée signalée, tous les imports locaux se résolvent.

## 26/09/2026 — v0.2.2

**Tests de la 0.2.1 confirmés par l'utilisateur** : connexion Bungie dans
l'appli installée, persistance d'un build enregistré, import de builds,
et cache du Manifest conservé d'un lancement à l'autre (message « déjà à
jour (cache local) » au rechargement, plus de retéléchargement).

⚠️ **Correction de consigne** : le test « le Manifest doit être reconnu
comme déjà chargé au redémarrage » était mal formulé. L'appli n'a jamais
chargé le Manifest toute seule au démarrage, même dans le navigateur :
l'état « non chargé » au lancement était normal, seul comptait le passage
par le cache au clic. C'est ce constat qui a mené au chargement
automatique ci-dessous.

**Nouveau : chargement automatique du Manifest au démarrage**
(`src/lib/manifest/download.ts`, `src/components/RechercheManifest.tsx`)

- Au lancement, l'appli demande la version actuelle à Bungie (quelques Ko)
  et vérifie que les caches FR **et** EN existent et sont à cette version.
  Si oui, elle les charge et les indexe sans clic.
- Sinon (premier lancement, nouvelle version publiée, hors ligne), rien ne
  se passe et le bouton manuel reste affiché : le gros téléchargement
  (~200 Mo) n'est **jamais** lancé sans clic.
- Les deux langues sont exigées parce que le chargement enchaîne FR puis
  EN : si seul le FR était en cache, le lancer automatiquement
  téléchargerait l'anglais sans demander.
- La vérification lit seulement la **clé** du cache (`getKey`), pas les
  ~100 Mo de données.

**Nouveau : export d'un build seul** (`src/lib/loadouts/stockage.ts`,
`src/components/PanneauLoadouts.tsx`)

- Bouton « ⬇ Exporter » à droite de « Supprimer » sur chaque build, pour
  l'échanger entre amis. Fichier nommé `build-d2-<nom-du-build>.json`.
- Même format que l'export complet (un tableau d'un élément) : le bouton
  « Importer » existant l'accepte sans changement.
- Le bouton d'export global devient « ⬇ Exporter tout » pour lever
  l'ambiguïté.
- Échange entre comptes : les identifiants d'exemplaire sont propres au
  compte d'origine. Chez un ami, les pièces apparaissent « manquantes » et
  la réparation automatique existante les remplace par ses propres
  exemplaires du même objet s'il les possède. Doctrine et artefact se
  chargent directement.

## 26/09/2026 — v0.2.1

**Correctif : « OriginHeaderDoesNotMatchKey » dans l'appli installée**

Tests de la 0.2.0 par l'utilisateur. **Ce qui fonctionne** : icône du
Spectre, version affichée sur le `.exe` et en pied de page, icônes de
contexte de build (régression du 26/09 confirmée corrigée), premier
chargement du Manifest.

**Ce qui échouait, avec une seule cause** :
- connexion Bungie : échange de code OAuth refusé (400,
  `OriginHeaderDoesNotMatchKey`) ;
- au redémarrage, Manifest annoncé « non chargé », puis erreur au clic.

**Cause** : Bungie compare l'adresse d'origine des requêtes à celle
déclarée sur le portail développeur (`https://127.0.0.1:5173`). En
développement, la page vient précisément de cette adresse. Mais dans
l'appli installée, elle est servie depuis `app://local` — changement que
j'ai introduit le 26/09 pour rendre le stockage persistant. Bungie
refusait donc les appels.

Les deux symptômes n'en font qu'un : le chargement du Manifest commence
par demander sa version à Bungie ; cet appel échouant, l'appli ne peut
plus vérifier son cache et l'annonce « non chargé ». **Le Manifest était
probablement bien conservé** — le correctif de stockage n'est pas en
cause, et reste à confirmer une fois les appels rétablis.

**Corrigé** (`electron/main.cjs`) : pour les appels de données vers
bungie.net uniquement, l'origine annoncée redevient celle déclarée sur le
portail, et l'autorisation renvoyée est réécrite vers l'adresse interne —
sans quoi le moteur d'affichage bloquerait la réponse. Les navigations de
page (fenêtre de connexion) sont explicitement exclues.

⚠️ **Leçon** : changer l'adresse d'origine d'une application touche AUSSI
les services distants qui la contrôlent, pas seulement le stockage local.
Le correctif du stockage avait été évalué sous le seul angle de la
persistance.

⚠️ **Non testé ici** : Electron ne peut pas être exécuté dans
l'environnement de Claude. À vérifier en jeu (voir `A-TESTER.md`).

---

**Architecture de l'agent IA retrouvée, intégrée et mise en attente**

Le document d'architecture signalé comme introuvable depuis le 21/09
existait bien : il vivait dans une autre conversation du projet, invisible
depuis celle-ci. L'utilisateur l'a transmis ; il est désormais **dans le
dépôt** : `docs/ARCHITECTURE-AGENT-IA.md`.

**Relecture** : document solide. Sa décision de fond — garder le moteur
déterministe comme référence et cantonner l'IA à l'interprétation — est la
bonne, et évite l'erreur classique consistant à faire calculer des chiffres
par un modèle qui les inventerait.

**Point relevé, absent du document** : l'exposition de la clé d'API IA. Le
document parle de facturation, mais pas du fait qu'une clé embarquée dans
le `.exe` est extractible — avec, contrairement à la clé Bungie, un coût
direct à chaque appel.

**Question posée à l'utilisateur** : usage personnel, ou partagé avec des
amis ? **Réponse : en suspens**, et c'est un choix assumé. Bungie a
communiqué cette semaine sur la sortie de Destiny de son statut de fin de
service : le jeu pouvant de nouveau évoluer, l'ampleur des besoins de
l'agent (recherche Web, base documentaire) n'est pas connue.

**Consigné pour la reprise** dans `docs/ARCHITECTURE-AGENT-IA-NOTES.md` :
la question à trancher avec ses 3 options et leurs conséquences, le
contexte Bungie qui motive l'attente, le constat que les étapes 1 à 3 du
document sont déjà largement couvertes par `BuildDraft` et `evaluerBuild`,
et deux ajouts à faire au document (l'IA ne doit pas pouvoir contredire le
score ; les appels doivent partir du processus principal et non de la
page). `TODO.md` pointe vers ce fichier.

---

**Audit externe de la 0.2.0 — durcissements appliqués, 2 points reportés**

Audit demandé par l'utilisateur avant ses tests. Chaque point a été vérifié
dans le code avant d'être accepté : les constats sont justes, et le
diagnostic positif (isolation Electron, preload minimal, protocole `app://`,
protection contre la traversée de chemin, aucune télémétrie) correspond bien
à ce qui est en place.

**Corrigé tout de suite (durcissements sans risque de régression)** :
- **URL de connexion non validée** — le canal IPC ouvrait l'adresse reçue du
  renderer telle quelle. Même construite par notre propre code, une entrée
  d'IPC doit être validée : seule la page d'autorisation de `www.bungie.net`
  en HTTPS est désormais acceptée.
- **`shell.openExternal` sans filtre** — il transmettait n'importe quelle
  adresse au système, qui peut agir dessus selon son type (un lien `file:`
  ou un protocole applicatif peut lancer un programme). Restreint à
  `http`/`https`.
- **Navigation de la fenêtre principale** — un lien inattendu aurait pu
  remplacer l'appli par une page distante dans la fenêtre qui porte le pont
  `appBureau`. Bloqué : seules l'adresse interne (ou celle du serveur de
  développement) sont autorisées.
- **Fenêtre de connexion Bungie** — elle affiche une page DISTANTE :
  `sandbox: true` ajouté, et aucun preload n'y est chargé.
- **État anti-CSRF « fail-open »** — reproche justifié : l'absence de
  `sessionStorage` faisait retomber la connexion en mode sans protection.
  Ce repli venait d'un incident réel (06/09), où un échec de stockage avait
  rendu la connexion impossible. Meilleure solution trouvée : dans le
  LOGICIEL, la page n'est jamais rechargée pendant la connexion, donc une
  variable en mémoire suffit à conserver l'état — la vérification y est
  maintenant STRICTE. Seul le mode navigateur, où la page est réellement
  quittée, dépend encore de `sessionStorage`.

**`package-lock.json` retiré** : il était resté en 0.1.0, sans Electron ni
electron-builder — donc trompeur. Il ne peut pas être régénéré ici (pas
d'accès réseau) ; il sera reconstruit par le `npm install` de l'utilisateur,
et c'est SA version qui fait foi. `installateur/` et `dist/` ajoutés au
`.gitignore`.

**Reporté volontairement, APRÈS les tests de la 0.2.0** :
- **Mise à niveau d'Electron** (32 → branche courante). Le constat est
  juste, mais changer de version majeure juste avant une série de tests
  reviendrait à mélanger deux sources de problèmes. À faire comme une
  opération contrôlée, séparée, une fois la 0.2.0 validée. À noter : la
  fenêtre de connexion affiche une page distante, donc l'ancienneté de
  Chromium compte réellement ici — ce n'est pas à repousser indéfiniment.
- **Politique de sécurité de contenu (CSP)** : recommandation pertinente,
  mais une CSP trop stricte casse silencieusement des fonctions (appels
  Bungie, WebAssembly de sql.js, images distantes). L'écrire sans pouvoir
  lancer l'appli, juste avant les tests, ferait plus de mal que de bien.

---

**Version affichée dans l'appli, projet passé en 0.2.0**

Question de l'utilisateur : « comment être sûr d'installer la bonne
version ? ». Problème réel — deux fabrications successives produisaient un
fichier au nom identique (`...Setup-0.1.0.exe`), impossible à distinguer,
et rien à l'écran ne permettait de savoir ce qui tournait.

- **Version affichée** en pied de page de l'appli
  (« D2 Build Analyzer v0.2.0 — créé par Orynick/Orygamer »), lue
  directement dans `package.json` au moment de la compilation : aucune
  valeur à tenir à jour à deux endroits.
- **Projet passé en 0.2.0** : l'installateur s'appelle désormais
  `D2-Build-Analyzer-Setup-0.2.0.exe`, distinct de la 0.1.0 déjà
  installée, et Windows affichera bien une nouvelle version dans la liste
  des programmes.

Cette 0.2.0 regroupe : icône et description, stockage persistant du
Manifest et des builds, et le correctif des icônes de contexte.

---

**Régression corrigée — icônes de contexte de build cassées**

Signalée par l'utilisateur. **Cause : une régression que j'ai introduite**
en ajoutant `base: "./"` à `vite.config.ts` pour le logiciel installable.

`BadgeContexte.tsx` écrivait des chemins ABSOLUS
(`/icones-contexte/neutre.png`). Ça fonctionnait tant que l'appli était
servie à la racine d'une adresse web, mais plus dès que la base devient
relative — un chemin commençant par « / » pointe alors à côté, et les
quatre badges (Neutre, Roaming, DPS, PvP) s'affichaient cassés.

**Corrigé** avec `import.meta.env.BASE_URL`, la variable prévue par Vite
pour ce cas précis : elle vaut « / » pour la version navigateur et « ./ »
pour le logiciel, donc un seul code sert les deux. Les images restent dans
`public/` et ne sont pas dupliquées dans le résultat de compilation — ce
qu'aurait fait un `new URL(...)`, première approche essayée puis écartée
pour cette raison.

**Vérifié au passage** : recherche de tout autre chemin absolu vers
`public/` dans le code — aucun autre cas. `index.html` en avait un pour le
favicon (`href="/favicon.svg"`), corrigé aussi ; la ligne `src="/src/..."`
est laissée telle quelle, l'outil de compilation la réécrit lui-même.

⚠️ **Leçon** : `base: "./"` a été ajouté sans vérifier ce qu'il impliquait
pour les fichiers de `public/`. Un changement de configuration de ce type
mérite une recherche des chemins absolus dans tout le projet.

---

**Appli installée : stockage rendu persistant (Manifest et builds)**

Signalé par l'utilisateur : le Manifest devait être retéléchargé et les
builds réimportés dans l'application installée.

**Ce qui n'était PAS en cause** : la gestion de version. `download.ts`
compare déjà la version du Manifest et ne retélécharge que si elle a
changé (comportement en place depuis le début). Le problème venait de
l'endroit où ce cache est rangé.

**Cause** : l'appli installée était chargée en `file://`. Chromium
restreint le stockage (IndexedDB) pour cette adresse — le cache du
Manifest (~100 Mo) et les builds enregistrés pouvaient être refusés ou
effacés d'un lancement à l'autre.

**Corrigé** (`electron/main.cjs`) : les mêmes fichiers de `dist` sont
désormais servis via un schéma interne déclaré « standard » et
« sécurisé ». L'appli obtient ainsi une ORIGINE stable et un stockage
persistant, comme une page web classique — sans serveur réseau ni port
ouvert. Un garde-fou empêche toute adresse contenant « .. » de sortir du
dossier `dist`.

⚠️ **Non testé** : Electron ne peut pas être exécuté dans l'environnement
de Claude. À vérifier en jeu (voir `A-TESTER.md`) : le Manifest doit être
téléchargé UNE fois, puis retrouvé aux lancements suivants.

⚠️ **Note** : le stockage de l'appli installée reste distinct de celui du
navigateur (profils séparés, comme deux navigateurs différents). Un
premier téléchargement dans l'appli installée est donc normal, de même
que la réimportation initiale des builds.

**Écarté : embarquer les Manifests dans l'installateur.** Les deux langues
pèsent ~200 Mo, l'installateur passerait de ~90 Mo à ~290 Mo, et Bungie
met le Manifest à jour à chaque correctif ou saison : la version embarquée
serait périmée en quelques semaines, et la vérification de version
déclencherait de toute façon un téléchargement. Un téléchargement unique
au premier lancement, correctement conservé, est plus simple et reste à
jour.

---

**Logiciel installable — installateur produit, icône et description ajoutées**

L'utilisateur a mené la fabrication à bien : `tsc`, `vite build`,
empaquetage et installateur NSIS passent, et la connexion Bungie
fonctionne dans la fenêtre Electron (l'interception de la redirection,
le pari technique du chantier, est donc validée en conditions réelles).

**Obstacle rencontré et résolu** : `electron-builder` télécharge un outil
de signature contenant des liens symboliques macOS ; Windows refuse de les
créer sans privilège (« Le client ne dispose pas d'un privilège
nécessaire »), ce qui interrompait la fabrication APRÈS l'empaquetage —
d'où un dossier `win-unpacked` exploitable mais pas d'installateur.
Résolu en activant le **mode développeur** de Windows et en vidant le
cache `winCodeSign` corrompu. Sans rapport avec le code du projet.

**Ajouté ensuite** (deux manques signalés par le journal de fabrication) :
- `description` dans `package.json` — sans elle, les propriétés du fichier
  restaient vides ;
- **icône Windows** (`ressources-installateur/icon.ico`), générée à partir
  du SVG du Spectre déjà utilisé comme favicon : 7 tailles (16 à 256 px),
  vérifiée visuellement sur fond clair et sombre — nette et reconnaissable
  jusqu'à 16 px. Déclarée pour l'application, l'installateur et le
  désinstallateur, à la place de l'icône Electron par défaut.

⚠️ Les mentions « signing is skipped » du journal sont normales :
l'installateur n'est pas signé, d'où l'avertissement Windows au premier
lancement. Le supprimer demanderait un certificat payant.

---

**Build réparé — audit de l'archive revenue de la session ChatGPT**

L'utilisateur a poursuivi le chantier `.exe` ailleurs, s'est heurté à un
build bloqué, et transmet le projet complet (avec `node_modules`) plus un
résumé de la session.

**Occasion inédite : le projet a enfin pu être compilé pour de vrai.**
`node_modules` étant fourni, `npx tsc -b` a tourné ici avec les VRAIS
types React et sql.js — au lieu des approximations habituelles de cet
environnement sans accès réseau. L'erreur de l'utilisateur a été reproduite
à l'identique en une commande.

**Cause réelle de l'erreur** (`PanneauTriomphes.tsx:229`, *Type 'unknown'
is not assignable to type 'ReactNode'*) : les props `profil: unknown |
null` et `db` étaient utilisées directement comme conditions JSX
(`{profil && (`). TypeScript propage alors `unknown` dans l'arbre JSX.
Le diagnostic posé pendant la session ChatGPT était **juste** ; la
correction (`!= null`) est appliquée ici et **vérifiée par le compilateur
réel : build vert**.

⚠️ **Ce bug n'a pas été introduit par la session ChatGPT : il était déjà
présent dans mes propres livraisons.** Il n'était jamais apparu parce que
mes vérifications se faisaient avec des types React de substitution, qui
traitent le JSX comme `any` et masquent donc précisément cette famille
d'erreurs. Leçon pour la suite : un typecheck sans les vraies dépendances
ne prouve pas qu'un build passera.

**Second problème, non repéré jusque-là : encodage corrompu.** Les deux
fichiers réécrits par les commandes PowerShell (`PanneauTriomphes.tsx`,
`perkSource.ts`) contenaient `Ã©`, `â€"`, `ðŸ–¼ï¸`… à la place des
accents et émojis, plus un BOM en tête. Le code compilait, mais les
libellés affichés étaient illisibles. Corrigé en repartant des fichiers
propres, dont le code s'est avéré **identique** à un caractère près.

**Apports de la session ChatGPT conservés** :
- `@types/sql.js` en dépendance de développement — vrai manque, c'est ce
  qui a supprimé l'essentiel des erreurs initiales ;
- garde-fou `if (typeof ligne.id !== "number") continue;` dans
  `perkSource.ts`, nécessaire une fois ces types installés (réécrit ici en
  encodage propre, avec son commentaire d'explication).

⚠️ **La couche Electron était absente de l'archive** : la session est
partie d'une version antérieure à sa livraison. `electron/main.cjs`,
`preload.cjs`, les fonctions `estBureau`/`connecterViaBureau`, le routeur
à dièse, `base: "./"` et la configuration d'installateur ont été
réintégrés — et **compilent proprement**, ce qui n'avait jamais pu être
vérifié jusqu'ici.

**État du projet** : `tsc -b` vert sur l'ensemble. Le `vite build` complet
n'a pas pu être lancé ici (les dépendances de l'archive sont compilées
pour Windows), mais ce n'était pas le blocage — `tsc` l'était.

---

## 24/09/2026

**Logiciel installable (Windows) — squelette Electron posé**

Chantier n°1 du plan, ouvert après confirmation par l'utilisateur des deux
précédents (filtre de recherche, expiration de session).

**Décision de conception, celle qui évite tout le reste** : une
application installée n'a pas de serveur web, or Bungie impose de renvoyer
vers `https://127.0.0.1:5173/auth/callback`. Plutôt que d'embarquer un
serveur HTTPS et un certificat dans le logiciel, le processus principal
**intercepte** cette redirection dans la fenêtre de connexion
(`will-redirect` / `will-navigate`) et en extrait le code : l'adresse n'est
jamais chargée. Conséquence directe : **aucun changement à faire sur
l'application Bungie** de l'utilisateur, et la version navigateur continue
de fonctionner à l'identique.

**Ajouté** :
- `electron/main.cjs` — fenêtre principale, interception OAuth, liens
  externes renvoyés au navigateur, acceptation du certificat mkcert
  **uniquement** pour l'adresse du serveur de développement (bungie.net
  garde une vérification normale). En CommonJS car le projet est en
  modules ES.
- `electron/preload.cjs` — pont minimal (`contextIsolation` actif) : la
  page n'accède qu'à `estBureau` et `connexionBungie`, ni fichiers ni
  commandes.
- `package.json` — `main`, scripts `electron:dev` / `electron:build`,
  configuration `electron-builder` (installateur NSIS, raccourci bureau,
  choix du dossier d'installation), dépendances de développement.

**Adapté dans l'appli** :
- `oauth.ts` — `construireUrlAutorisation()` extraite et **partagée** par
  les deux modes (navigateur et logiciel), pour qu'ils ne divergent jamais
  sur un paramètre ; `estBureau()` ; `connecterViaBureau()` qui valide
  l'état anti-CSRF puis réutilise l'échange de jetons existant.
- `DashboardPage` — le bouton de connexion choisit le mode ; en logiciel,
  la fenêtre rend la main, donc le chargement du profil est enchaîné ici.
- `main.tsx` — routeur à dièse quand l'appli est chargée depuis un fichier
  local (les chemins d'URL classiques n'y fonctionnent pas), routeur normal
  dans le navigateur.
- `vite.config.ts` — `base: "./"` : sans chemins relatifs, le build ouvert
  depuis un fichier local chercherait ses ressources à la racine du disque.

**Vérifié ici** : typecheck 0 erreur hors bruit d'environnement, syntaxe
des deux fichiers Electron validée (`node --check`), `package.json` valide.

⚠️ **Jamais exécuté** : l'environnement de Claude n'a pas d'accès Internet,
donc ni `npm install electron` ni la fabrication de l'installateur n'ont pu
être lancés. Le premier `npm run electron:dev` sur le PC de l'utilisateur
est le vrai test — des ajustements sont à prévoir, c'est normal à ce
stade. Marche à suivre dans le README, section « Fabriquer le logiciel
installable ».

**Note** : la clé de `.env.local` est incluse dans le logiciel fabriqué
(Vite l'inscrit dans le build). Le `.exe` ne doit donc pas être
redistribué ; le partage passe toujours par les archives « invité ».

---

**Plafond du Pilier 1 annulé — retour à 100**

Décision de l'utilisateur. Le plafond (85 le 06/09, puis 75) partait d'une
remarque juste : un 100/100 pour une doctrine simplement complète semble
disproportionné. Mais il n'a rien apporté de concret, ce qui était déjà la
réserve formulée en le posant : baisser la note de TOUS les builds de la
même façon ne les départage jamais. « Élément et Doctrine » revient donc à
100, comme les 4 autres blocs, et la ligne d'explication du plafond
disparaît de l'interface.

---

**Expiration de la connexion — chantier n°1 traité**

L'utilisateur n'avait jamais observé le comportement ; il a été reconstitué
en lisant le code, et il était plus gênant que prévu :
- au démarrage, l'appli lisait les jetons, les trouvait présents et
  affichait **« ✅ connecté »** — même périmés ;
- chaque action échouait alors avec un message technique (« client
  public : pas de token de rafraîchissement »), sous un en-tête affichant
  toujours « connecté » ;
- le bouton « Connexion Bungie.net » n'apparaît que si l'appli se croit
  déconnectée : il fallait donc deviner qu'il fallait d'abord cliquer sur
  « Se déconnecter » pour pouvoir se reconnecter.

**Corrigé** :
- `etatSession()` (`oauth.ts`) : 3 états (`absente` / `valide` /
  `expiree`) au lieu du simple « des jetons existent-ils ? ». Même marge de
  60 s que `obtenirAccessTokenValide`, et un jeton de rafraîchissement, s'il
  existait un jour (client confidentiel), garde l'état `valide`.
- `SessionExpiree`, classe d'erreur dédiée : l'interface la reconnaît par
  `instanceof`, sans dépendre du texte d'un message qui casserait à la
  moindre reformulation.
- Au démarrage comme en cours d'usage, une session expirée efface les
  jetons, repasse l'appli en « non connecté » et affiche une **bannière
  explicite** : session expirée, c'est normal (~1 h), cliquez sur
  « Connexion Bungie.net », vos builds ne sont pas affectés.
- Nouveau bouton de test (mode dev) **« ⏳ Simuler l'expiration »** :
  sans lui, vérifier ce comportement demanderait de laisser l'appli
  ouverte une heure. Il ne réécrit que la date d'expiration stockée
  localement — aucun appel réseau, rien de modifié côté Bungie.

**Vérifié** : les 5 cas d'`etatSession` (aucun jeton, valide, expiré sans
rafraîchissement, expirant dans 30 s → traité comme expiré grâce à la
marge, expiré avec rafraîchissement possible → reste valide). Typecheck :
0 erreur, 0 code mort.

**Reste** : vérifier en jeu avec le bouton de simulation (voir
`A-TESTER.md`).

---

**✅ Filtre anti-dialogue de la recherche — confirmé en jeu, chantier clos**

L'utilisateur confirme : « pour la recherche : ça fonctionne bien ». Le
filtre codé le 24/08 (exclusion du texte d'ambiance `flavorText`, source
identifiée par diagnostic sur « one-two ») est donc validé sur données
réelles, un mois après son écriture.

**Diagnostic `diagnosticCheminsJson` archivé** (`false` dans
`diagnosticsArchives.ts`), conformément à la convention du projet : le
code et le verdict par objet ajoutés le 21/09 sont **conservés**. Il
suffit de le repasser à `true` si une réplique ou un texte sans rapport
réapparaît un jour — il indiquera par quel champ elle passe, sans avoir à
deviner un motif de dialogue.

`A-TESTER.md` : les 2 tests de vérification sont cochés. La 3e ligne reste
ouverte volontairement — ce n'est pas un test à faire, mais une
surveillance au fil de l'eau des recherches quotidiennes.

**Prochain chantier** : expiration de la connexion (n°1 du plan après
renumérotation).

---

## 21/09/2026

**Filtre anti-dialogue de la recherche — état réel clarifié, outil de
vérification rendu fiable**

Chantier n°1 du plan. **Constat en l'ouvrant : le filtre existait déjà**,
codé le 24/08 à partir d'un diagnostic sur données réelles. La réplique
« Vise le sac, petit » (*Hit the Bag*) remontait sur « one-two » par son
seul champ `flavorText` (texte d'ambiance : « Warm up that one-two
punch! »), jamais affiché comme vraie description ; ce champ précis est
exclu de la détection « autre texte ». Le TODO et les notes de projet le
présentaient pourtant comme à faire : il n'avait simplement **jamais été
confirmé en jeu** ni ajouté à `A-TESTER.md`, et le registre des
diagnostics le marquait « pas encore entièrement traité » (le filtre ne
couvre que la source confirmée).

**Défaut trouvé dans l'outil de vérification** : le diagnostic « 🔍
Diagnostic (dev) » listait TOUTES les correspondances brutes du JSON, y
compris celles que la recherche écarte déjà. Lancé sur « one-two », il
aurait affiché « Vise le sac, petit » alors que la recherche normale ne la
montre plus — de quoi conclure à tort que le filtre ne marche pas.

**Corrigé** (`src/lib/manifest/search.ts`, `RechercheManifest.tsx`) :
- nouvelle fonction partagée `evaluerCorrespondance` : SOURCE UNIQUE de la
  décision « correspond ? par quel champ ? dans quelle catégorie ? »,
  appelée à la fois par la recherche et par le diagnostic (plutôt que de
  recopier la règle, ce qui aurait créé deux logiques vouées à diverger) ;
- constante partagée `CATEGORIES_MASQUEES_PAR_DEFAUT` ;
- le diagnostic affiche pour chaque objet un **verdict** — ✅ AFFICHÉ (via
  quel champ), 🚫 FILTRÉ (texte d'ambiance seul), 🙈 MASQUÉ PAR DÉFAUT
  (catégorie quête/ornement/…) — et un résumé « N objet(s) affiché(s) sur
  M trouvé(s) ».

**Vérifié** : comportement de la recherche strictement inchangé (même
ordre de décision, mêmes exclusions) ; fonction testée isolément sur les
cas réels et limites — réplique filtrée ; « One-Two Punch » trouvé par son
nom ; objet correspondant par description ET texte d'ambiance toujours
affiché (le filtre ne masque jamais une vraie correspondance) ;
correspondance dans un champ imbriqué conservée. Typecheck : 0 erreur,
0 code mort.

**Reste** : confirmation en jeu, puis — seulement si d'autres répliques
apparaissent — identifier leur champ avec le diagnostic avant d'étendre
le filtre (pas de motif de dialogue deviné à l'aveugle).

---

**Archive invité « sans clé » + procédure de création d'application
Bungie accessible aux débutants**

Demande de l'utilisateur, suite à l'audit de sécurité du jour : proposer
une variante d'archive invité qui n'expose pas sa clé d'application, et
documenter la démarche de façon « facile à appliquer même pour des
débutants ».

**Deux formats d'archive invité désormais** :
- `d2-build-analyzer-invite-avec-cle.zip` — `.env.local` inclus, prêt à
  l'emploi, avec demande de non-redistribution dans le guide ;
- `d2-build-analyzer-invite-sans-cle.zip` — sans `.env.local` ; le guide
  gagne une étape « Créer votre propre application Bungie » AVANT le
  lancement (l'appli ne lit ses réglages qu'au démarrage).

**README — section « Créer votre propre application Bungie (pas à pas,
débutants bienvenus) »**, qui remplace l'ancienne « Obtenir votre clé API
Bungie » (6 lignes techniques) : étapes A à E, tableau champ par champ du
formulaire Bungie (en anglais sur le site), les 3 pièges d'adresse
(`https`, `127.0.0.1` jamais `localhost`, aucun `/` final), création de
`.env.local` au Bloc-notes avec affichage préalable des extensions
Windows, piège `.env.local.txt`, et tableau de dépannage symptôme → cause.

**Problèmes pour débutants trouvés et corrigés en rédigeant** :
- la section « Démarrage » utilisait `cp`, une commande **inexistante
  dans `cmd` Windows** — un débutant aurait bloqué dès la 2e ligne ;
- son conseil « supprimez complètement l'ancien dossier » faisait perdre
  `.env.local` sans avertissement → précaution ajoutée ;
- `.env.example` réécrit comme modèle guidé (renvoi au README, méthode
  Bloc-notes, piège `.txt`) ;
- écran « Configuration incomplète » (`App.tsx`) : il listait des noms de
  variables techniques (`VITE_BUNGIE_...`) sans dire quoi faire ; il
  renvoie maintenant au pas-à-pas et reprend les deux pièges fréquents,
  le détail technique restant affiché en petit. C'est précisément l'écran
  que verra un invité « sans clé » qui saute l'étape de création.

**Guide invité — 3 libellés périmés corrigés** (vérifiés dans le code) :
le bouton s'appelle « Connexion Bungie.net » (pas « Se connecter à
Bungie.net ») ; le chargement des personnages est automatique depuis
août ; les blocs « Personnage » et « Doctrine » sont fusionnés en
« Personnage & Doctrine ».

⚠️ **Non vérifiable depuis cet environnement** : le formulaire du portail
développeur Bungie lui-même (libellés exacts des cases de *Scope*,
caractère obligatoire du champ *Website*). La procédure reprend les
réglages de l'application de l'utilisateur, qui fonctionne ; les libellés
anglais des cases sont donnés à titre indicatif. **À valider au premier
invité réel.**

Typecheck : aucune erreur réelle introduite (l'écart de +18 est
exclusivement TS7026, le bruit JSX d'environnement, une ligne par balise
ajoutée à l'écran de configuration).

---

**Relecture complète — audit, optimisation, et vérification de sécurité
de l'archive invité**

**Code mort retiré** (repéré en activant `noUnusedLocals` sur un typecheck
complet de `src/`, 12 déclarations signalées, chacune examinée avant
suppression) :
- `LIBELLES_TABLE` (`RechercheManifest.tsx`), `nomDepuisHash`
  (`ResumeBuild.tsx`), `tierMaxDuSlot` et l'état `ouvert`
  (`SelecteurArtefact.tsx`) ;
- `cacheIconesClasseParDb` (`doctrine.ts`) **avec son commentaire** : il
  décrivait une fonction d'icône de classe via `DestinyClassDefinition`
  qui n'existe plus (remplacée par les SVG locaux d'`IconeClasse`) — le
  commentaire documentait donc du code disparu ;
- imports inutilisés : `obtenirIconesPerksFiltrees` (×2), `urlIcone`,
  `CLASS_TYPE_VERS_CLASSE`, `scoreBonusSets`, et `obtenirDefinition` dans
  `ResumeBuild.tsx` (devenu inutile une fois `nomDepuisHash` retirée —
  détecté par le typecheck de contrôle, pas supposé).

**Mise à jour du même jour** : `devinerElementViaSuper` finalement
**retirée** — sa conservation reposait sur un chantier « Titan/Chasseur »
qui s'est révélé déjà clos depuis le 04/08 (table `ELEMENT_PAR_HASH_CONNU`
complète pour les 18 sous-classes). Le paragraphe suivant décrit le choix
initial, corrigé depuis.

**Conservé volontairement (choix initial, annulé ci-dessus)** : `devinerElementViaSuper` (`doctrine.ts`),
non appelée — sa logique vit désormais dans `devinerElement` — mais
gardée comme référence pour la résolution des hashes de sous-classe
Titan/Chasseur, chantier encore ouvert. Annotée en conséquence, sans coût
à l'exécution.

**Typecheck** (mesuré, pas estimé) : 1284 → 1273 lignes signalées — 11
déclarations mortes retirées, la 12e (`devinerElementViaSuper`) étant
conservée volontairement. Toutes les erreurs restantes sont le
bruit d'environnement connu (absence de `@types/react` et de
`react-router-dom` dans ce bac à sable sans `node_modules`) — aucune
nouvelle erreur introduite.

**Correction d'une erreur de ma part (08/09)** : j'avais signalé
« Llama » dans `knowledge-base/` comme un possible identifiant personnel
de l'utilisateur. C'était faux : c'est un **créateur de contenu** dont les
transcripts vidéo ont servi de source (« transcript vidéo Llama »,
« Testé (Llama) »). Attribution légitime, conservée telle quelle.

**Sécurité de l'archive invité** — voir le détail dans la réponse de
cette session ; en résumé : aucune donnée personnelle ni jeton de session
n'est inclus, aucun identifiant Bungie en dur, le serveur de dev n'écoute
que `127.0.0.1`. Seul risque résiduel : la clé API d'application
(`.env.local`) est partagée — sans accès à tes données, mais attribuable à
ton compte développeur Bungie. Données du `knowledge-base/` dérivées de
l'export DIM de l'utilisateur vérifiées : règles de jeu agrégées
uniquement, aucune donnée brute d'inventaire.

⚠️ **Écart détecté entre la mémoire du projet et les fichiers** : les
notes de projet mentionnent une architecture d'agent IA déjà rédigée
(`docs/ARCHITECTURE-AGENT-IA.md`, `src/lib/ai/`, `server/ai/README.md`).
**Ces fichiers ne figurent dans aucune archive reçue dans cette
conversation.** Ils ont vraisemblablement été produits ailleurs : ne pas
remplacer un dossier qui les contiendrait par cette archive sans les
recopier d'abord.

---

## 15/09/2026

**Favicon ajouté — icône du Spectre**

L'appli n'avait aucun favicon (vérifié : ni balise dans `index.html`, ni
fichier à la racine de `public/`) — le navigateur affichait l'icône
générique par défaut dans l'onglet.

**Choix de l'icône** : 3 candidats comparés visuellement à la taille
réelle d'un favicon (32px et 16px, rendu via Chromium headless faute de
`cairosvg`/réseau dans cet environnement) : l'icône Cryptarque (déjà dans
l'appli), une version simplifiée et épaissie dessinée pour l'occasion, et
l'icône du Spectre (déjà dans l'appli, `IconeFantome.tsx`). Verdict : les
deux premières se dégradent en tache floue à 16px (traits trop fins pour
tenir à cette taille) ; le Spectre, plus géométrique et déjà pensé pour
rester lisible en petit, s'en sort nettement mieux aux deux tailles.

**Détail trouvé en cours de route** : l'icône du Spectre est en couleur
claire (#e8e6df) sans contour, sur fond transparent — quasiment invisible
sur un onglet de navigateur en thème CLAIR (testé et confirmé par rendu
avant de livrer). Corrigé en ajoutant un disque de fond aux couleurs de
l'appli (#1a2744) : lisible aussi bien sur fond blanc, gris que sombre
(3 fonds testés).

**Ajouté** :
- `public/favicon.svg` — les tracés de `IconeFantome.tsx`, sur un disque
  de fond.
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` dans
  `index.html`.

**Vérifié** : SVG validé (parseur XML), rendu du fichier RÉELLEMENT écrit
sur disque (pas seulement de la version de test) sur 3 fonds différents.

---

## 08/09/2026

**Icône Prismatique — remplacement du repli par le symbole officiel**

L'utilisateur a fourni le vrai symbole Prismatique
("Prismatic Custom Colour.svg", archivé dans
`public/icones-contexte/prismatique-source.svg`). Il remplace le losange
dessiné à la main dans `IconeElement.tsx`, qui était un repli explicitement
documenté depuis le 04/08 ("le Prismatique n'a pas d'icône officielle").

**Implémentation** : nouveau composant dédié `SymbolePrismatique`,
séparé du système `FORMES`/`COULEURS` à tracé unique utilisé par les 5
autres éléments — ce symbole a sa propre palette à 2 tons (#483737 et
#b66c9a), contrairement aux 5 autres qui sont tous monochromes ; les y
forcer aurait fait perdre l'info couleur plutôt qu'en gagner. Le
`viewBox` et le `transform` de groupe d'origine sont conservés tels quels
pour ne prendre aucun risque de transcription des coordonnées.

**Nettoyage mineur** : le fichier fourni contenait 8 tracés de "ligne"
quasi identiques (mêmes coordonnées au centième de pixel près) — des
artefacts d'export Inkscape sans aucune incidence visuelle (segments
remplis sans `stroke`, donc sans surface à afficher). 2 conservés à titre
représentatif plutôt que les 8, pour ne pas alourdir le composant de
doublons inertes.

**Vérifié visuellement** (Chromium headless, ce sandbox n'a pas
`cairosvg`/réseau) : rendu à 200px (forme bien reconnaissable, l'éventail à
facettes du symbole du jeu) et à 16px, la taille réelle utilisée dans
l'appli (`taille={16}` sur tous les appels sauf mention contraire) — reste
lisible, comparable aux 5 autres icônes à cette taille. Typecheck :
0 erreur imputable (uniquement le bruit JSX habituel dû à l'absence de
`@types/react` dans cet environnement sans `node_modules`).

---

## 07/09/2026

**🔴 RÉGRESSION de l'audit corrigée — connexion Bungie impossible**

✅ **RÉSOLU. La cause réelle : application Bungie déclarée en client
PUBLIC.** Un client public ne renvoie PAS de `refresh_token`. Or la
validation stricte introduite par l'audit exigeait ce champ dans
`lireTokens()` : des jetons pourtant parfaitement valides étaient donc
jugés corrompus, effacés juste après une connexion réussie, et
l'utilisateur se retrouvait systématiquement déconnecté.

Correctif retenu (fusionné depuis une archive fournie par l'utilisateur) :
- `refresh_token` devient **optionnel** dans `TokenSet` ;
- lecture tolérante à son absence (`typeof ... === "string" ? ... :
  undefined`) ;
- `lireTokens()` ne l'exige plus — c'était le point de blocage ;
- `rafraichirTokensInterne()` échoue désormais avec un message explicite
  (« client public, reconnexion nécessaire ») au lieu d'envoyer une requête
  vouée à être refusée.

⚠️ **Mon diagnostic initial était faux** : j'avais suspecté
`crypto.randomUUID()` / `sessionStorage`, en raisonnant sur le symptôme
rapporté (« le bouton ne redirige pas ») sans pouvoir observer la console.
Les protections que j'avais ajoutées à ce titre (repli sans `randomUUID`,
`try/catch` sur le stockage, validation d'état non bloquante, affichage des
erreurs du bouton) sont **conservées** : elles ne sont pour rien dans la
résolution, mais restent des garde-fous légitimes et sans effet de bord.

**Leçon** : deux hypothèses plausibles ont été poursuivies sur la seule
foi d'un symptôme, sans donnée d'exécution. Le réflexe qui avait tranché
le problème des aspects (construire un diagnostic plutôt que d'enchaîner
les correctifs) aurait dû être appliqué ici dès le premier échec.

---

**Diagnostic initial (conservé pour mémoire, s'est révélé hors sujet)**

Signalé par l'utilisateur juste après l'intégration de l'audit : le clic
sur « Connexion Bungie.net » ne redirigeait plus vers Bungie, et
n'affichait aucun message.

**Cause** : l'audit avait ajouté `crypto.randomUUID()` et
`sessionStorage.setItem()` directement dans `redirigerVersAutorisation`,
un chemin qui n'appelait jusque-là AUCUNE API navigateur susceptible
d'échouer. Ces deux appels peuvent lever :
- `crypto.randomUUID` n'existe pas hors contexte sécurisé, ni sur les
  navigateurs antérieurs à ~2021 ;
- `sessionStorage` lève si le stockage est bloqué (réglages de
  confidentialité) ou saturé.

L'exception survenait AVANT `window.location.href`, donc le clic ne
produisait rien : ni redirection, ni erreur visible.

**Corrigé, avec un principe explicite** : la protection anti-CSRF est un
PLUS, elle ne doit jamais empêcher de se connecter.
- `genererEtatOAuth()` : repli sur `crypto.getRandomValues` si
  `randomUUID` est absent, et `try/catch` autour du stockage. En cas
  d'échec, on repart sur le comportement d'avant l'audit (pas de `state`),
  avec un avertissement en console.
- `validerEtatOAuth()` : ne bloque plus quand AUCUN état n'a pu être émis
  (rien à vérifier). Si un état a bien été stocké, il doit toujours
  correspondre — la protection reste entière dans le cas normal.
- **Bouton de connexion** : le clic appelait la fonction directement, donc
  toute exception restait invisible. Elle est désormais capturée et
  affichée dans le bandeau d'erreur existant.

⚠️ **Si le problème persiste après ce correctif**, la 2e piste est le
paramètre `redirect_uri`, également ajouté par l'audit : il n'était pas
envoyé auparavant (Bungie utilisait alors l'URL enregistrée sur le portail
développeur). S'il ne correspond pas EXACTEMENT à celle enregistrée sur
bungie.net — protocole, port, barre oblique finale comprise — Bungie
affiche une page d'erreur au lieu de l'écran de connexion. La valeur
locale (`https://127.0.0.1:5173/auth/callback`) est cohérente avec la
route de l'appli, reste à confirmer qu'elle l'est aussi côté portail.

**Leçon** : un durcissement de sécurité placé sur un chemin critique doit
dégrader proprement, pas transformer une protection optionnelle en point
de défaillance unique.

---

## 06/09/2026

**Audit technique externe intégré (rapport daté du 06/09)**

Archive d'audit reçue et vérifiée avant intégration. **Contrôle prioritaire
effectué en premier** : la réorganisation du scoring ayant été livrée le
jour même, il fallait s'assurer que l'archive d'audit ne l'écrasait pas.
✅ Vérifié : `src/data/piliers.ts` (source unique), le plafond
`PLAFOND_COMPLETUDE = 75` et le nouvel ordre des piliers sont tous
présents — l'audit a bien porté sur la version à jour. Toute la
documentation (`CHANGELOG`, `TODO`, `A-TESTER`, `knowledge-base`) est
identique, aucun contenu perdu.

**Corrections retenues** (10 postes, détail dans `AUDIT-2026-09-06.md`) :
OAuth (`state` anti-CSRF, verrou sur les refresh concurrents, lecture
robuste des tokens), comptes Bungie liés (`primaryMembershipId` privilégié
au lieu de l'ordre du tableau), équipement (`ErrorCode/ErrorStatus`
exposés, `DestinyItemNotFound 1623` distingué de `1632`, `try/finally` sur
les boutons), contrôle de `ErrorCode` même en HTTP 200, validation du
Manifest et protection contre deux téléchargements simultanés, recherche
(version d'index + cache compact), loadouts (validation avant exposition à
l'UI), et DIM (jeton lié au `membership_id` courant).

**Vérifications faites de mon côté avant d'accepter** :
- **Scoring** — `Math.min(STAT_MAX, ...)` avant pondération : correction
  justifiée, `libellePalier` plafonnait déjà à T20 à l'affichage alors que
  le score comptait les points bruts au-delà. Vraie incohérence, réglée.
- **OAuth / StrictMode** — `validerEtatOAuth` consomme le `state` à la
  lecture, ce qui aurait cassé au 2e passage des effets React en
  développement ; le garde `dejaTente` déjà présent dans
  `AuthCallbackPage` couvre ce cas. Pas de régression.
- **Recherche** — l'index ne persiste plus le JSON complet (il doublonnait
  SQLite) et relit à la demande ; repli de compatibilité présent pour les
  anciens caches, clé de version bumpée en `v2`. Sain.
- **Typecheck** de toute la logique métier modifiée : 0 erreur.
- **Diff fichier par fichier** : un seul retrait (`.env.local`), deux
  ajouts (`AUDIT-2026-09-06.md`, `tsconfig.tsbuildinfo`).

**2 ajustements apportés à l'archive d'audit avant intégration** :
1. **`.env.local` restauré** — l'audit l'avait retiré à juste titre pour
   une archive de distribution (il contient la clé API et le
   `client_id`), mais son absence aurait empêché l'appli de se connecter
   à Bungie au prochain lancement. Il est déjà couvert par `.gitignore`,
   donc aucun risque de le versionner par accident.
2. **`tsconfig.tsbuildinfo` retiré et ajouté au `.gitignore`** — artefact
   de compilation incrémentale, introduit par l'archive d'audit et non
   couvert jusqu'ici.

📌 **Recommandations de l'audit non traitées** (volontairement, ce sont des
chantiers à part entière) : suite de tests automatisés (Vitest),
`package-lock.json`, wrapper commun pour les appels Bungie, et passage de
l'OAuth derrière un backend/BFF si l'appli devenait publique. Le rapport
contient aussi une feuille de route pour un futur agent IA. Voir
`AUDIT-2026-09-06.md`, conservé à la racine.

**Résumé fourni par l'auditeur** (déplacé ici le 21/09 : il avait été
ajouté en toute fin de fichier, hors de l'ordre chronologique) :
- OAuth : `state`, validation du callback, refresh concurrent protégé et invalidation lors d'une déconnexion.
- Bungie : gestion explicite des `ErrorCode` même sur HTTP 200 et sélection du Cross Save primary membership.
- Équipement : distinction correcte entre `DestinyItemNotFound` (1623) et `DestinyItemAlreadyInInventory` (1632), nettoyage systématique des états UI.
- Manifest : validation des réponses et protection contre les téléchargements concurrents.
- Recherche : index persistant versionné et compacté.
- Scoring : plafonnement des stats individuelles à T20 avant pondération.
- Loadouts : validation minimale des imports et cache DIM lié au compte Bungie.

---

**Réorganisation du scoring — ordre, renommages, source unique, et
plafond du Pilier 1**

Chantier noté le 26/08 (« ne rien coder pour l'instant »), réalisé
aujourd'hui à la demande de l'utilisateur. Les PONDÉRATIONS ne changent
pas, ni les identifiants internes (`element_doctrine`, `verbes_element`,
etc.) — seuls l'ordre d'affichage, les libellés, et le barème du Pilier 1.

**Nouvel ordre et renommages** :
| Avant | Après |
|---|---|
| 1. Élément & Doctrine | 1. Élément et Doctrine |
| 2. Verbes d'Élément | **4. Effets du Build** |
| 3. Perks d'Artefact | **2. Artefact** |
| 4. Loot & Cohérence | **3. Armes et Armures** |
| 5. Statistiques | 5. Statistiques |

**Découverte pendant le chantier : il y avait TROIS copies des libellés,
pas deux.** Le TODO du 26/08 en listait deux (`BlocContexte.tsx` et
l'ordre dans `pillars.ts`) ; la recherche de vérification que ce même TODO
recommandait a révélé une 3e copie indépendante dans `PilierCarte.tsx`.
C'est exactement le motif de désynchronisation qui a déjà causé plusieurs
bugs ici (résumé anti-champion vs Pilier 4, sets réels vs DEMO_SETS, et
surtout l'affichage vs le scoring du Pilier 2 qui ont divergé
silencieusement pendant 3 semaines en août).

**Plutôt que de corriger 3 copies, création d'une SOURCE UNIQUE** :
`src/data/piliers.ts` (`ORDRE_PILIERS` + `LIBELLES_PILIER`). Les trois
endroits l'importent désormais. Un garde-fou en mode développement a été
ajouté dans `evaluerBuild` : si l'ordre du tableau `piliers` s'écarte un
jour de `ORDRE_PILIERS`, un avertissement console le signale
immédiatement, au lieu de laisser le tableau des poids afficher des
valeurs décalées par rapport aux cartes réelles.

**Pilier 1 — plafond abaissé à 75** (remarque de l'utilisateur : un
100/100 pour une doctrine simplement complète est disproportionné).
D'abord fixé à 85 par moi, puis abaissé à **75 sur décision explicite de
l'utilisateur** : « pour le score de la doctrine, mets 75 pts maxi, laisse
les autres blocs à 100 ». Les 4 autres piliers conservent donc bien un
plafond de 100 — vérifié dans le code : Artefact et Effets du Build ont un
`Math.min(100, …)` explicite, Armes et Armures et Statistiques sont bornés
par construction. Une ligne de détail explique le plafond dans
l'interface, pour qu'un 75 sur une doctrine irréprochable ne passe pas
pour un bug.

⚠️ **Honnêteté sur la portée de ce changement** : c'est un
RE-CALIBRAGE, pas une nouvelle mesure. Le plafond baissant pour tous les
builds de la même façon, le classement RELATIF entre deux builds est
inchangé — seuls le score affiché du pilier et ~1,5 point du score global
descendent — 2,5 points de global au total, ce pilier pesant 10 %. Ça
corrige l'impression trompeuse d'un « sans-faute » sur un critère facile,
sans prétendre mesurer quelque chose de nouveau. Relever réellement le niveau d'exigence demanderait un critère
SUPPLÉMENTAIRE, et je n'en ai pas trouvé qui ne fasse pas doublon : la
substance d'une doctrine (verbes produits) est déjà notée par « Effets du
Build », et les malus de stats des fragments par « Statistiques ». Les
compter ici serait précisément le double comptage que la réécriture du
04/08 cherchait à éviter. **À valider par l'utilisateur** : si l'objectif
est de vraiment durcir ce pilier plutôt que de le recalibrer, il faudra
trancher quel critère distinct lui donner.

**Vérifié** : typecheck complet (0 erreur), absence de circularité
d'import (`data/piliers.ts` ne dépend que de `types/build`), et
confirmation par recherche qu'il ne reste plus AUCUNE déclaration de
libellé en double dans le code.

---

**Mise en page des détails du Pilier 2 — regroupement des chaînes et
libellé des ressources**

Les 4 derniers cas en attente (Sentinelle ionique, Facette de
détermination, Murmure de liens, Fil de transmutation) sont confirmés
fonctionnels par l'utilisateur — le chantier "aspects/fragments" est donc
entièrement clos. Deux ajustements d'affichage demandés dans la foulée :

**1. Chaînes regroupées par SOURCE au lieu de par cible** (`pillars.ts`).
Sur Facette de détermination, "Charge d'armure" se répétait sur 5 lignes
consécutives (une par verbe produit) — beaucoup de bruit pour une seule
mécanique. Désormais une ligne par source, listant toutes ses cibles :
`⛓️ Charge d'armure → Maille tissée, Charge éclair, Restauration, Armure
de givre, Surbouclier (condition vérifiée)`.

⚠️ Arbitrage assumé et documenté dans le code : les CONVERGENCES
(plusieurs sources vers un même verbe) ne sont plus lisibles sur une seule
ligne, elles se répartissent maintenant sur plusieurs. Dans les builds
réels observés, une source produisant plusieurs verbes est nettement plus
fréquente que l'inverse — c'est donc ce regroupement qui réduit le plus le
bruit. Vérifié sur une chaîne multi-étapes (grenade prismatique →
Neutralisation/Ralentissement → Gel → Brisure → Armure de givre) : reste
lisible.

**2. Libellé complet des ressources porté dans la ligne**
(`pillars.ts`). Avant : `🔋 Énergie de Mêlée : Dévoration`, où l'icône
seule servait de légende implicite. Désormais : `🔋 Énergie d'aptitude
générée : Mêlée — Dévoration`.

**Vérifié** : rendu contrôlé sur les cas réels (Facette de détermination,
chaîne prismatique multi-étapes) via un harnais isolé reprenant le vrai
moteur ; typecheck complet, 0 erreur.

---

**✅ Problème des aspects RÉSOLU et VÉRIFIÉ — l'hypothèse du 27/08 était
bonne, il lui manquait sa preuve**

L'utilisateur confirme qu'"Invisibilité" apparaît désormais dans les
Verbes d'élément, et transmet la sortie du bouton de diagnostic ajouté le
31/08 (Esquive furtive équipée seule). Le verdict est sans ambiguïté :

```
--- Aspects : Esquive furtive (187655373)
    perks liés : 1
    directe  (0 car.) : (VIDE)
    complete (29 car.) : Esquiver vous rend invisible.
```

**L'hypothèse du 27/08 est donc CONFIRMÉE sur données réelles** : la
description directe d'un aspect est bien vide (0 caractère), le texte
d'effet vivant sur un perk lié. Le correctif (utiliser
`obtenirDescriptionComplete` dans `extraireTextesDoctrineBuild`) était le
bon dès le départ — ce qui manquait, c'était sa vérification. Le reste du
dump confirme que le pipeline se déroule ensuite correctement de bout en
bout : 1 texte transmis à `detecterVerbes`, 1 verbe détecté
(`Invisibilité : source_seule`, 1 mention, source "Esquive furtive").

**Leçon de méthode, à garder** : entre le 27/08 et le 06/09, un correctif
CORRECT a été soupçonné à tort d'être inefficace, uniquement parce qu'il
n'avait pas été vérifié sur de vraies données. Construire l'outil de
diagnostic dès la 2e remontée (plutôt que de tenter un 3e correctif à
l'aveugle) a tranché la question en un aller-retour. À refaire dès qu'un
symptôme résiste à un premier correctif.

**Diagnostic archivé** : flag `diagnosticPilier2` passé à `false`
(`diagnosticsArchives.ts`), conformément à la convention du projet. Le
code est CONSERVÉ avec son verdict en commentaire : c'est l'outil le plus
rapide pour trancher tout futur écart entre ce que l'écran affiche et ce
que le score lit réellement.

📌 **Reste à retester** (mêmes causes probables, jamais revérifiées depuis
le correctif) : Sentinelle ionique, Facette de détermination, Murmure de
liens, Fil de transmutation — tous des aspects/fragments testés seuls,
donc tous dépendants de cette même lecture de description. Voir
`A-TESTER.md`.

---

## 31/08/2026

**Problème des aspects remonté une 2e fois — diagnostic ajouté, et remise
en cause de mon propre correctif du 27/08**

L'utilisateur signale que le problème persiste après le correctif du
27/08. En reprenant tout le chemin (sélection d'un aspect → stockage dans
le build → extraction du texte → détection des verbes), plusieurs choses
ont été VÉRIFIÉES et écartées :

- **La sélection fonctionne** : le panneau de description en cyan sous la
  grille n'affiche QUE les options sélectionnées (`estSelectionne`, qui lit
  `subclass.aspectHashes`). Si l'utilisateur voit "Invisible" en cyan,
  l'aspect est donc bien enregistré dans le build — ce n'était pas un bug
  de sélection.
- **Le build transmis est le bon** : `GrilleDoctrine` reçoit bien
  `monBuild.subclass` (pas une copie ou un état local divergent).
- **Le score est bien recalculé** : le `useMemo` de `DashboardPage` dépend
  de `[monBuild, db]`, et `changerSubclass` crée un nouvel objet.
- **`db` est bien fourni** : sans lui, le Pilier 2 afficherait "Manifest
  non fourni", pas "Aucun verbe d'élément détecté".
- **Aucun filtre par élément** dans `detecterVerbes` qui pourrait écarter
  un aspect.
- **`retirerConditionsDeblocage`** ne supprime pas ce type de phrase.

⚠️ **Remise en cause du correctif du 27/08** : il reposait sur une
hypothèse que je n'ai JAMAIS vérifiée sur un vrai Manifest — que les
aspects ont une description directe vide, le texte vivant sur un perk lié.
Cette hypothèse venait d'un commentaire de code (écrit pour les
Catalyseurs), pas d'une observation. Si elle est fausse, la lecture
directe fonctionnait déjà et mon correctif n'a rien corrigé : la vraie
cause est ailleurs, et je ne peux pas la trouver sans voir les données
réelles.

**Ajouté : `obtenirDiagnosticPilier2`** (`verbes.ts`) + bouton "🔍
Diagnostic Pilier 2 (ce que le score lit vraiment)" dans `DashboardPage`
(flag `diagnosticPilier2` dans le registre centralisé). Il expose, dans
l'ordre exact du pipeline :
1. les hashes réellement stockés dans le build, par emplacement ;
2. **pour chaque hash, la lecture DIRECTE vs `obtenirDescriptionComplete`**
   — c'est la comparaison qui tranchera définitivement l'hypothèse du
   27/08 (si "directe" est vide et "complete" non, elle était bonne ; si
   les deux sont pleines, mon correctif ne servait à rien et il faut
   chercher ailleurs) ;
3. les textes finalement transmis à `detecterVerbes` ;
4. le verdict par verbe (confiance, nombre de mentions, sources) ;
5. les chaînes trouvées.

**Prochaine étape** : l'utilisateur équipe un aspect problématique (ex :
Esquive furtive seul), clique sur ce bouton, et colle le résultat — ça
montrera exactement à quelle étape la chaîne se rompt, sans avoir à
deviner.

---

## 27/08/2026

**BUG MAJEUR corrigé — le Pilier 2 ne lisait jamais le texte réel des
aspects (description sur perk lié), silencieusement désynchronisé de
l'affichage depuis 3 semaines**

Signalé par l'utilisateur lors des premiers tests réels de la checklist :
"Esquive furtive" et "Sentinelle ionique" (deux aspects) affichaient
"Aucun verbe d'élément détecté" dans le Pilier 2, alors que le surlignage
cyan de l'appli reconnaissait bien "invisible"/"Charge éclair" dans leur
texte. Une vraie contradiction : le même mot-clé, le même catalogue, deux
résultats différents.

**Cause trouvée** : `extraireTextesDoctrineBuild`/`extraireTextesEffetsBuild`
(`verbes.ts`, alimentent le Pilier 2) lisaient `displayProperties.description`
DIRECTEMENT sur l'objet Manifest. Or les ASPECTS ont très souvent cette
description directe VIDE — le vrai texte d'effet vit sur un PERK LIÉ
(`perks[].perkHash`), un problème déjà rencontré et documenté en détail
début août sur les Catalyseurs (`obtenirDescriptionComplete`,
`doctrine.ts`, 4 itérations de correctifs les 03-04/08). Le sélecteur de
doctrine (affichage, `obtenirOptionsSousClasse`) utilisait déjà cette
fonction depuis le 03/08 — mais le Pilier 2 (scoring) avait sa PROPRE
lecture, jamais mise à jour en conséquence. Les deux textes divergeaient
silencieusement depuis 3 semaines, sans qu'aucun signal ne le révèle
avant ce test.

**Corrigé** : les deux fonctions réutilisent maintenant
`obtenirDescriptionComplete` (import depuis `doctrine.ts`) au lieu du
champ brut — concatène la description directe ET tous les perks liés,
donc rien n'est perdu par rapport à l'ancien comportement, seulement
gagné. Appliqué uniformément aux 6 emplacements (super/mêlée/grenade/
classe/aspects/fragments) ET aux perks d'armes/armures/artefact, par
cohérence (même si le bug a été trouvé sur un aspect).

**Vérifié** : test d'intégration avec un faux `Database` en mémoire
reproduisant EXACTEMENT le cas signalé (description directe vide + texte
réel sur un perk lié `DestinySandboxPerkDefinition`) — confirme que le
texte est maintenant bien extrait et qu'Invisibilité passe de `absent` à
`source_seule`. Non-régression vérifiée sur le cas inverse (description
directe déjà présente, sans perk lié) : comportement identique à avant.
Typecheck isolé complet : 0 erreur.

**Explique probablement les 5 symptômes remontés d'un coup** (tous des
aspects/fragments testés seuls, donc entièrement dépendants de leur seul
texte pour apparaître dans le Pilier 2) : Esquive furtive, Sentinelle
ionique, Facette de détermination, Murmure de liens, Fil de
transmutation. Confirmé pour Facette de détermination : le texte fourni
par l'utilisateur correspond MOT POUR MOT à la phrase de vérification
déjà codée (`sourcesForcees`/`conditionnel`) — ce n'était donc pas une
erreur de transcription comme suspecté, mais ce même bug de lecture.

⚠️ **Non re-testé en conditions réelles** — vérifié par simulation
(faux DB), pas par un vrai appel à l'API Bungie/Manifest SQLite, qui
reste hors de portée de cet environnement de développement (pas de
`node_modules`, réseau désactivé).

---

Suite à l'audit des 387 compétences (voir entrée juste en dessous), il
restait 2 cas de "payoff orphelin" dus à une ambiguïté de sens qu'un
assouplissement global des marqueurs aurait risqué de casser ailleurs
("Contre les cibles gelées, dégâts augmentés" doit rester un vrai
payoff). Proposition de l'utilisateur : coder ces 2 cas comme des
exceptions PONCTUELLES et VÉRIFIÉES plutôt que de toucher à la logique
générale — exactement le même principe que les liens `produit`/
`ressourceGeneree` conditionnels déjà en place (phrase-signature vérifiée
via `conditionVerifiee`, jamais une supposition).

**Ajouté** : nouveau champ `sourcesForcees?: string[]` sur
`VerbeCatalogue` (`elementVerbs.ts`) - force `aSource = true` pour un
verbe si un texte du build correspond à l'une des phrases-signatures
listées, branché dans `detecterVerbes` (`verbes.ts`) juste après le
mécanisme `sourceImplicite` existant.

**2 entrées codées** :
- `suppression` (Neutralisation) : "Enfant des dieux anciens" (aspect
  Arcaniste Abyssal) — "Les combattants affectés PAR L'ÂME sont aussi
  brièvement neutralisés" ; "affecté par" se rapporte à l'Âme (un autre
  nom), pas à la neutralisation elle-même, ce que notre heuristique de
  proximité ne peut pas distinguer.
- `charge_armure` : "Tir de l'ombre : Carquois de Moebius" (Super Chasseur
  Abyssal) — "Vaincre des cibles tenues en laisse crée des orbes de
  puissance" ; "vaincre" est utilisé au sens générique ("tuer un ennemi"),
  pas comme condition de consommation d'un debuff déjà appliqué.

**Vérifié** sur les deux textes réels : les deux passent maintenant en
"boucle" (source forcée + un vrai payoff détecté par ailleurs dans le
même texte). Garde-fou reconfirmé intact : "Contre les cibles gelées,
dégâts augmentés" reste correctement classé payoff. Typecheck isolé
complet (`elementVerbs.ts`, `verbes.ts`, `pillars.ts`) : 0 erreur.

---

**Audit des 387 compétences de doctrine (3 classes × 6 éléments) — 4
correctifs trouvés et vérifiés via le nouveau bouton de diagnostic**

L'utilisateur a utilisé le bouton "🔍 Copier les compétences de cette
doctrine" ajouté plus tôt dans la journée pour transmettre 18 fichiers
texte (Super/Mêlée/Grenade/Saut/Compétence de classe/Aspects, 3 classes ×
6 éléments dont Prismatique). Parsés en 387 entrées individuelles
(nom + description), rejouées à travers le VRAI moteur de détection
(`detecterVerbes`, catalogue et logique de classification réels, aucun
mock) via un harnais isolé — la même méthode déjà utilisée pour vérifier
les correctifs précédents, mais cette fois à l'échelle du corpus complet
plutôt qu'un cas à la fois.

**Résultat avant correctifs** : 233 source_seule, 84 indéterminé, 15
payoff orphelin, 7 boucle (sur 339 détections non-absentes).

**4 correctifs trouvés, testés un par un avec diff avant/après sur
l'ensemble du corpus (aucune régression sur aucun ne cassait un cas déjà
validé) :**

1. **Formes en "-ant" (gérondif) absentes des marqueurs source**
   (`sourcePayoff.ts`) — "conferant un cumul de Charge éclair à chaque
   coup" (Sentinelle ionique) ne matchait aucun marqueur, alors que
   "confere"/"conferent" existaient déjà. Ajouté le gérondif pour les 10
   verbes de la liste (appliquant, infligeant, octroyant, conferant,
   accordant, rendant, generant, provoquant, declenchant, causant) plus
   les 4 verbes de dégâts ajoutés le 26/08 plus tôt (endommageant,
   blessant, touchant, frappant).

2. **Contamination inter-phrase de la fenêtre de 55 caractères**
   (`sourcePayoff.ts`, `classerOccurrence`) — LE PLUS IMPORTANT des 4.
   Cas réel trouvé sur le fragment "L'itinérant" : « ... provoquent une
   détonation de Suspension. Détruire un Enchevêtrement crée une salve
   de Suspension... ». Le marqueur source "provoquent" est bien présent
   dans la MÊME phrase que le premier "Suspension" - mais le marqueur
   payoff "detruire" de la phrase SUIVANTE (qui ne parle même pas de
   Suspension) tombait dans la fenêtre de 55 caractères et se trouvait
   plus proche en distance brute. Corrigé en bornant `avant`/`apres` aux
   frontières de phrase (., !, ?) : un marqueur d'une AUTRE phrase ne
   peut plus contaminer la classification. A révélé au passage un second
   cas légitime (Charge inflexible → Amplifié, voir point 3) qui était
   fautivement classé "source" par la MÊME contamination inter-phrase
   avant ce correctif.

3. **Variante "sous les effets" (pluriel) manquante** (`sourcePayoff.ts`)
   — seul "sous l'effet" (singulier) était couvert. Trouvé sur "Charge
   inflexible" (Titan Cryo-électrique) : « Sous LES EFFETS
   d'Amplificateur, le bouclier bloque... ». Une fois le bornage de phrase
   (point 2) appliqué, ce cas n'avait plus aucun marqueur du tout
   (indéterminé) ; avec cet ajout, correctement classé payoff (l'aspect ne
   fait que consommer un Amplificateur déjà actif, sourcé ailleurs dans la
   doctrine Arc).

4. **Mot-clé "invisible" (adjectif) manquant** (`elementVerbs.ts`) — seul
   "invisibilite" (nom) était couvert. Conséquence sérieuse :
   **"Esquiver vous rend invisible." (Esquive furtive, Chasseur Abyssal —
   une capacité de BASE, pas un cas exotique) n'était même pas détectée du
   tout**, 0 mention. Ajouté "invisible" aux mots-clés français.

**Résultat après correctifs** : 237 source_seule, 84 indéterminé, 13
payoff orphelin, 8 boucle. Diff précis entrée par entrée (pas juste les
totaux) : chaque changement vérifié individuellement, zéro régression sur
les cas déjà validés (fixtures existantes, mêlée stasique, garde-fou
payoff qualifié, chaîne Transcendance, Facette de détermination).

**13 payoff orphelins restants, tous examinés individuellement — aucun ne
justifie un nouveau correctif de code :**
- 11 sont des payoffs **génuinement corrects en isolation** (Amplifié ×6,
  Enchevêtrement ×3, Secousse/Cécité ×2) : le verbe est sourcé PAR UNE
  AUTRE capacité de la même doctrine, absente du texte testé isolément —
  en situation réelle (build complet), l'agrégation par OU sur tous les
  textes du build donnera correctement "boucle". C'est un artefact de la
  méthode de test (une ligne à la fois), pas un bug du moteur.
- 2 sont des ambiguïtés de sens que le moteur ne peut pas trancher sans
  analyse grammaticale complète : "vaincre"/"affecté par" utilisés dans un
  sens générique ("tuer un ennemi", "combattants concernés par CETTE
  capacité") plutôt que comme condition précise du verbe consommé.
  Documenté comme limite connue plutôt que corrigé à l'aveugle (risque de
  casser le garde-fou "contre les cibles gelées" déjà vérifié).

**84 indéterminés, échantillon examiné** : dominés par le pattern déjà
identifié le 26/08 plus tôt (le verbe-debuff utilisé comme son propre
prédicat sans marqueur : "gèlent/ralentit/suspend les cibles", 23+12+
occurrences pour Gel/Ralentissement) — décision déjà prise de ne pas le
corriger davantage (le fix générique risquerait de recasser le garde-fou
payoff qualifié). Une coïncidence lexicale mineure notée en passant :
"Charge inflexible" (bouclier qui "se brise") matche le mot-clé Brisure
(shatter, censé ne concerner que les cibles gelées stasiques) — reste
"indéterminé", pas de fausse alerte, pas jugé prioritaire de corriger.

**Conséquence sur l'architecture prévue** : la session précédente prévoyait
de faire porter l'ORIGINE du texte (mêlée/grenade/classe vs aspect/
fragment) jusqu'à `detecterVerbes`, pour traiter les capacités de base
différemment. Au vu de ce résultat (237+8 = 245/387 = 63% correctement
source/boucle, seulement 13/387 = 3.4% de vrais cas ambigus après
correctifs), l'approche par marqueurs textuels ciblés s'avère suffisante
pour l'essentiel du corpus — le changement d'architecture plus large est
donc DÉPRIORISÉ, pas nécessaire dans l'immédiat.

**Vérifié** : typecheck isolé complet sur les 4 fichiers concernés
(`sourcePayoff.ts`, `elementVerbs.ts`, `verbes.ts`, `pillars.ts`), 0
erreur.

---

**Nouveau bouton de diagnostic — audit du texte des compétences de
doctrine en un clic**

Suite à la découverte du principe des "identités de capacité" (Transcendance,
grenades prismatiques) et à la remarque de l'utilisateur : "Chaque attaque
de mêlée, chaque grenade, chaque compétence de classe fonctionne sur ce
principe" — les mêlées/grenades/compétences de classe sont le texte le
MOINS bien classé aujourd'hui par `sourcePayoff.ts`, car ce sont des
descriptions DÉFINITIVES de ce qu'applique une capacité équipée (contrairement
aux aspects/fragments, qui expriment de vraies synergies conditionnelles).
Plutôt que de recommencer l'audit à base de captures d'écran (comme pour
les fragments), l'utilisateur a proposé un bouton de diagnostic dans
l'appli elle-même, puisque les textes y sont déjà en clair.

**Ajouté** :
- `obtenirDiagnosticTextesDoctrine` (`src/lib/manifest/doctrine.ts`) :
  formate TOUTES les options de Super/Mêlée/Grenade/Saut/Compétence de
  classe/Aspects d'une sous-classe (pas seulement celle équipée) en texte
  "Nom — Description", groupé par catégorie. Fragments volontairement
  EXCLUS — déjà couverts par l'audit à base de captures d'écran des 24-26/08.
  Réutilise `obtenirOptionsSousClasse`, déjà appelée pour peupler le
  sélecteur visuel de `GrilleDoctrine.tsx` : aucune nouvelle lecture du
  Manifest, juste un nouveau format de sortie sur une donnée déjà résolue.
- Bouton "🔍 Copier les compétences de cette doctrine (Élément)" dans
  `GrilleDoctrine.tsx`, même pattern que les diagnostics existants
  (`<details>`/`<pre>`, "à copier à Claude"). Nouveau flag
  `diagnosticTextesDoctrine: true` dans le registre centralisé
  `diagnosticsArchives.ts` — contrairement aux autres diagnostics de ce
  registre (résolus, la plupart désactivés), celui-ci reste actif tant que
  l'audit des compétences de base progresse élément par élément.

**Découverte annexe en cours de route** : le Saut (`sautHash`) est bien
suivi dans le modèle de données (`SubclassConfig`) depuis le début — mais
`extraireTextesDoctrineBuild` (qui alimente le Pilier 2) ne le lit jamais,
contrairement à Super/Mêlée/Grenade/Classe/Aspects/Fragments. Impact
probablement faible (les sauts ont rarement des effets de debuff/buff),
mais noté dans `TODO.md` pour vérification plus tard.

**Vérifié** : typecheck isolé sur les 3 fichiers touchés
(`doctrine.ts`, `diagnosticsArchives.ts`, `GrilleDoctrine.tsx`) — aucune
erreur imputable à ce changement (uniquement le bruit JSX déjà connu, lié à
l'absence de `@types/react` dans cet environnement sans `node_modules`).

**Prochaine étape** : une fois les textes copiés-collés pour chaque
élément, vérifier chaque mêlée/grenade/compétence de classe une par une
(comme pour les fragments) — en particulier si le texte exprime
uniquement un effet appliqué (source) ou s'il mentionne aussi un vrai
payoff (référence à un debuff déjà présent ailleurs, plus rare mais pas
à exclure). Le changement de code qui en découlera (faire porter l'origine
du texte - mêlée/grenade/classe vs aspect/fragment - jusqu'à
`detecterVerbes`) est délibérément reporté après avoir vu les vrais
textes, pas avant.

---

**3 bugs corrigés — la chaîne Prismatique (Transcendance → grenade →
Neutralisation/Ralentissement) ne pouvait jamais démarrer**

Signalé par l'utilisateur en testant : "Facette de détermination" n'affichait
rien, et sur un build Arcaniste Prismatique avec la grenade prismatique
(Singularité Glacée), Neutralisation et Ralentissement restaient
"indéterminés" au lieu d'être reconnus. Diagnostiqué et vérifié de bout en
bout sur un test d'intégration utilisant les VRAIES fonctions du projet
(`detecterVerbes`, `detecterChainesVerbes`, `enrichirAvecChaines`,
`scoreVerbesDetectes` importées directement, sans mock) — pas seulement des
extraits isolés comme pour les correctifs précédents.

**Bug 1 — asymétrie source/payoff** (`sourcePayoff.ts`). Les marqueurs
PAYOFF sont cherchés des deux côtés du mot-clé (avant ET après), mais les
marqueurs SOURCE n'étaient cherchés QU'AVANT. Ça fonctionne pour la plupart
des phrases ("inflige Brûlure aux cibles"), mais casse structurellement
pour un texte au format "Nom — Description" quand le mot-clé EST le nom
d'une capacité : le nom vient toujours avant sa description, donc le verbe
qui décrit son effet ("applique", "neutralise et ralentit"...) vient
FORCÉMENT après, jamais avant. Corrigé : les marqueurs source sont
maintenant cherchés des deux côtés, comme les marqueurs payoff.

**Bug 2 — Transcendance ne peut jamais être "source"** (`elementVerbs.ts`,
`verbes.ts`). Même après le bug 1 corrigé, un problème plus profond
demeurait : le texte RÉEL de Transcendance (déjà cité dans
`knowledge-base/22_CHAINES_DE_VERBES.md`) ne décrit QUE ce qui se passe
UNE FOIS Transcendant ("Éliminer des cibles quand vous êtes sous l'effet
de Transcendance augmente sa durée" — un vrai payoff auto-entretenu),
jamais un marqueur qui l'"applique" — l'obtention de Transcendance est un
mécanisme intrinsèque de sous-classe (accumulation d'énergie), pas une
phrase à détecter. Sans source, cette pièce maîtresse ne peut jamais
démarrer le parcours en largeur, bloquant TOUTE la chaîne prismatique en
aval, quel que soit le texte des grenades. Nouveau champ
`sourceImplicite` sur `VerbeCatalogue` : pour un verbe d'IDENTITÉ de
capacité (nom d'aspect/grenade plutôt que terme de debuff en prose), la
simple présence du mot-clé prouve la source — marqué sur `transcendance`
et les 3 `grenade_prismatique_*`. Vérifié : avec ce champ, le texte réel de
Transcendance donne maintenant `{aSource: true, aPayoff: true}` →
confiance "boucle" (correct : source ET payoff légitimes, self-entretenu).

**Bug 3 — coquille de terminologie sur "orbe de puissance"**
(`elementVerbs.ts`). `charge_armure` n'avait que "orbe de pouvoir" dans ses
mots-clés français, alors que les 17 descriptions de fragments transcrites
pendant l'audit du 26/08 (Fil de tutelle, Facette de détermination...)
disent TOUTES "orbe de puissance" (le vrai terme du jeu). Résultat :
`charge_armure` ne pouvait jamais obtenir `aSource=true` depuis un texte de
fragment, bloquant tout le lien Charge d'armure → Maille tissée/Charge
éclair/Restauration/Armure de givre/Surbouclier dès le premier maillon.
Ajouté "orbe de puissance"/"orbes de puissance" aux mots-clés.

**Vérifié de bout en bout** (script d'intégration réel, catalogue et
fonctions non modifiés à part les correctifs) :
- Scénario exact de l'utilisateur (Transcendance + Singularité Glacée, SANS
  aucune description connue pour la grenade — juste son nom, le cas le
  plus défavorable) : Neutralisation et Ralentissement passent de
  `absent`/`indetermine` à `source_seule`, la chaîne se poursuit même
  jusqu'à Gel et Brisure.
- Scénario Facette de détermination : les 5 verbes (Maille tissée, Charge
  éclair, Restauration, Armure de givre, Surbouclier) sont maintenant tous
  atteints et notés `source_seule`.
- Scénario Murmure des fractures + mêlée (1er test de l'utilisateur, déjà
  résolu par le correctif précédent) : reconfirmé sur le pipeline réel,
  Ralentissement → Gel → Brisure → Armure de givre au complet.
- Non-régression : les 2 fixtures existantes du projet, plus tous les cas
  de la session précédente (mêlée stasique, payoff qualifié) redonnent
  exactement les mêmes résultats qu'avant.

---

Demandée par l'utilisateur avant de reprendre les tests. Relecture
systématique des 5 fichiers de `src/lib/scoring/` (2229 lignes). Chaque
problème a été REPRODUIT dans un script isolé avant correction, pour
éviter de « corriger » quelque chose qui marchait.

**1. Incohérence de barème : un build défectueux notait moins qu'un build
vide** (`verbes.ts`). `payoff_orphelin` valait 0 point et n'apparaissait
même pas dans la somme du score, alors qu'un build SANS AUCUN verbe est
noté 20 (plancher). Concrètement : un build contenant un seul verbe
orphelin était noté 0, soit MOINS bien que s'il n'avait rien du tout —
absurde, et en contradiction directe avec le principe acté le 04/08 pour
l'indéterminé (« ne pas facturer à l'utilisateur une erreur de NOTRE
détection »). L'orphelin passe à **6 points** : toujours le plus bas des
quatre états détectés (c'est le défaut le plus coûteux quand il est réel),
mais non nul, car une classification orpheline est aussi le symptôme le
plus fréquent d'une limite de notre analyse de texte — comme vient de le
prouver le bug de la mêlée stasique le même jour. L'avertissement explicite
reste affiché dans les détails : c'est là qu'est la valeur pédagogique, pas
dans une punition de score. Effet secondaire bienvenu : le coût d'un
mauvais classement passe de 12 à 6 points.

**2. La synergie d'artefact ratait tout mot-clé accentué** (`pillars.ts`,
Pilier 3). La détection comparait `textesArtefact.includes(m.toLowerCase())`
— du texte encore ACCENTUÉ contre des mots-clés du catalogue écrits SANS
accents (ils sont conçus pour être comparés à du texte normalisé). Vérifié :
`"brulure"` contre *« Vos armes infligent Brûlure »* renvoyait `false`. La
composante synergie (30 % du Pilier 3) était donc systématiquement
sous-évaluée. Même ligne, second bug : `includes` brut réintroduisait le
problème de frontière de mot corrigé le 25/08 ailleurs (« cure » dans
« filobscure »), et ignorait totalement les mots-clés STRICTS du catalogue.
Corrigé en passant par `normaliser`/`positionsMotCleStrict`, comme partout
ailleurs.

**3. Vérification des liens conditionnels trop fragile** (`verbes.ts`). Les
deux endroits qui vérifient une condition (`detecterChainesVerbes` et
`detecterRessourcesGenerees`) faisaient un `includes` sur la PHRASE
ENTIÈRE. Or les champs `conditionnel` du catalogue sont des transcriptions
MANUELLES faites en lisant des captures d'écran pendant l'audit des
fragments : un mot d'écart, une virgule, ou une reformulation de Bungie à
la prochaine saison, et la correspondance échoue SILENCIEUSEMENT — le lien
disparaît sans aucun signal, ce qui est très difficile à diagnostiquer
depuis l'interface (symptôme : « rien ne s'affiche »). Nouvelle fonction
partagée `conditionVerifiee` : exige que tous les mots SIGNIFICATIFS de la
condition soient présents dans un MÊME texte, en ignorant les mots outils
(articles, prépositions) qui sont précisément ce qui varie. Reste une vraie
vérification, testée contre 3 garde-fous anti-permissivité (fragment
absent, autre verbe, mots éparpillés entre deux textes → tous
correctement refusés). Limite connue et documentée : sensible à la
conjugaison (« éliminer » ≠ « éliminant »), compromis délibéré pour ne pas
rouvrir la porte aux faux positifs.

**4. Optimisation du point chaud du Pilier 2** (`verbes.ts`). `detecterVerbes`
analysait le rôle source/payoff sur TOUS les textes du build pour CHAQUE
verbe du catalogue (38 verbes × ~40 textes, avec une recherche par mot-clé
et par marqueur à chaque fois), alors que le filtrage des textes pertinents
était déjà calculé juste au-dessus. Ne parcourt plus que ces textes-là.
Résultat identique (un texte sans le mot-clé ne pouvait de toute façon rien
renvoyer), travail nettement réduit.

**Vérifiés sans bug** : pondérations des piliers (somment bien à 1.00 dans
les 4 contextes), bornes hautes des Piliers 1/4 (mathématiquement
impossibles à dépasser par construction, contrairement au Pilier 5 qui a
déjà son plafond explicite depuis le 04/08), et le traitement des armes
cinétiques dans la cohérence élémentaire (un build 100 % cinétique obtient
100 % — c'est INTENTIONNEL et documenté, une arme cinétique ne doit jamais
compter comme un défaut).

**Typecheck complet** des 5 fichiers de scoring + `GrilleDoctrine.tsx` :
aucune erreur imputable aux modifications.

⚠️ **Confirmation d'un point déjà signalé par l'utilisateur** : le Pilier 1
part bien de 100 et ne fait QUE soustraire, donc une doctrine simplement
complète obtient 100/100. Constaté pendant cet audit, mais **volontairement
NON corrigé** — c'est un changement de barème, à traiter dans la session de
réorganisation du scoring déjà planifiée (voir `TODO.md`, point 0).

---

**Bug critique corrigé — faux "payoff orphelin" sur des perks de source
tout à fait normaux, cassait les chaînes en aval**

Signalé par l'utilisateur en testant le point 1 de la checklist : la
mêlée stasique (confirmée appliquer Ralentissement, "Ralentir" bien en
cyan dans sa description) était classée à tort comme "quelque chose
l'exploite alors que RIEN ne l'applique". Diagnostiqué et reproduit avec
certitude sur un script isolé (logique de `sourcePayoff.ts` recopiée sans
dépendances lourdes) : `MARQUEURS_PAYOFF` contenait les mots bruts
`"cibles"`, `"ennemis"`, `"combattants"`, sans aucune qualification. Une
phrase SOURCE parfaitement normale comme *« Ralentit les combattants
proches »* place presque toujours ce mot juste APRÈS le verbe de debuff —
plus proche que n'importe quel marqueur source situé plus tôt dans la
phrase — ce qui faisait basculer la classification à tort vers "payoff".

**Conséquence en cascade** : comme le graphe de chaînes ne démarre que
depuis un verbe ayant une vraie source (`aSource`), cette seule erreur de
classement sur Ralentissement empêchait TOUTE la chaîne en aval
(Ralentissement → Gel → Brisure → Armure de givre) de se déclencher —
expliquant à la fois le "Murmure des fractures" qui n'affichait rien ET
le "Murmure de liens" qui n'affichait rien non plus (les deux dépendent de
Gel, jamais atteint).

**Corrigé** dans `src/lib/scoring/sourcePayoff.ts` :
- Retrait des 3 marqueurs bruts trop larges de `MARQUEURS_PAYOFF`. Les
  formes QUALIFIÉES restent en place (`"contre des/les cibles"`, `"sur
  des/les cibles"`) puisqu'elles signalent un vrai payoff sans ambiguïté.
- Ajout de verbes source génériques manquants (`"endommage"`,
  `"blesse"`, `"touche"`, `"frappe"` et leurs formes plurielles),
  fréquents dans les descriptions de mêlée qui suivent le patron
  « [Endommage] et [debuff] la cible ».

**Vérifié** sur un script Node isolé (logique recopiée fidèlement depuis
le vrai fichier, sans sql.js/idb) : les 2 textes des fixtures existantes
du projet continuent de classer correctement en "source" (pas de
régression), et 4 formulations plausibles de mêlée stasique basculent de
"payoff" (faux) à "source" ou "indéterminé" (correct/sûr). Typecheck isolé
complet : 0 erreur.

⚠️ **Reste à confirmer en conditions réelles** — je n'ai pas le texte exact
affiché en jeu pour la mêlée stasique, seulement des formulations
plausibles reproduisant le bug. Le retrait des marqueurs bruts est sûr
dans tous les cas (il ne peut plus provoquer de faux payoff), mais je ne
peux pas garantir que TOUTES les formulations réelles retombent bien en
"source" plutôt qu'en "indéterminé" sans voir le texte exact.

---

**Confort — chargement automatique des sous-classes à la sélection de
classe**

Demande de l'utilisateur : "je sélectionne le personnage que je veux et
ça charge automatiquement les 6 Doctrines". `GrilleDoctrine.tsx` déclenche
désormais `listerSousClassesPossedees` automatiquement dans un
`useEffect` dès que la classe change (si `membership`/`db` sont prêts),
au lieu d'exiger un clic séparé sur "Charger mes sous-classes". Le bouton
manuel devient un bouton "Réessayer", affiché uniquement en cas d'erreur
(ex : coupure réseau). Un flag `annule` protège contre une réponse tardive
qui écraserait le résultat d'un changement de classe plus récent (clic
rapide sur 2 classes différentes).

---

Chantier posé le 24/08, conçu le 25/08, notation explicitement reportée —
tranché aujourd'hui. Détail complet du raisonnement dans
`knowledge-base/22_CHAINES_DE_VERBES.md` (section "Notation du Pilier 2").

**Le trou corrigé** : un verbe atteint UNIQUEMENT par ricochet de chaîne
(ex : Gel, quand seul Ralentissement a une vraie source textuelle dans le
build) n'était jusqu'ici pas reconnu comme "sourcé" par le calcul du
score, qui ne regarde que le texte brut — il pouvait donc être classé à
tort en "payoff orphelin" (0 pt, signalé comme un défaut) alors que la
chaîne prouve qu'il est bien produit.

**Corrigé** dans `src/lib/scoring/verbes.ts` :
- Nouvelle fonction `enrichirAvecChaines` : tout verbe cible d'un maillon
  confirmé est traité comme ayant une source effective pour le score,
  sans toucher au champ `aSource` lui-même (reste purement textuel, utilisé
  ailleurs par la couverture anti-champion).
- `calculerConfiance` extraite en fonction partagée (évite de dupliquer
  les 5 branches de décision entre le calcul initial et l'enrichissement).
- Nouveau champ `aIndetermine` exposé sur `VerbeDetecte`, nécessaire pour
  recalculer `confiance` en dehors de `detecterVerbes`.

**Nouveau bonus de score** pour la génération active de ressources
(`src/lib/scoring/pillars.ts`) : +6 pts par type distinct de ressource
généré et confirmé actif, plafonné à 20 pts — volontairement modeste face
à une boucle complète (35 pts), pour rester une caractéristique
additionnelle plutôt qu'un second mécanisme noté à parts égales. Compté
par TYPE (mêlée/grenade/classe/Super/générique) et non par verbe.

**Vérifié par un typecheck isolé complet** (`tsc --noEmit`, stubs
`sql.js`/`idb`/`fflate`/`import.meta.env` reconstitués faute de
`node_modules`) : 0 erreur sur les deux fichiers modifiés, seule une erreur
d'inférence liée à mon propre stub `idb` simplifié (non pertinente,
confirmée sans rapport avec le code changé).

**Précision de l'utilisateur sur le Prismatique** : ce sont les
COMPÉTENCES (Sauts, Mêlées, Grenades, Compétence de Classe, Aspects,
Supers) qui sont piochées dans les autres doctrines — pas les fragments,
qui restent exclusifs au Prismatique (confirme la correction du 26/08
plus haut dans ce fichier).

---

**Audit des fragments complété — Stase, Filobscur, Abyssal, Prismatique
(60 fragments), 20 nouveaux liens/ressources codés**

Fusion réussie : l'utilisateur a apporté un ZIP par élément (6 zips au
total, dont Solaire et Cryo-électrique déjà traités les jours précédents)
depuis l'autre conversation où l'audit avait démarré. Détail complet par
fragment (description officielle, raisonnement retenu/rejeté) dans
`knowledge-base/25_AUDIT_FRAGMENTS.md` ; résumé des liens dans
`knowledge-base/22_CHAINES_DE_VERBES.md`.

**Découverte en cours de route** : les 2 premiers fichiers du zip
Filobscur étaient en fait des doublons du zip Abyssal (chevauchement de
capture d'écran entre deux sessions sans coupure nette) — repérés et
traités une seule fois, sous Abyssal.

**Correction d'hypothèse** : contrairement à ce qui avait été noté le
25/08, le Prismatique a bien 21 fragments qui lui sont EXCLUSIFS
(« Facettes »), il ne pioche pas uniquement dans le pool des 5 doctrines
classiques.

**20 nouveaux liens/ressources codés** dans `elementVerbs.ts` (vérifiés
par un typecheck isolé avec `tsc --noEmit`, aucune erreur) :
- Abyssal : Volatil → Brèche abyssale ; Neutralisation → Brèche abyssale ;
  Brèche abyssale → Dévoration.
- Stase : Ralentissement/Gel → énergie de classe ; Gel → énergie de
  Super ; Gel → Éclat stasique ; Armure de givre → Éclat stasique ;
  Armure de givre → Ralentissement ; Brisure → Armure de givre.
- Filobscur : Suspension → énergie de classe et de Super ; Enchevêtrement
  → énergie de mêlée et → Transcendance ; Maille tissée → Enchevêtrement ;
  Charge d'armure → Maille tissée.
- Prismatique : Transcendance → énergie de Super ; Charge d'armure →
  Charge éclair / Restauration / Armure de givre / Surbouclier (étend le
  lien Filobscur ci-dessus à 4 verbes de plus, un seul fragment
  Prismatique confirmant le mécanisme pour toutes les classes).

---

**Tests validés — session du 25/08 (liste `A-TESTER.md`)**

Les 6 points de la liste « Priorité 1 » et « Priorité 2 » sont confirmés
OK par l'utilisateur après rechargement forcé :
- Miniatures des 7 artefacts (Pilier 3)
- Alignement de la grille d'Artefact (emplacements équipés / paliers T1-T3)
- Icône Micro-missiles (Outillage de Curiosité)
- Vitrine des emblèmes Solo sans mourir (nom superposé, aligné à droite)
- Boutons de diagnostic masqués (Solo sans mourir, Loadouts) et bouton
  🖼️ hashes (Artefact) bien visible
- Correctif « cure »/« soin » (mots-clés stricts par frontière de mot)

`A-TESTER.md` vidé de ces points confirmés ; ne reste que les items en
attente (icônes des 21 perks par artefact, chaînes de verbes).

---

**Découverte : limite de 20 pièces jointes par conversation, nouvelle convention**

En plein audit des fragments Stase et Prismatique, l'utilisateur a atteint
la limite de pièces jointes de Claude.ai — 20 par conversation (pas par
message, un budget cumulé). Vérifié auprès de la documentation officielle
d'Anthropic (support.claude.com), les sources tierces se contredisant sur
ce chiffre.

**Convention de travail adoptée**, documentée dans une nouvelle section du
`README.md` : les fichiers stables du projet vont dans la section
Fichiers du Projet Claude (pas de limite là-bas), les captures d'écran
ponctuelles restent dans le fil de conversation. Quand la limite est
atteinte, une nouvelle conversation démarre dans le même Projet — mais
chaque conversation a son propre bac à sable isolé, donc le transfert de
travail entre deux conversations se fait via un ZIP unique (qui ne compte
que comme une seule pièce jointe, quel que soit son contenu).

**TODO mis à jour** : l'audit des fragments Stase et Prismatique est en
cours dans une AUTRE conversation, en attente d'un ZIP à fusionner avec
l'état actuel — Abyssal et Filobscur restent à faire après cette fusion.

---

**Audit des fragments — 16 fragments Cryo-électrique, 5 nouvelles entrées codées**

Les 16 fragments Cryo-électrique reçus, transcrits fidèlement dans
`knowledge-base/25_AUDIT_FRAGMENTS.md`.

**5 nouvelles entrées codées** dans `elementVerbs.ts` :
- **Cécité → Cécité** (auto-référence conditionnelle, Étincelle de
  brillance) : le graphe gère nativement un verbe qui se produit
  lui-même, sans boucle infinie.
- **Piste ionique → Charge éclair** (Étincelle de décharge).
- **Secousse → Piste ionique** ET **Charge éclair → Piste ionique** (les 2
  déclencheurs d'Étincelle ionique, même condition).
- **Amplifié gagne une production de Super** conditionnelle (Étincelle
  d'amplitude) — même mécanisme que les 3 cas trouvés hier sur
  Embrasement/Blessure solaire, appliqué directement sans nouvelle
  discussion : le mécanisme lui-même était déjà approuvé, l'utiliser sur
  un nouveau verbe est une donnée, pas une décision de conception.

Vérifié : 38 identifiants au total (inchangé), aucun lien orphelin, les 4
conditions testées matchent leur texte réel.

11 des 16 fragments ne révèlent aucun nouveau lien (bonus de statistiques,
modificateurs de durée/magnitude, ou nouvelles sources de verbes déjà
couverts génériquement) — documentés quand même. Un cas noté mais
volontairement non modélisé (Étincelle de balises : le déclencheur combine
Amplifié ET un type de munition précis, un simple lien Amplifié→Cécité
aurait été trompeur).

---

**Sélection automatique du personnage cible selon la classe du build**

Demande de l'utilisateur : charger un loadout remplaçait bien tout
l'équipement, mais laissait le champ "Équiper sur :" sur l'ancien
personnage, obligeant à le changer à la main à chaque fois.

Nouvel effet dans `ResumeBuild.tsx` : dès que `build.subclass.classe`
change (chargement d'un loadout, qui remplace tout le build, OU
changement manuel de classe dans le bloc Personnage & Doctrine), le
personnage correspondant est sélectionné automatiquement.

⚠️ Piège évité en cours de route : `Personnage.classe` vient de l'API
Bungie en MAJUSCULE ("Titan"), alors que `subclass.classe` est en
minuscule ("titan") — même désaccord de casse que le bug
`estDejaSurPersonnage` trouvé plus tôt cette session. Comparaison rendue
insensible à la casse dès l'écriture, pas redécouvert une seconde fois.

Testé sur un cas simulé complet (3 classes, personnage correspondant
retrouvé à chaque fois, cas sans classe choisie géré sans erreur).

---

**Icônes de perks d'artefact : abandonné, incompatibilité de système confirmée**

Test réel sur Outillage de Curiosité : les 35 perks extraits (via
`DestinyArtifactDefinition`) ne correspondent à AUCUN des 21 déjà en code.
Confirmé par l'utilisateur : souci déjà rencontré auparavant, pas une
confusion d'artefact — cette table du Manifest n'expose que l'ANCIEN
système d'artefact saisonnier (5 paliers, 35 perks, un seul artefact actif
par saison), incompatible avec le système actuel (7 artefacts, 3 paliers
chacun).

Commentaire du registre corrigé (`diagnosticsArchives.ts`) : ma mention
d'hier disant que ce bouton avait servi aux traductions officielles était
fausse — celles-ci viennent des fichiers texte fournis directement par
l'utilisateur, pas de cette extraction JSON. Documenté dans le TODO comme
piste abandonnée, pas de solution alternative connue tant que Bungie n'aura
pas mis cette table à jour.

---

**Bloc Connexion réarrangé, plus compact**

Demande de l'utilisateur : rendre le bloc plus compact par
l'ARRANGEMENT, pas en réduisant la taille du texte (doit rester aussi
lisible). Le résumé du compte (Compte / Personnages / Objets dans le
coffre) occupait 3 lignes de liste séparées — condensé sur une seule
ligne, séparateur "·", même taille et couleur de texte qu'avant pour
rester visuellement cohérent.

---

**Cohérence entre les deux boutons d'équipement, retrait de "bêta"**

Demande de l'utilisateur : le bouton "Équiper le build en jeu" (Mon
Build) devait se comporter comme celui des Loadouts, qui affiche une
vraie pop-up listant précisément ce qu'il reste à configurer en jeu
(sous-classe, aspects, fragments...) plutôt qu'une note textuelle noyée
en fin de message.

**`RappelDoctrine.tsx` créée** : pop-up extraite de `PanneauLoadouts.tsx`
en composant partagé, réutilisée dans `ResumeBuild.tsx`. Code mort nettoyé
dans `PanneauLoadouts.tsx` après extraction (`majuscule`, import
`obtenirDefinition` devenus inutiles).

**Mention "bêta" retirée** partout dans `ResumeBuild.tsx` (bouton
individuel, bouton global, confirmation, message d'avertissement) —
fonctionnalité déjà testée et confirmée à plusieurs reprises. Le rappel de
vérifier le résultat en jeu est conservé tel quel.

**Nouvelle mise en garde ajoutée** : le transfert d'objets ne peut se
faire qu'en orbite ou hors-ligne, jamais en pleine mission, assaut, raid,
donjon ou match d'Épreuves — contrainte du jeu lui-même, jamais mentionnée
jusqu'ici.

**Texte obsolète retiré** au-dessus de "Mon Build" (`DashboardPage.tsx`) :
le nom du build affiché ("Build : X") n'était plus à jour. La phrase
d'instruction qui suivait (recherche/inventaire pour ajouter des
objets) a été DÉPLACÉE, pas supprimée : elle apparaît désormais juste sous
le titre du bloc "Mon Build" lui-même.

---

## 25/08/2026

**« Emplacements équipés » mis en évidence**

Demande de l'utilisateur : ce libellé était en gris comme le reste de la
phrase d'instruction, peu visible. Mis en blanc et gras, le reste de la
phrase reste discret.

---

**🔴 Second bouton piégé dans le même diagnostic archivé qu'hier**

Signalé par l'utilisateur, qui cherchait le bouton d'extraction de
l'artefact actif sans le trouver. Même piège exactement qu'hier avec
« 🖼️ hashes » : j'avais sorti CE bouton-là du bloc archivé
(`diagnosticManifestArtefact`), mais oublié que « ⬇ Extraire l'artefact
actif » — le plus utile des deux, celui qui a servi aux traductions
officielles et sert désormais aux icônes de perks — restait piégé dans le
même bloc désactivé.

Corrigé avec sa propre entrée active (`extraireArtefactActif: true`) dans
le registre. Le second bouton (« 🔍 dev », diagnostic brut) reste
correctement archivé — confirmé impasse hier, aucune raison de le
réactiver. Registre et code revérifiés alignés : 14 entrées, 14 usages
réels.

---

**Bannière emblème retirée — préférence de l'utilisateur après test**

Testée en jeu, fonctionnait correctement (position finale à 20%
confirmée), mais l'utilisateur préfère le sous-titre en texte simple
d'origine. Retirée entièrement, imports devenus inutiles nettoyés.

---

**Position du pseudo corrigée par mesure précise, plutôt qu'une estimation**

L'utilisateur a fourni la vraie texture de l'emblème (sans le montage
in-jeu de la capture précédente). Mesure par analyse de pixels (détection
des tons bleu/violet du motif) : le motif net se termine à 17% de la
largeur, pas 26% comme estimé à l'œil sur la première capture. Corrigé à
20% (quelques points de plus pour l'espacement demandé).

---

**Emblème « Spécialiste des Légendes » ajouté en en-tête**

Demande de l'utilisateur, pour marquer le début de l'audit des fragments.
Hash 4077939641 confirmé par recherche externe (« Lore Scholar » en
anglais). Résolu dynamiquement via le Manifest (`secondaryIcon`, la
plaque nominative large — même champ que les emblèmes de donjon), jamais
codé en dur.

Pseudo « Orynick/Orygamer » superposé, positionné à ~26% depuis la gauche
d'après une capture d'écran fournie par l'utilisateur — un montage in-jeu
avec titre et puissance, non utilisé tel quel : seul le repère visuel du
motif bleu/violet (environ le quart gauche de la largeur) a servi à
calibrer le positionnement.

⚠️ Réseau du bac à sable restreint à une liste d'hôtes autorisés,
bungie.net n'y figurant pas — impossible de télécharger l'image
directement pour vérifier le calibrage au pixel près. Positionnement basé
sur une estimation à partir de la capture fournie, à confirmer visuellement
par l'utilisateur.

---

**Légende ajoutée pour ⛓️/🔋 dans le pilier Verbes d'Élément**

Demande de l'utilisateur : les deux symboles introduits par le graphe de
chaînes n'avaient aucune explication à l'écran. Ajoutée juste sous le
titre, visible uniquement sur ce pilier (le seul à les utiliser).

---

**🔴 Bug corrigé : un perk affichait sa description à la place de son nom**

Signalé par l'utilisateur : le perk « Transport de Horde » (Outillage de
Curiosité, T1) affichait sa description dans le champ nom du bouton. Cause
trouvée : lors de la traduction d'origine, la première phrase de la
description ("Les dégâts d'arme infligés aux cibles Effilochées font
parfois apparaître une Brindille.") avait été placée dans `nom` par
erreur, perdant le vrai titre du perk. Corrigé dans `artefacts.ts` ET dans
le fichier source (`knowledge-base/15`).

Vérifié systématiquement sur les 147 perks : 6 autres noms dépassent 30
caractères, mais aucun ne contient de guillemets internes (signe d'une
description égarée) — tous sont de vrais titres de perks longs, pas une
récidive du même bug.

---

**`ressourceGeneree` étendu pour supporter les conditions**

Demande de l'utilisateur suite aux 3 fragments Solaire découverts plus tôt
aujourd'hui : le champ passe d'un simple tableau de types
(`["grenade"]`) à un tableau d'objets `{ type, conditionnel? }` — MÊME
principe que `produit`, pour rester cohérent avec le reste du système
plutôt que d'inventer une seconde façon de représenter une condition.

Les 7 entrées existantes (Feu follet, Charge éclair, Piste ionique,
Dévoration, Brèche abyssale, Éclat stasique, Source d'aptitude) migrées
vers la nouvelle syntaxe, toujours inconditionnelles, aucun changement de
comportement.

3 nouvelles productions CONDITIONNELLES codées, trouvées via l'audit des
fragments Solaire : Embrasement gagne de l'énergie de grenade (Tison
d'incandescence) et de l'énergie de Super via un orbe (Tison de
merveilles) ; Blessure solaire gagne de l'énergie de mêlée (Tison à
calciner) — aucun des deux verbes n'en génère normalement.

`detecterRessourcesGenerees` mise à jour pour vérifier les conditions
(accepte désormais `textes` en plus, même principe que
`detecterChainesVerbes`) ; script `tester-avec-fixtures.mjs` et l'appel
dans `pillars.ts` corrigés pour la nouvelle signature. Vérifié sur le
texte exact des 3 captures : les 3 conditions matchent correctement.

---

**Audit des fragments démarré — 15 fragments Solaire, 1 nouveau lien codé**

Les 15 fragments Solaire reçus, transcrits fidèlement dans
`knowledge-base/25_AUDIT_FRAGMENTS.md` (descriptions officielles séparées
des infos communautaires, certaines tronquées comme signalé par
l'utilisateur).

**Un nouveau lien conditionnel codé** : Feu follet → Restauration, si
Tison de clémence est équipé (« Ramasser un Feu follet octroie
Restauration »). Vérifié sur le texte réel de la capture.

⚠️ **Question de conception soulevée, pas encore tranchée** : 3 fragments
(Tison d'incandescence, Tison à calciner, Tison de merveilles) révèlent
qu'un verbe sans ressource propre (Embrasement, Blessure solaire) peut en
gagner une, mais seulement si un fragment précis est équipé — le champ
`ressourceGeneree` actuel est conçu comme INCONDITIONNEL, sans équivalent
au `conditionnel` de `produit`. Pas codé en l'état, en attente d'une
décision de conception plutôt qu'un rafistolage à la volée.

12 des 15 fragments ne révèlent aucun nouveau lien (modificateurs de
durée/magnitude/zone, ou nouvelles SOURCES de verbes déjà couverts par la
détection générique) — documentés quand même, pour ne pas avoir à
revérifier plus tard.

---

**Dernier lien conditionnel comblé : Embrasement → Blessure solaire**

L'utilisateur a transmis une capture d'écran (DIM) du fragment Tison de
charbon, avec sa description officielle exacte : *« Vos Embrasements
solaires infligent des Blessures solaires aux cibles touchées. »* Le seul
lien manquant du graphe de chaînes, faute de donnée hier, est maintenant
codé (`produit` sur `ignition`, `elementVerbs.ts`) — vérifié sur le texte
réel de la capture, la condition matche correctement.

📌 Donnée annexe de la même capture (case « Informations de la
communauté » de DIM) : 40 stacks de Blessure solaire par Embrasement (60
avec Tison de charbon), source COMMUNAUTAIRE, pas officielle Bungie —
notée dans `knowledge-base/22` à titre indicatif, non codée comme une
valeur de jeu certaine.

Le graphe de chaînes de verbes est désormais complet sur les 18 liens
documentés dans le fichier 22.

---

**🔴 Graphe de chaînes de verbes — implémenté, branché sur le Pilier 2**

Chantier de fond posé le 24/08, conçu en détail le 25/08, implémenté ce
même jour.

**Catalogue complété** : les 2 grenades prismatiques Titan/Arcaniste,
documentées et validées depuis le 24/08 mais jamais reportées dans le
code, sont ajoutées (36 → 38 verbes). 17 liens `produit` couverts,
vérifiés sans identifiant orphelin. 7 verbes ont leur `ressourceGeneree`
renseignée.

⚠️ **Un lien volontairement absent** : Embrasement → Blessure solaire
(condition : fragment Tison de Charbon) n'a pas pu être ajouté — la
description officielle de ce fragment n'existe nulle part dans le projet,
seul son nom. Conforme à la décision du 25/08 (vérifier par description,
jamais par nom) : pas de donnée, pas de lien codé.

**`detecterChainesVerbes` et `detecterRessourcesGenerees` ajoutées**
(`verbes.ts`) : parcours en LARGEUR (BFS) du graphe, pas un simple saut —
un verbe atteint PAR LA CHAÎNE peut lui-même continuer à en produire
d'autres, même sans source propre dans le texte du build. 🔴 Bug trouvé et
corrigé EN COURS DE ROUTE : la première version ne suivait qu'un seul
saut, ratant exactement l'exemple validé avec l'utilisateur (la grenade
prismatique de l'Arcaniste produit Ralentissement, qui déclenche Gel « par
ricochet » sans que rien ne le mentionne). Testé sur 3 scénarios simulés :
convergence à 2 sources, ricochet à 2 sauts, verbe non sourcé exclu
correctement.

**Branché sur le Pilier 2** (`pillars.ts`) : nouvelles lignes de détail
(⛓️ chaînes groupées par cible, 🔋 ressources groupées par type),
**n'affecte PAS le score** — la notation reste explicitement REPORTÉE
(décision du 25/08) le temps de savoir précisément ce qui doit être noté.

**Fixture de test ajoutée** (`test-fixtures/manifest-mock.json`, hash 4)
et script `tester-avec-fixtures.mjs` étendu pour exercer le ricochet à 2
sauts sur un vrai build fictif — ⚠️ non exécuté dans cet environnement
(pas de `node_modules`/réseau désactivé ici), à lancer côté utilisateur
pour confirmation.

---

**Grille de l'Artefact alignée en colonnes réelles**

Signalé par l'utilisateur : les 7 emplacements équipés (78px chacun) et les
boutons de perks (110px chacun) utilisaient `flex-wrap` avec des largeurs
différentes — deux lignes de largeurs d'élément différentes ne peuvent
structurellement pas partager les mêmes colonnes, quelle que soit la
largeur du panneau. Remplacé par une grille CSS à 7 colonnes
(`repeat(7, minmax(0, 1fr))`), partagée par les emplacements ET les 3
rangées de perks — garantit un alignement réel plutôt qu'une coïncidence
de largeur.

**Icônes des perks d'artefact : possible, mécanisme déjà à moitié en place**

Question de l'utilisateur : peut-on récupérer les icônes des 21 perks par
artefact ? Réponse : oui, et presque gratuitement — `extraireArtefactActif`
(bouton "⬇ Extraire l'artefact actif", déjà utilisé pour les traductions)
lisait déjà l'icône de chaque perk sans jamais la renvoyer dans son
résultat. Champ `icone` ajouté à `PerkArtefact` et à cette extraction.
Affichage branché dans le sélecteur : dès qu'un perk a une icône, elle
s'affiche automatiquement (14x14, repli silencieux sinon).

Même limite que pour le texte : le Manifest n'expose que l'artefact
ACTUELLEMENT équipé. Récupérer les icônes des 7 artefacts demande de
changer d'artefact en jeu et de relancer l'extraction, un par un — même
procédé déjà utilisé pour les traductions.

---

**Vraies miniatures ajoutées aux boutons d'artefact**

Confirmé par l'utilisateur : les 3 hashes candidats par artefact renvoient
tous la MÊME icône — pas un cas où seul l'un des 3 avait une vraie image.
Le premier de chaque liste est retenu (décision de l'utilisateur), sans
conséquence visuelle.

Nouveau document `knowledge-base/24_HASH_ARTEFACTS.md`, référence complète
des 21 candidats testés. Nouveau champ `itemHash` sur `Artefact`
(`artefacts.ts`), renseigné pour les 7. Sélecteur mis à jour : chaque
bouton affiche désormais sa vraie miniature (24x24), résolue dynamiquement
via le Manifest — jamais codée en dur, comme toutes les autres icônes de
l'appli.

⚠️ Deux imports manquants trouvés par la compilation (`obtenirDefinition`,
`urlIcone`) et corrigés avant validation finale.

---

**🔴 Bug corrigé : le nom du donjon était sorti de l'emblème, aurait dû y rester**

Signalé par l'utilisateur : la dernière refonte avait déplacé le nom du
donjon à DROITE de l'emblème comme élément séparé, alors qu'il doit
toujours rester À L'INTÉRIEUR (superposé sur l'image), la consigne
d'alignement à droite portant sur la position du texte DANS l'emblème,
pas sur sa sortie hors de l'image.

Corrigé : image redevenue pleine largeur, texte superposé avec un
ESPACEUR transparent de largeur fixe (130px, identique sur les 11 lignes)
qui le pousse vers la droite - c'est cet espaceur, pas un padding sur le
texte, qui garantit à la fois le positionnement à droite ET l'alignement
vertical des 11 premières lettres, peu importe le contenu de chaque
emblème. Toujours interdit de passer sur 2 lignes.

---

**🔴 Bouton « 🖼️ hashes » invisible — mal imbriqué dans un bloc déjà archivé**

Signalé par l'utilisateur : le bouton ajouté hier n'apparaissait pas.
Cause trouvée : il avait été inséré À L'INTÉRIEUR du bloc conditionné par
`diagnosticManifestArtefact`, déjà archivé (false) — il ne pouvait donc
jamais s'afficher, quel que soit le mode développement. Sorti du bloc, avec
sa propre entrée `diagnosticHashesArtefact` (true).

**Icône manquante pour Micro-Missiles (Outillage de Curiosité) corrigée** :
aucune forme n'existait pour ce type d'arme (Rocket Sidearm). Plutôt que
d'inventer une icône sans référence visuelle réelle, réutilise le tracé
exact de Lance-roquettes — les deux tirent des projectiles de type
missile, approximation assumée et documentée comme telle plutôt que
cachée.

Confirmé : les icônes d'éléments des boutons d'artefact utilisent déjà les
icônes officielles du Manifest (`urlOfficielle`), aucune régression.

**Vitrine des emblèmes redessinée une 3e fois** : nom du donjon déplacé À
DROITE de l'emblème (n'est plus superposé dessus), demande de
l'utilisateur. Image à largeur FIXE (48px) : c'est elle qui garantit
l'alignement vertical des 11 premières lettres, pas un réglage sur le
texte. `whiteSpace: nowrap` + `textOverflow: ellipsis` interdisent
formellement le retour à la ligne — un nom trop long serait tronqué avec
des points de suspension plutôt que de passer sur 2 lignes.

**Boutons de diagnostic masqués** (Solo sans mourir ET Loadouts), demande
de l'utilisateur. 5 entrées passées à `false` dans le registre :
`etatBrutTriomphes`, `definitionCompleteTriomphe` (nouvelle entrée),
`verificationEmblemes` (nouvelle entrée), `elementFigeLoadout`,
`hashesDoctrineComplets` (⚠️ celui-ci était gardé actif "au cas où" sur
demande explicite antérieure — l'utilisateur revient sur cette décision).
Registre et code vérifiés alignés : 13 entrées, 13 usages réels.

⚠️ **Deux erreurs de manipulation corrigées en cours de route** : lors de
l'ajout des nouvelles conditions de garde sur 2 boutons existants, le
remplacement a supprimé par erreur le code du bouton lui-même (pas
seulement la ligne visée) à deux reprises. Repéré immédiatement par la
compilation (`brut` référencé sans être défini), corrigé avant de
continuer.

---

**Encensoir à feuilles de Reine ajouté au diagnostic de hashes**

Les 3 hashes candidats manquants transmis, les 21 candidats des 7
artefacts sont désormais tous pré-remplis dans le bouton « 🖼️ hashes ».

---

**Diagnostic pour trancher entre les 3 hashes candidats par artefact**

L'utilisateur a transmis 3 hashes `DestinyInventoryItemDefinition` par
artefact (6 artefacts, 18 hashes — « j'ignore pourquoi j'en ai 3 »),
partageant tous exactement le même nom affiché. Confirmé : convention
connue du Manifest Bungie, plusieurs définitions (l'objet équipable réel,
une entrée de collection, parfois une copie inerte) partagent souvent le
même texte, sans que rien ne les distingue par le nom seul.

Vérifié au passage que `DestinyArtifactDefinition` (table dédiée à la
structure des artefacts, déjà utilisée par un diagnostic existant) ne
contient PAS d'icône exploitable — seulement les tiers et perks de
l'artefact ACTUELLEMENT équipé, pas une image pour un artefact choisi par
nom. L'icône vient donc bien de l'un des 3 candidats trouvés par recherche
de nom, comme fait par l'utilisateur.

**`comparerCandidatsIcone` ajoutée** (`search.ts`) : plutôt que de deviner
lequel des 3 est le bon, compare directement leurs icônes — le bon
candidat est celui qui en a une vraiment renseignée, les copies inertes
n'en ont généralement aucune. Bouton dédié (**🖼️ hashes**) dans le
sélecteur d'artefact, avec les 18 hashes déjà transmis pré-remplis (un
doublon retiré : « Outillage de curiosité » apparaissait deux fois avec les
mêmes 3 hashes dans le fichier source).

⚠️ **Il manque un 7e artefact** dans le fichier transmis : Encensoir à
feuilles de Reine. À chercher séparément.

---

**Fusion des blocs Personnage et Doctrine**

Demande de l'utilisateur : « ça me semble plus logique » de n'avoir qu'un
seul bloc. Le blocage historique (hashes de classe Titan/Chasseur non
résolus, noté depuis le tout début du projet) était déjà levé depuis le
04/08 — les 18 hashes de sous-classe (3 classes × 6 éléments) étaient déjà
en place, la fusion n'attendait donc plus que d'être faite.

`SelecteurPersonnage.tsx` supprimé, son contenu (sélecteur de classe, note
explicative, avertissement) déplacé dans `GrilleDoctrine.tsx`, qui recevait
déjà `classeActuelle` en prop sans jamais la gérer lui-même — aucun conflit
d'état à résoudre, `SelecteurPersonnage` n'ayant aucun état interne.
En-tête renommé « Personnage & Doctrine (Pilier 1) ». Un second
avertissement existant dans `GrilleDoctrine` (spécifique au chargement des
sous-classes, conditions différentes du premier) a été conservé mais
reformulé, sa référence à « un bloc Personnage ci-dessus » étant devenue
incohérente.

**Fonctionnalités des deux blocs vérifiées avant fusion** : les 3 boutons
de classe avec icônes, la note « la classe ne modifie aucun score », les
deux avertissements distincts (aucune classe choisie / sous-classes non
chargeables) — tous présents dans le bloc fusionné.

**Recherche des hashes d'artefacts** : pas de nouveau code nécessaire, la
recherche normale du Manifest (catégorie « Toutes ») couvre déjà les
artefacts (`DestinyInventoryItemDefinition`), comme pour les emblèmes.

---

**🔴 Second bug de pluriel trouvé : Blessure solaire, Armure de givre, Maille tissée**

Signalé par l'utilisateur : « Blessure solaire » pas surligné sur certains
fragments (Tison de cendres, Tison à roussir). Exactement le même défaut
que « cure »/« soin » corrigé plus tôt aujourd'hui : `motsClesFr` ne
contenait que « blessure solaire » au singulier — « Blessures solaires »
(pluriel, présent dans le texte réel de ces fragments) ne matchait pas,
le « s » final cassant la correspondance en sous-chaîne.

Audit systématique des mots-clés à plusieurs mots : 2 autres verbes
partagent exactement le même défaut (un seul mot-clé, jamais son
pluriel) — **Armure de givre** et **Maille tissée**. Les deux corrigés en
même temps. Plusieurs autres verbes (Feu follet, Charge éclair, Piste
ionique, Brèche abyssale, Cristal de Stase) avaient déjà les deux formes,
vérifiés sans besoin de correction.

**7 artefacts désormais tous nommés en français**, y compris dans le
sélecteur : 4 noms manquaient encore (Disque de données cryptées,
Outillage de Curiosité, Journal du Chasseur, Régulateur répulsif ANP) — le
menu déroulant affichait leur `nom` brut, resté en anglais depuis le
début, alors que seuls les PERKS avaient été traduits. Nouveau champ
`nomEn` sur `Artefact` : préserve le nom d'origine plutôt que de l'écraser.

**🔴 Bug d'assignation aux emplacements corrigé** : un perk T3 sélectionné
en premier apparaissait dans un emplacement plafonné à T1 ou T2 s'il
restait de la place, signalé par l'utilisateur. `perkDeLEmplacement(index)`
lisait `cles[index]` directement — l'ORDRE de sélection, jamais vérifié
contre le plafond réel de l'emplacement (`PLAFOND_TIER_PAR_SLOT`, posé le
04/08). Remplacé par un vrai calcul d'assignation : les perks T3 réservent
en priorité les 2 seuls emplacements plafonnés à 3, T2 et T1 se répartissent
ensuite dans ce qui reste, en respectant toujours le plafond de chaque
emplacement. Testé sur 3 cas (T3 isolé, sélection complète, débordement de
T1) — comportement conforme dans les 3.

**Menu déroulant remplacé par des boutons individuels**, un par artefact,
demande de l'utilisateur (« comme pour les armes »). ⚠️ Sans vraie
miniature : `Artefact` n'a aucun `itemHash` permettant de résoudre une
icône réelle depuis le Manifest, contrairement à une arme dont l'icône
vient de l'inventaire réel du joueur — inventer une image aurait été
exactement l'erreur qu'on a appris à éviter cette session. Les icônes
d'éléments/armes compatibles (déjà officielles) remplissent ce rôle en
attendant. Import `MenuDerouantIcone` devenu mort, retiré.

---

**🔴 Bug corrigé : les perks T3 s'affichaient dans des emplacements T1/T2**

Signalé par l'utilisateur : un perk T3 sélectionné se plaçait dans un
emplacement plafonné à T1 ou T2 s'il restait de la place, et n'apparaissait
dans un vrai emplacement T3 que lorsque les autres étaient déjà pleins.

**Cause trouvée** : `perkDeLEmplacement(index)` lisait `cles[index]`
DIRECTEMENT — l'ordre de sélection du perk dans le tableau, pas
l'emplacement visuel où il devait apparaître. Le plafond de chaque
emplacement (`PLAFOND_TIER_PAR_SLOT`, posé le 04/08) n'était vérifié nulle
part au moment de l'affichage — seulement lors de la SÉLECTION
(`raisonBlocage`, qui limite bien le nombre total de perks par palier, mais
ne dit rien sur QUEL emplacement visuel un perk occupera).

**Corrigé** : calcul d'une vraie assignation, une seule fois pour les 7
emplacements, respectant la règle déjà posée le 04/08 (un perk de palier
inférieur peut occuper un emplacement supérieur, jamais l'inverse) — les
perks T3 réservent en priorité les 2 seuls emplacements plafonnés à 3
(les plus contraints), puis T2 remplit ses emplacements dédiés en
débordant sur le T3 resté vide si besoin, puis T1 en dernier, le plus
flexible.

Testé sur 3 cas : un perk T3 isolé (doit apparaître en position 5 ou 6,
jamais 0/1), une sélection complète (2 T1 + 1 T2 + 2 T3), et un débordement
de 4 perks T1 (doit remplir les emplacements T2 avant tout emplacement T3)
— les 3 se comportent comme attendu.

---

**Les 11 emblèmes Solo Flawless sont désormais tous corrects**

Dogme fragmenté corrigé : le hash précédent (`748692000`, « Autonomie »)
était en réalité un copier-coller de l'emblème d'Équilibre — confirmé par
l'utilisateur après vérification. Le bon hash pour « Pilote de la
Pyramide » est `3992231368` (un seul chiffre différait de la tentative
précédente qui avait échoué). Vérifié : les 11 hashes sont désormais tous
distincts, aucun doublon.

Item retiré du TODO, section devenue vide nettoyée, renumérotation des
items restants.

---

**Bonus de Set actifs : description affichée avec surlignage cyan**

Confirmé validé par l'utilisateur : détection des bonus de set par le
Pilier 2, cyan présent dans la popup Détails. Demande complémentaire : le
champ « Bonus de Set actifs » de Mon Build n'affichait que le nom du perk
(« ✓ 2p — Nom »), la description restant cachée en infobulle au survol,
jamais lue en pratique. Affichée désormais directement, avec
`surlignerVerbesConnus` — même convention que partout ailleurs dans
l'appli, pas un nouveau mécanisme.

---

**Emblèmes : hash de Prophétie corrigé, doublon suspect signalé, mise en page en bandes fines**

Nouveau hash de Prophétie appliqué (`1138508276`, un chiffre manquant dans
l'ancien) — cohérent, probable erreur de transcription initiale confirmée.

⚠️ **Nouveau hash de Dogme fragmenté volontairement NON appliqué** :
`748692000` transmis par l'utilisateur est identique au hash déjà utilisé
pour Équilibre — collision très probablement due à un copier-coller,
signalée plutôt que d'être silencieusement acceptée (risque de dupliquer
un emblème sur deux donjons différents sans que rien ne le remarque).

**Mise en page revue une seconde fois** : la grille à 2 colonnes tentée
plus tôt dans la journée est remplacée par une seule colonne de bandes
fines à HAUTEUR FIXE (32px), demande explicite de l'utilisateur. Une
hauteur fixe garantit une hauteur totale prévisible (11 × ~34px ≈ 372px)
indépendamment de la largeur du panneau, contrairement à `aspectRatio` qui
aurait fait varier la hauteur avec la largeur disponible. Le nom du donjon
reste superposé, aligné à gauche plutôt qu'en bas (bande trop fine pour un
texte en bas d'image).

⚠️ Le panneau lui-même autorise le défilement au niveau du conteneur
englobant (`overflowY: auto`, hauteur pleine page) — si d'autres éléments
au-dessus de la liste (boutons de diagnostic en mode dev, par exemple)
prennent trop de place, un défilement pourrait malgré tout apparaître. Le
calcul de hauteur ne porte que sur la liste elle-même.

---

**Vitrine des emblèmes : test confirme 9/11, grille compacte avec nom superposé**

Résultat du diagnostic « Vérifier les 11 emblèmes » : 9 emblèmes
parfaitement résolus (nom, image large, icône simple), 2 introuvables dans
le Manifest — **Prophétie (113850826)** et **Dogme fragmenté (3982231368)**.
Ce n'est pas un bug d'affichage : les hashes eux-mêmes ne correspondent à
rien côté Bungie, probablement une erreur de transcription à l'origine. À
rechercher à nouveau par nom exact, pas de correctif de code possible sans
les bons hashes.

**Mise en page revue** : liste verticale (une image pleine largeur par
donjon) remplacée par une grille à 2 colonnes, chaque emblème avec son nom
de donjon superposé directement dessus (position absolue + dégradé sombre
en bas pour rester lisible quelle que soit la couleur de l'emblème). Les
11 donjons tiennent désormais dans le panneau sans défilement.

---

**🔴 Bug corrigé : « cure » causait 11 faux positifs, et « soin » ratait 5 vrais soins**

Suite à la discussion sur les chaînes de verbes, le mot-clé anglais `cure`
(Soin) matchait à tort à l'intérieur de « filobs**cure** »,
« oc**cure**nce », « pro**cure** » — confirmé sur les 7 artefacts, 11 faux
positifs, 0 vrai match. Le défaut touchait les 3 mécanismes de détection
(comptage du Pilier 2, classification source/payoff, surlignage cyan), qui
partagent tous une recherche en sous-chaîne.

**Nouveau mécanisme à deux niveaux**, décidé en conception avec
l'utilisateur : `motsClesStrictsFr`/`motsClesStrictsEn`, cherchés sur
FRONTIÈRE DE MOT (nouvelle fonction `positionsMotCleStrict`,
`search.ts`), en plus de `motsClesFr`/`motsClesEn` qui restent en
sous-chaîne — indispensable pour les racines volontairement tronquées
(`suspend`, `effiloch`...). Approche conservatrice : seul `cure` a été
déplacé, aucune reclassification générale du catalogue sans preuve.

⚠️ **Second problème trouvé en TESTANT ce correctif**, sur la même
entrée : « soin » (nom) et « soign- » (racine du verbe soigner) sont deux
séquences différentes en français, divergeant dès la 4e lettre. Aucune
forme conjuguée (« soigne », « soignez », « soignent ») n'était couverte.
Ajouté `soign` comme racine distincte — vérifié sans faux positif, 5 vrais
soins désormais détectés sur les 7 artefacts qui passaient inaperçus.

Corrigés dans les 3 mécanismes : `detecterVerbes` (verbes.ts),
`analyserTexte` (sourcePayoff.ts, nouveau paramètre optionnel),
`surlignerVerbesConnus` (RenduTextePerk.tsx).

---

**🔴 Bonus de set : angle mort corrigé dans la détection de verbes**

Discussion avec l'utilisateur en préparation du chantier des chaînes de
verbes : les descriptions de bonus de set sont récupérées du Manifest et
affichées à l'écran (Inventaire, Mon Build) depuis longtemps, mais
**jamais transmises à la détection de verbes**. Un bonus de set qui
applique un effet élémentaire n'apparaissait ni en cyan (Pilier 2), ni
dans le score.

**`obtenirBonusSetsActifs` ajoutée** (`armorSets.ts`) : reproduit la règle
de seuil déjà utilisée par `scoreBonusSetsReels` et l'encart de Mon Build
(un bonus ne compte que si le nombre de pièces équipées atteint son
seuil — confirmé par l'utilisateur, contrairement aux perks d'armes
toujours actifs), en ramenant en plus la `description` — la seule donnée
qui manquait pour la détection.

Branchée dans `extraireTextesEffetsBuild` (Pilier 2 uniquement) : seuls les
bonus ACTIFS sont injectés, jamais tous les paliers d'un set — injecter un
palier non atteint aurait fait détecter des verbes que le build ne produit
pas réellement.

**Pilier 4 (anti-champion) volontairement inchangé** : discuté avec
l'utilisateur, aucun bonus de set anti-champion connu à ce jour. Pas de
double comptage à craindre si un cas se présente (aucune des 3 sources
actuelles ne couvre les bonus de set), noté au TODO pour ajout futur si
rencontré en jeu plutôt que codé sur une supposition.

Testé sur un cas simulé (3 puis 4 pièces d'un même set) : le bonus 2 pièces
seul actif à 3, les deux actifs à 4 — conforme à la règle attendue.

---

## 24/08/2026

**Perks divergents arbitrés par tests en jeu de l'utilisateur**

Les 4 vraies divergences trouvées lors de l'audit ont été tranchées une par
une par des tests en jeu, pas par supposition :

- **Douleur contre puissance** : produit des Brèches abyssales dans les DEUX
  artefacts (test en jeu) — la version courte du Disque de Données Cryptées
  était incomplète. Harmonisé sur la version longue.
- **Choc et effroi** : la condition de doctrine (Cryo-électrique ou
  Prismatique) est bien réelle — la version courte du Régulateur Répulsif
  l'omettait. Harmonisé sur la version longue. Coquille de frappe corrigée
  au passage (« sous l'effetr »).
- **Explosion entrelacée** : « avec des dégâts Filobscur » est la bonne
  formulation — l'utilisateur a vérifié que la source des dégâts (arme ou
  compétence) ne change rien tant que l'élément est Filobscur. La version
  du Journal du Chasseur (« avec une arme ») était donc trompeuse.
  Harmonisé.
- **Siphon élémentaire** : ⚠️ VOLONTAIREMENT NON harmonisé. La version de
  la Tablette de la Ruine a une phrase de plus, mais l'utilisateur confirme
  que l'effet final est identique — c'est une formulation plus explicite,
  pas un effet différent. Modifier l'une des deux aurait effacé une
  information utile sans rien corriger.

Corrections appliquées AUX DEUX endroits (fichiers sources de la
knowledge-base ET `data/artefacts.ts`), pour que la base reste la référence
fidèle de ce qui est réellement dans le code.

Vérifié après harmonisation : plus qu'1 divergence de contenu sur les 20
perks partagés, celle de Siphon élémentaire, conservée à dessein.

---

**3 derniers artefacts traduits : les 7 sont désormais complets (147 perks)**

Fichiers reçus de l'utilisateur, intégrés en `knowledge-base/18` (Tablette
de la Ruine), `19` (Sacoche d'apothicaire de Baron-Bourreau) et `20`
(Encensoir à feuilles de Reine). Renumérotation demandée : Armatures
anti-champion 18→21, Chaînes de verbes 19→22, avec les 7 références internes
mises à jour dans le code et le TODO (CHANGELOG laissé intact — historique
daté).

**Vérification demandée : les perks de même nom ont-ils la même
description ?** Audit des 7 artefacts : 20 perks apparaissent dans plusieurs
artefacts, dont **12 avec des descriptions divergentes**. Triés par nature :
- **8 sont des variations d'écriture** (coquilles de frappe comme
  « rapidesavec » ou « poussent poussent », pluriels, casse, jetons d'icône
  légèrement différents) — sans impact sur le sens.
- **4 sont de VRAIES divergences de contenu** : « Choc et effroi » (une
  version ajoute une condition de doctrine équipée), « Douleur contre
  puissance » (une version crée en plus une Brèche abyssale), « Explosion
  entrelacée » (dégâts vs arme comme condition), « Siphon élémentaire » (une
  version ajoute la restitution d'énergie de Super). À arbitrer avec
  l'utilisateur : soit Bungie a réellement des variantes par artefact, soit
  ce sont des écarts de transcription.

**Nouveau verbe : Épuisement.** Trouvé par l'utilisateur dans « Éclat
photonique » (Tablette de la Ruine), qui mentionne une cible « épuisée »
sans jamais définir le terme. Ajouté au catalogue (36 verbes), sans élément
(il vient d'une interaction Champion ou d'une particularité d'arme, pas
d'une doctrine). ⚠️ Vérifié à la demande de l'utilisateur : c'est le SEUL
état de combat des 7 artefacts non couvert par le catalogue — les autres
termes non reconnus sont du vocabulaire attendu (types d'armes, éléments,
ressources). Deux trouvailles annexes : « fait chanceler » (synonyme
probable d'étourdissement) et « Raidance » (coquille de Radiance, dans 2
fichiers).

**🔴 7 jetons d'icône d'arme non résolus, corrigés.** Les 3 nouveaux
artefacts introduisent des types absents de la table de correspondance
(`RenduTextePerk.tsx`) : lance-roquettes, lance-grenades, fusil à
pompe/fusion/fusion linéaire/rayon. Tous étaient DÉJÀ supportés par
`IconeTypeArme` (les chemins SVG existent), mais leurs jetons s'affichaient
en texte brut faute d'être listés dans cette table-ci. Vérifié après
correction : les 28 jetons distincts des 7 artefacts sont tous résolus.

---

**🔧 Passe de débogage et de cohérence (fin de session)**

Audit systématique après une session très dense. Quatre problèmes trouvés,
tous du même type que ceux rencontrés pendant la journée : de la
duplication qui finit par diverger.

- **🔴 `lib/scoring/contexte.ts` : fichier MORT contenant des données
  PÉRIMÉES.** Importé nulle part (seulement cité dans des commentaires),
  mais contenait des copies de `POIDS_PILIERS` et `POIDS_STATS` — dont les
  valeurs avaient DIVERGÉ des vraies (Santé Roaming à 1.5 au lieu de 0.3,
  Arme PvP à 1.0 au lieu de 0.5) : les corrections de calibration validées
  avec l'utilisateur n'y avaient jamais été répercutées. Inerte
  aujourd'hui, mais n'importe quel import futur depuis ce fichier aurait
  réintroduit silencieusement des pondérations fausses. Supprimé, et les
  deux commentaires qui y renvoyaient corrigés.
- **Libellés de contexte dupliqués à 3 endroits** (BlocContexte,
  DashboardPage, BadgeContexte) — exactement le piège des libellés
  d'élément qui avaient divergé. Centralisés : `LIBELLES_CONTEXTE` et
  `ORDRE_CONTEXTES` exportés depuis `BadgeContexte`, les deux sélecteurs
  construisent désormais leur liste à partir de cette source unique.
- **Registre de diagnostics : une entrée en double.**
  `hashesDoctrineLoadout` et `hashesDoctrineComplets` désignaient le MÊME
  diagnostic — le premier créé lors de l'inventaire initial, le second en
  découvrant le « 12e diagnostic oublié », qui était en fait celui-là.
  Doublon inerte retiré : registre et code désormais alignés (10 et 10).
- **`data/artefactsTraductions.ts` : jamais branché, table vide.** La
  fonction `traductionOfficielle` n'est appelée par aucun composant, et
  l'approche d'extraction semi-automatique a été remplacée en pratique par
  les traductions manuelles de l'utilisateur. Conservé (la procédure reste
  valable si reprise un jour) mais son état réel est désormais documenté en
  tête de fichier, pour ne plus induire en erreur à la lecture.

Vérifications automatisées passées : compilation (59 fichiers, 0 erreur),
imports locaux, unicité des ids/noms/mots-clés du catalogue de verbes (35),
unicité et plage des hashes de triomphes et d'emblèmes (11), alignement
registre de diagnostics ↔ code.

---

**Suite du test utilisateur : bug anti-champion trouvé, icônes agrandies, emblèmes codés**

- **🔴 Bug trouvé par le test de Radiance seule** : le résumé visuel
  « Anti-champions » (cases ☑/☐) de Mon Build avait sa PROPRE logique de
  calcul, jamais synchronisée avec le Pilier 4 — pire, elle ne vérifiait
  QUE les armes (jamais les armures exotiques, jamais la doctrine, même
  avant l'ajout de la 3e source). Un build sous Radiance seule montrait le
  Pilier 4 correct mais la case Bloqueur restait décochée. Corrigé en
  extrayant `obtenirChampionsCouverts` (`verbes.ts`), fonction PARTAGÉE
  désormais utilisée par `pillars.ts` ET le résumé visuel — les deux ne
  peuvent plus diverger. Imports devenus inutiles nettoyés dans
  `pillars.ts`.
- **Icônes de contexte agrandies de 3px** aux 3 emplacements (Loadouts :
  16→19px, les deux sélecteurs de contexte : 15→18px), demande de
  l'utilisateur suite au premier test (« pas assez distinctes »).
- **11 hashes d'emblèmes Solo Flawless intégrés** (`triomphesSoloFlawless.ts`),
  fournis par l'utilisateur. Le Trône brisé marqué `emblemeSubstitution: true`
  (pas de vrai emblème dédié pour ce donjon, substitut choisi par
  l'utilisateur). Icône affichée dans la vitrine, résolue DYNAMIQUEMENT via
  le Manifest (comme toutes les icônes de l'appli, jamais codée en dur),
  atténuée pour les donjons non complétés, astérisque + infobulle sur le
  cas de substitution.
- **Signal perdu documenté dans le README** (nouvelle section « Points de
  vigilance et outils de diagnostic ») comme demandé — cause confirmée,
  aucun correctif nécessaire, réparation automatique disponible ; mode
  d'emploi du diagnostic `Destiny2.GetItem` également documenté.

---

**Icônes de contexte (Neutre/Roaming/DPS/PvP) intégrées**

4 vraies icônes fournies par l'utilisateur (image unique, 4 sceaux
circulaires), remplaçant le badge textuel (lettre + couleur) qui existait
faute d'icône dédiée jusqu'ici — la raison d'être de ce repli n'existe
plus.

**Découpage** : détection automatique des 4 zones dans l'image source
(recherche des colonnes/lignes non noires, avec filtrage des artefacts de
compression). Un premier passage a mal calé les limites verticales
(hauteurs de 640 à 943px pour des cercles censés être carrés) à cause d'un
seuil trop permissif capturant un pixel isolé loin de l'icône réelle ;
corrigé avec un critère de densité (une ligne ne compte que si elle a au
moins 15 pixels non noirs, pas un seul).

**Détourage** : fond noir rendu transparent (y compris à l'intérieur des
anneaux) via un canal alpha basé sur la luminosité, pour que chaque icône
se fonde dans l'appli plutôt que de garder un carré noir plaqué derrière.

**Poids** : réduites de 700 Ko à 116 Ko au total (128×128, largement
suffisant même en haute densité pour un affichage à 15-16px) sans perte
visible à la taille réelle d'affichage.

**Intégration** :
- `BadgeContexte` (icônes/BadgeContexte.tsx) réécrit pour afficher l'image
  plutôt que la lettre — un seul endroit à maintenir, réutilisé partout.
- Loadouts (déjà en place, aucun changement de code nécessaire côté
  PanneauLoadouts : `BadgeContexte` y était déjà utilisé).
- Les DEUX sélecteurs de contexte (bloc « 0. Contexte du build » et le
  second point d'entrée dans « Mon Build ») affichent désormais l'icône à
  gauche du libellé, réutilisant `BadgeContexte` plutôt que de dupliquer
  les chemins d'image à 3 endroits différents.

Fichiers servis depuis `public/icones-contexte/` (prembattre nouveau
dossier du projet) plutôt qu'importés en SVG comme le reste de l'appli :
ce sont des images raster fournies par l'utilisateur, pas des chemins
vectoriels à extraire.

---

**🔴 Réparation automatique des loadouts, plutôt qu'une correction manuelle**

Remarque justifiée de l'utilisateur suite à la résolution de "Signal
perdu" : « resauvegardez à la main » n'est pas une vraie solution, le même
problème (un exemplaire démantelé, remplacé, dont l'ancien identifiant
traîne dans un loadout sauvegardé) peut toucher n'importe quel objet à
l'avenir, silencieusement.

**`reparerPiecesManquantes` et `repererEtSauvegarder` ajoutées**
(`stockage.ts`) : pour chaque pièce manquante d'un loadout (détectée par
`trouverPiecesManquantes`, déjà en place), cherche un exemplaire ACTUEL du
même objet (même `itemHash` - le modèle ne change pas, seul l'exemplaire
précis devient invalide) dans l'inventaire réel, et remplace l'ancien
identifiant par le bon.

Bouton **« 🔧 Réparer automatiquement »** ajouté sous l'avertissement
« objet(s) introuvable(s) », remplaçant l'instruction manuelle. Si aucun
exemplaire actuel n'existe (objet réellement démantelé sans remplacement),
la pièce reste inchangée et l'utilisateur en est informé — pas de
réparation possible dans ce cas précis, mais tous les autres cas (le plus
courant : un exemplaire remplacé) se corrigent en un clic.

Testé sur un cas simulé complet : l'objet périmé récupère le bon
identifiant et la bonne origine, l'objet toujours valide reste inchangé.

---

**🔴 Signal perdu : RÉSOLU — ce n'était jamais un bug de code**

`Destiny2.GetItem` confirme, directement depuis les serveurs Bungie, que
l'itemInstanceId sauvegardé (`6917530198022312588`) n'existe plus sur le
compte (`objetTrouve: false`, `DestinyItemNotFound`) — indépendamment de
toute requête de transfert ou d'équipement. L'indicateur « objet introuvable
sur le compte » de l'appli le confirme désormais aussi.

**Explication complète, cohérente avec tous les tests précédents** : DIM
avait réussi le transfert non pas sur LE MÊME exemplaire, mais sur
l'exemplaire ACTUEL de Signal perdu (DIM travaille toujours sur
l'inventaire en direct) — l'ancien identifiant figé dans le loadout
sauvegardé correspond à un exemplaire probablement démantelé depuis.

**Aucun correctif de code nécessaire** : le problème était une donnée de
loadout périmée, pas un bug de transfert/équipement. Les deux diagnostics
ajoutés pendant cette enquête (`verifierPrecisionItemInstanceId`,
`diagnostiquerExistenceObjet`) restent en place, utiles pour de futurs cas
similaires.

**Solution pour l'utilisateur** : resauvegarder le loadout concerné (retirer
puis rajouter Signal perdu depuis l'inventaire actuel) pour capturer le bon
identifiant.

---

**Signal perdu : corruption de précision écartée avec certitude, nouveau diagnostic**

Résultat du test : 1164 itemInstanceId vérifiés, tous préservés à
l'identique. L'hypothèse de corruption numérique est ÉLIMINÉE avec preuve,
pas juste affaiblie. Deux hypothèses désormais écartées par des tests réels
(donnée de transfert périmée — corrigé avec succès sur un autre build ;
corruption de précision — infirmée ici).

Plutôt qu'une 3e supposition à l'aveugle, nouveau diagnostic ajouté :
`diagnostiquerExistenceObjet`, qui interroge Bungie DIRECTEMENT via
`Destiny2.GetItem` sur un identifiant précis, sans transfert ni équipement.
Si Bungie confirme l'objet, le problème vient de la requête d'équipement
elle-même ; s'il dit aussi « introuvable », ça confirmerait que
l'identifiant sauvegardé dans le loadout ne correspond plus à rien de réel
— et il faudrait alors regarder pourquoi l'indicateur « objets introuvables »
de l'appli, censé détecter exactement ce cas, ne l'a pas signalé.
Accessible via un bouton dev (« 🔍 Vérifier un objet chez Bungie »), champ
de saisie pré-rempli avec l'identifiant de Signal perdu.

---

**Signal perdu : DIM réussit, hypothèse de précision numérique vérifiée**

Nouvelle donnée décisive de l'utilisateur : DIM transfère cet objet précis
avec succès, sur le même compte — écarte l'idée d'un objet réellement
introuvable côté Bungie. `itemInstanceId=6917530198022312588` dépasse très
largement `Number.MAX_SAFE_INTEGER` (confirmé : converti en `Number` puis
reconverti en texte, il devient `6917530198022313000`, un identifiant
différent).

**Recherche externe** : Bungie confirme sur son propre forum encoder
délibérément ces grands identifiants (int64) comme du TEXTE entre
guillemets, précisément parce que JavaScript ne gère pas ces nombres avec
précision. Ça affaiblit l'hypothèse d'une corruption à la première étape de
désérialisation - mais ne l'élimine pas complètement, une corruption
pourrait se produire ailleurs dans le code sans qu'aucune conversion
explicite (`Number()`, `parseInt`) n'ait été trouvée en cherchant.

**Diagnostic ajouté plutôt qu'une conclusion hâtive** :
`verifierPrecisionItemInstanceId` compare, pour chaque `itemInstanceId` de
la réponse API, sa forme textuelle EXACTE dans le texte brut (jamais passé
par un parseur numérique) avec ce que `JSON.parse` en a fait. Tout écart
prouverait une corruption ; testé sur un cas sain et un cas corrompu simulé,
les deux détectés correctement. Résultat affiché dans la console
navigateur (mode dev) au chargement de l'inventaire.

---

**🔴 Barre de stat négative — CSS invalide, pas juste un oubli de plancher**

Signalé par l'utilisateur : une stat négative (ex. Santé -10) affichait une
barre bien visible au lieu d'une barre vide. Cause plus subtile qu'un simple
oubli : `Math.min(100, ...)` bornait le haut mais pas le bas, produisant un
`width: -5%` — une valeur CSS **invalide**. Le navigateur ne la ramène pas
silencieusement à 0 : il rejette toute la déclaration, et la barre retombe
sur un comportement par défaut pouvant occuper une largeur arbitraire selon
le contexte. D'où la barre visible pour une valeur négative.
Corrigé : borné des deux côtés (`Math.max(0, Math.min(100, ...))`), avec une
teinte rouge discrète sur la barre et le chiffre pour les valeurs négatives,
distinctes visuellement d'un vrai zéro.

**🔴 Signal perdu et au-delà : abandon de la décision préalable de transfert**

Nouveau test de l'utilisateur : le MÊME échec (« transfert SAUTÉ, jugé déjà
présent ») est réapparu sur 3 objets différents lors de 2 tests distincts,
dont un build qui avait fonctionné auparavant — signe que le problème n'est
pas propre à un objet, mais à la LOGIQUE de décision elle-même.

**Cause probable** : `piece.origine` (qui sert à décider si le transfert est
nécessaire) est une donnée FIGÉE — capturée à un moment donné, potentiellement
périmée si l'objet change de personnage entre-temps (par le jeu normal, ou
même par un équipement précédent fait depuis l'appli). Se fier à cette
donnée pour décider À L'AVANCE de sauter le transfert reproduirait ce bug
indéfiniment, sous des formes différentes, à chaque fois que la donnée
diverge de la réalité.

**Changement d'approche, plus robuste** : abandon complet de la
pré-décision. Le transfert est désormais TOUJOURS tenté ; si l'API répond
`DestinyItemNotFound`, c'est avalé comme signe que l'objet est déjà présent
(confirmé plusieurs fois avec l'utilisateur), pas une erreur fatale — toute
AUTRE erreur de transfert reste bloquante. La vérité vient du serveur au
moment T, plus jamais d'un instantané client qui peut dater.

`itemHash` reste le seul paramètre obligatoire d'`equiperObjet` ;
`dejaSurPersonnage` et les fonctions `estDejaSurPersonnage` (ResumeBuild.tsx,
PanneauLoadouts.tsx) sont retirés, devenus inutiles.

---

**🔴 3e source anti-champion implémentée : capacités de doctrine**

Blocage précédent levé — la source externe non fiable
(`13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`, datée d'avant la 9.7.0, se
contredisant sur un point) est remplacée par **10 verbes confirmés un par
un par citation en jeu de l'utilisateur** au fil de la session, couvrant
les 3 types de Champion :
- Implacable : Embrasement, Cécité, Ralentissement, Brisure, Suspension
- Bloqueur : Radiance, Volatil, Effilochage (corrigé — la citation officielle
  dit à tort Implacables, confirmé anti-Bloqueur par l'utilisateur)
- Surchargé : Secousse, Neutralisation

**Architecture** :
- Nouveau champ `championEtourdi` sur `VerbeCatalogue`
  (`elementVerbs.ts`), rattaché DIRECTEMENT au verbe plutôt qu'une table
  séparée — évite la divergence déjà connue avec les libellés d'élément
  dupliqués ailleurs.
- Nouvelle fonction `extraireTextesDoctrineBuild` (`verbes.ts`), extraite de
  `extraireTextesEffetsBuild` par refactorisation : isole le texte de la
  SEULE doctrine (super/mêlée/grenade/classe/aspects/fragments), sans les
  perks d'armes/armures déjà couverts par les 2 autres sources — les
  mélanger aurait risqué de compter un même champion deux fois.
- Le Pilier 4 réutilise le MÊME mécanisme de détection que le Pilier 2
  (`detecterVerbes`) sur ce texte de doctrine seul, plutôt qu'un nouveau
  système parallèle.

Vérifié sur un cas simulé : 2 verbes détectés dans un texte de doctrine
fictif → 2 champions couverts → barème 80, cohérent avec le calcul attendu.

---

**🔴 Passe complète sur le catalogue de verbes : renommages, créations, et un bug systémique trouvé**

Demande de l'utilisateur suite à la construction du fichier
`knowledge-base/19_CHAINES_DE_VERBES.md` : synchroniser le catalogue de
détection réel (`elementVerbs.ts`) avec la matière documentée.

- **8 renommages** appliqués (Électrocution→Secousse, Aveuglement→Cécité,
  Suppression→Neutralisation, Consumé→Blessure solaire, Ignition→Embrasement,
  Radieux→Radiance, Cotte tissée→Maille tissée, Rupture→Sectionnement — cette
  dernière une entrée orpheline retrouvée, jamais listée dans le fichier de
  doc sous ce nom).
- **12 nouvelles entrées créées** (Feu follet, Charge éclair, Piste ionique,
  Brèche abyssale, Cristal de Stase, Brisure, Éclat stasique, Enchevêtrement,
  Brindille, Effilochage, Transcendance, Grenade prismatique Chasseur) —
  catalogue passe de 23 à 35 entrées.
- **🔴 Bug systémique trouvé en vérifiant** : 6 des 8 renommages n'avaient
  changé QUE le nom affiché (`nomFr`), sans mettre à jour le MOT-CLÉ de
  détection (`motsClesFr`) pour matcher le nouveau terme réel. Résultat :
  ces 6 verbes auraient continué à ne détecter que l'ANCIEN terme dans le
  texte du Manifest, alors que le jeu utilise désormais le nouveau. Trouvé
  par un script de vérification systématique (chaque verbe doit avoir au
  moins un mot-clé qui matche son propre nom affiché) plutôt qu'une
  relecture manuelle, qui aurait probablement laissé passer certaines de
  ces 6 entrées. Corrigé : Secousse, Cécité, Blessure solaire, Embrasement,
  Radiance, Maille tissée reçoivent chacun le mot-clé qui leur manquait.
  Neutralisation et Sectionnement avaient été faits correctement dès le
  départ (nouveau mot-clé ajouté en même temps que le renommage).
- Vérifié : 33 entrées sur 35 matchent leur propre nom (les 2 exceptions
  sont des étiquettes de catégorie créées pour la documentation, pas des
  termes affichés en jeu — comportement attendu).

---

**Signal perdu : hypothèse du délai infirmée, diagnostic ajouté au lieu d'une 3e supposition**

Retest de l'utilisateur : erreur strictement IDENTIQUE malgré le délai de
400ms ajouté. L'hypothèse de la propagation différée côté serveur est donc
écartée — deux hypothèses tentées sans succès sur ce même symptôme
(skip du transfert, puis délai), toutes deux sans effet.

Plutôt qu'une 3e supposition à l'aveugle, le message d'erreur inclut
désormais les PARAMÈTRES EXACTS envoyés à l'API pour cet objet précis :
`itemInstanceId`, `itemHash`, `characterId`, et si un transfert a été
tenté ou sauté. À comparer avec ce que l'utilisateur voit en jeu ou dans un
autre outil, pour savoir si l'identifiant utilisé par l'appli est
réellement le bon — piste sérieuse compte tenu que l'échec touche
systématiquement le même objet précis, jamais les 6 autres.

---

**Deux nouveaux symptômes après le correctif de casse : progrès notable (6/8)**

Test réel de l'utilisateur : 6 objets sur 8 équipés avec succès désormais.
Restent 2 échecs, de nature différente.

- **Signal perdu — échoue maintenant à l'ÉQUIPEMENT, plus au transfert**
  (signe que le transfert réussit). ⚠️ Hypothèse NON CONFIRMÉE avec
  certitude : propagation différée côté serveur Bungie entre le transfert
  et l'équipement, enchaînés jusqu'ici sans délai. Ajouté un court délai
  (400ms) après un transfert réel, avant l'équipement — risque faible à
  tester, à confirmer par un nouveau test.
- **Pochette d'allumettes de Tommy — conflit d'unicité persistant même
  après le second passage.** Répond directement à la question de
  l'utilisateur : le mécanisme à 2 passages ne peut résoudre un conflit
  QUE si l'objet en conflit est REMPLACÉ par un autre objet du MÊME lot
  lors du premier passage. Le cas rapporté (un exotique déjà équipé EN JEU
  sur un emplacement absent du build) ne peut structurellement jamais être
  résolu par un nouvel essai, quel qu'en soit le nombre — rien dans le lot
  ne délogera jamais cet exotique. **Pas un bug à corriger, une limite
  réelle de l'API** : il faut équiper manuellement autre chose sur cet
  emplacement en jeu avant de relancer l'équipement du build. Message
  d'erreur reformulé pour expliquer cette cause précise plutôt qu'un
  conseil générique qui ne correspondait pas au cas réel.

---

**🔴 Transfert toujours tenté à tort : incohérence de casse trouvée**

Nouveau test réel de l'utilisateur : le correctif d'il y a quelques minutes
ne fonctionnait pas, échec identique sur 8 objets déjà sur le personnage.
Le message d'erreur (« Transfert échoué ») a permis de confirmer que
`transfererObjet` était toujours appelée — donc `estDejaSurPersonnage`
retournait `false` à tort.

**Cause trouvée immédiatement** : `piece.origine` est en minuscule
(`"titan"`), mais `personnage.classe` est capitalisé (`"Titan"`, via
`NOMS_CLASSE` dans `api.ts`). La comparaison stricte `===` ne pouvait donc
JAMAIS être vraie, quel que soit le bon personnage — le correctif
précédent était bien conçu mais silencieusement inopérant.

Corrigé avec `.toLowerCase()` sur la classe comparée, dans les deux
fichiers concernés. Revérifié sur les mêmes 3 cas qu'avant, cette fois avec
la vraie casse des données réelles.

---

**🔴 Transfert : le sauter quand l'objet est déjà là, pas juste le tenter**

Test réel de l'utilisateur sur des objets DÉJÀ sur le personnage ciblé :
échec des 8 sur 8, avec exactement `DestinyItemNotFound` — la même erreur
que sans transfert du tout. Mon hypothèse d'hier (« devrait être un no-op
sans erreur ») était fausse. En creusant : `TransferItem` cherche l'objet
dans une source TRANSFÉRABLE (coffre ou autre personnage) ; s'il est déjà
là où on veut l'envoyer, il n'y a nulle part d'où le « prendre » — d'où
l'erreur, logique une fois comprise.

**Corrigé en sautant le transfert plutôt qu'en le tentant à l'aveugle** :
nouvelle fonction `estDejaSurPersonnage` (dans `ResumeBuild.tsx` et
`PanneauLoadouts.tsx`), qui compare `piece.origine` (déjà connu : coffre,
titan, chasseur, arcaniste) à la CLASSE du personnage ciblé. `equiperObjet`
accepte désormais ce booléen en paramètre OBLIGATOIRE (même raisonnement que
`itemHash` la veille : fermer la porte à un futur appel qui l'oublierait
silencieusement).

Vérifié sur les 3 cas réels : objet déjà sur le bon personnage (transfert
sauté), objet sur un autre personnage (transfert nécessaire), objet dans le
coffre (transfert nécessaire).

---

**🔴 Bug d'équipement résolu : le transfert manquait, pas juste l'équipement**

Signalé par l'utilisateur (échec sur 2 objets, `DestinyItemNotFound`,
ErrorCode 1623) — un bug noté depuis le 03/08 sans avoir pu être creusé
faute de détail exploitable. Cette fois, le corps exact de la réponse a
permis de confirmer la cause via plusieurs sources externes indépendantes
(tickets du dépôt officiel `Bungie-net/api`, tutoriels techniques) :
`EquipItem` échoue systématiquement avec CETTE erreur précise si l'objet
n'est pas déjà présent sur le personnage ciblé (coffre ou autre personnage)
— la séquence correcte est TOUJOURS Transfert puis Équipement, jamais
Équipement seul.

**`transfererObjet` ajoutée** (`TransferItem`, format vérifié auprès de
plusieurs sources), appelée systématiquement avant `equiperObjet`. Le
commentaire « confirmé fonctionnel » du 04/08 sur `equiperObjet` portait
donc sur des tests où l'objet était déjà au bon endroit par coïncidence —
le cas qui échoue aujourd'hui n'avait simplement jamais été éprouvé.

⚠️ **`itemHash` rendu OBLIGATOIRE**, pas optionnel, sur `equiperObjet` et
`equiperPlusieursObjets` : `GearPiece.itemHash` n'est jamais absent dans le
type (seul `itemInstanceId` l'est), autant fermer la porte à un futur appel
qui l'oublierait silencieusement et retomberait sur ce même bug sans que
TypeScript ne le signale.

⚠️ **Non vérifié** : le comportement de `TransferItem` quand l'objet est
DÉJÀ sur le personnage ciblé (devrait être un no-op sans erreur d'après la
documentation, mais jamais testé sur données réelles).

---

**🔴 Collision corrigée + tableau EN/FR des armatures documenté**

- **Bug trouvé grâce aux nouvelles observations de l'utilisateur** : le
  mot-clé `ensemble` (ajouté pour « Tir d'ensemble », Felwinter's Lie →
  Implacable) matchait AUSSI « Ensemble à jamais » (Together Forever,
  Drang/Zenith) — qui d'après les observations réelles ne donne jamais
  Implacable, mais Bloqueur ou Surchargé selon l'arme combinée. Toute arme
  utilisant Together Forever recevait donc une réponse fausse depuis que ce
  mot-clé existe. Rétréci à `tir d'ensemble`.
  ⚠️ Correctif secondaire nécessaire : `normaliser()` ne gère pas les
  apostrophes (droites vs typographiques) - un mot-clé avec apostrophe
  aurait pu ne PLUS matcher du tout si le Manifest utilise un style
  différent de celui tapé dans le code. Les apostrophes sont désormais
  retirées des deux côtés de la comparaison, symétriquement.
- **Deux cas volontairement NON codés**, confirmés par l'utilisateur :
  Synergie MIDA et Ensemble à jamais donnent un champion différent selon le
  TYPE D'ARME auquel ils sont combinés (ex: Together Forever + Drang seul =
  Bloqueur, + Micro-missile = Surchargé) — une entrée générique donnerait
  une réponse fausse pour l'un des deux cas. Documentés comme limitation
  connue plutôt que codés à l'aveugle.
- **Tableau complet EN/FR créé** (`knowledge-base/18_ARMATURES_ANTI_CHAMPION_EN_FR.md`),
  à partir de la liste officielle de Destinypedia, croisé avec les 21
  mots-clés du code : confirme la couverture de 19 armatures nommées, une
  connexion possible entre « Cadre Lanceur » (Caster Frame, épées) et
  « Armature de lanceur » déjà confirmée en jeu, une armature légendaire
  identifiée comme manquante (Pinpoint Slug Frame), et le cas d'Ergo Sum
  (épée à perk intrinsèque variable) documenté comme probablement déjà géré
  par la détection existante — non vérifié sur données réelles.

---

**Diagnostic pour les emblèmes Solo Flawless (idée du « tableau de chasse »)**

Idée de l'utilisateur : chaque Solo Flawless débloque un emblème, à afficher
dans la vitrine comme un tableau de chasse. Un des relevés précédents
laissait deviner que les récompenses existent au niveau de la donnée
(`rewardVisibilty` vu dans l'état joueur d'Équilibre), mais sans le hash de
l'emblème lui-même.

Ajout d'un second diagnostic (bouton « 🎖️ Définition complète d'un triomphe
(dev) ») affichant la DÉFINITION COMPLÈTE d'un triomphe (Le Trône brisé,
choisi arbitrairement — la structure sera la même pour les 10 autres) plutôt
que de deviner le nom du champ de récompense (`rewardItems` n'est qu'une
hypothèse à ce stade, jamais vérifiée).

Réutilise `hashVersIdSqlite`, déjà existante et exportée à cette occasion,
plutôt que de dupliquer la conversion hash→id SQLite une seconde fois dans
le code.

`PanneauTriomphes` accepte désormais `db` en prop, nécessaire pour ce
diagnostic.

---

**Vitrine Solo sans mourir : liste sur une seule colonne**

Les 11 donjons, jusqu'ici séparés par « · » avec retour à la ligne
irrégulier selon la largeur du panneau, sont désormais listés un par ligne
en colonne unique. Même code couleur (gris = non fait, blanc = validé).

---

**🔴 Flèche de la vigie résolu : lecture étendue aux records par personnage**

Diagnostic étendu confirmé sur de vraies données : « Flèche de la vigie »,
absent de `profileRecords`, était bien présent dans `characterRecords`
(`state=67`, `complete: true`) sous un personnage précis — l'hypothèse de
la portée personnage, posée hier, est confirmée. Les 5 autres triomphes
« absents » (Fantômes des Profondeurs, Ruine de la Guerrière, Hôte Vesper,
Dogme fragmenté, Équilibre) sont bien réellement non complétés
(`state=4`), cohérent avec ce qu'en attendait l'utilisateur.

`lireTriomphesSoloFlawless` interroge désormais `profileRecords` en
premier, puis `characterRecords` sur CHAQUE personnage en repli si absent
du profil — le premier personnage qui le possède suffit, le triomphe étant
un accomplissement du joueur, peu importe sous quel personnage Bungie le
range en interne.

Vérifié sur les 11 vraies valeurs transmises : **6 accomplis sur 11**,
exactement le résultat attendu.

---

**🔴 Filobscur/Stase résolu : décalage d'un cran dans l'enum, pas un bug de données**

Le diagnostic ajouté hier a fait son travail : `elementFige` valait bien
« filobscur » et l'URL résolue était une vraie icône Bungie valide — les
DEUX corrects du point de vue du code, alors que l'icône affichée était
bien celle de la Stase. Ça signifiait que le bug n'était ni dans la
sauvegarde ni dans la résolution, mais plus profond.

**Confirmé par deux sources externes indépendantes** (le schéma officiel de
l'API Bungie et une bibliothèque tierce reproduisant l'exacte même
énumération) : l'enum réel des types de dégâts est
`None=0, Kinetic=1, Arc=2, Thermal=3, Void=4, **Raid=5**, Stasis=6, Strand=7`.

Ma table `ENUM_VERS_ELEMENT` ignorait l'existence de la valeur 5 (« Raid »,
un type de dégâts spécial réservé à certains affrontements de raid, sans
rapport avec les 6 éléments de doctrine) — ce qui décalait Stase sur 5 au
lieu de 6, et Filobscur sur 6 au lieu de 7. Chercher l'icône de Filobscur
allait donc chercher l'enum 6, qui est en réalité celui de la Stase : URL
parfaitement valide, juste pointant vers le mauvais élément.

⚠️ **Cette table est partagée par la doctrine ET par `obtenirElementArme`**
(la nouvelle icône d'élément sur les armes) : une arme Stase ou Filobscur
souffrait probablement du même décalage, simplement pas remarqué faute
d'avoir testé ces deux éléments précis (« RAS sur les armes » portait sans
doute sur d'autres éléments). Vérifié : aucune copie indépendante de cette
table n'existe ailleurs dans le code, une seule source à corriger.

---

**Icône du bouton « Solo sans mourir » : vrai SVG intégré**

Le crâne dessiné à la main (repli temporaire, faute de mieux à l'époque) est
remplacé par le SVG fourni par l'utilisateur (`raid-complex-svgrepo-com.svg`,
envoyé le 14/08, retrouvé dans les fichiers reçus plutôt que redemandé).
39 sous-chemins, chacun autonome (démarre par son propre ordre `M`),
concaténés en un seul `d` — même technique que les autres icônes
multi-chemins déjà intégrées. Intégrité vérifiée : 29 663 caractères avant
et après intégration.

---

**Diagnostics archivés — registre centralisé**

Demande de l'utilisateur : « on a beaucoup de boutons de diagnostics »,
masquer ceux qui ne servent plus, en pouvant les réactiver au besoin.

Recensé les **11 diagnostics** de l'appli (mode dev), vérifié un par un
lequel répond encore à une question ouverte : **6 archivés** (test
d'insertion de plug, capacité en fragments par aspect, hashes de doctrine
d'un loadout, recherche des triomphes Flawless, contenu Manifest d'un
artefact, correspondances anti-champion brutes sur une arme) — chacun avait
répondu à sa question, confirmée résolue par un test réel ou une décision de
conception. **4 restent actifs** : élément figé Filobscur/Stase, état brut
des triomphes (bug Flèche de la vigie), chemins JSON de recherche (filtre
anti-dialogue), stats brutes d'armure.

**`src/lib/diagnosticsArchives.ts`** créé plutôt que de commenter
`import.meta.env.DEV` un par un dans chaque composant : un diagnostic
archivé passe à `false` dans CE fichier, sans toucher au composant qui le
contient. Pour réactiver : remettre `true`, le bouton réapparaît intact.

---

**Correctif au registre — un 12e diagnostic avait échappé au premier passage**

En vérifiant systématiquement chaque `import.meta.env.DEV` du projet après
la première passe, deux oublis trouvés :
- `PanneauTriomphes.tsx` (état brut des triomphes) n'était pas branché au
  registre — restait visible par coïncidence (la valeur voulue était déjà
  `true`), mais le désactiver n'aurait eu aucun effet ;
- un **12e diagnostic**, non recensé au premier passage : les hashes bruts
  de doctrine complets (Super/Mêlée/Grenade/Classe/Saut) sur chaque loadout,
  celui qui a permis de trouver le bug du Super non sélectionné le 04/08 et
  gardé actif depuis à la demande explicite de l'utilisateur. Ajouté au
  registre (`hashesDoctrineComplets: true`).

**Total final : 11 diagnostics dans le registre, 4 actifs, 7 archivés.**
Audit final confirmé : plus aucun `import.meta.env.DEV` de composant
n'échappe au registre.

---

**🔴 Icône d'élément dupliquée dans l'Inventaire/Coffre/Mon Build, corrigée**

Signalé par l'utilisateur : les armes affichaient leur icône d'élément deux
fois. Cause trouvée : ma propre inattention — `piece.elementArmeIcone`
existait déjà (ajouté sur demande précédente, résolu directement via
`obtenirIconesDamageType(db).get(def.defaultDamageType)`, cinétique déjà
couvert), et je l'avais oublié en ajoutant hier `IconeElementArme` dans la
colonne d'icônes de la carte compacte — sans lien avec ma demande d'ajouter
le cinétique, qui était déjà satisfaite par le mécanisme existant.
Retiré le doublon dans SelecteurInventaire.tsx et ResumeBuild.tsx (carte
compacte), conservé `elementArmeIcone` à gauche du nom comme demandé. Les
popups Détails n'avaient qu'un seul mécanisme, inchangées.

**Icône Filobscur affichant Stase dans les loadouts — cause non trouvée, diagnostic ajouté**

Vérification statique de toute la chaîne (table `ENUM_VERS_ELEMENT`, lecture
du Manifest via `enumValue` brut, formes de repli dessinées à la main, code
de rendu du composant) : tout est correctement étiqueté à chaque étape,
aucun échange de code trouvé — contrairement au bug de l'artefact de la
veille, limpide dès la première vérification. Plutôt que de deviner un
correctif sans cause identifiée, un diagnostic (icône 🔍, mode dev) affiche
la valeur BRUTE de `elementFige` et l'URL réellement résolue au survol.

---

**🔴 Icônes d'élément dans l'artefact : « cryo-électrique » pointait vers Stase au lieu d'Arc**

Signalé par l'utilisateur : icônes Filobscur/Stase confondues dans
l'Artefact, jamais vu ailleurs — bon indice, car la vraie cause est isolée à
un seul fichier. La table de correspondance des jetons `[icone X]`
(`RenduTextePerk.tsx`, propre au rendu des traductions d'artefact — jamais
utilisée dans la Doctrine, Mon Build ou les Loadouts, d'où l'erreur invisible
partout ailleurs) mappait encore `"cryo-électrique" → "stase"`. Cette table
datait d'AVANT la correction du 04/08 qui a établi que « Cryo-électrique »
est le vrai nom FRANÇAIS de l'élément **Arc** (« Arc » étant l'anglicisme
toléré jusque-là) — mise à jour partout ailleurs (`libellesElements.ts`),
mais oubliée dans celle-ci.

**Impact réel mesuré** : 15 occurrences du jeton dans les 4 artefacts déjà
traduits (7 dans Encrypted Data Disk, 2 dans Hunter's Journal, 6 dans NPA
Repulsion Regulator) affichaient donc l'icône Stase au lieu de Cryo-électrique.

Corrigé : `"cryo-électrique" → "arc"`.

---

**🔴 Surlignage des verbes : défaut de CONCEPTION corrigé, pas juste les mots-clés**

Signalé par l'utilisateur : « suspendues » n'apparaissait en cyan que sur
« suspend » (7 lettres sur 10). Premier réflexe — ajouter un meilleur
mot-clé français — **insuffisant** : la zone colorée était bornée à
`mot.length`, la longueur du MOT-CLÉ, jamais étendue à la longueur réelle du
mot dans le texte. N'importe quel mot-clé plus court que le mot affiché
aurait laissé une queue non colorée, quel que soit le mot-clé choisi.

**Corrigé à la racine** : la zone colorée s'étend désormais jusqu'à la fin
du mot complet (premier caractère non alphabétique), peu importe la longueur
du mot-clé qui l'a détecté.

En creusant, deux autres cas du même type ont été trouvés par audit
systématique (mot-clé anglais plus long que le français, matchant un mot
français à l'orthographe proche) : **« suppression »** (coupé après
« suppress », 8/11 lettres) et **« volatiles »** (le « s » du pluriel non
coloré). Deux autres candidats (« amplifié », « gel ») ont été testés et
écartés : les orthographes divergent assez tôt pour qu'aucun chevauchement
ne se produise, pas de bug réel malgré la même différence de longueur.

Testé sur les 3 cas corrigés + un cas déjà fonctionnel (« brûlées ») pour
confirmer l'absence de régression.

---

**Diagnostic Solo Flawless : piste sur la portée « personnage »**

Retour de test très instructif : les 5 triomphes réellement complétés
affichent tous `state=67` avec objectif `complete: true`. Les 6 autres
(dont Flèche de la vigie, que l'utilisateur possède) sont **totalement
absents** de `profileRecords` — pas juste marqués incomplets.

Un triomphe possédé mais absent des données de PROFIL suggère une portée
PERSONNAGE plutôt que compte pour certains triomphes. `characterRecords`
n'avait jamais été lu jusqu'ici, alors que le composant 900 (Records) déjà
demandé devrait normalement le renvoyer dans la même réponse.

Diagnostic étendu : cherche désormais aussi dans `characterRecords`, pour
chaque personnage, quand un triomphe est absent du profil. Pas de correctif
appliqué à la logique de production tant que l'hypothèse n'est pas confirmée
sur de vraies données — à retester.

---

**Icône d'élément sur toutes les armes (cinétique compris) + audit alignement/tailles**

- **Icône de dégâts cinétiques sur les armes cinétiques**, demande de
  l'utilisateur. Aucune convention n'existait pour l'élément d'une arme
  (`obtenirElementArme` n'était utilisée que dans le calcul du Pilier 4,
  jamais affichée) : nouvelle fonction PARTAGÉE `IconeElementArme`
  (`RenduTextePerk.tsx`), branchée aux **4 endroits** où une arme est
  affichée (carte compacte et popup Détails, dans l'Inventaire/Coffre ET
  Mon Build) — fonction unique plutôt que dupliquée 4 fois, pour éviter la
  divergence déjà rencontrée sur les libellés d'élément.
- **Audit d'alignement et de taille**, sur toute l'appli, artefact compris :
  - **sélecteur d'artefact** : éléments et cinétique à 15px, types d'armes à
    16px sur la MÊME ligne du menu — uniformisé à 16px ;
  - **rendu des jetons `[icone X]`** en texte (`rendreJeton`) : trois tailles
    différentes selon le type de jeton (15/15/17), et **aucun alignement
    vertical** défini nulle part dans l'appli pour aucune icône. Un SVG
    inline a par défaut `vertical-align: baseline`, qui le fait paraître
    légèrement bas par rapport au texte environnant — invisible dans une
    rangée d'icônes en flex (l'alignement du conteneur prend le dessus),
    mais visible dans du texte en flux normal. Uniformisé à 16px avec
    `verticalAlign: -3px` sur les trois cas ;
  - le badge textuel « Cin. » (repli avant l'existence de l'icône officielle)
    est remplacé par la vraie icône cinétique ;
  - **légende de la grille Doctrine** (13px) et **palette de sélection
    d'icône des loadouts** (14px) : vérifiées et laissées telles quelles —
    la première est dans un flex qui centre déjà correctement, la seconde
    n'a aucun texte adjacent, donc aucun problème d'alignement réel dans les
    deux cas.

---

**Vitrine « Solo sans mourir » : affichage condensé + diagnostic sur bug signalé**

- **Disposition changée** : liste des 11 donjons TOUJOURRS visible et
  condensée (gris = non fait, blanc = validé), demandée par l'utilisateur à
  la place de l'ancien affichage en deux temps (résumé des accomplis +
  liste dépliable séparée).
- **🔴 Bug signalé, pas encore résolu** : « Flèche de la vigie » (Spire of
  the Watcher) s'affiche en gris alors que l'utilisateur possède le
  triomphe. Hash (4032136335) et logique de lecture du champ de bits
  revérifiés — identiques à ce qui a été transmis et à ce qui fonctionne
  pour les 10 autres donjons. Plutôt que de deviner un correctif sur un cas
  isolé, un diagnostic (bouton « 🔍 Diagnostic état brut (dev) ») affiche
  l'état RENVOYÉ PAR L'API pour les 11 triomphes, valeur `state` et JSON
  brut compris — à transmettre pour identifier la vraie cause.

**4 icônes de munitions/dégâts ajoutées, en attente d'utilisation**

Fournies par l'utilisateur, intégrées dans `IconeMunition.tsx` (munitions
lourdes/spéciales/principales, dégâts cinétiques). Pas encore branchées à un
composant existant — gardées prêtes à l'emploi plutôt que perdues.

---

**🔴 Deux imports cassés corrigés + garde-fou ajouté**

Erreur Vite signalée par l'utilisateur au lancement :
`Failed to resolve import "./auth" from triomphes.ts`. J'avais inventé un
fichier `auth.ts` — la fonction `obtenirAccessTokenValide` vit en réalité
dans **`oauth.ts`**.

⚠️ **Pourquoi la compilation ne l'avait pas signalé** : mon filtre de
vérification masque les erreurs « Cannot find module », normalement des faux
positifs dus à l'absence de `node_modules` dans l'environnement de
développement. Ces faux positifs cachaient une VRAIE erreur — angle mort
sérieux, puisque l'appli ne démarrait plus du tout.

En vérifiant systématiquement tous les imports du projet, **un second import
cassé** est apparu : `BadgeContexte.tsx` importait `../lib/scoring/stats` au
lieu de `../../lib/scoring/stats` (fichier dans un sous-dossier, il fallait
remonter deux niveaux). Passé inaperçu depuis la veille, pour la même
raison.

**Garde-fou : `scripts/verifier-imports.mjs`** — vérifie que tous les
imports de fichiers LOCAUX se résolvent. Ne regarde que les chemins
relatifs, donc aucun faux positif lié aux dépendances npm. À lancer avant
livraison : `node scripts/verifier-imports.mjs`.

---

**Sélecteur d'artefact : icônes officielles, placées après le nom**

Demandes de l'utilisateur, toutes traitées :

- **icônes OFFICIELLES du Manifest** dans le menu déroulant (via
  `urlOfficielle`), au lieu des formes dessinées à la main — celles-ci ne
  servent plus que de repli hors ligne ;
- **icône CINÉTIQUE ajoutée** (Encrypted Data Disk la soutient). Nouvelle
  fonction dédiée `obtenirIconeCinetique` plutôt que d'ajouter l'enum 1 à
  `ENUM_VERS_ELEMENT` : le cinétique n'est PAS dans `DamageElement` (ce
  n'est pas une doctrine), séparation posée délibérément le 04/08 qu'il
  aurait été dommage de casser juste pour récupérer une icône ;
- **icônes placées APRÈS le nom** de l'artefact. `MenuDerouantIcone` gagne
  une option `iconeApres` plutôt qu'un changement d'ordre global : les
  autres menus (type d'arme, anti-champion) restent plus lisibles avec
  l'icône devant, qui sert de repère visuel avant la lecture ;
- **icônes des types d'armes compatibles** ajoutées après les éléments,
  séparées par un trait fin.

**Correction : « Abyssal (Vide) » → « Abyssal »**

Les suffixes « (Vide) » et « (Strand) » ont été retirés : ce sont les noms
ANGLAIS de ces éléments (Void, Strand), sans raison d'être dans une appli en
français. Ils venaient d'une des 3 copies dupliquées du dictionnaire de
libellés, que j'avais conservés « par prudence » lors de la centralisation
la veille — c'était la mauvaise décision, l'utilisateur l'a signalé.

---

**🏆 Vitrine « Solo sans mourir » implémentée**

Panneau glissant à **gauche**, miroir de celui des loadouts (à droite),
avec la disposition demandée : titre en haut, donjons validés alignés et
séparés par « · ». Uniquement une vitrine, aucun lien avec le scoring.

- **Les 11 hashes** confirmés un par un par l'utilisateur, codés en dur dans
  `src/data/triomphesSoloFlawless.ts` avec un avertissement : ces triomphes
  ne suivent AUCUNE convention de nommage (« On avait dit plus jamais ! »
  pour Le Trône brisé, « Devenez l'avatar de Naeem, Ô ma vengeance » pour
  Ruine de la Guerrière), impossible de les retrouver par correspondance de
  nom si un 12e donjon sortait.
- **Lecture de l'état** (`lireTriomphesSoloFlawless`) : niveau **profil**,
  pas personnage — les triomphes de donjon sont partagés entre les 3
  personnages, lire `characterRecords` aurait renvoyé des données
  incohérentes selon le personnage sélectionné.
  ⚠️ **L'état est un CHAMP DE BITS, pas un booléen** : un triomphe est
  accompli quand le bit « objectif non complété » (valeur 4) est à ZÉRO —
  logique inversée, piège classique si on teste naïvement `state === 0`.
  Vérifié sur les 5 états possibles, y compris le cas « absent de la
  réponse » (compté comme non accompli plutôt que masqué : un badge éteint
  est plus informatif qu'un trou dans la liste).
- **Appel API séparé** (composant 900 seul) plutôt que d'élargir celui de
  l'inventaire : le composant Records renvoie des milliers de triomphes,
  alors que l'inventaire est déjà lourd et rechargé à chaque changement
  d'équipement. Ces données ne changent qu'après avoir terminé un donjon.
  Erreur isolée dans son propre `try` : un échec sur cette vitrine
  facultative ne doit pas bloquer le chargement du profil.
- ⚠️ **Aucune image copiée.** L'utilisateur avait proposé un visuel trouvé
  sur Dungeon Report (site communautaire tiers) : écarté, ni vérifiable en
  droits ni rechargeable légitimement via l'API comme les icônes du
  Manifest. Un crâne dessiné en SVG le remplace, dans le même esprit sombre
  et cohérent avec les autres icônes créées pour l'appli.

---

**Vitrine Solo Flawless : les 11 hashes confirmés**

Ruine de la Guerrière (hash 238037026, « Devenez l'avatar de Naeem, Ô ma
vengeance ») confirmé par l'utilisateur — même formulation « ni quitter »
que Fantômes des Profondeurs, déjà couverte par le filtre. Les **11 hashes
sur 11** sont désormais réunis, l'implémentation du panneau peut commencer.

---

**Diagnostic Solo Flawless : 3e variation de formulation trouvée et corrigée**

Fantômes des Profondeurs manquait encore après la correction de la virgule.
Recherche manuelle de l'utilisateur (via le nouveau filtre « Triomphes ») :
sa description utilise « en solo sans mourir **ni** quitter l'activité »,
au lieu de « **sans** quitter l'activité » sur tous les autres. Corrigé :
`/(sans|ni) quitter l'activite/` tolère les deux. **10 hashes sur 11**
désormais confirmés — vérifié sur les 3 formulations réelles rencontrées.

⚠️ Un candidat pour le dernier (Warlord's Ruin, hash 238037026,
« Devenez l'avatar de Naeem, Ô ma vengeance ») a été transmis, mais son nom
ne suit aucun des motifs vus sur les 10 autres et sa description reste à
vérifier avant de l'accepter — pourrait être un triomphe narratif différent
plutôt que le Solo Flawless recherché.

---

**🔴 Filtre anti-dialogue codé** (sur donnée réelle, plus un diagnostic)

Le diagnostic corrigé a fait son travail : « Vise le sac, petit » (Hit the
Bag) matchait « one-two » via son champ **`flavorText`**
(« Warm up that one-two punch! »), un texte d'AMBIANCE que l'appli n'affiche
jamais comme vraie description.

Corrigé en excluant précisément ce champ nommé de la détection « autre
texte », plutôt qu'un motif de dialogue deviné (plus fragile, risquait de
masquer de vraies correspondances). Vérifié sur les vrais cas du
diagnostic : « One-Two Punch » (nom) reste trouvé normalement, « Hit the
Bag » disparaît des résultats puisqu'il ne matche plus que via
`flavorText`.

---

**Filtre « Triomphes » ajouté à la recherche bilingue du Manifest**

Demande de l'utilisateur, motivée par un vrai besoin : « Guerrière » seul en
français ne retrouve rien pour Warlord's Ruin, et la seule façon de vérifier
si c'est un problème de traduction radicale (comme Shattered Throne →
« On avait dit plus jamais ! ») est de pouvoir chercher aussi en anglais.

`DestinyRecordDefinition` (jamais interrogée jusqu'ici) rejoint les tables
recherchées par défaut, avec la même règle que quêtes/ornements/packs : les
résultats de cette table sont **masqués en mode « toutes catégories »**,
visibles uniquement via le nouveau filtre dédié « Triomphes ». Suit
exactement le mécanisme bilingue déjà en place — aucune logique nouvelle à
maintenir, un triomphe bénéficie automatiquement de la recherche FR+EN.

⚠️ Un triomphe n'a ni `inventory` ni `itemTypeDisplayName` (champs propres
aux objets équipables), donc sa catégorie se déduit directement de la table
d'origine plutôt que de passer par `devinerCategorie`, dont toute la
logique suppose un objet.

---

**🔴 Diagnostic anti-dialogue : bug trouvé par l'utilisateur, corrigé**

Chercher « one-two » donnait **0 correspondance** au diagnostic, alors que la
recherche normale trouvait 3 résultats (dont « Vise le sac, petit », la
réplique de PNJ exactement cherchée) — capture d'écran à l'appui.

**Cause** : le diagnostic n'interrogeait QUE `dbFr`, le Manifest français.
« One-two » est un terme anglais, absent du texte brut français par
construction — le diagnostic ne pouvait STRUCTURELLEMENT rien trouver, quel
que soit le mot-clé anglais recherché. La recherche normale, elle, est
bilingue (les 3 résultats de la capture étaient tous marqués « trouvé via
l'anglais »).

Corrigé : `diagnostiquerCorrespondances` accepte désormais `dbFr` **et**
`dbEn` (comme la recherche normale), et indique pour chaque correspondance
la langue d'origine (`[FR]`/`[EN]`) dans l'affichage.

⚠️ **La vraie recherche sur « Vise le sac, petit » reste à faire** : le
diagnostic corrigé doit maintenant être relancé sur « one-two » pour obtenir
le chemin JSON exact de cette réplique, ce que le bug empêchait jusqu'ici.

---

**Diagnostic Solo Flawless : les 3 derniers trouvés (virgule manquante)**

L'utilisateur a fourni 8 hashes sur 11 via le diagnostic. Recherche manuelle
dans le Manifest pour les 3 restants (Vesper's Host, Warlord's Ruin, Ghosts
of the Deep) : résultat vide — pas un problème de Manifest périmé (confirmé
à jour), mais une **formulation légèrement différente** sur les triomphes
des donjons les plus récents : une virgule est insérée
(« en solo**,** sans mourir et sans quitter l'activité »), que le filtre en
sous-chaîne littérale ne tolérait pas.

Corrigé : `/en solo,?\s*sans mourir/` tolère la ponctuation optionnelle entre
les deux fragments, testé sur les deux formulations réelles (avec et sans
virgule) plus un cas de faux positif à éviter.

**Les 8 hashes confirmés par l'utilisateur** (via le diagnostic, à
transmettre pour les 3 restants une fois le filtre corrigé relancé) :

| Hash | Donjon |
|---|---|
| 3191784400 | Prophétie |
| 3205009787 | Le Trône brisé |
| 3718971745 | Étreinte de l'avarice |
| 3950599483 | Fosse de l'hérésie |
| 4032136335 | Flèche de la vigie |
| 4126703847 | Dualité |
| 28261116 | Dogme fragmenté |
| 1204858125 | Équilibre |

---

**Pilier 2 : affichage des sources réelles à côté du verbe**

- **Corrigé, retour de test de l'utilisateur** : « Surcharge d'arme » (et les
  autres verbes de ressource ajoutés plus tôt) regroupait plusieurs mods
  distincts — Surcharge de Super, de Mêlée, d'un type d'arme précis — sans
  jamais dire lequel était réellement équipé.
  `VerbeDetecte` porte désormais un champ `sources` : les **noms réels** des
  perks/mods qui ont déclenché le verbe, extraits du texte déjà construit
  par `extraireTextesEffetsBuild` (aucune nouvelle lecture du Manifest).
  Affichés entre parenthèses à côté du nom du verbe, ex. « Surcharge d'arme
  (Surcharge d'arme solaire, Surcharge de Mêlée) ».
  Les sources ne s'affichent que si elles apportent une info que le nom du
  verbe seul n'a pas — évite un « Radieux (Radieux) » redondant quand le nom
  du perk est déjà le nom du verbe.

---

**Mise à jour de la documentation de fin de session**

- **TODO réécrit** : 6 items préservés (vérifiés dans le code un par un),
  ajout de la vitrine Solo Flawless comme nouveau chantier en attente de
  diagnostic. Réorganisé en deux temps dans la catégorie « Important » :
  ce qui attend une donnée de l'utilisateur (filtre anti-dialogue, vitrine
  Flawless, traduction d'artefacts) séparé des chantiers de fond (chaînes de
  verbes, capacités de doctrine).
- **CHANGELOG fusionné** : 27 sections datées du même jour, la plupart sans
  titre, réunies en une seule. Contenu vérifié par sondage sur les points
  clés de la soirée plutôt que par simple comptage de lignes (l'écart de
  lignes constaté après fusion provenait d'espacements, pas de contenu
  perdu) — un point sur le diagnostic Solo Flawless manquait réellement à
  l'appel et a été rajouté.
- **A-TESTER.md régénéré**, centré sur le changement le plus risqué de la
  soirée (le renommage Arc → Cryo-électrique, qui touche 3 fichiers et
  pourrait avoir débordé sur le type d'arme « Arc ») et les deux diagnostics
  en attente d'un retour.

---

**Diagnostic pour la vitrine Solo Flawless (outil temporaire, non intégré)**

Demande de l'utilisateur : panneau glissant à gauche (miroir des loadouts),
badges des 11 donjons en Solo Flawless — uniquement une vitrine, aucun lien
avec le scoring. Recherche externe confirmant 11 donjons stabilisés depuis
Monument of Triumph, mais aussi que les noms de triomphe ne suivent PAS un
motif uniforme (celui de Shattered Throne s'appelle « Seriously, Never
Again », pas « Shattered Throne Solo Flawless ») — écarté l'idée d'une liste
de hashes glanée en ligne, pas assez fiable.

Diagnostic ajouté (`chercherTriomphesFlawless`, bouton « 🏆 Triomphes
Flawless (dev) ») : cherche dans `DestinyRecordDefinition` (jamais interrogée
jusqu'ici) les triomphes dont la description contient **à la fois** « en
solo sans mourir » et « sans quitter l'activité » — signature confirmée par
l'utilisateur après un premier essai sur le seul mot « flawless », qui
remontait trop de bruit.

---

**Arc → Cryo-électrique**

- **🔴 « Arc » était un anglicisme, corrigé partout où c'est un ÉLÉMENT.**
  Précision de l'utilisateur : « Arc » est le terme anglais de cet élément
  de doctrine ; le vrai terme français est « Cryo-électrique », toléré comme
  anglicisme jusqu'ici « par simplicité ». Le projet étant assez avancé, le
  point est corrigé.
  ⚠️ **L'identifiant interne reste `"arc"`** (clé technique alignée sur
  l'enum Bungie `2 = Arc`, utilisée dans des dizaines d'endroits) — seul le
  **texte affiché** change, en 3 dictionnaires trouvés dans 3 fichiers
  différents.
  ⚠️ **Piège explicitement signalé par l'utilisateur, évité** : « Arc »
  désigne AUSSI un type d'arme (l'arc, l'arme). La règle `Bows? → Arcs` du
  traducteur d'artefact, juste à côté de celle de l'élément dans le même
  fichier, reste intacte et correcte — vérifié qu'aucune des deux
  corrections n'a débordé sur l'autre.
- **Duplication éliminée au passage** : le dictionnaire de libellés
  d'élément était recopié dans 3 fichiers (`SelecteurArtefact.tsx`,
  `ResumeBuild.tsx`, `GrilleDoctrine.tsx`), déjà PARTIELLEMENT DIVERGENT —
  une seule des trois copies portait les anciens noms entre parenthèses
  (« Abyssal (Vide) », « Filobscur (Strand) »). Centralisé dans
  `src/data/libellesElements.ts`, en conservant ces suffixes qui auraient
  sinon été perdus.

---

---

**corrections diverses**

- **armature « Armature de lanceur » ajoutée** comme anti-Bloqueur, confirmée
  par l'utilisateur en jeu.
- **noms de Champion avec majuscule partout.** `LIBELLES_CHAMPION` était déjà
  correct, mais le pilier 4 affichait directement les valeurs internes du
  type (`"surcharge"`, `"bloqueur"` en minuscule) dans son message de
  couverture au lieu de passer par ce libellé. Corrigé.
- **retour à la ligne pour les mentions d'impact sur les stats**, dans les
  descriptions de fragments de « Mon Build » (ex: « …qui s'appliquent à
  vous. Santé -10 ▼ » devient deux lignes séparées).
  ⚠️ **Motif volontairement tolérant, à confirmer** : je n'ai pas pu vérifier
  le format exact du texte brut sur un exemple réel avant d'écrire ceci
  (recherche dans knowledge-base infructueuse). La détection repose sur un
  nom de stat suivi d'un signe et d'un nombre, sans dépendre d'une
  ponctuation précise — testé sur deux formulations plausibles, à corriger
  si un cas réel ne se scinde pas correctement.

---

---

**diagnostic pour le filtre anti-dialogue**

- **Diagnostic ajouté** (bouton « 🔍 Diagnostic (dev) » à côté de la barre de
  recherche du Manifest), pour traiter le point resté en suspens depuis le
  tout début du projet : chercher « one-two » (pour « One-Two Punch »)
  remonte aussi « vise le sac, petit », une réplique de PNJ.
  ⚠️ **Pas de filtre codé cette fois** — décision assumée. Écrire un filtre
  par mots-clés de dialogue à l'aveugle risquait de masquer de vraies
  descriptions de perks tout en laissant passer d'autres dialogues. Le
  diagnostic parcourt récursivement le JSON de chaque définition trouvée et
  affiche le **chemin exact** où le mot-clé apparaît (ex:
  `displayProperties.description` vs un champ plus profond comme
  `objectives[0].progressDescription`), avec un extrait de texte. Une fois
  qu'on sait précisément d'où vient le dialogue — une table séparée à
  exclure des recherches par défaut, ou un champ précis à l'intérieur d'une
  définition légitime — le filtre pourra cibler exactement la bonne source
  plutôt que deviner un motif de texte.
- point retrouvé dans l'historique : il figurait dans le tout premier résumé
  de session (« Manifest search filter », traitement prévu dans une session
  dédiée), puis avait disparu du TODO au fil des réécritures successives du
  fichier sans que je m'en aperçoive.

---

---

**mise à jour du TODO**

- **Renumérotation et remise en ordre.** La liste avait des trous (items 3, 5,
  6, 8, 9 avec un item non numéroté) — reliquat des suppressions successives
  au fil de la session. Renumérotée de 1 à 6, réordonnée par priorité réelle,
  **6 items préservés, aucun perdu** (vérifié par comparaison avant/après).
- **État vérifié DANS LE CODE**, pas d'après les titres : les 4 artefacts
  annoncés comme traduits le sont réellement (0 mot anglais résiduel), les 3
  autres ne le sont pas (36 à 47 mots anglais chacun).
- **Archétypes d'armure requalifiés** : l'item disait « écarté », il dit
  maintenant « gardé pour la recommandation » — décision de l'utilisateur.
  La nuance compte : pas utilisé pour NOTER (le Pilier 5 note déjà les stats
  réelles, l'archétype n'est qu'une intention), mais conservé comme futur
  critère de RECHERCHE (« pour ce build grenade, cherchez du Grenadier »).
- **Plus aucun item bloquant.** Restent 3 items importants (traduction des 3
  derniers artefacts, chaînes de verbes, capacités de doctrine à vérifier en
  jeu) et 3 items de confort.

---

---

**taux de complétion du build**

- **Implémenté**, conformément à la décision prise avec l'utilisateur :
  afficher le score « sur ce qui est équipé » **et** un taux de complétion à
  côté, plutôt que de pénaliser silencieusement un build incomplet. Sans ça,
  un score de 60 était ambigu — « build médiocre » ou « build à moitié
  rempli » ? Deux situations qui appellent des actions opposées.
  - compte tous les emplacements réels : 3 armes, 5 armures, 6 champs de
    doctrine, 2 aspects, les fragments, l'artefact et ses 7 perks ;
  - ⚠️ **le total VARIE selon le build** (17 à 29 emplacements selon les cas)
    et c'est voulu : les 7 perks d'artefact ne sont comptés que si un
    artefact est choisi, et les fragments seulement si le Manifest permet de
    connaître la capacité réelle offerte par les aspects équipés. Compter
    des emplacements qui n'existent pas pour ce build aurait produit un taux
    faussement bas ;
  - **fragments exclus du décompte sans Manifest** : leur capacité dépend
    des aspects (2 ou 3 chacun), elle n'est pas fixe. Un taux calculé sur
    une capacité inventée aurait été pire qu'un taux portant sur moins
    d'emplacements ;
  - le détail des emplacements vides est dans l'infobulle, pas affiché en
    entier : la liste peut faire 17 lignes sur un build vide, ce qui
    noierait le score qu'elle est censée nuancer.

---

---

**surlignage des verbes dans la grille Doctrine**

- **Dernier endroit où les verbes n'étaient pas surlignés**, désormais
  couvert. Un panneau récapitulatif apparaît sous chaque groupe de la grille
  (super, aspects, fragments, mêlée, grenade, classe, saut) et affiche la
  description des options **sélectionnées**, verbes en cyan.
  ⚠️ **Pourquoi un panneau et pas directement dans les cartes** : elles font
  90px de large, il n'y a pas la place pour du texte. Et l'infobulle native
  au survol ne peut afficher que du texte brut — les couleurs y auraient été
  invisibles, exactement la limite déjà rencontrée sur l'artefact. Le
  panneau reprend l'approche validée là-bas.
  Placé dans le composant interne `BlocGroupe`, donc appliqué
  automatiquement à toutes les catégories sans duplication de code.

---

---

**icône « Pistolet »**

- **Confirmée correcte par l'utilisateur.** La taille avait été signalée
  « un peu grande » à un moment où le chemin SVG était encore tronqué — le
  dessin était donc incomplet, pas la taille en cause. Rien à corriger.

---

---

**Charge d'armure et sources d'aptitude comme verbes**

- **🔴 IMPLÉMENTÉ** — extension du point remonté depuis le diagnostic des
  stats : les mods de surcharge et assimilés ne donnent pas de statistique,
  mais restent pertinents pour la cohérence du build. Étendu par
  l'utilisateur aux mods « Source de Super/Grenade » et à la mécanique
  complète de génération/consommation de Charge d'armure.
  - **type `VerbeCatalogue` élargi** : `element` accepte désormais `null`
    (aucun des 20 verbes existants n'en avait besoin, ces nouvelles entrées
    si — assigner un élément arbitraire aurait été une donnée fausse) ;
    nouvelle catégorie `"ressource"`, distincte de `buff_soi` : une Charge
    d'armure n'est pas un buff temporaire, c'est une ressource qu'on
    accumule puis dépense.
  - **3 nouvelles entrées**, basées uniquement sur ce que confirme
    `knowledge-base/08_GAME_MECHANICS.md` (mécanisme Gain/Consommation
    documenté) et les mods réellement vus dans les deux diagnostics de
    l'utilisateur — aucun mod inventé :
    - **Charge d'armure** : gagnée en ramassant un Orbe de Lumière avec un
      mod de charge équipé ;
    - **Surcharge d'arme** : payoff — consomme des charges pour un bonus de
      dégâts par type d'arme ;
    - **Source d'aptitude** : les mods « Source de Super/Grenade/Mêlée » et
      « Siphon » — énergie d'aptitude directe, source pure.
  - ⚠️ **Distinction importante testée et vérifiée** : certains mods portent
    un nom proche (« Mod de Super » donne +10 Super, « Mods d'arme » donne
    +10 Armes) mais sont déjà comptés comme des STATS par le Pilier 5 — les
    traiter EN PLUS comme des verbes aurait compté leur effet deux fois. Le
    catalogue ne détecte que les mods à **coût seul, sans stat** (Siphon,
    Source de X), qui sont autrement invisibles pour tout le reste du score.
    Vérifié sur les 14 mods réels des deux diagnostics fournis : 14/14
    corrects, aucun faux positif sur les mods de stat, shaders, archétypes
    ou intrinsèques exotiques.
  - `piece.perkHashes` incluait déjà tous les plugs (mods de combat
    compris) dans le texte analysé par le Pilier 2 depuis la correction du
    bug majeur du 04/08 — aucune modification nécessaire côté extraction,
    seul le catalogue de reconnaissance manquait.

---

---

**Pilier 4 : couverture anti-champion + cohérence élémentaire**

- **🔴 IMPLÉMENTÉ, conception déjà arrêtée avec l'utilisateur et documentée
  dans le README.** Le pilier ne couvrait jusqu'ici que la validité (un seul
  exotique) et les bonus de set. Deux composantes ajoutées :
  - **couverture anti-champion**, barème 0/40/80/100 selon le nombre de
    types couverts — progression forte sur les deux premiers, une activité
    présentant rarement les trois Champions à la fois. Réutilise
    `obtenirAntiChampion` et `obtenirAntiChampionArmure`, déjà détectées et
    mises en cache ailleurs dans l'appli, plutôt que redévelopper une
    détection. **Absente du calcul en PvP** (pas notée à 0) : les Champions
    n'y existent pas.
  - **cohérence élémentaire**, légère (15 % hors PvP, 25 % en PvP) et
    **jamais pénalisante** : une arme cinétique n'a pas d'élément et n'est
    jamais comptée comme un défaut, seule une correspondance positive est
    récompensée. Nouvelle fonction `obtenirElementArme`, qui réutilise la
    table `ENUM_VERS_ELEMENT` déjà éprouvée pour l'élément de doctrine — pas
    une nouvelle correspondance devinée.
  - **🔴 troisième source d'anti-champion délibérément EXCLUE** : les
    capacités de doctrine. La base de connaissance qui les documente précise
    elle-même qu'elle date d'avant la 9.7.0 sans confirmation qu'elle
    s'applique encore, et l'une des trois correspondances qu'elle annonce
    (Radiant/Volatile → Bloqueur) est déjà contredite ailleurs dans le même
    document par la correction officielle de la 9.7.0. Coder une règle de
    score sur une source qui se contredit elle-même aurait produit un
    chiffre FAUX avec l'apparence de la précision — pire qu'une composante
    manquante.
  - poids par composante et par contexte vérifiés à **100 % pile** dans les
    4 contextes, y compris la redistribution en PvP (champion à 0 %, sets et
    élément absorbent la différence).
  - ⚠️ **erreur de typage trouvée en compilant** : `DamageElement` n'inclut
    pas `null` dans sa propre définition — `obtenirElementArme` devait
    renvoyer `DamageElement | null` explicitement, pas `DamageElement` seul.
    Corrigé, `tsc` l'avait signalé immédiatement.

---

---

**alignement des menus repliables (correction)**

- **🔴 Le point précédent n'était pas vraiment résolu** — repéré par
  l'utilisateur sur l'aperçu : « le triangle semble plus petit une fois
  ouvert ». Cause : `summary::before` utilisait `font-size: 0.7em`,
  **relatif** à la taille de police du `<summary>` parent, malgré le
  commentaire affirmant une taille « FIXE ». Un bloc à `0.75rem` affichait un
  triangle d'environ 8px, un autre sans style personnalisé environ 11px —
  écart de 33 %, visible à l'œil. Corrigé en pixels absolus (`10px`), qui ne
  dépendent plus du texte affiché à côté.

---

---

**alignement des menus repliables**

- **Déjà résolu, vérifié plutôt que retouché.** Le CSS global masquant le
  triangle natif du navigateur et le redessinant à taille et position fixes
  (`summary::before`) était déjà en place. Vérification sur les 13 blocs
  `<details>/<summary>` de l'appli (GrilleDoctrine, SelecteurArtefact,
  SelecteurInventaire) : tous respectent la convention requise (texte
  enveloppé dans un `<span>` pour l'alignement flex), aucun style en ligne
  n'entre en conflit. Aperçu généré et validé sur les 4 configurations
  réelles (sans icône, titre en gras, avec icône et compteur, bloc ouvert par
  défaut) : le triangle reste identique dans les 4 cas.

---

---

**icônes dans les menus déroulants**

- **Résolu.** Un `<option>` HTML natif ne peut afficher que du texte brut,
  jamais d'image — limite du navigateur, pas un choix de conception.
  Composant `MenuDerouantIcone` : reproduit le comportement d'un `<select>`
  (bouton fermé, clic pour ouvrir, sélection qui referme, fermeture au clic
  extérieur) avec du HTML normal par ligne, donc libre d'y placer une icône.
  **Couverture finale** :
  - type d'arme (Inventaire + Coffre), type d'armure (Inventaire + Coffre),
    artefact (jusqu'à 3 icônes d'élément affichées par ligne) — déjà faits ;
  - **anti-champion (Inventaire + Coffre) — convertis aujourd'hui**, les 2
    derniers `<select>` où une icône avait un sens.
  Laissés en `<select>` natif, délibérément : les filtres de **rareté**
  (Commun/Légendaire/Exotique...) n'ont pas d'icône associée — les convertir
  n'aurait rien apporté.

---

---

**passe de debug, optimisation et documentation**

**⚡ Optimisations — deux caches manquants trouvés par audit systématique**

- `obtenirAntiChampionArmure` : appelée **2 fois par objet affiché**, elle
  parcourt les sockets et résout une définition par plug — **sans aucun
  cache**, contrairement à son équivalent pour les armes qui en a un depuis
  longtemps. Sur un coffre de plusieurs centaines d'armures, tout le travail
  était refait à chaque rendu, y compris à chaque frappe dans la recherche.
- `obtenirIconesPerksArme` : la fonction la **plus coûteuse** du rendu d'un
  objet (jusqu'à ~12 résolutions de définitions Manifest par arme), également
  sans cache.
  ⚠️ Détail important : la clé de cache est la **liste des hashes de perks**,
  pas l'`itemHash`. Deux exemplaires d'une même arme peuvent avoir des perks
  différents — une clé sur l'`itemHash` aurait affiché les perks du mauvais
  exemplaire, un bug bien plus pénible qu'une lenteur.

**🐛 Incohérence fonctionnelle corrigée**

- `modifierIcone` existait dans le stockage des loadouts mais n'était appelée
  **nulle part** : on pouvait choisir une icône à l'enregistrement, jamais la
  changer ensuite — alors que le nom et la description sont modifiables.
  Bouton « Icône » ajouté. Corrigé comme un **manque fonctionnel** plutôt que
  supprimé comme du « code mort », ce que l'audit avait d'abord suggéré.

**🧹 Code mort supprimé (vérifié inutilisé, pas seulement peu utilisé)**

- `obtenirDiagnosticIconeClasse` : diagnostic d'un problème résolu depuis (les
  icônes de classe viennent de SVG, plus du Manifest) ;
- `estEmplacementEquipable` : helper jamais appelé.

**📄 Documentation remise à jour**

- **TODO** : 4 items étaient marqués ouverts alors qu'ils étaient résolus dans
  le code (stats masterwork, divergence Mon Build/Pilier 5, sélecteur de
  contexte, bonus de set réels). Chacun a été **vérifié dans le code** avant
  d'être retiré, pas jugé sur son titre. **Plus aucun item bloquant.**
  Le point resté en suspens (mods de surcharge à traiter comme des verbes) a
  été remonté en item à part entière au lieu de rester noyé dans un item
  « stats » par ailleurs résolu.
- **README** : le tableau d'état annonçait encore « Pilier 5 : calcul faussé »
  et « sélecteur de contexte : interface manquante », tous deux faits depuis.
- Cohérence README ↔ code vérifiée sur les tableaux de pondération : identiques.

---

---

- **ajustement PvP de la pondération des statistiques** (`POIDS_STATS`),
  demandé par l'utilisateur : Arme 1,0 → **0,5**, Grenade 0,9 → **1,4**.
  Tableau du README mis à jour en miroir.

---

---

- **ajustement de la pondération des statistiques** (`POIDS_STATS`), demandé
  par l'utilisateur après revue des coefficients affichés dans le bloc
  « 0. Contexte du build » :
  - Santé : 1,5 → **0,3** en Roaming, 0,8 → **0,3** en DPS ;
  - Arme : 0,5 → **1,7** en Roaming (même valeur qu'en DPS désormais).
  Tableau du README mis à jour en miroir.

---

---

- **sélecteur de contexte déplacé** juste sous le nom du build (demande de
  l'utilisateur) — il était mal placé auparavant, juste au-dessus du
  sélecteur d'artefact, sans rapport avec lui. Libellé recoloré en **blanc**
  (`#e8e6df`, la couleur de texte normale de l'appli) plutôt qu'en gris
  discret, pour bien le distinguer du texte d'aide juste au-dessus.

---

---

- **bloc « 0. Contexte du build »** créé, sur proposition de l'utilisateur.
  Regroupe la sélection (Neutre/Roaming/DPS/PvP) ET le tableau de pondération
  correspondant, sur le même modèle que les blocs de pilier 1 à 5, placé
  juste avant eux puisque c'est le réglage qui les détermine tous.
  ⚠️ Les chiffres affichés viennent directement de `POIDS_PILIERS` (le moteur
  de scoring), jamais recopiés à la main — une divergence entre l'affichage
  et le calcul réel serait sinon possible à la moindre modification future
  d'un seul des deux endroits.
  Le sélecteur reste également accessible dans « Mon Build » (deuxième point
  d'entrée demandé), allégé pour ne pas dupliquer le tableau déjà visible
  juste en dessous.
- **badge de contexte dans les loadouts sauvegardés**, pour identifier d'un
  coup d'œil « qui fait quoi » (demande de l'utilisateur). Lu directement
  depuis `l.build.contexte` — le loadout clone déjà le build entier, pas de
  champ figé séparé nécessaire, même logique que la correction de l'icône du
  Super. Toujours affiché, y compris pour « Neutre » : le laisser absent
  aurait été ambigu (contexte neutre, ou loadout enregistré avant l'existence
  du champ ?), l'afficher systématiquement lève le doute.
  Pas d'icône SVG dédiée (ces 4 concepts ne sont pas des symboles du jeu,
  contrairement aux éléments) : un badge textuel court, coloré ET libellé —
  jamais la couleur seule — reste plus honnête qu'une icône inventée
  suggérant une correspondance avec un symbole Destiny qui n'existe pas.

---

---

- **🔴 SÉLECTEUR DE CONTEXTE implémenté** (Neutre / PvE Roaming / PvE DPS /
  PvP) — dernière pièce manquante du scoring tel que conçu : les poids par
  contexte étaient écrits et justifiés dans le README depuis plusieurs
  sessions, mais **jamais appliqués au calcul réel**, qui utilisait un poids
  fixe de 20 % sur tous les piliers quel que soit le contexte.
  - `POIDS_PILIERS` : table miroir EXACTE du tableau du README, vérifiée à
    **100 % pile** pour chacun des 4 contextes (aucune erreur d'arrondi) ;
  - stocké dans `build.contexte` (déjà prévu dans le type mais jamais lu
    nulle part) plutôt qu'en paramètre séparé de `evaluerBuild` : le
    contexte décrit CE build précis, il doit donc être sauvegardé et
    rechargé AVEC lui — un paramètre séparé aurait pu être oublié au
    chargement d'un loadout, recalculant silencieusement sur « neutre » ;
  - **second bug trouvé en implémentant** : `scoreStats2` ne transmettait
    pas le contexte à `scoreStats`, qui l'accepte pourtant en paramètre. La
    pondération PAR STAT (`POIDS_STATS` — Arme à 1.7 en DPS, Santé à 1.8 en
    PvP…) retombait donc toujours sur « neutre » même une fois le poids
    GLOBAL du pilier correctement contextualisé. Les deux niveaux de
    pondération documentés doivent varier ensemble, corrigé.
  Sélecteur ajouté juste au-dessus du score qu'il détermine, dans « Mon
  Build ».

---

---

- **avertissement avant sauvegarde d'un loadout à doctrine incomplète.**
  Suite du bug du Super non sélectionné (marqueur "🎮 équipé en jeu"
  purement visuel dans la grille Doctrine, qui ne remplit rien tant qu'on
  ne CLIQUE PAS l'option) : le même piège touche les **5 champs de
  doctrine** (Super, Mêlée, Grenade, Compétence de classe, Saut), pas
  seulement le Super où il a été repéré.
  Au moment d'enregistrer, si un ou plusieurs de ces champs sont vides, une
  confirmation explique la cause probable et demande si on veut enregistrer
  quand même. **Choix délibéré : on avertit sans bloquer** — un loadout
  volontairement partiel (juste l'équipement, par exemple) reste un usage
  légitime, on ne veut pas empêcher de le sauvegarder.
  Le diagnostic (icône 🔍, mode dev) reste en place à la demande de
  l'utilisateur, au cas où d'autres champs se révéleraient concernés à
  l'usage.

---

---

- **verbes surlignés en cyan PARTOUT**, pas seulement dans les traductions
  manuelles d'artefact (demande de l'utilisateur : « si tu vois d'autres
  Verbes ailleurs, affiche les en cyan aussi »). Nouvelle fonction
  `surlignerVerbesConnus`, DISTINCTE de `rendreTextePerk` : celle-ci
  recherche directement les mots-clés du **catalogue de verbes du Pilier 2**
  (`CATALOGUE_VERBES`) dans n'importe quel texte, au lieu de repérer une
  ponctuation entre guillemets — convention propre aux traductions
  manuelles, absente du texte brut du Manifest (aspects, fragments, perks
  d'armes, descriptions d'armure).
  Réutiliser le catalogue existant garantit que ce qui est surligné à
  l'écran correspond exactement à ce que le score détecte : deux mécanismes
  indépendants auraient fini par diverger, comme c'est arrivé plusieurs fois
  cette session sur d'autres calculs (stats, anti-champion).
  Branché sur : descriptions de perks d'armes/armures dans la popup
  « Détails » (Inventaire, Coffre, Mon Build), particularité d'origine, et
  la liste des options de doctrine sélectionnées dans Mon Build.
  ⚠️ **Pas encore branché sur la grille Doctrine elle-même** (choix
  d'aspects/fragments/super) : ses descriptions ne s'affichent aujourd'hui
  que dans une infobulle HTML native, qui ne peut montrer que du texte brut
  — même limite déjà rencontrée sur l'artefact. Faudrait un vrai bloc
  d'affichage, à voir avec l'utilisateur avant de restructurer ce composant.
- **incident de fichier corrigé en cours de route** : l'ajout de
  `surlignerVerbesConnus` a d'abord ÉCRASÉ la fonction existante
  `rendreTextePerk` (même nom de zone de remplacement, mal ciblé), cassant
  la compilation. Détecté immédiatement par `tsc`, fichier reconstruit
  proprement à partir de ses parties saines plutôt que rafistolé.

---

---

- **artefact : panneau récapitulatif de TOUS les perks sélectionnés**, au
  lieu du seul dernier perk cliqué dans chaque tier. Demande de l'utilisateur :
  « il faudra pouvoir lire dans ce bloc pour analyser les synergies » —
  repérer une synergie demande de comparer plusieurs perks entre eux, ce
  qu'un aide-mémoire limité au dernier clic ne permettait pas.
  Le panneau est déplacé APRÈS la grille des 7 emplacements (plus mêlé aux
  boutons), affiche les perks groupés par tier (T3 en premier), et conserve
  le vrai rendu (icônes, verbes en cyan) sur chaque description — préparation
  directe du futur travail sur les chaînes de verbes (voir TODO).

---

---

- **traductions d'artefacts ajoutées à `knowledge-base/`** (14 à 17), en
  sauvegarde de la source à côté du fichier compilé `artefacts.ts`. Contenu
  vérifié **strictement identique** aux fichiers fournis par l'utilisateur
  (comparaison ligne à ligne après l'en-tête de contexte, aucune différence).
  Indexées dans `00_INDEX.md` avec un rappel des conventions à respecter
  (`[icone X]`, guillemets pour les verbes) pour faciliter la traduction des
  3 artefacts restants sur le même modèle.

---

---

- **4 ARTEFACTS TRADUITS EN FRANÇAIS À LA MAIN** par l'utilisateur : Encrypted
  Data Disk, Implement of Curiosity, Hunter's Journal, NPA Repulsion
  Regulator — 84 perks au total, sur les 147 de l'appli.
  Intégrés par script (parseur du format texte fourni : `T1/T2/T3` + `- Nom`
  + description), avec vérification systématique : les 4 artefacts tombent à
  **7/7/7** perks par tier, aucun nom ni description vide.
  ⚠️ Un bug de parsing a été détecté et corrigé AVANT intégration : le
  marqueur « T3 » du fichier Implement of Curiosity avait un espace traînant
  (`T3 \n`), non reconnu par la première version du script — ses perks T2/T3
  se retrouvaient comptés 14/0 au lieu de 7/7. Détecté en comparant
  systématiquement le compte par tier, pas en supposant le parsing juste.
- **rendu enrichi des textes de perks** (`RenduTextePerk.tsx`) : les
  conventions utilisées par l'utilisateur dans ses traductions sont
  désormais rendues visuellement :
  - `[icone X]` devient la VRAIE icône (élément, type d'arme, ou champion —
    réutilise les composants déjà existants dans l'appli, aucune icône
    redessinée) ;
  - les mots entre guillemets (verbes et termes de jeu) s'affichent en
    **cyan** (`#67e8f9`), choisi et vérifié pour un contraste de 12,1:1 sur
    le fond de l'appli tout en restant nettement distinct du blanc du texte
    normal et du bleu déjà utilisé pour les accents. Ces mots serviront de
    matière première au futur graphe de chaînes de verbes (voir TODO).
  ⚠️ La description d'un perk n'est plus affichée dans l'infobulle HTML
  native (`title`) : celle-ci ne peut montrer que du texte brut, les
  icônes et couleurs y étaient donc invisibles. Le perk SÉLECTIONNÉ affiche
  désormais sa description en dessous du tier, avec le vrai rendu.
- **nettoyage** : les fonctions `nomPerk`/`descriptionPerk`, pont vers
  l'extraction Manifest abandonnée (« cul-de-sac », voir plus haut), sont
  retirées. `artefacts.ts` contient directement le français pour les 4
  artefacts traduits ; les 3 restants gardent le remplacement de termes en
  repli, désormais appliqué seulement si le texte contient encore des mots
  anglais détectés — pour ne pas re-traiter du français déjà propre.

---

---

- **🔴 STATS : dernière cause trouvée — par l'utilisateur lui-même.** Sa
  déduction était exacte : « Mon Build » n'additionnait **que les stats
  d'armure**, en ignorant les bonus de stats des **FRAGMENTS**. Le Pilier 5,
  lui, les comptait déjà (`obtenirBonusStatsDoctrine`). Ses deux fragments
  expliquaient exactement les deux écarts observés :
  | Fragment | Effet | Écart constaté |
  |---|---|---|
  | Tison empyréen | −10 Santé | Mon Build 15 vs jeu 5 |
  | Tison de charbon | +10 Grenade | Mon Build 130 vs jeu 140 |
  **Correctif** : « Mon Build » réutilise désormais **les mêmes fonctions** que
  le Pilier 5 (`sommerStatsArmure` + `obtenirBonusStatsDoctrine`) au lieu d'un
  calcul local. Deux calculs indépendants finissent toujours par diverger —
  c'est arrivé **deux fois** sur ce même affichage (d'abord le masterwork, puis
  les fragments). Le partage de code supprime la cause à la racine, pas
  seulement le symptôme.
  **Vérifié** : 6 stats sur 6 conformes au jeu, total exactement **500**.

---

---

- **🔴 INCOHÉRENCE « Mon Build » vs « 5. Statistiques » — cause trouvée.**
  Les chiffres de l'utilisateur ont été décisifs : le **Pilier 5 était déjà
  correct sur 5 stats sur 6** après la correction du masterwork, tandis que
  « Mon Build » affichait encore les anciennes valeurs sur 5 stats.
  **Cause** : `enregistrerLoadout` fait un `structuredClone` du build, ce qui
  **fige les `GearPiece` avec leurs stats telles que calculées au moment de la
  sauvegarde**. Recharger un loadout enregistré avant la correction
  réinjectait donc les ANCIENNES valeurs erronées dans « Mon Build », pendant
  que le Pilier 5, lui, recalculait correctement.
  **Correctif** : les stats sont désormais rafraîchies depuis les objets
  réellement possédés au moment du chargement d'un loadout. Le reste
  (doctrine, artefact, choix d'équipement) est conservé tel quel. Une pièce
  démantelée garde ses stats d'origine — l'avertissement ⚠️ signale déjà
  qu'elle est introuvable.
  ⚠️ **Il reste un écart sur la Grenade** (165 dans l'appli contre 140 en
  jeu, soit +25) que la correction du masterwork n'explique pas. À traiter
  séparément — voir TODO.
- **supers ABYSSAUX sans icône dans les loadouts, corrigé.** La résolution ne
  dépendant d'aucun élément, le problème venait du Manifest : certaines
  définitions de super n'exposent pas de champ `icon` mais un
  `iconSequences` (série d'images pour les états du perk). Les deux sources
  sont désormais lues. En dernier recours, un repère « ★ » survolable indique
  le nom du super et l'absence d'icône, plutôt qu'un **vide silencieux** —
  impossible à diagnostiquer autrement, comme l'avait montré l'épisode des
  icônes d'armes.

---

---

- **particularité d'origine : infobulle et popup corrigées.** Elle s'affichait
  bien, mais son infobulle indiquait « Particularité d'origine » **en dur** —
  ce qui n'apprenait rien : l'intérêt est de savoir que « Héritage de Bray »
  régénère de l'énergie de compétence, pas qu'il s'agit d'une particularité
  d'origine. La fonction ne renvoyait que l'URL de l'icône ; elle porte
  désormais aussi le **nom** et la **description**.
  - infobulle : nom + effet complet ;
  - **popup « Détails »** : ajoutée en haut, avec icône, nom et description —
    elle n'y apparaissait pas du tout auparavant ;
  - appliqué **partout** (Inventaire, Coffre, Mon Build) comme demandé.

---

---

- **🔴 STATS D'ARMURE — cause trouvée et corrigée.** Les deux diagnostics
  fournis par l'utilisateur (Capuche d'eutechnologie, Rôdeur nocturne) ont
  permis d'isoler le vrai coupable, qui n'était PAS celui supposé.
  **Ce n'étaient pas les mods de surcharge** — ils n'apportent aucune stat, le
  relevé le confirme. C'est le **MASTERWORK** : le plug « Amélioration
  d'armure » déclare **+5 sur les SIX stats**, et l'appli les additionnait
  toutes, soit ~+15 par pièce et les ~75 points d'écart sur un build complet.
  En réalité le jeu n'applique ces +5 qu'aux **trois stats les plus basses**.
  Le Manifest ne peut pas savoir lesquelles (ça dépend de l'exemplaire), il
  déclare donc le bonus partout et c'est le jeu qui tranche à l'exécution.
  ⚠️ **Précision décisive de l'utilisateur** : le classement des « plus
  basses » se fait sur les stats **INTRINSÈQUES** (plugs `armor_stats`), sans
  tenir compte des mods ni des mods d'ajustement. C'est ce qui explique le
  Rôdeur nocturne : son Super est à 0 en intrinsèque (donc reçoit le +5) alors
  qu'il affiche 20 une fois les mods appliqués. Sans cette précision, j'aurais
  classé sur le total final et obtenu un résultat faux.
  **Vérifié** : le code reproduit désormais les deux relevés à l'identique,
  6 stats sur 6, y compris le cas du mod d'ajustement « +Super / -Mêlée » qui
  descend une stat à 0.

---

## 04/08/2026

**Relecture et mise au propre de la documentation**

- **TODO.md refondu** : 513 → 160 lignes. L'ancien mélangeait quatre
  numérotations incompatibles (A, A0-A3, S1-S12, 0-15), des items résolus
  laissés en place et plusieurs doublons. Chaque item a été **vérifié dans le
  code** avant d'être conservé ou retiré — pas jugé sur son libellé. Restent
  **14 items réellement ouverts**, triés par priorité, chacun précisant
  l'action attendue plutôt que le seul constat.
- **CHANGELOG.md réorganisé** : il comptait **48 sections portant la même date
  et le même titre**, empilées au fil des ajouts. Fusionnées en une seule
  section datée, séparées par des filets. Contenu vérifié intégralement
  préservé (2158 lignes de contenu contre 2152 avant).
- **README.md — tableau « État général » mis à jour** : il datait d'avant le
  travail sur les piliers et annonçait « Pondération du score : pas commencé »
  alors que quatre piliers sur cinq sont désormais réels. Il détaille
  maintenant l'état pilier par pilier, y compris ce qui est **faussé** (le
  Pilier 5).
- **A-TESTER.md supprimé** : sa liste avait été traitée, la garder aurait
  laissé croire à des tests en attente.

---

## 04/08/2026

- **🔴 ARTEFACT : la voie de l'extraction semi-automatique est un cul-de-sac.**
  Le JSON extrait par l'utilisateur montre que `DestinyArtifactDefinition`
  contient la définition **HÉRITÉE** de l'artefact, pas celle du jeu actuel :
  | Critère | Base de connaissance | JSON (Manifest) |
  |---|---|---|
  | Structure | 3 tiers × 7 | **5 paliers × 7** |
  | Total perks | 21 | **35** |
  | Noms en commun | **0 sur 35** | — |
  Le palier 1 en apporte la preuve : « Revolver anti-barrière », « Fusil à
  impulsion surchargé », « Arc imparable »… ce sont exactement les **mods
  anti-champion d'artefact que la 9.7.0 a supprimés**. 35 perks correspond au
  format saisonnier (5 × 7), et zéro nom en commun exclut une simple
  différence de traduction. Le Manifest conserve donc l'ancienne définition,
  probablement pour la compatibilité — les traductions officielles du système
  actuel n'y sont pas accessibles. **L'utilisateur reprend la traduction à la
  main.**
- **une colonne de perks manquait sur TOUTES les armes** : le plafond était
  fixé à 4 alors qu'une arme en compte 5 (signalé avec captures :
  « Recombinaison » absent sur Héritage, « Crosse artisanale » sur la Pochette
  d'allumettes de Tommy). Porté à 5.
- **particularité d'origine affichée** (« Héritage de Bray », « Dissipateur »…),
  tout à droite des perks de colonnes comme demandé, légèrement détachée pour
  marquer qu'elle est d'une autre nature. Identifiée par son **type affiché**
  (« Particularité d'origine ») et non par son nom — lequel change à chaque
  arme et serait impossible à lister exhaustivement.
- **« Mon Build » aligné sur l'Inventaire** pour l'anti-champion : icône
  déplacée de la ligne du nom vers la ligne des perks, séparée par un tiret
  quadratin, exactement comme dans l'Inventaire et le Coffre.
- **restauration de deux correctifs perdus** : le conteneur de travail a été
  réinitialisé en cours de session, et le ZIP de secours datait d'avant. Le
  cache d'instance du Manifest (qui évite de reconstruire tous les index à
  chaque vérification) et l'agrandissement des icônes de loadout ont été
  refaits.

---

- **icône du Super ajoutée** aux loadouts, entre l'élément de doctrine et
  l'icône personnalisée (emplacement demandé). Résolue depuis `superHash` via
  la nouvelle fonction `obtenirIconePerkDoctrine` — une résolution directe par
  hash plutôt que de recharger toute la liste des options de sous-classe
  (`obtenirOptionsSousClasse`), trop coûteux pour n'afficher qu'une seule
  icône. Comme `superHash` est déjà stocké dans le build au moment de la
  sauvegarde, l'icône est figée par construction, sans champ supplémentaire à
  gérer.

---

- **icônes d'élément OFFICIELLES branchées**, sur suggestion de l'utilisateur
  qui a fourni des captures des vraies icônes du jeu. Plutôt que de les
  redessiner à la main (fidélité limitée, et texture qu'un SVG simple ne peut
  pas reproduire), la VRAIE cause de l'échec précédent a été trouvée :
  `obtenirIconesDamageType` comparait le NOM affiché par Bungie
  (« Solaire », « Vide »…) à nos clés internes (« solaire », « abyssal »…) —
  une correspondance texte fragile qui échouait silencieusement (casse
  différente, « Vide » au lieu d'« abyssal »).
  **Nouvelle fonction `obtenirIconeElementDoctrine`** : utilise l'**enum
  stable** de `DestinyDamageTypeDefinition` (documenté par l'API Bungie :
  2=Arc, 3=Solaire, 4=Abyssal, 5=Stase, 6=Filobscur) plutôt qu'une
  comparaison de texte — ne peut plus se tromper sur la casse ou la
  traduction.
  ⚠️ **Prismatique exclu volontairement** : ce n'est pas un type de dégâts
  (une arme n'inflige jamais de dégâts « prismatiques »), donc aucune icône
  officielle n'existe pour ce cas — mieux vaut l'assumer que deviner un hash.
  `IconeElement` affiche désormais l'icône officielle en **priorité**, avec la
  forme dessinée à la main en repli pour le Prismatique et le mode hors
  ligne.

---

- **BUG : double puce dans le Pilier 2, corrigé.** Le code ajoutait `• ` en
  texte devant chaque verbe, alors que `PilierCarte` rend déjà chaque ligne
  de détail dans un `<li>` — la puce native du CSS de liste s'ajoutait à la
  mienne. Le `• ` textuel est retiré, l'indentation reste par les espaces.
- **BUG : icône de sous-classe absente dans les loadouts, cause identifiée et
  corrigée.** Il n'existait en réalité AUCUNE icône d'élément dans tout le
  code : « Doctrine » n'affiche que le nom en texte
  (`LIBELLES_ELEMENT` dans `GrilleDoctrine.tsx`), jamais d'icône — ma demande
  précédente de « réutiliser les icônes de Doctrine » reposait donc sur une
  hypothèse fausse, il n'y avait rien à réutiliser. Le composant Loadouts
  tentait de résoudre une icône depuis le Manifest via
  `obtenirIconesDamageType`, mais la correspondance nom → hash échouait
  silencieusement, laissant l'emplacement toujours vide.
  **Nouveau composant `IconeElement.tsx`** : 6 formes SVG simples et FIABLES
  (une par élément : flamme, éclair, triangle, flocon, nœud, losange à
  facettes), sans aucune dépendance au Manifest — ne peut donc plus échouer
  silencieusement.
- **précision sur le téléchargement des Manifests** : la fonctionnalité
  demandée (vérifier la présence et la version avant de télécharger) **existe
  déjà** dans `assurerManifestAJour()` — elle compare la version en cache à
  celle de Bungie et ne télécharge que si nécessaire. Clarification
  nécessaire sur l'emplacement : ce cache vit dans l'**IndexedDB du
  navigateur**, pas dans le dossier `manifest-local/`. Ce dossier est produit
  par le script Node séparé (`scripts/telecharger-manifest.mjs`), qui tourne
  côté système de fichiers ; l'appli web, exécutée dans le navigateur, n'a
  techniquement aucun accès à ce dossier ni à aucun fichier local. Les deux
  mécanismes sont donc indépendants par construction du web, pas par
  limitation évitable.

---

- **7 icônes de loadout ajoutées** (SVG fournis) : Infusion, Creuset, Creuset
  — Vaillance, Creuset — Gloire, Léviathan (deux variantes), Ishtar. La palette
  passe à **27 icônes** au total.
  ⚠️ `faction-ironbanner-svgrepo-com.svg` renvoyé dans ce lot n'a PAS été
  réintégré : c'est le même fichier que celui déjà intégré sous la clé
  `iron_banner` lors du lot précédent - une vérification avant ajout l'a
  détecté, évitant un doublon. Toutes les autres icônes confirmées sans
  troncature (581 à 32 362 caractères).

---

- **📤 EXTRACTION SEMI-AUTOMATIQUE DES ARTEFACTS** (idée de l'utilisateur, et
  c'est la meilleure solution au problème de traduction). Constat : le
  Manifest ne contient que l'artefact ÉQUIPÉ en jeu. Plutôt que de renoncer
  aux traductions officielles pour les six autres, l'utilisateur équipe chaque
  artefact à tour de rôle, clique sur **« 📤 Extraire l'artefact équipé »** et
  transmet le résultat. En **7 passages, les 147 perks auront leur vraie
  traduction Bungie**.
  Supérieur aux deux options envisagées jusque-là : mes règles de
  remplacement de termes produisent du texte bancal (« Sur Survolté ennemi
  éliminations »), et une traduction manuelle des 147 descriptions serait à
  refaire à chaque mise à jour du jeu. La sortie est un bloc TypeScript
  directement intégrable, sans recopie manuelle.
- **20 icônes d'activité et de doctrine ajoutées** (SVG fournis) : raid,
  raid détaillé, assaut, secteur oublié, patrouille, clan, Bannière de Fer,
  Osiris, Avant-garde, As de pique, tir à la tête, drone Arc, et les
  combinaisons classe/élément (Titan/Chasseur/Arcaniste × Solaire/Arc/
  Abyssal). Disponibles dans la palette d'icônes des loadouts — bien plus
  parlantes qu'un emoji pour identifier « mon build de raid ».
  Extraction par script avec vérification : 20 icônes, chemins de 581 à
  29 663 caractères, **aucune tronquée**.
- ⚠️ **Doublon de fonction détecté et supprimé** (`extraireArtefactActif`
  existait déjà). Un audit de tout `doctrine.ts` confirme qu'il n'en reste
  aucun autre — ces doublons viennent de fonctions réécrites sans vérifier
  leur existence préalable, un réflexe à garder.

---

- **EXTRACTION SEMI-AUTOMATIQUE des traductions d'artefact** — idée de
  l'utilisateur, et c'est la meilleure des options envisagées. Le Manifest ne
  contient que l'artefact ÉQUIPÉ ; plutôt que d'y voir une impasse, on en fait
  une procédure : équiper un artefact en jeu → cliquer « ⬇ Extraire l'artefact
  actif » → m'envoyer le JSON → changer d'artefact → recommencer. Au bout de
  7 tours, on dispose des **147 vraies traductions de Bungie**, sans traduction
  manuelle ni remplacement de termes approximatif.
  - `extraireArtefactActif()` produit un JSON structuré (palier, hash, nom et
    description français de chaque perk), **téléchargé directement** pour
    éviter un copier-coller de plusieurs centaines de lignes.
  - Nouveau fichier `src/data/artefactsTraductions.ts`, vide au départ, qui
    accueillera les extractions. Il est indexé par **nom anglais** — seul lien
    entre nos deux sources, la base de connaissance n'ayant pas les hashes.
  - Le sélecteur utilise désormais la **traduction officielle en priorité**,
    avec le remplacement de termes en repli. Les deux coexistent le temps que
    les 7 artefacts soient extraits : aucun affichage ne se dégrade pendant la
    transition.

---

- **loadouts — disposition B intégrée** (choix de l'utilisateur après aperçu
  comparatif) : icônes et date sur une première ligne, **nom en dessous sur
  toute la largeur**. Motif : les noms descriptifs, donc longs, sont les plus
  utiles pour retrouver un loadout — les tronquer perdait l'information
  principale. La date remonte à droite des icônes, sur une place autrement
  perdue : la disposition ne coûte **aucune hauteur supplémentaire**.
  - **classe et élément FIGÉS à la sauvegarde** (demande explicite) : un
    loadout est un instantané, ses repères doivent l'être aussi, sinon un
    build Solaire afficherait l'icône Arc après un changement de doctrine.
  - **icône facultative au choix** : 12 emojis + les 3 icônes anti-champion
    déjà présentes dans l'appli.
  - **retours à la ligne préservés** dans les descriptions (`pre-wrap`) — le
    champ les acceptait déjà, c'est l'affichage qui les écrasait.
- **Pilier 2 — présentation regroupée** (demande de l'utilisateur) : le
  commentaire s'affiche **une seule fois en titre**, suivi des verbes
  concernés un par ligne, au lieu de le répéter pour chaque verbe.
- **Pilier 3 RÉÉCRIT** et renommé (« Saisonniers » retiré, les artefacts ne
  le sont plus). L'ancienne formule `40 + nbPerks × 15` était doublement
  arbitraire : quatre perks quelconques donnaient 100, et elle lisait
  `artifact.perkHashes`, **un champ vide depuis la création du sélecteur** —
  le pilier affichait donc toujours 0, ce que l'utilisateur avait signalé.
  Nouvelle formule sur données réelles, en trois composantes :
  **remplissage des 7 emplacements (40 %)**, **cohérence artefact ↔ doctrine
  (30 %)** d'après les éléments que l'artefact déclare soutenir, et
  **synergie (30 %)** — les perks choisis renforcent-ils un verbe déjà présent
  ailleurs dans le build ? Cette dernière répond au TODO laissé dans le code :
  noter la synergie réelle plutôt que la simple présence. Le calcul exclut
  l'artefact de la détection des verbes « ailleurs », pour ne pas le compter
  avec lui-même.

---

- **marqueurs source/payoff ANGLAIS enrichis** (source : 70 → 113, payoff :
  25 → 45). Motif : les perks d'artefact viennent de la base de connaissance
  rédigée en anglais, et la couverture anglaise était bien plus faible que la
  française (13 marqueurs contre 57). Ces textes tombaient donc en
  « indéterminé » — **18 points au lieu de 35** pour une vraie boucle. Le
  déséquilibre pénalisait le build de l'utilisateur pour une raison sans
  rapport avec sa qualité.
  **Le manque principal identifié** : j'avais les formes CONJUGUÉES
  (« grants », « applies ») mais pas les INFINITIFS, or l'anglais des perks
  les emploie massivement après un auxiliaire (« have a chance to jolt »).
  Ajout notable côté payoff : **« while »**, l'anglais exprimant très souvent
  la condition d'un bonus par « While Amplified, … » — ce qui est bien un
  payoff (on profite d'un état actif) et non une source.
  **Mesuré sur les 130 vraies descriptions du fichier** : les indéterminés
  passent de **63 % à 30 %**, soit 53 % des cas problématiques résolus.
  ⚠️ **Limite assumée** : 30 % résistent encore. Certaines phrases contiennent
  réellement les deux signaux — « Void weapons **gain** increased damage
  **against Weakened** targets » est un payoff, mais « gain » est plus proche
  du mot-clé que « against » et l'emporte. Seul le sens permettrait de
  trancher ; la règle de proximité a une limite intrinsèque. Si ces 30 %
  posent problème à l'usage, l'étape suivante est de récupérer les hashes du
  Manifest pour lire les vraies descriptions françaises.

---

- **interface de l'artefact refaite en GRILLE**, à la demande de l'utilisateur
  qui la trouvait « bordélique ». Elle reproduit désormais le menu du jeu :
  une **rangée des 7 emplacements** en haut (avec le nombre de ◆ indiquant le
  tier accepté), puis **une ligne par tier**, T3 en haut comme en jeu. Un perk
  pris apparaît grisé, cliquer un emplacement équipé le libère, et **chaque
  perk porte une infobulle** avec son nom et sa description traduits — ce qui
  manquait complètement dans la version en listes dépliables.
- **diagnostic des stats d'armure branché** dans la popup « Détails » d'une
  armure (mode dev). Il liste **chaque plug** avec son
  `plugCategoryIdentifier` et les stats qu'il déclare, puis le total calculé
  par l'appli. Objectif : identifier les ~75 points fantômes (575 dans
  l'appli contre 500 en jeu) en comparant pièce par pièce, plutôt que
  d'exclure des catégories au jugé et risquer de supprimer de vrais bonus.
  ⚠️ Un doublon de cette fonction a été trouvé et supprimé au passage : elle
  avait déjà été écrite plus tôt dans la session.

---

**modèle d'artefact CORRIGÉ**

- **🔴 Ma modélisation de l'artefact était FAUSSE**, et les captures d'écran du
  jeu fournies par l'utilisateur l'ont établi. Je décrivais « 7 slots × 3
  tiers », comme si chaque slot possédait ses trois variantes. Le jeu
  fonctionne autrement :
  - un artefact propose **21 perks** : 7 en T1, 7 en T2, 7 en T3 ;
  - il y a **7 emplacements**, chacun plafonné à un tier :
    **2 plafonnés T1, 3 plafonnés T2, 2 plafonnés T3** ;
  - un emplacement accepte **tout perk de tier inférieur ou égal** à son
    plafond — d'où 7 perks proposés dans un emplacement T1, 14 dans un T2,
    **21 dans un T3** (confirmé par les trois captures : 1, 2 puis 3 lignes
    proposées) ;
  - chaque perk n'est équipable **qu'une fois**, tous emplacements confondus.
  C'est ce qui expliquait l'affichage incorrect signalé à plusieurs reprises :
  je proposais 3 perks par emplacement au lieu de 7, 14 ou 21.
  📌 **Conséquence conceptuelle** : les contraintes globales que j'avais
  documentées (« au moins 2 perks T1 », « T2+T3 ≤ 5 », « T3 ≤ 2 ») ne sont pas
  des règles indépendantes — elles **découlent mécaniquement** de la
  répartition des plafonds. Elles restent utilisées pour les messages d'aide,
  mais leur origine est maintenant comprise.
- **`src/data/artefacts.ts` régénéré** avec la structure correcte
  (`perksParTier` au lieu de `slots`), plus `PLAFOND_TIER_PAR_SLOT`. Toujours
  généré par script : 7 artefacts, 147 perks, vérifiés au comptage.
- **clés de perk refondues** : de `idArtefact:slot:tier` à
  `idArtefact:tier:nom`. La clé identifie désormais le **perk lui-même**, ce
  qui rend l'unicité vraie par construction — l'ancienne version devait
  comparer les noms entre slots pour détecter les doublons, un contournement
  qui n'avait lieu d'être que parce que le modèle était faux.
- **confirmé par l'utilisateur** : les 7 artefacts sont possédés simultanément
  mais **un seul est actif**. C'est pourquoi `DestinyArtifactDefinition` ne
  renvoie qu'une entrée — le Manifest décrit l'artefact ACTIF, pas le
  catalogue. L'option « tout lire depuis le Manifest » est donc écartée : elle
  priverait l'appli de la simulation des six autres.

---

**diagnostics utilisateur (stats & artefact)**

- **🔴 STATS SURÉVALUÉES de 75 points, cause identifiée.** Comparaison fournie
  par l'utilisateur sur un même build : 500 points en jeu, **575** dans
  l'appli. `inventaire.ts` additionne les `investmentStats` de TOUS les plugs
  actifs de l'armure ; or des mods comme « Surcharge d'arme solaire » en
  déclarent **sans accorder de statistique au joueur** (ce sont des effets de
  gameplay). Correction à faire avec un diagnostic préalable pour identifier
  quels types de plugs filtrer — pas à l'aveugle.
  📌 **Confirmation inattendue** : le total réel de ce build est **exactement
  500**, la valeur de référence choisie pour calibrer l'échelle du Pilier 5.
  Le calcul théorique (~515 arrondi à 500) tombe juste sur un build réel.
- **🔴 Mon Build et Pilier 5 se contredisent** (Grenade 155 vs 165, Santé 15 vs
  5) : deux chemins de calcul coexistent. Indépendamment de savoir lequel a
  raison, une appli qui affiche deux valeurs différentes pour la même donnée
  perd sa crédibilité — à unifier sur une source unique.
- **🔴 DIAGNOSTIC ARTEFACT : l'option 2 ne fonctionnera PAS telle quelle.** La
  table `DestinyArtifactDefinition` ne contient qu'**UNE seule entrée**
  (« Outillage de curiosité », l'artefact actif), structurée en **5 tiers ×
  7 items = 35 perks**. Notre fichier décrit **7 artefacts × 7 slots × 3 tiers
  = 147 perks**. Les deux modèles ne correspondent pas.
  **Ce que le Manifest apporte quand même** : les noms sont bel et bien **en
  français** (« Revolver anti-barrière », « Profiter de l'avantage »,
  « Synthèse cinétique »), ce qui confirme que la source de traduction existe.
  **Décision à prendre** : soit l'appli se limite à l'artefact actif du
  Manifest (données justes et traduites, mais un seul artefact au lieu de 7),
  soit on garde les 7 et on récupère les traductions par correspondance de
  noms. À trancher avec l'utilisateur — voir TODO.

---

- **diagnostic `DestinyArtifactDefinition` ajouté** (bouton « 🔍 Artefacts du
  Manifest », mode dev, dans le bloc Artefact). Objectif : vérifier si le
  Manifest peut fournir les artefacts **en français**, ce qui remplacerait à la
  fois `src/data/artefacts.ts` (généré depuis la base de connaissance, en
  anglais) et ma traduction par remplacement de termes — laquelle produit du
  texte grammaticalement bancal alors que Bungie fournit de vraies traductions.
  Le diagnostic vérifie avant de coder : existence de la table, nombre
  d'artefacts, structure des tiers, et surtout **si les noms/descriptions
  arrivent bien traduits** depuis le Manifest FR.
  Choix de l'option 2 (lire la table directement) plutôt que la correspondance
  par nom, jugée fragile aux homonymes, ou l'extraction hors ligne, à relancer
  à chaque mise à jour du jeu.

---

**retours de test (build solaire réel)**

- **🔴 PILIER 2 : le score punissait MA détection, pas le build.** Un build
  solaire efficace (boucle Radieux → Restauration → Ignition, Pochette
  d'allumettes de Tommy) était noté **26/100**. Analyse : 2 de ses 3 verbes
  tombaient en « indéterminé » — noté 4 points contre 35 pour une boucle. Le
  build n'était pas mauvais, c'est mon analyse de texte qui ne savait pas le
  lire, et l'utilisateur en payait le prix.
  **Deux corrections** :
  1. **marqueurs enrichis** — le vocabulaire de soin/restauration était très
     mal couvert (« vous soigne », « restaure », « régénère », « amorce »,
     « bénéficiez »…, ~30 termes ajoutés) ;
  2. **barème rééquilibré** — l'indéterminé passe de 4 à **18 points**, la
     source seule de 8 à **12**. Un verbe présent mais non classé est plus
     probablement utile qu'inutile : les builds réels ont rarement des verbes
     décoratifs. Le même build passe de 16 à **48**.
  Le message a été reformulé pour dire clairement que c'est une limite de la
  détection, pas un défaut du build.
- **artefact : perks traduits en français** (`traductionArtefact.ts`, 87 règles
  de vocabulaire Destiny). ⚠️ **Ce que c'est** : un remplacement de TERMES, pas
  une traduction de phrases — la grammaire anglaise reste partiellement
  visible. Volontaire : le vocabulaire de jeu est ce qui compte pour
  comprendre un perk, et réécrire 147 descriptions à la main risquerait d'en
  déformer le sens. Les termes inconnus restent en anglais plutôt que devinés.
- **unicité des perks d'artefact** : un même perk apparaissant dans plusieurs
  slots ne peut être équipé qu'une fois. Détection par NOM et non par clé (la
  clé inclut le slot, elle n'aurait pas vu les doublons).
- **nombre de tickets affiché sur chaque ASPECT** : on voit ce qu'un aspect
  débloque avant de l'équiper, au lieu de devoir l'essayer pour le découvrir.
- **légende des icônes** ajoutée au bloc Doctrine (occupé / libre / en trop).

---

**passe de debug & optimisation**

- **🔴 CODE MORT du Pilier 5 découvert** : `scoreStats` référençait
  `ContexteBuild`, `POIDS_STATS` et `TOTAL_STATS_SET_OPTIMISE` — **qui
  n'existaient nulle part**. Le fichier ne compilait donc pas, et je ne
  l'aurais pas vu sans cette passe : les erreurs étaient masquées par le
  filtre habituel des messages TypeScript. Les trois constantes ont été
  créées avec les valeurs arrêtées avec l'utilisateur et documentées dans le
  README.
- **calibration du Pilier 5 appliquée** : normalisation sur **500** (set
  pleinement optimisé) au lieu de 1200 (maximum théorique inatteignable), et
  **moyenne pondérée** par contexte au lieu de la moyenne simple. Vérifié
  chiffres à l'appui : set optimisé → 100, set correct → 72, set négligé → 41.
  Un build spécialisé bat désormais un build tiède à total de stats égal.
- **plafonnement à 100 ajouté** : sans lui, un build spécialisé dans une stat
  lourdement pondérée sortait à **109/100**. Un score « sur 100 » doit rester
  sur 100, sinon il fausse la moyenne pondérée des piliers.
- **⚡ OPTIMISATION majeure des bonus de set** : `obtenirBonusSet` lançait une
  requête `LIKE '%hash%'` **par objet**, chacune parcourant toute la table.
  Sur un coffre de ~800 objets, jusqu'à **800 parcours complets** — et un
  `LIKE` non ancré ne peut utiliser aucun index SQLite. La table des sets étant
  petite, elle est désormais lue **une seule fois** dans une Map
  `itemHash → set`. Effet secondaire appréciable : l'indexation par hash exact
  supprime le risque de faux positif que l'ancienne version devait filtrer
  après coup.
- **code mort supprimé** (~3000 caractères) : `obtenirIconesClasse` (remplacée
  par les SVG depuis que le Manifest s'est révélé sans icônes de classe) et
  `obtenirDiagnosticSetArmure` (le diagnostic a rempli son office, la structure
  des sets est connue et implémentée).
- **liste de tests renouvelée** (`A-TESTER.md`), centrée sur les deux
  changements les plus risqués : le Pilier 2 qui analyse enfin les armes et
  armures, et le Pilier 5 dont l'échelle a entièrement changé.

---

**lot de correctifs issu des tests utilisateur**

**Tests validés par l'utilisateur** : Prismatique à 100 (points 1 et 3),
armatures anti-champion (point 4), jetons sur armes et armures exotiques
(point 5), bonus de set (point 8), loadouts (point 9), affichage général
(point 10).

**Corrections apportées :**

- **🔴 BUG MAJEUR — le Pilier 2 n'analysait PAS les perks d'objets.** Dans
  `extraireTextesEffetsBuild`, `piece.perkHashes` était résolu dans
  `DestinySandboxPerkDefinition` alors que ce sont des PLUGS, qui vivent dans
  `DestinyInventoryItemDefinition`. La lecture échouait **silencieusement**
  (`undefined`, aucune erreur levée) : aucun texte n'était extrait des armes
  ni des armures. Le pilier n'a donc **jamais analysé que la doctrine**, et
  affichait en permanence « Aucun verbe détecté » — ce que l'utilisateur a
  d'abord pris pour un message figé. Toute la logique source/payoff écrite
  plus tôt fonctionnait, mais sur un tiers des données seulement.
  Corrigé aussi : `artifact.perkHashes` (ancien champ, vide depuis le
  sélecteur) remplacé par la lecture de `perkCles` dans `ARTEFACTS`.
- **Surcapacité de fragments** : un avertissement apparaît quand on équipe
  plus de fragments que les aspects n'en autorisent (cas « 5/4 », survenant
  quand on change d'aspect après coup). Sur les tickets, **un** ticket passe
  en rouge **sans désigner quel fragment** est en trop — précision de
  l'utilisateur : on sait qu'il y en a un de trop, pas lequel, et prétendre
  l'identifier serait une information inventée.
- **Tickets d'emplacement de fragment** (SVG fourni par l'utilisateur, aperçu
  validé) : blanc = occupé, gris = libre, rouge = surplus. Chemin intégré par
  script (1673 caractères, vérifié sans troncature).
- **Pilier 4 branché sur les vraies données de set** : il annonçait « aucun
  set détecté » pendant que Mon Build affichait correctement 2 pièces. Une
  divergence visible entre deux parties de l'appli décrédibilise le score
  entier.
- **Recherche de l'Inventaire** : normalisation identique à celle du Coffre
  (accents et casse).
- **Étreinte d'Athrys** : l'anti-champion des armures exotiques s'affiche
  désormais aussi dans « Mon Build » — l'affichage avait été ajouté dans
  `SelecteurInventaire` sans être répercuté, les deux composants ayant leur
  propre code de rendu.
- **Sélecteur d'artefact** :
  - **filtrage par tier** : slots 1-2 → T1 ; slots 3-5 → T1-T2 ; slots 6-7 →
    les 3 tiers. Les 3 tiers s'affichaient partout. Le libellé du slot indique
    désormais les tiers disponibles ;
  - **traduction française** des éléments et des types d'armes (la base de
    connaissance est en anglais), avec repli sur la valeur brute si un libellé
    manque — mieux vaut afficher l'anglais qu'un vide ;
  - **menu déroulant enrichi** : éléments et armes visibles directement dans
    la liste. ⚠️ **Les icônes demandées n'ont pas pu être mises** : un
    `<option>` HTML n'affiche que du texte, jamais une image — même limite que
    pour les filtres du Coffre. Les libellés en toutes lettres remplissent le
    même besoin (voir les synergies sans cliquer).
- **Popup « à configurer en jeu »** : un retour à la ligne par aspect et par
  fragment, et majuscule sur le nom de sous-classe.

---

- **JETONS DU JEU adoptés comme méthode principale de détection
  anti-champion**, sur information de l'utilisateur (captures d'écran) :
  | Jeton | Champion |
  |---|---|
  | `[Chancellement]` | Implacable |
  | `[Perforation de bouclier]` | Bloqueur |
  | `[Perturbation]` | Surchargé |
  Ces jetons sont bien plus fiables que l'adjectif français, qui varie en
  genre et en nombre (« implacable » / « implacables ») — exactement le piège
  qui avait fait échouer « rayon »/« rayons » et « precis »/« precision ».
  L'adjectif reste en repli, avec son garde-fou.
- **ARMES EXOTIQUES enfin couvertes** : l'utilisateur a confirmé que leur
  intrinsèque emploie la MÊME formulation que les armures. C'est ce qui
  manquait depuis le début pour les exotiques — ils n'ont pas d'armature
  standard, donc `ARMATURE_VERS_CHAMPION` ne pouvait rien en dire, et les 141
  cartographier à la main était irréaliste. Les jetons résolvent le problème
  d'un coup, sans table à maintenir.
- **note de test `A-TESTER.md` créée** : récapitulatif de tout ce qui a changé
  depuis le début du travail sur les piliers, classé par priorité (corrections
  de bugs d'abord, nouveautés ensuite, affichage en dernier), avec pour chaque
  point l'attendu explicite. Inclut une section « ce que j'attends en retour »
  et une liste de ce qui n'est **pas encore testable** — pour éviter de
  chercher des fonctionnalités non écrites.

---

- **conception du Pilier 4 arrêtée et documentée** dans le README (tableaux
  de pondération par contexte, barèmes, et surtout ce que le pilier ne fait
  PAS) :
  - **3 composantes seulement** — bonus de set, couverture anti-champion,
    cohérence élémentaire — avec sous-scores affichés séparément. Limite
    volontaire : le Pilier 4 est celui où tout ce qui ne rentre nulle part
    risque d'atterrir, et six composantes agrégées en un chiffre
    n'apprendraient plus rien.
  - **barème anti-champion 0 / 40 / 80 / 100** (choix de l'utilisateur, plus
    progressif que ma proposition initiale) : passer de 1 à 2 types couverts
    change plus le confort de jeu que passer de 2 à 3, une activité présentant
    rarement les trois Champions. Composante **ignorée en PvP** (les Champions
    n'y existent pas) plutôt que notée zéro, son poids étant redistribué.
  - **validité traitée hors pondération** : deux exotiques d'arme ou d'armure
    ne sont pas un défaut à nuancer, c'est une configuration impossible en jeu
    — pénalité bloquante.
  - **cohérence élémentaire maintenue légère (15 %)**, et jamais pénalisante :
    une arme cinétique n'a pas d'élément, beaucoup de bons builds mélangent
    volontairement, et depuis la 9.7.0 l'anti-champion ne dépend plus de
    l'élément. Une appli qui pousserait au monochrome appauvrirait le jeu.
  - ⚠️ **le Pilier 4 ne jugera PAS la synergie des perks** : remarque de
    l'utilisateur, cette synergie se lit dans les verbes et le Pilier 2
    l'analyse déjà, perks d'armes compris. La re-noter compterait deux fois la
    même qualité.
  - archétypes d'armure écartés pour l'instant : le Pilier 5 note déjà les
    stats sur des valeurs RÉELLES, là où l'archétype n'exprime qu'une
    intention.
- **piste notée** : une capture de la Companion App montre que le jeu écrit
  « Efficace contre les **[Chancellement]** Champions implacables ». Ce jeton
  entre crochets serait un signal plus stable que l'adjectif français, qui
  varie en genre et en nombre — à confirmer sur les 3 types.

---

- **PILIER 1 réécrit**, poids abaissé à 10 % conformément à la décision prise
  avec l'utilisateur.
  - Il ne mesure plus que ce que personne d'autre ne regarde : les 2 aspects
    (**toujours 2**, Prismatique comprise) et surtout les **fragments
    réellement utilisés par rapport à la capacité OFFERTE** par les aspects
    équipés. Ce dernier point n'est calculable que depuis la résolution de la
    stat « Capacité d'énergie d'aspect » (2223994109) — auparavant l'appli
    supposait 6 emplacements pour tout le monde.
  - **Prudence ajoutée** : sans Manifest, la capacité en fragments est
    inconnue. Le pilier s'abstient alors de pénaliser plutôt que de le faire
    au hasard.
  - Un build Prismatique complet obtient désormais **100** au lieu de perdre
    30 points pour un défaut inexistant.
- **`resoudreDonneesDoctrine()` exposé** : le Pilier 1 publie ses données
  résolues (élément, aspects, fragments, capacité) pour que le Pilier 4 les
  consomme, au lieu que chacun relise le Manifest de son côté — méthode
  validée par l'utilisateur, qui évite les divergences d'interprétation entre
  piliers.
- **anti-champion des ARMURES EXOTIQUES affiché** à côté des perks, comme pour
  les armes (demande de l'utilisateur ; ces armures avaient été oubliées de ma
  conception initiale, qui ne regardait que les armes).
  ⚠️ **Trois garde-fous délibérés**, après l'épisode des faux positifs sur les
  armes : on ne lit QUE le perk exotique (jamais les mods ni les options de
  plugset) ; on exige à la fois un mot de champion ET un marqueur de
  neutralisation (« étourdi », « champion »…), le seul mot « surcharge »
  pouvant apparaître dans un texte sans rapport ; et le champ officiel
  `breakerType` reste prioritaire. **Mieux vaut manquer une armure que d'en
  inventer une.** L'infobulle nomme le perk responsable, pour que la détection
  reste vérifiable.

---

- **BUG de connaissance corrigé : 2 aspects, pas 3 en Prismatique.** Le code
  supposait `estPrismatique ? 3 : 2` depuis les premières versions —
  supposition jamais vérifiée, corrigée par l'utilisateur qui joue le jeu.
  Toutes les sous-classes équipent **2 aspects**. L'erreur était propagée à
  deux endroits (la logique du Pilier 1 et le commentaire du type
  `SubclassConfig`), tous deux corrigés. Conséquence concrète : un build
  Prismatique valide perdait 30 points au Pilier 1 pour un défaut inexistant.
- **pondération des piliers révisée**, documentée dans le README avec une
  colonne « Pourquoi ce poids » et le raisonnement sous le tableau :
  | Pilier | Neutre | Motif |
  |---|---|---|
  | 1. Élément & Doctrine | **10** | Validité/complétude, pas qualité |
  | 2. Verbes | **30** | La vraie cohérence du build |
  | 3. Artefact | **15** | Formule encore imprécise |
  | 4. Loot & Cohérence | **20** | Porte la cohérence transversale |
  | 5. Statistiques | **25** | Données réelles et fiables |
  Le Pilier 1 descend de 20-25 % à 10 % : il mesure de la **conformité**, pas
  de la qualité, et la substance d'une doctrine (ses verbes) est déjà notée
  par le Pilier 2. Lui laisser un poids fort revenait à compter deux fois la
  même chose.
- **méthode actée** : le Pilier 1 EXPOSE ses données résolues (élément,
  aspects, fragments, capacité) pour que le Pilier 4 les consomme, au lieu que
  chacun relise le Manifest de son côté — évite la double lecture et surtout
  les divergences d'interprétation entre piliers.
- **couverture anti-champion** ajoutée au TODO comme composante du Pilier 4,
  avec l'avertissement de l'utilisateur : elle ne provient pas que des armes,
  mais aussi de capacités de doctrine et d'armures exotiques.

---

- **PILIER 2 RÉÉCRIT : distinction SOURCE / PAYOFF** (nouveau module
  `src/lib/scoring/sourcePayoff.ts`). C'est la fondation du scoring par
  cohérence.
  **Le défaut corrigé** : l'ancienne logique comptait les MENTIONS d'un verbe
  et traitait 2 mentions comme une « boucle probable ». Deux fragments qui
  APPLIQUENT tous deux Brûlure sans rien pour l'exploiter comptaient donc
  comme une synergie — alors que c'est de la redondance. Et le cas inverse,
  bien plus coûteux, était totalement invisible : une arme qui exploite un
  verbe que RIEN n'applique passait pour une « mention isolée » à 10 points,
  sans le moindre avertissement.
  **Nouvelle classification** : chaque occurrence est classée SOURCE
  (« inflige Brûlure ») ou PAYOFF (« contre les cibles brûlées ») selon les
  marqueurs de son contexte immédiat, la proximité tranchant quand les deux
  sont présents dans la même phrase. D'où quatre états : `boucle` (35 pts),
  `source_seule` (8 pts), `payoff_orphelin` (**0 pt + avertissement explicite :
  ce perk ne se déclenchera jamais**), `indetermine` (4 pts).
  **Choix assumé sur l'indéterminé** : demi-crédit plutôt que sanction — si
  notre analyse de texte n'arrive pas à trancher, c'est une limite de NOTRE
  détection, pas un défaut du build de l'utilisateur.
  ⚠️ **Limite explicitée dans le code** : il s'agit d'analyse de texte par
  marqueurs sur de la prose rédigée par Bungie, pas de données structurées.
  Des erreurs de classement sont inévitables — c'est pourquoi le rôle détecté
  est EXPOSÉ dans le détail du pilier, pour que l'utilisateur puisse voir ce
  qui a été compris et signaler les cas aberrants plutôt que de subir un score
  inexplicable.
  Testé sur 7 formulations réalistes (7/7 correctes), dont le cas ambigu où
  source et payoff coexistent dans la même phrase.

---

- **SÉLECTEUR D'ARTEFACT créé**, placé sous « Mon Build » (demande de
  l'utilisateur). Jusqu'ici le Pilier 3 notait un tableau qui restait
  toujours vide, faute d'interface pour choisir un artefact.
  - **`src/data/artefacts.ts` GÉNÉRÉ PAR SCRIPT** depuis
    `knowledge-base/03_ARTIFACTS.md` : 7 artefacts × 7 slots × 3 tiers =
    **147 perks**, vérifiés au comptage. Recopier ces données à la main
    aurait été exactement le geste qui avait silencieusement tronqué 4
    chemins SVG plus tôt — le fichier porte un avertissement en tête pour
    qu'on le régénère plutôt que de l'éditer.
  - **Contraintes du jeu appliquées à la sélection** (7 perks, minimum
    2 en T1, T2+T3 ≤ 5, T3 ≤ 2), et pas seulement vérifiées au scoring :
    laisser composer une configuration impossible puis la sanctionner
    serait déroutant. Quand un perk est indisponible, **la raison est
    affichée** plutôt qu'un simple grisage silencieux.
  - **Cohérence artefact ↔ doctrine** signalée : si l'artefact ne soutient
    pas l'élément de la sous-classe, un avertissement le dit — sans
    interdire, car ça reste jouable.
  - ⚠️ **Correction de modélisation trouvée en compilant** : « Kinetic »
    figurait parmi les éléments des artefacts, alors que ce n'est pas une
    doctrine mais un type de dégâts d'arme. Le forcer dans `DamageElement`
    aurait faussé toute comparaison artefact/sous-classe. Il est désormais
    isolé dans un champ `soutientCinetique`.
  - `ArtifactSelection` passe d'un `artifactHash` Manifest à un `artifactId`
    lisible, notre source (base de connaissance Markdown) ne fournissant
    pas de hash. Les anciens champs sont conservés en optionnel pour ne pas
    casser les loadouts déjà enregistrés.

---

- **nouvelle fiche `knowledge-base/13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`**,
  issue de shatteredvault.com (source proposée par l'utilisateur), indexée
  dans `00_INDEX.md`. Apports concrets :
  - **contraintes de sélection des perks d'artefact** que
    `03_ARTIFACTS.md` ne documentait pas : 7 perks au total, dont
    **minimum 2 en Tier 1**, **T2+T3 ≤ 5** et **T3 ≤ 2**. Le Pilier 3 ne
    devra donc pas récompenser une configuration impossible ;
  - **27 règles d'armature anti-champion au total** (6 Bloqueur,
    8 Surchargé, 13 Implacable), réparties en 6 règles universelles et 21
    dérogations spécialisées. L'appli en couvre **20** : il en manque
    environ 7, que le repère « ? » permettra d'identifier ;
  - **141 armes exotiques à assignation individuelle** (+ 13 armures) —
    les cartographier une par une n'est pas réaliste, mieux vaut se
    limiter à celles réellement possédées ;
  - **correction importante** : Radiant et Volatile Rounds **ne stunnent
    plus les Bloqueurs**, ils donnent +10 % de dégâts contre les Champions.
    Vérifié dans `src/data/elementVerbs.ts` : aucune logique périmée à
    corriger, le catalogue ne décrivait que les règles de stacking ;
  - confirmation qu'**Ergo Sum** suit l'armature de son roll, cohérent avec
    la table déjà en place.
  ⚠️ Limite explicitée dans la fiche : les tableaux détaillés du site sont
  rendus en JavaScript et **n'ont pas pu être extraits**. La fiche ne
  contient donc que les règles et décomptes réellement vérifiés, pas le
  contenu des tableaux — et le précise, pour qu'on ne suppose pas plus tard
  qu'ils y figurent.
  La fiche signale aussi une **contradiction interne de la source** sur les
  contres par capacité de sous-classe (section datée « Lightfall » contredite
  par la section 9.7.0) : à vérifier en jeu avant d'en faire une règle.

---

- **conception du scoring documentée dans le README** (nouvelle section
  « Le scoring : conception et calibration ») : tableaux de pondération
  des piliers et des statistiques selon le contexte (Neutre / PvE Roaming
  / PvE DPS / PvP), justification du passage d'une moyenne simple à une
  moyenne pondérée, et détail complet du calcul de calibration.
- **calibration de l'échelle établie sur données réelles** : d'après la
  section « Armor 3.0 » de `knowledge-base/08_GAME_MECHANICS.md`, un set
  pleinement optimisé totalise **≈ 515 points** sur les 6 stats
  (30 + 25 + 20 intrinsèques/tertiaire, +18 masterwork T5 & tuning,
  +10 stat mod majeur, le tout × 5 pièces). Or le score normalisait sur
  le maximum théorique de 1200 (6 × T20) : un stuff parfait n'aurait
  jamais dépassé **43/100**. L'échelle sera donc calibrée sur **500**.
- **deux pièges de calibration documentés** : les Fonts (~+40) n'
  apparaissent pas dans les stats statiques que lit l'appli, il ne faut
  donc pas caler la référence dessus ; et la stat tertiaire n'est jamais
  l'une des deux intrinsèques (contrainte utile pour détecter une donnée
  aberrante).
- **avertissement sur la portée du score ajouté DANS l'appli**, sous le
  score global — pas seulement dans le README. Un nombre sur 100 donne
  facilement une impression d'objectivité qu'il ne mérite pas : le texte
  précise que le score évalue une cohérence théorique, qu'il ne remplace
  pas l'expérimentation en jeu, et qu'un build noté 60 peut très bien
  être excellent entre les mains du joueur.
- piste notée pour plus tard : le tableau des **12 archétypes d'armure**
  (Powerhouse, Grenadier, Paragon…) présent dans la base de connaissance
  permettrait d'enrichir le Pilier 4, aujourd'hui limité au comptage
  d'exotiques — une pièce Powerhouse dans un build grenade est un mauvais
  choix quel que soit son total de stats.

---

- **9 armatures ajoutées à la table anti-champion**, toutes relevées EN JEU
  par l'utilisateur (le Manifest ne portant pas cette information) :
  | Armature | Champion |
  |---|---|
  | Arme à interruption | Bloqueur |
  | Impact élevé | Implacable |
  | Tir d'ensemble (Mensonge de Felwinter) | Implacable |
  | Cadre Héritage PR-55 (Estoc de Redrix) | Bloqueur |
  | Armature d'attaque | Implacable |
  | Armature de soutien | Surchargé |
  | Arme calorifique équilibrée | Surchargé |
  | Arme calorifique dynamique | Surchargé |
  | Tir double | Implacable |
  « Armature légère » et « Armature de précision » étaient déjà couvertes
  (via `legere` et `precis`), et les valeurs fournies **concordent** avec
  celles déjà en table — bonne vérification croisée au passage.
  Deux points de méthode : les deux variantes « calorifique » sont listées
  SÉPARÉMENT plutôt que via un mot-clé générique, pour qu'une éventuelle
  3e variante affiche le repère « ? » au lieu d'hériter silencieusement
  d'une valeur peut-être fausse ; et le mot-clé « ensemble » a été testé
  avec les deux formes d'apostrophe (droite et typographique).
  Table : **27 entrées**, 20 armatures réelles vérifiées, aucune collision.

---

- **armature « Micro-missile » → Implacable** ajoutée (relevée en jeu par
  l'utilisateur). Même situation que « Tir dispersé » : le Manifest ne
  porte pas l'information, seule l'observation directe permet de trancher.
- **« Déni de zone » → Surchargé confirmé en jeu** : l'entrée existait
  déjà, mais je l'avais posée d'après la documentation de la 9.7.0 sans
  vérification. Elle est désormais validée sur le terrain, et le
  commentaire du code le précise — la distinction entre « supposé » et
  « confirmé » a son importance vu le nombre d'hypothèses erronées de
  cette session.
  Table anti-champion : **18 entrées**, revérifiées sans collision.

---

- **armature « Tir dispersé » → Surchargé** ajoutée à la table
  anti-champion (relevée sur Sarpédon-D, un Revolver). À noter : le
  Manifest ne portait **rien** pour cette arme (`breakerType` à 0 partout,
  aucun perk porteur) — la correspondance vient d'une observation directe
  en jeu par l'utilisateur, seule source disponible. C'est la limite de
  l'approche par armature : tant que Bungie n'expose pas la donnée, chaque
  armature inconnue demande un relevé manuel. Le repère « ? » ajouté
  précédemment sert justement à les repérer au fil de l'eau.
  Table vérifiée : 17 entrées, aucune collision (« tir dispersé » et
  « tir rapide » sont bien distincts).

---

- **rappel de Doctrine après équipement depuis un loadout** (idée de
  l'utilisateur, retenue) : l'API Bungie n'équipe ni la sous-classe ni ses
  compétences. Plutôt qu'une simple phrase vite oubliée, une fenêtre
  liste désormais précisément ce qu'il reste à régler à la main —
  sous-classe, super, mêlée, grenade, compétence de classe, saut, aspects
  et fragments — avec les vrais noms résolus depuis le Manifest. Fermeture
  par un bouton **« ✅ C'est équipé »** placé volontairement EN BAS : il
  faut avoir parcouru la liste pour l'atteindre. Le rappel s'ouvre même en
  cas d'échec partiel sur l'équipement, la doctrine restant à configurer
  dans tous les cas. Le parcours "Mon Build" est inchangé, comme demandé.
- **bouton « Diagnostic Artefact » RETIRÉ** — il venait de mon hypothèse
  erronée selon laquelle l'anti-champion provenait de l'artefact
  saisonnier, invalidée par la mise à jour 9.7.0. Devenu sans objet, il
  aurait seulement encombré l'interface et induit en erreur. La fonction
  correspondante a été supprimée du code également.
- **dossier `builds/`** créé pour ranger les exports de loadouts, avec un
  `LISEZ-MOI.md` expliquant pourquoi il n'est pas rempli automatiquement
  (une page web ne choisit pas où elle écrit) et à quoi servent ces
  sauvegardes. `.gitignore` mis à jour pour ignorer les `.json`
  personnels tout en gardant le dossier.

---

- **anti-champion : mot-clé "precision" trop long** — il ratait « Cadre de
  munition **PRÉCIS** » (Héritage). Raccourci en `precis`, qui couvre les
  deux formes. Même leçon que « rayon »/« rayons » : les textes Bungie
  varient, un mot-clé trop spécifique passe à côté.
- **repère « ? » pour les armatures non reconnues** : depuis
  Anti-Champion 2.0, TOUTE arme a une capacité liée à son armature. Une
  arme sans anti-champion détecté signale donc une armature absente de la
  table, pas une arme sans capacité. Un petit « ? » survolable affiche
  désormais le nom brut de l'armature (ex. « Tir dispersé », Sarpédon-D)
  au lieu de laisser un vide silencieux impossible à diagnostiquer.
  ⏳ « Tir dispersé » reste à mapper : je ne connais pas le champion
  correspondant — à relever en jeu.
- **BUG D'ÉQUIPEMENT corrigé (ErrorCode 1641)** — signalé par
  l'utilisateur : équiper un build contenant la « Lame praxique » échouait
  sur cette seule pièce (`DestinyItemUniqueEquipRestricted`). Cause : les
  pièces étaient équipées UNE PAR UNE dans l'ordre de la liste ; si
  l'exotique du build arrivait avant que l'exotique déjà porté ne soit
  remplacé, le jeu refusait — deux exotiques auraient été équipés
  simultanément. L'ordre dépendait donc de ce que portait le personnage
  au départ, d'où le caractère aléatoire du bug.
  Correction : **seconde passe**. Les pièces refusées pour conflit
  d'unicité sont réessayées une fois tout le reste équipé, moment où
  l'exotique gênant a généralement été remplacé. Seuls les conflits
  d'unicité sont réessayés — une erreur de droits ou d'objet absent ne se
  résoudrait pas en recommençant. Le message final indique quelles pièces
  ont nécessité le 2e essai.
- **message d'équipement rendu honnête** : il annonçait « Build équipé
  avec succès », ce qui laissait croire que TOUT était passé alors que la
  **Doctrine ne l'est jamais** (mécanisme d'API différent). Le message
  précise désormais explicitement que la sous-classe, les aspects, les
  fragments, la mêlée et la grenade ne sont pas équipés et restent à
  configurer en jeu — ce qui explique ce que l'utilisateur a observé.

---

- **clarification "Charger" vs "Équiper en jeu"** (question de
  l'utilisateur, vérifiée dans le code) : le bouton **"Charger" du
  panneau Loadouts n'équipe RIEN en jeu** — il appelle uniquement
  `setMonBuild`, donc recharge le build dans l'appli. Ce que
  l'utilisateur avait observé venait de l'enchaînement "Charger" puis
  "Équiper le build en jeu (bêta)". Les deux boutons ne font donc pas
  doublon ; le nouveau "🎮 Équiper en jeu" évite juste l'aller-retour.
- **diagnostic d'insertion de plug ajouté** (mode développement, bloc
  Doctrine) pour répondre à une question précise : l'appli peut-elle
  équiper une DOCTRINE complète en jeu (super/aspects/fragments/mêlée/
  grenade), ou seulement la sous-classe elle-même ?
  Contexte : `equiperObjet` équipe des OBJETS ; la configuration d'une
  sous-classe passe par l'insertion de PLUGS dans des SOCKETS, via un
  endpoint distinct (`InsertSocketPlugFree`) réputé restreint. Plutôt que
  de supposer, le test tente UNE insertion réelle et rapporte la réponse
  brute de Bungie (statut HTTP, ErrorCode, ErrorStatus, Message) — de quoi
  distinguer un refus d'autorisation (401/403), un refus logique
  (ErrorCode métier) et une erreur serveur (500).
  **Précautions prises** : le test réinsère un fragment DÉJÀ équipé à
  l'emplacement qu'il occupe déjà (donc sans effet concret s'il réussit),
  ne porte que sur UN plug, et demande confirmation explicite.
  Deux manques du code ont dû être comblés au passage : `characterId`
  n'était pas conservé sur `SousClassePossedee`, et l'index de socket
  n'était stocké nulle part — il est désormais relu depuis le Manifest
  (`trouverIndexSocketPourPlug`) plutôt que deviné, un index erroné
  donnant un échec trompeur sans rapport avec la question posée.

---

- **CAPACITÉ EN FRAGMENTS résolue** grâce au diagnostic comparatif fourni
  par l'utilisateur : la donnée est portée par la stat
  **`2223994109` — « Capacité d'énergie d'aspect »** (« À l'affût » = 3,
  « Bourreau élégant » = 2), et confirmée par
  `plug.energyCapacity.capacityValue` qui donne la même valeur. Les deux
  sources concordant, l'interprétation est sûre.
  L'appli calcule désormais le nombre RÉEL d'emplacements de fragments
  (= somme des capacités des aspects équipés) au lieu du « toujours 6 »
  supposé jusqu'ici — l'affichage `x/y` et la limite de sélection en
  tiennent compte. C'était un prérequis au scoring : un build ne doit pas
  être pénalisé pour des fragments qu'il ne PEUT pas équiper.
  Implémentation : lecture directe de `plug.energyCapacity.capacityValue`,
  avec repli sur `investmentStats` en identifiant la stat par son NOM
  plutôt que par son hash codé en dur (un hash peut changer, le libellé
  est plus stable).
- **"Mon Build"** : repère 🛡️ ajouté (il n'existait que dans
  l'Inventaire/Coffre) et bouton "Détails" étendu aux ARMURES, avec les
  bonus de set complets dans la popup.
- **panneau Loadouts** : bouton d'ouverture agrandi de 50 % ; champ de
  **description** libre par loadout (saisie à l'enregistrement, modifiable
  ensuite via "Décrire") ; **bouton "🎮 Équiper en jeu"** réutilisant le
  mécanisme d'équipement existant (déjà confirmé fonctionnel) avec
  sélection du personnage cible. ⚠️ Action réelle sur le compte, donc
  confirmation demandée, et bilan précis en fin d'opération (pièces
  équipées / en échec) plutôt qu'un échec global si une pièce manque.

---

- **diagnostic de la capacité en fragments** ajouté (bouton 🔍 sur chaque
  ASPECT dans la Doctrine, mode développement). Je ne sais pas où le
  Manifest range cette information : le diagnostic affiche donc TOUS les
  candidats plausibles d'un coup (`investmentStats`, `stats.stats`,
  `plug.energyCapacity`, `plugCategoryIdentifier`, plus tout champ dont le
  nom évoque une capacité) plutôt que d'en supposer un.
  **Méthode d'exploitation** : comparer un aspect à 2 fragments et un
  aspect à 3, et repérer le champ dont la valeur varie en conséquence —
  c'est la comparaison qui tranche, pas un champ isolé.
- **README** : nouvelle section expliquant où sont stockés les loadouts
  (`localStorage`), ce que ça implique (liés au navigateur, effacés si on
  vide les données du site, non synchronisés entre PC), et **ce qu'il
  faudrait pour dépasser le local** : fichier partagé synchronisé (déjà
  possible via l'export), vrai backend (serveur + base + comptes +
  authentification, avec l'hébergement et la responsabilité que ça
  implique), ou stockage côté Bungie (idéal mais c'est ce qui échouait en
  500/401, et son format ne couvre pas forcément la doctrine complète).

---

- **SYSTÈME DE LOADOUTS ajouté** (panneau latéral à droite, suivant le
  défilement, repliable). Enregistre le **build ENTIER** — équipement,
  doctrine complète (super/aspects/fragments/mêlée/grenade), artefact —
  conformément au choix de l'utilisateur ; les perks et mods suivront
  sans changement de format, puisqu'ils font déjà partie de `GearPiece`.
  **100% local** (`localStorage`) : aucune dépendance réseau, donc aucun
  risque de retomber sur les erreurs 500/401 des loadouts côté Bungie.
  ⚠️ Contrepartie assumée et affichée dans le panneau : les loadouts sont
  liés au NAVIGATEUR, pas au compte — ils ne suivent pas d'un PC à
  l'autre et disparaissent si on vide les données du site. D'où
  l'export/import JSON, qui sert de sauvegarde manuelle.
  **Pièces manquantes** : un ⚠️ rouge signale les objets introuvables sur
  le compte (démantelés depuis la sauvegarde), avec leur liste au survol.
  Le loadout reste chargeable : on signale, on n'empêche pas. La
  comparaison se fait par `itemInstanceId` (l'exemplaire précis) et non
  `itemHash` (le modèle) ; les emplacements vides sont ignorés pour
  éviter de faux avertissements. Tant que l'inventaire n'est pas chargé,
  aucun avertissement n'est affiché — plutôt que de signaler à tort
  toutes les pièces comme absentes.

---

- **BUG corrigé : Doctrine pré-sélectionnée sur Abyssal** — `element:
  "abyssal"` était codé en dur dans l'état initial du build. La Doctrine
  s'affichait donc comme si Abyssal était choisi alors que RIEN n'avait
  été chargé, d'où des aspects non sélectionnables jusqu'à ce qu'on change
  de classe puis revienne (ce qui déclenchait enfin un vrai chargement).
  `element` accepte désormais `null`, comme `classe` — aucune sous-classe
  n'est sélectionnée par défaut, et le symptôme disparaît avec sa cause.
- **bonus de Set — affichage enrichi** :
  (1) légende ajoutée en haut de "Mon Inventaire" expliquant les DEUX
  repères visuels (★ = exotique, 🛡️ = fait partie d'un set), qui étaient
  jusqu'ici utilisés sans aucune explication ;
  (2) l'infobulle du 🛡️ donne maintenant la DESCRIPTION complète de
  chaque bonus, pas seulement son nom ;
  (3) le bouton de diagnostic "🔍 Set" est remplacé par un vrai bouton
  **"Détails" sur les armures** (donc plus limité au mode développement),
  dont la popup affiche les bonus de set complets, avec icônes et
  descriptions. Effet de bord : plus besoin de réserver un espace vide
  pour l'alignement, armes et armures ont désormais le même bouton.

---

- **Bonus de Set d'armure implémentés** (Pilier 4), sur structure
  confirmée par un diagnostic réel de l'utilisateur (Masque du grand
  zélé → set "Souvenir d'Athéon", `setItems` + `setPerks[]` avec
  `requiredSetCount`/`sandboxPerkHash`).
  (1) infobulle de chaque armure concernée : liste TOUS les paliers
  possibles du set, l'infobulle ne portant que sur une pièce isolée ;
  (2) petit repère 🛡️ visible directement sur la ligne (survolable),
  pour ne pas dépendre uniquement de l'infobulle ;
  (3) "Mon Build" : nouvel encart "Bonus de Set actifs", qui compte les
  pièces par set parmi l'armure RÉELLEMENT équipée et n'affiche que les
  paliers dont le seuil est atteint - vérifié avec les vraies données du
  diagnostic (1 pièce → rien, 2 → palier 2p, 4 → les deux paliers).
  ⚠️ Nettoyage au passage : deux implémentations similaires avaient été
  écrites (l'une déjà en place sous le nom `obtenirBonusSet`, l'autre que
  je venais d'ajouter sous `obtenirSetArmure`) - la première, plus
  complète (inclut l'icône du perk), a été conservée, la mienne retirée.
  **Reste à faire** : intégration au SCORE du Pilier 4 lui-même (`DEMO_SETS`
  reste un jeu d'exemples) - l'affichage est fonctionnel, mais le calcul
  du score n'en tient pas encore compte.

---

- **bonus de Set d'armure : table identifiée, diagnostic ajouté** — le
  nom de table qui manquait depuis le début a été trouvé via la
  documentation officielle Bungie transmise par l'utilisateur :
  `DestinyEquipableItemSetDefinition`, avec (d'après la doc) un tableau
  `setPerks[]` où chaque entrée porte un `sandboxPerkHash` (renvoyant vers
  `DestinySandboxPerkDefinition`) et un `requiredSetCount` (nombre de
  pièces à équiper). Plutôt que de coder la logique de scoring dessus à
  l'aveugle, un bouton "🔍 Set" a été ajouté sur chaque armure (mode
  développement) : il affiche l'entrée réelle du Manifest pour cette
  armure si elle appartient à un set, sinon un échantillon de la table
  pour vérifier la structure sur des données concrètes avant d'écrire
  quoi que ce soit de définitif.

---

- **abréviation des noms trop longs** (`raccourcirNom`, partagée) :
  "(temps perdu)" → "(TP)" pour TOUTE la famille d'armes concernée (et pas
  seulement la Grande Faucheuse, comme précisé par l'utilisateur), et
  "Revolver d'officier de septième Séraphin" → "Revo. Off. Septième
  Séraph". Les deux formes d'apostrophe (droite et typographique) sont
  gérées. **Choix de conception** : seules des abréviations explicitement
  listées sont appliquées, jamais de troncature automatique — un
  "Revolver d'officier de sep…" rendrait deux objets proches
  indiscernables. Appliqué aux listes uniquement : les infobulles, les
  popups "Détails" et les messages de confirmation d'équipement gardent
  le nom COMPLET (l'ambiguïté y serait gênante, voire risquée avant
  d'équiper).
- **barres de statistiques** ajoutées dans "Mon Build", sous chaque
  valeur. Elles utilisent `STAT_MAX` importé du module de scoring plutôt
  qu'un 200 codé en dur : si Bungie change le plafond, l'affichage et le
  calcul resteront d'accord.

---

- **objet de classe** : dernière icône d'armure manquante, ajoutée (5/5).
  Extraction du chemin SVG par script et normalisation des espaces — le
  fichier source contenait des sauts de ligne qui cassaient la chaîne JS,
  détecté immédiatement par la compilation.
- **icônes anti-champion déplacées** sur la ligne des perks, à leur droite,
  séparées par un tiret quadratin et à la même taille qu'eux (16px au lieu
  de 28). Effet de bord bienvenu : la ligne du nom n'est plus allongée, ce
  qui règle aussi le retour à la ligne observé sur les noms longs
  ("Lancer de couteau de Randy").
- **colonnes du Coffre élargies** (`repeat(4, …)` → `auto-fit` avec un
  minimum de 260px) : la grille s'adapte désormais à la largeur
  disponible au lieu d'imposer 4 colonnes serrées.
- **bouton "Doublons"** ajouté à l'Inventaire ET au Coffre : n'affiche que
  les objets possédés en plusieurs exemplaires (même `itemHash`). Le
  comptage se fait sur l'ensemble non filtré, pour qu'un doublon reste
  détecté même si un exemplaire est masqué par un autre filtre.
- **"Mon Build"** : encart anti-champions rendu compact, et **total des
  statistiques du build** ajouté à sa droite, à hauteur identique
  (`alignItems: stretch`). L'ordre des stats reprend exactement celui du
  scoring (`lib/scoring/stats.ts`) pour éviter toute divergence entre ce
  qui est affiché et ce qui est calculé.
- **légende du marqueur 🎮** : affiche maintenant le marqueur tel qu'il
  apparaît réellement (pastille verte + halo) au lieu d'un émoji nu — sans
  l'aura, on ne reconnaissait pas le repère cherché dans la grille.
- **bouton "Détails"** : sa place est désormais réservée sur les armures
  (qui n'en ont pas), pour que "+ Ajouter" reste aligné d'une ligne à
  l'autre.

---

- **"Mon Build" : désalignement icône/nom corrigé** — le libellé
  d'emplacement ("Arme cinétique"...) était empilé DANS la colonne de
  droite, au-dessus du nom, alors que la colonne de gauche (miniature +
  icône de catégorie) n'avait rien d'équivalent au-dessus : ça décalait
  mécaniquement les deux colonnes l'une par rapport à l'autre (signalé
  par l'utilisateur via capture d'écran). Le libellé passe maintenant sur
  sa propre ligne, au-dessus du bloc icône+nom entier, pour que les deux
  colonnes démarrent exactement à la même hauteur. Vaut pour les armes
  comme pour les armures (même bloc de code pour les deux).
  ⚠️ Note : la capture fournie montrait aussi l'ancien affichage textuel
  des perks ("#1 Arme à distance..."), déjà remplacé par des icônes deux
  livraisons plus tôt - probablement une version mise en cache côté
  navigateur, à vérifier avec un rechargement forcé.

---

- **ANTI-CHAMPION 2.0 : règle réelle implémentée** (correction d'une
  supposition erronée de ma part). J'avais conclu que la capacité venait
  de l'artefact saisonnier — **faux**, et l'utilisateur l'a signalé. La
  mise à jour **9.7.0 du 09/06/2026** (Monument of Triumph) a au contraire
  **retiré les mods anti-Champion des artefacts** : chaque arme possède
  désormais une capacité anti-Champion **intrinsèque, déterminée par son
  ARMATURE (archétype)**. Règle générale annoncée par Bungie :
  | Armature | Champion contré |
  |---|---|
  | Agressive, Fort impact | Implacable |
  | Précision, Adaptative | Bloqueur |
  | Légère, Tir rapide | Surcharge |
  Plus des cas particuliers (rafale lourde → Implacable, déni de zone →
  Surcharge, armatures d'épées : projection → Bloqueur, vortex →
  Surcharge, onde → Implacable).
  ⚠️ Cette mise à jour étant postérieure à ma date de connaissance
  (fin mai 2026), je n'aurais pas pu la connaître sans la recherche que
  m'a fait faire l'utilisateur en me donnant le lien du patch.
  **Implémentation** : lecture du nom du plug intrinsèque (socket 0, qui
  porte l'armature — confirmé par les diagnostics réels d'Apocalypse et
  Mille Voix), puis correspondance par mots-clés courts et tolérants (même
  leçon que l'épisode "Fusil à rayon" vs "rayons"). On ne parcourt plus
  toutes les options des plugsets : c'était la source des faux positifs.
  Vérifié : Apocalypse ("Armature adaptative") donne maintenant
  **Bloqueur**, et non plus le "Surcharge" inventé par l'ancienne
  détection.
  **Limite connue** : les EXOTIQUES n'ont pas d'armature standard (Mille
  Voix a "Œil d'Ahamkara" en plug intrinsèque). Ils ne sont donc pas
  encore reconnus et affichent le badge de diagnostic, qui indique
  désormais le nom brut de l'armature — il suffira de compléter la table
  au cas par cas à partir de ces retours.

---

- **ANTI-CHAMPIONS : la vraie cause enfin établie, sur données réelles.**
  Le diagnostic comparatif (Mille Voix vs Apocalypse) a livré deux
  conclusions nettes :
  1. **`breakerType` vaut 0 PARTOUT**, sur l'arme comme sur chacun de ses
     plugs, y compris sur les armes qui affichent bien un anti-champion en
     jeu. Le Manifest ne porte donc PAS cette capacité sur l'arme. Mes
     trois hypothèses successives (nom des perks, `breakerType` sur
     l'arme, puis sur les plugs) étaient toutes fausses.
  2. **La détection par NOM produisait des FAUX POSITIFS.** Sur
     "Apocalypse", aucun plug équipé ne contient "surcharge" : la
     détection matchait un simple MOD parmi les options possibles du
     plugset (on parcourt toutes les options, pas seulement celles
     équipées). L'appli affichait donc un anti-champion inventé — ce qui
     explique le motif troublant "une poignée d'armes fonctionne".
     Détection par nom **supprimée** : mieux vaut ne rien afficher que du
     faux.
  **Piste retenue** : dans Destiny 2 actuel, l'anti-champion vient des
  perks de l'ARTEFACT SAISONNIER, qui s'appliquent à des TYPES d'armes
  ("Fusil à fusion implacable" rend tous les fusils à fusion Implacables).
  Ça expliquerait parfaitement pourquoi seules certaines armes en
  affichent : celles dont le type est couvert par l'artefact de la saison.
  Un bouton "🔍 Diagnostic Artefact (dev)" a été ajouté dans le bloc de
  connexion pour récupérer les perks réellement débloqués et construire la
  correspondance type d'arme → type de champion sur des faits.
  ⚠️ **Conséquence visible en attendant** : plus aucune icône
  anti-champion ne s'affiche (les quelques-unes visibles auparavant
  étaient fausses).

---

- **icônes de type d'arme confirmées corrigées** par l'utilisateur après
  le lot de mots-clés raccourcis (rayon/eclaireur/impulsion...).
- **"Mon Build" aligné sur l'Inventaire/Coffre** : structure de colonnes
  identique (miniature + icône de catégorie à gauche, nom + perks à
  droite), infobulle ajoutée (`texteSurvol`, exportée depuis
  `SelecteurInventaire` pour être réutilisée), et surtout **popup
  "Détails" ajoutée** — jusqu'ici absente de "Mon Build" — construite sur
  les mêmes fonctions centrales (`obtenirOptionsToutesColonnes`) pour un
  résultat identique à l'Inventaire. Bouton "Détails" placé SOUS
  "Équiper (bêta)", dans une colonne dédiée pour un alignement propre
  entre les deux. Nettoyage au passage : l'ancien affichage "colonne #N"
  en texte (remplacé par la popup) et les imports qu'il utilisait seul
  ont été retirés.

---

- **VRAIE CAUSE des icônes manquantes (fusil à rayon / éclaireur /
  impulsion) : mes mots-clés ne correspondaient pas au texte réel de
  Bungie**. Le diagnostic a livré les textes exacts : "Fusil à rayon"
  (singulier, mon mot-clé disait "rayons"), "Fusil d'éclaireur" (avec
  "d'", je cherchais "fusil eclaireur"), "Fusil à impulsion" (singulier
  contre "impulsions"). Les mots-clés ont été raccourcis à leur partie
  distinctive et stable ("rayon", "eclaireur", "impulsion", "pompe",
  "precision", "automatique", "fusion", "fusion lineaire"), donc
  tolérants au singulier/pluriel et aux variantes d'écriture. Testé sur
  les 18 types réels : aucune collision.
- **anti-champions : diagnostic ajouté plutôt qu'une troisième
  supposition**. Deux explications proposées (lecture du nom des perks,
  puis `breakerType` sur l'arme et sur les plugs) n'ont rien changé : les
  mêmes armes fonctionnent, les mêmes échouent. Un diagnostic accessible
  depuis la popup "Détails" (mode développement) affiche désormais les
  données BRUTES du Manifest pour l'arme : `breakerType`,
  `breakerTypeHash`, les `def.perks` et le `breakerType` de chaque plug.
  À comparer entre une arme qui marche (Apocalypse) et une qui ne marche
  pas (Mille Voix) pour corriger sur des faits plutôt qu'au jugé.
- **"Mon Build" réorganisé** : le libellé d'emplacement ("Arme
  cinétique"...) passe en premier, miniature et icône de catégorie à sa
  droite, puis le nom — pour les armes comme pour les armures. Les perks
  utilisent maintenant la **même présentation que l'Inventaire et le
  Coffre** (icônes au lieu de noms en texte).
- **filtrage des perks cosmétiques étendu aux ICÔNES** — jusqu'ici il
  n'existait que dans le texte de l'infobulle, donc revêtements,
  ornements, compte-frags et paliers de pièce maîtresse occupaient des
  places parmi les 4 icônes affichées. Extrait dans une fonction partagée
  (`obtenirIconesPerksFiltrees`) utilisée par l'Inventaire, le Coffre et
  "Mon Build", pour garantir une présentation identique partout.
- **Recherche dans le Manifest** : l'icône de catégorie revient à droite
  du nom (à gauche de l'anti-champion), la proposition B ne s'appliquant
  qu'à l'Inventaire/Coffre et à "Mon Build".

---

- **VRAIE CAUSE des icônes de lance-grenades (et de 3 autres) : chemins
  SVG tronqués à la copie** — en comparant systématiquement chaque icône
  du code à son fichier source, le chemin du lance-grenades spécial ne
  faisait que 764 caractères sur 6959 (11 % du dessin), d'où une icône
  quasi vide. La logique cinétique/énergie était donc correcte depuis
  deux itérations : c'était l'image elle-même qui était incomplète.
  3 autres icônes étaient également fausses (fusil à impulsions, arc,
  fusil à fusion). Les 19 chemins ont été reconstruits automatiquement
  depuis les fichiers d'origine, avec vérification que chacun correspond
  désormais exactement. **Leçon** : recopier un chemin SVG à la main est
  une source d'erreur silencieuse — comparer avec la source plutôt que se
  fier au rendu.
- **anti-champions : le motif repéré par l'utilisateur était la clé** —
  Apocalypse, Léviathan, Parjure, Maître du Tonnerre et Diviseur d'ondes
  fonctionnaient, Mille Voix non. Explication : les premières déclarent
  `breakerType` sur l'ARME elle-même, la seconde le déclare sur le PLUG
  du perk intrinsèque (d'où le "//" affiché en jeu dans "Œil d'Ahamkara
  // Implacable" : le jeu concatène le nom du perk et le type de champion
  que CE PERK apporte). Les deux niveaux sont maintenant lus.
- **proposition B intégrée** : l'icône de catégorie passe SOUS la
  miniature, dans une colonne de gauche (validée par aperçu). Les noms
  s'alignent ainsi à la même hauteur d'une ligne à l'autre, quelle que
  soit la forme de l'icône. Appliqué aux 3 endroits concernés
  (Inventaire/Coffre, Mon Build, Recherche). L'icône anti-champion reste
  à droite du nom, où elle se lit avec le texte.
- mention "(8 pièces)" retirée du titre "Mon Build" ; bouton
  "Réinitialiser Mon Build" déplacé à droite du bouton "Équiper le build
  en jeu".
- **bouton de téléchargement des Manifests FR+EN** ajouté à droite du
  titre "Recherche dans le Manifest", **en mode développement uniquement**
  (`import.meta.env.DEV` — invisible dans un build destiné aux invités).
  ⚠️ Le message affiché précise l'emplacement réel des fichiers : une page
  web n'a pas le droit de choisir son dossier de destination, ils vont
  donc dans les téléchargements du navigateur (typiquement
  `C:\Users\<vous>\Downloads`), jamais dans les dossiers du jeu — c'est ce
  qui avait dérouté l'utilisateur. Pour les déposer dans le projet, le
  script `scripts/telecharger-manifest.mjs` reste la bonne option.

---

- **bouton "Réinitialiser Mon Build" ajouté** — efface équipement ET
  doctrine choisis d'un coup (repart de l'état vide d'origine, classe à
  `null`), avec confirmation avant d'agir. Le texte de confirmation
  précise explicitement que ça ne touche pas le personnage en jeu
  (seulement cette page).
- **statut du bouton "Équiper" corrigé** — l'utilisateur confirme l'avoir
  utilisé avec succès pour changer son équipement réel en jeu depuis
  "Mon Build", contredisant le constat précédent ("500 systématique").
  Le 500 rencontré auparavant était probablement ponctuel plutôt qu'un
  vrai blocage de l'API.

- **passe de débogage de fond (demandée par l'utilisateur) + nouveau
  script de téléchargement du Manifest** —
  (1) **cause probable des armes sans icône NI badge identifiée** :
  `IconeTypeArme` commençait par `if (!typeArme) return null`, donc tout
  objet dont le Manifest ne renvoie pas de type disparaissait sans
  laisser la moindre trace à diagnostiquer ("Diseur de vérité", "Trame de
  machin"). Le composant ne renvoie plus jamais `null` en silence ;
  (2) **entrée "Revolver" restaurée** — elle fonctionnait depuis le
  début, retirée à tort en croyant à un conflit avec "Pistolet" ; en
  réalité "Pistolet" (Sidearm), "Revolver" (Hand Cannon) et
  "Pistolet-mitrailleur" (SMG) ont des textes distincts et cohabitent
  très bien, l'ordre de test suffisant à éviter la collision de
  sous-chaîne ;
  (3) **champ Manifest officiel des anti-champions identifié** :
  `breakerType` (enum DestinyBreakerType, 1 = Bloqueur / 2 = Surchargé /
  3 = Implacable), jusqu'ici inconnu de moi - devient la méthode
  principale, la lecture du nom des perks passant en simple repli. Bien
  plus robuste : indépendant de la langue et de la formulation des noms
  ("Œil d'Ahamkara // Implacable") ;
  (4) **optimisation** : le calcul anti-champion parcourait tous les
  sockets et plugsets de chaque objet affiché (~800 dans le coffre) à
  chaque rendu, donc à chaque frappe de recherche et changement de
  filtre. Résultat désormais mis en cache par hash d'objet (WeakMap par
  base) — c'était de loin le calcul le plus lourd de l'affichage ;
  (5) **nouveau script `scripts/telecharger-manifest.mjs`** — pose une
  copie des Manifests FR et EN sur le disque en vrais fichiers SQLite
  (dossier `manifest-local/`). Utilise `fflate`, déjà présent dans les
  dépendances, donc rien à installer. Objectif : pouvoir comparer les
  textes FR/EN directement en SQL plutôt que de passer par des
  aller-retours de diagnostic dans l'appli à chaque doute sur un mot-clé.
  ⚠️ Script non testé en conditions réelles (le conteneur où je travaille
  n'a pas d'accès réseau) : la syntaxe et la lecture de `.env.local` sont
  vérifiées, mais le téléchargement lui-même reste à valider.

- **3 vraies causes trouvées grâce aux précisions de l'utilisateur sur
  les icônes d'armes manquantes** —
  (1) le vrai texte Bungie pour ce qui était deviné "Revolver" est en
  fait "Pistolet" (confirmé via le diagnostic sur "Élu du Voyageur") -
  corrigé, sans risque de collision avec "Pistolet-mitrailleur" (ordre
  déjà correct dans le tableau) ;
  (2) les lance-grenades à munitions spéciales peuvent être en
  emplacement CINÉTIQUE, pas seulement énergie comme supposé (confirmé
  sur "Le Sommet", dont le diagnostic indiquait "slot: cinétique") - la
  logique ne traite plus que "lourde" comme signal fiable de la version
  classique, tout le reste (cinétique OU énergie) étant considéré
  spécial ;
  (3) **le petit point de diagnostic "·" était trop petit pour être
  survolé précisément**, faisant apparaître l'infobulle de l'arme
  entière à la place du diagnostic (signalé sur "Vigile Liminaire") -
  transformé en badge "?" bordé, de la taille des icônes, bien plus
  facile à cibler précisément à la souris.

---

- **lot de corrections suite au premier test complet des anti-champions**
  —
  (1) **vraie cause de l'invisibilité des icônes anti-champion trouvée**
  — la détection ne vérifiait que `singleInitialItemHash`, ratant
  certains perks intrinsèques (aucune icône n'apparaissait, y compris sur
  "Mille Voix" pourtant confirmé fonctionnel au test précédent) ; corrigé
  avec le même triple repli utilisé ailleurs dans le code
  (`reusablePlugItems` → `singleInitialItemHash` → `reusablePlugSetHash`
  → `randomizedPlugSetHash`) ;
  (2) infobulle réorganisée : source sur sa propre ligne sous le nom
  (plus sur la même ligne avec un tiret), "Anti-[Type]" ajouté à la
  suite ;
  (3) filtre "revêtement" élargi (était trop restrictif, "revetement
  d'origine" uniquement) - même piège que "palier"/"souvenir" déjà
  rencontré, les noms de revêtement sont probablement variés ;
  (4) **symbole du Cryptarque jamais réellement intégré au code, corrigé**
  — n'existait que dans un aperçu HTML envoyé lors d'une session
  précédente, jamais transposé dans l'appli elle-même ; intégré à gauche
  du titre ;
  (5) boutons de connexion inversés ("Se déconnecter" avant "Tester la
  connexion") ;
  (6) tailles d'icônes ajustées : armures à 20px ; pour les armes,
  **vraie cause de la non-uniformité trouvée** — Glaive/Lance-roquettes/
  Fusil à fusion linéaire ont un `viewBox` très allongé (formes
  naturellement fines), écrasées dans un carré fixe ; la taille de rendu
  est désormais calculée à partir du ratio réel du viewBox, pour un poids
  visuel égal entre toutes les icônes ;
  (7) **nouvel encart "Anti-champions couverts" dans Mon Build** — sous
  la liste des armes, montre les 3 types (Bloqueur, Implacable, Surcharge,
  dans cet ordre demandé) avec case cochée si détecté sur l'une des 3
  armes équipées, symbole à côté de chaque libellé ;
  (8) confirmé OK par l'utilisateur : recherche/filtres "Mon Inventaire"
  de la session précédente.

---

- **anti-champions intégrés en entier, et recherche/filtres ajoutés à
  "Mon Inventaire"** —
  (1) 3 icônes fournies par l'utilisateur (Implacable/Surchargé/
  Bloqueur), détection confirmée fonctionnelle sur un vrai cas ("Mille
  Voix // Implacable", capture d'écran à l'appui) : le type de champion
  est lu depuis le NOM du perk intrinsèque, pas une description séparée ;
  icône affichée à droite de l'icône de type d'arme, sur la même ligne
  que l'élément et le nom (Inventaire/Coffre/Recherche/Mon Build/popup
  Détails), texte "Anti-[Type]" dans l'infobulle native (pas d'icône
  possible dans une infobulle native, texte seul) ; filtres déroulants
  ajoutés à "Recherche dans le Manifest" ET au Coffre ;
  (2) **nouvelle recherche + filtres pour "Mon Inventaire"** — même
  principe que le Coffre (recherche texte, rareté, type d'arme, type
  d'armure, anti-champion), limité aux 3 personnages, avec son propre
  bouton "Réinitialiser les filtres" ; note ajoutée au TODO pour revoir
  cette distinction Inventaire/Coffre une fois le transfert
  d'équipements entre personnages/Coffre implémenté ;
  (3) tailles d'icônes différenciées appliquées : armures à 25px, armes
  à 35px (au lieu d'une taille unique de 28px), suite à l'aperçu
  comparatif 14/28/35px ;
  (4) Lance-roquettes ajouté (fichier fourni par l'utilisateur),
  17/17 types d'armes désormais couverts.

---

**(suite, session précédente)**

- lot de correctifs/ajouts suite aux premiers tests des icônes de
  catégorie agrandies —
  (1) aperçu comparatif 14/28/35px envoyé, en attente du choix final
  avant application au code ;
  (2) Lance-roquettes ajouté (fichier fourni par l'utilisateur) ;
  (3) bouton "Réinitialiser les filtres" (Coffre) rendu toujours visible,
  plus seulement quand un filtre est actif ;
  (4) **anti-champions confirmés détectables** — capture d'écran fournie
  par l'utilisateur montrant que le type de champion (Implacable/
  Surchargé/Bloqueur) apparaît ajouté directement au NOM du perk
  intrinsèque ("Œil d'Ahamkara // Implacable"), pas dans une description
  séparée - détectable par mot-clé sur le nom, même principe que le
  reste du projet. En attente des fichiers SVG des 3 types avant
  d'implémenter visuellement.

- **réorganisation de la documentation** — création de `CHANGELOG.md`
  (historique daté complet, extrait du README et du TODO), `README.md`
  réduit à l'essentiel (démarrage, config, état général, notes de
  conception), `TODO.md` réduit aux seuls éléments réellement ouverts.
  Demande explicite de l'utilisateur pour clarifier la séparation entre
  les 3 documents.
- lot de correctifs/ajouts sur les icônes de catégorie —
  (1) icônes de type d'arme/armure doublées de taille (14px → 28px),
  aperçu avant/après validé avant intégration ;
  (2) Glaive et Fusil à fusion linéaire ajoutés (fichiers fournis par
  l'utilisateur), attention portée à l'ordre de vérification des
  mots-clés pour éviter que "fusil à fusion" (sous-chaîne) ne matche
  avant "fusil à fusion linéaire" ;
  (3) certaines icônes de type d'arme signalées comme ne s'affichant pas
  pour des objets précis (Minuit anonyme, Diviseur d'ondes, Le Sommet,
  Élu du Voyageur, Tout ou rien, Rétroneuf, Trop long à expliquer) — cause
  exacte non identifiée sans données réelles, un indicateur discret et
  survolable (affichant le `typeArme` brut) a été ajouté à la place de
  rien du tout pour permettre un diagnostic précis au prochain test ;
  (4) bouton "Réinitialiser les filtres" ajouté au Coffre, visible
  seulement si un filtre est actif ;
  (5) popup Détails réorganisée : source d'obtention déplacée sous le nom
  de l'arme (au lieu d'à droite avec un tiret), symbole de catégorie
  d'arme déplacé à droite du nom ;
  (6) question posée sur la détection des capacités anti-champion
  (Implacable/Surchargé/Bloqueur) dans les descriptions d'armes — en
  attente d'un exemple de texte réel avant d'implémenter, pour éviter de
  deviner un mot-clé à l'aveugle.

- ajout du crédit auteur ("par Orynick/Orygamer") à côté
  du titre "D2 Build Analyzer" dans l'application elle-même — visible
  quel que soit le package partagé (principal ou invité).

- création d'un **package invité** séparé
  (`d2-build-analyzer-invite`) pour partager l'appli avec des amis sans
  exposer le journal de développement (README/TODO retirés), avec un
  nouveau `GUIDE-DEMARRAGE.md` simplifié dédié (connexion avec son propre
  compte, tour rapide des blocs, sans le contenu technique du dev). Le
  package principal (celui-ci) garde sa documentation complète.

- petits déplacements de texte demandés (légende du
  marqueur 🎮 sous le titre "Doctrine (Pilier 1)", phrase "Recherche
  bilingue active" déplacée au-dessus du champ de recherche, texte
  d'info de "Personnage" déplacé sous le titre) — aucun changement de
  style, juste la position, comme demandé.

- **vrais logos d'éléments** pour les armes dans
  l'inventaire/coffre — remplace la pastille colorée par lettre par la
  VRAIE icône officielle du jeu (la même que dans la roue de la
  Doctrine), résolue via le Manifest (`DestinyDamageTypeDefinition`,
  même table déjà utilisée pour le nom, nouvelle fonction
  `obtenirIconesDamageType`). Plus de texte affiché, juste le logo (au
  survol, le nom reste disponible en infobulle).

- investigation approfondie suite à un rapport de
  "fonctionnalités absentes malgré les correctifs" (perks/Catalyseur
  toujours manquants sur la popup Détails, champ de recherche du Coffre
  invisible) — code entièrement revérifié (mots-clés de filtre, ordre des
  déclarations, structure JSX, absence de doublons) : **aucune erreur
  trouvée dans le code source**. Le ZIP a été régénéré avec une nouvelle
  empreinte pour éliminer tout doute, et des instructions de réinstallation
  propre ont été données (suppression complète de l'ancien dossier avant
  extraction du nouveau ZIP) — probable cas de fichiers anciens non
  totalement remplacés plutôt qu'un bug de code.

- réinstallation propre confirmée efficace ("il y a du
  mieux") — trois captures d'écran précises ont permis de finaliser
  plusieurs points :
  (1) **effet du Catalyseur, nouvelle approche (v4)** — "garder le plus
  long" ne suffisait toujours pas, probablement parce que le texte de
  DÉBLOCAGE est en fait plus long que l'effet réel (critère inversé).
  Remplacé par une concaténation de TOUT ce qui est disponible
  (description directe + tous les perks liés), sans plus essayer de
  choisir : rien n'est masqué, quitte à voir le texte de déblocage en
  plus de l'effet ;
  (2) **ornement "Vœux de malheur" toujours affiché, corrigé** — sa
  description contient littéralement "ornement d'arme" (confirmé par
  capture d'écran), même signal que pour le doublon de recherche "Faim
  qui Ronge" — appliqué à l'infobulle exotique ET à la popup Détails ;
  (3) **infobulles armes légendaires reformatées** — même style que les
  exotiques (nom : description par ligne) au lieu d'une liste plate de
  noms, pour la cohérence demandée — sans ajouter de filtrage par
  catégorie (pour ne pas risquer la régression déjà vécue) ;
  (4) reste ouvert : doublon "Faim qui Ronge" (arme + ornement), toujours
  pas de nouvelle donnée pour l'investiguer davantage.
  ⚠️ Une vraie erreur de compilation (`const` réassigné) a été détectée et
  corrigée pendant cette session, avant livraison.

- ⚠️ **le correctif "retrait chirurgical de la phrase de
  déblocage" annoncé lors de l'échange précédent n'avait en fait jamais
  été réellement sauvegardé dans le fichier** (vérifié par recherche
  directe dans le code : absent). Refait, et cette fois **le vrai bug
  d'architecture a été trouvé** : l'infobulle des armes
  (`SelecteurInventaire.tsx`) lisait la description BRUTE directement
  (`def.displayProperties.description`), sans jamais passer par la
  logique de nettoyage/concaténation — c'est la vraie raison pour
  laquelle "Le Chardon" continuait d'afficher le texte de déblocage du
  Catalyseur malgré les correctifs précédents. Nouvelle fonction centrale
  exportée `obtenirDescriptionComplete` (dans `doctrine.ts`), utilisée
  maintenant aux 3 endroits (infobulle, popup Détails, options de
  sous-classe) au lieu d'une logique dupliquée à seulement 2 endroits
  sur 3.

- **ornement "Vœux de malheur" toujours affiché malgré
  le correctif précédent — vraie cause identifiée** — l'ancienne
  vérification ne regardait que la PREMIÈRE option de chaque socket pour
  classer toute la colonne (souvent une option générique/vide, pas celle
  réellement portée) ; la nouvelle fonction centrale vérifie l'option
  RÉELLEMENT équipée sur cet exemplaire précis, corrigeant ce point.

- nouveau filtre **"harmonisation"** (fonctionnalité
  in-game augmentant les chances d'apparition d'un objet) — nouveau
  doublon signalé pour "Faim qui Ronge", détecté via sa description,
  masqué par défaut comme quêtes/ornements/packs.

- **infobulles armes légendaires filtrées** avec des
  mots-clés précis CONFIRMÉS par l'utilisateur ("revêtement d'origine",
  "palier"/"pièce maîtresse", "compte-frags", "ornement d'origine",
  "effet visuel festif") — contrairement aux tentatives précédentes sur
  les exotiques, ici les mots-clés sont des exemples concrets donnés
  directement par l'utilisateur, pas une catégorie large devinée, donc
  un risque de régression bien moindre. Testé logiquement, aucun faux
  positif sur un vrai perk.

- deux vraies causes identifiées grâce à des captures
  d'écran précises —
  (1) **texte du Catalyseur, identification correcte du bon texte (v6)**
  — ce n'était pas une "condition de déblocage" comme supposé, mais le
  texte GÉNÉRIQUE de toute Pièce maîtresse ("Améliore cette arme en
  Pièce maîtresse..."), confirmé par capture d'écran (souligné en bleu
  par l'utilisateur sur "Le Chardon"). Mots-clés corrigés, testé avec le
  texte exact fourni. Préfixe "PM —" retiré partout (Mon Inventaire ET
  Mon Build), demande de simplification de l'utilisateur ;
  (2) **popup Détails, perks structurantes disparues (colonnes 2-5, 11) —
  même piège que "mod" identifié et corrigé** — un filtre précoce par
  catégorie PARENTE (avant résolution des options) supprimait de vrais
  perks partageant une catégorie plus large que prévu avec du bruit
  cosmétique. Retiré, le filtrage ne se fait plus que sur les options
  individuelles une fois résolues.

- 🎉 **Catalyseur confirmé résolu par l'utilisateur**
  ("Impeccable, on a trouvé la solution !"). Par contre, le retrait du
  filtre de catégorie parente n'a pas suffi à faire réapparaître les
  perks structurantes de "Vigile Liminaire" (persistait à l'identique) —
  **vraie cause structurelle trouvée** : un champ Manifest jamais
  vérifié, `randomizedPlugSetHash` (pool de perks à ROLLS ALÉATOIRES -
  barillet/munitions/perks d'arme typiquement), distinct de
  `reusablePlugSetHash` déjà utilisé. Ces colonnes ne résolvaient tout
  simplement AUCUNE option (pas un souci de filtrage comme supposé).
  Ajouté en repli aux 5 endroits où les options d'un socket sont
  résolues. Le mot-clé "palier" (demande de simplification de
  l'utilisateur) est confirmé déjà présent et fonctionnel en test isolé.

- 🎉 **perks structurantes confirmées de retour par
  l'utilisateur** ("🥳") — le correctif `randomizedPlugSetHash`
  fonctionne. Restait les colonnes Souvenir/Palier toujours affichées
  malgré leurs mots-clés — corrigé : le critère exigeait que TOUTES les
  options d'une colonne correspondent (`every`), mais un pool de
  souvenirs/paliers contient des noms variés (une seule option ne
  correspondait jamais, empêchant le masquage). Assoupli à "au moins une
  option correspondante" (`some`) — testé, aucun faux positif sur les
  colonnes réelles confirmées par l'utilisateur.

- ajout prudent de **"memento"** au filtrage — suite à
  une remarque de l'utilisateur ("souvenir" se dit aussi "Memento"), qui
  a lui-même signalé le risque : "Memento Mori" est une perk RÉELLE de
  combat (As de Pique). Ciblé "memento:" AVEC DEUX-POINTS (convention de
  nommage anglaise des souvenirs cosmétiques), qui ne correspond pas à
  "Memento Mori" (pas de deux-points après). Testé : "Memento Mori"
  protégée, vrais souvenirs anglais ("Memento: Deep Stone Crypt")
  détectés correctement.

- passe de correctifs + optimisation demandée par
  l'utilisateur —
  (1) **colonne "Ornement d'origine" (Chardon) toujours affichée,
  corrigé** — cette option précise a probablement une description vide/
  différente ne contenant pas "ornement d'arme" (contrairement aux
  autres options de la même colonne, déjà filtrées) ; ajout d'une
  vérification sur le NOM de l'option en plus de la description ;
  (2) **"Pulsation triomphale" (Vigile Liminaire), corrigé** — l'utilisateur
  a fourni la description exacte ("Appliquez ce mod d'arme pour ajouter
  un effet visuel festif... Ce mod ne peut être appliqué qu'aux armes de
  palier 5.") : son nom ne contient aucun mot-clé, seule sa description
  le révèle. Le filtre ne vérifiait que le nom - corrigé pour vérifier
  aussi la description, avec "effet visuel festif" ajouté comme signal
  supplémentaire (repris de l'infobulle légendaire, jamais porté ici) ;
  (3) **⚡ optimisation : mise en cache de `obtenirDefinition`** — cette
  fonction de base (utilisée par quasiment tout le reste du code) ne
  mettait jamais en cache ses résultats jusqu'ici, chaque appel relançant
  une requête SQL complète même pour un hash déjà lu l'instant d'avant.
  Cache léger par Manifest chargé (WeakMap, clé table+hash), devrait
  accélérer sensiblement l'affichage des infobulles/popups qui
  enchaînent des dizaines d'appels.

- **Chasseur ajouté directement, sans tâtonnement** — le
  diagnostic fourni par l'utilisateur a confirmé le même bug que
  l'Arcaniste (tous les champs Manifest absents/0). Solution appliquée
  immédiatement : 6 hash ajoutés à la table codée en dur, mapping basé
  sur les noms officiels bien connus des sous-classes Destiny 2
  (Pistolero=Gunslinger=Solaire, Grâce survoltée=Arcstrider=Arc, Ronde de
  nuit=Nightstalker=Abyssal, Revenant=Stase, Tisseur=Threadrunner=
  Filobscur). Testé avec les 6 vrais hash fournis. Titan restant à faire.

- **Titan ajouté, les 3 classes sont maintenant
  couvertes** — même méthode que le Chasseur : Sentinelle=Sentinel=
  Abyssal, Assaillant=Striker=Arc, Brise-soleil=Sunbreaker=Solaire,
  Béhémoth=Behemoth=Stase, Berserker=Filobscur. Testé avec les 6 vrais
  hash fournis. **Saut visuel confirmé gênant par l'utilisateur, PUIS
  toujours présent malgré un premier correctif** (restauration de
  position de défilement) — vraie cause plus importante trouvée : les
  sections de personnage (Chasseur/Titan/Arcaniste) s'ouvraient/
  fermaient AUTOMATIQUEMENT selon la classe sélectionnée dans
  "Personnage", un bien plus gros changement de mise en page que la
  seule grille Doctrine. Retiré cette ouverture automatique - toutes les
  sections (personnages ET Coffre) sont désormais repliées par défaut,
  à ouvrir manuellement au clic. Corrige le saut à la source ET répond
  à une demande explicite de l'utilisateur de réduire les inventaires
  par défaut.

- ajout d'un **indicateur de chargement** (petit disque
  qui tourne, animation CSS) demandé par l'utilisateur pour distinguer un
  traitement en cours d'un écran figé — appliqué aux 3 boutons de
  chargement de l'appli (Manifest, inventaire, sous-classes). Note pour
  plus tard : à appliquer aussi au calcul du scoring une fois ce chantier
  développé (l'utilisateur anticipe que ce sera long).

- **nouvelle fonctionnalité — source d'obtention des
  armes/armures** — affichée à droite du nom (tiret quadratin) dans 3
  emplacements : résultats de recherche, infobulle, popup Détails. Basé
  sur le mécanisme officiel Bungie (`collectibleHash` ->
  `DestinyCollectibleDefinition.sourceString`, même principe que DIM/
  light.gg). Les formulations génériques Bungie ("Récompense de la
  quête d'exotique...") sont retirées pour ne garder que l'essentiel,
  demande explicite de l'utilisateur - avec un ordre de préfixes du plus
  spécifique au plus général pour éviter les résidus ("La Fosse..." au
  lieu de "Fosse..."). "Source inconnue" affiché en attendant mieux pour
  les objets sans entrée collectible.

- **vraies icônes de classe** (Titan/Chasseur/Arcaniste)
  à la place des lettres/badges — l'utilisateur a fourni une image des 3
  icônes officielles (hexagone rouge=Titan, triple-flèche bleue=
  Chasseur, triple-triangle jaune=Arcaniste). Résolues via
  `DestinyClassDefinition` (table de seulement 3 entrées), même mapping
  numérique déjà fiable dans le projet (`CLASS_TYPE_VERS_CLASSE`, utilisé
  depuis le début pour le filtrage par classe). Appliqué aux boutons
  "Personnage", aux menus repliables de l'inventaire (sections
  personnage + Armure par classe du Coffre) ; déjà présent en recherche
  avec repli sur la lettre colorée si l'icône est introuvable.

- lot de correctifs suite aux premiers tests des icônes
  de classe et de la source d'obtention —
  (1) indicateur de chargement ajouté au bouton "Tester la connexion" ;
  (2) recherche : texte de catégorie masqué (garde uniquement
  "correspondance : ..."), demande explicite de l'utilisateur ;
  (3) symbole de classe réordonné AVANT le tiret de la source en
  recherche ;
  (4) 🔴 **triangle de repli disparu sur les menus repliables, corrigé**
  — le `display: flex` posé directement sur les `<summary>` (pour aligner
  l'icône de classe) supprimait leur triangle natif ; corrigé en
  déplaçant le flex sur un `<span>` interne à la place ;
  (5) 🔴 **icônes de classe invisibles PARTOUT, diagnostic ajouté** —
  signalé comme invisible dans tous les emplacements (recherche montre la
  lettre de repli, reste ne montre rien) ; piste probable :
  `DestinyClassDefinition.displayProperties.icon` pourrait être vide
  dans le Manifest (limitation connue chez certains outils Destiny, qui
  codent ces icônes en dur pour cette raison) ; diagnostic ajouté dans le
  bloc "Personnage" (JSON brut d'une entrée `DestinyClassDefinition`,
  visible automatiquement si aucune icône trouvée) pour confirmer la
  cause exacte avant d'ajuster.

- ✅ **cause des icônes de classe confirmée, résolue
  autrement** — le diagnostic a montré `"hasIcon": false` littéralement
  dans le JSON de `DestinyClassDefinition`, pour les 3 classes (confirmé
  aussi pour Chasseur/Titan par l'utilisateur) : le Manifest ne fournit
  tout simplement AUCUNE icône ici, ce n'était pas un bug de résolution
  de champ. Solution : icônes RECRÉÉES en SVG (nouveau composant
  `IconeClasse`, dans `src/components/icones/`), avec les mêmes couleurs
  que l'image de référence fournie par l'utilisateur (hexagone rouge =
  Titan, triple-flèche bleue = Chasseur, triple-triangle jaune =
  Arcaniste) — formes simples inspirées des glyphes du jeu, sans
  reproduire une image Bungie précise. Remplace toutes les tentatives
  basées sur le Manifest (`obtenirIconesClasse`, devenu inutile mais
  laissé en place sans risque) aux 4 emplacements : recherche, bloc
  "Personnage", inventaire, Coffre.

- **aucune classe sélectionnée par défaut** — demande
  explicite de l'utilisateur, une fois la cause des icônes identifiée.
  `SubclassConfig["classe"]` accepte maintenant `null`, avec mise à jour
  en cascade partout où c'était nécessaire (`build.ts`, `GrilleDoctrine`,
  `SelecteurInventaire`, `listerSousClassesPossedees`, export DIM).
  Message d'avertissement ajouté dans "Personnage" (même format que les
  autres messages de ce type) invitant à choisir une classe avant de
  construire un build ; "Doctrine (Pilier 1)" affiche son propre message
  similaire tant qu'aucune classe n'est choisie, plutôt que de tenter un
  chargement invalide. Plusieurs vraies erreurs de compilation TypeScript
  ont été trouvées et corrigées pendant cette passe (des `Record<...>`
  qui n'acceptaient pas `null` comme type de clé) — vérifié avant
  livraison (33 fichiers, 0 erreur).

- **vrais fichiers d'icônes de classe intégrés** —
  l'utilisateur a fourni 3 fichiers SVG (source svgrepo.com, noms anglais
  Hunter/Titan/Warlock confirmés correspondre à Chasseur/Titan/
  Arcaniste). Remplacent les formes SVG dessinées à la main. Intégrés
  sur un disque coloré selon la classe (Chasseur=bleu ciel #3fa9e0,
  Titan=rouge #d5453a, Arcaniste=jaune #e0c93f, symbole blanc par-dessus)
  pour la visibilité, les fichiers d'origine étant sombres/noirs. Taille
  du symbole fixée à ~68% du diamètre du disque (marge de sécurité pour
  ne jamais déborder), validée par aperçu avant intégration.

- nouvelle vague d'icônes fournies par l'utilisateur —
  (1) icône du Coffre (vault) intégrée à gauche du texte "Coffre", avec
  la même précaution que pour les classes (triangle natif préservé,
  flex sur un élément interne plutôt que directement sur le `<summary>`) ;
  (2) icône du Fantôme (ghost) intégrée à droite du titre de
  l'application ;
  (3) "Armure" renommé "Armures" ;
  (4) nouveau filtre "type d'armure" ajouté au Coffre, même principe que
  le filtre "type d'arme" déjà existant ;
  (5) pour les icônes de type d'équipement (revolver, fusil à pompe...)
  dans les filtres : deux points identifiés avant d'implémenter - un
  `<select>` HTML natif ne peut afficher que du texte (jamais une image),
  il faudrait un menu déroulant personnalisé pour ça ; et la disponibilité
  réelle de ces icônes dans le Manifest n'est pas confirmée (vu
  l'expérience avec les icônes de classe, absentes). Un diagnostic a été
  ajouté sous les filtres du Coffre pour vérifier avec de vraies données
  avant de construire quoi que ce soit. Les infobulles et la popup
  Détails ne sont pas concernées par la contrainte du `<select>`.

- décision utilisateur de **geler** le sujet des icônes
  de type d'équipement dans les filtres jusqu'à ce que le scoring
  fonctionne (purement cosmétique, peaufinage final) — ne plus en
  reparler avant. Confirmé : le filtre "type d'armure" est bien
  positionné à droite du filtre "type d'arme", avec le champ de
  recherche textuel légèrement réduit pour équilibrer visuellement les 3
  filtres désormais sur la même ligne. **Centrage des symboles de classe
  vérifié rigoureusement** (calcul précis via parseur de path SVG, pas à
  l'œil) : les 3 symboles, Titan compris, sont mathématiquement
  parfaitement centrés dans leurs fichiers d'origine (décalage quasi
  nul) — la perception d'un décentrage visuel du Titan est probablement
  due au poids visuel asymétrique de sa forme (losange/hexagone), pas à
  un bug d'intégration.

- diagnostic des icônes de type d'équipement confirmé
  **"hasIcon: false"** sur les 3 exemples testés (Quêtes, Épées, Aura) —
  même verdict que pour les classes, le Manifest ne les fournit pas.
  Sujet gelé jusqu'au scoring fonctionnel (décision de l'utilisateur,
  purement cosmétique) — l'utilisateur enverra ses propres SVG le moment
  venu. Trois autres correctifs dans la même session :
  (1) **filtre catégories d'armure corrigé** — remplacé le texte brut du
  Manifest (qui incluait parfois le nom de classe, ex: "Brassard
  d'Arcaniste") par un tri FIXE basé sur l'emplacement réel (Casques,
  Gants, Torses, Jambes, Objets de classe), les menus repliables par
  personnage jouant déjà le rôle de filtrage par classe ; les deux
  filtres de catégorie harmonisés à la même largeur ;
  (2) **ordre des statistiques d'armure forcé** (ligne 1 : Santé/Mêlée/
  Grenade, ligne 2 : Super/Classe/Arme), indépendamment de l'ordre brut
  des données - appliqué à l'infobulle et au résumé compact de
  l'inventaire/Coffre (désormais sur 2 lignes distinctes pour un
  meilleur alignement entre objets dans la grille) ;
  (3) **icônes de type d'armure intégrées** — l'utilisateur a confirmé
  vouloir avancer immédiatement sur ce sujet (pas concerné par la
  contrainte du `<select>`, qui ne visait que le menu déroulant des
  filtres) : 4 fichiers fournis (Casque, Torse, Jambes, Gants ; objet de
  classe en attente), intégrés à droite du nom à 3 des 4 emplacements
  demandés (Recherche, Inventaire+Coffre, Mon Build). L'infobulle
  native du navigateur ne peut afficher que du texte, pas une image -
  même contrainte que le `<select>` - options notées au TODO si
  l'utilisateur veut aller plus loin (infobulle "maison" en React).

- **premier lot d'icônes de type d'arme intégré** (6
  types : Arme de poing, Épée, Pistolet-mitrailleur, Fusil à pompe,
  Fusil de précision, Fusil éclaireur — SMG corrigé en "Pistolet-
  mitrailleur" suite à une précision de l'utilisateur). Identification
  par mots-clés dans le texte réel de Bungie plutôt qu'une
  correspondance exacte, pour rester robuste. Intégré aux 3 emplacements
  possibles (Recherche, Inventaire+Coffre, Mon Build) — `typeArme`
  n'existait pas du tout sur les résultats de recherche jusqu'ici,
  ajouté au passage. Un second lot (Mitrailleuse, Revolver, Lance-
  grenades, Fusil à impulsions) identifié et en attente de confirmation
  de l'utilisateur avant intégration.

- **second lot d'icônes de type d'arme intégré** (3
  nouveaux types : Mitrailleuse, Revolver, Fusil à impulsions).
  **Cas particulier résolu** : "Lance-grenades" a le MÊME texte pour 2
  armes distinctes (munitions spéciales vs lourdes) - confirmé par
  l'utilisateur (via un aperçu dédié) que la distinction se fait par
  l'emplacement réel (energie=spécial, lourde=classique), pas par le
  texte (identique dans les deux cas). Composant `IconeTypeArme` mis à
  jour pour accepter le `slot` en plus du `typeArme`, avec ce cas
  spécial traité avant la recherche par mot-clé générale. Un 3e lot
  (Fusil automatique, Arc, Fusil à fusion, Fusil à trace) identifié, en
  attente de confirmation avant intégration.

- **troisième et dernier lot en cours intégré — 13
  types d'arme au total maintenant** (Fusil automatique, Arc, Fusil à
  fusion, Fusil à rayons). L'utilisateur a corrigé l'appellation en jeu
  : "Fusil à rayons", pas "Fusil à trace" comme initialement supposé -
  mot-clé ajusté en conséquence. Testé sans collision entre les 13
  mots-clés (notamment "arc" isolé, sans faux positif avec d'autres
  types). Types encore manquants (pas de blocage) : Lance-roquettes,
  Glaive, objet de classe (armure).

## 03/08/2026

- retours de test réel — recherche confirmée fonctionnelle
  (filtre quêtes/ornements), Pilier 5 confirmé sans "2.0". Les deux bugs
  restants (stats absentes, Doctrine limitée à la Prismatique) persistent
  malgré les diagnostics déjà en place (noms de stats non résolus,
  objets bruts du bucket Subclass) — **en attente des messages de
  diagnostic réels de l'utilisateur pour identifier la vraie cause**
  (hypothèse pour la Doctrine : l'API pourrait ne renvoyer qu'UNE seule
  sous-classe par personnage plutôt qu'une par élément, à confirmer).
  Ajout de l'alignement des lignes de slots entre les 3 colonnes de
  personnages dans "Mon inventaire" (emplacements vides affichés avec
  "—" plutôt que masqués), pour un rendu plus régulier visuellement.

- 🔴 **les deux bugs bloquants corrigés grâce aux
  diagnostics réels fournis par l'utilisateur** —
  (1) **Stats d'armure** : le diagnostic a montré que le composant 302
  (ItemStats) est VIDE pour toute l'armure (380 pièces, 0 exploitable).
  Confirmé par un ticket GitHub de DIM (issue #11160) : depuis Armor 3.0,
  les stats viennent d'un PLUG D'ARCHÉTYPE socketé (ex: "Bulwark") + mods/
  masterwork, pas d'un composant de stats dédié. Le calcul additionne
  maintenant les `investmentStats` de chaque plug actif de l'armure
  (déjà récupérés via les sockets pour les perks) ;
  (2) **Doctrine** : le diagnostic a montré 6 objets bruts trouvés mais
  1 seul identifié — la détection numérique ET textuelle (v1/v2)
  échouaient toutes les deux. Remplacé par une vraie lecture du Manifest :
  la table `DestinyDamageTypeDefinition` donne le nom OFFICIEL de chaque
  type de dégâts pour la valeur numérique rencontrée, plus besoin de
  deviner de correspondance ;
  (3) ajout de la catégorie "Saut" (manquante), les catégories non
  reconnues sont désormais affichées avec leur vrai nom au lieu d'être
  masquées (plus rien ne disparaît silencieusement) ;
  (4) ajout d'un marqueur 🎮 distinct pour ce qui est réellement équipé
  en jeu en ce moment (via les sockets de la sous-classe équipée),
  séparé du marqueur ✅ de sélection dans l'outil ;
  (5) Coffre réorganisé en 2 sous-parties repliables (Armes puis Armures,
  sous-groupes dans l'ordre demandé : Cinétique/Énergie/Lourde puis
  Casque/Gants/Torse/Jambes/Marque), disposition simplifiée (fini la
  grille en `auto-fit` qui cassait l'alignement) ;
  (6) "Mon Inventaire" avec majuscule.

- 🥰 **Pilier 5 (Statistiques) validé par l'utilisateur**
  — le correctif socket/investmentStats fonctionne en conditions réelles.
  Exactitude fine à reconfirmer plus tard face au jeu, mais le mécanisme
  est bon.

- nouveau lot de retours —
  (1) 🔴 **compétences mélangées dans la Doctrine, corrigé** : Bungie
  regroupe souvent Saut+Mêlée+Grenade+Compétence de classe sous UNE SEULE
  catégorie générique côté Manifest ("Compétences") ; le code fusionnait
  tous ces sockets en une liste unique. Chaque socket est désormais
  identifié individuellement (via le texte de son propre premier objet
  résolu quand la catégorie parente est générique) avant regroupement.
  Ajout du stockage manquant (`classeHash`, `sautHash` sur
  `SubclassConfig`) — expliquait aussi pourquoi cliquer ne cochait rien ;
  (2) 🔴 **"Charger mon inventaire" invisible par moments, corrigé** — le
  compte Destiny ne se rechargeait qu'après un clic manuel sur "Tester la
  connexion" ; chargement automatique ajouté dès que des tokens valides
  existent au démarrage ;
  (3) message de diagnostic des stats non reconnues adouci (n'affiche
  plus d'alerte pour des stats hors système comme Puissance/Défense/coûts
  d'énergie de mods, qui sont normales) ;
  (4) badge d'élément (couleur générique + initiale) sur les armes,
  résolu via `DestinyDamageTypeDefinition` (même méthode fiable que pour
  l'élément des sous-classes) ;
  (5) Coffre : sous-partie "Armes" passée en 4 colonnes (test demandé),
  nouvelle subdivision repliable "Armures par classe" ;
  (6) popup perks + source de loot au clic sur une arme en recherche —
  demandée, notée en TODO, pas encore implémentée (morceau conséquent).

- 🔴 **bug noté (résolution ultérieure)** — le bouton
  "Équiper" échoue systématiquement en erreur 500 (Bungie), aussi bien
  individuellement qu'en lot ("Équiper le build en jeu"). Un 500 suggère
  une erreur côté serveur Bungie plutôt qu'un refus logique classique.
  Le message d'erreur affiche maintenant le corps complet de la réponse
  pour faciliter le diagnostic quand ce chantier sera repris, mais pas
  d'investigation plus poussée pour l'instant (demande explicite de
  l'utilisateur) — **l'action "Équiper" reste non fonctionnelle en
  l'état.**

- 🔴 **règle "une seule exotique à la fois" corrigée** —
  l'utilisateur a signalé que le Pilier 4 ne vérifiait la règle du jeu
  (une seule arme exotique ET une seule armure exotique équipable à la
  fois) QUE pour l'armure, jamais pour les armes. Corrigé (même logique,
  testée). Ajout d'un avertissement anticipé dans "Mon Build" (avant
  équipement, individuel ET en lot) si le build contient plus d'une arme
  ou plus d'une armure exotique, rappelant la règle du jeu.

- retours utilisateur après vérification du Coffre (rien
  d'anormal, confirmé) — nouveau lot de correctifs Doctrine :
  (1) 🔴 Coffre : "Armes" et "Armures par classe" repliées par défaut,
  ancienne subdivision "Armures" (à plat, redondante) retirée, sans
  impacter "Armures par classe" (indépendante) ;
  (2) 🔴 **Doctrine "Saut" masquée par "COMPÉTENCES", corrigé** — la
  détection ne regardait que le type générique de l'objet (souvent
  juste "Compétence" pour les 4 aptitudes), masquant le mot "Saut" présent
  dans le NOM précis de l'objet. Corrigé en combinant nom + type ; ajout
  d'un repli supplémentaire sur l'ordre conventionnel Bungie (Saut/Mêlée/
  Grenade/Compétence de classe) si le texte ne suffit toujours pas à
  identifier un socket ;
  (3) réorganisation de l'affichage selon l'ordre demandé (Super+Aspects,
  Saut+Compétence de classe, Mêlée+Grenade, Fragments), appliquée à la
  fois dans "Doctrine (Pilier 1)" et la section Doctrine de "Mon Build"
  via une constante partagée (`ORDRE_AFFICHAGE_CATEGORIES`) pour garantir
  la cohérence entre les deux ;
  (4) confirmé : l'infobulle au survol affichant l'effet d'une compétence
  existait déjà (attribut `title`) ;
  (5) grosse idée notée pour plus tard : pondérer le Pilier 5 selon la
  cohérence du build (ex: stat Grenade + perks de grenade cohérents).

- nouveau lot suite aux tests —
  (1) Coffre : "Armures par classe" renommée simplement "Armure", passée
  en 4 colonnes pour l'alignement visuel avec "Armes" ;
  (2) 🔴 **Saut classé sous Mêlée, corrigé (v2)** — la détection par texte
  s'est révélée peu fiable (mot-clé "attaque" trop large pour Mêlée,
  retiré). L'ordre positionnel conventionnel de Bungie (Saut/Mêlée/
  Grenade/Compétence de classe) est maintenant PRIORITAIRE quand la
  catégorie a exactement 4 sockets, le texte ne sert plus qu'en repli ;
  (3) infobulles manquantes sur Aspects/Fragments corrigées — leur
  description directe est souvent vide dans le Manifest, repli ajouté sur
  le perk lié pour récupérer le vrai texte d'effet ;
  (4) descriptions des perks exotiques ajoutées aux infobulles des armes/
  armures exotiques (pas juste leur nom), pour une visualisation plus
  rapide de l'effet ;
  (5) aperçu envoyé pour le choix 2 vs 3 colonnes des Fragments dans
  "Mon Build" — en attente du choix de l'utilisateur avant implémentation ;
  (6) nouvelle demande notée : afficher dans la recherche à quel
  équipement une perk trouvée appartient — nécessite un index inversé sur
  tout le Manifest, pas encore implémenté (morceau conséquent).

- Fragments affichés en 3 colonnes dans "Mon Build" (choix
  confirmé par l'utilisateur suite à l'aperçu envoyé).

- confirmations de test (4 colonnes Armure, Saut/Mêlée,
  Fragments, infobulles Aspects/Fragments) — nouveau lot de correctifs :
  (1) "Mon Build" réorganisé encore différemment de "Doctrine (Pilier 1)" :
  Super+Aspect+Saut sur une ligne, Compétence de classe+Mêlée+Grenade sur
  une autre (arrangement propre à cette section) ;
  (2) 🔴 **filtrage des perks aux seules exotiques/pièce maîtresse** —
  les infobulles et "Mon Build" affichaient TOUS les perks des objets
  exotiques (mods, cosmétiques compris). Nouvelle fonction
  `obtenirCategorieSocketsParIndex` (même technique que pour la Doctrine :
  identification par le nom de la catégorie de socket dans le Manifest)
  qui filtre aux sockets "intrinsèque" (le perk exotique) et "pièce
  maîtresse" (préfixée "PM"). ⚠️ Devinette non vérifiée en conditions
  réelles — à ajuster si le filtrage se révèle incorrect une fois testé.

- retours utilisateur précis après test réel — trois
  corrections :
  (1) 🔴 **rotation d'un cran dans l'ordre Saut/Mêlée/Grenade/Classe,
  corrigée** — confirmé en croisant précisément les observations
  (Saut affichait Classe, Mêlée affichait Saut, Grenade affichait Mêlée,
  Classe affichait Grenade) ; ordre corrigé en Classe/Saut/Mêlée/Grenade,
  qui corrige à la fois "Doctrine (Pilier 1)" et "Mon Build" (même moteur
  partagé) ;
  (2) 🔴 **filtrage des perks exotiques, nouvelle approche** — la
  classification par nom de catégorie ne trouvait ni "La Danse" (armure)
  ni le perk d'arme exotique/la pièce maîtresse du "Chardon" (seul le
  perk intrinsèque ressortait). Remplacée par un critère structurel : un
  socket à une seule option possible (figé) ET avec une description non
  vide, plutôt que deviner le nom de la catégorie ;
  (3) alignement des colonnes dans "Mon Build" corrigé (grille CSS à
  colonnes égales au lieu d'un flex) ;
  (4) rappel noté pour plus tard : généraliser les infobulles partout
  (recherche, Mon Build, inventaire) une fois leur contenu validé ;
  (5) en attente : l'utilisateur a été invité à partager le détail du
  diagnostic "6 objets bruts (1 identifié)" pour la Doctrine, plutôt que
  deviner une nouvelle fois sans données réelles.

- 🔴 **cause racine du bug "5 sous-classes non
  identifiées" trouvée grâce au diagnostic réel partagé par l'utilisateur**
  — `defaultDamageType` vaut TOUJOURS 0 sur les 6 sous-classes (confirmé,
  y compris Prismatique), et les noms modernes ("Lame de l'aube",
  "Sombreur"...) ne contiennent pas le mot de l'élément. Nouvelle piste
  fiable : le SUPER de la sous-classe est une vraie attaque, son
  `defaultDamageType` est donc correct — récupéré via la catégorie de
  socket "super" (déjà confirmée fiable par l'utilisateur) plutôt que sur
  l'objet sous-classe lui-même. Testé avec les 6 vraies sous-classes du
  diagnostic (Lame de l'aube, Voie abyssale, Rite de l'orage, Sombreur,
  Tresse-couvée, Arcaniste prismatique) — toutes identifiées correctement.

- session de correctifs basés sur des captures d'écran et
  diagnostics réels fournis par l'utilisateur —
  (1) 🔴 **filtrage des perks exotiques (armes), corrigé (v3)** — capture
  d'écran réelle sur "Le Chardon" : le critère "socket à option unique" ne
  fonctionne pas sur les armes aux perks fixes (non aléatoires), où TOUS
  les sockets (canon, munitions, poignée...) n'ont qu'une seule option,
  pas seulement l'exotique. Nouveau critère basé sur le contenu réel
  observé : les perks génériques ont une description courte suivie de
  puces "•" listant des bonus de stats ; les vrais effets exotiques sont
  du texte narratif sans puces. Testé avec les 6 vrais perks de la
  capture (Marque des flammes, Rainurage hélicoïdal, Munitions de
  précision, Dévoreur d'âme, Poignée texturée, Catalyseur de Chardon) —
  tous correctement classés, "Catalyseur" reconnu comme pièce maîtresse ;
  (2) incohérence trouvée en répondant à une question de l'utilisateur :
  "Mon Build" n'affichait que le nom des perks exotiques/PM (pas la
  description, pas le label "PM"), contrairement à "Mon Inventaire" où
  c'était déjà présent — corrigé pour la cohérence entre les deux ;
  (3) alignement des colonnes de Fragments dans "Mon Build" corrigé (même
  grille et même espacement que les rangées du dessus).

- retest par l'utilisateur — diagnostic Doctrine
  strictement identique, ce qui a révélé que l'AFFICHAGE du diagnostic
  était resté figé sur l'ancien format (ne montrait que l'ancien
  `defaultDamageType`), alors que le moteur essayait déjà en coulisses de
  nouvelles pistes (`plugCategoryIdentifier`, `damageTypeHashes`,
  `defaultDamageType` du Super) — impossible de savoir si elles
  fonctionnaient sans les voir. Affichage corrigé pour montrer TOUTES ces
  valeurs (sous-classe ET Super). **Toujours en attente de confirmation**
  — le bug lui-même n'est pas encore confirmé résolu, il faut retester et
  repartager le détail complet du nouveau diagnostic. Note utilisateur à
  garder en tête : les Super comptent comme des "compétences" dans les
  défis en jeu, ce qui suggère un vrai type de dégâts existe quelque part
  dans le Manifest pour eux. Le marqueur 🎮 manquant est probablement lié
  au même bug racine (sous-classe équipée non identifiée = absente de la
  liste). Nouvelle demande notée : bouton "Transférer vers..." dans
  l'inventaire/coffre, à évaluer avec le bug d'équipement 500.

- 🔴 **cause racine définitive trouvée, changement
  d'approche** — le diagnostic complet (sous-classe ET Super) a montré
  qu'AUCUN champ Manifest testé (defaultDamageType, damageTypeHashes,
  plugCategoryIdentifier) n'est jamais renseigné pour aucune sous-classe,
  et `itemCategoryHashes` est identique pour les 6 (juste "sous-classe",
  pas l'élément). Rien d'exploitable côté données. Remplacé par une table
  codée en dur à partir des 6 vrais hash confirmés par l'utilisateur (les
  hash Bungie sont stables dans le temps). Testé : les 6 sous-classes
  Arcaniste du diagnostic sont maintenant toutes identifiées. ⚠️ Ne couvre
  que l'Arcaniste pour l'instant - Titan/Chasseur nécessiteront leurs
  propres hash si le même bug s'y manifeste.

- 🎉 **confirmé résolu par l'utilisateur** — "Ça
  fonctionne !" pour Doctrine (Pilier 1), les 6 sous-classes Arcaniste
  s'identifient correctement.

- ajout des **bonus de stats des fragments** — certains
  fragments (ex: "Écho d'Expulsion" -> +10 Super) donnent un bonus de stat
  en plus de leur effet, jusqu'ici jamais compté nulle part. Nouvelles
  fonctions dans `doctrine.ts` (`obtenirBonusStatsDoctrine`,
  réutilisant le même principe de résolution de stat que l'armure) :
  ajouté au calcul du Pilier 5 (score ET graphique), et affiché dans la
  description/infobulle de chaque fragment/aspect concerné (ex: "+10
  Super"). Testé logiquement (résolution + addition aux stats
  d'armure) — à reconfirmer en conditions réelles.

- lot de correctifs suite au retour "Ça fonctionne !" —
  (1) marqueur 🎮 confirmé lié au bug résolu ;
  (2) **Super manquant pour la Stase, corrigé** — ajout d'un repli sur
  `singleInitialItemHash` (option fixe par défaut d'un socket) partout où
  c'était pertinent, pour les sockets sans choix possible ;
  (3) **diagnostic Doctrine qui restait affiché même une fois résolu,
  corrigé** — ce n'était pas du cache : le message s'affichait
  systématiquement dès qu'il y avait des objets bruts, plus seulement
  quand il reste un vrai problème ;
  (4) **index inversé perk -> équipement, nouvelle fonctionnalité** —
  nouveau module `perkSource.ts` : pour toute perk/aspect/fragment trouvé
  en recherche, affiche "Trouvé sur : X, Y..." s'il appartient à une ou
  plusieurs armes/armures, en réutilisant l'index de recherche déjà
  construit (pas de second scan du Manifest). Testé logiquement (perk
  partagée entre deux armes détectée sur les deux).

- **nouvelle fonctionnalité — vue "Détails" d'une arme**
  — bouton à côté de "+ Ajouter" (inventaire/coffre) qui déplie toutes
  les options possibles par colonne de socket (canon, munitions,
  perks...), avec une coche sur ce qui est réellement roulé sur
  l'exemplaire précis. Nouvelle fonction générique
  `obtenirOptionsToutesColonnes` dans `doctrine.ts`, réutilisant le même
  mécanisme de lecture de sockets que la Doctrine et le filtrage
  exotique (y compris le repli `singleInitialItemHash` pour les sockets
  sans choix). Colonnes numérotées génériquement plutôt que nommées
  sémantiquement, pour éviter les soucis déjà rencontrés avec les noms de
  catégorie. Première version, testée logiquement — limité aux armes
  pour l'instant (demande explicite de l'utilisateur).

- passage de la vue "Détails" en **popup** (fond
  assombri, centrée, fermeture par ✕ ou clic en dehors) plutôt qu'un
  panneau dépliable dans le flux — choix de l'utilisateur après un aperçu
  comparatif des deux options.

- 🔴 **lenteur de l'indexation à chaque session,
  corrigé** — l'utilisateur a remarqué que l'indexation prenait beaucoup
  de temps ; la persistance dans IndexedDB avait déjà été écrite mais
  n'était jamais réellement activée : `RechercheManifest.tsx` appelait
  encore les fonctions avec leur ancienne signature (sans version, sans
  `await` sur des fonctions devenues asynchrones). Corrigé, plus un vrai
  bug dans `perkSource.ts` où le hash brut n'était jamais converti en
  vrai hash Destiny (`idSqliteVersHash` manquant). Clarifié pour
  l'utilisateur : pas besoin d'un bouton séparé "vérifier la version", le
  bouton "Charger le Manifest" fait déjà ça nativement.

- lot de retours après test du popup Détails et de
  l'index inversé —
  (1) effet du Catalyseur masqué par le texte de déblocage : corrigé, le
  perk lié est tenté EN PREMIER (avant, ne servait que si la description
  directe était vide, ce qui n'est pas le cas d'un Catalyseur) ;
  (2) doublons en recherche (Luciole, Boucherie) : corrigé, préfère
  garder l'entrée qui a une correspondance dans l'index inversé plutôt
  que la première rencontrée ;
  (3) ordre d'affichage des sous-classes fixé : Solaire, Arc, Abyssal,
  Stase, Filobscur, Prismatique ;
  (4) marqueur 🎮 peu visible : fond vert lumineux circulaire ajouté ;
  (5) confirmé : le bug Doctrine (hash codés en dur) réapparaîtra très
  probablement sur Titan/Chasseur, solution déjà connue et rapide à
  appliquer le jour venu ;
  (6) en attente de plus de données utilisateur : quelles colonnes
  masquer dans la popup Détails (les numéros de colonne ne sont pas
  stables d'une arme à l'autre) et pourquoi l'ornement/harmonisation de
  "Faim qui Ronge" échappent au filtre quêtes/ornements.

- l'utilisateur a fourni des exemples réels (Vigile
  Liminaire, Chardon) pour les colonnes à masquer dans la popup Détails —
  motif trouvé : ce sont des sockets cosmétiques/de progression
  (Souvenir de verre, Compte-frags, Palier pièce maîtresse maniement,
  Amélioration de palier 2, Ornement d'origine). Filtrage ajouté via le
  nom de la catégorie parente (souvenir/ornement/suivi) ET le mot-clé
  "palier" dans le nom des options — même filtre appliqué à l'infobulle
  exotique (corrige aussi le "compte-frags" qui s'y affichait). Testé
  avec les vraies données fournies, tous les cas passent. "Crosse de
  contrepoids" volontairement laissé visible (ressemble à un vrai perk
  de poignée, pas clairement un mod générique).

- nouvelle capture d'écran + retours précis —
  (1) 🔴 débordement visuel du Coffre (capture fournie), corrigé
  (`minmax(0, 1fr)` + `minWidth: 0`, limite classique de CSS grid/flex) ;
  (2) confirmé par l'utilisateur : "Crosse de contrepoids" EST bien un
  mod à masquer (modifiable à loisir), avec 2 nouvelles réf. ("Réglage de
  radar", "Poignée de sprint") ; ajout d'un critère structurel (>6 options
  = mod générique probable), moins dépendant d'un nom de catégorie ;
  (3) effet du Catalyseur : essai sur TOUS les perks liés (garde le plus
  long) plutôt que seulement le premier ;
  (4) mots-clés de détection cosmétique renforcés (style/apparence en
  catégorie, souvenir/suivi aussi vérifiés sur le nom des options) ;
  (5) nouveau filtre "packs" commerciaux (offres achetables en jeu),
  masqué par défaut comme quêtes/ornements — testé sans faux positif sur
  de vrais perks ;
  (6) reste ouvert : doublon "Faim qui Ronge" (arme + ornement), pas de
  piste solide sans plus de données sur cet ornement précis.

- réponses aux retours sur le filtrage des colonnes +
  nouvelles fonctionnalités du Coffre —
  (1) retiré le seuil ">6 options" (trop agressif, coupait de vraies
  colonnes de perks structurantes signalées par l'utilisateur) ;
  (2) chaque type d'arme (cinétique/énergie/lourde) repliable
  individuellement dans le Coffre ;
  (3) rareté résolue directement via le hash existant (pas de numéro
  deviné, même précaution que pour les types de dégâts) ;
  (4) nouveaux filtres Coffre : rareté et type d'arme, construits
  dynamiquement à partir de ce qui est réellement présent (pas une liste
  figée) ;
  (5) nouvelle recherche limitée au Coffre (800 objets) : nom + perks +
  DESCRIPTIONS des perks, pour retrouver une arme par son effet
  ("Secousse") sans connaître le nom de la perk responsable. Calcul
  différé et mis en cache (`useMemo`) pour ne pas ralentir à chaque
  frappe. Testé logiquement avec le cas d'usage exact demandé.

- nouvelles captures d'écran précises (Vigile Liminaire,
  doublon Faim qui ronge) —
  (1) 🔴 **RÉGRESSION corrigée** : le mot-clé "mod" du filtrage des
  colonnes masquait NON SEULEMENT les mods visés mais aussi plusieurs
  vrais perks ET le Catalyseur en entier (capture d'écran à l'appui) -
  partagent visiblement une catégorie commune plus large que prévu.
  Retiré "mod"/"style"/"apparence" (jamais confirmés), retour à une
  détection PAR NOM D'OPTION uniquement, plus sûre mais qui ne filtre
  plus "Crosse de contrepoids" & co pour l'instant ;
  (2) doublon "Faim qui ronge" (ornement) corrigé — sa description
  contient littéralement "ornement d'arme de palier 5" (confirmé par
  capture d'écran), nouveau repli sur ce texte quand le type d'objet ne
  suffit pas ;
  (3) confirmé : le filtre "packs" fonctionne (l'utilisateur ne le voit
  plus dans ses résultats) ;
  (4) boutons "Détails"/"+ Ajouter" déplacés sous les perks/stats plutôt
  qu'à côté du nom, pour l'esthétique.

- solution sans risque pour "Crosse de contrepoids" & co
  — plutôt que masquer par catégorie (risque de régression déjà vécu),
  identification PAR NOM PRÉCIS des mods connus. La colonne n'est jamais
  masquée, juste renommée "Mods utilisables" et déplacée en bas de la
  popup Détails. Aucune perte de données possible. Testé logiquement.

## 02/08/2026

- bug trouvé en test réel (chargement du Manifest) —
  `CompileError: wasm validation error... failed to match magic number`. Le
  fichier `.wasm` de sql.js était servi via `vite-plugin-static-copy`, peu
  fiable en mode développement (le navigateur recevait autre chose que le
  vrai binaire). Corrigé en remplaçant ce plugin par l'import natif Vite
  `?url` (méthode officiellement recommandée), fiable aussi bien en
  développement qu'à la compilation.

- bug trouvé en test réel (première connexion Bungie) —
  React.StrictMode exécute deux fois les `useEffect` en développement, ce qui
  provoquait un double échange du même code d'autorisation OAuth (à usage
  unique côté Bungie). Le premier échange réussissait, le second échouait en
  400, et c'était cette erreur qui s'affichait malgré une connexion réussie.
  Corrigé avec un garde-fou (`useRef`) qui bloque toute tentative après la
  première.

- ajout de la sélection réelle d'objets — "+ Ajouter au
  build" dans les résultats de recherche ET dans un nouveau bloc "Mon
  inventaire" (personnages + coffre, stats réelles résolues dynamiquement
  via le Manifest plutôt que des hash de stats devinés/codés en dur, pour
  s'auto-corriger). Ajout d'un `slot` explicite sur chaque pièce (au lieu de
  déduire l'emplacement de sa position dans le tableau) et d'une fonction
  `poserPieceDansBuild` qui remplace proprement la pièce déjà présente au
  même emplacement. Ajout du sélecteur de classe (Titan/Chasseur/Arcaniste)
  sur le pilier 1 — stocké et fonctionnel, mais le calcul du score ne
  différencie pas encore par classe (nécessite de valider les aspects
  contre la classe via le Manifest, pas encore fait).

- "devour" sans résultat n'était pas un bug — le Manifest
  chargé est en français, donc seul "dévoration" (ou "devoration" sans
  accent) existe dans les données. Ajout d'un rappel visuel dans l'interface.
  Ajout des miniatures d'objets (recherche, inventaire, récapitulatif du
  build) via l'URL d'icône du Manifest. Ajout d'un vrai bouton "Équiper"
  (nouveau composant `ResumeBuild`), clairement séparé de "+ Ajouter au
  build" : ce dernier ne modifie que la copie locale dans le navigateur,
  "Équiper" est la SEULE action qui touche réellement le compte Destiny
  (avec confirmation avant exécution). Graphique du pilier 5 réécrit en
  barres horizontales, dans l'ordre du jeu (Santé, Mêlée, Grenade, Super,
  Classe, Arme), épaisseur réduite, point zéro aligné pour toutes les barres.

- passe de débogage + optimisation demandée par l'utilisateur —
  (1) `testerConnexion()` faisait DEUX appels réseau complets au profil
  Bungie (un pour le résumé, un pour la liste des personnages) ; fusionnés
  en un seul appel (`recupererResumeEtPersonnages`) ; (2) `listerObjetsPossedes`
  et la résolution des noms de stats accédaient à `displayProperties.name`
  sans protection — un seul objet du Manifest sans `displayProperties`
  aurait fait planter TOUT le chargement de l'inventaire ; sécurisé avec
  l'opérateur optionnel partout ; (3) bug d'état React dans `ResumeBuild` :
  le sélecteur "Équiper sur" ne se synchronisait qu'au tout premier rendu,
  restant vide si la liste des personnages arrivait après (cas normal) ;
  corrigé avec un `useEffect` ; (4) clé React instable (`Math.random()`)
  dans la liste d'inventaire, remplacée par une clé stable et déterministe.

- amélioration du diagnostic — l'erreur d'échange OAuth
  affiche maintenant le message précis renvoyé par Bungie (ex:
  "OriginHeaderDoesNotMatchKey") plutôt qu'un simple code HTTP 400 ; l'URL
  du code d'autorisation est nettoyée après tentative pour qu'un
  rafraîchissement de la page ne renvoie plus un code déjà utilisé.

- ajout du dossier `knowledge-base/` (base de connaissance
  Destiny 2 externe, en anglais, fournie par un tiers) — pur stockage pour
  l'instant, rien de branché au code.

- `assurerManifestAJour` accepte maintenant un paramètre de
  langue (`"fr"` par défaut, comportement inchangé), avec un cache séparé
  par langue dans IndexedDB — permet de télécharger aussi le Manifest
  anglais (utile pour faire correspondre par hash le texte anglais d'une
  source externe comme `knowledge-base/`, puis afficher le texte français
  de ce même hash). Le cache existant sera re-téléchargé une fois après
  cette mise à jour (changement de clé de cache), c'est normal.

- ajout de la **recherche bilingue** (`rechercherBilingue`
  dans `search.ts`) — le bouton "Charger le Manifest" charge maintenant FR
  ET EN (~200 Mo au lieu de ~100 la première fois), et la recherche accepte
  indifféremment le français ou l'anglais. Les résultats fusionnent par
  hash (identique dans les deux langues) ; l'affichage reste TOUJOURS en
  français, avec une mention "EN: ..." et "trouvé via l'anglais" quand la
  correspondance venait du texte anglais. Logique testée avec des bases
  simulées (vraie exécution sql.js impossible à valider ici, cf. tableau
  d'état).

- construction de la table des verbes d'élément et
  branchement réel du **Pilier 2** — nouveau catalogue `CATALOGUE_VERBES`
  (~20 verbes : Dévoration, Électrocution, Consumé, Ralentissement,
  Rupture...) dans `data/elementVerbs.ts`, construit à partir de
  `knowledge-base/02_SUBCLASSES_ALL.md` et `01_DAMAGE_STACKING.md`. Nouveau
  module `lib/scoring/verbes.ts` : détecte les verbes présents dans les
  textes réels du build (super, aspects, fragments, perks d'artefact,
  perks d'armes/armure) via le Manifest, avec une heuristique de confiance
  (mention isolée vs "boucle probable" source+payoff). `evaluerBuild`
  accepte maintenant un Manifest optionnel (`db`) ; sans lui, retombe sur
  l'ancien score fixe (50) pour ne rien casser. Logique de détection
  testée (mentions multiples, isolées, bilingue FR/EN, cas vide) ; la
  vraie exécution avec un Manifest chargé reste à confirmer chez vous.

- ajout de `test-fixtures/manifest-mock.json` et
  `scripts/fausse-db.mjs` + `scripts/tester-avec-fixtures.mjs` — un jeu de
  données factices (mais schéma Bungie réaliste, bilingue FR/EN) pour
  tester le code dépendant du Manifest SANS télécharger ~200 Mo à chaque
  fois. **N'affecte pas** le téléchargement réel de l'appli (toujours
  depuis Bungie, voir `lib/manifest/download.ts`) — usage test uniquement.
  Lancez `node scripts/tester-avec-fixtures.mjs` (après `npm install`) pour
  vérifier rapidement `obtenirDefinition`, la recherche bilingue, et la
  détection des verbes, sans attendre le vrai téléchargement.

- 🔴 **bug critique trouvé en test réel** — `"file is not
  a database"` sur la recherche ET l'inventaire. Cause : le fichier servi
  par Bungie à l'adresse du Manifest est une **archive ZIP** contenant la
  vraie base SQLite, pas la base directement — le code l'ouvrait tel quel
  avec sql.js sans jamais le décompresser. Corrigé avec `fflate`
  (décompression légère) dans `download.ts`. Ce bug expliquait aussi
  l'impossibilité de modifier le build (rien ne pouvait être ajouté
  puisque recherche/inventaire échouaient tous les deux) et l'absence du
  bouton "Équiper" (n'apparaît que sur un objet possédé avec un vrai
  `itemInstanceId, donc jamais sur les placeholders de démo).

- déplacement du **sélecteur de classe** du Pilier 1 vers
  un nouveau composant racine `SelecteurPersonnage` (au-dessus de tout le
  reste) — la classe ne fait pas partie du scoring, c'est un filtre de
  contexte pour le futur sélecteur d'aspects/fragments, pas un choix de
  build (à la demande de l'utilisateur, cohérent avec les "Notes de
  conception").

- correction du graphique du Pilier 5 — le SVG était
  affiché à 100% de largeur alors que son `viewBox` était bien plus étroit,
  ce qui l'étirait (texte y compris) bien au-delà de sa taille voulue.
  Plafonné à sa largeur naturelle (`maxWidth`).

- redesign du sélecteur "Personnage" — 3 rectangles de
  taille égale, côte à côte, espacés (ne se touchent pas), ordre
  Chasseur/Titan/Arcaniste, avec une coche visuelle (✓) sur la classe
  sélectionnée. Nouveaux styles CSS dédiés (`selecteur-classe`,
  `carte-classe`) dans `index.css`.

- 🔴 le correctif ZIP précédent n'était pas suffisant à
  lui seul — le cache navigateur (IndexedDB) déjà écrit AVANT le correctif
  contenait les mauvaises données (jamais décompressées), et continuait
  d'être réutilisé tel quel puisque la version du Manifest Bungie, elle,
  n'avait pas changé. Ajout d'un numéro de version de FORMAT de cache
  (`VERSION_FORMAT_CACHE`) dans `download.ts`, qui force un re-téléchargement
  propre automatique, sans manipulation navigateur requise.

- le sélecteur "Personnage" déplacé juste au-dessus du
  bloc de construction du build (recherche + inventaire + résumé), au lieu
  du tout haut de page.

- 🔴 **export DIM corrigé** — l'API DIM nécessite sa
  PROPRE clé (différente de celle de Bungie), jamais fournie jusqu'ici,
  d'où le "NetworkError". Nouveau module `lib/dim/apiKey.ts` : obtient
  automatiquement une clé DIM (endpoint self-service `/new_app`, pas
  d'approbation nécessaire) au premier export, la met en cache
  (localStorage) pour ne pas la redemander à chaque fois.

- lot de retours utilisateur —
  (1) sélecteur "Personnage" déplacé entre "Mon inventaire" et "Mon build" ;
  (2) l'armure affichée dans "Mon inventaire" est maintenant filtrée sur la
  classe sélectionnée (les armes restent toutes visibles, utilisables par
  toute classe) — nouveau champ `classeRequise` sur `GearPiece`, dérivé du
  `classType` Manifest ;
  (3) badge de classe (initiale colorée générique, pas d'icône Bungie) à
  côté des résultats de recherche liés à une classe (aspects...) ;
  (4) dédoublonnage des résultats de recherche (le Manifest a parfois deux
  hash distincts pour un texte identique) ;
  (5) filtre par catégorie dans la recherche (Armes/Armure/Aspects/
  Fragments/Autre/Toutes) ;
  (6) "Mon build" : armes triées Cinétique/Énergie/Lourde, disposition en
  deux colonnes (armes à gauche, armure à droite, alignées), nouvelle
  section "Doctrine" (Élément/Super/Aspects/Fragments/Mêlée/Grenade —
  affiche "Non sélectionné" tant qu'aucun sélecteur d'aspects/fragments
  n'existe, voir TODO.md) ;
  (7) bouton "Charger mon inventaire" qui semblait disparaître — en réalité
  il se renommait en "Rafraîchir" une fois chargé ; unifié en un seul
  bouton toujours au même endroit, dont seul le texte change.

- lot de correctifs suite à un nouveau test réel —
  (1) 🔴 bouton "+ Ajouter au build" absent sur certains objets (ex: "Fail
  qui Ronge") — le dédoublonnage de recherche pouvait garder par erreur un
  doublon SANS emplacement reconnu au lieu de la vraie entrée équipable ;
  corrigé pour préférer explicitement l'entrée qui a un `slot` ;
  (2) lag du champ de recherche en effaçant le texte — un scan complet
  coûteux se relançait à chaque pause pendant l'effacement ; sous 2
  caractères, on vide maintenant immédiatement sans scanner ;
  (3) badges de classe invisibles en pratique — Bungie qualifie elle-même
  sa détection `classType` d'"algorithme approximatif" dans sa propre doc,
  probablement pas fiable sur les aspects/fragments spécifiquement ; noté
  honnêtement dans le code, pas de correctif garanti possible sans test réel ;
  (4) perks affichés dans "Mon build" — nouveau composant 305 (sockets)
  ajouté à la récupération d'inventaire, extraction des plugs équipés,
  affichage des noms résolus sous chaque pièce ;
  (5) export DIM "pas de clé retournée" — diagnostic amélioré (affiche le
  contenu réel de la réponse DIM au lieu d'un message générique) + id
  d'application rendu unique par installation (évite un conflit si
  plusieurs personnes utilisent ce projet avec le même id fixe).

- 🔴 **export DIM enfin fonctionnel** — la clé était bien
  présente dans la réponse DIM, mais imbriquée sous `app.dimApiKey`, pas à
  la racine comme je l'avais supposé (la doc DIM ne montrait pas d'exemple
  de réponse complet). Corrigé.

- export DIM 401 — la clé API seule ne suffisait pas : la
  doc DIM précise que TOUTES les requêtes nécessitent AUSSI un jeton
  d'accès DIM, obtenu en échangeant l'access_token Bungie (déjà en main)
  contre un jeton DIM via `/auth/token`. Ajouté (`obtenirTokenDimAcces`
  dans `apiKey.ts`), avec mise en cache et renouvellement automatique
  avant expiration. Le nom exact du champ de réponse n'est pas confirmé
  par la doc (pas d'exemple complet) — si l'erreur persiste avec un
  message "Réponse DIM (auth/token) inattendue", le contenu affiché
  permettra de corriger précisément plutôt que de deviner.

- **optimisation réelle de la recherche** — le filtre
  grossier (normalisation accents/casse) était refait sur le JSON ENTIER de
  chaque ligne à CHAQUE recherche, pour ~40 000+ lignes. Construction
  d'un index (texte déjà normalisé) une seule fois par Manifest chargé,
  proactivement juste après le chargement (message "Indexation..."),
  réutilisé par toutes les recherches suivantes. Testé : passe de 2 lignes
  × N recherches normalisées, à 2 lignes normalisées une seule fois.

- **grille visuelle de Doctrine** (le gros morceau demandé)
  — nouveau module `lib/manifest/doctrine.ts` + composant
  `GrilleDoctrine.tsx`, rattachés au **Pilier 1** (précision de
  l'utilisateur : aspects/fragments appartiennent au Pilier 1, le Pilier 2
  se contente d'observer leurs effets). Fonctionnement : découverte des
  sous-classes réellement possédées via le bucket "Subclass"
  (hash `3284755031`, vérifié via un ticket GitHub officiel Bungie),
  lecture de leurs sockets pour lister les vraies options d'Aspects/
  Fragments/Super/Mêlée/Grenade/Compétence de classe (via
  `reusablePlugItems` ou `DestinyPlugSetDefinition`), affichage en grille
  cliquable avec limite de sélection = nombre réel de sockets (pas de
  nombre codé en dur). Un bug de détection d'élément trouvé et corrigé en
  testant : la détection par texte confondait "Arcaniste" avec "Arc"
  (fausse détection), et ratait les noms hérités ("Sunbreaker") —
  remplacée par le champ numérique `defaultDamageType`, plus fiable.

- masquage par défaut des **quêtes/missions** et
  **ornements** dans les résultats de recherche (ex: "Aspect
  d'interférence" qui est en réalité une étape de quête) — détectés via
  le même texte fiable `itemTypeDisplayName`, toujours accessibles via le
  filtre catégorie si besoin de les voir quand même.

- **grosse session de retours utilisateur** —
  (1) Pilier 5 renommé "Statistiques" (retrait de "2.0") ;
  (2) bouton export DIM annoté "(bêta / en chantier)" ;
  (3) 🔴 bug Doctrine corrigé : seule la Prismatique apparaissait car les
  valeurs numériques `defaultDamageType` supposées étaient probablement
  fausses — ajout d'un repli par texte (limites de mots, évite la
  collision "Arcaniste contient Arc" trouvée précédemment) ;
  (4) **"Mon inventaire" entièrement repensé** : 4 sections repliables
  (Chasseur / Titan / Arcaniste / Coffre), chaque personnage séparé en
  Équipé/Inventaire, coffre classé par emplacement (armes cinétique/
  énergie/lourde puis chaque pièce d'armure), miniatures de perks
  affichées, survol de la souris montrant perks (armes) ou stats
  (armure) — nouveaux champs `origine`, `equipe`, `perksParColonne` sur
  `GearPiece` ;
  (5) **"Mon build"** : perks désormais groupés par colonne de socket
  (comme en jeu) au lieu d'une liste plate ; section Doctrine entièrement
  détaillée — affiche TOUTES les options de chaque catégorie (Super/
  Aspects/Fragments/Mêlée/Grenade) avec ✅ sur les sélectionnées et leur
  effet (description) affiché en clair, plutôt que juste le nom de ce qui
  est choisi. Nouveau champ `subclassItemHash` sur `SubclassConfig` pour
  relire ces options sans re-télécharger la liste des sous-classes ;
  (6) 🔴 **diagnostic ajouté pour le bug "stats pas mises à jour"** —
  l'utilisateur a confirmé que le problème survient même en ajoutant
  depuis l'inventaire réel (pas juste la recherche). Hypothèse : même
  famille de bug que la Doctrine (noms de stats devinés, probablement
  faux). `listerObjetsPossedes` renvoie maintenant aussi
  `statsNonResolues` (les vrais noms de stats rencontrés mais non
  reconnus), affiché directement dans "Mon inventaire" si non vide — **à
  tester en conditions réelles pour obtenir les vrais noms et corriger
  `LIBELLES_STAT` dans `inventaire.ts` en conséquence**.

## 01/08/2026

- bug trouvé en testant le moteur de scoring — l'armure exotique
  était stockée dans un champ séparé (`exotiqueArmure`) et ses stats étaient donc
  exclues du calcul du pilier 5. Corrigé : l'exotique fait maintenant partie du
  tableau `armure` (5 pièces), comme en jeu.

- deuxième bug trouvé en relisant `api.ts` — le code utilisait
  `membership_id` (renvoyé par l'OAuth) comme identifiant Destiny, alors que
  c'est l'identifiant du COMPTE BUNGIE.NET. Corrigé : un nouvel appel
  `GetMembershipsForCurrentUser` récupère d'abord les comptes Destiny liés
  (Steam/Xbox/PSN/Epic) avant tout appel Profile.

- passe d'optimisation demandée par l'utilisateur —
  (1) le module wasm de sql.js n'est plus rechargé à chaque appel du
  Manifest (mis en cache pour la session) ; (2) ajout d'une fonction de
  lecture ciblée par hash (`obtenirDefinition`) pour éviter de charger des
  tables entières en mémoire pour un seul lookup ; (3) correction d'un piège
  classique de l'API Bungie — les hash sont stockés en SQLite comme des
  entiers 32 bits **signés**, alors que l'API les renvoie non signés (sans
  conversion, ~50% des recherches par hash échouent silencieusement) ;
  (4) les statistiques ne sont plus sommées deux fois (une fois par le
  moteur de scoring, une fois par le graphique) — le résultat du scoring
  inclut maintenant `statsTotales`, réutilisé tel quel par l'UI ;
  (5) mémorisation (`useMemo`) du calcul de score dans le tableau de bord,
  pour ne pas le refaire à chaque re-rendu (ex: pendant le test de connexion).

- ajout d'un champ de recherche dans le Manifest — deux modes,
  "nom uniquement" (trouver un objet précis) et "partout" (nom, description,
  et tout texte de perk/aspect/fragment/perk d'artefact, puisqu'ils sont pour
  la plupart des entrées `DestinyInventoryItemDefinition` comme le reste).
  Recherche insensible aux accents et à la casse ("dévoration" trouve aussi
  "Devoration", "DÉVORATION"...). Le Manifest se charge à la demande (bouton
  dédié), pas au démarrage, pour ne pas télécharger ~100 Mo inutilement.
