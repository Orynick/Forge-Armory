// FR : Télécharge les Manifests Destiny 2 FRANÇAIS et ANGLAIS sur votre PC,
// sous forme de vrais fichiers SQLite utilisables hors de l'appli.
//
// Pourquoi ce script existe : l'appli télécharge déjà le Manifest toute
// seule, mais elle le garde dans le navigateur (IndexedDB), invisible et
// difficile à inspecter. Ce script en fait une copie posée sur le disque,
// utile pour : garder une sauvegarde d'une version précise du Manifest,
// l'ouvrir dans un outil SQLite pour explorer les tables à la main, ou
// comparer les textes FR et EN côte à côte quand une correspondance de
// mot-clé pose problème (exactement le genre de bug qu'on a chassé sur les
// types d'armes).
//
// Utilisation, depuis le dossier du projet (cmd Windows) :
//     node scripts/telecharger-manifest.mjs
//
// Prérequis :
//   - `npm install` déjà fait au moins une fois (le script utilise fflate,
//     déjà présent dans les dépendances du projet - rien à installer en plus)
//   - un fichier .env.local contenant VITE_BUNGIE_API_KEY (le même que
//     celui utilisé par l'appli)
//
// Résultat : un dossier `manifest-local/` contenant
//   - manifest-fr.sqlite
//   - manifest-en.sqlite
//   - version.txt  (la version exacte du Manifest téléchargé, utile pour
//     savoir si une copie est à jour ou non)
//
// EN: Downloads the FRENCH and ENGLISH Destiny 2 Manifests to your PC as
// real, usable SQLite files. The app already downloads the Manifest, but
// keeps it inside the browser (IndexedDB) where it's hard to inspect. This
// puts a copy on disk for backups, manual SQLite exploration, or comparing
// FR/EN texts side by side when a keyword match misbehaves.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { unzipSync } from "fflate";

const RACINE_BUNGIE = "https://www.bungie.net";
const DOSSIER_SORTIE = "manifest-local";
const LANGUES = ["fr", "en"];

function lireCleApi() {
  // FR : on lit .env.local à la main plutôt que d'ajouter une dépendance
  // (dotenv) juste pour ça - le format est simple et connu.
  if (!existsSync(".env.local")) {
    throw new Error(
      "Fichier .env.local introuvable.\n" +
        "  → Lancez ce script depuis le dossier du projet (celui qui contient package.json),\n" +
        "    et vérifiez que .env.local existe bien (voir .env.example)."
    );
  }
  const contenu = readFileSync(".env.local", "utf8");
  for (const ligne of contenu.split(/\r?\n/)) {
    const nette = ligne.trim();
    if (!nette || nette.startsWith("#")) continue;
    const separateur = nette.indexOf("=");
    if (separateur === -1) continue;
    if (nette.slice(0, separateur).trim() === "VITE_BUNGIE_API_KEY") {
      const valeur = nette.slice(separateur + 1).trim().replace(/^["']|["']$/g, "");
      if (valeur) return valeur;
    }
  }
  throw new Error(
    "VITE_BUNGIE_API_KEY est vide ou absente de .env.local.\n" +
      "  → Renseignez votre clé API Bungie dans ce fichier (voir NOTICE.md)."
  );
}

function formaterTaille(octets) {
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
}

async function main() {
  const cleApi = lireCleApi();

  console.log("Récupération des informations du Manifest...");
  const reponseInfos = await fetch(`${RACINE_BUNGIE}/Platform/Destiny2/Manifest/`, {
    headers: { "X-API-Key": cleApi },
  });
  if (!reponseInfos.ok) {
    throw new Error(
      `Bungie a répondu ${reponseInfos.status} à la demande d'informations.\n` +
        (reponseInfos.status === 401
          ? "  → Erreur 401 = clé API refusée. Vérifiez VITE_BUNGIE_API_KEY dans .env.local."
          : "  → Réessayez dans quelques minutes ; les serveurs Bungie sont parfois en maintenance.")
    );
  }
  const infos = (await reponseInfos.json()).Response;
  const version = infos?.version ?? "(version inconnue)";
  console.log(`Version du Manifest : ${version}\n`);

  if (!existsSync(DOSSIER_SORTIE)) mkdirSync(DOSSIER_SORTIE, { recursive: true });

  for (const langue of LANGUES) {
    const chemin = infos?.mobileWorldContentPaths?.[langue];
    if (!chemin) {
      console.error(`⚠️  Aucun Manifest trouvé pour la langue "${langue}" - ignoré.`);
      continue;
    }

    console.log(`[${langue.toUpperCase()}] Téléchargement... (environ 100-200 Mo, soyez patient)`);
    const reponseFichier = await fetch(`${RACINE_BUNGIE}${chemin}`, { headers: { "X-API-Key": cleApi } });
    if (!reponseFichier.ok) {
      console.error(`⚠️  [${langue.toUpperCase()}] Échec du téléchargement (${reponseFichier.status}) - ignoré.`);
      continue;
    }
    const zipCompresse = new Uint8Array(await reponseFichier.arrayBuffer());
    console.log(`[${langue.toUpperCase()}] Téléchargé : ${formaterTaille(zipCompresse.length)}. Décompression...`);

    // FR : ⚠️ PIÈGE CONNU (déjà rencontré côté appli, voir CHANGELOG) -
    // l'URL sert un fichier ZIP, PAS directement du SQLite. Il faut le
    // décompresser avant d'obtenir la base utilisable.
    // EN: ⚠️ KNOWN PITFALL (already hit in the app, see CHANGELOG) - the
    // URL serves a ZIP file, NOT raw SQLite. It must be decompressed first.
    const contenuZip = unzipSync(zipCompresse);
    const nomsFichiers = Object.keys(contenuZip);
    if (nomsFichiers.length === 0) {
      console.error(`⚠️  [${langue.toUpperCase()}] Archive vide - ignoré.`);
      continue;
    }
    const donneesSqlite = contenuZip[nomsFichiers[0]];

    const cheminSortie = join(DOSSIER_SORTIE, `manifest-${langue}.sqlite`);
    writeFileSync(cheminSortie, donneesSqlite);
    console.log(`[${langue.toUpperCase()}] ✅ Enregistré : ${cheminSortie} (${formaterTaille(donneesSqlite.length)})\n`);
  }

  writeFileSync(
    join(DOSSIER_SORTIE, "version.txt"),
    `Version du Manifest : ${version}\nTéléchargé le : ${new Date().toISOString()}\n`
  );

  console.log(`Terminé. Les fichiers sont dans le dossier "${DOSSIER_SORTIE}".`);
  console.log("Vous pouvez les ouvrir avec un outil comme DB Browser for SQLite (gratuit)");
  console.log("pour explorer les tables à la main.");
}

main().catch((erreur) => {
  console.error(`\n❌ ${erreur.message}`);
  process.exit(1);
});
