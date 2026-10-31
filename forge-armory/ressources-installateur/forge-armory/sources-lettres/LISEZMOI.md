# Sources de lettres du générateur de boutons (13/10/2026, v0.4.4)

`selecteur/bouton-bibliotheque.svg` : l'ancien bouton « Bibliothèque » de l'utilisateur (archive de visuels v4), **conservé tel quel**. Il n'est plus dans l'archive depuis la v5 (le bouton s'appelle maintenant « Legendarium »), mais `scripts/generer-propositions-solo-forge.mjs` en lit les lettres (B, I, L, O, T, H, È, Q, U, E) pour mesurer son MODÈLE D'ESPACEMENT : le retirer changerait légèrement les boutons Forge et Inventaire fabriqués, que le test `tests/logique/reproductibilite-visuels.test.ts` vérifie octet pour octet.

Le générateur cherche d'abord un fichier source dans l'archive de référence (`app-assets/`), puis ici.
