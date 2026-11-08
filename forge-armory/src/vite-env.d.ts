/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUNGIE_API_KEY: string;
  readonly VITE_BUNGIE_CLIENT_ID: string;
  readonly VITE_BUNGIE_REDIRECT_URI: string;
  /** FR : true avec `npm run dev`, false dans un build de production - sert à n'afficher certains outils de débogage qu'en développement (ex: bouton de téléchargement des Manifests). Fourni automatiquement par Vite, mais il faut le déclarer ici car cette interface est écrite à la main. / EN: true with `npm run dev`, false in a production build - used to show some debugging tools in development only (e.g. the Manifest download button). Provided automatically by Vite, but must be declared here since this interface is hand-written. */
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** FR : version du projet (lue dans package.json par vite.config.ts), affichée en pied de page pour identifier la version installée. / EN: project version, displayed in the footer to identify which build is installed. */
declare const __VERSION_APP__: string;

/** FR : vrai uniquement dans le build WEB (Netlify) — masque les outils de diagnostic du site public. / EN: true only in the WEB (Netlify) build — hides diagnostic tools from the public site. */
declare const __WEB__: boolean;
