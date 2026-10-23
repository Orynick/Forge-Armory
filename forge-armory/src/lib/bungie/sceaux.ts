// FR : ⚠️ AJOUT (23/10/2026, TODO n°23, branche draft-update-triomphes) - MODÈLE de la page « Accomplissements » : regroupement des TRIOMPHES DU COMPTE PAR SCEAU, comme dans Collections→Sceaux du jeu. Lecture seule : on lit le Manifest existant (`DestinyPresentationNodeDefinition`, `DestinyRecordDefinition`) et l'état des records du profil (composant 900, `profileRecords`), on n'écrit rien, on ne persiste rien.
//
// Sources de vérité :
// - Manifest : la racine « Triumphs » (nœud 1163735237, scope 1 = compte) → ses enfants sont les CATÉGORIES (nœuds de regroupement) → leurs enfants sont les SCEAUX (nœuds avec `completionRecordHash` = le record dont la complétion débloque le titre) et/ou des nœuds intermédiaires → les `children.records` du nœud sceau = les TRIOMPHES du sceau.
// - Profil (composant 900) : `Response.profileRecords.data.records` (clé = hash du record, valeur = `{ state, objectives, ... }`). L'état `state` est un CHAMP DE BITS : un triomphe est accompli quand le bit « objectif non complété » (4) est à ZÉRO — logique inversée (voir `BIT_OBJECTIF_NON_COMPLETE` dans `triomphes.ts`, même constat du 24/08/2026).
//
// ⚠️ PORTÉE PROFIL UNIQUEMENT : la page ne montre que les triomphes de portée PROFIL (scope 0 dans `DestinyRecordDefinition`, lus dans `profileRecords`). Les triomphes de portée PERSONNAGE (`characterRecords`) sont exclus — ce sont les « Solo sans mourir » du tiroir, pas des accomplissements de compte.
//
// ⚠️ JAMAIS D'ESTIMATION : un triomphe absent du Manifest (définition introuvable) est affiché avec son hash brut ; un triomphe absent du profil est « à obtenir » (pas masqué) ; un sceau sans nom est « Sceau sans nom ». Aucune donnée n'est inventée.
//
// EN: ADDED - MODEL of the "Accomplishments" page: grouping ACCOUNT TRIUMPHS BY SEAL, like the game's Collections→Seals. Read-only: reads the existing Manifest (`DestinyPresentationNodeDefinition`, `DestinyRecordDefinition`) and the profile's records state (component 900, `profileRecords`); writes nothing, persists nothing.
// Truth sources:
// - Manifest: the "Triumphs" root (node 1163735237, scope 1 = account) → children are the CATEGORIES (grouping nodes) → their children are the SEALS (nodes with `completionRecordHash` = the record whose completion unlocks the title) and/or intermediate nodes → a seal node's `children.records` = the seal's TRIUMPHS.
// - Profile (component 900): `Response.profileRecords.data.records` (key = record hash, value = `{ state, objectives, ... }`). The `state` is a BIT FIELD: a triumph is earned when the "objective not completed" bit (4) is ZERO — inverted logic (see `BIT_OBJECTIF_NON_COMPLETE` in `triomphes.ts`, same finding of 2026-08-24).
// PROFILE SCOPE ONLY: the page only shows PROFILE-scope triumphs (scope 0 in `DestinyRecordDefinition`, read from `profileRecords`). CHARACTER-scope triumphs (`characterRecords`) are excluded — those are the drawer's "Solo Flawless", not account accomplishments.
// NEVER GUESSED: a triumph missing from the Manifest (definition not found) is shown with its raw hash; a triumph missing from the profile is "to earn" (not hidden); a nameless seal is "Sceau sans nom". No data is invented.

import type { Database } from "sql.js";
import { obtenirDefinition, idSqliteVersHash } from "../manifest/download";
import { urlIcone } from "../manifest/search";
import { BIT_OBJECTIF_NON_COMPLETE } from "./triomphes";
import { parserRecherche, requeteVide, correspondRecherche, type RequeteRecherche } from "../legendarium/modele";
import type { DestinyPresentationNodeDefinition, DestinyRecordDefinition } from "../../types/manifest";

const TABLE_NOEUDS = "DestinyPresentationNodeDefinition";
const TABLE_RECORDS = "DestinyRecordDefinition";

/** FR : hash du nœud racine « Triumphs » (scope 1 = compte). Vérifié sur le Manifest (light.gg : nœud 1163735237 « Triumphs », scope 1, enfants = catégories). / EN: hash of the "Triumphs" root node (scope 1 = account). Verified on the Manifest (light.gg: node 1163735237 "Triumphs", scope 1, children = categories). */
export const HASH_RACINE_TRIOMPHES = 1163735237;

/** FR : portée PROFIL d'un record (`DestinyRecordDefinition.scope` : 0 = profil, 1 = personnage). / EN: PROFILE scope of a record (`DestinyRecordDefinition.scope`: 0 = profile, 1 = character). */
export const SCOPE_PROFIL = 0;

/** FR : un OBJECTIF de progression d'un record, tel que renvoyé par le composant 900 (`objectives` : `progress`, `completionValue`, `complete`...). / EN: a record's progression objective, as returned by component 900 (`objectives`: `progress`, `completionValue`, `complete`...). */
export interface ObjectifTriomphe {
  /** FR : progression courante (peut dépasser `completionValue` pour les objectifs sans plafond). / EN: current progress (may exceed `completionValue` for uncapped objectives). */
  progression: number;
  /** FR : valeur à atteindre pour compléter l'objectif. Undefined = objectif sans compteur (binaire). / EN: value to reach to complete the objective. Undefined = counter-less (binary) objective. */
  completionValue?: number;
  /** FR : l'objectif est-il complété (bit 4 à zéro dans l'état de l'objectif). / EN: is the objective complete (bit 4 zero in the objective's state). */
  complete: boolean;
}

/** FR : UN TRIOMPHE de la page, croisé Manifest (définition) + profil (état). / EN: ONE TRIUMPH of the page, crossed Manifest (definition) + profile (state). */
export interface TriompheSceau {
  /** FR : hash du record (clé dans `profileRecords`). / EN: record hash (key in `profileRecords`). */
  hash: number;
  /** FR : nom FR depuis le Manifest, ou le hash brut si la définition est introuvable (jamais renommé à l'aveugle). / EN: FR name from the Manifest, or the raw hash if the definition is missing (never blindly renamed). */
  nom: string;
  /** FR : description FR, ou chaîne vide si absente. / EN: FR description, or empty string if absent. */
  description: string;
  /** FR : URL de l'icône, ou undefined si le record n'en a pas. / EN: icon URL, or undefined if the record has none. */
  icone?: string;
  /** FR : triomphe OBTENU (bit « objectif non complété » à zéro) ? / EN: is the triumph EARNED (bit "objective not completed" zero)? */
  accompli: boolean;
  /** FR : objectifs de progression (quand le record en a). Vide sinon. / EN: progression objectives (when the record has some). Empty otherwise. */
  objectifs: ObjectifTriomphe[];
  /** FR : points de score de triomphe gagnés à la complétion (`completionInfo.ScoreValue`), undefined si le champ est absent. / EN: triumph score points earned on completion (`completionInfo.ScoreValue`), undefined if the field is absent. */
  score?: number;
}

/** FR : UN SCEAU : un nœud de l'arbre Triumphs avec `completionRecordHash`. / EN: ONE SEAL: a node of the Triumphs tree with `completionRecordHash`. */
export interface Sceau {
  /** FR : hash du nœud sceau. / EN: seal node hash. */
  hash: number;
  /** FR : nom du sceau (nom du nœud), ou « Sceau sans nom » si absent. / EN: seal name (node name), or "Sceau sans nom" if absent. */
  nom: string;
  /** FR : URL de l'icône du sceau (nœud), ou undefined. / EN: seal icon URL (node), or undefined. */
  icone?: string;
  /** FR : les triomphes DU sceau (enfants records du nœud), triés par nom FR. / EN: the seal's TRIUMPHS (the node's record children), sorted by FR name. */
  triomphes: TriompheSceau[];
  /** FR : nom du TITRE débloqué à 100 %, ou undefined si le sceau n'a pas de titre (record de complétion sans `titleInfo.hasTitle`) ou si la définition est illisible. / EN: name of the TITLE unlocked at 100%, or undefined if the seal has no title (completion record without `titleInfo.hasTitle`) or if the definition is unreadable. */
  titre?: string;
  /** FR : le record de COMPLÉTION du sceau est-il accompli (titre débloqué) ? Undefined si le record de complétion est introuvable dans le profil. / EN: is the seal's COMPLETION record earned (title unlocked)? Undefined if the completion record is missing from the profile. */
  titreDebloque?: boolean;
  /** FR : catégorie parente (nom du nœud catégorie, ex. « Raids »), quand l'arbre en a une. / EN: parent category (category node name, e.g. "Raids"), when the tree has one. */
  categorie?: string;
}

/** FR : un record du profil (composant 900) tel que lu : état bitfield + objectifs. / EN: a profile record (component 900) as read: bitfield state + objectives. */
interface RecordProfil {
  state?: number;
  objectives?: Array<{ progress?: number; completionValue?: number; complete?: boolean; state?: number }>;
}

interface ProfilAvecRecords {
  Response?: {
    profileRecords?: { data?: { records?: Record<string, RecordProfil> } };
  };
}

/** FR : lit TOUS les nœuds de présentation en UNE requête, indexés par hash (signé → non signé via `idSqliteVersHash`, comme le Legendarium). Renvoie une Map vide si la table est absente (Manifest vieilli). / EN: reads ALL presentation nodes in ONE query, indexed by hash (signed → unsigned via `idSqliteVersHash`, like the Legendarium). Returns an empty Map if the table is missing (old Manifest). */
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
      noeuds.set(idSqliteVersHash(ligne.id), JSON.parse(ligne.json) as DestinyPresentationNodeDefinition);
    } catch {
      continue;
    }
  }
  return noeuds;
}

/** FR : lit un record par son hash, sans jamais planter. / EN: reads a record by hash, never throws. */
function lireRecord(db: Database, recordHash: number): DestinyRecordDefinition | undefined {
  try {
    return obtenirDefinition<DestinyRecordDefinition>(db, TABLE_RECORDS, recordHash);
  } catch {
    return undefined;
  }
}

/** FR : l'état d'un record du profil : accompli = bit « objectif non complété » (4) À ZÉRO (logique inversée, voir triomphes.ts). Undefined quand le record est absent du profil. / EN: a record's profile state: earned = "objective not completed" bit (4) ZERO (inverted logic, see triomphes.ts). Undefined when the record is absent from the profile. */
function etatAccompli(record: RecordProfil | undefined): boolean | undefined {
  if (!record || record.state === undefined) return undefined;
  return (record.state & BIT_OBJECTIF_NON_COMPLETE) === 0;
}

/** FR : construit UN triomphe croisé (définition Manifest + état profil). / EN: builds ONE crossed triumph (Manifest definition + profile state). */
function construireTriomphe(db: Database, recordHash: number, recordsProfil: Record<string, RecordProfil>): TriompheSceau {
  const def = lireRecord(db, recordHash);
  const etat = recordsProfil[String(recordHash)];
  return {
    hash: recordHash,
    nom: def?.displayProperties?.name?.trim() || String(recordHash),
    description: def?.displayProperties?.description?.trim() ?? "",
    icone: urlIcone(def?.displayProperties?.icon),
    accompli: etatAccompli(etat) === true,
    objectifs: (etat?.objectives ?? []).map((o) => ({
      progression: o.progress ?? 0,
      completionValue: o.completionValue,
      complete: o.complete === true || (o.state !== undefined && (o.state & BIT_OBJECTIF_NON_COMPLETE) === 0),
    })),
    score: def?.completionInfo?.ScoreValue,
  };
}

/** FR : le NOM DU TITRE d'un record de complétion de sceau : `titleInfo.titlesByGender` (texte FR direct) en priorité, sinon le nom du record lui-même quand `hasTitle` est vrai. Undefined sinon. / EN: the TITLE NAME of a seal's completion record: `titleInfo.titlesByGender` (direct FR text) first, else the record's own name when `hasTitle` is true. Undefined otherwise. */
function nomTitreRecord(def: DestinyRecordDefinition | undefined): string | undefined {
  if (!def?.titleInfo?.hasTitle) return undefined;
  const parGenre = def.titleInfo.titlesByGender;
  if (parGenre) {
    const valeurs = Object.values(parGenre).filter((v) => typeof v === "string" && v.trim());
    if (valeurs.length > 0) return valeurs[0].trim();
  }
  return def.displayProperties?.name?.trim() || undefined;
}

/** FR : collecte RÉCURSIVEMENT tous les nœuds SCEAUX (avec `completionRecordHash`) sous un nœud, en profondeur d'abord. Un nœud sceau est traité ENTIÈREMENT (ses propres records) et on ne descend PAS dans ses enfants (les sceaux ne s'imbriquent pas dans Triumphs). `categorie` = nom du nœud catégorie passé en paramètre (le parent direct du sceau quand c'est une catégorie, sinon la catégorie de l'ancêtre). / EN: collects ALL SEAL nodes (with `completionRecordHash`) under a node, depth-first. A seal node is processed WHOLE (its own records) and we do NOT descend into its children (seals don't nest under Triumphs). `categorie` = the category node name passed as parameter (the seal's direct parent when it is a category, else the ancestor's category). */
function collecterSceaux(
  noeuds: Map<number, DestinyPresentationNodeDefinition>,
  hashNoeud: number,
  categorie: string | undefined,
  marques: Set<number>,
  sceaux: Array<{ noeud: DestinyPresentationNodeDefinition; categorie?: string }>
): void {
  if (marques.has(hashNoeud)) return;
  marques.add(hashNoeud);
  const noeud = noeuds.get(hashNoeud);
  if (!noeud || noeud.redacted || noeud.blacklisted) return;
  if (noeud.completionRecordHash !== undefined) {
    sceaux.push({ noeud, categorie });
    return; // un sceau : on ne descend pas plus bas
  }
  const nomCategorie = noeud.displayProperties?.name?.trim() || categorie;
  for (const enfant of noeud.children?.presentationNodes ?? []) {
    collecterSceaux(noeuds, enfant.presentationNodeHash, nomCategorie, marques, sceaux);
  }
}

/** FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - REGROUPE les triomphes du compte PAR SCEAU, depuis l'arbre « Triumphs » du Manifest croisé avec l'état des records du profil (composant 900). Ne renvoie que les triomphes de PORTÉE PROFIL (scope 0) : les triomphes de portée personnage sont exclus (ce sont les « Solo sans mourir » du tiroir). Un triomphe ABSENT du profil est « à obtenir » (affiché, jamais masqué). Triés par nom FR. `db` absent (Manifest non chargé) → liste vide (la page affichera « non disponible »). / EN: ADDED - GROUPS the account's triumphs BY SEAL, from the Manifest's "Triumphs" tree crossed with the profile's records state (component 900). Only PROFILE-scope (scope 0) triumphs are returned: character-scope triumphs are excluded (those are the drawer's "Solo Flawless"). A triumph ABSENT from the profile is "to earn" (shown, never hidden). Sorted by FR name. `db` missing (Manifest not loaded) → empty list (the page shows "non disponible"). */
export function regrouperParSceau(db: Database | null | undefined, profil: unknown): Sceau[] {
  if (!db) return [];
  const recordsProfil = (profil as ProfilAvecRecords | null | undefined)?.Response?.profileRecords?.data?.records ?? {};
  let noeuds: Map<number, DestinyPresentationNodeDefinition>;
  try {
    noeuds = lireNoeudsPresentation(db);
  } catch {
    return [];
  }
  if (noeuds.size === 0) return [];

  const collecte: Array<{ noeud: DestinyPresentationNodeDefinition; categorie?: string }> = [];
  collecterSceaux(noeuds, HASH_RACINE_TRIOMPHES, undefined, new Set(), collecte);

  const sceaux: Sceau[] = [];
  for (const { noeud, categorie } of collecte) {
    const triomphes: TriompheSceau[] = [];
    for (const enfant of noeud.children?.records ?? []) {
      const def = lireRecord(db, enfant.recordHash);
      // ⚠️ PORTÉE PROFIL UNIQUEMENT : scope 0 (ou absent = profil par défaut dans le Manifest). Un record de portée personnage (scope 1) est exclu.
      if (def && def.scope !== undefined && def.scope !== SCOPE_PROFIL) continue;
      if (!def || def.redacted || def.blacklisted) continue;
      triomphes.push(construireTriomphe(db, enfant.recordHash, recordsProfil));
    }
    triomphes.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    if (triomphes.length === 0) continue;

    const recordCompletion = noeud.completionRecordHash !== undefined ? lireRecord(db, noeud.completionRecordHash) : undefined;
    const etatCompletion = noeud.completionRecordHash !== undefined ? etatAccompli(recordsProfil[String(noeud.completionRecordHash)]) : undefined;
    sceaux.push({
      hash: noeud.hash,
      nom: noeud.displayProperties?.name?.trim() || "Sceau sans nom",
      icone: urlIcone(noeud.displayProperties?.icon),
      triomphes,
      titre: nomTitreRecord(recordCompletion),
      titreDebloque: etatCompletion,
      categorie,
    });
  }
  sceaux.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  return sceaux;
}

/** FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - COMPTEURS GLOBAUX de la page : nombre de triomphes obtenus / total, et score total (somme des `completionInfo.ScoreValue` des triomphes OBTENUS — le score de triomphe ne compte que ce qui est complété). Le score est `undefined` si AUCUN triomphe n'a de `ScoreValue` connu (jamais estimé). / EN: ADDED - the page's GLOBAL COUNTERS: earned / total triumphs, and total score (sum of the EARNED triumphs' `completionInfo.ScoreValue` — triumph score only counts what is completed). The score is `undefined` when NO triumph has a known `ScoreValue` (never guessed). */
export function compteursGlobaux(sceaux: Sceau[]): { obtenus: number; total: number; score?: number } {
  let obtenus = 0, total = 0, scoreConnue = false;
  let score = 0;
  for (const sceau of sceaux) {
    for (const t of sceau.triomphes) {
      total++;
      if (t.accompli) {
        obtenus++;
        if (t.score !== undefined) { score += t.score; scoreConnue = true; }
      }
    }
  }
  return { obtenus, total, score: scoreConnue ? score : undefined };
}

/** FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - RECHERCHE dans les sceaux : la requête (syntaxe avancée du Legendarium : guillemets `"phrase exacte"`/`« »`, `+obligatoire`, `-exclu`) porte sur le NOM et la DESCRIPTION de chaque triomphe, PLUS le nom du sceau et de sa catégorie : si le SCEAU correspond, TOUS ses triomphes sont remontés (la recherche cible un sceau, pas un triomphe isolé). `respecterCasse` : VRAI = sensible à la casse (accents toujours normalisés), FAUX (défaut) = insensible. Requête vide → tous les sceaux. Exemple : `+"solo sans mourir" -gambit "Chute de la Maison"`. / EN: ADDED - SEARCH across seals: the query (Legendarium's advanced syntax: quotes `"exact phrase"`/`« »`, `+required`, `-excluded`) matches each triumph's NAME and DESCRIPTION, PLUS the seal's name and category: if the SEAL matches, ALL its triumphs are returned (the search targets a seal, not a lone triumph). `respecterCasse`: TRUE = case-sensitive (accents still normalized), FALSE (default) = case-insensitive. Empty query → all seals. Example: `+"solo sans mourir" -gambit "Chute de la Maison"`. */
export function filtrerSceaux(sceaux: Sceau[], texteRecherche: string, options?: { respecterCasse?: boolean }): Sceau[] {
  const requete: RequeteRecherche = parserRecherche(texteRecherche.trim());
  if (requeteVide(requete)) return sceaux;
  const respecterCasse = options?.respecterCasse === true;
  return sceaux
    .map((sceau) => {
      const haystackSceau = `${sceau.nom} ${sceau.categorie ?? ""} ${sceau.titre ?? ""}`;
      const sceauMatch = correspondRecherche(haystackSceau, requete, respecterCasse);
      const triomphes = sceauMatch
        ? sceau.triomphes
        : sceau.triomphes.filter((t) => correspondRecherche(`${t.nom} ${t.description}`, requete, respecterCasse));
      if (triomphes.length === 0) return null;
      return { ...sceau, triomphes };
    })
    .filter((s): s is Sceau => s !== null);
}

/** FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - TRI des sceaux : par PROGRESSION (décroissante : les plus avancés d'abord, puis les complétés, puis par nom) ou par NOM (alphabétique FR). / EN: ADDED - SEAL SORTING: by PROGRESS (descending: most advanced first, then completed, then by name) or by NAME (FR alphabetical). */
export type TriSceaux = "progression" | "nom";

export function trierSceaux(sceaux: Sceau[], tri: TriSceaux): Sceau[] {
  const copie = [...sceaux];
  if (tri === "nom") {
    copie.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    return copie;
  }
  // progression : ratio accompli/total décroissant, complétés d'abord à égalité, puis nom
  const ratio = (s: Sceau) => (s.triomphes.length === 0 ? 0 : s.triomphes.filter((t) => t.accompli).length / s.triomphes.length);
  copie.sort((a, b) => {
    const completA = a.triomphes.length > 0 && a.triomphes.every((t) => t.accompli);
    const completB = b.triomphes.length > 0 && b.triomphes.every((t) => t.accompli);
    if (completA !== completB) return completA ? -1 : 1;
    const diff = ratio(b) - ratio(a);
    if (diff !== 0) return diff;
    return a.nom.localeCompare(b.nom, "fr");
  });
  return copie;
}
