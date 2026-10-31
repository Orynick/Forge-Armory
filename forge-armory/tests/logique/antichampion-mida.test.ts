// FR : ⚠️ AJOUT (14/10/2026, v0.4.8) - test de la règle de l'armature « SYNERGIE MIDA » (demande de l'utilisateur : l'antichampion de l'Outil polyvalent MIDA et de l'Outil macro MIDA n'apparaissait pas) : la règle pure, puis la fonction publique `obtenirAntiChampion` sur un faux Manifest, avec les règles EXISTANTES qui ne doivent pas bouger (liste de référence, armature de précision).
// EN: ⚠️ ADDED - test of the "MIDA Synergy" frame rule, pure and through the public function, with existing rules unchanged.
import { championSynergieMIDA } from "../../src/lib/manifest/antiChampionExotiques";
import { obtenirAntiChampion, deduireAntiChampion } from "../../src/lib/manifest/doctrine";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
// ---------- la règle pure ----------
ok("armature « Synergie MIDA » + « Outil polyvalent MIDA » = SURCHARGE", championSynergieMIDA("Outil polyvalent MIDA", "Synergie MIDA") === "surcharge");
ok("armature « Synergie MIDA » + « Outil macro MIDA » = IMPLACABLE", championSynergieMIDA("Outil macro MIDA", "Synergie MIDA") === "implacable");
ok("la casse et les accents n'ont pas d'importance (« OUTIL Polyvalent MIDA », « Outil Macro MIDA », « SYNERGIE mida ») : le nom saisi par l'utilisateur fonctionne tel quel", championSynergieMIDA("OUTIL Polyvalent MIDA", "SYNERGIE mida") === "surcharge" && championSynergieMIDA("Outil Macro MIDA", "Synergie MIDA") === "implacable");
ok("la règle exige l'armature : « Outil polyvalent MIDA » avec une AUTRE armature (précision, adaptative, absente) ne déclenche rien", [undefined, "Armature de précision", "Armature adaptative", "Synergie"].every((a) => championSynergieMIDA("Outil polyvalent MIDA", a) === undefined));
ok("on ne devine pas : une arme qui porte l'armature mais dont le nom n'a ni « polyvalent » ni « macro » reste SANS réponse ; sans nom d'arme non plus", championSynergieMIDA("Outil multifonction MIDA", "Synergie MIDA") === undefined && championSynergieMIDA("Autre arme MIDA", "Synergie MIDA") === undefined && championSynergieMIDA(undefined, "Synergie MIDA") === undefined);
ok("le mot doit être entier (« macroscopique » n'est pas « macro »)", championSynergieMIDA("Outil macroscopique MIDA", "Synergie MIDA") === undefined);
// ---------- la fonction publique, sur un faux Manifest ----------
const plug = (nom: string, description = "") => ({ displayProperties: { name: nom, description }, itemTypeDisplayName: "Intrinsèque" });
const arme = (nom: string, plugArmature: number, tier = 6) => ({ displayProperties: { name: nom }, itemType: 3, itemTypeDisplayName: "Fusil", inventory: { bucketTypeHash: 1498876634, tierType: tier }, sockets: { socketEntries: [{ singleInitialItemHash: plugArmature }] } });
const { db } = creerFausseDb({ [T_OBJET]: {
  9101: plug("Synergie MIDA", "Les outils MIDA se complètent."), 9102: plug("Armature de précision"),
  9001: arme("Outil polyvalent MIDA", 9101), 9002: arme("Outil macro MIDA", 9101), 9003: arme("Autre arme MIDA", 9101),
  9004: arme("Outil multifonction MIDA", 9101),    // l'ancien nom, présent dans la liste de référence (bloqueur)
  9005: arme("Fusil de précision d'essai", 9102, 5), // une légendaire à armature de précision : règle EXISTANTE
} });
ok("PUBLIC : l'Outil polyvalent MIDA (armature Synergie MIDA) donne SURCHARGE et l'Outil macro MIDA donne IMPLACABLE : l'icône apparaît maintenant", obtenirAntiChampion(db, 9001) === "surcharge" && obtenirAntiChampion(db, 9002) === "implacable", [obtenirAntiChampion(db, 9001), obtenirAntiChampion(db, 9002)]);
ok("AVANT : la déduction d'origine ne trouvait rien pour ces armes (c'est pourquoi l'icône manquait) : la nouvelle règle est bien ce qui change le résultat", deduireAntiChampion(db, 9001) === "surcharge" && deduireAntiChampion(db, 9003) === undefined);
ok("une autre arme à armature Synergie MIDA mais au nom inconnu reste sans icône (on ne devine pas)", obtenirAntiChampion(db, 9003) === undefined);
ok("RIEN NE BOUGE ailleurs : l'« Outil multifonction MIDA » (liste de référence, ancien nom) reste BLOQUEUR ; une légendaire à armature de précision reste BLOQUEUR", obtenirAntiChampion(db, 9004) === "bloqueur" && obtenirAntiChampion(db, 9005) === "bloqueur", [obtenirAntiChampion(db, 9004), obtenirAntiChampion(db, 9005)]);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
