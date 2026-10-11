// FR : Menu déroulant AVEC ICÔNES, pour remplacer un <select> natif là où
// une icône par option a du sens (type d'arme, type d'armure, artefact...).
//
// Pourquoi ce composant existe : un <option> HTML ne peut afficher QUE du
// texte, jamais d'image ni de couleur - limite du navigateur, pas un choix
// de conception (voir TODO.md). Ce menu reproduit le comportement d'un
// <select> (un bouton fermé, un clic ouvre la liste, un choix la referme)
// avec du HTML normal pour chaque ligne, donc libre d'y mettre une icône.
//
// EN: Dropdown WITH ICONS, replacing a native <select> where a per-option
// icon makes sense. A native <option> can only show plain text - a browser
// limitation, not a design choice. This reproduces <select>'s behaviour with
// normal HTML per row, free to include an icon.

import { useEffect, useRef, useState, ReactNode } from "react";

export interface OptionMenuIcone {
  valeur: string;
  libelle: string;
  icone?: ReactNode;
  /**
   * FR : ⚠️ AJOUT (24/08/2026) - place l'icône APRÈS le libellé au lieu
   * d'avant (demande de l'utilisateur pour le sélecteur d'artefact : le nom
   * de l'artefact d'abord, ses compatibilités ensuite). Ajouté comme option
   * plutôt qu'en changeant l'ordre pour tout le monde : les autres menus
   * (type d'arme, anti-champion) sont plus lisibles avec l'icône devant,
   * qui sert de repère visuel avant la lecture.
   * EN: ⚠️ ADDED - places the icon AFTER the label instead of before. Added
   * as an option rather than flipping the order everywhere: the other menus
   * read better with the icon first, as a visual anchor.
   */
  iconeApres?: boolean;
}

interface Props {
  valeur: string;
  options: OptionMenuIcone[];
  onChanger: (valeur: string) => void;
  largeur?: string;
  placeholder?: string;
}

export default function MenuDerouantIcone({ valeur, options, onChanger, largeur = "170px", placeholder }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const optionActuelle = options.find((o) => o.valeur === valeur);

  // FR : ferme le menu au clic en dehors - comportement attendu d'un <select>.
  useEffect(() => {
    function fermerSiDehors(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", fermerSiDehors);
    return () => document.removeEventListener("mousedown", fermerSiDehors);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: largeur, flexShrink: 0 }}>
      <button
        onClick={() => setOuvert((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.8rem",
          background: "#0d0f14",
          color: "#e8e6df",
          border: "1px solid #3a3f4b",
          borderRadius: 6,
          padding: "0.3rem 0.4rem",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        {!optionActuelle?.iconeApres && optionActuelle?.icone}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {optionActuelle?.libelle ?? placeholder ?? "—"}
        </span>
        {optionActuelle?.iconeApres && optionActuelle.icone}
        <span style={{ color: "#7d7a70", fontSize: "0.7rem" }}>{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: "260px",
            overflowY: "auto",
            background: "#161922",
            border: "1px solid #3a3f4b",
            borderRadius: 6,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.valeur}
              onClick={() => {
                onChanger(opt.valeur);
                setOuvert(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.8rem",
                padding: "0.35rem 0.5rem",
                background: opt.valeur === valeur ? "#1a2436" : "transparent",
                color: opt.valeur === valeur ? "#e8e6df" : "#b7b3a8",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {!opt.iconeApres && opt.icone}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.libelle}</span>
              {opt.iconeApres && opt.icone}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
