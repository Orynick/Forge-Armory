// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « travaille sur le lien entre stats simulées et score » - l'AFFICHAGE de la comparaison score RÉEL → score SIMULÉ à côté du score global : « Score réel 70 → simulé 72 (+2) », puis les piliers qui changent et les statistiques totales qui changent. Calcul : `lib/forge/scoreSimule.ts` (pur, testé). Affiché seulement quand une simulation est active.
// EN: ⚠️ ADDED - displays the REAL → SIMULATED score comparison next to the global score, then the pillars and total stats that change.
import type { ComparaisonScore as Comparaison } from "../lib/forge/scoreSimule";
import { LIBELLES_PILIER } from "../data/piliers";
import { LIBELLES_STAT } from "../data/libellesUI";

const signe = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "±0");

export default function ComparaisonScore({ comparaison: c }: { comparaison: Comparaison }) {
  const couleur = c.delta > 0 ? "#7fd88f" : c.delta < 0 ? "#e0a080" : "#b7b3a8";
  return (
    <div data-comparaison-score="" data-reel={c.reel} data-simule={c.simule} data-delta={c.delta} style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.85rem" }}>
      <span style={{ color: couleur }}>
        Score réel {c.reel} → simulé <strong>{c.simule}</strong> ({signe(c.delta)})
      </span>
      {c.piliers.length > 0 && (
        <span data-comparaison-piliers="" style={{ fontSize: "0.72rem", color: "#9a968a" }}>
          {c.piliers.map((p) => `${LIBELLES_PILIER[p.pilier]} : ${p.reel} → ${p.simule} (${signe(p.delta)})`).join(" · ")}
        </span>
      )}
      {c.stats.length > 0 && (
        <span data-comparaison-stats="" style={{ fontSize: "0.72rem", color: "#9a968a" }}>
          Statistiques du build : {c.stats.map((s) => `${LIBELLES_STAT[s.stat]} ${s.reel} → ${s.simule} (${signe(s.delta)})`).join(" · ")}
        </span>
      )}
      {c.piliers.length === 0 && c.stats.length === 0 && (
        <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>La simulation ne change ni les statistiques du build ni aucun pilier.</span>
      )}
    </div>
  );
}
