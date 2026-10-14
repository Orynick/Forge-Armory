// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - anti-champion des ARMES EXOTIQUES d'après la LISTE
// DE RÉFÉRENCE de l'utilisateur (data/exotiquesAntiChampion.ts, relevée DANS LE JEU, noms
// français, jugée fiable par l'utilisateur : « tout y est »). Elle PASSE AVANT la
// déduction de l'appli (`deduireAntiChampion` dans doctrine.ts : champ breakerType, texte
// du perk intrinsèque, nom de l'armature), qui peut se tromper pour une exotique (cas de
// Mille voix, noté le 04/08). Le rapprochement se fait par le NOM français de l'arme dans
// le Manifest : normalisé (accents, ligatures, apostrophes, ponctuation). Un nom ABSENT de
// la liste (exotique récente, nom différent) retombe sur la déduction : rien ne casse.
//
// Fonction PURE (pas de Manifest) : testée hors de l'appli.
// EN: ⚠️ ADDED - exotic weapons' anti-champion from the user's in-game REFERENCE LIST, which
// takes PRIORITY over the app's deduction. Matched by normalised French name; a name not in
// the list falls back to the deduction.

import type { TypeChampion } from "../../components/icones/IconeAntiChampion";
import { REFERENCE_EXOTIQUES_ANTI_CHAMPION } from "../../data/exotiquesAntiChampion";

/**
 * FR : normalisation des noms pour le rapprochement : sans accents, minuscules, ligatures
 * (œ, æ) développées, apostrophes typographiques unifiées, ponctuation et espaces ramenés à
 * un seul espace. « Maitre du tonnerre » retrouve ainsi « Maître du tonnerre ».
 * EN: name normalisation for matching.
 */
export function normaliserNomArme(nom: string): string {
  return nom
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9'+.]+/g, " ")
    .trim();
}

/** FR : éléments pouvant terminer un nom de variante (« Ergo Sum solaire »), déjà normalisés. / EN: element words ending a variant name. */
const ELEMENTS_VARIANTES = ["cryo electrique", "electrique", "solaire", "abyssale", "abyssal", "stase", "cryo", "vide", "arc", "filaments"];

type Valeur = TypeChampion | null;

function construireTable(): Map<string, Valeur> {
  const table = new Map<string, Valeur>();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) table.set(normaliserNomArme(e.nom), e.champion);

  // FR : variantes d'une même arme distinguées par un ÉLÉMENT dans la liste (« Ergo Sum
  // solaire / abyssale / cryo-électrique »), alors que le Manifest les nomme peut-être
  // toutes « Ergo Sum ». Le nom de base reçoit un alias SEULEMENT si au moins deux variantes
  // le partagent ET donnent le même résultat. Règle volontairement étroite (éléments connus
  // seulement), pour ne jamais créer d'alias au hasard.
  // EN: variants told apart by an element in the list also get their base name as an alias,
  // only when >= 2 variants share it with the same result.
  const variantes = new Map<string, Valeur[]>();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) {
    const nom = normaliserNomArme(e.nom);
    const suffixe = ELEMENTS_VARIANTES.find((el) => nom.endsWith(" " + el));
    if (!suffixe) continue;
    const base = nom.slice(0, nom.length - suffixe.length - 1).trim();
    if (base) variantes.set(base, [...(variantes.get(base) ?? []), e.champion]);
  }
  for (const [base, valeurs] of variantes) {
    if (valeurs.length >= 2 && valeurs.every((v) => v === valeurs[0]) && !table.has(base)) table.set(base, valeurs[0]);
  }
  return table;
}

const TABLE = construireTable();

/**
 * FR : anti-champion d'une arme exotique d'après la liste de référence, trouvé par son NOM
 * (français). Trois résultats :
 *   - un type (« surcharge », « implacable », « bloqueur ») ;
 *   - `null` : l'arme est dans la liste SANS anti-champion (7 armes) ;
 *   - `undefined` : nom ABSENT de la liste : l'appelant retombe sur la déduction.
 * EN: exotic weapon's anti-champion from the list, by (French) name. null = listed without
 * one; undefined = not in the list.
 */
export function championDeReference(nomArme: string | undefined): Valeur | undefined {
  if (!nomArme) return undefined;
  const v = TABLE.get(normaliserNomArme(nomArme));
  return v === undefined ? undefined : v;
}

/**
 * FR : ⚠️ AJOUT (14/10/2026, v0.4.8), demande de l'utilisateur (« l'antichampion n'apparaît pas ») - règle de l'ARMATURE « SYNERGIE MIDA » : les deux armes qui la portent ont le MÊME nom d'armature, c'est donc le NOM DE L'ARME qui décide :
 *   armature « Synergie MIDA » + arme « Outil POLYVALENT MIDA » = anti-SURCHARGE ;
 *   armature « Synergie MIDA » + arme « Outil MACRO MIDA »      = anti-IMPLACABLE.
 * Ni l'une ni l'autre n'est dans la liste de référence (qui ne connaît que l'ancien nom « Outil multifonction MIDA », bloqueur, conservé tel quel) et la déduction par armature ne connaissait pas « Synergie MIDA ». Rapprochement sans accents ni majuscules, par MOT du nom (« polyvalent », « macro ») : une arme qui porte l'armature mais dont le nom n'a aucun de ces mots reste SANS réponse (undefined) : on ne devine pas.
 * Fonction PURE, appelée par la déduction d'origine (`deduireAntiChampion`, doctrine.ts). EN: ⚠️ ADDED - the "MIDA Synergy" frame rule: the weapon NAME decides (polyvalent = overload, macro = unstoppable); unknown names stay undefined.
 */
export function championSynergieMIDA(nomArme: string | undefined, nomArmature: string | undefined): TypeChampion | undefined {
  if (!nomArme || !nomArmature) return undefined;
  if (!normaliserNomArme(nomArmature).includes("synergie mida")) return undefined;
  const nom = normaliserNomArme(nomArme);
  if (/\bpolyvalent\b/.test(nom)) return "surcharge";
  if (/\bmacro\b/.test(nom)) return "implacable";
  return undefined;
}
