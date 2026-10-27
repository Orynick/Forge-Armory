// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « travaille sur le lien entre stats simulées et score » : TEST de ce que le lien apporte en plus de la chaîne déjà testée (`armure-simulation-score.test.ts`) : (1) la COMPARAISON réel → simulé (`comparerScores`) : score global, piliers et statistiques qui changent ; (2) le DELTA des statistiques totales dû à la simulation (`deltaStatsArmure`) ; (3) le GARDE-FOU DE L'ÉNERGIE : une simulation qui dépasse l'énergie de la pièce est IGNORÉE par le score (irréalisable en jeu), signalée, et le score reste exactement le score réel ; énergie non lue : la simulation s'applique comme avant ; (4) l'EXPORT n'embarque ni la liste des plugs insérables ni l'énergie ; (5) l'AJUSTEMENT simulé change bien les statistiques du build.
// EN: ⚠️ ADDED - test of what the link adds: real → simulated comparison, stat delta, ENERGY GUARD (an over-budget simulation is ignored by the score), export stripping, tuning effect.
import { appliquerSimulationArmure, appliquerSimulations, nbArmuresSimulees, nbArmuresRejetees, deltaStatsArmure, pieceReelle } from "../../src/lib/forge/appliquerSimulation";
import { comparerScores } from "../../src/lib/forge/scoreSimule";
import { choisir, SIMULATIONS_VIDES } from "../../src/lib/forge/simulation";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { pieceExportable, buildExportable } from "../../src/lib/loadouts/pieceExportable";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET, T_PLUGSET } from "./fixtures/fauxManifest";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 800)); };
// Mêmes données que `armure-simulation-score.test.ts` + des COÛTS d'énergie : 7411 (équipé) coûte 3, 7412 coûte 1, 7414 coûte 5, 7415 coûte 1 ; les ajustements ne coûtent rien.
const { db } = creerFausseDb((() => {
  const d = ajouterArmureForge(manifestArmesDeTest());
  const objets = d[T_OBJET] as Record<number, { plug?: Record<string, unknown> }>, jeux = d[T_PLUGSET] as Record<number, unknown>;
  const pl = (nom: string, categorie: string, inv: Array<[number, number]>, description = "", cout?: number) => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, plug: { plugCategoryIdentifier: categorie, ...(cout !== undefined ? { energyCost: { energyCost: cout, energyTypeHash: 1 } } : {}) }, investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7414] = pl("Mod de grenade solaire", "enhancements.v2_general", [[8803, 10]], "Les grenades infligent Blessure solaire aux cibles.", 5) as never;
  objets[7415] = pl("Mod de santé fragile", "enhancements.v2_general", [[8801, -10]], "Réduit la santé.", 1) as never;
  for (const [h, c] of [[7411, 3], [7412, 1]] as Array<[number, number]>) objets[h].plug = { ...(objets[h].plug ?? {}), energyCost: { energyCost: c, energyTypeHash: 1 } };
  jeux[8301] = { reusablePlugItems: [7411, 7412, 7413, 7414, 7415].map((h) => ({ plugItemHash: h })) };
  return d;
})());
const base = { itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", isExotic: false, rarete: "Légendaire", icone: "", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [7411, 7412, 7413, 7414, 7415], 3: [7421, 7422], 4: [7431, 7432, 7433] } };
const casque = { ...base, energie: { capacite: 4, utilisee: 3 } } as unknown as GearPiece;        // capacité 4, utilisée 3 (mod de santé : 3)
const casqueLarge = { ...base, energie: { capacite: 5, utilisee: 3 } } as unknown as GearPiece;     // capacité 5 : le mod à 5 d'énergie y TIENT (utilisée 3 − 3 + 5 = 5)
const casqueSansEnergie = { ...base } as unknown as GearPiece;                                       // énergie NON LUE
const construire = (armure: GearPiece[]): BuildDraft => ({ ...structuredClone(demoBuild), subclass: { ...structuredClone(demoBuild.subclass), element: "solaire" }, armes: [], armure });
const sim = (colonnes: Record<number, number>, instance = "a1") => Object.entries(colonnes).reduce((s, [i, h]) => choisir(s, instance, Number(i), { choisi: h, effectif: h }, "armures"), SIMULATIONS_VIDES());

// ---------- 1. un mod simulé DANS le budget : le score change, la comparaison le dit ----------
const reel = construire([casqueLarge]);
const dansLeBudget = appliquerSimulations(reel, sim({ 2: 7414 }), db);        // mod de grenade solaire (+10 grenade, −10 santé en moins, « Blessure solaire ») : coût 5 = capacité 5 : tient pile
const sReel = evaluerBuild(reel, demoExigences, db), sSim = evaluerBuild(dansLeBudget, demoExigences, db);
const cmp = comparerScores(sReel, sSim);
ok("COMPARAISON RÉEL → SIMULÉ : `reel` et `simule` sont les scores globaux des deux évaluations, `delta` leur différence ; rien d'inventé", cmp.reel === sReel.scoreGlobal && cmp.simule === sSim.scoreGlobal && cmp.delta === sSim.scoreGlobal - sReel.scoreGlobal, cmp);
ok("LES STATISTIQUES QUI CHANGENT (dans l'ordre Santé…Arme) : Santé −10, Grenade +10 et rien d'autre ; une statistique inchangée n'apparaît pas", JSON.stringify(cmp.stats.map((s) => [s.stat, s.reel, s.simule, s.delta])) === JSON.stringify([["sante", sReel.statsTotales.sante, sReel.statsTotales.sante - 10, -10], ["grenade", sReel.statsTotales.grenade, sReel.statsTotales.grenade + 10, 10]]), cmp.stats);
ok("LES PILIERS QUI CHANGENT : uniquement ceux dont le score a vraiment changé, avec le réel, le simulé et l'écart ; ici « Effets du Build » (verbes_element) monte de 20 à 24 (le mod simulé applique Blessure solaire) et le pilier des statistiques NE bouge PAS (pas listé : il n'a pas changé)", cmp.piliers.every((p) => p.delta !== 0 && p.delta === p.simule - p.reel) && JSON.stringify(cmp.piliers.map((p) => [p.pilier, p.reel, p.simule, p.delta])) === '[["verbes_element",20,24,4]]' && cmp.piliers.length === sSim.piliers.filter((p) => p.score !== sReel.piliers.find((q) => q.pilier === p.pilier)!.score).length, cmp.piliers);
const memes = comparerScores(sReel, sReel);
const malus = comparerScores(sReel, evaluerBuild(appliquerSimulations(reel, sim({ 2: 7415 }), db), demoExigences, db));
ok("UN MOD SIMULÉ NÉGATIF (−10 santé) : le pilier des statistiques BAISSE et la comparaison le montre (écart négatif sur « stats_2_0 », sur Santé et sur le score global) : le lien fonctionne dans les deux sens", malus.piliers.some((p) => p.pilier === "stats_2_0" && p.delta < 0) && malus.stats.some((s) => s.stat === "sante" && s.delta === -20) && malus.delta < 0, malus);
ok("RIEN À COMPARER : deux fois la même évaluation : écart nul, aucun pilier, aucune statistique", memes.delta === 0 && memes.piliers.length === 0 && memes.stats.length === 0);
ok("LA COMPARAISON NE MODIFIE RIEN : les deux évaluations sont inchangées après l'appel", JSON.stringify(sReel) === JSON.stringify(evaluerBuild(reel, demoExigences, db)) && JSON.stringify(sSim) === JSON.stringify(evaluerBuild(dansLeBudget, demoExigences, db)));
ok("DELTA DES STATISTIQUES TOTALES DES ARMURES (affiché dans Mon Build : « 10 (−10) ») : Santé −10, Grenade +10 pour ce mod ; vide quand rien n'est simulé ; une armure non simulée n'ajoute rien", JSON.stringify(deltaStatsArmure(dansLeBudget.armure)) === '{"sante":-10,"grenade":10}' && JSON.stringify(deltaStatsArmure(reel.armure)) === "{}" && JSON.stringify(deltaStatsArmure([casqueLarge, ...dansLeBudget.armure])) === '{"sante":-10,"grenade":10}', deltaStatsArmure(dansLeBudget.armure));
ok("DEUX ARMURES SIMULÉES : les deltas de statistiques s'additionnent", (() => { const b = { ...casqueLarge, itemInstanceId: "a2" } as unknown as GearPiece; const eff = appliquerSimulations(construire([casqueLarge, b]), { ...sim({ 2: 7414 }, "a1"), armures: { ...sim({ 2: 7414 }, "a1").armures, ...sim({ 2: 7414 }, "a2").armures } }, db); return JSON.stringify(deltaStatsArmure(eff.armure)) === '{"sante":-20,"grenade":20}'; })());

// ---------- 2. le GARDE-FOU DE L'ÉNERGIE ----------
const simTrop = sim({ 2: 7414 });                                                 // mod à 5 d'énergie : 5 > capacité 4 (le mod équipé en coûtait 3 : utilisée 3 − 3 + 5 = 5)
const copieRejetee = appliquerSimulationArmure(casque, simTrop.armures!["a1"], db);
ok("SIMULATION QUI DÉPASSE L'ÉNERGIE (utilisée 3 − 3 + 5 = 5 pour une capacité de 4) : la pièce est rendue RÉELLE (mêmes statistiques, mêmes mods), marquée `simulationRejetee` avec l'excédent (1), et PAS `modsSimules`", copieRejetee.simulationRejetee === true && copieRejetee.energieDepassee === 1 && copieRejetee.modsSimules !== true && JSON.stringify(copieRejetee.stats) === JSON.stringify(casque.stats) && JSON.stringify(copieRejetee.perkHashes) === JSON.stringify(casque.perkHashes), copieRejetee);
const reelCapacite4 = construire([casque]);
const sReelCap4 = evaluerBuild(reelCapacite4, demoExigences, db);
const buildRejete = appliquerSimulations(reelCapacite4, simTrop, db);
ok("LE SCORE IGNORE LA SIMULATION IMPOSSIBLE : score global et scores des piliers EXACTEMENT ceux du build réel ; le build compte 1 armure rejetée et 0 armure simulée", (() => { const s = evaluerBuild(buildRejete, demoExigences, db); return s.scoreGlobal === sReelCap4.scoreGlobal && JSON.stringify(s.piliers.map((p) => [p.pilier, p.score])) === JSON.stringify(sReelCap4.piliers.map((p) => [p.pilier, p.score])) && JSON.stringify(s.statsTotales) === JSON.stringify(sReelCap4.statsTotales) && nbArmuresRejetees(buildRejete) === 1 && nbArmuresSimulees(buildRejete) === 0; })());
ok("LE DELTA DES STATISTIQUES EST VIDE pour une simulation rejetée (le build garde ses statistiques réelles)", JSON.stringify(deltaStatsArmure(buildRejete.armure)) === "{}");
const juste = appliquerSimulationArmure(casque, sim({ 2: 7412 }).armures!["a1"], db);
ok("PILE DANS LE BUDGET : utilisée 3 − 3 + 1 = 1 ≤ 4 : appliquée normalement (aucun rejet) ; et un mod à 3 − 3 + 3 = 3 (équipé remplacé par lui-même coûtant autant) ne dépasse pas non plus", juste.modsSimules === true && juste.simulationRejetee !== true && appliquerSimulationArmure({ ...casque, energie: { capacite: 5, utilisee: 3 } } as unknown as GearPiece, simTrop.armures!["a1"], db).modsSimules === true);
ok("À LA LIMITE EXACTE : utilisée 5 sur une capacité de 5 n'est PAS un dépassement (`<` et non `≤`)", appliquerSimulationArmure({ ...casque, energie: { capacite: 5, utilisee: 3 } } as unknown as GearPiece, simTrop.armures!["a1"], db).simulationRejetee !== true);
const sansE = appliquerSimulationArmure(casqueSansEnergie, simTrop.armures!["a1"], db);
ok("ÉNERGIE NON LUE : on ne peut rien vérifier : la simulation s'applique comme avant (statistiques recalculées, `modsSimules`), sans rejet", sansE.modsSimules === true && sansE.simulationRejetee !== true && sansE.stats.grenade === 25);
ok("SANS MANIFEST (db = null) : aucun contrôle d'énergie possible : comportement d'avant (mods appliqués, statistiques réelles)", (() => { const c = appliquerSimulationArmure(casque, simTrop.armures!["a1"], null); return c.modsSimules === true && c.simulationRejetee !== true && JSON.stringify(c.stats) === JSON.stringify(casque.stats); })());
const retour = appliquerSimulations(reelCapacite4, sim({ 2: 7411 }), db);
ok("UNE ENTRÉE ÉGALE AU MOD ÉQUIPÉ N'EST PAS UNE SIMULATION (durcissement) : jamais de rejet ni de « simulé » : le MÊME build ; retirer la simulation ramène aussi le même build ; une entrée égale à côté d'une vraie simulation ne compte pas dans `nbModsSimules`", retour === reelCapacite4 && appliquerSimulations(reelCapacite4, SIMULATIONS_VIDES(), db) === reelCapacite4 && appliquerSimulationArmure(casqueLarge, sim({ 2: 7414, 3: 7421 }).armures!.a1, db).nbModsSimules === 1);
ok("LA PIÈCE D'ORIGINE N'EST JAMAIS MODIFIÉE par un rejet (ni marque, ni statistiques)", casque.simulationRejetee === undefined && casque.energieDepassee === undefined && JSON.stringify(casque.stats) === JSON.stringify(base.stats));

// ---------- 2 bis. la pièce RÉELLE d'une armure simulée (Mon Build : fenêtre Détails, « Envoyer à la Forge ») ----------
const simulee = appliquerSimulationArmure(casqueLarge, sim({ 2: 7414 }).armures!.a1, db);
ok("UNE ARMURE SIMULÉE MÉMORISE SES MODS ET SES STATISTIQUES RÉELS (comme une arme) : `perkHashesReels`, `perksParColonneReels` et `statsReelles` valent ceux de la pièce d'origine ; sans eux, la fenêtre Détails de Mon Build prenait les mods simulés pour les mods équipés", JSON.stringify(simulee.perkHashesReels) === JSON.stringify(casqueLarge.perkHashes) && JSON.stringify(simulee.perksParColonneReels) === JSON.stringify(casqueLarge.perksParColonne) && JSON.stringify(simulee.statsReelles) === JSON.stringify(casqueLarge.stats) && simulee.perkHashes.includes(7414) && !simulee.perkHashes.includes(7411), simulee);
const reelleDeSimulee = pieceReelle(simulee);
ok("`pieceReelle` D'UNE ARMURE SIMULÉE (utilisée par « Envoyer à la Forge ») : mods RÉELS (7411 et non 7414), statistiques RÉELLES, aucun repère de simulation ; jamais l'armure simulée", JSON.stringify(reelleDeSimulee.perkHashes) === JSON.stringify(casqueLarge.perkHashes) && JSON.stringify(reelleDeSimulee.perksParColonne) === JSON.stringify(casqueLarge.perksParColonne) && JSON.stringify(reelleDeSimulee.stats) === JSON.stringify(casqueLarge.stats) && !("modsSimules" in reelleDeSimulee) && !("statsReelles" in reelleDeSimulee) && !("perkHashesReels" in reelleDeSimulee) && !("nbModsSimules" in reelleDeSimulee), reelleDeSimulee);
ok("`pieceReelle` D'UNE ARMURE DONT LA SIMULATION EST REJETÉE : les repères du rejet sont retirés ; une pièce jamais simulée est rendue telle quelle (même objet)", (() => { const r = pieceReelle(copieRejetee); return !("simulationRejetee" in r) && !("energieDepassee" in r) && JSON.stringify(r.stats) === JSON.stringify(casque.stats); })() && pieceReelle(casqueLarge) === casqueLarge);
ok("ALLER-RETOUR : appliquer la simulation puis `pieceReelle` redonne une pièce ÉGALE à la pièce d'origine (hors ordre des clés)", JSON.stringify(Object.entries(reelleDeSimulee).sort()) === JSON.stringify(Object.entries(casqueLarge).sort()));

// ---------- 3. l'AJUSTEMENT simulé change les statistiques du build ----------
const tun = appliquerSimulations(reel, sim({ 3: 7422 }), db);   // `reel` = le casque de capacité 5
const cmpTun = comparerScores(sReel, evaluerBuild(tun, demoExigences, db));
ok("L'AJUSTEMENT SIMULÉ (7421 « mêlée vers grenade » → 7422 « super vers classe ») entre dans les statistiques du build : Mêlée −5 / Grenade +5 (l'ancien disparaît) et Super +5 / Classe −5 (le nouveau s'ajoute) ; énergie inchangée (un ajustement est gratuit : jamais rejeté)", JSON.stringify(deltaStatsArmure(tun.armure)) === '{"melee":-5,"grenade":5,"super":5,"classe":-5}' && nbArmuresRejetees(tun) === 0 && cmpTun.stats.length === 4, [deltaStatsArmure(tun.armure), cmpTun.stats]);

// ---------- 4. l'EXPORT ----------
const riche = { ...casque, plugsInsertablesParColonne: { 3: [7421, 7422] } } as unknown as GearPiece;
const exporte = pieceExportable(riche);
ok("EXPORT, ENREGISTREMENT, PARTAGE : la pièce ne contient plus ni la liste des plugs DISPONIBLES, ni celle des plugs INSÉRABLES (même information : les perks non sélectionnés), ni l'énergie ; ses statistiques, ses mods équipés et son nom sont conservés", !("plugsDisponiblesParColonne" in exporte) && !("plugsInsertablesParColonne" in exporte) && !("energie" in exporte) && exporte.nom === casque.nom && JSON.stringify(exporte.perkHashes) === JSON.stringify(casque.perkHashes) && JSON.stringify(exporte.stats) === JSON.stringify(casque.stats), Object.keys(exporte));
const nue = { ...casque } as Record<string, unknown>; delete nue.plugsDisponiblesParColonne; delete nue.energie;
const sansDisponibles = { ...casque, plugsInsertablesParColonne: { 3: [7421, 7422] } } as Record<string, unknown>; delete sansDisponibles.plugsDisponiblesParColonne;
const sansDispoExportee = pieceExportable(sansDisponibles as unknown as GearPiece);
ok("EXPORT D'UNE PIÈCE QUI N'A PLUS LA LISTE DES PLUGS DISPONIBLES (mais garde l'énergie et la liste des plugs insérables) : ces deux-là sont retirées aussi ; sans cela un build chargé puis réenregistré les embarquerait", !("plugsInsertablesParColonne" in sansDispoExportee) && !("energie" in sansDispoExportee) && sansDispoExportee.nom === casque.nom, Object.keys(sansDispoExportee));
const seulEnergie = { ...casque } as Record<string, unknown>; delete seulEnergie.plugsDisponiblesParColonne;
ok("EXPORT D'UNE PIÈCE QUI NE PORTE QUE L'ÉNERGIE : retirée", !("energie" in pieceExportable(seulEnergie as unknown as GearPiece)));
ok("UNE PIÈCE QUI N'A RIEN À RETIRER EST RENDUE TELLE QUELLE (même objet) ; le build exportable aussi", pieceExportable(nue as unknown as GearPiece) === nue && buildExportable(construire([nue as unknown as GearPiece])).armure[0] === nue);
ok("L'EXPORT NE MODIFIE PAS LA PIÈCE D'ORIGINE (elle garde ses plugs et son énergie pour la simulation)", "plugsInsertablesParColonne" in riche && "energie" in riche && "plugsDisponiblesParColonne" in riche);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
