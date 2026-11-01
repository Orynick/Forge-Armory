// FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures), OPTIMISEUR de statistiques d'armure, ÉTAPE 2 (moteur de calcul), couche 2 : du « monde réel » au solveur pur (`optimiseur.ts`). Pour chaque ARMURE possédée : toutes les combinaisons de MOD DE STATISTIQUE (équipé, vide, ou l'un des mods de statistique standard) × AJUSTEMENT (équipé, vide, équilibré, ou l'un des directionnels permis : sur une légendaire son « + » est fixe, sur une exotique il est libre) qui TIENNENT DANS L'ÉNERGIE de la pièce (moins la réserve demandée), avec les statistiques TOTALES de chaque combinaison calculées par `statsSimulees` (EXACTEMENT les calculs des fenêtres de simulation : le résultat de l'optimiseur peut se rejouer tel quel dans la simulation). Les autres mods (cumulables, raid…) restent comme équipés.
// RÈGLES (utilisateur) : classe du personnage ; l'objet de classe EXOTIQUE n'est permis que si une doctrine PRISMATIQUE est équipée, et compte comme une armure exotique (une seule en tout : règle du solveur) ; énergie à garder libre réglable (0 par défaut) ; pièces verrouillées par emplacement et pièces exclues.
// EN: ⚠️ ADDED - armor-stat optimizer, step 2, layer 2: per-piece option generation (stat mod × tuning within the energy budget, stats computed by `statsSimulees`, same as the simulation windows), candidate selection (class, Prismatic requirement for exotic class items, locks, exclusions) and the full solve.
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../../types/build";
import { colonnesArmure, statsSimulees, type ColonneArmure } from "./armure";
import { energieSimulee, modeleSimulation } from "./energieMods";
import type { ChoixColonne } from "./simulation";
import { resoudre, manqueDe, STATS_ORDRE, SLOTS_ARMURE, type Bloc, type CandidatAbstrait, type OptionAbstraite, type ParametresSolveur } from "./optimiseur";

export interface OptionPiece extends OptionAbstraite {
  /** FR : les changements à rejouer dans la simulation (un par emplacement modifié ; vide = la pièce telle qu'équipée). */
  choix: Record<number, ChoixColonne>;
  /** FR : énergie restante dans la pièce avec cette combinaison ; `null` si l'énergie de l'exemplaire n'est pas lue (aucune limite). */
  energieRestante: number | null;
  /** FR : noms du mod de statistique et de l'ajustement de cette combinaison (pour l'affichage). */
  statistique: string;
  ajustement: string;
  /** FR : ⚠️ AJOUT (29/10/2026, écran de l'optimiseur) - ce qui est ÉQUIPÉ aujourd'hui, et si cette combinaison le CHANGE (le tableau de l'écran montre « avant : … » en bleu). */
  statistiqueAvant: string;
  ajustementAvant: string;
  statistiqueChange: boolean;
  ajustementChange: boolean;
}
export interface CandidatPiece extends CandidatAbstrait { piece: GearPiece; options: OptionPiece[] }
export interface PieceEcartee { piece: GearPiece; raison: string }

interface ChoixPlug { hash: number; nom: string }
const sixStatsLues = (p: GearPiece) => STATS_ORDRE.every((k) => typeof p.stats?.[k] === "number");
const versBloc = (s: Partial<Record<StatKey, number>>): Bloc => ({ sante: s.sante ?? 0, melee: s.melee ?? 0, grenade: s.grenade ?? 0, super: s.super ?? 0, classe: s.classe ?? 0, arme: s.arme ?? 0 });

/** FR : toutes les combinaisons possibles d'UNE pièce. / EN: every possible combination for ONE piece. */
export function optionsDePiece(db: Database, piece: GearPiece, params: { energieLibre?: number } = {}): OptionPiece[] {
  const reserve = params.energieLibre ?? 0;
  const colonnes = colonnesArmure(db, piece);
  const m = modeleSimulation(db, piece, colonnes);
  const unique = (l: ChoixPlug[]) => { const vus = new Set<number>(); return l.filter((c) => (vus.has(c.hash) ? false : (vus.add(c.hash), true))); };
  const statCol: ColonneArmure | null = m.statistique?.colonne ?? null, ajCol: ColonneArmure | null = m.ajustement?.colonne ?? null;
  const statChoix: ChoixPlug[] = statCol && m.statistique
    ? unique([{ hash: statCol.equipe.hash, nom: statCol.equipe.nom }, ...(m.statistique.vide ? [{ hash: m.statistique.vide.hash, nom: m.statistique.vide.nom }] : []), ...m.statistique.options.map((o) => ({ hash: o.plug.hash, nom: o.plug.nom }))])
    : [{ hash: 0, nom: "—" }];
  const ajChoix: ChoixPlug[] = ajCol && m.ajustement
    ? unique([{ hash: ajCol.equipe.hash, nom: ajCol.equipe.nom }, ...(m.ajustement.vide ? [{ hash: m.ajustement.vide.hash, nom: m.ajustement.vide.nom }] : []), ...(m.ajustement.equilibre ? [{ hash: m.ajustement.equilibre.hash, nom: m.ajustement.equilibre.nom }] : []), ...m.ajustement.directionnels.map((o) => ({ hash: o.plug.hash, nom: o.plug.nom }))])
    : [{ hash: 0, nom: "—" }];
  const sortie: OptionPiece[] = [];
  for (const sc of statChoix) for (const ac of ajChoix) {
    const choix: Record<number, ChoixColonne> = {};
    if (statCol && sc.hash !== statCol.equipe.hash) choix[statCol.socketIndex] = { choisi: sc.hash, effectif: sc.hash };
    if (ajCol && ac.hash !== ajCol.equipe.hash) choix[ajCol.socketIndex] = { choisi: ac.hash, effectif: ac.hash };
    const en = energieSimulee(db, piece, colonnes, choix);
    if (en && en.restante < reserve) continue;
    sortie.push({ stats: versBloc(statsSimulees(db, piece, choix).simulees), modifs: Object.keys(choix).length, choix, energieRestante: en ? en.restante : null, statistique: sc.nom, ajustement: ac.nom, statistiqueAvant: statCol ? statCol.equipe.nom : "—", ajustementAvant: ajCol ? ajCol.equipe.nom : "—", statistiqueChange: !!statCol && statCol.socketIndex in choix, ajustementChange: !!ajCol && ajCol.socketIndex in choix });
  }
  return sortie;
}

export interface ParametresSelection {
  /** FR : la classe du personnage (« titan », « chasseur », « arcaniste »). */
  classe: string;
  /** FR : une doctrine PRISMATIQUE est-elle équipée ? Sinon, les objets de classe exotiques sont exclus. */
  prismatique: boolean;
  energieLibre?: number;
  /** FR : emplacement → itemInstanceId de la pièce imposée (les autres pièces de cet emplacement sont ignorées). */
  verrous?: Partial<Record<string, string>>;
  /** FR : itemInstanceId à ne jamais utiliser. */
  exclues?: readonly string[];
}

/** FR : les pièces utilisables, avec leurs options ; les autres sont rendues avec la RAISON de leur exclusion (jamais écartées en silence). / EN: usable pieces with their options; the others come back with the reason. */
export function candidatsDepuisPieces(db: Database, pieces: readonly GearPiece[], s: ParametresSelection): { candidats: CandidatPiece[]; ecartees: PieceEcartee[] } {
  const candidats: CandidatPiece[] = [], ecartees: PieceEcartee[] = [];
  for (const piece of pieces) {
    if (!(SLOTS_ARMURE as readonly string[]).includes(piece.slot) || piece.classeRequise !== s.classe) continue;
    const id = piece.itemInstanceId;
    if (!id) { ecartees.push({ piece, raison: "exemplaire sans identifiant" }); continue; }
    if (s.exclues?.includes(id)) continue;
    const verrou = s.verrous?.[piece.slot];
    if (verrou && verrou !== id) continue;
    if (piece.slot === "marque" && piece.isExotic && !s.prismatique) { ecartees.push({ piece, raison: "objet de classe exotique : exige une doctrine prismatique équipée" }); continue; }
    if (!sixStatsLues(piece)) { ecartees.push({ piece, raison: "statistiques incomplètes (non lues)" }); continue; }
    const options = optionsDePiece(db, piece, { energieLibre: s.energieLibre });
    if (options.length === 0) { ecartees.push({ piece, raison: "aucune combinaison ne tient dans l'énergie demandée" }); continue; }
    candidats.push({ id, slot: piece.slot, exotique: piece.isExotic === true, options, piece });
  }
  return { candidats, ecartees };
}

/** FR : ⚠️ CHANGÉ (29/10/2026, demande de l'utilisateur : « on peut mettre la limite à 10 secondes ? ») - budget de temps (ms) de la passe COMPLÈTE du calcul : au-delà, on garde la meilleure solution trouvée et l'écran dit « résultat approché ». Avant : 5 secondes dans l'écran, 6 par défaut. Source UNIQUE : l'écran et la valeur par défaut l'utilisent. / EN: ⚠️ CHANGED - single source of the calculation time budget: 10 seconds. */
export const DELAI_CALCUL_MS = 10000;

export interface ParametresOptimisation extends ParametresSelection {
  cibles: Partial<Bloc>;
  poids?: Partial<Bloc>;
  bonus?: Partial<Bloc>;
  nbSolutions?: number;
  /** FR : budget de temps de la passe complète (ms), `DELAI_CALCUL_MS` (10 secondes) par défaut ; l'arrêt anticipé quand les cibles sont atteintes est ACTIVÉ par défaut. */
  delaiMs?: number;
}
export interface SolutionPieces {
  pieces: Array<{ piece: GearPiece; option: OptionPiece }>;
  totaux: Bloc;
  manque: number;
  manquePondere: number;
  /** FR : le manque de chaque statistique ciblée (0 = atteinte). */
  manqueParStat: Partial<Bloc>;
  modifs: number;
  exotiques: number;
}
export interface ResultatOptimisation { solutions: SolutionPieces[]; exact: boolean; slotsManquants: string[]; ecartees: PieceEcartee[]; nbCandidats: number }

/** FR : l'optimisation complète : sélection, options, solveur. / EN: the full optimization. */
export function optimiserArmures(db: Database, pieces: readonly GearPiece[], p: ParametresOptimisation): ResultatOptimisation {
  const { candidats, ecartees } = candidatsDepuisPieces(db, pieces, p);
  const params: ParametresSolveur = { cibles: p.cibles, poids: p.poids, bonus: p.bonus, nbSolutions: p.nbSolutions ?? 3, delaiMs: p.delaiMs ?? DELAI_CALCUL_MS, arreterSiCiblesAtteintes: true };
  const r = resoudre(candidats, params);
  const solutions: SolutionPieces[] = r.solutions.map((s) => {
    const choisies = s.choix.map((c) => { const cand = candidats.find((x) => x.id === c.idCandidat) as CandidatPiece; return { piece: cand.piece, option: cand.options[c.indexOption] }; });
    const manqueParStat: Partial<Bloc> = {};
    for (const k of STATS_ORDRE) if (p.cibles[k] !== undefined) manqueParStat[k] = Math.max(0, (p.cibles[k] as number) - (s.totaux[k] + (p.bonus?.[k] ?? 0)));
    return { pieces: choisies, totaux: s.totaux, manque: s.manque, manquePondere: s.manquePondere, manqueParStat, modifs: s.modifs, exotiques: s.exotiques };
  });
  return { solutions, exact: r.exact, slotsManquants: r.slotsManquants, ecartees, nbCandidats: candidats.length };
}

/** FR : le manque d'un équipement donné (par exemple l'équipement actuel), pour comparer avec les solutions. / EN: the shortfall of a given equipment. */
export function manqueDeLEquipement(pieces: readonly GearPiece[], p: Pick<ParametresOptimisation, "cibles" | "poids" | "bonus">): { totaux: Bloc; manque: number; manquePondere: number } {
  const totaux: Bloc = { sante: 0, melee: 0, grenade: 0, super: 0, classe: 0, arme: 0 };
  for (const piece of pieces) for (const k of STATS_ORDRE) totaux[k] += piece.stats?.[k] ?? 0;
  return { totaux, ...manqueDe(totaux, p.cibles, p.poids, p.bonus) };
}
