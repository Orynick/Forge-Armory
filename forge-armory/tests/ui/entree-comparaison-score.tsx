// FR : ⚠️ AJOUT (27/10/2026, « travaille sur le lien entre stats simulées et score ») - page de test de l'AFFICHAGE `ComparaisonScore` (score réel → simulé, piliers et statistiques qui changent) : trois comparaisons CALCULÉES par `comparerScores` à partir de deux évaluations simulées à la main (hausse, baisse, aucun changement). / EN: ⚠️ ADDED - test page of the real → simulated score display.
import { createRoot } from "react-dom/client";
import ComparaisonScore from "../../src/components/ComparaisonScore";
import { comparerScores } from "../../src/lib/forge/scoreSimule";
import type { BuildScoreResult } from "../../src/types/build";

const ev = (global: number, stats: number, verbes: number, tot: Partial<Record<string, number>>): BuildScoreResult => ({
  buildId: "t", scoreGlobal: global,
  piliers: [{ pilier: "element_doctrine", score: 50, poids: 0.2, details: [] }, { pilier: "verbes_element", score: verbes, poids: 0.2, details: [] }, { pilier: "stats_2_0", score: stats, poids: 0.2, details: [] }],
  statsTotales: { sante: 60, melee: 40, grenade: 55, super: 70, classe: 30, arme: 90, ...tot } as never,
  completion: { taux: 100, manquants: [] } as never
});
const reel = ev(70, 55, 20, {});
const cas = { hausse: comparerScores(reel, ev(73, 63, 24, { grenade: 65, sante: 50 })), baisse: comparerScores(reel, ev(66, 40, 20, { sante: 40 })), nul: comparerScores(reel, reel) };
createRoot(document.getElementById("racine")!).render(
  <div style={{ width: 520, padding: 16, background: "#161922", color: "#e8e6df", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>
    <div id="hausse"><ComparaisonScore comparaison={cas.hausse} /></div>
    <div id="baisse"><ComparaisonScore comparaison={cas.baisse} /></div>
    <div id="nul"><ComparaisonScore comparaison={cas.nul} /></div>
  </div>
);
(window as unknown as { __pret: boolean }).__pret = true;
