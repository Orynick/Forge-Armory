// FR : ⚠️ AJOUT (06/10/2026, v0.3.1) - DÉPARTAGER LES ICÔNES AMBIGUËS À L'ŒIL, EN JEU. Demande de l'utilisateur : « un bouton de diagnostic affichant les 2 icônes possibles, et je vérifie en
// jeu quels sont les bons ». 13 perks d'artefact portent un nom qui existe avec DEUX icônes différentes dans le Manifest, et ce dernier ne dit pas laquelle va avec quel artefact (la saison n'est
// pas renseignée sur ces objets) : aucune règle fiable ne tranche, donc on montre les candidats et l'utilisateur choisit. Les icônes viennent de Bungie (jamais devinées par l'appli).
// Fonctions PURES, sans React, testées à part. Le choix se télécharge en JSON, à envoyer : il est ensuite figé dans `data/iconesPerksArtefact.ts`.
// EN: ⚠️ ADDED - lets the user settle ambiguous artifact-perk icons by eye, in game: candidates are shown, the user picks, the choice is downloaded as JSON.

import type { RapportIcones } from "./controleIconesPerksArtefact";
import { clePerkIcone } from "./controleIconesPerksArtefact";

/** FR : une icône candidate : sa lettre (A, B...), son chemin chez Bungie et les objets du Manifest qui la portent. / EN: one candidate icon. */
export interface OptionIcone {
  lettre: string;
  icone: string;
  objets: number[];
  /** FR : ⚠️ AJOUT (06/10/2026) - nom sous lequel le Manifest connaît cette icône, quand il DIFFÈRE de celui de nos données (cas « nom différent »). / EN: the Manifest's name for this icon when it differs from ours. */
  nomManifest?: string;
}

/** FR : un perk d'artefact ambigu, à trancher. / EN: one ambiguous artifact perk to settle. */
export interface CasAmbigu {
  /** FR : clé `artefact|palier|nom` (celle de `data/iconesPerksArtefact.ts`). / EN: key of the baked-in table. */
  cle: string;
  artefactId: string;
  artefactNom: string;
  tier: number;
  nom: string;
  options: OptionIcone[];
  /**
   * FR : ⚠️ AJOUT (06/10/2026) - « ambigu » : le MÊME nom existe avec plusieurs icônes ; « nom-different » : AUCUN objet n'a exactement notre nom, mais des objets de nom très proche existent (faute de frappe) ; leurs icônes
   * (toutes versions) sont proposées. L'utilisateur a constaté en jeu que la première icône d'un tel nom proche pouvait être fausse : on lui montre donc toutes les versions, avec « Aucune ne correspond ».
   * EN: "ambigu": same name, several icons; "nom-different": no exact name but close-named items exist; all their versions are offered.
   */
  type: "ambigu" | "nom-different";
}

const LETTRES = "ABCDEFGH";

/**
 * FR : les perks ambigus du rapport, avec leurs icônes candidates. Les objets du Manifest qui portent la MÊME icône sont regroupés (un même nom peut compter trois objets pour deux icônes).
 * Les candidats sont ordonnés par le plus petit hash de leurs objets : l'ordre (donc les lettres A, B...) est STABLE d'une exécution à l'autre. Seuls les objets d'artefact AVEC icône comptent.
 * EN: the report's ambiguous perks with their candidate icons; objects sharing an icon are grouped; stable A, B... order (smallest hash first).
 */
export function casAmbigus(rapport: RapportIcones, enregistrees: Readonly<Record<string, string>> = {}): CasAmbigu[] {
  const cas: CasAmbigu[] = [];
  for (const l of rapport.lignes) {
    if (l.verdict !== "ambigu") continue;
    const parIcone = new Map<string, number[]>();
    for (const c of l.candidats) {
      if (!c.ressembleArtefact || !c.icone) continue;
      const objets = parIcone.get(c.icone) ?? [];
      if (!objets.includes(c.hash)) objets.push(c.hash);
      parIcone.set(c.icone, objets);
    }
    const options = [...parIcone.entries()]
      .map(([icone, objets]) => ({ icone, objets: [...objets].sort((a, b) => a - b) }))
      .sort((a, b) => a.objets[0] - b.objets[0])
      .slice(0, LETTRES.length)
      .map((o, i) => ({ lettre: LETTRES[i], ...o }));
    if (l.verdict === "ambigu") {
      if (options.length < 2) continue; // FR : « ambigu » suppose au moins deux icônes ; sinon rien à départager / EN: nothing to settle
      cas.push({ cle: clePerkIcone(l.artefactId, l.tier, l.nom), artefactId: l.artefactId, artefactNom: l.artefactNom, tier: l.tier, nom: l.nom, options, type: "ambigu" });
      continue;
    }
  }
  for (const l of rapport.lignes) {
    // FR : ⚠️ AJOUT (06/10/2026) - perks INTROUVABLES dont un nom très proche existe : on propose les icônes de TOUTES les versions des noms les plus proches (à distance minimale, au plus 2 fautes de frappe).
    if (l.verdict !== "introuvable" || l.suggestions.length === 0) continue;
    const meilleure = Math.min(...l.suggestions.map((s) => s.distance));
    if (meilleure > 2) continue;
    const parIcone = new Map<string, { objets: number[]; noms: string[] }>();
    for (const s of l.suggestions.filter((x) => x.distance === meilleure)) {
      for (const c of s.candidats) {
        if (!c.icone) continue;
        const e = parIcone.get(c.icone) ?? { objets: [], noms: [] };
        if (!e.objets.includes(c.hash)) e.objets.push(c.hash);
        if (!e.noms.includes(s.nom)) e.noms.push(s.nom);
        parIcone.set(c.icone, e);
      }
    }
    const options = [...parIcone.entries()]
      .map(([icone, e]) => ({ icone, objets: [...e.objets].sort((a, b) => a - b), nomManifest: e.noms.join(" / ") }))
      .sort((a, b) => a.objets[0] - b.objets[0])
      .slice(0, LETTRES.length)
      .map((o, i) => ({ lettre: LETTRES[i], ...o }));
    if (options.length === 0) continue;
    cas.push({ cle: clePerkIcone(l.artefactId, l.tier, l.nom), artefactId: l.artefactId, artefactNom: l.artefactNom, tier: l.tier, nom: l.nom, options, type: "nom-different" });
  }
  // FR : ⚠️ AJOUT (06/10/2026, v0.3.4) - `enregistrees` : la table des icônes DÉJÀ figées dans l'appli (clé -> chemin). Un cas dont l'icône enregistrée figure toujours parmi ses candidates est DÉJÀ TRANCHÉ : on ne le repropose
  // pas (les 19 perks choisis par l'utilisateur le 06/10/2026 ne reviennent donc plus). Il revient si l'icône enregistrée n'est PLUS parmi les candidates (après une mise à jour du jeu, par exemple) ou si le perk n'a pas d'icône
  // enregistrée. Sans ce paramètre, tous les cas sont renvoyés (comportement d'avant).
  // EN: ⚠️ ADDED - `enregistrees`: the icons already baked in; a case whose baked icon is still among its candidates is already settled and not offered again.
  return cas.filter((c) => !(enregistrees[c.cle] && c.options.some((o) => o.icone === enregistrees[c.cle])));
}

/**
 * FR : le fichier JSON des choix, à envoyer. `choix` associe la clé d'un perk à la LETTRE de l'icône retenue ; une lettre inconnue pour ce perk est ignorée, et un perk non tranché figure dans
 * `non_tranches` (rien n'est deviné). La sortie ne contient que des chemins d'icônes de Bungie.
 * EN: the JSON file of the choices; an unknown letter is ignored; undecided perks are listed in `non_tranches`.
 */
export const AUCUNE = "aucune";

export function choixEnJson(cas: readonly CasAmbigu[], choix: Readonly<Record<string, string | undefined>>, version: string, date: string): string {
  const retenus: Record<string, { option: string; icone: string; objets: number[]; nom_manifest?: string }> = {};
  const aucune: string[] = [];
  const nonTranches: string[] = [];
  for (const c of cas) {
    const option = c.options.find((o) => o.lettre === choix[c.cle]);
    if (option) retenus[c.cle] = { option: option.lettre, icone: option.icone, objets: option.objets, ...(option.nomManifest ? { nom_manifest: option.nomManifest } : {}) };
    // FR : ⚠️ AJOUT (06/10/2026) - « Aucune ne correspond » : l'utilisateur a comparé au jeu et AUCUNE icône proposée n'est la bonne (information utile, distincte de « je ne sais pas »).
    else if (choix[c.cle] === AUCUNE) aucune.push(c.cle);
    else nonTranches.push(c.cle);
  }
  return JSON.stringify(
    { forgeArmory: version, date, tranches: Object.keys(retenus).length + aucune.length, sur: cas.length, choix: retenus, aucune_ne_correspond: aucune, non_tranches: nonTranches },
    null,
    1
  );
}
