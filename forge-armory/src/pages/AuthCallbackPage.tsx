// FR : Page de callback OAuth - echange le code contre les tokens.
// ⚠️ BUG CORRIGE (02/08/2026, v1) : en mode developpement, React.StrictMode
// execute deux fois les effets (useEffect), provoquant un double echange du
// meme code d'autorisation (a usage unique cote Bungie) - corrige avec un
// garde-fou useRef.
// ⚠️ AMELIORATION (02/08/2026, v2) : si l'echange echoue et que la personne
// RAFRAICHIT cette page d'erreur (au lieu de repartir du bouton "Connexion
// Bungie.net"), l'URL contient encore le meme code deja consomme -> echec
// garanti a chaque rafraichissement. On nettoie maintenant l'URL (retire
// ?code=...) des que l'echange est tente, pour qu'un rafraichissement ne
// puisse plus renvoyer un vieux code.
// EN: OAuth callback page - exchanges the code for tokens.
// ⚠️ BUG FIXED (2026-08-02, v1): in dev mode, React.StrictMode runs effects
// twice, causing a double exchange of the same authorization code (single-
// use on Bungie's side) - fixed with a useRef guard.
// ⚠️ IMPROVEMENT (2026-08-02, v2): if the exchange fails and the person
// REFRESHES this error page (instead of restarting from the "Connexion
// Bungie.net" button), the URL still holds the same already-consumed code
// -> guaranteed failure on every refresh. We now clean the URL (remove
// ?code=...) as soon as the exchange is attempted, so a refresh can no
// longer resend a stale code.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { echangerCodeContreTokens, redirigerVersAutorisation, validerEtatOAuth } from "../lib/bungie/oauth";

export default function AuthCallbackPage() {
  const [erreur, setErreur] = useState<string | null>(null);
  const navigate = useNavigate();
  const dejaTente = useRef(false);

  useEffect(() => {
    if (dejaTente.current) return;
    dejaTente.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    // FR : on retire immédiatement le code de l'URL affichée (sans recharger
    // la page) - un F5 ensuite ne renverra plus jamais ce code déjà tenté.
    // EN: immediately strip the code from the displayed URL (without
    // reloading the page) - an F5 afterwards will never resend this
    // already-attempted code again.
    window.history.replaceState({}, "", "/auth/callback");

    if (!code) {
      setErreur("Code d'autorisation manquant dans l'URL.");
      return;
    }
    if (!validerEtatOAuth(state)) {
      setErreur("État OAuth invalide ou expiré. Relancez la connexion depuis l'application.");
      return;
    }
    echangerCodeContreTokens(code)
      .then(() => navigate("/"))
      .catch((e) => setErreur(e.message));
  }, [navigate]);

  if (erreur) {
    return (
      <div>
        <p>Connexion à Bungie.net impossible : {erreur}</p>
        <p>
          Le code d'autorisation utilisé ne fonctionne qu'une fois : ne rafraîchissez pas cette
          page, cliquez plutôt sur "Réessayer" ci-dessous pour repartir avec un code neuf.
        </p>
        <button onClick={redirigerVersAutorisation}>Réessayer</button>
      </div>
    );
  }
  return <p>Connexion à Bungie.net en cours...</p>;
}
