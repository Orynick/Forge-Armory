// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - test de CÂBLAGE (il lit le TEXTE du code) du lien Forge → score dans la page principale. La page principale n'a pas de page de test d'interface (elle monte la connexion Bungie, le Manifest, l'inventaire…), donc ces branchements, qui ne se voient pas dans les autres tests, sont protégés ici : un oubli ou un mauvais branchement ferait soit ignorer la simulation dans le score, soit, pire, ENREGISTRER ou PARTAGER des perks simulés.
// RÈGLE PROTÉGÉE : le SCORE et l'AFFICHAGE de Mon Build reçoivent le build AVEC la simulation (`buildEffectif`) ; l'enregistrement, le partage, l'export et les Load-outs reçoivent le build RÉEL (`monBuild`). EN: ⚠️ ADDED - wiring test (reads the code text) of the Forge → score link in the main page.
import fs from "node:fs";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };
const page = fs.readFileSync("src/pages/DashboardPage.tsx", "utf-8");
const resume = fs.readFileSync("src/components/ResumeBuild.tsx", "utf-8");
const inventaire = fs.readFileSync("src/components/SelecteurInventaire.tsx", "utf-8");
const forge = fs.readFileSync("src/components/PageForge.tsx", "utf-8");
const code = (t: string) => t.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");   // sans les lignes de commentaire
const P = code(page);
ok("LE SCORE est calculé sur le build AVEC simulation : `evaluerBuild(buildEffectif, …)`, jamais sur `monBuild`", /evaluerBuild\(\s*buildEffectif\s*,/.test(P) && !/evaluerBuild\(\s*monBuild/.test(P));
ok("le build avec simulation vient bien du magasin partagé : `appliquerSimulations(monBuild, simulations)` avec `useSimulations()`", /const simulations = useSimulations\(\)/.test(P) && /appliquerSimulations\(monBuild, simulations\)/.test(P));
ok("MON BUILD (affichage) reçoit le build avec simulation : le badge « simulé » et les avertissements d'équipement en dépendent", /<ResumeBuild[\s\S]{0,120}build=\{buildEffectif\}/.test(P));
ok("L'ENREGISTREMENT et le PARTAGE gardent le build RÉEL : le bloc de partage, l'export vers DIM et le panneau des Load-outs reçoivent `monBuild`, jamais `buildEffectif` (jamais de perks simulés enregistrés ou partagés)", /<BlocPartage build=\{monBuild\}/.test(P) && /exporterVersDim\(monBuild\)/.test(P) && (P.match(/build=\{monBuild\}/g) ?? []).length >= 2 && !/<BlocPartage build=\{buildEffectif\}/.test(P));
ok("LISTE FERMÉE des usages de `buildEffectif` : exactement 6 (sa définition, le compteur d'armes simulées, le calcul du score, ses dépendances, le diagnostic du pilier 2, l'affichage de Mon Build) ; un septième, par exemple vers l'enregistrement, ferait échouer ce test", (P.match(/buildEffectif/g) ?? []).length === 6, (P.match(/buildEffectif/g) ?? []).length);
ok("le bouton « Forge » est branché des DEUX côtés : Mon Build et Mon Inventaire/Coffre reçoivent `onOuvrirForge={ouvrirForge}`", /<ResumeBuild[\s\S]{0,200}onOuvrirForge=\{ouvrirForge\}/.test(P) && /<SelecteurInventaire[\s\S]{0,400}onOuvrirForge=\{ouvrirForge\}/.test(P));
ok("l'envoi à la Forge part du roll RÉEL : `ouvrirForge` passe par `pieceReelle(piece)` (une arme de Mon Build arrive avec ses vrais perks, pas les simulés)", /function ouvrirForge\(piece: GearPiece\) \{[\s\S]{0,160}pieceReelle\(piece\)/.test(P));
ok("la Forge reçoit l'arme à ouvrir, le retour, l'ajout au build et les exemplaires déjà dans le build", /<PageForge[^>]*cible=\{cibleForge\}[^>]*onRetour=\{retourDepuisForge\}[^>]*onAjouterAuBuild=\{ajouterObjetAuBuild\}[^>]*idsDansBuild=\{idsDansBuild\}/.test(P));
ok("le retour revient à la vue d'ORIGINE (qui est restée montée : rien n'est perdu) et efface la cible", /function retourDepuisForge\(\) \{[\s\S]{0,160}setVue\(cibleForge\?\.origine \?\? "analyseur"\);[\s\S]{0,60}setCibleForge\(null\)/.test(P));
ok("l'INDICATION du score simulé existe (« Score calculé avec des perks simulés ») et ne s'affiche que s'il y a des armes simulées", /nbSimulees > 0 &&[\s\S]{0,400}Score calculé avec des perks simulés/.test(P));
ok("dans la fenêtre Détails de Mon Build, le ✓ « équipé en jeu » est calculé sur les perks RÉELS (`perkHashesReels`), jamais sur les simulés", /obtenirOptionsToutesColonnes\(db, piece\.itemHash, piece\.perkHashesReels \?\? piece\.perkHashes\)/.test(resume));
ok("les deux fenêtres Détails n'offrent le bouton Forge qu'aux ARMES POSSÉDÉES (arme ET identifiant d'exemplaire)", /onOuvrirForge && estArme && piece\.itemInstanceId/.test(resume) && /onOuvrirForge && estArme && piece\.itemInstanceId/.test(inventaire));
ok("la page Forge passe seule sur « Inventaire » quand une arme arrive, et affiche le retour seulement s'il existe un moyen de revenir", /if \(cible\) setVue\("inventaire"\)/.test(forge) && /\{cible && onRetour && \(/.test(forge));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
