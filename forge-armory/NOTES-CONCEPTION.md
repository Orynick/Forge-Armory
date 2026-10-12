# Forge Armory — Notes de conception et de suivi (non publiées)

> ⚠️ **Ce fichier est INTERNE** : il est listé dans le `.gitignore` et ne doit pas être publié. Il contient les notes de conception, la calibration du scoring, les points de vigilance et les apprentissages techniques, **déplacés tels quels de l'ancien `README.md`** (le 12/10/2026). Le mode d'emploi est dans `NOTICE.md`.

**Numérotation des piliers.** Les sections ci-dessous emploient l'**ANCIENNE** numérotation « Pilier N » (avant le 06/09/2026) : Pilier 1 = Élément et Doctrine (affiché « 1. Doctrine élémentaire »), Pilier 2 = Verbes d'Élément (affiché « 4. Effets du Build »), Pilier 3 = Perks d'Artefact (affiché « 3. Artefact »), Pilier 4 = Loot et cohérence (affiché « 2. Armes et Armures »), Pilier 5 = Statistiques. Voir `src/data/piliers.ts`. En cas de doute, se fier à la clé interne.

**Où est passé ce qui était dans le README.** Démarrage, application Bungie pas à pas, logiciel installable, Manifests, Loadouts → `NOTICE.md`. Tout le reste → ci-dessous.

---

## Ancien en-tête du README

# Forge Armory

**Destiny 2 Build Analyzer** — *(anciennement « D2 Build Analyzer » : ce nom est devenu le
sous-titre de l'application depuis le 05/10/2026)*

Appli locale (React + Vite + TypeScript) pour étudier et scorer des builds
Destiny 2 selon 5 piliers pondérés (poids variables selon le contexte de
build : Neutre, Roaming, DPS, PvP), alignée sur le système
**Armor 3.0 / Monument of Triumph** (juin 2026).

Par Orynick/Orygamer.

📄 Documents liés : `TODO.md` (ce qui reste à faire) · `CHANGELOG.md`
(historique daté de toutes les corrections/ajouts) · `documentation/`
(rapports d'audit, conception de l'agent IA — voir son `LISEZ-MOI.md`).

---

## État général (état d'avancement détaillé, piliers compris)

| Bloc | État |
|---|---|
| Connexion Bungie (OAuth, profil, inventaire, coffre) | ✅ Fonctionnel |
| Manifest (téléchargement, recherche bilingue, cache d'instance) | ✅ Fonctionnel — rechargé automatiquement au démarrage s'il est déjà en cache et à jour |
| Doctrine — sous-classes, aspects, fragments, capacité réelle en fragments | ✅ Fonctionnel |
| Mon Inventaire / Coffre — filtres, recherche, doublons, popup Détails | ✅ Fonctionnel |
| Icônes (classes, armures, 18 types d'armes, activités, éléments) | ✅ Fonctionnel |
| Anti-champion — armatures d'armes + jetons du jeu + armures exotiques | 🟡 20 armatures sur 27 recensées |
| Bonus de set d'armure (affichage) | ✅ Fonctionnel — données réelles du Manifest |
| Loadouts (sauvegarde locale, icônes, équipement en jeu, export/import) | ✅ Fonctionnel — équipement sur le personnage de la classe du build ; fenêtres « Modifier... » (nom, description, icône) et « Exporter... » (texte, JPEG, PNG, PDF, JSON) |
| Fiche d'un build (« 👁 Voir » dans les Loadouts) | ✅ Fonctionnel — tout le contenu du build en une vue |
| Partage d'un build : fichier JSON, texte, image JPEG/PNG, PDF | ✅ Fonctionnel — depuis la fiche, ou depuis le bloc « Partage du build » sans enregistrer ; images et PDF dans le logiciel installé uniquement |
| Pondération personnalisée des piliers (réglages nommés) | ✅ Fonctionnel — bloc « 0. Contexte du build » |
| Type de munitions des armes (principales, spéciales, lourdes) | ✅ Fonctionnel (v0.2.9) — icône à droite de l'élément, partout |
| Blocs repliables (Inventaire, Doctrine, Mon Build, Artefact, Partage) | ✅ Fonctionnel |
| Logiciel installable Windows (Electron) | ✅ Fonctionnel — voir « Fabriquer le logiciel installable » |
| Sélecteur d'artefact (7 artefacts, 147 perks, contraintes de tiers) | ✅ Fonctionnel |
| Bouton « Équiper le build en jeu » | ✅ Fonctionnel (armes et armures ; la Doctrine reste manuelle) |
| **Pilier 1** — Élément & Doctrine | ✅ Réel (validité + capacité en fragments) |
| **Pilier 2** — Verbes d'Élément (source/payoff + chaînes + ressources) | ✅ Réel |
| **Pilier 3** — Perks d'Artefact | ✅ Réel (remplissage, cohérence, synergie) |
| **Pilier 4** — Loot & Cohérence | 🟡 Partiel — validité et bonus de set réels ; anti-champion et cohérence élémentaire à écrire |
| **Pilier 5** — Statistiques | ✅ Réel — masterwork et fragments corrigés, vérifié sur relevés réels |
| Sélecteur de contexte (Neutre / Roaming / DPS / PvP) | ✅ Fonctionnel — bloc « 0. Contexte du build » + pondération des stats |
| Export DIM | 🔵 Mis de côté (erreurs API sans détail exploitable) |

---

## Points de vigilance et outils de diagnostic

### Équipement — un point à surveiller (résolu, cause identifiée)

Un échec d'équipement systématique (« Signal perdu », `DestinyItemNotFound`,
ErrorCode 1623) a occupé une bonne partie de la session du 05/08. **Cause
confirmée** : l'`itemInstanceId` sauvegardé dans un loadout référençait un
exemplaire de l'arme depuis démantelé et remplacé — pas un bug d'équipement
ou de transfert. Confirmé de deux façons indépendantes : `Destiny2.GetItem`
répond directement que l'exemplaire n'existe plus (voir plus bas), et
l'indicateur « objet(s) introuvable(s) sur le compte » de l'appli
détectait déjà correctement ce cas.

**Aucun correctif de code n'a été nécessaire** pour ce cas précis — la
« réparation automatique » des loadouts (bouton **🔧 Réparer
automatiquement**, sous l'avertissement « objet(s) introuvable(s) »)
retrouve l'exemplaire actuel du même objet et corrige le loadout en un
clic.

⚠️ **À surveiller** : si un échec `DestinyItemNotFound` réapparaît sur un
objet qui n'affiche PAS l'avertissement « introuvable » (donc que l'appli
croit valide), ce serait un signe que le bug est différent de celui déjà
résolu — utiliser le diagnostic ci-dessous avant de conclure à autre chose.

### Diagnostic « Vérifier un objet chez Bungie » (mode dev)

Bouton disponible dans **Mon Build**, à côté du bouton d'équipement
(visible uniquement en mode développement). Interroge Bungie
**directement** sur un `itemInstanceId` précis, sans tenter aucun transfert
ni équipement — sert à savoir si un objet existe encore réellement sur le
compte, indépendamment de toute autre requête.

**Utilisation** :
1. Cliquer sur **🔍 Vérifier un objet chez Bungie (dev)**.
2. Une fenêtre demande l'`itemInstanceId` à vérifier — le copier depuis le
   message d'erreur d'un échec d'équipement (visible dans le diagnostic
   entre crochets, ex : `itemInstanceId=6917530198022312588`).
3. Le résultat s'affiche dans une fenêtre : `objetTrouve: true` confirme
   que l'objet existe toujours (le problème vient alors de la requête
   d'équipement elle-même) ; `objetTrouve: false` avec `DestinyItemNotFound`
   confirme un identifiant périmé (utiliser la réparation automatique).

Un second diagnostic (`verifierPrecisionItemInstanceId`) s'exécute
**automatiquement** au chargement de l'inventaire (mode dev, aucune action
requise) : vérifie qu'aucun grand identifiant (au-delà de la précision
entière sûre de JavaScript) n'est corrompu par la désérialisation JSON.
Résultat visible dans la console du navigateur.

---

## Travailler sur plusieurs conversations Claude

⚠️ **Découvert le 26/08/2026** : Claude.ai limite chaque conversation à
**20 pièces jointes au total** (pas par message — un budget cumulé sur
toute la durée de l'échange). Un audit de fragments à base de captures
d'écran, comme celui du fichier `knowledge-base/25_AUDIT_FRAGMENTS.md`,
atteint vite cette limite.

**Convention adoptée** :
- Les fichiers **stables** du projet (le ZIP de l'appli, `TODO.md`,
  `CHANGELOG.md`, `README.md`, le dossier `knowledge-base/`) vont dans la
  section **Fichiers** du Projet Claude — pas de limite de nombre là-bas,
  disponibles automatiquement dans toute nouvelle conversation du même
  Projet, sans avoir à les renvoyer.
- Les captures d'écran **ponctuelles** (fragments à auditer, une image
  d'artefact...) restent dans le fil de conversation — usage unique, plus
  besoin une fois intégrées aux fichiers de référence.

**Quand la limite est atteinte en cours de route** : ouvrir une nouvelle
conversation dans le même Projet. ⚠️ Chaque conversation a son PROPRE bac à
sable, entièrement isolé des autres : une conversation ignore tout
changement fait dans une autre, même dans le même Projet. Pour transférer
du travail d'une conversation à l'autre, transmettre un **ZIP unique**
(l'archive elle-même ne compte que comme UNE pièce jointe, quel que soit
son contenu) — la conversation destinataire compare avec son propre état
et fusionne, plutôt que d'écraser.

---

## Notes de conception

### Pondération des 5 piliers — note de conception historique (août 2026)

> ⚠️ **Dépassé — conservé pour l'historique de la réflexion.** Le « 20 %
> partout » et la « piste non implémentée » décrits ci-dessous ont été
> remplacés par une **pondération par contexte de build**, implémentée
> (voir la section « Le scoring : conception et calibration »). Les
> piliers ont aussi été renommés et réordonnés le 06/09/2026 : Élément et
> Doctrine, Artefact, Armes et Armures, Effets du Build (ex-« Verbes
> d'Élément »), Statistiques.

Le 20% partout est un choix simple et défendable, mais probablement pas ce
qui reflète le mieux ce qui fait un bon build selon le consensus des
créateurs de contenu Destiny 2 (guides, theorycraft, etc.) :

- **Doctrine + Verbes d'Élément** sont généralement le vrai "moteur" du
  build (la boucle proc → verbe → payoff) et mériteraient plus de poids
  (~25-30% chacun) que les autres piliers.
- **Statistiques** reste indispensable, mais plus ajustable a posteriori
  une fois la boucle de gameplay choisie — plus une couche d'optimisation
  qu'une couche fondatrice.
- **Perks d'Artefact** est un multiplicateur sur une boucle déjà existante,
  rarement ce qui définit un build à lui seul.
- **Loot & Cohérence** (bonus de Set inclus) est le plus optionnel des
  cinq — Bungie les conçoit eux-mêmes comme un plus, pas un passage obligé.

Piste (non implémentée) si on voulait s'écarter du 20% partout :
25/25/15/15/20 (Doctrine/Verbes/Artefact/Loot/Stats) plutôt qu'égal.

**Réserve importante** : la "bonne" pondération dépend du contexte d'usage
(voir ci-dessous) — un poids fixe unique ne peut jamais être universellement
correct, juste un compromis raisonnable.

### Piste future : pondération selon le contexte du build

Idée à explorer : un sélecteur de contexte qui ajuste les poids des 5
piliers en conséquence, plutôt qu'un 20% figé pour tous les usages :

- **PvE roaming / démobage** : Verbes d'Élément et Doctrine comptent
  probablement plus (l'AoE et la boucle de survie priment sur le DPS pur).
- **PvE DPS (boss)** : Statistiques (dégâts, cooldowns) et Perks d'Artefact
  probablement plus déterminants ; les Verbes d'Élément moins critiques
  si la cible ne meurt pas assez vite pour en profiter.
- **PvP** : Statistiques d'armes/mêlée et Doctrine (survie, mobilité)
  probablement dominantes ; Perks d'Artefact et bonus de Set généralement
  moins pertinents qu'en PvE.

Pas encore implémenté — nécessite de définir un jeu de poids par contexte
(actuellement figés à 20% dans `POIDS_PAR_PILIER`, `lib/scoring/pillars.ts`)
et un sélecteur dans l'UI pour choisir le contexte actif.

**Note de l'utilisateur à prendre en compte lors de l'implémentation** :
la stat "Arme" (une des 6 stats du Pilier 5) est, à ce jour, moins utile en
pratique que la Santé et les autres stats — il faudra en tenir compte dans
la façon dont le Pilier 5 est noté selon le contexte choisi (probablement
un poids plus faible pour "Arme" par rapport aux autres stats, plutôt qu'un
poids égal entre les 6).

### La classe (Titan/Chasseur/Arcaniste) ne doit PAS influencer le score

Principe de conception à respecter dans tout le moteur de scoring : la
classe détermine le **pool d'options disponibles** (quels supers, aspects,
fragments existent pour ce personnage), pas la qualité du build en tant
que telle. Un Chasseur et un Arcaniste avec des choix équivalents en
cohérence doivent obtenir le même score.

Le rôle utile de la classe est la **validation**, pas le scoring : vérifier
qu'un aspect/fragment/super sélectionné existe bien pour la classe choisie,
et signaler une incohérence sinon. Aucune classe n'est sélectionnée par
défaut — un message invite à en choisir une avant de construire un build.

---

## Le scoring : conception et calibration

> ⚠️ **Ce que le score est, et ce qu'il n'est pas**
>
> Le score évalue la **cohérence théorique** d'un build à partir des données du
> Manifest : les stats s'additionnent-elles vers quelque chose d'utile, les
> verbes d'élément forment-ils une boucle, les bonus de set servent-ils le
> reste ?
>
> Il **ne remplace en aucun cas l'expérimentation en jeu**. Un build noté 95
> peut être désagréable à jouer ; un build noté 60 peut être excellent entre
> vos mains. L'appli ne mesure ni le ressenti, ni votre style de jeu, ni le
> contexte d'une activité précise, ni les interactions que Bungie n'a pas
> documentées. Considérez-le comme un avis de second regard, pas comme un
> verdict.

### Contexte de build

Un sélecteur (**Neutre · PvE Roaming · PvE DPS · PvP**) ajuste deux choses : le
poids de chaque pilier, et le poids de chaque statistique.

**Poids des piliers selon le contexte (%)**

| Pilier | Neutre | Roaming | DPS | PvP | Pourquoi ce poids |
|---|---|---|---|---|---|
| 1. Élément & Doctrine | 10 | 10 | 10 | 10 | Mesure la **validité et la complétude**, pas la qualité |
| 2. Verbes d'Élément | 30 | 35 | 25 | 20 | C'est là qu'est la **vraie cohérence** du build |
| 3. Perks d'Artefact | 15 | 15 | 15 | 10 | Formule encore imprécise, poids volontairement modéré |
| 4. Loot & Cohérence | 20 | 20 | 20 | 20 | Porte la **cohérence transversale** (voir plus bas) |
| 5. Statistiques | 25 | 20 | 30 | 40 | Données réelles et fiables, décisives en DPS et PvP |

**Pourquoi le Pilier 1 ne pèse que 10 %.** Il vérifie qu'une doctrine est
valide et complète — les bons nombres d'aspects et de fragments, des éléments
cohérents entre eux. C'est de la **conformité, pas de la qualité** : un build
valide et complet n'est pas un bon build, c'est un build correctement rempli.
La substance réelle d'une doctrine réside dans les verbes qu'elle génère, et
ceux-ci sont déjà mesurés par le Pilier 2. Lui donner 20-25 % reviendrait à
noter deux fois la même chose.

**Variation par contexte** : en roaming la boucle de gameplay prime (Verbes à
35) ; en DPS la fenêtre est courte et la puissance brute décide (Stats à 30) ;
en PvP les stats et la survie dominent, et l'artefact ne sert presque à rien.

### Pondération personnalisée (depuis la v0.2.8)

Les poids ci-dessus restent le réglage par défaut, appelé **« Automatique
(selon le contexte) »**. Dans le bloc « 0. Contexte du build », le bouton
**✏️ Personnaliser…** permet de créer ses propres réglages :

- un poids en pourcentage entier par pilier, **total obligatoirement égal
  à 100 %** (l'enregistrement est refusé sinon) ;
- un **nom** pour le réglage ; un réglage portant le nom d'un réglage
  existant le remplace, pour pouvoir le corriger sans doublon ;
- le réglage enregistré devient **actif** ; le menu « Pondération » permet
  ensuite de passer de l'un à l'autre, ou de revenir en Automatique.

Ce qu'un réglage personnalisé change, et ce qu'il ne change pas :

- il remplace les poids du contexte **dans le score global uniquement** ;
  le tableau des poids et chaque carte de pilier affichent alors les poids
  réellement utilisés ;
- il ne modifie **aucun score de pilier** ;
- le contexte continue de régler **la pondération des statistiques** au
  sein du pilier Statistiques (c'est un autre réglage) ;
- c'est une **préférence globale** (enregistrée dans le stockage local),
  pas une propriété de chaque build : elle s'applique à tout build affiché.

Sans réglage actif, le calcul est strictement identique à avant (vérifié
sur les 4 contextes). Code : `src/lib/scoring/ponderations.ts`, et le
paramètre facultatif `poidsPersonnalises` de `evaluerBuild`. La table
`POIDS_PILIERS` n'a pas changé : elle reste le miroir du tableau ci-dessus.

### Le Pilier 1 alimente le Pilier 4 (pas de double lecture)

Le Pilier 1 **expose** ses données résolues — élément de la doctrine, aspects,
fragments, capacité en fragments — plutôt que de les garder pour lui. Le
Pilier 4 les consomme pour évaluer la cohérence transversale. Deux raisons :
éviter de relire le Manifest deux fois, et surtout éviter que les deux piliers
divergent sur l'interprétation d'une même donnée.

### Composition du Pilier 4 — Loot & Cohérence

Le Pilier 4 est le seul à voir **plusieurs blocs du build à la fois** : c'est de
là que vient sa valeur, pas de ce qu'il évaluerait isolément.

**Poids des composantes selon le contexte (%)**

| Composante | Neutre | Roaming | DPS | PvP | Rôle |
|---|---|---|---|---|---|
| Bonus de set | 35 | 30 | 35 | **75** | Paliers 2/4 réellement atteints |
| Couverture anti-champion | 50 | 55 | 50 | **0** | Types de Champion neutralisables |
| Cohérence élémentaire | 15 | 15 | 15 | **25** | Armes accordées à la doctrine |

**En PvP, les Champions n'existent pas** : la composante disparaît au lieu
d'être notée à zéro (ce qui pénaliserait injustement), et son poids est
redistribué sur les deux autres.

**Validité** — traitée à part, hors pondération : plus d'un exotique d'arme ou
d'armure rend la configuration **impossible en jeu**. Ce n'est pas un défaut à
nuancer, c'est un build qui ne peut pas exister : pénalité bloquante.

### Couverture anti-champion : barème progressif

| Types couverts | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Points** | 0 | **40** | **80** | **100** |

Progression volontairement forte sur les deux premiers types. Une activité
présente rarement les trois Champions : passer de un à deux types couverts
change beaucoup plus le confort de jeu que passer de deux à trois. Le barème
récompense donc l'ouverture d'un second contre plus que la complétion du
troisième.

### Cohérence élémentaire : pourquoi elle reste légère (15 %)

L'intuition serait d'exiger que toutes les armes correspondent à l'élément de
la doctrine. **Ce serait un mauvais conseil**, pour trois raisons :

- une arme **cinétique** n'a pas d'élément et reste excellente — la pénaliser
  n'aurait aucun sens ;
- beaucoup de bons builds mélangent volontairement les éléments ;
- depuis la **9.7.0**, l'anti-champion ne dépend plus de l'élément : le
  principal argument en faveur du monochrome a disparu.

La correspondance est donc **légèrement récompensée**, jamais l'écart
pénalisé, et le cinétique n'est jamais sanctionné. Une appli qui pousserait
vers des builds monochromes appauvrirait le jeu au lieu d'aider.

### Ce que le Pilier 4 ne fait PAS

**Il ne juge pas la synergie des perks.** Celle-ci se lit dans les verbes
d'élément, et le Pilier 2 l'analyse déjà — y compris sur les perks d'armes, via
sa détection source/payoff. La re-noter ici compterait deux fois la même
qualité et gonflerait artificiellement les bons builds.

**Il n'utilise pas les archétypes d'armure** (Powerhouse, Grenadier…), bien que
la base de connaissance les documente. Raison : le Pilier 5 note déjà les stats
obtenues, et il le fait sur des **valeurs réelles** là où l'archétype n'exprime
qu'une **intention**. À reconsidérer seulement si le Pilier 5 se révèle
insuffisant.

> ⚠️ **Risque identifié : le fourre-tout.** Le Pilier 4 est celui où tout ce
> qui ne rentre nulle part risque d'atterrir. Six composantes agrégées en un
> chiffre n'apprendraient plus rien à personne. Il est donc volontairement
> limité à **trois composantes**, dont les sous-scores sont affichés
> séparément pour qu'on voie d'où vient le résultat.

### Couverture anti-champion — les trois sources

Un build capable de neutraliser les **trois** types de Champion (Bloqueur,
Implacable, Surchargé) vaut mieux qu'un build qui n'en couvre qu'un — sauf en
**PvP**, où les Champions n'existent pas : la couverture y est ignorée plutôt
que récompensée.

⚠️ **L'anti-champion ne vient pas que des armes.** Certaines capacités de
doctrine et certaines armures exotiques en fournissent également (la base de
connaissance recense 13 armures exotiques concernées). Ne compter que les
armures et armes serait donc faux, et sous-noterait des builds valides. Cette
partie du calcul devra examiner :

- les armes équipées (déjà en place, via l'armature — voir plus bas) ;
- les **armures exotiques** dont le perk fournit un contre ;
- les **capacités de doctrine** correspondantes.

**Piste : les jetons du jeu.** Une capture d'écran de la Companion App montre
que le jeu écrit « Efficace contre les **[Chancellement]** Champions
implacables » — avec un **jeton entre crochets** avant l'adjectif. Ces jetons
sont probablement un signal plus fiable que l'adjectif français, qui varie en
genre et en nombre (« implacable » / « implacables »). À vérifier sur les trois
types avant d'en faire la méthode principale ; l'adjectif reste le repli.

⚠️ **Prudence sur les capacités de doctrine** : la source consultée
(shatteredvault.com) présente ces contres dans une section datée « Lightfall »,
contredite par sa propre section 9.7.0 sur Radiant/Volatile. Ces
correspondances doivent être **vérifiées en jeu** avant d'entrer dans le score
— voir `knowledge-base/13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`.

**Poids des statistiques selon le contexte**

| Stat | Neutre | Roaming | DPS | PvP |
|---|---|---|---|---|
| Santé | 1,2 | 0,3 | 0,3 | 1,8 |
| Mêlée | 1,0 | 1,2 | 0,7 | 1,3 |
| Grenade | 1,2 | 1,5 | 1,2 | 1,4 |
| Super | 1,0 | 1,0 | 1,8 | 0,7 |
| Classe | 1,0 | 1,3 | 0,8 | 1,3 |
| Arme | 0,6 | 1,7 | 1,7 | 0,5 |

⚠️ **Corrigé (24/08/2026)** — trois vagues d'ajustements après revue des
coefficients : la Santé s'est révélée bien moins déterminante que prévu en
Roaming et DPS ; l'Arme plus utile qu'estimé en Roaming (même poids qu'en
DPS), mais moins décisive que prévu en PvP, où c'est plutôt la Grenade qui
compte davantage.

### Pourquoi une moyenne pondérée plutôt qu'une moyenne simple

L'ancienne formule faisait la moyenne des 6 paliers. Conséquence : un build
tiède partout battait un build spécialisé — l'inverse de ce que récompense
Destiny. Avec la pondération, un T20 Grenade rapporte beaucoup en roaming et
peu en DPS : la spécialisation est valorisée, mais seulement si elle porte sur
la bonne chose.

### Calibration de l'échelle : pourquoi 500 et pas 1200

Le total des stats d'un set **pleinement optimisé** se calcule à partir de la
section « Armor 3.0 » de `knowledge-base/08_GAME_MECHANICS.md` :

| Source (par pièce) | Apport |
|---|---|
| Stat primaire (intrinsèque) | 30 |
| Stat secondaire (intrinsèque) | 25 |
| Stat tertiaire | 20 |
| Masterwork T5 + Balanced Tuning (3 stats × 6) | 18 |
| Stat Mod majeur | 10 |
| **Total par pièce** | **≈ 103** |

Soit **≈ 515 points sur 5 pièces**, répartis sur les 6 statistiques.

Or le maximum théorique (6 stats × T20) vaut **1200**. Normaliser là-dessus
donnerait à un stuff parfait un score de **515 / 1200 ≈ 43 %** — tous les
builds se tasseraient en bas de l'échelle et le score perdrait tout pouvoir
discriminant.

**L'échelle est donc calibrée sur 500**, valeur d'un set optimisé. Un excellent
build approche 95-100, un build correct tourne vers 70, un build négligé vers
40.

### Deux pièges de calibration à connaître

**Les Fonts ne comptent pas.** Ils ajoutent environ +40 en combat, mais
**n'apparaissent pas dans les stats affichées hors combat** — et c'est ce que
lit l'appli. La référence de 500 porte donc sur les stats statiques ; la caler
sur le total « virtuel » ferait paraître tous les builds incomplets.

**La stat tertiaire n'est jamais l'une des deux intrinsèques.** Contrainte
structurelle confirmée sur données réelles, utile pour repérer une armure mal
lue ou une donnée aberrante.

### Piste non encore exploitée : les archétypes

`knowledge-base/08_GAME_MECHANICS.md` documente les **12 archétypes d'armure**
(Powerhouse = Weapons/Super, Grenadier = Grenade/Super, etc.). C'est
exploitable pour la cohérence : une pièce Powerhouse dans un build orienté
grenade est un mauvais choix, indépendamment de son total de stats. Prévu pour
enrichir le Pilier 4, aujourd'hui limité au comptage d'exotiques.

---

## Comment tester une fois connecté

1. Cliquez sur **Connexion Bungie.net**, autorisez l'accès sur la page Bungie.
2. De retour sur l'appli, le statut doit passer à **✅ connecté**.
3. Votre nom Bungie (`pseudo#1234`) s'affiche à gauche des boutons, après
   « Compte : ». S'il s'affiche, la connexion API fonctionne. Le bouton
   **Tester la connexion** relance ce chargement si besoin.
4. En cas d'erreur affichée, copiez le message et revenez me voir — la plupart
   des erreurs à ce stade viennent d'un scope OAuth mal coché sur bungie.net
   ou d'une clé API mal recopiée.

### Points en cours de test en conditions réelles (en jeu)

⚠️ Ces points ne peuvent être vérifiés que par l'utilisateur, en jouant —
Claude n'a pas d'accès à un compte Bungie réel dans son environnement de
développement. Statut au 27/08/2026 (checklist complète dans
`A-TESTER.pdf`) :

- **Bonus de ressources du Pilier 2** (`✨`) — à confirmer sur un build qui
  génère plusieurs types de ressources distincts (mêlée + grenade par
  exemple).
- **Confort — gestion d'erreur réseau à l'auto-chargement des
  sous-classes** — le cas nominal (chargement automatique, changement
  rapide de classe) est confirmé fonctionnel ; reste à tester une vraie
  coupure réseau pendant le chargement (bouton "Réessayer").
- **Correctifs de la passe d'audit du scoring (26/08)** — barème orphelin
  (6 pts au lieu de 0) et liens conditionnels plus robustes : logique
  vérifiée par script isolé, pas encore observée sur un vrai build en jeu.

---

## Tests rapides sans lancer l'appli (fixtures)

Pour valider juste la logique Manifest (recherche, détection de verbes)
sans passer par un vrai téléchargement de ~200 Mo :

```bash
node scripts/tester-avec-fixtures.mjs
```

**2 conditions :**
- Être dans le dossier du projet (terminal ouvert dedans, comme pour `npm run dev`)
- `npm install` déjà fait au moins une fois (le script importe `sql.js`,
  même s'il n'utilise pas de vraies données Bungie)

**Ce que ça teste** : uniquement `obtenirDefinition`, la recherche
(bilingue FR/EN), et la détection des verbes d'élément — sur des données
factices mais au bon format (`test-fixtures/manifest-mock.json`).
**Ce que ça NE teste PAS** : la connexion Bungie, l'inventaire réel,
l'interface, ni rien de visuel. Un test ciblé et rapide, pas un
remplacement de `npm run dev`.

---

## Prochaines étapes

Voir `TODO.md` pour la liste priorisée et à jour de ce qui reste à faire.

---

## Apprentissages techniques clés

Quelques pièges rencontrés qui valent d'être gardés en tête pour la suite
du développement (détails complets dans `CHANGELOG.md`) :

- **Hash Bungie signés vs non signés** : stockés en SQLite comme des
  entiers 32 bits signés, alors que l'API les renvoie non signés — sans
  conversion, ~50% des recherches par hash échouent silencieusement.
- **`defaultDamageType` des sous-classes est toujours à 0** pour les 3
  classes — aucun champ Manifest fiable ne donne l'élément d'une
  sous-classe. Solution retenue : table de hash codée en dur, construite à
  partir de diagnostics réels partagés par l'utilisateur.
- **Options de socket à rolls aléatoires** : `randomizedPlugSetHash`
  (distinct de `reusablePlugSetHash`) est nécessaire pour résoudre les
  perks à rolls aléatoires (barillet/munitions/perks d'arme) — un champ
  facile à manquer.
- **Icônes absentes du Manifest** : `DestinyClassDefinition` et
  `DestinyItemCategoryDefinition` ont `"hasIcon": false` pour les classes
  et catégories d'objets — ces icônes doivent être fournies séparément
  (SVG) plutôt que résolues depuis le Manifest.
- **`<summary>` + `display: flex` direct** supprime le triangle natif de
  repli — toujours mettre le flex sur un élément interne (`<span>`).
- **`<select>` HTML natif** ne peut afficher que du texte dans ses
  `<option>`, jamais une image — contrainte à garder en tête pour toute
  future UI de filtre avec icônes.
