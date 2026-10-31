// FR : Gestion des loadouts (builds sauvegardés), 100% EN LOCAL.
//
// Choix technique : localStorage plutôt que l'API Bungie. Deux raisons.
// D'abord ça n'a aucune dépendance réseau : sauvegarder et recharger un
// build marche même hors ligne, et surtout ça ne peut pas retomber sur
// les erreurs 500/401 rencontrées avec les loadouts côté Bungie. Ensuite
// c'est instantané. La contrepartie à connaître : les loadouts sont liés
// au NAVIGATEUR utilisé, pas au compte Bungie - ils ne suivent pas d'un
// PC à l'autre, et vider les données du site les efface. D'où la
// fonction d'export/import en JSON, qui sert de sauvegarde manuelle.
//
// On enregistre le BuildDraft ENTIER (armes, armure, doctrine complète
// avec super/aspects/fragments/mêlée/grenade, artefact) - demande
// explicite de l'utilisateur : un loadout qui ne garderait que
// l'équipement ne décrirait le build qu'à moitié. Les perks et mods
// suivront quand ils seront modélisés, sans changer ce format puisqu'ils
// font déjà partie de GearPiece.
//
// EN: Loadout management (saved builds), 100% LOCAL. localStorage rather
// than the Bungie API: no network dependency (works offline, and can't
// hit the 500/401 errors seen with Bungie-side loadouts), and instant.
// The trade-off: loadouts are tied to the BROWSER, not the Bungie
// account - hence the JSON export/import as a manual backup. The WHOLE
// BuildDraft is stored (weapons, armor, full subclass, artifact), per the
// user's explicit request.

import { buildExportable } from "./pieceExportable";   // ⚠️ AJOUT (14/10/2026, v0.4.9)
import { BuildDraft, GearPiece } from "../../types/build";

const CLE_STOCKAGE = "d2-build-analyzer.loadouts.v1";

export interface Loadout {
  id: string;
  nom: string;
  /** FR : description libre du loadout (à quoi il sert, dans quel contexte l'utiliser...). Optionnel : les loadouts enregistrés avant l'ajout de ce champ restent valides. / EN: free-text description (what it's for, in which context). Optional: loadouts saved before this field existed stay valid. */
  description?: string;
  /**
   * FR : ⚠️ AJOUT (04/08/2026) - repères visuels FIGÉS à la sauvegarde
   * (demande explicite de l'utilisateur). Un loadout est un instantané : ses
   * repères doivent l'être aussi, sinon un loadout Solaire afficherait
   * l'icône Arc après un changement de doctrine dans le build courant.
   * EN: ⚠️ ADDED - visual markers FROZEN at save time (explicit user request).
   * A loadout is a snapshot, its markers should be too.
   */
  classeFigee?: "titan" | "chasseur" | "arcaniste" | null;
  elementFige?: string | null;
  /** FR : icône choisie par l'utilisateur (emoji, ou identifiant d'icône interne comme "champion:implacable"). Facultative. / EN: user-picked icon (emoji, or internal id). Optional. */
  iconeChoisie?: string;
  /** FR : date de dernière sauvegarde, en ISO - sert au tri (plus récent en premier). / EN: last save date, ISO - used for sorting (most recent first). */
  enregistreLe: string;
  /**
   * FR : ⚠️ AJOUT (06/10/2026, v0.3.3) - PSEUDO DE L'AUTEUR du build, figé à l'enregistrement : le nom Bungie affiché dans le bloc Connexion (`pseudo#1234`), tel qu'il est affiché à ce moment-là (demande
   * de l'utilisateur : « quand un build est sauvegardé, ajouter le pseudo de l'auteur »). FACULTATIF : les builds enregistrés avant cet ajout n'en ont pas et restent valides, sans migration ; un build
   * enregistré sans être connecté n'en a pas non plus. Il VOYAGE avec le build (fichier d'échange, import) : le build d'un ami importé garde le pseudo de l'ami, jamais celui de l'utilisateur.
   * EN: ⚠️ ADDED - the build author's handle (`name#1234`, as shown in the Connection block), frozen at save time. OPTIONAL: older builds have none, no migration; it travels with the build.
   */
  auteur?: string;
  /**
   * FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - RANG d'affichage choisi par l'utilisateur (onglet « Load-outs », phase 3). FACULTATIF : sans lui (builds enregistrés avant l'ajout, builds neufs), le loadout est trié par date comme avant et placé EN TÊTE ;
   * dès que l'utilisateur déplace un build, TOUS reçoivent un rang (0, 1, 2…) dans l'ordre affiché. Un fichier d'échange d'UN build ne le contient jamais (c'est un arrangement personnel). / EN: ⚠️ ADDED - display rank chosen by the user; optional.
   */
  ordre?: number;
  /**
   * FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - MÉMO « stocké en jeu », à cocher à la main dans l'onglet « Load-outs » (décision du 05/10/2026) : l'appli ne vérifie ni n'enregistre RIEN dans le jeu. FACULTATIF : absent = non coché (la case décochée
   * SUPPRIME le champ au lieu d'écrire `false`). Un fichier d'échange d'UN build ne le contient jamais : le build d'un ami n'arrive pas « stocké dans MON jeu ». / EN: ⚠️ ADDED - manual "stored in game" memo; optional; never exported with a single shared build.
   */
  stockeEnJeu?: boolean;
  build: BuildDraft;
}

/** FR : longueur maximale d'un pseudo conservé (un nom Bungie en compte au plus une trentaine, avec son code). / EN: maximum stored handle length. */
const AUTEUR_LONGUEUR_MAX = 64;

/**
 * FR : ⚠️ AJOUT (06/10/2026) - pseudo d'auteur NETTOYÉ : seulement du texte, sans caractères de contrôle, espaces réduits, 64 caractères au plus ; `undefined` si vide ou si ce n'est pas du texte. Sert à
 * l'enregistrement ET à l'import : un fichier venu d'ailleurs ne peut ainsi ni contenir autre chose qu'un court texte, ni un champ de taille démesurée. Les exports échappent de toute façon le texte.
 * EN: ⚠️ ADDED - cleaned author handle (text only, no control characters, collapsed spaces, max 64 chars), `undefined` when empty or not text.
 */
export function nettoyerAuteur(valeur: unknown): string | undefined {
  if (typeof valeur !== "string") return undefined;
  // eslint-disable-next-line no-control-regex
  const propre = valeur.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, AUTEUR_LONGUEUR_MAX).trim();
  return propre || undefined;
}


function estBuildMinimalementValide(build: unknown): build is BuildDraft {
  if (!build || typeof build !== "object") return false;
  const b = build as Partial<BuildDraft>;
  return Boolean(
    b.subclass &&
      typeof b.subclass === "object" &&
      b.artifact &&
      typeof b.artifact === "object" &&
      Array.isArray(b.armes) &&
      Array.isArray(b.armure)
  );
}

function estLoadoutValide(loadout: unknown): loadout is Loadout {
  if (!loadout || typeof loadout !== "object") return false;
  const l = loadout as Partial<Loadout>;
  return typeof l.id === "string" && typeof l.nom === "string" && estBuildMinimalementValide(l.build);
}

/**
 * FR : lit les loadouts enregistrés. Ne lève JAMAIS d'exception : si le
 * stockage est corrompu, indisponible (navigation privée stricte, quota
 * plein) ou dans un format inattendu, on renvoie une liste vide plutôt
 * que de casser toute la page pour une fonctionnalité secondaire.
 * EN: reads saved loadouts. NEVER throws: on corrupted/unavailable
 * storage we return an empty list rather than breaking the whole page
 * over a secondary feature.
 */
/**
 * FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - ORDRE D'AFFICHAGE : d'abord les loadouts SANS rang (builds neufs ou anciens jamais déplacés), du plus récent au plus ancien, comme avant ; puis ceux qui ont un rang, par rang croissant (égalité : le plus
 * récent d'abord). Un build neuf est donc toujours visible EN TÊTE, au-dessus de l'ordre que l'utilisateur a composé. Un rang qui n'est pas un nombre fini (fichier abîmé) est ignoré. / EN: ⚠️ ADDED - display order: unranked first (newest first), then ranked by rank.
 */
function comparerLoadouts(a: Loadout, b: Loadout): number {
  const ra = Number.isFinite(a.ordre) ? (a.ordre as number) : null;
  const rb = Number.isFinite(b.ordre) ? (b.ordre as number) : null;
  const parDate = (b.enregistreLe ?? "").localeCompare(a.enregistreLe ?? "");
  if (ra === null && rb === null) return parDate;
  if (ra === null) return -1;
  if (rb === null) return 1;
  return ra !== rb ? ra - rb : parDate;
}

export function listerLoadouts(): Loadout[] {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return [];
    const donnees = JSON.parse(brut);
    if (!Array.isArray(donnees)) return [];
    return donnees.filter(estLoadoutValide).sort(comparerLoadouts);
  } catch {
    return [];
  }
}

/** FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - nom de l'événement émis à CHAQUE écriture réussie de la liste des loadouts. Le tiroir (vue Build Analyzer, masquée mais toujours montée) et l'onglet « Load-out » sont deux instances du
 * même panneau : sans cette notification, l'une afficherait une liste périmée après une modification faite dans l'autre. / EN: ⚠️ ADDED - event emitted after EVERY successful write, so the two panel instances stay in sync. */
export const EVENEMENT_LOADOUTS_MODIFIES = "d2ba:loadouts-modifies";

function ecrire(loadouts: Loadout[]): { ok: boolean; erreur?: string } {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(loadouts));
    try {
      if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENEMENT_LOADOUTS_MODIFIES));
    } catch {
      /* la notification est un confort : son échec ne doit jamais faire échouer l'enregistrement */
    }
    return { ok: true };
  } catch (e) {
    // FR : cas le plus probable = quota dépassé. On le dit clairement
    // plutôt que d'échouer en silence, sinon l'utilisateur croit avoir
    // sauvegardé alors que non.
    return {
      ok: false,
      erreur:
        (e as Error).name === "QuotaExceededError"
          ? "Espace de stockage du navigateur plein. Supprimez d'anciens loadouts, ou exportez-les avant."
          : `Impossible d'enregistrer : ${(e as Error).message}`,
    };
  }
}

/**
 * FR : ⚠️ EXTRAIT (28/09/2026, v0.2.8) de `enregistrerLoadout` - construit un
 * loadout EN MÉMOIRE, sans l'enregistrer. Sert à l'enregistrement ET au bloc
 * « Partage du build », qui exporte le build en cours sans le sauvegarder :
 * les deux produisent donc exactement le même objet.
 * EN: ⚠️ EXTRACTED - builds a loadout IN MEMORY without saving it; shared by
 * saving and by the "share build" block, so both produce the same object.
 */
export function construireLoadout(nom: string, build: BuildDraft, description = "", iconeChoisie = "", auteur = ""): Loadout {
  // FR : structuredClone pour figer une COPIE de l'état du build. Sans ça
  // le loadout garderait une référence vers l'objet vivant et se
  // modifierait tout seul quand on continue à éditer le build en cours.
  return {
    id: `loadout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nom: nom.trim() || "Sans nom",
    description: description.trim(),
    // FR : on FIGE classe et élément au moment de la sauvegarde.
    classeFigee: build.subclass.classe,
    elementFige: build.subclass.element,
    iconeChoisie: iconeChoisie || undefined,
    enregistreLe: new Date().toISOString(),
    // FR : ⚠️ AJOUT (06/10/2026) - pseudo de l'auteur, figé comme classe et élément ; absent (`undefined`, donc non écrit dans le JSON) si l'on n'est pas connecté.
    auteur: nettoyerAuteur(auteur),
    // FR : ⚠️ CHANGÉ (14/10/2026, v0.4.9) - `buildExportable` : ni la liste des perks DISPONIBLES mais non sélectionnés, ni un perk simulé ne sont enregistrés (demande de l'utilisateur : seuls les perks sélectionnés, réels). / EN: ⚠️ CHANGED - only selected, real perks are saved.
    build: structuredClone(buildExportable(build)),
  };
}

/** FR : ⚠️ AJOUT (07/10/2026, v0.3.10) - message renvoyé quand on tente d'enregistrer un build SANS NOM. Même texte que celui affiché par les fenêtres « Modifier » et « Enregistrer le build ». / EN: ⚠️ ADDED - error returned when saving a build with no name. */
export const ERREUR_NOM_VIDE = "Le nom ne peut pas être vide.";

export function enregistrerLoadout(nom: string, build: BuildDraft, description = "", iconeChoisie = "", auteur = ""): { ok: boolean; erreur?: string } {
  // FR : ⚠️ AJOUT (07/10/2026, v0.3.10) - le NOM EST OBLIGATOIRE, partout (demande de l'utilisateur : aligner la zone de l'onglet et la fenêtre du Build Analyzer, que l'une acceptait vide et l'autre non). Les deux écrans le vérifient déjà (bouton
  // grisé) ; ce refus est la garde de fond : plus aucun chemin ne peut créer un build « Sans nom ». Rien n'est écrit et aucun événement n'est émis. `construireLoadout` garde son repli « Sans nom » : il sert aussi à construire EN MÉMOIRE le
  // loadout du bloc de partage (qui a son propre nom par défaut), jamais à enregistrer.
  // EN: ⚠️ ADDED - the NAME IS REQUIRED everywhere; this is the backstop. Nothing is written, no event emitted.
  if (!nom.trim()) return { ok: false, erreur: ERREUR_NOM_VIDE };
  const loadouts = listerLoadouts();
  const nouveau = construireLoadout(nom, build, description, iconeChoisie, auteur);
  return ecrire([nouveau, ...loadouts]);
}

/**
 * FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - PLACE un loadout à la position `indexCible` (0 = premier) de la liste COMPLÈTE : il prend la place visée, les autres se décalent en gardant leur ordre relatif ; tous reçoivent alors un rang (0, 1, 2…).
 * Une position hors limites est ramenée au bord ; une position identique ne change rien et n'écrit rien (ok, sans événement). Sert au glisser-déposer. / EN: ⚠️ ADDED - moves a loadout to `indexCible` of the FULL list; all get a rank.
 */
export function placerLoadout(id: string, indexCible: number): { ok: boolean; erreur?: string } {
  if (!Number.isFinite(indexCible)) return { ok: false, erreur: "Position invalide." };
  const liste = listerLoadouts();
  const depart = liste.findIndex((l) => l.id === id);
  if (depart < 0) return { ok: false, erreur: "Loadout introuvable : il a peut-être été supprimé entre-temps." };
  const cible = Math.max(0, Math.min(liste.length - 1, Math.trunc(indexCible)));
  if (cible === depart) return { ok: true };
  const [deplace] = liste.splice(depart, 1);
  liste.splice(cible, 0, deplace);
  return ecrire(liste.map((l, i) => ({ ...l, ordre: i })));
}

/** FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - recule (-1, vers le début) ou avance (+1, vers la fin) un loadout d'une place ; aux extrémités, ne fait rien (ok). Sert aux boutons ◀ ▶. / EN: ⚠️ ADDED - moves a loadout one place; no-op at the ends. */
export function deplacerLoadout(id: string, sens: -1 | 1): { ok: boolean; erreur?: string } {
  const index = listerLoadouts().findIndex((l) => l.id === id);
  if (index < 0) return { ok: false, erreur: "Loadout introuvable : il a peut-être été supprimé entre-temps." };
  return placerLoadout(id, index + sens);
}

/** FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - coche ou décoche le MÉMO « stocké en jeu » (jamais vérifié ni enregistré dans le jeu) ; décocher SUPPRIME le champ. / EN: ⚠️ ADDED - sets or clears the manual "stored in game" memo; clearing removes the field. */
export function definirStockeEnJeu(id: string, valeur: boolean): { ok: boolean; erreur?: string } {
  const liste = listerLoadouts();
  if (!liste.some((l) => l.id === id)) return { ok: false, erreur: "Loadout introuvable : il a peut-être été supprimé entre-temps." };
  return ecrire(
    liste.map((l) => {
      if (l.id !== id) return l;
      const { stockeEnJeu, ...reste } = l;
      void stockeEnJeu;
      return valeur ? { ...reste, stockeEnJeu: true } : reste;
    })
  );
}

export function supprimerLoadout(id: string): { ok: boolean; erreur?: string } {
  return ecrire(listerLoadouts().filter((l) => l.id !== id));
}

/**
 * FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - modifie le NOM, la DESCRIPTION et l'ICÔNE d'un
 * loadout en UNE SEULE écriture (fenêtre « Modifier... » des Loadouts, qui regroupe les
 * anciens boutons « Renommer », « Décrire » et « Icône »). Une écriture unique : pas
 * d'état à moitié modifié si la seconde échoue. Mêmes règles que les trois fonctions
 * séparées : nom sans espaces autour, un nom vide est REFUSÉ (le nom actuel est gardé),
 * description sans espaces autour, icône vide = aucune.
 * EN: ⚠️ ADDED - edits a loadout's NAME, DESCRIPTION and ICON in ONE write (the "Edit..."
 * window replacing the three old buttons). Same rules as the three separate functions.
 */
export function modifierInfosLoadout(
  id: string,
  infos: { nom: string; description: string; icone: string }
): { ok: boolean; erreur?: string } {
  const nom = infos.nom.trim();
  if (!nom) return { ok: false, erreur: "Le nom ne peut pas être vide." };
  const existe = listerLoadouts().some((l) => l.id === id);
  if (!existe) return { ok: false, erreur: "Loadout introuvable : il a peut-être été supprimé entre-temps." };
  return ecrire(
    listerLoadouts().map((l) =>
      l.id === id ? { ...l, nom, description: infos.description.trim(), iconeChoisie: infos.icone || undefined } : l
    )
  );
}

/**
 * FR : liste les pièces d'un loadout qui ne sont PLUS présentes sur le
 * compte (démantelées, ou sur un autre compte). On compare par
 * itemInstanceId : c'est l'identifiant de l'EXEMPLAIRE précis, alors que
 * itemHash ne désigne que le modèle - deux copies d'une même arme ont le
 * même itemHash mais des instances différentes.
 * Les pièces sans instance (emplacements vides du build) sont ignorées :
 * elles ne représentent aucun objet réel à retrouver.
 * EN: lists a loadout's pieces no longer present on the account. Compared
 * by itemInstanceId (the specific COPY) rather than itemHash (the model).
 * Pieces without an instance (empty build slots) are ignored.
 */
export function trouverPiecesManquantes(
  loadout: Loadout,
  instancesPossedees: Set<string>
): { nom: string; slot: string }[] {
  const pieces = [...(loadout.build.armes ?? []), ...(loadout.build.armure ?? [])];
  return pieces
    .filter((p) => p.itemInstanceId && !instancesPossedees.has(p.itemInstanceId))
    .map((p) => ({ nom: p.nom ?? "(sans nom)", slot: p.slot }));
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - réparation automatique, suite à l'enquête
 * sur "Signal perdu" (échec d'équipement systématique, confirmé par
 * l'utilisateur : l'itemInstanceId sauvegardé référençait un exemplaire
 * démantelé depuis, remplacé par un nouveau). L'utilisateur a fait
 * remarquer, à raison, que « resauvegardez le loadout à la main » n'est
 * pas une vraie solution : la même chose peut arriver à N'IMPORTE QUEL
 * objet, silencieusement, à chaque fois qu'il est démantelé puis remplacé.
 *
 * Pour chaque pièce MANQUANTE (voir `trouverPiecesManquantes`), cherche un
 * exemplaire ACTUEL du même OBJET (même `itemHash` - le modèle ne change
 * pas, seul l'exemplaire précis devient invalide) dans l'inventaire réel
 * fourni, et remplace l'ancien `itemInstanceId`/`origine` par les bons.
 *
 * ⚠️ Choix si plusieurs exemplaires actuels correspondent : le premier
 * trouvé. Pas de règle plus fine (ex: préférer un exemplaire déjà équipé)
 * - un cas rare, et la réparation reste de toute façon réversible (rien
 * n'empêche l'utilisateur de choisir un autre exemplaire ensuite).
 *
 * ⚠️ Si AUCUN exemplaire actuel n'existe (l'objet a été démantelé sans
 * remplacement, ou son TYPE a changé), la pièce reste inchangée - pas de
 * réparation possible, l'utilisateur devra choisir un autre objet
 * manuellement pour cet emplacement.
 *
 * EN: ⚠️ ADDED - automatic repair, following the "Signal perdu"
 * investigation. The user rightly pointed out that "just re-save the
 * loadout manually" isn't a real fix: the same thing can happen to ANY
 * item, silently, whenever it's dismantled and replaced. For each MISSING
 * piece, looks for a CURRENT copy of the same ITEM (same `itemHash`) in
 * the provided real inventory, and swaps in the correct
 * `itemInstanceId`/`origine`. If no current copy exists, the piece is left
 * unchanged - the user must manually pick a different item for that slot.
 */
export function reparerPiecesManquantes(
  loadout: Loadout,
  objetsPossedes: GearPiece[]
): { loadoutRepare: Loadout; reparees: string[]; irreparables: string[] } {
  const parHash = new Map<number, GearPiece>();
  for (const o of objetsPossedes) {
    if (o.itemInstanceId && !parHash.has(o.itemHash)) parHash.set(o.itemHash, o);
  }

  const reparees: string[] = [];
  const irreparables: string[] = [];

  function reparerListe(pieces: GearPiece[] | undefined): GearPiece[] | undefined {
    if (!pieces) return pieces;
    return pieces.map((p) => {
      if (!p.itemInstanceId) return p; // emplacement vide, rien à réparer
      const remplacant = parHash.get(p.itemHash);
      const estDejaValide = objetsPossedes.some((o) => o.itemInstanceId === p.itemInstanceId);
      if (estDejaValide) return p; // toujours présent, rien à faire
      if (!remplacant) {
        irreparables.push(p.nom ?? "(sans nom)");
        return p;
      }
      reparees.push(p.nom ?? "(sans nom)");
      return { ...p, itemInstanceId: remplacant.itemInstanceId, origine: remplacant.origine };
    });
  }

  const loadoutRepare: Loadout = {
    ...loadout,
    build: {
      ...loadout.build,
      armes: reparerListe(loadout.build.armes) ?? loadout.build.armes,
      armure: reparerListe(loadout.build.armure) ?? loadout.build.armure,
    },
  };

  return { loadoutRepare, reparees, irreparables };
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - combine `reparerPiecesManquantes` et la
 * sauvegarde en un seul appel, pour un usage direct depuis l'interface
 * (un clic sur "Réparer automatiquement").
 * EN: ⚠️ ADDED - combines repair and saving in a single call, for direct
 * use from the UI.
 */
export function repererEtSauvegarder(
  loadoutId: string,
  objetsPossedes: GearPiece[]
): { ok: boolean; erreur?: string; reparees: string[]; irreparables: string[] } {
  const tous = listerLoadouts();
  const loadout = tous.find((l) => l.id === loadoutId);
  if (!loadout) return { ok: false, erreur: "Loadout introuvable.", reparees: [], irreparables: [] };

  const { loadoutRepare, reparees, irreparables } = reparerPiecesManquantes(loadout, objetsPossedes);
  if (reparees.length === 0) return { ok: true, reparees, irreparables };

  const resultat = ecrire(tous.map((l) => (l.id === loadoutId ? loadoutRepare : l)));
  return { ...resultat, reparees, irreparables };
}

/** FR : export JSON, pour sauvegarder les loadouts hors du navigateur. / EN: JSON export, to back up loadouts outside the browser. */
export function exporterLoadouts(): string {
  // FR : ⚠️ CHANGÉ (14/10/2026, v0.4.9) - nettoie aussi les builds enregistrés AVANT cette version (qui contiennent la liste des perks non sélectionnés). / EN: also cleans builds saved before this version.
  return JSON.stringify(listerLoadouts().map((l) => ({ ...l, build: buildExportable(l.build) })), null, 2);
}

/**
 * FR : ⚠️ AJOUT (26/09/2026, v0.2.2) - export d'UN SEUL loadout, pour
 * l'échanger avec des amis (demande de l'utilisateur).
 *
 * Choix de format : le fichier contient un TABLEAU d'un seul élément,
 * exactement le même format que l'export complet. Conséquence voulue :
 * le bouton « Importer » existant l'accepte tel quel, sans aucun code
 * d'import supplémentaire, et un ami peut aussi importer un export complet.
 *
 * À savoir pour un échange entre comptes : les identifiants d'EXEMPLAIRE
 * (itemInstanceId) sont propres au compte d'origine. Chez l'ami, les pièces
 * apparaîtront donc « manquantes », et la réparation automatique existante
 * les remplacera par ses propres exemplaires du même objet s'il les
 * possède. La doctrine et l'artefact, eux, se chargent directement.
 *
 * EN: ⚠️ ADDED - export ONE loadout, to share with friends. Same format as
 * the full export (a one-element ARRAY), so the existing Import button
 * accepts it unchanged. Item instance ids belong to the original account:
 * on a friend's account pieces show as missing, and the existing automatic
 * repair swaps in their own copies of the same item when they own one.
 */
export function exporterUnLoadout(id: string): { contenu: string; nomFichier: string } | null {
  const loadout = listerLoadouts().find((l) => l.id === id);
  if (!loadout) return null;
  return serialiserUnLoadout(loadout);
}

/**
 * FR : ⚠️ EXTRAIT (28/09/2026, v0.2.8) - fichier d'échange d'UN loadout,
 * enregistré ou non (bloc « Partage du build »). Même format que toujours
 * (tableau d'un élément) : le bouton « Importer » l'accepte tel quel.
 * EN: ⚠️ EXTRACTED - exchange file for ONE loadout, saved or not; same format.
 */
export function serialiserUnLoadout(loadout: Loadout): { contenu: string; nomFichier: string } {
  // FR : ⚠️ CHANGÉ (07/10/2026, v0.3.12) - le rang et le mémo « stocké en jeu » sont des arrangements PERSONNELS : ils ne partent JAMAIS dans le fichier d'échange d'un seul build (le build d'un ami n'arrive pas « stocké dans mon jeu », ni à une place imposée).
  // « Exporter tout » (sauvegarde complète) les conserve, lui. / EN: ⚠️ CHANGED - rank and "stored in game" never leave in a single-build share file; "Export all" keeps them.
  const { ordre, stockeEnJeu, ...partage } = loadout;
  void ordre;
  void stockeEnJeu;
  // FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - le fichier d'échange ne contient que les perks SÉLECTIONNÉS (réels), même pour un build enregistré avant cette version. / EN: ⚠️ ADDED - the exchange file only holds the selected, real perks.
  partage.build = buildExportable(partage.build);
  return {
    contenu: JSON.stringify([partage], null, 2),
    nomFichier: `build-d2-${nomFichierPropre(loadout.nom)}.json`,
  };
}

// FR : ⚠️ CHANGÉ (23/10/2026, audit) - `nomFichierPropre` déplacée dans `lib/nomFichier.ts` (dedup avec `legendarium/exportImage.ts`), ré-exportée ici pour les appelants existants. Comportement identique : longueur max 50, repli « build ».
// EN: ⚠️ CHANGED - `nomFichierPropre` moved to `lib/nomFichier.ts` (dedup), re-exported here for existing callers. Same behavior: max length 50, fallback "build".
import { nomFichierPropre } from "../nomFichier";
export { nomFichierPropre };

/**
 * FR : import JSON. Les loadouts importés s'AJOUTENT aux existants
 * (nouveaux identifiants) plutôt que de les remplacer : un import
 * malheureux ne doit pas effacer un travail existant.
 * EN: JSON import. Imported loadouts are ADDED (with new ids) rather than
 * replacing existing ones: a mistaken import must not wipe existing work.
 */
export function importerLoadouts(json: string): { ok: boolean; nombre?: number; erreur?: string } {
  try {
    const donnees = JSON.parse(json);
    if (!Array.isArray(donnees)) return { ok: false, erreur: "Format inattendu : un tableau était attendu." };
    // FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - les rangs importés passent APRÈS ceux déjà présents, en gardant leur ordre relatif entre eux : la restauration d'une sauvegarde « Exporter tout » retrouve l'ordre et les cases « stocké en jeu »,
    // sans jamais se mêler à l'ordre existant. Un rang illisible est ignoré (le build arrive en tête, comme un build neuf) ; seule la valeur `true` du mémo est reprise. / EN: ⚠️ ADDED - imported ranks go AFTER existing ones, relative order kept.
    const baseOrdre = listerLoadouts().reduce((m, l) => (Number.isFinite(l.ordre) ? Math.max(m, (l.ordre as number) + 1) : m), 0);
    const valides = donnees
      .filter(estLoadoutValide)
      .map((l) => ({
        ...l,
        ordre: Number.isFinite(l.ordre) ? baseOrdre + Math.max(0, Math.trunc(l.ordre as number)) : undefined,
        stockeEnJeu: l.stockeEnJeu === true ? true : undefined,
        id: `loadout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        enregistreLe: l.enregistreLe ?? new Date().toISOString(),
        // FR : ⚠️ AJOUT (06/10/2026) - le pseudo d'auteur du fichier est CONSERVÉ (c'est celui de l'auteur du build, pas de celui qui importe), mais nettoyé : un champ absent, vide, de mauvais type ou démesuré est écarté.
        auteur: nettoyerAuteur(l.auteur),
      }));
    if (valides.length === 0) return { ok: false, erreur: "Aucun loadout valide trouvé dans ce fichier." };
    const resultat = ecrire([...valides, ...listerLoadouts()]);
    return resultat.ok ? { ok: true, nombre: valides.length } : { ok: false, erreur: resultat.erreur };
  } catch (e) {
    return { ok: false, erreur: `Fichier illisible : ${(e as Error).message}` };
  }
}
