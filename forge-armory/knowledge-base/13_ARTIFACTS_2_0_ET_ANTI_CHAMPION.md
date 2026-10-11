# Artifacts 2.0 & Anti-Champion 2.0 — règles vérifiées

> **Source** : https://shatteredvault.com/kb/artifacts-champions/ (consultée le
> 04/08/2026, page mise à jour le 11/07/2026, à jour pour Monument of Triumph
> et l'update 9.7.0).
>
> ⚠️ **Portée de cette fiche** : elle contient les RÈGLES et les DÉCOMPTES
> vérifiés sur la page. Les tableaux détaillés (les 27 règles d'armature, les
> 154 entrées d'exotiques) sont générés en JavaScript côté navigateur et n'ont
> donc **pas pu être extraits** — ils ne sont pas reproduits ici. Ne pas
> supposer leur contenu : ce qui n'est pas écrit dans cette fiche n'a pas été
> vérifié.

---

## Artifacts 2.0 — structure

- Le système saisonnier est abandonné : **plusieurs artefacts hérités** du
  passé de Destiny 2 sont disponibles simultanément, réajustés pour le sandbox
  actuel.
- **Les colonnes de mods anti-Champion ont été retirées des artefacts.**
- Les sélections d'artefact peuvent être **sauvegardées dans les Loadouts**
  côté jeu.

### Contraintes de sélection des perks (important pour le scoring)

Règles confirmées par le planificateur de la page :

| Contrainte | Valeur |
|---|---|
| Perks actifs au total | **7** |
| Slots réservés au Tier 1 | **2 minimum** |
| Tier 2 + Tier 3 combinés | **5 maximum** |
| Tier 3 | **2 maximum** |

> Ces contraintes complètent `03_ARTIFACTS.md`, qui documentait le budget de
> 7 points et la structure en 7 slots / 3 tiers, mais pas les plafonds par
> tier. **Conséquence pour le Pilier 3** : un build ne peut pas prendre 7 perks
> T3 — la notation ne doit donc pas récompenser une chose impossible.

---

## Anti-Champion 2.0 — règles

- Chaque arme porte un effet anti-Champion **intrinsèque**, déterminé par son
  **armature (frame) ou son trait intrinsèque spécialisé**.
- **Activation immédiate** : il suffit qu'un tir valide touche. Plus d'exigence
  de tir soutenu, de visée ou de charge, contrairement à l'ancien système.
- Structure des règles : **6 règles d'armature universelles** (core frame
  rules) + **21 dérogations spécialisées** (specialized intrinsic overrides)
  qui priment sur la règle générale.

### Décompte officiel des règles

| Total | Bloqueur | Surchargé | Implacable |
|---|---|---|---|
| **27** | 6 | 8 | 13 |

> 📌 **À exploiter** : l'appli a actuellement **20 armatures** cartographiées
> (voir `ARMATURE_VERS_CHAMPION` dans `src/lib/manifest/doctrine.ts`). Il en
> manque donc environ 7. Le repère « ? » affiché dans les listes sert à les
> repérer au fil du jeu.

### ⚠️ Correction par rapport à l'ancien système

**Radiant et Volatile Rounds ne stunnent PLUS les Champions Bloqueur.** Ils
donnent désormais **+10 % de dégâts d'arme contre les Champions** à la place.

> Point d'attention pour le catalogue de verbes (`src/data/elementVerbs.ts`) :
> toute logique qui associerait encore Radiant/Volatile à un contre-Bloqueur
> serait périmée.

---

## Exotiques

- **Chaque arme exotique reçoit une assignation anti-Champion INDIVIDUELLE**,
  qui peut différer de la règle de son armature.
- Décompte : **154 entrées** = 141 armes exotiques + 13 pièces d'armure
  exotique pertinentes pour les Champions.

> 📌 **Conséquence pratique** : avec 141 exotiques assignés un par un, les
> cartographier manuellement n'est pas réaliste. Deux options : se limiter aux
> exotiques réellement possédés par l'utilisateur (relevés au fil du jeu via le
> repère « ? »), ou trouver une source de données structurée. La page de
> Shattered Vault affiche ces tableaux en JavaScript, donc non extractibles
> automatiquement.

### Cas particulier documenté : Ergo Sum

L'épée exotique suit l'armature de son roll :

| Armature | Champion contré |
|---|---|
| Caster (projection) | Bloqueur |
| Lightweight (légère) ou Vortex | Surchargé |
| Aggressive (agressive) ou Wave (onde) | Implacable |

> ✅ Cohérent avec la table déjà en place dans l'appli.

---

## Contres par capacité de sous-classe

⚠️ **Fiabilité incertaine** : la page présente ces informations en les datant
de « Destiny 2: Lightfall », sans préciser si la 9.7.0 les a modifiées. La
section « Anti-Champion 2.0 » indique par ailleurs que « les verbes de
sous-classe et certains effets exotiques peuvent encore fournir une utilité
contre les Champions, mais le système central est désormais basé sur
l'armature ». **À vérifier en jeu avant d'en faire une règle de scoring.**

| Champion | Contres annoncés (à confirmer) |
|---|---|
| Bloqueur | Volatile Rounds (Void), Radiant (Solar), Unravelling Rounds (Strand) — ⚠️ **contredit** par la correction ci-dessus pour Radiant/Volatile |
| Surchargé | Jolt (Arc), Suppression (Void), Ralentissement/Gel (Stase) |
| Implacable | Aveuglement (Arc), Ignition (Solar), Suspension (Strand) |

La contradiction interne sur Radiant/Volatile est une bonne illustration : cette
page mélange des sections mises à jour et des sections plus anciennes. Ne rien
en tirer sans recoupement.

---

## Types de Champions (rappel)

| Type | Comportement | Ennemis concernés |
|---|---|---|
| **Bloqueur** | Dôme impénétrable, régénère si non stun | Cabal Colosse, Déchu Servitor, Ruche Chevalier, Vex Hobgobelin |
| **Surchargé** | Soins et régénération d'aptitudes accrus, spam de capacités | Déchu Capitaine, Corrompu Hobgobelin, Vex Minotaure, Écorché Chef |
| **Implacable** | Beaucoup de vie, entre en rage quand attaqué | Cabal Incendior, Ruche Ogre, Corrompu Phalange, Écorché Abomination |

Les armes anti-Bloqueur percent aussi les boucliers des **Hobgobelins,
Phalanges et Hydres** ordinaires.

Il existe un **court délai de récupération** entre deux stuns d'un même
Champion : les excroissances sur son dos s'illuminent en blanc quand il
redevient stunnable.
