// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - fait RÉAFFICHER les icônes de saison quand le balayage en arrière-plan « filigrane → saison » se termine (les noms déduits apparaissent alors). Un `useSyncExternalStore` sur la version du balayage du Manifest ; sans Manifest, rien. EN: ⚠️ ADDED - re-renders season icons when the background scan ends.
import { useMemo, useSyncExternalStore } from "react";
import type { Database } from "sql.js";
import { abonnerSaisons, versionSaisons } from "../lib/manifest/saison";

const aucun = () => () => {};
export function useVersionSaisons(db?: Database | null): number {
  const abonner = useMemo(() => (db ? (rappel: () => void) => abonnerSaisons(db, rappel) : aucun), [db]);
  return useSyncExternalStore(abonner, () => (db ? versionSaisons(db) : 0));
}
