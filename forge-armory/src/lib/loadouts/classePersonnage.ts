// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - quel PERSONNAGE reçoit un loadout lors de
// « Équiper en jeu » (demande de l'utilisateur : un build enregistré pour le Chasseur doit
// forcément être équipé sur le Chasseur ; le menu Loadouts affiche d'ailleurs l'icône de la
// classe du build). Fonction PURE, testée hors de l'appli.
//
// Quatre cas, selon la classe enregistrée dans le build (`classeFigee`) et les personnages
// du compte :
//   - "direct"      : un seul personnage de cette classe -> on équipe dessus, sans question ;
//   - "plusieurs"   : plusieurs personnages de cette classe (Destiny permet d'en avoir
//                     deux de la même) -> on demande lequel, parmi eux seulement ;
//   - "aucun"       : le build est pour une classe dont le compte n'a AUCUN personnage ->
//                     rien n'est équipé (l'armure est propre à chaque classe) ;
//   - "sans-classe" : le build ne mentionne aucune classe -> on demande le personnage,
//                     parmi tous.
// EN: ⚠️ ADDED - which CHARACTER receives a loadout on "Equip in game". Pure function.

export type ClasseBuild = "titan" | "chasseur" | "arcaniste";

export interface PersonnageCompte {
  characterId: string;
  /** FR : nom affiché par Bungie côté appli : « Titan », « Chasseur » ou « Arcaniste ». / EN: label as shown. */
  classe: string;
  lumiere: number;
}

export type CibleEquipement =
  | { cas: "direct"; personnage: PersonnageCompte }
  | { cas: "plusieurs"; classe: ClasseBuild; candidats: PersonnageCompte[] }
  | { cas: "aucun"; classe: ClasseBuild }
  | { cas: "sans-classe"; candidats: PersonnageCompte[] };

export const NOMS_CLASSE: Record<ClasseBuild, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };

/** FR : « Chasseur », « chasseur » ou « CHASSEUR » -> « chasseur » ; autre chose -> null. / EN: normalises a class label. */
export function classeDepuisNom(nom: string): ClasseBuild | null {
  const n = nom.trim().toLowerCase();
  return n === "titan" || n === "chasseur" || n === "arcaniste" ? n : null;
}

export function determinerCible(classeDuBuild: ClasseBuild | null | undefined, personnages: PersonnageCompte[]): CibleEquipement {
  if (!classeDuBuild) return { cas: "sans-classe", candidats: personnages };
  const candidats = personnages.filter((p) => classeDepuisNom(p.classe) === classeDuBuild);
  if (candidats.length === 1) return { cas: "direct", personnage: candidats[0] };
  if (candidats.length === 0) return { cas: "aucun", classe: classeDuBuild };
  return { cas: "plusieurs", classe: classeDuBuild, candidats };
}
