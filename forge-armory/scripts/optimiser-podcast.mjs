// FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - OPTIMISE les MP3
// du podcast pour la voix : ré-encode chaque fichier en MONO 64 kbps CBR
// (qualité « raisonnable » pour de la parole selon le manuel Audacity ;
// 96 kbps = « excellente » — voir --bitrate). Conçu pour être lancé DEPUIS
// Audacity (Outils → « Exécuter une commande » / « Run Macro » sur un dossier),
// ou en ligne de commande.
//
// Usage :
//   node scripts/optimiser-podcast.mjs [--dossier <chemin>] [--bitrate 96] [--appliquer]
//   - sans --appliquer : SIMULATION (affiche les gains prévus, ne touche rien) ;
//   - --dossier : dossier des MP3 (défaut : public/podcast) ;
//   - --bitrate : débit cible en kbps (défaut 64, max recommandé 96 pour la voix).
//
// Sans ffmpeg installé : le script affiche la procédure Audacity équivalente
// (Piste → Mixage stéréo vers mono, Effets → Normaliser, Fichier → Exporter →
// MP3, CBR, 64 kbps) et sort SANS rien modifier.
//
// Sécurité : les originaux sont déplacés dans `<dossier>/originaux/` (jamais
// supprimés). Le script ne touche que les MP3, et refuse d'écraser quoi que ce
// soit. Il régénère l'index à la fin (--appliquer).
// EN: ADDED (draft-podcast, follow-up) - OPTIMIZES the podcast MP3s for voice:
// re-encodes each file to MONO 64 kbps CBR (per the Audacity manual, "reasonable"
// quality for voice; 96 kbps = "excellent" — see --bitrate). Designed to be run
// FROM Audacity (Tools → "Run command" / macro on a folder), or from the command
// line. Originals are moved to `<dossier>/originaux/` (never deleted).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { genererIndex } from "./generer-index-podcast.mjs";

/** FR : durée d'un fichier en secondes via ffprobe (même dossier que ffmpeg). Renvoie null si indisponible. / EN: file duration in seconds via ffprobe (same folder as ffmpeg). Returns null if unavailable. */
export function dureeViaFfprobe(ffmpeg, fichier) {
  if (!ffmpeg) return null;
  const ffprobe = ffmpeg === "ffmpeg" ? "ffprobe" : ffmpeg.replace(/ffmpeg(\.exe)?$/, "ffprobe$1");
  const r = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", fichier], { encoding: "utf-8" });
  if (r.status !== 0) return null;
  const d = Number((r.stdout ?? "").trim());
  return Number.isFinite(d) && d > 0 ? d : null;
}

/** FR : trouve un binaire ffmpeg : variable d'env FFMPEG, ffmpeg dans le PATH, ou ffmpeg.exe à côté du dossier (téléchargé par l'utilisateur pour Audacity). Renvoie null si absent. / EN: finds an ffmpeg binary: FFMPEG env var, ffmpeg on PATH, or ffmpeg.exe next to the folder (downloaded by the user for Audacity). Returns null if absent. */
export function trouverFfmpeg(dossier) {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const dansPath = spawnSync("ffmpeg", ["-version"], { encoding: "utf-8" });
  if (!dansPath.error && dansPath.status === 0) return "ffmpeg";
  const local = path.join(dossier, "ffmpeg.exe");
  if (process.platform === "win32" && fs.existsSync(local)) return local;
  return null;
}

/** FR : taille lisible (Ko/Mo). / EN: human-readable size. */
export function tailleLisible(octets) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
}

/** FR : ré-encode UN fichier en mono CBR via ffmpeg (fichier temporaire, puis remplacement). `commande` = binaire ffmpeg OU une commande complète (ex: `node script-factice.mjs` pour les tests) : on la découpe sur les espaces. Renvoie la taille du résultat. / EN: re-encodes ONE file to mono CBR via ffmpeg (temp file, then replace). `commande` = the ffmpeg binary OR a full command (e.g. `node fake-script.mjs` for tests): it is split on spaces. Returns the result size. */
export function reencoderUnFichier(commande, source, cible, bitrate) {
  const args = [...commande.split(/\s+/), "-y", "-i", source, "-ac", "1", "-ar", "44100", "-b:a", `${bitrate}k`, "-write_xing", "1", cible];
  const r = spawnSync(args[0], args.slice(1), { encoding: "utf-8" });
  if (r.status !== 0) throw new Error((r.stderr ?? "").slice(-300));
  return fs.statSync(cible).size;
}

const LANCE_DIRECTEMENT = path.basename(process.argv[1] ?? "") === "optimiser-podcast.mjs";
if (LANCE_DIRECTEMENT) {
  const racine = process.cwd();
  const args = process.argv.slice(2);
  const dossier = args.includes("--dossier")
    ? path.resolve(racine, args[args.indexOf("--dossier") + 1])
    : path.join(racine, "public", "podcast");
  const bitrate = Number(args.includes("--bitrate") ? args[args.indexOf("--bitrate") + 1] : 64);
  const appliquer = args.includes("--appliquer");

  console.log(`🎧 Optimisation podcast — voix : MONO ${bitrate} kbps CBR\n`);

  const ffmpeg = trouverFfmpeg(dossier);
  const mp3 = fs.existsSync(dossier) ? fs.readdirSync(dossier).filter((f) => f.toLowerCase().endsWith(".mp3")).sort() : [];

  if (mp3.length === 0) {
    console.log("Aucun MP3 dans le dossier. Rien à faire.");
    process.exit(0);
  }

  // Tailles actuelles + durée estimée via ffprobe quand dispo (sinon durée inconnue).
  let totalAvant = 0;
  const lignes = [];
  for (const f of mp3) {
    const taille = fs.statSync(path.join(dossier, f)).size;
    totalAvant += taille;
    lignes.push({ f, taille, duree: dureeViaFfprobe(ffmpeg, path.join(dossier, f)) });
  }
  const totalMinutes = lignes.reduce((n, l) => n + (l.duree ?? 0), 0) / 60;
  console.log(`${mp3.length} MP3 — ${tailleLisible(totalAvant)} au total${totalMinutes > 0 ? ` (~${Math.round(totalMinutes)} min)` : ""}.`);

  if (!ffmpeg) {
    console.log(`
ffmpeg est INTROUVABLE : le script ne peut pas ré-encoder tout seul.

Procédure équivalente DANS AUDACITY (par fichier) :
  1. Ouvrir le MP3 dans Audacity.
  2. Piste → Mixage → « Mixage stéréo vers mono » (si la piste est en stéréo).
  3. Effets → Normaliser → -1,0 dB (évite la saturation).
  4. Fichier → Exporter → « Exporter en MP3 ».
  5. Options : Bitrate = Constant (CBR), Qualité = ${bitrate} kbps, Canaux = Mono.
  6. Enregistrer (écrase l'original ou dans un dossier « optimisés »).

Astuce lot : glisse les 13 MP3 dans Audacity (13 pistes), applique les étapes
2-3 (les effets s'appliquent à toutes les pistes sélectionnées), puis exporte
un par un en mono.

Alternative : télécharger ffmpeg pour Windows (gratuit) :
  https://www.gyan.dev/ffmpeg/builds/ → « ffmpeg-release-essentials.zip »
  Décompresser, copier ffmpeg.exe DANS le dossier podcast, relancer ce script
  (il le trouvera tout seul). Ou : définir la variable d'environnement FFMPEG
  vers le chemin de ffmpeg.exe.
`);
    process.exit(0);
  }

  if (!appliquer) {
    // Simulation : ré-encode UN fichier témoin pour estimer le gain, sans toucher aux autres.
    const temoin = path.join(dossier, mp3[0]);
    const sortieTemoin = path.join(dossier, ".temoin-optimise.mp3");
    try {
      const tailleApres = reencoderUnFichier(ffmpeg, temoin, sortieTemoin, bitrate);
      const ratio = tailleApres / lignes[0].taille;
      const totalApres = Math.round(totalAvant * ratio);
      console.log(`\nSIMULATION (aucun fichier modifié) :`);
      console.log(`  témoin : ${mp3[0]}  ${tailleLisible(lignes[0].taille)} → ${tailleLisible(tailleApres)} (×${ratio.toFixed(2)})`);
      console.log(`  total estimé : ${tailleLisible(totalAvant)} → ~${tailleLisible(totalApres)}`);
      console.log(`\nRelancez avec --appliquer pour ré-encoder les ${mp3.length} fichiers (originaux déplacés dans originaux/).`);
    } finally {
      fs.rmSync(sortieTemoin, { force: true });
    }
    process.exit(0);
  }

  // --appliquer
  const dossierOriginaux = path.join(dossier, "originaux");
  fs.mkdirSync(dossierOriginaux, { recursive: true });
  let totalApres = 0;
  let faits = 0;
  for (const f of mp3) {
    const source = path.join(dossier, f);
    const temporaire = path.join(dossier, `.optimise-${f}`);
    try {
      const tailleApres = reencoderUnFichier(ffmpeg, source, temporaire, bitrate);
      fs.renameSync(source, path.join(dossierOriginaux, f)); // original sauvegardé
      fs.renameSync(temporaire, source); // le ré-encodé prend la place
      totalApres += tailleApres;
      faits++;
      console.log(`  ✔ ${f}  ${tailleLisible(lignes.find((l) => l.f === f).taille)} → ${tailleLisible(tailleApres)}`);
    } catch (e) {
      fs.rmSync(temporaire, { force: true });
      console.error(`  ❌ ${f} : ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const { nb } = genererIndex(dossier);
  console.log(`\n✅ ${faits}/${mp3.length} fichiers optimisés — ${tailleLisible(totalAvant)} → ${tailleLisible(totalApres)} (économie ~${Math.round((1 - totalApres / totalAvant) * 100)}%).`);
  console.log(`   Originaux sauvegardés dans ${dossierOriginaux}/ — supprimez-les quand l'écoute vous convient.`);
  console.log(`   Index régénéré (${nb} enregistrement(s)).`);
}
