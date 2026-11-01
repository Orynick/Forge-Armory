# Constitution — Forge Armory

**Date :** 31 octobre 2026
**Statut :** actif. Toute modification nécessite une décision explicite de l'utilisateur, consignée dans le DEVLOG avec sa justification.

Ces règles sont les principes non négociables du projet. Toute spec de chantier doit s'y conformer ; toute exception doit être justifiée par écrit dans la spec.

---

## Article I — Le moteur déterministe fait foi

Les calculs vérifiables (statistiques, dégâts, DPS, score, comparaisons) sont réalisés par le code de l'application, jamais par l'IA. L'IA interprète et raisonne, elle ne calcule pas. (Voir `documentation/agent-ia/ARCHITECTURE-AGENT-IA.md`, décision structurante n°1.)

## Article II — Phase 1 : aucune écriture chez Bungie

Par défaut, aucun chantier n'écrit chez Bungie (aucun appel API en écriture : équipement, mods insérés, etc.). Toute écriture chez Bungie constitue une **Phase 2** qui doit être déclarée explicitement dans la spec, avec son propre périmètre et ses garde-fous.

## Article III — Tests d'abord pour la logique

Toute évolution de la logique (`src/lib/`, moteur de scoring, parsing) est accompagnée dans la même PR de tests dans `tests/logique/` couvrant le comportement ajouté ou modifié. La batterie complète doit être verte : `npm run test:logique` N/N.

## Article IV — Zéro erreur tolérée au build

Avant toute livraison : `npx tsc -b` 0 erreur, `npm run build` réussi, CI GitHub Actions verte sur la PR.

**Précision (leçon du 05/10, DEVLOG §21 TODO) :** `npm run dev` (Vite) ne vérifie PAS les types — une erreur `TS2540` y passe inaperçue et n'apparaît qu'au build. Ne jamais se fier au dev server pour la vérification ; seuls `tsc -b` / `npm run build` / la CI comptent.

## Article V — Périmètre déclaré, périmètre respecté

Chaque spec déclare son **périmètre** (fichiers/fonctionnalités concernés) et son **hors périmètre**. Avant merge, le diff vs `main` est vérifié : aucune modification hors périmètre déclaré sans justification écrite dans la PR. C'est la règle anti-régression (cf. incident du 28/10/2026 — `git stash pop` non résolu embarquant 2 fichiers hors périmètre, DEVLOG).

**Gestion des branches (leçons du 24/10, DEVLOG) :**
- Jamais de force-push / resynchronisation forcée d'une branche de chantier sans vérifier ensuite que `main` contient bien tout le code livré (un resync post-PR a rendu le commit `f9f1e9d` orphelin et perdu le code des cartes de sceaux de `main`).
- Tout paquet/livrable est construit depuis un `main` à jour — jamais depuis une vieille base (un paquet construit sur la v0.5.0 aurait ramené un projet en v0.5.2 en arrière).

## Article VI — Spec validée avant codage

Aucun code n'est produit avant validation de la spec par l'utilisateur. Les incertitudes sont marquées `[À CLARIFIER: ...]` dans la spec et levées avant codage, pas supposées.

**Deux règles dérivées (leçons du DEVLOG) :**
- **Ne pas généraliser une règle métier d'un seul cas** (26/10 : hypothèse « le + de l'ajustement est imposé sur la tertiaire », tirée d'une seule pièce, FAUSSE — corrigée par les 52 armures du compte). Toute règle affirmée dans une spec doit être validée sur plusieurs exemplaires / jeux de données réelles avant d'être verrouillée.
- **Ne pas déplacer ni modifier une UI validée par l'utilisateur sans son accord explicite** (21/10, suite 8 : déplacement des boutons Carrière/Accomplissements annulé comme régression signalée par l'utilisateur).

## Article VII — Traçabilité obligatoire

Chaque livraison laisse une trace : entrée DEVLOG datée (décision, vérifications chiffrées, validation utilisateur), entrée CHANGELOG si visible par l'utilisateur, tag de version, branche de chantier supprimée après merge.

## Article VIII — Simplicité

Pas de sur-architecture : pas d'abstraction nouvelle sans besoin avéré dans le chantier en cours. Un chantier touche le minimum de fichiers nécessaires. Toute complexité ajoutée doit être justifiée dans le plan.

## Article IX — Validation utilisateur chiffrée

Une livraison n'est bouclée que par un retour utilisateur chiffré (ex. « 8/8 »), consigné dans le DEVLOG. Les tests UI Playwright (`tests/ui/`) restent rejoués manuellement par l'utilisateur — ils ne tournent pas en CI. Les tests UI doivent ÉCHouer vite (attente courte) plutôt que de planter après 30 s sur un élément absent (leçon DEVLOG 24/10).

## Article X — Protection des données utilisateur

- Les identifiants internes qui protègent les données de l'utilisateur ne sont **jamais renommés** : `name` et `appId` de `package.json`, les clés de stockage, le dossier `%APPDATA%` repéré au démarrage (TODO §12). Le nom du dossier projet / du zip, lui, est libre (corrigé le 05/10).
- Aucune donnée ajoutée pour une fonctionnalité interne (ex. simulation de mods : `plugsInsertablesParColonne`, `energie`) ne doit fuiter dans les builds **enregistrés, exportés ou partagés** — l'export les retire (oubli rattrapé le 27/10, DEVLOG).

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
