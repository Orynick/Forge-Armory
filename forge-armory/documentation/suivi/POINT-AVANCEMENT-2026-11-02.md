# Point d'avancement — Forge Armory — 02/11/2026

> Branche : `main` — version courante de l'appli : **0.5.7** (tag `v0.5.7` sur `963252d`, HEAD de `main` = `b309687`).
> Ce point est un instantané documentaire : il ne change aucun code.

---

## 1. Où en est `main` ?

- **Version 0.5.7 livrée le 01–02/11/2026** : le chantier Forge est complet et propagé partout.
  - **Barre Forge 5 boutons stylisés** (Collection, Inventaire, Armes, Armures, **Optimisation**) à hauteur unique `"2.5rem"` (suit le zoom), partie **Optimisation** + optimiseur de stats d'armure + bouton « Optimiseur » sous le cadre Statistiques de Mon Build.
  - **Fenêtre « Détails » unique** partout (Build Analyzer / Inventaire / Coffre / Mon Build / Forge), mêmes sections, même ordre.
  - **8 boutons d'action de la charte** (pack v11, cadres 1024 : même cercle r=436/trait 22 et même plaque 524 que le sélecteur — à hauteur CSS égale, taille identique à la barre, règle `TAILLE-DES-BOUTONS.md`) : Retour, Mettre dans Mon Build, Lire le Lore, Actualisation de l'inventaire, Forge mods (armure), **Forge perks (arme, 8e bouton, remplace l'ancien bouton texte)**, Modifier ↔ Fermer (bascule sans décalage). L'actualisation visuelle remplace aussi l'ancien « ↻ Recharger mon inventaire » dans les Armures.
  - Simulation des mods d'armure dans la pop-up Détails couvre **tous les emplacements modifiables** ; seuls les emplacements fixes restent en lecture seule.
  - PR #24 (correctifs pop-ups 31/10) et PR #23 (audit documentaire post-v0.5.5) mergées ; **pack v11 intégré le 02/11** (`b309687`, archive de référence dans `ressources-installateur/forge-armory/app-assets-v11/`).
  - **Rien n'est écrit chez Bungie** (Phase 1 = simulation locale uniquement).
- Historique : v0.5.5 (24/10) → v0.5.6 (28/10, PR #19 : mods d'armure en simulation, lien score/Mon Build temps réel) → **v0.5.7 (01–02/11, chantier Forge + doc + pack v11)**. Tag `v0.5.3` manquant dans la liste des tags.
- Sécurité : Node.js >= 24.22.1 requis (`engines`, `.nvmrc`, `netlify.toml`), 0 vulnérabilité npm connue.
- Taille du projet sur `main` : 183 fichiers TS/TSX, **54 suites de tests logiques (53/54, 1103/1104 contrôles** — seul échec local connu `icones.test.tsx`, vert en CI), 27 tests UI Playwright (à lancer chez l'utilisateur), 104 SVG dans `public/assets`, `tsc -b` 0 erreur, build strict OK, DEVLOG 10 329 lignes.

## 2. Branches et CI (état au 02/11/2026)

- **15 branches distantes, toutes à jour de `main` (`b309687`), toutes en version 0.5.7**, CI verte partout :
  `main` (référence), `test` (intégration), `pack-assets-v11` (archive du pack, mergée dans main), `draft-podcast` (PR #26, de côté), `draft-optimiseur` + `Import-optimiseur` (optimiseur de build global, chantier en cours), `Import-modif-mods-armures` (import du ZIP, contenu repris par `test` — branche nettoyable), `ccr-18c636a2-6p3cz9` (specs Legendarium), `backup-test-avant-merge-import` (sauvegarde, supprimable), `draft-sec` (CSP), `draft-deps`, `draft-netlify`, `draft-legendarium`, `draft-armure-score`, `draft-update-triomphes`.
- **PR ouvertes : 1 seule — #26** (lecteur podcast Legendarium, draft, branche `draft-podcast`, CI verte, mise de côté volontairement). #22 fermée (remplacée par #26 après renommage de branche). #23 et #24 mergées.
- CI : derniers runs tous `success` (seul échec récent = le push d'origine de `pack-assets-v11` avant relocalisation du pack, supersédé).

## 3. TODO — ce qui reste (sur `main`, 661 lignes)

- 🔴 **Bloquant : aucun.** L'appli fonctionne de bout en bout (connexion, inventaire, doctrine, scoring 5 piliers, partage/exports).
- 🟡 **Important** :
  1. Suites de l'audit externe (notes PowerShell `npm.cmd`, `allow-scripts`, paquets obsolètes transitifs) + **CSP restante** — chantier `draft-sec` (correctif wasm déjà livré en v0.5.4).
  2. **Perks/mods (item 2)** : niveau 1 (simulation locale) ✅ fait en v0.5.6/v0.5.7. Reste le **niveau 2 = application réelle en jeu** (`InsertSocketPlugFree`, Phase 2, à cadrer avec l'utilisateur) + points de détail : mementos à retirer, « résonance de Souvenance », doublons dans les « mods utilisables », n'afficher que les options réellement possibles, défauts des pop-ups Détails relevés le 30/09.
  3. **Agent IA ⏸️** : en attente assumée (décision à trancher avant toute ligne de code — doc `documentation/agent-ia/`).
  4. **Tests automatiques du scoring côté utilisateur** : `scripts/tester-avec-fixtures.mjs` à lancer une fois avec un vrai `node_modules`, puis en contrôle régulier avant chaque version.
- 🟢 **Confort / plus tard (items 5–22)** : anti-champion autres verbes, armatures d'armes inconnues, vérifications ponctuelles (Ergo Sum, coquille « Raidance »), archétypes d'armure, vitrine « Solo sans mourir » (exotiques de raid), patch notes Bungie dans la knowledge-base, **« Équiper »** (objet au courrier via PullFromPostmaster, armure équipée sur autre perso, check-list perks d'artefact, `EquipItems` en lot), surveillance pilier 2 (sautHash), liste anti-champion exotiques (2 désaccords liste/déduction), interface, filtre lance-grenades, export DIM, icônes perks d'artefact, fragments dépendant de la classe, objets factices du Manifest, check-list avant livraison, lien « Contact » en pied de page.
- Section « Pistes abandonnées ou mises de côté » : ne pas reproposer sans raison.

## 4. Chantiers en cours (branches dédiées)

| Branche | Sujet | État |
|---|---|---|
| `draft-optimiseur` / `Import-optimiseur` | Optimiseur de **build global** (mix de pièces, poids) | chantier en cours, non livré ; union-mergé avec le chantier Forge |
| `draft-podcast` (PR #26) | Lecteur podcast flottant du Legendarium (MP3 perso) | **de côté** volontairement (demande du travail) |
| `draft-sec` | CSP | correctif wasm livré en v0.5.4, reste la branche |
| `ccr-18c636a2-6p3cz9` | Specs Legendarium (index des specs) | en cours |
| `draft-legendarium`, `draft-armure-score`, `draft-update-triomphes`, `draft-deps`, `draft-netlify` | Divers chantiers exploratoires | à trier |

## 5. Prochaines étapes suggérées

1. **Valider en `npm run dev`** le pack v11 : boutons d'action au même cercle/plaque que la barre Forge ; bouton perks visuel sur les armes dans la pop-up Détails. Puis lancer les 27 tests UI Playwright.
2. Décider de la **Phase 2** (écriture réelle chez Bungie : insertion de perks/mods) — cadrer avant de coder.
3. Décider du sort de la **PR #26** (podcast) quand le chantier sera repris.
4. Nettoyage : supprimer `backup-test-avant-merge-import` et éventuellement `Import-modif-mods-armures` (contenu repris par `test`/`main`) ; tag `v0.5.3` manquant à poser si souhaité.
5. Lancer `scripts/tester-avec-fixtures.mjs` chez l'utilisateur (item 4 Important).
