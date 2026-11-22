# Forge Armory

<img src="forge-armory/public/logo-forge-armory-texte.png" alt="Forge Armory" width="220">

[![Netlify Status](https://api.netlify.com/api/v1/badges/5ecc7eb8-1913-42c5-8a65-91dd0bd8472b/deploy-status)](https://app.netlify.com/projects/forge-armory/deploys)
[![Version](https://img.shields.io/github/v/release/Orynick/Forge-Armory?label=version)](https://github.com/Orynick/Forge-Armory/releases/latest)

*Destiny 2 Build Analyzer / Analyseur de Build*

Application web (React + Vite + TypeScript) — en ligne dans le navigateur ou installable sur Windows — pour étudier et scorer des builds Destiny 2.

Elle se connecte à votre compte **Bungie.net** (OAuth) pour lire votre inventaire et équiper vos builds en jeu.

- **Build Analyzer** : score de chaque build selon 5 piliers pondérés (système Armor 3.0), pondération par contexte (Neutre, PvE Roaming, PvE DPS, PvP) ou personnalisée — avec la **Doctrine** (sous-classe, super, aspects et fragments, capacité réelle en fragments).
- **Forge** : collection et inventaire des armes et armures (personnages et **Coffre**), simulation locale des perks et mods (prise en compte dans le score) et **écriture en jeu** — application réelle sur votre compte Bungie, pièce par pièce, derrière un écran de confirmation.
- **Optimiseur** : parcourt tout le compte (coffre + personnages) et propose les meilleurs ensembles d'armures par paliers, avec minimums de stats et choix de l'exotique.
- **Loadouts** : sauvegarde, export/import JSON (réimportable entre le site et l'appli installée), équipement en jeu — en ligne, un bandeau rappelle que les sauvegardes vivent dans le cache du navigateur.
- **Exports et partage** : fiche du build en JSON, texte, image (JPEG/PNG) ou PDF, dont l'**infographie** du build.
- **Liste de souhaits** : armes recherchées avec perks visés et type de pièce maîtresse, avec indication de possession (personnage / Coffre / jamais obtenue) — *à venir*.
- **Legendarium** : bibliothèque de Lore en lecture passive (Grimoire D1, Légendes D2, armes, armures, cosmétiques) — **fonction secondaire**, avec export infographique PNG.
- **Et aussi** : manifest et recherche bilingues **FR/EN** (français seul sur mobile), **Carrière** (statistiques du compte), **Accomplissements** (Triomphes groupés par sceau).

- **Version en ligne** : [`https://forge-armory.orynick.fr`](https://forge-armory.orynick.fr)
- **Installable Windows** : [télécharger la dernière version](https://github.com/Orynick/Forge-Armory/releases/latest) — nouveautés de chaque version dans le [CHANGELOG](forge-armory/CHANGELOG.md).

> **Avertissement Windows au premier lancement** : l'installateur n'est pas signé, Windows affiche donc « Windows a protégé votre ordinateur ». Cliquez sur **Informations complémentaires** puis **Exécuter quand même** (détails dans la [notice](forge-armory/NOTICE.md#à-savoir)).

Par Orynick/Orygamer.

## Confidentialité

- La connexion se fait sur la **page officielle de Bungie.net** : Forge Armory ne voit jamais votre mot de passe.
- Vos jetons de connexion et vos builds restent **sur votre appareil** (chiffrés par Windows dans l'appli installée, dans le stockage du navigateur pour la version en ligne).
- Forge Armory n'a **aucun serveur à lui** : l'appli échange directement avec Bungie.net, avec DIM uniquement si vous utilisez « Exporter vers DIM », et avec GitHub uniquement pour vérifier la version de données de jeu publiques (rien de personnel n'y est envoyé).

## Documentation

Le projet se trouve dans le dossier [`forge-armory/`](forge-armory/).

La documentation complète (installation, utilisation, historique des versions) est dans [`forge-armory/README.md`](forge-armory/README.md).

## Licence

Code distribué sous licence [GPL-3.0](LICENSE).

## Avertissement

Projet de fan, non officiel et non affilié à Bungie. Destiny 2 et ses contenus (noms, icônes, données de jeu) sont la propriété de Bungie.

---

## English

**Forge Armory** is a Destiny 2 build analyzer — available online or as a Windows app. Sign in with your **Bungie.net** account to score your builds across five weighted pillars, simulate weapon perks and armor mods (and apply them in game), optimize your armor stats, and save, share or equip your loadouts. Also includes the **Legendarium**, a Lore library (D1 Grimoire, D2 lore).

The interface is in French; item names and search work in French and English.

- Online: [`https://forge-armory.orynick.fr`](https://forge-armory.orynick.fr)
- Windows app: [latest release](https://github.com/Orynick/Forge-Armory/releases/latest)

*Unofficial fan project, not affiliated with Bungie. Full documentation (in French): [`forge-armory/README.md`](forge-armory/README.md).*
