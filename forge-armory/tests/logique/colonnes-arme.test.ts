// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - test des COLONNES d'une arme : (1) le comportement PAR DÉFAUT de `obtenirOptionsToutesColonnes` est strictement celui d'avant (instantané pris AVANT la modification, `instantanes/colonnes-arme.json`) : la popup Détails n'a pas bougé ; (2) l'option `inclureMasquees` ajoute
// les colonnes cosmétiques en les MARQUANT, sans toucher aux autres ; (3) les règles d'ordre et d'étiquette PARTAGÉES (mods connus en bas, tri stable, « Colonne N ») équivalent exactement à l'ancien code écrit en ligne dans les deux popups. EN: ⚠️ ADDED - column logic test with a pre-change snapshot.
import fs from "node:fs";
import { obtenirOptionsToutesColonnes } from "../../src/lib/manifest/doctrine";
import { ordonnerColonnesPourAffichage, libelleColonne } from "../../src/lib/manifest/colonnesArme";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeModPrecoce } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const { db } = creerFausseDb(manifestArmesDeTest());
const avant: Record<string, unknown> = JSON.parse(fs.readFileSync("tests/logique/instantanes/colonnes-arme.json", "utf-8"));
const cas: [number, number[]][] = [[5001, [6102, 6302]], [5001, []], [5002, []], [5003, []], [5004, []], [9999, []]];
const identique = cas.every(([h, e]) => JSON.stringify(obtenirOptionsToutesColonnes(db, h, e)) === JSON.stringify(avant[`${h}:${e.join("+")}`]));
ok("NON-RÉGRESSION de la popup Détails : pour les 6 cas (arme à rolls aléatoires avec options équipées ou non, exotique, arme sans collection, arme masquée, objet inconnu), le résultat par défaut est IDENTIQUE à l'instantané d'avant la modification", identique);
const defaut = obtenirOptionsToutesColonnes(db, 5001, [6102, 6302]);
ok("par défaut : les colonnes cosmétiques (souvenir en prise 4, compte-frags en prise 6) sont ABSENTES, aucune colonne n'a de champ `masquee`", !defaut.some((c) => c.socketIndex === 4 || c.socketIndex === 6) && defaut.every((c) => !("masquee" in c)), defaut.map((c) => c.socketIndex));
const tout = obtenirOptionsToutesColonnes(db, 5001, [6102, 6302], { inclureMasquees: true });
ok("« Afficher les perks inutiles » : les deux colonnes cosmétiques réapparaissent, MARQUÉES « cosmetique » (prises 4 et 6)", tout.filter((c) => c.masquee).map((c) => `${c.socketIndex}:${c.masquee}`).join() === "4:cosmetique,6:cosmetique", tout.map((c) => [c.socketIndex, c.masquee]));
ok("…et les colonnes utiles sont EXACTEMENT les mêmes qu'avant, dans le même ordre, avec leurs options équipées : l'interrupteur n'ajoute que le bruit", JSON.stringify(tout.filter((c) => !c.masquee)) === JSON.stringify(defaut));
ok("les colonnes marquées gardent leurs options (nom et description) pour qu'on puisse juger de leur utilité", tout.find((c) => c.socketIndex === 4)!.options[0].nom === "Souvenir: Test" && tout.find((c) => c.socketIndex === 6)!.options[0].nom === "Compte-frags");
// ---------- ordre et étiquette partagés ----------
type C = { socketIndex: number; estModConnu?: boolean };
const ancienOrdre = (cols: C[]) => [...cols].sort((a, b) => (a.estModConnu ? 1 : 0) - (b.estModConnu ? 1 : 0));
const ancienLibelle = (col: C) => (col.estModConnu ? "Mods utilisables" : `Colonne ${col.socketIndex + 1}`);
const echantillons: C[][] = [
  [], [{ socketIndex: 0 }], [{ socketIndex: 3, estModConnu: true }, { socketIndex: 1 }, { socketIndex: 7 }, { socketIndex: 5, estModConnu: true }, { socketIndex: 2 }],
  [{ socketIndex: 4, estModConnu: true }, { socketIndex: 2, estModConnu: true }], [{ socketIndex: 9 }, { socketIndex: 1 }, { socketIndex: 5 }],
  defaut as C[], tout as C[],
];
ok("ORDRE partagé : sur sept échantillons (vide, une colonne, mélange, que des mods, aucun mod, et les deux vraies listes), résultat identique à l'ancien code écrit en ligne dans les popups, tri STABLE compris", echantillons.every((e) => JSON.stringify(ordonnerColonnesPourAffichage(e)) === JSON.stringify(ancienOrdre(e))));
ok("les mods connus passent EN BAS et les autres gardent l'ordre des prises (arme d'essai : colonnes 0, 1, 2, 3 puis « Mods utilisables »)", ordonnerColonnesPourAffichage(defaut).map((c) => libelleColonne(c)).join() === "Colonne 1,Colonne 2,Colonne 3,Colonne 4,Mods utilisables", ordonnerColonnesPourAffichage(defaut).map((c) => libelleColonne(c)));
ok("ÉTIQUETTE partagée : « Colonne N » (numéro de prise + 1) ou « Mods utilisables », identique à l'ancien libellé pour tous les échantillons", echantillons.flat().every((c) => libelleColonne(c) === ancienLibelle(c)));
const precoce = obtenirOptionsToutesColonnes(creerFausseDb(ajouterArmeModPrecoce(manifestArmesDeTest())).db, 5008);
ok("ARME À MOD PRÉCOCE (mods en prise 1, avant des colonnes de perks) : l'ordre brut des prises est 0, 1, 2, 3 mais l'AFFICHAGE est « Colonne 1, Colonne 3, Colonne 4, Mods utilisables » : les mods sont vraiment relégués en bas, jamais masqués", precoce.map((c) => c.socketIndex).join() === "0,1,2,3" && ordonnerColonnesPourAffichage(precoce).map(libelleColonne).join() === "Colonne 1,Colonne 3,Colonne 4,Mods utilisables", [precoce.map((c) => c.socketIndex), ordonnerColonnesPourAffichage(precoce).map(libelleColonne)]);
const original = Object.freeze([{ socketIndex: 1, estModConnu: true }, { socketIndex: 0 }]);
ok("l'ordre n'altère jamais la liste d'origine (copie)", (() => { try { ordonnerColonnesPourAffichage(original); return original[0].socketIndex === 1; } catch { return false; } })());
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
