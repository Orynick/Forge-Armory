import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// tests/logique/faconnee.test.ts
import fs from "node:fs";

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

// src/lib/manifest/search.ts
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// src/lib/forge/faconnee.ts
var PLUG_ARME_FACONNEE = 4029346515;
var NOMS_PLUG_FACONNEE = ["arme faconnee", "crafted weapon"];
var memoire = /* @__PURE__ */ new WeakMap();
function plugFaconneParNom(db2, hash) {
  let m = memoire.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoire.set(db2, m);
  }
  const connu = m.get(hash);
  if (connu !== void 0) return connu;
  const nom = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash)?.displayProperties?.name;
  const reponse = !!nom && NOMS_PLUG_FACONNEE.includes(normaliser(nom));
  m.set(hash, reponse);
  return reponse;
}
function estFaconnee(db2, perkHashes) {
  if (!perkHashes || perkHashes.length === 0) return false;
  if (perkHashes.includes(PLUG_ARME_FACONNEE)) return true;
  return !!db2 && perkHashes.some((h) => plugFaconneParNom(db2, h));
}

// src/lib/forge/simulation.ts
var estLeRollReel = (item2) => !!(item2.option.equipeEnJeu || item2.ameliore?.equipeEnJeu);
function niveauDePerk(item2, socketIndex, disponibles, choixSimule) {
  if (choixSimule && choixSimule.choisi === item2.option.hash) return "simule";
  if (estLeRollReel(item2)) return "reel";
  if (!disponibles) return "inconnu";
  const liste = disponibles[socketIndex] ?? [];
  return liste.includes(item2.option.hash) || (item2.ameliore ? liste.includes(item2.ameliore.hash) : false) ? "disponible" : "possible";
}

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

// tests/logique/faconnee.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var crafted = JSON.parse(fs.readFileSync("tests/logique/fixtures/arme-faconnee-reelle.json", "utf-8")).arme;
var autres = JSON.parse(fs.readFileSync("tests/logique/fixtures/plugs-diagnostics-reels.json", "utf-8")).armes;
var equipes = (prises) => prises.map((p) => p.equipe);
ok("DONN\xC9ES R\xC9ELLES : la Mesure corrective est reconnue FA\xC7ONN\xC9E (son perk \xE9quip\xE9 \xAB Arme fa\xE7onn\xE9e \xBB, 4029346515, \xE0 la prise 10)", estFaconnee(null, equipes(crafted.prises)) && crafted.prises.find((p) => p.prise === 10).equipe === PLUG_ARME_FACONNEE, equipes(crafted.prises));
ok("DONN\xC9ES R\xC9ELLES : la Confiance et l'Outil polyvalent MIDA ne sont PAS fa\xE7onn\xE9es (aucun faux positif sur les deux autres armes r\xE9elles de l'utilisateur)", autres.length === 2 && autres.every((a) => !estFaconnee(null, equipes(a.prises))), autres.map((a) => a.nom));
var colonnesPerks = crafted.prises.filter((p) => [1, 2, 3, 4, 8].includes(p.prise));
ok("DONN\xC9ES R\xC9ELLES : sur l'arme fa\xE7onn\xE9e, chaque colonne de perks (prises 1 \xE0 4 et 8) ne liste que le perk \xC9QUIP\xC9 comme \xAB disponible \xBB : les autres perks ne se choisissent qu'\xE0 la forge en jeu (c'est ce que dit la note de l'appli)", colonnesPerks.length === 5 && colonnesPerks.every((p) => p.disponibles.length === 1 && p.disponibles[0] === p.equipe), colonnesPerks);
var dispo = Object.fromEntries(crafted.prises.filter((p) => p.disponibles.length > 0).map((p) => [p.prise, p.disponibles]));
var item = (hash, reel = false) => ({ option: { hash, equipeEnJeu: reel } });
ok("CONS\xC9QUENCE sur les quatre niveaux : dans une colonne de perks de l'arme fa\xE7onn\xE9e, l'\xE9quip\xE9 est \xAB reel \xBB et tout autre perk du mod\xE8le est \xAB possible \xBB (nom gris\xE9), jamais \xAB disponible \xBB ; les mods (prise 6, 16 perks disponibles) restent \xAB disponible \xBB", niveauDePerk(item(crafted.prises.find((p) => p.prise === 3).equipe, true), 3, dispo) === "reel" && niveauDePerk(item(999999999), 3, dispo) === "possible" && niveauDePerk(item(3336648220), 6, dispo) === "disponible", dispo[6]);
var { db } = creerFausseDb({ [T_OBJET]: { 7001: { displayProperties: { name: "Arme fa\xE7onn\xE9e" } }, 7002: { displayProperties: { name: "ARME FA\xC7ONN\xC9E" } }, 7003: { displayProperties: { name: "Crafted Weapon" } }, 7004: { displayProperties: { name: "Arme fa\xE7onn\xE9e am\xE9lior\xE9e" } }, 7005: { displayProperties: { name: "Canon X" } } } });
ok("REPLI PAR LE NOM (autre hash que le connu) : \xAB Arme fa\xE7onn\xE9e \xBB, \xAB ARME FA\xC7ONN\xC9E \xBB (casse et accents sans importance) et \xAB Crafted Weapon \xBB sont reconnus avec le Manifest", estFaconnee(db, [7005, 7001]) && estFaconnee(db, [7002]) && estFaconnee(db, [7003]));
ok("un autre perk n'est pas pris pour le plug (\xAB Arme fa\xE7onn\xE9e am\xE9lior\xE9e \xBB, \xAB Canon X \xBB) ; sans Manifest, un hash inconnu ne d\xE9clenche rien", !estFaconnee(db, [7004]) && !estFaconnee(db, [7005]) && !estFaconnee(null, [7001]));
ok("cas limites : liste absente ou vide = non fa\xE7onn\xE9e ; le hash connu suffit m\xEAme sans Manifest", !estFaconnee(db, void 0) && !estFaconnee(db, []) && estFaconnee(null, [1, PLUG_ARME_FACONNEE, 2]));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
