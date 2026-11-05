// FR : \u26a0\ufe0f AJOUT (20/10/2026, branche draft-optimiseur) - test des AJUSTEMENTS MANUELS de stats
// (boutons \u2212/+ \u00e0 c\u00f4t\u00e9 des barres, granularit\u00e9 5, clamp [0, 200] sur le TOTAL ajust\u00e9, surcharges
// de charges d'armure EXCLUES) et de l'enregistrement marqu\u00e9 \u00ab simulation \u00bb :
//   1. `appliquerAjustementsStats` / `aDesAjustementsStats` (pur, arrondi au pas de 5, clamp total) ;
//   2. le SCORE : `evaluerBuild` applique les ajustements (statsTotales + pilier 5 marqu\u00e9 du badge
//      \u00ab simul\u00e9 \u00bb), sans ajustement le r\u00e9sultat est inchang\u00e9 (m\u00eame objet) ;
//   3. la SAUVEGARDE : `construireLoadout`/`enregistrerLoadout` d\u00e9tectent la simulation, conservent
//      `ajustementsStats`, le flag voyage dans l'export/import, le badge est port\u00e9 par le loadout.
// EN: test of MANUAL stat adjustments (the \u2212/+ bar buttons, 5-point granularity, [0,200] clamp on the
// ADJUSTED total, Armor Charge overcharges EXCLUDED) and of the "simulation"-marked save.
import { appliquerAjustementsStats, aDesAjustementsStats, PAS_AJUSTEMENT_STAT, STAT_MAX } from "../../src/lib/scoring/stats";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { construireLoadout, enregistrerLoadout, serialiserUnLoadout, importerLoadouts, listerLoadouts } from "../../src/lib/loadouts/stockage";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import type { BuildDraft, StatBlock } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "\u2705" : "\u274c", nom); if (!cond && detail !== undefined) console.log("   d\u00e9tail :", JSON.stringify(detail).slice(0, 500)); };

const statsBase: StatBlock = { sante: 100, melee: 50, grenade: 30, super: 80, classe: 20, arme: 150 };

// ---------- 1. la fonction pure ----------
ok("PUR : sans ajustement, le M\u00caME objet est rendu (aucun recalcul)", appliquerAjustementsStats(statsBase, undefined) === statsBase && appliquerAjustementsStats(statsBase, {}) === statsBase);
const ajuste = appliquerAjustementsStats(statsBase, { super: 15, sante: -10 });
ok("PUR : le delta s'applique aux stats r\u00e9elles (Super 80\u219295, Sant\u00e9 100\u219290)", ajuste.super === 95 && ajuste.sante === 90, ajuste);
ok("PUR : les stats non ajust\u00e9es sont inchang\u00e9es et le build d'origine n'est PAS modifi\u00e9", ajuste.arme === 150 && statsBase.super === 80 && statsBase.sante === 100, [ajuste, statsBase]);
const arrondi = appliquerAjustementsStats(statsBase, { super: 7 });
ok("PUR : un delta non multiple de 5 est arrondi au pas de 5 (7 \u2192 +5)", arrondi.super === 85, arrondi.super);
const clampHaut = appliquerAjustementsStats(statsBase, { arme: 100 });
ok("PUR : le TOTAL ajust\u00e9 est clamp\u00e9 \u00e0 200 (Arme 150 + 100 \u2192 200, pas 250)", clampHaut.arme === STAT_MAX, clampHaut.arme);
const clampBas = appliquerAjustementsStats(statsBase, { classe: -100 });
ok("PUR : le TOTAL ajust\u00e9 est clamp\u00e9 \u00e0 0 (Classe 20 \u2212 100 \u2192 0, pas \u221280)", clampBas.classe === 0, clampBas.classe);
ok("PUR : aDesAjustementsStats d\u00e9tecte un ajustement non nul (apr\u00e8s arrondi) et en ignore un nul", aDesAjustementsStats({ super: 5 }) === true && aDesAjustementsStats({ super: 2 }) === false && aDesAjustementsStats(undefined) === false && aDesAjustementsStats({}) === false);
ok("PUR : le pas d'ajustement est bien 5", PAS_AJUSTEMENT_STAT === 5);

// ---------- 2. le score ----------
const buildSans = { ...structuredClone(demoBuild), armure: [] } as BuildDraft;
const scoreSans = evaluerBuild(buildSans, demoExigences);
const pilierStatsSans = scoreSans.piliers.find((p) => p.pilier === "stats_2_0")!;
ok("SCORE : sans ajustement, le pilier 5 n'est PAS marqu\u00e9 (pas de badge)", pilierStatsSans.detailsMarques === undefined, pilierStatsSans.detailsMarques);
const buildAvec = { ...buildSans, ajustementsStats: { super: 20, sante: -5 } };
const scoreAvec = evaluerBuild(buildAvec, demoExigences);
const pilierStatsAvec = scoreAvec.piliers.find((p) => p.pilier === "stats_2_0")!;
ok("SCORE : les ajustements modifient les stats totales retourn\u00e9es (Super +20, Sant\u00e9 \u22125 sur un build vide = 20 et \u22125 clamp\u00e9 \u00e0 0)", scoreAvec.statsTotales.super === 20 && scoreAvec.statsTotales.sante === 0, scoreAvec.statsTotales);
ok("SCORE : le pilier 5 marqu\u00e9 porte detailsMarques (badge \u00ab simul\u00e9 \u00bb) et le suffixe texte sur chaque ligne", pilierStatsAvec.detailsMarques !== undefined && pilierStatsAvec.detailsMarques.length === pilierStatsAvec.details.length && pilierStatsAvec.details.every((d) => d.includes("simul\u00e9")) && pilierStatsAvec.detailsMarques.every((l) => l.simule === true), pilierStatsAvec.details);
ok("SCORE : le score du pilier 5 change avec les ajustements (les stats entrent dans son calcul)", pilierStatsAvec.score !== pilierStatsSans.score, [pilierStatsSans.score, pilierStatsAvec.score]);
ok("SCORE : le score global change aussi (le pilier 5 est pond\u00e9r\u00e9)", scoreAvec.scoreGlobal !== scoreSans.scoreGlobal, [scoreSans.scoreGlobal, scoreAvec.scoreGlobal]);
ok("SCORE : sans ajustement, le r\u00e9sultat est strictement identique \u00e0 avant (statsTotales m\u00eame objet, piliers identiques)", JSON.stringify(scoreSans.piliers.map((p) => [p.pilier, p.score])) === JSON.stringify(evaluerBuild(buildSans, demoExigences).piliers.map((p) => [p.pilier, p.score])));
const buildZero = { ...buildSans, ajustementsStats: { super: 2 } }; // arrondi \u00e0 0
ok("SCORE : un ajustement qui s'arrondit \u00e0 0 ne marque PAS le pilier (pas de badge pour rien)", evaluerBuild(buildZero, demoExigences).piliers.find((p) => p.pilier === "stats_2_0")!.detailsMarques === undefined);

// ---------- 3. la sauvegarde marqu\u00e9e \u00ab simulation \u00bb ----------
const stockage = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (c: string) => stockage.get(c) ?? null, setItem: (c: string, v: string) => void stockage.set(c, v) };
const loadoutReel = construireLoadout("R\u00e9el", buildSans);
ok("SAVE : un build sans ajustement n'est PAS marqu\u00e9 simulation", loadoutReel.estSimulation === undefined, loadoutReel.estSimulation);
const loadoutSimule = construireLoadout("Simul\u00e9", buildAvec);
ok("SAVE : un build AVEC ajustements est marqu\u00e9 simulation (d\u00e9tection auto)", loadoutSimule.estSimulation === true, loadoutSimule.estSimulation);
ok("SAVE : les ajustements sont CONSERV\u00c9S dans le build enregistr\u00e9 (ils voyagent avec)", JSON.stringify(loadoutSimule.build.ajustementsStats) === JSON.stringify({ super: 20, sante: -5 }), loadoutSimule.build.ajustementsStats);
const force = construireLoadout("Forc\u00e9", buildSans, "", "", "", true);
ok("SAVE : le flag peut aussi \u00eatre forc\u00e9 par l'appelant (perks simul\u00e9s, ex)", force.estSimulation === true);
const r = enregistrerLoadout("Ma simu", buildAvec);
ok("SAVE : enregistrerLoadout \u00e9crit un loadout marqu\u00e9 simulation", r.ok && listerLoadouts()[0].estSimulation === true, r);
const partage = serialiserUnLoadout(loadoutSimule);
const relu = JSON.parse(partage.contenu)[0];
ok("SAVE : le flag simulation VOYAGE dans le fichier d'\u00e9change (comme auteur)", relu.estSimulation === true && JSON.stringify(relu.build.ajustementsStats) === JSON.stringify({ super: 20, sante: -5 }), relu);
const importRes = importerLoadouts(partage.contenu);
ok("SAVE : l'import relit le flag simulation (nettoy\u00e9 : seul `true` est repris)", importRes.ok === true && listerLoadouts().some((l) => l.estSimulation === true), importRes);
const sauvegardeComplete = listerLoadouts();
ok("SAVE : les loadouts enregistr\u00e9s AVANT ce champ restent valides (estSimulation absent = r\u00e9el)", sauvegardeComplete.every((l) => l.estSimulation === undefined || l.estSimulation === true));
console.log(`\n${res.filter(Boolean).length}/${res.length} contr\u00f4les r\u00e9ussis`); process.exit(res.every(Boolean) ? 0 : 1);
