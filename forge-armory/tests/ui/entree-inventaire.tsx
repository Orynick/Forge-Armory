// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - page de test du VRAI composant `SelecteurInventaire` (faux inventaire, fausse base) avec trois boutons qui jouent le rôle du « Aller à » de la recherche dans le Manifest. / EN: test page of the real inventory component.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurInventaire, { CibleInventaire } from "../../src/components/SelecteurInventaire";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";
import { installerFauxBungie } from "./faux/bungie";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeModPrecoce, ajouterArmeFaconnee, ajouterSaisons, T_OBJET } from "../logique/fixtures/fauxManifest";

// Bungie : defaultDamageType Kinetic=1, Thermal(Solaire)=3 ; itemType Armor=2, Weapon=3
// ⚠️ v0.4.3 : fausse base COMMUNE (`fixtures/fauxManifest.ts`) ; l'arme 111 reçoit les colonnes (armature, canons, chargeurs, traits, souvenir, mods connus, compte-frags) de l'arme d'essai 5001 pour vérifier la popup « Détails » (non-régression du tri des colonnes).
const defsBase = ajouterArmeFaconnee(ajouterArmeModPrecoce(manifestArmesDeTest()));   // ⚠️ v0.4.11 : + l'arme façonnée d'essai 5020 (utilisée avec `?pool`)
const objets = defsBase[T_OBJET] as Record<number, Record<string, unknown>>;
objets[111] = { ...objets[5001], itemType: 3, defaultDamageType: 3 };
objets[222] = { ...objets[5008], itemType: 3, defaultDamageType: 1 };   // « Arme B » : mods en prise 1, avant des colonnes de perks (popup Détails : ordre à vérifier)
objets[333] = { itemType: 2, defaultDamageType: 0 };
objets[444] = { itemType: 3, defaultDamageType: 1 };
if (/saisons/.test(location.search)) ajouterSaisons(defsBase, [111, 333]);   // ⚠️ v0.4.11 : filigrane et saison pour l'arme 111 (Arme A) et l'armure 333
const fausseDb = creerFausseDb(defsBase).db as never;

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
      <SelecteurInventaire membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} db={fausseDb} onAjouterObjet={() => {}} cible={cible} onEffacerCible={() => setCible(null)} onOuvrirForge={(p) => ((window as unknown as { __forge: string[] }).__forge ??= []).push(p.itemInstanceId ?? "?")} />   {/* ⚠️ v0.4.9 : espion du bouton « Forge » de la fenêtre Détails */}
      <div style={{ height: 1500 }}>contenu sous Mon Inventaire (comme Mon Build, l'artefact... dans la vraie page : permet à la page de défiler jusqu'à amener le bloc en haut)</div>
    </div>
  );
}
installerFauxBungie();   // ⚠️ v0.4.2 : fausse API Bungie à état (profil et transferts)
createRoot(document.getElementById("racine")!).render(<Hote />);
(window as unknown as { __pret: boolean }).__pret = true;
