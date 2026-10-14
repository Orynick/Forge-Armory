// FR : ⚠️ AJOUT (14/10/2026, v0.4.11), demande de l'utilisateur : l'ICÔNE DE SAISON « directement à droite du nom » dans les fenêtres Détails (Mon Build, Coffre, Mon Inventaire, Forge, Collection). Le filigrane de Bungie est une image de la taille d'une vignette avec le symbole dans son coin en haut à gauche : isolé à côté d'un nom, il serait minuscule. On n'en montre donc que le COIN (`DEPART` et `FRACTION`, en proportion de l'image) agrandi à la taille d'un titre.
// ⚠️ HYPOTHÈSE à contrôler sur de vrais objets : sur la capture de l'utilisateur (vignette du jeu), le symbole occupe environ 8 % à 29 % de la largeur en haut à gauche ; le cadrage garde une marge de chaque côté pour absorber une erreur de quelques points. Si un symbole apparaissait coupé ou trop petit, ajuster ces deux constantes (un seul endroit).
// Nom accessible et infobulle : le nom de la saison (et son numéro) ; rien n'est affiché sans filigrane. EN: ⚠️ ADDED - the season icon next to the name in the Details windows: only the corner of the watermark where the symbol sits (assumption, to be checked on real items).
import type { Database } from "sql.js";
import { libelleSaison, obtenirSaisonObjet } from "../lib/manifest/saison";

/** FR : le coin montré : départ et côté, en proportion de l'image (hypothèse, voir plus haut). / EN: the corner shown, as a fraction of the image. */
export const CADRAGE_SAISON = { depart: 0.03, fraction: 0.32 } as const;

export default function IconeSaison({ db, itemHash, taille = 18 }: { db?: Database | null; itemHash?: number; taille?: number }) {
  const saison = obtenirSaisonObjet(db, itemHash);
  if (!saison) return null;
  const cote = taille / CADRAGE_SAISON.fraction;
  const libelle = libelleSaison(saison);
  return (
    <span data-icone-saison="" role="img" aria-label={libelle} title={libelle} style={{ position: "relative", display: "inline-block", width: taille, height: taille, overflow: "hidden", flexShrink: 0, verticalAlign: "middle" }}>
      <img src={saison.filigrane} alt="" aria-hidden="true" width={cote} height={cote} draggable={false} style={{ position: "absolute", left: -CADRAGE_SAISON.depart * cote, top: -CADRAGE_SAISON.depart * cote, maxWidth: "none" }} />
    </span>
  );
}
