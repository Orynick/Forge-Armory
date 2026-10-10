import { GearPiece, StatBlock, StatKey } from "../../types/build";

/**
 * FR : Additionne les stats de toutes les pièces d'un tableau d'armure.
 * Utilisée à la fois par le moteur de scoring et par l'affichage (graphique).
 * EN: Sums the stats of every piece in an armor array. Used by both the
 * scoring engine and the display (chart).
 */
export function sommerStatsArmure(armure: GearPiece[]): StatBlock {
  return armure.reduce(
    (acc, piece) => {
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
export function scoreStats(
  stats: StatBlock,
  exigences: ExigenceStat[] = []
): { score: number; details: string[] } {
  const details: string[] = [];
  const cles: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];

  const moyennePaliers =
    cles.reduce((acc, cle) => acc + palier(stats[cle] ?? 0), 0) / cles.length;
  let score = (moyennePaliers / STAT_MAX_TIER) * 100;

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

  return { score: Math.round(score), details };
}
