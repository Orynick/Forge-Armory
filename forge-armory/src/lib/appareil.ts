// FR : ⚠️ AJOUT (05/11/2026, spec mobile-phase-0 §2.4) - DÉTECTION « TÉLÉPHONE ».
// Sur un téléphone, le Manifest est chargé en FRANÇAIS SEUL (l'anglais,
// ~100 Mo de plus en mémoire, ne sert qu'à la recherche par nom anglais :
// voir src/lib/manifest/search.ts). La détection vit dans un fichier
// SÉPARÉ, sans interface, pour servir à la fois au Manifest (démarrage) et
// au diagnostic mobile, et être testée seule (tests/logique/appareil.test.ts).
// RÈGLE (spec §2.4) :
//   1. le navigateur se déclare « mobile » (Chrome sur Android le fait ;
//      Firefox sur Android contient « Mobile » dans son userAgent) ;
//   2. à défaut : écran tactile comme pointeur principal ET largeur
//      d'écran ≤ 900 px (une tablette en mode bureau n'est pas concernée,
//      un PC tactile large non plus).
// Un PC (site ou logiciel installé) n'est jamais concerné.
// EN: ⚠️ ADDED - "phone" detection: on a phone the Manifest loads in French
// only. Mobile UA, else touch-primary pointer AND width ≤ 900px.

/** FR : décision pure, à partir de trois signaux (testable sans navigateur). / EN: pure decision from three signals. */
export function estTelephoneDepuis(mobileDeclare: boolean, tactilePrincipal: boolean, largeurEcran: number): boolean {
  if (mobileDeclare) return true;
  return tactilePrincipal && largeurEcran <= 900;
}

/** FR : largeur maximale (px) pour le repli « écran tactile étroit ». / EN: max width for the touch fallback. */
export const LARGEUR_ECRAN_MAX_TACTILE = 900;

/**
 * FR : l'appli tourne-t-elle sur un TÉLÉPHONE ? Lecture immédiate des
 * signaux du navigateur (aucun appel réseau, aucune API susceptible
 * d'échouer) ; hors navigateur (Node, tests sans window) : faux.
 * EN: is the app running on a phone? Immediate browser signals; false
 * outside a browser.
 */
export function estTelephone(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  // FR : 1. déclaration « mobile » : userAgentData (Chrome), sinon l'userAgent.
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  const mobileDeclare =
    typeof nav.userAgentData?.mobile === "boolean"
      ? nav.userAgentData.mobile
      : /Android|iPhone|iPod|Mobile/i.test(nav.userAgent);
  // FR : 2. repli : pointeur principal tactile (pas de souris) et écran étroit.
  const tactilePrincipal = (() => {
    try {
      return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    } catch {
      return false;
    }
  })();
  return estTelephoneDepuis(mobileDeclare, tactilePrincipal, window.innerWidth);
}

/** FR : largeur actuelle de la fenêtre (diagnostic mobile §2.5) ; hors navigateur : 0. / EN: current window width; 0 outside a browser. */
export function largeurEcran(): number {
  return typeof window === "undefined" ? 0 : window.innerWidth;
}
