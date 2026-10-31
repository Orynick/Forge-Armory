// FR : ⚠️ AJOUT (29/10/2026) - page de test de l'ÉCRAN DE L'OPTIMISEUR (`OptimiseurArmures`) : le Manifest d'essai du casque chatoyant, dix armures de Titan (cinq emplacements × deux variantes, les « A » portées), un torse et un objet de classe EXOTIQUES très avantageux, une pièce aux statistiques incomplètes, un casque de Chasseur ; `onAjouterAuBuild` range les pièces ajoutées dans `window.__ajoutes`. / EN: ⚠️ ADDED - test page of the optimizer screen.
import { createRoot } from "react-dom/client";
import OptimiseurArmures from "../../src/components/OptimiseurArmures";
import { creerCasqueChatoyant } from "../logique/fixtures/casqueChatoyant";
import type { GearPiece } from "../../src/types/build";

const { db, c1 } = creerCasqueChatoyant();
const SLOTS = ["casque", "gants", "torse", "jambes", "marque"];
const piece = (id: string, slot: string, stats: Record<string, number> | null, extra: Record<string, unknown> = {}) => ({ ...c1, itemInstanceId: id, nom: `Pièce ${id}`, slot, classeRequise: "titan", origine: "coffre", stats: stats ?? { sante: 0, melee: 5 }, ...extra }) as unknown as GearPiece;
const pieces: GearPiece[] = [];
SLOTS.forEach((slot, i) => {
  pieces.push(piece(`${slot}A`, slot, { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 }, { equipe: true, origine: "titan" }));
  pieces.push(piece(`${slot}B`, slot, { sante: 10 + i, melee: 0, grenade: 20, super: 10, classe: 5, arme: 35 }));
});
const params = new URLSearchParams(location.search);
if (params.has("exotiques")) {
  // un torse exotique (+70 Armes) et un objet de classe exotique (+85 Armes : le PLUS avantageux des deux, pour que la doctrine prismatique change vraiment le résultat)
  pieces.push(piece("torseX", "torse", { sante: 0, melee: 5, grenade: 5, super: 25, classe: 5, arme: 95 }, { isExotic: true, nom: "Torse exotique d'essai" }));
  pieces.push(piece("marqueX", "marque", { sante: 0, melee: 5, grenade: 5, super: 25, classe: 5, arme: 110 }, { isExotic: true, nom: "Objet de classe exotique d'essai" }));
}
if (params.has("ecartee")) pieces.push(piece("casqueI", "casque", null, { nom: "Casque aux statistiques incomplètes" }));
if (params.has("chasseur")) pieces.push(piece("casqueH", "casque", { sante: 0, melee: 5, grenade: 5, super: 25, classe: 40, arme: 25 }, { classeRequise: "chasseur", nom: "Casque de Chasseur" }));
(window as unknown as { __ajoutes: GearPiece[] }).__ajoutes = [];
createRoot(document.getElementById("racine")!).render(
  <div style={{ width: 1100, padding: 16, background: "#0d0f14", color: "#e8e6df", fontFamily: "system-ui, sans-serif" }}>
    <OptimiseurArmures db={db} pieces={pieces} prismatiqueDuBuild={params.has("prismatiqueBuild")} classeDuBuild="titan" onAjouterAuBuild={(p) => (window as unknown as { __ajoutes: GearPiece[] }).__ajoutes.push(p)} />
  </div>
);
(window as unknown as { __pret: boolean }).__pret = true;
