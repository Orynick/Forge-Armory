// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - TEST des VISUELS, portable : se lance depuis la racine du projet avec `tsx tests/logique/visuels.test.ts` (aucun chemin en dur). Il remplace le banc d'essai des visuels qui n'était pas rangé dans le projet.
// Vérifie la cohérence entre `public/assets/`, le catalogue généré (`forgeAssets.ts`) et son complément (`forgeAssetsComplement.ts`), et quelques règles de la charte graphique.
// EN: ⚠️ ADDED - portable test of the visuals (assets vs generated catalogue vs supplement, plus charter rules). Run from the project root.
import fs from "node:fs";
import path from "node:path";
import { FORGE_ASSETS } from "../../src/data/forge/forgeAssets";
import { FORGE_ASSETS_COMPLEMENT, FORGE_ASSETS_REMPLACES } from "../../src/data/forge/forgeAssetsComplement";
// @ts-ignore - outil de lecture des lettres des titres (module .mjs sans types)
import { lettresEtiquetees } from "../../scripts/glyphes-titres.mjs";

const PUB = path.resolve("public") + path.sep;
const resultats: [string, boolean][] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { resultats.push([nom, !!cond]); if (!cond) console.log("   détail :", JSON.stringify(detail)?.slice(0, 500)); };
const lire = (f: string) => fs.readFileSync(PUB + f, "utf-8");

const vivants = FORGE_ASSETS.filter((a) => !FORGE_ASSETS_REMPLACES.includes(a.id));
const TOUS = [...vivants, ...FORGE_ASSETS_COMPLEMENT];
const idsCatalogue = new Set(FORGE_ASSETS.map((a) => a.id));

ok("les identifiants du complément sont distincts de ceux du catalogue généré et uniques entre eux", FORGE_ASSETS_COMPLEMENT.every((a) => !idsCatalogue.has(a.id)) && new Set(FORGE_ASSETS_COMPLEMENT.map((a) => a.id)).size === FORGE_ASSETS_COMPLEMENT.length, FORGE_ASSETS_COMPLEMENT.map((a) => a.id));
ok("toutes les entrées « remplacées » existent bien dans le catalogue généré, et leurs fichiers n'existent plus sur le disque (anciens numéros devenus trompeurs)", FORGE_ASSETS_REMPLACES.every((id) => idsCatalogue.has(id)) && FORGE_ASSETS.filter((a) => FORGE_ASSETS_REMPLACES.includes(a.id)).every((a) => !fs.existsSync(PUB + a.fichier)));
const manquants = TOUS.filter((a) => !fs.existsSync(PUB + a.fichier)).map((a) => a.fichier);
ok(`les ${TOUS.length} fichiers déclarés (catalogue valable + complément) existent TOUS dans public/assets`, manquants.length === 0, manquants);
const surDisque: string[] = [];
const parcourir = (d: string) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) parcourir(p); else if (e.name.endsWith(".svg")) surDisque.push(path.relative(PUB, p).split(path.sep).join("/")); } };
parcourir(PUB + "assets");
const declares = new Set(TOUS.map((a) => a.fichier));
const enTrop = surDisque.filter((f) => !declares.has(f) && !["assets/marque/forge-armory-emblem.svg"].includes(f));
ok("public/assets ne contient AUCUN SVG non déclaré (pas de reste d'ancienne version)", enTrop.length === 0, enTrop);
const cadre = (f: string) => { const m = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/.exec(lire(f)); return m ? { l: +m[3], h: +m[4] } : null; };   // les symboles de profil ont un cadre qui ne commence pas à 0 0
// FR : ⚠️ CHANGÉ (20/10/2026, v0.4.14) - le catalogue v7 déclare des PNG (famille « marque » : logo et planche de déclinaisons) : le cadre (viewBox) ne se vérifie que pour les SVG. / EN: ⚠️ CHANGED - the v7 catalogue declares PNGs; the viewBox check applies to SVGs only.
const mauvaisCadre = TOUS.filter((a) => { if (a.fichier.endsWith(".png")) return false; const c = cadre(a.fichier); return !(c && Math.abs(c.l - a.largeur) < 0.5 && Math.abs(c.h - a.hauteur) < 0.5); }).map((a) => a.id);
ok("chaque fichier déclaré a le cadre (viewBox : largeur et hauteur) annoncé par son entrée du catalogue", mauvaisCadre.length === 0, mauvaisCadre);
const tousIds: Record<string, string[]> = {};
let sale: string[] = [];
for (const f of surDisque) { const s = lire(f); for (const m of s.matchAll(/\bid="([^"]+)"/g)) (tousIds[m[1]] ??= []).push(f); if (/<script|href="https?:|xlink:href|<image|font-family|<text\b/.test(s)) sale.push(f); }
ok("aucun SVG ne contient de script, de ressource externe, d'image incluse ni de police (texte en tracés)", sale.length === 0, sale);
ok("les identifiants internes de TOUS les SVG sont uniques d'un fichier à l'autre (aucune collision possible quand plusieurs sont affichés ensemble)", Object.values(tousIds).every((v) => v.length === 1), Object.entries(tousIds).filter(([, v]) => v.length > 1).slice(0, 3));
ok("les identifiants internes sont préfixés « fa- » et par le nom du dossier et du fichier (règle d'intégration de la charte, §9)", surDisque.filter((f) => f !== "assets/marque/forge-armory-emblem.svg").every((f) => { const nom = path.basename(f, ".svg"); const attendu = `fa-${f.split("/")[1]}-${nom}-`; return [...lire(f).matchAll(/\bid="([^"]+)"/g)].every((m) => m[1].startsWith(attendu)); }), surDisque.filter((f) => ![...lire(f).matchAll(/\bid="([^"]+)"/g)].every((m) => m[1].startsWith(`fa-${f.split("/")[1]}-${path.basename(f, ".svg")}-`))).slice(0, 3));
// --- l'onglet Forge (v0.4.0) ---
const forge = ["selecteur.forge.repos", "selecteur.forge.selectionne", "icones.forge"].map((id) => TOUS.find((a) => a.id === id));
ok("FORGE : le bouton du sélecteur existe dans ses DEUX états, cadre 4316 × 1024 comme les autres boutons du sélecteur, et l'icône seule en 1024 × 1024", forge.every(Boolean) && forge[0]!.largeur === 4316 && forge[1]!.largeur === 4316 && forge[0]!.hauteur === 1024 && forge[2]!.largeur === 1024 && forge[2]!.hauteur === 1024, forge.map((a) => a?.id));
const boutonsSelecteur = TOUS.filter((a) => a.famille === "selecteur");
ok("les quatre boutons du sélecteur (Build Analyzer, Load-outs, Forge, Legendarium) existent dans les deux états, tous du même cadre 4316 × 1024", ["build-analyzer", "loadouts", "forge", "legendarium"].every((v) => ["repos", "selectionne"].every((e) => boutonsSelecteur.some((a) => a.id === `selecteur.${v}.${e}` && a.largeur === 4316))), boutonsSelecteur.map((a) => a.id));
const plaque = (f: string) => /<g shape-rendering="geometricPrecision">.*?<\/g>/s.exec(lire(f))![0].replace(/fa-[\w-]*?-(?=(fadeH|fadeV|plateFill|silver)\b)/g, "@");
ok("FORGE : la PLAQUE du bouton (fond, bordure, filet, séparateur, lignes) est strictement identique à celle de « Load-outs » (même famille, même plaque)", plaque("assets/selecteur/bouton-forge.svg") === plaque("assets/selecteur/bouton-loadouts.svg"));
ok("FORGE : le bouton comporte les deux cristaux (en haut y 110→282, en bas y 744→916) dans ses deux états, comme les autres boutons du sélecteur", ["assets/selecteur/bouton-forge.svg", "assets/selecteur/bouton-forge-selectionne.svg", "assets/icones/icone-forge.svg"].every((f) => lire(f).includes("M 512 110") && lire(f).includes("M 512 744")));
ok("FORGE : le texte « FORGE » est bien composé de 5 lettres, et son unique « O » est ORNÉ (losange dans le jambage : 3 sous-chemins au lieu de 2), comme l'exige la charte pour le dernier « O » d'un titre", ["assets/selecteur/bouton-forge.svg", "assets/selecteur/bouton-forge-selectionne.svg"].every((f) => { const L = lettresEtiquetees(lire(f), "FORGE"); const o = L.filter((g: { car: string }) => g.car === "O"); return L.length === 5 && o.length === 1 && o[0].sous.length === 3; }));
// --- le bouton INVENTAIRE (v0.4.3 ; option 2 choisie par l'utilisateur) ---
const FICHIERS_INV = ["assets/selecteur/bouton-inventaire.svg", "assets/selecteur/bouton-inventaire-selectionne.svg"];
const inv = ["selecteur.inventaire.repos", "selecteur.inventaire.selectionne"].map((id) => TOUS.find((a) => a.id === id));
ok("INVENTAIRE : le bouton du sélecteur existe dans ses DEUX états, cadre 4316 × 1024 comme les autres boutons", inv.every(Boolean) && inv.every((a) => a!.largeur === 4316 && a!.hauteur === 1024 && a!.etat !== null) && FICHIERS_INV.every((f) => cadre(f)?.l === 4316 && cadre(f)?.h === 1024), inv.map((a) => a?.id));
ok("INVENTAIRE : la PLAQUE (fond, bordure, filet, séparateur, lignes) est strictement identique à celle de « Load-outs », état par état", plaque(FICHIERS_INV[0]) === plaque("assets/selecteur/bouton-loadouts.svg") && plaque(FICHIERS_INV[1]) === plaque("assets/selecteur/bouton-loadouts-selectionne.svg"));
ok("INVENTAIRE : les deux cristaux (en haut y 110→282, en bas y 744→916) sont présents dans les deux états", FICHIERS_INV.every((f) => lire(f).includes("M 512 110") && lire(f).includes("M 512 744")));
ok("INVENTAIRE : le texte est bien composé des 10 lettres de « INVENTAIRE » (avec le « A » sans barre de tes titres), dans les deux états", FICHIERS_INV.every((f) => lettresEtiquetees(lire(f), "INVENTAIRE").length === 10));
const iconeInv = lire("assets/icones/icone-inventaire.svg");
const normInv = (t: string) => t.replace(/fa-[\w-]*?-(?=(silver|cyanL|glowSoft|mChest|mLock)\b)/g, "@");
const coffre = /<g transform="translate\(0 9\)">[\s\S]*?<\/g><\/g>/.exec(iconeInv)![0];
const masquesInv = [...iconeInv.matchAll(/<mask id="fa-icones-icone-inventaire-(?:mChest|mLock)"[\s\S]*?<\/mask>/g)].map((m) => m[0]);
ok("INVENTAIRE : le COFFRE est celui de ton icône « Mon Inventaire » : ses trois tracés (couvercle, corps, serrure cyan) et ses deux masques sont repris tels quels, dans les deux états", masquesInv.length === 2 && FICHIERS_INV.every((f) => normInv(lire(f)).includes(normInv(coffre)) && masquesInv.every((m) => normInv(lire(f)).includes(normInv(m)))));
const refsCassees = (f: string) => { const t = lire(f), ids = new Set([...t.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])); return [...t.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"|aria-labelledby="([^"]+)"/g)].flatMap((m) => (m[1] ?? m[2] ?? m[3]).split(/\s+/)).filter((r) => !ids.has(r)); };   // `aria-labelledby` peut citer plusieurs identifiants séparés par des espaces (titre et description)
ok("INVENTAIRE : chaque référence interne (url(#…), aria-labelledby) pointe vers un identifiant défini dans le même fichier : sinon le coffre ou sa lueur serait invisible", FICHIERS_INV.every((f) => refsCassees(f).length === 0), FICHIERS_INV.map(refsCassees));
ok("INVENTAIRE : aucun reste du bouton « Load-outs » ni de l'icône d'origine dans les identifiants, et les titres annoncent bien « Inventaire » (et « sélectionné » pour le second)", FICHIERS_INV.every((f) => !/bouton-loadouts|icone-inventaire/.test(lire(f))) && /<title[^>]*>[^<]*Inventaire[^<]*<\/title>/.test(lire(FICHIERS_INV[0])) && /<title[^>]*>[^<]*Inventaire[^<]*sélectionné[^<]*<\/title>/.test(lire(FICHIERS_INV[1])));
for (const [nom, c] of resultats) console.log(c ? "✅" : "❌", nom);
const reussis = resultats.filter((r) => r[1]).length;
console.log(`\n${reussis}/${resultats.length} contrôles réussis`);
process.exit(reussis === resultats.length ? 0 : 1);
