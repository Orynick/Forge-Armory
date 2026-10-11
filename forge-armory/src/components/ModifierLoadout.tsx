// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - fenêtre « Modifier... » d'un loadout : NOM,
// DESCRIPTION et ICÔNE au même endroit (demande de l'utilisateur : regrouper les anciens
// boutons « Icône », « Décrire » et « Renommer » sous un seul bouton). Les valeurs de départ
// sont celles du loadout ; « Valider » enregistre les trois d'un coup, « Annuler » (ou
// Échap) ne change rien. Un clic à côté NE ferme PAS la fenêtre : on ne perd pas un texte
// tapé par mégarde.
// EN: ⚠️ ADDED - a loadout's "Edit..." window: NAME, DESCRIPTION and ICON in one place.

import { useState } from "react";
import { Loadout } from "../lib/loadouts/stockage";
import Modale from "./Modale";
import SelecteurIconeLoadout from "./SelecteurIconeLoadout";

interface Props {
  /** FR : le loadout à modifier. ⚠️ FACULTATIF depuis le 07/10/2026 (v0.3.8) : absent = CRÉATION d'un nouveau build (fenêtre « Enregistrer le build »), les champs partent alors de `nomInitial` et du vide. / EN: ⚠️ now OPTIONAL: absent = creating a new build. */
  loadout?: Loadout;
  /** FR : ⚠️ AJOUT (07/10/2026) - nom de départ en création. / EN: ⚠️ ADDED - starting name when creating. */
  nomInitial?: string;
  /** FR : ⚠️ AJOUT (07/10/2026) - titre, phrase d'introduction et libellé du bouton de validation, pour servir aussi à l'enregistrement ; par défaut : ceux de la modification, INCHANGÉS. / EN: ⚠️ ADDED - title, intro line and confirm label; defaults unchanged. */
  titre?: string;
  introduction?: string;
  libelleValider?: string;
  /** FR : ⚠️ AJOUT (07/10/2026) - erreur à afficher dans la fenêtre (par exemple « stockage plein ») : la fenêtre reste ouverte, le texte saisi n'est pas perdu. / EN: ⚠️ ADDED - error shown inside the window; it stays open. */
  erreur?: string | null;
  onValider: (infos: { nom: string; description: string; icone: string }) => void;
  onAnnuler: () => void;
}

const CHAMP = { width: "100%", boxSizing: "border-box", fontSize: "0.78rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem" } as const;
const ETIQUETTE = { fontSize: "0.7rem", color: "#7d7a70", display: "block", margin: "0.7rem 0 0.25rem" } as const;

export default function ModifierLoadout({ loadout, nomInitial = "", titre = "Modifier le build", introduction = "Nom, description et icône de ce build.", libelleValider = "✓ Valider", erreur = null, onValider, onAnnuler }: Props) {
  const [nom, setNom] = useState(loadout?.nom ?? nomInitial);
  const [description, setDescription] = useState(loadout?.description ?? "");
  const [icone, setIcone] = useState(loadout?.iconeChoisie ?? "");
  const nomVide = nom.trim() === "";

  return (
    <Modale titre={titre} onFermer={onAnnuler} largeur={440}>
      <div style={{ fontSize: "0.72rem", color: "#b7b3a8" }}>{introduction}</div>

      <label style={ETIQUETTE} htmlFor="loadout-nom">
        Nom
      </label>
      <input
        id="loadout-nom"
        autoFocus
        type="text"
        value={nom}
        maxLength={80}
        onChange={(e) => setNom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !nomVide) onValider({ nom, description, icone });
        }}
        style={{ ...CHAMP, borderColor: nomVide ? "#e08080" : "#3a3f4b" }}
      />
      {nomVide && <div style={{ fontSize: "0.68rem", color: "#e08080", marginTop: "0.2rem" }}>Le nom ne peut pas être vide.</div>}

      <label style={ETIQUETTE} htmlFor="loadout-description">
        Description (facultatif)
      </label>
      <textarea
        id="loadout-description"
        value={description}
        rows={3}
        placeholder="À quoi sert ce build, dans quel contexte..."
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...CHAMP, resize: "vertical" }}
      />

      <div style={{ marginTop: "0.8rem" }}>
        <SelecteurIconeLoadout valeur={icone} onChoisir={setIcone} />
      </div>

      {erreur && (
        <div role="alert" style={{ fontSize: "0.72rem", color: "#e08080", marginTop: "0.8rem" }}>
          ⚠️ {erreur}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button onClick={onAnnuler} style={{ fontSize: "0.78rem" }}>
          Annuler
        </button>
        <button onClick={() => onValider({ nom, description, icone })} disabled={nomVide} style={{ fontSize: "0.78rem" }}>
          {libelleValider}
        </button>
      </div>
    </Modale>
  );
}
