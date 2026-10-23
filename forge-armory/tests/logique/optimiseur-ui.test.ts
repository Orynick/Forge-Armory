// FR : ⚠️ AJOUT (23/10/2026, branche draft-optimiseur) - test du CÂBLAGE de la page OPTIMISEUR
// de build v2 (qui lit le TEXTE du code, comme cablage-forge.test.ts) :
//   1. la SÉPARATION (contrat) : la page optimiseur ne touche JAMAIS au build courant
//      (`setMonBuild` absent), ne lit pas le score (`evaluerBuild` absent), et sa seule écriture
//      est `enregistrerLoadout` marquée `estSimulation = true` ;
//   2. le FORMULAIRE : minimums 0-100 par stat, liste des priorités, choix de l'exotique
//      (tous/aucun/fixe), option « supposer masterwork » + RAPPEL visible ;
//   3. le PÉRIMÈTRE : inventaire du COMPTE ENTIER (`listerObjetsPossedes`), filtre strict sur la
//      classe du build courant (pas d'armure « toute classe ») ;
//   4. les RÉSULTATS : affichage en PALIERS (T), triés par priorité (`rang`), indicateur de
//      progression au-delà de 500 ms (`dureeMs`) ;
//   5. l'INFOGRAPHIE : le badge « 🔨 simulé » d'un loadout marqué simulation apparaît dans
//      l'en-tête de l'export (`ficheVersHtml` sur `FicheBuild.estSimulation`) ;
//   6. le CÂBLAGE : « Mon Build » ouvre la page (bouton « Optimiser »), la page est une VUE
//      (`VueApp` = « optimiseur ») mais PAS un onglet du sélecteur (pas de doublon).
// EN: test of the WIRING of the build optimizer v2 PAGE (reads the code TEXT, like
// cablage-forge.test.ts): strict separation (never touches the current build or the score, only
// write is a simulation-marked save), form (per-stat minimums, priorities, exotic choice,
// masterwork assumption + visible reminder), whole-account scope with a strict class filter,
// results in TIERS sorted by priority with a >500 ms progress indicator, the "🔨 simulated" badge
// in the export infographic, and the wiring (button in "Mon Build", a view but not a selector tab).
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };
const page = fs.readFileSync("src/pages/DashboardPage.tsx", "utf-8");
const resume = fs.readFileSync("src/components/ResumeBuild.tsx", "utf-8");
const optimiseur = fs.readFileSync("src/components/PageOptimiseur.tsx", "utf-8");
const selecteur = fs.readFileSync("src/components/SelecteurVues.tsx", "utf-8");
const fiche = fs.readFileSync("src/lib/loadouts/fiche.ts", "utf-8");
const exportFiche = fs.readFileSync("src/lib/loadouts/exportFiche.ts", "utf-8");
const code = (t: string) => t.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");   // sans les lignes de commentaire
const O = code(optimiseur);
const P = code(page);

// ---------- 1. la SÉPARATION (contrat non négociable) ----------
ok("SÉPARATION : la page optimiseur n'appelle JAMAIS `setMonBuild` (le build courant n'est pas modifié)", !/setMonBuild/.test(O));
ok("SÉPARATION : la page optimiseur ne lit PAS le score (`evaluerBuild` absent)", !/evaluerBuild|scoreGlobal/.test(O));
ok("SÉPARATION : la page optimiseur n'importe PAS le module de scoring", !/lib\/scoring/.test(O));
ok("SÉPARATION : la seule écriture de la page est `enregistrerLoadout` (flux de sauvegarde existant)", /enregistrerLoadout\(/.test(O) && !/setMonBuild|window\.fetch|fetch\(|POST|method:/.test(O));
ok("SÉPARATION : l'enregistrement est FORCÉ « simulé » (`estSimulation = true` en dernier argument)", /enregistrerLoadout\([\s\S]{0,200},\s*true\)/.test(O));
ok("SÉPARATION : la page reçoit le build RÉEL (`monBuild`), jamais `buildEffectif` (pas de perks simulés enregistrés via l'optimiseur)", /<PageOptimiseur[\s\S]{0,300}build=\{monBuild\}/.test(P) && !/<PageOptimiseur[\s\S]{0,300}build=\{buildEffectif\}/.test(P));

// ---------- 2. le FORMULAIRE ----------
ok("FORM : minimum 0-100 par stat (champ number, min 0 max 100, pas 5)", /data-minimum-stat=\{cle\}/.test(O) && /min=\{0\}[\s\S]{0,80}max=\{100\}/.test(O));
ok("FORM : les 6 stats ont un champ de minimum (ORDRE_STATS, data-minimum-stat par stat)", /ORDRE_STATS\.map\(\(cle\) =>/.test(O) && (O.match(/data-minimum-stat=\{cle\}/g) ?? []).length === 1);
ok("FORM : liste des priorités modifiable (ajout/retrait/inversion)", /data-liste-priorites/.test(O) && /data-priorite=\{cle\}/.test(O) && /Inverser/.test(O));
ok("FORM : choix de l'exotique — tous / aucun / un précis", /data-mode-exotique/.test(O) && /data-exotique-fixe/.test(O) && /value="tous"/.test(O) && /value="aucun"/.test(O) && /value="fixe"/.test(O));
ok("FORM : option « supposer masterwork » — aucune / légendaires / tout", /data-mode-masterwork/.test(O) && /value="aucun"/.test(O) && /value="legendaire"/.test(O) && /value="tout"/.test(O));
ok("FORM : RAPPEL visible quand une hypothèse masterwork est active (les items doivent RÉELLEMENT être masterworked)", /data-rappel-masterwork/.test(O) && /masterwork !== "aucun"/.test(O) && /R\u00c9ELLEMENT/.test(optimiseur));

// ---------- 3. le PÉRIMÈTRE ----------
ok("PÉRIMÈTRE : l'inventaire vient du COMPTE ENTIER (`listerObjetsPossedes` : coffre + tous les personnages)", /listerObjetsPossedes\(membership, db\)/.test(O));
ok("PÉRIMÈTRE : les pièces passent par `pieceVersEntree` (GearPiece → EntreePiece, masterwork/intrinsèques lus)", /pieces\.map\(pieceVersEntree\)/.test(O));
ok("PÉRIMÈTRE : filtre STRICT sur la classe du build courant (la page transmet `classe`, le module filtre `classeRequise === classe`)", /classe,/.test(O) && /build\.subclass\.classe/.test(O));
ok("PÉRIMÈTRE : sans classe choisie, pas de calcul (pas d'armure « toute classe »)", /!classePrete/.test(O) && /pas d'armure/.test(optimiseur));

// ---------- 4. les RÉSULTATS ----------
ok("RÉSULTATS : affichage en PALIERS (T), pas en valeurs brutes (T${set.paliers[i]})", /T\$\{set\.paliers\[i\]\}/.test(O) && !/statsBrutes/.test(O));
ok("RÉSULTATS : diagnostic « sans masterwork » aussi en paliers (paliersSansMasterwork)", /T\$\{set\.paliersSansMasterwork\[i\]\}/.test(O));
ok("RÉSULTATS : un groupe par exotique (`data-groupe-exotique`), le meilleur ensemble par groupe (`rang`)", /data-groupe-exotique=\{g\.exotiqueId/.test(O) && /data-set-rang=\{set\.rang\}/.test(O));
ok("RÉSULTATS : indicateur de progression au-delà de 500 ms (minuteur + `dureeMs` affiché)", /setTimeout\([\s\S]{0,60}, 500\)/.test(O) && /data-progression/.test(O) && /dureeMs\} ms/.test(O));
ok("RÉSULTATS : diagnostic du calcul (combinaisons, élagages, durée)", /nbCombinaisons/.test(O) && /nbElages/.test(O));

// ---------- 5. l'INFOGRAPHIE (badge « simulé ») ----------
ok("INFOGRAPHIE : `FicheBuild` porte `estSimulation` (rempli par `construireFiche` depuis le loadout)", /estSimulation\?: boolean/.test(fiche) && /estSimulation: loadout\.estSimulation === true/.test(fiche));
ok("INFOGRAPHIE : `ficheVersHtml` affiche le badge « 🔨 simulé » dans l'en-tête quand `estSimulation`", /f\.estSimulation/.test(exportFiche) && /badge-simule/.test(exportFiche) && /data-badge-simule/.test(exportFiche));
ok("INFOGRAPHIE : le badge a les MÊMES couleurs que celui de l'appli (#e8c547)", /\.badge-simule\{[^}]*color:#e8c547[^}]*border:1px solid #e8c547/.test(exportFiche));

// ---------- 6. le CÂBLAGE ----------
ok("CÂBLAGE : « Mon Build » ouvre l'optimiseur (bouton « ⚙️ Optimiser », prop `onOuvrirOptimiseur`)", /data-bouton-optimiseur/.test(resume) && /onOuvrirOptimiseur\?: \(\) => void/.test(resume) && /<ResumeBuild[\s\S]{0,600}onOuvrirOptimiseur=\{\(\) => setVue\("optimiseur"\)\}/.test(P));
ok("CÂBLAGE : la page est une VUE (`VueApp` contient « optimiseur »)", /export type VueApp = [^;]*"optimiseur"/.test(selecteur));
ok("CÂBLAGE : la page N'EST PAS un onglet du sélecteur (pas dans `VUES`, pas de doublon)", !/valeur: "optimiseur"/.test(selecteur) && (selecteur.match(/\{ valeur: "/g) ?? []).length === 4);
ok("CÂBLAGE : la page a un bouton « Retour » vers la vue d'origine", /onRetour/.test(O) && /<button[\s\S]{0,120}onClick=\{onRetour\}/.test(O));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
