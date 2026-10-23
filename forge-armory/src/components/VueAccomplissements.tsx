// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « ACCOMPLISSEMENTS » du compte, en REMPLACEMENT du tiroir latéral : le bouton « Accomplissements » du bloc Connexion ouvre désormais cette page (le bloc Connexion et le sélecteur de vues restent affichés). ⚠️ Cette page N'EST PAS un onglet du sélecteur de vues (retour utilisateur : « les boutons apparaissent en double »). Le tiroir « Solo sans mourir » du Build Analyzer est CONSERVÉ tel quel (état interne, plus de navigation croisée).
// ⚠️ CHANGÉ (22/10/2026, retour utilisateur) : « Accomplissement ne doit pas afficher la Vitrine Solo sans mourir : elle affichera plus tard tous les triomphes obtenus et à obtenir. » — la vitrine `VitrineSoloFlawless` est RETIRÉE de cette page (elle reste UNIQUEMENT dans le tiroir « Solo sans mourir » du Build Analyzer, `PanneauTriomphes`). La page affiche un emplacement réservé : c'est la page dédiée aux Triomphes du compte (triomphes obtenus et à obtenir), à venir.
// EN: ⚠️ ADDED - the account "Accomplishments" PAGE (view-selector tab), replacing the lateral drawer. CHANGED - the "Solo Flawless" showcase is removed from this page (it stays only in the drawer); the page shows a placeholder for the upcoming account Triumphs.

import IconeCrane from "./IconeCrane";

export default function VueAccomplissements() {
  return (
    <div className="pilier-carte" role="region" aria-label="Accomplissements">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <IconeCrane taille={18} />
          Accomplissements
        </span>
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#b7b3a8", margin: "0 0 0.75rem" }}>
        Vos Triomphes de compte.
      </p>
      {/* FR : ⚠️ CHANGÉ (22/10/2026, retour utilisateur) - plus de vitrine « Solo sans mourir » ici (elle reste dans le tiroir du Build Analyzer) : la page affichera plus tard tous les triomphes obtenus et à obtenir. / EN: placeholder for the upcoming account Triumphs. */}
      <p style={{ fontSize: "0.85rem", color: "#7d7a70", margin: 0 }}>
        🚧 Bientôt : tous vos Triomphes de compte — obtenus et à obtenir.
      </p>
    </div>
  );
}
