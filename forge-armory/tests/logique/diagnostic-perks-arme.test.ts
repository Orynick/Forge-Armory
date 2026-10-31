// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - test du DIAGNOSTIC DES PERKS d'une arme (faux Manifest : structure des perks améliorés INVENTÉE, le vrai Manifest n'a pas été vu) : il décrit colonnes et options avec leurs champs bruts, inclut les colonnes normalement masquées, repère les jumeaux de noms et les perks « améliorés », ne modifie rien. EN: ⚠️ ADDED - weapon perk diagnostic test.
import { obtenirDiagnosticPerksArme } from "../../src/lib/manifest/diagnosticPerksArme";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeAmelioree } from "./fixtures/fauxManifest";
const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 700)); };
const { db } = creerFausseDb(ajouterArmeAmelioree(manifestArmesDeTest()));
const t = obtenirDiagnosticPerksArme(db, 5009);
ok("en-tête : nom, hash et type de l'arme ; nombre de colonnes", /Arme : Fusil à traits améliorés \(hash 5009\) \| type : Fusil à impulsion/.test(t) && /Colonnes : 3 \(dont 1 normalement masquées\)/.test(t), t);
ok("chaque colonne indique sa prise et l'ORIGINE de ses options (armature en singleInitial, traits dans un randomizedPlugSet, souvenir en reusablePlugItems)", /Colonne 1 \(prise 0\)[\s\S]*singleInitial 6001/.test(t) && /Colonne 2 \(prise 1\)[\s\S]*randomizedPlugSet 8003/.test(t) && /prise 2\)[\s\S]*reusablePlugItems \(1\)/.test(t), t);
ok("la colonne cosmétique (souvenir), normalement masquée, est INCLUSE et marquée « masquée : cosmetique »", /\[masquée : cosmetique\]/.test(t) && /Souvenir: Test/.test(t), t);
ok("chaque option donne son hash, son type affiché et sa catégorie de plug bruts", /Trait 1a \| hash 6301 \| type « Trait » \| plug « frames »/.test(t) && /Trait 1a \| hash 6310 \| type « Trait amélioré » \| plug « frames\.enhanced »/.test(t), t);
ok("le perk AMÉLIORÉ est repéré (OUI) et le perk de base non ; le résumé compte 1 option améliorée", /hash 6310[^\n]*amélioré \? OUI/.test(t) && /hash 6301[^\n]*amélioré \? non/.test(t) && /marquées « amélioré \/ enhanced » : 1 /.test(t), t);
ok("le résumé signale le JUMEAU de nom : « Trait 1a » présent deux fois dans la colonne 2", /jumeaux possibles\) : trait 1a ×2 \(Colonne 2\)/.test(t), t.split("\n").slice(-2).join(" / "));
ok("un hash inconnu donne un message clair, sans erreur", /introuvable dans le Manifest/.test(obtenirDiagnosticPerksArme(db, 99999)));
ok("une arme sans doublon de nom ni perk amélioré : résumé « aucun » et 0 amélioré", /marquées « amélioré \/ enhanced » : 0 \| noms présents plusieurs fois dans une même colonne \(jumeaux possibles\) : aucun/.test(obtenirDiagnosticPerksArme(db, 5001)));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
