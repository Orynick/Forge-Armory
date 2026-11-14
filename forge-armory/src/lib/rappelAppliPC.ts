// FR : ⚠️ AJOUT (08/11/2026, demande de l'utilisateur) - RAPPEL « Vous préférez l'application PC ? Télécharger pour Windows » en bas de la carte « Connexion à Bungie », sur le SITE seulement (forge-armory.orynick.fr). Logique PURE (sans interface), testable : la ligne s'affiche si, et seulement si, les QUATRE conditions sont réunies : (1) version WEB (`__WEB__`, vraie seulement dans le build Netlify) ; (2) PAS l'appli installée (`estBureau()` : pont Electron présent) ; (3) PAS un petit écran ou un appareil tactile (l'appli est pour PC) ; (4) un LIEN de téléchargement est renseigné, en `https://` (tout autre lien est refusé, par sécurité). Le lien vient de la variable d'environnement `VITE_LIEN_TELECHARGEMENT_PC` (réglable dans Netlify, sans toucher au code) ; vide ou absente : la ligne reste CACHÉE (décision de l'utilisateur : pas de bouton « bientôt » qui ne mène nulle part).
// EN: ⚠️ ADDED - "Prefer the PC app? Download for Windows" reminder at the bottom of the Bungie connection card, on the WEBSITE only. Pure logic: shown only if web build, not the installed app, not a small/touch screen, and an https download link is set (VITE_LIEN_TELECHARGEMENT_PC).

/** FR : le lien de téléchargement, lu dans la variable d'environnement au moment du build ; espaces retirés ; vide si absent. / EN: download link from the build-time env var; trimmed; empty if missing. */
export function lienTelechargementPC(env: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>): string {
  const v = env["VITE_LIEN_TELECHARGEMENT_PC"];
  return typeof v === "string" ? v.trim() : "";
}

/** FR : seul un lien `https://` est accepté (jamais `javascript:`, `http:`, `data:`…). / EN: only https links are accepted. */
export function lienTelechargementValide(lien: string): boolean {
  try { const u = new URL(lien); return u.protocol === "https:" && !!u.hostname; } catch { return false; }
}

export interface ConditionsRappelAppliPC { web: boolean; bureau: boolean; petitEcran: boolean; lien: string }

/** FR : vrai si la ligne doit s'afficher (les quatre conditions). / EN: true if the line must be shown. */
export function doitAfficherRappelAppliPC(c: ConditionsRappelAppliPC): boolean {
  return c.web && !c.bureau && !c.petitEcran && lienTelechargementValide(c.lien);
}

/** FR : requête média des « petits écrans » : largeur sous 900 px, OU appareil tactile sans souris (téléphone, tablette). / EN: small-screen media query. */
export const REQUETE_PETIT_ECRAN = "(max-width: 899px), (hover: none) and (pointer: coarse)";
