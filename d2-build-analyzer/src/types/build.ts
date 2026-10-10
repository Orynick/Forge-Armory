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

/** Un verbe d'élément (Scorched, Jolt, Devour, Sever, Volatile, Slow/Freeze, Unravel, Tangle, Radiant, Weaken...) */
export interface ElementVerb {
  id: string;
  nom: string;
  element: DamageElement;
  description: string;
  /** Sources qui appliquent ce verbe dans le build (hash de perk/aspect/fragment/mod) */
  sources: DefinitionHash[];
}

export type DamageElement =
  | "solaire"
  | "arc"
  | "abyssal" // Vide
  | "stase"
  | "filobscur" // Strand
  | "prismatique";

export interface SubclassConfig {
  classe: "titan" | "chasseur" | "arcaniste";
  element: DamageElement;
  superHash: DefinitionHash;
  aspectHashes: DefinitionHash[]; // 2 aspects (3 en Prismatique)
  fragmentHashes: DefinitionHash[]; // 4 à 6 selon les slots débloqués
}

export interface ArtifactSelection {
  artifactHash: DefinitionHash;
  perkHashes: DefinitionHash[]; // perks actifs sélectionnés dans l'artefact
}

export interface GearPiece {
  itemInstanceId?: string; // présent si l'objet vient de l'inventaire réel
  itemHash: DefinitionHash;
  stats: Partial<StatBlock>;
  perkHashes: DefinitionHash[]; // rolls d'armes / mods d'armure équipés
  isExotic: boolean;
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
  subclass: SubclassConfig;
  artifact: ArtifactSelection;
  armes: GearPiece[]; // Cinétique / Énergie / Lourde
  // 5 pièces : Casque / Gants / Torse / Jambes / Marque de classe.
  // L'exotique (si équipée) est l'une de ces 5 pièces (isExotic: true),
  // pas une pièce en plus — sinon ses stats sont exclues du calcul du
  // pilier 5 (bug détecté par les tests du 01/08/2026, corrigé ici).
  armure: GearPiece[];
}

/** Renvoie la pièce d'armure exotique équipée, s'il y en a une */
export function trouverExotiqueArmure(build: BuildDraft): GearPiece | undefined {
  return build.armure.find((p) => p.isExotic);
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
  poids: number; // 0.20 fixe pour chacun des 5 piliers
  details: string[]; // justification lisible (ex: "Grenade au palier T10 requis par Caresse du Ver : OK")
}

export interface BuildScoreResult {
  buildId: string;
  scoreGlobal: number; // somme(score * poids), sur 100
  piliers: PillarScore[];
  /** FR : Stats déjà sommées, réutilisables par l'UI (évite un second calcul). / EN: Already-summed stats, reusable by the UI (avoids a second computation). */
  statsTotales: StatBlock;
}
