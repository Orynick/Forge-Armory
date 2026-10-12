// FR : Processus principal Electron — la "coquille" qui transforme l'appli
// web en logiciel Windows. Écrit en CommonJS (.cjs) parce que le
// package.json du projet déclare "type": "module" : Electron charge ce
// fichier avec `require`, pas en module ES.
// EN: Electron main process. CommonJS (.cjs) on purpose: the project's
// package.json declares "type": "module", but Electron loads this file
// with `require`.

const { app, BrowserWindow, ipcMain, shell, protocol, net, session, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const { pathToFileURL } = require("node:url");
// FR : ⚠️ AJOUT (02/10/2026) - garantie « une seule page » de l'export PDF (voir pdfFiche.cjs).
// EN: ⚠️ ADDED - "single page" guarantee for the PDF export.
const pdfFiche = require("./pdfFiche.cjs");
// FR : ⚠️ AJOUT (05/10/2026) - dossier de données figé lors du renommage en « Forge Armory » (voir dossierDonnees.cjs).
// EN: ⚠️ ADDED - data folder frozen at the "Forge Armory" rename.
const { choisirDossierDonnees, systemeReel } = require("./dossierDonnees.cjs");

// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - RENOMMAGE EN « FORGE ARMORY » SANS PERDRE LES DONNÉES DE L'UTILISATEUR.
// Electron range les builds enregistrés, les pondérations, le cache du Manifest et la session Bungie dans un
// dossier de `%APPDATA%` dont le nom dépend du nom de l'application : sans cette ligne, le nouveau nom
// pouvait faire lire un dossier vide. On repère l'ancien dossier (voir dossierDonnees.cjs : rien n'est
// déplacé, copié ni supprimé) et on dit à Electron de continuer à l'utiliser. DOIT être appelé AVANT que
// l'application soit prête (`ready`). En cas d'erreur, on garde le réglage par défaut d'Electron : le logiciel
// démarre quand même, plutôt que de planter.
// EN: ⚠️ ADDED - RENAME TO "FORGE ARMORY" WITHOUT LOSING USER DATA. We locate the old data folder and tell
// Electron to keep using it. MUST run before the app is ready. On error, Electron's default is kept.
try {
  const choixDossier = choisirDossierDonnees(app.getPath("appData"), systemeReel());
  app.setPath("userData", choixDossier.dossier);
  app.setPath("sessionData", choixDossier.dossier);
  console.log(`[Forge Armory] dossier de données : ${choixDossier.dossier} (${choixDossier.raison})`);
} catch (erreurDossier) {
  console.warn("[Forge Armory] dossier de données : réglage par défaut conservé :", erreurDossier && erreurDossier.message);
}

// FR : ⚠️ AJOUT (26/09/2026) - adresse interne stable pour l'appli installée.
//
// Problème corrigé : l'appli était chargée en `file://`. Or Chromium
// restreint le stockage (IndexedDB) pour cette adresse : le cache du
// Manifest et les builds enregistrés pouvaient être refusés ou effacés
// d'un lancement à l'autre — d'où un Manifest à retélécharger à chaque
// fois (~100 Mo) et des builds à réimporter.
//
// En servant les mêmes fichiers via un schéma déclaré « standard » et
// « sécurisé », l'appli obtient une ORIGINE stable et un stockage
// persistant, exactement comme une page web classique. Rien d'autre ne
// change : ce sont les mêmes fichiers du dossier `dist`, lus localement,
// sans serveur réseau ni port ouvert.
//
// EN: ⚠️ ADDED - stable internal address for the installed app. It used to
// load over `file://`, for which Chromium restricts IndexedDB: the Manifest
// cache and saved builds could be refused or wiped between launches. Serving
// the same `dist` files through a scheme declared standard + secure gives
// the app a stable ORIGIN and persistent storage, with no network server.
const SCHEMA_APP = "app";
protocol.registerSchemesAsPrivileged([
  { scheme: SCHEMA_APP, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

// FR : en développement, l'appli est servie par Vite (HTTPS local via
// mkcert) ; une fois installée, elle est lue depuis les fichiers produits
// par `vite build`.
// EN: in dev the app is served by Vite over local HTTPS; once installed it
// is read from the files produced by `vite build`.
const URL_DEV = process.env.URL_DEV_VITE || "https://127.0.0.1:5173";
const enDev = !app.isPackaged;

// FR : l'URL de retour déclarée sur le portail Bungie. Elle n'est JAMAIS
// chargée dans le logiciel : on intercepte la redirection juste avant,
// pour récupérer le code d'autorisation. C'est ce qui évite d'embarquer un
// serveur web et un certificat dans l'application installée — et ça permet
// de NE RIEN changer sur l'application Bungie existante.
// EN: the redirect URL registered on the Bungie portal. It is NEVER loaded
// here: we intercept the redirection just before it happens to grab the
// authorization code. This avoids embedding a web server and certificate,
// and requires NO change to the existing Bungie application.
const PREFIXE_RETOUR = "https://127.0.0.1:5173/auth/callback";

let fenetrePrincipale = null;

function creerFenetrePrincipale() {
  fenetrePrincipale = new BrowserWindow({
    width: 1280,
    height: 860,
    // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - largeur minimale : en dessous, les quatre boutons du sélecteur ne tiendraient plus sur une ligne (hauteur plancher de 41,6 px).
    minWidth: 820,
    minHeight: 560,
    backgroundColor: "#0d0f14",
    autoHideMenuBar: true,
    // FR : ⚠️ CHANGÉ (05/10/2026) - « Forge Armory » est le nom, « Destiny 2 Build Analyzer » le sous-titre. Le titre de la page (index.html) prend le relais au chargement.
    // EN: ⚠️ CHANGED - "Forge Armory" is the name, "Destiny 2 Build Analyzer" the subtitle.
    title: "Forge Armory — Destiny 2 Build Analyzer",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // FR : tout lien externe s'ouvre dans le navigateur par défaut, jamais
  // dans une fenêtre du logiciel (évite de transformer l'appli en
  // navigateur improvisé).
  // EN: external links open in the default browser, never inside the app.
  fenetrePrincipale.webContents.setWindowOpenHandler(({ url }) => {
    // FR : ⚠️ DURCI (26/09/2026, audit externe) - `openExternal` ouvrait
    // n'importe quelle adresse. Or il transmet l'adresse au système, qui
    // peut agir dessus selon son type (un lien `file:` ou un protocole
    // applicatif peut lancer un programme). On limite donc aux adresses web.
    // EN: ⚠️ HARDENED (external audit) - `openExternal` handed ANY address to
    // the OS, which may act on it depending on its scheme. Web only now.
    try {
      const cible = new URL(url);
      if (cible.protocol === "https:" || cible.protocol === "http:") shell.openExternal(url);
    } catch {
      /* adresse illisible : on ignore */
    }
    return { action: "deny" };
  });

  // FR : ⚠️ AJOUT (26/09/2026, audit externe) - la fenêtre principale ne doit
  // jamais NAVIGUER ailleurs que sur l'appli elle-même. Sans ce garde-fou, un
  // lien inattendu remplacerait l'appli par une page distante dans la même
  // fenêtre, qui conserve le pont `appBureau`.
  // EN: ⚠️ ADDED (external audit) - the main window must never navigate away
  // from the app itself; otherwise a remote page would replace it while
  // keeping the `appBureau` bridge.
  fenetrePrincipale.webContents.on("will-navigate", (evenement, url) => {
    const autorise = enDev ? url.startsWith(URL_DEV) : url.startsWith(`${SCHEMA_APP}://`);
    if (!autorise) evenement.preventDefault();
  });

  if (enDev) {
    fenetrePrincipale.loadURL(URL_DEV);
  } else {
    fenetrePrincipale.loadURL(`${SCHEMA_APP}://local/index.html`);
  }
}

// FR : en développement seulement, le certificat local de mkcert n'est pas
// reconnu par Electron : on l'accepte explicitement, et UNIQUEMENT pour
// l'adresse du serveur de développement. Aucune autre adresse n'est
// concernée, y compris bungie.net qui garde une vérification normale.
// EN: in dev only, accept mkcert's local certificate, and ONLY for the dev
// server address. Every other address keeps normal verification.
app.on("certificate-error", (evenement, _contenu, url, _erreur, _certificat, rappel) => {
  if (enDev && url.startsWith(URL_DEV)) {
    evenement.preventDefault();
    rappel(true);
    return;
  }
  rappel(false);
});

/**
 * FR : ouvre la page de connexion Bungie dans une fenêtre dédiée et rend
 * le code d'autorisation. La fenêtre se ferme dès que Bungie redirige vers
 * l'URL de retour : cette redirection est interceptée, jamais chargée.
 * EN: opens Bungie's login page in a dedicated window and returns the
 * authorization code. The redirect to the return URL is intercepted, never
 * loaded.
 */
ipcMain.handle("bungie:connexion", async (_evenement, urlAutorisation) => {
  // FR : ⚠️ AJOUT (26/09/2026, audit externe) - l'URL venait du renderer et
  // était ouverte telle quelle. Même si elle est construite par notre propre
  // code, un canal IPC doit toujours valider ce qu'il reçoit : c'est le
  // principe « ne jamais faire confiance au renderer ». On n'ouvre donc que
  // la page d'autorisation de Bungie, rien d'autre.
  // EN: ⚠️ ADDED (external audit) - the URL came from the renderer and was
  // opened as-is. An IPC channel must always validate its input: only
  // Bungie's authorization page is allowed.
  let urlValidee;
  try {
    urlValidee = new URL(urlAutorisation);
  } catch {
    throw new Error("URL de connexion invalide.");
  }
  if (urlValidee.protocol !== "https:" || urlValidee.hostname !== "www.bungie.net") {
    throw new Error(`Adresse de connexion refusée : ${urlValidee.origin}`);
  }

  return new Promise((resoudre, rejeter) => {
    const fenetreAuth = new BrowserWindow({
      width: 520,
      height: 780,
      parent: fenetrePrincipale ?? undefined,
      modal: true,
      autoHideMenuBar: true,
      title: "Connexion Bungie.net",
      // FR : ⚠️ DURCI (26/09/2026, audit externe) - cette fenêtre affiche une
      // page DISTANTE (bungie.net) : `sandbox: true` l'isole davantage, et
      // aucun preload n'y est chargé, donc aucun pont n'y est exposé.
      // EN: ⚠️ HARDENED (external audit) - this window shows a REMOTE page:
      // `sandbox: true` isolates it further, and no preload is loaded there.
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
    });

    let termine = false;

    const traiterUrl = (evenement, url) => {
      if (!url.startsWith(PREFIXE_RETOUR)) return;
      evenement.preventDefault(); // FR : on ne charge JAMAIS cette adresse
      termine = true;
      const parametres = new URL(url).searchParams;
      const erreur = parametres.get("error");
      if (erreur) rejeter(new Error(`Bungie a refusé la connexion : ${erreur}`));
      else resoudre({ code: parametres.get("code"), state: parametres.get("state") });
      if (!fenetreAuth.isDestroyed()) fenetreAuth.destroy();
    };

    // FR : les deux événements sont nécessaires — selon les cas, Bungie
    // renvoie par une redirection (will-redirect) ou par une navigation
    // déclenchée depuis la page (will-navigate).
    // EN: both events are needed: depending on the case Bungie returns via
    // a redirect or via a page-triggered navigation.
    fenetreAuth.webContents.on("will-redirect", traiterUrl);
    fenetreAuth.webContents.on("will-navigate", traiterUrl);

    fenetreAuth.on("closed", () => {
      if (!termine) rejeter(new Error("Connexion annulée : la fenêtre Bungie a été fermée."));
    });

    fenetreAuth.loadURL(urlValidee.toString());
  });
});

// ---------------------------------------------------------------------------
// FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - export infographique d'une fiche de
// build, en PNG ou en PDF (demande de l'utilisateur, cahier des charges v7).
//
// L'appli construit UNE page HTML autonome (src/lib/loadouts/exportFiche.ts).
// Ici, cette même page est rendue dans une fenêtre invisible, puis :
//   - PNG : capturée à l'échelle 2 (1800 px de large, comme la maquette) ;
//   - PDF : imprimée sur une page unique aux dimensions exactes du contenu.
// Les deux sorties viennent donc du même rendu Chromium : elles ne peuvent
// pas diverger.
//
// Sécurité (la page contient des noms pouvant venir d'un build importé) :
//   - la fenêtre est isolée (sandbox, aucun pont, aucune navigation) ;
//   - sa session dédiée, en mémoire, ne laisse passer QUE les icônes de
//     www.bungie.net (tout autre accès réseau est refusé) ;
//   - le canal n'accepte que la fenêtre principale, un format connu, une
//     taille raisonnable, et le nom de fichier est nettoyé ;
//   - le fichier n'est écrit qu'à l'endroit choisi par l'utilisateur.
//
// EN: ⚠️ ADDED - infographic export of a build sheet (PNG or PDF). The app
// builds ONE standalone HTML page; it is rendered here in a hidden, isolated
// window, then captured at scale 2 (PNG) or printed on a single page of the
// exact content size (PDF). Same Chromium render for both. The window is
// sandboxed, its in-memory session only allows www.bungie.net icons, and the
// channel validates its sender and inputs.
// ---------------------------------------------------------------------------
const LARGEUR_EXPORT = 900; // FR : doit rester égal à LARGEUR_EXPORT de exportFiche.ts
const ECHELLE_PNG = 2; // FR : aussi utilisée pour le JPEG / EN: also used for JPEG
// FR : ⚠️ AJOUT (27/09/2026, v0.2.6) - table UNIQUE des formats d'export
// (le JPEG s'ajoute au PNG et au PDF, demande de l'utilisateur). Le canal
// refuse tout format absent de cette table. Qualité JPEG 92 : aucune
// perte visible sur le texte (mesuré : aucun pixel nettement différent du
// PNG). ⚠️ Le JPEG n'est PAS forcément plus léger : la fiche est faite de
// grands aplats, que le PNG compresse très bien (essai sans icônes : JPEG
// 368 Ko, PNG 311 Ko).
// EN: ⚠️ ADDED - SINGLE table of export formats; the channel rejects any
// format missing from it. JPEG quality 92: no visible loss on text. JPEG is
// NOT necessarily lighter: the sheet is mostly flat colours, which PNG
// compresses very well.
const FORMATS_EXPORT = {
  jpeg: { extension: "jpg", filtre: ["jpg", "jpeg"], nom: "Image JPEG", titre: "Enregistrer l'image de la fiche" },
  png: { extension: "png", filtre: ["png"], nom: "Image PNG", titre: "Enregistrer l'image de la fiche" },
  pdf: { extension: "pdf", filtre: ["pdf"], nom: "Document PDF", titre: "Enregistrer le PDF de la fiche" },
};
const QUALITE_JPEG = 92;
const TAILLE_MAX_HTML = 5 * 1024 * 1024;
const PARTITION_EXPORT = "export-fiche"; // FR : sans « persist: » -> en mémoire seulement
// FR : délai maximal d'une génération. Au-delà, la fenêtre invisible est
// détruite et l'utilisateur reçoit un message clair, au lieu d'une attente
// sans fin si un rendu venait à bloquer.
// EN: max generation time; past it, the hidden window is destroyed and a
// clear error is returned instead of an endless wait.
const DELAI_MAX_EXPORT_MS = 30000;
let sessionExportPreparee = false;

function preparerSessionExport() {
  const ses = session.fromPartition(PARTITION_EXPORT);
  if (sessionExportPreparee) return ses;
  ses.webRequest.onBeforeRequest((details, rappel) => {
    const autorise = details.url.startsWith("data:") || details.url.startsWith("https://www.bungie.net/");
    rappel({ cancel: !autorise });
  });
  ses.setPermissionRequestHandler((_contenu, _permission, rappel) => rappel(false));
  sessionExportPreparee = true;
  return ses;
}

// FR : attend les icônes (15 s au plus), retire celles qui n'ont pas pu se
// charger (la case neutre reste, sans pictogramme d'image cassée), puis
// renvoie la hauteur réelle de la page.
// EN: waits for icons (15 s max), removes failed ones, returns page height.
const SCRIPT_PREPARATION = `(async () => {
  const images = [...document.images];
  const attentes = images.map((i) => i.complete ? null : new Promise((r) => {
    i.addEventListener("load", r, { once: true });
    i.addEventListener("error", r, { once: true });
  }));
  await Promise.race([Promise.all(attentes), new Promise((r) => setTimeout(r, 15000))]);
  for (const i of images) {
    if (i.complete && i.naturalWidth > 0) continue;
    // FR : ⚠️ AJOUT (v0.2.6) - une icône porteuse d'information (l'élément
    // d'une arme) est remplacée par son texte de repli plutôt que retirée.
    // EN: an informative icon is replaced by its fallback text.
    const repli = i.getAttribute("data-repli");
    if (repli) {
      const texte = document.createElement("span");
      texte.className = "element-texte";
      texte.textContent = repli;
      const parent = i.parentElement;
      if (parent && parent.classList.contains("element")) parent.replaceWith(texte);
      else i.replaceWith(texte);
    } else {
      i.remove();
    }
  }
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  return Math.ceil(document.documentElement.getBoundingClientRect().height);
})()`;

async function rendreFicheExport(html, format) {
  const fenetre = new BrowserWindow({
    show: false,
    width: LARGEUR_EXPORT,
    height: 1200,
    useContentSize: true,
    backgroundColor: "#0b0e13",
    webPreferences: {
      session: preparerSessionExport(),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  fenetre.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  fenetre.webContents.on("will-navigate", (evenement) => evenement.preventDefault());
  const debogueur = fenetre.webContents.debugger;
  let delaiDepasse = false;
  const minuteur = setTimeout(() => {
    delaiDepasse = true;
    if (!fenetre.isDestroyed()) fenetre.destroy();
  }, DELAI_MAX_EXPORT_MS);
  try {
    await fenetre.loadURL(`data:text/html;charset=utf-8;base64,${Buffer.from(html, "utf8").toString("base64")}`);
    debogueur.attach("1.3");
    const { result } = await debogueur.sendCommand("Runtime.evaluate", {
      expression: SCRIPT_PREPARATION,
      awaitPromise: true,
      returnByValue: true,
    });
    const hauteur = Math.max(200, Math.min(20000, Math.ceil(Number(result && result.value) || 0)));

    if (format === "png" || format === "jpeg") {
      // FR : taille et échelle imposées, pour une image identique quel que
      // soit le réglage d'affichage de Windows (100 %, 125 %, 150 %...).
      // ⚠️ CHANGÉ (v0.2.6) : même capture pour le PNG et le JPEG, seul le
      // format d'encodage diffère.
      // EN: forced size and scale, same image whatever Windows display
      // scaling. ⚠️ CHANGED: same capture for PNG and JPEG, only encoding differs.
      await debogueur.sendCommand("Emulation.setDeviceMetricsOverride", {
        width: LARGEUR_EXPORT,
        height: hauteur,
        deviceScaleFactor: ECHELLE_PNG,
        mobile: false,
      });
      const { data } = await debogueur.sendCommand("Page.captureScreenshot", {
        format,
        ...(format === "jpeg" ? { quality: QUALITE_JPEG } : {}),
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: LARGEUR_EXPORT, height: hauteur, scale: 1 },
      });
      return Buffer.from(data, "base64");
    }

    // FR : ⚠️ CHANGÉ (02/10/2026) - le PDF devait tenir sur UNE page, mais l'utilisateur en obtenait
    // DEUX (sur son Windows, défaut non reproductible ailleurs) : la hauteur était mesurée à l'écran,
    // alors que l'impression met parfois le contenu en page un peu plus haut. On mesure maintenant
    // aussi sous le média « print », on ajoute une marge de sécurité, on impose la taille de la page
    // par un style réservé à l'impression et on n'imprime que la première page. Voir pdfFiche.cjs.
    // ⚠️ La branche PNG/JPEG ci-dessus n'est PAS modifiée.
    // EN: ⚠️ CHANGED - the PDF must fit on ONE page but the user got TWO; the height is now also
    // measured under the print media, with a safety margin, a print-only style forcing the page size,
    // and only page 1 printed. The PNG/JPEG branch above is NOT modified.
    await debogueur.sendCommand("Emulation.setEmulatedMedia", { media: "print" });
    const { result: mesureImpression } = await debogueur.sendCommand("Runtime.evaluate", {
      expression: pdfFiche.EXPRESSION_HAUTEUR,
      returnByValue: true,
    });
    await debogueur.sendCommand("Emulation.setEmulatedMedia", { media: "" });
    const hauteurPage = pdfFiche.hauteurPagePdf(hauteur, mesureImpression && mesureImpression.value);
    await debogueur.sendCommand("Runtime.evaluate", {
      expression: pdfFiche.expressionInjectionCss(LARGEUR_EXPORT, hauteurPage),
      returnByValue: true,
    });
    debogueur.detach();
    return await fenetre.webContents.printToPDF(pdfFiche.optionsPdf(LARGEUR_EXPORT, hauteurPage));
  } catch (erreur) {
    if (delaiDepasse) throw new Error("la génération a dépassé 30 secondes et a été interrompue.");
    throw erreur;
  } finally {
    clearTimeout(minuteur);
    if (!fenetre.isDestroyed()) {
      if (debogueur.isAttached()) debogueur.detach();
      fenetre.destroy();
    }
  }
}

ipcMain.handle("fiche:exporter", async (evenement, html, format, nomFichier) => {
  if (!fenetrePrincipale || evenement.sender !== fenetrePrincipale.webContents) {
    throw new Error("Demande d'export refusée : origine inattendue.");
  }
  if (!Object.prototype.hasOwnProperty.call(FORMATS_EXPORT, format)) throw new Error("Format d'export inconnu.");
  const infosFormat = FORMATS_EXPORT[format];
  if (typeof html !== "string" || html.length === 0 || html.length > TAILLE_MAX_HTML) {
    throw new Error("Contenu d'export invalide.");
  }
  const nomSur =
    String(nomFichier ?? "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 80) || "fiche-build";

  // FR : filet de sécurité supplémentaire, au cas où une étape ne rendrait
  // jamais la main même après destruction de la fenêtre.
  // EN: extra safety net in case a step never returns.
  const donnees = await Promise.race([
    rendreFicheExport(html, format),
    new Promise((_resoudre, rejeter) =>
      setTimeout(() => rejeter(new Error("la génération a dépassé 30 secondes et a été interrompue.")), DELAI_MAX_EXPORT_MS + 5000)
    ),
  ]);

  const { canceled, filePath } = await dialog.showSaveDialog(fenetrePrincipale, {
    title: infosFormat.titre,
    defaultPath: path.join(app.getPath("downloads"), `${nomSur}.${infosFormat.extension}`),
    filters: [{ name: infosFormat.nom, extensions: infosFormat.filtre }],
  });
  if (canceled || !filePath) return { annule: true };
  await fs.writeFile(filePath, donnees);
  return { chemin: filePath };
});

/**
 * FR : sert les fichiers de `dist` sur l'adresse interne. Un garde-fou
 * empêche de sortir de ce dossier : une adresse contenant « .. » ne peut
 * pas atteindre le reste du disque.
 * EN: serves `dist` files on the internal address, with a guard preventing
 * path traversal outside that folder.
 */
function installerProtocoleApp() {
  const racine = path.resolve(path.join(__dirname, "..", "dist"));
  protocol.handle(SCHEMA_APP, (requete) => {
    const chemin = decodeURIComponent(new URL(requete.url).pathname);
    const fichier = path.resolve(path.join(racine, chemin === "/" ? "index.html" : chemin));
    if (fichier !== racine && !fichier.startsWith(racine + path.sep)) {
      return new Response("Accès refusé", { status: 403 });
    }
    return net.fetch(pathToFileURL(fichier).toString());
  });
}

/**
 * FR : ⚠️ AJOUT (26/09/2026) - CORRECTIF : « OriginHeaderDoesNotMatchKey ».
 *
 * Bungie compare l'adresse d'origine des requêtes à celle déclarée sur le
 * portail développeur (`https://127.0.0.1:5173`). En développement, la page
 * vient justement de cette adresse : tout va bien. Mais dans le LOGICIEL
 * installé, la page est servie depuis l'adresse interne `app://local`
 * (nécessaire pour que le stockage soit conservé) : Bungie refuse alors
 * l'appel, ce qui cassait à la fois la connexion (erreur 400) et le
 * chargement du Manifest (sa version ne pouvait plus être demandée, d'où un
 * Manifest annoncé « non chargé » alors qu'il était bien en cache).
 *
 * On réécrit donc deux en-têtes, uniquement pour bungie.net :
 *  1. à l'ALLER, l'origine annoncée redevient celle déclarée sur le portail ;
 *  2. au RETOUR, l'autorisation renvoyée par Bungie est réécrite vers
 *     l'adresse interne, sinon le moteur d'affichage bloquerait la réponse.
 *
 * Les navigations de page (la fenêtre de connexion Bungie) sont exclues :
 * on ne touche qu'aux appels de données.
 *
 * EN: ⚠️ ADDED - FIX for "OriginHeaderDoesNotMatchKey". Bungie compares the
 * request Origin with the one registered on the developer portal. The
 * installed app serves its page from `app://local` (needed for persistent
 * storage), so Bungie rejected the calls - breaking both login (400) and the
 * Manifest (its version could no longer be fetched, so a cached Manifest was
 * reported as "not loaded"). We rewrite the Origin on the way out, and the
 * allow-origin header on the way back. Page navigations are excluded.
 */
const ORIGINE_DECLAREE = "https://127.0.0.1:5173";
const ORIGINE_APP = `${SCHEMA_APP}://local`;

function alignerOriginePourBungie() {
  const filtre = { urls: ["https://www.bungie.net/*"] };
  const navigations = new Set(["mainFrame", "subFrame"]);

  session.defaultSession.webRequest.onBeforeSendHeaders(filtre, (details, suite) => {
    if (navigations.has(details.resourceType)) return suite({ requestHeaders: details.requestHeaders });
    suite({ requestHeaders: { ...details.requestHeaders, Origin: ORIGINE_DECLAREE } });
  });

  session.defaultSession.webRequest.onHeadersReceived(filtre, (details, suite) => {
    if (navigations.has(details.resourceType)) return suite({ responseHeaders: details.responseHeaders });
    const entetes = { ...details.responseHeaders };
    // FR : les noms d'en-tête ne sont pas sensibles à la casse : on retire
    // toutes les variantes avant d'écrire la nôtre, sinon deux valeurs
    // contradictoires peuvent coexister et la réponse reste bloquée.
    // EN: header names are case-insensitive: drop every variant first.
    for (const nom of Object.keys(entetes)) {
      if (nom.toLowerCase() === "access-control-allow-origin") delete entetes[nom];
    }
    entetes["Access-Control-Allow-Origin"] = [ORIGINE_APP];
    suite({ responseHeaders: entetes });
  });
}

app.whenReady().then(() => {
  if (!enDev) {
    installerProtocoleApp();
    alignerOriginePourBungie();
  }
  creerFenetrePrincipale();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetrePrincipale();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
