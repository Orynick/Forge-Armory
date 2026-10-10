import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "d2-build-analyzer";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function ouvrirDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("manifest")) db.createObjectStore("manifest");
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("builds")) db.createObjectStore("builds", { keyPath: "id" });
        if (!db.objectStoreNames.contains("inventaireCache")) db.createObjectStore("inventaireCache");
      },
    });
  }
  return dbPromise!;
}
