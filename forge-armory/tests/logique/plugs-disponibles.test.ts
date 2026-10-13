// FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - test des PERKS DISPONIBLES SUR UN EXEMPLAIRE et des QUATRE NIVEAUX de la vue Inventaire de la Forge (demande de l'utilisateur) : lecture tolérante du composant 310 de Bungie (`lib/bungie/plugsDisponibles.ts`), niveau d'un perk (`niveauDePerk`) dans tous les cas, diagnostic du mode développement.
// ⚠️ La forme du composant 310 est celle de la documentation de l'API : elle n'a PAS été vérifiée sur le compte de l'utilisateur (c'est le but du diagnostic). EN: ⚠️ ADDED - test of the per-instance available plugs and of the four perk levels.
import { extrairePlugsDisponibles } from "../../src/lib/bungie/plugsDisponibles";
import { niveauDePerk } from "../../src/lib/forge/simulation";
import { obtenirDiagnosticPlugsExemplaire } from "../../src/lib/forge/diagnosticPlugs";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const plug = (h: number, canInsert = true) => ({ plugItemHash: h, canInsert, enabled: true });

// ---------- extraction (composant 310) ----------
const bien = extrairePlugsDisponibles({ plugs: { "1": [plug(6901), plug(6903)], "2": [plug(6912)], "4": [plug(6931), plug(6933, false)] } });
ok("forme de l'API : table index de prise → hashes ; un plug qu'on ne peut pas insérer maintenant (canInsert faux) reste DISPONIBLE sur l'exemplaire", JSON.stringify(bien) === JSON.stringify({ 1: [6901, 6903], 2: [6912], 4: [6931, 6933] }), bien);
ok("les doublons sont dédoublonnés, et une prise sans aucun plug valide est omise", JSON.stringify(extrairePlugsDisponibles({ plugs: { "1": [plug(5), plug(5), plug(6)], "2": [], "3": [{ plugItemHash: 0 }, { plugItemHash: "x" }, null, {}] } })) === JSON.stringify({ 1: [5, 6] }));
ok("clés non numériques ou négatives ignorées, valeurs qui ne sont pas des listes ignorées", JSON.stringify(extrairePlugsDisponibles({ plugs: { "a": [plug(1)], "-2": [plug(2)], "3": "pas une liste", "5": [plug(9)] } })) === JSON.stringify({ 5: [9] }));
ok("donnée ABSENTE ou mal formée : « on ne sait pas » (undefined), jamais « aucun » : undefined, null, texte, nombre, objet sans plugs, plugs qui n'est pas un objet", [undefined, null, "x", 7, {}, { plugs: null }, { plugs: "x" }].every((v) => extrairePlugsDisponibles(v) === undefined));
ok("un exemplaire dont `plugs` est vide : table VIDE (on SAIT qu'il n'a aucune alternative), différente de « non lu »", JSON.stringify(extrairePlugsDisponibles({ plugs: {} })) === "{}");
// ---------- les quatre niveaux ----------
const item = (hash: number, reel = false, amelioreHash?: number, amelioreReel = false) => ({ option: { hash, equipeEnJeu: reel }, ...(amelioreHash ? { ameliore: { hash: amelioreHash, equipeEnJeu: amelioreReel } } : {}) });
const dispo = { 1: [6901, 6903], 2: [6912], 4: [6931] };
ok("RÉEL : un perk du roll réel est « reel », qu'il soit disponible ou non dans la liste", niveauDePerk(item(6901, true), 1, dispo) === "reel" && niveauDePerk(item(6999, true), 1, dispo) === "reel");
ok("DISPONIBLE : un perk dans la liste de la prise, non équipé, est « disponible » (contour gris clair)", niveauDePerk(item(6903), 1, dispo) === "disponible");
ok("POSSIBLE : un perk du modèle absent de la liste de CETTE prise est « possible » (nom grisé), même s'il est disponible dans une AUTRE prise", niveauDePerk(item(7000), 1, dispo) === "possible" && niveauDePerk(item(6912), 1, dispo) === "possible" && niveauDePerk(item(6903), 3, dispo) === "possible");
ok("SIMULÉ prime sur tout : même un perk possible ou disponible devient « simule » une fois choisi ; le roll réel mis de côté reste « reel »", niveauDePerk(item(7000), 1, dispo, { choisi: 7000, effectif: 7000 }) === "simule" && niveauDePerk(item(6903), 1, dispo, { choisi: 6903, effectif: 6903 }) === "simule" && niveauDePerk(item(6901, true), 1, dispo, { choisi: 7000, effectif: 7000 }) === "reel");
ok("PAIRE : disponible si l'UNE des deux versions l'est (base OU version améliorée) ; réel si l'une des deux est équipée", niveauDePerk(item(6911, false, 6912), 2, dispo) === "disponible" && niveauDePerk(item(6911, false, 6912), 3, dispo) === "possible" && niveauDePerk(item(6911, false, 6912, true), 2, dispo) === "reel");
ok("CAS RÉALISTE : un perk simulé que l'utilisateur équipe ENSUITE pour de bon est à la fois réel et choisi : le niveau reste « simule » (priorité documentée : simulé, puis réel, puis disponible, puis possible) ; le ✓ du roll réel reste affiché par l'interface, car il vient du roll et non du niveau", niveauDePerk(item(6901, true), 1, dispo, { choisi: 6901, effectif: 6901 }) === "simule");
ok("DONNÉE NON LUE (disponibilités absentes) : « inconnu », jamais « possible » : on n'affirme rien et on ne grise rien ; le roll réel et le simulé restent reconnus", niveauDePerk(item(6903), 1, undefined) === "inconnu" && niveauDePerk(item(6901, true), 1, undefined) === "reel" && niveauDePerk(item(6903), 1, undefined, { choisi: 6903, effectif: 6903 }) === "simule");
ok("table VIDE (aucune alternative sur l'exemplaire) : tout perk non équipé est « possible »", niveauDePerk(item(6903), 1, {}) === "possible" && niveauDePerk(item(6901, true), 1, {}) === "reel");
// ---------- diagnostic (mode développement) ----------
const { db } = creerFausseDb({ [T_OBJET]: { 6901: { displayProperties: { name: "Canon X" } }, 6903: { displayProperties: { name: "Canon Y" } }, 6912: { displayProperties: { name: "Chargeur X" } } } });
const piece = { itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", origine: "titan", equipe: true, perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }], plugsDisponiblesParColonne: { 1: [6901, 6903] } } as never;
const d1 = obtenirDiagnosticPlugsExemplaire(db, piece);
ok("diagnostic : donne l'arme, le lieu, le perk équipé et les perks disponibles de chaque prise, nommés, en marquant l'équipé", /Fusil à paliers.*w1.*titan.*équipée/.test(d1) && /Prise 1 : équipé = Canon X \(6901\) \| disponibles \(2\) = Canon X \(6901\) \[équipé\], Canon Y \(6903\)/.test(d1) && /Prise 2 : équipé = Chargeur X \(6912\) \| disponibles \(0\) = —/.test(d1), d1);
ok("diagnostic : sans donnée de disponibilité, il le dit clairement (NON LUS) au lieu d'inventer", /NON LUS/.test(obtenirDiagnosticPlugsExemplaire(db, { ...(piece as object), plugsDisponiblesParColonne: undefined } as never)));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
