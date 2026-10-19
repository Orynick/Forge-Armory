// FR : Recherche dans le Manifest - par nom precis, ou "plein texte" dans
// tout le contenu (nom, description, textes de perks...), tables armes/
// armures ET perks/aspects/fragments/perks d'artefact (qui sont pour la
// plupart des entrees DestinyInventoryItemDefinition comme le reste).
// EN: Manifest search - by exact name, or "full text" across all content
// (name, description, perk text...), weapons/armor tables AND perks/
// aspects/fragments/artifact perks (mostly DestinyInventoryItemDefinition
// entries like everything else).

import { Database } from "sql.js";
import { idSqliteVersHash, obtenirDefinition, hashVersIdSqlite } from "./download";
import { ouvrirDB } from "./db";
import { BUCKET_HASH_VERS_SLOT, TIER_TYPE_HASH_EXOTIQUE, CLASS_TYPE_VERS_CLASSE } from "../../data/constantesManifest";
import { SlotArme, SlotArmure } from "../../types/build";

/** FR : Le Manifest ne stocke que le chemin relatif de l'icône - il faut le préfixer par le domaine Bungie. / EN: The Manifest only stores the icon's relative path - it must be prefixed with Bungie's domain. */
export function urlIcone(cheminIcone: string | undefined): string | undefined {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : undefined;
}

// FR : Tables couvrant à la fois l'équipement et les textes de perks/
// aspects/fragments (qui sont, pour l'essentiel, des items "plug" dans
// DestinyInventoryItemDefinition). DestinySandboxPerkDefinition ajoute les
// descriptions "brutes" des effets intrinsèques.
// EN: Tables covering both gear and perk/aspect/fragment text (which are,
// for the most part, "plug" items in DestinyInventoryItemDefinition).
// DestinySandboxPerkDefinition adds the "raw" intrinsic-effect descriptions.
export const TABLES_RECHERCHE_PAR_DEFAUT = [
  "DestinyInventoryItemDefinition",
  "DestinySandboxPerkDefinition",
  // FR : ⚠️ AJOUT (24/08/2026) - triomphes, masqués par défaut (comme
  // quêtes/ornements/packs), visibles via le filtre de catégorie dédié.
  // EN: ⚠️ ADDED - triumphs, hidden by default (like quests/ornaments/
  // packs), visible via the dedicated category filter.
  "DestinyRecordDefinition",
];

// FR : ⚠️ AJOUT (24/08/2026) - "triomphe", demande de l'utilisateur : la
// recherche normale (bilingue FR/EN) ne couvrait que les objets, jamais
// DestinyRecordDefinition (les triomphes). Nécessaire pour retrouver des
// triomphes dont la traduction française diffère radicalement du nom
// anglais (déjà rencontré : Shattered Throne -> "On avait dit plus
// jamais !", sans le mot "solo" ni "flawless" dans le nom).
// EN: ⚠️ ADDED - "triomphe" (triumph), user request: normal search never
// covered DestinyRecordDefinition. Needed to find triumphs whose French
// translation differs radically from the English name.
export type CategorieResultat = "arme" | "armure" | "aspect" | "fragment" | "quete" | "ornement" | "pack" | "harmonisation" | "triomphe" | "factice" | "autre";

// FR : ⚠️ AJOUT (02/08/2026) : quêtes/missions et ornements alourdissaient
// la lecture des résultats (ex: "Aspect d'interférence" qui est en réalité
// une étape de quête, pas un vrai aspect équipable). Détectés via le même
// texte fiable `itemTypeDisplayName` (déjà utilisé pour aspect/fragment),
// masqués PAR DÉFAUT (mode "toutes") mais toujours sélectionnables via le
// filtre si besoin un jour de les voir quand même.
// EN: ⚠️ ADDED (2026-08-02): quests/missions and ornaments cluttered
// search results (e.g. "Aspect of Interference" which is actually a quest
// step, not a real equippable aspect). Detected via the same reliable
// `itemTypeDisplayName` text (already used for aspect/fragment), hidden BY
// DEFAULT ("all" mode) but still selectable via the filter if needed.
function devinerCategorie(
  slot: SlotArme | SlotArmure | undefined,
  itemTypeDisplayName: string | undefined,
  nom: string | undefined,
  description: string | undefined,
  // FR : ⚠️ AJOUT (06/10/2026) - type d'objet de Bungie (`itemType`) : 20 = « Dummy », objet FACTICE. / EN: ⚠️ ADDED - Bungie's `itemType`: 20 = Dummy.
  itemType?: number,
  categories?: number[]
): CategorieResultat {
  // FR : ⚠️ AJOUT (06/10/2026) - OBJETS FACTICES : `itemType` 20 (« Dummy ») et catégorie 3109687656. Confirmé par le rapport de l'utilisateur du 06/10/2026
  // (66 « autres définitions » de même nom que des armes de sa liste : 35 sont de type 20, et ces 35 portent TOUTES la catégorie 3109687656) et par sa capture :
  // « Tueur de souhaits », `type 20`, texte de type « Colis ». Ces objets imitent une arme (emplacement, type affiché, rareté exotique, équipable) mais n'en
  // sont pas : « Le Lapin de Jade » en a 11 copies, qui prenaient la place de la vraie arme en Recherche (type 20 donc pas de liste d'anti-champion), et le
  // « Colis » du Tueur de Souhaits réutilisait la même image générique. Masqués PAR DÉFAUT comme les quêtes et ornements, mais sélectionnables via le filtre.
  // Testé AVANT tout autre critère : un objet factice peut avoir un `slot` et un type d'arme.
  // EN: ⚠️ ADDED (2026-10-06) - DUMMY items (`itemType` 20, category 3109687656), confirmed by the user's report: they imitate weapons but are not; hidden by default.
  if (itemType === TYPE_OBJET_FACTICE || (categories ?? []).includes(CATEGORIE_FACTICE)) return "factice";
  const texte = normaliser(itemTypeDisplayName ?? "");
  const nomNormalise = normaliser(nom ?? "");
  const descriptionNormalisee = normaliser(description ?? "");
  if (texte.includes("ornement") || texte.includes("ornament")) return "ornement";
  // FR : ⚠️ AJOUT (03/08/2026) - repli confirmé par capture d'écran : le
  // doublon "Faim qui ronge" a un `itemTypeDisplayName` générique, mais sa
  // DESCRIPTION contient littéralement "ornement d'arme de palier 5" -
  // signal fiable pour ce cas où le type d'objet ne suffit pas.
  // EN: ⚠️ ADDED (2026-08-03) - fallback confirmed by screenshot: the
  // "Firefly" duplicate has a generic `itemTypeDisplayName`, but its
  // DESCRIPTION literally contains "weapon ornament, tier 5" - reliable
  // signal for this case where the item type isn't enough.
  if (descriptionNormalisee.includes("ornement d'arme") || descriptionNormalisee.includes("weapon ornament")) return "ornement";
  if (texte.includes("quete") || texte.includes("quest") || texte.includes("mission")) return "quete";
  // FR : ⚠️ AJOUT (03/08/2026) - "packs" achetables en jeu (offres/bundles
  // commerciaux) - signalés par l'utilisateur ("pack de particules
  // détectables" contenant un ornement, plein d'autres "packs" trouvés en
  // cherchant ce mot). Détection via le TYPE d'objet (fiable) ET, en
  // repli, le motif "pack de" dans le nom (convention commerciale peu
  // susceptible de coïncider avec un vrai nom de perk).
  // EN: ⚠️ ADDED (2026-08-03) - in-game purchasable "packs" (commercial
  // bundles/offers) - flagged by the user ("detectable particles pack"
  // containing an ornament, lots of other "packs" found searching that
  // word). Detected via item TYPE (reliable) AND, as a fallback, the
  // "pack de" pattern in the name (commercial convention unlikely to
  // coincide with a real perk name).
  if (texte.includes("offre") || texte.includes("bundle") || texte.includes("ensemble") || texte.includes("pack")) return "pack";
  if (nomNormalise.startsWith("pack de") || nomNormalise.startsWith("pack ")) return "pack";
  // FR : ⚠️ AJOUT (04/08/2026) - "harmonisation" (fonctionnalité in-game
  // augmentant les chances d'apparition d'un objet dans une activité) -
  // nouveau doublon signalé pour "Faim qui Ronge". Détecté via sa
  // description qui mentionne les chances d'apparition/harmonisation.
  // EN: ⚠️ ADDED (2026-08-04) - "attunement" (in-game feature increasing
  // an item's drop chance in an activity) - new duplicate reported for
  // "The Thorn". Detected via its description mentioning drop chances/
  // attunement.
  if (
    descriptionNormalisee.includes("harmonisation") ||
    descriptionNormalisee.includes("attunement") ||
    descriptionNormalisee.includes("chances d'apparition") ||
    descriptionNormalisee.includes("drop chance")
  ) {
    return "harmonisation";
  }

  if (slot) {
    return ["cinetique", "energie", "lourde"].includes(slot) ? "arme" : "armure";
  }
  if (texte.includes("aspect")) return "aspect";
  if (texte.includes("fragment")) return "fragment";
  return "autre";
}

// FR : ⚠️ Bungie qualifie elle-même sa détection de classType d'"algorithme
// approximatif" (doc officielle : "weak-sauce algorithm") - il est possible
// que ce champ ne soit pas fiablement renseigné sur les aspects/fragments
// spécifiquement (plutôt pensé pour les armes/armures). Si aucun badge de
// classe ne s'affiche jamais en pratique, c'est la piste à vérifier en
// premier avant de chercher un bug côté code.
// EN: ⚠️ Bungie itself calls its classType detection a "weak-sauce
// algorithm" (official docs) - this field may not be reliably populated on
// aspects/fragments specifically (seemingly geared toward weapons/armor).
// If no class badge ever shows up in practice, this is the first thing to
// check before looking for a code bug.

/**
 * FR : ⚠️ AJOUT (05/10/2026) - catégorie d'objet 3109687656 = objets FACTICES (« Dummies »). ⚠️ MIS À JOUR (06/10/2026) : sa signification est maintenant ÉTABLIE (elle ne
 * l'était pas le 05/10) : le rapport de l'utilisateur montre que toute définition de `itemType` 20 (« Dummy ») la porte. Voir `devinerCategorie`.
 * EN: item category 3109687656 = DUMMY items; meaning established on 2026-10-06 (every `itemType` 20 definition carries it).
 */
export const CATEGORIE_FACTICE = 3109687656;
/** FR : ⚠️ AJOUT (06/10/2026) - `itemType` 20 de Bungie : objet FACTICE (« Dummy »). / EN: ⚠️ ADDED - Bungie's `itemType` 20: Dummy item. */
export const TYPE_OBJET_FACTICE = 20;

/**
 * FR : ⚠️ AJOUT (05/10/2026) - PRIORITÉ entre deux résultats de même nom et de même description. Signalé par l'utilisateur, en Recherche : « Tueur de
 * Souhaits » affichait l'image du Lapin de Jade, « Dualité » (un fusil à POMPE) l'icône d'un fusil automatique, « Le Lapin de Jade » aucune icône
 * d'anti-champion : à chaque fois un AUTRE objet de même nom que l'exotique attendu. Avant, le dédoublonnage ne préférait que l'objet ayant un
 * emplacement ; si les deux en avaient un, le premier lu gagnait, au hasard de l'ordre du Manifest. Maintenant, par ordre d'importance : un
 * emplacement reconnu (objet équipable, règle historique) ; la rareté exotique ; l'absence de la catégorie 3109687656. À priorité égale, le premier
 * lu est gardé, comme avant. Ne concerne que des objets de MÊME nom ET de MÊME description : un objet seul n'est jamais écarté.
 * EN: ⚠️ ADDED - PRIORITY between two same-name, same-description results: a recognised slot, then exotic rarity, then not carrying category 3109687656.
 */
export function prioriteDoublon(r: { slot?: unknown; isExotic?: boolean; factice?: boolean }): number {
  return (r.slot ? 4 : 0) + (r.isExotic ? 2 : 0) + (r.factice ? 0 : 1);
}

export interface ResultatRecherche {
  table: string;
  hash: number;
  nom: string;
  description: string;
  champCorrespondant: "nom" | "description" | "autre texte";
  /** FR : Présent seulement pour les armes/armures reconnues - permet d'afficher "+ Ajouter au build". / EN: Only present for recognized weapons/armor - enables the "+ Add to build" button. */
  slot?: SlotArme | SlotArmure;
  isExotic?: boolean;
  /**
   * FR : ⚠️ AJOUT (05/10/2026) - l'objet porte la catégorie 3109687656 = objets FACTICES (« Dummies »), signification ÉTABLIE le 06/10/2026 (voir `CATEGORIE_FACTICE`).
   * Les objets factices sont maintenant classés « factice » et masqués par défaut (`devinerCategorie`) ; ce champ ne sert plus qu'à la ligne de diagnostic et, en
   * dernier critère, à départager deux objets de même nom et de même description (voir le dédoublonnage).
   * EN: ⚠️ ADDED - the item carries category 3109687656 = DUMMY items (established on 2026-10-06); now classified "factice" and hidden by default.
   */
  factice?: boolean;
  /**
   * FR : ⚠️ AJOUT (06/10/2026) - vrai pour un résultat qui n'est PAS affiché par défaut (catégorie masquée : quêtes, ornements, packs, harmonisation, triomphes, objets factices),
   * renvoyé seulement quand on demande les résultats masqués (`avecMasques`). Sert à les LISTER à part, pour que l'utilisateur voie ce qui a été écarté et pourquoi.
   * EN: ⚠️ ADDED - true for a result hidden by default (masked category), returned only when hidden results are requested, so they can be LISTED separately.
   */
  masque?: boolean;
  /** FR : URL complète de la miniature, prête à afficher dans un <img>. / EN: Full thumbnail URL, ready to display in an <img>. */
  icone?: string;
  /** FR : Classe requise, seulement si l'objet est spécifique à une classe (ex: un aspect). Absent pour les objets universels (armes, la plupart des perks d'artefact...). / EN: Required class, only if the item is class-specific (e.g. an aspect). Absent for universal items (weapons, most artifact perks...). */
  classe?: "titan" | "chasseur" | "arcaniste";
  /** FR : type d'arme lisible (Fusil à pompe, Revolver...), pour l'icône de type - absent pour les armures/perks. / EN: readable weapon type (Shotgun, Hand Cannon...), for the type icon - absent for armor/perks. */
  typeArme?: string;
  /** FR : Catégorie grossière, pour le filtre de recherche (arme/armure/aspect/fragment/autre). / EN: Coarse category, for the search filter (weapon/armor/aspect/fragment/other). */
  categorie: CategorieResultat;
}

/** FR : Enlève les accents + met en minuscules, pour un match "dévoration" == "devoration" == "DÉVORATION". / EN: Strips accents + lowercases, so "dévoration" == "devoration" == "DÉVORATION" all match. */
/**
 * FR : ⚠️ AJOUT (06/10/2026, v0.3.2) - normalisation de la RECHERCHE : celle de `normaliser` (sans accents, minuscules) PLUS les variantes typographiques du texte français, qui empêchaient de retrouver
 * un objet : espaces insécables (U+00A0, U+202F, U+2009, U+2007) -> espace ; apostrophes typographiques (’ ‘ ʼ ´) -> apostrophe droite ; ligatures « œ » et « æ » développées. Sans cela, taper « l'aube »
 * ne retrouvait pas « l’aube », ni « coeur » « cœur » : un objet pouvait disparaître de la Recherche sans raison visible (cas du 06/10/2026 : la vraie arme « Tueur de souhaits » absente des résultats).
 * Limitée à la RECHERCHE (index, mot cherché, comparaison des textes) : `normaliser` reste inchangée, car des règles de la Doctrine déjà validées en dépendent. Index persisté : `VERSION_INDEX_RECHERCHE`.
 * EN: ⚠️ ADDED - SEARCH normalisation: `normaliser` plus French typographic variants (no-break spaces, typographic apostrophes, œ/æ ligatures). Search-only: `normaliser` itself is unchanged.
 */
export function normaliserRecherche(texte: string): string {
  return normaliser(
    texte
      .replace(/[\u00a0\u2007\u2009\u202f]/g, " ")
      .replace(/[\u2018\u2019\u02bc\u00b4]/g, "'")
      .replace(/œ/g, "oe")
      .replace(/Œ/g, "OE")
      .replace(/æ/g, "ae")
      .replace(/Æ/g, "AE")
  );
}

export function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - cherche un mot-clé sur FRONTIÈRE DE MOT dans
 * un texte déjà normalisé, contrairement à `texte.includes(motCle)` qui
 * matche n'importe où (y compris au milieu d'un mot plus long). Utilisée
 * pour `motsClesStrictsFr`/`motsClesStrictsEn` du catalogue de verbes -
 * trouvé sur données réelles : `"cure".includes` matchait à tort
 * « filobscure », « occurence », « procure ».
 *
 * Renvoie toutes les positions de départ des correspondances (comme
 * `indexOf` répété), pour rester compatible avec le code qui parcourt les
 * occurrences une par une.
 *
 * EN: ⚠️ ADDED - searches for a keyword on WORD BOUNDARIES in
 * already-normalized text, unlike `texte.includes(motCle)` which matches
 * anywhere. Used for the verb catalogue's strict keywords.
 */
export function positionsMotCleStrict(texteNormalise: string, motCleNormalise: string): number[] {
  if (!motCleNormalise) return [];
  // FR : \b ne fonctionne pas bien avec des caractères accentués, mais le
  // texte est déjà normalisé (accents retirés) au moment de l'appel - donc
  // uniquement des lettres ASCII, chiffres et apostrophes à gérer.
  const motEchappe = motCleNormalise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = new RegExp(`(?<![a-z0-9])${motEchappe}(?![a-z0-9])`, "g");
  const positions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = motif.exec(texteNormalise)) !== null) {
    positions.push(m.index);
    if (m.index === motif.lastIndex) motif.lastIndex++; // évite une boucle infinie sur un motif vide
  }
  return positions;
}

export type ModeRecherche = "nom" | "plein_texte";

/**
 * FR : ⚠️ Une recherche "plein texte" doit par nature parcourir tout le
 * texte de la table au moins une fois (impossible de savoir à l'avance où
 * se trouve un mot). Pour rester rapide malgré tout, on ne parse le JSON
 * (JSON.parse) QUE pour les lignes déjà identifiées comme correspondantes
 * par un simple test de sous-chaîne sur le texte brut — le filtrage
 * grossier est donc bien moins coûteux qu'un parsing systématique.
 * EN: ⚠️ A "full text" search inherently has to scan all the table's text
 * at least once (no way to know in advance where a word sits). To stay
 * fast anyway, we only JSON.parse the rows already identified as matches by
 * a plain substring test on the raw text — so the coarse filtering is far
 * cheaper than parsing every row systematically.
 */
// FR : ⚠️ OPTIMISATION (02/08/2026) : la recherche restait lente malgré le
// filtre grossier, car ce filtre lui-même (normaliser() = décomposition
// Unicode + regex sur le JSON ENTIER de chaque ligne) se refaisait à
// CHAQUE recherche, pour chacune des ~40 000+ lignes. On construit
// maintenant un INDEX (texte déjà normalisé) une seule fois par Manifest
// chargé, mis en cache par table - les recherches suivantes ne font plus
// qu'un `.includes()` sur du texte déjà prêt, sans jamais renormaliser.
// EN: ⚠️ OPTIMIZATION (2026-08-02): search stayed slow despite the coarse
// filter, because that filter itself (normaliser() = Unicode decomposition
// + regex over the ENTIRE JSON of every row) was redone on EVERY search,
// for each of the ~40,000+ rows. We now build an INDEX (already-normalized
// text) once per loaded Manifest, cached per table - subsequent searches
// only do a `.includes()` on already-ready text, never renormalizing.
export interface LigneIndexee {
  id: number;
  /** JSON est conservé seulement en mémoire lors de la construction initiale.
   * Les index persistés ne stockent plus une seconde copie de toutes les
   * définitions du Manifest. */
  json?: string;
  jsonNormalise: string;
}

// FR : ⚠️ CHANGÉ (06/10/2026) : "v3" (était "v2") - le texte normalisé de l'index vient maintenant de `normaliserRecherche` : l'ancien index persisté est ignoré et reconstruit une fois au prochain chargement du Manifest.
const VERSION_INDEX_RECHERCHE = "v3";
const CACHE_INDEX = new WeakMap<Database, Map<string, LigneIndexee[]>>();

/** FR : préremplit le cache en mémoire d'une table avec un index déjà calculé (ex: relu depuis IndexedDB) - évite de le reconstruire. / EN: pre-fills a table's in-memory cache with an already-computed index (e.g. re-read from IndexedDB) - avoids rebuilding it. */
export function definirIndexTableEnCache(db: Database, table: string, lignes: LigneIndexee[]): void {
  let parTable = CACHE_INDEX.get(db);
  if (!parTable) {
    parTable = new Map();
    CACHE_INDEX.set(db, parTable);
  }
  parTable.set(table, lignes);
}

/**
 * FR : ⚠️ AJOUT (05/10/2026) - vrai si l'index de cette table est DÉJÀ en mémoire. Permet d'exploiter l'index quand il est prêt
 * SANS jamais déclencher sa construction (coûteuse : des dizaines de milliers de lignes) depuis un affichage.
 * EN: ⚠️ ADDED - true if this table's index is ALREADY in memory; lets callers use it without ever triggering its costly build.
 */
export function indexTableDisponible(db: Database, table: string): boolean {
  return CACHE_INDEX.get(db)?.has(table) ?? false;
}

export function obtenirIndexTable(db: Database, table: string): LigneIndexee[] {
  let parTable = CACHE_INDEX.get(db);
  if (!parTable) {
    parTable = new Map();
    CACHE_INDEX.set(db, parTable);
  }
  let index = parTable.get(table);
  if (!index) {
    index = [];
    const stmt = db.prepare(`SELECT id, json FROM ${table}`);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const json = row.json as string;
      index.push({ id: Number(row.id), json, jsonNormalise: normaliserRecherche(json) });
    }
    stmt.free();
    parTable.set(table, index);
  }
  return index;
}

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.7) - miniatures des perks d'artefact,
 * pour l'export d'une fiche (demande de l'utilisateur : « si tu les trouves »).
 *
 * Contexte : la piste officielle (`DestinyArtifactDefinition`) a été
 * abandonnée le 26/08 - Bungie n'y expose que l'ANCIEN système d'artefact
 * (voir TODO.md, chantier 8). Piste différente ici : les perks d'artefact
 * existent aussi comme objets de `DestinyInventoryItemDefinition` ; on les
 * cherche PAR LEUR NOM.
 *
 * Règles volontairement strictes (mieux vaut aucune icône qu'une fausse) :
 * - un seul passage sur l'index de recherche déjà en mémoire, limité aux
 *   lignes qui mentionnent « artefact » / « artifact » ;
 * - un objet n'est retenu que s'il se présente comme un perk d'artefact :
 *   son type affiché contient « artefact » / « artifact », ou sa catégorie
 *   de plug contient « artifact » ;
 * - nom identique (accents et majuscules ignorés) ;
 * - si plusieurs icônes DIFFÉRENTES portent ce nom : ambigu, aucune icône.
 * Non vérifié sur un vrai Manifest au moment de l'écriture (pas d'accès
 * réseau) : si rien n'apparaît, c'est que Bungie range ces perks autrement.
 *
 * EN: ⚠️ ADDED - artifact perk thumbnails for the sheet export, looked up BY
 * NAME in DestinyInventoryItemDefinition (the official artifact table only
 * exposes the old system). Strict rules: artifact-looking items only, exact
 * name, and no icon at all if several different icons share the name.
 */
const CACHE_ICONES_PERKS_ARTEFACT = new WeakMap<Database, Map<string, Set<string>>>();

function indexIconesPerksArtefact(db: Database): Map<string, Set<string>> {
  let index = CACHE_ICONES_PERKS_ARTEFACT.get(db);
  if (index) return index;
  index = new Map();
  for (const ligne of obtenirIndexTable(db, "DestinyInventoryItemDefinition")) {
    if (!ligne.jsonNormalise.includes("artifact") && !ligne.jsonNormalise.includes("artefact")) continue;
    const def = obtenirDefinition<{
      displayProperties?: { name?: string; icon?: string };
      itemTypeDisplayName?: string;
      plug?: { plugCategoryIdentifier?: string };
    }>(db, "DestinyInventoryItemDefinition", idSqliteVersHash(ligne.id)); // FR : l'index stocke l'id SQLite, pas le hash / EN: the index stores the SQLite id, not the hash
    const nom = def?.displayProperties?.name;
    const icone = def?.displayProperties?.icon;
    if (!nom || !icone) continue;
    const type = normaliser(def?.itemTypeDisplayName ?? "");
    const categorie = normaliser(def?.plug?.plugCategoryIdentifier ?? "");
    const estPerkArtefact = type.includes("artefact") || type.includes("artifact") || categorie.includes("artifact");
    if (!estPerkArtefact) continue;
    const cle = normaliser(nom).trim();
    const icones = index.get(cle) ?? new Set<string>();
    icones.add(icone);
    index.set(cle, icones);
  }
  CACHE_ICONES_PERKS_ARTEFACT.set(db, index);
  return index;
}

/** FR : URL de la miniature d'un perk d'artefact, ou undefined si introuvable ou ambiguë. / EN: artifact perk thumbnail URL, or undefined if not found or ambiguous. */
export function trouverIconePerkArtefact(db: Database, nomPerk: string): string | undefined {
  const icones = indexIconesPerksArtefact(db).get(normaliser(nomPerk).trim());
  return icones && icones.size === 1 ? urlIcone([...icones][0]) : undefined;
}

/**
 * FR : ⚠️ CHANGÉ (03/08/2026) - Construit l'index de recherche, mais
 * persiste maintenant le résultat dans IndexedDB (par table+langue+
 * version du Manifest) pour ne PLUS jamais refaire ce travail coûteux
 * tant que la version du Manifest ne change pas - avant, seuls les octets
 * bruts du Manifest étaient mis en cache, l'indexation (normalisation du
 * texte) se refaisait à chaque redémarrage de l'appli. Devenu asynchrone
 * (accès IndexedDB).
 * EN: ⚠️ CHANGED (2026-08-03) - Builds the search index, but now persists
 * the result to IndexedDB (per table+language+Manifest version) to NEVER
 * redo this costly work again as long as the Manifest version hasn't
 * changed - before, only the Manifest's raw bytes were cached, indexing
 * (text normalization) was redone on every app restart. Now async
 * (IndexedDB access).
 */
export async function indexerManifest(
  db: Database,
  langue: string,
  version: string,
  tables: string[] = TABLES_RECHERCHE_PAR_DEFAUT
): Promise<void> {
  const idbDb = await ouvrirDB();
  for (const table of tables) {
    const cle = `search_${VERSION_INDEX_RECHERCHE}_${table}_${langue}_${version}`;
    try {
      const dejaEnCache = await idbDb.get("searchIndex", cle);
      if (dejaEnCache) {
        // Compatibilité avec les anciennes versions qui stockaient une
        // chaîne JSON. Les nouvelles versions utilisent le clonage structuré
        // IndexedDB et ne dupliquent plus `json`.
        const lignesBrutes = typeof dejaEnCache === "string" ? JSON.parse(dejaEnCache) : dejaEnCache;
        definirIndexTableEnCache(
          db,
          table,
          (lignesBrutes as LigneIndexee[]).map(({ id, jsonNormalise }) => ({ id, jsonNormalise }))
        );
        continue;
      }
    } catch {
      // FR : lecture échouée (quota, corruption...) - on reconstruit normalement, sans bloquer.
    }
    const lignes = obtenirIndexTable(db, table); // construit + met en cache mémoire (coûteux, une fois)
    // FR : ne persiste que l'id + le texte normalisé. La copie complète du
    // JSON faisait doublon avec SQLite et gonflait fortement IndexedDB.
    // EN: persist only id + normalized text. Keeping the full JSON duplicated
    // SQLite data and made the IndexedDB cache unnecessarily large.
    const compact = lignes.map(({ id, jsonNormalise }) => ({ id, jsonNormalise }));
    idbDb.put("searchIndex", compact, cle).catch(() => {});
  }
}

/**
 * FR : ⚠️ AJOUT (21/09/2026) - catégories masquées par défaut dans la
 * recherche (pas de vrais objets de build ; visibles via le filtre de
 * catégorie). Extraite en constante pour être partagée avec le diagnostic.
 * EN: ⚠️ ADDED - categories hidden by default in search, now a shared
 * constant so the diagnostic reports exactly the same rule.
 */
// FR : ⚠️ CHANGÉ (06/10/2026) - « factice » ajouté (objets de type 20, voir `devinerCategorie`). / EN: ⚠️ CHANGED - "factice" (dummy items) added.
export const CATEGORIES_MASQUEES_PAR_DEFAUT: CategorieResultat[] = ["quete", "ornement", "pack", "harmonisation", "triomphe", "factice"];

/**
 * FR : ⚠️ AJOUT (21/09/2026) - SOURCE UNIQUE de la décision « cette
 * définition correspond-elle au mot-clé, par quel champ, dans quelle
 * catégorie ». Extraite de `rechercherDansManifest` pour être réutilisée
 * telle quelle par `diagnostiquerCorrespondances`.
 *
 * Motif : le diagnostic listait jusqu'ici TOUTES les correspondances
 * brutes, y compris celles que la recherche écarte déjà (texte
 * d'ambiance `flavorText`, catégories masquées). Lancé sur « one-two », il
 * affichait donc « Vise le sac, petit » alors que la recherche normale ne
 * la montre plus — de quoi conclure à tort que le filtre anti-dialogue ne
 * marche pas. Recopier la règle dans le diagnostic aurait créé deux
 * logiques destinées à diverger, le motif qui a déjà causé plusieurs bugs
 * dans ce projet ; une seule fonction, appelée des deux côtés, l'exclut.
 *
 * Renvoie `champCorrespondant: null` si la définition ne doit PAS
 * apparaître (aucune correspondance hors `flavorText`).
 *
 * EN: ⚠️ ADDED - SINGLE SOURCE of the "does this definition match, via
 * which field, in which category" decision, shared by search and the
 * diagnostic so the diagnostic can say whether each hit is actually shown.
 */
export function evaluerCorrespondance(
  def: Record<string, any>,
  table: string,
  motNormalise: string
): {
  nom: string;
  description: string;
  champCorrespondant: ResultatRecherche["champCorrespondant"] | null;
  correspondDansFlavorText: boolean;
  slot: ResultatRecherche["slot"];
  categorie: CategorieResultat;
} {
  const nom: string = def.displayProperties?.name ?? "(sans nom)";
  const description: string = def.displayProperties?.description ?? "";
  const nomCorrespond = normaliserRecherche(nom).includes(motNormalise);
  const descriptionCorrespond = normaliserRecherche(description).includes(motNormalise);

  // FR : ⚠️ AJOUT (24/08/2026) - filtre anti-dialogue, source identifiée
  // par le diagnostic sur "one-two" : "Vise le sac, petit" (Hit the Bag)
  // matchait via son `flavorText` ("Warm up that one-two punch!"), un
  // texte D'AMBIANCE/de saveur, jamais affiché comme description réelle
  // dans l'appli - exactement le faux positif signalé par l'utilisateur.
  // On EXCLUT ce champ précis de la détection "autre texte" plutôt que
  // de deviner un motif de dialogue : `flavorText` est un champ nommé et
  // documenté du Manifest, à la différence d'une heuristique de texte
  // fragile qui aurait pu aussi masquer de vraies correspondances.
  // EN: ⚠️ ADDED - anti-dialogue filter: `flavorText` (mood text, never
  // shown as a real description) is EXCLUDED from "autre texte" detection
  // rather than guessing a dialogue pattern.
  const { flavorText, ...defSansFlavorText } = def;
  const matchAilleursQueFlavorText =
    !nomCorrespond && !descriptionCorrespond && normaliserRecherche(JSON.stringify(defSansFlavorText)).includes(motNormalise);
  const correspondDansFlavorText = typeof flavorText === "string" && normaliserRecherche(flavorText).includes(motNormalise);

  const champCorrespondant: ResultatRecherche["champCorrespondant"] | null = nomCorrespond
    ? "nom"
    : descriptionCorrespond
      ? "description"
      : matchAilleursQueFlavorText
        ? "autre texte" // ex: texte de perk imbriqué, requirementDisplayString...
        : null;

  const slot = def.inventory?.bucketTypeHash !== undefined ? BUCKET_HASH_VERS_SLOT[def.inventory.bucketTypeHash] : undefined;
  // FR : ⚠️ AJOUT (24/08/2026) - un triomphe n'a ni `inventory` ni
  // `itemTypeDisplayName` : sa catégorie se déduit directement de la TABLE.
  // EN: ⚠️ ADDED - a triumph's category comes straight from the TABLE.
  const categorie: CategorieResultat =
    table === "DestinyRecordDefinition"
      ? "triomphe"
      : devinerCategorie(slot, def.itemTypeDisplayName, nom, description, def.itemType, Array.isArray(def.itemCategoryHashes) ? def.itemCategoryHashes : undefined);

  return { nom, description, champCorrespondant, correspondDansFlavorText, slot, categorie };
}

export function rechercherDansManifest(
  db: Database,
  motCle: string,
  mode: ModeRecherche = "plein_texte",
  tables: string[] = TABLES_RECHERCHE_PAR_DEFAUT,
  categorie: CategorieResultat | "toutes" = "toutes",
  // FR : ⚠️ AJOUT (06/10/2026) - vrai : les résultats des catégories masquées par défaut sont AUSSI renvoyés, marqués `masque: true` (au lieu d'être écartés). Sans effet si une catégorie précise est choisie.
  // EN: ⚠️ ADDED - true: results of the default-hidden categories are ALSO returned, flagged `masque: true`.
  avecMasques = false
): ResultatRecherche[] {
  const motNormalise = normaliserRecherche(motCle.trim());
  // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources », RETOUR DE TEST n°3) - MODE « TOUT » : un mot-clé VIDE liste TOUS les objets des tables demandées (l'appelant l'utilise pour un filtre source: SEUL — le tri se fait côté client ; jamais par défaut : les autres appelants passent un vrai mot-clé). / EN: ⚠️ ADDED - an EMPTY keyword lists every item (used for a lone source: filter; never the default).
  const tout = motNormalise.length === 0;
  if (motNormalise.length < 2 && !tout) return []; // évite de scanner tout le Manifest pour 1 caractère

  const resultats: ResultatRecherche[] = [];

  for (const table of tables) {
    const index = obtenirIndexTable(db, table);
    for (const ligne of index) {
      // Filtre grossier et rapide, sur du texte déjà normalisé (pas de re-calcul).
      if (!tout && !ligne.jsonNormalise.includes(motNormalise)) continue;

      const def = ligne.json
        ? JSON.parse(ligne.json)
        : obtenirDefinition<Record<string, any>>(db, table, idSqliteVersHash(ligne.id)) ?? {};
      const { nom, description, champCorrespondant, slot, categorie: categorieResultat } = evaluerCorrespondance(
        def,
        table,
        motNormalise
      );      // FR : ⚠️ (19/10/2026) - en mode « tout », l'absence de correspondance textuelle n'est pas un rejet : l'objet est listé (le tri côté client se fait par source) ; un objet sans nom n'a rien à faire dans une liste.
      if (!champCorrespondant && !tout) continue;
      if (tout && !nom) continue;
      if (mode === "nom" && champCorrespondant !== "nom") continue; // mode "nom" : on ignore les correspondances ailleurs

      let masque = false;
      if (categorie === "toutes") {
        // FR : masqué par défaut, pas un vrai objet de build - voir le filtre pour les afficher quand même.
        if (CATEGORIES_MASQUEES_PAR_DEFAUT.includes(categorieResultat)) {
          if (!avecMasques) continue;
          masque = true;
        }
      } else if (categorieResultat !== categorie) {
        continue;
      }

      resultats.push({
        table,
        hash: idSqliteVersHash(ligne.id),
        nom,
        description,
        // FR : ⚠️ (19/10/2026, mode « tout ») - la correspondance peut être null (on liste tout, pas une recherche) : le type de ResultatRecherche attend une valeur non nulle, on retombe sur « nom » par convention d'affichage. / EN: in "list everything" mode the match is null; the display falls back to "nom".
        champCorrespondant: champCorrespondant ?? "nom",
        slot,
        isExotic: def.inventory?.tierTypeHash === TIER_TYPE_HASH_EXOTIQUE,
        factice: Array.isArray(def.itemCategoryHashes) && def.itemCategoryHashes.includes(CATEGORIE_FACTICE),
        icone: urlIcone(def.displayProperties?.icon),
        classe: def.classType !== undefined ? CLASS_TYPE_VERS_CLASSE[def.classType] : undefined,
        typeArme: slot && ["cinetique", "energie", "lourde"].includes(slot) ? def.itemTypeDisplayName : undefined,
        categorie: categorieResultat,
        masque,
      });
    }
  }

  // FR : résultats les plus pertinents d'abord (nom > description > reste).
  // EN: most relevant results first (name > description > rest).
  const rang = { nom: 0, description: 1, "autre texte": 2 };
  resultats.sort((a, b) => rang[a.champCorrespondant] - rang[b.champCorrespondant]);

  return resultats;
}

// FR : Recherche bilingue - permet de taper un mot en français OU en
// anglais et de retrouver le même objet. Utile pour croiser une source
// externe en anglais (ex: knowledge-base/) avec le Manifest, sans jamais
// changer la langue d'affichage de l'appli (toujours français).
// EN: Bilingual search - lets you type a word in French OR English and
// find the same item. Useful for cross-referencing an external English
// source (e.g. knowledge-base/) with the Manifest, without ever changing
// the app's display language (always French).

export interface ResultatRechercheBilingue extends ResultatRecherche {
  /** FR : Nom anglais, si l'objet a été trouvé (aussi) via le Manifest anglais. / EN: English name, if the item was (also) found via the English Manifest. */
  nomEn?: string;
  /** FR : true si la correspondance n'a été trouvée QUE dans le texte anglais. / EN: true if the match was found ONLY in the English text. */
  trouveViaAnglais: boolean;
}

/**
 * FR : Cherche dans les deux Manifests (français obligatoire, anglais
 * optionnel) et fusionne les résultats par hash (identique dans les deux
 * langues). L'affichage reste toujours en français ; l'anglais n'élargit
 * que ce qu'on peut taper dans le champ de recherche.
 * EN: Searches both Manifests (French required, English optional) and
 * merges results by hash (identical across languages). Display always
 * stays in French; English only widens what can be typed in the search box.
 */
export function rechercherBilingue(
  dbFr: Database,
  dbEn: Database | null,
  motCle: string,
  mode: ModeRecherche = "plein_texte",
  tables: string[] = TABLES_RECHERCHE_PAR_DEFAUT,
  categorie: CategorieResultat | "toutes" = "toutes",
  // FR : ⚠️ AJOUT (06/10/2026) - voir `rechercherDansManifest` : renvoie aussi les résultats masqués par défaut, marqués `masque: true`.
  avecMasques = false
): ResultatRechercheBilingue[] {
  const parCle = new Map<string, ResultatRechercheBilingue>();

  for (const r of rechercherDansManifest(dbFr, motCle, mode, tables, categorie, avecMasques)) {
    parCle.set(`${r.table}-${r.hash}`, { ...r, trouveViaAnglais: false });
  }

  if (dbEn) {
    for (const r of rechercherDansManifest(dbEn, motCle, mode, tables, categorie, avecMasques)) {
      const cle = `${r.table}-${r.hash}`;
      const existant = parCle.get(cle);
      if (existant) {
        // FR : déjà trouvé côté français - on ajoute juste le nom anglais en référence.
        existant.nomEn = r.nom;
        continue;
      }
      // FR : trouvé UNIQUEMENT via le texte anglais - on résout quand même
      // le nom français (même hash) pour garder un affichage cohérent.
      // EN: found ONLY via English text - we still resolve the French name
      // (same hash) to keep a consistent display.
      const defFr = obtenirDefinition<{ displayProperties?: { name?: string; description?: string; icon?: string } }>(
        dbFr,
        r.table,
        r.hash
      );
      parCle.set(cle, {
        ...r,
        nom: defFr?.displayProperties?.name ?? r.nom,
        description: defFr?.displayProperties?.description ?? r.description,
        icone: urlIcone(defFr?.displayProperties?.icon) ?? r.icone,
        nomEn: r.nom,
        trouveViaAnglais: true,
      });
    }
  }

  // FR : ⚠️ DÉDOUBLONNAGE (02/08/2026) - le Manifest contient parfois deux
  // hash distincts pour un même texte affiché (ex: un plug de fragment et
  // sa variante d'inspection) - on ne garde que la première occurrence par
  // texte identique, pour ne pas montrer "Abîme repu" deux fois.
  // EN: ⚠️ DEDUPING (2026-08-02) - the Manifest sometimes has two distinct
  // hashes for the same displayed text (e.g. a fragment plug and its
  // inspect-screen variant) - we only keep the first occurrence per
  // identical text, to avoid showing "Abîme repu" twice.
  // FR : ⚠️ DÉDOUBLONNAGE (02/08/2026, v2) - le Manifest contient parfois
  // deux hash distincts pour un même texte affiché (ex: un plug de
  // fragment et sa variante d'inspection). Corrigé un bug : garder
  // "juste la première occurrence" pouvait éliminer LA VRAIE entrée
  // équipable (avec un slot reconnu) au profit d'un doublon sans slot,
  // faisant disparaître le bouton "+ Ajouter au build". On préfère
  // maintenant explicitement l'entrée qui a un slot, si les deux en ont
  // un différent on garde la première quand même (cas rare).
  // EN: ⚠️ DEDUPING (2026-08-02, v2) - the Manifest sometimes has two
  // distinct hashes for the same displayed text (e.g. a fragment plug and
  // its inspect-screen variant). Fixed a bug: keeping "just the first
  // occurrence" could discard the ACTUAL equippable entry (with a
  // recognized slot) in favor of a slot-less duplicate, making the
  // "+ Add to build" button disappear. We now explicitly prefer whichever
  // entry has a slot, if both differ we still keep the first (rare case).
  // FR : ⚠️ CHANGÉ (06/10/2026) - les résultats masqués sont dédoublonnés À PART : un doublon masqué ne doit jamais prendre la place d'un résultat affiché.
  // EN: ⚠️ CHANGED - hidden results are deduplicated SEPARATELY: a hidden duplicate must never displace a displayed result.
  const tous = Array.from(parCle.values());
  return [...dedoublonnerParTexte(tous.filter((r) => !r.masque)), ...dedoublonnerParTexte(tous.filter((r) => r.masque))];
}

/**
 * FR : ⚠️ EXTRAIT (05/10/2026) en fonction pure pour être testé (comportement du dédoublonnage inchangé, hors la règle de priorité) : ne garde qu'UN
 * résultat par couple « nom + description » identiques, celui de meilleure priorité (`prioriteDoublon`), le premier lu à priorité égale ; l'ordre des
 * résultats gardés est celui de leur première apparition. ⚠️ CHANGÉ (05/10/2026) - le doublon de meilleure priorité remplace celui déjà gardé ; avant,
 * seul le critère « a un slot » comptait (`!existant.slot && r.slot`).
 * EN: ⚠️ EXTRACTED as a pure function for testing: keeps ONE result per identical name+description, the highest priority one, the first read on a tie.
 */
export function dedoublonnerParTexte<T extends { nom: string; description: string; slot?: unknown; isExotic?: boolean; factice?: boolean }>(resultats: readonly T[]): T[] {
  const parTexte = new Map<string, T>();
  for (const r of resultats) {
    const cleTexte = `${normaliser(r.nom)}|${normaliser(r.description)}`;
    const existant = parTexte.get(cleTexte);
    if (!existant || prioriteDoublon(r) > prioriteDoublon(existant)) parTexte.set(cleTexte, r);
  }
  return Array.from(parTexte.values());
}

// FR : ⚠️ AJOUT (24/08/2026) - diagnostic pour localiser PRÉCISÉMENT où un
// mot-clé matche dans le JSON d'une définition, avant d'écrire un filtre
// anti-dialogue. Signalé par l'utilisateur : chercher "one-two" (pour
// "One-Two Punch") remonte "vise le sac, petit", une réplique de PNJ.
//
// Plutôt que de deviner un filtre par mots-clés (fragile : risque de
// masquer une vraie description de perk ET de laisser passer d'autres
// dialogues), ce diagnostic affiche la TABLE et le CHEMIN JSON exacts de
// chaque correspondance - permet de voir si le dialogue vient d'une table
// séparée (auquel cas on l'exclut des tables de recherche par défaut) ou
// d'un champ précis À L'INTÉRIEUR d'une définition d'objet légitime
// (auquel cas on exclut ce champ précis, pas toute la définition).
//
// EN: ⚠️ ADDED - diagnostic to PRECISELY locate where a keyword matches in a
// definition's JSON, before writing an anti-dialogue filter. Rather than
// guessing a keyword-based filter (fragile: risks hiding a real perk
// description AND missing other dialogue), this shows the exact TABLE and
// JSON PATH of each match - lets us see whether the dialogue comes from a
// separate table (exclude it from default search tables) or a specific
// field inside a legitimate item definition (exclude just that field).
export interface DiagnosticCorrespondance {
  table: string;
  /** FR : ⚠️ AJOUT (24/08/2026) - Manifest d'origine de la correspondance ("FR" ou "EN"), utile depuis que le diagnostic est bilingue. / EN: source Manifest of the match ("FR" or "EN"), useful now the diagnostic is bilingual. */
  langue: "FR" | "EN";
  hash: number;
  nomAffiche: string;
  /** FR : chemin JSON où le mot-clé a été trouvé, ex: "displayProperties.description" ou "objectives[0].progressDescription". / EN: JSON path where the keyword was found. */
  cheminJson: string;
  /** FR : extrait de texte autour de la correspondance, pour lecture rapide. / EN: text excerpt around the match, for quick reading. */
  extrait: string;
  /**
   * FR : ⚠️ AJOUT (21/09/2026) - ce que fait RÉELLEMENT la recherche normale
   * de cet objet (réglages par défaut : plein texte, toutes catégories),
   * calculé par la même fonction qu'elle (`evaluerCorrespondance`).
   * EN: ⚠️ ADDED - what the normal search ACTUALLY does with this item.
   */
  verdict: string;
  /** FR : true si l'objet apparaît dans la recherche normale. / EN: true if shown by the normal search. */
  affiche: boolean;
}

/**
 * FR : parcourt récursivement un objet JSON et renvoie tous les chemins où
 * le mot-clé normalisé apparaît dans une valeur texte.
 * EN: recursively walks a JSON object and returns every path where the
 * normalised keyword appears in a text value.
 */
function trouverCheminsCorrespondants(
  valeur: unknown,
  motNormalise: string,
  cheminActuel: string,
  resultats: { chemin: string; extrait: string }[],
  profondeur = 0
): void {
  if (profondeur > 6 || resultats.length >= 20) return; // FR : garde-fous, un objet Manifest peut être profond.

  if (typeof valeur === "string") {
    const n = normaliser(valeur);
    if (n.includes(motNormalise)) {
      const i = n.indexOf(motNormalise);
      const debut = Math.max(0, i - 30);
      const extrait = valeur.slice(debut, i + motNormalise.length + 30);
      resultats.push({ chemin: cheminActuel, extrait: (debut > 0 ? "…" : "") + extrait });
    }
    return;
  }
  if (Array.isArray(valeur)) {
    valeur.forEach((v, i) => trouverCheminsCorrespondants(v, motNormalise, `${cheminActuel}[${i}]`, resultats, profondeur + 1));
    return;
  }
  if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) {
      trouverCheminsCorrespondants(v, motNormalise, cheminActuel ? `${cheminActuel}.${cle}` : cle, resultats, profondeur + 1);
    }
  }
}

// FR : ⚠️ CORRIGÉ (24/08/2026) - BUG trouvé par l'utilisateur : chercher
// "one-two" donnait 0 correspondance au diagnostic alors que la recherche
// normale en trouvait 3 (dont "Vise le sac, petit", exactement ce qu'on
// cherche à isoler). Cause : le diagnostic n'interrogeait QUE `dbFr`, alors
// que la recherche normale est BILINGUE (dbFr + dbEn). "One-two" est un
// terme anglais - absent du texte brut français, il ne pouvait
// structurellement rien matcher dans une base FR seule ("trouvé via
// l'anglais" sur les 3 résultats de la capture le confirme).
// Le diagnostic accepte désormais dbFr ET dbEn (dbEn optionnel, comme le
// reste de l'appli quand le Manifest anglais n'est pas chargé), et indique
// dans quelle LANGUE chaque correspondance a été trouvée.
// EN: ⚠️ FIXED - bug found by the user: searching "one-two" gave 0 matches
// in the diagnostic while normal search found 3. Cause: the diagnostic only
// queried `dbFr`, while normal search is BILINGUAL. "One-two" is an English
// term, absent from raw French text - it could never match in an FR-only
// database. Now accepts both dbFr and dbEn, and reports which language each
// match came from.
export function diagnostiquerCorrespondances(
  dbFr: Database,
  motCle: string,
  dbEn?: Database | null,
  tables: string[] = TABLES_RECHERCHE_PAR_DEFAUT
): DiagnosticCorrespondance[] {
  const motNormalise = normaliserRecherche(motCle.trim());
  if (motNormalise.length < 2 && !tout) return [];

  const diagnostics: DiagnosticCorrespondance[] = [];

  for (const [langue, db] of [["FR", dbFr], ["EN", dbEn]] as const) {
    if (!db) continue;
    for (const table of tables) {
      const index = obtenirIndexTable(db, table);
      for (const ligne of index) {
        if (!ligne.jsonNormalise.includes(motNormalise)) continue;
        if (diagnostics.length >= 60) return diagnostics; // FR : garde-fou global

        const def = ligne.json
          ? JSON.parse(ligne.json)
          : obtenirDefinition<Record<string, any>>(db, table, idSqliteVersHash(ligne.id)) ?? {};
        const nomAffiche: string = def.displayProperties?.name ?? "(sans nom)";
        const chemins: { chemin: string; extrait: string }[] = [];
        trouverCheminsCorrespondants(def, motNormalise, "", chemins);

        // FR : ⚠️ AJOUT (21/09/2026) - verdict calculé par la MÊME fonction
        // que la recherche normale (réglages par défaut), pour ne plus
        // confondre « trouvé dans le JSON » et « affiché à l'utilisateur ».
        // EN: ⚠️ ADDED - verdict from the SAME function as the normal search.
        const evaluation = evaluerCorrespondance(def, table, motNormalise);
        let affiche = false;
        let verdict: string;
        if (!evaluation.champCorrespondant) {
          verdict = evaluation.correspondDansFlavorText
            ? "🚫 FILTRÉ — ne correspond que dans le texte d'ambiance (flavorText)"
            : "🚫 FILTRÉ — aucune correspondance retenue";
        } else if (CATEGORIES_MASQUEES_PAR_DEFAUT.includes(evaluation.categorie)) {
          verdict = `🙈 MASQUÉ PAR DÉFAUT — catégorie « ${evaluation.categorie} » (visible via le filtre de catégorie)`;
        } else {
          affiche = true;
          verdict = `✅ AFFICHÉ — via « ${evaluation.champCorrespondant} », catégorie « ${evaluation.categorie} »`;
        }

        for (const c of chemins) {
          diagnostics.push({
            table,
            langue,
            hash: idSqliteVersHash(ligne.id),
            nomAffiche,
            cheminJson: c.chemin || "(racine)",
            extrait: c.extrait,
            verdict,
            affiche,
          });
        }
      }
    }
  }
  return diagnostics;
}

// FR : ⚠️ AJOUT (24/08/2026) - diagnostic pour la future "vitrine Solo
// Flawless" (panneau glissant à gauche, demande de l'utilisateur - PAS
// encore intégré). Cherche dans DestinyRecordDefinition (jamais interrogée
// par la recherche normale, absente de TABLES_RECHERCHE_PAR_DEFAUT).
//
// Pourquoi ne PAS se fier à une liste de hashes trouvée en ligne : une
// recherche a confirmé que les noms de triomphe ne suivent PAS un motif
// uniforme - celui de Shattered Throne s'appelle "Seriously, Never Again",
// pas "Shattered Throne Solo Flawless". Une correspondance par nom aurait
// manqué celui-là (et peut-être d'autres). Seul le VRAI Manifest de
// l'utilisateur, à jour de sa version du jeu, fait foi.
//
// Recherche large sur "flawless" (pas "solo flawless") pour ne rien
// manquer, puis on trie à l'œil sur la description affichée.
//
// EN: ⚠️ ADDED - diagnostic for the future "Solo Flawless showcase" (left
// sliding panel, user request - NOT integrated yet). Searches
// DestinyRecordDefinition (never queried by normal search). Confirmed via
// research that triumph names do NOT follow a uniform pattern - Shattered
// Throne's is called "Seriously, Never Again", not "Shattered Throne Solo
// Flawless" - a name-match would have missed it. Broad search on "flawless"
// to avoid missing any, sorted visually by description.
export interface TriompheTrouve {
  hash: number;
  nom: string;
  description: string;
}

export function chercherTriomphesFlawless(db: Database): TriompheTrouve[] {
  const resultats: TriompheTrouve[] = [];
  try {
    const stmt = db.prepare("SELECT json FROM DestinyRecordDefinition");
    while (stmt.step()) {
      const def = JSON.parse(String(stmt.getAsObject().json));
      const nom: string = def.displayProperties?.name ?? "";
      const description: string = def.displayProperties?.description ?? "";
      const texte = normaliser(description);
      // FR : ⚠️ AFFINÉ (24/08/2026) - le seul mot "flawless" remontait trop
      // de bruit (confirmé par l'utilisateur : "beaucoup de triomphes qui
      // sortent"). Il a identifié la vraie signature commune aux 11
      // triomphes recherchés : la description contient TOUJOURS "en solo
      // sans mourir" ET "sans quitter l'activité" - on exige les DEUX,
      // pas l'un ou l'autre, pour éliminer les faux positifs (triomphes
      // "flawless" d'autres activités, PvP, etc. qui ne partagent qu'un
      // des deux critères).
      // EN: ⚠️ REFINED - "flawless" alone matched too much noise. The user
      // identified the real common signature: descriptions always contain
      // BOTH "solo without dying" AND "without leaving the activity" -
      // requiring both eliminates false positives from other Flawless-style
      // triumphs (PvP, other activities) sharing only one criterion.
      // FR : ⚠️ CORRIGÉ (24/08/2026) - la sous-chaîne littérale "en solo sans
      // mourir" ratait 3 donjons sur 11 : l'utilisateur a trouvé qu'une
      // VIRGULE est parfois insérée ("en solo, sans mourir et sans quitter
      // l'activité"), sur les triomphes des donjons les plus récents
      // (Vesper's Host, Warlord's Ruin, Ghosts of the Deep). Formulation
      // confirmée manquante par une recherche manuelle dans le Manifest
      // (résultat vide), pas un problème de Manifest périmé.
      // On découple donc les deux morceaux ("en solo" et "sans mourir") et
      // on tolère jusqu'à quelques caractères de ponctuation entre eux,
      // plutôt qu'une sous-chaîne figée.
      // EN: ⚠️ FIXED - the literal substring "en solo sans mourir" missed 3
      // of 11 dungeons: the user found a COMMA sometimes inserted on the
      // newest dungeons' triumphs. Decoupled the two fragments and tolerate
      // a few punctuation characters between them, instead of a fixed
      // substring.
      const aSoloSansMourir =
        /en solo,?\s*sans mourir/.test(texte) || texte.includes("solo without dying");
      // FR : ⚠️ CORRIGÉ (24/08/2026) - "sans quitter l'activité" ratait
      // Ghosts of the Deep (Fantômes des Profondeurs, confirmé par recherche
      // manuelle de l'utilisateur via le nouveau filtre "Triomphes") : sa
      // formulation utilise "ni quitter l'activité" au lieu de "sans
      // quitter". Troisième variation de formulation trouvée sur ces
      // triomphes (après la virgule optionnelle sur le premier fragment) -
      // les descriptions ne sont visiblement PAS toutes rédigées sur un
      // template strictement identique.
      // EN: ⚠️ FIXED - "sans quitter l'activité" missed Ghosts of the Deep,
      // whose wording uses "ni quitter" instead. Third wording variation
      // found on these triumphs - descriptions aren't all written from a
      // strictly identical template.
      const aSansQuitter =
        /(sans|ni) quitter l'activite/.test(texte) || texte.includes("without leaving the activity");
      if (aSoloSansMourir && aSansQuitter) {
        resultats.push({ hash: def.hash ?? 0, nom, description });
      }
    }
    stmt.free();
  } catch {
    // FR : table absente de ce Manifest (ancienne version ?) - liste vide, pas de blocage.
  }
  return resultats;
}

// FR : ⚠️ AJOUT (24/08/2026) - diagnostic ponctuel pour la future vitrine
// des emblèmes Solo Flawless (idée de l'utilisateur, "tableau de chasse").
// Affiche la DÉFINITION COMPLÈTE d'un triomphe, pour voir exactement dans
// quel champ la récompense (l'emblème) est déclarée, plutôt que deviner un
// nom de champ ("rewardItems" n'est qu'une hypothèse à ce stade).
// EN: ⚠️ ADDED - one-off diagnostic for the future Solo Flawless emblem
// showcase. Shows a triumph's FULL definition, to see exactly which field
// declares the reward (the emblem), rather than guessing a field name.
export function obtenirDefinitionTriompheBrute(db: Database, hash: number): string | null {
  try {
    const stmt = db.prepare("SELECT json FROM DestinyRecordDefinition WHERE id = ?");
    stmt.bind([hashVersIdSqlite(hash)]);
    if (stmt.step()) {
      const json = stmt.getAsObject().json as string;
      stmt.free();
      return JSON.stringify(JSON.parse(json), null, 1);
    }
    stmt.free();
    return null;
  } catch {
    return null;
  }
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - diagnostic pour les hashes d'artefact.
 * L'utilisateur a trouvé 3 hashes DestinyInventoryItemDefinition partageant
 * le même nom affiché pour chaque artefact (convention connue du Manifest
 * Bungie : plusieurs définitions - l'objet équipable réel, une entrée de
 * collection, parfois une copie inerte - partagent souvent le même texte).
 * Plutôt que de deviner lequel des 3 est le bon, compare leurs icônes : le
 * bon candidat est celui qui a une VRAIE icône renseignée, les copies
 * inertes n'en ont généralement aucune.
 * EN: ⚠️ ADDED - diagnostic for artifact hashes. The user found 3
 * DestinyInventoryItemDefinition hashes sharing the same display name per
 * artifact (known Bungie Manifest convention). Rather than guessing,
 * compares their icons: the real candidate has one, inert copies usually
 * don't.
 */
export function comparerCandidatsIcone(db: Database, hashes: number[]): string {
  const lignes: string[] = [];
  for (const hash of hashes) {
    const def = obtenirDefinition<{ displayProperties?: { name?: string; icon?: string } }>(
      db,
      "DestinyInventoryItemDefinition",
      hash
    );
    if (!def) {
      lignes.push(`${hash} : ❌ INTROUVABLE dans le Manifest`);
      continue;
    }
    const nom = def.displayProperties?.name ?? "(sans nom)";
    const icone = urlIcone(def.displayProperties?.icon);
    lignes.push(icone ? `${hash} : "${nom}" — ✅ icône : ${icone}` : `${hash} : "${nom}" — ⚠️ AUCUNE icône`);
  }
  return lignes.join("\n");
}
