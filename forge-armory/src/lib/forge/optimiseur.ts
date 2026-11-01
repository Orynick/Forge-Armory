// FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures), OPTIMISEUR de statistiques d'armure, ÉTAPE 2 (moteur de calcul), couche 1 : le SOLVEUR PUR. Il ne connaît ni le Manifest ni Bungie : on lui donne, pour chaque emplacement (casque, gants, torse, jambes, marque de classe), des CANDIDATS (les pièces possédées), chacun avec ses OPTIONS (les combinaisons de mod de statistique et d'ajustement possibles, avec les statistiques TOTALES de la pièce pour chacune) ; il choisit UNE pièce par emplacement et UNE option par pièce, pour s'approcher des statistiques CIBLES.
// RÈGLES (données par l'utilisateur) : une seule armure EXOTIQUE en tout, la marque de classe exotique comprise (« compte comme une armure exotique ») ; le MANQUE se mesure en POINTS : somme, sur les statistiques ciblées, de max(0, cible − total) (un excédent ne compense jamais un manque ailleurs) ; départage : (1) le manque, (2) le manque pondéré par les priorités, (3) le nombre de modifications par rapport à l'équipement actuel, (4) l'ordre des identifiants (résultat déterministe). Les « trois meilleures solutions » ont trois ENSEMBLES DE PIÈCES différents.
// MÉTHODE : programmation dynamique emplacement par emplacement ; l'état est le vecteur des totaux partiels, PLAFONNÉ à ce qui ne peut plus changer le manque (un total qui dépasse déjà la cible + les pertes maximales possibles des emplacements restants n'a plus d'importance : les options peuvent être NÉGATIVES, un plafond naïf à la cible serait faux) ; les options dominées d'une même pièce sont écartées ; un FAISCEAU limite le nombre d'états (résultat alors marqué non exact). Vérifié contre une recherche exhaustive (`tests/logique/optimiseur.test.ts`).
// EN: ⚠️ ADDED - armor-stat optimizer, step 2, layer 1: the PURE SOLVER (one piece per slot, one option per piece, at most one exotic incl. the class item, shortfall in points, DP with beam search, three distinct piece sets).
import type { StatKey } from "../../types/build";

export type Bloc = Record<StatKey, number>;
export const STATS_ORDRE: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
export const SLOTS_ARMURE = ["casque", "gants", "torse", "jambes", "marque"] as const;

export interface OptionAbstraite { stats: Bloc; /** FR : nombre de modifications par rapport à l'équipement actuel de la pièce (0 = on n'y touche pas). */ modifs: number }
export interface CandidatAbstrait { id: string; slot: string; exotique: boolean; options: OptionAbstraite[] }
export interface ParametresSolveur {
  /** FR : les totaux visés ; une statistique absente n'est pas ciblée. */
  cibles: Partial<Bloc>;
  /** FR : priorités (poids du manque d'une statistique dans le DÉPARTAGE ; 1 par défaut). */
  poids?: Partial<Bloc>;
  /** FR : bonus constants ajoutés aux totaux (doctrine, artefact…). */
  bonus?: Partial<Bloc>;
  nbSolutions?: number;
  /** FR : nombre maximal d'états gardés après chaque emplacement (résultat non exact si dépassé). */
  largeurFaisceau?: number;
  maxExotiques?: number;
  /** FR : budget de temps (ms) de la passe COMPLÈTE : au-delà, on garde les solutions de la passe étroite et le résultat est déclaré non exact. Absent : pas de limite (résultat exact quand le faisceau n'est pas dépassé). */
  delaiMs?: number;
  /** FR : si les trois meilleures solutions de la passe étroite atteignent déjà TOUTES les cibles (manque 0), on s'arrête là : la passe complète ne pourrait plus améliorer que le départage (moins de modifications). Faux par défaut. */
  arreterSiCiblesAtteintes?: boolean;
  /** FR : largeur du faisceau de la passe étroite (200 par défaut) ; les tests la réduisent pour FORCER la passe complète avec élagage et vérifier qu'elle ne change jamais le résultat. */
  largeurReference?: number;
}
export interface ChoixSolution { idCandidat: string; slot: string; indexOption: number }
export interface SolutionAbstraite { choix: ChoixSolution[]; totaux: Bloc; manque: number; manquePondere: number; modifs: number; exotiques: number }
export interface ResultatSolveur { solutions: SolutionAbstraite[]; /** FR : faux si le faisceau a écarté des états (le résultat reste valide mais peut ne pas être optimal). */ exact: boolean; slotsManquants: string[]; nbEtatsMax: number }

const zero = (): Bloc => ({ sante: 0, melee: 0, grenade: 0, super: 0, classe: 0, arme: 0 });

/** FR : le manque d'un bloc de totaux (points, puis pondéré). / EN: shortfall of a totals block. */
export function manqueDe(totaux: Bloc, cibles: Partial<Bloc>, poids: Partial<Bloc> = {}, bonus: Partial<Bloc> = {}): { manque: number; manquePondere: number } {
  let manque = 0, pondere = 0;
  for (const s of STATS_ORDRE) {
    const c = cibles[s]; if (c === undefined) continue;
    const m = Math.max(0, c - (totaux[s] + (bonus[s] ?? 0)));
    manque += m; pondere += m * (poids[s] ?? 1);
  }
  return { manque, manquePondere: pondere };
}

interface Partiel { vec: number[]; exo: number; modifs: number; parent: Partiel | null; code: number; sigN: number }   // ⚠️ liens vers le parent (pas de copie de tableau) ; `sigN` = signature numérique de l'ensemble de pièces

export function resoudre(candidatsTous: readonly CandidatAbstrait[], p: ParametresSolveur): ResultatSolveur {
  const stats = STATS_ORDRE.filter((s) => p.cibles[s] !== undefined);
  const N = Math.max(1, p.nbSolutions ?? 3), B = Math.max(1, p.largeurFaisceau ?? 3000), maxExo = p.maxExotiques ?? 1;
  const cible = stats.map((s) => (p.cibles[s] as number) - (p.bonus?.[s] ?? 0));
  const slots = SLOTS_ARMURE.filter((s) => candidatsTous.some((c) => c.slot === s));
  const slotsManquants = SLOTS_ARMURE.filter((s) => !slots.includes(s));
  if (slots.length === 0) return { solutions: [], exact: true, slotsManquants, nbEtatsMax: 0 };
  const vecteur = (o: OptionAbstraite) => stats.map((s) => o.stats[s]);

  // --- les candidats de chaque emplacement, leurs options non dominées ---
  interface Cand { idx: number; c: CandidatAbstrait; opts: Array<{ ref: number; v: number[]; modifs: number }> }
  const parSlot: Cand[][] = slots.map((sl) => candidatsTous.filter((c) => c.slot === sl && c.options.length > 0).map((c, idx) => {
    const tous = c.options.map((o, ref) => ({ ref, v: vecteur(o), modifs: o.modifs }));
    const gardes = tous.filter((a, i) => !tous.some((b, j) => j !== i && b.modifs <= a.modifs && b.v.every((x, k) => x >= a.v[k]) && (b.modifs < a.modifs || b.v.some((x, k) => x > a.v[k]) || j < i)));
    return { idx, c, opts: gardes };
  }));
  if (parSlot.some((l) => l.length === 0)) return { solutions: [], exact: true, slotsManquants, nbEtatsMax: 0 };

  // --- plafonds et bornes par emplacement ---
  const nS = slots.length, nD = stats.length;
  const minC = parSlot.map((l) => stats.map((_, k) => Math.min(...l.flatMap((c) => c.opts.map((o) => o.v[k])))));
  const maxC = parSlot.map((l) => stats.map((_, k) => Math.max(...l.flatMap((c) => c.opts.map((o) => o.v[k])))));
  const resteMin = (apres: number, k: number) => { let t = 0; for (let j = apres + 1; j < nS; j++) t += minC[j][k]; return t; };
  const resteMax = (apres: number, k: number) => { let t = 0; for (let j = apres + 1; j < nS; j++) t += maxC[j][k]; return t; };

  // --- une passe de programmation dynamique ; `U` = manque au-delà duquel un état est abandonné (élagage EXACT : la borne est optimiste) ---
  const resteMaxK = Array.from({ length: nS }, (_, k) => stats.map((_, d) => resteMax(k, d)));
  const plafonds = Array.from({ length: nS }, (_, k) => stats.map((_, d) => cible[d] - resteMin(k, d)));
  const bornePerte = (vec: number[], k: number) => { let t = 0; for (let d = 0; d < nD; d++) { const m = cible[d] - vec[d] - resteMaxK[k][d]; if (m > 0) t += m; } return t; };
  // clés NUMÉRIQUES des états (beaucoup plus rapides que des chaînes) quand l'espace des vecteurs plafonnés tient dans 2^50 ; sinon chaînes
  const bas = Array.from({ length: nS }, (_, k) => stats.map((_, d) => { let t = 0; for (let j = 0; j <= k; j++) t += minC[j][d]; return Math.min(t, plafonds[k][d]); }));
  const rayons = Array.from({ length: nS }, (_, k) => stats.map((_, d) => Math.max(1, plafonds[k][d] - bas[k][d] + 1)));
  const numerique = rayons.map((r) => r.reduce((t, x) => t * x, 2) < 2 ** 50);
  const cleDe = (vec: number[], k: number, exo: number): string | number => {
    if (numerique[k]) { let c = 0; for (let d = 0; d < nD; d++) c = c * rayons[k][d] + (vec[d] - bas[k][d]); return c * 4 + exo; }
    return `${vec.join(",")}|${exo}`;
  };
  const nMax = Math.max(...parSlot.map((l) => l.length)) + 1;
  const echeance = p.delaiMs !== undefined ? Date.now() + p.delaiMs : Infinity;
  let compteur = 0;
  function passe(largeur: number, U: number, avecDelai = false) {
    let exactP = true, nbMax = 0, interrompu = false;
    let etats = new Map<string | number, Partiel[]>([[0, [{ vec: new Array(nD).fill(0), exo: 0, modifs: 0, parent: null, code: 0, sigN: 0 }]]]);
    for (let k = 0; k < nS; k++) {
      const plafond = plafonds[k];
      const suivants = new Map<string | number, Partiel[]>();
      for (const liste of etats.values()) for (const e of liste) for (const cand of parSlot[k]) {
        const exo = e.exo + (cand.c.exotique ? 1 : 0);
        if (exo > maxExo) continue;
        const sigN = e.sigN * nMax + cand.idx + 1;
        if (avecDelai && (++compteur & 255) === 0 && Date.now() > echeance) { interrompu = true; break; }
        for (const o of cand.opts) {
          const vec = new Array<number>(nD);
          for (let d = 0; d < nD; d++) { const x = e.vec[d] + o.v[d]; vec[d] = x < plafond[d] ? x : plafond[d]; }
          if (U < Infinity && bornePerte(vec, k) > U) continue;   // ne peut plus battre la solution de référence
          const cle = cleDe(vec, k, exo);
          const existants = suivants.get(cle);
          const modifs = e.modifs + o.modifs, code = cand.idx * 100000 + o.ref;
          if (existants) {
            const memeSig = existants.findIndex((x) => x.sigN === sigN);
            if (memeSig >= 0) { if (modifs < existants[memeSig].modifs) existants[memeSig] = { vec, exo, modifs, parent: e, code, sigN }; continue; }
          }
          const nouveau: Partiel = { vec, exo, modifs, parent: e, code, sigN };
          if (!existants) { suivants.set(cle, [nouveau]); continue; }
          existants.push(nouveau);
          if (existants.length > N) { existants.sort((a, b) => a.modifs - b.modifs || a.sigN - b.sigN); existants.length = N; }
        }
      }
      if (interrompu) break;
      etats = suivants;
      nbMax = Math.max(nbMax, etats.size);
      if (etats.size > largeur && k < nS - 1) {
        exactP = false;
        const tries = [...etats.entries()].map(([cle, l]) => ({ cle, l, b: bornePerte(l[0].vec, k), m: Math.min(...l.map((x) => x.modifs)), n: l[0].sigN })).sort((a, b) => a.b - b.b || a.m - b.m || a.n - b.n).slice(0, largeur);
        etats = new Map(tries.map((t) => [t.cle, t.l]));
      }
    }
    return { etats, exactP: exactP && !interrompu, nbMax, interrompu };
  }
  const classer = (...cartes: Array<Map<string | number, Partiel[]>>) => {
    const finales: SolutionAbstraite[] = [];
    for (const carte of cartes) for (const liste of carte.values()) for (const e of liste) {
      const codes: number[] = []; for (let x: Partiel | null = e; x && x.parent; x = x.parent) codes.unshift(x.code);
      const choix: ChoixSolution[] = []; const totaux = zero(); let modifs = 0, exotiques = 0;
      codes.forEach((code, k) => {
        const cand = parSlot[k][Math.floor(code / 100000)], ref = code % 100000;
        const o = cand.c.options[ref];
        choix.push({ idCandidat: cand.c.id, slot: cand.c.slot, indexOption: ref });
        for (const st of STATS_ORDRE) totaux[st] += o.stats[st];
        modifs += o.modifs; if (cand.c.exotique) exotiques++;
      });
      const { manque, manquePondere } = manqueDe(totaux, p.cibles, p.poids, p.bonus);
      finales.push({ choix, totaux, manque, manquePondere, modifs, exotiques });
    }
    const sg = (x: SolutionAbstraite) => x.choix.map((c) => c.idCandidat).join("/");
    finales.sort((a, b) => a.manque - b.manque || a.manquePondere - b.manquePondere || a.modifs - b.modifs || (sg(a) < sg(b) ? -1 : sg(a) > sg(b) ? 1 : 0));
    const vus = new Set<string>(), solutions: SolutionAbstraite[] = [];
    for (const x of finales) { const g = sg(x); if (vus.has(g)) continue; vus.add(g); solutions.push(x); if (solutions.length >= N) break; }
    return solutions;
  };
  // passe 1 : faisceau ÉTROIT, sans élagage : donne une solution de référence ; passe 2 : la passe complète, avec l'élagage exact (si la passe 1 n'était pas déjà exacte)
  const LARGEUR_REFERENCE = Math.max(1, Math.min(B, p.largeurReference ?? 200));
  const p1 = passe(LARGEUR_REFERENCE, Infinity);
  let solutions = classer(p1.etats), exact = p1.exactP, nbEtatsMax = p1.nbMax;
  const dejaAtteint = p.arreterSiCiblesAtteintes === true && solutions.length >= N && solutions[N - 1].manque === 0;
  if (!p1.exactP && !dejaAtteint) {
    const U = solutions.length >= N ? solutions[N - 1].manque : Infinity;
    const p2 = passe(B, U, true);
    if (!p2.interrompu) solutions = classer(p1.etats, p2.etats);   // le meilleur des deux : jamais moins bon que la passe étroite
    exact = p2.exactP; nbEtatsMax = Math.max(nbEtatsMax, p2.nbMax);
  }
  return { solutions, exact, slotsManquants, nbEtatsMax };
}
