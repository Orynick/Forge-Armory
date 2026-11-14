// FR : ⚠️ AJOUT (14/11/2026, chantier draft-avertissement-cache-web) - TESTS de la logique du bandeau « Builds conservés dans le cache du navigateur » (`src/lib/avertissementCacheWeb.ts`) : lecture/écriture de la coche « Ne plus afficher » (avec stockage injecté, refus silencieux), et les conditions d'affichage (web uniquement, pas si cochée).
// EN: tests of the browser-cache warning's pure logic (injectable storage, dismiss checkbox, display conditions).
import { CLE_NE_PLUS_AFFICHER, lireNePlusAfficher, ecrireNePlusAfficher, doitAfficherAvertissementCacheWeb, TITRE_AVERTISSEMENT, TEXTE_AVERTISSEMENT } from "../../src/lib/avertissementCacheWeb";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail)); };

// FR : un stockage factice (comme localStorage, sans navigateur). / EN: a fake storage.
function fauxStockage(casse = false): { stockage: Record<string, string>; s: { getItem(k: string): string | null; setItem(k: string, v: string): void } } {
  const stockage: Record<string, string> = {};
  return { stockage, s: casse
    ? { getItem: () => { throw new Error("refusé"); }, setItem: () => { throw new Error("refusé"); } }
    : { getItem: (k) => stockage[k] ?? null, setItem: (k, v) => { stockage[k] = v; } } };
}

// ---------- 1. la coche « Ne plus afficher » ----------
const { stockage, s } = fauxStockage();
ok("aucun choix enregistré : l'avertissement n'est PAS masqué (choix prudent)", lireNePlusAfficher(s) === false);
ecrireNePlusAfficher(true, s);
ok("coche enregistrée : lue telle quelle ('1' sous la clé dédiée)", lireNePlusAfficher(s) === true && stockage[CLE_NE_PLUS_AFFICHER] === "1");
ecrireNePlusAfficher(false, s);
ok("décoche enregistrée : l'avertissement REVIENT ('0')", lireNePlusAfficher(s) === false && stockage[CLE_NE_PLUS_AFFICHER] === "0");
ok("valeur parasite sous la clé (pas '1') : l'avertissement s'affiche (prudent)", (() => { const { s: s2 } = fauxStockage(); s2.setItem(CLE_NE_PLUS_AFFICHER, "n'importe"); return lireNePlusAfficher(s2) === false; })());
ok("stockage INDISPONIBLE (null) : lecture faux (affiché), écriture sans plantage", lireNePlusAfficher(null) === false && ecrireNePlusAfficher(true, null) === undefined);
const casse = fauxStockage(true);
ok("stockage qui REFUSE (mode privé strict) : lecture faux (affiché, pas masqué à tort), écriture silencieuse", lireNePlusAfficher(casse.s) === false && ecrireNePlusAfficher(true, casse.s) === undefined);

// ---------- 2. conditions d'affichage ----------
ok("WEB + pas cochée : AFFICHÉ", doitAfficherAvertissementCacheWeb(true, false));
ok("WEB + cochée : MASQUÉ", !doitAfficherAvertissementCacheWeb(true, true));
ok("appli installée / dev local (pas web) : JAMAIS affiché, cochée ou non", !doitAfficherAvertissementCacheWeb(false, false) && !doitAfficherAvertissementCacheWeb(false, true));

// ---------- 3. le texte du bandeau ----------
ok("le titre parle du cache du navigateur", TITRE_AVERTISSEMENT.includes("cache de ce navigateur"));
ok("le texte mentionne le compte Bungie, le vidage des données ET les exports (JSON réimportable dans l'application installée, texte, infographie, PDF)", TEXTE_AVERTISSEMENT.includes("compte Bungie") && TEXTE_AVERTISSEMENT.includes("JSON") && TEXTE_AVERTISSEMENT.includes("application installée") && TEXTE_AVERTISSEMENT.includes("PDF"));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
