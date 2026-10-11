# Armes & Armures — sources externes de consultation

Fiche créée le 28/09/2026. Complète `23_RESSOURCES_EXTERNES.md` (même
principe : statut d'usage et réserves pour chaque lien transmis par
l'utilisateur), en se concentrant sur les bases de données d'armes et
d'armures.

Le contenu de jeu sur les armes et armures déjà présent dans la
knowledge-base reste dans ses fiches d'origine : `04_EXOTIC_ARMORS.md`,
`05_ARMOR_MODS_AND_SETS.md`, `06_EXOTIC_WEAPONS.md`, `09_ARCHETYPES.md`.

---

## Principe : on stocke la carte, pas les données

Ces sites **ne sont pas recopiés** dans le dépôt. Les objets, perks,
statistiques et légendes qu'ils affichent viennent du Manifest de Bungie,
que l'appli télécharge et garde déjà en cache. Une copie ferait doublon et
serait périmée à la première mise à jour du jeu.

Ce fichier stocke donc : quel site consulter, pour quel chantier, avec quel
degré de confiance, et comment y accéder depuis un hash du Manifest.

Pour le futur agent IA, ces sites se placent à la **dernière étape** de
l'ordre de recherche verrouillé (voir
`documentation/agent-ia/ARCHITECTURE-AGENT-IA.md`) : Manifest local →
knowledge-base → Bungie → **web**.

---

## light.gg

**https://www.light.gg/db/all/**

Statut : **référence fiable, utilisable dès maintenant en consultation.**
Vérifié le 28/09/2026.

- Base alimentée par l'API Bungie, avec un historique des mises à jour de
  l'API depuis décembre 2017. Environ 38 900 objets indexés au 28/09/2026
  (saison 29, Monument of Triumph).
- **Lisible par un agent IA** : les pages sont construites côté serveur, un
  simple « web fetch » récupère le contenu réel (contrairement à beaucoup de
  sources de la knowledge-base, voir plus bas).
- **Adresse construite sur le hash** : `https://www.light.gg/db/items/{itemHash}`.
  Le hash du Manifest suffit, sans recherche par nom. Exemple : Cerberus+1 =
  `https://www.light.gg/db/items/1541131350`.

| Chantier | Usage |
|---|---|
| Agent IA | Consultation ponctuelle d'un objet par son hash (perks possibles, provenance, saison). Les notes PvE/PvP et la popularité des perks sont un **avis communautaire** : à citer comme tel, jamais à injecter dans le scoring (la couche de scoring déterministe reste la source de vérité). |
| Moteur de dégâts | **Pas une source de valeurs chiffrées.** Les descriptions de perks sont celles du Manifest, souvent sans pourcentage. Utile pour savoir *quelles* armes peuvent porter un perk (outil « God Roll Finder »), pas *combien* il ajoute. |
| Bibliothèque | Filtre « Has Lore? → Require » pour contrôler qu'un objet a bien une légende. Filtre « Primary Version Only » pour repérer les rééditions : par exemple Outbreak Perfected existe sous deux hashes (3824673936 et 400096939), Dead Man's Tale aussi (2188764214 et 3654674561). Aide à valider la règle « rééditions dédoublonnées ». |
| Correspondance EN → FR | Les fiches `01` à `12` sont en anglais alors que le Manifest de l'appli est en français (voir `00_INDEX.md`, section « Langue »). light.gg donne le hash d'un objet à partir de son nom anglais ; l'appli retrouve ensuite le nom français par ce hash. |
| Patch notes (`27_PATCHNOTES/`, TODO section 10) | L'« API Update Tracker » (`https://www.light.gg/db/changes/`) détaille ce qui change dans l'API à chaque mise à jour, avec les dates. Bon point de départ pour les fiches FR/EN. |
| Export DIM | Aucun usage direct : DIM travaille sur les hashes et les identifiants d'instance issus de l'inventaire du joueur. |

⚠️ Conditions d'utilisation (version du 17/09/2018) : aucune clause sur la
lecture automatisée, mais la règle retenue est la **consultation objet par
objet**, jamais l'aspiration de la base entière.

---

## SafeMoonD2

**https://safemoond2.com/db**

Statut : **non évaluable, à surveiller. Aucun usage pour l'instant.**
Vérifié le 28/09/2026.

- Site annoncé sur X le 28/09/2026, le jour même de cet ajout : aucun
  historique. Il se présente comme base de données, god rolls,
  statistiques joueurs, cartes des Jugements d'Osiris, clans, classements
  et coffre.
- **Illisible pour un agent IA** : la page `/db` est construite en
  JavaScript, un « web fetch » ne récupère que le titre et la description
  du site. En l'état, un agent ne peut rien en tirer.
- ⚠️ **Prudence** : le nom reprend celui d'une arnaque crypto connue, ce que
  la communauté a relevé dès l'annonce. Rien ne prouve un lien, mais tant
  que la réputation du site n'est pas établie, ne pas y connecter son
  compte Bungie (la fonction « coffre » donne accès à l'inventaire).

**À réévaluer dans quelques semaines** sur quatre critères : ancienneté et
retours de la communauté, adresse construite sur le hash, lisibilité par un
agent, présence de données absentes du Manifest (valeurs chiffrées de perks
notamment).

---

## Rappel : sources illisibles pour un agent

Plusieurs sources majeures sont construites en JavaScript et ne livrent
rien à une lecture automatique. Leurs données doivent être relevées à la
main dans la knowledge-base :

| Source | Situation |
|---|---|
| Feuille de Court « Destiny 2 Damage Buffs/Debuffs » (mise à jour pour la June Update 2026) | Référence des valeurs de buffs et debuffs, base de `01_DAMAGE_STACKING.md`. Illisible (Google Sheets), vérifié le 28/09/2026. |
| Fiche des catalyseurs exotiques | Même problème, déjà signalé dans `00_INDEX.md`. |
| Tableaux détaillés de shatteredvault.com | Déjà signalé pour `13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`. |
| SafeMoonD2 | Voir ci-dessus. |
