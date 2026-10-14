// FR : ⚠️ AJOUT (14/10/2026, v0.4.11), demande de l'utilisateur : l'ICÔNE DE SAISON d'une arme ou d'une armure (dans les fenêtres Détails, à droite du nom ; sur les vignettes). Source : le Manifest de Bungie, sans table à entretenir (les saisons futures s'ajoutent toutes seules) :
//   - l'IMAGE = le « filigrane » de l'objet (`iconWatermark` dans `DestinyInventoryItemDefinition`) : une image transparente de la TAILLE DE LA VIGNETTE avec le symbole de la saison dessiné en haut à gauche (c'est ce que le jeu superpose à la vignette) ; à défaut, `iconWatermarkShelved` (hypothèse, non vérifiée sur les données de l'utilisateur) ;
//   - le NOM = `seasonHash` de l'objet → table `DestinySeasonDefinition` (nom dans la langue du Manifest, numéro de saison). La table des saisons peut être absente d'un Manifest : toute erreur de lecture est avalée, l'icône s'affiche alors sans nom.
// Un objet sans filigrane (anciens objets, certaines exotiques) n'a pas d'icône : on ne devine rien. Les réponses sont gardées en mémoire par Manifest. EN: ⚠️ ADDED - season icon of an item: the item's watermark image and the season name from the Seasons table; never throws, never guesses.
import type { Database } from "sql.js";
import { obtenirDefinition } from "./download";
import { urlIcone } from "./search";

export interface InfoSaison {
  /** FR : URL de l'image « filigrane » (taille de la vignette, symbole en haut à gauche). / EN: watermark image URL. */
  filigrane: string;
  nom?: string;
  numero?: number;
  hashSaison?: number;
}

const memoire = new WeakMap<Database, Map<number, InfoSaison | null>>();
interface DefObjetSaison { iconWatermark?: string; iconWatermarkShelved?: string; seasonHash?: number }
interface DefSaison { displayProperties?: { name?: string }; seasonNumber?: number }

export function obtenirSaisonObjet(db: Database | null | undefined, itemHash: number | undefined): InfoSaison | undefined {
  if (!db || !itemHash) return undefined;
  let m = memoire.get(db);
  if (!m) { m = new Map(); memoire.set(db, m); }
  const connu = m.get(itemHash);
  if (connu !== undefined) return connu ?? undefined;
  let info: InfoSaison | null = null;
  try {
    const def = obtenirDefinition<DefObjetSaison>(db, "DestinyInventoryItemDefinition", itemHash);
    const filigrane = urlIcone(def?.iconWatermark || def?.iconWatermarkShelved);
    if (filigrane) {
      info = { filigrane };
      if (def?.seasonHash) {
        info.hashSaison = def.seasonHash;
        try {
          const s = obtenirDefinition<DefSaison>(db, "DestinySeasonDefinition", def.seasonHash);
          if (s?.displayProperties?.name) info.nom = s.displayProperties.name;
          if (typeof s?.seasonNumber === "number") info.numero = s.seasonNumber;
        } catch { /* table des saisons absente : l'icône s'affiche sans nom */ }
      }
    }
  } catch { info = null; }
  m.set(itemHash, info);
  return info ?? undefined;
}

/** FR : le texte de survol / le nom accessible de l'icône. / EN: hover text / accessible name. */
export const libelleSaison = (info: InfoSaison): string => (info.nom ? `${info.nom}${info.numero ? ` (saison ${info.numero})` : ""}` : "Saison de l'objet");

/** FR : DIAGNOSTIC (mode développement) : ce que le Manifest dit de la saison d'un objet, pour contrôler cette donnée sur les objets de l'utilisateur (même quand il n'y a pas de filigrane). / EN: dev diagnostic of an item's season data. */
export function diagnosticSaisonObjet(db: Database, itemHash: number): string {
  try {
    const def = obtenirDefinition<DefObjetSaison>(db, "DestinyInventoryItemDefinition", itemHash);
    let saison = "—";
    if (def?.seasonHash) {
      try { const s = obtenirDefinition<DefSaison>(db, "DestinySeasonDefinition", def.seasonHash); saison = s ? `${s.displayProperties?.name ?? "(sans nom)"}, n° ${s.seasonNumber ?? "?"}` : "(introuvable dans la table des saisons)"; } catch { saison = "(table des saisons illisible)"; }
    }
    return `Saison : seasonHash = ${def?.seasonHash ?? "ABSENT"} → ${saison} | filigrane : ${def?.iconWatermark ?? "ABSENT"}${def?.iconWatermarkShelved ? ` | filigrane « shelved » : ${def.iconWatermarkShelved}` : ""}`;
  } catch (e) {
    return `Saison : lecture impossible (${(e as Error).message})`;
  }
}
