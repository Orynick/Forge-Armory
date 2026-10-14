// FR : ⚠️ AJOUT (14/10/2026, v0.4.11), demande de l'utilisateur : « met l'icône [d'arme façonnée] à gauche du nom (partout) » dans les fenêtres : fenêtre de la Forge, fenêtres Détails de Mon Inventaire, du Coffre et de Mon Build. L'icône du jeu, à la taille d'un titre, avec son nom accessible « Arme façonnée » et son infobulle (la même que sur la vignette). Un seul composant pour les trois fenêtres. La vignette, elle, garde l'icône en bas à gauche (`VignetteArme`). EN: ⚠️ ADDED - the crafted-weapon icon at the left of the weapon name in the windows.
import IconeFaconnee from "./IconeFaconnee";

export default function IconeTitreFaconnee({ taille = 16 }: { taille?: number }) {
  return (
    <span data-icone-titre-faconnee="" role="img" aria-label="Arme façonnée" title="Arme façonnée : ses perks se changent à la forge en jeu" style={{ display: "inline-flex", alignItems: "center", lineHeight: 0, flexShrink: 0 }}>
      <IconeFaconnee taille={taille} />
    </span>
  );
}
