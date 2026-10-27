// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - APPLIQUE la simulation de la Forge à un build, pour le SCORE et l'affichage de Mon Build (spécification du 12/10/2026 : « le scoring doit recevoir la perk sélectionnée comme perk active » ; « le build calculé par le moteur de scoring utilise la sélection simulée »). Le moteur de score n'est PAS modifié : il lit déjà `perkHashes` de chaque pièce (verbes de « Effets du Build »,
// `extraireTextesEffetsBuild`) ; on lui donne des pièces dont `perkHashes` tient compte de la simulation.
// RÈGLES : (1) seules les ARMES POSSÉDÉES (avec `itemInstanceId`) qui ont une simulation enregistrée sont touchées ; la simulation est cherchée par exemplaire, donc deux exemplaires de la même arme restent indépendants ; (2) la pièce d'origine n'est JAMAIS modifiée : on rend une COPIE (le build enregistré, partagé ou équipé en jeu reste celui des perks RÉELS) ;
// (3) pour chaque colonne simulée, le perk à COMPTER (`effectif`, version améliorée comprise) remplace celui de la colonne, ou s'ajoute si la colonne n'avait pas de perk connu ; les autres colonnes sont inchangées ; (4) rien à appliquer = le MÊME objet est rendu (les calculs mémorisés ne sont pas relancés pour rien) ; (5) l'armure n'est jamais touchée.
// Ne recalcule pas les STATISTIQUES de l'arme (stabilité, etc.) : le score n'utilise pas celles des armes.
// ⚠️ AJOUT (branche draft-mod-armures) - ARMURES : `appliquerSimulationArmure` applique la simulation des MODS d'une armure possédée : la copie porte les mods simulés (`perkHashes`/`perksParColonne` lus par le Pilier 2) ET ses STATISTIQUES recalculées (`stats` lus par le pilier stats_2_0 via `sommerStatsArmure`) : le changement de mod se voit dans le score. Mêmes règles : copie uniquement, exemplaire avec `itemInstanceId` seulement, même objet si rien à faire. Les statistiques réelles sont mémorisées (`statsReelles`) pour l'affichage. Le calcul de `statsSimulees` a besoin du Manifest (`db`) : sans Manifest, la simulation de perk est appliquée mais les stats ne sont PAS recalculées (elles restent réelles) — l'affichage le dira.
// EN: ⚠️ ADDED - ARMOR: `appliquerSimulationArmure` applies an owned armor's MOD simulation: the copy carries the simulated mods (read by Pillar 2) AND its recomputed STATS (read by the stats pillar): a mod change shows in the score. Same rules: copy only, owned instance only, same object when nothing to apply.
import type { Database } from "sql.js";
<<<<<<< Updated upstream
import type { BuildDraft, GearPiece } from "../../types/build";
import type { SimulationArme, Simulations } from "./simulation";
import { statsSimulees } from "./armure";
=======
import type { BuildDraft, GearPiece, StatKey } from "../../types/build";
import type { SimulationArme, Simulations } from "./simulation";
import { colonnesArmure, statsSimulees } from "./armure";
import { energieSimulee } from "./energieMods";   // ⚠️ AJOUT (27/10/2026) : budget d'énergie
>>>>>>> Stashed changes

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
  // FR : ⚠️ AJOUT (27/10/2026) - une ARMURE simulée (ou dont la simulation est rejetée) revient à ses mods et à ses statistiques RÉELS, repères retirés : « Envoyer à la Forge » depuis Mon Build ne doit jamais envoyer l'armure SIMULÉE. / EN: ⚠️ ADDED - a simulated (or rejected) armor piece goes back to its real mods and stats.
  if (piece.modsSimules || piece.simulationRejetee) {
    const { modsSimules, simulationRejetee, energieDepassee, nbModsSimules, statsReelles, perkHashesReels, perksParColonneReels, ...reste } = piece;
    void modsSimules; void simulationRejetee; void energieDepassee; void nbModsSimules;
    return { ...reste, ...(statsReelles ? { stats: statsReelles } : {}), perkHashes: perkHashesReels ?? piece.perkHashes, ...(perksParColonneReels ? { perksParColonne: perksParColonneReels } : {}) };
  }
  if (!piece.perksSimules) return piece;
  const { perksSimules, perkHashesReels, perksParColonneReels, nbColonnesSimulees, ...reste } = piece;
  void perksSimules; void nbColonnesSimulees;
  return { ...reste, perkHashes: perkHashesReels ?? piece.perkHashes, ...(perksParColonneReels ? { perksParColonne: perksParColonneReels } : {}) };
}

/**
 * FR : ⚠️ AJOUT (branche draft-mod-armures) - applique la simulation des MODS d'une armure possédée. Règles : (1) seule une armure AVEC `itemInstanceId` et une simulation enregistrée dans le bloc `armures` est touchée ; (2) la pièce d'origine n'est JAMAIS modifiée (copie) ; (3) `perkHashes`/`perksParColonne` de la copie = les mods simulés à la place des modifiés (mêmes règles que les armes : remplacement par colonne, ajout si la colonne n'avait pas de mod connu) ; (4) `stats` de la copie = les statistiques recalculées par `statsSimulees` (le delta des `investmentStats` des mods simulés) — a besoin du Manifest, passé en `db` ; sans `db`, les stats restent RÉELLES (la simulation de perks est appliquée, le pilier stats ne bouge pas) ; (5) les stats réelles sont mémorisées dans `statsReelles`.
 * EN: applies an owned armor's mod simulation: copy only, simulated mods in `perkHashes`/`perksParColonne`, recomputed `stats` (needs the Manifest `db`; without it stats stay real), real stats kept in `statsReelles`.
 */
export function appliquerSimulationArmure(piece: GearPiece, simulation: SimulationArme | undefined, db: Database | null): GearPiece {
  if (!simulation || !piece.itemInstanceId) return piece;
<<<<<<< Updated upstream
  const colonnes = Object.entries(simulation);
  if (colonnes.length === 0) return piece;
  if (!piece.perksParColonne) return piece;
=======
  if (!piece.perksParColonne) return piece;
  // FR : ⚠️ CHANGÉ (27/10/2026) - une entrée de simulation ÉGALE au mod équipé n'est PAS une simulation (aucun écart avec la pièce réelle) : elle ne fait ni « simulé », ni badge, ni calcul inutile. L'interface ne les enregistre jamais, mais un magasin ancien ou modifié à la main peut en contenir. / EN: ⚠️ CHANGED - a simulation entry equal to the equipped mod is not a simulation.
  const equipes = new Map<number, number>(piece.perksParColonne.map((p) => [p.socketIndex, p.hash]));
  const colonnes = Object.entries(simulation).filter(([index, choix]) => equipes.get(Number(index)) !== choix.effectif);
  if (colonnes.length === 0) return piece;
  // FR : ⚠️ AJOUT (27/10/2026) - GARDE-FOU DE L'ÉNERGIE : une simulation qui dépasse l'énergie de la pièce (capacité lue sur l'exemplaire) n'est pas réalisable en jeu : le score l'IGNORE (la pièce reste réelle, marquée `simulationRejetee`). La fenêtre de simulation l'empêche, mais une simulation enregistrée avant le budget, ou une capacité qui change au rechargement, peut encore la contenir. Énergie non lue : on ne peut rien vérifier, la simulation s'applique comme avant. / EN: ⚠️ ADDED - ENERGY GUARD: a simulation above the piece's energy is ignored by the score.
  if (db) {
    const e = energieSimulee(db, piece, colonnesArmure(db, piece), simulation);
    if (e && e.restante < 0) return { ...piece, simulationRejetee: true, energieDepassee: -e.restante, nbModsSimules: colonnes.length };
  }
>>>>>>> Stashed changes
  const parColonne = new Map<number, number>((piece.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
  for (const [index, choix] of colonnes) parColonne.set(Number(index), choix.effectif);
  const perksParColonne = [...parColonne.entries()].sort((a, b) => a[0] - b[0]).map(([socketIndex, hash]) => ({ socketIndex, hash }));
  const stats = db ? statsSimulees(db, piece, simulation) : null;
  return {
    ...piece,
    perksParColonne,
    perkHashes: perksParColonne.map((p) => p.hash),
    modsSimules: true,
<<<<<<< Updated upstream
=======
    // FR : ⚠️ AJOUT (27/10/2026) - les mods RÉELS sont mémorisés, comme pour une arme (`perkHashesReels`, `perksParColonneReels`) : sans eux, la fenêtre Détails de Mon Build prenait les mods SIMULÉS pour les mods équipés (le delta tombait à zéro, « revenir au réel » ne ramenait rien) et « Envoyer à la Forge » aurait envoyé l'armure SIMULÉE. / EN: ⚠️ ADDED - the REAL mods are remembered, as for weapons.
    perkHashesReels: piece.perkHashes,
    perksParColonneReels: piece.perksParColonne,
>>>>>>> Stashed changes
    statsReelles: piece.stats,
    nbModsSimules: colonnes.length,
    ...(stats && stats.nbChangements > 0 ? { stats: { ...stats.simulees } } : {}),
  };
}

/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - le build avec la simulation appliquée à ses ARMES et à ses ARMURES ; le même objet si rien n'est simulé. `db` sert au recalcul des statistiques des armures simulées (Manifest ; sans lui, seules les perks des armures sont remplacées). / EN: the build with the simulation applied to its weapons AND armor; the same object if none is simulated. */
export function appliquerSimulations(build: BuildDraft, simulations: Simulations, db: Database | null = null): BuildDraft {
  let change = false;
  const armes = build.armes.map((a) => {
    const copie = appliquerSimulationPiece(a, a.itemInstanceId ? simulations.armes[a.itemInstanceId] : undefined);
    if (copie !== a) change = true;
    return copie;
  });
  // ⚠️ AJOUT (branche draft-mod-armures) - seule une armure RÉELLEMENT simulée (copie) force la copie du tableau : sinon le tableau d'origine est réutilisé tel quel (mêmes objets, pas de recopie inutile).
  let armure = build.armure;
  for (let i = 0; i < build.armure.length; i++) {
    const a = build.armure[i];
    const copie = appliquerSimulationArmure(a, a.itemInstanceId ? simulations.armures?.[a.itemInstanceId] : undefined, db);
    if (copie === a) continue;
    if (armure === build.armure) armure = [...build.armure];
    armure[i] = copie;
    change = true;
  }
  return change ? { ...build, armes, armure } : build;
}

/** FR : combien d'armes du build portent des perks simulés. / EN: how many weapons of the build carry simulated perks. */
export const nbArmesSimulees = (build: BuildDraft): number => build.armes.filter((a) => a.perksSimules).length;
/** FR : ⚠️ AJOUT (branche draft-mod-armures) - combien d'armures du build portent des mods simulés. / EN: how many armor pieces of the build carry simulated mods. */
export const nbArmuresSimulees = (build: BuildDraft): number => build.armure.filter((a) => a.modsSimules).length;
<<<<<<< Updated upstream
=======
/** FR : ⚠️ AJOUT (27/10/2026) - combien d'armures du build ont une simulation IGNORÉE par le score parce qu'elle dépasse l'énergie. / EN: how many armor pieces have a simulation ignored because it exceeds the energy. */
export const nbArmuresRejetees = (build: BuildDraft): number => build.armure.filter((a) => a.simulationRejetee).length;
/** FR : ⚠️ AJOUT (27/10/2026) - le DELTA des statistiques TOTALES des armures dû à la simulation (somme, par statistique, de `stats` − `statsReelles` sur les armures simulées). Vide quand rien n'est simulé. Les bonus de la doctrine, identiques avec ou sans simulation, s'annulent : on ne les ajoute pas ici. / EN: ⚠️ ADDED - the armor stat totals delta caused by the simulation. */
export function deltaStatsArmure(armure: GearPiece[]): Partial<Record<StatKey, number>> {
  const delta: Partial<Record<StatKey, number>> = {};
  for (const p of armure) {
    if (!p.modsSimules || !p.statsReelles) continue;
    for (const cle of new Set([...Object.keys(p.stats), ...Object.keys(p.statsReelles)]) as Set<StatKey>) {
      const d = (p.stats[cle] ?? 0) - (p.statsReelles[cle] ?? 0);
      if (d !== 0) delta[cle] = (delta[cle] ?? 0) + d;
    }
  }
  return delta;
}
>>>>>>> Stashed changes
