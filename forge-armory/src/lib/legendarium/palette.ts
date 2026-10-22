// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - PALETTE verrouillée « Parchemin / Hologramme » (spécification §5). Option retenue : D1 = parchemin (serif, ivoire, beige, brun profond), D2 = hologramme (sans-serif, cyan pâle, bordures lumineuses, bleu-noir). REPLI (option 1) : ambre (D1) / bleu acier (D2) sur fond neutre commun. Le code couleur par section (cinq teintes) est EXCLU. Centralisé ici : passer au repli ne demande qu'un échange de ces constantes (comme `ERA_STYLES` de la maquette de référence). / EN: locked "Parchment / Hologram" palette (spec §5). Fallback (option 1): amber (D1) / steel blue (D2) on a common neutral background. Per-section colour coding (five hues) is EXPLICITLY excluded. Centralised here: switching to the fallback only requires swapping these constants (like `ERA_STYLES` in the reference mockup).
import type { EreLegendarium, SectionLegendarium } from "./types";

/** FR : classes/constantes de la palette, par ère. Les valeurs sont des styles inline (l'appli n'utilise pas Tailwind en dehors de la maquette de référence). / EN: palette constants, per era. Values are inline styles (the app does not use Tailwind outside the reference mockup). */
export interface StyleEre {
  /** FR : fond de la zone de lecture. / EN: reading area background. */
  fondPage: string;
  /** FR : couleur de bordure. / EN: border colour. */
  bordure: string;
  /** FR : couleur de l'œilleton (étiquette de section/livre). / EN: eyebrow (section/book label) colour. */
  oeilleton: string;
  /** FR : famille de police du titre. / EN: title font family. */
  policeTitre: string;
  /** FR : couleur du titre. / EN: title colour. */
  couleurTitre: string;
  /** FR : graisse du titre. / EN: title weight. */
  graisseTitre: string;
  /** FR : style du corps de texte (police + couleur + interligne). / EN: body text style (font + colour + leading). */
  policeCorps: string;
  couleurCorps: string;
  /** FR : lueur froide de l'hologramme (ombre portée du fond). / EN: cold glow of the hologram (background shadow). */
  lueur?: string;
}

/** FR : option 2 (retenue) — Parchemin (D1) / Hologramme (D2). / EN: option 2 (chosen) — Parchment (D1) / Hologram (D2). */
export const PALETTE_PRINCIPALE: Record<EreLegendarium, StyleEre> = {
  d1: {
    fondPage: "#2b2116",
    bordure: "#8a6d3b",
    oeilleton: "#b99a5e",
    policeTitre: "Georgia, 'Times New Roman', serif",
    couleurTitre: "#f0e6d2",
    graisseTitre: "400",
    policeCorps: "Georgia, 'Times New Roman', serif",
    couleurCorps: "#e5d8bd",
  },
  d2: {
    fondPage: "#0d1520",
    bordure: "#1e3a5f",
    oeilleton: "#3d7eb5",
    policeTitre: "inherit",
    couleurTitre: "#cfe8ff",
    graisseTitre: "600",
    policeCorps: "inherit",
    couleurCorps: "#a8c6e2",
    lueur: "0 0 24px rgba(61, 126, 181, 0.25)",
  },
};

/** FR : option 1 (REPLI, si le rendu parchemin est trop coûteux ou peu lisible) — ambre (D1) / bleu acier (D2) sur fond neutre commun. / EN: option 1 (FALLBACK, if the parchment rendering is too costly or hard to read) — amber (D1) / steel blue (D2) on a common neutral background. */
export const PALETTE_REPLI: Record<EreLegendarium, StyleEre> = {
  d1: {
    fondPage: "#1a1a1a",
    bordure: "#8a6d3b",
    oeilleton: "#d99a2b",
    policeTitre: "inherit",
    couleurTitre: "#f0e6d2",
    graisseTitre: "600",
    policeCorps: "inherit",
    couleurCorps: "#e5d8bd",
  },
  d2: {
    fondPage: "#1a1a1a",
    bordure: "#4a6a8a",
    oeilleton: "#5a7a9a",
    policeTitre: "inherit",
    couleurTitre: "#cfe8ff",
    graisseTitre: "600",
    policeCorps: "inherit",
    couleurCorps: "#a8c6e2",
  },
};

/** FR : palette active (échangeable en une ligne pour passer au repli). / EN: active palette (one-line swap to switch to the fallback). */
export const PALETTE: Record<EreLegendarium, StyleEre> = PALETTE_PRINCIPALE;

/** FR : ère d'une section : seul le Grimoire D1 est « d1 », tout le reste est « d2 ». / EN: era of a section: only the D1 Grimoire is "d1", everything else is "d2". */
export function ereDeSection(section: SectionLegendarium): EreLegendarium {
  return section === "grimoire" ? "d1" : "d2";
}
