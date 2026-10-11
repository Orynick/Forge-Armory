# D2 Damage Stacking — Base de Données Complète
> Source: Destiny Data Compendium + Court's Damage Stacking Guide (mis à jour 9 juin 2026 / Update 9.7.0)
> Toutes les valeurs sont PvE sauf mention [PvP]

## 1. Catégories de Buffs — Règles de Stacking

| Catégorie | Description | Règle de stacking |
|---|---|---|
| **Global Debuffs** | Effet infligé SUR l'ennemi | Ne stack PAS — seul le plus haut s'applique |
| **Empowering Buffs** | Effet appliqué SUR le Guardian | Ne stack PAS — seul le plus haut s'applique |
| **Weapon Surges** | Bonus via le système Armor Charge | Ne stack PAS (même élément) — le plus haut prioritaire |
| **Amplification Modifiers** | Bonus directs sur arme/capacité | Stack avec TOUT + lui-même |
| **Exotic Intrinsics** | Bonus exotique sur arme/capacité | Stack avec TOUT + lui-même |
| **Weapon Perks** | Perks d'armes activés | Stack avec TOUT + lui-même |
| **World & Activity** | Overcharge, Activity Surges, Raid mods | Stack avec TOUT (sauf Overcharge + Activity Surge ne stackent pas ensemble) |

> **Note critique** : Tout est MULTIPLICATIF. Ex: 1.15 × 1.22 × 1.30 = ~1.83x dégâts totaux

## 2. Global Debuffs (infligés sur l'ennemi)

### Weaken — Standard (15% PvE / 7.5% PvP)

| Source | Type | Trigger | Durée | Notes |
|---|---|---|---|---|
| Echo of Undermining | Fragment Void | Void Grenade damage | 6s | Lingering grenades refresh en continu |
| Facet of Dominance | Fragment Prismatic | Void Grenade damage | 6s |  |
| Child of the Old Gods | Aspect Void Warlock | Void Soul tether drain | 5s* | Se refresh tant que le Soul drains |
| Contraverse Hold | Exotic Warlock | Charged Grenade damage | 6s |  |
| Felwinter's Helm | Exotic Warlock (hit) | Powered Melee hit | 6s | Kill/Finisher = 30% (voir Powerful Weaken) |
| Khepri's Sting | Exotic Hunter | Kill sur cible Weakened | 15s | Cloud au point de mort |
| Snare Bomb | Melee Void Hunter | Smoke Bomb damage | 8s |  |
| Nova Warp | Super Void Warlock | Dark Blind seekers | 6s |  |
| Stylish Executioner | Aspect Void Hunter | Melee pendant invis | 5s |  |
| Ward of Dawn | Super Void Titan | Cast + ennemis dans le dôme | 6s |  |
| Twilight Arsenal | Super Void Titan | Axe hits | 6s | Se refresh sur chaque hit |
| Demoralize | Weapon Perk | Precision kills | 6s |  |
| Withering Gaze | Weapon Perk | ADS 1.5s sans tirer | 6s |  |
| Maligned Harvest (Tablet of Ruin) | Artifact Perk | Après 4x Volatile appliqués | 6s | Prochain Void damage instance |
| Supernova (Revenant/Deep) | Artifact Perk | Void Breach pickup | 8s | Prochain Void damage dans 10s |
| Weakened Clear (Revenant) | Artifact Perk | GL damage Boss/Champion/Shield | 20s | Cooldown = sa propre durée, non refreshable |
| Singularity Blade (Renegades) | Artifact Perk | Melee/Sword hit avec Void Buff actif | 6s |  |
| Debilitating Wave (Revenant) | Artifact Perk | Finisher avec Void Super équipé | 6s |  |
| Void Infestation (Renegades) | Artifact Perk | Kill sur Weakened enemy | 6s | Spawn projectiles qui weakenent |
| Gwisin Vest | Exotic Hunter | Exit Invis near enemy | 10s | Cloud de smoke |
| Second Chance | Exotic Titan | Shield Throw hit | 10s |  |
| Chromatic Fire | Exotic Warlock | Precision kill (AOE Void) | 6s |  |
| On the Prowl | Aspect Void Hunter | Kill sur Priority Target | 6s | Cloud smoke + invis alliés |
| Trapper's Ambush | Aspect Void Hunter | Quickfall Smoke Cloud damage | 10s |  |
| Spectral Blades | Super Void Hunter | Heavy Attack | 6s |  |
| Buried Bloodline (cat.) | Exotic Sidearm | Shots while Devour active | 5s |  |
| Collective Obligation (alt-fire) | Exotic Pulse | Void Leech siphoned | 10s | 30% -> 15% conversion |
| Deterministic Chaos | Exotic MG | Every 4th Heavy Metal shot | 6s |  |
| Heartshadow | Exotic Sword | Heavy Attack | 6s |  |
| Tessellation (cat.) | Exotic FR | Void Grenade charged shot | 6s |  |
| Praxic Blade | Exotic Sword | Melee/Reflect/Ranged hit avec Void Super | 6s |  |

### Weaken — Powerful (30%+)

| Source | % PvE | Durée | Notes |
|---|---|---|---|
| Deadfall Tether | 35% | Durée Super | Immutable, non extensible par d'autres Weaken |
| Moebius Tether | 30% | Durée Super | Immutable, non extensible |
| Felwinter's Helm (kill/finisher) | 30% | 5s/10s/15s/20s selon rang | Extensible par d'autres Weaken |
| Tractor Cannon | 30% | 10s | Extensible, aussi Suppression |
| Fafnir (LFR) | 30% | 4s | Monument of Triumph, extensible |
| Divinity | 15% | ~ | Cage de précision ; ne stack pas avec les autres Weaken |

## 3. Empowering Buffs (appliqués SUR le Guardian)

| Source | % PvE | Durée | Notes |
|---|---|---|---|
| Banner Shield (Weapons of Light) | 40% | Durée Super | Allies derrière le bouclier |
| Well of Radiance | 25% | 30s base | +Radiant 20% après avoir quitté 8s |
| Empowering Rift | 20% | 15s | Sanguine Alchemy pause le timer sur kills |
| Radiant | 20% | Variable | Nombreuses sources (voir section Radiant) |
| Gyrfalcon's Hauberk | 35% | 6s | Finisher pendant Invis uniquement |
| Wormgod Caress | 35% max | Variable | Stacks (20/25/30/35%) décroissant |
| No Backup Plans | 35% | Durée Overshield | Shotguns uniquement |
| Ward of Dawn + Saint-14 | 25% | 15s | Refreshable en repassant |

### Sources de Radiant (20% PvE / 10% PvP)

| Source | Trigger | Durée | Portée |
|---|---|---|---|
| Acrobat's Dodge | Class Ability use | 10s | User + alliés 8m |
| Ember of Torches | Powered Melee hit | 8s | User + alliés 8m |
| Facet of Dawn | Powered Melee hit/kill | 4s | User + alliés 8m |
| Lightweight Knife | Precision hit | 10s | User |
| Rain of Fire | LFR/FR kill | 7.5s | User |
| Well of Radiance (exit) | Quitter le Well | 8s | User + alliés |
| Song of Flame Super | Activation | Durée Super | User uniquement |
| Fever and Chill (Artifact) | Rapid Solar precision hits | 10s | User |
| Heart of the Flame (Artifact) | Super Cast | 10s | Alliés 15m |
| Radiant Orbs (Echoes Artifact) | Orb pickup (Solar/Prismatic) | 10s | User |
> Ember of Solace : durée Radiant +50% (ex: 8s → 12s)

## 4. Weapon Surges

### Valeurs Armor Surge (mods jambes)

| Stacks | Bonus PvE | Bonus PvP |
|---|---|---|
| x1 | +10% | +3% |
| x2 | +17% | +4.4% |
| x3 | +22% | +5.5% |
| x4 | +25% | +6% |

> x4 uniquement via Exotic Armor ou Artifact Perk (pas via mods seuls)
> Mods de même élément ne stackent pas — le plus haut prévaut
> Mods d'éléments différents = stack OK

### Exotics qui donnent des Surges

| Exotic | Élément | Trigger | Valeur | Durée |
|---|---|---|---|---|
| Mantle of Battle Harmony | Matching Super | Matching weapon kill avec Super chargé | x4 (25%) | 11s |
| Sanguine Alchemy | Matching Super | Dans un Rift/Well | x4 (25%) | Durée Rift |
| Eternal Warrior | Arc | Arc kills (1-4) / Fists of Havoc end | x4 (25%) | 11-30s |
| Doom Fang Pauldron | Void | Void kills (1-4) / Void Powered Melee kill | x4 (25%) | 11s |
| Blight Ranger | Arc | Arc Staff deactivation | x4 (25%) | 21s |
| Fr0st-EE5 | Stasis | Tant que Frost Armor actif | x3 (22%) | ~ |
| Ballidorse Wrathweavers | Stasis | Frostpulse (x2) / Winter's Wrath end (x4) | x2-4 | 11-15s |
| Foetracer | Matching ability | Ability damage sur Elites+ | x4 (25%) | 16s |

### Artifact Surges notables

| Perk | Artifact | Élément | Trigger | Valeur |
|---|---|---|---|---|
| Void Weapon Channeling | NPA Repulsion Regulator (Deep) | Void | Void weapon kill avec Void Ability chargée | x1-4 selon abilities chargées |
| Elemental Overdrive | Implement of Curiosity | Matching pickup | Pickup élémentaire | x3 (22%) 7s |
| That Fresh Bullet Smell | Implement of Curiosity | Kinetic | Ammo pickup | x2 (17%) 11s |
| Precision Equity | Encrypted Data Disk | Matching | Orb spawné par Precision Equity | x2 (17%) 11s |

## 5. Amplification Modifiers (stackent avec tout)

| Source | % PvE | Durée | Condition | Notes |
|---|---|---|---|---|
| Weapons Stat (0-100) | Reload/Handling +10% (plafonné) + Damage +15% (plafonné) | ∞ | RnF + Elites uniquement | Valeurs confirmées via tooltip in-game, identiques et plafonnées dès stat=100, ne bougent plus ensuite |
| Weapons Stat (101-200) — Primary/Special PVE | +0.15%/stat | ∞ | Bosses + Guardians | Confirmé via tooltip : 160→8.9%(~9.0%)/170→10.5%/180→12.0%/190→13.5%/200→15.0% |
| Weapons Stat (101-200) — Primary/Special PVP | +0.05%/stat | ∞ | Bosses + Guardians | Confirmé linéaire 160→3.0% ... 200→5.0% |
| Weapons Stat (101-200) — Heavy PVE | +0.10%/stat | ∞ | Bosses + Guardians | Confirmé linéaire 160→6.0% ... 200→10.0% |
| Weapons Stat (101-200) — Heavy PVP | +0.05%/stat | ∞ | Bosses + Guardians | Confirmé linéaire 160→3.0% ... 200→5.0% |
| Weapons Stat (101-200) — Large Ammo Brick Chance | +1.0%/stat | ∞ | Toutes cibles (mécanique d'ammo, pas de dégât) | Confirmé linéaire 160→60% ... 200→100%. Distinct des lignes damage ci-dessus. |
| Super Stat (101-200) | jusqu'à +45% à 200 (~0.45%/stat, taux ~3x Weapons) | ∞ | Bosses + Guardians (à confirmer si 0-100 exclu comme Weapons) | Dégâts de la Super uniquement — le regen speed est géré séparément par Discipline/Strength scalars, voir `08_GAME_MECHANICS.md` |
| Transcendence | +5% weapon | 20s | Prismatic | +20% DR aussi |
| Facet of Courage | +10% Light Abilities | ~ | Sur Darkness-debuffed enemies | Pas les armes |
| Limit Break (Heresy Artifact) | +30% Super | 7-10s | Super Cast avec Devour/Invis/Overshield ou Critical Health | Archivé post-Heresy |
| Sect of Force | +20% | 30s | Elite/Miniboss/Champion uniquement | Stack avec tout |
| The Navigator + Woven Mail | +25% | ∞ | Woven Mail actif | |
| Remote Shield (Edge of Action) | +5% | 10s | Dans le shield | |
| Mask of Bakris | +10/21/33% | 11s | Light Shift (x1-3) | Arc/Stasis |
| Cauterized Darkness (Renegades) | +75% Solar | ∞ | Sur Stasis/Strand-debuffed non-Boss | |

## 6. Weapons vs Super — Priorisation en DPS
> Source : analyse communautaire (formule DPS moyenne pondérée burst+soutenu) + confirmations utilisateur, juillet 2026

Le choix entre pousser Weapons ou Super à 200 dépend de la **durée de la phase de dégâts** et du **nombre de casts Super possibles** dedans, pas d'une règle universelle.

- **Phase courte (<30-40s), un seul cast Super possible** : **Super gagne** — le burst compense largement grâce au taux ~3x supérieur (45% vs 15%)
- **Phase longue (>30-40s), un seul cast** : **Weapons gagne** — le DPS soutenu de l'arme dépasse le burst unique dilué sur la durée
- **2e cast Super possible dans la phase** : **Super gagne quasi systématiquement**

**Exotics Burst** (étendent le seuil de bascule à ~40s au lieu de ~30s, car leur multiplicateur intrinsèque se cumule avec le bonus de stat Super) : Celestial Nighthawk, Cuirass of the Falling Star, Star-Eater Scales, Mataiodoxía.

> Règle pratique : avec un exotic burst et une phase de boss standard (raid/dungeon, généralement <40s), prioriser Super à 200 est presque toujours le bon call. Voir `08_GAME_MECHANICS.md` pour le calcul complet d'atteinte de 200 Super via l'archétype Powerhouse.

## 7. Super Damage — Test final à 200 Super Stat (Llama, post-9.7.0)
> Source : transcript « The FINAL Destiny 2 Super Damage Testing » — tests firing range, 200 Super Stat, **sans perks artifact** (Limit Break +15% s'ajouterait par-dessus). Valeurs = total du cast sur cible boss (Carl). Facet of Courage (+10%) activé quand indiqué.

### Warlock

| Super + setup | Total | Notes |
|---|---|---|
| **Stormtrance** + Stormdancer's Brace + Courage (avec Landfall) | **42 004** | Meilleur Warlock |
| Winter's Wrath + Ballidorse Wrathweavers + Facet of Ruin | 35 262 | Tech : alterner left click / right click |
| Song of Flame Prismatic + Star-Eater + Courage | 35 185 | Spam snap+wisp ; cast time similaire à Chaos Reach |
| Chaos Reach + Geomag Stabilizers | 31 186 | |
| Nova Warp + Astrocyte Verse | 24 401* | *28 061 brut, normalisé sans le weaken du dark blink |
| Needlestorm Strand + Thread of Evolution (double proc) | ~24 000 | Tech double proc : needle, needle, puis super |
| Needlestorm Prismatic (double proc) | ~23 400 | Threadlings ratent souvent |
| Nova Bomb + Skull of Dire Ahamkara + Courage | 23 066 | Lance : demande de la distance ; > Star-Eater |
| Nova Bomb + Star-Eater Scales | 22 223 | Ne prendre que pour l'orb-gen (6 orbs) |
| Daybreak + Dawn Chorus | 20 798 | Rework ignitions décevant |

### Hunter

| Super + setup | Total | Notes |
|---|---|---|
| **Arc Staff (Raiden Flux), combo palm strike** | **45 968** | Buff +50% palm hit. Tech : commencer par une attaque aérienne (light) = ~+3K |
| Blade Barrage + Knock 'Em Down + Ashes + Radiant | 33 625 | ⚠ La double explosion dépend des **FPS** (comportement erratique — retester cap 100/120) |
| Blade Barrage + Star-Eater x6 + Radiant | 31 275 | |
| Silkstrike + Star-Eater x6 | 30 300 | Light attack spam ; boostable Shield Crush (artifact Echoes/EoF) |
| Golden Gun + Celestial Nighthawk + Radiant (Prismatic) | 25 417 | Instantané, mais exige un crit atteignable |
| Golden Gun 3-shot + Star-Eater + Courage + Radiant | 24 972 | Pour stratégies orb-gen uniquement |
| Storm's Edge + Star-Eater + Courage | 24 454 | |
| Moebius Quiver + Orpheus Rig | 20 380 | 3 531 (tether) + 16 849 (2 volées) ; à coupler strat bow |
| Silence and Squall pure Stasis + Durance + Fissures + Star-Eater | 19 418 | ~3K de plus que la version Prismatic (16 699) |
| Gathering Storm + Feast of Light x6 | 16 758 | Abandonné par Bungie — à éviter en DPS |

### Titan

| Super + setup | Total | Notes |
|---|---|---|
| **Burning Maul light attacks + Hallowfire Heart** (Sunfire x10, Roaring Flames x3) | **~68 000** | Le max absolu du test, sans aucun booster artifact |
| Glacial Quake + Star-Eater | 67 463 | Heavy = damage impulse frontal ; encore mieux avec crystals autour |
| Burning Maul heavy slams + Hallowfire Heart (idem) | 60 532 | |
| Hammer of Sol + Hallowfire Heart + Roaring Flames x3 + Ashes | 50 124 | Lancer de **loin** (41 176 mi-distance, 32 560 près) |
| Sentinel Shield throw + Synthoceps | 35 188 | 2 throws max (~17,5K chacun), meter très lent |
| Blade Fury + Star-Eater | 28 616 | Combo 1 heavy / 3 lights |
| Twilight Arsenal + Spirit of Starfire + Courage | 22 284* | *25 627 brut avec weaken intégré ; buff Starfire 25%→50% en 9.7.0 |
| Thundercrash + Cuirass of the Falling Star | 24 774 | Toujours la référence consistance |
| Pyrogale Gauntlets (Burning Maul one-shot) | 23 968 | +10% en 9.7.0 mais ridiculisé par Hallowfire |

### Enseignements clés
- **Hallowfire Heart est devenu le GOAT Titan Solar** : le buff « dégâts super Solar par stack de Sunfire Furnace » triple quasiment les dégâts vs Pyrogale
- **Ward of Dawn** : Weapons of Light confirmé à **+25%** (inchangé avec la nouvelle bulle) ; quirk : si un ennemi est DANS la bulle, on peut tirer depuis l'intérieur
- Les roaming supers melee (Arc Staff, Burning Maul, Glacial Quake) dominent le total brut mais exigent l'uptime au corps-à-corps ; Celestial/Cuirass restent les rois du burst instantané
- Rappel : tout ceci se cumule avec Limit Break (+15%, artifact Heresy) et les autres amplifications de la section 3
