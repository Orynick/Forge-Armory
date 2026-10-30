# Game Mechanics — Données Complètes
> Source: Destiny Data Compendium (Monument of Triumph, 9 juin 2026)

## Ability Chunk Energy

Ability Chunk Energy Gains are generally defined by the base cooldowns of all Abilities , including Class , Grenade , Melee , and Super Abilities . Season of the Wish altered how effects that give a chunk % of your Ability Energy , such as Demolitionist , Bomber , Dynamo , and Momentum Transfer , interact with Chunk Scalars. Supers remain unaffected (for now!) Chunk Scalars modify the %-based Energy Gains , down to x0.5 for Grenade and Class Abilities, and 0.6x for Melee Abilities. Unless explicitly stated, or if an Exotic interacts specifically with a listed Ability , all Ability Energy Gains are affected by Chunk Energy Scaling.

### Super Energy — Sources et valeurs

> Primary Weapons ont le meilleur ratio Damage→Super. Overkill Damage ne compte pas.

**Par Kill :**

| Rang | Super Energy |
|---|---|
| Tier 1 | 0.60% |
| Tier 2 | 0.96% |
| Tier 3 | 0.99% |
| Tier 4 | 1.80% |
| Guardian | 1.80% |
| Assist | 50% de la valeur kill |

**Par Orb of Power :**

| Source d'Orb | Super Energy |
|---|---|
| Reaper/Firepower/Heavy Handed x1 | 0.80% |
| Reaper/Firepower/Heavy Handed x2 | 1.10% |
| Reaper/Firepower/Heavy Handed x3 | 1.25% |
| Reaper/Firepower/Heavy Handed x4 | 1.50% |
| Siphon x1 / Power Preservation x1 / Subclass Fragments | 2.50% |
| Aeon Gauntlet Sect of Insight / Ward of Dawn (Crest) / Well of Radiance | 3.57% |
| Siphon x2 / Power Preservation x2 | 3.75% |
| Siphon x3 / Power Preservation x3 | 4.40% |
| Super Kills / Benevolent Finisher / Blight Ranger Super Kills | 7.15% |
| Ward of Dawn Super (intrinsic) | 2.30% |

## Armor Charges

Armor Charges are a resource used by Armor Charge Mods , activating certain Passive Effects while Armor Charges are active, or consuming Armor Charges in exchange for an instantaneous effect . By default, you can only hold up to 3 stacks of Armor Charge . Picking up any Orb of Power while any Armor Charge mod is equipped will grant x1 Armor Charge . Maximum Armor Charge Stacks can be increased to x4 | x5 | x6 by equipping the Charged Up Chest Armor Mod. Passive Mods grant a temporary effect while Armor Charges are active dependent on the mods used without needing a special interaction. Equipping any active Passive Mod will decay x1 Armor Charge every 10 seconds. Decay Timer is reset every time an Armor Charge is consumed or decayed . The Decay Timer can be extended to 15 | 18 | 20 seconds by equipping the Time Dillation Armor Mod in the Class Item.

- **Max par défaut** : 3 stacks. Charged Up Mod : +1 stack par mod (jusqu'à +3)
- **Durée** : 10s par stack. Time Dilation Mod : 15s/18s/20s avec 1/2/3 mods
- **Gain** : Ramasser un Orb of Power avec au moins 1 Armor Charge Mod équipé = +1 stack

## Character Stats

### HP & Shields (base Guardian)

Guardians possess, by default, 70 [100] Health Points with 34.5% Damage Resist against Combatants and 130 Shield Points . Health Stat above 100 grants additional Shield HP against Combatants , up to a maximum of +20 Shield HP at 200 Health Stat . Health | Start of Health Recovery : 1.75 seconds. Health Recovery Rate : ~ 27.5% Health/s. ( 20 [30] HP/s ) Shields | Start of Shield Recharge : 5.3s. Shield Recharge Rate : ~ 30% Shield/s. ( 39.5 Shields/s ) Damage dealt to Overshields does not stop Health Regeneration . ↑Enhanced Health Stat grants up to 25% faster start of Shield Recharge and 50% increased Shield Recharge Rate at 200 stat .

### Resilience — Shield HP vs Combatants

| Resilience Stat | Shield HP (vs Combatants) |
|---|---|
| ≤100 | 130 |
| 110 | 133 |
| 120 | 136 |
| 130 | 139 |
| 140 | 142 |
| 150 | 145 |
| 160 | 146 |
| 170 | 147 |
| 180 | 148 |
| 190 | 149 |
| 200 | 150 |

**Shield Regen :** Délai 4.9s → 3.675s à 200 Resilience (-25%). Rate +50% à 200.

### Mobility — Vitesses de déplacement

Titans and Warlocks have a baseline of 30 Mobility . Hunters have 100 [70] Mobility . Enhanced Athletics Leg Mod grants +30 | +50 | +60 Mobility .
Movement Speed Increases, such as Heartshadow's Wraithwalk or Tractor Cannon's Scientific Method only increase GROUNDED Movement Speed , they do not change Jump Height. The maximum movement speed is still limited to the aforementioned caps!

| Tier Mobility | Walk m/s | Strafe m/s | Crouch m/s |
|---|---|---|---|
| T3 (base Titan/Warlock) | 5.60 | 4.76 | 3.08 |
| T4 | 5.80 | 4.93 | 3.19 |
| T5 | 6.00 | 5.10 | 3.30 |
| T6 | 6.20 | 5.27 | 3.41 |
| T7 | 6.40 | 5.44 | 3.52 |
| T8 | 6.60 | 5.61 | 3.63 |
| T9 | 6.80 | 5.78 | 3.74 |
| T10 | 7.00 | 5.95 | 3.85 |

> Sprint Speed = **8 m/s fixe** quelle que soit la Mobility
> Hunters baseline : 100 Mobility [70]. Titans/Warlocks : 30 Mobility.
> Enhanced Athletics Leg Mod : +30/+50/+60 Mobility

### Discipline & Strength — Regen scalars

| Stat | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Scalar | 0.4x | 0.419x | — | 0.554x | — | 0.775x | — | 0.996x | 1.080x | 1.131x | 1.151x |
| Base Regen Units | 1 | 1.086 | — | 1.448 | — | 2.071 | — | 2.895 | 2.968 | 3.041 | 3.115 |

**Grenade Damage (Discipline) :** 0% à 0 stat → 65% max à 100 stat
**Melee Damage (Strength) :** +3% par 10 points → 30% max à 100 stat

## Armor 3.0 — Archétypes et Optimisation Stats
> Source : dérivé du CSV export DIM + confirmations utilisateur (juillet 2026, post Edge of Fate/Monument of Triumph)

### Table des Archétypes

Chaque archétype d'armure a 2 stats intrinsèques fixes par pièce : Primary = 30, Secondary = 25 (base, avant tertiary/tuning/masterwork). La Tertiary Stat ajoute +20 à une 3e stat — qui ne peut **jamais** être l'une des 2 intrinsèques (contrainte structurelle confirmée sur données réelles).

| Archétype | Nom français (jeu) | Primary (30) | Secondary (25) |
|---|---|---|---|
| Powerhouse | Maître ¹ | Weapons | Super |
| Grenadier | Grenadier | Grenade | Super |
| Gunner | Mitrailleur | Weapons | Grenade |
| Paragon | Parangon | Super | Melee |
| Skirmisher | Escarmoucheur ¹ | Melee | Weapons |
| Colossus | Colosse | Super | Health |
| Demolitionist | Démolisseur | Grenade | Class |
| Reaver | Pilleur | Class | Melee |
| Specialist | Spécialiste | Class | Weapons |
| Siegebreaker | Brise-siège | Health | Grenade |
| Bulwark | Rempart | Health | Class |
| Brawler | Pugnace | Melee | Health |

> **Noms français** : confirmés en jeu par l'utilisateur le 25/08/2026, avec leurs paires de stats (table déplacée ici depuis `23_RESSOURCES_EXTERNES.md` le 28/09/2026). Les 3 paires Santé+Arme, Mêlée+Grenade et Super+Classe n'ont délibérément **aucun** archétype : ces 12 forment la liste complète (confirmé en jeu).
> ¹ **Maître = Powerhouse** et **Escarmoucheur = Skirmisher** : correspondance établie par la paire de stats (Arme/Super et Mêlée/Arme, identiques et uniques), les deux noms anglais n'ayant pas été rencontrés dans les sources lues le 25/08. Même méthode que pour les 10 autres, mais pas encore vérifiée par le nom affiché en jeu en anglais.

> **Powerhouse est le seul archétype avec Weapons ET Super comme paire intrinsèque** — c'est la référence pour tout loadout DPS.
> Pour du roaming (ex: build Arc ability-spam), Powerhouse + tertiary Grenade couvre Weapons(150)+Super(125)+Grenade(100) sur 5 pièces sans aucun investissement supplémentaire.

### Masterwork (Upgrade x0 → x5)

Chaque armure droppe basique (T0) et s'upgrade jusqu'à x5 (T5 = masterworked). Chaque niveau donne **+1 aux stats qui ne sont NI intrinsèques NI tertiary** (les 3 stats "restantes" de la pièce). À T5 complet : **+5 à chacune de ces 3 stats**.

- Le masterwork ne touche jamais les 2 intrinsèques ni la tertiary
- Sur un stuff 5 pièces avec tertiary cohérente, un stat "dump" constant reçoit **+25 au total** (5×5)
- Masterworker à T5 est un **prérequis obligatoire** pour débloquer le Tuning (ci-dessous) — ce n'est pas son intérêt direct pour Weapons/Super, juste une porte d'entrée

### Tuning (T5 uniquement, gratuit en énergie)

Une fois à T5, un choix de Tuning devient disponible — **0 coût en énergie**, deux options :

- **Balanced Tuning** : +1 de plus aux 3 mêmes stats déjà boostées par le masterwork (+6 total avec MW complet)
- **Tuning Directionnel (+5/-5)** : redistribue 5 points d'une stat vers une autre, **cible libre** (y compris les intrinsèques). Convention : sacrifier Health (généralement inutile PvE) pour booster la stat désirée.

Pour un objectif Weapons/Super, seul le Tuning Directionnel est utile (Balanced ne touche jamais les intrinsèques). Avec 5 pièces tunées vers la même cible : **jusqu'à +25 sur un seul stat**.

### Slots de mods et budget énergie

| Slot | <T5 (4 slots) | T5 (5 slots) |
|---|---|---|
| 1 | Stat Mod (Major/Minor) — un seul, non stackable | Stat Mod (Major/Minor) — un seul, non stackable |
| 2 | Armor-specific mod | **Tuning (gratuit)** |
| 3-4 (ou 3-5) | Armor-specific mod (pool partagée) | Armor-specific mod (pool partagée, 3 slots) |

- **Général Stat Mod** : Major = +10 stat / 3 energy ; Minor = +5 stat / 1 energy — **un seul slot par pièce, pas de stacking multiple**
- **Budget énergie total par pièce** : 10 (11 avec Artifice — slot mineur bonus)
- **Font/Surge** : 3 energy chacun, occupent un des 3 slots "armor-specific"
- Convention de slot par pièce : Helmet=Super Font, Arms=Melee/Grenade Font (selon build), Chest=Health Font (skippable), Legs=Surge élémentaire OU Weapon Font (mutuellement exclusif), Class Item=Class Font (skippable)

### Fonts — mécanique conditionnelle (pas un ajout de stat statique)

Les Fonts (Super Font, etc.) donnent un bonus au stat **uniquement tant qu'on a des charges d'Armor Charge actives** (obtenues en ramassant des Orbes de Lumière). Ce bonus :
- **N'apparaît pas dans le total de stat affiché statiquement** (loadout screen hors combat)
- Est **stackable** (plusieurs copies du même Font) mais avec **diminishing returns** par copie supplémentaire
- Convention pratique : viser ~160 de stat de base (archétype+tuning+mods) + 2 Fonts (~+40 cumulé) = ~200 "virtuel" pendant le combat, en assumant des charges dispo en entrant en DPS (généralement vrai après une phase de roaming)

### Calcul complet — Loadout DPS Weapons/Super (Powerhouse)

Base 5x Powerhouse : Weapons 150 / Super 125.
Budget flexible (Tuning 25 + Stat Mods 50, hors Fonts) = **75 points combinés** à répartir.

Pour atteindre Super=200 en priorité (meilleur ratio dégâts/point, voir `01_DAMAGE_STACKING.md`) : dédier tout le budget flexible à Super.
→ **Weapons 150 / Super 200**, atteignable via archétype+tuning+mods seuls, sans utiliser un seul slot de Font.

**200/200 simultané est mathématiquement impossible** avec ce système (manque 50 points combinés). Plafond pratique : ~150-200 sur un stat et ~150 sur l'autre, ou ~172/178 en répartition équilibrée.

### Powerhouse vs Paragon vs mix (à Super fixé à 200)

Formule dérivée : `Total Weapons = 125 + 5k` où k = nombre de pièces Powerhouse parmi les 5 (5−k = Paragon).

| k (Powerhouse) | Weapons obtenu |
|---|---|
| 5 (full Powerhouse) | 150 |
| 0 (full Paragon) | 125 |

**Full Powerhouse domine mathématiquement.** Chaque pièce Paragon substituée coûte exactement **−5 Weapons** pour le même Super cible — compromis linéaire et prévisible, acceptable en attendant un meilleur roll Powerhouse.

### ⚠️ MIS À JOUR (28/10/2026, soir) — Statistiques d'une armure : ce que les données DU JEU de l'utilisateur ont établi (441 armures, 374 hors marques, statistiques lues dans le composant `ItemStats` 304)
- **Validation de la lecture** : les statistiques du jeu sont complètes (six valeurs) pour les 374 pièces. Une fois retirés l'effet du mod de statistique et celui de l'ajustement équipés, 280 pièces tombent EXACTEMENT sur 30·25·20 + trois petites statistiques égales : le jeu donne donc bien les TOTAUX affichés (mods et ajustement compris). L'ancienne reconstruction de l'appli était identique au jeu pour 66 pièces, **FAUSSE bien que complète pour 50** (surtout des armures d'avant : le jeu ajoute +2 sur trois statistiques que l'appli n'ajoutait pas) et **incomplète pour 258**.
- **Les 12 archétypes, chacun avec UNE seule paire primaire / secondaire (confirmé sur 280 pièces)** : Mitrailleur Armes/Grenade ; Maître Armes/Super ; Spécialiste Classe/Armes ; Pilleur Classe/Mêlée ; Parangon Super/Mêlée ; Colosse Super/Santé ; Grenadier Grenade/Super ; Démolisseur Grenade/Classe ; Escarmoucheur Mêlée/Armes ; Pugnace Mêlée/Santé ; Rempart Santé/Classe ; Brise-siège Santé/Grenade. Chaque statistique est primaire de deux archétypes. La **tertiaire** est tirée au hasard parmi les QUATRE autres statistiques (jamais la primaire ni la secondaire ; répartition quasi uniforme).
- **Palier 5 (286 pièces)** : primaire 30, secondaire 25, tertiaire 20, plus trois statistiques « non intrinsèques » **toutes égales à m** : **m = 0 pour 234 pièces (non maîtrisées), 5 pour 44 (maîtrisées), 3 ou 4 pour 6 (maîtrise partielle)**. La forme générale est donc 30·25·20·m·m·m avec m de 0 à 5 : elle couvre 284 des 286 pièces ; les 2 autres sont des exotiques à 29·18·11 (Emprise parallèle, Cœur de la Lumière intime).
- **Paliers 3 et 4 : les valeurs VARIENT d'une pièce à l'autre** (palier 4 : primaire 30, secondaire 24 ou 25, tertiaire 16 à 20 ; palier 3 : primaire 29 ou 30, secondaire 21 à 23, tertiaire 14 à 16 ; trois petites statistiques à 0, 1 ou 5). **Ne jamais supposer les valeurs : lire celles du jeu.**
- **Armures d'avant (palier 0, 63 pièces)** : ni archétype, ni ajustement ; répartition ancienne (somme 60 à 75, valeurs de 2 à 30) ; elles peuvent porter un mod de statistique.
- **Marques de classe (67)** : elles ont un archétype et suivent le MÊME modèle (par exemple Grenade 30, Super 25 + mod 10, Armes 20, trois petites à 5) ; 2 marques d'avant ont toutes leurs statistiques à 0 ; les marques d'avant (palier 0) ont 7 / 2 / 2 / 2 / 2 / 2 ou 2 sur toutes. **Elles comptent dans les statistiques d'un build.**
- **Valeurs négatives** : une statistique de pièce peut être négative (−5, −1) après un « − » d'ajustement sur une petite statistique.
- **Le « + » de l'ajustement directionnel** (39 pièces conformes, légendaires et exotiques) : sur la primaire × 11, la secondaire × 11, la tertiaire × 7, une statistique non intrinsèque × 10 : il tombe plus souvent qu'au hasard pur sur l'une des trois statistiques principales (29 sur 39) ; échantillon mélangé (les exotiques se règlent à la main).
- **Règles de l'équipement confirmées par l'utilisateur (28/10/2026)** : (1) **un objet de classe exotique (par exemple « Relativisme ») COMPTE comme une armure exotique** : une seule armure exotique en tout, marque de classe comprise ; (2) **un objet de classe exotique ne peut être équipé que si une doctrine PRISMATIQUE est équipée**.
- **Piège de l'appli (CORRIGÉ le 28/10/2026)** : l'appli RECONSTRUISAIT les statistiques en additionnant les bonus de plugs du Manifest. Un ancien commentaire du code disait que « ItemStats est vide pour l'armure » en citant le composant 302 : or 302 = ItemPerks, **les statistiques sont au composant 304 (ItemStats)**. L'appli demande maintenant le 304 (en production aussi) : pour une armure dont le jeu donne les six statistiques, `stats` = celles du jeu ; la reconstruction n'est qu'un repli (`statsReconstruites`).

## Loadout Swap — Roaming vs DPS

La plupart des joueurs endgame utilisent 2 loadouts liés par le swap (menu perso, <1s de transition) :

- **Loadout Roaming** : mobilité, mécaniques, exotic de confort, set bonus utilitaire (ex: Grasp of Avarice, Oryx's Memory). Cible : Weapons≥100, Super≥100, + stat de build subclass (souvent Grenade sur Arc)
- **Loadout DPS** : stats offensives max, set bonus orienté dégâts (ex: Vault of Glass/Salvation's Edge), Surges/Fonts. Cible : Weapons/Super poussés au maximum (voir calcul ci-dessus)

**Conditions pour préserver l'état au swap** :
- Config de subclass (aspects/fragments) **identique** sur les 2 loadouts → préserve la charge de Super et les cooldowns d'abilities
- Armes à munitions spéciales dans le **même slot** → préserve les munitions
- Ne pas changer d'arme Heavy → préserve les munitions Heavy également

## Champions of the Darkness

### Barrier Champions

Barrier Champions summon an impenetrable Shield once their Health is lowered past a difficulty-determined HP Threshold . Barrier Champions constantly regenerate a portion of their Health while shielded . The Shield can be damaged and broken through the usage of Anti-Barrier Effects , stunning the Champion for a brief time. The Shield's Durability is determined by difficulty. Stunning prevents the Champion from attacking, moving, or using any abilities. Dealing damage to the Shield briefly stops Health Regeneration . Additional Shield-Piercing Effects: Ignores Shielded Bane Shields, Hydra Shields, Hobgoblin Immunity, (Taken) Phalanx Shields, and Scorn Buckler Shields. Weapons deal 30% increased damage towards Titan Barricades.

| Info | Standard | Raid Expert/Master | Advanced | Expert | Master/GM |
|---|---|---|---|---|---|
| Champion HP | 2200 | 3300 | 4400 | 5000 | 5475 |
| Shield HP | 210 | ~333 | ~333 | ~410 | ~445 |
| Shield Summon Threshold | 60% | 60% | 60% | 75% | 85% |
| HP Regen pendant shield | 15%/s | 15%/s | 15%/s | 30%/s | 45%/s |
| Délai regen après shielding | 0.8s | 0.8s | 0.8s | 0.8s | 0.8s |
| Durée max shield | 5s | 5s | 5s | 5s | 5s |
| Délai regen après Shield-Piercing dmg | 1.6s | 1.6s | 1.6s | 1.6s | 1.6s |
| Stun duration après shield break | [?] | 7s | 7s | 6s | 5.5s |
| Shield Lockout après stun | [?] | 7s | 7s | 6s | 5.5s |

> ⚠️ **9 juin 2026** : Radiant, Volatile Rounds, Unravel Rounds **ne percent plus Barrier Champions.**
> Seuls les exotics/perks avec anti-Barrier intrinsèque fonctionnent.

### Overload Champions

Overload Champions passively restore their Health over time , use abilities and weapons more frequently , and move erratically unless stunned through Disruption . Stunning prevents the Champion from attacking, moving, or using any abilities. Disrupted Combatants are bugged and no longer deal 25% less damage for 5 seconds. Disrupting Guardians lowers their Ability Regeneration Rate by 0.4x. Overload Champion Stunning Application : Arc Jolt stuns upon dealing damage to the Champion . Stasis Slow stuns upon inflicting Slow Stacks to the Champion . Stasis Freeze stuns upon shattering the Champion . Void Suppression stuns upon suppressing the Champion .

| Info | Standard | Raid Expert/Master | Advanced | Expert | Master/GM |
|---|---|---|---|---|---|
| Champion HP | 2200 | 3300 | 4400 | 5000 | 5475 |
| Passive HP Regen | 4.5%/s | 4.5%/s | 4.5%/s | 13.65%/s | 27.4%/s |
| Stun duration | [?] | 7s | 7s | 6s | 5.5s |
| Cooldown entre stuns | — | — | — | 2.5s | 4.5s |
| Délai regen après disruption | 6.5s | 6.5s | 6.5s | 6.5s | 6.5s |

> Réappliquer Disruption avant 6.5s refresh le timer → maintient l'Overload stunné en continu.

### Unstoppable Champions

Unstoppable Champions relentlessly chase enemies, and possess 70% Damage Resist unless stunned . Damage Numbers visually appear as Italic Desaturated Pink Numbers Stunning removes the Damage Resist and prevents the Champion from attacking, moving, or using any abilities for the duration of the stun. Unstoppable Shots tend to inflict more Stagger , with certain weapons/effects forcing a stagger . Stunning Methods outside of Unstoppable Shots : Arc Blind Application Solar Ignition Application Strand Suspension Application

| Info | Standard | Raid Expert/Master | Advanced | Expert | Master/GM |
|---|---|---|---|---|---|
| Champion HP | 2200 | 3300 | 4400 | 5000 | 5475 |
| Damage Resist (non-stunned) | 70% | 70% | 70% | 70% | 70% |
| Stun duration | [?] | 7s | 7s | 6s | 5.5s |
| Cooldown entre stuns | — | — | — | 2.5s | 4.5s |

## Combatant Tiers

Combatants are divided into 4 different tiers. Each tier groups enemies within a certain range of Health . Elite Combatants have their Tier increased by +1 compared to their Rank-and-File equivalent . E.g: Psion (Tier 1) -> Elite Psion (Tier 2) Vandal (Tier 2) -> Elite Vandal (Tier 3) Champions, Minibosses, and Bosses are exempt from the Tier System , and will count as either the highest possible Tier , or have their own specific classification. Combatant Tiers affect the Ability Energy Gains and Effect Triggers , such as the Weapon Perks Headstone and Unrelenting, Fragments such as Ember of Searing and Whisper of Refraction , Exotics , like Vex Mythoclast and Promethium Spur , as well as certain Armor Mods.

| Tier | Cabal | Fallen | Hive | Vex | Taken | Scorn | Dread |
|---|---|---|---|---|---|---|---|
| T1 | Psion, War Beast | Dreg, Shank, Wretch | Cursed Thrall, Thrall | Fanatic | Thrall | Screeb, Stalker, Ravager | Attendant, Grim, Weaver |
| T2 | Incendior, Legionary, Phalanx | Marauder, Vandal | Acolyte | Harpy, Hobgoblin, Goblin | Acolyte, Goblin, Hobgoblin, Phalanx, Vandal | Lurker, Raider | Husk |
| T3 | Centurion, Gladiator | Captain | Knight, Wizard | Minotaur | Captain, Centurion, Knight, Minotaur, Wizard | Chieftain, Wraith | — |
| T4 | Colossus | Brig, Heavy Shank, Servitor | Shrieker, Ogre | Cyclops, Hydra, Wyvern | Ogre | Abomination | Subjugator, Tormentors, Omen |

> Elite Combatants = Tier+1 par rapport à leur équivalent Rank-and-File pour les calculs d'energy gain.

## Combatant Shields

Shielded Combatants are equipped with auto-recharging Elemental Shields that protect against Precision Damage and stagger/flinch. Shields begin recharging after 5 seconds of not receiving damage, or 5.5 seconds if broken, at a rate of 13.3% Shields every 0.2 seconds (66.6%/s) , being fully restored after 1.5 seconds. Elemental Damage deals 100% increased damage to Shields compared to Kinetic Damage . Matching Elemental Damage deals 200% increased damage to Shields compared to Kinetic Damage , or 50% increased damage compared to Non-Matching Elemental Damage . The ratio between damage dealt to Shields vs Health scales with activity difficulty, with higher difficulties having a much higher ratio.

### Overshields ennemis

**Lucent Hive Moth Overshields**
Lucent Hive can spawn with a Lucent Moth that bestows an Overshield to the wearer. Lucent Moths deattach when the Overshield is depleted, attempting to fly to another Lucent Hive Combatant without a Lucent Moth . Lucent Moths mid-flight can be detonated by damaging them, resulting in an explosion that deals up to ? Arc Damage over ? meters.

**Shadow Legion Tech Packs**
Shadow Legion Cabal can spawn with a Tech Pack that bestows an Overshield to the wearer. Cabal Combatants equipped with the Tech Pack will drop it on death, deploying it on the ground for 20 seconds, bestowing Cabal Combatants within ? meters with a stronger Overshield . Tech Pack Overshield begins recharging after 3.25 seconds at a rate of 60% Overshield/s .

## Banes

Non-Boss Combatants can spawn with Banes , enhancing the enemies with uniquely disruptive abilities. Combatants with Banes generally possess 60% Damage Resist against all damage.

### Final Shape Banes

**Drain**
Drain Combatants instantly tether to all Guardians in line of sight within 50 meters, inflicting Umbral Drain on them. Tether is removed upon losing line of sight or by being over 50 meters away. Invisible Guardians cannot be targeted by the Drain Combatant . Umbral Drain deals Moderate Non-Lethal Void Damage every ? seconds. Inflicting Suppression on the Drain Combatant will disable its draining abilities while the debuff is active. Invisible Guardians are not able to be tethered .

**Healing**
Healing Combatants bestow Health Regeneration to Combatants within 20 meters. Combatants with the Health Regeneration buff continuously restore HP . Rank-and-File Combatants restore 2.25% HP every 0.1 seconds (22.5% HP/s) . Elite Combatants restore 1% HP every 0.1 seconds (10% HP/s) . Combatants that leave the 20 meter radius will lose the Health Regeneration buff . Healing Combatants are unable to restore health to Champions , Bosses , or itself. Inflicting Suppression on the Healing Combatant will disable its healing abilities while the debuff is active.

**Hypernova**
Hypernova Combatants trigger a Self-Destruct Sequence after being lowered to 67% Health , and have 35% Damage Resist. Self-Destruct Sequence: Ocurrs over 7 seconds, ending in an explosive blast that deals Massive Solar Damage and knockback to all entities within 40 meters. Hypernova Combatants receive an additional 50% Damage Resist and restore 8.25% HP/s during the sequence. Nuclear Blast also kills the Hypernova Combatant in the process. Self-Destruct can be safely prevented by killing the Nuclear Combatant . Self-Destruct can also be avoided by being in cover or being over 40 meters away.

**Meteors**
Meteor Combatants send out 3 Solar Meteors every 20 seconds, and have 35% Damage Resist. Meteors track to nearby Guardians within 60 meters, exploding on contact and dealing Moderate Solar Damage . Meteors can be destroyed by shooting at them, making them collide on surfaces, or avoided by taking cover. Invisible Guardians are not able to be tracked.

**Mines**
Mine Combatants release 4 Proximity-Triggered Mines in a ♦️diamond formation on death, and have 35% Damage Resist. Mines deal up to 200 damage, down to a minimum of 50 damage, and can be destroyed by dealing damage to them. Inflicting Suppression on the Mines Combatant will prevent them from releasing mines on death.

**Pummel**
Pummel Combatants have an Immunity Shield until Physical Melee Damage is received, and have 35% Damage Resist. Despite the Immunity Shield , they are susceptible to crowd control effects such as Slow , Freeze , and Suspend . Glaive Melee and Sword Attacks can break the Immunity Shield . Breaking the Immunity Shield causes the Pummel Combatant , as well as other combatants within ? meters to be disoriented for 4 seconds.

**Shields**
Shields Combatants bestow a Permanent Overshield to Combatants within 20 meters, and have 60% Damage Resist. Overshield has 600 HP and does not receive Precision Multipliers or Energy Weapon Multipliers , but takes ~390% increased damage , reducing it to ~155 eHP . Overshield is not actually a Void Shield , despite being visually purple, and will not receive increased damage from Void sources . Combatants with Overshields continuously regenerate their Overshield at a rate of 150 (~38 eHP) Overshield HP/s (40%/s) . Breaking the Overshield permanently removes the Overshield. Shielding Combatants are unable to bestow Overshields to Champions , Bosses , or itself. Inflicting Suppression on the Shielding Combatant will disable its shielding abilities while the debuff is active. Killing the Shielding Combatant will instantly remove all Overshields it bestowed.

**Shock**
Shock Combatants build up a Shock Charge over ? seconds, and tether to Guardians within 30 meters and in line of sight, and have 35% Damage Resist. Shock Charge is discharged to tethered Guardians , dealing Severe Arc Damage to them. Inflicting Suppression on the Shock Combatant will disable Shock Charge build up while the debuff is active. Invisible Guardians are not able to be tethered . Shock Combatants explode on death, inflicting ? Arc Damage to combatants within 15 meters.

**Slowing**
Slowing Combatants project a slowing field over ? meters and and have 35% Damage Resist. Guardians inside the slowing field are instantly inflicted x10 Slow , followed by x5 Slow every 0.3 seconds while remaining inside. Inflicting Suppression on the Slowing Combatant will disable its slowing field while the debuff is active.

**Zealous**
Zealous Combatants bolster Combatants within 20? meters on death by enraging them. Enraged Combatants become aggressive and shoot more frequently in longer bursts. Enraged Combatants explode after being enraged for 20 seconds, dying in the process. Explosion can harm Guardians, dealing up to 50 Damage , down to a minimum of 15 Damage , and inflicting heavy knockback. Zealous Combatants , as well as Enraged Combatants are unaffected by Blind , Disorient , and Suppression , but remain susceptible to other CC effects.

### Edge of Fate Banes

**Caltrops**
Caltrops Combatants drop an Elemental Pool every 2 seconds and on death. Elemental Pools deal damage 4 times a second over 6 meters seconds for 5 seconds. Caltrop Combatants will relentlessly chase after Guardians, preferring to stay within Melee Range.

**Cascade**
Cascade Combatants periodically shoot out a Stasis Seeker every 6.5 seconds in front of them that travels up to 60 meters away at a speed of 15m/s. Stasis Seeker detonates upon impacting a wall or Guardian, inflicting x50 Slow over 6? meters for 4 seconds.

**Grasp**
Grasp Combatants periodically release multiple projectiles, with each turning into a Strand Turret . Strand Turrets last for 10 seconds, shooting threads that deal Strand Damage and inflict Unravel for 5 seconds on hit. Strand Turrets can be destroyed, but do not count as Constructs.

**Gravity**
Gravity Combatants periodically lobs out an accurate Vortex Mortar every 8 seconds towards Guardians up to 45 meters away, and have 60% Damage Resist. Vortex Mortar implodes on impact, pulling in Guardians within 6? meters. Vortex slowly expands in size to 9 meters while dealing Void Damage over Time for 4.5 seconds. After 4.5 seconds, the Vortex detonates, dealing moderate Void Damage over 9 meters. Inflicting Suppression on a Gravity Combatant temporarily disables their ability to generate Vortex projectiles.

**Promoted**
Promoted Combatants (from the Battlefield Promotion Modifier) gain 60% Damage Resist, deal 6.25% increased damage , and become ~50% physically larger. Inflicting Suppresion on a Promoted Combatant temporarily disables their Damage Resist and shrinks them down to regular size.

**Rage**
Rage Combatants deal bigger amounts of damage, have increasingly higher Damage Resist, and grow in size as their health is reduced. Damage Resist begins at 60% DR at 100% HP , gradually rising up to 90% Damage Resist upon reaching 30% HP . Damage Buff increases linearly from 0% Increased Damage at 100% HP , up to 70% Increased Damage at 10% HP . Size Increases maxes out at ~50% Increased Enemy Size.

**Screeber**
Screeber Combatants periodically release a Mini-Screebs every 3 seconds Screeber Combatants release 6 Mini-Screebs On death.

**Shield**
Shield Combatants possess an invulnerable frontal shield, as well as 30% Damage Resist. Shield can be penetrated by Shield-Piercing Weapons .

**Shroud**
Shroud Combatants project an aura that camouflages all other Combatants within 14 meters. Camouflaged Combatants are rendered almost fully invisible, except for overlayed effects such as debuffs and their shadow , and have no Name Plate. Aim Assist and tracking projectiles work as usual. Effects that rely on directly targeting an enemy (such as Final Warning ) do not work on the camouflaged combatants . Inflicting Suppression on the Shroud Bane Combatant temporarily removes the camouflage from other Combatants .

**Threaded**
Threaded Combatants release hostile Threadlings upon being dealt NON-Precision Damage with a 0.3 second cooldown between each spawn.

### Renegades Banes

**Protected**
Protected Combatants are guarded by 1–3 Protecting Drones , each with 100 HP . Protected Combatants have 90% Damage Resist for as long as a Protecting Drones is present. Destroying all drones removes the Protected Bane status.

**Medusa**
Medusa Combatants Looking directly at an affected enemy combatant builds up Stasis slow stacks on you until you freeze.

## Activity Modifiers

### Elemental Threats (négatif)

| Modifier | Effet |
|---|---|
| Elemental Threat ▲▲ | +25% incoming matching elemental damage |
| Difficult Elemental Threat ▲▲▲▲ | +50% incoming matching elemental damage |
| Deadly Elemental Threat ▲▲▲▲▲ | +66.6% incoming matching elemental damage |

### Minor Negatives (comportement ennemis)

| Modifier | Effet |
|---|---|
| **Chill Touch** | Combatant Melee Attacks inflict Stasis Slow for 3 seconds. Does not inflict Slow Stacks, and cannot be refreshed until it expires. |
| **Counterfeit** | Combatants have a 10% chance to drop Loot-shaped Explosives on death. The Loot-shaped Explosives are triggered upon being within ? meters, detonating after 3 seconds, dealing 162.5 Arc Damage . Loot-s |
| **Hot Step** | Elite+ Combatants drop a pool of fire under themselves on death that lasts for 2.5? seconds, dealing Solar? Damage to Guardians within 1 meter every 0.5 seconds up to 5 times. |
| **Subtle Foes** | Combatants that aren't within 10 meters have Void Invisibility active. Affected Combatants : Vex Goblin | blep blep blep blep |
| **Cabal: Pestilence** | Cabal Psions drop a Void Grenade underneath themselves on death. Void Grenades explode after ? seconds, dealing Void Damage . |
| **Fallen: Arach-No!** | Fallen Vandals spawn a Web Mine on death. Web Mines trigger upon being within ? meters, detonating after ? seconds. Web Mine detonations deal Arc Damage and create a disorienting field that reduces Mo |
| **Hive: Fire Pit** | Hive Acolytes spawn a Fire Pool on death. Fire Pools deal Solar Damage for ? seconds. |
| **Scorn: Festering Rupture** | Scorn Stalkers spawn a Mini-Screeber on death. Mini-Screebers crawl towards Guardians, exploding on contact or upon being shot, dealing Arc Damage over ? meters. |
| **Taken: Epitaph** | Taken Combatants spawn an Arc? Blight Geyser on death. Blight Geysers deal Arc? Damage and inflict heavy knockback after ? seconds. |
| **Vex: Shocker** | Vex Goblins spawn an Arc Pool on death. Arc Pools deal Arc Damage every ? for ? seconds. |
| **Cabal: Scorched Earth** | Cabal Psions drop a Void Grenade underneath themselves on death. Void Grenades explode after ? seconds, dealing Void Damage . |
| **Fallen: Hot Knife** | Fallen Shanks now have an additional Solar Shield . Certain Shanks that have forced Elemental Shields , such as the Zero Hour's Servitor Shield ones will have both shields "stacked" on top of each oth |
| **Hive: Martyr** | Hive Cursed Thralls have ?% increased HP . |
| **Scorn: Raider Shields** | Scorn Raiders now have an additional Void Shield . |
| **Taken: Denial** | Taken Vandal Shield Summon Cooldown is reduced from ? seconds to ? seconds. |
| **Air Superiority** | Airborne Combatants deal 30% Increased Damage . |

### Major Negatives

| Modifier | Effet |
|---|---|
| **Grounded ▲▲▲▲** | While airborne : 100% Increased Incoming Damage . |
| **Blasts ▲▲▲▲** | Combatants deal 25% Increased Splash💥 Damage . |
| **Energy Drain ▲▲** | 0.8x Ability Regeneration Rate. |
| **Battlefield Promotion ▲▲▲▲** | Promoted Bane Combatants can now appear randomly. Combatants that kill a Guardian or another Combatant are granted the Promoted Bane. Promoted Combatants gain 60% Damage Resist, deal 6.25% increased d |
| **Slow and Small** | 25% decreased Weapon and Ability damage. |
| **Glass Cannon 'nt** | For the Guardian with the most kills in the fireteam: -50% increased Incoming Damage . MATH QUESTION: What happens when you increase a value by a Negative Amount. |
| **Haste Trade - Off** | While Movement Speed is ≤4 meters per second for at least 5 seconds: Triggers Danger, Keep Moving! for 4 seconds, then deals 12.5 damage every second until Movement Speed is ≥4 meters per second. Afte |
| **Volatile Shields Trade - Off** | Shield HP is increased by 70 HP . Upon reaching Critical Health : Triggers a Time Bomb , with the Detonation Imminent timer scaling with the remaining health, up to a maximum of 20 seconds. Grants Dev |
| **Osci l lati on Trade - Off** | Dealing damage with Kinetic and Power Slot Weapons reduces their damage, and increases Energy Weapons damage, and vice versa. Weapon Damage Multipliers: Decay 1x = 0.85x (-15%) | Decay 2x = 0.767x (-2 |
| **Lightning Crystals Trade - Off** | 4.25x Arc and Stasis Grenade and Melee Ability Regeneration Speed. 30% Increased Incoming Arc and Stasis Damage . |
| **Cosmic Superconductor Trade - Off** | ?% Additional Base Arc and Stasis Super Ability Regeneration Rate. 20% Increased Elemental Incoming Damage . |
| **Ashes to Ashes Trade - Off** | Dealing Solar Weapon Damage to an Unscorched Enemy inflicts x40 +0 Scorch . Incurs a 5 second cooldown before additional Scorch can be inflicted. Combatants inflict x30 Scorch upon dealing Solar or Ex |
| **Combat Acceleration Trade-Off** | After damaging a target with a weapon many times in rapid succession, you will regain ability energy for your melee, Grenade, and Class abilities. The base cool-down time for these abilities is length |
| **Low Gravity** | Gravity is significantly reduced. how to even measure this lol |
| **Brawn ▲▲** | Passively grants an additional +50 Health and +250 Shields . Total Health Pool is increased to 120 Health and 380 Shields . Overshield cap isn't changed, and all Overshield gains are also reduced by 7 |
| **Focus Fire ▲▲** | Direct (Impact) Damage is increased by 20-40%. Indirect (Explosive/Splash/AoE) Damage is decreased by 30-50%. Kinetic Tremors: 30% decreased Jolt: 50% decreased. |
| **Lawless Frontier Modified Health Rules** | Passively grants an additional +70 Health and +300 Shields . Total Health Pool is increased to 140 Health and 430 Shields . Overshield cap isn't changed, and all Overshield gains are also reduced by 7 |
| **Matchgame ▲▲▲▲** | Combatant Shields take 80% decreased damage from Non-Matching Damage . |

### Trade-Offs (positif + négatif)

**Haste Trade - Off** : While Movement Speed is ≤4 meters per second for at least 5 seconds: Triggers Danger, Keep Moving! for 4 seconds, then deals 12.5 damage every second until Movement Speed is ≥4 meters per second. After 0.75 seconds of having Movement Speed above 8m/s: Continuously restores 10 HP/s until Movement Speed has decreased below ?m/s for ? seconds.

**Volatile Shields Trade - Off** : Shield HP is increased by 70 HP . Upon reaching Critical Health : Triggers a Time Bomb , with the Detonation Imminent timer scaling with the remaining health, up to a maximum of 20 seconds. Grants Devour for 20(!!!) seconds. Time Bomb : Removes the ability to cast Non- Super (and Movement) Abilities or use weapons. ?% Decreased Movement Speed and -3.5 HP/s while shieldless . Allows the usage of weapons from a third-person perspective after 2 seconds. Detonates once timer expires, killing the Shieldless Guardian and dealing ? damage to Combatants within ? meters. Time Bomb can be defused by having allied Guardians [interact] with the afflicted Guardian while within ? meters, by healing out of Critical Health , or by casting Super Ability .

**Osci l lati on Trade - Off** : Dealing damage with Kinetic and Power Slot Weapons reduces their damage, and increases Energy Weapons damage, and vice versa. Weapon Damage Multipliers: Decay 1x = 0.85x (-15%) | Decay 2x = 0.767x (-23.3%) | Decay 3x = 0.65x (-35%) Boost 1x = 2x (+100%) | Boost 2x = 3x (+200%) | Boost 3x = 4x (+300%)

**Lightning Crystals Trade - Off** : 4.25x Arc and Stasis Grenade and Melee Ability Regeneration Speed. 30% Increased Incoming Arc and Stasis Damage .

**Cosmic Superconductor Trade - Off** : ?% Additional Base Arc and Stasis Super Ability Regeneration Rate. 20% Increased Elemental Incoming Damage .

**Ashes to Ashes Trade - Off** : Dealing Solar Weapon Damage to an Unscorched Enemy inflicts x40 +0 Scorch . Incurs a 5 second cooldown before additional Scorch can be inflicted. Combatants inflict x30 Scorch upon dealing Solar or Explosive Damage. Incurs a 3 second cooldown before additional Scorch can be received.

**Combat Acceleration Trade-Off** : After damaging a target with a weapon many times in rapid succession, you will regain ability energy for your melee, Grenade, and Class abilities. The base cool-down time for these abilities is lengthened.

**Low Gravity** : Gravity is significantly reduced. how to even measure this lol

### Boons (positifs)

| Modifier | Effet |
|---|---|
| **Air Superiority ▼** | While airborne : 30% increased Ability and Weapon Damage. |
| **Brawler ▼** | 100% increased Melee Ability Damage and 5x Melee Ability Regeneration Speed . Multiplicative melee damage increase. |
| **Carousel of Pain ▼** | Rotates between Arc -> Solar -> Void -> Arc ->... elements every 30 seconds. Grants 30% increased Elemental Damage towards the currently selected element . |
| **Class Healing ▼** | On Class Ability Usage : Restores HP to the user and allies within ? meters. Healing amount is based off of the equipped Class Ability . 70 HP = Acrobat Dodge , Towering Barricade , Rifts 58 HP = Gamb |
| **Elemental Surge ▼** | 25% Increased Elemental-Matching Damage. |
| **Frag Pickpocket ▼** | On Finisher : Converts the next thrown grenade into a Fragmentation Grenade that deals up to 1000 Kinetic Damage and knocks enemies backl Mechanically identical to Forerunner's The Rock. |
| **Full Throttle ▼** | Kills grant a stack of Full Throttle , up to a maximum of 100 stacks . Dying removes threshold-based stacks. 0x–9x = 0x | 10x–39x = 10x | 40x–100x = 40x Full Throttle grants 1% increased damage per st |
| **Fury! ▼** | Scoring a kill progresses a Kill-based counter by 4%. Counter passively decreases by 1% every 2 seconds. Upon reaching 100% Fury : Consumes the counter to trigger Fury! for 15 seconds and grant 100% H |
| **Grappler ▼▼▼▼** | Replaces Grenade Ability with a modified Grapple Grenade . Grapple Grenade has 3 Charges and does not grant access to Grapple Melee . Passively grants 5% Grapple Grenade Energy/s while grounded. Killi |
| **Grenadier ▼** | 100% increased Grenade Ability Damage and 5x Grenade Ability Regeneration Speed . |
| **Grit ▼** | Dying grants a permanent stack of Grit , up to a maximum of 30 stacks. Grit grants 3% Damage Resist, up to a maximum of 90% DR at 30 stacks. |
| **Healing Finishers ▼** | On Finisher : Restores 70 HP to the user and allies within ? meters. |
| **Heavyweight ▼** | 100% increased Power Weapon Damage and 1.5x Power Ammo Progress Multiplier . |
| **Hypercritical ▼** | 140% increased Weakspot Damage . Weakspot involves hitting the Precision Weakspot , without necessarily dealing Precision Damage . This means it works through Elemental Shields , but not on Divinity's |
| **Live Wire ▼** | After 1 second of sprinting , while maintaining both sprint and a movement speed of at least 5m/s: Grants Amplified every second. While Amplified : Receiving a Melee Hit triggers a lightning storm , d |
| **Ranger ▼** | Scoring Precision Kills with Bows, Scout Rifles, and Sniper Rifles progresses a Counter : Bows, Scout Rifles = 16.7% | Sniper Rifles = 34% Upon reaching 100% Counter Progress : Spawns a Special Ammo B |
| **Shot Caller ▼** | Upon scoring 3 Primary Ammo Precision Hits within 2 seconds of each : Grants Shot Caller for 15 seconds. Scoring additional Precision Hits extend the buff duration by +5 seconds, up to 15 seconds. Sho |
| **Slayer ▼** | For the Guardian with the most kills in the fireteam: 15% increased Ability and Weapon Damage. |
| **Solar Slide ▼** | After sprinting for ? seconds : The next slide creates a Solar Wave that explodes on impact, dealing up to 540 Solar Damage and inflicting x60 +30 Scorch , over 5 meters. Solar Wave additionally relea |
| **Special Ammo Increased ▼▼▼▼** | Grants 1.25x Special Ammo Transmat Multiplier . |
| **Stasis Slide ▼** | After 1 second of sprinting , while maintaining both sprint and a movement speed of at least 5m/s: The next slide releases a Tracking Stasis Wave that travels up to 30 meters, dealing 20 Stasis Damage |
| **Strand Pickpocket ▼** | On Finisher : Converts the next thrown grenade into a Strand Grenade that deals 475 Strand Damage over 5 meters and releases 11 Unraveling Threads . |
| **Stunning Emotes ▼** | After scoring multiple kills : Grants Stunning Emote . Emoting while Stunning Emote is readied inflicts enemies with an Elemental Debuff . 12 Kills = Inflicts Blinds over a 30 meter radius. 32 Kills = |
| **Trained Finesse ▼** | Precision Weapon Kills grant a stack of Trained Finesse , up to a maximum of 2 stacks . Non-Precision Weapon Kills remove a stack . While at 2x Trained Finesse : Precision Kills grant ?% Grenade , Mel |
| **Volatile Pickpocket ▼** | On Finisher : Converts the next thrown grenade into a Void Grenade that deals up to 660 Void Damage over 5 meters releases 5 submunitons that deal up to 330 Void Damage , and inflicts Volatile . |

### Hunger (Ability Regen conditionnel)

Elemental Hunger
Grants a 🍔 Hunger meter that constantly drains at a rate of 2% 🍔Hunger every second. Scoring a Modifier-Matching Hit grants 5% 🍔Hunger meter . While 🍔 Hunger is below 50% : Elemental Starvation | No effect. Seemingly no effect on Ability Regeneration? While 🍔 Hunger is between 50% and 99% : Elemental Hunger | No positive or negative effects, nada. Upon reaching 🍔100% Hunger : Grants Ability Surge for 20 seconds. 750% Additional Base Grenade , Melee , Class , and Super Ability Regeneration Rate.

### Famine (Ammo reduction)

| Modifier | Effet |
|---|---|
| All Ammo Famine ▲▲▲▲ | 0.8x Special + Heavy Ammo Transmat |
| Heavy Ammo Famine ▲▲ | 0.8x Heavy Ammo Transmat |
| Special Ammo Famine ▲▲ | 0.8x Special Ammo Transmat |

### Challenge Modifiers (loadout effectiveness)

| Modifier | Effet |
|---|---|
| Brawn ▲▲ | +50 HP +250 Shields, mais HP gains -70%, passive HP regen disabled. Combatants drop Healing Orbs |
| Focus Fire ▲▲ | Direct Impact +20-40%, Explosive/AoE -30-50% |
| Matchgame ▲▲▲▲ | Combatant Shields = 80% DR vs Non-Matching damage |
| Lawless Frontier | +70 HP +300 Shields, HP gains -70%, Regen modifié |
| Slow and Small | -25% weapon + ability damage |
| Glass Cannon 'nt | Guardian avec le plus de kills = -50% incoming damage |

## Elemental Orbs

Elemental Orbs are Subclass-themed throwable pickups. Subclass-Matching Weapon Kills progress a counter that spawns an Elemental Orb upon reaching 100% if the relevant Artifact Perk is active. Counter System: Combatants = 25?% | Guardians = 50%

Elemental Orbs remain on the ground for up to 20 seconds before expiring. Orbs that are picked up can be held for up to 20 seconds. Thrown Orbs apply an Elemental Debuff and deal up to 450 [100] damage to enemies within 5? meters. Elemental Orb Kills count as Weapon Kills, and are able to activate On-Kill effects, such as Siphon, Ammo Finder, and Spark of Discharge . Arc Elemental Orbs apply Jolt . Kills from Jolt's chain lightning do not count as Elemental Orb Kills , and are not affected by Elemental Orb Damage Increases. Solar Elemental Orbs apply x40 +20 Scorch . Kills from Solar Effects that were initially triggered by Orbs count as Elemental Orb Kills. Solar Effects ' Damage is affected by Elemental Orb Damage Increases , such as S22's Frenzied Stacks. Void Elemental Orbs apply Volatile . Kills from Volatile Explosions do not count as Elemental Orb Kills , and are not affected by Elemental Orb Damage Increases .

## Heat Weapons (Blasters)

Weapons with the intrinsic Heat Weapon trait uniquely generate Heat as they fire, using Ammo directly from reserves instead of utilizing regular magazines. Heat Weapons can manually vent Heat at a Vent Speed-based rate instead of reloading, triggering On-Reload effects. Manual Vent can be cancelled at any point. Heat Gauge ranges from 0 Heat to 1000 Heat , represented in game with 2 different values. Heat Generated and Cooling Efficiency work in the 0-1000 range wherein each point counts as 0.1% Heat , while the in-game magazine displays the Heat% . Each shot generates Heat equal to the Heat Generated stat, while Cooling Efficiency is the amount of Heat passively dissipated every second. Exceeding 1000 Heat forcefully triggers an Overheated Manual Vent . Overheated Manual Vent renders the weapon unusable until it reaches ≤150 Heat . Overheated Weapons have instantaneous stow. Heat Weapons deal 15% Increased Impact Damage to Elite+ Combatants . Dynamic Heat Weapons intrinsically deal 15% [2.5%] Increased Impact Damage that multiplicatively stacks with the aforementioned increase.

| Type | Caractéristiques |
|---|---|
| **Balanced** | Upon beginning a Manual Vent while Heat is ≥875 : 2x Vent Rate Multiplier . |
| **Dynamic** | While Heat is ≤125 : Dynamic Heat Limiter | -50% Heat Generation for 5 seconds or until stowing the weapon. Triggering Dynamic Heat Limiter after having dealt damage will freeze the timer until shooting. |

**Weapons Heat connues :**

| Weapon | Type | Frame |
|---|---|---|
| Bitter End | MG | Rapid-Fire |
| Heirloom | Exotic Special Combat Bow | — |
| High Tyrant | Pulse Rifle | Rapid-Fire |
| M-17 Fast Talker | SMG | Adaptive |
| Voltaic Shade | Scout Rifle | Rapid-Fire |
| Zealous Ideal | Auto Rifle | Precision |
| Conspiracy Honed | Sniper | Rapid-Fire |
| All or Nothing | Pulse Rifle | Rapid-Fire |
| Compact Defender | Sidearm | Lightweight |
| Uncivil Discourse | HC Special | Special Ammo |
