// FR : LANCEUR de TOUTE la batterie de logique : rejoue les 30 suites de
// `tests/logique/` une par une via `tests/logique/lancer.mjs` (esbuild +
// Node, comme en local) et résume. Code de sortie 0 si TOUT passe, 1 sinon.
// Utilisé par `npm run test:logique` en local ET par la CI (GitHub Actions,
// `.github/workflows/ci.yml`). Le dossier de sortie temporaire
// (`tests/logique/_sortie/`) est nettoyé à la fin.
// EN: runs the whole logic battery (every suite in tests/logique/), one by
// one, through tests/logique/lancer.mjs. Exit 0 only if every suite passes.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const racine = process.cwd();
const dossier = path.join(racine, "tests/logique");
const suites = fs.readdirSync(dossier).filter((f) => /\.test\.tsx?$/.test(f)).sort();

let echecs = 0;
let totalControles = 0;
let totalReussis = 0;
for (const suite of suites) {
  const r = spawnSync("node", ["tests/logique/lancer.mjs", suite], { cwd: racine, encoding: "utf-8" });
  const lignes = (r.stdout ?? "").split("\n").filter(Boolean);
  const bilan = lignes[lignes.length - 1] ?? "";
  const m = /^(\d+)\/(\d+) contr/.exec(bilan);
  const ok = r.status === 0 && m && m[1] === m[2];
  if (m) { totalReussis += +m[1]; totalControles += +m[2]; }
  if (!ok) echecs++;
  console.log(`${ok ? "✅" : "❌"} ${suite.padEnd(38)} ${bilan || `(exit ${r.status})`}`);
  if (!ok && r.stdout) console.log(r.stdout.split("\n").filter((l) => l.includes("❌") || l.includes("attendu") || l.includes("obtenu") || l.includes("détail")).join("\n"));
  if (!ok && r.stderr) console.log(r.stderr.slice(-500));
}

fs.rmSync(path.join(dossier, "_sortie"), { recursive: true, force: true });
console.log(`\n${suites.length - echecs}/${suites.length} suites, ${totalReussis}/${totalControles} contrôles réussis`);
process.exit(echecs === 0 ? 0 : 1);
