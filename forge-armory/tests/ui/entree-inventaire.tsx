// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - page de test du VRAI composant `SelecteurInventaire` (faux inventaire, fausse base) avec trois boutons qui jouent le rôle du « Aller à » de la recherche dans le Manifest. / EN: test page of the real inventory component.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurInventaire, { CibleInventaire } from "../../src/components/SelecteurInventaire";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";

// Bungie : defaultDamageType Kinetic=1, Thermal(Solaire)=3 ; itemType Armor=2, Weapon=3
const DEFS: Record<string, unknown> = {
  [`DestinyInventoryItemDefinition:${hashVersIdSqlite(111)}`]: { itemType: 3, defaultDamageType: 3 },
  [`DestinyInventoryItemDefinition:${hashVersIdSqlite(222)}`]: { itemType: 3, defaultDamageType: 1 },
  [`DestinyInventoryItemDefinition:${hashVersIdSqlite(333)}`]: { itemType: 2, defaultDamageType: 0 },
  [`DestinyInventoryItemDefinition:${hashVersIdSqlite(444)}`]: { itemType: 3, defaultDamageType: 1 },
};
const fausseDb = { prepare: (sql: string) => { const table = /FROM (\w+)/.exec(sql)?.[1] ?? ""; let id = 0; return { bind: (a: number[]) => { id = a[0]; }, step: () => `${table}:${id}` in DEFS, getAsObject: () => ({ json: JSON.stringify(DEFS[`${table}:${id}`]) }), free: () => {} }; }, exec: () => [] } as never;

function Hote() {
  const [cible, setCible] = useState<CibleInventaire | null>(null);
  const aller = (hash: number, nom: string) => () => setCible({ hash, nom, demande: Date.now() });
  return (
    <div className="app-shell">
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 50, background: "#222", padding: 4 }}>
        <button data-test="aller-A" onClick={aller(111, "Arme A")}>Aller à A</button>
        <button data-test="aller-B" onClick={aller(222, "Arme B")}>Aller à B</button>
        <button data-test="aller-inconnu" onClick={aller(999, "Objet inconnu")}>Aller à inconnu</button>
      </div>
      <div style={{ height: 1800 }}>espace au-dessus de Mon Inventaire (oblige la page à défiler)</div>
      <SelecteurInventaire membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} db={fausseDb} onAjouterObjet={() => {}} cible={cible} onEffacerCible={() => setCible(null)} />
      <div style={{ height: 1500 }}>contenu sous Mon Inventaire (comme Mon Build, l'artefact... dans la vraie page : permet à la page de défiler jusqu'à amener le bloc en haut)</div>
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<Hote />);
(window as unknown as { __pret: boolean }).__pret = true;
