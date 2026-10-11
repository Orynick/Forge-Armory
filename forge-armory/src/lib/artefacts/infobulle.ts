// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - texte d'INFOBULLE d'un perk d'artefact : son nom, puis son EFFET
// (demande de l'utilisateur : « en passant le curseur sur un perk d'artefact, afficher l'effet du perk »).
// Jusqu'ici la grille de l'artefact n'affichait que le NOM au survol (seuls les emplacements déjà
// équipés montraient la description). Même nettoyage que pour ces emplacements : traduction de repli
// si le texte contient encore de l'anglais, jetons d'icône `[icone X]` et guillemets retirés (le texte
// brut d'une infobulle ne sait pas les afficher). Fonctions PURES, partagées par le sélecteur d'artefact
// (components/SelecteurArtefact.tsx) et la fiche « Voir » (lib/loadouts/fiche.ts).
// EN: ⚠️ ADDED - an artifact perk's TOOLTIP text: its name, then its EFFECT. Same cleaning as the
// equipped-slot tooltips. Pure functions shared by the selector and the "View" sheet.

import { traduireTexteArtefact } from "../../data/traductionArtefact";

/**
 * FR : repli sur le remplacement de termes UNIQUEMENT si le texte contient encore des mots anglais
 * typiques - heuristique simple pour ne pas re-traduire du français déjà propre. (Déplacée telle quelle
 * depuis SelecteurArtefact.tsx, où elle était locale.)
 * EN: moved as-is from SelecteurArtefact.tsx.
 */
export function texteAffichable(texteBrut: string): string {
  const sembleAnglais = /\b(the|and|with|damage|kill|grants?|when)\b/i.test(texteBrut);
  return sembleAnglais ? traduireTexteArtefact(texteBrut) : texteBrut;
}

/** FR : description d'un perk prête pour une infobulle (texte brut, sans jetons ni guillemets). Vide si absente. / EN: tooltip-ready description; empty if absent. */
export function descriptionPourInfobulle(description: string | undefined): string {
  if (!description) return "";
  return texteAffichable(description)
    .replace(/\[icone [^\]]+\]/gi, "")
    .replace(/["«»]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * FR : infobulle complète : le nom, puis (ligne vide) l'effet s'il est connu, puis (ligne vide) l'avertissement
 * éventuel (perk impossible à prendre, par exemple). Sans description : le nom seul, comme avant.
 * EN: full tooltip: name, then the effect if known, then the optional warning.
 */
export function infobulleDePerk(nom: string, description?: string, avertissement?: string | null): string {
  const parties = [texteAffichable(nom)];
  const effet = descriptionPourInfobulle(description);
  if (effet) parties.push(effet);
  if (avertissement) parties.push(`⚠️ ${avertissement}`);
  return parties.join("\n\n");
}
