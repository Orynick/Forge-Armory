# Point d'avancement — Forge Armory — 30/10/2026 (soir)

> Branche : `test` — version courante de l'appli : **0.5.6** (tag `v0.5.6`, HEAD de `main` = `b2d1c3b`).
> Ce point est un instantané documentaire : il ne change aucun code.

---

## 1. Où en est `main` ?

- **Version 0.5.6 livrée le 28/10/2026** : merge de la PR #19 (`draft-mod-armures`) — chantier « modification des mods d'armure » **bouclé** : simulation des mods dans les pop-ups Détails (Mon Inventaire, Coffre, Mon Build) **et** dans la Forge, budget d'énergie (jauge + garde-fou), lien score/Mon Build en temps réel (« réel → simulé », delta, badge 🔨 simulé), ajustement (règle du « + » propre à chaque armure, symbole ⇅). **Rien n'est écrit chez Bungie.** Validé par l'utilisateur (8/8 le 24/10 + évolutions 25–27/10). CI verte, tag `v0.5.6`.
- Historique des versions : v0.5.0 (22/10, Legendarium) → v0.5.1 (23/10, Legendarium opérationnel + Carrière/Accomplissements + stack à jour) → v0.5.2 (23/10, Accomplissements finalisé en cartes + nouveau logo cristaux cyan) → v0.5.3 (23/10, correctif bloquant connexion Bungie) → v0.5.4 (23/10, correctif CSP/WebAssembly Manifest) → v0.5.5 (24/10, audit + courrier/postmaster) → **v0.5.6 (28/10, PR #19)**.
- Sécurité : **Node.js >= 24.22.1 requis** (`engines`, `.nvmrc`, `netlify.toml`), 0 vulnérabilité npm.
- Taille du projet sur `main` : 174 fichiers TS/TSX, 48 suites de tests logiques (981 contrôles en CI), `tsc -b` 0 erreur, build strict OK.

## 2. Point Sceaux / Accomplissements (vérifié sur `test`)

- La page **Accomplissements** de `test` est **strictement identique à `main`** (0 ligne de diff sur `VueAccomplissements.tsx`) : les cartes de sceaux sont des **carrés identiques** (`aspect-ratio: 1 / 1`), nom tronqué à 2 lignes, barre de progression + pourcentage en zone de hauteur fixe sous le carré — alignements respectés (décision du 24/10 soir, régression évitée le 28/10 lors du merge PR #19, commit `bc83d32`).
- TODO item 23 : ✅ **LIVRÉ ET VALIDÉ** (PR #17, présentation en cartes grille v0.5.2).
- La branche `Import-optimiseur` embarque d'ailleurs une **garde anti-régression** dédiée (`accomplissements-sceaux-carres.test.ts`, 27 contrôles) pour protéger ce point lors des imports.

## 3. Recoupement des chantiers « Optimiseur »

Deux pistes coexistent, sur des branches séparées, **sans conflit de fichiers cœur** (intersection = 7 fichiers d'intégration seulement : `ResumeBuild`, `SelecteurVues`, `DashboardPage`, `types/build.ts`, `inventaire.ts`, `cablage-forge.test.ts`, `DEVLOG.md`) :

| | `draft-optimiseur` (20 commits propres, 29 fichiers) | `Import-modif-mods-armures` (ZIP du 30/10, 62 fichiers, +2661/−696) |
|---|---|---|
| Moteur | `src/data/buildOptimizer.ts` (454 lignes, `optimiserBuild`) + `PageOptimiseur.tsx` (396 lignes) — **optimiseur de build global** (mix de pièces sur les 5 slots, poids, `MAX_MIX_PAR_SLOT_DEFAUT = 24`) | `src/lib/forge/optimiseur*.ts` (5 fichiers, solveur `resoudre`, chasse, plan) + `OptimiseurArmures.tsx` (325 lignes) — **optimiseur de stats d'armure** (objectifs par statistique, 3 meilleures combinaisons, « à faire en jeu », « à chasser ») |
| Base | créée avant v0.5.6, à jour de `main` (merge du 28/10) | créée depuis `main` v0.5.6, **CI verte au dernier commit** (`b858c5e`, 6 erreurs TS du ZIP corrigées) |
| Statut | chantier en cours, non livré | import du ZIP 30/10 en cours de test par l'utilisateur (6 échecs UI hérités du ZIP d'origine, identiques à la source) |

- **`Import-optimiseur`** (3 commits) est la branche d'import dédiée à la finalisation « Optimisation » : procédure d'import documentée, base ZIP = v0.5.5, écart v0.5.5→v0.5.6 mesuré, garde anti-régression Sceaux. CI verte.
- **Recommandation** : les deux optimiseurs sont complémentaires (build global vs stats d'armure) mais touchent les mêmes fichiers d'intégration — à merger **séquentiellement**, en commençant par celui que l'utilisateur valide en premier, en gardant la garde anti-régression Sceaux active pendant toute la période.

## 4. Branches et CI (état au 30/10 soir)

- 13 branches distantes, **toutes à jour de `main`** (0 commit de retard) : `main`, `test`, `draft-optimiseur`, `draft-armure-score`, `draft-sec`, `draft-legendarium`, `draft-netlify`, `draft-deps`, `draft-update-triomphes`, `Import-modif-mods-armures`, `Import-optimiseur`, `vibe/doc-mise-a-jour-87155d` (PR #23), `vibe/draft-podcast-840f64` (PR #22).
- **CI : aucun run en cours, tout est vert** sauf un run intermédiaire en `failure` sur `Import-modif-mods-armures` (merge du 30/10 22:08) — **remplacé par un succès** au commit final `b858c5e` (22:52). Derniers runs : `main` ✅ (27/10), `test` ✅ (27/10), PR #22 ✅, PR #23 ✅, `draft-optimiseur` ✅ (28/10), `Import-optimiseur` ✅ (29/10), `Import-modif-mods-armures` ✅ (30/10).
- **PR ouvertes (2, toutes deux en draft, CI pass)** : #23 « Mise à jour documentaire complète » et #22 « Lecteur podcast flottant du Legendarium ».

## 5. TODO — ce qui reste (sur `main`)

- 🔴 **Bloquant** : aucun.
- 🟡 **Important** : (1) reste de l'audit = CSP — chantier `draft-sec` (déjà livré en v0.5.4 pour le correctif wasm ; reste la fusion propre de la branche) ; (2) item 2 « perks/mods » — **niveau 1 (simulation) FAIT en v0.5.6**, reste le **niveau 2 (application en jeu via InsertSocketPlugFree)** ; (3) Agent IA — ⏸️ volontaire ; (4) tests automatiques du scoring côté utilisateur.
- 🟢 **Confort** : items 5–22 (anti-champion, archétypes, vitrine Solo Flawless, export DIM, etc.).

## 6. Prochaines étapes suggérées

1. **Valider en `npm run dev`** le ZIP importé sur `Import-modif-mods-armures` (fenêtre unique, optimiseur d'armures, boutons stylisés) — puis merger dans l'ordre choisi.
2. **Merger la PR #23** (documentation, CI verte) dès que voulu — elle corrige notamment la section v0.5.2 manquante du CHANGELOG et le prérequis Node 24.22.1 dans le guide.
3. Décider du sort de la PR #22 (podcast Legendarium) : garder en draft ou livrer.
4. Puis : niveau 2 du TODO item 2 (écriture en jeu), ou finalisation de l'optimiseur de build (`draft-optimiseur`).

---

*Généré le 30/10/2026 — point documentaire sans modification de code. Version de l'appli inchangée : 0.5.6.*
