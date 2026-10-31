// FR : Icônes des 6 éléments de doctrine (Solaire, Arc, Abyssal, Stase,
// Filobscur, Prismatique).
//
// ⚠️ POURQUOI CE FICHIER (04/08/2026) - l'utilisateur a signalé que l'icône
// d'élément ne s'affichait jamais dans les loadouts. Cause : il n'existait
// aucune icône d'élément dans le code — "Doctrine" n'affiche que le NOM en
// texte (LIBELLES_ELEMENT dans GrilleDoctrine.tsx), jamais d'icône. Le
// composant Loadouts tentait de lire une icône depuis le Manifest
// (obtenirIconesDamageType), mais la correspondance nom → hash échouait
// silencieusement, laissant `iconesElement.get(element)` toujours vide.
//
// Plutôt que de dépendre du Manifest pour un simple pictogramme (et
// reproduire le problème), ce fichier fournit 6 formes SIMPLES et FIABLES,
// une par élément, sans aucune dépendance externe.
//
// EN: ⚠️ WHY THIS FILE - the user reported the element icon never showing in
// loadouts. Cause: no element icon existed anywhere in the code - "Doctrine"
// only displays the NAME as text, never an icon. The Loadouts component tried
// reading one from the Manifest, but the name→hash match silently failed.
// Rather than depend on the Manifest for a simple pictogram, this file
// provides 6 SIMPLE, RELIABLE shapes with no external dependency.

import { DamageElement } from "../../types/build";

export const COULEURS: Record<Exclude<DamageElement, null>, string> = {
  solaire: "#f0782d",
  arc: "#7de3f4",
  abyssal: "#8b5cf6",
  stase: "#4d88d6",
  filobscur: "#0a8f5c",
  prismatique: "#e8e6df",
};

// FR : une forme distincte par élément (pas juste une pastille de couleur,
// pour rester lisible même en niveaux de gris ou pour les daltoniens).
// EN: a distinct shape per element (not just a coloured dot), to stay
// legible in greyscale or for colourblind users.
export const FORMES: Record<Exclude<DamageElement, null>, string> = {
  // Solaire : flamme
  solaire: "M8 1c1 3-2 4-2 6.5C6 9.9 7.1 11 8 11s2-1.1 2-3.5c0-1-.5-2-1-2.5.8.3 2.5 1.7 2.5 4.5A3.5 3.5 0 0 1 8 13a3.5 3.5 0 0 1-3.5-3.5C4.5 6.5 6.5 4 8 1z",
  // Arc : éclair
  arc: "M9.5 1 3 9h3.5L6 15l6.5-8H9L9.5 1z",
  // Abyssal : triangle inversé (comme le blason du jeu)
  abyssal: "M8 13 1.5 3h13L8 13z",
  // Stase : flocon (croix à 3 branches)
  stase: "M8 1v14M2 4.5l12 7M14 4.5l-12 7",
  // Filobscur : fil noué
  filobscur: "M2 8a3 3 0 1 1 6 0 3 3 0 1 0 6 0M2 8a3 3 0 1 0 6 0 3 3 0 1 1 6 0",
  // Prismatique : losange à facettes
  prismatique: "M8 1 14 8 8 15 2 8 8 1zM8 1v14M2 8h12",
};

interface Props {
  element: DamageElement;
  taille?: number;
  /**
   * FR : ⚠️ AJOUT (04/08/2026) - URL de l'icône OFFICIELLE Bungie, si
   * disponible (voir `obtenirIconeElementDoctrine` dans doctrine.ts).
   * Priorité sur la forme dessinée à la main : c'est exactement l'icône que
   * l'utilisateur a fournie en capture d'écran. La forme dessinée reste en
   * repli pour le Prismatique (qui n'a pas d'icône officielle, ce n'est pas
   * un type de dégâts) et pour les cas hors ligne sans Manifest.
   * EN: ⚠️ ADDED - OFFICIAL Bungie icon URL, if available. Takes priority
   * over the hand-drawn shape: it's the exact icon the user provided as a
   * screenshot. The hand-drawn shape stays as a fallback for Prismatic
   * (which has no official icon) and offline cases.
   */
  urlOfficielle?: string;
}

// FR : ⚠️ CHANGÉ (08/09/2026) - la forme "losange à facettes" ci-dessus
// était un repli PROVISOIRE, documenté comme tel depuis le 04/08 ("le
// Prismatique n'a pas d'icône officielle, ce n'est pas un type de
// dégâts"). L'utilisateur a fourni le vrai symbole Prismatique
// (fichier "Prismatic Custom Colour.svg") : le losange n'est donc plus
// utilisé QUE si jamais cette forme dédiée échouait à s'afficher, ce qui
// ne devrait jamais arriver — gardé en commentaire de contexte plutôt que
// supprimé, au cas où une future icône séparée à contour simple soit utile.
// EN: ⚠️ CHANGED - the "faceted diamond" shape above was an explicit
// PLACEHOLDER since 04/08. The user provided the real Prismatic symbol;
// the diamond is no longer used, kept only as context.

// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - tracés du symbole Prismatique en DONNÉES, partagés entre `SymbolePrismatique` (ci-dessous) et l'export infographique (`lib/loadouts/iconesExport.ts`) : une seule copie des 6 tracés. Contenu identique à l'ancien JSX, simplement déplacé.
// EN: ⚠️ ADDED - the Prismatic symbol paths as data, shared with the export page (one copy).
export const PRISMATIQUE_VIEWBOX = "0 0 861.42857 771.42857";
export const PRISMATIQUE_TRANSFORM = "translate(315.56965,219.36964)";
export const PRISMATIQUE_TRACES: { fill: string; d: string }[] = [
  { fill: "#483737", d: "M -179.62852,551.78714 46.744506,523.16764" },
  { fill: "#b66c9a", d: "m -179.89891,552.05389 276.869541,-771.42353 -49.873,742.79786 c 0,0 -108.752079,5.68533 -226.996541,28.62567 z" },
  { fill: "#b66c9a", d: "M -290.92887,398.42142 38.022186,-172.83904 c 0,0 -177.627416,20.93356 -285.989376,192.780303 -108.36195,171.846747 -57.46467,333.910837 -42.96168,378.480157 z" },
  { fill: "#b66c9a", d: "M 406.45405,552.05389 129.58451,-219.36964 179.4575,523.42822 c 0,0 108.7521,5.68533 226.99655,28.62567 z" },
  { fill: "#b66c9a", d: "M 520.6308,398.42142 191.67974,-172.83904 c 0,0 177.62743,20.93356 285.98936,192.780303 108.36197,171.846747 57.46471,333.910837 42.9617,378.480157 z" },
  { fill: "#483737", d: "M -179.54392,551.78714 46.969979,523.16764" },
];

/**
 * FR : symbole Prismatique officiel, fourni par l'utilisateur
 * ("Prismatic Custom Colour.svg", 08/09/2026) — reproduit tel quel
 * (viewBox, transform de groupe et 2 couleurs d'origine), sans passer par
 * le système FORMES/COULEURS à tracé unique des 5 autres éléments : ce
 * symbole a sa propre palette à 2 tons (contrairement aux autres, qui sont
 * tous monochromes), une abstraction commune aurait donc perdu de
 * l'information plutôt qu'en gagner.
 * EN: official Prismatic symbol, provided by the user - reproduced as-is
 * (original viewBox, group transform, and 2 colours), kept separate from
 * the single-path FORMES/COULEURS system used by the other 5 elements
 * since this symbol has its own two-tone palette.
 *
 * FR : ⚠️ Le fichier d'origine contenait 8 tracés de "ligne" quasi
 * identiques (path252/594/638/650/662/674/686/698, mêmes coordonnées à
 * un centième de pixel près) — des artefacts d'export Inkscape sans
 * incidence visuelle : ce sont des segments de droite REMPLIS sans
 * `stroke`, qui n'ont donc aucune surface à remplir et ne s'affichent pas.
 * 2 conservés à titre représentatif plutôt que les 8, pour ne pas alourdir
 * le composant de doublons inertes.
 * EN: ⚠️ The original file had 8 near-identical "line" paths - Inkscape
 * export artifacts with no visual effect (filled straight segments with no
 * stroke enclose no area). 2 kept as representative rather than all 8.
 */
function SymbolePrismatique({ taille }: { taille: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox={PRISMATIQUE_VIEWBOX}
      role="img"
      aria-label="prismatique"
      style={{ flexShrink: 0 }}
    >
      <title>prismatique</title>
      <g transform={PRISMATIQUE_TRANSFORM}>
        {PRISMATIQUE_TRACES.map((t, i) => (
          <path key={i} fill={t.fill} d={t.d} />
        ))}
      </g>
    </svg>
  );
}

export default function IconeElement({ element, taille = 16, urlOfficielle }: Props) {
  if (!element) return null;

  if (urlOfficielle) {
    return (
      <img
        src={urlOfficielle}
        alt={element}
        title={element}
        width={taille}
        height={taille}
        style={{ borderRadius: 3, flexShrink: 0 }}
      />
    );
  }

  // FR : ⚠️ AJOUT (08/09/2026) - le Prismatique a désormais son propre
  // rendu dédié (voir `SymbolePrismatique` ci-dessus), avant le chemin
  // générique à tracé unique utilisé par les 5 autres éléments.
  // EN: ⚠️ ADDED - Prismatic now has its own dedicated render, ahead of
  // the generic single-path branch used by the other 5 elements.
  if (element === "prismatique") {
    return <SymbolePrismatique taille={taille} />;
  }

  const couleur = COULEURS[element];
  const forme = FORMES[element];
  const remplissage = element === "stase" || element === "filobscur";
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 16 16"
      role="img"
      aria-label={element}
      style={{ flexShrink: 0 }}
    >
      <title>{element}</title>
      <path
        d={forme}
        fill={remplissage ? "none" : couleur}
        stroke={remplissage ? couleur : "none"}
        strokeWidth={remplissage ? 1.6 : 0}
        strokeLinecap="round"
      />
    </svg>
  );
}
