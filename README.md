# Forge Armory

<img src="forge-armory/public/logo-forge-armory-texte.png" alt="Forge Armory" width="220">

[![Netlify Status](https://api.netlify.com/api/v1/badges/5ecc7eb8-1913-42c5-8a65-91dd0bd8472b/deploy-status)](https://app.netlify.com/projects/forge-armory/deploys)

*Destiny 2 Build Analyzer / Analyseur de Build*

Application web (React + Vite + TypeScript) — en ligne dans le navigateur ou installable sur Windows — pour étudier et scorer des builds Destiny 2.

Elle se connecte à votre compte **Bungie.net** (OAuth) pour lire votre inventaire et équiper vos builds en jeu.

- **Build Analyzer** : score de chaque build selon 5 piliers pondérés (système Armor 3.0), pondération par contexte (Neutre, PvE Roaming, PvE DPS, PvP) ou personnalisée.
- **Forge** : simulation locale des perks et mods (prise en compte dans le score) et **écriture en jeu** — application réelle sur votre compte Bungie, pièce par pièce, derrière un écran de confirmation.
- **Optimiseur** : parcourt tout le compte (coffre + personnages) et propose les meilleurs ensembles d'armures par paliers, avec minimums de stats et choix de l'exotique.
- **Loadouts** : sauvegarde, export/import JSON (réimportable entre le site et l'appli installée), équipement en jeu — en ligne, un bandeau rappelle que les sauvegardes vivent dans le cache du navigateur.
- **Legendarium** : bibliothèque de Lore en lecture passive (Grimoire D1, Légendes D2, armes, armures, cosmétiques) — **fonction secondaire**, avec export infographique PNG.

Version en ligne : [`https://forge-armory.orynick.fr`](https://forge-armory.orynick.fr)

Par Orynick/Orygamer.

## Documentation

Le projet se trouve dans le dossier [`forge-armory/`](forge-armory/).
La documentation complète (installation, utilisation, historique des versions) est dans [`forge-armory/README.md`](forge-armory/README.md).

## Licence

Code distribué sous licence [GPL-3.0](LICENSE).

## Avertissement

Projet de fan, non officiel et non affilié à Bungie. Destiny 2 et ses contenus (noms, icônes, données de jeu) sont la propriété de Bungie.

---

*Unofficial fan project for Destiny 2. Full documentation: [`forge-armory/README.md`](forge-armory/README.md).*
