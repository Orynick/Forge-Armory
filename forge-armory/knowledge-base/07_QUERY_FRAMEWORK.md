# Query Framework — Logique de Raisonnement pour Analyse Exhaustive

> Ce fichier ne liste pas de synergies.
> Il définit COMMENT raisonner pour répondre à n'importe quelle question de build ou d'optimisation
> de manière exhaustive, en s'assurant qu'aucune source n'est oubliée.

---

## Principe fondamental

Toute question sur D2 peut se ramener à : **"Quelles sont TOUTES les sources de X ?"**
Où X peut être un buff, un debuff, un état, une ressource, un type de dégâts, un effet.

Pour répondre exhaustivement, il faut **scanner les 9 couches** dans l'ordre ci-dessous.
Aucune couche ne peut être skippée — chaque couche peut contenir des sources indépendantes.

---

## Les 9 Couches de Sources

```
COUCHE 1 : Subclass Keywords (effets natifs de la subclasse)
COUCHE 2 : Fragments & Facets
COUCHE 3 : Aspects
COUCHE 4 : Supers
COUCHE 5 : Exotic Armor
COUCHE 6 : Exotic Weapons
COUCHE 7 : Weapon Perks & Origin Traits
COUCHE 8 : Armor Mods & Set Bonuses
COUCHE 9 : Artifact Perks (tous les 7 artifacts disponibles)
```

Pour chaque couche, la question est : **"Est-ce que cette couche contient quelque chose qui produit X ?"**

---

## Fichiers à consulter par couche

| Couche | Fichier(s) à charger |
|---|---|
| 1 — Subclass Keywords | `02_SUBCLASSES_ALL.md` section Glossaire |
| 2 — Fragments & Facets | `02_SUBCLASSES_ALL.md` sections Fragments / Facets |
| 3 — Aspects | `02_SUBCLASSES_ALL.md` section Aspects |
| 4 — Supers | `02_SUBCLASSES_ALL.md` section Supers |
| 5 — Exotic Armor | `04_EXOTIC_ARMORS.md` |
| 6 — Exotic Weapons | `06_EXOTIC_WEAPONS.md` |
| 7 — Weapon Perks | `06_EXOTIC_WEAPONS.md` + knowledge base weapon perks |
| 8 — Armor Mods & Sets | `05_ARMOR_MODS_AND_SETS.md` |
| 9 — Artifact Perks | `03_ARTIFACTS.md` |

Pour les questions de damage stacking ou de multiplicateurs : charger aussi `01_DAMAGE_STACKING.md`.

---

## Template de réponse exhaustive

Pour toute question "Quelles sont toutes les sources de [X] ?", structurer la réponse ainsi :

```
### Sources de [X]

**Couche Subclass**
- [source] — [classe] — [trigger] — [durée/valeur]

**Couche Fragments / Facets**
- [source] — [subclasse] — [trigger] — [durée/valeur]

**Couche Aspects**
- [source] — [classe/subclasse] — [trigger]

**Couche Supers**
- [source] — [classe/subclasse] — [trigger]

**Couche Exotic Armor**
- [source] — [classe] — [trigger] — [valeur si pertinent]

**Couche Exotic Weapons**
- [source] — [type] — [trigger]

**Couche Weapon Perks**
- [perk] — [trigger]

**Couche Armor Mods / Sets**
- [mod/set] — [trigger]

**Couche Artifact**
- [perk] — [artifact] — [trigger] — [note si archivé]

---
**Total : N sources identifiées**
**Sources cumulables simultanément : [liste]**
**Sources mutuellement exclusives : [liste + pourquoi]**
```

---

## Règles de stacking à appliquer systématiquement

Avant de conclure une analyse, vérifier ces règles (détail dans `01_DAMAGE_STACKING.md`) :

```
RÈGLE 1 — Global Debuffs : un seul actif à la fois (le plus haut prévaut)
           → Weaken 15% + Weaken 30% = 30% uniquement, pas 45%

RÈGLE 2 — Empowering Buffs : un seul actif à la fois (le plus haut prévaut)
           → Radiant 20% + Well 25% = 25% uniquement

RÈGLE 3 — Weapon Surges : un seul par élément (le plus haut prévaut)
           → Void Surge x3 mods + Void Weapon Channeling = prend le plus haut
           → Void Surge + Arc Surge = les DEUX s'appliquent (éléments différents)

RÈGLE 4 — Amplifications : toutes stackent entre elles et avec tout le reste
           → Transcendence + Limit Break + Facet of Courage = tous les trois

RÈGLE 5 — Multiplicatif : tous les buffs se multiplient entre eux
           → Jamais additif sauf les Melee damage modifiers
```

---

## Questions types et méthode associée

### "Quelles sont toutes les sources de [keyword] ?"
(ex: Weaken, Volatile, Radiant, Devour, Volatile Rounds, Jolt, Slow, Suspend...)

1. Identifier dans `01_DAMAGE_STACKING.md` si le keyword est un Global Debuff, Empowering Buff, ou autre
2. Scanner les 9 couches dans `02_SUBCLASSES_ALL.md`, `03_ARTIFACTS.md`, `04_EXOTIC_ARMORS.md`, `06_EXOTIC_WEAPONS.md`
3. Retourner liste complète avec trigger + durée + valeur PvE
4. Préciser les règles de stacking applicables

### "Quel est le DPS maximum sur boss avec [setup] ?"

1. Identifier tous les buffs actifs dans le setup → quelle catégorie ? (Debuff / Surge / Amplify)
2. Appliquer les règles de stacking (un seul Debuff, un seul Empowering, un seul Surge par élément)
3. Multiplier : Base × (1 + Debuff) × (1 + Surge) × (1 + Amplify1) × (1 + Amplify2) × ...
4. Identifier ce qui manque dans le setup pour optimiser
5. Scanner les 9 couches pour les sources manquantes

### "Quelle est la compo de fireteam optimale pour maximiser le damage output ?"

Raisonner en rôles complémentaires et non-redondants :

```
RÔLE 1 — DEBUFF (un seul Guardian)
  Objectif : appliquer le Weaken le plus fort possible sur le boss
  Sources : Tractor Cannon (30%), Deadfall Tether (35%), Felwinter's Helm (30%)
  → Un seul debuffer suffit (les debuffs ne stackent pas)
  → Choisir selon l'activité : Tractor = polyvalent, Tether = Hunter slot, Felwinter = skill-intensive

RÔLE 2 — EMPOWERING (un seul Guardian, ou zero si solo)
  Objectif : appliquer le buff le plus fort possible SUR les alliés
  Sources : Well of Radiance (25%), Banner Shield (40%), Empowering Rift (20%)
  → Un seul empowering buff actif à la fois pour chaque Guardian
  → Well of Radiance = best pour stationary DPS phases

RÔLE 3 — SURGE PROVIDER (optionnel en team, fort en solo)
  Objectif : fournir un Surge à l'équipe entière
  Sources : Sanguine Alchemy (x4 Surge dans Rift/Well pour tous), Prismatic Transfer (20% aux alliés sur Super)
  → Sanguine Alchemy = excellent support si team est groupée sur le boss

RÔLE 4 — DPS DEALERS (le reste de l'équipe)
  Objectif : maximiser le damage output individuel
  → Chaque DPS dealer optimise ses propres buffs (Surge, Amplifications, Exotic Intrinsic, Weapon Perks)
  → Profiter du Debuff + Empowering posés par les rôles 1 et 2

RÔLE 5 — ORBS GENERATION (peut être partagé)
  Objectif : alimenter les Armor Charges + Super regen de tous
  Sources : Siphon mods, Reaper, Firepower, Heavy Handed, Star-Eater Scales, Cenotaph Mask
  → Au moins 2 Guardians avec Siphon mods matching leur subclasse

RÔLE 6 — CHAMPION COVERAGE (si l'activité en a)
  Objectif : couvrir les 3 types de Champions (Barrier, Overload, Unstoppable)
  → Vérifier dans `03_ARTIFACTS.md` les perks disponibles dans l'artifact actuel
  → Vérifier dans `06_EXOTIC_WEAPONS.md` les exotics avec anti-champion intégré
  → ⚠️ Juin 2026 : Radiant / Volatile Rounds / Unravel ne percent plus Barrier
```

Exemple de compo 6 joueurs optimale (raid boss DPS) :
```
Player 1 : Void Hunter — Deadfall Tether (35% Weaken) — Orpheus Rigs (Super refund)
Player 2 : Solar Warlock — Well of Radiance (25% Empowering) — Phoenix Protocol
Player 3 : Void Warlock — Sanguine Alchemy (x4 Void Surge tous les alliés dans le Rift)
Player 4-6 : DPS optimisés individuellement (Surge propre + Amplifications + meilleure Heavy)
```

### "Quels builds sont possibles avec [contrainte] ?"
(ex: "avec Truth", "sur Void Warlock", "solo GM", "sans exotic weapon")

1. Identifier la contrainte : subclasse ? arme ? contenu ? style de jeu ?
2. Lister les couches fixes (imposées par la contrainte)
3. Scanner les couches libres pour les meilleures options disponibles
4. Appliquer la règle de non-redondance : éviter de prendre deux sources du même type de buff
   (ex: pas la peine de prendre Sanguine Alchemy ET Mantle of Battle Harmony — même catégorie Surge)

---

## Flags à vérifier systématiquement

```
⚠️ FLAG ARCHIVÉ  : Le perk vient d'un artifact de saison passée.
                   Vérifier si l'artifact est l'actif du moment ou juste équipable.
                   Tous les perks dans 03_ARTIFACTS.md sont disponibles (tous équipables).
                   "Limit Break" dans Tablet of Ruin (Heresy) = à vérifier en jeu
                   car Monument of Triumph a pu modifier les perks du Tablet.

⚠️ FLAG BARRIER  : Depuis le 9 juin 2026, Volatile Rounds / Radiant / Unravel Rounds
                   ne stunnent plus les Barrier Champions.
                   Seuls les exotics/perks avec anti-Barrier INTÉGRÉ fonctionnent.

⚠️ FLAG BOSS-ONLY : Certains effets ne s'appliquent qu'aux Minibosses+ et pas aux Bosses
                    (ex: Kinetic Intrinsic Buff, Cauterized Darkness, Sect of Force).
                    Toujours vérifier la mention "DOES NOT APPLY TO BOSSES".

⚠️ FLAG STACK    : Deux sources semblant identiques peuvent être de catégories différentes.
                   Ex: Expanding Abyss (Amplification) + Weaken 15% (Debuff) = les deux s'appliquent.
                   Ex: Particle Reconstruction (Debuff Heresy) + standard Weaken = seul le plus haut.
```

---

## Exemple complet : "Toutes les sources de Volatile Rounds"

**Couche Subclass Keywords** : Volatile Rounds = keyword Void natif

**Couche Fragments**
- Echo of Instability (Void) — Grenade kills → Volatile Rounds 11.25s

**Couche Aspects**
- Aucun aspect ne donne Volatile Rounds directement

**Couche Supers**
- Aucun

**Couche Exotic Armor**
- Gyrfalcon's Hauberk (Hunter) — Exit Invisibility → Volatile Rounds sur Void weapons

**Couche Exotic Weapons**
- Aucun exotic ne donne Volatile Rounds directement

**Couche Weapon Perks**
- Destabilizing Rounds — kills → apply Volatile aux ennemis proches (≠ Volatile Rounds, mais connexe)

**Couche Armor Mods / Sets**
- Aucun mod de base

**Couche Artifact**
- Volatile Flow (NPA Repulsion Regulator / Deep) — Orb of Power pickup → Volatile Rounds 9s
- Volatile Marksman (Tablet of Ruin / Heresy) — multi precision hits ou 3 Void kills/3s → Volatile Rounds 10s

**Total : 4 sources de Volatile Rounds**
**Toutes cumulables** (Volatile Rounds ne stacke pas, mais les déclencheurs sont tous différents
et indépendants — la dernière appliquée refresh la durée)

---

## Note sur les données manquantes

Les fichiers de cette KB couvrent :
- ✅ Tous les Fragments / Facets de toutes les subclasses
- ✅ Tous les Aspects documentés (sauf nouveaux aspects Monument of Triumph non encore dans le compendium)
- ✅ Tous les Exotic Armors Warlock + sélection Hunter/Titan
- ✅ Les 7 Artifacts avec tous leurs perks
- ✅ Armor Mods système Surge/Font/Siphon
- ✅ Armor Set Bonuses (tous les 64 sets)
- ✅ Exotic Weapons DPS + Champion counters

- ⚠️ Weapon Perks legendaries non couverts (Demolitionist, Reconstruction, Bait and Switch, etc.)
  → Pour des questions sur les weapon perks spécifiques, se référer au Destiny Data Compendium directement.
- ⚠️ Exotic Armor Hunter et Titan : sélection partielle, pas exhaustif
  → Pour un exotic Hunter/Titan précis, vérifier `04_EXOTIC_ARMORS.md` et compléter si nécessaire.
- ⚠️ Nouvelles mécaniques Monument of Triumph (Soul Siphon aspect, Ward of Dawn rework, etc.)
  → Partiellement documentées dans les fichiers, vérifier les patch notes si besoin.

