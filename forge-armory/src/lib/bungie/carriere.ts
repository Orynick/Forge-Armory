// FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - CARRIÈRE du compte (lecture seule).
// Trois sources, toutes en GET, jamais d'écriture :
//  1. GetHistoricalStats avec characterId = 0 (AGRÉGATION de tous les
//     personnages en UNE requête) et periodType = AllTime - l'équivalent
//     exact du filtre « Carrière » des Emblèmes du jeu. Les autres filtres
//     du jeu (Tout / Semaine / Saison) ne sont PAS repris (choix de la
//     spécification).
//  2. Les personnages du GetProfile déjà chargé par l'appli : temps de jeu
//     par classe (minutesPlayedTotal par personnage, composant 200) - sans
//     requête réseau supplémentaire quand le profil est déjà disponible.
//  3. GetActivityHistory par personnage, limité aux 10 dernières activités.
// Aucun appel au chargement de l'appli : tout part du clic sur le bouton
// « Carrière » du bloc Connexion (même règle que « Charger mon inventaire »).
// Tout ce que l'API ne fournit pas est renvoyé absent (« non disponible »
// à l'affichage), JAMAIS estimé (règle constante du projet).
// EN: ⚠️ ADDED - account Career (read-only): aggregated GetHistoricalStats
// (characterId=0, AllTime), per-character playtime from the profile already
// loaded, and GetActivityHistory (last 10). No call at app startup.

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

/** FR : activité récente (type, date, durée si disponible). / EN: recent activity. */
export interface ActiviteRecente {
  characterId: string;
  referenceId: string;
  instanceId: string;
  mode: number | null;
  periode: string | null;
  dureeSecondes: number | null;
  modeInconnu: boolean;
}

export interface DonneesCarriere {
  /** FR : stats « Carrière » agrégées (characterId = 0, AllTime) — l'ordre des statIds est celui de la réponse. / EN: aggregated allTime stats. */
  stats: StatCarriere[];
  /** FR : temps de jeu par personnage (classe → minutes), lu depuis le profil DEJA charge (composant 200) — aucune requête supplémentaire. / EN: playtime per class, from the already-loaded profile. */
  minutesParClasse: { classe: string; minutes: number }[] | null;
  /** FR : 10 dernières activités, tous personnages confondus, triées par date décroissante. / EN: last 10 activities across characters. */
  activites: ActiviteRecente[];
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
  /** FR : nombre d'entrées de `metrics` dans la réponse (`null` si ce champ est absent). */
  nbMetrics: number | null;
  /** FR : une ligne par personnage dont l'historique d'activités a échoué. */
  erreursActivites: string[];
}

interface ValeurHistoricalStat {
  basic?: { value?: number; displayValue?: string };
  precision?: { value?: number };
}

interface ReponseHistoricalStats {
  metrics?: Record<
    string,
    {
      statId?: string;
      allTime?: ValeurHistoricalStat;
      allTimeByClass?: Record<string, unknown>;
    }
  >;
}

interface ReponseActivityHistory {
  activities?: Array<{
    characterId?: string;
    activityHash?: number;
    referenceId?: number;
    instanceId?: string | number;
    mode?: number;
    activityModeType?: number;
    period?: string;
    values?: Record<string, { basic?: { value?: number } }>;
  }>;
}

function lireStat(metric: unknown): { valeur: number | null; precision: number | null } {
  const m = metric as { allTime?: ValeurHistoricalStat } | undefined;
  const allTime = m?.allTime;
  const valeur = allTime?.basic?.value ?? null;
  const precision = allTime?.precision?.value ?? null;
  return { valeur, precision };
}

export function cheminStatsCarriere(membership: DestinyMembership): string {
  return `/Destiny2/Stats/GetHistoricalStats/${membership.membershipId}/0/?periodType=AllTime&mode=None&groups=General,Medals`;
}

export async function recupererStatsCarriere(membership: DestinyMembership): Promise<ReponseHistoricalStats> {
  // FR : characterId = 0 agrège tous les personnages en UNE requête ;
  // periodType = AllTime = le filtre « Carrière » des Emblèmes du jeu.
  // mode = None par défaut (toutes activités). groups = General pour le
  // bloc standard (kills, précision, K/D, efficacité, mêlée, super, etc.).
  // EN: characterId=0 aggregates in one request; AllTime = in-game Career.
  return appelBungieCarriere<ReponseHistoricalStats>(cheminStatsCarriere(membership));
}

export async function recupererActivitesPersonnage(
  membership: DestinyMembership,
  characterId: string
): Promise<ReponseActivityHistory> {
  return appelBungieCarriere<ReponseActivityHistory>(
    `/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Character/${characterId}/Stats/Activities/?count=10&mode=None`
  );
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

/** FR : charge TOUTE la Carrière : les stats agrégées puis, en parallèle, les activités de chaque personnage. Chaque source peut échouer indépendamment : on renvoie ce qui a réussi (tolérance aux données manquantes). / EN: loads the whole Career; each source may fail independently. */
export async function chargerCarriere(
  membership: DestinyMembership,
  personnages: { characterId: string; classe: string }[],
  profil: unknown
): Promise<DonneesCarriere> {
  const resultat: DonneesCarriere = {
    stats: [], minutesParClasse: extraireMinutesParClasse(profil), activites: [], statIdsBruts: [],
    diagnostic: { requeteStats: cheminStatsCarriere(membership), erreurStats: null, clesReponseStats: null, nbMetrics: null, erreursActivites: [] },
  };

  try {
    const stats = await recupererStatsCarriere(membership);
    resultat.diagnostic.clesReponseStats = Object.keys(stats ?? {});
    resultat.diagnostic.nbMetrics = stats?.metrics ? Object.keys(stats.metrics).length : null;
    for (const metric of Object.values(stats.metrics ?? {})) {
      const statId = metric?.statId ?? null;
      if (!statId) continue;
      const { valeur, precision } = lireStat(metric);
      resultat.stats.push({ statId, valeur, precision });
      resultat.statIdsBruts.push(statId);
    }
  } catch (e) {
    // FR : section indépendante — l'échec d'une source n'emporte pas les autres. ⚠️ CHANGÉ (21/10/2026) : l'erreur est CONSERVÉE pour le diagnostic (elle était perdue).
    resultat.stats = [];
    resultat.diagnostic.erreurStats = (e as Error).message;
  }

  const activites: ActiviteRecente[] = [];
  await Promise.all(
    personnages.map(async (perso) => {
      try {
        const reponse = await recupererActivitesPersonnage(membership, perso.characterId);
        for (const a of reponse.activities ?? []) {
          activites.push({
            characterId: perso.characterId,
            referenceId: String(a.referenceId ?? a.activityHash ?? "") || "",
            instanceId: String(a.instanceId ?? ""),
            mode: a.mode ?? a.activityModeType ?? null,
            periode: a.period ?? null,
            dureeSecondes: a.values?.["activityDurationSeconds"]?.basic?.value ?? null,
            modeInconnu: a.mode == null && a.activityModeType == null,
          });
        }
      } catch (e) {
        // FR : un personnage sans histoire (jamais joué, API silencieuse) ne bloque pas les autres. ⚠️ CHANGÉ (21/10/2026) : l'erreur est conservée pour le diagnostic.
        resultat.diagnostic.erreursActivites.push(`${perso.classe} (${perso.characterId}) : ${(e as Error).message}`);
      }
    })
  );
  activites.sort((a, b) => (b.periode ?? "").localeCompare(a.periode ?? ""));
  resultat.activites = activites.slice(0, 10);

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
  lignes.push(`entrées de « metrics » : ${g.nbMetrics === null ? "champ absent de la réponse" : g.nbMetrics}`);
  lignes.push(`historiques d'activités en échec : ${g.erreursActivites.length === 0 ? "aucun" : ""}`);
  lignes.push(...g.erreursActivites.map((l) => `  - ${l}`));
  return lignes.join("\n");
}
