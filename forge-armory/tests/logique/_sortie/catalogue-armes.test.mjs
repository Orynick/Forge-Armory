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

// src/lib/bungie/oauth.ts
var STORAGE_KEY = "d2ba.bungie.tokens";
var refreshPromise = null;
var authGeneration = 0;
async function rafraichirTokens() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = rafraichirTokensInterne();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
async function rafraichirTokensInterne() {
  const generation = authGeneration;
  const actuels = lireTokens();
  if (!actuels) throw new Error("Aucun token \xE0 rafra\xEEchir, reconnexion n\xE9cessaire");
  if (!actuels.refresh_token) {
    signalerSessionExpiree();
    throw new SessionExpiree();
  }
  const reponse = await fetch(`${BUNGIE_ROOT}/Platform/App/OAuth/Token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-API-Key": bungieConfig.apiKey
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: actuels.refresh_token,
      client_id: bungieConfig.clientId
    })
  });
  if (!reponse.ok) throw new Error(`Rafra\xEEchissement du token \xE9chou\xE9 (${reponse.status})`);
  const data = await reponse.json();
  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? actuels.refresh_token,
    expires_at: Date.now() + data.expires_in * 1e3,
    membership_id: data.membership_id ?? actuels.membership_id
  };
  if (generation !== authGeneration) throw new Error("Session Bungie modifi\xE9e pendant le rafra\xEEchissement du token.");
  sauvegarderTokens(tokens);
  return tokens;
}
function lireTokens() {
  try {
    const brut = localStorage.getItem(STORAGE_KEY);
    if (!brut) return null;
    const tokens = JSON.parse(brut);
    if (typeof tokens.access_token !== "string" || // FR : ⚠️ RETIRÉ (07/09/2026) - `refresh_token` n'est PLUS exigé ici.
    // C'était la cause réelle de l'impossibilité de se connecter : sur un
    // client public, ce champ est absent, donc des jetons parfaitement
    // valides étaient jugés corrompus puis effacés juste après la
    // connexion réussie.
    // EN: ⚠️ REMOVED - `refresh_token` is NO LONGER required here; it is
    // absent on a public client, so valid tokens were wrongly wiped.
    typeof tokens.expires_at !== "number" || typeof tokens.membership_id !== "string") {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return tokens;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
function sauvegarderTokens(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}
var EVENEMENT_SESSION_EXPIREE = "d2:session-expiree";
function signalerSessionExpiree() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE));
}
var SessionExpiree = class extends Error {
  constructor() {
    super("Votre session Bungie a expir\xE9. Reconnectez-vous pour continuer.");
    this.name = "SessionExpiree";
  }
};
async function obtenirAccessTokenValide() {
  const tokens = lireTokens();
  if (!tokens) throw new Error("Non connect\xE9 \xE0 Bungie.net");
  if (tokens.expires_at - 6e4 > Date.now()) return tokens.access_token;
  const rafraichi = await rafraichirTokens();
  return rafraichi.access_token;
}

// src/lib/manifest/doctrine.ts
function obtenirNomArmature(db2, def) {
  const entrees = def.sockets?.socketEntries ?? [];
  if (entrees.length === 0) return void 0;
  const hash = entrees[0]?.singleInitialItemHash;
  if (!hash) return void 0;
  const defPlug = obtenirDefinition(
    db2,
    "DestinyInventoryItemDefinition",
    hash
  );
  return defPlug?.displayProperties?.name;
}
function obtenirArmatureArme(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const hash = def?.sockets?.socketEntries?.[0]?.singleInitialItemHash;
  const nom = def ? obtenirNomArmature(db2, def) : void 0;
  if (!hash || !nom) return void 0;
  const defPlug = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
  return { hash, nom, icone: urlIcone(defPlug?.displayProperties?.icon) };
}
var ENUM_VERS_ELEMENT = {
  2: "arc",
  3: "solaire",
  4: "abyssal",
  // 5: Raid - type de dégâts spécial, aucun des 6 éléments de doctrine, volontairement absent de cette table.
  6: "stase",
  7: "filobscur"
};
var CACHE_ELEMENT_ARME = /* @__PURE__ */ new WeakMap();
function obtenirElementArme(db2, itemHash) {
  let cache = CACHE_ELEMENT_ARME.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    CACHE_ELEMENT_ARME.set(db2, cache);
  }
  if (cache.has(itemHash)) return cache.get(itemHash) ?? null;
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const resultat = ENUM_VERS_ELEMENT[def?.defaultDamageType ?? 0] ?? null;
  cache.set(itemHash, resultat);
  return resultat;
}
function obtenirElementFiltre(db2, itemHash) {
  const element = obtenirElementArme(db2, itemHash);
  if (element && element !== "prismatique") return element;
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  return def?.itemType === 3 && def.defaultDamageType === 1 ? "cinetique" : null;
}

// src/lib/manifest/catalogueArmes.ts
var TABLE_OBJETS = "DestinyInventoryItemDefinition";
var CATEGORIE_FACTICE = 3109687656;
var SLOTS_ARME = ["cinetique", "energie", "lourde"];
var CACHE = /* @__PURE__ */ new WeakMap();
function* lignesArmes(db2) {
  for (const ciblee of [true, false]) {
    const stmt = db2.prepare(`SELECT id, json FROM ${TABLE_OBJETS}${ciblee ? ` WHERE json LIKE '%"itemType":3%'` : ""}`);
    let trouve = false;
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const json = String(row.json);
        if (!ciblee && !/"itemType"\s*:\s*3\b/.test(json)) continue;
        trouve = true;
        yield { id: Number(row.id), json };
      }
    } finally {
      stmt.free();
    }
    if (trouve) return;
  }
}
function lireArme(db2, ligne, raretes) {
  let def;
  try {
    def = JSON.parse(ligne.json);
  } catch {
    return null;
  }
  const nom = def.displayProperties?.name?.trim();
  if (def.itemType !== 3 || !nom || def.redacted) return null;
  if (def.itemCategoryHashes?.includes(CATEGORIE_FACTICE)) return null;
  const slot = BUCKET_HASH_VERS_SLOT[def.inventory?.bucketTypeHash ?? -1];
  if (!slot || !SLOTS_ARME.includes(slot)) return null;
  const hash = idSqliteVersHash(ligne.id);
  const tier = def.inventory?.tierTypeHash;
  if (tier !== void 0 && !raretes.has(tier)) raretes.set(tier, obtenirDefinition(db2, "DestinyItemTierTypeDefinition", tier)?.displayProperties?.name);
  let armature;
  try {
    armature = obtenirArmatureArme(db2, hash)?.nom;
  } catch {
  }
  return {
    hash,
    nom,
    nomNormalise: normaliser(nom),
    icone: urlIcone(def.displayProperties?.icon),
    type: def.itemTypeDisplayName || void 0,
    slot,
    rarete: tier !== void 0 ? raretes.get(tier) : void 0,
    estExotique: tier === TIER_TYPE_HASH_EXOTIQUE,
    element: obtenirElementFiltre(db2, hash),
    armature,
    collectibleHash: def.collectibleHash || void 0
  };
}
function construireCatalogueArmes(db2, options = {}) {
  const existant = CACHE.get(db2);
  if (existant) return existant;
  const { onProgression, tailleLot = 250, pause = () => new Promise((r) => setTimeout(r, 0)) } = options;
  const promesse = (async () => {
    const armes2 = [];
    const raretes = /* @__PURE__ */ new Map();
    let lues = 0;
    for (const ligne of lignesArmes(db2)) {
      const arme2 = lireArme(db2, ligne, raretes);
      if (arme2) armes2.push(arme2);
      if (++lues % tailleLot === 0) {
        onProgression?.(armes2.length);
        await pause();
      }
    }
    onProgression?.(armes2.length);
    return armes2.sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.hash - b.hash);
  })();
  CACHE.set(db2, promesse);
  promesse.catch(() => CACHE.delete(db2));
  return promesse;
}
var FILTRES_ARMES_PAR_DEFAUT = { texte: "", type: "tous", slot: "tous", rarete: "toutes", element: "tous", armature: "toutes", source: "collections", obtention: "toutes" };
function valeursDistinctes(armes2, champ) {
  return [...new Set(armes2.map((a) => a[champ]).filter((v) => !!v))].sort((a, b) => a.localeCompare(b, "fr"));
}
function filtrerArmes(armes2, f, obtentionDe) {
  const mots = normaliser(f.texte).split(/\s+/).filter(Boolean);
  return armes2.filter((a) => {
    if (f.source === "collections" && !a.collectibleHash) return false;
    if (f.source === "hors" && a.collectibleHash) return false;
    if (f.type !== "tous" && a.type !== f.type) return false;
    if (f.slot !== "tous" && a.slot !== f.slot) return false;
    if (f.rarete !== "toutes" && a.rarete !== f.rarete) return false;
    if (f.element !== "tous" && a.element !== f.element) return false;
    if (f.armature !== "toutes" && a.armature !== f.armature) return false;
    if (f.obtention !== "toutes") {
      const e = obtentionDe(a);
      if (e !== (f.obtention === "obtenues" ? "obtenu" : "jamais")) return false;
    }
    if (mots.length) {
      const texte = `${a.nomNormalise} ${normaliser(a.type ?? "")} ${normaliser(a.armature ?? "")}`;
      if (!mots.every((m2) => texte.includes(m2))) return false;
    }
    return true;
  });
}

// src/lib/bungie/collections.ts
var NON_OBTENU = 1;
function fusionnerCollections(reponse) {
  const profil = reponse?.profileCollectibles?.data?.collectibles;
  const persos = reponse?.characterCollectibles?.data;
  if (!profil && !persos) return null;
  const obtenus = /* @__PURE__ */ new Map();
  const ajouter = (c) => {
    for (const [hash, etat] of Object.entries(c ?? {})) {
      const obtenu = ((etat.state ?? NON_OBTENU) & NON_OBTENU) === 0;
      obtenus.set(Number(hash), (obtenus.get(Number(hash)) ?? false) || obtenu);
    }
  };
  ajouter(profil);
  for (const perso of Object.values(persos ?? {})) ajouter(perso.collectibles);
  return obtenus;
}
function classerObtention(collectibleHash, obtenus) {
  if (!collectibleHash || !obtenus || !obtenus.has(collectibleHash)) return "inconnu";
  return obtenus.get(collectibleHash) ? "obtenu" : "jamais";
}
async function lireCollections(membership2, dep2 = { jeton: obtenirAccessTokenValide, appeler: (u, i) => fetch(u, i) }) {
  let jeton;
  try {
    jeton = await dep2.jeton();
  } catch (e) {
    if (e instanceof SessionExpiree) throw e;
    return { ok: false, raison: `jeton Bungie indisponible (${e.message})` };
  }
  let corps;
  try {
    const reponse = await dep2.appeler(`${BUNGIE_API_ROOT}/Destiny2/${membership2.membershipType}/Profile/${membership2.membershipId}/?components=800`, { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${jeton}` } });
    corps = await reponse.json();
    if (corps?.ErrorCode !== 1) return { ok: false, raison: `lecture des collections refus\xE9e par Bungie (HTTP ${reponse.status}, ${corps?.ErrorStatus ?? "r\xE9ponse inattendue"})` };
  } catch (e) {
    return { ok: false, raison: `lecture des collections impossible (${e.message})` };
  }
  const obtenus = fusionnerCollections(corps.Response);
  return obtenus ? { ok: true, obtenus } : { ok: false, raison: "Bungie n'a renvoy\xE9 aucune collection (droits de lecture ou profil priv\xE9 ?)" };
}

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
var T_PLUGSET = "DestinyPlugSetDefinition";
var T_CATEGORIE = "DestinySocketCategoryDefinition";
var T_RARETE = "DestinyItemTierTypeDefinition";
var HASH_EXOTIQUE = 2759499571;
var HASH_LEGENDAIRE = 4008398120;
var BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
function creerFausseDb(defs, options = {}) {
  const requetes2 = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes2.push(sql);
      const m2 = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m2?.[1] ?? "", where = m2?.[2] ?? "";
      const lignes = Object.entries(defs[table] ?? {}).map(([h, d]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d) }));
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

// tests/logique/catalogue-armes.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var sansPause = async () => {
};
var { db, requetes } = creerFausseDb(manifestArmesDeTest());
var progression = [];
var armes = await construireCatalogueArmes(db, { tailleLot: 2, pause: sansPause, onProgression: (n) => progression.push(n) });
ok("le catalogue contient les 3 armes valides, TRI\xC9ES par nom : Arc d'essai, Fusil d'essai, Lance-roquettes d'essai", armes.map((a) => a.nom).join(" | ") === "Arc d'essai | Fusil d'essai | Lance-roquettes d'essai", armes.map((a) => a.nom));
ok("sont \xC9CART\xC9ES : l'arme masqu\xE9e (redacted), l'ARMURE, l'objet sans nom et l'objet de la cat\xE9gorie factice", !armes.some((a) => [5004, 5005, 5006, 5007].includes(a.hash)), armes.map((a) => a.hash));
var fusil = armes.find((a) => a.hash === 5001);
ok("libell\xE9s r\xE9solus comme dans l'inventaire : type \xAB Fusil \xE0 impulsion \xBB, emplacement \xE9nergie, raret\xE9 \xAB L\xE9gendaire \xBB, non exotique, armature \xAB Armature adaptative \xBB, \xE9l\xE9ment solaire, Collection 9001", fusil.type === "Fusil \xE0 impulsion" && fusil.slot === "energie" && fusil.rarete === "L\xE9gendaire" && !fusil.estExotique && fusil.armature === "Armature adaptative" && fusil.element === "solaire" && fusil.collectibleHash === 9001, fusil);
var lance = armes.find((a) => a.hash === 5002);
ok("l'exotique est reconnu (raret\xE9 \xAB Exotique \xBB, estExotique), emplacement lourde, armature d'un exotique lue en prise 0, \xE9l\xE9ment abyssal", lance.estExotique && lance.rarete === "Exotique" && lance.slot === "lourde" && lance.armature === "\u0152il d'essai" && lance.element === "abyssal", lance);
ok("une arme hors Collections n'a PAS de collectibleHash (\xE9tat d'obtention inconnaissable)", armes.find((a) => a.hash === 5003).collectibleHash === void 0);
ok("l'ic\xF4ne est une adresse compl\xE8te pr\xEAte \xE0 afficher et le nom normalis\xE9 sert \xE0 la recherche (accents et majuscules ignor\xE9s)", fusil.icone?.startsWith("https://www.bungie.net/") && fusil.nomNormalise === "fusil d'essai", [fusil.icone, fusil.nomNormalise]);
ok("la construction est PAR MORCEAUX : la progression est annonc\xE9e en cours de route, et la derni\xE8re valeur est le nombre final d'armes", progression.length >= 2 && progression[progression.length - 1] === 3, progression);
var avantRequetes = requetes.length;
var encore = await construireCatalogueArmes(db, { pause: sansPause });
ok("MIS EN CACHE : un second appel rend le M\xCAME catalogue sans relire le Manifest", encore === armes && requetes.length === avantRequetes, [encore === armes, requetes.length - avantRequetes]);
ok("la lecture est CIBL\xC9E (clause WHERE sur `itemType`) : le Manifest n'est pas relu en entier", requetes.some((r) => /FROM DestinyInventoryItemDefinition WHERE json LIKE/.test(r)));
var defsEspaces = manifestArmesDeTest();
for (const h of Object.keys(defsEspaces[T_OBJET])) defsEspaces[T_OBJET][h] = JSON.parse(JSON.stringify(defsEspaces[T_OBJET][h]));
var fauxEspaces = creerFausseDb(defsEspaces);
var stmtOriginal = fauxEspaces.db.prepare;
fauxEspaces.db.prepare = (sql) => stmtOriginal.call(fauxEspaces.db, sql.replace(/ WHERE json LIKE '.*'/, " WHERE json LIKE '%motif-introuvable%'"));
var armesRepli = await construireCatalogueArmes(fauxEspaces.db, { pause: sansPause });
ok("REPLI : si la requ\xEAte cibl\xE9e ne renvoie rien (format de JSON inattendu), toute la table est lue et filtr\xE9e : m\xEAmes 3 armes", armesRepli.length === 3, armesRepli.map((a) => a.nom));
ok("un Manifest sans aucune arme donne un catalogue vide, sans erreur", (await construireCatalogueArmes(creerFausseDb({ [T_OBJET]: {} }).db, { pause: sansPause })).length === 0);
var obt = (m2) => (a) => m2[a.hash] ?? "inconnu";
var etats = obt({ 5001: "obtenu", 5002: "jamais" });
var F = (o) => filtrerArmes(armes, { ...FILTRES_ARMES_PAR_DEFAUT, ...o }, etats).map((a) => a.hash).join();
ok("par d\xE9faut, SEULES les armes des Collections du jeu sont list\xE9es (5001 et 5002) : l'arme sans collection est mise de c\xF4t\xE9", F({}) === "5001,5002", F({}));
ok("source \xAB hors Collections \xBB : seulement l'arme sans collection ; \xAB tout \xBB : les trois", F({ source: "hors" }) === "5003" && F({ source: "tout" }).split(",").length === 3);
ok("recherche par nom, SANS accents ni majuscules ni ordre des mots : \xAB ESSAI fusil \xBB trouve le Fusil d'essai ; \xAB impulsion \xBB le trouve par son type ; \xAB adaptative \xBB par son armature", F({ texte: "ESSAI fusil", source: "tout" }) === "5001" && F({ texte: "impulsion", source: "tout" }) === "5001" && F({ texte: "adaptative", source: "tout" }) === "5003,5001", F({ texte: "adaptative", source: "tout" }));
ok("filtres par type, emplacement, raret\xE9, \xE9l\xE9ment et armature (combinables)", F({ type: "Lance-roquettes" }) === "5002" && F({ slot: "energie" }) === "5001" && F({ rarete: "Exotique" }) === "5002" && F({ element: "abyssal" }) === "5002" && F({ armature: "Armature adaptative", source: "tout" }) === "5003,5001" && F({ slot: "lourde", rarete: "L\xE9gendaire" }) === "", F({ armature: "Armature adaptative", source: "tout" }));
ok("filtre d'obtention : \xAB obtenues \xBB = 5001, \xAB jamais obtenues \xBB = 5002 ; l'arme \xE0 \xE9tat inconnu n'est dans aucun des deux", F({ obtention: "obtenues", source: "tout" }) === "5001" && F({ obtention: "jamais", source: "tout" }) === "5002");
ok("valeurs des menus : types, raret\xE9s et armatures distincts et tri\xE9s", valeursDistinctes(armes, "type").join() === "Arc,Fusil \xE0 impulsion,Lance-roquettes" && valeursDistinctes(armes, "rarete").join() === "Exotique,L\xE9gendaire" && valeursDistinctes(armes, "armature").join() === "Armature adaptative,\u0152il d'essai", [valeursDistinctes(armes, "type"), valeursDistinctes(armes, "armature")]);
var rep = { profileCollectibles: { data: { collectibles: { "9001": { state: 0 }, "9002": { state: 1 }, "9003": { state: 64 }, "9005": { state: 0 } } } }, characterCollectibles: { data: { "id-a": { collectibles: { "9002": { state: 0 }, "9004": { state: 1 }, "9005": { state: 1 } } }, "id-b": { collectibles: { "9004": { state: 1 }, "9005": { state: 1 } } } } } };
var m = fusionnerCollections(rep);
ok("fusion des collections : obtenue si l'\xE9tat n'a pas le drapeau \xAB non obtenu \xBB (\xE9tat 0 ou 64) ; jamais si le drapeau est lev\xE9 partout ; obtenue si UN personnage l'a alors que le compte non ; et reste OBTENUE (9005) si le compte l'a mais que des personnages la marquent non obtenue APR\xC8S : \xAB le dernier lu gagne \xBB serait faux", m.get(9001) === true && m.get(9003) === true && m.get(9002) === true && m.get(9004) === false && m.get(9005) === true, [...m]);
ok("\xE9tat d'obtention : obtenu / jamais / inconnu (sans collectibleHash, sans lecture, ou absente de toutes les collections)", classerObtention(9001, m) === "obtenu" && classerObtention(9004, m) === "jamais" && classerObtention(void 0, m) === "inconnu" && classerObtention(9001, null) === "inconnu" && classerObtention(1234, m) === "inconnu");
ok("une r\xE9ponse sans aucune collection (droits, profil priv\xE9) n'est PAS prise pour \xAB rien d'obtenu \xBB : fusion = null", fusionnerCollections({}) === null && fusionnerCollections(void 0) === null);
var membership = { membershipType: 3, membershipId: "42", displayName: "T" };
var urlAppelee = "";
var dep = (corps, jeton = async () => "jeton") => ({ jeton, appeler: async (u) => {
  urlAppelee = u;
  return { status: 200, json: async () => corps };
} });
var l1 = await lireCollections(membership, dep({ ErrorCode: 1, Response: rep }));
ok("lecture : appel en LECTURE SEULE du composant 800 sur le bon compte, r\xE9sultat fusionn\xE9", l1.ok && urlAppelee.includes("/Destiny2/3/Profile/42/?components=800") && l1.obtenus.get(9001) === true, urlAppelee);
var l2 = await lireCollections(membership, dep({ ErrorCode: 5, ErrorStatus: "SystemDisabled" }));
var l3 = await lireCollections(membership, dep({ ErrorCode: 1, Response: {} }));
var l4 = await lireCollections(membership, { jeton: async () => "j", appeler: async () => {
  throw new Error("r\xE9seau coup\xE9");
} });
ok("erreurs rendues AVEC leur raison, jamais aval\xE9es : refus de Bungie, aucune collection, r\xE9seau coup\xE9 (l'appelant n'affichera aucun gris\xE9)", !l2.ok && /SystemDisabled/.test(l2.raison) && !l3.ok && /aucune collection/.test(l3.raison) && !l4.ok && /réseau coupé/.test(l4.raison), [l2, l3, l4]);
var remonte = false;
try {
  await lireCollections(membership, dep({}, async () => {
    throw new SessionExpiree();
  }));
} catch (e) {
  remonte = e instanceof SessionExpiree;
}
ok("une SESSION EXPIR\xC9E remonte \xE0 l'appelant au lieu d'\xEAtre confondue avec un \xE9chec banal", remonte);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
