import { BUNGIE_ROOT, bungieConfig } from "./config";

const STORAGE_KEY = "d2ba.bungie.tokens";

export interface TokenSet {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp ms
  membership_id: string;
}

/** Étape 1 : redirige l'utilisateur vers la page d'autorisation Bungie */
export function redirigerVersAutorisation() {
  const url = new URL(`${BUNGIE_ROOT}/en/OAuth/Authorize`);
  url.searchParams.set("client_id", bungieConfig.clientId);
  url.searchParams.set("response_type", "code");
  window.location.href = url.toString();
}

/** Étape 2 : à appeler sur la page de callback (?code=...) pour échanger le code contre des tokens */
export async function echangerCodeContreTokens(code: string): Promise<TokenSet> {
  const reponse = await fetch(`${BUNGIE_ROOT}/Platform/App/OAuth/Token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-API-Key": bungieConfig.apiKey,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: bungieConfig.clientId,
    }),
  });

  if (!reponse.ok) {
    throw new Error(`Échange de code OAuth échoué (${reponse.status})`);
  }

  const data = await reponse.json();
  const tokens: TokenSet = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    membership_id: data.membership_id,
  };

  sauvegarderTokens(tokens);
  return tokens;
}

export async function rafraichirTokens(): Promise<TokenSet> {
  const actuels = lireTokens();
  if (!actuels) throw new Error("Aucun token à rafraîchir, reconnexion nécessaire");

  const reponse = await fetch(`${BUNGIE_ROOT}/Platform/App/OAuth/Token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-API-Key": bungieConfig.apiKey,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: actuels.refresh_token,
      client_id: bungieConfig.clientId,
    }),
  });

  if (!reponse.ok) throw new Error(`Rafraîchissement du token échoué (${reponse.status})`);

  const data = await reponse.json();
  const tokens: TokenSet = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? actuels.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    membership_id: data.membership_id ?? actuels.membership_id,
  };
  sauvegarderTokens(tokens);
  return tokens;
}

export function lireTokens(): TokenSet | null {
  const brut = localStorage.getItem(STORAGE_KEY);
  return brut ? JSON.parse(brut) : null;
}

function sauvegarderTokens(tokens: TokenSet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function deconnecter() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Renvoie un access_token valide, en rafraîchissant si besoin (marge de 60s) */
export async function obtenirAccessTokenValide(): Promise<string> {
  const tokens = lireTokens();
  if (!tokens) throw new Error("Non connecté à Bungie.net");
  if (tokens.expires_at - 60_000 > Date.now()) return tokens.access_token;
  const rafraichi = await rafraichirTokens();
  return rafraichi.access_token;
}
