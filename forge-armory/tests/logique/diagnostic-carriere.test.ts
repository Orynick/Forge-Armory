// FR : ⚠️ AJOUT (21/10/2026), retour de l'utilisateur (« le diagnostic statIds retournés ne s'ouvre pas ») - TEST de `formaterDiagnosticCarriere` : le texte du diagnostic de la fenêtre « Carrière » dit TOUJOURS quelque chose, quel que soit le cas : réponse complète, requête en échec (avant : l'erreur était avalée et le texte vide), réponse vide, réponse dont la structure n'est pas celle attendue (pas de `mergedAllCharacters`). ⚠️ CHANGÉ (22/10/2026) : le cas « historiques d'activités en échec » est REMPLACÉ par un contrôle de suppression (la section « 10 dernières activités » et son chargement sont supprimés).
// ⚠️ AJOUT (22/10/2026, retour RÉEL : « statIds retournés : AUCUN » alors que `mergedAllCharacters` contenait 2 entrées) - TEST de `extraireStatsCarriere` : la structure RÉELLE de GetHistoricalStatsForAccount est `mergedAllCharacters: { results: { <mode>: { allTime: { <statId>: {...} } } }, merged: { allTime: { <statId>: {...} } } }` — les stats « Carrière » sont lues dans `merged.allTime` (agrégat du filtre « Carrière » du jeu), sinon SOMME des `results.<mode>.allTime`.
// EN: test of the dev-diagnostic text (it always says something) and of the career-stats parsing (real response structure).
import { extraireStatsCarriere, formaterDiagnosticCarriere, type DonneesCarriere } from "../../src/lib/bungie/carriere";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 600)); };
const base = (surcharge: Partial<DonneesCarriere["diagnostic"]> = {}, statIdsBruts: string[] = []): DonneesCarriere => ({
  stats: [], minutesParClasse: null, statIdsBruts,
  diagnostic: { requeteStats: "/Destiny2/3/Account/42/Stats/", erreurStats: null, clesReponseStats: ["mergedAllCharacters"], structureMergedAllCharacters: "merged (allTime : 3 stats)", sourceStats: "merged", ...surcharge },
});

const complet = formaterDiagnosticCarriere(base({}, ["kills", "deaths", "assists"])).split("\n");
ok("RÉPONSE COMPLÈTE : « statIds retournés : 3 », puis les trois statIds dans l'ordre de la réponse, puis la requête, « erreur de la requête : aucune », les clés de la réponse, la structure de « mergedAllCharacters » et la source lue", complet[0] === "statIds retournés : 3" && complet.slice(1, 4).join() === "kills,deaths,assists" && complet.includes("requête : GET /Destiny2/3/Account/42/Stats/") && complet.includes("erreur de la requête : aucune") && complet.includes("clés de la réponse : mergedAllCharacters") && complet.includes("structure de « mergedAllCharacters » : merged (allTime : 3 stats)") && complet.includes("source des stats affichées : merged.allTime (agrégat « Carrière » du jeu)") && !complet.some((l) => l.includes("activit")), complet);

const echec = formaterDiagnosticCarriere(base({ erreurStats: "Appel Bungie API échoué (/Destiny2/Stats/…) : 404 — Not Found", clesReponseStats: null, structureMergedAllCharacters: null, sourceStats: null })).split("\n");
ok("REQUÊTE EN ÉCHEC (le cas où le diagnostic « ne s'ouvrait pas ») : « statIds retournés : AUCUN », l'erreur COMPLÈTE avec son code 404, « pas de réponse : la requête a échoué », « champ absent de la réponse » : le texte n'est JAMAIS vide", echec[0] === "statIds retournés : AUCUN" && echec.includes("erreur de la requête : Appel Bungie API échoué (/Destiny2/Stats/…) : 404 — Not Found") && echec.some((l) => l.includes("pas de réponse : la requête a échoué")) && echec.includes("structure de « mergedAllCharacters » : champ absent de la réponse") && !echec.some((l) => l.startsWith("source des stats affichées")), echec);

ok("RÉPONSE VIDE (la requête a réussi mais ne contient rien) : « (réponse vide) » et non pas une ligne blanche", formaterDiagnosticCarriere(base({ clesReponseStats: [], structureMergedAllCharacters: "(bloc vide)", sourceStats: null })).includes("clés de la réponse : (réponse vide)"));
const inattendue = formaterDiagnosticCarriere(base({ clesReponseStats: ["mergedDeletedCharacters", "mergedAllCharacters", "characters"], structureMergedAllCharacters: "merged : {allTime} ; results : {allPvE, allPvP}", sourceStats: null }));
ok("STRUCTURE INATTENDUE (pas de stats exploitables : le diagnostic DÉCRIT la structure réelle reçue) : « statIds retournés : AUCUN », les clés réellement reçues, la structure de « mergedAllCharacters », et AUCUNE ligne « source des stats affichées »", inattendue.includes("statIds retournés : AUCUN") && inattendue.includes("clés de la réponse : mergedDeletedCharacters, mergedAllCharacters, characters") && inattendue.includes("structure de « mergedAllCharacters » : merged : {allTime} ; results : {allPvE, allPvP}") && !inattendue.includes("source des stats affichées"), inattendue);
// ⚠️ CHANGÉ (22/10/2026, « Enlève … les 10 dernières activités ») : le diagnostic n'a PLUS de ligne
// « historiques d'activités en échec » (le chargement des historiques est supprimé avec la section affichée).
const act = formaterDiagnosticCarriere(base({}, ["kills"])).split("\n");
ok("PLUS D'HISTORIQUES D'ACTIVITÉS (22/10/2026 : la section « 10 dernières activités » est supprimée) : le diagnostic ne contient AUCUNE ligne « historiques d'activités » (ni « aucun » ni détail d'erreur)", !act.some((l) => l.includes("activit")), act);
ok("INVARIANTS : quel que soit le cas, le diagnostic n'est jamais vide, commence par la ligne des statIds et contient toujours la requête et l'erreur", [complet, echec].every((l) => l.length > 5 && /^statIds retournés : (\d+|AUCUN)$/.test(l[0]) && l.some((x) => x.startsWith("requête : GET ")) && l.some((x) => x.startsWith("erreur de la requête : "))));

// ---------- parsing de la structure RÉELLE de GetHistoricalStatsForAccount ----------
const stat = (id: string, v: number) => [id, { statId: id, basic: { value: v } }] as const;
const reelle = {
  mergedDeletedCharacters: { results: {}, merged: { allTime: {} } },
  mergedAllCharacters: { results: { allPvE: { allTime: Object.fromEntries([stat("kills", 100)]) }, allPvP: { allTime: Object.fromEntries([stat("kills", 50)]) } }, merged: { allTime: Object.fromEntries([stat("kills", 123456), stat("deaths", 23456), stat("precisionKills", 54321), stat("assists", 9876), stat("secondsPlayed", 9000000), stat("killsDeathsRatio", 5.26), stat("statInconnueDeTest", 42), stat("activityDurationSeconds", 5400)]) } },
  characters: [{ characterId: "1", deleted: false, results: { allPvE: { allTime: {} }, allPvP: { allTime: {} } }, merged: { allTime: {} } }],
};
const lu = extraireStatsCarriere(reelle.mergedAllCharacters);
ok("PARSING (structure réelle) : les stats « Carrière » sont lues dans `merged.allTime` (PAS dans `results` : 2 modes séparés y seraient lus comme des doublons partiels) — les 8 stats de `merged.allTime`, dans l'ordre", lu.source === "merged" && Object.keys(lu.stats).join() === "kills,deaths,precisionKills,assists,secondsPlayed,killsDeathsRatio,statInconnueDeTest,activityDurationSeconds" && lu.stats.kills?.basic?.value === 123456 && lu.structure === "merged (allTime : 8 stats)", lu);
const repli = extraireStatsCarriere({ results: { allPvE: { allTime: Object.fromEntries([stat("kills", 100)]) }, allPvP: { allTime: Object.fromEntries([stat("deaths", 7), stat("kills", 50)]) } }, merged: { allTime: {} } });
ok("PARSING (repli, `merged` vide) : SOMME des `results.<mode>.allTime` (dernière occurrence l'emporte sur le même statId), source « results »", repli.source === "results" && Object.keys(repli.stats).sort().join() === "deaths,kills" && repli.stats.kills?.basic?.value === 50 && repli.structure.includes("somme des modes"), repli);
const vide = extraireStatsCarriere({ results: { allPvE: { allTime: {} }, allPvP: { allTime: {} } }, merged: { allTime: {} } });
ok("PARSING (bloc présent mais vide, comme dans le retour réel « entrées de mergedAllCharacters : 2 » avec AUCUN stat lu) : AUCUNE stat, source null, structure DÉCRITE (les modes reçus, vides) — le diagnostic dira la structure au lieu de « statIds retournés : AUCUN » sans explication", vide.source === null && Object.keys(vide.stats).length === 0 && vide.structure === "merged : {} ; results : {allPvE, allPvP}", vide);
ok("PARSING (champ `mergedAllCharacters` absent) : AUCUNE stat, source null, structure « champ absent » gérée par l'appelant", extraireStatsCarriere(undefined).source === null && extraireStatsCarriere(undefined).structure === "(bloc vide)");

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
