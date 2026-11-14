// FR : ⚠️ AJOUT (06/10/2026, v0.3.2) - réglage discret du MODE DIAGNOSTIC, dans le pied de page (voir lib/modeDiagnostic.ts) : active, aussi dans l'appli INSTALLÉE, les outils de diagnostic (contrôles des icônes
// d'artefact et des exotiques, lignes « [dev] » de la Recherche et de la Doctrine). En `npm run dev` le mode est toujours actif : le texte l'indique et le bouton n'existe pas.
// EN: ⚠️ ADDED - discreet footer switch for the diagnostic mode (also usable in the installed app); always on in `npm run dev`.

import { definirModeDiagnostic, useModeDiagnostic } from "../lib/modeDiagnostic";
import { estProprietaire } from "../lib/proprietaire";
import { lireTokens } from "../lib/bungie/oauth";

export default function InterrupteurModeDiagnostic() {
  // FR : ⚠️ CHANGÉ (06/11/2026, spec draft-netlify) - l'interrupteur n'est plus
  // masqué seulement sur le web : il n'est visible QUE pour le compte du
  // PROPRIÉTAIRE (Orynick), connecté - sur le site comme dans l'appli. En mode
  // développement (`npm run dev`), il reste affiché en permanence et montre
  // aussi l'ID du compte Bungie connecté, pour renseigner la constante.
  // EN: the switch is now visible ONLY for the signed-in owner's account,
  // on the website and in the installed app alike; in dev it always shows and
  // also displays the signed-in Bungie account ID.
  const proprietaire = estProprietaire();
  if (!import.meta.env.DEV && !proprietaire) return null;
  const actif = useModeDiagnostic();
  const idBungie = lireTokens()?.membership_id ?? "(non connecté)";
  return (
    <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "#5a5f6b", textAlign: "center" }} data-pied-diagnostic="">
      {import.meta.env.DEV ? (
        <>
          🔧 Outils de diagnostic : toujours actifs en développement — ID compte Bungie : {idBungie}
        </>
      ) : (
        <button
          type="button"
          onClick={() => definirModeDiagnostic(!actif)}
          aria-pressed={actif}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit", color: actif ? "#d6a95a" : "inherit", textDecoration: "underline dotted" }}
          title="Active ou désactive les outils de diagnostic (contrôles, lignes « [dev] ») ; sert à comprendre un problème"
        >
          🔧 Outils de diagnostic : {actif ? "activés (cliquer pour désactiver)" : "désactivés (cliquer pour activer)"}
        </button>
      )}
    </p>
  );
}
