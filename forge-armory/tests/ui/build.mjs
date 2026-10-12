// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - construit les petites pages de test d'interface (esbuild) à partir des VRAIS composants et de la VRAIE feuille de style. Usage, depuis la racine du projet :
//   node tests/ui/build.mjs <nom-de-l'entrée>      (ex. : selecteur ; lit tests/ui/entree-<nom>.tsx, écrit tests/ui/_sortie/<nom>.html + .js)
// esbuild et react sont cherchés dans node_modules du projet (après `npm install`), sinon dans les modules globaux de l'environnement de travail.
// EN: ⚠️ ADDED - builds the small UI test pages from the REAL components and stylesheet.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const racine = process.cwd();
const GLOBAUX = ["/home/claude/.npm-global/lib/node_modules/tsx/node_modules", "/home/claude/.npm-global/lib/node_modules"];
function trouver(nom) {
  for (const base of [racine, ...GLOBAUX]) { try { return require(require.resolve(nom, { paths: [base] })); } catch { /* suivant */ } }
  throw new Error(`module introuvable : ${nom}`);
}
const esbuild = trouver("esbuild");
const nom = process.argv[2];
if (!nom) throw new Error("préciser l'entrée : node tests/ui/build.mjs <nom>");
const sortie = path.join(racine, "tests/ui/_sortie"); fs.mkdirSync(sortie, { recursive: true });
const nodePaths = [path.join(racine, "node_modules"), ...GLOBAUX.filter((p) => !p.includes("tsx"))];
// FR : ⚠️ AJOUT (12/10/2026) - (1) modules FACTICES pour ce que les pages de test n'utilisent jamais (sql.js, fflate, idb) ; (2) FAUX inventaire à la place du module qui interroge Bungie (`tests/ui/faux/inventaire.ts`). EN: stub modules and a fake inventory for UI test pages.
const fauxInventaire = path.join(racine, "tests/ui/faux/inventaire.ts");
const substitutions = { name: "substitutions-de-test", setup(b) {
  b.onResolve({ filter: /^(sql\.js(\/.*)?|fflate|idb)$/ }, (a) => ({ path: a.path, namespace: "factice" }));
  b.onLoad({ filter: /.*/, namespace: "factice" }, () => ({ loader: "js", contents: "const indisponible = () => { throw new Error('module indisponible dans les tests'); }; export default indisponible; export const unzipSync = indisponible, openDB = indisponible;" }));
  b.onResolve({ filter: /lib\/bungie\/inventaire$/ }, () => ({ path: fauxInventaire }));
} };
await esbuild.build({
  plugins: [substitutions],
  entryPoints: [path.join(racine, `tests/ui/entree-${nom}.tsx`)], bundle: true, format: "iife", outfile: path.join(sortie, `${nom}.js`), jsx: "automatic", nodePaths, logLevel: "error",
  define: { "import.meta.env": JSON.stringify({ BASE_URL: `file://${racine}/public/`, DEV: false, MODE: "test" }) },
  loader: { ".svg": "dataurl" },
});
const css = fs.readFileSync(path.join(racine, "src/index.css"), "utf-8");
fs.writeFileSync(path.join(sortie, `${nom}.html`), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="racine"></div><script src="${nom}.js"></script></body></html>`);
console.log(`construit : tests/ui/_sortie/${nom}.html`);
