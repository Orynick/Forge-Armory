// FR : ⚠️ AJOUT (21/10/2026, chantier Legendarium, étape 5) - BOUTON « Lire le Lore » des fiches Détails (spécification verrouillée §6) : affiché UNIQUEMENT si l'objet possède un Lore (via `aLore`, lecture légère sans balayage), placé EN HAUT DE FICHE, JUSTIFIÉ À DROITE, SOUS LA CROIX DE FERMETURE. Clic : aiguille l'utilisateur dans le Legendarium directement sur la page de Lore de l'objet (lien profond, forme `"item:<hashObjet>"` résolue par `trouverPage`), en mémorisant la provenance (transitoire, jamais persistée) pour le bouton de retour vers l'objet. Le composant est PUR (pas d'état, pas d'effet) : testable en rendu statique. / EN: ⚠️ ADDED - "Read the Lore" button for Details sheets (locked spec §6): shown ONLY if the item has a lore (via `aLore`, lightweight read, no table scan), placed at the TOP of the sheet, right-justified, UNDER the close cross. Click: routes the user into the Legendarium directly on the item's lore page (deep link, form `"item:<itemHash>"` resolved by `trouverPage`), remembering the origin (transient, never persisted) for the back-to-item button. Pure component (no state, no effect): testable in static render.
import type { Database } from "sql.js";
import { aLore } from "../lib/legendarium/modele";
import BoutonAction from "./BoutonAction";

interface Props {
  db: Database | null;
  /** FR : hash de l'objet de la fiche ouverte. / EN: the open sheet's item hash. */
  itemHash: number;
  /** FR : nom de l'objet (pour l'infobulle du bouton). / EN: item name (for the button's tooltip). */
  nomObjet: string;
  /** FR : clic : l'appelant aiguille vers le Legendarium (remontée d'action vers DashboardPage). / EN: click: the caller routes to the Legendarium (action lifted to DashboardPage). */
  onLireLore: (itemHash: number, nomObjet: string) => void;
}

/** FR : la ligne du bouton (justifiée à droite), rendue SEULEMENT si l'objet a un Lore. / EN: the button row (right-justified), rendered ONLY if the item has a lore. */
export default function BoutonLireLore({ db, itemHash, nomObjet, onLireLore }: Props) {
  // ⚠️ LECTURE LÉGÈRE : `aLore` = 2 définitions ciblées, aucun balayage de la table des objets (la fiche se rend souvent).
  if (!aLore(db, itemHash)) return null;
  return (
    <div data-ligne-lire-lore="" style={{ display: "flex", justifyContent: "flex-end", margin: "0.15rem 0 0.4rem" }}>
      {/* FR : ⚠️ CHANGÉ (30/10/2026, archive « boutons-action-final ») - le bouton utilise le VISUEL de la charte (`BoutonAction`, `boutons-action.lore`) ; l'`aria-label` « Lire le Lore » le rend trouvable par son nom ; mêmes repères `data-*` qu'avant. / EN: ⚠️ CHANGED - the button now uses the charter artwork. */}
      <BoutonAction id="boutons-action.lore" libelle="Lire le Lore" title={`Lire le Lore de « ${nomObjet} » dans le Legendarium`} onClick={() => onLireLore(itemHash, nomObjet)} donnees={{ "bouton-lire-lore": true, "item-hash": itemHash }} />
    </div>
  );
}
