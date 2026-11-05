# CHECKLIST — correctif mineur / chantier trivial (livré directement sur `main`)

À reprendre dans le message de commit ou dans l'entrée DEVLOG. Valable seulement si le changement est **trivial** au sens du [README §5](../README.md#5-chantiers-triviaux-et-corrections-mineures) ; sinon, utiliser la [checklist complète](CHECKLIST-livraison.md).

**Objet :** <une phrase>  **Fichiers touchés :** <liste, 3 maximum>

## Qualification (README §5)

- [ ] Comportement non ambigu, aucune décision de conception
- [ ] Ni scoring, ni modèle de données, ni données persistées, ni export/partage, ni appel Bungie
- [ ] Aucune UI validée déplacée/modifiée sans accord explicite de l'utilisateur
- [ ] Qualification « trivial » confirmée par l'utilisateur

## Vérifications (Articles III, IV, V)

- [ ] `npx tsc -b` : 0 erreur
- [ ] `npm run build` : OK
- [ ] `npm run test:logique` : vert (hors échec connu `icones.test.tsx`, Article III) — N/N : …
- [ ] Diff vs `main` relu avant push : limité aux fichiers annoncés
- [ ] CI GitHub Actions verte sur `main` après le push

## Traçabilité (Article VII)

- [ ] Entrée DEVLOG datée (objet, vérifications chiffrées)
- [ ] CHANGELOG.md mis à jour si visible par l'utilisateur
