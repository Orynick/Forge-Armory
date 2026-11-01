// FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures), OPTIMISEUR de statistiques d'armure, étape 2, couche 2 : TEST du GÉNÉRATEUR (`lib/forge/optimiseurPieces.ts`) et de l'optimisation COMPLÈTE : (1) les options d'UNE pièce : combinaisons mod de statistique × ajustement, énergie, statistiques identiques à `statsSimulees` (les calculs des fenêtres) ; (2) la SÉLECTION des pièces : classe, objet de classe exotique exclu sans doctrine prismatique (règle de l'utilisateur), verrous, exclusions, raisons d'exclusion ; (3) l'optimisation de bout en bout comparée à une recherche exhaustive sur les options générées, la règle de l'unique exotique (marque comprise), les emplacements manquants.
// EN: ⚠️ ADDED - test of the option generator and the full armor-stat optimization.
import { optionsDePiece, candidatsDepuisPieces, optimiserArmures, manqueDeLEquipement, DELAI_CALCUL_MS, type CandidatPiece } from "../../src/lib/forge/optimiseurPieces";
import { statsSimulees } from "../../src/lib/forge/armure";
import { manqueDe, STATS_ORDRE, SLOTS_ARMURE, type Bloc } from "../../src/lib/forge/optimiseur";
import { creerCasqueChatoyant } from "./fixtures/casqueChatoyant";
import type { GearPiece } from "../../src/types/build";
import { readFileSync } from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 900)); };
const { db, c1 } = creerCasqueChatoyant();
const bloc = (v: number[]): Bloc => ({ sante: v[0], melee: v[1], grenade: v[2], super: v[3], classe: v[4], arme: v[5] });
const piece = (id: string, slot: string, extra: Record<string, unknown> = {}) => ({ ...c1, itemInstanceId: id, nom: `Pièce ${id}`, slot, classeRequise: "titan", origine: "coffre", ...extra }) as unknown as GearPiece;

// ---------- 1. les options d'UNE pièce ----------
const opts = optionsDePiece(db, c1);
const base = opts.find((o) => o.modifs === 0)!;
ok("OPTIONS DU CASQUE D'ESSAI : 49 combinaisons (7 choix de mod de statistique × 7 choix d'ajustement : équipé, vide, équilibré, les directionnels permis) ; une seule ne change RIEN (0 modification) et ses statistiques sont celles de la pièce (0 / 5 / 5 / 25 / 40 / 25), énergie restante 1", opts.length === 49 && opts.filter((o) => o.modifs === 0).length === 1 && JSON.stringify(base.stats) === JSON.stringify(bloc([0, 5, 5, 25, 40, 25])) && base.energieRestante === 1 && Object.keys(base.choix).length === 0, [opts.length, base]);
ok("CHAQUE OPTION A EXACTEMENT LES STATISTIQUES QUE DONNERAIENT LES FENÊTRES DE SIMULATION (`statsSimulees` appliqué à ses changements) : le résultat de l'optimiseur se rejoue tel quel dans la simulation", opts.every((o) => { const s = statsSimulees(db, c1, o.choix).simulees; return STATS_ORDRE.every((k) => (s[k] ?? 0) === o.stats[k]); }));
const sante = opts.find((o) => o.statistique === "Mod de santé" && o.ajustement === "+Super / -Mêlée")!;
ok("COMBINAISON VÉRIFIÉE À LA MAIN : Mod de santé (+10 Santé, −10 Classe) et ajustement « +Super / −Mêlée » (on retire +Super/−Santé : Santé +5, Super −5 ; on ajoute +5 Super, −5 Mêlée) : 15 / 0 / 5 / 25 / 30 / 25 ; 2 modifications", JSON.stringify(sante.stats) === JSON.stringify(bloc([15, 0, 5, 25, 30, 25])) && sante.modifs === 2, sante);
const equil = opts.find((o) => o.statistique === "Mod de classe" && o.ajustement === "Ajustement équilibré")!;
ok("AJUSTEMENT ÉQUILIBRÉ (règle du jeu : +1 sur les trois statistiques non intrinsèques, ici Santé, Mêlée, Grenade) : 6 / 6 / 6 / 20 / 40 / 25 (l'ancien « +Super / −Santé » est retiré)", JSON.stringify(equil.stats) === JSON.stringify(bloc([6, 6, 6, 20, 40, 25])) && equil.modifs === 1, equil);
const sansReserve = opts.length, avecReserve = optionsDePiece(db, c1, { energieLibre: 2 });
ok("ÉNERGIE À GARDER LIBRE (2) : seules restent les combinaisons qui laissent au moins 2 d'énergie (celles qui remplacent un mod de coût 3 par un mod mineur ou par le vide) ; la combinaison sans changement (restante 1) disparaît ; aucune n'a moins de 2", avecReserve.length > 0 && avecReserve.length < sansReserve && avecReserve.every((o) => (o.energieRestante ?? 99) >= 2) && !avecReserve.some((o) => o.modifs === 0), avecReserve.length);
const sansEnergie = optionsDePiece(db, { ...c1, energie: undefined } as unknown as GearPiece, { energieLibre: 50 });
ok("ÉNERGIE NON LUE (exemplaire sans énergie) : aucune limite : les 49 combinaisons restent, `energieRestante` vaut `null` (on n'invente rien)", sansEnergie.length === 49 && sansEnergie.every((o) => o.energieRestante === null));
const exo = piece("x1", "torse", { isExotic: true, plugsDisponiblesParColonne: { 6: [9301, 9302, 9303, 9304, 9305, 9306, 9311, 9312] } });
const oe = optionsDePiece(db, exo);
ok("PIÈCE EXOTIQUE : le « + » est LIBRE : les ajustements « +Armes / −Santé » et « +Armes / −Super » sont proposés (63 combinaisons) ; sur la légendaire équivalente ils ne le sont pas (49)", oe.length === 63 && oe.some((o) => o.ajustement === "+Armes / -Santé") && oe.some((o) => o.ajustement === "+Armes / -Super") && !opts.some((o) => o.ajustement.startsWith("+Armes")), [oe.length]);
const nonStandard = { ...c1, perksParColonne: (c1.perksParColonne ?? []).map((p) => (p.socketIndex === 2 ? { ...p, hash: 9102 } : p)), energie: { capacite: 11, utilisee: 8 } } as unknown as GearPiece;
const onS = optionsDePiece(db, nonStandard);
ok("MOD ÉQUIPÉ NON STANDARD (la version à prix réduit « Mod de classe » : coût 1, aucun bonus, absente de la liste des mods standard) : la combinaison « on ne touche à rien » reste proposée (0 modification, mêmes statistiques que la pièce) : le statu quo n'est jamais perdu", onS.some((o) => o.modifs === 0 && JSON.stringify(o.stats) === JSON.stringify(bloc([0, 5, 5, 25, 40, 25]))), onS.filter((o) => o.modifs === 0).map((o) => o.statistique));
ok("LA PIÈCE D'ENTRÉE N'EST JAMAIS MODIFIÉE ; deux appels donnent les mêmes options", JSON.stringify(c1.stats) === JSON.stringify(bloc([0, 5, 5, 25, 40, 25])) && JSON.stringify(optionsDePiece(db, c1)) === JSON.stringify(opts));

// ---------- 2. la sélection des pièces ----------
const marqueExo = piece("m1", "marque", { isExotic: true, nom: "Relativisme d'essai" });
const toutes = [piece("c1", "casque"), piece("g1", "gants"), marqueExo, piece("m2", "marque"), piece("h1", "casque", { classeRequise: "chasseur" }), piece("i1", "gants", { stats: { sante: 0, melee: 5 } }), { ...piece("j1", "jambes"), itemInstanceId: undefined } as unknown as GearPiece, { ...piece("a1", "casque"), slot: "energie" } as unknown as GearPiece];
const s1 = candidatsDepuisPieces(db, toutes, { classe: "titan", prismatique: false });
ok("SÉLECTION (classe Titan, sans doctrine prismatique) : le casque, les gants et la marque ordinaire sont candidats ; la pièce de CHASSEUR est ignorée (pas dans les écartées : ce n'est pas une exclusion, c'est une autre classe) ; une ARME (emplacement hors armure) aussi", s1.candidats.map((c) => c.id).sort().join() === "c1,g1,m2" && !s1.ecartees.some((e) => e.piece.itemInstanceId === "h1"), s1.candidats.map((c) => c.id));
ok("OBJET DE CLASSE EXOTIQUE SANS DOCTRINE PRISMATIQUE : exclu AVEC SA RAISON « exige une doctrine prismatique équipée » ; statistiques incomplètes et exemplaire sans identifiant : exclus avec leur raison (jamais écartés en silence)", s1.ecartees.find((e) => e.piece.itemInstanceId === "m1")?.raison.includes("doctrine prismatique") === true && s1.ecartees.find((e) => e.piece.itemInstanceId === "i1")?.raison.includes("statistiques incomplètes") === true && s1.ecartees.some((e) => e.raison === "exemplaire sans identifiant"), s1.ecartees.map((e) => [e.piece.itemInstanceId, e.raison]));
const s2 = candidatsDepuisPieces(db, toutes, { classe: "titan", prismatique: true });
ok("AVEC UNE DOCTRINE PRISMATIQUE : l'objet de classe exotique devient candidat (et reste marqué exotique pour la règle de l'unique exotique)", s2.candidats.some((c) => c.id === "m1" && c.exotique));
const s3 = candidatsDepuisPieces(db, toutes, { classe: "titan", prismatique: true, verrous: { marque: "m2" }, exclues: ["g1"] });
ok("VERROU ET EXCLUSION : la marque verrouillée sur m2 écarte m1 ; la pièce exclue g1 disparaît ; le casque reste", s3.candidats.map((c) => c.id).sort().join() === "c1,m2", s3.candidats.map((c) => c.id));
const s4 = candidatsDepuisPieces(db, [piece("c1", "casque")], { classe: "titan", prismatique: false, energieLibre: 50 });
ok("RÉSERVE D'ÉNERGIE IMPOSSIBLE (50) : aucune combinaison ne tient : la pièce est écartée avec la raison « aucune combinaison ne tient dans l'énergie demandée »", s4.candidats.length === 0 && s4.ecartees[0]?.raison.includes("énergie demandée"));

// ---------- 3. l'optimisation de bout en bout ----------
const variantes: GearPiece[] = [];
for (const [i, slot] of SLOTS_ARMURE.entries()) {
  variantes.push(piece(`${slot}A`, slot, { stats: { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 } }));
  variantes.push(piece(`${slot}B`, slot, { stats: { sante: 10 + i, melee: 0, grenade: 20, super: 10, classe: 5, arme: 35 } }));
}
const cibles = { arme: 150, super: 110, classe: 120 };
const slotsP = ["casque", "gants", "torse"];   // la recherche exhaustive porte sur 3 emplacements : (2 pièces × 49 combinaisons)³ ≈ 940 000 cas ; à 5 emplacements : 98⁵ ≈ 9 milliards
const brute = (cands: CandidatPiece[]) => {
  const meilleurs = new Map<string, { sig: string; manque: number; pondere: number; modifs: number }>();
  const rec = (k: number, ids: string[], tot: Bloc, modifs: number, exo: number) => {
    if (exo > 1) return;
    if (k === slotsP.length) { const m = manqueDe(tot, cibles), sig = ids.join("/"), e = meilleurs.get(sig); if (!e || m.manque < e.manque || (m.manque === e.manque && modifs < e.modifs)) meilleurs.set(sig, { sig, manque: m.manque, pondere: m.manquePondere, modifs }); return; }
    for (const c of cands.filter((x) => x.slot === slotsP[k])) for (const o of c.options) { const t = { ...tot }; for (const s of STATS_ORDRE) t[s] += o.stats[s]; rec(k + 1, [...ids, c.id], t, modifs + o.modifs, exo + (c.exotique ? 1 : 0)); }
  };
  rec(0, [], bloc([0, 0, 0, 0, 0, 0]), 0, 0);
  return [...meilleurs.values()].sort((a, b) => a.manque - b.manque || a.pondere - b.pondere || a.modifs - b.modifs || (a.sig < b.sig ? -1 : 1)).slice(0, 3);
};
const v3 = variantes.filter((p) => slotsP.includes(p.slot));
const sel = candidatsDepuisPieces(db, v3, { classe: "titan", prismatique: false });
const attendu = brute(sel.candidats);
const r3 = optimiserArmures(db, v3, { classe: "titan", prismatique: false, cibles, delaiMs: 60000 });
const r = optimiserArmures(db, variantes, { classe: "titan", prismatique: false, cibles, delaiMs: 60000 });
ok("OPTIMISATION COMPLÈTE (6 pièces, 3 emplacements, 49 combinaisons par pièce, ≈ 940 000 cas) : les trois meilleures solutions sont EXACTEMENT celles de la recherche exhaustive sur les options générées (ensembles de pièces, manque, modifications)", JSON.stringify(r3.solutions.map((s) => [s.pieces.map((x) => x.piece.itemInstanceId).join("/"), s.manque, s.modifs])) === JSON.stringify(attendu.map((x) => [x.sig, x.manque, x.modifs])) && r3.solutions.length === 3, [r3.solutions.map((s) => [s.pieces.map((x) => x.piece.itemInstanceId).join("/"), s.manque, s.modifs]), attendu]);
const s0 = r.solutions[0];
ok("COHÉRENCE D'UNE SOLUTION : les totaux sont la somme des statistiques des combinaisons choisies ; le manque par statistique est écrit (0 = atteinte) et leur somme est le manque ; chaque combinaison choisie se rejoue avec `statsSimulees` à l'identique", STATS_ORDRE.every((k) => s0.totaux[k] === s0.pieces.reduce((t, x) => t + x.option.stats[k], 0)) && Object.values(s0.manqueParStat).reduce((t, v) => t + (v ?? 0), 0) === s0.manque && s0.pieces.every((x) => { const sm = statsSimulees(db, x.piece, x.option.choix).simulees; return STATS_ORDRE.every((k) => (sm[k] ?? 0) === x.option.stats[k]); }), s0.manqueParStat);
ok("CINQ PIÈCES, UNE PAR EMPLACEMENT, dans l'ordre casque, gants, torse, jambes, marque ; aucun emplacement manquant ; trois solutions aux ensembles de pièces différents", s0.pieces.map((x) => x.piece.slot).join() === SLOTS_ARMURE.join() && r.slotsManquants.length === 0 && new Set(r.solutions.map((s) => s.pieces.map((x) => x.piece.itemInstanceId).join())).size === 3);
// la règle de l'unique exotique, marque comprise
// le torse et la marque exotiques donnent chacun +60 Armes : sans la règle de l'unique exotique, les meilleures solutions les PRENDRAIENT ENSEMBLE
const exotiques = variantes.map((p) => (["torseB", "marqueB"].includes(p.itemInstanceId as string) ? ({ ...p, isExotic: true, stats: { ...(p.stats as object), arme: 95 } } as unknown as GearPiece) : p));
const cibleExo = { arme: 330 };   // une cible d'Armes très haute : prendre les DEUX exotiques serait la meilleure idée sans la règle
const re = optimiserArmures(db, exotiques, { classe: "titan", prismatique: true, cibles: cibleExo, delaiMs: 60000 });
ok("UNE SEULE EXOTIQUE EN TOUT, MARQUE COMPRISE : même avec un torse exotique ET une marque exotique donnant chacun +60 Armes (les meilleures solutions les prendraient ensemble sans la règle), AUCUNE solution ne les prend ensemble ; chaque solution a au plus 1 exotique", re.solutions.length === 3 && re.solutions.some((s) => s.exotiques === 1) && re.solutions.every((s) => s.exotiques <= 1 && !(s.pieces.some((x) => x.piece.itemInstanceId === "torseB") && s.pieces.some((x) => x.piece.itemInstanceId === "marqueB"))), re.solutions.map((s) => s.pieces.map((x) => x.piece.itemInstanceId)));
const rp = optimiserArmures(db, exotiques, { classe: "titan", prismatique: false, cibles: cibleExo, delaiMs: 60000 });
ok("SANS DOCTRINE PRISMATIQUE : la marque exotique n'apparaît dans AUCUNE solution (elle est exclue, avec sa raison dans `ecartees`) ; le torse exotique reste possible", rp.solutions.every((s) => !s.pieces.some((x) => x.piece.itemInstanceId === "marqueB")) && rp.ecartees.some((e) => e.piece.itemInstanceId === "marqueB" && e.raison.includes("prismatique")));
const rm = optimiserArmures(db, variantes.filter((p) => p.slot !== "jambes"), { classe: "titan", prismatique: false, cibles, delaiMs: 60000 });
ok("EMPLACEMENT MANQUANT (aucune jambière) : le résultat le DIT (`slotsManquants` = jambes) et propose quand même les quatre autres emplacements", rm.slotsManquants.join() === "jambes" && rm.solutions[0].pieces.length === 4, rm.slotsManquants);
const rv = optimiserArmures(db, variantes, { classe: "titan", prismatique: false, cibles, verrous: { casque: "casqueA" }, exclues: ["torseA"], delaiMs: 60000 });
ok("VERROU ET EXCLUSION DANS L'OPTIMISATION : le casque est toujours casqueA, le torse n'est jamais torseA", rv.solutions.every((s) => s.pieces[0].piece.itemInstanceId === "casqueA" && s.pieces[2].piece.itemInstanceId !== "torseA"));
const actuel = manqueDeLEquipement(SLOTS_ARMURE.map((sl) => variantes.find((p) => p.itemInstanceId === `${sl}A`) as GearPiece), { cibles });
ok("L'ÉQUIPEMENT ACTUEL SERT DE REPÈRE : son manque (cinq pièces « A », sans aucun changement) n'est jamais meilleur que la meilleure solution trouvée ; ses totaux sont la somme des pièces", actuel.manque >= s0.manque && actuel.totaux.arme === 125 && actuel.totaux.classe === 200, actuel);
ok("AUCUNE CIBLE ATTEINTE OU IMPOSSIBLE : une cible hors d'atteinte (Armes 900) donne un manque > 0 écrit statistique par statistique, sans exception ; sans aucune pièce : aucune solution et pas d'erreur", (() => { const x = optimiserArmures(db, variantes, { classe: "titan", prismatique: false, cibles: { arme: 900 }, delaiMs: 60000 }); const y = optimiserArmures(db, [], { classe: "titan", prismatique: false, cibles }); return x.solutions[0].manque > 600 && (x.solutions[0].manqueParStat.arme ?? 0) === x.solutions[0].manque && y.solutions.length === 0 && y.slotsManquants.length === 5; })());

// ---------- 4. la limite de temps du calcul : 10 secondes (demande de l'utilisateur du 29/10/2026) ----------
const srcEcran = readFileSync("src/components/OptimiseurArmures.tsx", "utf8"), srcPieces = readFileSync("src/lib/forge/optimiseurPieces.ts", "utf8");
ok("LIMITE DE TEMPS DU CALCUL = 10 SECONDES (10 000 ms), SOURCE UNIQUE : la constante `DELAI_CALCUL_MS` vaut 10 000 ; elle est la valeur par défaut de `optimiserArmures` ET celle que l'écran transmet ; plus aucune valeur de 5 ou 6 secondes en dur dans l'écran ni dans le moteur", DELAI_CALCUL_MS === 10000 && srcPieces.includes("delaiMs: p.delaiMs ?? DELAI_CALCUL_MS") && srcEcran.includes("delaiMs: DELAI_CALCUL_MS") && !/delaiMs: (5000|6000)\b/.test(srcEcran + srcPieces), [DELAI_CALCUL_MS]);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
