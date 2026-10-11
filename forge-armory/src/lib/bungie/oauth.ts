import { BUNGIE_ROOT, bungieConfig } from "./config";

const STORAGE_KEY = "d2ba.bungie.tokens";
const OAUTH_STATE_KEY = "d2ba.bungie.oauthState";
let refreshPromise: Promise<TokenSet> | null = null;
let authGeneration = 0;

export interface TokenSet {
  access_token: string;
  /**
   * FR : ⚠️ OPTIONNEL depuis le 07/09/2026 - CORRECTIF de la vraie cause du
   * blocage de connexion. Une application Bungie déclarée en client PUBLIC
   * (par opposition à confidentiel) ne renvoie PAS de `refresh_token`. La
   * validation stricte introduite par l'audit exigeait pourtant ce champ :
   * les jetons pourtant valides étaient donc rejetés et effacés juste après
   * la connexion, rendant celle-ci impossible.
   * EN: ⚠️ OPTIONAL since 07/09/2026 - a Bungie app registered as a PUBLIC
   * client returns NO refresh token; the audit's strict validation required
   * it, so valid tokens were rejected and wiped right after login.
   */
  refresh_token?: string;
  expires_at: number; // timestamp ms
  membership_id: string;
}

/**
 * FR : ⚠️ AJOUT (06/09/2026) - CORRECTIF d'une régression introduite par
 * l'audit du 06/09 : la connexion Bungie ne partait plus du tout (signalé
 * par l'utilisateur, « ça ne dirige pas vers l'écran de Bungie »).
 *
 * L'audit avait ajouté `crypto.randomUUID()` et `sessionStorage.setItem()`
 * directement dans `redirigerVersAutorisation`, un chemin qui n'appelait
 * jusque-là AUCUNE API navigateur susceptible d'échouer. Or ces deux appels
 * peuvent lever une exception :
 *   - `crypto.randomUUID` n'existe pas hors contexte sécurisé (http sur une
 *     IP de réseau local) ni sur les navigateurs antérieurs à ~2021 ;
 *   - `sessionStorage` lève si le stockage est bloqué par les réglages de
 *     confidentialité ou si le quota est saturé.
 * Dans les deux cas l'exception survenait AVANT `window.location.href`, donc
 * le clic ne produisait rien du tout — aucune redirection, aucun message.
 *
 * Principe retenu : la protection anti-CSRF est un PLUS, elle ne doit jamais
 * empêcher de se connecter. Si l'état ne peut pas être généré ou stocké, on
 * repart sur le comportement d'avant l'audit (pas de `state`), en le
 * signalant en console. Le `state` reste envoyé et vérifié dans le cas
 * normal, qui est l'écrasante majorité des cas.
 *
 * EN: ⚠️ ADDED - FIX for a regression introduced by the 06/09 audit: Bungie
 * login stopped working entirely. The audit put `crypto.randomUUID()` and
 * `sessionStorage.setItem()` in a path that previously called no failure-
 * prone browser API; either can throw (non-secure context / old browser,
 * blocked or full storage), and the exception happened BEFORE the redirect,
 * so clicking did nothing at all. Principle: CSRF protection is a bonus, it
 * must never prevent logging in - if the state can't be created or stored,
 * fall back to the pre-audit behaviour and warn in the console.
 */
/**
 * FR : ⚠️ AJOUT (26/09/2026, audit externe) - mémoire de secours pour l'état
 * anti-CSRF. L'audit reprochait, à juste titre, que l'absence de
 * `sessionStorage` fasse retomber la connexion en mode SANS protection.
 *
 * Ce repli existait parce qu'un échec de stockage avait déjà rendu la
 * connexion impossible (06/09) : la protection ne doit jamais bloquer la
 * connexion. Mais on peut faire mieux que « pas de protection » : dans le
 * LOGICIEL installé, la page ne se recharge pas pendant la connexion (elle
 * se fait dans une fenêtre séparée), donc une simple variable suffit à
 * conserver l'état — et la vérification redevient stricte.
 *
 * Seul le mode navigateur, où la page est réellement quittée puis
 * rechargée, dépend encore de `sessionStorage`.
 *
 * EN: ⚠️ ADDED (external audit) - in-memory fallback for the CSRF state. The
 * audit rightly flagged that a missing `sessionStorage` silently dropped the
 * protection. That fallback existed because a storage failure had once made
 * login impossible. In the INSTALLED app the page is never reloaded during
 * login, so a plain variable preserves the state and the check stays strict.
 */
let etatEnMemoire: string | null = null;

function genererEtatOAuth(): string | null {
  try {
    let etat: string;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      etat = crypto.randomUUID();
    } else if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      // FR : repli sans `randomUUID` - suffisant pour un jeton anti-CSRF.
      // EN: fallback without `randomUUID` - sufficient for a CSRF token.
      etat = Array.from(crypto.getRandomValues(new Uint8Array(16)), (o) =>
        o.toString(16).padStart(2, "0")
      ).join("");
    } else {
      return null;
    }
    etatEnMemoire = etat;
    try {
      sessionStorage.setItem(OAUTH_STATE_KEY, etat);
    } catch {
      // FR : stockage refusé — en mode logiciel, la mémoire suffit (voir
      // ci-dessus) ; en mode navigateur, la vérification sera impossible.
      // EN: storage refused - memory is enough in the desktop app.
      if (!estBureau()) {
        console.warn("[oauth] sessionStorage indisponible : l'état anti-CSRF ne pourra pas être vérifié.");
      }
    }
    return etat;
  } catch (e) {
    console.warn(
      "[oauth] Impossible de générer/stocker l'état anti-CSRF — connexion lancée sans, comme avant l'audit du 06/09.",
      e
    );
    return null;
  }
}

/**
 * FR : ⚠️ AJOUT (24/09/2026) - construction de l'URL d'autorisation,
 * extraite pour être partagée par les DEUX modes de connexion : le
 * navigateur (redirection de la page) et le logiciel installé (fenêtre
 * dédiée). Une seule construction d'URL, donc aucun risque que les deux
 * modes divergent un jour sur un paramètre.
 * EN: ⚠️ ADDED - authorization URL building, extracted so BOTH login modes
 * (browser redirect and installed app window) share one implementation.
 */
function construireUrlAutorisation(): string {
  const state = genererEtatOAuth();
  const url = new URL(`${BUNGIE_ROOT}/en/OAuth/Authorize`);
  url.searchParams.set("client_id", bungieConfig.clientId);
  url.searchParams.set("response_type", "code");
  if (state) url.searchParams.set("state", state);
  if (bungieConfig.redirectUri) url.searchParams.set("redirect_uri", bungieConfig.redirectUri);
  return url.toString();
}

/** Étape 1 : redirige l'utilisateur vers la page d'autorisation Bungie */
export function redirigerVersAutorisation() {
  window.location.href = construireUrlAutorisation();
}

/**
 * FR : ⚠️ AJOUT (24/09/2026) - pont exposé par le logiciel installé
 * (Electron, `electron/preload.cjs`). Absent dans un navigateur : c'est ce
 * qui permet de distinguer les deux modes sans réglage à maintenir.
 * EN: ⚠️ ADDED - bridge exposed by the installed app; absent in a browser,
 * which is how the two modes are told apart.
 */
declare global {
  interface Window {
    appBureau?: {
      estBureau: true;
      connexionBungie: (urlAutorisation: string) => Promise<{ code: string | null; state: string | null }>;
      /** FR : ⚠️ AJOUT (v0.2.5) - export PNG/PDF d'une fiche de build (electron/main.cjs, « fiche:exporter »). / EN: PNG/PDF export of a build sheet. */
      exporterFiche: (html: string, format: "jpeg" | "png" | "pdf", nomFichier: string) => Promise<{ chemin?: string; annule?: boolean }>;
    };
  }
}

/** FR : vrai si l'appli tourne dans le logiciel installé, faux dans un navigateur. */
export function estBureau(): boolean {
  return typeof window !== "undefined" && window.appBureau?.estBureau === true;
}

/**
 * FR : ⚠️ AJOUT (24/09/2026) - connexion depuis le logiciel installé.
 * Bungie renvoie vers `https://127.0.0.1:5173/auth/callback`, une adresse
 * qui n'existe pas dans un logiciel (pas de serveur web) : le processus
 * principal INTERCEPTE cette redirection avant tout chargement et en
 * extrait le code. L'échange du code contre les jetons se fait ensuite
 * exactement comme dans le navigateur, par la même fonction.
 * EN: ⚠️ ADDED - login from the installed app. The main process intercepts
 * the redirect before it loads and extracts the code; the token exchange
 * then uses the very same function as the browser flow.
 */
export async function connecterViaBureau(): Promise<void> {
  if (!window.appBureau) throw new Error("Connexion bureau indisponible : le pont Electron n'est pas chargé.");
  const { code, state } = await window.appBureau.connexionBungie(construireUrlAutorisation());
  if (!code) throw new Error("Bungie n'a pas renvoyé de code d'autorisation.");
  if (!validerEtatOAuth(state)) throw new Error("État OAuth invalide ou expiré. Relancez la connexion.");
  await echangerCodeContreTokens(code);
}

/**
 * FR : ⚠️ CHANGÉ (06/09/2026) - ne bloque plus la connexion quand AUCUN état
 * n'a pu être stocké au départ (voir `genererEtatOAuth`). On ne peut alors
 * rien vérifier : on laisse passer, exactement comme avant l'audit, plutôt
 * que de refuser une connexion parfaitement légitime. En revanche, si un
 * état a bien été stocké, il DOIT correspondre — c'est là que la protection
 * opère réellement.
 * EN: ⚠️ CHANGED - no longer blocks login when NO state could be stored in
 * the first place: nothing can be verified, so we allow it through exactly
 * as before the audit rather than rejecting a perfectly legitimate login.
 * When a state WAS stored, it must match - that's where the protection
 * actually applies.
 */
export function validerEtatOAuth(stateRetour: string | null): boolean {
  let attendu: string | null = etatEnMemoire;
  try {
    attendu = sessionStorage.getItem(OAUTH_STATE_KEY) ?? attendu;
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  } catch {
    /* FR : stockage inaccessible : on s'en remet à la mémoire ci-dessus. */
  }
  etatEnMemoire = null;

  // FR : ⚠️ DURCI (26/09/2026, audit externe) - dans le logiciel installé, la
  // page n'est jamais rechargée pendant la connexion : un état a donc
  // forcément été conservé en mémoire. Son absence est anormale, et la
  // vérification échoue franchement au lieu de laisser passer.
  // EN: ⚠️ HARDENED (external audit) - in the installed app the page is never
  // reloaded during login, so a state must exist; its absence is abnormal and
  // now fails closed instead of passing.
  if (!attendu) return !estBureau();
  return Boolean(stateRetour && attendu === stateRetour);
}

/** Étape 2 : à appeler sur la page de callback (?code=...) pour échanger le code contre des tokens */
export async function echangerCodeContreTokens(code: string): Promise<TokenSet> {
  const generation = ++authGeneration;
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
    // FR : ⚠️ Bungie renvoie un corps JSON avec le détail de l'erreur
    // (ex: "AuthorizationCodeInvalid" si le code a déjà été utilisé ou a
    // expiré) - se contenter du code HTTP (400) masquait cette info utile
    // au diagnostic. Trouvé lors du débogage réel du 02/08/2026.
    // EN: ⚠️ Bungie returns a JSON body with the error detail (e.g.
    // "AuthorizationCodeInvalid" if the code was already used or expired)
    // - settling for the HTTP status (400) hid this useful diagnostic
    // info. Found while debugging a real connection issue on 2026-08-02.
    let detail = "";
    try {
      const corpsErreur = await reponse.json();
      detail = corpsErreur.error_description || corpsErreur.error || corpsErreur.Message || "";
    } catch {
      // corps non-JSON ou vide, on garde juste le code HTTP
    }
    throw new Error(
      `Échange de code OAuth échoué (${reponse.status})${detail ? ` : ${detail}` : ""}`
    );
  }

  const data = await reponse.json();
  const tokens: TokenSet = {
    access_token: data.access_token,
    refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : undefined,
    expires_at: Date.now() + data.expires_in * 1000,
    membership_id: data.membership_id,
  };

  if (generation !== authGeneration) throw new Error("Session Bungie modifiée pendant l'authentification.");
  sauvegarderTokens(tokens);
  return tokens;
}

export async function rafraichirTokens(): Promise<TokenSet> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = rafraichirTokensInterne();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function rafraichirTokensInterne(): Promise<TokenSet> {
  const generation = authGeneration;
  const actuels = lireTokens();
  if (!actuels) throw new Error("Aucun token à rafraîchir, reconnexion nécessaire");
  // FR : ⚠️ AJOUT (07/09/2026) - un client PUBLIC ne reçoit pas de
  // `refresh_token` : inutile d'appeler Bungie pour se voir refuser. On
  // annonce clairement qu'il faut se reconnecter, plutôt que de laisser
  // remonter une erreur HTTP opaque.
  // EN: ⚠️ ADDED - a PUBLIC client gets no refresh token; say so clearly
  // instead of surfacing an opaque HTTP error.
  // FR : ⚠️ CHANGÉ (24/09/2026) - erreur DÉDIÉE (voir `SessionExpiree`)
  // au lieu d'un message technique : l'interface peut la reconnaître de
  // façon fiable et proposer la reconnexion.
  // EN: ⚠️ CHANGED - dedicated error instead of a technical message.
  if (!actuels.refresh_token) {
    // FR : ⚠️ AJOUT (30/09/2026, v0.3.0) - prévenir l'interface dès qu'une
    // action bute sur l'expiration, où qu'elle ait été lancée (équiper,
    // recharger l'inventaire...) : le bloc de connexion affiche alors la
    // bannière, au lieu de rester sur « connecté » sous un message d'erreur.
    // EN: ⚠️ ADDED - tell the UI as soon as any action hits the expiry.
    signalerSessionExpiree();
    throw new SessionExpiree();
  }

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
  if (generation !== authGeneration) throw new Error("Session Bungie modifiée pendant le rafraîchissement du token.");
  sauvegarderTokens(tokens);
  return tokens;
}

export function lireTokens(): TokenSet | null {
  try {
    const brut = localStorage.getItem(STORAGE_KEY);
    if (!brut) return null;
    const tokens = JSON.parse(brut) as Partial<TokenSet>;
    if (
      typeof tokens.access_token !== "string" ||
      // FR : ⚠️ RETIRÉ (07/09/2026) - `refresh_token` n'est PLUS exigé ici.
      // C'était la cause réelle de l'impossibilité de se connecter : sur un
      // client public, ce champ est absent, donc des jetons parfaitement
      // valides étaient jugés corrompus puis effacés juste après la
      // connexion réussie.
      // EN: ⚠️ REMOVED - `refresh_token` is NO LONGER required here; it is
      // absent on a public client, so valid tokens were wrongly wiped.
      typeof tokens.expires_at !== "number" ||
      typeof tokens.membership_id !== "string"
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return tokens as TokenSet;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function sauvegarderTokens(tokens: TokenSet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function deconnecter() {
  authGeneration += 1;
  localStorage.removeItem(STORAGE_KEY);
}

/** Renvoie un access_token valide, en rafraîchissant si besoin (marge de 60s) */
/**
 * FR : ⚠️ AJOUT (24/09/2026) - erreur DÉDIÉE à l'expiration de session,
 * pour que l'interface la reconnaisse de façon fiable (`instanceof`) au
 * lieu de lire le texte d'un message, qui casserait à la moindre
 * reformulation. Son message est directement affichable à l'utilisateur.
 * EN: ⚠️ ADDED - DEDICATED error for session expiry, so the UI can detect
 * it reliably via `instanceof` rather than string-matching a message.
 */
/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.3.0) - événement émis quand la session Bungie
 * est constatée expirée en cours d'usage. Écouté par le tableau de bord
 * (bloc de connexion). Sans navigateur (tests), ne fait rien.
 * EN: ⚠️ ADDED - event emitted when the session is found expired during use.
 */
export const EVENEMENT_SESSION_EXPIREE = "d2:session-expiree";
export function signalerSessionExpiree(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE));
}

export class SessionExpiree extends Error {
  constructor() {
    super("Votre session Bungie a expiré. Reconnectez-vous pour continuer.");
    this.name = "SessionExpiree";
  }
}

/**
 * FR : ⚠️ AJOUT (24/09/2026) - état réel de la session, à la place du
 * simple « des jetons existent-ils ? » utilisé jusqu'ici par l'interface.
 *
 * Le problème corrigé : l'appli affichait « ✅ connecté » tant que des
 * jetons existaient dans le navigateur, même périmés. Chaque action
 * échouait alors avec un message technique, sans que le bouton de
 * connexion ne réapparaisse — il fallait deviner qu'il fallait d'abord
 * cliquer sur « Se déconnecter ».
 *
 * L'application Bungie étant un client PUBLIC, elle ne reçoit pas de jeton
 * de rafraîchissement : une session expirée est définitivement perdue, la
 * seule issue est de se reconnecter. D'où les 3 états distincts.
 *
 * EN: ⚠️ ADDED - real session state, replacing the plain "do tokens
 * exist?" check. The app used to show "connected" with expired tokens,
 * then fail on every action without offering a way back. As a PUBLIC
 * client there is no refresh token, so an expired session is
 * unrecoverable: reconnecting is the only way.
 */
export function etatSession(): "absente" | "valide" | "expiree" {
  const tokens = lireTokens();
  if (!tokens) return "absente";
  // FR : même marge de 60 s que `obtenirAccessTokenValide`, pour ne pas
  // afficher « connecté » sur un jeton qui expirera pendant l'appel.
  // EN: same 60 s margin as `obtenirAccessTokenValide`.
  if (tokens.expires_at - 60_000 > Date.now()) return "valide";
  return tokens.refresh_token ? "valide" : "expiree"; // rafraîchissable = encore utilisable
}

/**
 * FR : ⚠️ AJOUT (24/09/2026) - OUTIL DE TEST (mode dev) : force l'expiration
 * de la session en cours, sans attendre l'heure réelle. Sans lui,
 * vérifier le comportement d'expiration demanderait de laisser l'appli
 * ouverte ~1 h. Ne touche qu'à la date d'expiration stockée localement :
 * aucun appel réseau, rien de modifié côté Bungie.
 * EN: ⚠️ ADDED - DEV TEST TOOL: forces the current session to expire
 * without waiting ~1 h. Only rewrites the locally stored expiry date.
 */
export function expirerSessionPourTest(): boolean {
  const tokens = lireTokens();
  if (!tokens) return false;
  sauvegarderTokens({ ...tokens, expires_at: Date.now() - 1000, refresh_token: undefined });
  return true;
}

export async function obtenirAccessTokenValide(): Promise<string> {
  const tokens = lireTokens();
  if (!tokens) throw new Error("Non connecté à Bungie.net");
  if (tokens.expires_at - 60_000 > Date.now()) return tokens.access_token;
  const rafraichi = await rafraichirTokens();
  return rafraichi.access_token;
}
