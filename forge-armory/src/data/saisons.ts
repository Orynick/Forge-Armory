// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - TABLE DE CORRESPONDANCE DES SAISONS, dérivée de d2-additional-info (Destiny Item Manager, licence MIT : https://github.com/DestinyItemManager/d2-additional-info).
// Pourquoi ce fichier alors que `lib/manifest/saison.ts` résout DÉJÀ le nom d'une saison depuis le Manifest (`DestinySeasonDefinition`) ? PRINCIPE DE CONCEPTION conservé : le Manifest reste la source PRINCIPALE. Ce fichier est le SOCLE du numéro de saison (la jointure watermark → numéro vient de `output/seasons.json` de DIM, 4 488 filigranes → numéros) et le SECOURS des noms quand la table des saisons du Manifest est absente (des Manifests tronqués existent) ; il ajoute aussi ce que le Manifest ne donne PAS : les dates de début/fin et l'extension. MAINTENANCE : une ligne par saison, mise à jour MANUELLE à chaque saison (le dernier `fin: null` marque la saison en cours). Les noms sont des données Bungie ; le petit print de Bungie s'applique.
// EN: ⚠️ ADDED - season lookup table derived from d2-additional-info (MIT). The Manifest stays the primary source; this file is the season-number backbone (watermark→number join), the fallback for names on truncated Manifests, and the only place with start/end dates and DLC.
export interface SaisonFA {
  /** FR : numéro de saison (1 = Red War, 28 = Renegades). / EN: season number. */
  numero: number;
  /** FR : nom complet anglais officiel (« Season of the Forge », « Episode Revenant »). / EN: official English name. */
  nom: string;
  /** FR : partie distinctive du nom (« the Forge », « Revenant ») ou null. / EN: distinctive part of the name. */
  nomCourt: string | null;
  /** FR : « saison » ou « episode » (les saisons 24+ sont des épisodes). / EN: "saison" or "episode". */
  type: "saison" | "episode";
  /** FR : date de début (ISO). / EN: start date (ISO). */
  debut: string;
  /** FR : date de fin (ISO) ; null = saison EN COURS. / EN: end date (ISO); null = ongoing. */
  fin: string | null;
  /** FR : nom de l'extension (Red War, Forsaken…) ou null. / EN: DLC name or null. */
  extension: string | null;
}
import saisonsJson from "./seasons.json";
export const SAISONS: readonly SaisonFA[] = saisonsJson as SaisonFA[];
/** FR : une saison par SON NUMÉRO, ou undefined. / EN: a season by its number. */
export const saisonParNumero = (numero: number): SaisonFA | undefined => SAISONS.find((s) => s.numero === numero);
