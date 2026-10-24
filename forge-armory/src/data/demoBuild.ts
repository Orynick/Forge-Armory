import { BuildDraft } from "../types/build";
import { ExigenceStat } from "../lib/scoring/stats";

// Build fictif "Arcaniste Abyssal - Devour" pour valider le moteur de
// scoring avant que le Manifest / l'inventaire réels ne soient branchés.
// Les hash sont des placeholders (0) : à remplacer par les vrais hash du
// Manifest une fois l'import en place.
export const demoBuild: BuildDraft = {
  id: "demo-1",
  nom: "Arcaniste Abyssal - Devour",
  subclass: {
    classe: null,
    element: null,
    subclassItemHash: 0,
    superHash: 0,
    aspectHashes: [0, 0],
    fragmentHashes: [0, 0, 0],
    meleeHash: 0,
    grenadeHash: 0,
    classeHash: 0,
    sautHash: 0,
  },
  artifact: {
    // FR : aucun artefact choisi par défaut, cohérent avec la classe et la
    // sous-classe qui repartent également vides.
    artifactId: undefined,
    perkCles: [],
  },
  armes: [
    { itemHash: 0, slot: "cinetique", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "energie", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "lourde", stats: {}, perkHashes: [], isExotic: false },
  ],
  // FR : ⚠️ CORRIGÉ (23/10/2026, audit) - les 5 emplacements d'armure sont
  // des VRAIS placeholders : `stats: {}` (aucune stat fictive), `isExotic:
  // false` (les jambes ne comptaient plus comme exotique fictive), et le
  // `setHash: 1002` inventé est supprimé. Auparavant, l'état « vide » du
  // premier lancement affichait 370 pts de stats fantômes et « 1 armure
  // exotique équipée ». Le moteur de scoring ignore de toute façon les
  // pièces `itemHash: 0` (filtre défensif dans `sommerStatsArmure` et le
  // Pilier 3) ; ce nettoyage rend les données elles-mêmes honnêtes.
  // EN: ⚠️ FIXED - the 5 armor slots are REAL placeholders: `stats: {}` (no
  // fake stats), `isExotic: false`, and the invented `setHash: 1002` removed.
  armure: [
    { itemHash: 0, slot: "casque", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "gants", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "torse", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "jambes", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "marque", stats: {}, perkHashes: [], isExotic: false },
  ],
};


// Exemple : une pièce exotique fictive qui exige au moins T10 en Mêlée
// (calquée sur la logique décrite pour "Caresse du Ver").
// FR : ⚠️ CHANGÉ (23/10/2026, audit) - `demoExigences` n'est PLUS passée à
// `evaluerBuild` par le Dashboard (bug S1 : elle plafonnait le Pilier 5 de
// TOUS les builds). Conservée uniquement pour les tests de logique, qui
// l'utilisent pour prouver le mécanisme de plafonnement.
// EN: ⚠️ CHANGED - `demoExigences` is NO LONGER passed to `evaluerBuild` by
// the Dashboard (bug S1). Kept for the logic tests only.
export const demoExigences: ExigenceStat[] = [
  { stat: "melee", palierMinimum: 10, sourceExotique: "Exotique de démonstration" },
];
