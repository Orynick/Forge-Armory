// FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures), « La maquette me plait beaucoup ! » : TEST de la LOGIQUE PURE de la simulation des mods d'armure avec BUDGET D'ÉNERGIE (`lib/forge/energieMods.ts` + la correction de l'ajustement dans `lib/forge/armure.ts`). Les données reproduisent la STRUCTURE RÉELLE du casque de l'utilisateur : un mod de statistique, trois emplacements cumulables à liste commune, un ajustement dans sa vraie catégorie `core.gear_systems.armor_tiering.plugs.tuning.mods` (qui le faisait classer « fixe »), des mods en DEUX versions (standard / à prix réduit sans bonus), un plug « vide » par liste, capacité 11 et énergie utilisée 10.
// ⚠️ Données d'ESSAI : ce test ne dit rien des vrais mods du jeu, seulement que la logique applique les règles établies sur les diagnostics réels. EN: ⚠️ ADDED - test of the pure logic of the armor-mod simulation with an ENERGY BUDGET, on data mirroring the real helmet's structure.
import { colonnesArmure, statsSimulees, diagnosticArmure, statPlusDePiece } from "../../src/lib/forge/armure";
import { roleColonne, estPlugVide, versionsStandard, energieSimulee, tientDansLEnergie, deltaEnergie, hashEffectif, modeleStatistique, modeleAjustement, modeleCumulables, modeleSimulation, affecterCumulables, ajouterCumulable, retirerCumulable, appliquerChangements, coutMod } from "../../src/lib/forge/energieMods";
import { SIMULATIONS_VIDES, type ChoixColonne } from "../../src/lib/forge/simulation";
import { creerFausseDb, T_PLUGSET } from "./fixtures/fauxManifest";
import { creerCasqueChatoyant, def, TETE } from "./fixtures/casqueChatoyant";
import type { GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 1100)); };

// ---------- les données d'essai : un casque calqué sur le casque chatoyant réel (fixture commune avec la page de test d'interface) ----------
const { defs, db, objets, base, socles, dispoTuning, c1 } = creerCasqueChatoyant();
const jeux = defs[T_PLUGSET] as Record<number, unknown>;
void jeux;
const colonnes = colonnesArmure(db, c1);
const col = (i: number) => colonnes.find((c) => c.socketIndex === i)!;
const sim = (...cs: Array<[number, number]>): Record<number, ChoixColonne> => Object.fromEntries(cs.map(([i, h]) => [i, { choisi: h, effectif: h }]));

// ---------- 1. les rôles et le correctif de l'ajustement ----------
ok("RÔLES : archétype et amélioration = « autre » (et FIXES) ; mod de statistique = « statistique » ; trois emplacements = « cumulable » ; ajustement = « ajustement »", JSON.stringify(colonnes.map((c) => roleColonne(c))) === JSON.stringify(["autre", "autre", "statistique", "cumulable", "cumulable", "cumulable", "ajustement"]) && col(0).fixe && col(1).fixe, colonnes.map((c) => [c.socketIndex, roleColonne(c), c.modifiable]));
ok("CORRECTIF : l'ajustement, dont la catégorie réelle (`…armor_tiering…tuning…`) contient « armor_tier », est MODIFIABLE (avant : « fixe : oui | modifiable : non », donc impossible à simuler) ; l'amélioration et l'archétype restent fixes", col(6).modifiable === true && col(6).fixe === false && col(1).modifiable === false && col(0).modifiable === false, [col(6).fixe, col(6).modifiable]);
ok("PLUG VIDE reconnu par son nom : « Emplacement de mod vide » et « Emplacement de mod d'ajustement vide » oui ; « Emplacement d'artifice verrouillé » et un mod ordinaire non", estPlugVide(col(2).options.find((o) => o.hash === 9199)!) && estPlugVide(col(6).options.find((o) => o.hash === 9399)!) && !estPlugVide(col(2).equipe) && !estPlugVide({ ...col(2).equipe, nom: "Emplacement d'artifice verrouillé" }));

// ---------- 2. la version standard ----------
const optsStat = col(2).options;
ok("DOUBLONS : la liste du modèle contient les DEUX versions de « Mod de classe », « Mod de santé » et « Mods d'arme » (10 plugs) ; la version STANDARD (collection, +10, coût 3) est gardée, la version sans bonus à prix réduit (coût 1) est écartée : 7 plugs", optsStat.length === 10 && versionsStandard(db, optsStat).length === 7 && !versionsStandard(db, optsStat).some((o) => [9102, 9112, 9122].includes(o.hash)), [optsStat.length, versionsStandard(db, optsStat).map((o) => o.hash)]);
ok("LES COÛTS RETENUS : la standard coûte 3 (ou 2 pour « Ciblage harmonieux »), jamais le prix réduit de 1 ; l'ordre d'origine est conservé", coutMod(db, 9101) === 3 && versionsStandard(db, col(3).options).find((o) => o.nom === "Ciblage harmonieux")!.hash === 9204 && versionsStandard(db, col(3).options).map((o) => o.hash).join() === col(3).options.filter((o) => ![9202, 9205].includes(o.hash)).map((o) => o.hash).join());
ok("SI LE JOUEUR ÉQUIPE LA VERSION À PRIX RÉDUIT, ELLE EST CONSERVÉE (et l'autre version est écartée) : on ne cache jamais ce qui est équipé", JSON.stringify(versionsStandard(db, optsStat, [9102]).filter((o) => o.nom === "Mod de classe").map((o) => o.hash)) === "[9102]");
// replis : égalité de collection -> moins de règles ; sinon la plus chère
objets[9501] = def(9501, "Mod test A", TETE, { cout: 1, collectible: true, regles: 2 }); objets[9502] = def(9502, "Mod test A", TETE, { cout: 3, collectible: true, regles: 1 });
objets[9511] = def(9511, "Mod test B", TETE, { cout: 1, regles: 1 }); objets[9512] = def(9512, "Mod test B", TETE, { cout: 3, regles: 1 });
objets[9521] = def(9521, "Mod test C", TETE, { cout: 1, collectible: true, regles: 3 }); objets[9522] = def(9522, "Mod test C", TETE, { cout: 3, regles: 1 });   // la collection et le nombre de règles S'OPPOSENT : la collection domine
const { db: db2 } = creerFausseDb(defs);
const p = (h: number) => ({ hash: h, nom: h < 9510 ? "Mod test A" : "Mod test B", description: "", categoriePlug: TETE, ornement: false, stats: {} });
const pC = (h: number) => ({ hash: h, nom: "Mod test C", description: "", categoriePlug: TETE, ornement: false, stats: {} });
ok("PRIORITÉS : la COLLECTION domine le nombre de règles (9521 : collection mais 3 règles, gagne contre 9522 : sans collection et 1 règle) ; à collection égale la version aux MOINS de règles gagne (9502) ; sans collection ni écart de règles la PLUS CHÈRE gagne (9512)", versionsStandard(db2, [pC(9521), pC(9522)])[0].hash === 9521 && versionsStandard(db2, [pC(9522), pC(9521)])[0].hash === 9521 && versionsStandard(db2, [p(9501), p(9502)])[0].hash === 9502 && versionsStandard(db2, [p(9511), p(9512)])[0].hash === 9512);

// ---------- 3. les modèles des trois blocs ----------
const ms = modeleStatistique(db, col(2));
ok("BLOC STATISTIQUE : le mod équipé est « Mod de classe » ; six options (classe, santé, armes × majeur et mineur) sans version doublon ; statistiques [classe, santé, arme] ; intensités [5, 10] ; le plug vide est repéré", ms.courant.hash === 9101 && ms.options.length === 6 && JSON.stringify(ms.stats) === '["classe","sante","arme"]' && JSON.stringify(ms.intensites) === "[5,10]" && ms.vide?.hash === 9199, ms);
ok("BLOC STATISTIQUE : les coûts sont ceux de la version standard (majeur 3, mineur 1) et chaque option porte son bonus (+10 ou +5)", ms.options.every((o) => (o.valeur === 10 ? o.cout === 3 : o.cout === 1)) && ms.options.find((o) => o.plug.hash === 9103)!.valeur === 5);
const ma = modeleAjustement(col(6));
ok("BLOC AJUSTEMENT (pièce légendaire, règle du jeu) : le « + » de la PIÈCE est Super ; cinq choix « − » (santé, mêlée, grenade, classe, arme) ; l'ajustement ÉQUILIBRÉ ; le plug VIDE (lu dans le MODÈLE du jeu : l'exemplaire ne le liste pas) ; le courant est « +Super / -Santé »", ma.plusPiece === "super" && ma.directionnels.map((o) => o.moins).join() === "sante,melee,grenade,classe,arme" && ma.equilibre?.hash === 9306 && ma.vide?.hash === 9399 && ma.courant.hash === 9301, ma);
const exotique = { ...c1, itemHash: 5401, isExotic: true, itemInstanceId: "e1", perksParColonne: [{ socketIndex: 0, hash: 9001 }, { socketIndex: 1, hash: 9002 }, { socketIndex: 2, hash: 9101 }, { socketIndex: 3, hash: 9301 }], plugsDisponiblesParColonne: { 3: [9301, 9302, 9311, 9312, 9306] }, energie: { capacite: 11, utilisee: 3 } } as unknown as GearPiece;
const maE = modeleAjustement(colonnesArmure(db, exotique).find((c) => c.socketIndex === 3)!, undefined, undefined, true);
ok("BLOC AJUSTEMENT (pièce EXOTIQUE, règle du jeu confirmée par les diagnostics : l'API marque les 31 ajustements « insérables », donc PAS de « + » propre) : le « + » est LIBRE : deux « + » proposés (Super, Arme), aucun « + » de la pièce ; les quatre directionnels (+Super / −Santé, +Super / −Mêlée, +Arme / −Santé, +Arme / −Super), l'équilibré et le vide", maE.plusLibre === true && maE.plusPiece === null && JSON.stringify(maE.plusPossibles) === '["super","arme"]' && maE.directionnels.map((o) => `${o.plus}/${o.moins}`).join() === "super/sante,super/melee,arme/sante,arme/super" && maE.equilibre?.hash === 9306 && maE.vide?.hash === 9399, maE);
// ---- le « + » d'une pièce dont l'ajustement ÉQUIPÉ n'est pas directionnel (équilibré ou vide) : cas réel d'une exotique à 31 propositions ----
const exoEquilibre = { ...exotique, isExotic: false, itemInstanceId: "e2", perksParColonne: [{ socketIndex: 0, hash: 9001 }, { socketIndex: 1, hash: 9002 }, { socketIndex: 2, hash: 9101 }, { socketIndex: 3, hash: 9306 }] } as unknown as GearPiece;
const colExoEq = colonnesArmure(db, exoEquilibre).find((c) => c.socketIndex === 3)!;
const maInconnu = modeleAjustement(colExoEq);
ok("« + » ILLISIBLE (LÉGENDAIRE dont l'ajustement équipé est « équilibré » et dont l'API liste des « + » différents : cas hypothétique, les légendaires observées n'ont qu'un « + ») : `plusPiece` est `null` et AUCUN ajustement directionnel n'est proposé (jamais un « + » deviné) ; l'équilibré et le vide restent possibles", maInconnu.plusPiece === null && maInconnu.directionnels.length === 0 && maInconnu.equilibre?.hash === 9306 && maInconnu.vide?.hash === 9399, maInconnu);
const maInsertables = modeleAjustement(colExoEq, undefined, [9302, 9301, 9306]);
ok("« + » RETROUVÉ PAR LES PLUGS INSÉRABLES (`canInsert`) : si l'API ne marque insérables que des « +Super / … », le « + » de la pièce est Super et seuls ceux-là sont proposés (« − Santé », « − Mêlée »)", maInsertables.plusPiece === "super" && maInsertables.directionnels.map((o) => o.moins).join() === "sante,melee", maInsertables);
const maAmbigu = modeleAjustement(colExoEq, undefined, [9301, 9311, 9306]);
ok("INSÉRABLES AMBIGUS (deux « + » différents) : on NE DEVINE PAS : `plusPiece` reste `null`", maAmbigu.plusPiece === null && maAmbigu.directionnels.length === 0, maAmbigu);
const mc = modeleCumulables(db, [col(3), col(4), col(5)]);
ok("BLOC CUMULABLES : trois emplacements, quatre mods proposés (Source de Super, Siphon harmonieux, Ciblage harmonieux en version standard, Détecteur de munitions lourdes) sans les doublons ; le vide est repéré ; effectifs [Source, Source, Siphon] ; comptes Source × 2 et Siphon × 1 ; aucun emplacement libre", mc.colonnes.length === 3 && mc.options.map((o) => o.hash).join() === "9201,9203,9204,9206" && mc.vide?.hash === 9299 && mc.effectifs.join() === "9201,9201,9203" && mc.compte.get(9201) === 2 && mc.compte.get(9203) === 1 && mc.nbLibres === 0, mc);

// ---------- 4. l'énergie ----------
const e0 = energieSimulee(db, c1, colonnes)!;
ok("ÉNERGIE RÉELLE : capacité 11 (lue sur la pièce), utilisée 10 (= 3 + 3 + 3 + 1), il en reste 1 ; l'équipement réel ne change rien", e0.capacite === 11 && e0.reelle === 10 && e0.simulee === 10 && e0.restante === 1, e0);
const choixA = sim([2, 9103]);
const eA = energieSimulee(db, c1, colonnes, choixA)!;
ok("ÉNERGIE SIMULÉE : le mod de classe majeur (3) remplacé par le mineur (1) : 10 − 3 + 1 = 8, il en reste 3 ; l'énergie réelle reste 10", eA.simulee === 8 && eA.restante === 3 && eA.reelle === 10, eA);
ok("LES STATISTIQUES SUIVENT : classe 40 → 35 (le bonus passe de +10 à +5) et rien d'autre ne bouge", statsSimulees(db, c1, choixA).delta.classe === -5 && Object.keys(statsSimulees(db, c1, choixA).delta).length === 1, statsSimulees(db, c1, choixA).delta);
ok("L'AJUSTEMENT SIMULÉ MODIFIE LES STATISTIQUES (grâce au correctif) : « +Super / -Santé » → « +Super / -Mêlée » : santé +5, mêlée −5, Super inchangé ; l'énergie ne bouge pas (un ajustement ne coûte rien)", (() => { const d = statsSimulees(db, c1, sim([6, 9302])).delta; return d.sante === 5 && d.melee === -5 && (d.super ?? 0) === 0 && (d.classe ?? 0) === 0 && (d.grenade ?? 0) === 0 && (d.arme ?? 0) === 0; })() && energieSimulee(db, c1, colonnes, sim([6, 9302]))!.simulee === 10 && statsSimulees(db, c1, sim([6, 9302])).nbChangements === 1, statsSimulees(db, c1, sim([6, 9302])).delta);
const diag = diagnosticArmure(db, c1);
const diagExo = diagnosticArmure(db, exoEquilibre);
ok("DIAGNOSTIC DE L'ARMURE : pour l'ajustement, il dit le « + » lu ET sa source (« les propositions de l'exemplaire n'ont qu'UN « + » » sur le casque), les « + » distincts, l'absence d'indicateur `canInsert`, la présence du plug « vide » lu dans le modèle, les statistiques non intrinsèques calculées, et les VRAIES valeurs du Manifest de l'« Ajustement équilibré » (« AUCUNE » ici : c'est ce qu'il faut vérifier sur le vrai compte)", diag.includes("« + » de la pièce : super (source : les propositions de l'exemplaire n'ont qu'UN « + »)") && diag.includes("indicateur ABSENT de l'API") && diag.includes("plug « vide » lu dans le modèle : oui") && diag.includes("statistiques non intrinsèques calculées : sante, melee, grenade") && diag.includes("« Ajustement équilibré » (hash 9306) : genre equilibre | statistiques lues dans le Manifest : AUCUNE"), diag.split("\n").filter((l) => l.includes("AJUSTEMENT") || l.includes("plug d'ajustement")));
const legInconnu = { ...exoEquilibre, isExotic: false } as unknown as GearPiece;
ok("DIAGNOSTIC D'UNE LÉGENDAIRE À « + » ILLISIBLE : il dit « ILLISIBLE » et pourquoi (ajustement équipé non directionnel, aucun indicateur utile) ; avec des plugs insérables de l'API, la source est « les plugs insérables »", diagnosticArmure(db, legInconnu).includes("« + » de la pièce : ILLISIBLE (source : aucune") && diagnosticArmure(db, { ...legInconnu, plugsInsertablesParColonne: { 3: [9301, 9302, 9306] } } as unknown as GearPiece).includes("source : les plugs insérables"), diagnosticArmure(db, legInconnu).split("\n").filter((l) => l.includes("AJUSTEMENT")));
const diagExoVrai = diagnosticArmure(db, { ...exoEquilibre, isExotic: true } as unknown as GearPiece);
ok("DIAGNOSTIC D'UNE EXOTIQUE : il dit « pièce EXOTIQUE : pas de « + » propre à la pièce (tous les ajustements sont possibles) » et ne cherche pas de « + »", diagExoVrai.includes("pièce EXOTIQUE : pas de « + » propre à la pièce (tous les ajustements sont possibles)") && !diagExoVrai.includes("ILLISIBLE"), diagExoVrai.split("\n").filter((l) => l.includes("AJUSTEMENT")));
ok("LE « + » D'UNE PIÈCE POUR LES LISTES (`statPlusDePiece`, version légère mémorisée) : Super sur le casque légendaire ; `null` sur une exotique (pas de « + » propre) ; `null` sur une légendaire illisible ; `null` sans aucun ajustement ; le résultat est stable d'un appel à l'autre", statPlusDePiece(db, c1) === "super" && statPlusDePiece(db, c1) === "super" && statPlusDePiece(db, exotique) === null && statPlusDePiece(db, legInconnu) === null && statPlusDePiece(db, { ...c1, perksParColonne: [] } as unknown as GearPiece) === null);
ok("LE MODÈLE COMPLET SAIT SI LA PIÈCE EST EXOTIQUE : « + » libre pour une exotique (`plusLibre`, aucun « + » de la pièce), « + » propre (Super) pour le casque légendaire", (() => { const ex = modeleSimulation(db, exotique, colonnesArmure(db, exotique)).ajustement, lg = modeleSimulation(db, c1, colonnes).ajustement; return ex?.plusLibre === true && ex.plusPiece === null && lg?.plusLibre === false && lg.plusPiece === "super"; })());
const sansMaitrise = { ...c1, stats: { sante: 0, melee: 0, grenade: 0, super: 25, classe: 40, arme: 25 } } as unknown as GearPiece;
const dSans = statsSimulees(db, sansMaitrise, sim([6, 9306])).delta;
ok("ÉQUILIBRÉ SUR UNE PIÈCE SANS MAÎTRISE (remarque de l'utilisateur : « l'ajustement équilibré fonctionne aussi quand ce n'est pas une pièce masterworked ») : les trois statistiques à 0 sont les non intrinsèques et reçoivent +1 ; mêmes effets que sur une pièce maîtrisée", JSON.stringify(modeleSimulation(db, sansMaitrise, colonnes).nonIntrinseques) === '["sante","melee","grenade"]' && dSans.sante === 6 && dSans.melee === 1 && dSans.grenade === 1 && dSans.super === -5, [modeleSimulation(db, sansMaitrise, colonnes).nonIntrinseques, dSans]);
const dBal = statsSimulees(db, c1, sim([6, 9306])).delta;
ok("AJUSTEMENT ÉQUILIBRÉ (règle du jeu ; son plug n'a AUCUNE valeur dans le Manifest d'essai, comme ce que montrent les diagnostics réels) : +1 sur Santé, Mêlée et Grenade (les 3 statistiques non intrinsèques de ce casque) ; Santé +6 (le −5 de l'ajustement équipé disparaît, +1 s'ajoute) ; Super −5 (le +5 disparaît) ; énergie inchangée", dBal.sante === 6 && dBal.melee === 1 && dBal.grenade === 1 && dBal.super === -5 && (dBal.classe ?? 0) === 0 && (dBal.arme ?? 0) === 0 && energieSimulee(db, c1, colonnes, sim([6, 9306]))!.simulee === 10, dBal);
const dVide = statsSimulees(db, c1, sim([6, 9399])).delta;
ok("AJUSTEMENT LAISSÉ VIDE (plug « vide » lu dans le modèle du jeu) : rien ne s'ajoute : Super −5 (le +5 disparaît), Santé +5 (le −5 disparaît), le reste inchangé ; énergie inchangée", dVide.super === -5 && dVide.sante === 5 && (dVide.melee ?? 0) === 0 && (dVide.grenade ?? 0) === 0 && energieSimulee(db, c1, colonnes, sim([6, 9399]))!.simulee === 10, dVide);
ok("LES TROIS STATISTIQUES NON INTRINSÈQUES du casque sont Santé, Mêlée, Grenade (les trois plus petites une fois retiré l'effet du mod de classe +10) : le modèle les donne", JSON.stringify(modeleSimulation(db, c1, colonnes).nonIntrinseques) === '["sante","melee","grenade"]', modeleSimulation(db, c1, colonnes).nonIntrinseques);
ok("BUDGET : passer du mineur au majeur coûte +2 alors qu'il ne reste que 1 : refusé ; poser un mod à 1 : accepté ; retirer de l'énergie : toujours accepté ; énergie non lue : jamais de limite", !tientDansLEnergie(e0, 2) && tientDansLEnergie(e0, 1) && tientDansLEnergie(e0, -3) && tientDansLEnergie(e0, 0) && tientDansLEnergie(null, 99), [e0, deltaEnergie(db, 9103, 9101)]);
ok("DELTA D'ÉNERGIE : mineur → majeur +2 ; Source de Super (3) → Siphon harmonieux (1) −2 ; un plug sans coût (l'ajustement) compte 0 : delta 0", deltaEnergie(db, 9103, 9101) === 2 && deltaEnergie(db, 9201, 9203) === -2 && deltaEnergie(db, 9301, 9302) === 0 && coutMod(db, 9301) === 0 && coutMod(db, 9199) === 0);
const sansEnergie = { ...c1, energie: undefined } as unknown as GearPiece;
ok("PIÈCE SANS ÉNERGIE LUE : `null` (aucune jauge, aucune limite) ; le modèle complet le dit", energieSimulee(db, sansEnergie, colonnes) === null && modeleSimulation(db, sansEnergie, colonnes).energie === null);

// ---------- 5. la répartition des cumulables ----------
const cible = new Map([[9203, 1], [9201, 1], [9204, 1]]);
const aff = affecterCumulables(mc.colonnes, cible, 9299);
ok("RÉPARTITION MINIMALE : cible {Siphon, Source, Ciblage} sur [Source, Source, Siphon] : la Source et le Siphon NE BOUGENT PAS, seul le 2ᵉ emplacement reçoit le Ciblage", aff.map((x) => `${x.socketIndex}:${x.plugHash}`).join() === "3:9201,4:9204,5:9203", aff);
ok("RÉPARTITION VIDE : une cible vide remplit les trois emplacements du plug vide ; une cible de trois fois le même mod les remplit tous", affecterCumulables(mc.colonnes, new Map(), 9299).every((x) => x.plugHash === 9299) && affecterCumulables(mc.colonnes, new Map([[9206, 3]]), 9299).every((x) => x.plugHash === 9206));
ok("AJOUTER avec les trois emplacements PLEINS : refusé (`null`) ; sans plug vide à poser : refusé aussi", ajouterCumulable(mc, 9204) === null && ajouterCumulable({ ...mc, vide: undefined }, 9204) === null);
const retire = retirerCumulable(mc, 9201)!;
ok("RETIRER une Source de Super : l'emplacement 3 garde sa Source, le 4 devient vide, le 5 garde son Siphon (un seul emplacement change)", retire.map((x) => `${x.socketIndex}:${x.plugHash}`).join() === "3:9201,4:9299,5:9203", retire);
const s1 = appliquerChangements(SIMULATIONS_VIDES(), "c1", colonnes, retire);
ok("APPLIQUÉ AUX SIMULATIONS : une seule colonne est simulée (la 4) ; les deux autres, égales à l'équipé, n'ont AUCUNE simulation", JSON.stringify(s1.armures.c1) === JSON.stringify({ 4: { choisi: 9299, effectif: 9299 } }), s1.armures);
const eR = energieSimulee(db, c1, colonnes, s1.armures.c1)!;
ok("L'ÉNERGIE LIBÉRÉE : sans une Source de Super (3) l'énergie simulée tombe à 7 ; il en reste 4", eR.simulee === 7 && eR.restante === 4, eR);
const mc1 = modeleCumulables(db, [col(3), col(4), col(5)], s1.armures.c1);
ok("LE MODÈLE SUIT LA SIMULATION : un emplacement libre, Source × 1 et Siphon × 1 ; le plug vide n'est jamais compté comme un mod", mc1.nbLibres === 1 && mc1.compte.get(9201) === 1 && mc1.compte.get(9203) === 1 && !mc1.compte.has(9299), mc1);
const ajout = ajouterCumulable(mc1, 9204)!;
const s2 = appliquerChangements(s1, "c1", colonnes, ajout);
ok("AJOUTER un Ciblage harmonieux (coût 2) dans l'emplacement libre : toujours une seule colonne simulée ; énergie 7 + 2 = 9 ; il reste 2", JSON.stringify(s2.armures.c1) === JSON.stringify({ 4: { choisi: 9204, effectif: 9204 } }) && energieSimulee(db, c1, colonnes, s2.armures.c1)!.simulee === 9, s2.armures);
const s3 = appliquerChangements(s2, "c1", colonnes, retirerCumulable(modeleCumulables(db, [col(3), col(4), col(5)], s2.armures.c1), 9204)!);
ok("RETIRER ce Ciblage puis REPOSER une Source à la place de l'équipé : revient à l'état réel ; aucune simulation ne reste (jamais de simulation « égale à l'équipé »)", JSON.stringify(appliquerChangements(s3, "c1", colonnes, ajouterCumulable(modeleCumulables(db, [col(3), col(4), col(5)], s3.armures.c1), 9201)!).armures) === "{}", appliquerChangements(s3, "c1", colonnes, ajouterCumulable(modeleCumulables(db, [col(3), col(4), col(5)], s3.armures.c1), 9201)!).armures);
ok("APPLIQUER LES PLUGS ÉQUIPÉS NE SIMULE RIEN : tous les emplacements remis à leur plug équipé : aucune simulation", JSON.stringify(appliquerChangements(s1, "c1", colonnes, colonnes.map((c) => ({ socketIndex: c.socketIndex, plugHash: c.equipe.hash }))).armures) === "{}");

// ---------- 6. le modèle complet et les cas limites ----------
const mod = modeleSimulation(db, c1, colonnes);
ok("MODÈLE COMPLET : un bloc statistique, un ajustement, des cumulables, aucun autre emplacement ; énergie lue", mod.statistique !== null && mod.ajustement !== null && mod.cumulables !== null && mod.autres.length === 0 && mod.energie !== null);
const c2 = { ...base, itemHash: 5402, itemInstanceId: "c2", nom: "Casque à emplacement de raid d'essai", slot: "casque", perksParColonne: [...socles, { socketIndex: 7, hash: 9801 }], plugsDisponiblesParColonne: { ...dispoTuning, 7: [9801, 9802] }, energie: { capacite: 11, utilisee: 11 } } as unknown as GearPiece;
const colonnes2 = colonnesArmure(db, c2);
const mod2 = modeleSimulation(db, c2, colonnes2);
ok("AUTRES EMPLACEMENTS : un emplacement de RAID modifiable est listé à part (jamais perdu) ; son coût entre dans l'énergie : « Mod de raid B » (2) à la place de A (1) : 11 → 12 dépasse la capacité 11 : refusé", mod2.autres.length === 1 && mod2.autres[0].socketIndex === 7 && !tientDansLEnergie(mod2.energie, deltaEnergie(db, 9801, 9802)) && tientDansLEnergie(mod2.energie, 0), [mod2.autres.map((c) => c.socketIndex), mod2.energie]);
ok("AUCUN EMPLACEMENT RECONNU : une armure d'avant Armor 3.0 sans mod (marque de classe) donne un modèle vide, sans erreur", (() => { const m = modeleSimulation(db, { ...c1, itemHash: 999999, perksParColonne: [] } as unknown as GearPiece, []); return m.statistique === null && m.ajustement === null && m.cumulables === null && m.autres.length === 0; })());
ok("UN CHOIX SUR UN EMPLACEMENT NON MODIFIABLE EST IGNORÉ : l'amélioration (fixe) ne change ni l'énergie ni le plug effectif", hashEffectif(col(1), sim([1, 9101])) === 9002 && energieSimulee(db, c1, colonnes, sim([1, 9101]))!.simulee === 10);
const copieChoix = JSON.stringify(sim([2, 9103])), copieCols = JSON.stringify(colonnes);
modeleSimulation(db, c1, colonnes, sim([2, 9103])); ajouterCumulable(mc1, 9204);
ok("AUCUNE ENTRÉE N'EST MODIFIÉE par la logique (colonnes, choix, modèles)", JSON.stringify(sim([2, 9103])) === copieChoix && JSON.stringify(colonnes) === copieCols);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
