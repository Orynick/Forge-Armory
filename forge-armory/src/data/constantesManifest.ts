// FR : Constantes de hash Destiny 2 stables depuis des années (systeme de
// "buckets" d'inventaire) - utilisees pour savoir a quel emplacement
// (arme cinetique/energie/lourde, casque/gants/torse/jambes/marque)
// appartient un objet, a partir de sa definition Manifest.
// ⚠️ Non re-verifiees en conditions reelles par manque d'acces reseau dans
// mon environnement - a confirmer/ajuster si un objet se classe mal une
// fois teste avec de vrais objets (regardez alors bucketTypeHash sur
// l'objet dans les resultats de recherche pour comparer).
// EN: Destiny 2 hash constants, stable for years (inventory "bucket"
// system) - used to determine which slot (kinetic/energy/power weapon,
// helmet/gauntlets/chest/legs/class item) an item belongs to, from its
// Manifest definition.
// ⚠️ Not re-verified in real conditions due to no network access in my
// environment - confirm/adjust if an item gets misclassified once tested
// with real items (check bucketTypeHash on the item in search results to
// compare).

import { SlotArme, SlotArmure } from "../types/build";

export const BUCKET_HASH_VERS_SLOT: Record<number, SlotArme | SlotArmure> = {
  1498876634: "cinetique", // Kinetic Weapons
  2465295065: "energie", // Energy Weapons
  953998645: "lourde", // Power Weapons
  3448274439: "casque", // Helmet
  3551918588: "gants", // Gauntlets
  14239492: "torse", // Chest Armor
  20886954: "jambes", // Leg Armor
  1585787867: "marque", // Class Armor (Marque/Cape/Manteau selon la classe)
};

/** FR : Bucket "Subclass" - vérifié via un ticket GitHub officiel Bungie (stable depuis 2017). / EN: "Subclass" bucket - verified via an official Bungie GitHub issue (stable since 2017). */
export const BUCKET_HASH_SOUS_CLASSE = 3284755031;

/** FR : Hash du "TierType" Exotique - marque une pièce comme exotique. / EN: "TierType" hash for Exotic - flags a piece as exotic. */
export const TIER_TYPE_HASH_EXOTIQUE = 2759499571;

/** FR : classType Bungie (0=Titan,1=Chasseur,2=Arcaniste,3=Aucune restriction) -> notre type. / EN: Bungie classType (0=Titan,1=Hunter,2=Warlock,3=No restriction) -> our type. */
export const CLASS_TYPE_VERS_CLASSE: Record<number, "titan" | "chasseur" | "arcaniste"> = {
  0: "titan",
  1: "chasseur",
  2: "arcaniste",
};
