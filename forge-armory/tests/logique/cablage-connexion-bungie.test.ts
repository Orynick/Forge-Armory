// FR : ⚠️ AJOUT (23/10/2026, v0.5.3) - test de CÂBLAGE (il lit le TEXTE du code)
// du correctif « fenêtre blanche à la connexion Bungie ». Ce bug ne se voit
// dans aucun test d'interface (il faut le logiciel INSTALLÉ, un vrai compte
// Bungie et un vrai fournisseur d'identité), donc la règle est protégée ici,
// sur le texte de `electron/main.cjs` :
//   1. la fenêtre de connexion a sa PROPRE session (partition), hors du filtre
//      « liste blanche » de la session principale ;
//   2. cette session dédiée est préparée AVANT le chargement de la page ;
//   3. la session dédiée n'a PAS de liste blanche d'hôtes (sinon un
//      fournisseur d'identité bloqué re-créerait le bug) ;
//   4. la partition est EN MÉMOIRE (pas de « persist: ») : aucun cookie Bungie
//      ne touche le disque ;
//   5. le filtre de la session principale (défense XSS) est CONSERVÉ, sur
//      `session.defaultSession`, uniquement dans le logiciel installé ;
//   6. la fenêtre garde ses autres protections : sandbox, pas de preload,
//      URL initiale validée (www.bungie.net uniquement) ;
//   7. le commentaire erroné (« les navigations ne passent pas par ce
//      filtre ») est corrigé : `onBeforeRequest` filtre AUSSI les navigations.
// EN: ⚠️ ADDED (v0.5.3) - wiring test (reads the code text) of the "blank
// window at Bungie login" fix. This bug shows in no UI test (it needs the
// INSTALLED app, a real Bungie account and a real identity provider), so the
// rule is protected here, on the text of `electron/main.cjs`.
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };

const main = fs.readFileSync("electron/main.cjs", "utf-8");
const sansCommentaires = main.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");

// ---------- 1. la fenêtre de connexion a sa PROPRE session ----------
ok("CÂBLAGE : la fenêtre de connexion déclare `partition: PARTITION_CONNEXION` dans ses webPreferences", /partition:\s*PARTITION_CONNEXION/.test(sansCommentaires));
ok("CÂBLAGE : la constante `PARTITION_CONNEXION` existe et vaut « connexion-bungie »", /const PARTITION_CONNEXION = "connexion-bungie"/.test(sansCommentaires), main.match(/const PARTITION_CONNEXION[^\n]*/));

// ---------- 2. la session dédiée est préparée AVANT le chargement ----------
const handler = main.slice(main.indexOf('ipcMain.handle("bungie:connexion"'));
const iPrep = handler.indexOf("preparerSessionConnexion();");
const iLoad = handler.indexOf("fenetreAuth.loadURL(");
ok("CÂBLAGE : `preparerSessionConnexion()` est appelé DANS le handler `bungie:connexion`, AVANT `fenetreAuth.loadURL(...)` (le filtre doit exister avant la première requête)", iPrep !== -1 && iLoad !== -1 && iPrep < iLoad, [iPrep, iLoad]);

// ---------- 3. la session dédiée n'a PAS de liste blanche d'hôtes ----------
const debutPrep = main.indexOf("function preparerSessionConnexion()");
const finPrep = main.indexOf("let fenetrePrincipale", debutPrep);
const corpsPrep = main.slice(debutPrep, finPrep === -1 ? undefined : finPrep);
ok("CÂBLAGE : `preparerSessionConnexion` n'utilise PAS `HOTES_AUTORISES` (aucune liste blanche d'hôtes : les fournisseurs d'identité sont imprévisibles, en bloquer un re-créerait la fenêtre blanche)", !/HOTES_AUTORISES/.test(corpsPrep));
ok("CÂBLAGE : la session dédiée n'accepte QUE http/https (un garde-fou sur le PROTOCOLE, pas sur l'hôte : `file:`, `chrome:`, etc. sont annulés)", /url\.protocol === "https:" \|\| url\.protocol === "http:"/.test(corpsPrep) && /rappel\(\{ cancel: true \}\)/.test(corpsPrep));
ok("CÂBLAGE : la session dédiée refuse TOUTE permission matérielle (handler ET check)", /setPermissionRequestHandler\(\(_contenu, _permission, rappel\) => rappel\(false\)\)/.test(corpsPrep) && /setPermissionCheckHandler\(\(\) => false\)/.test(corpsPrep));

// ---------- 4. la partition est EN MÉMOIRE ----------
ok("CÂBLAGE : la partition est sans « persist: » (session en mémoire : aucun cookie Bungie ne touche le disque)", /fromPartition\(PARTITION_CONNEXION\)/.test(corpsPrep) && !/fromPartition\(`persist:/.test(main) && !/fromPartition\("persist:/.test(main));

// ---------- 5. le filtre de la session principale est CONSERVÉ ----------
ok("CÂBLAGE : le filtre « liste blanche » de la session PRINCIPALE existe toujours (défense XSS), sur `session.defaultSession`", /function restreindreReseauSessionPrincipale\(\) \{\s*const ses = session\.defaultSession;/.test(main) && /HOTES_AUTORISES/.test(main));
ok("CÂBLAGE : le filtre principal s'applique UNIQUEMENT dans le logiciel installé (pas en développement)", /if \(!enDev\) \{\s*installerProtocoleApp\(\);\s*alignerOriginePourBungie\(\);[\s\S]{0,2000}restreindreReseauSessionPrincipale\(\);/.test(main));
ok("CÂBLAGE : le filtre principal annule toujours les requêtes hors liste (le `cancel: true` existe dans `restreindreReseauSessionPrincipale`)", /function restreindreReseauSessionPrincipale\(\)[\s\S]*?rappel\(\{ cancel: true \}\)/.test(main));

// ---------- 6. les autres protections de la fenêtre sont conservées ----------
const handlerCode = handler.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");
ok("CÂBLAGE : la fenêtre de connexion reste isolée : `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, et AUCUNE propriété `preload` (le mot n'apparaît que dans les commentaires)", /sandbox: true/.test(handlerCode) && /contextIsolation: true/.test(handlerCode) && /nodeIntegration: false/.test(handlerCode) && !/^\s*preload:/m.test(handlerCode));
ok("CÂBLAGE : l'URL initiale est toujours validée (https + www.bungie.net uniquement) avant ouverture", /urlValidee\.protocol !== "https:" \|\| urlValidee\.hostname !== "www\.bungie\.net"/.test(handler));
ok("CÂBLAGE : la redirection vers l'URL de retour est toujours interceptée (`will-redirect` ET `will-navigate`) et jamais chargée", /fenetreAuth\.webContents\.on\("will-redirect", traiterUrl\)/.test(handler) && /fenetreAuth\.webContents\.on\("will-navigate", traiterUrl\)/.test(handler) && /evenement\.preventDefault\(\); \/\/ FR : on ne charge JAMAIS cette adresse/.test(handler));

// ---------- 7. le commentaire erroné est corrigé ----------
ok("CÂBLAGE : le commentaire erroné est parti (« les navigations de page […] ne passent pas par ce filtre » / « Page navigations […] are unaffected ») : `onBeforeRequest` filtre AUSSI les navigations", !/ne passent pas par ce\s*filtre/.test(main) && !/are unaffected: they do not go through this filter/.test(main));
ok("CÂBLAGE : le commentaire corrigé explique le bug (mainFrame / navigations filtrées)", /resourceType \u00ab mainFrame \u00bb/.test(main) && /resourceType "mainFrame"/.test(main));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
