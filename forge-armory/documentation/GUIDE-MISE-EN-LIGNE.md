# GUIDE — Mise en ligne de Forge Armory (site web)

> **État au 14/11/2026 : le site est EN LIGNE** à l'adresse **`https://forge-armory.orynick.fr`** (version 0.7.0).
> Ce guide conserve les pas-à-pas pour la reproductibilité : changement d'adresse, création d'une application Bungie, réglages Netlify. Il complète la spec `specs/SPEC-MOBILE-PHASE-0-2026-11-05.md` (annexe A).

## 1. Ce qui est déjà en place (ne pas refaire)

- **Dépôt GitHub** : `Orynick/Forge-Armory`, branche publiée `draft-pwa` (fusionnée vers `main` pour le déploiement).
- **Netlify** : projet importé depuis GitHub, dossier de base `forge-armory`, `netlify.toml` à la racine du dépôt (build, Node 24, redirection SPA « toute adresse inconnue renvoie l'appli », déploiements de branches neutralisés pour économiser les crédits).
- **Application Bungie « web »** : OAuth Public, adresse de retour `https://forge-armory.orynick.fr/auth/callback`, champ Origin Header = `https://forge-armory.orynick.fr`, mêmes autorisations que l'application du logiciel installé (lecture d'inventaire + Move/Equip).
- **Variables Netlify** : `VITE_BUNGIE_API_KEY`, `VITE_BUNGIE_CLIENT_ID`, `VITE_BUNGIE_REDIRECT_URI` (= l'adresse de retour), `VITE_LIEN_TELECHARGEMENT_PC` (bouton « Télécharger l'application »).
- **Clé API** : fournie par les réglages Netlify, jamais par le dépôt ; restreinte par le champ Origin Header (même approche que DIM). Elle reste lisible dans le code du site publié : elle identifie l'appli, ne donne accès à aucun compte (chaque visiteur se connecte avec SES identifiants Bungie).
- **Mode diagnostic** : réservé au compte du propriétaire sur le site ET dans le logiciel installé (`src/lib/proprietaire.ts`, constante `ID_COMPTE_BUNGIE_PROPRIETAIRE`).

## 2. Mettre le site à jour (déploiement)

1. Pousser les changements sur `main` (fusion de la branche de chantier).
2. Netlify reconstruit le site automatiquement — **sauf si les crédits de build sont épuisés** (recharge mensuelle ; constat du 14/11/2026). Dans ce cas, attendre la recharge ou relancer le déploiement depuis l'interface Netlify (« Deploys → Trigger deploy »).
3. Vérifier sur `https://forge-armory.orynick.fr` : rechargement de page sans page blanche, connexion Bungie, bouton « Charger le Manifest ».

## 3. Changer l'adresse du site (ex. nouveau domaine)

1. **Bungie** (bungie.net → Paramètres → Applications) : modifier l'application « web » — adresse de retour `https://<nouvelle adresse>/auth/callback` et Origin Header `https://<nouvelle adresse>`.
2. **Netlify** (réglages du site → Domain management) : ajouter le domaine ; mettre à jour `VITE_BUNGIE_REDIRECT_URI` dans les variables d'environnement.
3. Relancer un déploiement.

## 4. Créer une application Bungie supplémentaire (un environnement = une application)

1. bungie.net → Paramètres → Applications → **Créer une application**.
2. Type OAuth **Public** ; adresse de retour de l'environnement visé (`https://<adresse>/auth/callback` pour un site, `https://127.0.0.1:5173/auth/callback` pour le développement local) ; Origin Header = l'origine exacte.
3. Autorisations : lecture de l'inventaire ET « Move/Equip » (bouton « Appliquer en jeu »).
4. Noter la clé API et l'identifiant client, puis les mettre dans les variables d'environnement de l'environnement (Netlify pour un site, `.env.local` pour le développement/l'installateur).

## 5. Rappel sécurité

- La clé API et l'identifiant du propriétaire sont lisibles dans le code du site publié : ce ne sont pas des secrets (la clé ne donne accès à aucun compte ; l'identifiant Bungie figure déjà dans l'adresse publique du profil bungie.net). En cas d'abus de la clé : la régénérer sur le portail Bungie et remplacer la variable Netlify — le logiciel installé, qui a sa propre application Bungie, n'est pas touché.
- Aucune donnée d'utilisateur n'est stockée chez Netlify ; tout vit dans le navigateur de chaque visiteur (IndexedDB, localStorage).
