// FR : ⚠️ AJOUT (21/10/2026), demande de l'utilisateur (« les deux boutons doivent être alignés et à la même taille ») - TEST du bouton « Carrière » ÉLARGI à la largeur d'« Accomplissements » (retouche 5 de scripts/retoucher-visuels.mjs) : (1) cadre 4897 x 1024 et catalogue ; (2) les ORIGINAUX (utilisés ailleurs) sont intacts ; (3) la plaque est IDENTIQUE, chiffre pour chiffre, à celle d'Accomplissements, et l'étoile à 0,1 unité près (l'auteur arrondit à une décimale) ; (4) les filets flottants aussi ; (5) le titre et le soulignage sont décalés d'EXACTEMENT 290,5 ; (6) l'anneau et le symbole ne changent pas ; (7) identifiants préfixés, uniques et résolus ; (8) rien de l'ancienne largeur ne reste. Les chemins sont lus par un analyseur écrit ICI (indépendant de l'outil testé). / EN: test of the widened "Career" button.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { FORGE_ASSETS_COMPLEMENT } from "../../src/data/forge/forgeAssetsComplement";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const racine = process.cwd();
const SEL = path.join(racine, "public/assets/selecteur"), ARCHIVE = path.join(racine, "ressources-installateur/forge-armory/app-assets/assets/selecteur");
const lire = (dossier: string, f: string) => fs.readFileSync(path.join(dossier, f), "utf-8");
const sha = (dossier: string, f: string) => crypto.createHash("sha256").update(fs.readFileSync(path.join(dossier, f))).digest("hex");

/** Abscisses d'un tracé en coordonnées absolues (M L C Q A H V Z) ; l'arc A compte 7 nombres, son x est le 6e. */
function abscisses(d: string): number[] {
  const xs: number[] = []; let cmd = "", k = 0;
  for (const j of d.match(/[A-Za-z]|-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? []) {
    if (/[A-Za-z]/.test(j)) { cmd = j; k = 0; continue; }
    const x = cmd === "H" ? true : cmd === "V" ? false : cmd === "A" ? k % 7 === 5 : k % 2 === 0; k++;
    if (x) xs.push(parseFloat(j));
  }
  return xs;
}
const chemins = (svg: string) => [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const bornes = (d: string) => { const xs = abscisses(d); return [Math.min(...xs), Math.max(...xs)] as const; };
const plaque = (svg: string) => chemins(svg).filter((d) => { const [a, b] = bornes(d); return a < 1100 && b > 4000; });
const texte = (svg: string) => chemins(svg).filter((d) => bornes(d)[0] >= 1100);
const symbole = (svg: string) => chemins(svg).filter((d) => bornes(d)[1] < 1100);
const filets = (svg: string) => [...svg.matchAll(/<rect x="1010" y="(?:220|800)"[^>]*>/g)].map((m) => m[0].replace(/fa-selecteur-bouton-[a-z-]+?-fadeH/, "FADE"));

for (const etat of ["", "-selectionne"]) {
  const nom = etat ? "sélectionné" : "repos";
  const large = lire(SEL, `bouton-carriere-large${etat}.svg`), etroit = lire(SEL, `bouton-carriere${etat}.svg`), accompl = lire(SEL, `bouton-accomplissements${etat}.svg`);
  ok(`[${nom}] CADRE : le fichier élargi a le cadre 4897 × 1024 (celui d'Accomplissements), l'original reste en 4316 × 1024`, /viewBox="0 0 4897 1024"/.test(large) && /viewBox="0 0 4316 1024"/.test(etroit) && /viewBox="0 0 4897 1024"/.test(accompl));
  ok(`[${nom}] PLAQUE : les trois tracés de la plaque élargie sont IDENTIQUES, chiffre pour chiffre, à ceux d'Accomplissements (même largeur) : l'élargissement reproduit exactement le dessin de l'auteur`, plaque(large).length === 3 && JSON.stringify(plaque(large)) === JSON.stringify(plaque(accompl)), [plaque(large).map((d) => d.slice(0, 60)), plaque(accompl).map((d) => d.slice(0, 60))]);
  ok(`[${nom}] FILETS FLOTTANTS : les deux filets ont les mêmes position et largeur (3715) que ceux d'Accomplissements`, filets(large).length === 2 && JSON.stringify(filets(large)) === JSON.stringify(filets(accompl)), [filets(large), filets(accompl)]);
  const t0 = texte(etroit), t1 = texte(large);
  const decalage = t0.length === t1.length && t0.every((d, i) => { const a = abscisses(d), b = abscisses(t1[i]); return a.length === b.length && a.every((x, j) => Math.abs(b[j] - x - 290.5) < 0.002); });
  ok(`[${nom}] TITRE, SOULIGNAGE ET ÉTOILE : ${t0.length} tracés, chacun décalé d'EXACTEMENT 290,5 vers la droite (la moitié de l'allongement) : recentrés, sans aucune déformation`, t0.length >= 4 && decalage, t0.length);
  const etoile = (svg: string) => texte(svg).filter((d) => abscisses(d).length <= 8).sort();
  // Les coordonnées de l'auteur sont arrondies à UNE décimale : l'étoile élargie diffère de la sienne d'au plus 0,1 unité (0,1 sur 4897 : moins de 0,003 px à l'écran).
  const memeAu1Dixieme = (a: string, b: string) => { const na = a.match(/-?\d+(?:\.\d+)?/g)!.map(Number), nb = b.match(/-?\d+(?:\.\d+)?/g)!.map(Number); return a.replace(/-?\d+(?:\.\d+)?/g, "#") === b.replace(/-?\d+(?:\.\d+)?/g, "#") && na.length === nb.length && na.every((x, i) => Math.abs(x - nb[i]) <= 0.1001); };
  ok(`[${nom}] ÉTOILE : l'étoile centrale (2 tracés) tombe là où est celle d'Accomplissements (mêmes commandes, chaque coordonnée à 0,1 unité près : l'auteur arrondit à une décimale)`, etoile(large).length === 2 && etoile(large).every((d, i) => memeAu1Dixieme(d, etoile(accompl)[i])), [etoile(large), etoile(accompl)]);
  ok(`[${nom}] ANNEAU ET SYMBOLE : le cercle et tous les tracés du symbole sont IDENTIQUES à ceux de l'original (rien n'est déformé ni déplacé)`, JSON.stringify(symbole(large)) === JSON.stringify(symbole(etroit)) && symbole(large).length === 2 && /<circle cx="512" cy="512" r="436"/.test(large), symbole(large).length);
  const pref = etat ? "fa-selecteur-bouton-carriere-large-selectionne-" : "fa-selecteur-bouton-carriere-large-";
  const ids = [...large.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const refs = [...large.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
  const labelled = (/aria-labelledby="([^"]+)"/.exec(large)?.[1] ?? "").split(/\s+/);
  ok(`[${nom}] IDENTIFIANTS : tous préfixés « ${pref} », uniques, aucun ne garde l'ancien préfixe, et chaque référence (dégradés, filtres, aria-labelledby) pointe vers un identifiant existant`, ids.length > 8 && ids.every((i) => i.startsWith(pref)) && new Set(ids).size === ids.length && refs.every((r) => ids.includes(r)) && labelled.every((l) => ids.includes(l)) && !/fa-selecteur-bouton-carriere-(?!large)/.test(large), { ids: ids.length, hors: ids.filter((i) => !i.startsWith(pref)), refs: refs.filter((r) => !ids.includes(r)) });
  ok(`[${nom}] PLUS RIEN DE L'ANCIENNE LARGEUR : ni « 4316 », ni filet de 3134, ni bord de plaque à 4245,7`, !/4316|width="3134"|4245\.7/.test(large), [large.includes("4316"), large.includes("4245.7")]);
  ok(`[${nom}] ORIGINAL INTACT : le fichier d'origine de Carrière (utilisé par le tiroir « Solo sans mourir ») est identique, octet pour octet, à celui de l'archive du kit`, sha(SEL, `bouton-carriere${etat}.svg`) === sha(ARCHIVE, `bouton-carriere${etat}.svg`));
}
const entrees = FORGE_ASSETS_COMPLEMENT.filter((a) => a.id.startsWith("selecteur.carriere-large."));
ok("CATALOGUE : les deux entrées `selecteur.carriere-large.repos` et `.selectionne` existent, en 4897 × 1024 (ratio 4,7822), avec des fichiers présents ; chacune reprend le ratio de son fichier", entrees.length === 2 && entrees.every((a) => a.largeur === 4897 && a.hauteur === 1024 && Math.abs(a.ratio - 4897 / 1024) < 0.001 && fs.existsSync(path.join(racine, "public", a.fichier)) && new RegExp(`viewBox="0 0 ${a.largeur} ${a.hauteur}"`).test(fs.readFileSync(path.join(racine, "public", a.fichier), "utf-8"))), entrees.map((a) => a.id));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
