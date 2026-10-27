// FR : ⚠️ AJOUT (26/10/2026, branche draft-mod-armures), « Le « + » (fixe ou libre) ne se comporte pas comme dans le jeu » : RÈGLE DE L'AJUSTEMENT d'une armure, donnée par l'utilisateur avec une capture du jeu (armure « Maître », Mêlée marquée du symbole ⇅) - LOGIQUE PURE.
// (1) CHAQUE armure (légendaire OU exotique) a une statistique « + » PROPRE À LA PIÈCE : tirée au hasard par le jeu parmi les 6 statistiques (même la primaire), JAMAIS modifiable par le joueur ; le jeu la repère par le symbole ⇅ à côté de la statistique.
// (2) Le slot d'ajustement offre exactement TROIS issues : RIEN (laissé vide) ; ÉQUILIBRÉ : +1 sur les trois statistiques « non intrinsèques » (ni primaire, ni secondaire, ni tertiaire : celles que la maîtrise colore en jaune) ; DIRECTIONNEL : +5 sur la statistique « + » de la pièce et −5 sur l'une des 5 autres.
// ⚠️ Ce que cette règle CORRIGE : mon code laissait le « + » LIBRE sur une pièce exotique (parce que l'API en liste 31 combinaisons), n'offrait pas « rien », et lisait l'effet de l'ajustement équilibré dans le Manifest (dont les valeurs ne sont PAS connues : les diagnostics ne donnent que son nom) au lieu de l'appliquer comme le jeu.
// ⚠️ Comment on retrouve le « + » d'une pièce : (a) les ajustements directionnels PROPOSÉS par l'exemplaire n'ont qu'UN seul « + » (légendaire : vérifié sur le casque chatoyant) ; (b) sinon le « + » du plug ÉQUIPÉ s'il est directionnel (il est forcément valide) ; (c) sinon le « + » commun des plugs que l'API dit INSÉRABLES (`canInsert`, non vérifié) ; (d) sinon on ne le sait pas : `null`.
// EN: ⚠️ ADDED - the TUNING rule: every armor piece has ONE fixed, random, unmodifiable "+" stat (marked ⇅ in game); the tuning slot yields nothing / balanced (+1 on the 3 non-intrinsic stats) / directional (+5 on the piece's "+" stat, −5 on another). PURE logic.
import type { StatKey } from "../../types/build";
import type { ColonneArmure, PlugArmure, StatsPartielles } from "./armure";
import { normaliser } from "../manifest/search";

const TOUTES: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
export type GenreAjustement = "vide" | "equilibre" | "directionnel" | "autre";
export interface InfoAjustement { genre: GenreAjustement; plus?: StatKey; moins?: StatKey }

/** FR : le genre d'un plug d'ajustement : « vide » (« Emplacement de mod d'ajustement vide »), « directionnel » (une statistique en plus ET une en moins : « +Super / -Santé »), « équilibré » (« Ajustement équilibré » : reconnu par son nom, ou sans aucune statistique négative), « autre » sinon. / EN: the kind of a tuning plug. */
export function infoAjustement(p: PlugArmure): InfoAjustement {
  const n = normaliser(p.nom);
  if (n.startsWith("emplacement de mod") && n.includes("vide")) return { genre: "vide" };
  const e = Object.entries(p.stats).filter(([, v]) => v) as Array<[StatKey, number]>;
  const pos = e.filter(([, v]) => v > 0), neg = e.filter(([, v]) => v < 0);
  if (pos.length === 1 && neg.length === 1) return { genre: "directionnel", plus: pos[0][0], moins: neg[0][0] };
  if (n.includes("equilibr") || (neg.length === 0 && pos.length >= 1)) return { genre: "equilibre" };
  return { genre: "autre" };
}

/** FR : les TROIS statistiques non intrinsèques (ni primaire, ni secondaire, ni tertiaire) : les trois PLUS PETITES une fois retirés les effets des mods de statistique équipés (la maîtrise les colore en jaune dans le jeu). `null` si les six statistiques ne sont pas toutes lues. Robuste à l'ajustement : une statistique non intrinsèque vaut au plus 10 (5 + 5 de l'ajustement) alors que les trois autres valent au moins 15. / EN: the 3 non-intrinsic stats = the 3 smallest once stat-mod effects are removed. */
export function troisNonIntrinseques(stats: StatsPartielles, effetsARetirer: readonly StatsPartielles[] = []): StatKey[] | null {
  if (!TOUTES.every((k) => typeof stats[k] === "number")) return null;
  const valeur = (k: StatKey) => (stats[k] as number) - effetsARetirer.reduce((a, e) => a + (e[k] ?? 0), 0);
  return [...TOUTES].sort((a, b) => valeur(a) - valeur(b) || TOUTES.indexOf(a) - TOUTES.indexOf(b)).slice(0, 3);
}
/** FR : idem pour une armure : les mods de STATISTIQUE équipés (catégorie `enhancements.v2_general`) sont retirés avant le classement. / EN: same for an armor piece. */
export function nonIntrinsequesDePiece(stats: StatsPartielles | undefined, colonnes: readonly ColonneArmure[]): StatKey[] | null {
  return troisNonIntrinseques(stats ?? {}, colonnes.filter((c) => c.equipe.categoriePlug === "enhancements.v2_general").map((c) => c.equipe.stats));
}

/** FR : l'EFFET RÉEL d'un plug d'ajustement sur les statistiques : rien pour « vide » ; +1 sur les trois statistiques non intrinsèques pour « équilibré » (règle du jeu, PAS les valeurs du Manifest) ; ses statistiques (+5 / −5) pour un directionnel. / EN: the real stat effect of a tuning plug. */
export function effetAjustement(p: PlugArmure, nonIntrinseques: readonly StatKey[] | null): StatsPartielles {
  const info = infoAjustement(p);
  if (info.genre === "vide") return {};
  if (info.genre === "equilibre") { const e: StatsPartielles = {}; for (const k of nonIntrinseques ?? []) e[k] = 1; return e; }
  return { ...p.stats };
}

/** FR : la statistique « + » PROPRE à la pièce ET d'où elle a été lue (voir l'en-tête du fichier : a, b, c, d) ; `plus: null` si on ne peut pas la lire. / EN: the piece's own "+" stat and where it was read from. */
export function lirePlus(options: readonly PlugArmure[], equipe: PlugArmure, insertables?: readonly number[]): { plus: StatKey | null; source: "propositions" | "equipe" | "insertables" | "aucune" } {
  const plus = (liste: readonly PlugArmure[]): StatKey[] => [...new Set(liste.map(infoAjustement).filter((i) => i.genre === "directionnel").map((i) => i.plus as StatKey))];
  const parOptions = plus(options);
  if (parOptions.length === 1) return { plus: parOptions[0], source: "propositions" };
  const e = infoAjustement(equipe);
  if (e.genre === "directionnel") return { plus: e.plus as StatKey, source: "equipe" };
  if (insertables && insertables.length > 0) { const p = plus(options.filter((o) => insertables.includes(o.hash))); if (p.length === 1) return { plus: p[0], source: "insertables" }; }
  return { plus: null, source: "aucune" };
}
/** FR : la statistique « + » PROPRE à la pièce, ou `null` si on ne peut pas la lire. / EN: the piece's own "+" stat, or `null`. */
export const statDePlus = (options: readonly PlugArmure[], equipe: PlugArmure, insertables?: readonly number[]): StatKey | null => lirePlus(options, equipe, insertables).plus;
