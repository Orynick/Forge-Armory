# Chaînes de verbes — matière pour le Pilier 2

Chantier de fond : l'analyse actuelle du Pilier 2 raisonne **verbe par
verbe**, sans voir les enchaînements (ex : Blessure solaire → Embrasement).
Ce fichier rassemble, élément par élément, ce que produit et consomme
chaque verbe — connaissance du jeu, non déductible du seul texte des perks,
fournie et validée par l'utilisateur au fil des sessions.

## Méthode et vocabulaire

⚠️ Convention uniforme (24/08/2026, demande de l'utilisateur : « Uniformité
= lisibilité », ordre des champs revu le 24/08/2026) : chaque verbe suit le
format

**Nom français (Nom anglais)**  
- Produit : un AUTRE verbe de cette liste que celui-ci déclenche ou
  alimente, s'il y en a. Peut être **inconditionnel** (toujours vrai) ou
  **conditionnel** (nécessite un fragment/aspect précis équipé — auquel cas
  la détection de chaîne devra vérifier sa présence réelle dans le build,
  pas supposer le lien actif par défaut).
- Consomme : ce dont ce verbe a besoin pour se déclencher, quand
  applicable.
- Remarque : note additionnelle si pertinente (intérêt en PvP, structure
  particulière…) — laissé vide sinon.
- Description : la description officielle du jeu, citée telle quelle —
  source de vérité, à préférer à toute supposition ou source externe en
  cas de désaccord.

Quand un verbe produit de l'énergie d'aptitude, préciser LAQUELLE (mêlée /
grenade / compétence de classe / générique) plutôt qu'une case
« ressource » vague — utile pour des chaînes précises.

---

## Liste des verbes identifiés, avec leurs variantes de détection

⚠️ Cette liste reflète désormais l'ÉTAT RÉEL du catalogue de détection du
code (`elementVerbs.ts`, 35 entrées) après la passe de synchronisation du
24/08/2026 — noms ET mots-clés de détection à jour, plus seulement les
noms. Les variantes listées sont les racines/mots que le code recherche
réellement dans le texte du Manifest.

**Solaire**
- Blessure solaire : consume, scorch, blessure solaire
- Embrasement : ignition, embrasement
- Radiance : radieux, radiance
- Restauration : restauration
- Soin : soin, cure
- Feu follet : feu follet, feux follets

**Cryo-électrique**
- Secousse : electrocut, jolt, secousse
- Cécité : aveugl, cecit
- Amplifié : amplifi
- Charge éclair : charge eclair, charges eclair
- Piste ionique : piste ionique, pistes ioniques

**Abyssal**
- Affaiblissement : affaibli
- Volatil : volatil, volatile, volatiles
- Neutralisation : supprim, suppression, neutralis
- Dévoration : devoration
- Invisibilité : invisibilite
- Surbouclier : surbouclier
- Brèche abyssale : breche abyssale, breches abyssales

**Stase**
- Ralentissement : ralenti
- Gel : gel, gele
- Armure de Givre : armure de givre
- Cristal de Stase : cristal de stase, cristaux de stase
- Brisure : brisure, se brise, se briser
- Éclat stasique : eclat stasique, eclats stasiques

**Filobscur**
- Sectionnement : rupture, sectionn
- Suspension : suspens, suspend
- Maille tissée : maille tissee, cotte tissee
- Enchevêtrement : enchevetr
- Brindille : brindille
- Effilochage : effiloch

**Prismatique**
- Transcendance : transcendance, transcendant
- Grenade prismatique (Chasseur) — Pic Grêle de Feu : pic grele de feu
- Grenade prismatique (Titan) — Piège Électrifiant : piege electrifiant
- Grenade prismatique (Arcaniste) — Singularité Glacée : singularite glacee

**Sans élément (ressources transversales)**
- Charge d'armure : charge d'armure, charges d'armure, ramassage d'orbe, orbe de lumiere, orbe de pouvoir
- Surcharge d'arme : surcharge
- Source d'aptitude : source de super, source de grenade, source de melee, siphon

---


## Solaire

**Blessure solaire (Scorch)**  
- Produit : Embrasement, à 100 stacks
- Consomme : rien
- Remarque :
- Description : *« La cible est brûlée par une Lumière solaire destructrice et subit des dégâts avec le temps. Ces dégâts augmentent en même temps que la cible cumule plus de Blessures solaires. »*

**Embrasement (Ignition)**  
- Produit : Blessure solaire sur les cibles touchées, *si le fragment Tison de Charbon est équipé* (conditionnel)
- Consomme : 100 stacks de Blessure solaire
- Remarque : ✅ **Condition CONFIRMÉE le 25/08/2026** — description officielle du
  fragment Tison de charbon transmise par l'utilisateur (capture DIM) :
  *« Vos Embrasements solaires infligent des Blessures solaires aux cibles
  touchées. »* Codé dans `elementVerbs.ts` (`produit` sur `ignition`).
  📌 Donnée communautaire vue sur la même capture (DIM, pas officielle
  Bungie) : les Embrasements confèrent 40 stacks de Blessure solaire (60
  avec Tison de charbon équipé) aux cibles touchées par l'explosion. Notée
  ici à titre indicatif, jamais vérifiée par une source officielle — à ne
  pas coder comme une valeur de jeu certaine.
- Description : *« Une grande explosion solaire qui inflige des dégâts dans une zone autour de la cible et étourdit les Champions Implacables. »*

**Radiance (Radiant)**  
- Produit : aucun
- Consomme : rien
- Remarque :
- Description : *« Vos armes sont améliorées par le pouvoir de Voyageur et infligent plus de dégâts aux combattants. Sous l'effet de Radiance, vos armes percent les boucliers des Champions Bloqueurs et les étourdissent. »*

**Soin (Cure)**  
- Produit : aucun
- Consomme : rien
- Remarque :
- Description : *« Vous guérissez dans un éclat de Lumière solaire bienfaitrice. »*

**Restauration (Restoration)**  
- Produit : aucun
- Consomme : rien
- Remarque :
- Description : *« Votre santé et vos boucliers se régénèrent au fil du temps. Ne peut être interrompu en subissant des dégâts. »*

**Feu follet (Firesprite)**  
- Produit : énergie de grenade, au ramassage
- Consomme : rien — apparaît au sol
- Remarque :
- Description : *« Une concentration lumineuse d'énergie solaire. Quand on les ramasse, les Feux follets confèrent de l'énergie de grenade. »*

---

## Cryo-électrique

⚠️ Noms français corrigés par l'utilisateur — ne jamais dire « Arc »
(anglicisme), l'élément se nomme Cryo-électrique.

**Secousse (Jolt)**  
- Produit : aucun lien connu vers un autre verbe de cette liste
- Consomme : rien
- Remarque :
- Description : *« La cible est énergisée par une Lumière cryo-électrique destructrice. Sous l'effet de Secousse, elle subit des dégâts supplémentaires et inflige la foudre en chaîne aux cibles proches.  
  Les dégâts de Secousse étourdissent les Champions Surchargés. »*

**Cécité (Blind)**  
- Produit : aucun lien connu
- Consomme : rien
- Remarque : notée par l'utilisateur comme potentiellement intéressante en PvP
- Description : *« Les combattants sont désorientés et ne peuvent pas tirer. L'interface des Gardiens adverses est retirée et leur vision obscurcie.  
  Lorsqu'ils sont aveuglés, les Champions Implacables sont étourdis. »*

**Amplifié (Amplified)**  
- Produit : aucun lien connu
- Consomme : éliminations rapides avec des dégâts cryo-électriques (condition d'obtention, pas un verbe de cette liste)
- Remarque :
- Description : *« Votre vitesse de déplacement et votre maniement d'arme sont grandement améliorés. Après un court sprint, votre vitesse de mouvement augmente encore.  
  Éliminer des cibles rapidement avec des dégâts cryo-électriques vous confère Amplificateur. »*

**Charge éclair** *(nom anglais à confirmer, ex : Ionic Charge ?)*  
- Produit : énergie de mêlée, à chaque cumul obtenu ; éclair cryo-électrique sur cible (à cumul max, déclenché par un dégât de compétence)
- Consomme : dégâts d'arme continus (pour accumuler davantage tant qu'actif)
- Remarque : premier verbe à la fois producteur ET consommateur en boucle (dégâts d'arme → plus de cumuls → à terme, éclair sur dégât de compétence) — structure plus riche que tout ce qui précède, à garder en tête pour la conception du graphe
- Description : *« Obtenez des cumuls de Charge éclair cryo-électrique. Lorsque vous disposez de Charge éclair, les dégâts d'armes continus génèrent des cumuls de Charge éclair. Lorsque les cumuls sont au maximum, tous les dégâts de compétences génèrent un puissant éclair cryo-électrique à l'emplacement de la cible.  
  Obtenir un cumul de Charge éclair vous confère de l'énergie de mêlée. »*

**Piste ionique (Ionic Traces)**  
- Produit : énergie de compétence générique, au ramassage
- Consomme : rien — apparaît au sol
- Remarque :
- Description : *« Un éclair de pure énergie cryo-électrique qui se déplace le long du sol et cherche son créateur. Quand elles sont ramassées, les Pistes ioniques confèrent de l'énergie de compétence. »*

---

## Abyssal

⚠️ **Neutralisation** (pas « Suppression ») — même type de correction que
Arc/Cryo-électrique : « Suppression » semble être l'anglicisme resté en
place dans le catalogue de détection actuel du code (`elementVerbs.ts`),
alors que le vrai terme français est Neutralisation. À corriger dans le
code lors d'une prochaine passe sur le catalogue.

**Affaiblissement (Weaken)**  
- Produit : aucun lien connu
- Consomme : rien
- Remarque : mots-clés de détection à inclure aussi : « affaiblir », « affaiblit »
- Description : *« La cible reçoit plus de dégâts et ses mouvements sont ralentis. »*

**Neutralisation (Suppression)**  
- Produit : aucun lien connu vers un autre verbe de cette liste
- Consomme : rien
- Remarque : étourdit aussi les Champions Surchargés à l'application ; mots-clés de détection à inclure aussi : « neutraliser », « neutralisé »
- Description : *« La cible est privée de toute compétence active, elle ne peut activer aucune compétence ni mode de mouvement pendant que la Neutralisation est active. Les combattants touchés ne peuvent pas utiliser leurs armes.  
  Quand ils sont neutralisés, les Champions Surchargés sont aussi étourdis. »*

**Volatile (Volatile)**  
- Produit : aucun lien connu vers un autre verbe de cette liste
- Consomme : rien
- Remarque : les munitions volatiles d'armes abyssales percent et étourdissent les Champions Bloqueurs
- Description : *« La cible est affectée par de l'énergie abyssale instable et explosera si elle reçoit des dégâts supplémentaires.  
  Les munitions volatiles de vos armes abyssales percent les boucliers des Champions Bloqueurs et les étourdissent. »*

**Dévoration (Devour)**  
- Produit : santé (restauration), énergie de **grenade**, et prolonge sa propre durée — les trois à chaque élimination
- Consomme : éliminations (condition d'obtention/entretien, pas un verbe de cette liste)
- Remarque : verbe auto-entretenu — chaque élimination sous Dévoration prolonge Dévoration elle-même, tant que les éliminations continuent
- Description : *« Régalez-vous de l'énergie de vos ennemis vaincus. Les frags restaurent de la santé, vous octroient de l'énergie de grenade et prolongent Dévoration. »*

**Invisibilité (Invisibility)**  
- Produit : aucun
- Consomme : rien — prend fin sur action offensive
- Remarque : utile aussi en PvP
- Description : *« Vous disparaissez du champ de vision et n'apparaissez plus sur le radar. Lorsque vous êtes invisible, la portée de votre radar est réduite. Réaliser des actions offensives mettra fin à l'invisibilité. »*

**Surbouclier (Overshield)**  
- Produit : aucun
- Consomme : rien
- Remarque : utile en PvP
- Description : *« Une barrière de Lumière abyssale vous protège, elle réduit les dégâts reçus de la part des combattants. »*

**Brèche abyssale** *(nom anglais à confirmer)*
- Produit : énergie de **compétence de classe**, au ramassage
- Consomme : rien — apparaît au sol
- Remarque :
- Description : *« Une rupture dimensionnelle regorgeant d'énergie abyssale. Quand vous les ramassez, les Brèches abyssales octroient de l'énergie de compétence de classe. »*

⚠️ Aucun verbe abyssal ne produit un AUTRE verbe abyssal de cette liste
(contrairement à Blessure solaire → Embrasement) — tous sont des effets
indépendants, chacun avec sa propre production de ressource ou son propre
effet de contrôle.

---


## Stase

⚠️ **Premier élément avec un vrai RÉSEAU de chaînes internes**, pas juste
une chaîne linéaire isolée (Blessure solaire → Embrasement) : Ralentissement
ET Cristal de Stase produisent TOUS LES DEUX du Gel, qui produit à son tour
Brisure — trois verbes reliés entre eux plutôt que deux. Second point de
convergence confirmé par l'utilisateur : détruire un Cristal de Stase
produit aussi un Éclat stasique, en plus de ses dégâts de zone.

**Armure de Givre (Frost Armor, à confirmer)**
- Produit : aucun lien connu
- Consomme : rien
- Remarque : résistance aux dégâts qui augmente à chaque cumul
- Description : *« Des couches de matière stasique durable vous renforcent, réduisant les dégâts subis. La résistance aux dégâts d'Armure de Givre augmente à chaque cumul supplémentaire. »*

**Ralentissement (Slow)**
- Produit : Gel, après avoir cumulé suffisamment de Ralentissement
- Consomme : rien
- Remarque : étourdit aussi les Champions Implacables ; utile en PvP
- Description : *« La cible voit sa vitesse de mouvement et sa régénération de compétences ralenties. Les performances de ses armes sont réduites.  
  Les Champions Implacables sont étourdis.  
  Après avoir cumulé assez de ralentissements, la cible est gelée. »*

**Cristal de Stase (Stasis Crystal, à confirmer)**
- Produit : Gel sur les combattants proches ET Ralentissement sur les joueurs proches, tous les deux à sa création ; dégâts de zone ET Éclat stasique s'il est détruit
- Consomme : rien — objet posé sur le terrain (source de création externe à cette liste, non détaillée ici)
- Remarque : utile en PvP
- Description : *« Un cristal de stase solidifiée. À sa création, il gèle les combattants proches et ralentir les joueurs proches.  
  Les cristaux peuvent être détruits, infligeant ainsi des dégâts dans la zone. »*

**Brisure (Shatter)**
- Produit : dégâts aux cibles proches (pas un verbe de cette liste)
- Consomme : une cible Gelée qui se brise
- Remarque : étourdit aussi les Champions Implacables
- Description : *« Quand une cible gelée de brise, elle subit des dégâts et en inflige aux cibles proches.  
  Les dégâts de Brisure étourdissent les Champions Implacables. »*

**Gel (Freeze)**
- Produit : Brisure, si la cible gelée subit des dégâts supplémentaires
- Consomme : suffisamment de Ralentissement, OU la création d'un Cristal de Stase à proximité
- Remarque :
- Description : *« La cible est piégée dans la matière stasique et ne peut plus bouger.  
  Si elle subit des dégâts supplémentaires pendant qu'elle est gelée, la cible se brise. »*

**Éclat stasique (Shard of Stasis, à confirmer)**
- Produit : énergie de **mêlée**, au ramassage
- Consomme : rien à ramasser — mais généré par la destruction d'un Cristal de Stase (confirmé par l'utilisateur)
- Remarque :
- Description : *« Un petit éclat stasique qui peut se ramasser pour restaurer l'énergie de mêlée. »*

---


## Filobscur

⚠️ **Enchevêtrement est le plus gros point de convergence de tout le
catalogue** : Suspension, Sectionnement ET Effilochage produisent TOUS LES
TROIS Enchevêtrement (une élimination sous n'importe lequel de ces trois
malus le déclenche) — trois sources vers un même verbe, plus que Gel
(Stase) qui n'en avait que deux.

✅ **« Maille tissée » CONFIRMÉE** (pas « Cotte tissée ») — même type de
correction que Arc/Cryo-électrique et Suppression/Neutralisation. Le
catalogue de détection actuel du code (`elementVerbs.ts`) utilise encore
« Cotte tissée » (`id: "cotte_tissee"`), à corriger dans une prochaine
passe sur le code.

**Suspension (Suspend)**
- Produit : Enchevêtrement, une fois la cible suspendue éliminée
- Consomme : rien
- Remarque : étourdit aussi les Champions Implacables ; utile en PvP ; mots-clés de détection à inclure aussi : « suspendu », « suspension »
- Description : *« La cible est immobilisée par une toile de filobscur qui la soulève dans les airs. Une fois en Suspension, les Gardiens sont incapables de se déplacer librement, les combattants sont incapables de se déplacer ou d'utiliser leurs armes, et les Champions Implacables sont étourdis.  
  Les cibles suspendues se transforment en Enchevêtrement une fois éliminées. »*

**Enchevêtrement (Tangle, à confirmer)**
- Produit : dégâts (si ramassé et lancé, ou détruit) — pas un verbe de cette liste
- Consomme : une élimination sous Suspension, Sectionnement OU Effilochage (n'importe lequel des trois malus filobscur)
- Remarque : mot-clé de détection à inclure aussi : « Enchevêtré »
- Description : *« Un nœud de Filobscur, qui grouille de potentialités. Les Enchevêtrements peuvent être pris pour cibles et détruits, ou bien ramassés et lancés, ce qui inflige des dégâts.  
  Éliminer des cibles affectés par n'importe quel malus de filobscur les transformera en Enchevêtrement. »*

**Brindille (Threadling, à confirmer)**
- Produit : dégâts sur cible poursuivie — pas un verbe de cette liste
- Consomme : rien
- Remarque :
- Description : *« Une créature tissée de pure matière filobscure qui traque les cibles proches et leur inflige des dégâts. »*

**Maille tissée (Woven Mail, à confirmer)**
- Produit : aucun
- Consomme : rien
- Remarque : ⚠️ nom confirmé par l'utilisateur ; le code actuel dit encore « Cotte tissée », à corriger
- Description : *« Votre corps est protégé par une maille protectrice de filobscur serré, qui réduit grandement les dégâts qui ne sont pas de précision. »*

**Sectionnement (Sever)**
- Produit : Enchevêtrement, une fois la cible éliminée
- Consomme : rien
- Remarque : mot-clé de détection à inclure aussi : « sectionné »
- Description : *« La connexion de la cible à son environnement est coupée, les dégâts qu'elle inflige sont nettement réduits.  
  Les cibles sous l'effet de Sectionnement deviennent un Enchevêtrement une fois éliminées. »*

**Effilochage (Unravel)**
- Produit : projectiles traqueurs (si dégâts supplémentaires subis) ; Enchevêtrement, une fois la cible éliminée
- Consomme : rien
- Remarque : ⚠️ CONFIRMÉ anti-Bloqueur par l'utilisateur — le texte cité ci-dessous dit littéralement « Implacables », mais c'est une erreur de transcription : le vrai mécanisme est anti-Bloqueur (cohérent avec le perçage de bouclier, habituellement lié à ce champion). Citation gardée telle quelle par principe (source officielle), mais À NE PAS SUIVRE sur ce point précis. Mots-clés de détection à inclure aussi : « effilochant », « effiloché »
- Description : *« La cible est imprégnée de filobscur destructeur. En subissant des dégâts supplémentaires, elle crée des projectiles effilochants qui traquent les cibles proches.  
  Les munitions effilochantes de vos armes filobscures percent les boucliers des Champions Implacables et les étourdissent.  
  Une fois éliminées, les cibles effilochées deviennent un Enchevêtrement. »*

---

## Prismatique

⚠️ Le Prismatique n'est pas un élément à part entière : il combine des
verbes des autres doctrines. Cette section documente son mécanisme propre
(Transcendance, la grenade prismatique unique) et les regroupements que
l'utilisateur a demandé d'ajouter pour élargir le champ de vision du
catalogue.

**Transcendance**
- Produit : remplace la grenade équipée par la grenade prismatique unique (voir ci-dessous) ; prolonge sa propre durée à chaque élimination sous son effet
- Consomme : éliminations, pour prolonger sa propre durée (auto-entretenu, comme Dévoration)
- Remarque :
- Description : *« Vous résonnez en parfaite harmonie avec la Lumière et les Ténèbres. Vous améliorez ainsi votre régénération de compétences et augmentez vos dégâts d'arme et votre resistance aux dégâts face aux combattants.  
  Votre grenade est remplacée par une grenade prismatique unique combinant plusieurs types de dégâts.  
  Éliminer des cibles quand vous êtes sous l'effet de Transcendance augmente sa durée. »*

**Grenade prismatique — VARIE PAR CLASSE**

⚠️ Précision de l'utilisateur : contrairement à ce qui avait été rédigé
d'abord, la grenade prismatique de Transcendance n'est **pas unique** —
son effet dépend de la CLASSE du personnage. Ce qui suit pour le Chasseur
était présenté à tort comme valable pour tous.

⚠️ **Précision de mécanique de jeu (27/08/2026)** : cette grenade
n'occupe PAS le même emplacement que les 5 grenades élémentaires
classiques (Solaire/Cryo-électrique/Abyssal/Stase/Filobscur) — c'est un
slot à part, **toujours équipé** par construction, mais utilisable
UNIQUEMENT quand la Transcendance est active, moment où elle REMPLACE la
grenade élémentaire normalement équipée. Valable pour les 3 classes. À
garder à l'esprit pour la conception des tests : impossible de "ne pas
avoir" cette grenade, seule son ACTIVATION dépend de la Transcendance.

**Chasseur — Pic Grêle de Feu** *(nom anglais à confirmer)*
- Produit : à l'impact, déclenche SIMULTANÉMENT 2 verbes d'un premier élément et 2 d'un second : **Blessure solaire**, **Embrasement** (Solaire) + **Ralentissement**, **Gel** (Stase)
- Consomme : disponible uniquement sous Transcendance (remplace la grenade normale)
- Remarque : combine Solaire + Stase. Voir la remarque générale ci-dessous sur la structure commune aux 3 classes.
- Description officielle (obtenue le 27/08/2026 via le bouton de diagnostic
  "Copier les compétences de cette doctrine") : *« Pic grêle de feu —
  [Grenade] : Lancez un appareil chargé de matière stasique et d'énergie
  solaire qui s'accroche aux surfaces ou aux cibles, puis explose en une
  tempête ralentissante. Après une courte durée, l'appareil s'enflamme,
  créant un cyclone mortel qui inflige des Blessures solaires. »*

**Titan — Piège Électrifiant**
- Produit : à l'impact, déclenche **Suspension** (Filobscur) et **Secousse** (Cryo-électrique)
- Consomme : disponible uniquement sous Transcendance (remplace la grenade normale)
- Remarque : combine Filobscur + Cryo-électrique.
- Description officielle (27/08/2026, bouton de diagnostic) : *« Piège
  électrifiant — [Grenade] : Lancez un appareil explosif imprégné de
  matière filobscure et d'énergie cryo-électrique qui explose en une
  rafale de Suspension surchargée. La cible suspendue subit de lourds
  dégâts sur la durée et émet des éclairs de Secousse à toutes les cibles
  proches. »*

**Arcaniste — Singularité Glacée**
- Produit : à l'impact, déclenche directement **Neutralisation** (Abyssal) et **Ralentissement** (Stase) ; **Gel** s'ensuit indirectement si le stack de Ralentissement s'accumule suffisamment (via la chaîne déjà établie Ralentissement → Gel, section Stase) — pas un effet propre de la grenade
- Consomme : disponible uniquement sous Transcendance (remplace la grenade normale)
- Remarque : combine Abyssal + Stase. ⚠️ Confirmé par l'utilisateur : Gel n'a volontairement pas été cité comme effet direct, c'est une CONSÉQUENCE en cascade de Ralentissement, pas un 3e verbe produit par la grenade elle-même — bon exemple concret de l'intérêt du graphe de chaînes (produire un seul verbe peut suffire à en déclencher un second par ricochet).
- Description officielle (27/08/2026, bouton de diagnostic) : *«
  Singularité glacée — [Grenade] : Lancez une masse d'énergie abyssale et
  de matière stasique. Déploie un trou noir miniature à l'impact entouré
  d'un champ ralentissant. Après une courte durée, le trou noir implose,
  neutralisant toutes les cibles avoisinantes et leur infligeant de lourds
  dégâts. »* — vérifiée mot pour mot contre le catalogue (`suppression`,
  `ralentissement`) via un test d'intégration : fonctionne correctement de
  bout en bout, y compris la cascade vers Gel puis Brisure.

⚠️ **Structure commune aux 3 grenades prismatiques** : chacune combine
DEUX éléments parmi les 5 doctrines classiques, et déclenche DIRECTEMENT un
verbe de chacun simultanément à l'impact — la seule catégorie du catalogue
à produire des effets de deux éléments différents en même temps, sans
équivalent dans les doctrines classiques. La grenade du Chasseur combine
2+2 verbes directs (Solaire+Stase), celles du Titan et de l'Arcaniste 1+1
chacune (Filobscur+Cryo-électrique, Abyssal+Stase) — la répartition exacte
des verbes déclenchés par élément n'est pas nécessairement symétrique d'une
classe à l'autre, à garder en tête pour la conception du graphe.

📌 Ce compte ne reflète que les effets DIRECTS de chaque grenade — la
grenade de l'Arcaniste en produit indirectement un 3e (Gel) via la chaîne
déjà établie Ralentissement → Gel (voir sa fiche ci-dessus). Un exemple
concret de pourquoi le graphe de chaînes a de l'intérêt au-delà des seuls
effets déclarés d'un perk : un seul verbe produit peut suffire à en
déclencher un second par ricochet, sans que rien ne le mentionne
explicitement.

### Regroupements Prismatique (élargissement du champ de vision, demande de l'utilisateur)

Ces catégories ne sont pas des verbes en tant que tels, mais des
REGROUPEMENTS de verbes déjà documentés ci-dessus, utiles pour le
Prismatique et pour la détection en général (ex : un perk qui dit
« confère un Bonus de Lumière » peut désigner n'importe lequel des verbes
listés dans ce groupe).

**Bonus de Lumière** regroupe : Amplifié, Charge éclair, Soin, Radiance,
Restauration, Dévoration, Invisibilité, Surbouclier.

**Bonus de Ténèbres** regroupe : Armure de Givre, Maille tissée.

**Malus des Ténèbres** regroupe : Ralentissement, Gel, Sectionnement,
Suspension, Effilochage.

**Objet élémentaire** (ramassages au sol, catégorie ressource) regroupe :
Feu follet, Piste ionique, Brèche abyssale, Éclat stasique, Enchevêtrement.

⚠️ Remarque : Enchevêtrement apparaît maintenant dans DEUX rôles à la fois
— verbe à part entière (avec ses propres Produit/Consomme, section
Filobscur ci-dessus) ET listé comme « Objet élémentaire » ramassable par
l'utilisateur. Les deux ne se contredisent pas : un Enchevêtrement au sol
EST un objet qu'on peut ramasser et lancer, en plus d'être le résultat
d'une élimination sous malus filobscur.

---


## Nouveaux liens confirmés par l'audit des fragments (26/08/2026)

⚠️ Détail complet par fragment (description officielle citée, raisonnement
accepté/rejeté) dans `25_AUDIT_FRAGMENTS.md`. Cette section ne liste que
les liens **retenus et codés** dans `elementVerbs.ts`, en complément des
fiches par verbe ci-dessus qui datent d'avant cet audit.

**Abyssal**
- Volatil → Brèche abyssale (Écho de cessation)
- Neutralisation → Brèche abyssale (Écho d'autorité, confirmé par Facette
  de contrôle/Prismatique)
- Brèche abyssale → Dévoration (Écho de famine)

**Stase**
- Ralentissement → énergie de compétence de classe (Murmure de
  réfraction)
- Gel → énergie de compétence de classe (même fragment, Murmure de
  réfraction)
- Gel → énergie de Super (Murmure de liens)
- Gel → Éclat stasique (Facette de contrôle/Prismatique)
- Armure de givre → Éclat stasique (Murmure de chaînes)
- Armure de givre → Ralentissement (Murmure d'inversion)
- Brisure (par mêlée) → Armure de givre (Murmure des fractures)

**Filobscur**
- Suspension → énergie de compétence de classe (Fil d'esprit)
- Suspension → énergie de Super (Fil de sagesse)
- Enchevêtrement → énergie de mêlée (Fil de fureur)
- Enchevêtrement → Transcendance (Facette d'honneur/Prismatique)
- Maille tissée → Enchevêtrement (Fil de transmutation)
- Charge d'armure (ramassage d'orbe) → Maille tissée (Fil de tutelle)

**Prismatique**
- Transcendance → énergie de Super (Facette de générosité)
- Charge d'armure (ramassage d'orbe) → Charge éclair / Restauration /
  Armure de givre / Surbouclier, en plus de Maille tissée déjà listé
  ci-dessus (Facette de détermination — un seul fragment confirme et
  étend le lien déjà trouvé côté Filobscur à 4 verbes supplémentaires,
  selon le type de dégâts du Super équipé)

⚠️ Remarque de conception : plusieurs de ces liens partagent une MÊME
description source pour deux verbes à la fois (ex: Murmure de réfraction
pour Ralentissement ET Gel ; Facette de contrôle pour Gel ET
Neutralisation) — codé comme deux entrées `conditionnel` séparées, une par
verbe, plutôt qu'une entrée partagée, pour rester cohérent avec la
structure existante (`produit`/`ressourceGeneree` restent définis PAR
verbe).

## État d'avancement

**Les 5 doctrines classiques + le Prismatique sont documentés en entier**
(Solaire, Cryo-électrique, Abyssal, Stase, Filobscur, Prismatique — les 3
grenades prismatiques par classe désormais toutes reçues). Restent :

- Ressources transversales (Charge d'armure, Surcharge d'arme, Source
  d'aptitude) — déjà dans le catalogue de détection du code, relations
  produit/consomme pas encore établies avec le reste.
- Construction du graphe de détection lui-même (conception à venir, une
  fois toute la matière validée).

## Vocabulaire de jeu annexe (pas des verbes, mais utile à connaître)

- **« Fait chanceler »** — précisé par l'utilisateur : concerne les
  Champions, et désigne le moment où ce type d'adversaire devient
  vulnérable ; selon le perk et sa formulation, peut aussi signifier qu'il
  est plus facile de l'étourdir. Ce n'est donc PAS un verbe d'élément mais
  un état lié au mécanisme anti-champion. Rencontré dans le Disque de
  Données Cryptées.
- **« Raidance »** — coquille de « Radiance » présente dans 2 fichiers
  source (Outillage de sécurité, Encensoir à feuilles de Reine). Sans
  conséquence pour la détection (le mot-clé `radiance` ne matche pas
  `raidance`), mais à corriger si ces fichiers sont réutilisés.

## Décisions de conception pour le graphe de chaînes (25/08/2026)

Arrêtées en discussion avec l'utilisateur, avant toute implémentation.

### Structure des données

Un champ `produit` **directement sur chaque entrée du catalogue**
(`elementVerbs.ts`), pas un fichier séparé :

```
produit?: { verbeId: string; conditionnel?: string }[]
```

- Référencé par **identifiant stable** (`scorch`, `ignition`…), jamais par
  nom affiché — un renommage comme Consumé→Blessure solaire ne casse alors
  rien.
- **Un seul sens stocké** : ce qu'un verbe produit. Ce qu'il consomme se
  déduit en cherchant qui le produit, sans dupliquer l'information.
- ⚠️ Fichier séparé écarté délibérément, malgré son avantage de lisibilité :
  `lib/scoring/contexte.ts` (supprimé le 24/08) est l'exemple concret de ce
  que coûte une seconde source pour la même donnée — ses valeurs avaient
  divergé sans que personne ne s'en aperçoive. Un diagnostic pourra
  reconstituer la vue d'ensemble du graphe à l'affichage, sans jamais la
  stocker en double.

### Comportement retenu

- **Convergences** : émergent naturellement du modèle (Enchevêtrement a
  3 sources, Gel en a 2). Rien de spécial à coder.
- **Verbes-ressources** : signal **séparé** du score des chaînes, et
  **nommé par type de ressource** produite (énergie de grenade, de mêlée, de
  compétence de classe, générique) — pas un compteur global. Motivation de
  l'utilisateur : certains builds enchaînent les Super grâce à cette
  génération, c'est une vraie force à rendre visible.
- **Liens conditionnels** : réellement **vérifiés**, jamais supposés. La
  vérification porte sur la **description** de l'élément requis, pas sur son
  nom — c'est la description qui porte l'effet. Rendu possible par tout le
  travail d'extraction déjà en place (aspects, fragments, grenade, mêlée,
  compétence de classe, artefact, perks d'armes, bonus de set).
- **Notation** : ✅ **TRANCHÉE (26/08/2026)**, voir la nouvelle section
  « Notation du Pilier 2 — chaînes et ressources (26/08/2026) » ci-dessous
  pour le détail complet. En bref : les verbes atteints uniquement par la
  chaîne (sans source textuelle propre) sont désormais reconnus comme
  sourcés pour le calcul du score (corrige un trou où ils pouvaient être
  classés à tort en "payoff orphelin"), et la génération de ressources
  ajoute un petit bonus (+6 pts par type distinct, plafonné à 20),
  nettement plus modeste qu'une boucle complète (35 pts).

### Notation du Pilier 2 — chaînes et ressources (26/08/2026)

**Le trou identifié le 25/08** : `detecterChainesVerbes` savait qu'un
verbe atteint uniquement par ricochet (ex : Gel, quand seul Ralentissement
a une vraie source textuelle) pouvait à son tour en produire d'autres —
mais cette information ne remontait JAMAIS jusqu'au calcul de `confiance`
(`scoreVerbesDetectes`), qui ne regarde que le texte brut. Concrètement,
un tel verbe consommé par un fragment (payoff) sans être lui-même
mentionné ailleurs se classait à tort en `payoff_orphelin` (0 pt, signalé
comme un défaut), alors que la chaîne PROUVE qu'il est bien produit dans
ce build précis.

**Correction (`enrichirAvecChaines`, `src/lib/scoring/verbes.ts`)** : tout
verbe qui apparaît comme CIBLE d'au moins un maillon confirmé (déjà filtré
sur les conditions vérifiées) est traité comme ayant une source EFFECTIVE
pour le calcul de `confiance`, même sans texte qui le mentionne
directement. `aSource` lui-même n'est PAS modifié (reste un fait purement
textuel, utilisé ailleurs — ex : la couverture anti-champion doit rester
fondée sur une vraie source dans LA DOCTRINE, pas sur un ricochet d'un
autre élément). Seule `confiance`, qui alimente le score, est recalculée —
via `calculerConfiance`, extraite en fonction partagée pour ne pas
dupliquer les 5 branches de décision entre le calcul initial et
l'enrichissement.

**Bonus de ressources** : la génération de ressources (mêlée/grenade/
classe/Super/générique) reste un signal séparé de la notation des
chaînes (décision du 25/08 confirmée), mais "séparé" ne veut plus dire
"absent du score" : +6 pts par TYPE distinct de ressource générée et
CONFIRMÉ actif dans le build, plafonné à 20 pts au total. Volontairement
modeste face à une boucle complète (35 pts) : ce bonus récompense une
CARACTÉRISTIQUE additionnelle d'un verbe déjà noté par ailleurs, pas un
second mécanisme à noter à parts égales. Compté par TYPE et non par verbe,
pour qu'un build polyvalent (mêlée ET grenade via 2 verbes différents)
soit mieux récompensé qu'un build qui génère 2 fois le même type via 2
verbes différents.

**Non testé en conditions réelles** — même limite que le reste du Pilier 2
(pas de `node_modules`, réseau désactivé dans l'environnement de
développement). Vérifié par un typecheck isolé complet (`tsc --noEmit`,
stubs pour `sql.js`/`idb`/`fflate`/`import.meta.env`) : aucune erreur sur
`verbes.ts` ni `pillars.ts`.

### Contraintes de jeu confirmées par l'utilisateur

- **Les fragments sont communs aux 3 classes** — une règle de vérification
  portant sur un fragment n'a besoin d'être écrite qu'une fois.
- **Les grenades sont communes aux 3 classes, mais par ÉLÉMENT** (chaque
  doctrine a son propre bassin).
- **Le Prismatique casse cette logique** : il pioche dans les 5 doctrines,
  donc une grenade Abyssale peut coexister avec une mêlée de Stase sur un
  même build. On ne peut donc PAS supposer qu'un emplacement correspond à
  l'élément de la sous-classe. ✅ Le système d'extraction actuel ne suppose
  déjà rien de tel (il lit ce qui est réellement équipé) : aucun cas
  particulier à prévoir pour le Prismatique.

### 🔴 Risque identifié et confirmé sur données réelles : mots-clés courts

Vérification faite le 25/08 sur les 7 artefacts. **Le mot-clé `cure`
(anglais, pour Soin) produit 11 faux positifs et 0 vrai** : il ne capte que
des fins de mots français — « filobs**cure** », « oc**cure**nce »,
« pro**cure** ». Le verbe Soin est donc détecté à tort sur 11 perks
**dès aujourd'hui**, indépendamment des chaînes.

Cause : le catalogue mélange mots-clés FR et EN dans une même recherche en
sous-chaîne, sans distinguer la langue du texte analysé. Un mot court dans
une langue peut être un fragment de mot dans l'autre.

⚠️ Ça se propagerait au graphe : une chaîne traversant Soin hériterait de
l'erreur — une inférence empilée sur une autre.

**Décision (approuvée par l'utilisateur)** : distinguer deux types de
mots-clés plutôt que de choisir entre les deux stratégies —
- **racines** (volontairement tronquées : `suspend`, `effiloch`,
  `enchevetr`) → recherche en **sous-chaîne**, indispensable pour capter
  « suspendues », « effilochant »…
- **mots complets** (`cure`, `gel`, `soin`) → recherche sur **frontière de
  mot**, pour éliminer les faux positifs.

Vérifié au passage : `gel` ne pose PAS de problème (11 vrais, 0 faux — son
unique cas suspect était « gelée », une forme valide), et aucune collision
n'existe entre les mots-clés de deux verbes différents.

---

## Corrections de catalogue à vérifier avant modification du code

Repérées au fil de la construction de ce fichier — aucune n'a encore été
appliquée à `elementVerbs.ts`, à confirmer puis corriger en une seule passe :

- **« Suppression » → « Neutralisation »** (Abyssal) — anglicisme resté en
  place, comme Arc/Cryo-électrique.
- **« Cotte tissée » → « Maille tissée »** (Filobscur) — CONFIRMÉ par
  l'utilisateur, prêt à corriger dans le code.
- **Mots-clés de détection à ajouter** :
  - Suspension : « suspendu », « suspension »
  - Neutralisation : « neutraliser », « neutralisé »
  - Affaiblissement : « affaiblir », « affaiblit »
  - Sectionnement : « sectionné »
  - Effilochage : « effilochant », « effiloché »
  - Enchevêtrement : « Enchevêtré »

## Idée de conception notée par l'utilisateur

Plutôt qu'une seule catégorie « ressource » vague pour toute énergie
d'aptitude produite, typer précisément LAQUELLE : mêlée, grenade,
compétence de classe, ou générique (« compétence » au sens large quand le
jeu ne précise pas laquelle). Rencontré dès Cryo-électrique (Charge éclair
→ mêlée précisément, Piste ionique → générique). À appliquer de façon
cohérente pour la suite du catalogue.
