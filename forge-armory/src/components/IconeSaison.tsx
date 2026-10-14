// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) puis CORRIGÉ le même jour, demande de l'utilisateur : l'ICÔNE DE SAISON « directement à droite du nom » dans les fenêtres Détails ; puis « il y a une espèce de CADRE NOIR autour de l'icône de saison : possible de l'enlever ? ».
// L'image de Bungie (`iconWatermark`) est un FILIGRANE de vignette : une image de la taille de la vignette, avec le symbole dessiné en haut à gauche, ET UNE BANDE SOMBRE TRANSLUCIDE derrière lui (mesurée sur la capture du jeu de l'utilisateur, vignette de 212 px : symbole de 5,7 % à 20,3 % de la largeur et de 3,8 % à 19,3 % de la hauteur ; la bande, elle, s'arrête net à 25,9 % de la largeur). Isolé à côté d'un nom, le symbole est cadré de près ; le premier cadrage (de 3 % à 35 %) englobait le BORD de la bande : c'était le cadre noir.
// DEUX corrections : (1) cadrage SERRÉ sur le symbole seul, qui s'arrête avant le bord de la bande (de 4 % à 23 %) ; (2) `mix-blend-mode: screen` : en mode « écran », tout ce qui est sombre (la bande, même translucide) devient invisible sur le fond sombre de la fenêtre, et le symbole blanc reste blanc. Rien n'est affiché sans filigrane.
// ⚠️ HYPOTHÈSE à contrôler sur de vraies saisons : les mesures viennent d'UN symbole (celui de la capture) ; les autres saisons ont des symboles de forme différente mais dessinés dans la même zone ; le cadrage garde environ un quart de marge pour les absorber. Si un symbole était coupé, ajuster les trois nombres de `CADRAGE_SAISON` (un seul endroit). EN: ⚠️ ADDED then FIXED - tight crop on the symbol (before the dark band's edge) plus screen blending, so no dark frame shows.
import type { Database } from "sql.js";
import { libelleSaison, obtenirSaisonObjet } from "../lib/manifest/saison";

/**
 * FR : le coin montré : départ horizontal `x`, départ vertical `y` et côté `fraction`, en proportion de l'image ; `partSymbole` : la part du côté occupée par le symbole mesuré (sert à donner au symbole la même taille visible que l'icône façonnée sur les vignettes).
 * EN: the corner shown, as fractions of the image; `partSymbole`: the share of the side the measured symbol fills.
 */
export const CADRAGE_SAISON = { x: 0.04, y: 0.025, fraction: 0.19, partSymbole: 0.77 } as const;

export default function IconeSaison({ db, itemHash, taille = 18 }: { db?: Database | null; itemHash?: number; taille?: number }) {
  const saison = obtenirSaisonObjet(db, itemHash);
  if (!saison) return null;
  const cote = taille / CADRAGE_SAISON.fraction;
  const libelle = libelleSaison(saison);
  return (
    <span data-icone-saison="" role="img" aria-label={libelle} title={libelle} style={{ position: "relative", display: "inline-block", width: taille, height: taille, overflow: "hidden", flexShrink: 0, verticalAlign: "middle", background: "transparent" }}>
      <img src={saison.filigrane} alt="" aria-hidden="true" width={cote} height={cote} draggable={false} style={{ position: "absolute", left: -CADRAGE_SAISON.x * cote, top: -CADRAGE_SAISON.y * cote, maxWidth: "none", mixBlendMode: "screen" }} />
    </span>
  );
}
