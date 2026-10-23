// FR : ⚠️ AJOUT (21/10/2026, demande de l'utilisateur, capture d'écran annotée) - les deux boutons « Carrière » (au-dessus) et « Accomplissements » du bloc Connexion, extraits de la page principale pour être TESTÉS tels quels. Ils ont EXACTEMENT la même taille : même hauteur (3,0625 rem, ≈ 49 px, valeur conservée de la demande « +75 % ») ET même cadre (4897 x 1024 : le fichier de Carrière est une variante élargie de l'original, voir la retouche 5 de scripts/retoucher-visuels.mjs), donc même largeur, mêmes anneaux, mêmes plaques. Alignés à gauche sur la même colonne. Le composant n'est monté que CONNECTÉ (le parent le place dans `connecte &&`) : MASQUÉS hors connexion. Les boutons de la fenêtre « Carrière » et du tiroir « Solo sans mourir » ne changent pas.
// EN: ⚠️ ADDED - the "Career" (above) and "Achievements" buttons of the Connection block, extracted to be tested as is; same height AND same frame, left-aligned in one column; only mounted when connected.
import type { CSSProperties } from "react";
import { urlVisuel } from "../lib/visuelsForge";

export const HAUTEUR_BOUTONS_VUES_COMPTE = "3.0625rem";

interface Props {
  onCarriere: () => void;
  onAccomplissements: () => void;
}

/** FR : un bouton de vue à cadre 4897 x 1024. `hauteur` : 3,0625 rem dans le bloc Connexion ; la fenêtre « Carrière » le réutilise (2 rem) à droite de son titre. / EN: one view button; reused by the Career window. */
export function BoutonVue({ cle, libelle, infobulle, onClick, hauteur = HAUTEUR_BOUTONS_VUES_COMPTE }: { cle: string; libelle: string; infobulle: string; onClick: () => void; hauteur?: string }) {
  return (
    <button
      type="button"
      className="bouton-vue bouton-vue--large"
      aria-label={libelle}
      title={infobulle}
      onClick={onClick}
      style={{ "--hauteur-bouton": hauteur } as CSSProperties}
    >
      <img className="bouton-vue__repos" src={urlVisuel(`${cle}.repos`)} alt="" draggable={false} />
      <img className="bouton-vue__actif" src={urlVisuel(`${cle}.selectionne`)} alt="" draggable={false} />
    </button>
  );
}

export default function BoutonsVuesCompte({ onCarriere, onAccomplissements }: Props) {
  return (
    <div className="connexion-vues-compte" role="group" aria-label="Vues du compte" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.35rem" }}>
      <BoutonVue cle="selecteur.carriere-large" libelle="Carrière" infobulle="Voir les statistiques d'usage de votre compte (lecture seule)" onClick={onCarriere} />
      <BoutonVue cle="selecteur.accomplissements" libelle="Accomplissements" infobulle="Ouvrir les Accomplissements (Donjons / Triomphes)" onClick={onAccomplissements} />
    </div>
  );
}
