// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - TYPES du Legendarium : modèle de données en LECTURE SEULE. Aucune écriture, aucun état persistant : tout vit en mémoire le temps de la session. Les décisions verrouillées sont dans `documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md`. / EN: types for the Legendarium: a READ-ONLY data model. No writes, no persisted state: everything lives in memory for the session. Locked decisions are in `documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md`.
import type { DefinitionHash } from "../../types/manifest";
import type { SlotArmure } from "../../types/build";
import type { ClasseArmure } from "../manifest/catalogueArmures";

/** FR : les quatre sections, DANS L'ORDRE GLOBAL verrouillé (D1, puis D2, puis armes/armures, puis cosmétiques). / EN: the four sections, IN the locked global order (D1, then D2, then weapons/armor, then cosmetics). */
export type SectionLegendarium = "grimoire" | "legendes" | "objets" | "cosmetiques";

/** FR : ère d'une section, pour la palette verrouillée « Parchemin / Hologramme » : D1 = parchemin, tout le reste = hologramme. / EN: era of a section, for the locked "Parchment / Hologram" palette: D1 = parchment, everything else = hologram. */
export type EreLegendarium = "d1" | "d2";

/** FR : une page de Lore (carte du Grimoire D1, page de Légende D2, ou texte de Lore d'un objet). L'identifiant est STABLE : c'est le lien profond depuis une fiche Détails et pour le retour inverse. / EN: one lore page (a D1 Grimoire card, a D2 Legends page, or an item's lore text). The id is STABLE: it is the deep link from a Details sheet and for the reverse path. */
export interface PageLore {
  /** FR : identifiant stable de la page. Pour un Lore d'objet : `"lore:<hashLore>"` (UNE page par Lore, dédoublonnée — les rééditions partagent le même Lore et donc la même page). Pour une Légende D2 : `"lore:<hashLore>"`. Pour le Grimoire D1 : `"grimoire:<idCarte>"`. / EN: stable page id. For an item lore: `"lore:<loreHash>"` (ONE page per lore, deduplicated — reissues share the same lore and thus the same page). For a D2 Legend: `"lore:<loreHash>"`. For the D1 Grimoire: `"grimoire:<cardId>"`. */
  id: string;
  titre: string;
  /** FR : sous-titre optionnel (nom du chapitre pour les Légendes). / EN: optional subtitle (chapter name for Legends). */
  sousTitre?: string;
  /** FR : texte complet de la page. / EN: full text of the page. */
  texte: string;
  /** FR : hash du Lore quand la page vient d'une entrée DestinyLoreDefinition (Légendes D2 et Lore d'objets). / EN: lore hash when the page comes from a DestinyLoreDefinition entry (D2 Legends and item lore). */
  loreHash?: DefinitionHash;
  /** FR : ⚠️ AJOUT (20/10/2026, décision utilisateur) - objets portant ce Lore (rééditions comprises), pour le parcours inverse depuis la page. Vide pour les Légendes D2 et le Grimoire D1. / EN: items carrying this lore (reissues included), for the reverse path from the page. Empty for D2 Legends and the D1 Grimoire. */
  porteurs?: ObjetPorteur[];
}

/** FR : un livre = un groupe de pages (livre du Grimoire D1, livre de Légendes D2, « Lore des armes », « Ensembles d'armures », « Spectres, Vaisseaux, Passereaux »). / EN: a book = a group of pages (a D1 Grimoire book, a D2 Legends book, "Weapon lore", "Armor sets", "Ghosts, Ships, Sparrows"). */
export interface LivreLore {
  id: string;
  titre: string;
  pages: PageLore[];
}

/** FR : un objet porteur d'un Lore (pour le parcours inverse : depuis une page de Lore, voir les objets qui la portent). / EN: an item carrying a lore (for the reverse path: from a lore page, see the items that carry it). */
export interface ObjetPorteur {
  /** FR : hash de l'objet (DestinyItemDefinition.hash). / EN: item hash. */
  hash: DefinitionHash;
  nom: string;
  /** FR : emplacement lisible (ex: « Casque · Titan »). / EN: readable slot (e.g. "Helmet · Titan"). */
  emplacement: string;
  /** FR : pour les armures : la classe et l'emplacement, pour la règle des ensembles. / EN: for armor: class and slot, for the set ordering rule. */
  classe?: ClasseArmure;
  slotArmure?: SlotArmure;
}

/** FR : provenance TRANSITOIRE d'une page atteinte depuis une fiche Détails (jamais persistée). / EN: TRANSIENT origin of a page reached from a Details sheet (never persisted). */
export interface ProvenanceObjet {
  /** FR : hash de l'objet d'où l'on vient. / EN: hash of the item we come from. */
  itemHash: DefinitionHash;
  /** FR : nom de l'objet, pour le libellé du bouton de retour. / EN: item name, for the back button label. */
  nomObjet: string;
  /** FR : d'où venait l'utilisateur avant la fiche Détails (même mécanique que le bouton « Forge »). / EN: where the user was before the Details sheet (same mechanics as the "Forge" button). */
  origine: "analyseur" | "loadouts" | "forge" | "bibliotheque";
}

/** FR : état complet du Legendarium, en mémoire uniquement. / EN: full Legendarium state, in memory only. */
export interface EtatLegendarium {
  section: SectionLegendarium;
  /** FR : livre actif (dérivé de la section et de la page courante). / EN: active book (derived from the section and the current page). */
  livreId: string | null;
  /** FR : page courante (lien profond possible). / EN: current page (deep-linkable). */
  pageId: string | null;
  /** FR : si la page a été atteinte depuis une fiche Détails : bouton de retour vers l'objet. / EN: if the page was reached from a Details sheet: back button to the item. */
  provenance?: ProvenanceObjet;
}
