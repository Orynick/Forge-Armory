import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// src/lib/bungie/plugsDisponibles.ts
function extrairePlugsDisponibles(brut) {
  if (typeof brut !== "object" || brut === null) return void 0;
  const plugs = brut.plugs;
  if (typeof plugs !== "object" || plugs === null) return void 0;
  const sortie = {};
  for (const [cle, liste] of Object.entries(plugs)) {
    const index = Number(cle);
    if (!Number.isInteger(index) || index < 0 || !Array.isArray(liste)) continue;
    const hashes = [...new Set(liste.map((p) => p?.plugItemHash).filter((h) => typeof h === "number" && Number.isInteger(h) && h > 0))];
    if (hashes.length > 0) sortie[index] = hashes;
  }
  return sortie;
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
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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

// src/lib/forge/faconnee.ts
var PLUG_ARME_FACONNEE = 4029346515;
var NOMS_PLUG_FACONNEE = ["arme faconnee", "crafted weapon"];
var memoire2 = /* @__PURE__ */ new WeakMap();
function plugFaconneParNom(db2, hash) {
  let m = memoire2.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoire2.set(db2, m);
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

// src/lib/forge/diagnosticPlugs.ts
var nomDe = (db2, hash) => obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash)?.displayProperties?.name || `(sans nom)`;
function obtenirDiagnosticPlugsExemplaire(db2, piece2) {
  const dispo2 = piece2.plugsDisponiblesParColonne;
  const lignes = [`Arme : ${piece2.nom ?? "?"} (hash ${piece2.itemHash}) \u2014 exemplaire ${piece2.itemInstanceId ?? "?"} \u2014 ${piece2.origine ?? "lieu inconnu"}${piece2.equipe ? " (\xE9quip\xE9e)" : ""}`];
  lignes.push(diagnosticSaisonObjet(db2, piece2.itemHash));
  lignes.push(`Arme fa\xE7onn\xE9e : ${estFaconnee(db2, piece2.perkHashes) ? "OUI (perk \xE9quip\xE9 \xAB Arme fa\xE7onn\xE9e \xBB)" : "non"}`);
  lignes.push(dispo2 === void 0 ? "Perks disponibles sur l'exemplaire : NON LUS (le composant 310 de Bungie n'a pas renvoy\xE9 de donn\xE9es pour cet exemplaire, ou l'inventaire a \xE9t\xE9 charg\xE9 avant la mise \xE0 jour : rechargez-le)." : `Perks disponibles sur l'exemplaire : lus pour ${Object.keys(dispo2).length} prise(s).`);
  const equipes = new Map((piece2.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
  const prises = [.../* @__PURE__ */ new Set([...equipes.keys(), ...Object.keys(dispo2 ?? {}).map(Number)])].sort((a, b) => a - b);
  for (const i of prises) {
    const eq = equipes.get(i);
    const liste = dispo2?.[i] ?? [];
    lignes.push(`Prise ${i} : \xE9quip\xE9 = ${eq ? `${nomDe(db2, eq)} (${eq})` : "\u2014"} | disponibles (${liste.length}) = ${liste.length ? liste.map((h) => `${nomDe(db2, h)} (${h})${h === eq ? " [\xE9quip\xE9]" : ""}`).join(", ") : "\u2014"}`);
  }
  return lignes.join("\n");
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

// tests/logique/plugs-disponibles.test.ts
import fs from "node:fs";
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var plug = (h, canInsert = true) => ({ plugItemHash: h, canInsert, enabled: true });
var bien = extrairePlugsDisponibles({ plugs: { "1": [plug(6901), plug(6903)], "2": [plug(6912)], "4": [plug(6931), plug(6933, false)] } });
ok("forme de l'API : table index de prise \u2192 hashes ; un plug qu'on ne peut pas ins\xE9rer maintenant (canInsert faux) reste DISPONIBLE sur l'exemplaire", JSON.stringify(bien) === JSON.stringify({ 1: [6901, 6903], 2: [6912], 4: [6931, 6933] }), bien);
ok("les doublons sont d\xE9doublonn\xE9s, et une prise sans aucun plug valide est omise", JSON.stringify(extrairePlugsDisponibles({ plugs: { "1": [plug(5), plug(5), plug(6)], "2": [], "3": [{ plugItemHash: 0 }, { plugItemHash: "x" }, null, {}] } })) === JSON.stringify({ 1: [5, 6] }));
ok("cl\xE9s non num\xE9riques ou n\xE9gatives ignor\xE9es, valeurs qui ne sont pas des listes ignor\xE9es", JSON.stringify(extrairePlugsDisponibles({ plugs: { "a": [plug(1)], "-2": [plug(2)], "3": "pas une liste", "5": [plug(9)] } })) === JSON.stringify({ 5: [9] }));
ok("donn\xE9e ABSENTE ou mal form\xE9e : \xAB on ne sait pas \xBB (undefined), jamais \xAB aucun \xBB : undefined, null, texte, nombre, objet sans plugs, plugs qui n'est pas un objet", [void 0, null, "x", 7, {}, { plugs: null }, { plugs: "x" }].every((v) => extrairePlugsDisponibles(v) === void 0));
ok("un exemplaire dont `plugs` est vide : table VIDE (on SAIT qu'il n'a aucune alternative), diff\xE9rente de \xAB non lu \xBB", JSON.stringify(extrairePlugsDisponibles({ plugs: {} })) === "{}");
var item = (hash, reel = false, amelioreHash, amelioreReel = false) => ({ option: { hash, equipeEnJeu: reel }, ...amelioreHash ? { ameliore: { hash: amelioreHash, equipeEnJeu: amelioreReel } } : {} });
var dispo = { 1: [6901, 6903], 2: [6912], 4: [6931] };
ok("R\xC9EL : un perk du roll r\xE9el est \xAB reel \xBB, qu'il soit disponible ou non dans la liste", niveauDePerk(item(6901, true), 1, dispo) === "reel" && niveauDePerk(item(6999, true), 1, dispo) === "reel");
ok("DISPONIBLE : un perk dans la liste de la prise, non \xE9quip\xE9, est \xAB disponible \xBB (contour gris clair)", niveauDePerk(item(6903), 1, dispo) === "disponible");
ok("POSSIBLE : un perk du mod\xE8le absent de la liste de CETTE prise est \xAB possible \xBB (nom gris\xE9), m\xEAme s'il est disponible dans une AUTRE prise", niveauDePerk(item(7e3), 1, dispo) === "possible" && niveauDePerk(item(6912), 1, dispo) === "possible" && niveauDePerk(item(6903), 3, dispo) === "possible");
ok("SIMUL\xC9 prime sur tout : m\xEAme un perk possible ou disponible devient \xAB simule \xBB une fois choisi ; le roll r\xE9el mis de c\xF4t\xE9 reste \xAB reel \xBB", niveauDePerk(item(7e3), 1, dispo, { choisi: 7e3, effectif: 7e3 }) === "simule" && niveauDePerk(item(6903), 1, dispo, { choisi: 6903, effectif: 6903 }) === "simule" && niveauDePerk(item(6901, true), 1, dispo, { choisi: 7e3, effectif: 7e3 }) === "reel");
ok("PAIRE : disponible si l'UNE des deux versions l'est (base OU version am\xE9lior\xE9e) ; r\xE9el si l'une des deux est \xE9quip\xE9e", niveauDePerk(item(6911, false, 6912), 2, dispo) === "disponible" && niveauDePerk(item(6911, false, 6912), 3, dispo) === "possible" && niveauDePerk(item(6911, false, 6912, true), 2, dispo) === "reel");
ok("CAS R\xC9ALISTE : un perk simul\xE9 que l'utilisateur \xE9quipe ENSUITE pour de bon est \xE0 la fois r\xE9el et choisi : le niveau reste \xAB simule \xBB (priorit\xE9 document\xE9e : simul\xE9, puis r\xE9el, puis disponible, puis possible) ; le \u2713 du roll r\xE9el reste affich\xE9 par l'interface, car il vient du roll et non du niveau", niveauDePerk(item(6901, true), 1, dispo, { choisi: 6901, effectif: 6901 }) === "simule");
ok("DONN\xC9E NON LUE (disponibilit\xE9s absentes) : \xAB inconnu \xBB, jamais \xAB possible \xBB : on n'affirme rien et on ne grise rien ; le roll r\xE9el et le simul\xE9 restent reconnus", niveauDePerk(item(6903), 1, void 0) === "inconnu" && niveauDePerk(item(6901, true), 1, void 0) === "reel" && niveauDePerk(item(6903), 1, void 0, { choisi: 6903, effectif: 6903 }) === "simule");
ok("table VIDE (aucune alternative sur l'exemplaire) : tout perk non \xE9quip\xE9 est \xAB possible \xBB", niveauDePerk(item(6903), 1, {}) === "possible" && niveauDePerk(item(6901, true), 1, {}) === "reel");
var reelles = JSON.parse(fs.readFileSync("tests/logique/fixtures/plugs-diagnostics-reels.json", "utf-8")).armes;
var dispoDe = (a) => Object.fromEntries(a.prises.filter((p) => p.disponibles.length > 0).map((p) => [p.prise, p.disponibles]));
var attendusOk = true;
var nbReel = 0;
var nbDispo = 0;
var nbPossible = 0;
for (const a of reelles) {
  const d = dispoDe(a);
  for (const p of a.prises) {
    if (niveauDePerk(item(p.equipe, true), p.prise, d) !== "reel") attendusOk = false;
    else nbReel++;
    for (const h of p.disponibles.filter((x) => x !== p.equipe)) {
      if (niveauDePerk(item(h), p.prise, d) !== "disponible") attendusOk = false;
      else nbDispo++;
    }
    if (niveauDePerk(item(999999999), p.prise, d) !== "possible") attendusOk = false;
    else nbPossible++;
  }
}
ok(`DONN\xC9ES R\xC9ELLES (${reelles.map((a) => a.nom).join(" et ")}) : sur ${nbReel} prises, le perk \xE9quip\xE9 est toujours \xAB reel \xBB, les ${nbDispo} autres perks list\xE9s sont \xAB disponible \xBB et un perk \xE9tranger \xE0 la liste est \xAB possible \xBB (${nbPossible} v\xE9rifications)`, attendusOk && nbReel === reelles.reduce((n, x) => n + x.prises.length, 0) && nbReel === 26 && nbDispo > 40, [nbReel, nbDispo, nbPossible]);
var conf = reelles.find((a) => a.hash === 810474118);
var mida = reelles.find((a) => a.hash === 3946054154);
ok("DONN\xC9ES R\xC9ELLES : les colonnes de TRAITS de la Confiance (prises 3 et 4) ont de vraies alternatives (3 perks disponibles chacune : Luciole, Hors-la-loi, Vis\xE9e rapide\u2026) : le contour gris clair aura des perks \xE0 montrer", conf.prises.find((p) => p.prise === 3).disponibles.length === 3 && conf.prises.find((p) => p.prise === 4).disponibles.length === 3 && niveauDePerk(item(1347741687), 3, dispoDe(conf)) === "disponible" && niveauDePerk(item(1183436451, true), 3, dispoDe(conf)) === "reel");
var p10 = conf.prises.find((p) => p.prise === 10);
ok("CAS PARTICULIER R\xC9EL (prise 10 de la Confiance, l'ornement) : le perk \xE9quip\xE9 (Foi aveugle) n'est PAS dans sa propre liste (qui ne contient que \xAB Confiance \xBB) ; il reste \xAB reel \xBB et le perk list\xE9 reste \xAB disponible \xBB : l'absence de l'\xE9quip\xE9 de la liste ne perturbe rien", !p10.disponibles.includes(p10.equipe) && niveauDePerk(item(p10.equipe, true), 10, dispoDe(conf)) === "reel" && niveauDePerk(item(3364068341), 10, dispoDe(conf)) === "disponible");
ok("DONN\xC9ES R\xC9ELLES : les prises sans alternative (armature, compte-frags, paliers : liste vide) ne produisent que le perk \xE9quip\xE9 \xAB reel \xBB ; l'Outil polyvalent MIDA porte bien l'armature \xAB Synergie MIDA \xBB (prise 0, hash 2213377102) dont d\xE9pend la nouvelle r\xE8gle d'antichampion", conf.prises.find((p) => p.prise === 0).disponibles.length === 0 && mida.prises.find((p) => p.prise === 0).equipe === 2213377102 && !(0 in dispoDe(mida)));
var { db } = creerFausseDb({ [T_OBJET]: { 6901: { displayProperties: { name: "Canon X" } }, 6903: { displayProperties: { name: "Canon Y" } }, 6912: { displayProperties: { name: "Chargeur X" } } } });
var piece = { itemHash: 5010, itemInstanceId: "w1", nom: "Fusil \xE0 paliers", origine: "titan", equipe: true, perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }], plugsDisponiblesParColonne: { 1: [6901, 6903] } };
var d1 = obtenirDiagnosticPlugsExemplaire(db, piece);
ok("diagnostic : donne l'arme, le lieu, le perk \xE9quip\xE9 et les perks disponibles de chaque prise, nomm\xE9s, en marquant l'\xE9quip\xE9", /Fusil à paliers.*w1.*titan.*équipée/.test(d1) && /Prise 1 : équipé = Canon X \(6901\) \| disponibles \(2\) = Canon X \(6901\) \[équipé\], Canon Y \(6903\)/.test(d1) && /Prise 2 : équipé = Chargeur X \(6912\) \| disponibles \(0\) = —/.test(d1), d1);
ok("diagnostic : sans donn\xE9e de disponibilit\xE9, il le dit clairement (NON LUS) au lieu d'inventer", /NON LUS/.test(obtenirDiagnosticPlugsExemplaire(db, { ...piece, plugsDisponiblesParColonne: void 0 })));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
