# SPEC — <slug du chantier>

**Date :** AAAA-MM-JJ
**Statut :** brouillon → validée (l'utilisateur verrouille les décisions) — ce document fait foi une fois validée ; toute divergence doit être signalée **avant** codage.
**Branche prévue :** `draft-<slug>` (préparation uniquement — aucun code tant que la spec n'est pas validée)
**Version de l'appli à la rédaction :** X.Y.Z
**Version visée :** X.Y.Z (justifier le choix dans le DEVLOG à la livraison)

---

## 1. Objectif

Ce que le chantier apporte, en une phrase, du point de vue de l'utilisateur.

> Contexte : pourquoi ce chantier maintenant (lien TODO, retour utilisateur, dette technique).

## 2. Comportement attendu (verrouillé à la validation)

Décrire précisément ce que verra/fait l'utilisateur. Toute incertitude est notée :

- `[À CLARIFIER: question précise]` — ne pas deviner, poser la question avant codage.

## 3. Périmètre

### 3.1 Dans le périmètre (fichiers / fonctionnalités concernés)

- `src/...` : ...

### 3.2 Hors périmètre (explicite — règle anti-régression, Article V)

- RIEN d'autre que la liste 3.1 ne doit être modifié. Toute modification hors périmètre doit être justifiée par écrit dans la PR.
- Ne pas toucher : pages, composants, moteurs non listés en 3.1.

## 4. Règles métier et contraintes

- Contraintes Bungie (Article II) : aucune écriture chez Bungie / Phase 2 déclarée ici : ...
- Règles de scoring impactées : ...
- Persistance / migration de données : ...

## 5. Critères d'acceptation (testables)

1. ...
2. ...

Chaque critère doit être vérifiable par l'utilisateur ou par un test automatisé.

## 6. Vérifications requises (remplies à la livraison)

- [ ] `npx tsc -b` : 0 erreur
- [ ] `npm run test:logique` : N/N suites, M/M contrôles (préciser les suites ajoutées/modifiées)
- [ ] `npm run build` : OK
- [ ] CI GitHub Actions verte sur la PR
- [ ] Diff vs `main` limité au périmètre 3.1 (Article V)
- [ ] Validation utilisateur : X/X (à consigner dans le DEVLOG)
- [ ] Entrée DEVLOG rédigée

## 7. Risques et points d'attention

- ...
