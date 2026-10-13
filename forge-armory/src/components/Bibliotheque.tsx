// FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) : cette page s'appelle maintenant « LEGENDARIUM » (ancienne « Bibliothèque », demande de l'utilisateur) ; le fichier et l'identifiant interne gardent l'ancien nom.
// FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - Bibliothèque, outil annexe de
// consultation du lore (demande de l'utilisateur). Étape 1 : la page existe
// et s'affiche via le sélecteur placé sous le bloc Connexion ; son contenu
// reste à construire. Périmètre prévu : toutes les légendes de Destiny 2
// (livres de lore, armes, armures, coques de Spectre, vaisseaux), puis à
// moyen/long terme le Grimoire de Destiny 1.
// Consignes déjà fixées par l'utilisateur pour la suite : armures rangées
// par classe sans jamais mélanger les classes (chaque set est une histoire
// indépendante), ordre de lecture casque → gants → torse → jambes → objet
// de classe, objets sans légende masqués par défaut, rééditions
// dédoublonnées, armures exotiques rangées par classe dans une section à
// part.
// Le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest »
// de la vue Build Analyzer : la Bibliothèque le reçoit tel quel et indique
// simplement s'il est prêt, puisque tout son contenu en dépendra.
// EN: ⚠️ ADDED - Library, a side tool for reading the lore. Step 1: the page
// exists and is reached through the selector under the Connection block;
// its content is still to be built. The Manifest is loaded by the Build
// Analyzer view's search block; the Library only reports whether it's ready.

import { Database } from "sql.js";

interface Props {
  db: Database | null;
}

export default function Bibliotheque({ db }: Props) {
  return (
    <div className="pilier-carte">
      <h3>
        <span>Legendarium</span>   {/* ⚠️ CHANGÉ (13/10/2026, v0.4.4) : s'appelait « Bibliothèque » */}
        <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#7d7a70" }}>en construction</span>
      </h3>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", maxWidth: "65ch" }}>
        Ici, vous pourrez lire les légendes de Destiny 2 : les livres de lore, et celles des armes, des armures,
        des coques de Spectre et des vaisseaux. Le Grimoire de Destiny 1 viendra plus tard.
      </p>
      <p style={{ margin: 0, fontSize: "0.8rem", color: db ? "#7fd88f" : "#e0c080" }}>
        {db
          ? "✅ Manifest chargé : le Legendarium aura tout ce qu'il lui faut."
          : "⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest »."}
      </p>
    </div>
  );
}
