// FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - AFFICHAGE PARTAGÉ des colonnes de perks d'une arme : légende des versions améliorées, une colonne par `socketIndex` (même ordre et mêmes libellés que la popup « Détails »), chaque perk une seule fois avec son ▲ s'il a une version améliorée. Utilisé par la Collection (consultation seule) ET par l'Inventaire de la Forge (SÉLECTION), pour que le tri et l'affichage ne divergent jamais
// (consigne de la spécification : « toute évolution du tri doit être testée dans la popup Détails ET dans la Forge »). Le code est celui de la fenêtre de la Collection de la 0.4.4, déplacé tel quel ; sans `onChoisir` le rendu est IDENTIQUE à l'ancien (puces en `<span>`).
// Avec `onChoisir` (Inventaire) : dans une colonne NON masquée qui propose au moins deux perks, chaque puce devient un BOUTON (`aria-pressed` = choix simulé) ; le roll RÉEL est marqué « ✓ » (que ce soit la version de base ou la version améliorée du perk) ; un choix simulé est doré. Une colonne d'un seul perk (l'armature) et les colonnes masquées ne sont jamais sélectionnables. EN: ⚠️ ADDED - shared perk columns display (consultation or selection).
import type { CSSProperties } from "react";
import type { ColonneOptionsArme, OptionSocket } from "../lib/manifest/doctrine";
import type { OptionJumelee } from "../lib/manifest/perksAmeliores";
import { libelleColonne } from "../lib/manifest/colonnesArme";
import { niveauDePerk, NiveauPerk, SimulationArme } from "../lib/forge/simulation";

export interface ColonneAffichee { col: ColonneOptionsArme; items: OptionJumelee<OptionSocket>[] }
const MASQUE_VISUEL: CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

interface Props {
  colonnes: ColonneAffichee[];
  /** FR : (Inventaire) les choix simulés de l'arme, par index de prise. / EN: (Inventory) the simulated choices. */
  simules?: SimulationArme;
  /** FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - (Inventaire) les perks DISPONIBLES sur l'exemplaire, par index de prise ; absent = non lu : aucun niveau « possible » n'est alors affiché. / EN: perks available on the instance, by socket index. */
  disponibles?: Record<number, number[]>;
  /** FR : présent seulement dans l'Inventaire : rend les puces sélectionnables. / EN: only in Inventory: makes chips selectable. */
  onChoisir?: (socketIndex: number, item: OptionJumelee<OptionSocket>) => void;
}

export default function ColonnesPerks({ colonnes, simules, disponibles, onChoisir }: Props) {
  const nbAmeliores = colonnes.reduce((n, c) => n + c.items.filter((i) => i.ameliore).length, 0);
  return (
    <>
      {nbAmeliores > 0 && (
        <p data-legende-amelioration="" style={{ fontSize: "0.72rem", color: "#e8c547", margin: "0 0 0.6rem" }}>▲ = ce perk existe aussi en version améliorée ({nbAmeliores}). Survolez un perk pour lire les deux versions.</p>
      )}
      {colonnes.map(({ col, items }) => {
        const selectionnable = !!onChoisir && !col.masquee && items.length > 1;
        const choixSimule = simules?.[col.socketIndex];
        return (
          <div key={col.socketIndex} data-colonne={col.socketIndex} data-masquee={col.masquee ?? ""} style={{ marginBottom: "0.6rem", opacity: col.masquee ? 0.65 : 1 }}>
            <strong style={{ fontSize: "0.75rem", color: "#7d7a70" }}>{libelleColonne(col)}{col.masquee ? ` — inutile (${col.masquee === "ornement" ? "ornement" : "cosmétique"})` : ""}</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
              {items.map((item) => {
                const { option: opt, ameliore, incertain } = item;
                const reel = !!(opt.equipeEnJeu || ameliore?.equipeEnJeu);
                const simule = !!choixSimule && choixSimule.choisi === opt.hash;
                const reelRemplace = reel && !!choixSimule && !simule;   // le roll réel, mis de côté par un choix simulé dans cette colonne
                // FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - le niveau du perk (réel, simulé, disponible sur l'exemplaire, possible sur le modèle) : seulement dans l'Inventaire. / EN: the perk level, Inventory only.
                const niveau: NiveauPerk | "" = onChoisir && !col.masquee ? niveauDePerk(item, col.socketIndex, disponibles, choixSimule) : "";
                const attributs = {
                  "data-perk": opt.hash, "data-ameliore": ameliore ? ameliore.hash : "", "data-incertain": incertain ? "1" : "",
                  "data-reel": reel ? "1" : "", "data-simule": simule ? "1" : "", "data-niveau": niveau, "data-effectif": simule ? choixSimule!.effectif : "",
                  title: ameliore ? `${opt.description ?? ""}\n\nVersion améliorée${incertain ? " (probable : le Manifest ne la nomme pas « améliorée », elle est reconnue par sa position)" : ""} :\n${ameliore.description ?? ""}` : opt.description,
                  style: {
                    fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: 999, color: simule ? "#f3e7b0" : niveau === "possible" ? "#6b6860" : "#c9c5b8", display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    // FR : contour : doré (simulé), bleu (roll réel), GRIS CLAIR (disponible sur l'exemplaire), sinon discret ; nom GRISÉ pour « possible sur le modèle ». / EN: border and text colour per level.
                    border: simule ? "1px solid #e8c547" : reel && onChoisir ? `1px ${reelRemplace ? "dashed" : "solid"} #7aa2f7` : niveau === "disponible" ? "1px solid #b9bcc6" : `1px ${col.masquee ? "dashed" : "solid"} #2a2e38`,
                    background: simule ? "#2a2412" : reel && onChoisir && !reelRemplace ? "#1a2436" : "transparent",
                    cursor: selectionnable ? "pointer" : "default",
                  } as CSSProperties,
                };
                const contenu = (
                  <>
                    {reel && onChoisir && <span aria-hidden="true" style={{ color: "#7aa2f7" }}>✓</span>}
                    {opt.icone && <img src={opt.icone} alt="" width={16} height={16} style={niveau === "possible" ? { opacity: 0.55 } : undefined} />}
                    {opt.nom}
                    {ameliore && (
                      <span data-amelioration="" style={{ display: "inline-flex", alignItems: "center", gap: "0.15rem", color: "#e8c547", borderLeft: "1px solid #3a3f4b", paddingLeft: "0.3rem" }}>
                        {ameliore.icone && <img src={ameliore.icone} alt="" width={16} height={16} />}
                        <span aria-hidden="true">▲</span>
                        <span style={MASQUE_VISUEL}>version améliorée{incertain ? " probable" : ""}</span>
                      </span>
                    )}
                    {onChoisir && reel && <span style={MASQUE_VISUEL}>, roll réel{reelRemplace ? " (remplacé par votre simulation)" : ""}</span>}
                    {niveau === "disponible" && <span style={MASQUE_VISUEL}>, disponible sur votre exemplaire, non sélectionné en jeu</span>}
                    {niveau === "possible" && <span style={MASQUE_VISUEL}>, possible sur ce modèle d'arme mais pas disponible sur votre exemplaire</span>}
                    {simule && <span data-etiquette-simule="" style={{ fontSize: "0.65rem", color: "#e8c547" }}>simulé{choixSimule!.effectif !== choixSimule!.choisi ? " (▲ comptée)" : ""}</span>}   {/* FR : « ▲ comptée » = pour le build, c'est la VERSION AMÉLIORÉE de ce perk qui sera comptée (l'arme est une arme améliorée). */}
                  </>
                );
                return selectionnable
                  ? <button key={opt.hash} type="button" aria-pressed={simule} onClick={() => onChoisir!(col.socketIndex, item)} {...attributs}>{contenu}</button>
                  : <span key={opt.hash} {...attributs}>{contenu}</span>;
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
