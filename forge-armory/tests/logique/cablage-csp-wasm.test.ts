// FR : ⚠️ AJOUT (23/10/2026, v0.5.4) - test de CÂBLAGE (il lit le TEXTE du code)
// du correctif « chargement du Manifest impossible dans le logiciel installé ».
// Symptôme utilisateur : le bouton « charger le Manifest (FR+EN) » ne change
// rien, et la console affiche CompileError : WebAssembly.instantiate() …
// 'unsafe-eval' is not an allowed source … "script-src 'self'".
// Cause : la CSP de production bloquait la COMPILATION wasm de sql.js.
// La compilation/instanciation d'un module WebAssembly exige
// 'wasm-unsafe-eval' dans script-src (CSP3, Chromium 95+).
// Ce bug ne se voit dans aucun test d'interface (la CSP n'est injectée
// qu'au BUILD, jamais en dev), donc la règle est protégée ici, sur le texte
// de `vite.config.ts` :
//   1. script-src contient 'wasm-unsafe-eval' (la directive la plus ÉTROITE :
//      elle n'autorise QUE la compilation wasm) ;
//   2. script-src ne contient PAS 'unsafe-eval' (on n'ouvre pas eval()) ;
//   3. le reste de la CSP stricte est intact (default-src 'self',
//      object-src 'none', frame-ancestors 'none', connect-src limité) ;
//   4. la CSP reste injectée UNIQUEMENT au build (apply: "build") : en dev,
//      le HMR de react-refresh a besoin d'un script inline ;
//   5. les commentaires erronés (« pas de 'wasm-unsafe-eval' nécessaire »)
//      sont partis.
// EN: ⚠️ ADDED (v0.5.4) - wiring test (reads the code text) of the "Manifest
// cannot load in the installed app" fix. User symptom: the "load Manifest
// (FR+EN)" button does nothing and the console shows CompileError:
// WebAssembly.instantiate() … 'unsafe-eval' is not an allowed source …
// "script-src 'self'". Cause: the production CSP blocked sql.js wasm
// COMPILATION. Compiling/instantiating a WebAssembly module requires
// 'wasm-unsafe-eval' in script-src (CSP3, Chromium 95+).
// This bug shows in no UI test (the CSP is injected at BUILD time only, never
// in dev), so the rule is protected here, on the text of `vite.config.ts`.
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };

const vite = fs.readFileSync("vite.config.ts", "utf-8");
const sansCommentaires = vite.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");

// ---------- 1. 'wasm-unsafe-eval' présent dans script-src ----------
ok("CÂBLAGE : la CSP_PRODUCTION contient `\"script-src 'self' 'wasm-unsafe-eval'\"` (la compilation wasm de sql.js est autorisée)", /"script-src 'self' 'wasm-unsafe-eval'"/.test(sansCommentaires));
ok("CÂBLAGE : 'wasm-unsafe-eval' est dans la directive script-src (et pas éparpillé ailleurs)", /"script-src '[^"]*'wasm-unsafe-eval'[^"]*"/.test(sansCommentaires));

// ---------- 2. PAS de 'unsafe-eval' ----------
const blocCsp = vite.slice(vite.indexOf("const CSP_PRODUCTION"), vite.indexOf("].join"));
const directiveScriptSrc = (blocCsp.match(/"script-src[^"]*"/) || [""])[0];
ok("CÂBLAGE : la directive script-src ne contient PAS 'unsafe-eval' (on n'ouvre pas eval(), seulement la compilation wasm)", !/'unsafe-eval'/.test(directiveScriptSrc), directiveScriptSrc);
ok("CÂBLAGE : 'unsafe-eval' n'apparaît dans aucune directive de CSP_PRODUCTION", !/"[^"]*'unsafe-eval'[^"]*"/.test(blocCsp));

// ---------- 3. le reste de la CSP stricte est intact ----------
ok("CÂBLAGE : default-src 'self' est conservé", /"default-src 'self'"/.test(blocCsp));
ok("CÂBLAGE : object-src 'none' est conservé", /"object-src 'none'"/.test(blocCsp));
ok("CÂBLAGE : frame-ancestors 'none' est conservé", /"frame-ancestors 'none'"/.test(blocCsp));
ok("CÂBLAGE : connect-src reste limité à 'self' + la liste blanche Bungie/DIM/GitHub", /"connect-src 'self' https:\/\/www\.bungie\.net https:\/\/api\.destinyitemmanager\.com https:\/\/api\.github\.com"/.test(blocCsp));
ok("CÂBLAGE : style-src conserve 'unsafe-inline' (styles inline React) mais script-src n'a PAS 'unsafe-inline'", /"style-src 'self' 'unsafe-inline'"/.test(blocCsp) && !/'unsafe-inline'/.test(directiveScriptSrc));

// ---------- 4. injection UNIQUEMENT au build ----------
const plugin = vite.slice(vite.indexOf('name: "csp-production"'));
ok("CÂBLAGE : le plugin d'injection de la CSP a `apply: \"build\"` (jamais injectée en dev : le HMR a besoin d'un script inline)", /apply:\s*"build"/.test(plugin));
ok("CÂBLAGE : la CSP est injectée via une balise meta http-equiv Content-Security-Policy dans index.html", /http-equiv":\s*"Content-Security-Policy",\s*content:\s*CSP_PRODUCTION/.test(plugin));
ok("CÂBLAGE : index.html (source) ne contient PAS de balise CSP en dur (l'injection reste un mécanisme de build)", !/http-equiv="Content-Security-Policy"/.test(fs.readFileSync("index.html", "utf-8")));

// ---------- 5. les commentaires erronés sont partis ----------
ok("CÂBLAGE : le commentaire erroné FR est parti (« pas de 'wasm-unsafe-eval' nécessaire »)", !/pas de 'wasm-unsafe-eval' n\u00e9cessaire/.test(vite) && !/pas de .wasm-unsafe-eval. n\u00e9cessaire/.test(vite));
ok("CÂBLAGE : le commentaire erroné EN est parti (« no 'wasm-unsafe-eval' needed »)", !/no 'wasm-unsafe-eval' needed/.test(vite));
ok("CÂBLAGE : le commentaire corrigé explique le besoin (WebAssembly.instantiate / compilation wasm)", /WebAssembly\.instantiate/.test(vite) && /wasm-unsafe-eval/.test(vite));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
