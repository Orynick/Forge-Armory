// FR : Telechargement, cache et lecture du Manifest Destiny (base SQLite).
// EN: Download, caching and reading of the Destiny Manifest (SQLite DB).

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import { BUNGIE_API_ROOT, BUNGIE_ROOT, bungieConfig } from "../bungie/config";
import { ouvrirDB } from "./db";

interface ManifestMeta {
  version: string;
  mobileWorldContentPaths: Record<string, string>; // cle = code langue, "fr", "en"...
}

async function recupererMeta(): Promise<ManifestMeta> {
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Manifest/`, {
    headers: { "X-API-Key": bungieConfig.apiKey },
  });
  const data = await reponse.json();
  return data.Response as ManifestMeta;
}

// FR : OPTIMISATION - initSqlJs() charge et compile le module wasm
// (~1 Mo) ; sans ce cache, il etait rechargee a chaque appel de
// assurerManifestAJour (par ex. a chaque reconnexion), ce qui ralentit
// inutilement l'appli. On ne le fait plus qu'une fois par session.
// EN: OPTIMIZATION - initSqlJs() loads and compiles the wasm module
// (~1MB); without this cache it was reloaded on every call to
// assurerManifestAJour (e.g. on every reconnect), needlessly slowing the
// app down. We now only do it once per session.
let sqlModulePromise: Promise<SqlJsStatic> | null = null;
function obtenirModuleSql(): Promise<SqlJsStatic> {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs({ locateFile: (f) => `/${f}` });
  }
  return sqlModulePromise!;
}

/**
 * FR : Telecharge le Manifest (base SQLite compressee) en francais, la met
 * en cache dans IndexedDB, et ne re-telecharge que si la version a change.
 * Le fichier fait typiquement 80-120 Mo decompresse.
 * EN: Downloads the Manifest (compressed SQLite DB) in French, caches it in
 * IndexedDB, and only re-downloads when the version has changed. The file
 * is typically 80-120MB uncompressed.
 */
export async function assurerManifestAJour(
  onProgress?: (etape: string) => void
): Promise<Database> {
  const db = await ouvrirDB();
  const meta = await recupererMeta();
  const versionActuelle = await db.get("meta", "manifestVersion");

  const cacheBrut = await db.get("manifest", "sqlite");

  if (versionActuelle === meta.version && cacheBrut) {
    onProgress?.("Manifest déjà à jour (cache local)");
    const SQL = await obtenirModuleSql();
    return new SQL.Database(new Uint8Array(cacheBrut));
  }

  onProgress?.("Téléchargement du Manifest (FR)...");
  const chemin = meta.mobileWorldContentPaths["fr"] ?? meta.mobileWorldContentPaths["en"];
  const reponse = await fetch(`${BUNGIE_ROOT}${chemin}`);
  const arrayBuffer = await reponse.arrayBuffer();

  onProgress?.("Mise en cache locale (IndexedDB)...");
  await db.put("manifest", arrayBuffer, "sqlite");
  await db.put("meta", meta.version, "manifestVersion");

  const SQL = await obtenirModuleSql();
  return new SQL.Database(new Uint8Array(arrayBuffer));
}

/**
 * FR : ⚠️ Piège classique de l'API Bungie : les hash de definitions sont
 * des entiers NON SIGNES cote API, mais SQLite les stocke en INTEGER
 * SIGNE 32 bits dans la colonne `id`. Sans cette conversion, toute
 * recherche par hash > 2^31 (environ la moitie des hash) echoue
 * silencieusement (0 resultat, pas d'erreur).
 * EN: ⚠️ Classic Bungie API pitfall: definition hashes are UNSIGNED
 * integers on the API side, but SQLite stores them as SIGNED 32-bit
 * INTEGERs in the `id` column. Without this conversion, any lookup by a
 * hash > 2^31 (roughly half of all hashes) silently fails (0 results, no
 * error thrown).
 */
function hashVersIdSqlite(hash: number): number {
  return hash > 0x7fffffff ? hash - 0x100000000 : hash;
}

/** FR : Inverse de hashVersIdSqlite - reconstruit le hash non signé à partir de l'id SQLite. / EN: Inverse of hashVersIdSqlite - rebuilds the unsigned hash from the SQLite id. */
export function idSqliteVersHash(id: number): number {
  return id < 0 ? id + 0x100000000 : id;
}

/**
 * FR : OPTIMISATION - lecture ciblee d'UNE SEULE definition par hash, sans
 * charger toute la table en memoire. A utiliser des que possible plutot
 * que lireTable() : la table DestinyInventoryItemDefinition a par exemple
 * plusieurs dizaines de milliers d'entrees, la parser entierement en JS
 * pour ne lire qu'un ou quelques objets est inutilement lent et gourmand
 * en memoire.
 * EN: OPTIMIZATION - targeted read of a SINGLE definition by hash, without
 * loading the whole table into memory. Use this whenever possible instead
 * of lireTable(): the DestinyInventoryItemDefinition table for instance
 * has tens of thousands of entries, parsing it all in JS to read just one
 * or a few objects is needlessly slow and memory-hungry.
 */
export function obtenirDefinition<T>(db: Database, nomTable: string, hash: number): T | undefined {
  const stmt = db.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? (JSON.parse(stmt.getAsObject().json as string) as T) : undefined;
  stmt.free();
  return resultat;
}

/**
 * FR : Lit une table de definitions ENTIERE (ex: pour construire un index
 * de recherche local, comme la future table des verbes d'element). A
 * eviter pour un lookup ponctuel - preferer obtenirDefinition() dans ce cas.
 * EN: Reads an ENTIRE definitions table (e.g. to build a local search
 * index, like the future element-verb table). Avoid for a one-off lookup -
 * prefer obtenirDefinition() in that case.
 */
export function lireTable<T>(db: Database, nomTable: string): Record<string, T> {
  const resultat: Record<string, T> = {};
  const stmt = db.prepare(`SELECT id, json FROM ${nomTable}`);
  while (stmt.step()) {
    const row = stmt.getAsObject();
    resultat[String(row.id)] = JSON.parse(row.json as string);
  }
  stmt.free();
  return resultat;
}
