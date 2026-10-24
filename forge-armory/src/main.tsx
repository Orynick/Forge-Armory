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
// FR : ⚠️ CHANGÉ (23/10/2026, audit) - `estBureau()` (typée) remplace le cast `as any` sur `window.appBureau`. / EN: ⚠️ CHANGED - typed `estBureau()` replaces the `as any` cast.
import { estBureau } from "./lib/bungie/oauth";
// FR : ⛔ AJOUT (21/10/2026, branche draft-sec) - peuplé AVANT le premier
// rendu : les jetons (lus de façon synchrone par `etatSession` au montage du
// tableau de bord) doivent être en cache mémoire dès le départ. La promesse
// n'est pas attendue : en attendant, la lecture retombe sur localStorage.
// EN: populated BEFORE the first render: the tokens (read synchronously by
// `etatSession` when the dashboard mounts) must be in the in-memory cache from
// the start. The promise is not awaited: meanwhile, reads fall back to
// localStorage.
import { initialiserStockageSecurise } from "./lib/stockageSecurise";
import "./index.css";

void initialiserStockageSecurise();

const Routeur = estBureau() ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routeur>
      <App />
    </Routeur>
  </React.StrictMode>
);
