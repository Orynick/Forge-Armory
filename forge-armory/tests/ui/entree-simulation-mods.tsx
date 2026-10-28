// FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures) - page de test de la SIMULATION DES MODS d'une armure avec budget d'énergie (`src/components/SimulationModsArmure.tsx`) : le VRAI composant, les VRAIES fonctions (`colonnesArmure`, `statsSimulees`, `appliquerChangements`, le stockage pur des simulations) et les données COMMUNES du casque calqué sur le casque chatoyant réel (`tests/logique/fixtures/casqueChatoyant.ts`). Variantes : `?exotique=1` (pièce exotique : son « + » se lit sur l'ajustement équipé), `?inconnu=1` (LÉGENDAIRE dont le « + » est illisible), `?sansenergie=1` (énergie non lue), `?raid=1` (un emplacement de mod de raid). `window.__sims` expose l'état des simulations. / EN: ⚠️ ADDED - test page of the armor-mod simulation with an energy budget, using the real component and shared test data.
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import SimulationModsArmure from "../../src/components/SimulationModsArmure";
import { colonnesArmure, statsSimulees } from "../../src/lib/forge/armure";
import { appliquerChangements } from "../../src/lib/forge/energieMods";
import { SIMULATIONS_VIDES, nbColonnesSimulees, reinitialiserArme, type Simulations } from "../../src/lib/forge/simulation";
import { creerCasqueChatoyant } from "../logique/fixtures/casqueChatoyant";
import type { GearPiece } from "../../src/types/build";

const params = new URLSearchParams(location.search);
const { db, base, socles, dispoTuning, c1 } = creerCasqueChatoyant();
let piece: GearPiece = c1;
if (params.has("exotique")) piece = { ...c1, itemHash: 5401, itemInstanceId: "e1", nom: "Plastron exotique d'essai", isExotic: true, perksParColonne: [{ socketIndex: 0, hash: 9001 }, { socketIndex: 1, hash: 9002 }, { socketIndex: 2, hash: 9101 }, { socketIndex: 3, hash: 9301 }], plugsDisponiblesParColonne: { 3: [9301, 9302, 9311, 9312, 9306] }, energie: { capacite: 11, utilisee: 3 } } as unknown as GearPiece;
if (params.has("inconnu")) piece = { ...c1, itemHash: 5401, itemInstanceId: "e2", nom: "Casque légendaire à ajustement équilibré d'essai", isExotic: false, perksParColonne: [{ socketIndex: 0, hash: 9001 }, { socketIndex: 1, hash: 9002 }, { socketIndex: 2, hash: 9101 }, { socketIndex: 3, hash: 9306 }], plugsDisponiblesParColonne: { 3: [9306, 9301, 9302, 9311, 9312] }, energie: { capacite: 11, utilisee: 3 } } as unknown as GearPiece;   // ⚠️ AJOUT (26/10/2026) : exotique dont l'ajustement ÉQUIPÉ est « équilibré » et dont l'API liste des « + » différents : le « + » de la pièce est ILLISIBLE
if (params.has("raid")) piece = { ...base, itemHash: 5402, itemInstanceId: "c2", nom: "Casque à emplacement de raid d'essai", slot: "casque", perksParColonne: [...socles, { socketIndex: 7, hash: 9801 }], plugsDisponiblesParColonne: { ...dispoTuning, 7: [9801, 9802] }, energie: { capacite: 11, utilisee: 11 } } as unknown as GearPiece;
if (params.has("sansenergie")) piece = { ...piece, energie: undefined } as unknown as GearPiece;
const instance = piece.itemInstanceId as string;
const w = window as unknown as { __pret: boolean; __sims: Simulations };

function Hote() {
  const [sims, setSims] = useState<Simulations>(SIMULATIONS_VIDES());
  w.__sims = sims;
  const colonnes = useMemo(() => colonnesArmure(db, piece), []);
  const choix = sims.armures?.[instance];
  const stats = statsSimulees(db, piece, choix);
  return (
    <div style={{ width: 560, padding: 16, background: "#161922", color: "#e8e6df", fontFamily: "system-ui, sans-serif" }}>
      <SimulationModsArmure db={db} piece={piece} colonnes={colonnes} choix={choix} stats={stats} nbSimulees={nbColonnesSimulees(sims, instance, "armures")} onChanger={(changements) => setSims((s) => appliquerChangements(s, instance, colonnes, changements))} onReinitialiser={() => setSims((s) => reinitialiserArme(s, instance, "armures"))} />
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<Hote />);
w.__pret = true;
