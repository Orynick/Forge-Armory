import { PillarScore, StatBlock } from "../types/build";
import StatsBarChart from "./StatsBarChart";

const LIBELLES: Record<PillarScore["pilier"], string> = {
  element_doctrine: "1. Élément & Doctrine",
  verbes_element: "2. Verbes d'Élément",
  perks_artefact: "3. Perks d'Artefact Saisonniers",
  loot_coherence: "4. Loot & Cohérence",
  stats_2_0: "5. Statistiques 2.0",
};

interface Props {
  pilier: PillarScore;
  /** FR : Stats à afficher en graphique - fourni seulement pour le pilier 5. / EN: Stats to chart - only provided for pillar 5. */
  stats?: Partial<StatBlock>;
}

export default function PilierCarte({ pilier, stats }: Props) {
  return (
    <div className="pilier-carte">
      <h3>
        <span>{LIBELLES[pilier.pilier]}</span>
        <span>{pilier.score}/100</span>
      </h3>
      {pilier.pilier === "stats_2_0" && stats && <StatsBarChart stats={stats} />}
      <ul>
        {pilier.details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
}
