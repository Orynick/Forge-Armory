// FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - FAUX module d'authentification pour les tests d'interface : un jeton fixe, sans réseau ; `window.__bungie.sessionExpiree = true` simule une session expirée. EN: ⚠️ ADDED - fake auth module for UI tests.
export const EVENEMENT_SESSION_EXPIREE = "forge:session-expiree";
export function signalerSessionExpiree(): void { window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE)); }
export class SessionExpiree extends Error {
  constructor() { super("Votre session Bungie a expiré. Reconnectez-vous pour continuer."); this.name = "SessionExpiree"; }
}
export async function obtenirAccessTokenValide(): Promise<string> {
  if ((window as unknown as { __bungie?: { sessionExpiree?: boolean } }).__bungie?.sessionExpiree) throw new SessionExpiree();
  return "jeton-de-test";
}
