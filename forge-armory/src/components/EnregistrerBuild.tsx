// FR : ⚠️ AJOUT (07/10/2026, v0.3.8) - fenêtre « Enregistrer le build » : NOM, DESCRIPTION et ICÔNE, puis enregistrement du build EN COURS dans les loadouts (demande de l'utilisateur : la zone d'enregistrement quitte le panneau
// des Loadouts et devient une fenêtre ouverte depuis le bloc « Sauvegarde et partage du Build », dans le Build Analyzer). C'est la fenêtre « Modifier le build » (`ModifierLoadout`) en mode création : mêmes champs, mêmes
// règles (nom obligatoire, Échap ou « Annuler » ne change rien, un clic à côté ne ferme pas la fenêtre : un texte tapé n'est pas perdu). Reprend à l'identique la confirmation « Doctrine incomplète » de l'ancienne zone
// (`lib/loadouts/doctrineIncomplete.ts`) et signe le build du pseudo de l'auteur (`auteur`, v0.3.3). Si l'enregistrement échoue (stockage plein), l'erreur s'affiche DANS la fenêtre, qui reste ouverte.
// EN: ⚠️ ADDED - "Save build" window: name, description and icon, then saves the CURRENT build into the loadouts. It is the "Edit build" window in creation mode; same "incomplete Doctrine" confirmation; signs the build.

import { useState } from "react";
import { BuildDraft } from "../types/build";
import { enregistrerLoadout } from "../lib/loadouts/stockage";
// FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - détection d'une simulation pour l'enregistrement marqué.
// EN: simulation detection for the marked save.
import { aDesAjustementsStats } from "../lib/scoring/stats";
import { doctrineManquante, messageDoctrineIncomplete } from "../lib/loadouts/doctrineIncomplete";
import ModifierLoadout from "./ModifierLoadout";

interface Props {
  build: BuildDraft;
  /** FR : pseudo Bungie affiché dans le bloc Connexion, ou null si non connecté (le build n'a alors pas d'auteur). / EN: the connected user's handle, or null. */
  auteur: string | null;
  /** FR : nom proposé au départ (par exemple celui déjà tapé dans le bloc de partage). / EN: starting name. */
  nomInitial?: string;
  onEnregistre: (nom: string) => void;
  onAnnuler: () => void;
  /**
   * FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - vrai si le build en cours porte des perks
   * SIMULÉS (Forge) : l'enregistrement est marqué « simulation ». Le `build` reçu peut être le build
   * réel (sans simulation appliquée), d'où ce paramètre explicite (défaut : détection sur le build reçu).
   * EN: true if the current build carries SIMULATED perks (Forge).
   */
  avecPerksSimules?: boolean;
}

export default function EnregistrerBuild({ build, auteur, nomInitial = "", onEnregistre, onAnnuler, avecPerksSimules = false }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);

  function valider(infos: { nom: string; description: string; icone: string }) {
    const manquants = doctrineManquante(build);
    if (manquants.length > 0 && !window.confirm(messageDoctrineIncomplete(manquants))) return;
    // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - enregistrement marqué « simulation »
    // quand le build porte des ajustements de stats ou des perks simulés (build reçu = build avec
    // simulation appliquée depuis le Dashboard). Les ajustements sont conservés, le badge apparaît
    // dans la liste des loadouts. / EN: marked "simulation" save when the build carries stat adjustments
    // or simulated perks.
    const estSimulation =
      avecPerksSimules || build.armes.some((a) => a.perksSimules === true) || aDesAjustementsStats(build.ajustementsStats);
    const resultat = enregistrerLoadout(infos.nom, build, infos.description, infos.icone, auteur ?? "", estSimulation || undefined);
    if (!resultat.ok) {
      setErreur(resultat.erreur ?? "Enregistrement impossible.");
      return;
    }
    onEnregistre(infos.nom.trim());
  }

  return (
    <ModifierLoadout
      nomInitial={nomInitial}
      titre="Enregistrer le build"
      introduction="Donne un nom à ce build, avec une description et une icône si tu veux. Il sera enregistré dans tes Load-outs, sur cet appareil seulement (pas sur ton compte Bungie)."
      libelleValider="💾 Enregistrer"
      erreur={erreur}
      onValider={valider}
      onAnnuler={onAnnuler}
    />
  );
}
