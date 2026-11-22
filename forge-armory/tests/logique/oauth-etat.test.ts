// FR : ⚠️ AJOUT (05/11/2026, spec mobile-phase-0 §2.3) - test du DURCISSEMENT de `validerEtatOAuth` : un état anti-CSRF INTROUVABLE au retour de Bungie REFUSE maintenant la connexion AUSSI DANS LE NAVIGATEUR (site public et `npm run dev`), plus seulement dans le logiciel installé. Couvre : état présent et correspondant (accepté), état présent mais différent (refusé), état absent + code absent (refusé, les deux modes), état absent + code présent (refusé, les deux modes). / EN: ⚠️ ADDED - test of the hardened OAuth state check: a missing state now fails closed in the browser too.
import { validerEtatOAuth } from "../../src/lib/bungie/oauth";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 300)); };

// FR : faux sessionStorage (la clé utilisée par oauth.ts) : chaque lecture consomme l'état comme en vrai (removeItem), donc on le REPOSE avant chaque contrôle. / EN: fake sessionStorage; the check consumes the state, so re-seed before each check.
const CLE = "d2ba.bungie.oauthState";
let etatStocke: string | null = null;
(globalThis as Record<string, unknown>).sessionStorage = {
  getItem: (cle: string) => (cle === CLE ? etatStocke : null),
  removeItem: (cle: string) => { if (cle === CLE) etatStocke = null; },
  setItem: (cle: string, valeur: string) => { if (cle === CLE) etatStocke = valeur; },
};
const poser = (etat: string | null) => { etatStocke = etat; };

// ---------- les cas de la spec §2.3 (mode NAVIGATEUR : pas de pont Electron) ----------
poser("etat-attendu");
ok("état présent et code correspondant : connexion ACCEPTÉE (comportement inchangé)", validerEtatOAuth("etat-attendu") === true);
poser("etat-attendu");
ok("état présent mais code DIFFÉRENT : connexion refusée (protection anti-usurpation)", validerEtatOAuth("autre-chose") === false);
poser("etat-attendu");
ok("⚠️ état présent mais code ABSENT : connexion refusée", validerEtatOAuth(null) === false);
poser(null);
ok("⚠️ état INTROUVABLE (sessionStorage vide, ex. onglet différent) + code présent : connexion REFUSÉE dans le navigateur — c'est le durcissement de la spec §2.3", validerEtatOAuth("etat-attendu") === false);
poser(null);
ok("⚠️ état introuvable + code absent : connexion refusée", validerEtatOAuth(null) === false);

// ---------- le mode LOGICIEL INSTALLÉ (pont Electron présent) : refusait déjà, inchangé ----------
(globalThis as Record<string, unknown>).window = { appBureau: { estBureau: true } };
poser("etat-attendu");
ok("logiciel installé, état présent et correspondant : accepté (inchangé)", validerEtatOAuth("etat-attendu") === true);
poser("etat-attendu");
ok("logiciel installé, code absent : refusé (refusait déjà depuis l'audit du 26/09 — inchangé)", validerEtatOAuth(null) === false);
poser(null);
ok("logiciel installé, état introuvable : refusé (inchangé)", validerEtatOAuth("nimporte") === false);
delete (globalThis as Record<string, unknown>).window;

// FR : l'état est CONSOMMÉ par la vérification (one-shot) : après un contrôle, même le bon code est refusé au second appel. / EN: the state is one-shot.
poser("etat-attendu");
validerEtatOAuth("etat-attendu");
ok("l'état est consommé par la vérification : un second appel avec le même code est refusé", validerEtatOAuth("etat-attendu") === false);

delete (globalThis as Record<string, unknown>).sessionStorage;
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
