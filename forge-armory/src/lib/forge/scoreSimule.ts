// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « travaille sur le lien entre stats simulées et score » - COMPARAISON PURE du score RÉEL et du score SIMULÉ d'un même build, pour que la simulation se VOIE dans le score : score global, piliers qui changent, statistiques totales qui changent. Le lien lui-même existait déjà (`appliquerSimulations` recalcule les statistiques des armures simulées et le score se calcule sur ce build) mais il n'était visible nulle part : seul un bandeau disait « score calculé avec des mods simulés ».
// EN: ⚠️ ADDED - PURE comparison of the REAL and SIMULATED score of the same build, so the simulation SHOWS in the score.
import type { BuildScoreResult, StatKey } from "../../types/build";

export interface ChangementPilier { pilier: BuildScoreResult["piliers"][number]["pilier"]; reel: number; simule: number; delta: number }
export interface ChangementStat { stat: StatKey; reel: number; simule: number; delta: number }
export interface ComparaisonScore {
  reel: number;
  simule: number;
  delta: number;
  /** FR : uniquement les piliers dont le score a changé, dans l'ordre du résultat. */
  piliers: ChangementPilier[];
  /** FR : uniquement les statistiques totales du build qui ont changé, dans l'ordre Santé…Arme. */
  stats: ChangementStat[];
}
const ORDRE: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];

/** FR : compare deux évaluations du MÊME build (réel, puis avec la simulation appliquée). `delta` = simulé − réel. / EN: compares two evaluations of the SAME build. */
export function comparerScores(reel: BuildScoreResult, simule: BuildScoreResult): ComparaisonScore {
  const piliers: ChangementPilier[] = [];
  for (const p of simule.piliers) {
    const avant = reel.piliers.find((x) => x.pilier === p.pilier);
    if (avant && avant.score !== p.score) piliers.push({ pilier: p.pilier, reel: avant.score, simule: p.score, delta: p.score - avant.score });
  }
  const stats: ChangementStat[] = [];
  for (const k of ORDRE) {
    const a = reel.statsTotales?.[k] ?? 0, b = simule.statsTotales?.[k] ?? 0;
    if (a !== b) stats.push({ stat: k, reel: a, simule: b, delta: b - a });
  }
  return { reel: reel.scoreGlobal, simule: simule.scoreGlobal, delta: simule.scoreGlobal - reel.scoreGlobal, piliers, stats };
}
