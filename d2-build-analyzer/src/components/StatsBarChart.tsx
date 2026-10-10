// FR : Composant de visualisation des 6 statistiques (Armor 3.0), une barre
// par stat. Fait en SVG pur (pas de librairie de graphiques) pour rester
// léger. Utilisé dans le pilier 5 (Statistiques 2.0).
// EN: Visualization component for the 6 stats (Armor 3.0), one bar per
// stat. Built in plain SVG (no charting library) to stay lightweight. Used
// in Pillar 5 (Stats 2.0).

import { StatBlock, StatKey } from "../types/build";
import { STAT_MAX, palier } from "../lib/scoring/stats";

const LIBELLES: Record<StatKey, string> = {
  arme: "Arme",
  sante: "Santé",
  super: "Super",
  melee: "Mêlée",
  grenade: "Grenade",
  classe: "Classe",
};

// FR : Ordre d'affichage demandé : Arme, Santé, Super, Mêlée, Grenade, Classe.
// EN: Requested display order: Weapons, Health, Super, Melee, Grenade, Class.
const ORDRE: StatKey[] = ["arme", "sante", "super", "melee", "grenade", "classe"];

const LARGEUR_BARRE = 48;
const ESPACEMENT = 24;
const HAUTEUR_GRAPHIQUE = 160;
const HAUTEUR_LABEL = 40;

export default function StatsBarChart({ stats }: { stats: Partial<StatBlock> }) {
  const largeurTotale = ORDRE.length * (LARGEUR_BARRE + ESPACEMENT) + ESPACEMENT;
  const hauteurTotale = HAUTEUR_GRAPHIQUE + HAUTEUR_LABEL;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${largeurTotale} ${hauteurTotale}`}
      role="img"
      aria-label="Répartition des 6 statistiques du build"
    >
      {ORDRE.map((cle, i) => {
        const valeur = Math.max(0, Math.min(stats[cle] ?? 0, STAT_MAX));
        const hauteurBarre = (valeur / STAT_MAX) * HAUTEUR_GRAPHIQUE;
        const x = ESPACEMENT + i * (LARGEUR_BARRE + ESPACEMENT);
        const y = HAUTEUR_GRAPHIQUE - hauteurBarre;

        return (
          <g key={cle}>
            {/* Barre */}
            <rect
              x={x}
              y={y}
              width={LARGEUR_BARRE}
              height={hauteurBarre}
              rx={4}
              fill="#7aa2f7"
            />
            {/* Valeur + palier au-dessus de la barre */}
            <text
              x={x + LARGEUR_BARRE / 2}
              y={Math.max(y - 6, 12)}
              textAnchor="middle"
              fontSize="11"
              fill="#e8e6df"
            >
              {valeur} (T{palier(valeur)})
            </text>
            {/* Libellé de la stat sous le graphique */}
            <text
              x={x + LARGEUR_BARRE / 2}
              y={HAUTEUR_GRAPHIQUE + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#b7b3a8"
            >
              {LIBELLES[cle]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
