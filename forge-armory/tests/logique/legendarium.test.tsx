// FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - test du RENOMMAGE « Bibliothèque » → « LEGENDARIUM » (demande de l'utilisateur, archive de visuels v5) : la PAGE (titre et message) et le SÉLECTEUR (noms accessibles, images) ; plus aucune trace de l'ancien nom à l'écran. L'identifiant interne `bibliotheque` est conservé exprès (la vue choisie est mémorisée).
// EN: ⚠️ ADDED - test of the "Library" → "Legendarium" rename: the page and the selector show only the new name; the internal id is kept on purpose.
import { renderToStaticMarkup } from "react-dom/server";
import Bibliotheque from "../../src/components/Bibliotheque";
import SelecteurVues from "../../src/components/SelecteurVues";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 500)); };
const texte = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();   // le rendu écrit l'apostrophe « &#x27; »
const sans = texte(renderToStaticMarkup(<Bibliotheque db={null} />)), avec = texte(renderToStaticMarkup(<Bibliotheque db={{} as never} />));
ok("la PAGE s'intitule « Legendarium » (Manifest non chargé comme chargé)", /^Legendarium\b/.test(sans) && /^Legendarium\b/.test(avec), [sans.slice(0, 60), avec.slice(0, 60)]);
ok("le message du Manifest chargé parle du Legendarium", avec.includes("le Legendarium aura tout ce qu'il lui faut") && sans.includes("Manifest pas encore chargé"), avec);
ok("plus aucune trace de « Bibliothèque » à l'écran (page avec ou sans Manifest)", !/biblioth/i.test(sans) && !/biblioth/i.test(avec), [sans, avec]);
const sel = renderToStaticMarkup(<SelecteurVues vue="analyseur" onChanger={() => {}} />);
const boutons = [...sel.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
ok("le SÉLECTEUR a quatre boutons dont les noms accessibles sont, dans l'ordre : Build Analyzer, Load-outs, Forge, Legendarium", JSON.stringify(boutons.map((b) => /aria-label="([^"]*)"/.exec(b)?.[1])) === JSON.stringify(["Build Analyzer", "Load-outs", "Forge", "Legendarium"]), boutons);
ok("le quatrième bouton garde l'identifiant interne « bibliotheque » (vue mémorisée) mais utilise les images Legendarium : bouton-legendarium.svg et bouton-legendarium-selectionne.svg", /data-vue="bibliotheque"/.test(boutons[3]) && sel.includes("bouton-legendarium.svg") && sel.includes("bouton-legendarium-selectionne.svg") && !/biblioth/i.test(sel.replace(/data-vue="bibliotheque"/g, "")), sel.match(/src="[^"]*"/g));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
