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

// FR : ⚠️ CORRIGÉ (19/10/2026, second retour de test : « pas de filigrane de saison, pas d'indication textuelle ») - JOINTURE PAR LE HASH DE L'OBJET, la VRAIE table de DIM (`data/seasons/seasons_unfiltered.json` de d2-additional-info, MIT : 57 439 objets → numéro de saison). La première tentative (jointure par le chemin du filigrane) était FAUSSE : les chemins d'icônes du Manifest de l'utilisateur sont en HEXADÉCIMAL, pas numériques — la table `output/seasons.json` de DIM (filigrane→numéro) n'y matched jamais. La table objet→numéro résout DIRECTEMENT, sans filigrane, sans seasonHash, sans balayage : c'est le mécanisme de DIM, repris tel quel. Elle sert aussi l'INFOBULLE de l'icône de saison (partout : fenêtres Détails, vignettes) et la fiche de recherche. MAINTENANCE : régénérée avec source-filters.json (même amont).
// EN: ⚠️ FIXED - item-hash→season-number table (DIM's own join, 57 439 entries); the watermark-path join was wrong (user Manifest paths are hex, not numeric).
import saisonsObjetsJson from "./saisons-objets.json";
const SAISONS_OBJETS = saisonsObjetsJson as Record<string, number>;
/** FR : le numéro de saison d'un OBJET par son hash (table d2-additional-info), ou undefined — jamais estimé. / EN: an item's season number by its hash, or undefined. */
export function saisonDeLObjet(itemHash: number | undefined): number | undefined {
  if (itemHash == null) return undefined;
  // ⚠️ CORRIGÉ (22/10/2026, branche draft-legendarium suite 11, validé VRAI Manifest, poussé en intermédiaire sur main) : le JSON de DIM stocke les hashes en NON SIGNÉ 32 bits (ex: 2147961687), mais les hashes du Manifest (colonne `id` SQLite, champ `hash` des définitions) sont SIGNÉS (ex: -2147005609). On teste les DEUX formes : d'abord le hash tel quel (cas positif), puis sa forme non signée (cas négatif). Sans cela, la moitié des objets (hash > 0x7FFFFFFF, soit ~29 000 entrées sur 57 439) ne trouvait JAMAIS sa saison via cette table — dont les objets sans seasonHash ni filigrane connu (ex: la Mesure corrective côté Recherche dans le Manifest, les armures côté Legendarium). / EN: FIXED - DIM's JSON stores hashes as UNSIGNED 32-bit, but Manifest hashes (SQLite `id` column, `hash` field) are SIGNED. Test BOTH forms: the hash as-is (positive case), then its unsigned form (negative case). Without this, half the items (hash > 0x7FFFFFFF, ~29,000 of 57,439 entries) NEVER found their season through this table.
  const direct = SAISONS_OBJETS[String(itemHash)];
  if (direct !== undefined) return direct;
  return SAISONS_OBJETS[String(itemHash >>> 0)];
}
