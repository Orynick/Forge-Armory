// FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - PERKS AMÉLIORÉS : appariement d'un perk et de sa version améliorée dans une colonne (Forge, vue Collection). Écrit d'après les QUATRE DIAGNOSTICS de l'utilisateur (deux Confiance, Défense dorée, Grande Faucheuse temps perdu, 13/10/2026), sur la révision « à paliers » de Confiance :
//  - une version améliorée est un OBJET DISTINCT (autre hash), de MÊME NOM que sa version de base, dans la MÊME colonne, typé « Canon amélioré », « Chargeur amélioré », « Attribut amélioré », « Particularité d'origine améliorée » ou « Mod d'arme amélioré » (la catégorie de plug est la même que celle de la base : `barrels`, `magazines`, `frames`, `origins`...) ;
//  - dans les 53 paires normales de la révision A, la version améliorée vient TOUJOURS APRÈS sa version de base dans la colonne ;
//  - cas ambigu observé une fois (« Chargeur abandonné », colonne des chargeurs) : les deux versions ont le même type, sans le mot « amélioré » ; la seconde est posée au milieu d'un bloc d'améliorés : elle est donc reconnue PAR SA POSITION, et signalée comme NON CONFIRMÉE ;
//  - un objet « amélioré » sans base (modificateurs de statistiques « Stabilité améliorée », « Amélioration de palier ») reste une option ordinaire ; les colonnes cosmétiques ou d'ornement ne sont jamais appariées (leurs doublons sont autre chose : paliers de masterwork, revêtements).
// Règle de repli par la position : appliquée SEULEMENT dans une colonne qui contient déjà au moins un perk typé « amélioré » (sinon deux homonymes ne sont pas des jumeaux). Une arme dont le Manifest ne donne qu'une option par colonne (Confiance révision B, Défense dorée) ne produit aucune paire.
// Fonction PURE (le type de chaque option est fourni par l'appelant). EN: ⚠️ ADDED - pairs a perk with its enhanced twin within a column (same name, enhanced type, listed after the base; positional fallback only in columns that already hold typed enhanced perks).
import type { Database } from "sql.js";
import { obtenirDefinition } from "./download";
import { normaliser } from "./search";

/** FR : le type affiché d'un objet « amélioré » (FR : amélioré, améliorée ; EN : Enhanced). / EN: the displayed type of an enhanced item. */
export const MOT_TYPE_AMELIORE = /am[eé]lior|enhanced/i;

export interface OptionJumelee<T> {
  option: T;
  /** FR : la version améliorée de ce perk, si elle existe dans la colonne. / EN: its enhanced twin, if present in the column. */
  ameliore?: T;
  /** FR : vrai si l'appariement ne repose que sur la position (le Manifest ne nomme pas cette version « améliorée »). / EN: true when the pairing relies on position only. */
  incertain?: boolean;
}

export function apparierPerksAmeliores<T extends { hash: number; nom: string }>(options: readonly T[], estAmeliore: (o: T) => boolean): OptionJumelee<T>[] {
  const marques = options.map((o) => estAmeliore(o));
  const colonneAvecAmeliores = marques.some(Boolean);
  const parNom = new Map<string, number[]>();
  options.forEach((o, i) => { const cle = normaliser(o.nom); const liste = parNom.get(cle); if (liste) liste.push(i); else parNom.set(cle, [i]); });
  const jumeau = new Map<number, { index: number; incertain: boolean }>();
  const absorbes = new Set<number>();
  for (const indices of parNom.values()) {
    if (indices.length !== 2) continue;
    const [i, j] = indices;
    if (marques[i] && marques[j]) continue;                                   // deux « améliorés » : rien à apparier
    if (marques[i] !== marques[j]) {                                          // cas normal : exactement un des deux est typé « amélioré »
      const base = marques[i] ? j : i, ameliore = marques[i] ? i : j;
      jumeau.set(base, { index: ameliore, incertain: false }); absorbes.add(ameliore);
    } else if (colonneAvecAmeliores) {                                        // aucun n'est typé : le second dans l'ordre, SEULEMENT dans une colonne qui contient des améliorés
      jumeau.set(i, { index: j, incertain: true }); absorbes.add(j);
    }
  }
  return options.flatMap((o, i) => {
    if (absorbes.has(i)) return [];
    const j = jumeau.get(i);
    return [j ? { option: o, ameliore: options[j.index], ...(j.incertain ? { incertain: true } : {}) } : { option: o }];
  });
}

/** FR : vrai si le type affiché de cet objet dans le Manifest est « amélioré ». Lecture du Manifest (à utiliser quand on ouvre une arme, pas pour chaque carte). / EN: true if the item's displayed type is "enhanced". */
export function typeEstAmeliore(db: Database, itemHash: number): boolean {
  const def = obtenirDefinition<{ itemTypeDisplayName?: string }>(db, "DestinyInventoryItemDefinition", itemHash);
  return MOT_TYPE_AMELIORE.test(def?.itemTypeDisplayName ?? "");
}
