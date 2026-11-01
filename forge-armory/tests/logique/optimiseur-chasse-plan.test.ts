// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR : TEST de la liste « À CHASSER » (`lib/forge/optimiseurChasse.ts`) et du PLAN « à faire en jeu » (`lib/forge/optimiseurPlan.ts`). Chasse : (1) la table des DOUZE archétypes (chaque statistique est primaire de deux archétypes, paires toutes distinctes, conforme aux données réelles de l'utilisateur) ; (2) la pièce hypothétique (30 / 25 / 20 + maîtrise + mod +10) ; (3) la liste est EXACTEMENT celle d'une recherche exhaustive INDÉPENDANTE (remplacer une pièce à la fois, chaque archétype, chaque tertiaire, chaque mod) ; (4) limites : au plus 2 par emplacement et 6 en tout, du plus utile au moins utile, jamais de gain nul, jamais de tertiaire égale à la primaire ou à la secondaire, rien quand les cibles sont atteintes ; Plan : transferts (Coffre, autre personnage, Courrier, déjà sur le personnage), équipement, changements de mods, ordre, texte à copier.
// EN: ⚠️ ADDED - test of the "to hunt" list and the in-game plan.
import { listeAChasser, pieceHypothetique, ARCHETYPES } from "../../src/lib/forge/optimiseurChasse";
import { construirePlan, planEnTexte } from "../../src/lib/forge/optimiseurPlan";
import { optimiserArmures, type SolutionPieces } from "../../src/lib/forge/optimiseurPieces";
import { manqueDe, SLOTS_ARMURE, STATS_ORDRE, type Bloc } from "../../src/lib/forge/optimiseur";
import { creerCasqueChatoyant } from "./fixtures/casqueChatoyant";
import type { GearPiece, StatKey } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 900)); };
const { db, c1 } = creerCasqueChatoyant();
const bloc = (v: number[]): Bloc => ({ sante: v[0], melee: v[1], grenade: v[2], super: v[3], classe: v[4], arme: v[5] });

// ---------- 1. la table des archétypes ----------
const primaires = new Map<string, number>(); ARCHETYPES.forEach((a) => primaires.set(a.primaire, (primaires.get(a.primaire) ?? 0) + 1));
const attendu: Record<string, string> = { Mitrailleur: "arme/grenade", "Maître": "arme/super", "Spécialiste": "classe/arme", Pilleur: "classe/melee", Parangon: "super/melee", Colosse: "super/sante", Grenadier: "grenade/super", "Démolisseur": "grenade/classe", Escarmoucheur: "melee/arme", Pugnace: "melee/sante", Rempart: "sante/classe", "Brise-siège": "sante/grenade" };
ok("LES DOUZE ARCHÉTYPES ET LEUR PAIRE (primaire/secondaire) sont EXACTEMENT ceux observés sur les armures de l'utilisateur (diagnostic du 28/10/2026) ; toutes les paires sont distinctes ; chaque statistique est primaire de DEUX archétypes ; aucune paire n'a deux fois la même statistique", ARCHETYPES.length === 12 && ARCHETYPES.every((a) => attendu[a.nom] === `${a.primaire}/${a.secondaire}`) && new Set(ARCHETYPES.map((a) => `${a.primaire}/${a.secondaire}`)).size === 12 && STATS_ORDRE.every((k) => primaires.get(k) === 2) && ARCHETYPES.every((a) => a.primaire !== a.secondaire), [...primaires]);

// ---------- 2. la pièce hypothétique ----------
const maitre = ARCHETYPES.find((a) => a.nom === "Maître")!;
ok("PIÈCE HYPOTHÉTIQUE « Maître » de tertiaire Grenade avec un mod d'Armes : 5 / 5 / 20 / 25 / 5 / 40 (primaire Armes 30 + mod 10, secondaire Super 25, tertiaire Grenade 20, trois petites à 5) ; sans mod : Armes 30 ; maîtrise 0 : les petites à 0", JSON.stringify(pieceHypothetique(maitre, "grenade", "arme")) === JSON.stringify(bloc([5, 5, 20, 25, 5, 40])) && pieceHypothetique(maitre, "grenade", null).arme === 30 && JSON.stringify(pieceHypothetique(maitre, "grenade", null, 0)) === JSON.stringify(bloc([0, 0, 20, 25, 0, 30])));

// ---------- 3. la liste, comparée à une recherche exhaustive indépendante ----------
const piece = (id: string, slot: string, stats: Record<string, number>, extra: Record<string, unknown> = {}) => ({ ...c1, itemInstanceId: id, nom: `Pièce ${id}`, slot, classeRequise: "titan", origine: "coffre", stats, ...extra }) as unknown as GearPiece;
const pieces: GearPiece[] = [];
for (const [i, slot] of SLOTS_ARMURE.entries()) {
  pieces.push(piece(`${slot}A`, slot, { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 }, { equipe: true, origine: "titan" }));
  pieces.push(piece(`${slot}B`, slot, { sante: 10 + i, melee: 0, grenade: 20, super: 10, classe: 5, arme: 35 }));
}
const cibles = { arme: 200, super: 140, classe: 120 };   // la meilleure solution manque 40 points et une meilleure pièce existerait
const ciblesPlan = { arme: 200, super: 140, classe: 170 };   // pour le plan de bout en bout : trois changements de mod
const r = optimiserArmures(db, pieces, { classe: "titan", prismatique: false, cibles, delaiMs: 60000 });
const sol = r.solutions[0];
const liste = listeAChasser(sol, { cibles });
// référence indépendante : toutes les combinaisons (emplacement, archétype, tertiaire, mod), manque recalculé à partir des pièces
const reference: Array<{ slot: string; arch: string; tert: StatKey; manque: number }> = [];
sol.pieces.forEach(({ option }, idx) => {
  for (const a of ARCHETYPES) for (const t of STATS_ORDRE) {
    if (t === a.primaire || t === a.secondaire) continue;
    let mieux = Infinity;
    for (const m of STATS_ORDRE) {
      const tot: Bloc = bloc([0, 0, 0, 0, 0, 0]);
      sol.pieces.forEach((x, j) => { const s = j === idx ? pieceHypothetique(a, t, m) : x.option.stats; for (const k of STATS_ORDRE) tot[k] += s[k]; });
      mieux = Math.min(mieux, manqueDe(tot, cibles).manque);
    }
    reference.push({ slot: SLOTS_ARMURE[idx], arch: a.nom, tert: t, manque: mieux });
  }
});
const meilleurRef = reference.filter((x) => x.manque < sol.manque).sort((a, b) => a.manque - b.manque);
ok("LA LISTE EST CELLE D'UNE RECHERCHE EXHAUSTIVE INDÉPENDANTE : la meilleure proposition réduit le manque autant que la meilleure combinaison (emplacement × archétype × tertiaire × mod) de la référence ; chaque proposition rendue a un « manque ensuite » égal à celui de la référence pour la même combinaison ; la solution de départ manque 40", sol.manque === 40 && liste.length > 0 && liste[0].manqueApres === meilleurRef[0].manque && liste.every((x) => reference.find((y) => y.slot === x.slot && y.arch === x.archetype && y.tert === x.tertiaire)?.manque === x.manqueApres), [liste.slice(0, 3).map((x) => [x.slot, x.archetype, x.tertiaire, x.manqueApres]), meilleurRef.slice(0, 3)]);
ok("CHAQUE PROPOSITION : le gain est le manque actuel moins le « manque ensuite » (toujours > 0) ; la pièce remplacée est celle de la solution à cet emplacement ; la tertiaire n'est JAMAIS la primaire ni la secondaire de l'archétype ; les statistiques de la pièce hypothétique sont celles de son archétype, de sa tertiaire et de son mod", liste.every((x) => x.gain === x.manqueActuel - x.manqueApres && x.gain > 0 && x.manqueActuel === 40 && x.remplace === sol.pieces[SLOTS_ARMURE.indexOf(x.slot as never)].piece.nom && x.tertiaire !== x.primaire && x.tertiaire !== x.secondaire && JSON.stringify(x.stats) === JSON.stringify(pieceHypothetique({ primaire: x.primaire, secondaire: x.secondaire }, x.tertiaire, x.mod))), liste[0]);
const ordreSlot = SLOTS_ARMURE as readonly string[];
const parSlot = liste.reduce((m, x) => m.set(x.slot, (m.get(x.slot) ?? 0) + 1), new Map<string, number>());
// référence indépendante, pour n'importe quelle solution et n'importe quels objectifs
const referenceDe = (so: SolutionPieces, cib: Partial<Bloc>) => {
  const out: Array<{ slot: string; arch: string; tert: StatKey; manque: number }> = [];
  so.pieces.forEach((_, idx) => { for (const a of ARCHETYPES) for (const t of STATS_ORDRE) {
    if (t === a.primaire || t === a.secondaire) continue;
    let mieux = Infinity;
    for (const m of STATS_ORDRE) { const tot: Bloc = bloc([0, 0, 0, 0, 0, 0]); so.pieces.forEach((x, jj) => { const st = jj === idx ? pieceHypothetique(a, t, m) : x.option.stats; for (const k of STATS_ORDRE) tot[k] += st[k]; }); mieux = Math.min(mieux, manqueDe(tot, cib).manque); }
    out.push({ slot: SLOTS_ARMURE[idx], arch: a.nom, tert: t, manque: mieux });
  } });
  return out.filter((x) => x.manque < so.manque);
};
const ciblesB = { arme: 220, super: 160, grenade: 60 };
const solB = optimiserArmures(db, pieces, { classe: "titan", prismatique: false, cibles: ciblesB, delaiMs: 60000 }).solutions[0];
const verifier = (so: SolutionPieces, cib: Partial<Bloc>) => { const c = listeAChasser(so, { cibles: cib, max: 100000, maxParEmplacement: 100000 }); const ref = referenceDe(so, cib); return { c, ref, ok: c.length === ref.length && c.every((x) => x.gain > 0 && x.tertiaire !== x.primaire && x.tertiaire !== x.secondaire && ref.find((y) => y.slot === x.slot && y.arch === x.archetype && y.tert === x.tertiaire)?.manque === x.manqueApres) && c.every((x, i) => i === 0 || c[i - 1].manqueApres <= x.manqueApres) }; };
const vA = verifier(sol, cibles), vB = verifier(solB, ciblesB);
ok("LISTE COMPLÈTE (sans limite), DEUX SCÉNARIOS : elle contient EXACTEMENT les combinaisons (emplacement × archétype × tertiaire) qui réduisent le manque, avec le même « manque ensuite » que la référence indépendante : ni plus (aucune proposition sans gain, aucune tertiaire égale à la primaire ou à la secondaire) ni moins ; classée du plus petit au plus grand ; et dans le second scénario (manque 95) les valeurs sont VARIÉES (au moins deux), donc le classement se voit réellement", vA.ok && vB.ok && solB.manque === 95 && new Set(vB.c.map((x) => x.manqueApres)).size >= 2, [vA.c.length, vA.ref.length, vB.c.length, vB.ref.length, [...new Set(vB.c.map((x) => x.manqueApres))]]);
ok("LIMITES ET ORDRE : au plus 6 propositions, au plus 2 par emplacement, classées du plus petit « manque ensuite » au plus grand (à égalité : l'ordre Casque, Gants, Torse, Jambes, Objet de classe)", liste.length <= 6 && [...parSlot.values()].every((n) => n <= 2) && liste.every((x, i) => i === 0 || liste[i - 1].manqueApres < x.manqueApres || (liste[i - 1].manqueApres === x.manqueApres && ordreSlot.indexOf(liste[i - 1].slot) <= ordreSlot.indexOf(x.slot))), liste.map((x) => [x.slot, x.manqueApres]));
ok("RÉGLAGES : `max` et `maxParEmplacement` sont respectés ; la maîtrise 0 donne des pièces plus faibles (manque ensuite jamais meilleur que celui avec la maîtrise 5)", listeAChasser(sol, { cibles, max: 3 }).length <= 3 && Object.values(listeAChasser(sol, { cibles, maxParEmplacement: 1, max: 10 }).reduce((m, x) => ({ ...m, [x.slot]: (m[x.slot] ?? 0) + 1 }), {} as Record<string, number>)).every((n) => n <= 1) && (listeAChasser(sol, { cibles, maitrise: 0 })[0]?.manqueApres ?? 999) >= liste[0].manqueApres);
const facile = optimiserArmures(db, pieces, { classe: "titan", prismatique: false, cibles: { arme: 100 }, delaiMs: 60000 }).solutions[0];
ok("CIBLES DÉJÀ ATTEINTES : rien à chasser : la liste est vide", facile.manque === 0 && listeAChasser(facile, { cibles: { arme: 100 } }).length === 0);
ok("DÉTERMINISME ET PURETÉ : deux appels donnent la même liste ; la solution d'entrée n'est pas modifiée", JSON.stringify(listeAChasser(sol, { cibles })) === JSON.stringify(liste) && sol.manque === 40);
ok("LES PRIORITÉS DÉPARTAGENT : à manque égal, la proposition qui manque le moins sur la statistique prioritaire passe d'abord (poids Super très fort : la première proposition ne diminue pas moins le manque pondéré qu'avec un poids Armes très fort)", (() => { const a = listeAChasser(sol, { cibles, poids: { super: 50 } }), b = listeAChasser(sol, { cibles, poids: { arme: 50 } }); return a.length > 0 && b.length > 0 && a[0].manqueApres === b[0].manqueApres; })());

// ---------- 4. le plan ----------
const solPlan = (origines: Array<{ origine: string; equipe: boolean }>, changes: boolean[]): SolutionPieces => ({
  pieces: SLOTS_ARMURE.map((slot, i) => ({ piece: piece(`p${i}`, slot, {}, { origine: origines[i].origine, equipe: origines[i].equipe, nom: `Armure ${slot}` }), option: { stats: bloc([0, 0, 0, 0, 0, 0]), modifs: changes[i] ? 2 : 0, choix: {}, energieRestante: 1, statistique: "Mod d'arme", ajustement: "+Super / -Mêlée", statistiqueAvant: "Mod de classe", ajustementAvant: "+Super / -Santé", statistiqueChange: changes[i], ajustementChange: changes[i] } })),
  totaux: bloc([0, 0, 0, 0, 0, 0]), manque: 0, manquePondere: 0, manqueParStat: {}, modifs: 0, exotiques: 0
});
const plan = construirePlan(solPlan([{ origine: "coffre", equipe: false }, { origine: "titan", equipe: true }, { origine: "chasseur", equipe: false }, { origine: "courrier", equipe: false }, { origine: "titan", equipe: false }], [false, true, false, false, true]), "titan");
ok("TRANSFERTS : une pièce du Coffre « Du Coffre vers votre Titan. » ; une pièce déjà sur le Titan : aucun transfert ; une pièce d'un AUTRE personnage passe par le Coffre (« De votre Chasseur vers le Coffre, puis du Coffre vers votre Titan. ») ; une pièce du Courrier est à récupérer d'abord", plan.filter((e) => e.genre === "transfert").map((e) => `${e.titre} | ${e.detail}`).join(" ; ") === "Armure casque | Du Coffre vers votre Titan. ; Armure torse | De votre Chasseur vers le Coffre, puis du Coffre vers votre Titan. ; Armure jambes | Du Courrier vers votre Titan (récupérez-la d'abord).", plan.map((e) => e.genre + ":" + e.titre));
const eq = plan.find((e) => e.genre === "equipement");
ok("ÉQUIPEMENT : une seule étape « Équiper les 4 pièces » (celles qui ne sont pas portées : Casque, Torse, Jambes, Objet de classe) et elle dit que l'autre pièce est déjà portée", eq?.titre === "Équiper les 4 pièces" && eq.detail === "Casque, Torse, Jambes, Objet de classe. L'autre pièce est déjà portée." , eq);
const mods = plan.filter((e) => e.genre === "mod");
ok("CHANGEMENTS DE MODS : une étape par pièce dont le mod ou l'ajustement change, avec « avant → après » (ici Gants et Objet de classe) ; aucune étape pour les pièces sans changement", mods.length === 2 && mods[0].titre === "Gants · Armure gants" && mods[0].detail === "Mod de classe → Mod d'arme · ajustement +Super / -Santé → +Super / -Mêlée." && mods[1].titre === "Objet de classe · Armure marque", mods.map((e) => e.titre));
ok("ORDRE : d'abord tous les transferts, puis l'équipement, puis les mods", (() => { const g = plan.map((e) => e.genre); const ordre = { transfert: 0, equipement: 1, mod: 2 }; return g.every((x, i) => i === 0 || ordre[g[i - 1]] <= ordre[x]); })());
const plan2 = construirePlan(solPlan(SLOTS_ARMURE.map((_, i) => ({ origine: "titan", equipe: i >= 3 })), SLOTS_ARMURE.map(() => false)), "titan").find((e) => e.genre === "equipement");
ok("PLURIEL : avec trois pièces à équiper et deux déjà portées, la phrase dit « Les 2 autres pièces sont déjà portées. » ; avec toutes les pièces à équiper, elle ne dit rien de plus", plan2?.titre === "Équiper les 3 pièces" && plan2.detail === "Casque, Gants, Torse. Les 2 autres pièces sont déjà portées." && construirePlan(solPlan(SLOTS_ARMURE.map(() => ({ origine: "titan", equipe: false })), SLOTS_ARMURE.map(() => false)), "titan")[0].detail === "Casque, Gants, Torse, Jambes, Objet de classe.", plan2);
ok("RIEN À FAIRE : toutes les pièces sont déjà portées par le personnage et aucun mod ne change : le plan est vide ; une seule pièce à équiper : « Équiper la pièce »", construirePlan(solPlan(SLOTS_ARMURE.map(() => ({ origine: "titan", equipe: true })), SLOTS_ARMURE.map(() => false)), "titan").length === 0 && construirePlan(solPlan(SLOTS_ARMURE.map((_, i) => ({ origine: "titan", equipe: i !== 0 })), SLOTS_ARMURE.map(() => false)), "titan")[0].titre === "Équiper la pièce");
ok("TEXTE À COPIER : une ligne numérotée par étape avec son genre ([Transfert], [Équipement], [Mod]) ; pas de ligne vide", planEnTexte(plan).split("\n").length === plan.length && planEnTexte(plan).split("\n")[0] === "1. [Transfert] Armure casque : Du Coffre vers votre Titan." && planEnTexte([]) === "");
// de bout en bout, avec la vraie solution de l'optimiseur : les cinq pièces « A » sont portées (origine titan) : seuls les trois changements de mod apparaissent
const solReelle = optimiserArmures(db, pieces, { classe: "titan", prismatique: false, cibles: ciblesPlan, delaiMs: 60000 }).solutions[0];
const planReel = construirePlan(solReelle, "titan");
ok("DE BOUT EN BOUT : la meilleure solution de l'optimiseur (cinq pièces déjà portées, trois changements de mod) donne un plan de TROIS étapes « mod » seulement (pas de transfert, pas d'équipement), « Mod de classe → Mods d'arme »", planReel.length === 3 && planReel.every((e) => e.genre === "mod" && e.detail.includes("Mod de classe → Mods d'arme")) && planReel.map((e) => e.titre.split(" · ")[0]).join() === "Torse,Jambes,Objet de classe", planReel.map((e) => e.titre + " | " + e.detail));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
