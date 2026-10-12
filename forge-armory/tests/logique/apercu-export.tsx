// FR : ⚠️ AJOUT (12/10/2026) - écrit trois pages d'export d'exemple (classes, éléments et contextes variés) dans tests/logique/_sortie/ pour les REGARDER (aperçu). Ce n'est pas un test. / EN: writes sample export pages for visual inspection.
import fs from "node:fs";
import { ficheVersHtml } from "../../src/lib/loadouts/exportFiche";
const base = { description: undefined, enregistreLe: "12/10/2026", auteur: "Orynick#1234", manifestDisponible: true, doctrine: [{ libelle: "Super", valeur: { nom: "Marteau de Sol" } }, { libelle: "Mêlée", valeur: { nom: "Frappe de Sol" } }], aspects: [{ nom: "Aspect de test" }], fragments: [{ nom: "Fragment de test" }], armes: [], armure: [], stats: [{ libelle: "Santé", valeur: 60 }], bonusSets: [], artefact: { nom: "Artefact de test", perks: [{ nom: "Perk de test" }] } };
const cas = [
  { nom: "Build Titan Solaire DPS", classe: "Titan", classeCle: "titan", element: "Solaire", elementCle: "solaire", contexte: "PvE DPS", contexteCle: "dps" },
  { nom: "Build Chasseur Prismatique Neutre", classe: "Chasseur", classeCle: "chasseur", element: "Prismatique", elementCle: "prismatique", contexte: "Neutre", contexteCle: "neutre" },
  { nom: "Build Arcaniste Filobscur PvP", classe: "Arcaniste", classeCle: "arcaniste", element: "Filobscur", elementCle: "filobscur", contexte: "PvP", contexteCle: "pvp" },
];
cas.forEach((c, i) => fs.writeFileSync(`tests/logique/_sortie/export-apercu-${i + 1}.html`, ficheVersHtml({ ...base, ...c } as never, "0.4.0")));
console.log("écrit :", cas.length, "pages");
