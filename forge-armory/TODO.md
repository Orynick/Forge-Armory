# TODO — D2 Build Analyzer

Priorités :
- 🔴 **Bloquant** — fausse le résultat ou empêche d'avancer
- 🟡 **Important** — limite la valeur de l'appli
- 🔵 **Confort / plus tard**

Ce fichier ne liste que ce qui **reste à faire**. Ce qui est terminé est
décrit dans `DEVLOG.md` (avec les explications de chaque changement) ;
l'état complet de la TODO avant son tri du 30/09/2026 est conservé mot
pour mot dans `documentation/todo/ARCHIVE-TODO-2026-09-30.md`, et les
passages retirés ou condensés lors du nettoyage du 06/10/2026 dans
`documentation/todo/ARCHIVE-TODO-2026-10-06.md`. Conception du scoring :
section « Le scoring » de `NOTES-CONCEPTION.md`. Tests en cours :
`A-TESTER-<version>.pdf` (le numéro de version de l'appli est dans le nom ;
version courante : 0.5.1).

---

## 🧽 Nettoyage (audit du 16/10/2026) — ✅ v0.4.13 (17/10/2026)

- ✅ **Code mort supprimé** : `recupererCoffre`, `recupererInventairePersonnages`, `recupererMembershipsActuels` (api.ts) ; `renommerLoadout`, `modifierDescription`, `modifierIcone` (stockage.ts) ; `scoreBonusSets` + `calculerBonusSetsActifs` + `regrouperParSet` + `DEMO_SETS` (armorSets.ts).
- ✅ **Exports inutiles retirés** (fonctions conservées) : `destinationsPossibles`, `formaterNomBungie`, `niveauCorrectifs`, `Correctif`, `NiveauCorrectifs`, `TriompheSoloFlawless`, `ClePilier`.
- 🔵 **Découpages à l'étude** (doctrine.ts 3 052 lignes, SelecteurInventaire.tsx, ResumeBuild.tsx, search.ts, pillars.ts, PanneauLoadouts.tsx, verbes.ts ; données SVG : IconeLoadout.tsx, IconeTypeArme.tsx) — pas du code à réécrire.
- 🔵 **Défaut préexistant signalé le 17/10/2026** : `npm run build` échoue sur la 0.4.12 d'origine (3 erreurs TypeScript dans `BadgeSaison.tsx` : `RETRAIT_BADGE_VIGNETTE`, `tailleBadgeVignette`, `partSymbole` absents de `lib/forge/tailleVignette`). À traiter en version corrective, avec l'accord de l'utilisateur.

## 🧭 Prochaines étapes — mises à jour le 12/10/2026

L'ordre de marche fixé par l'utilisateur le 30/09/2026 est **accompli**
pour ses deux premières étapes : v0.2.9 validée ; Electron mis à niveau
(44.5.1, livré en v0.3.0) et validé (PDF de tests renvoyé le 02/10/2026).
Le renommage « Forge Armory » est lui aussi validé (06/10/2026, section 12).

À partir d'ici :

1. **Valider la 0.4.12** (`A-TESTER-0.4.12.pdf`, 16 tests : installation, **Collection des armures** (lecture, grisage, filtres, fenêtre, diagnostic), **Forge des armures** (liste, fenêtre et simulation, bouton Forge des fenêtres Détails, diagnostic), et les tests encore ouverts de la 0.4.11 : taille de l'icône de saison sur les miniatures, nom de la saison déduit du filigrane, cadre noir des fenêtres Détails). **À fournir par l'utilisateur** : le logo « Solo sans mourir » (« on y reviendra »).
2. **Feuille de route issue du fichier « Retours et ajouts du 12/10 »** (dans cet ordre, sauf avis contraire) :
   - **0.4.2 — bouton « Transférer vers »** ✅ **livré et validé le 12/10/2026, essais en jeu compris**. Règles retenues : objet équipé non transférable, confirmation, un objet à la fois. **Pistes pour plus tard** (non faites) : transférer plusieurs objets d'un coup ; équiper automatiquement un remplaçant pour libérer un objet équipé (logique déjà présente dans `equiper.ts`) ; une armure vers un personnage d'une autre classe n'est volontairement pas proposée. Description d'origine : (Mon Inventaire et Coffre → Chasseur, Titan, Arcaniste, Coffre). Faisable : `TransferItem` et `EquipItem` existent (`lib/bungie/equiper.ts`) et la permission d'écriture est déjà demandée. À cadrer : un transfert entre deux personnages passe par le Coffre (deux appels) ; un objet équipé ne peut pas être transféré sans équiper un remplaçant ; erreurs de place (inventaire plein) à expliquer ; confirmation avant d'agir. Ne se teste vraiment qu'en jeu.
   - ~~Décisions à prendre avant de commencer « Transférer vers »~~ (prises le 12/10/2026 : mes trois recommandations ont été retenues) (recommandation entre parenthèses) : (1) un objet **équipé** : le bloquer avec une explication, ou équiper automatiquement un remplaçant (bloquer en première version : plus sûr, rien ne bouge dans l'équipement sans que l'utilisateur l'ait décidé) ; (2) **confirmation** avant chaque transfert (oui, au moins pour un transfert entre deux personnages qui passe par le Coffre) ; (3) transférer **un objet à la fois** en première version (oui).
   - **0.4.3 et suivantes — contenu de l'onglet Forge** : (a) toutes les armes et armures du jeu avec leurs rolls de perks, sans les perks inutiles ; (b) armes et armures possédées, rolls possibles, perks actifs de l'arme et mod d'arme. **Reprend l'ancien chantier « Modification des perks et des mods » (section 2).**
   - **Forge : spécification reçue le 13/10/2026** (document daté du 12/10/2026, recopié dans `NOTES-CONCEPTION.md`, section « Spécifications de la Forge », avec mon analyse). **Phase 1 = simulation locale** (aucune écriture chez Bungie, la Forge n'écrit rien) ; **Phase 2 = application réelle**, après validation complète de la Phase 1. **Découpage proposé** : (0.4.3) **Collection des armes**, lecture seule : liste filtrable et recherche, grisé/couleurs, colonnes de perks, interrupteur « Afficher les perks inutiles » ; (0.4.4) **Inventaire des armes** : une perk par colonne et un mod, persistance locale, bouton « Forge » dans les trois popups Détails (Inventaire, Coffre, Mon Build) ; (0.4.5) **Scoring** : les perks simulés alimentent le build en temps réel, « Équiper vers Mon Build » local ; puis les armures ; la Phase 2 en dernier. **Logique de tri des colonnes de la popup Détails : relue et résumée dans `NOTES-CONCEPTION.md`, à réutiliser telle quelle (aucune réécriture) ; toute évolution se teste dans la popup ET dans la Forge.**
   - **Forge : avancement (14/10/2026)** : les douze défauts de la spécification sont **acceptés**. **0.4.3 à 0.4.9 livrées et VALIDÉES** (Collection ; Manifest périmé ; cartes à quatre icônes ; boutons stylisés ; perks améliorés ; Legendarium ; page Forge sans titre ; vue Inventaire avec simulation locale ; quatre niveaux de perks ; antichampion MIDA ; **lien Forge → score** : le score et Mon Build reçoivent le build AVEC la simulation, badge « simulé », avertissement à l'équipement, bouton « Forge » des trois fenêtres Détails ; enregistrement, partage, export et Load-outs sur les perks RÉELS ; exports sur les seuls perks sélectionnés). **0.4.10 livrée, en test** : bouton « ← Retour » dans la fenêtre de la Forge (défaut de la 0.4.9) ; **armes façonnées** (icône du jeu, filtre, note ; repérées par le perk équipé « Arme façonnée », 4029346515, vu sur la Mesure corrective). **Décidé le 14/10/2026** : on NE lit PAS les perks déverrouillés d'une arme façonnée (« pas bien utile : on garde les perks possibles sur l'arme et les perks actifs dans Détails ») ; l'icône du jeu (saumon `#e49f87`, en bas à gauche de la vignette) marque les armes façonnées. **Fait le 14/10/2026 (demande de l'utilisateur)** : la même icône est aussi posée dans Mon Inventaire, le Coffre et Mon Build (composant partagé `VignetteArme`). **À décider avec l'utilisateur** : (1) les **armures** : étape 1 livrée en 0.4.12 (mods, simulation locale, sans lien avec le score) : à décider, la suite (lien avec le score et Mon Build, énergie des mods ; le bouton Forge des fenêtres Détails des armures et la Collection des armures sont faits) ; (2) la **Phase 2** (écriture vers Bungie : insertion réelle des perks) en dernier. Pistes notées : recalcul des statistiques de l'arme selon les perks simulés (non fait : le score n'utilise pas celles des armes) ; restauration du défilement au retour de la Forge ; la Forge se démonte quand on la quitte (l'inventaire chargé et la fenêtre ouverte ne sont pas gardés).
   - **0.4.12 livrée, en test (15/10/2026) : FORGE DES ARMURES, ÉTAPE 1** (« Go les armures ») : choix Armes / Armures dans la vue Inventaire ; liste filtrable de tes armures ; fenêtre par armure (emplacements fixes / modifiables / cosmétiques, plug équipé ✓ et plugs disponibles, six statistiques avant → après) ; **simulation locale des MODS**, SANS lien avec le score ni Mon Build (prouvé par un espion de score et un journal réseau). **Hypothèse de conception à confirmer** : on ne change que les mods. **À CONTRÔLER sur le compte de l'utilisateur** : que le composant 310 liste bien les mods possibles d'un emplacement d'armure (diagnostic `npm run dev`). Le bouton « Forge » des fenêtres Détails des armures est fait (16/10/2026, Mon Inventaire, Coffre, Mon Build). La Collection des armures est faite (16/10/2026, lecture seule, mods et cosmétiques repliés). **Étapes suivantes à décider** : lien avec le score et Mon Build (recalcul des statistiques de l'armure du build), énergie des mods.
   - **0.4.11 livrée, en test (14/10/2026)** : fenêtres des armes : bouton « Retour » aligné à gauche de « Mettre dans Mon Build » ; icône façonnée à gauche du nom (Forge et Détails) ; encadré explicatif retiré ; quatre icônes dans la fenêtre de la Forge ; **perks équipés TOUJOURS présents et cochés** (toutes les armes, Forge et Détails) et **tous les perks possibles pour les armes façonnées** (fusion des sources du Manifest : liste directe + jeux de plugs + perk initial). **POINT OUVERT** : les diagnostics réels de la Confiance (autre révision), de la Défense dorée et de la Grande Faucheuse montraient le même motif (liste directe d'un perk + pool derrière : un seul perk affiché) ; NON étendu à ces armes tant que l'utilisateur ne le confirme pas. **Lecture à confirmer** : « légende » = l'encadré explicatif des armes façonnées. **Confirmé (précision de l'utilisateur, version inchangée)** : les quatre icônes de la fenêtre de la Forge sont à DROITE du nom, sur la ligne du titre, comme dans les fenêtres Détails.
   - **Icône de saison sur les vignettes d'armes et d'armures ✅ FAIT en 0.4.11 (demande du 14/10/2026, soir ; ajustée le même soir)** : sur les vignettes, le **filigrane de Bungie est superposé tel quel**, en haut à gauche, **à sa taille d'origine** (`FiligraneSaison` ; les essais de pastille agrandie puis alignée ont été rejetés le 15/10/2026 : ne pas les refaire sans demande) ; dans les fenêtres Détails (Mon Inventaire, Coffre, Mon Build, Forge, Collection ; armures comprises : **lecture à confirmer**), à droite du nom, **sans cadre noir** (cadrage serré et mélange en mode écran : l'image de Bungie contient une bande sombre translucide). **Diagnostics de l'utilisateur (14/10/2026)** : pour Mesure corrective, As de pique et Eyasluna, `iconWatermark` est présent mais **`seasonHash` est ABSENT** : le NOM de la saison n'est pas disponible par ce chemin (infobulle générique « Saison de l'objet »). **NOM DE LA SAISON ✅ FAIT (14/10/2026, nuit ; demande « Oui »)** : déduit du filigrane par un balayage en arrière-plan du Manifest (voisins de même image qui ont un `seasonHash`, vote majoritaire ; rien de DIM n'est recopié). **À CONTRÔLER sur les données de l'utilisateur** : que son Manifest contienne des objets avec `seasonHash` (diagnostic `npm run dev` : « balayage des saisons : fini, N objet(s)… ») ; s'il n'en contient AUCUN, les noms ne s'afficheront pas et il faudra une autre piste (tableau statique « filigrane → saison » : données de DIM non récupérées, à demander ou à reconstruire). **À CONTRÔLER** : le cadrage sur les symboles d'AUTRES saisons (`CADRAGE_SAISON` ; mesuré sur un seul symbole) . **Non ajouté (non demandé)** : exports, panneau des Load-outs, résultats de la recherche dans le Manifest.
   - **Page Forge : titre « Forge » retiré** ✅ **livré en 0.4.5** (13/10/2026, demande de l'utilisateur pendant ses tests de la 0.4.4) : la page garde son nom pour les lecteurs d'écran (région « Forge »), sa note grise et ses deux boutons de sous-menu.
   - **Bouton « Bibliothèque » devenu « Legendarium »** ✅ **fait en 0.4.4** (13/10/2026, demande de l'utilisateur, avec l'archive de visuels v5) : libellé, images, titre et message de la page. L'identifiant interne `bibliotheque` et le fichier `Bibliotheque.tsx` gardent l'ancien nom (la vue choisie est mémorisée). Les cinq fichiers fabriqués dépendent d'une source de lettres conservée dans `sources-lettres/`.
   - **Forge : boutons stylisés des sous-menus** ✅ **branchés en 0.4.4** (demande de l'utilisateur du 13/10/2026, après les tests de la 0.4.3) : « Collection » = le bouton de l'archive de visuels v4 ; « Inventaire » = un bouton au format du sélecteur fabriqué par `scripts/generer-propositions-solo-forge.mjs` (option 2, le titre repliable « Mon Inventaire » de Build Analyzer étant environ 1,8 fois plus large et sans lueur à l'état sélectionné). Composant `BoutonSousMenu` (`SelecteurVues.tsx`), mêmes images à deux états et mêmes règles CSS que le sélecteur principal, hauteur 44 px, rôle d'onglet et noms accessibles conservés. **À valider par l'utilisateur** : le dessin du bouton « Inventaire » ; à remplacer par celui de l'auteur des visuels s'il en livre un (voir `ressources-installateur/forge-armory/inventaire-0.4.3/LISEZMOI.md`).
   - **Forge : perks améliorés (analyse des diagnostics du 13/10/2026)** : une version améliorée est un OBJET DISTINCT (autre hash), de même nom que sa base, dans la même colonne, typé « Canon / Chargeur / Attribut / Particularité d'origine / Mod d'arme amélioré(e) ». Dans la révision « à paliers » de Confiance, 53 paires normales (l'améliorée est toujours listée après sa base) et un cas ambigu (« Chargeur abandonné », même type pour les deux : reconnu par la position, signalé « probable »). **Affichage fait en 0.4.4** (vue Collection) : `lib/manifest/perksAmeliores.ts`. **Réponses de l'utilisateur (13/10/2026)** : aucune paire fausse constatée (il reste vigilant) ; « Chargeur abandonné » existe bien en version améliorée (position confirmée) ; Confiance révision B et Défense dorée : « Non » (pas de roll fixe dans le jeu) mais l'affichage de l'appli lui semble cohérent : règle conservée, À ROUVRIR avec un diagnostic si une arme montre moins d'options que dans le jeu. **Encore à éclaircir** : (1) Confiance révision B, Défense dorée et Grande Faucheuse (temps perdu) n'affichent qu'UNE option par colonne : la règle validée « les `reusablePlugItems` d'abord » l'emporte sur le `randomizedPlugSet` que ces prises portent aussi (en question posée à l'utilisateur : roll fixe dans le jeu ?) ; (2) les textes « Amélioration de palier 2 à 5 » et « Palier Pièce maîtresse » montrent que les versions améliorées dépendent du **système de paliers** des armes, pas seulement du masterwork : pour l'Inventaire (0.4.5), quelle version s'applique à un exemplaire possédé dépend de son palier : lire l'état de l'exemplaire (composants d'instance) et prévoir un diagnostic d'un exemplaire possédé ; (3) colonnes de fabrication des armes forgeables (Grande Faucheuse temps perdu) : non traitées.
   - **Forge : points à trancher** (le document en annonçait aucun ; détail et défauts dans `NOTES-CONCEPTION.md`) : (1) « Transférer vers » existe déjà depuis la 0.4.2 : en Phase 2 il reste « équiper vers un personnage » et l'écriture des perks ; (2) perks simulés et équipement en jeu : badge « simulé » et avertissement ; (3) « pas de combinaison impossible » : le Manifest n'a pas de règles d'exclusion entre colonnes, garantie = une perk par colonne, prise dans son pool ; (4) « version améliorée » ≠ masterwork, et l'état masterwork d'une arme n'est pas lu aujourd'hui : lecture à ajouter et lien perk ↔ jumeau amélioré à vérifier sur ton Manifest ; (5) Collection grisée : nouvelle lecture Bungie (collections) ; un objet sans `collectibleHash` ne peut pas être classé ; (6) anti-bruit : filtre fondé sur le Manifest + liste modifiable, pas de dépendance à DIM, light.gg ou DestinyRecipes ; (7) Manifest : vérification de version automatique à la connexion, téléchargement automatique seulement si un cache existe ; (8) l'onglet Forge héberge les deux vues, le bouton « Forge » des popups y mène directement ; (9) l'impact en temps réel s'affiche dans les cartes du Scoring (le bloc Doctrine est la sous-classe) ; (10) armures : à définir (que sélectionne-t-on sur une armure ?), armes d'abord ; (11) données : clé `socketIndex`, hashes en nombres, sélection par `itemInstanceId` ; (12) limite du jeu pour la Phase 2 : les traits d'une arme à rolls aléatoires non forgée ne sont pas modifiables en jeu (à vérifier avec l'API).
   - **Reste de la liste du 12/10** : ~~logos « Arme » et « Armure » dans l'export~~ ✅ intégrés en 0.4.1 (archive de visuels v3) ; ~~bug du Filobscur~~ ✅ cause établie (les objets du Filobscur réutilisent les fichiers d'icône de la Stase dans les données de Bungie) et corrigé en 0.4.1 par recoloration, ✅ validé le 12/10/2026 (tous les tests cochés, sans demande de réglage de la teinte).
3. **Sécurité, avant toute ouverture à des tiers** : ~~Vite, React Router~~ ✅
   (faits en v0.5.1, voir section 1), puis la politique de sécurité de contenu
   (CSP — reste de la section 1, chantier `draft-sec`).

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
le 30/09/2026 ; tests renvoyés par l'utilisateur le 02/10/2026 (archivés dans `documentation/tests/`, archive supprimée le 14/10/2026 à sa demande).
`npm.cmd ci` validé le 30/09/2026 (479 paquets installés à l'identique depuis `package-lock.json`). Détail
et revue des changements incompatibles : `DEVLOG.md`.

✅ **TERMINÉ en v0.5.1 (23/10/2026, chantier `draft-deps`).** `npm audit` : **0 vulnérabilité** (contre 18 au départ, 4 le 30/09).
- ✅ **Vite / esbuild** : `vite` 5 → **7.3.7** (+ `@vitejs/plugin-react` 4 → 5, `vite-plugin-mkcert` 1 → 2) ;
- ✅ **React Router** : `react-router-dom` 6 → **7.18.4** (+ React 18 → **19.2.9**, Electron 44 → **45.0.0**) ;
- 🟡 **Reste : ajouter une politique de sécurité de contenu (CSP)**, à écrire puis tester pas à pas : une CSP trop
  stricte casse silencieusement les appels Bungie, le WebAssembly de sql.js ou les images distantes.
  (Chantier `draft-sec` en cours.)

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

## 🟢 Confort / plus tard

### 5. Capacités de doctrine anti-champion — autres verbes à confirmer ?

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


### 11. Legendarium — bibliothèque de Lore en lecture passive ✅ LIVRÉ en v0.5.0 (22/10/2026)

🟡 **Important** — chantier **LIVRÉ sur `main` le 22/10/2026** (v0.5.0, merge `draft-legendarium` → `main`, commit `821a785`). La branche `draft-legendarium` reste en place (historique du chantier). La spécification complète (décisions verrouillées, palette, interactions, critères d'acceptation, plan de découpage) est dans `documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md` — **ce document fait foi** ; toute divergence doit être signalée avant codage.

**Résumé** : remplacer le panneau « en construction » de la page Legendarium (vue `bibliotheque`, `src/components/Bibliotheque.tsx`) par une bibliothèque de Lore en **lecture passive** (aucune écriture, aucun état persistant, aucun impact sur le scoring ni le build). Sources : `DestinyLoreDefinition` (Légendes D2) et champ `lore` de `DestinyItemDefinition` (objets) via le **cache manifeste existant** (`src/lib/manifest/download.ts`) ; Grimoire D1 via l'API legacy Bungie (repli : données statiques Ishtar Collective). Ordre global : Grimoire D1 → Légendes D2 → armes et armures → cosmétiques (Spectres, Vaisseaux, Passereaux). Armures : casque → gants → torse → jambes → objet de classe, regroupées par classe. Mise en page en trois zones (bandeau titre + recherche + indicateur de cache ; colonne latérale sections puis livres ; zone de lecture avec précédent/suivant). Palette verrouillée « Parchemin / Hologramme » (D1 serif ivoire sur brun, D2 sans-serif cyan sur bleu-noir ; repli ambre/bleu acier ; code couleur par section exclu). Bouton « Lire le Lore » dans les fiches Détails (haut de fiche, justifié à droite, sous la croix, uniquement si l'objet a un Lore), lien profond vers la page, bouton de retour vers l'objet, parcours inverse page → objets porteurs.

**✅ Étape 1 FAITE (20/10/2026, fondations, lecture seule)** : `src/types/manifest.ts` (champ `lore`, `redacted`, type `DestinyLoreDefinition`) ; `src/lib/legendarium/types.ts` (modèle + identifiants stables de liens profonds) ; `src/lib/legendarium/palette.ts` (palette verrouillée centralisée, repli en un échange de constante) ; `src/lib/legendarium/modele.ts` (lecture des tables via le cache existant, règle des ensembles, recherche, lien profond, parcours inverse) ; test `legendarium-modele` **28/28**. `tsc` zéro erreur, `npm run build` strict ✓.

**✅ Étape 2 FAITE (21/10/2026, page Legendarium)** : `src/components/Bibliotheque.tsx` réécrit — les TROIS ZONES de la spécification verrouillée §4 (bandeau titre + recherche toujours accessible + indicateur de cache ; colonne latérale sections → livres dans l'ordre global verrouillé ; zone de lecture avec œilleton/titre/sous-titre/libellé chrono/texte + navigation précédent/suivant), palette « Parchemin / Hologramme » verrouillée §5 appliquée à la zone de lecture (`data-ere="d1"` parchemin #2b2116 pour le Grimoire D1, `data-ere="d2"` hologramme #0d1520 pour le reste), parcours inverse (bloc « Objets portant ce Lore »), bouton de retour vers l'objet (provenance, prêt pour l'étape 5), recherche par mots-clés avec résultats cliquables (plafond 50). Le Grimoire D1 = **repli statique embarqué (6 livres / 834 cartes FR) lu via `import()` dynamique** — le chunk `grimoire-*.js` (~935 Ko) n'est chargé qu'à l'ouverture de la page, hors du bundle principal ; sections D2 depuis le Manifest via le cache existant. ÉTAT EN MÉMOIRE UNIQUEMENT (section, page, mot-clé — aucune persistance, lecture passive). ⚠️ REFACTOR PERF (même commit) : `modele.ts` gagne un INDEX des porteurs construit en UN SEUL balayage de la table des objets, mis en cache par base (WeakMap) — sans lui, la construction des livres re-balayait la table (~60 000 lignes) pour CHAQUE porteur (milliers de balayages, la page figerait). Tests : `legendarium-page` **24/24** (nouveau : 3 zones, ordre verrouillé, palette d1/d2, prev/next désactivés aux extrémités, parcours inverse, bouton retour, recherche, plafond 50) ; `legendarium-modele` **43/43** (2 nouveaux : 1 seul balayage + contenu identique) ; `legendarium` **5/5** ; `legendarium-fixtures` **18/18** ; `legendarium-grimoire` **23/23**. `tsc` zéro erreur, `npm run build` strict ✓.

**✅ Étape 4 PRÉPARÉE (20/10/2026, Grimoire D1)** : `src/lib/legendarium/grimoire.ts` (endpoint legacy `X-API-Key` + conversion livres → cartes + repli statique) ; test `legendarium-grimoire` **11/11** (contrat réseau vérifié : URL exacte + en-tête). **Retour réel de l'utilisateur (20/10)** : l'endpoint répond `ApiKeyMissingFromRequest` (ErrorCode 2102) — il EXISTE mais exige une clé `X-API-Key` valide. ⚠️ **CLARIFIÉ (20/10/2026, suite 3)** : le test de l'utilisateur était fait depuis son NAVIGATEUR (sans en-tête `X-API-Key`) — l'`ApiKeyMissingFromRequest` est attendu sans clé, l'endpoint est vivant. **Diagnostic ajouté** : `diagnostiquerGrimoire()` (`grimoire.ts`) + panneau dev `<details data-diagnostic-grimoire>` dans l'onglet Legendarium (`Bibliotheque.tsx`, `import.meta.env.DEV` uniquement) ; test `legendarium-grimoire` **15/15**. **✅ RÉSOLU (21/10/2026, diagnostic retourné)** : `{"clePresente":true,"statutHttp":200,"ok":true,"livres":0,"cartes":0}` — clé acceptée mais **AUCUN contenu** : Bungie ne sert plus le Grimoire via l'API D1. **Repli statique ACTIVÉ** : `scripts/generer-repli-grimoire.mjs` génère `src/data/grimoire-d1-repli.json` (930 Ko minifié) depuis The Grimoire Archive (`aureliendossantos/destiny-grimoire`, définitions D1 officielles de Bungie) — **6 livres / 834 cartes FR**, ordre officiel, HTML nettoyé, texte uniquement ; wrapper `src/data/grimoire-d1.ts`. `REPLI_GRIMOIRE_STATIQUE` alimenté ; un 200-vide retombe sur le repli peuplé ; diagnostic avec `contenuVide` + compteurs du repli. Test `legendarium-grimoire` **23/23**. Hors-ligne OK (JSON versionné, aucun téléchargement runtime). ⚠️ À l'étape 2 : charger le repli par `import()` dynamique (isoler les 930 Ko dans un chunk, pas dans le bundle principal).

**✅ Classement chronologique AJOUTÉ (20/10/2026, demande de l'utilisateur)** : les pages de Lore se classent **par défaut par ordre de sortie des extensions/saisons** — `rangChronoObjet` (Manifest `seasonHash` → `DestinySeasonDefinition.seasonNumber`, secours table DIM `saisonDeLObjet`, jamais estimé), `trierPagesChrono` (datées d'abord, rang croissant ; non datées en dernier par titre). ⚠️ Le livre **« Lore des armes »** et **« Cosmétiques »** sont classés chronologiquement ; **« Ensembles d'armures » garde la règle verrouillée** (classe → casque → gants → torse → jambes → objet de classe). Chaque page porte `rangChrono`/`libelleChrono` (affichable).

**✅ Étape 5 FAITE (21/10/2026, bouton « Lire le Lore » + lien profond + retour)** : `src/components/BoutonLireLore.tsx` (composant pur, bouton UNIQUEMENT si l'objet a un Lore lisible, haut de fiche, justifié à droite, sous la croix) ; `aLore(db, itemHash)` dans `modele.ts` (lecture LÉGÈRE, 2 définitions ciblées, AUCUN balayage) ; prop `onLireLore?` dans les 4 fiches Détails (`InventaireArmes`, `InventaireArmures`, `CollectionArmes`, `CollectionArmures`) + remontée `PageForge` → `DashboardPage` ; lien profond fiche → Legendarium (`cibleLegendarium = { pageId: "item:<hashObjet>", provenance }`, bascule de vue interne, état en mémoire, vues d'origine montées) ; `retourDepuisLegendarium()` restaure la vue d'origine. Tests : `legendarium-modele` **50/50** (7 nouveaux `aLore`), `legendarium-page` **29/29** (5 nouveaux bouton), `cablage-forge` **21/21**. `tsc` zéro erreur, `npm run build` strict ✓.

**⚠️ Retours utilisateur TRAITÉS (21/10/2026, suite 7)** :
- **Navigation Précédent/Suivant AU-DESSUS et EN-DESSOUS de la page** (pas DANS) : `ZoneLecture` (`Bibliotheque.tsx`) a désormais deux barres centrées (`data-nav-haut` avant l'œilleton, `data-nav-bas` après le parcours inverse), mêmes boutons/attributs. Tests `legendarium-page` **33/33**.
- **Bouton « Lire le Lore » aussi dans la pop-up Détails du BUILD ANALYZER** (`SelecteurInventaire.tsx` : prop `onLireLore?` sur `LigneObjet` + le composant `BoutonLireLore` sous la croix, passé par `DashboardPage`) ; l'action est la même `ouvrirLoreDepuisObjet` (provenance `origine: "analyseur"`). ⚠️ **RÉSOLU (suite 9, diagnostic retourné)** : le vrai Manifest utilise **`loreHash`** (pas `lore`) sur les objets et **`displayProperties.description`** (pas `body`) sur les Lores — diagnostic : 3 514 Lores, 38 894 objets, 0 avec les anciens noms. **Corrigé** : `hashLoreDe()` lit `loreHash` (secours `lore`), `corpsLore()` lit `displayProperties.description` (secours `body`). Tests de régression suite 9 (structure exacte du vrai Manifest). À valider en `npm run dev` : le bouton « Lire le Lore » doit apparaître dans les fiches (Inventaire, Coffre, Mon Build, Forge).
- **Boutons « Carrière » / « Accomplissements » ne s'ouvraient pas hors Build Analyzer** (retour utilisateur 21/10, suite 7) : ils étaient rendus dans le bloc Connexion (masqué `display:none` hors vue analyseur). **Une première correction (déplacement au-dessus du sélecteur de vue) a été ANNULÉE en suite 8** — l'utilisateur l'a signalée comme une régression (sortie de la section Connexion sans son accord). Les boutons sont REMIS dans le bloc Connexion. **Le bug reste OUVERT** : il est noté dans le TODO de **main** (§23) pour être traité séparément, avec l'accord de l'utilisateur.

**✅️ Navigation par livres FAITE (21/10/2026, suite 10, demande de l’utilisateur)** : la section « Légendes D2 » affiche désormais la hiérarchie **en jeu** — catégorie → livre (couverture + nombre de pages) → pages — lue dans l’arbre `DestinyPresentationNodeDefinition` (racine « Légendes » = hash 4077680549). Vérifié sur le VRAI Manifest FR : **4 catégories / 108 livres / 1 076 pages** ; ex: « Ces terres maudites » ∈ « La Frontière sans foi ni loi » (14 pages, couverture) ∈ « La Lumière ». La colonne latérale affiche une **grille de couvertures** (comme l’onglet Lore du jeu) ; la zone de lecture affiche la couverture en haut + l’œilleton « catégorie · livre ». **Repli** si l’arbre est absent : liste plate « Tomes de Légendes » (comportement d’avant). Les sections Grimoire D1 / armes et armures / cosmétiques sont INCHANGÉES (liste plate). Les 109 lores aussi portés par des objets le sont par des objets factices (exclus du parcours inverse) : les pages des livres n’affichent pas de bloc « objets porteurs », comme en jeu. Tests : `legendarium-modele` **78/78**, `legendarium-page` **45/45**. À valider en `npm run dev` (voir DEVLOG suite 10).

**✅ Suite 11 FAITE (22/10/2026, retours utilisateur sur l’étape 3)** : groupes **repliables, repliés par défaut** (catégories Légendes D2 + groupes objets/cosmétiques), **pas d’images dans le menu de sélection**, label « Armes et **A**rmures », **armes classées par type** (Cinétiques → Énergétiques → Lourdes), **armures groupées par PROVENANCE** (1 livre par ensemble, ex: « Armure de Sekris » = raid Léviathan, via `collectibleHash` → nœud parent), **ensembles ordonnés par saison de sortie**, **cosmétiques par type** (Spectres → Vaisseaux → Passereaux). ⚠️ **BUG RÉEL CORRIGÉ** : `saisonDeLObjet` testait le hash signé seul, mais le JSON de DIM stocke les hashes en **non signé** — 50 % des objets (dont TOUTES les armures avec collectible) ne trouvaient jamais leur saison. Corrigé (les deux formes testées) : 100 % des 4 418 objets avec lore sont maintenant datés. ⚠️ **AUTRE CORRECTION** : classement des porteurs par bucket réel (pas `itemType !== 3`) — sinon 1 178 ornements d’armure étaient classés « armes ». Tests : `legendarium-modele` **89/89**, `legendarium-page` **51/51**, `saisons-sources` **20/20**. Validé sur le VRAI Manifest FR : 455 pages armes, 1 041 pages armures (144 ensembles), 939 pages cosmétiques.

**✅ Suite 12 FAITE (22/10/2026, retours utilisateur sur la suite 11)** : (1) **couverture flottante en haut à gauche** de la page de lecture (`float:left`, `max-width:45%`, `height:auto`, jamais agrandie → **plus de pixellisation**), le texte s'écoule à droite puis continue dessous, `clear:both` sur le parcours inverse et la nav du bas (pas de superposition, pas de « colonne » réservée) ; (2) **repliables de NOMS D'OBJETS** (repliés par défaut) pour **Cinétiques, Énergétiques, Lourdes** et **Spectres, Vaisseaux, Passereaux, Autres** — chaque nom ouvre directement la page de Lore de l'objet (`LivreLore.listePages`, nouveau `GroupePages`) ; le groupe « Lore des armes » est supprimé ; les armures restent groupées par ensemble (« Ensembles d'armures ») ; (3) **compteur de pages sur UNE LIGNE, justifié à droite** (`margin-left:auto`) pour toutes les lignes de livres (nouveau `LigneLivre` partagé, titre tronqué `nowrap`+`ellipsis`). Validé sur le VRAI Manifest FR : Cinétiques 161p, Énergétiques 186p, Lourdes 109p, Spectres 73p, Vaisseaux 97p, Passereaux 102p, Autres 667p. Tests : `legendarium-page` **56/56**, `legendarium-modele` **89/89**, `legendarium-fixtures` **18/18**. Batterie logique 34/34 au vert. `tsc` 0, build strict ✓.

**✅ Suite 13 FAITE (22/10/2026, remarque avant test de la suite 12)** : (1) **compteur « page X/Y »** dans l'œilleton de la zone de lecture — **au même niveau que le titre du livre, justifié à droite** (ex: « La Lumière · La Frontière sans foi ni loi » … « page 1/14 ») ; (2) **ensembles d'armures : DEUX NIVEAUX REPLIABLES** — niveau 1 = l'ensemble (replié par défaut), niveau 2 = la **CLASSE** (Titan/Chasseur/Arcaniste, ordre verrouillé, **icône** : Manifest `DestinyClassDefinition.displayProperties.icon` quand présent, sinon **icône locale `IconeClasse`** disque coloré + SVG) repliée par défaut, niveau 3 = la liste des **noms de pièces** (clic direct vers la page de Lore) — chemin : **Ensemble → Classe → sélection de la page à lire** ; (3) cosmétiques : **même logique que les armes** (déjà fait en suite 12). ⚠️ **VALIDÉ VRAI Manifest FR** : `DestinyClassDefinition` a `hasIcon: false` (aucune icône) → repli `IconeClasse` local ; **145/145 ensembles** ont `groupesPages`, ex « Armure de BrayTech » = Titan 5 → Chasseur 5 → Arcaniste 5, **0 perte de pages**. ⚠️ **CORRIGÉ en validation** : la classe se lit sur le Lore (pas sur le hash d'item) — sinon les ensembles avec réédition perdaient des pièces (« Armure de Rull » : 5 pages → 3 groupes au lieu de 5). Tests : `legendarium-modele` **94/94**, `legendarium-page` **64/64**. `tsc` 0, build strict ✓.

**✅ Suite 14 FAITE (22/10/2026, correction d'un malentendu sur la suite 13)** : (1) **ensembles d'armures : hiérarchie INVERSÉE** — UN SEUL livre « Ensembles d'armures » (compteur = total des pages) avec un repliable par **CLASSE** (Titan/Chasseur/Arcaniste, icône Manifest ou locale `IconeClasse`, replié par défaut), puis un repliable par **NOM D'ENSEMBLE** (dans l'ordre chronologique de sortie des saisons, replié par défaut), puis les **noms de pièces** (clic direct) — chemin : **Classe → Ensemble → pièces** (l'utilisateur avait demandé Classe → Ensemble → pièces, la suite 13 faisait Ensemble → Classe → pièces). Le livre garde `pages` (ordre verrouillé global classe → slots) pour la lecture. (2) **Cosmétiques « Autres » classés par CLASSE** : le livre « Autres » (doctrines : Brise-soleil, Grâce survoltée, Lame de l'aube, Voie abyssale…) est un repliable de classes (Titan/Chasseur/Arcaniste, icône) → **noms d'objets** (clic direct) ; les cosmétiques sans classe connue (artefacts, ornements) dans un groupe « Sans classe » en dernier. Nouveau type `GroupeClassePages` (`ensembles?` OU `pages?`, classe optionnelle). Recherche : les noms de sous-groupes (classes, ensembles) sont cherchés, ET une requête multi-mots (ex: « raid A ») correspond si chaque mot est trouvé dans le livre ou ses pages. Tests : `legendarium-modele` **96/96**, `legendarium-page` **64/64**, `legendarium-fixtures` **19/19**. `tsc` 0, build strict ✓.

**✅ Étape 6 FAITE (22/10/2026, vérification des 9 critères d'acceptation)** : nouveau test `tests/logique/legendarium-acceptation.test.ts` (**34/34 contrôles**) vérifiant UN PAR UN les 9 critères de la spécification verrouillée §7 — (1) Légendes D2 + Grimoire D1 regroupés par livres comme en jeu ; (2) ordre global D1 → D2 → armes/armures → cosmétiques ; (3) armures casque → gants → torse → jambes → marque par classe (Titan → Chasseur → Arcaniste) ; (4) recherche par mots-clés (+ avancée suite 15 : guillemets/`+`/`-`/`Aa`) ; (5) bouton « Lire le Lore » uniquement si Lore présent, haut de fiche, justifié à droite, sous la croix, dans les 5 fiches ; (6) parcours inverse page → objets porteurs + lien profond `item:<hash>` ; (7) Spectres/Vaisseaux/Passereaux listés avec leur Lore ; (8) **lecture passive vérifiée** : aucun import scoring/build, aucun POST/PUT/DELETE réseau (que des GET), aucun stockage persistant, composant bouton pur, cible en `useState` (mémoire) ; (9) cache manifeste réutilisé (pas de second téléchargement), Grimoire D1 en `import()` dynamique, dépendance à sens unique (le cache n'importe rien du Legendarium). Batterie logique complète : **35/35 suites, 686/686 contrôles**. `tsc` 0, build strict ✓. **Le chantier Legendarium est TERMINÉ** (étapes 1-6 du plan de la spécification).

**✅ Bonus FAIT (22/10/2026, demande utilisateur « pour plus tard » : export infographique)** : **export PNG d'une page de Lore** — `src/lib/legendarium/exportImage.ts` (rendu **natif `<canvas>`**, aucune bibliothèque ajoutée) : reprend la **palette verrouillée** (parchemin D1 / hologramme D2), l'**œilleton** (catégorie · livre · section · « page X/Y » à droite), le **titre**, le **sous-titre**, le **libellé chrono**, le **texte avec retour à la ligne**, le **parcours inverse** (objets porteurs), la **couverture** en haut à gauche (taille naturelle, texte à droite puis dessous). **Pied de l'image** : **filigrane du logo Forge Armory** (emblème, opacité 0.22) + « **Mise en image par Forge Armory** » + « **Texte du Lore © Bungie, Inc. — Destiny/Destiny 2 est une marque de Bungie, Inc. Forge Armory est un projet de fan, non affilié à Bungie.** » (Destiny pour le Grimoire D1, Destiny 2 sinon). Bouton **« ⟳ Exporter en image » EN HAUT À DROITE de la page** (`ZoneLecture`, prop `avecExport`, passé à `true` dans la page Legendarium). Téléchargement par lien `<a download>` à la volée — **aucun état persistant** (lecture passive respectée). Tests : `legendarium-export` **17/17** (fonctions pures + lecture passive vérifiée) ; `legendarium-page` **69/69** (bouton haut-droite, absent par défaut, retour à gauche + export à droite). Batterie : **36/36 suites, 706/706 contrôles**. `tsc` 0, build strict ✓. À valider en `npm run dev` : onglet Legendarium → page de Lore → « ⟳ Exporter en image ».

**✅ Suite 15 FAITE (22/10/2026, demande utilisateur avant test : « pour la recherche, il faudrait pouvoir utiliser les guillemets, + et -, ainsi que respecter la casse »)** : (1) **guillemets** `"…"` (ou `« … »`) = **phrase exacte** (sous-chaîne contiguë) ; guillemet non fermé toléré ; (2) **`+terme`** = terme **obligatoire** (ET), `+"phrase"` = phrase exacte obligatoire ; (3) **`-terme`** / `-"phrase"` = **exclu** (page rejetée si présente) ; une requête avec UNIQUEMENT des exclusions remonte toutes les pages qui ne les contiennent pas ; (4) termes libres = **OU** (au moins un) seulement s'il n'y a ni obligatoire ni exacte (type Google) ; (5) **case « Aa »** (`data-respecter-casse`) dans le bandeau, à droite du champ de recherche, **décochée par défaut** = comportement historique (insensible à la casse) ; cochée = **respect de la casse** (les accents restent ignorés, é = e, dans les deux modes). Implémentation : `parserRecherche()` + `correspondRecherche()` dans `modele.ts`, `rechercherPages(…, { respecterCasse })`, état `respecterCasse` EN MÉMOIRE uniquement (lecture passive). Tests : `legendarium-modele` **107/107**, `legendarium-page` **66/66** (case « Aa » présente/décochée/cochée), `legendarium-fixtures` **19/19**. `tsc` 0, build strict ✓. À valider en `npm run dev` : barre de recherche de l'onglet Legendarium.

**Reste à faire (étape 3 du plan de la spécification — l'étape 6 est FAITE)** : **validation en `npm run dev`** avec un vrai Manifest : la navigation par livres dans la section Légendes D2 (4 catégories **repliées par défaut**, dépliage au clic, pages dans l’ordre du jeu), le contenu D2 dans les autres sections (**armes : repliables de noms Cinétiques/Énergétiques/Lourdes ; armures : UN livre « Ensembles d’armures » replié → repliable par CLASSE (Titan/Chasseur/Arcaniste, icône) → repliable par ENSEMBLE (nom) → noms de pièces (clic direct) ; cosmétiques : repliables de noms Spectres/Vaisseaux/Passereaux ; « Autres » = repliable de CLASSES (Titan/Chasseur/Arcaniste) → noms d'objets, « Sans classe » en dernier**), la **couverture flottante en haut à gauche** (lisible, texte à droite puis dessous), le **compteur de pages sur une ligne justifié à droite** dans le menu, le **compteur « page X/Y » au niveau du titre du livre** dans la zone de lecture, le bouton « Lire le Lore » dans TOUTES les fiches (Inventaire, Coffre, Mon Build, Forge — Collection et Inventaire, armes et armures), et le parcours fiche → Legendarium → retour . **Étape 6 FAITE** : les 9 critères d’acceptation sont vérifiés par `legendarium-acceptation.test.ts` (34/34, dont la lecture passive : aucun espion de score, aucun journal réseau d’écriture).

---

### 12. « Équiper » : cas que l'appli ne gère pas encore

Section RESTAURÉE le 01/10/2026 : créée le 30/09, elle avait été effacée par
erreur le 01/10 lors d'une mise à jour de la section 12 (voir `DEVLOG.md`).

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


### 14. Anti-champion des armes exotiques : liste de référence

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


### 15. Interface : pistes en attente de décision

- ✅ **Boutons d'élément de la Doctrine sur UNE ligne : validé dans le logiciel installé (06/10/2026)**, avec
  trois niveaux de compacité selon la place disponible. En `npm.cmd run dev` ils restent sur deux lignes :
  cause non établie, suivie en section 22.
- ✅ **Boutons du contexte du build : visuels de l'utilisateur intégrés** (07/10/2026, v0.3.6, en test) : ils remplacent ma proposition CSS de la v0.3.5 (`components/PastilleContexte.tsx`, huit SVG dans `public/boutons-profils/`, partagés par la rangée sous le nom du build et le bloc « 0. Contexte du build »). **À valider** : le libellé « Contexte du build : » est passé sur sa propre ligne (les quatre boutons ne tenaient pas devant). L'archive contient aussi des icônes seules et des symboles vectorisés (`ressources-installateur/forge-armory/boutons-profils/`), non utilisés pour l'instant.

- **Textes d'artefact** (`src/data/artefacts.ts`) : variantes de « Champions Implacable(s) » avec majuscule ou au
  singulier, restées telles quelles (le 05/10/2026, deux fautes certaines ont été corrigées : « fficace » et une
  phrase en minuscule) ; à uniformiser si l'utilisateur le confirme.


### 16. Filtres par type d'arme : une seule entrée « Lance-grenades »

Depuis le 01/10/2026 (v0.3.0), l'icône de type d'arme distingue les deux lance-grenades (spécial,
lourd) par leur TYPE DE MUNITIONS partout où une arme précise est affichée. Les **filtres par type**
(Inventaire et Coffre) listent des NOMS de types : « Lance-grenades » y figure une seule fois, avec
l'icône spéciale, puisque le texte du type est le même pour les deux. Pour les départager dans les
filtres, il faudrait un filtre par munitions (principales, spéciales, lourdes) ou deux entrées
« Lance-grenades (spécial / lourd) » : à proposer si l'utilisateur le souhaite.


### 17. Export DIM

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


### 18. Icônes des perks d'artefact + classeur « Endgame Analysis » (05/10/2026)

✅ **Terminé : les 147 perks d'artefact ont leur icône** (v0.3.4, 06/10/2026) : 128 trouvées directement dans le Manifest de l'utilisateur et 19 **choisies en jeu par l'utilisateur** avec le panneau « Départager » (13 ambigus ; 6 perks dont le nom de nos données diffère d'une faute de celui du jeu ; 19 sur 19 tranchés, fichier conservé dans
`knowledge-base/sources-externes/choix-icones-ambigues_2026-10-06.json`). Chemins d'icônes de Bungie, figés dans `src/data/iconesPerksArtefact.ts` (l'en-tête du fichier détaille l'origine) ; affichées dans la grille, les emplacements équipés, le récapitulatif, la fenêtre « Voir » et les exports. Historique : `DEVLOG.md` (0.3.0 à 0.3.4).

⚠️ **DISCORDANCE NON EXPLIQUÉE, à revérifier** : pour les 6 perks à nom différent (« Combo tempêtes de lames », « Tactique de meute », « Surealimentation élémentaire », « Appel tempête », « Tirs soutenu », « Rayon de souffle »), les icônes que l'utilisateur a choisies le soir du 06/10 sont **exactement celles enregistrées en 0.3.1**, qu'il avait jugées fausses en jeu le matin. Ses choix du soir font foi ; un test de la liste 0.3.4 lui demande de les recomparer dans l'appli. Interrogé, l'utilisateur répond : « je ne sais pas, c'était peut-être la fatigue » : une erreur de comparaison du matin est donc probable, mais non prouvée (le test reste dans la liste). S'il les juge encore fausses : lui demander ce qu'il voit en jeu, et regarder si l'écart vient de l'affichage (taille, cadre) plutôt que du chemin d'icône.

**Règles permanentes** : ne JAMAIS renommer un perk (la clé d'un perk de build enregistré en dépend) ; le contrôle des icônes ne repropose plus un perk déjà tranché (son icône enregistrée figure toujours parmi les candidates) : après une mise à jour du jeu, le relancer repère les perks devenus ambigus ou introuvables.

**Plus tard** : exploiter le classeur « Endgame Analysis » (recoupements en `knowledge-base/23_RESSOURCES_EXTERNES.md`) ; son CSV « Artifact Mods » (147 lignes) recoupe nos données : 146 perks sur 147 avec le même nom et le même palier. Archiver le drapeau `controleIconesPerksArtefact` une fois la discordance réglée.


### 19. À vérifier : stats des fragments qui dépendent de la classe (05/10/2026)

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


### 20. Objets FACTICES du Manifest, et « Tueur de souhaits » (06/10/2026)

✅ **Élucidé, corrigé et validé (06/10/2026)** : la catégorie **3109687656** est celle des objets **factices**
(`itemType` 20, « Dummy ») : des copies d'armes (« Le Lapin de Jade » 11, « Lance de Polaris » 7, « Dualité » 1) et
des « Colis » qui imitent une arme. Ils sont masqués par défaut en Recherche (sélectionnables par la catégorie
« Objets factices »). **Validé par l'utilisateur** : Le Lapin de Jade, Dualité et la Lance de Polaris n'apparaissent
plus qu'une fois, en tant qu'arme réelle ; sa seconde Lance de Polaris (copie factice possédée) garde son icône de
type et affiche son anti-champion. Détail : `DEVLOG.md` (0.3.1 et 0.3.2) et
`knowledge-base/28_ARMES_EXOTIQUES_ANTI_CHAMPION.md`.

✅ **CLOS le 06/10/2026 (soir) : « Tueur de souhaits »**. La vraie arme (objet 814876684) figurait bien dans les résultats de la 0.3.3 (capture de l'utilisateur : icône d'arc, anti-champion, source, « + Ajouter au build ») ; interrogé, l'utilisateur a confirmé qu'il s'agissait d'une **erreur de lecture de sa part** (« Exactement… Oups »). Rien à corriger. ⚠️ Ce que j'avais ajouté pour ce point (liste des résultats masqués, recherche tolérante `normaliserRecherche`, index `v3`) **n'est pas démontré nécessaire** : on ignore même si l'arme manquait vraiment en 0.3.1. Ces ajouts sont conservés parce qu'ils sont utiles en eux-mêmes (rien ne disparaît plus en silence ; « coeur » retrouve « cœur », validé), pas parce qu'ils auraient réglé un défaut prouvé.

**À surveiller** : d'autres objets de type 30 (16 définitions) et 19 (9), des ornements, emblèmes et étapes de quête apparaissent dans le rapport des exotiques ; ils sont déjà classés ailleurs ou sans emplacement.


### 21. Vérification avant livraison : ce que l'assistant ne peut pas faire (05/10/2026)

**Leçon du 05/10/2026** : l'utilisateur n'a pas pu installer le logiciel à cause d'une erreur `TS2540` (`RangeeBoutonsEgaux.tsx` : `refMesure.current = el`), que ma
vérification n'avait pas vue. **Cause** : elle utilise un substitut de React écrit à la main (`/home/claude/stubs/react.d.ts`) faute des vrais paquets (pas d'Internet dans
l'environnement de l'assistant), et ce substitut laissait `RefObject.current` modifiable. **Corrigé** : le substitut reproduit maintenant les surcharges de `useRef` de
`@types/react` 18.3 ; vérifié en remettant l'ancienne ligne, qui produit l'erreur exacte de l'utilisateur. `npm run dev` (Vite) ne vérifie pas les types : une erreur de ce type
n'apparaît qu'à `npm run build`.

**Ce qui reste invérifiable ici** et ne peut être confirmé que par l'utilisateur : le vrai `npm run build`, l'installateur (NSIS, Windows), le comportement réel d'Electron (dossier
de données, impression PDF), le Manifest réel, la police de Windows. Toute livraison doit le dire explicitement, et la liste de tests commence par `npm.cmd run build`.


### 23. Page « Accomplissements » : afficher les Triomphes du compte ✅ LIVRÉ (23/10/2026, PR #17)

**LIVRÉ sur `main`** — la page « Accomplissements » affiche désormais **tous les Triomphes du compte — obtenus et à obtenir — groupés PAR SCEAU** (hiérarchie Collections→Sceaux du jeu).

**Réalisé** :
- **Nouveau modèle** `src/lib/bungie/sceaux.ts` (lecture seule) : `regrouperParSceau(db, profil)` croise l'arbre « Triumphs » du Manifest avec l'état des records du profil (composant 900). Portée PROFIL uniquement. Triomphes absents = « à obtenir » (jamais masqués, jamais estimés).
- **Compteurs globaux** : « X / Y triomphes obtenus · score total ».
- **Recherche avancée** : guillemets, `+obligatoire`, `-exclu`, case « Respecter la casse » (réutilise `parserRecherche` du Legendarium).
- **Sceaux repliés par défaut**, triables par progression ou par nom. Chaque triomphe : icône, nom, description, progression des objectifs, badge ✅/⬜, points.
- **Correction** (retour utilisateur « Aucun sceau trouvé ») : la racine sceaux est lue dans le profil (`recordSealsRootNodeHash`), secours par constantes, puis scan global.
- **Tests** : `sceaux.test.ts` **31/31**, `cablage-forge` mis à jour. Batterie : **37/37 suites, 740/740 contrôles** (CI).

**Reste** : validation utilisateur en `npm run dev` (le bac à sable ne peut pas lancer le navigateur ni appeler l'API Bungie).

### 22. Lien « Contact » en pied de page : rapports de bugs et suggestions des utilisateurs (demande du 06/10/2026)

Demande de l'utilisateur : ajouter, **en pied de page**, un lien « Contact » qui permette de recueillir **les rapports de bugs ET les suggestions** des utilisateurs. À rapprocher de la phase 2 « Ouverture » de la feuille de route (logiciel utilisable par des tiers, diffusion restreinte, phase 3 : prise en compte des retours et résolution des bugs). Le pied de page porte déjà le crédit, la version et le réglage « Outils de diagnostic » : le lien se place à côté, discret.
**Rien n'est décidé ni développé**. Décisions à prendre avant de coder :
- **canal de réception** : adresse e-mail dédiée, formulaire en ligne, dépôt de suivi (issues), serveur de discussion… Critères : aucun compte exigé de l'utilisateur, coût nul, protection contre le courrier indésirable, respect des données personnelles si une adresse e-mail est collectée ;
- **ce que fait le lien** : ouvrir un message `mailto:` (il exige un logiciel de messagerie configuré, ce qui n'est pas toujours le cas sous Windows) ou ouvrir une page web dans le navigateur par défaut (dans Electron, un lien externe doit passer par le navigateur du système : voir comment l'appli ouvre déjà ses liens externes) ;
- **deux motifs distincts** : « Signaler un bug » et « Proposer une idée » ;
- **informations utiles, jamais sensibles, proposées en pré-remplissage** : version de l'appli (`__VERSION_APP__`), version du jeu prise en compte (`VERSION_JEU`), appli installée ou `run dev`, système d'exploitation. **Jamais** les jetons Bungie, les identifiants du compte, ni le contenu des builds enregistrés sans accord explicite ; rien n'est envoyé automatiquement : l'utilisateur voit et envoie lui-même. Si le mode diagnostic est actif, option de joindre le rapport de diagnostic (copié dans le presse-papiers) ;
- **message de confidentialité** : dire clairement ce qui est transmis et à qui.
À prévoir ensuite : libellé du lien, test du lien dans l'appli installée (ouverture du navigateur ou de la messagerie), et une phrase dans le guide de démarrage pour les invités.


---

**Items retirés le 23/10/2026 (livraison PR #17)** — documentés dans `DEVLOG.md` :

- ~~23. Page « Accomplissements » : afficher les Triomphes du compte~~ → ✅ **LIVRÉ** (Triomphes par sceau, recherche avancée, PR #17)

**Items retirés le 22/10/2026 (nettoyage de la TODO)** — tous documentés dans `DEVLOG.md` :

- ~~11. Legendarium (ancienne entrée, chantier en cours)~~ → **remplacé par l'item 11 ci-dessus** (livraison complète en v0.5.0)
- ~~23. Boutons « Carrière » et « Accomplissements »~~ → ✅ **RÉSOLU sur cette branche** (onglets dédiés, voir DEVLOG 22/10/2026)
- ~~12. Renommage « Forge Armory »~~ → ✅ validé le 06/10/2026 (DEVLOG : « Renommage officiel »)
- ~~16. Onglet « Load-outs » : gérer ses Loadouts en grand~~ → ✅ 3 livraisons faites et validées (DEVLOG v0.3.8, v0.3.9, v0.3.16)
- ~~16 bis. Visuels illustrés~~ → ✅ fait v0.3.13 à v0.3.17 (DEVLOG)
- ~~21. Police personnalisée « D2 Build Analyzer Vector »~~ → ❌ **ABANDONNÉE** le 06/10/2026 (voir « Pistes abandonnées »)
- ~~22. Logo de fond et mode diagnostic~~ → ✅ validés le 06/10/2026 (DEVLOG v0.3.2)
- ~~24. Auteur des builds~~ → ✅ fait et validé le 06/10/2026, v0.3.3 (DEVLOG)


## Pistes abandonnées ou mises de côté (à ne pas reproposer sans raison)


- **Police personnalisée « D2 Build Analyzer Vector »** — abandonnée (06/10/2026) :
  retirée de la TODO §21 (Confort) lors du nettoyage du 22/10/2026. Voir DEVLOG pour l'historique.

- **Icônes des 21 perks par artefact, par la table d'extraction** — abandonné (26/08) : la table lue par
  l'extraction (`DestinyArtifactDefinition`) ne décrit que l'ancien système d'artefact. ⚠️ **L'objectif a été
  repris autrement le 05/10/2026** : les icônes viennent des objets d'artefact du Manifest, retrouvés par leur nom
  (section 17) ; 128 perks sur 147 en ont une.
- **Faire porter l'origine du texte jusqu'à `detecterVerbes`** (Pilier 2) —
  dépriorisé (26/08) : les marqueurs textuels précis suffisent (3,4 % de
  cas ambigus) ; à revisiter seulement si de nouveaux cas s'accumulent.

Détails dans l'archive de la TODO et dans `DEVLOG.md`.

---

## Comment tenir cette liste à jour

- **Nom du fichier de tests** (règle de l'utilisateur, 06/10/2026) : le PDF de la liste de tests porte le **numéro de version de l'appli** : `A-TESTER-<version>.pdf` (par exemple `A-TESTER-0.3.3.pdf`) (généré par `documentation/sources/outil-a-tester-pdf.py`, qui lit la version dans `package.json`). Le zip, lui, garde `forge-armory-ver_0_3_1.zip`.

- Un item **résolu** est retiré d'ici et décrit dans `DEVLOG.md` — pas
  laissé barré : la liste doit rester lisible.
- Un item qui **attend une information** précise l'action attendue, pas
  seulement le problème.
- Les décisions de conception vont dans le `README.md` : ce fichier ne liste
  que ce qui reste à faire.
