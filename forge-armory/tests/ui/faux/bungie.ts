// FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - FAUSSE API BUNGIE À ÉTAT, installée à la place de `window.fetch` dans les pages de test : répond aux deux seuls appels que fait « Transférer vers » (lecture du profil, composants 102/200/201/205, et TransferItem), applique RÉELLEMENT les déplacements dans un modèle, et refuse
// comme Bungie : objet absent de l'endroit annoncé (1623), objet équipé, place manquante. `window.__bungie` : { modele (où est chaque objet), appels (journal), echecs (file de statuts d'erreur, un par appel de transfert ; null = succès), delai (ms) }. EN: ⚠️ ADDED - stateful fake Bungie API replacing fetch in test pages.
type Endroit = "coffre" | "titan" | "chasseur" | "arcaniste";
interface Obj { hash: number; endroit: Endroit; equipe: boolean }
const IDS: Record<string, Endroit> = { "id-titan": "titan", "id-chasseur": "chasseur", "id-arcaniste": "arcaniste" };
const CLASSTYPE: Record<Endroit, number> = { titan: 0, chasseur: 1, arcaniste: 2, coffre: -1 };
export function installerFauxBungie() {
  const etat = {
    modele: { a1: { hash: 111, endroit: "titan", equipe: true }, a2: { hash: 111, endroit: "coffre", equipe: false }, b1: { hash: 222, endroit: "chasseur", equipe: false }, c1: { hash: 333, endroit: "arcaniste", equipe: false }, d1: { hash: 444, endroit: "coffre", equipe: false } } as Record<string, Obj>,
    appels: [] as { op: string; characterId: string; itemId: string }[],
    echecs: [] as (string | null)[],
    delai: 0,
    sessionExpiree: false,
  };
  (window as unknown as { __bungie: typeof etat }).__bungie = etat;
  const elements = (f: (o: Obj) => boolean) => Object.entries(etat.modele).filter(([, o]) => f(o)).map(([id, o]) => ({ itemInstanceId: id, itemHash: o.hash, location: 1 }));
  const reponse = (corps: unknown) => ({ ok: true, status: 200, json: async () => corps, text: async () => JSON.stringify(corps) });
  (window as unknown as { fetch: unknown }).fetch = async (url: string, init?: { body?: string }) => {
    if (etat.delai) await new Promise((r) => setTimeout(r, etat.delai));
    if (String(url).includes("/Profile/")) {
      const parPerso = (equipe: boolean) => Object.fromEntries(Object.entries(IDS).map(([id, e]) => [id, { items: elements((o) => o.endroit === e && o.equipe === equipe) }]));
      return reponse({ ErrorCode: 1, Response: { profileInventory: { data: { items: elements((o) => o.endroit === "coffre") } }, characterInventories: { data: parPerso(false) }, characterEquipment: { data: parPerso(true) }, characters: { data: Object.fromEntries(Object.entries(IDS).map(([id, e]) => [id, { classType: CLASSTYPE[e] }])) } } });
    }
    if (String(url).includes("/TransferItem/")) {
      const b = JSON.parse(init?.body ?? "{}") as { itemId: string; characterId: string; transferToVault: boolean };
      etat.appels.push({ op: b.transferToVault ? "envoyer" : "tirer", characterId: b.characterId, itemId: b.itemId });
      const prevu = etat.echecs.shift();
      if (prevu) return reponse({ ErrorCode: 1642, ErrorStatus: prevu, Message: "Échec simulé par la fausse API." });
      const o = etat.modele[b.itemId];
      const introuvable = () => reponse({ ErrorCode: 1623, ErrorStatus: "DestinyItemNotFound", Message: "Objet absent de l'endroit annoncé." });
      if (!o) return introuvable();
      if (b.transferToVault) { if (o.endroit !== IDS[b.characterId] || o.equipe) return introuvable(); o.endroit = "coffre"; }
      else { if (o.endroit !== "coffre") return introuvable(); o.endroit = IDS[b.characterId]; }
      return reponse({ ErrorCode: 1, ErrorStatus: "Success", Response: 1 });
    }
    return reponse({ ErrorCode: 1, Response: {} });
  };
}
