// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR, liste « À CHASSER » (décision de l'utilisateur au départ : « quand rien n'atteint les cibles : la liste des armures à chasser, en archétype et statistique tertiaire, jamais une pièce nommée sauf exotique ») : pour la MEILLEURE solution, on remplace UNE pièce à la fois (les quatre autres restent) par une pièce HYPOTHÉTIQUE de chaque archétype (les douze) et de chaque statistique tertiaire possible, et on regarde de combien le manque diminuerait. Pur, sans interface.
// HYPOTHÈSES (écrites sur l'écran) : pièce de palier 5 MAÎTRISÉE (les trois petites statistiques à `maitrise`, 5 par défaut), un mod de statistique +10 au meilleur endroit, AUCUN ajustement (le « + » d'une légendaire est tiré au hasard : on ne le suppose pas). Les exotiques ne sont pas proposées (leur archétype est imposé : à nommer à la main). Valeurs du modèle : celles du diagnostic réel de l'utilisateur (primaire 30, secondaire 25, tertiaire 20, 12 archétypes à paire fixe).
// EN: ⚠️ ADDED - optimizer "to hunt" list: replace one piece at a time of the best solution by a hypothetical piece of each archetype/tertiary stat and measure the shortfall reduction.
import type { StatKey } from "../../types/build";
import { STATS_ORDRE, manqueDe, type Bloc } from "./optimiseur";
import type { SolutionPieces } from "./optimiseurPieces";

/** FR : les douze archétypes et leur paire (primaire, secondaire), confirmés sur les armures de l'utilisateur (28/10/2026). */
export const ARCHETYPES: ReadonlyArray<{ nom: string; primaire: StatKey; secondaire: StatKey }> = [
  { nom: "Mitrailleur", primaire: "arme", secondaire: "grenade" }, { nom: "Maître", primaire: "arme", secondaire: "super" },
  { nom: "Spécialiste", primaire: "classe", secondaire: "arme" }, { nom: "Pilleur", primaire: "classe", secondaire: "melee" },
  { nom: "Parangon", primaire: "super", secondaire: "melee" }, { nom: "Colosse", primaire: "super", secondaire: "sante" },
  { nom: "Grenadier", primaire: "grenade", secondaire: "super" }, { nom: "Démolisseur", primaire: "grenade", secondaire: "classe" },
  { nom: "Escarmoucheur", primaire: "melee", secondaire: "arme" }, { nom: "Pugnace", primaire: "melee", secondaire: "sante" },
  { nom: "Rempart", primaire: "sante", secondaire: "classe" }, { nom: "Brise-siège", primaire: "sante", secondaire: "grenade" }
];

export interface PropositionChasse {
  slot: string;
  archetype: string; primaire: StatKey; secondaire: StatKey; tertiaire: StatKey;
  /** FR : le mod de statistique (+10) qui donne ce résultat. */
  mod: StatKey;
  /** FR : le nom de la pièce de la solution qu'elle remplacerait. */
  remplace: string;
  manqueActuel: number; manqueApres: number; gain: number;
  /** FR : les statistiques de la pièce hypothétique (avec son mod). */
  stats: Bloc;
}
export interface ParametresChasse { cibles: Partial<Bloc>; poids?: Partial<Bloc>; bonus?: Partial<Bloc>; maitrise?: number; max?: number; maxParEmplacement?: number }

const bloc = (): Bloc => ({ sante: 0, melee: 0, grenade: 0, super: 0, classe: 0, arme: 0 });

/** FR : la pièce hypothétique d'un archétype, d'une tertiaire et d'un mod de statistique. */
export function pieceHypothetique(arch: { primaire: StatKey; secondaire: StatKey }, tertiaire: StatKey, mod: StatKey | null, maitrise = 5): Bloc {
  const s = bloc();
  for (const k of STATS_ORDRE) s[k] = maitrise;
  s[arch.primaire] = 30; s[arch.secondaire] = 25; s[tertiaire] = 20;
  if (mod) s[mod] += 10;
  return s;
}

/** FR : la liste « à chasser » de la solution (les meilleures améliorations d'abord). Vide si la solution atteint déjà toutes les cibles. */
export function listeAChasser(sol: SolutionPieces, p: ParametresChasse): PropositionChasse[] {
  const actuel = manqueDe(sol.totaux, p.cibles, p.poids, p.bonus);
  if (actuel.manque === 0) return [];
  const toutes: PropositionChasse[] = [];
  sol.pieces.forEach(({ piece, option }) => {
    const autres = bloc();
    for (const k of STATS_ORDRE) autres[k] = sol.totaux[k] - option.stats[k];
    for (const arch of ARCHETYPES) for (const tert of STATS_ORDRE) {
      if (tert === arch.primaire || tert === arch.secondaire) continue;
      let meilleure: { mod: StatKey; stats: Bloc; manque: number; pondere: number } | null = null;
      for (const mod of STATS_ORDRE) {
        const h = pieceHypothetique(arch, tert, mod, p.maitrise);
        const tot = bloc(); for (const k of STATS_ORDRE) tot[k] = autres[k] + h[k];
        const m = manqueDe(tot, p.cibles, p.poids, p.bonus);
        if (!meilleure || m.manque < meilleure.manque || (m.manque === meilleure.manque && m.manquePondere < meilleure.pondere)) meilleure = { mod, stats: h, manque: m.manque, pondere: m.manquePondere };
      }
      if (meilleure && meilleure.manque < actuel.manque) toutes.push({ slot: piece.slot, archetype: arch.nom, primaire: arch.primaire, secondaire: arch.secondaire, tertiaire: tert, mod: meilleure.mod, remplace: piece.nom ?? "pièce sans nom", manqueActuel: actuel.manque, manqueApres: meilleure.manque, gain: actuel.manque - meilleure.manque, stats: meilleure.stats });
    }
  });
  const ordreSlot = ["casque", "gants", "torse", "jambes", "marque"];
  toutes.sort((a, b) => a.manqueApres - b.manqueApres || ordreSlot.indexOf(a.slot) - ordreSlot.indexOf(b.slot) || (a.archetype < b.archetype ? -1 : a.archetype > b.archetype ? 1 : 0) || (a.tertiaire < b.tertiaire ? -1 : 1));
  const parSlot = new Map<string, number>(), sortie: PropositionChasse[] = [];
  for (const x of toutes) {
    const n = parSlot.get(x.slot) ?? 0; if (n >= (p.maxParEmplacement ?? 2)) continue;
    parSlot.set(x.slot, n + 1); sortie.push(x); if (sortie.length >= (p.max ?? 6)) break;
  }
  return sortie;
}
