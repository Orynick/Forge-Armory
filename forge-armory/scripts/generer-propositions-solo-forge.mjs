#!/usr/bin/env node
// FR : ⚠️ AJOUT (12/10/2026) - GÉNÉRATEUR des PROPOSITIONS vectorielles « Solo sans mourir » et « Forge », conformes à la charte graphique (ressources-installateur/forge-armory/app-assets/docs/charte-graphique.html), à partir des ÉBAUCHES de l'utilisateur.
//     node scripts/generer-propositions-solo-forge.mjs --sortie <dossier>
// Produit : selecteur/bouton-forge(.svg|-selectionne.svg) · panneaux/titre-solo-sans-mourir.svg · icones/icone-forge.svg · icones/icone-solo-sans-mourir.svg.
// MÉTHODE : (1) le texte est composé avec les lettres DÉJÀ dessinées dans les titres et boutons de l'utilisateur (outil glyphes-titres.mjs) ; l'espacement vient d'un MODÈLE additif mesuré dans ces fichiers (marge droite de la lettre précédente + marge
// gauche de la suivante + interlettrage, + une espace entre les mots), validé en recomposant les textes existants ; (2) les symboles sont redessinés en vectoriel selon la charte (argent, fentes transparentes par masque, une partie en cyan avec lueur,
// dans les zones permises) ; (3) la plaque, l'anneau, les cristaux, le soulignage et l'étoile sont repris tels quels des fichiers de référence ; (4) identifiants internes préfixés.
// EN: ⚠️ ADDED - generator for the conforming vector proposals "Solo sans mourir" and "Forge" from the user's drafts.

import fs from "node:fs";
import path from "node:path";
import { TEXTES, lettresEtiquetees, mesurerBords, trouverTexte, trouverSoulignage, composer, deplacer, serialiser, souligner, remplacerD } from "./glyphes-titres.mjs";

const args = process.argv.slice(2);
const racine = process.cwd();
const sortie = path.resolve(args.includes("--sortie") ? args[args.indexOf("--sortie") + 1] : "propositions");
const ARCHIVE = path.join(racine, "ressources-installateur/forge-armory/app-assets/assets/");
const LIVRES = path.join(racine, "public/assets/");
const lire = (base, f) => fs.readFileSync(base + f, "utf-8");

// ============ 1. MODÈLE D'ESPACEMENT, mesuré dans les fichiers de l'utilisateur ============
const SOURCES = { ...TEXTES, "selecteur/bouton-build-analyzer.svg": "BUILD ANALYZER", "selecteur/bouton-bibliotheque.svg": "BIBLIOTHÈQUE", "selecteur/bouton-loadouts.svg": "LOAD-OUTS" };
const obs = [], lsbObs = [], rsbObs = [], lettresDe = {};
for (const [f, texte] of Object.entries(SOURCES)) {
  const svg = lire(ARCHIVE, f), L = lettresEtiquetees(svg, texte); lettresDe[f] = L;
  const esp = []; let k = 0, avantEspace = false;
  for (const c of [...texte]) { if (c === " ") { avantEspace = true; continue; } esp[k++] = avantEspace; avantEspace = false; }
  for (let i = 1; i < L.length; i++) obs.push({ a: L[i - 1].car, b: L[i].car, esp: esp[i], gap: L[i].xmin - L[i - 1].xmax });
  const b = mesurerBords(svg, texte); lsbObs.push({ c: b.premiere, v: b.lsb }); rsbObs.push({ c: b.derniere, v: b.rsb });
}
const chars = [...new Set(Object.values(SOURCES).flatMap((t) => [...t.replace(/ /g, "")]))].sort();
const n = chars.length * 2 + 2, iR = (c) => chars.indexOf(c) * 2, iL = (c) => chars.indexOf(c) * 2 + 1, iT = n - 2, iS = n - 1;
const lignes = [];
for (const o of obs) { const a = new Array(n).fill(0); a[iR(o.a)] += 1; a[iL(o.b)] += 1; a[iT] += 1; if (o.esp) a[iS] += 1; lignes.push([a, o.gap]); }
for (const o of lsbObs) { const a = new Array(n).fill(0); a[iL(o.c)] = 1; lignes.push([a, o.v]); }
for (const o of rsbObs) { const a = new Array(n).fill(0); a[iR(o.c)] = 1; lignes.push([a, o.v]); }
function resoudre(lignes, n, lambda = 1e-6) {
  const M = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  for (const [a, y] of lignes) for (let i = 0; i < n; i++) { if (!a[i]) continue; for (let j = 0; j < n; j++) M[i][j] += a[i] * a[j]; M[i][n] += a[i] * y; }
  for (let i = 0; i < n; i++) M[i][i] += lambda;
  for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; [M[i], M[p]] = [M[p], M[i]]; for (let r = 0; r < n; r++) { if (r === i) continue; const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; } }
  return M.map((l, i) => l[n] / l[i]);
}
const x = resoudre(lignes, n);
const R = (c) => x[iR(c)], Lg = (c) => x[iL(c)], T = x[iT], S = x[iS];
const residus = lignes.map(([a, y]) => a.reduce((s, v, i) => s + v * x[i], 0) - y);
console.log(`modèle d'espacement : ${lignes.length} mesures, ${chars.length} lettres ; interlettrage T = ${T.toFixed(2)}, espace S = ${S.toFixed(2)} ; résidu max ${Math.max(...residus.map(Math.abs)).toFixed(3)}, moyen ${(residus.reduce((s, v) => s + Math.abs(v), 0) / residus.length).toFixed(3)} unités`);

// glyphes : variantes du « O » (simple = 2 sous-chemins, orné = 3) ; le « O » orné est le DERNIER du titre (charte §4)
const biblio = new Map();
for (const L of Object.values(lettresDe)) for (const g of L) { const cle = g.car === "O" ? (g.sous.length === 3 ? "O*" : "O") : g.car; if (!biblio.has(cle)) biblio.set(cle, g); }
function planTexte(texte) {
  const car = [...texte], dernierO = car.lastIndexOf("O"); let prec = null, esp = false; const plan = [];
  car.forEach((c, i) => { if (c === " ") { esp = true; return; } const g = biblio.get(c === "O" ? (i === dernierO ? "O*" : "O") : c); if (!g) throw new Error(`lettre « ${c} » absente de la bibliothèque`); plan.push({ lettre: g, ecart: prec ? R(prec) + Lg(c) + T + (esp ? S : 0) : 0 }); prec = c; esp = false; });
  return plan;
}
// validation : recomposer les textes existants avec le modèle et comparer à la position réelle de chaque lettre
let pire = 0, somme = 0, nb = 0;
for (const [f, texte] of Object.entries(SOURCES)) {
  const L = lettresDe[f], plan = planTexte(texte), compo = composer(plan), dx = L[0].xmin - plan[0].lettre.xmin + 0;
  let xd = 0; plan.forEach((p, i) => { const debut = i === 0 ? 0 : xd + p.ecart; const reel = L[i].xmin - L[0].xmin; const e = Math.abs(debut - reel); pire = Math.max(pire, e); somme += e; nb++; xd = debut + (p.lettre.xmax - p.lettre.xmin); });
}
console.log(`précision du modèle : en recomposant les ${Object.keys(SOURCES).length} textes d'origine, écart maximal de position d'une lettre ${pire.toFixed(2)} unité, moyen ${(somme / nb).toFixed(2)} (cadre de 1024 de haut)`);

function composerTitre(texte) { // texte composé, bords du soulignage, largeur de boîte
  const plan = planTexte(texte), c = composer(plan), prem = [...texte.replace(/ /g, "")][0], der = [...texte.replace(/ /g, "")].at(-1);
  return { sous: c.sous, xmin: c.xmin, xmax: c.xmax, boite: c.xmax - c.xmin + Lg(prem) + R(der), lsb: Lg(prem), rsb: R(der) };
}
// place le texte pour que sa boîte (soulignage) soit [xg, xg + boite]
const placer = (t, xg) => ({ sous: deplacer(t.sous, xg + t.lsb - t.xmin), xg, xd: xg + t.boite });

// ============ 2. SYMBOLES (charte §2 : cadre 1024, centre 512, argent + fentes transparentes + cyan avec lueur) ============
const masque = (P, id, noirs) => `<mask id="${P}${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="#ffffff"/>${noirs}</mask>`;
function symboleForge(P) { // REPRIS DE L'ÉBAUCHE (v2) : lame lumineuse à pointe basse, deux cornes en croissant (halo), fines pointes, socle en Y flanqué de deux ailes courbes
  // Les formes sont écrites dans le repère d'un GROS PLAN de l'ébauche (x, y en pixels du recadrage), puis mises à l'échelle (0,6) pour tenir entre les cristaux : x' = 512 + 0,6 (x − 420), y' = 326 + 0,6 (y − 90).
  const k = 0.6, X = (x) => 512 + k * (x - 420), Y = (y) => 326 + k * (y - 90);
  const T = (d) => d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (_, a, b) => `${X(+a).toFixed(1)} ${Y(+b).toFixed(1)}`);
  const M = (d) => d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (_, a, b) => `${840 - +a} ${b}`);       // symétrie autour de l'axe de la lame (x = 420)
  const lame = "M 417 90 L 462 140 L 462 520 L 417 568 L 372 520 L 372 140 Z";
  const moitie = "M 417 104 L 417 556 L 378 516 L 378 150 Z";                                                 // moitié gauche plus claire (cœur blanc)
  const corneG = "M 332 296 C 250 292 130 300 76 372 C 58 396 62 420 84 440 C 140 482 230 494 296 492 L 276 470 C 215 466 150 450 132 418 C 120 396 135 372 170 352 C 220 326 280 318 332 316 Z";
  const pointeG = "M 305 60 L 314 300 L 296 300 Z";
  const y_ = "M 304 546 L 358 540 L 417 596 L 476 540 L 530 546 L 462 616 L 454 668 L 417 708 L 380 668 L 372 616 Z";
  const aileG = "M 114 556 L 322 588 C 334 640 346 690 352 736 L 326 736 C 272 650 196 590 114 556 Z";
  const argent = (d) => `<path d="${T(d)}" fill="url(#${P}silver)"/>`;
  return `${argent(corneG)}${argent(M(corneG))}${argent(pointeG)}${argent(M(pointeG))}${argent(y_)}${argent(aileG)}${argent(M(aileG))}
    <g filter="url(#${P}glowSoft)"><path d="${T(lame)}" fill="url(#${P}cyanL)"/></g>
    <path d="${T(moitie)}" fill="#e8fdff" opacity="0.88"/>`;
}
function symboleSolo(P) { // écu à herse : fentes de la grille transparentes, UNE fenêtre allumée en cyan (un seul joueur)
  const ecu = "M 332 258 L 692 258 L 692 508 C 692 626 618 716 512 772 C 406 716 332 626 332 508 Z";
  const cols = [434, 512, 590], rangs = [404, 482, 560];
  const fenetres = rangs.flatMap((cy) => cols.map((cx) => `<rect x="${cx - 27}" y="${cy - 27}" width="54" height="54" rx="5" fill="#000000"/>`)).join("");
  const crans = [446, 512, 578].map((cx) => `<rect x="${cx - 14}" y="282" width="28" height="28" fill="#000000"/>`).join("");
  const fentes = cols.map((cx) => `<rect x="${cx - 6}" y="606" width="12" height="190" fill="#000000"/>`).join("");
  return `${masque(P, "mSolo", fenetres + crans + fentes)}
    <path d="${ecu}" fill="url(#${P}silver)" mask="url(#${P}mSolo)"/>
    <g filter="url(#${P}glowSoft)"><rect x="485" y="455" width="54" height="54" rx="5" fill="url(#${P}cyanL)"/></g>`;
}

// ============ 3. OUTILS D'ASSEMBLAGE ============
const prefixeDe = (svg) => /id="(fa-[^"]*?-)silver"/.exec(svg)[1];
function renommer(svg, ancien, nouveau, libelle, desc) {
  svg = svg.replaceAll(ancien, nouveau);
  svg = svg.replace(/(<title[^>]*>)[^<]*(<\/title>)/, (_, a, b) => `${a}${libelle}${b}`).replace(/(<desc[^>]*>)[^<]*(<\/desc>)/, (_, a, b) => `${a}${desc}${b}`);
  return svg;
}
function finGroupe(svg, debut) { // index juste après le </g> qui ferme le <g> ouvert à `debut`
  let prof = 0; const re = /<g\b[^>]*>|<\/g>/g; re.lastIndex = debut;
  for (let m; (m = re.exec(svg)); ) { prof += m[0] === "</g>" ? -1 : 1; if (prof === 0) return m.index + 4; }
  throw new Error("groupe non fermé");
}
function groupesNiveau1(svg) { // les <g> enfants directs de la racine (hors <defs>)
  const defs = svg.indexOf("</defs>") + 7, out = []; let i = defs;
  for (;;) { const o = svg.indexOf("<g", i); if (o < 0) break; const f = finGroupe(svg, o); out.push([o, f]); i = f; }
  return out;
}
const finCercle = (svg) => { const m = /<circle cx="512" cy="512" r="436"[^>]*\/>/.exec(svg); return m.index + m[0].length; };
const ecrire = (f, s) => { fs.mkdirSync(path.dirname(path.join(sortie, f)), { recursive: true }); fs.writeFileSync(path.join(sortie, f), s); console.log("écrit :", f, `(${(s.length / 1024).toFixed(1)} Ko)`); };

// ============ 4. BOUTON FORGE (sélecteur, 2 états, cadre 4316 × 1024) ============
const texteForge = composerTitre("FORGE");
for (const [fichier, suffixe] of [["selecteur/bouton-loadouts.svg", ""], ["selecteur/bouton-loadouts-selectionne.svg", "-selectionne"]]) {
  let svg = lire(LIVRES, fichier); const P = prefixeDe(svg);
  // symbole : entre l'anneau et le premier groupe de cristaux
  const debut = finCercle(svg), cristaux = svg.indexOf(`<g filter="url(#${P}glow)">`, debut);   // les cristaux utilisent le filtre « glow »
  if (cristaux < 0) throw new Error("cristaux introuvables");
  svg = svg.slice(0, debut) + "\n    " + symboleForge(P) + "\n    " + svg.slice(cristaux);
  // texte : centré sur le centre du soulignage de référence
  const u = trouverSoulignage(svg), nn = u.d.match(/-?\d*\.?\d+/g).map(Number), centre = (nn[0] + nn[10]) / 2;
  const t = placer(texteForge, centre - texteForge.boite / 2);
  const ancienTexte = trouverTexte(svg).d, nouveauTexte = serialiser(t.sous);
  svg = svg.split(ancienTexte).join(nouveauTexte);
  const nouveauSou = souligner(u.d, t.xg, t.xd); svg = svg.split(u.d).join(nouveauSou);
  svg = renommer(svg, P, `fa-selecteur-bouton-forge${suffixe}-`, `Forge Armory — bouton Forge${suffixe ? " (sélectionné)" : ""}`, "Lame cyan dressée dans un anneau d'argent au-dessus d'une enclume, dans un cercle, cristaux cyan en haut et en bas ; plaque avec le titre FORGE, soulignage et étoile cyan.");
  ecrire(`selecteur/bouton-forge${suffixe}.svg`, svg);
  if (!suffixe) { // icône seule : anneau + symbole + cristaux (on retire la plaque et le texte)
    const g = groupesNiveau1(svg); let icone = svg.slice(0, g[0][0]) + svg.slice(g[1][0], g[1][1]) + svg.slice(g[2][1]);
    icone = icone.replace(/viewBox="[^"]*"/, 'viewBox="0 0 1024 1024"').replaceAll("fa-selecteur-bouton-forge-", "fa-icones-icone-forge-").replace(/(<title[^>]*>)[^<]*(<\/title>)/, "$1Forge Armory — icône Forge$2");
    ecrire("icones/icone-forge.svg", icone);
  }
}

// ============ 5. TITRE « SOLO SANS MOURIR » (famille des titres : sans cristaux, sans lueur ; plaque COMPACTE) ============
{
  let svg = lire(LIVRES, "titres/titre-contexte-0.svg"); const P = prefixeDe(svg);
  const debut = finCercle(svg), g = groupesNiveau1(svg), finLogo = g[1][1] - 4;     // fin du groupe logo, avant son </g>
  svg = svg.slice(0, debut) + "\n    " + symboleSolo(P) + "\n  " + svg.slice(finLogo);
  const t0 = composerTitre("SOLO SANS MOURIR"), XG = 1265.0;                         // bord gauche de la zone du titre : séparateur 1135 + marge 130
  const t = placer(t0, XG), centre = (t.xg + t.xd) / 2, xR = t.xd + 171, largeur = +(xR + 70.2).toFixed(1); // 171 = 130 de marge + 41 (demi-biseau)
  const u = trouverSoulignage(svg), ancienTexte = trouverTexte(svg).d;
  svg = svg.split(ancienTexte).join(serialiser(t.sous)); svg = svg.split(u.d).join(souligner(u.d, t.xg, t.xd));
  // étoile : recentrée
  const etoile = /<g filter="url\(#[^"]*glowStar\)">/.exec(svg); const sp = new RegExp(`${etoile[0].replace(/[()#]/g, "\\$&")}\\s*<path d="([^"]+)"`).exec(svg)[1].match(/-?\d*\.?\d+/g).map(Number); const xs = sp.filter((_, i) => i % 2 === 0), cEtoile = (Math.min(...xs) + Math.max(...xs)) / 2;
  svg = svg.replace(etoile[0], etoile[0].replace(">", ` transform="translate(${(centre - cEtoile).toFixed(2)} 0)">`));
  // plaque raccourcie : mêmes biseaux (82), mêmes retraits
  const xr = (v) => +(xR - v).toFixed(1);
  const rep = (a, b) => { if (!svg.includes(a)) throw new Error("plaque : motif introuvable : " + a.slice(0, 40)); svg = svg.replaceAll(a, b); };
  rep("L 7352.8 250.0 L 7434.8 332.0 L 7434.8 692.0 L 7352.8 774.0", `L ${xr(82)} 250.0 L ${xR.toFixed(1)} 332.0 L ${xR.toFixed(1)} 692.0 L ${xr(82)} 774.0`);
  rep("L 7337.8 265.0 L 7419.8 347.0 L 7419.8 677.0 L 7337.8 759.0", `L ${xr(97)} 265.0 L ${xr(15)} 347.0 L ${xr(15)} 677.0 L ${xr(97)} 759.0`);
  rep('width="6323"', `width="${(6323 - (7434.8 - xR)).toFixed(1)}"`);
  svg = svg.replace(/viewBox="0 0 7505 1024"/, `viewBox="0 0 ${largeur} 1024"`);
  svg = renommer(svg, P, "fa-panneaux-titre-solo-sans-mourir-", "Forge Armory — titre « Solo sans mourir »", "Titre de panneau : écu à herse en argent, une fenêtre allumée en cyan, dans un cercle ; plaque compacte avec le titre SOLO SANS MOURIR, soulignage et étoile cyan.");
  ecrire("panneaux/titre-solo-sans-mourir.svg", svg);
  console.log(`  titre Solo : boîte du texte ${t0.boite.toFixed(1)}, plaque jusqu'à x = ${xR.toFixed(1)}, cadre 0 0 ${largeur} 1024 (rapport ${(largeur / 1024).toFixed(3)} : ${(56 * largeur / 1024).toFixed(0)} px de large à 56 px de haut)`);
  // icône seule (sans cristaux) : on retire la plaque et le texte
  const g2 = groupesNiveau1(svg); let icone = svg.slice(0, g2[0][0]) + svg.slice(g2[1][0], g2[1][1]) + svg.slice(g2[2][1]);
  icone = icone.replace(/viewBox="[^"]*"/, 'viewBox="0 0 1024 1024"').replaceAll("fa-panneaux-titre-solo-sans-mourir-", "fa-icones-icone-solo-sans-mourir-").replace(/(<title[^>]*>)[^<]*(<\/title>)/, "$1Forge Armory — icône Solo sans mourir$2");
  ecrire("icones/icone-solo-sans-mourir.svg", icone);
}
