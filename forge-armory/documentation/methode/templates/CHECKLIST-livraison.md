# CHECKLIST de livraison — <slug du chantier> (PR #<n>)

À cocher dans la description de la PR avant merge. Toute case non cochée bloque la livraison.

## Build et tests (Article IV, Article III)

- [ ] `npx tsc -b` : **0 erreur**
- [ ] `npm run test:logique` : **N/N suites, M/M contrôles** (suites ajoutées/modifiées : ...)
- [ ] `npm run build` : OK
- [ ] CI GitHub Actions : verte sur la PR

## Périmètre (Article V — anti-régression)

- [ ] `git diff origin/main...HEAD --stat` revu : le diff est **limité au périmètre déclaré** de la spec (section 3.1)
- [ ] Aucune modification hors périmètre, ou justification écrite dans la PR
- [ ] Aucun `stash` non résolu / conflit de merge laissé en l'état dans l'historique de la branche (incident du 28/10)
- [ ] Branche construite depuis un `main` à jour (pas de paquet/livrable sur une vieille base)
- [ ] Re-vérification ciblée des fichiers hors périmètre connus sensibles (ex. pages restaurées après incident : …)

## Spec (Article VI)

- [ ] Spec validée par l'utilisateur avant codage
- [ ] Aucun `[À CLARIFIER]` restant dans la spec
- [ ] Toute règle métier affirmée validée sur plusieurs exemplaires / données réelles (pas généralisée d'un seul cas)
- [ ] Aucune UI déjà validée par l'utilisateur déplacée/modifiée sans son accord explicite
- [ ] Comportement livré conforme aux critères d'acceptation de la spec (1 à N)

## Traçabilité (Article VII)

- [ ] Validation utilisateur chiffrée obtenue : **X/X** (détails dans le DEVLOG) — portant aussi sur le **logiciel installé**, pas seulement `npm run dev`
- [ ] Entrée DEVLOG rédigée (décision, contenu, vérifications chiffrées, validation, version, tag, branche supprimée, propagation)
- [ ] CHANGELOG.md mis à jour si changement visible par l'utilisateur
- [ ] Version choisie justifiée dans le DEVLOG ; tag posé après merge

## Données utilisateur (Article X)

- [ ] Aucun identifiant protecteur renommé (`name`/`appId` package.json, clés de stockage, dossier `%APPDATA%`)
- [ ] Aucun champ interne de simulation/fonctionnalité présent dans les builds enregistrés, exportés ou partagés

## Post-merge

- [ ] Branche `draft-<slug>` supprimée (jamais de force-push sur une branche de chantier sans re-vérification de `main` ensuite)
- [ ] `main` propagé sur les branches de chantier actives (note de propagation dans le DEVLOG), conflits résolus branche par branche
- [ ] Vérification que `main` contient bien tout le code livré (pas de commit orphelin perdu — incident du 24/10)
