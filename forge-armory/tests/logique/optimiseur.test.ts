// FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures), OPTIMISEUR de statistiques d'armure, étape 2, couche 1 : TEST du SOLVEUR PUR (`lib/forge/optimiseur.ts`) : (1) comparaison avec une RECHERCHE EXHAUSTIVE sur 200 instances tirées au hasard (options aux statistiques négatives, exotiques, marques de classe, bonus, priorités, emplacements absents) : mêmes « trois meilleures solutions » (ensembles de pièces, manque, manque pondéré, modifications) ; (2) la règle de l'UNIQUE exotique, la marque de classe exotique comprise ; (3) les cas limites : emplacement absent, aucune cible, cibles déjà atteintes, plafond des états avec des options NÉGATIVES, faisceau, déterminisme, performance sur un cas réaliste.
// EN: ⚠️ ADDED - test of the pure solver against an exhaustive search (200 random instances) and edge cases.
import { resoudre, manqueDe, STATS_ORDRE, SLOTS_ARMURE, type CandidatAbstrait, type Bloc, type ParametresSolveur } from "../../src/lib/forge/optimiseur";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 900)); };
function prng(graine: number) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const bloc = (v: number[]): Bloc => ({ sante: v[0], melee: v[1], grenade: v[2], super: v[3], classe: v[4], arme: v[5] });

// ---------- la recherche exhaustive de référence ----------
interface Ref { sig: string; manque: number; pondere: number; modifs: number }
function exhaustive(cands: CandidatAbstrait[], p: ParametresSolveur): Ref[] {
  const slots = SLOTS_ARMURE.filter((s) => cands.some((c) => c.slot === s));
  const parSlot = slots.map((s) => cands.filter((c) => c.slot === s));
  const meilleurs = new Map<string, Ref>();
  const rec = (k: number, ids: string[], tot: Bloc, modifs: number, exo: number) => {
    if (exo > (p.maxExotiques ?? 1)) return;
    if (k === slots.length) {
      const { manque, manquePondere } = manqueDe(tot, p.cibles, p.poids, p.bonus);
      const sig = ids.join("/"), r: Ref = { sig, manque, pondere: manquePondere, modifs };
      const e = meilleurs.get(sig);
      if (!e || manque < e.manque || (manque === e.manque && (manquePondere < e.pondere || (manquePondere === e.pondere && modifs < e.modifs)))) meilleurs.set(sig, r);
      return;
    }
    for (const c of parSlot[k]) for (const o of c.options) {
      const t = { ...tot }; for (const s of STATS_ORDRE) t[s] += o.stats[s];
      rec(k + 1, [...ids, c.id], t, modifs + o.modifs, exo + (c.exotique ? 1 : 0));
    }
  };
  rec(0, [], bloc([0, 0, 0, 0, 0, 0]), 0, 0);
  return [...meilleurs.values()].sort((a, b) => a.manque - b.manque || a.pondere - b.pondere || a.modifs - b.modifs || (a.sig < b.sig ? -1 : a.sig > b.sig ? 1 : 0));
}

// ---------- 1. 200 instances aléatoires ----------
let ecarts = 0, premierEcart: unknown = null, nbSolutionsTotal = 0, nbAvecExo = 0, ecartsElagage = 0, premierEcartElagage: unknown = null, nbElagage = 0;
for (let graine = 1; graine <= 200; graine++) {
  const r = prng(graine * 7919);
  const ent = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const slots = SLOTS_ARMURE.filter(() => r() > 0.12);
  if (slots.length === 0) slots.push("casque" as never);
  const cands: CandidatAbstrait[] = [];
  for (const slot of slots) for (let i = 0, n = ent(1, 3); i < n; i++) {
    cands.push({ id: `${slot[0]}${i}`, slot, exotique: r() < 0.3, options: Array.from({ length: ent(1, 4) }, () => ({ stats: bloc(Array.from({ length: 6 }, () => ent(-5, 40))), modifs: ent(0, 2) })) });
  }
  const cibles: Partial<Bloc> = {}; for (const s of STATS_ORDRE) if (r() < 0.55) cibles[s] = ent(20, 110);
  const poids: Partial<Bloc> = {}; for (const s of STATS_ORDRE) if (r() < 0.5) poids[s] = ent(1, 4);
  const bonus: Partial<Bloc> = {}; for (const s of STATS_ORDRE) if (r() < 0.3) bonus[s] = ent(0, 15);
  const p: ParametresSolveur = { cibles, poids, bonus, nbSolutions: 3, largeurFaisceau: 1_000_000 };
  const att = exhaustive(cands, p).slice(0, 3);
  const got = resoudre(cands, p);
  nbSolutionsTotal += got.solutions.length; if (cands.some((c) => c.exotique)) nbAvecExo++;
  const a = JSON.stringify(att.map((x) => [x.sig, x.manque, x.pondere, x.modifs]));
  const b = JSON.stringify(got.solutions.map((x) => [x.choix.map((c) => c.idCandidat).join("/"), x.manque, x.manquePondere, x.modifs]));
  if (a !== b || !got.exact) { ecarts++; premierEcart ??= { graine, attendu: a, obtenu: b }; }
  // la MÊME instance avec une passe étroite de 2 états : force la passe complète AVEC élagage exact ; le résultat doit rester celui de la recherche exhaustive
  const forcee = resoudre(cands, { ...p, largeurReference: 2 });
  const c = JSON.stringify(forcee.solutions.map((x) => [x.choix.map((y) => y.idCandidat).join("/"), x.manque, x.manquePondere, x.modifs]));
  nbElagage++;
  if (c !== a || !forcee.exact) { ecartsElagage++; premierEcartElagage ??= { graine, attendu: a, obtenu: c, exact: forcee.exact }; }
}
ok("200 INSTANCES ALÉATOIRES (options négatives, exotiques, bonus, priorités, emplacements absents) : les trois meilleures solutions (ensembles de pièces, manque, manque pondéré, modifications) sont EXACTEMENT celles de la recherche exhaustive, et le résultat est déclaré exact", ecarts === 0 && nbSolutionsTotal > 300 && nbAvecExo > 100, { ecarts, premierEcart, nbSolutionsTotal, nbAvecExo });

ok("MÊMES 200 INSTANCES, PASSE ÉTROITE RÉDUITE À 2 ÉTATS (force la passe complète avec ÉLAGAGE) : le résultat est TOUJOURS celui de la recherche exhaustive et reste déclaré exact : l'élagage (abandon des états qui ne peuvent plus battre la solution de référence) ne change jamais le résultat", ecartsElagage === 0 && nbElagage === 200, { ecartsElagage, premierEcartElagage });

// ---------- 2. l'unique exotique, marque comprise ----------
const opt = (v: number[], modifs = 0) => ({ stats: bloc(v), modifs });
const cand = (id: string, slot: string, exotique: boolean, options: ReturnType<typeof opt>[]): CandidatAbstrait => ({ id, slot, exotique, options });
const cibleArme = { cibles: { arme: 100 } };
const deuxExo = [cand("t1", "torse", true, [opt([0, 0, 0, 0, 0, 50])]), cand("m1", "marque", true, [opt([0, 0, 0, 0, 0, 50])]), cand("c1", "casque", false, [opt([0, 0, 0, 0, 0, 0])])];
ok("UNE SEULE EXOTIQUE EN TOUT, LA MARQUE DE CLASSE COMPRISE (règle de l'utilisateur : « compte comme une armure exotique ») : un torse exotique ET une marque exotique ne vont JAMAIS ensemble : aucune solution quand ils sont les seuls candidats de leurs emplacements", resoudre(deuxExo, cibleArme).solutions.length === 0);
const avecAlt = [...deuxExo, cand("m2", "marque", false, [opt([0, 0, 0, 0, 0, 10])])];
const sAlt = resoudre(avecAlt, cibleArme);
ok("AVEC UNE MARQUE NON EXOTIQUE EN ALTERNATIVE : le solveur choisit torse exotique + marque ordinaire (manque 40), ou la marque exotique + un torse… (ici aucun) : la meilleure solution respecte la règle", sAlt.solutions.length === 1 && sAlt.solutions[0].exotiques === 1 && sAlt.solutions[0].manque === 40 && sAlt.solutions[0].choix.map((c) => c.idCandidat).join("/") === "c1/t1/m2", sAlt.solutions);
ok("TOUTES LES SOLUTIONS RENDUES RESPECTENT LA RÈGLE (jamais plus d'une exotique) ; `maxExotiques` = 2 la relâche (essai : torse exotique + marque exotique deviennent possibles, manque 0)", sAlt.solutions.every((s) => s.exotiques <= 1) && resoudre(deuxExo, { ...cibleArme, maxExotiques: 2 }).solutions[0]?.manque === 0);

// ---------- 3. cas limites ----------
const cinq = (opts: Record<string, number[][]>) => SLOTS_ARMURE.map((s) => cand(`${s[0]}1`, s, false, (opts[s] ?? [[0, 0, 0, 0, 0, 0]]).map((v) => opt(v))));
const sansMarque = resoudre(cinq({ casque: [[0, 0, 0, 0, 0, 30]], gants: [[0, 0, 0, 0, 0, 30]], torse: [[0, 0, 0, 0, 0, 30]], jambes: [[0, 0, 0, 0, 0, 30]] }).filter((c) => c.slot !== "marque"), cibleArme);
ok("EMPLACEMENT ABSENT (pas de marque de classe) : le solveur travaille avec les quatre autres et DIT quel emplacement manque (`slotsManquants` = marque) ; manque = 100 − 120 → 0", sansMarque.slotsManquants.join() === "marque" && sansMarque.solutions[0]?.manque === 0 && sansMarque.solutions[0].choix.length === 4, sansMarque);
ok("AUCUN EMPLACEMENT CANDIDAT : aucune solution, jamais d'exception", resoudre([], cibleArme).solutions.length === 0 && resoudre([], cibleArme).slotsManquants.length === 5);
const sansCible = resoudre([cand("c1", "casque", false, [opt([5, 5, 5, 5, 5, 5], 2), opt([0, 0, 0, 0, 0, 0], 0)])], { cibles: {} });
ok("AUCUNE CIBLE : tout est à zéro de manque ; le départage retient la solution qui TOUCHE LE MOINS à l'équipement (0 modification)", sansCible.solutions[0].manque === 0 && sansCible.solutions[0].modifs === 0 && sansCible.solutions[0].choix[0].indexOption === 1, sansCible.solutions);
const atteinte = resoudre(cinq({ casque: [[0, 0, 0, 0, 0, 30], [0, 0, 0, 0, 0, 60]] }), { cibles: { arme: 30 } });
ok("CIBLE DÉJÀ ATTEINTE avec l'option qui ne change rien : manque 0 et 0 modification ; un excédent ne compense pas un manque ailleurs (cible Armes 30 atteinte, Super 20 jamais atteinte : manque 20)", atteinte.solutions[0].manque === 0 && resoudre(cinq({ casque: [[0, 0, 0, 0, 0, 90]] }), { cibles: { arme: 30, super: 20 } }).solutions[0].manque === 20);
// plafond avec options négatives : le casque donne +60 armes (au-dessus de la cible 50), le torse −40 : le plafond naïf à la cible (50) donnerait 50 − 40 = 10 au lieu de 20
const neg = resoudre([cand("c1", "casque", false, [opt([0, 0, 0, 0, 0, 60])]), cand("t1", "torse", false, [opt([0, 0, 0, 0, 0, -40])])], { cibles: { arme: 50 } });
ok("PLAFOND DES ÉTATS AVEC DES OPTIONS NÉGATIVES (+60 puis −40 pour une cible de 50) : le total réel est 20, manque 30 : un plafond naïf à la cible aurait donné 10 et un manque de 40", neg.solutions[0].totaux.arme === 20 && neg.solutions[0].manque === 30, neg.solutions[0]);
const gros = (() => { const r = prng(42); const cs: CandidatAbstrait[] = []; for (const s of SLOTS_ARMURE) for (let i = 0; i < 30; i++) cs.push({ id: `${s[0]}${i}`, slot: s, exotique: r() < 0.25, options: Array.from({ length: 60 }, () => ({ stats: bloc(Array.from({ length: 6 }, () => Math.floor(r() * 45) - 5)), modifs: Math.floor(r() * 3) })) }); return cs; })();
const t0 = Date.now(); const rg = resoudre(gros, { cibles: { arme: 100, super: 100, grenade: 70 }, largeurFaisceau: 1500, delaiMs: 4000 }); const duree = Date.now() - t0;   // réglages de l'interface : le temps est BORNÉ par le budget (le test ne dépend plus de la vitesse de la machine)
ok("CAS RÉALISTE (5 emplacements × 30 pièces × 60 options, trois cibles) : le résultat arrive dans le budget de temps (4 s + la passe étroite ; limite large de 20 s pour une machine chargée), trois solutions DISTINCTES, la règle de l'exotique respectée, les totaux recalculés à partir des options choisies (jamais des états plafonnés)", duree < 20000 && rg.solutions.length === 3 && new Set(rg.solutions.map((s) => s.choix.map((c) => c.idCandidat).join("/"))).size === 3 && rg.solutions.every((s) => s.exotiques <= 1 && s.choix.length === 5 && STATS_ORDRE.every((k) => s.totaux[k] === s.choix.reduce((t, c) => t + gros.find((g) => g.id === c.idCandidat)!.options[c.indexOption].stats[k], 0))), { duree, exact: rg.exact, etats: rg.nbEtatsMax });
const petit = resoudre(gros, { cibles: { arme: 100, super: 100, grenade: 70 }, largeurFaisceau: 1, delaiMs: 4000 });
ok("FAISCEAU TRÈS ÉTROIT (1 état) : le résultat est déclaré NON EXACT, reste valide (règle de l'exotique, cinq emplacements) et n'est jamais meilleur que celui d'un faisceau large", !petit.exact && petit.solutions.every((s) => s.exotiques <= 1 && s.choix.length === 5) && petit.solutions[0].manque >= rg.solutions[0].manque, [petit.exact, petit.solutions[0]?.manque, rg.solutions[0].manque]);
ok("DÉTERMINISME : deux appels identiques donnent exactement les mêmes solutions ; l'ordre des candidats en entrée n'y change rien", JSON.stringify(resoudre(gros, { cibles: { arme: 100, super: 100 }, largeurFaisceau: 300, arreterSiCiblesAtteintes: true }).solutions) === JSON.stringify(resoudre(gros, { cibles: { arme: 100, super: 100 }, largeurFaisceau: 300, arreterSiCiblesAtteintes: true }).solutions) && JSON.stringify(resoudre([...avecAlt].reverse(), cibleArme).solutions.map((s) => [s.manque, s.choix.map((c) => c.idCandidat).sort().join()])) === JSON.stringify(resoudre(avecAlt, cibleArme).solutions.map((s) => [s.manque, s.choix.map((c) => c.idCandidat).sort().join()])));
ok("`nbSolutions` : demander 1 ou 5 solutions rend au plus ce nombre, la première est toujours la même ; les ensembles de pièces sont tous différents", (() => { const un = resoudre(gros, { cibles: { arme: 100 }, nbSolutions: 1, largeurFaisceau: 300, arreterSiCiblesAtteintes: true }), cinqS = resoudre(gros, { cibles: { arme: 100 }, nbSolutions: 5, largeurFaisceau: 300, arreterSiCiblesAtteintes: true }); return un.solutions.length === 1 && cinqS.solutions.length === 5 && JSON.stringify(un.solutions[0].choix.map((c) => c.idCandidat)) === JSON.stringify(cinqS.solutions[0].choix.map((c) => c.idCandidat)) && new Set(cinqS.solutions.map((s) => s.choix.map((c) => c.idCandidat).join())).size === 5; })());
ok("LES PRIORITÉS NE DÉPARTAGENT QUE LES EX ÆQUO DU MANQUE : deux solutions de même manque (30 en Super ou 30 en Grenade) : la priorité haute sur Super fait préférer celle qui ne manque pas de Super", (() => { const cs = [cand("a", "casque", false, [opt([0, 0, 0, 70, 0, 0])]), cand("b", "casque", false, [opt([0, 0, 70, 0, 0, 0])])]; const r1 = resoudre(cs, { cibles: { super: 100, grenade: 100 }, poids: { super: 5 } }), r2 = resoudre(cs, { cibles: { super: 100, grenade: 100 }, poids: { grenade: 5 } }); return r1.solutions[0].choix[0].idCandidat === "a" && r2.solutions[0].choix[0].idCandidat === "b" && r1.solutions[0].manque === 130 && r2.solutions[0].manque === 130; })());

// ---------- 4. budget de temps et arrêt anticipé (réglages de l'interface) ----------
const facile = { arme: 100, super: 100, grenade: 70 };
const tA = Date.now(); const rA = resoudre(gros, { cibles: facile, arreterSiCiblesAtteintes: true }); const dA = Date.now() - tA;
ok("ARRÊT ANTICIPÉ (réglage de l'interface) : quand les trois meilleures solutions atteignent déjà TOUTES les cibles (manque 0), le solveur s'arrête après la passe étroite : réponse rapide, manque 0, trois solutions distinctes valides, résultat déclaré non exact (le départage par le nombre de modifications n'est pas prouvé)", dA < 4000 && !rA.exact && rA.solutions.length === 3 && rA.solutions.every((x) => x.manque === 0 && x.exotiques <= 1 && x.choix.length === 5), { dA, exact: rA.exact });
const tB = Date.now(); const rB = resoudre(gros, { cibles: { arme: 220, super: 220, grenade: 200, classe: 160 }, delaiMs: 1 }); const dB = Date.now() - tB;
ok("BUDGET DE TEMPS (1 ms, cas difficile) : la passe complète est interrompue, le solveur rend quand même les solutions de la passe étroite (valides, règle de l'exotique respectée), déclarées non exactes, en un temps raisonnable", dB < 8000 && !rB.exact && rB.solutions.length >= 1 && rB.solutions.every((x) => x.exotiques <= 1 && x.choix.length === 5), { dB, exact: rB.exact, n: rB.solutions.length });
ok("SANS ARRÊT ANTICIPÉ NI BUDGET (réglages par défaut) : le comportement est celui de la version exacte (déjà vérifié contre la recherche exhaustive ci-dessus) ; `arreterSiCiblesAtteintes` à `false` ne change rien au résultat sur une instance petite", (() => { const cs = [cand("c1", "casque", false, [opt([0, 0, 0, 0, 0, 60], 1), opt([0, 0, 0, 0, 0, 40], 0)]), cand("t1", "torse", false, [opt([0, 0, 0, 0, 0, 60], 1), opt([0, 0, 0, 0, 0, 30], 0)])]; const a = resoudre(cs, { cibles: { arme: 100 } }), b = resoudre(cs, { cibles: { arme: 100 }, arreterSiCiblesAtteintes: false, delaiMs: 60000 }); return JSON.stringify(a.solutions) === JSON.stringify(b.solutions) && a.exact && b.exact; })());

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
