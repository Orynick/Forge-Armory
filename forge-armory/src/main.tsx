import React from "react";
import ReactDOM from "react-dom/client";
// FR : ⚠️ CHANGÉ (24/09/2026) - le logiciel installé charge l'appli depuis
// un FICHIER local, pas depuis une adresse web : les chemins d'URL
// classiques (/auth/callback) n'y fonctionnent pas. On bascule donc sur un
// routeur à dièse (#) dans ce cas, et on garde les URL propres dans le
// navigateur. `window.appBureau` est exposé par `electron/preload.cjs`.
// EN: ⚠️ CHANGED - the installed app loads from a local FILE, where normal
// URL paths don't work: use a hash router there, keep clean URLs in the
// browser.
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const Routeur = (window as any).appBureau?.estBureau ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routeur>
      <App />
    </Routeur>
  </React.StrictMode>
);
