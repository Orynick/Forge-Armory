// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - test du LIEN ENTRE LA SIMULATION ET LE SCORE : (1) `appliquerSimulations` (copies, armes possédées seulement, exemplaires indépendants, perk « effectif », colonnes ajoutées, même objet si rien à faire), (2) le MAGASIN partagé (abonnés, persistance, rien si inchangé), (3) la CHAÎNE JUSQU'AU SCORE : le texte des perks simulés est bien lu par le moteur de score (`extraireTextesEffetsBuild`, verbes) et change `evaluerBuild`, alors que le build réel, lui, ne change pas.
// EN: ⚠️ ADDED - test of the simulation → score link: overlay, shared store, and the chain up to the real scoring engine.
import { appliquerSimulationPiece, appliquerSimulations, nbArmesSimulees, pieceReelle } from "../../src/lib/forge/appliquerSimulation";
import { creerMagasin } from "../../src/lib/forge/storeSimulations";
import { choisir, SIMULATIONS_VIDES, CLE_STOCKAGE_SIMULATIONS, Stockage } from "../../src/lib/forge/simulation";
import { extraireTextesEffetsBuild } from "../../src/lib/scoring/verbes";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const arme = (instance: string | undefined, perks: [number, number][], slot = "energie", hash = 5010): GearPiece => ({ itemHash: hash, itemInstanceId: instance, nom: `Arme ${instance}`, slot, stats: {}, isExotic: false, perkHashes: perks.map(([, h]) => h), perksParColonne: perks.map(([socketIndex, h]) => ({ socketIndex, hash: h })) } as GearPiece);
// FR : le build d'essai est SOLAIRE : le moteur ne compte que les verbes de l'élément du build (le verbe solaire « Blessure solaire », `scorch` dans le catalogue). / EN: the test build is Solar: the engine only counts verbs of the build's element.
const construire = (armes: GearPiece[], armure: GearPiece[] = []): BuildDraft => ({ ...structuredClone(demoBuild), subclass: { ...structuredClone(demoBuild.subclass), element: "solaire" }, armes, armure });
const sim = (instance: string, colonnes: Record<number, [number, number]>) => Object.entries(colonnes).reduce((s, [i, [c, e]]) => choisir(s, instance, Number(i), { choisi: c, effectif: e }), SIMULATIONS_VIDES());

// ---------- 1. l'application à une pièce ----------
const w1 = arme("w1", [[1, 100], [2, 200], [3, 300]]);
const copie = appliquerSimulationPiece(w1, sim("w1", { 2: [201, 202] })["armes"]["w1"]);
ok("la colonne simulée est REMPLACÉE par le perk à COMPTER (« effectif », version améliorée comprise : 202, pas 201) ; les autres colonnes sont inchangées et l'ordre des prises est conservé", JSON.stringify(copie.perkHashes) === JSON.stringify([100, 202, 300]) && JSON.stringify(copie.perksParColonne) === JSON.stringify([{ socketIndex: 1, hash: 100 }, { socketIndex: 2, hash: 202 }, { socketIndex: 3, hash: 300 }]), copie);
ok("la copie porte les repères : perks simulés, perks RÉELS d'origine (pour que « Détails » marque le vrai roll), nombre de colonnes simulées", copie.perksSimules === true && JSON.stringify(copie.perkHashesReels) === JSON.stringify([100, 200, 300]) && copie.nbColonnesSimulees === 1);
ok("la pièce d'ORIGINE n'est JAMAIS modifiée (le build enregistré, partagé ou équipé reste celui des perks réels)", JSON.stringify(w1.perkHashes) === JSON.stringify([100, 200, 300]) && w1.perksSimules === undefined && w1.perkHashesReels === undefined);
const ajout = appliquerSimulationPiece(w1, sim("w1", { 7: [700, 701] })["armes"]["w1"]);
ok("une colonne sans perk connu (aucun roll réel pour cette prise) reçoit le perk simulé : il est AJOUTÉ à sa place par ordre de prise", JSON.stringify(ajout.perksParColonne!.map((p) => p.socketIndex)) === JSON.stringify([1, 2, 3, 7]) && ajout.perkHashes.includes(701));
const plusieurs = appliquerSimulationPiece(w1, sim("w1", { 1: [101, 101], 3: [301, 302] })["armes"]["w1"]);
ok("plusieurs colonnes simulées à la fois : toutes appliquées, compte exact (2)", JSON.stringify(plusieurs.perkHashes) === JSON.stringify([101, 200, 302]) && plusieurs.nbColonnesSimulees === 2);
ok("sans simulation, avec une simulation vide, ou pour un objet NON possédé (pas d'identifiant d'exemplaire) : la MÊME pièce est rendue", appliquerSimulationPiece(w1, undefined) === w1 && appliquerSimulationPiece(w1, {}) === w1 && (() => { const n = arme(undefined, [[1, 100]]); return appliquerSimulationPiece(n, { 1: { choisi: 5, effectif: 5 } }) === n; })());
// ---------- 1 bis. retour à la pièce RÉELLE (bouton « Forge » de Mon Build) ----------
const redevenue = pieceReelle(copie);
ok("PIÈCE RÉELLE : renvoyer une arme de Mon Build vers la Forge la remet sur son roll RÉEL (perks et colonnes d'origine) et retire tous les repères de simulation : la Forge part du ✓ réel, jamais du roll simulé", JSON.stringify(redevenue.perkHashes) === JSON.stringify([100, 200, 300]) && JSON.stringify(redevenue.perksParColonne) === JSON.stringify(w1.perksParColonne) && redevenue.perksSimules === undefined && redevenue.perkHashesReels === undefined && redevenue.perksParColonneReels === undefined && redevenue.nbColonnesSimulees === undefined, redevenue);
ok("une pièce sans simulation est rendue telle quelle (même objet) ; aller-retour complet : pièce → copie simulée → pièce réelle donne exactement la pièce d'origine", pieceReelle(w1) === w1 && JSON.stringify(pieceReelle(appliquerSimulationPiece(w1, sim("w1", { 1: [101, 101], 3: [301, 302] })["armes"]["w1"]))) === JSON.stringify(w1));
// ---------- 2. l'application à un build ----------
const w2 = arme("w2", [[1, 100]]), w3 = arme("w3", [[1, 100]], "lourde");
const build = construire([w1, w2, w3]);
const s = sim("w1", { 2: [201, 202] });
const eff = appliquerSimulations(build, s);
ok("seules les armes SIMULÉES sont touchées ; DEUX EXEMPLAIRES du même modèle (w2, w3 : mêmes perks réels) restent indépendants et inchangés", eff.armes[0].perksSimules === true && eff.armes[1] === w2 && eff.armes[2] === w3 && nbArmesSimulees(eff) === 1);
ok("le build d'origine n'est pas modifié et rien d'autre n'est copié que les armes (l'armure, la doctrine, l'artefact sont les mêmes objets)", build.armes[0] === w1 && eff.armure === build.armure && eff.subclass === build.subclass && eff.artifact === build.artifact);
ok("rien à appliquer (aucune simulation, ou simulation d'une arme qui n'est pas dans le build) : le MÊME build est rendu, donc les calculs mémorisés ne sont pas relancés pour rien", appliquerSimulations(build, SIMULATIONS_VIDES()) === build && appliquerSimulations(build, sim("autre", { 1: [9, 9] })) === build);
const armureSimulee = construire([w1], [arme("a1", [[1, 100]], "casque", 5005)]);
ok("l'ARMURE n'est jamais touchée, même si une simulation existe pour son identifiant", appliquerSimulations(armureSimulee, sim("a1", { 1: [9, 9] })) === armureSimulee);
// ---------- 3. le magasin partagé ----------
const memoire = (): Stockage & { contenu: Map<string, string> } => { const contenu = new Map<string, string>(); return { contenu, getItem: (c) => contenu.get(c) ?? null, setItem: (c, v) => void contenu.set(c, v) }; };
const st = memoire(); const m = creerMagasin(() => st);
let appels = 0; const desabonner = m.abonner(() => appels++);
m.mettreAJour((x) => choisir(x, "w1", 2, { choisi: 201, effectif: 202 }));
ok("le magasin prévient ses abonnés à chaque modification (c'est ce qui fait changer le score en temps réel) et enregistre aussitôt", appels === 1 && JSON.parse(st.contenu.get(CLE_STOCKAGE_SIMULATIONS)!).armes.w1["2"].e === 202);
m.mettreAJour((x) => x);
ok("une transformation qui ne change rien (même objet) ne prévient personne et n'écrit rien de plus", appels === 1);
desabonner(); m.mettreAJour((x) => choisir(x, "w1", 3, { choisi: 301, effectif: 301 }));
ok("après désabonnement, plus de notification", appels === 1 && m.lire().armes.w1[3].choisi === 301);
const m2 = creerMagasin(() => st);
ok("un NOUVEAU magasin (nouveau démarrage de l'appli) relit ce qui était enregistré", m2.lire().armes.w1[2].effectif === 202 && m2.lire().armes.w1[3].effectif === 301);
// ---------- 4. jusqu'au score ----------
const { db } = creerFausseDb({ [T_OBJET]: {
  100: { displayProperties: { name: "Canon neutre", description: "Améliore la portée." }, itemTypeDisplayName: "Canon" },
  200: { displayProperties: { name: "Chargeur neutre", description: "Plus de balles." }, itemTypeDisplayName: "Chargeur" },
  201: { displayProperties: { name: "Chargeur incendiaire", description: "Les tirs de précision infligent Blessure solaire aux cibles." }, itemTypeDisplayName: "Chargeur" },
} });
const arme2: GearPiece = arme("w1", [[1, 100], [2, 200]]);
const buildReel = construire([arme2]);
const buildSimule = appliquerSimulations(buildReel, sim("w1", { 2: [201, 201] }));
const avant = extraireTextesEffetsBuild(buildReel, db).join(" | "), apres = extraireTextesEffetsBuild(buildSimule, db).join(" | ");
ok("CHAÎNE JUSQU'AU MOTEUR : le moteur de score lit le texte du perk SIMULÉ (« Chargeur incendiaire… Blessure solaire ») et plus celui du perk réel ; sur le build réel, rien n'a changé", /Chargeur incendiaire/.test(apres) && !/Chargeur neutre/.test(apres) && /Chargeur neutre/.test(avant) && !/Blessure solaire/.test(avant), [avant, apres]);
const scoreReel = evaluerBuild(buildReel, demoExigences, db), scoreSimule = evaluerBuild(buildSimule, demoExigences, db);
const pilierVerbes = (r: ReturnType<typeof evaluerBuild>) => r.piliers.find((p) => p.pilier === "verbes_element")!;
const aucunVerbe = /Aucun verbe/i;
ok("LE SCORE CHANGE en temps réel : le pilier des verbes d'élément passe de « aucun verbe détecté » (build réel) à un score plus HAUT avec le perk simulé (Blessure solaire), et le score global monte", aucunVerbe.test(JSON.stringify(pilierVerbes(scoreReel).details)) && !aucunVerbe.test(JSON.stringify(pilierVerbes(scoreSimule).details)) && pilierVerbes(scoreSimule).score > pilierVerbes(scoreReel).score && scoreSimule.scoreGlobal > scoreReel.scoreGlobal, [pilierVerbes(scoreReel).score, pilierVerbes(scoreSimule).score, scoreReel.scoreGlobal, scoreSimule.scoreGlobal]);
const apresRetour = evaluerBuild(appliquerSimulations(buildReel, SIMULATIONS_VIDES()), demoExigences, db);
ok("…et supprimer la simulation ramène EXACTEMENT le score réel (mêmes scores de pilier, même score global) : le retour au roll réel est sans reste", apresRetour.scoreGlobal === scoreReel.scoreGlobal && JSON.stringify(apresRetour.piliers.map((p) => [p.pilier, p.score])) === JSON.stringify(scoreReel.piliers.map((p) => [p.pilier, p.score])));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
