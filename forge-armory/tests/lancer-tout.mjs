// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - REJOUE TOUS LES TESTS du projet et affiche un résumé : `node tests/lancer-tout.mjs` (depuis la racine du projet). Tests de logique : `tests/logique/*.test.ts(x)` (via `lancer.mjs`) ; tests d'interface : une page construite (`tests/ui/build.mjs <nom>`)
// puis un scénario Python/Playwright (`tests/ui/<nom>.py`). Code de sortie 0 seulement si TOUT passe. EN: ⚠️ ADDED - reruns every test and prints a summary.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const lancer = (cmd, args) => spawnSync(cmd, args, { encoding: "utf-8" });
const resume = (sortie) => (/(\d+)\/(\d+) contrôles réussis/.exec(sortie) ?? []).slice(1, 3).map(Number);
const resultats = [];
for (const f of fs.readdirSync("tests/logique").filter((x) => /\.test\.tsx?$/.test(x)).sort()) {
  const r = lancer("node", ["tests/logique/lancer.mjs", f]); const [ok, total] = resume(r.stdout + r.stderr);
  resultats.push({ nom: `logique · ${f.replace(/\.test\.tsx?$/, "")}`, ok, total, passe: r.status === 0 && ok === total });
}
for (const f of fs.readdirSync("tests/ui").filter((x) => x.endsWith(".py")).sort()) {
  const nom = f.replace(/\.py$/, "");
  const b = lancer("node", ["tests/ui/build.mjs", nom]);
  if (b.status !== 0) { resultats.push({ nom: `interface · ${nom}`, ok: 0, total: 0, passe: false, note: "construction de la page en échec" }); continue; }
  const r = lancer("python3", [`tests/ui/${f}`]); const [ok, total] = resume(r.stdout + r.stderr);
  resultats.push({ nom: `interface · ${nom}`, ok, total, passe: r.status === 0 && ok === total });
}
console.log("");
for (const r of resultats) console.log(r.passe ? "✅" : "❌", r.nom.padEnd(34), r.total ? `${r.ok}/${r.total}` : "—", r.note ?? "");
const tot = resultats.reduce((s, r) => s + r.ok, 0), all = resultats.reduce((s, r) => s + r.total, 0);
console.log(`\n${resultats.filter((r) => r.passe).length}/${resultats.length} séries réussies — ${tot}/${all} contrôles au total`);
process.exit(resultats.every((r) => r.passe) ? 0 : 1);
