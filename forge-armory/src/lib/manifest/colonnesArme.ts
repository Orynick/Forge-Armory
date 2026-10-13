// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - RÈGLES D'AFFICHAGE DES COLONNES d'une arme, UNE SEULE SOURCE pour la popup « Détails » (Inventaire, Coffre ET Mon Build) et pour la Forge. Elles étaient jusqu'ici écrites deux fois à l'identique dans les deux popups ; la spécification de la Forge exige de
// réutiliser « la logique de tri validée » (consigne du 12/10/2026). Ces deux règles sont le résultat de plusieurs allers-retours avec l'utilisateur (voir le journal d'août 2026) et NE DOIVENT PAS être modifiées sans test dans les trois endroits :
//   1. les colonnes sortent dans l'ordre des prises du Manifest, puis les colonnes de MODS CONNUS passent EN BAS (tri stable) : elles ne sont jamais masquées, seulement reléguées ;
//   2. une colonne s'appelle « Colonne N » (N = numéro de prise + 1 : ce numéro n'est PAS stable d'une arme à l'autre, on ne le nomme donc pas sémantiquement) ou « Mods utilisables » pour les mods connus.
// Interdit (régressions déjà vécues) : filtrer par catégorie parente, par mot-clé « mod » ou par nombre d'options. EN: ⚠️ ADDED - single source of the weapon column display rules shared by the Details popups and the Forge.
import type { ColonneOptionsArme } from "./doctrine";

/** FR : ordre d'affichage : ordre des prises, mods connus en bas (tri STABLE : à égalité, l'ordre d'origine est conservé). / EN: display order, known mods last (stable). */
export function ordonnerColonnesPourAffichage<T extends Pick<ColonneOptionsArme, "estModConnu">>(colonnes: readonly T[]): T[] {
  return [...colonnes].sort((a, b) => (a.estModConnu ? 1 : 0) - (b.estModConnu ? 1 : 0));
}

/** FR : étiquette d'une colonne. / EN: column label. */
export function libelleColonne(col: Pick<ColonneOptionsArme, "estModConnu" | "socketIndex">): string {
  return col.estModConnu ? "Mods utilisables" : `Colonne ${col.socketIndex + 1}`;
}
