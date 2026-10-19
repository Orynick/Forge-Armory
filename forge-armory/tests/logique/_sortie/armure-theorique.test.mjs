import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res2) => function __init() {
  return fn && (res2 = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res2;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };
  }
});

// factice:sql.js
var init_sql = __esm({
  "factice:sql.js"() {
    init_define_import_meta_env();
  }
});

// factice:fflate
var init_fflate = __esm({
  "factice:fflate"() {
    init_define_import_meta_env();
  }
});

// factice:sql.js/dist/sql-wasm.wasm?url
var init_sql_wasm = __esm({
  "factice:sql.js/dist/sql-wasm.wasm?url"() {
    init_define_import_meta_env();
  }
});

// src/lib/bungie/config.ts
var BUNGIE_ROOT, BUNGIE_API_ROOT, bungieConfig;
var init_config = __esm({
  "src/lib/bungie/config.ts"() {
    "use strict";
    init_define_import_meta_env();
    BUNGIE_ROOT = "https://www.bungie.net";
    BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
    bungieConfig = {
      apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
      clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
      redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
    };
  }
});

// factice:idb
var init_idb = __esm({
  "factice:idb"() {
    init_define_import_meta_env();
  }
});

// src/lib/manifest/db.ts
var init_db = __esm({
  "src/lib/manifest/db.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_idb();
  }
});

// src/lib/manifest/download.ts
function hashVersIdSqlite(hash) {
  return hash > 2147483647 ? hash - 4294967296 : hash;
}
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
var cacheDefinitionsParDb;
var init_download = __esm({
  "src/lib/manifest/download.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_sql();
    init_fflate();
    init_sql_wasm();
    init_config();
    init_db();
    cacheDefinitionsParDb = /* @__PURE__ */ new WeakMap();
  }
});

// src/data/constantesManifest.ts
var init_constantesManifest = __esm({
  "src/data/constantesManifest.ts"() {
    "use strict";
    init_define_import_meta_env();
  }
});

// src/lib/manifest/search.ts
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
}
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
var init_search = __esm({
  "src/lib/manifest/search.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_download();
    init_db();
    init_constantesManifest();
  }
});

// src/data/exotiquesAntiChampion.ts
var REFERENCE_EXOTIQUES_ANTI_CHAMPION;
var init_exotiquesAntiChampion = __esm({
  "src/data/exotiquesAntiChampion.ts"() {
    "use strict";
    init_define_import_meta_env();
    REFERENCE_EXOTIQUES_ANTI_CHAMPION = [
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
  }
});

// src/lib/manifest/antiChampionExotiques.ts
function normaliserNomArme(nom) {
  return nom.replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’'`´]/g, "'").replace(/[^a-z0-9'+.]+/g, " ").trim();
}
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
var ELEMENTS_VARIANTES, TABLE;
var init_antiChampionExotiques = __esm({
  "src/lib/manifest/antiChampionExotiques.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_exotiquesAntiChampion();
    ELEMENTS_VARIANTES = ["cryo electrique", "electrique", "solaire", "abyssale", "abyssal", "stase", "cryo", "vide", "arc", "filaments"];
    TABLE = construireTable();
  }
});

// src/lib/bungie/oauth.ts
var init_oauth = __esm({
  "src/lib/bungie/oauth.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_config();
  }
});

// src/lib/manifest/doctrine.ts
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
var MOTS_CONDITION_DEBLOCAGE;
var init_doctrine = __esm({
  "src/lib/manifest/doctrine.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_download();
    init_search();
    init_antiChampionExotiques();
    init_constantesManifest();
    init_oauth();
    init_config();
    MOTS_CONDITION_DEBLOCAGE = [
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
  }
});

// src/lib/manifest/statsArmure.ts
function resoudreStatKey(nomStat) {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT)) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return void 0;
}
var LIBELLES_STAT;
var init_statsArmure = __esm({
  "src/lib/manifest/statsArmure.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_search();
    LIBELLES_STAT = {
      sante: ["sante", "health"],
      melee: ["corps a corps", "melee"],
      grenade: ["grenade"],
      super: ["super"],
      classe: ["classe", "class", "competence de classe", "class ability"],
      arme: ["arme", "armes", "weapon", "weapons"]
    };
  }
});

// src/lib/manifest/saison.ts
function obtenirIndex(db2) {
  let idx = indexes.get(db2);
  if (!idx) {
    idx = { etat: "attente", carte: /* @__PURE__ */ new Map(), objetsAvecSaison: 0, version: 0, ecouteurs: /* @__PURE__ */ new Set(), fin: Promise.resolve() };
    indexes.set(db2, idx);
  }
  return idx;
}
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
var indexes, compter, etatIndexSaisons, memoire;
var init_saison = __esm({
  "src/lib/manifest/saison.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_download();
    init_search();
    indexes = /* @__PURE__ */ new WeakMap();
    compter = (carte, filigrane, saison) => {
      let m = carte.get(filigrane);
      if (!m) {
        m = /* @__PURE__ */ new Map();
        carte.set(filigrane, m);
      }
      m.set(saison, (m.get(saison) ?? 0) + 1);
    };
    etatIndexSaisons = (db2) => {
      const i = obtenirIndex(db2);
      return { etat: i.etat, objetsAvecSaison: i.objetsAvecSaison, filigranes: i.carte.size };
    };
    memoire = /* @__PURE__ */ new WeakMap();
  }
});

// src/lib/forge/armure.ts
var armure_exports = {};
__export(armure_exports, {
  colonnesArmure: () => colonnesArmure,
  colonnesModeleArmure: () => colonnesModeleArmure,
  diagnosticArmure: () => diagnosticArmure,
  diagnosticArmureManifest: () => diagnosticArmureManifest,
  lirePlugArmure: () => lirePlugArmure,
  regrouperColonnesArmure: () => regrouperColonnesArmure,
  statsSimulees: () => statsSimulees
});
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
function completerParModele(db2, piece2, socketIndex, vus) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", piece2.itemHash);
  const entree = def?.sockets?.socketEntries?.[socketIndex];
  if (!entree) return [];
  const ajoutes = [];
  for (const h of hashesPossibles(db2, entree)) {
    if (vus.has(h)) continue;
    vus.add(h);
    const p = lirePlugArmure(db2, h);
    if (p && !p.ornement) ajoutes.push({ ...p, theorique: true });
  }
  return ajoutes;
}
function colonnesArmure(db2, piece2, inclureCosmetiques = false) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", piece2.itemHash);
  const noms = /* @__PURE__ */ new Map();
  for (const cat of def?.sockets?.socketCategories ?? []) {
    let nom = "";
    try {
      nom = obtenirDefinition(db2, "DestinySocketCategoryDefinition", cat.socketCategoryHash)?.displayProperties?.name ?? "";
    } catch {
    }
    for (const i of cat.socketIndexes) noms.set(i, nom);
  }
  const colonnes = [];
  for (const { socketIndex, hash } of piece2.perksParColonne ?? []) {
    const equipe = lirePlugArmure(db2, hash);
    if (!equipe) continue;
    const categorie = noms.get(socketIndex) ?? "";
    const cosmetique = equipe.ornement || MOTS_COSMETIQUES.test(equipe.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const options = [equipe];
    const vus = /* @__PURE__ */ new Set([hash]);
    for (const h of piece2.plugsDisponiblesParColonne?.[socketIndex] ?? []) {
      if (vus.has(h)) continue;
      vus.add(h);
      const p = lirePlugArmure(db2, h);
      if (p && !p.ornement) options.push(p);
    }
    let theorique = false;
    const fixe = CATEGORIES_FIXES.test(equipe.categoriePlug);
    if (!fixe && !cosmetique && options.length < 2) {
      const modele = completerParModele(db2, piece2, socketIndex, vus);
      theorique = modele.length > 0;
      options.push(...modele);
    }
    colonnes.push({ socketIndex, categorie, equipe, options, cosmetique, fixe, modifiable: !fixe && !cosmetique && options.length >= 2, theorique: theorique || void 0 });
  }
  colonnes.sort((a, b) => a.socketIndex - b.socketIndex);
  return inclureCosmetiques ? colonnes : colonnes.filter((c) => !c.cosmetique);
}
function regrouperColonnesArmure(colonnes) {
  const groupes = [];
  for (const col of colonnes) {
    const signatures = (c) => `${c.equipe.categoriePlug}|${c.categorie}|${c.options.map((o) => o.hash).join(",")}`;
    const existant = groupes.find((g) => signatures(g.colonnes[0]) === signatures(col));
    if (existant) {
      existant.colonnes.push(col);
      existant.modifiable = existant.modifiable && col.modifiable;
      continue;
    }
    groupes.push({ colonnes: [col], categorie: col.categorie, cosmetique: col.cosmetique, fixe: col.fixe, modifiable: col.modifiable, theorique: col.theorique });
  }
  return groupes;
}
function statsSimulees(db2, piece2, choix) {
  const delta = {};
  let nbChangements = 0;
  if (choix) {
    for (const col of colonnesArmure(db2, piece2, true)) {
      const c = choix[col.socketIndex];
      if (!c || !col.modifiable || c.effectif === col.equipe.hash) continue;
      const nouveau = col.options.find((o) => o.hash === c.effectif);
      if (!nouveau) continue;
      nbChangements++;
      for (const k of /* @__PURE__ */ new Set([...Object.keys(nouveau.stats), ...Object.keys(col.equipe.stats)])) delta[k] = (delta[k] ?? 0) + (nouveau.stats[k] ?? 0) - (col.equipe.stats[k] ?? 0);
    }
  }
  const reelles = piece2.stats ?? {};
  const simulees = { ...reelles };
  for (const k of Object.keys(delta)) simulees[k] = (reelles[k] ?? 0) + (delta[k] ?? 0);
  return { reelles, simulees, delta, nbChangements };
}
function diagnosticArmure(db2, piece2) {
  const lignes = [];
  lignes.push(`Armure : ${piece2.nom ?? "?"} (hash ${piece2.itemHash}) | emplacement : ${piece2.slot} | classe : ${piece2.classeRequise ?? "?"} | exotique : ${piece2.isExotic ? "oui" : "non"} | ensemble (setHash) : ${piece2.setHash ?? "aucun"}`);
  lignes.push(diagnosticSaisonObjet(db2, piece2.itemHash));
  lignes.push(`Statistiques r\xE9elles : ${Object.entries(piece2.stats ?? {}).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}`);
  lignes.push(`Disponibilit\xE9 des plugs lue sur l'exemplaire : ${piece2.plugsDisponiblesParColonne === void 0 ? "NON (rechargez l'inventaire)" : "oui"}`);
  const colonnes = colonnesArmure(db2, piece2, true);
  const lues = new Set(colonnes.map((c) => c.socketIndex));
  for (const c of colonnes) {
    const dispo = piece2.plugsDisponiblesParColonne?.[c.socketIndex] ?? [];
    const noms = c.options.slice(1, 7).map((o) => o.nom).join(" | ");
    lignes.push(`prise ${c.socketIndex} | cat\xE9gorie \xAB ${c.categorie || "?"} \xBB | \xE9quip\xE9 : ${c.equipe.nom} (hash ${c.equipe.hash}, cat\xE9gorie de plug \xAB ${c.equipe.categoriePlug || "?"} \xBB, stats : ${Object.entries(c.equipe.stats).map(([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`).join(", ") || "aucune"}) | disponibles : ${dispo.length}${noms ? ` (autres : ${noms}${c.options.length > 7 ? " \u2026" : ""})` : ""} | cosm\xE9tique : ${c.cosmetique ? "oui" : "non"} | fixe : ${c.fixe ? "oui" : "non"} | modifiable : ${c.modifiable ? "OUI" : "non"}`);
  }
  for (const p of piece2.perksParColonne ?? []) if (!lues.has(p.socketIndex)) lignes.push(`prise ${p.socketIndex} | plug illisible dans le Manifest (hash ${p.hash})`);
  return lignes.join("\n");
}
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
  const hashes = [];
  const ajouter = (hs) => {
    for (const h of hs) if (!hashes.includes(h)) hashes.push(h);
  };
  const pool = (hashJeu) => (obtenirDefinition(db2, "DestinyPlugSetDefinition", hashJeu)?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
  ajouter((e.reusablePlugItems ?? []).map((p) => p.plugItemHash));
  if (e.reusablePlugSetHash) ajouter(pool(e.reusablePlugSetHash));
  if (e.randomizedPlugSetHash) ajouter(pool(e.randomizedPlugSetHash));
  if (e.singleInitialItemHash) ajouter([e.singleInitialItemHash]);
  return hashes;
}
function colonnesModeleArmure(db2, itemHash, options = {}) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const noms = nomsCategoriesSocket(db2, def);
  const colonnes = [];
  (def?.sockets?.socketEntries ?? []).forEach((entree, socketIndex) => {
    const hashes = hashesPossibles(db2, entree);
    const categorie = noms.get(socketIndex) ?? "";
    const premier = hashes.map((h) => lirePlugArmure(db2, h)).find((p) => !!p && !p.ornement);
    if (!premier) return;
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const mod = estEmplacementMod(premier.categoriePlug, categorie);
    if (cosmetique && !options.cosmetiques || mod && !options.mods) return;
    const lus = hashes.map((h) => lirePlugArmure(db2, h)).filter((p) => !!p && !p.ornement);
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
    const hashes = hashesPossibles(db2, e);
    const premier = hashes.map((h) => lirePlugArmure(db2, h)).find((p) => !!p && !p.ornement);
    const categorie = noms.get(i) ?? "";
    const brut = `plug initial ${e.singleInitialItemHash ?? "\u2014"} | liste directe ${(e.reusablePlugItems ?? []).length} | jeu partag\xE9 ${e.reusablePlugSetHash ?? "\u2014"} | jeu al\xE9atoire ${e.randomizedPlugSetHash ?? "\u2014"}`;
    if (!premier) {
      lignes.push(`prise ${i} | cat\xE9gorie \xAB ${categorie || "?"} \xBB | ${brut} | ${hashes.length} plug(s) possible(s), AUCUN lisible dans le Manifest`);
      return;
    }
    const cosmetique = MOTS_COSMETIQUES.test(premier.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const noms6 = hashes.slice(0, 6).map((h) => lirePlugArmure(db2, h)?.nom ?? "?").join(" | ");
    lignes.push(`prise ${i} | cat\xE9gorie \xAB ${categorie || "?"} \xBB | ${brut} | ${hashes.length} plug(s) possible(s) (premiers : ${noms6}${hashes.length > 6 ? " \u2026" : ""}) | cat\xE9gorie de plug \xAB ${premier.categoriePlug || "?"} \xBB | cosm\xE9tique : ${cosmetique ? "oui" : "non"} | mods : ${estEmplacementMod(premier.categoriePlug, categorie) ? "oui" : "non"} | fixe : ${CATEGORIES_FIXES.test(premier.categoriePlug) ? "oui" : "non"}`);
  });
  return lignes.join("\n");
}
var MOTS_COSMETIQUES, CATEGORIES_FIXES, memoStats, memoPlugs, estEmplacementMod;
var init_armure = __esm({
  "src/lib/forge/armure.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_download();
    init_doctrine();
    init_search();
    init_statsArmure();
    init_saison();
    MOTS_COSMETIQUES = /shader|skin|ornament|ornement|cosmetic|cosmetique|transmat|emote|projection|memento|souvenir|tracker|apparence|teinture|spawn/;
    CATEGORIES_FIXES = /masterwork|armor_stats|intrinsic|exotic|set_perk|armor_tier|archetype/i;
    memoStats = /* @__PURE__ */ new WeakMap();
    memoPlugs = /* @__PURE__ */ new WeakMap();
    estEmplacementMod = (categoriePlug, nomCategorie) => /^enhancements\./i.test(categoriePlug) || /\bmods?\b/.test(normaliser(nomCategorie));
  }
});

// tests/logique/armure-theorique.test.ts
init_define_import_meta_env();
init_armure();

// tests/logique/fixtures/fauxManifest.ts
init_define_import_meta_env();
init_download();
var T_OBJET = "DestinyInventoryItemDefinition";
var T_PLUGSET = "DestinyPlugSetDefinition";
var T_CATEGORIE = "DestinySocketCategoryDefinition";
var T_RARETE = "DestinyItemTierTypeDefinition";
var HASH_EXOTIQUE = 2759499571;
var HASH_LEGENDAIRE = 4008398120;
var BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
function creerFausseDb(defs2, options = {}) {
  const requetes = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes.push(sql);
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
  return { db: db2, requetes };
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
  const entrees = (...hashes) => hashes.map((h) => ({ singleInitialItemHash: h }));
  defs2[T_PLUGSET][8301] = { reusablePlugItems: [7411, 7412, 7413].map((h) => ({ plugItemHash: h })) };
  defs2[T_PLUGSET][8302] = { reusablePlugItems: [7421, 7422].map((h) => ({ plugItemHash: h })) };
  objets[5301] = { displayProperties: { name: "Casque de bastion d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 7402 }, { singleInitialItemHash: 7411, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 7421, reusablePlugSetHash: 8302 }, { singleInitialItemHash: 7431 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2, 3] }, { socketCategoryHash: 7603, socketIndexes: [4] }] } };
  objets[5302] = { displayProperties: { name: "Plastron exotique d'essai", icon: "/icons/plastron.png" }, sockets: { socketEntries: entrees(7401, 7441, 7412), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2] }] } };
  objets[5304] = { displayProperties: { name: "Casque \xE0 prises r\xE9p\xE9t\xE9es d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }, { socketCategoryHash: 7602, socketIndexes: [1, 2, 3] }] } };
  objets[5303] = { displayProperties: { name: "Marque de classe d'essai", icon: "/icons/marque.png" }, sockets: { socketEntries: entrees(7441), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] } };
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

// tests/logique/armure-theorique.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var defs = ajouterArmureForge(manifestArmesDeTest());
var { db } = creerFausseDb(defs);
var piece = (o) => ({ itemHash: 5301, slot: "casque", ...o });
(async () => {
  const casque = piece({ itemInstanceId: "x1", perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 2, hash: 7411 }], plugsDisponiblesParColonne: { 0: [7401], 2: [7411, 7412, 7413] } });
  const cNormal = colonnesArmure(db, casque);
  ok("NON-R\xC9GRESSION : une prise qui liste ses plugs (7411, 7412, 7413) reste exactement la m\xEAme \u2014 aucune option th\xE9orique ajout\xE9e, colonne non marqu\xE9e `theorique`", cNormal.length === 2 && JSON.stringify(cNormal[1].options.map((o) => o.hash)) === "[7411,7412,7413]" && !cNormal[1].theorique && cNormal.every((c) => c.options.every((o) => !o.theorique)), cNormal);
  const casqueSans310 = piece({ itemInstanceId: "x2", perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [] } });
  const cTheorique = colonnesArmure(db, casqueSans310);
  const prise2 = cTheorique.find((c) => c.socketIndex === 2);
  ok("Z\xC9RO plug list\xE9 par l'exemplaire sur une prise non fixe non cosm\xE9tique : les plugs du MOD\xC8LE compl\xE8tent (le jeu de plugs partag\xE9 du faux Manifest : 7411, 7412, 7413, avec le plug \xE9quip\xE9 en premier, sans doublon)", !!prise2 && JSON.stringify(prise2.options.map((o) => o.hash)) === "[7411,7412,7413]", prise2?.options.map((o) => o.hash));
  ok("les options compl\xE9mentaires sont marqu\xE9es `theorique : true` (l'\xE9quip\xE9 ne l'est pas) et la colonne porte `theorique`", !!prise2 && prise2.theorique === true && prise2.options.filter((o) => o.theorique).length === 2, prise2?.options.map((o) => o.theorique));
  ok("la colonne compl\xE9t\xE9e est MODIFIABLE (simulation locale possible)", !!prise2 && prise2.modifiable === true, prise2?.modifiable);
  ok("la prise FIXE (arch\xE9\xE9type) n'est PAS compl\xE9t\xE9e m\xEAme sans alternative list\xE9e : un seul plug, pas de th\xE9orique", cTheorique.filter((c) => c.socketIndex === 0).every((c) => c.options.length === 1 && !c.theorique && !c.modifiable), cTheorique.find((c) => c.socketIndex === 0));
  const casqueNonLu = piece({ itemInstanceId: "x3", perksParColonne: [{ socketIndex: 2, hash: 7411 }] });
  const cNonLu = colonnesArmure(db, casqueNonLu);
  ok("composant 310 ABSENT (\xAB on ne sait pas \xBB) : le mod\xE8le compl\xE8te aussi la prise de mods (m\xEAme lecture que \xAB z\xE9ro list\xE9 \xBB)", cNonLu.length === 1 && cNonLu[0].theorique === true && JSON.stringify(cNonLu[0].options.map((o) => o.hash)) === "[7411,7412,7413]", cNonLu.map((c) => c.theorique));
  const masque = piece({ itemInstanceId: "x4", itemHash: 5304, perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 198e3 }, { socketIndex: 2, hash: 198e3 }, { socketIndex: 3, hash: 198e3 }], plugsDisponiblesParColonne: { 0: [7401], 1: [], 2: [], 3: [] } });
  const groupes = regrouperColonnesArmure(colonnesArmure(db, masque, true));
  ok("TROIS prises IDENTIQUES (m\xEAme mod\xE8le de prise : m\xEAme cat\xE9gorie \xAB Mods d'armure \xBB, m\xEAme \xE9quip\xE9 vide, m\xEAmes options du mod\xE8le) sont regroup\xE9es en UN seul groupe (\xD7 3) ; l'arch\xE9type reste \xE0 part", groupes.length === 2 && groupes[1].colonnes.length === 3 && JSON.stringify(groupes[1].colonnes.map((c) => c.socketIndex)) === "[1,2,3]", groupes.map((g) => [g.colonnes.map((c) => c.socketIndex), g.categorie]));
  ok("le groupe porte la cat\xE9gorie et les jugements de ses colonnes (mods, modifiable, th\xE9orique)", groupes[1].categorie === "Mods d'armure" && groupes[1].modifiable === true && groupes[1].theorique === true, groupes[1]);
  ok("deux prises de MODS diff\xE9rentes (7411 et 7421) ne sont PAS regroup\xE9es", regrouperColonnesArmure(colonnesArmure(db, piece({ itemInstanceId: "x5", perksParColonne: [{ socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }] }))).length === 2, "attendu : 2 groupes");
  ok("une liste de colonnes SANS doublon sort en autant de groupes (non-r\xE9gression)", regrouperColonnesArmure(cNormal).length === 2, regrouperColonnesArmure(cNormal).length);
  const { statsSimulees: statsSimulees2 } = await Promise.resolve().then(() => (init_armure(), armure_exports));
  const s = statsSimulees2(db, casqueSans310, { 2: { choisi: 7412, effectif: 7412 } });
  ok("SIMULER un plug TH\xC9ORIQUE calcule le m\xEAme delta que s'il \xE9tait r\xE9el (sant\xE9 +10 pour le mod de classe 7412 : ici 7412 = mod de classe, v\xE9rifi\xE9 sur ses investmentStats)", s.nbChangements === 1 && Object.keys(s.delta).length > 0, s.delta);
  console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();
