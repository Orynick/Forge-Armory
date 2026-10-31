// FR : ⚠️ AJOUT (23/10/2026, audit du 23.10.2026) - PREMIÈRE batterie de tests unitaires du moteur de scoring (`lib/scoring/`), écrite AVANT les corrections S1-S4 du recoupement Vibe × Opus 5.5 : ces tests ÉCHOUENT sur le code non corrigé et passent après. Bugs capturés :
//   S1 : `DashboardPage` passait `demoExigences` (Mêlée T10, « Exotique de démonstration ») à `evaluerBuild` pour TOUS les builds → le Pilier 5 était plafonné à 60 dès que Mêlée < 91, avec une ligne « ⚠️ Exotique de démonstration » affichée. Ici : sans exigence passée, aucune ligne « démonstration » et aucun plafonnement artificiel.
//   S2 : les placeholders d'armure (`itemHash: 0`) portaient des stats fictives et les jambes `isExotic: true` → un emplacement VIDE ajoutait des stats et comptait « 1 armure exotique ». Ici : `sommerStatsArmure` et le Pilier 3 ignorent les pièces `itemHash: 0`.
//   S3 : la pénalité « emplacements d'armes » testait `build.armes.length < 3` — toujours 3 avec les placeholders → pénalité morte. Ici : seules les armes `itemHash !== 0` comptent.
//   S4 : faute de frappe « Raidance » au lieu de « Radiance » dans le perk « Fièvre et Frisson » (2 artefacts) → le verbe Radiance n'était pas détecté. Ici : le texte corrigé est détecté.
// EN: ⚠️ ADDED - first unit-test battery for the scoring engine, written BEFORE fixes S1-S4; it fails on the unfixed code and passes after.
import { evaluerBuild } from "../../src/lib/scoring/pillars";
import { sommerStatsArmure, palier } from "../../src/lib/scoring/stats";
import { detecterVerbes } from "../../src/lib/scoring/verbes";
import { demoBuild } from "../../src/data/demoBuild";
import { ARTEFACTS } from "../../src/data/artefacts";
import type { BuildDraft, GearPiece, SlotArmure } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// ---------- helpers ----------
const pieceVide = (slot: SlotArmure): GearPiece => ({ itemHash: 0, slot, stats: {}, perkHashes: [], isExotic: false });
const pieceReelle = (slot: SlotArmure, stats: Partial<GearPiece["stats"]>, isExotic = false): GearPiece => ({ itemHash: 4242, slot, stats, perkHashes: [], isExotic });
const SLOTS_ARMURE: SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];
/** FR : build minimal : doctrine vide, aucun artefact, slots d'armes vides (3 placeholders `itemHash: 0`, comme `demoBuild`). / EN: minimal build, empty doctrine, no artifact, empty weapon slots. */
const buildVide = (armure: GearPiece[], armes: GearPiece[] = [{ itemHash: 0, slot: "cinetique", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 0, slot: "energie", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 0, slot: "lourde", stats: {}, perkHashes: [], isExotic: false }]): BuildDraft => ({
  ...structuredClone(demoBuild),
  armes,
  armure,
  artifact: { artifactId: undefined, perkCles: [] },
});
const pilier = (r: ReturnType<typeof evaluerBuild>, cle: string) => r.piliers.find((p) => p.pilier === cle)!;

// ---------- S2a : sommerStatsArmure ignore les emplacements vides ----------
const statsPlaceholders = sommerStatsArmure([pieceVide("casque"), pieceVide("gants"), pieceVide("torse"), pieceVide("jambes"), pieceVide("marque")]);
ok("S2a : 5 emplacements vides (itemHash: 0) ne contribuent AUCUNE stat", ["sante", "melee", "grenade", "super", "classe", "arme"].every((c) => (statsPlaceholders as Record<string, number>)[c] === 0), statsPlaceholders);
const statsMelange = sommerStatsArmure([pieceReelle("casque", { sante: 30, melee: 10 }), pieceVide("gants"), pieceReelle("jambes", { super: 20 })]);
ok("S2b : seules les pièces RÉELLES (itemHash !== 0) sont sommées ; un vide entre deux ne fausse rien", statsMelange.sante === 30 && statsMelange.melee === 10 && statsMelange.super === 20 && statsMelange.grenade === 0, statsMelange);

// ---------- S2c : un build 100 % vide n'a ni stat ni exotique ----------
const rVide = evaluerBuild(buildVide(SLOTS_ARMURE.map(pieceVide)));
ok("S2c : build vide → statsTotales à zéro (le graphique n'affiche pas 370 pts fantômes)", ["sante", "melee", "grenade", "super", "classe", "arme"].every((c) => (rVide.statsTotales as Record<string, number>)[c] === 0), rVide.statsTotales);
const lootVide = pilier(rVide, "loot_coherence");
ok("S2d : build vide → le Pilier 3 ne compte AUCUNE armure exotique (pas de « 1 armure exotique équipée » fantôme)", !lootVide.details.some((d) => /1 armure exotique/i.test(d)), lootVide.details);
ok("S2e : build vide → pénalisé pour l'absence d'exotique, pas crédité d'un exotique fictif", lootVide.details.some((d) => /Aucune armure exotique/i.test(d)), lootVide.details);

// ---------- S1 : sans exigence passée, pas de plafonnement ni de ligne « démonstration » ----------
const rSansExigence = evaluerBuild(buildVide([pieceReelle("casque", { melee: 100, sante: 100, grenade: 100, super: 100, classe: 100, arme: 100 }), pieceReelle("gants", { melee: 100, sante: 100, grenade: 100, super: 100, classe: 100, arme: 100 }), pieceReelle("torse", { melee: 100, sante: 100, grenade: 100, super: 100, classe: 100, arme: 100 }), pieceReelle("jambes", { melee: 100, sante: 100, grenade: 100, super: 100, classe: 100, arme: 100 }), pieceReelle("marque", { melee: 100, sante: 100, grenade: 100, super: 100, classe: 100, arme: 100 })]));
const statsPilier = pilier(rSansExigence, "stats_2_0");
ok("S1a : sans exigence passée, un build T10 partout n'est PAS plafonné à 60 (Mêlée T10 atteint de toute façon, le bug plafonnait à cause de la fausse exigence)", statsPilier.score > 60, statsPilier);
ok("S1b : sans exigence passée, aucune ligne « Exotique de démonstration » n'apparaît dans le détail du Pilier 5", !statsPilier.details.some((d) => /démonstration/i.test(d)), statsPilier.details);
const rAvecFausseExigence = evaluerBuild(buildVide(SLOTS_ARMURE.map(pieceVide)), [{ stat: "melee", palierMinimum: 10, sourceExotique: "Exotique de démonstration" }]);
const statsPilierFaux = pilier(rAvecFausseExigence, "stats_2_0");
ok("S1c (preuve du mécanisme) : la MÊME fausse exigence passée explicitement plafonne bien le Pilier 5 (≤ 60) et affiche la ligne — le bug venait de l'appelant, pas du moteur", statsPilierFaux.score <= 60 && statsPilierFaux.details.some((d) => /démonstration/i.test(d)), statsPilierFaux);

// ---------- S3 : la pénalité « emplacements d'armes » compte les armes RÉELLES ----------
const rSansArme = evaluerBuild(buildVide(SLOTS_ARMURE.map(pieceVide)));
const lootSansArme = pilier(rSansArme, "loot_coherence");
// FR : sans Manifest, le Pilier 3 combine : score de base (100 - 20 exotique - 15 × armes manquantes) à 60 % + composante « sets » (Manifest non chargé → neutre 50, poids 0.35) à 40 %.
const SCORE_S3 = (armesManquantes: number) => Math.round((100 - 20 - 15 * armesManquantes) * 0.6 + 50 * 0.4);
ok("S3a : 3 placeholders (itemHash: 0) → pénalité de 3 × 15 = 45 et la ligne « 0/3 emplacements d'armes remplis »", lootSansArme.details.some((d) => /0\/3 emplacements d'armes remplis/.test(d)) && lootSansArme.score === SCORE_S3(3), { score: lootSansArme.score, attendu: SCORE_S3(3), details: lootSansArme.details });
const rUneArme = evaluerBuild(buildVide(SLOTS_ARMURE.map(pieceVide), [{ itemHash: 1111, slot: "cinetique", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 0, slot: "energie", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 0, slot: "lourde", stats: {}, perkHashes: [], isExotic: false }]));
const lootUneArme = pilier(rUneArme, "loot_coherence");
ok("S3b : 1 arme réelle + 2 placeholders → pénalité de 2 × 15 = 30 et la ligne « 1/3 »", lootUneArme.details.some((d) => /1\/3 emplacements d'armes remplis/.test(d)) && lootUneArme.score === SCORE_S3(2), { score: lootUneArme.score, attendu: SCORE_S3(2), details: lootUneArme.details });
const rTroisArmes = evaluerBuild(buildVide(SLOTS_ARMURE.map(pieceVide), [{ itemHash: 1, slot: "cinetique", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 2, slot: "energie", stats: {}, perkHashes: [], isExotic: false }, { itemHash: 3, slot: "lourde", stats: {}, perkHashes: [], isExotic: false }]));
ok("S3c : 3 armes réelles → aucune pénalité, aucune ligne « emplacements d'armes »", !pilier(rTroisArmes, "loot_coherence").details.some((d) => /emplacements d'armes remplis/.test(d)), pilier(rTroisArmes, "loot_coherence").details);

// ---------- S4 : « Radiance » (et non « Raidance ») est détecté dans le perk « Fièvre et Frisson » ----------
const perkFievre = ARTEFACTS.flatMap((a) => Object.values(a.perksParTier).flat()).find((p) => p.nom === "Fièvre et Frisson");
ok("S4a : le catalogue contient bien le perk « Fièvre et Frisson » (sinon le test ne teste rien)", !!perkFievre);
if (perkFievre) {
  const texte = `${perkFievre.nom} — ${perkFievre.description}`;
  const detecte = detecterVerbes([texte]).find((v) => v.verbe.id === "radieux");
  ok("S4b : le texte du perk « Fièvre et Frisson » détecte le verbe Radiance (source ou payoff, pas « absent » — la faute « Raidance » le rendait absent)", !!detecte && detecte.confiance !== "absent" && detecte.nbMentions > 0, detecte);
}

// ---------- garde-fou : le score global d'un build vide reste cohérent (pas de NaN) ----------
ok("Garde-fou : un build entièrement vide a un score global défini entre 0 et 100", Number.isFinite(rVide.scoreGlobal) && rVide.scoreGlobal >= 0 && rVide.scoreGlobal <= 100, rVide.scoreGlobal);
ok("Garde-fou : `palier()` reste cohérent (0 → T0, 91 → T10 avec ceil, 100 → T10)", palier(0) === 0 && palier(91) === 10 && palier(100) === 10, [palier(0), palier(91), palier(100)]);

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
