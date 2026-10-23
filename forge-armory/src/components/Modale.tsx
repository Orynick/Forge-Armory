// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - fenêtre modale commune aux nouvelles fenêtres des
// Loadouts (« Modifier... », « Exporter... », choix du personnage). Même habillage que la
// fiche « Voir » et la check-list (fond assombri, boîte centrée, z-index 1100) : Échap
// ferme TOUJOURS ; un clic sur le fond ferme seulement si `fermerSurFond` (à éviter pour
// une saisie : cliquer à côté ferait perdre le texte tapé).
// EN: ⚠️ ADDED - shared modal for the new Loadouts windows. Escape always closes; a
// backdrop click closes only with `fermerSurFond`.

import { ReactNode, useEffect } from "react";

interface Props {
  titre: string;
  onFermer: () => void;
  children: ReactNode;
  /** FR : largeur maximale de la boîte, en px. / EN: max box width, px. */
  largeur?: number;
  fermerSurFond?: boolean;
}

// FR : ⚠️ RETIRÉ (22/10/2026, TODO §25) - la prop `apresTitre` (bouton « Accomplissements » à droite du titre de la modale Carrière, 21/10/2026) n'est plus utilisée : la modale Carrière est supprimée, remplacée par la page « Carrière » (onglet). L'en-tête redevient un simple titre + croix, comme avant le 21/10. / EN: `apresTitre` removed (the Career modal is gone).

export default function Modale({ titre, onFermer, children, largeur = 420, fermerSurFond = false }: Props) {
  useEffect(() => {
    const surTouche = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  return (
    <div
      onClick={fermerSurFond ? onFermer : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,15,20,0.75)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(94vw, ${largeur}px)`,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#161922",
          border: "1px solid #3a3f4b",
          borderRadius: 10,
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <strong style={{ fontSize: "0.95rem" }}>{titre}</strong>
          <button onClick={onFermer} title="Fermer (Échap)" style={{ background: "none", border: "none", color: "#7d7a70", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
