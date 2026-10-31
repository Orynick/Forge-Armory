// FR : ⚠️ AJOUT (14/10/2026, v0.4.10), demande de l'utilisateur : « peut-on identifier les armes qui ont été forgées (perks fixes, modifiables en jeu sur un outil spécifique) ? ». Une arme FAÇONNÉE (« forgée ») porte, dans l'une de ses prises, le perk équipé « Arme façonnée » (hash 4029346515). Constaté sur le diagnostic réel de la Mesure corrective (prise 10), ABSENT de la Confiance et de l'Outil polyvalent MIDA, qui ne sont pas façonnées.
// Sur une arme façonnée, les colonnes de perks ne listent chacune QUE le perk équipé (constat réel : un seul perk « disponible » par colonne, celui qui est équipé) : les autres perks ne se choisissent qu'à la FORGE EN JEU (table de façonnage), pas librement.
// Détection : le hash connu, OU, en repli, le NOM du perk (« Arme façonnée » en français, « Crafted Weapon » en anglais, comparé sans accents ni majuscules) au cas où d'autres armes utiliseraient un autre hash ; ce repli demande le Manifest, et ses réponses sont gardées en mémoire par Manifest pour ne pas le relire cent fois. Le nom anglais est une SUPPOSITION (non vérifié). EN: ⚠️ ADDED - identifies crafted weapons by their equipped "Arme façonnée" plug (known hash, or name fallback).
import type { Database } from "sql.js";
import { obtenirDefinition } from "../manifest/download";
import { normaliser } from "../manifest/search";

export const PLUG_ARME_FACONNEE = 4029346515;
const NOMS_PLUG_FACONNEE = ["arme faconnee", "crafted weapon"];
const memoire = new WeakMap<Database, Map<number, boolean>>();

function plugFaconneParNom(db: Database, hash: number): boolean {
  let m = memoire.get(db);
  if (!m) { m = new Map(); memoire.set(db, m); }
  const connu = m.get(hash);
  if (connu !== undefined) return connu;
  const nom = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyInventoryItemDefinition", hash)?.displayProperties?.name;
  const reponse = !!nom && NOMS_PLUG_FACONNEE.includes(normaliser(nom));
  m.set(hash, reponse);
  return reponse;
}

/** FR : vrai si les perks équipés d'une arme contiennent le perk « Arme façonnée ». / EN: true if the weapon's equipped plugs include the "crafted weapon" plug. */
export function estFaconnee(db: Database | null, perkHashes: number[] | undefined): boolean {
  if (!perkHashes || perkHashes.length === 0) return false;
  if (perkHashes.includes(PLUG_ARME_FACONNEE)) return true;
  return !!db && perkHashes.some((h) => plugFaconneParNom(db, h));
}
