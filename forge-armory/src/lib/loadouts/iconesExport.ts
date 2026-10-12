// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - ICÔNES de l'EXPORT INFOGRAPHIQUE sous forme de HTML/SVG (la page d'export est une page autonome fabriquée de façon synchrone, sans React) : icône de classe, icône d'élément, logos de section
// et icône de contexte. Les dessins sont ceux de l'appli : mêmes constantes que `IconeClasse` et `IconeElement` (aucune copie), logos SVG de la charte graphique (`data/forge/logosExport.ts`, généré).
// Politique de sécurité de la page d'export : images uniquement depuis www.bungie.net, aucun script : tout le reste est du SVG en ligne.
// EN: ⚠️ ADDED - export-page icons as HTML/SVG strings (class, element, section logos, context icon), sharing the app's drawing constants.

import type { DamageElement } from "../../types/build";
import { COULEURS as COULEURS_CLASSE, CHEMINS_SVG as CHEMINS_CLASSE, LIBELLES as LIBELLES_CLASSE } from "../../components/icones/IconeClasse";
import { COULEURS as COULEURS_ELEMENT, FORMES as FORMES_ELEMENT, PRISMATIQUE_TRACES, PRISMATIQUE_TRANSFORM, PRISMATIQUE_VIEWBOX } from "../../components/icones/IconeElement";
import { LOGOS_EXPORT, CleLogoExport } from "../../data/forge/logosExport";

const ORIGINE_ICONES = "https://www.bungie.net/";
const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** FR : icône de classe : disque coloré et symbole blanc à 68 % du disque, exactement comme `IconeClasse`. / EN: class icon, same as the in-app one. */
export function htmlIconeClasse(classe: "titan" | "chasseur" | "arcaniste", taille = 20): string {
  const t = Math.round(taille * 0.68);
  return `<span class="ic-classe" role="img" aria-label="${LIBELLES_CLASSE[classe]}" style="width:${taille}px;height:${taille}px;background:${COULEURS_CLASSE[classe]}"><svg width="${t}" height="${t}" viewBox="0 0 32 32" fill="#ffffff" aria-hidden="true"><path d="${CHEMINS_CLASSE[classe]}"/></svg></span>`;
}

/**
 * FR : icône d'élément : l'icône OFFICIELLE de Bungie quand l'adresse est connue (seule adresse acceptée : www.bungie.net, la sécurité de la page n'en autorise pas d'autre), sinon le dessin de l'appli
 * (Prismatique : son symbole à deux tons ; les autres : une forme et une couleur par élément). / EN: official Bungie icon when known, otherwise the app's drawing.
 */
export function htmlIconeElement(element: Exclude<DamageElement, null>, urlOfficielle: string | undefined, taille = 20): string {
  if (urlOfficielle && urlOfficielle.startsWith(ORIGINE_ICONES)) return `<img class="ic-element" src="${echapper(urlOfficielle)}" alt="${echapper(element)}" width="${taille}" height="${taille}">`;
  if (element === "prismatique") {
    return `<svg class="ic-element" width="${taille}" height="${taille}" viewBox="${PRISMATIQUE_VIEWBOX}" role="img" aria-label="prismatique"><g transform="${PRISMATIQUE_TRANSFORM}">${PRISMATIQUE_TRACES.map((t) => `<path fill="${t.fill}" d="${t.d}"/>`).join("")}</g></svg>`;
  }
  const couleur = COULEURS_ELEMENT[element], trait = element === "stase" || element === "filobscur";
  return `<svg class="ic-element" width="${taille}" height="${taille}" viewBox="0 0 16 16" role="img" aria-label="${echapper(element)}"><path d="${FORMES_ELEMENT[element]}" fill="${trait ? "none" : couleur}" stroke="${trait ? couleur : "none"}" stroke-width="${trait ? 1.6 : 0}" stroke-linecap="round"/></svg>`;
}

/** FR : logo d'une section (DOCTRINE, ARMES, ARMURE, ARTEFACT), ou chaîne vide s'il n'existe pas : le titre s'affiche alors sans logo, comme avant. ⚠️ Depuis l'archive de visuels v3 (12/10/2026) les quatre existent (ARMES : l'épée seule ; ARMURE : le bouclier seul). / EN: section logo, or "" when absent. */
export function htmlLogoSection(cle: "doctrine" | "armes" | "armure" | "artefact"): string {
  const svg = LOGOS_EXPORT[cle as CleLogoExport];
  return svg ? `<span class="logo-section">${svg}</span>` : "";
}

/** FR : icône du contexte du build (Neutre, PvE Roaming, PvE DPS, PvP). / EN: build context icon. */
export function htmlLogoContexte(contexte: "neutre" | "roaming" | "dps" | "pvp"): string {
  const svg = LOGOS_EXPORT[contexte as CleLogoExport];
  return svg ? `<span class="logo-contexte">${svg}</span>` : "";
}
