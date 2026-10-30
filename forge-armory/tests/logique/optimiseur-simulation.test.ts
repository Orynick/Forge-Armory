// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR, écran B : TEST du passage « solution → simulation » (`lib/forge/optimiseurSimulation.ts`) et des RÉGLAGES mémorisés : (1) les changements écrits pour une combinaison ; (2) l'ALLER-RETOUR : une solution simulée redonne, pièce par pièce, EXACTEMENT les statistiques annoncées par l'optimiseur (c'est ce qui permet de la rejouer telle quelle dans la simulation) ; (3) le REMPLACEMENT des simulations précédentes des pièces de la solution, sans toucher aux autres pièces ; (4) la détection d'une solution « simulée » et l'annulation ; (5) la lecture ROBUSTE des réglages (jamais d'exception, valeurs hors limites écartées) ; (6) les champs « avant » du générateur (ce qui est équipé et ce qui change).
// EN: ⚠️ ADDED - test of solution → simulation and the persisted settings.
import { optimiserArmures, optionsDePiece } from "../../src/lib/forge/optimiseurPieces";
import { changementsDeOption, simulerSolution, annulerSolution, solutionSimulee, solutionAUneSimulation, lirePrefsOptimiseur, ecrirePrefsOptimiseur, PREFS_PAR_DEFAUT, CLE_PREFS_OPTIMISEUR } from "../../src/lib/forge/optimiseurSimulation";
import { statsSimulees } from "../../src/lib/forge/armure";
import { SIMULATIONS_VIDES, choisir } from "../../src/lib/forge/simulation";
import { SLOTS_ARMURE, STATS_ORDRE } from "../../src/lib/forge/optimiseur";
import { creerCasqueChatoyant } from "./fixtures/casqueChatoyant";
import type { GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 900)); };
const { db, c1 } = creerCasqueChatoyant();
const piece = (id: string, slot: string, stats: Record<string, number>) => ({ ...c1, itemInstanceId: id, nom: `Pièce ${id}`, slot, classeRequise: "titan", origine: "coffre", stats }) as unknown as GearPiece;
const pieces: GearPiece[] = [];
for (const [i, slot] of SLOTS_ARMURE.entries()) {
  pieces.push(piece(`${slot}A`, slot, { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 }));
  pieces.push(piece(`${slot}B`, slot, { sante: 10 + i, melee: 0, grenade: 20, super: 10, classe: 5, arme: 35 }));
}
const cibles = { arme: 150, super: 110, classe: 120 };
const r = optimiserArmures(db, pieces, { classe: "titan", prismatique: false, cibles, delaiMs: 60000 });
const sol = r.solutions[0];

// ---------- 1. les changements écrits ----------
const opts = optionsDePiece(db, c1);
const base = opts.find((o) => o.modifs === 0)!, deux = opts.find((o) => o.modifs === 2)!;
ok("CHANGEMENTS D'UNE COMBINAISON : la combinaison sans changement n'en écrit AUCUN ; une combinaison à deux modifications en écrit deux (l'emplacement et le plug EFFECTIF choisi) ; dans l'ordre des emplacements", changementsDeOption(base).length === 0 && changementsDeOption(deux).length === 2 && changementsDeOption(deux).every((c) => Object.values(deux.choix).some((x) => x.effectif === c.plugHash)), changementsDeOption(deux));

// ---------- 2. l'aller-retour ----------
const s1 = simulerSolution(SIMULATIONS_VIDES(), db, sol);
ok("ALLER-RETOUR : une fois la solution simulée, chaque pièce redonne EXACTEMENT les statistiques annoncées par l'optimiseur (`statsSimulees` appliqué aux simulations écrites) : le résultat se rejoue tel quel dans la simulation", sol.pieces.every(({ piece: p, option }) => { const sm = statsSimulees(db, p, s1.armures?.[p.itemInstanceId as string]).simulees; return STATS_ORDRE.every((k) => (sm[k] ?? 0) === option.stats[k]); }) && sol.manque >= 0, sol.pieces.map((x) => x.option.stats));
ok("LE TOTAL DES CINQ PIÈCES SIMULÉES est celui de la solution (les totaux affichés par l'écran sont ceux que Mon Build et le score verront)", STATS_ORDRE.every((k) => sol.pieces.reduce((t, { piece: p }) => t + (statsSimulees(db, p, s1.armures?.[p.itemInstanceId as string]).simulees[k] ?? 0), 0) === sol.totaux[k]));
ok("UNE PIÈCE SANS CHANGEMENT N'A AUCUNE SIMULATION (pas d'entrée vide) ; seules les pièces modifiées en ont", sol.pieces.every(({ piece: p, option }) => Object.keys(s1.armures?.[p.itemInstanceId as string] ?? {}).length === option.modifs), sol.pieces.map((x) => [x.option.modifs, Object.keys(s1.armures?.[x.piece.itemInstanceId as string] ?? {}).length]));

// ---------- 3. le remplacement ----------
const autre = pieces.find((p) => p.itemInstanceId === "casqueB")!;
const colCumul = 3;   // un emplacement cumulable du casque d'essai
const avant = choisir(choisir(SIMULATIONS_VIDES(), sol.pieces[0].piece.itemInstanceId as string, colCumul, { choisi: 9202, effectif: 9202 }, "armures"), autre.itemInstanceId as string, colCumul, { choisi: 9202, effectif: 9202 }, "armures");
const apres = simulerSolution(avant, db, sol);
const idPremiere = sol.pieces[0].piece.itemInstanceId as string;
ok("REMPLACEMENT : une simulation PRÉCÉDENTE d'une pièce de la solution (ici un cumulable) est REMPLACÉE par celle de la solution (la pièce repart de l'équipement réel) ; la simulation d'une pièce qui n'est PAS dans la solution n'est pas touchée", (colCumul in (apres.armures?.[idPremiere] ?? {})) === false && (sol.pieces.some((x) => x.piece.itemInstanceId === autre.itemInstanceId) || apres.armures?.[autre.itemInstanceId as string]?.[colCumul]?.effectif === 9202), [apres.armures?.[idPremiere], apres.armures?.[autre.itemInstanceId as string]]);
ok("LE MAGASIN D'ORIGINE N'EST JAMAIS MODIFIÉ (les simulations sont immuables)", JSON.stringify(avant.armures?.[idPremiere]) === JSON.stringify({ [colCumul]: { choisi: 9202, effectif: 9202 } }) && Object.keys(SIMULATIONS_VIDES().armures ?? {}).length === 0);

// ---------- 4. solution simulée, annulation ----------
ok("SOLUTION SIMULÉE : `solutionSimulee` est vrai juste après la simulation, faux avant ; faux si une pièce porte UN CHANGEMENT DE PLUS ; faux si une pièce porte un autre choix", solutionSimulee(s1, sol) && !solutionSimulee(SIMULATIONS_VIDES(), sol) && !solutionSimulee(choisir(s1, idPremiere, colCumul, { choisi: 9202, effectif: 9202 }, "armures"), sol) && !solutionSimulee({ ...s1, armures: { ...s1.armures, [idPremiere]: { 2: { choisi: 9111, effectif: 9111 } } } }, sol));
ok("`solutionAUneSimulation` : vrai dès qu'UNE pièce de la solution est simulée (pour proposer « Annuler »), faux sinon", solutionAUneSimulation(s1, sol) && !solutionAUneSimulation(SIMULATIONS_VIDES(), sol) && solutionAUneSimulation(avant, sol));
const annulee = annulerSolution(s1, sol);
ok("ANNULATION : les cinq pièces reviennent à l'équipement réel (plus aucune simulation) ; une simulation d'une AUTRE pièce est conservée", sol.pieces.every((x) => !(x.piece.itemInstanceId as string in (annulee.armures ?? {}))) && !solutionAUneSimulation(annulee, sol) && annulerSolution(avant, sol).armures?.[autre.itemInstanceId as string]?.[colCumul]?.effectif === (sol.pieces.some((x) => x.piece.itemInstanceId === autre.itemInstanceId) ? undefined : 9202));
const sansChangement = { ...sol, pieces: sol.pieces.map((x) => ({ ...x, option: { ...x.option, modifs: 0, choix: {} } })), modifs: 0 };
ok("UNE SOLUTION SANS AUCUN CHANGEMENT DE MOD N'EST JAMAIS « SIMULÉE » (rien à simuler : sinon l'écran afficherait « simulée » sur une solution que personne n'a simulée) ; elle n'a pas de simulation à annuler non plus", !solutionSimulee(SIMULATIONS_VIDES(), sansChangement) && !solutionAUneSimulation(SIMULATIONS_VIDES(), sansChangement));
ok("SIMULER DEUX FOIS LA MÊME SOLUTION donne le même résultat (idempotent)", JSON.stringify(simulerSolution(s1, db, sol)) === JSON.stringify(s1));

// ---------- 5. les réglages mémorisés ----------
const mem = (initial?: string) => { const m = new Map<string, string>(); if (initial !== undefined) m.set(CLE_PREFS_OPTIMISEUR, initial); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };
ok("RÉGLAGES PAR DÉFAUT : aucun objectif, énergie libre 0, exotique « au choix », doctrine prismatique « pas choisie » (on suit alors le build)", JSON.stringify(lirePrefsOptimiseur(mem())) === JSON.stringify({ cibles: {}, energieLibre: 0, exotique: "choix", prismatique: null }) && JSON.stringify(lirePrefsOptimiseur(mem())) === JSON.stringify(PREFS_PAR_DEFAUT()));
const st = mem();
ok("ÉCRITURE PUIS LECTURE : les objectifs, la réserve d'énergie, l'exotique et la doctrine reviennent à l'identique", ecrirePrefsOptimiseur(st, { cibles: { arme: 125, super: 105 }, energieLibre: 2, exotique: "aucune", prismatique: true }) && (() => { const l = lirePrefsOptimiseur(st); return Object.keys(l.cibles).length === 2 && l.cibles.arme === 125 && l.cibles.super === 105 && l.energieLibre === 2 && l.exotique === "aucune" && l.prismatique === true; })());
ok("LECTURE ROBUSTE : un texte illisible, un type faux, une valeur hors limites ou inconnue sont remplacés par la valeur par défaut, JAMAIS d'exception ; seules les statistiques connues sont gardées", JSON.stringify(lirePrefsOptimiseur(mem("pas du json"))) === JSON.stringify(PREFS_PAR_DEFAUT()) && JSON.stringify(lirePrefsOptimiseur(mem("[1,2]"))) === JSON.stringify(PREFS_PAR_DEFAUT()) && JSON.stringify(lirePrefsOptimiseur(mem(JSON.stringify({ cibles: { arme: 9999, super: -5, grenade: "x", classe: 80.4, inconnue: 5 }, energieLibre: 99, exotique: "n'importe", prismatique: "oui" })))) === JSON.stringify({ cibles: { classe: 80 }, energieLibre: 0, exotique: "choix", prismatique: null }));
ok("ÉCRITURE IMPOSSIBLE (stockage plein ou interdit) : rend `false`, sans exception", ecrirePrefsOptimiseur({ setItem: () => { throw new Error("plein"); } }, PREFS_PAR_DEFAUT()) === false);

// ---------- 6. les champs « avant » du générateur ----------
ok("CHAMPS « AVANT » : la combinaison sans changement garde les noms équipés (« Mod de classe », « +Super / -Santé ») et ne marque aucun changement ; une combinaison à deux modifications marque les deux ; les noms équipés restent ceux de la pièce", base.statistiqueAvant === "Mod de classe" && base.ajustementAvant === "+Super / -Santé" && !base.statistiqueChange && !base.ajustementChange && deux.statistiqueChange && deux.ajustementChange && opts.every((o) => o.statistiqueAvant === "Mod de classe" && o.ajustementAvant === "+Super / -Santé") && opts.every((o) => o.statistiqueChange === (o.statistique !== "Mod de classe") && o.ajustementChange === (o.ajustement !== "+Super / -Santé")), [base, deux]);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
