// FR : Visualisation des 6 statistiques (Armor 3.0), une barre HORIZONTALE
// par stat, dans l'ordre du jeu (Santé, Mêlée, Grenade, Super, Classe,
// Arme), avec le point zéro aligné à gauche pour une lecture rapide sans
// avoir à lire les chiffres. SVG pur, sans dépendance.
// EN: Visualization of the 6 stats (Armor 3.0), one HORIZONTAL bar per
// stat, in the game's order (Health, Melee, Grenade, Super, Class,
// Weapons), with the zero point aligned on the left for a quick read
// without needing to read the numbers. Plain SVG, no dependency.
//
// FR : ⚠️ CHANGÉ (23/10/2026, branche draft-optimiseur) - les boutons −/+ (ajustements manuels)
// ont été RETIRÉS de ce graphique (décision utilisateur : simuler les stats dans « Mon Build »
// est plus logique). Le graphique affiche les totaux du scoring (déjà ajustés quand une
// simulation est active) en LECTURE SEULE. Les boutons −/+ restent dans ResumeBuild (« Mon Build »).
// EN: ⚠️ CHANGED - the −/+ buttons (manual adjustments) were REMOVED from this chart (user
// decision: simulating stats in "Mon Build" makes more sense). The chart shows the scoring
// totals (already adjusted when a simulation is active) READ-ONLY. The −/+ buttons remain in
// ResumeBuild ("Mon Build").

import { StatBlock, StatKey } from "../types/build";
import { STAT_MAX, palier } from "../lib/scoring/stats";

const LIBELLES: Record<StatKey, string> = {
  sante: "Santé",
  melee: "Mêlée",
  grenade: "Grenade",
  super: "Super",
  classe: "Classe",
  arme: "Arme",
};

// FR : ordre demandé, identique à celui affiché en jeu.
// EN: requested order, identical to the in-game display.
const ORDRE: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];

const LARGEUR_LABEL = 60; // espace réservé au nom de la stat, à gauche
const LARGEUR_BARRES = 260; // largeur max de la zone de barres (à STAT_MAX)
const HAUTEUR_BARRE = 14; // ⚠️ pas plus grand que le texte à côté, comme demandé
const ESPACEMENT_LIGNE = 22;
const LARGEUR_VALEUR = 60; // espace réservé à "200 (T20)" (lecture seule depuis le 23/10/2026 : plus de boutons −/+ ici)

interface Props {
  stats: Partial<StatBlock>;
}

export default function StatsBarChart({ stats }: Props) {
  const largeurTotale = LARGEUR_LABEL + LARGEUR_BARRES + LARGEUR_VALEUR + 16;
  const hauteurTotale = ORDRE.length * ESPACEMENT_LIGNE + 8;

  return (
    <svg
      width="100%"
      style={{ maxWidth: largeurTotale, display: "block" }}
      viewBox={`0 0 ${largeurTotale} ${hauteurTotale}`}
      role="img"
      aria-label="Répartition des 6 statistiques du build"
    >
      {ORDRE.map((cle, i) => {
        // FR : les totaux affichés sont ceux du scoring (DÉJÀ ajustés quand une simulation de
        // stats est active) ; le graphique est en LECTURE SEULE (boutons −/+ retirés le 23/10/2026,
        // branche draft-optimiseur : la simulation se fait dans « Mon Build »).
        // EN: displayed totals come from the scoring (ALREADY adjusted when a stat simulation is
        // active); the chart is READ-ONLY (−/+ buttons removed 23/10/2026).
        const valeur = Math.max(0, Math.min(stats[cle] ?? 0, STAT_MAX));
        const largeurBarre = (valeur / STAT_MAX) * LARGEUR_BARRES;
        const y = i * ESPACEMENT_LIGNE + 4;
        const xDepartBarre = LARGEUR_LABEL; // FR : même point de départ (zéro) pour toutes les barres. / EN: same starting point (zero) for every bar.
        const xTexte = LARGEUR_LABEL + LARGEUR_BARRES + 8;

        return (
          <g key={cle}>
            {/* Libellé de la stat, aligné à droite juste avant le zéro */}
            <text
              x={LARGEUR_LABEL - 6}
              y={y + HAUTEUR_BARRE / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fill="#b7b3a8"
            >
              {LIBELLES[cle]}
            </text>

            {/* Piste de fond (STAT_MAX complet), pour visualiser l'échelle même à 0 */}
            <rect x={xDepartBarre} y={y} width={LARGEUR_BARRES} height={HAUTEUR_BARRE} rx={3} fill="#20242e" />

            {/* Barre (totaux du scoring), partant toujours du même zéro à gauche */}
            <rect x={xDepartBarre} y={y} width={largeurBarre} height={HAUTEUR_BARRE} rx={3} fill="#7aa2f7" />

            {/* Valeur + palier, après la barre */}
            <text
              x={xTexte}
              y={y + HAUTEUR_BARRE / 2 + 4}
              fontSize="11"
              fill="#e8e6df"
              data-valeur-stat={cle}
            >
              {valeur} (T{palier(valeur)})
            </text>
          </g>
        );
      })}
    </svg>
  );
}
