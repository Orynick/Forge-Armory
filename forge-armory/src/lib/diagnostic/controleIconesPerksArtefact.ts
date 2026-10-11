// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - CONTRÔLE (mode développement, lecture seule) des ICÔNES DES PERKS D'ARTEFACT.
//
// Contexte. Les 147 perks d'artefact de l'appli (7 artefacts × 21, `data/artefacts.ts`) n'ont AUCUNE icône : l'affichage
// est branché (il s'active dès qu'un perk a une icône) mais les données n'en contiennent pas. La voie officielle
// (`DestinyArtifactDefinition`) est une impasse confirmée (ancien système d'artefact seulement, voir TODO). Une recherche
// par nom dans `DestinyInventoryItemDefinition` existe (`trouverIconePerkArtefact`, 27/09/2026) mais n'a JAMAIS été
// vérifiée sur un vrai Manifest et n'est branchée nulle part : elle parcourt toute la table au premier appel, ce qui
// figerait l'écran si on l'appelait à l'affichage.
// L'utilisateur a proposé (05/10/2026) un classeur communautaire dont les icônes sont des images hébergées par Google
// (miniatures de 50 px, adresses à jeton) : inutilisables dans l'appli (voir TODO). Ce contrôle vérifie donc, UNE FOIS et
// À LA DEMANDE, si le Manifest de Bungie contient ces icônes. S'il les contient, on les FIGE dans les données (chemins
// Bungie, aucun appel à l'exécution, rien à parcourir à l'affichage).
//
// Règles de reconnaissance, volontairement STRICTES (mieux vaut aucune icône qu'une fausse), identiques à
// `trouverIconePerkArtefact` : même nom (accents, majuscules et espaces multiples ignorés) ET objet qui se présente comme un
// perk d'artefact (type affiché ou catégorie de plug contenant « artefact » / « artifact ») ET une icône. Une seule icône
// distincte : « trouvé » ; plusieurs : « ambigu » (aucune retenue) ; aucune : « introuvable ». Pour les introuvables, le
// rapport liste les objets de MÊME NOM qui ne répondent pas à la règle (avec leur type et leur catégorie), pour apprendre
// comment Bungie les range sans deviner. Il décrit aussi comment les objets « artefact » sont classés (types, catégories).
// ⚠️ MIS À JOUR (05/10/2026, second passage) : le premier passage de l'utilisateur sur SON Manifest a trouvé 125 icônes sur 147 (figées dans
// `data/iconesPerksArtefact.ts`), 13 ambiguës et 9 introuvables. Cette version vise ces 22 restantes : (1) la comparaison des noms développe
// maintenant la ligature « œ » (nos données écrivent « Coeur de flamme », le Manifest « Cœur de flamme ») ; (2) pour chaque introuvable, des
// SUGGESTIONS de noms proches du Manifest (fautes de frappe : « Tirs soutenu » / « Tirs soutenus ») ; (3) pour chaque ambigu, le détail de chaque
// candidat (hash, saison, description) ; (4) si un seul des candidats appartient à la saison de l'artefact, il est PROPOSÉ (verdict « saison »),
// listé à part et jamais mélangé aux trouvés directs : rien n'est enregistré dans l'appli sans relecture.
// Fonctions sans dépendance à React, testées avec un faux Manifest.
// EN: ⚠️ ADDED - DEV-mode, read-only CHECK of the artifact perks' ICONS. Verifies ONCE, on demand, whether Bungie's
// Manifest holds them; if so they get baked into the data (no runtime lookup). Strict rules; the report lists same-name
// items that do not match the rule, and how artifact-looking items are classified.

import type { Database } from "sql.js";
import type { Artefact } from "../../data/artefacts";
import { normaliser } from "../manifest/search";
import { normaliserNomArme } from "../manifest/antiChampionExotiques";
import { obtenirDefinition } from "../manifest/download";
import { cleIconePerk } from "../../data/iconesPerksArtefact";

export interface CandidatManifest {
  hash: number;
  nom: string;
  type: string;
  categoriePlug: string;
  icone: string;
  /** FR : le type affiché ou la catégorie de plug contient « artefact » / « artifact ». / EN: the type or plug category mentions artifact. */
  ressembleArtefact: boolean;
  /** FR : saison de l'objet (`seasonHash`), si le Manifest la renseigne. / EN: the item's season, if the Manifest states it. */
  seasonHash?: number;
  /** FR : début de la description, pour reconnaître un candidat. / EN: start of the description. */
  description?: string;
}

/** FR : « trouve » = une seule icône possible ; « saison » = plusieurs, une seule dans la saison de l'artefact (à vérifier) ; « ambigu » ; « introuvable ». / EN: verdicts. */
export type VerdictIcone = "trouve" | "saison" | "ambigu" | "introuvable";

/** FR : nom proche trouvé dans le Manifest pour un perk introuvable. `distance` = nombre de fautes de frappe (0,5 : tous les mots du plus court sont dans le plus long). / EN: close name found for a missing perk. */
export interface Suggestion {
  nom: string;
  hash: number;
  icone: string;
  distance: number;
  /**
   * FR : ⚠️ AJOUT (06/10/2026) - TOUS les objets d'artefact de ce nom qui ont une icône (hash et icône de chacun). Avant, seul le premier était gardé : or le Manifest connaît souvent PLUSIEURS versions d'un même
   * perk (saisons différentes, icônes différentes), et l'icône du premier n'était pas celle du jeu : constat de l'utilisateur sur 6 perks (06/10/2026), dont les icônes enregistrées s'étaient révélées fausses.
   * EN: ⚠️ ADDED - ALL artifact items of this name that have an icon; the Manifest often has several versions of one perk.
   */
  candidats: Array<{ hash: number; icone: string }>;
}

export interface LignePerkIcone {
  artefactId: string;
  artefactNom: string;
  tier: number;
  nom: string;
  verdict: VerdictIcone;
  /** FR : l'icône retenue (verdict « trouvé » seulement). / EN: the retained icon ("found" only). */
  icone?: string;
  /** FR : les icônes DISTINCTES des objets qui répondent à la règle. / EN: distinct icons of rule-matching items. */
  icones: string[];
  /** FR : tous les objets du Manifest portant ce nom, qu'ils répondent ou non à la règle. / EN: every Manifest item with this name. */
  candidats: CandidatManifest[];
  /** FR : introuvables seulement : noms proches du Manifest. / EN: missing perks only: close names. */
  suggestions: Suggestion[];
  /** FR : saison de l'artefact (`seasonHash` de son objet), si connue. / EN: the artifact's season, if known. */
  saisonArtefact?: number;
}

export interface RapportIcones {
  lignes: LignePerkIcone[];
  /** FR : nombre d'objets lus dans le Manifest. / EN: number of Manifest items read. */
  objetsLus: number;
  /** FR : nombre d'objets qui se présentent comme des objets d'artefact (toutes icônes confondues). / EN: artifact-looking items. */
  objetsArtefact: number;
  /** FR : types affichés des objets d'artefact, du plus fréquent au moins fréquent. / EN: displayed types of artifact-looking items. */
  types: [string, number][];
  /** FR : catégories de plug des objets d'artefact, du plus fréquent au moins fréquent. / EN: plug categories of artifact-looking items. */
  categories: [string, number][];
}

/**
 * FR : clé de comparaison d'un nom : sans accents, en minuscules, ligatures « œ » et « æ » développées, apostrophes unifiées, ponctuation et
 * espaces ramenés à un seul espace (même règle que pour les noms d'armes). ⚠️ CHANGÉ (05/10/2026) : la version précédente n'ignorait que les
 * accents, donc « Coeur de flamme » (nos données) ne retrouvait pas « Cœur de flamme » (Manifest) : trois des neuf introuvables du premier
 * passage (« Coeur de flamme », « Voeu d'existence », « Au coeur de l'action »).
 * EN: name comparison key, now expanding the œ/æ ligatures.
 */
export function cleNom(nom: string): string {
  return normaliserNomArme(nom);
}

function ressembleArtefact(type: string, categoriePlug: string): boolean {
  const t = normaliser(type);
  const c = normaliser(categoriePlug);
  return t.includes("artefact") || t.includes("artifact") || c.includes("artifact");
}

interface DefObjet {
  hash?: number;
  seasonHash?: number;
  displayProperties?: { name?: string; icon?: string; description?: string };
  itemTypeDisplayName?: string;
  plug?: { plugCategoryIdentifier?: string };
}

/**
 * FR : UN SEUL passage sur `DestinyInventoryItemDefinition` : retient, pour chaque nom recherché, les objets qui le portent,
 * et décrit comment les objets d'artefact sont classés. Quelques secondes sur un vrai Manifest : à lancer à la demande,
 * jamais à l'affichage.
 * EN: ONE pass over the item table.
 */
export function lireObjetsDuManifest(
  db: Database,
  nomsRecherches: ReadonlySet<string>
): {
  candidats: Map<string, CandidatManifest[]>;
  /** FR : tous les objets d'artefact AVEC icône, par clé de nom, TOUTES versions comprises (sert aux suggestions). / EN: all artifact-looking items with an icon, by name key, ALL versions. */
  nomsArtefact: Map<string, CandidatManifest[]>;
  objetsLus: number;
  objetsArtefact: number;
  types: Map<string, number>;
  categories: Map<string, number>;
} {
  const candidats = new Map<string, CandidatManifest[]>();
  const nomsArtefact = new Map<string, CandidatManifest[]>();
  const types = new Map<string, number>();
  const categories = new Map<string, number>();
  let objetsLus = 0;
  let objetsArtefact = 0;
  const stmt = db.prepare("SELECT json FROM DestinyInventoryItemDefinition");
  try {
    while (stmt.step()) {
      objetsLus += 1;
      let def: DefObjet;
      try {
        def = JSON.parse(stmt.getAsObject().json as string) as DefObjet;
      } catch {
        continue; // FR : ligne illisible : ignorée / EN: unreadable row: ignored
      }
      const nom = def.displayProperties?.name;
      const type = def.itemTypeDisplayName ?? "";
      const categoriePlug = def.plug?.plugCategoryIdentifier ?? "";
      const artefact = ressembleArtefact(type, categoriePlug);
      if (artefact) {
        objetsArtefact += 1;
        if (type) types.set(type, (types.get(type) ?? 0) + 1);
        if (categoriePlug) categories.set(categoriePlug, (categories.get(categoriePlug) ?? 0) + 1);
      }
      if (!nom) continue;
      const cle = cleNom(nom);
      const candidat: CandidatManifest = {
        hash: Number(def.hash ?? 0),
        nom,
        type,
        categoriePlug,
        icone: def.displayProperties?.icon ?? "",
        ressembleArtefact: artefact,
        seasonHash: def.seasonHash,
        description: (def.displayProperties?.description ?? "").slice(0, 70),
      };
      if (artefact && candidat.icone) {
        const versions = nomsArtefact.get(cle) ?? [];
        versions.push(candidat);
        nomsArtefact.set(cle, versions);
      }
      if (!nomsRecherches.has(cle)) continue;
      const liste = candidats.get(cle) ?? [];
      liste.push(candidat);
      candidats.set(cle, liste);
    }
  } finally {
    stmt.free();
  }
  return { candidats, nomsArtefact, objetsLus, objetsArtefact, types, categories };
}

/** FR : distance d'édition (nombre minimal d'insertions, suppressions et remplacements) entre deux textes. / EN: edit distance. */
export function distanceEdition(a: string, b: string): number {
  if (a === b) return 0;
  const prec = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prec[0];
    prec[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const haut = prec[j];
      prec[j] = Math.min(prec[j] + 1, prec[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = haut;
    }
  }
  return prec[b.length];
}

/** FR : tous les mots du texte le plus court figurent-ils, dans l'ordre, dans le plus long ? (« tactique de meute » / « tactique de la meute »). / EN: are all words of the shorter text, in order, in the longer? */
function motsInclus(a: string, b: string): boolean {
  const [court, long] = a.split(" ").length <= b.split(" ").length ? [a, b] : [b, a];
  const mots = long.split(" ");
  let i = 0;
  for (const m of court.split(" ")) {
    while (i < mots.length && mots[i] !== m) i += 1;
    if (i >= mots.length) return false;
    i += 1;
  }
  return true;
}

/** FR : les 3 noms d'objets d'artefact les plus proches d'un nom introuvable (fautes de frappe ou mots en plus ou en moins). / EN: the 3 closest artifact item names. */
export function suggerer(cle: string, noms: ReadonlyMap<string, readonly CandidatManifest[]>, max = 3): Suggestion[] {
  const seuil = Math.max(2, Math.floor(cle.length * 0.3));
  const trouves: Suggestion[] = [];
  for (const [k, versions] of noms) {
    const d = distanceEdition(cle, k);
    const distance = motsInclus(cle, k) ? Math.min(d, 0.5) : d;
    if (distance <= seuil && versions.length > 0) {
      const c = versions[0];
      trouves.push({ nom: c.nom, hash: c.hash, icone: c.icone, distance, candidats: versions.map((v) => ({ hash: v.hash, icone: v.icone })) });
    }
  }
  return trouves.sort((x, y) => x.distance - y.distance || x.nom.localeCompare(y.nom)).slice(0, max);
}

const trier = (m: Map<string, number>): [string, number][] => [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/** FR : analyse les perks de tous les artefacts. / EN: analyses every artifact's perks. */
export function controlerIconesPerksArtefact(db: Database, artefacts: readonly Artefact[]): RapportIcones {
  const nomsRecherches = new Set<string>();
  for (const a of artefacts) for (const t of [1, 2, 3] as const) for (const p of a.perksParTier[t]) nomsRecherches.add(cleNom(p.nom));
  const lu = lireObjetsDuManifest(db, nomsRecherches);
  // FR : saison de chaque artefact (`seasonHash` de son objet), pour départager les perks ambigus. Lecture tolérante : si elle échoue, on n'en tire rien.
  const saisonDe = (a: Artefact): number | undefined => {
    try {
      return obtenirDefinition<{ seasonHash?: number }>(db, "DestinyInventoryItemDefinition", a.itemHash)?.seasonHash;
    } catch {
      return undefined;
    }
  };
  const lignes: LignePerkIcone[] = [];
  for (const a of artefacts) {
    const saisonArtefact = saisonDe(a);
    for (const t of [1, 2, 3] as const) {
      for (const p of a.perksParTier[t]) {
        const cle = cleNom(p.nom);
        const candidats = lu.candidats.get(cle) ?? [];
        const retenus = candidats.filter((c) => c.ressembleArtefact && c.icone);
        const icones = [...new Set(retenus.map((c) => c.icone))];
        let verdict: VerdictIcone = icones.length === 1 ? "trouve" : icones.length > 1 ? "ambigu" : "introuvable";
        let icone: string | undefined = verdict === "trouve" ? icones[0] : undefined;
        if (verdict === "ambigu" && saisonArtefact !== undefined) {
          const deLaSaison = [...new Set(retenus.filter((c) => c.seasonHash === saisonArtefact).map((c) => c.icone))];
          if (deLaSaison.length === 1) {
            verdict = "saison";
            icone = deLaSaison[0];
          }
        }
        const suggestions = verdict === "introuvable" ? suggerer(cle, lu.nomsArtefact) : [];
        lignes.push({ artefactId: a.id, artefactNom: a.nom, tier: t, nom: p.nom, verdict, icone, icones, candidats, suggestions, saisonArtefact });
      }
    }
  }
  return { lignes, objetsLus: lu.objetsLus, objetsArtefact: lu.objetsArtefact, types: trier(lu.types), categories: trier(lu.categories) };
}

/** FR : clé de l'association « perk -> icône » : un même nom peut exister dans deux artefacts. / EN: perk -> icon key. */
export const clePerkIcone = cleIconePerk;

/** FR : l'association « perk -> icône » des seuls perks trouvés DIRECTEMENT (une seule icône possible), prête à être transmise telle quelle. / EN: the map of perks found directly. */
export function iconesTrouvees(rapport: RapportIcones): Record<string, string> {
  const sortie: Record<string, string> = {};
  for (const l of rapport.lignes) if (l.verdict === "trouve" && l.icone) sortie[clePerkIcone(l.artefactId, l.tier, l.nom)] = l.icone;
  return sortie;
}

/** FR : l'association des perks PROPOSÉS par la saison de l'artefact : à relire avant tout enregistrement. / EN: the map of perks proposed by the artifact's season: to review. */
export function iconesParSaison(rapport: RapportIcones): Record<string, string> {
  const sortie: Record<string, string> = {};
  for (const l of rapport.lignes) if (l.verdict === "saison" && l.icone) sortie[clePerkIcone(l.artefactId, l.tier, l.nom)] = l.icone;
  return sortie;
}

/**
 * FR : pour chaque introuvable dont le nom le plus proche est à 2 fautes de frappe au plus, l'icône de ce nom proche : à relire (un nom différent
 * peut être un autre perk). ⚠️ Un perk n'y figure QUE si UN SEUL nom du Manifest est à cette distance minimale : deux noms à égalité (« Tir soutenu »
 * et « Tirs soutenus » pour « Tirs soutenu ») ne sont jamais départagés au hasard ; ils restent visibles dans la liste des suggestions du rapport.
 * EN: close-name icons for missing perks, to review; only when exactly ONE name is at the minimal distance (ties are never broken at random).
 */
export function iconesSuggerees(rapport: RapportIcones): Record<string, { nom: string; icone: string; distance: number }> {
  const sortie: Record<string, { nom: string; icone: string; distance: number }> = {};
  for (const l of rapport.lignes) {
    if (l.verdict !== "introuvable" || l.suggestions.length === 0) continue;
    const meilleure = l.suggestions[0];
    if (meilleure.distance > 2 || l.suggestions.filter((x) => x.distance === meilleure.distance).length !== 1) continue;
    sortie[clePerkIcone(l.artefactId, l.tier, l.nom)] = { nom: meilleure.nom, icone: meilleure.icone, distance: meilleure.distance };
  }
  return sortie;
}

const cellule = (t: string) => t.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** FR : rapport complet en Markdown, à télécharger et à transmettre. / EN: full Markdown report. */
export function rapportIconesEnMarkdown(r: RapportIcones, version: string, date: string): string {
  const compte = (v: VerdictIcone, id?: string) => r.lignes.filter((l) => l.verdict === v && (id === undefined || l.artefactId === id)).length;
  const bloc = (o: unknown) => ["```json", JSON.stringify(o, null, 1), "```"];
  const L: string[] = [];
  L.push("# Contrôle des icônes des perks d'artefact", "");
  L.push(`Forge Armory v${version} — ${date}. Lecture seule : rien n'est modifié.`);
  L.push(`${r.objetsLus} objets lus dans le Manifest (français) ; ${r.objetsArtefact} se présentent comme des objets d'artefact.`, "");
  L.push("## Résumé", "");
  L.push(
    `- **${r.lignes.length} perks** : ✅ ${compte("trouve")} trouvés · 🗓 ${compte("saison")} proposés par la saison · ⚠️ ${compte("ambigu")} ambigus · ❌ ${compte("introuvable")} introuvables`,
    ""
  );
  L.push("| Artefact | Perks | ✅ trouvés | 🗓 saison | ⚠️ ambigus | ❌ introuvables |", "|---|---|---|---|---|---|");
  const ids = [...new Set(r.lignes.map((l) => l.artefactId))];
  for (const id of ids) {
    const nom = r.lignes.find((l) => l.artefactId === id)!.artefactNom;
    L.push(`| ${cellule(nom)} | ${r.lignes.filter((l) => l.artefactId === id).length} | ${compte("trouve", id)} | ${compte("saison", id)} | ${compte("ambigu", id)} | ${compte("introuvable", id)} |`);
  }
  L.push("", "## Comment le Manifest classe les objets d'artefact", "");
  L.push("Types affichés (`itemTypeDisplayName`) :", "");
  L.push(...(r.types.length ? r.types.slice(0, 15).map(([t, n]) => `- ${n} × « ${t} »`) : ["- (aucun)"]), "");
  L.push("Catégories de plug (`plug.plugCategoryIdentifier`) :", "");
  L.push(...(r.categories.length ? r.categories.slice(0, 15).map(([t, n]) => `- ${n} × \`${t}\``) : ["- (aucune)"]), "");

  const intro = r.lignes.filter((l) => l.verdict === "introuvable");
  L.push(`## ❌ Introuvables (${intro.length})`, "");
  if (intro.length === 0) L.push("(aucun)", "");
  for (const l of intro) {
    L.push(`- **${l.nom}** — ${l.artefactNom}, tier ${l.tier}`);
    if (l.suggestions.length > 0) {
      for (const s of l.suggestions) {
        L.push(`  - 💡 nom proche : « ${s.nom} » (${s.distance === 0.5 ? "mots en plus ou en moins" : `${s.distance} faute(s) de frappe`}) — ${s.candidats.length} objet(s) de ce nom`);
        for (const c of s.candidats) L.push(`    - objet ${c.hash}, icône ${c.icone}`);
      }
    } else if (l.candidats.length === 0) {
      L.push("  - aucun objet de ce nom, ni de nom proche, parmi les objets d'artefact du Manifest");
    }
    for (const c of l.candidats.slice(0, 4)) {
      L.push(`  - objet ${c.hash} de même nom : type « ${c.type || "—"} », catégorie \`${c.categoriePlug || "—"}\`, ${c.icone ? `icône ${c.icone}` : "SANS icône"}${c.ressembleArtefact ? " (se présente comme un objet d'artefact)" : ""}`);
    }
    if (l.candidats.length > 4) L.push(`  - … et ${l.candidats.length - 4} autre(s)`);
  }

  const sai = r.lignes.filter((l) => l.verdict === "saison");
  L.push("", `## 🗓 Proposés par la saison de l'artefact (${sai.length}) — à relire avant tout enregistrement`, "");
  if (sai.length === 0) L.push("(aucun)");
  for (const l of sai) L.push(`- **${l.nom}** — ${l.artefactNom}, tier ${l.tier}, saison de l'artefact ${l.saisonArtefact} : icône retenue ${l.icone}`);

  const amb = r.lignes.filter((l) => l.verdict === "ambigu");
  L.push("", `## ⚠️ Ambigus (${amb.length})`, "");
  if (amb.length === 0) L.push("(aucun)");
  for (const l of amb) {
    L.push(`- **${l.nom}** — ${l.artefactNom}, tier ${l.tier}, saison de l'artefact ${l.saisonArtefact ?? "inconnue"} : ${l.icones.length} icônes différentes`);
    for (const c of l.candidats.filter((x) => x.ressembleArtefact && x.icone)) {
      L.push(`  - objet ${c.hash}, saison ${c.seasonHash ?? "non renseignée"}, icône ${c.icone}${c.description ? ` — « ${c.description} »` : ""}`);
    }
  }
  L.push("", "## Icônes trouvées (JSON, à transmettre tel quel)", "", ...bloc(iconesTrouvees(r)), "");
  L.push("## Icônes proposées par la saison (JSON, à relire)", "", ...bloc(iconesParSaison(r)), "");
  L.push("## Icônes de noms proches (JSON, à relire : un nom différent peut être un autre perk)", "", ...bloc(iconesSuggerees(r)), "");
  return L.join("\n");
}
