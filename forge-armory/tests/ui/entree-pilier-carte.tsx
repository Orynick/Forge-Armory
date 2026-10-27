// FR : ⚠️ AJOUT (27/10/2026) - page de test de l'AFFICHAGE du badge « simulé » dans la carte du pilier « Effets du Build » (`PilierCarte`) : les lignes de détail sont CALCULÉES par le vrai `scoreVerbesDetectes` (marqueur inclus) à partir de textes d'effets, avec ou sans noms simulés ; un pilier sans rapport (statistiques) vérifie que rien d'autre ne change. / EN: ⚠️ ADDED - test page of the "simulated" badge in the pillar card.
import { createRoot } from "react-dom/client";
import PilierCarte from "../../src/components/PilierCarte";
import { detecterVerbes, scoreVerbesDetectes } from "../../src/lib/scoring/verbes";
import type { PillarScore } from "../../src/types/build";

const textes = ["Mod de grenade solaire — Les grenades infligent Blessure solaire aux cibles.", "Siphon quelconque — Les cibles touchées par vos armes subissent Blessure solaire."];
const cachee = ["Blessure solaire — Les cibles touchées subissent Blessure solaire."];
const carte = (details: string[]): PillarScore => ({ pilier: "verbes_element", score: 24, poids: 0.3, details });
const avec = scoreVerbesDetectes(detecterVerbes(textes), new Set(["Mod de grenade solaire"])).details;
const sans = scoreVerbesDetectes(detecterVerbes(textes)).details;
const cacheeSim = scoreVerbesDetectes(detecterVerbes(cachee), new Set(["Blessure solaire"])).details;
createRoot(document.getElementById("racine")!).render(
  <div style={{ width: 560, padding: 16, background: "#161922", color: "#e8e6df", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>
    <div id="avec"><PilierCarte pilier={carte(avec)} /></div>
    <div id="sans"><PilierCarte pilier={carte(sans)} /></div>
    <div id="cachee"><PilierCarte pilier={carte(cacheeSim)} /></div>
    <div id="stats"><PilierCarte pilier={{ pilier: "stats_2_0", score: 17, poids: 0.25, details: ["Santé : T6", "  Grenade : T3"] }} /></div>
  </div>
);
(window as unknown as { __pret: boolean }).__pret = true;
