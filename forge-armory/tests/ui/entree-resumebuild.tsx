// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - page de test du VRAI composant `ResumeBuild` (Mon Build) avec un build où UNE arme possédée porte des perks SIMULÉS (copie produite par `appliquerSimulationPiece`, comme le fait la page principale), une autre arme possédée sans simulation, une arme NON possédée et une armure. Les clics sur « Forge » sont notés dans `window.__forge`. / EN: ⚠️ ADDED - test page of the real Mon Build component with one simulated owned weapon.
import { createRoot } from "react-dom/client";
import ResumeBuild from "../../src/components/ResumeBuild";
import { appliquerSimulationPiece } from "../../src/lib/forge/appliquerSimulation";
import { demoBuild } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeRevisionAPaliers } from "../logique/fixtures/fauxManifest";
import type { GearPiece } from "../../src/types/build";

const defs = manifestArmesDeTest();
ajouterArmeRevisionAPaliers(defs);
const { db } = creerFausseDb(defs);
const base = { stats: {}, isExotic: false, rarete: "Légendaire", icone: "https://www.bungie.net/icons/x.png" };
const reelle = { ...base, itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", slot: "energie", typeArme: "Fusil à impulsion", origine: "titan", equipe: true, perkHashes: [6901, 6912, 6921, 6931], perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }] } as unknown as GearPiece;
const simulee = appliquerSimulationPiece(reelle, { 1: { choisi: 6903, effectif: 6904 }, 3: { choisi: 6923, effectif: 6923 } });
const autre = { ...base, itemHash: 5001, itemInstanceId: "w2", nom: "Fusil d'essai", slot: "cinetique", typeArme: "Fusil à impulsion", origine: "coffre", perkHashes: [] } as unknown as GearPiece;
const nonPossedee = { ...base, itemHash: 5002, nom: "Lance-roquettes d'essai", slot: "lourde", typeArme: "Lance-roquettes", isExotic: true, perkHashes: [] } as unknown as GearPiece;
const casque = { ...base, itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", classeRequise: "titan", origine: "titan", perkHashes: [] } as unknown as GearPiece;
(window as unknown as { __forge: GearPiece[] }).__forge = [];
const build = { ...structuredClone(demoBuild), armes: [simulee, autre, nonPossedee], armure: [casque] };
createRoot(document.getElementById("racine")!).render(
  <div className="app-shell">
    <ResumeBuild build={build} membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} personnages={[{ characterId: "p1", classe: "Titan", lumiere: 2000 }]} db={db}
      onOuvrirForge={(p) => (window as unknown as { __forge: GearPiece[] }).__forge.push(p)} />
  </div>
);
(window as unknown as { __pret: boolean }).__pret = true;
