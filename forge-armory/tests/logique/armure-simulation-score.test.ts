// FR : ⚠️ AJOUT (branche draft-mod-armures) - test de la SIMULATION DES MODS D'ARMURE jusqu'au SCORE : (1) `appliquerSimulationArmure` (copie, mods simulés dans perkHashes/perksParColonne, stats recalculées, stats réelles mémorisées, sans Manifest les stats restent réelles), (2) `appliquerSimulations` applique les DEUX parties (armes + armures), (3) la CHAÎNE JUSQU'AU MOTEUR : le texte du mod simulé est lu par `extraireTextesEffetsBuild` (Pilier 2) ET les stats recalculées changent le pilier stats_2_0 (`sommerStatsArmure`), le build réel ne change pas. Faux Manifest (`ajouterArmureForge` + un mod « verbe solaire » 7414 et un mod négatif 7415).
// EN: ⚠️ ADDED - test of the ARMOR MOD simulation up to the score: overlay (copy, simulated mods, recomputed stats), both parts applied, and the chain to the engine (Pillar 2 text + stats pillar).
import { appliquerSimulationArmure, appliquerSimulations, nbArmuresSimulees, nbArmesSimulees } from "../../src/lib/forge/appliquerSimulation";
import { choisir, SIMULATIONS_VIDES, reinitialiserArme } from "../../src/lib/forge/simulation";
import { extraireTextesEffetsBuild } from "../../src/lib/scoring/verbes";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { sommerStatsArmure } from "../../src/lib/scoring/stats";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET, T_PLUGSET } from "./fixtures/fauxManifest";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 700)); };
// FR : le casque d'essai avec un MOD « verbe solaire » (7414 : +10 grenade ET « Blessure solaire » dans sa description) et un mod « malus santé » (7415 : −10 santé) : le premier teste le Pilier 2, le second un score de stats EN BAISSE.
const { db } = creerFausseDb((() => {
  const d = ajouterArmureForge(manifestArmesDeTest());
  const objets = d[T_OBJET] as Record<number, unknown>, jeux = d[T_PLUGSET] as Record<number, unknown>;
  const pl = (nom: string, categorie: string, inv: Array<[number, number]>, description = "") => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, plug: { plugCategoryIdentifier: categorie }, investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7414] = pl("Mod de grenade solaire", "enhancements.v2_general", [[8803, 10]], "Les grenades infligent Blessure solaire aux cibles.");
  objets[7415] = pl("Mod de santé fragile", "enhancements.v2_general", [[8801, -10]], "Réduit la santé.");
  jeux[8301] = { reusablePlugItems: [7411, 7412, 7413, 7414, 7415].map((h) => ({ plugItemHash: h })) };
  return d;
})());

// ⚠️ AJOUT : le mod réel équipé (7411, « Mod de santé ») donne +10 santé, le mod simulé (7414) +10 grenade : le delta du remplacement est −10 santé / +10 grenade.
const casque: GearPiece = { itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", isExotic: false, rarete: "Légendaire", icone: "", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [7411, 7412, 7413, 7414, 7415], 3: [7421, 7422], 4: [7431, 7432, 7433] } } as unknown as GearPiece;
const construire = (armes: GearPiece[], armure: GearPiece[]): BuildDraft => ({ ...structuredClone(demoBuild), subclass: { ...structuredClone(demoBuild.subclass), element: "solaire" }, armes, armure });
const simArmure = (instance: string, colonnes: Record<number, [number, number]>) => Object.entries(colonnes).reduce((s, [i, [c, e]]) => choisir(s, instance, Number(i), { choisi: c, effectif: e }, "armures"), SIMULATIONS_VIDES());

// ---------- 1. l'overlay d'une armure ----------
const s1 = simArmure("a1", { 2: [7414, 7414] });
const copie = appliquerSimulationArmure(casque, s1.armures!["a1"], db);
ok("la copie porte les MODS SIMULÉS dans perkHashes/perksParColonne (7414 à la place de 7411), les autres prises inchangées, l'ordre conservé", JSON.stringify(copie.perkHashes) === JSON.stringify([7401, 7402, 7414, 7421, 7431]) && JSON.stringify(copie.perksParColonne!.map((p) => p.socketIndex)) === JSON.stringify([0, 1, 2, 3, 4]), copie);
ok("la copie porte les repères : modsSimules, statsRÉELLES mémorisées, nombre de mods simulés", copie.modsSimules === true && JSON.stringify(copie.statsReelles) === JSON.stringify(casque.stats) && copie.nbModsSimules === 1);
ok("les STATISTIQUES sont recalculées : le delta du remplacement (7411 → 7414) est −10 santé / +10 grenade", copie.stats.grenade === 25 && copie.stats.sante === 10 && copie.stats.melee === 10 && copie.stats.super === 8 && copie.stats.classe === 12 && copie.stats.arme === 25, copie.stats);
ok("la pièce d'ORIGINE n'est JAMAIS modifiée (stats et perks réels intacts)", JSON.stringify(casque.stats) === JSON.stringify({ sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }) && JSON.stringify(casque.perkHashes) === JSON.stringify([7401, 7402, 7411, 7421, 7431]) && casque.modsSimules === undefined);
const casqueStats25 = { ...copie, stats: { sante: 10, melee: 10, grenade: 25, super: 8, classe: 12, arme: 25 }, modsSimules: undefined, statsReelles: undefined, nbModsSimules: undefined } as GearPiece;
const scoreSans = evaluerBuild(construire([], [casqueStats25]), demoExigences, db);
const scoreAvec = evaluerBuild(construire([], [copie]), demoExigences, db);
const pilierStatsDe = (r: ReturnType<typeof evaluerBuild>) => r.piliers.find((p) => p.pilier === "stats_2_0")!;
ok("VÉRITÉ TERRAIN : un casque avec les MÊMES perks simulés et grenade 25 / santé 10 (stats du simulé) score EXACTEMENT comme la copie simulée (le pilier stats lit `stats`, le Pilier 2 lit `perkHashes`)", pilierStatsDe(scoreAvec).score === pilierStatsDe(scoreSans).score && scoreAvec.scoreGlobal === scoreSans.scoreGlobal, [pilierStatsDe(scoreAvec).score, pilierStatsDe(scoreSans).score, scoreAvec.scoreGlobal, scoreSans.scoreGlobal]);
ok("sans simulation, simulation vide, ou armure NON possédée (pas d'itemInstanceId) : la MÊME pièce est rendue", appliquerSimulationArmure(casque, undefined, db) === casque && appliquerSimulationArmure(casque, {}, db) === casque && (() => { const n = { ...casque, itemInstanceId: undefined } as GearPiece; return appliquerSimulationArmure(n, s1.armures!["a1"], db) === n; })());
ok("SANS Manifest (db = null) : les mods simulés sont appliqués MAIS les stats restent RÉELLES (pas de recalcul)", (() => { const c = appliquerSimulationArmure(casque, s1.armures!["a1"], null); return c.modsSimules === true && JSON.stringify(c.perkHashes) === JSON.stringify([7401, 7402, 7414, 7421, 7431]) && JSON.stringify(c.stats) === JSON.stringify(casque.stats) && JSON.stringify(c.statsReelles) === JSON.stringify(casque.stats); })());
const sansColonnes = { ...casque, perksParColonne: undefined } as GearPiece; delete (sansColonnes as { perksParColonne?: unknown }).perksParColonne;
ok("armure SANS colonnes connues : la simulation ne s'applique pas (même objet)", appliquerSimulationArmure(sansColonnes, s1.armures!["a1"], db) === sansColonnes);
const deuxMods = appliquerSimulationArmure(casque, simArmure("a1", { 2: [7412, 7412], 3: [7422, 7422] }).armures!["a1"], db);
ok("DEUX mods simulés : les deltas s'additionnent (santé −10, classe +10 −5, mêlée −5, grenade +5, super +5) et nbModsSimules = 2", deuxMods.stats.sante === 10 && deuxMods.stats.classe === 17 && deuxMods.stats.melee === 5 && deuxMods.stats.grenade === 20 && deuxMods.stats.super === 13 && deuxMods.nbModsSimules === 2, deuxMods.stats);
// ---------- 2. l'application au build ----------
const build = construire([], [casque]);
const eff = appliquerSimulations(build, s1, db);
ok("le build effectif porte l'armure simulée (copie) ; le build d'origine garde l'armure réelle (même objet)", eff.armure[0] !== casque && eff.armure[0].modsSimules === true && build.armure[0] === casque && nbArmuresSimulees(eff) === 1 && nbArmesSimulees(eff) === 0);
ok("les DEUX parties coexistent : une arme simulée ET une armure simulée dans le même build", (() => { const w = { itemHash: 5010, itemInstanceId: "w1", nom: "Arme", slot: "energie", stats: {}, isExotic: false, perkHashes: [100, 200], perksParColonne: [{ socketIndex: 1, hash: 100 }, { socketIndex: 2, hash: 200 }] } as GearPiece; const b = construire([w], [casque]); const s = simArmure("a1", { 2: [7414, 7414] }); s.armes["w1"] = { 2: { choisi: 201, effectif: 201 } }; const e = appliquerSimulations(b, s, db); return e.armes[0].perksSimules === true && e.armure[0].modsSimules === true && nbArmesSimulees(e) === 1 && nbArmuresSimulees(e) === 1; })());
ok("rien à appliquer : le MÊME build est rendu", appliquerSimulations(build, SIMULATIONS_VIDES(), db) === build && appliquerSimulations(build, simArmure("autre", { 2: [7414, 7414] }), db) === build);
ok("retirer la simulation ramène le build RÉEL (même objet)", (() => { const sans = reinitialiserArme(s1, "a1", "armures"); return appliquerSimulations(build, sans, db) === build; })());
// ---------- 3. jusqu'au score ----------
const buildReel = construire([], [casque]);
const buildSimule = appliquerSimulations(buildReel, s1, db);
const avant = extraireTextesEffetsBuild(buildReel, db).join(" | "), apres = extraireTextesEffetsBuild(buildSimule, db).join(" | ");
ok("CHAÎNE JUSQU'AU MOTEUR (Pilier 2) : le texte du MOD SIMULÉ (« Mod de grenade solaire… Blessure solaire ») est lu, plus celui du mod réel", /Mod de grenade solaire/.test(apres) && !/Mod de santé/.test(apres) && /Mod de santé/.test(avant) && !/Blessure solaire/.test(avant), [avant, apres]);
const statsReelles = sommerStatsArmure(buildReel.armure), statsSimulees = sommerStatsArmure(buildSimule.armure);
ok("CHAÎNE JUSQU'AU MOTEUR (pilier stats) : la somme des stats du build reflète le mod simulé (grenade 15 → 25, santé 20 → 10)", statsSimulees.grenade === 25 && statsReelles.grenade === 15 && statsSimulees.sante === 10 && statsReelles.sante === 20 && statsSimulees.melee === statsReelles.melee, [statsReelles, statsSimulees]);
const scoreReel = evaluerBuild(buildReel, demoExigences, db), scoreSimule = evaluerBuild(buildSimule, demoExigences, db);
const pilierStats = (r: ReturnType<typeof evaluerBuild>) => r.piliers.find((p) => p.pilier === "stats_2_0")!;
const pilierVerbesDe = (r: ReturnType<typeof evaluerBuild>) => r.piliers.find((p) => p.pilier === "verbes_element")!;
ok("LE SCORE CHANGE : le pilier stats_2_0 du build simulé est EXACTEMENT celui du casque aux stats recalculées (17 = 17), et le Pilier 2 monte (20 réel → 24 simulé : le mod simulé applique Blessure solaire) ; le score global monte de 19 à 20", pilierStats(scoreSimule).score === pilierStatsDe(scoreSans).score && pilierStats(scoreSimule).score === pilierStats(scoreReel).score && pilierVerbesDe(scoreSimule).score > pilierVerbesDe(scoreReel).score && scoreSimule.scoreGlobal > scoreReel.scoreGlobal, [pilierStats(scoreReel).score, pilierStats(scoreSimule).score, pilierStatsDe(scoreSans).score, pilierVerbesDe(scoreReel).score, pilierVerbesDe(scoreSimule).score, scoreReel.scoreGlobal, scoreSimule.scoreGlobal]);
const buildMalus = appliquerSimulations(buildReel, simArmure("a1", { 2: [7415, 7415] }), db);
const scoreMalus = evaluerBuild(buildMalus, demoExigences, db);
ok("un mod SIMULÉ NÉGATIF (7415 : −10 santé à la place de 7411 +10) FAIT BAISSER le pilier stats_2_0 et le score global (le score réagit dans les deux sens)", pilierStats(scoreMalus).score < pilierStats(scoreReel).score && scoreMalus.scoreGlobal < scoreReel.scoreGlobal, [pilierStats(scoreReel).score, pilierStats(scoreMalus).score, scoreReel.scoreGlobal, scoreMalus.scoreGlobal]);
const apresRetour = evaluerBuild(appliquerSimulations(buildReel, SIMULATIONS_VIDES(), db), demoExigences, db);
ok("…et supprimer la simulation ramène EXACTEMENT le score réel (mêmes scores de pilier, même score global)", apresRetour.scoreGlobal === scoreReel.scoreGlobal && JSON.stringify(apresRetour.piliers.map((p) => [p.pilier, p.score])) === JSON.stringify(scoreReel.piliers.map((p) => [p.pilier, p.score])));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
