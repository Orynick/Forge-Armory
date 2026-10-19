import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// src/lib/manifest/demarrage.ts
var LANGUES = ["fr", "en"];
function decider(etat) {
  if (!etat) return { action: "rien" };
  if (!etat.fr || etat.fr === "absent") return { action: "rien" };
  const presentes = LANGUES.filter((l) => etat[l] && etat[l] !== "absent");
  if (presentes.some((l) => etat[l] === "perime")) return { action: "charger", langues: presentes, raison: "perime" };
  if (etat.fr === "a-jour" && etat.en === "a-jour") return { action: "charger", langues: ["fr", "en"], raison: "a-jour" };
  return { action: "rien" };
}
async function demarrerManifests(dep) {
  const decision = decider(await dep.lireEtat());
  if (decision.action === "rien") return decision;
  if (decision.raison === "a-jour") {
    dep.annoncer(null);
    return { ...decision, reussi: await dep.charger(decision.langues) };
  }
  const noms = decision.langues.map((l) => l === "fr" ? "fran\xE7ais" : "anglais").join(" et ");
  dep.annoncer(`\u{1F504} Bungie a publi\xE9 une nouvelle version du Manifest : mise \xE0 jour automatique en cours (${noms}, environ 100 Mo par langue)\u2026`);
  const reussi = await dep.charger(decision.langues);
  dep.annoncer(
    reussi ? "\u2705 Manifest mis \xE0 jour automatiquement (nouvelle version publi\xE9e par Bungie)." : "\u26A0\uFE0F La mise \xE0 jour automatique du Manifest a \xE9chou\xE9 : le bouton \xAB Charger le Manifest \xBB permet de r\xE9essayer."
  );
  return { ...decision, reussi };
}

// src/lib/bungie/config.ts
var BUNGIE_ROOT = "https://www.bungie.net";
var BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
var bungieConfig = {
  apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
  clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
  redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
};

// factice:idb
var indisponible = () => {
  throw new Error("module indisponible dans les tests");
};
var openDB = indisponible;

// src/lib/manifest/db.ts
var DB_NAME = "d2-build-analyzer";
var DB_VERSION = 2;
var dbPromise = null;
function ouvrirDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("manifest")) db.createObjectStore("manifest");
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("builds")) db.createObjectStore("builds", { keyPath: "id" });
        if (!db.objectStoreNames.contains("inventaireCache")) db.createObjectStore("inventaireCache");
        if (!db.objectStoreNames.contains("searchIndex")) db.createObjectStore("searchIndex");
      }
    });
  }
  return dbPromise;
}

// src/lib/manifest/download.ts
async function recupererMeta() {
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Manifest/`, {
    headers: { "X-API-Key": bungieConfig.apiKey }
  });
  if (!reponse.ok) {
    throw new Error(
      reponse.status === 401 ? "Cl\xE9 API Bungie refus\xE9e (401). V\xE9rifiez VITE_BUNGIE_API_KEY." : `Impossible de r\xE9cup\xE9rer les informations du Manifest (${reponse.status}).`
    );
  }
  const data = await reponse.json();
  if (!data.Response?.version || !data.Response?.mobileWorldContentPaths) {
    throw new Error("R\xE9ponse Bungie invalide : informations du Manifest absentes.");
  }
  return data.Response;
}
var VERSION_FORMAT_CACHE = "v2";
async function manifestsEnCacheAJour(langues = ["fr", "en"], dependances = DEPENDANCES_CACHE_REELLES) {
  const etat = await etatCachesManifests(langues, dependances);
  return etat !== null && langues.every((l) => etat[l] === "a-jour");
}
var DEPENDANCES_CACHE_REELLES = {
  recupererMeta,
  ouvrirDB
};
async function etatCachesManifests(langues = ["fr", "en"], dependances = DEPENDANCES_CACHE_REELLES) {
  try {
    const meta = await dependances.recupererMeta();
    const db = await dependances.ouvrirDB();
    const etat = {};
    for (const langue of langues) {
      const versionCache = await db.get("meta", `manifestVersion_${langue}_${VERSION_FORMAT_CACHE}`);
      const cle = await db.getKey("manifest", `sqlite_${langue}_${VERSION_FORMAT_CACHE}`);
      etat[langue] = cle === void 0 ? "absent" : versionCache === meta.version ? "a-jour" : "perime";
    }
    return etat;
  } catch {
    return null;
  }
}
async function simulerManifestPerime(langues = ["fr", "en"], dependances = DEPENDANCES_CACHE_REELLES) {
  const db = await dependances.ouvrirDB();
  const marquees2 = [];
  for (const langue of langues) {
    if (await db.getKey("manifest", `sqlite_${langue}_${VERSION_FORMAT_CACHE}`) === void 0) continue;
    await db.put("meta", "version-simulee-pour-test", `manifestVersion_${langue}_${VERSION_FORMAT_CACHE}`);
    marquees2.push(langue);
  }
  return marquees2;
}

// tests/logique/demarrage-manifest.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var d = (fr, en) => decider({ fr, en });
var charge = (x) => x.action === "charger" ? `${x.langues.join("+")}/${x.raison}` : "rien";
ok("FR ET EN \xE0 jour : chargement automatique des deux depuis le cache, sans rien annoncer (comportement de la 0.2.2 conserv\xE9)", charge(d("a-jour", "a-jour")) === "fr+en/a-jour");
ok("FR p\xE9rim\xE9, EN \xE0 jour : le fran\xE7ais est ret\xE9l\xE9charg\xE9, puis les deux sont charg\xE9s", charge(d("perime", "a-jour")) === "fr+en/perime");
ok("FR \xE0 jour, EN p\xE9rim\xE9 : l'anglais est ret\xE9l\xE9charg\xE9, puis les deux sont charg\xE9s", charge(d("a-jour", "perime")) === "fr+en/perime");
ok("FR ET EN p\xE9rim\xE9s : les deux sont ret\xE9l\xE9charg\xE9s", charge(d("perime", "perime")) === "fr+en/perime");
ok("\xAB uniquement dans ce cas \xBB : FR p\xE9rim\xE9 et EN ABSENT : seul le fran\xE7ais est ret\xE9l\xE9charg\xE9, l'anglais n'est PAS t\xE9l\xE9charg\xE9 en douce", charge(d("perime", "absent")) === "fr/perime", charge(d("perime", "absent")));
ok("FR \xE0 jour et EN absent : rien ne se lance (rien n'est p\xE9rim\xE9 ; le bouton manuel reste), comme avant", charge(d("a-jour", "absent")) === "rien");
ok("FR ABSENT (premier lancement) : rien ne se lance seul, quelle que soit l'anglais (le tout premier t\xE9l\xE9chargement reste un clic)", [d("absent", "absent"), d("absent", "a-jour"), d("absent", "perime"), d(void 0, "perime")].every((x) => charge(x) === "rien"));
ok("\xE9tat inconnu (hors ligne, Bungie indisponible : null) ou vide : rien", charge(decider(null)) === "rien" && charge(decider(void 0)) === "rien" && charge(decider({})) === "rien");
var appels = [];
var fabrique = (etat, reussite = true) => ({ lireEtat: async () => {
  appels.push("etat");
  return etat;
}, charger: async (l) => {
  appels.push("charger:" + l.join("+"));
  return reussite;
}, annoncer: (m2) => {
  appels.push("msg:" + (m2 === null ? "null" : [...m2][0]));
} });
appels.length = 0;
var r1 = await demarrerManifests(fabrique({ fr: "perime", en: "absent" }));
ok("Manifest p\xE9rim\xE9 : annonce \u{1F504} AVANT de t\xE9l\xE9charger, t\xE9l\xE9charge UNE fois (fran\xE7ais seul), puis annonce \u2705", appels.join("|") === "etat|msg:\u{1F504}|charger:fr|msg:\u2705" && r1.reussi === true, appels);
appels.length = 0;
var m = [];
await demarrerManifests({ ...fabrique({ fr: "perime", en: "perime" }), annoncer: (x) => {
  if (x) m.push(x);
} });
ok("l'annonce nomme les langues et la taille (\xAB fran\xE7ais et anglais \xBB, \xAB 100 Mo par langue \xBB)", /français et anglais/.test(m[0]) && /100 Mo par langue/.test(m[0]), m);
appels.length = 0;
var r2 = await demarrerManifests(fabrique({ fr: "perime", en: "a-jour" }, false));
ok("\xC9CHEC du t\xE9l\xE9chargement : message \u26A0\uFE0F qui renvoie au bouton manuel, aucun second essai automatique", appels.join("|") === "etat|msg:\u{1F504}|charger:fr+en|msg:\u26A0" && r2.reussi === false, appels);
appels.length = 0;
await demarrerManifests(fabrique({ fr: "a-jour", en: "a-jour" }));
ok("tout \xE0 jour : message effac\xE9 puis chargement des deux ; AUCUNE annonce de mise \xE0 jour", appels.join("|") === "etat|msg:null|charger:fr+en", appels);
appels.length = 0;
await demarrerManifests(fabrique({ fr: "absent", en: "absent" }));
await demarrerManifests(fabrique(null));
await demarrerManifests(fabrique({ fr: "a-jour", en: "absent" }));
ok("premier lancement, \xE9tat inconnu, ou rien de p\xE9rim\xE9 : AUCUN chargement et AUCUN message (trois d\xE9marrages de suite)", !appels.some((a) => a.startsWith("charger") || a.startsWith("msg")) && appels.filter((a) => a === "etat").length === 3, appels);
var stockage = (meta, manifest, versionBungie = "V2", pannes = {}) => {
  const ecritures = [];
  const magasin = (n) => n === "meta" ? meta : manifest;
  return { ecritures, recupererMeta: async () => {
    if (pannes.meta) throw new Error("hors ligne");
    return { version: versionBungie };
  }, ouvrirDB: async () => {
    if (pannes.db) throw new Error("IndexedDB inaccessible");
    return { get: async (n, k) => magasin(n)[k], getKey: async (n, k) => magasin(n)[k] === void 0 ? void 0 : k, put: async (n, v, k) => {
      ecritures.push(`${n}:${k}`);
      magasin(n)[k] = v;
    } };
  } };
};
var K = (l) => ({ v: `manifestVersion_${l}_v2`, s: `sqlite_${l}_v2` });
var dep1 = stockage({ [K("fr").v]: "V2", [K("en").v]: "V1", [K("de").v]: "V2", [K("es").v]: void 0 }, { [K("fr").s]: 1, [K("en").s]: 1, [K("es").s]: 1 });
var etat1 = await etatCachesManifests(["fr", "en", "de", "es", "it"], dep1);
ok("\xE9tat de chaque langue : \xE0 jour (m\xEAme version), p\xE9rim\xE9 (version diff\xE9rente), absent (aucun fichier, m\xEAme si une version tra\xEEne), p\xE9rim\xE9 (fichier pr\xE9sent mais version inconnue), absent (rien du tout)", JSON.stringify(etat1) === JSON.stringify({ fr: "a-jour", en: "perime", de: "absent", es: "perime", it: "absent" }), etat1);
ok("la lecture n'\xE9crit RIEN : ni version, ni fichier", dep1.ecritures.length === 0, dep1.ecritures);
ok("hors ligne (version Bungie illisible) ou base locale inaccessible : l'\xE9tat est INCONNU (null), pas \xAB p\xE9rim\xE9 \xBB : on ne t\xE9l\xE9charge pas sur un doute", await etatCachesManifests(["fr"], stockage({}, {}, "V2", { meta: true })) === null && await etatCachesManifests(["fr"], stockage({}, {}, "V2", { db: true })) === null);
ok("`manifestsEnCacheAJour` (ancienne fonction) garde son sens : vrai seulement si TOUTES les langues sont \xE0 jour", await manifestsEnCacheAJour(["fr"], dep1) === true && await manifestsEnCacheAJour(["fr", "en"], dep1) === false && await manifestsEnCacheAJour(["de"], dep1) === false && await manifestsEnCacheAJour(["fr"], stockage({}, {}, "V2", { meta: true })) === false);
var dep2 = stockage({ [K("fr").v]: "V2", [K("en").v]: "V2" }, { [K("fr").s]: 1 });
var marquees = await simulerManifestPerime(["fr", "en"], dep2);
var etat2 = await etatCachesManifests(["fr", "en"], dep2);
ok("simulation : seule la langue D\xC9J\xC0 en cache est marqu\xE9e (fran\xE7ais) ; celle sans fichier est laiss\xE9e intacte", JSON.stringify(marquees) === JSON.stringify(["fr"]) && dep2.ecritures.length === 1 && etat2?.fr === "perime" && etat2?.en === "absent", [marquees, dep2.ecritures, etat2]);
ok("apr\xE8s la simulation, le d\xE9marrage ret\xE9l\xE9charge exactement ce qui est \xAB p\xE9rim\xE9 \xBB : le fran\xE7ais seul, jamais l'anglais absent", charge(decider(etat2)) === "fr/perime", etat2);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
