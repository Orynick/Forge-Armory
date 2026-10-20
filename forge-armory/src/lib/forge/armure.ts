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
export interface PlugArmure { hash: number; nom: string; description: string; icone?: string; categoriePlug: string; ornement: boolean; stats: StatsPartielles; /** FR : ⚠️ AJOUT (19/10/2026) - plug lu sur le MODÈLE (pas l'exemplaire) : possible en théorie, non garanti sur CET exemplaire. / EN: plug read from the model, not this instance. */ theorique?: boolean }
export interface ColonneArmure {
  socketIndex: number;
  /** FR : nom de la catégorie de socket (Manifest, dans la langue de l'utilisateur) ; vide si inconnu. / EN: socket category name; empty if unknown. */
  categorie: string;
  equipe: PlugArmure;
  /** FR : le plug équipé d'abord, puis les autres plugs disponibles sur l'exemplaire (sans doublon) ; ⚠️ AJOUT (19/10/2026) - complétés, quand l'exemplaire n'en liste AUCUN, par les plugs du MODÈLE (Manifest, mêmes quatre sources que la Collection), marqués `theorique : true`. / EN: the equipped plug first, then the other available plugs; completed with the model's plugs when the instance lists none. */
  options: PlugArmure[];
  cosmetique: boolean;
  fixe: boolean;
  modifiable: boolean;
  /** FR : ⚠️ AJOUT (19/10/2026) - au moins une option vient du MODÈLE (pas de l'exemplaire) : l'emplacement est modifiable « en théorie » seulement. / EN: at least one option comes from the model, not the instance. */
  theorique?: boolean;
}

interface DefObjetArmure {
  displayProperties?: { name?: string; icon?: string };
  plug?: { plugCategoryIdentifier?: string };
  investmentStats?: Array<{ statTypeHash: number; value: number }>;
  sockets?: { socketEntries?: EntreeSocketBrute[]; socketCategories?: Array<{ socketCategoryHash: number; socketIndexes: number[] }> };
}
/** FR : une entrée de socket du Manifest (les quatre champs d'où viennent les plugs possibles). / EN: a Manifest socket entry (the four fields the possible plugs come from). */
interface EntreeSocketBrute { singleInitialItemHash?: number; reusablePlugItems?: Array<{ plugItemHash: number }>; reusablePlugSetHash?: number; randomizedPlugSetHash?: number }
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
// FR : ⚠️ AJOUT (19/10/2026, retour de test de la 0.4.12 : les diagnostics de l'utilisateur montrent que le composant 310 liste ZERO plug disponible sur les prises de mods de ses armures réelles) - complément du MODÈLE : quand l'exemplaire ne propose AUCUNE alternative sur une prise non fixe non cosmétique, les plugs POSSIBLES viennent de la définition du modèle (mêmes quatre sources que `colonnesModeleArmure` : liste directe, jeux partagé et aléatoire, plug initial). Marqués `theorique` : ils sont simulables localement mais rien ne prouve que CET exemplaire les accepte (l'énergie des mods, à écrire, pourra les filtrer).
// EN: ⚠️ ADDED - when the instance lists no alternative plug, the possible plugs come from the model's definition, flagged `theorique`.
function completerParModele(db: Database, piece: GearPiece, socketIndex: number, vus: Set<number>): PlugArmure[] {
  const def = obtenirDefinition<DefObjetArmure>(db, "DestinyInventoryItemDefinition", piece.itemHash);
  const entree = def?.sockets?.socketEntries?.[socketIndex];
  if (!entree) return [];
  const ajoutes: PlugArmure[] = [];
  for (const h of hashesPossibles(db, entree)) {
    if (vus.has(h)) continue;
    vus.add(h);
    const p = lirePlugArmure(db, h);
    if (p && !p.ornement) ajoutes.push({ ...p, theorique: true });
  }
  return ajoutes;
}

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
    // FR : ⚠️ AJOUT (19/10/2026) - l'exemplaire ne propose RIEN d'autre que son plug équipé sur une prise qui devrait être changeable : les plugs POSSIBLES du modèle complètent (théoriques).
    let theorique = false;
    const fixe = CATEGORIES_FIXES.test(equipe.categoriePlug);
    if (!fixe && !cosmetique && options.length < 2) {
      const modele = completerParModele(db, piece, socketIndex, vus);
      theorique = modele.length > 0;
      options.push(...modele);
    }
    colonnes.push({ socketIndex, categorie, equipe, options, cosmetique, fixe, modifiable: !fixe && !cosmetique && options.length >= 2, theorique: theorique || undefined });
  }
  colonnes.sort((a, b) => a.socketIndex - b.socketIndex);
  return inclureCosmetiques ? colonnes : colonnes.filter((c) => !c.cosmetique);
}

/** FR : ⚠️ AJOUT (19/10/2026, retour de test de la 0.4.12 : « sur certains slots, il y aura forcément des doublons, il faudra étudier une interface spécifique pour ne pas avoir besoin de les afficher 3 fois ») - REGROUPEMENT POUR L'AFFICHAGE : les prices d'une armure réelle répètent souvent la MÊME liste (le Masque de chasse ultime a trois prises de mods identiques, le Pantalon de chargeur rapide en a deux) : deux colonnes sont regroupées quand leur plug équipé a la MÊME catégorie de plug, le MÊME nom de catégorie de socket et la MÊME liste d'options (mêmes hashes dans le même ordre). Le groupe porte les socketIndexes ; l'affichage le montre UNE fois avec « × N » et un seul clic simule chaque prise... non : un clic reste par prise (les prises restent distinctes pour la simulation) ; l'interface décidera. Fonction PURE. / EN: ⚠️ ADDED - groups identical repeated sockets (same equipped plug category, same options) for display.
 */
export interface GroupeColonneArmure { colonnes: ColonneArmure[]; categorie: string; cosmetique: boolean; fixe: boolean; modifiable: boolean; theorique?: boolean }
export function regrouperColonnesArmure(colonnes: readonly ColonneArmure[]): GroupeColonneArmure[] {
  const groupes: GroupeColonneArmure[] = [];
  for (const col of colonnes) {
    const signatures = (c: ColonneArmure) => `${c.equipe.categoriePlug}|${c.categorie}|${c.options.map((o) => o.hash).join(",")}`;
    const existant = groupes.find((g) => signatures(g.colonnes[0]) === signatures(col));
    if (existant) { existant.colonnes.push(col); existant.modifiable = existant.modifiable && col.modifiable; continue; }
    groupes.push({ colonnes: [col], categorie: col.categorie, cosmetique: col.cosmetique, fixe: col.fixe, modifiable: col.modifiable, theorique: col.theorique });
  }
  return groupes;
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

// ==================== ⚠️ AJOUT (16/10/2026, v0.4.12) : LES EMPLACEMENTS D'UN MODÈLE D'ARMURE (Collection, lecture seule) ====================
// FR : la Collection ne regarde pas un EXEMPLAIRE mais le MODÈLE du jeu : les emplacements viennent des entrées de socket du Manifest, avec TOUS les plugs possibles de chacun (liste directe, jeux de plugs partagé et aléatoire, plug initial : fusionnés sans doublon, comme `toutesSources` des armes façonnées). Les emplacements de MODS (listes très longues) et COSMÉTIQUES sont repliés par défaut. Pour ne pas lire des centaines de plugs inutilement, un emplacement est classé d'après son PREMIER plug lisible AVANT de lire les autres.
/** FR : un emplacement d'un modèle d'armure et tous ses plugs possibles. / EN: a socket of an armor model and all its possible plugs. */
export interface ColonneModele { socketIndex: number; categorie: string; options: PlugArmure[]; cosmetique: boolean; mod: boolean; fixe: boolean }
/** FR : emplacement de mods : identifiant de catégorie de plug « enhancements.… » ou nom de catégorie de socket contenant « mod ». / EN: a mods socket. */
const estEmplacementMod = (categoriePlug: string, nomCategorie: string) => /^enhancements\./i.test(categoriePlug) || /\bmods?\b/.test(normaliser(nomCategorie));
function nomsCategoriesSocket(db: Database, def: DefObjetArmure | undefined): Map<number, string> {
  const noms = new Map<number, string>();
  for (const cat of def?.sockets?.socketCategories ?? []) {
    let nom = "";
    try { nom = obtenirDefinition<DefNommee>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash)?.displayProperties?.name ?? ""; } catch { /* table absente : nom vide */ }
    for (const i of cat.socketIndexes) noms.set(i, nom);
  }
  return noms;
}
function hashesPossibles(db: Database, e: EntreeSocketBrute): number[] {
  const hashes: number[] = [];
  const ajouter = (hs: number[]) => { for (const h of hs) if (!hashes.includes(h)) hashes.push(h); };
  const pool = (hashJeu: number) => (obtenirDefinition<{ reusablePlugItems?: Array<{ plugItemHash: number }> }>(db, "DestinyPlugSetDefinition", hashJeu)?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
  ajouter((e.reusablePlugItems ?? []).map((p) => p.plugItemHash));
  if (e.reusablePlugSetHash) ajouter(pool(e.reusablePlugSetHash));
  if (e.randomizedPlugSetHash) ajouter(pool(e.randomizedPlugSetHash));
  if (e.singleInitialItemHash) ajouter([e.singleInitialItemHash]);
  return hashes;
}
/** FR : les emplacements d'un modèle d'armure du Manifest ; `mods` et `cosmetiques` les réintègrent (repliés par défaut). / EN: an armor model's sockets; `mods` and `cosmetiques` include the folded ones. */
export function colonnesModeleArmure(db: Database, itemHash: number, options: { mods?: boolean; cosmetiques?: boolean } = {}): ColonneModele[] {
  const def = obtenirDefinition<DefObjetArmure>(db, "DestinyInventoryItemDefinition", itemHash);
  const noms = nomsCategoriesSocket(db, def);
  const colonnes: ColonneModele[] = [];
  (def?.sockets?.socketEntries ?? []).forEach((entree, socketIndex) => {
    const hashes = hashesPossibles(db, entree);
    const categorie = noms.get(socketIndex) ?? "";
    const premier = hashes.map((h) => lirePlugArmure(db, h)).find((p): p is PlugArmure => !!p && !p.ornement);
    if (!premier) return;
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const mod = estEmplacementMod(premier.categoriePlug, categorie);
    if ((cosmetique && !options.cosmetiques) || (mod && !options.mods)) return;   // replié : on ne lit pas ses autres plugs
    const lus = hashes.map((h) => lirePlugArmure(db, h)).filter((p): p is PlugArmure => !!p && !p.ornement);
    colonnes.push({ socketIndex, categorie, options: lus, cosmetique, mod, fixe: CATEGORIES_FIXES.test(premier.categoriePlug) });
  });
  return colonnes;
}

/** FR : DIAGNOSTIC (mode développement) : pour un MODÈLE d'armure, entrée de socket par entrée de socket, d'où viennent ses plugs possibles (les quatre champs), combien on en lit, et le classement « cosmétique / mods / fixe », y compris pour les emplacements repliés ou sans plug lisible. À copier à Claude pour vérifier la structure réelle des armures du Manifest. / EN: dev diagnostic of an armor model's sockets. */
export function diagnosticArmureManifest(db: Database, itemHash: number): string {
  const def = obtenirDefinition<DefObjetArmure>(db, "DestinyInventoryItemDefinition", itemHash);
  const lignes: string[] = [`Modèle d'armure : ${def?.displayProperties?.name ?? "?"} (hash ${itemHash})`, diagnosticSaisonObjet(db, itemHash)];
  const noms = nomsCategoriesSocket(db, def);
  const entrees = def?.sockets?.socketEntries ?? [];
  if (entrees.length === 0) lignes.push("aucune entrée de socket dans la définition de cette armure");
  entrees.forEach((e, i) => {
    const hashes = hashesPossibles(db, e);
    const premier = hashes.map((h) => lirePlugArmure(db, h)).find((p): p is PlugArmure => !!p && !p.ornement);
    const categorie = noms.get(i) ?? "";
    const brut = `plug initial ${e.singleInitialItemHash ?? "—"} | liste directe ${(e.reusablePlugItems ?? []).length} | jeu partagé ${e.reusablePlugSetHash ?? "—"} | jeu aléatoire ${e.randomizedPlugSetHash ?? "—"}`;
    if (!premier) { lignes.push(`prise ${i} | catégorie « ${categorie || "?"} » | ${brut} | ${hashes.length} plug(s) possible(s), AUCUN lisible dans le Manifest`); return; }
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const noms6 = hashes.slice(0, 6).map((h) => lirePlugArmure(db, h)?.nom ?? "?").join(" | ");
    lignes.push(`prise ${i} | catégorie « ${categorie || "?"} » | ${brut} | ${hashes.length} plug(s) possible(s) (premiers : ${noms6}${hashes.length > 6 ? " …" : ""}) | catégorie de plug « ${premier.categoriePlug || "?"} » | cosmétique : ${cosmetique ? "oui" : "non"} | mods : ${estEmplacementMod(premier.categoriePlug, categorie) ? "oui" : "non"} | fixe : ${CATEGORIES_FIXES.test(premier.categoriePlug) ? "oui" : "non"}`);
  });
  return lignes.join("\n");
}
