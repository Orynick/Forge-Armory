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
  armure: [
    { itemHash: 0, slot: "casque", stats: { sante: 20, grenade: 30, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, slot: "gants", stats: { sante: 10, grenade: 25, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, slot: "torse", stats: { sante: 10, grenade: 20, melee: 10, super: 10, classe: 5, arme: 5 }, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "jambes", stats: { melee: 30, sante: 20, grenade: 20, super: 5, classe: 5, arme: 5 }, perkHashes: [], isExotic: true },
    { itemHash: 0, slot: "marque", stats: { sante: 10, grenade: 10, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false },
  ],
};


// Exemple : une pièce exotique fictive qui exige au moins T10 en Mêlée
// (calquée sur la logique décrite pour "Caresse du Ver").
export const demoExigences: ExigenceStat[] = [
  { stat: "melee", palierMinimum: 10, sourceExotique: "Exotique de démonstration" },
];
