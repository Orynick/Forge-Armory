// FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - fiche complète d'un build enregistré,
// demande de l'utilisateur : « visualiser en une fois tout ce que contient le
// build (Compétences, Doctrines, Aspects, Fragments, Armes, Armures) », plus
// une copie en texte simple pour la coller ailleurs (Discord...).
//
// Choix de conception : ce module assemble les DONNÉES de la fiche une seule
// fois ; l'affichage (FicheBuild.tsx) et la version texte (`ficheEnTexte`) lisent
// toutes deux ce même résultat. Deux assemblages séparés finiraient par
// diverger (une ligne présente à l'écran mais absente du texte copié).
//
// Aucune donnée nouvelle n'est enregistrée : tout vient du loadout sauvegardé,
// les noms étant résolus via le Manifest quand il est chargé.
//
// EN: ⚠️ ADDED - full sheet of a saved build, plus a plain-text copy. This
// module builds the sheet DATA once; both the display and the text version
// read the same result, so they can never diverge. Nothing new is stored.

import { Database } from "sql.js";
import { DamageElement, GearPiece, SlotArme, SlotArmure, StatKey } from "../../types/build";
import { Loadout, nettoyerAuteur } from "./stockage";
import { ARTEFACTS } from "../../data/artefacts";
import { infobulleDePerk } from "../artefacts/infobulle";
import { iconeDuPerk } from "../../data/iconesPerksArtefact";
import { obtenirSecoursTypeArme } from "../manifest/typeArmeSecours";
import { LIBELLES_ELEMENT_FR } from "../../data/libellesElements";
import { LIBELLES_CATEGORIE, LIBELLES_SLOT, LIBELLES_STAT, ORDRE_EMPLACEMENTS, ORDRE_STATS } from "../../data/libellesUI";
import { LIBELLES_CONTEXTE } from "../../components/icones/BadgeContexte";
import { sommerStatsArmure } from "../scoring/stats";
import { obtenirBonusSetsActifs } from "../scoring/armorSets";
import { obtenirDefinition } from "../manifest/download";
import { urlIcone } from "../manifest/search";
import type { TypeChampion } from "../../components/icones/IconeAntiChampion";
import type { TypeMunition } from "../../components/icones/IconeMunition";
import {
  obtenirArmatureArme,
  obtenirPlugsDetailles,
  obtenirAntiChampion,
  obtenirTypeMunition,
  obtenirCategoriesObjet,
  obtenirBonusStatsDoctrine,
  obtenirIconePerkDoctrine,
  obtenirNomPerkDoctrine,
  obtenirIconeElementDoctrine,
  iconeDoctrineATeinter,
} from "../manifest/doctrine";

export interface ElementFiche {
  nom: string;
  icone?: string;
  /**
   * FR : ⚠️ AJOUT (30/09/2026, v0.2.8) - nombre d'exemplaires quand un même
   * perk ou mod est présent plusieurs fois sur une pièce (affiché « ×2 »).
   * Absent ou 1 : un seul. EN: count when the same perk/mod appears twice.
   */
  nombre?: number;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - vrai si l'icône (saut ou compétence de classe du Filobscur) est en réalité celle de la Stase et doit être recolorée à l'affichage (voir data/teinteIconesDoctrine.ts). / EN: ⚠️ ADDED - icon must be recoloured on display. */
  teinteFilobscur?: boolean;
  /** FR : ⚠️ AJOUT (05/10/2026) - effet du perk (perks d'artefact seulement), texte d'infobulle déjà nettoyé : affiché au survol dans la fenêtre « Voir ». Absent ailleurs. / EN: ⚠️ ADDED - perk effect (artifact perks only), tooltip-ready text, shown on hover in the "View" window. */
  infobulle?: string;
}

export interface PieceFiche {
  /** FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - emplacement brut, pour l'export infographique. / EN: raw slot, for the infographic export. */
  slot: SlotArme | SlotArmure;
  emplacement: string;
  nom: string;
  icone?: string;
  exotique: boolean;
  /** FR : élément d'une arme (Solaire, Cinétique...) - absent pour l'armure. / EN: weapon element - absent for armor. */
  element?: string;
  /** FR : ⚠️ AJOUT (27/09/2026, v0.2.6) - icône officielle de l'élément (déjà stockée sur l'arme), pour l'export. / EN: official element icon, for the export. */
  elementIcone?: string;
  /** FR : ⚠️ AJOUT (v0.2.6) - type d'arme lisible (Fusil à pompe...), pour l'icône de type dans l'export. / EN: readable weapon type, for the export's type icon. */
  typeArme?: string;
  /** FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions d'une arme (`obtenirTypeMunition`), absent pour l'armure ou sans Manifest. / EN: weapon ammo type. */
  munition?: TypeMunition;
  /** FR : ⚠️ AJOUT (02/10/2026) - catégories d'objet du Manifest (repli de l'icône de type d'arme quand le texte du type est vide ou inattendu). Absent sans Manifest ou pour l'armure. / EN: ⚠️ ADDED - Manifest item categories (weapon-type icon fallback). */
  categories?: number[];
  /** FR : ⚠️ AJOUT (05/10/2026) - libellé de type de dernier recours (lib/manifest/typeArmeSecours.ts), pour l'icône de type d'arme quand ni le texte ni les catégories ne la donnent. / EN: ⚠️ ADDED - last-resort type label for the weapon-type icon. */
  typeSecours?: string;
  /**
   * FR : perks d'une arme, ou mods d'une armure.
   * ⚠️ CHANGÉ (30/09/2026, v0.2.8) - liste NETTOYÉE, commune à l'export, à
   * la fiche « 👁 Voir » et à la copie en texte (demande de l'utilisateur) :
   * sans armature ni particularité d'origine (affichées à part), sans
   * cosmétiques (ornements, revêtements, emplacement de mémento ou de
   * souvenance vide), « Arme façonnée », archétypes ni « Amélioration
   * d'armure » ; doublons regroupés (`nombre`). Plus de limite à 8.
   * Mon Build et l'Inventaire gardent leur propre tri, inchangé.
   * EN: ⚠️ CHANGED - CLEANED list shared by the export, the "View" sheet and
   * the text copy; duplicates grouped; no more cap at 8.
   */
  perks: ElementFiche[];
  origine?: ElementFiche;
  /**
   * FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - type de Champion contre lequel
   * l'ARME est efficace, via la détection existante `obtenirAntiChampion`
   * (Anti-Champion 2.0, avec cache). Absent pour l'armure, sans Manifest,
   * ou si rien n'est détecté : on n'affiche alors rien plutôt qu'une icône
   * erronée.
   * EN: ⚠️ ADDED - Champion type the WEAPON counters, via the existing
   * detection. Absent for armor, without Manifest, or if nothing detected.
   */
  antiChampion?: TypeChampion;
  /**
   * FR : ⚠️ AJOUT (29/09/2026, v0.2.8, commentaire revu le 30/09) - armature de l'arme (lue comme pour
   * l'anti-champion), affichée à part de la liste des perks.
   * EN: ⚠️ ADDED - the weapon's frame, shown apart from the perk list.
   */
  armature?: ElementFiche;
}

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - un set d'armure dont au moins un
 * palier est ACTIF, avec uniquement ses paliers actifs (triés par seuil).
 * Calculé par `obtenirBonusSetsActifs` (même logique que l'encart de Mon
 * Build) : aucun comptage de pièces n'est refait ici.
 * EN: ⚠️ ADDED - an armor set with at least one ACTIVE tier, active tiers
 * only. Computed by the existing function; no piece counting redone here.
 */
export interface BonusSetFiche {
  nomSet: string;
  nbPieces: number;
  paliers: { seuil: number; nom: string; description: string }[];
}

export interface FicheBuild {
  nom: string;
  description?: string;
  classe?: string;
  element?: string;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - CLÉS de la classe et de l'élément (les deux champs ci-dessus sont des libellés), pour choisir leur ICÔNE dans l'export infographique ; absentes sur une fiche ancienne : l'export affiche alors le texte seul, comme avant. / EN: ⚠️ ADDED - class and element KEYS, to pick their icons in the export. */
  classeCle?: "titan" | "chasseur" | "arcaniste";
  elementCle?: Exclude<DamageElement, null>;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - adresse de l'icône OFFICIELLE de l'élément (Manifest, www.bungie.net), absente sans Manifest ou en Prismatique : l'export utilise alors un dessin. / EN: official element icon URL, when known. */
  elementIcone?: string;
  contexte: string;
  /** FR : ⚠️ AJOUT (v0.2.5) - clé du contexte, pour savoir s'il est « neutre » (masqué dans l'en-tête de l'export). / EN: context key. */
  contexteCle: "neutre" | "roaming" | "dps" | "pvp";
  enregistreLe: string;
  /** FR : ⚠️ AJOUT (06/10/2026, v0.3.3) - pseudo de l'auteur du build (`pseudo#1234`), s'il est connu. / EN: ⚠️ ADDED - the build author's handle, if known. */
  auteur?: string;
  /** FR : false si le Manifest n'est pas chargé - la doctrine ne peut alors pas être traduite en noms. / EN: false if the Manifest isn't loaded. */
  manifestDisponible: boolean;
  doctrine: { libelle: string; valeur?: ElementFiche }[];
  aspects: ElementFiche[];
  fragments: ElementFiche[];
  armes: PieceFiche[];
  armure: PieceFiche[];
  stats: { libelle: string; valeur: number }[];
  /** FR : ⚠️ AJOUT (v0.2.5) - bonus de set actifs, vide sans Manifest ou si aucun palier n'est atteint. / EN: active set bonuses. */
  bonusSets: BonusSetFiche[];
  /** FR : ⚠️ CHANGÉ (v0.2.5) - perks avec icône quand elle est connue, et icône de l'artefact. / EN: perks now carry an icon when known. */
  artefact?: { nom: string; icone?: string; perks: ElementFiche[] };
}

const LIBELLES_CLASSE: Record<"titan" | "chasseur" | "arcaniste", string> = {
  titan: "Titan",
  chasseur: "Chasseur",
  arcaniste: "Arcaniste",
};

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.4) - pièces triées dans l'ordre de Mon
 * Build (cinétique → énergie → lourde ; casque → gants → torse → jambes →
 * marque), quel que soit l'ordre dans lequel elles ont été ajoutées. Un
 * emplacement inconnu passe en fin de liste plutôt que de disparaître.
 * EN: ⚠️ ADDED - pieces sorted in Mon Build's order; unknown slots go last.
 */
function trierParEmplacement(pieces: GearPiece[]): GearPiece[] {
  const rang = (p: GearPiece) => {
    const i = ORDRE_EMPLACEMENTS.indexOf(p.slot);
    return i === -1 ? ORDRE_EMPLACEMENTS.length : i;
  };
  return [...pieces].sort((a, b) => rang(a) - rang(b));
}

const LIBELLES_MUNITION_TEXTE: Record<TypeMunition, string> = {
  principale: "munitions principales",
  speciale: "munitions spéciales",
  lourde: "munitions lourdes",
};

function formaterDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("fr-FR");
}

/**
 * FR : une pièce d'équipement vers sa ligne de fiche. Le nom enregistré sert
 * de repli quand le Manifest n'est pas chargé : les armes et armures restent
 * donc lisibles même sans lui (seuls leurs perks disparaissent).
 * EN: a gear piece to its sheet row. The saved name is the fallback when the
 * Manifest isn't loaded.
 */
function pieceVersFiche(piece: GearPiece, db: Database | null): PieceFiche {
  const estArme = piece.slot === "cinetique" || piece.slot === "energie" || piece.slot === "lourde";
  const details = db ? preparerPlugs(db, piece, estArme) : { perks: [], origine: undefined, armature: undefined };
  return {
    slot: piece.slot,
    emplacement: LIBELLES_SLOT[piece.slot] ?? piece.slot,
    // FR : ⚠️ CHANGÉ (27/09/2026, v0.2.5) - l'ancien repli « Objet <hash> »
    // exposait un identifiant technique ; remplacé par un texte neutre.
    // EN: ⚠️ CHANGED - the old "Objet <hash>" fallback exposed a hash.
    nom: piece.nom?.trim() || "Nom indisponible",
    icone: piece.icone,
    exotique: piece.isExotic,
    element: piece.elementArme,
    elementIcone: piece.elementArmeIcone,
    typeArme: piece.typeArme,
    munition: db && estArme ? obtenirTypeMunition(db, piece.itemHash) : undefined,
    categories: db && estArme ? obtenirCategoriesObjet(db, piece.itemHash) : undefined,
    typeSecours: db && estArme ? obtenirSecoursTypeArme(db, piece.itemHash).typeSecours : undefined,
    perks: details.perks,
    origine: details.origine,
    armature: details.armature,
    antiChampion: db && estArme
      ? obtenirAntiChampion(db, piece.itemHash)
      : undefined,
  };
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.8) - plugs d'une pièce, triés une fois
 * pour toutes (export, fiche « 👁 Voir » et copie en texte) :
 *   - armature : lue comme pour l'anti-champion, retirée de la liste par son
 *     hash (et par son nom, par sécurité) ;
 *   - particularité d'origine : la première trouvée, à part ;
 *   - perks : les plugs de nature « perk » seulement (voir `NaturePlug`,
 *     doctrine.ts), doublons regroupés.
 * EN: ⚠️ ADDED - a piece's plugs, sorted once for the export, the "View"
 * sheet and the text copy.
 */
function preparerPlugs(
  db: Database,
  piece: GearPiece,
  estArme: boolean
): { perks: ElementFiche[]; origine?: ElementFiche; armature?: ElementFiche } {
  const armature = estArme ? obtenirArmatureArme(db, piece.itemHash) : undefined;
  const plugs = obtenirPlugsDetailles(db, piece.perkHashes ?? []);
  const origine = plugs.find((p) => p.nature === "origine");
  const perks = regrouperDoublons(
    plugs
      .filter((p) => p.nature === "perk")
      .filter((p) => !armature || (p.hash !== armature.hash && p.nom !== armature.nom))
      .map((p) => ({ nom: p.nom, icone: p.icone }))
  );
  return {
    perks,
    origine: origine ? { nom: origine.nom, icone: origine.icone } : undefined,
    armature: armature ? { nom: armature.nom, icone: armature.icone } : undefined,
  };
}

/**
 * FR : ⚠️ AJOUT (29/09/2026, v0.2.8, déplacé depuis exportFiche.ts le 30/09) - un
 * perk ou mod présent plusieurs fois sur la même pièce est gardé UNE fois,
 * avec son nombre (affiché « ×2 », « ×3 »...). L'information reste complète
 * (le nombre d'exemplaires compte pour un build) et la ligne se raccourcit.
 * Ordre de première apparition conservé.
 * EN: ⚠️ ADDED (moved from exportFiche.ts) - a repeated perk/mod is kept
 * ONCE with its count; first-appearance order kept.
 */
export function regrouperDoublons(elements: ElementFiche[]): ElementFiche[] {
  const resultat: ElementFiche[] = [];
  for (const e of elements) {
    const existant = resultat.find((r) => r.nom === e.nom);
    if (existant) existant.nombre = (existant.nombre ?? 1) + 1;
    else resultat.push({ ...e });
  }
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - regroupe par set les paliers actifs
 * renvoyés à plat par `obtenirBonusSetsActifs`, dans l'ordre où ils
 * arrivent, paliers triés par seuil croissant.
 * EN: ⚠️ ADDED - groups the flat active tiers by set, tiers sorted by threshold.
 */
function regrouperBonusSets(actifs: ReturnType<typeof obtenirBonusSetsActifs>): BonusSetFiche[] {
  const parSet = new Map<string, BonusSetFiche>();
  for (const a of actifs) {
    const entree = parSet.get(a.nomSet) ?? { nomSet: a.nomSet, nbPieces: a.nbPieces, paliers: [] };
    entree.paliers.push({ seuil: a.requiredSetCount, nom: a.nom, description: a.description });
    parSet.set(a.nomSet, entree);
  }
  const resultat = [...parSet.values()];
  for (const s of resultat) s.paliers.sort((x, y) => x.seuil - y.seuil);
  return resultat;
}

/**
 * FR : assemble la fiche. `loadout.build` doit déjà avoir ses stats
 * rafraîchies (voir `rafraichirStats` dans PanneauLoadouts), pour afficher
 * les MÊMES chiffres que Mon Build après chargement du build.
 * EN: builds the sheet. Stats should already be refreshed by the caller.
 */
export function construireFiche(loadout: Loadout, db: Database | null): FicheBuild {
  const b = loadout.build;
  const sc = b.subclass;

  const doctrineElement = (hash: number): ElementFiche | undefined => {
    if (!hash || !db) return undefined;
    const nom = obtenirNomPerkDoctrine(db, hash);
    return nom ? { nom, icone: obtenirIconePerkDoctrine(db, hash) } : undefined;
  };

  // FR : même calcul que le total de Mon Build (armure + bonus de doctrine),
  // en réutilisant les mêmes fonctions.
  // EN: same computation as Mon Build's total, same functions.
  const totaux = sommerStatsArmure(b.armure ?? []) as Record<StatKey, number>;
  if (db) {
    for (const [cle, valeur] of Object.entries(obtenirBonusStatsDoctrine(db, sc)) as [StatKey, number][]) {
      totaux[cle] = (totaux[cle] ?? 0) + valeur;
    }
  }

  // FR : perks d'artefact - clé au format « idArtefact:tier:nom » (voir
  // clePerk dans SelecteurArtefact), décodée comme dans verbes.ts.
  // EN: artifact perks - key format "artifactId:tier:name".
  const artefact = ARTEFACTS.find((a) => a.id === b.artifact?.artifactId);
  // FR : ⚠️ CHANGÉ (v0.2.5) - chaque perk garde son nom (décodage inchangé)
  // et récupère son icône quand elle est connue (`perk.icone`, capturée à
  // l'extraction de l'artefact actif, comme dans le sélecteur).
  // EN: ⚠️ CHANGED - each perk keeps its name and gets its icon when known.
  const perksArtefact: ElementFiche[] = (b.artifact?.perkCles ?? [])
    .map((cle) => {
      const [, tierTexte, ...reste] = cle.split(":");
      const nom = reste.join(":");
      if (!nom) return undefined;
      const tier = Number(tierTexte) as 1 | 2 | 3;
      const perk = artefact?.perksParTier[tier]?.find((p) => p.nom === nom);
      // FR : ⚠️ CHANGÉ (05/10/2026) - l'icône vient de `iconeDuPerk` (125 des 147 perks, figées depuis le Manifest ; data/iconesPerksArtefact.ts).
      // EN: ⚠️ CHANGED - the icon comes from `iconeDuPerk` (125 of 147 perks baked in).
      const cheminIcone = perk && artefact ? iconeDuPerk(artefact.id, perk) : undefined;
      return { nom, icone: urlIcone(cheminIcone), infobulle: infobulleDePerk(nom, perk?.description) };
    })
    .filter((x): x is { nom: string; icone: string | undefined; infobulle: string } => Boolean(x));
  // FR : miniature de l'artefact, résolue comme dans SelecteurArtefact.
  // EN: artifact thumbnail, resolved as in SelecteurArtefact.
  const iconeArtefact =
    artefact && db
      ? urlIcone(obtenirDefinition<{ displayProperties?: { icon?: string } }>(db, "DestinyInventoryItemDefinition", artefact.itemHash)?.displayProperties?.icon)
      : undefined;

  const element = (loadout.elementFige ?? sc.element) as DamageElement | null | undefined;
  const classe = loadout.classeFigee ?? sc.classe;
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - marque les icônes de saut et de compétence de classe du Filobscur qui sont en réalité celles de la Stase (recolorées à l'affichage et dans l'export). / EN: ⚠️ ADDED - flags Strand icons that are really Stasis ones.
  const avecTeinte = (valeur: ElementFiche | undefined, categorie: "saut" | "classe"): ElementFiche | undefined =>
    valeur && db && iconeDoctrineATeinter(db, element, categorie, valeur.icone) ? { ...valeur, teinteFilobscur: true } : valeur;

  return {
    nom: loadout.nom,
    description: loadout.description,
    classe: classe ? LIBELLES_CLASSE[classe] : undefined,
    element: element ? LIBELLES_ELEMENT_FR[element] ?? element : undefined,
    classeCle: classe ?? undefined,
    elementCle: element ?? undefined,
    elementIcone: element && db ? obtenirIconeElementDoctrine(db, element) : undefined,
    contexte: LIBELLES_CONTEXTE[b.contexte ?? "neutre"],
    contexteCle: b.contexte ?? "neutre",
    enregistreLe: formaterDate(loadout.enregistreLe),
    auteur: nettoyerAuteur(loadout.auteur),
    manifestDisponible: Boolean(db),
    doctrine: [
      { libelle: LIBELLES_CATEGORIE.super, valeur: doctrineElement(sc.superHash) },
      { libelle: LIBELLES_CATEGORIE.melee, valeur: doctrineElement(sc.meleeHash) },
      { libelle: LIBELLES_CATEGORIE.grenade, valeur: doctrineElement(sc.grenadeHash) },
      { libelle: LIBELLES_CATEGORIE.classe, valeur: avecTeinte(doctrineElement(sc.classeHash), "classe") },
      { libelle: LIBELLES_CATEGORIE.saut, valeur: avecTeinte(doctrineElement(sc.sautHash), "saut") },
    ],
    aspects: (sc.aspectHashes ?? []).map(doctrineElement).filter((x): x is ElementFiche => Boolean(x)),
    fragments: (sc.fragmentHashes ?? []).map(doctrineElement).filter((x): x is ElementFiche => Boolean(x)),
    armes: trierParEmplacement(b.armes ?? []).map((p) => pieceVersFiche(p, db)),
    armure: trierParEmplacement(b.armure ?? []).map((p) => pieceVersFiche(p, db)),
    stats: ORDRE_STATS.map((cle) => ({ libelle: LIBELLES_STAT[cle], valeur: totaux[cle] ?? 0 })),
    bonusSets: db ? regrouperBonusSets(obtenirBonusSetsActifs(b.armure ?? [], db)) : [],
    artefact: artefact ? { nom: artefact.nom, icone: iconeArtefact, perks: perksArtefact } : undefined,
  };
}

/**
 * FR : version texte simple de la fiche, à coller n'importe où (Discord,
 * messagerie...). Volontairement sans mise en forme Markdown lourde : un ami
 * sans l'appli doit pouvoir la lire telle quelle.
 * EN: plain-text version of the sheet, readable as-is by a friend without
 * the app.
 */
export function ficheEnTexte(f: FicheBuild): string {
  const lignes: string[] = [];
  const entete = [f.classe, f.element].filter(Boolean).join(" ");
  lignes.push(`${f.nom}${entete ? ` (${entete})` : ""}`);
  lignes.push(`Contexte : ${f.contexte}`);
  // FR : ⚠️ AJOUT (06/10/2026) - ligne « Auteur » seulement s'il est connu : la copie d'un build sans auteur reste strictement identique à avant. / EN: ⚠️ ADDED - "Auteur" line only when known.
  if (f.auteur) lignes.push(`Auteur : ${f.auteur}`);
  if (f.description) lignes.push(f.description);

  lignes.push("", "DOCTRINE");
  if (!f.manifestDisponible) {
    lignes.push("(Manifest non chargé : noms de la doctrine indisponibles)");
  } else {
    for (const d of f.doctrine) if (d.valeur) lignes.push(`- ${d.libelle} : ${d.valeur.nom}`);
    if (f.aspects.length > 0) lignes.push(`- Aspects : ${f.aspects.map((a) => a.nom).join(", ")}`);
    if (f.fragments.length > 0) lignes.push(`- Fragments : ${f.fragments.map((a) => a.nom).join(", ")}`);
  }

  const blocPieces = (titre: string, pieces: PieceFiche[], motPerks: string) => {
    if (pieces.length === 0) return;
    lignes.push("", titre);
    for (const p of pieces) {
      // FR : ⚠️ CHANGÉ (30/09/2026, v0.2.9) - type de munitions ajouté, pour
      // un ami qui lit le texte sans l'appli. / EN: ammo type added.
      const details = [p.element, p.munition ? LIBELLES_MUNITION_TEXTE[p.munition] : undefined, p.exotique ? "exotique" : undefined]
        .filter(Boolean)
        .join(", ");
      lignes.push(`- ${p.emplacement} : ${p.nom}${details ? ` (${details})` : ""}`);
      // FR : ⚠️ CHANGÉ (30/09/2026, v0.2.8) - même présentation que l'export
      // (demande de l'utilisateur) : armature puis particularité d'origine
      // sur leurs propres lignes, puis la liste nettoyée, doublons en « ×2 ».
      // EN: ⚠️ CHANGED - same layout as the export: frame, origin, then the
      // cleaned list with "×2" for duplicates.
      if (p.armature) lignes.push(`    Armature : ${p.armature.nom}`);
      if (p.origine) lignes.push(`    Origine : ${p.origine.nom}`);
      const noms = p.perks.filter((x) => x.nom).map((x) => ((x.nombre ?? 1) > 1 ? `${x.nom} ×${x.nombre}` : x.nom));
      if (noms.length > 0) lignes.push(`    ${motPerks} : ${noms.join(", ")}`);
    }
  };
  blocPieces("ARMES", f.armes, "Perks");
  blocPieces("ARMURE", f.armure, "Mods");

  if (f.armure.length > 0) {
    lignes.push("", `STATS : ${f.stats.map((s) => `${s.libelle} ${s.valeur}`).join(" · ")}`);
  }

  if (f.artefact) {
    lignes.push("", `ARTEFACT : ${f.artefact.nom}`);
    if (f.artefact.perks.length > 0) lignes.push(`- ${f.artefact.perks.map((p) => p.nom).join(", ")}`);
  }

  lignes.push("", "Fiche générée par Forge Armory (Destiny 2 Build Analyzer)");
  return lignes.join("\n");
}
