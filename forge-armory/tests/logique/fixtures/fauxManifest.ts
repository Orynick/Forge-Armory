// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - FAUX MANIFEST pour les tests de la Forge : une fausse base qui se lit comme la vraie (`prepare`, `bind`, `step`, `getAsObject`, `free`), avec des armes d'essai fidèles à la structure de Bungie (armature en prise 0, pools aléatoires, colonnes cosmétiques, mods connus,
// exotique, arme hors Collections, objets à exclure). Aucune donnée réelle de Bungie : ces tests prouvent la LOGIQUE ; les données réelles se vérifient avec les listes de tests et les diagnostics. EN: ⚠️ ADDED - fake Manifest for the Forge tests.
import { hashVersIdSqlite } from "../../../src/lib/manifest/download";

export const T_OBJET = "DestinyInventoryItemDefinition", T_PLUGSET = "DestinyPlugSetDefinition", T_CATEGORIE = "DestinySocketCategoryDefinition", T_RARETE = "DestinyItemTierTypeDefinition";
export type Defs = Record<string, Record<number, unknown>>;
const HASH_EXOTIQUE = 2759499571, HASH_LEGENDAIRE = 4008398120;
const BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };

/** FR : fausse base : `LIKE '%motif%'` (sous-chaîne) et `id = ?` sont pris en charge, comme les deux requêtes que fait l'appli. / EN: fake database supporting the two query shapes the app uses. */
export function creerFausseDb(defs: Defs): { db: never; requetes: string[] } {
  const requetes: string[] = [];
  const db = {
    exec: () => [],
    prepare: (sql: string) => {
      requetes.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
      const lignes = Object.entries(defs[table] ?? {}).map(([h, d]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d) }));
      let choisies = lignes, courant = -1;
      return {
        bind: (a: number[]) => { if (/id\s*=\s*\?/.test(where)) choisies = lignes.filter((l) => l.id === a[0]); },
        step: () => {
          if (courant === -1) {
            const like = /LIKE\s+'(.*)'/.exec(where);
            if (like) { const coeur = like[1].replace(/^%|%$/g, ""); choisies = lignes.filter((l) => l.json.includes(coeur)); }
          }
          courant++; return courant < choisies.length;
        },
        getAsObject: () => ({ id: choisies[courant].id, json: choisies[courant].json }),
        free: () => {},
      };
    },
  };
  return { db: db as never, requetes };
}

const plug = (nom: string, description = "", extra: Record<string, unknown> = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, ...extra });
// FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) - `equippingBlock.ammoType` : 1 principales, 3 lourdes (comme le Manifest de Bungie ; sans lui l'icône de munitions de la carte n'apparaît pas). / EN: ⚠️ CHANGED - ammo type added.
const arme = (nom: string, o: { type: string; degats: number; bucket: number; tier: number; collectible?: number; sockets: unknown[]; categories?: unknown[]; extra?: Record<string, unknown> }) => ({
  displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description: "" },
  itemType: 3, itemTypeDisplayName: o.type, defaultDamageType: o.degats, inventory: { bucketTypeHash: o.bucket, tierTypeHash: o.tier }, equippingBlock: { ammoType: o.bucket === BUCKET.lourde ? 3 : 1 },
  ...(o.collectible ? { collectibleHash: o.collectible } : {}),
  sockets: { socketEntries: o.sockets, socketCategories: o.categories ?? [] }, ...(o.extra ?? {}),
});

/**
 * FR : ⚠️ AJOUT (13/10/2026) - ajoute l'arme 5008 « Pompe à mod précoce » dont la colonne des MODS CONNUS est en prise 1, AVANT les colonnes de traits (prise 2) et de chargeurs (prise 3) : seule une arme comme celle-là prouve que les mods sont vraiment relégués EN BAS
 * (dans l'arme 5001 ils sont déjà en dernière prise : un tri absent ne se verrait pas). Ordre attendu à l'affichage : Colonne 1 (armature), Colonne 3 (traits), Colonne 4 (chargeurs), Mods utilisables. / EN: weapon whose mod column comes BEFORE perk columns.
 */
export function ajouterArmeModPrecoce(defs: Defs): Defs {
  (defs[T_OBJET] as Record<number, unknown>)[5008] = arme("Pompe à mod précoce", { type: "Fusil à pompe", degats: 1, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, collectible: 9008,
    sockets: [{ singleInitialItemHash: 6001 }, { reusablePlugItems: [{ plugItemHash: 6601 }, { plugItemHash: 6602 }] }, { randomizedPlugSetHash: 8002 }, { randomizedPlugSetHash: 8001 }] });
  return defs;
}

/** FR : ⚠️ AJOUT (13/10/2026) - ajoute l'arme 5009 dont une colonne de traits contient un perk et son JUMEAU AMÉLIORÉ (même nom, type « Trait amélioré », catégorie de plug « frames.enhanced ») : pour tester le diagnostic. Structure INVENTÉE (le vrai Manifest n'a pas été vu). / EN: weapon with a perk and its enhanced twin (invented structure). */
export function ajouterArmeAmelioree(defs: Defs): Defs {
  (defs[T_PLUGSET] as Record<number, unknown>)[8003] = { reusablePlugItems: [{ plugItemHash: 6301 }, { plugItemHash: 6310 }, { plugItemHash: 6302 }] };
  (defs[T_OBJET] as Record<number, unknown>)[6301] = plug("Trait 1a", "Effet A.", { itemTypeDisplayName: "Trait", plug: { plugCategoryIdentifier: "frames" } });
  (defs[T_OBJET] as Record<number, unknown>)[6310] = plug("Trait 1a", "Effet A, renforcé.", { itemTypeDisplayName: "Trait amélioré", plug: { plugCategoryIdentifier: "frames.enhanced" } });
  (defs[T_OBJET] as Record<number, unknown>)[5009] = arme("Fusil à traits améliorés", { type: "Fusil à impulsion", degats: 3, bucket: BUCKET.energie, tier: HASH_LEGENDAIRE, collectible: 9009,
    sockets: [{ singleInitialItemHash: 6001 }, { randomizedPlugSetHash: 8003 }, { reusablePlugItems: [{ plugItemHash: 6401 }] }] });
  return defs;
}

/**
 * FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - ajoute l'arme 5010 « Fusil à paliers » avec la VRAIE structure des perks améliorés, relevée dans les diagnostics de l'utilisateur (Confiance, révision « à paliers ») : une version améliorée est un objet DISTINCT, de même nom que sa base, dans la même colonne, typé « Canon amélioré », « Chargeur amélioré », « Attribut amélioré » ou « Mod d'arme amélioré ». Elle contient :
 * canons (2 paires), chargeurs (1 paire + le cas AMBIGU « Chargeur abandonné » : même type pour les deux, le second listé après), attributs (1 paire + 1 perk sans jumeau), mods (1 paire + « Stabilité améliorée » SANS base), une colonne cosmétique à doublons (« Souvenir du champion » ×2, masquée par défaut) et une colonne d'ORIGINE avec deux homonymes SANS aucun amélioré (à ne PAS fusionner).
 * EN: ⚠️ ADDED - weapon 5010 with the REAL enhanced-perk structure seen in the user's diagnostics.
 */
export function ajouterArmeRevisionAPaliers(defs: Defs): Defs {
  const objets = defs[T_OBJET] as Record<number, unknown>, jeux = defs[T_PLUGSET] as Record<number, unknown>;
  const p = (nom: string, type: string, plugCat: string, description = "") => plug(nom, description, { itemTypeDisplayName: type, plug: { plugCategoryIdentifier: plugCat } });
  objets[6901] = p("Canon X", "Canon", "barrels", "Un canon X."); objets[6902] = p("Canon X", "Canon amélioré", "barrels", "Un canon X, version améliorée.");
  objets[6903] = p("Canon Y", "Canon", "barrels", "Un canon Y."); objets[6904] = p("Canon Y", "Canon amélioré", "barrels", "Un canon Y, version améliorée.");
  objets[6911] = p("Chargeur X", "Chargeur", "magazines", "Un chargeur X."); objets[6912] = p("Chargeur X", "Chargeur amélioré", "magazines", "Un chargeur X, version améliorée.");
  objets[6913] = p("Chargeur abandonné", "Chargeur", "magazines", "Recharge vite, petit chargeur."); objets[6914] = p("Chargeur abandonné", "Chargeur", "magazines", "Recharge vite, petit chargeur (version suivante du Manifest).");
  objets[6921] = p("Trait P", "Attribut", "frames", "Effet P."); objets[6922] = p("Trait P", "Attribut amélioré", "frames", "Effet P, renforcé."); objets[6923] = p("Trait Q", "Attribut", "frames", "Effet Q.");
  objets[6931] = p("Crosse de contrepoids", "Mod d'arme", "v400.weapon.mod_guns", "Mod de crosse."); objets[6932] = p("Crosse de contrepoids", "Mod d'arme amélioré", "v400.weapon.mod_guns", "Mod de crosse, amélioré."); objets[6933] = p("Stabilité améliorée", "Mod d'arme amélioré", "v400.weapon.mod_damage", "Stabilité +10");
  objets[6941] = p("Souvenir du champion", "Revêtement", "shader", "Appliquez ce revêtement."); objets[6942] = p("Souvenir du champion", "Revêtement", "shader", "Appliquez ce revêtement (autre).");
  objets[6951] = p("Particularité X", "Particularité d'origine", "origins", "Origine X."); objets[6952] = p("Particularité X", "Particularité d'origine", "origins", "Origine X (réédition).");
  jeux[8101] = { reusablePlugItems: [6901, 6903, 6902, 6904].map((h) => ({ plugItemHash: h })) };      // les bases d'abord, puis les améliorées : comme dans les diagnostics réels
  jeux[8102] = { reusablePlugItems: [6911, 6913, 6912, 6914].map((h) => ({ plugItemHash: h })) };
  jeux[8103] = { reusablePlugItems: [6921, 6923, 6922].map((h) => ({ plugItemHash: h })) };
  objets[5010] = arme("Fusil à paliers", { type: "Fusil à impulsion", degats: 3, bucket: BUCKET.energie, tier: HASH_LEGENDAIRE, collectible: 9010,
    sockets: [{ singleInitialItemHash: 6001 }, { randomizedPlugSetHash: 8101 }, { randomizedPlugSetHash: 8102 }, { randomizedPlugSetHash: 8103 }, { reusablePlugItems: [6931, 6932, 6933].map((h) => ({ plugItemHash: h })) }, { reusablePlugItems: [6941, 6942].map((h) => ({ plugItemHash: h })) }, { reusablePlugItems: [6951, 6952].map((h) => ({ plugItemHash: h })) }],
    categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3, 6] }, { socketCategoryHash: 7004, socketIndexes: [4] }, { socketCategoryHash: 7003, socketIndexes: [5] }] });
  return defs;
}

/** FR : armes d'essai. Hash : 5001 « Fusil d'essai » (légendaire, cinétique... voir plus bas), 5002 exotique lourd, 5003 sans Collection, 5004 masqué (redacted), 5005 une ARMURE, 5006 sans nom, 5007 objet de la catégorie factice. / EN: test weapons. */
export function manifestArmesDeTest(): Defs {
  return {
    [T_RARETE]: { [HASH_LEGENDAIRE]: { displayProperties: { name: "Légendaire" } }, [HASH_EXOTIQUE]: { displayProperties: { name: "Exotique" } } },
    [T_CATEGORIE]: { 7001: { displayProperties: { name: "Armature" } }, 7002: { displayProperties: { name: "Perks d'arme" } }, 7003: { displayProperties: { name: "Souvenir" } }, 7004: { displayProperties: { name: "Mods d'arme" } } },
    [T_PLUGSET]: {
      8001: { reusablePlugItems: [{ plugItemHash: 6201 }, { plugItemHash: 6202 }] },
      8002: { reusablePlugItems: [{ plugItemHash: 6301 }, { plugItemHash: 6302 }, { plugItemHash: 6303 }] },
    },
    [T_OBJET]: {
      5001: arme("Fusil d'essai", { type: "Fusil à impulsion", degats: 3, bucket: BUCKET.energie, tier: HASH_LEGENDAIRE, collectible: 9001,
        sockets: [
          { singleInitialItemHash: 6001 },
          { reusablePlugItems: [{ plugItemHash: 6101 }, { plugItemHash: 6102 }] },
          { randomizedPlugSetHash: 8001 },
          { randomizedPlugSetHash: 8002 },
          { reusablePlugItems: [{ plugItemHash: 6401 }] },
          { reusablePlugItems: [{ plugItemHash: 6601 }, { plugItemHash: 6602 }] },
          { reusablePlugItems: [{ plugItemHash: 6701 }] },
        ],
        categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3] }, { socketCategoryHash: 7003, socketIndexes: [4] }, { socketCategoryHash: 7004, socketIndexes: [5, 6] }] }),
      5002: arme("Lance-roquettes d'essai", { type: "Lance-roquettes", degats: 4, bucket: BUCKET.lourde, tier: HASH_EXOTIQUE, collectible: 9002, sockets: [{ singleInitialItemHash: 6003 }, { reusablePlugItems: [{ plugItemHash: 6801 }] }] }),
      5003: arme("Arc d'essai", { type: "Arc", degats: 1, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [{ singleInitialItemHash: 6001 }, { reusablePlugItems: [{ plugItemHash: 6101 }] }] }),
      5004: arme("Arme masquée", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, collectible: 9004, sockets: [], extra: { redacted: true } }),
      5005: { displayProperties: { name: "Casque d'essai", icon: "/icons/casque.png" }, itemType: 2, itemTypeDisplayName: "Casque", inventory: { bucketTypeHash: 3448274439, tierTypeHash: HASH_LEGENDAIRE } },
      5006: arme("", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [] }),
      5007: arme("Arme factice", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [], extra: { itemCategoryHashes: [3109687656] } }),
      6001: plug("Armature adaptative"), 6003: plug("Œil d'essai"),
      6101: plug("Canon A", "Un canon."), 6102: plug("Canon B", "Un autre canon."),
      6201: plug("Chargeur A"), 6202: plug("Chargeur B"),
      6301: plug("Trait 1a", "Effet A."), 6302: plug("Trait 1b", "Effet B."), 6303: plug("Trait 1c", "Effet C."),
      6401: plug("Souvenir: Test"),
      6601: plug("Crosse de contrepoids", "Mod de crosse."), 6602: plug("Poignée de sprint", "Mod de poignée."),
      6701: plug("Compte-frags"), 6801: plug("Perk exotique", "Effet exotique."),
    },
  };
}
