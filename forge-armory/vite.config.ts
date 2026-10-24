import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename, dirname } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

// FR : ⚠️ CORRIGE (02/08/2026) : le fichier .wasm de sql.js (necessaire
// pour lire le Manifest Destiny/SQLite dans le navigateur) etait copie via
// vite-plugin-static-copy, peu fiable en mode developpement (erreur
// "wasm validation error... failed to match magic number" = le navigateur
// recevait autre chose que le vrai fichier binaire, ex: une page HTML de
// remplacement). On importe maintenant le fichier via le suffixe Vite
// natif "?url", la methode officiellement recommandee : Vite garantit
// alors le bon chemin, aussi bien en dev qu'au build. Voir download.ts.
// EN: ⚠️ FIXED (2026-08-02): sql.js's .wasm file (needed to read the
// Destiny/SQLite Manifest in the browser) was copied via
// vite-plugin-static-copy, unreliable in dev mode (error "wasm validation
// error... failed to match magic number" = the browser was receiving
// something other than the real binary file, e.g. an HTML fallback page).
// We now import the file via Vite's native "?url" suffix, the officially
// recommended approach: Vite guarantees the right path both in dev and at
// build time. See download.ts.
//
// Bungie exige HTTPS pour toute Redirect URL OAuth, y compris en local, et
// n'accepte pas "localhost" (utiliser 127.0.0.1). mkcert génère un
// certificat local de confiance à la première exécution (peut demander
// votre mot de passe système une fois, pour l'installer dans le trousseau).
// FR : ⚠️ AJOUT (26/09/2026) - la version du projet est injectée dans
// l'appli pour être AFFICHÉE à l'écran. Sans ça, impossible de savoir d'un
// coup d'œil quelle version est installée : deux fabrications successives
// produisent un fichier au nom identique.
// EN: ⚠️ ADDED - the project version is injected so it can be DISPLAYED:
// otherwise there is no way to tell which build is installed.
const versionBase = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")).version;

// FR : ⚠️ AJOUT (20/10/2026) - version « chantier » : quand on travaille sur
// une branche « draft-<chantier> », la version affichée porte le suffixe du
// chantier (ex: « 0.4.14 » sur main, « 0.4.14.legendarium » sur
// draft-legendarium). La version de base (package.json) reste inchangée :
// elle évolue normalement avec les fonctionnalités.
//
// Détection de la branche, par ordre de priorité :
// 1. Variable d'environnement FORGE_BRANCHE (pour forcer, utile en CI)
// 2. git rev-parse (clone normal)
// 3. Nom du dossier parent (ZIP téléchargé depuis GitHub : le dossier extrait
//    s'appelle « Forge-Armory-<branche> » — ex: Forge-Armory-draft-sec)
// 4. Chaîne vide (on retombe sur la version de base)
//
// EN: ⚠️ ADDED - « chantier » version: when working on a « draft-<chantier> »
// branch, the displayed version carries the chantier suffix (e.g. « 0.4.14 »
// on main, « 0.4.14.legendarium » on draft-legendarium). The base version
// (package.json) stays untouched and keeps evolving with features.
//
// Branch detection, in priority order:
// 1. FORGE_BRANCHE environment variable (to force, useful in CI)
// 2. git rev-parse (normal clone)
// 3. Parent folder name (ZIP downloaded from GitHub: the extracted folder is
//    named « Forge-Armory-<branch> » — e.g. Forge-Armory-draft-sec)
// 4. Empty string (fall back to base version)
function obtenirBrancheDepuisDossier(): string {
  const dossierParent = basename(dirname(process.cwd()));
  const match = dossierParent.match(/^Forge-Armory-(.+)$/);
  return match ? match[1] : "";
}

function obtenirBranche(): string {
  if (process.env.FORGE_BRANCHE) return process.env.FORGE_BRANCHE;
  try {
    const branche = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    if (branche && branche !== "HEAD") return branche;
  } catch {
    // Pas de git disponible (ZIP sans .git, CI minimal)
  }
  return obtenirBrancheDepuisDossier();
}

const branche = obtenirBranche();
const matchDraft = branche.match(/^draft-(.+)$/);
const version = matchDraft ? `${versionBase}.${matchDraft[1]}` : versionBase;

// FR : ⛔ AJOUT (21/10/2026, branche draft-sec) - CSP (Content-Security-Policy)
// de l'appli, injectée dans index.html au build. Défense en profondeur : même
// si un jour un contenu injecté parvenait à s'exécuter dans la page (XSS),
// il ne pourrait ni charger de script externe, ni se connecter ailleurs, ni
// lire le stockage d'une autre origine.
//
// Règles retenues :
//   - default-src 'self' : tout vient de l'appli elle-même (le schéma
//     interne app://local dans le logiciel, l'origine du navigateur sinon) ;
//   - script-src 'self' 'wasm-unsafe-eval' : AUCUN script inline ni externe
//     (React 18 en production ne génère pas de script inline, pas de
//     react-refresh, qui n'existe qu'en dev) + 'wasm-unsafe-eval' pour la
//     COMPILATION wasm de sql.js (voir ci-dessous).
//   - style-src 'self' 'unsafe-inline' : les 874 styles inline de React
//     (attribut style) seraient sinon tous cassés ; le risque est limité car
//     aucune donnée utilisateur n'est injectée dans un style (vérifié : les
//     interpolations de style ne concernent que des constantes et des mesures).
//   - img-src 'self' https://www.bungie.net data: : icônes du Manifest + SVG
//     embarqués en data: (Vite inline les petits assets en data: au build).
//   - connect-src 'self' https://www.bungie.net https://api.destinyitemmanager.com
//     https://api.github.com : liste blanche réseau, identique au filtre
//     Electron (main.cjs). En dev, le serveur Vite (https://127.0.0.1:5173)
//     et son websocket HMR (ws://127.0.0.1:5173) s'y ajoutent.
//   - font-src 'self' data: : la police "Inter" est un fallback système (aucun
//     @font-face embarqué), data: pour les éventuels glyphes inline.
//   - object-src 'none' : pas de <object>/<embed>/<applet>.
//   - base-uri 'self' : pas de <base> pirate.
//   - form-action 'self' : pas de soumission vers l'extérieur (l'appli n'a
//     aucun <form>, règle par précaution).
//   - frame-ancestors 'none' : pas d'iframe de l'appli ailleurs (clickjacking).
//
// Le wasm de sql.js est chargé par fetch depuis 'self' (connect-src 'self'),
// puis compilé par WebAssembly.instantiate : la COMPILATION wasm est un
// script et exige 'wasm-unsafe-eval' dans script-src (CSP3, Chromium 95+).
// Sans cette directive, le logiciel installé affiche CompileError et le
// chargement du Manifest échoue silencieusement. 'wasm-unsafe-eval' est
// la directive la PLUS ÉTROITE : elle n'autorise QUE la compilation wasm,
// PAS eval() (on n'utilise donc volontairement pas 'unsafe-eval').
//
// IMPORTANT : cette CSP n'est injectée qu'en BUILD (production). En dev,
// react-refresh (@vitejs/plugin-react) injecte un script inline de
// rechargement à chaud : 'unsafe-inline' sur script-src y serait un trou
// béant, et l'omettre casserait le HMR. Le logiciel installé embarque le
// build de production : il a donc la CSP stricte.
// EN: app CSP, injected into index.html at build time. Defense in depth: even
// if injected content ever ran in the page (XSS), it could neither load an
// external script, nor connect elsewhere, nor read another origin's storage.
// Rules: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' (React 18
// production emits no inline script - react-refresh only exists in dev;
// 'wasm-unsafe-eval' allows ONLY wasm compilation, needed by sql.js - see
// below); style-src 'self' 'unsafe-inline' (React's inline style attributes);
// img-src 'self'
// https://www.bungie.net data: (Manifest icons + small assets inlined as
// data: by Vite); connect-src restricted to the same whitelist as Electron's
// network filter (plus the Vite server + HMR websocket in dev); font-src
// 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';
// frame-ancestors 'none'. sql.js's wasm is fetched from 'self' (connect-src
// 'self') then compiled via WebAssembly.instantiate: wasm COMPILATION is a
// script and requires 'wasm-unsafe-eval' in script-src (CSP3, Chromium 95+).
// Without it, the installed app shows a CompileError and Manifest loading
// silently fails. 'wasm-unsafe-eval' is the NARROWEST directive: it allows
// ONLY wasm compilation, NOT eval() (we deliberately do not use 'unsafe-eval').
// IMPORTANT: this CSP is only injected in the BUILD (production). In dev,
// react-refresh injects an inline HMR script: 'unsafe-inline' on script-src
// would be a wide-open hole there, and omitting it would break HMR. The
// installed app ships the production build: it gets the strict CSP.
const CSP_PRODUCTION = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://www.bungie.net data:",
  "connect-src 'self' https://www.bungie.net https://api.destinyitemmanager.com https://api.github.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export default defineConfig({
  define: { __VERSION_APP__: JSON.stringify(version) },
  // FR : ⚠️ AJOUT (24/09/2026) - chemins RELATIFS dans le build. Le logiciel
  // installé ouvre l'appli depuis un fichier local : des chemins absolus
  // (/assets/...) y pointeraient sur la racine du disque et rien ne se
  // chargerait. Sans effet négatif pour la version navigateur.
  // EN: ⚠️ ADDED - RELATIVE asset paths. The installed app opens the build
  // from a local file, where absolute paths would point at the drive root.
  base: "./",
  plugins: [
    react(),
    mkcert({ hosts: ["127.0.0.1"] }),
    {
      // FR : injecte la balise <meta http-equiv="Content-Security-Policy"> dans
      // index.html, UNIQUEMENT au build (voir le commentaire CSP ci-dessus).
      // EN: injects the <meta http-equiv="Content-Security-Policy"> tag into
      // index.html, ONLY at build time (see the CSP comment above).
      name: "csp-production",
      apply: "build",
      transformIndexHtml: () => [
        { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP_PRODUCTION }, injectTo: "head" },
      ],
    },
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    https: true,
  },
});
