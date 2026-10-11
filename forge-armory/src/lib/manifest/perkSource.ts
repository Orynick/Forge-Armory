// FR : Index INVERSE - pour un hash de perk/aspect/fragment donne, quels
// objets (armes/armures) l'utilisent ? Construit une seule fois par
// Manifest charge (mis en cache), en parcourant TOUTES les armes/armures
// et leurs sockets. Repond a la demande : "je trouve 'Visage redoute' en
// recherche, mais sur quel equipement est-ce ?"
//
// EN: REVERSE index - for a given perk/aspect/fragment hash, which items
// (weapons/armor) use it? Built once per loaded Manifest (cached), by
// scanning ALL weapons/armor and their sockets. Answers the need: "I find
// 'Visage of Dread' in search, but which piece of gear is it on?"

import { Database } from "sql.js";
import { obtenirDefinition, idSqliteVersHash } from "./download";
import { ouvrirDB } from "./db";
import { DestinyItemDefinition, DestinyPlugSetDefinition } from "../../types/manifest";
import { BUCKET_HASH_VERS_SLOT } from "../../data/constantesManifest";
import { SlotArme, SlotArmure } from "../../types/build";

export interface ObjetParent {
  hash: number;
  nom: string;
  slot: SlotArme | SlotArmure;
}

const CACHE_INDEX_INVERSE = new WeakMap<Database, Map<number, ObjetParent[]>>();
const CACHE_PLUGSETS = new WeakMap<Database, Map<number, number[]>>();

function resoudrePlugSet(db: Database, plugSetHash: number): number[] {
  let cache = CACHE_PLUGSETS.get(db);
  if (!cache) {
    cache = new Map();
    CACHE_PLUGSETS.set(db, cache);
  }
  if (!cache.has(plugSetHash)) {
    const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", plugSetHash);
    cache.set(plugSetHash, (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash));
  }
  return cache.get(plugSetHash)!;
}

function construireIndexEnMemoire(db: Database): Map<number, ObjetParent[]> {
  const index = new Map<number, ObjetParent[]>();
  // L'index de recherche persistant ne conserve plus les JSON complets.
  // Ici, on fait donc une lecture SQL directe : ce parcours est de toute
  // façon nécessaire pour construire l'index inverse plug -> objet.
  const stmt = db.prepare("SELECT id, json FROM DestinyInventoryItemDefinition");
  while (stmt.step()) {
    const ligne = stmt.getAsObject();
    const def: DestinyItemDefinition = JSON.parse(String(ligne.json));
    const slot = def.inventory?.bucketTypeHash !== undefined ? BUCKET_HASH_VERS_SLOT[def.inventory.bucketTypeHash] : undefined;
    if (!slot || !def.sockets?.socketEntries) continue;

    // FR : ⚠️ AJOUT (25/09/2026) - garde-fou : `ligne.id` vient d'une
    // requête SQL brute, donc typé large. Sans ce test, le build échoue
    // une fois les vrais types de sql.js installés (@types/sql.js).
    // EN: ⚠️ ADDED - guard: `ligne.id` comes from a raw SQL row, so it is
    // loosely typed; without this check the build fails once the real
    // sql.js types are installed.
    if (typeof ligne.id !== "number") continue;
    const hashObjet = idSqliteVersHash(ligne.id);
    const nom = def.displayProperties?.name ?? "(sans nom)";

    for (const entree of def.sockets.socketEntries) {
      let plugHashes: number[] = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      if (plugHashes.length === 0 && entree.reusablePlugSetHash) {
        plugHashes = resoudrePlugSet(db, entree.reusablePlugSetHash);
      }
      if (plugHashes.length === 0 && entree.singleInitialItemHash) {
        plugHashes = [entree.singleInitialItemHash];
      }
      for (const plugHash of plugHashes) {
        if (!index.has(plugHash)) index.set(plugHash, []);
        const liste = index.get(plugHash)!;
        if (!liste.some((o) => o.hash === hashObjet)) liste.push({ hash: hashObjet, nom, slot });
      }
    }
  }
  stmt.free();
  return index;
}

/**
 * FR : Construit (ou renvoie depuis le cache mémoire OU IndexedDB) l'index
 * inverse plugHash -> liste des armes/armures qui l'utilisent. ⚠️ CHANGÉ
 * (03/08/2026) : persiste maintenant le résultat dans IndexedDB (par
 * langue+version du Manifest), pour ne plus jamais refaire ce travail
 * tant que la version du Manifest ne change pas. Devenu asynchrone.
 * EN: Builds (or returns from memory cache OR IndexedDB) the reverse
 * index plugHash -> list of weapons/armor that use it. ⚠️ CHANGED
 * (2026-08-03): now persists the result to IndexedDB (per language +
 * Manifest version), to never redo this work again as long as the
 * Manifest version hasn't changed. Now async.
 */
export async function construireIndexInversePerks(db: Database, langue: string, version: string): Promise<Map<number, ObjetParent[]>> {
  const dejaEnMemoire = CACHE_INDEX_INVERSE.get(db);
  if (dejaEnMemoire) return dejaEnMemoire;

  const idbDb = await ouvrirDB();
  const cle = `perkSource_${langue}_${version}`;
  try {
    const brut = await idbDb.get("searchIndex", cle);
    if (brut) {
      const index = new Map<number, ObjetParent[]>(JSON.parse(brut));
      CACHE_INDEX_INVERSE.set(db, index);
      return index;
    }
  } catch {
    // FR : lecture échouée - on reconstruit normalement.
  }

  const index = construireIndexEnMemoire(db);
  CACHE_INDEX_INVERSE.set(db, index);
  idbDb.put("searchIndex", JSON.stringify(Array.from(index.entries())), cle).catch(() => {});
  return index;
}

/** FR : accès synchrone au cache déjà construit (pour l'affichage au survol des résultats) - vide tant que construireIndexInversePerks n'a pas fini. / EN: synchronous access to the already-built cache (for hover display on results) - empty until construireIndexInversePerks has finished. */
export function obtenirIndexInversePerksEnCache(db: Database): Map<number, ObjetParent[]> {
  return CACHE_INDEX_INVERSE.get(db) ?? new Map();
}
