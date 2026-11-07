# SPEC — mobile-phase-0

**Date :** 2026-11-05 (révisée trois fois le 05/11/2026 avec les réponses de l'utilisateur)
**Statut :** brouillon — en attente de validation par l'utilisateur. Tous les points à clarifier sont tranchés (§8). Aucun code tant qu'elle n'est pas validée (Constitution, Article VI ; consigne de l'utilisateur du 05/11/2026 : « pas de code pour le moment, on peaufine la SPEC »).
**Branche de travail :** `draft-pwa` (préparation uniquement — aucun code tant que la spec n'est pas validée)
**Branche publiée sur le site :** `draft-pwa` (tranché par l'utilisateur le 05/11/2026)
**Version de l'appli à la rédaction :** 0.6.1
**Version visée :** 0.6.2 (à confirmer à la livraison, justification dans le DEVLOG)

---

## 1. Objectif

Ouvrir Forge Armory sur un téléphone **Android**, depuis un site hébergé sur **Netlify**, connecté à Bungie, avec le **Manifest français seul** — pour **mesurer** si le téléphone tient la charge et **relever** ce qui déborde à l'écran, sans encore adapter l'affichage.

> Contexte : plan de mise en ligne du 05/10/2026 (GitHub → hébergement → compatibilité smartphone via PWA). Étude de faisabilité du 05/11/2026 (conversation) : chantier faisable sans réécriture, découpé en 5 phases (0 : prototype de mesure ; 1 : mise en ligne propre ; 2 : adaptation de l'affichage ; 3 : couche PWA ; 4 : Manifest allégé si les mesures l'exigent).
>
> Décisions de l'utilisateur du 05/11/2026 : téléphone de test **Android** ; hébergeur **Netlify** ; phase 0 sur l'**adresse gratuite de Netlify** (`orynick.fr` plus tard) ; sur téléphone, **Manifest français seul, sans option pour l'anglais** ; diagnostic mobile **uniquement en mode diagnostic, réservé à l'utilisateur**, par **liaison à son identifiant Bungie**, sur le site **et** dans le logiciel installé ; clé API **gérée comme DIM** (clé côté navigateur, restreinte par l'origine, une application Bungie par environnement) ; site construit depuis une **branche dédiée** : `draft-pwa`.
>
> Pourquoi une phase 0 : le seul vrai risque technique du chantier est la mémoire. Aujourd'hui l'appli garde **les deux Manifest (FR + EN, environ 100 Mo chacun) entièrement en mémoire**, plus un pic au premier téléchargement (archive + fichier décompressé + copie). On mesure avant d'investir dans l'adaptation de l'affichage.
>
> **Rôle exact du Manifest anglais (vérifié dans le code de la 0.6.1)** : il ne sert qu'à la **barre de recherche du Manifest** (`rechercherBilingue` et `diagnostiquerCorrespondances`, `src/lib/manifest/search.ts`) : retrouver un objet en tapant son nom ou son texte **anglais**, et afficher le **nom anglais** à côté du nom français dans les résultats. Le score des 5 piliers, la Doctrine, la Forge, l'Optimiseur, le Legendarium et les exports ne lisent **que** le Manifest français. Les recoupements FR/EN de la base de connaissances (`knowledge-base/`, patch notes) ne dépendent pas du Manifest et ne sont pas concernés. Sur téléphone, la seule perte est donc la recherche par nom anglais. Si elle devenait nécessaire, la solution prévue est un petit fichier « nom anglais → objet » généré à chaque mise à jour du jeu et publié avec le site (phase 4), **sans serveur** : un serveur qui hébergerait les Manifest n'éviterait pas le téléchargement vers le téléphone, et un serveur qui ferait les recherches à sa place serait coûteux à faire tourner et à entretenir (Article VIII).

## 2. Comportement attendu (verrouillé à la validation)

### 2.1 Le site

- Forge Armory est accessible dans le navigateur d'un téléphone à l'**adresse gratuite de Netlify** (de la forme `https://<nom choisi>.netlify.app`).
- Le site est construit automatiquement par Netlify à partir du dépôt GitHub, sur la **branche dédiée `draft-pwa`** (tranché par l'utilisateur, §8 n°6). Chaque push sur cette branche met le site à jour. `main` et le logiciel installé ne sont pas concernés.
- On peut **recharger la page** ou arriver directement sur n'importe quelle adresse du site (dont `/auth/callback`, au retour de Bungie) **sans page blanche**. Correction en cause : la version web est construite avec des chemins absolus (`/`) ; le logiciel installé garde ses chemins relatifs (`./`).

### 2.2 Connexion Bungie depuis le site

- Une **seconde application Bungie**, créée par l'utilisateur sur le portail Bungie (pas-à-pas en annexe A), sert au site. La première (adresse `https://127.0.0.1:5173`) reste celle du logiciel installé et de `npm run dev` : **rien ne change pour eux**.
- La seconde application coche **les mêmes autorisations** que la première (lecture de l'inventaire ET « Move/Equip » pour le bouton « Appliquer en jeu »).
- Sa clé API est fournie au site par les réglages de Netlify, **jamais par le dépôt** (condition de l'utilisateur du 28/09/2026 respectée). Elle sera en revanche **lisible dans le code du site publié** (voir §7, « Clé API visible ») ; elle est restreinte à l'adresse du site par le champ « Origin Header » du portail Bungie.
- **Décision du 05/11/2026 : on se cale sur le retour d'expérience de DIM.** DIM tourne lui aussi entièrement dans le navigateur, avec une clé Bungie restreinte par le champ « Origin Header », une connexion par OAuth Bungie (aucun identifiant demandé à l'utilisateur), et une clé distincte par environnement (sa documentation fait créer à chaque développeur sa propre application Bungie, limitée à son adresse locale). Transposé ici : une application Bungie pour le logiciel installé et `npm run dev` (existante), une pour le site (nouvelle), et plus tard une par adresse supplémentaire si besoin (ex. `orynick.fr`, ou une adresse de prévisualisation).

### 2.3 Connexion durcie dans le navigateur

- Aujourd'hui, dans un navigateur, si le code de vérification de la connexion (protection anti-usurpation) est **introuvable** au retour de Bungie, la connexion est acceptée quand même. Ce choix ne convient pas à un site public.
- Désormais, dans un navigateur (site **et** `npm run dev`), un code introuvable **refuse** la connexion avec le message existant « État OAuth invalide ou expiré. Relancez la connexion. ». Le logiciel installé refusait déjà ce cas : inchangé.
- Effet de bord assumé : commencer la connexion dans un onglet et la terminer dans un autre échoue (il suffit de relancer la connexion).

### 2.4 Manifest sur téléphone : français seul

- **Détection « téléphone »** : le navigateur se déclare mobile (information fournie par Chrome sur Android) ; à défaut, écran tactile comme pointeur principal **et** largeur d'écran ≤ 900 px. Un PC (site ou logiciel installé) n'est jamais concerné.
- Sur téléphone :
  1. le bouton « Charger le Manifest » télécharge **le français seul** (message : environ 100 Mo) ;
  2. au lancement suivant, si le français est **à jour** en cache, il est **chargé automatiquement** (aujourd'hui, le chargement automatique exige FR **et** EN à jour : sans ce changement, le téléphone redemanderait un clic à chaque visite) ;
  3. si le français est **périmé** (nouvelle version publiée par Bungie), il est retéléchargé automatiquement, comme sur PC ;
  4. l'anglais n'est **jamais** téléchargé ni proposé sur téléphone (décision du 05/11/2026 : pas de bouton « Ajouter l'anglais »). La recherche affiche le message existant « Manifest anglais non chargé — recherche en français uniquement pour l'instant. »
- Sur PC (site ou logiciel installé) : **comportement inchangé**, FR + EN.

### 2.5 Diagnostic mobile (provisoire)

Un diagnostic, visible **uniquement quand le mode diagnostic est activé** (et donc, sur le site, uniquement pour l'utilisateur : §2.6), affiche dans le bloc Manifest :

- « téléphone détecté : oui/non » et la largeur d'écran ;
- la mémoire annoncée par le téléphone (arrondie par Chrome, par exemple « 8 Go ») ;
- l'espace de stockage utilisé et disponible pour le site, et si ce stockage est protégé contre l'effacement automatique (« persistant : oui/non ») ;
- la **durée de chaque étape** du dernier chargement du Manifest : téléchargement, décompression, ouverture, indexation ;
- un bouton **« Copier »** qui copie le tout en texte, pour le coller dans la conversation.

Il est inscrit au registre `src/lib/diagnosticsArchives.ts` et sera archivé à la fin du chantier, comme les diagnostics précédents.

### 2.6 Mode diagnostic réservé à l'utilisateur (site et logiciel installé)

Aujourd'hui, dans l'appli construite (logiciel installé), **n'importe qui** peut activer le mode diagnostic par le lien du pied de page. Sur un site public, ce serait le cas de tout visiteur. Décisions du 05/11/2026 : l'utilisateur doit être le seul à pouvoir l'utiliser, **sur le site comme dans le logiciel installé** (« les utilisateurs autres que moi n'ont pas besoin des diagnostics »).

- Sur le site **et dans le logiciel installé**, le lien « 🔧 Outils de diagnostic » du pied de page et **tous** les outils du mode diagnostic (pas seulement le diagnostic mobile) ne sont disponibles **que si le compte Bungie connecté est celui de l'utilisateur**. Son identifiant Bungie est fourni par la variable `VITE_ID_BUNGIE_PROPRIETAIRE`, jamais par le dépôt : dans les réglages Netlify pour le site, dans le `.env.local` de l'utilisateur pour le logiciel installé (lu au moment où l'installateur est fabriqué). L'identifiant du compte connecté est déjà conservé avec la connexion (`lireTokens`, lecture immédiate, aussi dans le logiciel installé) : aucun appel Bungie supplémentaire.
- Visiteur non connecté ou connecté avec un autre compte : aucun lien, aucun outil ; un mode diagnostic resté mémorisé dans son navigateur est ignoré.
- Variable absente ou vide : le mode diagnostic est **fermé à tous**, y compris à l'utilisateur (on ne l'ouvre jamais par défaut). Conséquence pratique : avant de fabriquer un installateur, l'utilisateur ajoute la variable à son `.env.local` (pas-à-pas dans le guide et `.env.example`).
- Connexion et déconnexion : le lien apparaît ou disparaît aussitôt, sans recharger la page.
- Les amis qui ont déjà activé le mode dans leur logiciel installé : ce réglage mémorisé est ignoré (la clé de stockage `d2ba.modeDiagnostic` n'est ni renommée ni effacée, Article X).
- Limite assumée (voir §7) : c'est un **masquage**, pas un coffre-fort. Les outils de diagnostic ne montrent que les données du compte connecté : un visiteur qui forcerait le mode dans son propre navigateur ne verrait que ses propres données, jamais celles de l'utilisateur.
- Mécanisme **validé par l'utilisateur le 05/11/2026**, étendu au logiciel installé le même jour.
- `npm run dev` : inchangé (outils de diagnostic toujours actifs, c'est l'environnement de développement).
- Aucune modification de `electron/` : la règle est dans `src/lib/modeDiagnostic.ts`, commune au site et au logiciel.

### 2.7 Affichage

**Aucune adaptation de l'affichage dans cette phase.** L'utilisateur relève ce qui déborde ou se lit mal (liste guidée dans le A-TESTER), ce qui alimentera la spec de la phase 2.

## 3. Périmètre

### 3.1 Dans le périmètre (fichiers / fonctionnalités concernés)

- `vite.config.ts` : chemins absolus pour la version web (variable `FORGE_CIBLE=web`), relatifs sinon (inchangé pour le logiciel installé).
- `netlify.toml` (nouveau, dans `forge-armory/`) : commande de construction, Node 24, variable `FORGE_CIBLE=web`, règle « toute adresse inconnue renvoie l'appli » (nécessaire au retour de connexion et au rechargement).
- `src/lib/bungie/oauth.ts` : `validerEtatOAuth` refuse un code absent, aussi dans le navigateur (§2.3).
- `src/lib/appareil.ts` (nouveau, quelques lignes) : `estTelephone()` (§2.4). Fichier séparé justifié : la détection sert au Manifest et au diagnostic, et doit être testable seule.
- `src/lib/manifest/demarrage.ts` : décision de démarrage en mode « français seul » (§2.4, points 2 à 4).
- `src/lib/manifest/download.ts` : relevé des durées d'étapes du chargement (§2.5), sans changer ce qui est téléchargé ni la façon de le stocker.
- `src/components/RechercheManifest.tsx` : langues chargées selon l'appareil, message « environ 100 Mo », affichage du diagnostic mobile.
- `src/lib/modeDiagnostic.ts` et `src/components/InterrupteurModeDiagnostic.tsx` : réservation du mode diagnostic sur le site (§2.6).
- `src/vite-env.d.ts` : déclaration de la variable `VITE_ID_BUNGIE_PROPRIETAIRE`.
- `src/lib/diagnosticsArchives.ts` : inscription du diagnostic mobile.
- Tests (Article III) : `tests/logique/demarrage-manifest.test.ts` (complété : mode français seul), nouveau `tests/logique/appareil.test.ts`, nouveau `tests/logique/oauth-etat.test.ts` (code absent refusé dans les deux modes), nouveau `tests/logique/mode-diagnostic-reserve.test.ts` (compte propriétaire / autre compte / non connecté / variable absente / réglage mémorisé ignoré), contrôle de câblage de la version web (`base` selon `FORGE_CIBLE`, `netlify.toml` présent et cohérent).
- Documentation : `documentation/GUIDE-MISE-EN-LIGNE.md` (nouveau, pas-à-pas Bungie + Netlify de l'annexe A, détaillé), `.env.example` (la nouvelle variable, commentée : à remplir avant de fabriquer l'installateur), `CHANGELOG.md`, `DEVLOG.md`, `TODO.md`, `README.md` (une ligne : le site existe), `documentation/specs/INDEX.md`, `A-TESTER-0.6.2.pdf` (+ source dans `documentation/sources/`).

### 3.2 Hors périmètre (explicite — règle anti-régression, Article V)

- RIEN d'autre que la liste 3.1 ne doit être modifié. Toute modification hors périmètre doit être justifiée par écrit dans la PR.
- **Pas d'adaptation de l'affichage** (phase 2), même pour un débordement évident.
- **Pas de couche PWA** : ni fiche d'application, ni service worker, ni icônes d'installation (phase 3).
- **Pas d'allègement du Manifest** au-delà du « français seul » (phase 4, seulement si les mesures l'exigent) ; pas de serveur.
- Pas d'export PNG/PDF de fiche dans le navigateur (reste réservé au logiciel installé).
- Logiciel installé (`electron/`) : **aucune modification**.
- Nom de domaine `orynick.fr` : phase 1.
- Branche `test` : non utilisée par ce chantier (décision du 05/11/2026 : branche dédiée).
- iPhone : non visé (décision du 05/11/2026 : Android).

## 4. Règles métier et contraintes

- **Article II (écriture chez Bungie)** : ce chantier n'ajoute **aucune** écriture. Le bouton « Appliquer en jeu » (Phase 2 déjà livrée en 0.6.0) fonctionnera sur le site si la seconde application Bungie a l'autorisation « Move/Equip » ; il n'est ni modifié ni étendu. Il agit toujours sur le compte **du visiteur connecté**.
- **Article X (données)** : aucune clé de stockage renommée (dont `d2ba.modeDiagnostic`) ; le cache du Manifest garde ses noms actuels. Un cache « français seul » est déjà un état prévu par le code (l'anglais « absent »). Rien n'est ajouté aux builds enregistrés, exportés ou partagés.
- **Scoring** : non touché (il ne lit que le Manifest français, voir §1).
- **Sécurité** : la politique de sécurité du contenu (CSP) actuelle est conservée telle quelle ; elle autorise déjà bungie.net, DIM et GitHub.

## 5. Critères d'acceptation (testables)

Sur le téléphone Android, à l'adresse du site :

1. Le site s'ouvre et affiche l'appli.
2. Recharger la page, sur l'accueil comme après la connexion, n'affiche jamais de page blanche.
3. La connexion Bungie aboutit et le personnage est chargé.
4. Le bouton « Charger le Manifest » télécharge le **français seul** ; l'état affiche « ✅ FR chargé » ; une recherche en français donne des résultats ; aucun bouton ni téléchargement de l'anglais n'apparaît.
5. Après fermeture et réouverture du site, le français est **rechargé automatiquement** depuis le cache, sans nouveau téléchargement.
6. L'analyse d'un build va au bout **sans que l'onglet se ferme ou se recharge tout seul**.
7. Non connecté : le lien « 🔧 Outils de diagnostic » est absent du pied de page.
8. Connecté avec le compte de l'utilisateur : le lien est présent ; une fois le mode activé, le diagnostic mobile affiche ses mesures et « Copier » les place dans le presse-papiers.
9. Relevé d'affichage rempli (liste guidée du A-TESTER) — observation, pas un critère de réussite.

Sur PC :

10. Logiciel installé : connexion, chargement FR + EN au démarrage, analyse, export PNG/PDF — inchangés.
10 bis. Logiciel installé fabriqué avec la variable : déconnecté, le lien « 🔧 Outils de diagnostic » est absent ; connecté avec le compte de l'utilisateur, il est présent et les outils fonctionnent comme avant.
11. `npm run dev` : connexion, chargement FR + EN et outils de diagnostic toujours actifs — inchangés.

Automatisés :

12. Un code de vérification absent est refusé, dans le navigateur comme dans le logiciel installé.
13. La décision de démarrage en mode « français seul » couvre les cas : FR à jour, FR périmé, FR absent, état inconnu ; et le mode PC reste identique aux contrôles existants.
14. Le mode diagnostic réservé couvre les cas : compte propriétaire, autre compte, non connecté, variable absente, réglage mémorisé chez un autre compte, mode développement toujours actif.

## 6. Vérifications requises (remplies à la livraison)

- [ ] `npx tsc -b` : 0 erreur
- [ ] `npm run test:logique` : N/N suites, M/M contrôles (préciser les suites ajoutées/modifiées ; exception connue de l'Article III)
- [ ] `npm run build` : OK, **et** construction web (`FORGE_CIBLE=web`) : OK, chemins absolus vérifiés dans `dist/index.html`
- [ ] CI GitHub Actions verte sur la PR
- [ ] Diff vs `main` limité au périmètre 3.1 (Article V)
- [ ] Déploiement Netlify réussi depuis la branche dédiée
- [ ] Validation utilisateur : X/X (à consigner dans le DEVLOG)
- [ ] Entrée DEVLOG rédigée

## 7. Risques et points d'attention

- **Mémoire du téléphone** : c'est l'objet de la mesure. Si l'onglet se ferme même en français seul, la phase 4 (Manifest allégé) remonte avant la phase 2.
- **Clé API visible** : le site est un programme envoyé au navigateur de chaque visiteur ; pour parler à Bungie, ce navigateur doit présenter la clé, donc un visiteur curieux peut la lire (outils de développement du navigateur). C'est déjà le cas, en plus discret, de la clé embarquée dans le logiciel installé partagé avec les amis. La clé **identifie l'appli** auprès de Bungie ; elle **ne donne accès à aucun compte** (chaque visiteur doit se connecter avec ses propres identifiants Bungie et ne voit que ses données). Risque réel : quelqu'un la réutilise dans son propre programme ; si c'est abusif, Bungie peut limiter ou désactiver la clé. Parades : le champ « Origin Header » bloque la réutilisation depuis un autre **site** (pas un programmeur déterminé hors navigateur) ; en cas de problème, on régénère une clé sur le portail Bungie et on remplace la variable Netlify (quelques minutes) ; la seconde application isole le logiciel installé, qui n'est pas touché si la clé du site est révoquée. C'est le fonctionnement de toutes les applis Bungie en ligne (DIM et les autres).
- **Mode diagnostic réservé** : masquage, pas coffre-fort (§2.6). L'identifiant Bungie de l'utilisateur sera lui aussi lisible dans le code du site ; ce n'est pas un secret (il figure déjà dans l'adresse publique de son profil bungie.net) et il ne donne accès à rien.
- **Effacement des données** : Chrome sur Android peut effacer le cache d'un site peu visité quand le téléphone manque de place ; le diagnostic indique si le stockage est protégé. L'installation en PWA (phase 3) améliore ce point.
- **Données mobiles** : le premier téléchargement pèse plusieurs dizaines de Mo ; à faire en Wi-Fi.
- **Adresse publique** : n'importe qui connaissant l'adresse peut ouvrir le site ; chacun se connecte alors avec **son** compte Bungie et ne voit que **ses** données. Aucune donnée de l'utilisateur n'est stockée chez Netlify.
- **Une seule adresse de retour par application Bungie** : d'où la seconde application, plutôt que de modifier la première (ce qui casserait le logiciel installé).
- **Changement d'adresse plus tard** (passage à `orynick.fr`) : il suffira de modifier l'adresse de retour et l'origine de la seconde application Bungie, et une variable Netlify.

## 8. Points à clarifier avant codage

Tranchés le 05/11/2026 : n°1 Netlify ✅ ; n°2 adresse gratuite de Netlify d'abord, `orynick.fr` ensuite ✅ ; n°3 clé API gérée comme DIM ✅ (§2.2) ; n°4 pas d'anglais sur téléphone, pas de bouton ✅ ; diagnostic mobile uniquement en mode diagnostic ✅ ; n°5 mode diagnostic lié à l'identifiant Bungie de l'utilisateur, sur le site **et** dans le logiciel installé ✅ (§2.6).

6. **Tranché le 05/11/2026 : la branche publiée sur le site est `draft-pwa`** (elle sert aussi de branche de travail pour la préparation de la SPEC).

---

## Annexe A — Étapes à faire par l'utilisateur (résumé)

Le détail, écran par écran, sera dans `documentation/GUIDE-MISE-EN-LIGNE.md` livré avec le chantier. L'ordre compte, car Bungie a besoin de l'adresse du site, et le site a besoin des codes Bungie.

1. **Netlify** : créer un compte (connexion avec GitHub), « Importer un projet existant », choisir le dépôt `Orynick/Forge-Armory`, **la branche dédiée `draft-pwa`**, **dossier de base `forge-armory`**. Choisir le nom du site : il donne l'adresse (ex. `https://forge-armory.netlify.app`). Le premier déploiement échouera ou affichera une erreur de clé : normal, les codes Bungie manquent encore.
2. **Bungie** (bungie.net → Paramètres → Applications → Créer une application) : nom (ex. « Forge Armory Web »), type OAuth **Public**, adresse de retour `https://<adresse du site>/auth/callback`, mêmes autorisations que la première application, champ **Origin Header** = `https://<adresse du site>`. Noter la clé API et l'identifiant client (OAuth client_id).
3. **Ton identifiant Bungie** : relevé dans l'adresse de ton profil bungie.net (le guide montrera où).
4. **Ton `.env.local`** (pour le logiciel installé) : ajouter la ligne `VITE_ID_BUNGIE_PROPRIETAIRE=` suivie de ton identifiant (point 3), avant de fabriquer le prochain installateur.
5. **Netlify**, réglages du site → variables d'environnement : `VITE_BUNGIE_API_KEY`, `VITE_BUNGIE_CLIENT_ID`, `VITE_BUNGIE_REDIRECT_URI` (= l'adresse de retour du point 2), `VITE_ID_BUNGIE_PROPRIETAIRE` (point 3). Relancer un déploiement.
6. Sur le téléphone, en Wi-Fi : ouvrir l'adresse dans Chrome et dérouler le A-TESTER.
