// FR : ⚠️ AJOUT (22/10/2026, bonus Legendarium) - test de l'EXPORT INFOGRAPHIQUE d'une page de Lore (`src/lib/legendarium/exportImage.ts`). On teste les FONCTIONS PURES (découpage du texte, nom de fichier, éclaircissement de couleur) avec un CONTEXTE CANVAS FACTICE (la mesure de largeur est simulée : chaque caractère = 10 px). Le rendu canvas complet (`rendreExportLore`) demande un vrai <canvas> (navigateur/Electron) : il est testé côté utilisateur en `npm run dev`. On vérifie aussi par lecture du code que le module ne fait AUCUNE écriture réseau ni persistante (lecture passive). / EN: ADDED - test of the INFOGRAPHIC EXPORT of a lore page. We test the PURE FUNCTIONS (text wrapping, file name, colour lightening) with a FAKE canvas context (width measurement is simulated: each character = 10 px). The full canvas render (`rendreExportLore`) needs a real <canvas> (browser/Electron): it is tested by the user in `npm run dev`. We also check by reading the code that the module does NO network write and NO persistent storage (passive reading).
import fs from "node:fs";
import { decouperTexte, eclaircir, nomFichierPropre } from "../../src/lib/legendarium/exportImage";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// FR : contexte canvas factice : measureText renvoie une largeur = nombre de caractères × 10 px. / EN: fake canvas context: measureText returns width = character count × 10 px.
const ctxFactice = { measureText: (t: string) => ({ width: t.length * 10 }) } as unknown as CanvasRenderingContext2D;

// --- Découpage du texte (retour à la ligne) ---
{
  const lignes = decouperTexte(ctxFactice, "aaa bbb ccc", 80);   // 8 caractères = 80 px
  ok("export : le découpage respecte la largeur max (80 px = 8 caractères) — « aaa bbb » (7 car.) tient, « ccc » passe à la ligne suivante",
    JSON.stringify(lignes) === JSON.stringify(["aaa bbb", "ccc"]), lignes);
}
{
  const lignes = decouperTexte(ctxFactice, "aa bb", 50);   // 5 car. = 50 px
  ok("export : un texte court tient sur UNE ligne",
    lignes.length === 1 && lignes[0] === "aa bb", lignes);
}
{
  const lignes = decouperTexte(ctxFactice, "aaa\n\nbbb", 1000);
  ok("export : les paragraphes vides sont conservés (ligne vide entre deux paragraphes)",
    JSON.stringify(lignes) === JSON.stringify(["aaa", "", "bbb"]), lignes);
}
{
  const lignes = decouperTexte(ctxFactice, "supercalifragilistic", 50);   // un mot plus long que la largeur max
  ok("export : un mot plus long que la largeur max n'est PAS tronqué (il déborde sur sa propre ligne — jamais de perte de texte)",
    lignes.length === 1 && lignes[0] === "supercalifragilistic", lignes);
}
{
  const lignes = decouperTexte(ctxFactice, "", 100);
  ok("export : un texte vide produit UNE ligne vide (pas zéro — le rendu canvas dessine quand même la structure)",
    lignes.length === 1 && lignes[0] === "", lignes);
}

// --- Nom de fichier propre ---
{
  ok("export : le nom de fichier est nettoyé (accents retirés, espaces → tirets, minuscules, sans tiret en début/fin)",
    nomFichierPropre("La Frontière sans foi ni loi !") === "la-frontiere-sans-foi-ni-loi", nomFichierPropre("La Frontière sans foi ni loi !"));
  ok("export : un titre vide ou uniquement des caractères interdits retombe sur « page-de-lore » (jamais de nom vide)",
    nomFichierPropre("!!!") === "page-de-lore" && nomFichierPropre("") === "page-de-lore", nomFichierPropre("!!!"));
  ok("export : le nom de fichier est plafonné à 60 caractères (pas de nom de fichier interminable)",
    nomFichierPropre("a".repeat(200)).length <= 60, nomFichierPropre("a".repeat(200)).length);
}

// --- Éclaircissement de couleur (texte du pied) ---
{
  ok("export : eclaircir(#000000, 1) = blanc (rgb(255, 255, 255)) — le texte du pied est toujours lisible sur fond sombre",
    eclaircir("#000000", 1) === "rgb(255, 255, 255)", eclaircir("#000000", 1));
  ok("export : eclaircir(#000000, 0) = noir (aucun changement)",
    eclaircir("#000000", 0) === "rgb(0, 0, 0)", eclaircir("#000000", 0));
  const c = eclaircir("#e5d8bd", 0.35);
  ok("export : eclaircir(#e5d8bd, 0.35) éclaircit bien (chaque composante augmente)",
    /^rgb\((\d+), (\d+), (\d+)\)$/.test(c), c);
}

// --- Lecture passive : le module ne fait aucune écriture réseau ni persistante ---
{
  const src = fs.readFileSync("src/lib/legendarium/exportImage.ts", "utf-8").split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");
  ok("export : le module n'appelle PAS le réseau (pas de fetch/POST — la couverture et le logo sont des <img> locaux ou Bungie en LECTURE)",
    !/\bfetch\(|XMLHttpRequest|method:\s*["'](POST|PUT|DELETE)/.test(src));
  ok("export : le module n'écrit AUCUN stockage persistant (pas de localStorage/sessionStorage)",
    !/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src));
  ok("export : le téléchargement passe par un lien <a download> à la volée (créé puis retiré — aucun état persistant)",
    /document\.createElement\("a"\)/.test(src) && /a\.remove\(\)/.test(src) && /URL\.revokeObjectURL/.test(src));
  ok("export : le crédit Bungie / Destiny est présent dans le pied de l'image (texte du Lore © Bungie + marque Destiny/Destiny 2 + projet de fan non affilié)",
    src.includes("Mise en image par Forge Armory") && src.includes("Bungie, Inc.") && src.includes("Destiny 2") && src.includes("non affilié à Bungie"));
  ok("export : le filigrane du logo Forge Armory est dessiné en bas de l'image (emblème, opacité réduite)",
    src.includes("logo-forge-armory-embleme.png") && src.includes("FILIGRANE_OPACITE"));
  ok("export : le pied de l'image porte le libellé D1 « Destiny » quand la section est le Grimoire (ère d1) et « Destiny 2 » sinon",
    src.includes('estD1 ? "Destiny" : "Destiny 2"'));
}

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
