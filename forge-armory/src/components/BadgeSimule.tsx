// FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - BADGE « simulé », extrait du span
// en ligne de ResumeBuild (Mon Build) pour être RÉUTILISÉ à l'identique dans PilierCarte
// (pilier « 4. Effets du Build » : un effet provenant d'un perk simulé porte le badge).
// Mêmes styles, même infobulle, même attribut `data-badge-simule` (les tests UI le ciblent).
// EN: ADDED - the "simulated" badge, extracted from ResumeBuild's inline span to be
// REUSED as-is in PilierCarte (pillar "4. Effects of the Build": an effect coming from
// a simulated perk carries the badge). Same styles, same tooltip, same `data-badge-simule`
// attribute (UI tests target it).

interface Props {
  /** FR : infobulle ; par défaut le texte standard (perk Forge : compte dans le score, pas en jeu). / EN: tooltip; defaults to the standard text. */
  title?: string;
}

export default function BadgeSimule({ title }: Props) {
  return (
    <span
      data-badge-simule=""
      title={title ?? "Perk choisi dans la Forge : pris en compte dans le score, pas appliqué en jeu."}
      style={{ fontSize: "0.7rem", color: "#e8c547", border: "1px solid #e8c547", borderRadius: 999, padding: "0 0.4rem", cursor: "help" }}
    >
      🔨 simulé
    </span>
  );
}
