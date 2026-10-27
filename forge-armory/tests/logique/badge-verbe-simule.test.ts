// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « Dans le scoring, bloc Effets du Build, quand un des verbes vient d'une perk simulée, c'est possible de mettre le badge « simulé » à côté de l'origine du verbe ? » : TEST de la logique : (1) DE BOUT EN BOUT : une armure dont un mod simulé applique « Blessure solaire » : le détail du pilier « Effets du Build » dit « Blessure solaire (Mod de grenade solaire 🔨 simulé) » ; sans simulation, AUCUN marqueur nulle part ; (2) `extraireNomsPerksSimules` : armures et armes, règle « TOUTES les occurrences simulées » (le même perk présent aussi en réel n'est pas marqué), simulation égale au réel, build sans simulation ; (3) `scoreVerbesDetectes` : origine VISIBLE (entre parenthèses), origine CACHÉE (même nom que le verbe : le badge va à côté du verbe), plusieurs origines dont une seule simulée, texte INCHANGÉ sans noms simulés.
// EN: ⚠️ ADDED - test of the "simulated" marker on a verb's origin in the "Build effects" pillar.
import { appliquerSimulations, appliquerSimulationPiece } from "../../src/lib/forge/appliquerSimulation";
import { choisir, SIMULATIONS_VIDES } from "../../src/lib/forge/simulation";
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { detecterVerbes, scoreVerbesDetectes, extraireNomsPerksSimules, MARQUE_SIMULE } from "../../src/lib/scoring/verbes";
import { demoBuild, demoExigences } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, ajouterArmeRevisionAPaliers, T_OBJET, T_PLUGSET } from "./fixtures/fauxManifest";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 900)); };
const { db } = creerFausseDb((() => {
  const d = ajouterArmureForge(manifestArmesDeTest());
  ajouterArmeRevisionAPaliers(d);
  const objets = d[T_OBJET] as Record<number, unknown>, jeux = d[T_PLUGSET] as Record<number, unknown>;
  const pl = (nom: string, categorie: string, inv: Array<[number, number]>, description = "") => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, plug: { plugCategoryIdentifier: categorie }, investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7414] = pl("Mod de grenade solaire", "enhancements.v2_general", [[8803, 10]], "Les grenades infligent Blessure solaire aux cibles.");
  jeux[8301] = { reusablePlugItems: [7411, 7412, 7413, 7414].map((h) => ({ plugItemHash: h })) };
  return d;
})());
const casque = { itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", isExotic: false, rarete: "Légendaire", icone: "", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }] } as unknown as GearPiece;
const construire = (armes: GearPiece[], armure: GearPiece[]): BuildDraft => ({ ...structuredClone(demoBuild), subclass: { ...structuredClone(demoBuild.subclass), element: "solaire" }, armes, armure });
const simArmure = (instance: string, h: number) => choisir(SIMULATIONS_VIDES(), instance, 2, { choisi: h, effectif: h }, "armures");
const detailsVerbes = (b: BuildDraft) => evaluerBuild(b, demoExigences, db).piliers.find((p) => p.pilier === "verbes_element")!.details;

// ---------- 1. DE BOUT EN BOUT ----------
const reel = construire([], [casque]);
const simule = appliquerSimulations(reel, simArmure("a1", 7414), db);
const dReel = detailsVerbes(reel), dSim = detailsVerbes(simule);
ok("DE BOUT EN BOUT : le mod SIMULÉ « Mod de grenade solaire » applique « Blessure solaire » : la ligne du verbe porte le badge à côté de son ORIGINE : « Blessure solaire (Mod de grenade solaire 🔨 simulé) »", dSim.includes(`  Blessure solaire (Mod de grenade solaire${MARQUE_SIMULE})`), dSim);
ok("…et seule cette origine est marquée : le marqueur n'apparaît qu'UNE fois dans tout le détail du pilier (le verbe « Embrasement » de la chaîne et les en-têtes ne sont pas marqués)", dSim.filter((l) => l.includes(MARQUE_SIMULE)).length === 1, dSim);
ok("SANS SIMULATION : aucun marqueur nulle part dans le détail du pilier (build réel)", dReel.every((l) => !l.includes(MARQUE_SIMULE)), dReel);
ok("RETIRER LA SIMULATION ramène EXACTEMENT le détail du build réel (aucun marqueur résiduel)", JSON.stringify(detailsVerbes(appliquerSimulations(reel, SIMULATIONS_VIDES(), db))) === JSON.stringify(dReel));
ok("LE SCORE DU PILIER N'EST PAS MODIFIÉ PAR LE BADGE : mêmes scores et mêmes poids que sans badge (seul le texte du détail change)", (() => { const p = evaluerBuild(simule, demoExigences, db).piliers.find((x) => x.pilier === "verbes_element")!; return p.score === 24 && p.details.length === dSim.length; })());

// ---------- 2. les NOMS des perks simulés ----------
ok("NOMS SIMULÉS d'une armure : « Mod de grenade solaire » (le mod équipé réel « Mod de santé », remplacé, n'y est pas) ; build réel : ensemble VIDE", JSON.stringify([...extraireNomsPerksSimules(simule, db)]) === '["Mod de grenade solaire"]' && extraireNomsPerksSimules(reel, db).size === 0, [...extraireNomsPerksSimules(simule, db)]);
const casque2Reel = { ...casque, itemInstanceId: "a2", perkHashes: [7401, 7402, 7414, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7414 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }] } as unknown as GearPiece;
const mixte = appliquerSimulations(construire([], [casque, casque2Reel]), simArmure("a1", 7414), db);
ok("MÊME PERK EN RÉEL AILLEURS : si une autre armure porte DÉJÀ « Mod de grenade solaire » en réel, le verbe existerait sans la simulation : le nom n'est PAS marqué (règle « toutes les occurrences simulées »)", extraireNomsPerksSimules(mixte, db).size === 0 && detailsVerbes(mixte).every((l) => !l.includes(MARQUE_SIMULE)), [[...extraireNomsPerksSimules(mixte, db)], detailsVerbes(mixte)]);
const casqueB = { ...casque, itemInstanceId: "a2" } as unknown as GearPiece;
const deuxSim = appliquerSimulations(construire([], [casque, casqueB]), { ...simArmure("a1", 7414), armures: { ...simArmure("a1", 7414).armures, ...simArmure("a2", 7414).armures } }, db);
ok("MÊME PERK SIMULÉ SUR DEUX ARMURES : toutes les occurrences sont simulées : le nom est marqué", JSON.stringify([...extraireNomsPerksSimules(deuxSim, db)]) === '["Mod de grenade solaire"]');
ok("UNE SIMULATION ÉGALE AU RÉEL ne marque rien (le mod équipé choisi à nouveau n'est pas une simulation)", extraireNomsPerksSimules(appliquerSimulations(reel, simArmure("a1", 7411), db), db).size === 0);
const arme = { itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", slot: "energie", typeArme: "Fusil à impulsion", origine: "titan", equipe: true, stats: {}, isExotic: false, rarete: "Légendaire", icone: "", perkHashes: [6901, 6912, 6921, 6931], perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }] } as unknown as GearPiece;
const armeSim = appliquerSimulationPiece(arme, { 1: { choisi: 6903, effectif: 6903 } });
const noms = extraireNomsPerksSimules(construire([armeSim], []), db);
ok("NOMS SIMULÉS D'UNE ARME : le perk simulé « Canon Y » est repéré, pas « Canon X » (le perk réel remplacé) ni les perks non simulés de l'arme", noms.has("Canon Y") && !noms.has("Canon X") && noms.size === 1, [...noms]);
ok("ARME NON SIMULÉE : aucun nom ; une arme simulée sans perks réels mémorisés (copie ancienne) ne plante pas et ne marque rien", extraireNomsPerksSimules(construire([arme], []), db).size === 0 && extraireNomsPerksSimules(construire([{ ...armeSim, perkHashesReels: undefined } as unknown as GearPiece], []), db).size === 0);

// ---------- 3. les LIGNES de détail ----------
const textes = ["Mod de grenade solaire — Les grenades infligent Blessure solaire aux cibles.", "Siphon quelconque — Les cibles touchées par vos armes subissent Blessure solaire."];
const verbes = detecterVerbes(textes);
const ligne = (nomsSim: string[] | undefined) => scoreVerbesDetectes(verbes, nomsSim ? new Set(nomsSim) : undefined).details.find((l) => l.includes("Blessure solaire"))!;
ok("PLUSIEURS ORIGINES, UNE SEULE SIMULÉE : « Blessure solaire (Mod de grenade solaire 🔨 simulé, Siphon quelconque) » : seul le nom simulé porte le badge", ligne(["Mod de grenade solaire"]) === `  Blessure solaire (Mod de grenade solaire${MARQUE_SIMULE}, Siphon quelconque)`, ligne(["Mod de grenade solaire"]));
ok("LES DEUX ORIGINES SIMULÉES : les deux portent le badge", ligne(["Mod de grenade solaire", "Siphon quelconque"]) === `  Blessure solaire (Mod de grenade solaire${MARQUE_SIMULE}, Siphon quelconque${MARQUE_SIMULE})`);
ok("SANS NOMS SIMULÉS (ou ensemble vide) : le détail est EXACTEMENT celui d'avant la fonctionnalité", ligne(undefined) === "  Blessure solaire (Mod de grenade solaire, Siphon quelconque)" && ligne([]) === ligne(undefined) && JSON.stringify(scoreVerbesDetectes(verbes).details) === JSON.stringify(scoreVerbesDetectes(verbes, new Set()).details));
const cachee = detecterVerbes(["Blessure solaire — Les cibles touchées subissent Blessure solaire."]);
const lc = (sim: string[]) => scoreVerbesDetectes(cachee, new Set(sim)).details.find((l) => l.includes("Blessure solaire") && l.startsWith("  "))!;
ok("ORIGINE CACHÉE (le perk porte le NOM du verbe : l'appli n'affiche pas cette origine) : le badge est placé à côté du VERBE : « Blessure solaire 🔨 simulé »", lc(["Blessure solaire"]) === `  Blessure solaire${MARQUE_SIMULE}` && lc([]) === "  Blessure solaire", [lc(["Blessure solaire"]), lc([])]);
ok("UN NOM SIMULÉ QUI N'EST L'ORIGINE D'AUCUN VERBE ne change rien", ligne(["Un autre mod"]) === ligne(undefined));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
