// FR : ⚠️ AJOUT (06/10/2026, v0.3.2) - LOGO DE L'APPLICATION EN ARRIÈRE-PLAN (demande de l'utilisateur : « le logo de l'application, sans le titre ni le sous-titre, en arrière-plan de l'appli ; il doit
// rester fixe par rapport au contenu de la fenêtre »). C'est l'EMBLÈME vectoriel seul (papillon, cercle, cristaux), le même que le filigrane de la fenêtre « Voir » (data/emblemeForgeArmory.ts).
// - FIXE : `position: fixed` : il reste en place, centré dans la fenêtre, quand le contenu défile ;
// - DERRIÈRE : `z-index: -1`, sous tout le contenu (les cartes `.pilier-carte` sont légèrement translucides pour le laisser transparaître) ; `pointer-events: none` : il ne reçoit jamais un clic ;
// - DISCRET : opacité `OPACITE_FOND_APP` ; taille proportionnelle à la fenêtre (`vmin`), plafonnée ; jamais de barre de défilement (`overflow: hidden`, `inset: 0`).
// Réservé à l'écran de l'appli : les exports image et PDF fabriquent leur propre page (avec leur propre filigrane) et ne reçoivent pas ce fond.
// EN: ⚠️ ADDED - the app's emblem (no title) as a FIXED background behind the content: fixed to the window, behind everything, click-through, faint, never adds scrolling. Not part of the exports.

import { emblemeSvg } from "../data/emblemeForgeArmory";

/** FR : opacité du logo de fond (plus marqué que le filigrane des exports, 0,07, car il est derrière des cartes translucides). / EN: background logo opacity. */
export const OPACITE_FOND_APP = 0.1;

// FR : contenu constant, aucune donnée utilisateur : sans risque pour dangerouslySetInnerHTML.
const SVG = emblemeSvg("fa-fond", 'style="display:block;width:100%;height:auto"');

export default function FondLogo() {
  return (
    <div
      aria-hidden="true"
      data-fond-logo=""
      style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ width: "min(72vmin, 820px)", opacity: OPACITE_FOND_APP }} dangerouslySetInnerHTML={{ __html: SVG }} />
    </div>
  );
}
