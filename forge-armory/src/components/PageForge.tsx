// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - page de l'onglet « FORGE » (entre Load-outs et Bibliothèque, demande de l'utilisateur). Étape 1 : la page existe et le bouton (logo validé) est en place ; le CONTENU reste à construire.
// Périmètre prévu (fichier « Retours et ajouts du 12/10 ») : (1) toutes les armes et armures du jeu avec leurs rolls de perks possibles, SANS les perks inutiles (cosmétiques) ; (2) toutes les armes et armures POSSÉDÉES, avec les rolls
// possibles, le choix des perks actifs de l'arme et du mod d'arme. Même présentation que la Bibliothèque, elle aussi en construction : le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest » de la vue Build Analyzer.
// EN: ⚠️ ADDED - page of the new FORGE tab (between Load-outs and Library). Step 1: page and button exist; the content is still to be built.

import { Database } from "sql.js";
import { urlVisuel } from "../lib/visuelsForge";

interface Props {
  db: Database | null;
}

export default function PageForge({ db }: Props) {
  return (
    <div className="pilier-carte">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <img src={urlVisuel("icones.forge")} alt="" height={28} width={28} draggable={false} />
          Forge
        </span>
        <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#7d7a70" }}>en construction</span>
      </h3>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", maxWidth: "65ch" }}>Ici, vous pourrez :</p>
      <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.2rem", fontSize: "0.9rem", maxWidth: "65ch" }}>
        <li>parcourir toutes les armes et armures du jeu, avec leurs rolls de perks possibles (sans les perks inutiles) ;</li>
        <li>afficher vos armes et armures possédées, voir leurs rolls possibles, et choisir les perks actifs de l'arme ainsi que son mod.</li>
      </ul>
      <p style={{ margin: 0, fontSize: "0.8rem", color: db ? "#7fd88f" : "#e0c080" }}>
        {db
          ? "✅ Manifest chargé : la Forge aura tout ce qu'il lui faut."
          : "⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest »."}
      </p>
    </div>
  );
}
