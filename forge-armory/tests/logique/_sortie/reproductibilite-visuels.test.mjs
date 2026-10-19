import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// tests/logique/reproductibilite-visuels.test.ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

// src/data/forge/forgeAssetsComplement.ts
var FORGE_ASSETS_COMPLEMENT = [
  { id: "titres.connexion.repos", famille: "titres", label: "Connexion \xE0 Bungie", etat: "repos", fichier: "assets/titres/titre-connexion.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40 },
  { id: "titres.manifest.repos", famille: "titres", label: "Recherche dans le Manifest", etat: "repos", fichier: "assets/titres/titre-manifest.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40 },
  { id: "titres.1-doctrine-elementaire.repos", famille: "titres", label: "1. Doctrine \xE9l\xE9mentaire", etat: "repos", fichier: "assets/titres/titre-1-doctrine-elementaire.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40 },
  { id: "titres.2-armes-armures.repos", famille: "titres", label: "2. Armes et Armures", etat: "repos", fichier: "assets/titres/titre-2-armes-armures.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40 },
  { id: "titres.3-artefact.repos", famille: "titres", label: "3. Artefact", etat: "repos", fichier: "assets/titres/titre-3-artefact.svg", largeur: 7505, hauteur: 1024, ratio: 7505 / 1024, hauteurMinPx: 40 },
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - onglet FORGE (logo VALIDÉ par l'utilisateur) : deux états du bouton du sélecteur (famille « selecteur », cadre 4316 × 1024, comme les trois autres) et l'icône seule. Sources : `ressources-installateur/forge-armory/forge-0.4.0/`.
  { id: "selecteur.forge.repos", famille: "selecteur", label: "Forge", etat: "repos", fichier: "assets/selecteur/bouton-forge.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40 },
  { id: "selecteur.forge.selectionne", famille: "selecteur", label: "Forge", etat: "selectionne", fichier: "assets/selecteur/bouton-forge-selectionne.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40 },
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - bouton INVENTAIRE du sélecteur (OPTION 2 choisie par l'utilisateur : un vrai bouton au format du sélecteur, plutôt que le titre repliable « Mon Inventaire » de Build Analyzer). Fabriqué par `scripts/generer-propositions-solo-forge.mjs` à partir du coffre de l'icône « Mon Inventaire » de l'utilisateur ; source : `ressources-installateur/forge-armory/inventaire-0.4.3/`. À BRANCHER après les tests de la 0.4.3 (demande de l'utilisateur) : le sous-menu « Collection » de la Forge prendra le bouton de l'archive v4, « Inventaire » celui-ci. EN: ⚠️ ADDED - Inventory selector button.
  { id: "selecteur.inventaire.repos", famille: "selecteur", label: "Inventaire", etat: "repos", fichier: "assets/selecteur/bouton-inventaire.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40 },
  { id: "selecteur.inventaire.selectionne", famille: "selecteur", label: "Inventaire", etat: "selectionne", fichier: "assets/selecteur/bouton-inventaire-selectionne.svg", largeur: 4316, hauteur: 1024, ratio: 4.2148, hauteurMinPx: 40 },
  { id: "icones.forge", famille: "icones", label: "Forge", etat: null, fichier: "assets/icones/icone-forge.svg", largeur: 1024, hauteur: 1024, ratio: 1, hauteurMinPx: 24 }
];

// tests/logique/reproductibilite-visuels.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var racine = process.cwd();
var hash = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
var lister = (base) => {
  const out = [];
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      e.isDirectory() ? rec(p) : out.push(path.relative(base, p).split(path.sep).join("/"));
    }
  };
  rec(base);
  return out.sort();
};
var tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-visuels-"));
fs.mkdirSync(path.join(tmp, "public"), { recursive: true });
fs.mkdirSync(path.join(tmp, "ressources-installateur/forge-armory"), { recursive: true });
fs.cpSync(path.join(racine, "ressources-installateur/forge-armory/app-assets/assets"), path.join(tmp, "public/assets"), { recursive: true });
fs.cpSync(path.join(racine, "ressources-installateur/forge-armory/titres-complets"), path.join(tmp, "ressources-installateur/forge-armory/titres-complets"), { recursive: true });
fs.cpSync(path.join(racine, "scripts"), path.join(tmp, "scripts"), { recursive: true });
var r1 = spawnSync("node", ["scripts/retoucher-visuels.mjs"], { cwd: tmp, encoding: "utf-8" });
var r2 = spawnSync("node", ["scripts/retoucher-visuels.mjs"], { cwd: tmp, encoding: "utf-8" });
var reconstruit = lister(path.join(tmp, "public/assets"));
var livre = lister(path.join(racine, "public/assets"));
var forge = FORGE_ASSETS_COMPLEMENT.filter((a) => /(^selecteur\.forge\.|^icones\.forge$|^selecteur\.inventaire\.)/.test(a.id)).map((a) => a.fichier.replace(/^assets\//, ""));
ok("le script de retouche s'ex\xE9cute sans erreur depuis l'archive de r\xE9f\xE9rence", r1.status === 0 && /retouche\(s\) appliquée\(s\)/.test(r1.stdout), r1.stderr || r1.stdout.slice(-200));
ok("IDEMPOTENT : une seconde ex\xE9cution ne change plus rien", r2.status === 0 && /\b0 retouche\(s\) appliquée\(s\)/.test(r2.stdout), r2.stdout.slice(-200));
ok(`les fichiers de public/assets qui ne viennent PAS de l'archive sont exactement ceux de l'onglet Forge et du bouton Inventaire (${forge.length} : ${forge.join(", ")})`, forge.length === 5 && JSON.stringify(livre.filter((f) => !reconstruit.includes(f))) === JSON.stringify([...forge].sort()), livre.filter((f) => !reconstruit.includes(f)));
ok("la reconstruction ne produit AUCUN fichier absent de public/assets (rien n'a \xE9t\xE9 oubli\xE9 lors de l'int\xE9gration)", reconstruit.every((f) => livre.includes(f)), reconstruit.filter((f) => !livre.includes(f)));
var differents = reconstruit.filter((f) => livre.includes(f) && hash(path.join(tmp, "public/assets", f)) !== hash(path.join(racine, "public/assets", f)));
ok(`REPRODUCTIBLE : les ${reconstruit.length} fichiers reconstruits depuis l'archive de r\xE9f\xE9rence sont identiques OCTET POUR OCTET \xE0 ceux de public/assets`, differents.length === 0, differents);
var v = spawnSync("node", ["scripts/retoucher-visuels.mjs", "--verifier"], { cwd: racine, encoding: "utf-8" });
ok("`node scripts/retoucher-visuels.mjs --verifier` sur le projet lui-m\xEAme : aucune retouche ne manque", v.status === 0 && /\b0 retouche\(s\) manquante\(s\)/.test(v.stdout), v.stdout.slice(-200));
var sortieGen = path.join(tmp, "generes");
var g = spawnSync("node", ["scripts/generer-propositions-solo-forge.mjs", "--sortie", sortieGen], { cwd: racine, encoding: "utf-8" });
var fabriques = [...forge];
var ecartsGen = fabriques.filter((f) => !fs.existsSync(path.join(sortieGen, f)) || hash(path.join(sortieGen, f)) !== hash(path.join(racine, "public/assets", f)));
ok(`le g\xE9n\xE9rateur (scripts/generer-propositions-solo-forge.mjs) redonne OCTET POUR OCTET les ${fabriques.length} fichiers qu'il fabrique (boutons Forge et Inventaire, ic\xF4ne Forge)`, g.status === 0 && ecartsGen.length === 0, ecartsGen.length ? ecartsGen : g.stderr.slice(-300));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
