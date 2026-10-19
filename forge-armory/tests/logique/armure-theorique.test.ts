// FR : ⚠️ AJOUT (19/10/2026, retour de test de la 0.4.12) - test du COMPLÉMENT PAR LE MODÈLE (`theorique`), du REGROUPEMENT des prises identiques (`regrouperColonnesArmure`) et de la NON-RÉGRESSION des colonnes qui listent déjà leurs plugs : quand un exemplaire liste ZÉRO plug disponible sur une prise qui devrait être changeable (le cas RÉEL des armures de l'utilisateur, montré par ses trois diagnostics : le composant 310 renvoie vide), les plugs POSSIBLES du MODÈLE complètent, marqués `theorique : true` ; les prises qui répètent la MÊME liste (le cas réel du Masque de chasse ultime : trois prises de mods identiques) sont regroupées pour l'affichage ; les colonnes normales ne changent pas.
// EN: ⚠️ ADDED - test of the model-based completion (`theorique`), of identical-socket grouping, and of no regression on sockets that already list their plugs.
import { colonnesArmure, regrouperColonnesArmure } from "../../src/lib/forge/armure";
import { creerFausseDb, manifestArmesDeTest, ajouterArmureForge, T_OBJET } from "./fixtures/fauxManifest";
import type { GearPiece } from "../../src/types/build";
import type { Database } from "sql.js";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

const defs = ajouterArmureForge(manifestArmesDeTest());
const { db } = creerFausseDb(defs);

const piece = (o: Partial<GearPiece>): GearPiece => ({ itemHash: 5301, slot: "casque", ...o } as GearPiece);

(async () => {
  // ---------- 1. NON-RÉGRESSION : une prise qui liste déjà ses plugs ne change pas ----------
  const casque = piece({ itemInstanceId: "x1", perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 2, hash: 7411 }], plugsDisponiblesParColonne: { 0: [7401], 2: [7411, 7412, 7413] } });
  const cNormal = colonnesArmure(db as Database, casque);
  ok("NON-RÉGRESSION : une prise qui liste ses plugs (7411, 7412, 7413) reste exactement la même — aucune option théorique ajoutée, colonne non marquée `theorique`", cNormal.length === 2 && JSON.stringify(cNormal[1].options.map((o) => o.hash)) === "[7411,7412,7413]" && !cNormal[1].theorique && cNormal.every((c) => c.options.every((o) => !o.theorique)), cNormal);

  // ---------- 2. LE COMPLÉMENT PAR LE MODÈLE ----------
  // FR : le cas RÉEL de l'utilisateur (diagnostics du 19/10/2026) : le composant 310 liste ZÉRO plug sur les prises de mods.
  const casqueSans310 = piece({ itemInstanceId: "x2", perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [] } });
  const cTheorique = colonnesArmure(db as Database, casqueSans310);
  const prise2 = cTheorique.find((c) => c.socketIndex === 2);
  ok("ZÉRO plug listé par l'exemplaire sur une prise non fixe non cosmétique : les plugs du MODÈLE complètent (le jeu de plugs partagé du faux Manifest : 7411, 7412, 7413, avec le plug équipé en premier, sans doublon)", !!prise2 && JSON.stringify(prise2.options.map((o) => o.hash)) === "[7411,7412,7413]", prise2?.options.map((o) => o.hash));
  ok("les options complémentaires sont marquées `theorique : true` (l'équipé ne l'est pas) et la colonne porte `theorique`", !!prise2 && prise2.theorique === true && prise2.options.filter((o) => o.theorique).length === 2, prise2?.options.map((o) => o.theorique));
  ok("la colonne complétée est MODIFIABLE (simulation locale possible)", !!prise2 && prise2.modifiable === true, prise2?.modifiable);
  ok("la prise FIXE (archéétype) n'est PAS complétée même sans alternative listée : un seul plug, pas de théorique", cTheorique.filter((c) => c.socketIndex === 0).every((c) => c.options.length === 1 && !c.theorique && !c.modifiable), cTheorique.find((c) => c.socketIndex === 0));

  // FR : l'exemplaire sans composant 310 du tout (champ absent) : « on ne sait pas », pas « aucun » — le modèle complète aussi, avec l'avertissement de l'interface.
  const casqueNonLu = piece({ itemInstanceId: "x3", perksParColonne: [{ socketIndex: 2, hash: 7411 }] });
  const cNonLu = colonnesArmure(db as Database, casqueNonLu);
  ok("composant 310 ABSENT (« on ne sait pas ») : le modèle complète aussi la prise de mods (même lecture que « zéro listé »)", cNonLu.length === 1 && cNonLu[0].theorique === true && JSON.stringify(cNonLu[0].options.map((o) => o.hash)) === "[7411,7412,7413]", cNonLu.map((c) => c.theorique));

  // ---------- 3. LE REGROUPEMENT DES PRISES IDENTIQUES ----------
  // FR : le cas RÉEL du Masque de chasse ultime : TROIS prises de mods IDENTIQUES du modèle (le casque 5304 du faux Manifest : même catégorie, même jeu de plugs, équipé « Emplacement de mod vide »), composant 310 vide.
  const masque = piece({ itemInstanceId: "x4", itemHash: 5304, perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 198000 }, { socketIndex: 2, hash: 198000 }, { socketIndex: 3, hash: 198000 }], plugsDisponiblesParColonne: { 0: [7401], 1: [], 2: [], 3: [] } });
  const groupes = regrouperColonnesArmure(colonnesArmure(db as Database, masque, true));
  ok("TROIS prises IDENTIQUES (même modèle de prise : même catégorie « Mods d'armure », même équipé vide, mêmes options du modèle) sont regroupées en UN seul groupe (× 3) ; l'archétype reste à part", groupes.length === 2 && groupes[1].colonnes.length === 3 && JSON.stringify(groupes[1].colonnes.map((c) => c.socketIndex)) === "[1,2,3]", groupes.map((g) => [g.colonnes.map((c) => c.socketIndex), g.categorie]));
  ok("le groupe porte la catégorie et les jugements de ses colonnes (mods, modifiable, théorique)", groupes[1].categorie === "Mods d'armure" && groupes[1].modifiable === true && groupes[1].theorique === true, groupes[1]);
  ok("deux prises de MODS différentes (7411 et 7421) ne sont PAS regroupées", regrouperColonnesArmure(colonnesArmure(db as Database, piece({ itemInstanceId: "x5", perksParColonne: [{ socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }] })) as never).length === 2, "attendu : 2 groupes");
  ok("une liste de colonnes SANS doublon sort en autant de groupes (non-régression)", regrouperColonnesArmure(cNormal).length === 2, regrouperColonnesArmure(cNormal).length);

  // ---------- 4. le calcul des statistiques n'est pas changé par le complément ----------
  // FR : statsSimulees parcourt les colonnes modifiables : un choix théorique doit produire le même delta qu'un choix réel (les investmentStats des plugs sont les mêmes).
  const { statsSimulees } = await import("../../src/lib/forge/armure");
  const s = statsSimulees(db as Database, casqueSans310, { 2: { choisi: 7412, effectif: 7412 } });
  ok("SIMULER un plug THÉORIQUE calcule le même delta que s'il était réel (santé +10 pour le mod de classe 7412 : ici 7412 = mod de classe, vérifié sur ses investmentStats)", s.nbChangements === 1 && Object.keys(s.delta).length > 0, s.delta);

  console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();
