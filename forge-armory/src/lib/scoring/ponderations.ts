// FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - pondérations personnalisées des 5
// piliers (demande de l'utilisateur : « choisir sa pondération, et
// sauvegarder le réglage en choisissant un nom »).
//
// Principe :
//   - les 4 pondérations par contexte (POIDS_PILIERS, pillars.ts) restent
//     INCHANGÉES : c'est le mode « Automatique », comme avant ;
//   - l'utilisateur peut enregistrer des réglages nommés (poids en % entiers,
//     total obligatoirement égal à 100) et en rendre un ACTIF ;
//   - un réglage actif remplace les poids du contexte pour le SCORE GLOBAL
//     uniquement. Le contexte continue de pondérer les statistiques au sein du
//     pilier Statistiques (POIDS_STATS) : c'est un autre réglage, non touché ;
//   - le réglage actif est une préférence GLOBALE (stockage local), pas une
//     propriété de chaque build.
//
// EN: ⚠️ ADDED - custom pillar weightings. The 4 per-context weightings stay
// unchanged ("Automatic" mode). Users can save named weightings (integer %,
// total must be 100) and make one ACTIVE; it replaces the context weights for
// the OVERALL score only (the context still weights stats within pillar 5).
// The active weighting is a GLOBAL preference.

import type { CleP } from "./pillars";
import { ORDRE_PILIERS } from "../../data/piliers";

const CLE_STOCKAGE = "d2-build-analyzer.ponderations.v1";

/** FR : poids en POURCENTAGE ENTIER (0 à 100) par pilier. / EN: weights as INTEGER PERCENT per pillar. */
export type PoidsEnPourcent = Record<CleP, number>;

export interface Ponderation {
  id: string;
  nom: string;
  poids: PoidsEnPourcent;
}

export interface EtatPonderations {
  reglages: Ponderation[];
  /** FR : identifiant du réglage actif, ou null pour le mode Automatique (selon le contexte). / EN: active id, or null for Automatic. */
  actif: string | null;
}

const ETAT_VIDE: EtatPonderations = { reglages: [], actif: null };

/**
 * FR : vérifie des poids saisis. Renvoie un message d'erreur lisible, ou
 * null si tout est correct : 5 piliers, entiers de 0 à 100, total de 100.
 * EN: validates entered weights; returns a readable error or null.
 */
export function verifierPoids(poids: Partial<Record<CleP, number>>): string | null {
  for (const cle of ORDRE_PILIERS) {
    const v = poids[cle];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 100) {
      return "Chaque poids doit être un nombre entier entre 0 et 100.";
    }
  }
  const total = ORDRE_PILIERS.reduce((s, cle) => s + (poids[cle] as number), 0);
  if (total !== 100) return `Le total doit faire 100 % (actuellement ${total} %).`;
  return null;
}

function estPonderationValide(p: unknown): p is Ponderation {
  if (!p || typeof p !== "object") return false;
  const r = p as Ponderation;
  return typeof r.id === "string" && typeof r.nom === "string" && !!r.poids && verifierPoids(r.poids) === null;
}

/** FR : lit les réglages ; toute donnée abîmée est ignorée plutôt que de casser l'appli. / EN: reads settings; damaged data is ignored. */
export function lirePonderations(): EtatPonderations {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return ETAT_VIDE;
    const d = JSON.parse(brut) as Partial<EtatPonderations>;
    const reglages = Array.isArray(d.reglages) ? d.reglages.filter(estPonderationValide) : [];
    const actif = typeof d.actif === "string" && reglages.some((r) => r.id === d.actif) ? d.actif : null;
    return { reglages, actif };
  } catch {
    return ETAT_VIDE;
  }
}

function ecrire(etat: EtatPonderations): { ok: boolean; erreur?: string } {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Impossible d'enregistrer le réglage (stockage indisponible ou plein)." };
  }
}

/**
 * FR : enregistre un réglage nommé et le rend ACTIF (c'est ce qu'on attend
 * juste après l'avoir créé). Un réglage du même nom (casse et espaces
 * ignorés) est REMPLACÉ, pour pouvoir corriger un réglage sans doublon.
 * EN: saves a named setting and makes it ACTIVE; a same-name one is replaced.
 */
export function enregistrerPonderation(
  etat: EtatPonderations,
  nom: string,
  poids: PoidsEnPourcent
): { etat: EtatPonderations; erreur?: string } {
  const nomPropre = nom.trim();
  if (!nomPropre) return { etat, erreur: "Donnez un nom au réglage." };
  if (nomPropre.length > 40) return { etat, erreur: "Nom trop long (40 caractères au plus)." };
  const erreurPoids = verifierPoids(poids);
  if (erreurPoids) return { etat, erreur: erreurPoids };

  const cleNom = nomPropre.toLowerCase();
  const existant = etat.reglages.find((r) => r.nom.trim().toLowerCase() === cleNom);
  const reglage: Ponderation = {
    id: existant?.id ?? `ponderation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nom: nomPropre,
    poids: { ...poids },
  };
  const reglages = existant ? etat.reglages.map((r) => (r.id === existant.id ? reglage : r)) : [...etat.reglages, reglage];
  const nouvel: EtatPonderations = { reglages, actif: reglage.id };
  const r = ecrire(nouvel);
  return r.ok ? { etat: nouvel } : { etat, erreur: r.erreur };
}

export function supprimerPonderation(etat: EtatPonderations, id: string): { etat: EtatPonderations; erreur?: string } {
  const nouvel: EtatPonderations = {
    reglages: etat.reglages.filter((r) => r.id !== id),
    actif: etat.actif === id ? null : etat.actif,
  };
  const r = ecrire(nouvel);
  return r.ok ? { etat: nouvel } : { etat, erreur: r.erreur };
}

/** FR : choisit le réglage actif (null = Automatique, selon le contexte). / EN: sets the active setting (null = Automatic). */
export function activerPonderation(etat: EtatPonderations, id: string | null): { etat: EtatPonderations; erreur?: string } {
  const actif = id && etat.reglages.some((r) => r.id === id) ? id : null;
  const nouvel: EtatPonderations = { ...etat, actif };
  const r = ecrire(nouvel);
  return r.ok ? { etat: nouvel } : { etat, erreur: r.erreur };
}

/** FR : réglage actif, ou undefined en mode Automatique. / EN: active setting, or undefined in Automatic mode. */
export function ponderationActive(etat: EtatPonderations): Ponderation | undefined {
  return etat.actif ? etat.reglages.find((r) => r.id === etat.actif) : undefined;
}

/**
 * FR : poids du réglage actif en FRACTIONS (0,25 pour 25 %), au format
 * attendu par `evaluerBuild` ; null en mode Automatique.
 * EN: active weights as FRACTIONS for evaluerBuild; null in Automatic mode.
 */
export function poidsActifsEnFractions(etat: EtatPonderations): Record<CleP, number> | null {
  const p = ponderationActive(etat);
  if (!p) return null;
  return Object.fromEntries(ORDRE_PILIERS.map((cle) => [cle, p.poids[cle] / 100])) as Record<CleP, number>;
}
