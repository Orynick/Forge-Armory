// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - DOUBLE de `lib/manifest/search` pour les pages de test : tout est ré-exporté tel quel ; seule l'INDEXATION d'un Manifest est neutralisée quand la page définit un scénario `window.__manifest` (la base y est factice). EN: ⚠️ ADDED - test double: indexing is a no-op when a scenario is defined.
import * as reel from "../../../src/lib/manifest/search.ts";
export * from "../../../src/lib/manifest/search.ts";
export const indexerManifest: typeof reel.indexerManifest = async (...a) => {
  if ((window as unknown as { __manifest?: unknown }).__manifest) return;
  return reel.indexerManifest(...a);
};
