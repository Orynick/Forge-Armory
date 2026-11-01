// FR : ⚠️ CHANGÉ (28/10/2026, « la version installable devra aussi afficher les vraies stats ») : les statistiques du JEU sont maintenant LES `stats` de l'armure quand les SIX sont là (la reconstruction d'après le Manifest est gardée dans `statsReconstruites`, avec repli sur elle si le jeu est incomplet) et le composant 304 est demandé EN PRODUCTION aussi.
// FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures), « diag d'abord » après le diagnostic des statistiques de base (la plupart des armures du nouveau système avaient des statistiques « illisibles » : l'appli les RECONSTRUIT d'après les plugs du Manifest) : TEST du CHARGEMENT de l'inventaire : les statistiques RÉELLES du jeu (composant `ItemStats`) présentes dans la réponse sont posées sur les ARMURES (`statsJeu`), la valeur 0 comprise ; jamais sur les armes ; aucune clé si le composant est absent ; les statistiques reconstruites (`stats`) restent inchangées ; et, hors mode développement, le composant 304 n'est PAS demandé (requête identique à avant). Le profil Bungie est FAUSSÉ (fetch bouchonné), le Manifest aussi : jamais d'appel réel à Bungie.
// EN: ⚠️ ADDED - test of the inventory loading: real in-game stats (API `ItemStats`) are put on ARMOR pieces as `statsJeu` (zero included), never on weapons; reconstructed `stats` unchanged; the 304 component is NOT requested outside dev mode.
import { listerObjetsPossedes } from "../../src/lib/bungie/inventaire";
import { creerFausseDb, T_OBJET, T_RARETE } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 700)); };
const LEGENDAIRE = 4008398120;
const objet = (nom: string, type: number, bucket: number, extra: Record<string, unknown> = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom}.png`, description: "" }, itemType: type, itemTypeDisplayName: nom, inventory: { bucketTypeHash: bucket, tierTypeHash: LEGENDAIRE }, sockets: { socketEntries: [], socketCategories: [] }, ...extra });
const { db } = creerFausseDb({
  [T_OBJET]: {
    211: objet("Casque d'essai", 2, 3448274439, { classType: 0 }),
    212: objet("Plastron d'essai", 2, 14239492, { classType: 0 }),
    213: objet("Gants d'essai", 2, 3551918588, { classType: 0 }),
    214: objet("Jambières d'essai", 2, 20886954, { classType: 0 }),
    9901: { displayProperties: { name: "Intrinsèque d'essai", icon: "/icons/i.png", description: "" }, plug: { plugCategoryIdentifier: "armor_stats" }, investmentStats: [{ statTypeHash: 8801, value: 7 }] },
    111: objet("Arme A", 3, 1498876634, { defaultDamageType: 1, equippingBlock: { ammoType: 1 } })
  },
  [T_RARETE]: { [LEGENDAIRE]: { displayProperties: { name: "Légendaire" } } },
  DestinyDamageTypeDefinition: { 1: { enumValue: 1, displayProperties: { name: "Cinétique", icon: "/icons/c.png" } } },
  DestinyStatDefinition: { 8801: { displayProperties: { name: "Santé" } }, 8802: { displayProperties: { name: "Corps à corps" } }, 8803: { displayProperties: { name: "Grenade" } }, 8804: { displayProperties: { name: "Super" } }, 8805: { displayProperties: { name: "Classe" } }, 8806: { displayProperties: { name: "Armes" } }, 8899: { displayProperties: { name: "Puissance" } } }
});
const jeu = (v: number[]) => ({ stats: { "8801": { statHash: 8801, value: v[0] }, "8802": { statHash: 8802, value: v[1] }, "8803": { statHash: 8803, value: v[2] }, "8804": { statHash: 8804, value: v[3] }, "8805": { statHash: 8805, value: v[4] }, "8806": { statHash: 8806, value: v[5] }, "8899": { statHash: 8899, value: 1999 } } });
const profil = {
  characters: { data: { "id-titan": { classType: 0, light: 1800 } } },
  profileInventory: { data: { items: [{ itemHash: 211, itemInstanceId: "c1" }, { itemHash: 212, itemInstanceId: "c2" }, { itemHash: 111, itemInstanceId: "w1" }, { itemHash: 213, itemInstanceId: "c3" }, { itemHash: 214, itemInstanceId: "c4" }] } },
  characterInventories: { data: { "id-titan": { items: [] } } },
  characterEquipment: { data: { "id-titan": { items: [] } } },
  itemComponents: { sockets: { data: { c3: { sockets: [{ plugHash: 9901, isEnabled: true }] }, c4: { sockets: [{ plugHash: 9901, isEnabled: true }] } } }, instances: { data: {} }, reusablePlugs: { data: {} }, stats: { data: { c1: jeu([0, 5, 5, 25, 40, 25]), w1: jeu([1, 2, 3, 4, 5, 6]), c3: jeu([10, 10, 10, 20, 30, 25]), c4: { stats: { "8801": { statHash: 8801, value: 9 }, "8802": { statHash: 8802, value: 9 }, "8803": { statHash: 8803, value: 9 } } } } } }
};
(globalThis as Record<string, unknown>).localStorage = { getItem: (cle: string) => (cle === "d2ba.bungie.tokens" ? JSON.stringify({ access_token: "faux", expires_at: Date.now() + 3_600_000, membership_id: "1" }) : null), setItem: () => {}, removeItem: () => {} };
let urlAppele = "";
(globalThis as Record<string, unknown>).fetch = async (url: string) => { urlAppele = String(url); return { ok: true, clone: () => ({ text: async () => "" }), json: async () => ({ ErrorCode: 1, Response: profil }) } as never; };
const r = await listerObjetsPossedes({ membershipType: 3, membershipId: "1", displayName: "Test" } as never, db as never);
const p = (id: string) => r.pieces.find((x) => x.itemInstanceId === id)!;

ok("STATISTIQUES DU JEU POSÉES SUR L'ARMURE : le casque c1 porte `statsJeu` : Santé 0 (la valeur 0 est CONSERVÉE), Mêlée 5, Grenade 5, Super 25, Classe 40, Arme 25 ; la statistique « Puissance » (hors des six) est ignorée", JSON.stringify(p("c1").statsJeu) === '{"sante":0,"melee":5,"grenade":5,"super":25,"classe":40,"arme":25}', p("c1").statsJeu);
ok("PAS DE COMPOSANT POUR CETTE ARMURE : aucune clé `statsJeu` (jamais un objet vide ni des zéros inventés) ; ses autres champs sont intacts", p("c2") !== undefined && !("statsJeu" in p("c2")) && p("c2").slot === "torse", p("c2"));
ok("UNE ARME N'A JAMAIS `statsJeu`, même si le composant lui en donne (ses statistiques n'ont rien à voir avec celles d'une armure)", p("w1") !== undefined && !("statsJeu" in p("w1")), p("w1"));
ok("LES STATISTIQUES DU JEU SONT LES `stats` DE L'ARMURE (« la version installable devra aussi afficher les vraies stats ») quand les SIX sont là : `stats` = celles du jeu (Santé 0 comprise), pour le casque c1 comme pour les gants c3", JSON.stringify(p("c1").stats) === '{"sante":0,"melee":5,"grenade":5,"super":25,"classe":40,"arme":25}' && JSON.stringify(p("c3").stats) === '{"sante":10,"melee":10,"grenade":10,"super":20,"classe":30,"arme":25}', [p("c1").stats, p("c3").stats]);
ok("LA RECONSTRUCTION D'APRÈS LE MANIFEST EST GARDÉE À PART quand le jeu la remplace : gants c3 : `statsReconstruites` = { Santé 7 } (le plug intrinsèque d'essai), distincte de `stats` ; casque c1 (aucun plug) : `statsReconstruites` = objet vide", JSON.stringify(p("c3").statsReconstruites) === '{"sante":7}' && JSON.stringify(p("c1").statsReconstruites) === "{}", [p("c3").statsReconstruites, p("c1").statsReconstruites]);
ok("STATISTIQUES DU JEU INCOMPLÈTES (3 sur 6) : elles ne font PAS foi : `stats` reste la reconstruction (Santé 7), AUCUN mélange des deux ; `statsJeu` garde ce que le jeu a donné (pour le diagnostic) ; pas de `statsReconstruites`", JSON.stringify(p("c4").stats) === '{"sante":7}' && JSON.stringify(p("c4").statsJeu) === '{"sante":9,"melee":9,"grenade":9}' && !("statsReconstruites" in p("c4")), p("c4"));
ok("SANS COMPOSANT : `stats` reste la reconstruction d'avant (ici aucun plug : objet vide), sans `statsJeu` ni `statsReconstruites`", JSON.stringify(p("c2").stats) === "{}" && !("statsReconstruites" in p("c2")) && !("statsJeu" in p("c2")), p("c2"));
ok("UNE ARME GARDE SES `stats` D'AVANT (le composant ne s'applique qu'aux armures) : aucune trace du composant sur elle", JSON.stringify(p("w1").stats) === "{}" && !("statsReconstruites" in p("w1")), p("w1"));
ok("LE COMPOSANT 304 EST DEMANDÉ EN PRODUCTION AUSSI (ici, hors mode développement) : 102, 200, 201, 205, 300, 302, 304, 305, 310", /components=102,200,201,205,300,302,304,305,310$/.test(urlAppele), urlAppele);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
