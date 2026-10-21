// FR : ⚠️ AJOUT (21/10/2026), retour de l'utilisateur (« le diagnostic statIds retournés ne s'ouvre pas ») - TEST de `formaterDiagnosticCarriere` : le texte du diagnostic de la fenêtre « Carrière » dit TOUJOURS quelque chose, quel que soit le cas : réponse complète, requête en échec (avant : l'erreur était avalée et le texte vide), réponse vide, réponse dont la structure n'est pas celle attendue (pas de `mergedAllCharacters`), historiques d'activités en échec. / EN: test of the dev-diagnostic text; it always says something.
import { formaterDiagnosticCarriere, type DonneesCarriere } from "../../src/lib/bungie/carriere";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 600)); };
const base = (surcharge: Partial<DonneesCarriere["diagnostic"]> = {}, statIdsBruts: string[] = []): DonneesCarriere => ({
  stats: [], minutesParClasse: null, activites: [], statIdsBruts,
  diagnostic: { requeteStats: "/Destiny2/3/Account/42/Stats/", erreurStats: null, clesReponseStats: ["mergedAllCharacters"], nbMetrics: statIdsBruts.length, erreursActivites: [], ...surcharge },
});

const complet = formaterDiagnosticCarriere(base({}, ["kills", "deaths", "assists"])).split("\n");
ok("RÉPONSE COMPLÈTE : « statIds retournés : 3 », puis les trois statIds dans l'ordre de la réponse, puis la requête, « erreur de la requête : aucune », les clés de la réponse et le nombre d'entrées de « metrics »", complet[0] === "statIds retournés : 3" && complet.slice(1, 4).join() === "kills,deaths,assists" && complet.includes("requête : GET /Destiny2/3/Account/42/Stats/") && complet.includes("erreur de la requête : aucune") && complet.includes("clés de la réponse : mergedAllCharacters") && complet.includes("entrées de « mergedAllCharacters » : 3") && complet.includes("historiques d'activités en échec : aucun"), complet);

const echec = formaterDiagnosticCarriere(base({ erreurStats: "Appel Bungie API échoué (/Destiny2/Stats/…) : 404 — Not Found", clesReponseStats: null, nbMetrics: null })).split("\n");
ok("REQUÊTE EN ÉCHEC (le cas où le diagnostic « ne s'ouvrait pas ») : « statIds retournés : AUCUN », l'erreur COMPLÈTE avec son code 404, « pas de réponse : la requête a échoué », « champ absent de la réponse » : le texte n'est JAMAIS vide", echec[0] === "statIds retournés : AUCUN" && echec.includes("erreur de la requête : Appel Bungie API échoué (/Destiny2/Stats/…) : 404 — Not Found") && echec.some((l) => l.includes("pas de réponse : la requête a échoué")) && echec.includes("entrées de « mergedAllCharacters » : champ absent de la réponse"), echec);

ok("RÉPONSE VIDE (la requête a réussi mais ne contient rien) : « (réponse vide) » et non pas une ligne blanche", formaterDiagnosticCarriere(base({ clesReponseStats: [], nbMetrics: null })).includes("clés de la réponse : (réponse vide)"));
const inattendue = formaterDiagnosticCarriere(base({ clesReponseStats: ["mergedAllCharacters", "characters"], nbMetrics: null }));
ok("STRUCTURE INATTENDUE (la réponse n'a pas de « mergedAllCharacters » : le code lit peut-être le mauvais champ) : le diagnostic LISTE les clés réellement reçues et dit que « mergedAllCharacters » est absent : c'est ce qui permet de corriger la lecture sur des données réelles", inattendue.includes("statIds retournés : AUCUN") && inattendue.includes("clés de la réponse : mergedAllCharacters, characters") && inattendue.includes("entrées de « mergedAllCharacters » : champ absent de la réponse"), inattendue);
const act = formaterDiagnosticCarriere(base({ erreursActivites: ["Titan (1) : 500", "Arcaniste (3) : 503"] }, ["kills"])).split("\n");
ok("HISTORIQUES D'ACTIVITÉS EN ÉCHEC : une ligne par personnage (classe, identifiant, erreur) sous « historiques d'activités en échec »", act.includes("  - Titan (1) : 500") && act.includes("  - Arcaniste (3) : 503") && !act.includes("historiques d'activités en échec : aucun"), act);
ok("INVARIANTS : quel que soit le cas, le diagnostic n'est jamais vide, commence par la ligne des statIds et contient toujours la requête et l'erreur", [complet, echec].every((l) => l.length > 5 && /^statIds retournés : (\d+|AUCUN)$/.test(l[0]) && l.some((x) => x.startsWith("requête : GET ")) && l.some((x) => x.startsWith("erreur de la requête : "))));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
