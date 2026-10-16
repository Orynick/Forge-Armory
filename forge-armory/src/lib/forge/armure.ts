// FR : ⚠️ AJOUT (15/10/2026, v0.4.12), demande de l'utilisateur : « Go les armures » - FORGE DES ARMURES, étape 1 : lecture + SIMULATION LOCALE des MODS d'une armure possédée, avec l'effet sur ses six statistiques. Module PUR (pas de React, pas de réseau) : il construit, pour une pièce d'armure de l'inventaire, ses COLONNES (un emplacement = une colonne) et calcule l'effet des mods simulés.
// ⚠️ HYPOTHÈSE DE CONCEPTION (la spécification du 12/10/2026 ne dit pas ce qu'on sélectionne sur une armure, cf. `NOTES-CONCEPTION.md` point 10) : ce que le joueur peut réellement changer sur une armure, ce sont ses MODS (emplacements de mods, mods d'ajustement) ; l'archétype, l'amélioration (maîtrise), le bonus d'ensemble et le perk exotique sont FIXES. Une colonne est donc « modifiable » quand elle n'est ni fixe ni cosmétique ET que l'exemplaire y accepte au moins deux plugs (composant 310 de Bungie, `plugsDisponiblesParColonne`) : aucune catégorie de socket n'est écrite en dur, la donnée décide.
// Les statistiques d'une armure viennent de ses plugs (Armor 3.0 : voir `lib/bungie/inventaire.ts`) ; le changement d'un MOD ajoute la différence des `investmentStats` du nouveau plug et de l'ancien. L'archétype et l'amélioration (qui suivent des règles propres : « les trois stats les plus basses ») ne sont jamais simulés : la différence est donc exacte. EN: ⚠️ ADDED - armor Forge, step 1: pure module building an armor piece's columns and computing the stat effect of simulated mods (assumption: mods are what a player can change).
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../../types/build";
import { obtenirDefinition } from "../manifest/download";
import { obtenirDescriptionComplete } from "../manifest/doctrine";
import { normaliser, urlIcone } from "../manifest/search";
import { resoudreStatKey } from "../manifest/statsArmure";
import { diagnosticSaisonObjet } from "../manifest/saison";
import type { ChoixColonne } from "./simulation";

export type StatsPartielles = Partial<Record<StatKey, number>>;
export interface PlugArmure { hash: number; nom: string; description: string; icone?: string; categoriePlug: string; ornement: boolean; stats: StatsPartielles }
export interface ColonneArmure {
  socketIndex: number;
  /** FR : nom de la catégorie de socket (Manifest, dans la langue de l'utilisateur) ; vide si inconnu. / EN: socket category name; empty if unknown. */
  categorie: string;
  equipe: PlugArmure;
  /** FR : le plug équipé d'abord, puis les autres plugs disponibles sur l'exemplaire (sans doublon). / EN: the equipped plug first, then the other available plugs. */
  options: PlugArmure[];
  cosmetique: boolean;
  fixe: boolean;
  modifiable: boolean;
}

interface DefObjetArmure {
  displayProperties?: { name?: string; icon?: string };
  plug?: { plugCategoryIdentifier?: string };
  investmentStats?: Array<{ statTypeHash: number; value: number }>;
  sockets?: { socketCategories?: Array<{ socketCategoryHash: number; socketIndexes: number[] }> };
}
interface DefNommee { displayProperties?: { name?: string } }

/** FR : emplacements purement cosmétiques (teinture, ornement, souvenir…) : masqués par défaut. Appliqué à l'identifiant de catégorie du plug ET au nom normalisé de la catégorie de socket. / EN: purely cosmetic sockets, hidden by default. */
const MOTS_COSMETIQUES = /shader|skin|ornament|ornement|cosmetic|cosmetique|transmat|emote|projection|memento|souvenir|tracker|apparence|teinture|spawn/;
/** FR : catégories de plug qui ne se changent JAMAIS à la main (archétype, maîtrise, intrinsèque, exotique, bonus d'ensemble) : jamais simulées, même si l'exemplaire en listait plusieurs. / EN: plug categories a player never changes by hand. */
const CATEGORIES_FIXES = /masterwork|armor_stats|intrinsic|exotic|set_perk|armor_tier|archetype/i;

const memoStats = new WeakMap<Database, Map<number, StatKey | undefined>>();
function cleStat(db: Database, statHash: number): StatKey | undefined {
  let m = memoStats.get(db);
  if (!m) { m = new Map(); memoStats.set(db, m); }
  if (!m.has(statHash)) {
    const nom = obtenirDefinition<DefNommee>(db, "DestinyStatDefinition", statHash)?.displayProperties?.name;
    m.set(statHash, nom ? resoudreStatKey(nom) : undefined);
  }
  return m.get(statHash);
}

const memoPlugs = new WeakMap<Database, Map<number, PlugArmure | null>>();
export function lirePlugArmure(db: Database, hash: number): PlugArmure | null {
  let m = memoPlugs.get(db);
  if (!m) { m = new Map(); memoPlugs.set(db, m); }
  const connu = m.get(hash);
  if (connu !== undefined) return connu;
  let plug: PlugArmure | null = null;
  try {
    const def = obtenirDefinition<DefObjetArmure>(db, "DestinyInventoryItemDefinition", hash);
    const nom = def?.displayProperties?.name;
    if (nom) {
      const { description, estOrnement } = obtenirDescriptionComplete(db, hash);
      const stats: StatsPartielles = {};
      for (const inv of def?.investmentStats ?? []) { const k = cleStat(db, inv.statTypeHash); if (k) stats[k] = (stats[k] ?? 0) + inv.value; }
      plug = { hash, nom, description, icone: urlIcone(def?.displayProperties?.icon), categoriePlug: def?.plug?.plugCategoryIdentifier ?? "", ornement: estOrnement, stats };
    }
  } catch { plug = null; }
  m.set(hash, plug);
  return plug;
}

/** FR : les colonnes d'une armure possédée (une par emplacement équipé), dans l'ordre des prises ; les colonnes cosmétiques sont masquées sauf demande. / EN: an owned armor piece's columns, in socket order; cosmetic columns hidden unless asked. */
export function colonnesArmure(db: Database, piece: GearPiece, inclureCosmetiques = false): ColonneArmure[] {
  const def = obtenirDefinition<DefObjetArmure>(db, "DestinyInventoryItemDefinition", piece.itemHash);
  const noms = new Map<number, string>();
  for (const cat of def?.sockets?.socketCategories ?? []) {
    let nom = "";
    try { nom = obtenirDefinition<DefNommee>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash)?.displayProperties?.name ?? ""; } catch { /* table absente : nom vide */ }
    for (const i of cat.socketIndexes) noms.set(i, nom);
  }
  const colonnes: ColonneArmure[] = [];
  for (const { socketIndex, hash } of piece.perksParColonne ?? []) {
    const equipe = lirePlugArmure(db, hash);
    if (!equipe) continue;
    const categorie = noms.get(socketIndex) ?? "";
    const cosmetique = equipe.ornement || MOTS_COSMETIQUES.test(equipe.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const options: PlugArmure[] = [equipe];
    const vus = new Set<number>([hash]);
    for (const h of piece.plugsDisponiblesParColonne?.[socketIndex] ?? []) {
      if (vus.has(h)) continue;
      vus.add(h);
      const p = lirePlugArmure(db, h);
      if (p && !p.ornement) options.push(p);
    }
    const fixe = CATEGORIES_FIXES.test(equipe.categoriePlug);
    colonnes.push({ socketIndex, categorie, equipe, options, cosmetique, fixe, modifiable: !fixe && !cosmetique && options.length >= 2 });
  }
  colonnes.sort((a, b) => a.socketIndex - b.socketIndex);
  return inclureCosmetiques ? colonnes : colonnes.filter((c) => !c.cosmetique);
}

export interface StatsSimulees { reelles: StatsPartielles; simulees: StatsPartielles; delta: StatsPartielles; nbChangements: number }
/** FR : les six statistiques réelles, simulées et leur différence. Seules comptent les colonnes MODIFIABLES dont le choix diffère du plug équipé : la différence est la somme, sur ces colonnes, des `investmentStats` du nouveau plug moins ceux de l'ancien. / EN: real, simulated stats and the difference; only changeable columns whose choice differs count. */
export function statsSimulees(db: Database, piece: GearPiece, choix?: Record<number, ChoixColonne>): StatsSimulees {
  const delta: StatsPartielles = {};
  let nbChangements = 0;
  if (choix) {
    for (const col of colonnesArmure(db, piece, true)) {
      const c = choix[col.socketIndex];
      if (!c || !col.modifiable || c.effectif === col.equipe.hash) continue;
      const nouveau = col.options.find((o) => o.hash === c.effectif);
      if (!nouveau) continue;
      nbChangements++;
      for (const k of new Set([...Object.keys(nouveau.stats), ...Object.keys(col.equipe.stats)]) as Set<StatKey>) delta[k] = (delta[k] ?? 0) + (nouveau.stats[k] ?? 0) - (col.equipe.stats[k] ?? 0);
    }
  }
  const reelles = piece.stats ?? {};
  const simulees: StatsPartielles = { ...reelles };
  for (const k of Object.keys(delta) as StatKey[]) simulees[k] = (reelles[k] ?? 0) + (delta[k] ?? 0);
  return { reelles, simulees, delta, nbChangements };
}

/** FR : DIAGNOSTIC (mode développement) : décrit, emplacement par emplacement, ce que l'appli lit sur CETTE armure (plug équipé, catégorie, plugs disponibles, jugement « cosmétique / fixe / modifiable »), pour contrôler ces données sur le compte de l'utilisateur et décider de la suite (lien avec le score, énergie des mods). / EN: dev diagnostic of what the app reads on this armor piece, socket by socket. */
export function diagnosticArmure(db: Database, piece: GearPiece): string {
  const lignes: string[] = [];
  lignes.push(`Armure : ${piece.nom ?? "?"} (hash ${piece.itemHash}) | emplacement : ${piece.slot} | classe : ${piece.classeRequise ?? "?"} | exotique : ${piece.isExotic ? "oui" : "non"} | ensemble (setHash) : ${piece.setHash ?? "aucun"}`);
  lignes.push(diagnosticSaisonObjet(db, piece.itemHash));
  lignes.push(`Statistiques réelles : ${Object.entries(piece.stats ?? {}).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}`);
  lignes.push(`Disponibilité des plugs lue sur l'exemplaire : ${piece.plugsDisponiblesParColonne === undefined ? "NON (rechargez l'inventaire)" : "oui"}`);
  const colonnes = colonnesArmure(db, piece, true);
  const lues = new Set(colonnes.map((c) => c.socketIndex));
  for (const c of colonnes) {
    const dispo = piece.plugsDisponiblesParColonne?.[c.socketIndex] ?? [];
    const noms = c.options.slice(1, 7).map((o) => o.nom).join(" | ");
    lignes.push(`prise ${c.socketIndex} | catégorie « ${c.categorie || "?"} » | équipé : ${c.equipe.nom} (hash ${c.equipe.hash}, catégorie de plug « ${c.equipe.categoriePlug || "?"} », stats : ${Object.entries(c.equipe.stats).map(([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`).join(", ") || "aucune"}) | disponibles : ${dispo.length}${noms ? ` (autres : ${noms}${c.options.length > 7 ? " …" : ""})` : ""} | cosmétique : ${c.cosmetique ? "oui" : "non"} | fixe : ${c.fixe ? "oui" : "non"} | modifiable : ${c.modifiable ? "OUI" : "non"}`);
  }
  for (const p of piece.perksParColonne ?? []) if (!lues.has(p.socketIndex)) lignes.push(`prise ${p.socketIndex} | plug illisible dans le Manifest (hash ${p.hash})`);
  return lignes.join("\n");
}
