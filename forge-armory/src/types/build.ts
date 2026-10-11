import { DefinitionHash } from "./manifest";

/** Les 6 stats d'armure (Armor 3.0) */
export type StatKey =
  | "sante" // Health
  | "melee"
  | "grenade"
  | "super"
  | "classe" // Class ability
  | "arme"; // Weapons

export type StatBlock = Record<StatKey, number>;

export type DamageElement =
  | "solaire"
  | "arc"
  | "abyssal" // Vide
  | "stase"
  | "filobscur" // Strand
  | "prismatique";

export interface SubclassConfig {
  /** FR : null tant que l'utilisateur n'a pas choisi de classe - aucune classe n'est sélectionnée par défaut, demande explicite de l'utilisateur. / EN: null until the user picks a class - no class is selected by default, explicit user request. */
  classe: "titan" | "chasseur" | "arcaniste" | null;
  /** FR : null tant qu'aucune sous-classe n'est choisie. Avant, "abyssal" était codé en dur au démarrage : la Doctrine s'affichait donc pré-sélectionnée sur Abyssal alors que RIEN n'avait été chargé, d'où des aspects non sélectionnables tant qu'on n'avait pas changé de classe puis fait retour (ce qui déclenchait enfin un vrai chargement). / EN: null until a subclass is chosen. Previously "abyssal" was hardcoded at startup: Doctrine showed up pre-selected on Void while NOTHING had been loaded, hence aspects being unselectable until switching class and back (which finally triggered a real load). */
  element: DamageElement | null;
  /** FR : hash de l'objet sous-classe choisi (Manifest) - permet de relire ses options ailleurs (ex: "Mon build") sans re-télécharger la liste des sous-classes possédées. / EN: hash of the chosen subclass item (Manifest) - lets other places (e.g. "Mon build") re-read its options without re-fetching the owned subclasses list. */
  subclassItemHash?: DefinitionHash;
  superHash: DefinitionHash;
  /** FR : TOUJOURS 2 aspects, Prismatique comprise. Le code supposait 3 en Prismatique jusqu'au 04/08/2026 - c'était faux. / EN: ALWAYS 2 aspects, Prismatic included. */
  aspectHashes: DefinitionHash[];
  fragmentHashes: DefinitionHash[]; // 4 à 6 selon les slots débloqués
  /** FR : hash de la capacité de Mêlée choisie - 0 si non sélectionnée (pas encore de sélecteur dans l'UI). / EN: hash of the chosen Melee ability - 0 if not selected (no picker in the UI yet). */
  meleeHash: DefinitionHash;
  /** FR : hash de la Grenade choisie - 0 si non sélectionnée (pas encore de sélecteur dans l'UI). / EN: hash of the chosen Grenade - 0 if not selected (no picker in the UI yet). */
  grenadeHash: DefinitionHash;
  /** FR : hash de la Compétence de classe choisie - 0 si non sélectionnée. / EN: hash of the chosen Class Ability - 0 if not selected. */
  classeHash: DefinitionHash;
  /** FR : hash du type de Saut choisi - 0 si non sélectionné. / EN: hash of the chosen Jump type - 0 if not selected. */
  sautHash: DefinitionHash;
}

export interface ArtifactSelection {
  /**
   * FR : ⚠️ CHANGÉ (04/08/2026) - on identifie l'artefact par un id lisible
   * (ex: "tablet-of-ruin") plutôt que par un hash Manifest. Raison : notre
   * source pour les artefacts est la base de connaissance (Markdown), qui ne
   * fournit pas de hash. Un id dérivé du nom est stable et lisible dans un
   * loadout sauvegardé. À revoir si on branche un jour l'artefact sur le
   * Manifest.
   * EN: ⚠️ CHANGED (2026-08-04) - the artifact is identified by a readable id
   * rather than a Manifest hash, because our source (the Markdown knowledge
   * base) provides no hash. Revisit if artifacts are ever read from the
   * Manifest.
   */
  artifactId?: string;
  /** FR : clés des perks choisis, au format "idArtefact:tier:nomPerk" (voir clePerk dans SelecteurArtefact ; commentaire corrigé le 27/09/2026, il indiquait un format périmé). / EN: chosen perk keys, formatted "artifactId:tier:perkName" (see clePerk). */
  perkCles?: string[];
  /** FR : conservés pour compatibilité avec les loadouts enregistrés avant ce changement - non utilisés par le sélecteur actuel. / EN: kept for compatibility with loadouts saved before this change. */
  artifactHash?: DefinitionHash;
  perkHashes?: DefinitionHash[];
}

export type SlotArme = "cinetique" | "energie" | "lourde";
export type SlotArmure = "casque" | "gants" | "torse" | "jambes" | "marque";

export interface GearPiece {
  itemInstanceId?: string; // présent si l'objet vient de l'inventaire réel
  itemHash: DefinitionHash;
  nom?: string; // nom lisible (Manifest), pour l'affichage dans l'éditeur de build
  icone?: string; // URL complète de la miniature (Manifest), pour l'affichage
  /**
   * FR : Emplacement explicite de la pièce, plutôt que de déduire sa place
   * de sa position dans le tableau `armes`/`armure` - plus fiable et plus
   * clair quand on ajoute une pièce depuis la recherche ou l'inventaire.
   * EN: Explicit slot for the piece, rather than inferring its place from
   * its position in the `armes`/`armure` array - more reliable and clearer
   * when adding a piece from search or inventory.
   */
  slot: SlotArme | SlotArmure;
  stats: Partial<StatBlock>;
  perkHashes: DefinitionHash[]; // rolls d'armes / mods d'armure équipés
  isExotic: boolean;
  /**
   * FR : Classe requise pour porter cette pièce (armure uniquement -
   * absent/undefined pour une arme ou une pièce universelle). Utilisé pour
   * filtrer l'inventaire affiché selon la classe sélectionnée.
   * EN: Class required to wear this piece (armor only - absent/undefined
   * for a weapon or a universal piece). Used to filter the displayed
   * inventory by the selected class.
   */
  classeRequise?: "titan" | "chasseur" | "arcaniste";
  /** FR : d'où vient l'objet - un personnage ou le coffre. Absent pour les objets ajoutés depuis la recherche (non possédés). / EN: where the item comes from - a character or the vault. Absent for search-added items (not owned). */
  origine?: "coffre" | "titan" | "chasseur" | "arcaniste";
  /** FR : actuellement équipé sur son personnage d'origine (vs simplement dans l'inventaire). / EN: currently equipped on its origin character (vs just in inventory). */
  equipe?: boolean;
  /** FR : mêmes perks que perkHashes, mais groupés par colonne de socket (index) pour un affichage façon jeu dans "Mon build". / EN: same perks as perkHashes, but grouped by socket column (index) for an in-game-style display in "Mon build". */
  perksParColonne?: Array<{ socketIndex: number; hash: DefinitionHash }>;
  /** FR : nom officiel de l'élément de l'arme (Cinétique/Solaire/Arc/Abyssal/Stase/Filobscur), résolu via le Manifest - absent pour l'armure. / EN: weapon's official element name (Kinetic/Solar/Arc/Void/Stasis/Strand), resolved via the Manifest - absent for armor. */
  elementArme?: string;
  /** FR : URL de l'icône officielle de l'élément (résolue via le Manifest), pour affichage visuel au lieu du texte. / EN: URL of the element's official icon (resolved via the Manifest), for visual display instead of text. */
  elementArmeIcone?: string;
  /** FR : nom de rareté résolu via le Manifest (Commun/Rare/Légendaire/Exotique...), pour le futur filtre du Coffre. / EN: rarity name resolved via the Manifest (Common/Rare/Legendary/Exotic...), for the future Vault filter. */
  rarete?: string;
  /** FR : type d'arme lisible (Fusil à pompe, Lance-roquettes...), pour le futur filtre du Coffre - absent pour l'armure. / EN: readable weapon type (Shotgun, Rocket Launcher...), for the future Vault filter - absent for armor. */
  typeArme?: string;
  /** FR : type d'armure lisible (Casque, Gants...), pour le filtre du Coffre - absent pour les armes. / EN: readable armor type (Helmet, Gauntlets...), for the Vault filter - absent for weapons. */
  typeArmure?: string;
  /**
   * FR : Hash du set d'armure auquel appartient cette pièce (Armor 3.0,
   * depuis Edge of Fate/Monument of Triumph). Absent pour les armes et pour
   * les pièces qui n'appartiennent à aucun set nommé. En jeu, une pièce
   * exotique n'appartient jamais à un set légendaire.
   * EN: Hash of the armor set this piece belongs to (Armor 3.0, since Edge
   * of Fate/Monument of Triumph). Absent for weapons and for pieces that
   * belong to no named set. In-game, an exotic piece never belongs to a
   * legendary set.
   */
  setHash?: DefinitionHash;
}

export interface BuildDraft {
  id: string;
  nom: string;
  /** FR : contexte d'usage, qui pondère les piliers ET les statistiques (voir lib/scoring/stats.ts et lib/scoring/pillars.ts). Optionnel : "neutre" par défaut, et les loadouts enregistrés avant ce champ restent valides. / EN: usage context, weighting both pillars AND stats. Optional, defaults to "neutre". */
  contexte?: "neutre" | "roaming" | "dps" | "pvp";
  subclass: SubclassConfig;
  artifact: ArtifactSelection;
  armes: GearPiece[]; // Cinétique / Énergie / Lourde
  // 5 pièces : Casque / Gants / Torse / Jambes / Marque de classe.
  // L'exotique (si équipée) est l'une de ces 5 pièces (isExotic: true),
  // pas une pièce en plus — sinon ses stats sont exclues du calcul du
  // pilier 5 (bug détecté par les tests du 01/08/2026, corrigé ici).
  armure: GearPiece[];
}


const SLOTS_ARME: SlotArme[] = ["cinetique", "energie", "lourde"];

/**
 * FR : Place une pièce (arme ou armure) dans le build, à son emplacement
 * (`piece.slot`) - remplace la pièce déjà présente à cet emplacement s'il y
 * en avait une. Utilisé par les boutons "+ Ajouter au build" de la
 * recherche et de l'inventaire.
 * EN: Places a piece (weapon or armor) in the build, at its slot
 * (`piece.slot`) - replaces the piece already there, if any. Used by the
 * "+ Add to build" buttons in search and inventory.
 */
export function poserPieceDansBuild(build: BuildDraft, piece: GearPiece): BuildDraft {
  if (SLOTS_ARME.includes(piece.slot as SlotArme)) {
    const armes = build.armes.filter((a) => a.slot !== piece.slot);
    armes.push(piece);
    return { ...build, armes };
  }
  const armure = build.armure.filter((a) => a.slot !== piece.slot);
  armure.push(piece);
  return { ...build, armure };
}

/** Résultat du scoring, un score par pilier (0-100) + score global pondéré */
export interface PillarScore {
  pilier:
    | "element_doctrine"
    | "verbes_element"
    | "perks_artefact"
    | "loot_coherence"
    | "stats_2_0";
  score: number; // 0-100
  /** FR : ⚠️ CHANGÉ (04/08/2026) - le poids n'est plus fixe à 0.20 : il dépend du CONTEXTE du build (voir lib/scoring/stats.ts et lib/scoring/pillars.ts). / EN: no longer a flat 0.20 - depends on the build CONTEXT. */
  poids: number;
  details: string[]; // justification lisible (ex: "Grenade au palier T10 requis par Caresse du Ver : OK")
}

export interface BuildScoreResult {
  buildId: string;
  scoreGlobal: number; // somme(score * poids), sur 100
  piliers: PillarScore[];
  /** FR : Stats déjà sommées, réutilisables par l'UI (évite un second calcul). / EN: Already-summed stats, reusable by the UI (avoids a second computation). */
  statsTotales: StatBlock;
  /**
   * FR : ⚠️ AJOUT (24/08/2026) - taux de complétion du build, affiché À CÔTÉ
   * du score plutôt que fondu dedans. Décision prise avec l'utilisateur : un
   * build incomplet ne doit pas être pénalisé SILENCIEUSEMENT, on note ce
   * qui est équipé et on indique séparément ce qui manque. Sans ça, un score
   * de 60 pouvait vouloir dire « build médiocre » ou « build à moitié
   * rempli » - deux situations très différentes, impossibles à distinguer.
   * EN: ⚠️ ADDED - build completion rate, shown NEXT TO the score rather
   * than folded into it. An incomplete build shouldn't be penalised
   * SILENTLY: we score what's equipped and separately state what's missing.
   * Otherwise a score of 60 could mean "mediocre build" or "half-filled
   * build" - two very different situations.
   */
  completion: {
    /** FR : pourcentage d'emplacements remplis (0-100). / EN: percentage of filled slots. */
    taux: number;
    remplis: number;
    total: number;
    /** FR : libellés de ce qui manque, pour l'afficher tel quel. / EN: labels of what's missing. */
    manquants: string[];
  };
}
