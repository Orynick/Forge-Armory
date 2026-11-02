# Méthode de travail — Forge Armory

**Date :** 31 octobre 2026
**Statut :** actif — toute évolution livrée sur `main` suit cette méthode.
**Inspiration :** [github/spec-kit](https://github.com/github/spec-kit) (Spec-Driven Development), adapté au rythme du projet (un développeur + assistant IA, livraisons fréquentes).

---

## 1. Principe

Aucun code n'est écrit avant qu'une **spécification de chantier** ait été validée par l'utilisateur. La spec fait foi : toute divergence constatée en cours de route est signalée **avant** codage.

## 2. Workflow d'un chantier

1. **Spec** — rédiger `documentation/specs/SPEC-<slug>-<date>.md` à partir du template [`templates/SPEC-chantier.md`](templates/SPEC-chantier.md). Marquer les incertitudes avec `[À CLARIFIER: question]`.
2. **Validation** — l'utilisateur valide la spec (décisions verrouillées). Aucun code sur `main` à ce stade.
3. **Branche** — créer `draft-<slug>` à partir de `main`.
4. **Plan** — remplir [`templates/PLAN-chantier.md`](templates/PLAN-chantier.md) (fichiers touchés, ordre de réalisation, risques).
5. **Implémentation** — coder sur la branche, en commençant par les tests de logique quand la logique évolue.
6. **Vérifications** — cocher [`templates/CHECKLIST-livraison.md`](templates/CHECKLIST-livraison.md) : `npx tsc -b` 0 erreur, batterie logique N/N, `npm run build`, CI verte, **diff vs `main` limité au périmètre déclaré**, aucune régression hors périmètre.
7. **PR** — ouvrir la PR depuis `draft-<slug>` avec la checklist cochée en description.
8. **Validation utilisateur** — retour chiffré (ex. 8/8) consigné dans le DEVLOG.
9. **Livraison** — merge dans `main`, tag de version, entrée DEVLOG, branche supprimée, propagation de `main` sur les branches de chantier actives.

## 3. Rôles des documents

| Document | Rôle |
|---|---|
| [`CONSTITUTION.md`](CONSTITUTION.md) | Règles non négociables du projet (inchangées sauf décision explicite documentée). |
| `documentation/specs/SPEC-*.md` | Spécification d'un chantier, validée avant codage. Fait foi. |
| `templates/PLAN-chantier.md` | Plan d'implémentation d'un chantier validé. |
| `templates/CHECKLIST-livraison.md` | Vérifications obligatoires avant merge d'une PR. |
| `DEVLOG.md` | Historique daté : décisions, livraisons, validations chiffrées, incidents. |

## 4. Règles de nommage

- Branche de chantier : `draft-<slug>` (ex. `draft-mod-armures`).
- Spec : `documentation/specs/SPEC-<SLUG>-<AAAA-MM-JJ>.md`.
- Version : `0.5.x` pour un incrémental, `0.6` pour un chantier majeur ou une rupture ; le choix est justifié dans le DEVLOG.
