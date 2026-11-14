// FR : ⚠️ AJOUT (08/11/2026) - TEST de la logique du rappel « Vous préférez l'application PC ? Télécharger pour Windows » (`lib/rappelAppliPC.ts`) : les QUATRE conditions (site, pas l'appli installée, pas un petit écran, lien https) et la lecture du lien. / EN: ⚠️ ADDED - test of the PC-app reminder logic.
import { doitAfficherRappelAppliPC, lienTelechargementPC, lienTelechargementValide, REQUETE_PETIT_ECRAN } from "../../src/lib/rappelAppliPC";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail)); };
const LIEN = "https://github.com/Orynick/Forge-Armory/releases/latest";
const base = { web: true, bureau: false, petitEcran: false, lien: LIEN };

ok("AFFICHÉ quand les quatre conditions sont réunies (site, pas l'appli installée, grand écran, lien https)", doitAfficherRappelAppliPC(base));
ok("MASQUÉ dans l'appli installée (pont Electron présent), même avec un lien", !doitAfficherRappelAppliPC({ ...base, bureau: true }));
ok("MASQUÉ hors version web (build local, tests…)", !doitAfficherRappelAppliPC({ ...base, web: false }));
ok("MASQUÉ sur petit écran ou appareil tactile", !doitAfficherRappelAppliPC({ ...base, petitEcran: true }));
ok("MASQUÉ tant qu'AUCUN lien n'est réglé (décision de l'utilisateur : pas de bouton qui ne mène nulle part) ; un lien fait d'espaces compte comme vide", !doitAfficherRappelAppliPC({ ...base, lien: "" }) && !doitAfficherRappelAppliPC({ ...base, lien: lienTelechargementPC({ VITE_LIEN_TELECHARGEMENT_PC: "   " }) }));
const dangereux = ["javascript:alert(1)", "http://exemple.org/setup.exe", "data:text/html,<b>x</b>", "ftp://exemple.org/f", "https://", "exemple.org/setup.exe", "//exemple.org/setup.exe"];
ok("SÉCURITÉ : seul un lien https:// complet est accepté ; `javascript:`, `http:`, `data:`, `ftp:`, un lien sans protocole ou sans domaine sont REFUSÉS (la ligne reste cachée)", dangereux.every((l) => !lienTelechargementValide(l) && !doitAfficherRappelAppliPC({ ...base, lien: l })) && lienTelechargementValide(LIEN), dangereux.filter((l) => lienTelechargementValide(l)));
ok("LECTURE DU LIEN : variable d'environnement `VITE_LIEN_TELECHARGEMENT_PC` lue telle quelle, espaces retirés ; absente ou d'un autre type : vide", lienTelechargementPC({ VITE_LIEN_TELECHARGEMENT_PC: `  ${LIEN}  ` }) === LIEN && lienTelechargementPC({}) === "" && lienTelechargementPC({ VITE_LIEN_TELECHARGEMENT_PC: 42 }) === "");
ok("TOUTES LES COMBINAISONS (16) : affiché UNIQUEMENT pour web + pas bureau + grand écran + lien valide", [true, false].flatMap((web) => [true, false].flatMap((bureau) => [true, false].flatMap((petitEcran) => [LIEN, ""].map((lien) => ({ web, bureau, petitEcran, lien }))))).every((c) => doitAfficherRappelAppliPC(c) === (c.web && !c.bureau && !c.petitEcran && c.lien === LIEN)));
ok("PETIT ÉCRAN = largeur sous 900 px OU appareil tactile sans souris (requête média)", REQUETE_PETIT_ECRAN === "(max-width: 899px), (hover: none) and (pointer: coarse)");

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);
