#!/usr/bin/env node
// FR : ⚠️ AJOUT (07/10/2026, v0.3.17) - RETOUCHES des visuels Forge Armory livrés par l'utilisateur, appliquées sur `public/assets/` (jamais sur l'archive d'origine, conservée intacte dans
// `ressources-installateur/forge-armory/app-assets/`). À RELANCER après tout remplacement de fichiers de `public/assets/` par de nouvelles versions de l'auteur des visuels :
//     node scripts/retoucher-visuels.mjs            applique les retouches (idempotent : une seconde exécution ne change plus rien)
//     node scripts/retoucher-visuels.mjs --verifier ne modifie rien ; code de sortie 1 si une retouche manque
//     node scripts/retoucher-visuels.mjs --racine <dossier>   travaille sur une autre copie du projet (utilisé par les tests)
// Quatre retouches, toutes demandées ou justifiées par les retours de l'utilisateur des 07 et 08/10/2026 (détail : documentation/identite-visuelle/RETOUCHES-VISUELS.md) :
//   1. SOULIGNAGE des titres : le trait argenté sous le texte fait 8 unités d'épaisseur sur un cadre de 1024, soit environ 0,3 px à 40 px de haut et 0,4 px à 56 px : plus fin qu'un pixel, il est à peine visible
//      (luminosité mesurée : 66 à 70 sur 255) et sa visibilité dépend du décalage vertical du bloc à l'écran, alors que le cristal, lui, se voit. Porté à 20 unités (≥ 0,8 px dès 41,6 px de haut), pointes comprises.
//   2. CARTE « Doctrine élémentaire » (pilier 1) : son icône reprend les PROPORTIONS de celle du bloc « Doctrine et Élément » (même agrandissement ×1,4 autour du centre du cercle) et ses six billes bleues sont agrandies un peu
//      (rayon 25 → 30, masque de découpe de l'hexagone 42 → 47 pour garder le même écart).
//      ⚠️ AJOUT (08/10/2026, réponse de l'utilisateur « Oui » à ma question) : les six billes de l'icône du bloc « Classe et Doctrine » (fichiers `titre-doctrine-replie.svg` et `titre-doctrine-deplie.svg`) sont agrandies de la même façon
//      (25 → 30, masque 42 → 47), pour que les deux icônes soient identiques. Les deux icônes ont maintenant exactement la même géométrie.
//   3. CONNEXION et MANIFEST : ces deux blocs ne sont PAS repliables ; l'archive actuelle ne leur donne que la version avec le losange + / −. On reprend donc leur version SANS losange (cadre 7505), livrée avec l'archive
//      précédente (`titres-complets/`), dont les identifiants internes sont préfixés (comme dans l'archive actuelle) pour ne jamais entrer en collision avec ceux des autres fichiers.
//   4. RENUMÉROTATION DES CARTES DU SCORING (08/10/2026) : pour suivre l'ordre des blocs au-dessus du Scoring, le pilier 1 s'appelle « Doctrine élémentaire » (avant : « Élément et Doctrine »), « 2. Artefact » devient « 3. Artefact » et
//      « 3. Armes et Armures » devient « 2. Armes et Armures », MÊMES logos. Le texte des titres étant dessiné en tracés, on le recompose avec les lettres DÉJÀ dessinées dans les titres de l'utilisateur (outil : glyphes-titres.mjs ; lettres et
//      écarts mesurés dans ses propres fichiers) ; le soulignage est recalculé à la nouvelle largeur et le titre recentré. Les nouveaux fichiers portent le bon numéro dans leur nom (`titre-3-artefact.svg` affiche « 3. ») ; les trois
//      anciens fichiers, devenus trompeurs, sont supprimés de `public/assets/` (ils restent dans l'archive d'origine). Sans cette étape les lettres seraient à redessiner par l'utilisateur.
// EN: ⚠️ ADDED - retouches applied to public/assets (never to the original archive); idempotent; re-run after replacing artwork. (1) thicker underline (sub-pixel before), (2) card 1 icon proportions and bigger beads,
// (3) static (no +/- diamond) versions for Connexion and Manifest.

import fs from "node:fs";
import path from "node:path";
import { TEXTES, lettresEtiquetees, trouverTexte, trouverSoulignage, mesurerBords, composer, deplacer, serialiser, ecart, souligner, remplacerD, CENTRE_TITRE } from "./glyphes-titres.mjs";

const args = process.argv.slice(2);
const racine = path.resolve(args.includes("--racine") ? args[args.indexOf("--racine") + 1] : process.cwd());
const verifier = args.includes("--verifier");
const ASSETS = path.join(racine, "public", "assets");
const ARCHIVE_ANTERIEURE = path.join(racine, "ressources-installateur", "forge-armory", "titres-complets", "blocs-repliables");
const changements = [];

function ecrire(fichier, nouveau, ancien, libelle) {
  if (nouveau === ancien) return;
  if (!verifier) fs.mkdirSync(path.dirname(fichier), { recursive: true }), fs.writeFileSync(fichier, nouveau);
  changements.push(`${libelle} : ${path.relative(racine, fichier)}`);
}

/** 3. Versions sans losange de Connexion et Manifest, avec identifiants préfixés. */
function importerVersionFixe(nom) {
  const source = path.join(ARCHIVE_ANTERIEURE, `titre-${nom}.svg`);
  const cible = path.join(ASSETS, "titres", `titre-${nom}.svg`);
  if (fs.existsSync(cible)) return; // déjà importé (les retouches suivantes s'appliquent au fichier de public/assets)
  if (!fs.existsSync(source)) { console.error(`Source introuvable : ${source}`); process.exitCode = 1; return; }
  let svg = fs.readFileSync(source, "utf-8");
  const prefixe = `fa-titres-titre-${nom}-`;
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).sort((a, b) => b.length - a.length);
  for (const id of ids) {
    svg = svg.replaceAll(`id="${id}"`, `id="${prefixe}${id}"`).replaceAll(`url(#${id})`, `url(#${prefixe}${id})`).replaceAll(`href="#${id}"`, `href="#${prefixe}${id}"`);
  }
  svg = svg.replace(/aria-labelledby="([^"]+)"/, (_, l) => `aria-labelledby="${l.split(/\s+/).map((i) => prefixe + i).join(" ")}"`);
  ecrire(cible, svg, "", "version fixe importée (sans losange, identifiants préfixés)");
}

/** 2 bis. Billes de l'icône du bloc « Classe et Doctrine » : mêmes dimensions que celles de la carte « Doctrine élémentaire ». Ne touche que les six billes (pas le point central, de rayon 11) et le masque de découpe de l'hexagone. */
function agrandirBillesDoctrine(svg) {
  const billes = /(<circle cx="(?:742\.0|627\.0|397\.0|282\.0)" cy="(?:512\.0|312\.8|711\.2)" r=")25(" fill="url)/g;
  svg = svg.replace(billes, (_, avant, apres) => `${avant}30${apres}`);
  return svg.replace(/<mask id="[^"]*-mHex"[\s\S]*?<\/mask>/, (masque) => masque.replaceAll('r="42"', 'r="47"'));
}

/** 4. Renumérotation des cartes du Scoring : nouveaux fichiers composés avec les lettres existantes, anciens fichiers supprimés. */
const CARTES = {
  c1: { source: "titres/titre-1-element-doctrine.svg", cible: "titres/titre-1-doctrine-elementaire.svg", ancien: "1. Élément Et Doctrine", nouveau: "1. Doctrine Élémentaire", pAncien: "fa-titres-titre-1-element-doctrine-", pNouveau: "fa-titres-titre-1-doctrine-elementaire-", attendu: "1.DOCTRINEÉLÉMENTAIRE" },
  c2: { source: "titres/titre-2-artefact.svg", cible: "titres/titre-3-artefact.svg", ancien: "2. Artefact", nouveau: "3. Artefact", pAncien: "fa-titres-titre-2-artefact-", pNouveau: "fa-titres-titre-3-artefact-", attendu: "3.ARTEFACT" },
  c3: { source: "titres/titre-3-armes-armures.svg", cible: "titres/titre-2-armes-armures.svg", ancien: "3. Armes Et Armures", nouveau: "2. Armes Et Armures", pAncien: "fa-titres-titre-3-armes-armures-", pNouveau: "fa-titres-titre-2-armes-armures-", attendu: "2.ARMESETARMURES" },
};
const SOURCES_LETTRES = { doc: "blocs-repliables/titre-doctrine-deplie.svg", inv: "blocs-repliables/titre-inventaire-deplie.svg", sauv: "blocs-repliables/titre-sauvegarde-deplie.svg" };

function renumeroterCartes() {
  if (!Object.values(CARTES).every((c) => fs.existsSync(path.join(ASSETS, c.source)))) return; // déjà fait
  const fichiers = { c1: CARTES.c1.source, c2: CARTES.c2.source, c3: CARTES.c3.source, ...SOURCES_LETTRES };
  const svg = {}, L = {}; const lsb = {}, rsb = {};
  for (const [k, f] of Object.entries(fichiers)) {
    svg[k] = fs.readFileSync(path.join(ASSETS, f), "utf-8"); L[k] = lettresEtiquetees(svg[k], TEXTES[f]);
    const b = mesurerBords(svg[k], TEXTES[f]); lsb[b.premiere] = b.lsb; rsb[b.derniere] = b.rsb;
  }
  const suite = (k, de, a) => Array.from({ length: a - de + 1 }, (_, j) => ({ lettre: L[k][de + j], ecart: ecart(L[k], de + j - 1, de + j) }));
  const plans = {
    // « 1. DOCTRINE ÉLÉMENTAIRE » : « 1. » de la carte 1 ; « DOCTRINE » et « ÉLÉMENT » du titre « Doctrine et Élément » ; « AIRE » de « Mon Inventaire » (jonction T→A observée dans INVENTAIRE).
    // L'écart « . → D » n'existe pas dans les titres : il vaut l'écart « . → É » de la carte 1, corrigé de la différence de marge gauche entre D et E, mesurée dans « SAUVEGARDE ET PARTAGE DU BUILD » (E→D moins E→E, à travers une espace).
    c1: [{ lettre: L.c1[0], ecart: 0 }, { lettre: L.c1[1], ecart: ecart(L.c1, 0, 1) }, { lettre: L.doc[0], ecart: ecart(L.c1, 1, 2) + ecart(L.sauv, 18, 19) - ecart(L.sauv, 9, 10) }, ...suite("doc", 1, 7),
         { lettre: L.doc[10], ecart: ecart(L.sauv, 9, 10) }, ...suite("doc", 11, 16), { lettre: L.inv[9], ecart: ecart(L.inv, 8, 9) }, ...suite("inv", 10, 12)],
    // « 3. ARTEFACT » : le « 3 » de la carte 3 à la place du « 2 » de la carte 2 (écart « 3 → . » mesuré dans la carte 3).
    c2: [{ lettre: L.c3[0], ecart: 0 }, { lettre: L.c2[1], ecart: ecart(L.c3, 0, 1) }, ...suite("c2", 2, 9)],
    // « 2. ARMES ET ARMURES » : le « 2 » de la carte 2 à la place du « 3 » de la carte 3 (écart « 2 → . » mesuré dans la carte 2).
    c3: [{ lettre: L.c2[0], ecart: 0 }, { lettre: L.c3[1], ecart: ecart(L.c2, 0, 1) }, ...suite("c3", 2, 15)],
  };
  for (const [k, c] of Object.entries(CARTES)) {
    const lu = plans[k].map((p) => p.lettre.car).join("");
    if (lu !== c.attendu) throw new Error(`renumérotation ${k} : « ${lu} » au lieu de « ${c.attendu} »`);
    const compo = composer(plans[k]);
    const xg0 = compo.xmin - lsb[plans[k][0].lettre.car], xd0 = compo.xmax + rsb[plans[k].at(-1).lettre.car];
    const decal = CENTRE_TITRE - (xg0 + xd0) / 2;
    let out = svg[k];
    const t = trouverTexte(out); out = remplacerD(out, t.index, t.balise, serialiser(deplacer(compo.sous, decal)));
    const u = trouverSoulignage(out); out = remplacerD(out, u.index, u.balise, souligner(u.d, xg0 + decal, xd0 + decal));
    out = out.replaceAll(c.pAncien, c.pNouveau).replaceAll(c.ancien, c.nouveau);
    ecrire(path.join(ASSETS, c.cible), out, "", `titre recomposé (« ${c.nouveau} »)`);
  }
  for (const c of Object.values(CARTES)) {
    const f = path.join(ASSETS, c.source);
    if (!verifier) fs.unlinkSync(f);
    changements.push(`ancien fichier supprimé (devenu trompeur) : ${path.relative(racine, f)}`);
  }
}

/** 1. Soulignage : 8 → 20 unités d'épaisseur (le tracé à opacity 0.9, de 626.0 à 634.0 ; pointes à 630). */
function epaissirSoulignage(svg) {
  return svg.replace(/<path\b[^>]*>/g, (balise) => {
    if (!/\bopacity="0\.9"/.test(balise)) return balise;
    return balise.replace(/\bd="([^"]+)"/, (m, d) => (/626\.0/.test(d) && /634\.0/.test(d) ? `d="${d.replaceAll("626.0", "620.0").replaceAll("634.0", "640.0")}"` : m));
  });
}

/** 2. Icône de la carte 1 : mêmes proportions que « Doctrine et Élément » (×1,4) et billes agrandies. */
function retoucherCarte1(svg) {
  if (svg.includes('data-retouche="carte-1-proportions"')) return svg;
  const cercle = /<circle cx="512" cy="512" r="436"[^>]*\/>/.exec(svg);
  if (!cercle) throw new Error("carte 1 : cercle de l'icône introuvable");
  const debut = cercle.index + cercle[0].length;
  const groupeBilles = svg.indexOf('<g filter="url(#', debut);
  if (groupeBilles < 0) throw new Error("carte 1 : groupe des billes introuvable");
  const fin = svg.indexOf("</g>", groupeBilles) + 4;
  const contenu = svg.slice(debut, fin).trim().replaceAll('r="25"', 'r="30"');
  svg = svg.slice(0, debut) + `\n    <g transform="translate(512 512) scale(1.4) translate(-512 -512)" data-retouche="carte-1-proportions">${contenu}</g>` + svg.slice(fin);
  return svg.replace(/<mask id="[^"]*-mHex"[\s\S]*?<\/mask>/, (masque) => masque.replaceAll('r="42"', 'r="47"'));
}

if (!fs.existsSync(ASSETS)) { console.error(`Dossier introuvable : ${ASSETS}`); process.exit(2); }
importerVersionFixe("connexion");
importerVersionFixe("manifest");
renumeroterCartes();
for (const famille of ["blocs-repliables", "titres"]) {
  const dossier = path.join(ASSETS, famille);
  for (const f of fs.readdirSync(dossier).filter((n) => n.endsWith(".svg")).sort()) {
    const chemin = path.join(dossier, f);
    const ancien = fs.readFileSync(chemin, "utf-8");
    let nouveau = epaissirSoulignage(ancien);
    ecrire(chemin, nouveau, ancien, "soulignage épaissi");
    if (f === "titre-doctrine-deplie.svg" || f === "titre-doctrine-replie.svg") {
      ecrire(chemin, agrandirBillesDoctrine(nouveau), nouveau, "billes de l'icône « Classe et Doctrine » agrandies (comme la carte « Doctrine élémentaire »)");
    }
    if (f === "titre-1-doctrine-elementaire.svg") {
      const apres = retoucherCarte1(nouveau);
      ecrire(chemin, apres, nouveau === ancien ? ancien : nouveau, "icône de la carte « Doctrine élémentaire » (proportions de Doctrine, billes agrandies)");
    }
  }
}
console.log(changements.length ? changements.join("\n") : "Aucune retouche à appliquer : tout est déjà à jour.");
console.log(`${changements.length} retouche(s) ${verifier ? "manquante(s)" : "appliquée(s)"}.`);
if (verifier && changements.length > 0) process.exitCode = 1;
