// FR : ⚠️ AJOUT (16/10/2026, v0.4.12), demande de l'utilisateur : « on enchaîne sur les armures de la Collection » - le CATALOGUE DES ARMURES DU JEU, construit à partir du Manifest (spécification du 12/10/2026 : « toutes les armes et armures du jeu »), sur le modèle de `catalogueArmes.ts` : lecture UNE FOIS par Manifest, par lots avec pauses (l'écran reste réactif), mis en mémoire ; puis des filtres (nom ou ensemble, classe, emplacement, rareté, ensemble, source « Collections du jeu », obtention). LECTURE SEULE : rien n'est simulé, rien n'est écrit.
// Une armure = un objet `itemType` 2 avec un nom, ni masqué ni factice, dont le seau (`bucketTypeHash`) est un emplacement d'armure connu. Le `LIKE '%"itemType":2%'` attrape aussi 20, 21… : l'exactitude est revérifiée sur le JSON lu. Le nom de l'ensemble (Armor 3.0) vient de l'index des ensembles (`obtenirBonusSet`, une seule lecture de table). ⚠️ Non vérifié sur le Manifest réel de l'utilisateur (voir le diagnostic en `npm run dev`). EN: ⚠️ ADDED - the game's armor catalogue built from the Manifest, modelled on the weapons catalogue; read-only.
import type { Database } from "sql.js";
import { obtenirDefinition, idSqliteVersHash } from "./download";
import { normaliser, urlIcone } from "./search";
import { BUCKET_HASH_VERS_SLOT, CLASS_TYPE_VERS_CLASSE, TIER_TYPE_HASH_EXOTIQUE } from "../../data/constantesManifest";
import { obtenirBonusSet } from "./doctrine";
import type { SlotArmure } from "../../types/build";
import type { EtatObtention, OptionsConstruction } from "./catalogueArmes";

const TABLE_OBJETS = "DestinyInventoryItemDefinition";
const CATEGORIE_FACTICE = 3109687656;
const SLOTS_ARMURE: readonly string[] = ["casque", "gants", "torse", "jambes", "marque"];

export type ClasseArmure = "titan" | "chasseur" | "arcaniste";
export interface ArmureCatalogue {
  hash: number;
  nom: string;
  /** FR : nom sans accents ni majuscules, pour la recherche. / EN: accent-free lowercase name for search. */
  nomNormalise: string;
  icone?: string;
  slot: SlotArmure;
  classe?: ClasseArmure;
  rarete?: string;
  estExotique: boolean;
  /** FR : nom de l'ensemble d'armure (Armor 3.0), s'il y en a un. / EN: armor set name, if any. */
  ensemble?: string;
  /** FR : présent seulement si l'armure figure dans les Collections du jeu. / EN: only if the armor is in the game's Collections. */
  collectibleHash?: number;
}

interface DefArmureBrute {
  displayProperties?: { name?: string; icon?: string };
  itemType?: number;
  redacted?: boolean;
  collectibleHash?: number;
  itemCategoryHashes?: number[];
  classType?: number;
  inventory?: { bucketTypeHash?: number; tierTypeHash?: number };
}

const CACHE = new WeakMap<Database, Promise<ArmureCatalogue[]>>();

/** FR : lit les lignes du Manifest qui ressemblent à des armures (requête ciblée ; repli sur un balayage grossier si elle ne trouve rien). / EN: reads the rows that look like armor (targeted query, coarse fallback). */
function* lignesArmures(db: Database): Generator<{ id: number; json: string }> {
  for (const ciblee of [true, false]) {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_OBJETS}${ciblee ? ` WHERE json LIKE '%"itemType":2%'` : ""}`);
    let trouve = false;
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const json = String(row.json);
        if (!ciblee && !/"itemType"\s*:\s*2\b/.test(json)) continue;
        trouve = true;
        yield { id: Number(row.id), json };
      }
    } finally {
      stmt.free();
    }
    if (trouve) return;
  }
}

function lireArmure(db: Database, ligne: { id: number; json: string }, raretes: Map<number, string | undefined>): ArmureCatalogue | null {
  let def: DefArmureBrute;
  try { def = JSON.parse(ligne.json); } catch { return null; }
  const nom = def.displayProperties?.name?.trim();
  if (def.itemType !== 2 || !nom || def.redacted) return null;
  if (def.itemCategoryHashes?.includes(CATEGORIE_FACTICE)) return null;
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  if (!slot || !SLOTS_ARMURE.includes(slot)) return null;
  const hash = idSqliteVersHash(ligne.id);
  const tier = def.inventory?.tierTypeHash;
  if (tier !== undefined && !raretes.has(tier)) raretes.set(tier, obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyItemTierTypeDefinition", tier)?.displayProperties?.name);
  let ensemble: string | undefined;
  try { ensemble = obtenirBonusSet(db, hash)?.nomSet; } catch { /* index des ensembles illisible : l'armure n'a simplement pas d'ensemble */ }
  return {
    hash, nom, nomNormalise: normaliser(nom), icone: urlIcone(def.displayProperties?.icon), slot: slot as SlotArmure,
    classe: def.classType !== undefined ? CLASS_TYPE_VERS_CLASSE[def.classType] : undefined,
    rarete: tier !== undefined ? raretes.get(tier) : undefined, estExotique: tier === TIER_TYPE_HASH_EXOTIQUE, ensemble, collectibleHash: def.collectibleHash || undefined,
  };
}

/** FR : construit le catalogue UNE fois par Manifest (la même promesse est rendue ensuite) ; un échec n'est pas mis en mémoire. / EN: builds the catalogue once per Manifest. */
export function construireCatalogueArmures(db: Database, options: OptionsConstruction = {}): Promise<ArmureCatalogue[]> {
  const existant = CACHE.get(db);
  if (existant) return existant;
  const { onProgression, tailleLot = 250, pause = () => new Promise<void>((r) => setTimeout(r, 0)) } = options;
  const promesse = (async () => {
    const armures: ArmureCatalogue[] = [];
    const raretes = new Map<number, string | undefined>();
    let lues = 0;
    for (const ligne of lignesArmures(db)) {
      const armure = lireArmure(db, ligne, raretes);
      if (armure) armures.push(armure);
      if (++lues % tailleLot === 0) { onProgression?.(armures.length); await pause(); }
    }
    onProgression?.(armures.length);
    return armures.sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.hash - b.hash);
  })();
  CACHE.set(db, promesse);
  promesse.catch(() => CACHE.delete(db));
  return promesse;
}

export interface FiltresArmures {
  texte: string;
  classe: "toutes" | ClasseArmure;
  slot: "tous" | SlotArmure;
  rarete: string;
  ensemble: string;
  /** FR : « collections » = armures des Collections du jeu (défaut) ; « hors » = les autres ; « tout ». / EN: Collections / not in Collections / all. */
  source: "collections" | "hors" | "tout";
  obtention: "toutes" | "obtenues" | "jamais";
}
export const FILTRES_ARMURES_PAR_DEFAUT: FiltresArmures = { texte: "", classe: "toutes", slot: "tous", rarete: "toutes", ensemble: "tous", source: "collections", obtention: "toutes" };

/** FR : les valeurs possibles d'un menu (raretés, ensembles), triées. / EN: the possible values of a menu, sorted. */
export function valeursDistinctesArmures(armures: readonly ArmureCatalogue[], champ: "rarete" | "ensemble"): string[] {
  return [...new Set(armures.map((a) => a[champ]).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, "fr"));
}

/** FR : applique les filtres ; la recherche cherche chaque mot dans le nom ET dans le nom de l'ensemble. / EN: applies the filters; search matches each word in the name AND the set name. */
export function filtrerArmures(armures: readonly ArmureCatalogue[], f: FiltresArmures, obtentionDe: (a: ArmureCatalogue) => EtatObtention): ArmureCatalogue[] {
  const mots = normaliser(f.texte).split(/\s+/).filter(Boolean);
  return armures.filter((a) => {
    if (f.source === "collections" && !a.collectibleHash) return false;
    if (f.source === "hors" && a.collectibleHash) return false;
    if (f.classe !== "toutes" && a.classe !== f.classe) return false;
    if (f.slot !== "tous" && a.slot !== f.slot) return false;
    if (f.rarete !== "toutes" && a.rarete !== f.rarete) return false;
    if (f.ensemble !== "tous" && a.ensemble !== f.ensemble) return false;
    if (f.obtention !== "toutes") { const e = obtentionDe(a); if (e !== (f.obtention === "obtenues" ? "obtenu" : "jamais")) return false; }
    if (mots.length) { const texte = `${a.nomNormalise} ${normaliser(a.ensemble ?? "")}`; if (!mots.every((m) => texte.includes(m))) return false; }
    return true;
  });
}
