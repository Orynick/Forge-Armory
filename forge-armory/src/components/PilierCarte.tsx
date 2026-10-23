import { PillarScore, StatBlock } from "../types/build";
import TitreCategorie, { CategorieTitre } from "./TitreCategorie";
import StatsBarChart from "./StatsBarChart";
import type { StatKey } from "../types/build";
import BadgeSimule from "./BadgeSimule";   // ⚠️ AJOUT (20/10/2026, branche draft-optimiseur)
// FR : ⚠️ CHANGÉ (06/09/2026) - les libellés étaient redéclarés ici, en
// 3e copie indépendante. Importés depuis la source unique désormais.
// EN: ⚠️ CHANGED - labels were redeclared here as a 3rd independent copy.
// Now imported from the single source.
import { LIBELLES_PILIER as LIBELLES } from "../data/piliers";

interface Props {
  pilier: PillarScore;
  /** FR : Stats à afficher en graphique - fourni seulement pour le pilier 5. / EN: Stats to chart - only provided for pillar 5. */
  stats?: Partial<StatBlock>;
  /**
   * FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - ajustements manuels par stat (boutons −/+,
   * granularité 5) : transmis au graphique du pilier 5 pour afficher les boutons alignés avec chaque barre.
   * Facultatif : sans lui, le graphique reste en lecture seule.
   * EN: manual per-stat adjustments (the −/+ buttons, 5-point granularity), forwarded to pillar 5's chart.
   */
  ajustements?: Partial<Record<StatKey, number>>;
  /** FR : callback −/+ d'une stat (même contrat que ResumeBuild). / EN: per-stat −/+ callback (same contract as ResumeBuild). */
  onChangerAjustement?: (cle: StatKey, delta: number) => void;
}

/** FR : ⚠️ AJOUT (07/10/2026, v0.3.15) - le titre illustré de chaque pilier. / EN: ⚠️ ADDED - each pillar's illustrated title. */
const TITRE_PAR_PILIER: Partial<Record<PillarScore["pilier"], CategorieTitre>> = {
  element_doctrine: "pilier-1",
  loot_coherence: "pilier-2",   // ⚠️ 08/10/2026 : Armes et Armures est maintenant le pilier 2 (même logo, le chiffre du titre a changé)
  perks_artefact: "pilier-3",   // ⚠️ 08/10/2026 : l'Artefact est maintenant le pilier 3
  verbes_element: "pilier-4",
  stats_2_0: "pilier-5",
};

export default function PilierCarte({ pilier, stats, ajustements, onChangerAjustement }: Props) {
  // FR : ⚠️ AJOUT (04/08/2026) - regroupe les détails en "titre + sous-lignes"
  // pour un VRAI retrait visuel (sous-liste imbriquée), plutôt que de simples
  // espaces en début de texte qui ne décalaient presque rien. Une ligne de
  // `verbes.ts` commençant par 2 espaces est une sous-ligne du dernier titre.
  // EN: ⚠️ ADDED - groups details into "heading + sub-lines" for a REAL indent
  // (nested sub-list) rather than leading spaces that barely shifted anything.
  // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - si le pilier porte des lignes
  // MARQUÉES (`detailsMarques`, même longueur que `details`), on garde le drapeau `simule` par
  // ligne : une ligne « effet » marquée affiche le badge « simulé » (même badge que Mon
  // Build). Sans `detailsMarques`, tout est non simulé (affichage texte inchangé).
  // EN: if the pillar carries MARKED lines (`detailsMarques`, same length as `details`),
  // we keep each line's `simule` flag: a marked "effect" line shows the "simulated" badge
  // (same badge as Mon Build). Without `detailsMarques`, everything is not simulated
  // (text display unchanged).
  const marques = pilier.detailsMarques;
  const simuleLigne = (i: number) => marques?.[i]?.simule === true;
  const groupes: { titre: string; titreSimule: boolean; sousLignes: { texte: string; simule: boolean }[] }[] = [];
  pilier.details.forEach((ligne, i) => {
    if (ligne.startsWith("  ") && groupes.length > 0) {
      groupes[groupes.length - 1].sousLignes.push({ texte: ligne.trim(), simule: simuleLigne(i) });
    } else {
      groupes.push({ titre: ligne, titreSimule: simuleLigne(i), sousLignes: [] });
    }
  });

  return (
    <div className="pilier-carte">
      <h3>
        {/* FR : ⚠️ CHANGÉ (07/10/2026, v0.3.15) - titre illustré de la carte (1 à 5) ; repli sur le texte si un pilier n'a pas de titre illustré (futur pilier). / EN: ⚠️ CHANGED - illustrated card title; falls back to text for a pillar without one. */}
        {TITRE_PAR_PILIER[pilier.pilier] ? <TitreCategorie categorie={TITRE_PAR_PILIER[pilier.pilier]!} /> : <span>{LIBELLES[pilier.pilier]}</span>}
        <span>{pilier.score}/100</span>
      </h3>
      {/* FR : ⚠️ AJOUT (25/08/2026) - légende pour ⛓️/🔋, demande de
      l'utilisateur. Visible UNIQUEMENT sur ce pilier : ce sont les 2 seuls
      symboles qu'il introduit (chaînes de verbes, ressources générées),
      inutile de l'afficher sur les 4 autres piliers qui ne les utilisent
      jamais.
      EN: ⚠️ ADDED - legend for ⛓️/🔋. Shown ONLY on this pillar, the only
      one that introduces these 2 symbols. */}
      {pilier.pilier === "verbes_element" && (
        <p style={{ fontSize: "0.68rem", color: "#7d7a70", margin: "0 0 0.4rem" }}>
          ⛓️ Chaîne de verbes détectée · 🔋 Énergie d'aptitude générée
        </p>
      )}
      {pilier.pilier === "stats_2_0" && stats && (
        <StatsBarChart stats={stats} ajustements={ajustements} onChangerAjustement={onChangerAjustement} />
      )}
      {/* FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - le pilier 5 marqué « simulé »
      (ajustements de stats actifs) porte le badge dans son titre, en plus du badge par ligne de détail.
      EN: pillar 5 flagged "simulated" (active stat adjustments) also carries the badge in its title. */}
      {pilier.pilier === "stats_2_0" && pilier.detailsMarques?.some((l) => l.simule) && (
        <span style={{ marginLeft: "0.3rem" }}>
          <BadgeSimule title="Ce pilier reflète des ajustements de stats simulés (boutons −/+), pas votre équipement réel." />
        </span>
      )}
      <ul>
        {groupes.map((g, i) => (
          <li key={i}>
            {g.titre}
            {g.titreSimule && <BadgeSimule />}
            {g.sousLignes.length > 0 && (
              <ul style={{ marginTop: "0.15rem" }}>
                {g.sousLignes.map((s, j) => (
                  <li key={j}>
                    {s.texte}
                    {s.simule && <BadgeSimule />}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
