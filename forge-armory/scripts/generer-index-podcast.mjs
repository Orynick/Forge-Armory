// FR : ⚠️ AJOUT (23/10/2026, branche vibe/draft-podcast-840f64) - génère
// `public/podcast/index.json` depuis les fichiers MP3 présents dans
// `public/podcast/`. Le lecteur flottant du Legendarium lit cet index UNE FOIS
// au démarrage pour savoir quelles pages ont un enregistrement (lister un
// dossier est impossible côté client). Convention de nommage verrouillée
// (spec SPEC-PODCAST-ESSAI-2026-10-23.md §2) :
//   - `lore-<hashLore>.mp3`      → page d'identifiant `lore:<hashLore>`
//   - `grimoire-<idCarte>.mp3`   → page d'identifiant `grimoire:<idCarte>`
// Le script est LOCAL : il ne publie rien. L'index généré est ignoré par
// git (les enregistrements personnels ne sont pas versionnés).
// ⚠️ CHANGÉ (23/10/2026, suite) : la logique est exportée (`genererIndex`) pour
// être RÉUTILISÉE par `scripts/associer-podcast.mjs` (qui régénère l'index après
// avoir renommé des MP3). Le script ne s'exécute que s'il est lancé directement.
// EN: generates `public/podcast/index.json` from the MP3 files present in
// `public/podcast/`. The Legendarium floating player reads this index ONCE at
// startup to know which pages have a recording (directory listing is impossible
// client-side). Locked naming convention (spec §2):
//   - `lore-<hashLore>.mp3`      → page id `lore:<hashLore>`
//   - `grimoire-<idCarte>.mp3`   → page id `grimoire:<idCarte>`
// This script is LOCAL: it publishes nothing. The generated index is git-ignored
// (personal recordings are never committed).
// CHANGED (draft-podcast, follow-up): the logic is EXPORTED (`genererIndex`) for
// reuse by `scripts/associer-podcast.mjs` (which regenerates the index after
// renaming MP3s). The script only runs when launched directly.
import fs from "node:fs";
import path from "node:path";

const PREFIXES = ["lore-", "grimoire-"];

/** FR : nom de fichier attendu pour un identifiant de page, selon la convention verrouillée (`lore:<hash>` → `lore-<hash>.mp3`). Renvoie null si l'identifiant n'a pas la forme attendue. / EN: expected file name for a page id, per the locked convention (`lore:<hash>` → `lore-<hash>.mp3`). Returns null if the id has not the expected shape. */
export function nomCiblePourPage(idPage) {
  const m = /^(lore|grimoire):(.+)$/.exec(idPage);
  if (!m) return null;
  return `${m[1]}-${m[2]}.mp3`;
}

/** FR : inverse : identifiant de page pour un NOM de fichier (sans extension). Renvoie null si le nom n'est pas conforme. / EN: inverse: page id for a FILE NAME (without extension). Returns null if the name is not compliant. */
export function idPagePourNom(sansExtension) {
  const prefixe = PREFIXES.find((p) => sansExtension.startsWith(p));
  if (!prefixe) return null;
  return `${prefixe === "lore-" ? "lore" : "grimoire"}:${sansExtension.slice(prefixe.length)}`;
}

/** FR : génère (écrit) `index.json` dans `dossier` depuis les MP3 présents. Renvoie `{ nb, horsConvention, enregistrements }`. / EN: generates (writes) `index.json` in `dossier` from the MP3s present. Returns `{ nb, horsConvention, enregistrements }`. */
export function genererIndex(dossier) {
  if (!fs.existsSync(dossier)) {
    throw new Error(`dossier introuvable : ${dossier}`);
  }
  const fichiers = fs.readdirSync(dossier);
  const enregistrements = [];
  const horsConvention = [];
  for (const f of fichiers) {
    if (!f.toLowerCase().endsWith(".mp3")) continue;
    const idPage = idPagePourNom(f.slice(0, -4));
    if (!idPage) {
      horsConvention.push(f);
      continue;
    }
    enregistrements.push({ page: idPage, fichier: f });
  }
  enregistrements.sort((a, b) => (a.page < b.page ? -1 : a.page > b.page ? 1 : 0));
  const index = { version: 1, genereLe: new Date().toISOString(), enregistrements };
  fs.writeFileSync(path.join(dossier, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf-8");
  return { nb: enregistrements.length, horsConvention, enregistrements };
}

// FR : exécution directe uniquement (`node scripts/generer-index-podcast.mjs`) — pas à l'import par un autre script. / EN: direct execution only (`node scripts/generer-index-podcast.mjs`) — not on import by another script.
// FR : ⚠️ le script ne s'exécute QUE lorsqu'on le lance lui-même (son NOM est
// celui du fichier lancé — même garde que `generer-logos-export.mjs`, qui a déjà
// évité qu'un test empaqueté ne le déclenche sans le vouloir). Dans un bundle
// de test esbuild, les modules sont fusionnés : le nom du fichier lancé est
// celui du TEST, pas du script → la garde est fausse → rien ne s'exécute.
// EN: the script only runs when launched directly (its NAME is the launched
// file's name — same guard as `generer-logos-export.mjs`).
export const LANCE_DIRECTEMENT = path.basename(process.argv[1] ?? "") === "generer-index-podcast.mjs";
if (LANCE_DIRECTEMENT) {
  const racine = process.cwd();
  const dossier = path.join(racine, "public", "podcast");
  const { nb, horsConvention, enregistrements } = genererIndex(dossier);
  console.log(`${nb} enregistrement(s) indexé(s) dans ${path.relative(racine, path.join(dossier, "index.json"))}`);
  for (const e of enregistrements) console.log(`  • ${e.page}  ←  ${e.fichier}`);
  if (horsConvention.length > 0) {
    console.warn(`\n⚠️ ${horsConvention.length} fichier(s) MP3 HORS CONVENTION (ignorés) : ${horsConvention.join(", ")}`);
    console.warn("   convention : lore-<hashLore>.mp3 ou grimoire-<idCarte>.mp3 (voir public/podcast/README.md)");
  }
}
