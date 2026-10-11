"use strict";
// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - DOSSIER DE DONNÉES du logiciel, figé au moment du renommage en
// « Forge Armory ». Electron range tout ce que l'appli retient (builds enregistrés, pondérations, cache
// du Manifest, session Bungie) dans un dossier de `%APPDATA%` dont le nom DÉPEND DU NOM DE L'APPLICATION.
// Changer le nom du logiciel pouvait donc faire chercher un AUTRE dossier, vide : l'utilisateur aurait
// cru avoir perdu ses builds (ils seraient restés dans l'ancien dossier, sans être lus).
//
// On ne sait pas d'avance lequel des deux noms Electron utilisait sur le poste de l'utilisateur
// (`d2-build-analyzer`, le `name` de package.json, ou `D2 Build Analyzer`, le `productName` de la
// configuration d'installation) : cela dépend de la façon dont l'installateur renseigne le nom de
// l'application, et rien dans le projet ne l'avait relevé. Plutôt que de parier, on REGARDE au
// démarrage lequel de ces dossiers existe et contient des données, et on le garde, quel que soit le
// nom officiel du logiciel. Rien n'est déplacé, copié ni supprimé : on indique seulement à Electron
// où lire.
//
// Règles, dans l'ordre :
//   1. un seul ancien dossier contient des données -> c'est lui ;
//   2. plusieurs en contiennent -> celui dont les données ont été modifiées le plus récemment ;
//   3. aucun ancien dossier, mais un dossier au nom « Forge Armory » en contient -> celui-là ;
//   4. aucun (installation neuve) -> `d2-build-analyzer`, un nom stable, qui ne dépendra plus du
//      nom commercial.
// Un ancien dossier avec des données PASSE TOUJOURS avant un dossier « Forge Armory » : celui-ci ne peut
// provenir que d'un lancement sans cette protection, donc vide ou presque.
// Fonctions sans dépendance à Electron : testées hors du logiciel, sur de vrais dossiers.
// EN: ⚠️ ADDED - the app's DATA FOLDER, frozen at the "Forge Armory" rename. Electron stores everything
// the app remembers in an `%APPDATA%` folder named after the application, so renaming could point to an
// EMPTY folder. We don't know which legacy name Electron used on the user's machine, so at startup we LOOK
// at which exists and holds data, and keep it. Nothing is moved, copied or deleted.

const path = require("node:path");

/** FR : noms que Electron a pu utiliser avant le renommage, par ordre de préférence en cas d'égalité. / EN: names Electron may have used before the rename. */
const NOMS_ANCIENS = ["d2-build-analyzer", "D2 Build Analyzer"];
/** FR : nom commercial actuel (il ne doit JAMAIS faire perdre de données : voir règles). / EN: current product name. */
const NOM_NOUVEAU = "Forge Armory";
/** FR : sous-dossiers que Chromium crée dès que l'appli a tourné : ils indiquent un dossier « habité ». / EN: sub-folders Chromium creates once the app has run. */
const TEMOINS = ["Local Storage", "IndexedDB"];

function aDesDonnees(dossier, systeme) {
  return TEMOINS.some((t) => systeme.existe(path.join(dossier, t)));
}

/** FR : date de dernière modification des données d'un dossier (0 s'il n'en a pas). / EN: last modification of a folder's data. */
function dateDonnees(dossier, systeme) {
  return Math.max(0, ...TEMOINS.map((t) => systeme.modifieLe(path.join(dossier, t))));
}

/**
 * FR : choisit le dossier de données. `appData` = `%APPDATA%` ; `systeme` = { existe(chemin), modifieLe(chemin) }
 * (injecté pour pouvoir tester). Renvoie le dossier et la raison du choix.
 * EN: picks the data folder.
 */
function choisirDossierDonnees(appData, systeme) {
  const anciens = NOMS_ANCIENS.map((n) => path.join(appData, n));
  const habites = anciens.filter((d) => aDesDonnees(d, systeme));
  if (habites.length === 1) return { dossier: habites[0], raison: "ancien dossier de données trouvé" };
  if (habites.length > 1) {
    // FR : tri stable : à date égale, l'ordre de préférence de NOMS_ANCIENS est conservé.
    const tries = habites.map((d, i) => ({ d, i, t: dateDonnees(d, systeme) })).sort((a, b) => b.t - a.t || a.i - b.i);
    return { dossier: tries[0].d, raison: "plusieurs anciens dossiers : le plus récemment utilisé" };
  }
  const nouveau = path.join(appData, NOM_NOUVEAU);
  if (aDesDonnees(nouveau, systeme)) return { dossier: nouveau, raison: "dossier au nom actuel déjà utilisé" };
  return { dossier: anciens[0], raison: "installation neuve : dossier stable indépendant du nom commercial" };
}

/**
 * FR : accès réel au disque. La « date » d'un dossier de données est celle de son FICHIER le plus récent, sur
 * deux niveaux de profondeur (Chromium écrit dans `Local Storage/leveldb/*.log`, `IndexedDB/*.leveldb/*`...). Les
 * dates des dossiers EUX-MÊMES ne comptent pas : elles ne bougent qu'à la création ou à la suppression d'un fichier
 * (ce qui reste une activité, mais l'ordre à la milliseconde près de deux créations ne signifie rien : défaut trouvé
 * le 05/10/2026 par un test instable, qui ne passait que quand deux dossiers étaient créés dans la même milliseconde).
 * EN: real disk access. A data folder's "date" is that of its newest FILE, two levels deep; folders' own dates are
 * ignored (found by a flaky test: it only passed when two folders were created in the same millisecond).
 */
function systemeReel(fs = require("node:fs")) {
  const plusRecentFichier = (p, profondeur) => {
    let max = 0;
    let enfants = [];
    try {
      enfants = fs.readdirSync(p);
    } catch {
      return 0;
    }
    for (const e of enfants) {
      const chemin = path.join(p, e);
      try {
        const info = fs.statSync(chemin);
        if (info.isFile()) max = Math.max(max, info.mtimeMs);
        else if (info.isDirectory() && profondeur > 0) max = Math.max(max, plusRecentFichier(chemin, profondeur - 1));
      } catch {
        /* entrée illisible ou disparue : ignorée / unreadable or vanished entry: ignored */
      }
    }
    return max;
  };
  return {
    existe: (p) => {
      try {
        return fs.statSync(p).isDirectory();
      } catch {
        return false;
      }
    },
    modifieLe: (p) => plusRecentFichier(p, 2),
  };
}

module.exports = { NOMS_ANCIENS, NOM_NOUVEAU, TEMOINS, choisirDossierDonnees, systemeReel };
