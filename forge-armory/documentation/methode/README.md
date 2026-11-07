# Méthode de travail — Forge Armory

**Date :** 31 octobre 2026 (mises à jour : 1er novembre 2026, 6 novembre 2026)
**Statut :** actif — toute évolution livrée sur `main` suit cette méthode.
**Inspiration :** [github/spec-kit](https://github.com/github/spec-kit) (Spec-Driven Development), adapté au rythme du projet (un développeur + assistant IA, livraisons fréquentes).

---

## 1. Principe

Aucun code n'est écrit avant qu'une **spécification de chantier** ait été validée par l'utilisateur. La spec fait foi : toute divergence constatée en cours de route est signalée **avant** codage.

**Exception :** les chantiers triviaux et corrections mineures (définition au [§5](#5-chantiers-triviaux-et-corrections-mineures)) vont directement sur `main`, sans spec ni branche de chantier.

## 2. Workflow d'un chantier

1. **Spec** — rédiger `documentation/specs/SPEC-<slug>-<date>.md` à partir du template [`templates/SPEC-chantier.md`](templates/SPEC-chantier.md). Marquer les incertitudes avec `[À CLARIFIER: question]`.
2. **Validation** — l'utilisateur valide la spec (décisions verrouillées). Aucun code sur `main` à ce stade.
3. **Branche** — créer `draft-<slug>` à partir de `main`.
4. **Plan** — remplir [`templates/PLAN-chantier.md`](templates/PLAN-chantier.md) (fichiers touchés, ordre de réalisation, risques).
5. **Implémentation** — coder sur la branche, en commençant par les tests de logique quand la logique évolue.
6. **Vérifications** — cocher [`templates/CHECKLIST-livraison.md`](templates/CHECKLIST-livraison.md) : `npx tsc -b` 0 erreur, batterie logique N/N, `npm run build`, CI verte, **diff vs `main` limité au périmètre déclaré**, aucune régression hors périmètre.
7. **PR** — ouvrir la PR depuis `draft-<slug>` avec la checklist cochée en description.
8. **Validation utilisateur** — retour chiffré (ex. 8/8) consigné dans le DEVLOG.
9. **Livraison** — merge dans `main` **depuis l'interface GitHub** (Article XII : CI verte requise, pas de merge par push local), puis **vérification post-merge** : contenu de la PR réellement présent dans `main`, `tsc -b` 0 erreur, batterie N/N, `npm run build` OK, diff limité au périmètre (Article XII.3 et XII.4). Tag de version, entrée DEVLOG, branche supprimée, propagation de `main` sur les branches de chantier actives.

## 3. Rôles des documents

| Document | Rôle |
|---|---|
| [`CONSTITUTION.md`](CONSTITUTION.md) | Règles non négociables du projet (inchangées sauf décision explicite documentée). |
| `documentation/specs/SPEC-*.md` | Spécification d'un chantier, validée avant codage. Fait foi. |
| `templates/PLAN-chantier.md` | Plan d'implémentation d'un chantier validé. |
| `templates/CHECKLIST-livraison.md` | Vérifications obligatoires avant merge d'une PR (chantier complet). |
| `templates/CHECKLIST-correctif-mineur.md` | Version courte pour un chantier trivial / une correction mineure livrée directement sur `main`. |
| `templates/INDEX-specs.md` | Modèle de l'index `documentation/specs/INDEX.md` (liste des specs, statut, version, PR). |
| `DEVLOG.md` | Historique daté : décisions, livraisons, validations chiffrées, incidents. |

## 4. Règles de nommage

- Branche de chantier **piloté par l'utilisateur** : `draft-<slug>` (ex. `draft-mod-armures`). Cette règle ne vise que ces chantiers. Les branches créées par les outils ou l'assistant (`vibe/...`, `ccr-...`, etc.) ne sont pas soumises à ce préfixe ; elles suivent le nom que l'outil impose et ne remplacent pas la branche `draft-<slug>` d'un chantier que l'utilisateur pilote.
- Spec : `documentation/specs/SPEC-<SLUG>-<AAAA-MM-JJ>.md`, référencée dans `documentation/specs/INDEX.md` (modèle : [`templates/INDEX-specs.md`](templates/INDEX-specs.md)).
- Version : `0.5.x` pour un incrémental, `0.6` pour un chantier majeur ou une rupture ; le choix est justifié dans le DEVLOG.

## 5. Chantiers triviaux et corrections mineures

Ils vont **directement sur `main`**, sans spec, sans branche `draft-<slug>` ni PR (décision du 01/11/2026).

**Est trivial / mineur** un changement qui remplit **toutes** ces conditions :
- comportement non ambigu, aucune décision de conception à prendre (aucun `[À CLARIFIER]` nécessaire) ;
- touche peu de fichiers (repère : 3 maximum) ;
- ne modifie ni le moteur de scoring, ni le modèle de données, ni les données persistées, ni les exports/partages, et aucun appel Bungie (Articles I, II, X) ;
- ne déplace ni ne modifie une UI déjà validée par l'utilisateur sans son accord explicite (Article VI) ;
- exemples : faute de texte, correction de style ou d'alignement, commentaire, doc, test cassé, correctif d'une régression signalée.

**En cas de doute, ou si une seule condition n'est pas remplie, le workflow complet (§2) s'applique.**

**Durcissement (Article XII, décision du 06/11/2026) :** même pour un push direct trivial, la branche courante est vérifiée avant toute opération git (`git branch --show-current`), et la CI du push doit être verte — sinon correctif immédiat ou revert consigné au DEVLOG avec son plan de réintégration. L'assistant propose la qualification « trivial », l'utilisateur confirme.

**Reste obligatoire** (Constitution, Articles III, IV, V, VII) :
1. `npx tsc -b` 0 erreur, `npm run build` OK, batterie logique verte (exception connue : Article III) ;
2. diff vs `main` relu avant le push, limité à ce qui est annoncé ;
3. CI verte sur `main` après le push ;
4. entrée DEVLOG datée (et CHANGELOG si visible par l'utilisateur) ;
5. la checklist courte [`templates/CHECKLIST-correctif-mineur.md`](templates/CHECKLIST-correctif-mineur.md) reprise dans le message de commit ou l'entrée DEVLOG.
