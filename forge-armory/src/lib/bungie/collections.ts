// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - COLLECTIONS DU COMPTE : quelles armes ont été obtenues au moins une fois (vue « Collection » de la Forge : couleurs si obtenue, grisée sinon, « comme dans le jeu »). LECTURE SEULE (composant 800 du profil Bungie) ; aucune écriture.
// Un objet est « obtenu » si, dans les collections du COMPTE ou de L'UN des personnages, son état n'a pas le drapeau « non obtenu » (bit 1). Un objet absent de toutes les collections, ou sans `collectibleHash`, est « inconnu » : on ne le grise pas à tort.
// Une session expirée (`SessionExpiree`) remonte à l'appelant ; toute autre erreur est rendue avec sa raison, et l'appelant n'affiche alors AUCUN grisé (pas de faux « jamais obtenu »).
// ⚠️ Structure de la réponse Bungie écrite de mémoire (profileCollectibles / characterCollectibles) : non vérifiée sur le compte réel au moment de l'écriture. EN: ⚠️ ADDED - read-only account Collections (component 800): which items were ever obtained.
import type { DestinyMembership } from "./api";
import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirAccessTokenValide, SessionExpiree } from "./oauth";
import type { EtatObtention } from "../manifest/catalogueArmes";

/** FR : drapeau « non obtenu » de l'état d'une collectible chez Bungie (bit 1). / EN: the "not acquired" flag of a collectible's state. */
const NON_OBTENU = 1;
export type ObtenusParCollectible = ReadonlyMap<number, boolean>;

interface EtatCollectible { state?: number }
interface ReponseCollections {
  ErrorCode?: number;
  ErrorStatus?: string;
  Response?: {
    profileCollectibles?: { data?: { collectibles?: Record<string, EtatCollectible> } };
    characterCollectibles?: { data?: Record<string, { collectibles?: Record<string, EtatCollectible> }> };
  };
}

/** FR : fonction PURE : fusionne les collections du compte et des personnages (obtenu si UNE seule occurrence l'est). / EN: PURE: merges account and character collections. */
export function fusionnerCollections(reponse: ReponseCollections["Response"]): Map<number, boolean> | null {
  const profil = reponse?.profileCollectibles?.data?.collectibles;
  const persos = reponse?.characterCollectibles?.data;
  if (!profil && !persos) return null;
  const obtenus = new Map<number, boolean>();
  const ajouter = (c?: Record<string, EtatCollectible>) => {
    for (const [hash, etat] of Object.entries(c ?? {})) {
      const obtenu = ((etat.state ?? NON_OBTENU) & NON_OBTENU) === 0;
      obtenus.set(Number(hash), (obtenus.get(Number(hash)) ?? false) || obtenu);
    }
  };
  ajouter(profil);
  for (const perso of Object.values(persos ?? {})) ajouter(perso.collectibles);
  return obtenus;
}

/** FR : état d'obtention d'une collectible ; « inconnu » sans `collectibleHash`, sans lecture des collections, ou absente de toutes. / EN: obtained state; "unknown" when it cannot be established. */
export function classerObtention(collectibleHash: number | undefined, obtenus: ObtenusParCollectible | null): EtatObtention {
  if (!collectibleHash || !obtenus || !obtenus.has(collectibleHash)) return "inconnu";
  return obtenus.get(collectibleHash) ? "obtenu" : "jamais";
}

export interface DependancesCollections {
  jeton: () => Promise<string>;
  appeler: (url: string, init: { headers: Record<string, string> }) => Promise<{ json: () => Promise<unknown>; status: number }>;
}

/** FR : lit les collections du compte (lecture seule). / EN: reads the account's collections (read-only). */
export async function lireCollections(membership: DestinyMembership, dep: DependancesCollections = { jeton: obtenirAccessTokenValide, appeler: (u, i) => fetch(u, i) }): Promise<{ ok: true; obtenus: Map<number, boolean> } | { ok: false; raison: string }> {
  let jeton: string;
  try { jeton = await dep.jeton(); } catch (e) { if (e instanceof SessionExpiree) throw e; return { ok: false, raison: `jeton Bungie indisponible (${(e as Error).message})` }; }
  let corps: ReponseCollections;
  try {
    const reponse = await dep.appeler(`${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=800`, { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${jeton}` } });
    corps = (await reponse.json()) as ReponseCollections;
    if (corps?.ErrorCode !== 1) return { ok: false, raison: `lecture des collections refusée par Bungie (HTTP ${reponse.status}, ${corps?.ErrorStatus ?? "réponse inattendue"})` };
  } catch (e) {
    return { ok: false, raison: `lecture des collections impossible (${(e as Error).message})` };
  }
  const obtenus = fusionnerCollections(corps.Response);
  return obtenus ? { ok: true, obtenus } : { ok: false, raison: "Bungie n'a renvoyé aucune collection (droits de lecture ou profil privé ?)" };
}
