# Ressources externes

Liens de référence transmis par l'utilisateur, avec leur statut d'usage dans
le projet.

---

## Buildcrafting — dépôt JaredEzz

**https://github.com/JaredEzz/destiny2-buildcrafting/tree/master/general**

Statut : **à noter, non utilisé pour l'instant** (décision de l'utilisateur).

Le dépôt propose un système de notation (« rating ») des builds. Réserve
explicite de l'utilisateur : *« le rating peut éventuellement être
intéressant, même si ça ne gage pas de la valeur du build dans son
ensemble »*. À garder comme point de comparaison éventuel avec notre propre
scoring, pas comme source à intégrer.

⚠️ **Consulté le 25/08/2026** (page `subclasses/void-voidwalker.md`, un
exemple du contenu du dépôt) : ce document conteste directement le choix
d'artefact de la source lfcarry (voir ci-dessous) pour un build Vide/Void —
*« le choix de Queensfoil Censer du document est faux sur le fond : c'est
un artefact Solaire/Stase/Roquette, et trois de ses quatre perks "étoilés"
sont mal interprétés »*. Détail donné : Revitalizing Blast serait en
réalité « étourdir un Champion → embrasement + lever l'étourdissement de
bouclier », pas le remboursement de compétence/soin annoncé par lfcarry.
**Aucun arbitrage fait de notre côté** — deux sources tierces se
contredisent sur un artefact qu'on a nous-mêmes traduit (Queensfoil Censer,
`knowledge-base/20`) ; à garder en tête si une observation en jeu permet un
jour de trancher.

### Farm d'armure — page spécifique (consultée intégralement le 25/08/2026)

**https://github.com/JaredEzz/destiny2-buildcrafting/blob/master/general/armor-farming.md**

Statut : **matière directement utile** pour les archétypes d'armure (TODO)
et les lieux/moments de farm.

**Le mod « Armorer » du Ghost** — mécanique de jeu confirmée, pas une
supposition éditoriale : le slotter sur l'archétype visé (socket
Économique) double la chance d'obtenir cet archétype en drop (1 sur 2 au
lieu de 1 sur 3). Un mod par famille de build.

**5 archétypes, chacun lié à une paire de stats prioritaires** (table
« Ghost Armorer target → Archetype ») :

| Archétype | Stats favorisées (30/25) |
|---|---|
| Colossus | Super / Santé |
| Demolitionist | Grenade / Classe |
| Siegebreaker | Santé / Grenade |
| Reaver | Classe / Mêlée |
| Bulwark | Santé / Classe |

✅ Résolu le 25/08/2026 : ces 5 archétypes ne sont qu'un sous-ensemble des
12 existants (Grenadier existe bien). Table complète, avec les noms
français confirmés en jeu : `08_GAME_MECHANICS.md`, section « Armor 3.0 ».

**Palier de qualité (Tier 5)** : 30/25/20 de stats garantis, 11 d'énergie de
mod, un emplacement de réglage fin. Les exotiques sont rétroactivement
Tier 5 — seuls les légendaires nécessitent du farm.

**Sources de farm listées** :
- *Solo* : Distorsions (nouveaux événements publics, sans pression),
  Secteurs perdus Expert→Maître (rotation quotidienne), activités du
  Portail (Solo Ops/Conquêtes), un donjon en vedette solo.
- *Groupe* : raids/donjons en vedette (×2, farmables en Tier 5 + bonus de
  set), **la Cité du Désert Perpétuel** (le vendeur, après un affrontement,
  vend du matériel de plus haut palier — source « dernière pièce
  manquante » assez déterministe), GM Nightfalls, Panthéon 2.0 Standard.

⚠️ Sources citées en bas de cette page : Boostmatch, Bungie (FAQ
officielle), **Skycoach** et **Boosting-Ground** (les deux guides Armure
3.0 transmis séparément par l'utilisateur, voir plus bas) — et **lfcarry**,
la même source dont la colonne « for these builds » est signalée comme
indicative par l'utilisateur. Ce document-ci reproduit d'ailleurs la même
structure de colonne (« For these builds ») — cohérent avec la réserve déjà
posée.

## Armure 3.0 — compréhension du système

Deux guides transmis pour comprendre le fonctionnement de l'Armure 3.0 :

- **https://boosting-ground.com/Destiny2/guides/pve-guides/armor-3-0-complete-guide**
- **https://skycoach.gg/blog/destiny/articles/armor-3-0-guide**

Statut : **documentation de référence**, utile notamment pour les
archétypes d'armure et la calibration des statistiques (Pilier 5).

⚠️ Ce sont des sites tiers, pas des sources officielles Bungie. En cas de
contradiction avec une observation en jeu de l'utilisateur, l'observation
en jeu prime — comme cela a déjà été le cas plusieurs fois sur ce projet
(anti-champion des munitions effilochantes, correspondances d'armatures).

### Boosting-Ground (consulté le 25/08/2026) — matière confirmée, conclusion CORRIGÉE

Cette page (datée juillet 2025, décrit **Edge of Fate**) confirme que notre
modèle de statistiques est le bon — Santé, Mêlée, Grenade, Super, Classe,
Arme sur une échelle à 200 points correspond exactement à leur description
du système (Résilience→Santé, Force→Mêlée, Discipline→Grenade,
Intellect→Super, Récupération→Classe, Mobilité→Arme).

### Skycoach (consulté le 25/08/2026) — confirme le premier guide

Liste **exactement les 6 mêmes archétypes** que Boosting-Ground, avec les
mêmes paires de stats — deux sources indépendantes parfaitement d'accord
sur le système **Edge of Fate**.

### Archétypes : 12 au total, table dans la fiche 08

Les 6 archétypes décrits par ces deux guides (Edge of Fate) existent
toujours ; 6 autres sont venus s'y ajouter, pour un total de **12**,
confirmé en jeu par l'utilisateur le 25/08/2026. La table de référence,
avec les noms anglais, les noms français et les paires de stats, est
dans **`08_GAME_MECHANICS.md`**, section « Armor 3.0 — Archétypes »
(déplacée depuis cette fiche le 28/09/2026).

**Leçon retenue** (erreur du 24/08, corrigée le 25/08) : une liste qui
semble incomplète doit d'abord faire suspecter qu'elle EST incomplète,
pas qu'elle décrit un système différent. J'avais conclu à tort à un
remplacement du système sur la base d'un document qui ne citait que 5
archétypes.

📌 Petit écart entre les deux guides sur les paliers de statistiques
totales (ex : Tier 1 à 48-53 chez Skycoach contre 52-57 chez
Boosting-Ground) — probablement de simples ajustements d'équilibrage entre
les deux dates de rédaction, sans conséquence pour notre usage.

**Les 4 liens transmis le 25/08 ont maintenant été consultés intégralement.**

---

## Conversation ChatGPT partagée

**https://chatgpt.com/share/6a8db70d-8cd0-83eb-a069-699da664a9bf?ogimg=plain**

Statut : **partiellement accessible**. Le paramètre `?ogimg=plain` a permis
de charger la page (les deux tentatives précédentes, sans ce paramètre,
n'y parvenaient pas), mais seules les MÉTADONNÉES de la page sont
récupérables — le contenu réel de la conversation se charge par
JavaScript, invisible pour l'outil de lecture utilisé ici.

**Titre récupéré : « ChatGPT - Agent IA Destiny 2 »** — suggère un lien
direct avec ce projet, mais le contenu des messages reste inconnu.

La page porte la balise `noindex,nofollow` (exclusion volontaire des
moteurs de recherche), ce qui explique pourquoi elle n'apparaissait dans
aucun résultat de recherche.

⚠️ **Contenu des messages toujours inconnu.** Si l'utilisateur peut en
coller le texte directement dans une conversation future, ou en résumer
l'essentiel, ce sera ajouté ici correctement.

---

## Dépôt officiel de l'API Bungie.net

**https://github.com/Bungie-net/api**

Statut : **référentiel de l'API elle-même**, pas une base de contenu du
jeu — consulté le 25/08/2026 (résultats de recherche uniquement, pas une
lecture intégrale).

Contient : les contrats des points d'accès, la portée OAuth, les
changelogs par extension, et un suivi de bugs alimenté par la communauté
des développeurs tiers.

⚠️ **Ne contient PAS de texte de jeu** (descriptions de perks, fragments,
aspects...) — ce type de contenu ne vit que dans le Manifest téléchargé en
direct par l'appli, jamais dans ce dépôt. Ne comble donc PAS le manque
actuel sur la description du fragment Tison de Charbon (voir TODO).

**Utilité réelle** : référence en cas de futur bug ressemblant à ceux
rencontrés cette session (échecs d'équipement, quirks d'authentification,
comportements d'API inattendus) — le suivi de bugs et le wiki documentent
des cas connus signalés par d'autres développeurs utilisant la même API.

---

## Bases de données Armes & Armures (light.gg, SafeMoonD2)

Ajout du 28/09/2026 : les deux liens transmis ce jour-là ont leur propre
fiche, **`26_ARMES_ARMURES.md`** (statut, usage par chantier, réserves).
En résumé : light.gg est fiable et lisible par un agent, avec une adresse
construite sur le hash ; SafeMoonD2 est trop récent pour être évalué et
illisible pour un agent, donc à surveiller.

---

## Classeur « Destiny 2: Endgame Analysis » (Google Sheets, communautaire)

**https://docs.google.com/spreadsheets/d/1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY/edit?gid=1402770816**

Ajout du 05/10/2026. Statut : **source jugée fiable par l'utilisateur** (« beaucoup d'informations réputées sûres »),
**à exploiter plus tard** (décision de l'utilisateur). Aucune donnée n'en est encore intégrée au projet.

**Ce que j'ai pu lire** : la page se lit sans compte, en lecture seule, mais **un seul onglet à la fois** : celui du
`gid` de l'adresse. Le lien transmis ouvre l'onglet **Fragments** (98 fragments : image, nom, sous-classe, étiquettes,
déclencheur, effet, modificateurs de stats, usage, rang S à F, légende des rangs), et non les mods d'artefact. Les noms de
tous les onglets sont visibles, **mais leur contenu ne l'est pas sans leur propre adresse** (chaque onglet a un `gid`
différent) : pour en lire un autre, l'utilisateur doit transmettre le lien depuis cet onglet, ou une exportation (CSV, xlsx).

**Essai du 05/10/2026 (second)** : l'adresse **sans `gid`** est redirigée vers ce même onglet « Fragments » : on ne peut
donc pas parcourir les autres onglets en retirant le `gid`. Il faut le lien propre à chaque onglet (depuis l'onglet, menu de
partage) ou une exportation.

**Onglets du classeur** (relevés le 05/10/2026) : Reference (outdated), Status, Changelog, Shopping List, Archetypes, Ideas,
Experimental ; une page par type d'arme (Autos, Bows, HCs, Pulses, Scouts, Sidearms, SMGs, BGLs, Fusions, Glaives, Shotguns,
Snipers, Rocket Sidearms, Traces, HGLs, LFRs, LMGs, Rockets, Swords, Other, Primaries) ; **Exotic Weapons** ; **Perks** ;
**Origin Traits** ; **Set Bonuses** ; **Artifact Mods** ; **Fragments** ; **Aspects** ; **Subclasses** ; **Encounters** ;
et des onglets périmés (« (old) », « (ignore) », « Builds (ignore) », « Exotic Armor (ignore) »).

**Réserves** : contenu en **anglais**, rédigé par la communauté ; les rangs S à F sont des **opinions** (le classeur le dit
lui-même : « build essentials » à « not helpful »), pas des données du jeu ; les onglets « (old) » et « (ignore) » sont
périmés ; les valeurs chiffrées (durées, pourcentages) sont à recouper avec le Manifest et les fiches de patch avant d'en
dépendre ; les rubriques inconnues y sont notées « ? ».

**Les images ne sont PAS exploitables dans l'appli** : les icônes des cellules sont des miniatures de **50 × 49 pixels**
hébergées par Google, à adresse à jeton (`docs.google.com/sheets-images-rt/…`), liées à la session du classeur : instables,
hors de notre contrôle, impossibles à enregistrer dans les données (je n'ai pas de connexion à Internet dans mon
environnement) et incompatibles avec une appli qui n'affiche que des icônes de Bungie. Les icônes de l'appli viennent du
Manifest (voir TODO 17).

**Usages envisagés, plus tard** (à valider avec l'utilisateur) : recoupement des fragments, aspects et sous-classes avec le
score des piliers (notamment les modificateurs de stats des fragments, colonne « Stats ») ; onglets Set Bonuses et Exotic
Weapons avec `25_AUDIT_FRAGMENTS.md`, `26_ARMES_ARMURES.md` et `28_ARMES_EXOTIQUES_ANTI_CHAMPION.md` ; onglet Artifact Mods
avec les perks d'artefact (`03_ARTIFACTS.md`).

**Recoupements déjà faits avec l'onglet « Fragments »** (05/10/2026, seul onglet lu) :
- **Accord avec la base** : « Echo of Persistence » et « Spark of Focus » portent un malus de stat qui dépend de la classe
  (`-10 Weapons (H)`, `-10 Health (T)`, `-10 Class (W)` : Chasseur, Titan, Arcaniste) ; la fiche `02_SUBCLASSES_ALL.md` note la même
  chose pour Echo of Persistence. Deux sources concordent (à vérifier pour l'appli : TODO 18) ;
- **Accord avec la base** : le Weaken standard (« neutral 15% increase to all damage », 6 s) concorde avec les 15 % PvE de
  `01_DAMAGE_STACKING.md` ;
- **Ce que l'onglet ne donne pas** : des formules. Ses remarques sur le caractère additif (« additive nature » pour Whisper of
  Hunger, « additive » pour Spark of Feedback) sont des commentaires, pas des règles de calcul ; plusieurs valeurs y sont
  marquées « ? » par l'auteur lui-même (Thread of Evolution, Thread of Generation, Facet of Justice, Echo of Remnants…).

**CSV de l'onglet « Artifact Mods »** (envoyé par l'utilisateur le 05/10/2026, conservé tel quel dans
`knowledge-base/sources-externes/endgame-analysis_artifact-mods_2026-10-05.csv`) :
- **contenu** : 147 lignes, soit exactement nos 7 artefacts × 21 perks ; colonnes : icône, artefact, mod, palier (I, II, III), étiquettes,
  déclencheur, effet, analyse, note S à F (S 15, A 47, B 60, C 21, D 4). Tout en **anglais** ;
- **la colonne des icônes est VIDE pour les 147 lignes** et le fichier ne contient aucune adresse d'image : Google n'exporte pas les images
  de cellules en CSV. Le CSV ne peut donc pas fournir d'icônes (piste de repli : TODO 17) ;
- **recoupement avec `03_ARTIFACTS.md`** : 146 perks sur 147 retrouvés avec **le même nom, le même artefact ET le même palier** ; les deux
  sources décrivent donc les mêmes perks, aux mêmes paliers. Seule différence : une orthographe, « That Fresh Bullet Smell » (notre fiche)
  contre « That Fresh Bullets Smell » (CSV) ; le nom exact du jeu est celui du Manifest, que l'appli utilise ;
- **à exploiter plus tard** (décision de l'utilisateur) : les notes S à F sont des **opinions**, à citer comme telles ; les textes
  « Trigger » et « Effect » sont de l'anglais communautaire, à ne pas confondre avec les descriptions officielles du Manifest.

**Rapports de contrôle produits par les outils de développement de l'appli sur le Manifest de l'utilisateur** (conservés tels quels dans `knowledge-base/sources-externes/`) :
- `controle-icones-perks-artefact_2026-10-05.md` (21 h 36) : 125 icônes de perks d'artefact trouvées sur 147, 13 ambiguës, 9 introuvables. Le Manifest classe ces objets comme
  « Attribut d'artéfact » (237 objets), catégorie de plug `artifact_perks`. Les 125 icônes sont figées dans `src/data/iconesPerksArtefact.ts` ;
- `controle-anti-champion-exotiques_2026-10-05.md` (21 h 37) : aucune arme exotique oubliée dans la liste de référence (voir `28_ARMES_EXOTIQUES_ANTI_CHAMPION.md`).
- `controle-icones-perks-artefact_2026-10-06.md` (06/10, 00 h 22) : second passage, 128 perks trouvés directement, 6 introuvables avec un nom proche évident, 13 ambigus (même nom, deux icônes ; saison non renseignée).
- `controle-anti-champion-exotiques_2026-10-06.md` (06/10) : même contrôle, avec la section « Autres définitions de même nom que des armes de la liste » (66 définitions pour 39 armes, dont 35 objets factices de type 20).
- `capture_recherche_tueur-de-souhaits_colis_2026-10-06.png` : capture de la Recherche montrant le « Colis » factice du Tueur de Souhaits (`type 20`, texte de type « Colis », catégorie 3109687656).

