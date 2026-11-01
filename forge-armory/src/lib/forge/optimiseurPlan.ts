// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR, PLAN « À FAIRE EN JEU » (maquette `Optimiseur-plan`) : l'appli ne modifie rien en jeu ; elle donne, pour une solution, la liste ordonnée de ce qu'il faut faire : d'abord les TRANSFERTS (une pièce du Coffre ou d'un autre personnage doit rejoindre le personnage de la classe choisie), puis l'ÉQUIPEMENT des pièces pas encore portées, puis les CHANGEMENTS DE MODS (mod de statistique et ajustement, avec « avant → après »). Pur.
// EN: ⚠️ ADDED - in-game to-do plan for a solution: transfers, equipping, mod changes.
import type { SolutionPieces } from "./optimiseurPieces";

export interface EtapePlan { genre: "transfert" | "equipement" | "mod"; titre: string; detail: string }
const LIBELLE_CLASSE: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };
const LIBELLE_SLOT: Record<string, string> = { casque: "Casque", gants: "Gants", torse: "Torse", jambes: "Jambes", marque: "Objet de classe" };

/** FR : le plan d'une solution pour le personnage de la classe `classe`. */
export function construirePlan(sol: SolutionPieces, classe: string): EtapePlan[] {
  const cl = LIBELLE_CLASSE[classe] ?? classe;
  const etapes: EtapePlan[] = [];
  for (const { piece } of sol.pieces) {
    const o = piece.origine;
    if (o === classe) continue;   // déjà sur le personnage
    if (o === "coffre" || o === undefined) etapes.push({ genre: "transfert", titre: piece.nom ?? "pièce sans nom", detail: `Du Coffre vers votre ${cl}.` });
    else if (o === "courrier") etapes.push({ genre: "transfert", titre: piece.nom ?? "pièce sans nom", detail: `Du Courrier vers votre ${cl} (récupérez-la d'abord).` });
    else etapes.push({ genre: "transfert", titre: piece.nom ?? "pièce sans nom", detail: `De votre ${LIBELLE_CLASSE[o] ?? o} vers le Coffre, puis du Coffre vers votre ${cl}.` });
  }
  const aEquiper = sol.pieces.filter(({ piece }) => !piece.equipe);
  if (aEquiper.length > 0) etapes.push({ genre: "equipement", titre: `Équiper ${aEquiper.length === 1 ? "la pièce" : `les ${aEquiper.length} pièces`}`, detail: `${aEquiper.map(({ piece }) => LIBELLE_SLOT[piece.slot] ?? piece.slot).join(", ")}.${sol.pieces.length > aEquiper.length ? (sol.pieces.length - aEquiper.length === 1 ? " L'autre pièce est déjà portée." : ` Les ${sol.pieces.length - aEquiper.length} autres pièces sont déjà portées.`) : ""}` });
  for (const { piece, option } of sol.pieces) {
    const morceaux: string[] = [];
    if (option.statistiqueChange) morceaux.push(`${option.statistiqueAvant} → ${option.statistique}`);
    if (option.ajustementChange) morceaux.push(`ajustement ${option.ajustementAvant} → ${option.ajustement}`);
    if (morceaux.length > 0) etapes.push({ genre: "mod", titre: `${LIBELLE_SLOT[piece.slot] ?? piece.slot} · ${piece.nom ?? "pièce sans nom"}`, detail: `${morceaux.join(" · ")}.` });
  }
  return etapes;
}

/** FR : le plan sous forme de texte à copier. */
export const planEnTexte = (etapes: readonly EtapePlan[]): string => etapes.map((e, i) => `${i + 1}. [${e.genre === "transfert" ? "Transfert" : e.genre === "equipement" ? "Équipement" : "Mod"}] ${e.titre} : ${e.detail}`).join("\n");
