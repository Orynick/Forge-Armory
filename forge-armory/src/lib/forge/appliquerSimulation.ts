// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - APPLIQUE la simulation de la Forge à un build, pour le SCORE et l'affichage de Mon Build (spécification du 12/10/2026 : « le scoring doit recevoir la perk sélectionnée comme perk active » ; « le build calculé par le moteur de scoring utilise la sélection simulée »). Le moteur de score n'est PAS modifié : il lit déjà `perkHashes` de chaque pièce (verbes de « Effets du Build »,
// `extraireTextesEffetsBuild`) ; on lui donne des pièces dont `perkHashes` tient compte de la simulation.
// RÈGLES : (1) seules les ARMES POSSÉDÉES (avec `itemInstanceId`) qui ont une simulation enregistrée sont touchées ; la simulation est cherchée par exemplaire, donc deux exemplaires de la même arme restent indépendants ; (2) la pièce d'origine n'est JAMAIS modifiée : on rend une COPIE (le build enregistré, partagé ou équipé en jeu reste celui des perks RÉELS) ;
// (3) pour chaque colonne simulée, le perk à COMPTER (`effectif`, version améliorée comprise) remplace celui de la colonne, ou s'ajoute si la colonne n'avait pas de perk connu ; les autres colonnes sont inchangées ; (4) rien à appliquer = le MÊME objet est rendu (les calculs mémorisés ne sont pas relancés pour rien) ; (5) l'armure n'est jamais touchée.
// Ne recalcule pas les STATISTIQUES de l'arme (stabilité, etc.) : le score n'utilise pas celles des armes. EN: ⚠️ ADDED - applies the Forge simulation to a build for scoring/display: copies only, owned weapons only, same object when nothing to apply.
import type { BuildDraft, GearPiece } from "../../types/build";
import type { SimulationArme, Simulations } from "./simulation";

export function appliquerSimulationPiece(piece: GearPiece, simulation: SimulationArme | undefined): GearPiece {
  if (!simulation || !piece.itemInstanceId) return piece;
  const colonnes = Object.entries(simulation);
  if (colonnes.length === 0) return piece;
  const parColonne = new Map<number, number>((piece.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
  for (const [index, choix] of colonnes) parColonne.set(Number(index), choix.effectif);
  const perksParColonne = [...parColonne.entries()].sort((a, b) => a[0] - b[0]).map(([socketIndex, hash]) => ({ socketIndex, hash }));
  return { ...piece, perksParColonne, perkHashes: perksParColonne.map((p) => p.hash), perksSimules: true, perkHashesReels: piece.perkHashes, perksParColonneReels: piece.perksParColonne, nbColonnesSimulees: colonnes.length };
}

/**
 * FR : la pièce RÉELLE d'une copie « avec simulation » : les perks réels sont remis et les repères de simulation retirés. Sert quand on envoie une arme de Mon Build vers la Forge : la Forge doit partir du roll RÉEL (✓), pas du roll simulé. Une pièce sans simulation est rendue telle quelle.
 * EN: the REAL piece of a simulated copy (real perks restored, simulation markers removed).
 */
export function pieceReelle(piece: GearPiece): GearPiece {
  if (!piece.perksSimules) return piece;
  const { perksSimules, perkHashesReels, perksParColonneReels, nbColonnesSimulees, ...reste } = piece;
  void perksSimules; void nbColonnesSimulees;
  return { ...reste, perkHashes: perkHashesReels ?? piece.perkHashes, ...(perksParColonneReels ? { perksParColonne: perksParColonneReels } : {}) };
}

/** FR : le build avec la simulation appliquée à ses ARMES ; le même objet si aucune arme n'est simulée. / EN: the build with the simulation applied to its weapons; the same object if none is simulated. */
export function appliquerSimulations(build: BuildDraft, simulations: Simulations): BuildDraft {
  let change = false;
  const armes = build.armes.map((a) => {
    const copie = appliquerSimulationPiece(a, a.itemInstanceId ? simulations.armes[a.itemInstanceId] : undefined);
    if (copie !== a) change = true;
    return copie;
  });
  return change ? { ...build, armes } : build;
}

/** FR : combien d'armes du build portent des perks simulés. / EN: how many weapons of the build carry simulated perks. */
export const nbArmesSimulees = (build: BuildDraft): number => build.armes.filter((a) => a.perksSimules).length;
