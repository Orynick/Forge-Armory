// FR : \u26a0\ufe0f AJOUT (23/10/2026, branche vibe/draft-podcast-840f64) - g\u00e9n\u00e8re
// `public/podcast/index.json` depuis les fichiers MP3 pr\u00e9sents dans
// `public/podcast/`. Le lecteur flottant du Legendarium lit cet index UNE FOIS
// au d\u00e9marrage pour savoir quelles pages ont un enregistrement (lister un
// dossier est impossible c\u00f4t\u00e9 client). Convention de nommage verrouill\u00e9e
// (spec SPEC-PODCAST-ESSAI-2026-10-23.md \u00a72) :
//   - `lore-<hashLore>.mp3`      \u2192 page d'identifiant `lore:<hashLore>`
//   - `grimoire-<idCarte>.mp3`   \u2192 page d'identifiant `grimoire:<idCarte>`
// Le script est LOCAL : il ne publie rien. L'index g\u00e9n\u00e9r\u00e9 est ignor\u00e9 par
// git (les enregistrements personnels ne sont pas versionn\u00e9s).
// EN: generates `public/podcast/index.json` from the MP3 files present in
// `public/podcast/`. The Legendarium floating player reads this index ONCE at
// startup to know which pages have a recording (directory listing is impossible
// client-side). Locked naming convention (spec \u00a72):
//   - `lore-<hashLore>.mp3`      \u2192 page id `lore:<hashLore>`
//   - `grimoire-<idCarte>.mp3`   \u2192 page id `grimoire:<idCarte>`
// This script is LOCAL: it publishes nothing. The generated index is git-ignored
// (personal recordings are never committed).
import fs from "node:fs";
import path from "node:path";

const racine = process.cwd();
const dossier = path.join(racine, "public", "podcast");
const sortie = path.join(dossier, "index.json");

if (!fs.existsSync(dossier)) {
  console.error(`dossier introuvable : ${dossier}`);
  process.exit(1);
}

const PREFIXES = ["lore-", "grimoire-"];
const enregistrements = fs
  .readdirSync(dossier)
  .filter((f) => f.toLowerCase().endsWith(".mp3"))
  .map((f) => {
    const sansExt = f.slice(0, -4);
    const prefixe = PREFIXES.find((p) => sansExt.startsWith(p));
    if (!prefixe) return null; // hors convention : ignor\u00e9 (avec avertissement)
    const idPage = `${prefixe === "lore-" ? "lore" : "grimoire"}:${sansExt.slice(prefixe.length)}`;
    return { page: idPage, fichier: f };
  })
  .filter(Boolean)
  .sort((a, b) => (a.page < b.page ? -1 : a.page > b.page ? 1 : 0));

const horsConvention = fs
  .readdirSync(dossier)
  .filter((f) => f.toLowerCase().endsWith(".mp3") && !PREFIXES.some((p) => f.slice(0, -4).startsWith(p)));

fs.writeFileSync(
  sortie,
  JSON.stringify({ version: 1, genereLe: new Date().toISOString(), enregistrements }, null, 2) + "\n",
  "utf-8"
);

console.log(`${enregistrements.length} enregistrement(s) index\u00e9(s) dans ${path.relative(racine, sortie)}`);
for (const e of enregistrements) console.log(`  \u2022 ${e.page}  \u2190  ${e.fichier}`);
if (horsConvention.length > 0) {
  console.warn(`\u26a0\ufe0f ${horsConvention.length} fichier(s) MP3 HORS CONVENTION (ignor\u00e9s) : ${horsConvention.join(", ")}`);
  console.warn("   convention : lore-<hashLore>.mp3 ou grimoire-<idCarte>.mp3 (voir public/podcast/README.md)");
}
