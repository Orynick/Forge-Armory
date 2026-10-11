import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "d2-build-analyzer";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function ouvrirDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("manifest")) db.createObjectStore("manifest");
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("builds")) db.createObjectStore("builds", { keyPath: "id" });
        if (!db.objectStoreNames.contains("inventaireCache")) db.createObjectStore("inventaireCache");
        // FR : ⚠️ AJOUT (03/08/2026) - persiste l'index de recherche déjà
        // construit (texte normalisé) pour éviter de le refaire à CHAQUE
        // session (avant : seuls les octets bruts du Manifest étaient mis
        // en cache, mais l'indexation - coûteuse - se refaisait à chaque
        // fois qu'on relançait l'appli).
        // EN: ⚠️ ADDED (2026-08-03) - persists the already-built search
        // index (normalized text) to avoid redoing it EVERY session
        // (before: only the Manifest's raw bytes were cached, but
        // indexing - costly - was redone every time the app restarted).
        if (!db.objectStoreNames.contains("searchIndex")) db.createObjectStore("searchIndex");
      },
    });
  }
  return dbPromise!;
}
