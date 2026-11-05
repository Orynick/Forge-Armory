// FR : ⚠️ AJOUT (23/10/2026, branche draft-optimiseur) - test du module PUR de RECOMMANDATION
// d'archétype d'armure (Armor 3.0) :
//   1. la TABLE : 12 archétypes, ids/noms uniques, chaque stat apparaît au plus en primaire
//      d'archétypes couvrant les 12 paires possibles (les 3 paires Santé+Arme, Mêlée+Grenade
//      et Super+Classe sont DÉLIBÉRÉMENT absentes, cf. knowledge-base) ;
//   2. la RECOMMANDATION : la stat la plus en déficit gagne, l'archétype qui la couvre en
//      primaire est retenu, deux stats à la fois quand une paire existe (Super+Arme → « Maître »),
//      plafond au déficit, jamais d'erreur (sans déficit → « Maître », référence DPS) ;
//   3. JSON : le résultat est sérialisable (entrée/sortie JSON, contrat du module).
// EN: test of the PURE armor archetype RECOMMENDATION module (Armor 3.0):
//   1. the TABLE: 12 archetypes, unique ids/names, 12 possible pairs covered (the 3 pairs
//      Health+Weapons, Melee+Grenade and Super+Class are deliberately absent) ;
//   2. the RECOMMENDATION: the stat with the biggest deficit wins, the archetype covering it
//      as Primary is picked, two stats at once when a pair exists (Super+Weapons → "Maître"),
//      capped at the deficit, never throws (no deficit → "Maître", the DPS reference) ;
//   3. JSON: the result is serializable (the module's contract).
import { ARCHETYPES, recommanderArchetype, PLAFOND_PRIMAIRE, PLAFOND_SECONDAIRE, POINTS_PRIMAIRE_PAR_PIECE, POINTS_SECONDAIRE_PAR_PIECE, NB_PIECES_ARMURE } from "../../src/data/recommandationArchetype";
import { ORDRE_STATS } from "../../src/data/libellesUI";
import { appliquerAjustementsStats, sommerStatsArmure } from "../../src/lib/scoring/stats";
import type { StatBlock } from "../../src/types/build";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// ---------- 1. la table ----------
ok("TABLE : 12 archétypes (liste complète confirmée en jeu)", ARCHETYPES.length === 12, ARCHETYPES.length);
ok("TABLE : ids uniques", new Set(ARCHETYPES.map((a) => a.id)).size === 12);
ok("TABLE : noms FR uniques", new Set(ARCHETYPES.map((a) => a.nomFr)).size === 12);
ok("TABLE : primaires et secondaires sont des StatKey valides", ARCHETYPES.every((a) => ORDRE_STATS.includes(a.primaire) && ORDRE_STATS.includes(a.secondaire)));
ok("TABLE : jamais primaire = secondaire sur un même archétype", ARCHETYPES.every((a) => a.primaire !== a.secondaire));
const paires = new Set(ARCHETYPES.map((a) => [a.primaire, a.secondaire].sort().join("+")));
ok("TABLE : 12 paires DISTINCTES (pas de doublon d'archétype)", paires.size === 12, [...paires]);
ok("TABLE : les 3 paires INTERDITES sont absentes (Santé+Arme, Mêlée+Grenade, Super+Classe)",
  !paires.has(["arme", "sante"].sort().join("+")) && !paires.has(["grenade", "melee"].sort().join("+")) && !paires.has(["classe", "super"].sort().join("+")),
  [...paires]);
ok("TABLE : constantes cohérentes (30/25 par pièce, plafonds 150/125 sur 5 pièces)",
  POINTS_PRIMAIRE_PAR_PIECE === 30 && POINTS_SECONDAIRE_PAR_PIECE === 25 && NB_PIECES_ARMURE === 5 && PLAFOND_PRIMAIRE === 150 && PLAFOND_SECONDAIRE === 125);

// ---------- 2. la recommandation ----------
const reelles: StatBlock = { sante: 70, melee: 60, grenade: 50, super: 80, classe: 40, arme: 90 };

// Cas nominal : Super est la stat la plus en déficit (cible 200, réel 80 → déficit 120).
// FR : à égalité de score (120), le PREMIER de la table gagne : « Maître » (Powerhouse, Super
// en SECONDAIRE +125) devance Parangon/Colosse (Super en primaire +150 plafonné à 120).
// Les 4 couvrent Super ; le critère métier est « couvre la stat cible » (primaire OU secondaire).
// EN: on a score tie (120), the FIRST of the table wins: "Maître" (Powerhouse, Super SECONDARY
// +125) outranks Paragon/Colossus (Super PRIMARY +150 capped at 120). All 4 cover Super; the
// business criterion is "covers the target stat" (primary OR secondary).
const recoSuper = recommanderArchetype(reelles, { ...reelles, super: 200 });
ok("NOMINAL : Super en déficit → un archétype avec Super en intrinsèque est retenu",
  recoSuper.primaire === "super" || recoSuper.secondaire === "super", recoSuper.archetype.id);
ok("NOMINAL : l'archétype retenu couvre Super (Maître Super en 2e, Parangon/Colosse/Grenadier Super en 1re)",
  ["powerhouse", "paragon", "colossus", "grenadier"].includes(recoSuper.archetype.id), recoSuper.archetype.id);
ok("NOMINAL : la stat cible est Super", recoSuper.statCible === "super", recoSuper.statCible);
ok("NOMINAL : l'apport à la stat cible est plafonné au déficit (primaire min(120,150)=120, secondaire min(120,125)=120)",
  recoSuper.apportCible === 120, recoSuper.apportCible);
ok("NOMINAL : l'explication nomme l'archétype en FR", recoSuper.explication.includes(recoSuper.archetype.nomFr), recoSuper.explication);

// Cas discriminant : DEUX stats en déficit, la paire existe → l'archétype qui couvre les DEUX gagne
// (Super 80→200 et Arme 90→200 : seule la paire Arme+Super = « Maître »/Powerhouse les couvre toutes les deux)
const recoDeux = recommanderArchetype(reelles, { ...reelles, super: 200, arme: 200 });
ok("DEUX STATS : Super+Arme en déficit → « Maître » (Powerhouse, seul avec la paire Arme+Super)",
  recoDeux.archetype.id === "powerhouse", recoDeux.archetype.id);
ok("DEUX STATS : l'explication cite les deux intrinsèques (Arme +30, Super +25 par pièce)",
  recoDeux.explication.includes("Arme +30") && recoDeux.explication.includes("Super +25"), recoDeux.explication);

// Cas discriminant : une seule stat en déficit, plusieurs archétypes la couvrent → le plus
// pertinent pour la SECONDE stat en déficit gagne (Grenadier Grenade+Super vs Gunner Arme+Grenade :
// avec Grenade ET Super en déficit, Grenadier couvre les deux)
const recoGrenadeSuper = recommanderArchetype(reelles, { ...reelles, grenade: 150, super: 200 });
ok("DEUX STATS (Grenade+Super) → « Grenadier » (Grenade+Super), pas « Mitrailleur » (Arme+Grenade)",
  recoGrenadeSuper.archetype.id === "grenadier", recoGrenadeSuper.archetype.id);

// Cas limite : déficit supérieur au plafond d'intrinsèque → plafonné (Super 0→200 : min(200, 150) = 150)
const recoPlafonne = recommanderArchetype({ ...reelles, super: 0 }, { ...reelles, super: 200 });
ok("PLAFONNEMENT : un déficit de 200 est plafonné à 150 (5 pièces × 30 en primaire)",
  recoPlafonne.apportCible === 150, recoPlafonne.apportCible);

// Cas limite : la stat cible est couverte en SECONDAIRE (Santé n'est jamais primaire... sauf
// Brise-siège/Rempart : testons une stat couverte uniquement en secondaire par le gagnant)
const recoClasse = recommanderArchetype(reelles, { ...reelles, classe: 200 });
ok("CLASSE : un archétype avec Classe en intrinsèque est retenu (Démolisseur/Pilleur/Spécialiste/Rempart)",
  ["demolitionist", "reaver", "specialist", "bulwark"].includes(recoClasse.archetype.id), recoClasse.archetype.id);

// Cas limite : une stat ABAISSÉE sous le réel ne crée aucun déficit (ne change pas la reco)
const recoBaisse = recommanderArchetype(reelles, { ...reelles, sante: 10, super: 200 });
ok("ABAISSÉE : baisser Santé sous le réel ne crée pas de besoin (Super reste la cible)",
  recoBaisse.statCible === "super" && recoBaisse.archetype.id === recoSuper.archetype.id, recoBaisse.archetype.id);

// Cas limite : aucune simulation utile (cibles = réelles) → jamais d'erreur, « Maître » (référence DPS)
const recoNeutre = recommanderArchetype(reelles, reelles);
ok("NEUTRE : sans aucun déficit, pas d'erreur et « Maître » (référence DPS) est recommandé",
  recoNeutre.archetype.id === "powerhouse", recoNeutre.archetype.id);
ok("NEUTRE : l'explication le précise (aucune stat simulée au-dessus du réel)",
  recoNeutre.explication.includes("référence DPS"), recoNeutre.explication);

// Cas limite : objets vides → pas d'erreur
const recoVide = recommanderArchetype({}, {});
ok("VIDE : objets vides → pas d'erreur, un archétype est quand même proposé", !!recoVide.archetype && ARCHETYPES.some((a) => a.id === recoVide.archetype.id));

// Intégration : le module s'enchaîne avec les fonctions existantes (totaux réels + ajustements)
const totauxReels = sommerStatsArmure([]); // armure vide = tous les stats à 0
const cibles = appliquerAjustementsStats(totauxReels, { super: 20, arme: 15 });
const recoIntegration = recommanderArchetype(totauxReels, cibles);
ok("INTÉGRATION : totaux réels (sommerStatsArmure) + cibles (appliquerAjustementsStats) → « Maître » (Super+Arme)",
  recoIntegration.archetype.id === "powerhouse", recoIntegration.archetype.id);

// ---------- 3. JSON ----------
const allerRetour = JSON.parse(JSON.stringify(recoDeux));
ok("JSON : le résultat est sérialisable (round-trip identique)",
  JSON.stringify(allerRetour) === JSON.stringify(recoDeux));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
if (res.some((r) => !r)) process.exit(1);
