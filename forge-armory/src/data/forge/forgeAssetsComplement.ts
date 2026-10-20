// FR : ⚠️ CHANGÉ (08/10/2026, v0.3.18) - le complément compte maintenant CINQ visuels (puis TROIS de plus en v0.4.0 pour l'onglet Forge, voir plus bas) : les deux titres fixes de Connexion et Manifest, et les TROIS cartes du Scoring renumérotées (« 1. Doctrine élémentaire », « 2. Armes et Armures », « 3. Artefact »),
// recomposées par `scripts/retoucher-visuels.mjs` ; les trois entrées correspondantes du catalogue généré (`1-element-doctrine`, `2-artefact`, `3-armes-armures`) sont REMPLACÉES : leurs fichiers sont supprimés de `public/assets/` (ils restent dans l'archive d'origine).
// FR : ⚠️ AJOUT (07/10/2026, v0.3.17) - COMPLÉMENT au catalogue généré `forgeAssets.ts` (qu'on ne modifie JAMAIS à la main : il est régénéré par l'auteur des visuels) : les deux titres FIXES, sans losange + / −,
// de « Connexion à Bungie » et « Recherche dans le Manifest ». Ces deux blocs ne sont pas repliables (retour de l'utilisateur du 07/10/2026) alors que l'archive actuelle ne leur donne que la version à deux états ;
// on reprend donc leur version sans losange, livrée avec l'archive précédente (`ressources-installateur/forge-armory/titres-complets/`), importée dans `public/assets/titres/` par `scripts/retoucher-visuels.mjs`.
// Même forme d'entrée que le catalogue ; cadre 7505 × 1024, comme la famille « titres ». Si l'auteur livre un jour ces deux titres dans son catalogue, ce fichier disparaît.
// EN: ⚠️ ADDED - supplement to the generated catalogue: the two STATIC (no +/- diamond) titles for Connexion and Manifest, which are not collapsible blocks.

import type { ForgeAsset } from "./forgeAssets";

export const FORGE_ASSETS_COMPLEMENT: readonly ForgeAsset[] = [
  { id: "titres.connexion.repos", famille: "titres", label: "Connexion à Bungie", etat: "repos", fichier: "assets/titres/titre-connexion.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40, format: "svg" },
  { id: "titres.manifest.repos", famille: "titres", label: "Recherche dans le Manifest", etat: "repos", fichier: "assets/titres/titre-manifest.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40, format: "svg" },
  { id: "titres.1-doctrine-elementaire.repos", famille: "titres", label: "1. Doctrine élémentaire", etat: "repos", fichier: "assets/titres/titre-1-doctrine-elementaire.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40, format: "svg" },
  { id: "titres.2-armes-armures.repos", famille: "titres", label: "2. Armes et Armures", etat: "repos", fichier: "assets/titres/titre-2-armes-armures.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40, format: "svg" },
  { id: "titres.3-artefact.repos", famille: "titres", label: "3. Artefact", etat: "repos", fichier: "assets/titres/titre-3-artefact.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40, format: "svg" },
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - onglet FORGE (logo VALIDÉ par l'utilisateur) : deux états du bouton du sélecteur (famille « selecteur », cadre 4316 × 1024, comme les trois autres) et l'icône seule. Sources : `ressources-installateur/forge-armory/forge-0.4.0/`.
  { id: "selecteur.forge.repos", famille: "selecteur", label: "Forge", etat: "repos", fichier: "assets/selecteur/bouton-forge.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40, format: "svg" },
  { id: "selecteur.forge.selectionne", famille: "selecteur", label: "Forge", etat: "selectionne", fichier: "assets/selecteur/bouton-forge-selectionne.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40, format: "svg" },
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - bouton INVENTAIRE du sélecteur (OPTION 2 choisie par l'utilisateur : un vrai bouton au format du sélecteur, plutôt que le titre repliable « Mon Inventaire » de Build Analyzer). Fabriqué par `scripts/generer-propositions-solo-forge.mjs` à partir du coffre de l'icône « Mon Inventaire » de l'utilisateur ; source : `ressources-installateur/forge-armory/inventaire-0.4.3/`. À BRANCHER après les tests de la 0.4.3 (demande de l'utilisateur) : le sous-menu « Collection » de la Forge prendra le bouton de l'archive v4, « Inventaire » celui-ci. EN: ⚠️ ADDED - Inventory selector button.
  { id: "selecteur.inventaire.repos", famille: "selecteur", label: "Inventaire", etat: "repos", fichier: "assets/selecteur/bouton-inventaire.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40, format: "svg" },
  { id: "selecteur.inventaire.selectionne", famille: "selecteur", label: "Inventaire", etat: "selectionne", fichier: "assets/selecteur/bouton-inventaire-selectionne.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40, format: "svg" },
  { id: "icones.forge", famille: "icones", label: "Forge", etat: null, fichier: "assets/icones/icone-forge.svg", largeur: 1024, hauteur: 1024, ratio: 1, hauteurMinPx: 24, format: "svg" },
  // FR : ⚠️ CHANGÉ (20/10/2026, v0.4.14) - le catalogue GÉNÉRÉ de l'archive v7 (`ressources-installateur/forge-armory/app-assets/forgeAssets.ts`, 77 actifs) couvre maintenant Carrière, Accomplissements, Armes et Armures : re pris TEL QUEL (règle du projet : jamais modifié à la main), le complément n'a donc plus à déclarer ces entrées. / EN: ⚠️ CHANGED - the v7 generated catalogue now covers Career/Accomplishments/Weapons/Armors; the supplement no longer declares them.
];

/**
 * FR : entrées du catalogue GÉNÉRÉ remplacées par le complément ci-dessus (08/10/2026) : leurs fichiers n'existent plus dans `public/assets/` et l'appli ne les demande plus. Le test des visuels vérifie qu'elles sont bien absentes du disque et inutilisées.
 * EN: generated-catalogue entries superseded by the supplement; their files no longer exist in public/assets.
 */
export const FORGE_ASSETS_REMPLACES: readonly string[] = ["titres.1-element-doctrine.repos", "titres.2-artefact.repos", "titres.3-armes-armures.repos"];
