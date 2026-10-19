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
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
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
  for (const f2 of filigranes) {
    const m = f2 ? idx.carte.get(f2) : void 0;
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
            const f2 = motif.exec(json);
            if (f2) compter(idx.carte, f2[1], saison);
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
var attendreIndexSaisons = (db2) => demarrerIndexSaisons(db2).fin;
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
var libelleSaison = (info) => info.nom ? `${info.nom}${info.numero ? ` (saison ${info.numero})` : ""}` : "Saison de l'objet";
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
  } catch (e2) {
    return `Saison : lecture impossible (${e2.message})`;
  }
}

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
function creerFausseDb(defs, options = {}) {
  const requetes2 = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes2.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
      const lignes = Object.entries(defs[table] ?? {}).map(([h, d2]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d2) }));
      let choisies = lignes, courant = -1;
      return {
        bind: (a2) => {
          if (/id\s*=\s*\?/.test(where)) choisies = lignes.filter((l) => l.id === a2[0]);
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

// tests/logique/saison.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var T_SAISON = "DestinySeasonDefinition";
var { db, requetes } = creerFausseDb({
  [T_OBJET]: {
    9101: { iconWatermark: "/img/saison-sorciere.png", seasonHash: 9001 },
    9102: { iconWatermark: "/img/saison-sans-nom.png" },
    9103: { displayProperties: { name: "Sans filigrane" }, seasonHash: 9001 },
    9104: { iconWatermarkShelved: "/img/saison-rangee.png", seasonHash: 9002 },
    9105: { iconWatermark: "/img/saison-orpheline.png", seasonHash: 9999 },
    9106: { iconWatermark: "/img/saison-sans-numero.png", seasonHash: 9003 }
  },
  [T_SAISON]: { 9001: { displayProperties: { name: "Saison de la Sorci\xE8re" }, seasonNumber: 22 }, 9002: { displayProperties: { name: "\xC9pisode : \xC9chos" }, seasonNumber: 24 }, 9003: { displayProperties: { name: "Saison sans num\xE9ro" } } }
});
var a = obtenirSaisonObjet(db, 9101);
ok("un objet avec filigrane et saison : l'URL de l'image (chemin Bungie compl\xE9t\xE9), le nom de la saison, son num\xE9ro et son identifiant", a?.filigrane === "https://www.bungie.net/img/saison-sorciere.png" && a.nom === "Saison de la Sorci\xE8re" && a.numero === 22 && a.hashSaison === 9001, a);
ok("le texte de survol dit le nom ET le num\xE9ro : \xAB Saison de la Sorci\xE8re (saison 22) \xBB ; sans num\xE9ro, le nom seul ; sans nom, un libell\xE9 neutre", libelleSaison(a) === "Saison de la Sorci\xE8re (saison 22)" && libelleSaison(obtenirSaisonObjet(db, 9106)) === "Saison sans num\xE9ro" && libelleSaison(obtenirSaisonObjet(db, 9102)) === "Saison de l'objet", [libelleSaison(a), libelleSaison(obtenirSaisonObjet(db, 9106)), libelleSaison(obtenirSaisonObjet(db, 9102))]);
var b = obtenirSaisonObjet(db, 9102);
ok("un filigrane SANS saison connue : l'ic\xF4ne existe, sans nom ni num\xE9ro (on n'invente pas de saison)", b?.filigrane === "https://www.bungie.net/img/saison-sans-nom.png" && b.nom === void 0 && b.numero === void 0 && b.hashSaison === void 0, b);
ok("un objet SANS filigrane n'a pas d'ic\xF4ne, m\xEAme s'il a une saison : on ne devine rien", obtenirSaisonObjet(db, 9103) === void 0);
var c = obtenirSaisonObjet(db, 9104);
ok("repli : sans filigrane principal, le filigrane \xAB shelved \xBB est utilis\xE9 (hypoth\xE8se non v\xE9rifi\xE9e sur les donn\xE9es r\xE9elles), avec sa saison", c?.filigrane === "https://www.bungie.net/img/saison-rangee.png" && c.nom === "\xC9pisode : \xC9chos" && c.numero === 24, c);
var d = obtenirSaisonObjet(db, 9105);
ok("une saison INTROUVABLE dans la table (identifiant orphelin) : l'ic\xF4ne s'affiche, sans nom", d?.filigrane === "https://www.bungie.net/img/saison-orpheline.png" && d.nom === void 0 && d.hashSaison === 9999, d);
ok("sans Manifest, sans identifiant ou pour un objet inconnu : rien, sans erreur", obtenirSaisonObjet(null, 9101) === void 0 && obtenirSaisonObjet(void 0, 9101) === void 0 && obtenirSaisonObjet(db, void 0) === void 0 && obtenirSaisonObjet(db, 123456789) === void 0);
var avant = requetes.length;
obtenirSaisonObjet(db, 9101);
obtenirSaisonObjet(db, 9103);
obtenirSaisonObjet(db, 9105);
ok("M\xC9MOIRE : relire les m\xEAmes objets n'interroge plus le Manifest (y compris un objet sans ic\xF4ne) : l'affichage d'une longue liste reste rapide", requetes.length === avant, [avant, requetes.length]);
var { db: dbBase } = creerFausseDb({ [T_OBJET]: { 9201: { iconWatermark: "/img/x.png", seasonHash: 9001 } } });
var dbSansTable = { ...dbBase, prepare: (sql) => {
  if (/DestinySeasonDefinition/.test(sql)) throw new Error("no such table: DestinySeasonDefinition");
  return dbBase.prepare(sql);
} };
var e;
var plante = false;
try {
  e = obtenirSaisonObjet(dbSansTable, 9201);
} catch {
  plante = true;
}
ok("TABLE DES SAISONS ABSENTE (la requ\xEAte l\xE8ve une erreur) : aucune erreur n'en sort ; l'ic\xF4ne s'affiche sans nom", !plante && e?.filigrane === "https://www.bungie.net/img/x.png" && e.nom === void 0 && e.hashSaison === 9001, e);
var dbQuiPlante = { prepare: () => {
  throw new Error("base illisible");
} };
var f = void 0;
var plante2 = false;
try {
  f = obtenirSaisonObjet(dbQuiPlante, 9101);
} catch {
  plante2 = true;
}
ok("m\xEAme une base enti\xE8rement illisible ne fait pas planter l'affichage : pas d'ic\xF4ne, pas d'erreur", !plante2 && f === void 0);
ok("DIAGNOSTIC (npm run dev) : il dit le seasonHash, le nom et le num\xE9ro de la saison et le filigrane ; pour un objet SANS filigrane, il \xE9crit \xAB ABSENT \xBB (c'est ce qui permet de contr\xF4ler les donn\xE9es de l'utilisateur) ; pour une saison orpheline, \xAB introuvable \xBB", /seasonHash = 9001 → Saison de la Sorcière, n° 22 \| filigrane : \/img\/saison-sorciere\.png/.test(diagnosticSaisonObjet(db, 9101)) && /seasonHash = 9001 .* filigrane : ABSENT/.test(diagnosticSaisonObjet(db, 9103)) && /introuvable dans la table des saisons/.test(diagnosticSaisonObjet(db, 9105)) && /seasonHash = ABSENT → — \| filigrane : \/img\/saison-sans-nom\.png/.test(diagnosticSaisonObjet(db, 9102)), [diagnosticSaisonObjet(db, 9101), diagnosticSaisonObjet(db, 9103), diagnosticSaisonObjet(db, 9105)]);
(async () => {
  const defs = {
    [T_OBJET]: {
      9301: { iconWatermark: "/img/w1.png", seasonHash: 9001 },
      // référence de la saison 9001 (nommée par son propre seasonHash)
      9302: { iconWatermark: "/img/w1.png" },
      // SANS seasonHash : doit être nommé d'après 9301
      9303: { iconWatermarkShelved: "/img/w2r.png", seasonHash: 9002 },
      // référence via le filigrane « shelved »
      9304: { iconWatermark: "/img/w2.png", iconWatermarkShelved: "/img/w2r.png", seasonHash: 9002 },
      9305: { iconWatermark: "/img/w2.png" },
      // sans seasonHash, filigrane principal
      9306: { iconWatermarkShelved: "/img/w2r.png" },
      // sans seasonHash, seulement « shelved »
      9307: { iconWatermark: "/img/w3.png" },
      // orphelin : aucun autre objet de ce filigrane n'a de saison
      9308: { iconWatermark: "/img/w4.png", seasonHash: 9001 },
      // vote : 1 voix pour 9001…
      9309: { iconWatermark: "/img/w4.png", seasonHash: 9002 },
      9310: { iconWatermark: "/img/w4.png", seasonHash: 9002 },
      // …2 voix pour 9002
      9311: { iconWatermark: "/img/w4.png" }
      // sans seasonHash : la saison la plus fréquente (9002) l'emporte
    },
    [T_SAISON]: { 9001: { displayProperties: { name: "Saison de la Sorci\xE8re" }, seasonNumber: 22 }, 9002: { displayProperties: { name: "\xC9pisode : \xC9chos" }, seasonNumber: 24 } }
  };
  const { db: d1, requetes: r1 } = creerFausseDb(defs);
  const avantBalayage = obtenirSaisonObjet(d1, 9302);
  ok("AVANT la fin du balayage : l'objet sans seasonHash a d\xE9j\xE0 son ic\xF4ne (le filigrane), sans nom ; l'affichage n'attend pas le balayage", avantBalayage?.filigrane === "https://www.bungie.net/img/w1.png" && avantBalayage.nom === void 0 && etatIndexSaisons(d1).etat === "encours", [avantBalayage, etatIndexSaisons(d1)]);
  await attendreIndexSaisons(d1);
  const e2 = etatIndexSaisons(d1);
  ok("le balayage se termine et compte ce qu'il a lu : 6 objets du Manifest ont un seasonHash, 4 filigranes sont reli\xE9s \xE0 une saison (w1, w2r, w2, w4)", e2.etat === "fini" && e2.objetsAvecSaison === 6 && e2.filigranes === 4, e2);
  const b2 = obtenirSaisonObjet(d1, 9302);
  ok("APR\xC8S le balayage : l'objet sans seasonHash est NOMM\xC9 d'apr\xE8s les autres objets de m\xEAme filigrane (nom, num\xE9ro, saison, marqu\xE9 \xAB d\xE9duit \xBB)", b2?.nom === "Saison de la Sorci\xE8re" && b2.numero === 22 && b2.hashSaison === 9001 && b2.nomDeduit === true, b2);
  const c5 = obtenirSaisonObjet(d1, 9305), c6 = obtenirSaisonObjet(d1, 9306);
  ok("le filigrane principal ET le filigrane \xAB shelved \xBB servent \xE0 relier un objet \xE0 sa saison (9305 par w2, 9306 par w2r)", c5?.nom === "\xC9pisode : \xC9chos" && c6?.nom === "\xC9pisode : \xC9chos" && c5.nomDeduit === true && c6.nomDeduit === true, [c5, c6]);
  const o = obtenirSaisonObjet(d1, 9307);
  ok("un objet ORPHELIN (aucun autre objet de son filigrane n'a de saison) garde son ic\xF4ne SANS nom : on ne devine rien", o?.filigrane === "https://www.bungie.net/img/w3.png" && o.nom === void 0 && o.nomDeduit === void 0, o);
  const v = obtenirSaisonObjet(d1, 9311);
  ok("quand deux saisons se disputent une image, la plus FR\xC9QUENTE l'emporte (2 objets contre 1 : \xAB \xC9pisode : \xC9chos \xBB)", v?.nom === "\xC9pisode : \xC9chos" && v.hashSaison === 9002, v);
  const propre = obtenirSaisonObjet(d1, 9308);
  ok("un objet qui a SON PROPRE seasonHash n'est jamais renomm\xE9 par le vote (9308 reste \xAB Saison de la Sorci\xE8re \xBB m\xEAme si son filigrane est majoritairement 9002), et n'est pas marqu\xE9 \xAB d\xE9duit \xBB", propre?.nom === "Saison de la Sorci\xE8re" && propre.nomDeduit === void 0, propre);
  const requetesAvant = r1.length;
  obtenirSaisonObjet(d1, 9302);
  obtenirSaisonObjet(d1, 9305);
  obtenirSaisonObjet(d1, 9311);
  ok("M\xC9MOIRE : apr\xE8s le balayage, relire des objets d\xE9j\xE0 nomm\xE9s n'interroge plus le Manifest ; le balayage ne s'est lanc\xE9 qu'UNE fois", r1.length === requetesAvant && r1.filter((q) => /LIKE/.test(q)).length === 1, [requetesAvant, r1.length, r1.filter((q) => /LIKE/.test(q)).length]);
  const diag = diagnosticSaisonObjet(d1, 9302), diagOrphelin = diagnosticSaisonObjet(d1, 9307);
  ok("DIAGNOSTIC : il dit la saison d\xE9duite du filigrane et l'\xE9tat du balayage (6 objets avec seasonHash, 4 filigranes reli\xE9s) ; pour un orphelin il \xE9crit \xAB AUCUNE \xBB", /déduite des autres objets de même filigrane : Saison de la Sorcière, n° 22/.test(diag) && /balayage des saisons : fini, 6 objet\(s\) du Manifest ont un seasonHash, 4 filigrane\(s\)/.test(diag) && /déduite des autres objets de même filigrane : AUCUNE/.test(diagOrphelin), [diag, diagOrphelin]);
  const { db: base } = creerFausseDb({ [T_OBJET]: { 9401: { iconWatermark: "/img/z.png" } } });
  const dbBalayageHS = { ...base, prepare: (sql) => {
    if (/LIKE/.test(sql)) throw new Error("requ\xEAte refus\xE9e");
    return base.prepare(sql);
  } };
  let plante3 = false, z;
  try {
    z = obtenirSaisonObjet(dbBalayageHS, 9401);
    await attendreIndexSaisons(dbBalayageHS);
    z = obtenirSaisonObjet(dbBalayageHS, 9401);
  } catch {
    plante3 = true;
  }
  ok("BALAYAGE QUI PLANTE (requ\xEAte refus\xE9e par la base) : aucune erreur n'en sort, le balayage se termine \xE0 vide, l'ic\xF4ne reste affich\xE9e sans nom", !plante3 && etatIndexSaisons(dbBalayageHS).etat === "fini" && z?.filigrane === "https://www.bungie.net/img/z.png" && z?.nom === void 0, [plante3, etatIndexSaisons(dbBalayageHS)]);
  const { db: sans } = creerFausseDb({ [T_OBJET]: { 9501: { iconWatermark: "/img/y.png" }, 9502: { iconWatermark: "/img/y.png" } } });
  obtenirSaisonObjet(sans, 9501);
  await attendreIndexSaisons(sans);
  ok("AUCUN objet du Manifest n'a de seasonHash : le balayage finit \xE0 vide (0 objet, 0 filigrane), les ic\xF4nes restent sans nom, et le diagnostic le dit", etatIndexSaisons(sans).objetsAvecSaison === 0 && etatIndexSaisons(sans).filigranes === 0 && obtenirSaisonObjet(sans, 9502)?.nom === void 0 && /0 objet\(s\) du Manifest ont un seasonHash/.test(diagnosticSaisonObjet(sans, 9501)), etatIndexSaisons(sans));
  console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();
