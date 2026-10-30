// FR : ⚠️ AJOUT (30/10/2026, archive « boutons-action-final » fournie par l'utilisateur : « Intègre les visuels qui sont dans le ZIP ») - BOUTON D'ACTION VISUEL : un vrai `<button>` (clavier, focus, désactivation) qui affiche le visuel de la charte (`boutons-action.*` du catalogue : plaque Forge, fond transparent, texte en TRACÉS donc non traduisible) ; l'`aria-label` porte le texte du bouton (règle de l'archive : « prévoir un aria-label »), ce qui permet aux lecteurs d'écran, au clavier et aux tests de le retrouver par son NOM. Hauteur d'affichage 40 px par défaut (conseillé : 36 à 44) ; la largeur suit le texte (ratio du catalogue). États : survol (légère clarté), focus clavier (contour), désactivé (atténué).
// EN: ⚠️ ADDED - VISUAL ACTION BUTTON: a real <button> showing the charter's artwork; the aria-label carries the button text.
import { urlVisuel } from "../lib/visuelsForge";
import { forgeAsset } from "../data/forge/forgeAssets";
import { FORGE_ASSETS_COMPLEMENT } from "../data/forge/forgeAssetsComplement";

export type IdBoutonAction = "boutons-action.retour" | "boutons-action.plus" | "boutons-action.lore" | "boutons-action.actualisation" | "boutons-action.forgemods" | "boutons-action.modifier";

interface Props {
  id: IdBoutonAction;
  /** FR : le texte du bouton, pour les lecteurs d'écran, le clavier et les tests (`aria-label`). Par défaut : l'étiquette du catalogue. */
  libelle?: string;
  onClick: () => void;
  disabled?: boolean;
  /** FR : hauteur d'affichage en px (36 à 44 conseillé). */
  hauteur?: number;
  title?: string;
  /** FR : ⚠️ AJOUT (30/10/2026) - état déplié / replié d'un bouton qui ouvre un bloc (`aria-expanded`) : « Modifier ». / EN: ⚠️ ADDED - `aria-expanded` for toggle buttons. */
  ariaExpanded?: boolean;
  /** FR : attributs `data-*` à poser sur le bouton (les tests et le style s'y accrochent). */
  donnees?: Record<string, string | number | boolean | undefined>;
}

export default function BoutonAction({ id, libelle, onClick, disabled = false, hauteur = 40, title, ariaExpanded, donnees = {} }: Props) {
  const entree = forgeAsset(id) ?? FORGE_ASSETS_COMPLEMENT.find((a) => a.id === id);
  const etiquette = libelle ?? entree?.label ?? id;
  const largeur = Math.round(hauteur * (entree?.ratio ?? 4));
  const attributs: Record<string, string> = {};
  for (const [k, v] of Object.entries(donnees)) if (v !== undefined && v !== false) attributs[`data-${k}`] = v === true ? "" : String(v);
  return (
    <button
      type="button"
      aria-label={etiquette}
      aria-expanded={ariaExpanded}
      title={title ?? etiquette}
      disabled={disabled}
      onClick={onClick}
      {...attributs}
      className="bouton-action"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, margin: 0, border: 0, background: "transparent", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1, lineHeight: 0, borderRadius: 6 }}
    >
      <img src={urlVisuel(id)} alt="" width={largeur} height={hauteur} draggable={false} style={{ display: "block", height: hauteur, width: "auto", maxWidth: "100%", pointerEvents: "none" }} />
    </button>
  );
}
