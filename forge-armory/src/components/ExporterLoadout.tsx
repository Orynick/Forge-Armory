// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - fenêtre « Exporter... » d'un loadout (demande de
// l'utilisateur) : choisir la FAÇON de l'exporter (Copie texte, Export JPEG, PNG, PDF ou
// JSON) sans avoir à ouvrir « Voir ». Réutilise la barre de partage de « Voir » en
// présentation « liste » : la logique est la même, les boutons de « Voir » ne changent pas.
// EN: ⚠️ ADDED - a loadout's "Export..." window: choose HOW to export it, without opening
// "View". Reuses the sharing bar in "list" layout.

import { FicheBuild } from "../lib/loadouts/fiche";
import Modale from "./Modale";
import BarrePartage from "./BarrePartage";

interface Props {
  fiche: FicheBuild;
  onExporterJson: () => void;
  onFermer: () => void;
}

export default function ExporterLoadout({ fiche, onExporterJson, onFermer }: Props) {
  return (
    <Modale titre={`Exporter « ${fiche.nom} »`} onFermer={onFermer} largeur={400} fermerSurFond>
      <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginBottom: "0.7rem" }}>Choisissez comment partager ce build :</div>
      <BarrePartage fiche={fiche} onExporterJson={onExporterJson} disposition="liste" />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.9rem" }}>
        <button onClick={onFermer} style={{ fontSize: "0.78rem" }}>
          Fermer
        </button>
      </div>
    </Modale>
  );
}
