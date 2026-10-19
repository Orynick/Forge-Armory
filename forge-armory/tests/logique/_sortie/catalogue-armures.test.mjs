import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// src/lib/bungie/config.ts
var BUNGIE_ROOT = "https://www.bungie.net";
var BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
var bungieConfig = {
  apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
  clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
  redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
};

// src/lib/manifest/download.ts
function hashVersIdSqlite(hash) {
  return hash > 2147483647 ? hash - 4294967296 : hash;
}
function idSqliteVersHash(id) {
  return id < 0 ? id + 4294967296 : id;
}
var cacheDefinitionsParDb = /* @__PURE__ */ new WeakMap();
function obtenirDefinition(db2, nomTable, hash) {
  let cache = cacheDefinitionsParDb.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    cacheDefinitionsParDb.set(db2, cache);
  }
  const cle = `${nomTable}:${hash}`;
  if (cache.has(cle)) return cache.get(cle);
  const stmt = db2.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? JSON.parse(stmt.getAsObject().json) : void 0;
  stmt.free();
  cache.set(cle, resultat);
  return resultat;
}

// src/data/constantesManifest.ts
var BUCKET_HASH_VERS_SLOT = {
  1498876634: "cinetique",
  // Kinetic Weapons
  2465295065: "energie",
  // Energy Weapons
  953998645: "lourde",
  // Power Weapons
  3448274439: "casque",
  // Helmet
  3551918588: "gants",
  // Gauntlets
  14239492: "torse",
  // Chest Armor
  20886954: "jambes",
  // Leg Armor
  1585787867: "marque"
  // Class Armor (Marque/Cape/Manteau selon la classe)
};
var TIER_TYPE_HASH_EXOTIQUE = 2759499571;
var CLASS_TYPE_VERS_CLASSE = {
  0: "titan",
  1: "chasseur",
  2: "arcaniste"
};

// src/lib/manifest/search.ts
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
}
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// src/data/exotiquesAntiChampion.ts
var REFERENCE_EXOTIQUES_ANTI_CHAMPION = [
  { nom: "Belle Affaire", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Sturm", emplacement: "cinetique", champion: "implacable" },
  { nom: "Aile de Vigilance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Empereur des Rats", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Outil multifonction MIDA", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Garance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Le Lapin de Jade", emplacement: "cinetique", champion: "implacable" },
  { nom: "L'opportun", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE8gne de Suros", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cerberus+1", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Tueur de Souhaits", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Malveillance", emplacement: "cinetique", champion: "implacable" },
  { nom: "As de Pique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "La Gouvernante", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Fardeau d'Izanagi", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Derni\xE8res paroles", emplacement: "cinetique", champion: "implacable" },
  { nom: "Arbal\xE8te", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Chardon", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Infection parfaite", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Lumina", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Poup\xE9e vaudou", emplacement: "cinetique", champion: "implacable" },
  { nom: "Monte-Carlo", emplacement: "cinetique", champion: "implacable" },
  { nom: "Bastion", emplacement: "cinetique", champion: "implacable" },
  { nom: "Tr\xE9sor ass\xE9ch\xE9", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Elu du Voyageur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Rapace noir", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Trop long \xE0 expliquer", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE9cit d'un homme mort", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cryosth\xE9sie 77k", emplacement: "cinetique", champion: "implacable" },
  { nom: "Sceptre d'Ager", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Pr\xE9d\xE9cesseur", emplacement: "cinetique", champion: "implacable" },
  { nom: "Osteo Striga", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Once de m\xE9chancet\xE9", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Temp\xEAte de vif-argent", emplacement: "cinetique", champion: "implacable" },
  { nom: "R\xE9vision z\xE9ro", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Dernier avertissement", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Finalit\xE9 conditionnelle", emplacement: "cinetique", champion: "implacable" },
  { nom: "Courbe verglac\xE9e", emplacement: "cinetique", champion: "implacable" },
  { nom: "Outil de folie", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Le Navigateur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Gouffre n\xE9crotique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Garde-souhaits", emplacement: "cinetique", champion: "implacable" },
  { nom: "Khvostov 7G-0X", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Euphonie", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Al\xE9thonyme", emplacement: "cinetique", champion: "implacable" },
  { nom: "Neo Finis Terr\xE6", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Tumulus dyadique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Nouveau Malpais", emplacement: "cinetique", champion: "implacable" },
  { nom: "Lame praxique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Ombre de Cull", emplacement: "cinetique", champion: "implacable" },
  { nom: "C\u0153ur de glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impitoyable", emplacement: "energie", champion: "implacable" },
  { nom: "Lion de guerre", emplacement: "energie", champion: "implacable" },
  { nom: "Rayon de soleil", emplacement: "energie", champion: "implacable" },
  { nom: "Lance du graviton", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment des Embraseurs", emplacement: "energie", champion: "bloqueur" },
  { nom: "Borealis", emplacement: "energie", champion: "bloqueur" },
  { nom: "Casse-cou", emplacement: "energie", champion: "surcharge" },
  { nom: "Ombres et lumi\xE8re", emplacement: "energie", champion: "surcharge" },
  { nom: "Cristal de Prom\xE9th\xE9e", emplacement: "energie", champion: "surcharge" },
  { nom: "T\xE9lesto", emplacement: "energie", champion: "surcharge" },
  { nom: "Lance de Polaris", emplacement: "energie", champion: "bloqueur" },
  { nom: "Goule trinitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Diviseur d'ondes", emplacement: "energie", champion: "surcharge" },
  { nom: "Seigneur des Loups", emplacement: "energie", champion: "implacable" },
  { nom: "Le Monarque", emplacement: "energie", champion: "surcharge" },
  { nom: "J\xF6tunn", emplacement: "energie", champion: "implacable" },
  { nom: "Tarrabah", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment d'\xC9riana", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divinit\xE9", emplacement: "energie", champion: "surcharge" },
  { nom: "Sym\xE9trie", emplacement: "energie", champion: "surcharge" },
  { nom: "Ruines du Diable", emplacement: "energie", champion: "implacable" },
  { nom: "Pochette d'allumettes de Tommy", emplacement: "energie", champion: "surcharge" },
  { nom: "Le Quatri\xE8me Cavalier", emplacement: "energie", champion: "implacable" },
  { nom: "Effigie d\xE9sastreuse", emplacement: "energie", champion: "implacable" },
  { nom: "Dualit\xE9", emplacement: "energie", champion: "implacable" },
  { nom: "Frappe nuageuse", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divination de Ticuu", emplacement: "energie", champion: "implacable" },
  { nom: "Ex\xE9g\xE8se du Vex", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impulsion Lorentz", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame de comp\xE9tition", emplacement: "energie", champion: "surcharge" },
  { nom: "Lame d'action", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame d'intention", emplacement: "energie", champion: "implacable" },
  { nom: "Messager mort", emplacement: "energie", champion: "implacable" },
  { nom: "Obligation collective", emplacement: "energie", champion: "bloqueur" },
  { nom: "Tombe d\xE9licate", emplacement: "energie", champion: "surcharge" },
  { nom: "L'Intrus", emplacement: "energie", champion: "bloqueur" },
  { nom: "La Manticore", emplacement: "energie", champion: "surcharge" },
  { nom: "Hi\xE9rarchie des besoins", emplacement: "energie", champion: "implacable" },
  { nom: "Vexcalibur", emplacement: "energie", champion: "surcharge" },
  { nom: "Dallage", emplacement: "energie", champion: "implacable" },
  { nom: "Centrifuse", emplacement: "energie", champion: "surcharge" },
  { nom: "Ex Diris", emplacement: "energie", champion: "implacable" },
  { nom: "Chorale solitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Lign\xE9e enterr\xE9e", emplacement: "energie", champion: "bloqueur" },
  { nom: "Mort rouge reform\xE9e", emplacement: "energie", champion: "implacable" },
  { nom: "Chasse \xE0 l'aff\xFBt", emplacement: "energie", champion: "bloqueur" },
  { nom: "Ergo Sum solaire", emplacement: "energie", champion: null },
  { nom: "Ergo Sum abyssale", emplacement: "energie", champion: null },
  { nom: "Ergo Sum cryo-\xE9lectrique", emplacement: "energie", champion: null },
  { nom: "Brise-glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Croc du Bourreau", emplacement: "energie", champion: "surcharge" },
  { nom: "Guide stellaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Troisi\xE8me it\xE9ration", emplacement: "energie", champion: "bloqueur" },
  { nom: "Pique du graviton", emplacement: "energie", champion: "surcharge" },
  { nom: "Hoirie", emplacement: "energie", champion: "implacable" },
  { nom: "Girouette", emplacement: "energie", champion: "bloqueur" },
  { nom: "Le Prospecteur", emplacement: "lourde", champion: "implacable" },
  { nom: "Bobine de Wardcliff", emplacement: "lourde", champion: "implacable" },
  { nom: "Canon tracteur", emplacement: "lourde", champion: "surcharge" },
  { nom: "L\xE9gende d'Acrius", emplacement: "lourde", champion: "surcharge" },
  { nom: "D.A.R.C.I.", emplacement: "lourde", champion: "surcharge" },
  { nom: "La Colonie", emplacement: "lourde", champion: "surcharge" },
  { nom: "Ligne d'univers z\xE9ro", emplacement: "lourde", champion: "implacable" },
  { nom: "Image de l'Esprit dormant", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Murmure du Ver", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Mille voix", emplacement: "lourde", champion: "implacable" },
  { nom: "Renard \xE0 deux queues", emplacement: "lourde", champion: "surcharge" },
  { nom: "Griffe noire", emplacement: "lourde", champion: "surcharge" },
  { nom: "Le Parjure", emplacement: "lourde", champion: "implacable" },
  { nom: "Maitre du tonnerre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Anarchie", emplacement: "lourde", champion: "surcharge" },
  { nom: "V\xE9rit\xE9", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du L\xE9viathan", emplacement: "lourde", champion: "implacable" },
  { nom: "X\xE9nophage", emplacement: "lourde", champion: "implacable" },
  { nom: "La Faucheuse", emplacement: "lourde", champion: "surcharge" },
  { nom: "H\xE9ritage \xE9vident", emplacement: "lourde", champion: "surcharge" },
  { nom: "Poigne du Salut", emplacement: "lourde", champion: "implacable" },
  { nom: "Regard du lendemain", emplacement: "lourde", champion: "implacable" },
  { nom: "Lamentation", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Gjallarhorn", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Parasite", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Grande ouverture", emplacement: "lourde", champion: "implacable" },
  { nom: "Cardiombre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Chaos d\xE9terministe", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Morsure hivernale", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du dragon", emplacement: "lourde", champion: "implacable" },
  { nom: "Microcosme", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Foreuse finale", emplacement: "lourde", champion: "implacable" },
  { nom: "Ovation tourbillonnante", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Aconit", emplacement: "lourde", champion: "implacable" },
  { nom: "Service de Luzaku", emplacement: "lourde", champion: "surcharge" },
  { nom: "Fafnir", emplacement: "lourde", champion: "implacable" }
];

// src/lib/manifest/antiChampionExotiques.ts
function normaliserNomArme(nom) {
  return nom.replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’'`´]/g, "'").replace(/[^a-z0-9'+.]+/g, " ").trim();
}
var ELEMENTS_VARIANTES = ["cryo electrique", "electrique", "solaire", "abyssale", "abyssal", "stase", "cryo", "vide", "arc", "filaments"];
function construireTable() {
  const table = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) table.set(normaliserNomArme(e.nom), e.champion);
  const variantes = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) {
    const nom = normaliserNomArme(e.nom);
    const suffixe = ELEMENTS_VARIANTES.find((el) => nom.endsWith(" " + el));
    if (!suffixe) continue;
    const base = nom.slice(0, nom.length - suffixe.length - 1).trim();
    if (base) variantes.set(base, [...variantes.get(base) ?? [], e.champion]);
  }
  for (const [base, valeurs] of variantes) {
    if (valeurs.length >= 2 && valeurs.every((v) => v === valeurs[0]) && !table.has(base)) table.set(base, valeurs[0]);
  }
  return table;
}
var TABLE = construireTable();

// src/lib/manifest/doctrine.ts
var MOTS_CONDITION_DEBLOCAGE = [
  "debloquer cette amelioration",
  "unlock this upgrade",
  // FR : ⚠️ AJOUT (04/08/2026) - texte GÉNÉRIQUE de la Pièce maîtresse
  // ("Améliore cette arme en Pièce maîtresse..."), commun à toutes les
  // armes, confirmé par capture d'écran (souligné en bleu par
  // l'utilisateur sur "Le Chardon").
  // EN: ⚠️ ADDED (2026-08-04) - GENERIC masterwork text ("Upgrades this
  // weapon into a Masterwork..."), common to all weapons, confirmed by
  // screenshot (underlined in blue by the user on "The Thorn").
  "ameliore cette arme en piece maitresse",
  "upgrades this weapon into a masterwork",
  "beneficiera alors de capacites ameliorees",
  "will benefit from enhanced capabilities"
];
function retirerConditionsDeblocage(texte) {
  if (!texte) return texte;
  return texte.split(/(?<=[.!?])\s+/).filter((phrase) => !MOTS_CONDITION_DEBLOCAGE.some((m) => normaliser(phrase).includes(m))).join(" ").trim();
}
function obtenirDescriptionComplete(db2, hash) {
  const defOption = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
  if (!defOption?.displayProperties) return { description: "", estOrnement: false };
  const morceaux = [];
  if (defOption.displayProperties.description) morceaux.push(defOption.displayProperties.description);
  if (defOption.perks) {
    for (const perk of defOption.perks) {
      const defPerk = obtenirDefinition(db2, "DestinySandboxPerkDefinition", perk.perkHash);
      const texte = defPerk?.displayProperties?.description;
      if (texte && !morceaux.includes(texte)) morceaux.push(texte);
    }
  }
  const texteBrut = morceaux.join(" ");
  const nomNormalise = normaliser(defOption.displayProperties.name ?? "");
  const estOrnement = normaliser(texteBrut).includes("ornement d'arme") || normaliser(texteBrut).includes("weapon ornament") || nomNormalise.includes("ornement d'origine") || nomNormalise.includes("origin ornament");
  const description = retirerConditionsDeblocage(texteBrut);
  return { description, estOrnement };
}
var INDEX_SETS = /* @__PURE__ */ new WeakMap();
function construireIndexSets(db2) {
  const index = /* @__PURE__ */ new Map();
  try {
    const stmt = db2.prepare("SELECT json FROM DestinyEquipableItemSetDefinition");
    while (stmt.step()) {
      const set = JSON.parse(String(stmt.getAsObject().json));
      if (!set.setItems?.length) continue;
      const perks = (set.setPerks ?? []).map((p) => {
        const defPerk = obtenirDefinition(
          db2,
          "DestinySandboxPerkDefinition",
          p.sandboxPerkHash
        );
        return {
          requiredSetCount: p.requiredSetCount,
          nom: defPerk?.displayProperties?.name ?? "?",
          description: defPerk?.displayProperties?.description ?? "",
          icone: urlIcone(defPerk?.displayProperties?.icon)
        };
      }).sort((a, b) => a.requiredSetCount - b.requiredSetCount);
      const bonus = { nomSet: set.displayProperties?.name ?? "?", perks };
      for (const hash of set.setItems) index.set(hash, bonus);
    }
    stmt.free();
  } catch {
  }
  return index;
}
function obtenirBonusSet(db2, itemHash) {
  let index = INDEX_SETS.get(db2);
  if (!index) {
    index = construireIndexSets(db2);
    INDEX_SETS.set(db2, index);
  }
  return index.get(itemHash);
}

// src/lib/manifest/catalogueArmures.ts
var TABLE_OBJETS = "DestinyInventoryItemDefinition";
var CATEGORIE_FACTICE = 3109687656;
var SLOTS_ARMURE = ["casque", "gants", "torse", "jambes", "marque"];
var CACHE = /* @__PURE__ */ new WeakMap();
function* lignesArmures(db2) {
  for (const ciblee of [true, false]) {
    const stmt = db2.prepare(`SELECT id, json FROM ${TABLE_OBJETS}${ciblee ? ` WHERE json LIKE '%"itemType":2%'` : ""}`);
    let trouve = false;
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const json = String(row.json);
        if (!ciblee && !/"itemType"\s*:\s*2\b/.test(json)) continue;
        trouve = true;
        yield { id: Number(row.id), json };
      }
    } finally {
      stmt.free();
    }
    if (trouve) return;
  }
}
function lireArmure(db2, ligne, raretes) {
  let def;
  try {
    def = JSON.parse(ligne.json);
  } catch {
    return null;
  }
  const nom = def.displayProperties?.name?.trim();
  if (def.itemType !== 2 || !nom || def.redacted) return null;
  if (def.itemCategoryHashes?.includes(CATEGORIE_FACTICE)) return null;
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  if (!slot || !SLOTS_ARMURE.includes(slot)) return null;
  const hash = idSqliteVersHash(ligne.id);
  const tier = def.inventory?.tierTypeHash;
  if (tier !== void 0 && !raretes.has(tier)) raretes.set(tier, obtenirDefinition(db2, "DestinyItemTierTypeDefinition", tier)?.displayProperties?.name);
  let ensemble;
  try {
    ensemble = obtenirBonusSet(db2, hash)?.nomSet;
  } catch {
  }
  return {
    hash,
    nom,
    nomNormalise: normaliser(nom),
    icone: urlIcone(def.displayProperties?.icon),
    slot,
    classe: def.classType !== void 0 ? CLASS_TYPE_VERS_CLASSE[def.classType] : void 0,
    rarete: tier !== void 0 ? raretes.get(tier) : void 0,
    estExotique: tier === TIER_TYPE_HASH_EXOTIQUE,
    ensemble,
    collectibleHash: def.collectibleHash || void 0
  };
}
function construireCatalogueArmures(db2, options = {}) {
  const existant = CACHE.get(db2);
  if (existant) return existant;
  const { onProgression, tailleLot = 250, pause = () => new Promise((r) => setTimeout(r, 0)) } = options;
  const promesse = (async () => {
    const armures = [];
    const raretes = /* @__PURE__ */ new Map();
    let lues = 0;
    for (const ligne of lignesArmures(db2)) {
      const armure = lireArmure(db2, ligne, raretes);
      if (armure) armures.push(armure);
      if (++lues % tailleLot === 0) {
        onProgression?.(armures.length);
        await pause();
      }
    }
    onProgression?.(armures.length);
    return armures.sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.hash - b.hash);
  })();
  CACHE.set(db2, promesse);
  promesse.catch(() => CACHE.delete(db2));
  return promesse;
}
var FILTRES_ARMURES_PAR_DEFAUT = { texte: "", classe: "toutes", slot: "tous", rarete: "toutes", ensemble: "tous", source: "collections", obtention: "toutes" };
function valeursDistinctesArmures(armures, champ) {
  return [...new Set(armures.map((a) => a[champ]).filter((v) => !!v))].sort((a, b) => a.localeCompare(b, "fr"));
}
function filtrerArmures(armures, f, obtentionDe) {
  const mots = normaliser(f.texte).split(/\s+/).filter(Boolean);
  return armures.filter((a) => {
    if (f.source === "collections" && !a.collectibleHash) return false;
    if (f.source === "hors" && a.collectibleHash) return false;
    if (f.classe !== "toutes" && a.classe !== f.classe) return false;
    if (f.slot !== "tous" && a.slot !== f.slot) return false;
    if (f.rarete !== "toutes" && a.rarete !== f.rarete) return false;
    if (f.ensemble !== "tous" && a.ensemble !== f.ensemble) return false;
    if (f.obtention !== "toutes") {
      const e = obtentionDe(a);
      if (e !== (f.obtention === "obtenues" ? "obtenu" : "jamais")) return false;
    }
    if (mots.length) {
      const texte = `${a.nomNormalise} ${normaliser(a.ensemble ?? "")}`;
      if (!mots.every((m) => texte.includes(m))) return false;
    }
    return true;
  });
}

// src/lib/manifest/statsArmure.ts
var LIBELLES_STAT = {
  sante: ["sante", "health"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  super: ["super"],
  classe: ["classe", "class", "competence de classe", "class ability"],
  arme: ["arme", "armes", "weapon", "weapons"]
};
function resoudreStatKey(nomStat) {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT)) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return void 0;
}

// src/lib/manifest/saison.ts
var indexes = /* @__PURE__ */ new WeakMap();
function obtenirIndex(db2) {
  let idx = indexes.get(db2);
  if (!idx) {
    idx = { etat: "attente", carte: /* @__PURE__ */ new Map(), objetsAvecSaison: 0, version: 0, ecouteurs: /* @__PURE__ */ new Set(), fin: Promise.resolve() };
    indexes.set(db2, idx);
  }
  return idx;
}
var compter = (carte, filigrane, saison) => {
  let m = carte.get(filigrane);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    carte.set(filigrane, m);
  }
  m.set(saison, (m.get(saison) ?? 0) + 1);
};
function saisonDuFiligrane(idx, filigranes) {
  for (const f of filigranes) {
    const m = f ? idx.carte.get(f) : void 0;
    if (!m) continue;
    let meilleure, max = 0;
    for (const [saison, n] of m) if (n > max) {
      max = n;
      meilleure = saison;
    }
    if (meilleure !== void 0) return meilleure;
  }
  return void 0;
}
function demarrerIndexSaisons(db2) {
  const idx = obtenirIndex(db2);
  if (idx.etat !== "attente") return idx;
  idx.etat = "encours";
  idx.fin = new Promise((resolve) => {
    let stmt = null;
    const terminer = () => {
      try {
        stmt?.free();
      } catch {
      }
      idx.etat = "fini";
      idx.version++;
      idx.ecouteurs.forEach((cb) => {
        try {
          cb();
        } catch {
        }
      });
      resolve();
    };
    const pas = () => {
      try {
        if (!stmt) stmt = db2.prepare(`SELECT json FROM DestinyInventoryItemDefinition WHERE json LIKE '%"seasonHash":%'`);
        const debut = Date.now();
        while (Date.now() - debut < 12) {
          if (!stmt.step()) {
            terminer();
            return;
          }
          const json = String(stmt.getAsObject().json ?? "");
          const s = /"seasonHash":(\d+)/.exec(json);
          if (!s) continue;
          const saison = Number(s[1]);
          idx.objetsAvecSaison++;
          for (const motif of [/"iconWatermark":"([^"]+)"/, /"iconWatermarkShelved":"([^"]+)"/]) {
            const f = motif.exec(json);
            if (f) compter(idx.carte, f[1], saison);
          }
        }
        setTimeout(pas, 0);
      } catch {
        terminer();
      }
    };
    setTimeout(pas, 0);
  });
  return idx;
}
var etatIndexSaisons = (db2) => {
  const i = obtenirIndex(db2);
  return { etat: i.etat, objetsAvecSaison: i.objetsAvecSaison, filigranes: i.carte.size };
};
var memoire = /* @__PURE__ */ new WeakMap();
function obtenirSaisonObjet(db2, itemHash) {
  if (!db2 || !itemHash) return void 0;
  let m = memoire.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoire.set(db2, m);
  }
  const version = obtenirIndex(db2).version;
  const connu = m.get(itemHash);
  if (connu && connu.v === version) return connu.info ?? void 0;
  let info = null;
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
    const filigrane = urlIcone(def?.iconWatermark || def?.iconWatermarkShelved);
    if (filigrane) {
      info = { filigrane };
      let hashSaison = def?.seasonHash;
      if (!hashSaison) {
        const idx = obtenirIndex(db2);
        if (idx.etat === "attente") demarrerIndexSaisons(db2);
        else if (idx.etat === "fini") {
          hashSaison = saisonDuFiligrane(idx, [def?.iconWatermark, def?.iconWatermarkShelved]);
          if (hashSaison) info.nomDeduit = true;
        }
      }
      if (hashSaison) {
        info.hashSaison = hashSaison;
        try {
          const s = obtenirDefinition(db2, "DestinySeasonDefinition", hashSaison);
          if (s?.displayProperties?.name) info.nom = s.displayProperties.name;
          if (typeof s?.seasonNumber === "number") info.numero = s.seasonNumber;
        } catch {
        }
      }
    }
  } catch {
    info = null;
  }
  m.set(itemHash, { v: version, info });
  return info ?? void 0;
}
function diagnosticSaisonObjet(db2, itemHash) {
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
    let saison = "\u2014";
    if (def?.seasonHash) {
      try {
        const s = obtenirDefinition(db2, "DestinySeasonDefinition", def.seasonHash);
        saison = s ? `${s.displayProperties?.name ?? "(sans nom)"}, n\xB0 ${s.seasonNumber ?? "?"}` : "(introuvable dans la table des saisons)";
      } catch {
        saison = "(table des saisons illisible)";
      }
    }
    const idx = etatIndexSaisons(db2);
    const info = obtenirSaisonObjet(db2, itemHash);
    const deduit = def?.seasonHash ? "" : ` | d\xE9duite des autres objets de m\xEAme filigrane : ${info?.nomDeduit ? `${info.nom ?? "(saison sans nom)"}${info.numero ? `, n\xB0 ${info.numero}` : ""}` : idx.etat === "fini" ? "AUCUNE (aucun autre objet de ce filigrane n'a de seasonHash)" : "balayage " + (idx.etat === "encours" ? "en cours" : "pas encore lanc\xE9")}`;
    return `Saison : seasonHash = ${def?.seasonHash ?? "ABSENT"} \u2192 ${saison} | filigrane : ${def?.iconWatermark ?? "ABSENT"}${def?.iconWatermarkShelved ? ` | filigrane \xAB shelved \xBB : ${def.iconWatermarkShelved}` : ""}${deduit} | balayage des saisons : ${idx.etat}, ${idx.objetsAvecSaison} objet(s) du Manifest ont un seasonHash, ${idx.filigranes} filigrane(s) reli\xE9s \xE0 une saison`;
  } catch (e) {
    return `Saison : lecture impossible (${e.message})`;
  }
}

// src/lib/forge/armure.ts
var MOTS_COSMETIQUES = /shader|skin|ornament|ornement|cosmetic|cosmetique|transmat|emote|projection|memento|souvenir|tracker|apparence|teinture|spawn/;
var CATEGORIES_FIXES = /masterwork|armor_stats|intrinsic|exotic|set_perk|armor_tier|archetype/i;
var memoStats = /* @__PURE__ */ new WeakMap();
function cleStat(db2, statHash) {
  let m = memoStats.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoStats.set(db2, m);
  }
  if (!m.has(statHash)) {
    const nom = obtenirDefinition(db2, "DestinyStatDefinition", statHash)?.displayProperties?.name;
    m.set(statHash, nom ? resoudreStatKey(nom) : void 0);
  }
  return m.get(statHash);
}
var memoPlugs = /* @__PURE__ */ new WeakMap();
function lirePlugArmure(db2, hash) {
  let m = memoPlugs.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoPlugs.set(db2, m);
  }
  const connu = m.get(hash);
  if (connu !== void 0) return connu;
  let plug2 = null;
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
    const nom = def?.displayProperties?.name;
    if (nom) {
      const { description, estOrnement } = obtenirDescriptionComplete(db2, hash);
      const stats = {};
      for (const inv of def?.investmentStats ?? []) {
        const k = cleStat(db2, inv.statTypeHash);
        if (k) stats[k] = (stats[k] ?? 0) + inv.value;
      }
      plug2 = { hash, nom, description, icone: urlIcone(def?.displayProperties?.icon), categoriePlug: def?.plug?.plugCategoryIdentifier ?? "", ornement: estOrnement, stats };
    }
  } catch {
    plug2 = null;
  }
  m.set(hash, plug2);
  return plug2;
}
var estEmplacementMod = (categoriePlug, nomCategorie) => /^enhancements\./i.test(categoriePlug) || /\bmods?\b/.test(normaliser(nomCategorie));
function nomsCategoriesSocket(db2, def) {
  const noms = /* @__PURE__ */ new Map();
  for (const cat of def?.sockets?.socketCategories ?? []) {
    let nom = "";
    try {
      nom = obtenirDefinition(db2, "DestinySocketCategoryDefinition", cat.socketCategoryHash)?.displayProperties?.name ?? "";
    } catch {
    }
    for (const i of cat.socketIndexes) noms.set(i, nom);
  }
  return noms;
}
function hashesPossibles(db2, e) {
  const hashes2 = [];
  const ajouter = (hs) => {
    for (const h of hs) if (!hashes2.includes(h)) hashes2.push(h);
  };
  const pool = (hashJeu) => (obtenirDefinition(db2, "DestinyPlugSetDefinition", hashJeu)?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
  ajouter((e.reusablePlugItems ?? []).map((p) => p.plugItemHash));
  if (e.reusablePlugSetHash) ajouter(pool(e.reusablePlugSetHash));
  if (e.randomizedPlugSetHash) ajouter(pool(e.randomizedPlugSetHash));
  if (e.singleInitialItemHash) ajouter([e.singleInitialItemHash]);
  return hashes2;
}
function colonnesModeleArmure(db2, itemHash, options = {}) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const noms = nomsCategoriesSocket(db2, def);
  const colonnes = [];
  (def?.sockets?.socketEntries ?? []).forEach((entree, socketIndex) => {
    const hashes2 = hashesPossibles(db2, entree);
    const categorie = noms.get(socketIndex) ?? "";
    const premier = hashes2.map((h) => lirePlugArmure(db2, h)).find((p) => !!p && !p.ornement);
    if (!premier) return;
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const mod = estEmplacementMod(premier.categoriePlug, categorie);
    if (cosmetique && !options.cosmetiques || mod && !options.mods) return;
    const lus = hashes2.map((h) => lirePlugArmure(db2, h)).filter((p) => !!p && !p.ornement);
    colonnes.push({ socketIndex, categorie, options: lus, cosmetique, mod, fixe: CATEGORIES_FIXES.test(premier.categoriePlug) });
  });
  return colonnes;
}
function diagnosticArmureManifest(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const lignes = [`Mod\xE8le d'armure : ${def?.displayProperties?.name ?? "?"} (hash ${itemHash})`, diagnosticSaisonObjet(db2, itemHash)];
  const noms = nomsCategoriesSocket(db2, def);
  const entrees = def?.sockets?.socketEntries ?? [];
  if (entrees.length === 0) lignes.push("aucune entr\xE9e de socket dans la d\xE9finition de cette armure");
  entrees.forEach((e, i) => {
    const hashes2 = hashesPossibles(db2, e);
    const premier = hashes2.map((h) => lirePlugArmure(db2, h)).find((p) => !!p && !p.ornement);
    const categorie = noms.get(i) ?? "";
    const brut = `plug initial ${e.singleInitialItemHash ?? "\u2014"} | liste directe ${(e.reusablePlugItems ?? []).length} | jeu partag\xE9 ${e.reusablePlugSetHash ?? "\u2014"} | jeu al\xE9atoire ${e.randomizedPlugSetHash ?? "\u2014"}`;
    if (!premier) {
      lignes.push(`prise ${i} | cat\xE9gorie \xAB ${categorie || "?"} \xBB | ${brut} | ${hashes2.length} plug(s) possible(s), AUCUN lisible dans le Manifest`);
      return;
    }
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const noms6 = hashes2.slice(0, 6).map((h) => lirePlugArmure(db2, h)?.nom ?? "?").join(" | ");
    lignes.push(`prise ${i} | cat\xE9gorie \xAB ${categorie || "?"} \xBB | ${brut} | ${hashes2.length} plug(s) possible(s) (premiers : ${noms6}${hashes2.length > 6 ? " \u2026" : ""}) | cat\xE9gorie de plug \xAB ${premier.categoriePlug || "?"} \xBB | cosm\xE9tique : ${cosmetique ? "oui" : "non"} | mods : ${estEmplacementMod(premier.categoriePlug, categorie) ? "oui" : "non"} | fixe : ${CATEGORIES_FIXES.test(premier.categoriePlug) ? "oui" : "non"}`);
  });
  return lignes.join("\n");
}

// src/lib/bungie/collections.ts
function classerObtention(collectibleHash, obtenus2) {
  if (!collectibleHash || !obtenus2 || !obtenus2.has(collectibleHash)) return "inconnu";
  return obtenus2.get(collectibleHash) ? "obtenu" : "jamais";
}

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
var T_PLUGSET = "DestinyPlugSetDefinition";
var T_CATEGORIE = "DestinySocketCategoryDefinition";
var T_RARETE = "DestinyItemTierTypeDefinition";
var HASH_EXOTIQUE = 2759499571;
var HASH_LEGENDAIRE = 4008398120;
var BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
function creerFausseDb(defs2, options = {}) {
  const requetes2 = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes2.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
      const lignes = Object.entries(defs2[table] ?? {}).map(([h, d]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d) }));
      let choisies = lignes, courant = -1;
      return {
        bind: (a) => {
          if (/id\s*=\s*\?/.test(where)) choisies = lignes.filter((l) => l.id === a[0]);
        },
        step: () => {
          if (courant === -1) {
            const like = /LIKE\s+'(.*)'/.exec(where);
            if (like) {
              const coeur = like[1].replace(/^%|%$/g, "");
              choisies = lignes.filter((l) => l.json.includes(coeur));
            }
          }
          if (options.ralentirBalayage && /LIKE/.test(where)) {
            const t = Date.now();
            while (Date.now() - t < options.ralentirBalayage) {
            }
          }
          courant++;
          return courant < choisies.length;
        },
        getAsObject: () => ({ id: choisies[courant].id, json: choisies[courant].json }),
        free: () => {
        }
      };
    }
  };
  return { db: db2, requetes: requetes2 };
}
var plug = (nom, description = "", extra = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, ...extra });
var arme = (nom, o) => ({
  displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description: "" },
  itemType: 3,
  itemTypeDisplayName: o.type,
  defaultDamageType: o.degats,
  inventory: { bucketTypeHash: o.bucket, tierTypeHash: o.tier },
  equippingBlock: { ammoType: o.bucket === BUCKET.lourde ? 3 : 1 },
  ...o.collectible ? { collectibleHash: o.collectible } : {},
  sockets: { socketEntries: o.sockets, socketCategories: o.categories ?? [] },
  ...o.extra ?? {}
});
function ajouterArmureForge(defs2) {
  const objets = defs2[T_OBJET];
  defs2["DestinyStatDefinition"] = { 8801: { displayProperties: { name: "Sant\xE9" } }, 8802: { displayProperties: { name: "Corps \xE0 corps" } }, 8803: { displayProperties: { name: "Grenade" } }, 8804: { displayProperties: { name: "Super" } }, 8805: { displayProperties: { name: "Classe" } }, 8806: { displayProperties: { name: "Armes" } } };
  const cat = defs2[T_CATEGORIE] ?? (defs2[T_CATEGORIE] = {});
  cat[7601] = { displayProperties: { name: "Arch\xE9type" } };
  cat[7602] = { displayProperties: { name: "Mods d'armure" } };
  cat[7603] = { displayProperties: { name: "Apparence" } };
  const pl = (nom, categorie, inv, description = "") => ({ ...plug(nom, description, { plug: { plugCategoryIdentifier: categorie } }), investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7401] = pl("Arch\xE9type Bastion", "armor_stats", [[8801, 17], [8805, 12]]);
  objets[7402] = pl("Am\xE9lioration d'armure", "armor.masterworks.v2", [[8801, 5], [8802, 5], [8803, 5]]);
  objets[7411] = pl("Mod de sant\xE9", "enhancements.v2_general", [[8801, 10]], "Augmente la sant\xE9.");
  objets[7412] = pl("Mod de classe", "enhancements.v2_general", [[8805, 10]], "Augmente la classe.");
  objets[7413] = pl("Mod d'armes", "enhancements.v2_general", [[8806, 10]], "Augmente les armes.");
  objets[7421] = pl("Ajustement : m\xEAl\xE9e vers grenade", "enhancements.v2_tuning", [[8802, 5], [8803, -5]]);
  objets[7422] = pl("Ajustement : super vers classe", "enhancements.v2_tuning", [[8804, 5], [8805, -5]]);
  objets[7431] = pl("Teinture rouge", "shader", []);
  objets[7432] = pl("Teinture bleue", "shader", []);
  objets[7433] = pl("Teinture verte", "shader", []);
  objets[7441] = pl("Perk exotique d'essai", "intrinsics", [], "Un effet exotique narratif.");
  objets[198e3] = pl("Emplacement de mod vide", "enhancements.v2_general", [], "Un emplacement vide.");
  const entrees = (...hashes2) => hashes2.map((h) => ({ singleInitialItemHash: h }));
  defs2[T_PLUGSET][8301] = { reusablePlugItems: [7411, 7412, 7413].map((h) => ({ plugItemHash: h })) };
  defs2[T_PLUGSET][8302] = { reusablePlugItems: [7421, 7422].map((h) => ({ plugItemHash: h })) };
  objets[5301] = { displayProperties: { name: "Casque de bastion d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 7402 }, { singleInitialItemHash: 7411, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 7421, reusablePlugSetHash: 8302 }, { singleInitialItemHash: 7431 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2, 3] }, { socketCategoryHash: 7603, socketIndexes: [4] }] } };
  objets[5302] = { displayProperties: { name: "Plastron exotique d'essai", icon: "/icons/plastron.png" }, sockets: { socketEntries: entrees(7401, 7441, 7412), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2] }] } };
  objets[5304] = { displayProperties: { name: "Casque \xE0 prises r\xE9p\xE9t\xE9es d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }, { socketCategoryHash: 7602, socketIndexes: [1, 2, 3] }] } };
  objets[5303] = { displayProperties: { name: "Marque de classe d'essai", icon: "/icons/marque.png" }, sockets: { socketEntries: entrees(7441), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] } };
  return defs2;
}
function ajouterCatalogueArmures(defs2) {
  ajouterArmureForge(defs2);
  const objets = defs2[T_OBJET], jeux = defs2[T_PLUGSET];
  const BUCKET_ARMURE = { casque: 3448274439, gants: 3551918588, torse: 14239492, jambes: 20886954, marque: 1585787867 };
  const pl = (nom, categorie, inv, description = "") => ({ ...plug(nom, description, { plug: { plugCategoryIdentifier: categorie } }), investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7403] = pl("Arch\xE9type \xC9claireur", "armor_stats", [[8804, 17], [8806, 12]]);
  jeux[8301] = { reusablePlugItems: [7411, 7412, 7413].map((h) => ({ plugItemHash: h })) };
  jeux[8302] = { reusablePlugItems: [7421, 7422].map((h) => ({ plugItemHash: h })) };
  jeux[8303] = { reusablePlugItems: [7401, 7403].map((h) => ({ plugItemHash: h })) };
  jeux[8304] = { reusablePlugItems: [7431, 7432, 7433].map((h) => ({ plugItemHash: h })) };
  const armure = (nom, o) => ({
    displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description: "" },
    itemType: 2,
    classType: o.classType,
    inventory: { bucketTypeHash: BUCKET_ARMURE[o.slot], tierTypeHash: o.tier },
    ...o.collectible ? { collectibleHash: o.collectible } : {},
    sockets: { socketEntries: o.sockets, socketCategories: o.categories }
  });
  objets[5301] = armure("Casque de bastion d'essai", { slot: "casque", classType: 0, tier: HASH_LEGENDAIRE, collectible: 9101, sockets: [{ singleInitialItemHash: 7401, randomizedPlugSetHash: 8303 }, { singleInitialItemHash: 7402 }, { singleInitialItemHash: 7411, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 7421, randomizedPlugSetHash: 8302 }, { singleInitialItemHash: 7431, reusablePlugSetHash: 8304 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2, 3] }, { socketCategoryHash: 7603, socketIndexes: [4] }] });
  objets[5302] = armure("Plastron exotique d'essai", { slot: "torse", classType: 2, tier: HASH_EXOTIQUE, collectible: 9102, sockets: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 7441 }, { singleInitialItemHash: 7412, reusablePlugSetHash: 8301 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2] }] });
  objets[5303] = armure("Marque de classe d'essai", { slot: "marque", classType: 1, tier: HASH_LEGENDAIRE, collectible: 9103, sockets: [{ singleInitialItemHash: 7441 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] });
  objets[5311] = armure("Gants de bastion d'essai", { slot: "gants", classType: 0, tier: HASH_LEGENDAIRE, collectible: 9104, sockets: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 7402 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }] });
  objets[5312] = armure("Jambi\xE8res exotiques d'essai", { slot: "jambes", classType: 1, tier: HASH_EXOTIQUE, sockets: [{ singleInitialItemHash: 7441 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] });
  objets[5313] = armure("Casque d'essai ancien", { slot: "casque", classType: 2, tier: HASH_LEGENDAIRE, sockets: [{ singleInitialItemHash: 7401 }], categories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] });
  const base = (nom) => ({ displayProperties: { name: nom, icon: "/icons/x.png", description: "" }, itemType: 2, classType: 0, inventory: { bucketTypeHash: BUCKET_ARMURE.casque, tierTypeHash: HASH_LEGENDAIRE } });
  objets[5320] = base("");
  objets[5321] = { ...base("Armure masqu\xE9e d'essai"), redacted: true };
  objets[5322] = { ...base("Armure au seau inconnu"), inventory: { bucketTypeHash: 123, tierTypeHash: HASH_LEGENDAIRE } };
  objets[5323] = { ...base("Armure factice d'essai"), itemCategoryHashes: [3109687656] };
  objets[5325] = { ...base("Armure au seau d'arme"), inventory: { bucketTypeHash: 1498876634, tierTypeHash: HASH_LEGENDAIRE } };
  objets[5324] = { displayProperties: { name: "Faux objet de type 20", icon: "/icons/x.png", description: "" }, itemType: 20, inventory: { bucketTypeHash: BUCKET_ARMURE.casque, tierTypeHash: HASH_LEGENDAIRE } };
  defs2["DestinyEquipableItemSetDefinition"] = { 9701: { displayProperties: { name: "Ensemble de bastion d'essai" }, setItems: [5301, 5311], setPerks: [{ requiredSetCount: 4, sandboxPerkHash: 9712 }, { requiredSetCount: 2, sandboxPerkHash: 9711 }] } };
  defs2["DestinySandboxPerkDefinition"] = { 9711: { displayProperties: { name: "Bonus \xE0 deux pi\xE8ces", description: "Effet \xE0 deux pi\xE8ces.", icon: "/icons/bonus2.png" } }, 9712: { displayProperties: { name: "Bonus \xE0 quatre pi\xE8ces", description: "Effet \xE0 quatre pi\xE8ces.", icon: "/icons/bonus4.png" } } };
  return defs2;
}
var T_SAISON = "DestinySeasonDefinition";
function ajouterSaisons(defs2, hashes2, options = {}) {
  const objets = defs2[T_OBJET];
  for (const h of hashes2) if (objets[h]) objets[h] = { ...objets[h], iconWatermark: "/img/saison-sorciere.png", ...options.sansHash ? {} : { seasonHash: 9001 } };
  for (let i = 0; i < (options.remplissage ?? 0); i++) objets[999e4 + i] = { displayProperties: { name: `Remplissage ${i}` }, iconWatermark: `/img/remplissage-${i}.png`, seasonHash: 9001 };
  if (options.sansHash) objets[9999999] = { displayProperties: { name: "Objet de r\xE9f\xE9rence" }, iconWatermark: "/img/saison-sorciere.png", seasonHash: 9001 };
  defs2[T_SAISON] = { 9001: { displayProperties: { name: "Saison de la Sorci\xE8re" }, seasonNumber: 22 } };
  return defs2;
}
function manifestArmesDeTest() {
  return {
    [T_RARETE]: { [HASH_LEGENDAIRE]: { displayProperties: { name: "L\xE9gendaire" } }, [HASH_EXOTIQUE]: { displayProperties: { name: "Exotique" } } },
    [T_CATEGORIE]: { 7001: { displayProperties: { name: "Armature" } }, 7002: { displayProperties: { name: "Perks d'arme" } }, 7003: { displayProperties: { name: "Souvenir" } }, 7004: { displayProperties: { name: "Mods d'arme" } } },
    [T_PLUGSET]: {
      8001: { reusablePlugItems: [{ plugItemHash: 6201 }, { plugItemHash: 6202 }] },
      8002: { reusablePlugItems: [{ plugItemHash: 6301 }, { plugItemHash: 6302 }, { plugItemHash: 6303 }] }
    },
    [T_OBJET]: {
      5001: arme("Fusil d'essai", {
        type: "Fusil \xE0 impulsion",
        degats: 3,
        bucket: BUCKET.energie,
        tier: HASH_LEGENDAIRE,
        collectible: 9001,
        sockets: [
          { singleInitialItemHash: 6001 },
          { reusablePlugItems: [{ plugItemHash: 6101 }, { plugItemHash: 6102 }] },
          { randomizedPlugSetHash: 8001 },
          { randomizedPlugSetHash: 8002 },
          { reusablePlugItems: [{ plugItemHash: 6401 }] },
          { reusablePlugItems: [{ plugItemHash: 6601 }, { plugItemHash: 6602 }] },
          { reusablePlugItems: [{ plugItemHash: 6701 }] }
        ],
        categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3] }, { socketCategoryHash: 7003, socketIndexes: [4] }, { socketCategoryHash: 7004, socketIndexes: [5, 6] }]
      }),
      5002: arme("Lance-roquettes d'essai", { type: "Lance-roquettes", degats: 4, bucket: BUCKET.lourde, tier: HASH_EXOTIQUE, collectible: 9002, sockets: [{ singleInitialItemHash: 6003 }, { reusablePlugItems: [{ plugItemHash: 6801 }] }] }),
      5003: arme("Arc d'essai", { type: "Arc", degats: 1, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [{ singleInitialItemHash: 6001 }, { reusablePlugItems: [{ plugItemHash: 6101 }] }] }),
      5004: arme("Arme masqu\xE9e", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, collectible: 9004, sockets: [], extra: { redacted: true } }),
      5005: { displayProperties: { name: "Casque d'essai", icon: "/icons/casque.png" }, itemType: 2, itemTypeDisplayName: "Casque", inventory: { bucketTypeHash: 3448274439, tierTypeHash: HASH_LEGENDAIRE } },
      5006: arme("", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [] }),
      5007: arme("Arme factice", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [], extra: { itemCategoryHashes: [3109687656] } }),
      6001: plug("Armature adaptative"),
      6003: plug("\u0152il d'essai"),
      6101: plug("Canon A", "Un canon."),
      6102: plug("Canon B", "Un autre canon."),
      6201: plug("Chargeur A"),
      6202: plug("Chargeur B"),
      6301: plug("Trait 1a", "Effet A."),
      6302: plug("Trait 1b", "Effet B."),
      6303: plug("Trait 1c", "Effet C."),
      6401: plug("Souvenir: Test"),
      6601: plug("Crosse de contrepoids", "Mod de crosse."),
      6602: plug("Poign\xE9e de sprint", "Mod de poign\xE9e."),
      6701: plug("Compte-frags"),
      6801: plug("Perk exotique", "Effet exotique.")
    }
  };
}

// tests/logique/catalogue-armures.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 700));
};
var defs = ajouterSaisons(ajouterCatalogueArmures(manifestArmesDeTest()), [5301]);
defs[T_OBJET][5330] = { displayProperties: { name: "Armure \xE0 plug illisible" }, itemType: 2, sockets: { socketEntries: [{ singleInitialItemHash: 999001 }], socketCategories: [] } };
var { db, requetes } = creerFausseDb(defs);
var NOMS = ["Casque d'essai", "Casque d'essai ancien", "Casque de bastion d'essai", "Gants de bastion d'essai", "Jambi\xE8res exotiques d'essai", "Marque de classe d'essai", "Plastron exotique d'essai"];
var hashes = (l) => l.map((a) => a.hash).sort((x, y) => x - y);
var obtenus = /* @__PURE__ */ new Map([[9101, true], [9102, false], [9103, true], [9104, true]]);
var etat = (a) => classerObtention(a.collectibleHash, obtenus);
(async () => {
  const progres = [];
  const cat = await construireCatalogueArmures(db, { tailleLot: 2, pause: async () => {
  }, onProgression: (n) => progres.push(n) });
  const parNom = (n) => cat.find((a) => a.nom === n);
  ok("CATALOGUE : exactement les SEPT armures valides (les six du catalogue d'essai et le \xAB Casque d'essai \xBB d\xE9j\xE0 pr\xE9sent dans la base commune de test), rien d'autre (ni arme, ni objet sans nom, masqu\xE9, factice, au seau inconnu ou au seau d'ARME, de type 20 ou sans emplacement)", JSON.stringify(cat.map((a) => a.nom).sort()) === JSON.stringify([...NOMS].sort()), cat.map((a) => a.nom));
  ok("il est TRI\xC9 par nom (ordre fran\xE7ais), comme le catalogue des armes", JSON.stringify(cat.map((a) => a.nom)) === JSON.stringify([...cat.map((a) => a.nom)].sort((a, b) => a.localeCompare(b, "fr"))), cat.map((a) => a.nom));
  const c = parNom("Casque de bastion d'essai"), p = parNom("Plastron exotique d'essai"), m = parNom("Marque de classe d'essai");
  ok("CHAQUE ARMURE porte son emplacement, sa classe, sa raret\xE9, son ensemble et son lot de Collections : le casque (casque, Titan, L\xE9gendaire, \xAB Ensemble de bastion d'essai \xBB, 9101), le plastron (torse, Arcaniste, Exotique, sans ensemble, 9102), la marque (marque, Chasseur)", c.slot === "casque" && c.classe === "titan" && c.rarete === "L\xE9gendaire" && !c.estExotique && c.ensemble === "Ensemble de bastion d'essai" && c.collectibleHash === 9101 && p.slot === "torse" && p.classe === "arcaniste" && p.rarete === "Exotique" && p.estExotique && p.ensemble === void 0 && p.collectibleHash === 9102 && m.slot === "marque" && m.classe === "chasseur", [c, p, m]);
  ok("les gants du M\xCAME ensemble que le casque portent le m\xEAme nom d'ensemble ; les jambi\xE8res exotiques n'ont ni ensemble ni lot de Collections ; l'ic\xF4ne est une adresse Bungie compl\xE8te", parNom("Gants de bastion d'essai").ensemble === "Ensemble de bastion d'essai" && parNom("Jambi\xE8res exotiques d'essai").collectibleHash === void 0 && parNom("Jambi\xE8res exotiques d'essai").estExotique && /^https:\/\/www\.bungie\.net\/icons\//.test(c.icone ?? ""), [parNom("Jambi\xE8res exotiques d'essai"), c.icone]);
  ok("la PROGRESSION est annonc\xE9e par lots (ici tous les 2 objets lus) et finit sur le total (7 armures)", progres.length >= 2 && progres[progres.length - 1] === 7 && progres.every((n, i) => i === 0 || n >= progres[i - 1]), progres);
  const avant = requetes.filter((q) => /itemType/.test(q)).length;
  const p2 = construireCatalogueArmures(db);
  ok("M\xC9MOIRE : un second appel rend le M\xCAME r\xE9sultat sans relire le Manifest (une seule requ\xEAte cibl\xE9e sur les types d'objet en tout)", await p2 === cat && requetes.filter((q) => /itemType/.test(q)).length === avant && avant === 1, [avant, requetes.filter((q) => /itemType/.test(q)).length]);
  const { db: base } = creerFausseDb(defs);
  const vide = { bind: () => {
  }, step: () => false, getAsObject: () => ({}), free: () => {
  } };
  const dbRepli = { ...base, prepare: (sql) => /LIKE/.test(sql) ? vide : base.prepare(sql) };
  const catRepli = await construireCatalogueArmures(dbRepli);
  ok("REPLI : si la requ\xEAte cibl\xE9e ne trouve rien, le balayage grossier de la table retrouve les M\xCAMES sept armures (et ignore toujours le type 20)", JSON.stringify(catRepli.map((a) => a.nom)) === JSON.stringify(cat.map((a) => a.nom)), catRepli.map((a) => a.nom));
  const f = (o) => hashes(filtrerArmures(cat, { ...FILTRES_ARMURES_PAR_DEFAUT, ...o }, etat));
  ok("SOURCE : par d\xE9faut \xAB Collections du jeu \xBB (4 armures : celles qui ont un lot de Collections) ; \xAB Hors Collections \xBB : les 3 autres ; \xAB Tout \xBB : les 7", JSON.stringify(f({})) === JSON.stringify([5301, 5302, 5303, 5311]) && JSON.stringify(f({ source: "hors" })) === JSON.stringify([5005, 5312, 5313]) && f({ source: "tout" }).length === 7, [f({}), f({ source: "hors" })]);
  ok("RECHERCHE : \xAB bastion \xBB trouve le casque et les gants ; la recherche porte aussi sur le NOM DE L'ENSEMBLE (\xAB ensemble essai \xBB trouve les deux pi\xE8ces de l'ensemble, pas le plastron) ; un mot absent ne trouve rien ; plusieurs mots doivent tous \xEAtre pr\xE9sents", JSON.stringify(f({ texte: "bastion" })) === JSON.stringify([5301, 5311]) && JSON.stringify(f({ texte: "ensemble essai" })) === JSON.stringify([5301, 5311]) && f({ texte: "introuvable" }).length === 0 && JSON.stringify(f({ texte: "plastron exotique" })) === JSON.stringify([5302]), [f({ texte: "bastion" }), f({ texte: "ensemble essai" })]);
  ok("FILTRES par classe (Titan \u2192 casque et gants ; Chasseur \u2192 marque ; Arcaniste \u2192 plastron), par emplacement (torse \u2192 le plastron) et par raret\xE9 (Exotique, tout le jeu \u2192 plastron et jambi\xE8res)", JSON.stringify(f({ source: "tout", classe: "titan" })) === JSON.stringify([5301, 5311]) && JSON.stringify(f({ classe: "chasseur" })) === JSON.stringify([5303]) && JSON.stringify(f({ classe: "arcaniste" })) === JSON.stringify([5302]) && JSON.stringify(f({ slot: "torse" })) === JSON.stringify([5302]) && JSON.stringify(f({ source: "tout", rarete: "Exotique" })) === JSON.stringify([5302, 5312]), [f({ classe: "chasseur" }), f({ rarete: "Exotique", source: "tout" })]);
  ok("FILTRE par ensemble : \xAB Ensemble de bastion d'essai \xBB \u2192 casque et gants ; les menus proposent les raret\xE9s (Exotique, L\xE9gendaire) et l'ensemble, tri\xE9s", JSON.stringify(f({ ensemble: "Ensemble de bastion d'essai" })) === JSON.stringify([5301, 5311]) && JSON.stringify(valeursDistinctesArmures(cat, "rarete")) === JSON.stringify(["Exotique", "L\xE9gendaire"]) && JSON.stringify(valeursDistinctesArmures(cat, "ensemble")) === JSON.stringify(["Ensemble de bastion d'essai"]), [valeursDistinctesArmures(cat, "rarete"), valeursDistinctesArmures(cat, "ensemble")]);
  ok("OBTENTION (collections du compte lues) : \xAB jamais obtenues \xBB \u2192 le plastron exotique seul ; \xAB obtenues \xBB \u2192 les trois autres des Collections ; sans collections lues, tout est \xAB inconnu \xBB : \xAB jamais obtenues \xBB ne filtre RIEN de faux (aucune armure)", JSON.stringify(f({ obtention: "jamais" })) === JSON.stringify([5302]) && JSON.stringify(f({ obtention: "obtenues" })) === JSON.stringify([5301, 5303, 5311]) && hashes(filtrerArmures(cat, { ...FILTRES_ARMURES_PAR_DEFAUT, obtention: "jamais" }, (a) => classerObtention(a.collectibleHash, null))).length === 0, [f({ obtention: "jamais" }), f({ obtention: "obtenues" })]);
  const idx = (cs) => cs.map((x) => x.socketIndex);
  const h = (x) => x.options.map((o) => o.hash);
  const defaut = colonnesModeleArmure(db, 5301);
  ok("EMPLACEMENTS d'un mod\xE8le (casque de bastion), par d\xE9faut : seuls l'ARCH\xC9TYPE et l'AM\xC9LIORATION (fixes) sont montr\xE9s ; les mods (prises 2 et 3) et la teinture cosm\xE9tique (prise 4) sont REPLI\xC9S", JSON.stringify(idx(defaut)) === "[0,1]" && defaut.every((x) => x.fixe && !x.mod && !x.cosmetique) && defaut[0].categorie === "Arch\xE9type", defaut.map((x) => [x.socketIndex, x.fixe, x.mod]));
  ok("PLUGS POSSIBLES fusionn\xE9s sans doublon : l'arch\xE9type propose 7401 (plug initial) ET 7403 (jeu al\xE9atoire) ; l'am\xE9lioration, 7402 seul ; chaque plug porte ses bonus de statistiques (l'arch\xE9type \xC9claireur : super +17, armes +12)", JSON.stringify(h(defaut[0])) === "[7401,7403]" && JSON.stringify(h(defaut[1])) === "[7402]" && defaut[0].options[1].stats.super === 17 && defaut[0].options[1].stats.arme === 12, [defaut.map(h), defaut[0].options[1].stats]);
  const avecMods = colonnesModeleArmure(db, 5301, { mods: true });
  ok("\xAB Afficher aussi les emplacements de mods \xBB : les prises 2 (trois mods : jeu partag\xE9 puis plug initial, sans doublon) et 3 (deux ajustements : jeu al\xE9atoire) apparaissent, marqu\xE9es MODS ; la teinture reste repli\xE9e", JSON.stringify(idx(avecMods)) === "[0,1,2,3]" && JSON.stringify(h(avecMods[2])) === "[7411,7412,7413]" && JSON.stringify(h(avecMods[3])) === "[7421,7422]" && avecMods[2].mod && avecMods[3].mod && avecMods[2].categorie === "Mods d'armure", avecMods.map((x) => [x.socketIndex, h(x), x.mod]));
  const avecCosm = colonnesModeleArmure(db, 5301, { cosmetiques: true });
  ok("\xAB Afficher les emplacements cosm\xE9tiques \xBB : la teinture (prise 4, trois plugs) appara\xEEt, marqu\xE9e COSM\xC9TIQUE et non mods ; les mods restent repli\xE9s ; avec les deux cases, les cinq emplacements", JSON.stringify(idx(avecCosm)) === "[0,1,4]" && avecCosm[2].cosmetique && !avecCosm[2].mod && JSON.stringify(h(avecCosm[2])) === "[7431,7432,7433]" && JSON.stringify(idx(colonnesModeleArmure(db, 5301, { mods: true, cosmetiques: true }))) === "[0,1,2,3,4]", avecCosm.map((x) => [x.socketIndex, x.cosmetique]));
  const exo = colonnesModeleArmure(db, 5302);
  ok("ARMURE EXOTIQUE : par d\xE9faut l'arch\xE9type et le perk exotique (fixe) ; avec les mods, la prise 2 appara\xEEt avec ses trois mods", JSON.stringify(idx(exo)) === "[0,1]" && exo[1].fixe && exo[1].options[0].nom === "Perk exotique d'essai" && JSON.stringify(h(colonnesModeleArmure(db, 5302, { mods: true })[2])) === "[7411,7412,7413]", exo.map((x) => [x.socketIndex, x.fixe]));
  ok("MARQUE DE CLASSE : une seule colonne (le perk exotique, fixe) ; un objet sans emplacement connu, un objet inconnu et un emplacement dont AUCUN plug n'est lisible : aucune colonne, sans erreur", colonnesModeleArmure(db, 5303).length === 1 && colonnesModeleArmure(db, 5324).length === 0 && colonnesModeleArmure(db, 987654321).length === 0 && colonnesModeleArmure(db, 5330, { mods: true, cosmetiques: true }).length === 0);
  const d = diagnosticArmureManifest(db, 5301);
  ok("DIAGNOSTIC (npm run dev) : il d\xE9crit le mod\xE8le, sa saison, et PRISE PAR PRISE la cat\xE9gorie, les quatre champs d'o\xF9 viennent les plugs (plug initial, liste directe, jeu partag\xE9, jeu al\xE9atoire), le nombre de plugs possibles lus et le classement \xAB cosm\xE9tique / mods / fixe \xBB, y compris pour les emplacements repli\xE9s", /Modèle d'armure : Casque de bastion d'essai \(hash 5301\)/.test(d) && /Saison : seasonHash = 9001/.test(d) && /prise 0 \| catégorie « Archétype » \| plug initial 7401 \| liste directe 0 \| jeu partagé — \| jeu aléatoire 8303 \| 2 plug\(s\) possible\(s\)/.test(d) && /prise 2 \| catégorie « Mods d'armure » \| plug initial 7411 \| liste directe 0 \| jeu partagé 8301 \| jeu aléatoire — \| 3 plug\(s\).*cosmétique : non \| mods : oui \| fixe : non/.test(d) && /prise 4 .*cosmétique : oui \| mods : non/.test(d) && /prise 0 .*fixe : oui/.test(d), d);
  const dd = diagnosticArmureManifest(db, 5330);
  ok("le diagnostic signale un emplacement sans plug lisible (\xAB AUCUN lisible \xBB) et un objet sans emplacement (\xAB aucune entr\xE9e de socket \xBB)", /prise 0 .*1 plug\(s\) possible\(s\), AUCUN lisible dans le Manifest/.test(dd) && /aucune entrée de socket/.test(diagnosticArmureManifest(db, 5324)), [dd, diagnosticArmureManifest(db, 5324)]);
  console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();
