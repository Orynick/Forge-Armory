// FR : ⚠️ AJOUT (14/10/2026, v0.4.11), demande de l'utilisateur : sur les VIGNETTES, l'icône de saison plus grande, « à la même taille que l'icône d'arme façonnée », sur TOUTES les armes et armures (façonnées ou non). Elle remplace la superposition du filigrane entier (le symbole y était trop petit). Posée en HAUT À GAUCHE (l'icône façonnée est en bas à gauche), avec le même petit fond translucide et les mêmes marges que l'icône façonnée ; le symbole y a la MÊME TAILLE VISIBLE que le dessin de l'icône façonnée (`tailleGlypheVignette`). À placer dans un conteneur `position: relative` de la taille de la vignette. Rien n'est dessiné sans filigrane. EN: ⚠️ ADDED - season icon on thumbnails at the same visible size as the crafted icon, top-left.
import type { Database } from "sql.js";
import IconeSaison, { CADRAGE_SAISON } from "./IconeSaison";
import { obtenirSaisonObjet } from "../lib/manifest/saison";
import { tailleGlypheVignette } from "../lib/forge/tailleVignette";

export default function BadgeSaison({ db, itemHash, taille }: { db?: Database | null; itemHash?: number; taille: number }) {
  if (!obtenirSaisonObjet(db, itemHash)) return null;
  const boite = Math.round(tailleGlypheVignette(taille) / CADRAGE_SAISON.partSymbole);   // la boîte est un peu plus grande que le symbole qu'elle contient
  return (
    <span data-badge-saison="" style={{ position: "absolute", left: 2, top: 2, lineHeight: 0, background: "rgba(13,15,20,0.55)", borderRadius: 3, padding: taille >= 40 ? 2 : 1 }}>
      <IconeSaison db={db} itemHash={itemHash} taille={boite} />
    </span>
  );
}
