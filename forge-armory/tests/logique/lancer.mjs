// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - LANCEUR des tests de logique : empaquette un fichier de test avec esbuild (qui remplace `import.meta.env.*` comme Vite, ce que `tsx` seul ne sait pas faire) puis l'exécute avec Node.
//   node tests/logique/lancer.mjs <fichier.test.ts>        (depuis la racine du projet ; le chemin est relatif à tests/logique/)
// esbuild et react sont cherchés dans node_modules du projet (après `npm install`), sinon dans les modules globaux de l'environnement de travail. EN: bundles a test with esbuild (defining import.meta.env) then runs it with Node.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const racine = process.cwd();
const GLOBAUX = ["/home/claude/.npm-global/lib/node_modules/tsx/node_modules", "/home/claude/.npm-global/lib/node_modules"];
function trouver(nom) { for (const base of [racine, ...GLOBAUX]) { try { return require(require.resolve(nom, { paths: [base] })); } catch { /* suivant */ } } throw new Error(`module introuvable : ${nom}`); }
const esbuild = trouver("esbuild");
const test = process.argv[2];
if (!test) { console.error("préciser le fichier de test : node tests/logique/lancer.mjs <fichier.test.ts>"); process.exit(2); }
const entree = path.isAbsolute(test) ? test : path.join(racine, "tests/logique", test);
const sortie = path.join(racine, "tests/logique/_sortie"); fs.mkdirSync(sortie, { recursive: true });
const fichier = path.join(sortie, path.basename(test).replace(/\.tsx?$/, ".mjs"));
// FR : ⚠️ AJOUT (12/10/2026) - modules FACTICES pour ce que les tests n'utilisent jamais (lecture réelle du Manifest : sql.js, fflate, idb, fichier .wasm) : la logique testée les importe seulement. Les tests qui lisent des définitions du Manifest utilisent une fausse base.
// EN: stub modules for what tests never use (real Manifest reading), so logic importing them can still be bundled.
const MODULES_FACTICES = /^(sql\.js(\/.*)?|fflate|idb)$/;
const modulesFactices = { name: "modules-factices", setup(b) {
  b.onResolve({ filter: MODULES_FACTICES }, (a) => ({ path: a.path, namespace: "factice" }));
  b.onLoad({ filter: /.*/, namespace: "factice" }, () => ({ loader: "js", contents: "const indisponible = () => { throw new Error('module indisponible dans les tests'); }; export default indisponible; export const unzipSync = indisponible, openDB = indisponible;" }));
} };
await esbuild.build({
  plugins: [modulesFactices],
  entryPoints: [entree], bundle: true, platform: "node", format: "esm", outfile: fichier, jsx: "automatic", logLevel: "error",
  nodePaths: [path.join(racine, "node_modules"), ...GLOBAUX.filter((p) => !p.includes("tsx"))],
  // FR : ⚠️ CHANGÉ (12/10/2026) - TOUT `import.meta.env` est défini (et non trois clés) : certains modules lisent d'autres variables (clé et identifiant Bungie), absentes sous Node, qui valent alors `undefined`, comme sans fichier .env.local. EN: the whole import.meta.env is defined.
  define: { "import.meta.env": JSON.stringify({ BASE_URL: "./", DEV: false, MODE: "test" }) },
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
const r = spawnSync("node", [fichier, ...process.argv.slice(3)], { stdio: "inherit", cwd: racine });
process.exit(r.status ?? 1);
