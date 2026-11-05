// FR : ⚠️ AJOUT (23/10/2026, branche draft-optimiseur) - test du FLUX « build simulé → infographie » :
// un loadout marqué « simulé » (estSimulation, comme le fait l'optimiseur de build v2 via
// enregistrerLoadout(..., true)) remonte dans la FicheBuild (construireFiche) et l'infographie
// (ficheVersHtml) affiche le badge « 🔨 simulé » dans l'en-tête. Un loadout réel ne l'a PAS
// (la fiche reste strictement inchangée).
// EN: test of the "simulated build → infographic" FLOW: a loadout flagged "simulated" rises into
// the FicheBuild and the infographic shows the "🔨 simulated" badge in its header. A real
// loadout does NOT (the sheet stays strictly unchanged).
import { construireLoadout } from "../../src/lib/loadouts/stockage";
import { construireFiche } from "../../src/lib/loadouts/fiche";
import { ficheVersHtml } from "../../src/lib/loadouts/exportFiche";
import { demoBuild } from "../../src/data/demoBuild";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "\u2705" : "\u274c", nom); if (!cond && detail !== undefined) console.log("   d\u00e9tail :", JSON.stringify(detail).slice(0, 300)); };

const stockage = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (c: string) => stockage.get(c) ?? null, setItem: (c: string, v: string) => void stockage.set(c, v) };

// Un loadout forc\u00e9 « simul\u00e9 » (comme le fait l'optimiseur : enregistrerLoadout(..., true))
const loadout = construireLoadout("Set optimiseur", demoBuild, "", "", "", true);
ok("FLUX : le loadout est marqu\u00e9 simulation", loadout.estSimulation === true);

// La fiche le reprend
const fiche = construireFiche(loadout, null);
ok("FLUX : la fiche porte estSimulation = true", fiche.estSimulation === true, fiche.estSimulation);

// L'infographie affiche le badge
const html = ficheVersHtml(fiche, "0.0.0-test");
const marteau = String.fromCodePoint(0x1F528);
ok("FLUX : l'infographie contient le badge « simul\u00e9 » (\u001f528 + data-badge-simule)", html.includes(`<span class="badge-simule" data-badge-simule="">${marteau} simul\u00e9</span>`));
ok("FLUX : le badge est dans l'en-t\u00eate (avant le footer)", html.indexOf("badge-simule") < html.indexOf("<footer"));

// Un loadout R\u00c9EL n'a pas le badge
const loadoutReel = construireLoadout("R\u00e9el", demoBuild);
const ficheReelle = construireFiche(loadoutReel, null);
const htmlReel = ficheVersHtml(ficheReelle, "0.0.0-test");
ok("FLUX : un loadout r\u00e9el n'a PAS le badge dans l'infographie (fiche inchang\u00e9e)", ficheReelle.estSimulation === undefined && !/<span class="badge-simule"/.test(htmlReel));

console.log(`\n${res.filter(Boolean).length}/${res.length} contr\u00f4les r\u00e9ussis`); process.exit(res.every(Boolean) ? 0 : 1);
