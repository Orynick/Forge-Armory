// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR, ÉCRAN B (maquette validée par l'utilisateur) : le passage « SOLUTION → SIMULATION » et les RÉGLAGES mémorisés de l'écran. Pur : aucune interface. « Simuler cette solution » écrit, pour chacune des cinq pièces, les changements de mods de la combinaison choisie dans le magasin des simulations (celui des fenêtres Détails et de la Forge) : le score, Mon Build et les cartes les voient aussitôt ; « Annuler » retire ces simulations. Rien n'est modifié en jeu.
// EN: ⚠️ ADDED - optimizer screen B: solution → simulation (pure) and the screen's persisted settings.
import type { Database } from "sql.js";
import type { StatKey } from "../../types/build";
import { colonnesArmure } from "./armure";
import { appliquerChangements, type Changement } from "./energieMods";
import { reinitialiserArme, type Simulations, type Stockage } from "./simulation";
import type { OptionPiece, SolutionPieces } from "./optimiseurPieces";

/** FR : les changements à écrire dans les simulations pour UNE combinaison (vide : la pièce telle qu'équipée). */
export const changementsDeOption = (o: OptionPiece): Changement[] => Object.entries(o.choix).map(([socketIndex, c]) => ({ socketIndex: Number(socketIndex), plugHash: c.effectif }));

/** FR : simule une solution : pour chaque pièce, repart de l'équipement RÉEL (la simulation précédente de cette pièce est remplacée) puis applique la combinaison. Les autres pièces ne sont pas touchées. */
export function simulerSolution(s: Simulations, db: Database, sol: SolutionPieces): Simulations {
  return sol.pieces.reduce((acc, { piece, option }) => {
    const id = piece.itemInstanceId; if (!id) return acc;
    return appliquerChangements(reinitialiserArme(acc, id, "armures"), id, colonnesArmure(db, piece), changementsDeOption(option));
  }, s);
}
/** FR : annule la simulation des cinq pièces d'une solution (retour à l'équipement réel). */
export const annulerSolution = (s: Simulations, sol: SolutionPieces): Simulations => sol.pieces.reduce((acc, { piece }) => (piece.itemInstanceId ? reinitialiserArme(acc, piece.itemInstanceId, "armures") : acc), s);
/** FR : vrai quand les simulations en cours sont EXACTEMENT celles de cette solution (chaque pièce : les mêmes changements, et aucun autre ; une pièce sans changement n'a aucune simulation) ET que la solution demande au moins un changement. */
export function solutionSimulee(s: Simulations, sol: SolutionPieces): boolean {
  // une solution qui ne demande AUCUN changement de mod n'est jamais « simulée » (il n'y a rien à simuler : l'écran le dit autrement)
  return sol.pieces.length > 0 && sol.pieces.some(({ option }) => option.modifs > 0) && sol.pieces.every(({ piece, option }) => {
    const id = piece.itemInstanceId; if (!id) return false;
    const actuelle = s.armures?.[id] ?? {};
    const voulues = Object.entries(option.choix);
    return Object.keys(actuelle).length === voulues.length && voulues.every(([i, c]) => actuelle[Number(i)]?.effectif === c.effectif);
  });
}
/** FR : vrai si AU MOINS UNE pièce de la solution porte déjà une simulation (pour proposer d'annuler). */
export const solutionAUneSimulation = (s: Simulations, sol: SolutionPieces): boolean => sol.pieces.some(({ piece }) => piece.itemInstanceId && Object.keys(s.armures?.[piece.itemInstanceId] ?? {}).length > 0);

// ---------- les réglages mémorisés ----------
export const CLE_PREFS_OPTIMISEUR = "forge-armory.optimiseur.v1";
export interface PrefsOptimiseur {
  /** FR : objectifs : une statistique absente n'est pas ciblée. */
  cibles: Partial<Record<StatKey, number>>;
  energieLibre: number;
  exotique: "choix" | "aucune";
  /** FR : doctrine prismatique équipée (l'objet de classe exotique n'est permis que dans ce cas) : `null` tant que l'utilisateur n'a pas choisi : on suit alors le build. */
  prismatique: boolean | null;
}
export const PREFS_PAR_DEFAUT = (): PrefsOptimiseur => ({ cibles: {}, energieLibre: 0, exotique: "choix", prismatique: null });
const STATS: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
/** FR : relit les réglages ; une valeur absente, illisible ou hors limites est remplacée par la valeur par défaut, jamais d'exception. */
export function lirePrefsOptimiseur(stockage: Pick<Stockage, "getItem">): PrefsOptimiseur {
  const d = PREFS_PAR_DEFAUT();
  try {
    const brut = JSON.parse(stockage.getItem(CLE_PREFS_OPTIMISEUR) ?? "null") as Partial<PrefsOptimiseur> | null;
    if (!brut || typeof brut !== "object") return d;
    const cibles: PrefsOptimiseur["cibles"] = {};
    for (const k of STATS) { const v = (brut.cibles as Record<string, unknown> | undefined)?.[k]; if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 400) cibles[k] = Math.round(v); }
    return { cibles, energieLibre: typeof brut.energieLibre === "number" && brut.energieLibre >= 0 && brut.energieLibre <= 11 ? Math.round(brut.energieLibre) : d.energieLibre, exotique: brut.exotique === "aucune" ? "aucune" : "choix", prismatique: typeof brut.prismatique === "boolean" ? brut.prismatique : null };
  } catch { return d; }
}
export function ecrirePrefsOptimiseur(stockage: Pick<Stockage, "setItem">, p: PrefsOptimiseur): boolean {
  try { stockage.setItem(CLE_PREFS_OPTIMISEUR, JSON.stringify(p)); return true; } catch { return false; }
}
