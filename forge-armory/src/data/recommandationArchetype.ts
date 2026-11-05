// Module PUR : aucune dépendance React, aucun réseau, aucune lecture du Manifest.
// Entrée/sortie JSON-sérialisables, testable unitairement (tests/logique/recommandation-archetype.test.ts).
//
// FR : ⚠️ AJOUT (23/10/2026, branche draft-optimiseur) - RECOMMANDATION D'ARCHÉTYPE D'ARMURE (Armor 3.0).
// Source des données : knowledge-base/08_GAME_MECHANICS.md, §« Armor 3.0 — Archétypes et Optimisation
// Stats », table confirmée en jeu par l'utilisateur le 25/08/2026. Chaque archétype a 2 stats
// intrinsèques par pièce : Primary = 30, Secondary = 25 (base, avant tertiary/tuning/masterwork).
// Les 3 paires Santé+Arme, Mêlée+Grenade et Super+Classe n'ont DÉLIBÉRÉMENT aucun archétype : les 12
// ci-dessous forment la liste complète (pas d'armure « toute classe » non plus).
// EN: ADDED - ARMOR ARCHETYPE RECOMMENDATION (Armor 3.0). Data source: the knowledge base table
// confirmed in-game by the user. Each archetype has 2 intrinsic stats per piece: Primary = 30,
// Secondary = 25. The 3 pairs Health+Weapons, Melee+Grenade and Super+Class deliberately have NO
// archetype: these 12 are the complete list.

import type { StatBlock, StatKey } from "../types/build";
import { ORDRE_STATS, LIBELLES_STAT } from "./libellesUI";

/** Un archétype d'armure Armor 3.0 : 2 stats intrinsèques (Primary 30 / Secondary 25 par pièce). */
export interface ArchetypeArmure {
  /** Identifiant stable (slug, minuscule). */
  id: string;
  /** Nom affiché en jeu (version française). */
  nomFr: string;
  /** Nom anglais (pour référence / manifest). */
  nomEn: string;
  /** Stat intrinsèque à 30 par pièce (5 pièces → +150 sur le build). */
  primaire: StatKey;
  /** Stat intrinsèque à 25 par pièce (5 pièces → +125 sur le build). */
  secondaire: StatKey;
}

/** Les 12 archétypes, ordre de la table de la knowledge-base. */
export const ARCHETYPES: readonly ArchetypeArmure[] = [
  { id: "powerhouse", nomFr: "Maître", nomEn: "Powerhouse", primaire: "arme", secondaire: "super" },
  { id: "grenadier", nomFr: "Grenadier", nomEn: "Grenadier", primaire: "grenade", secondaire: "super" },
  { id: "gunner", nomFr: "Mitrailleur", nomEn: "Gunner", primaire: "arme", secondaire: "grenade" },
  { id: "paragon", nomFr: "Parangon", nomEn: "Paragon", primaire: "super", secondaire: "melee" },
  { id: "skirmisher", nomFr: "Escarmoucheur", nomEn: "Skirmisher", primaire: "melee", secondaire: "arme" },
  { id: "colossus", nomFr: "Colosse", nomEn: "Colossus", primaire: "super", secondaire: "sante" },
  { id: "demolitionist", nomFr: "Démolisseur", nomEn: "Demolitionist", primaire: "grenade", secondaire: "classe" },
  { id: "reaver", nomFr: "Pilleur", nomEn: "Reaver", primaire: "classe", secondaire: "melee" },
  { id: "specialist", nomFr: "Spécialiste", nomEn: "Specialist", primaire: "classe", secondaire: "arme" },
  { id: "siegebreaker", nomFr: "Brise-siège", nomEn: "Siegebreaker", primaire: "sante", secondaire: "grenade" },
  { id: "bulwark", nomFr: "Rempart", nomEn: "Bulwark", primaire: "sante", secondaire: "classe" },
  { id: "brawler", nomFr: "Pugnace", nomEn: "Brawler", primaire: "melee", secondaire: "sante" },
];

/** Points d'intrinsèque par pièce (Armor 3.0, base avant tertiary/tuning/masterwork). */
export const POINTS_PRIMAIRE_PAR_PIECE = 30;
export const POINTS_SECONDAIRE_PAR_PIECE = 25;
/** Nombre de pièces d'armure dans un build complet (5 slots). */
export const NB_PIECES_ARMURE = 5;
/** Plafond d'intrinsèque sur 5 pièces, par rôle. */
export const PLAFOND_PRIMAIRE = POINTS_PRIMAIRE_PAR_PIECE * NB_PIECES_ARMURE;   // 150
export const PLAFOND_SECONDAIRE = POINTS_SECONDAIRE_PAR_PIECE * NB_PIECES_ARMURE; // 125

/** Résultat de la recommandation. */
export interface RecommandationArchetype {
  /** L'archétype recommandé (toujours défini : la fonction ne renvoie jamais null). */
  archetype: ArchetypeArmure;
  /** Stat la plus « demandée » par les cibles (plus gros déficit, puis plus haute cible, puis ordre du jeu). */
  statCible: StatKey;
  /** Stats intrinsèques de l'archétype retenu (primaire 30/pièce, secondaire 25/pièce). */
  primaire: StatKey;
  secondaire: StatKey;
  /** Points que l'archétype apporte à la stat cible sur 5 pièces, PLAFONNÉS au déficit
   * (un déficit de 120 sur une stat en secondaire = 120, pas le plafond 125). */
  apportCible: number;
  /** Phrase d'explication prête à afficher (FR). */
  explication: string;
}

/**
 * FR : Recommande l'archétype d'armure le plus adapté aux stats CIBLES (le build simulé :
 * totaux ajustés par l'utilisateur). Règle :
 *   1. « déficit » d'une stat = max(0, cible − réelle) : ce qu'il manque pour atteindre la
 *      cible ; une stat abaissée sous le réel ne crée aucun besoin ;
 *   2. la stat cible est celle du plus gros déficit (à égalité : la cible la plus haute, puis
 *      l'ordre du jeu) ;
 *   3. chaque archétype est scoré par les points d'intrinsèque (5 pièces) qui SATISFONT un
 *      déficit, plafonnés au déficit (au-delà, les points ne servent plus la cible) : le meilleur
 *      archétype est celui qui couvre le plus de « souhaits » — y compris DEUX stats à la fois
 *      quand une paire existe (ex: Super + Arme → « Maître »/Powerhouse, la référence DPS de la
 *      knowledge-base) ; à égalité, le premier de la table gagne (stabilité) ;
 *   4. jamais d'erreur : sans aucun déficit (cibles = réelles, ou simulation qui ne baisse que
 *      des stats), tous les scores sont nuls et « Maître » (Powerhouse) est recommandé comme
 *      référence DPS, avec une explication adaptée.
 * EN: Recommends the armor archetype best suited to the TARGET stats (the simulated build:
 * user-adjusted totals). Rule: (1) a stat's deficit = max(0, target − real); (2) the target stat
 * is the one with the biggest deficit (ties: higher target, then game order); (3) each archetype
 * is scored by its intrinsic points (5 pieces) that SATISFY a deficit, capped at the deficit; the
 * best archetype covers the most "wishes" — including TWO stats at once when a pair exists (e.g.
 * Super + Weapons → « Maître »/Powerhouse, the knowledge base's DPS reference); ties keep the
 * table order; (4) never throws: with no deficit at all, "Maître" is recommended as the DPS
 * reference, with a matching explanation.
 */
export function recommanderArchetype(
  statsReelles: Partial<StatBlock>,
  statsCibles: Partial<StatBlock>
): RecommandationArchetype {
  // FR : déficit borné à 0 en dessous (abaisser une stat sous le réel ne crée pas de besoin).
  // EN: deficit floored at 0 (lowering a stat below the real value creates no need).
  const deficit = (cle: StatKey) => Math.max(0, (statsCibles[cle] ?? 0) - (statsReelles[cle] ?? 0));
  // 1. stat cible : plus gros déficit, puis cible la plus haute, puis ordre du jeu (stabilité).
  const parDeficit = [...ORDRE_STATS].sort((a, b) => {
    const dA = deficit(a);
    const dB = deficit(b);
    if (dA !== dB) return dB - dA; // plus gros déficit d'abord
    const cA = statsCibles[a] ?? 0;
    const cB = statsCibles[b] ?? 0;
    if (cA !== cB) return cB - cA; // puis la cible la plus haute
    return ORDRE_STATS.indexOf(a) - ORDRE_STATS.indexOf(b); // puis l'ordre du jeu
  });
  const statCible = parDeficit[0];
  // 2. score de chaque archétype : points d'intrinsèque (5 pièces) qui satisfont un déficit,
  // plafonnés au déficit. Le premier de la table gagne les égalités (stabilité).
  const score = (a: ArchetypeArmure) =>
    Math.min(deficit(a.primaire), PLAFOND_PRIMAIRE) + Math.min(deficit(a.secondaire), PLAFOND_SECONDAIRE);
  let meilleur = ARCHETYPES[0];
  let meilleurScore = -1;
  for (const a of ARCHETYPES) {
    const s = score(a);
    if (s > meilleurScore) {
      meilleurScore = s;
      meilleur = a;
    }
  }
  // 3. explication prête à afficher
  const libelle = (cle: StatKey) => LIBELLES_STAT[cle];
  // FR : l'apport est PLAFONNÉ au déficit : les points au-delà de la cible ne servent pas le
  // souhait de l'utilisateur. EN: the contribution is CAPPED at the deficit: points beyond the
  // target don't serve the user's wish.
  const apportCible = meilleur.primaire === statCible
    ? Math.min(deficit(statCible), PLAFOND_PRIMAIRE)
    : meilleur.secondaire === statCible
      ? Math.min(deficit(statCible), PLAFOND_SECONDAIRE)
      : 0;
  const explication = meilleurScore > 0
    ? `Cherchez des armures « ${meilleur.nomFr} » : ${libelle(meilleur.primaire)} +${POINTS_PRIMAIRE_PAR_PIECE} et ${libelle(meilleur.secondaire)} +${POINTS_SECONDAIRE_PAR_PIECE} par pièce (soit +${PLAFOND_PRIMAIRE} ${libelle(meilleur.primaire)} et +${PLAFOND_SECONDAIRE} ${libelle(meilleur.secondaire)} sur 5 pièces, avant tertiaire/masterwork/tuning).`
    : `Aucune stat simulée ne dépasse votre équipement réel : « ${meilleur.nomFr} » (${libelle(meilleur.primaire)} +${PLAFOND_PRIMAIRE}, ${libelle(meilleur.secondaire)} +${PLAFOND_SECONDAIRE} sur 5 pièces) reste la référence DPS.`;

  return {
    archetype: meilleur,
    statCible,
    primaire: meilleur.primaire,
    secondaire: meilleur.secondaire,
    apportCible,
    explication,
  };
}
