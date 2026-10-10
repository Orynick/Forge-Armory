export const BUNGIE_ROOT = "https://www.bungie.net";
export const BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;

export const bungieConfig = {
  apiKey: import.meta.env.VITE_BUNGIE_API_KEY as string,
  clientId: import.meta.env.VITE_BUNGIE_CLIENT_ID as string,
  redirectUri: import.meta.env.VITE_BUNGIE_REDIRECT_URI as string,
};

export function verifierConfig() {
  const manquants = Object.entries(bungieConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (manquants.length > 0) {
    throw new Error(
      `Configuration Bungie incomplète, variable(s) manquante(s) dans .env.local : ${manquants.join(", ")}`
    );
  }
}
