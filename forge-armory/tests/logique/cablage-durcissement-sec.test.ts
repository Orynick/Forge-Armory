// FR : ⛔ AJOUT (branche draft-sec) - test de CÂBLAGE (il lit le TEXTE du code)
// du durcissement jamais couvert : chiffrement des jetons (safeStorage),
// liste blanche réseau, permissions refusées. Ces mécanismes ne se voient dans
// aucun test d'interface (il faut le logiciel INSTALLÉ et l'OS de
// l'utilisateur), donc chaque règle est protégée ici, sur le texte des
// fichiers concernés :
//   1. `electron/main.cjs` : les quatre canaux `securite:*` réservés à la
//      fenêtre principale, chiffrement safeStorage avant écriture disque,
//      validations de clé/valeur ;
//   2. liste blanche réseau : les TROIS hôtes autorisés exactement, et rien
//      d'autre ; le filtre annule toute requête hors liste ; il n'est posé
//      que dans le logiciel installé (pas en dev) ;
//   3. permissions : refus TOTAL sur la session principale ET sur la session
//      de connexion ;
//   4. `electron/preload.cjs` : le pont expose les quatre fonctions ;
//   5. consommateurs : `oauth.ts` et `dim/apiKey.ts` passent par le stockage
//      chiffré (jamais d'écriture directe des jetons dans localStorage) et
//      `main.tsx` lance l'init avant le premier rendu.
// EN: wiring test (reads the code text) of the never-covered hardening:
// safeStorage token encryption, network whitelist, denied permissions. Each
// rule is protected here on the text of the relevant files.
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };
const sansCommentaires = (t: string) => t.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");

const main = sansCommentaires(fs.readFileSync("electron/main.cjs", "utf-8"));
const preload = sansCommentaires(fs.readFileSync("electron/preload.cjs", "utf-8"));
const oauth = fs.readFileSync("src/lib/bungie/oauth.ts", "utf-8");
const apiKey = fs.readFileSync("src/lib/dim/apiKey.ts", "utf-8");
const mainTsx = fs.readFileSync("src/main.tsx", "utf-8");
const stockage = fs.readFileSync("src/lib/stockageSecurise.ts", "utf-8");

// ---------- 1. canaux securite:* du processus principal ----------
for (const canal of ["securite:disponible", "securite:lire", "securite:ecrire", "securite:effacer"]) {
  ok(`CÂBLAGE : le canal IPC « ${canal} » est bien enregistré (ipcMain.handle)`, main.includes(`ipcMain.handle("${canal}"`));
}
const extraireCanal = (nom: string) => main.slice(main.indexOf(`ipcMain.handle("${nom}"`), main.indexOf("ipcMain.handle", main.indexOf(`ipcMain.handle("${nom}"`) + 1) > 0 ? main.indexOf("ipcMain.handle", main.indexOf(`ipcMain.handle("${nom}"`) + 1) : main.length);
for (const nom of ["securite:lire", "securite:ecrire", "securite:effacer"]) {
  ok(`CÂBLAGE : « ${nom} » refuse tout expéditeur autre que la fenêtre principale`, extraireCanal(nom).includes("evenement.sender !== fenetrePrincipale.webContents"));
}
ok("CÂBLAGE : l'écriture chiffre avec safeStorage.encryptString avant de toucher au disque", extraireCanal("securite:ecrire").includes("safeStorage.encryptString(valeur)"));
ok("CÂBLAGE : la lecture déchiffre avec safeStorage.decryptString", extraireCanal("securite:lire").includes("safeStorage.decryptString("));
ok("CÂBLAGE : les valeurs chiffrées transitent en base64 (Buffer.from(..., \"base64\") / toString(\"base64\"))", extraireCanal("securite:lire").includes('Buffer.from(brut, "base64")') && extraireCanal("securite:ecrire").includes('toString("base64")'));
ok("CÂBLAGE : clé et valeur sont validées (types + bornes de longueur) avant toute écriture", extraireCanal("securite:ecrire").includes('typeof cle !== "string"') && extraireCanal("securite:ecrire").includes('typeof valeur !== "string"'));
ok("CÂBLAGE : le coffre indisponible ne renvoie jamais de valeur (isEncryptionAvailable vérifié)", main.includes("safeStorage.isEncryptionAvailable()"));

// ---------- 2. liste blanche réseau ----------
const blocHotes = main.slice(main.indexOf("const HOTES_AUTORISES"), main.indexOf("]", main.indexOf("const HOTES_AUTORISES")));
ok("CÂBLAGE : la liste blanche réseau contient EXACTEMENT les trois hôtes (Bungie, DIM, GitHub)", blocHotes.includes("https://www.bungie.net") && blocHotes.includes("https://api.destinyitemmanager.com") && blocHotes.includes("https://api.github.com") && !blocHotes.includes("http://"));
ok("CÂBLAGE : aucun hôte ajouté en plus des trois autorisés", (blocHotes.match(/https:/g) ?? []).length === 3, blocHotes);
const blocRestreindre = main.slice(main.indexOf("function restreindreReseauSessionPrincipale"), main.indexOf("function alignerOriginePourBungie"));
ok("CÂBLAGE : toute requête hors liste blanche est ANNULÉE (rappel({ cancel: true }))", blocRestreindre.includes("rappel({ cancel: true })"));
ok("CÂBLAGE : les protocoles non-web (file:, chrome:, ws:…) sont refusés hors dev", blocRestreindre.includes('url.protocol !== "https:" && url.protocol !== "http:"'));
ok("CÂBLAGE : le filtre n'est posé que dans le logiciel installé (appel sous `if (!enDev)`)", main.slice(main.indexOf("app.whenReady")).includes("if (!enDev)") && main.slice(main.indexOf("app.whenReady")).includes("restreindreReseauSessionPrincipale();"));

// ---------- 3. permissions refusées ----------
ok("CÂBLAGE : la session principale refuse TOUTE permission (setPermissionRequestHandler → false)", blocRestreindre.includes("setPermissionRequestHandler((_contenu, _permission, rappel) => rappel(false))"));
ok("CÂBLAGE : la session principale refuse aussi les vérifications (setPermissionCheckHandler → false)", blocRestreindre.includes("setPermissionCheckHandler(() => false)"));
const blocSessionConnexion = main.slice(main.indexOf("function preparerSessionConnexion"), main.indexOf("let fenetrePrincipale"));
ok("CÂBLAGE : la session de connexion refuse TOUTE permission matérielle", blocSessionConnexion.includes("rappel(false)") && blocSessionConnexion.includes("setPermissionCheckHandler(() => false)"));

// ---------- 4. pont preload ----------
ok("CÂBLAGE : le pont expose stockageSecurise avec ses quatre fonctions", /stockageSecurise:\s*\{/.test(preload) && preload.includes("securite:disponible") && preload.includes("securite:lire") && preload.includes("securite:ecrire") && preload.includes("securite:effacer"));

// ---------- 5. consommateurs ----------
ok("CÂBLAGE : oauth.ts lit/écrit/efface les jetons via le stockage chiffré (lireEnCache/ecrireSecret/effacerSecret)", oauth.includes("ecrireSecret(STORAGE_KEY") && oauth.includes("lireEnCache(STORAGE_KEY") && oauth.includes("effacerSecret(STORAGE_KEY"));
ok("CÂBLAGE : oauth.ts n'écrit JAMAIS les jetons directement dans localStorage", !/localStorage\.setItem\(STORAGE_KEY/.test(sansCommentaires(oauth)));
ok("CÂBLAGE : dim/apiKey.ts passe la clé DIM par le stockage chiffré", apiKey.includes("ecrireSecret(CLE_STOCKAGE,"));
ok("CÂBLAGE : l'id d'app DIM (non secret) reste le seul à vivre en localStorage direct", /localStorage\.setItem\(CLE_STOCKAGE_ID/.test(apiKey) && !/localStorage\.setItem\(CLE_STOCKAGE,/.test(apiKey));
ok("CÂBLAGE : main.tsx lance initialiserStockageSecurise() avant le premier rendu", mainTsx.includes("initialiserStockageSecurise"));
ok("CÂBLAGE : les clés des consommateurs correspondent à CLES_SECRETS du module", stockage.includes('"d2ba.bungie.tokens"') && oauth.includes('const STORAGE_KEY = "d2ba.bungie.tokens"') && apiKey.includes('const CLE_STOCKAGE = "d2ba.dim.apiKey"'));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
