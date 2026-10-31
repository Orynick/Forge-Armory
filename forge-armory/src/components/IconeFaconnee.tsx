// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - l'icône « ARME FAÇONNÉE » du jeu (quatre blocs séparés par une croix évasée), dans la teinte saumon corail qu'elle a en jeu ; données générées par `scripts/tracer-icone-faconnee.py` (voir `data/forge/iconeFaconnee.ts`). DÉCORATIVE : le nom accessible et l'infobulle sont portés par l'élément qui l'entoure (`aria-label` « Arme façonnée »). / EN: ⚠️ ADDED - the game's "crafted weapon" icon, decorative (the wrapper carries the accessible name).
import { ICONE_FACONNEE } from "../data/forge/iconeFaconnee";

export default function IconeFaconnee({ taille = 16 }: { taille?: number }) {
  return (
    <svg data-icone-faconnee="" aria-hidden="true" focusable="false" width={taille} height={Math.round((taille * ICONE_FACONNEE.hauteur) / ICONE_FACONNEE.largeur)} viewBox={`0 0 ${ICONE_FACONNEE.largeur} ${ICONE_FACONNEE.hauteur}`} style={{ display: "block", flexShrink: 0 }}>
      <path d={ICONE_FACONNEE.chemin} fill={ICONE_FACONNEE.couleur} />
    </svg>
  );
}
