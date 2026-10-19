import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// tests/logique/perks-ameliores.test.ts
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

// src/lib/manifest/perksAmeliores.ts
var MOT_TYPE_AMELIORE = /am[eé]lior|enhanced/i;
function apparierPerksAmeliores(options, estAmeliore) {
  const marques = options.map((o2) => estAmeliore(o2));
  const colonneAvecAmeliores = marques.some(Boolean);
  const parNom = /* @__PURE__ */ new Map();
  options.forEach((o2, i) => {
    const cle = normaliser(o2.nom);
    const liste = parNom.get(cle);
    if (liste) liste.push(i);
    else parNom.set(cle, [i]);
  });
  const jumeau = /* @__PURE__ */ new Map();
  const absorbes = /* @__PURE__ */ new Set();
  for (const indices of parNom.values()) {
    if (indices.length !== 2) continue;
    const [i, j] = indices;
    if (marques[i] && marques[j]) continue;
    if (marques[i] !== marques[j]) {
      const base = marques[i] ? j : i, ameliore = marques[i] ? i : j;
      jumeau.set(base, { index: ameliore, incertain: false });
      absorbes.add(ameliore);
    } else if (colonneAvecAmeliores) {
      jumeau.set(i, { index: j, incertain: true });
      absorbes.add(j);
    }
  }
  return options.flatMap((o2, i) => {
    if (absorbes.has(i)) return [];
    const j = jumeau.get(i);
    return [j ? { option: o2, ameliore: options[j.index], ...j.incertain ? { incertain: true } : {} } : { option: o2 }];
  });
}
function typeEstAmeliore(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  return MOT_TYPE_AMELIORE.test(def?.itemTypeDisplayName ?? "");
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

// tests/logique/perks-ameliores.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var armes = JSON.parse(fs.readFileSync("tests/logique/fixtures/perks-diagnostics-reels.json", "utf-8")).armes;
var arme = (cle) => armes.find((a) => a.cle === cle);
var est = (o2) => MOT_TYPE_AMELIORE.test(o2.type);
var paires = (c) => apparierPerksAmeliores(c.options, est);
var col = (a, libelle) => a.colonnes.find((c) => c.libelle === libelle);
var A = arme("A");
var attendu = [["Colonne 2", 22, 11, 11], ["Colonne 3", 26, 13, 13], ["Colonne 4", 14, 7, 7], ["Colonne 5", 14, 7, 7], ["Colonne 9", 2, 1, 1], ["Mods utilisables", 35, 20, 15]];
for (const [lib, nbOptions, nbItems, nbPaires] of attendu) {
  const c = col(A, lib), r = paires(c);
  ok(`Confiance A, ${lib} : ${nbOptions} options lues \u2192 ${nbItems} \xE9l\xE9ments affich\xE9s dont ${nbPaires} paire(s) base + am\xE9lior\xE9`, c.options.length === nbOptions && r.length === nbItems && r.filter((x) => x.ameliore).length === nbPaires, [c.options.length, r.length, r.filter((x) => x.ameliore).length]);
}
var toutes = ["Colonne 2", "Colonne 3", "Colonne 4", "Colonne 5", "Colonne 9", "Mods utilisables"].flatMap((l) => paires(col(A, l)));
ok("Confiance A : 54 paires au total (53 normales + 1 reconnue par la position) ; toutes les paires ont une base NON am\xE9lior\xE9e et un am\xE9lior\xE9 typ\xE9 \xAB am\xE9lior\xE9 \xBB, sauf l'unique cas non confirm\xE9", toutes.filter((x) => x.ameliore).length === 54 && toutes.filter((x) => x.ameliore && !x.incertain).every((x) => !est(x.option) && est(x.ameliore)) && toutes.filter((x) => x.incertain).length === 1);
var cas = toutes.find((x) => x.incertain);
ok("le SEUL cas ambigu est \xAB Chargeur abandonn\xE9 \xBB : la version de base est celle qui vient en premier (hash 4134353779), l'am\xE9lior\xE9e la seconde (hash 3678323611), signal\xE9e \xAB incertain \xBB", cas.option.nom === "Chargeur abandonn\xE9" && cas.option.hash === 4134353779 && cas.ameliore.hash === 3678323611, cas);
ok("une paire normale est correcte : \xAB Frein t\xEAte-de-fl\xE8che \xBB = base 839105230 + am\xE9lior\xE9e 3048246338", (() => {
  const x = paires(col(A, "Colonne 2")).find((y) => y.option.nom === "Frein t\xEAte-de-fl\xE8che");
  return x.option.hash === 839105230 && x.ameliore?.hash === 3048246338 && !x.incertain;
})());
var mods = paires(col(A, "Mods utilisables"));
ok("les modificateurs am\xE9lior\xE9s SANS base (\xAB Stabilit\xE9 am\xE9lior\xE9e \xBB, \xAB Port\xE9e am\xE9lior\xE9e \xBB\u2026) restent des options ordinaires, non appari\xE9es", mods.filter((x) => !x.ameliore && est(x.option)).length === 4 && mods.some((x) => x.option.nom === "Stabilit\xE9 am\xE9lior\xE9e" && !x.ameliore), mods.filter((x) => est(x.option)).map((x) => x.option.nom));
var intrinseque = paires(col(A, "Colonne 1"));
var paliers = paires(col(A, "Colonne 13"));
ok("l'armature (colonne 1) et les \xAB Am\xE9lioration de palier \xBB (colonne 13, masqu\xE9e) ne produisent aucune paire", intrinseque.every((x) => !x.ameliore) && paliers.every((x) => !x.ameliore) && paliers.length === 4);
var nbMasquees = A.colonnes.filter((c) => c.masquee).length;
ok(`m\xEAme si on appliquait l'appariement aux ${nbMasquees} colonnes MASQU\xC9ES de Confiance A (rev\xEAtements, paliers de masterwork\u2026), rien ne serait fusionn\xE9 \xE0 tort : leurs doublons ne sont pas des jumeaux (aucun type \xAB am\xE9lior\xE9 \xBB dans ces colonnes)`, A.colonnes.filter((c) => c.masquee).every((c) => paires(c).length === c.options.length), A.colonnes.filter((c) => c.masquee).map((c) => [c.libelle, c.options.length, paires(c).length]));
for (const cle of ["B", "DD"]) {
  const a = arme(cle), visibles = a.colonnes.filter((c) => !c.masquee);
  ok(`${a.nom} (${a.hash}) : une seule option par colonne de perks et aucune am\xE9lioration : AUCUNE paire dans les ${visibles.length} colonnes visibles`, visibles.every((c) => paires(c).every((x) => !x.ameliore)) && visibles.flatMap((c) => c.options).filter(est).length === 0);
}
var GF = arme("GF");
ok("Grande Faucheuse (temps perdu) : ses colonnes de perks n'ont qu'une option ; seuls la colonne d'origine (1 paire) et les mods (15 paires) en ont ; les colonnes de fabrication (am\xE9lior\xE9s sans base) ne sont pas appari\xE9es", paires(col(GF, "Colonne 9")).filter((x) => x.ameliore).length === 1 && paires(col(GF, "Mods utilisables")).filter((x) => x.ameliore).length === 15 && GF.colonnes.filter((c) => /^Colonne (2|3|4|5)$/.test(c.libelle)).every((c) => paires(c).every((x) => !x.ameliore)) && paires(col(GF, "Colonne 13")).every((x) => !x.ameliore));
var typesVus = [...new Set(armes.flatMap((a) => a.colonnes.flatMap((c) => c.options.map((o2) => o2.type))))].sort();
ok("la reconnaissance par le TYPE affich\xE9 : exactement cinq types d'objets \xAB am\xE9lior\xE9s \xBB existent dans les donn\xE9es r\xE9elles (Attribut, Canon, Chargeur, Mod d'arme, Particularit\xE9 d'origine), et aucun autre type ne l'est", JSON.stringify(typesVus.filter((t) => MOT_TYPE_AMELIORE.test(t))) === JSON.stringify(["Attribut am\xE9lior\xE9", "Canon am\xE9lior\xE9", "Chargeur am\xE9lior\xE9", "Mod d'arme am\xE9lior\xE9", "Particularit\xE9 d'origine am\xE9lior\xE9e"]) && !typesVus.filter((t) => !/am[eé]lior/i.test(t)).some((t) => MOT_TYPE_AMELIORE.test(t)), typesVus);
var o = (nom, hash, am = false) => ({ nom, hash, am });
var f = (l) => apparierPerksAmeliores(l, (x) => x.am);
var r1 = f([o("Coup rapide", 1), o("Coup rapide", 2, true), o("Hors-la-loi", 3)]);
ok("cas simple : la paire est fusionn\xE9e sur la base, le perk seul reste seul, l'ordre est celui des bases", r1.length === 2 && r1[0].option.hash === 1 && r1[0].ameliore?.hash === 2 && !r1[1].ameliore, r1);
var r2 = f([o("Coup rapide", 2, true), o("Coup rapide", 1)]);
ok("m\xEAme si l'am\xE9lior\xE9 est list\xE9 AVANT sa base, les r\xF4les sont corrects (base = non am\xE9lior\xE9)", r2.length === 1 && r2[0].option.hash === 1 && r2[0].ameliore?.hash === 2 && !r2[0].incertain, r2);
ok("deux \xAB am\xE9lior\xE9s \xBB de m\xEAme nom ne sont PAS fusionn\xE9s ; trois homonymes non plus", f([o("X", 1, true), o("X", 2, true)]).length === 2 && f([o("X", 1), o("X", 2, true), o("X", 3)]).length === 3);
var r3 = f([o("Munitions", 1), o("Munitions", 2)]);
ok("GARDE : deux homonymes sans AUCUN am\xE9lior\xE9 dans la colonne ne sont PAS fusionn\xE9s (rien ne prouve qu'ils soient jumeaux)", r3.length === 2 && r3.every((x) => !x.ameliore), r3);
var r4 = f([o("Autre", 5, true), o("Munitions", 1), o("Munitions", 2)]);
ok("REPLI PAR LA POSITION : m\xEAme deux homonymes sans type \xAB am\xE9lior\xE9 \xBB, DANS une colonne qui contient des am\xE9lior\xE9s : fusionn\xE9s, le second est l'am\xE9lior\xE9, marqu\xE9 \xAB incertain \xBB", r4.length === 2 && r4[1].option.hash === 1 && r4[1].ameliore?.hash === 2 && r4[1].incertain === true, r4);
var r5 = apparierPerksAmeliores([{ nom: "Fr\xE9n\xE9sie", hash: 1 }, { nom: "FRENESIE", hash: 2 }], (x) => x.hash === 2);
ok("les noms sont compar\xE9s sans accents ni majuscules", r5.length === 1 && r5[0].ameliore?.hash === 2, r5);
ok("une liste vide ou sans doublon est rendue telle quelle (un \xE9l\xE9ment par option, sans paire)", f([]).length === 0 && f([o("A", 1), o("B", 2), o("C", 3, true)]).every((x) => !x.ameliore) && f([o("A", 1), o("B", 2), o("C", 3, true)]).length === 3);
var { db } = creerFausseDb({ [T_OBJET]: { 1: { displayProperties: { name: "Canon" }, itemTypeDisplayName: "Canon am\xE9lior\xE9" }, 2: { displayProperties: { name: "Canon" }, itemTypeDisplayName: "Canon" }, 3: { displayProperties: { name: "Trait" }, itemTypeDisplayName: "Enhanced Trait" }, 4: { displayProperties: { name: "Sans type" } } } });
ok("`typeEstAmeliore` lit le type affich\xE9 dans le Manifest : \xAB Canon am\xE9lior\xE9 \xBB oui, \xAB Canon \xBB non, \xAB Enhanced Trait \xBB oui, type absent ou objet inconnu non", typeEstAmeliore(db, 1) && !typeEstAmeliore(db, 2) && typeEstAmeliore(db, 3) && !typeEstAmeliore(db, 4) && !typeEstAmeliore(db, 99));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
