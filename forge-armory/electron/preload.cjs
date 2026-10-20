// FR : Pont entre le logiciel et l'appli web. `contextIsolation` étant
// activé, la page n'a accès QU'À ce qui est exposé ici — elle ne peut ni
// lire de fichiers ni exécuter de commandes.
// EN: Bridge between the desktop shell and the web app. With
// `contextIsolation` on, the page can ONLY access what is exposed here.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("appBureau", {
  estBureau: true,
  /** FR : ouvre la fenêtre de connexion Bungie, rend { code, state }. */
  connexionBungie: (urlAutorisation) => ipcRenderer.invoke("bungie:connexion", urlAutorisation),
  /**
   * FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - exporte la fiche d'un build en PNG
   * ou PDF (JPEG ajouté en v0.2.6). Rend { chemin } si le fichier a été enregistré, { annule: true }
   * si l'utilisateur a fermé la boîte d'enregistrement.
   * EN: ⚠️ ADDED - exports a build sheet as PNG or PDF.
   */
  exporterFiche: (html, format, nomFichier) => ipcRenderer.invoke("fiche:exporter", html, format, nomFichier),
  /**
   * FR : ⛔ AJOUT (21/10/2026, branche draft-sec) - stockage chiffré (safeStorage,
   * clés de l'OS) pour les jetons OAuth Bungie et le jeton DIM, à la place de
   * localStorage. Trois fonctions : lire (valeur ou null), écrire (chiffre et
   * persiste), effacer. Renvoient null/false si le chiffrement OS est
   * indisponible : l'appelant retombe alors sur localStorage.
   * EN: encrypted storage (safeStorage, OS keys) for the Bungie OAuth tokens
   * and the DIM token, instead of localStorage. Three functions: read (value
   * or null), write (encrypt and persist), erase. Return null/false when OS
   * encryption is unavailable: the caller then falls back to localStorage.
   */
  stockageSecurise: {
    disponible: () => ipcRenderer.invoke("securite:disponible"),
    lire: (cle) => ipcRenderer.invoke("securite:lire", cle),
    ecrire: (cle, valeur) => ipcRenderer.invoke("securite:ecrire", cle, valeur),
    effacer: (cle) => ipcRenderer.invoke("securite:effacer", cle),
  },
});
