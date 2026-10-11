// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - FILIGRANE de la fenêtre « Voir » : l'emblème
// vectoriel Forge Armory, centré sur le contenu, très discret (même opacité que dans
// les exports, `OPACITE_FILIGRANE`). Posé PAR-DESSUS le contenu mais sans le gêner :
// `pointer-events: none` (les clics passent) et opacité faible (le texte reste net).
// À placer dans un conteneur `position: relative` qui enveloppe TOUT le contenu : le
// filigrane est alors centré sur la fiche entière, et rogné à ses bords (`overflow:
// hidden`), donc il n'agrandit jamais la zone défilante.
// EN: ⚠️ ADDED - "View" window WATERMARK: the vector emblem, centred on the content, very
// faint, above the content but harmless (no pointer events, low opacity).

import { emblemeSvg, OPACITE_FILIGRANE } from "../data/emblemeForgeArmory";

// FR : contenu constant, aucune donnée utilisateur : sans risque pour dangerouslySetInnerHTML.
const SVG = emblemeSvg("fa-voir", 'style="display:block;width:100%;height:auto"');

export default function Filigrane({ largeur = 420 }: { largeur?: number }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: "inherit" }}>
      <div
        style={{ position: "absolute", left: "50%", top: "50%", width: largeur, transform: "translate(-50%, -50%)", opacity: OPACITE_FILIGRANE }}
        dangerouslySetInnerHTML={{ __html: SVG }}
      />
    </div>
  );
}
