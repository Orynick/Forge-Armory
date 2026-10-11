import IconeAntiChampion, { TypeChampion } from "./icones/IconeAntiChampion";
import IconeLoadout, { CLES_ICONES_LOADOUT, libelleIconeLoadout } from "./icones/IconeLoadout";

/**
 * FR : ⚠️ EXTRAIT (30/09/2026, v0.2.9) du formulaire d'enregistrement - choix
 * de l'icône d'un loadout (emojis, icônes d'activité/doctrine, icônes
 * anti-champion). Réutilisé pour MODIFIER l'icône d'un build enregistré
 * (bouton « Icône »), qui passait par une boîte de saisie du navigateur
 * (`window.prompt`) non prise en charge par le logiciel installé.
 * ⚠️ DÉPLACÉ (01/10/2026, v0.3.0) dans son propre fichier : il sert maintenant au
 * formulaire d'enregistrement ET à la fenêtre « Modifier... » d'un build.
 * EN: ⚠️ EXTRACTED from the save form - loadout icon picker, reused to EDIT
 * a saved build's icon (the old `window.prompt` doesn't work in Electron).
 * ⚠️ MOVED to its own file: shared by the save form and the "Edit..." window.
 */
export default function SelecteurIconeLoadout({ valeur, onChoisir }: { valeur: string; onChoisir: (icone: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: "0.7rem", color: "#7d7a70" }}>Icône :</span>
      {["", "🔥", "⚡", "🌑", "❄️", "🕸️", "🔮", "🏆", "⚔️", "🎯", "🛡️", "💀"].map((e) => (
        <button
          key={e || "aucune"}
          onClick={() => onChoisir(e)}
          title={e ? undefined : "Aucune icône"}
          style={{
            fontSize: "0.85rem",
            padding: "0 0.25rem",
            border: valeur === e ? "1px solid #7aa2f7" : "1px solid #3a3f4b",
            background: valeur === e ? "#1a2436" : "transparent",
            borderRadius: 4,
          }}
        >
          {e || "∅"}
        </button>
      ))}
      {/* FR : ⚠️ AJOUT (04/08/2026) - icônes d'activité et de doctrine
      fournies par l'utilisateur (raid, assaut, secteur oublié, patrouille,
      clan, Bannière de Fer, Osiris, Avant-garde, et les combinaisons
      classe/élément). Bien plus parlantes qu'un emoji générique pour
      identifier « mon build de raid » ou « mon Titan Solaire ». */}
      {CLES_ICONES_LOADOUT.map((k) => (
        <button
          key={k}
          onClick={() => onChoisir(`icone:${k}`)}
          title={libelleIconeLoadout(k)}
          style={{
            padding: "0 0.25rem",
            border: valeur === `icone:${k}` ? "1px solid #7aa2f7" : "1px solid #3a3f4b",
            background: valeur === `icone:${k}` ? "#1a2436" : "transparent",
            borderRadius: 4,
          }}
        >
          <IconeLoadout cle={k} taille={14} />
        </button>
      ))}
      {(["implacable", "bloqueur", "surcharge"] as TypeChampion[]).map((t) => (
        <button
          key={t}
          onClick={() => onChoisir(`champion:${t}`)}
          title={`Anti-${t}`}
          style={{
            padding: "0 0.25rem",
            border: valeur === `champion:${t}` ? "1px solid #7aa2f7" : "1px solid #3a3f4b",
            background: valeur === `champion:${t}` ? "#1a2436" : "transparent",
            borderRadius: 4,
          }}
        >
          <IconeAntiChampion type={t} taille={14} />
        </button>
      ))}
    </div>
  );
}
