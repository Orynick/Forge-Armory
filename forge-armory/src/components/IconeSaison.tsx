// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) puis CORRIGÉ le même jour, demande de l'utilisateur : l'ICÔNE DE SAISON « directement à droite du nom » dans les fenêtres Détails ; puis « il y a une espèce de CADRE NOIR autour de l'icône de saison : possible de l'enlever ? ».
// L'image de Bungie (`iconWatermark`) est un FILIGRANE de vignette : une image de la taille de la vignette, avec le symbole dessiné en haut à gauche, ET UNE BANDE SOMBRE TRANSLUCIDE derrière lui (mesurée sur la capture du jeu de l'utilisateur, vignette de 212 px : symbole de 5,7 % à 20,3 % de la largeur et de 3,8 % à 19,3 % de la hauteur ; la bande, elle, s'arrête net à 25,9 % de la largeur). Isolé à côté d'un nom, le symbole est cadré de près ; le premier cadrage (de 3 % à 35 %) englobait le BORD de la bande : c'était le cadre noir.
// DEUX corrections : (1) cadrage SERRÉ sur le symbole seul, qui s'arrête avant le bord de la bande (de 4 % à 23 %) ; (2) `mix-blend-mode: screen` : en mode « écran », tout ce qui est sombre (la bande, même translucide) devient invisible sur le fond sombre de la fenêtre, et le symbole blanc reste blanc. Rien n'est affiché sans filigrane.
// ⚠️ HYPOTHÈSE à contrôler sur de vraies saisons : les mesures viennent d'UN symbole (celui de la capture) ; les autres saisons ont des symboles de forme différente mais dessinés dans la même zone ; le cadrage garde environ un quart de marge pour les absorber. Si un symbole était coupé, ajuster les trois nombres de `CADRAGE_SAISON` (un seul endroit). EN: ⚠️ ADDED then FIXED - tight crop on the symbol (before the dark band's edge) plus screen blending, so no dark frame shows.
import { useVersionSaisons } from "./useVersionSaisons";
import type { Database } from "sql.js";
import { libelleSaison, obtenirSaisonObjet } from "../lib/manifest/saison";
import { saisonDeLObjet, saisonParNumero } from "../data/saisons";   // ⚠️ AJOUT (19/10/2026) : secours de l'infobulle (table objet→saison de d2-additional-info)

/**
 * FR : le coin montré : départ horizontal `x`, départ vertical `y` et côté `fraction`, en proportion de l'image.
 * EN: the corner shown, as fractions of the image;
 */
export const CADRAGE_SAISON = { x: 0.04, y: 0.025, fraction: 0.19 } as const;

export default function IconeSaison({ db, itemHash, taille = 18 }: { db?: Database | null; itemHash?: number; taille?: number }) {
  useVersionSaisons(db);   // ⚠️ AJOUT (14/10/2026, v0.4.11) : se réaffiche quand les noms déduits du filigrane sont prêts
  const saison = obtenirSaisonObjet(db, itemHash);
  if (!saison) return null;
  const cote = taille / CADRAGE_SAISON.fraction;
  // FR : ⚠️ AJOUT (19/10/2026, second retour de test : « filigrane présent mais pas de nom de saison au survol ») - SECOURS DE L'INFOBULLE : quand le Manifest ne donne ni nom ni numéro (le cas de l'utilisateur : « 0 filigrane relié à une saison »), le numéro vient de la table objet→saison de d2-additional-info (57 439 objets, MIT) et le nom de la table des saisons locale. L'infobulle ne dit plus jamais juste « Saison de l'objet » quand la saison est connue. / EN: tooltip fallback through the d2-additional-info item→season table.
  let libelle = libelleSaison(saison);
  if (!saison.nom) {
    const n = saisonDeLObjet(itemHash);
    const table = n != null ? saisonParNumero(n) : undefined;
    if (table?.nom) libelle = `${table.nom}${n != null ? ` (saison ${n})` : ""}`;
  }
  return (
    <span data-icone-saison="" role="img" aria-label={libelle} title={libelle} style={{ position: "relative", display: "inline-block", width: taille, height: taille, overflow: "hidden", flexShrink: 0, verticalAlign: "middle", background: "transparent" }}>
      <img src={saison.filigrane} alt="" aria-hidden="true" width={cote} height={cote} draggable={false} style={{ position: "absolute", left: -CADRAGE_SAISON.x * cote, top: -CADRAGE_SAISON.y * cote, maxWidth: "none", mixBlendMode: "screen" }} />
    </span>
  );
}
