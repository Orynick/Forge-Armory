// FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - test de la SIMULATION LOCALE des perks (`lib/forge/simulation.ts`) : choix par colonne, retour au roll réel, règle de version (améliorée ou non), persistance tolérante aux erreurs. Aucune interface ni réseau. EN: ⚠️ ADDED - test of the local perk simulation model.
import { choisir, retirerColonne, reinitialiserArme, nbColonnesSimulees, armesSimulees, lireSimulations, ecrireSimulations, stockageNavigateur, estLeRollReel, armeEstAmelioree, choixEffectif, SIMULATIONS_VIDES, CLE_STOCKAGE_SIMULATIONS, Stockage } from "../../src/lib/forge/simulation";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const memoire = (init?: string): Stockage & { contenu: Map<string, string> } => { const contenu = new Map<string, string>(init === undefined ? [] : [[CLE_STOCKAGE_SIMULATIONS, init]]); return { contenu, getItem: (c) => contenu.get(c) ?? null, setItem: (c, v) => void contenu.set(c, v) }; };

// ---------- choix, retour au réel ----------
const s0 = SIMULATIONS_VIDES();
const s1 = choisir(s0, "w1", 1, { choisi: 6903, effectif: 6904 });
ok("choisir un perk dans une colonne ne modifie PAS l'objet d'origine (immuable) et l'enregistre par exemplaire et par index de prise", Object.keys(s0.armes).length === 0 && s1.armes.w1[1].choisi === 6903 && s1.armes.w1[1].effectif === 6904, [s0, s1]);
const s2 = choisir(s1, "w1", 1, { choisi: 6901, effectif: 6902 });
ok("UNE seule perk par colonne : choisir de nouveau dans la même colonne REMPLACE le choix (jamais deux)", Object.keys(s2.armes.w1).length === 1 && s2.armes.w1[1].choisi === 6901, s2);
const s3 = choisir(s2, "w1", 3, { choisi: 6923, effectif: 6923 });
ok("deux colonnes différentes coexistent ; deux exemplaires de la MÊME arme restent indépendants (clé = identifiant d'exemplaire)", nbColonnesSimulees(s3, "w1") === 2 && nbColonnesSimulees(choisir(s3, "w9", 1, { choisi: 1, effectif: 1 }), "w9") === 1 && nbColonnesSimulees(s3, "w9") === 0);
const s4 = retirerColonne(s3, "w1", 1);
ok("revenir au roll réel sur UNE colonne la retire, les autres restent ; retirer la dernière retire l'arme de la liste des armes simulées", nbColonnesSimulees(s4, "w1") === 1 && !(1 in s4.armes.w1) && armesSimulees(retirerColonne(s4, "w1", 3)).length === 0 && armesSimulees(s4).join() === "w1", s4);
ok("tout réinitialiser pour une arme n'affecte pas les autres", armesSimulees(reinitialiserArme(choisir(s3, "w2", 5, { choisi: 7, effectif: 7 }), "w1")).join() === "w2");
// ---------- version : l'arme est-elle « améliorée » ? ----------
const item = (hash: number, reel = false, amelioreHash?: number, amelioreReel = false) => ({ option: { hash, equipeEnJeu: reel }, ...(amelioreHash ? { ameliore: { hash: amelioreHash, equipeEnJeu: amelioreReel } } : {}) });
const colonnesBase = [[item(1, true, 2), item(3, false, 4)], [item(5, true)]], colonnesAmeliorees = [[item(1, false, 2, true), item(3, false, 4)], [item(5, true)]];
ok("une arme dont tous les perks RÉELS sont des perks de base n'est pas « améliorée » ; une arme dont au moins un perk réel est la version améliorée d'un perk l'est", !armeEstAmelioree(colonnesBase) && armeEstAmelioree(colonnesAmeliorees));
ok("sans roll réel connu (aucun perk marqué), l'arme n'est pas « améliorée » : on compte le perk de base", !armeEstAmelioree([[item(1, false, 2)], [item(5)]]));
ok("le perk à COMPTER : sa version améliorée si l'arme est améliorée ET que le perk en a une, sinon le perk lui-même (un perk sans jumeau reste lui-même, même sur une arme améliorée)", choixEffectif(item(3, false, 4), true) === 4 && choixEffectif(item(3, false, 4), false) === 3 && choixEffectif(item(5), true) === 5);
ok("le perk du roll réel est reconnu, qu'il soit la version de base OU la version améliorée dans la paire", estLeRollReel(item(1, true, 2)) && estLeRollReel(item(1, false, 2, true)) && !estLeRollReel(item(3, false, 4)));
// ---------- persistance ----------
const st = memoire();
ok("écrire puis relire redonne les mêmes simulations ; le format stocké est compact et versionné", ecrireSimulations(st, s3) && JSON.stringify(lireSimulations(st)) === JSON.stringify(s3) && JSON.parse(st.contenu.get(CLE_STOCKAGE_SIMULATIONS)!).version === 1, st.contenu.get(CLE_STOCKAGE_SIMULATIONS));
ok("stockage vide, JSON illisible, mauvaise version ou mauvaise forme : simulation VIDE, jamais d'erreur", [memoire(), memoire("{pas du json"), memoire('{"version":2,"armes":{}}'), memoire("null"), memoire('{"version":1,"armes":5}'), memoire('{"version":1}')].every((m) => Object.keys(lireSimulations(m).armes).length === 0));
const abime = lireSimulations(memoire(JSON.stringify({ version: 1, armes: { ok: { "1": { c: 10, e: 11 }, "x": { c: 1, e: 2 }, "2": { c: -3, e: 4 }, "3": { c: 5 } }, vide: {}, faux: 7 } })));
ok("les entrées abîmées sont écartées UNE à UNE : seule la colonne valide de l'exemplaire valide est conservée (index non numérique, nombre négatif, valeur manquante, exemplaire vide ou mal formé écartés)", JSON.stringify(abime.armes) === JSON.stringify({ ok: { 1: { choisi: 10, effectif: 11 } } }), abime);
const refuse: Stockage = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
ok("un stockage qui refuse l'écriture (quota plein, interdit) renvoie « faux » sans casser", ecrireSimulations(refuse, s3) === false);
const casse: Stockage = { getItem: () => { throw new Error("interdit"); }, setItem: () => {} };
ok("un stockage dont la lecture lève une erreur donne une simulation vide", Object.keys(lireSimulations(casse).armes).length === 0);
(globalThis as unknown as { window: unknown }).window = { get localStorage(): Storage { throw new Error("SecurityError"); } };
const secours = stockageNavigateur(); secours.setItem("a", "b");
ok("sans stockage du navigateur (accès interdit), une mémoire de secours prend le relais (elle ne persiste pas mais l'appli fonctionne)", secours.getItem("a") === "b" && secours.getItem("z") === null);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
