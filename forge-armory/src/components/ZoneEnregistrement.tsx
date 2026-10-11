// FR : ⚠️ CORRIGÉ (07/10/2026, v0.3.11) - ZONE D'ENREGISTREMENT du build en cours, DANS LE TIROIR latéral repliable des Loadouts, comme depuis longtemps (et PAS dans le nouvel onglet « Load-outs » : l'utilisateur avait mélangé « tiroir » et « onglet »,
// d'où un aller-retour v0.3.8 / v0.3.9 à l'envers). C'est l'ancienne zone du panneau, retirée en v0.3.8, puis mise par erreur dans l'onglet en v0.3.9, sous forme de composant : champ du nom + bouton « + Enregistrer », palette d'icônes, description ; mêmes textes, mêmes réglages visuels qu'avant. Elle n'existe QUE dans le tiroir (mode « tiroir »)
// : l'onglet « Load-outs » n'en a pas ; l'autre chemin est la fenêtre du bloc « Sauvegarde et partage du Build » (components/EnregistrerBuild.tsx), dans le Build Analyzer. Les deux utilisent la même règle « Doctrine incomplète »
// (lib/loadouts/doctrineIncomplete.ts) et signent le build du pseudo de l'auteur.
// ⚠️ CHANGÉ (07/10/2026, v0.3.10) - LE NOM EST OBLIGATOIRE, comme dans la fenêtre du Build Analyzer (demande de l'utilisateur : aligner les deux ; avant, cette zone acceptait un nom vide et enregistrait « Sans nom ») : le bouton « + Enregistrer »
// est grisé tant que le nom est vide, et « Le nom ne peut pas être vide. » s'affiche si l'on a tapé puis effacé le nom (pas au repos : on ne montre pas une erreur avant que l'utilisateur ait touché au champ). Le stockage refuse de toute façon un nom vide.
// Autre différence avec l'ancienne zone, voulue : les champs ne sont vidés QUE si l'enregistrement a réussi (avant, ils étaient vidés même en cas d'échec : le texte tapé était perdu quand le stockage refusait l'écriture).
// EN: ⚠️ RESTORED, THEN CHANGED - the save area for the current build, back IN THE LOAD-OUTS TAB only. The NAME IS REQUIRED (button disabled while empty; message once the field was touched), as in the Build Analyzer window. Fields are cleared ONLY when saving succeeded.

import { useState } from "react";
import { BuildDraft } from "../types/build";
import { ERREUR_NOM_VIDE, enregistrerLoadout } from "../lib/loadouts/stockage";
import { doctrineManquante, messageDoctrineIncomplete } from "../lib/loadouts/doctrineIncomplete";
import SelecteurIconeLoadout from "./SelecteurIconeLoadout";

interface Props {
  /** FR : le build en cours, celui qui est affiché dans « Mon Build ». / EN: the current build. */
  build: BuildDraft;
  /** FR : pseudo Bungie du bloc Connexion, ou null si non connecté. / EN: the connected user's handle, or null. */
  auteur: string | null;
  /** FR : appelé avec le résultat de l'enregistrement et le message à afficher en cas de succès (le panneau recharge sa liste et affiche le message). / EN: called with the save result and the success message. */
  onResultat: (resultat: { ok: boolean; erreur?: string }, messageSucces: string) => void;
}

export default function ZoneEnregistrement({ build, auteur, onResultat }: Props) {
  const [nomSaisi, setNomSaisi] = useState("");
  const [descriptionSaisie, setDescriptionSaisie] = useState("");
  const [iconeSaisie, setIconeSaisie] = useState("");
  // FR : vrai dès que l'utilisateur a modifié le champ du nom : l'erreur « nom vide » n'apparaît qu'à ce moment-là. / EN: true once the user has edited the name field.
  const [nomTouche, setNomTouche] = useState(false);
  const nomVide = nomSaisi.trim() === "";

  function gererEnregistrer() {
    if (nomVide) return;
    const manquants = doctrineManquante(build);
    if (manquants.length > 0 && !window.confirm(messageDoctrineIncomplete(manquants))) return;
    const resultat = enregistrerLoadout(nomSaisi, build, descriptionSaisie, iconeSaisie, auteur ?? "");
    onResultat(resultat, `Loadout "${nomSaisi.trim()}" enregistré.`);
    if (resultat.ok) {
      setNomSaisi("");
      setDescriptionSaisie("");
      setIconeSaisie("");
      setNomTouche(false);
    }
  }

  return (
    <div data-zone-enregistrement="">
      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.6rem" }}>
        <input
          value={nomSaisi}
          onChange={(e) => {
            setNomSaisi(e.target.value);
            setNomTouche(true);
          }}
          aria-invalid={nomTouche && nomVide}
          placeholder="Nom du build actuel"
          style={{ flex: 1, minWidth: 0, fontSize: "0.75rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderColor: nomTouche && nomVide ? "#e08080" : "#3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem" }}
        />
        <button onClick={gererEnregistrer} disabled={nomVide} title={nomVide ? "Donnez d'abord un nom au build" : undefined} style={{ fontSize: "0.75rem", flexShrink: 0 }}>
          + Enregistrer
        </button>
      </div>
      {nomTouche && nomVide && (
        <div role="alert" data-nom-vide="" style={{ fontSize: "0.68rem", color: "#e08080", margin: "-0.4rem 0 0.5rem" }}>
          {ERREUR_NOM_VIDE}
        </div>
      )}

      {/* FR : icône facultative au choix (emojis, icônes d'activité et de doctrine, anti-champion). La classe et l'élément sont déjà figés automatiquement ; celle-ci sert à distinguer deux builds proches. / EN: optional icon. */}
      <div style={{ marginBottom: "0.5rem" }}>
        <SelecteurIconeLoadout valeur={iconeSaisie} onChoisir={setIconeSaisie} />
      </div>

      <textarea
        value={descriptionSaisie}
        onChange={(e) => setDescriptionSaisie(e.target.value)}
        placeholder="Description (optionnel) : à quoi sert ce build, dans quel contexte..."
        rows={2}
        style={{ width: "100%", boxSizing: "border-box", fontSize: "0.72rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem", marginBottom: "0.6rem", resize: "vertical" }}
      />
    </div>
  );
}
