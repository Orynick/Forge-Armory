#!/usr/bin/env node
// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - RÉGÉNÈRE `src/data/source-filters.json` depuis les données publiques de d2-additional-info (Destiny Item Manager, licence MIT : https://github.com/DestinyItemManager/d2-additional-info), sans jamais modifier l'original.
//     node data/rebuild-source-filters.ts            télécharge output/source-info-v2.ts (GitHub) et réécrit src/data/source-filters.json
//     node data/rebuild-source-filters.ts --check     ne modifie RIEN ; code de sortie 1 si le fichier généré diffère de celui du dépôt (à brancher sur l'alerte de péremption du Manifest : une seule passe de vérification couvre les deux)
// Le fichier généré porte le champ `_licence` (crédit MIT obligatoire) et le `_source` exact (commit implicite : l'URL). Les 13 CATÉGORIES et les ACTIVITÉS sont déclarées ci-dessous : elles stables, seules leurs listes de hashes suivent les données amont.
// EN: ⚠️ ADDED - regenerates src/data/source-filters.json from d2-additional-info (MIT); --check exits 1 when the shipped file is stale.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const URL_SOURCE = "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/output/source-info-v2.ts";
const CIBLE = path.resolve(process.cwd(), "src/data/source-filters.json");
const verifier = process.argv.includes("--check");

// FR : les 13 catégories génériques de la feuille de route, chacune mappée aux groupes (sourceName) de d2-additional-info dont elle regroupe les hashes. / EN: the 13 generic categories, mapped to upstream sourceName groups.
const CATEGORIES: Record<string, { libelle_fr: string; libelle_en: string; groupes: string[] }> = {
  "raid": { libelle_fr: "Raid", libelle_en: "Raid", groupes: ["raid"] },
  "dungeon": { libelle_fr: "Donjon", libelle_en: "Dungeon", groupes: ["dungeon"] },
  "trials": { libelle_fr: "Trials d'Osiris", libelle_en: "Trials of Osiris", groupes: ["trials"] },
  "iron-banner": { libelle_fr: "Bannière de Fer", libelle_en: "Iron Banner", groupes: ["ironbanner"] },
  "crucible": { libelle_fr: "Crucible", libelle_en: "Crucible", groupes: ["crucible"] },
  "gambit": { libelle_fr: "Gambit", libelle_en: "Gambit", groupes: ["gambit", "gambitprime"] },
  "nightfall": { libelle_fr: "Nuit Noire / GM", libelle_en: "Nightfall / GM", groupes: ["nightfall"] },   // FR : ⚠️ libellé corrigé par l'utilisateur le 19/10/2026.
  "campaign": { libelle_fr: "Campagne", libelle_en: "Campaign", groupes: ["campaign"] },
  "exotic-quest": { libelle_fr: "Quête exotique", libelle_en: "Exotic quest", groupes: ["exoticquest"] },
  "eververse": { libelle_fr: "Eververse", libelle_en: "Eververse", groupes: ["eververse"] },
  "event": { libelle_fr: "Événement", libelle_en: "Event", groupes: ["events"] },
  "season-pass": { libelle_fr: "Passe de saison", libelle_en: "Season pass", groupes: ["seasonpass"] },
  "vendor": { libelle_fr: "Marchand", libelle_en: "Vendor", groupes: ["gunsmith", "rahool", "shipwright"] },
};

// FR : une entrée par raid et donjon : le filtre `source:<activité>` sort toutes les armes et armures de CETTE activité. Les noms français sont de l'appli (données Bungie) ; les clés et groupes viennent de l'amont. / EN: one entry per raid and dungeon.
const ACTIVITES: Record<string, { fr: string; en: string; groupes: string[]; genre: "raid" | "donjon" }> = {
  // FR : ⚠️ ORDRE et GENRE fixés par l'utilisateur le 19/10/2026 (demande : « remplace "Activité ·" par "Raid ·" / "Donjon ·" et dans cet ordre ») ; libellés français corrigés par la même demande (« Coffre des âges » → « Caveau de Verre », « Crypte de la Pierre-Profonde » → « Crypte de la Pierre Enfouie », etc.). L'ordre d'insertion de cet objet EST l'ordre du menu. / EN: order and kind fixed by the user; this object's insertion order IS the menu order.
  "vault-of-glass": { fr: "Caveau de Verre", en: "Vault of Glass", groupes: ["vaultofglass"], genre: "raid" },
  "crotas-end": { fr: "La Fin de Crota", en: "Crota's End", groupes: ["crotasend"], genre: "raid" },
  "kings-fall": { fr: "La Chute du Roi", en: "King's Fall", groupes: ["kingsfall"], genre: "raid" },
  "leviathan": { fr: "Léviathan", en: "Leviathan", groupes: ["leviathan"], genre: "raid" },
  "eater-of-worlds": { fr: "Dévoreur de Mondes", en: "Eater of Worlds", groupes: ["eow"], genre: "raid" },
  "spire-of-stars": { fr: "Flèche d'Étoiles", en: "Spire of Stars", groupes: ["spireofstars"], genre: "raid" },
  "scourge-of-the-past": { fr: "Fléau du Passé", en: "Scourge of the Past", groupes: ["scourgeofthepast"], genre: "raid" },
  "last-wish": { fr: "Dernier Vœu", en: "Last Wish", groupes: ["lastwish"], genre: "raid" },
  "crown-of-sorrow": { fr: "Couronne du Chagrin", en: "Crown of Sorrow", groupes: ["crownofsorrow"], genre: "raid" },
  "deep-stone-crypt": { fr: "Crypte de la Pierre Enfouie", en: "Deep Stone Crypt", groupes: ["deepstonecrypt"], genre: "raid" },
  "garden-of-salvation": { fr: "Jardin du Salut", en: "Garden of Salvation", groupes: ["gardenofsalvation"], genre: "raid" },
  "vow-of-the-disciple": { fr: "Serment du Disciple", en: "Vow of the Disciple", groupes: ["vowofthedisciple"], genre: "raid" },
  "root-of-nightmares": { fr: "Racine des Cauchemars", en: "Root of Nightmares", groupes: ["rootofnightmares"], genre: "raid" },
  "salvations-edge": { fr: "Orée du Salut", en: "Salvation's Edge", groupes: ["salvationsedge"], genre: "raid" },
  "shattered-throne": { fr: "Trône Brisé", en: "Shattered Throne", groupes: ["shatteredthrone"], genre: "donjon" },
  "pit-of-heresy": { fr: "Fosse de l'Hérésie", en: "Pit of Heresy", groupes: ["pit"], genre: "donjon" },
  "prophecy": { fr: "Prophétie", en: "Prophecy", groupes: ["prophecy"], genre: "donjon" },
  "grasp-of-avarice": { fr: "Étreinte de l'Avarice", en: "Grasp of Avarice", groupes: ["grasp"], genre: "donjon" },
  "duality": { fr: "Dualité", en: "Duality", groupes: ["duality"], genre: "donjon" },
  "spire-of-the-watcher": { fr: "Flèche de la Vigie", en: "Spire of the Watcher", groupes: ["spireofthewatcher"], genre: "donjon" },
  "ghosts-of-the-deep": { fr: "Fantômes des Profondeurs", en: "Ghosts of the Deep", groupes: ["ghostsofthedeep"], genre: "donjon" },
  "warlords-ruin": { fr: "Ruine de la Guerrière", en: "Warlord's Ruin", groupes: ["warlordsruin"], genre: "donjon" },
  "vespers-host": { fr: "Hôte Vesper", en: "Vesper's Host", groupes: ["vespershost"], genre: "donjon" },
  "sundered-doctrine": { fr: "Dogme Fragmenté", en: "Sundered Doctrine", groupes: ["sundereddoctrine"], genre: "donjon" },
  "equilibrium": { fr: "Équilibre", en: "Equilibrium", groupes: ["equilibrium"], genre: "donjon" },
};
/** FR : télécharge le fichier amont (réseau une seule fois, ici seulement : l'appli n'appelle JAMAIS ce script). / EN: fetches the upstream file. */
function telecharger(): string {
  // FR : curl est interdit dans l'environnement de travail : on passe par gh (authentifié, même dépôt public).
  const r = spawnSync("gh", ["api", "repos/DestinyItemManager/d2-additional-info/contents/output/source-info-v2.ts", "--jq", ".content"], { encoding: "utf-8" });
  if (r.status !== 0 || !r.stdout) throw new Error("téléchargement impossible : " + (r.stderr || r.stdout));
  return Buffer.from(r.stdout, "base64").toString("utf-8");
}

/** FR : ⚠️ CHANGÉ (19/10/2026, 3e retour de test) - parse les DEUX listes de chaque bloc : `sourceHashes` (ceux du collectible de l'objet, le chemin principal de la jointure DIM) et `itemHashes` (les objets listés directement). L'ancien parseur lisait un flux unique et produisait des `itemSourceHashes` (que Bungie ne peuple pratiquement jamais : le filtre ne matchait rien). / EN: parses BOTH lists of each block: sourceHashes (the item's collectible) and itemHashes (directly listed items). */
function parserContenu(s: string): Map<string, { sourceHashes: number[]; itemHashes: number[] }> {
  const groupes = new Map<string, { sourceHashes: number[]; itemHashes: number[] }>();
  let courant: string | null = null;
  let section: "sourceHashes" | "itemHashes" | null = null;
  for (const ligne of s.split("\n")) {
    const mEntete = /^  '?([a-z0-9-]+)'?: \{$/.exec(ligne);
    if (mEntete) { courant = mEntete[1]; groupes.set(courant, { sourceHashes: [], itemHashes: [] }); section = null; continue; }
    if (courant) {
      if (/^\s+sourceHashes: \[$/.test(ligne)) { section = "sourceHashes"; continue; }
      if (/^\s+itemHashes: \[$/.test(ligne)) { section = "itemHashes"; continue; }
      if (/^\s+\],?$/.test(ligne)) { section = null; continue; }
      if (section) {
        const mHash = /^\s+(\d+),/.exec(ligne);
        if (mHash) groupes.get(courant)![section].push(Number(mHash[1]));
      }
      if (/^  \},?$/.test(ligne)) { courant = null; section = null; }
    }
  }
  return groupes;
}

function generer(contenu: string): string {
  const groupes = parserContenu(contenu);
  const collecter = (noms: string[], champ: "sourceHashes" | "itemHashes"): number[] => [...new Set(noms.flatMap((n) => groupes.get(n)?.[champ] ?? []))].sort((a, b) => a - b);
  const sortie: Record<string, unknown> = {
    _licence: "Données dérivées de d2-additional-info (Destiny Item Manager, licence MIT) : https://github.com/DestinyItemManager/d2-additional-info",
    _source: "output/source-info-v2.ts",
    _genere: "data/rebuild-source-filters.ts",
    categories: Object.fromEntries(Object.entries(CATEGORIES).map(([cle, c]) => [cle, { libelle_fr: c.libelle_fr, libelle_en: c.libelle_en, sourceHashes: collecter(c.groupes, "sourceHashes"), itemHashes: collecter(c.groupes, "itemHashes") }])),
    activities: Object.fromEntries(Object.entries(ACTIVITES).filter(([, a]) => collecter(a.groupes, "sourceHashes").length + collecter(a.groupes, "itemHashes").length > 0).map(([cle, a]) => [cle, { libelle_fr: a.fr, libelle_en: a.en, sourceHashes: collecter(a.groupes, "sourceHashes"), itemHashes: collecter(a.groupes, "itemHashes"), genre: a.genre }])),
  };
  return JSON.stringify(sortie, null, 1) + "\n";
}

try {
  const contenu = telecharger();
  const nouveau = generer(contenu);
  if (verifier) {
    const actuel = fs.readFileSync(CIBLE, "utf-8");
    if (actuel.trim() !== nouveau.trim()) { console.error("❌ src/data/source-filters.json est PÉRIMÉ par rapport à d2-additional-info — relancez node data/rebuild-source-filters.ts"); process.exit(1); }
    console.log("✅ src/data/source-filters.json est à jour (d2-additional-info).");
  } else {
    fs.writeFileSync(CIBLE, nouveau);
    const parsed = JSON.parse(fs.readFileSync(CIBLE, "utf-8"));
    console.log(`✅ régénéré : ${Object.keys(parsed.categories).length} catégories, ${Object.keys(parsed.activities).length} activités.`);
  }
} catch (e) {
  console.error("❌ " + (e as Error).message);
  process.exit(1);
}
