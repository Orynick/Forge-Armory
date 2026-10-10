// FR : Appels API Bungie — comptes liés, profil, inventaire, coffre.
// EN: Bungie API calls — linked accounts, profile, inventory, vault.

import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirAccessTokenValide } from "./oauth";

// Composants de la Profile API Bungie (GetProfile) qu'on a besoin de croiser :
// 100 Profiles, 102 ProfileInventories (le coffre), 200 Characters,
// 201 CharacterInventories, 205 CharacterEquipment, 300 ItemInstances,
// 302 ItemStats, 304 ItemPerks (stats), 305 ItemSockets/Perks.
const COMPOSANTS = [100, 102, 200, 201, 205, 300, 302, 304, 305] as const;

async function appelBungie<T>(chemin: string): Promise<T> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}${chemin}`, {
    headers: {
      "X-API-Key": bungieConfig.apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!reponse.ok) {
    throw new Error(`Appel Bungie API échoué (${chemin}) : ${reponse.status}`);
  }
  const data = await reponse.json();
  return data.Response as T;
}

export interface DestinyMembership {
  membershipId: string;
  /** 1=Xbox, 2=PSN, 3=Steam, 6=Epic (voir BungieMembershipType) */
  membershipType: number;
  displayName: string;
}

/**
 * FR : Etape obligatoire avant tout appel Profile : le membership_id
 * renvoye par l'OAuth (App/OAuth/Token) est l'identifiant du COMPTE
 * BUNGIE.NET, pas l'identifiant Destiny (Steam/Xbox/PSN/Epic). Il faut
 * d'abord lister les comptes Destiny lies via cet endpoint (bug trouve et
 * corrige le 01/08/2026 : le code appelait Profile avec le mauvais ID).
 * EN: Mandatory step before any Profile call: the membership_id returned
 * by OAuth (App/OAuth/Token) is the BUNGIE.NET ACCOUNT id, not the Destiny
 * id (Steam/Xbox/PSN/Epic). You must first list the linked Destiny accounts
 * via this endpoint (bug found and fixed on 2026-08-01: the code was
 * calling Profile with the wrong id).
 */
export async function recupererMembershipsActuels(): Promise<DestinyMembership[]> {
  const data = await appelBungie<{
    destinyMemberships: Array<{ membershipId: string; membershipType: number; displayName: string }>;
  }>("/User/GetMembershipsForCurrentUser/");

  return data.destinyMemberships.map((m) => ({
    membershipId: m.membershipId,
    membershipType: m.membershipType,
    displayName: m.displayName,
  }));
}

export async function recupererProfilComplet(membership: DestinyMembership) {
  return appelBungie(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${COMPOSANTS.join(",")}`
  );
}

/** Le coffre est simplement un "character" special dans profileInventory (component 102) */
export async function recupererCoffre(membership: DestinyMembership) {
  const profil = await recupererProfilComplet(membership);
  // @ts-expect-error - typage precis a affiner avec bungie-api-ts si besoin
  return profil.profileInventory?.data?.items ?? [];
}

export async function recupererInventairePersonnages(membership: DestinyMembership) {
  const profil = await recupererProfilComplet(membership);
  // @ts-expect-error - idem
  return profil.characterInventories?.data ?? {};
}

export interface ResumeProfil {
  compte: string;
  nbPersonnages: number;
  classesEtLumiere: string[];
  nbObjetsCoffre: number;
}

/**
 * FR : Resume minimal du profil, pense pour UN SEUL usage : verifier
 * visuellement que la connexion + l'appel API fonctionnent (bouton "Tester
 * la connexion" du tableau de bord). Pas destine a etre la vraie UI finale.
 * EN: Minimal profile summary, meant for ONE purpose: visually verifying
 * that the connection + API call work (the "Test connection" dashboard
 * button). Not meant to be the final real UI.
 */
export async function recupererResumeProfil(membership: DestinyMembership): Promise<ResumeProfil> {
  const profil = await recupererProfilComplet(membership);
  // @ts-expect-error - typage precis a affiner avec bungie-api-ts si besoin
  const personnages = Object.values(profil.characters?.data ?? {}) as Array<{
    classType: number;
    light: number;
  }>;
  const NOMS_CLASSE = ["Titan", "Chasseur", "Arcaniste"];

  return {
    compte: membership.displayName,
    nbPersonnages: personnages.length,
    classesEtLumiere: personnages.map((p) => `${NOMS_CLASSE[p.classType] ?? "?"} (lumiere ${p.light})`),
    // @ts-expect-error - idem
    nbObjetsCoffre: (profil.profileInventory?.data?.items ?? []).length,
  };
}
