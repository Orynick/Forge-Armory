// FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - test de la RECOLORATION des icônes de saut et de compétence de classe du FILOBSCUR (bug « fond bleu de la Stase » : les objets du Filobscur réutilisent les fichiers d'icône de la Stase, prouvé par le diagnostic de l'utilisateur).
// Règle pure, lecture des icônes de la Stase dans une fausse base, export HTML et fiche à l'écran. La couleur obtenue est vérifiée dans un navigateur par `tests/ui/teinte.py`. EN: ⚠️ ADDED - test of the Strand icon recolouring.
import { renderToStaticMarkup } from "react-dom/server";
import { iconeDoctrineEstTeintee, iconeDoctrineATeinter, obtenirUrlsIconesStase } from "../../src/lib/manifest/doctrine";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";
import { FILTRE_STASE_VERS_FILOBSCUR } from "../../src/data/teinteIconesDoctrine";
import { ficheVersHtml } from "../../src/lib/loadouts/exportFiche";
import FicheBuild from "../../src/components/FicheBuild";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 400)); };
const BUNGIE = "https://www.bungie.net";
const URL_STASE = `${BUNGIE}/common/destiny2_content/icons/3321f82be875774d96615fb2242079b5.png`;   // « Saut élevé » : le MÊME fichier en Stase et en Filobscur (diagnostic du Chasseur)
const URL_AUTRE = `${BUNGIE}/common/destiny2_content/icons/46620e1f142778a0d429be7a12c39f21.png`;   // mêlée du Filobscur : fichier distinct
const stase = new Set([URL_STASE]);
// ---------- la règle pure ----------
ok("Filobscur + saut + fichier d'icône identique à un fichier de la Stase : recoloré", iconeDoctrineEstTeintee("filobscur", "saut", URL_STASE, stase));
ok("Filobscur + compétence de classe + fichier identique à celui de la Stase : recoloré", iconeDoctrineEstTeintee("filobscur", "classe", URL_STASE, stase));
ok("Filobscur + saut mais fichier DIFFÉRENT de ceux de la Stase (Bungie a livré une vraie icône verte) : PAS recoloré, la correction s'éteint toute seule", !iconeDoctrineEstTeintee("filobscur", "saut", URL_AUTRE, stase));
ok("les autres catégories (mêlée, grenade, super, aspect, fragment) ne sont jamais recolorées, même avec un fichier de la Stase : leurs icônes sont distinctes dans les données", ["melee", "grenade", "super", "aspect", "fragment", "autre", undefined].every((c) => !iconeDoctrineEstTeintee("filobscur", c, URL_STASE, stase)));
ok("la Stase elle-même et les autres éléments (Solaire, Cryo-électrique/Arc, Abyssal, Prismatique) ne sont jamais recolorés ; ni sans élément", ["stase", "solaire", "arc", "abyssal", "prismatique", null, undefined].every((e) => !iconeDoctrineEstTeintee(e, "saut", URL_STASE, stase)));
ok("sans adresse d'icône : rien à recolorer", !iconeDoctrineEstTeintee("filobscur", "saut", undefined, stase) && !iconeDoctrineEstTeintee("filobscur", "classe", "", stase));
// ---------- la lecture du Manifest (fausse base) ----------
const T = "DestinyInventoryItemDefinition", C = "DestinySocketCategoryDefinition";
const DEFS: Record<string, unknown> = {
  [`${T}:${hashVersIdSqlite(873720784)}`]: { displayProperties: { name: "Revenant" }, sockets: { socketCategories: [{ socketCategoryHash: 9001, socketIndexes: [0] }], socketEntries: [{ reusablePlugItems: [{ plugItemHash: 7001 }] }] } },   // sous-classe STASE du Chasseur (hash connu de la carte)
  [`${C}:${hashVersIdSqlite(9001)}`]: { displayProperties: { name: "Saut" } },
  [`${T}:${hashVersIdSqlite(7001)}`]: { displayProperties: { name: "Saut élevé", icon: "/common/destiny2_content/icons/3321f82be875774d96615fb2242079b5.png", description: "" } },
};
let lectures = 0;
const fausseDb = { prepare: (sql: string) => { const table = /FROM (\w+)/.exec(sql)?.[1] ?? ""; let id = 0; return { bind: (a: number[]) => { id = a[0]; lectures++; }, step: () => `${table}:${id}` in DEFS, getAsObject: () => ({ json: JSON.stringify(DEFS[`${table}:${id}`]) }), free: () => {} }; } } as never;
const urls = obtenirUrlsIconesStase(fausseDb);
ok("les icônes de la Stase sont lues dans le Manifest (sous-classes Stase des trois classes ; ici seule celle du Chasseur existe dans la fausse base, les autres sont ignorées sans erreur)", urls.size === 1 && urls.has(URL_STASE), [...urls]);
const avant = lectures; obtenirUrlsIconesStase(fausseDb);
ok("cet ensemble est mis en cache : le relire n'interroge plus la base", lectures === avant, [avant, lectures]);
ok("bout en bout : le « Saut élevé » du Filobscur (fichier de la Stase) est marqué à recolorer, une icône inconnue non", iconeDoctrineATeinter(fausseDb, "filobscur", "saut", URL_STASE) && !iconeDoctrineATeinter(fausseDb, "filobscur", "saut", URL_AUTRE));
const dbInterdite = { prepare: () => { throw new Error("la base ne doit PAS être lue"); } } as never;
ok("la base n'est lue QUE pour un saut ou une compétence de classe en Filobscur : pour la Stase, le Solaire, la mêlée ou sans icône, aucune lecture (aucun coût pour le reste de l'appli)", (() => { try { return !iconeDoctrineATeinter(dbInterdite, "stase", "saut", URL_STASE) && !iconeDoctrineATeinter(dbInterdite, "solaire", "classe", URL_STASE) && !iconeDoctrineATeinter(dbInterdite, "filobscur", "melee", URL_STASE) && !iconeDoctrineATeinter(dbInterdite, "filobscur", "saut", undefined); } catch { return false; } })());
// ---------- l'export HTML et la fiche à l'écran ----------
const ligne = (libelle: string, nom: string, fichier: string, teinte?: boolean) => ({ libelle, valeur: { nom, icone: `${BUNGIE}/common/destiny2_content/icons/${fichier}.png`, ...(teinte ? { teinteFilobscur: true } : {}) } });
const fiche = { nom: "Test", classe: "Chasseur", element: "Filobscur", classeCle: "chasseur", elementCle: "filobscur", contexte: "Neutre", contexteCle: "neutre", enregistreLe: "12/10/2026", manifestDisponible: true, doctrine: [ligne("Super", "Frappe soyeuse", "super"), ligne("Compétence de classe", "Esquive du sniper", "classe", true), ligne("Saut", "Saut élevé", "saut", true)], aspects: [], fragments: [], armes: [], armure: [], stats: [], bonusSets: [] } as never;
const html = ficheVersHtml(fiche, "0.4.1");
const img = (f: string) => new RegExp(`<img src="${BUNGIE}/common/destiny2_content/icons/${f}\\.png" alt=""([^>]*)>`).exec(html)?.[1] ?? null;
ok("EXPORT : les icônes de la compétence de classe et du saut du Filobscur portent le filtre de recoloration, la super n'en a pas", img("classe")?.includes(`style="filter:${FILTRE_STASE_VERS_FILOBSCUR}"`) && img("saut")?.includes(`filter:${FILTRE_STASE_VERS_FILOBSCUR}`) && img("super") === "", [img("classe"), img("saut"), img("super")]);
ok("EXPORT : sans marque (fiche ancienne ou autre élément) le HTML des icônes est strictement celui d'avant : aucun attribut de style", !ficheVersHtml({ ...(fiche as object), doctrine: [ligne("Saut", "Saut élevé", "saut")] } as never, "0.4.1").includes("filter:hue-rotate"));
(globalThis as unknown as { window: unknown }).window = globalThis;   // le rendu serveur de la fiche lit `window` (indisponible sous Node)
let rendu = ""; try { rendu = renderToStaticMarkup(<FicheBuild fiche={fiche} onExporter={() => {}} onFermer={() => {}} />); } catch (e) { rendu = "ERREUR " + (e as Error).message; }
const miniature = (f: string) => new RegExp(`<img src="${BUNGIE}/common/destiny2_content/icons/${f}\\.png"[^>]*>`).exec(rendu)?.[0] ?? "";
ok("FICHE À L'ÉCRAN : mêmes icônes recolorées (compétence de classe, saut), pas la super", rendu.length > 500 && miniature("classe").includes("filter:hue-rotate") && miniature("saut").includes("filter:hue-rotate") && !miniature("super").includes("filter"), rendu.slice(0, 200));
ok("le réglage de couleur est une rotation de teinte vers le vert, entre −60° et −80° (calibré à −70° par mesure : Stase ≈ 214° → Filobscur ≈ 157° ; la mesure elle-même est dans tests/ui/teinte.py)", /^hue-rotate\((-\d+)deg\)$/.test(FILTRE_STASE_VERS_FILOBSCUR) && (() => { const n = Number(/(-\d+)/.exec(FILTRE_STASE_VERS_FILOBSCUR)![1]); return n <= -60 && n >= -80; })(), FILTRE_STASE_VERS_FILOBSCUR);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
