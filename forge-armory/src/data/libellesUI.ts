import type { SlotArme, SlotArmure, StatKey } from "../types/build";
import type { CategorieSocket } from "../lib/manifest/doctrine";

/** Libellés communs aux vues Inventaire / Mon Build / Doctrine. */
export const LIBELLES_SLOT: Record<SlotArme | SlotArmure, string> = {
  cinetique: "Arme cinétique",
  energie: "Arme énergie",
  lourde: "Arme lourde",
  casque: "Casque",
  gants: "Gants",
  torse: "Torse",
  jambes: "Jambes",
  marque: "Marque de classe",
};

export const LIBELLES_CATEGORIE: Record<CategorieSocket, string> = {
  super: "Super",
  aspect: "Aspects",
  fragment: "Fragments",
  melee: "Mêlée",
  grenade: "Grenade",
  classe: "Compétence de classe",
  saut: "Saut",
  autre: "Autre",
};

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - noms des 6 stats d'armure, pour la
 * fiche d'un build. Quatre copies identiques existent déjà ailleurs
 * (SelecteurInventaire, ResumeBuild, StatsBarChart, doctrine.ts) : non
 * touchées dans cette passe, à regrouper ici lors d'un prochain nettoyage.
 * EN: ⚠️ ADDED - the 6 armor stat names. Four identical copies exist
 * elsewhere, left untouched for now, to merge here in a later cleanup.
 */
export const LIBELLES_STAT: Record<StatKey, string> = {
  sante: "Santé",
  melee: "Mêlée",
  grenade: "Grenade",
  super: "Super",
  classe: "Classe",
  arme: "Arme",
};

/** FR : ordre d'affichage des stats, identique à Mon Build. / EN: stat display order, same as Mon Build. */
export const ORDRE_STATS: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.4) - ordre d'affichage des emplacements,
 * identique à Mon Build (ORDRE_ARMES / ORDRE_ARMURE de ResumeBuild). Un
 * build garde ses pièces dans l'ordre où elles ont été AJOUTÉES : sans ce
 * tri, la fiche d'un build pouvait montrer l'arme lourde avant la cinétique
 * (signalé par l'utilisateur).
 * EN: ⚠️ ADDED - slot display order, same as Mon Build. A build keeps pieces
 * in the order they were ADDED; without sorting, the sheet could show the
 * heavy weapon before the kinetic one.
 */
export const ORDRE_EMPLACEMENTS: (SlotArme | SlotArmure)[] = [
  "cinetique", "energie", "lourde",
  "casque", "gants", "torse", "jambes", "marque",
];
