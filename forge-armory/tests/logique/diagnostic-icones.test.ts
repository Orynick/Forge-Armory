// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - test du DIAGNOSTIC DES ICÔNES de doctrine (bug des icônes du Filobscur) sur une fausse base : il liste les prises de la sous-classe avec leurs plug sets, et pour chaque option son icône brute et sa catégorie. / EN: test of the doctrine icon diagnostic.
import { obtenirDiagnosticIconesDoctrine } from "../../src/lib/manifest/doctrine";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";
const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 500)); };
const T = "DestinyInventoryItemDefinition";
const DEFS: Record<string, unknown> = {
  [`${T}:${hashVersIdSqlite(5000)}`]: { displayProperties: { name: "Tisseur de test" }, sockets: { socketEntries: [{ socketTypeHash: 11, reusablePlugSetHash: 777 }, { socketTypeHash: 12, reusablePlugSetHash: 888, randomizedPlugSetHash: 0 }, { socketTypeHash: 13, singleInitialItemHash: 6003 }, { socketTypeHash: 14, reusablePlugItems: [{}, {}] }] } },
  [`${T}:${hashVersIdSqlite(6001)}`]: { plug: { plugCategoryIdentifier: "shared.stasis.jumps" }, itemTypeDisplayName: "Saut", iconWatermark: "/common/filigrane.png", displayProperties: { icon: "/common/destiny2_content/icons/saut-triple.png", iconSequences: [{}, {}] } },
  [`${T}:${hashVersIdSqlite(6002)}`]: { plug: { plugCategoryIdentifier: "hunter.strand.class_abilities" }, displayProperties: { icon: "/common/destiny2_content/icons/dodge.png" } },
};
const fausseDb = { prepare: (sql: string) => { const table = /FROM (\w+)/.exec(sql)?.[1] ?? ""; let id = 0; return { bind: (a: number[]) => { id = a[0]; }, step: () => `${table}:${id}` in DEFS, getAsObject: () => ({ json: JSON.stringify(DEFS[`${table}:${id}`]) }), free: () => {} }; } } as never;
const opt = (hash: number, nom: string) => ({ hash, nom, description: "", icone: "https://www.bungie.net/x.png" });
const groupes = [{ categorie: "saut", nomReel: "Saut", nbSlots: 1, options: [opt(6001, "Saut triple")] }, { categorie: "classe", nomReel: "Compétence de classe", nbSlots: 1, options: [opt(6002, "Esquive du joueur")] }, { categorie: "fragment", nomReel: "Fragments", nbSlots: 4, options: [opt(1, "Fragment ignoré")] }] as never;
const t = obtenirDiagnosticIconesDoctrine(fausseDb, 5000, "filobscur", groupes);
ok("l'en-tête donne la sous-classe (nom et hash) et l'élément choisi dans l'outil", t.includes("Tisseur de test") && t.includes("hash 5000") && t.includes("élément choisi dans l'outil : filobscur"), t);
ok("chaque prise de la sous-classe est listée avec son plug set (c'est ce qui dira si la Stase et le Filobscur partagent les mêmes listes d'options)", t.includes("[0] type=11 | reusablePlugSet=777") && t.includes("[1] type=12 | reusablePlugSet=888") && t.includes("[2] type=13 | reusablePlugSet=0 | randomizedPlugSet=0 | fixe=6003") && t.includes("[3] type=14") && t.includes("directes=2"), t);
ok("chaque option de saut et de compétence de classe est listée avec son nom, son hash, sa catégorie de plug, son type, son icône BRUTE, son filigrane et son nombre de séquences d'icône", t.includes("- Saut triple | hash 6001 | plug=shared.stasis.jumps | type=\"Saut\" | icône=/common/destiny2_content/icons/saut-triple.png | filigrane=/common/filigrane.png | séquences=2") && t.includes("- Esquive du joueur | hash 6002 | plug=hunter.strand.class_abilities"), t);
ok("seules les catégories utiles sont décrites (saut, compétence de classe, mêlée, grenade, super) : les fragments n'y figurent pas", !t.includes("Fragment ignoré") && t.includes("## SAUT") && t.includes("## COMPÉTENCE DE CLASSE"));
const inconnu = obtenirDiagnosticIconesDoctrine(fausseDb, undefined, null, [] as never);
ok("sans sous-classe ni option : aucune erreur, le texte le dit (« inconnue », « ? »)", inconnu.includes("(inconnue)") && inconnu.includes("élément choisi dans l'outil : ?"), inconnu);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
