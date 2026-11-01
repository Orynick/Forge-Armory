# Constitution — Forge Armory

**Date :** 31 octobre 2026 (mise à jour le 1er novembre 2026)
**Statut :** actif. Seul l'utilisateur peut la modifier (voir Article XI) : toute modification nécessite sa décision explicite, consignée dans le DEVLOG avec sa justification.

Ces règles sont les principes non négociables du projet. Toute spec de chantier doit s'y conformer ; toute exception doit être justifiée par écrit dans la spec.

---

## Article I — Le moteur déterministe fait foi

Les calculs vérifiables (statistiques, dégâts, DPS, score, comparaisons) sont réalisés par le code de l'application, jamais par l'IA. L'IA interprète et raisonne, elle ne calcule pas. (Voir `documentation/agent-ia/ARCHITECTURE-AGENT-IA.md`, décision structurante n°1.)

## Article II — Phase 1 : aucune écriture chez Bungie

Par défaut, aucun chantier n'écrit chez Bungie (aucun appel API en écriture : équipement, mods insérés, etc.). Toute écriture chez Bungie constitue une **Phase 2** qui doit être déclarée explicitement dans la spec, avec son propre périmètre et ses garde-fous.

## Article III — Tests d'abord pour la logique

Toute évolution de la logique (`src/lib/`, moteur de scoring, parsing) est accompagnée dans la même PR de tests dans `tests/logique/` couvrant le comportement ajouté ou modifié. La batterie complète doit être verte : `npm run test:logique` N/N.

**Échec connu toléré (seule exception, décision du 01/11/2026) :** `tests/logique/icones.test.tsx` (contrôle `element:officielle`) échoue en local mais passe en CI ; la batterie locale s'affiche donc **53/54 suites, 1103/1104 contrôles** et la CI fait foi pour cette suite. Tout autre échec bloque la livraison. Cette exception est suivie en TODO (item 25) et disparaît de cet article dès que le test est corrigé.

## Article IV — Zéro erreur tolérée au build

Avant toute livraison : `npx tsc -b` 0 erreur, `npm run build` réussi, CI GitHub Actions verte sur la PR.

**Précision (leçon du 05/10, DEVLOG §21 TODO) :** `npm run dev` (Vite) ne vérifie PAS les types — une erreur `TS2540` y passe inaperçue et n'apparaît qu'au build. Ne jamais se fier au dev server pour la vérification ; seuls `tsc -b` / `npm run build` / la CI comptent.

## Article V — Périmètre déclaré, périmètre respecté

Chaque spec déclare son **périmètre** (fichiers/fonctionnalités concernés) et son **hors périmètre**. Avant merge (ou, pour un commit direct sur `main`, avant le push — voir README §5), le diff vs `main` est vérifié : aucune modification hors périmètre déclaré sans justification écrite dans la PR (ou dans le message de commit). C'est la règle anti-régression (cf. incident du 28/10/2026 — `git stash pop` non résolu embarquant 2 fichiers hors périmètre, DEVLOG).

**Gestion des branches (leçons du 24/10, DEVLOG) :**
- Jamais de force-push / resynchronisation forcée d'une branche de chantier sans vérifier ensuite que `main` contient bien tout le code livré (un resync post-PR a rendu le commit `f9f1e9d` orphelin et perdu le code des cartes de sceaux de `main`).
- Tout paquet/livrable est construit depuis un `main` à jour — jamais depuis une vieille base (un paquet construit sur la v0.5.0 aurait ramené un projet en v0.5.2 en arrière).

## Article VI — Spec validée avant codage

Aucun code n'est produit avant validation de la spec par l'utilisateur. Les incertitudes sont marquées `[À CLARIFIER: ...]` dans la spec et levées avant codage, pas supposées.

**Exception (décision du 01/11/2026) :** les chantiers triviaux et les corrections mineures, tels que définis dans le [README §5](README.md), peuvent être livrés directement sur `main` sans spec ni branche de chantier. Ils restent soumis aux Articles III, IV, V, VII et X.

**Deux règles dérivées (leçons du DEVLOG) :**
- **Ne pas généraliser une règle métier d'un seul cas** (26/10 : hypothèse « le + de l'ajustement est imposé sur la tertiaire », tirée d'une seule pièce, FAUSSE — corrigée par les 52 armures du compte). Toute règle affirmée dans une spec doit être validée sur plusieurs exemplaires / jeux de données réelles avant d'être verrouillée.
- **Ne pas déplacer ni modifier une UI validée par l'utilisateur sans son accord explicite** (21/10, suite 8 : déplacement des boutons Carrière/Accomplissements annulé comme régression signalée par l'utilisateur).

## Article VII — Traçabilité obligatoire

Chaque livraison laisse une trace : entrée DEVLOG datée (décision, vérifications chiffrées, validation utilisateur), entrée CHANGELOG si visible par l'utilisateur, tag de version, branche de chantier supprimée après merge.

## Article VIII — Simplicité

Pas de sur-architecture : pas d'abstraction nouvelle sans besoin avéré dans le chantier en cours. Un chantier touche le minimum de fichiers nécessaires. Toute complexité ajoutée doit être justifiée dans le plan.

## Article IX — Validation utilisateur chiffrée

Une livraison n'est bouclée que par un retour utilisateur chiffré (ex. « 8/8 »), consigné dans le DEVLOG.

**Tests UI Playwright (`tests/ui/`) :** ils **ne tournent pas en CI** (le workflow `.github/workflows/ci.yml` n'exécute que `tsc -b`, `npm run build` et `npm run test:logique`) : ils exigent un navigateur et un environnement réel. Ils se lancent à la main (`node tests/ui/build.mjs <nom>` puis `python3 tests/ui/<nom>.py`). L'assistant les écrit et les met à jour avec le chantier, et les rejoue quand son environnement le permet ; sinon il le déclare dans le DEVLOG (ex. 22/10 : `libglib-2.0.so.0` absente). Le rejeu fait foi côté utilisateur (`npm run dev` et logiciel installé). Les tests UI doivent ÉCHOUER vite (attente courte) plutôt que de planter après 30 s sur un élément absent (leçon DEVLOG 24/10).

## Article X — Protection des données utilisateur

- Les identifiants internes qui protègent les données de l'utilisateur ne sont **jamais renommés** : `name` et `appId` de `package.json`, les clés de stockage, le dossier `%APPDATA%` repéré au démarrage (module [`electron/dossierDonnees.cjs`](../../electron/dossierDonnees.cjs) ; décision et raisons dans le [DEVLOG](../../DEVLOG.md), entrée « 05/10/2026 — v0.3.0 (suite 12, même version) — Renommage officiel : Forge Armory »). Le nom du dossier projet / du zip, lui, est libre (corrigé le 05/10).
- Aucune donnée ajoutée pour une fonctionnalité interne (ex. simulation de mods : `plugsInsertablesParColonne`, `energie`) ne doit fuiter dans les builds **enregistrés, exportés ou partagés** — l'export les retire (oubli rattrapé le 27/10, DEVLOG).

## Article XI — Évolution de la constitution

La constitution ne change **que sur décision explicite de l'utilisateur**. L'assistant peut **proposer** un nouvel article, une modification ou une nouvelle ligne d'annexe (par exemple après un incident), mais ne les applique jamais de sa propre initiative ni sur la seule base d'une proposition non validée.

Toute modification décidée est consignée dans le **même commit** que son entrée DEVLOG (date, décision de l'utilisateur, justification) ; s'il s'agit d'une leçon, elle est aussi ajoutée à l'annexe ci-dessous, et la date en tête de ce document est mise à jour.

---

## Annexe — Leçons du DEVLOG (références)

| Date | Leçon | Couverte par |
|---|---|---|
| 05/10 | `npm run dev` ne typecheck pas ; erreur `TS2540` passée inaperçue | Article IV |
| 21/10 (suite 8) | Ne pas déplacer une UI validée sans accord de l'utilisateur | Article VI |
| 24/10 | Commit orphelin après force-push/resync de branche : code perdu de `main` | Article V |
| 24/10 | Paquet construit sur une vieille base = retour en arrière | Article V |
| 26/10 | Règle métier généralisée d'un seul cas, fausse | Article VI |
| 27/10 | Champs de simulation oubliés dans l'export/partage | Article X |
| 28/10 | `git stash pop` non résolu = fichiers hors périmètre embarqués | Article V |
| 23/10 (v0.5.4) | CSP bloque WebAssembly : vérifier en conditions réelles (installateur), pas seulement en dev | Article IV + checklist |
| 01/11/2026 | Échec local connu (`icones.test.tsx`) : l'exigence « N/N » n'était pas tenable telle quelle | Article III (exception documentée) |
