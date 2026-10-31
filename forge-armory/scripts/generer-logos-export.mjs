#!/usr/bin/env node
// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - GÉNÈRE `src/data/forge/logosExport.ts` : les logos SVG intégrés (« en ligne ») dans la page HTML de l'EXPORT INFOGRAPHIQUE (`lib/loadouts/exportFiche.ts`).
// Pourquoi un module généré : la page d'export est une page HTML AUTONOME, fabriquée de façon synchrone, avec une politique de sécurité qui n'autorise ni script ni image locale (images : seulement www.bungie.net) ; des SVG en ligne sont donc la seule façon
// d'y mettre les logos de la charte, et il faut les avoir sous la main sans les charger. Source unique : les fichiers de `public/assets/icones/` (ne JAMAIS modifier le module généré à la main : relancer ce script ; le test de l'export vérifie qu'il est à jour).
//   node scripts/generer-logos-export.mjs            (écrit le module)      ·      node scripts/generer-logos-export.mjs --verifier      (vérifie qu'il est à jour)
// EN: ⚠️ ADDED - generates the inline SVG logos embedded in the standalone export page (sync build, strict CSP). Logos listed in LOGOS_A_VENIR are optional: picked up automatically once their file exists.
import fs from "node:fs";
import path from "node:path";

// FR : ⚠️ CHANGÉ (12/10/2026, v0.4.1) - les logos « Armes » (`icone-armes.svg`, l'épée seule) et « Armure » (`icone-armures.svg`, le bouclier seul) sont ARRIVÉS avec l'archive de visuels v3 : ils font maintenant partie des logos obligatoires (clés `armes` et `armure`). EN: the weapon and armor logos arrived with archive v3.
export const LOGOS = { doctrine: "icone-doctrine", artefact: "icone-artefact", armes: "icone-armes", armure: "icone-armures", neutre: "icone-neutre", roaming: "icone-roaming", dps: "icone-dps", pvp: "icone-pvp" };
// FR : mécanisme conservé pour de futurs logos facultatifs (clé → nom de fichier) ; vide aujourd'hui. EN: kept for future optional logos; empty today.
export const LOGOS_A_VENIR = {};

/** Allège un SVG pour l'inclure dans du HTML : sans prologue XML, sans titre ni description (inutiles dans une image), sans rôle ARIA (décoratif), sans espace entre balises. */
export function alleger(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/g, "")
    .replace(/<desc\b[^>]*>[\s\S]*?<\/desc>\s*/g, "")
    .replace(/\s+role="img"/, "")
    .replace(/\s+aria-labelledby="[^"]*"/, "")
    .replace(/\sxmlns="[^"]*"/, "")
    .replace(/<svg\b/, '<svg aria-hidden="true" focusable="false"')
    .replace(/>\s+</g, "><")
    .trim();
}

export function contenuModule(racine) {
  const dossier = path.join(racine, "public/assets/icones/");
  const entrees = [];
  for (const [cle, fichier] of [...Object.entries(LOGOS), ...Object.entries(LOGOS_A_VENIR)]) {
    const f = path.join(dossier, `${fichier}.svg`);
    if (!fs.existsSync(f)) { if (cle in LOGOS) throw new Error(`logo introuvable : ${f}`); continue; }   // les logos « à venir » sont facultatifs
    entrees.push(`  ${cle}: ${JSON.stringify(alleger(fs.readFileSync(f, "utf-8")))},`);
  }
  return `// ⚠️ FICHIER GÉNÉRÉ par \`scripts/generer-logos-export.mjs\` à partir de \`public/assets/icones/\` : NE PAS MODIFIER À LA MAIN (relancer le script). Voir son en-tête pour le pourquoi.
// ⚠️ GENERATED FILE - do not edit by hand; rerun the script.

export type CleLogoExport = "doctrine" | "artefact" | "armes" | "armure" | "neutre" | "roaming" | "dps" | "pvp";

/** SVG en ligne (déjà allégés) des logos de l'export infographique : doctrine, artefact, armes, armure et les quatre contextes. */
export const LOGOS_EXPORT: Readonly<Partial<Record<CleLogoExport, string>>> = {
${entrees.join("\n")}
};
`;
}

// FR : ⚠️ CORRIGÉ (12/10/2026) - le script ne s'exécute QUE lorsqu'on le lance lui-même (son nom est celui du fichier lancé). Avant, un test qui l'importait puis l'empaquetait dans un seul fichier le déclenchait sans le vouloir et réécrivait le module généré pendant le test. / EN: runs only when launched directly.
if (path.basename(process.argv[1] ?? "") === "generer-logos-export.mjs") {
  const racine = process.cwd(), sortie = path.join(racine, "src/data/forge/logosExport.ts"), contenu = contenuModule(racine);
  if (process.argv.includes("--verifier")) {
    const a_jour = fs.existsSync(sortie) && fs.readFileSync(sortie, "utf-8") === contenu;
    console.log(a_jour ? "logosExport.ts est à jour." : "logosExport.ts N'EST PAS à jour : relancer `node scripts/generer-logos-export.mjs`."); process.exit(a_jour ? 0 : 1);
  }
  fs.writeFileSync(sortie, contenu); console.log(`écrit : src/data/forge/logosExport.ts (${(contenu.length / 1024).toFixed(1)} Ko)`);
}
