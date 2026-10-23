// FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - SÉLECTEUR DE VUES (Build Analyzer, Load-outs, Bibliothèque) avec les NOUVEAUX BOUTONS fournis par l'utilisateur (archive « forge-armory-boutons-final », conservée dans
// `ressources-installateur/forge-armory/boutons-selecteur/` ; les 6 SVG utilisés sont dans `public/boutons/`). Chaque bouton = logo + cadre + titre, un seul SVG (titre en TRACÉS : aucune police à charger), deux
// états : au repos et sélectionné (lueur). Les six SVG ont exactement le même cadre (viewBox 0 0 4316 1024) : affichés à la MÊME hauteur, la largeur suit, et la lueur reste DANS le cadre, donc la taille ne
// change pas au clic (règles d'intégration de l'archive). Les deux états sont superposés et on bascule leur opacité : pas de scintillement au changement d'image, les deux sont déjà chargés.
// Chemins : `import.meta.env.BASE_URL` (« / » dans le navigateur, « ./ » dans le logiciel installé) : un chemin absolu cassait déjà les badges de contexte dans le logiciel (voir BadgeContexte.tsx).
// EN: ⚠️ ADDED - VIEW SELECTOR with the user's NEW BUTTONS: one SVG per button and state (title as paths, no font), same frame, shown at the same height, glow stays inside the frame so size never changes on click;
// both states are stacked and cross-faded (no flicker).

import type { CSSProperties } from "react";

export type VueApp = "analyseur" | "loadouts" | "forge" | "bibliotheque" | "carriere" | "accomplissements";   // ⚠️ v0.4.0 : + « forge »

// FR : ⚠️ CHANGÉ (07/10/2026, v0.3.16) - les fichiers viennent du catalogue de l'archive « forge-armory-app-assets » (`urlVisuel`, identifiants `selecteur.<vue>.repos|selectionne`) au lieu de chemins écrits ici. / EN: ⚠️ CHANGED - files now come from the supplied catalogue.
import { urlVisuel } from "../lib/visuelsForge";

/** FR : l'ordre est celui demandé : Build Analyzer, Load-outs, Forge, Legendarium (Forge ajoutée en v0.4.0 ; « Bibliothèque » renommée « Legendarium » en v0.4.4). / EN: the requested order. */
/** FR : ⚠️ AJOUT (22/10/2026, TODO §25) : les deux DERNIERS onglets « Carrière » et « Accomplissements » sont les PAGES DÉDIÉES du compte, ouvertes par les boutons du même nom du bloc Connexion. Leurs visuels ont le cadre 4897 x 1024 (comme dans le bloc Connexion) : `large: true` applique le modificateur `bouton-vue--large`, sinon ils seraient réduits pour tenir dans le cadre 4316 / 1024 des quatre autres. / EN: ADDED - the last two tabs are the account PAGES opened by the Connection block's buttons; their visuals use the 4897 x 1024 frame (`large`). */
const VUES: { valeur: VueApp; libelle: string; fichier: string; large?: boolean }[] = [
  { valeur: "analyseur", libelle: "Build Analyzer", fichier: "build-analyzer" },
  { valeur: "loadouts", libelle: "Load-outs", fichier: "loadouts" },
  { valeur: "forge", libelle: "Forge", fichier: "forge" },   // ⚠️ AJOUT (12/10/2026, v0.4.0) : nouvel onglet, entre Load-outs et Bibliothèque (demande de l'utilisateur)
  // FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4), demande de l'utilisateur : le bouton « Bibliothèque » devient « LEGENDARIUM » (visuels de l'archive v5 : `selecteur.legendarium.*`). L'IDENTIFIANT INTERNE reste « bibliotheque » (la vue choisie est mémorisée et les tests la nomment ainsi) : seuls le libellé affiché, lu par les lecteurs d'écran, et les images changent. / EN: ⚠️ CHANGED - the "Library" button is now "Legendarium"; the internal id stays "bibliotheque" (the chosen view is remembered).
  { valeur: "bibliotheque", libelle: "Legendarium", fichier: "legendarium" },
  { valeur: "carriere", libelle: "Carrière", fichier: "carriere-large", large: true },
  { valeur: "accomplissements", libelle: "Accomplissements", fichier: "accomplissements", large: true },
];

/**
 * FR : ⚠️ AJOUT (07/10/2026, v0.3.11) - UN bouton stylisé du sélecteur, utilisable SEUL (demande de l'utilisateur : dans la confirmation d'enregistrement, remplacer le bouton texte « Ouvrir l'onglet Load-outs » par le bouton stylisé du
 * sélecteur, à 28 px). Même dessin, mêmes deux états superposés, même éclaircissement au survol que dans le sélecteur ; `hauteur` (par exemple « 28px ») remplace la hauteur du sélecteur, la largeur suit le rapport du cadre.
 * Dans le sélecteur il garde son rôle d'onglet (`roleOnglet`) ; seul, c'est un simple bouton d'action : son libellé reste accessible (`aria-label`, infobulle) puisque le titre est dans l'image.
 * EN: ⚠️ ADDED - ONE stylised selector button, usable on its own, at any height (here 28 px in the save confirmation).
 */
export function BoutonVue({ vue, libelle, actif = false, hauteur, roleOnglet = false, onClick }: { vue: VueApp; libelle: string; actif?: boolean; hauteur?: string; roleOnglet?: boolean; onClick: () => void }) {
  const trouvee = VUES.find((v) => v.valeur === vue)!;
  return (
    <button
      type="button"
      role={roleOnglet ? "tab" : undefined}
      aria-selected={roleOnglet ? actif : undefined}
      aria-label={libelle}
      title={libelle}
      className={trouvee.large ? "bouton-vue bouton-vue--large" : "bouton-vue"}
      data-actif={actif}
      data-vue={vue}
      onClick={onClick}
      style={hauteur ? ({ "--hauteur-bouton": hauteur } as CSSProperties) : undefined}
    >
      <img className="bouton-vue__repos" src={urlVisuel(`selecteur.${trouvee.fichier}.repos`)} alt="" draggable={false} />
      <img className="bouton-vue__actif" src={urlVisuel(`selecteur.${trouvee.fichier}.selectionne`)} alt="" draggable={false} />
    </button>
  );
}

/**
 * FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - BOUTON STYLISÉ d'un SOUS-MENU de la Forge (« Collection », « Inventaire »), demande de l'utilisateur : « une fois les tests réalisés, on utilisera le bouton stylisé pour sélectionner la Collection (archive v4) ; pour l'Inventaire, un bouton au format du sélecteur » (option 2 du 13/10/2026). Mêmes images à deux états superposés, mêmes règles CSS (`bouton-vue` : survol, anneau de focus clavier,
 * lueur contenue dans le cadre) et même cadre 4316 × 1024 que les boutons du sélecteur principal ; seule la hauteur diffère (`hauteur`, 2,75 rem par défaut : au-dessus du minimum de 40 px de la charte). C'est un ONGLET (`role="tab"`) : son nom est dans `aria-label` puisque le titre est dans l'image.
 * EN: ⚠️ ADDED - stylised button of a Forge sub-menu (Collection, Inventory): same two stacked states and CSS as the main selector, smaller height.
 */
export function BoutonSousMenu({ identifiant, libelle, actif, hauteur = "2.75rem", onClick }: { identifiant: "collection" | "inventaire"; libelle: string; actif: boolean; hauteur?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      aria-label={libelle}
      title={libelle}
      className="bouton-vue"
      data-actif={actif}
      data-sous-menu={identifiant}
      onClick={onClick}
      style={{ "--hauteur-bouton": hauteur } as CSSProperties}
    >
      <img className="bouton-vue__repos" src={urlVisuel(`selecteur.${identifiant}.repos`)} alt="" draggable={false} />
      <img className="bouton-vue__actif" src={urlVisuel(`selecteur.${identifiant}.selectionne`)} alt="" draggable={false} />
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
