// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - MODÈLE du Legendarium : lecture des tables `DestinyLoreDefinition` et `DestinyItemDefinition` (champ `lore`) dans le cache manifeste EXISTANT (`lib/manifest/download.ts`) — AUCUN second mécanisme de téléchargement. Fonctions PURES ou à effets de lecture uniquement : rien n'écrit, rien ne persiste. / EN: Legendarium model: reads the `DestinyLoreDefinition` and `DestinyItemDefinition` (field `lore`) tables from the EXISTING manifest cache (`lib/manifest/download.ts`) — NO second download mechanism. Pure or read-only functions: nothing writes, nothing persists.
import type { Database } from "sql.js";
import { obtenirDefinition, lireTable, idSqliteVersHash } from "../manifest/download";
import { normaliser } from "../manifest/search";
import { BUCKET_HASH_VERS_SLOT, CLASS_TYPE_VERS_CLASSE } from "../../data/constantesManifest";
import { CATEGORIE_FACTICE } from "../manifest/search";
import type { DestinyItemDefinition, DestinyLoreDefinition } from "../../types/manifest";
import type { SlotArmure } from "../../types/build";
import type { ClasseArmure } from "../manifest/catalogueArmures";
import { saisonDeLObjet, saisonParNumero } from "../../data/saisons";
import type { LivreLore, ObjetPorteur, PageLore, SectionLegendarium } from "./types";

const TABLE_OBJETS = "DestinyInventoryItemDefinition";
const TABLE_LORE = "DestinyLoreDefinition";

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
  { id: "objets", libelle: "Armes et armures" },
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
  return Boolean(def.lore) && Boolean(def.displayProperties?.name?.trim()) && !def.redacted && !def.itemCategoryHashes?.includes(CATEGORIE_FACTICE);
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
  if (!def || !estPorteur(def) || def.lore === undefined) return undefined;
  const lore = lireLore(db, def.lore);
  const nom = def.displayProperties?.name?.trim() || "Objet sans nom";
  const texte = lore?.body?.trim();
  if (!texte) return undefined;
  return {
    id: `lore:${def.lore}`,
    titre: nom,
    sousTitre: lore?.subtitle?.trim() || undefined,
    texte,
    loreHash: def.lore,
    porteurs: porteursDeLore(db, def.lore),
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
  if (!def || !estPorteur(def) || def.lore === undefined) return false;
  return Boolean(lireLore(db, def.lore)?.body?.trim());
}

/** FR : résultat du diagnostic dev des Lores (étape 5, suite 8) : vérifie, avec le VRAI Manifest de l'utilisateur, si la table `DestinyLoreDefinition` existe et contient des entrées, et si les objets portent un champ `lore`. C'est la seule façon de savoir pourquoi le bouton « Lire le Lore » n'apparaît pas. / EN: result of the dev lore diagnostic (step 5, suite 8): checks, with the user's REAL Manifest, whether the `DestinyLoreDefinition` table exists and has entries, and whether items carry a `lore` field. The only way to know why the "Read the Lore" button doesn't show. */
export interface DiagnosticLore {
  /** FR : la table `DestinyLoreDefinition` existe-t-elle dans le Manifest ? / EN: does the `DestinyLoreDefinition` table exist in the Manifest? */
  tableLoreExiste: boolean;
  /** FR : nombre d'entrées dans `DestinyLoreDefinition`. / EN: entry count in `DestinyLoreDefinition`. */
  nbLores: number;
  /** FR : nombre d'entrées de Lore avec un corps de texte non vide. / EN: lore entries with a non-empty body. */
  nbLoresAvecCorps: number;
  /** FR : la table `DestinyInventoryItemDefinition` existe-t-elle ? / EN: does the `DestinyInventoryItemDefinition` table exist? */
  tableObjetsExiste: boolean;
  /** FR : nombre total d'objets lus (balayage complet, dev uniquement). / EN: total items read (full scan, dev only). */
  nbObjets: number;
  /** FR : nombre d'objets portant un champ `lore` (nombre). / EN: items carrying a `lore` field (number). */
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
    nbLoresAvecCorps = Object.values(lores).filter((l) => l?.body?.trim()).length;
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
      if (def?.lore === undefined) continue;
      nbObjetsAvecLore++;
      if (!estPorteur(def)) continue;
      const lore = lireLore(db, def.lore);
      if (!lore?.body?.trim()) continue;
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
    if (!estPorteur(def) || def.lore === undefined) continue;
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
    const estCosmetique = !estArmure && def.itemType !== 3; // ni arme (itemType 3) ni armure
    if (estCosmetique) index.cosmetiques.push(porteur);
    else index.objets.push(porteur);
    const groupe = index.parLore.get(def.lore);
    if (groupe) groupe.push(porteur);
    else index.parLore.set(def.lore, [porteur]);
    index.loresReferencies.add(def.lore);
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

/** FR : construit les livres de la section « objets » (armes et armures) : un livre « Lore des armes », un livre « Ensembles d'armures » (armures triées par la règle verrouillée). / EN: builds the books of the "objets" (weapons and armor) section: a "Weapon lore" book, an "Armor sets" book (armor sorted by the locked rule). */
function livresObjets(db: Database): LivreLore[] {
  // ⚠️ CHANGÉ (21/10/2026, étape 2) : porteurs lus dans l'INDEX (un seul balayage pour toute la bibliothèque).
  const porteurs = indexPorteurs(db).objets;
  const armes = porteurs.filter((p) => p.slotArmure === undefined);
  const armures = trierArmuresParEnsemble(porteurs.filter((p) => p.slotArmure !== undefined));
  // ⚠️ CHANGÉ (20/10/2026, décision utilisateur) : DÉDOUBLONNAGE — une page par Lore (les rééditions partagent le même Lore) ; le TITRE de la page est le NOM DE L'OBJET (porteur principal = premier dans l'ordre de lecture).
  const dedup = (liste: ObjetPorteur[]): PageLore[] => {
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
  };
  // ⚠️ AJOUT (20/10/2026, décision utilisateur) : le livre « Lore des armes » est classé PAR ORDRE CHRONOLOGIQUE (sortie des extensions/saisons) ; le livre « Ensembles d'armures » garde la RÈGLE VERROUILLÉE (classe → casque → gants → torse → jambes → objet de classe) : la mini-histoire de chaque classe se lit dans cet ordre.
  const livreArmes: LivreLore = { id: "objets-armes", titre: "Lore des armes", pages: trierPagesChrono(dedup(armes)) };
  const livreArmures: LivreLore = { id: "objets-armures", titre: "Ensembles d'armures", pages: dedup(armures) };
  return [livreArmes, livreArmures].filter((l) => l.pages.length > 0);
}

/** FR : construit le livre de la section « cosmétiques » (Spectres, Vaisseaux, Passereaux, avec leur Lore quand il existe). / EN: builds the book of the "cosmétiques" (Ghosts, Ships, Sparrows, with their lore when it exists). */
function livreCosmetiques(db: Database): LivreLore {
  // ⚠️ CHANGÉ (21/10/2026, étape 2) : porteurs lus dans l'INDEX (copie avant tri : l'index ne doit pas être muté).
  const porteurs = [...indexPorteurs(db).cosmetiques];
  porteurs.sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.hash - b.hash);
  // ⚠️ CHANGÉ (20/10/2026, décision utilisateur) : DÉDOUBLONNAGE — une page par Lore ; TITRE = NOM DE L'OBJET (porteur principal = premier par ordre alphabétique).
  const vus = new Set<string>();
  const pages: PageLore[] = [];
  for (const p of porteurs) {
    const page = pageLoreObjet(db, p.hash);
    if (!page || vus.has(page.id)) continue;
    vus.add(page.id);
    const principal = page.porteurs?.find((x) => x.hash === p.hash) ?? page.porteurs?.[0];
    pages.push(principal ? { ...page, titre: principal.nom } : page);
  }
  // ⚠️ AJOUT (20/10/2026, décision utilisateur) : classement PAR ORDRE CHRONOLOGIQUE (sortie des extensions/saisons)
  return { id: "cosmetiques", titre: "Spectres, Vaisseaux, Passereaux", pages: trierPagesChrono(pages) };
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
    if (!lore.body?.trim()) continue;
    const hash = idSqliteVersHash(ligne.id);
    if (loresObjets.has(hash)) continue; // Lore d'un objet : rangé ailleurs
    pages.push({ hash, lore });
  }
  return pages;
}

/** FR : construit les livres de la section « légendes » (D2) : un livre « Tomes de Légendes » avec les pages de Lore qui ne sont le Lore d'aucun objet (regroupées telles quelles ; éclatable plus tard si le Manifest porte une structure de livres). / EN: builds the books of the "légendes" (D2) section: one "Tomes de Légendes" book with the lore pages that are no item's lore (grouped as-is; splittable later if the Manifest carries a book structure). */
function livresLegendes(db: Database): LivreLore[] {
  // ⚠️ CHANGÉ (21/10/2026, étape 2) : les Lores d'objets viennent de l'INDEX des porteurs (même balayage que le reste), pas d'un balayage séparé.
  const loresObjets = indexPorteurs(db).loresReferencies;
  const pages: PageLore[] = [];
  for (const { hash, lore } of loresLegendes(db, loresObjets)) {
    pages.push({
      id: `lore:${hash}`,
      titre: lore.displayProperties?.name?.trim() || "Page sans titre",
      sousTitre: lore.subtitle?.trim() || undefined,
      texte: lore.body!.trim(),
      loreHash: hash,
    });
  }
  pages.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
  return pages.length > 0 ? [{ id: "legendes", titre: "Tomes de Légendes", pages }] : [];
}

/** FR : les livres d'une section du Manifest D2 (les sections « grimoire » est D1, hors Manifest D2). / EN: the books of a D2 Manifest section ("grimoire" is D1, outside the D2 Manifest). */
export function livresDeSection(db: Database | null | undefined, section: SectionLegendarium): LivreLore[] {
  if (!db || section === "grimoire") return [];
  try {
    if (section === "legendes") return livresLegendes(db);
    if (section === "objets") return livresObjets(db);
    return [livreCosmetiques(db)];
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
}

export function rechercherPages(livresParSection: Partial<Record<SectionLegendarium, LivreLore[]>>, motCle: string): ResultatRechercheLore[] {
  const cle = normaliser(motCle.trim());
  if (!cle) return [];
  const resultats: ResultatRechercheLore[] = [];
  for (const section of SECTIONS) {
    const livres = livresParSection[section.id] ?? [];
    for (const livre of livres) {
      for (const page of livre.pages) {
        const haystack = normaliser(`${page.titre} ${page.sousTitre ?? ""} ${page.texte}`);
        if (haystack.includes(cle)) resultats.push({ section: section.id, livre, page });
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
