import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { echangerCodeContreTokens } from "../lib/bungie/oauth";

export default function AuthCallbackPage() {
  const [erreur, setErreur] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setErreur("Code d'autorisation manquant dans l'URL.");
      return;
    }
    echangerCodeContreTokens(code)
      .then(() => navigate("/"))
      .catch((e) => setErreur(e.message));
  }, [navigate]);

  if (erreur) return <p>Connexion à Bungie.net impossible : {erreur}</p>;
  return <p>Connexion à Bungie.net en cours...</p>;
}
