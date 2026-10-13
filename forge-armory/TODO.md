# TODO — D2 Build Analyzer

Priorités :
- 🔴 **Bloquant** — fausse le résultat ou empêche d'avancer
- 🟡 **Important** — limite la valeur de l'appli
- 🔵 **Confort / plus tard**

Ce fichier ne liste que ce qui **reste à faire**. Ce qui est terminé est
décrit dans `CHANGELOG.md` (avec les explications de chaque changement) ;
l'état complet de la TODO avant son tri du 30/09/2026 est conservé mot
pour mot dans `documentation/todo/ARCHIVE-TODO-2026-09-30.md`, et les
passages retirés ou condensés lors du nettoyage du 06/10/2026 dans
`documentation/todo/ARCHIVE-TODO-2026-10-06.md`. Conception du scoring :
section « Le scoring » de `NOTES-CONCEPTION.md`. Tests en cours :
`A-TESTER-<version>.pdf` (le numéro de version de l'appli est dans le nom ;
version courante : 0.4.7).

---

## 🧭 Prochaines étapes — mises à jour le 12/10/2026

L'ordre de marche fixé par l'utilisateur le 30/09/2026 est **accompli**
pour ses deux premières étapes : v0.2.9 validée ; Electron mis à niveau
(44.5.1, livré en v0.3.0) et validé (PDF de tests renvoyé le 02/10/2026).
Le renommage « Forge Armory » est lui aussi validé (06/10/2026, section 12).

À partir d'ici :

1. **Valider la 0.4.7** (`A-TESTER-0.4.7.pdf`, 6 tests : installation et les **quatre niveaux de perks** de l'Inventaire de la Forge, avec un diagnostic à m'envoyer pour contrôler la donnée de Bungie sur son compte). La 0.4.6 est entièrement validée (9 tests sur 9, validation déclarée, 109 sections archivées). **À fournir par l'utilisateur** : le logo « Solo sans mourir » (« on y reviendra »).
2. **Feuille de route issue du fichier « Retours et ajouts du 12/10 »** (dans cet ordre, sauf avis contraire) :
   - **0.4.2 — bouton « Transférer vers »** ✅ **livré et validé le 12/10/2026, essais en jeu compris**. Règles retenues : objet équipé non transférable, confirmation, un objet à la fois. **Pistes pour plus tard** (non faites) : transférer plusieurs objets d'un coup ; équiper automatiquement un remplaçant pour libérer un objet équipé (logique déjà présente dans `equiper.ts`) ; une armure vers un personnage d'une autre classe n'est volontairement pas proposée. Description d'origine : (Mon Inventaire et Coffre → Chasseur, Titan, Arcaniste, Coffre). Faisable : `TransferItem` et `EquipItem` existent (`lib/bungie/equiper.ts`) et la permission d'écriture est déjà demandée. À cadrer : un transfert entre deux personnages passe par le Coffre (deux appels) ; un objet équipé ne peut pas être transféré sans équiper un remplaçant ; erreurs de place (inventaire plein) à expliquer ; confirmation avant d'agir. Ne se teste vraiment qu'en jeu.
   - ~~Décisions à prendre avant de commencer « Transférer vers »~~ (prises le 12/10/2026 : mes trois recommandations ont été retenues) (recommandation entre parenthèses) : (1) un objet **équipé** : le bloquer avec une explication, ou équiper automatiquement un remplaçant (bloquer en première version : plus sûr, rien ne bouge dans l'équipement sans que l'utilisateur l'ait décidé) ; (2) **confirmation** avant chaque transfert (oui, au moins pour un transfert entre deux personnages qui passe par le Coffre) ; (3) transférer **un objet à la fois** en première version (oui).
   - **0.4.3 et suivantes — contenu de l'onglet Forge** : (a) toutes les armes et armures du jeu avec leurs rolls de perks, sans les perks inutiles ; (b) armes et armures possédées, rolls possibles, perks actifs de l'arme et mod d'arme. **Reprend l'ancien chantier « Modification des perks et des mods » (section 2).**
   - **Forge : spécification reçue le 13/10/2026** (document daté du 12/10/2026, recopié dans `NOTES-CONCEPTION.md`, section « Spécifications de la Forge », avec mon analyse). **Phase 1 = simulation locale** (aucune écriture chez Bungie, la Forge n'écrit rien) ; **Phase 2 = application réelle**, après validation complète de la Phase 1. **Découpage proposé** : (0.4.3) **Collection des armes**, lecture seule : liste filtrable et recherche, grisé/couleurs, colonnes de perks, interrupteur « Afficher les perks inutiles » ; (0.4.4) **Inventaire des armes** : une perk par colonne et un mod, persistance locale, bouton « Forge » dans les trois popups Détails (Inventaire, Coffre, Mon Build) ; (0.4.5) **Scoring** : les perks simulés alimentent le build en temps réel, « Équiper vers Mon Build » local ; puis les armures ; la Phase 2 en dernier. **Logique de tri des colonnes de la popup Détails : relue et résumée dans `NOTES-CONCEPTION.md`, à réutiliser telle quelle (aucune réécriture) ; toute évolution se teste dans la popup ET dans la Forge.**
   - **Forge : avancement (13/10/2026)** : les douze défauts de la spécification sont **acceptés**. **0.4.3 à 0.4.6 livrées et validées** (Collection des armes ; Manifest périmé retéléchargé automatiquement ; cartes à quatre icônes ; boutons stylisés ; perks améliorés ; bouton Legendarium ; page Forge sans titre ; **vue Inventaire** : armes possédées, roll réel ✓, simulation locale d'une perk par colonne et d'un mod, persistance locale, aucune écriture chez Bungie). **0.4.7 livrée, en test** : les **quatre niveaux de perks** demandés par l'utilisateur (roll réel ✓ ; disponible sur l'exemplaire : contour gris clair ; possible sur le modèle : nom grisé ; simulé : doré), grâce à la lecture du composant 310 de Bungie (forme à CONTRÔLER avec le diagnostic du mode développement). **Prochaines étapes** : **0.4.8 Scoring** (les perks simulés alimentent le build en temps réel : pour chaque pièce simulée, remplacer dans `perkHashes` le perk de la colonne par le perk « effectif » enregistré ; « Équiper vers Mon Build » local avec badge « simulé » et avertissement à l'équipement en jeu ; bouton « Forge » dans les trois popups Détails, avec retour sans perte d'état) ; puis les armures (à définir : que sélectionne-t-on sur une armure ?) ; la Phase 2 en dernier.
   - **Page Forge : titre « Forge » retiré** ✅ **livré en 0.4.5** (13/10/2026, demande de l'utilisateur pendant ses tests de la 0.4.4) : la page garde son nom pour les lecteurs d'écran (région « Forge »), sa note grise et ses deux boutons de sous-menu.
   - **Bouton « Bibliothèque » devenu « Legendarium »** ✅ **fait en 0.4.4** (13/10/2026, demande de l'utilisateur, avec l'archive de visuels v5) : libellé, images, titre et message de la page. L'identifiant interne `bibliotheque` et le fichier `Bibliotheque.tsx` gardent l'ancien nom (la vue choisie est mémorisée). Les cinq fichiers fabriqués dépendent d'une source de lettres conservée dans `sources-lettres/`.
   - **Forge : boutons stylisés des sous-menus** ✅ **branchés en 0.4.4** (demande de l'utilisateur du 13/10/2026, après les tests de la 0.4.3) : « Collection » = le bouton de l'archive de visuels v4 ; « Inventaire » = un bouton au format du sélecteur fabriqué par `scripts/generer-propositions-solo-forge.mjs` (option 2, le titre repliable « Mon Inventaire » de Build Analyzer étant environ 1,8 fois plus large et sans lueur à l'état sélectionné). Composant `BoutonSousMenu` (`SelecteurVues.tsx`), mêmes images à deux états et mêmes règles CSS que le sélecteur principal, hauteur 44 px, rôle d'onglet et noms accessibles conservés. **À valider par l'utilisateur** : le dessin du bouton « Inventaire » ; à remplacer par celui de l'auteur des visuels s'il en livre un (voir `ressources-installateur/forge-armory/inventaire-0.4.3/LISEZMOI.md`).
   - **Forge : perks améliorés (analyse des diagnostics du 13/10/2026)** : une version améliorée est un OBJET DISTINCT (autre hash), de même nom que sa base, dans la même colonne, typé « Canon / Chargeur / Attribut / Particularité d'origine / Mod d'arme amélioré(e) ». Dans la révision « à paliers » de Confiance, 53 paires normales (l'améliorée est toujours listée après sa base) et un cas ambigu (« Chargeur abandonné », même type pour les deux : reconnu par la position, signalé « probable »). **Affichage fait en 0.4.4** (vue Collection) : `lib/manifest/perksAmeliores.ts`. **Réponses de l'utilisateur (13/10/2026)** : aucune paire fausse constatée (il reste vigilant) ; « Chargeur abandonné » existe bien en version améliorée (position confirmée) ; Confiance révision B et Défense dorée : « Non » (pas de roll fixe dans le jeu) mais l'affichage de l'appli lui semble cohérent : règle conservée, À ROUVRIR avec un diagnostic si une arme montre moins d'options que dans le jeu. **Encore à éclaircir** : (1) Confiance révision B, Défense dorée et Grande Faucheuse (temps perdu) n'affichent qu'UNE option par colonne : la règle validée « les `reusablePlugItems` d'abord » l'emporte sur le `randomizedPlugSet` que ces prises portent aussi (en question posée à l'utilisateur : roll fixe dans le jeu ?) ; (2) les textes « Amélioration de palier 2 à 5 » et « Palier Pièce maîtresse » montrent que les versions améliorées dépendent du **système de paliers** des armes, pas seulement du masterwork : pour l'Inventaire (0.4.5), quelle version s'applique à un exemplaire possédé dépend de son palier : lire l'état de l'exemplaire (composants d'instance) et prévoir un diagnostic d'un exemplaire possédé ; (3) colonnes de fabrication des armes forgeables (Grande Faucheuse temps perdu) : non traitées.
   - **Forge : points à trancher** (le document en annonçait aucun ; détail et défauts dans `NOTES-CONCEPTION.md`) : (1) « Transférer vers » existe déjà depuis la 0.4.2 : en Phase 2 il reste « équiper vers un personnage » et l'écriture des perks ; (2) perks simulés et équipement en jeu : badge « simulé » et avertissement ; (3) « pas de combinaison impossible » : le Manifest n'a pas de règles d'exclusion entre colonnes, garantie = une perk par colonne, prise dans son pool ; (4) « version améliorée » ≠ masterwork, et l'état masterwork d'une arme n'est pas lu aujourd'hui : lecture à ajouter et lien perk ↔ jumeau amélioré à vérifier sur ton Manifest ; (5) Collection grisée : nouvelle lecture Bungie (collections) ; un objet sans `collectibleHash` ne peut pas être classé ; (6) anti-bruit : filtre fondé sur le Manifest + liste modifiable, pas de dépendance à DIM, light.gg ou DestinyRecipes ; (7) Manifest : vérification de version automatique à la connexion, téléchargement automatique seulement si un cache existe ; (8) l'onglet Forge héberge les deux vues, le bouton « Forge » des popups y mène directement ; (9) l'impact en temps réel s'affiche dans les cartes du Scoring (le bloc Doctrine est la sous-classe) ; (10) armures : à définir (que sélectionne-t-on sur une armure ?), armes d'abord ; (11) données : clé `socketIndex`, hashes en nombres, sélection par `itemInstanceId` ; (12) limite du jeu pour la Phase 2 : les traits d'une arme à rolls aléatoires non forgée ne sont pas modifiables en jeu (à vérifier avec l'API).
   - **Reste de la liste du 12/10** : ~~logos « Arme » et « Armure » dans l'export~~ ✅ intégrés en 0.4.1 (archive de visuels v3) ; ~~bug du Filobscur~~ ✅ cause établie (les objets du Filobscur réutilisent les fichiers d'icône de la Stase dans les données de Bungie) et corrigé en 0.4.1 par recoloration, ✅ validé le 12/10/2026 (tous les tests cochés, sans demande de réglage de la teinte).
3. **Sécurité, avant toute ouverture à des tiers** : Vite, React Router,
   puis la politique de sécurité de contenu (section 1).

⏸️ **En attente d'une décision** : l'agent IA (section 3). **À décider** :
le canal du lien « Contact » (section 23).

**Menés dans d'autres conversations** (leur état à jour vit là-bas) :
moteur de dégâts ; export DIM (repris le 28/09/2026, voir section 15) ;
fiches de patch notes (section 10) ; Legendarium, ex-Bibliothèque (section 11).

---

## 🔴 Bloquant

*Aucun.* L'appli fonctionne de bout en bout (connexion, inventaire,
doctrine, scoring des 5 piliers, partage et exports).

---

## 🟡 Important

### 1. Suites de l'audit externe du 26/09/2026

✅ **Electron mis à niveau (32 → 44.5.1) et `electron-builder` (25 → 26.15.3) : validé.** Livré en v0.3.0
le 30/09/2026 ; tests renvoyés par l'utilisateur le 02/10/2026 (archivés dans `documentation/tests/`).
`npm.cmd ci` validé le 30/09/2026 (479 paquets installés à l'identique depuis `package-lock.json`). Détail
et revue des changements incompatibles : `CHANGELOG.md`.

**Reste, en étapes SÉPARÉES.** `npm.cmd audit` du 30/09/2026 : **4 vulnérabilités au lieu de 18**,
uniquement ces deux-là (le total en compte une « élevée », sans préciser laquelle ; les deux blocs du rapport
affichent « modérée »).
- **Vite / esbuild** (vulnérabilité modérée, serveur de développement seulement) : `vite` 5 → une version
  corrigée (l'audit propose 8.x, changement majeur à préparer, avec `@vitejs/plugin-react`) ;
- **React Router** (vulnérabilité modérée ; redirections ouvertes et rendu côté serveur, cas non utilisés par
  l'appli) : `react-router-dom` 6 → 7, changement majeur à préparer ;
- **Ajouter une politique de sécurité de contenu (CSP)**, à écrire puis tester pas à pas : une CSP trop
  stricte casse silencieusement les appels Bungie, le WebAssembly de sql.js ou les images distantes.

**Rappels utiles :**
- sous PowerShell, utiliser `npm.cmd` : la commande `npm` seule est bloquée par la politique d'exécution des
  scripts de Windows ;
- ne PAS lancer `npm audit fix --force` ;
- avertissement `allow-scripts` : npm signale que les scripts d'installation d'`electron` (téléchargement du
  moteur) et d'`esbuild` ne sont pas encore approuvés. Si le logiciel se lance et se fabrique normalement, ils
  ont bien tourné ; sinon, les approuver avec `npm.cmd approve-scripts electron esbuild` (commande proposée par
  npm lui-même), uniquement ces deux paquets officiels ;
- les « paquets obsolètes » signalés (`inflight`, `rimraf`, `glob`, `tar`, `npmlog`…) sont des dépendances des
  outils (surtout `electron-builder`), pas de l'appli elle-même.

### 2. Modifier les perks et les mods des armes et armures

🟡 **Indispensable à terme, pas bloquant aujourd'hui.** Demande de
l'utilisateur du 28/09/2026. Electron est à niveau et validé : c'est, avec
l'onglet Load-out (section 16), l'un des deux prochains chantiers de
développement (3e étape de l'ordre du 30/09/2026).

**À reprendre à cette occasion : fenêtres de « Détails » des armes et
armures** (Inventaire et Mon Build), qui ont leur propre logique d'affichage
(`texteSurvol`, `obtenirDescriptionComplete`, catégories de sockets) et ne
profitent pas encore du nettoyage fait pour les fiches. Défauts relevés
par l'utilisateur le 30/09/2026 :
- des **mémentos** s'affichent, alors qu'il faut les retirer — ⚠️ en
  gardant « **Memento Mori** » (As de Pique), qui est un vrai perk utile
  (réutiliser `obtenirPlugsDetailles` et sa protection, `doctrine.ts`) ;
- la **« résonance de Souvenance »** s'affiche (nom à vérifier sur l'objet
  réel ; probablement un plug lié aux souvenances, à écarter comme les
  cosmétiques) ;
- **doublons dans les « mods utilisables »**, peut-être liés à la pièce
  maîtresse : à diagnostiquer sur un objet réel avant de corriger (la
  cause n'est pas encore établie).


**Ce qui est demandé** : pouvoir changer les perks d'une arme et les mods
d'une arme ou d'une armure, **sauf** les ornements, les revêtements
(shaders) et les compteurs (trackers de victimes, etc.), qui n'ont aucun
effet sur le build.

**Deux niveaux à distinguer, à trancher avec l'utilisateur avant de coder :**
1. **Dans l'appli seulement** (simulation) : modifier les perks/mods d'une
   pièce dans le build, pour voir l'effet sur la fiche et le score, sans
   rien toucher en jeu. Faisable entièrement côté appli ; le score relit
   déjà les `perkHashes` de chaque pièce.
2. **En jeu** : appliquer réellement le changement sur l'objet. À étudier :
   l'API Bungie propose une action d'insertion de plug gratuite
   (`InsertSocketPlugFree`), utilisée par d'autres outils ; ses conditions
   exactes (quels plugs sont autorisés, droits OAuth nécessaires, coûts en
   matériaux exclus) sont **à vérifier dans la documentation de Bungie**
   avant toute promesse.

**Points de conception déjà identifiés :**
- ne proposer que les options réellement possibles : les colonnes de
  perks **obtenues** sur cet exemplaire pour une arme, les mods débloqués
  compatibles avec l'emplacement pour une armure ;
- réutiliser le filtre existant des cosmétiques (`MOTS_PERK_COSMETIQUE`,
  `doctrine.ts`) pour écarter ornements, revêtements et compteurs, plutôt
  qu'une deuxième liste ;
- les builds enregistrés gardent leurs `perkHashes` ; `rafraichirStats`
  (PanneauLoadouts) les remplace aujourd'hui par ceux de l'exemplaire réel
  au chargement : à revoir, sinon une modification faite dans l'appli
  serait écrasée.

### 3. Agent IA — ⏸️ en attente d'une décision, volontairement

- ✅ **Document d'architecture retrouvé et intégré** (26/09/2026) :
  `documentation/agent-ia/ARCHITECTURE-AGENT-IA.md`. Il vivait dans une autre conversation du
  projet, d'où son absence des archives jusqu'ici.
- 🔴 **À trancher AVANT toute ligne de code** : l'IA est-elle pour
  l'utilisateur seul, ou aussi pour ses amis ? Une clé d'API IA se
  retrouve dans le `.exe` fabriqué (comme la clé Bungie), sauf qu'ici
  **chaque appel est facturé**. Les 3 options et leurs conséquences sont
  détaillées dans `documentation/agent-ia/ARCHITECTURE-AGENT-IA-NOTES.md`.
- ⏸️ **Mise en attente assumée** : Bungie a annoncé (semaine du 26/09) que
  Destiny sort de son statut de fin de service. L'ampleur des évolutions à
  venir est inconnue et peut changer les besoins de l'agent (recherche Web,
  base documentaire). Attendre d'y voir clair est un choix, pas un oubli.
- 💡 **Bonne nouvelle pour la reprise** : les étapes 1 à 3 du document sont
  presque déjà faites — `BuildDraft` et `evaluerBuild` constituent déjà
  l'interface interne stable qu'il réclame.
- 📌 Deux ajouts à faire au document lors de la reprise (l'IA ne doit pas
  pouvoir contredire le score ; les appels doivent partir du processus
  principal, pas de la page) — détaillés dans le fichier de notes.

### 4. Lancer les tests automatiques du scoring

Le script `scripts/tester-avec-fixtures.mjs` (avec
`test-fixtures/manifest-mock.json`) a été préparé en août pour tester le
Pilier 2 de bout en bout (extraction → détection → chaînes), mais n'a
jamais pu tourner dans l'environnement de Claude (pas de `node_modules`).
Chez l'utilisateur, `npm install` fonctionne désormais : à lancer une fois
pour vérifier qu'il passe, et en faire un contrôle régulier avant chaque
version.

---

## 🔵 Confort / plus tard

### 5. Capacités de doctrine anti-champion — d'autres verbes à confirmer ?

La 3e source anti-champion est implémentée avec 10 verbes confirmés par
citation en jeu. Les autres verbes du catalogue n'ont pas de champion
associé — soit parce qu'ils n'en étourdissent aucun, soit parce que
l'information n'a pas encore été vérifiée.

**Action possible** : au fil des parties, si un verbe non listé étourdit
visiblement un Champion, le signaler pour l'ajouter (`championEtourdi` dans
`elementVerbs.ts`).

📌 **Bonus de set comme 4e source** : envisagé le 25/08, non codé — à la
connaissance de l'utilisateur, aucun bonus de set n'étourdit de Champion
actuellement. Pas de double comptage à craindre si le cas se présente (un
bonus de set n'est couvert par aucune des 3 sources actuelles). À ajouter
si un exemple réel est rencontré en jeu.

### 6. Armatures d'armes encore inconnues

`ARMATURE_VERS_CHAMPION` couvre 21 armatures. Le tableau EN/FR complet
(`knowledge-base/21_ARMATURES_ANTI_CHAMPION_EN_FR.md`) identifie
**Pinpoint Slug Frame** (fusils à pompe à munition unique) comme
explicitement manquante, plus 2 mots-clés du code sans correspondance
Destinypedia connue (`interruption`, `attaque`).

**Pour chaque armature rencontrée avec un repère « ? »** : transmettre le
nom d'armature (au survol) et le champion affiché en jeu.

### 7. Vérifications ponctuelles notées mais non traitées

- **Ergo Sum** (épée exotique à perk variable) : les 3 perks observés
  (Héraut de l'Orage → Bloqueur, Sursis imprévu → Surchargé, Munitions Meute
  de loups → Bloqueur) devraient déjà être gérés par la détection exotique
  existante, qui lit le perk actif. **Non vérifié sur données réelles.**
- **« Raidance »** : coquille de « Radiance » dans 2 fichiers sources
  (Outillage de sécurité, Encensoir). Sans impact sur la détection, à
  corriger si ces fichiers sont réutilisés.

### 8. Archétypes d'armure — pour une future recommandation

Les 12 archétypes et leurs paires de stats sont confirmés en jeu (tableau
complet FR/EN dans `knowledge-base/08_GAME_MECHANICS.md`, section « Armor
3.0 »). Pas utilisés pour NOTER (le pilier Statistiques note déjà les stats
réelles) ; **conservés pour une future RECOMMANDATION** (décision de
l'utilisateur), du type « pour ce build grenade, cherchez plutôt du bon
archétype ».

### 9. Vitrine « Solo sans mourir » — ajouter les exotiques de raid obtenues

Demande de l'utilisateur (24/09/2026) : afficher dans l'onglet vitrine les
**icônes des armes exotiques de raid déjà obtenues**.

⚠️ À cadrer avant de coder — ce n'est pas la même mécanique que l'existant :
- La vitrine actuelle repose sur `src/data/triomphesSoloFlawless.ts`, une
  table de **donjons** (hash de triomphe + hash d'emblème), alimentée par
  les triomphes du profil. Les exotiques de **raid** sont une autre
  famille : il faudra une seconde table, et vérifier par quelle donnée on
  sait qu'une arme est obtenue (triomphe d'obtention ? présence dans le
  coffre/collection ? — la **Collection** semble la piste la plus fiable,
  car une arme peut être supprimée de l'inventaire sans être « perdue »).
- Décider du périmètre : toutes les exotiques de raid, ou seulement celles
  des raids encore disponibles ?
- Décider de l'affichage : à côté des emblèmes de donjon, ou dans une
  section distincte ? (Les deux listes n'ont pas le même sens : l'une
  atteste d'un exploit solo, l'autre d'une obtention.)
- Les hashes devront être relevés via les outils de diagnostic existants,
  comme pour les emblèmes — pas recopiés de mémoire.

### 10. Patch notes de Bungie dans la knowledge-base

🔵 **Plus tard.** Demande de l'utilisateur du 28/09/2026 : ajouter à
`knowledge-base/` un répertoire contenant les transcriptions des patch
notes publiées par Bungie.

**Pistes de conception, à valider au moment de s'y mettre :**
- premier sous-répertoire de la knowledge-base : ✅ **créé le 28/09/2026**
  sous le nom `knowledge-base/27_PATCHNOTES/` (le numéro 26 a été pris le
  même jour par `26_ARMES_ARMURES.md`), avec son `LISEZ-MOI.md` et une
  entrée dans `00_INDEX.md`. Il contient déjà le récapitulatif de la
  9.7.0 fourni avec la base d'origine (anciennement
  `monument_of_triumph_recap.md`) ;
- un fichier par mise à jour, nommé `AAAA-MM-JJ_<version>.md` pour qu'ils
  se rangent d'eux-mêmes dans l'ordre chronologique ;
- en tête de chaque fichier : titre officiel, date de publication, lien
  vers la page source sur bungie.net, langue de la transcription ;
- ne pas l'inclure dans l'archive « invité », comme le reste de la
  documentation interne.

**Utilité attendue :** repérer quand une mise à jour rend obsolète une
donnée du projet (multiplicateurs de `01_DAMAGE_STACKING.md` pour le
moteur de dégâts, armatures anti-champion, artefacts, fragments) ; servir
de source à l'agent IA, dont l'ordre de recherche prévu passe par la
knowledge-base avant Bungie et le Web.

**Décisions de l'utilisateur (28/09/2026) :**
- **Claude produit les fiches**, à partir des pages officielles de
  bungie.net ;
- **en français ET en anglais**, pour faire facilement le lien avec les
  Manifest FR et EN ;
- **à partir de la sortie de l'extension La Forme Finale** (*The Final
  Shape*, juin 2024), puis chaque nouvelle mise à jour ;
- **ordre ANTI-CHRONOLOGIQUE** (précisé le 28/09/2026) : les fiches les
  plus récentes, donc les plus pertinentes pour le jeu actuel, sont
  produites en premier ; on remonte ensuite jusqu'à La Forme Finale.

⚠️ **Forme retenue : des fiches, pas des copies intégrales.** Les patch
notes sont des textes de Bungie protégés par le droit d'auteur : Claude ne
les recopie pas mot pour mot. Chaque mise à jour fait l'objet d'une fiche
rédigée avec ses propres mots, qui reprend tous les faits utiles (ce qui
change, chiffres avant/après, objets concernés), avec le lien vers la page
officielle pour le texte complet. Format plus exploitable qu'un texte
brut pour le rapprochement avec les Manifest : chaque objet cité y figure
avec son nom français ET son nom anglais.

**Format envisagé d'une fiche** (à valider sur la première produite) :
en-tête (titre officiel FR/EN, date, version, liens des deux pages
sources), puis une section par catégorie (armes, armures, sous-classes,
artefacts, modificateurs, activités...), chaque changement sur une ligne :
nom FR / nom EN, nature du changement, valeurs avant → après.

**Mise en route proposée** : produire d'abord UNE fiche, celle de la mise
à jour la plus récente à ce moment-là, pour valider le format avec
l'utilisateur ; puis remonter le temps par lots, jusqu'à la sortie de La
Forme Finale. Les nouvelles mises à jour publiées entre-temps passent en
tête de file.

---

**Constat du 05/10/2026 : la knowledge-base s'arrête à la 9.7.0 (9 juin 2026), mais Bungie a publié des correctifs depuis.**
D'après bungie.net et des sites de suivi : 9.7.0.1 (mi-juin), 9.7.0.2 (23 juin), 9.7.0.3 (7 juillet, présenté comme
le dernier correctif), 9.7.0.4 (fin juillet, sans notes de patch). Aucune de ces versions n'est intégrée au projet
(vérifié : aucune mention de « 9.7.0.x »). Deux points à vérifier à la source, d'après ces sites de suivi : la 9.7.0.4
désactiverait en Crucible le bonus 4 pièces du set Europa (bonus de sets, score PvP ?) ; la 9.7.0.1 corrige la progression
du catalyseur d'Obligation collective. **À faire** : produire les fiches de ces correctifs dans `27_PATCHNOTES/` (méthode
habituelle : l'utilisateur copie-colle le texte français depuis bungie.net), puis reporter leurs effets dans l'appli.

✅ **Première fiche produite le 07/10/2026 : la 9.7.0.5** (`knowledge-base/27_PATCHNOTES/2026-10-07_9.7.0.5.md`, en français et en anglais), publiée le jour même. C'est un correctif anti-triche côté serveur, **sans effet sur les données ni les règles de l'appli** ; texte français collé par l'utilisateur, recoupé avec un site de suivi (MP1st). **À faire / à valider** : (1) le **format** de la fiche, avec l'utilisateur, avant de remonter le temps ; (2) les **liens officiels** bungie.net FR et EN et le titre officiel anglais, que la recherche web n'a pas retrouvés ; (3) la ligne « comptes sanctionnés » (présente en anglais, absente de l'extrait français collé) ; (4) la suite, **dans l'ordre anti-chronologique** : 9.7.0.4, 9.7.0.3, 9.7.0.2, 9.7.0.1, dès que l'utilisateur colle leurs textes. `VERSION_JEU` : 9.7.0.5 ajoutée et marquée intégrée (le niveau affiché reste « aucun intégré » : les correctifs sont cumulatifs) ; la **date de la 9.7.0.1 est retrouvée : 16 juin 2026** (site de suivi, non officiel).
**Ce que l'on sait des correctifs 9.7.0.1 à 9.7.0.4 (07/10/2026)** : le **texte officiel de la 9.7.0.2** (page bungie.net remontée par la recherche, `https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0_2`) ne contient que des **corrections d'activités** (Opérations, Panthéon, raids, donjon Dualité) et une ligne Eververse : **aucun bonus de sets d'armure** (⚠️ j'avais d'abord écrit le contraire, d'après l'introduction d'un site de suivi : c'était faux, corrigé). D'après des sites de suivi qui citent les notes : la 9.7.0.1 (16 juin) corrige des activités (Conquêtes, Panthéon, donjons, dont la chute du catalyseur Wish-Ender), la 9.7.0.3 (7 juillet) augmente la réputation des Opérations Avant-garde et Creuset, corrige des minuteurs de suspension et des sorties de carte en Creuset et annule un correctif du combat « Esprit consacré » ; **rien de tout cela ne touche au scoring**. Seule la **9.7.0.4** (28 juillet), publiée **sans notes de patch propres**, pourrait désactiver en Creuset le bonus 4 pièces du set Europa : **non vérifié**, à confirmer en produisant sa fiche. Les pages officielles sont des applications JavaScript que mes outils ne savent pas lire ; coller le texte reste la méthode fiable.

**Affichage de la version du jeu et du niveau des correctifs (05/10/2026)** : tout en haut à droite du titre, trois lignes :
la version de Destiny 2 prise en compte (« DESTINY 2 · VERSION 9.7.0 »), le patch (« Monument of Triumph · patch du 9 juin
2026 ») et le **niveau des correctifs** (aujourd'hui, en ambre : « Correctifs : aucun intégré · dernier publié : 9.7.0.4
(28 juillet 2026) »), avec une infobulle qui détaille. **Règle de maintenance** : tout se règle dans `src/data/versionJeu.ts`
(source unique). Quand un correctif est intégré (sa fiche est dans `27_PATCHNOTES` ET ses effets sont reportés dans l'appli),
passer son `integre` à `true` : la ligne devient « Correctifs intégrés jusqu'à 9.7.0.x » et le numéro de version affiché
monte avec elle. Quand Bungie publie un nouveau correctif, l'AJOUTER à la fin de `correctifs` avec `integre: false`. Les
correctifs sont cumulatifs : un correctif marqué intégré après un non intégré ne relève pas le niveau. Nouvelle version
majeure : changer `numero`, `nom` et `datePatch`, repartir d'une liste vide. C'est une valeur écrite à la main : l'appli ne
la déduit pas de la knowledge-base. Dates : 9.7.0.4 sur la page d'état officielle de Bungie ; 9.7.0.2 et 9.7.0.3 d'après un
site de suivi ; celle de la 9.7.0.1 n'a pas été retrouvée.

### 11. Legendarium (ex-Bibliothèque, renommé le 13/10/2026) — consultation du lore

🟢 **Lancée le 28/09/2026 (v0.2.8), étape 1 faite.** Outil annexe demandé
par l'utilisateur, accessible par le sélecteur placé sous le bloc
Connexion (« Build Analyzer », position par défaut à chaque lancement, ou
« Bibliothèque », devenu « Legendarium » le 13/10/2026). Pour l'instant, la page annonce son contenu et indique
si le Manifest est chargé (`src/components/Bibliotheque.tsx`).

**Périmètre :** toutes les légendes de Destiny 2 (livres de lore, armes,
armures, coques de Spectre, vaisseaux), puis à moyen/long terme le
Grimoire de Destiny 1.

**Consignes de l'utilisateur (27/09/2026) :**
- armures rangées **par classe, sans jamais mélanger** : le set du
  Chasseur, celui du Titan et celui de l'Arcaniste sont trois histoires
  indépendantes ;
- ordre de lecture d'un set : **casque → gants → torse → jambes → objet de
  classe** ;
- objets sans légende **masqués par défaut** ;
- rééditions **dédoublonnées** (même légende réutilisée) ;
- armures exotiques rangées par classe, **dans une section à part** ;
- Grimoire D1 : l'utilisateur revérifiera la source le moment venu (l'API
  D1 ne répond peut-être plus ; des copies d'archive existent).

**Découpage proposé :** 1) lore D2 depuis le Manifest (livres, armes,
armures, coques, vaisseaux) avec navigation et recherche par mots-clés ;
2) recherche par thème (thèmes à définir, aucune étiquette fournie par
Bungie) ; 3) Grimoire D1.

**Point à régler avant l'étape 2 :** le Manifest est chargé par le bloc
« Recherche dans le Manifest » de la vue Build Analyzer. Au démarrage, il
se charge tout seul s'il est en cache et à jour ; sinon, il faut
aujourd'hui repasser par Build Analyzer pour lancer le téléchargement.
À envisager : sortir ce chargement des deux vues.

### 12. Renommage « Forge Armory » : ✅ validé le 06/10/2026

✅ **Forge Armory** est le nom officiel ; **Destiny 2 Build Analyzer** est son sous-titre (livré en v0.3.0 le
05/10/2026 ; description complète : `CHANGELOG.md`). **Validé par l'utilisateur le 06/10/2026, dans le logiciel
installé** : ses données (builds, pondérations, cache du Manifest) sont conservées après installation par-dessus
l'ancienne version et après relance ; entrée Windows et raccourcis ; nom de l'installateur ; titre de la fenêtre
et pied de page ; en-tête et pied de page des exports et copie en texte ; connexion Bungie sans rien
reconfigurer ; import d'un fichier d'export fait avant le renommage.

⚠️ **RÈGLE PERMANENTE — À NE JAMAIS renommer (identifiants internes)** : sinon l'utilisateur croirait avoir perdu ses données.
- clés de stockage `d2-build-analyzer.loadouts.v1` (builds), `d2-build-analyzer.ponderations.v1`, `d2ba.bungie.tokens`
  (session Bungie), base `d2-build-analyzer` du cache du Manifest, identifiant DIM `d2-build-analyzer-…` ;
- `appId` (`com.orynick.d2buildanalyzer`) : Windows y verrait une AUTRE application, installée à côté de l'ancienne au
  lieu de la remplacer ; `name` de `package.json` (`d2-build-analyzer`) ; schéma interne `app://local` et adresse de
  retour Bungie `https://127.0.0.1:5173/auth/callback` (aucune clé OAuth à changer) ;
- (le nom du dossier du projet et du zip n'en fait PAS partie : libre, renommé en `forge-armory` le 05/10/2026 ; une première version de cette section l'avait rangé ici à tort.)

⚠️ **RÈGLE PERMANENTE — Dossier de données** : Electron range les builds, pondérations, cache du Manifest et
session dans un dossier de `%APPDATA%` dont le nom dépend du nom de l'application. `electron/dossierDonnees.cjs`
regarde lequel des deux noms possibles (`d2-build-analyzer` ou `D2 Build Analyzer`) existe et contient des
données, et `main.cjs` dit à Electron de continuer à l'utiliser (`userData` et `sessionData`), avant que
l'application soit prête. Rien n'est déplacé, copié ni supprimé. **Ne pas modifier ce mécanisme, ni le
`productName`, sans un essai sur un poste qui a des données** ; en cas de doute, demander d'abord un
« ⬇ Exporter tout » de sécurité. Texte complet d'origine : `documentation/todo/ARCHIVE-TODO-2026-10-06.md`.

À faire / à décider :
- **par l'utilisateur** : renommer l'application sur le portail développeur de Bungie (facultatif ; SANS en créer une nouvelle, elle aurait de nouvelles clés) ; ~~dépôt GitHub~~ ✅ fait le 11/10/2026 : dépôt `Orynick/Forge-Armory` créé (public), ancien dossier `d2-build-analyzer` supprimé, branche `test` créée pour la prévisualisation, `TODO.md` et `CHANGELOG.md` versionnés (détail : `CHANGELOG.md`, 11/10/2026) ;
- **mise à jour par-dessus** : Windows réutilise le dossier d'installation de l'ancienne version (cosmétique : il
  peut encore s'appeler « D2 Build Analyzer »), et l'épingle de la barre des tâches est à refaire ;
- **sélecteur « Build Analyzer / Bibliothèque »** : libellés inchangés (la forme « Forge Armory - Build Analyzer »
  envisagée le 29/09 n'a pas été retenue) ;
- **identité visuelle (essai validé par l'utilisateur le 02/10/2026)** : décider de retirer l'ancien logo de `src/` (composants
  `IconeCryptarque` et `IconeFantome`, inutilisés) ou le garder en archive seulement ; réglage du filigrane si besoin :
  `OPACITE_FILIGRANE` (`src/data/emblemeForgeArmory.ts`), `LARGEUR_FILIGRANE` (`exportFiche.ts`) et la largeur de
  `<Filigrane />` (`FicheBuild.tsx`). Détail : `ressources-installateur/forge-armory/LISEZ-MOI.md`.

### 12 bis. « Équiper » : cas que l'appli ne gère pas encore

Section RESTAURÉE le 01/10/2026 : créée le 30/09, elle avait été effacée par
erreur le 01/10 lors d'une mise à jour de la section 12 (voir `CHANGELOG.md`).

« Équiper » gère : objet dans le coffre, sur un autre personnage, déjà sur la
cible, démantelé (message), et depuis le 01/10/2026 (**validé par l'utilisateur**) l'**arme
équipée sur un autre personnage** par remplacement automatique (règles
validées par l'utilisateur : même emplacement ; inventaire de cet autre
personnage puis coffre ; légendaire de préférence ; exotique seulement en
dernier recours et sans autre exotique d'arme équipé). Restent, refusés avec
un message clair en attendant :
- **objet au courrier** : utiliser `Destiny2.PullFromPostmaster` pour le
  rapatrier automatiquement, puis l'équiper ;
- **armure équipée sur un autre personnage** (de la même classe) : même
  principe que pour les armes, remplaçant à choisir parmi les armures de
  cette classe et du même emplacement, en respectant l'unicité de l'armure
  exotique ;
- **check-list après « Équiper en jeu »** (Loadouts) : elle ne liste que la Doctrine (sous-classe, super,
  mêlée, grenade, compétence de classe, saut, aspects, fragments). Les **perks d'artefact** choisis dans
  le build ne sont pas listés (ils ne s'équipent pas par l'API non plus) : à ajouter si l'utilisateur le
  souhaite ;
- **`EquipItems` (lot)** : équiper plusieurs pièces en un seul appel
  (`Destiny2.EquipItems`) plutôt qu'une par une, pour réduire les appels et
  les conflits d'unicité entre exotiques.

### 13. Pilier 2 — points de surveillance

- Le Saut (`sautHash`) est bien suivi dans
`SubclassConfig` depuis le début, mais `extraireTextesDoctrineBuild` ne le
lit jamais — contrairement à Super/Mêlée/Grenade/Classe/Aspects/Fragments.
Les textes de Saut ONT été reçus dans l'audit (catégorie SAUT présente
dans les 18 fichiers) mais volontairement PAS analysés dans cette passe
(hors scope initial de "verbes qui produisent des effets" — les sauts
n'en ont typiquement aucun). À revisiter si un saut exotique/spécifique
s'avère avoir un effet de debuff/buff qui mériterait d'être capté.
- **Surveillance du correctif du 26/08 sur `sourcePayoff.ts`** : vérifié isolément sur des formulations plausibles (pas le texte
  exact en jeu). Si un verbe se retrouve encore classé en "payoff
  orphelin" à tort après ce correctif, transmettre le texte EXACT affiché
  en jeu pour cette aptitude, pour ajuster précisément plutôt que deviner.

### 13 bis. Anti-champion des armes exotiques : liste de référence

Fait le 01/10/2026 : pour une arme exotique, l'appli utilise **la liste de l'utilisateur** (relevée dans le
jeu, `knowledge-base/28_ARMES_EXOTIQUES_ANTI_CHAMPION.md`, données dans `src/data/exotiquesAntiChampion.ts`)
avant la déduction d'origine, qui sert de repli. Complétée le 02/10/2026 : Récit d'un homme mort, Trop long à
expliquer, Tueur de Souhaits et Obligation collective (Bloqueur). **Ergo Sum** (3 variantes) reste volontairement
sans anti-champion : cas particulier, il peut varier.

✅ **Armes oubliées : contrôle fait le 05/10/2026** (rapport de l'utilisateur sur son Manifest, conservé dans
`knowledge-base/sources-externes/controle-anti-champion-exotiques_2026-10-05.md`) : **aucune arme oubliée**. 140 des 143 noms de la
liste sont retrouvés dans le Manifest ; les 3 restants sont les variantes d'Ergo Sum ; la seule exotique du Manifest absente de la liste est
« Ergo Sum ». Le drapeau `controleAntiChampionExotiques` reste actif pour le nouveau rapport des « autres définitions de même nom » (TODO 19) ;
l'archiver (`false`) ensuite.

À savoir :
- **deux désaccords** entre la liste et la déduction de REPLI : Centrifuse (liste : Surchargé, déduit : Implacable) et Poigne du Salut (liste :
  Implacable, déduit : Surchargé). La liste fait foi ; si l'utilisateur doute de l'une de ces deux lignes, la vérifier en jeu ;
- les **115 « non détectés »** du rapport sont normaux : la déduction de repli ne les voit pas, c'est la liste qui les gère ;
- à chaque nouvelle exotique de Bungie : l'ajouter à la liste (sinon, la déduction de repli s'applique).

### 13 ter. Interface : pistes en attente de décision

- ✅ **Boutons d'élément de la Doctrine sur UNE ligne : validé dans le logiciel installé (06/10/2026)**, avec
  trois niveaux de compacité selon la place disponible. En `npm.cmd run dev` ils restent sur deux lignes :
  cause non établie, suivie en section 22.
- ✅ **Boutons du contexte du build : visuels de l'utilisateur intégrés** (07/10/2026, v0.3.6, en test) : ils remplacent ma proposition CSS de la v0.3.5 (`components/PastilleContexte.tsx`, huit SVG dans `public/boutons-profils/`, partagés par la rangée sous le nom du build et le bloc « 0. Contexte du build »). **À valider** : le libellé « Contexte du build : » est passé sur sa propre ligne (les quatre boutons ne tenaient pas devant). L'archive contient aussi des icônes seules et des symboles vectorisés (`ressources-installateur/forge-armory/boutons-profils/`), non utilisés pour l'instant.

- **Textes d'artefact** (`src/data/artefacts.ts`) : variantes de « Champions Implacable(s) » avec majuscule ou au
  singulier, restées telles quelles (le 05/10/2026, deux fautes certaines ont été corrigées : « fficace » et une
  phrase en minuscule) ; à uniformiser si l'utilisateur le confirme.

### 14. Filtres par type d'arme : une seule entrée « Lance-grenades »

Depuis le 01/10/2026 (v0.3.0), l'icône de type d'arme distingue les deux lance-grenades (spécial,
lourd) par leur TYPE DE MUNITIONS partout où une arme précise est affichée. Les **filtres par type**
(Inventaire et Coffre) listent des NOMS de types : « Lance-grenades » y figure une seule fois, avec
l'icône spéciale, puisque le texte du type est le même pour les deux. Pour les départager dans les
filtres, il faudrait un filtre par munitions (principales, spéciales, lourdes) ou deux entrées
« Lance-grenades (spécial / lourd) » : à proposer si l'utilisateur le souhaite.

### 15. Export DIM

📌 **Précisé le 25/08** : ce chantier est désormais **optionnel**, pas
bloquant. L'équipement direct depuis l'appli (transfert + équipement,
avec réparation automatique des loadouts périmés) couvre le même besoin —
l'utilisateur peut équiper un build sans jamais passer par DIM.

Échec en 401 puis 400 sans détail exploitable. Alternative envisagée : gestion
d'inventaire « maison » (transferts coffre ↔ personnages), à étudier
seulement si un besoin précis que l'équipement direct ne couvre pas
apparaît.

⚠️ **État à reporter** : ce chantier a été repris le 28/09/2026 dans une
autre conversation (approche progressive : armes et armure d'abord, puis la
Doctrine ; bouton « Exporter vers DIM » à placer tout à droite du bloc
« Partage du build »). Mettre cette section à jour avec son état réel lors
de l'intégration de ce travail.

---

### 16. Onglet « Load-outs » : gérer ses Loadouts en grand (demande du 05/10/2026) — LES TROIS LIVRAISONS SONT FAITES ET VALIDÉES

✅ **Livraison 1 (v0.3.5) validée** : troisième bouton du sélecteur (« Load-outs », entre « Build Analyzer » et « Bibliothèque »), qui ouvre le panneau des loadouts en pleine page, cartes en grille : c'est le même `PanneauLoadouts` que le tiroir, en mode `page` ; « Charger » ramène au Build Analyzer et amène « Mon Build » à l'écran ; les deux instances se tiennent à jour par l'événement `d2ba:loadouts-modifies` du stockage.
✅ **Livraison 2 (v0.3.7) validée** : recherche par mots-clés (nom, description, auteur, classe, élément, contexte, armes, armures, artefact et ses perks, Doctrine **Manifest chargé seulement**) et filtres classe, élément, contexte avec leur nombre.
✅ **Livraison 3 (v0.3.12) validée le 07/10/2026 (21 tests sur 21 avec la 0.3.16) : ordre modifiable et « stocké en jeu »** : rang d'affichage (`ordre`) et mémo (`stockeEnJeu`), champs facultatifs sans migration ; boutons ◀ ▶ **et** glisser-déposer (choix de l'utilisateur : « les deux ») ; l'ordre ne se modifie que sans recherche ni filtre actif ; un build neuf arrive en tête ; la case « stocké en jeu » est un **mémo à cocher à la main** avec sa légende (décision du 05/10/2026) ; le fichier d'échange d'UN build ne contient ni rang ni mémo, « Exporter tout » les garde. Détail : `CHANGELOG.md` (0.3.12). Le tiroir est inchangé.

**Pistes, non demandées, à proposer si besoin** (la liste de tests 0.3.12 pose trois questions) :
- la case « stocké en jeu » **dans le tiroir** (aujourd'hui l'onglet seulement) ;
- un **filtre « stocké en jeu / pas stocké »** dans la barre de recherche (le mécanisme des filtres existe) ;
- le glisser-déposer **au doigt** (écran tactile) : le glisser-déposer HTML natif ne le gère pas ; il faudrait des événements « pointeur » ; les boutons ◀ ▶ couvrent déjà ce besoin ;
- piste ultérieure, SANS engagement : enregistrer réellement un build dans un emplacement de **loadout du jeu**. L'API de Bungie le permet (vérifié le 05/10/2026 : `EquipLoadout`, `SnapshotLoadout`, `UpdateLoadoutIdentifiers`, `ClearLoadout`, même autorisation que « Équiper »), mais un loadout du jeu ne porte que des objets (armes, armure, mods) : jamais la Doctrine ni l'artefact, et il appartient à un personnage. La case actuelle resterait alors un mémo, ou pourrait être cochée automatiquement.

**À prévoir aussi** : l'archive des boutons contient trois icônes seules (cercle + icône, sans cadre ni titre : `ressources-installateur/forge-armory/boutons-selecteur/icones/`), non utilisées pour l'instant ; elles pourraient servir de repères dans l'interface.

### 16 bis. Visuels illustrés : titres, boutons, icônes (07/10/2026, v0.3.13 à v0.3.17)

✅ **L'archive « forge-armory-app-assets » (60 SVG, catalogue, charte) est intégrée et validée (0.3.16 : 21 tests sur 21)** (`public/assets/`, `src/data/forge/forgeAssets.ts`, `src/lib/visuelsForge.ts`). Les visuels sont **retouchés** par `scripts/retoucher-visuels.mjs` (archive d'origine intacte, script à relancer après tout remplacement de fichier ; détail : `documentation/identite-visuelle/RETOUCHES-VISUELS.md`).
**Retours de l'utilisateur du 07/10/2026, traités en 0.3.17 et VALIDÉS le 08/10/2026 (10 tests sur 10)** : titres à la taille des onglets (56 px, variable CSS commune `--hauteur-logo-titre`) ; **soulignage** épaissi (il était plus fin qu'un pixel dans les 24 titres) ; ligne « Contexte du Build » supprimée, **boutons de contexte dans « Mon Build »** ; bloc renommé **« Classe et Doctrine »** (confirmé : le bloc sous « Mon Inventaire ») ; **Connexion et Manifest non repliables** (titres sans losange) ; icône de la carte du pilier 1 à la proportion de celle du bloc Doctrine, billes agrandies.
**Renumérotation du Scoring (08/10/2026, 0.3.18, en test)** : pour suivre l'ordre des blocs au-dessus du Scoring, **1. Doctrine élémentaire** (ex « Élément et Doctrine »), **2. Armes et Armures** (ex 3), **3. Artefact** (ex 2), 4. Effets du Build, 5. Statistiques ; mêmes logos, chiffre et position changés. Source unique : `data/piliers.ts` (`ORDRE_PILIERS`, `LIBELLES_PILIER`) + ordre du tableau du moteur (`lib/scoring/pillars.ts`) ; scores, poids et score global **strictement inchangés** (testé contre l'ancien moteur). Les textes des titres (tracés) sont **recomposés avec les lettres de l'utilisateur** par `scripts/retoucher-visuels.mjs` (étape 4, outil `scripts/glyphes-titres.mjs`) : **à relire à l'œil** ; nouveaux fichiers `titre-1-doctrine-elementaire`, `titre-2-armes-armures`, `titre-3-artefact` (anciens fichiers supprimés ; catalogue : complément `forgeAssetsComplement.ts`).
**⚠️ À savoir : deux numérotations coexistent.** Les « Pilier N » des COMMENTAIRES, du README, de la base de connaissances et de cette TODO suivent l'**ANCIENNE** numérotation d'avant le 06/09/2026 (ancien Pilier 1 = Élément et Doctrine, **2 = Verbes d'Élément** (aujourd'hui « 4. Effets du Build »), 3 = Perks d'Artefact, 4 = Loot et cohérence, 5 = Statistiques), jamais renumérotée ; ils ne sont **pas** modifiés (ils sont exacts pour l'ancien numéro). Table de correspondance dans `data/piliers.ts`. En cas de doute, se fier à la clé interne. **Incohérence ancienne, non traitée** : le mode diagnostic affiche « 🔍 Diagnostic Pilier 2 (ce que le score lit vraiment) » : c'est l'ancien numéro des verbes, alors que l'écran affiche maintenant « 4. Effets du Build » ; à corriger si l'utilisateur le demande.
**✅ « Classe et Doctrine » : on GARDE le logo** (décision de l'utilisateur, 08/10/2026 : « On garde le logo »). L'image dessine « DOCTRINE ET ÉLÉMENT » ; le nom lu par les lecteurs d'écran est « Classe et Doctrine ». **Plus rien à fournir** pour ce bloc (la demande de logo de la 0.3.17 est annulée).
**Réponses de l'utilisateur (08/10/2026) aux questions de la liste 0.3.17** :
- ✅ **« Classe et Doctrine » = le bloc placé sous « Mon Inventaire »** (celui des cartes Chasseur / Titan / Arcaniste) : confirmé, mon interprétation était la bonne ;
- ✅ **épaisseur du soulignage** : « c'est bon comme ça » (08/10/2026) : validée, plus de question ;
- ✅ **billes de l'icône du bloc « Classe et Doctrine »** : « Oui », on les grossit pour égaler celles de la carte « 1. Doctrine élémentaire » : fait en 0.3.19 (25 → 30, masque 42 → 47, deux états du bloc) ; les deux icônes sont maintenant identiques (en test) ;
- ⏸️ **où utiliser les 19 icônes** (tiroirs repliés, onglets) : en attente ;
- ✅ **titre illustré pour le panneau « Solo sans mourir » : OUI.** Pas de demande pour les autres (tiroir « Loadouts », vues Bibliothèque et Load-outs) : à ne reposer que si le besoin revient ;
- toujours **sans réponse** : une mention discrète « Pilier 1 / Pilier 3 » à côté des titres ; la casse des textes lus par les lecteurs d'écran est acceptée tacitement.
**⏳ À FOURNIR PAR L'UTILISATEUR : le logo + titre « Solo sans mourir »** (même style que les autres : logo, plaque, titre, soulignage et cristal). **Contrainte à trancher AVANT de le dessiner** : aujourd'hui ce panneau (`PanneauTriomphes.tsx`) affiche, dans son en-tête ouvert, une petite icône de crâne + le texte « Solo sans mourir », et, replié, un onglet vertical « 💀 Solo (n/11) » sur le bord gauche. Le panneau ouvert fait **320 px de large** (296 px utiles). Un titre au cadre des titres fixes (7505 × 1024) à la taille des onglets (56 px) ferait **410 px** : il ne tiendrait pas ; même à la taille minimale (41,6 px) il ferait 305 px, juste trop large. Trois façons de faire, à choisir avec l'utilisateur : (a) dessiner ce titre avec un **cadre plus étroit** (environ 5,3 × 1 pour tenir à 56 px dans 296 px, ce qui convient à un titre court comme « SOLO SANS MOURIR ») ; (b) **élargir le panneau** (par exemple 440 px) ; (c) l'afficher **plus petit** que les autres titres (environ 39 px de haut), ce qui rompt la règle « même taille que les onglets ». Pour l'onglet vertical replié, une **icône seule** (comme celles de l'archive, 19 icônes non encore placées) irait mieux qu'un titre horizontal : c'est lié à la question des icônes, en attente.
**Décision de l'utilisateur sur la largeur du panneau (08/10/2026)** : « on va voir en fonction du logo » : **aucune des trois options n'est retenue pour l'instant** ; elles seront tranchées à la réception du logo (cadre plus étroit d'environ 5,3 pour 1, panneau élargi à environ 440 px, ou titre plus petit). Rien à faire côté code d'ici là.
**⚠️ À faire avant toute diffusion publique de l'appli (phases 2 et 3 de la feuille de route) : vérifier la LICENCE du logo « Artefact »**, que la notice de l'archive dit repris d'un SVG de SVG Repo (« shield-artifact ») ; et celle de toute autre ressource tierce.
**À savoir, non traité** : à 420 px de large, le sélecteur de classe du bloc Doctrine (`.carte-classe`) dépasse la fenêtre de 31 px (antérieur aux titres ; à traiter seulement si demandé). **Conservé tel que dessiné par l'utilisateur** : la carte « 1. Élément et Doctrine ».

### 17. Icônes des perks d'artefact + classeur « Endgame Analysis » (05/10/2026)

✅ **Terminé : les 147 perks d'artefact ont leur icône** (v0.3.4, 06/10/2026) : 128 trouvées directement dans le Manifest de l'utilisateur et 19 **choisies en jeu par l'utilisateur** avec le panneau « Départager » (13 ambigus ; 6 perks dont le nom de nos données diffère d'une faute de celui du jeu ; 19 sur 19 tranchés, fichier conservé dans
`knowledge-base/sources-externes/choix-icones-ambigues_2026-10-06.json`). Chemins d'icônes de Bungie, figés dans `src/data/iconesPerksArtefact.ts` (l'en-tête du fichier détaille l'origine) ; affichées dans la grille, les emplacements équipés, le récapitulatif, la fenêtre « Voir » et les exports. Historique : `CHANGELOG.md` (0.3.0 à 0.3.4).

⚠️ **DISCORDANCE NON EXPLIQUÉE, à revérifier** : pour les 6 perks à nom différent (« Combo tempêtes de lames », « Tactique de meute », « Surealimentation élémentaire », « Appel tempête », « Tirs soutenu », « Rayon de souffle »), les icônes que l'utilisateur a choisies le soir du 06/10 sont **exactement celles enregistrées en 0.3.1**, qu'il avait jugées fausses en jeu le matin. Ses choix du soir font foi ; un test de la liste 0.3.4 lui demande de les recomparer dans l'appli. Interrogé, l'utilisateur répond : « je ne sais pas, c'était peut-être la fatigue » : une erreur de comparaison du matin est donc probable, mais non prouvée (le test reste dans la liste). S'il les juge encore fausses : lui demander ce qu'il voit en jeu, et regarder si l'écart vient de l'affichage (taille, cadre) plutôt que du chemin d'icône.

**Règles permanentes** : ne JAMAIS renommer un perk (la clé d'un perk de build enregistré en dépend) ; le contrôle des icônes ne repropose plus un perk déjà tranché (son icône enregistrée figure toujours parmi les candidates) : après une mise à jour du jeu, le relancer repère les perks devenus ambigus ou introuvables.

**Plus tard** : exploiter le classeur « Endgame Analysis » (recoupements en `knowledge-base/23_RESSOURCES_EXTERNES.md`) ; son CSV « Artifact Mods » (147 lignes) recoupe nos données : 146 perks sur 147 avec le même nom et le même palier. Archiver le drapeau `controleIconesPerksArtefact` une fois la discordance réglée.

### 18. À vérifier : stats des fragments qui dépendent de la classe (05/10/2026)

**Constat** : certains fragments retirent une stat DIFFÉRENTE selon la classe : Echo of Persistence et Spark of Focus,
`-10 Weapons` (Chasseur), `-10 Health` (Titan), `-10 Class` (Arcaniste). Deux sources concordent : la fiche
`02_SUBCLASSES_ALL.md` et la colonne « Stats » du classeur « Endgame Analysis » (onglet Fragments).

**Risque, non confirmé** : `obtenirBonusStatsPlug` (`src/lib/manifest/doctrine.ts`) additionne TOUS les `investmentStats`
d'un fragment, sans regarder s'ils ne s'appliquent que sous condition ; le type `investmentStats` (`src/types/manifest.ts`) ne
porte que `statTypeHash` et `value`. Si le Manifest liste les trois malus de Echo of Persistence, l'appli pourrait appliquer
`-10` à Armes, Santé ET Classe à toutes les classes (soit `-30` au lieu de `-10`), ce qui fausserait le pilier Statistiques.
Je crois que l'API de Bungie prévoit un champ `isConditionallyActive` sur ces entrées, mais **je n'ai pas pu le confirmer**
(recherche du 05/10 sans résultat probant) et **je ne sais pas comment le Manifest encode ce cas précis** (une entrée par
classe, des objets distincts, ou autre).

**Test à faire en jeu, sans rien développer** : sur un Chasseur, puis un Titan, puis un Arcaniste, équiper Echo of Persistence
(Vide) et comparer les stats affichées par l'appli avec celles du jeu. Attendu : une seule stat baisse de 10, selon la classe.
Si l'appli baisse les trois : corriger `obtenirBonusStatsPlug` (conditionnel et classe). Un diagnostic du JSON brut de ce
fragment dans le Manifest trancherait l'encodage.

### 19. Objets FACTICES du Manifest, et « Tueur de souhaits » (06/10/2026)

✅ **Élucidé, corrigé et validé (06/10/2026)** : la catégorie **3109687656** est celle des objets **factices**
(`itemType` 20, « Dummy ») : des copies d'armes (« Le Lapin de Jade » 11, « Lance de Polaris » 7, « Dualité » 1) et
des « Colis » qui imitent une arme. Ils sont masqués par défaut en Recherche (sélectionnables par la catégorie
« Objets factices »). **Validé par l'utilisateur** : Le Lapin de Jade, Dualité et la Lance de Polaris n'apparaissent
plus qu'une fois, en tant qu'arme réelle ; sa seconde Lance de Polaris (copie factice possédée) garde son icône de
type et affiche son anti-champion. Détail : `CHANGELOG.md` (0.3.1 et 0.3.2) et
`knowledge-base/28_ARMES_EXOTIQUES_ANTI_CHAMPION.md`.

✅ **CLOS le 06/10/2026 (soir) : « Tueur de souhaits »**. La vraie arme (objet 814876684) figurait bien dans les résultats de la 0.3.3 (capture de l'utilisateur : icône d'arc, anti-champion, source, « + Ajouter au build ») ; interrogé, l'utilisateur a confirmé qu'il s'agissait d'une **erreur de lecture de sa part** (« Exactement… Oups »). Rien à corriger. ⚠️ Ce que j'avais ajouté pour ce point (liste des résultats masqués, recherche tolérante `normaliserRecherche`, index `v3`) **n'est pas démontré nécessaire** : on ignore même si l'arme manquait vraiment en 0.3.1. Ces ajouts sont conservés parce qu'ils sont utiles en eux-mêmes (rien ne disparaît plus en silence ; « coeur » retrouve « cœur », validé), pas parce qu'ils auraient réglé un défaut prouvé.

**À surveiller** : d'autres objets de type 30 (16 définitions) et 19 (9), des ornements, emblèmes et étapes de quête apparaissent dans le rapport des exotiques ; ils sont déjà classés ailleurs ou sans emplacement.

### 20. Vérification avant livraison : ce que l'assistant ne peut pas faire (05/10/2026)

**Leçon du 05/10/2026** : l'utilisateur n'a pas pu installer le logiciel à cause d'une erreur `TS2540` (`RangeeBoutonsEgaux.tsx` : `refMesure.current = el`), que ma
vérification n'avait pas vue. **Cause** : elle utilise un substitut de React écrit à la main (`/home/claude/stubs/react.d.ts`) faute des vrais paquets (pas d'Internet dans
l'environnement de l'assistant), et ce substitut laissait `RefObject.current` modifiable. **Corrigé** : le substitut reproduit maintenant les surcharges de `useRef` de
`@types/react` 18.3 ; vérifié en remettant l'ancienne ligne, qui produit l'erreur exacte de l'utilisateur. `npm run dev` (Vite) ne vérifie pas les types : une erreur de ce type
n'apparaît qu'à `npm run build`.

**Ce qui reste invérifiable ici** et ne peut être confirmé que par l'utilisateur : le vrai `npm run build`, l'installateur (NSIS, Windows), le comportement réel d'Electron (dossier
de données, impression PDF), le Manifest réel, la police de Windows. Toute livraison doit le dire explicitement, et la liste de tests commence par `npm.cmd run build`.

### 21. Police personnalisée « D2 Build Analyzer Vector » — ABANDONNÉE (06/10/2026)

**Décision de l'utilisateur** : « laisse tomber » : cette police est standard (dérivée de Lato) ; il voulait une
police **inspirée par le titre « Forge Armory » du logo**. Ne pas y revenir sans demande. Constats (couverture des
caractères, manques pour l'interface, licence) : `documentation/todo/ARCHIVE-TODO-2026-10-06.md`.

### 22. Logo de fond et mode diagnostic (06/10/2026) — validés

✅ **Logo de l'application en arrière-plan** (`components/FondLogo.tsx`, monté dans `App.tsx`) : validé par l'utilisateur le 06/10/2026 (4 tests : visible, fixe, ne gêne rien, tiroirs et fenêtres opaques). Opacité 10 % (`OPACITE_FOND_APP`), sans remarque de sa part ; `.pilier-carte` translucide (0,86). ✅ **Mode diagnostic** activable en pied de page, aussi dans l'appli installée (`lib/modeDiagnostic.ts`) : validé (3 tests) ; il concerne seulement les outils ACTIFS (`DashboardPage`, `RechercheManifest`, `GrilleDoctrine`) ; les autres usages de `import.meta.env.DEV` (outils archivés) n'ont pas été touchés.
✅ **`run dev` : l'écart de la 0.3.1 ne s'est pas reproduit en 0.3.3** (la catégorie « Objets factices », la ligne `[dev]` et le panneau « Départager » y apparaissent, et la Doctrine y tient sur une ligne). **Sa cause reste inconnue** (hypothèses jamais vérifiées : cache du navigateur ou de Vite, fichiers partiellement remplacés à l'extraction) ; s'il revient, demander ce que montre le pied de page, la console (F12) et le contenu du dossier.

**Piste** : si le mode diagnostic devait aussi servir à l'ouverture à des tiers (phase 2 de la feuille de route), décider s'il reste visible en pied de page.

### 23. Lien « Contact » en pied de page : rapports de bugs et suggestions des utilisateurs (demande du 06/10/2026)

Demande de l'utilisateur : ajouter, **en pied de page**, un lien « Contact » qui permette de recueillir **les rapports de bugs ET les suggestions** des utilisateurs. À rapprocher de la phase 2 « Ouverture » de la feuille de route (logiciel utilisable par des tiers, diffusion restreinte, phase 3 : prise en compte des retours et résolution des bugs). Le pied de page porte déjà le crédit, la version et le réglage « Outils de diagnostic » : le lien se place à côté, discret.
**Rien n'est décidé ni développé**. Décisions à prendre avant de coder :
- **canal de réception** : adresse e-mail dédiée, formulaire en ligne, dépôt de suivi (issues), serveur de discussion… Critères : aucun compte exigé de l'utilisateur, coût nul, protection contre le courrier indésirable, respect des données personnelles si une adresse e-mail est collectée ;
- **ce que fait le lien** : ouvrir un message `mailto:` (il exige un logiciel de messagerie configuré, ce qui n'est pas toujours le cas sous Windows) ou ouvrir une page web dans le navigateur par défaut (dans Electron, un lien externe doit passer par le navigateur du système : voir comment l'appli ouvre déjà ses liens externes) ;
- **deux motifs distincts** : « Signaler un bug » et « Proposer une idée » ;
- **informations utiles, jamais sensibles, proposées en pré-remplissage** : version de l'appli (`__VERSION_APP__`), version du jeu prise en compte (`VERSION_JEU`), appli installée ou `run dev`, système d'exploitation. **Jamais** les jetons Bungie, les identifiants du compte, ni le contenu des builds enregistrés sans accord explicite ; rien n'est envoyé automatiquement : l'utilisateur voit et envoie lui-même. Si le mode diagnostic est actif, option de joindre le rapport de diagnostic (copié dans le presse-papiers) ;
- **message de confidentialité** : dire clairement ce qui est transmis et à qui.
À prévoir ensuite : libellé du lien, test du lien dans l'appli installée (ouverture du navigateur ou de la messagerie), et une phrase dans le guide de démarrage pour les invités.

### 24. Auteur des builds (fait et validé le 06/10/2026, v0.3.3)

✅ **Fait et validé par l'utilisateur (5 tests)** : un build enregistré porte le pseudo de son auteur (`auteur`, facultatif, figé à l'enregistrement) : celui du bloc Connexion, seulement si l'on est connecté ; affiché sur la carte, dans « Voir », dans la copie texte et les exports, et dans le bloc « Partage du build » ; il voyage avec le fichier d'échange et reste celui de l'auteur à l'import. Détail et vérifications : `CHANGELOG.md` (0.3.3). **Aucune migration** : les builds existants n'ont pas d'auteur.
**Pistes, non demandées, à proposer si besoin** :
- **attribuer les anciens builds à l'utilisateur** : une action explicite (« Ces builds sont les miens ») plutôt qu'une attribution automatique : on ne peut pas savoir si un ancien build a été importé d'un ami ;
- **éditer l'auteur** dans la fenêtre « Modifier... » (créditer quelqu'un d'autre, corriger après un changement de pseudo) ;
- **confidentialité** : le pseudo Bungie est public, mais il part dans tout fichier ou image partagé ; si un utilisateur ne le souhaite pas, prévoir une case « inclure mon pseudo dans les exports » (à décider avec la phase 2, ouverture à des tiers) ;
- affichage de l'auteur dans le futur onglet « Load-out » (§ 16).

## Pistes abandonnées ou mises de côté (à ne pas reproposer sans raison)

- **Icônes des 21 perks par artefact, par la table d'extraction** — abandonné (26/08) : la table lue par
  l'extraction (`DestinyArtifactDefinition`) ne décrit que l'ancien système d'artefact. ⚠️ **L'objectif a été
  repris autrement le 05/10/2026** : les icônes viennent des objets d'artefact du Manifest, retrouvés par leur nom
  (section 17) ; 128 perks sur 147 en ont une.
- **Faire porter l'origine du texte jusqu'à `detecterVerbes`** (Pilier 2) —
  dépriorisé (26/08) : les marqueurs textuels précis suffisent (3,4 % de
  cas ambigus) ; à revisiter seulement si de nouveaux cas s'accumulent.

Détails dans l'archive de la TODO et dans `CHANGELOG.md`.

---

## Comment tenir cette liste à jour

- **Nom du fichier de tests** (règle de l'utilisateur, 06/10/2026) : le PDF de la liste de tests porte le **numéro de version de l'appli** : `A-TESTER-<version>.pdf` (par exemple `A-TESTER-0.3.3.pdf`) (généré par `documentation/sources/outil-a-tester-pdf.py`, qui lit la version dans `package.json`). Le zip, lui, garde `forge-armory-ver_0_3_1.zip`.

- Un item **résolu** est retiré d'ici et décrit dans `CHANGELOG.md` — pas
  laissé barré : la liste doit rester lisible.
- Un item qui **attend une information** précise l'action attendue, pas
  seulement le problème.
- Les décisions de conception vont dans le `README.md` : ce fichier ne liste
  que ce qui reste à faire.
