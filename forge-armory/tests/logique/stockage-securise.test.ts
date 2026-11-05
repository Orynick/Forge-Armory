// FR : ⛔ AJOUT (branche draft-sec) - test de COMPORTEMENT du stockage chiffré
// des secrets (`src/lib/stockageSecurise.ts`) dans le cas NOMINAL : pont
// Electron présent et chiffrement OS DISPONIBLE. Le module ne tourne en vrai
// que dans le logiciel installé (il lui faut `window.appBureau`), donc ce test
// fournit un pont FACTICE (une Map qui joue le coffre safeStorage) et un
// localStorage FACTICE, puis vérifie le contrat de bout en bout :
//   1. avant l'init, `lireEnCache` retombe sur localStorage ;
//   2. l'init peuple le cache depuis le coffre chiffré ;
//   3. l'init MIGRE une valeur encore en clair dans localStorage vers le
//      coffre chiffré, puis la supprime de localStorage ;
//   4. `ecrireSecret` écrit dans le coffre (préfixe « sec: ») et nettoie
//      localStorage ;
//   5. `effacerSecret` supprime la valeur des DEUX stockages et du cache ;
//   6. les clés du coffre portent bien le préfixe `sec:`.
// EN: behavior test of the encrypted secret storage in the NOMINAL case:
// Electron bridge present, OS encryption AVAILABLE. A FAKE bridge (a Map
// playing the safeStorage vault) and a FAKE localStorage are provided, then
// the contract is checked end to end (cache warm-up, cleartext migration,
// write, erase, « sec: » key prefix).
import {
  CLES_SECRETS,
  ecrireSecret,
  effacerSecret,
  initialiserStockageSecurise,
  lireEnCache,
} from "../../src/lib/stockageSecurise";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };

// ---------- factices : localStorage + pont safeStorage ----------
const stockageLocal = new Map<string, string>();
const coffre = new Map<string, string>();
const g = globalThis as unknown as Record<string, unknown>;
g.localStorage = {
  getItem: (cle: string) => stockageLocal.get(cle) ?? null,
  setItem: (cle: string, valeur: string) => void stockageLocal.set(cle, valeur),
  removeItem: (cle: string) => void stockageLocal.delete(cle),
};
g.window = {
  appBureau: {
    stockageSecurise: {
      disponible: async () => true,
      lire: async (cle: string) => coffre.get(cle) ?? null,
      ecrire: async (cle: string, valeur: string) => (coffre.set(cle, valeur), true),
      effacer: async (cle: string) => (coffre.delete(cle), true),
    },
  },
};

// ---------- état initial : un jeton déjà chiffré, un jeton encore en clair ----------
coffre.set("sec:d2ba.bungie.tokens", "JETON_CHIFFRE");
stockageLocal.set("d2ba.dim.apiKey", "CLE_EN_CLAIR");

// ---------- 1. avant l'init : repli localStorage ----------
ok("COMPORTEMENT : avant l'init, lireEnCache retombe sur localStorage (valeur en clair lue)", lireEnCache("d2ba.dim.apiKey") === "CLE_EN_CLAIR");
ok("COMPORTEMENT : avant l'init, lireEnCache renvoie null pour une clé absente", lireEnCache("d2ba.dim.accessToken") === null);

// ---------- 2. init : cache peuplé depuis le coffre ----------
await initialiserStockageSecurise();
ok("COMPORTEMENT : après l'init, lireEnCache renvoie la valeur DÉCHIFFRÉE du coffre", lireEnCache("d2ba.bungie.tokens") === "JETON_CHIFFRE");

// ---------- 3. migration de la valeur en clair ----------
ok("COMPORTEMENT : la valeur encore en clair dans localStorage est MIGRÉE vers le coffre chiffré", coffre.get("sec:d2ba.dim.apiKey") === "CLE_EN_CLAIR");
ok("COMPORTEMENT : après migration, la valeur n'est PLUS dans localStorage", stockageLocal.get("d2ba.dim.apiKey") === undefined);
ok("COMPORTEMENT : lireEnCache renvoie la valeur migrée", lireEnCache("d2ba.dim.apiKey") === "CLE_EN_CLAIR");

// ---------- 4. écriture ----------
await ecrireSecret("d2ba.dim.accessToken", "JETON_DIM");
ok("COMPORTEMENT : ecrireSecret écrit dans le coffre sous la clé préfixée « sec: »", coffre.get("sec:d2ba.dim.accessToken") === "JETON_DIM");
ok("COMPORTEMENT : ecrireSecret ne laisse AUCUNE copie en clair dans localStorage", stockageLocal.get("d2ba.dim.accessToken") === undefined);
ok("COMPORTEMENT : lireEnCache renvoie la valeur écrite", lireEnCache("d2ba.dim.accessToken") === "JETON_DIM");

// ---------- 5. effacement ----------
await effacerSecret("d2ba.bungie.tokens");
ok("COMPORTEMENT : effacerSecret supprime la valeur du coffre", !coffre.has("sec:d2ba.bungie.tokens"));
ok("COMPORTEMENT : effacerSecret supprime la valeur du cache (lireEnCache → null)", lireEnCache("d2ba.bungie.tokens") === null);

// ---------- 6. préfixe et clés ----------
ok("COMPORTEMENT : toutes les clés du coffre portent le préfixe « sec: »", [...coffre.keys()].every((c) => c.startsWith("sec:")), [...coffre.keys()]);
ok("COMPORTEMENT : CLES_SECRETS couvre les trois secrets (jetons Bungie, jeton DIM, clé DIM)", CLES_SECRETS.length === 3 && CLES_SECRETS.includes("d2ba.bungie.tokens") && CLES_SECRETS.includes("d2ba.dim.accessToken") && CLES_SECRETS.includes("d2ba.dim.apiKey"));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
