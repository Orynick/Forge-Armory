// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - GÉNÉRATEUR du REPLI STATIQUE du Grimoire D1 (`src/data/grimoire-d1-repli.json`). Contexte : le diagnostic de l'utilisateur (`diagnostiquerGrimoire`, 20/10/2026) montre que l'API legacy D1 de Bungie répond HTTP 200 avec la clé de l'appli MAIS SANS AUCUN CONTENU (0 livre, 0 carte) — Bungie a retiré le contenu Grimoire de l'API D1. Le repli statique (spécification §2, source Ishtar Collective / The Grimoire Archive) est donc ACTIVÉ.
//   Source : The Grimoire Archive (https://github.com/aureliendossantos/destiny-grimoire), qui embarque les définitions D1 officielles de Bungie (manifest D1, extraites en 2018) en 7 langues, dont le français :
//     - src/content/grimoire/fr.json : structure officielle (6 livres/thèmes → chapitres/pages → cardBriefs)
//     - src/content/cards/fr.json   : les 834 cartes (cardId, cardName, cardIntro, cardDescription)
//   Usage : node scripts/generer-repli-grimoire.mjs [--depuis <dossier-local>] [--branche <branche-github>]
//     --depuis <dossier> : lit les deux JSON depuis un clone local (hors ligne), sinon les télécharge depuis GitHub (branche master par défaut).
//   Le script ne garde QUE le texte : titre du livre, titre du chapitre (sous-titre), titre de la carte, intro + description nettoyées (HTML → texte, entités décodées). AUCUNE image (les sprites Bungie ne sont pas embarqués ; la palette Parchemin/Hologramme suffit).
//   Le JSON généré est versionné : l'appli le lit directement (import), AUCUN téléchargement au runtime (lecture passive, hors-ligne OK).
// EN: generates the D1 Grimoire STATIC FALLBACK (`src/data/grimoire-d1-repli.json`). The user's diagnostic showed the D1 legacy API answers HTTP 200 with the app key BUT NO CONTENT (0 books, 0 cards) — Bungie removed the Grimoire content from the D1 API. The static fallback (spec §2) is therefore ACTIVATED. Source: The Grimoire Archive, embedding Bungie's official D1 definitions (2018 manifest dump) in 7 languages including French. Keeps text only (no images). The generated JSON is committed: the app imports it directly, NO runtime download (passive reading, offline OK).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(__dirname, "..");
const DOSSIER_DONNEES = path.join(RACINE, "src", "data");
const FICHIER_SORTIE = path.join(DOSSIER_DONNEES, "grimoire-d1-repli.json");

const DEPOT = "aureliendossantos/destiny-grimoire";
const CHEMIN_THEMES = "src/content/grimoire/fr.json";
const CHEMIN_CARTES = "src/content/cards/fr.json";
const URL_BASE = (branche) => `https://raw.githubusercontent.com/${DEPOT}/${branche}/`;

function lireArgs() {
  const args = process.argv.slice(2);
  let depuis = null, branche = "master";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--depuis") depuis = args[++i];
    else if (args[i] === "--branche") branche = args[++i];
  }
  return { depuis, branche };
}

/** FR : nettoie le HTML des textes Bungie : balises <b>/<i>/<br/> → texte, entités HTML (&#171; &#160; &amp;…) → caractères, espaces insécables → espaces, trim. / EN: cleans Bungie's HTML text: tags → plain text, HTML entities → characters, nbsp → spaces, trim. */
function nettoyerTexte(brut) {
  if (!brut) return "";
  return brut
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(b|i|u|p|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const { depuis, branche } = lireArgs();

  let themes, cartes;
  if (depuis) {
    // FR : lecture depuis un clone local (hors ligne).
    themes = JSON.parse(readFileSync(path.join(depuis, CHEMIN_THEMES), "utf8"));
    cartes = JSON.parse(readFileSync(path.join(depuis, CHEMIN_CARTES), "utf8"));
    console.log(`📂 lecture locale : ${depuis}`);
  } else {
    const base = URL_BASE(branche);
    console.log(`🌐 téléchargement depuis ${DEPOT} (branche ${branche})…`);
    const [rThemes, rCartes] = await Promise.all([
      fetch(base + CHEMIN_THEMES),
      fetch(base + CHEMIN_CARTES),
    ]);
    if (!rThemes.ok || !rCartes.ok) throw new Error(`téléchargement échoué : thèmes=${rThemes.status} cartes=${rCartes.status}`);
    themes = await rThemes.json();
    cartes = await rCartes.json();
  }

  const collection = themes?.themeCollection;
  if (!Array.isArray(collection) || collection.length === 0) throw new Error("structure themeCollection absente ou vide");

  // FR : livres = les 6 thèmes, DANS L'ORDRE OFFICIEL du Grimoire (Gardiens, Inventaire, Alliés, Ennemis, Lieux, Activités). Chaque livre = les pages (chapitres) du thème, chaque page = les cartes référencées par ses cardBriefs, DANS L'ORDRE DES cardBriefs.
  const livres = [];
  const idsVus = new Set();
  for (const theme of collection) {
    const pages = [];
    for (const page of theme.pageCollection ?? []) {
      const cartesPage = [];
      for (const brief of page.cardBriefs ?? []) {
        const carte = cartes[String(brief.cardId)];
        if (!carte) throw new Error(`carte ${brief.cardId} référencée par « ${theme.themeName} / ${page.pageName} » mais absente du dictionnaire`);
        const titre = nettoyerTexte(carte.cardName);
        const intro = nettoyerTexte(carte.cardIntro);
        const description = nettoyerTexte(carte.cardDescription);
        const texte = [intro, description].filter(Boolean).join("\n\n");
        if (!texte) continue; // carte sans texte : exclue (même règle que convertirGrimoire)
        if (idsVus.has(brief.cardId)) throw new Error(`cardId ${brief.cardId} en double dans la structure`);
        idsVus.add(brief.cardId);
        cartesPage.push({
          id: `grimoire:${brief.cardId}`,
          titre,
          texte,
        });
      }
      if (cartesPage.length > 0) {
        pages.push({
          id: `grimoire-chapitre:${theme.themeId}:${page.pageId}`,
          titre: nettoyerTexte(page.pageName),
          pages: cartesPage,
        });
      }
    }
    if (pages.length > 0) {
      livres.push({
        id: `grimoire-livre:${theme.themeId}`,
        titre: nettoyerTexte(theme.themeName),
        pages,
      });
    }
  }

  // FR : aplati en LivreLore[] (livre → pages de cartes) : la structure intermédiaire avec chapitres est aplatie — le sous-titre de chaque page porte le nom du chapitre (comme le fait convertirGrimoire avec chapterName).
  const aplati = livres.map((livre) => ({
    id: livre.id,
    titre: livre.titre,
    pages: livre.pages.flatMap((chapitre) =>
      chapitre.pages.map((carte) => ({ ...carte, sousTitre: chapitre.titre }))
    ),
  }));

  const nbCartes = aplati.reduce((n, l) => n + l.pages.length, 0);
  if (nbCartes === 0) throw new Error("aucune carte générée — repli vide, refusé");

  const sortie = {
    // FR : métadonnées de provenance (traçabilité, pas affiché).
    source: `The Grimoire Archive — https://github.com/${DEPOT} (branche ${branche})`,
    sourceNote: "Définitions D1 officielles de Bungie (manifest D1, 2018), embarquées par The Grimoire Archive. Texte uniquement, nettoyé (HTML → texte).",
    langue: "fr",
    livres: aplati,
  };

  mkdirSync(DOSSIER_DONNEES, { recursive: true });
  // FR : JSON MINIFIÉ (pas d'indentation) : fichier de données généré, le script est la source de vérité — la minification allège le dépôt et le bundle.
  writeFileSync(FICHIER_SORTIE, JSON.stringify(sortie) + "\n", "utf8");
  const taille = readFileSync(FICHIER_SORTIE, "utf8").length;
  console.log(`✅ ${FICHIER_SORTIE}`);
  console.log(`   ${aplati.length} livres, ${nbCartes} cartes, ${(taille / 1024).toFixed(0)} Ko`);
  for (const l of aplati) console.log(`   - ${l.titre} : ${l.pages.length} cartes`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
