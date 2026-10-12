// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - les icônes de classe et d'élément s'affichent EXACTEMENT comme avant le partage de leurs tracés avec l'export infographique : le rendu actuel est comparé à un instantané pris sur le code d'AVANT (zip 0.3.19), dans `instantanes/icones.json`.
// EN: ⚠️ ADDED - class and element icons render exactly as before their drawing data was shared with the export page (snapshot taken from the pre-change code).
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import IconeElement from "../../src/components/icones/IconeElement";
import IconeClasse from "../../src/components/icones/IconeClasse";

const attendu: Record<string, string> = JSON.parse(fs.readFileSync("tests/logique/instantanes/icones.json", "utf-8"));
const actuel: Record<string, string> = {};
for (const e of ["solaire", "arc", "abyssal", "stase", "filobscur", "prismatique"] as const) actuel[`element:${e}`] = renderToStaticMarkup(<IconeElement element={e} taille={20} />);
actuel["element:officielle"] = renderToStaticMarkup(<IconeElement element="solaire" taille={20} urlOfficielle="https://www.bungie.net/x.png" />);
for (const c of ["chasseur", "titan", "arcaniste"] as const) actuel[`classe:${c}`] = renderToStaticMarkup(<IconeClasse classe={c} taille={24} />);
let reussis = 0; const cles = Object.keys(attendu);
for (const k of cles) { const bon = attendu[k] === actuel[k]; if (bon) reussis++; console.log(bon ? "✅" : "❌", `rendu de l'icône « ${k} » identique à celui d'avant le partage des tracés`); if (!bon) console.log("   attendu :", attendu[k].slice(0, 160), "\n   obtenu  :", (actuel[k] ?? "(absent)").slice(0, 160)); }
const prisma = actuel["element:prismatique"];
const bonPrisma = (prisma.match(/<path /g) ?? []).length === 6;
console.log(bonPrisma ? "✅" : "❌", "le symbole Prismatique garde ses 6 tracés à deux tons"); if (bonPrisma) reussis++;
console.log(`\n${reussis}/${cles.length + 1} contrôles réussis`);
process.exit(reussis === cles.length + 1 ? 0 : 1);
