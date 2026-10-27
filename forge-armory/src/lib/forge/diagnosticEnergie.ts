// FR : ⚠️ AJOUT (24/10/2026, branche draft-mod-armures), demande de l'utilisateur : « Une pièce d'armure masterworked dispose d'un budget de 10 points d'énergie pour équiper des mods. On pourrait faire un diagnostic pour relever rapidement combien "coûte" chaque mod de chaque pièce d'armure ? » puis « Construis le diagnostic » puis « Diag d'abord ».
// DEUX DIAGNOSTICS (texte à copier, mode développement) sur les COÛTS D'ÉNERGIE des mods d'armure. Ils ne changent RIEN à l'application : ils LISENT (1) le coût de chaque mod dans le Manifest (`plug.energyCost.energyCost`) et (2) l'énergie de chaque pièce sur son exemplaire (`GearPiece.energie` : capacité et énergie utilisée).
// (A) `diagnosticEnergieMods` : pour chaque pièce, la somme des coûts de ses mods équipés doit être égale à l'énergie utilisée annoncée par le jeu ; sinon c'est un « écart ».
// ⚠️ RÈGLE VALIDÉE sur les données réelles de l'utilisateur (24/10/2026, 440 armures de son compte) : **un plug SANS coût dans le Manifest coûte 0**. Avec cette règle (ajustements, amélioration d'armure, emplacements vides ou verrouillés, Malédiction de Riven, perks d'exotiques…), la somme des coûts équipés est ÉGALE à l'énergie utilisée sur 440 pièces sur 440, sans exception. Avant cette règle, le diagnostic annonçait « comparaison impossible » sur toutes les pièces (les emplacements d'amélioration et d'ajustement, rangés avec les mods, n'ont pas de coût) : son « 0 pièce en écart » ne prouvait rien.
// (B) `diagnosticModsEnDouble` : 107 noms de mods ont, dans le même emplacement, DEUX versions (deux hashes) de coûts différents (1 et 3), jamais équipées toutes les deux. Ce diagnostic liste chaque version (hash, coût, emplacements, listes de plugs qui la contiennent, nombre de pièces qui l'équipent) et COMPARE leurs définitions brutes du Manifest chemin par chemin : les champs qui diffèrent disent comment distinguer la vraie version de l'ancienne (ou de la cachée) sans deviner.
// ⚠️ Les noms de champs Bungie lus sont ceux de l'API publique ; un champ absent est écrit « sans coût » / « absent », jamais deviné.
// Module PUR (pas de React). EN: ⚠️ ADDED - TWO dev diagnostics on armor-mod energy costs: (A) cross-check of equipped mod costs against the energy used reported by the game (rule validated on real data: a plug without a cost costs 0); (B) the mods that exist in two versions of different cost, with a raw field-by-field comparison of their Manifest definitions. Missing fields are reported, never guessed.
import type { Database } from "sql.js";
import type { GearPiece } from "../../types/build";
import { obtenirDefinition } from "../manifest/download";
import { colonnesModeleArmure, lirePlugArmure, type ColonneModele } from "./armure";

interface DefCout { plug?: { energyCost?: { energyCost?: unknown } } }

/** FR : coût d'énergie d'un mod lu dans le Manifest ; `null` si la définition n'a pas de coût lisible (entier positif ou nul) : un plug sans coût compte alors 0 (règle validée, voir l'en-tête). / EN: energy cost of a mod from the Manifest; `null` when absent (counted as 0). */
export function lireCoutEnergie(db: Database, hash: number): number | null {
  try {
    const cout = obtenirDefinition<DefCout>(db, "DestinyInventoryItemDefinition", hash)?.plug?.energyCost?.energyCost;
    return typeof cout === "number" && Number.isInteger(cout) && cout >= 0 ? cout : null;
  } catch {
    return null;
  }
}

const ORDRE_SLOTS = ["casque", "gants", "torse", "jambes", "marque"];
const trierSlots = (slots: Iterable<string>) => [...slots].sort((x, y) => ORDRE_SLOTS.indexOf(x) - ORDRE_SLOTS.indexOf(y));

// =====================================================================================
// (A) COÛTS D'ÉNERGIE PAR PIÈCE ET PAR MOD
// =====================================================================================
export interface ModEquipeEnergie { socketIndex: number; hash: number; nom: string; cout: number | null }
export interface PieceEnergie {
  nom: string;
  slot: string;
  classe: string;
  lieu: string;
  exotique: boolean;
  palier: number | null;
  capacite: number | null;
  utilisee: number | null;
  equipes: ModEquipeEnergie[];
  /** FR : nombre d'emplacements de MODS lus dans le modèle de la pièce (0 : modèle sans mod ou illisible : aucune somme n'a de sens). / EN: number of mod sockets read in the piece's model (0: no sum is meaningful). */
  nbEmplacementsMods: number;
  /** FR : somme des coûts des mods équipés, un plug sans coût comptant 0 ; `null` si la pièce n'a aucun emplacement de mod. / EN: sum of equipped mod costs (a plug without cost counts 0); `null` if the piece has no mod socket. */
  sommeLue: number | null;
  /** FR : `true` si l'énergie utilisée annoncée par le jeu diffère de la somme lue ; `null` si la comparaison est impossible (énergie non lue ou aucun emplacement de mod). / EN: `true` when the game's used energy differs from the sum read; `null` when it cannot be compared. */
  ecart: boolean | null;
}
export interface CoutDeMod { cout: number | null; emplacements: string[]; categoriesPlug: string[]; nbHashes: number; hashes: number[] }
export interface ModEnergie { nom: string; couts: CoutDeMod[]; divergent: boolean }
export interface DiagnosticEnergie {
  nbArmures: number;
  nbAvecEnergie: number;
  /** FR : nombre de pièces par capacité d'énergie lue (ex. { 10: 12, 11: 3 }). / EN: number of pieces per energy capacity read. */
  capacites: Record<number, number>;
  pieces: PieceEnergie[];
  mods: ModEnergie[];
}

/** FR : emplacements de MODS d'un modèle d'armure (mémorisés par modèle). / EN: mod sockets of an armor model (memoized per model). */
function fabriquerColonnesMods(db: Database): (itemHash: number) => ColonneModele[] {
  const memo = new Map<number, ColonneModele[]>();
  return (itemHash) => {
    let m = memo.get(itemHash);
    if (!m) {
      try { m = colonnesModeleArmure(db, itemHash, { mods: true }).filter((c) => c.mod); } catch { m = []; }
      memo.set(itemHash, m);
    }
    return m;
  };
}

export function construireDiagnosticEnergie(db: Database, pieces: readonly GearPiece[]): DiagnosticEnergie {
  const colonnesMods = fabriquerColonnesMods(db);
  const agregats = new Map<string, Map<string, { cout: number | null; emplacements: Set<string>; categories: Set<string>; hashes: Set<number> }>>();
  const lignes: PieceEnergie[] = [];
  const armures = pieces.filter((p) => ORDRE_SLOTS.includes(p.slot));

  for (const p of armures) {
    const cols = colonnesMods(p.itemHash);
    const indexMods = new Set(cols.map((c) => c.socketIndex));
    // FR : les mods possibles de cette pièce, regroupés par nom puis par coût.
    for (const col of cols) {
      for (const o of col.options) {
        const cout = lireCoutEnergie(db, o.hash);
        let parCout = agregats.get(o.nom);
        if (!parCout) { parCout = new Map(); agregats.set(o.nom, parCout); }
        const cle = cout === null ? "?" : String(cout);
        let a = parCout.get(cle);
        if (!a) { a = { cout, emplacements: new Set(), categories: new Set(), hashes: new Set() }; parCout.set(cle, a); }
        a.emplacements.add(p.slot);
        if (o.categoriePlug) a.categories.add(o.categoriePlug);
        a.hashes.add(o.hash);
      }
    }
    // FR : les mods équipés (réels) de cette pièce et leur coût.
    const equipes: ModEquipeEnergie[] = (p.perksParColonne ?? [])
      .filter((x) => indexMods.has(x.socketIndex))
      .map((x) => ({ socketIndex: x.socketIndex, hash: x.hash, nom: lirePlugArmure(db, x.hash)?.nom ?? "?", cout: lireCoutEnergie(db, x.hash) }));
    // ⚠️ RÈGLE VALIDÉE (24/10/2026, 440 armures) : un plug sans coût compte 0.
    const sommeLue = cols.length > 0 ? equipes.reduce((a, e) => a + (e.cout ?? 0), 0) : null;
    const utilisee = p.energie?.utilisee ?? null;
    lignes.push({
      nom: p.nom ?? "?", slot: p.slot, classe: p.classeRequise ?? "?", lieu: p.origine ?? "?", exotique: p.isExotic, palier: p.gearTier ?? null,
      capacite: p.energie?.capacite ?? null, utilisee, equipes, nbEmplacementsMods: cols.length, sommeLue,
      ecart: utilisee !== null && sommeLue !== null ? utilisee !== sommeLue : null
    });
  }
  lignes.sort((a, b) => ORDRE_SLOTS.indexOf(a.slot) - ORDRE_SLOTS.indexOf(b.slot) || a.nom.localeCompare(b.nom, "fr"));

  const capacites: Record<number, number> = {};
  for (const l of lignes) if (l.capacite !== null) capacites[l.capacite] = (capacites[l.capacite] ?? 0) + 1;
  const mods: ModEnergie[] = [...agregats.entries()]
    .map(([nom, parCout]) => ({
      nom,
      couts: [...parCout.values()]
        .map((a) => ({ cout: a.cout, emplacements: trierSlots(a.emplacements), categoriesPlug: [...a.categories].sort(), nbHashes: a.hashes.size, hashes: [...a.hashes].sort((x, y) => x - y) }))
        .sort((x, y) => (x.cout ?? 999) - (y.cout ?? 999)),
      divergent: parCout.size > 1
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  return { nbArmures: armures.length, nbAvecEnergie: lignes.filter((l) => l.capacite !== null).length, capacites, pieces: lignes, mods };
}

export function formaterDiagnosticEnergie(d: DiagnosticEnergie): string {
  const t: string[] = [];
  t.push("Diagnostic : coûts d'énergie des mods d'armure");
  if (d.nbArmures === 0) {
    t.push("Aucune armure chargée : chargez votre inventaire d'armures, puis relancez ce diagnostic.");
    return t.join("\n");
  }
  t.push(`Armures lues : ${d.nbArmures} | énergie lue sur l'exemplaire : ${d.nbAvecEnergie} | non lue : ${d.nbArmures - d.nbAvecEnergie}${d.nbArmures > d.nbAvecEnergie ? " (rechargez l'inventaire ; une énergie jamais lue peut signifier que le champ n'existe pas dans vos données)" : ""}`);
  const caps = Object.entries(d.capacites).sort((a, b) => Number(a[0]) - Number(b[0])).map(([c, n]) => `${c} → ${n} pièce${n > 1 ? "s" : ""}`);
  t.push(`Capacités d'énergie lues : ${caps.length > 0 ? caps.join(" ; ") : "aucune"}`);
  t.push("Règle appliquée : un plug sans coût dans le Manifest compte 0 (validée sur les données réelles).");
  t.push("");
  t.push("--- Pièces (écart = l'énergie utilisée annoncée par le jeu ≠ la somme des coûts lus) ---");
  for (const p of d.pieces) {
    const verdict = p.ecart === null ? "comparaison impossible" : p.ecart ? "ÉCART" : "OK";
    t.push(`[${p.slot}] ${p.nom} | ${p.classe} | ${p.lieu}${p.exotique ? " | exotique" : ""} | palier ${p.palier ?? "?"} | capacité ${p.capacite ?? "non lue"} | utilisée ${p.utilisee ?? "non lue"} | somme lue ${p.sommeLue ?? "aucun emplacement de mod"} | ${verdict}`);
    t.push(`    mods équipés : ${p.equipes.length > 0 ? p.equipes.map((e) => `${e.nom} (${e.cout ?? "sans coût"})`).join(" · ") : "aucun emplacement de mod lu"}`);
  }
  t.push("");
  t.push("--- Mods possibles (coût lu dans le Manifest, regroupés par nom) ---");
  for (const m of d.mods) {
    for (const c of m.couts) t.push(`${m.nom} | coût ${c.cout ?? "absent (compté 0)"} | ${c.emplacements.join(", ")} | catégorie « ${c.categoriesPlug.join(" ; ") || "?"} » | ${c.nbHashes} hash`);
  }
  t.push("");
  t.push("--- Points à vérifier ---");
  const ecarts = d.pieces.filter((p) => p.ecart === true);
  const verifiees = d.pieces.filter((p) => p.ecart !== null).length;
  const sansCout = d.mods.filter((m) => m.couts.some((c) => c.cout === null));
  const divergents = d.mods.filter((m) => m.divergent);
  const inhabituelles = d.pieces.filter((p) => p.capacite !== null && p.capacite !== 10 && p.capacite !== 11);
  t.push(`- Pièces comparées (énergie lue et emplacement de mod lu) : ${verifiees} sur ${d.nbArmures} ; pièces en écart : ${ecarts.length}${ecarts.length > 0 ? " → " + ecarts.map((p) => `${p.nom} (utilisée ${p.utilisee}, somme lue ${p.sommeLue})`).join(" ; ") : ""}`);
  t.push(`- Mods sans coût dans le Manifest (comptés 0) : ${sansCout.length}${sansCout.length > 0 ? " → " + sansCout.slice(0, 12).map((m) => m.nom).join(" ; ") + (sansCout.length > 12 ? " ; …" : "") : ""}`);
  t.push(`- Noms de mods dont le coût DIFFÈRE selon le mod ou l'emplacement : ${divergents.length}${divergents.length > 0 ? " → " + divergents.slice(0, 12).map((m) => `${m.nom} (${m.couts.map((c) => `${c.cout ?? "?"} : ${c.emplacements.join("/")}`).join(" ; ")})`).join(" ; ") + (divergents.length > 12 ? " ; …" : "") : ""} (voir le diagnostic « mods en double »)`);
  t.push(`- Pièces dont la capacité n'est ni 10 ni 11 : ${inhabituelles.length}${inhabituelles.length > 0 ? " → " + inhabituelles.map((p) => `${p.nom} (${p.capacite})`).join(" ; ") : ""}`);
  return t.join("\n");
}

export function diagnosticEnergieMods(db: Database, pieces: readonly GearPiece[]): string {
  return formaterDiagnosticEnergie(construireDiagnosticEnergie(db, pieces));
}

// =====================================================================================
// (B) LES MODS EN DOUBLE : même nom, plusieurs versions (hashes) de coûts différents
// =====================================================================================
export interface VersionMod {
  hash: number;
  cout: number | null;
  emplacements: string[];
  categoriePlug: string;
  /** FR : les listes de plugs du Manifest qui contiennent cette version (« jeu 8301 », « liste directe », « initial »…). / EN: the Manifest plug lists that contain this version. */
  listes: string[];
  /** FR : nombre de pièces du joueur qui ÉQUIPENT cette version. / EN: number of the player's pieces equipping this version. */
  nbEquipees: number;
  /** FR : nombre de pièces dont l'exemplaire propose cette version comme DISPONIBLE (composant 310). / EN: number of pieces whose instance lists this version as available. */
  nbDisponibles: number;
}
export interface NomEnDouble {
  nom: string;
  versions: VersionMod[];
  /** FR : chemins de la définition brute du Manifest qui diffèrent entre les versions, avec la valeur de chacune (dans l'ordre des versions). / EN: raw Manifest definition paths that differ between versions, with each version's value. */
  differences: Array<{ chemin: string; valeurs: string[] }>;
}
export interface DiagnosticDoublons {
  nbNomsDistincts: number;
  nbNomsMemeCout: number;
  noms: NomEnDouble[];
  /** FR : combien de noms en double ont chaque chemin différent (rangés par fréquence). / EN: how many duplicate names differ at each path. */
  frequences: Array<{ chemin: string; nb: number }>;
  nbUneSeuleEquipee: number;
  nbToutesEquipees: number;
  nbAucuneEquipee: number;
}

/** FR : aplatit une définition JSON en `chemin → valeur` (tableaux indexés), pour comparer deux versions champ par champ. / EN: flattens a JSON definition to `path → value`. */
function aplatir(valeur: unknown, chemin: string, sortie: Map<string, string>, profondeur = 0): void {
  if (profondeur > 7) { sortie.set(chemin, "…"); return; }
  if (Array.isArray(valeur)) {
    if (valeur.length === 0) sortie.set(chemin, "[]");
    valeur.forEach((v, i) => aplatir(v, `${chemin}[${i}]`, sortie, profondeur + 1));
    return;
  }
  if (valeur !== null && typeof valeur === "object") {
    const cles = Object.keys(valeur as object).sort();
    if (cles.length === 0) sortie.set(chemin, "{}");
    for (const k of cles) aplatir((valeur as Record<string, unknown>)[k], chemin ? `${chemin}.${k}` : k, sortie, profondeur + 1);
    return;
  }
  sortie.set(chemin, JSON.stringify(valeur) ?? "undefined");
}
const CHEMINS_IGNORES = new Set(["hash", "index"]);

/** FR : les listes de plugs d'un modèle d'armure : pour chaque plug, d'où il vient (jeu de plugs réutilisable ou aléatoire, liste directe, plug initial). / EN: for each plug of a model, which Manifest list it comes from. */
function listesDuModele(db: Database, itemHash: number): Map<number, Set<string>> {
  const sortie = new Map<number, Set<string>>();
  const ajouter = (hash: number, etiquette: string) => { let s = sortie.get(hash); if (!s) { s = new Set(); sortie.set(hash, s); } s.add(etiquette); };
  try {
    const def = obtenirDefinition<{ sockets?: { socketEntries?: Array<{ singleInitialItemHash?: number; reusablePlugItems?: Array<{ plugItemHash: number }>; reusablePlugSetHash?: number; randomizedPlugSetHash?: number }> } }>(db, "DestinyInventoryItemDefinition", itemHash);
    const jeu = (h: number) => obtenirDefinition<{ reusablePlugItems?: Array<{ plugItemHash: number }> }>(db, "DestinyPlugSetDefinition", h)?.reusablePlugItems ?? [];
    for (const e of def?.sockets?.socketEntries ?? []) {
      if (e.singleInitialItemHash) ajouter(e.singleInitialItemHash, "initial");
      for (const p of e.reusablePlugItems ?? []) ajouter(p.plugItemHash, "liste directe");
      if (e.reusablePlugSetHash) for (const p of jeu(e.reusablePlugSetHash)) ajouter(p.plugItemHash, `jeu ${e.reusablePlugSetHash}`);
      if (e.randomizedPlugSetHash) for (const p of jeu(e.randomizedPlugSetHash)) ajouter(p.plugItemHash, `jeu aléatoire ${e.randomizedPlugSetHash}`);
    }
  } catch { /* modèle illisible : aucune liste */ }
  return sortie;
}

export function construireDiagnosticDoublons(db: Database, pieces: readonly GearPiece[]): DiagnosticDoublons {
  const colonnesMods = fabriquerColonnesMods(db);
  const armures = pieces.filter((p) => ORDRE_SLOTS.includes(p.slot));
  const slotsParModele = new Map<number, Set<string>>();
  for (const p of armures) { let s = slotsParModele.get(p.itemHash); if (!s) { s = new Set(); slotsParModele.set(p.itemHash, s); } s.add(p.slot); }

  // FR : chaque version (hash) de chaque mod possible : son nom, ses emplacements, sa catégorie, ses listes.
  const infos = new Map<number, { nom: string; categorie: string; slots: Set<string>; listes: Set<string> }>();
  for (const [itemHash, slots] of slotsParModele) {
    const listes = listesDuModele(db, itemHash);
    for (const col of colonnesMods(itemHash)) {
      for (const o of col.options) {
        let i = infos.get(o.hash);
        if (!i) { i = { nom: o.nom, categorie: o.categoriePlug, slots: new Set(), listes: new Set() }; infos.set(o.hash, i); }
        for (const s of slots) i.slots.add(s);
        for (const l of listes.get(o.hash) ?? []) i.listes.add(l);
      }
    }
  }
  // FR : ce que le joueur équipe réellement, et ce que ses exemplaires proposent comme disponible.
  const equipes = new Map<number, number>();
  const disponibles = new Map<number, number>();
  for (const p of armures) {
    for (const x of p.perksParColonne ?? []) equipes.set(x.hash, (equipes.get(x.hash) ?? 0) + 1);
    for (const hs of Object.values(p.plugsDisponiblesParColonne ?? {})) for (const h of new Set(hs)) disponibles.set(h, (disponibles.get(h) ?? 0) + 1);
  }
  const parNom = new Map<string, number[]>();
  for (const [hash, i] of infos) { const l = parNom.get(i.nom) ?? []; l.push(hash); parNom.set(i.nom, l); }

  const noms: NomEnDouble[] = [];
  let memeCout = 0;
  for (const [nom, hashes] of parNom) {
    if (hashes.length < 2) continue;
    const couts = hashes.map((h) => lireCoutEnergie(db, h));
    if (new Set(couts).size < 2) { memeCout++; continue; }
    const versions: VersionMod[] = hashes
      .map((h) => ({ h, c: lireCoutEnergie(db, h) }))
      .sort((a, b) => (a.c ?? -1) - (b.c ?? -1) || a.h - b.h)
      .map(({ h, c }) => {
        const i = infos.get(h)!;
        return { hash: h, cout: c, emplacements: trierSlots(i.slots), categoriePlug: i.categorie, listes: [...i.listes].sort(), nbEquipees: equipes.get(h) ?? 0, nbDisponibles: disponibles.get(h) ?? 0 };
      });
    // FR : comparaison BRUTE des définitions du Manifest : les chemins dont la valeur n'est pas la même pour toutes les versions.
    const aplaties = versions.map((v) => { const m = new Map<string, string>(); try { aplatir(obtenirDefinition(db, "DestinyInventoryItemDefinition", v.hash), "", m); } catch { /* définition illisible */ } return m; });
    const chemins = new Set<string>(); for (const m of aplaties) for (const k of m.keys()) if (!CHEMINS_IGNORES.has(k)) chemins.add(k);
    const differences: NomEnDouble["differences"] = [];
    for (const chemin of [...chemins].sort()) {
      const valeurs = aplaties.map((m) => m.get(chemin) ?? "(absent)");
      if (new Set(valeurs).size > 1) differences.push({ chemin, valeurs });
    }
    noms.push({ nom, versions, differences });
  }
  noms.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const freq = new Map<string, number>();
  for (const n of noms) for (const d of n.differences) freq.set(d.chemin, (freq.get(d.chemin) ?? 0) + 1);
  const frequences = [...freq.entries()].map(([chemin, nb]) => ({ chemin, nb })).sort((a, b) => b.nb - a.nb || a.chemin.localeCompare(b.chemin));
  let une = 0, toutes = 0, aucune = 0;
  for (const n of noms) {
    const eq = n.versions.filter((v) => v.nbEquipees > 0).length;
    if (eq === 0) aucune++; else if (eq === n.versions.length) toutes++; else une++;
  }
  return { nbNomsDistincts: parNom.size, nbNomsMemeCout: memeCout, noms, frequences, nbUneSeuleEquipee: une, nbToutesEquipees: toutes, nbAucuneEquipee: aucune };
}

const court = (s: string, n = 46) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function formaterDiagnosticDoublons(d: DiagnosticDoublons, nbArmures = -1): string {
  const t: string[] = [];
  t.push("Diagnostic : mods en double (même nom, plusieurs versions de coûts différents)");
  if (nbArmures === 0) {
    t.push("Aucune armure chargée : chargez votre inventaire d'armures, puis relancez ce diagnostic.");
    return t.join("\n");
  }
  t.push(`Noms de mods distincts lus : ${d.nbNomsDistincts} | noms à plusieurs versions de coûts DIFFÉRENTS : ${d.noms.length} | noms à plusieurs versions de même coût (non détaillés) : ${d.nbNomsMemeCout}`);
  if (d.noms.length === 0) {
    t.push("Aucun nom de mod n'a plusieurs versions de coûts différents : rien à départager.");
    return t.join("\n");
  }
  t.push(`Versions équipées sur vos pièces, par nom : une seule version : ${d.nbUneSeuleEquipee} | toutes les versions : ${d.nbToutesEquipees} | aucune : ${d.nbAucuneEquipee}`);
  t.push("");
  t.push("--- Champs de la définition du Manifest qui diffèrent entre les versions (nombre de noms concernés) ---");
  for (const f of d.frequences.slice(0, 20)) t.push(`  ${f.chemin} : ${f.nb}`);
  if (d.frequences.length > 20) t.push(`  … et ${d.frequences.length - 20} autres chemins`);
  t.push("");
  t.push("--- Détail (un bloc par nom ; versions rangées par coût) ---");
  for (const n of d.noms) {
    t.push(n.nom);
    for (const v of n.versions) t.push(`  hash ${v.hash} | coût ${v.cout ?? "absent"} | ${v.emplacements.join(", ")} | catégorie « ${v.categoriePlug || "?"} » | listes : ${v.listes.join(" ; ") || "aucune"} | équipée sur ${v.nbEquipees} pièce${v.nbEquipees > 1 ? "s" : ""} | disponible sur ${v.nbDisponibles} exemplaire${v.nbDisponibles > 1 ? "s" : ""}`);
    const sansCout = n.differences.filter((x) => x.chemin !== "plug.energyCost.energyCost");
    t.push(`  différences : ${sansCout.length === 0 ? "aucune autre que le coût" : sansCout.slice(0, 8).map((x) => `${x.chemin} (${x.valeurs.map((v) => court(v)).join(" / ")})`).join(" ; ") + (sansCout.length > 8 ? ` ; … +${sansCout.length - 8}` : "")}`);
  }
  return t.join("\n");
}

export function diagnosticModsEnDouble(db: Database, pieces: readonly GearPiece[]): string {
  return formaterDiagnosticDoublons(construireDiagnosticDoublons(db, pieces), pieces.filter((p) => ORDRE_SLOTS.includes(p.slot)).length);
}
