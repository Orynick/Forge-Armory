// FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - test du script
// d'OPTIMISATION podcast (`scripts/optimiser-podcast.mjs`) : ré-encodage des MP3
// en mono 64 kbps CBR pour la voix (le manuel Audacity : « 64 kbps CBR mono peut
// donner une qualité raisonnable pour la voix »). On teste les fonctions PURES
// (tailleLisible, trouverFfmpeg, reencoderUnFichier avec un ffmpeg factice,
// dureeViaFfprobe) + le câblage (npm script, .gitignore, procédure de repli
// affichée quand ffmpeg est absent, simulation par défaut, originaux sauvegardés).
// EN: ADDED (draft-podcast, follow-up) - test of the podcast OPTIMIZATION script
// (`scripts/optimiser-podcast.mjs`): re-encoding MP3s to mono 64 kbps CBR for
// voice (Audacity manual: "64 kbps CBR mono can give reasonable quality for
// voice"). We test the PURE functions + the wiring.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tailleLisible, trouverFfmpeg, reencoderUnFichier, dureeViaFfprobe } from "../../scripts/optimiser-podcast.mjs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 500)); };

// ---------- 1. tailleLisible ----------
ok("OPTIMISER : tailleLisible formate octets/Ko/Mo",
  tailleLisible(500) === "500 o" && tailleLisible(2048) === "2.0 Ko" && tailleLisible(460 * 1024 * 1024) === "460.0 Mo", [tailleLisible(500), tailleLisible(2048), tailleLisible(460 * 1024 * 1024)]);

// ---------- 2. trouverFfmpeg ----------
{
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-opt-"));
  const sauveEnv = process.env.FFMPEG;
  delete process.env.FFMPEG;
  const sansRien = trouverFfmpeg(dossier);
  process.env.FFMPEG = "/chemin/vers/ffmpeg.exe";
  const viaEnv = trouverFfmpeg(dossier);
  if (sauveEnv === undefined) delete process.env.FFMPEG; else process.env.FFMPEG = sauveEnv;
  ok("OPTIMISER : trouverFfmpeg respecte la variable d'environnement FFMPEG (chemin prioritaire)",
    viaEnv === "/chemin/vers/ffmpeg.exe", viaEnv);
  ok("OPTIMISER : trouverFfmpeg renvoie null quand rien n'est disponible (le script affichera alors la procédure Audacity de repli)",
    sansRien === null || sansRien === "ffmpeg", sansRien); // "ffmpeg" acceptable si présent sur la machine de test
  fs.rmSync(dossier, { recursive: true, force: true });
}

// ---------- 3. reencoderUnFichier avec un ffmpeg FACTICE ----------
{
  // ffmpeg factice : un script node qui copie l'entrée vers la sortie (le test
  // vérifie les ARGUMENTS passés : -ac 1, -ar 44100, -b:a 64k).
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-opt2-"));
  const logArgs = path.join(dossier, "args.json");
  const fauxFfmpeg = path.join(dossier, "faux-ffmpeg.mjs");
  fs.writeFileSync(fauxFfmpeg, `import fs from "node:fs";\nconst args = process.argv.slice(2);\nfs.writeFileSync(${JSON.stringify(logArgs)}, JSON.stringify(args));\nconst i = args.indexOf("-i"); const src = args[i + 1]; const dst = args[args.length - 1];\nfs.copyFileSync(src, dst);\n`, "utf-8");
  const source = path.join(dossier, "source.mp3");
  fs.writeFileSync(source, "contenu-factice");
  const cible = path.join(dossier, "cible.mp3");
  const taille = reencoderUnFichier(`node ${fauxFfmpeg}`, source, cible, 64);
  ok("OPTIMISER : reencoderUnFichier produit le fichier cible (taille renvoyée)",
    taille === fs.statSync(cible).size && taille > 0, taille);
  const args = JSON.parse(fs.readFileSync(logArgs, "utf-8"));
  ok("OPTIMISER : le ré-encodage force MONO (-ac 1), 44100 Hz (-ar), CBR 64 kbps (-b:a 64k) — la cible voix du manuel Audacity",
    args.includes("-ac") && args[args.indexOf("-ac") + 1] === "1" && args[args.indexOf("-ar") + 1] === "44100" && args[args.indexOf("-b:a") + 1] === "64k", args);
  ok("OPTIMISER : le bitrate est paramétrable (--bitrate 96 → -b:a 96k)",
    (() => { reencoderUnFichier(`node ${fauxFfmpeg}`, source, cible, 96); const a = JSON.parse(fs.readFileSync(logArgs, "utf-8")); return a[a.indexOf("-b:a") + 1] === "96k"; })());
  fs.rmSync(dossier, { recursive: true, force: true });
}

// ---------- 4. reencoderUnFichier : échec ffmpeg → erreur levée (pas de fichier cible écrasé) ----------
{
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-opt3-"));
  const fauxFfmpeg = path.join(dossier, "faux-ffmpeg.mjs");
  fs.writeFileSync(fauxFfmpeg, `process.exit(1);\n`, "utf-8");
  const source = path.join(dossier, "source.mp3");
  fs.writeFileSync(source, "x");
  let erreur = false;
  try { reencoderUnFichier(`node ${fauxFfmpeg}`, source, path.join(dossier, "cible.mp3"), 64); } catch { erreur = true; }
  ok("OPTIMISER : un échec ffmpeg lève une erreur (le script ne remplace PAS l'original par un fichier cassé)",
    erreur && !fs.existsSync(path.join(dossier, "cible.mp3")));
  fs.rmSync(dossier, { recursive: true, force: true });
}

// ---------- 5. Câblage ----------
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
ok("CÂBLAGE : le script npm `podcast:optimiser` existe",
  pkg.scripts?.["podcast:optimiser"] === "node scripts/optimiser-podcast.mjs", pkg.scripts);

const gitignore = fs.readFileSync(".gitignore", "utf-8");
ok("CÂBLAGE : .gitignore exclut les originaux sauvegardés (`public/podcast/originaux/`)",
  /^public\/podcast\/originaux\/$/m.test(gitignore));

const src = fs.readFileSync("scripts/optimiser-podcast.mjs", "utf-8");
ok("CÂBLAGE : la simulation est le comportement PAR DÉFAUT (--appliquer explicite pour modifier)",
  /const appliquer = args\.includes\("--appliquer"\)/.test(src) && /if \(!appliquer\)/.test(src));
ok("CÂBLAGE : les originaux sont SAUVEGARDÉS (déplacés dans originaux/), jamais supprimés",
  /fs\.renameSync\(source, path\.join\(dossierOriginaux, f\)\)/.test(src) && !/fs\.rmSync\(source\)/.test(src) && !/unlinkSync\(source\)/.test(src));
ok("CÂBLAGE : le script affiche la procédure Audacity de repli quand ffmpeg est absent (mono + normaliser + CBR 64 kbps)",
  /ffmpeg est INTROUVABLE/.test(src) && /Mixage stéréo vers mono/.test(src) && /Normaliser/.test(src) && /Constant \(CBR\)/.test(src));
ok("CÂBLAGE : le script ne s'exécute que lancé directement (garde par nom de fichier)",
  /LANCE_DIRECTEMENT = path\.basename\(process\.argv\[1\] \?\? ""\) === "optimiser-podcast\.mjs"/.test(src));
ok("CÂBLAGE : le script régénère l'index après optimisation (--appliquer)",
  /genererIndex\(dossier\)/.test(src));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
