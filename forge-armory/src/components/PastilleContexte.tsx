// FR : ⚠️ REMPLACÉ (07/10/2026, v0.3.6) - BOUTON DE CONTEXTE DU BUILD (Neutre, PvE Roaming, PvE DPS, PvP) avec les VISUELS FOURNIS par l'utilisateur (archive « forge-armory-boutons-profils », conservée dans
// `ressources-installateur/forge-armory/boutons-profils/` ; les 8 SVG utilisés sont dans `public/boutons-profils/`). Ils remplacent ma proposition dessinée en CSS de la v0.3.5 (l'archive des boutons du sélecteur ne
// couvrait pas le contexte). Même principe que les boutons du sélecteur de vues (`SelecteurVues.tsx`) : un seul SVG par bouton et par état (logo + cadre + titre, titre en tracés, aucune police), les deux états
// superposés avec bascule d'opacité (pas de scintillement), même HAUTEUR que les boutons du sélecteur (même cercle), largeur qui suit (cadre commun 3781 × 1024, un peu plus court que celui du sélecteur), lueur DANS
// le cadre donc taille inchangée au clic. Couleurs d'après la notice de l'archive : Neutre = argent, PvE Roaming = vert, PvE DPS = or, PvP = rouge. Les noms de fichier suivent les valeurs de `ContexteBuild`
// (`neutre`, `roaming`, `dps`, `pvp`). Composant PARTAGÉ par les deux endroits où l'on choisit le contexte (rangée sous le nom du build dans `DashboardPage`, et `BlocContexte`). Les classes CSS sont celles de
// `.bouton-vue` (voir `index.css`), avec le modificateur `.bouton-vue--profil` pour le rapport largeur/hauteur. Le libellé reste accessible (`aria-label`, infobulle) puisque le titre est dans l'image.
// EN: ⚠️ REPLACED - BUILD-CONTEXT BUTTON with the user's SUPPLIED artwork (replaces my v0.3.5 CSS proposal). Same principle as the view selector: one SVG per button and state, same height, glow inside the frame.

import type { CSSProperties } from "react";
import { ContexteBuild } from "../lib/scoring/stats";

/**
 * FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - ÉCHELLES des boutons de contexte, demande de l'utilisateur : −20 % pour la rangée au-dessus de « Mon Build » (80 %) et −50 % pour le bloc « 0. Contexte du build » (50 %), par rapport à la
 * taille des boutons du sélecteur de vues (hauteur et largeur, proportions inchangées). Définies ICI, une seule fois, pour que l'appli et les tests lisent les mêmes valeurs.
 * EN: ⚠️ ADDED - scales: 80 % for the row above "Mon Build", 50 % for the "0. Contexte du build" block, relative to the view-selector buttons.
 */
export const ECHELLE_CONTEXTE_RANGEE = 0.8;
export const ECHELLE_CONTEXTE_BLOC = 0.5;

// FR : ⚠️ CHANGÉ (07/10/2026, v0.3.16) - les fichiers viennent du catalogue de l'archive « forge-armory-app-assets » (`urlVisuel`, identifiants `profils.<contexte>.repos|selectionne`). / EN: ⚠️ CHANGED - files now come from the supplied catalogue.
import { urlVisuel } from "../lib/visuelsForge";

export default function PastilleContexte({ valeur, libelle, actif, onChoisir, echelle = 1 }: { valeur: ContexteBuild; libelle: string; actif: boolean; onChoisir: () => void; echelle?: number }) {
  return (
    <button
      type="button"
      className="bouton-vue bouton-vue--profil"
      aria-pressed={actif}
      aria-label={libelle}
      title={libelle}
      data-actif={actif}
      data-contexte={valeur}
      onClick={onChoisir}
      style={{ "--echelle-bouton": echelle } as CSSProperties}
    >
      <img className="bouton-vue__repos" src={urlVisuel(`profils.${valeur}.repos`)} alt="" draggable={false} />
      <img className="bouton-vue__actif" src={urlVisuel(`profils.${valeur}.selectionne`)} alt="" draggable={false} />
    </button>
  );
}
