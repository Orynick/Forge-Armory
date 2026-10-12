// FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - bouton « TRANSFÉRER VERS » d'une ligne d'objet (Mon Inventaire et Coffre ; demande de l'utilisateur). Règles validées le 12/10/2026 : un objet ÉQUIPÉ n'est pas transférable (bouton grisé, avec l'explication) ; une CONFIRMATION est demandée avant chaque transfert ; UN seul transfert à la fois
// (`bloque` grise les boutons de toutes les lignes pendant qu'un transfert est en cours). Destinations proposées : le Coffre et les trois classes, sauf l'endroit où l'objet est déjà ; une ARMURE n'est proposée qu'au Coffre et à son propre personnage (l'armure est propre à une classe).
// Le résultat (réussite ou échec) est affiché par un bandeau du parent, car la ligne disparaît de sa liste quand l'objet change d'endroit. EN: ⚠️ ADDED - "Transfer to" button of an item row: equipped items blocked, confirmation before each transfer, one at a time, armor only to its own class or the vault.

import { useState } from "react";
import type { GearPiece } from "../types/build";
import { Lieu, LIBELLES_LIEU } from "../lib/bungie/deplacer";

const LIEUX: Lieu[] = ["chasseur", "titan", "arcaniste", "coffre"];
const COURT: Record<Lieu, string> = { coffre: "Coffre", chasseur: "Chasseur", titan: "Titan", arcaniste: "Arcaniste" };

/** FR : destinations proposées pour cette pièce. / EN: destinations offered for this piece. */
export function destinationsPossibles(piece: GearPiece): Lieu[] {
  return LIEUX.filter((l) => l !== (piece.origine ?? "coffre") && (l === "coffre" || !piece.classeRequise || piece.classeRequise === l));
}

interface Props {
  piece: GearPiece;
  /** FR : vrai quand un transfert est déjà en cours quelque part (un seul à la fois). / EN: true while another transfer is running. */
  bloque?: boolean;
  onTransferer: (piece: GearPiece, cible: Lieu) => Promise<void>;
}

export default function BoutonTransfert({ piece, bloque = false, onTransferer }: Props) {
  const [etape, setEtape] = useState<"repos" | "choix" | "confirmation" | "encours">("repos");
  const [cible, setCible] = useState<Lieu | null>(null);
  if (!piece.itemInstanceId || !piece.origine) return null;   // sans identifiant d'instance ou sans lieu connu, le transfert est impossible
  const style = { fontSize: "0.7rem", padding: "0.1rem 0.4rem", flexShrink: 0 } as const;

  if (piece.equipe) {
    return (
      <button style={style} disabled data-transfert-bouton={piece.itemInstanceId} title="Cet objet est équipé : il ne peut pas être transféré. Équipez un autre objet à sa place en jeu, puis réessayez.">
        Transférer vers
      </button>
    );
  }
  const source = piece.origine;
  const viaCoffre = cible !== null && source !== "coffre" && cible !== "coffre";
  async function confirmer() {
    if (!cible) return;
    setEtape("encours");
    try {
      await onTransferer(piece, cible);
    } finally {
      setEtape("repos");
      setCible(null);
    }
  }
  return (
    <>
      <button style={style} data-transfert-bouton={piece.itemInstanceId} disabled={bloque || etape === "encours"} aria-expanded={etape !== "repos"} title={bloque && etape === "repos" ? "Un transfert est déjà en cours : attendez qu'il se termine." : undefined} onClick={() => { setEtape(etape === "repos" ? "choix" : "repos"); setCible(null); }}>
        Transférer vers {etape === "repos" ? "▾" : "▴"}
      </button>
      {etape !== "repos" && (
        <span role="group" aria-label={`Transférer ${piece.nom}`} data-transfert="" style={{ flexBasis: "100%", display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", fontSize: "0.75rem", color: "#e8e6df" }}>
          {etape === "choix" &&
            destinationsPossibles(piece).map((l) => (
              <button key={l} style={style} onClick={() => { setCible(l); setEtape("confirmation"); }}>
                {COURT[l]}
              </button>
            ))}
          {etape === "confirmation" && cible && (
            <>
              <span>
                Transférer « {piece.nom} » : {LIBELLES_LIEU[source]} → {LIBELLES_LIEU[cible]} ?{viaCoffre ? " (en passant par le Coffre : deux opérations)" : ""}
              </span>
              <button style={{ ...style, borderColor: "#d4af37" }} onClick={confirmer}>Confirmer</button>
              <button style={style} onClick={() => { setEtape("repos"); setCible(null); }}>Annuler</button>
            </>
          )}
          {etape === "encours" && <span>⏳ Transfert en cours…</span>}
        </span>
      )}
    </>
  );
}
