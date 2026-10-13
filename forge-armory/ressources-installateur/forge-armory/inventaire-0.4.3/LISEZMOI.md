# Bouton « Inventaire » du sélecteur (13/10/2026, v0.4.3)

Source de référence des deux fichiers `selecteur/bouton-inventaire.svg` et `selecteur/bouton-inventaire-selectionne.svg` (cadre 4316 × 1024, comme les autres boutons du sélecteur), copiés dans `public/assets/selecteur/`.

**Origine.** Option 2 choisie par l'utilisateur : un vrai bouton au format du sélecteur, plutôt que le titre repliable « Mon Inventaire » de Build Analyzer (environ 1,8 fois plus large, et dont les deux états ne diffèrent que par un petit losange). Ces fichiers ne viennent PAS de l'archive de visuels de l'utilisateur : ils sont fabriqués par `scripts/generer-propositions-solo-forge.mjs` (section « 4 bis »), comme le bouton Forge : bouton Loadouts de référence, **coffre repris tel quel de l'icône « Mon Inventaire »** de l'utilisateur (tracés et masques), mot « INVENTAIRE » composé avec **ses propres lettres** (modèle d'espacement mesuré dans ses fichiers), identifiants renommés.

**Régénérer** : `node scripts/generer-propositions-solo-forge.mjs --sortie <dossier>` ; le test `tests/logique/reproductibilite-visuels.test.ts` vérifie que le générateur redonne ces fichiers octet pour octet.

**Si l'auteur des visuels livre un jour son propre bouton Inventaire**, remplacer ces deux fichiers et retirer leurs deux entrées de `src/data/forge/forgeAssetsComplement.ts`.
