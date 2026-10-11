// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - CONTRÔLE de l'anti-champion déduit par
// l'appli pour les ARMES EXOTIQUES, comparé à la liste de référence fournie par
// l'utilisateur (data/exotiquesAntiChampion.ts). Demande de l'utilisateur :
// « la déduction d'abord » - voir où la déduction actuelle se trompe AVANT
// d'ajouter une table de secours (TODO, section 2 ter).
//
// Principe : pour chaque exotique de la liste, on retrouve dans le Manifest
// TOUTES les armes exotiques de même nom (il peut y avoir plusieurs versions :
// rééditions...), on appelle la DÉDUCTION d'origine de l'appli (`deduireAntiChampion`)
// sur chacune, et on compare. Rien n'est modifié : outil de lecture seule.
// ⚠️ CHANGÉ (01/10/2026) : l'appli utilise désormais la LISTE comme référence pour les
// exotiques ; cet outil ne sert plus qu'à (1) repérer les NOMS de la liste qui ne
// correspondent à aucune arme du jeu (« absents du Manifest » : l'appli retombe alors sur
// la déduction), et (2) juger la qualité de la déduction de repli.
//
// Deux parties : une comparaison PURE (`comparerAntiChampion`, testable sans
// Manifest) et la lecture du Manifest (`lireExotiquesDuManifest`).
// EN: ⚠️ ADDED - CHECKS the app's deduced anti-champion for EXOTIC WEAPONS against
// the user's reference list. Read-only. Pure comparison + Manifest reading.

import type { Database } from "sql.js";
import type { TypeChampion } from "../../components/icones/IconeAntiChampion";
import type { ReferenceExotique } from "../../data/exotiquesAntiChampion";
import { normaliserNomArme } from "../manifest/antiChampionExotiques";

/** FR : une arme exotique du Manifest. / EN: an exotic weapon from the Manifest. */
export interface ExotiqueManifest {
  hash: number;
  nom: string;
}

export type Verdict =
  | "accord"
  | "accord-sans-champion"
  | "desaccord"
  | "non-detecte"
  | "detecte-en-trop"
  | "versions-divergentes"
  | "absent-du-manifest";

export interface LigneControle {
  reference: ReferenceExotique;
  /** FR : chaque version trouvée dans le Manifest et ce que l'appli en déduit. / EN: each Manifest version and its deduction. */
  versions: { hash: number; deduit: TypeChampion | undefined }[];
  verdict: Verdict;
}

/**
 * FR : ⚠️ AJOUT (05/10/2026) - une AUTRE définition du Manifest portant le nom d'une arme de la liste, sans être l'exotique équipable lue par
 * `lireExotiquesDuManifest` (ancienne version, objet factice, ornement...). Signalé par l'utilisateur : en Recherche, « Tueur de Souhaits » affichait
 * l'image du Lapin de Jade, « Dualité » (un fusil à pompe) l'icône d'un fusil automatique, et « Le Lapin de Jade » aucune icône d'anti-champion.
 * EN: ⚠️ ADDED - another Manifest definition carrying a listed weapon's name without being the equippable exotic.
 */
export interface DoublonNom {
  nomListe: string;
  hash: number;
  itemType?: number;
  tierType?: number;
  equippable?: boolean;
  redacted?: boolean;
  typeAffiche: string;
  sousType?: number;
  categories: number[];
  seau?: number;
  icone?: string;
}

export interface RapportControle {
  lignes: LigneControle[];
  /** FR : ⚠️ AJOUT (05/10/2026) - autres définitions de même nom que des armes de la liste (absent si la lecture n'a pas été faite). / EN: other same-name definitions. */
  doublons?: DoublonNom[];
  /** FR : exotiques du Manifest dont le nom n'est PAS dans la liste (nom différent, ou arme absente de la liste). / EN: Manifest exotics not in the list. */
  horsListe: { hash: number; nom: string; deduit: TypeChampion | undefined }[];
}

// FR : ⚠️ CHANGÉ (01/10/2026) - la normalisation des noms vit désormais dans
// lib/manifest/antiChampionExotiques.ts (partagée avec l'appli) ; ré-exportée ici pour les
// tests existants. EN: normalisation now lives in antiChampionExotiques.ts, re-exported here.
export { normaliserNomArme };

/** FR : comparaison PURE. `deduire` = la fonction de l'appli (ou un substitut en test). / EN: PURE comparison. */
export function comparerAntiChampion(
  reference: ReferenceExotique[],
  exotiques: ExotiqueManifest[],
  deduire: (hash: number) => TypeChampion | undefined
): RapportControle {
  const parNom = new Map<string, ExotiqueManifest[]>();
  for (const e of exotiques) {
    const cle = normaliserNomArme(e.nom);
    parNom.set(cle, [...(parNom.get(cle) ?? []), e]);
  }
  const nomsReference = new Set(reference.map((r) => normaliserNomArme(r.nom)));

  const lignes: LigneControle[] = reference.map((ref) => {
    const trouves = parNom.get(normaliserNomArme(ref.nom)) ?? [];
    const versions = trouves.map((e) => ({ hash: e.hash, deduit: deduire(e.hash) }));
    let verdict: Verdict;
    if (versions.length === 0) verdict = "absent-du-manifest";
    else if (ref.champion === null) verdict = versions.every((v) => v.deduit === undefined) ? "accord-sans-champion" : "detecte-en-trop";
    else if (versions.every((v) => v.deduit === ref.champion)) verdict = "accord";
    else if (versions.every((v) => v.deduit === undefined)) verdict = "non-detecte";
    else if (versions.some((v) => v.deduit === ref.champion)) verdict = "versions-divergentes";
    else verdict = "desaccord";
    return { reference: ref, versions, verdict };
  });

  const horsListe = exotiques
    .filter((e) => !nomsReference.has(normaliserNomArme(e.nom)))
    .map((e) => ({ hash: e.hash, nom: e.nom, deduit: deduire(e.hash) }));
  return { lignes, horsListe };
}

/**
 * FR : lit dans le Manifest toutes les ARMES EXOTIQUES équipables (itemType 3 =
 * arme, tierType 6 = exotique). Un premier tri sur le texte JSON évite de lire
 * les dizaines de milliers d'objets ; le tri exact se fait ensuite sur l'objet lu.
 * EN: reads every equippable EXOTIC WEAPON from the Manifest.
 */
export function lireExotiquesDuManifest(db: Database): ExotiqueManifest[] {
  const resultat: ExotiqueManifest[] = [];
  const requete = db.prepare(
    `SELECT json FROM DestinyInventoryItemDefinition WHERE json LIKE '%"tierType":6%' AND json LIKE '%"itemType":3%'`
  );
  try {
    while (requete.step()) {
      const def = JSON.parse(requete.getAsObject().json as string) as {
        hash?: number;
        itemType?: number;
        equippable?: boolean;
        redacted?: boolean;
        inventory?: { tierType?: number };
        displayProperties?: { name?: string };
      };
      if (def.itemType !== 3 || def.inventory?.tierType !== 6 || !def.equippable || def.redacted) continue;
      const nom = def.displayProperties?.name?.trim();
      if (def.hash === undefined || !nom) continue;
      resultat.push({ hash: def.hash, nom });
    }
  } finally {
    requete.free();
  }
  // FR : garde-fou : le préfiltre suppose un JSON compact (`"tierType":6`, comme la
  // requête existante sur `"visible":true` dans doctrine.ts). S'il ne trouve
  // RIEN, mieux vaut le dire que produire un rapport trompeur (« 143 absents »).
  // EN: safeguard: nothing found means the pre-filter's assumption failed.
  if (resultat.length === 0) {
    throw new Error("aucune arme exotique trouvée dans le Manifest : le préfiltre de la recherche ne correspond pas au format du Manifest (à signaler à Claude).");
  }
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (05/10/2026) - lit, en UN passage sur la table des objets, toutes les définitions qui portent le nom d'une arme de la liste et qui ne
 * sont PAS déjà dans l'ensemble des exotiques équipables (`hashesExotiques`). Lecture seule, quelques secondes : à lancer à la demande.
 * EN: ⚠️ ADDED - ONE pass over the item table: every definition named like a listed weapon that is not in the equippable-exotic set.
 */
export function lireDoublonsDeNom(db: Database, nomsListe: readonly string[], hashesExotiques: ReadonlySet<number>): DoublonNom[] {
  const parCle = new Map<string, string>();
  for (const n of nomsListe) parCle.set(normaliserNomArme(n), n);
  const sortie: DoublonNom[] = [];
  const requete = db.prepare("SELECT json FROM DestinyInventoryItemDefinition");
  try {
    while (requete.step()) {
      let def: {
        hash?: number;
        itemType?: number;
        equippable?: boolean;
        redacted?: boolean;
        itemSubType?: number;
        itemTypeDisplayName?: string;
        itemCategoryHashes?: number[];
        inventory?: { tierType?: number; bucketTypeHash?: number };
        displayProperties?: { name?: string; icon?: string };
      };
      try {
        def = JSON.parse(requete.getAsObject().json as string);
      } catch {
        continue; // FR : ligne illisible : ignorée / EN: unreadable row: ignored
      }
      const nom = def.displayProperties?.name;
      if (!nom || def.hash === undefined || hashesExotiques.has(def.hash)) continue;
      const nomListe = parCle.get(normaliserNomArme(nom));
      if (!nomListe) continue;
      sortie.push({
        nomListe,
        hash: def.hash,
        itemType: def.itemType,
        tierType: def.inventory?.tierType,
        equippable: def.equippable,
        redacted: def.redacted,
        typeAffiche: def.itemTypeDisplayName ?? "",
        sousType: def.itemSubType,
        categories: def.itemCategoryHashes ?? [],
        seau: def.inventory?.bucketTypeHash,
        icone: def.displayProperties?.icon,
      });
    }
  } finally {
    requete.free();
  }
  return sortie.sort((a, b) => a.nomListe.localeCompare(b.nomListe, "fr") || a.hash - b.hash);
}

const LIBELLE_CHAMPION: Record<TypeChampion, string> = { surcharge: "Surchargé", implacable: "Implacable", bloqueur: "Bloqueur" };
const libelle = (c: TypeChampion | null | undefined) => (c ? LIBELLE_CHAMPION[c] : "—");

const SECTIONS: { verdict: Verdict; titre: string; explication: string }[] = [
  { verdict: "desaccord", titre: "Désaccords", explication: "l'appli déduit un AUTRE type que la liste" },
  { verdict: "non-detecte", titre: "Non détectés", explication: "la liste indique un type, l'appli ne trouve rien" },
  { verdict: "versions-divergentes", titre: "Versions divergentes", explication: "plusieurs versions de l'arme dans le Manifest, déductions différentes" },
  { verdict: "detecte-en-trop", titre: "Détectés en trop", explication: "la liste n'indique pas de type, l'appli en déduit un" },
  { verdict: "absent-du-manifest", titre: "Absents du Manifest", explication: "nom introuvable tel quel (orthographe différente, ou arme absente du Manifest français)" },
  { verdict: "accord", titre: "Accords", explication: "même type des deux côtés" },
  { verdict: "accord-sans-champion", titre: "Accords sans champion", explication: "aucun type des deux côtés" },
];

/** FR : rapport lisible (Markdown), à télécharger et à envoyer à Claude. / EN: readable report (Markdown). */
export function rapportEnMarkdown(rapport: RapportControle, version: string, date: string): string {
  const compte = (v: Verdict) => rapport.lignes.filter((l) => l.verdict === v).length;
  const md: string[] = [
    "# Contrôle de l'anti-champion des armes exotiques",
    "",
    `Forge Armory v${version} — ${date}. Déduction de REPLI de l'appli (\`deduireAntiChampion\`, utilisée seulement pour une exotique absente de la liste) comparée à la liste de référence (knowledge-base/28), que l'appli utilise en priorité.`,
    "",
    "| Résultat | Nombre |",
    "|---|---|",
    ...SECTIONS.map((s) => `| ${s.titre} (${s.explication}) | ${compte(s.verdict)} |`),
    `| Exotiques du Manifest absentes de la liste | ${rapport.horsListe.length} |`,
    "",
  ];
  for (const s of SECTIONS) {
    const lignes = rapport.lignes.filter((l) => l.verdict === s.verdict);
    if (lignes.length === 0) continue;
    md.push(`## ${s.titre} (${lignes.length})`, "", `_${s.explication}_`, "", "| Arme | Emplacement | Liste | Appli (par version : hash → déduit) |", "|---|---|---|---|");
    for (const l of lignes) {
      const versions = l.versions.length ? l.versions.map((v) => `${v.hash} → ${libelle(v.deduit)}`).join(" ; ") : "—";
      md.push(`| ${l.reference.nom} | ${l.reference.emplacement} | ${libelle(l.reference.champion)} | ${versions} |`);
    }
    md.push("");
  }
  if (rapport.doublons) {
    const d = rapport.doublons;
    const noms = new Set(d.map((x) => x.nomListe));
    md.push(
      `## Autres définitions de même nom que des armes de la liste (${d.length}, pour ${noms.size} armes)`,
      "",
      "_utile pour comprendre pourquoi la Recherche ou l'Inventaire affiche parfois un AUTRE objet que l'exotique attendu : ancienne version, objet factice, ornement…_",
      ""
    );
    if (d.length === 0) md.push("(aucune)", "");
    else {
      md.push("| Nom (liste) | Objet | Type d'objet | Rareté | Équipable | Type affiché | Sous-type | Seau | Catégories | Icône |", "|---|---|---|---|---|---|---|---|---|---|");
      const v = (x: unknown) => (x === undefined || x === null || x === "" ? "—" : String(x));
      for (const x of d) {
        md.push(`| ${x.nomListe} | ${x.hash} | ${v(x.itemType)} | ${v(x.tierType)} | ${v(x.equippable)}${x.redacted ? " (masqué)" : ""} | ${v(x.typeAffiche)} | ${v(x.sousType)} | ${v(x.seau)} | ${x.categories.length ? x.categories.join(", ") : "—"} | ${v(x.icone)} |`);
      }
      md.push("");
    }
  }
  if (rapport.horsListe.length) {
    md.push(`## Exotiques du Manifest absentes de la liste (${rapport.horsListe.length})`, "", "_utile pour repérer un nom écrit différemment dans la liste_", "", "| Nom dans le jeu | Hash | Appli |", "|---|---|---|");
    for (const h of [...rapport.horsListe].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))) md.push(`| ${h.nom} | ${h.hash} | ${libelle(h.deduit)} |`);
    md.push("");
  }
  return md.join("\n");
}
