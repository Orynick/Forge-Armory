// FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - bloc « Partage du build », sous
// l'Artefact (demande de l'utilisateur) : exporter le build EN COURS sans
// devoir l'enregistrer dans les loadouts. Mêmes boutons que la fiche
// « 👁 Voir » (composant commun BarrePartage) : fichier JSON réimportable,
// texte pur, JPEG, PNG, PDF.
//
// Rien n'est enregistré : le loadout est construit en mémoire par
// `construireLoadout`, la fonction qu'utilise l'enregistrement lui-même, puis
// la fiche par `construireFiche`, comme pour un loadout sauvegardé. Le
// fichier JSON produit est donc strictement identique à celui d'un build
// enregistré, et s'importe avec le même bouton.
//
// EN: ⚠️ ADDED - "share build" block, below the Artifact: export the CURRENT
// build without saving it. Same buttons as the "View" sheet. Nothing is
// saved: the loadout is built in memory by the same function saving uses.
//
// FR : ⚠️ CHANGÉ (07/10/2026, v0.3.8) - le bloc devient « SAUVEGARDE ET PARTAGE DE BUILD » (demande de l'utilisateur) :
// il accueille le bouton « 💾 Enregistrer le build… », qui ouvre la fenêtre components/EnregistrerBuild.tsx (nom, description, icône).
// La zone d'enregistrement a quitté le panneau des Loadouts ; le partage sans enregistrer est INCHANGÉ. Après un enregistrement, une
// confirmation s'affiche ici, avec un bouton pour ouvrir l'onglet Load-outs (`onVoirLoadouts`).
// EN: ⚠️ CHANGED - the block becomes "SAVE AND SHARE BUILD": it hosts the "Save build" button and its window; sharing is unchanged.

import { useMemo, useState } from "react";
import { Database } from "sql.js";
import { BuildDraft } from "../types/build";
import { construireLoadout, serialiserUnLoadout } from "../lib/loadouts/stockage";
import { construireFiche } from "../lib/loadouts/fiche";
import { telechargerFichierTexte } from "../lib/telechargement";
import BarrePartage from "./BarrePartage";
import EnregistrerBuild from "./EnregistrerBuild";
import { BoutonVue } from "./SelecteurVues";
import TitreRepliable from "./TitreRepliable";

interface Props {
  build: BuildDraft;
  db: Database | null;
  /** FR : ⚠️ AJOUT (06/10/2026, v0.3.3) - pseudo Bungie affiché dans le bloc Connexion : le build partagé est celui de l'utilisateur, il le signe. null/absent si non connecté. / EN: ⚠️ ADDED - the connected user's handle: the shared build is theirs, so it carries it. */
  auteur?: string | null;
  /** FR : ⚠️ AJOUT (07/10/2026, v0.3.8) - ouvre l'onglet Load-outs (proposé après un enregistrement). Absent = pas de bouton. / EN: ⚠️ ADDED - opens the Load-outs tab (offered after a save). */
  onVoirLoadouts?: () => void;
}

/** FR : nom utilisé si le champ est laissé vide. / EN: name used when the field is left empty. */
const NOM_PAR_DEFAUT = "Mon build";

export default function BlocPartage({ build, db, auteur = null, onVoirLoadouts }: Props) {
  // FR : nom propre à ce bloc. Le nom interne du build en cours n'est pas
  // fiable (il reste celui du build de démonstration tant qu'on ne charge
  // pas de loadout), d'où un champ explicite.
  // EN: block-specific name; the current build's internal name isn't reliable.
  const [nom, setNom] = useState("");
  // FR : ⚠️ AJOUT (07/10/2026, v0.3.8) - fenêtre d'enregistrement ouverte ou non, et nom du dernier build enregistré (pour la confirmation). / EN: ⚠️ ADDED - save window state and last saved name.
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const [dernierEnregistre, setDernierEnregistre] = useState<string | null>(null);
  const nomEffectif = nom.trim() || NOM_PAR_DEFAUT;

  const loadout = useMemo(() => construireLoadout(nomEffectif, build, "", "", auteur ?? ""), [nomEffectif, build, auteur]);
  const fiche = useMemo(() => construireFiche(loadout, db), [loadout, db]);

  function exporterJson() {
    const { contenu, nomFichier } = serialiserUnLoadout(loadout);
    telechargerFichierTexte(contenu, nomFichier);
  }

  return (
    <details open className="pilier-carte bloc-repliable">
      {/* FR : bloc repliable comme les autres blocs principaux (v0.2.3).
      EN: collapsible like the other main blocks. */}
      <summary>
        <span className="bloc-repliable-ligne">
          <TitreRepliable categorie="sauvegarde" />
        </span>
      </summary>
      <p style={{ fontSize: "0.75rem", color: "#b7b3a8", margin: "0 0 0.6rem" }}>
        Enregistre le build affiché dans Mon Build parmi tes Load-outs, ou partage-le sans l'enregistrer.
      </p>

      <div data-sauvegarde="" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
        <button
          type="button"
          data-enregistrer-build=""
          onClick={() => {
            setDernierEnregistre(null);
            setSaisieOuverte(true);
          }}
          style={{ fontSize: "0.82rem" }}
        >
          💾 Enregistrer le build…
        </button>
        <span style={{ fontSize: "0.72rem", color: "#7d7a70" }}>Pour le retrouver, le charger ou l'équiper plus tard (onglet Load-outs).</span>
      </div>
      {dernierEnregistre && (
        // FR : ⚠️ CHANGÉ (07/10/2026, v0.3.11) - le bouton texte « Ouvrir l'onglet Load-outs » est remplacé par le BOUTON STYLISÉ du sélecteur (« Load-outs »), à 28 px de haut (demande de l'utilisateur). Même libellé accessible. / EN: ⚠️ CHANGED - the text button is replaced by the stylised selector button, 28 px high.
        <div role="status" data-confirmation-sauvegarde="" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.3rem 0.7rem", fontSize: "0.75rem", color: "#7fd88f", margin: "0.4rem 0 0" }}>
          <span>✅ « {dernierEnregistre} » est enregistré dans tes Load-outs.</span>
          {onVoirLoadouts && <BoutonVue vue="loadouts" libelle="Ouvrir l'onglet Load-outs" hauteur="28px" onClick={onVoirLoadouts} />}
        </div>
      )}

      <div style={{ borderTop: "1px solid #2a2e38", margin: "0.7rem 0 0.6rem" }} />
      <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>Partage, sans enregistrer</div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        Nom du build
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder={NOM_PAR_DEFAUT}
          maxLength={80}
          style={{ flex: "1 1 220px", maxWidth: 360, fontSize: "0.8rem" }}
        />
      </label>
      <BarrePartage fiche={fiche} onExporterJson={exporterJson} />
      {saisieOuverte && (
        <EnregistrerBuild
          build={build}
          auteur={auteur}
          nomInitial={nom.trim()}
          onEnregistre={(nomEnregistre) => {
            setSaisieOuverte(false);
            setDernierEnregistre(nomEnregistre);
          }}
          onAnnuler={() => setSaisieOuverte(false)}
        />
      )}
    </details>
  );
}
