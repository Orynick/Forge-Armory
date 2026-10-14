// FR : ⚠️ AJOUT (14/10/2026, v0.4.10), demande de l'utilisateur : « il faut mettre l'icône des armes façonnées PARTOUT ». VIGNETTE d'une arme (son image) avec, si l'arme est FAÇONNÉE, l'icône du jeu posée EN BAS À GAUCHE de la vignette, comme en jeu. Un seul composant pour les QUATRE endroits (Mon Inventaire, Coffre, Mon Build, liste de la Forge) : l'icône est toujours au même endroit, de la même teinte, avec le même nom accessible (« Arme façonnée ») et la même infobulle ; sa taille suit la vignette (environ un tiers).
// `reserverPlace` : réserve la place de la vignette même sans image (liste de la Forge) ; sinon, sans image, rien n'est dessiné (comme avant dans Mon Inventaire et Mon Build). La détection (`estFaconnee`) reste à la charge de l'appelant. EN: ⚠️ ADDED - weapon thumbnail with the crafted-weapon icon at the bottom-left, shared by all four views.
import IconeFaconnee from "./IconeFaconnee";

interface Props {
  icone?: string;
  /** FR : côté de la vignette, en pixels. / EN: thumbnail side in pixels. */
  taille: number;
  faconnee?: boolean;
  reserverPlace?: boolean;
}

export default function VignetteArme({ icone, taille, faconnee = false, reserverPlace = false }: Props) {
  if (!icone && !reserverPlace) return null;
  const tailleIcone = Math.max(9, Math.round(taille * 0.32));
  return (
    <span style={{ position: "relative", display: "block", width: taille, height: taille, flexShrink: 0 }}>
      {icone ? <img src={icone} alt="" width={taille} height={taille} style={{ borderRadius: 4, display: "block" }} /> : <span style={{ display: "block", width: taille, height: taille }} />}
      {faconnee && (
        <span data-badge-faconnee="" role="img" aria-label="Arme façonnée" title="Arme façonnée : ses perks se changent à la forge en jeu" style={{ position: "absolute", left: 2, bottom: 2, lineHeight: 0, background: "rgba(13,15,20,0.55)", borderRadius: 3, padding: taille >= 40 ? 2 : 1 }}>
          <IconeFaconnee taille={tailleIcone} />
        </span>
      )}
    </span>
  );
}
