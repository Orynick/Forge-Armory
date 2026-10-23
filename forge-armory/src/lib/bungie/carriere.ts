// FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - CARRIÈRE du compte (lecture seule).
// Deux sources, toutes en GET, jamais d'écriture :
//  1. GetHistoricalStats avec characterId = 0 (AGRÉGATION de tous les
//     personnages en UNE requête) et periodType = AllTime - l'équivalent
//     exact du filtre « Carrière » des Emblèmes du jeu. Les autres filtres
//     du jeu (Tout / Semaine / Saison) ne sont PAS repris (choix de la
//     spécification).
//  2. Les personnages du GetProfile déjà chargé par l'appli : temps de jeu
//     par classe (minutesPlayedTotal par personnage, composant 200) - sans
//     requête réseau supplémentaire quand le profil est déjà disponible.
// ⚠️ CHANGÉ (22/10/2026, demande de l'utilisateur : « Enlève la partie affichant les niveaux de
// persos ainsi que les 10 dernières activités ») : la source 3 (GetActivityHistory par personnage,
// 10 dernières activités) est SUPPRIMÉE avec la section qu'elle alimentait - la page ne fait plus
// qu'UNE SEULE requête réseau à l'ouverture (les statistiques agrégées).
// Aucun appel au chargement de l'appli : tout part du clic sur le bouton
// « Carrière » du bloc Connexion (même règle que « Charger mon inventaire »).
// Tout ce que l'API ne fournit pas est renvoyé absent (« non disponible »
// à l'affichage), JAMAIS estimé (règle constante du projet).
// EN: ⚠️ ADDED - account Career (read-only): aggregated GetHistoricalStats
// (characterId=0, AllTime), per-character playtime from the profile already
// loaded. CHANGED: the activity history (last 10) was removed with its section.

import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirAccessTokenValide } from "./oauth";
import type { DestinyMembership } from "./api";

async function appelBungieCarriere<T>(chemin: string): Promise<T> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}${chemin}`, {
    headers: {
      "X-API-Key": bungieConfig.apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => "");
    throw new Error(`Appel Bungie API échoué (${chemin}) : ${reponse.status}${corps ? ` — ${corps.slice(0, 300)}` : ""}`);
  }
  const data = await reponse.json();
  if (data.ErrorCode !== 1 || data.Response === undefined) {
    throw new Error(
      `Bungie a refusé l'appel (${data.ErrorCode ?? "?"}/${data.ErrorStatus ?? "Unknown"}) : ${data.Message || "réponse sans données"}`
    );
  }
  return data.Response as T;
}

/** FR : une stat du bloc allTime (valeur + détails de précision si présents). / EN: one allTime stat. */
export interface StatCarriere {
  statId: string;
  valeur: number | null;
  precision: number | null;
}

export interface DonneesCarriere {
  /** FR : stats « Carrière » agrégées (characterId = 0, AllTime) — l'ordre des statIds est celui de la réponse. / EN: aggregated allTime stats. */
  stats: StatCarriere[];
  /** FR : temps de jeu par personnage (classe → minutes), lu depuis le profil DEJA charge (composant 200) — aucune requête supplémentaire. / EN: playtime per class, from the already-loaded profile. */
  minutesParClasse: { classe: string; minutes: number }[] | null;
  /** FR : liste brute des statIds réellement retournés (diagnostic dev : figer la sélection affichée sur des données réelles). / EN: raw statIds for the dev diagnostic. */
  statIdsBruts: string[];
  /** FR : ⚠️ AJOUT (21/10/2026, retour de l'utilisateur : « le diagnostic statIds retournés ne s'ouvre pas ») - ce qui s'est PASSÉ pendant le chargement. Avant, l'échec de la requête de statistiques était AVALÉ en silence : la liste des statIds restait vide et le diagnostic n'affichait rien. Il dit maintenant pourquoi (requête, erreur, structure de la réponse). / EN: ⚠️ ADDED - what happened while loading (errors were silently swallowed before). */
  diagnostic: DiagnosticCarriere;
}

export interface DiagnosticCarriere {
  /** FR : chemin appelé pour les statistiques agrégées. */
  requeteStats: string;
  /** FR : message d'erreur de la requête de statistiques, `null` si elle a réussi. */
  erreurStats: string | null;
  /** FR : clés de premier niveau de la réponse (`null` si la requête a échoué). */
  clesReponseStats: string[] | null;
  /** FR : ⚠️ CHANGÉ (22/10/2026, retour réel : « statIds retournés : AUCUN » alors que `mergedAllCharacters` avait 2 entrées) - description de la structure RÉELLE de `mergedAllCharacters` (ex. « merged (allTime : 123 stats), results (allPvE, allPvP : 0 stat fusionné) »), `null` si le champ est absent. / EN: description of the real structure of `mergedAllCharacters`. */
  structureMergedAllCharacters: string | null;
  /** FR : d'où viennent les stats affichées : `merged` (allTime, filtre « Carrière » exact) ou `results` (somme des modes, repli). / EN: where the displayed stats come from. */
  sourceStats: "merged" | "results" | null;
}

interface ValeurHistoricalStat {
  statId?: string;
  basic?: { value?: number; displayValue?: string };
  precision?: { value?: number };
  pga?: { value?: number };
  weighted?: { value?: number };
}

// FR : ⚠️ CORRIGÉ (22/10/2026, retour RÉEL du diagnostic : « statIds retournés : AUCUN » alors que la
// réponse contenait `mergedAllCharacters` avec 2 entrées) - la structure RÉELLE de
// GetHistoricalStatsForAccount est `mergedAllCharacters: { results: { allPvE: { allTime: { <statId>: {...} } },
// allPvP: { allTime: {...} }, allRaid: {...}, allStory: {...}, … }, merged: { allTime: { <statId>: {...} } } }` :
// les stats ne sont PAS directement sous `mergedAllCharacters` (une clé par statId), mais imbriquées sous
// `merged.allTime` (l'agrégat TOUTES activités confondues = le filtre « Carrière » des Emblèmes du jeu) et
// `results.<mode>.allTime` (par mode d'activité). Lecture : `merged.allTime` d'abord, sinon SOMME des
// `results.<mode>.allTime` (repli). / EN: FIXED - real structure: stats live in `merged.allTime` (career
// aggregate) and `results.<mode>.allTime` (per activity mode).
interface BlocStatsAgrege {
  results?: Record<string, { allTime?: Record<string, ValeurHistoricalStat> }>;
  merged?: { allTime?: Record<string, ValeurHistoricalStat> };
}

interface ReponseHistoricalStats {
  mergedDeletedCharacters?: BlocStatsAgrege;
  mergedAllCharacters?: BlocStatsAgrege;
  characters?: unknown[];
}

function lireStat(metric: ValeurHistoricalStat | undefined): { valeur: number | null; precision: number | null } {
  const valeur = metric?.basic?.value ?? null;
  const precision = metric?.precision?.value ?? null;
  return { valeur, precision };
}

// FR : ⚠️ CORRIGÉ (22/10/2026, retour réel « statIds retournés : AUCUN ») - extrait le dictionnaire
// de stats « Carrière » (toutes activités confondues) : `merged.allTime` (l'agrégat exact du filtre
// « Carrière »), sinon SOMME des `results.<mode>.allTime` (repli si `merged` est vide). Renvoie aussi
// une description de la structure pour le diagnostic. Exportée pour les tests. / EN: extracts the career stats dictionary (exported for tests).
export function extraireStatsCarriere(bloc: BlocStatsAgrege | undefined): { stats: Record<string, ValeurHistoricalStat>; source: "merged" | "results" | null; structure: string } {
  const merged = bloc?.merged?.allTime;
  if (merged && Object.keys(merged).length > 0) {
    return { stats: merged, source: "merged", structure: `merged (allTime : ${Object.keys(merged).length} stat${Object.keys(merged).length > 1 ? "s" : ""})` };
  }
  const resultats = bloc?.results ?? {};
  const somme: Record<string, ValeurHistoricalStat> = {};
  const modes: string[] = [];
  for (const [mode, groupe] of Object.entries(resultats)) {
    const allTime = groupe?.allTime;
    if (!allTime) continue;
    modes.push(`${mode} (${Object.keys(allTime).length})`);
    for (const [statId, stat] of Object.entries(allTime)) somme[statId] = stat;
  }
  if (Object.keys(somme).length > 0) {
    return { stats: somme, source: "results", structure: `results (${modes.join(", ")} — somme des modes)` };
  }
  const decrit = (o: unknown): string => (o && typeof o === "object" ? `{${Object.keys(o).join(", ")}}` : String(o));
  const parties: string[] = [];
  if (bloc?.merged) parties.push(`merged : ${decrit(bloc.merged.allTime ?? bloc.merged)}`);
  if (resultats && Object.keys(resultats).length > 0) parties.push(`results : ${decrit(resultats)}`);
  return { stats: {}, source: null, structure: parties.length > 0 ? parties.join(" ; ") : "(bloc vide)" };
}

// FR : ⚠️ CORRIGÉ (21/10/2026, retour réel du diagnostic) - l'ancien chemin
// `/Destiny2/Stats/GetHistoricalStats/{id}/0/` renvoyait 404 : cette route
// n'existe pas pour l'agrégation de compte. La bonne route est
// GetHistoricalStatsForAccount : `/Destiny2/{membershipType}/Account/{id}/Stats/`
// (UNE requête, tous personnages fusionnés), dont la réponse porte les stats
// dans `mergedAllCharacters` (pas `metrics`). periodType et groups ne sont pas
// des paramètres de cette route : elle ne renvoie que l'agrégat global,
// exactement le filtre « Carrière » des Emblèmes du jeu.
// ⚠️ 22/10/2026 : la réponse est structurée `{ results: { <mode>: { allTime } }, merged: { allTime } }` —
// les stats « Carrière » sont dans `merged.allTime` (voir `extraireStatsCarriere`).
// EN: ⚠️ FIXED - the real route is GetHistoricalStatsForAccount; stats live in
// `mergedAllCharacters.merged.allTime`, not `metrics`.
export function cheminStatsCarriere(membership: DestinyMembership): string {
  return `/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Stats/`;
}

export async function recupererStatsCarriere(membership: DestinyMembership): Promise<ReponseHistoricalStats> {
  // FR : UNE requête pour tout le compte (GetHistoricalStatsForAccount), l'équivalent exact du filtre « Carrière » des Emblèmes du jeu. / EN: one account-wide request, the in-game Career filter.
  return appelBungieCarriere<ReponseHistoricalStats>(cheminStatsCarriere(membership));
}

/** FR : temps de jeu (minutes) par classe, depuis le profil DEJA chargé par l'appli (composant 200, `minutesPlayedTotal` par personnage). Aucune requête réseau. / EN: playtime per class from the already-loaded profile; no network call. */
export function extraireMinutesParClasse(profil: unknown): { classe: string; minutes: number }[] | null {
  const p = profil as { characters?: { data?: Record<string, { classType?: number; minutesPlayedTotal?: string | number }> } } | null;
  const entrees = Object.entries(p?.characters?.data ?? {});
  if (entrees.length === 0) return null;
  const NOMS_CLASSE = ["Titan", "Chasseur", "Arcaniste"];
  const lignes = entrees.map(([, c]) => ({
    classe: NOMS_CLASSE[c.classType ?? -1] ?? "?",
    minutes: Number(c.minutesPlayedTotal ?? 0),
  }));
  return lignes.some((l) => Number.isFinite(l.minutes) && l.minutes > 0) ? lignes : null;
}

/** FR : charge la Carrière : UNE SEULE requête (les stats agrégées, filtre « Carrière » du jeu) + le
// temps de jeu par classe lu dans le profil déjà chargé (aucune requête de plus). ⚠️ CHANGÉ (22/10/2026,
// « Enlève … les 10 dernières activités ») : le paramètre `personnages` et le chargement des historiques
// d'activités (10 requêtes GetActivityHistory par personnage) sont SUPPRIMÉS avec la section affichée.
// Chaque source peut échouer indépendamment : on renvoie ce qui a réussi (tolérance aux données
// manquantes). / EN: loads the Career: ONE request (aggregated stats) + playtime from the profile. */
export async function chargerCarriere(
  membership: DestinyMembership,
  profil: unknown
): Promise<DonneesCarriere> {
  const resultat: DonneesCarriere = {
    stats: [], minutesParClasse: extraireMinutesParClasse(profil), statIdsBruts: [],
    diagnostic: { requeteStats: cheminStatsCarriere(membership), erreurStats: null, clesReponseStats: null, structureMergedAllCharacters: null, sourceStats: null },
  };

  try {
    const reponse = await recupererStatsCarriere(membership);
    resultat.diagnostic.clesReponseStats = Object.keys(reponse ?? {});
    // FR : ⚠️ CORRIGÉ (22/10/2026, retour réel : « statIds retournés : AUCUN » avec 2 entrées dans
    // `mergedAllCharacters`) - les stats ne sont PAS directement sous `mergedAllCharacters` : ce champ
    // contient `{ results: { <mode>: { allTime } }, merged: { allTime } }` ; les stats « Carrière » sont
    // dans `merged.allTime` (sinon somme des `results.<mode>.allTime`).
    const extrait = extraireStatsCarriere(reponse?.mergedAllCharacters);
    resultat.diagnostic.structureMergedAllCharacters = reponse?.mergedAllCharacters ? extrait.structure : null;
    resultat.diagnostic.sourceStats = extrait.source;
    for (const [statId, stat] of Object.entries(extrait.stats)) {
      const { valeur, precision } = lireStat(stat);
      resultat.stats.push({ statId: stat.statId ?? statId, valeur, precision });
      resultat.statIdsBruts.push(stat.statId ?? statId);
    }
  } catch (e) {
    // FR : section indépendante — l'échec d'une source n'emporte pas les autres. ⚠️ CHANGÉ (21/10/2026) : l'erreur est CONSERVÉE pour le diagnostic (elle était perdue).
    resultat.stats = [];
    resultat.diagnostic.erreurStats = (e as Error).message;
  }

  return resultat;
}

/** FR : ⚠️ AJOUT (21/10/2026) - texte du diagnostic « statIds retournés » (mode développement). Il s'affiche TOUJOURS : une liste vide dit qu'elle est vide ET pourquoi (erreur de la requête, structure de la réponse) au lieu de ne rien montrer. / EN: text of the dev diagnostic; always shows something. */
export function formaterDiagnosticCarriere(d: DonneesCarriere): string {
  const g = d.diagnostic;
  const lignes: string[] = [];
  lignes.push(d.statIdsBruts.length > 0 ? `statIds retournés : ${d.statIdsBruts.length}` : "statIds retournés : AUCUN");
  if (d.statIdsBruts.length > 0) lignes.push(...d.statIdsBruts);
  lignes.push("");
  lignes.push(`requête : GET ${g.requeteStats}`);
  lignes.push(`erreur de la requête : ${g.erreurStats ?? "aucune"}`);
  lignes.push(`clés de la réponse : ${g.clesReponseStats === null ? "(pas de réponse : la requête a échoué)" : g.clesReponseStats.length > 0 ? g.clesReponseStats.join(", ") : "(réponse vide)"}`);
  // FR : ⚠️ CHANGÉ (22/10/2026, retour réel) - décrit la structure RÉELLE de `mergedAllCharacters` (les stats sont dans `merged.allTime`, pas directement sous la clé) et la source lue.
  lignes.push(`structure de « mergedAllCharacters » : ${g.structureMergedAllCharacters ?? "champ absent de la réponse"}`);
  if (g.sourceStats) lignes.push(`source des stats affichées : ${g.sourceStats === "merged" ? "merged.allTime (agrégat « Carrière » du jeu)" : "somme de results.<mode>.allTime"}`);
  return lignes.join("\n");
}
