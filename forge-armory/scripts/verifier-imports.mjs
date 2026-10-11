// FR : Vérifie que TOUS les imports de fichiers LOCAUX se résolvent.
//
// ⚠️ POURQUOI CE SCRIPT EXISTE (05/08/2026) - un import inventé
// (`./auth` au lieu de `./oauth`) a cassé le démarrage de l'appli chez
// l'utilisateur, sans que la compilation TypeScript ne le signale : le
// filtre habituel masque les erreurs « Cannot find module », qui sont
// normalement des faux positifs dus à l'absence de `node_modules` dans
// l'environnement de développement. Ces faux positifs cachaient une VRAIE
// erreur. Un second import cassé (BadgeContexte.tsx) a été trouvé du même
// coup, passé inaperçu depuis la veille.
//
// Ce script ne regarde QUE les chemins relatifs (commençant par « . »),
// donc il ignore les dépendances npm et n'a aucun faux positif.
//
// Utilisation : node scripts/verifier-imports.mjs
//
// EN: Checks that ALL LOCAL file imports resolve. Exists because an invented
// import broke the app's startup without TypeScript flagging it: the usual
// filter hides "Cannot find module" errors, normally false positives from a
// missing `node_modules`. Those false positives were hiding a REAL error.
// Only looks at relative paths, so npm dependencies are ignored - no false
// positives.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, normalize } from "node:path";

function listerFichiers(dossier) {
  const resultats = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) resultats.push(...listerFichiers(chemin));
    else if (/\.(ts|tsx)$/.test(entree)) resultats.push(chemin);
  }
  return resultats;
}

const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx", ".css", ""];
const erreurs = [];

for (const chemin of listerFichiers("src")) {
  const contenu = readFileSync(chemin, "utf8");
  const dossier = dirname(chemin);
  for (const m of contenu.matchAll(/from\s+"(\.[^"]+)"/g)) {
    const cible = m.group?.(1) ?? m[1];
    const resolu = normalize(join(dossier, cible));
    if (!EXTENSIONS.some((ext) => existsSync(resolu + ext))) {
      const ligne = contenu.slice(0, m.index).split("\n").length;
      erreurs.push(`${chemin}:${ligne} -> "${cible}" INTROUVABLE`);
    }
  }
}

if (erreurs.length > 0) {
  console.error(`\n❌ ${erreurs.length} import(s) local(aux) cassé(s) :\n`);
  for (const e of erreurs) console.error("   " + e);
  process.exit(1);
}
console.log("✅ Tous les imports locaux se résolvent correctement.");
