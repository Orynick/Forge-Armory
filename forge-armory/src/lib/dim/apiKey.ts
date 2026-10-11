// FR : Obtention automatique de la cle API DIM (differente de la cle API
// Bungie !). Contrairement a Bungie, c'est un endpoint self-service :
// n'importe qui peut en generer une pour du developpement local, sans
// attente d'approbation. On la demande une seule fois puis on la garde en
// cache (localStorage) pour ne pas la redemander a chaque export.
//
// ⚠️ BUG CORRIGE (02/08/2026) : l'export DIM echouait avec "NetworkError"
// car aucune cle API DIM n'etait jamais fournie a l'appel loadout_share -
// j'avais suppose a tort que c'etait un endpoint totalement ouvert.
//
// EN: Automatic DIM API key retrieval (different from the Bungie API
// key!). Unlike Bungie, this is a self-service endpoint: anyone can
// generate one for local development, no approval wait. We request it
// once then cache it (localStorage) to avoid asking again on every export.
//
// ⚠️ BUG FIXED (2026-08-02): DIM export failed with "NetworkError" because
// no DIM API key was ever supplied to the loadout_share call - I had
// wrongly assumed it was a fully open endpoint.

import { bungieConfig } from "../bungie/config";
import { lireTokens, obtenirAccessTokenValide } from "../bungie/oauth";

const DIM_API_ROOT = "https://api.destinyitemmanager.com";
const CLE_STOCKAGE = "d2ba.dim.apiKey";
const CLE_STOCKAGE_ID = "d2ba.dim.appId";
const CLE_STOCKAGE_TOKEN = "d2ba.dim.accessToken";

/**
 * FR : L'id d'app DIM doit être unique côté serveur DIM (voir doc :
 * redemander avec le MÊME id renvoie la MÊME clé). Un id fixe partagé par
 * tout le monde qui utilise ce projet risquerait un conflit si deux
 * personnes l'utilisent avec des clés Bungie différentes. On génère donc
 * un suffixe aléatoire une seule fois, gardé en cache localement.
 * EN: The DIM app id must be unique on DIM's server (per their docs:
 * asking again with the SAME id returns the SAME key). A fixed id shared
 * by everyone using this project would risk a conflict if two people use
 * it with different Bungie keys. So we generate a random suffix once,
 * cached locally.
 */
function obtenirIdApp(): string {
  let id = localStorage.getItem(CLE_STOCKAGE_ID);
  if (!id) {
    id = `d2-build-analyzer-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLE_STOCKAGE_ID, id);
  }
  return id;
}

export async function obtenirCleDimApi(): Promise<string> {
  const cleEnCache = localStorage.getItem(CLE_STOCKAGE);
  if (cleEnCache) return cleEnCache;

  const reponse = await fetch(`${DIM_API_ROOT}/new_app`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: obtenirIdApp(),
      bungieApiKey: bungieConfig.apiKey,
      origin: window.location.origin, // doit correspondre à https://127.0.0.1:5173
    }),
  });

  if (!reponse.ok) {
    throw new Error(`Impossible d'obtenir une clé API DIM (${reponse.status})`);
  }
  const data = await reponse.json();
  // FR : ⚠️ BUG CORRIGÉ (02/08/2026) : la clé est imbriquée sous `app.dimApiKey`,
  // pas à la racine de la réponse comme je l'avais supposé à tort (la doc
  // DIM ne montre pas d'exemple de réponse complet, seulement la requête).
  // EN: ⚠️ BUG FIXED (2026-08-02): the key is nested under `app.dimApiKey`,
  // not at the root of the response as I had wrongly assumed (DIM's docs
  // don't show a full response example, only the request).
  const cle = data.app?.dimApiKey ?? data.dimApiKey;
  if (!cle) {
    throw new Error(`Réponse DIM inattendue : ${JSON.stringify(data)}`);
  }

  localStorage.setItem(CLE_STOCKAGE, cle);
  return cle;
}

interface TokenDimEnCache {
  token: string;
  expiresAt: number;
  membershipId: string;
}

/**
 * FR : ⚠️ AJOUT (02/08/2026) : la clé API seule ne suffit pas - la doc DIM
 * précise que TOUTES les requêtes suivantes nécessitent AUSSI un jeton
 * d'accès DIM, obtenu en échangeant votre access_token Bungie (déjà en
 * main) contre un jeton DIM via /auth/token. Ce jeton a une expiration :
 * on le garde en cache mais on le renouvelle s'il approche de sa fin.
 * EN: ⚠️ ADDED (2026-08-02): the API key alone isn't enough - DIM's docs
 * specify that ALL subsequent requests ALSO need a DIM access token,
 * obtained by exchanging your (already-held) Bungie access_token for a
 * DIM token via /auth/token. This token expires: we cache it but renew it
 * if it's close to expiring.
 */
export async function obtenirTokenDimAcces(): Promise<string> {
  const tokensBungie = lireTokens();
  if (!tokensBungie) throw new Error("Non connecté à Bungie.net - impossible d'obtenir un jeton DIM");

  const enCacheTexte = localStorage.getItem(CLE_STOCKAGE_TOKEN);
  if (enCacheTexte) {
    try {
      const enCache = JSON.parse(enCacheTexte) as Partial<TokenDimEnCache>;
      if (
        enCache.membershipId === tokensBungie.membership_id &&
        typeof enCache.token === "string" &&
        typeof enCache.expiresAt === "number" &&
        enCache.expiresAt - 60_000 > Date.now()
      ) {
        return enCache.token;
      }
    } catch {
      // Cache DIM corrompu : il sera régénéré ci-dessous.
    }
    localStorage.removeItem(CLE_STOCKAGE_TOKEN);
  }

  const cleDim = await obtenirCleDimApi();
  const accessTokenBungie = await obtenirAccessTokenValide();

  const reponse = await fetch(`${DIM_API_ROOT}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": cleDim },
    body: JSON.stringify({
      bungieAccessToken: accessTokenBungie,
      membershipId: tokensBungie.membership_id,
    }),
  });

  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => "");
    throw new Error(`Échange du jeton DIM échoué (${reponse.status})${corps ? ` : ${corps}` : ""}`);
  }

  const data = await reponse.json();
  // FR : nom exact du champ non confirmé par la doc (pas d'exemple de
  // réponse complet) - on essaie les noms les plus probables.
  // EN: exact field name not confirmed by the docs (no full response
  // example) - trying the most likely names.
  const token = data.accessToken ?? data.access_token ?? data.token;
  if (!token) {
    throw new Error(`Réponse DIM (auth/token) inattendue : ${JSON.stringify(data)}`);
  }

  const expiresEnSecondes = data.expiresIn ?? data.expires_in ?? 3600;
  localStorage.setItem(
    CLE_STOCKAGE_TOKEN,
    JSON.stringify({ token, expiresAt: Date.now() + expiresEnSecondes * 1000, membershipId: tokensBungie.membership_id })
  );
  return token;
}
