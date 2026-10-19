import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

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
function championDeReference(nomArme) {
  if (!nomArme) return void 0;
  const v = TABLE.get(normaliserNomArme(nomArme));
  return v === void 0 ? void 0 : v;
}
function championSynergieMIDA(nomArme, nomArmature) {
  if (!nomArme || !nomArmature) return void 0;
  if (!normaliserNomArme(nomArmature).includes("synergie mida")) return void 0;
  const nom = normaliserNomArme(nomArme);
  if (/\bpolyvalent\b/.test(nom)) return "surcharge";
  if (/\bmacro\b/.test(nom)) return "implacable";
  return void 0;
}

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

// src/lib/manifest/search.ts
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// src/lib/manifest/doctrine.ts
var CACHE_ANTI_CHAMPION = /* @__PURE__ */ new WeakMap();
function obtenirAntiChampion(db2, itemHash) {
  let cacheBase = CACHE_ANTI_CHAMPION.get(db2);
  if (!cacheBase) {
    cacheBase = /* @__PURE__ */ new Map();
    CACHE_ANTI_CHAMPION.set(db2, cacheBase);
  }
  const enCache = cacheBase.get(itemHash);
  if (enCache !== void 0) return enCache ?? void 0;
  const resultat = calculerAntiChampion(db2, itemHash);
  cacheBase.set(itemHash, resultat ?? null);
  return resultat;
}
function calculerAntiChampion(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const estAncienneVersion = !!def?.itemCategoryHashes?.includes(3109687656);
  const emplacementArme = ["cinetique", "energie", "lourde"].includes(BUCKET_HASH_VERS_SLOT[def?.inventory?.bucketTypeHash ?? -1] ?? "");
  const copieFactice = estAncienneVersion && emplacementArme;
  if (def && (def.itemType === 3 && (def.inventory?.tierType === 6 || estAncienneVersion) || copieFactice)) {
    const reference = championDeReference(def.displayProperties?.name);
    if (reference !== void 0) return reference ?? void 0;
  }
  return deduireAntiChampion(db2, itemHash);
}
function deduireAntiChampion(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  if (!def) return void 0;
  const PAR_ENUM = {
    1: "bloqueur",
    // ShieldPiercing
    2: "surcharge",
    // Disruption
    3: "implacable"
    // Stagger
  };
  if (def.breakerType && PAR_ENUM[def.breakerType]) return PAR_ENUM[def.breakerType];
  const entrees = def.sockets?.socketEntries ?? [];
  const hashIntrinseque = entrees[0]?.singleInitialItemHash;
  if (hashIntrinseque) {
    const defIntrinseque = obtenirDefinition(
      db2,
      "DestinyInventoryItemDefinition",
      hashIntrinseque
    );
    const texte = normaliser(
      `${defIntrinseque?.displayProperties?.name ?? ""} ${defIntrinseque?.displayProperties?.description ?? ""}`
    );
    for (const { jeton, type } of JETONS_CHAMPION) {
      if (texte.includes(jeton)) return type;
    }
  }
  const nomArmature = obtenirNomArmature(db2, def);
  if (nomArmature) {
    const mida = championSynergieMIDA(def.displayProperties?.name, nomArmature);
    if (mida) return mida;
    const a = normaliser(nomArmature).replace(/['']/g, "");
    for (const { motCle, champion } of ARMATURE_VERS_CHAMPION) {
      if (a.includes(motCle)) return champion;
    }
  }
  return void 0;
}
var ARMATURE_VERS_CHAMPION = [
  // Cas particuliers documentés, à tester avant la règle générale.
  // FR : ⚠️ AJOUT (04/08/2026) - lot d'armatures relevées EN JEU par
  // l'utilisateur. Le Manifest ne portant pas cette information, chacune
  // vient d'une observation directe. Les mots-clés sont réduits à leur
  // partie distinctive (leçon "rayon"/"rayons" et "precis"/"precision") :
  // ils restent ainsi tolérants aux variantes de formulation Bungie.
  // EN: ⚠️ ADDED (2026-08-04) - batch of frames observed IN GAME by the
  // user. The Manifest doesn't carry this, so each comes from direct
  // observation. Keywords are reduced to their distinctive part so they
  // tolerate Bungie's wording variants.
  { motCle: "interruption", champion: "bloqueur" },
  // FR : ⚠️ AJOUT (24/08/2026) - confirmé par l'utilisateur en jeu.
  { motCle: "lanceur", champion: "bloqueur" },
  { motCle: "impact eleve", champion: "implacable" },
  // FR : ⚠️ CORRIGÉ (24/08/2026) - "ensemble" seul matchait AUSSI "Ensemble
  // à jamais" (Together Forever, Drang/Zenith), qui d'après les
  // observations de l'utilisateur ne donne JAMAIS Implacable (mais Bloqueur
  // ou Surchargé selon l'arme combinée - voir plus bas, cas volontairement
  // non codé). Toute arme utilisant Together Forever recevait donc une
  // réponse FAUSSE. Rétréci à "tir d'ensemble", qui ne matche plus que
  // Felwinter's Lie.
  // EN: ⚠️ FIXED - "ensemble" alone also matched "Together Forever"
  // (Drang/Zenith), which per the user's observations NEVER gives
  // Implacable. Any Together Forever weapon got a WRONG answer. Narrowed to
  // "tir d'ensemble", matching only Felwinter's Lie now.
  { motCle: "tir densemble", champion: "implacable" },
  { motCle: "pr-55", champion: "bloqueur" },
  // "Cadre Héritage PR-55" (Estoc de Redrix)
  { motCle: "attaque", champion: "implacable" },
  { motCle: "soutien", champion: "surcharge" },
  // FR : les deux variantes "calorifique" connues donnent Surchargé. Elles
  // sont listées séparément plutôt que via un "calorifique" générique :
  // si une 3e variante apparaît avec un autre champion, elle affichera le
  // repère "?" au lieu d'hériter silencieusement d'une valeur fausse.
  { motCle: "calorifique equilibree", champion: "surcharge" },
  { motCle: "calorifique dynamique", champion: "surcharge" },
  { motCle: "tir double", champion: "implacable" },
  { motCle: "rafale lourde", champion: "implacable" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Micro-missile", relevé en jeu par
  // l'utilisateur. Même situation que "Tir dispersé" : le Manifest ne
  // porte pas l'information, la correspondance vient d'une observation
  // directe. Placé AVANT la règle générale : le mot-clé est spécifique et
  // ne risque pas d'être capté par une entrée plus large.
  // EN: ⚠️ ADDED (2026-08-04) - "Micro-missile", observed in game by the
  // user. Same situation as "Tir dispersé": the Manifest doesn't carry
  // it, the mapping comes from direct observation.
  { motCle: "micro-missile", champion: "implacable" },
  { motCle: "deni de zone", champion: "surcharge" },
  // confirmé en jeu par l'utilisateur (04/08/2026)
  { motCle: "zone de deni", champion: "surcharge" },
  // Règle générale.
  { motCle: "agressive", champion: "implacable" },
  { motCle: "agressif", champion: "implacable" },
  { motCle: "fort impact", champion: "implacable" },
  { motCle: "haut impact", champion: "implacable" },
  // FR : ⚠️ CORRIGÉ (04/08/2026) - "precision" ratait "Cadre de munition
  // PRÉCIS" (Héritage) : le mot-clé était plus long que le texte réel.
  // "precis" couvre les deux formes, même leçon que "rayon"/"rayons".
  { motCle: "precis", champion: "bloqueur" },
  { motCle: "adaptative", champion: "bloqueur" },
  { motCle: "adaptatif", champion: "bloqueur" },
  { motCle: "legere", champion: "surcharge" },
  { motCle: "leger", champion: "surcharge" },
  { motCle: "tir rapide", champion: "surcharge" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Tir dispersé" (relevé sur Sarpédon-D,
  // un Revolver). Le Manifest ne portait RIEN pour cette arme
  // (breakerType = 0 partout, aucun perk porteur) : la correspondance
  // vient d'une observation directe en jeu par l'utilisateur, seule
  // source disponible. Placé près de "tir rapide" par parenté de
  // formulation, mais les deux mots-clés sont distincts (pas de
  // chevauchement possible).
  // EN: ⚠️ ADDED (2026-08-04) - "Tir dispersé" (Scatter Fire, observed on
  // Sarpedon-D, a Hand Cannon). The Manifest carried NOTHING for this
  // weapon (breakerType = 0 everywhere, no perk holding it): the mapping
  // comes from the user's direct in-game observation, the only available
  // source.
  { motCle: "tir disperse", champion: "surcharge" },
  // Épées (armatures spécifiques).
  { motCle: "projection", champion: "bloqueur" },
  { motCle: "vortex", champion: "surcharge" },
  { motCle: "onde", champion: "implacable" }
];
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
var JETONS_CHAMPION = [
  { jeton: "chancellement", type: "implacable" },
  { jeton: "perforation de bouclier", type: "bloqueur" },
  { jeton: "perturbation", type: "surcharge" }
];

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
function creerFausseDb(defs, options = {}) {
  const requetes = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
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
  return { db: db2, requetes };
}

// tests/logique/antichampion-mida.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
ok("armature \xAB Synergie MIDA \xBB + \xAB Outil polyvalent MIDA \xBB = SURCHARGE", championSynergieMIDA("Outil polyvalent MIDA", "Synergie MIDA") === "surcharge");
ok("armature \xAB Synergie MIDA \xBB + \xAB Outil macro MIDA \xBB = IMPLACABLE", championSynergieMIDA("Outil macro MIDA", "Synergie MIDA") === "implacable");
ok("la casse et les accents n'ont pas d'importance (\xAB OUTIL Polyvalent MIDA \xBB, \xAB Outil Macro MIDA \xBB, \xAB SYNERGIE mida \xBB) : le nom saisi par l'utilisateur fonctionne tel quel", championSynergieMIDA("OUTIL Polyvalent MIDA", "SYNERGIE mida") === "surcharge" && championSynergieMIDA("Outil Macro MIDA", "Synergie MIDA") === "implacable");
ok("la r\xE8gle exige l'armature : \xAB Outil polyvalent MIDA \xBB avec une AUTRE armature (pr\xE9cision, adaptative, absente) ne d\xE9clenche rien", [void 0, "Armature de pr\xE9cision", "Armature adaptative", "Synergie"].every((a) => championSynergieMIDA("Outil polyvalent MIDA", a) === void 0));
ok("on ne devine pas : une arme qui porte l'armature mais dont le nom n'a ni \xAB polyvalent \xBB ni \xAB macro \xBB reste SANS r\xE9ponse ; sans nom d'arme non plus", championSynergieMIDA("Outil multifonction MIDA", "Synergie MIDA") === void 0 && championSynergieMIDA("Autre arme MIDA", "Synergie MIDA") === void 0 && championSynergieMIDA(void 0, "Synergie MIDA") === void 0);
ok("le mot doit \xEAtre entier (\xAB macroscopique \xBB n'est pas \xAB macro \xBB)", championSynergieMIDA("Outil macroscopique MIDA", "Synergie MIDA") === void 0);
var plug = (nom, description = "") => ({ displayProperties: { name: nom, description }, itemTypeDisplayName: "Intrins\xE8que" });
var arme = (nom, plugArmature, tier = 6) => ({ displayProperties: { name: nom }, itemType: 3, itemTypeDisplayName: "Fusil", inventory: { bucketTypeHash: 1498876634, tierType: tier }, sockets: { socketEntries: [{ singleInitialItemHash: plugArmature }] } });
var { db } = creerFausseDb({ [T_OBJET]: {
  9101: plug("Synergie MIDA", "Les outils MIDA se compl\xE8tent."),
  9102: plug("Armature de pr\xE9cision"),
  9001: arme("Outil polyvalent MIDA", 9101),
  9002: arme("Outil macro MIDA", 9101),
  9003: arme("Autre arme MIDA", 9101),
  9004: arme("Outil multifonction MIDA", 9101),
  // l'ancien nom, présent dans la liste de référence (bloqueur)
  9005: arme("Fusil de pr\xE9cision d'essai", 9102, 5)
  // une légendaire à armature de précision : règle EXISTANTE
} });
ok("PUBLIC : l'Outil polyvalent MIDA (armature Synergie MIDA) donne SURCHARGE et l'Outil macro MIDA donne IMPLACABLE : l'ic\xF4ne appara\xEEt maintenant", obtenirAntiChampion(db, 9001) === "surcharge" && obtenirAntiChampion(db, 9002) === "implacable", [obtenirAntiChampion(db, 9001), obtenirAntiChampion(db, 9002)]);
ok("AVANT : la d\xE9duction d'origine ne trouvait rien pour ces armes (c'est pourquoi l'ic\xF4ne manquait) : la nouvelle r\xE8gle est bien ce qui change le r\xE9sultat", deduireAntiChampion(db, 9001) === "surcharge" && deduireAntiChampion(db, 9003) === void 0);
ok("une autre arme \xE0 armature Synergie MIDA mais au nom inconnu reste sans ic\xF4ne (on ne devine pas)", obtenirAntiChampion(db, 9003) === void 0);
ok("RIEN NE BOUGE ailleurs : l'\xAB Outil multifonction MIDA \xBB (liste de r\xE9f\xE9rence, ancien nom) reste BLOQUEUR ; une l\xE9gendaire \xE0 armature de pr\xE9cision reste BLOQUEUR", obtenirAntiChampion(db, 9004) === "bloqueur" && obtenirAntiChampion(db, 9005) === "bloqueur", [obtenirAntiChampion(db, 9004), obtenirAntiChampion(db, 9005)]);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
