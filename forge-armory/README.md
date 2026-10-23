# Forge Armory

**Destiny 2 Build Analyzer** — par Orynick/Orygamer

Application pour étudier et scorer des builds Destiny 2 selon 5 piliers pondérés (les poids varient selon le contexte : Neutre, PvE Roaming, PvE DPS, PvP), alignée sur le système Armor 3.0. Elle se connecte à votre compte Bungie.net pour lire votre inventaire et équiper vos builds en jeu. Elle fonctionne dans le navigateur ou comme logiciel Windows installable.

> Projet de fan, non affilié à Bungie. Destiny 2 est une marque de Bungie, Inc.

## Fonctionnalités

- **Doctrine** : sous-classe, super, aspects et fragments, avec la capacité réelle en fragments.
- **Mon Inventaire et Coffre** : filtres, recherche, doublons, détails.
- **Manifest bilingue (FR/EN)** : recherche dans toutes les données du jeu.
- **Score en 5 piliers**, pondération par contexte ou personnalisée.
- **Loadouts** : sauvegarde, export/import, équipement en jeu.
- **Fiche du build et partage** : fichier JSON, texte, image (JPEG/PNG) et PDF.
- **Artefact** : sélecteur des perks avec leurs contraintes de tiers.
- **Forge** : simulation locale des perks d'armes et des mods d'armures (rien n'est modifié dans le jeu) — Collection (toutes les armes et armures du jeu, grisées si jamais obtenues) et Inventaire (vos exemplaires, simulation visible sur les statistiques et **le score, en temps réel**).
- **Saisons et sources** : saison de sortie en clair sur les objets, menu de filtre par source (Raid, Donjon, Trials, par activité…), crédits [d2-additional-info](https://github.com/DestinyItemManager/d2-additional-info) (MIT).
- **Legendarium** : bibliothèque de Lore en lecture passive (Grimoire D1, Légendes D2, armes, armures, cosmétiques), avec export infographique PNG.
- **Carrière** : page dédiée aux statistiques du compte (temps de jeu, 74+ stats traduites en français).
- **Accomplissements** : page dédiée aux Triomphes du compte, groupés par sceau (obtenus et à obtenir), avec recherche avancée.

## Démarrage rapide

1. `npm install`
2. Créez le fichier `.env.local` avec vos clés Bungie (pas à pas dans la [notice](NOTICE.md), étapes A à E).
3. `npm run dev`, puis ouvrez **https://127.0.0.1:5173**.

Logiciel Windows installable : `npm run electron:build` (détails dans la [notice](NOTICE.md)).

## Documentation

- [`NOTICE.md`](NOTICE.md) — mode d'emploi : installation, application Bungie, fonctionnalités, comprendre le score.
- [`CHANGELOG.md`](CHANGELOG.md) — changements visibles par version (pour les utilisateurs).
- [`DEVLOG.md`](DEVLOG.md) — historique complet du développement (décisions, détails techniques).
- [`TODO.md`](TODO.md) — ce qui reste à faire.

## Licence

Voir le fichier `LICENSE` du dépôt.
