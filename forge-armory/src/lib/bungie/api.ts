// FR : Appels API Bungie — comptes liés, profil, inventaire, coffre.
// EN: Bungie API calls — linked accounts, profile, inventory, vault.

import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirAccessTokenValide } from "./oauth";

// Composants de la Profile API Bungie (GetProfile) qu'on a besoin de croiser :
// 100 Profiles, 102 ProfileInventories (le coffre), 200 Characters,
// 201 CharacterInventories, 205 CharacterEquipment, 300 ItemInstances,
// 302 ItemStats, 304 ItemPerks (stats), 305 ItemSockets/Perks.
// ⚠️ AJOUT (24/08/2026) : 900 Records (les triomphes), pour la vitrine
// Solo Flawless. Les triomphes de donjon sont au niveau PROFIL (partagés
// entre les personnages), pas au niveau personnage - c'est
// `profileRecords` qu'il faut lire, pas `characterRecords`.
// EN: ⚠️ ADDED: 900 Records (triumphs), for the Solo Flawless showcase.
// Dungeon triumphs live at PROFILE level (shared across characters), so
// `profileRecords` is what to read, not `characterRecords`.
const COMPOSANTS = [100, 102, 200, 201, 205, 300, 302, 304, 305, 900] as const;

async function appelBungie<T>(chemin: string): Promise<T> {
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

export interface DestinyMembership {
  membershipId: string;
  /** 1=Xbox, 2=PSN, 3=Steam, 6=Epic (voir BungieMembershipType) */
  membershipType: number;
  displayName: string;
}

/**
 * FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - nom Bungie affiché dans le bloc
 * Connexion, au format `pseudo#1234` (demande de l'utilisateur). Le même
 * appel que `recupererMembershipsActuels` le fournit déjà : on le lit au
 * passage plutôt que d'ajouter un appel réseau. Le code est un NOMBRE côté
 * Bungie (42, pas « 0042 ») : on le complète avec des zéros pour qu'il ait
 * toujours 4 chiffres, comme en jeu. Ordre de lecture : le compte Bungie.net
 * lui-même, sinon le premier compte Destiny qui le porte ; `null` si aucun
 * des deux ne l'a (l'affichage retombe alors sur le nom de plateforme).
 * EN: ⚠️ ADDED - Bungie name for the Connection block (`name#1234`). Read
 * from the same call, no extra request. The code is a number on Bungie's
 * side, zero-padded to 4 digits as in game. Account-level fields first,
 * then the first Destiny membership carrying them; `null` if neither does.
 */
function formaterNomBungie(nom: string | null | undefined, code: number | string | null | undefined): string | null {
  if (!nom || code === null || code === undefined || code === "") return null;
  return `${nom}#${String(code).padStart(4, "0")}`;
}

export async function recupererComptesBungie(): Promise<{ memberships: DestinyMembership[]; nomBungie: string | null }> {
  const data = await appelBungie<{
    destinyMemberships: Array<{
      membershipId: string;
      membershipType: number;
      displayName: string;
      bungieGlobalDisplayName?: string;
      bungieGlobalDisplayNameCode?: number;
    }>;
    primaryMembershipId?: string | null;
    bungieNetUser?: { cachedBungieGlobalDisplayName?: string; cachedBungieGlobalDisplayNameCode?: number };
  }>("/User/GetMembershipsForCurrentUser/");

  const carteAvecNom = data.destinyMemberships.find((m) => formaterNomBungie(m.bungieGlobalDisplayName, m.bungieGlobalDisplayNameCode));
  const nomBungie =
    formaterNomBungie(data.bungieNetUser?.cachedBungieGlobalDisplayName, data.bungieNetUser?.cachedBungieGlobalDisplayNameCode) ??
    formaterNomBungie(carteAvecNom?.bungieGlobalDisplayName, carteAvecNom?.bungieGlobalDisplayNameCode);

  const memberships = data.destinyMemberships.map((m) => ({
    membershipId: String(m.membershipId),
    membershipType: m.membershipType,
    displayName: m.displayName,
  }));

  // Bungie exposes the Cross Save primary membership explicitly. Do not rely
  // on the server's array order when several platforms are linked.
  if (data.primaryMembershipId != null) {
    const primaryId = String(data.primaryMembershipId);
    memberships.sort((a, b) => Number(b.membershipId === primaryId) - Number(a.membershipId === primaryId));
  }

  return { memberships, nomBungie };
}

export async function recupererProfilComplet(membership: DestinyMembership) {
  return appelBungie(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${COMPOSANTS.join(",")}`
  );
}

export interface Personnage {
  characterId: string;
  classe: string;
  lumiere: number;
}

export interface ResumeProfil {
  compte: string;
  nbPersonnages: number;
  classesEtLumiere: string[];
  nbObjetsCoffre: number;
}

const NOMS_CLASSE = ["Titan", "Chasseur", "Arcaniste"];

function derivePersonnages(profil: any): Personnage[] {
  const entrees = Object.entries(profil.characters?.data ?? {}) as [string, { classType: number; light: number }][];
  return entrees.map(([characterId, c]) => ({
    characterId,
    classe: NOMS_CLASSE[c.classType] ?? "?",
    lumiere: c.light,
  }));
}

function deriveResume(profil: any, membership: DestinyMembership, personnages: Personnage[]): ResumeProfil {
  return {
    compte: membership.displayName,
    nbPersonnages: personnages.length,
    classesEtLumiere: personnages.map((p) => `${p.classe} (lumière ${p.lumiere})`),
    nbObjetsCoffre: (profil.profileInventory?.data?.items ?? []).length,
  };
}

/**
 * FR : ⚠️ OPTIMISATION (02/08/2026) : recupererResumeProfil() et
 * recupererPersonnages() appelaient CHACUNE recupererProfilComplet(),
 * doublant inutilement l'appel réseau à chaque "Tester la connexion". On
 * fait maintenant UN SEUL appel et on en dérive les deux résultats.
 * EN: ⚠️ OPTIMIZATION (2026-08-02): recupererResumeProfil() and
 * recupererPersonnages() EACH called recupererProfilComplet(), needlessly
 * doubling the network call on every "Test connection". We now make a
 * SINGLE call and derive both results from it.
 * FR : ⚠️ CHANGÉ (22/10/2026, retour utilisateur en test : « non disponible » pour le temps de jeu sur
 * la page Carrière) : on retourne AUSSI le profil BRUT (`data.Response`, qui contient le composant 200
 * — `characters.data[*].minutesPlayedTotal`). La page Carrière lit le temps de jeu par classe dans ce
 * profil ; le profil des triomphes (`components=900` seul) ne le contient PAS. Aucun appel réseau en
 * plus : c'est le MÊME profil, déjà téléchargé.
 * EN: CHANGED - also returns the RAW profile (component 200, per-character playtime); the Career
 * page reads playtime from it. No extra network call.
 */
export async function recupererResumeEtPersonnages(
  membership: DestinyMembership
): Promise<{ resume: ResumeProfil; personnages: Personnage[]; profil: unknown }> {
  const profil = await recupererProfilComplet(membership);
  const personnages = derivePersonnages(profil);
  const resume = deriveResume(profil, membership, personnages);
  return { resume, personnages, profil };
}
