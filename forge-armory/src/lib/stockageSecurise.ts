// FR : ⛔ AJOUT (21/10/2026, branche draft-sec) - STOCKAGE CHIFFRÉ DES SECRETS.
//
// But : ne plus écrire en clair dans localStorage les valeurs sensibles (jetons
// OAuth Bungie, jeton DIM). Dans le logiciel installé, ces valeurs passent par
// `safeStorage` d'Electron (chiffrées avec les clés de l'OS : DPAPI sous
// Windows, Trousseau sous macOS, kwallet/libsecret sous Linux), via le pont
// `window.appBureau.stockageSecurise` exposé par `electron/preload.cjs`.
//
// Trois cas de figure :
//   1. Logiciel installé + chiffrement OS disponible : lecture/écriture via
//      safeStorage. Une valeur encore en clair dans localStorage (session
//      ouverte avant cette version) est MIGRÉE vers le stockage chiffré puis
//      supprimée de localStorage.
//   2. Logiciel installé + chiffrement OS INDISPONIBLE (Linux sans
//      kwallet/libsecret) : repli sur localStorage, avec un avertissement en
//      console. Mieux vaut un repli documenté que pas de connexion du tout.
//   3. Navigateur (pas de pont Electron) : localStorage, comme avant.
//
// API volontairement ASYNCHRONE pour lire/ecrire/effacer, et SYNCHRONE pour
// `lireEnCache` : les consommateurs historiques (`lireTokens`, `etatSession`)
// sont synchrones (appelés au rendu React et dans des effets). Le cache
// mémoire est peuplé au démarrage par `initialiserStockageSecurise()`, lancé
// depuis `main.tsx` avant le premier rendu ; en attendant (ou si l'init
// échoue), `lireEnCache` retombe sur localStorage, donc le comportement ne
// change jamais de façon visible.
//
// EN: ENCRYPTED STORAGE OF SECRETS. Goal: stop writing sensitive values (Bungie
// OAuth tokens, DIM token) in cleartext in localStorage. In the installed app,
// these values go through Electron's `safeStorage` (encrypted with the OS
// keys: DPAPI on Windows, Keychain on macOS, kwallet/libsecret on Linux), via
// the `window.appBureau.stockageSecurise` bridge exposed by
// `electron/preload.cjs`.
//
// Three cases:
//   1. Installed app + OS encryption available: read/write via safeStorage. A
//      value still in cleartext in localStorage (a session opened before this
//      version) is MIGRATED to the encrypted storage then removed from
//      localStorage.
//   2. Installed app + OS encryption UNAVAILABLE (Linux without
//      kwallet/libsecret): fall back to localStorage, warning in the console.
//      A documented fallback is better than no login at all.
//   3. Browser (no Electron bridge): localStorage, as before.
//
// The API is deliberately ASYNCHRONOUS for read/write/erase, and SYNCHRONOUS
// for `lireEnCache`: the historical consumers (`lireTokens`, `etatSession`)
// are synchronous (called during React render and in effects). The in-memory
// cache is populated at startup by `initialiserStockageSecurise()`, launched
// from `main.tsx` before the first render; meanwhile (or if init fails),
// `lireEnCache` falls back to localStorage, so the visible behaviour never
// changes.

// FR : déclaration globale UNIQUE du pont `window.appBureau` (exposé par
// `electron/preload.cjs`). Centralisée ici : `oauth.ts` et les composants qui
// consomment le pont s'appuient sur cette déclaration. Absent dans un
// navigateur, d'où le `?` sur chaque membre.
// EN: SINGLE global declaration of the `window.appBureau` bridge (exposed by
// `electron/preload.cjs`). Centralized here: `oauth.ts` and the components
// consuming the bridge rely on this declaration. Absent in a browser, hence
// the `?` on every member.
declare global {
  interface Window {
    appBureau?: {
      estBureau: true;
      connexionBungie: (urlAutorisation: string) => Promise<{ code: string | null; state: string | null }>;
      exporterFiche: (html: string, format: "jpeg" | "png" | "pdf", nomFichier: string) => Promise<{ chemin?: string; annule?: boolean }>;
      stockageSecurise?: PontSecurise;
    };
  }
}

export interface PontSecurise {
  disponible: () => Promise<boolean>;
  lire: (cle: string) => Promise<string | null>;
  ecrire: (cle: string, valeur: string) => Promise<boolean>;
  effacer: (cle: string) => Promise<boolean>;
}

/** FR : les secrets gérés ici (liste fermée, pour la migration et le déverrouillage). / EN: the secrets managed here (closed list, for migration and warm-up). */
export const CLES_SECRETS = ["d2ba.bungie.tokens", "d2ba.dim.accessToken", "d2ba.dim.apiKey"] as const;

/** FR : préfixe des entrées chiffrées dans le coffre Electron. / EN: prefix of encrypted entries in the Electron vault. */
const PREFIXE_SECURISE = "sec:";

let pont: PontSecurise | null = null;
let chiffrementDisponible = false;
/** FR : cache mémoire (valeur en clair) alimenté par l'init et les écritures. / EN: in-memory cache (cleartext value) fed by init and writes. */
const cache = new Map<string, string>();
let initLancee = false;
let initTerminee: Promise<void> | null = null;

function obtenirPont(): PontSecurise | null {
  return typeof window !== "undefined" ? window.appBureau?.stockageSecurise ?? null : null;
}

/**
 * FR : peuple le cache mémoire depuis le stockage chiffré, et MIGRE au passage
 * toute valeur encore présente en clair dans localStorage (session ouverte
 * avant cette version) : écrite dans le coffre chiffré, puis supprimée de
 * localStorage. À appeler UNE fois au démarrage, avant le premier rendu.
 * Sans effet en navigateur ou si le chiffrement OS est indisponible.
 * EN: fills the in-memory cache from the encrypted storage, and MIGRATES any
 * value still in cleartext in localStorage (a session opened before this
 * version): written to the encrypted vault, then removed from localStorage.
 * Call ONCE at startup, before the first render. No-op in a browser or when
 * OS encryption is unavailable.
 */
export function initialiserStockageSecurise(): Promise<void> {
  if (initLancee) return initTerminee ?? Promise.resolve();
  initLancee = true;
  initTerminee = (async () => {
    pont = obtenirPont();
    if (!pont) return;
    try {
      chiffrementDisponible = await pont.disponible();
    } catch {
      chiffrementDisponible = false;
    }
    if (!chiffrementDisponible) {
      console.warn("[securite] chiffrement OS indisponible : repli sur localStorage pour les jetons.");
      return;
    }
    for (const cle of CLES_SECRETS) {
      try {
        const valeur = await pont.lire(PREFIXE_SECURISE + cle);
        if (typeof valeur === "string" && valeur.length > 0) {
          cache.set(cle, valeur);
          continue;
        }
      } catch {
        // coffre illisible : on tente la migration depuis localStorage ci-dessous
      }
      // FR : migration : une valeur en clair dans localStorage (session ouverte
      // avant cette version) est déplacée vers le coffre chiffré.
      // EN: migration: a cleartext value in localStorage (session opened before
      // this version) is moved into the encrypted vault.
      const enClair = localStorage.getItem(cle);
      if (enClair) {
        try {
          if (await pont.ecrire(PREFIXE_SECURISE + cle, enClair)) {
            cache.set(cle, enClair);
            localStorage.removeItem(cle);
          }
        } catch {
          // échec de migration : la valeur reste en localStorage, le cache ne
          // la connaît pas -> les écritures suivantes écraseront proprement.
        }
      }
    }
  })();
  return initTerminee;
}

/**
 * FR : lecture SYNCHRONE (cache mémoire, avec repli localStorage). Voir
 * `initialiserStockageSecurise` pour le contrat complet.
 * EN: SYNCHRONOUS read (in-memory cache, with localStorage fallback). See
 * `initialiserStockageSecurise` for the full contract.
 */
export function lireEnCache(cle: string): string | null {
  const enCache = cache.get(cle);
  if (enCache !== undefined) return enCache;
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

/** FR : écriture d'un secret (chiffrée si possible, localStorage sinon). / EN: write a secret (encrypted when possible, localStorage otherwise). */
export async function ecrireSecret(cle: string, valeur: string): Promise<void> {
  cache.set(cle, valeur);
  if (pont && chiffrementDisponible) {
    try {
      if (await pont.ecrire(PREFIXE_SECURISE + cle, valeur)) {
        try {
          localStorage.removeItem(cle);
        } catch {
          // localStorage indisponible : le cache mémoire suffit
        }
        return;
      }
    } catch {
      // échec du coffre : on retombe sur localStorage ci-dessous
    }
  }
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    // stockage indisponible : la valeur reste en cache mémoire pour la session
  }
}

/** FR : efface un secret (des deux stockages, par sûreté). / EN: erase a secret (from both storages, for safety). */
export async function effacerSecret(cle: string): Promise<void> {
  cache.delete(cle);
  try {
    localStorage.removeItem(cle);
  } catch {
    // idem
  }
  if (pont && chiffrementDisponible) {
    try {
      await pont.effacer(PREFIXE_SECURISE + cle);
    } catch {
      // le coffre sera nettoyé à la prochaine écriture
    }
  }
}
