import { PillarScore, StatBlock } from "../types/build";
import TitreCategorie, { CategorieTitre } from "./TitreCategorie";
import StatsBarChart from "./StatsBarChart";
// FR : ⚠️ CHANGÉ (06/09/2026) - les libellés étaient redéclarés ici, en
// 3e copie indépendante. Importés depuis la source unique désormais.
// EN: ⚠️ CHANGED - labels were redeclared here as a 3rd independent copy.
// Now imported from the single source.
import { LIBELLES_PILIER as LIBELLES } from "../data/piliers";
import { MARQUE_SIMULE } from "../lib/scoring/marqueSimule";   // ⚠️ AJOUT (27/10/2026)

/**
 * FR : ⚠️ AJOUT (27/10/2026, « dans le bloc Effets du Build, quand un des verbes vient d'une perk simulée, mets le badge « simulé » à côté de l'origine du verbe ») - remplace chaque marqueur de perk simulé par le badge « 🔨 simulé », au même style que celui de Mon Build. Le texte sans marqueur est rendu tel quel.
 * EN: ⚠️ ADDED - replaces each simulated-perk marker by the "simulé" badge (same style as Mon Build).
 */
function avecBadges(texte: string) {
  const parties = texte.split(MARQUE_SIMULE);
  if (parties.length === 1) return texte;
  return parties.flatMap((p, i) => (i < parties.length - 1 ? [p, " ", <span key={`b${i}`} data-badge-simule-verbe="" title="Ce verbe vient d'un perk ou d'un mod SIMULÉ dans la Forge : pris en compte dans le score, pas appliqué en jeu." style={{ fontSize: "0.7rem", color: "#e8c547", border: "1px solid #e8c547", borderRadius: 999, padding: "0 0.4rem", cursor: "help" }}>🔨 simulé</span>] : [p]));
}

interface Props {
  pilier: PillarScore;
  /** FR : Stats à afficher en graphique - fourni seulement pour le pilier 5. / EN: Stats to chart - only provided for pillar 5. */
  stats?: Partial<StatBlock>;
}

/** FR : ⚠️ AJOUT (07/10/2026, v0.3.15) - le titre illustré de chaque pilier. / EN: ⚠️ ADDED - each pillar's illustrated title. */
const TITRE_PAR_PILIER: Partial<Record<PillarScore["pilier"], CategorieTitre>> = {
  element_doctrine: "pilier-1",
  loot_coherence: "pilier-2",   // ⚠️ 08/10/2026 : Armes et Armures est maintenant le pilier 2 (même logo, le chiffre du titre a changé)
  perks_artefact: "pilier-3",   // ⚠️ 08/10/2026 : l'Artefact est maintenant le pilier 3
  verbes_element: "pilier-4",
  stats_2_0: "pilier-5",
};

export default function PilierCarte({ pilier, stats }: Props) {
  // FR : ⚠️ AJOUT (04/08/2026) - regroupe les détails en "titre + sous-lignes"
  // pour un VRAI retrait visuel (sous-liste imbriquée), plutôt que de simples
  // espaces en début de texte qui ne décalaient presque rien. Une ligne de
  // `verbes.ts` commençant par 2 espaces est une sous-ligne du dernier titre.
  // EN: ⚠️ ADDED - groups details into "heading + sub-lines" for a REAL indent
  // (nested sub-list) rather than leading spaces that barely shifted anything.
  const groupes: { titre: string; sousLignes: string[] }[] = [];
  for (const ligne of pilier.details) {
    if (ligne.startsWith("  ") && groupes.length > 0) {
      groupes[groupes.length - 1].sousLignes.push(ligne.trim());
    } else {
      groupes.push({ titre: ligne, sousLignes: [] });
    }
  }

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
      {pilier.pilier === "stats_2_0" && stats && <StatsBarChart stats={stats} />}
      <ul>
        {groupes.map((g, i) => (
          <li key={i}>
            {avecBadges(g.titre)}
            {g.sousLignes.length > 0 && (
              <ul style={{ marginTop: "0.15rem" }}>
                {g.sousLignes.map((s, j) => (
                  <li key={j}>{avecBadges(s)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
