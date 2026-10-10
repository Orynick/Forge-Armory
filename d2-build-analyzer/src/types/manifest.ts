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
  // Présent sur les armes : archétype, cadence, dégâts...
  defaultDamageType?: number;
  damageTypeHashes?: DefinitionHash[];
  // Présent sur armures/mods : quel(s) socket(s) ça occupe
  sockets?: {
    socketEntries: Array<{
      socketTypeHash: DefinitionHash;
      singleInitialItemHash: DefinitionHash;
      reusablePlugSetHash?: DefinitionHash;
    }>;
  };
  // Présent sur les perks/mods/aspects/fragments : effets en texte (à parser
  // pour les verbes d'élément : Scorched, Jolt, Devour, Sever, Volatile, etc.)
  perks?: Array<{ perkHash: DefinitionHash; requirementDisplayString: string }>;
  investmentStats?: Array<{ statTypeHash: DefinitionHash; value: number }>;
  inventory?: { tierTypeHash: DefinitionHash; bucketTypeHash: DefinitionHash };
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

/** Table brute renvoyée par le manifest : hash -> définition */
export type DefinitionTable<T> = Record<string, T>;
