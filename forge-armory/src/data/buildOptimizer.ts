// FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur, v0.5.x réservé) - OPTIMISEUR DE BUILD v2.
// Module PUR : aucune dépendance React, aucune lecture réseau, aucune lecture du Manifest.
// Entrée/sortie en JSON-sérialisables uniquement, testable unitairement (tests/logique/build-optimiseur.test.ts).
//
// Contrat (non négociable, validé avec l'utilisateur) :
//   - Travail par PALIERS de 10 (concept de « stat mixes » de DIM) : chaque pièce est réduite
//     à son vecteur de paliers AVANT énumération. Des millions de combinaisons en valeurs
//     brutes, quelques centaines de milliers en paliers ; DIM traite ~1,9 M de combinaisons
//     en ~2 s avec cette approche.
//   - ÉLAGAGE (branch and bound) : une branche dont le palier maximum atteignable ne peut
//     plus satisfaire les minimums est coupée. Borne supérieure = somme des MEILLEURS
//     paliers restants par slot.
//   - Complexité cible : < 2 s pour un coffre de 200 pièces. Le module expose `dureeMs`
//     pour que l'UI affiche un indicateur de progression au-delà de 500 ms (worker plus tard
//     si le calcul bloque réellement l'interface Electron).
//
// Hors périmètre v1 : le scoring (lib/scoring/*) n'est PAS modifié et n'utilise PAS ce
// module. L'optimiseur ne modifie aucun score et n'écrit aucune donnée de build : le
// bouton « enregistrer comme build » de l'UI reste la seule passerelle (flux Forge).
// EN: ADDED - BUILD OPTIMIZER v2. Pure module: no React, no network, no Manifest reads.
// JSON-serializable in/out, unit-testable.

import type { GearPiece, SlotArmure, StatBlock, StatKey } from "../types/build";
import { ORDRE_STATS } from "./libellesUI";
import { palier } from "../lib/scoring/stats";

/** Les 5 emplacements d'armure, dans l'ordre d'énumération. */
export const SLOTS_ARMURE: SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];

/** FR : borne dure du nombre de stat mixes DISTINCTS retenus par slot (après dédup). 36^5 ≈ 60 M ;
 * avec élagage, un coffre de 200 pièces reste sous les 2 s. Ajustable via `maxMixParSlot`. / EN: hard bound on
 * DISTINCT stat mixes kept per slot (after dedup). */
export const MAX_MIX_PAR_SLOT_DEFAUT = 24;

/** Bonus « supposer masterwork » appliqué en HYPOTHÈSE (les stats lues incluent déjà le bonus réel). */
export type ModeMasterwork = "aucun" | "legendaire" | "tout";

/** Choix de l'exotique : aucun, un exotique précis (hash), ou tous ceux du personnage. */
export type ModeExotique = "aucun" | "fixe" | "tous";

/** Une pièce d'armure réduite à ce que consomme l'optimiseur (JSON-sérialisable). */
export interface EntreePiece {
  /** Identifiant stable de l'exemplaire (itemInstanceId réel, ou hash pour une pièce de recherche). */
  id: string;
  slot: SlotArmure;
  stats: Partial<StatBlock>;
  isExotic: boolean;
  /** Masterwork RÉEL de l'exemplaire. undefined = non lu (pièce non possédée). */
  estMasterwork?: boolean;
  /** Stats intrinsèques de l'exemplaire (sans mods ni masterwork) - base de la règle des « trois plus basses » du masterwork. undefined = non lu. */
  statsIntrinseques?: Partial<StatBlock>;
  /** Rareté résolue (Manifest) : "Exotique", "Légendaire"... undefined = non lu. */
  rarete?: string;
  nom?: string;
  icone?: string;
  /** Classe requise (il n'existe pas d'armure « toute classe »). */
  classeRequise?: "titan" | "chasseur" | "arcaniste";
  /** FR : ⚠️ AJOUT (24/10/2026, merge v0.5.5) - « courrier » est une origine possible (point 5.8). / EN: ADDED - "courrier" is a possible origin (point 5.8). */
  origine?: "coffre" | "titan" | "chasseur" | "arcaniste" | "courrier";
}

export interface EntreeOptimiseur {
  /** Pièces d'armure du compte ENTIER (coffre + tous les personnages), déjà filtrées ou non par la couche appelante. */
  pieces: EntreePiece[];
  /** Classe du personnage actif : filtre les pièces (pas d'armure universelle). */
  classe: "titan" | "chasseur" | "arcaniste";
  /** Minimum par statistique, en VALEUR BRUTE (0 à 100). 0 = pas de minimum. */
  minimums: Partial<Record<StatKey, number>>;
  /** Ordre de priorité des six statistiques (la plus prioritaire en premier). */
  priorites: StatKey[];
  /** Mode exotique. `exotiqueFixe` requis si mode = "fixe". */
  modeExotique: ModeExotique;
  exotiqueFixe?: string;
  /** Hypothèse masterwork : bonus appliqué aux pièces NON masterworked (évite le double comptage). */
  masterwork: ModeMasterwork;
  /** Combien de meilleurs ensembles conserver PAR exotique (défaut 1). */
  topParExotique?: number;
  /** Borne de stat mixes distincts par slot (défaut MAX_MIX_PAR_SLOT_DEFAUT). */
  maxMixParSlot?: number;
}

/** Vecteur de paliers d'une pièce, aligné sur ORDRE_STATS. */
export type VecteurPaliers = number[];

/** Un ensemble d'armures proposé par l'optimiseur. */
export interface ResultatSet {
  /** Pièces retenues, indexées par EntreePiece.id. */
  pieces: string[];
  /** Somme des paliers atteints par statistique, alignée sur ORDRE_STATS (affichage en T). */
  paliers: VecteurPaliers;
  /** Somme des paliers AVANT l'hypothèse masterwork (référence « sans supposition »). */
  paliersSansMasterwork: VecteurPaliers;
  /** Somme des valeurs brutes lues (avant hypothèse masterwork), pour information. */
  statsBrutes: StatBlock;
  /** Exotique porté par cet ensemble (id de pièce), ou null. */
  exotiqueId: string | null;
  /** Ordre de tri (0 = meilleur selon les priorités). */
  rang: number;
}

/** Résultat par groupe d'exotique (un groupe si modeExotique = "tous"). */
export interface GroupeExotique {
  /** null = groupe « sans exotique ». Sinon id de la pièce exotique. */
  exotiqueId: string | null;
  nomExotique?: string;
  sets: ResultatSet[];
}

export interface ResultatOptimiseur {
  groupes: GroupeExotique[];
  /** Nombre de combinaisons énumérées (avant élagage). */
  nbCombinaisons: number;
  /** Nombre de branches coupées par élagage. */
  nbElages: number;
  /** Nombre d'exemplaires écartés par déduplication des stat mixes (même vecteur de paliers). */
  nbDoublons: number;
  /** Durée du calcul en millisecondes (l'UI affiche un indicateur au-delà de 500 ms). */
  dureeMs: number;
  /** true si au moins un ensemble satisfait tous les minimums. */
  atteignable: boolean;
}

/** Bonus hypothétique par statistique pour une pièce non masterworked. */
function bonusMasterworkHypothetique(mode: ModeMasterwork, piece: EntreePiece): Partial<StatBlock> {
  if (mode === "aucun") return {};
  if (piece.estMasterwork) return {}; // déjà compté dans les stats lues
  const estLegendaire = piece.rarete === "Légendaire" || (!piece.isExotic && piece.rarete === undefined);
  if (mode === "legendaire" && !estLegendaire) return {};
  // FR : ⚠️ MODÈLE HYBRIDE (décision utilisateur 20/10/2026) - Armor 2.0 : +2 sur les six stats ;
  // Armor 3.0 : +5 sur les TROIS stats intrinsèques les plus basses (même règle que le jeu,
  // voir lib/bungie/inventaire.ts). L'UI portera le rappel : les items choisis doivent
  // RÉELLEMENT être masterworked. Le classement des « plus basses » se fait sur les stats
  // INTRINSÈQUES quand elles sont lues, sinon sur le total de la pièce (repli).
  const base: Partial<StatBlock> = {};
  for (const cle of ORDRE_STATS) {
    base[cle] = piece.statsIntrinseques?.[cle] ?? 0;
  }
  const troisPlusBasses = [...ORDRE_STATS].sort((a, b) => (base[a] ?? 0) - (base[b] ?? 0)).slice(0, 3);
  const delta: Partial<StatBlock> = {};
  for (const cle of ORDRE_STATS) {
    delta[cle] = troisPlusBasses.includes(cle) ? 5 : 2; // Armor 3.0 hybride : +5 sur les 3 basses, +2 ailleurs
  }
  return delta;
}

/** Réduit une pièce à son vecteur de paliers (après hypothèse masterwork). */
function vecteurPaliersPiece(piece: EntreePiece, masterwork: ModeMasterwork): VecteurPaliers {
  const bonus = bonusMasterworkHypothetique(masterwork, piece);
  return ORDRE_STATS.map((cle) => palier((piece.stats[cle] ?? 0) + (bonus[cle] ?? 0)));
}

/** Construit l'entrée interne d'une pièce : paliers avec ET sans hypothèse masterwork. */
function pieceInterne(piece: EntreePiece, masterwork: ModeMasterwork): PieceInterne {
  return {
    piece,
    paliers: vecteurPaliersPiece(piece, masterwork),
    paliersSansMasterwork: vecteurPaliersPiece(piece, "aucun"),
  };
}

/** Filtre les pièces : armure de la classe active uniquement (pas d'armure universelle). */
export function filtrerPiecesPourClasse(pieces: EntreePiece[], classe: "titan" | "chasseur" | "arcaniste"): EntreePiece[] {
  return pieces.filter((p) => SLOTS_ARMURE.includes(p.slot) && p.classeRequise === classe);
}

interface PieceInterne {
  piece: EntreePiece;
  paliers: VecteurPaliers;
  /** Vecteur de paliers SANS l'hypothèse masterwork (pour le diagnostic « delta »). */
  paliersSansMasterwork: VecteurPaliers;
}

/**
 * FR : ⚠️ DÉDUPLICATION DES « STAT MIXES » (20/10/2026) - cœur de l'approche DIM citée
 * dans le contrat : des millions de combinaisons en valeurs brutes, quelques centaines de
 * milliers en paliers. Deux exemplaires avec le MÊME vecteur de paliers sont
 * interchangeables pour le résultat : on n'en garde qu'UN par slot (le premier, ordre
 * stable) et on compte les autres comme écartés. `nbDoublons` est exposé pour le
 * diagnostic (combien de combinaisons théoriques ont été fusionnées).
 * EN: deduplication of "stat mixes" (the DIM approach quoted in the contract): millions
 * of combinations in raw values, a few hundred thousand in tiers. Two instances with the
 * SAME tier vector are interchangeable for the result: keep only ONE per slot (the first,
 * stable order) and count the others as dropped.
 */
function dedupliquerParVecteur(pieces: PieceInterne[], maxMixParSlot: number): { retenues: PieceInterne[]; nbDoublons: number } {
  const vus = new Set<string>();
  const uniques: PieceInterne[] = [];
  let nbDoublons = 0;
  for (const p of pieces) {
    const cle = p.paliers.join(",");
    if (vus.has(cle)) {
      nbDoublons++;
      continue;
    }
    vus.add(cle);
    uniques.push(p);
  }
  // FR : si un slot contient encore trop de stat mixes DISTINCTS, on garde les
  // `maxMixParSlot` meilleurs (total de paliers décroissant) : borne dure de complexité.
  // EN: if a slot still holds too many DISTINCT stat mixes, keep the `maxMixParSlot` best
  // (decreasing tier total): hard complexity bound.
  if (uniques.length <= maxMixParSlot) return { retenues: uniques, nbDoublons };
  uniques.sort((a, b) => b.paliers.reduce((s, v) => s + v, 0) - a.paliers.reduce((s, v) => s + v, 0));
  nbDoublons += uniques.length - maxMixParSlot;
  return { retenues: uniques.slice(0, maxMixParSlot), nbDoublons };
}

function comparerPaliers(a: VecteurPaliers, b: VecteurPaliers, priorites: StatKey[]): number {
  for (const cle of priorites) {
    const i = ORDRE_STATS.indexOf(cle);
    if (a[i] !== b[i]) return b[i] - a[i]; // décroissant : meilleur palier d'abord
  }
  // Égalité sur les priorités : total de paliers, puis ordre canonique (stabilité)
  const totalA = a.reduce((s, v) => s + v, 0);
  const totalB = b.reduce((s, v) => s + v, 0);
  if (totalA !== totalB) return totalB - totalA;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return b[i] - a[i];
  }
  return 0;
}

/**
 * FR : CŒUR DE L'OPTIMISEUR - énumération par paliers avec élagage.
 * Pour chaque groupe (exotique fixé ou aucun), on parcourt les 5 slots en profondeur,
 * en maintenant la somme courante des paliers. Borne supérieure à chaque nœud :
 * somme courante + somme des MEILLEURS paliers restants par slot. Si cette borne ne
 * satisfait pas un minimum, la branche est coupée.
 * EN: OPTIMIZER CORE - tier-based enumeration with pruning.
 */
function enumererGroupe(
  piecesParSlot: PieceInterne[][],
  minimumsPaliers: number[],
  priorites: StatKey[],
  exotiqueId: string | null,
  topN: number,
  maxMixParSlot: number
): { sets: ResultatSet[]; nbCombinaisons: number; nbElages: number; nbDoublons: number; pieces: EntreePiece[] } {
  // FR : dédup par vecteur de paliers, PAR SLOT (un même vecteur sur deux slots différents
  // reste deux pièces distinctes). L'exotique fixé n'est jamais dédupliqué (il est unique).
  let nbDoublons = 0;
  piecesParSlot = piecesParSlot.map((liste) => {
    const exoId = exotiqueId;
    const aDedup = liste.filter((p) => p.piece.id !== exoId);
    const exo = liste.find((p) => p.piece.id === exoId);
    const { retenues, nbDoublons: nd } = dedupliquerParVecteur(aDedup, maxMixParSlot);
    nbDoublons += nd;
    return exo ? [exo, ...retenues] : retenues;
  });
  const NB_SLOTS = SLOTS_ARMURE.length;
  const toutesPieces = piecesParSlot.flat().map((p) => p.piece);
  const meilleurParSlot: number[][] = piecesParSlot.map((liste) => {
    const meilleur = ORDRE_STATS.map(() => 0);
    for (const p of liste) {
      for (let i = 0; i < ORDRE_STATS.length; i++) {
        if (p.paliers[i] > meilleur[i]) meilleur[i] = p.paliers[i];
      }
    }
    return meilleur;
  });
  // borneMax[slot] = somme des meilleurs paliers des slots >= slot (suffixe)
  const borneMax: number[][] = Array.from({ length: NB_SLOTS + 1 }, () => ORDRE_STATS.map(() => 0));
  for (let s = NB_SLOTS - 1; s >= 0; s--) {
    for (let i = 0; i < ORDRE_STATS.length; i++) {
      borneMax[s][i] = borneMax[s + 1][i] + meilleurParSlot[s][i];
    }
  }

  // FR : ⚠️ OPTIMISATION (20/10/2026) - on ne stocke PAS tous les ensembles valides en
  // mémoire (un coffre de 200 pièces peut en produire des centaines de milliers) : on
  // garde un TOP N glissant (les `topN` meilleurs vus, triés par priorité). C'est ce qui
  // tient la complexité mémoire en O(topN) au lieu de O(résultats).
  // EN: we do NOT store every valid set in memory (a 200-piece vault can yield hundreds
  // of thousands): we keep a sliding TOP N (the best `topN` seen so far, sorted by
  // priority). Memory stays O(topN) instead of O(results).
  const fileTop: { paliers: VecteurPaliers; ids: string[]; pieces: PieceInterne[] }[] = [];
  let nbCombinaisons = 0;
  let nbElages = 0;
  const pousseTop = (candidat: { paliers: VecteurPaliers; ids: string[]; pieces: PieceInterne[] }) => {
    let i = 0;
    while (i < fileTop.length && comparerPaliers(fileTop[i].paliers, candidat.paliers, priorites) <= 0) i++;
    if (i >= topN) return; // moins bon que le top N actuel
    fileTop.splice(i, 0, candidat);
    if (fileTop.length > topN) fileTop.pop();
  };

  const courantPaliers = ORDRE_STATS.map(() => 0);
  const courantIds: string[] = [];
  const courantPieces: PieceInterne[] = [];

  function satisfaitMinimums(paliers: number[]): boolean {
    for (let i = 0; i < ORDRE_STATS.length; i++) {
      if (paliers[i] < minimumsPaliers[i]) return false;
    }
    return true;
  }

  function dfs(slot: number) {
    if (slot === NB_SLOTS) {
      nbCombinaisons++;
      if (satisfaitMinimums(courantPaliers)) {
        pousseTop({ paliers: [...courantPaliers], ids: [...courantIds], pieces: [...courantPieces] });
      }
      return;
    }
    for (const p of piecesParSlot[slot]) {
      // Élagage : borne supérieure = courant + meilleurs paliers restants
      let coupable = false;
      for (let i = 0; i < ORDRE_STATS.length; i++) {
        if (courantPaliers[i] + p.paliers[i] + borneMax[slot + 1][i] < minimumsPaliers[i]) {
          coupable = true;
          break;
        }
      }
      if (coupable) {
        nbElages++;
        continue;
      }
      for (let i = 0; i < ORDRE_STATS.length; i++) courantPaliers[i] += p.paliers[i];
      courantIds.push(p.piece.id);
      courantPieces.push(p);
      dfs(slot + 1);
      courantIds.pop();
      courantPieces.pop();
      for (let i = 0; i < ORDRE_STATS.length; i++) courantPaliers[i] -= p.paliers[i];
    }
  }

  dfs(0);

  const sets: ResultatSet[] = fileTop.map((r, rang) => {
    const statsBrutes = ORDRE_STATS.reduce((acc, cle) => {
      acc[cle] = r.pieces.reduce((s, p) => s + (p.piece.stats[cle] ?? 0), 0);
      return acc;
    }, {} as StatBlock);
    // FR : les paliers « sans masterwork » sont la somme par stat des paliers de chaque
    // pièce SANS hypothèse (un palier n'est pas additif sur les valeurs brutes, d'où le
    // calcul pièce par pièce). Sert au diagnostic UI : « avec supposition, Mêlée T3 → T4 ».
    // EN: "without masterwork" tiers are the per-stat sum of each piece's tiers WITHOUT
    // the assumption (a tier is not additive over raw values, hence piece by piece).
    const mapPieces = new Map(r.pieces.map((p) => [p.piece.id, p]));
    const paliersSansMasterwork = ORDRE_STATS.map((_, i) =>
      r.ids.reduce((s, id) => s + (mapPieces.get(id)?.paliersSansMasterwork[i] ?? 0), 0)
    );
    return { pieces: r.ids, paliers: r.paliers, paliersSansMasterwork, statsBrutes, exotiqueId, rang };
  });
  return { sets, nbCombinaisons, nbElages, nbDoublons, pieces: toutesPieces };
}

/**
 * FR : Point d'entrée unique. Ne lève JAMAIS : un coffre vide ou des minimums
 * inatteignables produisent un résultat vide (`groupes: []`, `atteignable: false`).
 * EN: Single entry point. NEVER throws: an empty vault or unreachable minimums
 * yield an empty result.
 */
export function optimiserBuild(entree: EntreeOptimiseur): ResultatOptimiseur {
  const debut = Date.now();
  const priorites = entree.priorites.length === ORDRE_STATS.length ? entree.priorites : ORDRE_STATS;
  const minimumsPaliers = ORDRE_STATS.map((cle) => palier(entree.minimums[cle] ?? 0));
  const topN = entree.topParExotique ?? 1;

  const piecesClasse = filtrerPiecesPourClasse(entree.pieces, entree.classe);
  const masterwork = entree.masterwork ?? "aucun";

  // Groupes d'exotiques à essayer
  const groupesExotiques: { exotiqueId: string | null; pieces: EntreePiece[] }[] = [];
  if (entree.modeExotique === "aucun") {
    groupesExotiques.push({ exotiqueId: null, pieces: piecesClasse.filter((p) => !p.isExotic) });
  } else if (entree.modeExotique === "fixe") {
    const fixe = piecesClasse.find((p) => p.isExotic && p.id === entree.exotiqueFixe);
    if (fixe) {
      // L'exotique fixé occupe son slot ; les autres slots prennent du non-exotique
      const autres = piecesClasse.filter((p) => !p.isExotic);
      groupesExotiques.push({ exotiqueId: fixe.id, pieces: [...autres, fixe] });
    }
  } else {
    // « tous » : un groupe par exotique possédé de la classe
    const exotiques = piecesClasse.filter((p) => p.isExotic);
    const dejaVus = new Set<string>();
    for (const exo of exotiques) {
      if (dejaVus.has(exo.id)) continue;
      dejaVus.add(exo.id);
      const autres = piecesClasse.filter((p) => !p.isExotic);
      groupesExotiques.push({ exotiqueId: exo.id, pieces: [...autres, exo] });
    }
  }

  const groupes: GroupeExotique[] = [];
  let nbCombinaisons = 0;
  let nbElages = 0;
  let nbDoublons = 0;
  let atteignable = false;

  for (const g of groupesExotiques) {
    // Si l'exotique est fixé, son slot ne propose QUE lui (un set = un seul exotique)
    const parSlot: PieceInterne[][] = SLOTS_ARMURE.map((slot) => {
      const liste = g.pieces
        .filter((p) => p.slot === slot)
        .map((p) => pieceInterne(p, masterwork));
      if (g.exotiqueId !== null) {
        const exo = liste.find((p) => p.piece.id === g.exotiqueId);
        if (exo) return slot === exo.piece.slot ? [exo] : []; // l'exotique occupe SON slot, les autres slots n'ont que du non-exotique
      }
      return liste.filter((p) => !p.piece.isExotic);
    });
    // Un slot vide = aucune combinaison possible pour ce groupe
    if (parSlot.some((l) => l.length === 0)) continue;

    const { sets, nbCombinaisons: nc, nbElages: ne, nbDoublons: nd, pieces } = enumererGroupe(
      parSlot,
      minimumsPaliers,
      priorites,
      g.exotiqueId,
      topN,
      entree.maxMixParSlot ?? MAX_MIX_PAR_SLOT_DEFAUT
    );
    nbCombinaisons += nc;
    nbElages += ne;
    nbDoublons += nd;
    if (sets.length > 0) atteignable = true;
    const exotiquePiece = g.exotiqueId ? pieces.find((p) => p.id === g.exotiqueId) : null;
    groupes.push({
      exotiqueId: g.exotiqueId,
      nomExotique: exotiquePiece?.nom,
      sets,
    });
  }

  return {
    groupes,
    nbCombinaisons,
    nbElages,
    nbDoublons,
    dureeMs: Date.now() - debut,
    atteignable,
  };
}

/** Convertit des GearPiece (inventaire réel) en entrées JSON pour l'optimiseur. */
export function pieceVersEntree(p: GearPiece): EntreePiece {
  return {
    id: p.itemInstanceId ?? `hash:${p.itemHash}`,
    slot: p.slot as SlotArmure,
    stats: p.stats,
    isExotic: p.isExotic,
    estMasterwork: p.estMasterwork,
    statsIntrinseques: p.statsIntrinseques,
    rarete: p.rarete,
    nom: p.nom,
    icone: p.icone,
    classeRequise: p.classeRequise,
    origine: p.origine,
  };
}
