# D2 Knowledge Base — Index maître

> Point d'entrée unique de la knowledge-base (réécrit le 28/09/2026).
> Pour le futur agent IA : l'ordre de recherche verrouillé est Manifest
> local → **knowledge-base** → Bungie → web. Commencer par
> `07_QUERY_FRAMEWORK.md` pour la méthode, puis ce tableau pour trouver la
> bonne fiche.

## Provenance

- **Fiches 01 à 12** et le récapitulatif de la 9.7.0 : base de
  connaissance fournie par un ami, compilée le 18/06/2026, à jour
  Monument of Triumph (update 9.7.0, 9 juin 2026, dernier patch majeur).
  Sources d'origine : Destiny Data Compendium, feuille de Court (Damage
  Stacking), patch notes Monument of Triumph. Enrichies ensuite en
  juillet 2026 (voir l'historique en bas).
- **Fiches 13 à 27** : produites au fil du projet (vérifications en jeu de
  l'utilisateur, traductions, audits, sources externes).

## Fichiers

Colonne « Code » : ✅ = fiche citée comme source par le code de l'appli
(les fichiers ne sont jamais importés à l'exécution, le code s'en inspire
ou en est généré). Les autres fiches servent à la consultation.

### Base d'origine (en anglais)

| Fichier | Contenu | Code |
|---|---|---|
| `01_DAMAGE_STACKING.md` | Catégories de buffs et debuffs, sources de Weaken, Empowering Buffs, Surcharges, Amplifications, stats Arme/Super au-delà de 100, dégâts de Super à 200 | ✅ `elementVerbs.ts` ; base du futur moteur de dégâts |
| `02_SUBCLASSES_ALL.md` | Les 6 sous-classes (Vide, Arc, Solaire, Stase, Filobscur, Prismatique) : glossaires, fragments, aspects, facettes, supers | ✅ `elementVerbs.ts` |
| `03_ARTIFACTS.md` | Les 7 artefacts avec tous leurs perks (anglais) | ✅ `artefacts.ts` en est généré |
| `04_EXOTIC_ARMORS.md` | Exotiques d'armure : tous ceux du Warlock, sélection Chasseur/Titan | |
| `05_ARMOR_MODS_AND_SETS.md` | Mods d'armure (Surcharge, Font, Siphon…) et bonus de set avec notes, dont l'analyse terrain Llama des 37 sets. Piste ouverte : croiser ces notes avec les sets réels lus dans le Manifest | |
| `06_EXOTIC_WEAPONS.md` | Armes exotiques : classement DPS, anti-champion, armes Vide | |
| `07_QUERY_FRAMEWORK.md` | Méthode de raisonnement : comment balayer les 9 couches pour répondre à une question (sources d'un buff, DPS max, composition d'escouade) | |
| `08_GAME_MECHANICS.md` | Mécaniques du jeu : énergie, charges d'armure, stats, **Armure 3.0 (les 12 archétypes, noms EN et FR)**, champions, bannières, modificateurs, orbes | ✅ `elementVerbs.ts` |
| `09_ARCHETYPES.md` | Archétypes d'**armes** (frames) : DPS type, dégâts totaux, portée, tier. ⚠️ Rien à voir avec les archétypes d'**armure**, qui sont dans la fiche 08 | |
| `10_ECONOMY_FARMING.md` | Farm de toutes les ressources, boucle d'armes Renegades et shinies, Equilibrium | |
| `11_PANTHEON_GUIDE.md` | Les 7 affrontements du Panthéon, les 6 défis, le skip d'Argos | |
| `12_BLACK_ARMORY_GODROLLS.md` | God rolls des 11 armes de l'Armurerie noire, trait d'origine Forge's Kin | |

### Artefacts

| Fichier | Contenu | Code |
|---|---|---|
| `13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md` | Règles vérifiées d'Artifacts 2.0 (sélection des perks) et d'Anti-Champion 2.0 | |
| `14` à `20` `_ARTEFACT_*.txt` | Traductions françaises complètes des 7 artefacts (147 perks), faites à la main par l'utilisateur depuis le jeu : `14` Encrypted Data Disk · `15` Implement of Curiosity · `16` Hunter's Journal · `17` NPA Repulsion Regulator · `18` Tablet of Ruin · `19` Slayer Baron Apothecary Satchel · `20` Queensfoil Censer | ✅ intégrées dans `artefacts.ts` |
| `24_HASH_ARTEFACTS.md` | Hashes des 7 artefacts pour leurs miniatures | ✅ `artefacts.ts`, `SelecteurArtefact.tsx` |

Les fichiers 14 à 20 restent volontairement en `.txt` : ce sont des
sauvegardes brutes du texte saisi, ligne par ligne. En `.md`, les lignes
consécutives seraient fusionnées à l'affichage. ⚠️ Ce sont des
sauvegardes, pas la source vive : toute correction doit être faite ici ET
reportée dans `artefacts.ts`.

### Moteur de scoring

| Fichier | Contenu | Code |
|---|---|---|
| `21_ARMATURES_ANTI_CHAMPION_EN_FR.md` | Perks intrinsèques (armatures) EN/FR et leur correspondance anti-champion, croisés avec les mots-clés du code | |
| `22_CHAINES_DE_VERBES.md` | Les verbes des 6 doctrines, leurs relations Produit/Consomme, les décisions de conception du graphe de chaînes (Pilier 2) | ✅ `elementVerbs.ts` |
| `25_AUDIT_FRAGMENTS.md` | Audit des fragments par élément : liens conditionnels acceptés ou rejetés | ✅ `doctrine.ts` |

### Sources externes

| Fichier | Contenu |
|---|---|
| `23_RESSOURCES_EXTERNES.md` | Liens transmis par l'utilisateur (buildcrafting, farm d'armure, guides Armure 3.0, API Bungie…), avec statut d'usage et réserves |
| `26_ARMES_ARMURES.md` | Bases de données d'armes et d'armures (light.gg, SafeMoonD2), usage par chantier, et liste des sources illisibles pour un agent |

### Patch notes

| Dossier | Contenu |
|---|---|
| `27_PATCHNOTES/` | Une fiche par mise à jour (conventions dans son `LISEZ-MOI.md`). Contient pour l'instant le récapitulatif de la 9.7.0 fourni avec la base d'origine et la fiche de la 9.7.0.5 du 7 octobre 2026 (première fiche, format à valider) |
| `28_ARMES_EXOTIQUES_ANTI_CHAMPION.md` | Liste de référence fournie par l'utilisateur (01/10/2026) : chaque arme exotique (noms FR) et son anti-champion (Surchargé, Implacable, Bloqueur), par emplacement |

## Langue

Les fiches 01 à 12 et le récapitulatif de la 9.7.0 sont **en anglais**,
alors que le Manifest chargé par l'appli est **en français** : une
correspondance par nom échoue (« Crown of Tempests » ≠ « Couronne des
Tempêtes »). Toujours passer par le **hash** : la recherche Manifest de
l'appli (`RechercheManifest.tsx`) ou light.gg (voir la fiche 26)
donnent le hash à partir du nom anglais, puis le nom français s'obtient
par ce hash.

## Conventions de données

- `[x]` = valeur PvP entre crochets, PvE sinon
- `?` = valeur non confirmée dans le compendium
- `~` = durée variable / dépend d'un autre effet
- `x+y` = durée base + extension (ex: `10+5s` = 10s base, +5 avec stat ou perk)
- `T1/T2/T3/T4` = rang ennemi (Rank-and-File Minor / Elite / Miniboss / Boss)
- `ARCHIVÉ` = perk d'un artifact de saison passée, peut ne plus être disponible
- `BOOST (⬆)` = perk amélioré si unlocked à un niveau supérieur dans l'artifact

## Données manquantes

Plusieurs sources sont construites en JavaScript et illisibles pour une
lecture automatique, dont la liste complète des catalyseurs exotiques
(effets seulement partiels dans `06_EXOTIC_WEAPONS.md`, marqueurs `↑`).
Liste tenue à jour dans `26_ARMES_ARMURES.md`, section « Rappel : sources
illisibles pour un agent ».

---

## Historique des ajouts

Notes conservées telles qu'écrites à leur date (seuls les passages
périmés ont été retirés le 28/09/2026, voir le CHANGELOG).

### 9 juin 2026 — Monument of Triumph
#### Changements majeurs Monument of Triumph
- **Skull of Dire Ahamkara rework** : Nova Bomb → Nova Bomb: Lance possible, Lance sur Cataclysm = triple détonation
- **Soul Siphon** : nouveau Voidwalker aspect (Powered Melee drain = Overshield + Class Energy)
- **Radiant nerf** : 25% → 20% PvE
- **Ward of Dawn** : Weaken pulse on cast (S29)
- **Barrier Champions** : Volatile Rounds, Radiant, Unravel Rounds **ne percent plus** les Barrier Champions
- **Fr0st-EE5 rework** : Frost Armor active = Stasis Surge x3 (22%)
- **Fafnir** (new LFR) : 30% Weaken 4s sur hit
- **Turncoat** (new HC) : Unleashed Power = Weaken 15% sur hits
- **Anti-Champion** : Tous les weapons ont maintenant un anti-champion intrinsèque selon leur archétype

#### Corrections KB (18 juin 2026 — cross-ref sources HTML)
- **01** Echo of Undermining / Facet of Dominance : durée Weaken corrigée 5s → **6s**
- **01** Cauterized Darkness (Renegades) : valeur corrigée 30% → **75%** Solar (conditionnel vs Stasis/Strand-debuffed non-Boss)
- **02** Supers Stasis : retiré Winter's Shroud (aspect), Shiver Strike (melee), Shadebinder Melee (melee) — table corrigée
- **02** Supers Strand : retiré Threaded Spike, Drengr's Lash, Arcane Needle (melee abilities/aspects, pas des supers)
- **02** Aspects Solar : section complétée — ajout Crackshot, Gunpowder Gamble (Hunter), Consecration, Shieldburst (Titan), Hellion (Warlock)
- **02** Aspects Stasis : section créée — 4 Hunter + 4 Titan + 4 Warlock
- **02** Aspects Strand : section créée — 4 Hunter + 4 Titan + 4 Warlock
- **02** Facet of Solitude ajouté (Prismatic)

#### Artifacts actifs en juin 2026
Tous les 7 artifacts sont équipables. Il faut vérifier en jeu lequel est 'current season'.
Les perks Limit Break, Maligned Harvest etc. sont dans Tablet of Ruin (Heresy, archivé) mais potentiellement accessible.

> Note du 28/09/2026 : question jamais tranchée formellement ; les 7 artefacts ont depuis été transcrits en français depuis le jeu (fiches 14 à 20) et sont tous proposés dans l'appli.

### Ajouts session utilisateur (3-9 juillet 2026 — armor 3.0 & optimisation stats)
- **08_GAME_MECHANICS** : nouvelle section "Armor 3.0 — Archétypes et Optimisation Stats" — table complète des 12 archétypes (paires intrinsèques 30/25), mécanique masterwork/tuning, système de slots de mods et budget énergie, mécanique Fonts (conditionnelle, invisible en stat statique), calcul complet loadout DPS Powerhouse, comparaison Powerhouse vs Paragon
- **08_GAME_MECHANICS** : nouvelle section "Loadout Swap — Roaming vs DPS" — mécanique de swap et conditions de préservation (subclass identique, slot munitions)
- **01_DAMAGE_STACKING** : ajout Super Stat (101-200) dans Amplification Modifiers (~45% à 200) + nouvelle section "Weapons vs Super — Priorisation en DPS" (seuil de bascule ~30-40s selon durée de phase et exotics burst)
- ⚠️ Ces données combinent CSV export DIM réel de l'utilisateur, confirmations directes en jeu, et analyse communautaire (Reddit, ~6 mois avant juillet 2026 — donc antérieure à l'archétype Powerhouse, à contextualiser)

### Ajout 27 juillet 2026 (2e vague) — 5 transcripts Llama supplémentaires
- **01_DAMAGE_STACKING** : nouvelle section 7 « Super Damage — Test final à 200 Super Stat » — ~30 supers testés au firing range, 3 classes, avec setups exacts (top : Burning Maul + Hallowfire Heart ~68K, Glacial Quake Star-Eater 67K, Arc Staff Raiden Flux 46K ; Weapons of Light confirmé +25%)
- **10_ECONOMY_FARMING** (nouveau) : farm de chaque ressource (glimmer Cosmodrome x2, Conflux Nessus pour exotics, sources BD exhaustives, spoils via Argos...) + boucle credits Lawless Frontier (Recon Shank, lockboxes partagées, ~4 500/18 min) + shinies Accelerated Assault (1/20, quête Territorial Profit garantie) + armes Equilibrium
- **11_PANTHEON_GUIDE** (nouveau) : les 7 encounters (Argos, War Priest, Ghalran, Consecrated Mind, Calus, Morgeth, Insurrection Prime) pas à pas + les 6 challenges + skip Argos (rochers rally flag) + drop catalyst Anarchy
- **12_BLACK_ARMORY_GODROLLS** (nouveau) : origin trait Forge's Kin (+13% à 3 armes du set, Izanagi/Jotunn/Le Monarque comptent) + god rolls des 11 armes (priorités : Beaming Giant, Kindled Orchid, Blast Furnace)

### Ajout 27 juillet 2026 — Analyse Llama des 37 sets Monument of Triumph
- **05_ARMOR_MODS_AND_SETS** : intégration du transcript vidéo Llama (test in-game des 37 nouveaux sets)
  - Valeurs testées injectées dans le tableau (marqueur « Testé (Llama) ») : Atheon's Memory, CODA, Crystocrene (bug permanent documenté), Oryx's Memory, Yearning Echo, Techeun's Regalia, Iron Battalion
  - Nouvelle section « Analyse terrain — Llama » : verdict méta PvE (Atheon's = #1 DPS, CODA 40% DR max, Exodus Down 35%), combos 2pc+2pc, synergies testées (Dreambane +50% vs Nightmares, Pantheos finishers infinis, Taken King × Mothkeeper), anti-synergies confirmées, divergences de nommage transcript vs DDC

### Ajout du 04/08/2026 — Artifacts 2.0 & Anti-Champion 2.0
- **13_ARTIFACTS_2_0_ET_ANTI_CHAMPION** : règles vérifiées sur
  shatteredvault.com (contraintes de sélection des perks d'artefact :
  7 perks, min 2×T1, T2+T3 ≤ 5, T3 ≤ 2 ; 27 règles d'armature anti-champion
  au total dont l'appli en couvre 20 ; correction Radiant/Volatile qui ne
  stunnent plus Bloqueur ; 141 exotiques à assignation individuelle).
  ⚠️ Les tableaux détaillés de cette source sont rendus en JavaScript et
  n'ont pas pu être extraits — la fiche ne contient que ce qui a été
  réellement vérifié.

### Ajout du 24/08/2026 — Traductions françaises manuelles des artefacts
- **14_ARTEFACT_ENCRYPTED_DATA_DISK**, **15_ARTEFACT_IMPLEMENT_OF_CURIOSITY**,
  **16_ARTEFACT_HUNTERS_JOURNAL**, **17_ARTEFACT_NPA_REPULSION_REGULATOR** :
  traduction française COMPLÈTE des 21 perks de chaque artefact (7 par tier),
  réalisée à la main par l'utilisateur directement depuis le jeu. Nécessaire
  car le Manifest ne contient que la définition HÉRITÉE des artefacts
  (structure saisonnière à 5 paliers, mods anti-champion supprimés par la
  9.7.0 — voir `13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`), pas le système actuel.
  Conventions à respecter si d'autres artefacts sont traduits sur ce modèle :
  `[icone X]` pour les icônes (élément/champion/type d'arme), mots entre
  guillemets pour les verbes et termes de jeu.
  Intégrées dans `src/data/artefacts.ts` (voir CHANGELOG du 24/08/2026) et
  rendues visuellement par `src/components/RenduTextePerk.tsx` (icônes
  réelles, verbes en cyan `#67e8f9`).
  ⚠️ Ces fichiers sont une SAUVEGARDE de la source, pas la source vive :
  toute correction doit être faite ici ET reportée dans `artefacts.ts`.
  ✅ Les 7 artefacts sont traduits depuis le 24/08/2026 (147 perks) :
  `14` Encrypted Data Disk · `15` Implement of Curiosity · `16` Hunter's
  Journal · `17` NPA Repulsion Regulator · `18` Tablet of Ruin ·
  `19` Slayer Baron Apothecary Satchel · `20` Queensfoil Censer.

- **`21_ARMATURES_ANTI_CHAMPION_EN_FR.md`** — tableau EN/FR des perks
  intrinsèques (armatures) et de leur correspondance anti-champion, croisé
  avec les 21 mots-clés du code. Identifie ce qui est couvert, ce qui
  manque (Pinpoint Slug Frame) et les cas volontairement non codés (Synergie
  MIDA, Ensemble à jamais — leur champion dépend de l'arme combinée).

- **`22_CHAINES_DE_VERBES.md`** — matière du chantier Pilier 2 : les
  36 verbes des 6 doctrines avec leurs relations Produit/Consomme, leurs
  descriptions officielles citées, et les décisions de conception du graphe
  de chaînes (structure, comportement, risques identifiés).

- **`23_RESSOURCES_EXTERNES.md`** — liens de référence transmis par
  l'utilisateur (buildcrafting, farm d'armure, guides Armure 3.0), avec leur
  statut d'usage et les réserves associées.

### Ajout du 28/09/2026 — Sources Armes & Armures, rangement

- **`26_ARMES_ARMURES.md`** — bases de données d'armes et d'armures
  consultables (light.gg, SafeMoonD2), avec leur statut d'usage.
  Principe : on stocke la carte (quel site, pour quoi, comment y pointer
  par hash), pas une copie des données, qui viennent du Manifest.
- **Rangement de la knowledge-base** : index réécrit, `NOTE_RATTACHEMENT.md`
  fusionnée dans cet index, table des archétypes d'armure regroupée dans
  la fiche 08, dossier `27_PATCHNOTES/` créé. Détail dans le CHANGELOG.
