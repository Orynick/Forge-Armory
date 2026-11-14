// FR : ⚠️ AJOUT (14/11/2026, chantier draft-avertissement-cache-web, demande de l'utilisateur) - AVERTISSEMENT « builds conservés dans le cache du navigateur » (version WEB uniquement). Sur le site (Netlify), les loadouts vivent dans le localStorage DU NAVIGATEUR : ils ne suivent pas le compte Bungie, et vider les données du site ou changer de navigateur les efface. Dans l'appli installée, ce même localStorage vit dans le dossier de données persistant de l'application (%APPDATA%) : aucun avertissement n'y est nécessaire. L'utilisateur peut cocher « Ne plus afficher » : le choix est mémorisé dans le localStorage (clé dédiée ci-dessous). Logique PURE, testable : le `web` et le stockage sont injectables.
// EN: ⚠️ ADDED - "builds kept in the browser cache" warning (WEB version only). Pure logic: web flag and storage are injectable; the "don't show again" choice is stored in localStorage.
/** FR : interface minimale du stockage (localStorage en vrai, objet factice dans les tests). / EN: minimal storage interface. */
export interface StockageSimple {
  getItem(cle: string): string | null;
  setItem(cle: string, valeur: string): void;
}

/** FR : clé du choix « ne plus afficher l'avertissement du cache web ». / EN: localStorage key of the "don't show again" choice. */
export const CLE_NE_PLUS_AFFICHER = "forge-armory-avertissement-cache-web";

/** FR : vrai si l'utilisateur a coché « Ne plus afficher ». Absent ou autre valeur que "1" : faux (l'avertissement revient — choix prudent). / EN: true when the user checked "don't show again"; anything else means false. */
export function lireNePlusAfficher(storage: StockageSimple | null): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(CLE_NE_PLUS_AFFICHER) === "1";
  } catch {
    return false; // FR : localStorage peut refuser (mode privé strict) : on affiche l'avertissement plutôt que de le masquer à tort. / EN: on failure, show the warning.
  }
}

/** FR : mémorise le choix («1» = ne plus afficher, «0» = réafficher). / EN: stores the choice. */
export function ecrireNePlusAfficher(nePlusAfficher: boolean, storage: StockageSimple | null): void {
  if (!storage) return;
  try {
    storage.setItem(CLE_NE_PLUS_AFFICHER, nePlusAfficher ? "1" : "0");
  } catch {
    // FR : localStorage refusé (mode privé strict) : le choix n'est pas mémorisé, l'avertissement réapparaîtra — sans bloquer l'interface. / EN: not persisted; the warning will show again.
  }
}

/** FR : l'avertissement s'affiche si, et seulement si : version WEB ET l'utilisateur n'a pas coché « Ne plus afficher ». / EN: shown only on the web version and when not dismissed. */
export function doitAfficherAvertissementCacheWeb(web: boolean, nePlusAfficher: boolean): boolean {
  return web && !nePlusAfficher;
}

/** FR : texte du bandeau, exposé pour les tests et la cohérence de la NOTICE. / EN: banner copy, exported for tests. */
export const TITRE_AVERTISSEMENT = "Builds conservés dans le cache de ce navigateur";
export const TEXTE_AVERTISSEMENT = `Vos sauvegardes ne suivent pas votre compte Bungie : elles vivent dans ce navigateur (Forge Armory v${__VERSION_APP__} en ligne). Vider les données du site ou changer de navigateur les effacerait. Pensez à l'export : JSON (réimportable ici ou dans l'application installée), texte, infographie (JPEG/PNG) ou PDF.`;
