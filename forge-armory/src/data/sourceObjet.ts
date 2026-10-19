// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - JOINTURE SOURCE D'UN OBJET : la catégorie de source (« Raid », « Donjon », « Last Wish »…) d'un objet du Manifest, par SON `itemSourceHashes`.
// Pourquoi un module à part : la recherche affiche déjà la chaîne brute (« Source: "Last Wish" Raid » via collectibleHash → sourceString, voir `obtenirSource` de doctrine.ts) mais ni catégorisée ni filtrable. Ce module utilise la table de correspondance de d2-additional-info (MIT, `data/source-filters.json`) : chaque `itemSourceHash` de l'objet est cherché dans l'index (O(1)) qui regroupe les 13 CATÉGORIES et les 24 ACTIVITÉS ; la plus PRÉCISE l'emporte (l'activité « last-wish » avant la catégorie « raid »).
// ZÉRO appel réseau ; un objet sans `itemSourceHashes` (cas fréquent : perks, fragments) donne undefined, JAMAIS une estimation.
// EN: ⚠️ ADDED - an item's source category, joined by its itemSourceHashes through the d2-additional-info index; the most specific entry wins.
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

/** FR : l'index itemSourceHash → entrée, UNE fois par chargement du module : les activités AVANT les catégories pour que la plus précise gagne à égalité de hash. / EN: hash→entry index; activities first so the most specific wins. */
const INDEX = new Map<number, SourceObjet>();
for (const [cle, e] of Object.entries(FILTRES_SOURCES.activities)) for (const h of e.itemSourceHashes) INDEX.set(h, { cle, libelle: e.libelle_fr, genre: "activite" });
for (const [cle, e] of Object.entries(FILTRES_SOURCES.categories)) for (const h of e.itemSourceHashes) if (!INDEX.has(h)) INDEX.set(h, { cle, libelle: e.libelle_fr, genre: "categorie" });

/** FR : la source la plus précise d'un objet du Manifest (catégorie ou activité), ou undefined sans estimation. Lecture via `obtenirDefinition` (cache WeakMap partagé avec le reste de l'appli, conversion hash→id SQLite incluse). / EN: an item's most specific source, or undefined; read through the shared definition cache. */
export function sourceObjetParHash(db: Database, itemHash: number): SourceObjet | undefined {
  let def: { itemSourceHashes?: number[] } | undefined;
  try { def = obtenirDefinition<{ itemSourceHashes?: number[] }>(db, "DestinyInventoryItemDefinition", itemHash); } catch { return undefined; }   // table absente : undefined, jamais une erreur
  const hashes = def?.itemSourceHashes;
  if (!Array.isArray(hashes)) return undefined;
  for (const h of hashes) { const s = INDEX.get(h); if (s) return s; }   // la première entrée indexée gagne ; undefined sinon
  return undefined;
}
