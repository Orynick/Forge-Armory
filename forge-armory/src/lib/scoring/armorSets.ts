// FR : Bonus de Set d'armure (Armor 3.0, depuis Edge of Fate / Monument of
// Triumph, juin 2026). Chaque set nommé donne un bonus à 2 pièces équipées
// et un second (plus fort) à 4 pièces. Les pièces exotiques n'appartiennent
// jamais à un set légendaire — seules les pièces légendaires comptent.
//
// EN: Armor Set Bonuses (Armor 3.0, since Edge of Fate / Monument of
// Triumph, June 2026). Each named set grants a bonus at 2 equipped pieces
// and a stronger one at 4. Exotic pieces never belong to a legendary set —
// only legendary pieces count toward the total.
//
// ⚠️ FR : Je n'ai pas pu confirmer le nom exact de la table du Manifest
// Bungie qui décrit ces sets (fonctionnalité trop récente). La structure
// ci-dessous est volontairement générique et prête à être branchée dessus ;
// le registre DEMO_SETS n'est qu'un jeu d'exemples réels (trouvés en ligne)
// pour développer/tester en attendant l'import réel.
// ⚠️ EN: I could not confirm the exact Bungie Manifest table name that
// describes these sets (too recent a feature). The structure below is
// deliberately generic and ready to be wired to it; the DEMO_SETS registry
// is just a set of real-world examples (found online) to develop/test
// against until the real import is wired up.

import { DefinitionHash } from "../../types/manifest";
import { GearPiece } from "../../types/build";
import { Database } from "sql.js";
import { obtenirBonusSet } from "../manifest/doctrine";

export interface ArmorSetDefinition {
  hash: DefinitionHash;
  nom: string;
  bonus2Pieces: string; // description lisible de l'effet à 2 pièces
  bonus4Pieces: string; // description lisible de l'effet à 4 pièces
  /**
   * FR : Mots-clés associés à l'effet (verbes/mécaniques), utilisés pour
   * une vérification de synergie basique avec le reste du build.
   * EN: Keywords tied to the effect (verbs/mechanics), used for a basic
   * synergy check against the rest of the build.
   */
  motsCles: string[];
}

/** FR : Exemples réels pour développement — à remplacer par l'import Manifest. / EN: Real-world examples for dev — to be replaced by the Manifest import. */
export const DEMO_SETS: Record<string, ArmorSetDefinition> = {
  "1001": {
    hash: 1001,
    nom: "Tex Mechanica",
    bonus2Pieces: "Vitesse de déplacement et maniement augmentés en tir de la hanche",
    bonus4Pieces: "Portée et précision augmentées en tir de la hanche pour les armes Tex Mechanica",
    motsCles: ["tir de la hanche", "maniement"],
  },
  "1002": {
    hash: 1002,
    nom: "Agression Continue",
    bonus2Pieces: "Les mises à mort avec une arme rechargée récemment soignent",
    bonus4Pieces: "Endommager une cible au fusil à pompe/fusion augmente les dégâts qu'elle subit de ces armes",
    motsCles: ["soin", "fusil à pompe", "fusion"],
  },
  "1003": {
    hash: 1003,
    nom: "AION Renewal",
    bonus2Pieces: "Effet Accélérateur de Vitesse d'Arc après une mise à mort en roquette/lance-grenades",
    bonus4Pieces: "Déclenche l'Accélération de Vitesse au sprint après contrôle de foule ou perte du bouclier",
    motsCles: ["arc", "vitesse", "contrôle de foule"],
  },
};

/**
 * FR : Regroupe les pièces légendaires équipées par set (ignore les
 * exotiques, qui n'appartiennent à aucun set légendaire et les pièces sans
 * setHash connu).
 * EN: Groups equipped legendary pieces by set (ignores exotics, which never
 * belong to a legendary set, and pieces with no known setHash).
 */
export function regrouperParSet(armure: GearPiece[]): Map<DefinitionHash, GearPiece[]> {
  const groupes = new Map<DefinitionHash, GearPiece[]>();
  for (const piece of armure) {
    if (piece.isExotic || !piece.setHash) continue;
    const existant = groupes.get(piece.setHash) ?? [];
    existant.push(piece);
    groupes.set(piece.setHash, existant);
  }
  return groupes;
}

export interface BonusSetActif {
  set: ArmorSetDefinition | undefined; // undefined si le set n'est pas (encore) dans notre registre
  setHash: DefinitionHash;
  nbPieces: number;
  bonus2Actif: boolean; // dès 2 pièces
  bonus4Actif: boolean; // dès 4 pièces
}

/**
 * FR : Calcule les bonus de set actifs pour une configuration d'armure.
 * EN: Computes the active set bonuses for a given armor configuration.
 */
export function calculerBonusSetsActifs(
  armure: GearPiece[],
  registre: Record<string, ArmorSetDefinition> = DEMO_SETS
): BonusSetActif[] {
  const groupes = regrouperParSet(armure);
  const resultats: BonusSetActif[] = [];
  for (const [setHash, pieces] of groupes.entries()) {
    resultats.push({
      set: registre[String(setHash)],
      setHash,
      nbPieces: pieces.length,
      bonus2Actif: pieces.length >= 2,
      bonus4Actif: pieces.length >= 4,
    });
  }
  return resultats;
}

/**
 * FR : Score de contribution des bonus de set au pilier 4 (Loot &
 * Cohérence), sur 100, + justifications lisibles. Un build sans set actif
 * n'est pas pénalisé (les sets sont un bonus, pas une obligation) ; un build
 * qui active un 4-pièces cohérent avec ses verbes/éléments est valorisé.
 * EN: Set-bonus contribution score for Pillar 4 (Loot & Coherence), out of
 * 100, with readable justifications. A build with no active set isn't
 * penalized (sets are a bonus, not a requirement); a build that activates a
 * coherent 4-piece bonus is rewarded.
 */
export function scoreBonusSets(
  armure: GearPiece[],
  motsClesBuild: string[] = [],
  registre: Record<string, ArmorSetDefinition> = DEMO_SETS
): { score: number; details: string[] } {
  const actifs = calculerBonusSetsActifs(armure, registre);
  if (actifs.length === 0) {
    return { score: 50, details: ["Aucun set d'armure détecté (neutre, pas de pénalité)"] };
  }

  let score = 50;
  const details: string[] = [];

  for (const actif of actifs) {
    const nom = actif.set?.nom ?? `set inconnu (hash ${actif.setHash})`;
    if (actif.bonus4Actif) {
      score += 30;
      details.push(`✅ Bonus 4 pièces actif : ${nom} (${actif.nbPieces} pièces)`);
    } else if (actif.bonus2Actif) {
      score += 15;
      details.push(`✅ Bonus 2 pièces actif : ${nom} (${actif.nbPieces}/4 pièces)`);
    } else {
      details.push(`ℹ️ ${actif.nbPieces} pièce(s) du set ${nom} — pas assez pour un bonus`);
    }

    // Vérification de synergie basique par mots-clés, à affiner une fois le
    // Manifest branché sur les vrais textes de perks/verbes du build.
    if (actif.set && (actif.bonus2Actif || actif.bonus4Actif)) {
      const correspond = actif.set.motsCles.some((mc) =>
        motsClesBuild.some((mb) => mb.toLowerCase().includes(mc.toLowerCase()))
      );
      if (correspond) {
        score += 10;
        details.push(`   ↳ Synergie détectée avec le reste du build (${actif.set.motsCles.join(", ")})`);
      }
    }
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), details };
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - retourne les bonus de set réellement ACTIFS
 * sur un ensemble d'armure, description comprise.
 *
 * La règle métier est simple mais facile à oublier : un bonus n'est actif
 * QUE si le nombre de pièces équipées atteint son seuil. Avec 3 pièces d'un
 * set, le bonus « 2 pièces » compte, celui de « 4 pièces » non - contrairement
 * aux perks d'armes, toujours actifs. Cette règle vivait jusqu'ici uniquement
 * dans `scoreBonusSetsReels` et dans l'encart de Mon Build ; la sortir ici
 * évite de la réécrire une 3e fois dans la détection de verbes (voir
 * `extraireTextesEffetsBuild`), avec le risque de divergence déjà rencontré
 * plusieurs fois sur ce projet.
 *
 * ⚠️ Ramène la `description`, contrairement au comptage de
 * `scoreBonusSetsReels` qui ne gardait que `nom` et `requiredSetCount` : c'est
 * la description qui contient les verbes à détecter.
 *
 * EN: ⚠️ ADDED - returns the set bonuses actually ACTIVE on a given armor
 * loadout, description included. A bonus only counts once the equipped piece
 * count reaches its threshold - unlike weapon perks, always active. Extracted
 * here so the rule isn't rewritten a 3rd time in verb detection.
 */
export function obtenirBonusSetsActifs(
  armure: GearPiece[],
  db: Database
): { nomSet: string; nbPieces: number; nom: string; description: string; requiredSetCount: number }[] {
  const parSet = new Map<string, { count: number; perks: { requiredSetCount: number; nom: string; description: string }[] }>();
  for (const piece of armure) {
    const set = obtenirBonusSet(db, piece.itemHash);
    if (!set) continue;
    const entree = parSet.get(set.nomSet) ?? { count: 0, perks: set.perks };
    entree.count += 1;
    parSet.set(set.nomSet, entree);
  }

  const actifs: { nomSet: string; nbPieces: number; nom: string; description: string; requiredSetCount: number }[] = [];
  for (const [nomSet, { count, perks }] of parSet) {
    for (const p of perks) {
      if (p.requiredSetCount <= count) {
        actifs.push({ nomSet, nbPieces: count, nom: p.nom, description: p.description, requiredSetCount: p.requiredSetCount });
      }
    }
  }
  return actifs;
}

/**
 * FR : ⚠️ AJOUT (04/08/2026) - notation des bonus de Set sur les VRAIES
 * données du Manifest, en remplacement de `scoreBonusSets` qui s'appuyait sur
 * `DEMO_SETS` (jeu d'exemples). On compte les pièces par set, puis on ne
 * retient que les paliers dont le seuil est atteint - exactement la même
 * logique que l'encart de "Mon Build", pour que les deux ne puissent pas
 * diverger.
 * EN: ⚠️ ADDED (2026-08-04) - Set bonus scoring on REAL Manifest data,
 * replacing `scoreBonusSets` which relied on `DEMO_SETS` (example data). Same
 * logic as "Mon Build"'s panel so the two cannot diverge.
 */
export function scoreBonusSetsReels(
  armure: GearPiece[],
  db?: Database
): { score: number; details: string[] } {
  if (!db) {
    return { score: 50, details: ["Bonus de Set : Manifest non chargé, non évalué"] };
  }

  const parSet = new Map<string, { count: number; perks: { requiredSetCount: number; nom: string }[] }>();
  for (const piece of armure) {
    const set = obtenirBonusSet(db, piece.itemHash);
    if (!set) continue;
    const entree = parSet.get(set.nomSet) ?? { count: 0, perks: set.perks };
    entree.count += 1;
    parSet.set(set.nomSet, entree);
  }

  if (parSet.size === 0) {
    return {
      score: 40,
      details: ["Aucun bonus de Set actif — les sets sont un plus, pas une obligation"],
    };
  }

  const details: string[] = [];
  let meilleur = 0;
  for (const [nom, { count, perks }] of parSet) {
    const actifs = perks.filter((p) => p.requiredSetCount <= count);
    if (actifs.length === 0) {
      const prochain = Math.min(...perks.map((p) => p.requiredSetCount));
      details.push(`Set « ${nom} » : ${count} pièce(s), il en faut ${prochain} pour le premier bonus`);
      continue;
    }
    details.push(
      `✅ Set « ${nom} » : ${count} pièces → ${actifs.map((p) => `${p.requiredSetCount}p ${p.nom}`).join(", ")}`
    );
    // FR : on note le MEILLEUR set plutôt que la somme : deux demi-sets ne
    // valent pas un set complet, ils valent le meilleur des deux.
    meilleur = Math.max(meilleur, actifs.length >= 2 ? 100 : 75);
  }

  return { score: meilleur || 50, details };
}
