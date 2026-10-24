import type { CSSProperties } from "react";
import type { GearPiece } from "../../types/build";

// FR : ⚠️ AJOUT (23/10/2026, audit) - styles et couleurs PARTAGÉS des quatre
// fenêtres « liste » (InventaireArmes, InventaireArmures, CollectionArmes,
// CollectionArmures) : `styleChamp` et `couleurRarete` y étaient copiés
// À L'IDENTIQUE. `couleurRarete` accepte une pièce d'équipement (GearPiece)
// OU un élément de catalogue ({ estExotique, rarete }) : les deux formes
// partagent la même règle (exotique = or, légendaire = violet, sinon gris).
// EN: ⚠️ ADDED - styles and colors SHARED by the four "list" windows:
// `styleChamp` and `couleurRarete` were copied IDENTICALLY in all four.

/** FR : style commun des champs de filtre (input/select) des fenêtres liste. / EN: shared style for the list windows' filter fields. */
export const styleChamp = {
  fontSize: "0.85rem",
  background: "#0d0f14",
  color: "#e8e6df",
  border: "1px solid #3a3f4b",
  borderRadius: 6,
  padding: "0.3rem 0.4rem",
} as const satisfies CSSProperties;

type AvecRarete = { estExotique?: boolean; isExotic?: boolean; rarete?: string };

/**
 * FR : couleur de bordure selon la rareté : exotique = or (#ceae33),
 * légendaire = violet (#7a4fa3), sinon gris (#4a4f5c).
 * EN: border color by rarity: exotic = gold, legendary = purple, else grey.
 */
export function couleurRarete(p: AvecRarete): string {
  const exotique = p.estExotique ?? p.isExotic ?? false;
  return exotique ? "#ceae33" : p.rarete === "Légendaire" ? "#7a4fa3" : "#4a4f5c";
}

/** FR : raccourci pour une pièce d'équipement. / EN: shortcut for an equipment piece. */
export function couleurRaretePiece(p: GearPiece): string {
  return couleurRarete(p);
}
