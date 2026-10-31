// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - DOUBLE de `lib/manifest/perkSource` pour les pages de test : tout est ré-exporté tel quel ; seule la CONSTRUCTION de l'index inversé est neutralisée quand la page définit un scénario `window.__manifest`. EN: ⚠️ ADDED - test double: reverse-index building is a no-op when a scenario is defined.
import * as reel from "../../../src/lib/manifest/perkSource.ts";
export * from "../../../src/lib/manifest/perkSource.ts";
export const construireIndexInversePerks: typeof reel.construireIndexInversePerks = async (...a) => {
  if ((window as unknown as { __manifest?: unknown }).__manifest) return new Map();
  return reel.construireIndexInversePerks(...a);
};
