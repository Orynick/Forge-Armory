// FR : icônes de classe (Titan/Chasseur/Arcaniste), sur disque coloré.
// Le Manifest ne fournit aucune icône ici (DestinyClassDefinition a
// "hasIcon": false pour les 3 classes, confirmé par diagnostic) -
// premiere version (04/08/2026) recréait des formes SVG à la main,
// approximatives. Remplacées (04/08/2026) par les vrais fichiers SVG
// fournis par l'utilisateur (source: svgrepo.com), placés sur un disque
// coloré selon la classe pour la visibilité (les fichiers d'origine sont
// sombres/noirs) - couleurs et taille du symbole (~68% du disque, marge
// de sécurité pour ne jamais déborder) confirmées par l'utilisateur via
// aperçu avant intégration.
//
// EN: class icons (Titan/Hunter/Warlock), on a colored disc. The
// Manifest provides no icon here (DestinyClassDefinition has "hasIcon":
// false for all 3 classes, confirmed by diagnostic) - first version
// (2026-08-04) recreated hand-drawn SVG shapes, approximate. Replaced
// (2026-08-04) with the real SVG files provided by the user (source:
// svgrepo.com), placed on a colored disc per class for visibility (the
// original files are dark/black) - colors and symbol size (~68% of the
// disc, safety margin to never overflow) confirmed by the user via
// preview before integration.

import { SubclassConfig } from "../../types/build";

interface Props {
  classe: Exclude<SubclassConfig["classe"], null>;
  /** FR : diamètre du disque coloré (le symbole est dimensionné automatiquement à ~68% de cette taille). / EN: diameter of the colored disc (the symbol is automatically sized to ~68% of this). */
  taille?: number;
}

const COULEURS: Record<Exclude<SubclassConfig["classe"], null>, string> = {
  chasseur: "#3fa9e0",
  titan: "#d5453a",
  arcaniste: "#e0c93f",
};

const CHEMINS_SVG: Record<Exclude<SubclassConfig["classe"], null>, string> = {
  chasseur:
    "m9.055 10.446 6.945-.023-6.948 10.451 6.948-.024-7.412 11.15h-7.045l7.036-10.428h-7.036l7.032-10.422h-7.032l7.507-11.126 6.95-.024zm13.89 0-6.945-10.446 6.95.024 7.507 11.126h-7.032l7.032 10.422h-7.036l7.036 10.428h-7.045l-7.412-11.15 6.948.024-6.948-10.451z",
  titan:
    "m14.839 15.979-13.178-7.609v15.218zm2.322 0 13.178 7.609v-15.218zm5.485-12.175-6.589-3.804-13.178 7.609 13.178 7.609 13.179-7.609zm0 16.784-6.589-3.805-13.178 7.609 13.178 7.608 13.179-7.608-6.59-3.805z",
  arcaniste:
    "m5.442 23.986 7.255-11.65-2.71-4.322-9.987 15.972zm5.986 0 4.28-6.849-2.717-4.333-6.992 11.182zm7.83-11.611 7.316 11.611h5.426l-10.015-15.972zm-7.26 11.611h8.004l-4.008-6.392zm6.991-11.182-2.703 4.324 4.302 6.858h5.413zm-5.707-.459 2.71-4.331 2.71 4.331-2.703 4.326z",
};

const LIBELLES: Record<Exclude<SubclassConfig["classe"], null>, string> = {
  chasseur: "Chasseur",
  titan: "Titan",
  arcaniste: "Arcaniste",
};

export default function IconeClasse({ classe, taille = 24 }: Props) {
  const tailleSymbole = Math.round(taille * 0.68);
  return (
    <span
      role="img"
      aria-label={LIBELLES[classe]}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: taille,
        height: taille,
        borderRadius: "50%",
        background: COULEURS[classe],
        flexShrink: 0,
      }}
    >
      <svg width={tailleSymbole} height={tailleSymbole} viewBox="0 0 32 32" fill="#ffffff">
        <path d={CHEMINS_SVG[classe]} />
      </svg>
    </span>
  );
}
