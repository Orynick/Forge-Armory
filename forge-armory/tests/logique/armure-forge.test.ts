// FR : ⚠️ AJOUT (15/10/2026, v0.4.12) - test du module PUR de la FORGE DES ARMURES (`lib/forge/armure.ts`) et de la résolution partagée des statistiques (`lib/manifest/statsArmure.ts`) : les COLONNES d'une armure possédée (emplacements fixes, modifiables, cosmétiques), l'EFFET d'un mod simulé sur les six statistiques, les cas limites et le diagnostic. Faux Manifest (`ajouterArmureForge`). ⚠️ Ne dit RIEN de la structure réelle des armures du compte de l'utilisateur (non vérifiée : voir le diagnostic en `npm run dev`).
// EN: ⚠️ ADDED - test of the pure armor Forge module: columns (fixed/changeable/cosmetic), stat effect of simulated mods, edge cases, diagnostic.
import { colonnesArmure, statsSimulees, diagnosticArmure, lirePlugArmure } from "../../src/lib/forge/armure";
import { resoudreStatKey } from "../../src/lib/manifest/statsArmure";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, ajouterSaisons } from "./fixtures/fauxManifest";
import type { GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 700)); };
const { db } = creerFausseDb(ajouterSaisons(ajouterArmureForge(manifestArmesDeTest()), [5301]));
const base = { isExotic: false, rarete: "Légendaire", icone: "https://www.bungie.net/icons/x.png", stats: {} };
const casque = { ...base, itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [7411, 7412, 7413], 3: [7421, 7422], 4: [7431, 7432, 7433] } } as unknown as GearPiece;
const plastron = { ...base, itemHash: 5302, itemInstanceId: "a2", nom: "Plastron exotique d'essai", slot: "torse", classeRequise: "arcaniste", origine: "coffre", isExotic: true, stats: { sante: 30, melee: 5, grenade: 5, super: 20, classe: 10, arme: 20 }, perkHashes: [7401, 7441, 7412], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7441 }, { socketIndex: 2, hash: 7412 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7441], 2: [7411, 7412, 7413] } } as unknown as GearPiece;
const marque = { ...base, itemHash: 5303, itemInstanceId: "a3", nom: "Marque de classe d'essai", slot: "marque", classeRequise: "chasseur", origine: "chasseur", perkHashes: [7441], perksParColonne: [{ socketIndex: 0, hash: 7441 }], plugsDisponiblesParColonne: { 0: [7441] } } as unknown as GearPiece;
const sansColonnes = { ...base, itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", classeRequise: "arcaniste", origine: "arcaniste", perkHashes: [] } as unknown as GearPiece;
const idx = (cs: ReturnType<typeof colonnesArmure>) => cs.map((c) => c.socketIndex);
const hashes = (c: { options: { hash: number }[] }) => c.options.map((o) => o.hash);
const col = (cs: ReturnType<typeof colonnesArmure>, i: number) => cs.find((c) => c.socketIndex === i)!;

// ---------- résolution des statistiques par le NOM (déplacée d'inventaire.ts : comportement identique) ----------
ok("RÉSOLUTION DES STATISTIQUES par le nom (français et anglais, accents ignorés) : Santé/Health → sante ; Corps à corps/Melee → melee ; Grenade ; Super ; Classe/Class/Compétence de classe → classe ; Armes/Weapons → arme ; un nom inconnu → rien", resoudreStatKey("Santé") === "sante" && resoudreStatKey("Health") === "sante" && resoudreStatKey("Corps à corps") === "melee" && resoudreStatKey("Melee") === "melee" && resoudreStatKey("Grenade") === "grenade" && resoudreStatKey("Super") === "super" && resoudreStatKey("Classe") === "classe" && resoudreStatKey("Class Ability") === "classe" && resoudreStatKey("Armes") === "arme" && resoudreStatKey("Weapons") === "arme" && resoudreStatKey("Inconnue") === undefined);
// ---------- les colonnes ----------
const cs = colonnesArmure(db, casque);
ok("COLONNES d'un casque : quatre emplacements (archétype, amélioration, mod, ajustement) dans l'ordre des prises ; l'emplacement cosmétique de teinture est MASQUÉ par défaut", JSON.stringify(idx(cs)) === "[0,1,2,3]", idx(cs));
ok("chaque colonne porte le NOM de sa catégorie de socket lu dans le Manifest (« Archétype », « Mods d'armure »)", col(cs, 0).categorie === "Archétype" && col(cs, 1).categorie === "Archétype" && col(cs, 2).categorie === "Mods d'armure" && col(cs, 3).categorie === "Mods d'armure", cs.map((c) => c.categorie));
ok("le plug ÉQUIPÉ vient en premier, puis les autres plugs DISPONIBLES sur l'exemplaire, sans doublon : mods 7411 (équipé), 7412, 7413 ; ajustements 7421 (équipé), 7422 ; archétype : 7401 seul", JSON.stringify(hashes(col(cs, 2))) === "[7411,7412,7413]" && JSON.stringify(hashes(col(cs, 3))) === "[7421,7422]" && JSON.stringify(hashes(col(cs, 0))) === "[7401]" && col(cs, 2).equipe.nom === "Mod de santé", cs.map(hashes));
ok("FIXES : l'archétype (catégorie armor_stats) et l'amélioration (armor.masterworks) ne sont jamais modifiables ; MODIFIABLES : le mod et l'ajustement (deux plugs ou plus, ni fixes ni cosmétiques)", col(cs, 0).fixe && !col(cs, 0).modifiable && col(cs, 1).fixe && !col(cs, 1).modifiable && !col(cs, 2).fixe && col(cs, 2).modifiable && col(cs, 3).modifiable, cs.map((c) => [c.socketIndex, c.fixe, c.modifiable]));
const avecCosmetiques = colonnesArmure(db, casque, true);
ok("avec « afficher les cosmétiques » : la teinture (3 plugs disponibles) apparaît, marquée COSMÉTIQUE et JAMAIS modifiable malgré ses trois plugs", JSON.stringify(idx(avecCosmetiques)) === "[0,1,2,3,4]" && col(avecCosmetiques, 4).cosmetique && !col(avecCosmetiques, 4).modifiable && col(avecCosmetiques, 4).options.length === 3, col(avecCosmetiques, 4));
const csExo = colonnesArmure(db, plastron);
ok("ARMURE EXOTIQUE : le perk exotique (catégorie « intrinsics ») est fixe ; l'emplacement de mod reste modifiable, avec le mod réellement équipé (7412) en tête", col(csExo, 1).fixe && !col(csExo, 1).modifiable && col(csExo, 2).modifiable && col(csExo, 2).equipe.hash === 7412 && JSON.stringify(hashes(col(csExo, 2))) === "[7412,7411,7413]", csExo.map((c) => [c.socketIndex, c.fixe, c.modifiable, hashes(c)]));
const csMarque = colonnesArmure(db, marque);
ok("UNE MARQUE DE CLASSE à perk exotique seul : une colonne, fixe, rien de modifiable", csMarque.length === 1 && csMarque[0].fixe && csMarque.every((c) => !c.modifiable), csMarque);
ok("une armure SANS emplacements lus (pas de `perksParColonne`) : aucune colonne, sans erreur", colonnesArmure(db, sansColonnes).length === 0);
const sansDispo = { ...casque, plugsDisponiblesParColonne: undefined } as GearPiece;
ok("SANS disponibilité lue sur l'exemplaire (inventaire chargé avant la mise à jour) : les colonnes existent avec le seul plug équipé, et RIEN n'est modifiable (la donnée décide)", colonnesArmure(db, sansDispo).length === 4 && colonnesArmure(db, sansDispo).every((c) => c.options.length === 1 && !c.modifiable));
const inconnu = { ...casque, perksParColonne: [...casque.perksParColonne!, { socketIndex: 9, hash: 999999 }] } as GearPiece;
ok("un plug ILLISIBLE dans le Manifest (hash inconnu) est ignoré sans erreur ; le plug d'un ornement est ignoré parmi les options", colonnesArmure(db, inconnu).length === 4 && lirePlugArmure(db, 999999) === null);
ok("la lecture d'un plug garde ses statistiques résolues par le nom : le mod de santé donne +10 de santé, l'ajustement −5 de grenade et +5 de mêlée", lirePlugArmure(db, 7411)?.stats.sante === 10 && lirePlugArmure(db, 7421)?.stats.grenade === -5 && lirePlugArmure(db, 7421)?.stats.melee === 5, [lirePlugArmure(db, 7411)?.stats, lirePlugArmure(db, 7421)?.stats]);
// ---------- l'effet sur les statistiques ----------
const sans = statsSimulees(db, casque);
ok("SANS simulation : aucune différence, les statistiques simulées sont les réelles, zéro changement", JSON.stringify(sans.delta) === "{}" && sans.nbChangements === 0 && JSON.stringify(sans.simulees) === JSON.stringify(casque.stats));
const unMod = statsSimulees(db, casque, { 2: { choisi: 7412, effectif: 7412 } });
ok("UN MOD simulé (le mod de classe à la place du mod de santé) : santé −10, classe +10, un changement ; la somme des six statistiques est inchangée", unMod.delta.sante === -10 && unMod.delta.classe === 10 && unMod.nbChangements === 1 && unMod.simulees.sante === 10 && unMod.simulees.classe === 22 && unMod.simulees.melee === 10, unMod);
const mod2 = statsSimulees(db, casque, { 2: { choisi: 7413, effectif: 7413 } });
ok("le mod d'armes à la place du mod de santé : santé −10, armes +10", mod2.delta.sante === -10 && mod2.delta.arme === 10 && mod2.simulees.arme === 35, mod2);
const ajust = statsSimulees(db, casque, { 3: { choisi: 7422, effectif: 7422 } });
ok("UN AJUSTEMENT simulé (super vers classe à la place de mêlée vers grenade) : mêlée −5, grenade +5, super +5, classe −5", ajust.delta.melee === -5 && ajust.delta.grenade === 5 && ajust.delta.super === 5 && ajust.delta.classe === -5, ajust);
const deux = statsSimulees(db, casque, { 2: { choisi: 7412, effectif: 7412 }, 3: { choisi: 7422, effectif: 7422 } });
ok("DEUX emplacements simulés : les différences s'additionnent (classe +10 −5 = +5, santé −10, mêlée −5, grenade +5, super +5), deux changements", deux.delta.classe === 5 && deux.delta.sante === -10 && deux.delta.melee === -5 && deux.delta.grenade === 5 && deux.delta.super === 5 && deux.nbChangements === 2, deux);
const ignores = statsSimulees(db, casque, { 2: { choisi: 7411, effectif: 7411 }, 0: { choisi: 9999, effectif: 9999 }, 4: { choisi: 7432, effectif: 7432 }, 3: { choisi: 424242, effectif: 424242 } });
ok("SONT IGNORÉS : un choix égal au plug équipé, un choix sur une colonne FIXE, sur une colonne COSMÉTIQUE, ou sur un plug que l'exemplaire ne propose pas : aucune différence", JSON.stringify(ignores.delta) === "{}" && ignores.nbChangements === 0, ignores);
const fixeMulti = { ...casque, plugsDisponiblesParColonne: { ...casque.plugsDisponiblesParColonne, 1: [7402, 7412, 7413] } } as GearPiece;
const csFixeMulti = colonnesArmure(db, fixeMulti);
ok("UN EMPLACEMENT FIXE auquel l'exemplaire proposerait PLUSIEURS plugs (l'amélioration d'armure, trois plugs listés) reste FIXE et non modifiable : la règle l'emporte sur la donnée ; ses plugs sont listés mais le choix d'un autre plug est IGNORÉ dans le calcul des statistiques", col(csFixeMulti, 1).options.length === 3 && col(csFixeMulti, 1).fixe && !col(csFixeMulti, 1).modifiable && JSON.stringify(statsSimulees(db, fixeMulti, { 1: { choisi: 7412, effectif: 7412 } }).delta) === "{}", csFixeMulti.map((c) => [c.socketIndex, c.options.length, c.fixe, c.modifiable]));
const copieStats = JSON.stringify(casque.stats); statsSimulees(db, casque, { 2: { choisi: 7413, effectif: 7413 } });
ok("le calcul ne MODIFIE jamais la pièce réelle (ses statistiques et ses plugs restent ceux de l'inventaire)", JSON.stringify(casque.stats) === copieStats && JSON.stringify(casque.perkHashes) === "[7401,7402,7411,7421,7431]");
const exo = statsSimulees(db, plastron, { 2: { choisi: 7411, effectif: 7411 } });
ok("armure exotique : le mod de santé à la place du mod de classe donne santé +10 et classe −10", exo.delta.sante === 10 && exo.delta.classe === -10 && exo.simulees.sante === 40, exo);
// ---------- le diagnostic ----------
const d = diagnosticArmure(db, inconnu);
ok("DIAGNOSTIC (npm run dev) : il décrit la pièce, sa saison (filigrane et seasonHash), ses statistiques, et PRISE PAR PRISE la catégorie, le plug équipé, les plugs disponibles et le jugement « cosmétique / fixe / modifiable » (cosmétiques compris) ; un plug illisible est signalé", /Armure : Casque de bastion d'essai \(hash 5301\)/.test(d) && /Saison : seasonHash = 9001 → Saison de la Sorcière, n° 22 \| filigrane : \/img\/saison-sorciere\.png/.test(d) && /Statistiques réelles : sante 20/.test(d) && /prise 2 \| catégorie « Mods d'armure » \| équipé : Mod de santé \(hash 7411.*disponibles : 3.*cosmétique : non \| fixe : non \| modifiable : OUI/.test(d) && /prise 0 .*fixe : oui \| modifiable : non/.test(d) && /prise 4 .*cosmétique : oui/.test(d) && /prise 9 \| plug illisible dans le Manifest \(hash 999999\)/.test(d), d);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
