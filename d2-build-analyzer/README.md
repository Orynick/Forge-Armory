# D2 Build Analyzer

Appli locale (React + Vite + TypeScript) pour étudier et scorer des builds
Destiny 2 selon 5 piliers pondérés à 20% chacun, alignée sur le système
**Armor 3.0 / Monument of Triumph** (juin 2026).

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis remplissez avec votre clé API + client_id
npm run dev
```

Ouvrez http://localhost:5173.

## Obtenir votre clé API Bungie

⚠️ Bungie **exige du HTTPS** pour toute Redirect URL, même en local, et **refuse
`localhost`** (il faut l'adresse littérale `127.0.0.1`). C'est pour ça que le
projet lance son serveur de dev en HTTPS via `vite-plugin-mkcert` (déjà
configuré dans `vite.config.ts`) — rien à faire de votre côté à part accepter
l'installation du certificat local si votre système le demande au premier
lancement de `npm run dev`.

1. https://www.bungie.net/en/Application → **Create New App**
2. `OAuth Client Type` : **Public**
3. `Redirect URL` : `https://127.0.0.1:5173/auth/callback` (pas de `http`, pas de `localhost`)
4. Scopes : lecture Inventaire/Coffre + écriture Inventaire/Coffre
5. Copiez l'API Key et le client_id dans `.env.local`
6. Ouvrez l'appli sur **https://127.0.0.1:5173** (pas `localhost:5173`, sinon
   Bungie refusera la redirection car l'origine ne correspondra pas)

## État du scaffolding

| Bloc | État |
|---|---|
| Moteur de scoring 5 piliers | ✅ Fonctionnel (build de démo), testé en exécution réelle |
| Paliers de stats T1-T20 + exigences d'exotiques | ✅ Fonctionnel |
| Bonus de Set d'armure (Armor 3.0) intégrés au pilier 4 | ✅ Fonctionnel avec registre d'exemples — 🟡 à brancher sur le vrai Manifest (nom de table non confirmé) |
| Graphique en barres des 6 stats (pilier 5) | ✅ Fonctionnel, SVG pur sans dépendance |
| Recherche dans le Manifest (nom / plein texte) | ✅ Fonctionnel, insensible accents/casse |
| OAuth Bungie (login, refresh token) | ✅ Fonctionnel, à tester avec vos identifiants |
| Appels API profil/inventaire/coffre | ✅ Squelette, composants de base branchés |
| Import & parsing du Manifest (SQLite via sql.js) | ✅ Squelette, à valider en conditions réelles (~100 Mo) |
| Export vers DIM (loadout_share) | ✅ Squelette, à tester |
| Pilier 1 Élément & Doctrine | 🟡 Heuristique simple, à raffiner avec le Manifest |
| Pilier 2 Verbes d'Élément | 🔴 Stub (score fixe 50) — nécessite la table verbe→sources/payoffs |
| Pilier 3 Perks d'Artefact | 🟡 Heuristique simple (compte les perks) |
| UI / design | 🔴 Non commencé — squelette fonctionnel seulement |
| Croisement builds ↔ inventaire/coffre réels | 🔴 Non commencé |

## Journal des corrections

- **01/08/2026** : bug trouvé en testant le moteur de scoring — l'armure exotique
  était stockée dans un champ séparé (`exotiqueArmure`) et ses stats étaient donc
  exclues du calcul du pilier 5. Corrigé : l'exotique fait maintenant partie du
  tableau `armure` (5 pièces), comme en jeu.
- **01/08/2026** : deuxième bug trouvé en relisant `api.ts` — le code utilisait
  `membership_id` (renvoyé par l'OAuth) comme identifiant Destiny, alors que
  c'est l'identifiant du COMPTE BUNGIE.NET. Corrigé : un nouvel appel
  `GetMembershipsForCurrentUser` récupère d'abord les comptes Destiny liés
  (Steam/Xbox/PSN/Epic) avant tout appel Profile.
- **01/08/2026** : passe d'optimisation demandée par l'utilisateur —
  (1) le module wasm de sql.js n'est plus rechargé à chaque appel du
  Manifest (mis en cache pour la session) ; (2) ajout d'une fonction de
  lecture ciblée par hash (`obtenirDefinition`) pour éviter de charger des
  tables entières en mémoire pour un seul lookup ; (3) correction d'un piège
  classique de l'API Bungie — les hash sont stockés en SQLite comme des
  entiers 32 bits **signés**, alors que l'API les renvoie non signés (sans
  conversion, ~50% des recherches par hash échouent silencieusement) ;
  (4) les statistiques ne sont plus sommées deux fois (une fois par le
  moteur de scoring, une fois par le graphique) — le résultat du scoring
  inclut maintenant `statsTotales`, réutilisé tel quel par l'UI ;
  (5) mémorisation (`useMemo`) du calcul de score dans le tableau de bord,
  pour ne pas le refaire à chaque re-rendu (ex: pendant le test de connexion).
- **01/08/2026** : ajout d'un champ de recherche dans le Manifest — deux modes,
  "nom uniquement" (trouver un objet précis) et "partout" (nom, description,
  et tout texte de perk/aspect/fragment/perk d'artefact, puisqu'ils sont pour
  la plupart des entrées `DestinyInventoryItemDefinition` comme le reste).
  Recherche insensible aux accents et à la casse ("dévoration" trouve aussi
  "Devoration", "DÉVORATION"...). Le Manifest se charge à la demande (bouton
  dédié), pas au démarrage, pour ne pas télécharger ~100 Mo inutilement.

## Comment tester une fois connecté

1. Cliquez sur **Connexion Bungie.net**, autorisez l'accès sur la page Bungie.
2. De retour sur l'appli, le statut doit passer à **✅ connecté**.
3. Cliquez sur **Tester la connexion (profil + coffre)** : ça va chercher vos
   personnages (classe + lumière) et le nombre d'objets dans votre coffre, et
   les affiche directement. Si ça s'affiche, la connexion API fonctionne.
4. En cas d'erreur affichée, copiez le message et revenez me voir — la plupart
   des erreurs à ce stade viennent d'un scope OAuth mal coché sur bungie.net
   ou d'une clé API mal recopiée.

## Prochaines étapes suggérées

1. Tester la connexion OAuth avec votre vraie clé API.
2. Lancer un premier import du Manifest et vérifier le parsing des tables
   `DestinyInventoryItemDefinition` et `DestinySandboxPerkDefinition`.
3. Construire la table des verbes d'élément (Scorched, Jolt, Devour, Sever,
   Volatile, Unravel, Tangle, Slow/Freeze, Shatter...) à partir des textes de
   perks du Manifest, pour sortir le Pilier 2 du mode stub.
4. Confirmer le nom de la table Manifest pour les bonus de Set d'armure et
   remplacer le registre d'exemples (`DEMO_SETS` dans `armorSets.ts`) par les
   vraies données.
5. Écran de croisement Inventaire/Coffre : lister, pour un concept de build,
   quelles pièces sont déjà en possession vs manquantes.
