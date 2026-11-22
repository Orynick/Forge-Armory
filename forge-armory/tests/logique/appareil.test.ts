// FR : ⚠️ AJOUT (05/11/2026, spec mobile-phase-0 §2.4) - test de la DÉTECTION « TÉLÉPHONE » (src/lib/appareil.ts) : la décision pure (trois signaux, toutes les combinaisons), la règle du repli tactile, et la lecture réelle des signaux du navigateur (avec un faux window/navigator, y compris Firefox sur Android qui ne fournit ni userAgentData ni deviceMemory). / EN: ⚠️ ADDED - phone-detection test.
import { estTelephoneDepuis, estTelephone, largeurEcran, LARGEUR_ECRAN_MAX_TACTILE } from "../../src/lib/appareil";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 300)); };

// ---------- la décision pure (spec §2.4 : mobile déclaré ; à défaut tactile principal ET largeur ≤ 900) ----------
ok("mobile déclaré (Chrome sur Android) : téléphone, même sur un grand écran", estTelephoneDepuis(true, false, 1920) === true);
ok("mobile déclaré (Firefox sur Android, userAgent « Mobile ») : téléphone", estTelephoneDepuis(true, false, 412) === true);
ok("PC (ni mobile, ni tactile) : jamais un téléphone, quelle que soit la largeur", estTelephoneDepuis(false, false, 400) === false && estTelephoneDepuis(false, false, 1920) === false);
ok("tablette tactile étroite (≤ 900 px) sans déclaration mobile : téléphone (repli de la spec)", estTelephoneDepuis(false, true, 768) === true);
ok("tactile principal mais ÉCRAN LARGE (> 900 px, ex. PC tactile) : PAS un téléphone", estTelephoneDepuis(false, true, 901) === false && estTelephoneDepuis(false, true, LARGEUR_ECRAN_MAX_TACTILE + 1) === false);
ok("limite exacte : 900 px tactile = téléphone, 901 px = non", estTelephoneDesdeFallback());
function estTelephoneDesdeFallback() { return estTelephoneDepuis(false, true, 900) === true && estTelephoneDepuis(false, true, 901) === false; }

// ---------- la lecture réelle des signaux du navigateur (faux window/navigator) ----------
// FR : hors navigateur, sans window : faux (Node, tests). / EN: no window: false.
ok("hors navigateur (pas de window) : faux", typeof globalThis.window === "undefined" && estTelephone() === false && largeurEcran() === 0);

// FR : simule un navigateur en posant globalThis.window / navigator, puis les retire (Node ≥ 21 expose `navigator` en lecture seule : defineProperty). / EN: simulate a browser via globals.
function simulerNavigateur(fenetre: { innerWidth: number; matchMedia?: (q: string) => { matches: boolean } }, nav: object): void {
  (globalThis as Record<string, unknown>).window = fenetre;
  Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true });
}
function reinitialiser(): void {
  delete (globalThis as Record<string, unknown>).window;
  Object.defineProperty(globalThis, "navigator", { value: undefined, configurable: true });
}

// Chrome sur Android : userAgentData.mobile = true.
simulerNavigateur({ innerWidth: 412 }, { userAgent: "Mozilla/5.0 (Linux; Android 15) Chrome/131 Mobile Safari/537.36", userAgentData: { mobile: true } });
ok("Chrome sur Android (userAgentData.mobile = true) : téléphone détecté", estTelephone() === true);
ok("largeur d'écran lue depuis window.innerWidth", largeurEcran() === 412);

// Firefox sur Android : pas d'userAgentData, mais « Mobile » dans l'userAgent (remarque de l'utilisateur : tests possibles sous Firefox).
simulerNavigateur({ innerWidth: 360 }, { userAgent: "Mozilla/5.0 (Android 15; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0" });
ok("Firefox sur Android (userAgentData absent, « Mobile » dans l'userAgent) : téléphone détecté", estTelephone() === true);

// PC de bureau : pas mobile, pointeur fin.
simulerNavigateur({ innerWidth: 1920, matchMedia: (q) => ({ matches: q === "(pointer: fine)" }) }, { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131" });
ok("PC (userAgent bureau, pointer: fine) : PAS un téléphone", estTelephone() === false);

// PC tactile étroit (rare) : repli de la spec.
simulerNavigateur({ innerWidth: 800, matchMedia: (q) => ({ matches: q === "(pointer: coarse)" }) }, { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" });
ok("repli : tactile principal ET 800 px = téléphone, même avec un userAgent de bureau", estTelephone() === true);

// matchMedia indisponible (vieille API) : aucun repli sauvage, seul le mobile déclaré compte.
simulerNavigateur({ innerWidth: 400 }, { userAgent: "Mozilla/5.0 (Windows NT 10.0)" });
ok("matchMedia absente : pas de repli tactile, un PC reste un PC", estTelephone() === false);

reinitialiser();
ok("après retrait du faux navigateur : de nouveau faux (aucune fuite d'état)", estTelephone() === false);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
