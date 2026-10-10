// FR : Moteur de scoring principal — agrège les 5 piliers (20% chacun) en
// un score global sur 100. Chaque fonction score* ci-dessous correspond à
// un pilier et renvoie un score 0-100 + des justifications lisibles.
// EN: Main scoring engine — aggregates the 5 pillars (20% each) into an
// overall score out of 100. Each score* function below corresponds to one
// pillar and returns a 0-100 score plus readable justifications.

import { BuildDraft, BuildScoreResult, PillarScore } from "../../types/build";
import { ExigenceStat, scoreStats, sommerStatsArmure } from "./stats";
import { scoreBonusSets } from "./armorSets";

const POIDS_PAR_PILIER = 0.2; // 5 piliers x 20% = 100%

/**
 * Pilier 1 - Élément & Doctrine : cohérence entre l'élément choisi et les
 * aspects/fragments/super de la sous-classe (ex: fragments qui exigent un
 * verbe d'un autre élément que celui de la sous-classe = incohérence, sauf
 * en Prismatique où le mélange est la règle).
 *
 * TODO: une fois le Manifest importé, comparer subclass.element aux
 * définitions réelles des aspects/fragments (leur `damageTypeHashes`) plutôt
 * que de se fier au seul choix déclaré par l'utilisateur.
 */
function scoreElementDoctrine(build: BuildDraft): PillarScore {
  const { subclass } = build;
  const details: string[] = [];
  let score = 100;

  const estPrismatique = subclass.element === "prismatique";
  const nbAspectsAttendu = estPrismatique ? 3 : 2;

  if (subclass.aspectHashes.length !== nbAspectsAttendu) {
    score -= 30;
    details.push(
      `Nombre d'aspects inhabituel (${subclass.aspectHashes.length}, attendu ${nbAspectsAttendu})`
    );
  } else {
    details.push(`Aspects : ${subclass.aspectHashes.length}/${nbAspectsAttendu} slots remplis`);
  }

  if (subclass.fragmentHashes.length === 0) {
    score -= 20;
    details.push("Aucun fragment sélectionné");
  }

  return { pilier: "element_doctrine", score: Math.max(0, score), poids: POIDS_PAR_PILIER, details };
}

/**
 * Pilier 2 - Verbes d'Élément : le build doit à la fois APPLIQUER un verbe
 * (source) et en TIRER PROFIT (payoff) pour ne pas juste "proc" dans le vide.
 *
 * TODO: construire la table verbe -> {sources possibles, payoffs possibles}
 * depuis les perks/aspects/fragments/mods du Manifest (texte des perks
 * `requirementDisplayString` + `investmentStats`), puis vérifier que le
 * build couvre au moins un couple source/payoff cohérent par verbe visé.
 */
function scoreVerbesElement(build: BuildDraft): PillarScore {
  const details: string[] = [
    "Moteur de détection des verbes (Scorched, Jolt, Devour, Sever, Volatile...) à brancher sur le Manifest — score provisoire",
  ];
  return { pilier: "verbes_element", score: 50, poids: POIDS_PAR_PILIER, details };
}

/**
 * Pilier 3 - Perks d'Artefact Saisonniers : depuis Monument of Triumph, les
 * artefacts ne sont plus saisonniers (7 fixes), mais le principe reste :
 * les perks sélectionnés doivent renforcer un verbe/mécanique déjà présent
 * dans le build plutôt qu'être choisis au hasard.
 *
 * TODO: croiser artifact.perkHashes avec les verbes/mécaniques détectés au
 * pilier 2 pour noter la synergie réelle plutôt que la simple présence.
 */
function scorePerksArtefact(build: BuildDraft): PillarScore {
  const details: string[] = [];
  const nbPerks = build.artifact.perkHashes.length;
  const score = nbPerks === 0 ? 0 : Math.min(100, 40 + nbPerks * 15);
  details.push(`${nbPerks} perk(s) d'artefact sélectionné(s)`);
  return { pilier: "perks_artefact", score, poids: POIDS_PAR_PILIER, details };
}

/**
 * FR : Pilier 4 - Loot & Cohérence : présence des pièces requises (exotique,
 * armes clés), absence de doublons/incohérences de build (ex: deux
 * exotiques d'armure), ET cohérence des bonus de Set d'armure (Armor 3.0)
 * avec le reste du build.
 * EN: Pillar 4 - Loot & Coherence: required pieces present (exotic, key
 * weapons), no duplicates/inconsistencies (e.g. two exotic armor pieces),
 * AND coherence of the equipped Armor Set bonuses (Armor 3.0) with the rest
 * of the build.
 */
function scoreLootCoherence(build: BuildDraft, motsClesBuild: string[] = []): PillarScore {
  const details: string[] = [];
  let score = 100;

  const exotiquesArmure = build.armure.filter((p) => p.isExotic).length;
  if (exotiquesArmure > 1) {
    score -= 100; // configuration illégale in-game
    details.push("Plus d'une pièce d'armure exotique équipée : configuration invalide");
  } else if (exotiquesArmure === 0) {
    score -= 20;
    details.push("Aucune armure exotique : bonus de build non exploité");
  } else {
    details.push("1 armure exotique équipée");
  }

  if (build.armes.length < 3) {
    score -= (3 - build.armes.length) * 15;
    details.push(`${build.armes.length}/3 emplacements d'armes remplis`);
  }

  // FR : Sous-score des bonus de Set d'armure, pondéré à 40% de ce pilier —
  // les sets restent un bonus, pas une obligation, d'où un poids modéré.
  // EN: Armor Set bonus sub-score, weighted at 40% of this pillar — sets
  // remain a bonus, not a requirement, hence the moderate weight.
  const { score: scoreSets, details: detailsSets } = scoreBonusSets(build.armure, motsClesBuild);
  details.push(...detailsSets);
  score = score * 0.6 + scoreSets * 0.4;

  return { pilier: "loot_coherence", score: Math.max(0, Math.round(score)), poids: POIDS_PAR_PILIER, details };
}

/**
 * Pilier 5 - Statistiques 2.0 : voir lib/scoring/stats.ts pour le détail des
 * paliers T1-T20 et des exigences d'exotiques (ex: Caresse du Ver -> T10 Grenade).
 */
function scoreStats2(stats: ReturnType<typeof sommerStatsArmure>, exigences: ExigenceStat[]): PillarScore {
  const { score, details } = scoreStats(stats, exigences);
  return { pilier: "stats_2_0", score, poids: POIDS_PAR_PILIER, details };
}

export function evaluerBuild(
  build: BuildDraft,
  exigencesExotiques: ExigenceStat[] = [],
  motsClesBuild: string[] = []
): BuildScoreResult {
  // FR : sommées une seule fois ici, réutilisées par le pilier 5 ET
  // renvoyées à l'appelant (l'UI n'a plus besoin de re-sommer les stats
  // pour son graphique - cf. DashboardPage.tsx).
  // EN: summed once here, reused by pillar 5 AND returned to the caller
  // (the UI no longer needs to re-sum stats for its chart - see
  // DashboardPage.tsx).
  const statsTotales = sommerStatsArmure(build.armure);

  const piliers = [
    scoreElementDoctrine(build),
    scoreVerbesElement(build),
    scorePerksArtefact(build),
    scoreLootCoherence(build, motsClesBuild),
    scoreStats2(statsTotales, exigencesExotiques),
  ];

  const scoreGlobal = Math.round(piliers.reduce((acc, p) => acc + p.score * p.poids, 0));

  return { buildId: build.id, scoreGlobal, piliers, statsTotales };
}
