// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - test de la MISE À JOUR AUTOMATIQUE du Manifest PÉRIMÉ (demande de l'utilisateur : « si le Manifest est périmé, et uniquement dans ce cas, téléchargement du nouveau ») : toutes les combinaisons d'états du français et de l'anglais, l'enchaînement des appels et des messages, la lecture de l'état des caches avec une
// FAUSSE base qui refuse toute écriture (la lecture ne doit jamais rien modifier), et l'outil de simulation du mode développement. Aucun téléchargement réel. EN: ⚠️ ADDED - test of the automatic refresh of an OUTDATED Manifest, and ONLY in that case.
import { decider, demarrerManifests, EtatCaches, LangueManifest } from "../../src/lib/manifest/demarrage";
import { etatCachesManifests, manifestsEnCacheAJour, simulerManifestPerime, DependancesCacheManifest } from "../../src/lib/manifest/download";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
type E = "a-jour" | "perime" | "absent";
const d = (fr?: E, en?: E) => decider({ fr, en } as EtatCaches);
const charge = (x: ReturnType<typeof decider>) => (x.action === "charger" ? `${x.langues.join("+")}/${x.raison}` : "rien");

// ---------- la décision, langue par langue ----------
ok("FR ET EN à jour : chargement automatique des deux depuis le cache, sans rien annoncer (comportement de la 0.2.2 conservé)", charge(d("a-jour", "a-jour")) === "fr+en/a-jour");
ok("FR périmé, EN à jour : le français est retéléchargé, puis les deux sont chargés", charge(d("perime", "a-jour")) === "fr+en/perime");
ok("FR à jour, EN périmé : l'anglais est retéléchargé, puis les deux sont chargés", charge(d("a-jour", "perime")) === "fr+en/perime");
ok("FR ET EN périmés : les deux sont retéléchargés", charge(d("perime", "perime")) === "fr+en/perime");
ok("« uniquement dans ce cas » : FR périmé et EN ABSENT : seul le français est retéléchargé, l'anglais n'est PAS téléchargé en douce", charge(d("perime", "absent")) === "fr/perime", charge(d("perime", "absent")));
ok("FR à jour et EN absent : rien ne se lance (rien n'est périmé ; le bouton manuel reste), comme avant", charge(d("a-jour", "absent")) === "rien");
ok("FR ABSENT (premier lancement) : rien ne se lance seul, quelle que soit l'anglais (le tout premier téléchargement reste un clic)", [d("absent", "absent"), d("absent", "a-jour"), d("absent", "perime"), d(undefined, "perime")].every((x) => charge(x) === "rien"));
ok("état inconnu (hors ligne, Bungie indisponible : null) ou vide : rien", charge(decider(null)) === "rien" && charge(decider(undefined)) === "rien" && charge(decider({})) === "rien");
// ---------- l'enchaînement ----------
const appels: string[] = [];
// FR : l'abréviation d'un message est son premier SYMBOLE (un émoji peut occuper deux unités de texte). EN: first symbol.
const fabrique = (etat: EtatCaches | null, reussite = true) => ({ lireEtat: async () => { appels.push("etat"); return etat; }, charger: async (l: LangueManifest[]) => { appels.push("charger:" + l.join("+")); return reussite; }, annoncer: (m: string | null) => { appels.push("msg:" + (m === null ? "null" : [...m][0])); } });
appels.length = 0; const r1 = await demarrerManifests(fabrique({ fr: "perime", en: "absent" }));
ok("Manifest périmé : annonce 🔄 AVANT de télécharger, télécharge UNE fois (français seul), puis annonce ✅", appels.join("|") === "etat|msg:🔄|charger:fr|msg:✅" && r1.reussi === true, appels);
appels.length = 0; const m: string[] = []; await demarrerManifests({ ...fabrique({ fr: "perime", en: "perime" }), annoncer: (x) => { if (x) m.push(x); } });
ok("l'annonce nomme les langues et la taille (« français et anglais », « 100 Mo par langue »)", /français et anglais/.test(m[0]) && /100 Mo par langue/.test(m[0]), m);
appels.length = 0; const r2 = await demarrerManifests(fabrique({ fr: "perime", en: "a-jour" }, false));
ok("ÉCHEC du téléchargement : message ⚠️ qui renvoie au bouton manuel, aucun second essai automatique", appels.join("|") === "etat|msg:🔄|charger:fr+en|msg:⚠" && r2.reussi === false, appels);
appels.length = 0; await demarrerManifests(fabrique({ fr: "a-jour", en: "a-jour" }));
ok("tout à jour : message effacé puis chargement des deux ; AUCUNE annonce de mise à jour", appels.join("|") === "etat|msg:null|charger:fr+en", appels);
appels.length = 0; await demarrerManifests(fabrique({ fr: "absent", en: "absent" })); await demarrerManifests(fabrique(null)); await demarrerManifests(fabrique({ fr: "a-jour", en: "absent" }));
ok("premier lancement, état inconnu, ou rien de périmé : AUCUN chargement et AUCUN message (trois démarrages de suite)", !appels.some((a) => a.startsWith("charger") || a.startsWith("msg")) && appels.filter((a) => a === "etat").length === 3, appels);
// ---------- la lecture de l'état des caches (fausse base qui refuse toute écriture) ----------
const stockage = (meta: Record<string, unknown>, manifest: Record<string, unknown>, versionBungie = "V2", pannes: { meta?: boolean; db?: boolean } = {}): DependancesCacheManifest & { ecritures: string[] } => {
  const ecritures: string[] = [];
  const magasin = (n: string) => (n === "meta" ? meta : manifest);
  return { ecritures, recupererMeta: async () => { if (pannes.meta) throw new Error("hors ligne"); return { version: versionBungie }; }, ouvrirDB: async () => { if (pannes.db) throw new Error("IndexedDB inaccessible"); return { get: async (n, k) => magasin(n)[k], getKey: async (n, k) => (magasin(n)[k] === undefined ? undefined : k), put: async (n, v, k) => { ecritures.push(`${n}:${k}`); magasin(n)[k] = v; } }; } };
};
const K = (l: string) => ({ v: `manifestVersion_${l}_v2`, s: `sqlite_${l}_v2` });   // ⚠️ « v2 » = VERSION_FORMAT_CACHE de download.ts : si ce numéro change, ce test le signale
const dep1 = stockage({ [K("fr").v]: "V2", [K("en").v]: "V1", [K("de").v]: "V2", [K("es").v]: undefined }, { [K("fr").s]: 1, [K("en").s]: 1, [K("es").s]: 1 });
const etat1 = await etatCachesManifests(["fr", "en", "de", "es", "it"], dep1);
ok("état de chaque langue : à jour (même version), périmé (version différente), absent (aucun fichier, même si une version traîne), périmé (fichier présent mais version inconnue), absent (rien du tout)", JSON.stringify(etat1) === JSON.stringify({ fr: "a-jour", en: "perime", de: "absent", es: "perime", it: "absent" }), etat1);
ok("la lecture n'écrit RIEN : ni version, ni fichier", dep1.ecritures.length === 0, dep1.ecritures);
ok("hors ligne (version Bungie illisible) ou base locale inaccessible : l'état est INCONNU (null), pas « périmé » : on ne télécharge pas sur un doute", (await etatCachesManifests(["fr"], stockage({}, {}, "V2", { meta: true }))) === null && (await etatCachesManifests(["fr"], stockage({}, {}, "V2", { db: true }))) === null);
ok("`manifestsEnCacheAJour` (ancienne fonction) garde son sens : vrai seulement si TOUTES les langues sont à jour", (await manifestsEnCacheAJour(["fr"], dep1)) === true && (await manifestsEnCacheAJour(["fr", "en"], dep1)) === false && (await manifestsEnCacheAJour(["de"], dep1)) === false && (await manifestsEnCacheAJour(["fr"], stockage({}, {}, "V2", { meta: true }))) === false);
// ---------- l'outil de simulation (mode développement) ----------
const dep2 = stockage({ [K("fr").v]: "V2", [K("en").v]: "V2" }, { [K("fr").s]: 1 });   // FR en cache, EN sans fichier
const marquees = await simulerManifestPerime(["fr", "en"], dep2);
const etat2 = await etatCachesManifests(["fr", "en"], dep2);
ok("simulation : seule la langue DÉJÀ en cache est marquée (français) ; celle sans fichier est laissée intacte", JSON.stringify(marquees) === JSON.stringify(["fr"]) && dep2.ecritures.length === 1 && etat2?.fr === "perime" && etat2?.en === "absent", [marquees, dep2.ecritures, etat2]);
ok("après la simulation, le démarrage retélécharge exactement ce qui est « périmé » : le français seul, jamais l'anglais absent", charge(decider(etat2 as EtatCaches)) === "fr/perime", etat2);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
