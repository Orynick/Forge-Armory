# SPEC — bot-discord

**Date :** 2026-11-22
**Statut :** brouillon — l'utilisateur verrouille les décisions (Article VI) ; aucun code tant que la spec n'est pas validée.
**Branche prévue :** `draft-bot-discord` (préparation uniquement — aucun code tant que la spec n'est pas validée)
**Version de l'appli à la rédaction :** 0.7.1
**Version visée :** le bot est un composant SÉPARÉ de l'appli (pas de bump de `forge-armory/package.json` pour le bot lui-même) — versionnage propre du dossier `bot-discord/` à décider (voir §8, point à trancher).

---

## 1. Objectif

Un **bot Discord compagnon de Forge Armory**, sur le modèle de Charlemagne : un utilisateur Discord lie son compte Bungie.net, et le bot peut alors lire son compte (profil, inventaire, coffre), calculer ses builds avec **le même moteur de scoring que l'appli**, afficher/partager des loadouts en embeds, et — en Phase 2 déclarée — appliquer un build en jeu.

> Contexte : demande de l'utilisateur du 22/11/2026 (« une appli Discord qui permette d'agir sur et avec Forge Armory, un peu comme Charlemagne ? »). Recherche préalable sur le fonctionnement de Charlemagne (§2). Ce chantier ne modifie PAS l'appli web/Electron : il réutilise sa logique.

## 2. Référence — comment fonctionne Charlemagne (recherche du 22/11/2026)

Charlemagne (warmind.io, par waterpolotrev67 et Tor_Kallon) n'est **pas open source**, mais son architecture est documentée publiquement :

- **Deux composantes : un bot Discord + un site web** (warmind.io) qui sert de portail d'authentification et de tableau de bord. Le bot et le site partagent une base de données serveur.
- **Liaison compte Bungie ↔ Discord** : historiquement `!register` dans Discord → le bot envoie en MP un **lien unique** vers warmind.io → l'utilisateur s'y authentifie auprès de **Bungie par OAuth** (l'appli web de Charlemagne est un client « confidentiel » Bungie : `client_secret` gardé côté serveur, jamais exposé) → le site enregistre le lien `discord_id ↔ membership Bungie` + les **tokens OAuth côté serveur**, dans sa BDD. Depuis 2021 le flux inverse existe aussi : `warmind.io/auth/discord` — on se connecte d'abord à Discord sur le site (OAuth Discord), puis on lie Bungie. Plus de commande Discord nécessaire.
- **Appels API** : le backend appelle l'API Bungie avec `X-API-Key` (clé d'app publique) + `Bearer` du token de l'utilisateur ; refresh token géré serveur. Les scopes demandés couvrent la lecture (profil, inventaire, coffre, vendeurs). La révocation se fait côté utilisateur sur la page « applications autorisées » de bungie.net (Charlemagne documente un `!unregister`).
- **Commandes** : préfixe `!` historiquement (`!register`, `!lfg`, `!stats`…), ~250 commandes aujourd'hui ; slash commands modernes en parallèle. Fonctions : stats PvP/PvE, leaderboards de serveur, LFG/événements planifiés, notifications (TWAB, Xur, vendeur…), autorôles (seals, statut d'enregistrement), synchro de clan.
- **Échelle** : > 12 000 serveurs, > 175 000 gardiens suivis → cache agressif, files d'attente et rate limiting côté serveur indispensables.
- **ToS** : Charlemagne n'interagit qu'avec l'API officielle Bungie (comme DIM) — aucune lecture du processus de jeu.

**Leçons retenues pour Forge Armory** : (1) séparer le bot du portail d'auth — le callback OAuth Bungie a besoin d'une URL publique servie par un petit serveur, pas du client local ; (2) client Bungie **confidentiel** pour le bot (secret serveur), distinct du client public de l'appli web ; (3) liaison par lien signé à usage unique (state), jamais de token en clair dans Discord ; (4) tokens chiffrés au repos, révocation possible ; (5) ne JAMAIS recopier la logique métier — l'importer.

## 3. Comportement attendu (verrouillé à la validation)

### 3.1 Sans compte lié (clé API publique seule)

- `/objet <nom>` : fiche d'un objet du Manifest (nom, type, perks possibles, icône) — lecture publique Bungie, aucune autorisation utilisateur.

### 3.2 Avec compte lié

- `/lier` : le bot répond en **MP** avec un lien signé à usage unique vers le portail d'auth du bot ; l'utilisateur y passe l'OAuth Bungie (et éventuellement l'OAuth Discord si le flux site-d'abord est retenu, §8) ; le bot confirme la liaison en public/ephemeral. `state` anti-CSRF obligatoire (même règle que `src/lib/bungie/oauth.ts`).
- `/délier` : supprime la liaison + les tokens chiffrés côté serveur (droit à l'oubli) ; rappelle que la révocation complète se fait aussi sur bungie.net.
- `/profil` : personnages, classes, niveau, saison — lecture Profile (components utilisés par l'appli).
- `/build [personnage]` : lit l'équipement réel du personnage, calcule le **score 5 piliers avec le moteur importé de `src/lib/scoring/`** et rend un embed (mêmes justifications lisibles que l'appli). Le score du bot DOIT être identique à celui de l'appli pour le même build (critère §6).
- `/loadouts` : liste les loadouts enregistrés côté bot (si rétention il y a — §8) ; `/partager <fichier JSON>` : ingère un export JSON de l'appli (`src/lib/loadouts/stockage.ts`) et rend un embed lisible (armes, armure, mods, score) + éventuellement l'export image de la fiche (`src/lib/loadouts/exportFiche.ts` produit du HTML autonome — rendu image côté bot à préciser, §8).
- `/appliquer <loadout> [personnage]` — **PHASE 2 (Article II)**, chantier séparé recommandé : applique un loadout en jeu via `TransferItem` → `EquipItem` → `InsertSocketPlugFree/` (`src/lib/bungie/equiper.ts`), avec **écran de confirmation listant chaque action**, un appel à la fois, arrêt au premier échec, jamais d'annulation automatique — mêmes garde-fous que `SPEC-MODS-PHASE-2-2026-11-03.md`.

- `[/À CLARIFIER: périmètre des commandes v1]` — §8 liste les candidats ; ne pas deviner.

## 4. Périmètre

### 4.1 Dans le périmètre (à créer)

- `bot-discord/` (nouveau dossier à la racine du dépôt, séparé de `forge-armory/`) : bot Node + TypeScript (discord.js ou discordeno — §8), mini-serveur HTTP pour le callback OAuth Bungie, stockage chiffré des tokens, cache Manifest.
- **Réutilisation par import** des modules existants de `forge-armory/src/lib/` (`scoring/`, `forge/`, `bungie/`, `loadouts/`, `manifest/`) — jamais de copie (sinon divergence garantie, leçon §2). Mécanisme exact à trancher (§8) : workspace npm / import relatif avec alias / sous-module. Contrainte : ces modules lisent `localStorage` / `import.meta.env` / `sql.js` côté client — la couche stockage/tokens doit être injectée (petite interface à ajouter dans `src/lib/bungie/oauth.ts` et `stockageSecurise.ts`, **modification minime de l'appli autorisée ici** et à lister explicitement dans la PR, Article V).
- `bot-discord/tests/` : tests logiques des adaptateurs (liaison, parsing des commandes, construction des embeds), même batterie `node` que l'appli.
- `documentation/specs/INDEX.md`, `TODO.md`, `DEVLOG.md` : suivi (ce commit).

### 4.2 Hors périmètre (explicite — Article V)

- RIEN d'autre dans `forge-armory/` ne doit être modifié, sauf l'injection minimale de la couche stockage/tokens listée en 4.1 et justifiée dans la PR.
- Ne pas toucher : moteur de scoring, Forge, Optimiseur, Legendarium, UI de l'appli, Electron, CI de l'appli (une CI séparée du bot est à prévoir dans `bot-discord/`, §8).
- Pas de bot hébergé publiquement en v1 (invite privée / serveur de clan) — §8.

## 5. Règles métier et contraintes

- **Article II (écriture Bungie)** : `/appliquer` est une **Phase 2 déclarée** — garde-fous identiques à SPEC-MODS-PHASE-2 : confirmation explicite listant chaque socket/objet, un appel par action, arrêt au premier échec avec `ErrorCode`/`Message` exacts, aucune annulation automatique. Le reste du bot est **lecture seule**.
- **Article X (protection des données)** : tokens OAuth chiffrés au repos (chiffrement symétrique, clé fournie par variable d'environnement, jamais dans le dépôt ni les logs) ; `state` de liaison signé et à usage unique ; aucun token ni donnée de compte dans les messages Discord (réponses éphémères quand sensible) ; `/délier` = suppression effective.
- **Contraintes Bungie** : nouvelle application Bungie **confidentielle** (client_secret serveur) pour le bot, redirect_uri = endpoint HTTPS du portail du bot ; la clé `X-API-Key` de l'appli peut être réutilisée ; scopes identiques à ceux déjà cochés pour l'appli (`MoveEquipDestinyItems` pour la Phase 2, lecture pour le reste) ; rate limits : cache + file d'attente, aucun polling.
- **Déterminisme (Article I)** : le score affiché par le bot provient du code importé, jamais d'un calcul de l'IA.
- **Persistance** : côté bot uniquement (BDD chiffrée ou fichiers chiffrés) ; l'appli web reste 100 % locale (localStorage/IndexedDB) — aucune migration à prévoir côté appli.
- **Hébergement** : un petit serveur Node (bot + callback OAuth) sur un VPS — contrairement à l'appli, ce composant n'est PAS déployable en statique Netlify. `[À CLARIFIER: hébergement choisi par l'utilisateur, §8]`.

## 6. Critères d'acceptation (testables)

1. `/lier` produit un lien à usage unique ; après OAuth Bungie, `/profil` répond avec les bons personnages du compte lié (vérifié sur le compte réel de l'utilisateur).
2. `/build` sur un personnage équipé rend un score **identique** à celui de l'appli web pour le même équipement (comparaison chiffrée consignée dans le DEVLOG) — test automatisé sur fixture : même entrée → même score (les suites `tests/logique/` existantes servent de oracle).
3. `/partager` avec un export JSON de l'appli rend un embed complet (armes/armure/mods/score) sans erreur ; un JSON invalide est rejeté avec un message clair.
4. `/délier` supprime la liaison : les commandes liées répondent « non lié » ; les tokens ne sont plus lisibles au repos (chiffrés).
5. Phase 2 (chantier séparé) : `/appliquer` sur un loadout teste applique réellement en jeu (validation utilisateur en jeu, comme mods-phase-2), avec confirmation listant chaque action.
6. `npx tsc -b` 0 erreur et batterie de tests logiques N/N **dans `bot-discord/`** ; CI verte de la PR (Article IV) ; l'appli `forge-armory/` reste 68/68 et build OK (non-régression, Article XII.4).

## 7. Vérifications requises (remplies à la livraison)

- [ ] `tsc -b` 0 erreur (appli ET bot)
- [ ] `npm run test:logique` N/N (appli, non-régression) + suites du bot N/N
- [ ] `npm run build` OK (appli)
- [ ] CI GitHub Actions verte sur la PR
- [ ] Diff vs `main` limité au périmètre 4.1 (Article V)
- [ ] Validation utilisateur chiffrée (Article IX)
- [ ] Entrée DEVLOG rédigée

## 8. Risques et points à trancher

- `[À CLARIFIER: nom du bot et de l'app Discord]` (ex. « Forge » / « Armory » — à choisir avec l'utilisateur).
- `[À CLARIFIER: Portail d'auth séparé (style warmind.io) ou callback directement dans le bot ?]` — recommandation : le même processus Node sert le callback OAuth et le gateway Discord (un seul déploiement), le lien `/lier` pointe vers ce processus. Un site dédié n'est utile que si l'on veut un tableau de bord web (hors v1).
- `[À CLARIFIER: flux de liaison]` — (a) `!register`-like : `/lier` → MP lien signé → OAuth Bungie (style Charlemagne historique) ; (b) site-d'abord : OAuth Discord puis Bungie (style warmind.io/auth/discord, plus robuste, mais deux OAuth). Recommandation : (a) en v1.
- `[À CLARIFIER: hébergement]` — VPS de l'utilisateur ? Coût nul requis en v1 (un seul serveur, quelques centaines d'utilisateurs max). **Aucune ressource sandbox/publique ne sera exposée pour ce chantier** : le déploiement réel se fera sur l'infrastructure de l'utilisateur, hors bac à sable.
- `[À CLARIFIER: stack]` — discord.js (écosystème mature) vs discordeno (léger). Recommandation : discord.js v14.
- `[À CLARIFIER: mécanisme d'import des modules appli]` — workspace npm, alias de build, ou package interne `forge-armory-lib` publié en privé. Recommandation : monorepo léger (workspace) sans rien publier.
- `[À CLARIFIER: commandes v1 prioritaires]` — candidats : `/lier /délier /profil /build /loadouts /partager /objet`, Phase 2 `/appliquer` en chantier séparé. LFG/événements/notifications (le cœur de Charlemagne) : **hors v1**, à réévaluer après.
- `[À CLARIFIER: rétention des loadouts côté bot]` — v1 : aucun stockage de loadouts côté serveur (le bot ne fait que lire le compte Bungie et afficher des fichiers passés en upload) ; stockage ultérieur chiffré si besoin.
- `[À CLARIFIER: rendu image des fiches]` — l'appli produit du HTML autonome (`exportFiche.ts`) capturé par Electron ; côté bot, rendu via un navigateur headless (Puppeteer) ou embed texte seul en v1. Recommandation : embed texte + icônes Bungie en v1, image en v2.
- **Risques** : fuite de tokens (mitigée par chiffrement + MP éphémères + `/délier`) ; abus du Phase 2 (mitigé par confirmation listée + un appel à la fois) ; divergence de logique (mitigée par l'import, jamais la copie) ; rate limits Bungie (cache + file) ; ToS : conforme, API officielle uniquement, comme DIM/Charlemagne.
