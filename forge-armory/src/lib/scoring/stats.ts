import { GearPiece, StatBlock, StatKey } from "../../types/build";

/**
 * FR : Additionne les stats de toutes les pièces d'un tableau d'armure.
 * Utilisée à la fois par le moteur de scoring et par l'affichage (graphique).
 * ⚠️ CORRIGÉ (23/10/2026, audit) : les emplacements VIDES (`itemHash: 0`,
 * les placeholders du build de démonstration) sont IGNORÉS — un emplacement
 * vide ne doit apporter aucune stat (sinon l'état « vide » du premier
 * lancement affichait 370 pts fantômes).
 * EN: Sums the stats of every piece in an armor array. Used by both the
 * scoring engine and the display (chart). ⚠️ FIXED - empty slots
 * (`itemHash: 0`, the demo build's placeholders) are ignored.
 */
export function sommerStatsArmure(armure: GearPiece[]): StatBlock {
  return armure.reduce(
    (acc, piece) => {
      // FR : un emplacement vide (placeholder, itemHash: 0) n'apporte rien.
      // EN: an empty slot (placeholder, itemHash: 0) contributes nothing.
      if (piece.itemHash === 0) return acc;
      for (const [cle, valeur] of Object.entries(piece.stats)) {
        acc[cle as StatKey] = (acc[cle as StatKey] ?? 0) + (valeur ?? 0);
      }
      return acc;
    },
    { sante: 0, melee: 0, grenade: 0, super: 0, classe: 0, arme: 0 } as StatBlock
  );
}

/**
 * Armor 3.0 (Monument of Triumph, juin 2026) : une pièce Tier 5 masterworkée
 * donne 30 pts sur sa stat primaire / 25 sur la secondaire / 20 sur la
 * tertiaire, +5 sur les 3 autres via le masterwork. Le cumul sur 5 pièces +
 * mods + fragments peut largement dépasser 100 sur une stat.
 *
 * On garde ici le découpage en paliers de 10 pts (T1 = 1-10, T2 = 11-20, ...)
 * demandé, en le rendant configurable plutôt que figé à 200, au cas où
 * Bungie retouche encore les caps (le cap de bonus de cooldown est par
 * exemple passé de 190% à 125% avec cette même mise à jour).
 */
export const STAT_TIER_SIZE = 10;
export const STAT_MAX = 200;
export const STAT_MAX_TIER = STAT_MAX / STAT_TIER_SIZE; // T20

export function palier(valeur: number): number {
  const v = Math.max(0, Math.min(valeur, STAT_MAX));
  return Math.min(Math.ceil(v / STAT_TIER_SIZE), STAT_MAX_TIER) || (v > 0 ? 1 : 0);
}

export function libellePalier(valeur: number): string {
  return `T${palier(valeur)}`;
}

/** Exigence de stat minimale posée par une pièce exotique (ex: Caresse du Ver -> Grenade >= T10) */
export interface ExigenceStat {
  stat: StatKey;
  palierMinimum: number; // ex: 10 pour "au moins T10"
  sourceExotique: string; // nom lisible, pour affichage/justification
}

export function verifieExigences(
  stats: StatBlock,
  exigences: ExigenceStat[]
): { exigence: ExigenceStat; validee: boolean; palierActuel: number }[] {
  return exigences.map((exigence) => {
    const palierActuel = palier(stats[exigence.stat] ?? 0);
    return {
      exigence,
      validee: palierActuel >= exigence.palierMinimum,
      palierActuel,
    };
  });
}

/**
 * Score 0-100 du pilier "Statistiques 2.0" : moyenne des paliers atteints
 * (normalisée sur T20) + pénalité si une exigence d'exotique n'est pas
 * remplie (le bonus du 5e pilier n'est alors pas validé pour cette pièce).
 */
/**
 * FR : contexte d'usage du build. Fait varier le poids des piliers ET celui de
 * chaque statistique — un T20 Super est décisif en DPS, presque inutile en PvP.
 * EN: build usage context. Varies both pillar weights and per-stat weights.
 */
export type ContexteBuild = "neutre" | "roaming" | "dps" | "pvp";

/**
 * FR : poids de chaque statistique selon le contexte. Valeurs arrêtées avec
 * l'utilisateur et documentées dans NOTES-CONCEPTION.md (section « Le scoring »).
 *
 * La stat « Arme » est volontairement basse partout SAUF en DPS : remarque de
 * l'utilisateur, elle est en pratique moins utile que la Santé dans la plupart
 * des situations, mais redevient centrale sur une fenêtre de dégâts.
 *
 * EN: per-stat weights by context, agreed with the user and documented in the
 * README. "Weapons" is deliberately low everywhere EXCEPT DPS.
 */
// FR : ⚠️ CORRIGÉ (24/08/2026) - trois vagues d'ajustements demandées par
// l'utilisateur après avoir revu les coefficients affichés dans le bloc
// "0. Contexte du build" :
//   - Santé : 1.5 -> 0.3 en Roaming, 0.8 -> 0.3 en DPS ;
//   - Arme : 0.5 -> 1.7 en Roaming (même valeur qu'en DPS) ;
//   - PvP : Arme 1.0 -> 0.5, Grenade 0.9 -> 1.4 (le corps à corps et les
//     grenades comptent davantage qu'estimé initialement, l'arme moins).
// EN: ⚠️ FIXED - three rounds of coefficient adjustments requested by the
// user after reviewing the values shown in the "0. Build context" block.
export const POIDS_STATS: Record<ContexteBuild, Record<StatKey, number>> = {
  neutre:  { sante: 1.2, melee: 1.0, grenade: 1.2, super: 1.0, classe: 1.0, arme: 0.6 },
  roaming: { sante: 0.3, melee: 1.2, grenade: 1.5, super: 1.0, classe: 1.3, arme: 1.7 },
  dps:     { sante: 0.3, melee: 0.7, grenade: 1.2, super: 1.8, classe: 0.8, arme: 1.7 },
  pvp:     { sante: 1.8, melee: 1.3, grenade: 1.4, super: 0.7, classe: 1.3, arme: 0.5 },
};

/**
 * FR : total de statistiques d'un set PLEINEMENT optimisé, sur lequel l'échelle
 * est calibrée. Calcul détaillé dans NOTES-CONCEPTION.md, d'après la section « Armor 3.0 »
 * de knowledge-base/08_GAME_MECHANICS.md :
 *   30 (primaire) + 25 (secondaire) + 20 (tertiaire)
 *   + 18 (masterwork T5 & tuning) + 10 (stat mod majeur) = ~103 par pièce
 *   x 5 pièces = ~515, arrondi à 500.
 *
 * ⚠️ Ne PAS y inclure les Fonts (~+40) : ils n'apparaissent pas dans les stats
 * statiques que lit l'appli. Les compter ferait paraître tous les builds
 * incomplets.
 *
 * EN: total stats of a FULLY optimised set, used to calibrate the scale.
 * Do NOT include Fonts (~+40): they don't show in the static stats the app
 * reads, and counting them would make every build look incomplete.
 */
export const TOTAL_STATS_SET_OPTIMISE = 500;

export function scoreStats(
  stats: StatBlock,
  exigences: ExigenceStat[] = [],
  contexte: ContexteBuild = "neutre"
): { score: number; details: string[] } {
  const details: string[] = [];
  const cles: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];

  // FR : ⚠️ RÉÉCRIT (04/08/2026) - deux défauts corrigés d'un coup, tous deux
  // vérifiés chiffres à l'appui avant modification.
  //
  // 1. MOYENNE SIMPLE → MOYENNE PONDÉRÉE. L'ancienne formule faisait la
  //    moyenne des 6 paliers, donc un build tiède partout battait un build
  //    spécialisé À TOTAL DE STATS IDENTIQUE (45 contre 43 sur un cas testé).
  //    C'est l'inverse de ce que récompense Destiny. Les stats sont désormais
  //    pondérées par le contexte : un T20 Grenade vaut beaucoup en roaming,
  //    peu en DPS.
  //
  // 2. NORMALISATION SUR 1200 → SUR 500. On divisait par le maximum théorique
  //    (6 stats x T20 = 1200), inatteignable : un set PLEINEMENT optimisé
  //    (~515 points d'après knowledge-base/08_GAME_MECHANICS.md) plafonnait à
  //    43/100. Tous les scores se tassaient en bas de l'échelle, ce qui privait
  //    le score de tout pouvoir discriminant.
  //
  // EN: REWRITTEN - simple average → context-weighted average (a bland build
  // beat a specialised one at equal total), and normalisation on 1200 → 500
  // (a fully optimised set capped at 43/100).
  const poids = POIDS_STATS[contexte];
  const sommePoids = cles.reduce((acc, cle) => acc + poids[cle], 0);
  const totalPondere = cles.reduce(
    (acc, cle) => acc + Math.min(STAT_MAX, Math.max(0, stats[cle] ?? 0)) * poids[cle],
    0
  );

  // FR : on ramène le total pondéré à une échelle comparable au total brut
  // d'un set optimisé, sinon la pondération changerait mécaniquement le
  // niveau des scores d'un contexte à l'autre.
  const totalNormalise = (totalPondere / sommePoids) * cles.length;
  let score = (totalNormalise / TOTAL_STATS_SET_OPTIMISE) * 100;

  const resultatsExigences = verifieExigences(stats, exigences);
  for (const r of resultatsExigences) {
    if (r.validee) {
      details.push(
        `✅ ${r.exigence.sourceExotique} : ${r.exigence.stat} à ${libellePalier(
          stats[r.exigence.stat] ?? 0
        )} (exigé T${r.exigence.palierMinimum})`
      );
    } else {
      details.push(
        `⚠️ ${r.exigence.sourceExotique} : ${r.exigence.stat} à ${libellePalier(
          stats[r.exigence.stat] ?? 0
        )}, T${r.exigence.palierMinimum} requis — bonus du 5e pilier non validé`
      );
      // Une exigence non remplie plafonne le score du pilier : le build
      // "fonctionne" mais ne peut pas prétendre à la note maximale.
      score = Math.min(score, 60);
    }
  }

  // FR : ⚠️ AJOUT (04/08/2026) - plafonnement à 100. Sans lui, un build
  // dépassant le total de référence (500) ou fortement spécialisé dans une
  // stat lourdement pondérée sortait à 103-109/100. Un score "sur 100" doit
  // rester sur 100 : au-delà, le chiffre n'a plus de sens pour l'utilisateur
  // et fausse la moyenne pondérée des piliers.
  // Le plancher à 0 protège du cas symétrique (pénalités cumulées).
  // EN: ⚠️ ADDED (2026-08-04) - cap at 100. Without it, a build exceeding the
  // 500 reference or heavily specialised in a heavily-weighted stat scored
  // 103-109/100. A score "out of 100" must stay within 100.
  return { score: Math.max(0, Math.min(100, Math.round(score))), details };
}
