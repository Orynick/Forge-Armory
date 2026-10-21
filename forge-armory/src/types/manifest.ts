// Types minimaux pour les tables du Manifest Destiny 2 dont on a besoin.
// Le Manifest complet contient ~80 tables ; on ne type que ce qu'on consomme,
// le reste peut être requêté en `any` directement en SQL si besoin ponctuel.

export type DefinitionHash = number;

export interface DestinyDisplayProperties {
  name: string;
  description: string;
  icon?: string;
}

/** DestinyInventoryItemDefinition (armes, armures, mods, aspects, fragments...) */
export interface DestinyItemDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
  itemType: number;
  itemSubType: number;
  /** FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium) - objet masqué par Bungie (ne doit pas être affiché). / EN: item redacted by Bungie (must not be displayed). */
  redacted?: boolean;
  /** FR : texte lisible de la catégorie (ex: "Aspect", "Fragment", "Fusil à pompe") - utilisé pour le filtre de recherche. / EN: readable category text (e.g. "Aspect", "Fragment", "Shotgun") - used for the search filter. */
  itemTypeDisplayName?: string;
  /** FR : lien vers l'entrée DestinyCollectibleDefinition (source d'obtention), absent pour beaucoup d'objets. / EN: link to the DestinyCollectibleDefinition entry (obtain source), absent for many items. */
  collectibleHash?: DefinitionHash;
  /** FR : 0=Titan, 1=Chasseur, 2=Arcaniste, 3=Aucune restriction (arme, objet générique...). / EN: 0=Titan, 1=Hunter, 2=Warlock, 3=No restriction (weapon, generic item...). */
  classType?: number;
  /** FR : catégories de l'objet (souvent utilisé par Bungie pour distinguer "Sous-classe Vide" de "Sous-classe Arc", etc.) - piste à explorer pour l'élément des sous-classes. / EN: item categories (often used by Bungie to distinguish "Void Subclass" from "Arc Subclass", etc.) - lead to explore for subclass element. */
  itemCategoryHashes?: number[];
  // Présent sur les armes : archétype, cadence, dégâts...
  defaultDamageType?: number;
  damageTypeHashes?: DefinitionHash[];
  /** FR : étiquette interne texte de Bungie pour classer les "plugs" (aspects, fragments, sous-classes...) - souvent au format "type.element", ex "aspects.void". / EN: Bungie's internal text tag to classify "plugs" (aspects, fragments, subclasses...) - often formatted "type.element", e.g. "aspects.void". */
  plugCategoryIdentifier?: string;
  // Présent sur armures/mods/sous-classes : quel(s) socket(s) ça occupe,
  // et (pour les sous-classes) les options disponibles dans chaque socket
  // (aspects, fragments, super, mêlée, grenade, compétence de classe).
  sockets?: {
    socketEntries: Array<{
      socketTypeHash: DefinitionHash;
      singleInitialItemHash: DefinitionHash;
      reusablePlugSetHash?: DefinitionHash;
      /** FR : pool de perks à rolls ALÉATOIRES (barillet/munitions/perks d'arme typiquement) - distinct de reusablePlugSetHash. / EN: pool of RANDOM-roll perks (barrel/magazine/weapon perks typically) - distinct from reusablePlugSetHash. */
      randomizedPlugSetHash?: DefinitionHash;
      /** FR : présent sur certains sockets (souvent sous-classes) : liste directe des options, sans passer par un PlugSet partagé. / EN: present on some sockets (often subclasses): direct list of options, without going through a shared PlugSet. */
      reusablePlugItems?: Array<{ plugItemHash: DefinitionHash }>;
    }>;
    /** FR : regroupe les index de socketEntries sous une catégorie nommée (ex: "ASPECTS", "FRAGMENTS", "SUPER"). / EN: groups socketEntries indices under a named category (e.g. "ASPECTS", "FRAGMENTS", "SUPER"). */
    socketCategories?: Array<{
      socketCategoryHash: DefinitionHash;
      socketIndexes: number[];
    }>;
  };
  // Présent sur les perks/mods/aspects/fragments : effets en texte (à parser
  // pour les verbes d'élément : Scorched, Jolt, Devour, Sever, Volatile, etc.)
  perks?: Array<{ perkHash: DefinitionHash; requirementDisplayString: string }>;
  investmentStats?: Array<{ statTypeHash: DefinitionHash; value: number }>;
  inventory?: { tierTypeHash: DefinitionHash; bucketTypeHash: DefinitionHash; tierType?: number };
  /**
   * FR : type de champion contré par cette arme - c'est le champ OFFICIEL du
   * Manifest pour ça (enum DestinyBreakerType), bien plus fiable que lire le
   * nom des perks. Valeurs : 0 = aucun, 1 = ShieldPiercing (Bloqueur),
   * 2 = Disruption (Surchargé), 3 = Stagger (Implacable).
   * EN: champion type countered by this weapon - this is the OFFICIAL Manifest
   * field for it (DestinyBreakerType enum), far more reliable than reading perk
   * names. Values: 0 = none, 1 = ShieldPiercing (Barrier), 2 = Disruption
   * (Overload), 3 = Stagger (Unstoppable).
   */
  breakerType?: number;
  /** FR : hash vers DestinyBreakerTypeDefinition (même info que breakerType, sous forme de définition avec nom/icône traduits). / EN: hash to DestinyBreakerTypeDefinition (same info as breakerType, as a definition with translated name/icon). */
  breakerTypeHash?: DefinitionHash;
  /** FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium) - hash vers DestinyLoreDefinition quand l'objet possède un Lore (armes, armures, Spectres, Vaisseaux, Passereaux...). Absent quand l'objet n'a pas de Lore : c'est LE critère d'affichage du bouton « Lire le Lore ». / EN: hash to DestinyLoreDefinition when the item has lore; absent otherwise - this is THE criterion for showing the "Read the Lore" button. */
  lore?: DefinitionHash;
}

/** DestinyLoreDefinition (pages de Légendes D2 et textes de Lore des objets) */
export interface DestinyLoreDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
  /** FR : sous-titre optionnel de la page (ex: nom du chapitre). / EN: optional page subtitle (e.g. chapter name). */
  subtitle?: string;
  /** FR : corps du texte de la page. / EN: body text of the page. */
  body?: string;
}

/** DestinyStatDefinition (Santé, Mêlée, Grenade, Super, Classe, Arme, Armes) */
export interface DestinyStatDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
}

/** DestinySandboxPerkDefinition (effets bruts des perks/mods) */
export interface DestinySandboxPerkDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
}

/** DestinyDamageTypeDefinition (Solaire, Arc, Vide/Abyssal, Stase, Filobscur, Prismatique) */
export interface DestinyDamageTypeDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
  enumValue: number;
}

/** DestinyArtifactDefinition (les 7 artefacts fixes post-Monument of Triumph) */
export interface DestinyArtifactDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
  tiers: Array<{
    items: Array<{ itemHash: DefinitionHash }>;
  }>;
}

/** DestinySocketCategoryDefinition (nom lisible d'un regroupement de sockets : "ASPECTS", "FRAGMENTS", "SUPER"...) */
export interface DestinySocketCategoryDefinition {
  hash: DefinitionHash;
  displayProperties: DestinyDisplayProperties;
}

/** DestinyPlugSetDefinition (pool d'options partagé référencé par plusieurs sockets - ex: tous les sockets de fragments d'une sous-classe) */
export interface DestinyPlugSetDefinition {
  hash: DefinitionHash;
  reusablePlugItems: Array<{ plugItemHash: DefinitionHash }>;
}

/** Table brute renvoyée par le manifest : hash -> définition */
