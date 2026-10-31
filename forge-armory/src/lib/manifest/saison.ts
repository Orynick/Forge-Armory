// FR : ⚠️ AJOUT (14/10/2026, v0.4.11), demande de l'utilisateur : l'ICÔNE DE SAISON d'une arme ou d'une armure (dans les fenêtres Détails, à droite du nom ; sur les vignettes). Source : le Manifest de Bungie, sans table à entretenir (les saisons futures s'ajoutent toutes seules) :
//   - l'IMAGE = le « filigrane » de l'objet (`iconWatermark` dans `DestinyInventoryItemDefinition`) : une image transparente de la TAILLE DE LA VIGNETTE avec le symbole de la saison dessiné en haut à gauche ET une bande sombre translucide derrière lui (c'est ce que le jeu superpose à la vignette) ; à défaut, `iconWatermarkShelved` (hypothèse, non vérifiée) ;
//   - le NOM = `seasonHash` de l'objet → table `DestinySeasonDefinition` (nom dans la langue du Manifest, numéro de saison). La table des saisons peut être absente d'un Manifest : toute erreur de lecture est avalée, l'icône s'affiche alors sans nom.
// ⚠️ AJOUT (14/10/2026, soir), demande de l'utilisateur : « chercher un autre moyen d'afficher le vrai nom » : les diagnostics de l'utilisateur ont montré que beaucoup d'objets (Mesure corrective, As de pique, Eyasluna) ont un filigrane mais PAS de `seasonHash`. Or tous les objets d'une même saison partagent la MÊME image de filigrane : on NOMME donc un objet sans `seasonHash` d'après les AUTRES objets du Manifest qui ont la même image ET un `seasonHash` (même principe que le tableau « filigrane → saison » de DIM, mais construit sur le Manifest de l'utilisateur, sans rien recopier). Le balayage se fait UNE fois par Manifest, EN ARRIÈRE-PLAN, par petites tranches (l'affichage ne se fige pas), au premier besoin ; quand il est fini, les icônes se mettent à jour. Si plusieurs saisons se disputent une image, la plus fréquente l'emporte. Un objet qui a son propre `seasonHash` n'est jamais renommé.
// Un objet sans filigrane (anciens objets, certaines exotiques) n'a pas d'icône : on ne devine rien. EN: ⚠️ ADDED - season icon of an item: watermark image + season name; for items without `seasonHash`, the name is deduced from other items sharing the same watermark (background scan, majority vote), never throws, never guesses.
import type { Database, Statement } from "sql.js";
import { obtenirDefinition } from "./download";
import { urlIcone } from "./search";

export interface InfoSaison {
  /** FR : URL de l'image « filigrane » (taille de la vignette, symbole en haut à gauche). / EN: watermark image URL. */
  filigrane: string;
  nom?: string;
  numero?: number;
  hashSaison?: number;
  /** FR : vrai si le nom vient des AUTRES objets de même filigrane (l'objet n'a pas de `seasonHash`). / EN: true when the name was deduced from other items. */
  nomDeduit?: boolean;
}

interface DefObjetSaison { iconWatermark?: string; iconWatermarkShelved?: string; seasonHash?: number }
interface DefSaison { displayProperties?: { name?: string }; seasonNumber?: number }

// ---------- le balayage « filigrane → saison » ----------
interface IndexSaisons {
  etat: "attente" | "encours" | "fini";
  /** FR : filigrane (chemin) → { saison → nombre d'objets de référence }. / EN: watermark path → season → number of reference items. */
  carte: Map<string, Map<number, number>>;
  objetsAvecSaison: number;
  version: number;
  ecouteurs: Set<() => void>;
  fin: Promise<void>;
}
const indexes = new WeakMap<Database, IndexSaisons>();
function obtenirIndex(db: Database): IndexSaisons {
  let idx = indexes.get(db);
  if (!idx) { idx = { etat: "attente", carte: new Map(), objetsAvecSaison: 0, version: 0, ecouteurs: new Set(), fin: Promise.resolve() }; indexes.set(db, idx); }
  return idx;
}
const compter = (carte: Map<string, Map<number, number>>, filigrane: string, saison: number) => {
  let m = carte.get(filigrane);
  if (!m) { m = new Map(); carte.set(filigrane, m); }
  m.set(saison, (m.get(saison) ?? 0) + 1);
};
/** FR : la saison la plus fréquente pour l'un des filigranes donnés (le principal d'abord) ; à égalité, la première rencontrée. / EN: the most frequent season for the given watermarks. */
function saisonDuFiligrane(idx: IndexSaisons, filigranes: (string | undefined)[]): number | undefined {
  for (const f of filigranes) {
    const m = f ? idx.carte.get(f) : undefined;
    if (!m) continue;
    let meilleure: number | undefined, max = 0;
    for (const [saison, n] of m) if (n > max) { max = n; meilleure = saison; }
    if (meilleure !== undefined) return meilleure;
  }
  return undefined;
}
/** FR : lance le balayage (une seule fois par Manifest). Les objets qui ont un `seasonHash` sont lus par tranches d'environ 12 ms pour ne pas figer l'affichage ; à la fin, les écouteurs sont prévenus. Aucune erreur n'en sort : en cas de problème, le balayage s'arrête avec ce qu'il a trouvé. / EN: starts the background scan (once per Manifest), in ~12 ms slices. */
export function demarrerIndexSaisons(db: Database): IndexSaisons {
  const idx = obtenirIndex(db);
  if (idx.etat !== "attente") return idx;
  idx.etat = "encours";
  idx.fin = new Promise<void>((resolve) => {
    let stmt: Statement | null = null;
    const terminer = () => {
      try { stmt?.free(); } catch { /* sans importance */ }
      idx.etat = "fini"; idx.version++;
      idx.ecouteurs.forEach((cb) => { try { cb(); } catch { /* un écouteur fautif ne bloque pas les autres */ } });
      resolve();
    };
    const pas = () => {
      try {
        if (!stmt) stmt = db.prepare(`SELECT json FROM DestinyInventoryItemDefinition WHERE json LIKE '%"seasonHash":%'`);
        const debut = Date.now();
        while (Date.now() - debut < 12) {
          if (!stmt.step()) { terminer(); return; }
          const json = String(stmt.getAsObject().json ?? "");
          const s = /"seasonHash":(\d+)/.exec(json);
          if (!s) continue;
          const saison = Number(s[1]);
          idx.objetsAvecSaison++;
          for (const motif of [/"iconWatermark":"([^"]+)"/, /"iconWatermarkShelved":"([^"]+)"/]) { const f = motif.exec(json); if (f) compter(idx.carte, f[1], saison); }
        }
        setTimeout(pas, 0);
      } catch { terminer(); }
    };
    setTimeout(pas, 0);
  });
  return idx;
}
/** FR : pour les tests : se résout quand le balayage est fini. / EN: for tests: resolves when the scan is done. */
export const attendreIndexSaisons = (db: Database): Promise<void> => demarrerIndexSaisons(db).fin;
export const etatIndexSaisons = (db: Database) => { const i = obtenirIndex(db); return { etat: i.etat, objetsAvecSaison: i.objetsAvecSaison, filigranes: i.carte.size }; };
/** FR : pour React (`useSyncExternalStore`) : le numéro de version change quand le balayage se termine. / EN: for React: the version changes when the scan ends. */
export const versionSaisons = (db: Database): number => obtenirIndex(db).version;
export function abonnerSaisons(db: Database, rappel: () => void): () => void {
  const idx = obtenirIndex(db);
  idx.ecouteurs.add(rappel);
  return () => { idx.ecouteurs.delete(rappel); };
}

// ---------- la saison d'un objet ----------
const memoire = new WeakMap<Database, Map<number, { v: number; info: InfoSaison | null }>>();

export function obtenirSaisonObjet(db: Database | null | undefined, itemHash: number | undefined): InfoSaison | undefined {
  if (!db || !itemHash) return undefined;
  let m = memoire.get(db);
  if (!m) { m = new Map(); memoire.set(db, m); }
  const version = obtenirIndex(db).version;
  const connu = m.get(itemHash);
  if (connu && connu.v === version) return connu.info ?? undefined;
  let info: InfoSaison | null = null;
  try {
    const def = obtenirDefinition<DefObjetSaison>(db, "DestinyInventoryItemDefinition", itemHash);
    const filigrane = urlIcone(def?.iconWatermark || def?.iconWatermarkShelved);
    if (filigrane) {
      info = { filigrane };
      let hashSaison = def?.seasonHash;
      if (!hashSaison) {
        // pas de `seasonHash` sur l'objet : on le nomme d'après les autres objets de même filigrane (balayage en arrière-plan)
        const idx = obtenirIndex(db);
        if (idx.etat === "attente") demarrerIndexSaisons(db);
        else if (idx.etat === "fini") { hashSaison = saisonDuFiligrane(idx, [def?.iconWatermark, def?.iconWatermarkShelved]); if (hashSaison) info.nomDeduit = true; }
      }
      if (hashSaison) {
        info.hashSaison = hashSaison;
        try {
          const s = obtenirDefinition<DefSaison>(db, "DestinySeasonDefinition", hashSaison);
          if (s?.displayProperties?.name) info.nom = s.displayProperties.name;
          if (typeof s?.seasonNumber === "number") info.numero = s.seasonNumber;
        } catch { /* table des saisons absente : l'icône s'affiche sans nom */ }
      }
    }
  } catch { info = null; }
  m.set(itemHash, { v: version, info });
  return info ?? undefined;
}

/** FR : le texte de survol / le nom accessible de l'icône. / EN: hover text / accessible name. */
export const libelleSaison = (info: InfoSaison): string => (info.nom ? `${info.nom}${info.numero ? ` (saison ${info.numero})` : ""}` : "Saison de l'objet");

/** FR : DIAGNOSTIC (mode développement) : ce que le Manifest dit de la saison d'un objet, et ce que le balayage « filigrane → saison » en déduit, pour contrôler ces données sur les objets de l'utilisateur (même quand il n'y a pas de filigrane). / EN: dev diagnostic of an item's season data and of what the watermark scan deduces. */
export function diagnosticSaisonObjet(db: Database, itemHash: number): string {
  try {
    const def = obtenirDefinition<DefObjetSaison>(db, "DestinyInventoryItemDefinition", itemHash);
    let saison = "—";
    if (def?.seasonHash) {
      try { const s = obtenirDefinition<DefSaison>(db, "DestinySeasonDefinition", def.seasonHash); saison = s ? `${s.displayProperties?.name ?? "(sans nom)"}, n° ${s.seasonNumber ?? "?"}` : "(introuvable dans la table des saisons)"; } catch { saison = "(table des saisons illisible)"; }
    }
    const idx = etatIndexSaisons(db);
    const info = obtenirSaisonObjet(db, itemHash);
    const deduit = def?.seasonHash ? "" : ` | déduite des autres objets de même filigrane : ${info?.nomDeduit ? `${info.nom ?? "(saison sans nom)"}${info.numero ? `, n° ${info.numero}` : ""}` : idx.etat === "fini" ? "AUCUNE (aucun autre objet de ce filigrane n'a de seasonHash)" : "balayage " + (idx.etat === "encours" ? "en cours" : "pas encore lancé")}`;
    return `Saison : seasonHash = ${def?.seasonHash ?? "ABSENT"} → ${saison} | filigrane : ${def?.iconWatermark ?? "ABSENT"}${def?.iconWatermarkShelved ? ` | filigrane « shelved » : ${def.iconWatermarkShelved}` : ""}${deduit} | balayage des saisons : ${idx.etat}, ${idx.objetsAvecSaison} objet(s) du Manifest ont un seasonHash, ${idx.filigranes} filigrane(s) reliés à une saison`;
  } catch (e) {
    return `Saison : lecture impossible (${(e as Error).message})`;
  }
}
