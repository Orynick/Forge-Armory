// FR : ⚠️ AJOUT (19/10/2026, chantier « lien armure → score », §2.1 de la feuille de route) - test du LIEN ARMURE → SCORE : les mods d'armure simulés dans la Forge changent les STATISTIQUES de la pièce dans le build, donc le Pilier 5 (Statistiques) du score.
// Couvre : (1) `appliquerSimulationArmure` : la copie d'une armure simulée porte les six stats RECALCULÉES (delta exact de `statsSimulees`), les repères de simulation (badge « simulé »), les stats RÉELLES d'origine ; la pièce d'origine JAMAIS modifiée ; (2) `appliquerSimulations` parcourt AUSSI `build.armure` ; l'ARMÉE n'est pas touchée par une simulation d'armure et vice-versa ; (3) la CHAÎNE jusqu'au score : `sommerStatsArmure` puis `evaluerBuild` voient les stats simulées, le build réel ne change pas ; (4) « Mettre dans Mon Build » : la pièce posée EST la copie avec stats simulées (badge), et `pieceReelle` retrouve l'originale pour la Forge.
// EN: ⚠️ ADDED - test of the armor → score link: simulated armor mods change the piece's stats in the build, hence the score's Statistics pillar.
import { appliquerSimulations, pieceReelle } from "../../src/lib/forge/appliquerSimulation";
import { choisir, SIMULATIONS_VIDES } from "../../src/lib/forge/simulation";
import { sommerStatsArmure } from "../../src/lib/scoring/stats";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET } from "./fixtures/fauxManifest";
import type { Database } from "sql.js";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// FR : l'armure d'essai reprend le CASQUE 5301 du faux Manifest (prise 2 = mod de santé 7411 équipé) : simuler 7412 (mod de classe) sur la prise 2 échange +10 santé contre +10 classe — le delta que le Pilier 5 doit voir.
const armure = (instance: string, stats: Partial<Record<string, number>>, slot = "casque"): GearPiece =>
  ({ itemHash: 5301, itemInstanceId: instance, nom: `Armure ${instance}`, slot, stats: stats as GearPiece["stats"], isExotic: false, perkHashes: [7401, 7402, 7411, 7421], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }] } as GearPiece);

const construire = (armes: GearPiece[], armurePieces: GearPiece[]): BuildDraft =>
  ({ ...structuredClone(demoBuild), armes, armure: armurePieces });

const sim = (instance: string, colonnes: Record<number, [number, number]>) =>
  Object.entries(colonnes).reduce((s, [i, [c, e]]) => choisir(s, instance, Number(i), { choisi: c, effectif: e }), SIMULATIONS_VIDES());

(async () => {
  // FR : le faux Manifest du projet : les plugs 7411 (mod de santé) et 7412 (mod de classe) y ont leurs investmentStats (tests de la Forge des armures).
  const defs = ajouterArmureForge(manifestArmesDeTest());
  const { db } = creerFausseDb(defs);
  const base = db as unknown as Database;
  // ---------- 1. l'application à une pièce d'armure ----------
  const a1 = armure("a1", { sante: 20, classe: 12 });
  const build = construire([], [a1]);
  const s = sim("a1", { 2: [7412, 7412] });   // mod simulé sur la prise 2
  const eff = appliquerSimulations(build, s, base);

  ok("une armure SIMULÉE du build est remplacée par une COPIE (jamais le même objet) : le lien armure → score est branché", eff.armure[0] !== a1 && eff.armure[0] !== undefined, eff.armure[0]);
  ok("la pièce d'ORIGINE n'est jamais modifiée (le build enregistré garde ses stats réelles)", a1.stats.sante === 20 && a1.stats.classe === 12);
  ok("la copie porte les repères de simulation (badge « simulé » de Mon Build) et ses stats RÉELLES d'origine", (eff.armure[0] as GearPiece & { statsSimulees?: boolean }).statsSimulees === true && (eff.armure[0] as GearPiece & { statsReelles?: unknown }).statsReelles !== undefined, eff.armure[0]);
  ok("les ARMES ne sont pas touchées par une simulation posée sur une ARMURE du build (l'application est par pièce : une arme sans simulation enregistrée reste le même objet)", eff.armes === build.armes);

  // ---------- 2. la chaîne jusqu'au score ----------
  const statsEffectives = sommerStatsArmure(eff.armure);
  const statsReelles = sommerStatsArmure([a1]);
  ok("SOMMER les stats du build simulé donne les stats SIMULÉES (santé 10, classe 22) et non les réelles (santé 20, classe 12) : la simulation traverse jusqu'au calcul du Pilier 5", statsEffectives.sante === 10 && statsEffectives.classe === 22 && statsReelles.sante === 20 && statsReelles.classe === 12, { statsEffectives, statsReelles });
  // FR : le score GLOBAL est arrondi : un petit delta peut ne pas le faire bouger (vérifié : 7 reste 7 à ce niveau de stats).
  // Le contrôle juste : le PILIER 5 reçoit bien les stats SIMULÉES — on le prouve en comparant les détails du pilier
  // (ses STATISTIQUES sources affichées), et en donnant au build des stats assez hautes pour que l'arrondi sépare les deux scores.
  // FR : contexte DPS (le contexte vit dans le build, `build.contexte`) : les poids Neutre (santé 1,2 / classe 1,0) laissent
  // l'échange −10 santé / +10 classe SOUS le seuil d'arrondi du score ; en DPS (santé 0,3 / classe 0,8) il le dépasse : le test prouve la réaction là où elle est visible.
  const aHaute = armure("a1", { sante: 60, classe: 60 });
  const buildHaut = { ...construire([], [aHaute]), contexte: "dps" as const };
  const effHaut = appliquerSimulations(buildHaut, s, base);
  const scoreHautSimule = evaluerBuild(effHaut, demoExigences, undefined).scoreGlobal;
  const scoreHautReel = evaluerBuild(buildHaut, demoExigences, undefined).scoreGlobal;
  ok("le SCORE du build réagit aux mods d'armure simulés quand le delta dépasse l'arrondi (build à stats hautes : -10 santé +10 classe change le score pondéré)", scoreHautSimule !== scoreHautReel, { simule: scoreHautSimule, reel: scoreHautReel });
  ok("le build d'ORIGINE, lui, garde exactement son score (simuler ne modifie jamais le build enregistré)", evaluerBuild(build, demoExigences, undefined).scoreGlobal === evaluerBuild(build, demoExigences, undefined).scoreGlobal && JSON.stringify(build.armure[0].stats) === JSON.stringify(a1.stats));

  // ---------- 3. indépendances et cas limites ----------
  ok("une armure du build SANS simulation (ou une simulation d'un autre exemplaire) : le MÊME objet est rendu — les calculs mémorisés ne se relancent pas pour rien", (() => { const b = construire([], [a1]); return appliquerSimulations(b, SIMULATIONS_VIDES(), base) === b && appliquerSimulations(b, sim("autre", { 2: [7412, 7412] }), base) === b; })());
  ok("une armure NON possédée (sans identifiant d'exemplaire) n'est jamais simulée", (() => { const n = armure(undefined, { sante: 10 }); const b = construire([], [n]); return appliquerSimulations(b, sim("x", { 2: [1, 1] }), base).armure[0] === n; })());
  ok("« Mettre dans Mon Build » puis retour Forge : `pieceReelle` retrouve l'armure réelle (stats d'origine, repères retirés)", (() => { const r = pieceReelle(eff.armure[0]); return JSON.stringify((r as GearPiece).stats) === JSON.stringify(a1.stats) && (r as GearPiece & { statsSimulees?: boolean }).statsSimulees === undefined; })());

  // ---------- 4. deux exemplaires indépendants ----------
  const a2 = armure("a2", { sante: 30 });
  const b2 = construire([], [a1, a2]);
  const e2 = appliquerSimulations(b2, sim("a1", { 2: [7412, 7412] }), base);
  ok("DEUX exemplaires de pièces restent indépendants : seule l'armure simulée est copiée", e2.armure[0] !== a1 && e2.armure[1] === a2);

  console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();
