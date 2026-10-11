// FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - RECHERCHE ET FILTRES des loadouts : phase 2 de l'onglet « Load-outs » (demande du 05/10/2026, lancée le 07/10/2026). Fonctions PURES, sans interface, pour pouvoir les tester
// à part. Rien n'est ajouté aux données enregistrées : la classe (`classeFigee`), l'élément (`elementFige`) et le contexte (`build.contexte`) le sont déjà pour chaque build.
//
// RECHERCHE PAR MOTS-CLÉS : le texte saisi est coupé en mots ; un loadout est retenu si CHAQUE mot figure quelque part dans son texte indexé (ET entre les mots, dans n'importe quel ordre). Insensible à la casse, aux
// accents et aux variantes typographiques (apostrophes, espaces insécables, œ/æ : la même `normaliserRecherche` que la Recherche du Manifest). Le texte indexé réunit, champs séparés par « | » (un mot ne peut donc pas
// chevaucher deux champs) : le nom du loadout (celui de la carte), sa description, son AUTEUR, sa classe, son élément (libellé français ET identifiant interne), son contexte, les noms des ARMES et des ARMURES, le nom de
// l'ARTEFACT et de ses PERKS choisis, et les noms de la DOCTRINE (super, aspects, fragments, mêlée, grenade, classe, saut, sous-classe). ⚠️ Les noms de la Doctrine ne sont enregistrés que sous forme de NUMÉROS : ils
// ne sont retrouvés que si le Manifest est chargé (`resoudreNom`) ; sans lui, la recherche ne les couvre pas, et l'interface le dit.
// ⚠️ Le nom INTERNE du build (`build.nom`) n'est volontairement PAS indexé : il n'apparaît nulle part sur la carte, et un loadout retenu pour un texte invisible ressemblerait à un bug (découvert par le test : tous les
// loadouts sortaient pour « arcaniste », car le build de démonstration porte ce mot dans son nom interne). On ne cherche que ce que l'utilisateur voit ou peut ouvrir.
// FILTRES : classe, élément, contexte ; « » = tous ; ils se combinent entre eux ET avec le texte (ET).
// EN: ⚠️ ADDED - loadout SEARCH AND FILTERS (phase 2): pure functions. Keyword search is an AND over words, accent/case/typography-insensitive, over name, description, author, class, element, context, gear names,
// artifact and its perks, and doctrine names (only when the Manifest is loaded: doctrine is stored as hashes). Filters: class, element, context; all combine with AND.

import type { Loadout } from "./stockage";
import { normaliserRecherche } from "../manifest/search";
import { ARTEFACTS } from "../../data/artefacts";
import { LIBELLES_ELEMENT_FR } from "../../data/libellesElements";
import { LIBELLES_CONTEXTE, ORDRE_CONTEXTES } from "../../components/icones/BadgeContexte";
import type { DamageElement } from "../../types/build";

export interface CriteresLoadouts {
  texte: string;
  classe: string;
  element: string;
  contexte: string;
}

export const CRITERES_VIDES: CriteresLoadouts = { texte: "", classe: "", element: "", contexte: "" };

/** FR : ordre des classes dans le jeu : Titan, Chasseur, Arcaniste. / EN: in-game order. */
export const CLASSES_LOADOUTS: { valeur: string; libelle: string }[] = [
  { valeur: "titan", libelle: "Titan" },
  { valeur: "chasseur", libelle: "Chasseur" },
  { valeur: "arcaniste", libelle: "Arcaniste" },
];

const ORDRE_ELEMENTS: Exclude<DamageElement, null>[] = ["solaire", "arc", "abyssal", "stase", "filobscur", "prismatique"];

export function criteresActifs(c: CriteresLoadouts): boolean {
  return Boolean(c.texte.trim() || c.classe || c.element || c.contexte);
}

/** FR : classe, élément et contexte EFFECTIFS d'un loadout (la valeur figée à l'enregistrement, sinon celle du build). / EN: effective class, element and context of a loadout. */
export const classeDe = (l: Loadout): string => (l.classeFigee ?? l.build.subclass.classe ?? "") as string;
export const elementDe = (l: Loadout): string => (l.elementFige ?? l.build.subclass.element ?? "") as string;
export const contexteDe = (l: Loadout): string => l.build.contexte ?? "neutre";

/** FR : coupe un texte en mots normalisés (sans accents, en minuscules). / EN: splits a text into normalised words. */
export function decouperMots(texte: string): string[] {
  return normaliserRecherche(texte).split(/\s+/).filter(Boolean);
}

/** FR : noms de la Doctrine d'un loadout, si on sait résoudre un numéro en nom (Manifest chargé) ; sinon liste vide. Sans doublon. / EN: doctrine names, if a resolver is available. */
export function nomsDoctrineDe(l: Loadout, resoudreNom?: (hash: number) => string | undefined): string[] {
  if (!resoudreNom) return [];
  const s = l.build.subclass;
  const hashes = [s.subclassItemHash, s.superHash, ...(s.aspectHashes ?? []), ...(s.fragmentHashes ?? []), s.meleeHash, s.grenadeHash, s.classeHash, s.sautHash];
  const noms = new Set<string>();
  for (const h of hashes) {
    if (!h) continue;
    const n = resoudreNom(h);
    if (n) noms.add(n);
  }
  return [...noms];
}

/** FR : nom de l'artefact et noms de ses perks choisis (la clé d'un perk est « artefact|palier|nom »). / EN: artifact name and its chosen perks' names. */
export function nomsArtefactDe(l: Loadout): string[] {
  const a = l.build.artifact;
  const noms: string[] = [];
  const art = a?.artifactId ? ARTEFACTS.find((x) => x.id === a.artifactId) : undefined;
  if (art) noms.push(art.nom, art.nomEn);
  for (const cle of a?.perkCles ?? []) {
    const nom = cle.split("|").slice(2).join("|");
    if (nom) noms.push(nom);
  }
  return noms;
}

function texteBrutDe(l: Loadout, resoudreNom?: (hash: number) => string | undefined): string {
  const classe = classeDe(l), element = elementDe(l), contexte = contexteDe(l);
  const champs = [
    l.nom,
    l.description,
    l.auteur,
    CLASSES_LOADOUTS.find((c) => c.valeur === classe)?.libelle ?? classe,
    element ? `${LIBELLES_ELEMENT_FR[element as Exclude<DamageElement, null>] ?? element} ${element}` : "",
    (LIBELLES_CONTEXTE as Record<string, string>)[contexte] ?? contexte,
    ...(l.build.armes ?? []).map((p) => p.nom),
    ...(l.build.armure ?? []).map((p) => p.nom),
    ...nomsArtefactDe(l),
    ...nomsDoctrineDe(l, resoudreNom),
  ];
  return champs.filter((x): x is string => Boolean(x && x.trim())).join(" | ");
}

/** FR : texte indexé de chaque loadout (normalisé), par identifiant. À recalculer quand la liste ou le Manifest change, PAS à chaque frappe. / EN: normalised indexed text per loadout id. */
export function construireIndexRecherche(loadouts: Loadout[], resoudreNom?: (hash: number) => string | undefined): Map<string, string> {
  const cache = new Map<number, string | undefined>();
  const resolveur = resoudreNom ? (h: number) => (cache.has(h) ? cache.get(h) : (cache.set(h, resoudreNom(h)), cache.get(h))) : undefined;
  return new Map(loadouts.map((l) => [l.id, normaliserRecherche(texteBrutDe(l, resolveur))]));
}

/** FR : loadouts retenus par les critères (texte ET classe ET élément ET contexte), dans l'ordre d'origine. / EN: loadouts matching all criteria, original order kept. */
export function filtrerLoadouts(loadouts: Loadout[], c: CriteresLoadouts, index: Map<string, string>): Loadout[] {
  if (!criteresActifs(c)) return loadouts;
  const mots = decouperMots(c.texte);
  return loadouts.filter((l) => {
    if (c.classe && classeDe(l) !== c.classe) return false;
    if (c.element && elementDe(l) !== c.element) return false;
    if (c.contexte && contexteDe(l) !== c.contexte) return false;
    if (mots.length === 0) return true;
    const texte = index.get(l.id) ?? "";
    return mots.every((m) => texte.includes(m));
  });
}

export interface ValeurFiltre {
  valeur: string;
  libelle: string;
  nombre: number;
}

/**
 * FR : valeurs proposées par les trois filtres, avec le nombre de loadouts de chacune, dans un ordre fixe (classes du jeu, éléments, contextes de l'appli). Seules les valeurs PRÉSENTES sont proposées ; une valeur
 * déjà choisie est conservée même à zéro, pour que la liste déroulante ne « perde » pas la sélection (un build supprimé ne doit pas faire disparaître le filtre actif).
 * EN: values offered by the three filters with counts, fixed order; the currently selected value is kept even at zero.
 */
export function valeursDisponibles(loadouts: Loadout[], c: CriteresLoadouts = CRITERES_VIDES): { classes: ValeurFiltre[]; elements: ValeurFiltre[]; contextes: ValeurFiltre[] } {
  const compter = (lire: (l: Loadout) => string) => {
    const m = new Map<string, number>();
    for (const l of loadouts) {
      const v = lire(l);
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return m;
  };
  const construire = (ordre: { valeur: string; libelle: string }[], m: Map<string, number>, choisie: string): ValeurFiltre[] =>
    ordre.filter((o) => (m.get(o.valeur) ?? 0) > 0 || o.valeur === choisie).map((o) => ({ ...o, nombre: m.get(o.valeur) ?? 0 }));
  return {
    classes: construire(CLASSES_LOADOUTS, compter(classeDe), c.classe),
    elements: construire(ORDRE_ELEMENTS.map((e) => ({ valeur: e, libelle: LIBELLES_ELEMENT_FR[e] })), compter(elementDe), c.element),
    contextes: construire(ORDRE_CONTEXTES.map((v) => ({ valeur: v, libelle: LIBELLES_CONTEXTE[v] })), compter(contexteDe), c.contexte),
  };
}
