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
import { GearPiece } from "../../types/build";
import { Database } from "sql.js";
import { obtenirBonusSet } from "../manifest/doctrine";

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
