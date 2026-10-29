// FR : ⚠️ AJOUT (28/10/2026, branche Import-optimiseur) - GARDE ANTI-RÉGRESSION sur l'affichage des Sceaux de la page « Accomplissements ». CONTEXTE : le commit acf0228 (résolution d'un stash par l'utilisateur) avait embarqué une ANCIENNE version de `VueAccomplissements.tsx` + `tests/ui/vue-accomplissements.py` (sceaux en LIGNES, style Legendarium), antérieure à la livraison v0.5.5 (cartes CARRÉES identiques, TODO n°23, livrée le 24/10). Corrigé dans bc83d32 par restauration à l'identique de origin/main. Le ZIP de développement « Optimisation » de l'utilisateur date d'AVANT ce correctif : tout import depuis ce ZIP risque de ramener la vieille version. Ce test de CÂBLAGE (il lit le TEXTE du code, comme `cablage-forge.test.ts`) vérifie les MARQUEURS des cartes carrées dans le composant ET dans son test d'interface — les DEUX fichiers doivent avancer ensemble. Si l'un régresse (ou les deux), la batterie échoue AVANT tout merge.
// EN: ADDED - anti-regression guard on the Seal display of the "Accomplishments" page. The user's "Optimization" dev ZIP predates the square-cards fix (bc83d32): any import from it may bring the old line-style version back. This wiring test (reads code text) checks the square-card MARKERS in the component AND in its UI test — both files must move together.
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 600)); };

const page = fs.readFileSync("src/components/VueAccomplissements.tsx", "utf-8");
const testUI = fs.readFileSync("tests/ui/vue-accomplissements.py", "utf-8");
// le CODE seulement (sans les commentaires d'en-tête, qui documentent justement l'historique)
const codePage = page.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

ok("la zone cliquable de chaque carte de sceau est un CARRÉ : `aspectRatio: \"1 / 1\"` + `boxSizing: \"border-box\"` + `overflow: \"hidden\"` (livraison v0.5.5, TODO n°23, 24/10)",
  /aspectRatio:\s*"1 \/ 1"/.test(codePage) && /boxSizing:\s*"border-box"/.test(codePage) && /overflow:\s*"hidden"/.test(codePage) && /justifyContent:\s*"center"/.test(codePage));
ok("le nom du sceau est tronqué à 2 lignes max (ellipsis + infobulle) et le titre à 1 ligne : `WebkitLineClamp` (≥ 2) + `title={sceau.nom}`",
  (codePage.match(/WebkitLineClamp/g) ?? []).length >= 2 && /title=\{sceau\.nom\}/.test(codePage));
ok("la zone barre + pourcentage est à HAUTEUR FIXE sous le carré : `data-zone-progression` + `flexShrink: 0` (toutes les cartes ont la MÊME hauteur totale)",
  /data-zone-progression/.test(codePage) && /flexShrink:\s*0/.test(codePage));
ok("les sceaux sont en CARTES DANS UNE GRILLE (plusieurs par ligne) : `data-grille-sceaux` + `gridTemplateColumns: \"repeat(auto-fill, …)\"` — PAS une liste en ligne (`display: flex` + `flexDirection: row` sur le conteneur des sceaux)",
  /data-grille-sceaux/.test(codePage) && /gridTemplateColumns:\s*"repeat\(auto-fill/.test(codePage) && !/display:\s*"flex",\s*flexDirection:\s*"row"/.test(codePage));
ok("le TEST D'INTERFACE avance AVEC le composant (mêmes marqueurs : `aspectRatio: \"1 / 1\"`, `WebkitLineClamp`, `data-zone-progression`, `flexShrink: 0`) — les deux fichiers ont été restaurés ensemble dans bc83d32, ils doivent le rester",
  /aspectRatio:\\?\s*"1 \/ 1"|aspectRatio: "1 \/ 1"/.test(testUI) && /WebkitLineClamp/.test(testUI) && /data-zone-progression/.test(testUI) && /flexShrink: 0/.test(testUI));
ok("le test d'interface mesure bien des CARRÉS IDENTIQUES en navigateur (largeurs égales ±1 px, hauteurs égales ±1 px, zone cliquable carrée ±2 px)",
  /max\(largeurs\) - min\(largeurs\) <= 1/.test(testUI) && /max\(hauteurs\) - min\(hauteurs\) <= 1/.test(testUI) && /abs\(s\["titreBox"\]\["w"\] - s\["titreBox"\]\["h"\]\) <= 2/.test(testUI));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
