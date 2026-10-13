// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) puis ⚠️ CHANGÉ (13/10/2026, v0.4.3) - page de l'onglet « FORGE » (entre Load-outs et Bibliothèque). Deux vues, calquées sur l'organisation du jeu (spécification du 12/10/2026, §3) : « Collection » (tout ce qui existe dans le jeu : ARMES disponibles depuis la 0.4.3, armures à venir) et « Inventaire » (les objets possédés : sélection des perks, 0.4.4).
// Les deux panneaux restent MONTÉS (le panneau inactif est seulement caché) : changer de vue ne fait perdre ni les filtres ni la recherche. Le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest » de Build Analyzer.
// EN: ⚠️ ADDED then CHANGED - Forge tab page with two views like the game: Collection (weapons since 0.4.3) and Inventory (weapons, simulation, since 0.4.6). Panels stay mounted so no state is lost.
import { useState } from "react";
import { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import CollectionArmes from "./CollectionArmes";
import InventaireArmes from "./InventaireArmes";   // ⚠️ AJOUT (13/10/2026, v0.4.6)
import { BoutonSousMenu } from "./SelecteurVues";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : boutons stylisés des sous-menus

interface Props {
  db: Database | null;
  membership?: DestinyMembership | null;
}

export default function PageForge({ db, membership = null }: Props) {
  const [vue, setVue] = useState<"collection" | "inventaire">("collection");
  return (
    <div className="pilier-carte" role="region" aria-label="Forge">
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4), demande de l'utilisateur en cours de test : le TITRE « Forge » (icône et mot) est retiré de la page : inutile ici, l'onglet « Forge » du sélecteur juste au-dessus porte déjà ce nom. La page garde son NOM pour les lecteurs d'écran (région `aria-label="Forge"`) ; la note grise (périmètre de la Forge) reste, alignée à droite. / EN: ⚠️ CHANGED - the "Forge" title (icon and word) is removed from the page (the selector tab above already says it); the region keeps its accessible name; the grey note stays. */}
      <p data-forge-note="" style={{ margin: "0 0 0.6rem", fontSize: "0.8rem", color: "#7d7a70", textAlign: "right" }}>armes : consultation et simulation locale · armures : à venir</p>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) - les deux onglets en texte sont remplacés par les BOUTONS STYLISÉS (demande de l'utilisateur, après la validation de la 0.4.3) : « Collection » (archive de visuels v4) et « Inventaire » (bouton au format du sélecteur, option 2). Même rôle d'onglet et mêmes noms accessibles qu'avant. / EN: ⚠️ CHANGED - the two text tabs become the stylised buttons. */}
      <div role="tablist" aria-label="Vues de la Forge" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.75rem", marginBottom: "0.8rem" }}>
        <BoutonSousMenu identifiant="collection" libelle="Collection" actif={vue === "collection"} onClick={() => setVue("collection")} />
        <BoutonSousMenu identifiant="inventaire" libelle="Inventaire" actif={vue === "inventaire"} onClick={() => setVue("inventaire")} />
      </div>
      <div role="tabpanel" aria-label="Collection" hidden={vue !== "collection"}>
        <CollectionArmes db={db} membership={membership} />
      </div>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.6) - la vue Inventaire existe : tes armes possédées, leur roll réel et la simulation locale des perks et du mod (voir `InventaireArmes.tsx`). Le panneau reste MONTÉ (caché quand on est sur « Collection ») : l'inventaire chargé, la recherche et la fenêtre ouverte ne sont pas perdus en changeant de vue. / EN: ⚠️ CHANGED - the Inventory view now exists. */}
      <div role="tabpanel" aria-label="Inventaire" hidden={vue !== "inventaire"}>
        <InventaireArmes db={db} membership={membership} />
      </div>
    </div>
  );
}
