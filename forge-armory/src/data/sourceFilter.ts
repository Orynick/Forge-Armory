// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - FILTRES DE SOURCE DE LOOT, module PUR (aucun React, aucun réseau) : la jointure et les données pour le MENU DÉROULANT « Source de l'objet » de la recherche du Manifest (13 catégories génériques + une entrée par raid/donjon).
// ⚠️ CHANGÉ (19/10/2026, troisième retour de test : le filtre ne matchait RIEN — « sans l'utiliser il trouve ce que je veux ») : la jointure est désormais FIDÈLE À DIM (Destiny Item Manager, `src/app/search/items/search-filters/known-values.ts`, filtre `source`) : un objet matche si (1) le `sourceHash` de son COLLECTIBLE (`itemDef.collectibleHash` → `DestinyCollectibleDefinition.sourceHash`) appartient aux `sourceHashes` de la source, OU (2) son propre `hash` appartient aux `itemHashes` de la source. Les `itemSourceHashes` du Manifest ne sont PLUS utilisés : Bungie les peuple rarement, c'était la cause de l'échec. Données de d2-additional-info (licence MIT : https://github.com/DestinyItemManager/d2-additional-info), régénérées par `data/rebuild-source-filters.ts`. Zéro appel réseau ; un objet sans source connue est exclu, jamais une erreur.
// EN: ⚠️ ADDED then CHANGED (the join mirrors DIM's: collectible sourceHash in sourceHashes, OR item hash in itemHashes; the Manifest's itemSourceHashes are rarely populated and matched nothing).
export interface EntreeSource {
  libelle_fr: string;
  libelle_en: string;
  /** FR : les `sourceHashes` de DIM : ceux du COLLECTIBLE de l'objet. / EN: DIM's sourceHashes, read from the item's collectible. */
  sourceHashes: number[];
  /** FR : les `itemHashes` de DIM : objets listés DIRECTEMENT dans la source. / EN: DIM's itemHashes: items listed directly. */
  itemHashes: number[];
  /** FR : ⚠️ AJOUT (19/10/2026, retour de test : « pour tout ce qui est activité, on va être plus explicite et préciser le type ») - genre de l'activité : "raid" ou "donjon", pour le libellé du menu. / EN: activity kind for the dropdown label. */
  genre?: "raid" | "donjon";
}
export interface FiltresSourcesFA {
  _licence: string; _source: string; _genere: string;
  categories: Record<string, EntreeSource>;
  activities: Record<string, EntreeSource>;
}
import filtresJson from "./source-filters.json";
export const FILTRES_SOURCES: FiltresSourcesFA = filtresJson as FiltresSourcesFA;

/** FR : les valeurs proposées par le MENU « Source de l'objet » — catégories puis activités, libellées en français. / EN: what the Source dropdown offers. */
export const SOURCE_FILTER_SUGGESTIONS: Array<{ valeur: string; libelle: string; genre: "categorie" | "activite"; prefixe: string }> = [
  ...Object.entries(FILTRES_SOURCES.categories).map(([cle, e]) => ({ valeur: cle, libelle: e.libelle_fr, genre: "categorie" as const, prefixe: "" })),
  // FR : ⚠️ CHANGÉ (19/10/2026, demande de l'utilisateur : « remplace "Activité ·" par "Raid ·" / "Donjon ·" ») - le préfixe du menu dit le TYPE d'activité, et l'ordre du JSON (fixé par la même demande) liste les raids puis les donjons dans l'ordre chronologique voulu. / EN: the menu prefix states the activity kind; the JSON order was fixed by the user.
  ...Object.entries(FILTRES_SOURCES.activities).map(([cle, e]) => ({ valeur: cle, libelle: e.libelle_fr, genre: "activite" as const, prefixe: e.genre === "raid" ? "Raid · " : e.genre === "donjon" ? "Donjon · " : "" })),
];

/** FR : ⚠️ CHANGÉ (19/10/2026, 3e retour de test) - la jointure de DIM, exactement : (1) le `sourceHash` du COLLECTIBLE de l'objet dans les `sourceHashes` de la source, OU (2) le hash de l'objet dans les `itemHashes`. Le `collectibleSourceHash` se lit : `itemDef.collectibleHash` → `DestinyCollectibleDefinition` → `.sourceHash` (la même lecture que `obtenirSource` du projet, qui affiche la chaîne brute). / EN: DIM's own join: collectible sourceHash in sourceHashes, OR item hash in itemHashes. */
export function matchesSourceFilter(jointure: { collectibleSourceHash?: number; itemHash: number } | undefined, filterValue: string): boolean {
  if (!jointure) return false;   // pas de source connue : exclu, sans erreur
  const e = FILTRES_SOURCES.categories[filterValue] ?? FILTRES_SOURCES.activities[filterValue];
  if (!e) return false;   // filtre inconnu : personne ne remonte (le menu ne propose que des valeurs valides)
  return (jointure.collectibleSourceHash != null && (e.sourceHashes ?? []).includes(jointure.collectibleSourceHash)) || (e.itemHashes ?? []).includes(jointure.itemHash);
}
