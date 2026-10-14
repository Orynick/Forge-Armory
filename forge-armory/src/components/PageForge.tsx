// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) puis ⚠️ CHANGÉ (13/10/2026, v0.4.3) - page de l'onglet « FORGE » (entre Load-outs et Bibliothèque). Deux vues, calquées sur l'organisation du jeu (spécification du 12/10/2026, §3) : « Collection » (tout ce qui existe dans le jeu : ARMES disponibles depuis la 0.4.3, armures à venir) et « Inventaire » (les objets possédés : sélection des perks, 0.4.4).
// Les deux panneaux restent MONTÉS (le panneau inactif est seulement caché) : changer de vue ne fait perdre ni les filtres ni la recherche. Le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest » de Build Analyzer.
// EN: ⚠️ ADDED then CHANGED - Forge tab page with two views like the game: Collection (weapons since 0.4.3) and Inventory (weapons, simulation, since 0.4.6). Panels stay mounted so no state is lost.
import { useEffect, useState } from "react";
import { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import CollectionArmes from "./CollectionArmes";
import InventaireArmes, { CibleForge } from "./InventaireArmes";   // ⚠️ AJOUT (13/10/2026, v0.4.6)
import type { GearPiece } from "../types/build";
import { BoutonSousMenu } from "./SelecteurVues";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : boutons stylisés des sous-menus

const LIBELLES_ORIGINE: Record<CibleForge["origine"], string> = { analyseur: "Build Analyzer", loadouts: "Load-outs", forge: "la Forge", bibliotheque: "Legendarium" };

interface Props {
  db: Database | null;
  membership?: DestinyMembership | null;
  /** FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - arme envoyée par un bouton « Forge » (fenêtres Détails) : la page passe sur « Inventaire » et l'ouvre. / EN: a weapon sent by a "Forge" button: the page switches to Inventory and opens it. */
  cible?: CibleForge | null;
  /** FR : retour à la vue d'origine (le Build Analyzer reste monté : rien n'est perdu). / EN: back to the originating view. */
  onRetour?: () => void;
  onAjouterAuBuild?: (piece: GearPiece) => void;
  idsDansBuild?: ReadonlySet<string>;
}

export default function PageForge({ db, membership = null, cible = null, onRetour, onAjouterAuBuild, idsDansBuild }: Props) {
  const [vue, setVue] = useState<"collection" | "inventaire">("collection");
  useEffect(() => { if (cible) setVue("inventaire"); }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="pilier-carte" role="region" aria-label="Forge">
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4), demande de l'utilisateur en cours de test : le TITRE « Forge » (icône et mot) est retiré de la page : inutile ici, l'onglet « Forge » du sélecteur juste au-dessus porte déjà ce nom. La page garde son NOM pour les lecteurs d'écran (région `aria-label="Forge"`) ; la note grise (périmètre de la Forge) reste, alignée à droite. / EN: ⚠️ CHANGED - the "Forge" title (icon and word) is removed from the page (the selector tab above already says it); the region keeps its accessible name; the grey note stays. */}
      <p data-forge-note="" style={{ margin: "0 0 0.6rem", fontSize: "0.8rem", color: "#7d7a70", textAlign: "right" }}>armes : consultation et simulation locale · armures : à venir</p>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) - les deux onglets en texte sont remplacés par les BOUTONS STYLISÉS (demande de l'utilisateur, après la validation de la 0.4.3) : « Collection » (archive de visuels v4) et « Inventaire » (bouton au format du sélecteur, option 2). Même rôle d'onglet et mêmes noms accessibles qu'avant. / EN: ⚠️ CHANGED - the two text tabs become the stylised buttons. */}
      {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - quand on arrive d'un bouton « Forge » : un retour à la vue d'origine ; elle est restée MONTÉE (cachée), donc la fenêtre Détails et tout le reste sont tels qu'on les a laissés. / EN: ⚠️ ADDED - back button when arriving from a "Forge" button; the origin view stayed mounted, so nothing is lost. */}
      {cible && onRetour && (
        <div data-retour-forge="" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", margin: "0 0 0.6rem", fontSize: "0.8rem", color: "#9a968a" }}>
          <button onClick={onRetour} style={{ fontSize: "0.8rem" }}>← Retour à {LIBELLES_ORIGINE[cible.origine]}</button>
          <span>Vous venez de la fenêtre « Détails » de « {cible.piece.nom} ».</span>
        </div>
      )}
      <div role="tablist" aria-label="Vues de la Forge" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.75rem", marginBottom: "0.8rem" }}>
        <BoutonSousMenu identifiant="collection" libelle="Collection" actif={vue === "collection"} onClick={() => setVue("collection")} />
        <BoutonSousMenu identifiant="inventaire" libelle="Inventaire" actif={vue === "inventaire"} onClick={() => setVue("inventaire")} />
      </div>
      <div role="tabpanel" aria-label="Collection" hidden={vue !== "collection"}>
        <CollectionArmes db={db} membership={membership} />
      </div>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.6) - la vue Inventaire existe : tes armes possédées, leur roll réel et la simulation locale des perks et du mod (voir `InventaireArmes.tsx`). Le panneau reste MONTÉ (caché quand on est sur « Collection ») : l'inventaire chargé, la recherche et la fenêtre ouverte ne sont pas perdus en changeant de vue. / EN: ⚠️ CHANGED - the Inventory view now exists. */}
      <div role="tabpanel" aria-label="Inventaire" hidden={vue !== "inventaire"}>
        <InventaireArmes db={db} membership={membership} cible={cible} onAjouterAuBuild={onAjouterAuBuild} idsDansBuild={idsDansBuild} onRetour={onRetour} libelleRetour={cible ? LIBELLES_ORIGINE[cible.origine] : undefined} />
      </div>
    </div>
  );
}
