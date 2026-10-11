// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - géométrie de l'EN-TÊTE de l'appli avec
// l'identité visuelle Forge Armory (image fournie par l'utilisateur le 01/10/2026).
// REMPLACE `placementLogo.ts` (placement par mesure des lettres à l'affichage) :
// le texte « Forge Armory / Destiny 2 Build Analyzer / par Orynick/Orygamer » est
// désormais dans l'IMAGE, donc la géométrie est connue d'avance et fixe.
//
// Règle choisie par l'utilisateur : le CERCLE de l'emblème va du HAUT du titre
// (le « F » de « FORGE ») au BAS du sous-titre ; le bloc de texte est décalé à
// DROITE de l'emblème ; les losanges dépassent au-dessus et au-dessous du cercle.
// Taille « B » (la plus compacte des deux aperçus), validée par l'utilisateur.
//
// Toutes les mesures sont en pixels de l'image d'origine (1254 x 1254), relevées
// avec ressources-installateur/forge-armory/generer-icones.py (voir son en-tête).
// Fonction PURE : les nombres se vérifient hors de l'appli.
// EN: ⚠️ ADDED - header geometry for the Forge Armory identity image. Replaces the
// measuring placement: the text is now in the image, so geometry is fixed. The
// emblem's CIRCLE spans from the title's top to the subtitle's bottom; text block
// shifted RIGHT of the emblem. Size "B" (compact), validated by the user.

export const MESURES_IDENTITE = {
  /** FR : zone de l'emblème (losanges et flèches compris) = (245,28)-(1005,884). / EN: emblem area. */
  emblemeLargeur: 760,
  emblemeHauteur: 856,
  /** FR : de la pointe de la flèche droite (x = 999) au bord gauche de la zone. / EN: right arrow tip from the area's left edge. */
  emblemeBordDroit: 754,
  /** FR : haut du cercle dans la zone (y = 152,8 − 28) et son diamètre extérieur. / EN: circle top and outer diameter. */
  cercleHaut: 124.8,
  cercleDiametre: 581.6,
  /** FR : zone du bloc texte = (120,905)-(1149,1107), et son encre : haut du titre (y = 911), bas du sous-titre (y = 1102), bord gauche du « F » (x = 124). / EN: text block area and its ink. */
  texteLargeur: 1029,
  texteHauteur: 202,
  texteHautEncre: 6,
  texteBasEncre: 197,
  texteBordGauche: 4,
} as const;

/** FR : pixels d'écran par pixel d'image : taille « B ». / EN: screen px per image px: size "B". */
export const ECHELLE_EN_TETE = 0.37;
/** FR : espace entre l'emblème et le texte, en fraction du diamètre du cercle. / EN: emblem-text gap as a fraction of the circle diameter. */
export const ECART_RELATIF = 0.29;

export interface GeometrieEnTete {
  emblemeGauche: number;
  emblemeHaut: number;
  emblemeLargeur: number;
  emblemeHauteur: number;
  texteGauche: number;
  texteHaut: number;
  texteLargeur: number;
  texteHauteur: number;
  largeur: number;
  hauteur: number;
  /** FR : diamètre affiché du cercle, en px. / EN: displayed circle diameter. */
  diametreCercle: number;
}

export function calculerGeometrieEnTete(k: number = ECHELLE_EN_TETE): GeometrieEnTete {
  const m = MESURES_IDENTITE;
  // FR : le diamètre du cercle = la hauteur d'encre du bloc texte (haut du titre -> bas du sous-titre).
  const diametre = (m.texteBasEncre - m.texteHautEncre) * k;
  const e = diametre / m.cercleDiametre; // échelle de l'emblème
  // FR : si l'emblème dépasse au-dessus du texte (losange du haut), le texte descend d'autant.
  const texteHaut = Math.max(0, m.cercleHaut * e - m.texteHautEncre * k);
  const emblemeHaut = texteHaut + m.texteHautEncre * k - m.cercleHaut * e;
  const texteGauche = m.emblemeBordDroit * e + ECART_RELATIF * diametre - m.texteBordGauche * k;
  const arrondi = (v: number) => Math.round(v * 100) / 100;
  return {
    emblemeGauche: 0,
    emblemeHaut: arrondi(emblemeHaut),
    emblemeLargeur: arrondi(m.emblemeLargeur * e),
    emblemeHauteur: arrondi(m.emblemeHauteur * e),
    texteGauche: arrondi(texteGauche),
    texteHaut: arrondi(texteHaut),
    texteLargeur: arrondi(m.texteLargeur * k),
    texteHauteur: arrondi(m.texteHauteur * k),
    largeur: arrondi(texteGauche + m.texteLargeur * k),
    hauteur: arrondi(Math.max(emblemeHaut + m.emblemeHauteur * e, texteHaut + m.texteHauteur * k)),
    diametreCercle: arrondi(diametre),
  };
}
