// FR : Visualisation des 6 statistiques (Armor 3.0), une barre HORIZONTALE
// par stat, dans l'ordre du jeu (Santé, Mêlée, Grenade, Super, Classe,
// Arme), avec le point zéro aligné à gauche pour une lecture rapide sans
// avoir à lire les chiffres. SVG pur, sans dépendance.
// EN: Visualization of the 6 stats (Armor 3.0), one HORIZONTAL bar per
// stat, in the game's order (Health, Melee, Grenade, Super, Class,
// Weapons), with the zero point aligned on the left for a quick read
// without needing to read the numbers. Plain SVG, no dependency.

import { StatBlock, StatKey } from "../types/build";
import { STAT_MAX, palier, PAS_AJUSTEMENT_STAT } from "../lib/scoring/stats";

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
const LARGEUR_VALEUR = 118; // espace réservé à "105 (T11) (+15)" + boutons −/+ à droite (ajustements manuels, 20/10/2026)

interface Props {
  stats: Partial<StatBlock>;
  /**
   * FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - ajustements manuels par stat (boutons −/+,
   * granularité 5). Le delta est affiché à côté de la valeur, la barre est teintée et le badge « simulé »
   * apparaît. Facultatif : sans lui, lecture seule. / EN: manual per-stat adjustments (−/+ buttons).
   */
  ajustements?: Partial<Record<StatKey, number>>;
  /** FR : callback −/+ d'une stat. / EN: per-stat −/+ callback. */
  onChangerAjustement?: (cle: StatKey, delta: number) => void;
}

export default function StatsBarChart({ stats, ajustements, onChangerAjustement }: Props) {
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
        // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - ajustements manuels : le delta
        // (multiple de 5) s'affiche à côté de la valeur, la barre passe au jaune #e8c547, et deux
        // boutons −/+ SVG sont alignés AVEC la barre (même ordonnée que la valeur), encadrant le texte.
        // Le clamp [0, STAT_MAX] porte sur le TOTAL ajusté (voir appliquerAjustementsStats).
        // EN: manual adjustments: the delta (multiple of 5) shows next to the value, the bar turns
        // #e8c547 yellow, and two SVG −/+ buttons sit ON the bar's line, framing the text.
        const reel = Math.max(0, Math.min(stats[cle] ?? 0, STAT_MAX));
        const delta = Math.round((ajustements?.[cle] ?? 0) / PAS_AJUSTEMENT_STAT) * PAS_AJUSTEMENT_STAT;
        const ajuste = delta !== 0;
        const totalAjuste = Math.max(0, Math.min(STAT_MAX, reel + delta));
        const valeur = ajuste ? totalAjuste : reel;
        const peutMonter = !!onChangerAjustement && totalAjuste + PAS_AJUSTEMENT_STAT <= STAT_MAX;
        const peutDescendre = !!onChangerAjustement && totalAjuste - PAS_AJUSTEMENT_STAT >= 0;
        const largeurBarre = (valeur / STAT_MAX) * LARGEUR_BARRES;
        const y = i * ESPACEMENT_LIGNE + 4;
        const xDepartBarre = LARGEUR_LABEL; // FR : même point de départ (zéro) pour toutes les barres. / EN: same starting point (zero) for every bar.
        const xTexte = LARGEUR_LABEL + LARGEUR_BARRES + 8;
        const xMoins = xTexte + 62;   // après "105 (T11) (+15)"
        const xPlus = xTexte + 78;

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

            {/* Barre réelle (ou ajustée, en jaune simulation), partant toujours du même zéro à gauche */}
            <rect x={xDepartBarre} y={y} width={largeurBarre} height={HAUTEUR_BARRE} rx={3} fill={ajuste ? "#e8c547" : "#7aa2f7"} />

            {/* Valeur + palier (+ delta), après la barre */}
            <text
              x={xTexte}
              y={y + HAUTEUR_BARRE / 2 + 4}
              fontSize="11"
              fill="#e8e6df"
              data-valeur-stat={cle}
            >
              {valeur} (T{palier(valeur)})
              {ajuste && (
                <tspan fill="#e8c547" data-delta-stat={cle}>{` (${delta > 0 ? "+" : ""}${delta})`}</tspan>
              )}
            </text>

            {/* Boutons −/+ alignés avec la barre (ajustements manuels, simulation) */}
            {onChangerAjustement && (
              <>
                <text
                  x={xMoins}
                  y={y + HAUTEUR_BARRE / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill={peutDescendre ? "#e8e6df" : "#4a4e58"}
                  style={{ cursor: peutDescendre ? "pointer" : "default" }}
                  data-ajustement-moins={cle}
                  aria-label={`Diminuer ${LIBELLES[cle]} de ${PAS_AJUSTEMENT_STAT} (simulation)`}
                  onClick={peutDescendre ? () => onChangerAjustement(cle, delta - PAS_AJUSTEMENT_STAT) : undefined}
                >
                  <title>{`−${PAS_AJUSTEMENT_STAT} ${LIBELLES[cle]} (ajustement simulé : le total réel reste ${reel})`}</title>
                  −
                </text>
                <text
                  x={xPlus}
                  y={y + HAUTEUR_BARRE / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill={peutMonter ? "#e8e6df" : "#4a4e58"}
                  style={{ cursor: peutMonter ? "pointer" : "default" }}
                  data-ajustement-plus={cle}
                  aria-label={`Augmenter ${LIBELLES[cle]} de ${PAS_AJUSTEMENT_STAT} (simulation)`}
                  onClick={peutMonter ? () => onChangerAjustement(cle, delta + PAS_AJUSTEMENT_STAT) : undefined}
                >
                  <title>{`+${PAS_AJUSTEMENT_STAT} ${LIBELLES[cle]} (ajustement simulé : le total réel reste ${reel})`}</title>
                  +
                </text>
              </>
            )}

          </g>
        );
      })}
    </svg>
  );
}
