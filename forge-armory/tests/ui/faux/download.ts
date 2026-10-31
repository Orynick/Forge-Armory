// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - DOUBLE de `lib/manifest/download` pour les pages de test : réutilise le VRAI module (tout est ré-exporté tel quel) et ne remplace QUE ce qui touche au réseau et au disque (état des caches, téléchargement d'une langue, simulation), et SEULEMENT quand la page a défini un scénario `window.__manifest` ; sinon il délègue au vrai code.
// Scénario : { etat (état des caches renvoyé), delaiEtat, delai (durée du « téléchargement »), echec, cachePresent, appels (langues demandées, journal), simulations }. EN: ⚠️ ADDED - test double of the download module: re-exports the real one, overrides only network/disk parts when a scenario is defined.
import * as reel from "../../../src/lib/manifest/download.ts";
export * from "../../../src/lib/manifest/download.ts";

interface Scenario { etat: unknown; delaiEtat?: number; delai?: number; echec?: boolean; cachePresent?: string[]; appels: string[]; simulations: string[][] }
const scenario = () => (window as unknown as { __manifest?: Scenario }).__manifest;
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const etatCachesManifests: typeof reel.etatCachesManifests = async (...a) => {
  const s = scenario(); if (!s) return reel.etatCachesManifests(...a);
  await attendre(s.delaiEtat ?? 250); return s.etat as never;
};
export const assurerManifestAJour: typeof reel.assurerManifestAJour = async (onProgress, langue = "fr") => {
  const s = scenario(); if (!s) return reel.assurerManifestAJour(onProgress, langue);
  s.appels.push(langue); onProgress?.(`Téléchargement du Manifest (${langue.toUpperCase()})...`);
  await attendre(s.delai ?? 300);
  if (s.echec) throw new Error("Téléchargement du Manifest échoué (503).");
  return { db: { faux: langue } as never, version: "V-test" };
};
export const simulerManifestPerime: typeof reel.simulerManifestPerime = async (...a) => {
  const s = scenario(); if (!s) return reel.simulerManifestPerime(...a);
  const marquees = s.cachePresent ?? ["fr"]; s.simulations.push(marquees); return marquees;
};
