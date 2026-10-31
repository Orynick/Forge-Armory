// FR : ⚠️ CHANGÉ (19/10/2026, troisième retour de test : la catégorie de source n'apparaissait pas non plus) - JOINTURE SOURCE D'UN OBJET, FIDÈLE À DIM : (1) le `sourceHash` du COLLECTIBLE de l'objet (`collectibleHash` → `DestinyCollectibleDefinition.sourceHash`) cherché dans les `sourceHashes` de chaque entrée, OU (2) le `hash` de l'objet dans les `itemHashes`. La plus PRÉCISE l'emporte (l'activité « last-wish » avant la catégorie « raid »). Zéro appel réseau ; un objet sans source connue donne undefined, JAMAIS une estimation. (L'ancienne jointure par `itemSourceHashes` du Manifest ne matchait rien : Bungie ne peuple pratiquement jamais ce champ.)
// EN: ⚠️ CHANGED - an item's source, mirroring DIM: collectible sourceHash in sourceHashes, OR item hash in itemHashes; the most specific wins.
import type { Database } from "sql.js";
import { FILTRES_SOURCES } from "./sourceFilter";
import { obtenirDefinition } from "../lib/manifest/download";

export interface SourceObjet {
  /** FR : clé du filtre (« raid », « last-wish »). / EN: filter key. */
  cle: string;
  /** FR : libellé affiché (« Raid », « Dernier Vœu »). / EN: displayed label. */
  libelle: string;
  /** FR : « categorie » (13 génériques) ou « activite » (un raid/donjon précis). / EN: "categorie" or "activite". */
  genre: "categorie" | "activite";
}

/** FR : deux index (le chemin collectible et le chemin direct), activités D'ABORD pour que la plus précise gagne. / EN: two indexes (collectible path and direct path); activities first. */
const INDEX_COLLECTIBLE = new Map<number, SourceObjet>();
const INDEX_ITEM = new Map<number, SourceObjet>();
for (const [cle, e] of Object.entries(FILTRES_SOURCES.activities)) {
  for (const h of e.sourceHashes ?? []) INDEX_COLLECTIBLE.set(h, { cle, libelle: e.libelle_fr, genre: "activite" });
  for (const h of e.itemHashes ?? []) INDEX_ITEM.set(h, { cle, libelle: e.libelle_fr, genre: "activite" });
}
for (const [cle, e] of Object.entries(FILTRES_SOURCES.categories)) {
  for (const h of e.sourceHashes ?? []) if (!INDEX_COLLECTIBLE.has(h)) INDEX_COLLECTIBLE.set(h, { cle, libelle: e.libelle_fr, genre: "categorie" });
  for (const h of e.itemHashes ?? []) if (!INDEX_ITEM.has(h)) INDEX_ITEM.set(h, { cle, libelle: e.libelle_fr, genre: "categorie" });
}

/** FR : le `sourceHash` du COLLECTIBLE de l'objet (la même lecture que `obtenirSource` du projet, qui en tire la chaîne brute). / EN: the item's collectible sourceHash. */
function collectibleSourceHash(db: Database, itemHash: number): number | undefined {
  try {
    const def = obtenirDefinition<{ collectibleHash?: number }>(db, "DestinyInventoryItemDefinition", itemHash);
    if (!def?.collectibleHash) return undefined;
    const collectible = obtenirDefinition<{ sourceHash?: number }>(db, "DestinyCollectibleDefinition", def.collectibleHash);
    return collectible?.sourceHash;
  } catch { return undefined; }   // tables absentes : undefined, jamais une erreur
}

/** FR : la source la plus précise d'un objet (catégorie ou activité), ou undefined sans estimation. / EN: an item's most specific source, or undefined. */
export function sourceObjetParHash(db: Database, itemHash: number): SourceObjet | undefined {
  return INDEX_ITEM.get(itemHash) ?? INDEX_COLLECTIBLE.get(collectibleSourceHash(db, itemHash) ?? -1);
}

/** FR : ⚠️ AJOUT (19/10/2026, 3e retour) - la JOINTURE COMPLÈTE pour le filtre du menu : les deux chemins de DIM dans un seul objet, passé à `matchesSourceFilter`. / EN: the full join (both DIM paths) for the dropdown filter. */
export function jointureSource(db: Database, itemHash: number): { collectibleSourceHash?: number; itemHash: number } {
  return { collectibleSourceHash: collectibleSourceHash(db, itemHash), itemHash };
}
