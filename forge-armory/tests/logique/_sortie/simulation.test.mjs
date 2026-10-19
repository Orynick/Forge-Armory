import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// src/lib/forge/simulation.ts
var CLE_STOCKAGE_SIMULATIONS = "forge-armory.forge.simulations.v1";
var SIMULATIONS_VIDES = () => ({ version: 1, armes: {} });
function stockageNavigateur() {
  try {
    const s = window.localStorage;
    s.getItem(CLE_STOCKAGE_SIMULATIONS);
    return s;
  } catch {
    const m = /* @__PURE__ */ new Map();
    return { getItem: (c) => m.get(c) ?? null, setItem: (c, v) => void m.set(c, v) };
  }
}
var entierPositif = (x) => typeof x === "number" && Number.isInteger(x) && x >= 0;
function lireSimulations(stockage) {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE_SIMULATIONS);
    if (!brut) return SIMULATIONS_VIDES();
    const o = JSON.parse(brut);
    if (o?.version !== 1 || typeof o.armes !== "object" || o.armes === null) return SIMULATIONS_VIDES();
    const sortie = SIMULATIONS_VIDES();
    for (const [instance, colonnes] of Object.entries(o.armes)) {
      if (typeof colonnes !== "object" || colonnes === null) continue;
      const arme = {};
      for (const [socket, v] of Object.entries(colonnes)) {
        const idx = Number(socket);
        if (entierPositif(idx) && entierPositif(v?.c) && entierPositif(v?.e)) arme[idx] = { choisi: v.c, effectif: v.e };
      }
      if (Object.keys(arme).length > 0) sortie.armes[instance] = arme;
    }
    return sortie;
  } catch {
    return SIMULATIONS_VIDES();
  }
}
function ecrireSimulations(stockage, s) {
  try {
    const compact = {};
    for (const [instance, arme] of Object.entries(s.armes)) compact[instance] = Object.fromEntries(Object.entries(arme).map(([k, v]) => [k, { c: v.choisi, e: v.effectif }]));
    stockage.setItem(CLE_STOCKAGE_SIMULATIONS, JSON.stringify({ version: 1, armes: compact }));
    return true;
  } catch {
    return false;
  }
}
function choisir(s, instance, socketIndex, choix) {
  return { version: 1, armes: { ...s.armes, [instance]: { ...s.armes[instance] ?? {}, [socketIndex]: choix } } };
}
function retirerColonne(s, instance, socketIndex) {
  const arme = { ...s.armes[instance] ?? {} };
  delete arme[socketIndex];
  const armes = { ...s.armes };
  if (Object.keys(arme).length > 0) armes[instance] = arme;
  else delete armes[instance];
  return { version: 1, armes };
}
function reinitialiserArme(s, instance) {
  const armes = { ...s.armes };
  delete armes[instance];
  return { version: 1, armes };
}
var nbColonnesSimulees = (s, instance) => Object.keys(s.armes[instance] ?? {}).length;
var armesSimulees = (s) => Object.keys(s.armes);
var estLeRollReel = (item2) => !!(item2.option.equipeEnJeu || item2.ameliore?.equipeEnJeu);
var armeEstAmelioree = (colonnes) => colonnes.some((items) => items.some((i) => !!i.ameliore?.equipeEnJeu));
var choixEffectif = (item2, armeAmelioree) => armeAmelioree && item2.ameliore ? item2.ameliore.hash : item2.option.hash;

// tests/logique/simulation.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var memoire = (init) => {
  const contenu = new Map(init === void 0 ? [] : [[CLE_STOCKAGE_SIMULATIONS, init]]);
  return { contenu, getItem: (c) => contenu.get(c) ?? null, setItem: (c, v) => void contenu.set(c, v) };
};
var s0 = SIMULATIONS_VIDES();
var s1 = choisir(s0, "w1", 1, { choisi: 6903, effectif: 6904 });
ok("choisir un perk dans une colonne ne modifie PAS l'objet d'origine (immuable) et l'enregistre par exemplaire et par index de prise", Object.keys(s0.armes).length === 0 && s1.armes.w1[1].choisi === 6903 && s1.armes.w1[1].effectif === 6904, [s0, s1]);
var s2 = choisir(s1, "w1", 1, { choisi: 6901, effectif: 6902 });
ok("UNE seule perk par colonne : choisir de nouveau dans la m\xEAme colonne REMPLACE le choix (jamais deux)", Object.keys(s2.armes.w1).length === 1 && s2.armes.w1[1].choisi === 6901, s2);
var s3 = choisir(s2, "w1", 3, { choisi: 6923, effectif: 6923 });
ok("deux colonnes diff\xE9rentes coexistent ; deux exemplaires de la M\xCAME arme restent ind\xE9pendants (cl\xE9 = identifiant d'exemplaire)", nbColonnesSimulees(s3, "w1") === 2 && nbColonnesSimulees(choisir(s3, "w9", 1, { choisi: 1, effectif: 1 }), "w9") === 1 && nbColonnesSimulees(s3, "w9") === 0);
var s4 = retirerColonne(s3, "w1", 1);
ok("revenir au roll r\xE9el sur UNE colonne la retire, les autres restent ; retirer la derni\xE8re retire l'arme de la liste des armes simul\xE9es", nbColonnesSimulees(s4, "w1") === 1 && !(1 in s4.armes.w1) && armesSimulees(retirerColonne(s4, "w1", 3)).length === 0 && armesSimulees(s4).join() === "w1", s4);
ok("tout r\xE9initialiser pour une arme n'affecte pas les autres", armesSimulees(reinitialiserArme(choisir(s3, "w2", 5, { choisi: 7, effectif: 7 }), "w1")).join() === "w2");
var item = (hash, reel = false, amelioreHash, amelioreReel = false) => ({ option: { hash, equipeEnJeu: reel }, ...amelioreHash ? { ameliore: { hash: amelioreHash, equipeEnJeu: amelioreReel } } : {} });
var colonnesBase = [[item(1, true, 2), item(3, false, 4)], [item(5, true)]];
var colonnesAmeliorees = [[item(1, false, 2, true), item(3, false, 4)], [item(5, true)]];
ok("une arme dont tous les perks R\xC9ELS sont des perks de base n'est pas \xAB am\xE9lior\xE9e \xBB ; une arme dont au moins un perk r\xE9el est la version am\xE9lior\xE9e d'un perk l'est", !armeEstAmelioree(colonnesBase) && armeEstAmelioree(colonnesAmeliorees));
ok("sans roll r\xE9el connu (aucun perk marqu\xE9), l'arme n'est pas \xAB am\xE9lior\xE9e \xBB : on compte le perk de base", !armeEstAmelioree([[item(1, false, 2)], [item(5)]]));
ok("le perk \xE0 COMPTER : sa version am\xE9lior\xE9e si l'arme est am\xE9lior\xE9e ET que le perk en a une, sinon le perk lui-m\xEAme (un perk sans jumeau reste lui-m\xEAme, m\xEAme sur une arme am\xE9lior\xE9e)", choixEffectif(item(3, false, 4), true) === 4 && choixEffectif(item(3, false, 4), false) === 3 && choixEffectif(item(5), true) === 5);
ok("le perk du roll r\xE9el est reconnu, qu'il soit la version de base OU la version am\xE9lior\xE9e dans la paire", estLeRollReel(item(1, true, 2)) && estLeRollReel(item(1, false, 2, true)) && !estLeRollReel(item(3, false, 4)));
var st = memoire();
ok("\xE9crire puis relire redonne les m\xEAmes simulations ; le format stock\xE9 est compact et versionn\xE9", ecrireSimulations(st, s3) && JSON.stringify(lireSimulations(st)) === JSON.stringify(s3) && JSON.parse(st.contenu.get(CLE_STOCKAGE_SIMULATIONS)).version === 1, st.contenu.get(CLE_STOCKAGE_SIMULATIONS));
ok("stockage vide, JSON illisible, mauvaise version ou mauvaise forme : simulation VIDE, jamais d'erreur", [memoire(), memoire("{pas du json"), memoire('{"version":2,"armes":{}}'), memoire("null"), memoire('{"version":1,"armes":5}'), memoire('{"version":1}')].every((m) => Object.keys(lireSimulations(m).armes).length === 0));
var abime = lireSimulations(memoire(JSON.stringify({ version: 1, armes: { ok: { "1": { c: 10, e: 11 }, "x": { c: 1, e: 2 }, "2": { c: -3, e: 4 }, "3": { c: 5 } }, vide: {}, faux: 7 } })));
ok("les entr\xE9es ab\xEEm\xE9es sont \xE9cart\xE9es UNE \xE0 UNE : seule la colonne valide de l'exemplaire valide est conserv\xE9e (index non num\xE9rique, nombre n\xE9gatif, valeur manquante, exemplaire vide ou mal form\xE9 \xE9cart\xE9s)", JSON.stringify(abime.armes) === JSON.stringify({ ok: { 1: { choisi: 10, effectif: 11 } } }), abime);
var refuse = { getItem: () => null, setItem: () => {
  throw new Error("quota");
} };
ok("un stockage qui refuse l'\xE9criture (quota plein, interdit) renvoie \xAB faux \xBB sans casser", ecrireSimulations(refuse, s3) === false);
var casse = { getItem: () => {
  throw new Error("interdit");
}, setItem: () => {
} };
ok("un stockage dont la lecture l\xE8ve une erreur donne une simulation vide", Object.keys(lireSimulations(casse).armes).length === 0);
globalThis.window = { get localStorage() {
  throw new Error("SecurityError");
} };
var secours = stockageNavigateur();
secours.setItem("a", "b");
ok("sans stockage du navigateur (acc\xE8s interdit), une m\xE9moire de secours prend le relais (elle ne persiste pas mais l'appli fonctionne)", secours.getItem("a") === "b" && secours.getItem("z") === null);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
