# Point d'avancement — Forge Armory — 05/11/2026

> Branche : `main` — version courante de l'appli : **0.6.0** (HEAD de `main` = `ca8be9b`).
> Ce point est un instantané documentaire : il ne change aucun code.

---

## 1. Où en est `main` ?

- **Version 0.6.0 livrée le 04/11/2026** : le chantier **mods-phase-2 est TERMINÉ de bout en bout** — première fonctionnalité d'**ÉCRITURE** des perks/mods chez Bungie (passage de palier 0.5.7 → 0.6.0 justifié dans le DEVLOG).
  - **PR #27 mergée le 04/11 à 23:34** (branche `draft-mods-phase-2`) : SPEC de cadrage (`SPEC-MODS-PHASE-2-2026-11-03.md`) + PLAN, puis codage avec **validation en jeu de l'utilisateur obtenue** (« OK ça fonctionne »).
  - Composant partagé `AppliquerEnJeu.tsx` : bouton « Appliquer en jeu » dans la carte d'armure ET la fenêtre Détails, modale de confirmation socket par socket, progression ✓/✗/–, arrêt au premier refus, relance des prises restantes, effacement de la simulation après succès complet. **Variante A retenue : mods d'armure uniquement** (jamais pour une arme).
  - **Correctif clé du premier test réel** : l'endpoint gratuit `InsertSocketPlugFree` attend le champ **`itemId`** (pas `itemInstanceId`, réservé à l'endpoint payant) — cause du refus `ErrorCode 1663` initial, prouvée contre l'implémentation de DIM. Corps correct : `{ itemId, characterId, membershipType, plug: { socketIndex, socketArrayType: 0, plugItemHash } }`.
  - Nouvelle suite de tests `tests/logique/ecarts-simulation.test.ts`.
- **Pack v12 intégré le 05/11** (`ca8be9b`) : `public/assets` reconstruit depuis le pack v12 (100 SVG + 2 PNG), ids renommés dans le code (dont `actions.appliquer-en-jeu.repos`, `icones.appliquer-en-jeu`), reproductibilité 7/7 (106 fichiers octet pour octet), archives v11/v7 rangées dans `archives-precedentes/`.
- Historique récent : v0.5.7 (01–02/11, chantier Forge + pack v11) → **v0.6.0 (04/11, Phase 2 écrite et validée en jeu)**.
- Qualité sur `main` : `tsc -b` 0 erreur, **batterie logique 55/55 suites (1118/1118 contrôles)**, build strict OK, `npm ci` OK, DEVLOG 10 436 lignes, TODO 672 lignes.

## 2. Branches et CI (état au 05/11/2026)

- **16 branches distantes** ; `main` a avancé de 14 commits depuis le point du 02/11 : **toutes les autres branches sont désormais EN RETARD sur `main`** (de 2 à 39 commits). Les chantiers en cours (`draft-optimiseur`, `draft-sec`, etc.) devront être re-syncés avant reprise.
- **PR ouverte : 1 seule — #26** (lecteur podcast Legendarium, draft, `draft-podcast`, volontairement de côté). #27 **mergée**. #22/#25 fermées.
- CI : derniers runs `main` **verts** (`bee4501` merge #27, `ca8be9b` pack v12). Seul échec récent = `f7466b0` (push intermédiaire des boutons « Appliquer en jeu », supersédé par les commits suivants).
- Tags : `v0.5.3` à `v0.6.0` présents (v0.5.3 posé entre-temps).

## 3. TODO — ce qui reste (sur `main`, 672 lignes)

- 🔴 **Bloquant : aucun.** L'appli fonctionne de bout en bout (connexion, inventaire, doctrine, scoring 5 piliers, partage/exports, **et maintenant écriture des mods d'armure en jeu**).
- 🟡 **Important** :
  1. **Perks/mods (item 2)** : niveau 2 **FAIT et validé en jeu** pour les **mods d'armure** (variante A). Restent en suspens : perks d'armes (variante B, seulement si le diagnostic le prouve sur le compte réel), points de détail (mementos, « résonance de Souvenance », doublons des « mods utilisables », options réellement possibles).
  2. Suites de l'audit externe (rappels PowerShell `npm.cmd`, `allow-scripts`, paquets obsolètes transitifs) — CSP déjà livrée en v0.5.4 ; branche `draft-sec` à fusionner proprement (safeStorage, liste blanche réseau).
  3. **Agent IA ⏸️** : en attente assumée (décision à trancher avant toute ligne de code — `documentation/agent-ia/`).
  4. **Tests automatiques du scoring côté utilisateur** : `scripts/tester-avec-fixtures.mjs` à lancer avec un vrai `node_modules`, en contrôle régulier avant chaque version.
- 🟢 **Confort / plus tard (items 5–23)** : « Équiper » (PullFromPostmaster, `EquipItems` en lot), patch notes Bungie dans la knowledge-base, export DIM, filtre lance-grenades, icônes perks d'artefact, fragments selon la classe, lien « Contact », etc.
- Section « Pistes abandonnées ou mises de côté » : ne pas reproposer sans raison.

## 4. Chantiers en cours (branches dédiées — toutes à re-syncer sur `main`)

| Branche | Sujet | État |
|---|---|---|
| `draft-mods-phase-2` | Phase 2 perks/mods | **TERMINÉ, mergé (PR #27), branche à supprimer** |
| `draft-optimiseur` / `Import-optimiseur` | Optimiseur de build global | chantier en cours, non livré, en retard sur main |
| `draft-podcast` (PR #26) | Lecteur podcast Legendarium | de côté volontairement |
| `draft-sec` | CSP durcie (safeStorage, liste blanche) | reste à fusionner proprement |
| `ccr-18c636a2-6p3cz9` | Specs Legendarium | en cours |
| `draft-legendarium`, `draft-armure-score`, `draft-update-triomphes`, `draft-deps`, `draft-netlify` | Divers chantiers exploratoires | à trier |
| `Import-modif-mods-armures`, `backup-test-avant-merge-import`, `pack-assets-v11` | Branches de travail/backup obsolètes | **nettoyables** (contenu repris par `main`) |

## 5. Prochaines étapes suggérées

1. **Nettoyage de branches** : supprimer `draft-mods-phase-2` (mergée), `backup-test-avant-merge-import`, `Import-modif-mods-armures`, `pack-assets-v11` ; puis re-syncer les chantiers vivants (`draft-optimiseur`, `draft-sec`) sur `main` (0.6.0).
2. **Valider le pack v12 en `npm run dev`** (boutons « Appliquer en jeu » de la charte dans les cartes et fenêtres Détails) puis lancer les tests UI Playwright.
3. Décider de la **variante B** (perks d'armes en jeu) seulement après un diagnostic `InsertSocketPlugFree` concluant sur le compte réel — et décider du sort de la **PR #26** (podcast).
4. Lancer `scripts/tester-avec-fixtures.mjs` chez l'utilisateur (item 4 Important).
