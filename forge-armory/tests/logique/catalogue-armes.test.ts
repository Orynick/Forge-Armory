// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - test du CATALOGUE DES ARMES (lecture ciblée du Manifest, exclusions, libellés résolus comme l'inventaire, construction par morceaux, cache), des FILTRES purs et de la LECTURE DES COLLECTIONS (fusion compte et personnages, état d'obtention, erreurs). Faux Manifest et fausse API : aucune donnée réelle. EN: ⚠️ ADDED - weapon catalogue, filters and collections tests.
import { construireCatalogueArmes, filtrerArmes, valeursDistinctes, FILTRES_ARMES_PAR_DEFAUT, ArmeCatalogue } from "../../src/lib/manifest/catalogueArmes";
import { fusionnerCollections, classerObtention, lireCollections } from "../../src/lib/bungie/collections";
import { SessionExpiree } from "../../src/lib/bungie/oauth";
import { creerFausseDb, manifestArmesDeTest, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const sansPause = async () => {};
// ---------- le catalogue ----------
const { db, requetes } = creerFausseDb(manifestArmesDeTest());
const progression: number[] = [];
const armes = await construireCatalogueArmes(db, { tailleLot: 2, pause: sansPause, onProgression: (n) => progression.push(n) });
ok("le catalogue contient les 3 armes valides, TRIÉES par nom : Arc d'essai, Fusil d'essai, Lance-roquettes d'essai", armes.map((a) => a.nom).join(" | ") === "Arc d'essai | Fusil d'essai | Lance-roquettes d'essai", armes.map((a) => a.nom));
ok("sont ÉCARTÉES : l'arme masquée (redacted), l'ARMURE, l'objet sans nom et l'objet de la catégorie factice", !armes.some((a) => [5004, 5005, 5006, 5007].includes(a.hash)), armes.map((a) => a.hash));
const fusil = armes.find((a) => a.hash === 5001)!;
ok("libellés résolus comme dans l'inventaire : type « Fusil à impulsion », emplacement énergie, rareté « Légendaire », non exotique, armature « Armature adaptative », élément solaire, Collection 9001", fusil.type === "Fusil à impulsion" && fusil.slot === "energie" && fusil.rarete === "Légendaire" && !fusil.estExotique && fusil.armature === "Armature adaptative" && fusil.element === "solaire" && fusil.collectibleHash === 9001, fusil);
const lance = armes.find((a) => a.hash === 5002)!;
ok("l'exotique est reconnu (rareté « Exotique », estExotique), emplacement lourde, armature d'un exotique lue en prise 0, élément abyssal", lance.estExotique && lance.rarete === "Exotique" && lance.slot === "lourde" && lance.armature === "Œil d'essai" && lance.element === "abyssal", lance);
ok("une arme hors Collections n'a PAS de collectibleHash (état d'obtention inconnaissable)", armes.find((a) => a.hash === 5003)!.collectibleHash === undefined);
ok("l'icône est une adresse complète prête à afficher et le nom normalisé sert à la recherche (accents et majuscules ignorés)", fusil.icone?.startsWith("https://www.bungie.net/") && fusil.nomNormalise === "fusil d'essai", [fusil.icone, fusil.nomNormalise]);
ok("la construction est PAR MORCEAUX : la progression est annoncée en cours de route, et la dernière valeur est le nombre final d'armes", progression.length >= 2 && progression[progression.length - 1] === 3, progression);
const avantRequetes = requetes.length;
const encore = await construireCatalogueArmes(db, { pause: sansPause });
ok("MIS EN CACHE : un second appel rend le MÊME catalogue sans relire le Manifest", encore === armes && requetes.length === avantRequetes, [encore === armes, requetes.length - avantRequetes]);
ok("la lecture est CIBLÉE (clause WHERE sur `itemType`) : le Manifest n'est pas relu en entier", requetes.some((r) => /FROM DestinyInventoryItemDefinition WHERE json LIKE/.test(r)));
// ---------- le repli si la requête ciblée ne trouve rien (JSON avec espaces) ----------
const defsEspaces = manifestArmesDeTest();
for (const h of Object.keys(defsEspaces[T_OBJET])) (defsEspaces[T_OBJET] as Record<string, unknown>)[h] = JSON.parse(JSON.stringify((defsEspaces[T_OBJET] as Record<string, unknown>)[h]));
const fauxEspaces = creerFausseDb(defsEspaces); const stmtOriginal = (fauxEspaces.db as unknown as { prepare: (s: string) => unknown }).prepare;
(fauxEspaces.db as unknown as { prepare: (s: string) => unknown }).prepare = (sql: string) => stmtOriginal.call(fauxEspaces.db, sql.replace(/ WHERE json LIKE '.*'/, " WHERE json LIKE '%motif-introuvable%'"));
const armesRepli = await construireCatalogueArmes(fauxEspaces.db, { pause: sansPause });
ok("REPLI : si la requête ciblée ne renvoie rien (format de JSON inattendu), toute la table est lue et filtrée : mêmes 3 armes", armesRepli.length === 3, armesRepli.map((a) => a.nom));
ok("un Manifest sans aucune arme donne un catalogue vide, sans erreur", (await construireCatalogueArmes(creerFausseDb({ [T_OBJET]: {} }).db, { pause: sansPause })).length === 0);
// ---------- les filtres ----------
const tous = (e: ArmeCatalogue) => "inconnu" as const; void tous;
const obt = (m: Record<number, "obtenu" | "jamais" | "inconnu">) => (a: ArmeCatalogue) => m[a.hash] ?? "inconnu";
const etats = obt({ 5001: "obtenu", 5002: "jamais" });
const F = (o: Partial<typeof FILTRES_ARMES_PAR_DEFAUT>) => filtrerArmes(armes, { ...FILTRES_ARMES_PAR_DEFAUT, ...o }, etats).map((a) => a.hash).join();
ok("par défaut, SEULES les armes des Collections du jeu sont listées (5001 et 5002) : l'arme sans collection est mise de côté", F({}) === "5001,5002", F({}));
ok("source « hors Collections » : seulement l'arme sans collection ; « tout » : les trois", F({ source: "hors" }) === "5003" && F({ source: "tout" }).split(",").length === 3);
ok("recherche par nom, SANS accents ni majuscules ni ordre des mots : « ESSAI fusil » trouve le Fusil d'essai ; « impulsion » le trouve par son type ; « adaptative » par son armature", F({ texte: "ESSAI fusil", source: "tout" }) === "5001" && F({ texte: "impulsion", source: "tout" }) === "5001" && F({ texte: "adaptative", source: "tout" }) === "5003,5001", F({ texte: "adaptative", source: "tout" }));
ok("filtres par type, emplacement, rareté, élément et armature (combinables)", F({ type: "Lance-roquettes" }) === "5002" && F({ slot: "energie" }) === "5001" && F({ rarete: "Exotique" }) === "5002" && F({ element: "abyssal" }) === "5002" && F({ armature: "Armature adaptative", source: "tout" }) === "5003,5001" && F({ slot: "lourde", rarete: "Légendaire" }) === "", F({ armature: "Armature adaptative", source: "tout" }));
ok("filtre d'obtention : « obtenues » = 5001, « jamais obtenues » = 5002 ; l'arme à état inconnu n'est dans aucun des deux", F({ obtention: "obtenues", source: "tout" }) === "5001" && F({ obtention: "jamais", source: "tout" }) === "5002");
ok("valeurs des menus : types, raretés et armatures distincts et triés", valeursDistinctes(armes, "type").join() === "Arc,Fusil à impulsion,Lance-roquettes" && valeursDistinctes(armes, "rarete").join() === "Exotique,Légendaire" && valeursDistinctes(armes, "armature").join() === "Armature adaptative,Œil d'essai", [valeursDistinctes(armes, "type"), valeursDistinctes(armes, "armature")]);
// ---------- les collections ----------
const rep = { profileCollectibles: { data: { collectibles: { "9001": { state: 0 }, "9002": { state: 1 }, "9003": { state: 64 }, "9005": { state: 0 } } } }, characterCollectibles: { data: { "id-a": { collectibles: { "9002": { state: 0 }, "9004": { state: 1 }, "9005": { state: 1 } } }, "id-b": { collectibles: { "9004": { state: 1 }, "9005": { state: 1 } } } } } };
const m = fusionnerCollections(rep)!;
ok("fusion des collections : obtenue si l'état n'a pas le drapeau « non obtenu » (état 0 ou 64) ; jamais si le drapeau est levé partout ; obtenue si UN personnage l'a alors que le compte non ; et reste OBTENUE (9005) si le compte l'a mais que des personnages la marquent non obtenue APRÈS : « le dernier lu gagne » serait faux", m.get(9001) === true && m.get(9003) === true && m.get(9002) === true && m.get(9004) === false && m.get(9005) === true, [...m]);
ok("état d'obtention : obtenu / jamais / inconnu (sans collectibleHash, sans lecture, ou absente de toutes les collections)", classerObtention(9001, m) === "obtenu" && classerObtention(9004, m) === "jamais" && classerObtention(undefined, m) === "inconnu" && classerObtention(9001, null) === "inconnu" && classerObtention(1234, m) === "inconnu");
ok("une réponse sans aucune collection (droits, profil privé) n'est PAS prise pour « rien d'obtenu » : fusion = null", fusionnerCollections({}) === null && fusionnerCollections(undefined) === null);
const membership = { membershipType: 3, membershipId: "42", displayName: "T" } as never;
let urlAppelee = "";
const dep = (corps: unknown, jeton = async () => "jeton") => ({ jeton, appeler: async (u: string) => { urlAppelee = u; return { status: 200, json: async () => corps }; } });
const l1 = await lireCollections(membership, dep({ ErrorCode: 1, Response: rep }));
ok("lecture : appel en LECTURE SEULE du composant 800 sur le bon compte, résultat fusionné", l1.ok && urlAppelee.includes("/Destiny2/3/Profile/42/?components=800") && l1.obtenus.get(9001) === true, urlAppelee);
const l2 = await lireCollections(membership, dep({ ErrorCode: 5, ErrorStatus: "SystemDisabled" }));
const l3 = await lireCollections(membership, dep({ ErrorCode: 1, Response: {} }));
const l4 = await lireCollections(membership, { jeton: async () => "j", appeler: async () => { throw new Error("réseau coupé"); } });
ok("erreurs rendues AVEC leur raison, jamais avalées : refus de Bungie, aucune collection, réseau coupé (l'appelant n'affichera aucun grisé)", !l2.ok && /SystemDisabled/.test(l2.raison) && !l3.ok && /aucune collection/.test(l3.raison) && !l4.ok && /réseau coupé/.test(l4.raison), [l2, l3, l4]);
let remonte = false; try { await lireCollections(membership, dep({}, async () => { throw new SessionExpiree(); })); } catch (e) { remonte = e instanceof SessionExpiree; }
ok("une SESSION EXPIRÉE remonte à l'appelant au lieu d'être confondue avec un échec banal", remonte);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
