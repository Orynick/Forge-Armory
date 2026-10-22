// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - MODÈLE du Legendarium : lecture des tables `DestinyLoreDefinition` et `DestinyItemDefinition` (champ `lore`) dans le cache manifeste EXISTANT (`lib/manifest/download.ts`) — AUCUN second mécanisme de téléchargement. Fonctions PURES ou à effets de lecture uniquement : rien n'écrit, rien ne persiste. / EN: Legendarium model: reads the `DestinyLoreDefinition` and `DestinyItemDefinition` (field `lore`) tables from the EXISTING manifest cache (`lib/manifest/download.ts`) — NO second download mechanism. Pure or read-only functions: nothing writes, nothing persists.
import type { Database } from "sql.js";
import { obtenirDefinition, lireTable, idSqliteVersHash } from "../manifest/download";
import { normaliser } from "../manifest/search";
import { BUCKET_HASH_VERS_SLOT, CLASS_TYPE_VERS_CLASSE } from "../../data/constantesManifest";
import { CATEGORIE_FACTICE } from "../manifest/search";
import type { DestinyCollectibleDefinition, DestinyItemDefinition, DestinyLoreDefinition, DestinyPresentationNodeDefinition, DestinyRecordDefinition } from "../../types/manifest";
import type { SlotArmure } from "../../types/build";
import type { ClasseArmure } from "../manifest/catalogueArmures";
import { saisonDeLObjet, saisonParNumero } from "../../data/saisons";
import { urlIcone } from "../manifest/search";
import type { CategorieLore, LivreLore, ObjetPorteur, PageLore, SectionLegendarium } from "./types";

const TABLE_OBJETS = "DestinyInventoryItemDefinition";
const TABLE_LORE = "DestinyLoreDefinition";
/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - tables de l'arbre de présentation (structure des livres de Lore D2). / EN: presentation-tree tables (the D2 lore book structure). */
const TABLE_NOEUDS = "DestinyPresentationNodeDefinition";
const TABLE_RECORDS = "DestinyRecordDefinition";
/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - table des collectibles (lien objet → arbre Collections, pour la PROVENANCE des armures). / EN: collectibles table (item → Collections tree link, for ARMOR PROVENANCE). */
const TABLE_COLLECTIBLES = "DestinyCollectibleDefinition";
/** FR : hash du nœud racine « Légendes » de l'onglet Lore (scope 0), vérifié sur le VRAI Manifest FR du 21/10/2026 : ses 4 enfants sont les catégories (L'Avant-garde, La Lumière, Crépuscule et aube, Les Ténèbres), leurs enfants les livres (109), leurs records les pages. / EN: hash of the Lore tab's "Legends" root node (scope 0), verified on the REAL FR Manifest of 2026-10-21: its 4 children are the categories, their children the books (109), their records the pages. */
export const HASH_RACINE_LEGENDES = 4077680549;

/** FR : ⚠️ AJOUT (21/10/2026, suite 9, diagnostic réel) - le hash de Lore d'un objet : dans le VRAI Manifest Bungie, le champ s'appelle **`loreHash`** (le diagnostic du 21/10 a montré 0 objet avec `lore` sur 38 894). `lore` est accepté en secours pour les anciennes fixtures de test. Renvoie `undefined` si l'objet n'a pas de Lore. / EN: ADDED - an item's lore hash: in the REAL Bungie Manifest, the field is **`loreHash`** (the 21/10 diagnostic showed 0 items with `lore` out of 38,894). `lore` is accepted as a fallback for old test fixtures. Returns `undefined` if the item has no lore. */
function hashLoreDe(def: DestinyItemDefinition): number | undefined {
  return def.loreHash ?? (def as { lore?: number }).lore;
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 9, diagnostic réel) - le corps du texte d'un Lore : dans le VRAI Manifest, il vit dans **`displayProperties.description`** (structure standard `DestinyDisplayPropertiesDefinition`), PAS dans un champ `body` (le diagnostic a montré 0 Lore avec `body` sur 3 514). `body` est accepté en secours pour les anciennes fixtures. Renvoie une chaîne vide si absent. / EN: ADDED - a lore's body text: in the REAL Manifest, it lives in **`displayProperties.description`** (standard `DestinyDisplayPropertiesDefinition` structure), NOT in a `body` field (the diagnostic showed 0 lores with `body` out of 3,514). `body` is accepted as a fallback for old fixtures. Returns an empty string if absent. */
function corpsLore(lore: DestinyLoreDefinition | undefined): string {
  if (!lore) return "";
  return (lore.displayProperties?.description ?? lore.body ?? "").trim();
}

/** FR : ⚠️ AJOUT (20/10/2026, décision utilisateur) - RANG CHRONOLOGIQUE d'un objet : numéro de saison de sortie, résolu dans l'ordre (1) `seasonHash` de l'objet → `DestinySeasonDefinition.seasonNumber` (Manifest, source principale), (2) table DIM `saisonDeLObjet` (hash d'objet → numéro, 57 439 entrées). Jamais estimé : un objet sans saison connue renvoie `undefined`. / EN: chronological rank of an item: release season number, resolved in order (1) the item's `seasonHash` → `DestinySeasonDefinition.seasonNumber` (Manifest, primary source), (2) the DIM table `saisonDeLObjet` (item hash → number, 57,439 entries). Never guessed: an item with no known season returns `undefined`. */
export function rangChronoObjet(db: Database | null | undefined, itemHash: number): number | undefined {
  // (1) Manifest : seasonHash de l'objet → DestinySeasonDefinition
  if (db) {
    try {
      const def = obtenirDefinition<{ seasonHash?: number }>(db, TABLE_OBJETS, itemHash);
      const hashSaison = def?.seasonHash;
      if (hashSaison !== undefined) {
        try {
          const s = obtenirDefinition<{ seasonNumber?: number }>(db, "DestinySeasonDefinition", hashSaison);
          if (typeof s?.seasonNumber === "number") return s.seasonNumber;
        } catch { /* table des saisons absente : on tente la table DIM */ }
      }
    } catch { /* objet illisible : on tente la table DIM */ }
  }
  // (2) Table DIM : hash d'objet → numéro de saison
  return saisonDeLObjet(itemHash);
}

/** FR : ⚠️ AJOUT (20/10/2026) - libellé chronologique d'un rang (ex: « Saison 12 · Ombres du Cauchemar »), ou undefined. Le nom vient de la table des saisons (`saisonParNumero`, dérivée de d2-additional-info) : le Manifest n'est pas consulté ici (le rang suffit). / EN: chronological label of a rank (e.g. "Season 12 · Shadowkeep"), or undefined. The name comes from the seasons table (`saisonParNumero`, derived from d2-additional-info). */
export function libelleRangChrono(rang: number | undefined): string | undefined {
  if (rang === undefined) return undefined;
  const s = saisonParNumero(rang);
  const nom = s?.nomCourt ?? s?.nom ?? `Saison ${rang}`;
  return s?.extension ? `${nom} · ${s.extension}` : nom;
}

const SLOTS_ARMURE: readonly SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];

/** FR : ordre de lecture des emplacements d'armure, VERROUILLÉ (spécification §3). / EN: locked armor slot reading order (spec §3). */
export const ORDRE_SLOTS_ARMURE: readonly SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];

/** FR : ordre des classes, VERROUILLÉ (spécification §3 : Titan, Chasseur, Arcaniste). / EN: locked class order (spec §3: Titan, Hunter, Warlock). */
export const ORDRE_CLASSES: readonly ClasseArmure[] = ["titan", "chasseur", "arcaniste"];

/** FR : les quatre sections, DANS L'ORDRE GLOBAL verrouillé. / EN: the four sections, IN the locked global order. */
export const SECTIONS: ReadonlyArray<{ id: SectionLegendarium; libelle: string }> = [
  { id: "grimoire", libelle: "Grimoire D1" },
  { id: "legendes", libelle: "Légendes D2" },
  { id: "objets", libelle: "Armes et Armures" }, // ⚠️ CHANGÉ (22/10/2026, suite 11, remarque utilisateur : majuscule à « Armures »)
  { id: "cosmetiques", libelle: "Cosmétiques et utilitaires" },
];

/** FR : libellé d'un emplacement d'armure (pour la fiche d'un objet porteur). / EN: armor slot label (for a carrier item's sheet). */
export function libelleSlot(slot: SlotArmure): string {
  switch (slot) {
    case "casque": return "Casque";
    case "gants": return "Gants";
    case "torse": return "Torse";
    case "jambes": return "Jambes";
    case "marque": return "Objet de classe";
  }
}

/** FR : libellé d'une classe. / EN: class label. */
export function libelleClasse(classe: ClasseArmure): string {
  switch (classe) {
    case "titan": return "Titan";
    case "chasseur": return "Chasseur";
    case "arcaniste": return "Arcaniste";
  }
}

/** FR : emplacement lisible d'un objet (« Fusil à pompe », « Casque · Titan »). / EN: readable item slot ("Shotgun", "Helmet · Titan"). */
function emplacementObjet(def: DestinyItemDefinition): string {
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  const classe = def.classType !== undefined ? CLASS_TYPE_VERS_CLASSE[def.classType] : undefined;
  if (slot && SLOTS_ARMURE.includes(slot as SlotArmure)) {
    return classe ? `${libelleSlot(slot as SlotArmure)} · ${libelleClasse(classe)}` : libelleSlot(slot as SlotArmure);
  }
  return def.itemTypeDisplayName?.trim() || "Objet";
}

/** FR : classe d'un objet porteur (armures uniquement). / EN: class of a carrier item (armor only). */
function classeObjet(def: DestinyItemDefinition): ClasseArmure | undefined {
  return def.classType !== undefined ? CLASS_TYPE_VERS_CLASSE[def.classType] : undefined;
}

/** FR : emplacement d'armure d'un objet porteur (armures uniquement). / EN: armor slot of a carrier item (armor only). */
function slotArmureObjet(def: DestinyItemDefinition): SlotArmure | undefined {
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  return slot && SLOTS_ARMURE.includes(slot as SlotArmure) ? (slot as SlotArmure) : undefined;
}

/** FR : un objet est un porteur de Lore éligible s'il a un nom, n'est ni masqué ni factice, et possède un champ `lore`. / EN: an item is an eligible lore carrier if it has a name, is neither redacted nor a dummy, and has a `lore` field. */
function estPorteur(def: DestinyItemDefinition): boolean {
  return hashLoreDe(def) !== undefined && Boolean(def.displayProperties?.name?.trim()) && !def.redacted && !def.itemCategoryHashes?.includes(CATEGORIE_FACTICE);
}

/** FR : lit un Lore par son hash, sans jamais planter (texte vide si absent). / EN: reads a lore by hash, never throws (empty text if absent). */
export function lireLore(db: Database | null | undefined, loreHash: number | undefined): DestinyLoreDefinition | undefined {
  if (!db || loreHash === undefined) return undefined;
  try {
    return obtenirDefinition<DestinyLoreDefinition>(db, TABLE_LORE, loreHash);
  } catch {
    return undefined;
  }
}

/** FR : ⚠️ CHANGÉ (20/10/2026, décision utilisateur) - la page de Lore d'un objet, ou `undefined` si l'objet n'en a pas (le bouton « Lire le Lore » n'apparaît que quand elle existe). DÉDOUBLONNAGE : l'identifiant de la page est `"lore:<hashLore>"` (UNE page par Lore), et le TITRE est le NOM DE L'OBJET (pas le titre interne du Lore) — « pour cette section, tout comme pour la section des cosmétiques, on utilise le nom de l'objet comme titre de la page de Lore ». Les rééditions (objets différents partageant le même Lore) ne créent PAS de page en double : tous les porteurs sont embarqués dans `porteurs` pour le parcours inverse. / EN: the lore page of an item, or `undefined` if it has none (the "Read the Lore" button only appears when it exists). DEDUPLICATION: the page id is `"lore:<loreHash>"` (ONE page per lore), and the TITLE is the ITEM'S NAME — reissues (different items sharing the same lore) do NOT create a duplicate page: all carriers are embedded in `porteurs` for the reverse path. */
export function pageLoreObjet(db: Database | null | undefined, itemHash: number): PageLore | undefined {
  if (!db) return undefined;
  let def: DestinyItemDefinition | undefined;
  try {
    def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, itemHash);
  } catch {
    return undefined;
  }
  const hashLore = def ? hashLoreDe(def) : undefined;
  if (!def || !estPorteur(def) || hashLore === undefined) return undefined;
  const lore = lireLore(db, hashLore);
  const nom = def.displayProperties?.name?.trim() || "Objet sans nom";
  const texte = corpsLore(lore);
  if (!texte) return undefined;
  return {
    id: `lore:${hashLore}`,
    titre: nom,
    sousTitre: lore?.subtitle?.trim() || undefined,
    texte,
    loreHash: hashLore,
    porteurs: porteursDeLore(db, hashLore),
    // ⚠️ AJOUT (20/10/2026, décision utilisateur) : rang chronologique (ordre de sortie) — numéro de saison du porteur principal, jamais estimé
    rangChrono: rangChronoObjet(db, itemHash),
    libelleChrono: libelleRangChrono(rangChronoObjet(db, itemHash)),
  };
}

/** FR : ⚠️ AJOUT (20/10/2026, décision utilisateur) - l'identifiant stable de la page de Lore atteinte depuis une fiche Détails : la forme du lien profond `"item:<hashObjet>"` est résolue en `"lore:<hashLore>"` (forme de la page, dédoublonnée). Renvoie `undefined` si l'objet n'a pas de Lore. / EN: the stable id of the lore page reached from a Details sheet: the deep-link form `"item:<itemHash>"` resolves to `"lore:<loreHash>"` (page form, deduplicated). Returns `undefined` if the item has no lore. */
export function idPageDepuisObjet(db: Database | null | undefined, itemHash: number): string | undefined {
  return pageLoreObjet(db, itemHash)?.id;
}

/** FR : ⚠️ AJOUT (21/10/2026, étape 5) - version LÉGÈRE de « l'objet a-t-il une page de Lore ? » pour le BOUTON « Lire le Lore » des fiches Détails : 2 lectures ciblées (définition de l'objet, définition du Lore), AUCUN balayage de la table (contrairement à `pageLoreObjet`, qui embarque les porteurs via l'index). Appelée à chaque rendu de fiche ouverte : elle doit rester bon marché. / EN: ⚠️ ADDED - LIGHTWEIGHT "does this item have a lore page?" for the "Read the Lore" button of Details sheets: 2 targeted reads (item definition, lore definition), NO table scan (unlike `pageLoreObjet`, which embeds carriers via the index). Called on every open-sheet render: it must stay cheap. */
export function aLore(db: Database | null | undefined, itemHash: number): boolean {
  if (!db) return false;
  let def: DestinyItemDefinition | undefined;
  try {
    def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, itemHash);
  } catch {
    return false;
  }
  const hashLore = def ? hashLoreDe(def) : undefined;
  if (!def || !estPorteur(def) || hashLore === undefined) return false;
  return Boolean(corpsLore(lireLore(db, hashLore)));
}

/** FR : résultat du diagnostic dev des Lores (étape 5, suite 8) : vérifie, avec le VRAI Manifest de l'utilisateur, si la table `DestinyLoreDefinition` existe et contient des entrées, et si les objets portent un champ `lore`. C'est la seule façon de savoir pourquoi le bouton « Lire le Lore » n'apparaît pas. / EN: result of the dev lore diagnostic (step 5, suite 8): checks, with the user's REAL Manifest, whether the `DestinyLoreDefinition` table exists and has entries, and whether items carry a `lore` field. The only way to know why the "Read the Lore" button doesn't show. */
export interface DiagnosticLore {
  /** FR : la table `DestinyLoreDefinition` existe-t-elle dans le Manifest ? / EN: does the `DestinyLoreDefinition` table exist in the Manifest? */
  tableLoreExiste: boolean;
  /** FR : nombre d'entrées dans `DestinyLoreDefinition`. / EN: entry count in `DestinyLoreDefinition`. */
  nbLores: number;
  /** FR : nombre d'entrées de Lore avec un corps de texte non vide (lu dans `displayProperties.description`, secours `body`). / EN: lore entries with a non-empty body (read from `displayProperties.description`, fallback `body`). */
  nbLoresAvecCorps: number;
  /** FR : la table `DestinyInventoryItemDefinition` existe-t-elle ? / EN: does the `DestinyInventoryItemDefinition` table exist? */
  tableObjetsExiste: boolean;
  /** FR : nombre total d'objets lus (balayage complet, dev uniquement). / EN: total items read (full scan, dev only). */
  nbObjets: number;
  /** FR : nombre d'objets portant un champ `loreHash` (dans le vrai Manifest ; `lore` accepté en secours). / EN: items carrying a `loreHash` field (in the real Manifest; `lore` accepted as fallback). */
  nbObjetsAvecLore: number;
  /** FR : parmi eux, nombre d'objets éligibles (nommés, non masqués, non factices) dont le Lore a un corps. / EN: among them, eligible items (named, not redacted, not dummy) whose lore has a body. */
  nbObjetsAvecLoreLisible: number;
  /** FR : quelques exemples d'objets avec Lore lisible (hash + nom), pour vérifier en fiche. / EN: a few examples of items with readable lore (hash + name), to check in a sheet. */
  exemples: { hash: number; nom: string }[];
  /** FR : message d'erreur si une table est absente (la requête lève). / EN: error message if a table is missing (the query throws). */
  erreur?: string;
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 8) - DIAGNOSTIC dev : pourquoi le bouton « Lire le Lore » n'apparaît-il pas ? Un seul balayage de la table des objets (dev uniquement, jamais en production). Ne modifie rien, ne persiste rien. / EN: ADDED - DEV DIAGNOSTIC: why doesn't the "Read the Lore" button show? One scan of the items table (dev only, never in production). Changes nothing, persists nothing. */
export function diagnostiquerLore(db: Database | null | undefined): DiagnosticLore | null {
  if (!db) return null;
  // Table des Lores
  let tableLoreExiste = true, nbLores = 0, nbLoresAvecCorps = 0;
  try {
    const lores = lireTable<DestinyLoreDefinition>(db, TABLE_LORE);
    nbLores = Object.keys(lores).length;
    nbLoresAvecCorps = Object.values(lores).filter((l) => corpsLore(l)).length;
  } catch (e) {
    tableLoreExiste = false;
    return { tableLoreExiste, nbLores, nbLoresAvecCorps, tableObjetsExiste: true, nbObjets: 0, nbObjetsAvecLore: 0, nbObjetsAvecLoreLisible: 0, exemples: [], erreur: `Table ${TABLE_LORE} absente ou illisible : ${(e as Error).message}` };
  }
  // Table des objets : un seul balayage
  let tableObjetsExiste = true, nbObjets = 0, nbObjetsAvecLore = 0, nbObjetsAvecLoreLisible = 0;
  const exemples: { hash: number; nom: string }[] = [];
  try {
    const objets = lireTable<DestinyItemDefinition>(db, TABLE_OBJETS);
    for (const [idSqlite, def] of Object.entries(objets)) {
      nbObjets++;
      const hashLore = def ? hashLoreDe(def) : undefined;
      if (hashLore === undefined) continue;
      nbObjetsAvecLore++;
      if (!estPorteur(def)) continue;
      const lore = lireLore(db, hashLore);
      if (!corpsLore(lore)) continue;
      nbObjetsAvecLoreLisible++;
      if (exemples.length < 5) {
        const nom = def.displayProperties?.name?.trim();
        if (nom) exemples.push({ hash: idSqliteVersHash(+idSqlite), nom });
      }
    }
  } catch (e) {
    tableObjetsExiste = false;
    return { tableLoreExiste, nbLores, nbLoresAvecCorps, tableObjetsExiste, nbObjets, nbObjetsAvecLore, nbObjetsAvecLoreLisible, exemples, erreur: `Table ${TABLE_OBJETS} absente ou illisible : ${(e as Error).message}` };
  }
  return { tableLoreExiste, nbLores, nbLoresAvecCorps, tableObjetsExiste, nbObjets, nbObjetsAvecLore, nbObjetsAvecLoreLisible, exemples };
}

/** FR : l'objet porteur d'une page de Lore, pour le parcours inverse (depuis la page, voir l'objet). / EN: the carrier item of a lore page, for the reverse path (from the page, see the item). */
export function objetPorteur(db: Database | null | undefined, itemHash: number): ObjetPorteur | undefined {
  if (!db) return undefined;
  let def: DestinyItemDefinition | undefined;
  try {
    def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, itemHash);
  } catch {
    return undefined;
  }
  const nom = def?.displayProperties?.name?.trim();
  if (!def || !nom || !estPorteur(def)) return undefined;
  return {
    hash: itemHash,
    nom,
    emplacement: emplacementObjet(def),
    classe: classeObjet(def),
    slotArmure: slotArmureObjet(def),
  };
}

/** FR : ⚠️ AJOUT (21/10/2026, étape 2) - INDEX des porteurs de Lore, construit en UN SEUL balayage de la table des objets et mis en cache par base (WeakMap) : `porteursDeLore` et les constructeurs de livres le lisent ensuite en O(1). Sans cet index, construire les livres appelait `porteursDeLore` pour CHAQUE porteur, et chaque appel re-balayait la table (~60 000 lignes) — des milliers de balayages, la page figerait. / EN: ⚠️ ADDED - lore-carrier INDEX, built in ONE scan of the items table and cached per database (WeakMap): `porteursDeLore` and the book builders then read it in O(1). Without it, building the books called `porteursDeLore` for EVERY carrier, and each call re-scanned the table (~60,000 rows) — thousands of scans, the page would freeze. */
interface IndexPorteurs {
  /** FR : porteurs de la section « objets » (armes + armures). / EN: "objets" section carriers (weapons + armor). */
  objets: ObjetPorteur[];
  /** FR : porteurs de la section « cosmétiques » (Spectres, Vaisseaux, Passereaux…). / EN: "cosmétiques" section carriers (Ghosts, Ships, Sparrows…). */
  cosmetiques: ObjetPorteur[];
  /** FR : porteurs groupés par hash de Lore (parcours inverse + dédoublonnage). / EN: carriers grouped by lore hash (reverse path + dedup). */
  parLore: Map<number, ObjetPorteur[]>;
  /** FR : hashes de Lore référencés par au moins un objet (pour exclure les Lores d'objets de la section « légendes »). / EN: lore hashes referenced by at least one item (to keep item lores out of the "légendes" section). */
  loresReferencies: Set<number>;
}

const cacheIndexPorteurs = new WeakMap<Database, IndexPorteurs>();

function indexPorteurs(db: Database): IndexPorteurs {
  const enCache = cacheIndexPorteurs.get(db);
  if (enCache) return enCache;
  const index: IndexPorteurs = { objets: [], cosmetiques: [], parLore: new Map(), loresReferencies: new Set() };
  let lignes: Array<{ id: number; json: string }>;
  try {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_OBJETS}`);
    lignes = [];
    while (stmt.step()) lignes.push(stmt.getAsObject() as { id: number; json: string });
    stmt.free();
  } catch {
    cacheIndexPorteurs.set(db, index);
    return index;
  }
  for (const ligne of lignes) {
    let def: DestinyItemDefinition;
    try {
      def = JSON.parse(ligne.json) as DestinyItemDefinition;
    } catch {
      continue;
    }
    const hashLore = hashLoreDe(def);
    if (!estPorteur(def) || hashLore === undefined) continue;
    const nom = def.displayProperties?.name?.trim();
    if (!nom) continue;
    const porteur: ObjetPorteur = {
      hash: idSqliteVersHash(ligne.id),
      nom,
      emplacement: emplacementObjet(def),
      classe: classeObjet(def),
      slotArmure: slotArmureObjet(def),
    };
    const estArmure = porteur.slotArmure !== undefined;
    // ⚠️ CHANGÉ (22/10/2026, suite 11, validation VRAI Manifest) : un objet va dans la section « objets » (armes + armures) quand il a un bucket arme (cinétique/énergie/lourde) OU un bucket armure (casque/gants/torse/jambes/marque) — PAS seulement `itemType !== 3`. Dans le vrai Manifest, les ORNEMENTS D'ARMURE (itemType 0, ex: « Gantelets de fureur résonnante », bucket 2422292810 = ornements) ont un `itemTypeDisplayName` « Gantelets » mais ne SONT PAS des armures : sans ce critère, 1 178 ornements/cosmétiques étaient classés « armes » (groupe « Autres armes »). Les vrais armes (itemType 3) ont toujours un bucket arme ; les vraies armures (itemType 2) un bucket armure.
    const bucket = def.inventory?.bucketTypeHash;
    const estArmeReelle = bucket === 1498876634 || bucket === 2465295065 || bucket === 953998645; // cinétique/énergie/lourde
    const estCosmetique = !estArmure && !estArmeReelle; // ni armure (bucket armure) ni arme (bucket arme)
    if (estCosmetique) index.cosmetiques.push(porteur);
    else index.objets.push(porteur);
    const groupe = index.parLore.get(hashLore);
    if (groupe) groupe.push(porteur);
    else index.parLore.set(hashLore, [porteur]);
    index.loresReferencies.add(hashLore);
  }
  cacheIndexPorteurs.set(db, index);
  return index;
}

/** FR : tri des porteurs d'armures selon la RÈGLE VERROUILLÉE : regroupés par classe (Titan, Chasseur, Arcaniste), ordre casque → gants → torse → jambes → objet de classe. / EN: sorts armor carriers by the LOCKED RULE: grouped by class (Titan, Hunter, Warlock), order helmet → gauntlets → chest → legs → class item. */
export function trierArmuresParEnsemble(p: ObjetPorteur[]): ObjetPorteur[] {
  const rangClasse = (c?: ClasseArmure) => (c === undefined ? ORDRE_CLASSES.length : ORDRE_CLASSES.indexOf(c));
  const rangSlot = (s?: SlotArmure) => (s === undefined ? ORDRE_SLOTS_ARMURE.length : ORDRE_SLOTS_ARMURE.indexOf(s));
  return [...p].sort((a, b) => rangClasse(a.classe) - rangClasse(b.classe) || rangSlot(a.slotArmure) - rangSlot(b.slotArmure) || a.nom.localeCompare(b.nom, "fr"));
}

/** FR : ⚠️ AJOUT (20/10/2026, décision utilisateur) - TRI CHRONOLOGIQUE des pages (ordre de sortie des extensions/saisons, PAR DÉFAUT dans la bibliothèque) : les pages DATÉES d'abord, par `rangChrono` croissant (numéro de saison), puis les pages NON DATÉES (rang inconnu) par titre. La règle des ensembles d'armures (classe → casque → gants → torse → jambes → objet de classe) reste le classement PAR DÉFAUT de la section « objets » : le tri chronologique s'applique aux AUTRES livres (armes, cosmétiques) et peut être proposé comme vue alternative. Jamais estimé : une page sans rang connu n'est pas datée. / EN: chronological sort of pages (release order of extensions/seasons, DEFAULT in the library): dated pages first, by ascending `rangChrono` (season number), then undated pages by title. The armor-set rule (class → helmet → gauntlets → chest → legs → class item) stays the DEFAULT sorting of the "objets" section: the chronological sort applies to the OTHER books (weapons, cosmetics) and can be offered as an alternative view. Never guessed: a page with no known rank is not dated. */
export function trierPagesChrono(pages: PageLore[]): PageLore[] {
  const rang = (p: PageLore) => (p.rangChrono === undefined ? Number.POSITIVE_INFINITY : p.rangChrono);
  return [...pages].sort((a, b) => rang(a) - rang(b) || a.titre.localeCompare(b.titre, "fr") || a.id.localeCompare(b.id));
}

/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - buckets d'armes (emplacement) avec leur libellé de GROUPE repliable, dans l'ordre demandé par l'utilisateur : Cinétiques, Énergétiques, Lourdes. Le bucket se lit dans `inventory.bucketTypeHash` (vérifié sur le VRAI Manifest FR : 281 cinétiques, 323 énergétiques, 175 lourdes parmi les armes avec Lore). / EN: weapon buckets with their COLLAPSIBLE GROUP label, in the user's order: Kinetic, Energy, Heavy. The bucket is read from `inventory.bucketTypeHash` (verified on the REAL FR Manifest: 281 kinetic, 323 energy, 175 heavy among weapons with lore). */
const GROUPES_ARMES: ReadonlyArray<{ slot: "cinetique" | "energie" | "lourde"; libelle: string }> = [
  { slot: "cinetique", libelle: "Cinétiques" },
  { slot: "energie", libelle: "Énergétiques" },
  { slot: "lourde", libelle: "Lourdes" },
];

/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - itemType des COSMÉTIQUES avec leur libellé de groupe, dans l'ordre demandé : Spectres (itemType 24 = « Coque de Spectre »), Vaisseaux (itemType 21 = « Vaisseau »), Passereaux (itemType 22 = « Véhicule »). Vérifié sur le VRAI Manifest FR. Tout autre itemType avec Lore part dans « Autres ». / EN: cosmetic itemTypes with their group label, in the user's order: Ghosts (itemType 24 = \"Ghost Shell\"), Ships (itemType 21 = \"Ship\"), Sparrows (itemType 22 = \"Vehicle\"). Verified on the REAL FR Manifest. Any other itemType with lore goes to \"Other\". */
const GROUPES_COSMETIQUES: ReadonlyArray<{ itemType: number; libelle: string }> = [
  { itemType: 24, libelle: "Spectres" },
  { itemType: 21, libelle: "Vaisseaux" },
  { itemType: 22, libelle: "Passereaux" },
];

/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - index des COLLECTIBLES et des NŒUDS DE PRÉSENTATION, construits en UN SEUL balayage chacun et mis en cache par base (WeakMap). Sert à résoudre la PROVENANCE d'une armure : objet → `collectibleHash` → collectible → `parentNodeHashes[0]` = nœud ENSEMBLE (ex: « Armure de Sekris », 5 collectibles = 5 pièces). Sans cet index, chaque armure déclencherait 2 lectures ciblées (collectible + nœud). / EN: COLLECTIBLE and PRESENTATION-NODE index, each built in ONE scan and cached per database (WeakMap). Used to resolve an armor piece's PROVENANCE: item → `collectibleHash` → collectible → `parentNodeHashes[0]` = SET node (e.g. \"Armure de Sekris\", 5 collectibles = 5 pieces). Without this index, each armor piece would trigger 2 targeted reads (collectible + node). */
interface IndexProvenance {
  /** FR : hash de collectible → nœud ensemble parent (hash du nœud de présentation). / EN: collectible hash → parent SET node (presentation node hash). */
  noeudEnsembleParCollectible: Map<number, number>;
  /** FR : hash de nœud → nom du nœud. / EN: node hash → node name. */
  nomNoeud: Map<number, string>;
}

const cacheIndexProvenance = new WeakMap<Database, IndexProvenance>();

function indexProvenance(db: Database): IndexProvenance {
  const enCache = cacheIndexProvenance.get(db);
  if (enCache) return enCache;
  const index: IndexProvenance = { noeudEnsembleParCollectible: new Map(), nomNoeud: new Map() };
  // Nœuds de présentation : index nom par hash (une seule requête, comme `lireNoeudsPresentation` mais indexé différemment pour la provenance)
  try {
    const noeuds = lireNoeudsPresentation(db);
    for (const [hash, def] of noeuds) {
      const nom = def.displayProperties?.name?.trim();
      if (nom) index.nomNoeud.set(hash, nom);
    }
  } catch { /* table absente : pas de provenance */ }
  // Collectibles : un seul balayage
  try {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_COLLECTIBLES}`);
    while (stmt.step()) {
      const ligne = stmt.getAsObject() as { id: number; json: string };
      try {
        const def = JSON.parse(ligne.json) as DestinyCollectibleDefinition;
        const parents = def.parentNodeHashes ?? [];
        if (parents.length > 0) index.noeudEnsembleParCollectible.set(idSqliteVersHash(ligne.id), parents[0]);
      } catch { continue; }
    }
    stmt.free();
  } catch { /* table absente : pas de provenance */ }
  cacheIndexProvenance.set(db, index);
  return index;
}

/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - PROVENANCE d'une armure = nom de son ENSEMBLE (nœud parent du collectible, ex: « Armure de Sekris » pour une armure du raid Léviathan). Résolution : `def.collectibleHash` → collectible → `parentNodeHashes[0]` → nœud → nom. Renvoie `undefined` si l'armure n'a pas de collectible ou si la chaîne est rompue (l'armure part alors dans le groupe « Autres armures »). / EN: an armor piece's PROVENANCE = its SET's name (the collectible's parent node, e.g. \"Armure de Sekris\" for a Leviathan raid armor piece). Resolution: `def.collectibleHash` → collectible → `parentNodeHashes[0]` → node → name. Returns `undefined` if the armor has no collectible or the chain is broken (the armor then goes to the \"Other armor\" group). */
function provenanceArmure(db: Database, def: DestinyItemDefinition): string | undefined {
  const ch = def.collectibleHash;
  if (ch === undefined) return undefined;
  const index = indexProvenance(db);
  const noeudSet = index.noeudEnsembleParCollectible.get(ch);
  if (noeudSet === undefined) return undefined;
  return index.nomNoeud.get(noeudSet);
}

/** FR : ⚠️ AJOUT (22/10/2026, suite 11) - DEDUP des pages (une page par Lore, titre = nom du porteur principal), partagé entre les constructeurs de livres. / EN: page DEDUP (one page per lore, title = main carrier's name), shared between the book builders. */
function dedupPages(db: Database, liste: ObjetPorteur[]): PageLore[] {
  const vus = new Set<string>();
  const pages: PageLore[] = [];
  for (const p of liste) {
    const page = pageLoreObjet(db, p.hash);
    if (!page || vus.has(page.id)) continue;
    vus.add(page.id);
    if (page.porteurs && page.porteurs.length > 0) {
      const principal = page.porteurs.find((x) => x.hash === p.hash) ?? page.porteurs[0];
      pages.push({ ...page, titre: principal.nom });
    } else {
      pages.push(page);
    }
  }
  return pages;
}

/** FR : ⚠️ CHANGÉ (22/10/2026, suite 12, remarques utilisateur) - construit les livres de la section « objets » : les ARMES forment des livres « liste de pages » (un par type : Cinétiques, Énergétiques, Lourdes, puis « Autres armes » si besoin) — la colonne latérale affiche chaque livre comme un REPLIABLE (replié par défaut) listant le NOM DE CHAQUE ARME (clic direct vers la page de son Lore), pages par ordre chronologique. Les ARMURES restent dans un groupe repliable « Ensembles d'armures » avec UN LIVRE PAR ENSEMBLE (provenance = nœud parent du collectible, ex: « Armure de Sekris »), les ensembles ordonnés par ordre chronologique de sortie des saisons, les pièces d'un ensemble dans l'ordre verrouillé (casque → gants → torse → jambes → marque). Les armures SANS provenance connue vont dans un livre « Autres armures » (ordre verrouillé). / EN: CHANGED - builds the "objets" section's books: WEAPONS become "pages-list" books (one per type: Kinetic, Energy, Heavy, then "Other weapons" if needed) — the sidebar shows each book as a COLLAPSIBLE group (collapsed by default) listing EACH WEAPON'S NAME (direct click to its lore page), pages chronologically. ARMOR stays in a collapsible "Ensembles d'armures" group with ONE BOOK PER SET (provenance = the collectible's parent node, e.g. "Armure de Sekris"), sets ordered by release season, pieces within a set in the locked order (helmet → gauntlets → chest → legs → class item). Armor WITHOUT known provenance goes to an "Autres armures" book (locked order). */
function livresObjets(db: Database): LivreLore[] {
  const porteurs = indexPorteurs(db).objets;
  const livres: LivreLore[] = [];

  // --- Armes : UN LIVRE « LISTE DE PAGES » PAR TYPE (Cinétiques, Énergétiques, Lourdes) ---
  // ⚠️ CHANGÉ (22/10/2026, suite 12, remarque utilisateur) : plus de groupe « Lore des armes » — chaque livre d'arme est un REPLIABLE DE NOMS (`listePages: true`, sans `groupe`) : la colonne liste le nom de chaque arme (clic direct vers sa page de Lore).
  const armes = porteurs.filter((p) => p.slotArmure === undefined);
  const armesParSlot = new Map<string, ObjetPorteur[]>();
  for (const p of armes) {
    const def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, p.hash);
    const slot = def ? BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1] : undefined;
    const cle = slot === "cinetique" || slot === "energie" || slot === "lourde" ? slot : "autre";
    const groupe = armesParSlot.get(cle) ?? [];
    groupe.push(p);
    armesParSlot.set(cle, groupe);
  }
  for (const { slot, libelle } of GROUPES_ARMES) {
    const liste = armesParSlot.get(slot) ?? [];
    const pages = trierPagesChrono(dedupPages(db, liste));
    if (pages.length === 0) continue;
    // ⚠️ AJOUT (22/10/2026, suite 12) : `listePages: true` + PAS de `groupe` → la colonne affiche ce livre comme un REPLIABLE de NOMS D'OBJETS (clic direct vers chaque page de Lore).
    livres.push({ id: `objets-armes-${slot}`, titre: libelle, pages, listePages: true });
  }
  // Armes sans bucket connu (ne devrait pas arriver, mais on ne les perd pas)
  const autresArmes = armesParSlot.get("autre") ?? [];
  if (autresArmes.length > 0) {
    const pages = trierPagesChrono(dedupPages(db, autresArmes));
    if (pages.length > 0) livres.push({ id: "objets-armes-autre", titre: "Autres armes", pages, listePages: true });
  }

  // --- Groupe « Ensembles d'armures » : un livre par ensemble (provenance) ---
  const armures = porteurs.filter((p) => p.slotArmure !== undefined);
  const parEnsemble = new Map<string, ObjetPorteur[]>();
  const sansProvenance: ObjetPorteur[] = [];
  for (const p of armures) {
    let nomEnsemble: string | undefined;
    try {
      const def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, p.hash);
      if (def) nomEnsemble = provenanceArmure(db, def);
    } catch { /* pas de provenance */ }
    if (nomEnsemble) {
      const groupe = parEnsemble.get(nomEnsemble) ?? [];
      groupe.push(p);
      parEnsemble.set(nomEnsemble, groupe);
    } else {
      sansProvenance.push(p);
    }
  }
  // Ordonner les ensembles par saison de sortie (rang chrono du premier porteur daté), puis par nom
  const rangEnsemble = (liste: ObjetPorteur[]) => {
    const rangs = liste.map((p) => rangChronoObjet(db, p.hash)).filter((r): r is number => r !== undefined);
    return rangs.length > 0 ? Math.min(...rangs) : Number.POSITIVE_INFINITY;
  };
  const ensembles = [...parEnsemble.entries()].sort((a, b) => {
    const ra = rangEnsemble(a[1]), rb = rangEnsemble(b[1]);
    return ra - rb || a[0].localeCompare(b[0], "fr");
  });
  for (const [nomEnsemble, liste] of ensembles) {
    // Pièces dans l'ordre verrouillé (classe → casque → gants → torse → jambes → marque), puis dédup des pages
    const pages = dedupPages(db, trierArmuresParEnsemble(liste));
    if (pages.length === 0) continue;
    livres.push({ id: `objets-armures-${nomEnsemble}`, titre: nomEnsemble, pages, groupe: "Ensembles d'armures" });
  }
  // Armures sans provenance : livre « Autres armures » (ordre verrouillé), APRÈS les ensembles datés
  if (sansProvenance.length > 0) {
    const pages = dedupPages(db, trierArmuresParEnsemble(sansProvenance));
    if (pages.length > 0) livres.push({ id: "objets-armures-autres", titre: "Autres armures", pages, groupe: "Ensembles d'armures" });
  }
  return livres;
}

/** FR : ⚠️ CHANGÉ (22/10/2026, suite 12, remarques utilisateur) - construit les livres de la section « cosmétiques » : UN LIVRE « LISTE DE PAGES » PAR TYPE de cosmétique (Spectres, Vaisseaux, Passereaux, dans cet ordre), pages par ordre chronologique dans chaque livre ; les autres types (artefacts, ornements…) dans un livre « Autres ». La colonne latérale affiche chaque livre comme un REPLIABLE (replié par défaut) listant le NOM DE CHAQUE OBJET (clic direct vers sa page de Lore). / EN: CHANGED - builds the "cosmétiques" section's books: ONE "PAGES-LIST" BOOK PER cosmetic type (Spectres, Vaisseaux, Passereaux, in this order), pages chronologically within each book; other types (artifacts, ornaments…) in an "Autres" book. The sidebar shows each book as a COLLAPSIBLE group (collapsed by default) listing EACH ITEM'S NAME (direct click to its lore page). */
function livreCosmetiques(db: Database): LivreLore[] {
  const porteurs = [...indexPorteurs(db).cosmetiques];
  const parType = new Map<number, ObjetPorteur[]>();
  const autres: ObjetPorteur[] = [];
  for (const p of porteurs) {
    let itemType: number | undefined;
    try {
      const def = obtenirDefinition<DestinyItemDefinition>(db, TABLE_OBJETS, p.hash);
      itemType = def?.itemType;
    } catch { /* pas de type : autres */ }
    const connu = itemType !== undefined ? GROUPES_COSMETIQUES.find((g) => g.itemType === itemType) : undefined;
    if (connu) {
      const liste = parType.get(connu.itemType) ?? [];
      liste.push(p);
      parType.set(connu.itemType, liste);
    } else {
      autres.push(p);
    }
  }
  const livres: LivreLore[] = [];
  for (const { itemType, libelle } of GROUPES_COSMETIQUES) {
    const liste = parType.get(itemType) ?? [];
    const pages = trierPagesChrono(dedupPages(db, liste));
    if (pages.length === 0) continue;
    // ⚠️ AJOUT (22/10/2026, suite 12) : `listePages: true` + PAS de `groupe` → repliable de NOMS d'objets dans la colonne.
    livres.push({ id: `cosmetiques-${libelle}`, titre: libelle, pages, listePages: true });
  }
  if (autres.length > 0) {
    const pages = trierPagesChrono(dedupPages(db, autres));
    if (pages.length > 0) livres.push({ id: "cosmetiques-autres", titre: "Autres", pages, listePages: true });
  }
  return livres;
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - lit TOUS les nœuds de présentation en UNE requête, indexés par hash (signé → non signé via `idSqliteVersHash`). Renvoie une Map vide si la table est absente (Manifest vieilli). / EN: ADDED - reads ALL presentation nodes in ONE query, indexed by hash. Returns an empty Map if the table is absent (old Manifest). */
function lireNoeudsPresentation(db: Database): Map<number, DestinyPresentationNodeDefinition> {
  const noeuds = new Map<number, DestinyPresentationNodeDefinition>();
  let lignes: Array<{ id: number; json: string }>;
  try {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_NOEUDS}`);
    lignes = [];
    while (stmt.step()) lignes.push(stmt.getAsObject() as { id: number; json: string });
    stmt.free();
  } catch {
    return noeuds;
  }
  for (const ligne of lignes) {
    try {
      const def = JSON.parse(ligne.json) as DestinyPresentationNodeDefinition;
      // ⚠️ CHANGÉ (21/10/2026, suite 10) : le hash vient de la COLONNE `id` (toujours présent dans le SQLite),
      // pas du champ `hash` du JSON (les vieilles fixtures de test peuvent ne pas le porter).
      noeuds.set(idSqliteVersHash(ligne.id), def);
    } catch {
      continue;
    }
  }
  return noeuds;
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - lit un record (page d'un livre) par son hash, sans jamais planter. / EN: ADDED - reads a record (a book's page) by hash, never throws. */
function lireRecord(db: Database, recordHash: number): DestinyRecordDefinition | undefined {
  try {
    return obtenirDefinition<DestinyRecordDefinition>(db, TABLE_RECORDS, recordHash);
  } catch {
    return undefined;
  }
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - LA STRUCTURE DES LIVRES de Lore D2, telle qu'en jeu : l'arbre `DestinyPresentationNodeDefinition` depuis la racine « Légendes » (hash 4077680549, scope 0) : catégorie → livre → pages (records avec `loreHash`). Une page = un record avec un `loreHash` dont le Lore a un corps ; TITRE = NOM DU LORE (égal au nom du record en jeu, vérifié sur le vrai Manifest). Les lores portés par des objets (109, ex: « Europe – 1 » sur l'item « Europe – 1 ») gardent leur page ici ET leur parcours inverse (porteurs). REPLI : si l'arbre est absent ou vide (Manifest vieilli), retombe sur l'ancien comportement (un livre « Tomes de Légendes », pages non référencées par des objets, triées par titre). Vérifié sur le VRAI Manifest FR du 21/10/2026 : 4 catégories, 109 livres, 1 085 pages. / EN: ADDED - the D2 LORE BOOK STRUCTURE, as in game: the `DestinyPresentationNodeDefinition` tree from the "Legends" root (hash 4077680549, scope 0): category → book → pages (records with `loreHash`). A page = a record with a `loreHash` whose lore has a body; TITLE = the LORE's NAME (equal to the record's name in game, verified on the real Manifest). Lores carried by items (109, e.g. "Europe – 1" on the item "Europe – 1") keep their page here AND their reverse path (carriers). FALLBACK: if the tree is absent or empty (old Manifest), falls back to the old behavior (one "Tomes de Légendes" book, pages not referenced by items, sorted by title). Verified on the REAL FR Manifest of 2026-10-21: 4 categories, 109 books, 1,085 pages. */
function categoriesLegendes(db: Database): CategorieLore[] {
  const noeuds = lireNoeudsPresentation(db);
  const racine = noeuds.get(HASH_RACINE_LEGENDES);
  if (!racine) return [];
  const categories: CategorieLore[] = [];
  for (const enfant of racine.children?.presentationNodes ?? []) {
    const noeudCat = noeuds.get(enfant.presentationNodeHash);
    if (!noeudCat || noeudCat.redacted || noeudCat.blacklisted) continue;
    const titreCat = noeudCat.displayProperties?.name?.trim();
    if (!titreCat) continue;
    const livres: LivreLore[] = [];
    for (const enfantLivre of noeudCat.children?.presentationNodes ?? []) {
      const noeudLivre = noeuds.get(enfantLivre.presentationNodeHash);
      if (!noeudLivre || noeudLivre.redacted || noeudLivre.blacklisted) continue;
      const titreLivre = noeudLivre.displayProperties?.name?.trim();
      if (!titreLivre) continue;
      const pages: PageLore[] = [];
      for (const enfantRecord of noeudLivre.children?.records ?? []) {
        const record = lireRecord(db, enfantRecord.recordHash);
        const hashLore = record?.loreHash;
        if (!record || record.redacted || record.blacklisted || hashLore === undefined) continue;
        const lore = lireLore(db, hashLore);
        const texte = corpsLore(lore);
        if (!texte) continue; // 17 lores sans corps sur le vrai Manifest : pages vides, exclues
        pages.push({
          id: `lore:${hashLore}`,
          titre: lore?.displayProperties?.name?.trim() || record.displayProperties?.name?.trim() || "Page sans titre",
          sousTitre: lore?.subtitle?.trim() || undefined,
          texte,
          loreHash: hashLore,
          // ⚠️ AJOUT (21/10/2026, suite 10) : les 109 lores portés par des objets gardent leur parcours inverse
          porteurs: porteursDeLore(db, hashLore),
        });
      }
      if (pages.length === 0) continue;
      livres.push({
        id: `legendes-livre:${enfantLivre.presentationNodeHash}`,
        titre: titreLivre,
        pages,
        couvertureUrl: urlIcone(noeudLivre.displayProperties?.icon),
        categorie: titreCat,
      });
    }
    if (livres.length === 0) continue;
    categories.push({ hash: enfant.presentationNodeHash, titre: titreCat, icone: noeudCat.displayProperties?.icon, livres });
  }
  return categories;
}

/** FR : une entrée DestinyLoreDefinition est une page de LÉGENDE (livre de Lore D2) quand elle n'est le Lore d'AUCUN objet du Manifest ; le Lore d'un objet (armes, armures, cosmétiques) est rangé dans les sections « objets » / « cosmétiques », jamais ici. C'est la séparation qui tient la promesse « comme en jeu » (les Légendes forment leurs propres livres). / EN: a DestinyLoreDefinition entry is a LEGENDS page (a D2 lore book) when it is the lore of NO item in the Manifest; an item's lore (weapons, armor, cosmetics) goes to the "objets"/"cosmétiques" sections, never here. This is what keeps the "like in game" promise (Legends form their own books). */
function loresLegendes(db: Database, loresObjets: Set<number>): Array<{ hash: number; lore: DestinyLoreDefinition }> {
  let lignes: Array<{ id: number; json: string }>;
  try {
    const stmt = db.prepare(`SELECT id, json FROM ${TABLE_LORE}`);
    lignes = [];
    while (stmt.step()) lignes.push(stmt.getAsObject() as { id: number; json: string });
    stmt.free();
  } catch {
    return [];
  }
  const pages: Array<{ hash: number; lore: DestinyLoreDefinition }> = [];
  for (const ligne of lignes) {
    let lore: DestinyLoreDefinition;
    try {
      lore = JSON.parse(ligne.json) as DestinyLoreDefinition;
    } catch {
      continue;
    }
    if (!corpsLore(lore)) continue;
    const hash = idSqliteVersHash(ligne.id);
    if (loresObjets.has(hash)) continue; // Lore d'un objet : rangé ailleurs
    pages.push({ hash, lore });
  }
  return pages;
}

/** FR : ⚠️ CHANGÉ (21/10/2026, suite 10) - construit les livres de la section « légendes » (D2) : la hiérarchie EN JEU (catégorie → livre → pages, couvertures) lue dans l'arbre de présentation, aplatie en livres pour la colonne latérale (la hiérarchie complète est exposée via `categoriesDeLegendes`). Si l'arbre est absent (Manifest vieilli), REPLI : un livre « Tomes de Légendes » avec les pages non référencées par des objets, triées par titre (comportement d'avant la suite 10). / EN: CHANGED - builds the "légendes" (D2) section's books: the IN-GAME hierarchy (category → book → pages, covers) read from the presentation tree, flattened to books for the sidebar (the full hierarchy is exposed via `categoriesDeLegendes`). If the tree is absent (old Manifest), FALLBACK: one "Tomes de Légendes" book with pages not referenced by items, sorted by title (pre-suite-10 behavior). */
function livresLegendes(db: Database): LivreLore[] {
  const categories = categoriesLegendes(db);
  if (categories.length > 0) return categories.flatMap((c) => c.livres);
  // Repli (Manifest sans arbre de présentation) : comportement d'avant la suite 10
  const loresObjets = indexPorteurs(db).loresReferencies;
  const pages: PageLore[] = [];
  for (const { hash, lore } of loresLegendes(db, loresObjets)) {
    pages.push({
      id: `lore:${hash}`,
      titre: lore.displayProperties?.name?.trim() || "Page sans titre",
      sousTitre: lore.subtitle?.trim() || undefined,
      texte: corpsLore(lore),
      loreHash: hash,
    });
  }
  pages.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
  return pages.length > 0 ? [{ id: "legendes", titre: "Tomes de Légendes", pages }] : [];
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - la hiérarchie complète catégorie → livre → pages de la section « légendes » (pour la colonne latérale 3 niveaux). Vide si l'arbre de présentation est absent (la colonne retombe alors sur la liste plate de livres). / EN: ADDED - the full category → book → pages hierarchy of the "légendes" section (for the 3-level sidebar). Empty if the presentation tree is absent (the sidebar then falls back to the flat book list). */
export function categoriesDeLegendes(db: Database | null | undefined): CategorieLore[] {
  if (!db) return [];
  try {
    return categoriesLegendes(db);
  } catch {
    return [];
  }
}

/** FR : les livres d'une section du Manifest D2 (les sections « grimoire » est D1, hors Manifest D2). / EN: the books of a D2 Manifest section ("grimoire" is D1, outside the D2 Manifest). */
export function livresDeSection(db: Database | null | undefined, section: SectionLegendarium): LivreLore[] {
  if (!db || section === "grimoire") return [];
  try {
    if (section === "legendes") return livresLegendes(db);
    if (section === "objets") return livresObjets(db);
    return livreCosmetiques(db);
  } catch {
    return [];
  }
}

/** FR : aplatit les livres d'une section dans l'ordre de lecture (pour précédent/suivant). / EN: flattens a section's books in reading order (for previous/next). */
export function ordrePages(livres: LivreLore[]): string[] {
  return livres.flatMap((l) => l.pages.map((p) => p.id));
}

/** FR : recherche par mots-clés sur les titres, sous-titres et textes (normalisation accents/casse, comme le reste de l'appli). / EN: keyword search over titles, subtitles and texts (accent/case folding, like the rest of the app). */
export interface ResultatRechercheLore {
  section: SectionLegendarium;
  livre: LivreLore;
  page: PageLore;
  /** FR : ⚠️ AJOUT (21/10/2026, suite 10) - nom de la catégorie du livre (section « légendes » avec hiérarchie), pour l'affichage du résultat. / EN: ADDED - the book's category name ("légendes" section with hierarchy), for the result display. */
  categorie?: string;
}

export function rechercherPages(livresParSection: Partial<Record<SectionLegendarium, LivreLore[]>>, motCle: string): ResultatRechercheLore[] {
  const cle = normaliser(motCle.trim());
  if (!cle) return [];
  const resultats: ResultatRechercheLore[] = [];
  for (const section of SECTIONS) {
    const livres = livresParSection[section.id] ?? [];
    for (const livre of livres) {
      // ⚠️ AJOUT (21/10/2026, suite 10) : la catégorie du livre est cherchée aussi (ex: « lumière » retrouve « La Lumière »)
      const haystackLivre = normaliser(`${livre.titre} ${livre.categorie ?? ""}`);
      const livreMatch = haystackLivre.includes(cle);
      for (const page of livre.pages) {
        const haystack = normaliser(`${page.titre} ${page.sousTitre ?? ""} ${page.texte}`);
        if (haystack.includes(cle) || livreMatch) resultats.push({ section: section.id, livre, page, categorie: livre.categorie });
      }
    }
  }
  return resultats;
}

/** FR : ⚠️ CHANGÉ (20/10/2026, décision utilisateur) - trouve une page par son identifiant stable, dans toutes les sections (lien profond). Accepte AUSSI la forme lien profond `"item:<hashObjet>"` (fiche Détails) : résolue via `loreHash` des pages (les rééditions partagent la page de leur Lore). / EN: finds a page by its stable id, across all sections (deep link). ALSO accepts the deep-link form `"item:<itemHash>"` (Details sheet): resolved via the pages' `loreHash` (reissues share their lore's page). */
export function trouverPage(livresParSection: Partial<Record<SectionLegendarium, LivreLore[]>>, pageId: string, db?: Database | null): ResultatRechercheLore | undefined {
  for (const section of SECTIONS) {
    for (const livre of livresParSection[section.id] ?? []) {
      const page = livre.pages.find((p) => p.id === pageId);
      if (page) return { section: section.id, livre, page };
    }
  }
  // Forme lien profond « item:<hashObjet> » : résoudre via le loreHash
  const m = /^item:(\d+)$/.exec(pageId);
  if (m && db) {
    const idCible = idPageDepuisObjet(db, Number(m[1]));
    if (idCible) {
      for (const section of SECTIONS) {
        for (const livre of livresParSection[section.id] ?? []) {
          const page = livre.pages.find((p) => p.id === idCible);
          if (page) return { section: section.id, livre, page };
        }
      }
    }
  }
  return undefined;
}

/** FR : les objets porteurs d'un Lore donné (parcours inverse : depuis une page de Lore, voir les objets qui la portent). / EN: the items carrying a given lore (reverse path: from a lore page, see the items that carry it). */
export function porteursDeLore(db: Database | null | undefined, loreHash: number | undefined): ObjetPorteur[] {
  // ⚠️ CHANGÉ (21/10/2026, étape 2) : lecture dans l'INDEX (un seul balayage de la table, mis en cache par base) au lieu de re-balayer la table à chaque appel.
  if (!db || loreHash === undefined) return [];
  return indexPorteurs(db).parLore.get(loreHash) ?? [];
}
