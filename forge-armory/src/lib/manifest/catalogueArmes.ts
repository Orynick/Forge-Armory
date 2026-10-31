// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - CATALOGUE DES ARMES DU JEU (Forge, vue « Collection » : tout ce qui existe dans le jeu, spécification du 12/10/2026). Lu directement dans le Manifest par une requête CIBLÉE (`itemType` 3 = arme) : l'index de recherche ne conserve plus les définitions complètes, seulement un texte normalisé.
// Construit PAR MORCEAUX (le navigateur reste réactif) puis MIS EN CACHE par Manifest chargé. Les libellés (type, rareté, élément, emplacement) sont résolus EXACTEMENT comme dans l'inventaire (`inventaire.ts`) : `itemTypeDisplayName`, nom de la table des niveaux de rareté, `BUCKET_HASH_VERS_SLOT`, `obtenirElementFiltre`.
// Sont écartés : les objets sans nom ou masqués (`redacted`), les objets FACTICES (catégorie 3109687656 : ils imitent des armes sans en être), tout ce qui n'est pas dans un emplacement d'arme.
// ⚠️ Non vérifié sur un vrai Manifest au moment de l'écriture (pas d'accès réseau) : la requête suppose le JSON compact de Bungie (`"itemType":3`) ; si elle ne trouve rien, un repli lit toute la table (plus lent). Les tests utilisent un faux Manifest.
// EN: ⚠️ ADDED - catalogue of every weapon in the game, read from the Manifest with a targeted query, built in chunks and cached; labels resolved exactly like the inventory does.
import { CATEGORIE_FACTICE } from "./search";
import type { Database } from "sql.js";
import { obtenirDefinition, idSqliteVersHash } from "./download";
import { normaliser, urlIcone } from "./search";
import { BUCKET_HASH_VERS_SLOT, TIER_TYPE_HASH_EXOTIQUE } from "../../data/constantesManifest";
import { obtenirElementFiltre, obtenirArmatureArme, ElementFiltre } from "./doctrine";
import type { SlotArme } from "../../types/build";

const TABLE_OBJETS = "DestinyInventoryItemDefinition";
// FR : ⚠️ CHANGÉ (23/10/2026, audit) - constante locale remplacée par l'import depuis `search.ts` (dedup). / EN: ⚠️ CHANGED - local constant replaced by the import from `search.ts` (dedup).
const SLOTS_ARME: readonly string[] = ["cinetique", "energie", "lourde"];

export type EtatObtention = "obtenu" | "jamais" | "inconnu";

export interface ArmeCatalogue {
  hash: number;
  nom: string;
  /** FR : nom sans accents ni majuscules, pour la recherche. / EN: accent- and case-folded name for searching. */
  nomNormalise: string;
  icone?: string;
  /** FR : type lisible (« Fusil à impulsion »...). / EN: readable weapon type. */
  type?: string;
  slot: SlotArme;
  rarete?: string;
  estExotique: boolean;
  element: ElementFiltre | null;
  /** FR : armature / archétype (prise 0). / EN: frame / archetype (socket 0). */
  armature?: string;
  /** FR : absent pour un objet qui n'est pas dans les Collections du jeu : son état « obtenu / jamais obtenu » est alors inconnaissable. / EN: absent for items outside the game's Collections. */
  collectibleHash?: number;
}

interface DefArmeBrute {
  displayProperties?: { name?: string; icon?: string };
  itemType?: number;
  itemTypeDisplayName?: string;
  redacted?: boolean;
  collectibleHash?: number;
  itemCategoryHashes?: number[];
  inventory?: { bucketTypeHash?: number; tierTypeHash?: number };
}

export interface OptionsConstruction {
  /** FR : appelé à chaque morceau avec le nombre d'armes retenues jusqu'ici. / EN: called every chunk with the number of weapons kept so far. */
  onProgression?: (armesLues: number) => void;
  /** FR : nombre de lignes lues entre deux pauses. / EN: rows read between pauses. */
  tailleLot?: number;
  /** FR : rend la main au navigateur (remplacé par les tests). / EN: yields to the browser (replaced by tests). */
  pause?: () => Promise<void>;
}

const CACHE = new WeakMap<Database, Promise<ArmeCatalogue[]>>();

/** FR : lit les lignes d'armes : requête ciblée d'abord, repli sur toute la table si elle ne renvoie rien. / EN: targeted query first, whole-table fallback if it returns nothing. */
function* lignesArmes(db: Database): Generator<{ id: number; json: string }> {
  for (const ciblee of [true, false]) {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_OBJETS}${ciblee ? ` WHERE json LIKE '%"itemType":3%'` : ""}`);
    let trouve = false;
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const json = String(row.json);
        if (!ciblee && !/"itemType"\s*:\s*3\b/.test(json)) continue;   // repli : filtre grossier avant l'analyse du JSON
        trouve = true;
        yield { id: Number(row.id), json };
      }
    } finally {
      stmt.free();
    }
    if (trouve) return;
  }
}

function lireArme(db: Database, ligne: { id: number; json: string }, raretes: Map<number, string | undefined>): ArmeCatalogue | null {
  let def: DefArmeBrute;
  try { def = JSON.parse(ligne.json); } catch { return null; }
  const nom = def.displayProperties?.name?.trim();
  if (def.itemType !== 3 || !nom || def.redacted) return null;
  if (def.itemCategoryHashes?.includes(CATEGORIE_FACTICE)) return null;
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  if (!slot || !SLOTS_ARME.includes(slot)) return null;
  const hash = idSqliteVersHash(ligne.id);
  const tier = def.inventory?.tierTypeHash;
  if (tier !== undefined && !raretes.has(tier)) raretes.set(tier, obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyItemTierTypeDefinition", tier)?.displayProperties?.name);
  let armature: string | undefined;
  try { armature = obtenirArmatureArme(db, hash)?.nom; } catch { /* armature illisible : colonne simplement absente du filtre */ }
  return {
    hash, nom, nomNormalise: normaliser(nom), icone: urlIcone(def.displayProperties?.icon), type: def.itemTypeDisplayName || undefined,
    slot: slot as SlotArme, rarete: tier !== undefined ? raretes.get(tier) : undefined, estExotique: tier === TIER_TYPE_HASH_EXOTIQUE,
    element: obtenirElementFiltre(db, hash), armature, collectibleHash: def.collectibleHash || undefined,
  };
}

/** FR : construit (une seule fois par Manifest) le catalogue des armes, trié par nom. / EN: builds (once per Manifest) the weapon catalogue, sorted by name. */
export function construireCatalogueArmes(db: Database, options: OptionsConstruction = {}): Promise<ArmeCatalogue[]> {
  const existant = CACHE.get(db);
  if (existant) return existant;
  const { onProgression, tailleLot = 250, pause = () => new Promise<void>((r) => setTimeout(r, 0)) } = options;
  const promesse = (async () => {
    const armes: ArmeCatalogue[] = [];
    const raretes = new Map<number, string | undefined>();
    let lues = 0;
    for (const ligne of lignesArmes(db)) {
      const arme = lireArme(db, ligne, raretes);
      if (arme) armes.push(arme);
      if (++lues % tailleLot === 0) { onProgression?.(armes.length); await pause(); }
    }
    onProgression?.(armes.length);
    return armes.sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.hash - b.hash);
  })();
  CACHE.set(db, promesse);
  promesse.catch(() => CACHE.delete(db));   // un échec n'est pas mis en cache : on pourra réessayer
  return promesse;
}

// ------------------------------------------------------------------ filtres (fonctions pures)
export interface FiltresArmes {
  texte: string;
  type: string;
  slot: "tous" | SlotArme;
  rarete: string;
  element: "tous" | ElementFiltre;
  armature: string;
  /** FR : « collections » = les armes des Collections du jeu (défaut : sans les définitions techniques, anciennes ou dupliquées) ; « hors » = les autres ; « tout ». / EN: in-game Collections only (default), the others, or all. */
  source: "collections" | "hors" | "tout";
  obtention: "toutes" | "obtenues" | "jamais";
}
export const FILTRES_ARMES_PAR_DEFAUT: FiltresArmes = { texte: "", type: "tous", slot: "tous", rarete: "toutes", element: "tous", armature: "toutes", source: "collections", obtention: "toutes" };

/** FR : valeurs distinctes d'un champ, triées, pour remplir un menu de filtre. / EN: sorted distinct values of a field, to fill a filter menu. */
export function valeursDistinctes(armes: readonly ArmeCatalogue[], champ: "type" | "rarete" | "armature"): string[] {
  return [...new Set(armes.map((a) => a[champ]).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, "fr"));
}

/** FR : applique les filtres. `obtentionDe` donne l'état d'obtention d'une arme (« inconnu » si les collections n'ont pas pu être lues). / EN: applies the filters. */
export function filtrerArmes(armes: readonly ArmeCatalogue[], f: FiltresArmes, obtentionDe: (a: ArmeCatalogue) => EtatObtention): ArmeCatalogue[] {
  const mots = normaliser(f.texte).split(/\s+/).filter(Boolean);
  return armes.filter((a) => {
    if (f.source === "collections" && !a.collectibleHash) return false;
    if (f.source === "hors" && a.collectibleHash) return false;
    if (f.type !== "tous" && a.type !== f.type) return false;
    if (f.slot !== "tous" && a.slot !== f.slot) return false;
    if (f.rarete !== "toutes" && a.rarete !== f.rarete) return false;
    if (f.element !== "tous" && a.element !== f.element) return false;
    if (f.armature !== "toutes" && a.armature !== f.armature) return false;
    if (f.obtention !== "toutes") { const e = obtentionDe(a); if (e !== (f.obtention === "obtenues" ? "obtenu" : "jamais")) return false; }
    if (mots.length) { const texte = `${a.nomNormalise} ${normaliser(a.type ?? "")} ${normaliser(a.armature ?? "")}`; if (!mots.every((m) => texte.includes(m))) return false; }
    return true;
  });
}
