// FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - test de l'APPARIEMENT des perks améliorés (`lib/manifest/perksAmeliores.ts`). Première partie : sur les DONNÉES RÉELLES copiées par l'utilisateur (deux Confiance, Défense dorée, Grande Faucheuse temps perdu : `fixtures/perks-diagnostics-reels.json`), colonne par colonne ; seconde partie : les cas limites de la fonction pure et la lecture du type dans un faux Manifest.
// EN: ⚠️ ADDED - test of enhanced-perk pairing, first on the user's REAL diagnostic data, then on edge cases.
import fs from "node:fs";
import { apparierPerksAmeliores, typeEstAmeliore, MOT_TYPE_AMELIORE } from "../../src/lib/manifest/perksAmeliores";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
interface Opt { nom: string; hash: number; type: string; plug: string }
interface Col { libelle: string; prise: number; mods: boolean; masquee: string | null; options: Opt[] }
interface ArmeDiag { cle: string; nom: string; hash: number; colonnes: Col[] }
const armes: ArmeDiag[] = JSON.parse(fs.readFileSync("tests/logique/fixtures/perks-diagnostics-reels.json", "utf-8")).armes;
const arme = (cle: string) => armes.find((a) => a.cle === cle)!;
const est = (o: Opt) => MOT_TYPE_AMELIORE.test(o.type);
const paires = (c: Col) => apparierPerksAmeliores(c.options, est);
const col = (a: ArmeDiag, libelle: string) => a.colonnes.find((c) => c.libelle === libelle)!;

// ---------- 1. les données réelles : Confiance, révision A (la « à paliers ») ----------
const A = arme("A");
const attendu: [string, number, number, number][] = [["Colonne 2", 22, 11, 11], ["Colonne 3", 26, 13, 13], ["Colonne 4", 14, 7, 7], ["Colonne 5", 14, 7, 7], ["Colonne 9", 2, 1, 1], ["Mods utilisables", 35, 20, 15]];   // [colonne, options, éléments affichés, paires]
for (const [lib, nbOptions, nbItems, nbPaires] of attendu) {
  const c = col(A, lib), r = paires(c);
  ok(`Confiance A, ${lib} : ${nbOptions} options lues → ${nbItems} éléments affichés dont ${nbPaires} paire(s) base + amélioré`, c.options.length === nbOptions && r.length === nbItems && r.filter((x) => x.ameliore).length === nbPaires, [c.options.length, r.length, r.filter((x) => x.ameliore).length]);
}
const toutes = ["Colonne 2", "Colonne 3", "Colonne 4", "Colonne 5", "Colonne 9", "Mods utilisables"].flatMap((l) => paires(col(A, l)));
ok("Confiance A : 54 paires au total (53 normales + 1 reconnue par la position) ; toutes les paires ont une base NON améliorée et un amélioré typé « amélioré », sauf l'unique cas non confirmé", toutes.filter((x) => x.ameliore).length === 54 && toutes.filter((x) => x.ameliore && !x.incertain).every((x) => !est(x.option) && est(x.ameliore!)) && toutes.filter((x) => x.incertain).length === 1);
const cas = toutes.find((x) => x.incertain)!;
ok("le SEUL cas ambigu est « Chargeur abandonné » : la version de base est celle qui vient en premier (hash 4134353779), l'améliorée la seconde (hash 3678323611), signalée « incertain »", cas.option.nom === "Chargeur abandonné" && cas.option.hash === 4134353779 && cas.ameliore!.hash === 3678323611, cas);
ok("une paire normale est correcte : « Frein tête-de-flèche » = base 839105230 + améliorée 3048246338", (() => { const x = paires(col(A, "Colonne 2")).find((y) => y.option.nom === "Frein tête-de-flèche")!; return x.option.hash === 839105230 && x.ameliore?.hash === 3048246338 && !x.incertain; })());
const mods = paires(col(A, "Mods utilisables"));
ok("les modificateurs améliorés SANS base (« Stabilité améliorée », « Portée améliorée »…) restent des options ordinaires, non appariées", mods.filter((x) => !x.ameliore && est(x.option)).length === 4 && mods.some((x) => x.option.nom === "Stabilité améliorée" && !x.ameliore), mods.filter((x) => est(x.option)).map((x) => x.option.nom));
const intrinseque = paires(col(A, "Colonne 1")), paliers = paires(col(A, "Colonne 13"));
ok("l'armature (colonne 1) et les « Amélioration de palier » (colonne 13, masquée) ne produisent aucune paire", intrinseque.every((x) => !x.ameliore) && paliers.every((x) => !x.ameliore) && paliers.length === 4);
const nbMasquees = A.colonnes.filter((c) => c.masquee).length;
ok(`même si on appliquait l'appariement aux ${nbMasquees} colonnes MASQUÉES de Confiance A (revêtements, paliers de masterwork…), rien ne serait fusionné à tort : leurs doublons ne sont pas des jumeaux (aucun type « amélioré » dans ces colonnes)`, A.colonnes.filter((c) => c.masquee).every((c) => paires(c).length === c.options.length), A.colonnes.filter((c) => c.masquee).map((c) => [c.libelle, c.options.length, paires(c).length]));
// ---------- 2. les trois autres armes ----------
for (const cle of ["B", "DD"]) {
  const a = arme(cle), visibles = a.colonnes.filter((c) => !c.masquee);
  ok(`${a.nom} (${a.hash}) : une seule option par colonne de perks et aucune amélioration : AUCUNE paire dans les ${visibles.length} colonnes visibles`, visibles.every((c) => paires(c).every((x) => !x.ameliore)) && visibles.flatMap((c) => c.options).filter(est).length === 0);
}
const GF = arme("GF");
ok("Grande Faucheuse (temps perdu) : ses colonnes de perks n'ont qu'une option ; seuls la colonne d'origine (1 paire) et les mods (15 paires) en ont ; les colonnes de fabrication (améliorés sans base) ne sont pas appariées", paires(col(GF, "Colonne 9")).filter((x) => x.ameliore).length === 1 && paires(col(GF, "Mods utilisables")).filter((x) => x.ameliore).length === 15 && GF.colonnes.filter((c) => /^Colonne (2|3|4|5)$/.test(c.libelle)).every((c) => paires(c).every((x) => !x.ameliore)) && paires(col(GF, "Colonne 13")).every((x) => !x.ameliore));
const typesVus = [...new Set(armes.flatMap((a) => a.colonnes.flatMap((c) => c.options.map((o) => o.type))))].sort();
ok("la reconnaissance par le TYPE affiché : exactement cinq types d'objets « améliorés » existent dans les données réelles (Attribut, Canon, Chargeur, Mod d'arme, Particularité d'origine), et aucun autre type ne l'est", JSON.stringify(typesVus.filter((t) => MOT_TYPE_AMELIORE.test(t))) === JSON.stringify(["Attribut amélioré", "Canon amélioré", "Chargeur amélioré", "Mod d'arme amélioré", "Particularité d'origine améliorée"]) && !typesVus.filter((t) => !/am[eé]lior/i.test(t)).some((t) => MOT_TYPE_AMELIORE.test(t)), typesVus);
// ---------- 3. cas limites de la fonction pure ----------
const o = (nom: string, hash: number, am = false) => ({ nom, hash, am });
const f = (l: ReturnType<typeof o>[]) => apparierPerksAmeliores(l, (x) => x.am);
const r1 = f([o("Coup rapide", 1), o("Coup rapide", 2, true), o("Hors-la-loi", 3)]);
ok("cas simple : la paire est fusionnée sur la base, le perk seul reste seul, l'ordre est celui des bases", r1.length === 2 && r1[0].option.hash === 1 && r1[0].ameliore?.hash === 2 && !r1[1].ameliore, r1);
const r2 = f([o("Coup rapide", 2, true), o("Coup rapide", 1)]);
ok("même si l'amélioré est listé AVANT sa base, les rôles sont corrects (base = non amélioré)", r2.length === 1 && r2[0].option.hash === 1 && r2[0].ameliore?.hash === 2 && !r2[0].incertain, r2);
ok("deux « améliorés » de même nom ne sont PAS fusionnés ; trois homonymes non plus", f([o("X", 1, true), o("X", 2, true)]).length === 2 && f([o("X", 1), o("X", 2, true), o("X", 3)]).length === 3);
const r3 = f([o("Munitions", 1), o("Munitions", 2)]);
ok("GARDE : deux homonymes sans AUCUN amélioré dans la colonne ne sont PAS fusionnés (rien ne prouve qu'ils soient jumeaux)", r3.length === 2 && r3.every((x) => !x.ameliore), r3);
const r4 = f([o("Autre", 5, true), o("Munitions", 1), o("Munitions", 2)]);
ok("REPLI PAR LA POSITION : même deux homonymes sans type « amélioré », DANS une colonne qui contient des améliorés : fusionnés, le second est l'amélioré, marqué « incertain »", r4.length === 2 && r4[1].option.hash === 1 && r4[1].ameliore?.hash === 2 && r4[1].incertain === true, r4);
const r5 = apparierPerksAmeliores([{ nom: "Frénésie", hash: 1 }, { nom: "FRENESIE", hash: 2 }], (x) => x.hash === 2);
ok("les noms sont comparés sans accents ni majuscules", r5.length === 1 && r5[0].ameliore?.hash === 2, r5);
ok("une liste vide ou sans doublon est rendue telle quelle (un élément par option, sans paire)", f([]).length === 0 && f([o("A", 1), o("B", 2), o("C", 3, true)]).every((x) => !x.ameliore) && f([o("A", 1), o("B", 2), o("C", 3, true)]).length === 3);
// ---------- 4. lecture du type dans un faux Manifest ----------
const { db } = creerFausseDb({ [T_OBJET]: { 1: { displayProperties: { name: "Canon" }, itemTypeDisplayName: "Canon amélioré" }, 2: { displayProperties: { name: "Canon" }, itemTypeDisplayName: "Canon" }, 3: { displayProperties: { name: "Trait" }, itemTypeDisplayName: "Enhanced Trait" }, 4: { displayProperties: { name: "Sans type" } } } });
ok("`typeEstAmeliore` lit le type affiché dans le Manifest : « Canon amélioré » oui, « Canon » non, « Enhanced Trait » oui, type absent ou objet inconnu non", typeEstAmeliore(db, 1) && !typeEstAmeliore(db, 2) && typeEstAmeliore(db, 3) && !typeEstAmeliore(db, 4) && !typeEstAmeliore(db, 99));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
