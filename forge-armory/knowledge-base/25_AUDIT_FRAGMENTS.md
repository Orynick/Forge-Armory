# Audit des fragments — recherche de liens conditionnels supplémentaires

Chantier ouvert le 25/08/2026, à la suite de la découverte du lien
conditionnel Embrasement → Blessure solaire (Tison de Charbon). Objectif :
passer en revue les fragments des 5 éléments classiques (communs aux 3
classes, une seule fiche par fragment) pour repérer d'éventuels AUTRES
liens conditionnels non encore documentés dans le fichier 22.

## Méthode

Pour chaque fragment reçu (capture d'écran, idéalement DIM comme pour
Tison de Charbon) :
1. **Description officielle** — citée mot pour mot, jamais reformulée.
2. **Lien détecté ou non** — est-ce que ce fragment transforme un verbe
   existant (ajoute une production qu'il n'a pas normalement) ? Si oui,
   reporté dans `22_CHAINES_DE_VERBES.md` ET codé dans `elementVerbs.ts`.
3. **Infos communautaires** — si la capture en contient (case dédiée sur
   DIM), notées séparément avec la réserve qu'elles ne sont PAS officielles
   Bungie, jamais codées comme une valeur de jeu certaine.

## Portée estimée

D'après une vérification rapide (25/08) : les fragments sont communs aux
3 classes par élément, environ 8 à 12 par élément selon les sources
consultées — soit un ordre de grandeur de 40 à 60 fragments au total sur
les 5 éléments classiques, pas des centaines.

⚠️ **Correction (26/08/2026)** : l'hypothèse initiale « le Prismatique n'a
pas de fragments propres, il pioche dans le pool des 5 éléments
classiques » était **fausse**. Les 21 « Facettes » reçues le 26/08 sont
bien des fragments EXCLUSIFS au Prismatique (noms et mécaniques propres,
aucun recoupement avec les Tisons/Étincelles/Échos/Murmures/Fils des 5
autres éléments) — corrigé après vérification directe des captures.

---

## Solaire

⚠️ 15 fragments reçus le 25/08/2026. Certaines infos communautaires sont
tronquées dans les captures (signalé par l'utilisateur) — à compléter si
besoin plus tard, pas une raison de deviner la suite.

### Tison à roussir
- **Description officielle** : *« Votre compétence de classe se recharge
  plus vite quand vous infligez des Blessures solaires aux cibles. »*
- **Infos communautaires** (non officielles) : confère 400% de régénération
  additionnelle de compétence de classe pendant 3 secondes en infligeant
  Blessure solaire à une cible qui n'en souffre pas déjà. Ne s'active pas
  si la cible meurt du coup qui aurait dû infliger Blessure solaire.
- **Lien détecté** : ❌ aucun nouveau lien verbe→verbe. C'est un bonus de
  régénération lié à l'application de Blessure solaire, pas une nouvelle
  production.

### Tison de torches
- **Description officielle** : *« Vos attaques de mêlée chargées de
  puissance octroient Radiance à vous et à vos alliés proches. »*
- **Lien détecté** : ❌ nouvelle SOURCE de Radiance (déjà couverte par la
  détection générique du mot-clé), pas un nouveau lien entre verbes —
  Radiance elle-même ne produit toujours rien d'autre.

### Tison de combustion
- **Description officielle** : *« Les frags au Super solaire causent un
  Embrasement à leurs victimes et créent un Feu follet. »*
- **Lien détecté** : ❌ nouvelle source d'Embrasement ET de Feu follet
  (éliminations au Super), mais aucun des deux verbes ne change de
  comportement propre — pas de nouveau lien à coder.

### Tison de trempe
- **Description officielle** : *« Les frags à l'arme solaire améliorent
  votre santé et celle de vos alliés pendant un court moment. Se cumule 3
  fois. Tant que Tison de trempe est actif, vos armes ont une meilleure
  efficacité aérienne et vos frags à l'arme solaire créent un Feu
  follet. »*
- **Lien détecté** : ⚠️ le bonus de santé n'est PAS explicitement nommé
  Restauration ni Soin dans le texte — mécanique distincte, non rattachée
  à un verbe du catalogue. Nouvelle source de Feu follet (frags à l'arme),
  sans changement de comportement du Feu follet lui-même.

### Tison empyréen
- **Description officielle** : *« Les frags à l'arme ou à la compétence
  solaire allongent la durée des effets de Restauration et de Radiance qui
  s'appliquent à vous. »*
- **Lien détecté** : ❌ modificateur de DURÉE sur des verbes existants, pas
  une nouvelle production.

### Tison de clémence
- **Description officielle** : *« Quand vous ranimez un allié, vous et les
  autres alliés proches obtenez Restauration. Ramasser un Feu follet
  octroie Restauration. »*
- **Infos communautaires** : le ramassage d'un Feu follet confère
  Restauration x1 pendant 2 secondes (3 avec Tison de réconfort). Prolonge
  la durée de Restauration du même montant si déjà active.
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Feu follet →
  Restauration, si ce fragment est équipé. Codé dans `elementVerbs.ts`
  (voir plus bas).

### Tison de détermination
- **Description officielle** : *« Les frags à la grenade solaire vous
  soignent. »*
- **Infos communautaires** : les éliminations à la grenade confèrent Soin
  x1.
- **Lien détecté** : ❌ nouvelle source de Soin (éliminations à la
  grenade), pas un nouveau lien entre verbes catalogués — l'action
  "élimination à la grenade" n'est pas elle-même un verbe de la liste.

### Tison de bienveillance
- **Description officielle** : *« Appliquer Restauration, Soin ou Radiance
  aux alliés améliore la régénération des compétences de classe, de mêlée
  et de grenade pendant un court moment. »*
- **Lien détecté** : ❌ bonus de régénération lié à l'application de
  verbes existants sur des alliés, pas une nouvelle production.

### Tison de réconfort
- **Description officielle** : *« Les effets de Radiance et de
  Restauration qui s'appliquent à vous ont une durée rallongée. »*
- **Infos communautaires** : +50% de durée pour Restauration et Radiance
  sur soi. Les bonus spécifiques de ce fragment pour Restauration/Radiance
  sont documentés dans la description DE CES DEUX VERBES (pas ici).
- **Lien détecté** : ❌ modificateur de durée, pas une nouvelle production.

### Tison rayonnant
- **Description officielle** : *« Vos projectiles de Super solaire ont
  une meilleure acquisition de cible. »*
- **Lien détecté** : ❌ aucun rapport avec un verbe du catalogue (bonus de
  ciblage pur).

### Tison d'incandescence
- **Description officielle** : *« Éliminer des cibles avec des
  Embrasements solaires confère de l'énergie de grenade. »*
- **Infos communautaires** (tronquées) : le montant d'énergie de grenade
  dépend du rang de l'ennemi tué (8% pour les mineurs T1, jusqu'à 20.75%
  pour un joueur — liste incomplète dans la capture).
- **Lien détecté** : ⚠️ **NOUVELLE PRODUCTION DE RESSOURCE CONDITIONNELLE**
  sur Embrasement (qui n'en génère normalement aucune) — voir la question
  de conception plus bas, pas encore codé.

### Tison de cendres
- **Description officielle** : *« Vous infligez plus de Blessures
  solaires cumulées aux cibles. »*
- **Infos communautaires** : augmente le nombre de stacks infligés de 50%
  dans la plupart des cas (toujours arrondi au supérieur : 3, 4.5→5).
- **Lien détecté** : ❌ modificateur de magnitude sur Blessure solaire, pas
  une nouvelle production.

### Tison d'éruption
- **Description officielle** : *« Vos Embrasements solaires ont une plus
  grande zone d'effet. »*
- **Infos communautaires** : +25% de rayon d'explosion (8→10 mètres).
- **Lien détecté** : ❌ modificateur de zone d'effet, pas une nouvelle
  production.

### Tison à calciner
- **Description officielle** : *« Vaincre des cibles souffrant de
  Blessures solaires octroie de l'énergie de mêlée et crée un Feu
  follet. »*
- **Infos communautaires** (tronquées) : le montant d'énergie de mêlée
  dépend du rang de l'ennemi tué (liste coupée dans la capture).
- **Lien détecté** : ⚠️ **NOUVELLE PRODUCTION DE RESSOURCE CONDITIONNELLE**
  sur Blessure solaire (énergie de mêlée directe, en plus de la création
  de Feu follet déjà couverte) — même question de conception que Tison
  d'incandescence, pas encore codé.

### Tison de merveilles
- **Description officielle** : *« Éliminer rapidement plusieurs cibles
  avec des Embrasements solaires génère un orbe de puissance. »*
- **Infos communautaires** (tronquée) : 2 éliminations en un temps
  limité (délai coupé dans la capture) avec Embrasement génèrent un Orbe
  de Puissance qui confère 2.5% d'énergie de Super.
- **Lien détecté** : ⚠️ même famille de question que les deux précédents —
  Embrasement gagne une production d'orbe conditionnelle, pas encore
  codé.

---

## ⚠️ Question de conception : ressources conditionnelles

Trois fragments (Tison d'incandescence, Tison à calciner, Tison de
merveilles) révèlent un même motif : un verbe qui ne génère NORMALEMENT
aucune ressource (Embrasement, Blessure solaire) en gagne une, mais
UNIQUEMENT si un fragment précis est équipé.

Le champ `ressourceGeneree` actuel est conçu comme INCONDITIONNEL (une
simple liste de types, comme pour Feu follet ou Piste ionique) — il n'a
pas d'équivalent au `conditionnel` de `produit`. L'étendre correctement
demanderait donc une vraie décision de conception avant d'être codé,
plutôt qu'un rafistolage à la volée pour ces 3 cas précis.

✅ **Implémenté (25/08/2026, même jour)** : `ressourceGeneree` étendu
d'un simple tableau de types vers un tableau d'objets
`{ type, conditionnel? }`, exactement le même principe que `produit`. Les
7 entrées existantes migrées vers la nouvelle syntaxe sans changement de
comportement (toujours inconditionnelles). Les 3 nouvelles productions
conditionnelles codées sur Embrasement (grenade via Tison d'incandescence,
Super via Tison de merveilles) et Blessure solaire (mêlée via Tison à
calciner) — vérifiées sur le texte exact des 3 captures.

---

## Cryo-électrique

⚠️ 16 fragments reçus le 26/08/2026.

### Étincelle de brillance
- **Description officielle** : *« Vaincre une cible touchée par Cécité
  avec des dégâts de précision crée une explosion provoquant Cécité. »*
- **Infos communautaires** : les éliminations de précision sur une cible
  Aveuglée libèrent une explosion Aveuglante dans un rayon de 7,5 mètres.
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL (auto-référence)** —
  Cécité → Cécité, si ce fragment est équipé. Un verbe qui se reproduit
  lui-même sous condition — le graphe le gère nativement (pas de boucle
  infinie, le verbe est déjà marqué atteint). Codé (voir plus bas).

### Étincelle de rétroaction
- **Description officielle** : *« Subir des dégâts de mêlée augmente
  brièvement vos dégâts de mêlée. »*
- **Lien détecté** : ❌ bonus de dégâts personnel, aucun rapport avec un
  verbe du catalogue.

### Étincelle de concentration
- **Description officielle** : *« Au bout de quelques instants de sprint,
  votre régénération de compétence de classe est améliorée. »*
- **Lien détecté** : ❌ bonus de régénération lié au sprint, pas à un
  verbe catalogué.

### Étincelle d'amplitude
- **Description officielle** : *« Éliminer des cibles rapidement sous
  l'effet d'Amplificateur créé un orbe de puissance. »*
- **Infos communautaires** : 2 éliminations en 4 secondes sous Amplifié
  créent un Orbe de Puissance conférant 2,5% d'énergie de Super
  (l'élimination qui déclenche Amplifié compte ; les éliminations dans les
  10s suivant une activation ne comptent pas).
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — même
  famille que les 3 cas trouvés hier sur Embrasement/Blessure solaire.
  Amplifié gagne une production de Super, conditionnelle à ce fragment.
  Codé (voir plus bas).

### Étincelle de décharge
- **Description officielle** : *« Les frags à l'arme cryo-électrique ont
  une chance de créer une Piste ionique. Ramasser une Piste ionique vous
  confère un cumul de Charge éclair. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Piste ionique →
  Charge éclair, si ce fragment est équipé. Codé (voir plus bas).

### Étincelle de fréquence
- **Description officielle** : *« Les coups de mêlée augmentent la
  vitesse de rechargement et la stabilité de votre arme équipée pendant
  une courte durée. Sous l'effet d'Amplificateur, les effets sont accrus
  et vous gagnez plus de cumuls de Charge éclair de toutes les sources. »*
- **Infos communautaires** : un coup de mêlée confère 15 de stabilité, 50
  de vitesse de rechargement et un multiplicateur x0,8 de durée de
  rechargement pendant 5,25 secondes.
- **Lien détecté** : ❌ multiplicateur de magnitude sur la production
  existante de Charge éclair (« de toutes les sources »), pas une nouvelle
  source en soi.

### Étincelle d'impulsion
- **Description officielle** : *« Glisser sur des briques de munitions
  recharge votre arme équipée et vous confère une petite quantité de
  Charge éclair. »*
- **Infos communautaires** : ramasser des briques de munitions en
  glissant recharge le chargeur depuis les réserves et confère 3 cumuls de
  Charge éclair.
- **Lien détecté** : ❌ nouvelle source de Charge éclair via une action de
  jeu (glisser sur des munitions), pas un verbe catalogué qui en produit
  un autre.

### Étincelle de résistance
- **Description officielle** : *« Quand vous êtes entouré de combattants,
  vous résistez mieux aux dégâts subis. »*
- **Infos communautaires** : 25% (10% en PvP) de résistance aux dégâts à
  moins de 15 mètres de 3 combattants ou plus.
- **Lien détecté** : ❌ résistance défensive pure, aucun rapport avec un
  verbe catalogué.

### Étincelle ionique
- **Description officielle** : *« Éliminer une cible qui subit des
  Secousses ou éliminer une cible en utilisant une Charge éclair crée une
  Piste ionique. »*
- **Infos communautaires** : élimination d'une cible Secouée OU
  élimination via l'éclair d'une Charge éclair — 10 secondes de recharge
  entre deux activations.
- **Lien détecté** : ✅ **DEUX NOUVEAUX LIENS CONDITIONNELS** — Secousse →
  Piste ionique ET Charge éclair → Piste ionique, tous deux si ce fragment
  est équipé. Codés (voir plus bas).

### Étincelle d'instinct
- **Description officielle** : *« Lorsque vous êtes en état critique, les
  dégâts que vous subissez émettent une rafale d'énergie cryo-électrique
  destructrice qui inflige un effet de Secousse aux cibles. »*
- **Lien détecté** : ❌ nouvelle source de Secousse (état critique), pas
  un verbe catalogué qui en produit un autre.

### Étincelle de magnitude
- **Description officielle** : *« Vos grenades cryo-électriques à effet
  persistant (grenade électrique, grenade à impulsion et grenade de
  l'orage) ont une durée allongée. »*
- **Infos communautaires** : bonus détaillé par type de grenade (éclairs,
  impulsions, volées supplémentaires).
- **Lien détecté** : ❌ modificateur de durée, pas une nouvelle
  production.

### Étincelle de vitesse
- **Description officielle** : *« Lorsque vous sprintez, votre
  statistique de santé augmente considérablement. »*
- **Infos communautaires** : +50 de santé après 1,25 seconde de sprint
  continu à 5 m/s minimum.
- **Lien détecté** : ❌ bonus de statistique, aucun rapport avec un verbe
  catalogué.

### Étincelle de balises
- **Description officielle** : *« Sous l'effet d'Amplificateur, vos frags
  cryo-électriques avec des munitions lourdes ou spéciales créent une
  explosion infligeant Cécité. »*
- **Lien détecté** : ⚠️ pas un lien propre codable — le déclencheur combine
  Amplifié ET un type de munition précis, pas juste "Amplifié produit
  Cécité" (qui serait faux : Amplifié seul ne suffit pas). Noté mais pas
  modélisé pour éviter une simplification trompeuse.

### Étincelle de volts
- **Description officielle** : *« Les coups de grâce vous confèrent
  Amplificateur ainsi qu'un cumul de Charge éclair. »*
- **Lien détecté** : ❌ nouvelle source d'Amplifié ET de Charge éclair via
  une action de jeu (coup de grâce), pas un verbe qui en produit un
  autre.

### Étincelle d'électrocution
- **Description officielle** : *« Vos grenades cryo-électriques infligent
  Secousse aux ennemis. »*
- **Lien détecté** : ❌ nouvelle source de Secousse, déjà couverte
  génériquement.

### Étincelle de rechargement
- **Description officielle** : *« Quand vous êtes dans un état critique,
  votre énergie de mêlée et de grenade se recharge plus vite. »*
- **Infos communautaires** : +400% (+200% en PvP) de régénération de base
  de mêlée et de grenade jusqu'à ce que le bouclier soit rechargé.
- **Lien détecté** : ❌ bonus de vitesse de régénération, même famille que
  Tison à roussir hier — pas une production de ressource au sens de
  `ressourceGeneree`.

---

### 📌 Étincelle d'amplitude — même mécanisme qu'hier, codé directement

Amplifié gagne une production de Super conditionnelle à ce fragment —
même famille que les 3 cas trouvés hier sur Embrasement/Blessure solaire.
Le mécanisme (`ressourceGeneree` avec `conditionnel`) est déjà approuvé et
en place ; l'appliquer à ce nouveau verbe est une donnée, pas une nouvelle
décision de conception. Codé (voir plus bas).

## Stase

⚠️ 16 fragments reçus le 26/08/2026 (zip complet, une seule session).

### Murmure du givre
- **Description officielle** : *« Votre Armure de givre dure plus
  longtemps et voit son cumul maximum augmenté. »*
- **Lien détecté** : ❌ modificateur de cumul/durée, pas une nouvelle
  production.

### Murmure d'hèdrons
- **Description officielle** : *« Augmente le maniement d'arme et la
  santé après avoir gelé une cible avec la stase. »*
- **Lien détecté** : ❌ bonus de statistiques lié à Gel, pas une nouvelle
  production.

### Murmure de fissures
- **Description officielle** : *« Augmente les dégâts et la taille de
  l'explosion de stase lorsque vous détruisez un cristal de stase ou
  éliminez une cible gelée. »*
- **Lien détecté** : ❌ modificateur de dégâts/zone, pas une nouvelle
  production.

### Murmure de réfraction
- **Description officielle** : *« Vaincre des cibles ralenties ou gelées
  vous confère de l'énergie de capacité de doctrine. »*
- **Infos communautaires** : montant dépendant du rang de l'ennemi (9% à
  20%+ selon le palier).
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Ralenti-
  ssement ET Gel gagnent une production d'énergie de compétence de classe.
  Codé (`ressourceGeneree` type `classe` sur les deux verbes).

### Murmure de réclusion
- **Description officielle** : *« Le Ralentissement que vous infligez aux
  cibles dure plus longtemps. Toutes les capacités qui persistent durent
  également plus longtemps. »*
- **Lien détecté** : ❌ modificateur de durée, pas une nouvelle production.

### Murmure de liens
- **Description officielle** : *« Éliminer des cibles gelées génère un
  orbe de puissance. »*
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Gel gagne
  une production d'énergie de Super (orbe de puissance). Codé.

### Murmure de fragments
- **Description officielle** : *« Briser un cristal stasique augmente
  temporairement la vitesse de recharge de vos grenades. Briser des
  cristaux stasiques supplémentaires augmente la durée de ce bonus. »*
- **Lien détecté** : ❌ bonus de vitesse de régénération, pas une
  production de ressource au sens du catalogue.

### Murmure de chaînes
- **Description officielle** : *« Éliminer des cibles pendant que vous
  avez Armure de givre a une chance de créer un éclat stasique. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Armure de givre →
  Éclat stasique. Codé.

### Murmure du tourment
- **Description officielle** : *« Vous obtenez de l'énergie de grenade à
  chaque fois que des cibles vous infligent des dégâts. Disposer d'une
  Armure de givre augmente la quantité d'énergie obtenue. »*
- **Lien détecté** : ❌ dégâts subis génériques, pas un verbe catalogué qui
  en produit un autre (Armure de givre amplifie seulement la magnitude).

### Murmure des fractures
- **Description officielle** : *« Briser une cible gelée avec une attaque
  de mêlée confère un cumul d'Armure de givre. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Brisure (par
  mêlée) → Armure de givre. Codé.

### Murmure d'impulsion
- **Description officielle** : *« Blesser des cibles avec des compétences
  de mêlée stasiques recharge vos armes et vous confère un bonus
  temporaire de vitesse de préparation d'arme. »*
- **Lien détecté** : ❌ recharge d'arme, pas une ressource cataloguée.

### Murmure de la conduction
- **Description officielle** : *« Les éclats de stase à proximité
  trahissent votre position. »*
- **Lien détecté** : ❌ mécanique de furtivité, aucun rapport avec un
  verbe catalogué.

### Murmure de la déchirure
- **Description officielle** : *« Les armes cinétiques augmentent les
  dégâts infligés aux cristaux de stase et aux cibles gelées. »*
- **Lien détecté** : ❌ modificateur de dégâts, pas une production.

### Murmure de la faim
- **Description officielle** : *« Augmente l'énergie de mêlée obtenue en
  ramassant des éclats de stase. »*
- **Lien détecté** : ❌ modificateur de magnitude sur une ressource déjà
  cataloguée (Éclat stasique → mêlée), pas une nouvelle production.

### Murmure d'inversion
- **Description officielle** : *« Quand vous avez l'Armure de givre, les
  dégâts de mêlée ralentissent votre cible. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Armure de givre →
  Ralentissement. Codé.

### Murmure du froid
- **Description officielle** : *« Les frags à l'arme stasique ont une
  chance de créer un éclat stasique. »*
- **Lien détecté** : ❌ nouvelle source d'Éclat stasique (frags à l'arme),
  pas un lien entre verbes catalogués.

---

## Filobscur

⚠️ 14 fragments propres reçus le 26/08/2026 (les 2 premiers fichiers du
zip étaient en réalité des doublons Abyssal — voir section Abyssal ci-
dessous — probablement liés au fait que la capture des deux éléments s'est
faite dans la même session sans coupure nette).

### Fil de renaissance
- **Description officielle** : *« Les frags à l'arme filobscure ont une
  chance de créer une Brindille. »*
- **Lien détecté** : ❌ nouvelle source de Brindille (frags à l'arme), pas
  un verbe catalogué qui en produit un autre.

### Fil d'esprit
- **Description officielle** : *« Éliminer des cibles en Suspension
  confère de l'énergie de compétence de classe. »*
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Suspension
  gagne une production d'énergie de classe. Codé.

### Fil de fureur
- **Description officielle** : *« Infliger des dégâts aux cibles avec un
  Enchevêtrement vous confère de l'énergie de mêlée. »*
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Enchevêtre-
  ment gagne une production d'énergie de mêlée. Codé.

### Fil d'ascension
- **Description officielle** : *« Activer votre compétence de grenade
  recharge votre arme équipée et confère un bonus d'efficacité aérienne et
  de maniement pendant une courte durée. »*
- **Lien détecté** : ❌ activation de grenade générique, pas un verbe
  catalogué qui en produit un autre.

### Fil de finalité
- **Description officielle** : *« Les frags avec coup de grâce créent des
  Brindilles. »*
- **Lien détecté** : ❌ nouvelle source de Brindille (finisher), pas un
  lien entre verbes catalogués.

### Fil de tutelle
- **Description officielle** : *« Ramasser un orbe de puissance confère
  Maille tissée. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Charge d'armure
  (ramassage d'orbe) → Maille tissée. Codé, et confirmé/étendu ensuite par
  Facette de détermination (Prismatique, voir plus bas) à 4 autres verbes.

### Fil de sagesse
- **Description officielle** : *« Éliminer des cibles suspendues crée un
  orbe de puissance. »*
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Suspension
  gagne une seconde production, énergie de Super (orbe). Codé.

### Fil de transmutation
- **Description officielle** : *« Sous l'effet de Maille tissée, vos
  frags à l'arme spéciale créent un Enchevêtrement. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Maille tissée →
  Enchevêtrement. Codé.

### Fil de propagation
- **Description officielle** : *« Les frags de mêlée chargée confèrent
  des munitions effilochantes à vos armes filobscures. »*
- **Lien détecté** : ❌ type de munitions, pas un verbe catalogué qui en
  produit un autre.

### Fil d'évolution
- **Description officielle** : *« Les Brindilles vont plus loin et
  infligent des dégâts supplémentaires. »*
- **Lien détecté** : ❌ modificateur de magnitude sur Brindille, pas une
  nouvelle production.

### Fil d'isolation
- **Description officielle** : *« Réussir des tirs de précision émet une
  salve de Sectionnement qui part de la cible. »*
- **Lien détecté** : ❌ nouvelle source de Sectionnement (tirs de
  précision), pas un lien entre verbes catalogués.

### Fil de lien
- **Description officielle** : *« Les frags avec Super émettent une
  salve de Suspension qui part de la cible. »*
- **Lien détecté** : ❌ nouvelle source de Suspension (frags Super), pas
  un lien entre verbes catalogués.

### Fil de génération
- **Description officielle** : *« Infliger des dégâts génère de l'énergie
  de grenade. »*
- **Lien détecté** : ❌ dégâts génériques, pas un verbe catalogué qui en
  produit un autre.

### Fil de continuité
- **Description officielle** : *« Les effets de Suspension, Effilochage
  et Sectionnement appliqués aux cibles ont une durée augmentée. »*
- **Lien détecté** : ❌ modificateur de durée, pas une nouvelle
  production.

---

## Abyssal

⚠️ 14 fragments propres reçus le 26/08/2026, plus 2 fragments identifiés
comme doublons dans le zip Filobscur (Écho de récolte, Écho d'obscurité —
listés ici, pas re-comptés dans Filobscur).

### Écho de famine
- **Description officielle** : *« Ramasser une Brèche abyssale ou un orbe
  de puissance confère Dévoration. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Brèche abyssale →
  Dévoration. Codé.

### Écho de vigilance
- **Description officielle** : *« Éliminer une cible lorsque vos
  boucliers sont épuisés vous confère un surbouclier abyssal
  temporaire. »*
- **Lien détecté** : ❌ condition sur l'état du bouclier du joueur, pas un
  verbe catalogué qui en produit un autre.

### Écho de cessation
- **Description officielle** : *« Les frags avec coup de grâce créent une
  salve de dégâts abyssaux qui rend les combattants proches volatiles.
  Éliminer des cibles volatiles crée une Brèche abyssale. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Volatil → Brèche
  abyssale. Codé (la 1ère moitié, finisher → Volatil, est une nouvelle
  source, pas un lien entre verbes catalogués).

### Écho d'expulsion
- **Description officielle** : *« Les frags de compétence abyssale font
  exploser les cibles. »*
- **Lien détecté** : ❌ dégâts d'explosion, pas une production de ressource
  ou de verbe.

### Écho de provision
- **Description officielle** : *« Infliger des dégâts aux cibles avec vos
  grenades vous confère de l'énergie de mêlée. »*
- **Lien détecté** : ❌ dégâts de grenade génériques, pas un verbe
  catalogué qui en produit un autre.

### Écho d'échange
- **Description officielle** : *« Les frags de mêlée confèrent de
  l'énergie de grenade. »*
- **Lien détecté** : ❌ frags de mêlée génériques, pas un verbe catalogué.

### Écho de vestiges
- **Description officielle** : *« Augmentation de la durée de vos effets
  de grenade persistants (Grenade à vortex, Mur abyssal, Pic abyssal et
  Décharge d'axions). »*
- **Lien détecté** : ❌ modificateur de durée, pas une production.

### Écho de représailles
- **Description officielle** : *« Lorsque des combattants vous
  encerclent, les frags confèrent de l'énergie de Super. »*
- **Lien détecté** : ❌ condition d'encerclement, pas un verbe catalogué.

### Écho de démoralisation
- **Description officielle** : *« Vos grenades abyssales affaiblissent
  les cibles. »*
- **Lien détecté** : ❌ nouvelle source d'Affaiblissement (grenade), pas un
  lien entre verbes catalogués.

### Écho de persévérance
- **Description officielle** : *« Durée augmentée des bonus abyssaux
  activés sur vous (Invisibilité, Surbouclier et Dévoration). »*
- **Lien détecté** : ❌ modificateur de durée, pas une nouvelle production.

### Écho de parasite
- **Description officielle** : *« Les frags de mêlée rendent des points
  de vie à vos alliés proches et à vous-même. »*
- **Lien détecté** : ❌ soin non nommé Restauration/Soin dans le texte, pas
  rattaché à un verbe du catalogue.

### Écho d'autorité
- **Description officielle** : *« Après avoir neutralisé une cible, votre
  statistique d'arme est considérablement augmentée pendant une courte
  durée et votre arme équipée est rechargée depuis les réserves. Éliminer
  des cibles neutralisées crée une Brèche abyssale. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Neutralisation →
  Brèche abyssale. Codé.

### Écho de dilatation
- **Description officielle** : *« En position accroupie, vous vous
  faufilez plus rapidement et la résolution de votre radar est
  augmentée. »*
- **Lien détecté** : ❌ aucun rapport avec un verbe catalogué.

### Écho d'instabilité
- **Description officielle** : *« Éliminer des cibles à l'aide de
  grenades confère des munitions volatiles à vos armes abyssales. »*
- **Lien détecté** : ❌ type de munitions (« munitions volatiles »), à ne
  pas confondre avec le verbe Volatil malgré le nom proche — pas un lien
  entre verbes catalogués.

### Écho de récolte *(doublon du zip Filobscur)*
- **Description officielle** : *« Éliminer des cibles affaiblies crée un
  orbe de puissance et une Brèche abyssale. »*
- **Lien détecté** : ❌ nouvelle source de Brèche abyssale (élimination de
  cible Affaiblie), pas un lien entre verbes catalogués — Affaiblissement
  lui-même reste sans production connue.

### Écho d'obscurité *(doublon du zip Filobscur)*
- **Description officielle** : *« Les frags avec coup de grâce confèrent
  de l'Invisibilité. »*
- **Lien détecté** : ❌ nouvelle source d'Invisibilité (finisher), pas un
  lien entre verbes catalogués.

---

## Prismatique

⚠️ 21 fragments reçus le 26/08/2026 — confirmé : ce sont bien des
« Facettes » propres au Prismatique (pas des doublons des 5 doctrines
classiques comme supposé initialement le 25/08 dans la section « Portée
estimée » de ce fichier). Certaines Facettes reproduisent ou étendent des
mécanismes déjà vus (ramassage d'orbe, Enchevêtrement, Transcendance).

### Facette de réveil
- **Description officielle** : *« Éliminer rapidement des cibles à l'aide
  de dégâts de Lumière, des Ténèbres ou de frags de Super génère un objet
  élémentaire du type de dégâts correspondant. »*
- **Lien détecté** : ❌ nouvelle source générique, pas un lien entre verbes
  catalogués précis.

### Facette de grâce
- **Description officielle** : *« Éliminer des cibles à l'aide d'armes
  cinétiques vous confère un bonus d'énergie de Transcendance. Éliminer
  des cibles à l'aide de votre Super confère un bonus d'énergie de
  Transcendance à vos alliés proches et à vous-même. »*
- **Lien détecté** : ❌ éliminations à l'arme/Super, pas un verbe catalogué
  qui en produit un autre.

### Facette de sacrifice
- **Description officielle** : *« Lorsque vous bénéficiez d'un bonus
  cryo-électrique, solaire ou abyssal, les frags de compétence confèrent
  un bonus d'énergie de Transcendance des Ténèbres. »*
- **Lien détecté** : ❌ condition sur bonus actif générique, pas un lien
  précis entre deux verbes du catalogue.

### Facette de dévouement
- **Description officielle** : *« Éliminer des cibles victimes de malus
  stasiques ou filobscurs vous confère un bonus d'énergie de Transcendance
  de Lumière. »*
- **Lien détecté** : ❌ condition sur debuff générique (pas un verbe
  précis), pas codé.

### Facette de générosité
- **Description officielle** : *« Éliminer des cibles quand vous êtes
  sous l'effet de Transcendance crée des orbes de puissance pour vos
  alliés. »*
- **Lien détecté** : ✅ **NOUVELLE RESSOURCE CONDITIONNELLE** — Transcen-
  dance gagne une production d'énergie de Super (orbes). Codé.

### Facette de justice
- **Description officielle** : *« Quand vous êtes sous l'effet de
  Transcendance, vos frags de compétence explosent. »*
- **Lien détecté** : ❌ dégâts d'explosion, pas une production de
  ressource ou de verbe.

### Facette d'honneur
- **Description officielle** : *« Obtenir un objet élémentaire ou détruire
  un Enchevêtrement vous confère de l'énergie de Transcendance du même
  type. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN CONDITIONNEL** — Enchevêtrement →
  Transcendance. Codé (la moitié « objet élémentaire » est une source
  générique, pas un verbe précis).

### Facette d'espoir
- **Description officielle** : *« Quand vous bénéficiez d'un bonus
  élémentaire, votre compétence de classe se régénère plus rapidement. »*
- **Lien détecté** : ❌ bonus de régénération générique, pas une
  production.

### Facette de courage
- **Description officielle** : *« Vos compétences cryo-électriques,
  solaires et abyssales infligent plus de dégâts aux cibles victimes de
  malus des Ténèbres. »*
- **Lien détecté** : ❌ modificateur de dégâts, pas une production.

### Facette d'équilibre
- **Description officielle** : *« Éliminer rapidement des cibles à l'aide
  de dégâts de Lumière confère de l'énergie de mêlée. Éliminer rapidement
  des cibles à l'aide de dégâts des Ténèbres confère de l'énergie de
  grenade. »*
- **Lien détecté** : ❌ dégâts génériques par polarité, pas un verbe
  catalogué précis.

### Facette de bravoure
- **Description officielle** : *« Éliminer des cibles à l'aide de
  grenades confère des munitions volatiles à vos armes abyssales.
  Éliminer des cibles à l'aide d'attaques de mêlée chargées confère des
  munitions effilochantes à vos armes filobscures. »*
- **Lien détecté** : ❌ types de munitions, pas un lien entre verbes
  catalogués (même famille qu'Écho d'instabilité et Fil de propagation).

### Facette de contrôle
- **Description officielle** : *« Infliger Gel ou Neutralisation à une
  cible recharge vos armes équipées et augmente la stabilité, l'aide à la
  visée et l'efficacité aérienne des armes. Éliminer des cibles gelées ou
  neutralisées crée un éclat stasique ou une Brèche abyssale. »*
- **Lien détecté** : ✅ **NOUVEAU LIEN** — Gel → Éclat stasique (confirme
  et complète Murmure de chaînes, qui ne couvrait que Armure de givre →
  Éclat stasique). Confirme aussi Neutralisation → Brèche abyssale déjà
  codé via Écho d'autorité. Les deux liens Gel/Neutralisation utilisent
  la MÊME description ici (source Prismatique commune) — codé sur Gel
  uniquement pour le nouveau lien, la partie recharge d'arme n'étant pas
  une ressource cataloguée.

### Facette de l'aube
- **Description officielle** : *« Les coups de mêlée chargée vous
  confèrent Radiance. Les frags de mêlée chargés confèrent Radiance à vous
  et à vos alliés proches. »*
- **Lien détecté** : ❌ nouvelle source de Radiance (mêlée chargée), pas un
  lien entre verbes catalogués.

### Facette de protection
- **Description officielle** : *« Quand vous êtes entouré de combattants,
  vous résistez mieux aux dégâts subis. Quand vous bénéficiez de
  Transcendance, l'effet est augmenté. »*
- **Lien détecté** : ❌ résistance défensive amplifiée par Transcendance,
  pas une production de ressource.

### Facette de bénédiction
- **Description officielle** : *« Les frags de mêlée vous rendent des
  points de vie. Quand vous êtes sous l'effet de Transcendance, les frags
  de mêlée rendent des points de vie à vos alliés proches et à
  vous-même. »*
- **Lien détecté** : ❌ soin non nommé Restauration/Soin, pas rattaché à un
  verbe du catalogue.

### Facette de détermination
- **Description officielle** : *« Ramasser un orbe de puissance confère
  Charge éclair, Restauration, Armure de givre, Maille tissée ou
  Surbouclier, selon le type de dégâts du Super que vous avez équipé. »*
- **Lien détecté** : ✅ **CONFIRME ET ÉTEND** — Charge d'armure (ramassage
  d'orbe) → Charge éclair / Restauration / Armure de givre / Surbouclier,
  en plus de Maille tissée déjà codé via Fil de tutelle. Codé (4 entrées
  supplémentaires sur `charge_armure`).

### Facette de guérison
- **Description officielle** : *« Les frags de grenade vous confèrent
  Soin. Les frags de grenade de Transcendance augmentent la puissance de
  l'effet. »*
- **Lien détecté** : ❌ nouvelle source de Soin (frags de grenade), pas un
  lien entre verbes catalogués — Transcendance amplifie seulement la
  magnitude.

### Facette de défiance
- **Description officielle** : *« Les coups de grâce créent une
  détonation qui inflige Secousse, Blessure solaire, Ralentissement,
  Sectionnement ou Volatilité aux cibles selon le type de dégâts du Super
  que vous avez équipé. »*
- **Lien détecté** : ❌ nouvelle source via coup de grâce, pas un verbe
  catalogué qui en produit un autre.

### Facette de solitude
- **Description officielle** : *« Réussir des tirs de précision émet une
  rafale de Sectionnement qui part de la cible. Quand vous êtes sous
  l'effet de Transcendance, la rafale de Sectionnement est plus
  grande. »*
- **Lien détecté** : ❌ nouvelle source de Sectionnement (tirs de
  précision, magnitude amplifiée par Transcendance), pas un lien entre
  verbes catalogués.

### Facette de ruine
- **Description officielle** : *« Augmente la taille et les dégâts de la
  rafale lorsque vous brisez un cristal de stase ou que vous gelez une
  cible, et augmente également la zone d'effet des Embrasements
  solaires. »*
- **Lien détecté** : ❌ modificateur de magnitude/zone, pas une nouvelle
  production.

### Facette de domination
- **Description officielle** : *« Vos grenades abyssales affaiblissent
  les cibles et vos grenades cryo-électriques infligent Secousse aux
  cibles. »*
- **Lien détecté** : ❌ nouvelles sources d'Affaiblissement et de Secousse
  (grenades), déjà couvertes génériquement — pas un lien entre verbes
  catalogués.

---

## Fragments déjà traités (reportés depuis le fichier 22)

### Tison de Charbon (Solaire)

- **Description officielle** : *« Vos Embrasements solaires infligent des
  Blessures solaires aux cibles touchées. »*
- **Lien détecté** : ✅ Embrasement → Blessure solaire (conditionnel).
  Codé dans `elementVerbs.ts` (`produit` sur `ignition`).
- **Infos communautaires** (DIM, non officielles) : les Embrasements
  confèrent 40 stacks de Blessure solaire (60 avec Tison de charbon
  équipé) aux cibles touchées par l'explosion. Non codées.
