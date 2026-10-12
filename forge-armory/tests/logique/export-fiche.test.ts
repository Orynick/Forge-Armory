// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - test de l'EXPORT INFOGRAPHIQUE (`ficheVersHtml`) après l'ajout des logos : logos de section (Doctrine élémentaire, Artefact ; Armes et Armure à venir), icônes de classe, d'élément et de contexte dans l'en-tête, et règles
// de SÉCURITÉ de la page autonome (aucun script, images uniquement depuis www.bungie.net). EN: ⚠️ ADDED - test of the infographic export after adding the logos.
import fs from "node:fs";
import { ficheVersHtml } from "../../src/lib/loadouts/exportFiche";
import { LOGOS_EXPORT } from "../../src/data/forge/logosExport";
import { COULEURS as COULEURS_CLASSE, CHEMINS_SVG as CHEMINS_CLASSE } from "../../src/components/icones/IconeClasse";
import { FORMES as FORMES_ELEMENT, PRISMATIQUE_TRACES } from "../../src/components/icones/IconeElement";
// @ts-ignore - module .mjs sans types
import { contenuModule } from "../../scripts/generer-logos-export.mjs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 400)); };
const fiche = (sur: Record<string, unknown> = {}) => ({
  nom: "Test de la Forge", classe: "Titan", element: "Solaire", classeCle: "titan", elementCle: "solaire", elementIcone: "https://www.bungie.net/common/destiny2_content/icons/test.png",
  contexte: "PvE DPS", contexteCle: "dps", enregistreLe: "12/10/2026", auteur: "Orynick#1234", manifestDisponible: true,
  doctrine: [{ libelle: "Super", valeur: { nom: "Marteau de Sol" } }], aspects: [], fragments: [], armes: [], armure: [], stats: [], bonusSets: [], artefact: { nom: "Artefact de test", perks: [] }, ...sur,
}) as never;
const html = (sur?: Record<string, unknown>) => ficheVersHtml(fiche(sur), "0.4.0");
const entete = (h: string) => /<header class="carte entete">[\s\S]*?<\/header>/.exec(h)![0];

// ---------- logos de section ----------
const h = html();
ok("DOCTRINE : le titre de la section porte le logo « Doctrine élémentaire » (l'icône du pilier 1 de la charte, intégrée en SVG)", /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>DOCTRINE<\/h2>/.test(h) && h.includes("fa-icones-icone-doctrine-"));
ok("ARTEFACT : le titre de la section porte le logo « Artefact »", /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>ARTEFACT<\/h2>/.test(h) && h.includes("fa-icones-icone-artefact-"));
ok("ARMES et ARMURE : pas encore de logo (« à venir ») : leurs titres sont exactement ceux d'avant, sans logo", h.includes("<h2>ARMES</h2>") && h.includes("<h2>ARMURE</h2>") && !LOGOS_EXPORT.armes && !LOGOS_EXPORT.armure);
// ---------- en-tête : classe, élément, contexte ----------
const e = entete(h);
ok("en-tête : icône de CLASSE (disque de la couleur de la classe, symbole de l'appli) devant « Titan »", e.includes(`class="ic-classe"`) && e.includes(`background:${COULEURS_CLASSE.titan}`) && e.includes(CHEMINS_CLASSE.titan) && /<\/span>Titan/.test(e), e);
ok("en-tête : icône d'ÉLÉMENT officielle de Bungie (adresse www.bungie.net) devant « Solaire »", /<img class="ic-element" src="https:\/\/www\.bungie\.net\/common\/destiny2_content\/icons\/test\.png"[^>]*>Solaire/.test(e), e);
ok("en-tête : une adresse d'icône qui n'est PAS sur www.bungie.net est refusée (la sécurité de la page ne l'autoriserait pas) : l'export retombe sur le dessin de l'appli", (() => { const x = entete(html({ elementIcone: "https://exemple.invalide/icone.png" })); return !x.includes("exemple.invalide") && x.includes(FORMES_ELEMENT.solaire); })());
ok("en-tête : sans icône officielle (Manifest absent), le dessin de l'appli est utilisé (forme et couleur de l'élément)", entete(html({ elementIcone: undefined })).includes(FORMES_ELEMENT.solaire));
ok("en-tête : PRISMATIQUE sans icône officielle : le symbole à deux tons de l'appli, ses 6 tracés", (() => { const x = entete(html({ element: "Prismatique", elementCle: "prismatique", elementIcone: undefined })); return PRISMATIQUE_TRACES.every((t) => x.includes(t.d)); })());
const contextes = ["neutre", "roaming", "dps", "pvp"] as const, libelles = { neutre: "Neutre", roaming: "PvE Roaming", dps: "PvE DPS", pvp: "PvP" };
ok("en-tête : chacun des 4 contextes affiche SA propre icône (et pas celle d'un autre) avec son libellé, Neutre compris", contextes.every((c) => { const x = entete(html({ contexteCle: c, contexte: libelles[c] })); return x.includes(`fa-icones-icone-${c}-`) && contextes.filter((d) => d !== c).every((d) => !x.includes(`fa-icones-icone-${d}-`)) && x.includes(libelles[c]); }));
ok("FICHE ANCIENNE (sans clé de classe ni d'élément) : le texte reste, sans icône de classe ni d'élément, et la page se génère sans erreur", (() => { const x = entete(html({ classeCle: undefined, elementCle: undefined, elementIcone: undefined })); return x.includes("Titan") && x.includes("Solaire") && !x.includes("ic-classe") && !x.includes("ic-element"); })());
ok("une fiche sans classe ni élément choisis : seul le contexte figure dans le sous-titre", (() => { const x = entete(html({ classe: undefined, element: undefined, classeCle: undefined, elementCle: undefined, elementIcone: undefined })); return !x.includes("ic-classe") && !x.includes("ic-element") && x.includes("PvE DPS"); })());
// ---------- sécurité de la page autonome ----------
ok("SÉCURITÉ : la politique de sécurité n'a pas changé (aucune ressource par défaut ; images : uniquement www.bungie.net) et aucun script", h.includes(`content="default-src 'none'; img-src https://www.bungie.net/; style-src 'unsafe-inline'"`) && !/<script/i.test(h));
ok("SÉCURITÉ : toutes les adresses d'image de la page sont sur www.bungie.net (aucun fichier local, aucune adresse « data: »)", [...h.matchAll(/\ssrc="([^"]*)"/g)].every((m) => m[1].startsWith("https://www.bungie.net/")) && !/url\(\s*['"]?data:|href="http/i.test(h));
const ids = [...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
ok(`les identifiants internes de la page sont uniques (${ids.length}) : aucun logo ne perturbe l'emblème ni un autre logo`, new Set(ids).size === ids.length, ids.filter((x, i) => ids.indexOf(x) !== i));
ok("la page est déterministe : mêmes données, même page", html() === html());
ok("le module des logos intégrés est À JOUR par rapport aux fichiers de public/assets/icones (relancer `node scripts/generer-logos-export.mjs` sinon)", fs.readFileSync("src/data/forge/logosExport.ts", "utf-8") === contenuModule(process.cwd()));
ok("les logos intégrés ne contiennent ni script ni image externe, et sont allégés (pas de prologue XML ni de titre)", Object.values(LOGOS_EXPORT).every((s) => !/<script|<image|href=|<\?xml|<title/.test(s as string)));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
if (process.argv.includes("--page")) fs.writeFileSync("tests/logique/_sortie/export-apercu.html", html());
process.exit(res.every(Boolean) ? 0 : 1);
