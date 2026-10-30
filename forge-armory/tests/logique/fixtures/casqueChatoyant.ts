// FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures) - DONNÉES D'ESSAI COMMUNES au test logique (`energie-mods.test.ts`) et à la page de test d'interface (`tests/ui/entree-simulation-mods.tsx`) : un casque calqué sur la STRUCTURE RÉELLE du casque chatoyant de l'utilisateur (un mod de statistique, trois emplacements cumulables à liste commune, un ajustement dans sa vraie catégorie `core.gear_systems.armor_tiering.plugs.tuning.mods`, des mods en DEUX versions, un plug « vide » par liste, capacité 11 et énergie utilisée 10). ⚠️ Données d'ESSAI : elles ne disent rien des vrais mods du jeu. EN: ⚠️ ADDED - shared test data mirroring the real helmet's structure.
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET, T_PLUGSET } from "./fauxManifest";
import type { GearPiece } from "../../../src/types/build";

export const SANTE = 8801, MELEE = 8802, GRENADE = 8803, SUPER = 8804, CLASSE = 8805, ARMES = 8806;
export interface Opt { inv?: Array<[number, number]>; cout?: number; collectible?: boolean; regles?: number }
export const def = (hash: number, nom: string, categorie: string, o: Opt = {}) => ({
  displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description: "" },
  plug: { plugCategoryIdentifier: categorie, ...(o.cout !== undefined ? { energyCost: { energyCost: o.cout, energyTypeHash: 1 } } : {}), insertionRules: Array.from({ length: o.regles ?? 0 }, (_, i) => ({ failureMessage: `règle ${i}` })) },
  investmentStats: (o.inv ?? []).map(([statTypeHash, value]) => ({ statTypeHash, value })),
  ...(o.collectible ? { collectibleHash: 5000000 + hash } : {})
});
export const GEN = "enhancements.v2_general", TETE = "enhancements.v2_head", TUN = "core.gear_systems.armor_tiering.plugs.tuning.mods";

/** FR : ⚠️ AJOUT (30/10/2026) - `avecLore` : le casque chatoyant possède un LORE (table `DestinyLoreDefinition` + `loreHash`) : le bouton « Lire le Lore » doit alors apparaître dans sa fenêtre Détails. Par défaut : aucun Lore (comportement d'avant). / EN: ⚠️ ADDED - `avecLore`: the helmet has a lore entry. */
export function creerCasqueChatoyant(o: { avecLore?: boolean } = {}) {
const defs = ajouterArmureForge(manifestArmesDeTest());   // fournit les statistiques (8801 santé … 8806 armes) et les catégories de sockets
  const objets = defs[T_OBJET] as Record<number, unknown>;
  const jeux = defs[T_PLUGSET] as Record<number, unknown>;
  objets[9001] = def(9001, "Spécialiste", "armor_archetypes");
  objets[9002] = def(9002, "Amélioration d'armure", "v460.plugs.armor.masterworks", { inv: [[SANTE, 5], [MELEE, 5], [GRENADE, 5], [SUPER, 5], [CLASSE, 5], [ARMES, 5]] });
  // mods de statistique : la version STANDARD (coût 3 ou 1, collection, +10 ou +5) et la version à prix réduit (coût 1, aucun bonus, règle d'artéfact)
  objets[9101] = def(9101, "Mod de classe", GEN, { inv: [[CLASSE, 10]], cout: 3, collectible: true, regles: 1 }); objets[9102] = def(9102, "Mod de classe", GEN, { cout: 1, regles: 3 }); objets[9103] = def(9103, "Mod de classe mineur", GEN, { inv: [[CLASSE, 5]], cout: 1, collectible: true, regles: 1 });
  objets[9111] = def(9111, "Mod de santé", GEN, { inv: [[SANTE, 10]], cout: 3, collectible: true, regles: 1 }); objets[9112] = def(9112, "Mod de santé", GEN, { cout: 1, regles: 3 }); objets[9113] = def(9113, "Mod de santé mineur", GEN, { inv: [[SANTE, 5]], cout: 1, collectible: true, regles: 1 });
  objets[9121] = def(9121, "Mods d'arme", GEN, { inv: [[ARMES, 10]], cout: 3, collectible: true, regles: 1 }); objets[9122] = def(9122, "Mods d'arme", GEN, { cout: 1, regles: 3 }); objets[9123] = def(9123, "Mod d'armes mineur", GEN, { inv: [[ARMES, 5]], cout: 1, collectible: true, regles: 1 });
  objets[9199] = def(9199, "Emplacement de mod vide", GEN);
  jeux[8900] = { reusablePlugItems: [9101, 9102, 9103, 9111, 9112, 9113, 9121, 9122, 9123, 9199].map((h) => ({ plugItemHash: h })) };
  // mods cumulables du casque
  objets[9201] = def(9201, "Source de Super", TETE, { cout: 3, collectible: true, regles: 1 }); objets[9202] = def(9202, "Source de Super", TETE, { cout: 1, regles: 3 });
  objets[9203] = def(9203, "Siphon harmonieux", TETE, { cout: 1, collectible: true, regles: 1 });
  objets[9204] = def(9204, "Ciblage harmonieux", TETE, { cout: 2, collectible: true, regles: 1 }); objets[9205] = def(9205, "Ciblage harmonieux", TETE, { cout: 1, regles: 3 });
  objets[9206] = def(9206, "Détecteur de munitions lourdes", TETE, { cout: 3, collectible: true, regles: 1 });
  objets[9299] = def(9299, "Emplacement de mod vide", TETE);
  jeux[8901] = { reusablePlugItems: [9201, 9202, 9203, 9204, 9205, 9206, 9299].map((h) => ({ plugItemHash: h })) };
  jeux[8902] = { reusablePlugItems: [9399].map((h) => ({ plugItemHash: h })) };   // ⚠️ AJOUT (26/10/2026) : le jeu de plugs de l'AJUSTEMENT dans le MODÈLE : seulement le plug « vide » (« rien » est une issue de l'ajustement)
  // ajustement : AUCUN coût dans le Manifest ; le « + » de la pièce (Super) ; les « − » libres ; l'équilibré ; le vide
  objets[9301] = def(9301, "+Super / -Santé", TUN, { inv: [[SUPER, 5], [SANTE, -5]] }); objets[9302] = def(9302, "+Super / -Mêlée", TUN, { inv: [[SUPER, 5], [MELEE, -5]] });
  objets[9303] = def(9303, "+Super / -Grenade", TUN, { inv: [[SUPER, 5], [GRENADE, -5]] }); objets[9304] = def(9304, "+Super / -Classe", TUN, { inv: [[SUPER, 5], [CLASSE, -5]] }); objets[9305] = def(9305, "+Super / -Armes", TUN, { inv: [[SUPER, 5], [ARMES, -5]] });
  // ⚠️ L'ajustement équilibré n'a AUCUNE valeur dans le Manifest (les diagnostics réels ne donnent que son nom) : son effet vient de la RÈGLE du jeu (+1 sur les 3 statistiques non intrinsèques)
  objets[9306] = def(9306, "Ajustement équilibré", TUN);
  objets[9399] = def(9399, "Emplacement de mod d'ajustement vide", TUN);
  // ajustements d'une pièce EXOTIQUE : le « + » est libre
  objets[9311] = def(9311, "+Armes / -Santé", TUN, { inv: [[ARMES, 5], [SANTE, -5]] }); objets[9312] = def(9312, "+Armes / -Super", TUN, { inv: [[ARMES, 5], [SUPER, -5]] });
  // un emplacement de mod de RAID (autre emplacement modifiable)
  objets[9801] = def(9801, "Mod de raid A", "enhancements.raid_v700", { cout: 1, collectible: true }); objets[9802] = def(9802, "Mod de raid B", "enhancements.raid_v700", { cout: 2, collectible: true });
  const entrees = (inits: number[], jeu: Array<number | null>) => inits.map((h, i) => ({ singleInitialItemHash: h, ...(jeu[i] ? { reusablePlugSetHash: jeu[i] as number } : {}) }));
  const modele = (nom: string, inits: number[], jeu: Array<number | null>) => ({ displayProperties: { name: nom, icon: "/icons/casque.png" }, sockets: { socketEntries: entrees(inits, jeu), socketCategories: [] } });
  objets[5400] = modele("Casque chatoyant d'essai", [9001, 9002, 9101, 9201, 9201, 9203, 9301], [null, null, 8900, 8901, 8901, 8901, 8902]);
  objets[5402] = modele("Casque à emplacement de raid d'essai", [9001, 9002, 9101, 9201, 9201, 9203, 9301, 9801], [null, null, 8900, 8901, 8901, 8901, 8902, null]);
  objets[5401] = modele("Plastron exotique d'essai", [9001, 9002, 9101, 9301], [null, null, 8900, 8902]);
  if (o.avecLore) {
    (defs as Record<string, unknown>)["DestinyLoreDefinition"] = { 7777: { displayProperties: { name: "Lore du casque chatoyant", description: "Il était une fois un casque qui brillait." } } };
    (objets[5400] as Record<string, unknown>)["loreHash"] = 7777;
  }
  const { db } = creerFausseDb(defs);
  
  const STATS_REELLES = { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 };   // la statistique d'armes s'appelle `arme` (au singulier) dans l'appli
  const base = { isExotic: false, rarete: "Légendaire", perkHashes: [] as number[], stats: STATS_REELLES };
  const socles = [{ socketIndex: 0, hash: 9001 }, { socketIndex: 1, hash: 9002 }, { socketIndex: 2, hash: 9101 }, { socketIndex: 3, hash: 9201 }, { socketIndex: 4, hash: 9201 }, { socketIndex: 5, hash: 9203 }, { socketIndex: 6, hash: 9301 }];
  const dispoTuning = { 6: [9301, 9302, 9303, 9304, 9305, 9306] };   // ⚠️ le plug « vide » (9399) n'y est PAS : il vient du modèle du jeu (jeu de plugs 8902)
  const c1 = { ...base, itemHash: 5400, itemInstanceId: "c1", nom: "Casque chatoyant d'essai", slot: "casque", perksParColonne: socles, plugsDisponiblesParColonne: dispoTuning, energie: { capacite: 11, utilisee: 10 } } as unknown as GearPiece;
  return { defs, db, objets, jeux, base, socles, dispoTuning, c1 };
}
