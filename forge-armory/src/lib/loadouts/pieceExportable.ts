// FR : ⚠️ AJOUT (14/10/2026, v0.4.9), demande de l'utilisateur : « l'export infographique reste sur les perks réels, et on affiche sur les images, textes et PDF UNIQUEMENT les perks SÉLECTIONNÉS ; même règle pour les armures ». Tout ce qui sort de l'appli (fiche en image, texte et PDF, fichier d'échange JSON, sauvegarde complète) et tout ce qui est enregistré (Load-outs) passe par cette fonction.
// ELLE RETIRE : (0) ⚠️ 27/10/2026 : aussi `plugsInsertablesParColonne` et `energie` (simulation des mods d'armure) ; (1) `plugsDisponiblesParColonne` : les perks DISPONIBLES sur l'exemplaire mais NON sélectionnés (donnée lue pour la Forge depuis la 0.4.7 : sans elle, un build enregistré ou exporté en JSON embarquerait la liste des perks non choisis de chaque arme) ; (2) les repères d'une copie « avec simulation » : si une telle copie arrivait ici par erreur, ses perks RÉELS sont remis (`pieceReelle`) : un export ne contient jamais un perk simulé.
// Une pièce qui n'a rien à retirer est rendue telle quelle (même objet). L'armure n'a ni perks disponibles ni simulation : elle reste inchangée, et seuls ses mods équipés (`perkHashes`) sont affichés. Fonctions PURES. EN: ⚠️ ADDED - strips the available-but-unselected perks and any simulation markers from pieces before saving/exporting: exports only ever show the selected, REAL perks.
import type { BuildDraft, GearPiece } from "../../types/build";
import { pieceReelle } from "../forge/appliquerSimulation";

export function pieceExportable(piece: GearPiece): GearPiece {
  const reelle = pieceReelle(piece);
  // FR : ⚠️ CHANGÉ (27/10/2026) - retire AUSSI `plugsInsertablesParColonne` (sous-ensemble des plugs DISPONIBLES non sélectionnés : même information que `plugsDisponiblesParColonne`, donc même règle) et `energie` (donnée de simulation, inutile hors de l'appli), ajoutés pour la simulation des mods d'armure ; sinon un build enregistré, exporté ou partagé les embarquerait. / EN: ⚠️ CHANGED - also strips the insertable-plugs list and the energy, added for the armor-mod simulation.
  if (!("plugsDisponiblesParColonne" in reelle) && !("plugsInsertablesParColonne" in reelle) && !("energie" in reelle)) return reelle;
  const { plugsDisponiblesParColonne, plugsInsertablesParColonne, energie, ...reste } = reelle;
  void plugsDisponiblesParColonne; void plugsInsertablesParColonne; void energie;
  return reste;
}

/** FR : le build prêt à sortir de l'appli ou à être enregistré ; le MÊME objet s'il n'y a rien à retirer. / EN: the build ready to leave the app or be saved; the same object if nothing to strip. */
export function buildExportable(build: BuildDraft): BuildDraft {
  const armes = (build.armes ?? []).map(pieceExportable);
  const armure = (build.armure ?? []).map(pieceExportable);
  const change = armes.some((p, i) => p !== build.armes[i]) || armure.some((p, i) => p !== build.armure[i]);
  return change ? { ...build, armes, armure } : build;
}
