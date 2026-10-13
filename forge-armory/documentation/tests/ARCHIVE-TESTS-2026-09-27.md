# Archive des tests validés — tri du 27/09/2026

FR : sections retirées de `A-TESTER.pdf` le 27/09/2026 à la demande de
l'utilisateur, parce qu'entièrement validées (ou devenues sans objet,
comme « En attente »). Recopiées **mot pour mot** depuis la source
`documentation/sources/A-TESTER.md`, état des cases compris, pour garder
la trace de ce qui a été testé et de ce qui avait échoué avant correction.

Les 3 tests encore ouverts de ces sections (échange d'un build avec un
ami, vraie expiration de session, test général Filobscur) ont été
**déplacés** dans la section « Encore ouverts » de la liste active : ils
figurent ici avec leur case vide, à titre historique seulement.

EN: sections removed from A-TESTER.pdf on 27/09/2026 (fully validated),
copied verbatim. The 3 still-open items were MOVED to the active list.

---

## Mentions de l'ancienne introduction

Confirmés lors des tests précédents et retirés de cette liste : fusion
Personnage/Doctrine, correction d'assignation T1/T2/T3, bonus de sets
actifs, pluriels manquants, alignement des emblèmes.

Confirmés le 26/08 et retirés de cette liste : miniatures des 7 artefacts,
alignement de la grille d'Artefact, icône Micro-missiles, vitrine des
emblèmes Solo sans mourir, boutons de diagnostic masqués, correctif
« cure »/« soin ».

---

## 🆕 v0.2.3 — fiche d'un build et blocs repliables (27/09/2026)

⚠️ Lancer d'abord `npm.cmd run build` : depuis l'audit, une seule variable
inutilisée fait échouer la compilation. Si c'est le cas, copier le message
d'erreur à Claude. Puis `npm.cmd run electron:build` et réinstaller.

**Fiche d'un build (menu Loadouts)**
- [x] Chaque build a un bouton « 👁 Voir » juste après « Charger ».
- [x] La fiche affiche : doctrine (Super, Mêlée, Grenade, Compétence de
      classe, Saut, Aspects, Fragments), armes avec leurs perks, armure
      avec ses mods, stats totales, artefact et ses perks.
- [x] Les stats totales de la fiche sont **identiques** à celles de Mon
      Build après avoir cliqué « Charger » sur le même build.
- [x] « 📋 Copier en texte », puis coller dans un bloc-notes ou sur
      Discord : le texte est lisible tel quel.
- [x] « ⬇ Exporter le fichier » dans la fiche fait la même chose que le
      bouton « Exporter » du build.
- [x] La fiche se ferme avec « Fermer », la croix, la touche Échap, ou un
      clic en dehors ; un clic **dans** la fiche ne la ferme pas.

**Blocs repliables**
- [x] Mon Inventaire, Personnage & Doctrine, Mon Build et Artefact ont
      un triangle ▶/▼ devant leur titre, comme le Coffre. Ouverts au
      lancement ; un clic sur la ligne de titre les replie/déplie.
- [x] Connexion Bungie.net, Recherche dans le Manifest et toute la partie
      score (contexte, score global, piliers) ne sont **pas** repliables.
- [x] Artefact : les boutons à droite du titre fonctionnent toujours et
      ne replient pas le bloc quand on clique dessus.
- [x] Dans Mon Build, la section « Doctrine — … » est **réduite** au
      lancement, avec le nom de la sous-classe visible dans son titre.

---

## 🆕 Passe d'audit du 27/09/2026

Aucun changement visible attendu : ces tests vérifient seulement que rien
n'a cassé.

- [x] `npm.cmd run build` se termine sans erreur (jamais lancé depuis
      l'audit : les dépendances n'étaient disponibles nulle part).
- [x] Mon Build, avec au moins 2 pièces d'un même set : l'encart « Bonus
      de Set actifs » s'affiche comme avant.
- [x] Mon Build et Inventaire : les noms d'emplacements (« Arme
      cinétique », « Casque »…) et de catégories de Doctrine (« Aspects »,
      « Fragments »…) sont inchangés.
- [x] Le score du Pilier 4 (Loot & Cohérence) d'un build connu est
      identique à avant.

---

## 🆕 v0.2.2 — Manifest automatique et export d'un build (26/09/2026)

Confirmés en 0.2.1 : connexion Bungie dans l'appli installée, cache du
Manifest conservé entre deux lancements, persistance d'un build
enregistré, import de builds.

⚠️ Refaire `npm.cmd run electron:build` puis réinstaller.

**Manifest au démarrage**
- [x] Lancer l'appli (Manifest déjà chargé une fois auparavant) : sans
      aucun clic, vérification de la version, puis indexation, puis
      recherche. **Confirmé le 27/09.**
- [x] Le **premier lancement après installation** d'une nouvelle version
      Bungie (ou si le cache a été vidé) ne doit rien télécharger tout
      seul : le bouton « Charger le Manifest (FR + EN) » reste affiché.
      (Se vérifiera naturellement à la prochaine mise à jour de Bungie.)

**Export d'un build seul**
- [x] Sur un build enregistré, le bouton « ⬇ Exporter » à droite de
      « Supprimer » propose d'enregistrer un fichier
      `build-d2-<nom>.json`.
- [x] Réimporter ce fichier avec « ⬆ Importer » : le build réapparaît en
      double dans la liste (normal, l'import ajoute sans remplacer).
- [x] Le bouton du bas s'appelle maintenant « ⬇ Exporter tout » et
      exporte toujours l'ensemble.
- [ ] Idéalement, un échange réel avec un ami : chez lui, les pièces
      qu'il possède doivent être retrouvées par la réparation
      automatique.

---

## 🆕 Durcissements de l'audit externe (26/09/2026) — à vérifier

Ces changements touchent la connexion : à surveiller pendant les tests.

- [x] **Connexion Bungie dans le logiciel** (confirmé en 0.2.1) : elle doit fonctionner comme
      avant (fenêtre qui s'ouvre, se ferme seule, appli connectée). Le
      canal interne valide désormais l'adresse et la protection anti-CSRF
      est plus stricte dans le logiciel.
- [x] Si un message « Adresse de connexion refusée » ou « État OAuth
      invalide » apparaît, transmets-le : ce serait un durcissement trop
      strict, à ajuster.

---

## 🆕 Icônes de contexte (26/09/2026) — à revérifier

- [x] Les 4 badges de contexte (Neutre, Roaming, DPS, PvP) s'affichent
      correctement **dans le navigateur** (`npm.cmd run dev`).
- [x] Idem **dans l'appli installée**, après une nouvelle fabrication.

---

## 🆕 Stockage de l'appli installée (26/09/2026) — à tester

⚠️ Nécessite de refaire `npm.cmd run electron:build` puis de réinstaller.

- [x] Dans l'appli installée : charger le Manifest (une fois), fermer
      complètement l'appli, la relancer : le cache est retrouvé (« déjà
      à jour (cache local) »). **Confirmé en 0.2.1.**
- [x] Enregistrer un build, fermer, relancer : le build doit toujours être
      là. **Confirmé en 0.2.1.**
- [x] Vérifier que l'appli s'ouvre normalement (fenêtre non blanche) — le
      changement touche la façon dont elle charge ses fichiers.

---

## 🆕 Logiciel installable — installateur produit (26/09/2026)

- [x] `npm install`, `npm.cmd run build`, `npm.cmd run electron:dev` :
      la fenêtre s'ouvre, **connexion Bungie confirmée**.
- [x] `npm.cmd run electron:build` : installateur produit
      (`installateur/D2-Build-Analyzer-Setup-0.1.0.exe`), après activation
      du **mode développeur** de Windows et suppression du cache
      `winCodeSign` corrompu.
- [x] Installer via cet installateur, puis lancer depuis le raccourci du
      bureau : l'appli installée lit ses fichiers autrement que la version
      de développement — **vérifier surtout que la connexion Bungie
      fonctionne** et que la fenêtre n'est pas blanche.
- [x] Après ajout de l'icône (26/09) : refaire
      `npm.cmd run electron:build` et vérifier que l'icône du Spectre
      apparaît sur l'installateur, le raccourci du bureau et dans la barre
      des tâches (au lieu de l'icône Electron par défaut).

---

## 🗄️ Logiciel installable (24/09/2026) — premier essai (pour mémoire)

⚠️ Ce code n'a **jamais pu être exécuté** (pas d'accès Internet côté
Claude pour installer Electron). Des ajustements sont probables : en cas
d'erreur, copie le message affiché, il sera exploitable tel quel.

- [x] `npm install` (long la première fois : télécharge Electron, ~150 Mo).
- [x] Deux fenêtres de commande : `npm run dev` dans la première,
      `npm run electron:dev` dans la seconde. Une fenêtre « D2 Build
      Analyzer » doit s'ouvrir avec l'appli dedans.
- [x] Clique sur **Connexion Bungie.net** : une fenêtre de connexion
      Bungie doit s'ouvrir, puis se fermer seule après autorisation, et
      l'appli doit passer à **✅ connecté** sans rien faire de plus.
- [x] `npm run electron:build` : un installateur doit apparaître dans le
      dossier `installateur/`. Installe-le, lance-le depuis le raccourci du
      bureau, et refais le test de connexion.

---

## ✅ Expiration de la connexion (24/09/2026) — CONFIRMÉ

Validé par l'utilisateur le 24/09 : « le test fonctionne ! »

- [x] Simuler l'expiration : en-tête « non connecté », bannière ⏳, bouton
      de connexion réapparu.
- [x] Reconnexion depuis la bannière.
- [x] Rechargement de la page après expiration simulée.
- [ ] Un jour où ta session expire pour de vrai (après ~1 h), vérifie que
      tu vois bien la même bannière plutôt qu'un message d'erreur
      technique.

---

## 🗄️ Expiration de la connexion — procédure détaillée (pour mémoire)

Pas besoin d'attendre une heure : un bouton de test force l'expiration.

- [x] Connecte-toi normalement, puis clique sur **⏳ Simuler l'expiration
      (dev)** (à côté de « Se déconnecter »). L'en-tête doit passer à
      **◯ non connecté**, une bannière ⏳ doit expliquer que la session a
      expiré, et le bouton **Connexion Bungie.net** doit réapparaître.
- [x] Clique sur **Connexion Bungie.net** : la bannière disparaît et la
      connexion repart normalement.
- [x] Recharge la page (F5) juste après avoir simulé l'expiration, sans
      te reconnecter : l'appli doit s'ouvrir en **◯ non connecté** avec la
      bannière — et surtout jamais afficher « ✅ connecté ».
- [x] Un jour où ta session expire pour de vrai (après ~1 h), vérifie que
      tu vois bien la même bannière plutôt qu'un message d'erreur
      technique.

---

## ✅ Filtre anti-dialogue de la recherche — CONFIRMÉ (24/09/2026)

Validé par l'utilisateur le 24/09 : « ça fonctionne bien ». Chantier clos,
diagnostic archivé. Seule la 3e ligne reste ouverte : c'est une
surveillance au fil de l'eau, pas un test à faire.

- [x] Cherche **one-two** : *One-Two Punch* doit apparaître, et la
      réplique **« Vise le sac, petit » ne doit PLUS apparaître**.
- [x] Clique sur **🔍 Diagnostic (dev)** (à droite du champ de recherche)
      avec « one-two » toujours saisi : « Vise le sac, petit » doit y
      figurer avec la mention **🚫 FILTRÉ — ne correspond que dans le
      texte d'ambiance**. (Normal qu'elle soit listée ici : le diagnostic
      montre tout ce qu'il trouve, *et* ce que la recherche en fait.)
- [x] Fais quelques recherches habituelles, au fil de l'eau. **Si une
      réplique ou un texte sans rapport apparaît dans les résultats** :
      garde le mot saisi, clique sur **🔍 Diagnostic (dev)** et
      transmets-moi le contenu — la ligne marquée ✅ AFFICHÉ dira par quel
      champ elle passe, ce qui permettra d'étendre le filtre sans deviner.
      ⚠️ Le bouton de diagnostic étant archivé depuis le 24/09, il faut
      remettre `diagnosticCheminsJson: true` dans
      `src/lib/diagnosticsArchives.ts` pour le faire réapparaître.

---

## 📌 Note (21/09/2026) — à vérifier en jouant, au fil de l'eau

Retiré du plan du TODO le 21/09/2026 : ces vérifications se font
naturellement en jouant, sans bloquer les chantiers de fond.

**Ce qui est livré mais jamais vu tourner** :
- La réorganisation du scoring et la mise en page du Pilier 2 — voir les
  deux sections « 🆕 » juste en dessous.
- [x] **Archive invité sans clé** : au premier invité réel, recueillir son
      retour sur la procédure de création d'application Bungie (les
      libellés exacts du formulaire Bungie n'ont pas pu être vérifiés).
      S'il bute quelque part, noter à quelle étape (A à E du README).

**Barèmes du Pilier 2 à calibrer sur tes vrais builds** (choix motivés
mais jamais éprouvés en jeu, contrairement au 35/12/18 des boucles) :
- [x] **Bonus de ressources** (+6 pts par type d'énergie, plafond 20) :
      le bonus te semble-t-il juste, trop généreux, trop faible ?
- [x] **Payoff orphelin** (6 pts) : un build avec des verbes marqués ⚠️
      est-il noté de façon cohérente ?

---

## ✅ Session du 31/08 — diagnostic lancé, problème RÉSOLU

- [x] Équiper *Esquive furtive* seule, lancer le diagnostic Pilier 2 et
      transmettre le résultat. **Fait le 06/09.**
- [x] "Invisibilité" apparaît désormais bien dans les Verbes d'élément.
      **Confirmé (06/09).**

**Verdict** : l'hypothèse du 27/08 était bonne — la description directe
d'un aspect est vide (0 car.), le texte réel vit sur un perk lié. Le
correctif était donc correct dès le départ, il lui manquait sa
vérification. Diagnostic archivé (flag repassé à `false`), code conservé
pour un futur besoin. Détail complet dans `CHANGELOG.md`.

---

## ✅ Les 4 cas en attente — CONFIRMÉS (06/09)

- [x] **Sentinelle ionique** (Arcaniste Cryo-électrique) — OK.
- [x] **Facette de détermination** (fragment Prismatique) — OK.
- [x] **Murmure de liens** (fragment Stase, seul) — OK.
- [x] **Fil de transmutation** (fragment Filobscur, seul) — OK.

Le chantier "aspects/fragments non détectés" est donc entièrement clos.
(Les cases correspondantes des sections 0, 1 et 7 plus bas ont été cochées
le 21/09 en conséquence.)

---

## 🆕 Réorganisation du scoring (06/09) — à vérifier

- [x] Les blocs de score apparaissent dans le NOUVEL ordre : Élément et
      Doctrine → Artefact → Armes et Armures → Effets du Build →
      Statistiques.
- [x] Les nouveaux noms sont partout : « Artefact », « Armes et Armures »,
      « Effets du Build », « Statistiques ».
- [x] Dans le bloc **Contexte**, le tableau des poids suit le MÊME ordre
      que les cartes (c'est le point qui divergeait le plus facilement
      avant la source unique).
- [x] Les pondérations affichées sont inchangées (10/30/15/20/25 en
      neutre) — seul l'ordre des lignes bouge.
- [x] Le **Pilier 1** (Élément et Doctrine) plafonne maintenant à **75**
      sur une doctrine complète, avec une ligne explicative en dessous.
- [x] Les 4 AUTRES blocs peuvent toujours atteindre 100 — vérifier
      qu'aucun d'eux n'a été plafonné par erreur.

## 🆕 Mise en page du Pilier 2 (06/09) — à vérifier d'un coup d'œil

- [x] Sur un build avec *Facette de détermination* : "Charge d'armure" ne
      doit plus apparaître 5 fois de suite, mais UNE seule ligne listant
      ses 5 cibles.
- [x] Vérifier le nouveau libellé des ressources : `🔋 Énergie d'aptitude
      générée : [type] — [ce qui la génère]`.
- [x] Sur un build à chaîne longue (grenade prismatique + fragments
      Stase), vérifier que les lignes `⛓️` restent lisibles et
      qu'aucune chaîne n'a disparu au passage.

---

## 🆕 Session du 27/08 — bug majeur trouvé pendant les tests réels

⚠️ **Le premier passage complet de la checklist (27/08) a immédiatement
trouvé un bug majeur** : `extraireTextesDoctrineBuild` (Pilier 2, scoring)
ne lisait que la description DIRECTE d'un objet Manifest, alors que les
ASPECTS ont très souvent cette description vide — le vrai texte vit sur
un perk lié. Le sélecteur de doctrine (affichage) le gérait déjà
correctement depuis début août ; le scoring, non. D'où : "Aucun verbe
d'élément détecté" pour un aspect pourtant bien surligné en cyan à
l'écran. **Corrigé** — voir `CHANGELOG.md` pour le diagnostic complet.

**Explique probablement 5 des 6 problèmes remontés ce jour-là**, tous des
aspects/fragments testés seuls : Esquive furtive, Sentinelle ionique,
Facette de détermination, Murmure de liens, Fil de transmutation. **Tout
ce qui suit dans les sections 0, 1 et 7 doit être RETESTÉ** avec le
nouveau correctif — les cases cochées `[x]` d'AVANT ce correctif restent
valables (elles ne dépendaient pas de ce bug), mais les `[ ]` qui
avaient échoué doivent repasser au banc d'essai.

📌 **Précision de mécanique de jeu reçue le 27/08** (voir aussi
`knowledge-base/22_CHAINES_DE_VERBES.md`) : la grenade prismatique
occupe un slot à PART, toujours équipé, activé uniquement sous
Transcendance (remplace alors la grenade élémentaire normale). Valable
pour les 3 classes. Utile à savoir pour construire un test : impossible
de "ne pas l'avoir", seule son activation dépend de la Transcendance.

---

## 🆕 Session du 26/08 — audit des fragments + notation du Pilier 2

Rechargement forcé (**Ctrl+F5**) avant de commencer. Pour chaque test,
regarder les lignes de détail du **Pilier 2 (Verbes d'Élément)** dans
« Mon Build » : `⛓️` = chaîne, `🔋` = ressource, `✨` = bonus de score,
`✅`/`ℹ️`/`⚠️`/`❓` = boucle/source seule/orphelin/indéterminé.

⚠️ **Le premier essai (26/08) a immédiatement trouvé 4 bugs** — mêlée
stasique, Facette de détermination muette, et la chaîne Prismatique
(Transcendance + grenade) qui ne démarrait jamais. **Tous corrigés et
vérifiés sur un test d'intégration utilisant les vraies fonctions du
projet** (voir `CHANGELOG.md`) :
- ✅ Mêlée stasique — **confirmé réglé par l'utilisateur**.
- ✅ Facette de détermination — coquille de terminologie corrigée
  ("orbe de pouvoir" → "orbe de puissance"), à retester.
- ✅ Chaîne Transcendance → grenade prismatique → Neutralisation/
  Ralentissement — deux bugs corrigés (asymétrie source/payoff +
  nouveau mécanisme `sourceImplicite`), à retester.

### 0. Retester les 3 bugs corrigés en priorité

- [x] Mêlée stasique + Murmure des fractures — **confirmé réglé (26/08)**.
- [x] Rééquiper *Facette de détermination* seule : vérifier que les 5
      verbes (Maille tissée, Charge éclair, Restauration, Armure de
      givre, Surbouclier) apparaissent maintenant liés à Charge d'armure.
      ⚠️ **Testé le 27/08, ÉCHEC** ("les bonus ne s'affichent pas") — le
      texte fourni correspondait mot pour mot à la phrase de vérification
      déjà codée, donc PAS une coquille de transcription. Cause réelle
      trouvée : bug de lecture de description sur perk lié (voir bandeau
      tout en haut de ce fichier) — **à retester avec le correctif**.
- [x] Reprendre le MÊME build Arcaniste Prismatique + grenade Singularité
      Glacée qu'au premier test : vérifier que Neutralisation et
      Ralentissement ne sont plus "indéterminés" — ils devraient
      apparaître au moins en `ℹ️ Appliqués, mais rien n'en profite`
      (ou mieux, en boucle si quelque chose les exploite aussi).
      **Confirmé (27/08)** : s'affiche bien en `ℹ️ Appliqué, mais rien
      n'en profite`, exactement le résultat attendu.

### 1. Nouveaux liens de chaîne (choisir 2-3 exemples, pas besoin de tout tester)

- [x] **Stase** — équiper *Murmure des fractures* + une mêlée qui brise
      une cible gelée : vérifier l'apparition de `⛓️ Brisure → Armure de
      givre`. **Vérifier aussi** que Ralentissement n'apparaît plus en
      `⚠️ payoff orphelin` dans les détails. **Confirmé réglé (26/08).**
- [x] **Stase** — équiper *Murmure de liens* seul (sans rien qui
      mentionne "Super" ailleurs) : vérifier `🔋 Énergie de Super : Gel`.
      ⚠️ **Testé le 27/08, ÉCHEC** ("n'affiche rien") — probablement le
      même bug de lecture de description sur perk lié (voir bandeau tout
      en haut de ce fichier), aspect testé seul comme les autres cas
      touchés — **à retester avec le correctif**.
- [x] **Filobscur** — équiper *Fil de transmutation* : vérifier `⛓️
      Maille tissée → Enchevêtrement`. ⚠️ **Testé le 27/08, ÉCHEC**
      ("n'affiche rien") — même cause probable, à retester.
- [x] **Abyssal** — équiper *Écho d'autorité* et neutraliser une cible en
      jeu (ou juste vérifier que le texte est bien lu) : vérifier `⛓️
      Neutralisation → Brèche abyssale`.
- [x] **Prismatique** — équiper *Facette de détermination* : vérifier que
      les 4 verbes (Charge éclair, Restauration, Armure de givre,
      Surbouclier) apparaissent bien liés à Charge d'armure quelque part
      dans les détails (pas seulement Maille tissée).
- [x] **Si un verbe classique (pas seulement Ralentissement) apparaît
      encore en "payoff orphelin" alors qu'il est bien surligné en cyan
      quelque part** : noter le nom du verbe ET le texte exact affiché
      pour l'aptitude concernée (copier-coller) — nécessaire pour ajuster
      le correctif sans deviner.

### 2. Le vrai cœur du changement — verbe "invisible" reconnu par ricochet

- [x] Construire un build Arcaniste avec la **grenade prismatique**
      (Transcendance active) et **aucun** aspect/fragment/perk qui
      mentionne "Gel" ou "Brisure" directement. Vérifier que **Gel** et
      **Brisure** apparaissent maintenant quelque part dans les détails du
      Pilier 2 (au moins en `ℹ️ Appliqués, mais rien n'en profite`) au lieu
      d'être totalement absents comme avant. **Confirmé (27/08).**
- [x] Comparer le **score du Pilier 2** avant/après avoir ajouté ce même
      fragment/grenade à un build existant : le score doit **augmenter**,
      jamais diminuer, quand une chaîne est confirmée. **Confirmé (27/08).**

### 3. Bonus de ressources (`✨`)

- [x] Construire un build qui génère **2 types de ressources différents**
      (ex : mêlée ET grenade, via deux verbes distincts) : vérifier la
      ligne `✨ +12 pts pour la génération active de ressources (2 type(s)
      distinct(s))`.
- [x] Vérifier que le score du Pilier 2 ne dépasse **jamais 100**, même
      sur un build qui cumule boucles + bonus de ressources au maximum.
      **Confirmé (26/08).**

### 4. Confort — auto-chargement des sous-classes

- [x] Choisir une classe (Titan/Chasseur/Arcaniste) dans le bloc
      « Personnage & Doctrine » : le chargement des 6 sous-classes doit se
      lancer **automatiquement**, sans clic supplémentaire sur un bouton
      "Charger mes sous-classes" (ce bouton a disparu du flux normal).
      **Confirmé (26/08).**
- [x] Changer rapidement de classe 2 fois de suite (ex : Titan puis
      Chasseur avant que le premier chargement soit terminé) : vérifier
      qu'on obtient bien les sous-classes du Chasseur à la fin, pas un
      mélange ou celles du Titan par erreur. **Confirmé RAS (26/08).**
- [x] Couper le réseau (ou simuler une erreur) pendant le chargement :
      vérifier qu'un message d'erreur s'affiche avec un bouton
      "Réessayer" fonctionnel.

### 5. Non-régression (vérifier que l'existant n'a pas bougé)

- [x] Sur un build **déjà testé et noté avant cette session**, vérifier
      que le score du Pilier 2 n'a pas **baissé** de façon inattendue (une
      hausse est normale si le build a des chaînes ; une baisse serait un
      bug). **Confirmé RAS (26/08).**
- [x] Vérifier qu'un verbe classique en boucle complète (ex : Radieux →
      Restauration → Embrasement sur un build Solaire connu) affiche
      toujours `✅ Boucle complète` comme avant. **Confirmé (27/08,
      "c'est bon je crois" — à re-signaler si un doute apparaît en
      testant davantage).**
- [x] Vérifier que la couverture anti-champion (Pilier 4) n'a pas changé
      sur un build de référence — elle ne doit PAS bénéficier du ricochet
      de chaîne (volontairement laissée sur `aSource` pur, voir
      `CHANGELOG.md`). **Confirmé RAS (26/08).**

### 6. Correctifs de la passe d'audit du scoring (26/08)

Ces 3 points sont invisibles à l'œil nu, mais faciles à vérifier par
comparaison avant/après si tu as noté des scores précédemment.

- [x] **Pilier 3 (Artefact)** — sur un build dont les perks d'artefact
      mentionnent un verbe accentué (Brûlure, cibles gelées, Électrocution),
      vérifier que la ligne `✅ Vos perks d'artefact renforcent N effet(s)`
      apparaît maintenant. Avant le correctif, aucun mot-clé accentué ne
      matchait, donc cette ligne était presque toujours absente et le score
      du pilier plus bas qu'il n'aurait dû. **Confirmé (26/08).**
- [x] **Pilier 2 (barème orphelin)** — si un build affiche encore des
      verbes en `⚠️` (payoff orphelin), le score du pilier ne doit plus
      être écrasé à 0 : chaque orphelin vaut désormais 6 pts au lieu de 0.
      Un build qui n'a QUE des orphelins doit maintenant scorer plus que 0.
- [x] **Liens conditionnels** — les liens `⛓️ ... (condition vérifiée)`
      devraient apparaître plus souvent qu'avant (la vérification ne
      dépend plus d'une correspondance mot-pour-mot). ⚠️ **Inversement**,
      surveiller l'apparition d'un lien qui n'aurait PAS lieu d'être :
      c'est le seul risque de ce correctif. Si tu vois une chaîne dont le
      fragment n'est pas équipé, signale-la.

### 7. Correctifs de l'audit des 387 compétences de doctrine (26/08)

Tous trouvés en rejouant les 18 fichiers transmis à travers le vrai
moteur de détection — voir `CHANGELOG.md` pour le détail complet du
diagnostic. Quelques vérifications ciblées, faciles à reproduire :

- [x] **Esquive furtive** (Chasseur Abyssal) — équiper cet aspect et
      vérifier qu'**Invisibilité** apparaît maintenant dans les détails du
      Pilier 2 (avant le correctif, cette capacité de BASE n'était même
      pas détectée du tout — 0 mention). ⚠️ **Testé le 27/08, ÉCHEC**
      ("Invisible" bien en cyan à l'écran, mais Pilier 2 affiche "Aucun
      verbe d'élément détecté") — a mené à la découverte du bug majeur
      de lecture de description sur perk lié (voir bandeau tout en haut
      de ce fichier). **À retester avec le correctif.**
- [x] **Sentinelle ionique** (Arcaniste Cryo-électrique) — vérifier que
      **Charge éclair** est bien classé en `✅`/`ℹ️` (source), pas en `⚠️`
      (payoff orphelin) comme avant le correctif des gérondifs. ⚠️
      **Testé le 27/08, ÉCHEC** ("pas affiché en Pilier 2" du tout) —
      même cause probable que Esquive furtive. **À retester.**
- [x] **Charge inflexible** (Titan Cryo-électrique) — vérifier
      qu'**Amplifié** apparaît en payoff (`ℹ️`/`⚠️` selon si Amplifié est
      sourcé ailleurs dans ta doctrine Arc) plutôt qu'à tort en source.
- [x] **L'itinérant** (Arcaniste Filobscur) — vérifier que **Suspension**
      apparaît bien en boucle ou source (pas en payoff orphelin comme
      avant le correctif de bornage de phrase).
- [ ] Test général : sur n'importe quel build Filobscur avec un
      Enchevêtrement ET une capacité qui le détruit pour un effet, vérifier
      que rien d'inhabituel n'apparaît (le bornage de phrase touche
      potentiellement beaucoup de textes en même temps — c'est le
      correctif le plus "large" de cette session).

### 8. Exceptions ciblées (26/08, plus tard le même jour)

- [x] **Enfant des dieux anciens** (Arcaniste Abyssal, aspect) — équiper
      cet aspect et vérifier que **Neutralisation** apparaît en `✅`
      (boucle) dans les détails du Pilier 2, plus en `⚠️` (payoff
      orphelin) comme avant.
- [x] **Tir de l'ombre : Carquois de Moebius** (Chasseur Abyssal, Super)
      — équiper ce Super et vérifier que **Charge d'armure** apparaît en
      `✅` (boucle), plus en `⚠️`.

---

## ⏳ En attente

- **Icônes des 21 perks par artefact** — abandonné (voir `TODO.md`,
  incompatibilité de système confirmée).
- **Chaînes de verbes et notation du Pilier 2** — mécanisme codé ET
  branché sur le score (26/08), mais jamais testé en conditions réelles
  (pas de `node_modules` dans cet environnement) : voir la checklist
  ci-dessus, section « Session du 26/08 ».

---

## Ajout du même jour : sections validées ensuite

Sections 0.2.5 et 0.2.4 retirées de la liste active après confirmation
de l'utilisateur (PDF coché renvoyé), recopiées mot pour mot.

## 🆕 v0.2.5 — export de la fiche en PNG ou PDF (27/09/2026)

⚠️ Lancer d'abord `npm.cmd run build`, puis `npm.cmd run electron:build`
et réinstaller. L'export n'existe que dans le logiciel installé : dans le
navigateur (`npm.cmd run dev`), les deux boutons sont grisés, c'est normal.
Si un message « ⚠️ Export impossible : … » apparaît, copier le message
entier à Claude : le rendu dans le logiciel n'a pas pu être essayé avant
livraison.

- [x] Dans la fiche d'un build (« 👁 Voir »), deux nouveaux boutons :
      « 🖼 Image PNG » et « 📄 PDF ».
- [x] « 🖼 Image PNG » : après quelques secondes, Windows propose
      d'enregistrer `fiche-d2-<nom>.png` dans Téléchargements ; l'image
      ressemble à la maquette v7, avec les vraies icônes du jeu.
- [x] « 📄 PDF » : même présentation que l'image, sur une seule page.
- [x] Armes dans l'ordre cinétique → énergie → lourde ; icône
      anti-champion juste à droite de l'élément, la même que dans Mon Build
      (et rien si l'arme n'en a pas).
- [x] Titre ARMURE : Santé · Mêlée · Grenade · Super · Classe · Arme, avec
      les mêmes valeurs que la fiche « 👁 Voir ».
- [x] À droite de la marque de classe : les mêmes bonus de set actifs que
      l'encart de Mon Build, et seulement ceux-là.
- [x] Aucun numéro technique (hash), aucune rareté écrite, aucun score.
- [x] Envoyer l'image sur ton téléphone : lisible sans zoom important.

---

## 🆕 v0.2.4 — ordre des pièces dans la fiche d'un build (27/09/2026)

Confirmés en 0.2.3 : toute la fiche d'un build (bouton « 👁 Voir »,
contenu, copie en texte, export, fermeture), les blocs repliables, et
`npm.cmd run build` sans erreur depuis l'audit.

- [x] Dans la fiche d'un build (« 👁 Voir »), les armes sont toujours dans
      l'ordre Arme cinétique → Arme énergie → Arme lourde, même pour un
      build où elles ont été ajoutées dans un autre ordre.
- [x] Même chose pour l'armure : Casque → Gants → Torse → Jambes →
      Marque de classe.
- [x] « 📋 Copier en texte » : le texte suit le même ordre.

---

---

Section 0.2.6 retirée après confirmation de l'utilisateur (PDF coché
renvoyé), recopiée mot pour mot.

## 🆕 v0.2.6 — icônes de type d'arme et d'élément dans l'export (27/09/2026)

Confirmés en 0.2.5 : export PNG et PDF de la fiche, fidèle à la maquette
v7, lisible sur téléphone.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.

- [x] Dans l'image et le PDF exportés, sous le nom de chaque arme : icône
      du type d'arme, puis icône de l'élément (le nom de l'élément n'est
      plus écrit), puis icône anti-champion.
- [x] Les trois icônes sont alignées sur la même ligne, et aux mêmes
      positions d'une arme à l'autre.
- [x] Le type d'arme correspond à celui affiché ailleurs dans l'appli
      (même reconnaissance).
- [x] Non-régression : les icônes de type d'arme de l'appli elle-même
      (Inventaire, recherche Manifest, Artefact) sont inchangées.
- [x] Nouveau bouton « 🖼 Image JPEG », à gauche de « 🖼 Image PNG » :
      Windows propose d'enregistrer `fiche-d2-<nom>.jpg`, même image que le
      PNG.

---

---

Section 0.2.7 retirée le 28/09/2026 après confirmation de l'utilisateur
(validation donnée par message, sans PDF), recopiée mot pour mot.

## 🆕 v0.2.7 — miniatures des Aspects et Fragments dans l'export (27/09/2026)

Confirmés en 0.2.6 : icônes de type d'arme, d'élément et anti-champion
alignées dans l'export, et export JPEG.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.

- [x] Dans l'image et le PDF exportés, bloc DOCTRINE : chaque Aspect et
      chaque Fragment a sa miniature, suivie de son nom, une ligne chacun.
- [x] Les miniatures des Aspects sont alignées sous celles de Super,
      Grenade et Saut ; celles des Fragments sous Mêlée et Compétence de
      classe.
- [x] Les miniatures sont les mêmes que dans le bloc Doctrine de l'appli.

---

---

Section 0.2.8 retirée le 28/09/2026 après confirmation de l'utilisateur
(PDF coché renvoyé, 13 cases), recopiée mot pour mot.

## 🆕 v0.2.8 — partage sans enregistrer, pondération personnalisée (28/09/2026)

Confirmés en 0.2.7 : miniatures des Aspects et Fragments dans l'export.

⚠️ `npm.cmd run build` d'abord (nouveaux fichiers : une variable inutilisée
ferait échouer la compilation, copier alors le message à Claude), puis
`npm.cmd run electron:build` et réinstaller.

**Export (image et PDF)**
- [x] Titre ARMURE : les stats sont nettement plus lisibles (nom en gris
      clair, valeur en blanc et en gras).
- [x] Icône anti-champion sans cadre, comme dans Mon Build, toujours
      alignée avec le type d'arme et l'élément.

**Bloc « Partage du build » (sous l'Artefact)**
- [x] Le bloc apparaît sous l'Artefact, avec un triangle ▶/▼ pour le
      replier.
- [x] Sans rien enregistrer : « ⬇ Exporter le fichier » produit un
      `build-d2-<nom>.json` qui se réimporte avec « Importer » dans les
      Loadouts et redonne le même build.
- [x] « 📋 Copier en texte », « 🖼 Image JPEG », « 🖼 Image PNG » et
      « 📄 PDF » fonctionnent sur le build affiché.
- [x] Champ « Nom du build » vide : la fiche s'appelle « Mon build » ; rempli :
      le nom saisi apparaît sur la fiche et dans le nom des fichiers.
- [x] Non-régression : dans la fiche « 👁 Voir », les mêmes boutons
      fonctionnent toujours, « Fermer » compris.

**Pondération personnalisée (bloc « 0. Contexte du build »)**
- [x] Par défaut « Automatique (selon le contexte) » : score global
      identique à avant la mise à jour.
- [x] « ✏️ Personnaliser… » : tant que le total n'est pas 100 %,
      « Enregistrer et activer » reste grisé et le total s'affiche en
      orange.
- [x] Enregistrer un réglage nommé : il devient actif, le tableau des
      poids affiche ses valeurs, un message orange le signale, le score
      global change.
- [x] Menu « Pondération » : passer d'un réglage à l'autre, puis revenir
      en Automatique redonne le score d'origine.
- [x] Fermer et relancer l'appli : le réglage actif est conservé.
- [x] « 🗑 Supprimer ce réglage » : retour en Automatique.

---

---

Section « v0.2.8 (suite) — bloc Connexion et Bibliothèque » retirée le
29/09/2026 après validation de l'utilisateur (donnée par message, 10
cases), recopiée mot pour mot, cases cochées.

## 🆕 v0.2.8 (suite) — bloc Connexion et Bibliothèque (28/09/2026)

### Bloc Connexion

- [x] Une fois connecté, « Compte : » est **à gauche des boutons**, sur la
      même ligne, suivi de ton nom Bungie au format `pseudo#1234`.
- [x] Le code après le `#` a **4 chiffres** et correspond à celui affiché
      en jeu.
- [x] La ligne des personnages (classe, lumière) et du nombre d'objets du
      coffre a **disparu**.
- [x] Le bouton s'appelle maintenant **« Tester la connexion »** et
      fonctionne toujours.
- [x] Mon Build et le panneau Loadouts affichent toujours tes personnages
      (ils sont encore chargés, simplement plus affichés dans ce bloc).
- [x] Après « Se déconnecter », « Compte : » disparaît ; après
      reconnexion, il revient.

### Sélecteur Build Analyzer / Bibliothèque

- [x] Au lancement, le sélecteur sous le bloc Connexion est sur **Build
      Analyzer**.
- [x] Sur **Bibliothèque**, tout Build Analyzer disparaît, y compris les
      deux panneaux latéraux (Solo sans mourir, Loadouts). La page affiche
      « en construction » et l'état du Manifest.
- [x] Retour sur **Build Analyzer** : rien n'est perdu (inventaire chargé,
      doctrine, Mon Build, recherche en cours).
- [x] Quitte l'appli en étant sur Bibliothèque, relance-la : elle rouvre
      sur **Build Analyzer**.

---

Section « v0.2.8 (suite) — fiches exportées » retirée le 30/09/2026 après
confirmation de l'utilisateur (PDF coché renvoyé, 11 cases), recopiée mot
pour mot.

## 🆕 v0.2.8 (suite) — fiches exportées en JPEG/PNG/PDF (29/09/2026)

Confirmés le 29/09 : bloc Connexion (nom Bungie `pseudo#1234`) et
sélecteur Build Analyzer / Bibliothèque.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.
Ces changements ne concernent QUE les exports JPEG/PNG/PDF : la fiche
« 👁 Voir », sa copie en texte, Mon Build et l'Inventaire ne changent pas.

**Armes**
- [x] Sous la ligne d'icônes (type, élément, champion) : l'**armature**
      (ex. « Armature de déni de zone »), puis la **particularité
      d'origine** si l'arme en a une (ex. « Transposeur radiolaire »),
      alignées à gauche avec les icônes.
- [x] « Perks actifs » ne montre plus l'armature, l'origine,
      « Emplacement de mémento vide » ni « Arme façonnée ».
- [x] Si tu as une arme avec un vrai perk contenant « Memento » (ex.
      « Memento Mori » sur As de Pique), il reste bien affiché.

**Armure**
- [x] Toujours affichés : « Mod de classe », « Mods d'arme », réglages
      « +Super / -Santé ».
- [x] Plus affichés : « Spécialiste » et les autres archétypes,
      « Amélioration d'armure ».
- [x] ⚠️ **Point à bien regarder** : les ornements (ex. « Veste de
      détective perspicace », « Poings de détective perspicace ») et les
      revêtements ont disparu. Leur reconnaissance n'a pas pu être essayée
      sur de vrais objets avant livraison : s'il en reste un, donne son
      nom à Claude.
- [x] Un mod présent deux fois sur une pièce s'affiche une seule fois,
      suivi de « ×2 » (ex. « Détecteur de munitions lourdes ×2 »).

**Texte agrandi**
- [x] Tous les textes sont nettement plus lisibles, sur PC et sur
      téléphone.
- [x] Aucun nom (arme, pièce, perk, mod) n'est coupé sur deux lignes alors
      qu'il tenait sur une seule avant. Seule exception attendue : les
      perks d'artefact peuvent passer sur deux rangées.

**Non-régression**
- [x] Fiche « 👁 Voir » et « 📋 Copier en texte » : identiques à avant.
- [x] Mon Build et l'Inventaire : icônes de perks identiques à avant.

---

Sections « v0.2.9 » et « v0.2.8 (suite 2) » retirées le 30/09/2026 après
confirmation de l'utilisateur (PDF coché renvoyé, 21 cases), recopiées
mot pour mot. Le test « [~] » n'a pas été validé : il a été remplacé par une
nouvelle consigne (trois colonnes).

## 🆕 v0.2.9 — icônes de type de munitions (30/09/2026)

⚠️ Nouvelle version : `npm.cmd run build`, puis `npm.cmd run electron:build`
et réinstaller.

Couleurs choisies le 28/09 : principales blanc cassé, spéciales vert,
lourdes violet moyen.

- [x] **Inventaire** : sur chaque arme, l'icône de munitions apparaît juste
      à droite de l'icône d'élément, alignée avec elle.
- [x] **Mon Build** : même chose sur chaque arme.
- [x] **Fenêtres de détails** d'une arme (Inventaire et Mon Build) : l'icône
      de munitions suit l'icône d'élément, avant l'anti-champion.
- [x] **Fiche « 👁 Voir »** : l'icône suit le nom de l'élément, alignée sur
      le texte.
- [x] **Exports JPEG/PNG/PDF** : ligne sous le nom de l'arme = type d'arme,
      élément, munitions, anti-champion, alignés.
- [x] **« 📋 Copier en texte »** : « munitions principales / spéciales /
      lourdes » entre parenthèses après l'élément.
- [x] Le type affiché est le bon pour chaque arme (au moins une de chaque
      type). En particulier, un lance-grenades à munitions spéciales et un
      lance-grenades lourd sont bien distingués.
- [x] Lisibilité : l'icône violette des munitions lourdes reste lisible, y
      compris à côté d'un élément Abyssal.
- [x] Un build enregistré AVANT cette version affiche aussi les icônes.

**Boutons des Loadouts (logiciel installé)**
- [x] « Renommer » : une zone de saisie s'ouvre dans la carte du build ;
      « ✓ Valider » ou Entrée enregistre, « Annuler » ou Échap abandonne.
- [x] « Décrire » : même principe, sur plusieurs lignes (Entrée passe à la
      ligne ; valider avec le bouton).
- [x] « Icône » : les mêmes choix d'icônes qu'à l'enregistrement
      s'affichent ; l'icône choisie apparaît sur la carte après validation.

**Fiche « 👁 Voir »**
- [x] Sous le nom de chaque arme : icône de type d'arme, icône d'élément
      (le nom de l'élément n'est plus écrit), munitions, anti-champion —
      même ordre que dans l'export, alignés d'une arme à l'autre.

**Exports : Aspects et Fragments sur deux colonnes**
- [~] Aspects et Fragments sont chacun sur deux colonnes, lues de haut en
      bas ; les quatre colonnes ont la même largeur et s'alignent sous les
      compétences (Super / Mêlée). **Non validé, remplacé** le 30/09/2026 :
      l'utilisateur veut trois colonnes (1 pour les Aspects, 2 pour les
      Fragments), testé dans la section suivante.
- [x] Aucun nom coupé sur deux lignes (sauf nom exceptionnellement long).

---

## 🆕 v0.2.8 (suite 2) — mêmes règles partout, artefact justifié (30/09/2026)

Confirmés le 30/09 : nettoyage des listes, armature et origine sous les
icônes, doublons « ×2 » et texte agrandi dans les exports ; ornements bien
écartés.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.

**Exports JPEG/PNG/PDF**
- [x] « Emplacement de souvenance vide » n'apparaît plus dans les perks des
      armes.
- [x] Perks d'artefact (7 sélectionnés) : une rangée de 3 puis une rangée
      de 4, chacune sur toute la largeur, comme un texte justifié.

**Fiche « 👁 Voir » : mêmes règles que les exports**
- [x] Sous le nom de chaque arme : « Armature : … » puis « Origine : … »
      (si l'arme en a une), avec leur icône.
- [x] Les pastilles ne montrent plus l'armature, l'origine, les
      emplacements de mémento ou de souvenance vides, « Arme façonnée »,
      les archétypes, « Amélioration d'armure », les ornements ni les
      revêtements ; « Mod de classe », « Mods d'arme » et « +Super /
      -Santé » restent.
- [x] Un mod en double s'affiche une fois, suivi de « ×2 ».

**« 📋 Copier en texte » : mêmes règles**
- [x] Pour chaque arme, des lignes « Armature : … » et « Origine : … »,
      puis « Perks : … » sans eux ; pour l'armure, « Mods : … » nettoyés,
      avec « ×2 » pour les doublons.

**Non-régression**
- [x] Mon Build et l'Inventaire : icônes de perks identiques à avant (ils
      ne sont pas concernés).

---

Section « v0.2.9 (suite) — trois colonnes » retirée le 30/09/2026 après
validation de l'utilisateur (donnée par message, 2 cases), recopiée mot
pour mot, cases cochées.

## 🆕 v0.2.9 (suite) — Aspects et Fragments sur trois colonnes (30/09/2026)

Confirmés le 30/09 : toute la v0.2.9 (icônes de munitions partout, boutons
des Loadouts, icônes dans la fiche « 👁 Voir ») et la suite 0.2.8 (mêmes
règles pour la fiche et le texte, artefact justifié).

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.

- [x] Dans les exports JPEG/PNG/PDF, bloc DOCTRINE : les Aspects occupent
      une colonne, les Fragments deux colonnes (lues de haut en bas) ; les
      trois colonnes ont la même largeur.
- [x] Aucun nom d'aspect ou de fragment coupé sur deux lignes.

---

Section « v0.3.0 (suite 2) — nouveau logo » retirée le 01/10/2026 après
confirmation de l'utilisateur (PDF coché renvoyé, 10 cases), recopiée mot
pour mot.

## 🆕 v0.3.0 (suite 2) — nouveau logo partout, à l'essai (01/10/2026)

Le logo Forge Armory remplace l'ancien **pour l'essai** : icône d'installation,
raccourci, barre des tâches, onglet du navigateur et en-tête de l'appli. Le NOM
de l'appli ne change pas encore (« D2 Build Analyzer »). L'ancien logo est
conservé (`ressources-installateur/ancien-logo/`, avec la marche à suivre pour
y revenir). Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.
**Windows garde les icônes en mémoire** : si l'ancienne icône reste affichée
après l'installation, désinstalle d'abord l'ancienne version, détache puis
rattache le raccourci de la barre des tâches, et en dernier recours redémarre
l'Explorateur Windows (Ctrl+Maj+Échap, « Explorateur Windows », clic droit,
« Redémarrer ») ou Windows lui-même. Dans le navigateur, Ctrl+F5 rafraîchit le
favicon.

**En-tête de l'appli** (d'après la maquette validée le 30/09)
- [x] En-tête sur deux lignes : « **Forge Armory** » en titre, « Destiny 2 Build
      Analyzer · par Orynick/Orygamer » en sous-titre. (Seul l'en-tête change :
      la fenêtre et le logiciel s'appellent toujours « D2 Build Analyzer ».)
- [x] Logo à **gauche** ; son **cercle** va du haut du « F » de « Forge »
      jusqu'au bas des lettres du sous-titre (le « y » et le « g ») ; les
      losanges bleus dépassent au-dessus et au-dessous.
- [x] Logo **net**, même en zoomant (Ctrl +), sans carré noir autour.
- [x] Changer la taille de la fenêtre, ou zoomer (Ctrl + / Ctrl −) : le logo
      reste aligné sur le texte.
- [x] L'ancien Cryptarque (à gauche) et l'ancien Spectre (à droite du titre) ont
      disparu.

**Icône Windows (logiciel installé)**
- [x] Icône de l'installateur et du désinstallateur : logo complet.
- [x] Raccourci du bureau : logo complet en grandes icônes (clic droit sur le
      bureau, Affichage, Grandes icônes), papillon seul en petites icônes.
- [x] Barre des tâches et barre de titre de la fenêtre (icônes minuscules) :
      papillon lisible, sans tache grise.

**Onglet du navigateur** (`npm.cmd run dev`)
- [x] Favicon : papillon blanc sur fond noir, lisible sur un onglet clair comme
      sombre.

**Si tu n'aimes pas**
- [x] Dis-le-moi : le retour à l'ancien logo est prêt (4 gestes notés dans
      `ressources-installateur/ancien-logo/LISEZ-MOI.md`).

---

Section « v0.3.0 (suite 3) — « Équiper » un objet d'un autre personnage »
retirée le 01/10/2026 après confirmation de l'utilisateur (PDF coché renvoyé,
5 cases), recopiée mot pour mot.

## 🆕 v0.3.0 (suite 3) — « Équiper » un objet d'un autre personnage (01/10/2026)

Échec constaté le 01/10 : une arme dans l'inventaire d'un autre personnage
(équipée ou non) donnait « Équipement échoué (500) : DestinyItemNotFound ». La
lecture de la position de l'objet échouait, et l'appli tentait quand même
l'opération. Désormais elle lit la position comme le fait l'Inventaire
(profil complet) et, si elle n'y arrive pas, elle s'arrête avec un message
clair, sans rien déplacer. Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller. Ne
teste que sur des objets sans conséquence.

- [x] Arme dans l'inventaire d'un **autre personnage, non équipée** : elle passe
      par le coffre, arrive sur le personnage choisi et s'équipe.
- [x] Arme **équipée sur un autre personnage** : message clair (« objet
      actuellement ÉQUIPÉ sur un autre personnage… »), rien n'est déplacé.
- [x] Objet **démantelé ou remplacé** (un build enregistré avec une pièce que
      tu n'as plus) : message clair (« objet introuvable… Réparer
      automatiquement »), pas d'erreur technique.
- [x] Les cas déjà validés marchent toujours : objet déjà sur le personnage
      choisi, objet dans le coffre, build complet via les Loadouts.
- [x] En cas d'échec, le message se termine par « position lue avant : … » :
      copie-le-moi en entier, il dit où l'appli croyait trouver l'objet.

---

Section « v0.3.0 (suite) — « Équiper » corrigé, expiration de session »
retirée le 01/10/2026 après confirmation de l'utilisateur (PDF coché renvoyé :
expiration réelle après plus d'une heure et reconnexion validées), recopiée mot
pour mot. Le test « Vraie expiration de session » des tests « au fil de l'eau »
est validé par la même occasion (même vérification) et retiré de la liste.

## 🆕 v0.3.0 (suite) — « Équiper » corrigé, expiration de session (30/09/2026)

Deux problèmes signalés après la mise à niveau d'Electron. Ils n'étaient
PAS liés à Electron (vérifiable : même comportement dans `npm.cmd run dev`).
Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller.
Pour « Équiper », ne teste que sur des objets sans conséquence, et ne change
pas de personnage pendant un test. Les pièces déplacées par l'appli
changent VRAIMENT de place en jeu (coffre ↔ personnage).

**« Équiper » (Mon Build et Loadouts)** — avant : « Transfert échoué (500) :
DestinyItemNotFound » sur certaines armes, 8 échecs sur 8 pour un build.
Maintenant l'appli lit d'abord où se trouve chaque objet, puis agit.
- [x] Objet **déjà sur le personnage choisi** (le cas qui échouait) :
      l'équipement réussit, sans erreur.
- [x] Objet **dans le coffre** : il est tiré vers le personnage, puis équipé.
- [~] Objet **sur un autre personnage** (non équipé) : il passe par le
      coffre puis arrive sur le personnage choisi, et s'équipe. → **déplacé dans la section « suite 3 »** (échec
      constaté le 01/10, corrigé).
- [~] Objet **équipé sur un autre personnage** : message clair (« équipé sur
      un autre personnage… »), rien n'est déplacé. → **déplacé dans la section « suite 3 »** (échec
      constaté le 01/10, corrigé).
- [~] Objet **démantelé ou remplacé** : message clair (« objet introuvable…
      Réparer automatiquement »), pas d'erreur technique. → **déplacé dans la section « suite 3 »** (échec
      constaté le 01/10, corrigé).
- [x] « Équiper le build en jeu » (Loadouts) avec un build dont les pièces
      sont un mélange des cas ci-dessus : le résultat indique pièce par
      pièce ce qui a réussi et pourquoi le reste a échoué.

**Expiration de session**
- [x] `npm.cmd run dev` : connecté, cliquer sur « ⏳ Simuler l'expiration
      (dev) » (à côté de « Se déconnecter »). SANS rien faire d'autre, sous
      15 secondes : l'en-tête passe à « non connecté » et la bannière ⏳
      apparaît. (Le bouton ne fait plus que périmer le jeton : c'est la
      détection qui doit réagir.)
- [x] Logiciel installé, appli laissée ouverte plus d'une heure : la même
      bannière apparaît toute seule, sans avoir à cliquer sur quoi que ce
      soit (ce test remplace « Vraie expiration de session » plus bas).
- [x] Après expiration, « Connexion Bungie.net » permet de se reconnecter et
      tout redevient normal.

---

Section « v0.3.0 (suite 4) — remplacement automatique d'une arme équipée ailleurs »
retirée le 01/10/2026 : l'utilisateur a confirmé par message que les tests étaient
concluants (« on peut fermer ce point »), sans renvoyer de PDF. Recopiée mot pour mot,
cases cochées.

## 🆕 v0.3.0 (suite 4) — remplacement automatique d'une arme équipée ailleurs (01/10/2026)

Une arme ÉQUIPÉE sur un autre personnage ne peut pas être déplacée (règle de
Bungie). Désormais, l'appli équipe d'abord une AUTRE arme du même emplacement
sur cet autre personnage, puis déplace la tienne vers le personnage choisi et
l'équipe. Règles validées le 01/10 : arme du même emplacement, prise d'abord
dans l'inventaire de cet autre personnage, sinon dans le coffre ; légendaire
de préférence ; un exotique seulement s'il n'y a rien d'autre et que ce
personnage n'a pas déjà un autre exotique équipé. Armes seulement (l'armure
garde le message actuel). Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller. Ne
teste que sur des objets sans conséquence : l'appli équipe VRAIMENT une arme à
ta place sur l'autre personnage.

- [x] Arme équipée sur un autre personnage, qui a une autre arme du même type
      dans son inventaire : l'arme voulue arrive sur le personnage choisi et
      s'équipe ; le message indique « « X » équipée à sa place sur l'autre
      personnage ». Vérifie en jeu que X est bien équipée là-bas.
- [x] Même chose quand la seule remplaçante est dans le COFFRE : le message
      ajoute « (sortie du coffre) ».
- [x] Préférence respectée : si l'autre personnage a une légendaire ET une
      exotique du même type disponibles, c'est la légendaire qui est équipée.
- [x] Aucune remplaçante possible (aucune autre arme de ce type, ni sur ce
      personnage ni au coffre) : message clair, rien n'est déplacé.
- [x] « Équiper le build en jeu » (Loadouts) avec une arme dans ce cas : le
      bilan se termine par « À noter : … » avec le remplaçant.
- [x] Une ARMURE équipée sur un autre personnage (même classe) : message
      inchangé, rien n'est déplacé.

---

Section « v0.3.0 (suite 5) — contrôle de l'anti-champion des armes exotiques »
retirée le 01/10/2026 SANS avoir été exécutée : l'utilisateur a précisé que sa liste
venait du jeu et était fiable, et demandé de l'utiliser directement, ce qui rend le
contrôle sans objet. Les deux premières cases (lancer le contrôle, envoyer le rapport)
sont abandonnées ; la troisième (disparition du bouton « Simuler l'expiration ») est
reprise dans la section « suite 7 ». Outil conservé, drapeau archivé. Texte d'origine :

## 🆕 v0.3.0 (suite 5) — contrôle de l'anti-champion des armes exotiques (01/10/2026)

Outil de diagnostic (mode développement seulement) : il compare l'anti-champion
que l'appli DÉDUIT pour chaque arme exotique à ta liste de référence (143
armes). Lecture seule : rien n'est modifié. Version inchangée : 0.3.0.

Marche à suivre :
1. `npm.cmd run dev`, puis ouvrir l'appli dans le navigateur, Manifest chargé
   (pas besoin d'être connecté).
2. Dans le tableau de bord, bloc « 🔍 Diagnostic (dev) : anti-champion des armes
   exotiques », cliquer sur « Lancer le contrôle » (quelques secondes).
3. Cliquer sur « ⬇ Télécharger le rapport complet » et m'envoyer le fichier
   `controle-anti-champion-exotiques.md`.

- [ ] Le contrôle se lance et affiche un bilan (accords, désaccords, non
      détectés…), sans message d'erreur.
- [ ] Le rapport se télécharge ; envoyé à Claude.
- [ ] Le bouton « ⏳ Simuler l'expiration (dev) » a disparu (test validé, outil
      rangé).

---

Section « v0.3.0 — mise à niveau d'Electron (30/09/2026) » : tests VALIDÉS par l'utilisateur
(PDF coché renvoyé le 01/10/2026), retirés le 01/10/2026 lors de l'établissement de la nouvelle
liste, recopiés mot pour mot, cases cochées. Le onzième test (« Un lien externe... ») n'avait pas
pu être fait : il a rejoint les tests « au fil de l'eau ».

- [x] `npm.cmd audit` : de 18 à 4 vulnérabilités, plus aucune liée à
      Electron ni aux outils de fabrication (critique `tar` comprise).
      Restent Vite/esbuild et React Router, prévus en étapes suivantes
      (résultat du 30/09/2026 ; le total annonce 1 élevée parmi elles).
- [x] L'installateur se fabrique sans erreur ; le logiciel s'installe et
      s'ouvre (fenêtre non blanche), avec son icône et « v0.3.0 » en pied
      de page.
- [x] Les builds enregistrés, les réglages de pondération et le cache du
      Manifest sont toujours là (le Manifest se recharge seul).
- [x] Connexion Bungie : la fenêtre s'ouvre et se ferme seule, l'appli
      passe en « connecté ».
- [x] Inventaire et Mon Build s'affichent normalement, avec leurs icônes.
- [x] « Équiper » : remplacé par la section « v0.3.0 (suite) » ci-dessus, car
      il a échoué (DestinyItemNotFound) et a été corrigé.
- [x] Exports JPEG, PNG et PDF d'une fiche : la boîte d'enregistrement
      s'ouvre sur Téléchargements, les fichiers sont corrects.
- [x] « 📋 Copier en texte » : le texte se colle bien ailleurs.
- [x] Loadouts : « Renommer », « Décrire », « Icône », « Supprimer »
      (confirmation) fonctionnent.
- [x] Sélecteur Build Analyzer / Bibliothèque : fonctionne.

---

Test validé de la section « identité visuelle Forge Armory et filigrane » : l'utilisateur a accepté
l'intensité du filigrane (7 %) par message le 01/10/2026 ; retiré de la liste le même jour, recopié mot
pour mot, case cochée.

- [x] Intensité : ni trop forte ni trop faible. **Validé : 7 %.** Sinon dis-le-moi : c'est un seul réglage
      (7 % aujourd'hui ; 4 % et 11 % ont été comparés sur l'aperçu).

---

Quatre sections VALIDÉES par l'utilisateur : PDF coché renvoyé le 02/10/2026 (50 cases dont 48 cochées ;
les deux restantes sont les tests « au fil de l'eau », toujours ouverts). Retirées de la liste le 05/10/2026,
recopiées mot pour mot (texte de la liste telle qu'elle était au moment des tests), cases cochées. Le test
« Un lien externe... » de la mise à niveau d'Electron, déplacé dans les tests « au fil de l'eau » le 01/10/2026,
a été coché dans le même PDF : il est validé lui aussi (« Lien externe (mise à niveau d'Electron, 30/09) :
s'il y a un lien externe sur une page du logiciel, il s'ouvre dans le navigateur, pas dans le logiciel »).

## 🆕 v0.3.0 (suite 9) — les deux lance-grenades départagés par leur type de munitions (01/10/2026)

L'icône du type d'arme « Lance-grenades » (spécial ou lourd) se détermine maintenant par le TYPE DE
MUNITIONS de l'arme, le même que celui affiché à côté (munitions spéciales : vert ; lourdes :
violet), et non plus par son emplacement. Les deux icônes ne peuvent donc plus se contredire. Si le
type de munitions est inconnu (Manifest non chargé), l'ancienne règle par l'emplacement s'applique.
Aucun autre type d'arme ne change. Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller (ou `npm.cmd run dev`).

- [x] Un lance-grenades à munitions **spéciales** : icône de lance-grenades spécial, avec l'icône de
      munitions spéciales (verte) juste à droite de l'élément ; dans l'Inventaire, Mon Build, la fiche
      « Voir » et l'export (JPEG, PNG, PDF).
- [x] Un lance-grenades à munitions **lourdes** : icône de lance-grenades lourd, avec l'icône de
      munitions lourdes (violette) ; mêmes endroits.
- [x] Les deux types côte à côte dans un même build (ou une même liste) restent bien différenciés.
- [x] Recherche dans le Manifest : un lance-grenades lourd et un lance-grenades spécial ont chacun la
      bonne icône.
- [x] Les autres armes (fusils, arcs, épées, lance-roquettes...) gardent exactement leur icône.
- [x] Note : les **filtres par type d'arme** affichent toujours UNE seule entrée « Lance-grenades »
      (leur liste porte des noms de types, identiques pour les deux) ; c'est attendu.

---

## 🆕 v0.3.0 (suite 8) — Loadouts : « Modifier... », « Exporter... », équipement selon la classe (01/10/2026)

Trois changements dans le panneau 🗂️ Loadouts, sur ta demande. Les boutons de la fiche « Voir »
ne changent pas. Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller. Pour « Équiper en jeu »,
ne teste que sur des objets sans conséquence : l'équipement est réel.

**Boutons d'une carte** (au maximum 2 lignes)
- [x] Chaque carte affiche : Charger, 👁 Voir, 🎮 Équiper en jeu, Modifier..., Supprimer,
      ⬇ Exporter... — sur **2 lignes au maximum**. Plus de boutons Icône, Décrire ni Renommer,
      plus de menu « Équiper sur : » en haut du panneau. (Le libellé est « Modifier... » et non
      « Modifier description... » : le long libellé risque une 3e ligne selon la police ; dis-le-moi
      si tu le préfères, c'est un mot à changer.)

**« Modifier... »**
- [x] La fenêtre s'ouvre avec le nom, la description et l'icône actuels.
- [x] Changer les trois, « ✓ Valider » : la carte affiche le nouveau nom, la nouvelle description
      (retours à la ligne conservés) et la nouvelle icône.
- [x] Nom vidé : « Valider » est grisé ; Échap ou « Annuler » ne change rien ; cliquer à côté de la
      fenêtre ne la ferme pas (pour ne pas perdre ce qui est tapé).

**« ⬇ Exporter... »**
- [x] La fenêtre propose, dans l'ordre : Copie texte, Export JPEG, Export PNG, Export PDF, Export JSON.
- [x] Copie texte : le texte se colle ailleurs ; Export JSON : le fichier se télécharge et se
      réimporte avec « ⬆ Importer ».
- [x] Export JPEG, PNG et PDF (logiciel installé) : le fichier est enregistré ; il est identique à celui
      obtenu depuis « Voir » (avec le filigrane). Dans le navigateur, ces trois choix sont grisés.
- [x] Les boutons de la fiche « Voir » sont inchangés (Exporter le fichier, Copier en texte, Image
      JPEG, Image PNG, PDF, Fermer).

**« 🎮 Équiper en jeu » selon la classe du build**
- [x] Un build Chasseur s'équipe directement sur ton Chasseur, sans question (la confirmation nomme
      le Chasseur et sa lumière) ; rien n'est touché sur tes autres personnages.
- [x] Un build **sans classe** (enregistré sans en choisir une) : une fenêtre explique la situation et
      propose tes personnages ; l'équipement a lieu seulement après ton choix.
- [x] Un build d'une classe dont tu n'as **aucun** personnage : une fenêtre l'explique, rien n'est
      équipé. (Si tu as deux personnages de la même classe : elle ne propose que ces deux-là.)
- [x] Un build qui contient de la Doctrine (sous-classe, super, aspects, fragments...) : la check-list
      « À configurer à la main en jeu » s'ouvre après l'équipement. Un build qui n'a que des armes
      et des armures : **pas de check-list**.

---

## 🆕 v0.3.0 (suite 7) — anti-champion des armes exotiques d'après ta liste (01/10/2026)

Pour une arme EXOTIQUE, l'appli utilise maintenant **ta liste du jeu** pour son anti-champion
(icône d'Inventaire, de Mon Build, de la fiche « Voir » et des exports ; filtres par champion ;
score). Avant, elle le déduisait du texte du perk, ce qui échouait sur certaines armes. Une
exotique dont le nom ne figure pas dans ta liste (très récente, ou nom différent) garde l'ancienne
déduction. Les armes non exotiques ne changent pas. Version inchangée : 0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller (ou `npm.cmd run dev`).

- [x] **Belle Affaire** → Surchargé ; **Sturm** → Implacable ; **Empereur des Rats** → Bloqueur :
      l'icône anti-champion correspond à ta liste (Inventaire, Mon Build, fiche « Voir »).
- [x] **Mille voix** (qui ne marchait pas avant) : icône Implacable.
- [x] Une exotique **sans** anti-champion dans ta liste (Tueur de Souhaits, Obligation
      collective, Ergo Sum…) : **aucune** icône.
- [x] Les filtres « par champion » de l'Inventaire et du Coffre montrent les bonnes armes.
- [x] Une arme exotique qui affiche une icône **différente de ta liste** : donne-moi son nom
      (c'est qu'il s'écrit autrement dans le jeu : elle retombe alors sur l'ancienne déduction).
- [x] Le bouton « ⏳ Simuler l'expiration (dev) » a disparu du mode développement (test validé,
      outil rangé).

---

## 🆕 v0.3.0 (suite 6) — identité visuelle Forge Armory et filigrane (01/10/2026)

L'image d'identité que tu as fournie remplace l'ancien logo **pour l'essai**, partout :
en-tête de l'appli (taille « B » choisie), icône Windows, favicon. De plus, un
**filigrane** (l'emblème en vectoriel, très discret) apparaît sur les fiches : fenêtre
« Voir », exports JPEG, PNG et PDF. Le NOM du logiciel ne change pas encore (fenêtre,
raccourci, installateur, textes des exports : « D2 Build Analyzer »). L'ancien logo et la
première version du logo Forge Armory sont conservés
(`ressources-installateur/ancien-logo/`, avec la marche à suivre). Version inchangée :
0.3.0.

⚠️ `npm.cmd run build`, puis `npm.cmd run electron:build` et réinstaller. **Windows garde
les icônes en mémoire** : si l'ancienne icône reste affichée après l'installation,
désinstalle d'abord l'ancienne version, détache puis rattache le raccourci de la barre des
tâches, et en dernier recours redémarre l'Explorateur Windows (Ctrl+Maj+Échap,
« Explorateur Windows », clic droit, « Redémarrer »). Dans le navigateur, Ctrl+F5
rafraîchit le favicon.

**En-tête de l'appli**
- [x] L'emblème est à **gauche**, le bloc de texte (« Forge Armory », ligne de séparation
      à étoile, « Destiny 2 Build Analyzer | par Orynick/Orygamer ») à **droite**.
- [x] Le **cercle** de l'emblème va du haut de « FORGE » jusqu'au bas du sous-titre ; les
      losanges bleus dépassent au-dessus et au-dessous. Textes alignés.
- [x] Images **nettes** (même en zoomant avec Ctrl +), **sans carré noir** autour.
- [x] L'espace sous l'en-tête et la position du bloc Connexion sont corrects.

**Icône Windows (logiciel installé)**
- [x] Installateur et désinstallateur : emblème complet.
- [x] Raccourci du bureau : emblème complet en grandes icônes, papillon seul en petites.
- [x] Barre des tâches et barre de titre de la fenêtre : papillon lisible, sans tache grise.

**Onglet du navigateur** (`npm.cmd run dev`)
- [x] Favicon : papillon blanc sur fond noir, lisible sur un onglet clair comme sombre.

**Filigrane**
- [x] Fenêtre « Voir » : l'emblème apparaît, centré et discret, derrière tout le contenu
      visible ; le texte reste parfaitement net ; les boutons restent cliquables (JSON,
      texte, JPEG, PNG, PDF, Fermer) ; en faisant défiler, le filigrane suit la fiche.
- [x] Export JPEG et PNG : même filigrane, centré sur la fiche ; la mise en page, la
      hauteur et la netteté du texte sont identiques à avant.
- [x] Export PDF : même filigrane ; **zoomer fortement** (400 % ou plus) : l'emblème reste
      net (vectoriel) ; le PDF tient toujours sur une page.
- [x] Intensité : ni trop forte ni trop faible. **Validé : 7 %.** Sinon dis-le-moi : c'est un seul réglage
      (7 % aujourd'hui ; 4 % et 11 % ont été comparés sur l'aperçu).

**Si tu n'aimes pas**
- [x] Dis-le-moi : le retour aux logos précédents est prêt
      (`ressources-installateur/ancien-logo/LISEZ-MOI.md`).

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » coché, renvoyé le 05/10/2026 (**passé en `npm.cmd run dev`** : aucun test du logiciel installé n'a pu être
fait, la fabrication de l'installateur échouait sur l'erreur TS2540 de `RangeeBoutonsEgaux.tsx`, corrigée depuis). 22 cases cochées sur 33. Retirés de la liste le
05/10/2026, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT au moment des tests, cases cochées. Quatre sections sont entièrement validées (les
trois premières et la quatrième) ; deux autres le sont en partie (Renommage, Lance de Polaris : le reste est resté dans la liste).

## 🆕 Icônes des perks d'artefact : vérifier si le Manifest les contient (05/10/2026)

- [x] (npm.cmd run dev) Charger le Manifest (bloc « Recherche dans le Manifest »), puis, dans le bloc « 🖼️ Diagnostic (dev) : icônes des perks d'artefact » :
      « Lancer la recherche des icônes » (quelques secondes). Le bilan s'affiche : ✅ trouvées, ⚠️ ambiguës, ❌ introuvables.
- [x] « ⬇ Télécharger le rapport complet », et **m'envoyer** `controle-icones-perks-artefact.md` : il dit si on peut enregistrer les icônes dans l'appli, et sinon
      comment Bungie range ces objets.
- [x] Rien d'autre ne change à l'écran : aucune icône n'apparaît encore dans l'artefact, c'est normal.

Résultat (rapport reçu le 05/10/2026 à 21 h 36, conservé dans `knowledge-base/sources-externes/controle-icones-perks-artefact_2026-10-05.md`) : le Manifest CONTIENT
ces icônes : 125 perks sur 147 trouvés, 13 ambigus, 9 introuvables.

---

## 🆕 Version de Destiny 2 et niveau des correctifs, en haut à droite (05/10/2026)

- [x] **Trois lignes** alignées à droite, discrètes, sans rien décaler dans la page : « **DESTINY 2 · VERSION 9.7.0** » ; « Monument of Triumph · patch du 9 juin 2026 » ; et,
      **en ambre**, « **Correctifs : aucun intégré · dernier publié : 9.7.0.4 (28 juillet 2026)** ».
- [x] La 3ᵉ ligne est ambre exprès : les correctifs 9.7.0.1 à 9.7.0.4 sont publiés mais **aucun n'est intégré** ; la version affichée reste donc 9.7.0, pas 9.7.0.4.
- [x] Infobulle au survol : version prise en compte, correctifs publiés depuis, ceux qui ne sont pas encore intégrés.
- [x] Rétrécir la fenêtre : l'affichage passe sous le titre, calé à droite, sans déborder (aussi dans le logiciel installé).

Suite donnée le même jour : demande de l'utilisateur d'inverser les couleurs des lignes 2 et 3 (ligne 2 en ambre, ligne 3 en gris), faite après ces tests.

---

## 🆕 Renommage officiel : Forge Armory (05/10/2026) — trois tests sur huit (les cinq autres sont restés dans la liste)

- [x] Titre de la fenêtre (et de l'onglet en `npm.cmd run dev`) : « Forge Armory — Destiny 2 Build Analyzer ». Pied de page de l'appli : « Forge Armory v0.3.0 — Destiny 2
      Build Analyzer — créé par Orynick/Orygamer ».
- [x] La connexion Bungie fonctionne comme avant, sans rien reconfigurer (ni sur le portail, ni dans l'appli).
- [x] Un fichier d'export JSON fait AVANT le renommage (ton « ⬇ Exporter tout ») se réimporte normalement avec « ⬆ Importer ».

---

## 🆕 Doctrine : boutons de choix de l'élément, tous de la même taille (05/10/2026)

- [x] Dans la Doctrine, la ligne de choix de l'élément : **tous les boutons ont exactement la même taille** (largeur et hauteur).
- [x] Selon la largeur de ta fenêtre, ils tiennent sur une ligne ou se répartissent en rangées régulières (jamais un bouton seul sur une ligne) ; **dis-moi laquelle des deux
      tu vois**. Rétrécir ou agrandir la fenêtre : la disposition suit et les boutons gardent la même taille.
- [x] Cliquer sur un élément le sélectionne ; la coche ✓ n'apparaît que sur le bouton sélectionné (aucune coche en trop ailleurs).

Suite donnée le même jour : demande de l'utilisateur de les faire tenir sur UNE ligne (coche déplacée dans le coin du bouton) ; la case « dis-moi laquelle des deux tu vois »
a été cochée sans réponse écrite : le nouveau test redemande de dire ce qu'on voit.

---

## 🆕 Perks d'artefact : l'effet au survol (05/10/2026)

- [x] Bloc Artefact : passer le curseur sur un perk de la grille (un de chaque tier : ◆, ◆◆, ◆◆◆) : l'infobulle montre le **nom, puis l'effet** du perk, en texte propre (aucune
      balise « [icone ... » ni guillemets parasites).
- [x] Un perk bloqué (nombre maximum atteint, ou tier indisponible) : l'infobulle montre l'effet, puis l'explication du blocage, précédée de ⚠️.
- [x] Fenêtre « Voir » d'un build qui a des perks d'artefact : survoler un perk dans la ligne « Artefact » affiche son effet.

---

## 🆕 Icône de type d'arme : la Lance de Polaris (02/10/2026) — trois tests sur quatre (le test des DEUX Lances est resté dans la liste)

- [x] **Lance de Polaris** : l'icône de fusil d'éclaireur apparaît (Inventaire, Mon Build, recherche dans le Manifest, fenêtre « Voir », exports).
- [x] Les autres armes gardent exactement leur icône de type.
- [x] Si une arme n'a toujours pas d'icône de type (badge gris) : passer le curseur sur le badge. Il indique maintenant aussi les **catégories** de l'objet : recopie-moi le texte en entier.

---

## Test traité par un rapport, sans coche (anti-champion des exotiques)

« (npm.cmd run dev) **Armes oubliées** : ... lancer le contrôle ... m'envoyer le fichier `controle-anti-champion-exotiques.md` » : l'utilisateur a envoyé le rapport (conservé dans
`knowledge-base/sources-externes/controle-anti-champion-exotiques_2026-10-05.md`) sans cocher la case. Résultat : **aucune arme oubliée**. Sur 143 noms de la liste, 140 sont
retrouvés dans le Manifest ; les trois restants sont les variantes d'Ergo Sum (cas particulier connu), et la seule exotique du Manifest absente de la liste est « Ergo Sum ».

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » coché, renvoyé le 06/10/2026 (**26 cases cochées et archivées sur 30**, dont ceux du **logiciel installé** : l'installation a réussi). Retirés de la liste le
06/10/2026, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT au moment des tests (version 0.3.0), cases cochées. Sept sections sont entièrement validées ; deux le sont en partie (Recherche : 4 tests sur 5, Doctrine :
3 sur 4) et le reste est resté dans la liste. Les deux tests « au fil de l'eau » (échange d'un build avec un ami, Filobscur) n'ont pas été cochés : ils restent ouverts.

---

## 🆕 Installation : « npm.cmd run build » réussit (05/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**. Si une erreur apparaît : recopie-la en entier.
- [x] `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.0.exe` (dossier `installateur`).

Résultat : `npm.cmd run build` et `npm.cmd run electron:build` ont réussi : l'erreur TS2540 est bien corrigée. Le logiciel a été installé et les tests du logiciel installé ont pu être faits (voir plus bas).

---

## 🆕 Version de Destiny 2 : couleurs des lignes 2 et 3 inversées (05/10/2026)

- [x] Ligne 2 « Monument of Triumph · patch du 9 juin 2026 » en **ambre** ; ligne 3 « Correctifs : aucun intégré · dernier publié : 9.7.0.4 (28 juillet 2026) » en **gris** ;
      ligne 1 « DESTINY 2 · VERSION 9.7.0 » inchangée (bleue).

---

## 🆕 Icônes des perks d'artefact : 125 sur 147 affichées (05/10/2026)

- [x] Bloc Artefact : chaque perk de la grille porte une petite icône devant son nom, nette (aucune image cassée). **Quelques perks n'en ont pas** (les 22 restants) : c'est attendu.
- [x] Les perks placés dans les emplacements équipés, et le récapitulatif en dessous, affichent aussi leur icône ; la hauteur des emplacements ne saute pas quand on place un perk.
- [x] Fenêtre « Voir » et exports (image, PDF) d'un build qui a des perks d'artefact : les icônes y figurent aussi (exports : logiciel installé).
- [x] **Regarde** « Orbes curatifs » et « Orbes de brisure » : ils partagent la même icône. Est-ce normal d'après le jeu ?
- [x] (npm.cmd run dev) Relancer « Lancer la recherche des icônes » (bloc « 🖼️ Diagnostic (dev) ») et **m'envoyer** le nouveau `controle-icones-perks-artefact.md` : il corrige la
      ligature « œ », propose des noms proches pour les introuvables et détaille chaque ambigu avec sa saison.

Résultat : « Orbes curatifs » et « Orbes de brisure » partagent bel et bien la même icône (confirmé par l'utilisateur : c'est légitime). Second rapport reçu le 06/10/2026 à 00 h 22 (conservé dans `knowledge-base/sources-externes/controle-icones-perks-artefact_2026-10-06.md`) : 128 perks trouvés directement (3 de plus grâce à la ligature « œ »), 6 introuvables avec une suggestion évidente, 13 ambigus.

---

## 🆕 Recherche : doublons de nom, mauvaise version affichée (05/10/2026) — tests validés

- [x] Recherche « Le Lapin de Jade » : image bonne, icône d'anti-champion **Implacable**, icône de type d'arme (fusil d'éclaireur) et bouton « + Ajouter au build ».
- [x] Recherche « Dualité » : icône de type d'arme **fusil à pompe** (et non fusil automatique), anti-champion Implacable.
- [x] (npm.cmd run dev) Sous chaque résultat, une ligne grise `[dev] objet … ; type … ; rareté … ; catégories …` : si un résultat est encore faux, **recopie la ligne du résultat fautif**.
- [x] (npm.cmd run dev) Relancer « Lancer le contrôle » (bloc « 🔍 Diagnostic (dev) : anti-champion des armes exotiques ») : le rapport a une nouvelle section « Autres définitions de
      même nom ». **Envoie-moi** `controle-anti-champion-exotiques.md`.

Résultat : trois cas sur quatre cochés ; le rapport des exotiques du 06/10/2026 (`controle-anti-champion-exotiques_2026-10-06.md`) liste 66 « autres définitions de même nom » pour 39 armes de la liste, dont 35 objets FACTICES (type 20). Le premier test (« Tueur de souhaits ») est resté dans la liste : une capture de l'utilisateur montre qu'un « Colis » factice s'affiche encore avec une mauvaise image.

---

## 🆕 Doctrine : boutons de choix de l'élément, sur une seule ligne (05/10/2026) — tests validés

- [x] L'espace entre l'icône de l'élément et son nom est réduit mais le texte reste lisible, y compris « Prismatique » (rien n'est coupé).
- [x] La coche ✓ est **dans le coin supérieur droit** du bouton sélectionné, et n'apparaît que là. Cliquer sur un autre élément la déplace.
- [x] Rétrécir la fenêtre : si la place manque vraiment, les boutons passent en deux rangées de 3, toujours de même taille (jamais 5 + 1).

Résultat : le test principal (« les six boutons sur UNE seule ligne ») n'est PAS validé : sur l'écran de l'utilisateur ils restent sur deux lignes ; il est resté dans la liste, avec les trois niveaux de compacité. Les trois autres tests (espace icône-nom réduit et lisible, coche dans le coin, repli en deux rangées de 3) sont validés.

---

## 🆕 Icône de type d'arme : tes deux Lances de Polaris (02/10/2026)

- [x] **Tes DEUX Lances de Polaris** (la seconde n'avait aucune icône et le numéro de catégorie 3109687656) : les deux affichent maintenant
      l'icône de fusil d'éclaireur. Si l'une n'en a toujours pas, **recopie-moi le texte du badge gris EN ENTIER** (il indique désormais le
      hash, le type, le sous-type et le seau de l'objet).

---

## 🆕 Renommage officiel : Forge Armory (05/10/2026)

- [x] (logiciel installé) ⚠️ **Tes données sont toujours là.** Après avoir installé par-dessus l'ancienne version
      (avec ton « ⬇ Exporter tout » de sécurité fait avant) : tes **builds enregistrés**, tes **réglages de
      pondération** et ton **cache du Manifest** sont toujours présents (le Manifest ne se re-télécharge pas : environ
      100 Mo). **Si ce n'est pas le cas : ne supprime et ne désinstalle rien, ne réinstalle pas, et dis-le-moi.** Tes
      données sont alors dans l'ancien dossier. Pour m'aider : ouvre l'Explorateur, tape `%APPDATA%` dans la barre
      d'adresse, et dis-moi quels dossiers parmi `d2-build-analyzer`, `D2 Build Analyzer` et `Forge Armory` existent.
- [x] (logiciel installé) Enregistre un nouveau build, **ferme complètement le logiciel, relance-le** : le build est
      toujours là, ainsi que les anciens (le dossier de données est stable d'un lancement à l'autre).
- [x] (logiciel installé) Windows, Paramètres → Applications : **une seule** entrée, « Forge Armory » (plus de « D2 Build
      Analyzer »). Raccourci du bureau et menu Démarrer : « Forge Armory », avec la nouvelle icône ; l'ancien raccourci a
      disparu. Si tu avais épinglé l'ancien dans la barre des tâches, l'épingle ne marche plus : la détacher et épingler
      le nouveau.
- [x] Exports (image, PDF) : « FORGE ARMORY » sous « FICHE DE BUILD » en haut à droite ; pied de page « FORGE ARMORY ·
      DESTINY 2 BUILD ANALYZER · EXPORT INFOGRAPHIQUE ». Copie en texte : dernière ligne « Fiche générée par Forge
      Armory (Destiny 2 Build Analyzer) ».

Résultat : **les données de l'utilisateur sont conservées après le renommage et l'installation par-dessus l'ancienne version** (builds, pondérations, cache du Manifest), ainsi que tous les tests du logiciel installé (nouveau build après relance, entrées Windows, exports).

---

## 🆕 Export PDF : une seule page (02/10/2026)

- [x] (logiciel installé) Export PDF d'une fiche : **une seule page**, avec tout le contenu (jusqu'à
      « EXPORT INFOGRAPHIQUE » en bas), les icônes et le filigrane, sans bande claire ni coupure.
- [x] Même chose avec une fiche très remplie (beaucoup de perks et de mods) et avec une fiche courte.
- [x] (logiciel installé) Exports JPEG et PNG : rendu **strictement identique à avant**.

Résultat : le PDF d'une fiche tient sur UNE page dans le logiciel installé (fiche courte, fiche très remplie), et les exports JPEG et PNG sont strictement identiques à avant.

---

## 🆕 Anti-champion des exotiques : ta liste complétée (02/10/2026)

- [x] **Récit d'un homme mort**, **Trop long à expliquer**, **Tueur de Souhaits** et **Obligation
      collective** : icône Bloqueur (Inventaire, Mon Build, fenêtre « Voir », exports).
- [x] **Le Lapin de Jade** et **Dualité** : Implacable ; **Symétrie** : Surchargé. Si l'une n'affiche aucune
      icône : donne-moi son nom exact tel qu'il apparaît dans le jeu.
- [x] **Ergo Sum** (les trois variantes) : aucune icône d'anti-champion (cas particulier voulu : son
      anti-champion peut varier).

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.3.1** coché, renvoyé le 06/10/2026 (**6 cases cochées et archivées sur 14**). Retirés de la liste le 06/10/2026, recopiés mot pour mot du texte de la liste TELLE
QU'ELLE ÉTAIT au moment des tests, cases cochées. Une section est entièrement validée (Installation de la 0.3.1) ; deux le sont en partie (Recherche : 2 tests sur 4 ; Doctrine : 2 sur 3). Les autres tests (icônes des perks, panneau de départage, deux tests
« au fil de l'eau ») n'ont pas été cochés et restent dans la liste.

---

## 🆕 Installation de la version 0.3.1 (06/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**. Si une erreur apparaît : recopie-la en entier.
- [x] `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.1.exe` (dossier `installateur`) ; installé par-dessus, le pied de page de l'appli indique « Forge Armory v0.3.1 », et **tes builds sont toujours là**.

Résultat : `npm.cmd run build` et `npm.cmd run electron:build` ont réussi pour la 0.3.1, installée par-dessus la précédente.

---

## 🆕 Recherche : les objets factices sont masqués (06/10/2026) — tests validés

- [x] Recherche « Le Lapin de Jade », « Dualité » et « Lance de Polaris » : à chaque fois **une seule ligne**, l'arme réelle, avec son type d'arme, son anti-champion (Lapin de Jade et Dualité : Implacable) et le bouton « + Ajouter au build ».
- [x] Ta **seconde Lance de Polaris** (copie factice que tu possèdes) garde son icône de type d'arme dans l'Inventaire, et affiche maintenant aussi son anti-champion comme la première.

Résultat : deux tests sur quatre validés (Le Lapin de Jade / Dualité / Lance de Polaris : une seule ligne, l'arme réelle ; la seconde Lance de Polaris garde son icône de type et affiche son anti-champion). Restent dans la liste : « Tueur de souhaits » (la vraie arme n'apparaît pas en Recherche, ni en `run dev` ni en installé) et le menu « Objets factices » (la catégorie apparaît dans l'appli installée, pas en `run dev`).

---

## 🆕 Doctrine : la ligne des éléments sur UNE seule ligne, en trois niveaux de compacité (06/10/2026) — tests validés

- [x] Dans la Doctrine, les six boutons sont sur **UNE seule ligne**, tous de la même taille. **Dis-moi** si le texte te paraît plus petit que d'habitude (niveau 2 ou 3).
- [x] Rétrécir puis agrandir la fenêtre : le niveau suit, le texte reste lisible et **rien n'est coupé** (« Prismatique » en entier).

Résultat : **dans l'appli installée, les six boutons tiennent sur UNE ligne** (test principal validé) et le redimensionnement se comporte bien. En `npm.cmd run dev` (que l'utilisateur confirme être bien en 0.3.1) ils restaient sur deux lignes, et ni la ligne `[dev]`, ni la catégorie « Objets factices », ni le panneau de départage n'apparaissaient : **cause non établie** (ma première explication, « ancienne version », était fausse). La ligne `[dev]` n'a donc pas pu être relevée : test resté dans la liste.

---

## Perks d'artefact : les 6 icônes « par nom proche » (retour de l'utilisateur, test non coché)

« Combo tempêtes de lames », « Tactique de meute », « Surealimentation élémentaire », « Appel tempête », « Tirs soutenu », « Rayon de souffle » : l'utilisateur a constaté en jeu qu'elles **n'ont pas les mêmes icônes que dans l'appli**. Icônes retirées des données (128 perks sur 147 ont leur icône) ; ces perks passent, avec les 13 ambigus, dans le panneau de départage en jeu.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.3.3** coché, renvoyé le 06/10/2026 (**19 cases cochées et archivées sur 23**). Retirés de la liste le 06/10/2026, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT au moment des tests, cases cochées. Six sections sont entièrement
validées (Installation, Auteur du build, Logo en arrière-plan, Outils de diagnostic dans l'appli installée, Doctrine en `run dev`, Icônes des perks) ; une l'est en partie (Recherche : 1 test sur 3). Les deux tests « au fil de l'eau » n'ont pas été cochés et restent ouverts.

---

## 🆕 Installation de la version 0.3.3 (06/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.3.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.3 » et **tes builds sont toujours là**. Au premier chargement du Manifest, l'appli **reconstruit son index de recherche** (quelques secondes de plus, une seule fois).
- [x] (npm.cmd run dev) Le pied de page indique « Forge Armory v0.3.3 », et **en `run dev` on voit bien** : la catégorie « Objets factices » dans le menu des catégories de la Recherche ; la ligne grise `[dev]` sous les résultats d'armes et sous la ligne d'éléments de la Doctrine ; et, après « Lancer la recherche des icônes », le panneau « Départager ». Constat du 06/10 : ces éléments manquaient dans ton `run dev` en 0.3.1 alors que l'appli installée avait la catégorie ; **la cause n'est pas établie** (mon explication « ancienne version » était fausse). Si l'un d'eux manque encore, dis-moi lequel, puis essaie : arrêter le serveur (Ctrl+C), supprimer le dossier `node_modules\.vite`, relancer `npm.cmd run dev`, et faire Ctrl+F5 dans le navigateur.

Résultat : build et installateur de la 0.3.3 réussis. **En `npm.cmd run dev` (0.3.3), tout apparaît** : la catégorie « Objets factices », la ligne `[dev]` et le panneau « Départager ». L'écart constaté en 0.3.1 (ces éléments absents du `run dev` alors que l'appli installée avait la catégorie) **ne s'est pas reproduit ; sa cause reste inconnue**.

---

## 🆕 Auteur du build : ton pseudo est enregistré avec chaque build (06/10/2026)

- [x] (connecté à Bungie) **Enregistre un nouveau build** : sa carte, dans « Loadouts », affiche en petit sous son nom « par » suivi de **ton pseudo, le même que dans le bloc Connexion**.
- [x] Tes **anciens builds** n'affichent aucun auteur et sont strictement inchangés (même nom, mêmes pièces, même doctrine, même icône). « Charger » les charge toujours normalement.
- [x] « 👁 Voir » sur le nouveau build : la ligne grise d'en-tête indique « par » suivi de ton pseudo, entre le contexte et la date. « Modifier... » (renommer, changer l'icône) **conserve** l'auteur.
- [x] Exports d'une fiche (depuis « ⬇ Exporter... » et depuis le bloc « Partage du build » pour le build en cours) : la copie texte a une ligne « Auteur : … » ; l'image et le PDF (logiciel installé) portent « par … » à la fin du sous-titre, **dans la casse de ton pseudo** (pas en majuscules) ; le PDF reste sur **une seule page**. Une fiche d'un ancien build s'exporte exactement comme avant.
- [x] « Export JSON » de ce build, puis « ⬆ Importer » du fichier : la copie importée garde ton pseudo comme auteur. **Déconnecté**, un nouveau build enregistré n'a pas d'auteur (aucun « par »).

Résultat : les cinq tests de l'auteur sont validés (carte, anciens builds inchangés, « Voir » et renommage, exports, export JSON puis import).

---

## 🆕 Logo de l'application en arrière-plan (06/10/2026)

- [x] Le logo apparaît discrètement au **centre** de la fenêtre, derrière l'appli, visible entre les cartes et à travers elles. **Dis-moi s'il est trop ou pas assez visible** (je règle l'opacité, actuellement 10 %).
- [x] Il reste **fixe** : en faisant défiler la page, il ne bouge pas par rapport à la fenêtre ; en redimensionnant la fenêtre, il reste centré et s'adapte à sa taille.
- [x] Il ne gêne rien : le texte reste lisible, tous les boutons et menus restent cliquables, et il n'ajoute aucune barre de défilement.
- [x] Les tiroirs (Loadouts, Triomphes), les menus déroulants et les fenêtres (« Voir », choix du personnage…) restent **opaques** : le logo n'apparaît pas à travers.

---

## 🆕 Outils de diagnostic aussi dans l'appli installée (06/10/2026)

- [x] (logiciel installé) En bas de page : « 🔧 Outils de diagnostic : désactivés (cliquer pour activer) ». Un clic le passe en « activés » (en ambre) ; **ferme complètement le logiciel et relance-le** : le réglage est conservé.
- [x] Outils **activés**, Manifest chargé : sous chaque résultat de Recherche d'une arme apparaît la ligne grise `[dev] objet … ; type … ; rareté … ; catégories …` ; sous la ligne des éléments de la Doctrine, `[dev] rangée de 6 boutons : place disponible … px …` ; et les blocs « 🖼️ Diagnostic (dev) : icônes » et « 🔍 Diagnostic (dev) : anti-champion » sont affichés.
- [x] Outils **désactivés** : toutes ces lignes et ces blocs disparaissent.

---

## 🆕 Recherche : « Tueur de souhaits » et résultats masqués (06/10/2026) — test validé

- [x] Chercher « coeur de flamme » (sans ligature, comme on le tape) retrouve bien l'objet « Cœur de flamme ».

Résultat : un seul test sur trois validé (« coeur de flamme » retrouve « Cœur de flamme »). Les deux autres (« Tueur de souhaits » ; menu « Objets factices ») n'ont pas été cochés. **Capture de l'utilisateur (0.3.3, conservée dans `knowledge-base/sources-externes/`)** : la Recherche « Tueur de souhaits » affiche, parmi les objets visibles, le « Catalyseur de Tueur de souhaits » (objet 3457865915) et **la vraie arme (objet 814876684 : type 3, sous-type 31, seau cinétique, texte de type « Arc de combat », rareté exotique) avec son icône d'arc, son anti-champion, « Source : Un défi ou une quête exotique » et « + Ajouter au build »**. Neuf résultats masqués sont listés : une quête (2411744491), un pack (2897103720), deux objets factices (757817572, 2064394295), deux triomphes (3176275318, 3918836030) et trois ornements (2752106987, 3356471746, 4289552726). **L'utilisateur écrit pourtant que l'arme n'apparaît toujours pas** (elle est bien affichée dans son inventaire) : contradiction avec la capture, non résolue, question posée.

---

## 🆕 Doctrine : la ligne des éléments en `npm.cmd run dev` (06/10/2026)

- [x] (npm.cmd run dev, version 0.3.3) Les six boutons sont sur **une seule ligne**. Sinon, **recopie la ligne grise** `[dev] rangée de 6 boutons : place disponible … px · bouton … px · … par rangée · niveau de compacité …/3` : elle dit combien de place l'appli voit réellement.

Résultat : en `npm.cmd run dev` (0.3.3), les six boutons tiennent aussi sur UNE ligne (comme dans l'appli installée).

---

## 🆕 Icônes des perks d'artefact : 128 sur 147, et départage en jeu (06/10/2026)

- [x] Les 6 perks « Combo tempêtes de lames », « Tactique de meute », « Surealimentation élémentaire », « Appel tempête », « Tirs soutenu » et « Rayon de souffle » n'affichent **plus aucune icône** (ni dans la grille de l'artefact, ni dans les emplacements). Les autres perks gardent la leur.
- [x] (outils de diagnostic activés, Manifest chargé) « Lancer la recherche des icônes » : sous le bilan apparaît le panneau **« 🔎 Départager les 19 icônes à vérifier en jeu »** : 19 cartes (13 ambiguës ; 6 « nom différent dans le Manifest », avec le nom du Manifest sous chaque icône), chacune avec ses icônes candidates A, B… (images de Bungie, bien affichées).
- [x] **Compare avec le jeu** : pour chaque perk, clique l'icône qui correspond, **« Aucune ne correspond »** si aucune n'est la bonne, ou « Je ne sais pas » ; le compteur « N / 19 tranchés » suit. Puis « ⬇ Télécharger mes choix » et **envoie-moi** `choix-icones-ambigues.json`. Les 13 ambigus : « Transport de horde » (Outillage de Curiosité, Tablette de la Ruine, Encensoir à feuilles de Reine), « Explosion entrelacée » et « Broyeur de bouclier » (Outillage de Curiosité, Journal du Chasseur), « Orbes effilochants » (Tablette de la Ruine, Encensoir), « Siphon élémentaire » (Tablette de la Ruine, Journal du Chasseur), « Choc et effroi » (Journal du Chasseur, Régulateur répulsif ANP).

Résultat : le panneau « Départager les 19 icônes » s'affiche et fonctionne ; l'utilisateur a **tranché les 19 perks sur 19** (aucun « Aucune ne correspond », aucun « Je ne sais pas ») et renvoyé `choix-icones-ambigues.json` (conservé dans `knowledge-base/sources-externes/choix-icones-ambigues_2026-10-06.json`, 06/10/2026 à 22 h 40). Les 19 icônes sont figées dans les données en 0.3.4. ⚠️ Pour les 6 perks à nom différent, les icônes choisies sont **exactement celles de la 0.3.1** que l'utilisateur avait jugées fausses le matin : discordance non expliquée, à recomparer.

---

## Test non coché, clos par la réponse de l'utilisateur (06/10/2026, soir) — Recherche « Tueur de souhaits »

Test de la liste 0.3.4, retiré de la liste 0.3.5 : « Recherche « Tueur de souhaits » : **précise-moi ce qui ne va pas** pour toi [...] ». L'utilisateur a répondu « Exactement pour le Tueur de Souhaits 😂 Oups. » : il avait mal lu sa capture, la vraie arme (objet 814876684) apparaissait bien. Rien à corriger.

---

Tests VALIDÉS par l'utilisateur : liste « A-TESTER » de la version **0.3.6** (**24 tests sur 24**), validée le 07/10/2026 d'après son message (« Tout les tests de la 0.3.6 sont validés »), sans PDF renvoyé cette fois. Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Sept sections entièrement validées**, dont les deux tests « au fil de l'eau » (échange d'un build avec un ami ; test général Filobscur), qui étaient ouverts depuis longtemps.

---

## 🆕 Installation de la version 0.3.6 (06/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.6.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.6 » et **tes builds sont toujours là**.

---

## 🆕 Nouveaux boutons du sélecteur de vues (06/10/2026)

- [x] Sous le bloc Connexion : trois boutons « Build Analyzer », « Load-outs » et « Bibliothèque », **dans cet ordre, tous de la même taille**. Au lancement, « Build Analyzer » est sélectionné (lueur).
- [x] Clique sur chacun : le bouton choisi prend la lueur cyan, les autres reviennent au repos, et **leur taille et leur position ne bougent pas** au clic.
- [x] Clavier : Tab met un **contour cyan** autour du bouton qui a le focus ; Entrée ou Espace change de vue. Au survol d'un bouton non sélectionné, il s'éclaircit légèrement (c'est un ajout de ma part, pas dans ton pack : dis-moi si tu préfères sans).
- [x] (logiciel installé) **Aucune image cassée** : les six dessins s'affichent aussi dans le logiciel installé (un chemin d'image mal écrit y a déjà cassé les badges de contexte). Fenêtre rétrécie : les boutons passent à la ligne sans déborder.

Résultat : validés, y compris le survol qui éclaircit un bouton non sélectionné (ajout de ma part) et le contour de focus au clavier.

---

## 🆕 Boutons du contexte du build — tes visuels (07/10/2026)

- [x] Sous le nom du build **et** dans le bloc « 0. Contexte du build » : les quatre boutons, dans l'ordre Neutre, PvE Roaming, PvE DPS, PvP, de même taille et **sur une seule ligne** (aucun bouton qui passe seul en dessous), à la même hauteur que ceux du sélecteur.
- [x] Au clic, le bouton choisi prend sa lueur ; **sa taille et sa position ne bougent pas**. Clavier : Tab met un contour cyan, Entrée ou Espace sélectionne.
- [x] Changer le contexte par l'un ou l'autre endroit change le score et la pondération comme avant, et **les deux endroits restent d'accord**.
- [x] (logiciel installé) Les huit dessins s'affichent, **aucune image cassée**. Fenêtre rétrécie : les boutons passent à la ligne sans déborder.
- [x] **Dis-moi si la disposition te convient** (libellé au-dessus des quatre boutons), ou si tu préfères autre chose.

Résultat : validés, **y compris la disposition choisie** (libellé « Contexte du build : » sur sa propre ligne, au-dessus des quatre boutons). Retour de l'utilisateur à la suite de ce test : réduire les boutons de contexte (−50 % dans le bloc « 0. Contexte du build », −20 % au-dessus de « Mon Build »), traité en 0.3.7.

---

## 🆕 Onglet « Load-outs » — livraison 1 sur 3 (06/10/2026)

- [x] « Load-outs » : le panneau s'affiche sur toute la largeur, cartes en grille (plusieurs colonnes si la fenêtre est large) ; le tiroir vertical de droite est **caché** pendant cet onglet.
- [x] Chaque carte garde ses boutons : Charger, Voir, Équiper en jeu (connecté, selon la classe), Modifier..., Supprimer, Exporter... ; en bas : « ⬇ Exporter tout » et « ⬆ Importer ». Les cartes affichent leur auteur (« par … »).
- [x] « Charger » charge le build **et te ramène au Build Analyzer** pour le voir. **Dis-moi si ce retour automatique te convient** ou si tu préfères rester dans l'onglet.
- [x] (logiciel installé, connecté) « Équiper en jeu » depuis l'onglet fonctionne comme depuis le tiroir (avec le choix du personnage quand il est demandé).
- [x] « + Enregistrer » depuis l'onglet : la carte apparaît avec ton pseudo. Reviens au Build Analyzer : le tiroir indique **le même nombre** « Loadouts (N) » sans rechargement, et inversement (un build enregistré dans le tiroir est dans l'onglet).
- [x] Voir, Modifier..., Exporter..., Supprimer et Importer fonctionnent depuis l'onglet. Le tiroir se comporte **exactement comme avant** (ouvrir, fermer, enregistrer, charger).
- [x] Fenêtre rétrécie : les cartes passent sur une seule colonne, rien ne déborde.

Résultat : validés, **y compris le retour automatique au Build Analyzer après « Charger »** (« top »). Demande ajoutée : que le bloc « Mon Build » soit amené à l'écran automatiquement à ce moment, « ça évitera de croire à un bug » : traité en 0.3.7. L'utilisateur demande de passer à la phase 2 (recherche et filtres).

---

## 🆕 Icônes des perks d'artefact : 147 sur 147 (reprise de la 0.3.4)

- [x] Bloc Artefact : parcours les **7 artefacts** (leurs 3 paliers) : **aucun perk n'est sans icône**, ni dans la grille, ni dans les emplacements équipés, ni dans le récapitulatif en dessous.
- [x] Les 13 perks ambigus portent l'icône que **tu** as choisie, y compris « Broyeur de bouclier », dont l'icône est **différente** entre l'Outillage de Curiosité et le Journal du Chasseur (c'était ton choix). Un même perk (par exemple « Transport de horde ») a la même icône dans les artefacts qui le portent.
- [x] ⚠️ **À recomparer avec le jeu** : « Combo tempêtes de lames » (Disque de données cryptées), « Tactique de meute » et « Surealimentation élémentaire » (Outillage de Curiosité), « Appel tempête » (Sacoche d'apothicaire), « Tirs soutenu » (Journal du Chasseur) et « Rayon de souffle » (Encensoir à feuilles de Reine). Les icônes que tu as choisies ce soir sont **exactement celles de la 0.3.1, que tu avais jugées fausses le matin** : je ne l'explique pas. Regarde-les à nouveau, dans l'appli, à côté du jeu. Si l'une est encore fausse, dis-moi laquelle et ce que tu vois en jeu.
- [x] (outils de diagnostic activés, Manifest chargé) « Lancer la recherche des icônes » : **plus aucun panneau de départage**, mais la mention « ✅ 19 perks déjà tranchés (leur icône enregistrée figure toujours parmi les candidates) : non reproposés » ; le bilan indique 13 perks ambigus et 6 introuvables, ce qui est normal (c'est l'état du Manifest, déjà tranché).

---

## 🆕 Recherche : menu des catégories (reprise de la 0.3.4)

- [x] Le menu des catégories propose « **Objets factices : colis, copies d'armes (masqué par défaut)** » : le choisir, puis chercher « Le Lapin de Jade » : les copies factices apparaissent (c'est le seul endroit où on les voit).

---

## 🔭 Encore ouverts — au fil de l'eau

- [x] **Échange d'un build avec un ami** (export d'un build seul, v0.2.2) :
      chez lui, les pièces qu'il possède doivent être retrouvées par la réparation
      automatique.
- [x] **Filobscur, test général** (correctif du bornage de phrase, 26/08) :
      sur n'importe quel build Filobscur avec un Enchevêtrement ET une
      capacité qui le détruit pour un effet, vérifier que rien d'inhabituel
      n'apparaît dans les détails du Pilier 2. Ce correctif touchait beaucoup
      de textes à la fois.

---

Tests VALIDÉS par l'utilisateur : liste « A-TESTER » de la version **0.3.10** (**22 tests sur 22**, qui reprenait les tests des versions 0.3.7 à 0.3.9 non encore faits), validée le 07/10/2026 d'après son message (« à part ça, tous les tests sont bons »), sans PDF renvoyé. Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Cinq sections entièrement validées.**

---

## 🆕 Installation de la version 0.3.10 (07/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.10.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.10 » et **tes builds sont toujours là**.

---

## 🆕 Sauvegarde et partage de Build : l'enregistrement quitte le panneau des Loadouts (07/10/2026)

- [x] Dans le Build Analyzer, le bloc s'appelle « Sauvegarde et partage de Build » (l'ancien titre a disparu) ; il commence par le bouton « 💾 Enregistrer le build… », puis la partie « Partage, sans enregistrer » (nom, copie texte, fichier, JPEG, PNG, PDF) qui marche **comme avant**. Le bloc se replie toujours en cliquant sur son titre.
- [x] Le bouton ouvre la fenêtre « Enregistrer le build » : nom, description, icônes. Tant que le nom est vide, « 💾 Enregistrer » est grisé. Si tu as tapé un nom dans le champ « Nom du build » du bloc, il est **proposé** dans la fenêtre. « Annuler » et Échap ne changent rien ; un clic à côté **ne ferme pas** la fenêtre (ton texte n'est pas perdu) ; Entrée dans le champ du nom enregistre.
- [x] « 💾 Enregistrer » : la fenêtre se ferme et une confirmation « ✅ « … » est enregistré dans tes Load-outs » apparaît, avec un bouton « Ouvrir l'onglet Load-outs ». Le build est dans l'onglet **et** dans le tiroir (dont le compteur se met à jour tout de suite), avec son nom, sa description, son icône et ton pseudo comme auteur (déconnecté : pas d'auteur).
- [x] Doctrine incomplète (par exemple sans super) : la même confirmation qu'avant apparaît (« ⚠️ Doctrine incomplète : … ») ; « Annuler » laisse la fenêtre ouverte avec ton texte, « OK » enregistre.
- [x] Le **tiroir** (volet de droite) n'a plus de zone d'enregistrement (ni champ de nom, ni « + Enregistrer », ni icônes, ni description) ; quand sa liste est vide, le message t'explique d'utiliser « 💾 Enregistrer le build… ».
- [x] L'**onglet Load-outs** a de nouveau sa **zone d'enregistrement** en haut, au-dessus de la recherche : champ « Nom du build actuel », « + Enregistrer », icônes, description. « + Enregistrer » enregistre le build affiché dans « Mon Build », avec ton pseudo, et un message le confirme. Les champs se vident après un succès. **Le nom est obligatoire, comme dans la fenêtre du Build Analyzer** : tant qu'il est vide, « + Enregistrer » est grisé (infobulle « Donnez d'abord un nom au build ») ; si tu tapes puis effaces le nom, le champ passe en rouge avec « Le nom ne peut pas être vide. », **exactement le même message que dans la fenêtre**. Un build « Sans nom » ne peut plus être créé.
- [x] Zone de l'onglet, cas particuliers : avec une Doctrine incomplète, la même confirmation « ⚠️ Doctrine incomplète : … » apparaît (« Annuler » garde ton texte, « OK » enregistre). Si l'enregistrement échoue (stockage plein), un message rouge s'affiche et **ton texte est conservé** (c'est la seule différence voulue avec l'ancienne zone, qui le perdait).
- [x] Tes anciens builds sont inchangés et « Charger », « Voir », « Équiper en jeu », « Modifier... », « Exporter... » marchent comme avant.
- [x] **Dis-moi** si l'emplacement du bloc te convient (sous l'Artefact) ou si tu veux que je le **remonte juste sous « Mon Build »**, ou que j'ajoute aussi un bouton directement sous « Mon Build » ; et si tu veux **aussi** la zone d'enregistrement dans le **tiroir** (je l'y ai laissée retirée : tu avais écrit « l'onglet »).

Retour de l'utilisateur : **tous les tests sont bons**, avec **deux corrections de sa part** : (1) la zone d'enregistrement doit être retirée du **nouvel onglet Load-outs** et **conservée dans le tiroir latéral repliable**, qu'il appelait « l'onglet » (« j'ai mélangé tiroir et onglet ») : les trois tests de la zone « dans l'onglet » ci-dessus décrivent donc un état **remplacé** en 0.3.11 ; (2) après la confirmation d'enregistrement, remplacer le bouton texte « Ouvrir l'onglet Load-outs » par le bouton stylisé du sélecteur, à 28 px de haut. Aucune objection à l'emplacement du bloc (sous l'Artefact) ni à l'alignement de la règle du nom (obligatoire partout) : conservés.

---

## 🆕 Boutons de contexte plus petits (07/10/2026)

- [x] Au-dessus de « Mon Build » : les quatre boutons sont **20 % plus petits** (environ 45 px de haut au lieu de 56) et restent lisibles. Le libellé « Contexte du build : » est toujours sur sa propre ligne, mais **avec des boutons plus petits il tiendrait de nouveau devant eux** : dis-moi si tu préfères le remettre devant.
- [x] Dans le bloc « 0. Contexte du build » : les quatre boutons sont **50 % plus petits** (environ 28 px de haut). **Dis-moi si le titre reste assez lisible** : sinon je peux monter. Un aperçu à **48 px** de haut (`apercu-bloc-contexte-48px.png`) t'a été fourni pour comparer : dis-moi si tu préfères cette taille.
- [x] Les boutons gardent leur comportement : la lueur indique le contexte choisi, leur taille ne bouge pas au clic, le clavier fonctionne, et changer le contexte par l'un ou l'autre endroit garde les deux d'accord. (logiciel installé) Aucune image cassée.

Aucune remarque sur la lisibilité du titre à 50 % (bloc « 0. Contexte du build », 28 px) : taille conservée. L'aperçu à 48 px n'a pas été retenu. Pas de demande de remettre le libellé « Contexte du build : » devant les boutons : disposition conservée.

---

## 🆕 Après « Charger », « Mon Build » est amené à l'écran (07/10/2026)

- [x] Onglet « Load-outs » → « Charger » sur un build : retour au Build Analyzer, la page **défile en douceur** et le bloc « Mon Build », avec le build chargé, arrive en haut de l'écran.
- [x] Même chose si tu charges deux fois de suite le même build (la page défile de nouveau). En revanche, **aucun défilement** quand tu reviens au Build Analyzer avec le bouton du sélecteur, ni quand tu charges un build depuis le tiroir (comportement d'avant).
- [x] **Dis-moi** si le défilement doux te convient (sinon je le rends instantané) et si tu veux que le bloc « Mon Build » **clignote brièvement** pour le repérer.

Aucune demande de défilement instantané ni de clignotement du bloc : défilement doux conservé.

---

## 🆕 Onglet « Load-outs » — livraison 2 sur 3 : recherche et filtres (07/10/2026)

- [x] Dans l'onglet « Load-outs », la barre apparaît au-dessus des cartes : un champ de recherche et trois listes « Toutes les classes », « Tous les éléments », « Tous les contextes ». Elle **n'existe pas** dans le tiroir. Le compteur indique « N loadouts ».
- [x] Tape quelques mots : « titan » ; ton pseudo avec le « # » ; le nom d'une arme ou d'une armure de l'un de tes builds ; un mot de description. Les cartes se filtrent **à chaque lettre** ; le compteur passe à « n sur N ». Essaie aussi sans accent, en majuscules, avec une apostrophe droite, et avec **deux mots** dans les deux ordres.
- [x] (Manifest chargé) Cherche le nom d'un **super**, d'un **aspect** ou d'un **fragment** présent dans l'un de tes builds : il doit être retrouvé. **Manifest non chargé** : la ligne grise « Manifest non chargé : la recherche ne couvre pas encore les noms de la Doctrine… » apparaît.
- [x] Les trois listes proposent les valeurs **présentes** dans tes builds avec leur nombre (par exemple « Chasseur (4) »), dans l'ordre du jeu, avec les libellés de l'appli. Elles se combinent entre elles et avec le texte. Supprime un build ou enregistres-en un : les nombres se mettent à jour.
- [x] « ✕ Réinitialiser » (visible dès qu'un critère est actif) remet tout à zéro. Quand rien ne correspond, le message « Aucun loadout ne correspond à ces critères (N au total) » apparaît, avec son propre bouton « Réinitialiser ».
- [x] Les boutons des cartes (Charger, Voir, Modifier..., Supprimer, Exporter...) marchent sur les cartes filtrées. **« ⬇ Exporter tout » exporte TOUS tes loadouts**, même quand une recherche est active : vérifie le nombre dans le fichier exporté.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.3.11** coché et renvoyé le 07/10/2026 (**8 cases cochées sur 8**, vérifiées par la relecture automatique du PDF). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Trois sections entièrement validées.**

---

## 🆕 Installation de la version 0.3.11 (07/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.11.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.11 » et **tes builds sont toujours là**.

---

## 🆕 La zone d'enregistrement est dans le TIROIR, plus dans l'onglet Load-outs (07/10/2026)

- [x] Le **tiroir** (volet de droite, bouton vertical « Loadouts (N) ») a retrouvé sa zone d'enregistrement en haut : champ « Nom du build actuel », « + Enregistrer », icônes, description, puis la liste de tes builds. Le nom y est **obligatoire** (« + Enregistrer » grisé tant qu'il est vide ; « Le nom ne peut pas être vide. » si tu tapes puis effaces), comme dans la fenêtre du Build Analyzer.
- [x] « + Enregistrer » dans le tiroir enregistre le build affiché dans « Mon Build », avec son nom, sa description, son icône et ton pseudo ; les champs se vident ; un message le confirme. Avec une Doctrine incomplète, la même confirmation qu'avant apparaît. Si l'enregistrement échoue, ton texte est conservé.
- [x] Le nouvel **onglet Load-outs** n'a **plus de zone d'enregistrement** : il commence par la barre de recherche et les filtres, puis tes cartes. Un build enregistré par le tiroir y apparaît aussitôt, avec son pseudo.

Résultat : validés. La zone d'enregistrement est bien dans le tiroir et absente de l'onglet Load-outs, comme voulu.

---

## 🆕 Confirmation d'enregistrement : le bouton stylisé à 28 px (07/10/2026)

- [x] Enregistre un build par « 💾 Enregistrer le build… » : la confirmation « ✅ « … » est enregistré dans tes Load-outs. » est suivie du bouton stylisé LOAD-OUTS (le même dessin que dans le sélecteur du haut), à côté du message, sans bouton texte.
- [x] Un clic sur ce bouton ouvre l'onglet Load-outs. Au survol il s'éclaircit légèrement ; au clavier (Tab) il prend un contour cyan.
- [x] **Dis-moi si 28 px te convient** : le titre est-il lisible, le bouton est-il bien proportionné à côté du reste ?
- [x] (logiciel installé) L'image du bouton s'affiche (pas d'image cassée).

Résultat : validés, y compris « 28 px te convient » (coché) : **28 px conservé** pour le bouton stylisé de la confirmation, et l'image s'affiche dans le logiciel installé.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.3.16** coché et renvoyé le 07/10/2026 (**21 cases cochées sur 21**, vérifiées par la relecture automatique du PDF ; il reprenait les tests des versions 0.3.12 à 0.3.16). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Trois sections entièrement validées.**

---

## 🆕 Installation de la version 0.3.16 (07/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.16.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.16 » et **tes builds sont toujours là**, dans le même ordre qu'avant.

Résultat : validé (installation et construction sans erreur, builds conservés dans le même ordre).

---

## 🆕 Tes nouveaux visuels : titres à deux états (+ / −) et blocs repliables (07/10/2026)

- [x] Chacun des **sept blocs repliables** affiche son titre illustré avec le **losange « − »** à droite de la plaque quand il est déplié, et le **losange « + »** quand tu le replies (clic sur le titre, **image comprise**). **Rien ne bouge** : le titre garde exactement la même place et la même taille. Les quinze titres ont la même hauteur (40 px).
- [x] Devant ces titres, il n'y a **plus le petit triangle ▶ / ▼** d'avant : le losange le remplace. Le sous-bloc « ▶ Doctrine — aucune sous-classe choisie », dans Mon Build, **garde son triangle** (il n'a pas de titre illustré).
- [x] **Connexion à Bungie** et **Recherche dans le Manifest** sont **maintenant repliables**, parce que ton archive ne leur donne que la version à deux états (pas de version fixe). Replié, le contenu disparaît mais le **statut** (« ◯ non connecté », « ✅ FR + EN chargés »…) reste visible ; déplié, tout revient, sans rien perdre de ce que tu avais saisi. **Dis-moi si c'est bien ce que tu voulais.**
- [x] Au clavier (Tab jusqu'à un titre, puis Entrée ou Espace), les blocs se replient et se déplient aussi.
- [x] **Mon Inventaire** : le petit texte gris « personnages + coffre » est toujours à droite du titre, et le statut tout à droite. Dans les résultats : le **Score global** a son titre au-dessus du score, et chaque **carte** (1 à 5) a le sien, avec son score toujours à droite.
- [x] Les **mots changent** parce que l'image remplace l'ancien texte : « Artefact (Pilier 3) » devient « Artefact » ; « Personnage & Doctrine (Pilier 1) » devient « Doctrine et Élément » ; « Connexion Bungie.net » devient « Connexion à Bungie » (le bouton « Connexion Bungie.net » ne change pas). **Dis-moi** si tu veux garder une mention discrète « Pilier 1 » / « Pilier 3 » à côté de ces titres.
- [x] (logiciel installé) **Toutes les images s'affichent** (aucune image cassée) : les titres, les boutons du sélecteur et ceux du contexte. Les fichiers sont maintenant dans un seul dossier `assets` de l'appli.
- [x] **Deux écarts de casse avec ton catalogue** : il écrit « Sauvegarde et **P**artage du Build » (P majuscule) et « Contexte du **b**uild » (b minuscule) ; j'ai gardé ce que tu m'as écrit dans la conversation (« Sauvegarde et partage du **B**uild », « Build » avec un B partout). Cela ne concerne que le texte lu par les lecteurs d'écran, car les images sont en capitales. **Dis-moi** si tu préfères la graphie du catalogue.
- [x] **Taille** : tes 28 px (bouton « Load-outs » après un enregistrement, boutons du bloc « 0. Contexte du Build ») sont **sous le minimum conseillé de 40 px** de ta charte ; je les ai gardés parce que tu les as demandés et validés. **Dis-moi** si tu préfères autre chose (par exemple l'icône seule, que ton archive fournit pour les petites tailles). Et 40 px pour les titres te convient-il toujours ?
- [x] **Ce que ton archive fournit et que je n'ai pas encore utilisé** : 19 icônes (« barres latérales réduites, onglets »), 4 symboles de profil, l'emblème (identique à celui de l'appli) et la charte graphique. **Dis-moi où tu veux les icônes** (par exemple sur les tiroirs « Loadouts » et « Solo sans mourir » quand ils sont repliés), et si tu veux illustrer aussi les titres des vues Bibliothèque et Load-outs.

Résultat : **les 10 tests sont cochés**, avec une série de **retours de l'utilisateur** (07/10/2026, en renvoyant le PDF) qui **remplacent certains points validés** :
1. **Taille** : les titres des blocs doivent être agrandis, à la **même taille que les titres des onglets** « Build Analyzer », « Load-outs » et « Bibliothèque » (le 40 px est donc remplacé) ;
2. **soulignage** : sur « Doctrine et Élément » et « Mon Build », le cristal bleu semble présent sous le titre mais pas le soulignage : à vérifier et corriger ;
3. **la ligne « Contexte du Build » au-dessus de Mon Build est retirée** : les boutons de contexte passent DANS « Mon Build », en partie haute, sous le titre ;
4. **« Sous Mon Inventaire, renomme le titre en Classe et Doctrine »** (le bloc « Doctrine et Élément ») : le logo sera à adapter, à mettre en TODO ;
5. **Connexion à Bungie et Recherche dans le Manifest ne doivent PAS être repliables** (réponse négative à la question posée par le test « Connexion à Bungie et Recherche dans le Manifest sont maintenant repliables ») : version du titre sans le losange + / − ;
6. **logo de « 1. Élément et Doctrine »** : reprendre les proportions du logo de « Doctrine et Élément » et agrandir un peu les six billes bleues.
Les 28 px (bouton « Load-outs » après un enregistrement, boutons du bloc « 0. Contexte du Build ») et la casse des textes lus par les lecteurs d'écran n'ont suscité aucune objection : conservés.

---

## 🆕 Onglet « Load-outs » — livraison 3 sur 3 : ordre modifiable et « stocké en jeu » (07/10/2026)

- [x] Chaque carte de l'onglet a sa poignée ⠿, ses boutons ◀ ▶ et sa case « 🎮 Stocké en jeu ». Une **légende** en tête explique que la case est un mémo manuel. Le **tiroir**, lui, n'a ni poignée, ni boutons, ni case. Avant tout déplacement, l'ordre est celui d'avant (le plus récent d'abord).
- [x] ▶ fait avancer un build d'une place, ◀ le fait reculer. Sur la première carte ◀ est grisé, sur la dernière ▶ est grisé. Au **clavier** (Tab jusqu'à un ▶, puis Entrée plusieurs fois) le build continue d'avancer **sans que le focus se perde**.
- [x] **Glisse** la poignée ⠿ d'une carte et **dépose-la sur une autre carte** : elle prend sa place, les autres se décalent. Pendant le glissement, la carte déplacée est atténuée et la carte visée entourée de bleu.
- [x] L'ordre est **conservé** : change de vue et reviens, ferme complètement le logiciel et relance-le. Le **tiroir** affiche exactement le même ordre.
- [x] Pendant une **recherche** ou avec un **filtre** actif, les ◀ ▶ et la poignée sont grisés (infobulle : « Réinitialise la recherche et les filtres pour changer l'ordre »), parce que réordonner une partie de la liste serait ambigu. La case « stocké en jeu » reste utilisable.
- [x] La case « 🎮 Stocké en jeu » : tu la coches, tu la décoches, elle reste cochée après un relancement du logiciel. Déplacer ou renommer un build ne la perd pas.
- [x] Un build **enregistré après coup** arrive **en tête**, au-dessus de l'ordre que tu as composé.
- [x] « ⬇ Exporter tout » (sauvegarde) **garde** l'ordre et les cases ; le fichier d'**un seul** build (« Exporter... » sur une carte) ne les contient pas (le build d'un ami n'arrive pas « stocké dans ton jeu »). « ⬆ Importer » d'une sauvegarde : les builds importés se placent **après** les tiens, dans leur ordre d'origine.
- [x] (logiciel installé) Le **glisser-déposer** fonctionne aussi dans le logiciel installé (je ne peux pas le tester dans Electron : je l'ai testé dans un navigateur).
- [x] **Dis-moi** : (1) le sens des ◀ ▶ (◀ = vers le début de la liste) te convient-il ? (2) veux-tu aussi la case « stocké en jeu » dans le **tiroir** ? (3) un **filtre** « stocké en jeu / pas stocké » dans la barre de recherche t'aiderait-il ?

Résultat : **les 10 tests sont cochés**, y compris les trois questions finales (sens des ◀ ▶, case « stocké en jeu » dans le tiroir, filtre « stocké en jeu ») sans demande de changement : **l'onglet Load-outs est validé** (les trois livraisons de la TODO § 16 sont donc validées). Le glisser-déposer a été testé dans le logiciel installé.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.3.17** coché et renvoyé le 08/10/2026 (**10 cases cochées sur 10**, vérifiées par la relecture automatique du PDF). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Deux sections entièrement validées.**

---

## 🆕 Installation de la version 0.3.17 (07/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.3.17.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.3.17 » et **tes builds sont toujours là**.
- [x] **Version du jeu** (tout en haut à droite du titre) : la troisième ligne dit « Correctifs : aucun intégré · **dernier publié : 9.7.0.5 (7 octobre 2026)** ». Au survol, l'infobulle liste les correctifs publiés (9.7.0.1 à 9.7.0.4, puis « 9.7.0.5 (intégré) »), dit que 9.7.0.1 à 9.7.0.4 ne sont pas encore intégrés, et explique que la 9.7.0.5 est « déjà intégrée mais après un correctif manquant » (le niveau affiché ne change pas : les correctifs sont cumulatifs). Rien dans l'infobulle ne se contredit.

Résultat : validé (construction sans erreur, version du jeu 9.7.0.5 affichée, infobulle sans contradiction).

---

## 🆕 Tes retours sur les visuels (07/10/2026)

- [x] **Taille** : les titres des blocs ont maintenant la **même taille que les titres des onglets** « Build Analyzer », « Load-outs » et « Bibliothèque » (56 px de haut sur écran large). Compare-les au sélecteur : mêmes hauteurs, pour **tous** les titres (Connexion, Manifest, Mon Inventaire, Classe et Doctrine, Mon Build, Artefact, Sauvegarde, « 0. Contexte du Build », Score global et les cinq cartes de résultat). Rien ne déborde ni ne se chevauche.
- [x] **Soulignage** : sous **chaque** titre, le trait argenté de part et d'autre du cristal est bien visible, y compris sous « Doctrine et Élément » et « Mon Build » (les deux que tu avais signalés). Ce n'était pas un oubli du dessin : le trait était **plus fin qu'un pixel** (0,3 px) et il apparaissait ou non selon la position du bloc à l'écran ; je l'ai épaissi dans les 24 titres. **Dis-moi si l'épaisseur te convient** (de 8 à 20 unités). Même vérification fenêtre rétrécie.
- [x] **Contexte dans « Mon Build »** : la ligne « Contexte du Build » au-dessus de « Mon Build » a disparu ; les quatre boutons (Neutre, PvE Roaming, PvE DPS, PvP) sont **dans « Mon Build », tout en haut, sous le titre**. Cliquer sur l'un change le contexte (le bloc « 0. Contexte du Build » plus bas suit, et le score aussi). Si tu replies « Mon Build », les boutons se replient avec lui.
- [x] **« Classe et Doctrine »** : j'ai renommé le bloc situé **sous « Mon Inventaire »** (celui des cartes Chasseur / Titan / Arcaniste et des sous-classes). **Dis-moi si c'est bien celui que tu voulais renommer** (et pas « Mon Inventaire » lui-même). Son logo dessine encore « DOCTRINE ET ÉLÉMENT » : c'est normal, **le nouveau logo est à fournir** (dans la TODO).
- [x] **Connexion à Bungie** et **Recherche dans le Manifest** ne sont **plus repliables** : leur titre n'a plus le losange + / −, et un clic dessus ne replie rien. Les cinq autres blocs (Mon Inventaire, Classe et Doctrine, Mon Build, Artefact, Sauvegarde et partage du Build) se replient toujours, avec le losange « + » ou « − ».
- [x] **Logo de « 1. Élément et Doctrine »** (première carte de résultat) : l'hexagone et l'étoile ont les **mêmes proportions** que l'icône du bloc « Classe et Doctrine » ; les six billes bleues sont un peu plus grosses. **Dis-moi si leur taille te convient** (20 % de plus que celles du bloc), ou si tu veux que celles du bloc grossissent aussi, pour que les deux logos soient identiques.
- [x] (logiciel installé) **Toutes les images s'affichent** : titres (dont les deux nouveaux titres sans losange), boutons du sélecteur et du contexte ; aucune image cassée.
- [x] **Encore sans réponse**, des listes précédentes : **où utiliser les 19 icônes** de ton archive (par exemple les tiroirs « Loadouts » et « Solo sans mourir » repliés) ? Veux-tu des **titres illustrés** pour ces tiroirs et pour les vues Bibliothèque et Load-outs ? Et une mention discrète « Pilier 1 » / « Pilier 3 » à côté des titres des blocs ?

Résultat : **les 8 tests sont cochés**. Réponses de l'utilisateur en discutant (08/10/2026) : « Classe et Doctrine » = bien le bloc sous « Mon Inventaire » (confirmé) ; épaisseur du soulignage : à juger après avoir vu les titres agrandis ; billes du bloc, icônes : en attente ; **titre illustré : oui pour « Solo sans mourir »** seulement. **Puis, en renvoyant le PDF, de nouvelles demandes** : le bloc « Doctrine et Élément » devient « Classe et Doctrine » **en gardant le logo** (le logo à fournir est donc abandonné) ; dans le Scoring, le pilier 1 devient « Doctrine élémentaire », « 2. Artefact » devient « 3. Artefact » et « 3. Armes et Armures » devient « 2. Armes et Armures », **mêmes logos, seuls le chiffre et la position changent**, pour suivre l'ordre des blocs au-dessus du Scoring.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.4.0** coché et renvoyé le 12/10/2026 (**18 cases cochées sur 22**, vérifiées par la relecture automatique du PDF). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées ; les 4 cases non cochées (trois de l'export infographique, une des images du logiciel installé) restent dans la liste.

---

## 🆕 Installation de la version 0.4.0 (12/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.4.0.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.4.0 » et **tes builds sont toujours là**. Si `build` affiche des erreurs, copie-les-moi telles quelles : c'est lui qui contrôle le typage, que je n'ai pas pu vérifier de mon côté.

Résultat : validé. **Ce premier test valide aussi le typage strict** (`tsc -b`, lancé par `npm run build`), que je n'avais pas pu contrôler dans mon environnement.

---

## 🆕 Onglet Forge et quatre boutons sur une ligne

- [x] Au lancement, les **quatre boutons** sont sur **une seule ligne**, dans l'ordre Build Analyzer, Load-outs, **Forge**, Bibliothèque. Rétrécis la fenêtre jusqu'au minimum : ils restent sur la même ligne en rapetissant ensemble, et les titres des blocs (Connexion, Mon Inventaire…) gardent exactement la **même hauteur** que les boutons.
- [x] Un clic sur **Forge** : le bouton s'allume (lueur cyan, comme les autres) et la page « Forge — en construction » s'affiche, avec l'icône de la Forge et ce qui est prévu ; un clic sur un autre onglet la masque.

Résultat : validé (quatre boutons sur une ligne, page « Forge — en construction »).

---

## 🆕 Filtre d'élément de dégâts

- [x] Dans **« Recherche dans le Manifest »**, le menu « Tous les éléments » propose ces six éléments. Cherche un mot qui donne des armes (par exemple « fusil »), choisis « Cryo-électrique » : seules les armes cryo-électriques restent ; essaie aussi « Cinétique ».
- [x] Dans **Mon Inventaire** (inventaire chargé), le menu d'élément filtre les armes de tes personnages ; les armures disparaissent ; les icônes d'élément sont celles du jeu. Le **Coffre** a son **propre** menu, indépendant. « ✕ Réinitialiser les filtres » remet tout.
- [x] Sur des armes que tu connais, une arme **Stase** apparaît bien sous « Stase » et une arme **Filobscur** sous « Filobscur », pas l'inverse (un décalage de ce genre a déjà existé).

Résultat : validé. Précision de l'utilisateur : « Cryo-électrique » est bien le nom français de l'Arc (à ne pas confondre avec l'arme), « Stase » celui de la Stase.

---

## 🆕 Bouton « Aller à »

- [x] Sur **une arme ou armure que tu possèdes** (inventaire chargé), clique « **Aller à** » : la page glisse jusqu'à « Mon Inventaire », qui s'ouvre et ne montre que cet objet (tous tes exemplaires, personnages et Coffre). Un bandeau doré indique « Filtré sur … — N exemplaire(s) » et les sections (Chasseur, Titan, Arcaniste, Coffre) qui ont l'objet s'ouvrent.
- [x] Le bandeau a un bouton « **✕ Retirer ce filtre** » : tout l'inventaire revient. « ✕ Réinitialiser les filtres » le retire aussi.
- [x] « Aller à » sur un objet que **tu ne possèdes pas** : le bandeau le dit (« aucun exemplaire »). Si ton inventaire **n'est pas encore chargé** : le bandeau t'invite à le charger. (Une autre version de la même arme, réédition ou adepte, n'est pas incluse : elle a un autre identifiant.)

Résultat : validé.

---

## 🆕 Documentation et dépôt GitHub

- [x] Le **README** tient en un écran et renvoie vers la notice ; **NOTICE.md** contient le pas-à-pas Bungie, la fabrication du logiciel et « Comprendre le score » (tableau des poids avec les noms de l'écran) ; rien d'important n'a disparu.
- [x] Après avoir ajouté au `.gitignore` les lignes de `documentation/GITIGNORE-A-AJOUTER.txt`, `git status` ne propose plus d'ajouter `A-TESTER…`, `GUIDE-DEMARRAGE…` ni `NOTES-CONCEPTION.md`. (Si ces fichiers étaient déjà sur GitHub, ce fichier explique comment les retirer.)

Résultat : validé (`.gitignore` complété par l'utilisateur).

---

## 🆕 Bug du Filobscur : diagnostic des icônes (`npm.cmd run dev`)

- [x] Dans le bloc Doctrine, choisis une sous-classe **Stase**, clique « 🔍 Copier le diagnostic des icônes de cette doctrine » et copie le texte ; fais de même avec une sous-classe **Filobscur** ; envoie-moi **les deux textes**.

Résultat : l'utilisateur a envoyé les deux diagnostics (Chasseur, Stase et Filobscur, 12/10/2026). **Cause établie** : les prises, listes d'options et objets sont distincts (`hunter.strand.*` contre `hunter.stasis.*`), mais pour le saut et la compétence de classe, les cinq objets du Filobscur pointent vers EXACTEMENT les mêmes fichiers d'icône que ceux de la Stase (donnée de Bungie) ; mêlée, grenades et super ont des fichiers distincts. Corrigé en 0.4.1 par recoloration.

---

## 🆕 Scoring : nouvel ordre et nouveaux numéros des piliers 

- [x] Après avoir évalué un build, les cinq cartes de résultat apparaissent dans cet ordre : **1. Doctrine élémentaire** (hexagone et étoile), **2. Armes et Armures** (bouclier et épée), **3. Artefact** (losange et œil), **4. Effets du Build** (étincelles), **5. Statistiques** (barres). Chaque carte garde **son** logo ; le chiffre dessiné dans le titre correspond à sa place (le « 2 » est bien sur Armes et Armures, le « 3 » sur l'Artefact).
- [x] Le **score de chaque pilier et le score global sont les mêmes** qu'avec la 0.3.17 pour un même build (compare avec un build que tu connais, dans le même contexte).
- [x] Le **tableau des pondérations** du bloc « 0. Contexte du Build » liste les piliers **dans le même nouvel ordre**, et chaque pilier garde **son** poids : en contexte Neutre, par exemple, Doctrine élémentaire 10 %, Armes et Armures 20 %, Artefact 15 %, Effets du Build 30 %, Statistiques 25 %. Le formulaire de pondération personnalisée suit aussi cet ordre.
- [x] **Regarde les trois titres que j'ai recomposés** (« 1. DOCTRINE ÉLÉMENTAIRE », « 2. ARMES ET ARMURES », « 3. ARTEFACT »). Leur texte est dessiné en tracés : je l'ai refait avec **les lettres de tes propres dessins** (le « 3 » de l'ancienne carte « Armes et Armures », le « 2 » de l'ancienne carte « Artefact », « DOCTRINE » et « ÉLÉMENT » de ton titre « Doctrine et Élément » avec son « O » à losange, « AIRE » de « Mon Inventaire »). Vérifie l'**espacement des lettres**, le **centrage** et le **soulignage**, à côté des deux autres cartes. **Dis-moi** si le résultat te convient, ou si tu préfères me fournir tes propres versions.
- [x] Le bloc **« Classe et Doctrine »** garde son logo, comme demandé : le dessin dit toujours « DOCTRINE ET ÉLÉMENT » (c'est normal), son nom pour les lecteurs d'écran est « Classe et Doctrine ».

---

### Icône de « Classe et Doctrine » : billes agrandies

- [x] Compare l'icône du bloc **« Classe et Doctrine »** (hexagone, étoile, six billes bleues) à celle de la première carte du Scoring, **« 1. Doctrine élémentaire »** : même taille de billes, même hexagone, même étoile. Replie le bloc « Classe et Doctrine » : la même icône, aux billes agrandies, reste affichée. **Dis-moi** si la taille des billes te convient.

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.4.1** coché et renvoyé le 12/10/2026 (**10 cases cochées sur 10**, vérifiées par la relecture automatique du PDF). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Plus aucun test en attente.** Cinq sections entièrement validées.

---

## 🆕 Installation de la version 0.4.1 (12/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.4.1.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.4.1 » et **tes builds sont toujours là**.

Résultat : validé.

---

## 🆕 Filobscur : icônes de saut et de compétence de classe recolorées

- [x] Dans le bloc Doctrine, avec une sous-classe **Filobscur du Chasseur**, les icônes de **Saut** et de **Compétence de classe** ont maintenant un fond **vert** (comme dans le jeu). **Dis-moi si la teinte te convient** : plus verte, plus bleutée, plus claire ?
- [x] Même vérification avec le **Filobscur du Titan** et celui de l'**Arcaniste**. Si leurs icônes étaient déjà vertes avant, elles ne doivent pas avoir changé (la correction ne touche que les icônes identiques à celles de la Stase) ; si elles sont encore bleues, envoie-moi le diagnostic de cette classe.
- [x] **Rien d'autre n'a changé** : la mêlée, les grenades et la super du Filobscur gardent leur couleur ; la **Stase**, le Solaire, le Cryo-électrique et l'Abyssal restent exactement comme avant.
- [x] (logiciel installé) Ouvre la **fiche** d'un build Filobscur (« 👁 Voir ») puis exporte-la en image : dans la doctrine, la compétence de classe et le saut sont verts aussi, et les autres lignes inchangées.

Résultat : validé, les quatre cases cochées (Chasseur, Titan et Arcaniste, rien d'autre de changé, fiche et export du logiciel installé) **sans demande de réglage de la teinte** : la rotation de −70° est conservée. La recoloration reste une approximation faite par l'appli (les objets du Filobscur réutilisent les fichiers d'icône de la Stase dans les données de Bungie).

---

## 🆕 Archive de visuels v3 : logo « Armes et Armures » redessiné

- [x] La carte **« 2. Armes et Armures »** du Scoring affiche le nouveau logo (épée plantée dans le bouclier), avec son chiffre 2 et son soulignage ; les quatre autres cartes sont inchangées.

Résultat : validé.

---

## 🆕 Export infographique : logos et icônes

- [x] (logiciel installé) Exporte une fiche (image ou PDF) : l'en-tête montre l'**icône de classe** (disque de couleur), l'**icône d'élément** (celle du jeu) et l'**icône de contexte**. Sur un build **Prismatique**, le symbole à deux tons ; sur un build **Neutre**, le mot « Neutre » apparaît maintenant avec son icône (décision de l'utilisateur : le contexte choisi est toujours affiché, Neutre compris).
- [x] Les **quatre titres de section** ont leur logo, bien alignés : **DOCTRINE** (hexagone), **ARMES** (l'épée seule), **ARMURE** (le bouclier seul) et **ARTEFACT** (losange). Les logos Armes et Armure viennent de ta nouvelle archive de visuels (v3).
- [x] L'image exportée n'a aucune icône cassée ni carré vide à la place d'un logo.

Résultat : validé (logiciel installé) : icônes de classe, d'élément et de contexte (Neutre compris), quatre titres de section avec leur logo, aucune icône cassée.

---

## ⏳ Reste de la 0.3.19

- [x] (logiciel installé) **Toutes les images s'affichent**, y compris les trois cartes renommées : aucune image cassée, aucun ancien numéro (« 2. Artefact », « 3. Armes et Armures », « 1. Élément et Doctrine ») nulle part.

Résultat : validé. C'était le dernier test en attente de la 0.3.19.

---

Tests VALIDÉS par l'utilisateur : liste « A-TESTER » de la version **0.4.2**, validée le 12/10/2026 par ce message de l'utilisateur : « Toute la check-list Test 0.4.2 est validée 🥳 ». ⚠️ **Le PDF n'a pas été renvoyé** : les cases n'ont donc pas été relues automatiquement, la validation est celle déclarée dans la conversation (les 9 cases sont ici recopiées cochées). Texte de la liste TEL QU'IL ÉTAIT. **Plus aucun test en attente.** Deux sections entièrement validées.

---

## 🆕 Installation de la version 0.4.2 (12/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.4.2.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.4.2 » et **tes builds sont toujours là**.

Résultat : validé.

---

## 🆕 Bouton « Transférer vers » (essais EN JEU)

- [x] **Coffre → personnage** : sur une arme sans importance du Coffre, clique « Transférer vers », choisis un personnage, vérifie que la **confirmation** nomme l'objet, le départ et l'arrivée, puis confirme. Un bandeau vert annonce la réussite, la ligne passe sous ce personnage, et **en jeu** l'arme est bien dans l'inventaire de ce personnage.
- [x] **Personnage → Coffre** : même chose dans l'autre sens ; **en jeu** l'arme est bien au Coffre.
- [x] **Personnage → autre personnage** : la confirmation précise « en passant par le Coffre : deux opérations » ; après confirmation, l'arme est chez le second personnage **en jeu**, et le bandeau le dit.
- [x] **Annuler** : choisis une destination puis « Annuler » : rien ne bouge, ni dans l'appli, ni en jeu.
- [x] **Objet équipé** : le bouton « Transférer vers » d'un objet **équipé** est grisé ; au survol, l'infobulle explique qu'il faut en équiper un autre en jeu d'abord. (Facultatif : équipe l'objet en jeu après avoir chargé l'inventaire, puis tente le transfert dans l'appli : l'appli doit refuser avec « équipé », car elle relit la position réelle avant d'agir.)
- [x] **Armure** : pour une armure, seuls sont proposés le **Coffre** et **le personnage de sa classe** (jamais un autre personnage). Teste avec une armure du Coffre : une seule destination de personnage.
- [x] **Cohérence** : après quelques transferts, clique « Recharger mon inventaire » : l'affichage rechargé est identique à ce que l'appli montrait avant, et à ce qu'il y a en jeu.
- [x] (facultatif) **Destination pleine** : envoie une arme vers un personnage dont l'emplacement d'armes est plein : le bandeau orange explique « Plus de place à destination » (ou, sinon, affiche le texte de Bungie tel quel : **copie-le-moi**) et l'objet reste où il était.

Résultat : validé, **y compris les essais en jeu** (coffre ↔ personnage, personnage → personnage par le Coffre, annulation, objet équipé, armure, cohérence après rechargement, et le cas facultatif de la destination pleine).

---

Tests VALIDÉS par l'utilisateur : PDF « A-TESTER » de la version **0.4.3** coché et renvoyé le 13/10/2026 (**14 cases cochées sur 14**, vérifiées par la relecture automatique du PDF). Retirés de la liste, recopiés mot pour mot du texte de la liste TELLE QU'ELLE ÉTAIT, cases cochées. **Plus aucun test en attente.** Trois sections entièrement validées.

---

## 🆕 Installation de la version 0.4.3 (13/10/2026)

- [x] `npm.cmd run build` se termine **sans erreur**, puis `npm.cmd run electron:build` fabrique `Forge-Armory-Setup-0.4.3.exe` (dossier `installateur`) ; installé par-dessus, le pied de page indique « Forge Armory v0.4.3 » et **tes builds sont toujours là**.

Résultat : validé.

---

## 🆕 Forge : Collection des armes (essais avec TES données)

- [x] **Lecture des armes** : la vue « Collection » affiche la liste (une courte attente « Lecture des armes du Manifest… » est normale la première fois). **Note les trois nombres du menu « Source »** (Collections du jeu, Hors Collections, Tout) et **le temps d'attente** approximatif, et envoie-les-moi.
- [x] **Cartes** : sur des armes que tu connais (une exotique, une légendaire), le nom, l'icône, le type, l'emplacement, l'élément et l'archétype sont corrects ; bordure dorée pour un exotique, violette pour un légendaire.
- [x] **Grisé comme dans le jeu** : le bandeau vert annonce que tes collections ont été lues ; une arme que tu as obtenue au moins une fois (même démantelée) est en couleurs ; une arme que tu n'as **jamais** eue est grisée avec « Jamais obtenue ». Vérifie avec trois armes de chaque sorte. (Si un bandeau **orange** apparaît avec une raison, **copie-la-moi** : aucune arme n'est alors grisée.)
- [x] **Filtres et recherche** : type d'arme, emplacement, rareté, élément (une arme Stase sous « Stase », une Filobscur sous « Filobscur », pas l'inverse), archétype, « Obtenues / Jamais obtenues », et la recherche par nom (essaie un nom **sans accent**). « ✕ Réinitialiser les filtres » remet tout.
- [x] **Source « Hors Collections »** : regarde ce que contient cette liste (définitions techniques, anciennes ou variantes) ; dis-moi si tu y vois une arme qui **devrait** être dans les Collections, ou s'il **manque** dans « Collections du jeu » une arme que tu connais.
- [x] **Fenêtre des perks, même logique que « Détails »** : clique une arme à rolls aléatoires que tu connais : les colonnes montrent toutes les options possibles. Ouvre ensuite « Détails » de la **même arme** dans Mon Inventaire (ou Mon Build) : les colonnes sont les mêmes, dans le même ordre, avec « Mods utilisables » **en bas** dans les deux.
- [x] **« Afficher les perks inutiles »** : désactivé par défaut, aucune colonne Souvenir, Compte-frags, palier ou ornement ; coché, elles réapparaissent marquées « inutile » ; décoché, elles disparaissent. Dis-moi si une colonne **utile** est cachée, ou si une colonne **inutile** s'affiche par défaut.
- [x] **Détails inchangés** : la popup « Détails » d'une arme dans l'Inventaire, dans le Coffre et dans Mon Build montre les mêmes colonnes qu'avant la 0.4.3.
- [x] (npm.cmd run dev) **Diagnostic des perks améliorés** : ouvre quatre armes dont au moins une avec des **perks améliorés** (flèche jaune) ; dans la fenêtre, clique « 🔍 Diagnostic des perks de cette arme », copie le texte, et **envoie-moi les quatre** (c'est ce qui prépare l'affichage des perks améliorés de la 0.4.4).
- [x] **Onglets** : l'onglet « Inventaire » annonce la prochaine version ; en revenant à « Collection », tes filtres et ta recherche sont **conservés**.

Résultat : validé, les dix cases cochées (lecture des armes, cartes, grisé d'après les collections, filtres et recherche, source « Hors Collections », fenêtre des perks, interrupteur des perks inutiles, popup Détails inchangée, diagnostic des perks améliorés, onglets). **Retours de l'utilisateur** : (1) sur les cartes d'armes, afficher dans cet ordre l'icône de type d'arme, l'icône d'élément de dégâts, l'icône de type de munitions et l'icône antichampion, et garder l'armature ; (2) retirer la mention « Jamais obtenue », redondante avec l'effet grisé ; (3) diagnostics envoyés : deux Confiance (deux révisions), Défense dorée (sans perks améliorés) et Grande Faucheuse (temps perdu). **Non reçus** : les trois nombres du menu « Source » et le temps d'attente de la liste (demandés par le test, facultatifs).

---

## 🆕 Manifest périmé : mise à jour automatique

- [x] (npm.cmd run dev) **Simulation d'un Manifest périmé** : Manifest chargé, clique « 🧪 Manifest périmé (test) » : un message dit de recharger la page. Fais **Ctrl+F5** : un message **🔄** annonce la mise à jour automatique (en nommant les langues), le téléchargement démarre **sans que tu cliques**, puis un message **✅** annonce que le Manifest est mis à jour et la recherche fonctionne. **Note le temps** que cela prend et envoie-le-moi.
- [x] **Démarrage normal** : avec un Manifest à jour, relance l'appli (Ctrl+F5) : il se charge tout seul depuis le cache, **sans message de mise à jour ni téléchargement**.
- [x] (facultatif) **Hors ligne** : coupe ta connexion Internet puis relance l'appli : aucun téléchargement n'est tenté, pas d'erreur bruyante, et le bouton « Charger le Manifest » reste disponible.

Résultat : validé, les trois cases cochées (simulation, démarrage normal, hors ligne). **Temps mesuré par l'utilisateur : 15 secondes entre Ctrl+F5 et la fin de la mise à jour automatique** (deux langues, simulation du mode développement).
