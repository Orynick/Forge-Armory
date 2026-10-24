// FR : Telechargement, cache et lecture du Manifest Destiny (base SQLite).
// EN: Download, caching and reading of the Destiny Manifest (SQLite DB).

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import { unzipSync } from "fflate";
// FR : Import natif Vite - retourne l'URL réelle et fiable du fichier .wasm,
// aussi bien en développement qu'à la compilation finale. Remplace l'ancien
// chemin statique deviné ("/sql-wasm.wasm") qui échouait en développement.
// EN: Native Vite import - returns the real, reliable URL of the .wasm
// file, both in development and in the final build. Replaces the old
// guessed static path ("/sql-wasm.wasm") which failed in development.
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
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
  if (!reponse.ok) {
    throw new Error(
      reponse.status === 401
        ? "Clé API Bungie refusée (401). Vérifiez VITE_BUNGIE_API_KEY."
        : `Impossible de récupérer les informations du Manifest (${reponse.status}).`
    );
  }
  const data = await reponse.json();
  if (!data.Response?.version || !data.Response?.mobileWorldContentPaths) {
    throw new Error("Réponse Bungie invalide : informations du Manifest absentes.");
  }
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
    sqlModulePromise = initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlModulePromise!;
}

/**
 * FR : Telecharge le Manifest (base SQLite compressee) dans la langue
 * demandee (français par defaut, comportement inchange), la met en cache
 * dans IndexedDB (une entree separee par langue - télécharger l'anglais en
 * plus ne supprime pas le cache français), et ne re-telecharge que si la
 * version a change. Le fichier fait typiquement 80-120 Mo decompresse.
 *
 * ⚠️ AJOUT (02/08/2026) : le hash d'une définition est identique quelle
 * que soit la langue - télécharger aussi le Manifest anglais permet de
 * faire correspondre du texte anglais (ex: une base de connaissance externe
 * en anglais) → hash → puis d'afficher le texte français de ce même hash
 * dans l'appli. Le cache par langue change de clé (`sqlite_<langue>` au
 * lieu de `sqlite`) : le cache existant sera re-téléchargé une fois après
 * cette mise à jour, c'est normal.
 *
 * EN: Downloads the Manifest (compressed SQLite DB) in the requested
 * language (French by default, unchanged behavior), caches it in IndexedDB
 * (a separate entry per language - downloading English too does not erase
 * the French cache), and only re-downloads when the version has changed.
 * The file is typically 80-120MB uncompressed.
 *
 * ⚠️ ADDED (2026-08-02): a definition's hash is identical regardless of
 * language - also downloading the English Manifest lets you match English
 * text (e.g. an external English knowledge base) → hash → then display
 * that same hash's French text in the app. The per-language cache changes
 * key (`sqlite_<language>` instead of `sqlite`): the existing cache will
 * be re-downloaded once after this update, that's expected.
 */
// FR : ⚠️ Version du FORMAT de cache (pas celle du Manifest lui-même).
// À incrémenter chaque fois que la façon de lire/stocker le cache change
// (ex: le correctif ZIP du 02/08/2026) - sans ça, un cache déjà écrit avec
// l'ancienne logique (ici : jamais décompressé) continue d'être réutilisé
// tel quel, même après correction du code, puisque la version du Manifest
// Bungie, elle, n'a pas changé. Incrémenter force un re-téléchargement
// propre pour tout le monde, une seule fois.
// EN: ⚠️ Cache FORMAT version (not the Manifest's own version). Increment
// whenever how the cache is read/stored changes (e.g. the 2026-08-02 ZIP
// fix) - without this, a cache already written with the old logic (here:
// never unzipped) keeps being reused as-is even after the code is fixed,
// since Bungie's own Manifest version hasn't changed. Incrementing forces
// a clean one-time re-download for everyone.
const VERSION_FORMAT_CACHE = "v2";

export interface ResultatManifest {
  db: Database;
  version: string;
}

// FR : ⚠️ AJOUT (04/08/2026) - cache en MÉMOIRE VIVE de l'instance Database,
// par langue. Question de l'utilisateur : « l'indexation se refait-elle à
// chaque vérification du Manifest ? » Réponse : OUI, et c'était un vrai
// défaut. Même quand la version n'avait pas changé, `new SQL.Database(...)`
// créait un NOUVEL objet à partir des mêmes octets — et comme INDEX_SETS,
// cacheDefinitionsParDb et cacheDamageTypeParDb sont des WeakMap indexées sur
// l'IDENTITÉ de cet objet (pas sur la version), tous ces index se
// reconstruisaient à chaque reconnexion, sans changement réel.
// EN: ⚠️ ADDED - IN-MEMORY cache of the open Database instance, per language.
// Even with an unchanged version, a NEW object was created from the same
// bytes, and since the index caches are WeakMaps keyed by that object's
// IDENTITY, every index rebuilt on every reconnect.
const instancesOuvertes = new Map<string, { version: string; db: Database }>();
const chargementsEnCours = new Map<string, Promise<ResultatManifest>>();

// FR : ⚠️ RETIRÉ (23/10/2026, audit) - `manifestsEnCacheAJour` : AUCUN appelant en production (seul un test l'appelait, en l'appelant lui-même « ancienne fonction »). La logique vivante est dans `etatCachesManifests` (appelée par le démarrage). / EN: ⚠️ REMOVED - dead code, no production caller.

/**
 * FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - état de CHAQUE langue en cache, pour décider au démarrage (demande de l'utilisateur : « si le Manifest est périmé, et uniquement dans ce cas, téléchargement du nouveau »).
 *   - `a-jour`  : le fichier est en cache ET sa version est celle que Bungie annonce aujourd'hui ;
 *   - `perime`  : le fichier est en cache mais d'une AUTRE version (ou sa version est inconnue) : c'est le seul cas qui déclenche un téléchargement automatique ;
 *   - `absent`  : aucun fichier en cache (premier lancement pour cette langue) : RIEN n'est « périmé », le téléchargement reste déclenché par un clic.
 * Renvoie `null` si l'état ne peut pas être établi (hors ligne, Bungie indisponible, IndexedDB inaccessible) : l'appelant ne fait alors rien. Ne télécharge JAMAIS : un petit appel pour la version et une lecture de CLÉ. `dependances` n'est remplacé que par les tests.
 * EN: ⚠️ ADDED - state of EACH cached language: up to date, outdated (cached but another version: the ONLY case that triggers an automatic download) or absent (nothing is outdated). `null` when it cannot be established. Never downloads.
 */
export type EtatCacheManifest = "a-jour" | "perime" | "absent";
export interface DependancesCacheManifest {
  recupererMeta: () => Promise<{ version: string }>;
  ouvrirDB: () => Promise<{
    get: (magasin: string, cle: string) => Promise<unknown>;
    getKey: (magasin: string, cle: string) => Promise<unknown>;
    put: (magasin: string, valeur: unknown, cle: string) => Promise<unknown>;
  }>;
}
const DEPENDANCES_CACHE_REELLES: DependancesCacheManifest = {
  recupererMeta,
  ouvrirDB: ouvrirDB as unknown as DependancesCacheManifest["ouvrirDB"],
};

export async function etatCachesManifests(
  langues: string[] = ["fr", "en"],
  dependances: DependancesCacheManifest = DEPENDANCES_CACHE_REELLES
): Promise<Record<string, EtatCacheManifest> | null> {
  try {
    const meta = await dependances.recupererMeta();
    const db = await dependances.ouvrirDB();
    const etat: Record<string, EtatCacheManifest> = {};
    for (const langue of langues) {
      const versionCache = await db.get("meta", `manifestVersion_${langue}_${VERSION_FORMAT_CACHE}`);
      const cle = await db.getKey("manifest", `sqlite_${langue}_${VERSION_FORMAT_CACHE}`);
      etat[langue] = cle === undefined ? "absent" : versionCache === meta.version ? "a-jour" : "perime";
    }
    return etat;
  } catch {
    return null;
  }
}

/**
 * FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - OUTIL DE TEST (mode développement seulement, bouton « 🧪 Manifest périmé (test) ») : marque comme périmée la version du cache des langues DÉJÀ en cache, sans toucher au fichier. Au prochain démarrage (Ctrl+F5), l'appli croit son Manifest périmé et le télécharge pour de bon : cela permet d'essayer la mise à jour
 * automatique de bout en bout sans attendre que Bungie publie une nouvelle version. Inoffensif : le téléchargement suivant remet la vraie version. Renvoie les langues marquées. EN: ⚠️ ADDED - dev-only test helper: marks the cached versions as outdated.
 */
export async function simulerManifestPerime(
  langues: string[] = ["fr", "en"],
  dependances: DependancesCacheManifest = DEPENDANCES_CACHE_REELLES
): Promise<string[]> {
  const db = await dependances.ouvrirDB();
  const marquees: string[] = [];
  for (const langue of langues) {
    if ((await db.getKey("manifest", `sqlite_${langue}_${VERSION_FORMAT_CACHE}`)) === undefined) continue;
    await db.put("meta", "version-simulee-pour-test", `manifestVersion_${langue}_${VERSION_FORMAT_CACHE}`);
    marquees.push(langue);
  }
  return marquees;
}

export function assurerManifestAJour(
  onProgress?: (etape: string) => void,
  langue: string = "fr"
): Promise<ResultatManifest> {
  const dejaEnCours = chargementsEnCours.get(langue);
  if (dejaEnCours) return dejaEnCours;

  const promesse = assurerManifestAJourInterne(onProgress, langue);
  chargementsEnCours.set(langue, promesse);
  return promesse.finally(() => {
    if (chargementsEnCours.get(langue) === promesse) chargementsEnCours.delete(langue);
  });
}

async function assurerManifestAJourInterne(
  onProgress?: (etape: string) => void,
  langue: string = "fr"
): Promise<ResultatManifest> {
  const meta = await recupererMeta();

  // FR : court-circuit le plus rapide — instance déjà en mémoire pour cette
  // langue ET cette version exacte : aucun accès IndexedDB, aucune
  // reconstruction d'index.
  const dejaOuverte = instancesOuvertes.get(langue);
  if (dejaOuverte && dejaOuverte.version === meta.version) {
    onProgress?.(`Manifest (${langue.toUpperCase()}) déjà en mémoire — aucune reconstruction`);
    return { db: dejaOuverte.db, version: meta.version };
  }

  const db = await ouvrirDB();
  const cleVersion = `manifestVersion_${langue}_${VERSION_FORMAT_CACHE}`;
  const cleSqlite = `sqlite_${langue}_${VERSION_FORMAT_CACHE}`;
  const versionActuelle = await db.get("meta", cleVersion);

  const cacheBrut = await db.get("manifest", cleSqlite);

  if (versionActuelle === meta.version && cacheBrut) {
    onProgress?.(`Manifest (${langue.toUpperCase()}) déjà à jour (cache local)`);
    const SQL = await obtenirModuleSql();
    const instance = new SQL.Database(new Uint8Array(cacheBrut));
    instancesOuvertes.set(langue, { version: meta.version, db: instance });
    return { db: instance, version: meta.version };
  }

  onProgress?.(`Téléchargement du Manifest (${langue.toUpperCase()})...`);
  const chemin = meta.mobileWorldContentPaths[langue] ?? meta.mobileWorldContentPaths["en"];
  if (!chemin) throw new Error(`Aucun chemin de Manifest disponible pour la langue "${langue}".`);
  const reponse = await fetch(`${BUNGIE_ROOT}${chemin}`);
  if (!reponse.ok) throw new Error(`Téléchargement du Manifest échoué (${reponse.status}).`);
  const arrayBufferZip = await reponse.arrayBuffer();

  // FR : ⚠️ BUG TROUVÉ ET CORRIGÉ (02/08/2026) : le fichier téléchargé par
  // Bungie à cette adresse est en réalité une ARCHIVE ZIP contenant la
  // base SQLite (nommée ".content" dans l'archive), pas la base directement.
  // L'ouvrir tel quel avec sql.js provoquait l'erreur "file is not a
  // database" (les octets ZIP ne correspondent pas au format SQLite). On
  // décompresse maintenant avant de mettre en cache / d'ouvrir.
  // EN: ⚠️ BUG FOUND AND FIXED (2026-08-02): the file Bungie serves at this
  // address is actually a ZIP ARCHIVE containing the SQLite database
  // (named ".content" inside the archive), not the database directly.
  // Opening it as-is with sql.js caused the "file is not a database" error
  // (ZIP bytes don't match the SQLite format). We now unzip before
  // caching / opening.
  onProgress?.("Décompression du Manifest...");
  const fichiers = unzipSync(new Uint8Array(arrayBufferZip));
  const nomsFichiers = Object.keys(fichiers);
  if (nomsFichiers.length === 0) {
    throw new Error("Archive du Manifest vide ou invalide (aucun fichier à l'intérieur)");
  }
  // FR : l'archive ne contient normalement qu'un seul fichier (peu importe
  // son nom exact) - on prend le premier/le plus gros par sécurité.
  // EN: the archive normally contains only one file (regardless of its
  // exact name) - we take the first/largest one for safety.
  const nomFichierSqlite = nomsFichiers.reduce((plusGros, nom) =>
    fichiers[nom].length > fichiers[plusGros].length ? nom : plusGros
  );
  const arrayBuffer = fichiers[nomFichierSqlite].slice().buffer;

  onProgress?.("Mise en cache locale (IndexedDB)...");
  await db.put("manifest", arrayBuffer, cleSqlite);
  await db.put("meta", meta.version, cleVersion);

  const SQL = await obtenirModuleSql();
  const instance = new SQL.Database(new Uint8Array(arrayBuffer));
  instancesOuvertes.set(langue, { version: meta.version, db: instance });
  return { db: instance, version: meta.version };
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
export function hashVersIdSqlite(hash: number): number {
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
// FR : ⚠️ AJOUT (04/08/2026, optimisation) - `obtenirDefinition` est la
// fonction de base utilisée par QUASIMENT tout le reste du code
// (infobulles, popup Détails, Doctrine...), mais ne mettait jusqu'ici
// JAMAIS en cache ses résultats : chaque appel relançait une requête SQL
// complète, même pour un hash déjà lu l'instant d'avant. Vu le nombre
// d'appels en cascade (ex: survol d'une infobulle exotique = dizaines de
// requêtes pour les mêmes hash), c'est un vrai gain de performance.
// Cache léger par Manifest chargé (WeakMap, libéré automatiquement si le
// Manifest est déchargé), clé = table+hash.
// EN: ⚠️ ADDED (2026-08-04, optimization) - `obtenirDefinition` is the
// base function used by ALMOST everything else (tooltips, Details popup,
// Doctrine...), but until now NEVER cached its results: every call
// re-ran a full SQL query, even for a hash already read a moment before.
// Given the number of cascading calls (e.g. hovering an exotic tooltip =
// dozens of queries for the same hashes), this is a real performance
// win. Lightweight cache per loaded Manifest (WeakMap, auto-released if
// the Manifest is unloaded), key = table+hash.
const cacheDefinitionsParDb = new WeakMap<Database, Map<string, unknown>>();

export function obtenirDefinition<T>(db: Database, nomTable: string, hash: number): T | undefined {
  let cache = cacheDefinitionsParDb.get(db);
  if (!cache) {
    cache = new Map();
    cacheDefinitionsParDb.set(db, cache);
  }
  const cle = `${nomTable}:${hash}`;
  if (cache.has(cle)) return cache.get(cle) as T | undefined;

  const stmt = db.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? (JSON.parse(stmt.getAsObject().json as string) as T) : undefined;
  stmt.free();

  cache.set(cle, resultat);
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

// FR : ⚠️ AJOUT (04/08/2026) - télécharge les Manifests FR et EN et les
// enregistre en tant que FICHIERS sur le PC, via le mécanisme de
// téléchargement du navigateur. Réservé au mode développement (voir
// l'appel côté RechercheManifest) : ça ne sert qu'au débogage, pas aux
// invités.
//
// ⚠️ IMPORTANT sur l'emplacement des fichiers : une page web N'A PAS le
// droit de choisir le dossier de destination (sécurité du navigateur).
// Les fichiers atterrissent donc dans le dossier de TÉLÉCHARGEMENTS
// habituel du navigateur - typiquement C:\Users\<vous>\Downloads sous
// Windows - et surtout PAS dans les dossiers du jeu ni du projet. C'est
// exactement pour ça que l'utilisateur ne les trouvait pas côté jeu.
// Pour les déposer directement dans le projet, utiliser plutôt le script
// `node scripts/telecharger-manifest.mjs` (dossier `manifest-local/`).
//
// EN: ⚠️ ADDED (2026-08-04) - downloads the FR and EN Manifests and saves
// them as FILES on the PC, through the browser's download mechanism.
// Development mode only (see the call site in RechercheManifest): it's a
// debugging aid, not something guests need.
//
// ⚠️ IMPORTANT about file location: a web page is NOT allowed to choose
// the destination folder (browser security). Files therefore land in the
// browser's usual DOWNLOADS folder - typically C:\Users\<you>\Downloads on
// Windows - and definitely NOT in the game's or the project's folders.
// That's exactly why the user couldn't find them on the game side. To put
// them straight into the project, use the `node
// scripts/telecharger-manifest.mjs` script instead (`manifest-local/`).
export async function telechargerManifestsEnFichiers(
  onProgress?: (message: string) => void
): Promise<{ version: string; fichiers: string[] }> {
  onProgress?.("Récupération des informations du Manifest...");
  const reponseMeta = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Manifest/`, {
    headers: { "X-API-Key": bungieConfig.apiKey },
  });
  if (!reponseMeta.ok) {
    throw new Error(
      reponseMeta.status === 401
        ? "Clé API refusée par Bungie (401). Vérifiez VITE_BUNGIE_API_KEY dans .env.local."
        : `Bungie a répondu ${reponseMeta.status} à la demande d'informations.`
    );
  }
  const meta = (await reponseMeta.json()).Response as ManifestMeta;
  const fichiersEcrits: string[] = [];

  for (const langue of ["fr", "en"] as const) {
    const chemin = meta.mobileWorldContentPaths[langue];
    if (!chemin) {
      onProgress?.(`Aucun Manifest disponible pour "${langue}" — ignoré.`);
      continue;
    }

    onProgress?.(`Téléchargement du Manifest ${langue.toUpperCase()} (~100-200 Mo)...`);
    const reponse = await fetch(`${BUNGIE_ROOT}${chemin}`, {
      headers: { "X-API-Key": bungieConfig.apiKey },
    });
    if (!reponse.ok) {
      onProgress?.(`Échec du téléchargement ${langue.toUpperCase()} (${reponse.status}) — ignoré.`);
      continue;
    }
    const zip = new Uint8Array(await reponse.arrayBuffer());

    // FR : même piège que pour le chargement normal - c'est un ZIP, pas
    // du SQLite brut (voir le commentaire détaillé plus haut).
    onProgress?.(`Décompression du Manifest ${langue.toUpperCase()}...`);
    const fichiers = unzipSync(zip);
    const noms = Object.keys(fichiers);
    if (noms.length === 0) {
      onProgress?.(`Archive ${langue.toUpperCase()} vide — ignorée.`);
      continue;
    }
    const nomPlusGros = noms.reduce((a, b) => (fichiers[b].length > fichiers[a].length ? b : a));
    const donnees = fichiers[nomPlusGros];

    const nomFichier = `manifest-${langue}.sqlite`;
    const blob = new Blob([donnees as BlobPart], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    // FR : on libère l'URL après un court délai - la révoquer trop tôt
    // annulerait le téléchargement en cours dans certains navigateurs.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    fichiersEcrits.push(nomFichier);
    onProgress?.(`${nomFichier} envoyé vers vos téléchargements.`);
  }

  return { version: meta.version, fichiers: fichiersEcrits };
}
