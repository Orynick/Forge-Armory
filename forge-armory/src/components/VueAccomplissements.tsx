// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « ACCOMPLISSEMENTS » du compte (onglet du sélecteur de vues), en REMPLACEMENT du tiroir latéral : le bouton « Accomplissements » du bloc Connexion ouvre désormais cet onglet (le bloc Connexion et les onglets restent affichés). Le tiroir « Solo sans mourir » du Build Analyzer est CONSERVÉ tel quel (état interne, plus de navigation croisée).
// Contenu : la vitrine « Solo sans mourir » (les 11 donjons terminés en solo, sans mourir), reprise telle quelle de l'ancien tiroir via `VitrineSoloFlawless` — c'est la page dédiée aux Triomphes du compte. Lecture seule, aucune écriture, aucun lien avec le scoring. Sans profil chargé (non connecté), la vitrine affiche son message « Connectez-vous… ».
// EN: ⚠️ ADDED - the account "Accomplishments" PAGE (view-selector tab), replacing the lateral drawer: it shows the "Solo Flawless" showcase full-page, via VitrineSoloFlawless. Read-only.

import { Database } from "sql.js";
import VitrineSoloFlawless from "./VitrineSoloFlawless";
import IconeCrane from "./IconeCrane";

interface Props {
  /** FR : profil complet renvoyé par l'API (composant 900 inclus). null tant qu'il n'est pas chargé. / EN: full profile from the API (component 900 included). */
  profil: unknown | null;
  /** FR : nécessaire pour le diagnostic ponctuel de définition de triomphe (dev). / EN: needed for the one-off triumph definition diagnostic (dev). */
  db?: Database | null;
}

export default function VueAccomplissements({ profil, db }: Props) {
  return (
    <div className="pilier-carte" role="region" aria-label="Accomplissements">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <IconeCrane taille={18} />
          Accomplissements
        </span>
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#b7b3a8", margin: "0 0 0.75rem" }}>
        Vos Triomphes de compte — la vitrine « Solo sans mourir » (donjons terminés en solo, sans mourir).
      </p>
      <VitrineSoloFlawless profil={profil} db={db} />
    </div>
  );
}
