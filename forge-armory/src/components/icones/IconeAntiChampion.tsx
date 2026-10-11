// FR : icônes anti-champion, fournies par l'utilisateur (source
// svgrepo.com). Correspondance confirmée : overload=Surchargé,
// pierce=Bloqueur, stagger=Implacable.
// EN: anti-champion icons, provided by the user (source svgrepo.com).
// Confirmed mapping: overload=Overload, pierce=Barrier, stagger=Unstoppable.

export type TypeChampion = "surcharge" | "bloqueur" | "implacable";

interface Props {
  type: TypeChampion;
  taille?: number;
  couleur?: string;
}

// FR : ⚠️ CHANGÉ (27/09/2026, v0.2.5) - exporté : source UNIQUE des tracés,
// partagée avec l'export infographique d'une fiche (lib/loadouts/exportFiche.ts),
// pour que l'appli et l'image exportée montrent exactement les mêmes icônes.
// EN: ⚠️ CHANGED - exported: SINGLE source of the paths, shared with the
// infographic export.
export const CHEMINS_ICONES_CHAMPION: Record<TypeChampion, { viewBox: string; d: string }> = {
  surcharge: {
    viewBox: "0 0 32 32",
    d: "M4.096 16.288c0-4.128 2.080-7.744 5.248-9.888 0.192-0.096 0.416-0.064 0.544 0.128l6.144 9.76h-7.872l7.52 11.904c-6.432-0.192-11.584-5.44-11.584-11.904zM16.384 4.384c6.432 0.192 11.552 5.44 11.552 11.904 0 4.096-2.080 7.712-5.216 9.856-0.192 0.128-0.416 0.064-0.544-0.128l-6.144-9.728h7.872z",
  },
  bloqueur: {
    viewBox: "0 -2 36 36",
    d: "M17.888 4.352l13.76 23.84h-27.552l2.592-4.448h16.608c0.288 0 0.448-0.32 0.32-0.576l-8.32-14.368zM12.48 13.664l2.976 5.184h-5.952z",
  },
  implacable: {
    viewBox: "0 0 32 32",
    d: "M27.776 26.176c0 1.024-0.832 1.856-1.856 1.856h-8.608l10.464-10.464v8.608zM22.304 4.384h5.472v5.44l-18.208 18.208h-5.472v-5.472zM4.096 6.24c0-1.024 0.832-1.856 1.888-1.856h8.608l-10.496 10.464v-8.608z",
  },
};

export const LIBELLES_CHAMPION: Record<TypeChampion, string> = {
  surcharge: "Surchargé",
  bloqueur: "Bloqueur",
  implacable: "Implacable",
};

export default function IconeAntiChampion({ type, taille = 35, couleur = "#b7b3a8" }: Props) {
  const { viewBox, d } = CHEMINS_ICONES_CHAMPION[type];
  return (
    <svg
      width={taille}
      height={taille}
      viewBox={viewBox}
      fill={couleur}
      aria-label={`Anti-${LIBELLES_CHAMPION[type]}`}
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}
