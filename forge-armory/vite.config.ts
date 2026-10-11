import { readFileSync } from "node:fs";
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
const version = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")).version;

export default defineConfig({
  define: { __VERSION_APP__: JSON.stringify(version) },
  // FR : ⚠️ AJOUT (24/09/2026) - chemins RELATIFS dans le build. Le logiciel
  // installé ouvre l'appli depuis un fichier local : des chemins absolus
  // (/assets/...) y pointeraient sur la racine du disque et rien ne se
  // chargerait. Sans effet négatif pour la version navigateur.
  // EN: ⚠️ ADDED - RELATIVE asset paths. The installed app opens the build
  // from a local file, where absolute paths would point at the drive root.
  base: "./",
  plugins: [react(), mkcert({ hosts: ["127.0.0.1"] })],
  server: {
    host: "127.0.0.1",
    port: 5173,
    https: true,
  },
});
