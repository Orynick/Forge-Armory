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
    classe: "arcaniste",
    element: "abyssal",
    superHash: 0,
    aspectHashes: [0, 0],
    fragmentHashes: [0, 0, 0],
  },
  artifact: {
    artifactHash: 0,
    perkHashes: [0, 0],
  },
  armes: [
    { itemHash: 0, stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, stats: {}, perkHashes: [], isExotic: false },
  ],
  armure: [
    { itemHash: 0, stats: { sante: 20, grenade: 30, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, stats: { sante: 10, grenade: 25, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, stats: { sante: 10, grenade: 20, melee: 10, super: 10, classe: 5, arme: 5 }, perkHashes: [], isExotic: false },
    { itemHash: 0, stats: { melee: 30, sante: 20, grenade: 20, super: 5, classe: 5, arme: 5 }, perkHashes: [], isExotic: true },
    { itemHash: 0, stats: { sante: 10, grenade: 10, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false },
  ],
};

// Mots-clés associés au verbe "Devour" (soin en tuant), utilisés pour la
// vérification de synergie basique du bonus de Set (voir armorSets.ts).
export const demoMotsClesBuild = ["soin", "devour"];

// Exemple : une pièce exotique fictive qui exige au moins T10 en Mêlée
// (calquée sur la logique décrite pour "Caresse du Ver").
export const demoExigences: ExigenceStat[] = [
  { stat: "melee", palierMinimum: 10, sourceExotique: "Exotique de démonstration" },
];
