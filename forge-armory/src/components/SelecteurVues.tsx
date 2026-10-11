// FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - SÉLECTEUR DE VUES (Build Analyzer, Load-outs, Bibliothèque) avec les NOUVEAUX BOUTONS fournis par l'utilisateur (archive « forge-armory-boutons-final », conservée dans
// `ressources-installateur/forge-armory/boutons-selecteur/` ; les 6 SVG utilisés sont dans `public/boutons/`). Chaque bouton = logo + cadre + titre, un seul SVG (titre en TRACÉS : aucune police à charger), deux
// états : au repos et sélectionné (lueur). Les six SVG ont exactement le même cadre (viewBox 0 0 4316 1024) : affichés à la MÊME hauteur, la largeur suit, et la lueur reste DANS le cadre, donc la taille ne
// change pas au clic (règles d'intégration de l'archive). Les deux états sont superposés et on bascule leur opacité : pas de scintillement au changement d'image, les deux sont déjà chargés.
// Chemins : `import.meta.env.BASE_URL` (« / » dans le navigateur, « ./ » dans le logiciel installé) : un chemin absolu cassait déjà les badges de contexte dans le logiciel (voir BadgeContexte.tsx).
// EN: ⚠️ ADDED - VIEW SELECTOR with the user's NEW BUTTONS: one SVG per button and state (title as paths, no font), same frame, shown at the same height, glow stays inside the frame so size never changes on click;
// both states are stacked and cross-faded (no flicker).

import type { CSSProperties } from "react";

export type VueApp = "analyseur" | "loadouts" | "bibliotheque";

// FR : ⚠️ CHANGÉ (07/10/2026, v0.3.16) - les fichiers viennent du catalogue de l'archive « forge-armory-app-assets » (`urlVisuel`, identifiants `selecteur.<vue>.repos|selectionne`) au lieu de chemins écrits ici. / EN: ⚠️ CHANGED - files now come from the supplied catalogue.
import { urlVisuel } from "../lib/visuelsForge";

/** FR : l'ordre est celui demandé : Build Analyzer, Load-outs, Bibliothèque. / EN: the requested order. */
const VUES: { valeur: VueApp; libelle: string; fichier: string }[] = [
  { valeur: "analyseur", libelle: "Build Analyzer", fichier: "build-analyzer" },
  { valeur: "loadouts", libelle: "Load-outs", fichier: "loadouts" },
  { valeur: "bibliotheque", libelle: "Bibliothèque", fichier: "bibliotheque" },
];

/**
 * FR : ⚠️ AJOUT (07/10/2026, v0.3.11) - UN bouton stylisé du sélecteur, utilisable SEUL (demande de l'utilisateur : dans la confirmation d'enregistrement, remplacer le bouton texte « Ouvrir l'onglet Load-outs » par le bouton stylisé du
 * sélecteur, à 28 px). Même dessin, mêmes deux états superposés, même éclaircissement au survol que dans le sélecteur ; `hauteur` (par exemple « 28px ») remplace la hauteur du sélecteur, la largeur suit le rapport du cadre.
 * Dans le sélecteur il garde son rôle d'onglet (`roleOnglet`) ; seul, c'est un simple bouton d'action : son libellé reste accessible (`aria-label`, infobulle) puisque le titre est dans l'image.
 * EN: ⚠️ ADDED - ONE stylised selector button, usable on its own, at any height (here 28 px in the save confirmation).
 */
export function BoutonVue({ vue, libelle, actif = false, hauteur, roleOnglet = false, onClick }: { vue: VueApp; libelle: string; actif?: boolean; hauteur?: string; roleOnglet?: boolean; onClick: () => void }) {
  const fichier = VUES.find((v) => v.valeur === vue)!.fichier;
  return (
    <button
      type="button"
      role={roleOnglet ? "tab" : undefined}
      aria-selected={roleOnglet ? actif : undefined}
      aria-label={libelle}
      title={libelle}
      className="bouton-vue"
      data-actif={actif}
      data-vue={vue}
      onClick={onClick}
      style={hauteur ? ({ "--hauteur-bouton": hauteur } as CSSProperties) : undefined}
    >
      <img className="bouton-vue__repos" src={urlVisuel(`selecteur.${fichier}.repos`)} alt="" draggable={false} />
      <img className="bouton-vue__actif" src={urlVisuel(`selecteur.${fichier}.selectionne`)} alt="" draggable={false} />
    </button>
  );
}

export default function SelecteurVues({ vue, onChanger }: { vue: VueApp; onChanger: (vue: VueApp) => void }) {
  return (
    <div role="tablist" aria-label="Vue" className="selecteur-vues">
      {VUES.map((opt) => (
        <BoutonVue key={opt.valeur} vue={opt.valeur} libelle={opt.libelle} actif={vue === opt.valeur} roleOnglet onClick={() => onChanger(opt.valeur)} />
      ))}
    </div>
  );
}
