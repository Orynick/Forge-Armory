// FR : ⚠️ AJOUT (23/10/2026, branche vibe/draft-podcast-840f64) - bus du LECTEUR
// PODCAST (spec SPEC-PODCAST-ESSAI-2026-10-23.md). Le Legendarium est une vue
// interne montée/démontée par DashboardPage ; le lecteur flottant, lui, vit dans
// App.tsx (toujours visible). Ce module fait le PONT entre les deux, EN MÉMOIRE
// UNIQUEMENT : aucune persistance, aucune écriture (lecture passive, comme le
// Legendarium).
//
// Deux responsabilités :
//   1. bus page courante : `publierPagePodcast(page)` (appelé par Bibliotheque à
//      chaque changement) / `usePagePodcast()` (hook du LecteurPodcast) ;
//   2. résolution audio : `nomFichierPourPage(pageId)` (convention de nommage
//      verrouillée : `lore:<hash>` → `lore-<hash>.mp3`, `grimoire:<id>` →
//      `grimoire-<id>.mp3`) + chargement de `podcast/index.json` (un seul fetch
//      sur 'self' au démarrage — autorisé par la CSP, aucun réseau externe).
// EN: ADDED (draft-podcast branch) - PODCAST PLAYER bus. The Legendarium is an
// internal view mounted/unmounted by DashboardPage; the floating player lives in
// App.tsx (always visible). This module bridges the two, IN MEMORY ONLY: no
// persistence, no writes (passive reading, like the Legendarium).
import { useEffect, useState } from "react";

/** FR : page publiée par le Legendarium pour le lecteur (forme minimale : ce dont le lecteur a besoin). / EN: page published by the Legendarium for the player (minimal shape). */
export interface PagePodcast {
  /** FR : identifiant stable de la page (`lore:<hash>` ou `grimoire:<id>`). / EN: stable page id (`lore:<hash>` or `grimoire:<id>`). */
  id: string;
  /** FR : titre de la page (affiché dans le lecteur). / EN: page title (shown in the player). */
  titre: string;
  /** FR : titre du livre (contexte affiché sous le titre). / EN: book title (context under the title). */
  livre: string;
  /** FR : identifiant de la page suivante dans l'ordre aplati de la section (pour l'enchaînement automatique), ou null. / EN: next page id in the section's flat order (for auto-chaining), or null. */
  idSuivante: string | null;
}

/** FR : une entrée de l'index des enregistrements (`public/podcast/index.json`). / EN: one entry of the recordings index (`public/podcast/index.json`). */
export interface EntreeIndexPodcast {
  page: string;
  fichier: string;
}

/** FR : forme de l'index. / EN: index shape. */
export interface IndexPodcast {
  version: number;
  genereLe: string | null;
  enregistrements: EntreeIndexPodcast[];
}

// ---------------------------------------------------------------------------
// 1. Bus « page courante » (mémoire uniquement)
// ---------------------------------------------------------------------------

let pageCourante: PagePodcast | null = null;
const abonnes = new Set<(p: PagePodcast | null) => void>();
let demandeSuivante: string | null = null;

/** FR : publie la page courante du Legendarium (appelé par Bibliotheque). Une page `null` masque le lecteur. / EN: publishes the Legendarium's current page (called by Bibliotheque). A `null` page hides the player. */
export function publierPagePodcast(page: PagePodcast | null): void {
  pageCourante = page;
  for (const abonne of abonnes) abonne(page);
}

const abonnesNavigation = new Set<() => void>();

/** FR : abonnement aux DEMANDES DE NAVIGATION du lecteur (page suivante, retour page courante). DashboardPage s'y abonne pour basculer la vue vers le Legendarium. / EN: subscription to the player's NAVIGATION REQUESTS (next page, back to current page). DashboardPage subscribes to switch the view to the Legendarium. */
export function useDemandeNavigationLegende(effet: () => void): void {
  useEffect(() => {
    abonnesNavigation.add(effet);
    return () => { abonnesNavigation.delete(effet); };
  }, [effet]);
}

function notifierNavigation(): void {
  for (const abonne of abonnesNavigation) abonne();
}

/** FR : le lecteur demande la page SUIVANTE de la file (enchaînement automatique). `idPage` = la page que le Legendarium doit ouvrir. Le prochain `publierPagePodcast` la publiera normalement. / EN: the player asks for the NEXT queued page (auto-chaining). `idPage` = the page the Legendarium must open. The next `publierPagePodcast` will publish it normally. */
export function demanderPageSuivante(idPage: string): void {
  demandeSuivante = idPage;
  notifierNavigation();
}

/** FR : à appeler quand le Legendarium change de page : consomme une demande de page suivante en attente (renvoie l'id demandé, ou null). / EN: to call when the Legendarium changes page: consumes a pending next-page request (returns the requested id, or null). */
export function prendreDemandePageSuivante(): string | null {
  const d = demandeSuivante;
  demandeSuivante = null;
  return d;
}

/** FR : le lecteur demande à revenir à la page EN COURS (clic sur le titre). Mémorisé : DashboardPage bascule la vue, puis Bibliotheque rouvre la dernière page publiée. / EN: the player asks to go back to the CURRENT page (title click). Remembered: DashboardPage switches the view, then Bibliotheque reopens the last published page. */
export function demanderRetourPageCourante(): void {
  if (pageCourante) {
    demandeRetour = pageCourante.id;
    notifierNavigation();
  }
}

let demandeRetour: string | null = null;

/** FR : à appeler au montage du Legendarium : consomme une demande de retour (renvoie l'id de la page à rouvrir, ou null). / EN: to call when the Legendarium mounts: consumes a back request (returns the page id to reopen, or null). */
export function prendreDemandeRetour(): string | null {
  const d = demandeRetour;
  demandeRetour = null;
  return d;
}

/** FR : hook d'abonnement : renvoie la page publiée (ou null). / EN: subscription hook: returns the published page (or null). */
export function usePagePodcast(): PagePodcast | null {
  const [page, setPage] = useState<PagePodcast | null>(pageCourante);
  useEffect(() => {
    const abonne = (p: PagePodcast | null) => setPage(p);
    abonnes.add(abonne);
    abonne(pageCourante); // rattrapage si une page était déjà publiée avant le montage
    return () => { abonnes.delete(abonne); };
  }, []);
  return page;
}

// ---------------------------------------------------------------------------
// 2. Résolution audio + index (mémoire uniquement, un seul fetch)
// ---------------------------------------------------------------------------

/** FR : nom de fichier pour une page, selon la convention verrouillée (`lore:<hash>` → `lore-<hash>.mp3`). Renvoie null si l'identifiant n'a pas la forme attendue. / EN: file name for a page, per the locked convention (`lore:<hash>` → `lore-<hash>.mp3`). Returns null if the id has not the expected shape. */
export function nomFichierPourPage(pageId: string): string | null {
  const m = /^(lore|grimoire):(.+)$/.exec(pageId);
  if (!m) return null;
  return `${m[1]}-${m[2]}.mp3`;
}

/** FR : chemin relatif (base `./` du build) du fichier audio d'une page. / EN: relative path (build's `./` base) of a page's audio file. */
export function urlPourPage(pageId: string): string | null {
  const nom = nomFichierPourPage(pageId);
  return nom ? `podcast/${nom}` : null;
}

let indexEnCours: Promise<Map<string, string>> | null = null;

/** FR : charge `podcast/index.json` UNE FOIS (mis en cache module) et renvoie la table `page → fichier`. En cas d'absence d'index (fetch 404) : table VIDE (aucun enregistrement — le lecteur dira « pas d'enregistrement »). Jamais d'erreur bloquante. / EN: loads `podcast/index.json` ONCE (module-level cache) and returns the `page → file` table. If the index is missing (fetch 404): EMPTY table (no recording — the player will say "no recording"). Never throws. */
export function chargerIndexPodcast(): Promise<Map<string, string>> {
  if (!indexEnCours) {
    indexEnCours = fetch("podcast/index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: IndexPodcast | null) => {
        const table = new Map<string, string>();
        for (const e of data?.enregistrements ?? []) table.set(e.page, e.fichier);
        return table;
      })
      .catch(() => new Map<string, string>());
  }
  return indexEnCours;
}

/** FR : renvoie le nom de fichier ENREGISTRÉ pour une page (d'après l'index), ou null si la page n'a pas d'audio. / EN: returns the RECORDED file name for a page (from the index), or null if the page has no audio. */
export async function fichierEnregistrePourPage(pageId: string): Promise<string | null> {
  const index = await chargerIndexPodcast();
  return index.get(pageId) ?? null;
}

/** FR : réinitialise le cache de l'index (tests uniquement). / EN: resets the index cache (tests only). */
export function _reinitialiserIndexPodcast(): void {
  indexEnCours = null;
}
