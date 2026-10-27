// FR : ⚠️ AJOUT (24/10/2026, branche draft-mod-armures), « Diag d'abord » : 107 noms de mods du compte de l'utilisateur existent en DEUX versions de coûts différents (1 et 3) dans le même emplacement, jamais équipées toutes les deux. TEST du diagnostic « mods en double » (`diagnosticModsEnDouble`, module PUR `lib/forge/diagnosticEnergie.ts`) : les versions d'un nom (hash, coût, emplacements, catégorie, listes de plugs du Manifest qui les contiennent), combien de pièces les ÉQUIPENT ou les proposent comme DISPONIBLES, la comparaison BRUTE de leurs définitions chemin par chemin (les champs qui diffèrent disent comment départager la vraie version), la fréquence de ces champs, le texte, les cas limites et le BRANCHEMENT (mode développement seulement).
// ⚠️ Données d'ESSAI (`fixtures/fauxManifest.ts` + des doublons fabriqués ici) : ce test ne dit RIEN de ce que différencie réellement les versions du jeu. EN: ⚠️ ADDED - test of the duplicate-mod diagnostic on built test data; says nothing about the real in-game differences.
import { readFileSync } from "node:fs";
import { construireDiagnosticDoublons, formaterDiagnosticDoublons, diagnosticModsEnDouble } from "../../src/lib/forge/diagnosticEnergie";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET, T_PLUGSET } from "./fixtures/fauxManifest";
import type { GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 1100)); };

// ---------- les données d'essai : trois doublons fabriqués ----------
type Def = { plug?: Record<string, unknown>; displayProperties?: Record<string, unknown>; sockets?: { socketEntries: Array<Record<string, unknown>> } } & Record<string, unknown>;
const defs = ajouterArmureForge(manifestArmesDeTest());
const objets = defs[T_OBJET] as Record<number, Def>;
const jeux = defs[T_PLUGSET] as Record<number, { reusablePlugItems: Array<{ plugItemHash: number }> }>;
const poser = (hash: number, cout: number) => { objets[hash].plug = { ...(objets[hash].plug ?? {}), energyCost: { energyCost: cout, energyTypeHash: 1 } }; };
poser(7411, 3); poser(7412, 1); poser(7413, 3); poser(7421, 0); poser(7422, 0);
// (1) « Mod de santé » : 7411 (coût 3, +10) et 7451 (coût 4, autre description, bonus +5, règle d'insertion en plus), dans le MÊME jeu de plugs 8301
objets[7451] = { ...structuredClone(objets[7411]), displayProperties: { name: "Mod de santé", description: "Ancienne version." }, investmentStats: [{ statTypeHash: 8801, value: 5 }] };
objets[7451].plug = { ...(objets[7411].plug ?? {}), energyCost: { energyCost: 4, energyTypeHash: 1 }, insertionRules: [{ failureMessage: "Ancienne règle" }] };
jeux[8301].reusablePlugItems.push({ plugItemHash: 7451 });
// (2) « Mod de classe » : 7412 (coût 1) et 7461 (coût 2, définition IDENTIQUE sauf le coût), 7461 n'existant que dans un AUTRE jeu de plugs (8399) d'un autre modèle (5305)
objets[7461] = structuredClone(objets[7412]); poser(7461, 2);
jeux[8399] = { reusablePlugItems: [{ plugItemHash: 7461 }] };
objets[5305] = { ...structuredClone(objets[5301]), displayProperties: { name: "Casque d'essai bis", icon: "/icons/casque.png" } };
objets[5305].sockets!.socketEntries[2] = { singleInitialItemHash: 7412, reusablePlugSetHash: 8399 };
// (3) « Mod d'armes » : 7413 et 7471, même nom ET même coût (3) : un doublon BÉNIN, compté mais non détaillé
objets[7471] = structuredClone(objets[7413]); jeux[8301].reusablePlugItems.push({ plugItemHash: 7471 });
// FR : les définitions du Manifest portent `hash` et `index` (différents d'une version à l'autre) : sans eux, le contrôle « ces champs ne comptent pas » ne pourrait jamais échouer.
for (const h of [7411, 7451, 7412, 7461]) { (objets[h] as Record<string, unknown>).hash = h; (objets[h] as Record<string, unknown>).index = 1000 + h; }
const { db } = creerFausseDb(defs);

const base = { isExotic: false, rarete: "Légendaire", stats: {}, perkHashes: [] as number[] };
const socles = (mod: number, ajust = 7421) => [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: mod }, { socketIndex: 3, hash: ajust }, { socketIndex: 4, hash: 7431 }];
const a1 = { ...base, itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", perksParColonne: socles(7411), plugsDisponiblesParColonne: { 2: [7411, 7451, 7412, 7413], 3: [7421, 7422] } } as unknown as GearPiece;
const a2 = { ...base, itemHash: 5302, itemInstanceId: "a2", nom: "Plastron exotique d'essai", slot: "torse", classeRequise: "arcaniste", origine: "coffre", isExotic: true, perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7441 }, { socketIndex: 2, hash: 7412 }] } as unknown as GearPiece;
const p6 = { ...base, itemHash: 5305, itemInstanceId: "p6", nom: "Casque d'essai bis", slot: "casque", classeRequise: "titan", origine: "coffre", perksParColonne: socles(7412) } as unknown as GearPiece;
const p8 = { ...base, itemHash: 5301, itemInstanceId: "p8", nom: "Casque à l'ancienne version", slot: "casque", classeRequise: "titan", origine: "coffre", perksParColonne: socles(7451) } as unknown as GearPiece;
const arme = { ...base, itemHash: 5001, itemInstanceId: "w1", nom: "Fusil d'essai", slot: "energie", origine: "titan" } as unknown as GearPiece;
const inconnue = { ...base, itemHash: 999999, itemInstanceId: "z1", nom: "Armure au modèle inconnu", slot: "gants", origine: "titan", perksParColonne: [{ socketIndex: 2, hash: 7411 }] } as unknown as GearPiece;

const d = construireDiagnosticDoublons(db, [a1, a2, p6, arme]);
const n = (nom: string) => d.noms.find((x) => x.nom === nom)!;
const v = (nom: string, hash: number) => n(nom).versions.find((x) => x.hash === hash)!;

// ---------- 1. quels noms ----------
ok("NOMS : cinq noms de mods distincts lus ; DEUX ont plusieurs versions de coûts DIFFÉRENTS (« Mod de classe » 1 / 2, « Mod de santé » 3 / 4) ; le doublon BÉNIN « Mod d'armes » (deux hashes, même coût 3) est compté mais non détaillé ; l'ARME est ignorée", d.nbNomsDistincts === 5 && JSON.stringify(d.noms.map((x) => x.nom)) === JSON.stringify(["Mod de classe", "Mod de santé"]) && d.nbNomsMemeCout === 1, [d.nbNomsDistincts, d.noms.map((x) => x.nom), d.nbNomsMemeCout]);
ok("VERSIONS : rangées par coût croissant (3 puis 4 ; 1 puis 2), un hash par version", JSON.stringify(n("Mod de santé").versions.map((x) => [x.hash, x.cout])) === JSON.stringify([[7411, 3], [7451, 4]]) && JSON.stringify(n("Mod de classe").versions.map((x) => [x.hash, x.cout])) === JSON.stringify([[7412, 1], [7461, 2]]), d.noms);
// ---------- 2. emplacements, catégories, listes ----------
ok("EMPLACEMENTS et CATÉGORIE : « Mod de santé » n'existe que sur le casque (modèle 5301) ; « Mod de classe » (7412) sur le casque ET le torse ; sa version 7461 sur le casque seulement ; toutes en « enhancements.v2_general »", JSON.stringify(v("Mod de santé", 7411).emplacements) === '["casque"]' && JSON.stringify(v("Mod de classe", 7412).emplacements) === '["casque","torse"]' && JSON.stringify(v("Mod de classe", 7461).emplacements) === '["casque"]' && n("Mod de classe").versions.every((x) => x.categoriePlug === "enhancements.v2_general"), n("Mod de classe"));
ok("LISTES DE PLUGS DU MANIFEST : 7411 vient du plug initial ET du jeu 8301 ; 7451 du seul jeu 8301 ; 7412 de l'initial et de 8301 ; 7461 du SEUL jeu 8399, d'un autre modèle : c'est ce qui montre qu'une version n'est pas offerte partout", JSON.stringify(v("Mod de santé", 7411).listes) === '["initial","jeu 8301"]' && JSON.stringify(v("Mod de santé", 7451).listes) === '["jeu 8301"]' && JSON.stringify(v("Mod de classe", 7412).listes) === '["initial","jeu 8301"]' && JSON.stringify(v("Mod de classe", 7461).listes) === '["jeu 8399"]', [v("Mod de santé", 7411).listes, v("Mod de santé", 7451).listes, v("Mod de classe", 7412).listes, v("Mod de classe", 7461).listes]);
// ---------- 3. équipées et disponibles ----------
ok("ÉQUIPÉES : le mod de santé 7411 sur 1 pièce (le casque) et 7451 sur aucune ; le mod de classe 7412 sur 2 pièces (le torse et le casque bis) et 7461 sur aucune", v("Mod de santé", 7411).nbEquipees === 1 && v("Mod de santé", 7451).nbEquipees === 0 && v("Mod de classe", 7412).nbEquipees === 2 && v("Mod de classe", 7461).nbEquipees === 0);
ok("DISPONIBLES SUR L'EXEMPLAIRE : 7411 et 7451 sont proposés par le casque (1 chacun), 7412 aussi ; 7461 par aucun", v("Mod de santé", 7411).nbDisponibles === 1 && v("Mod de santé", 7451).nbDisponibles === 1 && v("Mod de classe", 7412).nbDisponibles === 1 && v("Mod de classe", 7461).nbDisponibles === 0);
ok("RÉSUMÉ DES ÉQUIPÉES : pour chaque nom, UNE seule version est équipée (2 noms), jamais toutes (0), jamais aucune (0)", d.nbUneSeuleEquipee === 2 && d.nbToutesEquipees === 0 && d.nbAucuneEquipee === 0, d);
const dTout = construireDiagnosticDoublons(db, [a1, p8]);
ok("QUAND LES DEUX VERSIONS SONT ÉQUIPÉES (une pièce de chacune) : le nom « Mod de santé » passe dans « toutes les versions équipées » (cas que les données réelles n'ont jamais montré) ; sans pièce équipée du tout : « aucune »", dTout.nbToutesEquipees === 1 && construireDiagnosticDoublons(db, [{ ...a1, perksParColonne: [{ socketIndex: 0, hash: 7401 }] } as unknown as GearPiece]).nbAucuneEquipee === 1, dTout);
// ---------- 4. la comparaison brute ----------
const diff = (nom: string) => Object.fromEntries(n(nom).differences.map((x) => [x.chemin, x.valeurs]));
ok("COMPARAISON BRUTE « Mod de santé » : le coût (3 / 4), la description, le bonus de statistique (10 / 5), la règle d'insertion présente seulement dans la 2ᵉ version (« (absent) » pour la 1ʳᵉ) et l'icône sont rapportés CHEMIN PAR CHEMIN, dans l'ordre des versions", JSON.stringify(diff("Mod de santé")["plug.energyCost.energyCost"]) === '["3","4"]' && JSON.stringify(diff("Mod de santé")["investmentStats[0].value"]) === '["10","5"]' && JSON.stringify(diff("Mod de santé")["displayProperties.description"]) === '["\\"Augmente la santé.\\"","\\"Ancienne version.\\""]' && JSON.stringify(diff("Mod de santé")["plug.insertionRules[0].failureMessage"]) === '["(absent)","\\"Ancienne règle\\""]' && "displayProperties.icon" in diff("Mod de santé"), Object.keys(diff("Mod de santé")));
ok("COMPARAISON BRUTE « Mod de classe » : définitions IDENTIQUES sauf le coût (1 / 2) : le coût est le SEUL chemin qui diffère", JSON.stringify(Object.keys(diff("Mod de classe"))) === '["plug.energyCost.energyCost"]' && JSON.stringify(diff("Mod de classe")["plug.energyCost.energyCost"]) === '["1","2"]', diff("Mod de classe"));
ok("LES CHAMPS D'IDENTIFICATION NE COMPTENT PAS : `hash` et `index` ne sont jamais rapportés comme des différences", !n("Mod de santé").differences.some((x) => x.chemin === "hash" || x.chemin === "index"));
ok("FRÉQUENCES : le coût diffère pour les 2 noms (en premier) ; les autres champs pour 1 seul nom, rangés par ordre alphabétique", d.frequences[0].chemin === "plug.energyCost.energyCost" && d.frequences[0].nb === 2 && d.frequences.slice(1).every((f) => f.nb === 1) && JSON.stringify(d.frequences.slice(1).map((f) => f.chemin)) === JSON.stringify(d.frequences.slice(1).map((f) => f.chemin).sort()), d.frequences);

// ---------- 5. le texte ----------
const t = formaterDiagnosticDoublons(d, 3);
const l = t.split("\n");
ok("TEXTE : en-tête ; « Noms de mods distincts lus : 5 | … DIFFÉRENTS : 2 | … même coût (non détaillés) : 1 » ; « une seule version : 2 | toutes les versions : 0 | aucune : 0 »", l[0] === "Diagnostic : mods en double (même nom, plusieurs versions de coûts différents)" && l[1] === "Noms de mods distincts lus : 5 | noms à plusieurs versions de coûts DIFFÉRENTS : 2 | noms à plusieurs versions de même coût (non détaillés) : 1" && l[2] === "Versions équipées sur vos pièces, par nom : une seule version : 2 | toutes les versions : 0 | aucune : 0", l.slice(0, 4));
ok("TEXTE : la section des champs différents commence par le coût (2 noms), puis les autres", l.includes("  plug.energyCost.energyCost : 2") && l.indexOf("  plug.energyCost.energyCost : 2") < l.indexOf("  displayProperties.description : 1"));
const iSante = l.indexOf("Mod de santé");
ok("TEXTE : le bloc « Mod de santé » : une ligne par version avec hash, coût, emplacements, catégorie, listes, nombre de pièces qui l'équipent et d'exemplaires qui la proposent", l[iSante + 1] === "  hash 7411 | coût 3 | casque | catégorie « enhancements.v2_general » | listes : initial ; jeu 8301 | équipée sur 1 pièce | disponible sur 1 exemplaire" && l[iSante + 2] === "  hash 7451 | coût 4 | casque | catégorie « enhancements.v2_general » | listes : jeu 8301 | équipée sur 0 pièce | disponible sur 1 exemplaire", l.slice(iSante, iSante + 4));
ok("TEXTE : « différences : » liste les chemins avec les valeurs des versions (hors le coût, déjà dit) ; pour « Mod de classe » : « aucune autre que le coût »", l[iSante + 3].startsWith("  différences : displayProperties.description (\"Augmente la santé.\" / \"Ancienne version.\")") && l[iSante + 3].includes("investmentStats[0].value (10 / 5)") && !l[iSante + 3].includes("plug.energyCost") && l[l.indexOf("Mod de classe") + 3] === "  différences : aucune autre que le coût", [l[iSante + 3], l[l.indexOf("Mod de classe") + 3]]);
ok("DÉTERMINISME : le même appel donne exactement le même texte ; `diagnosticModsEnDouble` = construire + formater", diagnosticModsEnDouble(db, [a1, a2, p6, arme]) === t && diagnosticModsEnDouble(db, [a1, a2, p6, arme]) === diagnosticModsEnDouble(db, [a1, a2, p6, arme]));

// ---------- 6. cas limites ----------
ok("AUCUNE ARMURE (liste vide ou seulement une arme) : un message clair, jamais un texte vide ni une erreur", diagnosticModsEnDouble(db, []).includes("Aucune armure chargée") && diagnosticModsEnDouble(db, [arme]).includes("Aucune armure chargée"));
const sansDoublon = diagnosticModsEnDouble(db, [a2]);
ok("AUCUN NOM EN DOUBLE (le plastron seul n'a qu'une version de chaque mod) : « rien à départager », pas un texte vide", sansDoublon.includes("Aucun nom de mod n'a plusieurs versions de coûts différents : rien à départager."), sansDoublon);
const dInc = construireDiagnosticDoublons(db, [inconnue]);
ok("MODÈLE INCONNU du Manifest : aucune erreur, aucun nom lu", dInc.nbNomsDistincts === 0 && dInc.noms.length === 0, dInc);
ok("LES PIÈCES FOURNIES NE SONT PAS MODIFIÉES par le diagnostic", JSON.stringify(a1) === JSON.stringify({ ...base, itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", perksParColonne: socles(7411), plugsDisponiblesParColonne: { 2: [7411, 7451, 7412, 7413], 3: [7421, 7422] } }));

// ---------- 7. le branchement (lecture du code source) ----------
const fenetre = readFileSync("src/components/InventaireArmures.tsx", "utf-8");
const registre = readFileSync("src/lib/diagnosticsArchives.ts", "utf-8");
const sansCommentaires = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
ok("BRANCHEMENT : le bouton « mods en double » n'existe qu'en MODE DÉVELOPPEMENT et tant que le drapeau `modsEnDouble` du registre est vrai ; il passe TOUTES les pièces chargées (`pieces`), pas la liste filtrée", /import\.meta\.env\.DEV && DIAGNOSTICS_ACTIFS\.modsEnDouble && \(/.test(sansCommentaires(fenetre)) && /diagnosticModsEnDouble\(db, pieces\)/.test(sansCommentaires(fenetre)) && /modsEnDouble: true/.test(registre));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
