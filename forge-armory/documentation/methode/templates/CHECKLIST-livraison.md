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
- [ ] Re-vérification ciblée des fichiers hors périmètre connus sensibles (ex. pages restaurées après incident : …)

## Spec (Article VI)

- [ ] Spec validée par l'utilisateur avant codage
- [ ] Aucun `[À CLARIFIER]` restant dans la spec
- [ ] Comportement livré conforme aux critères d'acceptation de la spec (1 à N)

## Traçabilité (Article VII)

- [ ] Validation utilisateur chiffrée obtenue : **X/X** (détails dans le DEVLOG)
- [ ] Entrée DEVLOG rédigée (décision, contenu, vérifications chiffrées, validation, version, tag, branche supprimée, propagation)
- [ ] CHANGELOG.md mis à jour si changement visible par l'utilisateur
- [ ] Version choisie justifiée dans le DEVLOG ; tag posé après merge

## Post-merge

- [ ] Branche `draft-<slug>` supprimée
- [ ] `main` propagé sur les branches de chantier actives (note de propagation dans le DEVLOG)
