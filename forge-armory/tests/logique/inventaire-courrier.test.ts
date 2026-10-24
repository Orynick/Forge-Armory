// FR : ⚠️ AJOUT (24/10/2026, branche test, tests post-audit, point 5.8) - test du
// COURRIER (postmaster) dans l'inventaire possédé. Point 5.8 de la liste de
// tests : « essayer de déplacer/équiper un objet situé au courrier → refus avec
// le bon message (« ne se déplace pas d'ici ») ». Le blocage constaté : Forge
// Armory ne mettait PAS le contenu du postmaster dans la liste. Ce test couvre
// les deux moitiés du point :
//   1. la LECTURE : un objet avec `location: 4` dans l'inventaire d'un
//      personnage arrive dans la liste, étiqueté origine « courrier » (jamais
//      mélangé à l'inventaire du personnage ni au coffre) ;
//   2. le REFUS : déplacer (planifierDeplacement) ou équiper (message de
//      equiper) un objet au courrier est refusé avec le bon message.
// Le profil Bungie est FAUSSÉ (fetch bouchonné), le Manifest aussi (fausse db
// du fixture `fauxManifest`). Jamais d'appel réel à Bungie.
// EN: test of the POSTMASTER in the owned inventory. Test point 5.8: "try to
// move/equip an item in the postmaster → refused with the right message".
// The reported blocker: Forge Armory did NOT put the postmaster content in the
// list. This test covers both halves: the READ (a `location: 4` item lands in
// the list, tagged origin "courrier") and the REFUSAL (moving or equipping a
// postmaster item is refused with the right message).
import { listerObjetsPossedes } from "../../src/lib/bungie/inventaire";
import { planifierDeplacement, LIBELLES_LIEU, Lieu } from "../../src/lib/bungie/deplacer";
import { LIEU_COURRIER } from "../../src/lib/bungie/equiper";
import { creerFausseDb, T_OBJET, T_RARETE } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 600)); };

// ---------- faux Manifest : une arme cinétique légendaire (hash 111) ----------
const HASH_LEGENDAIRE = 4008398120;
const defs: Record<string, Record<number, unknown>> = {
  [T_OBJET]: {
    111: {
      displayProperties: { name: "Arme A", icon: "/icons/arme-a.png", description: "" },
      itemType: 3, itemTypeDisplayName: "Fusil automatique", defaultDamageType: 1,
      inventory: { bucketTypeHash: 1498876634, tierTypeHash: HASH_LEGENDAIRE },
      equippingBlock: { ammoType: 1 },
      sockets: { socketEntries: [], socketCategories: [] },
    },
  },
  [T_RARETE]: { [HASH_LEGENDAIRE]: { displayProperties: { name: "Légendaire" } } },
  DestinyDamageTypeDefinition: { 1: { enumValue: 1, displayProperties: { name: "Cinétique", icon: "/icons/cinetique.png" } } },
  DestinyStatDefinition: {},
};
const { db } = creerFausseDb(defs);

// ---------- faux profil Bungie : un objet au courrier (location 4) ----------
const profilFaux = {
  characters: { data: { "id-titan": { classType: 0, light: 1800 } } },
  profileInventory: { data: { items: [{ itemHash: 111, itemInstanceId: "v1" }] } },   // au coffre
  characterInventories: {
    data: {
      "id-titan": {
        items: [
          { itemHash: 111, itemInstanceId: "i1", location: 1 },   // inventaire du Titan
          { itemHash: 111, itemInstanceId: "p1", location: 4 },   // ⚠️ COURRIER (postmaster)
          { itemHash: 111, itemInstanceId: "p2", location: 4 },   // ⚠️ un deuxième au courrier
        ],
      },
    },
  },
  characterEquipment: { data: { "id-titan": { items: [] } } },
  itemComponents: { sockets: { data: {} }, instances: { data: {} }, reusablePlugs: { data: {} } },
};

// ---------- bouchons : token + fetch (jamais d'appel réel) ----------
// FR : `lireTokens` lit via le cache du stockage sécurisé, qui retombe sur
// `localStorage` : on bouchonne donc `localStorage` (Node n'en a pas).
// EN: `lireTokens` reads through the secure-storage cache, which falls back
// to `localStorage`: we stub `localStorage` (Node has none).
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (cle: string) => (cle === "d2ba.bungie.tokens" ? JSON.stringify({ access_token: "faux", expires_at: Date.now() + 3_600_000, membership_id: "1" }) : null),
  setItem: () => {}, removeItem: () => {},
};
let urlAppele = "";
(globalThis as Record<string, unknown>).fetch = async (url: string) => {
  urlAppele = String(url);
  return { ok: true, clone: () => ({ text: async () => "" }), json: async () => ({ ErrorCode: 1, Response: profilFaux }) } as never;
};

const membership = { membershipType: 3, membershipId: "1", displayName: "Test" } as never;
const r = await listerObjetsPossedes(membership, db as never);

// ---------- 1. la lecture ----------
ok("l'appel part bien sur le profil du bon compte, avec les composants attendus (201 = inventaires personnages, qui porte le courrier)", /\/Destiny2\/3\/Profile\/1\/\?components=/.test(urlAppele) && /201/.test(urlAppele) && /205/.test(urlAppele) && /102/.test(urlAppele), urlAppele);
const auCourrier = r.pieces.filter((p) => p.origine === "courrier");
const surTitan = r.pieces.filter((p) => p.origine === "titan");
const auCoffre = r.pieces.filter((p) => p.origine === "coffre");
ok("les DEUX objets au courrier (location 4) sont lus et étiquetés « courrier »", auCourrier.length === 2 && auCourrier.every((p) => p.itemInstanceId === "p1" || p.itemInstanceId === "p2"), r.pieces.map((p) => [p.itemInstanceId, p.origine]));
ok("l'objet de l'inventaire du Titan reste « titan » (le courrier n'est PAS mélangé à l'inventaire du personnage)", surTitan.length === 1 && surTitan[0].itemInstanceId === "i1", r.pieces.map((p) => [p.itemInstanceId, p.origine]));
ok("l'objet du coffre reste « coffre »", auCoffre.length === 1 && auCoffre[0].itemInstanceId === "v1", r.pieces.map((p) => [p.itemInstanceId, p.origine]));
ok("aucun objet du courrier n'est marqué équipé", auCourrier.every((p) => !p.equipe));

// ---------- 2. le refus de déplacement ----------
const CLASSES: Record<string, Lieu> = { "id-titan": "titan" };
const positionCourrier = { etat: "localisee" as const, characterId: "id-titan", location: LIEU_COURRIER, equipe: false };
const refusCoffre = planifierDeplacement({ position: positionCourrier, classes: CLASSES, cible: "coffre" });
ok("déplacer un objet DU courrier vers le Coffre : refus « courrier », AUCUNE étape (rien n'est tenté)", !refusCoffre.ok && refusCoffre.code === "courrier" && !("etapes" in refusCoffre), refusCoffre);
ok("le message de refus dit bien « ne peut pas être transféré d'ici » (le « bon message » du point 5.8)", !refusCoffre.ok && /courrier/.test(refusCoffre.message) && /ne peut pas être transféré d'ici/.test(refusCoffre.message), !refusCoffre.ok && refusCoffre.message);
const refusTitan = planifierDeplacement({ position: positionCourrier, classes: CLASSES, cible: "titan" });
ok("déplacer un objet DU courrier vers un personnage : même refus (même message)", !refusTitan.ok && refusTitan.code === "courrier" && refusTitan.message === (refusCoffre as { message: string }).message, refusTitan);

// ---------- 3. le libellé du lieu (affichage) ----------
ok("« courrier » a un libellé d'affichage (« le courrier »), comme les autres lieux", LIBELLES_LIEU.courrier === "le courrier" && !!LIBELLES_LIEU.coffre);

// ---------- 4. la pièce porte bien l'info pour le bouton grisé ----------
ok("une pièce du courrier a une origine « courrier » exploitable par le bouton « Transférer vers » (grisé avec explication)", auCourrier.every((p) => p.origine === "courrier" && !!p.itemInstanceId));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
