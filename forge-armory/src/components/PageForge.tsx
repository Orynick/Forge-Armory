// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) puis ⚠️ CHANGÉ (13/10/2026, v0.4.3) - page de l'onglet « FORGE » (entre Load-outs et Bibliothèque). Deux vues, calquées sur l'organisation du jeu (spécification du 12/10/2026, §3) : « Collection » (tout ce qui existe dans le jeu : ARMES disponibles depuis la 0.4.3, armures à venir) et « Inventaire » (les objets possédés : sélection des perks, 0.4.4).
// Les deux panneaux restent MONTÉS (le panneau inactif est seulement caché) : changer de vue ne fait perdre ni les filtres ni la recherche. Le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest » de Build Analyzer.
// EN: ⚠️ ADDED then CHANGED - Forge tab page with two views like the game: Collection (weapons since 0.4.3) and Inventory (next version). Panels stay mounted so no state is lost.
import { useState } from "react";
import { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import { urlVisuel } from "../lib/visuelsForge";
import CollectionArmes from "./CollectionArmes";
import { BoutonSousMenu } from "./SelecteurVues";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : boutons stylisés des sous-menus

interface Props {
  db: Database | null;
  membership?: DestinyMembership | null;
}

export default function PageForge({ db, membership = null }: Props) {
  const [vue, setVue] = useState<"collection" | "inventaire">("collection");
  return (
    <div className="pilier-carte">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <img src={urlVisuel("icones.forge")} alt="" height={28} width={28} draggable={false} />
          Forge
        </span>
        <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#7d7a70" }}>armes : consultation · armures et sélection des perks : à venir</span>
      </h3>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) - les deux onglets en texte sont remplacés par les BOUTONS STYLISÉS (demande de l'utilisateur, après la validation de la 0.4.3) : « Collection » (archive de visuels v4) et « Inventaire » (bouton au format du sélecteur, option 2). Même rôle d'onglet et mêmes noms accessibles qu'avant. / EN: ⚠️ CHANGED - the two text tabs become the stylised buttons. */}
      <div role="tablist" aria-label="Vues de la Forge" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.75rem", marginBottom: "0.8rem" }}>
        <BoutonSousMenu identifiant="collection" libelle="Collection" actif={vue === "collection"} onClick={() => setVue("collection")} />
        <BoutonSousMenu identifiant="inventaire" libelle="Inventaire" actif={vue === "inventaire"} onClick={() => setVue("inventaire")} />
      </div>
      <div role="tabpanel" aria-label="Collection" hidden={vue !== "collection"}>
        <CollectionArmes db={db} membership={membership} />
      </div>
      <div role="tabpanel" aria-label="Inventaire" hidden={vue !== "inventaire"}>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", maxWidth: "65ch" }}>
          Ici, vous pourrez afficher vos armes possédées (personnages et Coffre), voir leurs rolls possibles et choisir les perks actifs ainsi que le mod d'arme : <strong>prévu pour la prochaine version</strong>.
        </p>
      </div>
    </div>
  );
}
