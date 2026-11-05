// FR : Teste le code reel du projet qui depend du Manifest, en utilisant
// les fixtures locales (test-fixtures/) au lieu d'un vrai telechargement.
// Usage : node scripts/tester-avec-fixtures.mjs (depuis la racine du
// projet, apres npm install - necessite que sql.js soit installe, meme si
// on n'utilise pas le vrai sql.js ici, car download.ts l'importe).
//
// EN: Tests the project's real Manifest-dependent code, using local
// fixtures (test-fixtures/) instead of a real download. Usage: node
// scripts/tester-avec-fixtures.mjs (from the project root, after npm
// install - requires sql.js to be installed, even though we don't use the
// real sql.js here, since download.ts imports it).

import { fausseDB } from "./fausse-db.mjs";
import { obtenirDefinition } from "../src/lib/manifest/download.ts";
import { rechercherDansManifest, rechercherBilingue } from "../src/lib/manifest/search.ts";
import { detecterVerbes, extraireTextesEffetsBuild, detecterChainesVerbes, detecterRessourcesGenerees, enrichirAvecChaines, scoreVerbesDetectes } from "../src/lib/scoring/verbes.ts";

const dbFr = fausseDB("fr");
const dbEn = fausseDB("en");

console.log("=== obtenirDefinition (hash 1, FR) ===");
console.log(obtenirDefinition(dbFr, "DestinyInventoryItemDefinition", 1));

console.log("\n=== rechercherDansManifest FR : 'dévoration' ===");
console.log(rechercherDansManifest(dbFr, "devoration", "plein_texte"));

console.log("\n=== rechercherBilingue : 'devour' (EN uniquement) ===");
console.log(rechercherBilingue(dbFr, dbEn, "devour", "plein_texte"));

console.log("\n=== extraireTextesEffetsBuild + detecterVerbes (build fictif) ===");
const buildFictif = {
  id: "test",
  nom: "Test",
  subclass: { classe: "arcaniste", element: "abyssal", superHash: 0, aspectHashes: [2], fragmentHashes: [3] },
  artifact: { artifactHash: 0, perkHashes: [100] },
  armes: [],
  armure: [],
};
const textes = extraireTextesEffetsBuild(buildFictif, dbFr);
console.log("Textes extraits :", textes);
const verbesDetectes = detecterVerbes(textes);
console.log("Verbes détectés :", verbesDetectes.filter((v) => v.confiance !== "absent"));

// FR : ⚠️ AJOUT (25/08/2026) - test du graphe de chaînes sur un vrai build
// fictif. Fragment 4 (hash 4) : applique Ralentissement, doit atteindre
// Gel PUIS Brisure par ricochet, sans que ni l'un ni l'autre ne soit
// mentionné dans aucun texte - exactement l'exemple validé avec
// l'utilisateur (grenade prismatique Arcaniste).
console.log("\n=== detecterChainesVerbes (build avec Ralentissement) ===");
const buildAvecRalentissement = {
  ...buildFictif,
  subclass: { ...buildFictif.subclass, fragmentHashes: [3, 4] },
};
const textesChaine = extraireTextesEffetsBuild(buildAvecRalentissement, dbFr);
const verbesChaine = detecterVerbes(textesChaine);
const maillons = detecterChainesVerbes(verbesChaine, textesChaine);
console.log("Maillons détectés :", maillons.map((m) => `${m.source.nomFr} -> ${m.cible.nomFr}`));
console.log("Attendu : Ralentissement -> Gel, ET Gel -> Brisure (ricochet à 2 sauts)");

console.log("\n=== detecterRessourcesGenerees (même build : Dévoration -> grenade) ===");
const ressources = detecterRessourcesGenerees(verbesChaine, maillons, textesChaine);
console.log("Ressources détectées :", ressources.map((r) => `${r.type} (${r.verbe.nomFr})`));

// FR : ⚠️ AJOUT (26/08/2026) - test de la correction du trou de notation
// identifié le 25/08 et tranché le 26/08. Gel et Brisure ne sont
// mentionnés dans AUCUN texte du build fictif ci-dessus (seul
// "Ralentissement" apparaît dans le fragment 4) : avant
// `enrichirAvecChaines`, leur `confiance` est "absent" (0 pt, exclus de
// tout groupe d'affichage), alors que la chaîne PROUVE qu'ils sont
// produits par ce build. Après enrichissement, ils doivent basculer en
// "source_seule" (12 pts chacun) puisque rien dans ce build fictif n'en
// PROFITE non plus (aPayoff reste false pour les deux).
// EN: ⚠️ ADDED - tests the scoring gap fix. Gel/Brisure are never
// mentioned in any text of the fictional build above: before
// `enrichirAvecChaines` their confiance is "absent" (0 pts), even though
// the chain proves they're produced. After enrichment they should become
// "source_seule" (12 pts each), since nothing in this fictional build
// consumes them either.
console.log("\n=== AVANT enrichirAvecChaines (correction 26/08) ===");
const confianceAvant = verbesChaine
  .filter((v) => v.verbe.id === "gel" || v.verbe.id === "brisure")
  .map((v) => `${v.verbe.nomFr} : ${v.confiance}`);
console.log("Confiance Gel/Brisure :", confianceAvant);
console.log("Attendu : les deux \"absent\" (aucune trace textuelle, ricochet non pris en compte)");

const { score: scoreAvant } = scoreVerbesDetectes(verbesChaine);
console.log("Score AVANT enrichissement :", scoreAvant);

console.log("\n=== APRÈS enrichirAvecChaines (correction 26/08) ===");
const verbesEnrichis = enrichirAvecChaines(verbesChaine, maillons);
const confianceApres = verbesEnrichis
  .filter((v) => v.verbe.id === "gel" || v.verbe.id === "brisure")
  .map((v) => `${v.verbe.nomFr} : ${v.confiance}`);
console.log("Confiance Gel/Brisure :", confianceApres);
console.log("Attendu : les deux \"source_seule\" (reconnus comme produits par ricochet, rien ne les exploite ici)");

const { score: scoreApres } = scoreVerbesDetectes(verbesEnrichis);
console.log("Score APRÈS enrichissement :", scoreApres);
console.log(`Différence : +${scoreApres - scoreAvant} pts (2 verbes absent->source_seule, +12 pts chacun)`);

