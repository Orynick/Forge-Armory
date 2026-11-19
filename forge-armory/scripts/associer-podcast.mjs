// FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - apparie les MP3
// BRUTS de l'utilisateur avec les pages du Legendarium, SANS devinette.
//
// Problème résolu : l'utilisateur enregistre sa voix dans Audacity (un MP3 par
// page, nommé librement, ex: « chapitre 1.mp3 », « 2026-10-23 page 3.mp3 »…).
// Le lecteur attend la convention verrouillée `lore-<hash>.mp3` /
// `grimoire-<id>.mp3`. Ce script fait le PONT : à partir d'un FICHIER TEXTE
// d'associations (un identifiant de page par ligne, dans l'ORDRE des MP3 triés
// alphabétiquement), il RENOMME chaque MP3 selon la convention, en mode
// SIMULATION par défaut (--appliquer pour de vrai), puis régénère l'index.
//
// Fichier d'associations : `public/podcast/association.txt` (ignoré par git,
// personnel). Format :
//   - une ligne = un MP3, DANS L'ORDRE ALPHABÉTIQUE des noms de fichiers ;
//   - la ligne = l'identifiant de la page (`lore:1716568313` ou
//     `grimoire:603020342`) ;
//   - lignes vides et lignes commençant par `#` ignorées.
//
// Sécurité : le script ne SUPPRIME ni n'ÉCRASE jamais un fichier existant —
// si le nom cible existe déjà (et n'est pas le fichier source), l'association
// est refusée et signalée. --appliquer est explicite.
// EN: ADDED (draft-podcast, follow-up) - matches the user's RAW MP3s with
// Legendarium pages, NO guessing. Given an associations TEXT file (one page id
// per line, in the ALPHABETICAL order of the MP3 file names), it RENAMES each
// MP3 per the locked convention, in DRY-RUN mode by default (--appliquer to
// really apply), then regenerates the index. The script never deletes nor
// overwrites an existing file.
import fs from "node:fs";
import path from "node:path";
import { genererIndex, nomCiblePourPage } from "./generer-index-podcast.mjs";

/** FR : lit le fichier d'associations : renvoie la liste des identifiants (lignes utiles, dans l'ordre). / EN: reads the associations file: returns the list of ids (useful lines, in order). */
export function lireAssociation(chemin) {
  if (!fs.existsSync(chemin)) return [];
  return fs
    .readFileSync(chemin, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));
}

/** FR : calcule le plan de renommage (sans rien écrire). Renvoie `{ plan, erreurs }` : le plan = [{ source, cible, idPage }], les erreurs = [{ source, idPage, raison }]. / EN: computes the rename plan (writes nothing). Returns `{ plan, erreurs }`. */
export function calculerPlan(dossier, association) {
  // FR : MP3 « bruts » = ceux qui ne suivent PAS la convention (nom cible ≠ nom actuel). Les MP3 déjà nommés `lore-<hash>.mp3` / `grimoire-<id>.mp3` sont exclus (rien à renommer).
  // EN: "raw" MP3s = those NOT following the convention (target name ≠ current name). MP3s already named `lore-<hash>.mp3` / `grimoire-<id>.mp3` are excluded (nothing to rename).
  const dejaConformes = new Set(
    fs
      .readdirSync(dossier)
      .filter((f) => f.toLowerCase().endsWith(".mp3"))
      .filter((f) => nomCiblePourPage(f.slice(0, -4).replace(/^(lore|grimoire)-/, "$1:")) === f)
  );
  const mp3 = fs
    .readdirSync(dossier)
    .filter((f) => f.toLowerCase().endsWith(".mp3") && !dejaConformes.has(f))
    .sort();
  const plan = [];
  const erreurs = [];
  if (association.length !== mp3.length) {
    erreurs.push({ source: null, idPage: null, raison: `nombre d'associations (${association.length}) ≠ nombre de MP3 à renommer (${mp3.length})` });
  }
  const n = Math.min(association.length, mp3.length);
  for (let i = 0; i < n; i++) {
    const source = mp3[i];
    const idPage = association[i];
    const cible = nomCiblePourPage(idPage);
    if (!cible) {
      erreurs.push({ source, idPage, raison: `identifiant invalide (attendu : lore:<hash> ou grimoire:<id>)` });
      continue;
    }
    if (fs.existsSync(path.join(dossier, cible)) && cible !== source) {
      erreurs.push({ source, idPage, raison: `le fichier cible existe déjà : ${cible}` });
      continue;
    }
    plan.push({ source, cible, idPage });
  }
  return { plan, erreurs, mp3 };
}

/** FR : applique le plan (renommages) dans `dossier`. / EN: applies the plan (renames) in `dossier`. */
export function appliquerPlan(dossier, plan) {
  for (const { source, cible } of plan) {
    fs.renameSync(path.join(dossier, source), path.join(dossier, cible));
  }
}

// FR : ⚠️ le script ne s'exécute QUE lorsqu'on le lance lui-même (son NOM est
// celui du fichier lancé — même garde que `generer-logos-export.mjs`, qui a déjà
// évité qu'un test empaqueté ne le déclenche sans le vouloir). Dans un bundle
// de test esbuild, les modules sont fusionnés : le nom du fichier lancé est
// celui du TEST, pas du script → la garde est fausse → rien ne s'exécute.
// EN: the script only runs when launched directly (its NAME is the launched
// file's name — same guard as `generer-logos-export.mjs`).
export const LANCE_DIRECTEMENT = path.basename(process.argv[1] ?? "") === "associer-podcast.mjs";
if (LANCE_DIRECTEMENT) {
  const racine = process.cwd();
  const dossier = path.join(racine, "public", "podcast");
  const cheminAssociation = path.join(dossier, "association.txt");
  const appliquer = process.argv.includes("--appliquer");

  console.log("🎧 Association podcast — MP3 bruts → pages du Legendarium\n");
  if (!fs.existsSync(cheminAssociation)) {
    console.error(`fichier d'associations introuvable : ${path.relative(racine, cheminAssociation)}`);
    console.error("Créez-le : une ligne = un MP3 (ordre alphabétique des noms), la ligne = l'identifiant de la page (bouton « copier l'id » du lecteur en dev).");
    process.exit(1);
  }

  const association = lireAssociation(cheminAssociation);
  const { plan, erreurs, mp3 } = calculerPlan(dossier, association);

  console.log(`MP3 à renommer (triés) : ${mp3.length}`);
  for (const f of mp3) console.log(`  • ${f}`);
  console.log(`\nAssociations lues : ${association.length}`);

  if (plan.length > 0) {
    console.log(`\n${appliquer ? "Renommages appliqués" : "SIMULATION — renommages prévus"} :`);
    for (const { source, cible, idPage } of plan) console.log(`  ${appliquer ? "✔" : "→"} ${source}  →  ${cible}   (${idPage})`);
  }
  if (erreurs.length > 0) {
    console.error(`\n❌ ${erreurs.length} erreur(s) :`);
    for (const e of erreurs) console.error(`  • ${e.source ?? "—"} : ${e.raison}`);
  }

  if (!appliquer) {
    if (erreurs.length === 0 && plan.length > 0) {
      console.log("\nRelancez avec --appliquer pour effectuer les renommages, puis l'index sera régénéré.");
    }
    process.exit(erreurs.length > 0 ? 1 : 0);
  }

  if (erreurs.length > 0) {
    console.error("\nAucun renommage appliqué (des erreurs bloquent le plan). Corrigez association.txt.");
    process.exit(1);
  }

  appliquerPlan(dossier, plan);
  fs.rmSync(cheminAssociation, { force: true }); // consommé : ne pas le réutiliser par erreur
  const { nb } = genererIndex(dossier);
  console.log(`\n✅ ${plan.length} renommage(s) effectué(s), index régénéré (${nb} enregistrement(s)).`);
}
