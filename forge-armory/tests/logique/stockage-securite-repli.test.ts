// FR : ⛔ AJOUT (branche draft-sec) - test de COMPORTEMENT du stockage chiffré
// des secrets (`src/lib/stockageSecurise.ts`) dans le cas de REPLI : pont
// Electron présent mais chiffrement OS INDISPONIBLE (Linux sans
// kwallet/libsecret, par exemple). Le contrat documenté : avertissement en
// console, AUCUNE migration, repli sur localStorage pour l'écriture et la
// lecture, effacement quand même propre. Un pont FACTICE dont `disponible()`
// renvoie false, et un localStorage FACTICE, sont fournis.
// EN: behavior test of the encrypted secret storage in the FALLBACK case:
// Electron bridge present but OS encryption UNAVAILABLE (e.g. Linux without
// kwallet/libsecret). Documented contract: console warning, NO migration,
// localStorage fallback for read/write, clean erase. A FAKE bridge whose
// `disponible()` returns false and a FAKE localStorage are provided.
import {
  ecrireSecret,
  effacerSecret,
  initialiserStockageSecurise,
  lireEnCache,
} from "../../src/lib/stockageSecurise";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };

// ---------- factices : localStorage + pont dont le coffre est indisponible ----------
const stockageLocal = new Map<string, string>();
const g = globalThis as unknown as Record<string, unknown>;
g.localStorage = {
  getItem: (cle: string) => stockageLocal.get(cle) ?? null,
  setItem: (cle: string, valeur: string) => void stockageLocal.set(cle, valeur),
  removeItem: (cle: string) => void stockageLocal.delete(cle),
};
let ecrituresDansLeCoffre = 0;
g.window = {
  appBureau: {
    stockageSecurise: {
      disponible: async () => false,
      lire: async () => null,
      ecrire: async () => (ecrituresDansLeCoffre++, false),
      effacer: async () => true,
    },
  },
};

// ---------- avertissement console ----------
let avertissementVu = false;
const consoleWarnOriginale = console.warn;
console.warn = (...args: unknown[]) => { if (String(args[0]).includes("chiffrement OS indisponible")) avertissementVu = true; consoleWarnOriginale(...(args as Parameters<typeof consoleWarnOriginale>)); };

stockageLocal.set("d2ba.bungie.tokens", "JETON_EN_CLAIR");
await initialiserStockageSecurise();
console.warn = consoleWarnOriginale;

ok("COMPORTEMENT (repli) : un avertissement console signale le repli sur localStorage", avertissementVu);

// ---------- pas de migration, pas d'écriture coffre ----------
ok("COMPORTEMENT (repli) : la valeur en clair N'est PAS migrée (elle reste dans localStorage)", stockageLocal.get("d2ba.bungie.tokens") === "JETON_EN_CLAIR");
ok("COMPORTEMENT (repli) : le coffre chiffré n'a JAMAIS été sollicité en écriture", ecrituresDansLeCoffre === 0);

// ---------- écriture / lecture / effacement en repli ----------
await ecrireSecret("d2ba.dim.apiKey", "CLE_DIM");
ok("COMPORTEMENT (repli) : ecrireSecret écrit dans localStorage (seul stockage disponible)", stockageLocal.get("d2ba.dim.apiKey") === "CLE_DIM");
ok("COMPORTEMENT (repli) : lireEnCache renvoie la valeur écrite", lireEnCache("d2ba.dim.apiKey") === "CLE_DIM");
await effacerSecret("d2ba.dim.apiKey");
ok("COMPORTEMENT (repli) : effacerSecret supprime la valeur de localStorage", stockageLocal.get("d2ba.dim.apiKey") === undefined);
ok("COMPORTEMENT (repli) : après effacement, lireEnCache renvoie null", lireEnCache("d2ba.dim.apiKey") === null);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
