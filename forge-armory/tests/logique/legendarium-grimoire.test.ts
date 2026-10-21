// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - test du GRIMOIRE D1 (`lib/legendarium/grimoire.ts`) : conversion API legacy → livres (livre → cartes), tolérance (livre sans carte, carte sans texte), et REPLI statique en cas d'échec réseau (jamais d'erreur, jamais de blocage). ⚠️ Le test ne touche PAS le réseau : `fetch` est remplacé par un bouchon. La disponibilité RÉELLE de l'endpoint D1 n'est PAS vérifiée ici (voir le diagnostic en `npm run dev`). EN: tests the D1 Grimoire conversion and the static fallback on fetch failure. No real network: fetch is stubbed.
import { convertirGrimoire, lireGrimoire, diagnostiquerGrimoire, REPLI_GRIMOIRE_STATIQUE } from "../../src/lib/legendarium/grimoire";
import type { LivreLore } from "../../src/lib/legendarium/types";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// --- Conversion (fonction pure) ---
const livres = convertirGrimoire([
  {
    bookHash: 1,
    bookName: "Le Fragment",
    cards: [
      { cardId: 101, cardName: "Carte I — L'Écho", cardDescription: "La Lune garde les secrets des premiers morts.", chapterName: "Chapitre un" },
      { cardId: 102, cardName: "Carte II — Le Silence", cardDescription: "Le silence n'est pas l'absence de son." },
      { cardId: 103, cardName: "Carte sans texte", cardDescription: "" }, // exclue
    ],
  },
  { bookHash: 2, bookName: "Livre sans carte", cards: [] }, // exclu
  { bookHash: 3, bookName: "Livre sans nom", cards: [{ cardId: 201, cardDescription: "Texte seul." }] }, // titre par défaut
]);
ok("la conversion produit un livre par livre AVEC cartes, dans l'ordre (livre sans carte exclu)",
  livres.length === 2 && livres[0].titre === "Le Fragment" && livres[1].titre === "Livre sans nom", livres.map((l) => l.titre));
ok("les cartes ont l'identifiant stable « grimoire:<idCarte> » et le chapitre en sous-titre ; la carte sans texte est exclue",
  livres[0].pages.length === 2 && livres[0].pages[0].id === "grimoire:101" && livres[0].pages[0].sousTitre === "Chapitre un" && livres[0].pages[0].texte === "La Lune garde les secrets des premiers morts.", livres[0].pages.map((p) => p.id));
ok("un livre sans nom prend un titre par défaut ; une carte sans nom aussi",
  livres[1].pages[0].titre === "Carte 1" && livres[1].pages[0].texte === "Texte seul.", livres[1].pages[0]);
ok("la conversion tolère une entrée vide ou mal formée (jamais d'exception)",
  convertirGrimoire([]).length === 0 && convertirGrimoire([{}]).length === 0 && convertirGrimoire([{ cards: [{}] }]).length === 0);

// --- Repli statique sur échec réseau (fetch bouchonné) ---
// ⚠️ Le test tourne SANS `.env.local` : `bungieConfig.apiKey` vaut `undefined`, ce qui fait
// retourner le repli statique AVANT tout fetch. Pour tester le comportement réseau, on bouchonne
// AUSSI la config (le module `config` est mis en cache par le bundler : on remplace la valeur
// via le bouchon de fetch en contournant le garde-fou — voir `avecFetchEtCle`).
import { bungieConfig } from "../../src/lib/bungie/config";
const CLE_TEST = "cle-de-test";
const cleOriginale = bungieConfig.apiKey;
(bungieConfig as { apiKey: string }).apiKey = CLE_TEST;
const fetchOriginal = globalThis.fetch;
async function avecFetch(bouchon: () => Promise<unknown>, fn: () => Promise<LivreLore[]>) {
  globalThis.fetch = bouchon as typeof fetch;
  try {
    return await fn();
  } finally {
    globalThis.fetch = fetchOriginal;
  }
}

// ⚠️ Le bouchon de fetch vérifie aussi l'URL et l'en-tête X-API-Key (contrat de la spec §2)
let urlAppele = "";
let entetesAppelees: unknown = null;
async function bouchonQuiEchoue(): Promise<unknown> {
  urlAppele = "";
  entetesAppelees = null;
  throw new Error("réseau coupé");
}
const fetchOriginalPourContrat = globalThis.fetch;
globalThis.fetch = (async (url: unknown, init: { headers?: unknown }) => {
  urlAppele = String(url);
  entetesAppelees = init?.headers;
  return { ok: false, status: 404 };
}) as typeof fetch;
const livresContrat = await lireGrimoire();
globalThis.fetch = fetchOriginalPourContrat;
ok("le contrat réseau est respecté : URL = endpoint legacy D1 sur www.bungie.net, en-tête X-API-Key présent",
  urlAppele === "https://www.bungie.net/d1/Platform/Destiny/Vanguard/Grimoire/Definition/" && (entetesAppelees as Record<string, string>)?.["X-API-Key"] === CLE_TEST, { urlAppele, entetesAppelees });
ok("ce 404 retombe sur le repli statique", livresContrat === REPLI_GRIMOIRE_STATIQUE);

// fetch en échec réseau
let livresRepli = await avecFetch(bouchonQuiEchoue, lireGrimoire);
ok("fetch en échec réseau → repli statique, sans erreur", Array.isArray(livresRepli) && livresRepli === REPLI_GRIMOIRE_STATIQUE, livresRepli);

// fetch 404
livresRepli = await avecFetch(async () => ({ ok: false, status: 404 }), lireGrimoire);
ok("fetch 404 → repli statique, sans erreur", livresRepli === REPLI_GRIMOIRE_STATIQUE);

// fetch réponse invalide (pas de thème)
livresRepli = await avecFetch(async () => ({ ok: true, json: async () => ({ Response: {} }) }), lireGrimoire);
ok("réponse invalide (pas de thème) → repli statique, sans erreur", livresRepli === REPLI_GRIMOIRE_STATIQUE);

// fetch réponse valide
const reponseValide = {
  ok: true,
  json: async () => ({
    Response: {
      themeCollection: [
        { books: [{ bookHash: 9, bookName: "Livre API", cards: [{ cardId: 900, cardName: "Carte API", cardDescription: "Depuis l'API." }] }] },
        { books: [] },
        {},
      ],
    },
  }),
};
const livresApi = await avecFetch(async () => reponseValide, lireGrimoire);
ok("réponse valide → livres de l'API (thèmes aplatis, livres vides ignorés), pas de repli",
  livresApi.length === 1 && livresApi[0].titre === "Livre API" && livresApi[0].pages[0].id === "grimoire:900", livresApi.map((l) => l.titre));

// fetch réponse valide mais sans aucune carte avec texte → repli
const reponseVide = { ok: true, json: async () => ({ Response: { themeCollection: [{ books: [{ bookName: "Vide", cards: [] }] }] } }) };
livresRepli = await avecFetch(async () => reponseVide, lireGrimoire);
ok("réponse valide mais sans contenu → repli statique", livresRepli === REPLI_GRIMOIRE_STATIQUE);

// --- Diagnostic (20/10/2026) : distinguer « pas de clé » de « clé refusée par Bungie pour le D1 » ---
// Sans clé : le diagnostic dit clairement qu'il n'y a pas de clé (le navigateur de l'utilisateur, sans en-tête, obtenait ApiKeyMissingFromRequest)
(bungieConfig as { apiKey: string }).apiKey = "";
const diagSansCle = await diagnostiquerGrimoire();
ok("diagnostic sans clé : dit « aucune clé » sans appeler le réseau",
  diagSansCle.clePresente === false && diagSansCle.erreur !== undefined && diagSansCle.statutHttp === undefined, diagSansCle);
(bungieConfig as { apiKey: string }).apiKey = CLE_TEST;

// Clé refusée (401/2102 ApiKeyMissingFromRequest ou ApiKeyInvalid) : statut + message Bungie rapportés
const reponseRefusee = { ok: false, status: 401, json: async () => ({ ErrorCode: 2102, ErrorStatus: "ApiKeyMissingFromRequest", Message: "Please add valid X-API-Key header to request." }) };
const diagRefuse = await avecFetch(async () => reponseRefusee, () => diagnostiquerGrimoire());
ok("diagnostic clé refusée : statut HTTP + message Bungie rapportés (pour distinguer « clé absente » de « clé refusée »)",
  diagRefuse.clePresente === true && diagRefuse.statutHttp === 401 && diagRefuse.erreurBungie?.includes("ApiKeyMissingFromRequest") === true, diagRefuse);

// Clé acceptée : livres + cartes comptés
const diagOk = await avecFetch(async () => reponseValide, () => diagnostiquerGrimoire());
ok("diagnostic clé acceptée : livres et cartes comptés",
  diagOk.ok === true && diagOk.livres === 1 && diagOk.cartes === 1, diagOk);

// Réseau coupé : erreur réseau rapportée, sans exception
const diagReseau = await avecFetch(async () => { throw new Error("réseau coupé"); }, () => diagnostiquerGrimoire());
ok("diagnostic réseau coupé : erreur rapportée, sans exception",
  diagReseau.erreur === "réseau coupé", diagReseau);

(bungieConfig as { apiKey: string }).apiKey = cleOriginale;
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
