// FR : LANCEUR du test fixtures : empaquette scripts/fixtures-corps.mjs avec
// esbuild (qui resout les imports TS sans extension, le suffixe Vite "?url" et
// import.meta.env, ce que Node seul ne sait pas faire) puis l'execute avec
// Node - meme mecanisme que la batterie logique (tests/logique/lancer.mjs).
//   node scripts/tester-avec-fixtures.mjs        (depuis la racine du projet)
// Le bundle est ecrit DANS scripts/ pour que la resolution des fixtures par
// import.meta.url dans fausse-db.mjs ("../test-fixtures/") reste correcte.
// EN: fixtures test LAUNCHER - bundles scripts/fixtures-corps.mjs with
// esbuild (extensionless TS imports, Vite "?url" suffix, import.meta.env)
// then runs it with Node, like the logic battery (tests/logique/lancer.mjs).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const racine = process.cwd();
const GLOBAUX = ["/home/claude/.npm-global/lib/node_modules/tsx/node_modules", "/home/claude/.npm-global/lib/node_modules"];
function trouver(nom) { for (const base of [racine, ...GLOBAUX]) { try { return require(require.resolve(nom, { paths: [base] })); } catch { /* suivant */ } } throw new Error(`module introuvable : ${nom}`); }
const esbuild = trouver("esbuild");
const dossier = path.join(racine, "scripts");
const corps = path.join(dossier, "fixtures-corps.mjs");
if (!fs.existsSync(corps)) { console.error(`corps introuvable : ${corps}`); process.exit(2); }
// FR : modules FACTICES pour ce que le corps n'utilise jamais (lecture reelle
// du Manifest : sql.js, fflate, idb, fichier .wasm) - le code teste les importe
// seulement, les fixtures (fausse-db.mjs) remplacent la base. Meme liste que
// tests/logique/lancer.mjs. EN: stub modules for what the body never uses.
const MODULES_FACTICES = /^(sql\.js(\/.*)?|fflate|idb)$/;
const modulesFactices = { name: "modules-factices", setup(b) {
  b.onResolve({ filter: MODULES_FACTICES }, (a) => ({ path: a.path, namespace: "factice" }));
  b.onLoad({ filter: /.*/, namespace: "factice" }, () => ({ loader: "js", contents: "const indisponible = () => { throw new Error('module indisponible dans les tests'); }; export default indisponible; export const unzipSync = indisponible, openDB = indisponible;" }));
} };
const sortie = path.join(dossier, "_fixtures.bundle.mjs");
await esbuild.build({
  plugins: [modulesFactices],
  entryPoints: [corps], bundle: true, platform: "node", format: "esm", outfile: sortie, logLevel: "error",
  nodePaths: [path.join(racine, "node_modules"), ...GLOBAUX.filter((p) => !p.includes("tsx"))],
  define: { "import.meta.env": JSON.stringify({ BASE_URL: "./", DEV: false, MODE: "test" }) },
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
try {
  const r = spawnSync("node", [sortie, ...process.argv.slice(2)], { stdio: "inherit", cwd: racine });
  process.exit(r.status ?? 1);
} finally {
  fs.rmSync(sortie, { force: true });
}
