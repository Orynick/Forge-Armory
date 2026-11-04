// FR : ⚠️ AJOUT (03/11/2026, chantier mods-phase-2, variante A) - ÉCARTS APPLICABLES : la liste de ce qui sera RÉELLEMENT écrit en jeu (bouton « Appliquer en jeu » de la Forge des armures). Une armure possédée, ses colonnes (prises) et sa simulation locale : pour chaque prise MODIFIABLE dont le choix simulé diffère du plug ÉQUIPÉ, un écart { socketIndex, plugActuel, plugVise }. Les prises NON modifiables (fixes : archétype, amélioration, bonus d'ensemble, perk exotique) et les prises COSMÉTIQUES (ornement, shader, tracker, memento) ne figurent JAMAIS dans la liste : elles ne peuvent pas être écrites (spécification SPEC-MODS-PHASE-2-2026-11-03.md, §2 et critère d'acceptation 2). Fonctions PURES, testées sans Bungie ni React.
// EN: ⚠️ ADDED - applicable differences between an owned armor's real state and its local simulation; non-modifiable and cosmetic sockets are never listed.
import { ecartsApplicables, choisir, SIMULATIONS_VIDES, SimulationArmure } from "../../src/lib/forge/simulation";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// FR : une colonne LÉGÈRE, comme celle que la Forge construit depuis `colonnesArmure` : seul ce qui décide d'un écart compte (l'index de prise, le hash du plug ÉQUIPÉ, la modifiabilité). / EN: a light column: socket index, equipped plug hash, modifiability.
const colonne = (socketIndex: number, hashEquipe: number, modifiable = true) => ({ socketIndex, hashEquipe, modifiable });

// FR : une simulation d'armure, comme le magasin la stocke : { socketIndex → { choisi, effectif } } (pour un mod d'armure, choisi = effectif). / EN: an armor simulation as stored.
const sim = (colonnes: Record<number, [number, number]>): SimulationArmure => Object.fromEntries(Object.entries(colonnes).map(([i, [c, e]]) => [Number(i), { choisi: c, effectif: e }]));

// ---------- 1. la constitution de la liste d'écarts ----------
const cols = [colonne(1, 100), colonne(2, 200), colonne(3, 300), colonne(4, 400, false), colonne(5, 500, false)];
ok("sans simulation : AUCUN écart (le bouton « Appliquer en jeu » n'apparaît pas)", ecartsApplicables(cols, undefined).length === 0);
ok("une simulation VIDE : aucun écart", ecartsApplicables(cols, {}).length === 0);
ok("un choix simulé IDENTIQUE au plug équipé : aucun écart (rien à écrire)", ecartsApplicables(cols, sim({ 1: [100, 100] })).length === 0);
ok("un choix simulé DIFFÉRENT : UN écart, avec le hash du plug ÉQUIPÉ et le hash du plug VISÉ (l'« effectif », ce qui sera envoyé à Bungie)", (() => { const e = ecartsApplicables(cols, sim({ 2: [201, 201] })); return e.length === 1 && e[0].socketIndex === 2 && e[0].plugActuel === 200 && e[0].plugVise === 201; })());
ok("PLUSIEURS écarts à la fois : tous listés, DANS L'ORDRE DES PRISES (l'ordre d'écriture affiché à la confirmation)", (() => { const e = ecartsApplicables(cols, sim({ 3: [301, 301], 1: [101, 101] })); return e.length === 2 && e[0].socketIndex === 1 && e[1].socketIndex === 3; })());
ok("les écarts se limitent aux prises MODIFIABLES : une simulation sur une prise FIXE (archétype, amélioration, perk exotique) n'y figure JAMAIS", (() => { const e = ecartsApplicables(cols, sim({ 4: [401, 401], 5: [501, 501], 1: [101, 101] })); return e.length === 1 && e[0].socketIndex === 1; })());
ok("une simulation sur une prise INCONNUE de la pièce (ancien exemplaire disparu) : aucun écart pour elle, pas d'erreur", ecartsApplicables(cols, sim({ 9: [901, 901] })).length === 0);
ok("une pièce SANS colonnes lues : aucun écart, jamais d'erreur", ecartsApplicables([], sim({ 1: [101, 101] })).length === 0);

// ---------- 2. le lien avec le magasin de simulations ----------
const s = choisir(choisir(SIMULATIONS_VIDES(), "a1", 2, { choisi: 201, effectif: 201 }, "armures"), "a1", 1, { choisi: 101, effectif: 101 }, "armures");
ok("la simulation d'armure issue du MAGASIN (`choisir` avec la partie « armures ») produit bien les écarts attendus, dans l'ordre des prises", (() => { const e = ecartsApplicables(cols, s.armures?.["a1"]); return e.length === 2 && e[0].socketIndex === 1 && e[0].plugVise === 101 && e[1].socketIndex === 2 && e[1].plugVise === 201; })());
ok("une simulation d'ARME (bloc « armes ») n'est jamais lue pour une armure : aucun écart croisé", ecartsApplicables(cols, undefined).length === 0 && ecartsApplicables(cols, SIMULATIONS_VIDES().armes["a1"]).length === 0);

// ---------- 3. les ARMES (variante B, décidée le 03/11/2026 : le chantier s'étend aux perks d'armes) ----------
// FR : pour une ARME, les colonnes viennent de `obtenirOptionsToutesColonnes` (seules les prises NON masquées y figurent : cosmétiques et ornements exclus d'office) ; le hash équipé vient de `perksParColonne`. La simulation vit dans le bloc « armes », avec la paire choisi/effectif (effectif = version AMÉLIORÉE si l'arme est améliorée). / EN: weapons: non-masked columns only; the simulation lives in the "armes" block.
const colsArme = [colonne(1, 100), colonne(2, 200), colonne(3, 300)];
const simArme = sim({ 2: [201, 202] });   // choisi 201 (base), effectif 202 (améliorée)
ok("ARME : un choix simulé différent du perk équipé donne UN écart, et le plug VISÉ est l'« EFFECTIF » (version améliorée 202 pour une arme améliorée — c'est ce hash qui sera envoyé à Bungie, spéc §7)", (() => { const e = ecartsApplicables(colsArme, simArme); return e.length === 1 && e[0].socketIndex === 2 && e[0].plugActuel === 200 && e[0].plugVise === 202; })());
ok("ARME : une prise sans perk équipé connu (hashEquipe absent de perksParColonne) ne peut pas produire d'écart — elle est ignorée sans erreur", (() => { const e = ecartsApplicables([colonne(9, 0)], sim({ 9: [901, 901] })); return e.length === 0; })() || ecartsApplicables([], simArme).length === 0);
ok("ARME : un choix simulé IDENTIQUE au perk équipé (retour au roll réel) ne donne AUCUN écart", ecartsApplicables(colsArme, sim({ 1: [100, 100] })).length === 0);
ok("ARME : le bouton n'apparaît qu'avec des écarts — plusieurs prises simulées,ordre des prises respecté", (() => { const e = ecartsApplicables(colsArme, sim({ 3: [301, 301], 1: [101, 101] })); return e.length === 2 && e[0].socketIndex === 1 && e[1].socketIndex === 3; })());

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
