"use strict";
// FR : ⚠️ AJOUT (02/10/2026, v0.3.0) - tout ce qui sert à garantir que l'export PDF d'une fiche tient
// sur UNE SEULE page. Signalé par l'utilisateur le 02/10/2026 : « en export PDF, il y a deux pages »
// (sur son Windows ; le défaut n'a pas pu être reproduit hors de ce poste).
//
// Principe ancien : le logiciel mesurait la page À L'ÉCRAN, puis imprimait sur une page de cette
// hauteur + 1 px. Si l'IMPRESSION met le contenu en page un peu plus haut que l'écran (texte qui
// passe à la ligne autrement, mise à l'échelle de l'affichage de Windows...), le surplus, même de
// quelques pixels, part sur une 2e page.
//
// Principe actuel, qui ne dépend plus de la cause :
//   1. on mesure la hauteur SOUS LE MÉDIA « print » (celui de l'impression), pas seulement à l'écran ;
//   2. la page est plus haute que le contenu d'une marge de sécurité (fond sombre, invisible) ;
//   3. un style réservé à l'impression fixe la taille de la page (@page) et la hauteur de la page web,
//      et interdit tout débordement ;
//   4. en dernier recours, on n'imprime que la PREMIÈRE page (`pageRanges: "1"`) : une 2e page ne peut
//      plus exister dans le fichier.
// Ce module n'est utilisé QUE par la branche PDF : les captures PNG et JPEG ne passent pas ici.
// Fonctions pures (aucune dépendance à Electron) : testées hors du logiciel.
// EN: ⚠️ ADDED - everything that guarantees the PDF export fits on ONE page: measure the height under
// the PRINT media, add a safety margin, force the page size with a print-only style, and as a last resort
// print only page 1. Only used by the PDF branch; PNG and JPEG captures do not go through here.

/** FR : marge de sécurité ajoutée sous le contenu : un peu plus d'une ligne de texte (le fond sombre la rend invisible). / EN: safety margin under the content. */
const MARGE_SECURITE_PX = 24;
/** FR : même plafond que la capture d'image (main.cjs). / EN: same ceiling as the image capture. */
const HAUTEUR_MAX_PX = 20000;
const PX_PAR_POUCE = 96;

/** FR : hauteur de page : la plus grande des deux mesures (écran, impression) plus la marge. / EN: page height: the larger of both measures plus the margin. */
function hauteurPagePdf(hauteurEcran, hauteurImpression) {
  const e = Number(hauteurEcran) || 0;
  const i = Number(hauteurImpression) || 0;
  return Math.min(HAUTEUR_MAX_PX, Math.ceil(Math.max(e, i)) + MARGE_SECURITE_PX);
}

/** FR : expression JavaScript renvoyant la hauteur de la page web (à évaluer sous le média « print »). / EN: expression returning the page height (evaluate under print media). */
const EXPRESSION_HAUTEUR =
  "Math.ceil(Math.max(document.documentElement.getBoundingClientRect().height, document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0))";

/** FR : style réservé à l'impression : page de la taille exacte, aucun débordement possible. / EN: print-only style: exact page size, no overflow possible. */
function cssPageUnique(largeurPx, hauteurPagePx) {
  return (
    `@page{size:${largeurPx}px ${hauteurPagePx}px;margin:0}` +
    `html,body{height:${hauteurPagePx}px !important;min-height:${hauteurPagePx}px !important;overflow:hidden !important}`
  );
}

/** FR : expression JavaScript qui ajoute ce style à la page (autorisé par `style-src 'unsafe-inline'` de la page d'export). / EN: expression adding that style to the page. */
function expressionInjectionCss(largeurPx, hauteurPagePx) {
  return (
    "(() => { const s = document.createElement('style'); s.id = 'pdf-une-page'; s.textContent = " +
    JSON.stringify(cssPageUnique(largeurPx, hauteurPagePx)) +
    "; document.head.appendChild(s); return true; })()"
  );
}

/** FR : options de `webContents.printToPDF` : une page, taille imposée, aucune marge, première page seulement. / EN: printToPDF options. */
function optionsPdf(largeurPx, hauteurPagePx) {
  return {
    printBackground: true,
    preferCSSPageSize: true,
    pageSize: { width: largeurPx / PX_PAR_POUCE, height: hauteurPagePx / PX_PAR_POUCE },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    pageRanges: "1",
  };
}

module.exports = { MARGE_SECURITE_PX, hauteurPagePdf, EXPRESSION_HAUTEUR, cssPageUnique, expressionInjectionCss, optionsPdf };
