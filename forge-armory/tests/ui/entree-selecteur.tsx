// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - page de test du SÉLECTEUR DE VUES : le vrai composant `SelecteurVues`, un titre de bloc (pour comparer les hauteurs) et la page Forge en construction. ⚠️ CHANGÉ (22/10/2026, TODO §25) : SIX onglets depuis l'ajout de « Carrière » et « Accomplissements » ; la page de test monte le bloc Connexion (simplifié, connecté) et les VRAIES pages du compte (`VueCarrière`, `VueAccomplissements`) pour vérifier que le sélecteur et le bloc Connexion restent affichés quand un onglet du compte est ouvert. / EN: selector test page (six tabs; real account pages mounted).
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurVues, { VueApp } from "../../src/components/SelecteurVues";
import PageForge from "../../src/components/PageForge";
import TitreCategorie from "../../src/components/TitreCategorie";
import VueCarriere from "../../src/components/VueCarriere";
import VueAccomplissements from "../../src/components/VueAccomplissements";

function App() {
  const [vue, setVue] = useState<VueApp>("analyseur");
  return (
    <div className="app-shell">
      {/* FR : bloc Connexion simplifié (connecté), même classe que dans `DashboardPage` : le test vérifie qu'il RESTE affiché quand un onglet du compte est ouvert. */}
      <div className="pilier-carte pilier-carte--connexion">
        <h3><TitreCategorie categorie="connexion" /><span>✅ connecté</span></h3>
        <div className="connexion-compte" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#b7b3a8" }}>Compte : <strong style={{ color: "#e8e6df" }}>Orygamer#4497</strong></span>
        </div>
      </div>
      <SelecteurVues vue={vue} onChanger={setVue} />
      {vue === "forge" && <PageForge db={null} />}
      {vue === "carriere" && <VueCarriere membership={null} personnages={[]} profil={null} />}
      {vue === "accomplissements" && <VueAccomplissements profil={null} db={null} />}
      {(vue === "analyseur" || vue === "loadouts" || vue === "bibliotheque") && <p style={{ color: "#7d7a70" }}>vue « {vue} » (hors périmètre de ce test)</p>}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
(window as unknown as { __pret: boolean }).__pret = true;
