// FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures), demande de l'utilisateur : « La maquette me plait beaucoup ! » (maquette validée de la simulation des mods d'armure avec BUDGET D'ÉNERGIE). LOGIQUE PURE (pas de React) de la simulation : elle classe les emplacements d'une armure (statistique, ajustement, cumulables, autres), choisit la VERSION STANDARD des mods en double, calcule l'ÉNERGIE simulée (capacité de la pièce, énergie utilisée), construit le modèle de chaque bloc de la maquette et répartit les mods CUMULABLES sur les trois emplacements.
// ⚠️ Règles établies sur les données RÉELLES de l'utilisateur (diagnostics du 25/10/2026, 440 armures) : (1) l'énergie utilisée annoncée par le jeu = la somme des coûts des mods équipés, un plug SANS coût comptant 0 ; (2) la capacité d'énergie se lit sur la PIÈCE (11 aux paliers 4 et 5, 10 aux paliers 2 et 3, 1 à 10 pour d'anciens exotiques) : jamais une constante ; (3) 107 noms de mods existent en DEUX versions (la standard est la seule jamais équipée à prix réduit : l'autre exige une option d'artéfact saisonnier et, pour les mods de statistique, n'a AUCUN bonus) : on ne propose que la version standard ; (4) un seul mod de statistique, un seul ajustement, trois emplacements CUMULABLES (le même mod plusieurs fois) ; (5) sur une pièce légendaire le « + » de l'ajustement est propre à la pièce (tiré au hasard parmi les six statistiques) et seul le « − » se choisit ; une pièce exotique propose toutes les combinaisons.
// EN: ⚠️ ADDED - PURE logic of the armor-mod simulation with an ENERGY BUDGET: slot roles, standard version of duplicated mods, simulated energy, per-block models and distribution of the stackable mods over the three slots.
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../../types/build";
import { obtenirDefinition } from "../manifest/download";
import { normaliser } from "../manifest/search";
import { lireCoutEnergie } from "./diagnosticEnergie";
import type { ColonneArmure, PlugArmure } from "./armure";
import { infoAjustement, nonIntrinsequesDePiece, statDePlus } from "./ajustement";   // ⚠️ AJOUT (26/10/2026)
import { choisir, retirerColonne, type ChoixColonne, type Simulations } from "./simulation";

export type RoleColonne = "statistique" | "ajustement" | "cumulable" | "autre";
export interface Changement { socketIndex: number; plugHash: number }

const RE_STATISTIQUE = /^enhancements\.v2_general$/;
const RE_AJUSTEMENT = /tuning/i;
const RE_CUMULABLE = /^enhancements\.v2_(head|arms|chest|legs|class_item)$/;
const RE_MOD = /^enhancements\./;

/** FR : le rôle d'un emplacement de l'armure, d'après la catégorie du plug ÉQUIPÉ (« enhancements.v2_general » : le mod de statistique ; « …tuning… » : l'ajustement ; « enhancements.v2_head / arms / chest / legs / class_item » : les trois emplacements cumulables). / EN: the role of an armor socket, from its equipped plug's category. */
export function roleColonne(col: ColonneArmure): RoleColonne {
  const c = col.equipe.categoriePlug;
  if (RE_STATISTIQUE.test(c)) return "statistique";
  if (RE_AJUSTEMENT.test(c) || normaliser(col.equipe.nom).includes("ajustement")) return "ajustement";
  if (RE_CUMULABLE.test(c)) return "cumulable";
  return "autre";
}
/** FR : ⚠️ AJOUT (26/10/2026) - vrai si l'emplacement est pris en charge par `SimulationModsArmure` (mod de statistique, ajustement, cumulable, ou autre emplacement MODIFIABLE de mods). Les autres (archétype, amélioration, ensemble, cosmétiques, mods non modifiables) restent affichés EN LECTURE SEULE par la fenêtre qui appelle le composant. / EN: true when the socket is handled by `SimulationModsArmure`; the others stay read-only in the calling window. */
export function estGereeParSimulation(col: ColonneArmure): boolean {
  if (!col.modifiable) return false;
  return roleColonne(col) !== "autre" || RE_MOD.test(col.equipe.categoriePlug);
}
/** FR : vrai pour le plug qui représente « aucun mod » (« Emplacement de mod vide », « Emplacement de mod d'ajustement vide »). / EN: true for the "no mod" placeholder plug. */
export function estPlugVide(p: PlugArmure): boolean {
  const n = normaliser(p.nom);
  return n.startsWith("emplacement de mod") && n.includes("vide");
}
/** FR : coût d'énergie d'un mod ; un plug sans coût dans le Manifest compte 0 (règle validée). / EN: energy cost of a mod; no cost counts 0. */
export const coutMod = (db: Database, hash: number): number => lireCoutEnergie(db, hash) ?? 0;

// ---------- les versions en double ----------
interface DefVersion { collectibleHash?: number; plug?: { insertionRules?: unknown[]; enabledRules?: unknown[] } }
function scoreVersion(db: Database, p: PlugArmure): [number, number, number, number] {
  let def: DefVersion | null | undefined = null;
  try { def = obtenirDefinition<DefVersion>(db, "DestinyInventoryItemDefinition", p.hash); } catch { def = null; }
  const regles = (def?.plug?.insertionRules?.length ?? 0) + (def?.plug?.enabledRules?.length ?? 0);
  return [def?.collectibleHash !== undefined ? 1 : 0, -regles, coutMod(db, p.hash), -p.hash];
}
/** FR : ne garde, pour chaque NOM de mod en plusieurs versions, que la version STANDARD : celle qui a un identifiant de collection, sinon celle qui a le moins de règles d'activation, sinon la plus chère. Les plugs de `garder` (équipé, simulé) sont toujours conservés, et alors les autres versions du même nom sont écartées. L'ordre d'origine est conservé. / EN: keeps only the STANDARD version of each duplicated mod name. */
export function versionsStandard(db: Database, options: readonly PlugArmure[], garder: readonly number[] = []): PlugArmure[] {
  const parNom = new Map<string, PlugArmure[]>();
  for (const o of options) { const l = parNom.get(o.nom) ?? []; l.push(o); parNom.set(o.nom, l); }
  const retenus = new Set<number>();
  for (const versions of parNom.values()) {
    if (versions.length === 1) { retenus.add(versions[0].hash); continue; }
    const imposes = versions.filter((v) => garder.includes(v.hash));
    if (imposes.length > 0) { imposes.forEach((v) => retenus.add(v.hash)); continue; }
    const meilleure = [...versions].sort((a, b) => { const x = scoreVersion(db, a), y = scoreVersion(db, b); for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return y[i] - x[i]; return 0; })[0];
    retenus.add(meilleure.hash);
  }
  return options.filter((o) => retenus.has(o.hash));
}

// ---------- l'énergie ----------
export interface EnergieSimulee { capacite: number; reelle: number; simulee: number; restante: number }
/** FR : l'énergie de la pièce : capacité et énergie utilisée lues sur l'EXEMPLAIRE (`null` si elles n'ont pas été lues : aucune limite n'est alors imposée) ; l'énergie simulée = l'énergie utilisée du jeu + (coût du mod simulé − coût du mod équipé) pour chaque emplacement modifiable simulé. / EN: piece energy; `null` when not read (then no limit is applied). */
export function energieSimulee(db: Database, piece: GearPiece, colonnes: readonly ColonneArmure[], choix?: Record<number, ChoixColonne>): EnergieSimulee | null {
  const e = piece.energie;
  if (!e) return null;
  let simulee = e.utilisee;
  for (const col of colonnes) {
    const c = choix?.[col.socketIndex];
    if (!c || !col.modifiable || c.effectif === col.equipe.hash) continue;
    simulee += coutMod(db, c.effectif) - coutMod(db, col.equipe.hash);
  }
  return { capacite: e.capacite, reelle: e.utilisee, simulee, restante: e.capacite - simulee };
}
/** FR : le plug EFFECTIF d'un emplacement : le simulé, sinon l'équipé. / EN: the effective plug of a socket. */
export const hashEffectif = (col: ColonneArmure, choix?: Record<number, ChoixColonne>): number => (col.modifiable ? choix?.[col.socketIndex]?.effectif : undefined) ?? col.equipe.hash;
/** FR : l'énergie que coûterait un changement (positive = en demande plus). / EN: energy delta of a change. */
export const deltaEnergie = (db: Database, actuel: number, nouveau: number): number => coutMod(db, nouveau) - coutMod(db, actuel);
/** FR : vrai si le changement tient dans la capacité (toujours vrai quand l'énergie n'est pas lue). / EN: true when the change fits (always when energy is unknown). */
export const tientDansLEnergie = (energie: EnergieSimulee | null, delta: number): boolean => energie === null || delta <= 0 || delta <= energie.restante;

// ---------- l'emplacement de statistique ----------
export interface OptionStatistique { stat: StatKey; valeur: number; plug: PlugArmure; cout: number }
export interface ModeleStatistique { colonne: ColonneArmure; courant: PlugArmure; options: OptionStatistique[]; stats: StatKey[]; intensites: number[]; vide?: PlugArmure }
function statUnique(p: PlugArmure): { stat: StatKey; valeur: number } | null {
  const e = Object.entries(p.stats).filter(([, v]) => v !== undefined && v !== 0) as Array<[StatKey, number]>;
  return e.length === 1 && e[0][1] > 0 ? { stat: e[0][0], valeur: e[0][1] } : null;
}
export function modeleStatistique(db: Database, col: ColonneArmure, choix?: Record<number, ChoixColonne>): ModeleStatistique {
  const effectif = hashEffectif(col, choix);
  const opts = versionsStandard(db, col.options, [col.equipe.hash, effectif]);
  const options: OptionStatistique[] = []; let vide: PlugArmure | undefined;
  for (const p of opts) {
    if (estPlugVide(p)) { vide = vide ?? p; continue; }
    const s = statUnique(p);
    if (s) options.push({ ...s, plug: p, cout: coutMod(db, p.hash) });
  }
  const courant = col.options.find((o) => o.hash === effectif) ?? col.equipe;
  return { colonne: col, courant, options, stats: [...new Set(options.map((o) => o.stat))], intensites: [...new Set(options.map((o) => o.valeur))].sort((a, b) => a - b), vide };
}

// ---------- l'ajustement ----------
// FR : ⚠️ CHANGÉ (26/10/2026, règle du jeu donnée par l'utilisateur, CONFIRMÉE par ses diagnostics) - sur une armure LÉGENDAIRE le « + » est PROPRE à la pièce (tiré au hasard, jamais modifiable, symbole ⇅) ; sur une armure EXOTIQUE il n'y a PAS de « + » propre : toutes les combinaisons sont possibles (l'API marque les 31 « insérables »). Trois issues dans les deux cas : rien, équilibré (+1 sur les 3 statistiques non intrinsèques, MÊME sur une pièce sans maîtrise), directionnel (+5 / −5). / EN: ⚠️ CHANGED - legendary: the piece's own fixed "+"; exotic: no own "+", free choice.
export interface OptionAjustement { plug: PlugArmure; plus: StatKey; moins: StatKey }
export interface ModeleAjustement {
  colonne: ColonneArmure;
  courant: PlugArmure;
  /** FR : le « + » PROPRE à la pièce (le symbole ⇅ du jeu) ; `null` sur une EXOTIQUE (pas de « + » propre) ou si, sur une légendaire, on ne peut pas le lire : alors AUCUN ajustement directionnel n'est proposé. */
  plusPiece: StatKey | null;
  /** FR : pièce EXOTIQUE : le « + » se choisit librement. */
  plusLibre: boolean;
  /** FR : les « + » proposés, dans l'ordre Santé…Arme : un seul sur une légendaire, jusqu'à six sur une exotique. */
  plusPossibles: StatKey[];
  /** FR : les ajustements directionnels VALIDES : légendaire : « + (son « + ») / − X » ; exotique : toutes les combinaisons proposées. */
  directionnels: OptionAjustement[];
  /** FR : « Ajustement équilibré » (+1 sur les 3 statistiques non intrinsèques). */
  equilibre?: PlugArmure;
  /** FR : le plug « vide » : laisser l'ajustement vide ; absent si ni l'exemplaire ni le modèle du jeu ne le liste. */
  vide?: PlugArmure;
}
const ORDRE_STATS_AJ: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
export function modeleAjustement(col: ColonneArmure, choix?: Record<number, ChoixColonne>, insertables?: readonly number[], exotique = false): ModeleAjustement {
  const effectif = hashEffectif(col, choix);
  const plusPiece = exotique ? null : statDePlus(col.options, col.equipe, insertables);
  const directionnels: OptionAjustement[] = []; let equilibre: PlugArmure | undefined, vide: PlugArmure | undefined;
  for (const p of col.options) {
    const info = infoAjustement(p);
    if (info.genre === "vide") vide = vide ?? p;
    else if (info.genre === "equilibre") equilibre = equilibre ?? p;
    else if (info.genre === "directionnel" && (exotique || (plusPiece !== null && info.plus === plusPiece))) directionnels.push({ plug: p, plus: info.plus as StatKey, moins: info.moins as StatKey });
  }
  const plusPossibles = ORDRE_STATS_AJ.filter((k) => directionnels.some((o) => o.plus === k));
  return { colonne: col, courant: col.options.find((o) => o.hash === effectif) ?? col.equipe, plusPiece, plusLibre: exotique, plusPossibles, directionnels, equilibre, vide };
}

// ---------- les emplacements cumulables ----------
export interface ModeleCumulables { colonnes: ColonneArmure[]; options: PlugArmure[]; vide?: PlugArmure; effectifs: number[]; compte: Map<number, number>; nbLibres: number }
export function modeleCumulables(db: Database, colonnes: readonly ColonneArmure[], choix?: Record<number, ChoixColonne>): ModeleCumulables {
  const effectifs = colonnes.map((c) => hashEffectif(c, choix));
  const base = colonnes[0]?.options ?? [];
  const opts = versionsStandard(db, base, [...colonnes.map((c) => c.equipe.hash), ...effectifs]);
  const vide = opts.find(estPlugVide);
  const compte = new Map<number, number>();
  for (const h of effectifs) if (!vide || h !== vide.hash) compte.set(h, (compte.get(h) ?? 0) + 1);
  const nbLibres = vide ? effectifs.filter((h) => h === vide.hash).length : 0;
  return { colonnes: [...colonnes], options: opts.filter((o) => !estPlugVide(o)), vide, effectifs, compte, nbLibres };
}
/** FR : répartit une cible (« tel mod × N ») sur les emplacements en changeant le MOINS possible : les emplacements dont le mod équipé est dans la cible ne bougent pas, les autres reçoivent les mods restants, puis le plug vide. Renvoie un changement par emplacement. / EN: distributes a target multiset over the slots with minimal changes. */
export function affecterCumulables(colonnes: readonly ColonneArmure[], cible: ReadonlyMap<number, number>, videHash: number): Changement[] {
  const restant = new Map(cible);
  const attribue: Array<number | null> = colonnes.map(() => null);
  colonnes.forEach((c, i) => { const n = restant.get(c.equipe.hash) ?? 0; if (n > 0) { attribue[i] = c.equipe.hash; restant.set(c.equipe.hash, n - 1); } });
  const file: number[] = []; for (const [h, n] of restant) for (let k = 0; k < n; k++) file.push(h);
  return colonnes.map((c, i) => ({ socketIndex: c.socketIndex, plugHash: attribue[i] ?? file.shift() ?? videHash }));
}
/** FR : les changements pour poser UN exemplaire de plus de ce mod ; `null` si les trois emplacements sont pleins ou s'il n'y a pas de plug vide. / EN: changes to add one more copy; `null` when full. */
export function ajouterCumulable(m: ModeleCumulables, hash: number): Changement[] | null {
  if (!m.vide || m.nbLibres < 1) return null;
  const cible = new Map(m.compte); cible.set(hash, (cible.get(hash) ?? 0) + 1);
  return affecterCumulables(m.colonnes, cible, m.vide.hash);
}
/** FR : les changements pour retirer UN exemplaire de ce mod ; `null` s'il n'est pas posé ou s'il n'y a pas de plug vide. / EN: changes to remove one copy. */
export function retirerCumulable(m: ModeleCumulables, hash: number): Changement[] | null {
  const n = m.compte.get(hash) ?? 0;
  if (!m.vide || n < 1) return null;
  const cible = new Map(m.compte); if (n === 1) cible.delete(hash); else cible.set(hash, n - 1);
  return affecterCumulables(m.colonnes, cible, m.vide.hash);
}

// ---------- le modèle complet ----------
export interface ModeleSimulation {
  energie: EnergieSimulee | null;
  statistique: ModeleStatistique | null;
  ajustement: ModeleAjustement | null;
  /** FR : ⚠️ AJOUT (26/10/2026) - les 3 statistiques non intrinsèques de la pièce (+1 chacune avec l'ajustement équilibré) ; `null` si les statistiques ne sont pas toutes lues. */
  nonIntrinseques: StatKey[] | null;
  cumulables: ModeleCumulables | null;
  /** FR : les autres emplacements MODIFIABLES de mods (raids, saison, artifice…), listés tels quels. / EN: other modifiable mod sockets. */
  autres: ColonneArmure[];
}
export function modeleSimulation(db: Database, piece: GearPiece, colonnes: readonly ColonneArmure[], choix?: Record<number, ChoixColonne>): ModeleSimulation {
  const parRole = (r: RoleColonne) => colonnes.filter((c) => roleColonne(c) === r && c.modifiable);
  const stat = parRole("statistique"), ajust = parRole("ajustement"), cumul = parRole("cumulable");
  return {
    energie: energieSimulee(db, piece, colonnes, choix),
    statistique: stat[0] ? modeleStatistique(db, stat[0], choix) : null,
    ajustement: ajust[0] ? modeleAjustement(ajust[0], choix, piece.plugsInsertablesParColonne?.[ajust[0].socketIndex], piece.isExotic === true) : null,
    nonIntrinseques: nonIntrinsequesDePiece(piece.stats, colonnes),
    cumulables: cumul.length > 0 ? modeleCumulables(db, cumul, choix) : null,
    autres: parRole("autre").filter((c) => RE_MOD.test(c.equipe.categoriePlug))
  };
}

/** FR : applique des changements (un par emplacement) aux simulations : choisir l'équipé RETIRE la simulation de l'emplacement, sinon elle est enregistrée. / EN: applies changes to the simulations store. */
export function appliquerChangements(s: Simulations, instance: string, colonnes: readonly ColonneArmure[], changements: readonly Changement[]): Simulations {
  return changements.reduce((acc, c) => {
    const col = colonnes.find((x) => x.socketIndex === c.socketIndex);
    if (!col) return acc;
    return c.plugHash === col.equipe.hash ? retirerColonne(acc, instance, c.socketIndex, "armures") : choisir(acc, instance, c.socketIndex, { choisi: c.plugHash, effectif: c.plugHash }, "armures");
  }, s);
}
