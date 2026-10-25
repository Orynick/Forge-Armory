// FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - test du script (fichier `.test.ts` : le lanceur ne ramasse que les `.test.ts(x)`, pas les `.mjs` — cf. `scripts/test-logique.mjs`).
// d'ASSOCIATION podcast (`scripts/associer-podcast.mjs`) : apparier les MP3 bruts
// avec les pages du Legendarium via un fichier d'associations, SANS devinette.
// On teste les fonctions PURES (lireAssociation, calculerPlan) sur un dossier
// TEMPORAIRE (jamais dans public/podcast/ réel), plus le câblage (npm script,
// .gitignore, lecteur affiche l'id en dev).
// EN: ADDED (draft-podcast, follow-up) - test of the podcast ASSOCIATION script
// (`scripts/associer-podcast.mjs`): matching raw MP3s with Legendarium pages via
// an associations file, NO guessing. We test the PURE functions
// (lireAssociation, calculerPlan) on a TEMPORARY folder (never the real
// public/podcast/), plus the wiring (npm script, .gitignore, player shows the id
// in dev).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lireAssociation, calculerPlan, appliquerPlan } from "../../scripts/associer-podcast.mjs";
import { nomCiblePourPage } from "../../scripts/generer-index-podcast.mjs";

const res = [];
const ok = (nom, cond, detail) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 500)); };

// ---------- dossier temporaire ----------
const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-test-"));
const ecrire = (nom, contenu = "x") => fs.writeFileSync(path.join(dossier, nom), contenu);

// ---------- 1. lireAssociation ----------
{
  const f = path.join(dossier, "association.txt");
  fs.writeFileSync(f, "# commentaire\n\nlore:111\n  grimoire:222  \n# autre\n", "utf-8");
  const lu = lireAssociation(f);
  ok("ASSOCIER : le fichier d'associations se lit ligne par ligne (vides et # ignorés, espaces retirés)",
    JSON.stringify(lu) === JSON.stringify(["lore:111", "grimoire:222"]), lu);
  ok("ASSOCIER : un fichier d'associations ABSENT renvoie une liste vide (pas d'erreur)",
    JSON.stringify(lireAssociation(path.join(dossier, "inexistant.txt"))) === "[]");
}

// ---------- 2. calculerPlan : appariement par ORDRE ALPHABÉTIQUE ----------
{
  ecrire("chapitre 1.mp3");
  ecrire("chapitre 2.mp3");
  ecrire("page trois.mp3");
  ecrire("lore-999.mp3"); // déjà conforme : EXCLU du renommage
  const { plan, erreurs, mp3 } = calculerPlan(dossier, ["lore:111", "lore:222", "grimoire:333"]);
  ok("ASSOCIER : seuls les MP3 NON conformes sont à renommer (triés alphabétiquement, les conformes exclus)",
    JSON.stringify(mp3) === JSON.stringify(["chapitre 1.mp3", "chapitre 2.mp3", "page trois.mp3"]), mp3);
  ok("ASSOCIER : le plan apparie chaque MP3 (ordre alpha) à l'identifiant de la ligne courante, avec le nom cible conventionné",
    JSON.stringify(plan) === JSON.stringify([
      { source: "chapitre 1.mp3", cible: "lore-111.mp3", idPage: "lore:111" },
      { source: "chapitre 2.mp3", cible: "lore-222.mp3", idPage: "lore:222" },
      { source: "page trois.mp3", cible: "grimoire-333.mp3", idPage: "grimoire:333" },
    ]), plan);
  ok("ASSOCIER : aucun conflit quand tout est cohérent", erreurs.length === 0, erreurs);
}

// ---------- 3. calculerPlan : sécurités ----------
{
  const d2 = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-test2-"));
  fs.writeFileSync(path.join(d2, "a.mp3"), "x");
  fs.writeFileSync(path.join(d2, "b.mp3"), "x");
  const trop = calculerPlan(d2, ["lore:1"]); // 1 association pour 2 MP3
  ok("ASSOCIER : nombre d'associations ≠ nombre de MP3 → ERREUR (jamais de renommage partiel deviné)",
    trop.erreurs.length === 1 && /nombre d'associations/.test(trop.erreurs[0].raison), trop.erreurs);
  const invalide = calculerPlan(d2, ["nimportequoi", "lore:2"]);
  ok("ASSOCIER : un identifiant invalide (hors `lore:`/`grimoire:`) → ERREUR sur la ligne, pas de renommage",
    invalide.erreurs.length === 1 && invalide.plan.length === 1 && invalide.plan[0].source === "b.mp3", invalide);
  fs.writeFileSync(path.join(d2, "lore-5.mp3"), "x");
  const conflit = calculerPlan(d2, ["lore:5", "lore:6"]); // cible lore-5.mp3 existe déjà
  ok("ASSOCIER : un nom cible DÉJÀ EXISTANT → ERREUR (le script ne remplace JAMAIS un fichier)",
    conflit.erreurs.some((e) => /existe déjà/.test(e.raison)), conflit.erreurs);
}

// ---------- 4. appliquerPlan (sur le temporaire) ----------
{
  const d3 = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-test3-"));
  fs.writeFileSync(path.join(d3, "mon enregistrement.mp3"), "x");
  const { plan } = calculerPlan(d3, ["lore:777"]);
  appliquerPlan(d3, plan);
  ok("APPLIQUER : le renommage produit bien le nom conventionné dans le dossier",
    fs.existsSync(path.join(d3, "lore-777.mp3")) && !fs.existsSync(path.join(d3, "mon enregistrement.mp3")));
  ok("APPLIQUER : le nom cible est celui de la convention verrouillée",
    nomCiblePourPage("lore:777") === "lore-777.mp3");
}

// ---------- 5. Câblage ----------
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
ok("CÂBLAGE : le script npm `podcast:associer` existe",
  pkg.scripts?.["podcast:associer"] === "node scripts/associer-podcast.mjs", pkg.scripts);

const gitignore = fs.readFileSync(".gitignore", "utf-8");
ok("CÂBLAGE : .gitignore exclut le fichier d'associations personnel (`public/podcast/association.txt`)",
  /^public\/podcast\/association\.txt$/m.test(gitignore));

const lecteur = fs.readFileSync("src/components/LecteurPodcast.tsx", "utf-8");
ok("CÂBLAGE : le lecteur AFFICHE l'identifiant de la page en DEV (bouton « copier l'id ») — pour constituer association.txt",
  /import\.meta\.env\.DEV/.test(lecteur) && /data-lecteur-id-page/.test(lecteur) && /data-lecteur-copier-id/.test(lecteur) && /navigator\.clipboard\.writeText\(page!\.id\)/.test(lecteur));
ok("CÂBLAGE : l'affichage de l'id est DEV UNIQUEMENT (pas en production)",
  /\{import\.meta\.env\.DEV && \([\s\S]*?data-lecteur-id-page/.test(lecteur));

const generer = fs.readFileSync("scripts/generer-index-podcast.mjs", "utf-8");
ok("CÂBLAGE : le générateur d'index exporte sa logique (réutilisée par associer-podcast) et ne s'exécute que lancé directement (garde par nom de fichier, comme generer-logos-export.mjs)",
  /export function genererIndex/.test(generer) && /LANCE_DIRECTEMENT = path\.basename\(process\.argv\[1\] \?\? ""\) === "generer-index-podcast\.mjs"/.test(generer), generer.slice(generer.indexOf("LANCE_DIRECTEMENT") - 100, generer.indexOf("LANCE_DIRECTEMENT") + 200));

const associerSrc = fs.readFileSync("scripts/associer-podcast.mjs", "utf-8");
ok("CÂBLAGE : le script d'association ne s'exécute que lancé directement (garde par nom de fichier)",
  /LANCE_DIRECTEMENT = path\.basename\(process\.argv\[1\] \?\? ""\) === "associer-podcast\.mjs"/.test(associerSrc));

fs.rmSync(dossier, { recursive: true, force: true });

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
