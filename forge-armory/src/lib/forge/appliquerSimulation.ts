// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - APPLIQUE la simulation de la Forge à un build, pour le SCORE et l'affichage de Mon Build (spécification du 12/10/2026 : « le scoring doit recevoir la perk sélectionnée comme perk active » ; « le build calculé par le moteur de scoring utilise la sélection simulée »). Le moteur de score n'est PAS modifié : il lit déjà `perkHashes` de chaque pièce (verbes de « Effets du Build »,
// `extraireTextesEffetsBuild`) ; on lui donne des pièces dont `perkHashes` tient compte de la simulation.
// RÈGLES : (1) seules les ARMES POSSÉDÉES (avec `itemInstanceId`) qui ont une simulation enregistrée sont touchées ; la simulation est cherchée par exemplaire, donc deux exemplaires de la même arme restent indépendants ; (2) la pièce d'origine n'est JAMAIS modifiée : on rend une COPIE (le build enregistré, partagé ou équipé en jeu reste celui des perks RÉELS) ;
// (3) pour chaque colonne simulée, le perk à COMPTER (`effectif`, version améliorée comprise) remplace celui de la colonne, ou s'ajoute si la colonne n'avait pas de perk connu ; les autres colonnes sont inchangées ; (4) rien à appliquer = le MÊME objet est rendu (les calculs mémorisés ne sont pas relancés pour rien) ; (5) l'armure n'est jamais touchée.
// Ne recalcule pas les STATISTIQUES de l'arme (stabilité, etc.) : le score n'utilise pas celles des armes. EN: ⚠️ ADDED - applies the Forge simulation to a build for scoring/display: copies only, owned weapons only, same object when nothing to apply.
import type { BuildDraft, GearPiece } from "../../types/build";
import type { SimulationArme, Simulations } from "./simulation";
import { statsSimulees } from "./armure";   // ⚠️ AJOUT (19/10/2026, §2.1) : le recalcul exact des stats d'une armure simulée

export function appliquerSimulationPiece(piece: GearPiece, simulation: SimulationArme | undefined): GearPiece {
  if (!simulation || !piece.itemInstanceId) return piece;
  const colonnes = Object.entries(simulation);
  if (colonnes.length === 0) return piece;
  // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - une pièce SANS `perksParColonne` (par exemple un build enregistré avant la lecture des colonnes) ne permet pas de remplacer un perk « à la bonne place » : la reconstruire à partir de ses seules colonnes simulées FERAIT PERDRE tous ses perks réels au score (défaut trouvé en écrivant les tests de l'icône). La simulation ne s'applique donc PAS à cette pièce : elle est rendue telle quelle ; « Mettre dans Mon Build » depuis la Forge la remplace par la pièce de l'inventaire, qui a ses colonnes. / EN: ⚠️ ADDED - a piece without column data cannot be overlaid: returned unchanged (rebuilding it from the simulated columns alone would drop all its real perks).
  if (!piece.perksParColonne) return piece;
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
  // FR : ⚠️ AJOUT (19/10/2026, §2.1) - une ARMURE simulée (badge « simulé ») retrouve ses stats RÉELLES et perd ses repères : la Forge part des mods réels (✓), jamais des simulés. / EN: a simulated ARMOR gets its real stats back.
  if (!piece.perksSimules && piece.statsSimulees) {
    const { statsSimulees: _s, statsReelles, nbModsSimules: _n, ...reste } = piece;
    void _s; void _n;
    return { ...reste, stats: statsReelles ?? piece.stats };
  }
  if (!piece.perksSimules) return piece;
  const { perksSimules, perkHashesReels, perksParColonneReels, nbColonnesSimulees, ...reste } = piece;
  void perksSimules; void nbColonnesSimulees;
  return { ...reste, perkHashes: perkHashesReels ?? piece.perkHashes, ...(perksParColonneReels ? { perksParColonne: perksParColonneReels } : {}) };
}

/**
 * FR : ⚠️ AJOUT (19/10/2026, chantier « lien armure → score », §2.1 de la feuille de route) - APPLIQUE la simulation des MODS d'une ARMURE à une copie de la pièce : les six STATISTIQUES sont recalculées (le delta exact de `statsSimulees` de lib/forge/armure.ts : la différence des investmentStats du nouveau plug et de l'ancien, sur les colonnes modifiables), les repères de simulation posés (`statsSimulees`, `statsReelles`, `nbModsSimules`).
 * MÊMES RÈGLES que les armes : (1) seule une armure POSSÉDÉE (itemInstanceId) avec une simulation enregistrée est touchée ; (2) l'originale n'est JAMAIS modifié (le build enregistré, partagé ou équipé garde ses stats réelles) ; (3) rien à appliquer = le MÊME objet (pas de recalcul pour rien).
 * Le `db` est requis : les stats des plugs viennent du Manifest (l'identifiant de la pièce ne suffit pas — les investmentStats se lisent dans les définitions).
 * EN: ⚠️ ADDED - applies an armor piece's simulated mods to a COPY: the six stats are recomputed (exact delta), simulation markers are set, the original is never modified.
 */
export function appliquerSimulationArmure(db: import("sql.js").Database, piece: GearPiece, simulation: SimulationArme | undefined): GearPiece {
  if (!simulation || !piece.itemInstanceId) return piece;
  const colonnes = Object.entries(simulation);
  if (colonnes.length === 0) return piece;
  // FR : le recalcul exact vient de statsSimulees (lib/forge/armure.ts) — la fonction TESTÉE de la Forge, jamais une duplication du calcul.
  const { simulees } = statsSimulees(db, piece, Object.fromEntries(colonnes.map(([index, choix]) => [Number(index), choix])));
  const pieceSimulee: GearPiece = { ...piece, stats: simulees, statsSimulees: true, statsReelles: piece.stats, nbModsSimules: colonnes.length };
  return pieceSimulee;
}

/** FR : ⚠️ CHANGÉ (19/10/2026, §2.1) - le build avec la simulation appliquée à ses ARMES ET À SES ARMURES ; le même objet si rien n'est simulé. L'ARMURE a besoin du `db` (les stats des plugs se lisent dans le Manifest) : quand il est absent (pas de Manifest chargé), les armures ne sont PAS simulées — le score reste celui des armes, jamais une erreur. / EN: the build with the simulation applied to its weapons AND armor; the same object if nothing is simulated. Armor needs the db (plug stats are read from the Manifest): without it, armor is not simulated — never an error.
 */
export function appliquerSimulations(build: BuildDraft, simulations: Simulations, db?: import("sql.js").Database | null): BuildDraft {
  // FR : ⚠️ CORRIGÉ (20/10/2026) - le tableau des armes n'est reconstruit QUE si une arme CHANGE : une simulation posée sur une ARMURE seule ne doit pas créer un tableau d'armes neuf (l'identité d'objet des pièces non simulées est le contrat des calculs mémorisés). / EN: the weapons array is rebuilt only when a weapon changes.
  let change = false;
  let armes = build.armes;
  if (build.armes.some((a) => a.itemInstanceId && simulations.armes[a.itemInstanceId] && Object.keys(simulations.armes[a.itemInstanceId]).length > 0)) {
    armes = build.armes.map((a) => {
      const copie = appliquerSimulationPiece(a, a.itemInstanceId ? simulations.armes[a.itemInstanceId] : undefined);
      if (copie !== a) change = true;
      return copie;
    });
  }
  // FR : ⚠️ AJOUT (19/10/2026, §2.1) - les ARMURES du build, sur le MÊME magasin (identifiant d'exemplaire + index de prise) : le score réagit aux mods simulés.
  const armure = db ? build.armure.map((p) => {
    const copie = appliquerSimulationArmure(db, p, p.itemInstanceId ? simulations.armes[p.itemInstanceId] : undefined);
    if (copie !== p) change = true;
    return copie;
  }) : build.armure;
  return change ? { ...build, armes, armure } : build;
}

/** FR : combien d'armes du build portent des perks simulés. / EN: how many weapons of the build carry simulated perks. */
export const nbArmesSimulees = (build: BuildDraft): number => build.armes.filter((a) => a.perksSimules).length;
