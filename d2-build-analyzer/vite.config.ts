import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import mkcert from "vite-plugin-mkcert";

// sql.js a besoin de son fichier .wasm accessible en statique pour lire
// le Manifest Destiny (base SQLite) directement dans le navigateur.
//
// Bungie exige HTTPS pour toute Redirect URL OAuth, y compris en local, et
// n'accepte pas "localhost" (utiliser 127.0.0.1). mkcert génère un
// certificat local de confiance à la première exécution (peut demander
// votre mot de passe système une fois, pour l'installer dans le trousseau).
export default defineConfig({
  plugins: [
    react(),
    mkcert({ hosts: ["127.0.0.1"] }),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/sql.js/dist/sql-wasm.wasm",
          dest: "",
        },
      ],
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    https: true,
  },
});
