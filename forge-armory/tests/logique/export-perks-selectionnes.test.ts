// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - test de la règle de l'utilisateur (14/10/2026) : « l'export infographique reste sur les perks RÉELS, et on affiche sur les images, textes et PDF UNIQUEMENT les perks SÉLECTIONNÉS ; même règle pour les armures ». Vérifie que NI la liste des perks DISPONIBLES mais non sélectionnés (lue pour la Forge depuis la 0.4.7), NI un perk SIMULÉ ne sort de l'appli : fiche (texte, HTML qui sert d'image et de PDF), fichier d'échange JSON, sauvegarde complète, enregistrement ; y compris pour les builds enregistrés AVANT ce correctif.
// EN: ⚠️ ADDED - test that exports only ever show the selected, REAL perks (never available-but-unselected or simulated ones), weapons and armor.
import { pieceExportable, buildExportable } from "../../src/lib/loadouts/pieceExportable";
import { construireFiche, ficheEnTexte } from "../../src/lib/loadouts/fiche";
import { ficheVersHtml } from "../../src/lib/loadouts/exportFiche";
import { construireLoadout, serialiserUnLoadout, exporterLoadouts } from "../../src/lib/loadouts/stockage";
import { appliquerSimulationPiece } from "../../src/lib/forge/appliquerSimulation";
import { demoBuild } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeRevisionAPaliers } from "./fixtures/fauxManifest";
import type { BuildDraft, GearPiece } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const defs = manifestArmesDeTest(); ajouterArmeRevisionAPaliers(defs);
const { db } = creerFausseDb(defs);
// Arme possédée : roll RÉEL = Canon X (6901), Chargeur X (6912, amélioré), Trait P (6921), Crosse (6931). Disponibles sur l'exemplaire mais NON sélectionnés : Canon Y (6903), Chargeur abandonné (6913).
const NON_SELECTIONNES = ["Canon Y", "Chargeur abandonné", "Trait Q", "Stabilité améliorée"];
const SELECTIONNES = ["Canon X", "Chargeur X", "Trait P", "Crosse de contrepoids"];
const arme = { itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", slot: "energie", stats: {}, isExotic: false, perkHashes: [6901, 6912, 6921, 6931], perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }], plugsDisponiblesParColonne: { 1: [6901, 6903], 2: [6912, 6913], 3: [6921, 6923], 4: [6931, 6933] } } as unknown as GearPiece;
const build = { ...structuredClone(demoBuild), armes: [arme], armure: [] } as BuildDraft;
const toutLeTexte = (loadout: ReturnType<typeof construireLoadout>) => { const f = construireFiche(loadout, db); return JSON.stringify(f) + "\n" + ficheEnTexte(f) + "\n" + ficheVersHtml(f, "0.4.9"); };
const aucun = (texte: string) => NON_SELECTIONNES.filter((n) => texte.includes(n));

// ---------- la fonction ----------
const nettoyee = pieceExportable(arme);
ok("la liste des perks DISPONIBLES mais non sélectionnés est retirée de la pièce ; le roll réel et le reste sont conservés", !("plugsDisponiblesParColonne" in nettoyee) && JSON.stringify(nettoyee.perkHashes) === JSON.stringify(arme.perkHashes) && nettoyee.nom === arme.nom, nettoyee);
ok("la pièce d'origine, elle, GARDE sa liste (la Forge en a besoin) : rien n'est modifié sur place", "plugsDisponiblesParColonne" in arme);
const simulee = appliquerSimulationPiece(arme, { 1: { choisi: 6903, effectif: 6904 } });
const redevenue = pieceExportable(simulee);
ok("une copie « avec simulation » qui arriverait par erreur est ramenée aux perks RÉELS (6901 et non 6904) et perd tous ses repères de simulation", JSON.stringify(redevenue.perkHashes) === JSON.stringify([6901, 6912, 6921, 6931]) && redevenue.perksSimules === undefined && redevenue.perkHashesReels === undefined && !("plugsDisponiblesParColonne" in redevenue), redevenue);
const sansRien = { ...arme, plugsDisponiblesParColonne: undefined } as unknown as GearPiece; delete (sansRien as { plugsDisponiblesParColonne?: unknown }).plugsDisponiblesParColonne;
ok("une pièce sans rien à retirer est rendue telle quelle (même objet) ; idem un build qui n'a rien à retirer", pieceExportable(sansRien) === sansRien && buildExportable({ ...build, armes: [sansRien] }).armes[0] === sansRien && (() => { const b2 = { ...build, armes: [sansRien] } as BuildDraft; return buildExportable(b2) === b2; })());
// ---------- l'enregistrement ----------
const loadout = construireLoadout("Essai", build);
ok("ENREGISTREMENT : le build enregistré ne contient plus la liste des perks non sélectionnés (ni son nom de champ), et le build vivant, lui, la garde", !JSON.stringify(loadout).includes("plugsDisponiblesParColonne") && JSON.stringify(loadout.build.armes[0].perkHashes) === JSON.stringify(arme.perkHashes) && "plugsDisponiblesParColonne" in build.armes[0]);
// ---------- la fiche : texte, image (HTML) et PDF ----------
const fiche = construireFiche(loadout, db);
ok("FICHE (texte, image, PDF) : l'arme affiche UNIQUEMENT ses quatre perks sélectionnés, dans l'ordre : Canon X, Chargeur X, Trait P, Crosse de contrepoids", JSON.stringify(fiche.armes[0].perks.map((p) => p.nom)) === JSON.stringify(SELECTIONNES), fiche.armes[0].perks.map((p) => p.nom));
const sorties = toutLeTexte(loadout);
ok("AUCUN perk non sélectionné n'apparaît nulle part : ni dans la fiche, ni dans le texte copié, ni dans le HTML qui sert d'image et de PDF (Canon Y, Chargeur abandonné, Trait Q, Stabilité améliorée)", aucun(sorties).length === 0 && SELECTIONNES.every((n) => sorties.includes(n)), aucun(sorties));
// ---------- le même export depuis une copie simulée (garde-fou) ----------
const buildSimule = { ...build, armes: [appliquerSimulationPiece(arme, { 1: { choisi: 6903, effectif: 6904 }, 3: { choisi: 6923, effectif: 6923 } })] } as BuildDraft;
// FR : le Load-out est fabriqué À LA MAIN, sans passer par `construireLoadout` (qui nettoie déjà) : c'est le garde-fou PROPRE à la fiche qui est testé. / EN: built by hand, bypassing construireLoadout, so the sheet's own safeguard is what gets tested.
const sortiesSimulees = toutLeTexte({ ...construireLoadout("Simulé par erreur", build), build: buildSimule } as ReturnType<typeof construireLoadout>);
ok("GARDE-FOU : même si un build AVEC simulation arrivait jusqu'à la fiche, elle montrerait les perks RÉELS (Canon X, Trait P) et aucun perk simulé (Canon Y, Trait Q)", aucun(sortiesSimulees).length === 0 && sortiesSimulees.includes("Canon X") && sortiesSimulees.includes("Trait P"), aucun(sortiesSimulees));
// ---------- le fichier d'échange JSON ----------
const ancien = { ...construireLoadout("Ancien", build), build: structuredClone(build) } as ReturnType<typeof construireLoadout>;   // un build enregistré AVANT ce correctif : il contient la liste
ok("PRÉALABLE : un build enregistré avant ce correctif contient bien la liste des perks non sélectionnés (le cas à nettoyer existe)", JSON.stringify(ancien).includes("plugsDisponiblesParColonne"));
const echange = serialiserUnLoadout(ancien).contenu;
ok("FICHIER D'ÉCHANGE JSON : même pour ce build ancien, il ne contient ni le champ des perks disponibles ni leurs identifiants (6903, 6913, 6923, 6933), et garde les perks sélectionnés (6901, 6912, 6921, 6931)", !echange.includes("plugsDisponiblesParColonne") && ![6903, 6913, 6923, 6933].some((h) => new RegExp(`\\b${h}\\b`).test(echange)) && [6901, 6912, 6921, 6931].every((h) => new RegExp(`\\b${h}\\b`).test(echange)), echange.slice(0, 300));
// ---------- la sauvegarde complète ----------
const stockage = new Map<string, string>([["d2-build-analyzer.loadouts.v1", JSON.stringify([{ ...ancien, id: "loadout-1" }])]]);
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (c: string) => stockage.get(c) ?? null, setItem: (c: string, v: string) => void stockage.set(c, v) };
const complete = exporterLoadouts();
ok("SAUVEGARDE COMPLÈTE (« Exporter tout ») : un build ancien enregistré dans le navigateur ressort lui aussi nettoyé, sans toucher à ce qui est stocké (nettoyage à la sortie)", complete.includes("loadout-1") && !complete.includes("plugsDisponiblesParColonne") && stockage.get("d2-build-analyzer.loadouts.v1")!.includes("plugsDisponiblesParColonne"));
// ---------- les armures ----------
const casque = { itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", stats: {}, isExotic: false, classeRequise: "titan", perkHashes: [6931] } as unknown as GearPiece;
const buildArmure = { ...structuredClone(demoBuild), armes: [], armure: [casque] } as BuildDraft;
const ficheArmure = construireFiche(construireLoadout("Armure", buildArmure), db);
ok("ARMURES (même règle) : l'armure affiche ses mods ÉQUIPÉS seulement (ici « Crosse de contrepoids », le seul de ses perkHashes), aucun autre ; une armure n'a ni liste de perks disponibles ni simulation : elle sort inchangée", JSON.stringify(ficheArmure.armure[0].perks.map((p) => p.nom)) === JSON.stringify(["Crosse de contrepoids"]) && buildExportable(buildArmure) === buildArmure && pieceExportable(casque) === casque && aucun(JSON.stringify(ficheArmure) + ficheVersHtml(ficheArmure, "0.4.9")).length === 0, ficheArmure.armure[0].perks.map((p) => p.nom));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
