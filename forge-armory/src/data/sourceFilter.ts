// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - FILTRES DE SOURCE DE LOOT, module PUR (aucun React, aucun réseau) : index hash → filtre reconstruit au chargement de `source-filters.json` (une Map, recherche O(1)), exposé à l'interface pour la syntaxe `source:` dans la recherche, l'autocomplétion et les alias d'activités.
// Les données viennent de d2-additional-info (Destiny Item Manager, licence MIT : https://github.com/DestinyItemManager/d2-additional-info), régénérées par `data/rebuild-source-filters.ts`. Le fichier comporte DEUX blocs : `categories` (13 catégories génériques : raid, donjon, trials…) et `activities` (une entrée par raid/donjon) ; les deux niveaux partagent le MÊME index.
// ZÉRO appel réseau : tout est local. Un objet remonte si L'UN de ses `itemSourceHash` (du Manifest, jamais lu ailleurs) appartient au filtre ; un objet SANS hash de source est simplement exclu, jamais une erreur.
// EN: ⚠️ ADDED - pure source-filter module: hash→filter index from source-filters.json, the `source:` search syntax, autocompletion and activity aliases; no network, no error on missing hashes.
export interface EntreeSource { libelle_fr: string; libelle_en: string; itemSourceHashes: number[] }
export interface FiltresSourcesFA {
  _licence: string; _source: string; _genere: string;
  categories: Record<string, EntreeSource>;
  activities: Record<string, EntreeSource>;
}
import filtresJson from "./source-filters.json";
export const FILTRES_SOURCES: FiltresSourcesFA = filtresJson as FiltresSourcesFA;

/** FR : l'index hash → { type, cle } : UNE passe au chargement, O(1) par filtre. / EN: hash→filter index, built once. */
const INDEX = new Map<number, { type: "categorie" | "activite"; cle: string }>();
for (const [cle, e] of Object.entries(FILTRES_SOURCES.categories)) for (const h of e.itemSourceHashes) INDEX.set(h, { type: "categorie", cle });
for (const [cle, e] of Object.entries(FILTRES_SOURCES.activities)) for (const h of e.itemSourceHashes) INDEX.set(h, { type: "activite", cle });

/** FR : les catégories et activités proposées par l'autocomplétion après « source: » — libellées dans la langue de l'interface. / EN: what "source:" autocompletion offers. */
export const SOURCE_FILTER_SUGGESTIONS: Array<{ valeur: string; libelle: string; genre: "categorie" | "activite" }> = [
  ...Object.entries(FILTRES_SOURCES.categories).map(([cle, e]) => ({ valeur: cle, libelle: e.libelle_fr, genre: "categorie" as const })),
  ...Object.entries(FILTRES_SOURCES.activities).map(([cle, e]) => ({ valeur: cle, libelle: e.libelle_fr, genre: "activite" as const })),
];



/** FR : un objet remonte-t-il sous `source:<valeur>` ? `valeur` = clé de catégorie OU d'activité ; un objet SANS hash de source est exclu, pas une erreur. / EN: does an item match `source:<value>`? */
export function matchesSourceFilter(itemSourceHashes: number[] | undefined, filterValue: string): boolean {
  if (!itemSourceHashes || itemSourceHashes.length === 0) return false;   // pas de source connue : exclu, sans erreur
  const e = FILTRES_SOURCES.categories[filterValue] ?? FILTRES_SOURCES.activities[filterValue];
  if (!e) return false;   // filtre inconnu : personne ne remonte (l'autocomplétion propose les valeurs valides)
  const attendus = new Set(e.itemSourceHashes);
  return itemSourceHashes.some((h) => attendus.has(h));
}


