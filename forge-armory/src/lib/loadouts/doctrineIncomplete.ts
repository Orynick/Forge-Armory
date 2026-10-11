// FR : ⚠️ DÉPLACÉ (07/10/2026, v0.3.8) - règle « Doctrine incomplète » à l'enregistrement d'un build, qui vivait dans `PanneauLoadouts` (zone d'enregistrement, retirée du panneau) et sert maintenant à la fenêtre
// « Enregistrer le build » du bloc « Sauvegarde et partage du Build ». Texte et règle INCHANGÉS : un build dont la super, la mêlée, la grenade, la compétence de classe ou le saut n'est pas choisi déclenche une
// confirmation avant d'être enregistré (le marqueur « équipé en jeu » de la grille Doctrine n'enregistre rien tant qu'on ne CLIQUE PAS l'option : c'est peut-être ce qui s'est passé).
// EN: ⚠️ MOVED - the "incomplete Doctrine" rule applied when saving a build, now used by the "Save build" window. Rule and wording UNCHANGED.

import type { BuildDraft } from "../../types/build";

const CHAMPS_DOCTRINE: { cle: keyof BuildDraft["subclass"]; libelle: string }[] = [
  { cle: "superHash", libelle: "Super" },
  { cle: "meleeHash", libelle: "Mêlée" },
  { cle: "grenadeHash", libelle: "Grenade" },
  { cle: "classeHash", libelle: "Compétence de classe" },
  { cle: "sautHash", libelle: "Saut" },
];

/** FR : libellés des éléments de Doctrine NON choisis (absents ou égaux à 0) ; liste vide = Doctrine complète. / EN: labels of the doctrine slots left empty. */
export function doctrineManquante(build: BuildDraft): string[] {
  return CHAMPS_DOCTRINE.filter((c) => !build.subclass[c.cle] || build.subclass[c.cle] === 0).map((c) => c.libelle);
}

/** FR : texte de la confirmation demandée avant d'enregistrer un build à la Doctrine incomplète. / EN: confirmation text. */
export function messageDoctrineIncomplete(manquants: string[]): string {
  return (
    `⚠️ Doctrine incomplète : ${manquants.join(", ")} non sélectionné(e)${manquants.length > 1 ? "s" : ""}.\n\n` +
    `Le marqueur "🎮 équipé en jeu" dans la grille Doctrine n'enregistre rien tant qu'on ne CLIQUE PAS l'option : c'est peut-être ce qui s'est passé ici.\n\n` +
    `Enregistrer quand même ce loadout tel quel ?`
  );
}
