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

## Article V — Périmètre déclaré, périmètre respecté

Chaque spec déclare son **périmètre** (fichiers/fonctionnalités concernés) et son **hors périmètre**. Avant merge, le diff vs `main` est vérifié : aucune modification hors périmètre déclaré sans justification écrite dans la PR. C'est la règle anti-régression (cf. incident du 28/10/2026, DEVLOG).

## Article VI — Spec validée avant codage

Aucun code n'est produit avant validation de la spec par l'utilisateur. Les incertitudes sont marquées `[À CLARIFIER: ...]` dans la spec et levées avant codage, pas supposées.

## Article VII — Traçabilité obligatoire

Chaque livraison laisse une trace : entrée DEVLOG datée (décision, vérifications chiffrées, validation utilisateur), entrée CHANGELOG si visible par l'utilisateur, tag de version, branche de chantier supprimée après merge.

## Article VIII — Simplicité

Pas de sur-architecture : pas d'abstraction nouvelle sans besoin avéré dans le chantier en cours. Un chantier touche le minimum de fichiers nécessaires. Toute complexité ajoutée doit être justifiée dans le plan.

## Article IX — Validation utilisateur chiffrée

Une livraison n'est bouclée que par un retour utilisateur chiffré (ex. « 8/8 »), consigné dans le DEVLOG. Les tests UI Playwright (`tests/ui/`) restent rejoués manuellement par l'utilisateur — ils ne tournent pas en CI.
